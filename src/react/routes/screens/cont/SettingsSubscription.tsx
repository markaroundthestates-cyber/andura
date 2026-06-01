// ══ SETTINGS SUBSCRIPTION — Phase 6 task_11 Cont Sub-Screen ══════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-subscription
// (L1969-1988). Beta gratuit info display + paywall placeholder post-Beta.
// UI shell V1 — ZERO upgrade flow live (Phase 7+ subscription tier real
// wire when IAP flows defined post-Beta launch).
//
// ADDENDUM 5 (Pulse arc #5 2026-06-01) — the "Notify me when it's ready" link
// used `text-brickdark` (= --brick-dark, the ember-RED reserved for destructive
// actions). On a non-destructive link that read as an old-theme red leak; it is
// now the Pulse aqua link color (var(--aqua)). The Sparkles/Gift icons stay
// `text-brick` — that resolves to volt (the accent), not red, matching the
// mockup's volt-green glyphs.

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
    <section className="min-h-screen flex flex-col" data-testid="settings-subscription">
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
          className="w-full pulse-card pulse-card-tight p-4 flex items-center gap-3 mb-5"
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
          className="text-sm font-semibold underline disabled:no-underline"
          style={{ color: 'var(--aqua)' }}
          disabled={notified}
        >
          {notified ? t('settings.subscription.notifiedCta') : t('settings.subscription.notifyCta')}
        </button>
      </div>
    </section>
  );
}
