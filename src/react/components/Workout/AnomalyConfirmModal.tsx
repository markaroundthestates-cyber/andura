// ══ BUILD #5/A — anomaly / fat-finger confirm modal (F4 spec §A) ═════════════
// Surfaces the engine's sanityCheckSet result as a blocking confirm sheet,
// alongside the existing per-set safety (AaFriction) gate. Quarantine, NOT reject
// (anti-paternalism): the user can CONFIRM a real outlier (it logs as-is) or
// CORRECT it (logs the suggested value). The backdrop does NOT dismiss — the user
// must choose, same contract as AaFrictionModal. RO strings carry no diacritics.

import type { CSSProperties, JSX } from 'react';
import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { SanityResult } from '../../../engine/dp/anomalyGuard.js';
import { t } from '../../../i18n/index.js';

interface AnomalyConfirmModalProps {
  open: boolean;
  result: SanityResult | null;
  value: number; // the suspect value the user entered (weight kg or reps)
  onConfirm: () => void; // "Da, corect" — log as-is (confirmed real)
  onFix: (suggested: number | null) => void; // "Am gresit" — correct then log
}

export function AnomalyConfirmModal({
  open,
  result,
  value,
  onConfirm,
  onFix,
}: AnomalyConfirmModalProps): JSX.Element | null {
  const fixRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    fixRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const first = fixRef.current;
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
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open || !result) return null;
  const isReps = result.field === 'reps';
  const body = isReps
    ? t('anomalyGuard.reps', { value })
    : t('anomalyGuard.weight', { value, plausible: result.plausible ?? 0 });
  const suggested = result.suggested;
  const fixLabel = suggested != null
    ? t('anomalyGuard.fixCta', { suggested })
    : t('anomalyGuard.fixGenericCta');

  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlayStrong flex items-center justify-center z-[60] p-6"
      data-testid="anomaly-confirm-backdrop"
    >
      <div
        className="animate-scale-in pulse-card pulse-card-glow p-6 w-full max-w-md"
        style={{ '--wash': 'var(--ember)' } as CSSProperties}
        data-testid="anomaly-confirm-modal"
        role="dialog"
        aria-labelledby="anomaly-confirm-title"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-brick" aria-hidden="true" />
          <h2
            id="anomaly-confirm-title"
            className="text-base font-bold text-ink"
            data-testid="anomaly-confirm-title"
          >
            {t('anomalyGuard.title')}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-4" data-testid="anomaly-confirm-body">
          {body}
        </p>
        <button
          ref={fixRef}
          type="button"
          onClick={() => onFix(suggested)}
          data-testid="anomaly-confirm-fix"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2"
        >
          {fixLabel}
        </button>
        <button
          ref={confirmRef}
          type="button"
          onClick={onConfirm}
          data-testid="anomaly-confirm-confirm"
          className="w-full py-2 text-brick text-sm"
        >
          {t('anomalyGuard.confirmCta')}
        </button>
      </div>
    </div>
  );
}
