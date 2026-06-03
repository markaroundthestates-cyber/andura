// ══ AUTHENTICATED SHELL (route prefix '/app') — guards + BottomNav ═════════
// RN twin of the PWA's /app branch: ProtectedRoute + Layout (src/react/routes/
// ProtectedRoute.tsx + Layout.tsx). The guards read the EXISTING web stores
// (src/react/stores/*) — auth logic is NOT reimplemented here. Guard order
// matches ProtectedRoute exactly:
//   1. not authenticated (+ not skip-auth)        → /auth
//   2. pendingDeletionRestore (soft-delete grace)  → /app/cont/restore-account
//   3. onboarding not completed                    → /onboarding/1
// Children render inside a Slot with the persistent BottomNav below — the web's
// 4-tab Layout shell. (The GymOnlyRoute gate lives on the workout route itself —
// app/app/antrenor/workout.tsx — mirroring router.tsx L175.)
//
// NOTE: the zustand `persist` stores read/write through the shared `kv` adapter
// (kv.native.js → MMKV on device, localStorage on web), so the guards read live
// persisted state on both native and web export — no AsyncStorage wiring needed.

import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Slot, usePathname } from 'expo-router';
import { useAppStore } from '../../../src/react/stores/appStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { isAuthenticated as readAuthFromStorage } from '../../../src/auth.js';
import { BottomNav } from '../../components/BottomNav';
import { useTheme } from '../../lib/theme';

export default function AppShellLayout() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isSkipAuth = useAppStore((s) => s.isSkipAuth);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const pendingDeletionRestore = useAppStore((s) => s.pendingDeletionRestore);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const pathname = usePathname();
  const { colors } = useTheme();

  // Mirror ProtectedRoute's mount sync: if storage already carries a valid
  // token (Magic Link landed prior session) reflect it into the store. Native
  // cross-tab `storage`/visibility listeners are web-only, so omitted here.
  useEffect(() => {
    if (readAuthFromStorage() && !isAuthenticated) setAuthenticated(true);
  }, [isAuthenticated, setAuthenticated]);

  // 1. Auth gate — anon (no token, not skip-auth) → /auth.
  const passesAuthGate = isAuthenticated || isSkipAuth || readAuthFromStorage();
  if (!passesAuthGate) return <Redirect href="/auth" />;

  // 2. Soft-delete grace — returning pending-deletion user → restore choice.
  //    Guard the self-redirect loop (the restore screen lives under /app/cont).
  if (pendingDeletionRestore && pathname !== '/app/cont/restore-account') {
    return <Redirect href="/app/cont/restore-account" />;
  }

  // 3. Onboarding gate — authenticated but onboarding incomplete → step 1.
  if (!onboardingCompleted) return <Redirect href="/onboarding/1" />;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-paper" style={{ backgroundColor: colors.paper }}>
      <View className="flex-1">
        <Slot />
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}
