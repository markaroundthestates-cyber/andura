// ══ LOGOUT CONFIRM — D047 RIP-OUT drill-down screen (mockup #screen-confirm-logout) ══
// Per mockup andura-clasic.html L2310-2323. Drill-down paradigm Bugatti
// consistency per D047 LOCKED V1 (REVERSE D046 §3.1 mis-interpretation).
//
// §A007 security pattern preserved — authSignOut() clears firebase-* tokens
// pe success path (anti ProtectedRoute revert).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppStore } from '../../../stores/appStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { useProgresStore } from '../../../stores/progresStore';
import { signOut as authSignOut } from '../../../../auth.js';
import { wipeUserDataOnLogout } from '../../../../util/dataReset.js';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

// H1 shared-device PII leak fix — logout previously cleared only the auth
// tokens, leaving ALL Tier-0 user data (logs / weight / body / pain / coach
// state, written UNPREFIXED via src/db.js + the wv2-* stores) on the device. The
// next person to sign in on the same browser saw user A's data, and the
// local-always-wins Firebase merge could push A's data up to B's cloud. We now
// wipe the local user-data on logout (cloud-SAFE — A's RTDB backup survives for
// re-login, matching the "Datele tale raman salvate pe email" reassurance).
function wipeLocalUserDataOnLogout(): void {
  try {
    // 1. In-memory Zustand resets so the UI shows empty state immediately
    //    (no flash of A's data before the reload re-hydrates from cleared keys).
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    useProgresStore.getState().reset();
    // 2. Authoritative localStorage + IndexedDB wipe (cloud untouched).
    void wipeUserDataOnLogout();
  } catch {
    // Non-fatal — never block the sign-out + navigate on a wipe failure.
  }
}

export function LogoutConfirm(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setSkipAuth = useAppStore((s) => s.setSkipAuth);

  function handleConfirm(): void {
    // §A007 audit fix preserved — clear firebase-* tokens before navigate.
    authSignOut();
    // H1 — wipe local user data so the next user on this device starts clean
    // (cloud backup preserved for re-login).
    wipeLocalUserDataOnLogout();
    setAuthenticated(false);
    // U-14 audit fix (AUDIT-2 §U-14 LOW) — also reset skip-auth so a user who
    // entered via "Incearca fara cont" actually exits to /auth. Without this,
    // isSkipAuth (persisted) stayed true → passesAuthGate kept passing and
    // ProtectedRoute let them back in, making logout a no-op for skip-auth.
    setSkipAuth(false);
    navigate('/auth');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-danger'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="logout-confirm">
      <SubHeader
        title={t('confirm.logout.title')}
        onBack={handleCancel}
        testIdBack="logout-confirm-back"
      />

      {/* Pulse reskin (arc #5 2026-05-29) — flat disc + bg-paper2 panel migrated
          to the Pulse glass card language. The centered confirm content sits in
          a .pulse-card pulse-card-glow surface; the icon disc becomes a tinted
          glass pebble. Logic / i18n / testids unchanged. */}
      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="pulse-card pulse-card-glow w-full max-w-sm mt-2 p-6 flex flex-col items-center animate-card-rise">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'var(--surface)', boxShadow: '0 0 24px -8px var(--aqua)' }}
          >
            <LogOut className="w-7 h-7 text-ink" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-ink mb-3">{t('confirm.logout.heading')}</h2>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.logout.body1')}
          </p>
          <p className="text-sm text-ink2 leading-relaxed mb-2">
            {t('confirm.logout.body2')}
          </p>

          <div className="w-full mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              data-testid="logout-confirm-accept"
              className="btn-primary-lift press-feedback w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
            >
              {t('confirm.logout.acceptCta')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              data-testid="logout-confirm-cancel"
              className="btn-secondary-lift press-feedback w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
            >
              {t('confirm.logout.cancelCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
