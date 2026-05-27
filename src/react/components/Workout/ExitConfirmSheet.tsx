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
// W4-AUDIT-DEEPER chat 5 HIGH a11y DIM 3 KEYBOARD fix:
//   - aria-modal="true" + aria-labelledby (sister MedicalDisclaimerModal +
//     AaFrictionModal pattern parity)
//   - useEffect focus auto pe primary "Continua sesiunea" la open
//   - useEffect Escape key → onChoose('continue') (safe close — sheet
//     dismiss handler same path as backdrop tap)
//   - Focus trap minimal — Tab cycles first ↔ last button (continue =
//     first, discard = last)
//   - previousFocusRef restore focus la invoker on close
//   - Backdrop tap preserved 'continue' (bottom-sheet UX convention,
//     'continue' IS safe close — handleExit Workout.tsx setExitSheetOpen
//     false + return, NU destructive). Test ExitConfirmSheet LOW-3
//     preserve backdrop tap = continue semantic.

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';

export type ExitAction = 'continue' | 'pause' | 'discard' | 'finish-early';

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
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const discardRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // W4-AUDIT-DEEPER chat 5 HIGH a11y — focus management + Escape close +
  // focus trap. Pattern parity sister AaFrictionModal/MedicalDisclaimerModal.
  // Continue = primary safe action — auto focus + Tab trap first/last cycle.
  // Escape → continue (safe close, same path backdrop tap).
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    continueRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onChoose('continue');
        return;
      }
      if (e.key !== 'Tab') return;
      const first = continueRef.current;
      const last = discardRef.current;
      if (!first || !last) return;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus();
    };
  }, [open, onChoose]);

  if (!open) return null;
  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
      data-testid="exit-sheet-backdrop"
      onClick={() => onChoose('continue')}
    >
      <div
        className="animate-slide-up bg-paper rounded-t-2xl pt-4 px-6 pb-6 w-full max-w-md"
        data-testid="exit-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="exit-sheet-title"
          className="text-base font-bold text-ink mb-2"
        >
          Iesi din sesiune?
        </h2>
        <p className="text-sm text-ink2 mb-4">
          Ai facut {exIdx}/{totalExercises} exercitii. Cum continui?
        </p>
        <button
          ref={continueRef}
          type="button"
          onClick={() => onChoose('continue')}
          data-testid="exit-continue"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2 transition-transform active:scale-[.97]"
        >
          Continua sesiunea
        </button>
        <button
          type="button"
          onClick={() => onChoose('pause')}
          data-testid="exit-pause"
          className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold mb-2"
        >
          Salveaza si reia mai tarziu
        </button>
        <button
          type="button"
          onClick={() => onChoose('finish-early')}
          data-testid="exit-finish-early"
          className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold mb-2"
        >
          Termina mai devreme
        </button>
        <button
          ref={discardRef}
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
