// ══ DELETE ACCOUNT CONFIRM — D047 RIP-OUT drill-down screen ════════════
// Per mockup andura-clasic.html #screen-confirm-delete L2325-2338.
// §A016 freshness gate + §A007 token clear preserved.
//
// §56.5.2 soft-delete (30-day grace) — this screen NO LONGER wipes the cloud
// (Tier 2 RTDB) immediately. It writes a `users/{uid}/account/deletionRequestedAt`
// marker (epoch ms), then wipes LOCAL (Tier 0 localStorage + Tier 1 IndexedDB)
// + signs out. The cloud copy is retained for a 30-day restore window: on the
// next sign-in the user is offered Restore vs Delete-now (see accountDeletion.ts
// + reactBoot runPostAuthSync + RestoreAccount screen). A scheduled Cloud
// Function (functions/deletionGrace.js) hard-purges any marker >= 30 days old.
// This keeps the device cleared right away (shared-device hygiene) while making
// the privacy-policy "30-day grace" claim accurate.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { logger } from '../../../../util/logger.js';
import { useAppStore } from '../../../stores/appStore';
import { SubHeader } from '../../../components/SubHeader';
import { resetInMemoryStores } from '../../../lib/resetStores';
import { isAuthFresh, signOut as authSignOut, getAuthState } from '../../../../auth.js';
import {
  markAccountForDeletion,
  POST_AUTH_RETURN_KEY,
  POST_AUTH_RETURN_DELETE,
} from '../../../lib/accountDeletion';
import { gotoPath } from '../../../lib/navigation';
import { t } from '../../../../i18n/index.js';

// §56.5.2 — upper bound on the awaited cloud marker WRITE so a hung network
// never traps the user on the delete screen. The local wipe + sign-out +
// navigation still proceed after this window even if the PATCH has NOT resolved
// (the grace function is a backstop, so the soft-delete still lands on reconnect).
// A marker write that RESOLVES false (genuine offline/5xx/expired-token failure)
// within this window is a different case: we surface a retry error and do NOT wipe,
// because nothing landed in the cloud — proceeding would let the cloud data
// resurrect on the next sign-in while the user believes they deleted (the silent
// no-op bug this fix repairs).
const REMOTE_MARK_TIMEOUT_MS = 8000;

// Sentinel for "the marker write did not resolve before REMOTE_MARK_TIMEOUT_MS"
// (the timeout race won) — distinct from a resolved boolean (true=wrote, false=failed).
const MARK_TIMED_OUT = Symbol('mark-timed-out');

function wipeAllLocalData(): void {
  try {
    // GDPR Art. 17 — reset EVERY in-memory wv2 store via the canonical shared
    // helper. The prior hand-rolled list here OMITTED useProgresStore
    // (weightLog/bodyData/targetObiectiv), so after a delete a SAME-uid re-login
    // within the SPA session mergeArrayUnion'd the stale in-memory progres data
    // with the empty cloud and PATCHed it back — resurrecting deleted weight/body
    // history (the F2 in-memory-reset bug, fixed once in resetInMemoryStores).
    // Using the shared helper keeps this in lock-step with every future store.
    resetInMemoryStores();
    // S-01 audit fix (AUDIT-3 §S-01 CRIT, GDPR Art. 17) — account delete must
    // erase ALL local data. The prior wv2-* prefix loop left ~38 unprefixed
    // legacy keys on device (logs/weights/coach-decisions/pr-records/pain-cdl/
    // device-id/tombstones/...) written via src/db.js + engine wrappers. Since
    // this is full account deletion (nothing to preserve, unlike fullReset
    // which keeps device-id), clear the entire localStorage namespace.
    localStorage.clear();
    // RE-S-02 audit fix (REAUDIT-3 MED) — persist the sync-suppression window
    // ACROSS the clear (window._suppressFirebaseSync is set pre-wipe but does
    // not survive a page load). Mirrors fullReset (dataCleanup.js:209): set the
    // marker AFTER localStorage.clear() so a stale/empty syncToFirebase cannot
    // recreate users/{uid} and the next boot's syncFromFirebase short-circuits.
    localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
  } catch (e) {
    logger.warn('[DeleteAccountConfirm] wipe failed:', e);
  }
}

async function wipeLocalDeviceDB(uid: string): Promise<void> {
  // §56.5.2 — Tier 1 IndexedDB is LOCAL device data; clearing it on soft-delete
  // keeps the device wiped right away (shared-device hygiene). The Tier 2 RTDB
  // node is NOT deleted here — it is retained for the 30-day restore window and
  // only the deletion marker is written (see handleConfirm). The scheduled
  // grace function performs the eventual hard cloud purge.
  try {
    const dbModule = await import('../../../../storage/db.js');
    await dbModule.wipeUserDB(uid);
  } catch (e) {
    logger.warn('[DeleteAccountConfirm] Tier 1 IDB wipe failed:', e);
  }
}

export function DeleteAccountConfirm(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(): Promise<void> {
    setError(null);
    // §A016 — destructive action gate: require recent re-auth.
    if (!isAuthFresh()) {
      // FIX 6 — remember WHY we are forcing re-auth so the post-auth landing
      // (AuthCallback postAuthLanding) returns the user to THIS delete flow
      // instead of dead-ending at the app home (the `reason` param alone was
      // orphaned — consumed nowhere). sessionStorage: scoped to this re-auth round.
      try { sessionStorage.setItem(POST_AUTH_RETURN_KEY, POST_AUTH_RETURN_DELETE); } catch { /* ignore */ }
      authSignOut();
      setAuthenticated(false);
      navigate('/auth?reason=reauth_required_for_delete');
      return;
    }
    // §56.5.2 soft-delete (30-day grace) — write the cloud deletion MARKER +
    // wipe LOCAL (Tier 0 + Tier 1); the cloud node is RETAINED for restore.
    //
    // Token-ordering (RE-S-01 lesson): the marker PATCH (markAccountForDeletion
    // → fbPatchUserChild → getIdToken) reads getAuthState(), which returns null
    // once authSignOut() has cleared the tokens. So we AWAIT the marker write +
    // the Tier 1 IDB wipe (both issued with a still-valid token) BEFORE
    // authSignOut(). A timeout fallback guarantees a hung network can't trap the
    // user on this screen — a stale-but-valid token re-authorizes the PATCH for
    // ~1h on a later boot, and the grace function backstops the purge regardless.
    //
    // Suppress ORDER (vs RE-S-02): fbPatchUserChild early-returns when
    // window._suppressFirebaseSync is set, so the suppress flag is raised only
    // AFTER the marker write has been issued — otherwise the marker would never
    // reach the cloud. We still suppress before the LOCAL wipe so the DB.set 3s
    // debounce (firebase.js) cannot schedule a stale syncToFirebase during the
    // store resets, and re-assert the persisted __suppressFirebaseSyncUntil guard
    // inside wipeAllLocalData (set after localStorage.clear()).
    const authState = getAuthState();
    if (authState?.uid) {
      // Race the marker WRITE against the timeout so a hung network can't trap the
      // user. Capture the marker result: a RESOLVED false (genuine failure) must
      // block the local wipe, but a TIMEOUT (write still in flight) proceeds (the
      // grace function backstops it).
      const marked: boolean | typeof MARK_TIMED_OUT = await Promise.race([
        markAccountForDeletion(),
        new Promise<typeof MARK_TIMED_OUT>((resolve) =>
          setTimeout(() => resolve(MARK_TIMED_OUT), REMOTE_MARK_TIMEOUT_MS),
        ),
      ]);
      if (marked === false) {
        // The cloud erasure marker WRITE genuinely failed (offline / 5xx / expired
        // token). Nothing landed in the cloud, so wiping local + presenting a
        // "deleted" outcome would silently NO-OP the deletion (the cloud data
        // resurrects on the next sign-in). Surface a retry error and stop — the
        // user stays authed with their data intact and can retry.
        logger.warn('[DeleteAccountConfirm] marker write failed — aborting delete, surfacing retry');
        setError(t('confirm.deleteAccount.errorRetry'));
        return;
      }
      // marked === true (wrote) OR MARK_TIMED_OUT (still in flight) → proceed.
      await wipeLocalDeviceDB(authState.uid);
    }
    window._suppressFirebaseSync = true;
    wipeAllLocalData();
    authSignOut();
    setAuthenticated(false);
    navigate('/auth');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-danger'));
  }

  return (
    <section className="min-h-screen flex flex-col" data-testid="delete-account-confirm">
      <SubHeader
        title={t('confirm.deleteAccount.title')}
        onBack={handleCancel}
        testIdBack="delete-confirm-back"
        danger
      />

      {/* Pulse reskin (arc #5 2026-05-29) — flat disc + bg-paper2 → Pulse glass
          card. Destructive screen keeps the brick warm-flag tint on the disc +
          a brick corner wash (--wash brick) so it still reads as a danger
          surface. Logic / i18n / testids unchanged. */}
      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div
          className="pulse-card pulse-card-glow w-full max-w-sm mt-2 p-6 flex flex-col items-center animate-card-rise"
          style={{ ['--wash' as string]: 'var(--danger)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'color-mix(in oklab, var(--danger) 14%, var(--surface))', border: '1px solid color-mix(in oklab, var(--danger) 30%, transparent)', boxShadow: '0 0 24px -8px var(--danger)' }}
          >
            <Trash2 className="w-7 h-7 text-danger" aria-hidden="true" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">{t('confirm.deleteAccount.heading')}</h2>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.deleteAccount.body1')}
          </p>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.deleteAccount.body2')}
          </p>

          {error && (
            <p
              className="text-sm text-danger leading-relaxed mt-3"
              role="alert"
              data-testid="delete-confirm-error"
            >
              {error}
            </p>
          )}

          <div className="w-full mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { void handleConfirm(); }}
              data-testid="delete-confirm-accept"
              className="press-feedback w-full py-4 bg-danger text-white rounded-full text-base font-semibold"
            >
              {t('confirm.deleteAccount.acceptCta')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              data-testid="delete-confirm-cancel"
              className="press-feedback w-full py-4 border border-line rounded-full text-base font-medium text-ink"
              style={{ background: 'var(--surface-2)' }}
            >
              {t('confirm.deleteAccount.cancelCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
