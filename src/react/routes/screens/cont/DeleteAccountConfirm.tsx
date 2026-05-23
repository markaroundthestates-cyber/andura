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
import { isAuthFresh, signOut as authSignOut, getAuthState, getIdToken } from '../../../../auth.js';
import { gotoPath } from '../../../lib/navigation';

function wipeAllLocalData(): void {
  try {
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wv2-')) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
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

  function handleConfirm(): void {
    // §A016 — destructive action gate: require recent re-auth.
    if (!isAuthFresh()) {
      authSignOut();
      setAuthenticated(false);
      navigate('/auth?reason=reauth_required_for_delete');
      return;
    }
    // §B039/D-6 — GDPR Art. 17 strict erasure Tier 0 + Tier 1 + Tier 2.
    const authState = getAuthState();
    wipeAllLocalData();
    if (authState?.uid) {
      void wipeRemoteData(authState.uid);
    }
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
        title="Sterge contul"
        onBack={handleCancel}
        testIdBack="delete-confirm-back"
        danger
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-brick/10 border border-brick/30 flex items-center justify-center mb-5">
          <Trash2 className="w-7 h-7 text-brick" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Atentie</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Toate datele tale (locale + remote) vor fi sterse imediat.
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Aceasta actiune <strong>nu poate fi anulata</strong>. Nu vei mai
          putea recupera datele dupa confirmare.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="delete-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            Sterge contul definitiv
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="delete-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
