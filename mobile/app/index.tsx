// ══ SPLASH (route '/') — top-level, no bottom nav (web router.tsx L151) ════
// RN twin of src/react/routes/screens/Splash.tsx. Pulse auto-advancing landing:
// an animated PulseMark + a volt->aqua "Andura" wordmark + the two-line tagline
// + a 3-dot loader + the trust footer. It AUTO-ADVANCES after ~2.6s and is
// tap-to-skip; on advance it routes via the EXISTING isAuthenticated logic
// (-> /app/antrenor authenticated, else /auth). The brain is preserved verbatim:
// readAuthFromStorage() + isSkipAuth decide the target; the advancedRef guard
// stops the timer + a tap from both firing navigate. Same testIDs (splash,
// splash-trust-footer); markup -> View/Text/Pressable.
//
// FIDELITY FLAG: the web wordmark used a CSS gradient-clip text fill (volt->aqua)
// — RN has no background-clip:text, so the wordmark renders in the primary accent
// (dark.brick = Pulse volt). A true gradient wordmark needs MaskedView/Skia,
// queued for the design-polish pass. The splash-dots float loop is reproduced
// with Reanimated (reduced-motion settles them static).

import { useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAppStore } from '../../src/react/stores/appStore';
import { isAuthenticated as readAuthFromStorage } from '../../src/auth.js';
import { PulseMark } from '../components/pulse/PulseMark';
import { dark, accent } from '../lib/tokens';
import { useReducedMotion } from '../lib/useReducedMotion';
import { t } from '../../src/i18n/index.js';

// Auto-advance delay — matches the web's 2600ms (long enough for the logo draw +
// wordmark rise to read, short enough to not feel like a wait).
const ADVANCE_MS = 2600;

const DOT_COLORS = [accent.volt, accent.aqua, accent.ember] as const;

export default function Splash(): React.JSX.Element {
  // §01.009 audit fix parity — a returning user's session is the stored Firebase
  // token (readAuthFromStorage), NOT appStore.isAuthenticated (session-scope,
  // not persisted). Splash sits ABOVE the auth gate, so read the real token
  // (same source-of-truth as the shell guard); isSkipAuth keeps the test-drive
  // returner in too.
  const isSkipAuth = useAppStore((s) => s.isSkipAuth);
  const hasSession = readAuthFromStorage() || isSkipAuth;

  // Guard so the auto-advance timer and a manual tap can't both fire navigate.
  const advancedRef = useRef(false);
  const advance = (): void => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    router.replace(hasSession ? '/app/antrenor' : '/auth');
  };

  useEffect(() => {
    const id = setTimeout(advance, ADVANCE_MS);
    return () => clearTimeout(id);
    // advance closes over hasSession (read once at mount); stable for the splash
    // lifetime. Empty deps = one timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-paper" style={{ backgroundColor: dark.paper }}>
      <Pressable
        onPress={advance}
        accessibilityRole="button"
        accessibilityLabel={t('splash.appName')}
        testID="splash"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 28 }}
      >
        <PulseMark size={96} />

        {/* Gradient "Andura" wordmark — see FIDELITY FLAG (renders in accent). */}
        <Text
          className="font-display"
          style={{ color: dark.brick, fontSize: 42, fontWeight: '700', lineHeight: 44, letterSpacing: 5, textAlign: 'center' }}
        >
          {t('splash.appName')}
        </Text>

        {/* Tagline — mono eyebrow per the web tone (two-line keys, i18n parity). */}
        <Text
          className="font-mono uppercase text-ink3"
          style={{ fontSize: 11, letterSpacing: 2.4, lineHeight: 18, textAlign: 'center' }}
        >
          {t('splash.taglineLine1')} {t('splash.taglineLine2')}
        </Text>

        {/* 3-dot loader — volt / aqua / ember floaters (decorative). */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', gap: 7, marginTop: 20 }}
        >
          {DOT_COLORS.map((color, i) => (
            <SplashDot key={i} color={color} index={i} />
          ))}
        </View>

        <Text
          testID="splash-trust-footer"
          className="text-ink3"
          style={{ marginTop: 24, fontSize: 11, lineHeight: 18, textAlign: 'center' }}
        >
          {t('splash.trustFooter')}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

// splash-dot float (web @keyframes splashDotFloat) — staggered translateY +
// opacity loop via Reanimated. Reduced motion settles the dot static at .8.
function SplashDot({ color, index }: { color: string; index: number }): React.JSX.Element {
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    phase.value = withDelay(
      index * 150,
      withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [reduced, index, phase]);

  const style = useAnimatedStyle(() => {
    if (reduced) return { transform: [{ translateY: 0 }], opacity: 0.8 };
    return {
      transform: [{ translateY: -5 * phase.value }],
      opacity: 0.55 + 0.45 * phase.value,
    };
  });

  return (
    <Animated.View style={[{ width: 7, height: 7, borderRadius: 9999, backgroundColor: color }, style]} />
  );
}
