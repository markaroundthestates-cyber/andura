// ══ DELETE ACCOUNT CONFIRM — D047 RIP-OUT drill-down screen ════════════
// Per mockup andura-clasic.html #screen-confirm-delete L2325-2338.
// §A016 freshness gate + §A007 token clear + §B039 GDPR Tier 1+2 wipe preserved.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../../../stores/appStore';
import { SubHeader } from '../../../components/SubHeader';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { useAerobicStore } from '../../../stores/aerobicStore';
import { useCoachStore } from '../../../stores/coachStore';
import { isAuthFresh, signOut as authSignOut, getAuthState, getIdToken } from '../../../../auth.js';
import { gotoPath } from '../../../lib/navigation';
import { t } from '../../../../i18n/index.js';

// RE-S-01 audit fix — upper bound on the awaited cloud (RTDB) DELETE so a hung
// network never traps the user on the delete screen. The local wipe + sign-out
// + navigation still proceed after this window even if the DELETE has not
// resolved (a stale-but-valid token also authorizes the server-side DELETE for
// up to ~1h, so the erasure still lands once connectivity returns).
const REMOTE_WIPE_TIMEOUT_MS = 8000;

function wipeAllLocalData(): void {
  try {
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    // XCUT-2 — aerobicStore + coachStore added AFTER this wipe was built; reset
    // them in memory too so a pure-SPA delete (no reload) leaves nothing of the
    // prior user's aerobic classes / coach win-back state on this shared device.
    useAerobicStore.getState().reset();
    useCoachStore.setState({ schedContext: 'workout', persona: 'gigica', reactivateDismissed: false });
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
    if (import.meta.env.DEV) console.warn('[DeleteAccountConfirm] wipe failed:', e);
  }
}

async function wipeRemoteData(uid: string): Promise<void> {
  // §B039/D-6 — Tier 1 IDB + Tier 2 RTDB DELETE per ADR 002.
  try {
    const dbModule = await import('../../../../storage/db.js');
    await dbModule.wipeUserDB(uid);
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[DeleteAccountConfirm] Tier 1 IDB wipe failed:', e);
  }

  const rtdbUrl = (import.meta as ImportMeta & { env?: { VITE_FIREBASE_RTDB_URL?: string } })
    .env?.VITE_FIREBASE_RTDB_URL;
  if (!rtdbUrl) return;
  try {
    const idToken = await getIdToken();
    if (!idToken) return;
    const url = `${rtdbUrl.replace(/\/$/, '')}/users/${encodeURIComponent(uid)}.json?auth=${encodeURIComponent(idToken)}`;
    await fetch(url, { method: 'DELETE' });
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[DeleteAccountConfirm] Tier 2 RTDB DELETE failed:', e);
  }
}

export function DeleteAccountConfirm(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  async function handleConfirm(): Promise<void> {
    // §A016 — destructive action gate: require recent re-auth.
    if (!isAuthFresh()) {
      authSignOut();
      setAuthenticated(false);
      navigate('/auth?reason=reauth_required_for_delete');
      return;
    }
    // §B039/D-6 — GDPR Art. 17 strict erasure Tier 0 + Tier 1 + Tier 2.
    // RE-S-01 audit fix (REAUDIT-3 CRIT, GDPR Art. 17 + S-07 data-resurrection):
    // the Tier 2 (RTDB) DELETE inside wipeRemoteData calls getIdToken(), which
    // reads getAuthState() → null once authSignOut() has cleared the tokens.
    // Previously authSignOut() ran synchronously while wipeRemoteData was still
    // a pending microtask (`void`), so getIdToken returned null and the cloud
    // DELETE never fired — the user's full RTDB backup survived "Sterge contul
    // definitiv" and S-07 restore-on-login resurrected it on the next device.
    // Fix: AWAIT wipeRemoteData() to completion (cloud DELETE issued with a
    // still-valid token) BEFORE authSignOut() clears the tokens. A timeout
    // fallback guarantees a hung network can't trap the user on this screen.
    //
    // RE-S-02 audit fix (REAUDIT-3 MED) — every other destructive wipe flow
    // (dataCleanup.js fullReset/resetTestData/resetButKeepRealLogs) sets the
    // sync-suppression flag before clearing; the delete path did not. Set it
    // up-front so the firebase.js DB.set override (firebase.js:359) does not
    // schedule a 3s debounced syncToFirebase during the store resets — closing
    // the stale-empty-push window that RE-S-01's reorder would otherwise reopen.
    window._suppressFirebaseSync = true;
    const authState = getAuthState();
    if (authState?.uid) {
      await Promise.race([
        wipeRemoteData(authState.uid),
        new Promise<void>((resolve) => setTimeout(resolve, REMOTE_WIPE_TIMEOUT_MS)),
      ]);
    }
    wipeAllLocalData();
    authSignOut();
    setAuthenticated(false);
    navigate('/auth');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-danger'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="delete-account-confirm">
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
          style={{ ['--wash' as string]: 'var(--brick)' }}
        >
          <div
            className="w-16 h-16 rounded-full border border-brick/30 flex items-center justify-center mb-5"
            style={{ background: 'color-mix(in oklab, var(--brick) 12%, var(--surface))', boxShadow: '0 0 24px -8px var(--brick)' }}
          >
            <Trash2 className="w-7 h-7 text-brick" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-ink mb-3">{t('confirm.deleteAccount.heading')}</h2>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.deleteAccount.body1')}
          </p>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.deleteAccount.body2')}
          </p>

          <div className="w-full mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { void handleConfirm(); }}
              data-testid="delete-confirm-accept"
              className="btn-primary-lift press-feedback w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
            >
              {t('confirm.deleteAccount.acceptCta')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              data-testid="delete-confirm-cancel"
              className="btn-secondary-lift press-feedback w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
            >
              {t('confirm.deleteAccount.cancelCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
