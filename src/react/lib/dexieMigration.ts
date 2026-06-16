// ══ DEXIE MIGRATION ADAPTIVE LAYER — IndexedDB Archive Sessions ══════════
// Phase 5 task_12 — additive IndexedDB layer pentru sessions archive
// beyond localStorage Tier 1. ZERO destructive change la existing
// localStorage `wv2-*` keys (orchestrator §7 invariant Tier 0 storage
// paradigm preserved).
//
// Phase 5 task_12 scope: scaffold layer cu Dexie database initialization
// + archive/retrieve API. Workout store sessionsHistory rămâne Tier 1
// localStorage primary (zustand persist); Dexie = additive Tier 2 archive
// pentru sessions older than threshold (Phase 6+ scheduled migration).
//
// jsdom test environment: IndexedDB native NOT available → fail-silent
// returns empty array. Production browser env: Dexie persists.

import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { LastSessionSummary } from '../stores/workoutStore';
import { getNamespace } from '../../storage/db.js';

interface ArchivedSession extends LastSessionSummary {
  archivedAt: number;
}

// ── PER-UID ISOLATION (cycle-10 audit HIGH — GDPR + cross-UID leak) ──────────
// The overflow archive used to open a SINGLE device-global `AnduraArchive`, so on a
// SHARED device user A's archived sessions (a) leaked into user B's GDPR export
// (getArchivedSessions feeds SettingsExport) AND (b) survived A's account deletion —
// none of the 4 teardown paths (Reset / Logout / account-switch / Delete account)
// cleared it (they delete only `andura_<uid>` / `AnduraArchive` was never named). Now
// the archive is namespaced per-UID — `AnduraArchive_<namespace>` (the SAME getNamespace()
// the Tier-1 stores use) — so a different user opens a different DB, and the per-UID wipe
// paths delete `AnduraArchive_<ns>` alongside `andura_<ns>` (see dataReset.js / db.js).
const ARCHIVE_PREFIX = 'AnduraArchive';
/** Public so the teardown paths (dataReset.clearUserIndexedDB / db.wipeUserDB) can name it. */
export const ARCHIVE_DB_NAME = (ns: string): string => `${ARCHIVE_PREFIX}_${ns}`;
/** The legacy pre-isolation device-global archive (migrated once, then deleted). */
const LEGACY_GLOBAL = ARCHIVE_PREFIX;

class AnduraDexieDB extends Dexie {
  sessions!: Table<ArchivedSession, number>;

  constructor(dbName: string) {
    super(dbName);
    this.version(1).stores({
      sessions: '++id, ts, archivedAt',
    });
  }
}

// Cache keyed by namespace — on an account switch getNamespace() changes, so a stale
// instance is closed + reopened against the new per-UID DB (mirrors db.js closeDb).
let _db: AnduraDexieDB | null = null;
let _dbNs: string | null = null;
let _migratedNs: string | null = null;

function getDb(): AnduraDexieDB | null {
  if (typeof indexedDB === 'undefined') return null;
  let ns: string;
  try {
    ns = getNamespace();
  } catch {
    return null;
  }
  if (_db !== null && _dbNs === ns) return _db;
  if (_db !== null) {
    try { _db.close(); } catch { /* swallow */ }
    _db = null;
  }
  try {
    _db = new AnduraDexieDB(ARCHIVE_DB_NAME(ns));
    _dbNs = ns;
  } catch {
    _db = null;
    _dbNs = null;
    return null;
  }
  return _db;
}

/**
 * Reset the cached archive instance (account switch / teardown). Mirrors db.closeDb so
 * the next getDb() re-resolves the (possibly new) namespace.
 */
export function closeArchive(): void {
  if (_db !== null) {
    try { _db.close(); } catch { /* swallow */ }
  }
  _db = null;
  _dbNs = null;
}

/**
 * One-time migration of the legacy device-global `AnduraArchive` into the CURRENT user's
 * per-UID DB, then delete the global so it leaves no residue. Runs lazily, once per
 * namespace per session. Guard: only migrate when the per-UID DB is EMPTY (a fresh
 * upgrade), so a returning user keeps their own archive and a second user on the device
 * does NOT inherit the first user's legacy rows (the global is deleted after the first
 * migrating user claims it — best-effort + non-fatal).
 */
async function migrateLegacyIfNeeded(db: AnduraDexieDB, ns: string): Promise<void> {
  if (_migratedNs === ns) return;
  _migratedNs = ns;
  try {
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      const hasLegacy = dbs.some((d) => d?.name === LEGACY_GLOBAL);
      if (!hasLegacy) return;
    }
    const existing = await db.sessions.count();
    if (existing > 0) {
      // This per-UID DB already has data → never merge the global in (avoid a second
      // user inheriting it); just retire the global so it stops being residue.
      await Dexie.delete(LEGACY_GLOBAL);
      return;
    }
    const legacy = new AnduraDexieDB(LEGACY_GLOBAL);
    let rows: ArchivedSession[] = [];
    try {
      rows = await legacy.sessions.orderBy('ts').toArray();
    } catch { /* legacy schema mismatch / absent → nothing to migrate */ }
    try { legacy.close(); } catch { /* swallow */ }
    if (rows.length > 0) {
      // Re-key (drop the old auto-increment id, which Dexie adds at runtime but is not on
      // the typed interface) so the per-UID store assigns fresh ids on bulkAdd.
      await db.sessions.bulkAdd(rows.map((r) => {
        const copy = { ...r } as ArchivedSession & { id?: number };
        delete copy.id;
        return copy as ArchivedSession;
      }));
    }
    await Dexie.delete(LEGACY_GLOBAL);
  } catch {
    /* fail silent — additive layer, never block the workout path */
  }
}

/** Archive a session în IndexedDB (additive, NU modify localStorage). Per-UID. */
export async function archiveSession(session: LastSessionSummary): Promise<void> {
  const db = getDb();
  if (db === null) return;
  try {
    await migrateLegacyIfNeeded(db, _dbNs as string);
    await db.sessions.add({ ...session, archivedAt: Date.now() });
  } catch {
    /* fail silent — additive layer, NOT critical path */
  }
}

/** Retrieve archived sessions (reverse-chrono) for the CURRENT user only. */
export async function getArchivedSessions(): Promise<ArchivedSession[]> {
  const db = getDb();
  if (db === null) return [];
  try {
    await migrateLegacyIfNeeded(db, _dbNs as string);
    return await db.sessions.orderBy('ts').reverse().toArray();
  } catch {
    return [];
  }
}

/** Clear the CURRENT user's archive (admin/dev helper + teardown). */
export async function clearArchive(): Promise<void> {
  const db = getDb();
  if (db === null) return;
  try {
    await db.sessions.clear();
  } catch {
    /* fail silent */
  }
}

/**
 * Delete the CURRENT user's per-UID archive DB entirely (teardown: Reset / Logout /
 * account-switch). Closes the cached instance first so the delete is not blocked.
 * Best-effort + non-fatal.
 */
export async function deleteArchiveDb(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  let ns: string;
  try {
    ns = getNamespace();
  } catch {
    return;
  }
  closeArchive();
  try {
    await Dexie.delete(ARCHIVE_DB_NAME(ns));
  } catch {
    /* fail silent */
  }
}

/**
 * Reset the migration guard (testing only) so a fresh fake-indexeddb world re-runs the
 * legacy migration. Production never needs this — the guard is per-session-correct.
 */
export function _resetArchiveCacheForTest(): void {
  closeArchive();
  _migratedNs = null;
}

// ══ §35-H1 PRE-ARCHIVE AGGREGATION — Tier 2 storage compression ══════════
// Per ADR 020 §Rotation, Tier 2 cold storage scales linearly cu raw archive
// (every session = full LastSessionSummary object cu exercises breakdown).
// Aggregation step compresses detailed sessions → per-week summary BEFORE
// rotation to Tier 2 (deferred per tier2Stub.js), reducing footprint ~10-30x
// on long-history users (1+ year accumulation).
//
// Format: YYYY-Www ISO-week key (Mon-Sun boundary aligned cu scheduleStore).

export interface WeeklySessionAggregate {
  /** ISO week key e.g. "2026-W21". */
  weekKey: string;
  /** Count of sessions în interval. */
  sessionCount: number;
  /** Sum of sets across sessions (undefined sums skipped). */
  totalSets: number;
  /** Total duration minutes. */
  totalDurationMin: number;
  /** Total volume kg (sum across sessions). */
  totalVolumeKg: number;
  /** Earliest session ts în interval. */
  firstTs: number;
  /** Latest session ts în interval. */
  lastTs: number;
}

function isoWeekKey(ts: number): string {
  const d = new Date(ts);
  // ISO 8601 week: Thursday-anchored. Standard algorithm.
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNr = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${new Date(firstThursday).getUTCFullYear()}-W${String(weekNr).padStart(2, '0')}`;
}

/**
 * Aggregate detailed sessions → per-week summary. Pure function: input array,
 * output map. Caller decides cand sa apeleze (pre-archive rotation per ADR 020).
 *
 * @param sessions detailed sessions list
 * @returns map weekKey → aggregate
 */
export function aggregateSessionsByWeek(
  sessions: ReadonlyArray<LastSessionSummary>
): Record<string, WeeklySessionAggregate> {
  const result: Record<string, WeeklySessionAggregate> = {};
  for (const s of sessions) {
    if (typeof s.ts !== 'number') continue;
    const key = isoWeekKey(s.ts);
    const prev = result[key];
    if (prev === undefined) {
      result[key] = {
        weekKey: key,
        sessionCount: 1,
        totalSets: s.sets ?? 0,
        totalDurationMin: s.durationMin ?? 0,
        totalVolumeKg: s.volumeKg ?? 0,
        firstTs: s.ts,
        lastTs: s.ts,
      };
    } else {
      prev.sessionCount += 1;
      prev.totalSets += s.sets ?? 0;
      prev.totalDurationMin += s.durationMin ?? 0;
      prev.totalVolumeKg += s.volumeKg ?? 0;
      if (s.ts < prev.firstTs) prev.firstTs = s.ts;
      if (s.ts > prev.lastTs) prev.lastTs = s.ts;
    }
  }
  return result;
}
