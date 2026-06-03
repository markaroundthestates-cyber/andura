// ══ MOTION — mount-entrance wrapper (RN + web export safe) ════════════════
// A tiny reusable entrance animation: fade + a short upward slide on mount.
// Built on the SAME proven primitive as LoadingSkeleton (useSharedValue +
// withTiming + useAnimatedStyle + Animated.View) so it renders on the Expo WEB
// export (Daniel smokes web) — NOT on Reanimated layout-animation `entering=`
// props, which are flaky on RNW. Reduced-motion (OS toggle / browser
// prefers-reduced-motion via useReducedMotion) snaps straight to the resting
// state. An optional `delay` (ms) lets a list stagger its rows.

import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface EntranceProps {
  children: React.ReactNode;
  /** Stagger offset in ms (rows in a list pass 0,1,2… * step). */
  delay?: number;
  /** Travel distance for the upward slide (px). Default 12. */
  offset?: number;
  /** Animation duration (ms). Default 320. */
  duration?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Entrance({
  children,
  delay = 0,
  offset = 12,
  duration = 320,
  style,
  testID,
}: EntranceProps): React.JSX.Element {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
  }, [reduced, delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * offset }],
  }));

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
