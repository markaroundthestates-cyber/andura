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

// 'no-account' = push CERE un cont (uid) ca antrenorul sa poata trimite
// reminder-e server-side; anonim → hint Gigel-friendly.
type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported' | 'no-account';

function readPermission(): NotifPermission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

const DAY_LABELS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] as const;
const FREQUENCY_OPTIONS: ReadonlyArray<{ value: NotificationFrequency; label: string }> = [
  { value: 'zilnic', label: 'Zilnic' },
  { value: 'saptamanal', label: 'Saptamanal' },
  { value: 'off', label: 'Dezactivat' },
];

// §F-pass2-settings-notif-02 — per-event domain toggles mockup parity.
// Mockup andura-clasic.html L1948-1959 verbatim 5 toggles + 2 domain groups.
interface NotifEvent {
  key: string;            // localStorage key suffix (wv2-notif-event-${key})
  testId: string;         // data-testid for tests
  title: string;          // Mockup row title (bold)
  desc: string;           // Mockup small-text description
  defaultOn: boolean;     // Mockup default toggle state
}
const NOTIF_EVENTS_ANTRENAMENT: ReadonlyArray<NotifEvent> = [
  { key: 'session-reminder', testId: 'notif-event-session-reminder',
    title: 'Reamintire sesiune', desc: 'Cu 30 min inainte de fereastra ta', defaultOn: true },
  { key: 'rest-timer', testId: 'notif-event-rest-timer',
    title: 'Pauza intre seturi', desc: 'Sunet scurt cand expira', defaultOn: true },
  { key: 'session-missed', testId: 'notif-event-session-missed',
    title: 'Sarit sedinta', desc: 'Intreaba cum te simti', defaultOn: false },
];
const NOTIF_EVENTS_COACHING: ReadonlyArray<NotifEvent> = [
  { key: 'daily-coach', testId: 'notif-event-daily-coach',
    title: 'Mesaj zilnic de la antrenor', desc: '07:30 · text scurt', defaultOn: true },
  { key: 'weekly-summary', testId: 'notif-event-weekly-summary',
    title: 'Sumar saptamanal', desc: 'Duminica seara', defaultOn: true },
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
    // Turning OFF → best-effort dezactivare push (sterge token local + RTDB)
    // apoi opreste flag-ul store.
    if (enabled) {
      await disablePushNotifications();
      toggleNotifications();
      void syncNotificationPrefs();
      return;
    }

    // Turning ON → delegheaza cererea de permisiune catre modulul push real
    // (enablePushNotifications cere permisiunea INTERN — NU dubla request aici)
    // + inregistreaza FCM token in RTDB. Mapeaza PushResult la UI state.
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
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-notifications">
      <SubHeader
        title="Notificari"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-notifications-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          Alegi cand sa primesti imboldiri. Nimic intruziv.
        </p>

        <div className="bg-paper2 border border-line rounded-xl p-4 mb-2 flex items-center justify-between">
          <span className="text-sm text-ink">Notificari active</span>
          <Toggle
            checked={enabled}
            onToggle={() => { void handleToggle(); }}
            ariaLabel="Activeaza notificari"
            testId="notif-master-toggle"
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
              Browser-ul blocheaza notificarile. Acceseaza setarile site-ului
              (lacatel langa URL) si activeaza permisiunile.
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
              Notificarile cer un cont, ca antrenorul sa iti poata trimite
              reminder-e. Conecteaza-te ca sa le activezi.
            </p>
          </div>
        )}
        {permission === 'unsupported' && (
          <p
            data-testid="notif-unsupported-warning"
            className="text-xs text-ink2 mb-4 italic"
          >
            Browser-ul nu suporta notificari push.
          </p>
        )}
        <div className="mb-4" />{/* spacer keeping rhythm post permission warning */}

        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Day picker mai jos pastreaza role="group" +
            aria-labelledby (multi-select valid, NOT mutually exclusive). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Frecventa
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
              <span>{opt.label}</span>
              {frequency === opt.value && <span aria-hidden="true">•</span>}
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2" id="notif-days-label">
          Zile active
        </p>
        <div
          className="flex gap-1.5 mb-4"
          data-testid="notif-day-picker"
          role="group"
          aria-labelledby="notif-days-label"
        >
          {DAY_LABELS.map((label, idx) => (
            <button
              key={label}
              type="button"
              aria-pressed={days[idx]}
              aria-label={`Ziua ${label}`}
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
          Ora reminder
        </p>
        <div className="bg-paper2 border border-line rounded-xl p-4 mb-4">
          <input
            type="time"
            value={time}
            disabled={!enabled}
            onChange={(e) => { setNotificationTime(e.target.value || time); void syncNotificationPrefs(); }}
            aria-label="Ora reminder zilnic"
            data-testid="notif-time-input"
            className="w-full px-3 py-2 border border-lineStrong rounded-xl bg-paper text-ink font-mono text-base disabled:opacity-50"
          />
        </div>

        {/* §F-pass2-settings-notif-02 HIGH-BETA chat 4 — per-event domain
            toggles mockup parity andura-clasic.html L1948-1959. KEEP global
            controls above (Co-CTO functional value > strict mockup parity). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Antrenament
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
          Coaching
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

        {/* §F-pass2-settings-notif-03 (MED Wave 7 2026-05-23) — Quiet hours
            display per mockup L1961-1964 ("Ore de liniste" section + "Nu
            deranja 22:00 — 07:00" info row). V1 read-only info, NU picker
            interactive (mockup uses info-row pattern, not time-range picker). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Ore de liniste
        </p>
        <div
          className="bg-paper2 border border-line rounded-xl px-4 py-3"
          data-testid="notif-quiet-hours"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink">Nu deranja</span>
            <span className="text-sm text-ink2 font-mono">22:00 — 07:00</span>
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
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 ${isLast ? '' : 'border-b border-line'} ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink mb-0.5">{event.title}</p>
        <p className="text-xs text-ink2 leading-snug">{event.desc}</p>
      </div>
      <Toggle
        checked={checked}
        onToggle={onToggle}
        ariaLabel={event.title}
        testId={event.testId}
        disabled={disabled}
      />
    </div>
  );
}
