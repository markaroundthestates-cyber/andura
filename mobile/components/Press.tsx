// ══ PRESS — reanimated press-feedback Pressable (web + native) ════════════
// The RN port's tap feedback (Ripple / android_ripple) is inert on the WEB
// export — a tapped button gave NO visual response, so Daniel read them as
// "buttons that don't work." This wraps Pressable in a Reanimated scale+opacity
// spring that fires on pressIn/pressOut. Reanimated's shared-value animations
// run on react-native-web too, so the feedback shows in `expo export -p web`.
//
// Reduced motion (AccessibilityInfo) freezes the scale/opacity to a static rest
// state (Maria 65 vestibular safety) while keeping the press fully functional.
// Drop-in: same props as Pressable (onPress, style, testID, accessibility*…),
// so call sites swap `Pressable` → `PressScale` with no behavior change.

import { forwardRef } from 'react';
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../lib/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressScaleProps extends PressableProps {
  /** Scale at full press. Default 0.96 (subtle, fingertip-confident). */
  pressedScale?: number;
  /** Opacity at full press. Default 0.9. */
  pressedOpacity?: number;
}

/**
 * Pressable with a Reanimated press-in scale + dim. Works on web + native and
 * respects OS reduce-motion. Same API surface as Pressable.
 */
export const PressScale = forwardRef<View, PressScaleProps>(function PressScale(
  { pressedScale = 0.96, pressedOpacity = 0.9, style, onPressIn, onPressOut, disabled, ...rest },
  ref,
) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0); // 0 = rest, 1 = pressed

  const animatedStyle = useAnimatedStyle(() => {
    if (reduced) return {};
    const scale = 1 - progress.value * (1 - pressedScale);
    const opacity = 1 - progress.value * (1 - pressedOpacity);
    return { transform: [{ scale }], opacity };
  });

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={(e) => {
        if (!reduced) progress.value = withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduced) progress.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) });
        onPressOut?.(e);
      }}
      style={(state: PressableStateCallbackType): StyleProp<ViewStyle> => [
        typeof style === 'function' ? style(state) : style,
        animatedStyle,
      ]}
      {...rest}
    />
  );
});
