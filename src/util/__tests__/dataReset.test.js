// A2 H-1 audit fix — authoritative reset key-clearing tests.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clearUserDataKeys,
  RESET_LEGACY_KEYS,
  wipeUserDataOnLogout,
  enforceDataOwner,
  DATA_OWNER_UID_KEY,
} from '../dataReset.js';
import { PRESERVE_ON_RESET_KEYS } from '../dataRegistry.js';

beforeEach(() => {
  localStorage.clear();
});

describe('clearUserDataKeys', () => {
  it('clears all wv2-* Zustand store keys', () => {
    localStorage.setItem('wv2-workout-store', 'x');
    localStorage.setItem('wv2-nutrition-store', 'x');
    localStorage.setItem('wv2-progres-store', 'x');
    clearUserDataKeys();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('wv2-nutrition-store')).toBeNull();
    expect(localStorage.getItem('wv2-progres-store')).toBeNull();
  });

  it('clears ALL unprefixed engine data keys (the A2 H-1 root cause)', () => {
    for (const key of RESET_LEGACY_KEYS) {
      localStorage.setItem(key, JSON.stringify({ v: 1 }));
    }
    clearUserDataKeys();
    for (const key of RESET_LEGACY_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('clears dynamic-prefix runtime keys (aa-cooldown-*, ex-extra-sets-*, ...)', () => {
    localStorage.setItem('aa-cooldown-Bench', '1');
    localStorage.setItem('ex-extra-sets-Squat', '2');
    localStorage.setItem('muscle-extra-chest', '3');
    localStorage.setItem('backup-2026', 'snapshot');
    clearUserDataKeys();
    expect(localStorage.getItem('aa-cooldown-Bench')).toBeNull();
    expect(localStorage.getItem('ex-extra-sets-Squat')).toBeNull();
    expect(localStorage.getItem('muscle-extra-chest')).toBeNull();
    expect(localStorage.getItem('backup-2026')).toBeNull();
  });

  it('PRESERVES account session (firebase-* tokens) so user stays logged in', () => {
    localStorage.setItem('firebase-id-token', 'tok');
    localStorage.setItem('firebase-uid', 'uid');
    localStorage.setItem('firebase-refresh-token', 'rtok');
    localStorage.setItem('firebase-id-token-expiry', '999');
    localStorage.setItem('logs', 'data');
    clearUserDataKeys();
    expect(localStorage.getItem('firebase-id-token')).toBe('tok');
    expect(localStorage.getItem('firebase-uid')).toBe('uid');
    expect(localStorage.getItem('firebase-refresh-token')).toBe('rtok');
    expect(localStorage.getItem('firebase-id-token-expiry')).toBe('999');
    expect(localStorage.getItem('logs')).toBeNull();
  });

  it('PRESERVES device identity + UI prefs (PRESERVE_ON_RESET_KEYS)', () => {
    for (const key of PRESERVE_ON_RESET_KEYS) {
      localStorage.setItem(key, 'keep');
    }
    localStorage.setItem('coach-decisions', 'wipe-me');
    clearUserDataKeys();
    for (const key of PRESERVE_ON_RESET_KEYS) {
      expect(localStorage.getItem(key)).toBe('keep');
    }
    expect(localStorage.getItem('coach-decisions')).toBeNull();
  });

  it('returns the count of keys removed', () => {
    localStorage.setItem('wv2-workout-store', 'x');
    localStorage.setItem('logs', 'x');
    localStorage.setItem('device-id', 'keep'); // preserved, not counted
    const removed = clearUserDataKeys();
    expect(removed).toBe(2);
  });

  it('PRESERVES the data-owner marker (H1 — same user not re-wiped next login)', () => {
    localStorage.setItem(DATA_OWNER_UID_KEY, 'uid-A');
    localStorage.setItem('logs', 'data');
    clearUserDataKeys();
    expect(localStorage.getItem(DATA_OWNER_UID_KEY)).toBe('uid-A');
    expect(localStorage.getItem('logs')).toBeNull();
  });
});

// ── XCUT-1 reset cloud-clear — RESET must delete the wv2 cloud subtree ────────
// The store-sync wv2-* subtree (aerobic + workout/progres/onboarding/nutrition/
// schedule/settings) was added AFTER clearUserCloudData was built, so a logged-in
// reset deleted only the flat SYNC_KEYS and `hydrateStoresFromCloud` resurrected
// the rest on the next boot. clearUserCloudData must now DELETE the wv2 nodes too.
describe('clearUserCloudData — XCUT-1 wv2 subtree', () => {
  it('deletes the flat SYNC_KEYS AND the wv2 store-sync nodes', async () => {
    const clearFirebaseKeys = vi.fn(async () => {});
    vi.doMock('../../firebase.js', () => ({
      clearFirebaseKeys,
      SYNC_KEYS: ['logs', 'weights'],
    }));
    // Re-import so the mocked firebase.js is the one the function resolves.
    vi.resetModules();
    const { clearUserCloudData: freshClear } = await import('../dataReset.js');
    const { SYNCED_WV2_NODES } = await import('../../react/lib/storeSync');

    await freshClear();

    expect(clearFirebaseKeys).toHaveBeenCalledTimes(1);
    const passedKeys = clearFirebaseKeys.mock.calls[0][0];
    // Flat keys preserved...
    expect(passedKeys).toEqual(expect.arrayContaining(['logs', 'weights']));
    // ...and EVERY wv2 node (incl. the new aerobic node) is deleted.
    for (const node of SYNCED_WV2_NODES) {
      expect(passedKeys).toContain(node);
    }
    expect(passedKeys).toContain('wv2/aerobic');

    vi.doUnmock('../../firebase.js');
    vi.resetModules();
  });
});

// ── H1 shared-device PII leak — logout wipe ──────────────────────────────────
describe('wipeUserDataOnLogout', () => {
  it('clears local user-data keys (the shared-device leak vector)', async () => {
    localStorage.setItem('logs', 'a-data');
    localStorage.setItem('weights', JSON.stringify({ '2026-05-01': 80 }));
    localStorage.setItem('wv2-workout-store', 'x');
    await wipeUserDataOnLogout();
    expect(localStorage.getItem('logs')).toBeNull();
    expect(localStorage.getItem('weights')).toBeNull();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
  });

  it('drops the data-owner marker (fresh login re-establishes ownership)', async () => {
    localStorage.setItem(DATA_OWNER_UID_KEY, 'uid-A');
    await wipeUserDataOnLogout();
    expect(localStorage.getItem(DATA_OWNER_UID_KEY)).toBeNull();
  });

  it('is cloud-SAFE — preserves firebase-* tokens (signOut clears them separately)', async () => {
    // wipeUserDataOnLogout must NOT touch the cloud or the auth tokens; auth.signOut
    // owns the tokens. (Tokens preserved here; the component pairs this with signOut.)
    localStorage.setItem('firebase-refresh-token', 'rtok');
    localStorage.setItem('logs', 'data');
    await wipeUserDataOnLogout();
    expect(localStorage.getItem('firebase-refresh-token')).toBe('rtok');
    expect(localStorage.getItem('logs')).toBeNull();
  });
});

// ── H1 shared-device PII leak — account-switch guard ─────────────────────────
describe('enforceDataOwner', () => {
  it('first login (no marker) records ownership WITHOUT wiping existing data', async () => {
    localStorage.setItem('logs', 'fresh-user-data');
    const wiped = await enforceDataOwner('uid-A');
    expect(wiped).toBe(false);
    expect(localStorage.getItem(DATA_OWNER_UID_KEY)).toBe('uid-A');
    // First login must not wipe — the data already belongs to this (new) owner.
    expect(localStorage.getItem('logs')).toBe('fresh-user-data');
  });

  it('same user (marker === uid) is a no-op — keeps their own data', async () => {
    localStorage.setItem(DATA_OWNER_UID_KEY, 'uid-A');
    localStorage.setItem('logs', 'a-own-data');
    const wiped = await enforceDataOwner('uid-A');
    expect(wiped).toBe(false);
    expect(localStorage.getItem('logs')).toBe('a-own-data');
  });

  it('DIFFERENT uid (account switch w/o logout) wipes prior data + records new owner', async () => {
    localStorage.setItem(DATA_OWNER_UID_KEY, 'uid-A');
    localStorage.setItem('logs', 'a-secret-data');
    localStorage.setItem('weights', JSON.stringify({ '2026-05-01': 80 }));
    const wiped = await enforceDataOwner('uid-B');
    expect(wiped).toBe(true);
    // User A's data is gone before any cloud merge can push it to B's cloud.
    expect(localStorage.getItem('logs')).toBeNull();
    expect(localStorage.getItem('weights')).toBeNull();
    expect(localStorage.getItem(DATA_OWNER_UID_KEY)).toBe('uid-B');
  });

  it('anonymous / skip-auth (no uid) is a no-op (nothing to own)', async () => {
    localStorage.setItem('logs', 'anon-local-data');
    const wiped = await enforceDataOwner(null);
    expect(wiped).toBe(false);
    expect(localStorage.getItem('logs')).toBe('anon-local-data');
    expect(localStorage.getItem(DATA_OWNER_UID_KEY)).toBeNull();
  });
});
