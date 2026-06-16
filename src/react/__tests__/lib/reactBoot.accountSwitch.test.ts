// ══ reactBoot — ACCOUNT-SWITCH in-memory wipe (data-leak fix) ══════════════
// A DIFFERENT account authenticating on a still-authed browser with NO page
// reload (user B opens a magic link on user A's authed device) used to leak A's
// in-memory Zustand state into B: enforceDataOwner wiped localStorage +
// IndexedDB on the switch but NOT the in-memory stores, so the subsequent
// hydrateStoresFromCloud mergeArrayUnion'd A's in-memory sessionsHistory with
// B's cloud → A's sessions appeared in B's UI AND got pushed up to B's cloud
// node (permanent contamination). The fix resets the in-memory stores BEFORE
// the hydrate so the merge lands on an EMPTY local baseline.
//
// Harness mirrors reactBoot.noDataLoss.test.ts: real merge (no mocking of
// storeMerge), real workout store, real localStorage (jsdom), stubbed fetch as
// the RTDB REST surface. We seed the data-owner as A, populate the workout store
// in-memory with A's session, then run the post-auth sync authenticated as B.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AUTH_STORAGE_KEYS } from '../../../auth.js';
import { DATA_OWNER_UID_KEY } from '../../../util/dataReset.js';
import { runPostAuthSync, __resetReactBootGuards } from '../../lib/reactBoot';
import { useWorkoutStore } from '../../stores/workoutStore';

const UID_A = 'switch-uid-AAA';
const UID_B = 'switch-uid-BBB';

const A_SESSION = { title: 'A push day', meta: '5 seturi', ts: 1000 };
const B_CLOUD_SESSION = { title: 'B leg day', meta: '4 seturi', ts: 2000 };

/** Seed valid (non-stale) auth tokens for UID so getUserPath() → users/{uid}. */
function seedAuthAs(uid: string): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, uid);
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'fake-id-token');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 60 * 60 * 1000));
}

/**
 * Stub fetch as the RTDB REST surface. The wv2/workout GET returns B's cloud
 * node (one B session); every other GET is empty. PUTs/PATCHes are captured.
 */
function stubFetch(): { writes: unknown[] } {
  const writes: unknown[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    if (method === 'PUT' || method === 'PATCH') {
      try { writes.push({ url, body: JSON.parse(String(init?.body)) }); } catch { writes.push({ url, body: init?.body }); }
      return { ok: true, json: async () => ({}) } as Response;
    }
    if (method === 'DELETE') {
      return { ok: true, json: async () => ({}) } as Response;
    }
    // B's cloud workout node — one B session, no A data.
    if (url.includes('wv2/workout')) {
      return { ok: true, json: async () => ({ data: { sessionsHistory: [B_CLOUD_SESSION], streak: 0 }, updatedAt: 5000 }) } as Response;
    }
    return { ok: true, json: async () => null } as Response;
  }));
  return { writes };
}

beforeEach(() => {
  localStorage.clear();
  __resetReactBootGuards();
  delete (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  // Reset the workout store to a known clean baseline before each case.
  useWorkoutStore.getState().reset();
  useWorkoutStore.setState({ lastSession: null, sessionsHistory: [], streak: 0, lastStreakDate: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('reactBoot — account switch resets in-memory stores before hydrate', () => {
  it('does not leak prior user A in-memory sessions into user B (UI or cloud payload)', async () => {
    // Prior owner = A; A's session lives in the in-memory workout store.
    localStorage.setItem(DATA_OWNER_UID_KEY, UID_A);
    useWorkoutStore.setState({ sessionsHistory: [A_SESSION], streak: 7, lastSession: A_SESSION });

    // Now B authenticates on the same still-authed browser (no reload).
    seedAuthAs(UID_B);
    stubFetch();

    await runPostAuthSync();

    const after = useWorkoutStore.getState();
    // A's session must NOT survive in the store...
    expect(after.sessionsHistory.find((s) => s.ts === A_SESSION.ts)).toBeUndefined();
    // ...A's streak must not graft onto B (reset to empty baseline, then B-cloud).
    expect(after.streak).toBe(0);
    // ...B's cloud session WAS hydrated onto the empty baseline.
    expect(after.sessionsHistory.find((s) => s.ts === B_CLOUD_SESSION.ts)).toBeDefined();
    // The data-owner marker now records B (switch was detected + handled).
    expect(localStorage.getItem(DATA_OWNER_UID_KEY)).toBe(UID_B);

    // And the would-be push payload (what the sync subscription would PATCH) is
    // free of A's session — no contamination of B's cloud node.
    const pushPayload = useWorkoutStore.getState().sessionsHistory;
    expect(pushPayload.some((s) => s.ts === A_SESSION.ts)).toBe(false);
  });
});
