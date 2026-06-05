// ══ SWAP PICK SHEET — founder redesign 2026-06-05 (manual short pick-list) ══
// Replaces the blind auto-swap with a SHORT decidable pick-list. When the user
// wants to replace the current exercise (Aparat ocupat / Nu vreau), this sheet
// slides up over the log zone with a ranked 4-5 row list of same-muscle
// alternatives (active CORE_AUTO pool minus today's session). Row 1 is the
// pre-selected SMART pick (highest-effectiveness, genuinely-distinct match);
// rows 2-5 are ranked by effectiveness; EXACTLY one is the universal bodyweight
// fallback (when the muscle has one). A visually-separated LAST row drops the
// whole exercise from today's session (not a swap — removal, recoverable later).
//
// Stateless WRT swap logic: the parent (Workout via useWorkoutSwap) computes the
// rows (substitution.resolveSwapPickList) and owns the pick/drop handlers. This
// component only renders + fires. Sister focus/Escape pattern to AparatLipsaSheet
// / ExitConfirmSheet (a11y parity). NO_DIACRITICS_RULE on all copy.

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { Check, Dumbbell, Trash2 } from 'lucide-react';
import type { SwapPickRow } from '../../lib/substitution';
import { t } from '../../../i18n/index.js';

interface SwapPickSheetProps {
  open: boolean;
  /** RO muscle-group label for the header. */
  muscleGroup: string;
  /** RO display name of the exercise being replaced. */
  originalName: string;
  /** Ranked rows (row 0 = pre-pick). Empty → the empty-state copy. */
  rows: readonly SwapPickRow[];
  /** Pick a row → swap the current exercise in-place. */
  onPick: (row: SwapPickRow) => void;
  /** Drop the whole exercise from today's session (recoverable). */
  onDrop: () => void;
  /** Dismiss without changing anything. */
  onClose: () => void;
}

export function SwapPickSheet({
  open,
  muscleGroup,
  originalName,
  rows,
  onPick,
  onDrop,
  onClose,
}: SwapPickSheetProps): JSX.Element | null {
  const firstActionRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Focus management + Escape close + restore focus (sister AparatLipsaSheet).
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    firstActionRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
      data-testid="swap-pick-sheet-backdrop"
      onClick={onClose}
    >
      <div
        className="animate-slide-up bg-paper rounded-t-2xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
        data-testid="swap-pick-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('workout.swap.pickTitle', { group: muscleGroup })}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ink mb-1">
          {t('workout.swap.pickTitle', { group: muscleGroup })}
        </h2>
        <p className="text-sm text-ink2 mb-4">
          {t('workout.swap.pickSubtitle', { original: originalName })}
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-ink2 mb-2" data-testid="swap-pick-empty">
            {t('workout.swap.pickEmpty', { group: muscleGroup })}
          </p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {rows.map((row, idx) => {
              const isPre = row.prePick;
              return (
                <button
                  key={row.engineName}
                  ref={idx === 0 ? firstActionRef : undefined}
                  type="button"
                  onClick={() => onPick(row)}
                  data-testid={`swap-pick-row-${idx}`}
                  data-prepick={isPre ? 'true' : 'false'}
                  className={
                    isPre
                      ? 'flex items-center gap-3 p-3 rounded-xl border-2 bg-brick/10 border-brick text-ink text-left'
                      : 'pulse-card pulse-card-tight flex items-center gap-3 p-3 text-ink text-left'
                  }
                >
                  {isPre ? (
                    <Check className="w-5 h-5 shrink-0 text-brick" aria-hidden="true" />
                  ) : row.isBodyweight ? (
                    <Dumbbell className="w-5 h-5 shrink-0 text-ink3" aria-hidden="true" />
                  ) : (
                    <span className="w-5 h-5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{row.displayName}</span>
                    {(isPre || row.isBodyweight) && (
                      <span className="block text-xs text-ink3">
                        {isPre
                          ? t('workout.swap.pickRecommended')
                          : t('workout.swap.pickBodyweight')}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ROW 6 — visually separated: DROP the whole exercise (not a swap). */}
        <div className="border-t border-line pt-3 mt-1">
          <button
            type="button"
            onClick={onDrop}
            data-testid="swap-pick-drop"
            className="w-full flex items-center gap-3 p-3 rounded-xl text-brick text-left"
          >
            <Trash2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-sm font-medium">{t('workout.swap.pickDrop')}</span>
              <span className="block text-xs text-brick/70">{t('workout.swap.pickDropHint')}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            data-testid="swap-pick-cancel"
            className="w-full py-2 mt-1 text-sm text-ink2"
          >
            {t('workout.swap.pickCancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
