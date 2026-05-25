import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { wipeUserDB, wipeAnonymousDBs, DB_NAME_PREFIX, _resetNamespaceCache, closeDb } from '../db.js';

const TEST_UID = 'testuidwipe12345';
const ANON_DB_A = `${DB_NAME_PREFIX}_anonymous_devAAA`;
const ANON_DB_B = `${DB_NAME_PREFIX}_anonymous_devBBB`;

/** Create a real (named) IndexedDB so databases() lists it for the wipe test. */
async function makeDb(name) {
  const db = new Dexie(name);
  db.version(1).stores({ t: 'id' });
  await db.open();
  db.close();
}

async function listAndura() {
  if (typeof indexedDB.databases !== 'function') return [];
  const dbs = await indexedDB.databases();
  return dbs.map(d => d.name).filter(n => typeof n === 'string' && n.startsWith(DB_NAME_PREFIX));
}

beforeEach(async () => {
  await closeDb();
  _resetNamespaceCache();
  try { localStorage.clear(); } catch {}
  try { await Dexie.delete(`${DB_NAME_PREFIX}_${TEST_UID}`); } catch {}
  try { await Dexie.delete(ANON_DB_A); } catch {}
  try { await Dexie.delete(ANON_DB_B); } catch {}
});

afterEach(async () => {
  try { await Dexie.delete(`${DB_NAME_PREFIX}_${TEST_UID}`); } catch {}
  try { await Dexie.delete(ANON_DB_A); } catch {}
  try { await Dexie.delete(ANON_DB_B); } catch {}
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

describe('§S-18 wipeAnonymousDBs — anonymous IDB residue (GDPR Art. 17)', () => {
  it('deletes all andura_anonymous_* databases', async () => {
    await makeDb(ANON_DB_A);
    await makeDb(ANON_DB_B);
    expect(await listAndura()).toEqual(expect.arrayContaining([ANON_DB_A, ANON_DB_B]));

    const r = await wipeAnonymousDBs();

    expect(r.deleted).toEqual(expect.arrayContaining([ANON_DB_A, ANON_DB_B]));
    const remaining = await listAndura();
    expect(remaining).not.toContain(ANON_DB_A);
    expect(remaining).not.toContain(ANON_DB_B);
  });

  it('does NOT delete the auth user DB (andura_<uid>)', async () => {
    const authDb = `${DB_NAME_PREFIX}_${TEST_UID}`;
    await makeDb(authDb);
    await makeDb(ANON_DB_A);

    await wipeAnonymousDBs();

    // Anonymous gone, auth DB untouched (only account-delete via wipeUserDB
    // removes the auth DB — wipeAnonymousDBs is scoped to anonymous residue).
    const remaining = await listAndura();
    expect(remaining).toContain(authDb);
    expect(remaining).not.toContain(ANON_DB_A);
  });

  it('no-op when no anonymous DBs exist', async () => {
    const r = await wipeAnonymousDBs();
    expect(r.deleted).toEqual([]);
  });

  it('wipeUserDB also sweeps anonymous residue (account-delete closes S-18)', async () => {
    const authDb = `${DB_NAME_PREFIX}_${TEST_UID}`;
    await makeDb(authDb);
    await makeDb(ANON_DB_A);

    const r = await wipeUserDB(TEST_UID);

    expect(r.deleted).toBe(true);
    const remaining = await listAndura();
    // Both auth DB AND anonymous residue gone post account-delete.
    expect(remaining).not.toContain(authDb);
    expect(remaining).not.toContain(ANON_DB_A);
  });
});
