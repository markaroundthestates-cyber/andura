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
  SlidersHorizontal,
  ShieldCheck,
  Dumbbell,
  Database,
  AlertTriangle,
  LifeBuoy,
  Megaphone,
  ChevronRight,
  Flame,
  Pencil,
  Check,
} from 'lucide-react';
import { getUnseenCount } from '../../../lib/announcements';

interface ContRow {
  id: string;
  /** i18n key under `cont.rows.*` for the visible label. */
  labelKey: string;
  Icon: typeof User;
  danger?: boolean;
  target?: GotoScreen;
  /** When true, show an unseen-count dot driven by the announcements cache. */
  unseenBadge?: boolean;
}

interface ContSection {
  /** Stable English-id for testid + heading marker (kept stable across locales). */
  id: 'cont' | 'antrenament' | 'aplicatie' | 'date-legal' | 'ajutor' | 'danger';
  /** i18n key under `cont.sections.*` for the visible heading. */
  titleKey: string;
  rows: ContRow[];
  danger?: boolean;
}

// Account regroup 2026-06-12 (founder: "ar trebui sa fie mai putine butoane si
// grupate") — 6 logical sections + danger, 9 rows total (was 5 sections / 15
// rows). Four rows are NEW grouped HUBS that each merge 2-3 former rows behind
// one screen + segmented/stacked control (exercise-library + aparate-lipsa →
// Exercitii & echipament; export + import → Datele mele; privacy + terms →
// Confidentialitate & termeni; support + faq + about → Ajutor & despre). The
// profile/subscription/appearance/notifications/prefs rows are only REGROUPED —
// their target screens are untouched. Labels via t() (en + ro under cont.*).
const SECTIONS: readonly ContSection[] = [
  {
    id: 'cont',
    titleKey: 'cont.sections.cont',
    rows: [
      // Noutati — founder→users announcements / patch notes. Top of Account so
      // official news is SEEN, not buried (founder 2026-06-12). Unseen-dot cues
      // new entries since the user last opened the screen.
      { id: 'noutati', labelKey: 'cont.rows.noutati', Icon: Megaphone, target: 'cont-noutati', unseenBadge: true },
      { id: 'profile', labelKey: 'cont.rows.profile', Icon: User, target: 'settings-profile' },
      { id: 'subscription', labelKey: 'cont.rows.subscription', Icon: Sparkles, target: 'settings-subscription' },
    ],
  },
  {
    id: 'antrenament',
    titleKey: 'cont.sections.antrenament',
    rows: [
      { id: 'prefs', labelKey: 'cont.rows.prefs', Icon: SlidersHorizontal, target: 'settings-prefs' },
      { id: 'exercitii-echipament', labelKey: 'cont.rows.exercitiiEchipament', Icon: Dumbbell, target: 'cont-exercitii-echipament' },
    ],
  },
  {
    id: 'aplicatie',
    titleKey: 'cont.sections.aplicatie',
    rows: [
      { id: 'appearance', labelKey: 'cont.rows.appearance', Icon: Palette, target: 'settings-appearance' },
      { id: 'notifications', labelKey: 'cont.rows.notifications', Icon: Bell, target: 'settings-notifications' },
    ],
  },
  {
    id: 'date-legal',
    titleKey: 'cont.sections.dateLegal',
    rows: [
      { id: 'datele-mele', labelKey: 'cont.rows.dateleMele', Icon: Database, target: 'cont-datele-mele' },
      { id: 'confidentialitate-termeni', labelKey: 'cont.rows.confidentialitateTermeni', Icon: ShieldCheck, target: 'cont-confidentialitate-termeni' },
    ],
  },
  {
    id: 'ajutor',
    titleKey: 'cont.sections.ajutor',
    rows: [
      { id: 'ajutor-despre', labelKey: 'cont.rows.ajutorDespre', Icon: LifeBuoy, target: 'cont-ajutor-despre' },
    ],
  },
  {
    id: 'danger',
    titleKey: 'cont.sections.danger',
    danger: true,
    rows: [{ id: 'danger', labelKey: 'cont.rows.danger', Icon: AlertTriangle, danger: true, target: 'settings-danger' }],
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
  // (persisted + synced per-UID like accent/theme). The hero falls back to the
  // gradient initial when no preset is picked.
  //
  // §avatar-tap-pick (founder 2026-06-12 "nu vad rostul la Change Avatar ca
  // buton... user sa poata apasa pe avatar, sa isi aleaga avatarul si sa apese
  // confirm"): the ENTRY POINT is the avatar itself (tapping it opens the inline
  // picker — the separate "Schimba avatarul" toggle row was removed). Selection
  // is a DRAFT (local state) that applies only on an explicit Confirm; tapping a
  // preset no longer writes the store immediately. The draft re-seeds from the
  // committed id each time the picker opens.
  const avatarId = useSettingsStore((s) => s.avatarId);
  const setAvatar = useSettingsStore((s) => s.setAvatar);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(avatarId);

  const openPicker = (): void => {
    setDraftAvatar(avatarId);
    setPickerOpen(true);
  };
  const togglePicker = (): void => {
    if (pickerOpen) {
      setPickerOpen(false);
    } else {
      openPicker();
    }
  };
  const confirmAvatar = (): void => {
    setAvatar(draftAvatar);
    setPickerOpen(false);
  };

  // Announcements unseen-dot — count of cached entries newer than last-seen.
  // Read once on render from the local cache (no network on Account mount); the
  // dot clears after the user opens the Noutati screen (markAnnouncementsSeen).
  const unseenAnnouncements = getUnseenCount();

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
          onClick={togglePicker}
          aria-expanded={pickerOpen}
          aria-controls="cont-avatar-picker"
          aria-label={t('cont.avatar.change')}
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

      {/* Avatar preset picker — expands inline under the account card when the
          hero avatar is tapped (the only entry point; the old "Schimba avatarul"
          toggle row was removed per founder 2026-06-12). A preset tap stages a
          DRAFT; the explicit "Confirma" button commits it (settingsStore.avatarId)
          + closes the picker. Kept off the always-visible surface so the Account
          home stays a clean list. */}
      {pickerOpen && (
        <div
          className="pulse-card px-4 pt-1 pb-4 overflow-hidden mb-4 animate-card-rise"
          id="cont-avatar-picker"
          data-testid="cont-avatar-picker"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink3 mb-3 mt-3">
            {t('cont.avatar.pickerLabel')}
          </p>
          <AvatarPicker
            selectedId={draftAvatar}
            onSelect={(id) => setDraftAvatar(draftAvatar === id ? null : id)}
          />
          <p className="text-[11px] text-ink3 mt-3 leading-relaxed">{t('cont.avatar.hint')}</p>
          <button
            type="button"
            onClick={confirmAvatar}
            data-testid="cont-avatar-confirm"
            className="btn-grad btn-primary-lift press-feedback w-full mt-3.5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            {t('cont.avatar.confirm')}
          </button>
        </div>
      )}

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
                      .cont-ico) — small tinted square behind the glyph. An
                      unseen-badge row (Noutati) carries a small accent dot on
                      the chip when there are new announcements. */}
                  <span className="relative w-9 h-9 rounded-[11px] grid place-items-center flex-shrink-0 bg-paper">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {row.unseenBadge && unseenAnnouncements > 0 && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full grid place-items-center text-[10px] font-bold leading-none"
                        style={{ background: 'var(--grad-pulse)', color: 'var(--on-accent)', boxShadow: '0 0 0 2px var(--paper)' }}
                        data-testid={`cont-row-${row.id}-unseen`}
                        aria-label={t('announcements.unseenBadge', { count: unseenAnnouncements })}
                      >
                        {unseenAnnouncements}
                      </span>
                    )}
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
