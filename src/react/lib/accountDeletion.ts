// ══ ACCOUNT DELETION — 30-day grace marker helpers (§56.5.2 LOCKED V1) ══════
// Soft-delete model. "Sterge contul" no longer wipes the cloud immediately;
// instead it writes a marker `users/{uid}/account/deletionRequestedAt` (epoch
// ms) via the auth-aware RTDB PATCH helper, then wipes LOCAL + signs out. The
// cloud copy is retained for a 30-day restore window. A scheduled Cloud
// Function (functions/deletionGrace.js) hard-purges any user whose marker is
// >= 30 days old.
//
// On the next sign-in, runPostAuthSync (reactBoot.ts) reads the marker BEFORE
// any cloud restore:
//   - marker absent              → normal sign-in (no-op here).
//   - marker present, < 30 days  → present the user a RESTORE choice
//     (Restore account = clear marker + resume; Delete now = immediate purge).
//   - marker present, >= 30 days → treat as already deleted (the function may
//     not have run yet); the restore UI surfaces "Delete now" only.
//
// This module owns ONLY the marker read/clear contract + the 30-day constant,
// so the seam is testable without the network. The write happens in the delete
// screen via fbPatchUserChild; the read happens here via fbGetUserChild.

import { fbGetUserChild, fbPatchUserChild, buildAuthUrl } from '../../firebase.js';
import { getAuthState } from '../../auth.js';
import { logger } from '../../util/logger.js';

// 30-day grace window (mirrors auth.js buildSoftDeleteFlag THIRTY_DAYS_MS +
// the privacy-policy "30-day grace" copy at i18n privacyRetentionBody).
export const DELETION_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

// RTDB child path (relative to users/{uid}) of the soft-delete marker. Single
// source of truth shared by the write site (DeleteAccountConfirm), the read
// site (runPostAuthSync) and the restore/clear path here.
export const DELETION_MARKER_NODE = 'account';
export const DELETION_MARKER_FIELD = 'deletionRequestedAt';

// Re-auth-for-delete return intent. When the destructive-action gate forces the
// user out to /auth to re-authenticate, this sessionStorage key remembers WHY so
// the post-auth landing can return them to the delete flow instead of dead-ending
// at the app home (the re-auth otherwise has no visible purpose). Cleared on
// consume. sessionStorage (not local): the intent is scoped to this tab's re-auth
// round-trip and must not survive a full app restart.
export const POST_AUTH_RETURN_KEY = 'postAuthReturn';
export const POST_AUTH_RETURN_DELETE = 'delete-account-confirm';

export interface DeletionMarker {
  /** epoch ms when deletion was requested */
  requestedAt: number;
  /** true when the 30-day grace window has already elapsed */
  expired: boolean;
}

/**
 * Write the soft-delete marker for the currently-authenticated user. PATCH (not
 * PUT) so it only adds `users/{uid}/account/deletionRequestedAt` without
 * clobbering sibling data (SYNC_KEYS / wv2 / fcmTokens). Returns false when not
 * authenticated or the network write failed (caller still proceeds with the
 * local wipe + sign-out — a stale-but-valid token re-authorizes the write on a
 * later boot, and the grace function is a backstop).
 *
 * @param {number} [now=Date.now()]
 * @returns {Promise<boolean>}
 */
export async function markAccountForDeletion(now: number = Date.now()): Promise<boolean> {
  return fbPatchUserChild(DELETION_MARKER_NODE, { [DELETION_MARKER_FIELD]: now });
}

/**
 * Read the soft-delete marker for the currently-authenticated user. Returns
 * null when unauthenticated, the node is absent/malformed, or no deletion was
 * requested. `expired` is true once Date.now() - requestedAt >= the 30-day
 * grace window (the scheduled purge may not have run yet — treat as deleted).
 *
 * @param {number} [now=Date.now()]
 * @returns {Promise<DeletionMarker|null>}
 */
export async function readDeletionMarker(now: number = Date.now()): Promise<DeletionMarker | null> {
  const node = await fbGetUserChild(DELETION_MARKER_NODE);
  if (node == null || typeof node !== 'object') return null;
  const raw = (node as Record<string, unknown>)[DELETION_MARKER_FIELD];
  const requestedAt = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(requestedAt) || requestedAt <= 0) return null;
  return { requestedAt, expired: now - requestedAt >= DELETION_GRACE_MS };
}

/**
 * Clear the soft-delete marker (Restore account). PATCH the field to null so
 * the node is removed without touching siblings. Returns false when
 * unauthenticated or the write failed.
 *
 * @returns {Promise<boolean>}
 */
export async function clearDeletionMarker(): Promise<boolean> {
  return fbPatchUserChild(DELETION_MARKER_NODE, { [DELETION_MARKER_FIELD]: null });
}

/**
 * "Delete now" — immediate full cloud purge of the entire `users/{uid}` node
 * (GDPR Art. 17 strict erasure, no grace). Mirrors the pre-soft-delete behavior:
 * DELETE the whole node with the still-valid auth token. Returns false when
 * unauthenticated or the request failed (caller still proceeds with local wipe +
 * sign-out; the scheduled grace function backstops any node that survives).
 *
 * @returns {Promise<boolean>}
 */
export async function hardDeleteCloudUser(): Promise<boolean> {
  const auth = getAuthState();
  if (!auth?.uid) return false;
  try {
    const url = await buildAuthUrl(`users/${auth.uid}`);
    const r = await fetch(url, { method: 'DELETE', signal: AbortSignal.timeout(15000) }); // _fbFetch idiom: never hang
    return r.ok;
  } catch (e) {
    logger.warn('[accountDeletion] hard cloud delete failed:', e);
    return false;
  }
}
