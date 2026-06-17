// ══ REDO ONBOARDING CONFIRM — B002/D047 RIP-OUT drill-down screen ════════
// Per mockup andura-clasic.html L2295-2308 (#screen-confirm-redo-onboarding).
// Reseteaza raspunsuri onboarding + redirect /onboarding/1. Profilul auth
// se pastreaza (cont stays), DOAR onboardingStore data se sterge.
//
// Reversibil per mockup body — re-completarea onboarding-ului restaureaza
// configuratia. Tier 0 only (NU touches Firebase/Tier 1+2 cont data).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { gotoPath } from '../../../lib/navigation';
import { pushStoreNow } from '../../../lib/storeSync';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

export function RedoOnboardingConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    useOnboardingStore.getState().reset();
    // FIX 7 — push the reset (completed:false) to the cloud SYNCHRONOUSLY, bypassing
    // the 3s debounce. Otherwise a cloud hydrate before the debounced push lands
    // resurrects the OLD remote profile + flips completed back to true mid-flow
    // (the onboarding apply() is monotonic sticky-true). Fire-and-forget: the reset
    // is already applied locally; the synchronous PATCH just makes the cloud agree.
    void pushStoreNow('onboarding');
    navigate('/onboarding/1');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-prefs'));
  }

  return (
    <section className="min-h-screen flex flex-col" data-testid="redo-onboarding-confirm">
      <SubHeader
        title={t('confirm.redoOnboarding.title')}
        onBack={handleCancel}
        testIdBack="redo-onboarding-confirm-back"
      />

      {/* Pulse reskin (arc #5 2026-05-29) — flat disc + bg-paper2 → Pulse glass
          card. Logic / i18n / testids unchanged. */}
      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="pulse-card pulse-card-glow w-full max-w-sm mt-2 p-6 flex flex-col items-center animate-card-rise">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'var(--surface)', boxShadow: '0 0 24px -8px var(--aqua)' }}
          >
            <RotateCcw className="w-7 h-7 text-ink" aria-hidden="true" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">{t('confirm.redoOnboarding.heading')}</h2>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.redoOnboarding.body1')}
          </p>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.redoOnboarding.body2')}
          </p>

          <div className="w-full mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              data-testid="redo-onboarding-confirm-accept"
              className="btn-grad press-feedback w-full py-4 rounded-full text-base font-semibold"
            >
              {t('confirm.redoOnboarding.acceptCta')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              data-testid="redo-onboarding-confirm-cancel"
              className="press-feedback w-full py-4 border border-line rounded-full text-base font-medium text-ink"
              style={{ background: 'var(--surface-2)' }}
            >
              {t('confirm.redoOnboarding.cancelCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
