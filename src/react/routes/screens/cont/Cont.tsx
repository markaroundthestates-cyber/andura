// ══ CONT — Tab 4 of 4 Phase 5 task_13 Landing ════════════════════════════
// Phase 5 task_13 MVP scope: sections list mockup wv2 parity (Cont / General
// / Date si confidentialitate / Deconectare si Stergere / Ajutor). Sub-screens
// Phase 6+ implementation (task_13 §3 hint Karpathy §4 simplicity).
//
// §i18n 2026-05-28 — section + row labels routed through t('cont.sections.*')
// + t('cont.rows.*'). Daniel CEO directive: default EN, RO opt-in from
// Cont > Setari > Limba. Stable English ids on each row drive testid +
// localStorage keys; only the visible label localizes.
//
// Pulse reskin (arc #5 2026-05-29, interfata-noua/screens-tabs.jsx:316-404):
// the screen is re-skinned to the Pulse card language — display wordmark +
// mono zone eyebrows + surface-elevated cards. Additions matching Daniel's
// mockup: (1) the profile header gains a streak Pill (useWorkoutStore.streak);
// (2) Appearance is PULLED UP into an inline LIVE card with a Dark/Light toggle
// wired to the real settingsStore (the same theme mechanism SettingsAppearance
// drives — applied via ThemeSync <html data-theme>, persisted in
// 'wv2-settings-store'), NOT ephemeral state. The accent swatch is shown as a
// fixed "Volt" indicator: the Pulse foundation retired multi-palette and the
// runtime accent-swap picker is DEFERRED, so no accent-swap mechanism is
// invented here. Engine/store wires, the SECTIONS map + every row `target`
// navigation (incl. the danger row → settings-danger → logout-confirm /
// delete-account-confirm confirm-screen gating), the JWT profile wiring, and
// ALL testids are unchanged — visual reskin + the inline Appearance card.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import type { GotoScreen } from '../../../lib/navigation';
import { getUserProfileDisplay } from './userProfile';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Pill } from '../../../components/pulse/Pill';
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
  Flame,
  Check,
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

// Pulse zone eyebrow — mono uppercase wide-tracked section label, identical
// rhythm to the Progres tab (screens-tabs.jsx .zone-h). Danger keeps the
// brick highlight invariant so "Logout & delete" still reads as a warm flag.
function ZoneHeading({ children, danger }: { children: string; danger?: boolean }): JSX.Element {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.14em] font-semibold mb-3 mt-6 ${danger ? 'text-brickdark' : 'text-ink3'}`}
    >
      {children}
    </p>
  );
}

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

  // Pulse profile streak Pill (interfata-noua/screens-tabs.jsx:340) — the
  // mockup shows a flame day-streak chip beside the avatar. Reuses the real
  // streak from the workout store (same source as the Coach StatsGrid).
  const streak = useWorkoutStore((s) => s.streak);
  const streakUnit = streak === 1 ? t('stats.streakUnit_one') : t('stats.streakUnit_other');

  // Inline LIVE Appearance card (interfata-noua/screens-tabs.jsx:343-363) —
  // Dark/Light toggle wired to the REAL theme store (useSettingsStore.theme +
  // setTheme), the same mechanism SettingsAppearance drives. ThemeSync applies
  // it to <html data-theme> and zustand `persist` saves it under
  // 'wv2-settings-store' — so the pick survives reload + applies app-wide
  // (NOT ephemeral useState). `auto` (system) shows Dark as the active half
  // (the default mov dark look); the binary toggle commits 'dark' / 'light'.
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isLight = theme === 'light';
  const MODE_OPTIONS = [
    { value: 'dark' as const, labelKey: 'cont.appearance.modeDark', active: !isLight },
    { value: 'light' as const, labelKey: 'cont.appearance.modeLight', active: isLight },
  ];

  return (
    <section className="pt-4 px-5 pb-6 bg-paper min-h-screen" data-testid="cont-home">
      {/* Pulse header (interfata-noua/screens-tabs.jsx:331) — display wordmark.
          Keeps the existing i18n key + heading role contract. */}
      <h1 className="font-display text-2xl font-bold text-ink mb-4">{t('tabs.cont.title')}</h1>

      {/* Account card (header) — Wave A5 polish (Daniel "Top Grade" 2026-05-28)
          gradient avatar (brick -> olive radial via color-mix) so the chip
          reads warm-premium rather than flat brick. Pulse reskin adds the
          streak Pill on the right (interfata-noua/screens-tabs.jsx:334-341). */}
      <div
        className="surface-elevated bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-3 animate-card-rise"
        data-testid="cont-account-card"
      >
        {/* §F-cont-07 (LOW chat5) — avatar 52x52 + text 22px mockup L1845.
            Wave A5 — gradient bg with color-mix so each palette tints itself.
            Inset white highlight (8% top) + outer ring sell the dimensional
            pebble. */}
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
          <p className="font-display font-bold text-ink" data-testid="cont-account-name">{displayName}</p>
          <p className="text-sm text-ink2 truncate" data-testid="cont-account-email">{displayEmail}</p>
        </div>
        <Pill color="var(--volt)">
          <Flame className="w-3 h-3" aria-hidden="true" />
          {streak} {streakUnit}
        </Pill>
      </div>

      {/* APPEARANCE — inline LIVE card (interfata-noua/screens-tabs.jsx:343-363).
          Accent shown as a fixed "Volt" indicator (foundation retired multi-
          palette; runtime accent-swap DEFERRED — no swap mechanism). The
          Dark/Light toggle wires to the real settingsStore.theme. */}
      <ZoneHeading>{t('cont.appearance.heading')}</ZoneHeading>
      <div className="surface-elevated bg-paper2 border border-line rounded-2xl p-4 animate-card-rise" data-testid="cont-appearance-card">
        {/* Accent — fixed Volt swatch (no picker: accent-swap deferred). */}
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink3 mb-3">
          {t('cont.appearance.accentLabel')}
        </p>
        <div className="flex items-center gap-3" data-testid="cont-appearance-accent">
          <span
            className="w-[42px] h-[42px] rounded-full grid place-items-center"
            style={{
              background: 'var(--volt)',
              boxShadow: '0 0 18px -2px var(--volt)',
            }}
            aria-hidden="true"
          >
            <Check className="w-4 h-4" strokeWidth={2.8} style={{ color: 'var(--on-accent)' }} aria-hidden="true" />
          </span>
          <span className="font-mono text-xs text-ink2 uppercase tracking-wide">{t('cont.appearance.accentName')}</span>
        </div>

        <div className="h-px bg-line my-4" />

        {/* Mode — Dark/Light segmented toggle wired to the real theme store. */}
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink3 mb-3">
          {t('cont.appearance.modeLabel')}
        </p>
        <div className="flex gap-1.5 bg-paper rounded-[14px] p-1" role="group" aria-label={t('cont.appearance.modeLabel')}>
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`cont-theme-${opt.value}`}
              aria-pressed={opt.active}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 py-2.5 rounded-[11px] text-sm font-semibold transition-colors ${
                opt.active ? 'bg-brick text-paper' : 'text-ink2'
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.id} data-testid={`cont-section-${section.id}`}>
          {/* §F-cont-06 — section heading reskinned to the Pulse zone eyebrow
              (mono 11px tracking-[0.14em] ink3). Danger sections keep the
              brick highlight invariant. */}
          <ZoneHeading danger={section.danger ?? false}>{t(section.titleKey)}</ZoneHeading>
          <div className="surface-elevated bg-paper2 border border-line rounded-2xl overflow-hidden animate-card-rise">
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
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left disabled:opacity-50 disabled:cursor-not-allowed ${!isLast ? 'border-b border-line' : ''} ${row.danger ? 'text-brickdark' : 'text-ink'}`}
                >
                  {/* Pulse row icon chip (interfata-noua/screens-tabs.jsx
                      .cont-ico) — small tinted square behind the glyph. */}
                  <span className="w-9 h-9 rounded-[11px] grid place-items-center flex-shrink-0 bg-paper">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{t(row.labelKey)}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink3" strokeWidth={1.6} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Wave A5 polish (Daniel "Top Grade" 2026-05-28) — version footer pairs
          terse "Andura v1.0.0" with a soft serif tagline below. Two-line stack
          reads as a quiet brand signature rather than a flat version stamp. */}
      <div className="text-center mt-6 mb-2">
        <p className="text-xs text-ink3" data-testid="cont-version">{t('cont.version')}</p>
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
