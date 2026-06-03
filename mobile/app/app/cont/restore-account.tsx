// ══ RESTORE ACCOUNT (RN port, W6b) ═══════════════════════════════════════
// RN twin of src/react/routes/screens/cont/RestoreAccount.tsx. §56.5.2 soft-
// delete 30-day grace choice shown on sign-in when a deletion marker exists
// (appStore.pendingDeletionRestore). ALL logic verbatim: handleRestore (clear
// marker → re-hydrate retained cloud → resume), handleDeleteNow (hard cloud
// purge + local wipe + sign-out), handleBack (sign out, keep the marker). The
// __suppressFirebaseSync writes route through kv (W1b) like web. Distinct 2/1
// button layout (restore hidden when expired) → built on the Card scaffold,
// NOT the shared ConfirmScreen.
//
// The wipe ends with a full Tier-0 namespace clear via `kv.clearAll()`
// (localStorage.clear() on web, MMKV clearAll() on native — CR-03), so the
// hard-delete-now path leaves no Tier-0 residue on the device (GDPR Art. 17).

import { View, Text, Pressable, ScrollView } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
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
import { signOut as authSignOut, getAuthState } from '../../../../src/auth.js';
import { clearDeletionMarker, hardDeleteCloudUser } from '../../../../src/react/lib/accountDeletion';
import { hydrateStoresFromCloud } from '../../../../src/react/lib/storeSync';
import { initFirebaseSync } from '../../../../src/firebase.js';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Card } from '../../../components/cont/fields';
import { gotoReplace } from '../../../lib/nav';
import { dark, accent, withAlpha } from '../../../lib/tokens';

// Upper bound on the awaited cloud op (verbatim from web).
const CLOUD_OP_TIMEOUT_MS = 8000;

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
    // Full Tier-0 namespace clear (GDPR Art. 17) via the kv adapter — wipes the
    // WHOLE keyspace on every platform: localStorage.clear() on web, MMKV
    // clearAll() on native (CR-03). Previously native was typeof-guarded → MMKV
    // survived the hard-delete-now path.
    kv.clearAll();
    // RN consistency (W1a) — suppress marker via kv (MMKV on native; firebase.js
    // READS it via kv). Set AFTER the clear so it survives the wipe. Web stays
    // localStorage.
    kv.setItem('__suppressFirebaseSyncUntil', String(Date.now() + 10000));
  } catch (e) {
    logger.warn('[RestoreAccount] wipe failed:', e);
  }
}

async function wipeLocalDeviceDB(uid: string): Promise<void> {
  try {
    const dbModule = await import('../../../../src/storage/db');
    await dbModule.wipeUserDB(uid);
  } catch (e) {
    logger.warn('[RestoreAccount] Tier 1 IDB wipe failed:', e);
  }
}

export default function RestoreAccount() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setPendingDeletionRestore = useAppStore((s) => s.setPendingDeletionRestore);
  const pending = useAppStore((s) => s.pendingDeletionRestore);

  const expired = pending?.expired === true;

  async function handleRestore(): Promise<void> {
    await Promise.race([
      clearDeletionMarker(),
      new Promise<void>((resolve) => setTimeout(resolve, CLOUD_OP_TIMEOUT_MS)),
    ]);
    try {
      await Promise.race([
        (async () => { await initFirebaseSync(); await hydrateStoresFromCloud(); })(),
        new Promise<void>((resolve) => setTimeout(resolve, CLOUD_OP_TIMEOUT_MS)),
      ]);
    } catch (e) {
      logger.warn('[RestoreAccount] restore hydrate failed:', e);
    }
    setPendingDeletionRestore(null);
    gotoReplace('antrenor');
  }

  function handleBack(): void {
    setPendingDeletionRestore(null);
    authSignOut();
    setAuthenticated(false);
    gotoReplace('auth');
  }

  async function handleDeleteNow(): Promise<void> {
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
    if (typeof window !== 'undefined') {
      (window as { _suppressFirebaseSync?: boolean })._suppressFirebaseSync = true;
    }
    wipeAllLocalData();
    setPendingDeletionRestore(null);
    authSignOut();
    setAuthenticated(false);
    gotoReplace('auth');
  }

  return (
    <View testID="restore-account" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('confirm.restoreAccount.title')}
        onBack={handleBack}
        testIdBack="restore-account-back"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' }}
      >
        <Card style={{ width: '100%', maxWidth: 384, marginTop: 8, padding: 24, alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              backgroundColor: withAlpha(accent.volt, 0.14),
              borderWidth: 1,
              borderColor: withAlpha(accent.volt, 0.3),
            }}
          >
            <RotateCcw size={28} color={dark.brick} />
          </View>

          <Text
            className="font-display"
            style={{ fontSize: 24, fontWeight: '600', color: dark.ink, marginBottom: 12, textAlign: 'center' }}
          >
            {t('confirm.restoreAccount.heading')}
          </Text>
          <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 8, textAlign: 'center' }}>
            {expired ? t('confirm.restoreAccount.bodyExpired') : t('confirm.restoreAccount.body')}
          </Text>

          <View style={{ width: '100%', marginTop: 32, gap: 12 }}>
            {!expired && (
              <Pressable
                testID="restore-account-restore"
                accessibilityRole="button"
                onPress={() => { void handleRestore(); }}
                style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 999, backgroundColor: accent.volt }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
                  {t('confirm.restoreAccount.restoreCta')}
                </Text>
              </Pressable>
            )}
            <Pressable
              testID="restore-account-delete-now"
              accessibilityRole="button"
              onPress={() => { void handleDeleteNow(); }}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: dark.line,
                backgroundColor: dark.paper2,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: dark.brickDark }}>
                {t('confirm.restoreAccount.deleteNowCta')}
              </Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
