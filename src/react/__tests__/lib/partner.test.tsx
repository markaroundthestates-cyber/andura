// Founder 2026-10-23: he and his friend train together. 2026-11-07: the code flow
// was clumsy (his code expired unanswered) → friends by email + "Cu cine te
// antrenezi azi?". Two "phones" share one fake RTDB that enforces the same rules as
// database.rules.json (probed live), so the whole flow runs: request by email →
// "Accepta" → session goes out → "L-ai facut si tu?" → history; remove a friend.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const EMAIL: Record<string, string> = { daniel: 'maziludaniel@example.com', friend: 'Sade.13@example.com', other: 'other@example.com' };
let currentUid: string | null = null;
const jwt = (email: string): string => `h.${btoa(JSON.stringify({ email })).replace(/=+$/, '')}.s`;
vi.mock('../../../auth.js', async (orig) => ({
  ...(await orig<typeof import('../../../auth.js')>()),
  getAuthState: () => (currentUid ? { uid: currentUid, idToken: jwt(EMAIL[currentUid]!), expiry: Date.now() + 3600e3 } : null),
}));
vi.mock('../../../firebase.js', async (orig) => ({
  ...(await orig<typeof import('../../../firebase.js')>()),
  buildAuthUrl: async (p: string) => `https://rtdb.test/${p}.json`,
}));

import {
  acceptFriendRequest, acceptPartnerSession, askedEmails, cachedFriends, cancelFriendRequest, checkPartnerInbox,
  declineFriendRequest, emailKey, planPartnerImport, removeFriend, sendFriendRequest, sendSessionToFriend,
  setMyPartnerName, wasSentToFriend,
} from '../../lib/partner';
import PartnerInbox from '../../components/PartnerInbox';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { setMissingEquipmentExercises } from '../../../engine/schedule/scheduleAdapter.js';
import { DB } from '../../../db.js';

// ── fake RTDB with the friend rules ───────────────────────────────────────────
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
const keyOf = (uid: string): string => emailKey(EMAIL[uid]!);
function allowed(method: string, p: string[], body: Tree | null): boolean {
  const uid = currentUid;
  if (!uid) return false;
  const [root, a, b] = p;
  if (root === 'users') return a === uid;
  if (root === 'friendRequests') {
    if (method === 'GET') return p.length === 2 ? a === keyOf(uid) : b === uid || a === keyOf(uid);
    if (b !== uid && a !== keyOf(uid)) return false;
    return method === 'DELETE' || (typeof body?.name === 'string' && body.name.length <= 40 && typeof body.ts === 'number');
  }
  if (root === 'partnerInbox') {
    if (method === 'GET') return a === uid && p.length === 2;
    if (a === uid) return true;
    if (method !== 'PUT' || at(p) !== undefined || body?.from !== uid || !b) return false;
    if (at(['users', a!, 'partners', uid]) !== undefined) return true;
    return body.type === 'accept' && at(['friendRequests', keyOf(uid), a!]) !== undefined;
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

// ── phones: each keeps its own localStorage ──────────────────────────────────
const phones: Record<string, Record<string, string>> = {};
let onPhone: string | null = null;
function switchTo(uid: string): void {
  if (onPhone) phones[onPhone] = { ...localStorage } as Record<string, string>;
  localStorage.clear();
  for (const [k, v] of Object.entries(phones[uid] ?? {})) localStorage.setItem(k, v);
  onPhone = uid;
  currentUid = uid;
}

const DAY = Date.UTC(2026, 10, 7, 16);
const set = (kg: number, reps: number, i: number) => ({ kg, reps, rating: 'potrivit' as const, timestamp: DAY + i * 120e3 });
const ex = (engineName: string, kg: number, reps: number, base: number) => ({
  exerciseId: engineName.toLowerCase().replace(/\W+/g, '-'), exerciseName: engineName, engineName,
  sets: [set(kg, reps, base), set(kg, reps, base + 1), set(kg, reps, base + 2)],
  totalVolume: 3 * kg * reps, peakOneRM: kg,
});
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

async function befriend(): Promise<void> {
  switchTo('daniel');
  setMyPartnerName('Daniel');
  expect(await sendFriendRequest(' SADE.13@example.com ')).toBe('ok');
  expect(askedEmails()).toEqual(['sade.13@example.com']);
  switchTo('friend');
  setMyPartnerName('Sade');
  const { requests } = await checkPartnerInbox();
  expect(requests).toEqual([expect.objectContaining({ from: 'daniel', name: 'Daniel' })]);
  expect(await acceptFriendRequest(requests[0]!)).toBe(true);
  expect(cachedFriends().map((f) => f.name)).toEqual(['Daniel']);
  switchTo('daniel');
  await checkPartnerInbox();
}

describe('training friends — adding by email', () => {
  it('a request by email → accepted in his app → both list each other', async () => {
    await befriend();
    expect(cachedFriends()).toEqual([expect.objectContaining({ uid: 'friend', name: 'Sade' })]);
    expect(askedEmails()).toEqual([]);
    expect(at(['friendRequests'])).toEqual({ [keyOf('friend')]: {} });
  });

  it('wrong / own / repeated email is refused with a reason; a stranger never sees the request', async () => {
    switchTo('daniel');
    setMyPartnerName('Daniel');
    expect(await sendFriendRequest('not-an-email')).toBe('invalid');
    expect(await sendFriendRequest('MaziluDaniel@example.com')).toBe('self');
    expect(await sendFriendRequest('sade.13@example.com')).toBe('ok');
    expect(await sendFriendRequest('sade.13@example.com')).toBe('already');
    switchTo('other');
    expect((await checkPartnerInbox()).requests).toEqual([]);
  });

  it('declined or cancelled requests leave the waiting list', async () => {
    switchTo('daniel');
    setMyPartnerName('Daniel');
    await sendFriendRequest('sade.13@example.com');
    await sendFriendRequest('other@example.com');
    expect(await cancelFriendRequest('other@example.com')).toBe(true);
    switchTo('friend');
    const { requests } = await checkPartnerInbox();
    await declineFriendRequest(requests[0]!);
    switchTo('daniel');
    await checkPartnerInbox();
    expect(askedEmails()).toEqual([]);
    expect(cachedFriends()).toEqual([]);
  });

  it('an unlinked user with nothing out reads only his link and his requests', async () => {
    switchTo('other');
    fakeFetch.mockClear();
    await checkPartnerInbox();
    expect(fakeFetch.mock.calls.map(([u]) => String(u))).toEqual([
      'https://rtdb.test/users/other/partners.json',
      `https://rtdb.test/friendRequests/${keyOf('other')}.json`,
    ]);
  });
});

describe('training friends — a session travels', () => {
  beforeEach(() => {
    useOnboardingStore.setState((s) => ({ data: { ...s.data, refusedPatterns: ['squat'] } }));
  });

  it('offline it waits in the outbox, then arrives', async () => {
    await befriend();
    online = false;
    await sendSessionToFriend(LEGS, 'friend');
    expect(wasSentToFriend(LEGS.ts, 'friend')).toBe(true);
    online = true;
    await checkPartnerInbox(); // outbox retried
    switchTo('friend');
    const { sessions } = await checkPartnerInbox();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.name).toBe('Daniel');
  });

  it('the friend gets exactly what he can do — weights as logged, his own PRs, streak', async () => {
    await befriend();
    await sendSessionToFriend(LEGS, 'friend');
    switchTo('friend');
    setMissingEquipmentExercises(['Walking Lunge']);
    const prior = (exName: string, w: number) => ({ date: '2026-11-01', ex: exName, w, kg: w, set: 1, sets: 1, reps: '8', ts: DAY - 6 * 864e5, session: DAY - 6 * 864e5, rpe: 7.5 });
    DB.set('logs', [prior('Leg Press', 80), prior('Leg Curl', 110)]);
    const { sessions: [msg] } = await checkPartnerInbox();
    msg!.session.exercises[3]!.sets[0]!.isPR = true; // the sender's PR flags don't travel as truth
    const plan = planPartnerImport(msg!.session);
    expect(plan.exercises.map((e) => e.engineName)).toEqual(['Leg Press', 'Leg Curl']);
    expect(plan.skipped).toHaveLength(2);
    await acceptPartnerSession(msg!);
    const st = useWorkoutStore.getState();
    expect(st.sessionsHistory[0]).toMatchObject({ ts: LEGS.ts, fromPartner: 'Daniel', sets: 6, volumeKg: 3 * 90 * 8 + 3 * 100 * 8 });
    expect(st.streak).toBe(1);
    const [press, curl] = st.sessionsHistory[0]!.exercises!;
    expect(press!.sets.some((s) => s.isPR)).toBe(true);
    expect(curl!.sets.some((s) => s.isPR)).toBe(false);
    expect((await checkPartnerInbox()).sessions).toEqual([]);
    await acceptPartnerSession(msg!);
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
  });

  it('a stranger cannot send a session', async () => {
    await befriend();
    switchTo('other');
    useWorkoutStore.setState({});
    expect(await sendSessionToFriend(LEGS, 'friend')).toBe(false);
  });
});

describe('training friends — the sheet', () => {
  it('a friend request asks once for the name, then one tap accepts', async () => {
    switchTo('daniel');
    setMyPartnerName('Daniel');
    await sendFriendRequest('sade.13@example.com');
    switchTo('friend');
    render(<PartnerInbox />);
    expect((await screen.findByTestId('partner-request')).textContent).toContain('Daniel');
    const accept = screen.getByTestId('partner-request-accept') as HTMLButtonElement;
    expect(accept.disabled).toBe(true); // no name yet
    fireEvent.change(screen.getByTestId('partner-request-name'), { target: { value: 'Sade' } });
    fireEvent.click(accept);
    await waitFor(() => expect(screen.queryByTestId('partner-request')).toBeNull());
    expect(cachedFriends().map((f) => f.uid)).toEqual(['daniel']);
  });

  it('a session: one tap adds it; "Nu" drops it', async () => {
    await befriend();
    await sendSessionToFriend(LEGS, 'friend');
    await sendSessionToFriend({ ...LEGS, ts: LEGS.ts + 864e5 }, 'friend');
    switchTo('friend');
    render(<PartnerInbox />);
    fireEvent.click(await screen.findByTestId('partner-inbox-add'));
    await waitFor(() => expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1));
    fireEvent.click(await screen.findByTestId('partner-inbox-no'));
    await waitFor(() => expect(screen.queryByTestId('partner-inbox')).toBeNull());
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
  });
});

describe('training friends — remove', () => {
  it('removing on one phone drops the friend on the other', async () => {
    await befriend();
    switchTo('friend');
    expect(await removeFriend('daniel')).toBe(true);
    expect(cachedFriends()).toEqual([]);
    switchTo('daniel');
    await checkPartnerInbox();
    expect(cachedFriends()).toEqual([]);
  });
});
