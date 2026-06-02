// ══ SVG COUNTDOWN RING (RN port) — signature rest-timer ring ══════════════
// RN twin of src/react/components/Workout/SVGCountdownRing.tsx via
// react-native-svg. Two concentric circles (track + progress arc) where the
// progress drains as `remainingSec` falls, plus a centered mm:ss readout. The
// web animated stroke-dashoffset via a CSS transition; here the dashoffset is
// computed directly per render (driven by the parent's 1Hz countdown state), so
// the visual update cadence matches the web 1:1 without a separate tween.
//
// 3-state color machine kept verbatim (getRingColor, exported for tests):
//   normal  remaining > 30%  → --brick (volt)
//   warning remaining <= 30% → --warn
//   urgent  remaining <= 10% → #ff4757
// The web pulsed opacity in the urgent band via a CSS keyframe. On RN that
// pulse is a Reanimated opacity loop (reduced-motion freezes it). testIDs kept:
// rest-countdown / rest-ring-track / rest-ring-progress / rest-ring-time
// + data-ring-state preserved as `accessibilityValue.text` (RN has no DOM data
// attrs) and the timer role via accessibilityLabel.

import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { formatMMSS } from '../../../src/react/lib/format';
import { accent, dark, varColor } from '../../lib/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

// Audit-spec urgent hex (#ff4757) — component-scoped, mirrors the web const.
const RING_URGENT_COLOR = '#ff4757';

// Pure-function color state — exported for an independent test fixture. Returns
// a static Pulse-dark hex (RN has no CSS vars). progressRatio in [0,1] = elapsed
// fraction (0 full ring at start, 1 empty ring at end). Thresholds verbatim.
export function getRingColor(progressRatio: number): string {
  if (progressRatio >= 0.9) return RING_URGENT_COLOR;
  if (progressRatio >= 0.7) return varColor('--warn');
  return accent.volt; // --brick (dark) === volt
}

interface SVGCountdownRingProps {
  totalSec: number;
  remainingSec: number;
  diameter?: number;
  strokeWidth?: number;
  /** Color of the centered mm:ss text (web passed a Tailwind class; RN takes a
   *  resolved color). Track + progress arc are unchanged. */
  timeColor?: string;
}

export function SVGCountdownRing({
  totalSec,
  remainingSec,
  diameter = 64,
  strokeWidth = 4,
  timeColor = dark.ink,
}: SVGCountdownRingProps): React.JSX.Element {
  const reduced = useReducedMotion();
  const center = diameter / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  // Guard divide-by-zero — total 0 → no progress drained (offset 0 full ring).
  const progressRatio =
    totalSec > 0 ? Math.min(1, Math.max(0, 1 - remainingSec / totalSec)) : 0;
  const dashOffset = progressRatio * circumference;
  const mmss = formatMMSS(remainingSec);
  const ringColor = getRingColor(progressRatio);
  const isUrgent = progressRatio >= 0.9;

  // Urgent pulse (web @keyframes pulse-urgent) — opacity 1 → 0.55 loop. Reduced
  // motion freezes it (Maria 65 vestibular safety).
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isUrgent && !reduced) {
      pulse.value = withRepeat(
        withTiming(0.55, { duration: 350, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 1;
    }
    return () => cancelAnimation(pulse);
  }, [isUrgent, reduced, pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View
      style={{
        width: diameter,
        height: diameter,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      testID="rest-countdown"
      accessibilityRole="timer"
      accessibilityLabel={`Pauza ramanere ${mmss}`}
      accessibilityValue={{
        text: isUrgent ? 'urgent' : progressRatio >= 0.7 ? 'warning' : 'normal',
      }}
    >
      <Svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        {/* Track ring — soft overlay. */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={strokeWidth}
          testID="rest-ring-track"
        />
      </Svg>
      {/* Progress ring layered on top in an Animated.View so the urgent-band
          opacity pulse drives the whole arc (RN-SVG has no per-element CSS
          keyframe; Reanimated style on the wrapping view is the clean parity).
          Color advances brick→warn→urgent across thresholds. */}
      <Animated.View
        style={[{ position: 'absolute', top: 0, left: 0 }, pulseStyle]}
        pointerEvents="none"
      >
        <Svg
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
        >
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            // Rotate -90deg so the arc starts at 12 o'clock (web transform parity).
            transform={`rotate(-90 ${center} ${center})`}
            testID="rest-ring-progress"
          />
        </Svg>
      </Animated.View>
      <Text
        style={{
          position: 'absolute',
          fontSize: 18,
          fontWeight: '700',
          color: timeColor,
          fontFamily: 'SpaceMono',
        }}
        testID="rest-ring-time"
      >
        {mmss}
      </Text>
    </View>
  );
}
