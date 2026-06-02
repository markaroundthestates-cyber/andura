// ══ STORAGE TIER 1 DATABASE — op-sqlite (React Native) — sibling of db.js ════
//
// Metro (iOS/Android) resolves THIS file over `db.js` for the native platform;
// Vite/Vitest + Metro-web keep `db.js` (Dexie/IndexedDB) UNCHANGED. This is the
// SAME narrow public API as db.js, reimplemented over `@op-engineering/op-sqlite`
// — a synchronous, JSI-backed SQLite binding (the RN parallel of Dexie's async
// IndexedDB). All db.js consumers (`tieringEngine`, `migrateAnonymousToAuth`,
// `bootstrap`, `firebase`, `dataReset`, the cont/ screens) import this
// extensionless-equivalent path and stay untouched.
//
// ── Mapping to the Dexie model ───────────────────────────────────────────────
//
// One `.db` file per UID — `andura_<namespace>.db` — mirrors Dexie's one-DB-per-
// UID (`andura_<uid>`). The 4 logical stores become 4 SQLite tables. Each row is
// a JSON document in a `doc` TEXT column keyed by primary key, so arbitrary
// entry shapes round-trip byte-identically (matches Dexie's structured storage):
//
//   cdl_tier1, logs_tier1, applied_patterns_tier1
//       — PRIMARY KEY `id` TEXT (client-supplied, matches Dexie 'id' keyPath).
//   migration_events
//       — `id` INTEGER PRIMARY KEY AUTOINCREMENT (matches Dexie '++id'),
//         + a `status` column (SCHEMA_VERSION 2 additive index parity; existing
//         rows backfilled 'success' in the v1→v2 upgrade, same as db.js).
//
// SCHEMA_VERSION lives in SQLite `PRAGMA user_version`; the v1→v2 upgrade runs
// once per file open when user_version < SCHEMA_VERSION, then stamps it. This is
// the op-sqlite analogue of Dexie's `db.version(N).stores().upgrade()` chain.
//
// NO web globals here (no `localStorage`/`indexedDB`/`Dexie`): Metro loads this
// file, not db.js, into the RN graph. The device-id namespace read goes through
// the shared `kv` adapter (MMKV on native), same key as web ('device-id').

import { open } from '@op-engineering/op-sqlite';
import { getUserConfig } from '../config/user.js';
import { getAuthState } from '../auth.js';
import { kv } from './kv';

// ── Constants (parity with db.js) ────────────────────────────────────────────

/** Schema version — bump on table/column changes, extend `_migrate()`. */
export const SCHEMA_VERSION = 2;

/** DB name prefix — final form: `<PREFIX>_<namespace>.db`. */
export const DB_NAME_PREFIX = 'andura';

/** Stores defined in v1 — keys map directly to SQLite table names. */
export const STORES = Object.freeze({
  CDL_TIER1: 'cdl_tier1',
  LOGS_TIER1: 'logs_tier1',
  APPLIED_PATTERNS_TIER1: 'applied_patterns_tier1',
  MIGRATION_EVENTS: 'migration_events',
});

// ── Module-level singleton (lazy) ────────────────────────────────────────────

/** @type {import('@op-engineering/op-sqlite').DB | null} */
let _db = null;

/** @type {string | null} */
let _namespace = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sanitize namespace key (alphanumeric + underscore only) — identical to db.js. */
function _sanitizeNamespace(raw) {
  return String(raw || 'anonymous').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'anonymous';
}

/**
 * Resolve current user namespace — same resolution order + cache contract as
 * db.js getNamespace (Auth uid → anonymous device-id → legacy userPath). The
 * device-id read goes through `kv` (MMKV) instead of `localStorage`.
 *
 * @returns {string}
 */
export function getNamespace() {
  if (_namespace !== null) return _namespace;
  try {
    const auth = getAuthState();
    if (auth?.uid) {
      _namespace = _sanitizeNamespace(auth.uid);
      return _namespace;
    }
  } catch { /* fall through */ }
  try {
    const deviceId = kv.getItem('device-id');
    if (deviceId) {
      _namespace = _sanitizeNamespace(`anonymous_${deviceId}`);
      return _namespace;
    }
  } catch { /* fall through */ }
  let raw;
  try {
    raw = getUserConfig()?.firebase?.userPath ?? 'anonymous';
  } catch {
    raw = 'anonymous';
  }
  _namespace = _sanitizeNamespace(raw);
  return _namespace;
}

/** Force-reset the cached namespace (testing only) — parity with db.js. */
export function _resetNamespaceCache() {
  _namespace = null;
}

/** SQLite filename for a sanitized namespace — `andura_<ns>.db`. */
function _dbFileName(ns) {
  return `${DB_NAME_PREFIX}_${ns}.db`;
}

/**
 * Create tables if absent + run the user_version migration chain. Mirrors db.js
 * `_defineSchema` (v1 schema + v2 additive `status` on migration_events with an
 * idempotent backfill of existing rows to 'success').
 *
 * @param {import('@op-engineering/op-sqlite').DB} db
 */
function _migrate(db) {
  // v1 — base tables. The 3 data stores key on a client-supplied TEXT id; the
  // events store auto-increments (Dexie '++id'). `doc` holds the full JSON entry
  // so arbitrary shapes round-trip identical to Dexie structured storage.
  db.execute(`CREATE TABLE IF NOT EXISTS ${STORES.CDL_TIER1} (id TEXT PRIMARY KEY, doc TEXT NOT NULL)`);
  db.execute(`CREATE TABLE IF NOT EXISTS ${STORES.LOGS_TIER1} (id TEXT PRIMARY KEY, doc TEXT NOT NULL)`);
  db.execute(`CREATE TABLE IF NOT EXISTS ${STORES.APPLIED_PATTERNS_TIER1} (id TEXT PRIMARY KEY, doc TEXT NOT NULL)`);
  db.execute(`CREATE TABLE IF NOT EXISTS ${STORES.MIGRATION_EVENTS} (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, doc TEXT NOT NULL)`);

  const { rows } = db.execute('PRAGMA user_version');
  const current = Number(rows?.[0]?.user_version ?? 0);

  // v1→v2 — additive `status` parity. Tables created above already include the
  // column for fresh installs; for a pre-v2 file that predates it, ALTER + the
  // idempotent 'success' backfill matches the Dexie upgrade hook.
  if (current < 2) {
    const cols = db.execute(`PRAGMA table_info(${STORES.MIGRATION_EVENTS})`);
    const hasStatus = (cols.rows ?? []).some((c) => c?.name === 'status');
    if (!hasStatus) {
      db.execute(`ALTER TABLE ${STORES.MIGRATION_EVENTS} ADD COLUMN status TEXT`);
    }
    db.execute(`UPDATE ${STORES.MIGRATION_EVENTS} SET status = 'success' WHERE status IS NULL`);
  }

  if (current !== SCHEMA_VERSION) {
    db.execute(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
}

// ── Public API (parity with db.js) ───────────────────────────────────────────

/**
 * Singleton op-sqlite database for the current user namespace. Lazy-initialized,
 * one open handle per process — mirrors db.js getDb.
 *
 * @returns {import('@op-engineering/op-sqlite').DB}
 */
export function getDb() {
  if (_db) return _db;
  const ns = getNamespace();
  _db = open({ name: _dbFileName(ns) });
  _migrate(_db);
  return _db;
}

/**
 * Close + reset the singleton — used by tests + on Auth migration (namespace
 * change anonymous → uid). Parity with db.js closeDb.
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
 * Append a single entry with read-back verification (defensive against silent
 * write failure). Parity with db.js tier1Add.
 *
 * @param {string} storeName
 * @param {{ id: string|number, [k: string]: unknown }} entry
 * @returns {Promise<void>}
 */
export async function tier1Add(storeName, entry) {
  const db = getDb();
  const id = String(entry.id);
  db.execute(
    `INSERT OR REPLACE INTO ${storeName} (id, doc) VALUES (?, ?)`,
    [id, JSON.stringify(entry)],
  );
  const verify = db.execute(`SELECT id FROM ${storeName} WHERE id = ?`, [id]);
  if (!verify.rows || verify.rows.length === 0) {
    throw new Error(`tier1Add verify failed: ${storeName}/${entry.id}`);
  }
}

/**
 * Bulk write entries in a single transaction (faster than per-entry for
 * migration runs). Parity with db.js tier1Bulk.
 *
 * @param {string} storeName
 * @param {Array<object>} entries
 * @returns {Promise<{ written: number }>}
 */
export async function tier1Bulk(storeName, entries) {
  if (!Array.isArray(entries) || entries.length === 0) return { written: 0 };
  const db = getDb();
  db.execute('BEGIN TRANSACTION');
  try {
    for (const entry of entries) {
      db.execute(
        `INSERT OR REPLACE INTO ${storeName} (id, doc) VALUES (?, ?)`,
        [String(entry.id), JSON.stringify(entry)],
      );
    }
    db.execute('COMMIT');
  } catch (err) {
    try { db.execute('ROLLBACK'); } catch { /* swallow */ }
    throw err;
  }
  return { written: entries.length };
}

/**
 * Read all entries from a store. Parity with db.js tier1All.
 *
 * @param {string} storeName
 * @returns {Promise<Array<object>>}
 */
export async function tier1All(storeName) {
  const db = getDb();
  const { rows } = db.execute(`SELECT doc FROM ${storeName}`);
  return (rows ?? []).map((r) => JSON.parse(r.doc));
}

/**
 * Delete entries by primary key. Parity with db.js tier1Delete.
 *
 * @param {string} storeName
 * @param {Array<string|number>} ids
 * @returns {Promise<{ deleted: number }>}
 */
export async function tier1Delete(storeName, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return { deleted: 0 };
  const db = getDb();
  db.execute('BEGIN TRANSACTION');
  try {
    for (const id of ids) {
      db.execute(`DELETE FROM ${storeName} WHERE id = ?`, [String(id)]);
    }
    db.execute('COMMIT');
  } catch (err) {
    try { db.execute('ROLLBACK'); } catch { /* swallow */ }
    throw err;
  }
  return { deleted: ids.length };
}

/**
 * Append an audit event to `migration_events`. The auto-increment id is the
 * primary key; `status` is promoted to its own column (v2) and also kept inside
 * the `doc` JSON for shape parity with the Dexie record. Parity with db.js.
 *
 * @param {{ kind: string, status?: string, [k: string]: unknown }} event
 * @returns {Promise<number>} auto-generated id
 */
export async function logMigrationEvent(event) {
  const db = getDb();
  const ts = Date.now();
  const record = { ts, ...event };
  const status = typeof record.status === 'string' ? record.status : null;
  const res = db.execute(
    `INSERT INTO ${STORES.MIGRATION_EVENTS} (status, doc) VALUES (?, ?)`,
    [status, JSON.stringify(record)],
  );
  return Number(res.insertId);
}

/**
 * Delete the entire SQLite file for a uid (per §56.12 opt-in wipe). Also sweeps
 * any anonymous residue on the device (GDPR Art. 17, §S-18 parity). The auth-DB
 * delete result is what the return value reflects (back-compat); anonymous
 * cleanup is best-effort + non-fatal. Parity with db.js wipeUserDB.
 *
 * @param {string} uid    Firebase Auth uid
 * @returns {Promise<{ deleted: boolean, dbName: string }>}
 */
export async function wipeUserDB(uid) {
  if (!uid || typeof uid !== 'string') {
    return { deleted: false, dbName: '' };
  }
  const sanitizedUid = _sanitizeNamespace(uid);
  const dbName = `${DB_NAME_PREFIX}_${sanitizedUid}`;
  try {
    await closeDb();
    _dropDbFile(_dbFileName(sanitizedUid));
    await wipeAnonymousDBs();
    return { deleted: true, dbName };
  } catch {
    return { deleted: false, dbName };
  }
}

/**
 * Best-effort wipe of any residual anonymous DB file for THIS device. Unlike the
 * web (`indexedDB.databases()` enumerates every anon DB), op-sqlite has no cross-
 * file enumeration API, so this drops the single anonymous file derived from the
 * current device-id — the only anon file a device can have. Parity-of-intent
 * with db.js wipeAnonymousDBs (GDPR Art. 17 residue clearance).
 *
 * @returns {Promise<{ deleted: string[] }>}
 */
export async function wipeAnonymousDBs() {
  /** @type {string[]} */
  const deleted = [];
  let deviceId = null;
  try { deviceId = kv.getItem('device-id'); } catch { /* none */ }
  if (!deviceId) return { deleted };
  const ns = _sanitizeNamespace(`anonymous_${deviceId}`);
  const name = `${DB_NAME_PREFIX}_${ns}`;
  try {
    _dropDbFile(_dbFileName(ns));
    deleted.push(name);
  } catch { /* non-fatal */ }
  return { deleted };
}

/**
 * Drop a SQLite file by name. op-sqlite has no top-level `delete(name)`, so this
 * opens the file, drops every known table + reclaims space (VACUUM), then closes
 * — leaving an empty file with no user data. Closes the live singleton first if
 * it points at the same file.
 *
 * @param {string} fileName
 */
function _dropDbFile(fileName) {
  const db = open({ name: fileName });
  try {
    for (const table of Object.values(STORES)) {
      db.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    db.execute('VACUUM');
    db.execute('PRAGMA user_version = 0');
  } finally {
    try { db.close(); } catch { /* swallow */ }
  }
}

/**
 * Telemetry snapshot — entry counts per store. Returns 0s on read failure.
 * Parity with db.js getStorageStats.
 *
 * @returns {Promise<{ counts: Record<string, number>, namespace: string }>}
 */
export async function getStorageStats() {
  const db = getDb();
  /** @type {Record<string, number>} */
  const counts = {};
  for (const store of Object.values(STORES)) {
    try {
      const { rows } = db.execute(`SELECT COUNT(*) AS n FROM ${store}`);
      counts[store] = Number(rows?.[0]?.n ?? 0);
    } catch {
      counts[store] = 0;
    }
  }
  return { counts, namespace: getNamespace() };
}
