// ══ WORKOUT — Phase 3 task_08 State Machine UI Rewrite ═══════════════════
// Per spec §2 A wv2 state machine port React. 5 sub-zones conditional pe
// workoutStore.phase: 'logging' | 'rating' | 'rest' | 'transition' | 'idle'.
//
// Phase 3 monolithic (acceptable spec §B). Sub-components extract Phase 4+
// (SessionTimer / RestOverlay / SetLogInput / SetRatingButtons /
// ExitConfirmSheet / SessionPill).
//
// State machine transitions:
//   logging → (logSet) → rest (cand NU last set) sau transition (cand last
//   set of exercise) sau navigate post-rpe (cand last set of last exercise)
//   rest → (countdown end or skip) → logging
//   transition → (1.5s delay) → logging (next exercise)
//
// Wake lock: navigator.wakeLock.request('screen') on mount, release on unmount
// (fail silent — older browsers / non-secure context).
// Inactivity watch + anti-aggressive loading (LOCK 9) — Phase 4+ adds.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-027 Energy Adjustment
//   - DECISIONS.md §D-LEGACY-029 Adherence Engine
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet (coach line)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html screen-workout wv2 reference

import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { AparatLipsaSheet } from '../../../components/Workout/AparatLipsaSheet';
import { useWorkoutStore, getCurrentMode } from '../../../stores/workoutStore';
import type { ExerciseHistoryEntry } from '../../../stores/workoutStore';
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout, getPRDelta, getWhyExerciseSummary, resolveSessionTitle } from '../../../lib/engineWrappers';
import type { PlannedExercise, PlannedWorkoutOutput } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';
import { SessionTimer } from '../../../components/Workout/SessionTimer';
import { RestOverlay } from '../../../components/Workout/RestOverlay';
import { SetLogInput } from '../../../components/Workout/SetLogInput';
import { SetRatingButtons } from '../../../components/Workout/SetRatingButtons';
import { ExitConfirmSheet } from '../../../components/Workout/ExitConfirmSheet';
import { AaFrictionModal } from '../../../components/AaFrictionModal';
import { detectAggressiveLoad, deriveThresholds } from '../../../lib/aaFrictionDetect';
import type { AggressiveReason } from '../../../lib/aaFrictionDetect';
import { getEngineSignals } from '../../../lib/engineSignalsAggregate';
import { InactivityPrompt } from '../../../components/Workout/InactivityPrompt';
import { PrFlash } from '../../../components/Workout/PrFlash';
import { TransitionScreen } from '../../../components/Workout/TransitionScreen';
import { WhyExerciseModal } from '../../../components/Workout/WhyExerciseModal';
import { SetHistoryChips } from '../../../components/Workout/SetHistoryChips';
import { ExerciseActionsRow } from '../../../components/Workout/ExerciseActionsRow';
import { CoachNote } from '../../../components/Workout/CoachNote';
import { ExerciseMedia } from '../../../components/ExerciseMedia';
import { Kicker } from '../../../components/pulse/Kicker';
import { useCountUp } from '../../../hooks/useCountUp';
import { DP } from '../../../../engine/dp.js';
import { getCurrentWeightKg } from '../../../lib/userTdee';
import { resolveBusySwap, resolveMissingSwap, resolveRefusalSwap } from '../../../lib/substitution';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../lib/scheduleAdapterAggregate';
import { toast } from '../../../lib/toast';
import { incrementRefusal } from '../../../../engine/schedule/scheduleAdapter.js';
import { clearTodayReadiness } from '../../../../engine/readiness.js';
import { t } from '../../../../i18n/index.js';

const INACTIVITY_THRESHOLD_MIN = 7; // Mockup wv2 verbatim L4401
const INACTIVITY_CHECK_INTERVAL_MS = 30_000; // Mockup wv2 verbatim L4404

// Phase 4 task_17: WV2_FALLBACK retired. Workout consumer of
// engineWrappers.getTodayWorkout direct — empty state cand null (engine
// throw / DB unavailable / no planned workout today). Phase 5+ scheduleAdapter
// real aggregate replaces PHASE_4_DEMO_PUSH în engineWrappers.

type SetRating = ExerciseHistoryEntry['rating'];

// In-session coarse rating → RPE for DP.checkInSessionAdjust (responsive per-set
// autoregulation, Daniel 2026-05-30 rewrite).
// DISTINCT from workoutStore.RATING_TO_RPE (usor 6.5 / potrivit 7.5 / greu 8.5):
// that map calibrates the PERSISTED fatigue/dp history. Here the decision is the
// LIVE per-set correction "this set was greu/potrivit/usor -> adjust the NEXT
// set's target now" — phase-aware (weight in STRENGTH, reps in masa). greu maps
// to 10 (the engine eases at RPE>=9.5), usor to 6.5 (the engine nudges up at
// <=6.5), potrivit to 7.5 (hold, with a small late-set taper). Not persisted.
const INSESSION_RATING_TO_RPE: Readonly<Record<SetRating, number>> = {
  usor: 6.5,
  potrivit: 7.5,
  greu: 10,
};

export function Workout(): JSX.Element {
  const navigate = useNavigate();
  // §44-C1 — primitive subscriptions feed getCurrentMode tagged FSM view.
  // Mount-init gates on mode.kind=idle (pre-start condition).
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
  // Daniel smoke 2026-05-28 (#2 + #6) — per-exIdx refusal-tried set + mutation.
  const refusalTriedByEx = useWorkoutStore((s) => s.refusalTriedByEx);
  const markRefusalTried = useWorkoutStore((s) => s.markRefusalTried);
  // Daniel smoke 2026-05-28 (#18) — sessionContext.painContext set by PainButton
  // in-session flow triggers the intensityMod override below (minus on remaining
  // sets) — no workout-preview round-trip, no session reset.
  const sessionContext = useWorkoutStore((s) => s.sessionContext);

  // Phase 6 task_02 Option C: async getTodayWorkout — 3-state useState pattern
  // per DECISIONS.md §D027 (null=loading, []=empty/rest day, [...]=session).
  const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
  // HIGH-CODE-05 fix: capture real workoutTitle pentru pauseSession truth.
  // Empty string default cand engine null/loading → store fallback la
  // '(sesiune nedefinita)' explicit marker NU 'Push' lie.
  const [workoutTitle, setWorkoutTitle] = useState<string>('');
  // C3 — ENGINE intensityMod baseline (deload output from the pipeline). This
  // is the adaptive signal applied to weight; the EnergyCheck self-report no
  // longer multiplies weight separately (it now feeds the engine VIA readiness,
  // C2). 'normal' default until the async plan resolves.
  const [engineIntensityMod, setEngineIntensityMod] = useState<PlannedWorkoutOutput['intensityMod']>('normal');
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((planned) => {
      if (!cancelled) {
        setExercises(planned?.exercises ?? []);
        // No real engine title (sentinel) → derive the localized title from the
        // engine SESSION TYPE (PUSH/PULL/...), so a paused PULL session reads
        // "Pull" in ResumeSessionCard instead of a generic label (and never the
        // old hardcoded "Push" lie). A real engine title passes through untouched.
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

  // Bound exIdx în caz session state contamination (NU index past array).
  // 3-state guard: exercises===null → loading state; [] → empty state branch;
  // [...] → session UI branch. safeExIdx + currentExercise defensive-default
  // for loading/empty states.
  const safeExIdx = hasWorkout && exercises !== null ? Math.min(exIdx, exercises.length - 1) : 0;
  const defaultExercise: PlannedExercise = { id: '', name: '', sets: 0, targetReps: 0, targetKg: 0, restSec: 0 };
  const currentExercise: PlannedExercise = (hasWorkout && exercises !== null
    ? exercises[safeExIdx]
    : undefined) ?? defaultExercise;
  // First-session baseline note: when there is NO prior history for this
  // exercise (DP.getState lastW === 0 — the exact condition under which
  // checkInSessionAdjust returns {adjust:false}), the per-set autoregulation
  // has nothing to adapt from. Surface a brief, non-technical note so the user
  // understands why the targets are not adapting yet, instead of leaving them
  // wondering. Loaded exercises only (bodyweight has its own rep-based flow).
  const noExerciseHistory =
    hasWorkout &&
    !currentExercise.isBodyweight &&
    currentExercise.name !== '' &&
    DP.getState(currentExercise.name).lastW === 0;
  // Apply the ENGINE intensityMod baseline (deload output) to target kg. This
  // is the COARSE deload-state modifier (±%), distinct from readiness: as of
  // the wiring fix, today's readiness already shapes the per-exercise targetKg
  // UPSTREAM in the pipeline — scheduleAdapterAggregate.toPlannedExercise calls
  // DP.getSmartRecommendation(name, readinessScore, ...), which holds the weight
  // on an INCREASE day when readiness < 60. So targetKg arrives readiness-gated;
  // this block layers only the deload baseline on top (no double-count — the two
  // signals are different: per-exercise progression gate vs whole-session deload).
  // Magnitudes (-20% / +15%) unchanged (separate Daniel UX call). Round 0.5
  // (incremente reale sala). 'normal' / no deload → target neschimbat.
  //
  // Daniel smoke 2026-05-28 #18 — mid-session pain override: when PainButton
  // posted a sessionContext with intensityMod='minus' + painContext, the
  // remaining sets must lighten without restarting. sessionContext wins over
  // the engine baseline ONLY when it carries pain (the pre-session intensityMod
  // path still uses sessionContext too, identical end-state — this is honest).
  // 'minus' wins as the conservative pick (we never STACK; max-magnitude rule).
  const intensityMod =
    sessionContext?.painContext !== null && sessionContext?.painContext !== undefined
      ? 'minus'
      : engineIntensityMod;
  // For a BODYWEIGHT exercise, targetKg is the ADDED weight (default 0). The
  // deload ±% modifier applies to EXTERNAL load — scaling a 0-added bodyweight
  // target does nothing, and we don't want to inflate/deflate a small added
  // weight by 20% (a deload on bodyweight = fewer reps, an engine concern). So
  // bodyweight exercises keep their added weight unchanged here.
  const targetKg =
    currentExercise.isBodyweight
      ? currentExercise.targetKg
      : intensityMod === 'minus'
      ? Math.round(currentExercise.targetKg * 0.8 * 2) / 2
      : intensityMod === 'plus'
      ? Math.round(currentExercise.targetKg * 1.15 * 2) / 2
      : currentExercise.targetKg;
  const currentSetIdx = hasWorkout ? history[safeExIdx]?.length ?? 0 : 0;
  const isLastSetOfExercise =
    hasWorkout && currentSetIdx + 1 >= currentExercise.sets;
  const isLastExercise = hasWorkout && exercises !== null && safeExIdx + 1 >= exercises.length;

  const [kgInput, setKgInput] = useState<number>(targetKg);
  const [repsInput, setRepsInput] = useState<number>(currentExercise.targetReps);
  // Audit fix (shared current-recommended-load) — autoregulation and the
  // AaFriction over-recommendation check must read/write ONE recommended load,
  // not drift between `kgInput` (autoreg writes) and the stale per-exercise
  // `targetKg` (friction read). recKg/recReps START at the per-exercise target
  // and get bumped by in-session autoregulation; AaFriction evaluates the
  // user's entered load against THIS value (not the original target), and the
  // engine's own up-ramp computes from THIS value (no stale baseline overshoot).
  const [recKg, setRecKg] = useState<number>(targetKg);
  const [recReps, setRecReps] = useState<number>(currentExercise.targetReps);
  // Audit fix (input-guard) — true once the user manually edits the kg/reps for
  // the current set. Autoregulation pre-fills the NEXT set only when the field
  // is still at its untouched recommended default; a user-typed value is never
  // clobbered. Reset per set (effect keyed on safeExIdx + currentSetIdx).
  const [inputDirty, setInputDirty] = useState(false);
  // Perf isolation: the per-second elapsed clock no longer lives here (it drove
  // a whole-subtree re-render once a second). It now lives in the
  // <SessionElapsed> leaf inside SessionTimer, fed the raw sessionStart.
  const [restCountdown, setRestCountdown] = useState(0);
  // F-pass2-restoverlay-01 — initial rest total seconds at moment rest phase
  // entered (drives SVGCountdownRing progress ratio). Reset alongside
  // setRestCountdown so ring shows full track at rest entry.
  const [restInitialSec, setRestInitialSec] = useState(0);
  const [exitSheetOpen, setExitSheetOpen] = useState(false);
  // Phase 4 task_14: LOCK 9 aaFrictionModal state — pending rating cand
  // triggered + reason pentru REASON_LABEL display în modal.
  const [aaModalOpen, setAaModalOpen] = useState(false);
  const [aaReason, setAaReason] = useState<AggressiveReason | null>(null);
  const [aaPendingRating, setAaPendingRating] = useState<SetRating | null>(null);
  // Phase 4 task_15 §A: inactivity watch state. lastActivityAt updates on
  // input change + rating click + skip rest click. Interval 30s checks
  // delta > 7 min → show prompt.
  const [lastActivityAt, setLastActivityAt] = useState<number>(Date.now());
  const [inactivityPromptOpen, setInactivityPromptOpen] = useState(false);
  // §F-pass2-setloginput-02 — SetLogInput parent state machine wire (deferred
  // tactical sibling per e02f0b94 "Parent state machine wire tactical sibling").
  // Mockup wv2 two-step within the logging phase (andura-clasic.html#L1463-1485):
  //   pre-log `tinta` (Tinta X repetari Y kg + "Logheaza setul" CTA) →
  //   post-log readonly "Tu ai facut X repetari cu Y kg" + pencil + rating row.
  // `setLogged` flips on Logheaza (onLog); `editing` is the pencil revise escape
  // (onEdit) surfacing the editable inputs (React-port a11y editable mode kept).
  // FSM (logging/rest/transition + timers + LOCK 9 aaFriction) untouched — this
  // is purely the inner log-zone UI. Reset per new set via effect below.
  const [setLogged, setSetLogged] = useState(false);
  const [editing, setEditing] = useState(false);
  // §F-workout-05 — "why this exercise?" help-circle (mockup openWhyExercise
  // andura-clasic.html#L1449). Null = closed; string = whyEngine summary shown
  // in a bottom-sheet explainer. Built on tap so it reflects current readiness.
  const [whyText, setWhyText] = useState<string | null>(null);
  // Daniel smoke 2026-05-28 #17 — in-session "Aparat lipsa" sheet open state.
  // Tap the third action-row button -> sheet slides up -> user toggles items ->
  // Salveaza persists wv2-missing-equipment (visible in Cont -> AparateLipsa on
  // next mount) + recompose the current exercise via resolveMissingSwap if the
  // new missing list now blocks its equipment.
  const [aparatLipsaSheetOpen, setAparatLipsaSheetOpen] = useState(false);
  // Fix #2 — in-session RPE auto-correction notice (DP.checkInSessionAdjust).
  // Null = no adjustment surfaced; string = the engine's honest localized message
  // (e.g. "Ai dat greu - coboram la 8 reps pe setul urmator", or a weight twin in
  // STRENGTH phase). Shown in the log zone for the NEXT set; cleared on advance.
  const [adjustNotice, setAdjustNotice] = useState<string | null>(null);
  // Pulse arc 2026-05-29 (blueprint C3-c) — mid-session PR celebration. Set at
  // the EXISTING getPRDelta/markPRHit moment in performLogSet (we do NOT add a
  // second detection path); cleared on overlay dismiss. Carries the exercise +
  // positive kg delta the mockup PrFlash shows. The PostSummary PR banner stays
  // the durable record — this is the in-the-moment hit only.
  const [prFlash, setPrFlash] = useState<{ exercise: string; deltaKg: number } | null>(null);
  // U-04 (MED) — why-modal focus management (auto-focus + Escape + restore +
  // trap), paritate cu ExitConfirmSheet sister pattern. whyDismissRef = singurul
  // buton ("Am inteles") → Tab trap pe el insusi.
  const whyDismissRef = useRef<HTMLButtonElement | null>(null);
  const whyPrevFocusRef = useRef<HTMLElement | null>(null);

  // Init session on mount cand idle (no paused snapshot resumed via Antrenor).
  // §44-C1: idle mode === no live session + no paused snapshot + no lastSession
  // priority. Resume case is mode=paused — Antrenor calls resumeSession() before
  // navigate, so mount-time mode is active (sessionStart populated).
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

  // Session timer — extracted to <SessionElapsed> leaf (perf isolation). The
  // 1Hz tick used to setElapsed here, re-rendering the whole active-session
  // subtree once a second; it is now confined to the leaf rendered by the
  // memoized SessionTimer.

  // Rest countdown — auto-advance la logging când reaches 0.
  useEffect(() => {
    if (phase !== 'rest') return;
    const interval = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('logging');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, setPhase]);

  // Wake lock acquire on mount + release on unmount — fail silent.
  // Phase 4 task_15 §B: visibilitychange re-acquire pattern. Browser tab
  // background → OS auto-releases wake lock. Foreground re-acquires dacă lock
  // null. lockRef shared mutable reference cu event handler.
  const lockRef = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    interface WakeLockSentinel {
      release: () => Promise<void>;
    }
    interface NavigatorWithWakeLock {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
    }
    const nav = navigator as unknown as NavigatorWithWakeLock;
    const acquire = (): void => {
      if (!nav.wakeLock || lockRef.current) return;
      nav.wakeLock
        .request('screen')
        .then((sentinel) => {
          lockRef.current = sentinel;
        })
        .catch(() => {
          /* fail silent */
        });
    };
    acquire();
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible' && !lockRef.current) {
        acquire();
      } else if (document.visibilityState === 'hidden') {
        // OS auto-releases; clear ref so foreground re-acquires fresh.
        lockRef.current = null;
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {
          /* fail silent */
        });
        lockRef.current = null;
      }
    };
  }, []);

  // Reset kg/reps inputs when advancing exercise. U-03: kg target reflects
  // session intensityMod (targetKg derived above) — depend on it so an
  // adapted target rehydrates on exercise change. Fix #2: also clear the
  // in-session adjust notice — an auto-correction is scoped to the exercise it
  // fired on; carrying it onto the next exercise would mislead.
  useEffect(() => {
    setKgInput(targetKg);
    setRepsInput(currentExercise.targetReps);
    // Shared current-recommended-load resets to the per-exercise target on
    // exercise change — in-session autoreg bumps it from here within the set run.
    setRecKg(targetKg);
    setRecReps(currentExercise.targetReps);
    setAdjustNotice(null);
  }, [safeExIdx, targetKg, currentExercise.targetReps]);

  // §F-pass2-setloginput-02 — each new set begins at pre-log `tinta`. Keyed on
  // exercise (safeExIdx) + set index (currentSetIdx bumps when a set logs into
  // history), so post-rest next-set returns to the target display + Logheaza.
  useEffect(() => {
    setSetLogged(false);
    setEditing(false);
    // New set starts at its untouched recommended default — autoreg may pre-fill
    // it; the user-touched guard clears so the next manual edit re-arms it.
    setInputDirty(false);
  }, [safeExIdx, currentSetIdx]);

  // Phase 4 task_15 §A: inactivity watch — interval 30s checks idle minutes
  // vs lastActivityAt; > 7 min triggers prompt overlay. Reset triggers
  // (input/rating/skip) bumpActivity() inline.
  useEffect(() => {
    const interval = setInterval(() => {
      const idleMin = (Date.now() - lastActivityAt) / 60_000;
      if (idleMin > INACTIVITY_THRESHOLD_MIN) {
        setInactivityPromptOpen(true);
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [lastActivityAt]);

  // U-04 (MED) — why-modal a11y: auto-focus "Am inteles" la open, Escape inchide,
  // Tab trap (singur buton → ramane focus pe el), restore focus la invoker on
  // close. Paritate cu ExitConfirmSheet/AaFrictionModal sister pattern (WCAG
  // 2.1.1 / 2.4.3). Open gated pe whyText !== null.
  useEffect(() => {
    if (whyText === null) return;
    whyPrevFocusRef.current = document.activeElement as HTMLElement | null;
    whyDismissRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        setWhyText(null);
        return;
      }
      if (e.key === 'Tab') {
        // Singur element focusabil → trap pe el insusi.
        e.preventDefault();
        whyDismissRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      whyPrevFocusRef.current?.focus();
    };
  }, [whyText]);

  // useCallback: referenced by handlers passed to memoized SessionTimer; only
  // touches stable state setters so the empty dep array is correct + stable.
  const bumpActivity = useCallback((): void => {
    setLastActivityAt(Date.now());
    setInactivityPromptOpen(false);
  }, []);

  // Pulse arc 2026-05-29 (blueprint C3-g) — live session volume = Σ kg×reps
  // across every logged set so far (the mockup's count-up header stat). Derived
  // from the real `history` store slice (NOT a mocked number); recomputes each
  // time a set lands. useCountUp must run at top level (rules-of-hooks) above
  // the loading/empty early returns; history is [] pre-session so it reads 0.
  const liveVolumeKg = Object.values(history).reduce(
    (acc, sets) => acc + sets.reduce((s, set) => s + set.kg * set.reps, 0),
    0,
  );
  const liveVolumeDisplay = useCountUp(Math.round(liveVolumeKg));

  function performLogSet(rating: SetRating): void {
    // Bodyweight model: kgInput is the ADDED weight (belt/dumbbell, default 0).
    // The TRAINING load that PR/volume/progression must use is the EFFECTIVE
    // load = bodyweight x fraction + added. We persist `kg` = effective so every
    // downstream consumer (PR engine, session volume, DP logs) is correct with
    // zero per-consumer change; `addedKg` preserves what the user entered for
    // honest display. Loaded exercises: effective == kgInput (unchanged).
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

    // Phase 4 task_10: PR detection wire — call engineWrappers.getPRDelta
    // post logSet. Compose history for engine (per-exercise flat list cu
    // baseline + previous sets). markPRHit propagates flag + prData la
    // PostSummary F11 banner (Trophy lucide + exercise name + deltaKg).
    // PR is detected against the EFFECTIVE load (h.kg already effective), so a
    // pure-bodyweight rep PR (added 0) now fires instead of being killed by the
    // detectPR w<=0 guard.
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
      // Pulse C3-c — fire the mid-session PR celebration at the SAME detection
      // moment (no second path). The mockup PrFlash shows a positive kg delta,
      // so we surface it for weight PRs with a real kg gain; volume/reps PRs
      // (deltaKg 0) still flow to the PostSummary banner via markPRHit above.
      if (delta.deltaKg > 0) {
        setPrFlash({ exercise: exerciseName, deltaKg: delta.deltaKg });
      }
    }

    // Fix #2 — in-session RPE auto-correction (DP.checkInSessionAdjust, was dead
    // code — never wired into the screen). Only meaningful when a NEXT set
    // follows (the engine drops/bumps the upcoming set's weight). Compose the
    // per-set rating history = prior logged sets + the just-logged one (the
    // hook `history` won't reflect this set synchronously, same pattern as the
    // getPRDelta history build above). Map coarse ratings to RPE via the
    // in-session map (greu->10 so 2x-hard fires the DOWN path). The engine reads
    // prior-session lastW from DB — when the user has no history it returns
    // {adjust:false} and we no-op (honest: nothing to recalibrate against).
    // Bodyweight: the DP in-session "drop to X kg" recalibration is about
    // EXTERNAL load — it doesn't translate to a bodyweight movement (where the
    // adjustment is fewer reps). Skip the weight pre-fill + notice for BW so we
    // never tell a user doing 0-added push-ups to "switch to 50 kg".
    if (!isLastSetOfExercise && !currentExercise.isBodyweight) {
      const ratedSets = [...(history[safeExIdx] ?? []), { kg: kgInput, reps: repsInput, rating }];
      const recentRPEs = ratedSets.map((s) => INSESSION_RATING_TO_RPE[s.rating]);
      const recentReps = ratedSets.map((s) => s.reps);
      // Pass the RECOMMENDATION for the set just logged (targetKg/targetReps) +
      // the NEXT set index so the engine can measure performance deviation and
      // apply the fatigue taper. The engine decides phase-aware whether to move
      // weight (newKg) or reps (newReps, weight held = holdKg).
      const adjust = DP.checkInSessionAdjust(exerciseName, recentRPEs, recentReps, {
        // Shared current-recommended-load: feed the engine the LIVE rec (recKg/
        // recReps), not the stale per-exercise target — so a prior in-session
        // bump is the baseline for the next bump (the up-ramp never computes
        // from a stale value). recKg/recReps start at the target on exercise
        // change, so set 1 still uses the target.
        recKg,
        recReps,
        loggedKg: effKg, // the load the user ACTUALLY logged this set
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
        // Update the SHARED current-recommended-load first — this is the single
        // source of truth that the next set's AaFriction over-recommendation
        // check evaluates against (so the friction boundary moves with the
        // autoreg-raised rec, never the stale target). This always tracks the
        // engine's correction.
        if (typeof adjust.newKg === 'number') setRecKg(adjust.newKg);
        if (typeof adjust.newReps === 'number') setRecReps(adjust.newReps);
        // Pre-fill the next set's input with the engine's correction + surface
        // the honest message (NU a silent change) — but ONLY when the user has
        // not manually typed their own next-set value (inputDirty). A user edit
        // is intent; autoreg must not clobber it. Weight autoregulation moves
        // kgInput; rep autoregulation moves repsInput (and holds the weight).
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
        navigate(gotoPath('post-rpe'));
        return;
      }
      setPhase('transition');
      window.setTimeout(() => {
        advanceExercise();
      }, 1500);
      return;
    }
    setRestCountdown(currentExercise.restSec);
    setRestInitialSec(currentExercise.restSec);
    setPhase('rest');
  }

  function handleLogSet(rating: SetRating): void {
    bumpActivity();
    // Phase 4 task_14: LOCK 9 aaFrictionDetect pre-check. Compose set sample
    // history din current exercise + new set candidate. Cand trigger →
    // suspend state machine (NU logSet/rest/transition), show modal.
    //
    // Phase 6 task_07: wire engine signals → derive thresholds dynamic per
    // vitality/adherence state. Replaces implicit Phase 5 DEFAULT_THRESHOLDS
    // fallback cu engine-derived thresholds (laxer pe high signals, stricter
    // pe low signals). Per DECISIONS.md §D027 anti-recurrence: stores actual
    // slice = `streak` + `sessionsHistory` (NU streakDays/sessionsLast30Days
    // sketch v1 fabricated).
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
    // 06.AA.010 — thread the engine's adapted recommendation into the friction
    // check so an over-recommendation overshoot fires even with NO set history
    // (first set, fresh install). Was previously never passed → silent gap.
    // Audit fix (shared current-recommended-load): pass `recKg` (the SHARED rec
    // that in-session autoregulation bumps), NOT the stale per-exercise
    // `targetKg`. On set 1 recKg === targetKg, so first-set behaviour is
    // unchanged; on later sets the friction boundary tracks the autoreg-raised
    // rec instead of drifting from it.
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
      // Phase 4 task_14 §C: Pauza 30s override = post-logSet force rest
      // countdown 30s (NU normal restSec din exercise). State machine
      // performLogSet deja a setat phase=rest pentru intermediate sets;
      // override countdown la 30s here. Last set of exercise scenarios
      // (transition / post-rpe navigate) NU touch rest — no-op.
      setRestCountdown(30);
      setRestInitialSec(30);
    }
  }

  function handleSkipRest(): void {
    bumpActivity();
    setRestCountdown(0);
    setPhase('logging');
  }

  // P-05 (MED) — ⋯ menu "Sari exercitiul curent". Daca e ultimul exercitiu →
  // post-rpe (finish, ca last set); altfel advanceExercise (next, fara
  // penalizare per copy mockup). bumpActivity reseteaza inactivity watch.
  // useCallback: passed to memoized SessionTimer — stable ref keeps memo intact.
  const handleSkipExercise = useCallback((): void => {
    bumpActivity();
    if (isLastExercise) {
      navigate(gotoPath('post-rpe'));
      return;
    }
    advanceExercise();
  }, [bumpActivity, isLastExercise, navigate, advanceExercise]);

  // WP-5 moat — in-place substitution for the CURRENT exercise. The exercise
  // list lives in this screen's local `exercises` state; the store owns the
  // logged-set integrity. Swap = replace exercises[safeExIdx] with the
  // alternative + swapExercise(safeExIdx) (drops partial sets of the original,
  // restarts at set 1) + a NAMED toast (the key to the moat: the user SEES the
  // alternative). Honest noAlt → toast tells the user to skip it (anti-
  // paternalism, never force an inferior movement). Replaces the old behavior
  // where the buttons navigated AWAY and the user never saw a named alternative.
  //
  // Daniel smoke 2026-05-28 (#2 + #6 + #3.2) — REFUSAL path now consumes a
  // per-exIdx tried-set so each "Nu vreau" tap surfaces a DIFFERENT same-muscle
  // candidate (no 2-element ping-pong). On exhaustion (every same-muscle option
  // tried this session) the toast switches to "ai incercat tot pentru
  // [muscleGroup]". Equipment paths unchanged (different semantic).
  const applySwap = useCallback(
    (engineName: string, kind: 'busy' | 'refusal'): void => {
      bumpActivity();
      let res;
      if (kind === 'busy') {
        res = resolveBusySwap(engineName, safeExIdx);
      } else {
        // Refusal: build tried-set = the original we're about to swap out + all
        // names previously refused at this slot. markRefusalTried below records
        // the alternative we surface so the NEXT tap skips it. Daniel verbatim
        // "nu sa dea doar 2 alternative" — pool walks the whole same-muscle
        // library before exhausting.
        const triedNames = [
          engineName,
          ...(refusalTriedByEx[safeExIdx] ?? []),
        ];
        res = resolveRefusalSwap(engineName, safeExIdx, triedNames);
      }
      if (kind === 'refusal') {
        // Preserve the existing refusal counter (threshold → "permanent?" flow).
        incrementRefusal(engineName);
        // Append the JUST-refused exercise to the per-exIdx tried-set so a
        // subsequent "Nu vreau" tap doesn't re-offer it (idempotent on store).
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
      // Refusal path: record the alternative we just surfaced so the NEXT
      // "Nu vreau" tap on this slot skips it (Daniel exhaustive cycle).
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
    [bumpActivity, safeExIdx, swapExercise, refusalTriedByEx, markRefusalTried]
  );

  // Daniel smoke 2026-05-28 #17 — in-session aparat-lipsa save flow. The sheet
  // already persisted the new list (single SoT = wv2-missing-equipment local
  // storage, read by Cont -> AparateLipsa next mount), so we only need to (a)
  // close the sheet, (b) check if the new list blocks the CURRENT exercise's
  // equipment and, if so, swap it in-place via resolveMissingSwap — same UX
  // contract as Aparat ocupat (NAMED alternative + toast). When the current
  // exercise is still performable, no swap, no toast — quiet success.
  const handleAparatLipsaConfirm = useCallback(
    (_missing: readonly string[]): void => {
      setAparatLipsaSheetOpen(false);
      bumpActivity();
      const engineName = currentExercise.engineName;
      if (typeof engineName !== 'string' || engineName.length === 0) return;
      const res = resolveMissingSwap(engineName, safeExIdx);
      // resolveMissingSwap returns swapped=false when the original is still
      // performable with the new missing list (no equipment overlap). Honest
      // noAlt when the user has marked so much missing that nothing works —
      // toast tells them, mirrors Aparat ocupat path.
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
    [bumpActivity, currentExercise.engineName, safeExIdx, swapExercise]
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
      // No canonical name (defensive — pre-WP-5 fixture) → fall back to the old
      // navigate path so the user is never stranded.
      navigate(gotoPath('equipment-swap'));
      return;
    }
    applySwap(engineName, 'busy');
  }, [currentExercise.engineName, applySwap, navigate]);

  const handleNuVreau = useCallback((): void => {
    const engineName = currentExercise.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) {
      navigate(gotoPath('ceva-nu-merge'));
      return;
    }
    applySwap(engineName, 'refusal');
  }, [currentExercise.engineName, applySwap, navigate]);

  // §F-workout-05 — open the why-exercise explainer. Builds engine context on
  // tap (current readiness + recommendation kg vs last logged kg) so the verdict
  // reflects live state. Engine null → why.unavailable fallback copy.
  // RE-U-03 — paseaza targetKg ADAPTAT (U-03 intensityMod -20%/+15%), NU
  // baseline-ul currentExercise.targetKg, ca explainerul sa fie consistent cu
  // tinta afisata in SetLogInput (kgInput) pe sesiuni adaptate.
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

  // useCallback: passed to memoized SessionTimer (onCancelSession) + ExitConfirmSheet
  // + InactivityPrompt — stable ref keeps the memoized header intact.
  const handleExit = useCallback((action: 'continue' | 'pause' | 'discard' | 'finish-early'): void => {
    if (action === 'continue') {
      setExitSheetOpen(false);
      return;
    }
    if (action === 'pause') {
      // HIGH-CODE-05 fix: pass real workoutTitle NU hardcoded 'Push' lie.
      pauseSession(workoutTitle);
      navigate(gotoPath('antrenor'));
      return;
    }
    if (action === 'finish-early') {
      // §B004 D047 Stage 3 — drill-down friction layer before partial-finish.
      // FinishEarlyConfirm → navigate post-rpe → PostRpe submit builds summary
      // din byDay logat pana acum (NU pierzi progresul).
      setExitSheetOpen(false);
      navigate(gotoPath('finish-early-confirm'));
      return;
    }
    // Bugatti truth — un workout pornit-apoi-anulat NU lasa date. EnergyCheck a
    // persistat raspunsul de energie (saveReadiness) la intrarea in flow; discard
    // sterge si acel semnal de readiness de azi, altfel Coach-ul ar afisa un scor
    // de readiness fabricat (ex. 85) desi nu exista nicio sesiune reala. Doar o
    // sesiune COMPLETATA (finishSession) lasa semnal de readiness.
    clearTodayReadiness();
    discardSession();
    navigate(gotoPath('antrenor'));
  }, [pauseSession, workoutTitle, navigate, discardSession]);

  // Stable callbacks for the memoized SessionTimer header (perf isolation).
  // Hooks declared above the loading/empty early returns so order is stable.
  const handleOpenExitSheet = useCallback((): void => setExitSheetOpen(true), []);
  // Daniel smoke 2026-05-28 #18 — tag origin so PainButton flows back to the
  // active Workout (no workout-preview re-confirmation friction). Defensive
  // signal — sessionStart!=null already gates PainButton.inSession but the tag
  // covers edge cases (paused / freshly-resumed sessions etc.).
  const handleGoPain = useCallback(
    (): void => navigate(gotoPath('pain-button'), { state: { from: 'workout' } }),
    [navigate],
  );
  const handleGoFinishEarly = useCallback(
    (): void => navigate(gotoPath('finish-early-confirm')),
    [navigate]
  );
  const handleCancelSession = useCallback((): void => handleExit('discard'), [handleExit]);

  // Phase 6 task_02 Option C: loading state pe async pipeline resolve
  // (exercises===null → 8-adapter chain pending). Per DECISIONS.md §D027.
  // Early return must precede exercises[index] access — TS strict guard.
  if (exercises === null) {
    return (
      <section
        className="min-h-screen p-6 flex flex-col items-center justify-center text-center"
        data-testid="workout"
        data-phase="loading"
      >
        <p className="text-sm text-ink2" data-testid="workout-loading">
          {t('workout.loading')}
        </p>
      </section>
    );
  }

  // Phase 4 task_17: empty state cand getTodayWorkout returns null (engine
  // throw / DB unavailable / no planned workout today). Render simple
  // anchor + back-to-antrenor CTA — Phase 5+ wire la calendar override la
  // pick alt workout sau showInactivityPrompt-style soft re-engage.
  if (!hasWorkout) {
    return (
      <section
        className="min-h-screen p-6 flex flex-col items-center justify-center text-center"
        data-testid="workout"
        data-phase="empty"
      >
        <h1 className="text-2xl font-bold text-ink mb-2">
          {t('workout.empty.title')}
        </h1>
        <p className="text-sm text-ink2 mb-6" data-testid="workout-empty-body">
          {t('workout.empty.body')}
        </p>
        <button
          type="button"
          onClick={() => navigate(gotoPath('antrenor'))}
          data-testid="workout-empty-back"
          className="px-6 py-3 pulse-grad-bg pulse-shine text-paper rounded-[14px] text-base font-semibold"
        >
          {t('workout.empty.backCta')}
        </button>
      </section>
    );
  }

  // Past empty/loading guard — exercises is non-null array.
  const nextExercise = exercises[safeExIdx + 1];

  // P-11 (LOW) — global progress (SessionTimer wv2-progress block). setsTotal =
  // sum planned sets; setsDone = current ordinal advancing through the session.
  //
  // Daniel smoke 2026-05-28 verbatim "logheaza setul + sar pauza, counter sta
  // la 1/17 in loc sa avanseze". The prior formula counted only LOGGED entries
  // (Σ history[*].length) — that bumps on rating, then freezes through rest +
  // skip-pause + the first half of the next set, advancing again only on the
  // NEXT rating. Visually the counter feels stuck between rate → skip-pause
  // even though you've clearly moved to the next set.
  //
  // Fix: align to the mockup `setIdx-1` flow that ALSO bumps when you start the
  // next set. We add 1 to the logged count while the user is on a not-yet-rated
  // set (phase=logging|idle|rating) and keep just the logged count during rest/
  // transition (one set finished, waiting for the timer or the swap delay).
  // Net effect through one set:
  //   logging set 1 (history=0) -> ordinal 1   (you're on set 1)
  //   rate set 1   (history=1, phase=rest)   -> ordinal 1 (set 1 done)
  //   skip pause   (history=1, phase=logging) -> ordinal 2 (now on set 2)
  //   rate set 2   (history=2, phase=rest)   -> ordinal 2 (set 2 done)
  // The bar fills smoothly each transition (rating OR skip-pause), matching
  // Daniel's intuition + mockup wv2 setIdx semantic.
  const setsTotal = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const loggedSoFar = Object.values(history).reduce((acc, sets) => acc + sets.length, 0);
  const isMidSet = phase === 'logging' || phase === 'idle' || phase === 'rating';
  // Clamp to setsTotal so the +1 doesn't overshoot on the very last set the
  // moment phase is still 'logging' but loggedSoFar already equals setsTotal-1
  // (the +1 is the in-progress set itself — fine; the clamp guards rare double-
  // count edges like a re-render race after the final navigate).
  const setsDone = Math.min(setsTotal, loggedSoFar + (isMidSet ? 1 : 0));

  return (
    <section
      className="min-h-screen relative"
      data-testid="workout"
      data-phase={phase}
    >
      <SessionTimer
        exerciseName={currentExercise.name}
        exIdx={safeExIdx}
        totalExercises={exercises.length}
        sessionStart={sessionStart}
        onExit={handleOpenExitSheet}
        // P-05 (MED) — wire ⋯ menu actions (SessionTimer construit dar necablat):
        // pain → pain-button, skip → advance/finish, finish-early → drill-down,
        // cancel → discard + Antrenor. onToggleSound nelegat intentionat (NU
        // exista subsistem sunet/vibratie de comutat — ar fi buton fals).
        onPain={handleGoPain}
        onSkipExercise={handleSkipExercise}
        onFinishEarly={handleGoFinishEarly}
        onCancelSession={handleCancelSession}
        // P-11 (LOW) — global progress bar (seturi cumulate + exercitiu curent).
        setsDone={setsDone}
        setsTotal={setsTotal}
        exerciseCount={safeExIdx + 1}
        exerciseTotal={exercises.length}
      />

      {/* Log zone */}
      {(phase === 'logging' || phase === 'idle' || phase === 'rating') && (
        <div className="p-6" data-testid="log-zone">
          {/* Pulse arc 2026-05-29 (blueprint C3-g) — live volume count-up chip.
              Σ kg×reps so far, mono-styled like the mockup header stat. Lives in
              the log-zone (re-renders per set) so SessionTimer's React.memo +
              perf isolation stay intact. aria-hidden: the number is ambient
              motivation, not a screen-reader announcement (sets/reps already
              read). */}
          <div className="flex items-center justify-between mb-4" aria-hidden="true">
            <Kicker color="var(--aqua)">
              {t('workout.progress.exercisesLabel_other', {
                done: safeExIdx + 1,
                total: exercises.length,
              })}
            </Kicker>
            <span className="font-mono text-[11px] text-ink3" data-testid="workout-live-volume">
              <span className="font-semibold" style={{ color: 'var(--aqua)' }}>
                {liveVolumeDisplay.toLocaleString('en-US')}
              </span>{' '}
              {t('workout.liveVolumeLabel')}
            </span>
          </div>

          {/* §F-workout-05 — current exercise name + "why this exercise?"
              help-circle (mockup andura-clasic.html#L1447-1451 wv2-exname →
              openWhyExercise). Surfaces whyEngine categorical explainer. */}
          <div className="mb-4" data-testid="wv2-exname">
            <Kicker color="var(--aqua)">{t('workout.currentExercise')}</Kicker>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="font-display text-2xl font-bold text-ink">{currentExercise.name}</h2>
              <button
                type="button"
                onClick={handleOpenWhy}
                aria-label={t('workout.whyAriaLabel')}
                data-testid="wv2-why-trigger"
                className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full"
                style={{
                  color: 'var(--aqua)',
                  background: 'color-mix(in oklab, var(--aqua) 16%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--aqua) 40%, transparent)',
                }}
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            {/* Subtitle (equipment/setup) under the exercise name per mockup
                andura-clasic.html#L1450 wv2-ex-sub. Rendered only cand the
                planned exercise carries a display sub (RO display map). */}
            {currentExercise.sub && (
              <p className="text-sm text-ink2 mt-0.5" data-testid="wv2-ex-sub">
                {currentExercise.sub}
              </p>
            )}
          </div>

          {/* Wave A4 (Daniel 2026-05-28 #11) — visual guidance for the current
              movement. Gigel mid-set needs to SEE the movement, not just read
              the Romanian name. ExerciseMedia 'card' variant is full-width
              16:9; today it renders the muscle-group placeholder + "Imagine
              in curand" honest copy (V2 asset sourcing decision Daniel-gated).
              Once URLs land in exerciseMedia.ts, this single component swaps
              to the live image/gif without code churn here. */}
          <div className="mb-4 animate-fade-in-up">
            <ExerciseMedia
              engineName={currentExercise.engineName ?? currentExercise.name}
              variant="card"
              testId="workout-exercise-media"
            />
          </div>

          {/* §F-workout-03 — in-workout substitution row (Daniel 2026-05-12
              Slice 1.7, mockup andura-clasic.html#L1457-1460 wv2-ex-actions).
              WP-5 moat: all three buttons produce an IN-PLACE named swap (toast
              with the alternative's name) instead of navigating away. "Aparat
              ocupat" → cascade excluding the busy machine; "Nu vreau" → ranked
              preference alternative + refusal counter; "Aparat lipsa" (Daniel
              smoke 2026-05-28 #17) → opens the 10-item picker sheet, persists
              wv2-missing-equipment (visible in Cont → AparateLipsa next mount),
              and recomposes the current exercise via resolveMissingSwap when
              the new list blocks its equipment. Three-column layout — labels
              kept short ("Lipsa") so the row stays single-line on Gigel's phone. */}
          <ExerciseActionsRow
            onOcupat={handleOcupat}
            onLipsa={handleOpenAparatLipsa}
            onNuVreau={handleNuVreau}
          />

          <p className="text-sm text-ink2 mb-2">
            {t('workout.setLabel', { current: currentSetIdx + 1, total: currentExercise.sets })}
          </p>

          {/* In-session responsive autoregulation notice. DP.checkInSessionAdjust
              eased/raised the NEXT set's target (reps in masa, weight in STRENGTH)
              from THIS set's rating + performance vs target; surfaced honestly so the
              change is never silent. role="status" announces the recalibration. */}
          {adjustNotice !== null && (
            <CoachNote testId="insession-adjust-notice" message={adjustNotice} />
          )}

          {/* First-session baseline note. No prior history for this exercise →
              per-set autoregulation has nothing to adapt from (checkInSessionAdjust
              returns {adjust:false}), so we explain WHY the targets are not adapting
              yet instead of leaving the user wondering. Shown only in the no-history
              case (NOT every set forever); hidden once an adjust notice surfaces. */}
          {noExerciseHistory && adjustNotice === null && (
            <CoachNote testId="baseline-note" message={t('workout.adjust.baselineNote')} />
          )}

          {/* Set history previous — re-skinned to the mockup .set-chip glowing
              done/active/pending progress row (interfata-noua/screens-workout.jsx
              L254-260). One chip per planned set: logged sets = filled volt +
              check (kg x reps x rating preserved as title/aria-label so the data
              is not lost), the current set glows (active), the rest are muted
              pending numbers. Logic + per-set testids (set-history-{i}) kept. */}
          <SetHistoryChips
            totalSets={currentExercise.sets}
            loggedSets={history[safeExIdx] ?? []}
            currentSetIdx={currentSetIdx}
            isBodyweight={currentExercise.isBodyweight ?? false}
          />

          {/* §F-pass2-setloginput-02 — mockup wv2 two-step (andura-clasic.html
              #L1463-1485). Pre-log `tinta` (target + Logheaza CTA) → post-log
              readonly "Tu ai facut..." + pencil revise + rating row. `editing`
              = pencil escape to editable inputs. */}
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

          {/* Rating row appears only after Logheaza (post-log) or while revising
              (editing). Pre-log tinta hides it per mockup wv2. */}
          {(setLogged || editing) && <SetRatingButtons onRate={handleLogSet} />}
        </div>
      )}

      {phase === 'rest' && (
        <RestOverlay
          countdownSec={restCountdown}
          initialRestSec={restInitialSec}
          onSkip={handleSkipRest}
          // §F-pass2-restoverlay-03 (MED Wave 11) — pass current exercise
          // name pentru contextual cue "Pauza · {name} recupereaza" mockup
          // pattern. Empty fallback when ai un workout fara nume (defensive).
          currentExerciseName={currentExercise.name}
        />
      )}

      {/* Transition phase — Wave C3 (2026-05-28): each line rolls/fades in with
          a small stagger so the next-exercise reveal feels intentional, not a
          static splash. The screen-level backdrop fades in, then the label,
          name, and coach line cascade. Auto-collapses under reduced motion. */}
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

      {/* Pulse arc 2026-05-29 (blueprint C3-c) — mid-session PR celebration,
          fired at the existing markPRHit moment in performLogSet. Transient +
          auto-dismissing (never traps focus, never permanently blocks exit);
          the PostSummary PR banner remains the durable record. Keyed on the
          exercise so back-to-back PRs each re-trigger the burst. */}
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
          // HIGH-CODE-05 fix: pass real workoutTitle NU hardcoded 'Push' lie.
          pauseSession(workoutTitle);
          navigate(gotoPath('antrenor'));
        }}
      />

      {/* Daniel smoke 2026-05-28 #17 — in-session Aparat lipsa picker. Saves
          to wv2-missing-equipment so Cont → AparateLipsa hydrates fresh on
          its next mount; if the new list blocks this exercise's equipment,
          handleAparatLipsaConfirm swaps it in-place (resolveMissingSwap). */}
      <AparatLipsaSheet
        open={aparatLipsaSheetOpen}
        onConfirm={handleAparatLipsaConfirm}
        onClose={handleCloseAparatLipsa}
      />

      {/* §F-workout-05 — why-exercise explainer bottom sheet. Mockup
          andura-clasic.html#L1449 openWhyExercise → whyEngine categorical
          summary. Backdrop tap or "Am inteles" closes. */}
      {whyText !== null && (
        <WhyExerciseModal
          whyText={whyText}
          exerciseName={currentExercise.name}
          dismissRef={whyDismissRef}
          onClose={() => setWhyText(null)}
        />
      )}
    </section>
  );
}
