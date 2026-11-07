// ══ TRAINING FRIENDS — log once, the friends you trained with get the session ══
// Founder 2026-10-23: he and his friend train together (same exercises, same
// weights). 2026-11-07 ("Training partner e cam clumsy... ceva gen friend list...
// today we train together"): the 6-letter code was never used (his code expired
// unanswered), so friends are added BY EMAIL and a session goes out on its own to
// whoever you picked "Cu cine te antrenezi azi?" for. RTDB (database.rules.json,
// probed live before the client shipped):
//
//   friendRequests/<emailKey>/<fromUid> {name, ts}   readable by that email's owner
//                                                    (auth.token.email) + the sender
//   users/<uid>/partners/<friendUid>     {name, since} the allowlist (own node)
//   partnerInbox/<uid>/<msgId>          {type, from, ts, …} readable by <uid>; created
//                                       by a listed friend, or an 'accept' answering a
//                                       request <uid> sent to the writer's email
//
// Add: I write a request under their email → their app shows "<name> vrea sa va
// antrenati impreuna" → Accepta lists me and drops an 'accept' in my inbox → my next
// check lists them. A sent session waits in the friend's inbox until they answer
// "L-ai facut si tu?". Accepting drops what THEY can't do (their refusals + "Nu pot
// face asta" list), recomputes PRs against their own history and moves their streak —
// the same writes as a session they finished themselves.

import { buildAuthUrl, FIREBASE_FETCH_TIMEOUT_MS } from '../../firebase.js';
import { getAuthState } from '../../auth.js';
import { DB } from '../../db.js';
import { t } from '../../i18n/index.js';
import { getExerciseMetadata } from '../../engine/exerciseLibrary.js';
import { movementKey } from '../../engine/sessionBuilder.js';
import { buildExclusionTokens, isExcludedMovement } from '../../engine/movementExclusion.js';
import { isEquipmentMissingExercise } from '../../engine/schedule/scheduleAdapter.js';
import { isEnabled } from '../../util/featureFlags.js';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { LastSessionSummary, LogEntry, SessionExerciseBreakdown } from '../stores/workoutStore';
import { enrichExercisesWithPR, refreshPRRecordsFromLogs } from './prRecordsWriteback';
import { toExerciseDisplay } from './exerciseDisplay';
import { formatKg } from './format';

export interface Friend { uid: string; name: string; since: number }
export interface FriendRequest { from: string; name: string; ts: number }

/** The part of a finished session that travels to a friend. */
export interface SharedSession {
  title: string;
  ts: number;
  durationMin?: number;
  exercises: SessionExerciseBreakdown[];
}

export interface PartnerSessionMessage { id: string; from: string; name: string; ts: number; session: SharedSession }

export interface InboxCheck { sessions: PartnerSessionMessage[]; requests: FriendRequest[] }

const FRIENDS_KEY = 'wv2-partner';
const OUTBOX_KEY = 'wv2-partner-outbox';
const SENT_KEY = 'wv2-partner-sent';
const MY_NAME_KEY = 'wv2-partner-myname';
const ASKED_KEY = 'wv2-partner-asked';
const OUTBOX_TTL_MS = 7 * 86_400_000;
const EMAIL_RE = /^[^\s@/#$[\]]+@[^\s@/#$[\]]+\.[^\s@/#$[\]]+$/;

export function partnerEnabled(): boolean {
  return isEnabled('partner_sync_v1');
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch { return fallback; }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota / private mode — the cloud copy stays authoritative */ }
}

function myUid(): string | null {
  return getAuthState()?.uid ?? null;
}

/** The signed-in email, read from the ID token (the same claim the rules check). */
export function myEmail(): string | null {
  const token = getAuthState()?.idToken;
  const part = typeof token === 'string' ? token.split('.')[1] : undefined;
  if (!part) return null;
  try {
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { email?: unknown };
    return typeof json.email === 'string' ? json.email.trim().toLowerCase() : null;
  } catch { return null; }
}

/** RTDB key for an email — the rules compute the same: lower case, '.' → ','. */
export function emailKey(email: string): string {
  return email.trim().toLowerCase().split('.').join(',');
}

async function rest(path: string, method: 'GET' | 'PUT' | 'DELETE' = 'GET', body?: unknown): Promise<{ ok: boolean; data: unknown }> {
  try {
    const r = await fetch(await buildAuthUrl(path), {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
      signal: AbortSignal.timeout(FIREBASE_FETCH_TIMEOUT_MS),
    });
    return { ok: r.ok, data: r.ok && method === 'GET' ? await r.json() : null };
  } catch { return { ok: false, data: null }; }
}

/** Last known friends (instant UI); checkPartnerInbox refreshes them from the cloud. */
export function cachedFriends(): Friend[] {
  const v = read<unknown>(FRIENDS_KEY, []);
  return Array.isArray(v) ? (v as Friend[]) : [];
}

/** Emails I asked and that have not answered yet. */
export function askedEmails(): string[] {
  return read<string[]>(ASKED_KEY, []);
}

/** True while there is something to poll for: a friend, or a request of mine out. */
export function partnerPollWorthy(): boolean {
  return cachedFriends().length > 0 || askedEmails().length > 0;
}

export function myPartnerName(): string {
  return read<string>(MY_NAME_KEY, '');
}

export function setMyPartnerName(name: string): void {
  write(MY_NAME_KEY, name.trim().slice(0, 40));
}

export function wasSentToFriend(sessionTs: number, friendUid: string): boolean {
  return read<string[]>(SENT_KEY, []).includes(`${sessionTs}:${friendUid}`);
}

async function fetchFriends(uid: string): Promise<Friend[] | undefined> {
  const r = await rest(`users/${uid}/partners`);
  if (!r.ok) return undefined;
  const friends = Object.entries((r.data ?? {}) as Record<string, { name?: string; since?: number }>)
    .map(([fuid, v]) => ({ uid: fuid, name: String(v?.name ?? ''), since: Number(v?.since ?? 0) }))
    .sort((a, b) => a.since - b.since);
  write(FRIENDS_KEY, friends);
  return friends;
}

export type RequestResult = 'ok' | 'invalid' | 'self' | 'already' | 'error';

/** Ask someone by the email they sign in with; they answer in their own app. */
export async function sendFriendRequest(rawEmail: string): Promise<RequestResult> {
  const uid = myUid();
  const name = myPartnerName();
  if (!uid || !name) return 'error';
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return 'invalid';
  if (email === myEmail()) return 'self';
  if (askedEmails().includes(email)) return 'already';
  const r = await rest(`friendRequests/${emailKey(email)}/${uid}`, 'PUT', { name, ts: Date.now() });
  if (!r.ok) return 'error';
  write(ASKED_KEY, [...askedEmails(), email]);
  return 'ok';
}

/** Take back a request nobody answered. */
export async function cancelFriendRequest(email: string): Promise<boolean> {
  const uid = myUid();
  if (!uid) return false;
  const r = await rest(`friendRequests/${emailKey(email)}/${uid}`, 'DELETE');
  if (r.ok) write(ASKED_KEY, askedEmails().filter((e) => e !== email));
  return r.ok;
}

/** "Accepta": list them, tell them (their next check lists me), clear the request. */
export async function acceptFriendRequest(req: FriendRequest): Promise<boolean> {
  const uid = myUid();
  const email = myEmail();
  if (!uid || !email) return false;
  const now = Date.now();
  const listed = await rest(`users/${uid}/partners/${req.from}`, 'PUT', { name: req.name, since: now });
  if (!listed.ok) return false;
  const told = await rest(`partnerInbox/${req.from}/a_${uid}_${now}`, 'PUT', { type: 'accept', from: uid, name: myPartnerName(), email, ts: now });
  if (!told.ok) {
    await rest(`users/${uid}/partners/${req.from}`, 'DELETE');
    return false;
  }
  await rest(`friendRequests/${emailKey(email)}/${req.from}`, 'DELETE');
  write(FRIENDS_KEY, [...cachedFriends().filter((f) => f.uid !== req.from), { uid: req.from, name: req.name, since: now }]);
  return true;
}

/** "Refuza": the request just goes away (the sender sees it unanswered, then gone). */
export async function declineFriendRequest(req: FriendRequest): Promise<boolean> {
  const email = myEmail();
  if (!email) return false;
  return (await rest(`friendRequests/${emailKey(email)}/${req.from}`, 'DELETE')).ok;
}

/** Remove a friend on both sides (their app drops me at its next check). */
export async function removeFriend(friendUid: string): Promise<boolean> {
  const uid = myUid();
  if (!uid) return false;
  const now = Date.now();
  await rest(`partnerInbox/${friendUid}/u_${uid}_${now}`, 'PUT', { type: 'unpair', from: uid, ts: now });
  const r = await rest(`users/${uid}/partners/${friendUid}`, 'DELETE');
  if (r.ok) {
    write(FRIENDS_KEY, cachedFriends().filter((f) => f.uid !== friendUid));
    write(OUTBOX_KEY, read<OutboxItem[]>(OUTBOX_KEY, []).filter((x) => x.to !== friendUid));
  }
  return r.ok;
}

function toShared(summary: LastSessionSummary): SharedSession {
  return {
    title: summary.title,
    ts: summary.ts,
    ...(typeof summary.durationMin === 'number' ? { durationMin: summary.durationMin } : {}),
    exercises: (summary.exercises ?? []).map((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      ...(e.engineName ? { engineName: e.engineName } : {}),
      sets: e.sets.map((s) => ({
        kg: s.kg,
        reps: s.reps,
        rating: s.rating,
        timestamp: s.timestamp,
        ...(s.durationSec ? { durationSec: s.durationSec } : {}),
      })),
      totalVolume: e.totalVolume,
      peakOneRM: e.peakOneRM,
    })),
  };
}

interface OutboxItem { to: string; id: string; body: Record<string, unknown> }

/** Send a finished session to one friend. Offline (or before they listed me) it waits
 *  in an outbox the next inbox check retries; the UI shows it sent either way. */
export async function sendSessionToFriend(summary: LastSessionSummary, friendUid: string): Promise<boolean> {
  const uid = myUid();
  if (!uid || !cachedFriends().some((f) => f.uid === friendUid)) return false;
  const item: OutboxItem = {
    to: friendUid,
    id: `s_${summary.ts}`,
    body: { type: 'session', from: uid, name: myPartnerName(), ts: Date.now(), session: toShared(summary) },
  };
  const mark = `${summary.ts}:${friendUid}`;
  write(SENT_KEY, [...read<string[]>(SENT_KEY, []).filter((x) => x !== mark), mark].slice(-100));
  const r = await rest(`partnerInbox/${item.to}/${item.id}`, 'PUT', item.body);
  if (!r.ok) {
    write(OUTBOX_KEY, [...read<OutboxItem[]>(OUTBOX_KEY, []).filter((x) => !(x.id === item.id && x.to === item.to)), item]);
  }
  return true;
}

async function flushOutbox(friendUids: ReadonlySet<string>): Promise<void> {
  const items = read<OutboxItem[]>(OUTBOX_KEY, []);
  if (items.length === 0) return;
  const left: OutboxItem[] = [];
  for (const it of items) {
    if (!friendUids.has(it.to) || Date.now() - Number(it.body.ts) > OUTBOX_TTL_MS) continue;
    const r = await rest(`partnerInbox/${it.to}/${it.id}`, 'PUT', it.body);
    if (!r.ok) left.push(it);
  }
  write(OUTBOX_KEY, left.length > 0 ? left : null);
}

/**
 * Refresh the friends, apply 'accept' / 'unpair' messages, drop my requests nobody
 * holds any more, retry the outbox; return the sessions waiting for an answer (oldest
 * first) and the friend requests addressed to me.
 */
export async function checkPartnerInbox(): Promise<InboxCheck> {
  const none: InboxCheck = { sessions: [], requests: [] };
  const uid = myUid();
  if (!uid || !partnerEnabled()) return none;
  const fetched = await fetchFriends(uid);
  if (fetched === undefined) return none;
  let friends = fetched;
  const email = myEmail();
  const incoming = email ? await rest(`friendRequests/${emailKey(email)}`) : { ok: false, data: null };
  const requests = Object.entries((incoming.ok ? incoming.data ?? {} : {}) as Record<string, { name?: string; ts?: number }>)
    .filter(([from]) => from !== uid && !friends.some((f) => f.uid === from))
    .map(([from, v]) => ({ from, name: String(v?.name ?? ''), ts: Number(v?.ts ?? 0) }))
    .sort((a, b) => a.ts - b.ts);
  // Nobody linked and nothing of mine out → nobody can have written to my inbox.
  if (friends.length === 0 && askedEmails().length === 0) return { sessions: [], requests };
  const inbox = await rest(`partnerInbox/${uid}`);
  if (!inbox.ok) return { sessions: [], requests };
  const msgs = Object.entries((inbox.data ?? {}) as Record<string, Record<string, unknown>>)
    .sort(([, a], [, b]) => Number(a.ts) - Number(b.ts));
  const sessions: PartnerSessionMessage[] = [];
  for (const [id, m] of msgs) {
    const from = String(m.from ?? '');
    if (m.type === 'accept') {
      const name = String(m.name ?? '');
      if (!friends.some((f) => f.uid === from)) {
        const listed = await rest(`users/${uid}/partners/${from}`, 'PUT', { name, since: Date.now() });
        if (!listed.ok) continue;
        friends = [...friends, { uid: from, name, since: Date.now() }];
        write(FRIENDS_KEY, friends);
      }
      write(ASKED_KEY, askedEmails().filter((e) => e !== String(m.email ?? '').toLowerCase()));
      await rest(`partnerInbox/${uid}/${id}`, 'DELETE');
      continue;
    }
    if (m.type === 'unpair' && friends.some((f) => f.uid === from)) {
      await rest(`users/${uid}/partners/${from}`, 'DELETE');
      friends = friends.filter((f) => f.uid !== from);
      write(FRIENDS_KEY, friends);
      await rest(`partnerInbox/${uid}/${id}`, 'DELETE');
      continue;
    }
    const session = m.session as SharedSession | undefined;
    const friend = friends.find((f) => f.uid === from);
    if (m.type === 'session' && friend && session && Array.isArray(session.exercises)) {
      sessions.push({ id, from, name: String(m.name ?? '') || friend.name, ts: Number(m.ts), session });
      continue;
    }
    // Stale (a former friend's leftovers, an unknown type).
    await rest(`partnerInbox/${uid}/${id}`, 'DELETE');
  }
  // A request of mine that is gone without an 'accept' was declined (or cancelled).
  const asked = askedEmails();
  if (asked.length > 0) {
    const still: string[] = [];
    for (const e of asked) {
      const r = await rest(`friendRequests/${emailKey(e)}/${uid}`);
      if (!r.ok || r.data !== null) still.push(e);
    }
    write(ASKED_KEY, still);
  }
  await flushOutbox(new Set(friends.map((f) => f.uid)));
  return { sessions, requests };
}

/** Exercises the receiver can't do (refusals + per-exercise list) are left out. */
export function planPartnerImport(session: SharedSession): { exercises: SessionExerciseBreakdown[]; skipped: string[] } {
  const refused = useOnboardingStore.getState().data?.refusedPatterns;
  const excl = Array.isArray(refused) && refused.length > 0
    ? buildExclusionTokens([], refused, {
      kneeSafeQuads: isEnabled('dp_knee_safe_quads_v1'),
      shoulderSafe: isEnabled('dp_shoulder_safe_v1'),
    })
    : null;
  const exercises: SessionExerciseBreakdown[] = [];
  const skipped: string[] = [];
  for (const e of session.exercises) {
    const name = e.engineName ?? e.exerciseName;
    const token = movementKey(name, getExerciseMetadata(name)).split('::')[1] ?? '';
    if (isEquipmentMissingExercise(name) || (excl && isExcludedMovement(name, token, excl))) {
      skipped.push(toExerciseDisplay(name).name);
    } else if (e.sets.length > 0) {
      exercises.push(e);
    }
  }
  return { exercises, skipped };
}

/** "Da, adauga": the session joins my history exactly as if I had logged it. */
export async function acceptPartnerSession(msg: PartnerSessionMessage): Promise<boolean> {
  const { exercises: kept } = planPartnerImport(msg.session);
  if (kept.length > 0) {
    const base = kept.map((e) => ({
      ...e,
      exerciseName: toExerciseDisplay(e.engineName ?? e.exerciseName).name,
      sets: e.sets.map(({ isPR: _p, prType: _t, ...s }) => s),
    }));
    const exercises = enrichExercisesWithPR(base, (DB.get<LogEntry[]>('logs') ?? []) as LogEntry[]);
    const sets = exercises.reduce((n, e) => n + e.sets.length, 0);
    const volume = exercises.reduce((v, e) => v + e.sets.reduce((x, s) => x + s.kg * s.reps, 0), 0);
    const minutes = msg.session.durationMin ?? 0;
    useWorkoutStore.getState().importSession({
      title: msg.session.title,
      meta: t('postRpe.metaTemplate', {
        sets: sets === 1 ? `1 ${t('common.set')}` : `${sets} ${t('common.setsPlural')}`,
        minutes,
        kg: formatKg(volume),
      }),
      ts: msg.session.ts,
      sets,
      durationMin: minutes,
      volumeKg: volume,
      exercises,
      fromPartner: msg.name,
    });
    refreshPRRecordsFromLogs();
  }
  return dismissPartnerSession(msg);
}

/** "Nu" (or after accepting): the message leaves the inbox. */
export async function dismissPartnerSession(msg: PartnerSessionMessage): Promise<boolean> {
  const uid = myUid();
  if (!uid) return false;
  return (await rest(`partnerInbox/${uid}/${msg.id}`, 'DELETE')).ok;
}
