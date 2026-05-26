// ══ NOTIFICATION PREFS SYNC — unit tests ═════════════════════════════════
// Verifica shape-ul construit (match Agent B reader) + short-circuit anonim +
// REST PUT autenticat. firebase.js / auth.js / fetch mocked.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// vi.hoisted: referintele mock trebuie ridicate deasupra import-urilor (la fel
// ca factory-urile vi.mock). Mirror pushNotifications.test.ts pattern.
const { mockGetUserPath, mockGetIdToken } = vi.hoisted(() => ({
  mockGetUserPath: vi.fn<() => string | null>(),
  mockGetIdToken: vi.fn<() => Promise<string | null>>(),
}));

// Path relativ la FISIERUL DE TEST (src/react/__tests__/lib/). Modulul testat
// importa '../../firebase.js' (= src/firebase.js); de aici '../../../firebase.js'.
vi.mock('../../../firebase.js', () => ({
  getUserPath: () => mockGetUserPath(),
  FIREBASE_URL: 'https://fittracker-c34e8-default-rtdb.example.app',
}));
vi.mock('../../../auth.js', () => ({
  getIdToken: () => mockGetIdToken(),
}));

import { buildNotificationPrefs, syncNotificationPrefs } from '../../lib/notificationPrefsSync';
import { useSettingsStore } from '../../stores/settingsStore';

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
  mockGetUserPath.mockReset();
  mockGetIdToken.mockReset();
  vi.restoreAllMocks();
});

describe('buildNotificationPrefs — shape match Agent B reader', () => {
  it('construieste shape-ul exact din settingsStore + per-event localStorage', () => {
    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationFrequency: 'saptamanal',
      notificationTime: '08:30',
    });
    // session-missed default OFF → forteaza ON ca sa verificam citirea localStorage
    localStorage.setItem('wv2-notif-event-session-missed', '1');

    const prefs = buildNotificationPrefs();

    expect(prefs.enabled).toBe(true);
    expect(prefs.frequency).toBe('saptamanal');
    expect(prefs.time).toBe('08:30');
    expect(prefs.days).toHaveLength(7);
    // events: cele 5 chei exacte citite de scheduler.
    expect(Object.keys(prefs.events).sort()).toEqual(
      ['daily-coach', 'rest-timer', 'session-missed', 'session-reminder', 'weekly-summary'],
    );
    // Defaults mockup + override localStorage.
    expect(prefs.events['session-reminder']).toBe(true);
    expect(prefs.events['rest-timer']).toBe(true);
    expect(prefs.events['session-missed']).toBe(true); // override localStorage
    expect(prefs.events['daily-coach']).toBe(true);
    expect(prefs.events['weekly-summary']).toBe(true);
  });

  it('per-event default cand localStorage gol (session-missed OFF default)', () => {
    const prefs = buildNotificationPrefs();
    expect(prefs.events['session-missed']).toBe(false);
  });
});

describe('syncNotificationPrefs — RTDB write', () => {
  it('anonim (getUserPath null) → no-op silent, fara fetch', async () => {
    mockGetUserPath.mockReturnValue(null);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await syncNotificationPrefs();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('autenticat → PUT la users/<uid>/notificationPrefs cu ?auth=<idToken>', async () => {
    mockGetUserPath.mockReturnValue('users/abc123');
    mockGetIdToken.mockResolvedValue('tok-xyz');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    await syncNotificationPrefs();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(String(url)).toContain('users/abc123/notificationPrefs.json');
    expect(String(url)).toContain('auth=tok-xyz');
    expect(init?.method).toBe('PUT');
    const body = JSON.parse(String(init?.body));
    expect(body).toHaveProperty('enabled');
    expect(body).toHaveProperty('frequency');
    expect(body).toHaveProperty('days');
    expect(body).toHaveProperty('time');
    expect(body).toHaveProperty('events');
  });

  it('NU arunca daca fetch rejecteaza (best-effort)', async () => {
    mockGetUserPath.mockReturnValue('users/abc123');
    mockGetIdToken.mockResolvedValue('tok-xyz');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    await expect(syncNotificationPrefs()).resolves.toBeUndefined();
  });
});
