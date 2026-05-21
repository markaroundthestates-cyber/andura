// ══ FINISH EARLY CONFIRM — B004/D047 drill-down screen ════════════════════
// Per mockup andura-clasic.html L2377-2390 (#screen-confirm-finish-early).
// Universal destructive drill-down pattern (Daniel review 2026-05-11 §11
// LOCKED V1) — consistency cu logout/delete/reset/redo-onboarding/etc.
//
// Action: navigate('/app/antrenor/post-rpe') — partial summary built natural
// la PostRpe submit (uses sessionsHistory logged-pana-acum). NU pierzi
// progresul, coach foloseste datele logate. Cancel = back la /workout.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';

export function FinishEarlyConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    navigate(gotoPath('post-rpe'));
  }

  function handleCancel(): void {
    navigate(gotoPath('workout'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="finish-early-confirm">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Inapoi"
          data-testid="finish-early-confirm-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Termina mai devreme</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <Flag className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Termini sesiunea acum?</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          <strong>Sesiunea partiala se salveaza.</strong> Coach-ul foloseste
          datele logate pana acum — <strong>NU pierzi progresul</strong>.
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Seturile inregistrate raman in istoric. Coach-ul ajusteaza saptamana
          in functie de ce ai facut.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="finish-early-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
          >
            Termina acum
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="finish-early-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-xl text-base font-medium text-ink2"
          >
            Continua sesiunea
          </button>
        </div>
      </div>
    </section>
  );
}
