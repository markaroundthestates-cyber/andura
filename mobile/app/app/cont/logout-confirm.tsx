// ══ LOGOUT CONFIRM (RN port, W6b) ════════════════════════════════════════
// RN twin of src/react/routes/screens/cont/LogoutConfirm.tsx. ALL logic kept
// verbatim: §A007 authSignOut() token clear + H1 shared-device local-wipe
// (in-memory store resets + wipeUserDataOnLogout cloud-safe) + U-14 skip-auth
// reset. Only markup → ConfirmScreen scaffold. i18n keys + testIDs preserved.
// Navigation: web navigate()/gotoPath → the RN nav shim (gotoReplace to /auth,
// goto('settings-danger') for cancel).

import { LogOut } from 'lucide-react-native';
import { useAppStore } from '../../../../src/react/stores/appStore';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { useNutritionStore } from '../../../../src/react/stores/nutritionStore';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import { useScheduleStore } from '../../../../src/react/stores/scheduleStore';
import { useProgresStore } from '../../../../src/react/stores/progresStore';
import { useAerobicStore } from '../../../../src/react/stores/aerobicStore';
import { useCoachStore } from '../../../../src/react/stores/coachStore';
import { signOut as authSignOut } from '../../../../src/auth.js';
import { wipeUserDataOnLogout } from '../../../../src/util/dataReset.js';
import { t } from '../../../../src/i18n/index.js';
import { ConfirmScreen } from '../../../components/cont/ConfirmScreen';
import { goto, gotoReplace } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

// H1 shared-device PII leak fix — verbatim from web. Resets in-memory Zustand so
// the UI shows empty state immediately, then the authoritative localStorage +
// IndexedDB wipe (cloud untouched, A's RTDB backup survives for re-login).
function wipeLocalUserDataOnLogout(): void {
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
    void wipeUserDataOnLogout();
  } catch {
    // Non-fatal — never block the sign-out + navigate on a wipe failure.
  }
}

export default function LogoutConfirm() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setSkipAuth = useAppStore((s) => s.setSkipAuth);

  function handleConfirm(): void {
    authSignOut();
    wipeLocalUserDataOnLogout();
    setAuthenticated(false);
    setSkipAuth(false);
    gotoReplace('auth');
  }

  function handleCancel(): void {
    goto('settings-danger');
  }

  return (
    <ConfirmScreen
      testID="logout-confirm"
      title={t('confirm.logout.title')}
      backTestID="logout-confirm-back"
      onCancel={handleCancel}
      icon={<LogOut size={28} color={dark.ink} />}
      heading={t('confirm.logout.heading')}
      body={[t('confirm.logout.body1'), t('confirm.logout.body2')]}
      acceptLabel={t('confirm.logout.acceptCta')}
      acceptTestID="logout-confirm-accept"
      acceptVariant="danger"
      onAccept={handleConfirm}
      cancelLabel={t('confirm.logout.cancelCta')}
      cancelTestID="logout-confirm-cancel"
    />
  );
}
