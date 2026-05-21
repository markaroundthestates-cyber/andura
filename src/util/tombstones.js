// ══ TOMBSTONES — localStorage soft-delete (Memory Paradox hotfix) ════════
// Per Batch A Finding B: full T&B Faza 1+2 = dedicated 10-15h batch.
// This module is the minimal hotfix patching the user-visible bug:
//   delete entry → reload → entry RE-APARE through Firebase pull.
//
// Mechanism:
//   - On delete: write a tombstone keyed by entry id with `deletedAt` ts.
//   - On every Firebase pull: re-apply tombstones to filter out resurrected
//     entries before the engine sees them.
//
// Schema (localStorage `tombstones`):
//   {
//     "<entryId>": {
//       "deletedAt": 1714600000000,    // unix ms
//       "key": "logs",                  // top-level localStorage key (ex: 'logs')
//       "source": "local"               // 'local' | 'firebase'
//     },
//     ...
//   }
//
// Retention: 90 days. Entries older than that are eligible for cleanup
// (NOT auto-cleaned in hotfix — defer to dedicated GC pass per §35).
//
// Cross-refs: ADR 011 (CDL architecture), TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC
// (full T&B), Batch A Finding B, ADR 020 (storage tiering).

const TOMBSTONES_KEY = 'tombstones';
export const TOMBSTONE_RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

// Top-level localStorage keys whose entries are array-shaped and indexed
// by `ts` (timestamp ms). These are the consumers wired through the
// tombstone filter on Firebase sync. Logs/CDL/sessions all share the
// `ts`-indexed array convention.
const TS_INDEXED_KEYS = Object.freeze(['logs', 'coach-decisions', 'pr-records']);

/**
 * Read the entire tombstone map from localStorage. Returns `{}` on missing
 * or malformed data (defensive — the hotfix must never throw).
 *
 * @param {Storage} [storage]
 * @returns {Object<string, {deletedAt: number, key?: string, source?: string}>}
 */
export function getTombstones(storage) {
  const s = _resolve(storage);
  if (!s) return {};
  try {
    const raw = s.getItem(TOMBSTONES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persist a tombstone for `entryId`. `key` is the top-level localStorage key
 * (e.g. 'logs') so the filter knows where to look.
 *
 * @param {string|number} entryId
 * @param {string} key
 * @param {{ source?: 'local'|'firebase', storage?: Storage, now?: number }} [opts]
 */
export function markTombstone(entryId, key, opts = {}) {
  const s = _resolve(opts.storage);
  if (!s) return;
  if (entryId == null || entryId === '') return;
  const id = String(entryId);
  const map = getTombstones(s);
  map[id] = {
    deletedAt: typeof opts.now === 'number' ? opts.now : Date.now(),
    key: key || '',
    source: opts.source || 'local',
  };
  try { s.setItem(TOMBSTONES_KEY, JSON.stringify(map)); } catch {}
}

/**
 * Remove a tombstone (e.g. when the user explicitly recreates the entry).
 *
 * @param {string|number} entryId
 * @param {Storage} [storage]
 */
export function removeTombstone(entryId, storage) {
  const s = _resolve(storage);
  if (!s) return;
  if (entryId == null) return;
  const map = getTombstones(s);
  if (!(String(entryId) in map)) return;
  delete map[String(entryId)];
  try { s.setItem(TOMBSTONES_KEY, JSON.stringify(map)); } catch {}
}

/**
 * Returns true if `entryId` has a live (non-expired) tombstone.
 *
 * @param {string|number} entryId
 * @param {Storage} [storage]
 * @param {number} [now]
 * @returns {boolean}
 */
export function isTombstoned(entryId, storage, now) {
  if (entryId == null) return false;
  const map = getTombstones(storage);
  const entry = map[String(entryId)];
  if (!entry) return false;
  const t = typeof now === 'number' ? now : Date.now();
  return (t - entry.deletedAt) <= TOMBSTONE_RETENTION_MS;
}

/**
 * Filter a `ts`-indexed array, returning a new array with tombstoned
 * entries removed. Treats `entry.ts` (preferred) or `entry.id` as the
 * tombstone key.
 *
 * @param {Array<{ ts?: number|string, id?: number|string, [k: string]: unknown }>} entries
 * @param {Storage} [storage]
 * @returns {Array<{ ts?: number|string, id?: number|string, [k: string]: unknown }>}
 */
export function applyTombstoneFilter(entries, storage) {
  if (!Array.isArray(entries) || entries.length === 0) return entries || [];
  const map = getTombstones(storage);
  if (Object.keys(map).length === 0) return entries;
  const now = Date.now();
  return entries.filter(e => {
    if (!e || typeof e !== 'object') return true;
    const id = e.ts != null ? String(e.ts) : (e.id != null ? String(e.id) : null);
    if (!id) return true;
    const ts = map[id];
    if (!ts) return true;
    // Expired tombstone → entry survives (caller may re-populate from remote).
    return (now - ts.deletedAt) > TOMBSTONE_RETENTION_MS;
  });
}

/**
 * Walk every known ts-indexed top-level key and rewrite it through the
 * tombstone filter. Idempotent. Used by `syncFromFirebase` after merge
 * so resurrected entries are scrubbed before any consumer reads them.
 *
 * @param {Storage} [storage]
 * @returns {{ filtered: number, keysTouched: string[] }}
 */
export function applyTombstoneFilterToAll(storage) {
  const s = _resolve(storage);
  if (!s) return { filtered: 0, keysTouched: [] };
  const map = getTombstones(s);
  if (Object.keys(map).length === 0) return { filtered: 0, keysTouched: [] };

  let filteredTotal = 0;
  /** @type {string[]} */
  const keysTouched = [];
  TS_INDEXED_KEYS.forEach(key => {
    let arr;
    try {
      const raw = s.getItem(key);
      if (!raw) return;
      arr = JSON.parse(raw);
    } catch { return; }
    if (!Array.isArray(arr)) return;
    const before = arr.length;
    const filtered = applyTombstoneFilter(arr, s);
    if (filtered.length !== before) {
      try {
        s.setItem(key, JSON.stringify(filtered));
        filteredTotal += (before - filtered.length);
        keysTouched.push(key);
      } catch {}
    }
  });
  return { filtered: filteredTotal, keysTouched };
}

/**
 * Soft-delete wrapper. Removes an entry from the named localStorage array
 * and writes a tombstone so the entry stays gone after Firebase pull.
 * Returns true on successful delete.
 *
 * @param {string|number} entryId - matched against `entry.ts` (preferred) or `entry.id`
 * @param {string} key - top-level localStorage key (e.g. 'logs')
 * @param {{ storage?: Storage, source?: 'local'|'firebase' }} [opts]
 * @returns {boolean}
 */
export function deleteEntry(entryId, key, opts = {}) {
  const s = _resolve(opts.storage);
  if (!s) return false;
  if (entryId == null || !key) return false;

  let arr;
  try {
    const raw = s.getItem(key);
    if (!raw) {
      // Nothing to delete locally, but still mark the tombstone — Firebase
      // pull may resurrect the entry, and we want to filter it.
      markTombstone(entryId, key, opts);
      return true;
    }
    arr = JSON.parse(raw);
  } catch {
    markTombstone(entryId, key, opts);
    return true;
  }
  if (!Array.isArray(arr)) {
    markTombstone(entryId, key, opts);
    return true;
  }

  const target = String(entryId);
  const before = arr.length;
  const next = arr.filter(e => {
    const id = e?.ts != null ? String(e.ts) : (e?.id != null ? String(e.id) : null);
    return id !== target;
  });
  try { s.setItem(key, JSON.stringify(next)); } catch {}
  markTombstone(entryId, key, opts);
  return next.length < before;
}

/**
 * GC helper — drops tombstones older than the retention window. Returns
 * the number of entries removed. Daniel can call this manually from the
 * console (`window.gcTombstones()`); not auto-run in hotfix scope.
 *
 * @param {Storage} [storage]
 * @param {number} [now]
 * @returns {number}
 */
export function gcTombstones(storage, now) {
  const s = _resolve(storage);
  if (!s) return 0;
  const map = getTombstones(s);
  const t = typeof now === 'number' ? now : Date.now();
  let removed = 0;
  for (const id of Object.keys(map)) {
    const entry = map[id];
    if (!entry || typeof entry.deletedAt !== 'number') {
      delete map[id];
      removed++;
      continue;
    }
    if ((t - entry.deletedAt) > TOMBSTONE_RETENTION_MS) {
      delete map[id];
      removed++;
    }
  }
  if (removed > 0) {
    try { s.setItem(TOMBSTONES_KEY, JSON.stringify(map)); } catch {}
  }
  return removed;
}

/**
 * @param {Storage} [override]
 * @returns {Storage | null}
 */
function _resolve(override) {
  if (override) return override;
  try { return typeof localStorage !== 'undefined' ? localStorage : null; }
  catch { return null; }
}

if (typeof window !== 'undefined') {
  window.gcTombstones = gcTombstones;
}
