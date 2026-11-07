// ══ LIVE SESSION — training together, each on his own weights ════════════════
// Founder 2026-11-07: "sa ii dea si lui in aplicatie antrenamentul meu, si sa ii
// porneasca sesiune independenta... sau cat e la mine pauza sa ii inceapa lui"
// (and "daca o sa fim 3 oameni"). The host picks friends on "Cu cine te antrenezi
// azi?"; Start publishes
//
//   liveSessions/<host> {hostName, title, sessionType, startedAt, members, plan,
//                        beats: {<uid>: Beat}, endedAt}
//
// (host writes it; his LISTED friends may be members, read it and write only their
// own beat — database.rules.json, probed live). A friend's app finds the invite,
// "Hai" opens the preview with the host's exercises prescribed for HIM
// (livePlan.ts), and from then each phone posts a beat on every change (exercise,
// set, rest) and reads the others' every few seconds: where each one is, and
// "Randul tau" when the one before you in the rotation (host, then friends in the
// order they joined) finishes a set on the exercise you are on.

import { cachedFriends, myPartnerName, partnerRest as rest, partnerUid as myUid } from './partner';
import { useWorkoutStore } from '../stores/workoutStore';
import type { LivePlan } from '../stores/workoutStore';
import type { PlannedWorkoutOutput } from './engineWrappers';

export interface Beat {
  name: string;
  exName: string;
  engineName: string;
  setIdx: number;
  sets: number;
  restEndsAt: number | null;
  joinedAt: number;
  ts: number;
  done?: boolean;
}

export interface LiveState {
  hostName: string;
  endedAt: number | null;
  beats: Record<string, Beat>;
}

export interface LiveInvite { host: string; plan: LivePlan }

const INVITE_TTL_MS = 3 * 3_600_000;
const ANSWERED_KEY = 'wv2-live-answered';

function answered(): string[] {
  try { return JSON.parse(localStorage.getItem(ANSWERED_KEY) ?? '[]') as string[]; } catch { return []; }
}

/** Host: publish today's session for the friends picked on the TimeBudget step. */
export async function startLiveSession(workout: PlannedWorkoutOutput, friendUids: readonly string[]): Promise<boolean> {
  const uid = myUid();
  const friends = cachedFriends().filter((f) => friendUids.includes(f.uid));
  if (!uid || friends.length === 0) return false;
  const startedAt = Date.now();
  const r = await rest(`liveSessions/${uid}`, 'PUT', {
    hostName: myPartnerName(),
    title: workout.workoutTitle,
    ...(workout.sessionType ? { sessionType: workout.sessionType } : {}),
    startedAt,
    members: Object.fromEntries(friends.map((f) => [f.uid, true])),
    plan: workout.exercises.map((e) => ({ engineName: e.engineName ?? e.name, sets: e.sets })),
  });
  if (r.ok) useWorkoutStore.getState().setLiveSession({ host: uid, startedAt });
  return r.ok;
}

/** Friend: a live session one of my friends started with me, not answered yet. */
export async function findLiveInvites(): Promise<LiveInvite[]> {
  const uid = myUid();
  if (!uid) return [];
  const seen = answered();
  const out: LiveInvite[] = [];
  for (const f of cachedFriends()) {
    const r = await rest(`liveSessions/${f.uid}`);
    const d = (r.ok ? r.data : null) as {
      hostName?: string; title?: string; sessionType?: string; startedAt?: number; endedAt?: number;
      members?: Record<string, boolean>; plan?: Array<{ engineName: string; sets: number }>;
    } | null;
    if (!d || d.endedAt || !d.members?.[uid] || !Array.isArray(d.plan) || typeof d.startedAt !== 'number') continue;
    if (Date.now() - d.startedAt > INVITE_TTL_MS || seen.includes(`${f.uid}:${d.startedAt}`)) continue;
    out.push({
      host: f.uid,
      plan: {
        host: f.uid,
        hostName: d.hostName || f.name,
        title: String(d.title ?? ''),
        ...(d.sessionType ? { sessionType: d.sessionType } : {}),
        startedAt: d.startedAt,
        exercises: d.plan.map((e) => ({ engineName: String(e.engineName), sets: Number(e.sets) || 3 })),
      },
    });
  }
  return out;
}

/** "Hai" or "Nu azi" — either way, don't ask again for this session. */
export function markInviteAnswered(invite: LiveInvite): void {
  try { localStorage.setItem(ANSWERED_KEY, JSON.stringify([...answered(), `${invite.host}:${invite.plan.startedAt}`].slice(-20))); } catch { /* private mode */ }
}

export async function writeBeat(live: { host: string }, beat: Omit<Beat, 'name' | 'ts'>): Promise<void> {
  const uid = myUid();
  if (!uid) return;
  await rest(`liveSessions/${live.host}/beats/${uid}`, 'PUT', { ...beat, name: myPartnerName(), ts: Date.now() });
}

export async function readLive(live: { host: string }): Promise<LiveState | null> {
  const r = await rest(`liveSessions/${live.host}`);
  const d = (r.ok ? r.data : null) as { hostName?: string; endedAt?: number; beats?: Record<string, Beat> } | null;
  if (!d) return null;
  return { hostName: String(d.hostName ?? ''), endedAt: typeof d.endedAt === 'number' ? d.endedAt : null, beats: d.beats ?? {} };
}

/** Saved or discarded: the host closes the session; a friend marks himself done. */
export async function endLive(live: { host: string }, last?: Omit<Beat, 'name' | 'ts'>): Promise<void> {
  const uid = myUid();
  if (!uid) return;
  if (live.host === uid) await rest(`liveSessions/${uid}/endedAt`, 'PUT', Date.now());
  else if (last) await writeBeat(live, { ...last, done: true, restEndsAt: null });
}

/**
 * Whose set comes right before mine: the rotation is the host, then the friends in
 * the order they joined. With two people it is simply the other one.
 */
export function predecessor(host: string, me: string, beats: Record<string, Beat>): string | null {
  const friends = Object.entries(beats)
    .filter(([u, b]) => u !== host && !b.done)
    .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
    .map(([u]) => u);
  const order = [host, ...friends.filter((u) => u !== host)];
  if (!order.includes(me) || order.length < 2) return null;
  return order[(order.indexOf(me) - 1 + order.length) % order.length] ?? null;
}
