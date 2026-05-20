// ══ HEAT MAP WEEKLY — Phase 6 task_22 Progres Dashboard 7-Day Volume ═════
// Simplified grid V1: 7 zile × top muscle groups din sessionsHistory ultima
// saptamana. Cell intensity proportional cu volume relativ (max=100% bright,
// 0% empty). Phase 7+ wires Big 11 RO canonical muscle group split + MEV/
// MAV thresholds engine output.

import type { JSX } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';

const DAY_LABELS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] as const;
const MS_PER_DAY = 86_400_000;

function jsDowToIdx(jsDow: number): number {
  // JS Date.getDay(): 0=Sun ... 6=Sat → app convention 0=Mon ... 6=Sun
  return jsDow === 0 ? 6 : jsDow - 1;
}

interface DayVolume {
  dayIdx: number;
  totalVolume: number;
}

function aggregateLast7Days(sessionsHistory: Array<{ ts: number; exercises?: Array<{ totalVolume: number }> }>): DayVolume[] {
  const now = Date.now();
  const weekStart = now - 7 * MS_PER_DAY;
  const result: DayVolume[] = DAY_LABELS.map((_, i) => ({ dayIdx: i, totalVolume: 0 }));
  for (const session of sessionsHistory) {
    if (session.ts < weekStart) continue;
    const dayIdx = jsDowToIdx(new Date(session.ts).getDay());
    const volume = (session.exercises ?? []).reduce((acc, ex) => acc + (ex.totalVolume ?? 0), 0);
    const entry = result[dayIdx];
    if (entry) entry.totalVolume += volume;
  }
  return result;
}

export function HeatMapWeekly(): JSX.Element {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const volumes = aggregateLast7Days(sessionsHistory);
  const maxVolume = Math.max(...volumes.map((v) => v.totalVolume), 1);

  return (
    <section
      data-testid="heat-map-weekly"
      className="bg-paper2 border border-line rounded-2xl p-4 mb-4"
      aria-label="Volum saptamanal pe zi"
    >
      <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-3">
        Volum saptamana
      </p>
      <div className="flex gap-1.5">
        {volumes.map((v, idx) => {
          const intensity = v.totalVolume / maxVolume;
          // 4-tier color: 0 (empty) / 0-33% / 33-66% / 66-100%
          let bgClass = 'bg-paper';
          if (intensity > 0.66) bgClass = 'bg-brick';
          else if (intensity > 0.33) bgClass = 'bg-brick/60';
          else if (intensity > 0) bgClass = 'bg-brick/30';
          return (
            <div
              key={DAY_LABELS[idx]}
              data-testid={`heatmap-day-${idx}`}
              data-volume={v.totalVolume}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-full h-12 rounded-lg border border-line ${bgClass}`}
                aria-label={`${DAY_LABELS[idx]} volum ${Math.round(v.totalVolume)} kg`}
              />
              <span className="text-xs font-semibold text-ink2">{DAY_LABELS[idx]}</span>
            </div>
          );
        })}
      </div>
      {volumes.every((v) => v.totalVolume === 0) && (
        <p className="text-xs text-ink2 mt-3 text-center" data-testid="heatmap-empty">
          Nu ai sesiuni logate saptamana asta.
        </p>
      )}
    </section>
  );
}
