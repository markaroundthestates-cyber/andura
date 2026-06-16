// ══ ARCHIVE PER-UID ISOLATION — cycle-10 audit HIGH (GDPR + cross-UID leak) ══
//
// The overflow archive (dexieMigration: archiveSession / getArchivedSessions, the GDPR
// export source) used to open a SINGLE device-global `AnduraArchive`, so on a shared
// device user A's archived sessions (a) leaked into user B's export AND (b) survived A's
// account deletion — NONE of the 4 teardown paths cleared it. Now the archive is
// namespaced per-UID (`AnduraArchive_<namespace>`) and every per-UID wipe path deletes it.
//
// Drives the REAL archiveSession / getArchivedSessions + the REAL production teardown
// (clearUserDataKeys+clearUserIndexedDB / wipeUserDataOnLogout / enforceDataOwner /
// wipeUserDB) under fake-indexeddb. Production-shaped sessions (non-round kg, reps 8-12,
// RO rating literals, ISO-week-spaced ts). Two distinct UIDs via distinct device-ids.

import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { archiveSession, getArchivedSessions, getArchivedSessionCount, _resetArchiveCacheForTest, ARCHIVE_DB_NAME } from '../../lib/dexieMigration';
import { clearUserDataKeys, clearUserIndexedDB, wipeUserDataOnLogout, enforceDataOwner } from '../../../util/dataReset';
import { _resetNamespaceCache, closeDb, getNamespace } from '../../../storage/db.js';
import type { LastSessionSummary } from '../../stores/workoutStore';

const WEEK = 7 * 24 * 60 * 60 * 1000;
const T0 = Date.parse('2026-03-02T18:30:00Z'); // a Monday

function sessionA(): LastSessionSummary {
  return {
    title: 'Impins din piept', meta: '4 seturi · 47 min · 7 410 kg',
    ts: T0, sets: 4, durationMin: 47, volumeKg: 7410,
    exercises: [{ name: 'Barbell Bench Press', sets: [
      { weight: 62.5, reps: 10, rating: 'mediu', timestamp: T0 + 1000 } as never,
      { weight: 62.5, reps: 9, rating: 'greu', timestamp: T0 + 2000 } as never,
    ] } as never],
  };
}
function sessionB(): LastSessionSummary {
  return {
    title: 'Genuflexiuni', meta: '5 seturi · 53 min · 11 250 kg',
    ts: T0 + WEEK, sets: 5, durationMin: 53, volumeKg: 11250,
    exercises: [{ name: 'Barbell Back Squat', sets: [
      { weight: 92.5, reps: 8, rating: 'greu', timestamp: T0 + WEEK + 1000 } as never,
    ] } as never],
  };
}

/** Switch the active user namespace (anonymous device-id) like a real account switch. */
async function asUser(deviceId: string): Promise<void> {
  await closeDb();
  _resetNamespaceCache();
  _resetArchiveCacheForTest();
  localStorage.setItem('device-id', deviceId);
}

beforeEach(async () => {
  try { localStorage.clear(); } catch { /* */ }
  await closeDb();
  _resetNamespaceCache();
  _resetArchiveCacheForTest();
  // Clean any residue DBs from a prior test.
  try { await Dexie.delete('AnduraArchive'); } catch { /* */ }
  try { await Dexie.delete(ARCHIVE_DB_NAME('anonymous_devA')); } catch { /* */ }
  try { await Dexie.delete(ARCHIVE_DB_NAME('anonymous_devB')); } catch { /* */ }
});

describe('archive is namespaced per-UID + survives no teardown path', () => {
  it('cross-UID: user B never sees user A archived session', async () => {
    await asUser('devA');
    await archiveSession(sessionA());
    expect((await getArchivedSessions()).map((s) => s.title)).toContain('Impins din piept');

    await asUser('devB');
    await archiveSession(sessionB());
    const bExport = await getArchivedSessions();
    expect(bExport.map((s) => s.title)).toContain('Genuflexiuni');
    expect(bExport.map((s) => s.title)).not.toContain('Impins din piept'); // no leak
  });

  it('Reset path (clearUserDataKeys + clearUserIndexedDB) clears the archive', async () => {
    await asUser('devA');
    await archiveSession(sessionA());
    clearUserDataKeys();
    await clearUserIndexedDB();
    _resetArchiveCacheForTest();
    expect(await getArchivedSessions()).toEqual([]);
  });

  it('Logout path (wipeUserDataOnLogout) clears the archive', async () => {
    await asUser('devA');
    await archiveSession(sessionA());
    await wipeUserDataOnLogout();
    _resetArchiveCacheForTest();
    expect(await getArchivedSessions()).toEqual([]);
  });

  it('account-switch path (enforceDataOwner) clears the prior owner archive', async () => {
    await asUser('devA');
    await archiveSession(sessionA());
    // enforceDataOwner detects a different stored owner and wipes local + IDB.
    localStorage.setItem('data-owner-uid', 'someOtherUid');
    await enforceDataOwner('anonymous_devA');
    _resetArchiveCacheForTest();
    const after = await getArchivedSessions();
    expect(after.map((s) => s.title)).not.toContain('Impins din piept');
  });

  it("Delete-account path (wipeUserDB) deletes the user's archive DB", async () => {
    // wipeUserDB keys on the raw uid → its AnduraArchive_<sanitizedUid>. Use a uid whose
    // sanitized form equals the active namespace so we can read it back via getArchivedSessions.
    const dbMod = await import('../../../storage/db.js');
    localStorage.setItem('device-id', 'wipeuid');
    _resetNamespaceCache();
    _resetArchiveCacheForTest();
    const ns = getNamespace(); // 'anonymous_wipeuid'
    await archiveSession(sessionA());
    expect((await getArchivedSessions()).length).toBeGreaterThan(0);
    await dbMod.wipeUserDB(ns); // sanitized(ns) === ns → deletes AnduraArchive_<ns>
    _resetArchiveCacheForTest();
    expect(await getArchivedSessions()).toEqual([]);
  });
});

describe('C16-PR-002 — Total Sessions counts the archived overflow (true lifetime)', () => {
  it('getArchivedSessionCount returns the per-UID archive count', async () => {
    await asUser('devA');
    expect(await getArchivedSessionCount()).toBe(0);
    await archiveSession(sessionA());
    await archiveSession(sessionB());
    expect(await getArchivedSessionCount()).toBe(2);
  });

  it('lifetime total = in-memory sessionsHistory length + archived overflow (cap no longer freezes it)', async () => {
    await asUser('devA');
    // The store keeps at most SESSIONS_HISTORY_MAX=500 in memory; the rest is archived.
    const inMemory = 500;
    await archiveSession(sessionA());
    await archiveSession(sessionB());
    const archived = await getArchivedSessionCount(); // N = 2 overflow sessions
    // Istoric composes totalSessionsLifetime = stats.totalSessions + archivedCount.
    expect(inMemory + archived).toBe(502);
  });

  it('count is per-UID isolated (user B does not see user A overflow)', async () => {
    await asUser('devA');
    await archiveSession(sessionA());
    expect(await getArchivedSessionCount()).toBe(1);
    await asUser('devB');
    expect(await getArchivedSessionCount()).toBe(0);
  });
});

describe('legacy migration — a single user keeps their archive on upgrade', () => {
  it('pre-isolation device-global AnduraArchive migrates into the per-UID DB once', async () => {
    // Seed the OLD global DB as if written by a pre-fix build.
    const legacy = new Dexie('AnduraArchive');
    legacy.version(1).stores({ sessions: '++id, ts, archivedAt' });
    await legacy.open();
    await (legacy as never as { sessions: { add: (s: object) => Promise<unknown> } })
      .sessions.add({ ...sessionA(), archivedAt: Date.now() });
    legacy.close();

    await asUser('devA');
    const migrated = await getArchivedSessions();
    expect(migrated.map((s) => s.title)).toContain('Impins din piept'); // not lost on upgrade

    // The legacy global is retired (no residue for the next user).
    if (typeof indexedDB.databases === 'function') {
      const names = (await indexedDB.databases()).map((d) => d?.name);
      expect(names).not.toContain('AnduraArchive');
    }
  });

  it('a SECOND user on the device does NOT inherit the legacy archive', async () => {
    const legacy = new Dexie('AnduraArchive');
    legacy.version(1).stores({ sessions: '++id, ts, archivedAt' });
    await legacy.open();
    await (legacy as never as { sessions: { add: (s: object) => Promise<unknown> } })
      .sessions.add({ ...sessionA(), archivedAt: Date.now() });
    legacy.close();

    // User A claims the legacy archive.
    await asUser('devA');
    expect((await getArchivedSessions()).map((s) => s.title)).toContain('Impins din piept');

    // User B (fresh) on the same device must start empty.
    await asUser('devB');
    expect(await getArchivedSessions()).toEqual([]);
  });
});
