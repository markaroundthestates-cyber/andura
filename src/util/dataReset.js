// ══ DATA RESET — authoritative "Reseteaza toate datele" local wipe ═══════════
// A2 H-1 audit fix (data integrity + user trust). The prior ResetDataConfirm
// only cleared `wv2-*` Zustand stores; ALL engine data is written UNPREFIXED via
// `src/db.js` (logs, pr-records, pain-cdl, coach-decisions, weights, ...), so a
// "full reset" left that data alive — the PR Wall / Istoric / Coach state all
// survived while the copy promised "Toate ... vor fi sterse ... nu poate fi
// anulata". This module makes the reset honest: it wipes EVERY user-data key
// (prefixed + unprefixed) + the IndexedDB Tier 1 stores, while preserving the
// account session + device identity + UI preference (reset = fresh start, stays
// logged in — distinct from account delete which also clears `firebase-*` tokens
// and signs the user out).

import {
  USER_DATA_KEYS,
  TEST_RESIDUE_KEYS,
  CDL_KEYS,
  DYNAMIC_KEY_PREFIXES,
  PRESERVE_ON_RESET_KEYS,
} from './dataRegistry.js';

/**
 * Unprefixed legacy data keys NOT covered by the dataRegistry arrays but written
 * via engine wrappers / src/db.js. `pain-cdl` (PainButton Recovery Engine log).
 */
const EXTRA_DATA_KEYS = Object.freeze(['pain-cdl']);

/**
 * Keys that MUST survive a reset (account session + device identity + UI prefs).
 * Reset keeps the user logged in, so the `firebase-*` auth token set is preserved
 * via the explicit prefix allow-list below (NU enumerated here key-by-key).
 */
const PRESERVE_PREFIXES = Object.freeze(['firebase-']);

/** Single source of truth for the unprefixed user-data keys cleared on reset. */
export const RESET_LEGACY_KEYS = Object.freeze([
  ...USER_DATA_KEYS,
  ...TEST_RESIDUE_KEYS,
  ...CDL_KEYS,
  ...EXTRA_DATA_KEYS,
]);

/**
 * Clear every user-data localStorage key: all `wv2-*` Zustand stores + the
 * canonical unprefixed engine keys + runtime dynamic-prefix keys. Preserves the
 * account session (`firebase-*`), device identity + UI prefs
 * (`PRESERVE_ON_RESET_KEYS`). Returns the count removed for observability/tests.
 *
 * @returns {number} keys removed
 */
export function clearUserDataKeys() {
  const preserve = new Set(PRESERVE_ON_RESET_KEYS);
  const toRemove = new Set();

  // 1. Scan: wv2-* stores + dynamic-prefix keys + runtime engine keys.
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (preserve.has(key)) continue;
    if (PRESERVE_PREFIXES.some((p) => key.startsWith(p))) continue;
    if (key.startsWith('wv2-')) { toRemove.add(key); continue; }
    if (DYNAMIC_KEY_PREFIXES.some((p) => key.startsWith(p))) { toRemove.add(key); continue; }
  }

  // 2. Canonical unprefixed user-data keys (present or not — set dedupes).
  for (const key of RESET_LEGACY_KEYS) {
    if (preserve.has(key)) continue;
    if (localStorage.getItem(key) !== null) toRemove.add(key);
  }

  for (const key of toRemove) localStorage.removeItem(key);
  return toRemove.size;
}

/**
 * Wipe the user's IndexedDB Tier 1 stores (archived logs / CDL / patterns) so the
 * reset is complete across tiers. Best-effort + non-fatal: a wipe failure must
 * never block the local-key reset that already succeeded. Resolves the current
 * namespace DB (`andura_<uid>` post-auth, `andura_anonymous_<deviceId>` else) and
 * deletes it, then re-opens fresh on next access via the db.js singleton.
 *
 * @returns {Promise<void>}
 */
export async function clearUserIndexedDB() {
  try {
    const dbModule = await import('../storage/db.js');
    const ns = dbModule.getNamespace();
    await dbModule.closeDb();
    const Dexie = (await import('dexie')).default;
    await Dexie.delete(`${dbModule.DB_NAME_PREFIX}_${ns}`);
  } catch {
    // IndexedDB unavailable / delete blocked — non-fatal; local keys still wiped.
  }
}

/**
 * Clear the user's Tier 2 (Firebase RTDB) synced data for the SYNC_KEYS the local
 * reset just wiped. Without this, a logged-in reset leaves the cloud copy intact
 * and `syncFromFirebase` MERGES it back into local on the next boot — old
 * logs/pr-records/weights resurrect, so "nu poate fi anulata" would be a lie for
 * synced users too. Per-key RTDB DELETE via `clearFirebaseKeys` (vs a whole-tree
 * DELETE) intentionally preserves any non-data subtree. Anonymous users have no
 * `userPath` → `clearFirebaseKeys` no-ops cleanly. Best-effort + non-fatal: a
 * network failure must never block the local reset that already succeeded.
 *
 * @returns {Promise<void>}
 */
export async function clearUserCloudData() {
  try {
    const fb = await import('../firebase.js');
    await fb.clearFirebaseKeys(fb.SYNC_KEYS);
  } catch {
    // Firebase module / network unavailable — non-fatal; local reset still stands.
  }
}
