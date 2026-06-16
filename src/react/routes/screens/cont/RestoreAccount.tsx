// ══ RESTORE ACCOUNT — §56.5.2 soft-delete 30-day grace choice screen ════════
// Shown on sign-in when runPostAuthSync found a deletion marker on this account
// (appStore.pendingDeletionRestore set; cloud restore was skipped). The user
// must choose BEFORE entering the app:
//   - "Restore account" → clear the marker, clear the flag, hydrate the retained
//     cloud backup, resume into the app.
//   - "Delete now"      → immediate full cloud purge + local wipe + sign-out
//     (the hard-delete that used to happen on the confirm screen).
// When the 30-day window has already elapsed (marker.expired, the scheduled
// purge may not have run yet) only "Delete now" is offered — a returning user is
// never silently let back into a purge-pending account.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { logger } from '../../../../util/logger.js';
import { useAppStore } from '../../../stores/appStore';
import { SubHeader } from '../../../components/SubHeader';
import { resetInMemoryStores } from '../../../lib/resetStores';
import { signOut as authSignOut, getAuthState } from '../../../../auth.js';
import { clearDeletionMarker, hardDeleteCloudUser } from '../../../lib/accountDeletion';
import { hydrateStoresFromCloud } from '../../../lib/storeSync';
import { initFirebaseSync } from '../../../../firebase.js';
import { t } from '../../../../i18n/index.js';

// Upper bound on the awaited cloud op (restore hydrate OR hard-delete) so a hung
// network never traps the user on this screen — mirrors DeleteAccountConfirm.
const CLOUD_OP_TIMEOUT_MS = 8000;

function wipeAllLocalData(): void {
  try {
    // GDPR Art. 17 — reset EVERY in-memory wv2 store via the canonical shared
    // helper. The prior hand-rolled list here OMITTED useProgresStore
    // (weightLog/bodyData/targetObiectiv), so a "Delete now" followed by a
    // SAME-uid re-login within the SPA session mergeArrayUnion'd the stale
    // in-memory progres data with the empty cloud and PATCHed it back —
    // resurrecting deleted weight/body history. The shared helper covers progres
    // (the F2 fix) and stays in lock-step with every future store.
    resetInMemoryStores();
    localStorage.clear();
    localStorage.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
  } catch (e) {
    logger.warn('[RestoreAccount] wipe failed:', e);
  }
}

async function wipeLocalDeviceDB(uid: string): Promise<void> {
  try {
    const dbModule = await import('../../../../storage/db.js');
    await dbModule.wipeUserDB(uid);
  } catch (e) {
    logger.warn('[RestoreAccount] Tier 1 IDB wipe failed:', e);
  }
}

export function RestoreAccount(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setPendingDeletionRestore = useAppStore((s) => s.setPendingDeletionRestore);
  const pending = useAppStore((s) => s.pendingDeletionRestore);

  // Defensive: no pending marker (direct nav / already-resolved) → leave for the
  // app. ProtectedRoute won't redirect here without the flag, so this only fires
  // on a stale deep-link.
  const expired = pending?.expired === true;

  async function handleRestore(): Promise<void> {
    // Clear the marker first (with the still-valid token), then resume.
    await Promise.race([
      clearDeletionMarker(),
      new Promise<void>((resolve) => setTimeout(resolve, CLOUD_OP_TIMEOUT_MS)),
    ]);
    // Pull the retained cloud backup back down (the restore step that
    // runPostAuthSync skipped while the marker was present).
    try {
      await Promise.race([
        (async () => { await initFirebaseSync(); await hydrateStoresFromCloud(); })(),
        new Promise<void>((resolve) => setTimeout(resolve, CLOUD_OP_TIMEOUT_MS)),
      ]);
    } catch (e) {
      logger.warn('[RestoreAccount] restore hydrate failed:', e);
    }
    setPendingDeletionRestore(null);
    navigate('/app/antrenor', { replace: true });
  }

  // Back / "not now" — leave the decision for later by signing out (the marker
  // stays, so the choice resurfaces on the next sign-in; the grace function
  // still purges at 30 days). Does NOT touch local/cloud data.
  function handleBack(): void {
    setPendingDeletionRestore(null);
    authSignOut();
    setAuthenticated(false);
    navigate('/auth', { replace: true });
  }

  async function handleDeleteNow(): Promise<void> {
    // Immediate full purge — the hard-delete that used to live on the confirm
    // screen. Token-ordering: issue the cloud DELETE + IDB wipe (still-valid
    // token) BEFORE sign-out; suppress sync only after, so the local wipe's
    // DB.set debounce cannot push a stale tree. Timeout-capped.
    const authState = getAuthState();
    if (authState?.uid) {
      await Promise.race([
        (async () => {
          await hardDeleteCloudUser();
          await wipeLocalDeviceDB(authState.uid);
        })(),
        new Promise<void>((resolve) => setTimeout(resolve, CLOUD_OP_TIMEOUT_MS)),
      ]);
    }
    window._suppressFirebaseSync = true;
    wipeAllLocalData();
    setPendingDeletionRestore(null);
    authSignOut();
    setAuthenticated(false);
    navigate('/auth', { replace: true });
  }

  return (
    <section className="min-h-screen flex flex-col" data-testid="restore-account">
      <SubHeader
        title={t('confirm.restoreAccount.title')}
        onBack={handleBack}
        testIdBack="restore-account-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="pulse-card pulse-card-glow w-full max-w-sm mt-2 p-6 flex flex-col items-center animate-card-rise">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'color-mix(in oklab, var(--accent) 14%, var(--surface))', border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)', boxShadow: '0 0 24px -8px var(--accent)' }}
          >
            <RotateCcw className="w-7 h-7 text-accent" aria-hidden="true" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">{t('confirm.restoreAccount.heading')}</h2>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {expired ? t('confirm.restoreAccount.bodyExpired') : t('confirm.restoreAccount.body')}
          </p>

          <div className="w-full mt-8 flex flex-col gap-3">
            {!expired && (
              <button
                type="button"
                onClick={() => { void handleRestore(); }}
                data-testid="restore-account-restore"
                className="press-feedback w-full py-4 bg-accent text-white rounded-full text-base font-semibold"
              >
                {t('confirm.restoreAccount.restoreCta')}
              </button>
            )}
            <button
              type="button"
              onClick={() => { void handleDeleteNow(); }}
              data-testid="restore-account-delete-now"
              className="press-feedback w-full py-4 border border-line rounded-full text-base font-medium text-danger"
              style={{ background: 'var(--surface-2)' }}
            >
              {t('confirm.restoreAccount.deleteNowCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
