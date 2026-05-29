// ══ STORE MERGE — pure no-clobber merge primitives (08.050/051) ═════════════
// The wv2-* Zustand stores (workout/progres/onboarding/nutrition/schedule/
// settings) are localStorage-only — a logged-in user lost everything on
// reinstall / cache-clear / new device because none of them reached Firebase
// RTDB (only the flat Tier-0 SYNC_KEYS in firebase.js did).
//
// This module holds the PURE merge rules used when restoring a remote snapshot
// into local state. ANDURA never-delete invariant: a local entry absent from
// remote is NEVER dropped, and a remote entry absent from local is always
// pulled down. No network, no store access here — exported pure functions so
// the no-clobber / dedupe / max / LWW rules are unit-testable in isolation.
//
// MERGE RULES (mandatory):
//   - arrays (sessionsHistory / weightLog / bodyData / dailyLog / logs) → union
//     by a stable id (ts, id, date, or dateISO), deduped, BOTH sides kept.
//   - scalars like `streak` → take the max (never regress a streak on restore).
//   - profile / bodyData scalars / goals → last-write-wins by `updatedAt`.

/**
 * Identity-key strategy for an array. The natural dedup key differs per store:
 *   - weightLog → 'date'   (one entry per calendar day; ts is a write tiebreaker)
 *   - nutrition → 'dateISO'(one entry per calendar day)
 *   - sessionsHistory / bodyData → 'ts' (multiple distinct entries per day OK)
 * 'auto' (default) tries id → ts → dateISO → date, then a JSON signature for
 * id-less primitives. An explicit key is preferred when the store has a single
 * canonical per-day record so two devices editing the same day converge.
 */
export type IdKey = 'auto' | 'id' | 'ts' | 'date' | 'dateISO';

/** Extract a stable identity key from an array entry under the given strategy.
 *  Falls back to a JSON signature so id-less entries still dedupe exact
 *  duplicates (never silently collapse distinct ones). */
function entryId(entry: unknown, idKey: IdKey): string {
  if (entry && typeof entry === 'object') {
    const e = entry as Record<string, unknown>;
    if (idKey !== 'auto') {
      const v = e[idKey];
      if (typeof v === 'string' || typeof v === 'number') return `${idKey}:${v}`;
      // Explicit key missing on this entry → fall through to a value signature
      // (do NOT collapse distinct entries onto a single missing-key bucket).
    } else {
      if (typeof e.id === 'string' || typeof e.id === 'number') return `id:${e.id}`;
      if (typeof e.ts === 'number') return `ts:${e.ts}`;
      if (typeof e.dateISO === 'string') return `dateISO:${e.dateISO}`;
      if (typeof e.date === 'string') return `date:${e.date}`;
    }
  }
  // Primitive or id-less object — exact-value signature (dedupes true dupes only).
  try {
    return `json:${JSON.stringify(entry)}`;
  } catch {
    return `ref:${String(entry)}`;
  }
}

/**
 * Union two arrays by stable id, keeping BOTH sides. On id collision the LOCAL
 * entry wins (it is the one the user most recently touched on this device — the
 * existing firebase.js logs merge uses the same local-wins-on-conflict rule).
 * Order: local entries first (in original order), then remote-only entries
 * appended (in original order). No entry from either side is ever dropped.
 *
 * @param idKey identity-key strategy (default 'auto' — see {@link IdKey}).
 */
export function mergeArrayUnion<T>(
  local: readonly T[] | undefined | null,
  remote: readonly T[] | undefined | null,
  idKey: IdKey = 'auto',
): T[] {
  const localArr = Array.isArray(local) ? local : [];
  const remoteArr = Array.isArray(remote) ? remote : [];
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of localArr) {
    const k = entryId(e, idKey);
    if (seen.has(k)) continue; // collapse local-internal dupes defensively
    seen.add(k);
    out.push(e);
  }
  for (const e of remoteArr) {
    const k = entryId(e, idKey);
    if (seen.has(k)) continue; // local already won this id
    seen.add(k);
    out.push(e);
  }
  return out;
}

/** Take the larger of two scalar numbers (streak never regresses on restore).
 *  Non-finite operands are ignored in favor of the finite side; both absent → 0. */
export function mergeMaxScalar(
  local: number | undefined | null,
  remote: number | undefined | null,
): number {
  const l = typeof local === 'number' && Number.isFinite(local) ? local : null;
  const r = typeof remote === 'number' && Number.isFinite(remote) ? remote : null;
  if (l === null && r === null) return 0;
  if (l === null) return r as number;
  if (r === null) return l;
  return Math.max(l, r);
}

/**
 * Last-write-wins by `updatedAt` for whole-value scalars/objects (profile,
 * goals, completed flags). When remote is strictly newer, remote wins; on a tie
 * or missing remote timestamp the LOCAL value is preserved (never clobber a
 * local value with an equally-old or undated remote). `localUpdatedAt` /
 * `remoteUpdatedAt` are epoch ms; absent → treated as 0 (oldest).
 */
export function mergeLastWriteWins<T>(
  local: T,
  remote: T | undefined,
  localUpdatedAt: number | undefined | null,
  remoteUpdatedAt: number | undefined | null,
): T {
  if (remote === undefined) return local;
  const l = typeof localUpdatedAt === 'number' && Number.isFinite(localUpdatedAt) ? localUpdatedAt : 0;
  const r = typeof remoteUpdatedAt === 'number' && Number.isFinite(remoteUpdatedAt) ? remoteUpdatedAt : 0;
  return r > l ? remote : local;
}

/** Pick the most recent ISO day-key string (YYYY-MM-DD lexicographically sortable).
 *  Used for lastStreakDate so the streak day-boundary survives a restore intact. */
export function mergeMaxIsoDate(
  local: string | null | undefined,
  remote: string | null | undefined,
): string | null {
  const l = typeof local === 'string' && local.length > 0 ? local : null;
  const r = typeof remote === 'string' && remote.length > 0 ? remote : null;
  if (l === null) return r;
  if (r === null) return l;
  return r > l ? r : l;
}
