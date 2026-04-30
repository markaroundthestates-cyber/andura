// ══ STORAGE TIER 1 DATABASE — Dexie.js IndexedDB wrapper (ADR 020) ══════════
// Per ADR 020 §Library decision: Dexie.js v4.x — battle-tested production
// (Notion, Obsidian web, Linear), MIT license, ~30KB minified, native schema
// versioning + transactions + observability. Bundle cost acceptable (~6% of
// 500KB PWA target).
//
// ── Per-user namespacing ────────────────────────────────────────────────────
//
// Pre-Auth (current): namespace via `firebase.userPath` from `getUserConfig()`
//   sanitized to URL-safe form. e.g., `users/daniel` → `salafull_users_daniel`.
//
// Post-Auth (future, ADR_MULTI_TENANT_AUTH_v1): replace with `auth.uid`.
//   Migration on Auth signup: copy `salafull_anonymous_<uuid>` → `salafull_<uid>`,
//   then delete anonymous DB. Out of scope for ADR 020 (cross-ref only).
//
// ── Schema (v1, initial) ────────────────────────────────────────────────────
//
//   cdl_tier1          — CDL entries archived from Tier 0 (>30d age)
//   logs_tier1         — workout logs archived from Tier 0 (>30d age)
//   applied_patterns_tier1 — pattern detection cache (long-tail history)
//   migration_events   — audit trail of rotation events (when, what, count)
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

// ── Constants ───────────────────────────────────────────────────────────────

/** Schema version — bump on store/index changes, register `upgrade()` hook. */
export const SCHEMA_VERSION = 1;

/** DB name prefix — final form: `<PREFIX>_<namespace>` */
const DB_NAME_PREFIX = 'salafull';

/** Stores defined în v1. Keys in this object map directly to Dexie store names. */
export const STORES = Object.freeze({
  CDL_TIER1: 'cdl_tier1',
  LOGS_TIER1: 'logs_tier1',
  APPLIED_PATTERNS_TIER1: 'applied_patterns_tier1',
  MIGRATION_EVENTS: 'migration_events',
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
 * Resolve current user namespace.
 *
 * Pre-Auth (current): derived from `firebase.userPath` în user config.
 * Post-Auth (ADR_MULTI_TENANT_AUTH_v1): TODO replace cu auth.uid lookup.
 *
 * @returns {string}
 */
export function getNamespace() {
  if (_namespace !== null) return _namespace;
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
 * Bulk write entries în a single transaction. Faster than per-entry `put` for
 * migration runs. Verify by counting added entries în same transaction.
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
  return db.table(STORES.MIGRATION_EVENTS).add({ ts, ...event });
}

/**
 * Telemetry snapshot — entry counts per store + estimated total size.
 *
 * NU include localStorage Tier 0 (caller pe lângă combine cu `localStorage`
 * length pentru full picture). Returns 0s dacă DB nu yet initialized.
 *
 * @returns {Promise<{ counts: Record<string, number>, namespace: string }>}
 */
export async function getStorageStats() {
  const db = getDb();
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
