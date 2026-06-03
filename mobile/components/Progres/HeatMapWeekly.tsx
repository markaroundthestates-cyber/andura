// ══ WEIGHT SNAPSHOT 7-DAY (RN port) — HeatMapWeekly ══════════════════════
// RN twin of src/react/components/Progres/HeatMapWeekly.tsx. The bar builder +
// plausibility guard + span-days math are kept verbatim; markup → View/Text and
// the 7 bottom-anchored bars become flex Views with a volt-tint fill (the web's
// color-mix gradient bar → a single volt token fill, fidelity-acceptable for a
// 7px snapshot bar). Same testIDs + i18n keys. Export name preserved.

import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useProgresStore } from '../../../src/react/stores/progresStore';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { dark, accent, withAlpha } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface WeightBar {
  kg: number;
  heightPct: number;
}

const MAX_PLAUSIBLE_KG_PER_DAY = 2;
const MS_PER_DAY = 86_400_000;

function spanDays(firstDate: string, lastDate: string): number {
  const a = Date.parse(firstDate);
  const b = Date.parse(lastDate);
  if (Number.isNaN(a) || Number.isNaN(b)) return 1;
  return Math.max(1, Math.round(Math.abs(b - a) / MS_PER_DAY));
}

function buildBars(weightLog: Array<{ kg: number; ts: number }>): WeightBar[] {
  const last7 = weightLog.slice(-7);
  if (last7.length === 0) return [];
  const kgs = last7.map((w) => w.kg);
  const min = Math.min(...kgs);
  const max = Math.max(...kgs);
  const range = max - min || 1;
  return last7.map((w) => ({
    kg: w.kg,
    heightPct: 32 + ((w.kg - min) / range) * 68,
  }));
}

export function HeatMapWeekly(): React.JSX.Element {
  const weightLog = useProgresStore((s) => s.weightLog);
  const bars = buildBars(weightLog);
  const last7 = weightLog.slice(-7);
  const latest = last7[last7.length - 1];
  const first = last7[0];
  const delta = latest && first && last7.length >= 2 ? +(latest.kg - first.kg).toFixed(1) : null;
  const spanLabelDays = latest && first ? spanDays(first.date, latest.date) : 1;
  const implausible =
    delta !== null && latest && first
      ? Math.abs(delta) / spanLabelDays > MAX_PLAUSIBLE_KG_PER_DAY
      : false;

  return (
    <View
      testID="weight-snapshot-7day"
      className="bg-paper-2 border border-line p-4 mb-4"
      style={{ borderRadius: 22 }}
      accessibilityLabel={t('progres.weight.snapshotAriaLabel')}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}
      >
        <View>
          <Text className="uppercase font-semibold text-ink2" style={{ fontSize: 12, letterSpacing: 0.4 }}>
            {t('progres.weight.snapshotTitle')}
          </Text>
          <Text testID="weight-snapshot-latest" className="font-bold text-ink font-mono" style={{ fontSize: 20 }}>
            {latest ? latest.kg : '—'}{' '}
            <Text className="font-normal text-ink2" style={{ fontSize: 14 }}>
              kg
            </Text>
          </Text>
        </View>
        {delta !== null && !implausible && (
          <Text
            testID="weight-snapshot-delta"
            style={{ fontSize: 12, fontWeight: '500', color: delta < 0 ? accent.volt : delta > 0 ? dark.brick : dark.ink2 }}
          >
            {delta < 0 ? '↓' : delta > 0 ? '↑' : '='} {Math.abs(delta)} kg / {spanLabelDays}z
          </Text>
        )}
        {delta !== null && implausible && (
          <Text testID="weight-snapshot-delta-implausible" className="text-ink2" style={{ fontSize: 12, fontWeight: '500' }}>
            {t('progres.weight.verifyValue')}
          </Text>
        )}
      </View>
      {bars.length > 0 ? (
        <View testID="weight-snapshot-chart" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 32 }}>
          {bars.map((b, idx) => (
            <WeightBarView key={idx} bar={b} idx={idx} />
          ))}
        </View>
      ) : (
        <Text testID="weight-snapshot-empty" className="text-ink2" style={{ fontSize: 12, marginTop: 4 }}>
          {t('progres.weight.snapshotEmpty')}
        </Text>
      )}
      <Text testID="weight-snapshot-hint" className="text-ink2" style={{ fontSize: 12, marginTop: 8 }}>
        {t('progres.weight.snapshotHint')}
      </Text>
    </View>
  );
}

// One snapshot bar — grows from baseline to its height on reveal (staggered),
// settles instantly under reduced motion. testID + aria preserved 1:1.
function WeightBarView({ bar, idx }: { bar: WeightBar; idx: number }): React.JSX.Element {
  const reduced = useReducedMotion();
  const grow = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    grow.value = reduced
      ? 1
      : withDelay(idx * 60, withTiming(1, { duration: 480, easing: Easing.bezier(0.2, 0.8, 0.2, 1) }));
  }, [reduced, grow, idx, bar.heightPct]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${bar.heightPct * grow.value}%`,
  }));

  return (
    <Animated.View
      testID={`weight-bar-${idx}`}
      accessibilityRole="image"
      accessibilityLabel={t('progres.weight.dayBarAriaLabel', { n: idx + 1, kg: bar.kg })}
      style={[
        {
          flex: 1,
          borderRadius: 2,
          backgroundColor: withAlpha(dark.brick, 0.8),
        },
        animatedStyle,
      ]}
    />
  );
}
