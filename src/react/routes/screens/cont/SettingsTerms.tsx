// ══ SETTINGS TERMS — Phase 6 task_15 Cont Sub-Screen ═════════════════════
// T&C re-display + Medical Disclaimer re-display. Read-only legal references
// post-onboarding accept. Mockup verbatim source rezumat 04-architecture
// disclaimer texts (LOCK 4 medical V1).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t, tArray } from '../../../../i18n/index.js';

type ActiveDoc = 'tc' | 'medical';

export function SettingsTerms(): JSX.Element {
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveDoc>('tc');

  const tcItems = tArray('settings.terms.tcItems');
  const medicalItems = tArray('settings.terms.medicalItems');

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-terms">
      <SubHeader
        title={t('settings.terms.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-terms-back"
      />

      <div className="flex border-b border-line bg-paper sticky top-[57px] z-10">
        <button
          type="button"
          data-testid="terms-tab-tc"
          role="tab"
          aria-selected={active === 'tc'}
          onClick={() => setActive('tc')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 ${active === 'tc' ? 'text-brick border-b-2 border-brick' : 'text-ink2'}`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          {t('settings.terms.tabTerms')}
        </button>
        <button
          type="button"
          data-testid="terms-tab-medical"
          role="tab"
          aria-selected={active === 'medical'}
          onClick={() => setActive('medical')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 ${active === 'medical' ? 'text-brick border-b-2 border-brick' : 'text-ink2'}`}
        >
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          {t('settings.terms.tabMedical')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {active === 'tc' ? (
          <article data-testid="terms-tc-content" className="text-sm text-ink leading-relaxed">
            <h2 className="text-base font-semibold mb-2">{t('settings.terms.tcHeading')}</h2>
            <p className="mb-3">{t('settings.terms.tcIntro')}</p>
            <p className="mb-3">{t('settings.terms.tcAcceptIntro')}</p>
            <ul className="list-disc pl-5 mb-3 space-y-1.5">
              {tcItems.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
            <p className="text-xs text-ink2 mt-4">
              {t('settings.terms.tcVersion')}{' '}
              <a
                href="https://andura.app/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-brick"
                data-testid="terms-tc-live-link"
              >
                {t('settings.terms.tcLiveLinkLabel')}
              </a>
              .
            </p>
          </article>
        ) : (
          <article data-testid="terms-medical-content" className="text-sm text-ink leading-relaxed">
            <h2 className="text-base font-semibold mb-2">{t('settings.terms.medicalScreenHeading')}</h2>
            <p className="mb-3">{t('settings.terms.medicalIntro')}</p>
            <p className="mb-3">{t('settings.terms.medicalConsultIntro')}</p>
            <ul className="list-disc pl-5 mb-3 space-y-1.5">
              {medicalItems.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
            <p className="mb-3">{t('settings.terms.medicalListenBody')}</p>
            <p className="text-xs text-ink2 mt-4">{t('settings.terms.medicalAccepted')}</p>
          </article>
        )}
      </div>
    </section>
  );
}
