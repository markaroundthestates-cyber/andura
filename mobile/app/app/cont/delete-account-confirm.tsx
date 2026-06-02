// ══ DELETE ACCOUNT CONFIRM (RN port, W6b) ════════════════════════════════
// RN twin of src/react/routes/screens/cont/DeleteAccountConfirm.tsx. §56.5.2
// soft-delete (30-day grace): writes the cloud deletionRequestedAt MARKER, wipes
// LOCAL (Tier 0 + Tier 1 IDB), signs out; the cloud copy is retained for the
// restore window (RestoreAccount handles the choice on next sign-in). §A016
// freshness gate + §A007 token clear + token/suppress ORDERING preserved
// VERBATIM (await marker+IDB BEFORE authSignOut; suppress flag after marker).
// The __suppressFirebaseSync writes route through kv (W1b) exactly like web.
//
// FLAG (foundation, not screen scope): the web wipe ends with
// `localStorage.clear()`. On native there is no localStorage, so the call is
// typeof-guarded; the authoritative native Tier-0 clear (MMKV clearAll) is NOT
// invoked here because src/util/dataReset.js + the MMKV instance are not yet
// native-routed for a FULL flush — see report "file-I/O / native gaps".

import { useState } from 'react';
import { Trash2 } from 'lucide-react-native';
import { logger } from '../../../../src/util/logger.js';
import { kv } from '../../../../src/storage/kv';
import { useAppStore } from '../../../../src/react/stores/appStore';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { useNutritionStore } from '../../../../src/react/stores/nutritionStore';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import { useScheduleStore } from '../../../../src/react/stores/scheduleStore';
import { useAerobicStore } from '../../../../src/react/stores/aerobicStore';
import { useCoachStore } from '../../../../src/react/stores/coachStore';
import { isAuthFresh, signOut as authSignOut, getAuthState } from '../../../../src/auth.js';
import { markAccountForDeletion } from '../../../../src/react/lib/accountDeletion';
import { t } from '../../../../src/i18n/index.js';
import { ConfirmScreen } from '../../../components/cont/ConfirmScreen';
import { gotoReplace } from '../../../lib/nav';

// global.css dark --danger (Pulse ember-red).
const DANGER = '#ff7d6a';

// §56.5.2 — upper bound on the awaited cloud marker WRITE (verbatim from web).
const REMOTE_MARK_TIMEOUT_MS = 8000;

function wipeAllLocalData(): void {
  try {
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    useAerobicStore.getState().reset();
    useCoachStore.setState({ schedContext: 'workout', persona: 'gigica', reactivateDismissed: false });
    // S-01 — full namespace clear (GDPR Art. 17). Web: localStorage.clear().
    // Native has no localStorage → guard it (the MMKV full-flush is a foundation
    // follow-up; the in-memory resets above already clear the live UI state).
    if (typeof localStorage !== 'undefined') localStorage.clear();
    // RE-S-02 — persist the sync-suppression window ACROSS the clear. Routed via
    // kv (MMKV on native; firebase.js READS it via kv). Set AFTER the clear so a
    // stale syncToFirebase cannot recreate users/{uid} on the next boot.
    kv.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
  } catch (e) {
    logger.warn('[DeleteAccountConfirm] wipe failed:', e);
  }
}

async function wipeLocalDeviceDB(uid: string): Promise<void> {
  try {
    const dbModule = await import('../../../../src/storage/db.js');
    await dbModule.wipeUserDB(uid);
  } catch (e) {
    logger.warn('[DeleteAccountConfirm] Tier 1 IDB wipe failed:', e);
  }
}

export default function DeleteAccountConfirm() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  // RN has no URL query (web navigate('/auth?reason=...')); the reason is a
  // diagnostic hint only — the auth screen behavior is identical. We keep the
  // happy path 1:1 and drop the query on the re-auth branch (still routes /auth).
  const [, setBusy] = useState(false);

  async function handleConfirm(): Promise<void> {
    setBusy(true);
    // §A016 — destructive action gate: require recent re-auth.
    if (!isAuthFresh()) {
      authSignOut();
      setAuthenticated(false);
      gotoReplace('auth');
      return;
    }
    // §56.5.2 — AWAIT the marker write + Tier 1 IDB wipe (still-valid token)
    // BEFORE authSignOut(); timeout-capped so a hung network can't trap the user.
    const authState = getAuthState();
    if (authState?.uid) {
      await Promise.race([
        (async () => {
          await markAccountForDeletion();
          await wipeLocalDeviceDB(authState.uid);
        })(),
        new Promise<void>((resolve) => setTimeout(resolve, REMOTE_MARK_TIMEOUT_MS)),
      ]);
    }
    // Suppress AFTER the marker write (fbPatchUserChild early-returns when set),
    // before the local wipe (DB.set debounce can't push a stale tree). firebase.js
    // reads the in-memory flag off `window` (RN polyfills global.window) AND the
    // persisted kv marker set in wipeAllLocalData — set both, like web.
    if (typeof window !== 'undefined') {
      (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync = true;
    }
    wipeAllLocalData();
    authSignOut();
    setAuthenticated(false);
    gotoReplace('auth');
  }

  function handleCancel(): void {
    gotoReplace('settings-danger');
  }

  return (
    <ConfirmScreen
      testID="delete-account-confirm"
      title={t('confirm.deleteAccount.title')}
      backTestID="delete-confirm-back"
      onCancel={handleCancel}
      dangerHeader
      icon={<Trash2 size={28} color={DANGER} />}
      dangerDisc
      heading={t('confirm.deleteAccount.heading')}
      body={[t('confirm.deleteAccount.body1'), t('confirm.deleteAccount.body2')]}
      acceptLabel={t('confirm.deleteAccount.acceptCta')}
      acceptTestID="delete-confirm-accept"
      acceptVariant="danger"
      onAccept={() => { void handleConfirm(); }}
      cancelLabel={t('confirm.deleteAccount.cancelCta')}
      cancelTestID="delete-confirm-cancel"
    />
  );
}
