// ══ RESET DATA CONFIRM — D047 RIP-OUT drill-down screen ════════════════
// Per mockup andura-clasic.html paradigm — confirm-page sub-page.
// A2 H-1: wipes ALL user DATA across tiers (Tier 0 local + Tier 1 IndexedDB +
// Tier 2 RTDB synced keys); the ACCOUNT + session stay (reset = fresh start,
// user stays logged in — distinct from DeleteAccount which also signs out).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { SubHeader } from '../../../components/SubHeader';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { useProgresStore } from '../../../stores/progresStore';
import { clearUserDataKeys, clearUserIndexedDB, clearUserCloudData } from '../../../../util/dataReset.js';
import { gotoPath } from '../../../lib/navigation';

// A2 H-1 audit fix (data integrity + user trust) — the prior wipe cleared only
// `wv2-*` Zustand stores; ALL engine data is written UNPREFIXED via src/db.js
// (logs / pr-records / pain-cdl / coach-decisions / weights / ...), so the "full
// reset" left that data alive and the "nu poate fi anulata" copy was a lie (PR
// Wall / Istoric / Coach state survived). `clearUserDataKeys` now wipes every
// user-data key (prefixed + unprefixed) + IndexedDB Tier 1, preserving the
// account session (`firebase-*` tokens) + device id + UI theme — reset = fresh
// start, stays logged in (distinct from account delete which signs out).
function wipeAllLocalData(): void {
  try {
    // 1. In-memory Zustand resets so the UI reflects empty state immediately
    //    (without waiting for a reload to re-hydrate from the now-cleared keys).
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    useProgresStore.getState().reset();
    // 2. Authoritative localStorage wipe — wv2-* stores + unprefixed engine keys
    //    + dynamic-prefix keys, preserving session + device-id + theme.
    clearUserDataKeys();
    // 3. IndexedDB Tier 1 (archived logs / CDL / patterns) — best-effort async.
    void clearUserIndexedDB();
    // 4. Tier 2 cloud (Firebase RTDB) — DELETE the synced data keys so a
    //    logged-in reset doesn't merge-resurrect from remote on next boot.
    //    No-op for anonymous (no userPath). Best-effort async, non-fatal.
    void clearUserCloudData();
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[ResetDataConfirm] wipe failed:', e);
  }
}

export function ResetDataConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    wipeAllLocalData();
    navigate('/');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-danger'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="reset-data-confirm">
      <SubHeader
        title="Reseteaza datele"
        onBack={handleCancel}
        testIdBack="reset-confirm-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <RotateCcw className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Resetezi toate datele?</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Toate antrenamentele, evaluarile + masuratorile locale vor fi sterse.
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Contul ramane activ. Aceasta actiune <strong>nu poate fi
          anulata</strong>.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="reset-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            Reseteaza datele
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="reset-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
