// ══ RESET COACH CONFIRM — B011/D047 drill-down screen ════════════════════
// Per mockup andura-clasic.html L2125-2137 (#screen-confirm-reset-coach).
// Universal destructive drill-down pattern (mockup §11 LOCKED V1).
//
// Placeholder action — AI coach incremental learning state NU exists in
// production yet. Mockup parity preserved: button navigate back. Avoids
// Gigel confusion (NU triggers phantom action). Real wipe defers iter 3
// when accelerated learning state persisted.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';

export function ResetCoachConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    // TODO iter 3: wipe acceleratedLearning state + reset coach AI insights.
    // Placeholder = navigate back. AI coach incremental state NU persisted yet.
    navigate(gotoPath('settings-prefs'));
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-prefs'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="reset-coach-confirm">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Inapoi"
          data-testid="reset-coach-confirm-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Reseteaza coach</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <RefreshCcw className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Atentie</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Aceasta actiune va sterge progresul AI invatat despre tine si va
          reporni coach-ul de la zero.
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Datele tale de antrenament raman intacte. Ireversibil.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="reset-coach-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
          >
            Confirma actiunea
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="reset-coach-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-xl text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
