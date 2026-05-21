// ══ REDO ONBOARDING CONFIRM — B002/D047 RIP-OUT drill-down screen ════════
// Per mockup andura-clasic.html L2295-2308 (#screen-confirm-redo-onboarding).
// Reseteaza raspunsuri onboarding + redirect /onboarding/1. Profilul auth
// se pastreaza (cont stays), DOAR onboardingStore data se sterge.
//
// Reversibil per mockup body — re-completarea onboarding-ului restaureaza
// configuratia. Tier 0 only (NU touches Firebase/Tier 1+2 cont data).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { gotoPath } from '../../../lib/navigation';

export function RedoOnboardingConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    useOnboardingStore.getState().reset();
    navigate('/onboarding/1');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-prefs'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="redo-onboarding-confirm">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Inapoi"
          data-testid="redo-onboarding-confirm-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Refa onboarding</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <RotateCcw className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Atentie</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Vei relua configurarea initiala — obiective, nivel de experienta,
          disponibilitate.
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Profilul actual se pastreaza, dar raspunsurile vechi vor fi
          suprascrise. Reversibil daca termini din nou onboarding-ul.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="redo-onboarding-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
          >
            Confirma actiunea
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="redo-onboarding-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-xl text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
