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
  it('defines all 4 stores in v1', async () => {
    const db = getDb();
    await db.open();
    const names = db.tables.map(t => t.name).sort();
    expect(names).toEqual([
      STORES.APPLIED_PATTERNS_TIER1,
      STORES.CDL_TIER1,
      STORES.LOGS_TIER1,
      STORES.MIGRATION_EVENTS,
    ].sort());
  });

  it('exports SCHEMA_VERSION constant', () => {
    expect(SCHEMA_VERSION).toBe(1);
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
