// ══ REACT BOOT ORCHESTRATION — wire bootstrap.js into React entry (S-07) ════
// AUDIT-3 §S-07 (HIGH, data-integrity) fix. The D028 vanilla→React entry swap
// (DECISIONS.md §D028) left the boot orchestration wired ONLY into the retired
// `src/main.js` (`init()`), never invoked from the React production entry
// `src/main.tsx`. Net effect pre-fix:
//   - Schema migrations (ADR 018 §4) never ran in production.
//   - Tier 0→1 rotation (ADR 020) never ran → localStorage grows unbounded.
//   - No cloud restore on login → a user logging in on a new device got an
//     empty app (their RTDB backup was never pulled).
//   - users/daniel → users/{uid} path migration never ran.
//
// This module re-assembles the SAME boot steps `main.js:init()` performed, in
// the SAME order, but as standalone idempotent functions callable from the
// React lifecycle. ADR 001 intent (local-first IndexedDB + Firebase backup
// tier) is restored without re-introducing the vanilla entry.
//
// ── Split rationale ──────────────────────────────────────────────────────────
//
//   runReactBoot()      → auth-INDEPENDENT boot. Runs once per app load
//                         regardless of route/auth (migrations + tier rotation).
//                         Wired from `main.tsx` (fire-and-forget; never blocks
//                         first paint per ADR 018 §4 graceful degradation).
//   runPostAuthSync()   → auth-DEPENDENT cloud sync. Path migration + Firebase
//                         restore/push-back. Wired from `AuthCallback.tsx` on
//                         fresh-login success AND from runReactBoot() for a
//                         returning already-authed user (cold boot with token).
//
// ── No-data-loss invariants (verified against firebase.js + migration code) ──
//
//   1. Restore CANNOT overwrite newer local data. `syncFromFirebase`
//      (firebase.js:243) merges object keys with LOCAL-ALWAYS-WINS on conflict
//      (line 282 `Object.assign({}, remote, local)`) and arrays as a ts-keyed
//      union (line 285-291). Pulling remote only ADDS keys/entries the device
//      is missing — it never clobbers a locally-present value.
//   2. Migrations are idempotent: the runner filters by `schemaVersion`
//      (migrationRunner.js:99) so re-runs are no-ops; UTC→Local migration has a
//      localStorage flag (logsMigration.js:12) + writes a timestamped backup
//      before mutating.
//   3. Tier rotation writes Tier 1 (IDB) + verifies BEFORE deleting Tier 0
//      (tieringEngine.js:248-258) — zero-info-loss per ADR 020 §Rotation.
//   4. Auth-path migration is gated by a localStorage `done` flag + a
//      dest-populated check + read-back key-count verify before marking done
//      (auth-path-migration.js:72-134) — safe to call every boot.
//
// All steps are non-blocking: each catches its own errors (or is wrapped here)
// so a failure in one never aborts boot or loses unrelated data.

import { logger } from '../../util/logger.js';
import { runBootMigrations, startTierRotation, exposeForceRotationHelper } from '../../bootstrap.js';
import { migrateLogsUtcToLocal } from '../../util/logsMigration.js';
import { initFirebaseSync } from '../../firebase.js';
import { getAuthState, restoreSession } from '../../auth.js';
import { runAuthPathMigration } from '../../migrations/2026-05-02-auth-path-migration.js';
import { enforceDataOwner } from '../../util/dataReset.js';
import { useAppStore } from '../stores/appStore';
import { hydrateStoresFromCloud, startStoreSyncSubscriptions } from './storeSync';
import { startLiveSync } from './liveSync';
import { resetInMemoryStores } from './resetStores';
import { migrateAnonymousToAuth } from '../../storage/migrateAnonymousToAuth.js';
import { readDeletionMarker } from './accountDeletion';
import { runIdMigrationOnce } from '../../engine/idMigration.js';
import { isEnabled } from '../../util/featureFlags.js';

// Module-level idempotency guards. React 18 StrictMode double-invokes effects
// in dev, and main.tsx + a returning-user path could both reach boot — these
// ensure the heavyweight steps run at most once per page load.
let _bootStarted = false;
/** @type {Promise<void> | null} */
let _postAuthInFlight: Promise<void> | null = null;
// RE-S-03 audit fix (REAUDIT-3 MED) — the done-flag is keyed BY UID, not a
// boolean. A bare boolean was never reset on an in-session logout→login (both
// LogoutConfirm + DeleteAccountConfirm sign out via pure SPA, no page reload),
// so a second account authenticating within the same page load would hit
// `if (_postAuthDone) return` and silently skip its cloud restore. Keying by
// uid means a *different* uid always restores, while a repeat of the SAME uid
// still dedups. null = no successful sync yet this page load.
let _postAuthDoneForUid: string | null = null;

// Logout-restore fix — clear the per-uid sync-done guard on every sign-out.
// Both LogoutConfirm + DeleteAccountConfirm sign out via pure SPA (no page
// reload), so the module-level `_postAuthDoneForUid` survives a logout. Without
// this, a user who logs out then logs back in as the SAME uid in the same page
// load would hit `if (_postAuthDoneForUid === uid) return` in runPostAuthSync
// and skip the cloud restore entirely — leaving the onboarding-complete flag +
// profile (wiped locally by LogoutConfirm's store resets) unrestored, forcing a
// returning user back through onboarding. Resetting the guard here makes the
// re-login re-run hydrateStoresFromCloud, which sticky-restores `completed`
// (see storeSync onboarding apply). A different uid was never deduped anyway.
if (typeof window !== 'undefined') {
  window.addEventListener('andura:signedout', () => {
    _postAuthDoneForUid = null;
  });
}

/**
 * Auth-independent boot orchestration. Idempotent — only the first call does
 * work; subsequent calls return the same settled promise. Mirrors the
 * migration + tier-rotation portion of the retired `main.js:init()` ordering.
 *
 * Order matches main.js: UTC→Local migration → schema migrations → tier
 * rotation init → expose dev helper. Each step is graceful (own try/catch in
 * the underlying module or wrapped here) so boot never aborts.
 *
 * If a token is already present (returning authenticated user cold-booting),
 * also kicks off the cloud sync so their RTDB backup is pulled — fire-and-
 * forget, not awaited, so first paint is never blocked on the network.
 */
export async function runReactBoot(): Promise<void> {
  if (_bootStarted) return;
  _bootStarted = true;

  // 1. UTC → Local date migration (idempotent via localStorage flag).
  try {
    const migrationResult = migrateLogsUtcToLocal();
    if (!migrationResult?.skipped) {
      logger.debug('[Migration] Logs/CDL date format updated to local timezone');
    }
  } catch (err) {
    logger.error('[Migration] UTC→Local failed:', err);
    // Continue boot — non-blocking per ADR 018 §4 graceful degradation.
  }

  // 2. Schema migrations (ADR 018 §4 eager, before any engine read).
  await runBootMigrations();

  // 3. Tier 0 → Tier 1 rotation (ADR 020 initial pass + hourly timer).
  await startTierRotation();
  exposeForceRotationHelper();

  // 3b. Wire the wv2 Zustand store-sync push subscriptions (08.050/051). Each
  //    user-DATA store (workout/progres/onboarding/nutrition/schedule/settings)
  //    debounced-PATCHes its node under users/{uid}/wv2/* on change. Started
  //    auth-INDEPENDENT — the underlying PATCH short-circuits on a null user
  //    path, so anonymous edits no-op the network until login. Pre-fix these
  //    stores were localStorage-only → data loss on reinstall / new device.
  startStoreSyncSubscriptions();

  // 3c. Live-sync PULL lifecycle (live_sync_poll_v1, 2026-07-03). The push subs
  //    above already carry local edits UP to the cloud ~3s after any change, but
  //    a device only ever pulled DOWN at boot — so a second device (phone vs PC)
  //    never saw the first's edits until fully reopened. startLiveSync re-pulls
  //    both channels on foreground/visibility, a 3-min foreground interval, and
  //    network reconnect (idempotent no-clobber merge). Auth-independent + flag-
  //    gated: livePullNow self-guards on auth/offline/suppress/throttle, and the
  //    flag off wires no listeners at all.
  startLiveSync();

  // 4. Restore-on-boot session rehydration. The idToken expires ~1h; the
  //    refresh token is long-lived. Refresh proactively from the stored refresh
  //    token so a returning user stays logged in across reloads/sessions with a
  //    VALID token (not just a stale string that 401s on the next fetch). A
  //    definitive auth rejection (dead refresh token) signs out cleanly inside
  //    restoreSession; a transient/offline failure keeps the session. Awaited
  //    (single network call) so the subsequent cloud sync uses a fresh token —
  //    boot is already fire-and-forget from main.tsx, so this never blocks paint.
  try {
    await restoreSession();
  } catch (err) {
    logger.warn('[Auth] boot session restore failed:', err);
    // Non-fatal — getIdToken() will lazily refresh on the next data call.
  }

  // 5. Bridge persisted auth tokens → appStore.isAuthenticated at boot so a
  //    returning user is recognized app-wide (Splash `/` included), NOT just
  //    once they hit a ProtectedRoute. Pre-fix the store defaulted to false on
  //    every reload (it persists only isSkipAuth) and was synced from storage
  //    ONLY inside ProtectedRoute — but Splash is a top-level route outside that
  //    gate, so a logged-in user landing on `/` saw "Log In" + got bounced to
  //    /auth, forced to re-login each session despite valid persisted tokens.
  //    ADDITIVE only (mirrors ProtectedRoute §7-C3): set true when storage has a
  //    session; never set false (preserves dev mock login + test isolation +
  //    skip-auth). signOut() still flips it false via the andura:signedout event.
  if (getAuthState()) {
    useAppStore.getState().setAuthenticated(true);
  }

  // 6. Returning authenticated user (token persisted from a prior session):
  //    pull their cloud backup. Fire-and-forget — never block boot/paint.
  if (getAuthState()?.uid) {
    void runPostAuthSync();
  }
}

/**
 * Auth-dependent cloud sync. Runs the legacy users/daniel → users/{uid} path
 * migration (idempotent, no-op for non-Daniel / already-migrated) then the
 * Firebase restore + push-back (`initFirebaseSync`). Safe to call from both the
 * fresh-login success path and the returning-user boot path.
 *
 * Guards:
 *   - No-op when unauthenticated (`getAuthState()` null) — `initFirebaseSync`
 *     + the path migration both short-circuit on null uid internally, but we
 *     bail early to avoid even attempting a network fetch.
 *   - In-flight dedup + done flag so a fresh login that races the cold-boot
 *     returning-user call does not double-sync.
 *   - Wrapped try/catch — sync failure (offline, transient 5xx) never throws to
 *     the caller and never loses local data (restore is additive, see header).
 */
export async function runPostAuthSync(): Promise<void> {
  // RE-S-03 — capture the current uid up-front. Dedup only when THIS uid has
  // already synced this page load; a different uid (in-session account switch
  // after a pure-SPA logout→login) always proceeds to its own restore.
  const uid = getAuthState()?.uid;
  if (!uid) return;
  if (_postAuthDoneForUid === uid) return;
  if (_postAuthInFlight) return _postAuthInFlight;

  _postAuthInFlight = (async () => {
    try {
      // §56.5.2 soft-delete grace — BEFORE any cloud restore, check whether this
      // account has a pending deletion marker. A soft-deleted account must NOT
      // silently hydrate its (retained) cloud backup into a fresh session; the
      // user has to make an explicit choice first. A fresh (< 30d) marker sets
      // the appStore flag that drives the RESTORE choice screen and we bail out
      // of the sync (no restore, no hydrate). A marker absent / malformed /
      // network-failed read returns null → normal sign-in continues unchanged.
      // An expired (>= 30d) marker still surfaces the screen (Delete-now only)
      // so a returning user is never silently let back into a purge-pending
      // account before the scheduled function has run.
      try {
        const marker = await readDeletionMarker();
        if (marker) {
          useAppStore.getState().setPendingDeletionRestore({
            requestedAt: marker.requestedAt,
            expired: marker.expired,
          });
          _postAuthDoneForUid = uid;
          return;
        }
        // No marker → clear any stale flag from a prior in-session account.
        useAppStore.getState().setPendingDeletionRestore(null);
      } catch (err) {
        logger.warn('[Auth] deletion-marker check threw:', err);
        // Non-fatal — fall through to normal sync (fail-open: never trap a user
        // out of their account because a marker read failed).
      }
      // H1 shared-device fix — account-switch guard. BEFORE any cloud sync, purge
      // a DIFFERENT prior user's local data if this uid does not own it (e.g. user
      // B opened a magic link on user A's still-authed browser without a logout).
      // Without this, the local-always-wins merge below would push A's stale local
      // data up to B's cloud. No-op for the same user / first login. Best-effort
      // (own try/catch) so a wipe failure never blocks or aborts the sync.
      let dataSwitch = false;
      try {
        dataSwitch = await enforceDataOwner(uid);
      } catch (err) {
        logger.warn('[Auth] data-owner guard threw:', err);
      }
      // Account-switch in-memory wipe — enforceDataOwner clears localStorage +
      // IndexedDB on a switch (a DIFFERENT account authenticated on a still-authed
      // browser with NO page reload), but NOT the in-memory Zustand stores, which
      // still hold the PRIOR user's state. Without this reset, the hydrate below
      // would mergeArrayUnion A's in-memory sessions/history with B's cloud → A's
      // data leaks into B's UI AND gets pushed up to B's cloud node (permanent
      // contamination). Reset BEFORE the hydrate so the merge lands on an EMPTY
      // local baseline (B's cloud → empty).
      if (dataSwitch) {
        resetInMemoryStores();
      }
      // 08.047 — anon → auth IndexedDB Tier-1 handover. When a user trained
      // anonymously then signed up on THIS device (not an account switch), the
      // rotated logs/CDL/patterns live in `andura_anonymous_<deviceId>` and
      // become orphaned once getNamespace() flips to `andura_<uid>`. Merge them
      // into the auth namespace (union by id, dest-wins, never-delete). Idempotent
      // per-uid flag; best-effort + non-fatal. Skip on an account switch — the
      // anonymous archive does not belong to the newly-authed different user.
      if (!dataSwitch) {
        try {
          await migrateAnonymousToAuth(uid);
        } catch (err) {
          logger.warn('[Auth] anon→auth IDB migration threw:', err);
        }
      }
      // Path migration FIRST so the subsequent restore reads from the
      // canonical users/{uid} node (not the legacy users/daniel literal).
      // Idempotent: no-op for non-Daniel uid or already-migrated.
      try {
        await runAuthPathMigration();
      } catch (err) {
        logger.warn('[Auth] post-auth path migration threw:', err);
      }
      // Restore from cloud + push merged local back (local-always-wins merge,
      // so this can only ADD missing remote data — never clobbers newer local).
      await initFirebaseSync();
      // 08.050/051 — hydrate the wv2 Zustand stores from their RTDB nodes with
      // the same no-clobber merge (union arrays / max scalars / LWW profile).
      // Pre-fix these never round-tripped to the cloud at all. Awaited so the
      // restored history is in place before the user starts interacting; own
      // try/catch inside hydrate keeps a per-store GET failure non-fatal.
      try {
        await hydrateStoresFromCloud();
      } catch (err) {
        logger.warn('[Sync] wv2 store hydrate failed:', err);
      }
      // F3 ID-migration apply (2026-06-12, dp_id_migration_apply_v1) — ONE-SHOT
      // per boot, AFTER hydrate so the local stores carry the freshest state
      // (cloud or device, whichever won) before re-keying legacy exercise names
      // onto canonical engine names. THIS is the durable half of the fix: the
      // 06-10 server-side remap got clobbered by a device pushing its stale
      // local copy back up — migrating ON the device then letting sync push
      // canonical names converges every replica. Idempotent (no-op when clean),
      // collision-averse (merge-pending stores are skipped, never auto-merged),
      // backup-first per store, fail-silent (a migration error never blocks
      // boot — the read-shim keeps resolving legacy names regardless).
      try {
        if (isEnabled('dp_id_migration_apply_v1')) {
          const r = runIdMigrationOnce();
          if (r.changed > 0 || r.errors.length > 0) {
            logger.info('[IdMigration] applied:', JSON.stringify(r));
          }
        }
      } catch (err) {
        logger.warn('[IdMigration] apply threw (non-fatal):', err);
      }
      _postAuthDoneForUid = uid;
    } catch (err) {
      logger.warn('[Sync] post-auth Firebase sync failed:', err);
      // Leave _postAuthDoneForUid unset for this uid so a later trigger (next
      // boot) can retry.
    } finally {
      _postAuthInFlight = null;
    }
  })();

  return _postAuthInFlight;
}

/**
 * Test-only reset of the module-level idempotency guards. Not used in
 * production — exported so unit tests can exercise repeated boot/sync flows in
 * isolation without a fresh module import per case.
 */
export function __resetReactBootGuards(): void {
  _bootStarted = false;
  _postAuthInFlight = null;
  _postAuthDoneForUid = null;
}
