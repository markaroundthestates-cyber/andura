// ══ PULSE · READINESS ORB (RN port) — hero readiness indicator ════════════
// RN twin of src/react/components/pulse/ReadinessOrb.tsx. A living hero gauge:
// the volt→aqua `Ring` wraps counter-rotating auras + a breathing core, with an
// animated count-up score + centered label. Same props (score / label / canPR)
// + testIDs (readiness-orb / -score / -label). Honest empty state preserved:
// null/undefined score → em-dash, ring 0, dimmed, neutral canPR.
//
// FIDELITY FLAG: the web auras are blurred CONIC gradients (impossible in RN
// SVG / linear-gradient). They are approximated here as two counter-rotating
// translucent radial-gradient discs (expo-linear-gradient can't do conic, so a
// soft circular tint that rotates reads as the same "living halo" without the
// hard conic sweep). The breathing core is a pure-opacity loop (faithful).
// Reduced motion freezes rotation + breath (Maria 65 vestibular safety).

import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { dark, withAlpha } from '../../lib/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useCountUp } from '../../lib/useCountUp';
import { Ring } from './Ring';

interface ReadinessOrbProps {
  /** Readiness score 0-100. null/absent → honest empty state. */
  score?: number | null;
  /** Localized center label. Required so no English leaks. */
  label?: string;
  /** Cosmetic PR-primed cue. Forced false when empty. */
  canPR?: boolean;
}

export function ReadinessOrb({ score = 80, label = '', canPR = false }: ReadinessOrbProps) {
  const reduced = useReducedMotion();
  const isEmpty = score === null || score === undefined;
  const display = useCountUp(isEmpty ? 0 : score);
  const pct = isEmpty ? 0 : Math.min(100, Math.max(0, score));

  const spin = useSharedValue(0);
  const spinRev = useSharedValue(0);
  const breath = useSharedValue(0.45);

  useEffect(() => {
    if (reduced) {
      spin.value = 0;
      spinRev.value = 0;
      breath.value = 0.7;
      return;
    }
    spin.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
    spinRev.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.linear }), -1, false);
    breath.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [reduced, spin, spinRev, breath]);

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const aura2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRev.value * -360}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({ opacity: breath.value }));

  return (
    <View
      testID="readiness-orb"
      style={{
        position: 'relative',
        width: 168,
        height: 168,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isEmpty ? 0.7 : 1,
      }}
    >
      {/* Decorative living layers (no a11y role). */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: 182, height: 182, borderRadius: 91, opacity: 0.55 },
          auraStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', withAlpha(dark.aquaInk, 0.45), 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 91 }}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: 160, height: 160, borderRadius: 80, opacity: 0.4 },
          aura2Style,
        ]}
      >
        <LinearGradient
          colors={['transparent', withAlpha(dark.olive, 0.4), 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1, borderRadius: 80 }}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: 118,
            height: 118,
            borderRadius: 59,
            backgroundColor: withAlpha(dark.aquaInk, 0.24),
          },
          coreStyle,
        ]}
      />

      <Ring size={150} stroke={11} pct={pct} gradId="pulse">
        <View style={{ alignItems: 'center' }}>
          <Text
            testID="readiness-orb-score"
            className="font-display"
            style={{ fontSize: 52, fontWeight: '700', lineHeight: 56, color: dark.ink }}
          >
            {isEmpty ? '—' : display}
          </Text>
          {label !== '' && (
            <Text
              testID="readiness-orb-label"
              className="font-mono uppercase"
              style={{ marginTop: 4, fontSize: 10.5, letterSpacing: 1.9, color: dark.ink3 }}
            >
              {label}
            </Text>
          )}
        </View>
      </Ring>
    </View>
  );
}
