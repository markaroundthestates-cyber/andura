// ══ WEIGHT SNAPSHOT 7-DAY — Progres mockup parity §F-pass2-heatmap-01 ══════
// Rebuilt 2026-05-22: paradigm align mockup L1730-1749 (andura-clasic.html).
// Mockup = WEIGHT snapshot 7 zile cu mini-chart 7 vertical bars + delta kg
// + drill link Istoric › Greutate si BF. Prior V1 = VOLUME heatmap (Phase 6
// task_22) — paradigm divergence Co-CTO fix, rebuild as weight chart.
// File/export name preserved pentru import-stability (Progres.tsx + tests).
//
// Data source: progresStore.weightLog last 7 entries. Empty state cand <2
// entries (delta need 2 puncte). Snapshot NON-interactive (NO drill, doar
// vizibil per mockup L1730 explicit intent — sibling last-weight-card in
// Progres.tsx handles drill to weight-log-list).
// Co-CTO LOCK 2026-05-22: brick bar token + bottom-anchored heights 32-62
// per mockup mini-chart visual rhythm.
// DRIFT-3 fix 2026-05-23: button drill → p non-interactive (mockup parity).
//
// SSOT: 04-architecture/mockups/andura-clasic.html:1730-1749
// Parity finding: 📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass2-progres-components.md §F-pass2-heatmap-01

import type { JSX } from 'react';
import { useProgresStore } from '../../stores/progresStore';

interface WeightBar {
  kg: number;
  heightPct: number; // 30-100% relative to min-max range
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
    // Map kg into 32-100% bar height range (visual rhythm even cand range small)
    heightPct: 32 + ((w.kg - min) / range) * 68,
  }));
}

export function HeatMapWeekly(): JSX.Element {
  const weightLog = useProgresStore((s) => s.weightLog);
  const bars = buildBars(weightLog);
  const last7 = weightLog.slice(-7);
  const latest = last7[last7.length - 1];
  const first = last7[0];
  const delta = latest && first && last7.length >= 2 ? +(latest.kg - first.kg).toFixed(1) : null;
  const deltaSign = delta === null ? '' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  return (
    <section
      data-testid="weight-snapshot-7day"
      className="bg-paper2 border border-line rounded-2xl p-4 mb-4"
      aria-label="Greutate ultimele 7 zile"
    >
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2">
            Greutate (7 zile)
          </p>
          {latest ? (
            <p className="text-xl font-bold text-ink font-mono" data-testid="weight-snapshot-latest">
              {latest.kg} <span className="text-sm font-normal text-ink2">kg</span>
            </p>
          ) : (
            <p className="text-xl font-bold text-ink font-mono" data-testid="weight-snapshot-latest">
              — <span className="text-sm font-normal text-ink2">kg</span>
            </p>
          )}
        </div>
        {delta !== null && (
          <p
            className="text-xs font-medium"
            data-testid="weight-snapshot-delta"
            data-delta-sign={deltaSign}
            style={{ color: delta < 0 ? '#3d7a4a' : delta > 0 ? 'var(--brick)' : 'var(--ink-2)' }}
          >
            {delta < 0 ? '↓' : delta > 0 ? '↑' : '='} {Math.abs(delta)} kg / {last7.length}z
          </p>
        )}
      </div>
      {bars.length > 0 ? (
        <div className="flex items-end gap-1 h-8" data-testid="weight-snapshot-chart">
          {bars.map((b, idx) => (
            <div
              key={idx}
              data-testid={`weight-bar-${idx}`}
              data-kg={b.kg}
              className="flex-1 bg-brick rounded-sm"
              style={{ height: `${b.heightPct}%` }}
              aria-label={`Ziua ${idx + 1} greutate ${b.kg} kg`}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink2 mt-1" data-testid="weight-snapshot-empty">
          Nu ai loguri inca. Snapshot-ul apare aici dupa prima cantarire.
        </p>
      )}
      <p
        data-testid="weight-snapshot-hint"
        className="text-xs text-ink2 mt-2"
      >
        Pentru analiza profunda &rarr; vezi <span className="font-semibold">Istoric &rsaquo; Greutate si BF</span>
      </p>
    </section>
  );
}
