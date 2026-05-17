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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { ExerciseHistoryEntry } from '../../../stores/workoutStore';
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout } from '../../../lib/engineWrappers';
import type { PlannedExercise } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';

// Phase 4 task_10 fallback — used cand engineWrappers.getTodayWorkout returns
// null (engine throw / DB unavailable). Mockup wv2 reference Push session
// preserved verbatim pentru consistency.
const WV2_FALLBACK: readonly PlannedExercise[] = [
  { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
  { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
  { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
  { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
];

type SetRating = ExerciseHistoryEntry['rating'];

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Workout(): JSX.Element {
  const navigate = useNavigate();
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const phase = useWorkoutStore((s) => s.phase);
  const history = useWorkoutStore((s) => s.history);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const startSession = useWorkoutStore((s) => s.startSession);
  const logSet = useWorkoutStore((s) => s.logSet);
  const setPhase = useWorkoutStore((s) => s.setPhase);
  const advanceExercise = useWorkoutStore((s) => s.advanceExercise);
  const pauseSession = useWorkoutStore((s) => s.pauseSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);

  // Phase 4 task_10: wire engineWrappers.getTodayWorkout planned aggregate;
  // fallback la WV2_FALLBACK cand null (engine throw / DB unavailable).
  // useMemo stable reference pe re-render (planned changes doar la session
  // start, NU per-frame).
  const exercises = useMemo<readonly PlannedExercise[]>(() => {
    const planned = getTodayWorkout();
    return planned?.exercises ?? WV2_FALLBACK;
  }, []);

  // Bound exIdx în caz session state contamination (NU index past array).
  const safeExIdx = Math.min(exIdx, exercises.length - 1);
  const currentExercise = exercises[safeExIdx];
  const currentSetIdx = history[safeExIdx]?.length ?? 0;
  const isLastSetOfExercise = currentSetIdx + 1 >= currentExercise.sets;
  const isLastExercise = safeExIdx + 1 >= exercises.length;

  const [kgInput, setKgInput] = useState<number>(currentExercise.targetKg);
  const [repsInput, setRepsInput] = useState<number>(currentExercise.targetReps);
  const [elapsed, setElapsed] = useState(0);
  const [restCountdown, setRestCountdown] = useState(0);
  const [exitSheetOpen, setExitSheetOpen] = useState(false);

  // Init session on mount cand idle (no paused snapshot resumed via Antrenor).
  useEffect(() => {
    if (phase === 'idle') startSession(Date.now());
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
  useEffect(() => {
    interface WakeLockSentinel {
      release: () => Promise<void>;
    }
    interface NavigatorWithWakeLock {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
    }
    let lock: WakeLockSentinel | null = null;
    const nav = navigator as unknown as NavigatorWithWakeLock;
    if (nav.wakeLock) {
      nav.wakeLock
        .request('screen')
        .then((sentinel) => {
          lock = sentinel;
        })
        .catch(() => {
          /* fail silent */
        });
    }
    return () => {
      if (lock) {
        lock.release().catch(() => {
          /* fail silent */
        });
      }
    };
  }, []);

  // Reset kg/reps inputs when advancing exercise.
  useEffect(() => {
    setKgInput(currentExercise.targetKg);
    setRepsInput(currentExercise.targetReps);
  }, [safeExIdx, currentExercise.targetKg, currentExercise.targetReps]);

  function handleLogSet(rating: SetRating): void {
    logSet(safeExIdx, { kg: kgInput, reps: repsInput, rating });
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
    setPhase('rest');
  }

  function handleSkipRest(): void {
    setRestCountdown(0);
    setPhase('logging');
  }

  function handleExit(action: 'continue' | 'pause' | 'discard'): void {
    if (action === 'continue') {
      setExitSheetOpen(false);
      return;
    }
    if (action === 'pause') {
      pauseSession();
      navigate(gotoPath('antrenor'));
      return;
    }
    discardSession();
    navigate(gotoPath('antrenor'));
  }

  const nextExercise = exercises[safeExIdx + 1];

  return (
    <section
      className="bg-paper min-h-screen relative"
      data-testid="workout"
      data-phase={phase}
    >
      {/* Header */}
      <header className="sticky top-0 bg-paper border-b border-line p-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-base font-semibold text-ink" data-testid="workout-title">
            {currentExercise.name}
          </h1>
          <p className="text-sm text-ink2" data-testid="workout-progress">
            Ex {safeExIdx + 1}/{exercises.length}{' '}
            <span data-testid="workout-elapsed">· {formatMMSS(elapsed)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExitSheetOpen(true)}
          aria-label="Iesi din sesiune"
          data-testid="workout-exit-trigger"
          className="p-2 rounded-full text-ink2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

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

          {/* Input current set */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <label className="text-sm text-ink2 block mb-1" htmlFor="kg-input">
                Kg
              </label>
              <input
                id="kg-input"
                type="number"
                value={kgInput}
                onChange={(e) => setKgInput(Number(e.target.value))}
                data-testid="kg-input"
                className="w-full p-3 border border-[var(--line-strong)] rounded-xl bg-paper2"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-ink2 block mb-1" htmlFor="reps-input">
                Reps
              </label>
              <input
                id="reps-input"
                type="number"
                value={repsInput}
                onChange={(e) => setRepsInput(Number(e.target.value))}
                data-testid="reps-input"
                className="w-full p-3 border border-[var(--line-strong)] rounded-xl bg-paper2"
              />
            </div>
          </div>

          {/* Rating 3-button RO */}
          <p className="text-base text-ink mb-3">Cum a fost setul?</p>
          <div className="flex gap-3" role="list" aria-label="Rating set">
            <button
              type="button"
              onClick={() => handleLogSet('usor')}
              data-rating="usor"
              className="flex-1 py-3 bg-paper2 border border-[var(--line-strong)] rounded-xl text-ink"
            >
              Usor
            </button>
            <button
              type="button"
              onClick={() => handleLogSet('potrivit')}
              data-rating="potrivit"
              className="flex-1 py-3 bg-paper2 border border-[var(--line-strong)] rounded-xl text-ink"
            >
              Potrivit
            </button>
            <button
              type="button"
              onClick={() => handleLogSet('greu')}
              data-rating="greu"
              className="flex-1 py-3 bg-paper2 border border-[var(--line-strong)] rounded-xl text-ink"
            >
              Greu
            </button>
          </div>
        </div>
      )}

      {/* Rest overlay */}
      {phase === 'rest' && (
        <div
          className="fixed inset-0 bg-paper/95 flex flex-col items-center justify-center z-50"
          data-testid="rest-overlay"
          role="dialog"
          aria-label="Pauza activa"
        >
          <p className="text-sm text-ink2 mb-2">Pauza</p>
          <p
            className="text-6xl font-bold text-ink font-mono"
            data-testid="rest-countdown"
          >
            {formatMMSS(restCountdown)}
          </p>
          <button
            type="button"
            onClick={handleSkipRest}
            data-testid="rest-skip"
            className="mt-6 px-6 py-3 bg-brick text-paper rounded-xl text-base font-semibold"
          >
            Sari pauza
          </button>
        </div>
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
            „{coachPick('endExercise', undefined, 0)}"
          </p>
        </div>
      )}

      {/* Exit confirm bottom sheet */}
      {exitSheetOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-end justify-center z-50"
          data-testid="exit-sheet-backdrop"
        >
          <div
            className="bg-paper rounded-t-2xl p-6 w-full max-w-md"
            data-testid="exit-sheet"
            role="dialog"
            aria-label="Iesi din sesiune"
          >
            <h2 className="text-base font-bold text-ink mb-2">Iesi din sesiune?</h2>
            <p className="text-sm text-ink2 mb-4">
              Ai facut {safeExIdx}/{exercises.length} exercitii. Cum continui?
            </p>
            <button
              type="button"
              onClick={() => handleExit('continue')}
              data-testid="exit-continue"
              className="w-full py-3 bg-ink text-paper rounded-xl text-base font-semibold mb-2"
            >
              Continui sesiunea
            </button>
            <button
              type="button"
              onClick={() => handleExit('pause')}
              data-testid="exit-pause"
              className="w-full py-3 bg-paper2 border border-[var(--line-strong)] rounded-xl text-ink text-base font-semibold mb-2"
            >
              Salveaza si reia mai tarziu
            </button>
            <button
              type="button"
              onClick={() => handleExit('discard')}
              data-testid="exit-discard"
              className="w-full py-2 text-brick text-sm"
            >
              Renunt la sesiune
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
