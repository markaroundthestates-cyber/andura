// Founder 2026-10-23: he and his friend train together — the friend's sessions were
// copied by hand twice. Two "phones" share one fake RTDB that enforces the same
// partner rules as database.rules.json (probed live), so the whole flow runs:
// code → join → send (offline first) → "Adaug si la tine?" → history, and unlink.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

let currentUid: string | null = null;
vi.mock('../../../auth.js', async (orig) => ({
  ...(await orig<typeof import('../../../auth.js')>()),
  getAuthState: () => (currentUid ? { uid: currentUid, idToken: 'tok', expiry: Date.now() + 3600e3 } : null),
}));
vi.mock('../../../firebase.js', async (orig) => ({
  ...(await orig<typeof import('../../../firebase.js')>()),
  buildAuthUrl: async (p: string) => `https://rtdb.test/${p}.json`,
}));

import {
  acceptPartnerSession, cachedPartner, checkPartnerInbox, createInvite, joinWithCode,
  planPartnerImport, sendSessionToPartner, unpair, wasSentToPartner,
} from '../../lib/partner';
import PartnerInbox from '../../components/PartnerInbox';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { setMissingEquipmentExercises } from '../../../engine/schedule/scheduleAdapter.js';
import { DB } from '../../../db.js';

// ── fake RTDB with the partner rules ──────────────────────────────────────────
type Tree = Record<string, unknown>;
let tree: Tree = {};
let online = true;
const at = (path: string[]): unknown => path.reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Tree)[k] : undefined), tree);
function put(path: string[], v: unknown): void {
  let o = tree;
  for (const k of path.slice(0, -1)) o = (o[k] ??= {}) as Tree;
  if (v === null) delete o[path[path.length - 1]!];
  else o[path[path.length - 1]!] = v;
}
function allowed(method: string, p: string[], body: Tree | null): boolean {
  const uid = currentUid;
  if (!uid) return false;
  const [root, a, b] = p;
  if (root === 'users') return a === uid;
  if (root === 'partnerInvites') {
    if (method === 'GET') return p.length === 2;
    const cur = at(p) as Tree | undefined;
    return (!cur || cur.uid === uid) && (method === 'DELETE' || (body?.uid === uid && /^[A-Z2-9]{6}$/.test(a!)));
  }
  if (root === 'partnerInbox') {
    if (method === 'GET') return a === uid && p.length === 2;
    if (a === uid) return true;
    if (method !== 'PUT' || at(p) !== undefined || body?.from !== uid || !b) return false;
    if (at(['users', a!, 'partners', uid]) !== undefined) return true;
    const inv = at(['partnerInvites', String(body.code)]) as Tree | undefined;
    return body.type === 'join' && inv?.uid === a && Number(inv?.ts) > Date.now() - 86_400_000;
  }
  return false;
}
const fakeFetch = vi.fn(async (url: string, init?: RequestInit) => {
  if (!online) throw new TypeError('offline');
  const p = url.replace('https://rtdb.test/', '').replace('.json', '').split('/');
  const method = init?.method ?? 'GET';
  const body = init?.body ? (JSON.parse(String(init.body)) as Tree) : null;
  if (!allowed(method, p, body)) return { ok: false, json: async () => null } as Response;
  if (method === 'PUT') put(p, body);
  if (method === 'DELETE') put(p, null);
  return { ok: true, json: async () => structuredClone(at(p) ?? null) } as Response;
});

// ── two phones: each keeps its own localStorage ──────────────────────────────
const phones: Record<string, Record<string, string>> = {};
let onPhone: string | null = null;
function switchTo(uid: string): void {
  if (onPhone) phones[onPhone] = { ...localStorage } as Record<string, string>;
  localStorage.clear();
  for (const [k, v] of Object.entries(phones[uid] ?? {})) localStorage.setItem(k, v);
  onPhone = uid;
  currentUid = uid;
}

const DAY = Date.UTC(2026, 9, 23, 16);
const set = (kg: number, reps: number, i: number) => ({ kg, reps, rating: 'potrivit' as const, timestamp: DAY + i * 120e3 });
const ex = (engineName: string, kg: number, reps: number, base: number) => ({
  exerciseId: engineName.toLowerCase().replace(/\W+/g, '-'), exerciseName: engineName, engineName,
  sets: [set(kg, reps, base), set(kg, reps, base + 1), set(kg, reps, base + 2)],
  totalVolume: 3 * kg * reps, peakOneRM: kg,
});
// The founder's 10-23 legs day shape (+ a squat and a lunge his friend can't do).
const LEGS: LastSessionSummary = {
  title: 'Workout', meta: '', ts: DAY + 3600e3, durationMin: 52,
  exercises: [
    ex('Barbell Back Squat (High Bar)', 60, 8, 0),
    ex('Leg Press', 90, 8, 3),
    ex('Walking Lunge', 20, 10, 6),
    ex('Leg Curl', 100, 8, 9),
  ],
};

beforeEach(() => {
  tree = {}; online = true; onPhone = null;
  for (const k of Object.keys(phones)) delete phones[k];
  localStorage.clear();
  vi.stubGlobal('fetch', fakeFetch);
  useWorkoutStore.setState({ sessionsHistory: [], lastSession: null, streak: 0, lastStreakDate: null, deletedSessionTs: [] });
});
afterEach(() => { vi.unstubAllGlobals(); currentUid = null; });

async function pairDanielWithFriend(): Promise<void> {
  switchTo('daniel');
  const code = await createInvite('Daniel');
  expect(code).toMatch(/^[A-Z2-9]{6}$/);
  switchTo('friend');
  expect(await joinWithCode(code!.toLowerCase(), 'Sade')).toBe('ok');
  expect(cachedPartner()?.name).toBe('Daniel');
}

describe('training partner — pairing', () => {
  it('a code links both accounts; the inviter lists the joiner at its next check', async () => {
    await pairDanielWithFriend();
    switchTo('daniel');
    expect(cachedPartner()).toBeNull();
    await checkPartnerInbox();
    expect(cachedPartner()).toMatchObject({ uid: 'friend', name: 'Sade' });
    expect(at(['partnerInvites'])).toEqual({});
  });

  it('an unlinked user with no code out reads only his own link, never the inbox', async () => {
    switchTo('stranger');
    fakeFetch.mockClear();
    expect(await checkPartnerInbox()).toEqual([]);
    expect(fakeFetch.mock.calls.map(([u]) => String(u))).toEqual(['https://rtdb.test/users/stranger/partners.json']);
  });

  it('a wrong, own or expired code is refused with a reason', async () => {
    switchTo('daniel');
    const code = await createInvite('Daniel');
    expect(await joinWithCode(code!, 'Daniel')).toBe('self');
    switchTo('friend');
    expect(await joinWithCode('ABC', 'Sade')).toBe('invalid');
    expect(await joinWithCode('ZZZZZZ', 'Sade')).toBe('invalid');
    put(['partnerInvites', code!, 'ts'], Date.now() - 2 * 86_400_000);
    expect(await joinWithCode(code!, 'Sade')).toBe('invalid');
  });
});

describe('training partner — a session travels', () => {
  beforeEach(() => {
    // The friend's back: no squats; the walking lunge is on his "Nu pot face asta" list.
    useOnboardingStore.setState((s) => ({ data: { ...s.data, refusedPatterns: ['squat'] } }));
  });

  it('sent before the inviter listed the joiner (and offline) it waits, then arrives', async () => {
    await pairDanielWithFriend();
    switchTo('friend');
    online = false;
    await sendSessionToPartner(LEGS);
    expect(wasSentToPartner(LEGS.ts)).toBe(true);
    online = true;
    await checkPartnerInbox(); // the inviter has not listed him yet → still waiting
    switchTo('daniel');
    expect(await checkPartnerInbox()).toEqual([]); // lists the friend
    switchTo('friend');
    await checkPartnerInbox(); // outbox retried, now allowed
    switchTo('daniel');
    const pending = await checkPartnerInbox();
    expect(pending).toHaveLength(1);
    expect(pending[0]!.name).toBe('Sade');
  });

  it('the receiver gets exactly what he can do — weights as logged, own PRs, streak', async () => {
    await pairDanielWithFriend();
    switchTo('daniel');
    await checkPartnerInbox();
    await sendSessionToPartner(LEGS);
    switchTo('friend');
    setMissingEquipmentExercises(['Walking Lunge']);
    // His own history: Leg Press 80 (so 90 is HIS PR), Leg Curl 110 (so the curl is not).
    const prior = (exName: string, w: number, d: number) => ({ date: '2026-10-1' + d, ex: exName, w, kg: w, set: 1, sets: 1, reps: '8', ts: DAY - (10 - d) * 864e5, session: DAY - (10 - d) * 864e5, rpe: 7.5 });
    DB.set('logs', [prior('Leg Press', 80, 6), prior('Leg Curl', 110, 6)]);
    const [msg] = await checkPartnerInbox();
    // The sender's PR flags don't travel as truth.
    msg!.session.exercises[3]!.sets[0]!.isPR = true;
    expect(msg).toBeDefined();
    const plan = planPartnerImport(msg!.session);
    expect(plan.exercises.map((e) => e.engineName)).toEqual(['Leg Press', 'Leg Curl']);
    expect(plan.skipped).toHaveLength(2);

    await acceptPartnerSession(msg!);
    const st = useWorkoutStore.getState();
    expect(st.sessionsHistory).toHaveLength(1);
    expect(st.sessionsHistory[0]).toMatchObject({ ts: LEGS.ts, fromPartner: 'Daniel', sets: 6, volumeKg: 3 * 90 * 8 + 3 * 100 * 8 });
    expect(st.lastSession?.ts).toBe(LEGS.ts);
    expect(st.streak).toBe(1);
    const logs = DB.get<Array<{ ex: string; w: number }>>('logs') ?? [];
    expect(logs.filter((l) => l.ex === 'Leg Press').map((l) => l.w)).toEqual([90, 90, 90, 80]);
    expect(logs.some((l) => l.ex === 'Barbell Back Squat (High Bar)' || l.ex === 'Walking Lunge')).toBe(false);
    // PRs measured against HIS history: the press is one, the curl (110 before) is not.
    const [press, curl] = st.sessionsHistory[0]!.exercises!;
    expect(press!.sets.some((s) => s.isPR)).toBe(true);
    expect(curl!.sets.some((s) => s.isPR)).toBe(false);
    // Answered → gone from the inbox; a second accept of the same session is a no-op.
    expect(await checkPartnerInbox()).toEqual([]);
    await acceptPartnerSession(msg!);
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
  });

  it('an import never touches the session he is logging right now', async () => {
    await pairDanielWithFriend();
    switchTo('daniel');
    await checkPartnerInbox();
    await sendSessionToPartner(LEGS);
    switchTo('friend');
    const live = { 0: [{ kg: 40, reps: 10, rating: 'potrivit' as const, timestamp: Date.now() }] };
    useWorkoutStore.setState({ phase: 'logging', sessionStart: Date.now(), history: live, exIdx: 0 });
    const [msg] = await checkPartnerInbox();
    await acceptPartnerSession(msg!);
    const st = useWorkoutStore.getState();
    expect(st.phase).toBe('logging');
    expect(st.history).toEqual(live);
    useWorkoutStore.setState({ phase: 'idle', sessionStart: null, history: {} });
  });

  it('the sheet asks, and one tap adds it', async () => {
    await pairDanielWithFriend();
    switchTo('daniel');
    await checkPartnerInbox();
    await sendSessionToPartner(LEGS);
    switchTo('friend');
    render(<PartnerInbox />);
    expect(await screen.findByTestId('partner-inbox')).toBeTruthy();
    expect(screen.getByTestId('partner-inbox-skipped').textContent).toBeTruthy();
    fireEvent.click(screen.getByTestId('partner-inbox-add'));
    await waitFor(() => expect(screen.queryByTestId('partner-inbox')).toBeNull());
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
  });

  it('"Nu" drops it without touching history', async () => {
    await pairDanielWithFriend();
    switchTo('daniel');
    await checkPartnerInbox();
    await sendSessionToPartner(LEGS);
    switchTo('friend');
    render(<PartnerInbox />);
    fireEvent.click(await screen.findByTestId('partner-inbox-no'));
    await waitFor(() => expect(screen.queryByTestId('partner-inbox')).toBeNull());
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(0);
    expect(await checkPartnerInbox()).toEqual([]);
  });
});

describe('training partner — unlink', () => {
  it('unlinking on one phone drops the link on the other', async () => {
    await pairDanielWithFriend();
    switchTo('daniel');
    await checkPartnerInbox();
    switchTo('friend');
    expect(await unpair()).toBe(true);
    expect(cachedPartner()).toBeNull();
    switchTo('daniel');
    await checkPartnerInbox();
    expect(cachedPartner()).toBeNull();
    expect(at(['users', 'daniel', 'partners'])).toEqual({});
  });
});
