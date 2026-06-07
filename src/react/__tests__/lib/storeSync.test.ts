// ══ storeSync — wv2 hydrate no-clobber integration (08.050/051) ═════════════
// Exercises hydrateStoresFromCloud against the REAL Zustand stores + a stubbed
// RTDB GET. Proves the new-device recovery case (empty local pulls cloud) AND
// the no-clobber case (local edits survive a stale remote), end to end through
// the per-store merge wiring.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AUTH_STORAGE_KEYS } from '../../../auth.js';
import { hydrateStoresFromCloud, __resetStoreSyncForTest } from '../../lib/storeSync';
import { DB } from '../../../db.js';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useProgresStore } from '../../stores/progresStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAerobicStore } from '../../stores/aerobicStore';

const UID = 'storesync-uid-1';

function seedAuth(): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.uid, UID);
  localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'fake-id-token');
  localStorage.setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + 60 * 60 * 1000));
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
  localStorage.clear();
  __resetStoreSyncForTest();
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

describe('hydrateStoresFromCloud — new-device recovery (empty local)', () => {
  it('pulls remote session history + weight log + nutrition when local is empty', async () => {
    seedAuth();
    stubFetch({
      workout: { data: { sessionsHistory: [{ title: 'Push', meta: '', ts: 1000 }], streak: 5, lastStreakDate: '2026-05-25' }, updatedAt: 1000 },
      progres: { data: { weightLog: [{ kg: 81, date: '2026-05-20', ts: 900 }], bodyData: [], targetObiectiv: { weightKg: 75, month: '2026-09' } }, updatedAt: 1000 },
      nutrition: { data: { dailyLog: [{ dateISO: '2026-05-20', kcal: 2400, protein: 150, ts: 900 }] }, updatedAt: 1000 },
    });

    await hydrateStoresFromCloud();

    expect(useWorkoutStore.getState().sessionsHistory.map((s) => s.ts)).toEqual([1000]);
    expect(useWorkoutStore.getState().streak).toBe(5);
    expect(useWorkoutStore.getState().lastStreakDate).toBe('2026-05-25');
    expect(useProgresStore.getState().weightLog).toHaveLength(1);
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(75);
    expect(useNutritionStore.getState().dailyLog).toHaveLength(1);
  });
});

describe('hydrateStoresFromCloud — NO CLOBBER (local edits survive)', () => {
  it('local session NOT dropped; remote-only sessions added (union by ts)', async () => {
    seedAuth();
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'LocalPull', meta: '', ts: 2000 }],
      streak: 8,
    });
    stubFetch({
      workout: { data: { sessionsHistory: [{ title: 'RemoteOld', meta: '', ts: 1000 }, { title: 'SHOULD-NOT-WIN', meta: '', ts: 2000 }], streak: 3 }, updatedAt: 500 },
    });

    await hydrateStoresFromCloud();

    const hist = useWorkoutStore.getState().sessionsHistory;
    expect(hist.map((s) => s.ts).sort()).toEqual([1000, 2000]);
    // Local ts=2000 wins the collision.
    expect(hist.find((s) => s.ts === 2000)?.title).toBe('LocalPull');
    // Remote-only ts=1000 added.
    expect(hist.find((s) => s.ts === 1000)?.title).toBe('RemoteOld');
    // Streak never regresses — max(8,3)=8.
    expect(useWorkoutStore.getState().streak).toBe(8);
  });

  it('local weight entry for a date NOT overwritten by a stale remote value', async () => {
    seedAuth();
    useProgresStore.getState().addWeightEntry({ kg: 80, date: '2026-05-25' });
    stubFetch({
      progres: { data: { weightLog: [{ kg: 99, date: '2026-05-25', ts: 1 }, { kg: 81, date: '2026-05-20', ts: 1 }], bodyData: [] }, updatedAt: 1 },
    });

    await hydrateStoresFromCloud();

    const log = useProgresStore.getState().weightLog;
    expect(log.find((e) => e.date === '2026-05-25')?.kg).toBe(80); // local wins
    expect(log.find((e) => e.date === '2026-05-20')?.kg).toBe(81); // remote added
  });

  it('a completed local onboarding profile is NOT reset by an older remote', async () => {
    seedAuth();
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 180, targetWeight: null, targetDate: null },
      completed: true,
      completedAt: Date.now(),
    });
    stubFetch({
      onboarding: { data: { data: { age: 99, sex: 'f', goal: 'slabire', frequency: '2', experience: 'incepator', weight: 60, height: 160 }, completed: true, completedAt: 1 }, updatedAt: 1 },
    });

    await hydrateStoresFromCloud();

    // Newer local profile preserved.
    expect(useOnboardingStore.getState().data.age).toBe(30);
    expect(useOnboardingStore.getState().completed).toBe(true);
  });

  it('does nothing destructive when remote node is absent (empty cloud)', async () => {
    seedAuth();
    useNutritionStore.getState().setDailyKcal('2026-05-25', 2000);
    stubFetch({}); // no nodes → all GET return null

    await hydrateStoresFromCloud();

    expect(useNutritionStore.getState().dailyLog.find((e) => e.dateISO === '2026-05-25')?.kcal).toBe(2000);
  });

  it('aerobic: two devices logging different classes union; subjectiveByDate from both kept', async () => {
    seedAuth();
    // This device logged a local class + a self-report for one day.
    useAerobicStore.setState({
      sessions: [{ date: '2026-05-30', type: 'zumba', minutes: 50, kcal: 300, ts: 2000 }],
      lastDuration: 60,
      subjectiveByDate: { '2026-05-30': 'rested' },
    });
    // Remote (other device) has a DIFFERENT class + a self-report for a DIFFERENT day,
    // plus a colliding session ts that must NOT win over local.
    stubFetch({
      aerobic: {
        data: {
          sessions: [
            { date: '2026-05-29', type: 'step', minutes: 45, kcal: 280, ts: 1000 },
            { date: '2026-05-30', type: 'spinning', minutes: 99, kcal: 999, ts: 2000 },
          ],
          lastDuration: 30,
          subjectiveByDate: { '2026-05-29': 'tired' },
        },
        updatedAt: 1,
      },
    });

    await hydrateStoresFromCloud();

    const st = useAerobicStore.getState();
    // Union by ts — both distinct classes kept, no class dropped.
    expect(st.sessions.map((s) => s.ts).sort()).toEqual([1000, 2000]);
    // Local ts=2000 wins the collision (zumba, not spinning).
    expect(st.sessions.find((s) => s.ts === 2000)?.type).toBe('zumba');
    // Remote-only class pulled down.
    expect(st.sessions.find((s) => s.ts === 1000)?.type).toBe('step');
    // subjectiveByDate object-union — both days present.
    expect(st.subjectiveByDate['2026-05-30']).toBe('rested');
    expect(st.subjectiveByDate['2026-05-29']).toBe('tired');
    // lastDuration LWW: local recent beats older remote envelope.
    expect(st.lastDuration).toBe(60);
  });

  it('aerobic: a DELETED class stays gone after hydrate (tombstone wins over remote union)', async () => {
    seedAuth();
    // This device logged then DELETED the class ts=2000 (tombstone recorded).
    useAerobicStore.setState({
      sessions: [],
      lastDuration: 50,
      subjectiveByDate: {},
      deletedTs: [2000],
    });
    // Remote still carries the deleted class (logged before the delete synced).
    stubFetch({
      aerobic: {
        data: {
          sessions: [{ date: '2026-05-30', type: 'spinning', minutes: 50, kcal: 300, ts: 2000 }],
          lastDuration: 50,
          subjectiveByDate: {},
        },
        updatedAt: 1,
      },
    });

    await hydrateStoresFromCloud();

    const st = useAerobicStore.getState();
    // The tombstoned class must NOT resurrect.
    expect(st.sessions.find((s) => s.ts === 2000)).toBeUndefined();
    expect(st.sessions).toHaveLength(0);
    expect(st.deletedTs).toContain(2000);
  });

  it('aerobic: a remote-device deletion (remote tombstone) removes a local class on hydrate', async () => {
    seedAuth();
    // Local still has the class; the OTHER device deleted it (remote tombstone).
    useAerobicStore.setState({
      sessions: [{ date: '2026-05-30', type: 'zumba', minutes: 50, kcal: 300, ts: 3000 }],
      lastDuration: 50,
      subjectiveByDate: {},
      deletedTs: [],
    });
    stubFetch({
      aerobic: { data: { sessions: [], lastDuration: 50, subjectiveByDate: {}, deletedTs: [3000] }, updatedAt: 1 },
    });

    await hydrateStoresFromCloud();

    const st = useAerobicStore.getState();
    expect(st.sessions.find((s) => s.ts === 3000)).toBeUndefined();
    expect(st.deletedTs).toContain(3000);
  });

  it('workout: a DELETED session stays gone after hydrate (tombstone wins)', async () => {
    seedAuth();
    useWorkoutStore.setState({
      sessionsHistory: [],
      lastSession: null,
      deletedSessionTs: [1234],
    });
    stubFetch({
      workout: { data: { sessionsHistory: [{ title: 'Mislog', meta: '', ts: 1234 }], deletedSessionTs: [] }, updatedAt: 1 },
    });

    await hydrateStoresFromCloud();

    const hist = useWorkoutStore.getState().sessionsHistory;
    expect(hist.find((s) => s.ts === 1234)).toBeUndefined();
    expect(useWorkoutStore.getState().deletedSessionTs).toContain(1234);
  });

  // F0 dedup #4a — cross-channel tombstone reconciliation. A session deleted via
  // the wv2 tombstone channel (Channel B) must also have its GHOST flat-`logs`
  // rows (Channel A, what dp.js reads) pruned on hydrate. The join is the per-set
  // timestamp (logs[].ts === session.exercises[].sets[].timestamp).
  it('reconcile: a tombstoned session\'s ghost `logs` rows are pruned on hydrate', async () => {
    seedAuth();
    // Local has the session (logged on this device) + its flat logs (Channel A).
    // sessionStart (logs[].session) differs from session.ts (the tombstone key) —
    // the reconciliation must match on the per-set ts, not the session id.
    useWorkoutStore.setState({
      sessionsHistory: [
        { title: 'Mislog', meta: '', ts: 5000, exercises: [
          { exerciseId: 'flat-db-press', exerciseName: 'Flat DB Press', engineName: 'Flat DB Press', totalVolume: 0, peakOneRM: 0,
            sets: [{ kg: 100, reps: 5, rating: 'potrivit' as const, timestamp: 4901 }] },
        ] },
      ],
      lastSession: null,
      deletedSessionTs: [],
    });
    DB.set('logs', [
      { ex: 'Flat DB Press', w: 100, kg: 100, ts: 4901, session: 4900, set: 1, sets: 1, reps: '5', date: '' },
      { ex: 'Squat', w: 120, kg: 120, ts: 3000, session: 2900, set: 1, sets: 1, reps: '5', date: '' },
    ]);
    // The OTHER device deleted session ts=5000 → remote tombstone arrives.
    stubFetch({
      workout: { data: { sessionsHistory: [], deletedSessionTs: [5000] }, updatedAt: 9 },
    });

    await hydrateStoresFromCloud();

    expect(useWorkoutStore.getState().deletedSessionTs).toContain(5000);
    const logs = DB.get<Array<{ ts: number }>>('logs') ?? [];
    // The ghost row (ts=4901, owned by the tombstoned session) is gone.
    expect(logs.find((r) => r.ts === 4901)).toBeUndefined();
    // The unrelated row survives (precise per-set-timestamp join, no over-removal).
    expect(logs.find((r) => r.ts === 3000)).toBeDefined();
  });

  it('reconcile: a NON-deleted session keeps its `logs` rows on hydrate (no over-prune)', async () => {
    seedAuth();
    useWorkoutStore.setState({
      sessionsHistory: [
        { title: 'Push', meta: '', ts: 6000, exercises: [
          { exerciseId: 'flat-db-press', exerciseName: 'Flat DB Press', engineName: 'Flat DB Press', totalVolume: 0, peakOneRM: 0,
            sets: [{ kg: 100, reps: 5, rating: 'potrivit' as const, timestamp: 5901 }] },
        ] },
      ],
      lastSession: null,
      deletedSessionTs: [],
    });
    DB.set('logs', [
      { ex: 'Flat DB Press', w: 100, kg: 100, ts: 5901, session: 5900, set: 1, sets: 1, reps: '5', date: '' },
    ]);
    // Remote just confirms the same session, no tombstone.
    stubFetch({
      workout: { data: { sessionsHistory: [{ title: 'Push', meta: '', ts: 6000 }], deletedSessionTs: [] }, updatedAt: 9 },
    });

    await hydrateStoresFromCloud();

    const logs = DB.get<Array<{ ts: number }>>('logs') ?? [];
    expect(logs.find((r) => r.ts === 5901)).toBeDefined();
  });

  it('no-op when unauthenticated (null user path → no fetch result applied)', async () => {
    // No seedAuth — getUserPath() null.
    useNutritionStore.getState().setDailyKcal('2026-05-25', 1500);
    stubFetch({ nutrition: { data: { dailyLog: [{ dateISO: '2026-05-25', kcal: 9999, protein: null, ts: 1 }] }, updatedAt: 9 } });

    await hydrateStoresFromCloud();

    expect(useNutritionStore.getState().dailyLog.find((e) => e.dateISO === '2026-05-25')?.kcal).toBe(1500);
  });
});
