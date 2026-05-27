// AA FRICTION MODAL - LOCK 9 Per-Set Safety Acknowledge
// Phase 4 task_14 sectionB - blocking centered modal cand aaFrictionDetect
// triggers pre-set. User must choose Continui oricum sau Pauza 30s. Backdrop
// NU dismiss (LOCK 9 safety gate strict).
//
// Cross-refs:
//   - DECISIONS.md sectionD-LEGACY-040 LOCK 9 anti-aggressive loading safety
//   - mockup andura-clasic.html line 105-127 .session-pill style precedent

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AggressiveReason } from '../lib/aaFrictionDetect';

interface AaFrictionModalProps {
  open: boolean;
  reason: AggressiveReason | null;
  onAcknowledge: () => void;
  onForceContinue: () => void;
}

const COPY = {
  title: 'Stai un pic',
  body: 'Ai marit ritmul peste obisnuit. Verifica forma si recupereaza inainte de set urmator.',
  buttonPause: 'Pauza 30 sec',
  buttonContinue: 'Continui oricum',
} as const;

const REASON_LABEL: Record<AggressiveReason, string> = {
  fast_sets: 'Set-uri prea rapide',
  kg_jump: 'Greutate marita brusc',
  rep_spike: 'Repetari peste obisnuit',
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
      className="fixed inset-0 bg-overlayStrong flex items-center justify-center z-[60] p-6"
      data-testid="aa-friction-backdrop"
    >
      <div
        className="bg-paper rounded-2xl p-6 w-full max-w-md"
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
            {COPY.title}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-4" data-testid="aa-friction-body">
          {COPY.body}
        </p>
        {reason && (
          <p
            className="text-xs text-ink2 mb-4 italic"
            data-testid="aa-friction-reason"
            data-reason={reason}
          >
            {REASON_LABEL[reason]}
          </p>
        )}
        <button
          ref={pauseRef}
          type="button"
          onClick={onAcknowledge}
          data-testid="aa-friction-pause"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2"
        >
          {COPY.buttonPause}
        </button>
        <button
          ref={continueRef}
          type="button"
          onClick={onForceContinue}
          data-testid="aa-friction-continue"
          className="w-full py-2 text-brick text-sm"
        >
          {COPY.buttonContinue}
        </button>
      </div>
    </div>
  );
}
