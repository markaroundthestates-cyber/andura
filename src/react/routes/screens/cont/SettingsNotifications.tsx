// ══ SETTINGS NOTIFICATIONS — Phase 6 task_10 Cont Sub-Screen ═════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-notifications
// (L1942-1966). Toggle preferences + frecventa + zile active + ora.
// Master toggle deleaga la modulul FCM push real (pushNotifications.ts) +
// sincronizeaza preferintele la RTDB users/<uid>/notificationPrefs
// (notificationPrefsSync.ts) ca scheduler-ul (Agent B) sa le citeasca.
//
// §F-pass2-settings-notif-02 HIGH-BETA chat 4 Co-CTO ADDITIVE decision —
// Mockup paradigm: domain-grouped per-event toggles (Antrenament + Coaching +
// Ore de liniste). Prod paradigm: master toggle + frequency picker + days.
// Resolution: KEEP existing functional global controls (frequency/days/time/
// permission API) AND adauga per-event domain section per mockup parity.
// Per-event toggles persist localStorage direct (wv2-notif-event-*) — NU via
// useSettingsStore (cross-ownership boundary). Functional > strict parity.

import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { NotificationFrequency } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { Toggle } from '../../../components/Toggle';
import { enablePushNotifications, disablePushNotifications } from '../../../lib/pushNotifications';
import { syncNotificationPrefs } from '../../../lib/notificationPrefsSync';
import { t } from '../../../../i18n/index.js';

// 'no-account' = push CERE un cont (uid) ca antrenorul sa poata trimite
// reminder-e server-side; anonim → hint Gigel-friendly.
type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported' | 'no-account';

function readPermission(): NotifPermission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

// Locale-independent day initials for the picker (Monday-first weekly).
// These are display glyphs only — the engine indexes by integer 0-6. Single-
// char glyphs are unambiguous (no Romanian-specific letters), so we keep them
// as constants without i18n; aria-labels go through t() (day name spoken).
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const FREQUENCY_OPTIONS: ReadonlyArray<{ value: NotificationFrequency; labelKey: string }> = [
  { value: 'zilnic', labelKey: 'settings.notifications.frequencyDaily' },
  { value: 'saptamanal', labelKey: 'settings.notifications.frequencyWeekly' },
  { value: 'off', labelKey: 'settings.notifications.frequencyOff' },
];

// §F-pass2-settings-notif-02 — per-event domain toggles mockup parity.
// Mockup andura-clasic.html L1948-1959 verbatim 5 toggles + 2 domain groups.
// titles/descriptions live in i18n bundles (settings.notifications.events.*).
interface NotifEvent {
  key: string;            // localStorage key suffix (wv2-notif-event-${key})
  testId: string;         // data-testid for tests
  titleKey: string;       // i18n key for title (bold)
  descKey: string;        // i18n key for description
  defaultOn: boolean;     // Mockup default toggle state
}
const NOTIF_EVENTS_ANTRENAMENT: ReadonlyArray<NotifEvent> = [
  { key: 'session-reminder', testId: 'notif-event-session-reminder',
    titleKey: 'settings.notifications.events.sessionReminderTitle',
    descKey: 'settings.notifications.events.sessionReminderDesc', defaultOn: true },
  { key: 'rest-timer', testId: 'notif-event-rest-timer',
    titleKey: 'settings.notifications.events.restTimerTitle',
    descKey: 'settings.notifications.events.restTimerDesc', defaultOn: true },
  { key: 'session-missed', testId: 'notif-event-session-missed',
    titleKey: 'settings.notifications.events.sessionMissedTitle',
    descKey: 'settings.notifications.events.sessionMissedDesc', defaultOn: false },
];
const NOTIF_EVENTS_COACHING: ReadonlyArray<NotifEvent> = [
  { key: 'daily-coach', testId: 'notif-event-daily-coach',
    titleKey: 'settings.notifications.events.dailyCoachTitle',
    descKey: 'settings.notifications.events.dailyCoachDesc', defaultOn: true },
  { key: 'weekly-summary', testId: 'notif-event-weekly-summary',
    titleKey: 'settings.notifications.events.weeklySummaryTitle',
    descKey: 'settings.notifications.events.weeklySummaryDesc', defaultOn: true },
];

function readNotifEventEnabled(key: string, defaultOn: boolean): boolean {
  try {
    if (typeof localStorage === 'undefined') return defaultOn;
    const raw = localStorage.getItem(`wv2-notif-event-${key}`);
    if (raw === null) return defaultOn;
    return raw === '1';
  } catch {
    return defaultOn;
  }
}

function writeNotifEventEnabled(key: string, value: boolean): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(`wv2-notif-event-${key}`, value ? '1' : '0');
  } catch {}
}

export function SettingsNotifications(): JSX.Element {
  const navigate = useNavigate();
  const enabled = useSettingsStore((s) => s.notificationsEnabled);
  const frequency = useSettingsStore((s) => s.notificationFrequency);
  const days = useSettingsStore((s) => s.notificationDays);
  const time = useSettingsStore((s) => s.notificationTime);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const setNotificationFrequency = useSettingsStore((s) => s.setNotificationFrequency);
  const toggleNotificationDay = useSettingsStore((s) => s.toggleNotificationDay);
  const setNotificationTime = useSettingsStore((s) => s.setNotificationTime);

  // §32-H2 graceful permission ladder: read browser permission state +
  // request on user toggle-active gesture. Gigel-friendly: don't request
  // on mount (paternalism), only when user explicitly enables notifications.
  const [permission, setPermission] = useState<NotifPermission>(readPermission);
  useEffect(() => {
    setPermission(readPermission());
  }, []);

  // §F-perceived-perf 2026-05-28 (Daniel verbatim "butonul de notificari merge
  // cu un foarte mare delay") — pending state so the master toggle visibly
  // reflects in-flight work (lazy Firebase SDK load + getToken + RTDB PUT can
  // take 1-2s on first run). Without this the button looks frozen for that
  // window. UI also guards against double-click while pending.
  const [togglePending, setTogglePending] = useState(false);

  // §F-pass2-settings-notif-02 — per-event domain toggle state. localStorage
  // hydrate on mount, write on each toggle. Persisted in-ownership (not via
  // settingsStore — cross-cluster boundary).
  const allEvents = [...NOTIF_EVENTS_ANTRENAMENT, ...NOTIF_EVENTS_COACHING];
  const [eventStates, setEventStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const ev of allEvents) {
      init[ev.key] = readNotifEventEnabled(ev.key, ev.defaultOn);
    }
    return init;
  });
  function toggleEvent(key: string): void {
    setEventStates((prev) => {
      const next = !prev[key];
      writeNotifEventEnabled(key, next);
      return { ...prev, [key]: next };
    });
    void syncNotificationPrefs();
  }

  async function handleToggle(): Promise<void> {
    // Guard against re-entrancy while async work is in flight (double-click
    // would otherwise queue a 2nd enable/disable on top of the first).
    if (togglePending) return;

    // §F-perceived-perf — Turning OFF goes fully OPTIMISTIC:
    // flip the store flag IMMEDIATELY (UI responds in <16ms) then run the
    // FCM teardown (lazy SDK + deleteToken + RTDB DELETE) in the background.
    // Teardown is best-effort by design (existing disablePushNotifications
    // swallows all errors silently) so there is nothing to roll back.
    if (enabled) {
      toggleNotifications();
      void syncNotificationPrefs();
      setTogglePending(true);
      void disablePushNotifications().finally(() => setTogglePending(false));
      return;
    }

    // Turning ON — cannot be optimistic because we MUST await
    // Notification.requestPermission() (browser-level prompt) before flipping
    // the flag. We surface a pending state so the toggle visibly reflects
    // in-flight work (lazy SDK + getToken + RTDB PUT on first run). The store
    // flag is set ONLY on 'granted' so the toggle position is never lying.
    setTogglePending(true);
    try {
      const result = await enablePushNotifications();
      switch (result) {
        case 'granted':
          setPermission('granted');
          toggleNotifications();
          void syncNotificationPrefs();
          break;
        case 'denied':
          // Pastreaza toggle OFF; warning denied existent se afiseaza.
          setPermission('denied');
          break;
        case 'unsupported':
          setPermission('unsupported');
          break;
        case 'no-account':
          // Pastreaza toggle OFF + hint Gigel-friendly (vezi notif-no-account-warning).
          setPermission('no-account');
          break;
        case 'error':
          // Esec best-effort (config / network) → toggle ramane OFF, fara UI greoi.
          console.warn('[notif] enablePushNotifications error');
          break;
      }
    } finally {
      setTogglePending(false);
    }
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-notifications">
      <SubHeader
        title={t('settings.notifications.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-notifications-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          {t('settings.notifications.intro')}
        </p>

        <div className="bg-paper2 border border-line rounded-xl p-4 mb-2 flex items-center justify-between">
          <span className="text-sm text-ink">
            {t('settings.notifications.masterToggleLabel')}
            {togglePending && (
              <span
                className="ml-2 text-xs text-ink2 italic"
                data-testid="notif-master-pending"
                aria-live="polite"
              >
                {t('settings.notifications.applyingHint')}
              </span>
            )}
          </span>
          <Toggle
            checked={enabled}
            onToggle={() => { void handleToggle(); }}
            ariaLabel={t('settings.notifications.masterToggleLabel')}
            testId="notif-master-toggle"
            disabled={togglePending}
          />
        </div>

        {permission === 'denied' && (
          <div
            data-testid="notif-permission-warning"
            role="status"
            className="flex items-start gap-2 p-3 rounded-xl border mb-4"
            style={{
              background: 'var(--status-neutral-bg)',
              borderColor: 'var(--status-neutral-border)',
            }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
            <p className="text-xs text-ink2 leading-relaxed">
              {t('settings.notifications.permissionDenied')}
            </p>
          </div>
        )}
        {permission === 'no-account' && (
          <div
            data-testid="notif-no-account-warning"
            role="status"
            className="flex items-start gap-2 p-3 rounded-xl border mb-4"
            style={{
              background: 'var(--status-neutral-bg)',
              borderColor: 'var(--status-neutral-border)',
            }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
            <p className="text-xs text-ink2 leading-relaxed">
              {t('settings.notifications.permissionNoAccount')}
            </p>
          </div>
        )}
        {permission === 'unsupported' && (
          <p
            data-testid="notif-unsupported-warning"
            className="text-xs text-ink2 mb-4 italic"
          >
            {t('settings.notifications.permissionUnsupported')}
          </p>
        )}
        <div className="mb-4" />{/* spacer keeping rhythm post permission warning */}

        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Day picker mai jos pastreaza role="group" +
            aria-labelledby (multi-select valid, NOT mutually exclusive). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.notifications.frequencyHeading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          {FREQUENCY_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`notif-freq-${opt.value}`}
              aria-pressed={frequency === opt.value}
              disabled={!enabled}
              onClick={() => { setNotificationFrequency(opt.value); void syncNotificationPrefs(); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm ${idx < FREQUENCY_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${frequency === opt.value ? 'text-brick font-semibold' : 'text-ink'} disabled:opacity-50`}
            >
              <span>{t(opt.labelKey)}</span>
              {frequency === opt.value && <span aria-hidden="true">•</span>}
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2" id="notif-days-label">
          {t('settings.notifications.daysHeading')}
        </p>
        <div
          className="flex gap-1.5 mb-4"
          data-testid="notif-day-picker"
          role="group"
          aria-labelledby="notif-days-label"
        >
          {DAY_LABELS.map((label, idx) => (
            <button
              key={`day-${idx}`}
              type="button"
              aria-pressed={days[idx]}
              aria-label={t('settings.notifications.dayAria', { label })}
              data-testid={`notif-day-${idx}`}
              disabled={!enabled}
              onClick={() => { toggleNotificationDay(idx); void syncNotificationPrefs(); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border disabled:opacity-50 ${days[idx] ? 'bg-brick text-paper border-brick' : 'bg-paper2 text-ink2 border-line'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.notifications.reminderTimeHeading')}
        </p>
        <div className="bg-paper2 border border-line rounded-xl p-4 mb-4">
          <input
            type="time"
            value={time}
            disabled={!enabled}
            onChange={(e) => { setNotificationTime(e.target.value || time); void syncNotificationPrefs(); }}
            aria-label={t('settings.notifications.reminderTimeAria')}
            data-testid="notif-time-input"
            className="w-full px-3 py-2 border border-lineStrong rounded-xl bg-paper text-ink font-mono text-base disabled:opacity-50"
          />
        </div>

        {/* §F-pass2-settings-notif-02 HIGH-BETA chat 4 — per-event domain
            toggles mockup parity andura-clasic.html L1948-1959. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.notifications.trainingHeading')}
        </p>
        <div
          className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4"
          data-testid="notif-events-antrenament"
        >
          {NOTIF_EVENTS_ANTRENAMENT.map((ev, idx) => (
            <NotifEventRow
              key={ev.key}
              event={ev}
              checked={eventStates[ev.key] ?? ev.defaultOn}
              onToggle={() => toggleEvent(ev.key)}
              disabled={!enabled}
              isLast={idx === NOTIF_EVENTS_ANTRENAMENT.length - 1}
            />
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.notifications.coachingHeading')}
        </p>
        <div
          className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4"
          data-testid="notif-events-coaching"
        >
          {NOTIF_EVENTS_COACHING.map((ev, idx) => (
            <NotifEventRow
              key={ev.key}
              event={ev}
              checked={eventStates[ev.key] ?? ev.defaultOn}
              onToggle={() => toggleEvent(ev.key)}
              disabled={!enabled}
              isLast={idx === NOTIF_EVENTS_COACHING.length - 1}
            />
          ))}
        </div>

        {/* §F-pass2-settings-notif-03 — Quiet hours display per mockup
            L1961-1964. V1 read-only info row (not interactive picker). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.notifications.quietHoursHeading')}
        </p>
        <div
          className="bg-paper2 border border-line rounded-xl px-4 py-3"
          data-testid="notif-quiet-hours"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink">{t('settings.notifications.doNotDisturb')}</span>
            <span className="text-sm text-ink2 font-mono">{t('settings.notifications.quietHoursRange')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// §F-pass2-settings-notif-02 — per-event toggle row component. Mirror
// SettingsPrivacy ToggleRow pattern (44x44 tap target Maria 65 friendly).
interface NotifEventRowProps {
  event: NotifEvent;
  checked: boolean;
  disabled: boolean;
  isLast: boolean;
  onToggle: () => void;
}

function NotifEventRow({ event, checked, disabled, isLast, onToggle }: NotifEventRowProps): JSX.Element {
  const title = t(event.titleKey);
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 ${isLast ? '' : 'border-b border-line'} ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink mb-0.5">{title}</p>
        <p className="text-xs text-ink2 leading-snug">{t(event.descKey)}</p>
      </div>
      <Toggle
        checked={checked}
        onToggle={onToggle}
        ariaLabel={title}
        testId={event.testId}
        disabled={disabled}
      />
    </div>
  );
}
