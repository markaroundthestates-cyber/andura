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
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore, getCurrentMode } from '../../../stores/workoutStore';
import type { ExerciseHistoryEntry } from '../../../stores/workoutStore';
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout, getPRDelta } from '../../../lib/engineWrappers';
import type { PlannedExercise } from '../../../lib/engineWrappers';
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

const INACTIVITY_THRESHOLD_MIN = 7; // Mockup wv2 verbatim L4401
const INACTIVITY_CHECK_INTERVAL_MS = 30_000; // Mockup wv2 verbatim L4404

// Phase 4 task_17: WV2_FALLBACK retired. Workout consumer of
// engineWrappers.getTodayWorkout direct — empty state cand null (engine
// throw / DB unavailable / no planned workout today). Phase 5+ scheduleAdapter
// real aggregate replaces PHASE_4_DEMO_PUSH în engineWrappers.

type SetRating = ExerciseHistoryEntry['rating'];

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

  // Phase 6 task_02 Option C: async getTodayWorkout — 3-state useState pattern
  // per DECISIONS.md §D027 (null=loading, []=empty/rest day, [...]=session).
  const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
  // HIGH-CODE-05 fix: capture real workoutTitle pentru pauseSession truth.
  // Empty string default cand engine null/loading → store fallback la
  // '(sesiune nedefinita)' explicit marker NU 'Push' lie.
  const [workoutTitle, setWorkoutTitle] = useState<string>('');
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((planned) => {
      if (!cancelled) {
        setExercises(planned?.exercises ?? []);
        setWorkoutTitle(planned?.workoutTitle ?? '');
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
  const currentSetIdx = hasWorkout ? history[safeExIdx]?.length ?? 0 : 0;
  const isLastSetOfExercise =
    hasWorkout && currentSetIdx + 1 >= currentExercise.sets;
  const isLastExercise = hasWorkout && exercises !== null && safeExIdx + 1 >= exercises.length;

  const [kgInput, setKgInput] = useState<number>(currentExercise.targetKg);
  const [repsInput, setRepsInput] = useState<number>(currentExercise.targetReps);
  const [elapsed, setElapsed] = useState(0);
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

  // Session timer — increments per second cand sessionStart set.
  useEffect(() => {
    if (sessionStart === null) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

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

  // Reset kg/reps inputs when advancing exercise.
  useEffect(() => {
    setKgInput(currentExercise.targetKg);
    setRepsInput(currentExercise.targetReps);
  }, [safeExIdx, currentExercise.targetKg, currentExercise.targetReps]);

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

  const bumpActivity = (): void => {
    setLastActivityAt(Date.now());
    setInactivityPromptOpen(false);
  };

  function performLogSet(rating: SetRating): void {
    logSet(safeExIdx, { kg: kgInput, reps: repsInput, rating });

    // Phase 4 task_10: PR detection wire — call engineWrappers.getPRDelta
    // post logSet. Compose history for engine (per-exercise flat list cu
    // baseline + previous sets). markPRHit propagates flag + prData la
    // PostSummary F11 banner (Trophy lucide + exercise name + deltaKg).
    const exerciseName = currentExercise.name;
    const exerciseHistory =
      history[safeExIdx]?.map((h) => ({
        ex: exerciseName,
        w: h.kg,
        reps: h.reps,
      })) ?? [];
    const delta = getPRDelta(
      exerciseName,
      { w: kgInput, reps: repsInput },
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
    const check = detectAggressiveLoad(samples, {
      kg: kgInput,
      reps: repsInput,
      timestamp: Date.now(),
    }, thresholds);
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

  function handleExit(action: 'continue' | 'pause' | 'discard' | 'finish-early'): void {
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
    discardSession();
    navigate(gotoPath('antrenor'));
  }

  // Phase 6 task_02 Option C: loading state pe async pipeline resolve
  // (exercises===null → 8-adapter chain pending). Per DECISIONS.md §D027.
  // Early return must precede exercises[index] access — TS strict guard.
  if (exercises === null) {
    return (
      <section
        className="bg-paper min-h-screen p-6 flex flex-col items-center justify-center text-center"
        data-testid="workout"
        data-phase="loading"
      >
        <p className="text-sm text-ink2" data-testid="workout-loading">
          Se incarca antrenamentul...
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
        className="bg-paper min-h-screen p-6 flex flex-col items-center justify-center text-center"
        data-testid="workout"
        data-phase="empty"
      >
        <h1 className="text-2xl font-bold text-ink mb-2">
          Astazi e zi de odihna
        </h1>
        <p className="text-sm text-ink2 mb-6" data-testid="workout-empty-body">
          Nu ai antrenament programat azi. Foloseste calendarul de mai sus daca vrei sa schimbi programul.
        </p>
        <button
          type="button"
          onClick={() => navigate(gotoPath('antrenor'))}
          data-testid="workout-empty-back"
          className="px-6 py-3 bg-brick text-paper rounded-[14px] text-base font-semibold"
        >
          Inapoi
        </button>
      </section>
    );
  }

  // Past empty/loading guard — exercises is non-null array.
  const nextExercise = exercises[safeExIdx + 1];

  return (
    <section
      className="bg-paper min-h-screen relative"
      data-testid="workout"
      data-phase={phase}
    >
      <SessionTimer
        exerciseName={currentExercise.name}
        exIdx={safeExIdx}
        totalExercises={exercises.length}
        elapsedSec={elapsed}
        onExit={() => setExitSheetOpen(true)}
      />

      {/* Log zone */}
      {(phase === 'logging' || phase === 'idle' || phase === 'rating') && (
        <div className="p-6" data-testid="log-zone">
          <p className="text-sm text-ink2 mb-2">
            Set {currentSetIdx + 1}/{currentExercise.sets}
          </p>

          {/* Set history previous */}
          <div className="mb-4" data-testid="set-history">
            {(history[safeExIdx] ?? []).map((h, i) => (
              <div
                key={i}
                className="flex justify-between p-2 text-ink2 text-sm"
                data-testid={`set-history-${i}`}
              >
                <span>Set {i + 1}</span>
                <span>
                  {h.kg} kg x {h.reps} reps - {h.rating}
                </span>
              </div>
            ))}
          </div>

          <SetLogInput
            kg={kgInput}
            reps={repsInput}
            onKgChange={(n) => {
              bumpActivity();
              setKgInput(n);
            }}
            onRepsChange={(n) => {
              bumpActivity();
              setRepsInput(n);
            }}
          />

          <SetRatingButtons onRate={handleLogSet} />
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

      {/* Transition phase */}
      {phase === 'transition' && (
        <div
          className="fixed inset-0 bg-paper flex flex-col items-center justify-center z-40"
          data-testid="transition-screen"
          role="status"
          aria-label="Urmatorul exercitiu"
        >
          <p className="text-2xl font-semibold text-ink mb-2">Urmatorul:</p>
          <p className="text-base text-ink2" data-testid="transition-next-name">
            {nextExercise?.name ?? '—'}
          </p>
          <p className="text-sm text-ink2 mt-4 italic font-serif">
            „{coachPick('transition', undefined, 0)}"
          </p>
        </div>
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

      <InactivityPrompt
        open={inactivityPromptOpen}
        onContinue={bumpActivity}
        onSaveExit={() => {
          // HIGH-CODE-05 fix: pass real workoutTitle NU hardcoded 'Push' lie.
          pauseSession(workoutTitle);
          navigate(gotoPath('antrenor'));
        }}
      />
    </section>
  );
}
