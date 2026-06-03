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
// §35-H1 aggregation now lives in a dependency-free shared module (LO-03) so the
// native sibling imports the SAME implementation (no hand-synced drift). Re-export
// keeps the public API of this module unchanged for existing importers.
export { aggregateSessionsByWeek } from './sessionAggregate';
export type { WeeklySessionAggregate } from './sessionAggregate';

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

// §35-H1 PRE-ARCHIVE AGGREGATION moved to ./sessionAggregate (LO-03) and
// re-exported above — single dependency-free SSOT shared with the native sibling.
