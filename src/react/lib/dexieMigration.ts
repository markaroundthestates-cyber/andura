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

interface ArchivedSession extends LastSessionSummary {
  archivedAt: number;
}

class AnduraDexieDB extends Dexie {
  sessions!: Table<ArchivedSession, number>;

  constructor() {
    super('AnduraArchive');
    this.version(1).stores({
      sessions: '++id, ts, archivedAt',
    });
  }
}

let _db: AnduraDexieDB | null = null;
function getDb(): AnduraDexieDB | null {
  if (typeof indexedDB === 'undefined') return null;
  if (_db === null) {
    try {
      _db = new AnduraDexieDB();
    } catch {
      return null;
    }
  }
  return _db;
}

/** Archive a session în IndexedDB (additive, NU modify localStorage). */
export async function archiveSession(session: LastSessionSummary): Promise<void> {
  const db = getDb();
  if (db === null) return;
  try {
    await db.sessions.add({ ...session, archivedAt: Date.now() });
  } catch {
    /* fail silent — additive layer, NOT critical path */
  }
}

/** Retrieve archived sessions (reverse-chrono). */
export async function getArchivedSessions(): Promise<ArchivedSession[]> {
  const db = getDb();
  if (db === null) return [];
  try {
    return await db.sessions.orderBy('ts').reverse().toArray();
  } catch {
    return [];
  }
}

/** Clear archive (admin/dev helper). */
export async function clearArchive(): Promise<void> {
  const db = getDb();
  if (db === null) return;
  try {
    await db.sessions.clear();
  } catch {
    /* fail silent */
  }
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
