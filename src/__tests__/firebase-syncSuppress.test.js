// ══ C3-S-01 audit fix (REAUDIT3 LOW) — syncToFirebase gated by suppress flag ══
//
// RE-S-02 set window._suppressFirebaseSync on the delete path, but syncToFirebase
// itself was ungated and an _syncTimer armed (DB.set 3s debounce, firebase.js:359-361)
// BEFORE the flag was set still fired its callback. On the SPA delete path (no page
// reload to nuke the timer) that armed push could re-PUT users/{uid} during the awaited
// cloud-wipe window — the resurrection RE-S-01 closed. Fix: early-return in
// syncToFirebase when window._suppressFirebaseSync is set, so an in-flight armed push
// no-ops. Normal sync (flag falsy) unchanged.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncToFirebase } from '../firebase.js';
import { DB } from '../db.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-suppress-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-suppress-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

describe('firebase — C3-S-01 syncToFirebase suppress gate', () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    _seedAuth();
    fetchMock = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    globalThis.fetch = fetchMock;
    delete window._suppressFirebaseSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    _resetAuth();
    delete window._suppressFirebaseSync;
  });

  it('direct call short-circuits (no PUT) when _suppressFirebaseSync is set', async () => {
    window._suppressFirebaseSync = true;
    const ok = await syncToFirebase();
    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('an _syncTimer armed BEFORE suppress was set fires but issues no PUT (delete-path race)', async () => {
    vi.useFakeTimers();
    // 1. Arm _syncTimer the way an engine SYNC_KEY write does in the ~3s before tap.
    DB.set('weights', { '2026-05-25': 80 });
    // 2. Delete flow sets the flag (DeleteAccountConfirm.tsx:104) — but the timer is
    //    already armed and firebase.js:359 only blocks NEW scheduling, not this callback.
    window._suppressFirebaseSync = true;
    // 3. The 3s debounce fires syncToFirebase; the new gate must make it a no-op.
    await vi.advanceTimersByTimeAsync(3000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normal sync (no suppress) still issues the users/{uid} PATCH — behavior unchanged', async () => {
    DB.set('weights', { '2026-05-25': 80 });
    const ok = await syncToFirebase();
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('users/uid-suppress-test');
    // FCM-sync audit fix — PATCH (not whole-tree PUT) preserves sibling FCM nodes.
    expect(init?.method).toBe('PATCH');
  });
});
