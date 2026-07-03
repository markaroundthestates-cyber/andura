// ══ LIVE SYNC — periodic + focus-triggered cloud PULL (multi-device freshness) ══
//
// The PUSH side already reaches the cloud ~3s after any edit (firebase.js DB.set
// debounce + storeSync.ts subscription debounce). But the PULL side only ran ONCE,
// at boot/login (reactBoot.runPostAuthSync). So a second device (PC vs phone) never
// saw the first device's changes until it was fully reopened — the app "felt like
// it didn't sync between devices."
//
// This module adds the missing half: a lightweight re-PULL on three triggers —
//   1. visibilitychange → visible  (you switch back to this tab / bring the PWA to
//      the foreground): the trigger that actually matters for a phone↔PC user, who
//      switches devices rather than using both at once → feels real-time-on-switch.
//   2. a foreground interval (default 3 min): the backstop for a device left open
//      in front of you ("sau macar cu un delay de 5 min").
//   3. window 'online' (reconnect after a drop): pull the latest immediately.
//
// The pull re-runs ONLY the two idempotent merge functions — syncFromFirebase()
// (flat SYNC_KEYS) + hydrateStoresFromCloud() (wv2 stores). Both are explicitly
// safe to call repeatedly (union arrays / max scalars / LWW-by-real-timestamp /
// tombstone-union — never clobbers newer local, never double-counts). It does NOT
// re-run the login-once machinery (path migration, deletion-marker, account-switch
// guard, id-migration) — those belong to runPostAuthSync at login, not to a 3-min
// refresh.
//
// Guards (bail cheap, no network) — flag off / unauthenticated / offline /
// sync-suppressed (delete/reset window, both the in-memory flag AND the persisted
// __suppressFirebaseSyncUntil guard — because hydrateStoresFromCloud's GET path does
// NOT self-check either, unlike syncFromFirebase) / throttled (a pull ran <
// MIN_PULL_GAP_MS ago, so focus + interval + reconnect can't stack into a burst) /
// already in flight.

import { syncFromFirebase, getUserPath } from '../../firebase.js';
import { hydrateStoresFromCloud } from './storeSync';
import { isEnabled } from '../../util/featureFlags.js';
import { logger } from '../../util/logger.js';

// Foreground re-pull cadence — the "5 min sau ceva" backstop for a device left
// open. 3 min balances freshness against RTDB read chatter (one small GET per
// channel per tick, only while the tab is actually in front).
export const FOREGROUND_POLL_MS = 180_000;

// Throttle floor — collapse focus + interval + reconnect triggers that fire close
// together into a single pull, so a rapid tab flap can't hammer the network.
export const MIN_PULL_GAP_MS = 20_000;

let _started = false;
let _intervalId: ReturnType<typeof setInterval> | null = null;
let _lastPullAt = 0;
let _inFlight = false;

/** True when a delete/reset suppress window is active (in-memory flag OR the
 *  persisted post-reset guard). Mirrors the guards syncFromFirebase applies to
 *  itself — asserted here too so the wv2 hydrate (whose GET does NOT self-check)
 *  can't resurrect data mid-wipe. */
function _syncSuppressed(): boolean {
  if (typeof window !== 'undefined' && window._suppressFirebaseSync) return true;
  try {
    const until = localStorage.getItem('__suppressFirebaseSyncUntil');
    if (until && Date.now() < Number(until)) return true;
  } catch {
    // localStorage unavailable (SSR/private-mode edge) — treat as not-suppressed.
  }
  return false;
}

/**
 * Re-pull both cloud channels IF safe. No-op (and cheap) when the flag is off,
 * unauthenticated, offline, sync-suppressed, throttled, or already in flight.
 * Never throws — each underlying sync fn owns its try/catch and returns gracefully.
 * @param reason short tag for the debug log (which trigger fired).
 */
export async function livePullNow(reason: string): Promise<void> {
  if (!isEnabled('live_sync_poll_v1')) return;
  if (_inFlight) return;
  if (!getUserPath()) return; // unauthenticated → nothing to pull
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  if (_syncSuppressed()) return;
  const now = Date.now();
  if (now - _lastPullAt < MIN_PULL_GAP_MS) return; // throttle burst triggers
  _lastPullAt = now;
  _inFlight = true;
  try {
    await syncFromFirebase();
    await hydrateStoresFromCloud();
    logger.debug(`[LiveSync] pulled (${reason})`);
  } catch (err) {
    logger.warn('[LiveSync] pull failed (non-fatal):', err);
  } finally {
    _inFlight = false;
  }
}

function _onVisibilityChange(): void {
  if (typeof document === 'undefined') return;
  if (document.visibilityState === 'visible') void livePullNow('visible');
}

function _onOnline(): void {
  void livePullNow('reconnect');
}

/**
 * Start the live-sync lifecycle: pull on foreground/focus, on a foreground
 * interval, and on network reconnect. Idempotent — a second call is a no-op.
 * Safe to start auth-independent (livePullNow self-guards on auth). Flag-gated
 * (live_sync_poll_v1) — off → no listeners wired at all. Returns a teardown fn
 * (used by tests / account teardown). SSR/jsdom safe (no window → no-op).
 */
export function startLiveSync(): () => void {
  if (_started) return stopLiveSync;
  if (typeof window === 'undefined') return () => {};
  if (!isEnabled('live_sync_poll_v1')) return () => {};
  _started = true;
  document.addEventListener('visibilitychange', _onVisibilityChange);
  window.addEventListener('online', _onOnline);
  _intervalId = setInterval(() => {
    // Only pull while the tab is actually in the foreground — a backgrounded tab
    // doesn't need fresh data and browsers throttle its timers anyway.
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      void livePullNow('interval');
    }
  }, FOREGROUND_POLL_MS);
  return stopLiveSync;
}

/** Tear down all live-sync listeners + the interval timer. */
export function stopLiveSync(): void {
  if (typeof window !== 'undefined') {
    document.removeEventListener('visibilitychange', _onVisibilityChange);
    window.removeEventListener('online', _onOnline);
  }
  if (_intervalId !== null) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
  _started = false;
}

/** Test-only reset of module state. */
export function __resetLiveSyncForTest(): void {
  stopLiveSync();
  _lastPullAt = 0;
  _inFlight = false;
}
