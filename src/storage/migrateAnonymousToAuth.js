// ══ ANONYMOUS → AUTH IndexedDB MIGRATION ═══════════════════════════════════
// Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 §56.1.4 LOCKED V1
// + §56.7 Anonymous→Auth Merge Fork Decision UI (this helper handles the
// "merge anonymous data" branch — alternative branch is "discard + start
// fresh" handled by Settings UI flow, not this module).
//
// Pattern (atomic in-spirit, idempotent):
//   1. Open source `andura_anonymous_<deviceId>` DB
//   2. Bulk read all stores
//   3. Open target `andura_<uid>` DB (creates if absent)
//   4. Bulk write all source records (deduped by primary key)
//   5. Verify counts match per store (target ≥ source after merge)
//   6. Append `migration_events` audit entry to target
//   7. Close source + target
//   8. Delete source DB
//
// Idempotency: re-run safe. Step 4 uses `bulkPut` (upsert) so duplicate
// records overwrite identically. Step 8 short-circuits if source absent.
//
// Failure rollback: if step 5 verification fails, target DB preserves
// merged state but source DB NU deleted — Daniel manual recovery via
// Settings UI export. Migration event logged with status='partial'.

import Dexie from 'dexie';
import { STORES, DB_NAME_PREFIX, closeDb, _resetNamespaceCache } from './db.js';

/**
 * @typedef {{
 *   stores_migrated: Record<string, number>,
 *   total_records: number,
 *   source_db: string,
 *   target_db: string,
 *   status: 'success' | 'partial' | 'noop',
 *   started_at: string,
 *   completed_at: string,
 * }} MigrationResult
 */

/**
 * Open a Dexie instance with the same schema as production db.js.
 * Duplicated here on purpose pentru migration runner independence —
 * any future schema bump must update both places.
 *
 * @param {string} dbName
 * @returns {Dexie}
 */
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

/**
 * Check whether a Dexie database exists (without opening cu schema mismatch).
 * @param {string} dbName
 * @returns {Promise<boolean>}
 */
async function _dbExists(dbName) {
  // Dexie.exists is the cheapest reliable way (no full open).
  try {
    return await Dexie.exists(dbName);
  } catch {
    return false;
  }
}

/**
 * Migrate all stores from `andura_anonymous_<deviceId>` to `andura_<uid>`.
 *
 * Caller MUST have just authenticated and have current `auth.uid`. Caller
 * is also expected to invoke `closeDb()` + `_resetNamespaceCache()` before
 * resuming app activity, so the next `getDb()` opens the post-migration
 * `andura_<uid>` DB cleanly.
 *
 * @param {{ anonymousUuid: string, authUid: string }} params
 * @returns {Promise<MigrationResult>}
 */
export async function migrateAnonymousToAuth({ anonymousUuid, authUid }) {
  if (!anonymousUuid || !authUid) {
    throw new Error('migrateAnonymousToAuth: anonymousUuid + authUid required');
  }
  const startedAt = new Date().toISOString();
  const sourceDb = `${DB_NAME_PREFIX}_anonymous_${anonymousUuid}`;
  const targetDb = `${DB_NAME_PREFIX}_${authUid}`;

  // Step 0 — short-circuit dacă source absent (idempotent re-run after success)
  if (!(await _dbExists(sourceDb))) {
    return {
      stores_migrated: {},
      total_records: 0,
      source_db: sourceDb,
      target_db: targetDb,
      status: 'noop',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    };
  }

  const source = _openWithSchema(sourceDb);
  const target = _openWithSchema(targetDb);
  const stores_migrated = {};
  let total_records = 0;

  try {
    // Step 1-4 — bulk read + bulk write per store
    for (const storeName of [STORES.CDL_TIER1, STORES.LOGS_TIER1, STORES.APPLIED_PATTERNS_TIER1]) {
      const records = await source.table(storeName).toArray();
      if (records.length === 0) {
        stores_migrated[storeName] = 0;
        continue;
      }
      await target.transaction('rw', target.table(storeName), async () => {
        await target.table(storeName).bulkPut(records);
      });
      stores_migrated[storeName] = records.length;
      total_records += records.length;
    }

    // Step 5 — verify counts
    let allOk = true;
    for (const [storeName, expectedCount] of Object.entries(stores_migrated)) {
      const targetCount = await target.table(storeName).count();
      if (targetCount < expectedCount) {
        allOk = false;
        break;
      }
    }

    // Step 6 — audit trail event in target
    await target.table(STORES.MIGRATION_EVENTS).add({
      ts: Date.now(),
      kind: 'anonymous_to_auth_migration',
      source_db: sourceDb,
      target_db: targetDb,
      records: total_records,
      status: allOk ? 'success' : 'partial',
    });

    // Step 7 — close
    source.close();
    target.close();

    // Step 8 — delete source DB only if verification passed
    if (allOk) {
      await Dexie.delete(sourceDb);
    }

    return {
      stores_migrated,
      total_records,
      source_db: sourceDb,
      target_db: targetDb,
      status: allOk ? 'success' : 'partial',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    };
  } catch (err) {
    try { source.close(); } catch { /* swallow */ }
    try { target.close(); } catch { /* swallow */ }
    throw err;
  } finally {
    // Reset module-level singleton cache so next getDb() opens fresh
    await closeDb();
    _resetNamespaceCache();
  }
}
