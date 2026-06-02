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

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { dark } from '../lib/tokens';
import { pulseFontMap } from '../lib/fonts';

export default function RootLayout() {
  // Empty map (fonts flagged missing) resolves instantly → never blocks render.
  useFonts(pulseFontMap());

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: dark.paper },
        }}
      />
    </SafeAreaProvider>
  );
}
