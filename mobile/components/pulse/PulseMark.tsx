// ══ PULSE · PULSE MARK (RN port) — animated brand logo ════════════════════
// RN twin of src/react/components/pulse/PulseMark.tsx via react-native-svg. A
// faint outer ring + a volt→aqua ECG-style waveform stroke. Same props (size /
// animated) + testIDs (pulse-mark / -wave). `animated={false}` renders the
// static mark (header logo). Decorative (no a11y).
//
// FIDELITY FLAG: the web glow-breath loops a `drop-shadow` filter (no RN SVG
// equivalent) — dropped. The one-shot stroke-draw entrance is preserved via
// Reanimated strokeDashoffset; reduced motion (or animated={false}) settles the
// waveform fully drawn with no loop.

import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
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
import { dark } from '../../lib/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const MARK_GRAD_ID = 'pulse-mark-grad';
const WAVE_D = 'M8 32 H20 L25 18 L33 46 L39 26 L43 36 H56';

interface PulseMarkProps {
  size?: number;
  /** Run the waveform draw entrance (default true). */
  animated?: boolean;
}

export function PulseMark({ size = 64, animated = true }: PulseMarkProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = animated && !reduced;
  const offset = useSharedValue(shouldAnimate ? 120 : 0);

  useEffect(() => {
    offset.value = shouldAnimate
      ? withTiming(0, { duration: 2200, easing: Easing.bezier(0.2, 0.8, 0.2, 1) })
      : 0;
  }, [shouldAnimate, offset]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));

  return (
    <View
      testID="pulse-mark"
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id={MARK_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={dark.olive} />
            <Stop offset="100%" stopColor={dark.aquaInk} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={32}
          cy={32}
          r={29}
          fill="none"
          stroke={`url(#${MARK_GRAD_ID})`}
          strokeWidth={2.5}
          opacity={0.5}
        />
        <AnimatedPath
          d={WAVE_D}
          fill="none"
          stroke={`url(#${MARK_GRAD_ID})`}
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[120, 120]}
          animatedProps={animatedProps}
          testID="pulse-mark-wave"
        />
      </Svg>
    </View>
  );
}
