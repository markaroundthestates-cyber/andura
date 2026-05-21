// ══ AUTH PATH MIGRATION — users/daniel → users/<uid> (one-shot) ══════════
// Spec: ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 + Batch B Task 1.
//
// Trigger: post first successful auth, on app boot. Idempotent.
//   1. If `users/<uid>` already populated → no-op (already migrated).
//   2. If `users/<uid>` empty AND `users/daniel` populated → copy.
//   3. Mark migration done in localStorage so subsequent boots skip.
//
// Daniel pre-launch single-user flow: works directly via REST PUT (no Cloud
// Function needed for single migrate). Multi-tenant bulk migration uses
// the Cloud Function spec'd in MULTI_TENANT_AUTH_MIGRATION_SPEC.md (post-V1).

import { LEGACY_USER_PATH, buildAuthUrl } from '../firebase.js';
import { getAuthState } from '../auth.js';

const MIGRATION_FLAG_KEY = 'auth-migration-2026-05-02-done';

/**
 * Has the migration already been run for the currently-auth'd user?
 *
 * @param {Storage} [storage]
 * @returns {boolean}
 */
export function isMigrated(storage) {
  const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!s) return false;
  try {
    const raw = s.getItem(MIGRATION_FLAG_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const auth = getAuthState();
    return Boolean(auth?.uid && parsed?.uid === auth.uid);
  } catch {
    return false;
  }
}

/**
 * Mark the migration as complete for the current uid.
 *
 * @param {string} uid
 * @param {object} stats
 * @param {Storage} [storage]
 */
export function markMigrated(uid, stats, storage) {
  const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!s) return;
  try {
    s.setItem(MIGRATION_FLAG_KEY, JSON.stringify({
      uid,
      migratedAt: Date.now(),
      stats: stats || {},
    }));
  } catch {}
}

/**
 * Run the path migration once. Returns a status payload describing what
 * happened. Safe to call on every boot — idempotent.
 *
 * @param {{ fetch?: typeof fetch, storage?: Storage }} [opts]
 * @returns {Promise<{ status: 'skipped'|'no-auth'|'no-source'|'already-populated'|'migrated'|'failed', uid?: string, error?: string, sourceKeys?: number, destKeys?: number }>}
 */
export async function runAuthPathMigration(opts = {}) {
  const fetcher = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);
  const storage = /** @type {Storage | undefined} */ (opts.storage || (typeof localStorage !== 'undefined' ? localStorage : undefined));
  if (!fetcher) return { status: 'failed', error: 'no_fetch' };

  const auth = getAuthState();
  if (!auth?.uid) return { status: 'no-auth' };

  if (isMigrated(storage)) return { status: 'skipped', uid: auth.uid };

  const destPath = `users/${auth.uid}`;
  const sourcePath = LEGACY_USER_PATH;

  try {
    // 1. Check destination — if already populated, mark and skip.
    const destUrl = await buildAuthUrl(destPath);
    const destResp = await fetcher(destUrl, { cache: 'no-store' });
    if (destResp.ok) {
      const destData = await destResp.json();
      if (destData && typeof destData === 'object' && Object.keys(destData).length > 0) {
        markMigrated(auth.uid, { reason: 'dest-populated' }, storage);
        return { status: 'already-populated', uid: auth.uid, destKeys: Object.keys(destData).length };
      }
    }

    // 2. Read source legacy path. NOTE: read uses auth token, but legacy
    // path predates per-uid rules so the open-rules period (ADR 007 pre-
    // amendment) allows the read regardless of uid.
    const sourceUrl = await buildAuthUrl(sourcePath);
    const sourceResp = await fetcher(sourceUrl, { cache: 'no-store' });
    if (!sourceResp.ok) {
      return { status: 'failed', uid: auth.uid, error: `source_http_${sourceResp.status}` };
    }
    const sourceData = await sourceResp.json();
    if (!sourceData || typeof sourceData !== 'object' || Object.keys(sourceData).length === 0) {
      // Nothing to migrate. Mark so we don't try again.
      markMigrated(auth.uid, { reason: 'no-source' }, storage);
      return { status: 'no-source', uid: auth.uid };
    }

    // 3. Write destination.
    const writeUrl = await buildAuthUrl(destPath);
    const writeResp = await fetcher(writeUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sourceData),
    });
    if (!writeResp.ok) {
      return { status: 'failed', uid: auth.uid, error: `write_http_${writeResp.status}` };
    }

    // 4. Verify (read back, key-count match — full deep-equal is overkill
    // for the single-user pre-launch case and would double bandwidth).
    const verifyResp = await fetcher(writeUrl, { cache: 'no-store' });
    if (!verifyResp.ok) {
      return { status: 'failed', uid: auth.uid, error: `verify_http_${verifyResp.status}` };
    }
    const verifyData = await verifyResp.json();
    const sourceKeyCount = Object.keys(sourceData).length;
    const verifyKeyCount = verifyData && typeof verifyData === 'object'
      ? Object.keys(verifyData).length
      : 0;
    if (verifyKeyCount < sourceKeyCount) {
      return {
        status: 'failed',
        uid: auth.uid,
        error: `verify_count_mismatch source=${sourceKeyCount} dest=${verifyKeyCount}`,
      };
    }

    markMigrated(auth.uid, { reason: 'migrated', sourceKeyCount }, storage);
    return { status: 'migrated', uid: auth.uid, sourceKeys: sourceKeyCount, destKeys: verifyKeyCount };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 'failed', uid: auth.uid, error: msg || 'unknown' };
  }
}

/**
 * Reset the local migration flag (test helper / Daniel manual recovery).
 *
 * @param {Storage} [storage]
 */
export function resetMigrationFlag(storage) {
  const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!s) return;
  try { s.removeItem(MIGRATION_FLAG_KEY); } catch {}
}
