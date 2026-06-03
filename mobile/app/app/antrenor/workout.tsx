// ══ WORKOUT (RN port, route '/app/antrenor/workout') — the live gym FSM ════
// RN twin of src/react/routes/screens/antrenor/Workout.tsx. The live workout
// state machine: 5 sub-zones conditional on workoutStore.phase (logging /
// rating / rest / transition / idle). ALL hooks, effects, timer logic,
// store-calls (workoutStore + actions), engine calls (DP / getTodayWorkout /
// getPRDelta / checkInSessionAdjust / detectAggressiveLoad / resolve*Swap),
// i18n keys, and testIDs are kept 1:1 with the web. Only markup + navigation
// are rewritten (View/Text/Pressable + expo-router).
//
// GYM-ONLY gate (web router.tsx L144 GymOnlyRoute): a pure-aerobic user must
// never reach the gym session. trainingType==='aerobic' → Redirect to the hub.
//
// IN-APP rest timer (SVGCountdownRing + RestOverlay + SessionTimer) ports
// faithfully via react-native-svg + JS intervals. The OS-level BACKGROUND
// rest-timer (expo-notifications firing over a backgrounded app — Daniel's
// flagship) is W-Final, marked at the in-app setRestCountdown sites below.
//
// W-Final native stubs (clearly marked inline):
//   - expo-keep-awake: the web wakeLock effect is REMOVED here (no DOM
//     navigator.wakeLock on RN); the keep-awake hook lands at W-Final.
//   - expo-haptics: haptic() in the ported components is the web-guarded no-op
//     shim (mobile/lib/motion.ts).
//   - expo-notifications: the OS background rest notification (marked at every
//     setRestCountdown site).

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, router } from 'expo-router';
import { HelpCircle, Play, ChevronDown } from 'lucide-react-native';

import { AparatLipsaSheet } from '../../../components/Workout/AparatLipsaSheet';
import { useWorkoutStore, getCurrentMode } from '../../../../src/react/stores/workoutStore';
import type { ExerciseHistoryEntry } from '../../../../src/react/stores/workoutStore';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { coachPick } from '../../../../src/react/lib/coachVoice';
import { getTodayWorkout, getPRDelta, getWhyExerciseSummary, resolveSessionTitle } from '../../../../src/react/lib/engineWrappers';
import type { PlannedExercise, PlannedWorkoutOutput } from '../../../../src/react/lib/engineWrappers';
import { gotoPath } from '../../../lib/nav';
import { SessionTimer } from '../../../components/Workout/SessionTimer';
import { RestOverlay } from '../../../components/Workout/RestOverlay';
import { SetLogInput } from '../../../components/Workout/SetLogInput';
import { SetRatingButtons } from '../../../components/Workout/SetRatingButtons';
import { ExitConfirmSheet } from '../../../components/Workout/ExitConfirmSheet';
import { AaFrictionModal } from '../../../components/AaFrictionModal';
import { detectAggressiveLoad, deriveThresholds } from '../../../../src/react/lib/aaFrictionDetect';
import type { AggressiveReason } from '../../../../src/react/lib/aaFrictionDetect';
import { getEngineSignals } from '../../../../src/react/lib/engineSignalsAggregate';
import { InactivityPrompt } from '../../../components/Workout/InactivityPrompt';
import { PrFlash } from '../../../components/Workout/PrFlash';
import { TransitionScreen } from '../../../components/Workout/TransitionScreen';
import { WhyExerciseModal } from '../../../components/Workout/WhyExerciseModal';
import { SetHistoryChips } from '../../../components/Workout/SetHistoryChips';
import { ExerciseActionsRow } from '../../../components/Workout/ExerciseActionsRow';
import { CoachNote } from '../../../components/Workout/CoachNote';
import { PressScale } from '../../../components/Press';
import { ExerciseMedia } from '../../../components/ExerciseMedia';
import { getExerciseCueKey } from '../../../../src/react/lib/exerciseCues';
import { Kicker } from '../../../components/pulse/Kicker';
import { useCountUp } from '../../../lib/useCountUp';
import { DP } from '../../../../src/engine/dp.js';
import { getCurrentWeightKg } from '../../../../src/react/lib/userTdee';
import { roundToEquipmentWeight } from '../../../../src/config/weights.js';
import { resolveBusySwap, resolveMissingSwap, resolveRefusalSwap } from '../../../../src/react/lib/substitution';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../../src/react/lib/scheduleAdapterAggregate';
import { toast } from '../../../../src/react/lib/toast';
import { incrementRefusal } from '../../../../src/engine/schedule/scheduleAdapter.js';
import { clearTodayReadiness } from '../../../../src/engine/readiness.js';
import { accent, dark, surface, withAlpha } from '../../../lib/tokens';
import { scheduleRestEndNotification, cancelRestEndNotification } from '../../../lib/restNotification';
import { t } from '../../../../src/i18n/index.js';

const INACTIVITY_THRESHOLD_MIN = 7;
const INACTIVITY_CHECK_INTERVAL_MS = 30_000;

type SetRating = ExerciseHistoryEntry['rating'];

// In-session coarse rating → RPE for DP.checkInSessionAdjust (responsive per-set
// autoregulation). DISTINCT from workoutStore.RATING_TO_RPE — verbatim from web.
const INSESSION_RATING_TO_RPE: Readonly<Record<SetRating, number>> = {
  usor: 6.5,
  potrivit: 7.5,
  greu: 10,
};

function WorkoutScreen(): React.JSX.Element {
  // §44-C1 — primitive subscriptions feed getCurrentMode tagged FSM view.
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const phase = useWorkoutStore((s) => s.phase);
  const history = useWorkoutStore((s) => s.history);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const startSession = useWorkoutStore((s) => s.startSession);
  const logSet = useWorkoutStore((s) => s.logSet);
  const setPhase = useWorkoutStore((s) => s.setPhase);
  const advanceExercise = useWorkoutStore((s) => s.advanceExercise);
  const pauseSession = useWorkoutStore((s) => s.pauseSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);
  const markPRHit = useWorkoutStore((s) => s.markPRHit);
  const swapExercise = useWorkoutStore((s) => s.swapExercise);
  const refusalTriedByEx = useWorkoutStore((s) => s.refusalTriedByEx);
  const markRefusalTried = useWorkoutStore((s) => s.markRefusalTried);
  const sessionContext = useWorkoutStore((s) => s.sessionContext);

  const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState<string>('');
  const [engineIntensityMod, setEngineIntensityMod] = useState<PlannedWorkoutOutput['intensityMod']>('normal');
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((planned) => {
      if (!cancelled) {
        setExercises(planned?.exercises ?? []);
        const rawTitle = planned?.workoutTitle;
        setWorkoutTitle(
          rawTitle && rawTitle !== ENGINE_WORKOUT_TITLE_FALLBACK
            ? rawTitle
            : resolveSessionTitle(planned?.sessionType),
        );
        setEngineIntensityMod(planned?.intensityMod ?? 'normal');
      }
    });
    return () => { cancelled = true; };
  }, []);

  const hasWorkout = exercises !== null && exercises.length > 0;

  const safeExIdx = hasWorkout && exercises !== null ? Math.min(exIdx, exercises.length - 1) : 0;
  const defaultExercise: PlannedExercise = { id: '', name: '', sets: 0, targetReps: 0, targetKg: 0, restSec: 0 };
  const currentExercise: PlannedExercise = (hasWorkout && exercises !== null
    ? exercises[safeExIdx]
    : undefined) ?? defaultExercise;
  const noExerciseHistory =
    hasWorkout &&
    !currentExercise.isBodyweight &&
    currentExercise.name !== '' &&
    DP.getState(currentExercise.name).lastW === 0;
  const intensityMod =
    sessionContext?.painContext !== null && sessionContext?.painContext !== undefined
      ? 'minus'
      : engineIntensityMod;
  const targetKg =
    currentExercise.isBodyweight
      ? currentExercise.targetKg
      : intensityMod === 'minus'
      ? roundToEquipmentWeight(currentExercise.targetKg * 0.8, currentExercise.engineName ?? currentExercise.name)
      : intensityMod === 'plus'
      ? roundToEquipmentWeight(currentExercise.targetKg * 1.15, currentExercise.engineName ?? currentExercise.name)
      : currentExercise.targetKg;
  const currentSetIdx = hasWorkout ? history[safeExIdx]?.length ?? 0 : 0;
  const isLastSetOfExercise =
    hasWorkout && currentSetIdx + 1 >= currentExercise.sets;
  const isLastExercise = hasWorkout && exercises !== null && safeExIdx + 1 >= exercises.length;

  const [kgInput, setKgInput] = useState<number>(targetKg);
  const [repsInput, setRepsInput] = useState<number>(currentExercise.targetReps);
  const [recKg, setRecKg] = useState<number>(targetKg);
  const [recReps, setRecReps] = useState<number>(currentExercise.targetReps);
  const [inputDirty, setInputDirty] = useState(false);
  const [restCountdown, setRestCountdown] = useState(0);
  const pendingAdvanceRef = useRef(false);
  // LO-04 — hold the next-exercise reveal timeout id so unmount (exit / nav) can
  // cancel it; otherwise advanceExercise() fires on an unmounted screen.
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [restInitialSec, setRestInitialSec] = useState(0);
  const [exitSheetOpen, setExitSheetOpen] = useState(false);
  const [aaModalOpen, setAaModalOpen] = useState(false);
  const [aaReason, setAaReason] = useState<AggressiveReason | null>(null);
  const [aaPendingRating, setAaPendingRating] = useState<SetRating | null>(null);
  const [lastActivityAt, setLastActivityAt] = useState<number>(Date.now());
  const [inactivityPromptOpen, setInactivityPromptOpen] = useState(false);
  const [setLogged, setSetLogged] = useState(false);
  const [editing, setEditing] = useState(false);
  const [whyText, setWhyText] = useState<string | null>(null);
  const [aparatLipsaSheetOpen, setAparatLipsaSheetOpen] = useState(false);
  const [adjustNotice, setAdjustNotice] = useState<string | null>(null);
  const [prFlash, setPrFlash] = useState<{ exercise: string; deltaKg: number } | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  // Collapse the demo accordion when the exercise changes (audit MED-01).
  useEffect(() => {
    setDemoOpen(false);
  }, [safeExIdx]);

  // Init session on mount when idle (no paused snapshot resumed via Antrenor).
  useEffect(() => {
    const mountMode = getCurrentMode({
      phase,
      sessionStart,
      pausedSnapshot,
      lastSession,
      exIdx,
    });
    if (mountMode.kind === 'idle') startSession(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bug 1 — run the next-exercise reveal then advance.
  const runTransitionToNext = useCallback((): void => {
    pendingAdvanceRef.current = false;
    setPhase('transition');
    transitionTimeoutRef.current = setTimeout(() => {
      transitionTimeoutRef.current = null;
      advanceExercise();
    }, 1500);
  }, [setPhase, advanceExercise]);

  // Rest countdown — reaches 0 → advance (inter-exercise) or back to logging.
  useEffect(() => {
    if (phase !== 'rest') return;
    const interval = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (pendingAdvanceRef.current) {
            runTransitionToNext();
          } else {
            setPhase('logging');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, setPhase, runTransitionToNext]);

  // Keep the screen awake for the whole live session (RN twin of the web
  // wakeLock effect, which couldn't port — RN has no DOM navigator.wakeLock).
  // This hook activates on mount and releases on unmount (exit / pause / done),
  // so a lifter mid-rest never has the screen sleep on them. Web/jest = no-op.
  useKeepAwake();

  // Defensive cleanup — if the screen unmounts while a rest is pending (exit,
  // navigation), cancel the scheduled background notification so a stale buzz
  // never fires after the session is gone.
  useEffect(() => {
    return () => {
      void cancelRestEndNotification();
      // LO-04 — cancel a pending next-exercise reveal so advanceExercise() never
      // fires after the screen has unmounted.
      if (transitionTimeoutRef.current !== null) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset kg/reps inputs when advancing exercise (+ clear adjust notice).
  useEffect(() => {
    setKgInput(targetKg);
    setRepsInput(currentExercise.targetReps);
    setRecKg(targetKg);
    setRecReps(currentExercise.targetReps);
    setAdjustNotice(null);
  }, [safeExIdx, targetKg, currentExercise.targetReps]);

  // Each new set begins at pre-log `tinta`.
  useEffect(() => {
    setSetLogged(false);
    setEditing(false);
    setInputDirty(false);
  }, [safeExIdx, currentSetIdx]);

  // Inactivity watch — 30s interval checks idle minutes vs lastActivityAt.
  useEffect(() => {
    const interval = setInterval(() => {
      const idleMin = (Date.now() - lastActivityAt) / 60_000;
      if (idleMin > INACTIVITY_THRESHOLD_MIN) {
        setInactivityPromptOpen(true);
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [lastActivityAt]);

  const bumpActivity = useCallback((): void => {
    setLastActivityAt(Date.now());
    setInactivityPromptOpen(false);
  }, []);

  // Live session volume = Σ kg×reps across logged sets (count-up header stat).
  const liveVolumeKg = Object.values(history).reduce(
    (acc, sets) => acc + sets.reduce((s, set) => s + set.kg * set.reps, 0),
    0,
  );
  const liveVolumeDisplay = useCountUp(Math.round(liveVolumeKg));

  function performLogSet(rating: SetRating): void {
    const effKg = currentExercise.isBodyweight
      ? Math.max(
          0,
          Math.round(
            ((Number(getCurrentWeightKg()) > 0
              ? Number(getCurrentWeightKg()) * (currentExercise.bwFraction ?? 0)
              : 0) +
              (Number.isFinite(kgInput) ? kgInput : 0)) * 2,
          ) / 2,
        )
      : kgInput;
    logSet(safeExIdx, {
      kg: effKg,
      reps: repsInput,
      rating,
      ...(currentExercise.isBodyweight ? { addedKg: kgInput } : {}),
    });

    const exerciseName = currentExercise.name;
    const exerciseHistory =
      history[safeExIdx]?.map((h) => ({
        ex: exerciseName,
        w: h.kg,
        reps: h.reps,
      })) ?? [];
    const delta = getPRDelta(
      exerciseName,
      { w: effKg, reps: repsInput },
      exerciseHistory
    );
    if (delta) {
      markPRHit({
        exercise: exerciseName,
        deltaKg: delta.deltaKg,
        type: delta.type,
        deltaPct: delta.deltaPct,
        oneRMEstimate: delta.oneRMEstimate,
      });
      if (delta.deltaKg > 0) {
        setPrFlash({ exercise: exerciseName, deltaKg: delta.deltaKg });
      }
    }

    if (!isLastSetOfExercise && !currentExercise.isBodyweight) {
      const ratedSets = [...(history[safeExIdx] ?? []), { kg: kgInput, reps: repsInput, rating }];
      const recentRPEs = ratedSets.map((s) => INSESSION_RATING_TO_RPE[s.rating]);
      const recentReps = ratedSets.map((s) => s.reps);
      const adjust = DP.checkInSessionAdjust(exerciseName, recentRPEs, recentReps, {
        recKg,
        recReps,
        loggedKg: effKg,
        setIdx: currentSetIdx + 1,
      }) as {
        adjust: boolean;
        dir?: 'down' | 'up';
        newKg?: number;
        newReps?: number;
        holdKg?: number;
        msg?: string;
      };
      if (adjust.adjust) {
        if (typeof adjust.newKg === 'number') setRecKg(adjust.newKg);
        if (typeof adjust.newReps === 'number') setRecReps(adjust.newReps);
        if (!inputDirty) {
          if (typeof adjust.newKg === 'number') setKgInput(adjust.newKg);
          if (typeof adjust.newReps === 'number') setRepsInput(adjust.newReps);
        }
        setAdjustNotice(adjust.msg ?? null);
      } else {
        setAdjustNotice(null);
      }
    }

    if (isLastSetOfExercise) {
      if (isLastExercise) {
        // Session done — straight to post-rpe, NO trailing rest.
        router.push(gotoPath('post-rpe') as never);
        return;
      }
      // Bug 1 — last set of a non-final exercise earns a real rest then advance.
      pendingAdvanceRef.current = true;
      // Background rest-timer: alert at rest-end even if the app is backgrounded.
      void scheduleRestEndNotification(currentExercise.restSec);
      setRestCountdown(currentExercise.restSec);
      setRestInitialSec(currentExercise.restSec);
      setPhase('rest');
      return;
    }
    pendingAdvanceRef.current = false;
    // Background rest-timer: alert at rest-end even if the app is backgrounded.
    void scheduleRestEndNotification(currentExercise.restSec);
    setRestCountdown(currentExercise.restSec);
    setRestInitialSec(currentExercise.restSec);
    setPhase('rest');
  }

  function handleLogSet(rating: SetRating): void {
    bumpActivity();
    const samples = (history[safeExIdx] ?? []).map((h) => ({
      kg: h.kg,
      reps: h.reps,
      timestamp: h.timestamp ?? 0,
    }));
    const signals = getEngineSignals();
    const thresholds = deriveThresholds({
      vitalityScore: signals.vitalityScore,
      adherenceScore: signals.adherenceScore,
    });
    const check = detectAggressiveLoad(samples, {
      kg: kgInput,
      reps: repsInput,
      timestamp: Date.now(),
    }, thresholds, recKg);
    if (check.trigger && check.reason) {
      setAaReason(check.reason);
      setAaPendingRating(rating);
      setAaModalOpen(true);
      return;
    }
    performLogSet(rating);
  }

  function handleAaForceContinue(): void {
    setAaModalOpen(false);
    if (aaPendingRating !== null) {
      performLogSet(aaPendingRating);
      setAaPendingRating(null);
      setAaReason(null);
    }
  }

  function handleAaAcknowledge(): void {
    setAaModalOpen(false);
    if (aaPendingRating !== null) {
      performLogSet(aaPendingRating);
      setAaPendingRating(null);
      setAaReason(null);
      // "Pauza +30s" — normal recovery + 30s extra (NOT a flat 30s replace).
      // performLogSet already scheduled for restSec; reschedule for the longer rest.
      const extendedRest = currentExercise.restSec + 30;
      void scheduleRestEndNotification(extendedRest);
      setRestCountdown(extendedRest);
      setRestInitialSec(extendedRest);
    }
  }

  function handleSkipRest(): void {
    bumpActivity();
    // Early skip — kill the pending background rest notification.
    void cancelRestEndNotification();
    setRestCountdown(0);
    if (pendingAdvanceRef.current) {
      runTransitionToNext();
      return;
    }
    setPhase('logging');
  }

  const handleSkipExercise = useCallback((): void => {
    bumpActivity();
    // Moving on — kill any pending background rest notification.
    void cancelRestEndNotification();
    if (isLastExercise) {
      router.push(gotoPath('post-rpe') as never);
      return;
    }
    advanceExercise();
  }, [bumpActivity, isLastExercise, advanceExercise]);

  const applySwap = useCallback(
    (engineName: string, kind: 'busy' | 'refusal'): void => {
      bumpActivity();
      let res;
      if (kind === 'busy') {
        const otherNames = (exercises ?? [])
          .filter((_, i) => i !== safeExIdx)
          .map((ex) => ex.engineName ?? ex.name)
          .filter((n): n is string => typeof n === 'string' && n.length > 0);
        res = resolveBusySwap(engineName, safeExIdx, otherNames);
      } else {
        const triedNames = [
          engineName,
          ...(refusalTriedByEx[safeExIdx] ?? []),
        ];
        res = resolveRefusalSwap(engineName, safeExIdx, triedNames);
      }
      if (kind === 'refusal') {
        incrementRefusal(engineName);
        markRefusalTried(safeExIdx, engineName);
      }
      if (kind === 'refusal' && res.poolExhausted) {
        const groupLabel = res.muscleGroup ?? t('workout.swap.exhaustedFallbackGroup');
        toast.show({
          message: t('workout.swap.exhaustedPool', { group: groupLabel }),
          variant: 'info',
        });
        return;
      }
      if (!res.swapped || res.exercise === null) {
        toast.show({
          message: t('workout.swap.noAlternative', { name: res.originalName }),
          variant: 'info',
        });
        return;
      }
      const swapped = res.exercise;
      setExercises((prev) => {
        if (prev === null) return prev;
        const next = prev.slice();
        next[safeExIdx] = swapped;
        return next;
      });
      swapExercise(safeExIdx);
      if (kind === 'refusal' && typeof res.alternativeEngineName === 'string') {
        markRefusalTried(safeExIdx, res.alternativeEngineName);
      }
      toast.show({
        message:
          kind === 'busy'
            ? t('workout.swap.swappedBusy', { original: res.originalName, alt: res.alternativeName })
            : t('workout.swap.swappedRefusal', { original: res.originalName, alt: res.alternativeName }),
        variant: 'success',
      });
    },
    [bumpActivity, safeExIdx, swapExercise, refusalTriedByEx, markRefusalTried, exercises]
  );

  const handleAparatLipsaConfirm = useCallback(
    (_missing: readonly string[]): void => {
      setAparatLipsaSheetOpen(false);
      bumpActivity();
      const engineName = currentExercise.engineName;
      if (typeof engineName !== 'string' || engineName.length === 0) return;
      const otherNames = (exercises ?? [])
        .filter((_, i) => i !== safeExIdx)
        .map((ex) => ex.engineName ?? ex.name)
        .filter((n): n is string => typeof n === 'string' && n.length > 0);
      const res = resolveMissingSwap(engineName, safeExIdx, otherNames);
      if (!res.swapped || res.exercise === null) {
        if (res.noAlt) {
          toast.show({
            message: t('workout.swap.missingNoAlt', { name: res.originalName }),
            variant: 'info',
          });
        } else {
          toast.show({
            message: t('workout.swap.missingPreserved'),
            variant: 'success',
          });
        }
        return;
      }
      const swapped = res.exercise;
      setExercises((prev) => {
        if (prev === null) return prev;
        const next = prev.slice();
        next[safeExIdx] = swapped;
        return next;
      });
      swapExercise(safeExIdx);
      toast.show({
        message: t('workout.swap.swappedMissing', { original: res.originalName, alt: res.alternativeName }),
        variant: 'success',
      });
    },
    [bumpActivity, currentExercise.engineName, safeExIdx, swapExercise, exercises]
  );

  const handleOpenAparatLipsa = useCallback((): void => {
    bumpActivity();
    setAparatLipsaSheetOpen(true);
  }, [bumpActivity]);

  const handleCloseAparatLipsa = useCallback((): void => {
    setAparatLipsaSheetOpen(false);
  }, []);

  const handleOcupat = useCallback((): void => {
    const engineName = currentExercise.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) {
      router.push(gotoPath('equipment-swap') as never);
      return;
    }
    applySwap(engineName, 'busy');
  }, [currentExercise.engineName, applySwap]);

  const handleNuVreau = useCallback((): void => {
    const engineName = currentExercise.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) {
      router.push(gotoPath('ceva-nu-merge') as never);
      return;
    }
    applySwap(engineName, 'refusal');
  }, [currentExercise.engineName, applySwap]);

  function handleOpenWhy(): void {
    bumpActivity();
    const sets = history[safeExIdx] ?? [];
    const lastWeightKg = sets.length > 0 ? sets[sets.length - 1]!.kg : null;
    const summary = getWhyExerciseSummary({
      name: currentExercise.name,
      recommendationKg: targetKg,
      lastWeightKg,
    });
    setWhyText(summary ?? t('why.unavailable'));
  }

  const handleExit = useCallback((action: 'continue' | 'pause' | 'discard' | 'finish-early'): void => {
    if (action === 'continue') {
      setExitSheetOpen(false);
      return;
    }
    // Leaving the session in any non-continue way — kill the pending rest buzz.
    void cancelRestEndNotification();
    if (action === 'pause') {
      pauseSession(workoutTitle);
      router.push(gotoPath('antrenor') as never);
      return;
    }
    if (action === 'finish-early') {
      setExitSheetOpen(false);
      router.push(gotoPath('finish-early-confirm') as never);
      return;
    }
    // A started-then-cancelled workout leaves NO data (clears today's readiness).
    clearTodayReadiness();
    discardSession();
    router.push(gotoPath('antrenor') as never);
  }, [pauseSession, workoutTitle, discardSession]);

  const handleOpenExitSheet = useCallback((): void => setExitSheetOpen(true), []);
  const handleGoPain = useCallback(
    (): void => router.push({ pathname: gotoPath('pain-button'), params: { from: 'workout' } } as never),
    [],
  );
  const handleGoFinishEarly = useCallback(
    (): void => router.push(gotoPath('finish-early-confirm') as never),
    []
  );
  const handleCancelSession = useCallback((): void => handleExit('discard'), [handleExit]);

  // Loading state — async pipeline resolve (exercises===null).
  if (exercises === null) {
    return (
      <View
        testID="workout"
        accessibilityValue={{ text: 'loading' }}
        style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: dark.paper }}
      >
        <Text testID="workout-loading" style={{ fontSize: 14, color: dark.ink2, textAlign: 'center' }}>
          {t('workout.loading')}
        </Text>
      </View>
    );
  }

  // Empty state — getTodayWorkout returned null (rest day / pipeline halt).
  if (!hasWorkout) {
    return (
      <View
        testID="workout"
        accessibilityValue={{ text: 'empty' }}
        style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: dark.paper }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 8, textAlign: 'center' }}>
          {t('workout.empty.title')}
        </Text>
        <Text testID="workout-empty-body" style={{ fontSize: 14, color: dark.ink2, marginBottom: 24, textAlign: 'center' }}>
          {t('workout.empty.body')}
        </Text>
        <PressScale
          testID="workout-empty-back"
          accessibilityRole="button"
          onPress={() => router.push(gotoPath('antrenor') as never)}
          style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: accent.volt, borderRadius: 14 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('workout.empty.backCta')}</Text>
        </PressScale>
      </View>
    );
  }

  const nextExercise = exercises[safeExIdx + 1];

  const setsTotal = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const loggedSoFar = Object.values(history).reduce((acc, sets) => acc + sets.length, 0);
  const isMidSet = phase === 'logging' || phase === 'idle' || phase === 'rating';
  const setsDone = Math.min(setsTotal, loggedSoFar + (isMidSet ? 1 : 0));

  const showLogZone = phase === 'logging' || phase === 'idle' || phase === 'rating';
  const cueKey = getExerciseCueKey(currentExercise.engineName ?? currentExercise.name);

  return (
    <View testID="workout" accessibilityValue={{ text: phase }} style={{ flex: 1, backgroundColor: dark.paper }}>
      <SessionTimer
        exerciseName={currentExercise.name}
        exIdx={safeExIdx}
        totalExercises={exercises.length}
        sessionStart={sessionStart}
        onExit={handleOpenExitSheet}
        onPain={handleGoPain}
        onSkipExercise={handleSkipExercise}
        onFinishEarly={handleGoFinishEarly}
        onCancelSession={handleCancelSession}
        setsDone={setsDone}
        setsTotal={setsTotal}
        exerciseCount={safeExIdx + 1}
        exerciseTotal={exercises.length}
      />

      {/* Log zone */}
      {showLogZone && (
        <ScrollView testID="log-zone" contentContainerStyle={{ padding: 24 }}>
          {/* Live volume count-up chip + exercises label. */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
          >
            <Kicker color={accent.aqua}>
              {t('workout.progress.exercisesLabel_other', { done: safeExIdx + 1, total: exercises.length })}
            </Kicker>
            <Text testID="workout-live-volume" className="font-mono" style={{ fontSize: 11, color: dark.ink3 }}>
              <Text style={{ fontWeight: '600', color: accent.aqua }}>{liveVolumeDisplay.toLocaleString('en-US')}</Text>
              {' '}
              {t('workout.liveVolumeLabel')}
            </Text>
          </View>

          {/* Current exercise name + "why this exercise?" trigger. */}
          <View testID="wv2-exname" style={{ marginBottom: 16 }}>
            <Kicker color={accent.aqua}>{t('workout.currentExercise')}</Kicker>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink }}>{currentExercise.name}</Text>
              <PressScale
                testID="wv2-why-trigger"
                accessibilityRole="button"
                accessibilityLabel={t('workout.whyAriaLabel')}
                onPress={handleOpenWhy}
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: withAlpha(accent.aqua, 0.16),
                  borderWidth: 1,
                  borderColor: withAlpha(accent.aqua, 0.4),
                }}
              >
                <HelpCircle size={14} color={accent.aqua} />
              </PressScale>
            </View>
            {currentExercise.sub ? (
              <Text testID="wv2-ex-sub" style={{ fontSize: 14, color: dark.ink2, marginTop: 2 }}>
                {currentExercise.sub}
              </Text>
            ) : null}
          </View>

          {/* Exercise demo accordion. */}
          <View style={{ marginBottom: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: surface.base, borderWidth: 1, borderColor: dark.line }}>
            <PressScale
              testID="workout-demo-toggle"
              accessibilityRole="button"
              accessibilityState={{ expanded: demoOpen }}
              onPress={() => setDemoOpen((v) => !v)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 18,
                  backgroundColor: withAlpha(accent.volt, 0.14),
                  borderWidth: 1,
                  borderColor: withAlpha(accent.volt, 0.36),
                }}
              >
                <Play size={16} color={accent.volt} fill={accent.volt} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Kicker color={accent.volt}>{t('workout.demo.eyebrow')}</Kicker>
                <Text style={{ fontSize: 14, color: dark.ink2, marginTop: 2 }}>{t('workout.demo.tapToWatch')}</Text>
              </View>
              <ChevronDown size={20} strokeWidth={1.8} color={dark.ink2} style={{ transform: [{ rotate: demoOpen ? '180deg' : '0deg' }] }} />
            </PressScale>
            {demoOpen && (
              <View testID="workout-demo-panel" style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                <ExerciseMedia
                  engineName={currentExercise.engineName ?? currentExercise.name}
                  variant="card"
                  testId="workout-exercise-media"
                />
                {cueKey ? (
                  <Text testID="exercise-form-cue" style={{ marginTop: 12, fontSize: 12, lineHeight: 16, color: dark.ink3 }}>
                    {t(cueKey)}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* In-workout substitution row. */}
          <ExerciseActionsRow
            onOcupat={handleOcupat}
            onLipsa={handleOpenAparatLipsa}
            onNuVreau={handleNuVreau}
          />

          <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 8 }}>
            {t('workout.setLabel', { current: currentSetIdx + 1, total: currentExercise.sets })}
          </Text>

          {/* "Up next" hint on the last set of a non-final exercise. */}
          {isLastSetOfExercise && !isLastExercise && nextExercise && (
            <Text testID="workout-up-next" style={{ fontSize: 12, fontWeight: '500', color: dark.aquaInk, marginBottom: 8 }}>
              {t('workout.upNext', { name: nextExercise.name })}
            </Text>
          )}

          {/* In-session autoregulation notice. */}
          {adjustNotice !== null && (
            <CoachNote testID="insession-adjust-notice" message={adjustNotice} />
          )}

          {/* First-session baseline note. */}
          {noExerciseHistory && adjustNotice === null && (
            <CoachNote testID="baseline-note" message={t('workout.adjust.baselineNote')} />
          )}

          {/* Set history progress row. */}
          <SetHistoryChips
            totalSets={currentExercise.sets}
            loggedSets={history[safeExIdx] ?? []}
            currentSetIdx={currentSetIdx}
            isBodyweight={currentExercise.isBodyweight ?? false}
          />

          {/* Two-step set log: tinta → post-log + pencil revise. */}
          <SetLogInput
            kg={kgInput}
            reps={repsInput}
            isBodyweight={currentExercise.isBodyweight ?? false}
            mode={editing ? 'editable' : setLogged ? 'post-log' : 'tinta'}
            onLog={() => {
              bumpActivity();
              setSetLogged(true);
            }}
            onEdit={() => {
              bumpActivity();
              setEditing(true);
            }}
            onKgChange={(n) => {
              bumpActivity();
              setInputDirty(true);
              setKgInput(n);
            }}
            onRepsChange={(n) => {
              bumpActivity();
              setInputDirty(true);
              setRepsInput(n);
            }}
          />

          {(setLogged || editing) && <SetRatingButtons onRate={handleLogSet} />}
        </ScrollView>
      )}

      {phase === 'rest' && (
        <RestOverlay
          countdownSec={restCountdown}
          initialRestSec={restInitialSec}
          onSkip={handleSkipRest}
          currentExerciseName={currentExercise.name}
        />
      )}

      {phase === 'transition' && (
        <TransitionScreen
          nextExerciseName={nextExercise?.name}
          coachLine={coachPick('transition', undefined, 0)}
        />
      )}

      <ExitConfirmSheet
        open={exitSheetOpen}
        exIdx={safeExIdx}
        totalExercises={exercises.length}
        onChoose={handleExit}
      />

      <AaFrictionModal
        open={aaModalOpen}
        reason={aaReason}
        onAcknowledge={handleAaAcknowledge}
        onForceContinue={handleAaForceContinue}
      />

      {prFlash && (
        <PrFlash
          key={prFlash.exercise}
          exercise={prFlash.exercise}
          deltaKg={prFlash.deltaKg}
          onClose={() => setPrFlash(null)}
        />
      )}

      <InactivityPrompt
        open={inactivityPromptOpen}
        onContinue={bumpActivity}
        onSaveExit={() => {
          pauseSession(workoutTitle);
          router.push(gotoPath('antrenor') as never);
        }}
      />

      <AparatLipsaSheet
        open={aparatLipsaSheetOpen}
        onConfirm={handleAparatLipsaConfirm}
        onClose={handleCloseAparatLipsa}
      />

      {whyText !== null && (
        <WhyExerciseModal
          whyText={whyText}
          exerciseName={currentExercise.name}
          onClose={() => setWhyText(null)}
        />
      )}
    </View>
  );
}

// GYM-ONLY gate (web GymOnlyRoute): aerobic-only users never reach the gym FSM.
// Read trainingType from the EXISTING onboarding store; 'aerobic' → redirect to
// the hub. 'gym'/'both' keep full access. Gate wraps the screen so the FSM
// hooks only mount for gym users (no fabricated cold-start session for aerobic).
export default function Workout(): React.JSX.Element {
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  if (trainingType === 'aerobic') return <Redirect href="/app/antrenor" />;
  return <WorkoutScreen />;
}
