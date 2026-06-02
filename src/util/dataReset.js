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
import { kv } from '../storage/kv';

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
  for (const key of kv.keys()) {
    if (!key) continue;
    if (preserve.has(key)) continue;
    if (PRESERVE_PREFIXES.some((p) => key.startsWith(p))) continue;
    if (key.startsWith('wv2-')) { toRemove.add(key); continue; }
    if (DYNAMIC_KEY_PREFIXES.some((p) => key.startsWith(p))) { toRemove.add(key); continue; }
  }

  // 2. Canonical unprefixed user-data keys (present or not — set dedupes).
  for (const key of RESET_LEGACY_KEYS) {
    if (preserve.has(key)) continue;
    if (kv.getItem(key) !== null) toRemove.add(key);
  }

  for (const key of toRemove) kv.removeItem(key);
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
 * Clear the user's Tier 2 (Firebase RTDB) synced data the local reset just wiped:
 * the flat `SYNC_KEYS` nodes AND the `users/{uid}/wv2/*` store-sync subtree
 * (aerobic + workout/progres/onboarding/nutrition/schedule/settings). Without
 * this, a logged-in reset leaves the cloud copy intact and the next boot MERGES
 * it back into local — old logs/pr-records/weights resurrect via `syncFromFirebase`
 * and the whole wv2 layer resurrects via `hydrateStoresFromCloud`, so "nu poate fi
 * anulata" would be a lie for synced users. The wv2 node list comes from the
 * storeSync `SYNCED_WV2_NODES` SSOT (NOT a hardcoded divergent list — a new
 * synced store flows in automatically). Per-key RTDB DELETE via `clearFirebaseKeys`
 * (vs a whole-tree DELETE) intentionally preserves any non-data subtree (fcmTokens,
 * notificationPrefs). Anonymous users have no `userPath` → `clearFirebaseKeys`
 * no-ops cleanly. RESET path ONLY — logout deliberately keeps cloud data for
 * re-login. Best-effort + non-fatal: a network failure must never block the local
 * reset that already succeeded — but it MUST be REPORTED, not swallowed: if the
 * cloud wipe fails the local copy is gone while the remote survives, so the next
 * boot's syncFromFirebase / hydrateStoresFromCloud RESURRECTS the data, breaking
 * the "nu poate fi anulata" promise. Caller surfaces `{ok:false}` to the user so
 * they can retry, instead of a silent data resurrection.
 *
 * @returns {Promise<{ ok: boolean, error?: unknown }>} ok=true wiped; ok=false failed.
 */
export async function clearUserCloudData() {
  try {
    const fb = await import('../firebase.js');
    const { SYNCED_WV2_NODES } = await import('../react/lib/storeSync');
    const res = await fb.clearFirebaseKeys([...fb.SYNC_KEYS, ...SYNCED_WV2_NODES]);
    // A swallowed per-key DELETE failure (fbRemove returns false on a 500/timeout
    // without throwing) must NOT pass as success — that is the silent cloud
    // resurrection. Report partial failure so the caller surfaces the retry toast.
    if (res && res.succeeded < res.total) {
      return { ok: false, error: `cloud delete incomplete: ${res.succeeded}/${res.total}` };
    }
    return { ok: true };
  } catch (error) {
    // Firebase module / network unavailable — non-fatal (never blocks the local
    // reset) but REPORTED so the caller can warn the user vs silent resurrection.
    return { ok: false, error };
  }
}

// ── H1 shared-device PII leak — logout wipe + account-switch guard ───────────
// EVIDENCE (VERDICT-CONSOLIDATED §Cluster 0 / SWEEP H1): Tier-0 localStorage has
// no per-UID namespacing, and logout cleared only auth tokens — so user B on the
// same device saw user A's logs/weight/body/pain, and the local-always-wins
// Firebase merge could push A's data up to B's cloud. Design intent is
// single-user-device, so the SAFE + lowest-blast-radius fix (vs full per-UID key
// prefixing of every write) is to WIPE the local user-data keys when a session
// ends (logout) AND when a DIFFERENT uid signs in (account switch), so the next
// user starts clean and A's data cannot leak into / contaminate B's cloud.

/**
 * localStorage marker recording which uid the local Tier-0 data currently
 * belongs to. Compared on every post-auth sync to detect an account switch.
 * Preserved across reset (PRESERVE_ON_RESET_KEYS) so the SAME user is not
 * re-wiped on their next login.
 */
export const DATA_OWNER_UID_KEY = 'data-owner-uid';

/**
 * LOGOUT wipe — clears the local user-data keys + IndexedDB Tier 1 so the next
 * person on this shared device starts clean. Mirrors the reset wipe but is
 * cloud-SAFE on purpose: it does NOT touch Firebase, because the user is only
 * signing out (their cloud backup must survive for re-login). The auth tokens
 * themselves are cleared separately by `auth.signOut()`. Also drops the
 * data-owner marker so a fresh login re-establishes ownership cleanly.
 *
 * @returns {Promise<void>}
 */
export async function wipeUserDataOnLogout() {
  clearUserDataKeys();
  try { kv.removeItem(DATA_OWNER_UID_KEY); } catch { /* non-fatal */ }
  await clearUserIndexedDB();
}

/**
 * ACCOUNT-SWITCH guard — call on every post-auth sync, BEFORE the Firebase
 * restore/push (so a different user's stale local data can't be merged up to the
 * new uid's cloud). Compares the authenticated `currentUid` against the persisted
 * data-owner marker:
 *
 *   - no marker yet (first login on this device) → record ownership, no wipe.
 *   - marker === currentUid (same user reload / returning boot) → no-op, keep
 *     the user's own data intact.
 *   - marker !== currentUid (a DIFFERENT account authenticated without a logout
 *     in between, e.g. user B opened a magic link on user A's still-authed
 *     browser) → wipe local user-data + IndexedDB (NOT cloud — A's backup stays),
 *     then record the new owner so B starts clean.
 *
 * Anonymous / skip-auth (no `currentUid`) → no-op (nothing to own).
 *
 * @param {string|null|undefined} currentUid
 * @returns {Promise<boolean>} true if a wipe fired (account switch detected)
 */
export async function enforceDataOwner(currentUid) {
  if (!currentUid) return false; // anonymous / skip-auth — nothing to own
  let prevOwner = null;
  try { prevOwner = kv.getItem(DATA_OWNER_UID_KEY); } catch { /* treat as absent */ }
  if (prevOwner === currentUid) return false; // same user — keep their data
  const isSwitch = prevOwner !== null && prevOwner !== currentUid;
  if (isSwitch) {
    // Different account on this device without a logout — purge the prior user's
    // local data so it cannot leak to B or contaminate B's cloud on the merge.
    clearUserDataKeys();
    await clearUserIndexedDB();
  }
  // Record (or re-record) ownership for the now-authenticated uid.
  try { kv.setItem(DATA_OWNER_UID_KEY, currentUid); } catch { /* non-fatal */ }
  return isSwitch;
}
