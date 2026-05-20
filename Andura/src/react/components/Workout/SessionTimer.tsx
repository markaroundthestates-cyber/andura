// ══ SESSION TIMER — Workout Header Zone Component ════════════════════════
// Phase 4 task_12 §A extract din Workout.tsx ~lines 196-222. Pure
// presentational — sticky header cu workout title + Ex N/M progress +
// elapsed MM:SS + X close button.
//
// Stateless: parent Workout.tsx owns state (exIdx, elapsed, exitSheetOpen)
// + side effects (timer interval, exit handler).
//
// data-testid preserved verbatim pentru Workout.test.tsx 31 baseline tests
// compat (workout-title / workout-progress / workout-elapsed / workout-exit-
// trigger + role="button" aria-label "Iesi din sesiune").

import type { JSX } from 'react';
import { X } from 'lucide-react';
import { formatMMSS } from '../../lib/format';

interface SessionTimerProps {
  exerciseName: string;
  exIdx: number; // 0-indexed
  totalExercises: number;
  elapsedSec: number;
  onExit: () => void;
}

export function SessionTimer({
  exerciseName,
  exIdx,
  totalExercises,
  elapsedSec,
  onExit,
}: SessionTimerProps): JSX.Element {
  return (
    <header className="sticky top-0 bg-paper border-b border-line p-4 flex items-center justify-between z-10">
      <div>
        <h1 className="text-base font-semibold text-ink" data-testid="workout-title">
          {exerciseName}
        </h1>
        <p className="text-sm text-ink2" data-testid="workout-progress">
          Ex {exIdx + 1}/{totalExercises}{' '}
          <span data-testid="workout-elapsed">· {formatMMSS(elapsedSec)}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onExit}
        aria-label="Iesi din sesiune"
        data-testid="workout-exit-trigger"
        className="p-2 rounded-full text-ink2"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
    </header>
  );
}
