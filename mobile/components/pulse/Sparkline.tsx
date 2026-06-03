// ══ PULSE · SPARKLINE (RN port) — weight-trend mini chart ═════════════════
// RN twin of src/react/components/pulse/Sparkline.tsx via react-native-svg.
// Weight-trend line over a gradient area fill, with a line-draw entrance + a
// dot on the most recent point. Same props (data / color / w / h / fill) +
// testIDs (pulse-sparkline / -area / -line / -dot). Guards <2 points → null.
//
// FIDELITY FLAG: the web line carries a `drop-shadow` glow (no RN SVG filter);
// dropped here (the line color reads on its own). The entrance line-draw uses
// Reanimated strokeDashoffset; reduced motion settles instantly.

import { useEffect } from 'react';
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
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { useReducedMotion } from '../../lib/useReducedMotion';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AREA_GRAD_ID = 'pulse-spark-area';

interface SparklinePoint {
  day: string;
  kg: number;
}

interface SparklineProps {
  data: SparklinePoint[];
  /** Line + fill color. */
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
}

export function Sparkline({
  data,
  color,
  w = 300,
  h = 90,
  fill = true,
}: SparklineProps) {
  const { colors } = useTheme();
  const lineColor = color ?? colors.aquaInk;
  const reduced = useReducedMotion();
  const draw = useSharedValue(reduced ? 0 : 600);

  useEffect(() => {
    draw.value = reduced
      ? 0
      : withTiming(0, { duration: 1400, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [reduced, draw, data]);

  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: draw.value,
  }));

  // Guard: need >=2 points (callers show their own empty state). Hooks above
  // run unconditionally (rules of hooks) before this early return.
  if (!data || data.length < 2) return null;

  const vals = data.map((d) => d.kg);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = 8;
  const span = max - min || 1;
  const lastIdx = data.length - 1;

  const pts = data.map((d, i) => {
    const x = pad + (i / lastIdx) * (w - pad * 2);
    const y = pad + (1 - (d.kg - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const first = pts[0] ?? ([pad, h] as const);
  const last = pts[lastIdx] ?? ([w - pad, h] as const);
  const area = `${line} L${last[0].toFixed(1)} ${h} L${first[0].toFixed(1)} ${h} Z`;

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} testID="pulse-sparkline">
      <Defs>
        <LinearGradient id={AREA_GRAD_ID} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill && <Path d={area} fill={`url(#${AREA_GRAD_ID})`} testID="pulse-sparkline-area" />}
      <AnimatedPath
        d={line}
        fill="none"
        stroke={lineColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={[600, 600]}
        animatedProps={lineAnimatedProps}
        testID="pulse-sparkline-line"
      />
      <Circle cx={last[0]} cy={last[1]} r={4.5} fill={lineColor} testID="pulse-sparkline-dot" />
    </Svg>
  );
}
