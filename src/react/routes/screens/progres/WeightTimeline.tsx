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

type RangeKey = '30' | '60' | '90' | 'all';

interface RangeTab {
  key: RangeKey;
  label: string;
  days: number | null; // null = all
}

const RANGES: readonly RangeTab[] = [
  { key: '30', label: '30 zile', days: 30 },
  { key: '60', label: '60', days: 60 },
  { key: '90', label: '90', days: 90 },
  { key: 'all', label: 'Tot', days: null },
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
    const cutoff = Date.now() - tab.days * MS_PER_DAY;
    return weightLog.filter((e) => e.ts >= cutoff);
  }, [weightLog, range]);

  const sortedDesc = useMemo(
    () => [...filtered].sort((a, b) => b.ts - a.ts),
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
    range === 'all' ? 'tot istoricul' : `ultimele ${range} zile`;

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="weight-timeline">
      <SubHeader
        title="Greutate"
        onBack={() => navigate(gotoPath('progres'))}
        testIdBack="weight-timeline-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Range tabs */}
        <div
          className="flex gap-1 p-1 bg-paper2 border border-line rounded-xl mb-4"
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
                className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                  active ? 'bg-paper text-ink' : 'text-ink2'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* KPI card */}
        <div
          className="bg-paper2 border border-line rounded-xl p-4 mb-4"
          data-testid="weight-timeline-kpi"
        >
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2">
            Greutate
          </p>
          {latest === undefined ? (
            <p className="text-sm text-ink2 mt-2" data-testid="weight-timeline-kpi-empty">
              Nu ai loguri in interval inca.
            </p>
          ) : (
            <>
              <p className="text-2xl font-bold text-ink mt-1 font-mono" data-testid="weight-timeline-kpi-value">
                {latest.kg.toFixed(1)}{' '}
                <span className="text-sm text-ink2 font-normal">kg</span>
              </p>
              {delta !== null && (
                <p
                  className="text-xs mt-1 font-mono"
                  data-testid="weight-timeline-kpi-delta"
                >
                  <span className={delta < 0 ? 'text-brick' : 'text-ink2'}>
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(1)} kg
                  </span>
                  <span className="text-ink2"> / {rangeLabel}</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Trend chart */}
        <div
          className="bg-paper2 border border-line rounded-xl p-4 mb-4"
          data-testid="weight-timeline-chart-card"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">Trend</p>
            <p className="text-xs text-ink2" data-testid="weight-timeline-range-label">
              {rangeLabel}
            </p>
          </div>
          {filtered.length === 0 ? (
            <p
              className="text-sm text-ink2 text-center py-8"
              data-testid="weight-timeline-chart-empty"
            >
              Nu ai loguri inca. Trendul apare aici dupa ce inregistrezi greutati.
            </p>
          ) : (
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-auto block"
              data-testid="weight-timeline-chart-svg"
              role="img"
              aria-label="Trend greutate"
            >
              <line x1="0" y1={chartH / 4} x2={chartW} y2={chartH / 4} stroke="#f0e8d8" strokeWidth="1" />
              <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="#f0e8d8" strokeWidth="1" />
              <line x1="0" y1={(3 * chartH) / 4} x2={chartW} y2={(3 * chartH) / 4} stroke="#f0e8d8" strokeWidth="1" />
              {chart.points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#c8412e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chart.polyline}
                />
              )}
              {chart.points.map((p, idx) => (
                <circle
                  key={`${p.date}-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={idx === chart.points.length - 1 ? 6 : 4}
                  fill="#c8412e"
                  stroke={idx === chart.points.length - 1 ? 'white' : undefined}
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
          className="w-full flex items-center gap-3 p-4 bg-paper2 border border-line rounded-xl text-left"
        >
          <List className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold text-ink">Loguri recente</span>
          <span className="text-xs text-ink2 mr-1 font-mono">
            {weightLog.length} {weightLog.length === 1 ? 'inregistrare' : 'inregistrari'}
          </span>
          <ChevronRight className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
