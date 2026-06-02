// ══ storeSync — fresh-device cloud hydrate persists through the kv edge ═══════
// RN port Wave 1a (route every persisted edge through `src/storage/kv`).
//
// Proves the cross-device data-load contract end to end: a RETURNING user logs
// in on a FRESH device (empty kv backing — nothing in localStorage/MMKV), the
// cloud GET hydrates every wv2 store via storeMerge's no-clobber merge, and the
// hydrated state is WRITTEN BACK THROUGH `kv` (the Zustand `persist` storage that
// W1a re-pointed from `() => localStorage` to `() => kv`). On web `kv` IS
// localStorage (behavior-identical); on RN it is MMKV — so this same path keeps a
// reinstalled user's data on native. Nothing is lost.
//
// Distinct from storeSync.test.ts (which asserts the in-memory merge rules): this
// asserts the PERSISTENCE edge — the kv-backed `wv2-*` keys reflect the hydrated
// data, which is the load-bearing behavior the kv wiring exists for.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AUTH_STORAGE_KEYS } from '../../../auth.js';
import { kv } from '../../../storage/kv';
import { hydrateStoresFromCloud, __resetStoreSyncForTest } from '../../lib/storeSync';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useProgresStore } from '../../stores/progresStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAerobicStore } from '../../stores/aerobicStore';

const UID = 'kv-hydrate-uid-1';

function seedAuth(): void {
  // Auth seeding uses kv too — the only state a fresh device carries post-login.
  kv.setItem(AUTH_STORAGE_KEYS.uid, UID);
  kv.setItem(AUTH_STORAGE_KEYS.idToken, 'fake-id-token');
  kv.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 60 * 60 * 1000));
}

/** Stub fetch to return per-node RTDB envelopes for GET users/{uid}/wv2/<node>. */
function stubFetch(nodes: Record<string, unknown>): void {
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    if (method !== 'GET') return { ok: true, json: async () => ({}) } as Response;
    for (const [node, payload] of Object.entries(nodes)) {
      if (url.includes(`users/${UID}/wv2/${node}`)) {
        return { ok: true, json: async () => payload } as Response;
      }
    }
    return { ok: true, json: async () => null } as Response;
  }));
}

beforeEach(() => {
  // Fresh device = empty kv backing. clear() flows to localStorage in web/jsdom.
  localStorage.clear();
  __resetStoreSyncForTest();
  // Reset every store to the empty cold-boot shape a fresh install would have.
  useWorkoutStore.getState().reset();
  useWorkoutStore.setState({ sessionsHistory: [], lastSession: null, streak: 0, lastStreakDate: null });
  useProgresStore.getState().reset();
  useNutritionStore.getState().reset();
  useOnboardingStore.getState().reset();
  useAerobicStore.getState().reset();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('storeSync — fresh-device cloud hydrate persists through kv (W1a)', () => {
  it('a returning user on a clean device pulls ALL stores; nothing lost; kv backing holds the hydrated data', async () => {
    seedAuth();
    stubFetch({
      workout: {
        data: { sessionsHistory: [{ title: 'Push A', meta: '', ts: 1700 }, { title: 'Pull B', meta: '', ts: 1800 }], streak: 7, lastStreakDate: '2026-05-30' },
        updatedAt: 1800,
      },
      progres: {
        data: { weightLog: [{ kg: 82, date: '2026-05-28', ts: 1500 }], bodyData: [], targetObiectiv: { weightKg: 78, month: '2026-10' } },
        updatedAt: 1500,
      },
      nutrition: { data: { dailyLog: [{ dateISO: '2026-05-28', kcal: 2300, protein: 160, ts: 1500 }] }, updatedAt: 1500 },
      onboarding: {
        data: { data: { age: 34, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 82, height: 181, targetWeight: 78, targetDate: '2026-10-01' }, completed: true, completedAt: 1400 },
        updatedAt: 1400,
      },
      aerobic: { data: { sessions: [{ date: '2026-05-29', type: 'spinning', minutes: 45, kcal: 400, ts: 1600 }], lastDuration: 45, subjectiveByDate: { '2026-05-29': 'rested' } }, updatedAt: 1600 },
    });

    await hydrateStoresFromCloud();

    // ── In-memory: every store recovered, nothing dropped ─────────────────────
    expect(useWorkoutStore.getState().sessionsHistory.map((s) => s.ts).sort()).toEqual([1700, 1800]);
    expect(useWorkoutStore.getState().streak).toBe(7);
    expect(useProgresStore.getState().weightLog).toHaveLength(1);
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(78);
    expect(useNutritionStore.getState().dailyLog).toHaveLength(1);
    expect(useOnboardingStore.getState().data.age).toBe(34);
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(useAerobicStore.getState().sessions).toHaveLength(1);

    // ── Persistence edge: the kv-backed wv2-* keys now hold the hydrated data ──
    // (Zustand persist wrote them synchronously through createJSONStorage(() => kv)
    //  when storeMerge.apply called setState.) On RN this is MMKV — same path.
    const workoutPersisted = JSON.parse(kv.getItem('wv2-workout-store') as string);
    expect(workoutPersisted.state.sessionsHistory.map((s: { ts: number }) => s.ts).sort()).toEqual([1700, 1800]);
    expect(workoutPersisted.state.streak).toBe(7);

    const progresPersisted = JSON.parse(kv.getItem('wv2-progres-store') as string);
    expect(progresPersisted.state.weightLog).toHaveLength(1);
    expect(progresPersisted.state.targetObiectiv.weightKg).toBe(78);

    const nutritionPersisted = JSON.parse(kv.getItem('wv2-nutrition-store') as string);
    expect(nutritionPersisted.state.dailyLog).toHaveLength(1);

    const onboardingPersisted = JSON.parse(kv.getItem('wv2-onboarding-store') as string);
    expect(onboardingPersisted.state.completed).toBe(true);
    expect(onboardingPersisted.state.data.age).toBe(34);

    const aerobicPersisted = JSON.parse(kv.getItem('wv2-aerobic-store') as string);
    expect(aerobicPersisted.state.sessions).toHaveLength(1);
  });
});
