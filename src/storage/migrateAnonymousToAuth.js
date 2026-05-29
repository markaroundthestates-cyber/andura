// ══ MIGRATE ANONYMOUS → AUTH — IndexedDB Tier-1 namespace handover (08.047) ══
// Per ADR_MULTI_TENANT_AUTH_v1 §56.1.4: the Tier-1 archive is namespaced per
// user — `andura_anonymous_<deviceId>` pre-auth, `andura_<uid>` post-auth. When
// a user trains anonymously (rotated logs / CDL / patterns land in the anon DB)
// then signs up, `getNamespace()` switches to `andura_<uid>` and the anonymous
// Tier-1 archive becomes ORPHANED — invisible to every engine read. db.js
// comments referenced this module as the handover path, but it was never
// created → silent loss of any archived history older than 30d on signup.
//
// This module merges the anonymous Tier-1 stores into the auth namespace using
// the same never-delete invariant as the Tier-0 / wv2 sync: union by `id`, the
// AUTH (destination) side wins on collision, neither side ever dropped. The
// localStorage Tier-0 keys + wv2-* Zustand stores are NOT namespaced (shared
// localStorage) so they carry over automatically + sync via storeSync.ts +
// initFirebaseSync — only the IndexedDB tier needs this explicit handover.
//
// Idempotent: a per-uid localStorage flag (`anon-migrated-<uid>`) marks
// completion so re-running (StrictMode double-invoke, repeated boots) is a
// no-op. Best-effort + non-fatal — a failure never blocks login or loses the
// anonymous source (source is deleted ONLY after a verified copy).

import Dexie from 'dexie';
import { DB_NAME_PREFIX, STORES, closeDb, logMigrationEvent } from './db.js';

/** localStorage flag prefix marking a completed anon→auth migration per uid. */
export const ANON_MIGRATED_FLAG_PREFIX = 'anon-migrated-';

/** Sanitize a raw namespace segment the same way db.js getNamespace does. */
function _sanitize(raw) {
  return String(raw || 'anonymous').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'anonymous';
}

/** Resolve the anonymous source DB name for this device, or null when there is
 *  no device-id (nothing was ever stored anonymously on this device). */
function _anonDbName() {
  let deviceId = null;
  try {
    if (typeof localStorage !== 'undefined') deviceId = localStorage.getItem('device-id');
  } catch { /* no localStorage — nothing to migrate */ }
  if (!deviceId) return null;
  return `${DB_NAME_PREFIX}_${_sanitize(`anonymous_${deviceId}`)}`;
}

/** Open a Dexie handle on an EXISTING db name with the Tier-1 schema so the
 *  stores are addressable. Returns null when IndexedDB is unavailable. */
function _open(dbName) {
  if (typeof indexedDB === 'undefined') return null;
  const db = new Dexie(dbName);
  // Mirror db.js _defineSchema v1+v2 so store tables resolve on both source +
  // dest. Additive-only (matches the documented duplication contract in db.js).
  db.version(1).stores({
    [STORES.CDL_TIER1]: 'id, ts, date',
    [STORES.LOGS_TIER1]: 'id, ts, ex, session',
    [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
    [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
  });
  db.version(2).stores({
    [STORES.MIGRATION_EVENTS]: '++id, ts, kind, status',
  });
  return db;
}

/** Stores whose entries carry a client-supplied `id` primary key — those merge
 *  by union-on-id. `migration_events` is an auto-increment audit log, NOT
 *  migrated (per-namespace audit trail, no cross-namespace identity). */
const ID_KEYED_STORES = [STORES.CDL_TIER1, STORES.LOGS_TIER1, STORES.APPLIED_PATTERNS_TIER1];

/**
 * Merge anonymous Tier-1 IndexedDB into the authed user's namespace.
 *
 * @param {string} uid Firebase Auth uid (the destination namespace owner)
 * @returns {Promise<{ migrated: boolean, copied: number, reason?: string }>}
 *   `migrated:true` once the handover is complete (or already was — idempotent).
 *   `copied` = total entries merged into dest across stores this run.
 */
export async function migrateAnonymousToAuth(uid) {
  if (!uid || typeof uid !== 'string') {
    return { migrated: false, copied: 0, reason: 'no_uid' };
  }
  const flagKey = `${ANON_MIGRATED_FLAG_PREFIX}${uid}`;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(flagKey)) {
      return { migrated: true, copied: 0, reason: 'already_migrated' };
    }
  } catch { /* no localStorage — proceed best-effort */ }

  const anonName = _anonDbName();
  const destNs = _sanitize(uid);
  const destName = `${DB_NAME_PREFIX}_${destNs}`;

  // No anonymous source (no device-id) or source IS the dest (auth uid happens
  // to look like the anon name) → nothing to do; mark migrated so we don't
  // re-check every boot.
  if (!anonName || anonName === destName) {
    _markMigrated(flagKey);
    return { migrated: true, copied: 0, reason: 'no_anon_source' };
  }

  let source = null;
  let dest = null;
  let copied = 0;
  try {
    source = _open(anonName);
    dest = _open(destName);
    if (!source || !dest) {
      // IndexedDB unavailable — cannot migrate, but do NOT mark migrated so a
      // later boot (real browser) retries.
      return { migrated: false, copied: 0, reason: 'no_indexeddb' };
    }
    await source.open();

    for (const storeName of ID_KEYED_STORES) {
      let srcEntries = [];
      try {
        srcEntries = await source.table(storeName).toArray();
      } catch { srcEntries = []; }
      if (!Array.isArray(srcEntries) || srcEntries.length === 0) continue;

      // Union by id: dest wins on collision (never clobber the authed user's own
      // entry with an anonymous one of the same id), anon-only entries added.
      let destIds = new Set();
      try {
        const destKeys = await dest.table(storeName).toCollection().primaryKeys();
        destIds = new Set(destKeys);
      } catch { destIds = new Set(); }

      const toAdd = srcEntries.filter((e) => e && e.id != null && !destIds.has(e.id));
      if (toAdd.length === 0) continue;
      await dest.transaction('rw', dest.table(storeName), async () => {
        await dest.table(storeName).bulkPut(toAdd);
      });
      copied += toAdd.length;
    }

    // Audit trail in the dest namespace (best-effort — db.js singleton may not
    // be on the dest yet at this point, so log via dest handle directly).
    try {
      await dest.table(STORES.MIGRATION_EVENTS).add({
        ts: Date.now(),
        kind: 'anon_to_auth',
        status: 'success',
        copied,
        source: anonName,
      });
    } catch { /* swallow audit fail */ }

    // Verified copy complete → delete the anonymous source DB so it cannot leak
    // to another user on a shared device + is not double-migrated. Delete ONLY
    // after the merge transactions above resolved (zero-info-loss ordering).
    try {
      source.close();
      source = null;
      await Dexie.delete(anonName);
    } catch { /* non-fatal — orphan anon DB is harmless, flag still set below */ }

    _markMigrated(flagKey);
    return { migrated: true, copied };
  } catch (err) {
    return { migrated: false, copied, reason: err instanceof Error ? err.message : String(err) };
  } finally {
    try { if (source) source.close(); } catch { /* ignore */ }
    try { if (dest) dest.close(); } catch { /* ignore */ }
    // The db.js singleton namespace cache must be reset so the next getDb()
    // re-resolves cleanly to the auth namespace (per db.js closeDb contract).
    try { await closeDb(); } catch { /* ignore */ }
    try { await logMigrationEvent({ kind: 'anon_to_auth_finalized', status: 'done' }); } catch { /* ignore */ }
  }
}

/** @param {string} flagKey */
function _markMigrated(flagKey) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(flagKey, String(Date.now()));
  } catch { /* non-fatal */ }
}
