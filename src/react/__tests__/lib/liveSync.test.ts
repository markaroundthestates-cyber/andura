// ══ liveSync.ts — periodic + focus-triggered cloud PULL ══════════════════════
// Verifies the missing PULL half added for multi-device freshness: livePullNow
// re-runs both idempotent merge fns under the right guards (flag/auth/offline/
// suppress/throttle/in-flight), and startLiveSync wires visibility + interval +
// reconnect triggers. All of firebase/storeSync/flags/logger are mocked so no
// real DB/network loads.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const syncFromFirebase = vi.fn(async () => true);
const hydrateStoresFromCloud = vi.fn(async () => {});
let userPath: string | null = 'users/abc';
let flagOn = true;

vi.mock('../../../firebase.js', () => ({
  syncFromFirebase: () => syncFromFirebase(),
  getUserPath: () => userPath,
}));
vi.mock('../../lib/storeSync', () => ({
  hydrateStoresFromCloud: () => hydrateStoresFromCloud(),
}));
vi.mock('../../../util/featureFlags.js', () => ({
  isEnabled: (k: string) => (k === 'live_sync_poll_v1' ? flagOn : false),
}));
vi.mock('../../../util/logger.js', () => ({
  logger: { debug: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import {
  livePullNow,
  startLiveSync,
  stopLiveSync,
  __resetLiveSyncForTest,
  FOREGROUND_POLL_MS,
  MIN_PULL_GAP_MS,
} from '../../lib/liveSync';

const BASE_TIME = new Date('2026-07-03T10:00:00Z').getTime();

function setVisibility(state: 'visible' | 'hidden'): void {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
}
function setOnline(online: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true });
}
// Flush the microtask queue (livePullNow's two awaits) WITHOUT running fake
// timers — running timers would also fire the foreground interval and add a pull.
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
  syncFromFirebase.mockClear();
  hydrateStoresFromCloud.mockClear();
  userPath = 'users/abc';
  flagOn = true;
  setOnline(true);
  setVisibility('visible');
  delete (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync;
  localStorage.removeItem('__suppressFirebaseSyncUntil');
  __resetLiveSyncForTest();
});

afterEach(() => {
  __resetLiveSyncForTest();
  vi.useRealTimers();
});

describe('livePullNow guards', () => {
  it('pulls both channels when authed + online + enabled', async () => {
    await livePullNow('test');
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
    expect(hydrateStoresFromCloud).toHaveBeenCalledTimes(1);
  });

  it('no-op when the flag is off', async () => {
    flagOn = false;
    await livePullNow('test');
    expect(syncFromFirebase).not.toHaveBeenCalled();
    expect(hydrateStoresFromCloud).not.toHaveBeenCalled();
  });

  it('no-op when unauthenticated (null user path)', async () => {
    userPath = null;
    await livePullNow('test');
    expect(syncFromFirebase).not.toHaveBeenCalled();
  });

  it('no-op when offline', async () => {
    setOnline(false);
    await livePullNow('test');
    expect(syncFromFirebase).not.toHaveBeenCalled();
  });

  it('no-op when sync is suppressed via the in-memory flag', async () => {
    (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync = true;
    await livePullNow('test');
    expect(syncFromFirebase).not.toHaveBeenCalled();
    expect(hydrateStoresFromCloud).not.toHaveBeenCalled();
  });

  it('no-op when suppressed via a future __suppressFirebaseSyncUntil', async () => {
    localStorage.setItem('__suppressFirebaseSyncUntil', String(BASE_TIME + 5000));
    await livePullNow('test');
    expect(syncFromFirebase).not.toHaveBeenCalled();
    expect(hydrateStoresFromCloud).not.toHaveBeenCalled();
  });

  it('proceeds once a past __suppressFirebaseSyncUntil has elapsed', async () => {
    localStorage.setItem('__suppressFirebaseSyncUntil', String(BASE_TIME - 1));
    await livePullNow('test');
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
  });
});

describe('livePullNow throttle', () => {
  it('collapses two rapid calls into a single pull', async () => {
    await livePullNow('a');
    await livePullNow('b');
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
  });

  it('allows a second pull after MIN_PULL_GAP_MS', async () => {
    await livePullNow('a');
    vi.setSystemTime(BASE_TIME + MIN_PULL_GAP_MS + 1);
    await livePullNow('b');
    expect(syncFromFirebase).toHaveBeenCalledTimes(2);
  });
});

describe('startLiveSync lifecycle', () => {
  it('pulls when the tab becomes visible', async () => {
    startLiveSync();
    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await flushMicrotasks();
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
  });

  it('does NOT pull on a hidden visibilitychange', async () => {
    startLiveSync();
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    expect(syncFromFirebase).not.toHaveBeenCalled();
  });

  it('pulls on the foreground interval', async () => {
    startLiveSync();
    await vi.advanceTimersByTimeAsync(FOREGROUND_POLL_MS + 1);
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
  });

  it('pulls on network reconnect (online event)', async () => {
    startLiveSync();
    window.dispatchEvent(new Event('online'));
    await flushMicrotasks();
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
  });

  it('is idempotent — a second start does not double-wire the interval', async () => {
    startLiveSync();
    startLiveSync();
    await vi.advanceTimersByTimeAsync(FOREGROUND_POLL_MS + 1);
    expect(syncFromFirebase).toHaveBeenCalledTimes(1);
  });

  it('stopLiveSync removes the listeners + interval', async () => {
    startLiveSync();
    stopLiveSync();
    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(FOREGROUND_POLL_MS + 1);
    expect(syncFromFirebase).not.toHaveBeenCalled();
  });

  it('flag off → wires no listeners', async () => {
    flagOn = false;
    startLiveSync();
    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(FOREGROUND_POLL_MS + 1);
    expect(syncFromFirebase).not.toHaveBeenCalled();
  });
});
