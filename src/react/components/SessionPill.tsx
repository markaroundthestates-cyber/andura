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
import { useWorkoutStore, getCurrentMode } from '../stores/workoutStore';
import { getTodayWorkout } from '../lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../lib/engineWrappers';
import { gotoPath } from '../lib/navigation';

const WORKOUT_PATH = gotoPath('workout');

export function SessionPill(): JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  // §44-C1 — derive tagged WorkoutModeView inline via getCurrentMode pure
  // selector. Subscribe to primitive fields (stable refs) — calling
  // getCurrentMode at Zustand selector level returns new object identity each
  // render and triggers infinite re-render loop. Pattern: subscribe to inputs,
  // compute tagged view in render body.
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const mode = getCurrentMode({
    phase,
    sessionStart,
    pausedSnapshot,
    lastSession,
    exIdx,
  });

  const [elapsedMin, setElapsedMin] = useState(0);

  // Phase 6 task_02 Option C: async getTodayWorkout — useState fallback null
  // during loading; pill displays "Sesiune" label while pending. Pill still
  // renders (active session). On resolve, planned updates → re-render with
  // real exercise name. Per DECISIONS.md §D027.
  const [planned, setPlanned] = useState<PlannedWorkoutOutput | null>(null);

  // Live elapsed update 1Hz cand mode=active|resting (live session).
  const liveSessionStart =
    mode.kind === 'active' || mode.kind === 'resting' ? mode.sessionStart : null;
  useEffect(() => {
    if (liveSessionStart === null) {
      setElapsedMin(0);
      return;
    }
    const update = (): void => {
      setElapsedMin(Math.floor((Date.now() - liveSessionStart) / 60000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [liveSessionStart]);

  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((p) => {
      if (!cancelled) setPlanned(p);
    });
    return () => { cancelled = true; };
  }, []);

  // Anti-duplicate route guard.
  if (location.pathname === WORKOUT_PATH) return null;

  // §44-C1 exhaustive switch on tagged mode — render only for active/resting
  // (live session pill) sau paused (resume hatch). idle + finished → null.
  let active = false;
  let paused = false;
  switch (mode.kind) {
    case 'active':
    case 'resting':
      active = true;
      break;
    case 'paused':
      paused = true;
      break;
    case 'idle':
    case 'finished':
      break;
    default: {
      const _exhaustive: never = mode;
      void _exhaustive;
    }
  }

  if (!active && !paused) return null;

  // Phase 4 demo: derive workout title + exercise name din planned aggregate.
  // Fallback "Sesiune" cand engine returns null or still loading.
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
      className="app-fixed-column app-fixed-column--inset fixed bottom-[80px] z-[55] flex items-center gap-2.5 px-4 py-2.5 bg-brick text-paper rounded-full text-sm font-semibold shadow-lg"
    >
      <Play className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-hidden="true" />
    </button>
  );
}
