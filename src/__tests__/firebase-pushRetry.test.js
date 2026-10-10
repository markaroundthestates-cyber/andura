// sync_push_retry_v1 (founder 2026-10-10: his finished session sat on the phone for
// 1.5 h) — a flat push that did not land stays pending until one does.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncToFirebase, flushPendingPush, hasPendingPush } from '../firebase.js';
import { DB } from '../db.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

describe('firebase — a push that did not land stays pending', () => {
  let ok = false;
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-retry');
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok');
    localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
    delete window._suppressFirebaseSync;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    globalThis.fetch = vi.fn(async () => new Response('{}', { status: ok ? 200 : 503 }));
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); localStorage.clear(); });

  it('a failed push keeps the write pending; the flush sends it; then nothing is pending', async () => {
    ok = false;
    DB.set('readiness', { '2026-10-10': 3 });
    expect(hasPendingPush()).toBe(true);
    await syncToFirebase();
    expect(hasPendingPush()).toBe(true);
    ok = true;
    await flushPendingPush();
    expect(hasPendingPush()).toBe(false);
    const calls = globalThis.fetch.mock.calls.length;
    await flushPendingPush();
    expect(globalThis.fetch.mock.calls.length).toBe(calls);
  });
});
