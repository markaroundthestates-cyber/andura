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
// the screen is re-skinned to the Pulse glass card language (.pulse-card) —
// display wordmark + mono zone eyebrows. Composition matching Daniel's mockup:
// (1) the profile header is a gradient-pebble avatar card (--grad-pulse + aqua
// glow) + streak Pill (useWorkoutStore.streak); (2) Appearance is a tappable
// row (under General) that opens the SettingsAppearance sub-screen.
//
// ADDENDUM 4 (arc #5 2026-06-01) — the Account home used to render the FULL
// expanded ACCENT + Dark/Light block inline AND an "Appearance" row, a visible
// duplicate. The expanded block (accent picker + mode toggle) MOVED into
// SettingsAppearance.tsx; the Account home now keeps only the clean row list
// (the "Appearance" row opens the sub-screen one tap deeper). Render-move only:
// the accent/mode state + handlers + testids live unchanged on the sub-screen.
// Engine/store wires, the SECTIONS map + every row `target` navigation (incl.
// the danger row → settings-danger → logout-confirm / delete-account-confirm
// confirm-screen gating), the JWT profile wiring are unchanged.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import type { GotoScreen } from '../../../lib/navigation';
import { getUserProfileDisplay } from './userProfile';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Pill } from '../../../components/pulse/Pill';
import { UserAvatar } from '../../../components/Avatar/UserAvatar';
import { AvatarPicker } from '../../../components/Avatar/AvatarPicker';
import { t } from '../../../../i18n/index.js';
import {
  User,
  Bell,
  Sparkles,
  Palette,
  Library,
  XOctagon,
  SlidersHorizontal,
  ShieldCheck,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  LifeBuoy,
  Info,
  HelpCircle,
  ChevronRight,
  Flame,
  Pencil,
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
      { id: 'exercise-library', labelKey: 'cont.rows.exerciseLibrary', Icon: Library, target: 'settings-exercise-library' },
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
  // §F-cont (live-smoke 2026-05-29) — the Magic Link path has no `name` claim,
  // so userProfile falls `name` back to the email local-part. Rendering that
  // local-part as the NAME and the full email as the SUBTITLE shows the same
  // email twice ("maziludanielconstantin90" + "maziludanielconstanti..."). A
  // real display name exists only when the JWT `name` claim differs from the
  // email local-part. With a real name → name line + email subtitle; without
  // one → show the email ONCE as the primary line, no duplicate subtitle.
  // Skip-auth (no email) keeps the friendly fallback name + tagline subtitle.
  const emailLocalPart = profile.email.split('@')[0] ?? '';
  const hasRealName = profile.name.length > 0 && profile.name !== emailLocalPart;
  // Daniel 2026-06-01: show only the FIRST name in the profile header ("Daniel",
  // not "Daniel Mazilu"). Google OAuth supplies the full display name; we keep the
  // full name as the JWT source of truth but render only the leading token.
  const firstName = profile.name.split(' ')[0] || profile.name;
  const primaryLine = hasRealName
    ? firstName
    : profile.email || t('cont.accountFallback');
  // Subtitle only when it adds info: the email under a real name, or the
  // generic tagline in the skip-auth (no email) fallback. Suppressed when the
  // primary line is already the email (anti-duplicate).
  const subtitle = hasRealName
    ? profile.email
    : profile.email
      ? ''
      : t('cont.emailFallback');

  // Pulse profile streak Pill (interfata-noua/screens-tabs.jsx:340) — the
  // mockup shows a flame day-streak chip beside the avatar. Reuses the real
  // streak from the workout store (same source as the Coach StatsGrid).
  const streak = useWorkoutStore((s) => s.streak);
  const streakUnit = streak === 1 ? t('stats.streakUnit_one') : t('stats.streakUnit_other');

  // Account avatar (illustrated preset set) — chosen id lives in settingsStore
  // (persisted + synced per-UID like accent/theme). Selecting applies instantly;
  // the picker grid expands inline under the hero (no route change). The hero
  // falls back to the gradient initial when no preset is picked.
  const avatarId = useSettingsStore((s) => s.avatarId);
  const setAvatar = useSettingsStore((s) => s.setAvatar);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="pt-4 px-5 pb-6 min-h-screen" data-testid="cont-home">
      {/* Pulse header (interfata-noua/screens-tabs.jsx:331) — display wordmark.
          Keeps the existing i18n key + heading role contract. */}
      <h1 className="font-display text-2xl font-bold text-ink mb-4">{t('tabs.cont.title')}</h1>

      {/* Account card (header) — Wave A5 polish (Daniel "Top Grade" 2026-05-28)
          gradient avatar (brick -> olive radial via color-mix) so the chip
          reads warm-premium rather than flat brick. Pulse reskin adds the
          streak Pill on the right (interfata-noua/screens-tabs.jsx:334-341). */}
      <div
        className="pulse-card pulse-shine p-[18px] mb-4 flex items-center gap-3.5 animate-card-rise delay-75"
        data-testid="cont-account-card"
      >
        {/* Avatar — illustrated preset (Avatar/UserAvatar) or the gradient
            initial fallback when none picked. Tapping toggles the inline preset
            picker below; a small edit badge cues that it is changeable. Aqua
            glow halo + 54x54 to match the prior Pulse pebble rhythm. */}
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          aria-controls="cont-avatar-picker"
          data-testid="cont-account-avatar"
          className="relative flex-shrink-0 rounded-full press-feedback"
          style={{ boxShadow: '0 0 26px -6px var(--aqua)', borderRadius: '50%' }}
        >
          <UserAvatar
            avatarId={avatarId}
            size={54}
            initial={profile.initial}
            initialTestId="cont-account-initial"
            label={t('cont.avatar.heroLabel')}
          />
          <span
            className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full grid place-items-center"
            style={{ background: 'var(--grad-pulse)', boxShadow: '0 0 0 3px var(--paper)' }}
            aria-hidden="true"
          >
            <Pencil className="w-3 h-3" strokeWidth={2.4} style={{ color: 'var(--on-accent)' }} />
          </span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink truncate" data-testid="cont-account-name">{primaryLine}</p>
          {subtitle && (
            <p className="text-sm text-ink2 truncate" data-testid="cont-account-email">{subtitle}</p>
          )}
        </div>
        <Pill color="var(--volt)">
          <Flame className="w-3 h-3" aria-hidden="true" />
          {streak} {streakUnit}
        </Pill>
      </div>

      {/* Avatar preset picker — expands inline under the account card (tapping
          the hero avatar or this "Schimba avatarul" header toggles it). Selecting
          a preset applies instantly + persists (settingsStore.avatarId). Kept off
          the always-visible surface so the Account home stays a clean list. */}
      <div className="pulse-card p-1 overflow-hidden mb-4 animate-card-rise" id="cont-avatar-picker">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          aria-controls="cont-avatar-grid"
          data-testid="cont-avatar-toggle"
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink"
        >
          <span className="w-9 h-9 rounded-[11px] grid place-items-center flex-shrink-0 bg-paper">
            <Pencil className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1 text-sm font-semibold">{t('cont.avatar.change')}</span>
          <ChevronRight
            className={`w-5 h-5 flex-shrink-0 text-ink3 transition-transform ${pickerOpen ? 'rotate-90' : ''}`}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </button>
        {pickerOpen && (
          <div className="px-4 pt-1 pb-4 border-t border-line" id="cont-avatar-grid">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink3 mb-3 mt-3">
              {t('cont.avatar.pickerLabel')}
            </p>
            <AvatarPicker
              selectedId={avatarId}
              onSelect={(id) => setAvatar(avatarId === id ? null : id)}
            />
            <p className="text-[11px] text-ink3 mt-3 leading-relaxed">{t('cont.avatar.hint')}</p>
          </div>
        )}
      </div>

      {SECTIONS.map((section) => (
        <div key={section.id} data-testid={`cont-section-${section.id}`}>
          {/* §F-cont-06 — section heading reskinned to the Pulse zone eyebrow
              (mono 11px tracking-[0.14em] ink3). Danger sections keep the
              brick highlight invariant. */}
          <ZoneHeading danger={section.danger ?? false}>{t(section.titleKey)}</ZoneHeading>
          <div className="pulse-card p-1 overflow-hidden animate-card-rise">
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
