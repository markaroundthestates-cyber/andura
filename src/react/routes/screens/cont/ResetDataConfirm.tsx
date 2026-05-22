// ══ RESET DATA CONFIRM — D047 RIP-OUT drill-down screen ════════════════
// Per mockup andura-clasic.html paradigm — confirm-page sub-page.
// Wipes Tier 0 local data only; cont stays (NU touches Firebase/Tier 1+2).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { SubHeader } from '../../../components/SubHeader';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
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

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center text-center">
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
            className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
          >
            Reseteaza datele
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="reset-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-xl text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
