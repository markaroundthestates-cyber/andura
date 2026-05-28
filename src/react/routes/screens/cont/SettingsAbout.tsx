// ══ SETTINGS ABOUT — Despre Andura ════════════════════════════════════════
// Per mockup andura-clasic.html#screen-settings-about. Static branding + info.
// Logo + tagline + intro + andura.app link + Versiune/Build/Echipa info rows.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

const APP_VERSION = 'v1.0.0';
const APP_BUILD = '2026.05.22';

export function SettingsAbout(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-about">
      <SubHeader
        title={t('settings.about.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-about-back"
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-ink text-paper flex items-center justify-center text-3xl font-bold mx-auto mb-5 tracking-tight">
          A
        </div>
        <h2 className="font-serif text-2xl font-semibold text-ink mb-4 leading-snug">
          {t('settings.about.tagline')}
        </h2>
        <p className="text-sm text-ink2 leading-relaxed mb-6 max-w-xs mx-auto">
          {t('settings.about.intro')}
        </p>

        <a
          href="https://andura.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-brick font-medium mb-6 hover:underline"
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          andura.app
        </a>

        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden text-left">
          <div className="flex justify-between items-center px-4 py-3 border-b border-line">
            <span className="text-sm text-ink2">{t('settings.about.versionLabel')}</span>
            <span className="text-sm text-ink font-medium font-mono" data-testid="about-version">
              {APP_VERSION}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 border-b border-line">
            <span className="text-sm text-ink2">{t('settings.about.buildLabel')}</span>
            <span className="text-sm text-ink font-medium font-mono" data-testid="about-build">
              {APP_BUILD}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-ink2">{t('settings.about.teamLabel')}</span>
            <span className="text-sm text-ink font-medium">{t('settings.about.teamValue')}</span>
          </div>
        </div>

        <p className="text-xs text-ink3 mt-6 leading-relaxed">
          {t('settings.about.thanks')}
        </p>
      </div>
    </section>
  );
}
