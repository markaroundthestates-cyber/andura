// ══ CONT — Tab 4 of 4 Phase 5 task_13 Landing ════════════════════════════
// Phase 5 task_13 MVP scope: sections list mockup wv2 parity (Cont / General
// / Date si confidentialitate / Deconectare si Stergere / Ajutor). Sub-screens
// Phase 6+ implementation (task_13 §3 hint Karpathy §4 simplicity).
// Mockup verbatim copy preserved (andura-clasic.html#L1839+).
//
// §i18n 2026-05-28 — section + row labels routed through t('cont.sections.*')
// + t('cont.rows.*'). Daniel CEO directive: default EN, RO opt-in from
// Cont > Setari > Limba. Stable English ids on each row drive testid +
// localStorage keys; only the visible label localizes.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import type { GotoScreen } from '../../../lib/navigation';
import { getUserProfileDisplay } from './userProfile';
import { t } from '../../../../i18n/index.js';
import {
  User,
  Bell,
  Sparkles,
  Palette,
  XOctagon,
  SlidersHorizontal,
  ShieldCheck,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  LifeBuoy,
  AlertOctagon,
  Info,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface ContRow {
  id: string;
  /** i18n key under `cont.rows.*` for the visible label. */
  labelKey: string;
  Icon: typeof User;
  danger?: boolean;
  target?: GotoScreen;
}

interface ContSection {
  /** Stable English-id for testid + heading marker (kept stable across locales). */
  id: 'cont' | 'general' | 'privacy' | 'danger' | 'help';
  /** i18n key under `cont.sections.*` for the visible heading. */
  titleKey: string;
  rows: ContRow[];
  danger?: boolean;
}

// Mockup verbatim copy andura-clasic.html#L1839-1888 (now i18n-keyed; the
// English+Romanian labels live in src/i18n/{en,ro}.json under cont.*).
const SECTIONS: readonly ContSection[] = [
  {
    id: 'cont',
    titleKey: 'cont.sections.cont',
    rows: [
      { id: 'profile', labelKey: 'cont.rows.profile', Icon: User, target: 'settings-profile' },
      { id: 'notifications', labelKey: 'cont.rows.notifications', Icon: Bell, target: 'settings-notifications' },
      { id: 'subscription', labelKey: 'cont.rows.subscription', Icon: Sparkles, target: 'settings-subscription' },
    ],
  },
  {
    id: 'general',
    titleKey: 'cont.sections.general',
    rows: [
      { id: 'appearance', labelKey: 'cont.rows.appearance', Icon: Palette, target: 'settings-appearance' },
      { id: 'aparate-lipsa', labelKey: 'cont.rows.aparateLipsa', Icon: XOctagon, target: 'aparate-lipsa' },
      { id: 'prefs', labelKey: 'cont.rows.prefs', Icon: SlidersHorizontal, target: 'settings-prefs' },
    ],
  },
  {
    id: 'privacy',
    titleKey: 'cont.sections.privacy',
    rows: [
      { id: 'privacy', labelKey: 'cont.rows.privacy', Icon: ShieldCheck, target: 'settings-privacy' },
      { id: 'terms', labelKey: 'cont.rows.terms', Icon: FileText, target: 'settings-terms' },
      { id: 'export', labelKey: 'cont.rows.export', Icon: Download, target: 'settings-export' },
      { id: 'import', labelKey: 'cont.rows.import', Icon: Upload, target: 'settings-import' },
    ],
  },
  {
    id: 'danger',
    titleKey: 'cont.sections.danger',
    danger: true,
    rows: [{ id: 'danger', labelKey: 'cont.rows.danger', Icon: AlertTriangle, danger: true, target: 'settings-danger' }],
  },
  {
    id: 'help',
    titleKey: 'cont.sections.help',
    rows: [
      { id: 'support', labelKey: 'cont.rows.support', Icon: LifeBuoy, target: 'settings-support' },
      { id: 'ceva-nu-merge', labelKey: 'cont.rows.cevaNuMerge', Icon: AlertOctagon, target: 'ceva-nu-merge' },
      { id: 'about', labelKey: 'cont.rows.about', Icon: Info, target: 'settings-about' },
      { id: 'faq', labelKey: 'cont.rows.faq', Icon: HelpCircle, target: 'settings-faq' },
    ],
  },
];

export function Cont(): JSX.Element {
  const navigate = useNavigate();
  const handleRowClick = (target: GotoScreen | undefined): void => {
    if (target) navigate(gotoPath(target));
  };
  // §F-cont-01/02/03 user-wire fix (HIGH-BETA chat 4) — read avatar initial +
  // name + email from id_token JWT claims (single source of truth post Magic
  // Link verify). Unauthenticated fallback preserves generic placeholders.
  const profile = getUserProfileDisplay();
  const displayName = profile.name || t('cont.accountFallback');
  const displayEmail = profile.email || t('cont.emailFallback');
  return (
    <section className="pt-4 px-5 pb-6 bg-paper min-h-screen" data-testid="cont-home">
      {/* §F-cont-08 (LOW chat5) — title font-weight 600 → 700 mockup
          andura-clasic.html#L1841 (font-weight:700). */}
      <h1 className="text-2xl font-bold text-ink mb-4">{t('tabs.cont.title')}</h1>

      {/* Account card (header) — Phase 6+ wires user profile data real
          Wave A5 polish (Daniel "Top Grade" 2026-05-28) — gradient avatar
          (brick -> olive radial via color-mix) so the chip reads warm-premium
          rather than flat brick. Inner highlight + soft outer ring on the
          avatar give it a subtle "polished pebble" feel. Card itself gets
          animate-card-rise on mount so the profile lands first. */}
      <div
        className="surface-elevated bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-3 animate-card-rise"
        data-testid="cont-account-card"
      >
        {/* §F-cont-07 (LOW chat5) — avatar dimensions 48x48 → 52x52 +
            text 20px → 22px mockup andura-clasic.html#L1845 (font-size:22).
            Wave A5 — gradient bg with color-mix so each palette tints itself:
            Clasic = brick warm red, mov = royal violet, Luxury = champagne,
            Living Body = amber-gold. Inset white highlight (8% top) +
            outer ring (2px paper2 + 1px line) sells the dimensional pebble. */}
        <div
          className="w-[52px] h-[52px] rounded-full text-paper flex items-center justify-center text-[22px] font-semibold relative overflow-hidden"
          data-testid="cont-account-initial"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--brick) 92%, white 8%), color-mix(in oklab, var(--brick) 70%, var(--olive) 30%) 65%, color-mix(in oklab, var(--brick) 88%, black 12%))',
            boxShadow:
              'inset 0 1px 0 color-mix(in oklab, white 22%, transparent), 0 2px 8px -2px color-mix(in oklab, var(--brick) 30%, transparent)',
          }}
        >
          <span className="relative">{profile.initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink" data-testid="cont-account-name">{displayName}</p>
          <p className="text-sm text-ink2 truncate" data-testid="cont-account-email">{displayEmail}</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.id} className="mb-4" data-testid={`cont-section-${section.id}`}>
          {/* §F-cont-06 (LOW chat5 Wave 15) — section heading tokens align
              mockup .settings-section andura-clasic.html:2870 verbatim:
              font-size 11px + letter-spacing 0.08em + color var(--ink-3).
              Prior: text-xs (12px) + tracking-wide (0.025em) + text-ink2.
              Danger sections keep text-brick highlight invariant. */}
          <p
            className={`text-[11px] uppercase tracking-[0.08em] font-semibold mb-2 ${section.danger ? 'text-brickdark' : 'text-ink3'}`}
          >
            {t(section.titleKey)}
          </p>
          <div className="surface-elevated bg-paper2 border border-line rounded-[14px] overflow-hidden">
            {section.rows.map((row, idx) => {
              const Icon = row.Icon;
              const isLast = idx === section.rows.length - 1;
              return (
                <button
                  key={row.id}
                  type="button"
                  data-testid={`cont-row-${row.id}`}
                  onClick={() => handleRowClick(row.target)}
                  disabled={!row.target}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed ${!isLast ? 'border-b border-line' : ''} ${row.danger ? 'text-brickdark' : 'text-ink'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-sm">{t(row.labelKey)}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Wave A5 polish (Daniel "Top Grade" 2026-05-28) — version footer pairs
          terse "Andura v1.0.0" with a soft serif Lora tagline below ("Training
          with brain." / "Antrenament cu cap."). Two-line stack reads as a
          quiet brand signature rather than a flat version stamp. */}
      <div className="text-center mt-6 mb-2">
        <p className="text-xs text-ink2" data-testid="cont-version">{t('cont.version')}</p>
        <p
          className="font-serif italic text-xs text-ink3 mt-1"
          data-testid="cont-version-tagline"
        >
          {t('cont.versionTagline')}
        </p>
      </div>
    </section>
  );
}
