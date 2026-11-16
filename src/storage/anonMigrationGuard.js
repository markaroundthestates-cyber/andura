// Dexie-free check for the anon→auth IndexedDB merge (2026-11-16 perf pass). reactBoot
// runs the merge on every signed-in boot; importing migrateAnonymousToAuth (Dexie +
// storage/db.js) statically put Dexie (~32 KB gzip) on every cold start, while the merge
// itself almost always returns at its first guards. This answers those guards without
// Dexie so the merge module is imported only when there is something to merge.
// Mirrors migrateAnonymousToAuth's early returns (flag set / no device-id / same name).
import { DB_NAME_PREFIX } from './namespace.js';

/** localStorage flag prefix marking a completed anon→auth migration per uid. */
export const ANON_MIGRATED_FLAG_PREFIX = 'anon-migrated-';

/** Same sanitizer as storage/namespace.js / migrateAnonymousToAuth. */
function sanitize(raw) {
  return String(raw || 'anonymous').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'anonymous';
}

/**
 * True when migrateAnonymousToAuth(uid) could have anonymous rows to merge.
 * @param {string} uid
 * @returns {boolean}
 */
export function anonMigrationPending(uid) {
  if (!uid || typeof uid !== 'string') return false;
  let flag = null;
  let deviceId = null;
  try {
    if (typeof localStorage !== 'undefined') {
      flag = localStorage.getItem(`${ANON_MIGRATED_FLAG_PREFIX}${uid}`);
      deviceId = localStorage.getItem('device-id');
    }
  } catch { return true; /* unknown — let the merge decide */ }
  if (flag || !deviceId) return false;
  return `${DB_NAME_PREFIX}_${sanitize(`anonymous_${deviceId}`)}` !== `${DB_NAME_PREFIX}_${sanitize(uid)}`;
}
