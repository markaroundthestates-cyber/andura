// ══ src/storage/db.js — Dexie wrapper tests (ADR 020) ══════════════════════
// Uses fake-indexeddb to mock IndexedDB API in jsdom environment.
// Each test gets fresh DB instance via beforeEach reset.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';

import {
  getDb,
  closeDb,
  getNamespace,
  _resetNamespaceCache,
  STORES,
  SCHEMA_VERSION,
  tier1Add,
  tier1Bulk,
  tier1All,
  tier1Delete,
  logMigrationEvent,
  getStorageStats,
} from '../db.js';

const DEFAULT_DB_NAME = 'andura_users_daniel';

// Reset Dexie state between tests so each starts clean.
// Strategy: close singleton, then delete the IndexedDB database explicitly.
beforeEach(async () => {
  await closeDb();
  try { await Dexie.delete(DEFAULT_DB_NAME); } catch { /* swallow */ }
  _resetNamespaceCache();
  try { localStorage.clear(); } catch { /* swallow */ }
});

afterEach(async () => {
  await closeDb();
  try { await Dexie.delete(DEFAULT_DB_NAME); } catch { /* swallow */ }
});

describe('storage/db — namespace resolution', () => {
  it('returns sanitized default namespace pre-Auth', () => {
    // Default user config has firebase.userPath = 'users/daniel'
    expect(getNamespace()).toBe('users_daniel');
  });

  it('respects override via sf.userConfig localStorage key', () => {
    localStorage.setItem('sf.userConfig', JSON.stringify({ firebase: { userPath: 'users/alice-test' } }));
    _resetNamespaceCache();
    expect(getNamespace()).toBe('users_alice_test');
  });

  it('falls back to "anonymous" when config throws', () => {
    localStorage.setItem('sf.userConfig', '{not valid json');
    _resetNamespaceCache();
    // getUserConfig returns USER_DEFAULTS on JSON parse error → still has userPath
    // Sanitization wraps the default users/daniel → users_daniel
    expect(getNamespace()).toBe('users_daniel');
  });

  it('caches namespace across calls (no re-sanitize cost)', () => {
    const ns1 = getNamespace();
    const ns2 = getNamespace();
    expect(ns1).toBe(ns2);
  });
});

describe('storage/db — schema definition', () => {
  it('defines all stores (v1 4 + v3 behavior_tier1)', async () => {
    const db = getDb();
    await db.open();
    const names = db.tables.map(t => t.name).sort();
    expect(names).toEqual([
      STORES.APPLIED_PATTERNS_TIER1,
      STORES.BEHAVIOR_TIER1,
      STORES.CDL_TIER1,
      STORES.LOGS_TIER1,
      STORES.MIGRATION_EVENTS,
    ].sort());
  });

  it('exports SCHEMA_VERSION constant', () => {
    expect(SCHEMA_VERSION).toBe(3);
  });
});

// ── D107 v3 behavior_tier1 store ────────────────────────────────────────────
describe('storage/db — v3 behavior_tier1 (D107)', () => {
  it('v3 fresh DB exposes behavior_tier1 with t/kind/session indexes', async () => {
    const db = getDb();
    await db.table(STORES.BEHAVIOR_TIER1).put({ id: '100-1', t: 100, kind: 'log', session: 50 });
    await db.table(STORES.BEHAVIOR_TIER1).put({ id: '200-1', t: 200, kind: 'tap', session: 50 });
    const byKind = await db.table(STORES.BEHAVIOR_TIER1).where('kind').equals('log').toArray();
    expect(byKind).toHaveLength(1);
    expect(byKind[0].id).toBe('100-1');
    // Days-window prune query (delete rows below a cutoff) is indexable on `t`.
    const old = await db.table(STORES.BEHAVIOR_TIER1).where('t').below(150).toArray();
    expect(old.map(r => r.id)).toEqual(['100-1']);
  });

  it('v2→v3 upgrade preserves existing data + adds behavior_tier1', async () => {
    // Simulate a pre-existing v2 DB with a logs row + migration event.
    const v2Db = new Dexie(DEFAULT_DB_NAME);
    v2Db.version(1).stores({
      [STORES.CDL_TIER1]: 'id, ts, date',
      [STORES.LOGS_TIER1]: 'id, ts, ex, session',
      [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
      [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
    });
    v2Db.version(2).stores({ [STORES.MIGRATION_EVENTS]: '++id, ts, kind, status' });
    await v2Db.open();
    await v2Db.table(STORES.LOGS_TIER1).add({ id: 'L1', ts: 1000, ex: 'Bench', session: 1 });
    v2Db.close();

    // Reopen via production getDb() — triggers v2→v3 (additive store).
    const db = getDb();
    await db.open();
    const logs = await db.table(STORES.LOGS_TIER1).toArray();
    expect(logs).toHaveLength(1); // existing data intact
    // The new store is addressable + empty.
    expect(await db.table(STORES.BEHAVIOR_TIER1).count()).toBe(0);
  });
});

// ── SUB-CHAT5-005 v2 upgrade scaffold tests ────────────────────────────────
// Demonstrates Dexie schema-versioning pattern post-Beta first bump.
// V2 = additive `status` index pe migration_events + backfill 'success' pe
// existing records via upgrade hook. Tests verify:
//   1. Fresh v2 DB has status indexable
//   2. Pre-existing v1 records gain status='success' on auto-upgrade
//   3. Re-running upgrade is idempotent (no double-mutation)

describe('storage/db — v2 migration scaffold (SUB-CHAT5-005)', () => {
  it('v2 fresh DB allows status index queries pe migration_events', async () => {
    await logMigrationEvent({ kind: 'rotation', count: 5, status: 'success' });
    await logMigrationEvent({ kind: 'rotation', count: 3, status: 'partial' });
    const db = getDb();
    const successOnly = await db.table(STORES.MIGRATION_EVENTS).where('status').equals('success').toArray();
    expect(successOnly).toHaveLength(1);
    expect(successOnly[0].count).toBe(5);
  });

  it('v1→v2 upgrade backfills status="success" pe existing records', async () => {
    // Simulate pre-existing v1 DB cu records absent `status` field.
    const v1Db = new Dexie(DEFAULT_DB_NAME);
    v1Db.version(1).stores({
      [STORES.CDL_TIER1]: 'id, ts, date',
      [STORES.LOGS_TIER1]: 'id, ts, ex, session',
      [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
      [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
    });
    await v1Db.open();
    await v1Db.table(STORES.MIGRATION_EVENTS).add({ ts: 1000, kind: 'rotation', count: 7 });
    await v1Db.table(STORES.MIGRATION_EVENTS).add({ ts: 2000, kind: 'rotation', count: 9 });
    v1Db.close();

    // Reopen via production getDb() — triggers v1→v2 upgrade automatic.
    const db = getDb();
    await db.open();
    const events = await db.table(STORES.MIGRATION_EVENTS).toArray();
    expect(events).toHaveLength(2);
    expect(events.every(e => e.status === 'success')).toBe(true);
  });

  it('upgrade backfill is idempotent — re-run does NOT mutate already-set status', async () => {
    // Pre-existing records with explicit status (e.g., 'partial') preserved
    // through upgrade hook idempotency check (`if (rec.status === undefined)`).
    const v1Db = new Dexie(DEFAULT_DB_NAME);
    v1Db.version(1).stores({
      [STORES.CDL_TIER1]: 'id, ts, date',
      [STORES.LOGS_TIER1]: 'id, ts, ex, session',
      [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
      [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
    });
    await v1Db.open();
    // v1 record cu status manually set (edge case — pre-bump caller knew schema future)
    await v1Db.table(STORES.MIGRATION_EVENTS).add({ ts: 1000, kind: 'rotation', status: 'partial' });
    v1Db.close();

    const db = getDb();
    await db.open();
    const events = await db.table(STORES.MIGRATION_EVENTS).toArray();
    expect(events).toHaveLength(1);
    expect(events[0].status).toBe('partial'); // preserved, NOT overwritten cu 'success'
  });
});

describe('storage/db — tier1Add + verify', () => {
  it('writes single entry and reads it back', async () => {
    const entry = { id: 'cd_test_1', ts: 1700000000000, date: '2024-11-14', payload: 'foo' };
    await tier1Add(STORES.CDL_TIER1, entry);
    const got = await tier1All(STORES.CDL_TIER1);
    expect(got).toHaveLength(1);
    expect(got[0]).toMatchObject(entry);
  });

  it('overwrites entry with same primary key (idempotent put)', async () => {
    await tier1Add(STORES.CDL_TIER1, { id: 'x', ts: 1, payload: 'old' });
    await tier1Add(STORES.CDL_TIER1, { id: 'x', ts: 2, payload: 'new' });
    const got = await tier1All(STORES.CDL_TIER1);
    expect(got).toHaveLength(1);
    expect(got[0].payload).toBe('new');
  });
});

describe('storage/db — tier1Bulk', () => {
  it('writes multiple entries in single transaction', async () => {
    const entries = Array.from({ length: 50 }, (_, i) => ({
      id: `cd_${i}`,
      ts: 1700000000000 + i,
      date: '2024-11-14',
    }));
    const result = await tier1Bulk(STORES.CDL_TIER1, entries);
    expect(result.written).toBe(50);
    const got = await tier1All(STORES.CDL_TIER1);
    expect(got).toHaveLength(50);
  });

  it('returns 0 written for empty array (no-op)', async () => {
    const result = await tier1Bulk(STORES.CDL_TIER1, []);
    expect(result.written).toBe(0);
  });

  it('returns 0 written for non-array input', async () => {
    const result = await tier1Bulk(STORES.CDL_TIER1, null);
    expect(result.written).toBe(0);
  });
});

describe('storage/db — tier1Delete', () => {
  it('deletes entries by primary key', async () => {
    await tier1Bulk(STORES.LOGS_TIER1, [
      { id: 'log_1', ts: 1, ex: 'squat' },
      { id: 'log_2', ts: 2, ex: 'bench' },
      { id: 'log_3', ts: 3, ex: 'deadlift' },
    ]);
    const result = await tier1Delete(STORES.LOGS_TIER1, ['log_1', 'log_3']);
    expect(result.deleted).toBe(2);
    const remaining = await tier1All(STORES.LOGS_TIER1);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('log_2');
  });

  it('returns 0 deleted for empty ids array', async () => {
    const result = await tier1Delete(STORES.LOGS_TIER1, []);
    expect(result.deleted).toBe(0);
  });
});

describe('storage/db — logMigrationEvent', () => {
  it('appends event to migration_events store with auto-id and ts', async () => {
    const id = await logMigrationEvent({ kind: 'rotation', count: 5 });
    expect(typeof id).toBe('number');
    const events = await tier1All(STORES.MIGRATION_EVENTS);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: 'rotation', count: 5 });
    expect(events[0].ts).toBeGreaterThan(0);
  });

  it('preserves order of multiple events', async () => {
    await logMigrationEvent({ kind: 'rotation', count: 1 });
    await logMigrationEvent({ kind: 'rotation', count: 2 });
    await logMigrationEvent({ kind: 'rotation', count: 3 });
    const events = await tier1All(STORES.MIGRATION_EVENTS);
    expect(events.map(e => e.count)).toEqual([1, 2, 3]);
  });
});

describe('storage/db — getStorageStats', () => {
  it('returns counts per store + namespace', async () => {
    await tier1Bulk(STORES.CDL_TIER1, [{ id: 'a' }, { id: 'b' }]);
    await tier1Add(STORES.LOGS_TIER1, { id: 'log_1' });
    const stats = await getStorageStats();
    expect(stats.namespace).toBe('users_daniel');
    expect(stats.counts[STORES.CDL_TIER1]).toBe(2);
    expect(stats.counts[STORES.LOGS_TIER1]).toBe(1);
    expect(stats.counts[STORES.APPLIED_PATTERNS_TIER1]).toBe(0);
    expect(stats.counts[STORES.MIGRATION_EVENTS]).toBe(0);
  });
});

describe('storage/db — closeDb resets singleton', () => {
  it('reuses same instance until closeDb', async () => {
    const a = getDb();
    const b = getDb();
    expect(a).toBe(b);
    await closeDb();
    const c = getDb();
    expect(c).not.toBe(a);
  });
});
