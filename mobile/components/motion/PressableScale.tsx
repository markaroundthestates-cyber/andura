// ══ MOTION — Pressable with press-down scale feedback (RN + web export) ════
// A drop-in Pressable that dips to ~0.96 scale + a touch of dim while held, then
// springs back on release — the tactile "this is a button" cue Daniel found
// missing. Same Reanimated primitive as the rest of the app (shared value +
// withTiming + useAnimatedStyle) so it works on the Expo WEB export. Reduced
// motion → no scale (still fully pressable). Forwards every Pressable prop
// (onPress, testID, accessibilityRole, disabled, style…) so it swaps in 1:1.

import { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../lib/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  /** Scale at the pressed-down state. Default 0.96. */
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  activeScale = 0.96,
  onPressIn,
  onPressOut,
  style,
  children,
  disabled,
  ...rest
}: PressableScaleProps): React.JSX.Element {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);

  const handleIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      if (!reduced && !disabled) {
        pressed.value = withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) });
      }
      onPressIn?.(e);
    },
    [reduced, disabled, pressed, onPressIn],
  );

  const handleOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      pressed.value = withTiming(0, { duration: 140, easing: Easing.out(Easing.quad) });
      onPressOut?.(e);
    },
    [pressed, onPressOut],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - activeScale) }],
    opacity: 1 - pressed.value * 0.12,
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
