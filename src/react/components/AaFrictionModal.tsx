// AA FRICTION MODAL - LOCK 9 Per-Set Safety Acknowledge
// Phase 4 task_14 sectionB - blocking centered modal cand aaFrictionDetect
// triggers pre-set. User must choose Continui oricum sau Pauza 30s. Backdrop
// NU dismiss (LOCK 9 safety gate strict).
//
// Cross-refs:
//   - DECISIONS.md sectionD-LEGACY-040 LOCK 9 anti-aggressive loading safety
//   - mockup andura-clasic.html line 105-127 .session-pill style precedent

import type { CSSProperties, JSX } from 'react';
import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AggressiveReason } from '../lib/aaFrictionDetect';
import { t } from '../../i18n/index.js';

interface AaFrictionModalProps {
  open: boolean;
  reason: AggressiveReason | null;
  onAcknowledge: () => void;
  onForceContinue: () => void;
}

// Labels resolved at render time via t() so the locale flip surfaces EN
// copy under default (Daniel 2026-05-28 mandate) + RO when opt-in via
// Cont > Setari > Limba. Key namespace: perSetSafety.* (this IS the
// per-set safety acknowledge modal — LOCK 9 D-LEGACY-040).
const REASON_KEY: Record<AggressiveReason, string> = {
  fast_sets: 'perSetSafety.reasons.fast_sets',
  kg_jump: 'perSetSafety.reasons.kg_jump',
  rep_spike: 'perSetSafety.reasons.rep_spike',
};

export function AaFrictionModal({
  open,
  reason,
  onAcknowledge,
  onForceContinue,
}: AaFrictionModalProps): JSX.Element | null {
  const pauseRef = useRef<HTMLButtonElement | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // sectionMED-3 audit fix (REVIEW-chat3 fresh-eyes): Tab/Shift+Tab focus
  // trap cycles between Pauza (first) and Continui (last). WAI-ARIA dialog
  // modal-trap contract - keyboard users NU pot Tab afara in workout UI
  // behind backdrop. NO Escape handler (preserve LOCK 9 blocking intent -
  // user MUST choose Pauza sau Continui explicit).
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    pauseRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const first = pauseRef.current;
      const last = continueRef.current;
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

  if (!open) return null;
  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlayStrong flex items-center justify-center z-[60] p-6"
      data-testid="aa-friction-backdrop"
    >
      <div
        className="animate-scale-in pulse-card pulse-card-glow p-6 w-full max-w-md"
        style={{ '--wash': 'var(--ember)' } as CSSProperties}
        data-testid="aa-friction-modal"
        role="dialog"
        aria-labelledby="aa-friction-title"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-brick" aria-hidden="true" />
          <h2
            id="aa-friction-title"
            className="text-base font-bold text-ink"
            data-testid="aa-friction-title"
          >
            {t('perSetSafety.title')}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-4" data-testid="aa-friction-body">
          {t('perSetSafety.body')}
        </p>
        {reason && (
          <p
            className="text-xs text-ink2 mb-4 italic"
            data-testid="aa-friction-reason"
            data-reason={reason}
          >
            {t(REASON_KEY[reason])}
          </p>
        )}
        <button
          ref={pauseRef}
          type="button"
          onClick={onAcknowledge}
          data-testid="aa-friction-pause"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2"
        >
          {t('perSetSafety.pauseCta')}
        </button>
        <button
          ref={continueRef}
          type="button"
          onClick={onForceContinue}
          data-testid="aa-friction-continue"
          className="w-full py-2 text-brick text-sm"
        >
          {t('perSetSafety.continueCta')}
        </button>
      </div>
    </div>
  );
}
