// ══ EXIT CONFIRM SHEET — Workout Bottom Sheet 3-Option Component ════════
// Phase 4 task_12 §A extract din Workout.tsx exit sheet (~lines 290-330
// prior). Pure presentational — fixed backdrop + bottom sheet cu 3 buttons
// (Continui / Salveaza / Renunt) + dynamic progress copy.
//
// Stateless: parent Workout.tsx owns exitSheetOpen state + onChoose handler
// (continue closes sheet, pause invokes pauseSession + navigate antrenor,
// discard invokes discardSession + navigate antrenor).
//
// Conditional render via `open` prop INSIDE JSX (NU early-return null per
// task_12 §A item 5 spec preserve pattern current Workout.tsx).
//
// data-testid + role="dialog" aria-label "Iesi din sesiune" preserved
// verbatim pentru Workout.test.tsx 38 baseline tests preserve.

import type { JSX } from 'react';

export type ExitAction = 'continue' | 'pause' | 'discard';

interface ExitConfirmSheetProps {
  open: boolean;
  exIdx: number; // 0-indexed (progress display "Ai facut {exIdx}/{total}")
  totalExercises: number;
  onChoose: (action: ExitAction) => void;
}

export function ExitConfirmSheet({
  open,
  exIdx,
  totalExercises,
  onChoose,
}: ExitConfirmSheetProps): JSX.Element | null {
  if (!open) return null;
  return (
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
          Ai facut {exIdx}/{totalExercises} exercitii. Cum continui?
        </p>
        <button
          type="button"
          onClick={() => onChoose('continue')}
          data-testid="exit-continue"
          className="w-full py-3 bg-ink text-paper rounded-xl text-base font-semibold mb-2"
        >
          Continui sesiunea
        </button>
        <button
          type="button"
          onClick={() => onChoose('pause')}
          data-testid="exit-pause"
          className="w-full py-3 bg-paper2 border border-[var(--line-strong)] rounded-xl text-ink text-base font-semibold mb-2"
        >
          Salveaza si reia mai tarziu
        </button>
        <button
          type="button"
          onClick={() => onChoose('discard')}
          data-testid="exit-discard"
          className="w-full py-2 text-brick text-sm"
        >
          Renunt la sesiune
        </button>
      </div>
    </div>
  );
}
