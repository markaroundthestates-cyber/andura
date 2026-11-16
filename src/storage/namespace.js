// Per-user IndexedDB namespace (§56.1.4 LOCKED V1), split out of storage/db.js
// (2026-11-16 perf pass): the session archive (react/lib/dexieMigration) only needs
// the NAME, and importing db.js for it pulled Dexie (~32 KB gzip) into the startup
// bundle. db.js re-exports getNamespace / _resetNamespaceCache — same module state.
import { getUserConfig } from '../config/user.js';
import { getAuthState } from '../auth.js';

/** DB name prefix — final form: `<PREFIX>_<namespace>` (per §56.1.4 LOCKED V1). */
export const DB_NAME_PREFIX = 'andura';

/** @type {string | null} */
let _namespace = null;

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
