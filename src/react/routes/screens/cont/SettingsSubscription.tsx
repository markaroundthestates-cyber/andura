// ══ SETTINGS SUBSCRIPTION — Phase 6 task_11 Cont Sub-Screen ══════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-subscription
// (L1969-1988). Beta gratuit info display + paywall placeholder post-Beta.
// UI shell V1 — ZERO upgrade flow live (Phase 7+ subscription tier real
// wire when IAP flows defined post-Beta launch).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gift } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

export function SettingsSubscription(): JSX.Element {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-subscription">
      <SubHeader
        title={t('settings.subscription.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-subscription-back"
      />

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center text-center">
        <div
          className="w-22 h-22 rounded-full flex items-center justify-center mb-5 p-5"
          style={{ background: 'var(--status-info-bg)' }}
        >
          <Sparkles className="w-9 h-9 text-brick" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">{t('settings.subscription.comingSoonTitle')}</h2>
        <p className="text-sm text-ink2 mb-6 leading-relaxed max-w-xs">
          {t('settings.subscription.comingSoonBody')}
        </p>

        <div
          className="w-full bg-paper2 border border-line rounded-2xl p-4 flex items-center gap-3 mb-5"
          data-testid="subscription-beta-card"
        >
          <Gift className="w-5 h-5 text-brick flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 text-left">
            <p className="font-semibold text-ink">{t('settings.subscription.freeBetaTitle')}</p>
            <p className="text-xs text-ink2">{t('settings.subscription.freeBetaSubtitle')}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNotified(true)}
          data-testid="subscription-notify-cta"
          className="text-sm text-brickdark font-semibold underline disabled:no-underline"
          disabled={notified}
        >
          {notified ? t('settings.subscription.notifiedCta') : t('settings.subscription.notifyCta')}
        </button>
      </div>
    </section>
  );
}
