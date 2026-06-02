// ══ RESET DATA CONFIRM (RN port, W6b) ════════════════════════════════════
// RN twin of src/react/routes/screens/cont/ResetDataConfirm.tsx. A2 H-1: wipes
// ALL user DATA across tiers (Tier 0 local + Tier 1 IDB + Tier 2 RTDB synced
// keys); ACCOUNT + session stay (reset = fresh start, user stays logged in).
// Logic + i18n keys + testIDs verbatim; markup → ConfirmScreen. Web's `bg-danger`
// accept → danger variant. Confirm navigate('/') → gotoReplace('splash').

import { RotateCcw } from 'lucide-react-native';
import { logger } from '../../../../src/util/logger.js';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { useNutritionStore } from '../../../../src/react/stores/nutritionStore';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import { useScheduleStore } from '../../../../src/react/stores/scheduleStore';
import { useProgresStore } from '../../../../src/react/stores/progresStore';
import { useAerobicStore } from '../../../../src/react/stores/aerobicStore';
import { useCoachStore } from '../../../../src/react/stores/coachStore';
import {
  clearUserDataKeys,
  clearUserIndexedDB,
  clearUserCloudData,
} from '../../../../src/util/dataReset.js';
import { toast } from '../../../../src/react/lib/toast';
import { t } from '../../../../src/i18n/index.js';
import { ConfirmScreen } from '../../../components/cont/ConfirmScreen';
import { goto, gotoReplace } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

// A2 H-1 — verbatim from web. In-memory Zustand resets so the UI reflects empty
// state immediately, then the authoritative localStorage wipe (clearUserDataKeys
// preserves session + device-id + theme) + IndexedDB Tier 1 best-effort.
function wipeAllLocalData(): void {
  try {
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    useProgresStore.getState().reset();
    useAerobicStore.getState().reset();
    useCoachStore.setState({ schedContext: 'workout', persona: 'gigica', reactivateDismissed: false });
    clearUserDataKeys();
    void clearUserIndexedDB();
  } catch (e) {
    logger.warn('[ResetDataConfirm] wipe failed:', e);
  }
}

export default function ResetDataConfirm() {
  function handleConfirm(): void {
    wipeAllLocalData();
    // Tier 2 cloud DELETE — surface a toast on failure (so a silent cloud-wipe
    // failure that would resurrect on next boot is reported). Verbatim from web.
    void clearUserCloudData().then((cloud) => {
      if (!cloud.ok) {
        toast.show({ message: t('confirm.resetData.cloudFailed'), variant: 'error' });
      }
    });
    gotoReplace('splash');
  }

  function handleCancel(): void {
    goto('settings-danger');
  }

  return (
    <ConfirmScreen
      testID="reset-data-confirm"
      title={t('confirm.resetData.title')}
      backTestID="reset-confirm-back"
      onCancel={handleCancel}
      icon={<RotateCcw size={28} color={dark.ink} />}
      heading={t('confirm.resetData.heading')}
      body={[t('confirm.resetData.body1'), t('confirm.resetData.body2')]}
      acceptLabel={t('confirm.resetData.acceptCta')}
      acceptTestID="reset-confirm-accept"
      acceptVariant="danger"
      onAccept={handleConfirm}
      cancelLabel={t('confirm.resetData.cancelCta')}
      cancelTestID="reset-confirm-cancel"
    />
  );
}
