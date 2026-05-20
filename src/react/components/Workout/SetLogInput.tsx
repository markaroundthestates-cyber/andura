// ══ SET LOG INPUT — Workout kg/reps Inputs Component ═════════════════════
// Phase 4 task_12 §A extract din Workout.tsx log zone kg/reps inputs (~lines
// 178-205 prior). Pure presentational — 2 controlled number inputs cu
// labels + ids.
//
// Stateless: parent Workout.tsx owns kgInput/repsInput state + onKgChange/
// onRepsChange handlers (setKgInput(Number(e.target.value)) etc.).
//
// data-testid preserved verbatim (kg-input / reps-input) + htmlFor/id label
// associations pentru Workout.test.tsx baseline preserve + a11y compliance.

import type { JSX } from 'react';

interface SetLogInputProps {
  kg: number;
  reps: number;
  onKgChange: (n: number) => void;
  onRepsChange: (n: number) => void;
}

export function SetLogInput({
  kg,
  reps,
  onKgChange,
  onRepsChange,
}: SetLogInputProps): JSX.Element {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1">
        <label className="text-sm text-ink2 block mb-1" htmlFor="kg-input">
          Kg
        </label>
        <input
          id="kg-input"
          type="number"
          value={kg}
          onChange={(e) => onKgChange(Number(e.target.value))}
          data-testid="kg-input"
          className="w-full p-3 border border-lineStrong rounded-xl bg-paper2"
        />
      </div>
      <div className="flex-1">
        <label className="text-sm text-ink2 block mb-1" htmlFor="reps-input">
          Reps
        </label>
        <input
          id="reps-input"
          type="number"
          value={reps}
          onChange={(e) => onRepsChange(Number(e.target.value))}
          data-testid="reps-input"
          className="w-full p-3 border border-lineStrong rounded-xl bg-paper2"
        />
      </div>
    </div>
  );
}
