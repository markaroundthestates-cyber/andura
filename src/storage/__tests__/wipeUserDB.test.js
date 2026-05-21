import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { wipeUserDB, DB_NAME_PREFIX, _resetNamespaceCache, closeDb } from '../db.js';

const TEST_UID = 'testuidwipe12345';

beforeEach(async () => {
  await closeDb();
  _resetNamespaceCache();
  try { localStorage.clear(); } catch {}
  try { await Dexie.delete(`${DB_NAME_PREFIX}_${TEST_UID}`); } catch {}
});

afterEach(async () => {
  try { await Dexie.delete(`${DB_NAME_PREFIX}_${TEST_UID}`); } catch {}
});

describe('§56.12 wipeUserDB — opt-in IndexedDB wipe Logout flow', () => {
  it('null/empty uid → noop ok=false', async () => {
    expect((await wipeUserDB('')).deleted).toBe(false);
    expect((await wipeUserDB(null)).deleted).toBe(false);
    expect((await wipeUserDB(undefined)).deleted).toBe(false);
  });

  it('valid uid → delete returns dbName', async () => {
    const r = await wipeUserDB(TEST_UID);
    expect(r.deleted).toBe(true);
    expect(r.dbName).toContain(DB_NAME_PREFIX);
    expect(r.dbName).toContain(TEST_UID);
  });

  it('idempotent — re-wipe noop ok=true (Dexie.delete tolerates non-existent)', async () => {
    await wipeUserDB(TEST_UID);
    const r2 = await wipeUserDB(TEST_UID);
    expect(r2.deleted).toBe(true);
  });
});
