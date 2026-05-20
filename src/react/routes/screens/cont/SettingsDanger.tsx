// ══ SETTINGS DANGER — Phase 6 task_17 Cont Sub-Screen ════════════════════
// Delete account + Reset all data + Logout. Cascade destructive actions
// behind confirm steps. ZERO server-side delete V1 (Phase 7+ Firebase
// wipe + Tier 1/2 server-side erasure when auth/account scheme defined).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore } from '../../../stores/appStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { gotoPath } from '../../../lib/navigation';
import { ConfirmModal } from '../../../components/ConfirmModal';

type ConfirmAction = null | 'reset' | 'delete' | 'logout';

function wipeAllLocalData(): void {
  try {
    // Reset all stores (workoutStore.reset preserves history per Phase 4 spec —
    // additional resetStreak + history wipe needed pentru complete erasure).
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    // Wipe Tier 0 wv2-* localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wv2-')) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('[SettingsDanger] wipe failed:', e);
  }
}

export function SettingsDanger(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  function handleLogoutConfirmed(): void {
    setAuthenticated(false);
    setConfirm(null);
    navigate('/auth');
  }

  function handleResetConfirmed(): void {
    wipeAllLocalData();
    setConfirm(null);
    navigate('/');
  }

  function handleDeleteConfirmed(): void {
    wipeAllLocalData();
    setAuthenticated(false);
    setConfirm(null);
    navigate('/auth');
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-danger">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-danger-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Deconectare & stergere</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setConfirm('logout')}
            data-testid="danger-logout"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Iesi din cont</p>
              <p className="text-xs text-ink2">Datele raman pe telefon.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setConfirm('reset')}
            data-testid="danger-reset"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Reseteaza toate datele</p>
              <p className="text-xs text-ink2">Sterge tot din telefon. Cont pastrat.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setConfirm('delete')}
            data-testid="danger-delete"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-brick"
          >
            <Trash2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sterge cont</p>
              <p className="text-xs text-ink2">Datele + cont sterse permanent.</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-ink2 leading-snug">
          Stergerea conturilor remote (Firebase backup) este programata
          Phase 7+. Acum reset/stergere afecteaza doar datele locale.
        </p>
      </div>

      {/* §A004 + §A007 + §A008 audit fix: ConfirmModal shared (3 use sites). */}
      <ConfirmModal
        open={confirm !== null}
        title={confirm === 'logout' ? 'Iesi din cont?' : 'Confirma actiunea'}
        body={
          confirm === 'reset'
            ? 'Toate datele tale locale vor fi sterse. Aceasta actiune nu poate fi anulata.'
            : confirm === 'delete'
            ? 'Datele + contul vor fi sterse. Aceasta actiune nu poate fi anulata.'
            : 'Datele raman pe telefon. Te poti reconecta oricand.'
        }
        confirmCta={
          confirm === 'reset' ? 'Reseteaza' : confirm === 'delete' ? 'Sterge cont' : 'Iesi'
        }
        destructive={confirm !== 'logout'}
        onConfirm={
          confirm === 'reset'
            ? handleResetConfirmed
            : confirm === 'delete'
            ? handleDeleteConfirmed
            : handleLogoutConfirmed
        }
        onCancel={() => setConfirm(null)}
        testIdPrefix="danger-confirm"
      />
    </section>
  );
}
