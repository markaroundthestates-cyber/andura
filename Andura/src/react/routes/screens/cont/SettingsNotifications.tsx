// ══ SETTINGS NOTIFICATIONS — Phase 6 task_10 Cont Sub-Screen ═════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-notifications
// (L1942-1966). Toggle preferences + frecventa + zile active + ora.
// UI-only V1 — ZERO actual notification dispatch (Phase 7+ service worker
// + Notification API permissions flow).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { NotificationFrequency } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';

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

        <div className="bg-paper2 border border-line rounded-xl p-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-ink">Notificari active</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Activeaza notificari"
            data-testid="notif-master-toggle"
            onClick={toggleNotifications}
            className={`w-12 h-6 rounded-full transition relative ${enabled ? 'bg-brick' : 'bg-line'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-paper transition ${enabled ? 'left-6' : 'left-0.5'}`}
            />
          </button>
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Frecventa
        </p>
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          {FREQUENCY_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`notif-freq-${opt.value}`}
              aria-checked={frequency === opt.value}
              role="radio"
              disabled={!enabled}
              onClick={() => setNotificationFrequency(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm ${idx < FREQUENCY_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${frequency === opt.value ? 'text-brick font-semibold' : 'text-ink'} disabled:opacity-50`}
            >
              <span>{opt.label}</span>
              {frequency === opt.value && <span aria-hidden="true">•</span>}
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Zile active
        </p>
        <div className="flex gap-1.5 mb-4" data-testid="notif-day-picker">
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
            onChange={(e) => setNotificationTime(e.target.value || '18:00')}
            data-testid="notif-time-input"
            className="w-full px-3 py-2 border border-[var(--line-strong)] rounded-lg bg-paper text-ink font-mono text-base disabled:opacity-50"
          />
        </div>
      </div>
    </section>
  );
}
