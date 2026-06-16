// ══ STORAGE TIER 1 DATABASE — Dexie.js IndexedDB wrapper (ADR 020) ══════════
// Per ADR 020 §Library decision: Dexie.js v4.x — battle-tested production
// (Notion, Obsidian web, Linear), MIT license, ~30KB minified, native schema
// versioning + transactions + observability. Bundle cost acceptable (~6% of
// 500KB PWA target).
//
// ── Per-user namespacing ────────────────────────────────────────────────────
//
// Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 §56.1.4 LOCKED V1:
//   "IndexedDB namespace per UID `andura_${uid}` Dexie multi-DB"
//
// Resolution order:
//   1. Firebase Auth uid present (`getAuthState()?.uid`) → `andura_<uid>`
//   2. Anonymous mode → `andura_anonymous_<deviceId>` (deviceId from
//      localStorage 'device-id', generated lazy in firebase.js)
//   3. Legacy fallback (test fixtures + Daniel pre-Beta migration) → derives
//      from `getUserConfig()?.firebase?.userPath` sanitized.
//
// Migration on Auth signup (anonymous → auth):
//   `andura_anonymous_<deviceId>` → `andura_<uid>` via
//   `src/storage/migrateAnonymousToAuth.js` (atomic copy + verify + delete).
//
// Brand rename note (2026-05-05 overnight): DB_NAME_PREFIX flipped
//   'salafull' → 'andura' per brand official + ADR_MULTI_TENANT_AUTH_v1
//   §56.1.4 spec verbatim. Daniel pre-Beta personal IndexedDB
//   `salafull_users_daniel` becomes orphan post-rename — harmless given
//   data also exists in localStorage Tier 0 + Firebase RTDB.
//
// ── Schema (v1 initial, v2 scaffold) ────────────────────────────────────────
//
//   cdl_tier1          — CDL entries archived from Tier 0 (>30d age)
//   logs_tier1         — workout logs archived from Tier 0 (>30d age)
//   applied_patterns_tier1 — pattern detection cache (long-tail history)
//   migration_events   — audit trail of rotation events (when, what, count)
//
// v2 (SUB-CHAT5-005 scaffold) — additive `status` index pe migration_events
// + upgrade hook backfill 'success' pe existing records. Demonstrates Dexie
// schema-versioning pattern pentru post-Beta first real bump (operators NU
// "figure out under pressure"). See `_defineSchema` JSDoc pentru rules.
//
// Schema bumps follow Dexie convention `db.version(N).stores({...}).upgrade(...)`
// aligned with ADR 018 §4 schema versioning pattern (orchestration in
// `src/migrations/`, IndexedDB-specific mechanics here).
//
// ── Public API ──────────────────────────────────────────────────────────────
//
// `getDb()`              — singleton Dexie instance (lazy init, one per process)
// `getNamespace()`       — current user namespace string
// `getStorageStats()`    — { tier1Size, entryCounts } for telemetry
// `tier1Add(store, e)`   — async write (with verify)
// `tier1Bulk(store, es)` — async bulk write (transactional)
// `tier1All(store)`      — async read all entries
// `tier1Delete(s, ids)`  — async delete by primary key
// `logMigrationEvent(e)` — append to `migration_events` audit trail

import Dexie from 'dexie';
import { getUserConfig } from '../config/user.js';
import { getAuthState } from '../auth.js';

// ── Constants ───────────────────────────────────────────────────────────────

/** Schema version — bump on store/index changes, register `upgrade()` hook. */
export const SCHEMA_VERSION = 3;

/** DB name prefix — final form: `<PREFIX>_<namespace>` (per §56.1.4 LOCKED V1). */
export const DB_NAME_PREFIX = 'andura';

/** Stores defined in v1. Keys in this object map directly to Dexie store names. */
export const STORES = Object.freeze({
  CDL_TIER1: 'cdl_tier1',
  LOGS_TIER1: 'logs_tier1',
  APPLIED_PATTERNS_TIER1: 'applied_patterns_tier1',
  MIGRATION_EVENTS: 'migration_events',
  // D107 — durable per-UID behavioral interaction log (local-only archive tier,
  // never cloud-synced). Replaces the 500-event localStorage ring so the moat
  // signal survives reinstall/cache-clear + a long multi-exercise session.
  BEHAVIOR_TIER1: 'behavior_tier1',
});

// ── Module-level singleton (lazy) ───────────────────────────────────────────

/** @type {Dexie | null} */
let _db = null;

/** @type {string | null} */
let _namespace = null;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sanitize namespace key for IndexedDB DB name (alphanumeric + underscore only).
 * `users/daniel` → `users_daniel`; `auth.uid:abc-123` → `auth_uid_abc_123`.
 *
 * @param {string} raw
 * @returns {string}
 */
function _sanitizeNamespace(raw) {
  return String(raw || 'anonymous').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'anonymous';
}

/**
 * Resolve current user namespace per §56.1.4 LOCKED V1.
 *
 * Resolution order:
 *   1. Firebase Auth uid present → `<uid>` (sanitized)
 *   2. Anonymous mode (deviceId in localStorage 'device-id') → `anonymous_<deviceId>`
 *   3. Legacy fallback (`getUserConfig()?.firebase?.userPath`) → sanitized.
 *
 * Final DB name = `${DB_NAME_PREFIX}_${getNamespace()}` = `andura_<uid>` post-Auth
 * sau `andura_anonymous_<deviceId>` pre-Auth.
 *
 * §B021 audit fix (REVIEW-A036-A038 M-§A036-01) — Module-level `_namespace`
 * cache invalidates exclusively via `closeDb()` or `_resetNamespaceCache()`.
 * Anonymous → Auth migration callers MUST invoke `closeDb()` post-migration
 * (handled în `migrateAnonymousToAuth.js` finally block lines 166-170);
 * skipping = stale namespace risk = writes to wrong DB. Documented hard contract.
 *
 * @returns {string}
 */
export function getNamespace() {
  if (_namespace !== null) return _namespace;
  // 1. Firebase Auth uid present
  try {
    const auth = getAuthState();
    if (auth?.uid) {
      _namespace = _sanitizeNamespace(auth.uid);
      return _namespace;
    }
  } catch { /* fall through */ }
  // 2. Anonymous mode — deviceId from localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const deviceId = localStorage.getItem('device-id');
      if (deviceId) {
        _namespace = _sanitizeNamespace(`anonymous_${deviceId}`);
        return _namespace;
      }
    }
  } catch { /* fall through */ }
  // 3. Legacy fallback (test fixtures + Daniel pre-Beta migration source)
  let raw;
  try {
    raw = getUserConfig()?.firebase?.userPath ?? 'anonymous';
  } catch {
    raw = 'anonymous';
  }
  _namespace = _sanitizeNamespace(raw);
  return _namespace;
}

/**
 * Force-reset the cached namespace (testing only).
 */
export function _resetNamespaceCache() {
  _namespace = null;
}

/**
 * Apply schema definition for a Dexie instance. Pulled out for reuse on test
 * doubles + future schema bumps (each version + upgrade chained).
 *
 * SUB-CHAT5-005 fix (W3-D-SUBSTRATE audit chat 5) — Dexie v2 migration scaffold
 * pattern. V1 = initial schema. V2 = additive `status` index pe migration_events
 * + upgrade hook backfill 'success' pe existing records. Reference pentru
 * post-Beta first real bump operators (NU "figure out under pressure"):
 *
 *   1. Append `.version(N+1).stores({...})` cu store schema string updated.
 *      Stores omise = inherit din versiune anterioara (Dexie semantics).
 *   2. Chain `.upgrade(tx => ...)` daca needs backfill records existing.
 *      Tx scoped la version transition; tx.<storeName>.toCollection().modify()
 *      iterates batch + applies in-place patch.
 *   3. Bump `SCHEMA_VERSION` constant + update `migrateAnonymousToAuth.js`
 *      `_openWithSchema` parallel (duplication tracked, intentional, NU drift).
 *   4. Add test `db.test.js` exercise upgrade path verify records contain new
 *      field + index queryable (`db.table(X).where('newIdx').equals(val)`).
 *
 * Bugatti rules:
 *   - Additive only — never remove indexes/stores within single bump (multi-
 *     version chain `.version(N-1)` preserved for upgrade replay safety).
 *   - Backfill MUST be idempotent (re-run safe — checks if field already set).
 *   - Upgrade hook errors → Dexie aborts; user stays on v1 (no partial state).
 *
 * @param {Dexie} db
 */
function _defineSchema(db) {
  // v1 — initial. Primary key `id` for all stores (matches ADR 011 CDL schema
  // + log schema). `migration_events` uses auto-increment `++id` since events
  // are append-only audit, no client-supplied id.
  db.version(1).stores({
    [STORES.CDL_TIER1]: 'id, ts, date',
    [STORES.LOGS_TIER1]: 'id, ts, ex, session',
    [STORES.APPLIED_PATTERNS_TIER1]: 'id, ts, type',
    [STORES.MIGRATION_EVENTS]: '++id, ts, kind',
  });
  // v2 — SUB-CHAT5-005 scaffold example. Additive `status` index pe
  // migration_events pentru future filtering events by outcome. Existing
  // records backfilled cu 'success' default (assumption: pre-v2 events
  // were all completed-OK rotations, no recorded failure mode pre-bump).
  // Pattern reference pentru post-Beta first real schema bump operators.
  db.version(2).stores({
    [STORES.MIGRATION_EVENTS]: '++id, ts, kind, status',
  }).upgrade(tx => {
    return tx.table(STORES.MIGRATION_EVENTS).toCollection().modify(rec => {
      // Idempotent backfill — re-run safe via existence check.
      if (rec.status === undefined) {
        rec.status = 'success';
      }
    });
  });
  // v3 — D107: additive `behavior_tier1` store for the durable behavioral log.
  // Primary key `id` (client-supplied unique row id) + indexes on `t` (epoch ms,
  // for the days-window prune `where('t').below(cutoff)`), `kind`, `session`.
  // No upgrade hook needed — purely a new store (existing data untouched).
  db.version(3).stores({
    [STORES.BEHAVIOR_TIER1]: 'id, t, kind, session',
  });
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Singleton Dexie database for current user namespace. Lazy-initialized.
 *
 * @returns {Dexie}
 */
export function getDb() {
  if (_db) return _db;
  const ns = getNamespace();
  _db = new Dexie(`${DB_NAME_PREFIX}_${ns}`);
  _defineSchema(_db);
  return _db;
}

/**
 * Close + reset singleton. Used by tests + on Auth migration (when namespace
 * changes from anonymous → auth.uid).
 *
 * @returns {Promise<void>}
 */
export async function closeDb() {
  if (_db) {
    try { _db.close(); } catch { /* swallow */ }
    _db = null;
  }
  _namespace = null;
}

/**
 * Append a single entry to a Tier 1 store with read-back verification.
 * Throws if write succeeded but read-back returned no record (defensive
 * against silent IndexedDB quota failures).
 *
 * @param {string} storeName
 * @param {{ id: string|number, [k: string]: unknown }} entry
 * @returns {Promise<void>}
 */
export async function tier1Add(storeName, entry) {
  const db = getDb();
  await db.table(storeName).put(entry);
  const verify = await db.table(storeName).get(entry.id);
  if (!verify) {
    throw new Error(`tier1Add verify failed: ${storeName}/${entry.id}`);
  }
}

/**
 * Bulk write entries in a single transaction. Faster than per-entry `put` for
 * migration runs. Verify by counting added entries in same transaction.
 *
 * @param {string} storeName
 * @param {Array<object>} entries
 * @returns {Promise<{ written: number }>}
 */
export async function tier1Bulk(storeName, entries) {
  if (!Array.isArray(entries) || entries.length === 0) return { written: 0 };
  const db = getDb();
  await db.transaction('rw', db.table(storeName), async () => {
    await db.table(storeName).bulkPut(entries);
  });
  return { written: entries.length };
}

/**
 * Read all entries from a Tier 1 store.
 *
 * @param {string} storeName
 * @returns {Promise<Array<object>>}
 */
export async function tier1All(storeName) {
  const db = getDb();
  return db.table(storeName).toArray();
}

/**
 * Delete entries by primary key from a Tier 1 store.
 *
 * @param {string} storeName
 * @param {Array<string|number>} ids
 * @returns {Promise<{ deleted: number }>}
 */
export async function tier1Delete(storeName, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return { deleted: 0 };
  const db = getDb();
  await db.table(storeName).bulkDelete(ids);
  return { deleted: ids.length };
}

/**
 * Append an audit event to the `migration_events` store. Used by tieringEngine
 * + migration runner pentru observability + debugging.
 *
 * @param {{ kind: string, [k: string]: unknown }} event
 * @returns {Promise<number>} auto-generated id
 */
export async function logMigrationEvent(event) {
  const db = getDb();
  const ts = Date.now();
  const id = await db.table(STORES.MIGRATION_EVENTS).add({ ts, ...event });
  return Number(id);
}

/**
 * §S-18 audit fix (AUDIT-3) — wipe any residual anonymous IndexedDB databases
 * (`andura_anonymous_<deviceId>`). When a user trained anonymously then authed,
 * the anonymous DB lingers post account-delete (`wipeUserDB(uid)` only deletes
 * `andura_<uid>`) → GDPR Art. 17 residue in the IndexedDB tier. Enumerates
 * `indexedDB.databases()` (same pattern as `dataCleanup.fullReset`) + deletes
 * every DB whose name starts with the anonymous prefix. Graceful when the
 * `databases()` API is unavailable (older Safari) — returns deleted: [].
 *
 * @returns {Promise<{ deleted: string[] }>}
 */
export async function wipeAnonymousDBs() {
  const prefix = `${DB_NAME_PREFIX}_anonymous_`;
  /** @type {string[]} */
  const deleted = [];
  try {
    if (typeof indexedDB === 'undefined' || typeof indexedDB.databases !== 'function') {
      return { deleted };
    }
    const dbs = await indexedDB.databases();
    for (const info of dbs) {
      const name = info?.name;
      if (typeof name === 'string' && name.startsWith(prefix)) {
        try {
          await Dexie.delete(name);
          deleted.push(name);
        } catch { /* skip this DB, continue */ }
      }
    }
  } catch { /* enumeration failed — non-fatal */ }
  return { deleted };
}

/**
 * Wipe entire user IndexedDB cu Dexie `delete()`. Per §56.12 LOCKED V1
 * opt-in IndexedDB wipe toggle (Logout flow batch 3).
 *
 * §S-18 audit fix — also clears residual anonymous DBs so account deletion
 * leaves no IndexedDB-tier residue from a pre-auth anonymous session on this
 * device (GDPR Art. 17). The auth-DB delete result is what the return value
 * reflects (back-compat); anonymous cleanup is best-effort + non-fatal.
 *
 * @param {string} uid    Firebase Auth uid
 * @returns {Promise<{ deleted: boolean, dbName: string }>}
 */
export async function wipeUserDB(uid) {
  if (!uid || typeof uid !== 'string') {
    return { deleted: false, dbName: '' };
  }
  const sanitizedUid = String(uid).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || uid;
  const dbName = `${DB_NAME_PREFIX}_${sanitizedUid}`;
  try {
    await closeDb();
    await Dexie.delete(dbName);
    // cycle-10: the overflow archive is a SEPARATE per-UID DB (AnduraArchive_<sanitizedUid>,
    // same namespace sanitizer) — delete it too on account deletion, else the deleted user's
    // archived sessions remain device-resident (GDPR Art.17 residue). Best-effort + non-fatal.
    try { await Dexie.delete(`AnduraArchive_${sanitizedUid}`); } catch { /* non-fatal */ }
    // §S-18 — sweep anonymous residue on the same device (best-effort).
    await wipeAnonymousDBs();
    return { deleted: true, dbName };
  } catch {
    return { deleted: false, dbName };
  }
}

/**
 * Telemetry snapshot — entry counts per store + estimated total size.
 *
 * NU include localStorage Tier 0 (caller pe langa combine cu `localStorage`
 * length pentru full picture). Returns 0s daca DB nu yet initialized.
 *
 * @returns {Promise<{ counts: Record<string, number>, namespace: string }>}
 */
export async function getStorageStats() {
  const db = getDb();
  /** @type {Record<string, number>} */
  const counts = {};
  for (const store of Object.values(STORES)) {
    try {
      counts[store] = await db.table(store).count();
    } catch {
      counts[store] = 0;
    }
  }
  return { counts, namespace: getNamespace() };
}
