// ══ MEDICAL DISCLAIMER MODAL — LOCK 4 Pre-Beta Gate ══════════════════════
// Phase 5 task_17 — Medical Disclaimer pre-onboarding gate. User MUST
// acknowledge înainte de a începe sesiuni. Persist consent in
// disclaimerStore localStorage cross-session.

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

// RE-U-02 — U-01 a promovat acest modal la gate obligatoriu mereu-montat in
// Layout (open=!acceptedDisclaimer, fara onCancel). Sister ExitConfirmSheet are
// focus-trap real first<->last; acesta avea doar Escape (mort fara onCancel) si
// niciun handler Tab — focusul scapa in app-ul din spate pe un gate safety/legal.

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
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // §6-H4 + RE-U-02 — focus management: capture pre-modal focus + focus primary
  // CTA on open + restore on close. Escape triggers cancel doar cand onCancel
  // exista (gate obligatoriu in Layout NU are onCancel → Escape inert, corect).
  // Focus-trap real (model ExitConfirmSheet): Tab cicleaza acknowledge<->cancel;
  // cand onCancel lipseste (un singur buton focusabil), Tab ramane pe acknowledge.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    acknowledgeRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const first = acknowledgeRef.current;
      // cancelRef.current null cand gate obligatoriu (onCancel absent) → last
      // colapseaza pe acknowledge: un singur element focusabil, Tab nu scapa.
      const last = cancelRef.current ?? acknowledgeRef.current;
      if (!first) return;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last?.focus();
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
            ref={cancelRef}
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
