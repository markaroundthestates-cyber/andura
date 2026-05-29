// ══ migrateAnonymousToAuth — anon→auth Tier-1 handover tests (08.047) ═══════
// Proves the orphaned anonymous IndexedDB archive is merged into the auth
// namespace with the never-delete invariant: anon-only entries pulled into
// dest, dest entries never clobbered by a same-id anon entry, source deleted
// only after a verified copy, idempotent via the per-uid localStorage flag.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { DB_NAME_PREFIX, STORES } from '../db.js';
import { migrateAnonymousToAuth, ANON_MIGRATED_FLAG_PREFIX } from '../migrateAnonymousToAuth.js';

// device-id + uid chosen alphanumeric so db.js sanitization (non-alphanum →
// underscore) leaves the namespace unchanged → DB names are predictable here.
const DEVICE_ID = 'devabc123';
const UID = 'authuidxyz';
const ANON_NAME = `${DB_NAME_PREFIX}_anonymous_${DEVICE_ID}`;
const AUTH_NAME = `${DB_NAME_PREFIX}_${UID}`;

function openWithSchema(name) {
  const db = new Dexie(name);
  db.version(1).stores({
    [STORES.CDL_TIER1]: 'id, ts, date',
    [STORES.LOGS_TIER1]: 'id, ts, ex, session',
    [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
    [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
  });
  return db;
}

async function seedAnon(entries) {
  const db = openWithSchema(ANON_NAME);
  await db.open();
  if (entries.logs) await db.table(STORES.LOGS_TIER1).bulkPut(entries.logs);
  if (entries.cdl) await db.table(STORES.CDL_TIER1).bulkPut(entries.cdl);
  db.close();
}

async function readAuthLogs() {
  const db = openWithSchema(AUTH_NAME);
  await db.open();
  const rows = await db.table(STORES.LOGS_TIER1).toArray();
  db.close();
  return rows;
}

beforeEach(async () => {
  try { await Dexie.delete(ANON_NAME); } catch { /* swallow */ }
  try { await Dexie.delete(AUTH_NAME); } catch { /* swallow */ }
  try { localStorage.clear(); } catch { /* swallow */ }
  localStorage.setItem('device-id', DEVICE_ID);
});

afterEach(async () => {
  try { await Dexie.delete(ANON_NAME); } catch { /* swallow */ }
  try { await Dexie.delete(AUTH_NAME); } catch { /* swallow */ }
});

describe('migrateAnonymousToAuth', () => {
  it('copies anon-only Tier-1 entries into the auth namespace', async () => {
    await seedAnon({ logs: [{ id: 'l1', ts: 100, ex: 'Bench' }, { id: 'l2', ts: 200, ex: 'Squat' }] });

    const res = await migrateAnonymousToAuth(UID);

    expect(res.migrated).toBe(true);
    expect(res.copied).toBe(2);
    const authLogs = await readAuthLogs();
    expect(authLogs.map((r) => r.id).sort()).toEqual(['l1', 'l2']);
  });

  it('never clobbers a dest entry with a same-id anon entry', async () => {
    // Auth namespace already has l1 (real authed history); anon has a stale l1.
    const dest = openWithSchema(AUTH_NAME);
    await dest.open();
    await dest.table(STORES.LOGS_TIER1).put({ id: 'l1', ts: 999, ex: 'AUTH-OWNED' });
    dest.close();
    await seedAnon({ logs: [{ id: 'l1', ts: 1, ex: 'STALE-ANON' }, { id: 'l2', ts: 2, ex: 'Row' }] });

    const res = await migrateAnonymousToAuth(UID);

    expect(res.copied).toBe(1); // only l2 (anon-only) copied
    const authLogs = await readAuthLogs();
    expect(authLogs.find((r) => r.id === 'l1')?.ex).toBe('AUTH-OWNED'); // dest preserved
    expect(authLogs.find((r) => r.id === 'l2')?.ex).toBe('Row'); // anon-only added
  });

  it('deletes the anonymous source DB after a verified copy', async () => {
    await seedAnon({ cdl: [{ id: 'c1', ts: 1 }] });

    await migrateAnonymousToAuth(UID);

    // Source deleted → re-opening the anon name yields an empty store (deleted
    // DBs are recreated fresh on next open). The entry must be gone from source.
    const reopened = openWithSchema(ANON_NAME);
    await reopened.open();
    const remaining = await reopened.table(STORES.CDL_TIER1).toArray();
    reopened.close();
    expect(remaining).toHaveLength(0);
  });

  it('is idempotent — a second run is a no-op (flag set)', async () => {
    await seedAnon({ logs: [{ id: 'l1', ts: 1 }] });
    await migrateAnonymousToAuth(UID);

    expect(localStorage.getItem(`${ANON_MIGRATED_FLAG_PREFIX}${UID}`)).toBeTruthy();

    const second = await migrateAnonymousToAuth(UID);
    expect(second.migrated).toBe(true);
    expect(second.copied).toBe(0);
    expect(second.reason).toBe('already_migrated');
  });

  it('no-ops gracefully when there is no anonymous source', async () => {
    localStorage.removeItem('device-id'); // no device id → no anon namespace
    const res = await migrateAnonymousToAuth(UID);
    expect(res.migrated).toBe(true);
    expect(res.copied).toBe(0);
    expect(res.reason).toBe('no_anon_source');
  });

  it('rejects a missing uid', async () => {
    const res = await migrateAnonymousToAuth('');
    expect(res.migrated).toBe(false);
    expect(res.reason).toBe('no_uid');
  });
});
