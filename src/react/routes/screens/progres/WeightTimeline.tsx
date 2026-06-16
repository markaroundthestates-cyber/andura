// ══ WEIGHT TIMELINE — Progres sub-screen (mockup #screen-weight-timeline) ═
// Per mockup andura-clasic.html L2204-2293. Range tabs (30/60/90/all) +
// current KPI card + SVG line chart trend.
//
// V1 scope (Karpathy SF) — weight only. BF % column omitted (BodyDataEntry
// nu poarta bf field, would require BodyData store extension out of
// PAR-004 scope). Photo progress section + "Loguri recente" CTA preserved
// per mockup parity. WeightLogList drill-down via existing nav linkpoint.

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ChevronRight } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { t } from '../../../../i18n/index.js';
import { todDate } from '../../../../db.js';

type RangeKey = '30' | '60' | '90' | 'all';

interface RangeTab {
  key: RangeKey;
  days: number | null; // null = all
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
  // Chronological by entry `date` (YYYY-MM-DD lexicographic) with `ts` tiebreaker
  // — same idiom as getCurrentWeightKg + Progres.tsx sparkline. A back-dated
  // weigh-in has the newest `ts` but an older `date`, so ts-ordering plots it at
  // the far right and inverts the trend; date-ordering keeps the x-axis correct.
  const ascending = [...entries].sort((a, b) => {
    const dateCmp = (a.date ?? '').localeCompare(b.date ?? '');
    if (dateCmp !== 0) return dateCmp;
    return (a.ts ?? 0) - (b.ts ?? 0);
  });
  const minKg = Math.min(...ascending.map((e) => e.kg));
  const maxKg = Math.max(...ascending.map((e) => e.kg));
  const range = maxKg - minKg || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const points: ChartPoint[] = ascending.map((e, i) => {
    const xRatio = ascending.length === 1 ? 0.5 : i / (ascending.length - 1);
    const yRatio = (e.kg - minKg) / range; // 0=min, 1=max
    return {
      x: padding + xRatio * innerW,
      // Invert: high kg at top
      y: padding + (1 - yRatio) * innerH,
      date: e.date,
      kg: e.kg,
    };
  });
  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return { points, polyline };
}

export function WeightTimeline(): JSX.Element {
  const navigate = useNavigate();
  const weightLog = useProgresStore((s) => s.weightLog);
  const [range, setRange] = useState<RangeKey>('30');

  const filtered = useMemo(() => {
    const tab = RANGES.find((r) => r.key === range);
    if (!tab || tab.days === null) return weightLog;
    // Cut on entry `date`, NOT `ts` — a back-dated weigh-in has a recent `ts` but
    // belongs in an older window. Local YYYY-MM-DD cutoff (todDate) compared
    // lexicographically, consistent with the date-keyed ordering above.
    const cutoffDate = todDate(new Date(Date.now() - tab.days * MS_PER_DAY));
    return weightLog.filter((e) => e.date >= cutoffDate);
  }, [weightLog, range]);

  // Newest-first by `date` (YYYY-MM-DD) with `ts` tiebreaker → KPI "current
  // weight" + delta read the latest BY DATE, matching getCurrentWeightKg + the
  // Progres sparkline. ts-ordering surfaced a back-dated entry as "today".
  const sortedDesc = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const dateCmp = (b.date ?? '').localeCompare(a.date ?? '');
        if (dateCmp !== 0) return dateCmp;
        return (b.ts ?? 0) - (a.ts ?? 0);
      }),
    [filtered],
  );

  const latest = sortedDesc[0];
  const earliest = sortedDesc[sortedDesc.length - 1];
  const delta =
    latest !== undefined && earliest !== undefined && latest !== earliest
      ? latest.kg - earliest.kg
      : null;

  const chartW = 320;
  const chartH = 140;
  const chart = useMemo(
    () => buildChart(filtered, chartW, chartH, 10),
    [filtered],
  );

  const rangeLabel =
    range === 'all'
      ? t('progres.weightTimeline.rangeLabelAll')
      : t('progres.weightTimeline.rangeLabelDays', { n: range });

  // Pulse aqua chart — gradient area path under the line. Trace the points, then
  // close down to the chart floor + back to the first x to form the filled region
  // (same idiom as the pulse Sparkline area), so the trend reads as the glowing
  // aqua line + soft gradient fill from the mockup (L154-160).
  const areaPath =
    chart.points.length > 1
      ? chart.points
          .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' ') +
        ` L${chart.points[chart.points.length - 1]!.x.toFixed(1)} ${chartH}` +
        ` L${chart.points[0]!.x.toFixed(1)} ${chartH} Z`
      : '';

  return (
    <section className="min-h-screen flex flex-col" data-testid="weight-timeline">
      <SubHeader
        title={t('progres.weightTimeline.title')}
        onBack={() => navigate(gotoPath('progres'))}
        testIdBack="weight-timeline-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Range segment — Pulse pill group, active fills with --volt. */}
        <div
          className="flex gap-1 p-1 rounded-full border border-line bg-[var(--surface-2)] mb-4"
          role="tablist"
          data-testid="weight-timeline-range-tabs"
        >
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`weight-timeline-range-${r.key}`}
                onClick={() => setRange(r.key)}
                className={`flex-1 py-2 rounded-full text-xs font-semibold font-mono transition-colors ${
                  active ? 'text-[var(--on-accent)]' : 'text-ink2'
                }`}
                style={active ? { background: 'var(--volt)' } : undefined}
              >
                {t(`progres.weightTimeline.ranges.${r.key}`)}
              </button>
            );
          })}
        </div>

        {/* KPI card — hero current weight, font-display tabular-nums. */}
        <div
          className="pulse-card pulse-card-glow p-4 mb-4"
          style={{ ['--wash' as string]: 'var(--aqua)' }}
          data-testid="weight-timeline-kpi"
        >
          <Kicker color="var(--aqua)">{t('progres.weightTimeline.kpiHeading')}</Kicker>
          {latest === undefined ? (
            <p className="text-sm text-ink2 mt-2" data-testid="weight-timeline-kpi-empty">
              {t('progres.weightTimeline.kpiEmpty')}
            </p>
          ) : (
            <>
              <p className="font-display text-4xl font-bold text-ink mt-1.5 tabular-nums" data-testid="weight-timeline-kpi-value">
                {latest.kg.toFixed(1)}{' '}
                <span className="text-base text-ink2 font-normal">kg</span>
              </p>
              {delta !== null && (
                <p
                  className="text-xs mt-2 font-mono tabular-nums"
                  data-testid="weight-timeline-kpi-delta"
                >
                  <span className={delta < 0 ? 'text-[var(--volt)]' : 'text-ink2'}>
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(1)} kg
                  </span>
                  <span className="text-ink2"> / {rangeLabel}</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Trend chart — Pulse aqua line + gradient fill + glow. */}
        <div
          className="pulse-card p-4 mb-4"
          data-testid="weight-timeline-chart-card"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-sm font-bold text-ink">{t('progres.weightTimeline.trendHeading')}</p>
            <Kicker color="var(--aqua)">{rangeLabel}</Kicker>
            <span className="sr-only" data-testid="weight-timeline-range-label">{rangeLabel}</span>
          </div>
          {filtered.length === 0 ? (
            <p
              className="text-sm text-ink2 text-center py-8"
              data-testid="weight-timeline-chart-empty"
            >
              {t('progres.weightTimeline.chartEmpty')}
            </p>
          ) : (
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-auto block"
              data-testid="weight-timeline-chart-svg"
              role="img"
              aria-label={t('progres.weightTimeline.chartAriaLabel')}
            >
              <defs>
                <linearGradient id="weight-timeline-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--aqua)" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="var(--aqua)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1={chartH / 4} x2={chartW} y2={chartH / 4} stroke="var(--line)" strokeWidth="1" />
              <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="var(--line)" strokeWidth="1" />
              <line x1="0" y1={(3 * chartH) / 4} x2={chartW} y2={(3 * chartH) / 4} stroke="var(--line)" strokeWidth="1" />
              {areaPath !== '' && <path d={areaPath} fill="url(#weight-timeline-area)" />}
              {chart.points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="var(--aqua)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chart.polyline}
                  style={{ filter: 'drop-shadow(0 0 5px color-mix(in oklab, var(--aqua) 55%, transparent))' }}
                />
              )}
              {chart.points.map((p, idx) => (
                <circle
                  key={`${p.date}-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={idx === chart.points.length - 1 ? 5.5 : 4}
                  fill="var(--aqua)"
                  stroke={idx === chart.points.length - 1 ? 'var(--paper)' : undefined}
                  strokeWidth={idx === chart.points.length - 1 ? 2 : undefined}
                  data-testid={`weight-timeline-chart-dot-${idx}`}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Loguri recente CTA */}
        <button
          type="button"
          onClick={() => navigate(gotoPath('weight-log-list'))}
          data-testid="weight-timeline-logs-cta"
          className="pulse-card pulse-card-tight btn-secondary-lift w-full flex items-center gap-3 p-4 text-left"
        >
          <List className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold text-ink">{t('progres.weightTimeline.logsCta')}</span>
          <span className="text-xs text-ink2 mr-1 font-mono">
            {t(
              weightLog.length === 1
                ? 'progres.weightTimeline.entries_one'
                : 'progres.weightTimeline.entries_other',
              { n: weightLog.length },
            )}
          </span>
          <ChevronRight className="w-5 h-5 text-ink2 flex-shrink-0" strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
