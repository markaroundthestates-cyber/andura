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

// Account-regroup 2026-06-12 — `embedded` strips the SubHeader + full-screen
// root so the "Confidentialitate & termeni" hub can host this body. The inner
// T&C/Medical sticky offset (tuned to the standalone SubHeader height) is
// dropped when embedded since the hub owns the sticky header above it.
export function SettingsTerms({ embedded = false }: { embedded?: boolean } = {}): JSX.Element {
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveDoc>('tc');

  const tcItems = tArray('settings.terms.tcItems');
  const medicalItems = tArray('settings.terms.medicalItems');

  return (
    <section className={embedded ? '' : 'min-h-screen flex flex-col'} data-testid="settings-terms">
      {!embedded && (
        <SubHeader
          title={t('settings.terms.title')}
          onBack={() => navigate(gotoPath('cont'))}
          testIdBack="settings-terms-back"
        />
      )}

      {/* Pulse segmented control (interfata-noua/ .seg) — --surface-2 track,
          active half = volt fill + on-accent ink (NOT a brick underline). */}
      <div className={embedded ? 'px-5 pt-4 pb-2' : 'px-5 pt-4 pb-2 sticky top-[57px] z-10'}>
        <div
          className="flex gap-1 rounded-[14px] p-1 border border-line"
          style={{ background: 'var(--surface-2)' }}
          role="tablist"
        >
          <button
            type="button"
            data-testid="terms-tab-tc"
            role="tab"
            aria-selected={active === 'tc'}
            onClick={() => setActive('tc')}
            className={`flex-1 min-h-[40px] py-2 rounded-[11px] text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${active === 'tc' ? '' : 'text-ink2'}`}
            style={active === 'tc' ? { background: 'var(--volt)', color: 'var(--on-accent)' } : undefined}
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
            className={`flex-1 min-h-[40px] py-2 rounded-[11px] text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${active === 'medical' ? '' : 'text-ink2'}`}
            style={active === 'medical' ? { background: 'var(--volt)', color: 'var(--on-accent)' } : undefined}
          >
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            {t('settings.terms.tabMedical')}
          </button>
        </div>
      </div>

      <div className={embedded ? 'px-5 pb-5' : 'flex-1 overflow-y-auto px-5 pb-5'}>
        {active === 'tc' ? (
          <article data-testid="terms-tc-content" className="pulse-card p-[18px] text-sm text-ink2 leading-relaxed">
            <h2 className="font-display text-base font-bold text-ink mb-2">{t('settings.terms.tcHeading')}</h2>
            <p className="mb-3">{t('settings.terms.tcIntro')}</p>
            <p className="mb-3">{t('settings.terms.tcAcceptIntro')}</p>
            <ul className="space-y-2 mb-3">
              {tcItems.map((it, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-brick" aria-hidden="true">&bull;</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink3 mt-4">
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
          <article data-testid="terms-medical-content" className="pulse-card p-[18px] text-sm text-ink2 leading-relaxed">
            <h2 className="font-display text-base font-bold text-ink mb-2">{t('settings.terms.medicalScreenHeading')}</h2>
            <p className="mb-3">{t('settings.terms.medicalIntro')}</p>
            <p className="mb-3">{t('settings.terms.medicalConsultIntro')}</p>
            <ul className="space-y-2 mb-3">
              {medicalItems.map((it, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-brick" aria-hidden="true">&bull;</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <p className="mb-3">{t('settings.terms.medicalListenBody')}</p>
            <p className="text-xs text-ink3 mt-4">{t('settings.terms.medicalAccepted')}</p>
          </article>
        )}
      </div>
    </section>
  );
}
