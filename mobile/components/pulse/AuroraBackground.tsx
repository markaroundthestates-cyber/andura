// ══ PULSE · AURORA BACKGROUND (RN port) — ambient backdrop ════════════════
// RN twin of src/react/components/pulse/AuroraBackground.tsx — the signature
// Pulse ambient layer mounted ONCE behind authenticated routes. Same role:
// drifting accent blobs (volt/aqua/ember/violet) under a readability scrim +
// edge vignette. Same testID (pulse-aurora). aria-hidden → not exposed to AT.
//
// FIDELITY FLAG (Skia-gated): the web layer relies on three things RN's view
// system CANNOT reproduce — `filter: blur(52px)` on a gradient view,
// `mix-blend-mode: screen/multiply`, and conic-gradient beams. expo-linear-
// gradient draws crisp linear gradients only; RN Views have no blur or blend.
// This port approximates the look with large, soft, low-opacity radial-style
// gradient blobs (alpha falloff stands in for blur) that DRIFT via Reanimated
// translate (the only live animation on the web too, post the 2026-06-01
// compositor-safety fix) + a static scrim + vignette. For pixel-faithful
// blurred + screen-blended aurora, @shopify/react-native-skia is required —
// that is a heavy native module, so adding it is Daniel-gated (see FLAGS in the
// wave report). Reduced motion freezes the drift (vestibular safety).

import { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { accent, dark, withAlpha } from '../../lib/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface BlobSpec {
  color: string;
  opacity: number;
  size: number; // fraction of the larger screen dimension
  top?: number; // fraction of screen height
  left?: number;
  bottom?: number;
  right?: number;
  dx: number; // drift in px
  dy: number;
  durationMs: number;
}

const BLOBS: readonly BlobSpec[] = [
  { color: accent.volt, opacity: 0.7, size: 0.72, top: -0.18, left: -0.18, dx: 90, dy: 70, durationMs: 9000 },
  { color: accent.aqua, opacity: 0.62, size: 0.82, bottom: -0.22, right: -0.2, dx: -96, dy: -64, durationMs: 11000 },
  { color: accent.ember, opacity: 0.4, size: 0.6, top: 0.24, left: 0.26, dx: 70, dy: -84, durationMs: 8000 },
  { color: accent.violet, opacity: 0.4, size: 0.55, top: -0.1, right: -0.1, dx: -78, dy: 84, durationMs: 10500 },
  { color: accent.aqua, opacity: 0.42, size: 0.58, bottom: -0.12, left: -0.08, dx: 84, dy: -58, durationMs: 7500 },
];

function Blob({ spec, reduced }: { spec: BlobSpec; reduced: boolean }) {
  const { width, height } = useWindowDimensions();
  const base = Math.max(width, height);
  const dim = base * spec.size;
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration: spec.durationMs, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [reduced, spec.durationMs, t]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: t.value * spec.dx }, { translateY: t.value * spec.dy }],
  }));

  const pos: Record<string, number> = {};
  if (spec.top !== undefined) pos.top = spec.top * height;
  if (spec.bottom !== undefined) pos.bottom = spec.bottom * height;
  if (spec.left !== undefined) pos.left = spec.left * width;
  if (spec.right !== undefined) pos.right = spec.right * width;

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: dim, height: dim, ...pos }, style]}
    >
      {/* Radial-ish soft falloff via a centered translucent disc. expo-linear-
          gradient is linear-only; a low-alpha solid disc with a large border
          radius reads as a soft glow at this scale (blur stand-in). */}
      <View
        style={{
          flex: 1,
          borderRadius: dim / 2,
          backgroundColor: withAlpha(spec.color, spec.opacity * 0.5),
        }}
      />
    </Animated.View>
  );
}

export function AuroraBackground() {
  const reduced = useReducedMotion();

  return (
    <View
      testID="pulse-aurora"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: dark.paper2, overflow: 'hidden' }]}
    >
      {BLOBS.map((spec, i) => (
        <Blob key={i} spec={spec} reduced={reduced} />
      ))}

      {/* Readability scrim — faint outer paper feather (transparent core). */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', withAlpha(dark.paper, 0.26)]}
        style={StyleSheet.absoluteFill}
      />
      {/* Edge vignette — frames the aurora without darkening the center. */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.45)']}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
