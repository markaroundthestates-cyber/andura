// ══ SETTINGS SUPPORT — Suport ═════════════════════════════════════════════
// Per mockup andura-clasic.html#screen-settings-support. Static contact info
// + mailto link. Pre-Beta: feedback via email direct. Post-Beta: backend
// POST /api/feedback form integration deferred.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, ChevronRight } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { t } from '../../../../i18n/index.js';

const SUPPORT_EMAIL = 'support@andura.app';

export function SettingsSupport(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col" data-testid="settings-support">
      <SubHeader
        title={t('settings.support.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-support-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-relaxed">
          {t('settings.support.intro')}
        </p>

        <div className="mb-2">
          <Kicker color="var(--ink-3)">{t('settings.support.contactHeading')}</Kicker>
        </div>
        <div className="pulse-card pulse-card-tight overflow-hidden mb-4">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            data-testid="support-email"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t('settings.support.emailLabel')}</p>
              <p className="text-xs text-ink2 truncate">{SUPPORT_EMAIL}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </a>
          <div
            data-testid="support-whatsapp"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink2"
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{t('settings.support.whatsappLabel')}</p>
              <p className="text-xs">{t('settings.support.whatsappHours')}</p>
            </div>
            <span className="text-xs text-ink3 italic">{t('settings.support.postBetaLabel')}</span>
          </div>
        </div>

        <div className="mb-2">
          <Kicker color="var(--ink-3)">{t('settings.support.messageHeading')}</Kicker>
        </div>
        <div className="pulse-card pulse-card-tight p-4">
          <p className="text-xs text-ink2 mb-3 leading-relaxed">
            {t('settings.support.messageHint')}
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Andura%20feedback&body=`}
            data-testid="support-feedback-mailto"
            className="btn-primary-lift btn-grad press-feedback w-full block py-3 rounded-full text-base font-semibold text-center"
          >
            {t('settings.support.openEmailCta')}
          </a>
        </div>
      </div>
    </section>
  );
}
