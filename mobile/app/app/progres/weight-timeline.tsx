// ══ WEIGHT TIMELINE (RN port) — '/app/progres/weight-timeline' ══════════
// RN twin of src/react/routes/screens/progres/WeightTimeline.tsx. Range filter
// (30/60/90/all) + KPI delta + chart point builder are kept verbatim; markup →
// SubHeader + ScrollView + Pressable range tabs + a react-native-svg chart
// (gridlines + gradient area + glow line + dots). Same testIDs + i18n keys.
//
// FIDELITY FLAG: the web polyline carried a drop-shadow glow filter (no RN SVG
// drop-shadow); approximated with a wider faint under-line in the same aqua.

import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Polyline, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { List, ChevronRight } from 'lucide-react-native';
import { useProgresStore } from '../../../../src/react/stores/progresStore';
import { goto } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { dark, accent, withAlpha } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

type RangeKey = '30' | '60' | '90' | 'all';

interface RangeTab {
  key: RangeKey;
  days: number | null;
}

const RANGES: readonly RangeTab[] = [
  { key: '30', days: 30 },
  { key: '60', days: 60 },
  { key: '90', days: 90 },
  { key: 'all', days: null },
];

const MS_PER_DAY = 86_400_000;

interface ChartPoint {
  x: number;
  y: number;
  date: string;
  kg: number;
}

function buildChart(
  entries: ReadonlyArray<{ kg: number; date: string; ts: number }>,
  width: number,
  height: number,
  padding: number,
): { points: ChartPoint[]; polyline: string } {
  if (entries.length === 0) return { points: [], polyline: '' };
  const ascending = [...entries].sort((a, b) => a.ts - b.ts);
  const minKg = Math.min(...ascending.map((e) => e.kg));
  const maxKg = Math.max(...ascending.map((e) => e.kg));
  const range = maxKg - minKg || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const points: ChartPoint[] = ascending.map((e, i) => {
    const xRatio = ascending.length === 1 ? 0.5 : i / (ascending.length - 1);
    const yRatio = (e.kg - minKg) / range;
    return {
      x: padding + xRatio * innerW,
      y: padding + (1 - yRatio) * innerH,
      date: e.date,
      kg: e.kg,
    };
  });
  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return { points, polyline };
}

export default function WeightTimeline(): React.JSX.Element {
  const weightLog = useProgresStore((s) => s.weightLog);
  const [range, setRange] = useState<RangeKey>('30');

  const filtered = useMemo(() => {
    const tab = RANGES.find((r) => r.key === range);
    if (!tab || tab.days === null) return weightLog;
    const cutoff = Date.now() - tab.days * MS_PER_DAY;
    return weightLog.filter((e) => e.ts >= cutoff);
  }, [weightLog, range]);

  const sortedDesc = useMemo(() => [...filtered].sort((a, b) => b.ts - a.ts), [filtered]);

  const latest = sortedDesc[0];
  const earliest = sortedDesc[sortedDesc.length - 1];
  const delta =
    latest !== undefined && earliest !== undefined && latest !== earliest
      ? latest.kg - earliest.kg
      : null;

  const chartW = 320;
  const chartH = 140;
  const chart = useMemo(() => buildChart(filtered, chartW, chartH, 10), [filtered]);

  const rangeLabel =
    range === 'all'
      ? t('progres.weightTimeline.rangeLabelAll')
      : t('progres.weightTimeline.rangeLabelDays', { n: range });

  const areaPath =
    chart.points.length > 1
      ? chart.points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L${chart.points[chart.points.length - 1]!.x.toFixed(1)} ${chartH}` +
        ` L${chart.points[0]!.x.toFixed(1)} ${chartH} Z`
      : '';

  return (
    <View testID="weight-timeline" className="bg-paper" style={{ flex: 1 }}>
      <SubHeader
        title={t('progres.weightTimeline.title')}
        onBack={() => goto('progres')}
        testIdBack="weight-timeline-back"
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Range segment — Pulse pill group, active fills with volt. */}
        <Animated.View
          entering={FadeInUp.duration(420)}
          testID="weight-timeline-range-tabs"
          accessibilityRole="tablist"
          className="border border-line bg-paper-2"
          style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, marginBottom: 16 }}
        >
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <Pressable
                key={r.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                testID={`weight-timeline-range-${r.key}`}
                onPress={() => setRange(r.key)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 999,
                  alignItems: 'center',
                  backgroundColor: active ? accent.volt : 'transparent',
                  opacity: pressed && !active ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text
                  className="font-mono font-semibold"
                  style={{ fontSize: 12, color: active ? dark.onAccent : dark.ink2 }}
                >
                  {t(`progres.weightTimeline.ranges.${r.key}`)}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* KPI card — hero current weight. */}
        <Animated.View
          entering={FadeInUp.duration(440).delay(80)}
          testID="weight-timeline-kpi"
          className="bg-paper-2 border border-line"
          style={{ borderRadius: 22, padding: 16, marginBottom: 16 }}
        >
          <Kicker color={accent.aqua}>{t('progres.weightTimeline.kpiHeading')}</Kicker>
          {latest === undefined ? (
            <Text testID="weight-timeline-kpi-empty" className="text-ink2" style={{ fontSize: 14, marginTop: 8 }}>
              {t('progres.weightTimeline.kpiEmpty')}
            </Text>
          ) : (
            <>
              <Text testID="weight-timeline-kpi-value" className="font-display font-bold text-ink" style={{ fontSize: 36, marginTop: 6 }}>
                {latest.kg.toFixed(1)} <Text className="text-ink2" style={{ fontSize: 16, fontWeight: '400' }}>kg</Text>
              </Text>
              {delta !== null && (
                <Text testID="weight-timeline-kpi-delta" className="font-mono" style={{ fontSize: 12, marginTop: 8 }}>
                  <Text style={{ color: delta < 0 ? accent.volt : dark.ink2 }}>
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(1)} kg
                  </Text>
                  <Text className="text-ink2"> / {rangeLabel}</Text>
                </Text>
              )}
            </>
          )}
        </Animated.View>

        {/* Trend chart — Pulse aqua line + gradient fill. */}
        <Animated.View entering={FadeInUp.duration(440).delay(160)} testID="weight-timeline-chart-card" className="bg-paper-2 border border-line" style={{ borderRadius: 22, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text className="font-display font-bold text-ink" style={{ fontSize: 14 }}>
              {t('progres.weightTimeline.trendHeading')}
            </Text>
            <Kicker color={accent.aqua}>{rangeLabel}</Kicker>
            <Text testID="weight-timeline-range-label" style={{ width: 0, height: 0, opacity: 0 }}>
              {rangeLabel}
            </Text>
          </View>
          {filtered.length === 0 ? (
            <Text testID="weight-timeline-chart-empty" className="text-ink2" style={{ fontSize: 14, textAlign: 'center', paddingVertical: 32 }}>
              {t('progres.weightTimeline.chartEmpty')}
            </Text>
          ) : (
            <Svg
              width="100%"
              height={chartH}
              viewBox={`0 0 ${chartW} ${chartH}`}
              testID="weight-timeline-chart-svg"
              accessibilityRole="image"
              accessibilityLabel={t('progres.weightTimeline.chartAriaLabel')}
            >
              <Defs>
                <LinearGradient id="weight-timeline-area" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={accent.aqua} stopOpacity={0.26} />
                  <Stop offset="100%" stopColor={accent.aqua} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Line x1="0" y1={chartH / 4} x2={chartW} y2={chartH / 4} stroke={dark.line} strokeWidth={1} />
              <Line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke={dark.line} strokeWidth={1} />
              <Line x1="0" y1={(3 * chartH) / 4} x2={chartW} y2={(3 * chartH) / 4} stroke={dark.line} strokeWidth={1} />
              {areaPath !== '' && <Path d={areaPath} fill="url(#weight-timeline-area)" />}
              {chart.points.length > 1 && (
                <>
                  {/* Glow under-line (no RN SVG drop-shadow). */}
                  <Polyline
                    fill="none"
                    stroke={withAlpha(accent.aqua, 0.4)}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chart.polyline}
                  />
                  <Polyline
                    fill="none"
                    stroke={accent.aqua}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chart.polyline}
                  />
                </>
              )}
              {chart.points.map((p, idx) => {
                const isLast = idx === chart.points.length - 1;
                return (
                  <Circle
                    key={`${p.date}-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r={isLast ? 5.5 : 4}
                    fill={accent.aqua}
                    stroke={isLast ? dark.paper : undefined}
                    strokeWidth={isLast ? 2 : undefined}
                    testID={`weight-timeline-chart-dot-${idx}`}
                  />
                );
              })}
            </Svg>
          )}
        </Animated.View>

        {/* Loguri recente CTA. */}
        <Pressable
          onPress={() => goto('weight-log-list')}
          testID="weight-timeline-logs-cta"
          className="bg-paper-2 border border-line"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 22,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <List size={20} color={dark.ink2} />
          <Text className="font-semibold text-ink" style={{ flex: 1, fontSize: 14 }}>
            {t('progres.weightTimeline.logsCta')}
          </Text>
          <Text className="text-ink2 font-mono" style={{ fontSize: 12, marginRight: 4 }}>
            {t(
              weightLog.length === 1
                ? 'progres.weightTimeline.entries_one'
                : 'progres.weightTimeline.entries_other',
              { n: weightLog.length },
            )}
          </Text>
          <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
