// ══ BETA NOTIFY — "Notify me when it's ready" interest signal (#3 2026-06-12) ══
// The free-Beta subscription screen's "Notify me" button previously only flipped
// local React state (lost on reload). This records the interested user so the
// founder can read the list from the admin tool (RTDB europe-west1).
//
// Write target (top-level sibling of users/, simple + greppable):
//   /betaNotify/<uid> = { email, uid, ts }
//
// Reuses the existing auth-aware REST helper (buildAuthUrl from firebase.js) +
// the JWT-claims email source (getUserProfileDisplay) — NO Firebase SDK (ADR 002),
// NO hardcoded secrets (the RTDB URL + web API key are build-time injects). PUT
// (not PATCH) so a repeat tap just overwrites the same node idempotently.
//
// Graceful by contract: unauthenticated (no uid) or offline → the local
// "notified" flag is still set (button stays post-tap across reloads) and the
// function NEVER throws. A signed-in user with a stale-but-valid token still
// writes (buildAuthUrl refreshes the idToken).

import { buildAuthUrl, FIREBASE_URL } from '../../firebase.js';
import { getAuthState } from '../../auth.js';
import { getUserProfileDisplay } from '../routes/screens/cont/userProfile';

// localStorage flag — local-only (never cloud-synced); a simple "this device's
// user already tapped Notify me" marker so the CTA renders its done-state after
// a reload. Distinct from the RTDB write (the founder-readable interest record).
export const BETA_NOTIFY_FLAG_KEY = 'andura-beta-notified';

// Top-level RTDB node (sibling of users/). Single source of truth for the path
// shared by the write site + the founder's admin-tool read.
export const BETA_NOTIFY_NODE = 'betaNotify';

// Mirror firebase.js _fbFetch — raw fetch has no default timeout; a hung mobile
// socket must not wedge the write. 15s window (op typically < 1s).
const BETA_NOTIFY_FETCH_TIMEOUT_MS = 15_000;

/** Read the local "already tapped Notify me" flag. Never throws. */
export function isBetaNotified(): boolean {
  try {
    return typeof localStorage !== 'undefined'
      && localStorage.getItem(BETA_NOTIFY_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the local "already tapped" flag. Never throws. */
function setBetaNotifiedFlag(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(BETA_NOTIFY_FLAG_KEY, '1');
  } catch {
    // localStorage unavailable (private mode / quota) — non-fatal.
  }
}

/**
 * Record the current user's interest in being notified when paid plans ship.
 *
 * Always flips the local flag first (so the button sticks even when the network
 * write can't run), then best-effort writes `/betaNotify/<uid>` for a signed-in
 * user. Returns whether the cloud record was written (false = local-only:
 * unauthenticated, offline, RTDB not configured, or the request failed). NEVER
 * throws — the caller flips its own UI state regardless.
 *
 * @param {number} [now=Date.now()]
 * @returns {Promise<boolean>} true when the RTDB node was written
 */
export async function recordBetaNotifyInterest(now: number = Date.now()): Promise<boolean> {
  // Local flag first — the button must stick post-tap across reloads in EVERY
  // case (signed-out, offline, write failure).
  setBetaNotifiedFlag();

  const auth = getAuthState();
  // No uid → cannot scope the node to a user; local-only is the graceful path.
  if (!auth?.uid) return false;
  // RTDB not configured (dev/preview without the env var) → skip the network op.
  if (!FIREBASE_URL) return false;

  try {
    const { email } = getUserProfileDisplay();
    const url = await buildAuthUrl(`${BETA_NOTIFY_NODE}/${auth.uid}`);
    const r = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, uid: auth.uid, ts: now }),
      signal: AbortSignal.timeout(BETA_NOTIFY_FETCH_TIMEOUT_MS),
    });
    return r.ok;
  } catch {
    // Offline / timeout / aborted — local flag already set; never throw.
    return false;
  }
}
