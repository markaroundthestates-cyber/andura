// ══ reactBoot S-07 — NO-DATA-LOSS integration tests ════════════════════════
// The single most important guarantee of the S-07 wiring: wiring cloud restore
// into login must NEVER overwrite newer local data. This file exercises the
// REAL firebase.js merge (syncFromFirebase) — no mocking of the merge — against
// a stubbed RTDB response, with real localStorage (jsdom) as the local tier.
//
// Proves three invariants the restore-on-login path relies on:
//   1. Local-always-wins: a key edited locally is NOT clobbered by the remote
//      value during restore (object-merge conflict resolution).
//   2. Additive restore: keys present only in the cloud ARE pulled down (the
//      "log in on a new device" recovery case actually works).
//   3. Array union by ts: log entries merge by timestamp; no local entry is
//      dropped, remote-only entries are added.
//
// Auth is satisfied by seeding firebase-* tokens so getUserPath() resolves to
// users/{uid}; global fetch is stubbed to return the RTDB payload. We drive
// runPostAuthSync (which calls initFirebaseSync → syncFromFirebase + push-back)
// so the test mirrors the production restore-on-login flow end to end.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DB } from '../../../db.js';
import { AUTH_STORAGE_KEYS } from '../../../auth.js';
import { runPostAuthSync, __resetReactBootGuards } from '../../lib/reactBoot';

const UID = 'noloss-uid-123';

/** Seed valid (non-stale) auth tokens so getUserPath() → users/{uid}. */
function seedAuth(): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, UID);
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'fake-id-token');
  // Far-future expiry so getIdToken returns the token without a refresh fetch.
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 60 * 60 * 1000));
}

/**
 * Stub global fetch to model the RTDB REST surface used by the sync flow:
 *   - GET users/{uid}            → returns `remoteUserDoc`
 *   - GET users/daniel (legacy)  → empty (no legacy source to migrate)
 *   - PUT (push-back / migration) → ok
 * Captures PUT bodies so we can assert the push-back payload if needed.
 */
function stubFetch(remoteUserDoc: Record<string, unknown>): { puts: unknown[] } {
  const puts: unknown[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    if (method === 'PUT') {
      try { puts.push(JSON.parse(String(init?.body))); } catch { puts.push(init?.body); }
      return { ok: true, json: async () => ({}) } as Response;
    }
    if (method === 'DELETE') {
      return { ok: true, json: async () => ({}) } as Response;
    }
    // GET — return remote doc for the user path, empty for the legacy path.
    if (url.includes(`users/${UID}`)) {
      return { ok: true, json: async () => remoteUserDoc } as Response;
    }
    return { ok: true, json: async () => null } as Response;
  }));
  return { puts };
}

beforeEach(() => {
  localStorage.clear();
  __resetReactBootGuards();
  delete (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('S-07 restore-on-login — NO DATA LOSS', () => {
  it('local value WINS over remote on a same-key object conflict', async () => {
    seedAuth();
    // Local edited "today" more recently; remote has a stale value for the
    // same date. After restore, local must survive (no clobber).
    DB.set('weights', { '2026-05-25': 80.0 });
    stubFetch({ weights: { '2026-05-25': 99.9 } });

    await runPostAuthSync();

    expect(DB.get('weights')).toEqual({ '2026-05-25': 80.0 });
  });

  it('restores cloud-only keys (new-device recovery actually works)', async () => {
    seedAuth();
    // Brand-new device: localStorage is empty for these keys; the cloud has the
    // user's history. Restore must PULL them down — the core S-07 user value.
    expect(DB.get('weights')).toBeNull();
    expect(DB.get('kcals')).toBeNull();
    stubFetch({
      weights: { '2026-05-20': 81.2, '2026-05-21': 81.0 },
      kcals: { '2026-05-20': 2400 },
    });

    await runPostAuthSync();

    expect(DB.get('weights')).toEqual({ '2026-05-20': 81.2, '2026-05-21': 81.0 });
    expect(DB.get('kcals')).toEqual({ '2026-05-20': 2400 });
  });

  it('merges object keys as a union (local keys kept, remote-only keys added)', async () => {
    seedAuth();
    DB.set('weights', { '2026-05-25': 80.0 }); // local-only date
    stubFetch({ weights: { '2026-05-20': 81.0, '2026-05-25': 99.9 } });

    await runPostAuthSync();

    // Union: local 05-25 wins its conflict, remote-only 05-20 is added.
    expect(DB.get('weights')).toEqual({ '2026-05-20': 81.0, '2026-05-25': 80.0 });
  });

  it('logs array — no local entry dropped; remote-only entries added (ts union)', async () => {
    seedAuth();
    const localLog = { ts: 2000, date: '2026-05-25', ex: 'Bench', session: 's2' };
    DB.set('logs', [localLog]);
    const remoteOnly = { ts: 1000, date: '2026-05-24', ex: 'Squat', session: 's1' };
    const duplicateTs = { ts: 2000, date: '2026-05-25', ex: 'SHOULD-NOT-OVERWRITE' };
    stubFetch({ logs: [remoteOnly, duplicateTs] });

    await runPostAuthSync();

    const merged = DB.get('logs') as Array<{ ts: number; ex: string }>;
    // Local ts=2000 entry preserved verbatim (dup ts from remote ignored).
    const local2000 = merged.find((e) => e.ts === 2000);
    expect(local2000?.ex).toBe('Bench');
    // Remote-only ts=1000 entry pulled down.
    expect(merged.find((e) => e.ts === 1000)?.ex).toBe('Squat');
    // No data lost: both timestamps present.
    expect(merged.map((e) => e.ts).sort()).toEqual([1000, 2000]);
  });

  it('does nothing destructive when there is no remote doc (empty cloud)', async () => {
    seedAuth();
    DB.set('weights', { '2026-05-25': 80.0 });
    stubFetch({}); // remote empty object → no keys to merge

    await runPostAuthSync();

    // Local data untouched.
    expect(DB.get('weights')).toEqual({ '2026-05-25': 80.0 });
  });
});
