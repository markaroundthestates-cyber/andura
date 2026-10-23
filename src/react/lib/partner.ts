// ══ TRAINING PARTNER — log once, both accounts get the session ═══════════════
// Founder 2026-10-23: he and his friend train together (same exercises, same
// weights), and the friend's sessions were copied by hand twice. Two linked
// accounts now pass sessions through a per-user inbox in RTDB:
//
//   partnerInvites/<CODE>        {uid, name, ts}   creator-only, read by exact code
//   users/<uid>/partners/<other> {name, since}     the allowlist (own node)
//   partnerInbox/<uid>/<msgId>   {type, from, ts, …} readable by <uid>; created only
//                                by a listed partner, or a 'join' carrying a live code
//
// (database.rules.json; probed live before the client shipped.) Pairing: one side
// shows a 6-letter code, the other enters it → a 'join' lands in the inviter's inbox
// and the inviter's next check lists the joiner back. A sent session waits in the
// partner's inbox until they accept it ("Adaug si la tine?") or say no. Accepting
// drops what THEY can't do (their refusals + "Nu pot face asta" list), recomputes
// PRs against their own history and moves their streak — same writes as a session
// they finished themselves. Effort ratings travel as logged (same sets, same weights).

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

export interface PartnerLink { uid: string; name: string; since: number }

/** The part of a finished session that travels to the partner. */
export interface SharedSession {
  title: string;
  ts: number;
  durationMin?: number;
  exercises: SessionExerciseBreakdown[];
}

export interface PartnerSessionMessage { id: string; from: string; name: string; ts: number; session: SharedSession }

const PARTNER_KEY = 'wv2-partner';
const OUTBOX_KEY = 'wv2-partner-outbox';
const SENT_KEY = 'wv2-partner-sent';
const MY_NAME_KEY = 'wv2-partner-myname';
const INVITE_KEY = 'wv2-partner-invite';
const INVITE_TTL_MS = 86_400_000;
const OUTBOX_TTL_MS = 7 * 86_400_000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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

/** True while there is something to poll for: a link, or my code waiting for a join. */
export function partnerPollWorthy(): boolean {
  return cachedPartner() !== null || Date.now() - read<number>(INVITE_KEY, 0) < INVITE_TTL_MS;
}

/** Last known link (instant UI); checkPartnerInbox refreshes it from the cloud. */
export function cachedPartner(): PartnerLink | null {
  return read<PartnerLink | null>(PARTNER_KEY, null);
}

export function myPartnerName(): string {
  return read<string>(MY_NAME_KEY, '');
}

export function wasSentToPartner(sessionTs: number): boolean {
  return read<number[]>(SENT_KEY, []).includes(sessionTs);
}

async function fetchPartner(uid: string): Promise<PartnerLink | null | undefined> {
  const r = await rest(`users/${uid}/partners`);
  if (!r.ok) return undefined;
  const entries = Object.entries((r.data ?? {}) as Record<string, { name?: string; since?: number }>);
  const first = entries[0];
  const link = first ? { uid: first[0], name: String(first[1]?.name ?? ''), since: Number(first[1]?.since ?? 0) } : null;
  write(PARTNER_KEY, link);
  return link;
}

/** Publish a fresh 6-letter code the partner types in. null when offline / signed out. */
export async function createInvite(name: string): Promise<string | null> {
  const uid = myUid();
  if (!uid) return null;
  write(MY_NAME_KEY, name);
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  const r = await rest(`partnerInvites/${code}`, 'PUT', { uid, name, ts: Date.now() });
  if (r.ok) write(INVITE_KEY, Date.now());
  return r.ok ? code : null;
}

export type JoinResult = 'ok' | 'invalid' | 'self' | 'error';

/** Enter the partner's code: list them as my partner + tell them to list me. */
export async function joinWithCode(rawCode: string, name: string): Promise<JoinResult> {
  const uid = myUid();
  if (!uid) return 'error';
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z2-9]{6}$/.test(code)) return 'invalid';
  write(MY_NAME_KEY, name);
  const inv = await rest(`partnerInvites/${code}`);
  if (!inv.ok) return 'error';
  const invite = inv.data as { uid?: string; name?: string; ts?: number } | null;
  if (!invite?.uid || typeof invite.ts !== 'number' || Date.now() - invite.ts > INVITE_TTL_MS) return 'invalid';
  if (invite.uid === uid) return 'self';
  const now = Date.now();
  const listed = await rest(`users/${uid}/partners/${invite.uid}`, 'PUT', { name: String(invite.name ?? ''), since: now });
  if (!listed.ok) return 'error';
  const told = await rest(`partnerInbox/${invite.uid}/j_${uid}_${now}`, 'PUT', { type: 'join', from: uid, name, code, ts: now });
  if (!told.ok) {
    await rest(`users/${uid}/partners/${invite.uid}`, 'DELETE');
    return 'error';
  }
  write(PARTNER_KEY, { uid: invite.uid, name: String(invite.name ?? ''), since: now });
  return 'ok';
}

/** Unlink on both sides (the partner's app drops me at its next check). */
export async function unpair(): Promise<boolean> {
  const uid = myUid();
  const link = cachedPartner();
  if (!uid || !link) return false;
  const now = Date.now();
  await rest(`partnerInbox/${link.uid}/u_${uid}_${now}`, 'PUT', { type: 'unpair', from: uid, ts: now });
  const r = await rest(`users/${uid}/partners/${link.uid}`, 'DELETE');
  if (r.ok) {
    write(PARTNER_KEY, null);
    write(OUTBOX_KEY, null);
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

/** Send a finished session to the partner. Offline (or before they listed me) it
 *  waits in an outbox the next inbox check retries; the UI shows it sent either way. */
export async function sendSessionToPartner(summary: LastSessionSummary): Promise<boolean> {
  const uid = myUid();
  const link = cachedPartner();
  if (!uid || !link) return false;
  const item: OutboxItem = {
    to: link.uid,
    id: `s_${summary.ts}`,
    body: { type: 'session', from: uid, name: myPartnerName(), ts: Date.now(), session: toShared(summary) },
  };
  write(SENT_KEY, [...read<number[]>(SENT_KEY, []).filter((x) => x !== summary.ts), summary.ts].slice(-50));
  const r = await rest(`partnerInbox/${item.to}/${item.id}`, 'PUT', item.body);
  if (!r.ok) write(OUTBOX_KEY, [...read<OutboxItem[]>(OUTBOX_KEY, []).filter((x) => x.id !== item.id), item]);
  return true;
}

async function flushOutbox(partnerUid: string | null): Promise<void> {
  const items = read<OutboxItem[]>(OUTBOX_KEY, []);
  if (items.length === 0) return;
  const left: OutboxItem[] = [];
  for (const it of items) {
    if (it.to !== partnerUid || Date.now() - Number(it.body.ts) > OUTBOX_TTL_MS) continue;
    const r = await rest(`partnerInbox/${it.to}/${it.id}`, 'PUT', it.body);
    if (!r.ok) left.push(it);
  }
  write(OUTBOX_KEY, left.length > 0 ? left : null);
}

/**
 * Refresh the link, apply pairing messages (join / unpair), retry the outbox and
 * return the partner's sessions still waiting for an answer, oldest first.
 */
export async function checkPartnerInbox(): Promise<PartnerSessionMessage[]> {
  const uid = myUid();
  if (!uid || !partnerEnabled()) return [];
  let link = await fetchPartner(uid);
  if (link === undefined) return [];
  // Not linked and no code of mine out there → nobody can have written to me.
  if (link === null && !(Date.now() - read<number>(INVITE_KEY, 0) < INVITE_TTL_MS)) return [];
  const inbox = await rest(`partnerInbox/${uid}`);
  if (!inbox.ok) return [];
  const msgs = Object.entries((inbox.data ?? {}) as Record<string, Record<string, unknown>>)
    .sort(([, a], [, b]) => Number(a.ts) - Number(b.ts));
  const pending: PartnerSessionMessage[] = [];
  for (const [id, m] of msgs) {
    const from = String(m.from ?? '');
    if (m.type === 'join' && link === null) {
      const name = String(m.name ?? '');
      const listed = await rest(`users/${uid}/partners/${from}`, 'PUT', { name, since: Date.now() });
      if (!listed.ok) continue;
      link = { uid: from, name, since: Date.now() };
      write(PARTNER_KEY, link);
      write(INVITE_KEY, null);
      await rest(`partnerInvites/${String(m.code)}`, 'DELETE');
      await rest(`partnerInbox/${uid}/${id}`, 'DELETE');
      continue;
    }
    if (m.type === 'unpair' && link?.uid === from) {
      await rest(`users/${uid}/partners/${from}`, 'DELETE');
      link = null;
      write(PARTNER_KEY, null);
      write(OUTBOX_KEY, null);
      await rest(`partnerInbox/${uid}/${id}`, 'DELETE');
      continue;
    }
    const session = m.session as SharedSession | undefined;
    if (m.type === 'session' && link?.uid === from && session && Array.isArray(session.exercises)) {
      pending.push({ id, from, name: String(m.name ?? '') || link.name, ts: Number(m.ts), session });
      continue;
    }
    // Stale (a join while already linked, a former partner's leftovers).
    await rest(`partnerInbox/${uid}/${id}`, 'DELETE');
  }
  await flushOutbox(link?.uid ?? null);
  return pending;
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
