// ══ SETTINGS FAQ — Intrebari frecvente ════════════════════════════════════
// Per mockup andura-clasic.html#screen-settings-faq. Static FAQ sections
// with placeholder questions. Each question expands to short answer (V1
// pre-Beta: chevron right + accordion expand pattern, content seeded
// minimal). Post-Beta: dedicated answer subpages or markdown rendered.

import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

interface FaqItem {
  qKey: string;
  aKey: string;
}

interface FaqSection {
  titleKey: string;
  sectionId: string; // stable id for openId tracking across locales
  items: FaqItem[];
}

const FAQ: ReadonlyArray<FaqSection> = [
  {
    sectionId: 'training',
    titleKey: 'settings.faq.sections.training',
    items: [
      { qKey: 'settings.faq.items.trainingChangeProgram', aKey: 'settings.faq.items.trainingChangeProgramA' },
      { qKey: 'settings.faq.items.trainingSkipSession', aKey: 'settings.faq.items.trainingSkipSessionA' },
      { qKey: 'settings.faq.items.trainingProgress', aKey: 'settings.faq.items.trainingProgressA' },
    ],
  },
  {
    sectionId: 'account',
    titleKey: 'settings.faq.sections.account',
    items: [
      { qKey: 'settings.faq.items.accountPassword', aKey: 'settings.faq.items.accountPasswordA' },
      { qKey: 'settings.faq.items.accountMultiPhone', aKey: 'settings.faq.items.accountMultiPhoneA' },
      { qKey: 'settings.faq.items.accountDataLocation', aKey: 'settings.faq.items.accountDataLocationA' },
    ],
  },
  {
    sectionId: 'notifications',
    titleKey: 'settings.faq.sections.notifications',
    items: [
      { qKey: 'settings.faq.items.notificationsMissing', aKey: 'settings.faq.items.notificationsMissingA' },
    ],
  },
];

export function SettingsFaq(): JSX.Element {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string): void {
    setOpenId((curr) => (curr === id ? null : id));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-faq">
      <SubHeader
        title={t('settings.faq.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-faq-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-relaxed">
          {t('settings.faq.header')}
        </p>

        {FAQ.map((section) => (
          <div key={section.sectionId} className="mb-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
              {t(section.titleKey)}
            </p>
            <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
              {section.items.map((item, idx) => {
                const id = `${section.sectionId}-${idx}`;
                const open = openId === id;
                return (
                  <div key={id} className={idx < section.items.length - 1 ? 'border-b border-line' : ''}>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      data-testid={`faq-q-${id}`}
                      aria-expanded={open}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink"
                    >
                      <HelpCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-sm font-medium">{t(item.qKey)}</span>
                      {open ? (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
                      )}
                    </button>
                    {open && (
                      <div className="px-4 pb-3 -mt-1">
                        <p className="text-sm text-ink2 leading-relaxed">{t(item.aKey)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-xs text-ink3 text-center mt-6 leading-relaxed">
          {t('settings.faq.footerHint')}{' '}
          <button
            type="button"
            onClick={() => navigate(gotoPath('settings-support'))}
            className="text-brick font-medium underline underline-offset-2"
          >
            {t('settings.faq.footerCtaLabel')}
          </button>
          .
        </p>
      </div>
    </section>
  );
}
