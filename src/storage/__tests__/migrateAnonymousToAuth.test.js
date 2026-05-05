// ══ migrateAnonymousToAuth — anonymous → auth IndexedDB migration tests ════
// Per §56.1.4 LOCKED V1 + §56.7 Anonymous→Auth Merge Fork Decision.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';

import { migrateAnonymousToAuth } from '../migrateAnonymousToAuth.js';
import { STORES, DB_NAME_PREFIX, closeDb, _resetNamespaceCache } from '../db.js';

const ANON_UUID = 'dev-test-uuid-12345';
const AUTH_UID = 'firebase-uid-abcdef';
const SOURCE_DB = `${DB_NAME_PREFIX}_anonymous_${ANON_UUID}`;
const TARGET_DB = `${DB_NAME_PREFIX}_${AUTH_UID}`;

function _openWithSchema(dbName) {
  const db = new Dexie(dbName);
  db.version(1).stores({
    [STORES.CDL_TIER1]: 'id, ts, date',
    [STORES.LOGS_TIER1]: 'id, ts, ex, session',
    [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
    [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
  });
  return db;
}

beforeEach(async () => {
  await closeDb();
  _resetNamespaceCache();
  try { localStorage.clear(); } catch { /* swallow */ }
  try { await Dexie.delete(SOURCE_DB); } catch { /* swallow */ }
  try { await Dexie.delete(TARGET_DB); } catch { /* swallow */ }
});

afterEach(async () => {
  try { await Dexie.delete(SOURCE_DB); } catch { /* swallow */ }
  try { await Dexie.delete(TARGET_DB); } catch { /* swallow */ }
});

describe('migrateAnonymousToAuth', () => {
  it('throws if anonymousUuid or authUid missing', async () => {
    await expect(migrateAnonymousToAuth({ anonymousUuid: '', authUid: AUTH_UID }))
      .rejects.toThrow(/required/);
    await expect(migrateAnonymousToAuth({ anonymousUuid: ANON_UUID, authUid: '' }))
      .rejects.toThrow(/required/);
  });

  it('noop if source DB absent (idempotent re-run)', async () => {
    const result = await migrateAnonymousToAuth({ anonymousUuid: ANON_UUID, authUid: AUTH_UID });
    expect(result.status).toBe('noop');
    expect(result.total_records).toBe(0);
  });

  it('migrates source records → target + deletes source on success', async () => {
    // Seed source DB
    const source = _openWithSchema(SOURCE_DB);
    await source.table(STORES.CDL_TIER1).bulkPut([
      { id: 'cdl-1', ts: 100, date: '2026-04-01' },
      { id: 'cdl-2', ts: 200, date: '2026-04-02' },
    ]);
    await source.table(STORES.LOGS_TIER1).bulkPut([
      { id: 'log-1', ts: 150, ex: 'squat', session: 's1' },
    ]);
    source.close();

    const result = await migrateAnonymousToAuth({ anonymousUuid: ANON_UUID, authUid: AUTH_UID });

    expect(result.status).toBe('success');
    expect(result.total_records).toBe(3);
    expect(result.stores_migrated[STORES.CDL_TIER1]).toBe(2);
    expect(result.stores_migrated[STORES.LOGS_TIER1]).toBe(1);

    // Verify target has records
    const target = _openWithSchema(TARGET_DB);
    expect(await target.table(STORES.CDL_TIER1).count()).toBe(2);
    expect(await target.table(STORES.LOGS_TIER1).count()).toBe(1);
    // Migration event audit recorded
    const events = await target.table(STORES.MIGRATION_EVENTS).toArray();
    expect(events.length).toBe(1);
    expect(events[0].kind).toBe('anonymous_to_auth_migration');
    expect(events[0].status).toBe('success');
    target.close();

    // Source DB deleted
    expect(await Dexie.exists(SOURCE_DB)).toBe(false);
  });

  it('idempotent on double run — second run noop after first success', async () => {
    // Seed + first migration
    const source = _openWithSchema(SOURCE_DB);
    await source.table(STORES.CDL_TIER1).put({ id: 'cdl-x', ts: 1, date: '2026-04-01' });
    source.close();
    const first = await migrateAnonymousToAuth({ anonymousUuid: ANON_UUID, authUid: AUTH_UID });
    expect(first.status).toBe('success');

    // Second run — source deleted, expect noop
    const second = await migrateAnonymousToAuth({ anonymousUuid: ANON_UUID, authUid: AUTH_UID });
    expect(second.status).toBe('noop');
  });

  it('preserves target data when re-running over existing target', async () => {
    // Seed source + pre-existing target
    const source = _openWithSchema(SOURCE_DB);
    await source.table(STORES.CDL_TIER1).put({ id: 'cdl-source', ts: 1, date: '2026-04-01' });
    source.close();

    const targetPre = _openWithSchema(TARGET_DB);
    await targetPre.table(STORES.CDL_TIER1).put({ id: 'cdl-existing', ts: 2, date: '2026-04-02' });
    targetPre.close();

    const result = await migrateAnonymousToAuth({ anonymousUuid: ANON_UUID, authUid: AUTH_UID });
    expect(result.status).toBe('success');

    // Target now has both records (existing preserved + source merged)
    const target = _openWithSchema(TARGET_DB);
    expect(await target.table(STORES.CDL_TIER1).count()).toBe(2);
    target.close();
  });
});
