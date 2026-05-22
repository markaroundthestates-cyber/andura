// ══ SETTINGS NOTIFICATIONS — Phase 6 task_10 Cont Sub-Screen ═════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-notifications
// (L1942-1966). Toggle preferences + frecventa + zile active + ora.
// UI-only V1 — ZERO actual notification dispatch (Phase 7+ service worker
// + Notification API permissions flow).

import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { NotificationFrequency } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';

type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

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

  async function handleToggle(): Promise<void> {
    // If turning ON + permission default → request browser permission first.
    if (!enabled && permission === 'default') {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
          toggleNotifications();
        }
        // result === 'denied' → don't enable store toggle; user can manually
        // adjust browser settings later.
      } catch {
        // permission API throw → defensive no-op
      }
      return;
    }
    toggleNotifications();
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-notifications">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-notifications-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Notificari</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          Alegi cand sa primesti imboldiri. Nimic intruziv.
        </p>

        <div className="bg-paper2 border border-line rounded-xl p-4 mb-2 flex items-center justify-between">
          <span className="text-sm text-ink">Notificari active</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Activeaza notificari"
            data-testid="notif-master-toggle"
            onClick={() => { void handleToggle(); }}
            className={`w-12 h-6 rounded-full transition relative ${enabled ? 'bg-brick' : 'bg-line'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-paper transition ${enabled ? 'left-6' : 'left-0.5'}`}
            />
          </button>
        </div>

        {permission === 'denied' && enabled && (
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
        {permission === 'unsupported' && enabled && (
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
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          {FREQUENCY_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`notif-freq-${opt.value}`}
              aria-pressed={frequency === opt.value}
              disabled={!enabled}
              onClick={() => setNotificationFrequency(opt.value)}
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
              onClick={() => toggleNotificationDay(idx)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border disabled:opacity-50 ${days[idx] ? 'bg-brick text-paper border-brick' : 'bg-paper2 text-ink2 border-line'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Ora reminder
        </p>
        <div className="bg-paper2 border border-line rounded-xl p-4">
          <input
            type="time"
            value={time}
            disabled={!enabled}
            onChange={(e) => setNotificationTime(e.target.value || time)}
            aria-label="Ora reminder zilnic"
            data-testid="notif-time-input"
            className="w-full px-3 py-2 border border-lineStrong rounded-lg bg-paper text-ink font-mono text-base disabled:opacity-50"
          />
        </div>
      </div>
    </section>
  );
}
