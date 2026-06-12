// ══ MISSING EQUIPMENT CONFIRM SHEET — founder Busy/Missing redesign 2026-06-12 ══
// Replaces the old in-session 10-item "Aparat lipsa" PICKER with a small anti-
// misclick CONFIRM. A stray tap on "Aparat lipsa" mid-set must not silently teach
// the coach that the user lacks a machine — so the user confirms first. On confirm
// the parent (Workout via useWorkoutSwap) PERSISTS this exercise as equipment-
// missing (so future sessions exclude it; reversible only in Account › Echipament
// lipsa) and AUTO-REPLACES it now with the best same-muscle alternative. NO list
// here — the only management surface is the Account list.
//
// Sister focus/Escape pattern to SwapPickSheet / AparatLipsaSheet / ExitConfirmSheet
// (a11y parity). NO_DIACRITICS_RULE on all copy.

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { PackageX } from 'lucide-react';
import { t } from '../../../i18n/index.js';

interface MissingEquipmentConfirmSheetProps {
  open: boolean;
  /** RO display name of the exercise whose equipment the user is marking missing. */
  exerciseName: string;
  /** Confirm: remember the absence + auto-replace. */
  onConfirm: () => void;
  /** Dismiss without remembering anything. */
  onCancel: () => void;
}

export function MissingEquipmentConfirmSheet({
  open,
  exerciseName,
  onConfirm,
  onCancel,
}: MissingEquipmentConfirmSheetProps): JSX.Element | null {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Focus management + Escape (= cancel, the safe action) + focus trap + restore
  // focus on close — sister ExitConfirmSheet. Cancel is the safe default so it
  // gets initial focus (an accidental Enter cancels, never confirms).
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const first = cancelRef.current;
      const last = confirmRef.current;
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
      prevFocusRef.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
      data-testid="missing-confirm-backdrop"
      onClick={onCancel}
    >
      <div
        className="animate-slide-up bg-paper rounded-t-2xl pt-4 px-6 pb-6 w-full max-w-md"
        data-testid="missing-confirm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missing-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="missing-confirm-title"
          className="flex items-center gap-2 text-base font-bold text-ink mb-2"
        >
          <PackageX className="w-5 h-5 shrink-0 text-brick" aria-hidden="true" />
          {t('workout.missingConfirm.title')}
        </h2>
        <p className="text-sm text-ink2 mb-4">
          {t('workout.missingConfirm.body', { name: exerciseName })}
        </p>
        <button
          ref={confirmRef}
          type="button"
          onClick={onConfirm}
          data-testid="missing-confirm-yes"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2 transition-transform active:scale-[.97]"
        >
          {t('workout.missingConfirm.confirmCta')}
        </button>
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          data-testid="missing-confirm-cancel"
          className="w-full py-2 text-ink2 text-sm"
        >
          {t('workout.missingConfirm.cancelCta')}
        </button>
      </div>
    </div>
  );
}
