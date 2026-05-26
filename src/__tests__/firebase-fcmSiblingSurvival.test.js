// ══ FCM-sync audit fix — sibling nodes survive a normal sync ════════════════
//
// EVIDENCE (VERDICT-CONSOLIDATED §Cluster 0 / ENGINE-CORRECTNESS H): syncToFirebase
// previously did a whole-tree `PUT users/<uid>` carrying ONLY SYNC_KEYS, which
// (PUT = replace-node semantics) DELETED the sibling nodes `notificationPrefs`
// + `fcmTokens` (written by pushNotifications.ts + notificationPrefsSync.ts) on
// the next ordinary log. The Cloud Functions scheduler then read gone nodes →
// push delivery silently dead.
//
// FIX: the user-tree sync is now a PATCH (multi-path update), not a PUT. RTDB
// REST PATCH merges only the listed child keys at the path and leaves unlisted
// children (fcmTokens / notificationPrefs) intact. This test pins:
//   1. the sync request is a PATCH (preserves siblings by RTDB semantics);
//   2. the body carries ONLY SYNC_KEYS + metadata — it NEVER includes
//      fcmTokens / notificationPrefs, so it cannot overwrite/clear them even
//      with a PATCH (a null in the patch body would delete a key — assert none);
//   3. SYNC_KEYS data still syncs (no regression of the actual backup).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncToFirebase, SYNC_KEYS } from '../firebase.js';
import { DB } from '../db.js';
import { AUTH_STORAGE_KEYS } from '../auth.js';

function _seedAuth() {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-fcm-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'tok-fcm-test');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 3_600_000));
}

function _resetAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

describe('firebase — FCM sibling nodes survive a normal sync', () => {
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
    _resetAuth();
    delete window._suppressFirebaseSync;
  });

  it('uses PATCH (not PUT) so RTDB preserves the fcmTokens / notificationPrefs siblings', async () => {
    DB.set('weights', { '2026-05-25': 80 });
    const ok = await syncToFirebase();
    expect(ok).toBe(true);
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(init?.method).toBe('PATCH');
  });

  it('PATCH body never carries fcmTokens / notificationPrefs (cannot clobber them)', async () => {
    DB.set('weights', { '2026-05-25': 80 });
    DB.set('logs', [{ ts: 1, ex: 'Squat', w: 100 }]);
    await syncToFirebase();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const payload = JSON.parse(init.body);
    expect(payload).not.toHaveProperty('fcmTokens');
    expect(payload).not.toHaveProperty('notificationPrefs');
    // Defensive: the patch must not even contain those keys set to null (a null
    // value in an RTDB PATCH deletes the child — the original clobber vector).
    expect(Object.keys(payload)).not.toContain('fcmTokens');
    expect(Object.keys(payload)).not.toContain('notificationPrefs');
  });

  it('still syncs the SYNC_KEYS backup data (no regression)', async () => {
    DB.set('weights', { '2026-05-25': 80 });
    await syncToFirebase();
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const payload = JSON.parse(init.body);
    expect(payload.weights).toEqual({ '2026-05-25': 80 });
    // every present payload data-key is a recognized SYNC_KEY (or metadata).
    const dataKeys = Object.keys(payload).filter((k) => !k.startsWith('_'));
    for (const k of dataKeys) expect(SYNC_KEYS).toContain(k);
  });
});
