// ══ SESSION PILL — Global Mini-Player Cross-Tab Persistence ══════════════
// Phase 4 task_13 §A — sticky pill rendered above BottomNav cand workoutStore
// .phase ≠ 'idle' AND current route ≠ workout (anti-duplicate). Tap → resume
// la /app/antrenor/workout. Read-only consumer (NU mutate store), self-managed
// 1Hz elapsed interval.
//
// Mockup ref: andura-clasic.html#L105-127 .session-pill brick background sticky
// bottom + L2522 #session-mini-player markup. Phase 4 simplified copy:
// "{exerciseName} · {elapsed} min" (active) sau "Reia sesiunea curenta" verbatim
// aria-label mockup (paused snapshot).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics
//   - mockup andura-clasic.html FIX 6 mini-player 2026-05-11

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { useWorkoutStore } from '../stores/workoutStore';
import { getTodayWorkout } from '../lib/engineWrappers';
import { gotoPath } from '../lib/navigation';

const WORKOUT_PATH = gotoPath('workout');

export function SessionPill(): JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);

  const [elapsedMin, setElapsedMin] = useState(0);

  // Live elapsed update 1Hz cand active sessionStart present.
  useEffect(() => {
    if (sessionStart === null) {
      setElapsedMin(0);
      return;
    }
    const update = (): void => {
      setElapsedMin(Math.floor((Date.now() - sessionStart) / 60000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Anti-duplicate route guard.
  if (location.pathname === WORKOUT_PATH) return null;

  // Active session pill.
  const active = phase !== 'idle' && sessionStart !== null;
  // Paused pill (resume hatch).
  const paused = !active && pausedSnapshot !== null;

  if (!active && !paused) return null;

  // Phase 4 demo: derive workout title + exercise name din planned aggregate.
  // Fallback "Sesiune" cand engine returns null.
  const planned = getTodayWorkout();
  const currentExerciseName =
    planned?.exercises[Math.min(exIdx, (planned?.exercises.length ?? 1) - 1)]?.name ?? 'Sesiune';

  const label = paused
    ? 'Reia sesiunea curenta'
    : `${currentExerciseName} · ${elapsedMin} min`;

  function handleTap(): void {
    navigate(WORKOUT_PATH);
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      data-testid="session-pill"
      data-state={active ? 'active' : 'paused'}
      aria-label="Reia sesiunea curenta"
      className="fixed left-3 right-3 bottom-[80px] z-[55] flex items-center gap-2.5 px-4 py-2.5 bg-brick text-paper rounded-full text-sm font-semibold shadow-lg"
    >
      <Play className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-hidden="true" />
    </button>
  );
}
