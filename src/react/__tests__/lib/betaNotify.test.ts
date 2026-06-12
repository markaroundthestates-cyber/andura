// #3 fix 2026-06-12 — "Notify me when it's ready" now records interest to RTDB
// (`/betaNotify/<uid>`) + persists a local flag. Firebase REST + auth + the JWT
// email source are mocked; fetch is stubbed.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  recordBetaNotifyInterest,
  isBetaNotified,
  BETA_NOTIFY_FLAG_KEY,
  BETA_NOTIFY_NODE,
} from '../../lib/betaNotify';

const buildAuthUrl = vi.fn(async (p: string) => `https://rtdb.test/${p}.json?auth=tok`);
const getAuthState = vi.fn();
const getUserProfileDisplay = vi.fn();

let _fbUrl = 'https://rtdb.test';

vi.mock('../../../firebase.js', () => ({
  buildAuthUrl: (p: string) => buildAuthUrl(p),
  get FIREBASE_URL() { return _fbUrl; },
}));
vi.mock('../../../auth.js', () => ({
  getAuthState: () => getAuthState(),
}));
vi.mock('../../routes/screens/cont/userProfile', () => ({
  getUserProfileDisplay: () => getUserProfileDisplay(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  _fbUrl = 'https://rtdb.test';
  getAuthState.mockReturnValue({ uid: 'u1', idToken: 't', expiry: Date.now() + 3_600_000 });
  getUserProfileDisplay.mockReturnValue({ name: 'Dan', email: 'dan@example.com', initial: 'D' });
});

describe('recordBetaNotifyInterest — authenticated write', () => {
  it('PUTs { email, uid, ts } to /betaNotify/<uid> and returns true', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const ok = await recordBetaNotifyInterest(1_700_000_000_000);

    expect(ok).toBe(true);
    expect(buildAuthUrl).toHaveBeenCalledWith(`${BETA_NOTIFY_NODE}/u1`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://rtdb.test/betaNotify/u1.json?auth=tok');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'dan@example.com',
      uid: 'u1',
      ts: 1_700_000_000_000,
    });
  });

  it('persists the local "notified" flag (button sticks across reloads)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    expect(isBetaNotified()).toBe(false);
    await recordBetaNotifyInterest();
    expect(isBetaNotified()).toBe(true);
    expect(localStorage.getItem(BETA_NOTIFY_FLAG_KEY)).toBe('1');
  });

  it('returns false but still flips the local flag when the PUT fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const ok = await recordBetaNotifyInterest();
    expect(ok).toBe(false);
    expect(isBetaNotified()).toBe(true); // local flag set regardless
  });
});

describe('recordBetaNotifyInterest — graceful degradation', () => {
  it('unauthenticated: no network write, local flag set, never throws', async () => {
    getAuthState.mockReturnValue(null);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const ok = await recordBetaNotifyInterest();

    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isBetaNotified()).toBe(true);
  });

  it('RTDB not configured (no FIREBASE_URL): no network write, local flag set', async () => {
    _fbUrl = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const ok = await recordBetaNotifyInterest();

    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isBetaNotified()).toBe(true);
  });

  it('offline (fetch rejects): returns false, never throws, local flag set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    await expect(recordBetaNotifyInterest()).resolves.toBe(false);
    expect(isBetaNotified()).toBe(true);
  });
});

describe('isBetaNotified — persistence', () => {
  it('reads the persisted flag (survives a simulated reload)', () => {
    localStorage.setItem(BETA_NOTIFY_FLAG_KEY, '1');
    // A fresh read (new "page load") sees the flag.
    expect(isBetaNotified()).toBe(true);
  });

  it('false when no flag present', () => {
    expect(isBetaNotified()).toBe(false);
  });
});
