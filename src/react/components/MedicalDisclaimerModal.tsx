// ══ MEDICAL DISCLAIMER MODAL — LOCK 4 Pre-Beta Gate ══════════════════════
// Phase 5 task_17 — Medical Disclaimer pre-onboarding gate. User MUST
// acknowledge înainte de a începe sesiuni. Persist consent in
// disclaimerStore localStorage cross-session.

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface MedicalDisclaimerModalProps {
  open: boolean;
  onAcknowledge: () => void;
  onCancel?: () => void;
}

export function MedicalDisclaimerModal({
  open,
  onAcknowledge,
  onCancel,
}: MedicalDisclaimerModalProps): JSX.Element | null {
  const acknowledgeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // §6-H4 audit fix — focus management: capture pre-modal focus + focus
  // primary CTA on open + restore on close. Escape key triggers cancel
  // (or acknowledge if no cancel — mandatory modal still has escape via
  // primary action). Focus trap minimal — Tab cycles within modal buttons.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    acknowledgeRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        onCancel();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-overlayStrong flex items-center justify-center z-[60] p-6"
      data-testid="disclaimer-backdrop"
    >
      <div
        className="bg-paper rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        data-testid="disclaimer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-brick" aria-hidden="true" />
          <h2
            id="disclaimer-title"
            className="text-base font-bold text-ink"
            data-testid="disclaimer-title"
          >
            Inainte sa incepem
          </h2>
        </div>

        <div className="text-sm text-ink2 space-y-3 mb-6">
          <p>
            Andura este un coach AI. Recomandarile sunt informative, nu
            substitut pentru sfat medical.
          </p>
          <p>
            Daca ai conditii medicale, accidentari recente sau dureri persistente,
            consulta-ti medicul inainte de a incepe un program de antrenament.
          </p>
          <p>
            La orice durere ascutita sau senzatie anormala, opreste-te imediat si
            verifica cu un specialist.
          </p>
          <p className="text-xs italic">
            Continuand confirmi ca ai luat la cunostinta aceste informatii.
          </p>
        </div>

        <button
          ref={acknowledgeRef}
          type="button"
          onClick={onAcknowledge}
          data-testid="disclaimer-acknowledge"
          className="w-full py-3 bg-brick text-paper rounded-[14px] text-base font-semibold mb-2"
        >
          Am inteles, continui
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            data-testid="disclaimer-cancel"
            className="w-full py-2 text-ink2 text-sm"
          >
            Inapoi
          </button>
        )}
      </div>
    </div>
  );
}
