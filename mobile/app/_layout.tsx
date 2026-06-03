// ══ ROOT LAYOUT (expo-router) — Wave 2 nav shell ═══════════════════════════
// Mirrors the PWA route tree (src/react/routes/router.tsx). Top-level screens
// (Splash / Auth / AuthCallback / Onboarding / Terms / Privacy / NotFound) sit
// here, OUTSIDE the bottom-nav shell — exactly like the web's TopLevelRoute. The
// authenticated 4-tab app lives under the `app/` segment (app/app/_layout.tsx),
// which carries the ProtectedRoute + onboarding + soft-delete + gym-only guards.
//
// This layout also: imports the NativeWind global stylesheet (compiled by Metro)
// and kicks off the Pulse font load (scaffolded — see lib/fonts.ts; .ttf files
// flagged missing, app does not block).

import '../global.css';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { pulseFontMap } from '../lib/fonts';
import { ToastViewport } from '../components/Toast';
import { runLaunchUpdateCheck } from '../lib/updates';
import { useTheme, useThemeColorSchemeSync } from '../lib/theme';

export default function RootLayout() {
  // Empty map (fonts flagged missing) resolves instantly → never blocks render.
  useFonts(pulseFontMap());

  // Keep NativeWind's runtime colorScheme in lockstep with the stored theme so
  // `dark:` utilities + the token hook flip together (the web CSS cascade twin).
  useThemeColorSchemeSync();
  const { colors, isDark } = useTheme();

  // Launch-time OTA auto-check (§D102): silent, fire-and-forget, applies only
  // when no active session. No-op on web / Expo Go / until EAS Update is set up.
  useEffect(() => {
    runLaunchUpdateCheck();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
      <ToastViewport />
    </SafeAreaProvider>
  );
}
