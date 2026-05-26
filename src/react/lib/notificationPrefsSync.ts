// ══ NOTIFICATION PREFS SYNC — client → RTDB ══════════════════════════════
// Scrie preferintele de notificari ale userului la RTDB users/<uid>/
// notificationPrefs ca scheduler-ul (Agent B) sa stie cand + ce sa trimita.
//
// Shape EXACT citit de scheduler (Agent B):
//   { enabled, frequency, days (boolean[7] 0=Luni..6=Duminica), time 'HH:MM',
//     events: { 'session-reminder', 'rest-timer', 'session-missed',
//               'daily-coach', 'weekly-summary' } }
//
// Sursa valorilor: settingsStore (global controls) + localStorage
// wv2-notif-event-* (per-event domain toggles, SettingsNotifications.tsx).
// Mirror pattern RTDB write din pushNotifications.ts (getUserPath + getIdToken
// + fetch PUT autenticat). Anonim (getUserPath null) → return silent. NU arunca.

import { getUserPath, FIREBASE_URL } from '../../firebase.js';
import { getIdToken } from '../../auth.js';
import { useSettingsStore } from '../stores/settingsStore';

// Per-event keys + defaults — sursa unica de adevar, mirror
// SettingsNotifications.tsx NOTIF_EVENTS_* defaultOn values.
const EVENT_DEFAULTS: ReadonlyArray<{ key: string; defaultOn: boolean }> = [
  { key: 'session-reminder', defaultOn: true },
  { key: 'rest-timer', defaultOn: true },
  { key: 'session-missed', defaultOn: false },
  { key: 'daily-coach', defaultOn: true },
  { key: 'weekly-summary', defaultOn: true },
];

function readEventEnabled(key: string, defaultOn: boolean): boolean {
  try {
    if (typeof localStorage === 'undefined') return defaultOn;
    const raw = localStorage.getItem(`wv2-notif-event-${key}`);
    if (raw === null) return defaultOn;
    return raw === '1';
  } catch {
    return defaultOn;
  }
}

interface NotificationPrefs {
  enabled: boolean;
  frequency: 'zilnic' | 'saptamanal' | 'off';
  days: boolean[];
  time: string;
  events: Record<string, boolean>;
}

/**
 * Construieste shape-ul notificationPrefs din state-ul curent
 * (settingsStore + localStorage per-event flags). Exportat pentru test.
 */
export function buildNotificationPrefs(): NotificationPrefs {
  const s = useSettingsStore.getState();
  const events: Record<string, boolean> = {};
  for (const ev of EVENT_DEFAULTS) {
    events[ev.key] = readEventEnabled(ev.key, ev.defaultOn);
  }
  return {
    enabled: s.notificationsEnabled,
    frequency: s.notificationFrequency,
    days: [...s.notificationDays],
    time: s.notificationTime,
    events,
  };
}

/**
 * Fire-and-forget: scrie notificationPrefs la RTDB users/<uid>/
 * notificationPrefs via REST PUT autenticat. Anonim → no-op silent.
 * NU arunca niciodata (best-effort, mirror pushNotifications.ts).
 */
export async function syncNotificationPrefs(): Promise<void> {
  try {
    const userPath = getUserPath();
    if (!userPath) return; // anonim → nimic de sincronizat server-side

    const prefs = buildNotificationPrefs();
    const idToken = await getIdToken();
    const url = `${FIREBASE_URL}/${userPath}/notificationPrefs.json`
      + (idToken ? `?auth=${encodeURIComponent(idToken)}` : '');
    await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(prefs),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Best-effort — orice esec (network, auth) inghitit silent.
  }
}
