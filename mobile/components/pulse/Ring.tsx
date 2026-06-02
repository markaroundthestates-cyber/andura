// ══ PULSE · RING (RN port) — circular progress SVG ════════════════════════
// RN twin of src/react/components/pulse/Ring.tsx via react-native-svg. Faint
// full-circle track + foreground arc whose strokeDasharray fills to `pct`. The
// arc animates (1.1s ease) whenever pct changes via Reanimated (the web used a
// CSS transition on stroke-dasharray). gradId="pulse" swaps the solid stroke
// for the volt→aqua linear gradient. Same props + testIDs (pulse-ring /
// -track / -arc). The <svg> is decorative; semantics live in `children`.
//
// FIDELITY FLAG: the web arc carries a `drop-shadow` glow (filter). RN SVG has
// no drop-shadow filter, so the glow is approximated with a wider, faint
// under-arc of the same color (glowToken @ low alpha). Subtle vs the web's
// blurred halo — see UI-kit FLAGS. Reduced motion freezes the fill at target.

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { dark, withAlpha } from '../../lib/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const PULSE_GRAD_ID = 'pulse-ring-grad';

interface RingProps {
  size?: number;
  stroke?: number;
  /** Progress 0-100 (clamped). */
  pct?: number;
  /** Arc color when no gradient. Defaults to the primary accent. */
  color?: string;
  /** Track (background ring) color. */
  track?: string;
  /** Centered overlay content. */
  children?: ReactNode;
  /** Soft glow under-arc (default true). */
  glow?: boolean;
  /** Pass "pulse" to stroke the arc with the volt→aqua gradient. */
  gradId?: 'pulse';
}

export function Ring({
  size = 132,
  stroke = 10,
  pct = 0,
  color = dark.brick,
  track = dark.line,
  children,
  glow = true,
  gradId,
}: RingProps) {
  const reduced = useReducedMotion();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, pct / 100));
  const targetDash = circumference * clamped;
  const useGrad = gradId === 'pulse';
  const arcColor = useGrad ? `url(#${PULSE_GRAD_ID})` : color;
  const glowToken = useGrad ? dark.aquaInk : color;

  const dash = useSharedValue(targetDash);
  useEffect(() => {
    dash.value = reduced
      ? targetDash
      : withTiming(targetDash, { duration: 1100, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [targetDash, reduced, dash]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [dash.value, circumference],
  }));

  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
        testID="pulse-ring"
      >
        {useGrad && (
          <Defs>
            <LinearGradient id={PULSE_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={dark.olive} />
              <Stop offset="100%" stopColor={dark.aquaInk} />
            </LinearGradient>
          </Defs>
        )}
        <Circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
          testID="pulse-ring-track"
        />
        {glow && (
          // Glow approximation (no RN SVG drop-shadow): faint wider under-arc.
          <AnimatedCircle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={withAlpha(glowToken, 0.45)}
            strokeWidth={stroke + 4}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        )}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          animatedProps={animatedProps}
          testID="pulse-ring-arc"
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
