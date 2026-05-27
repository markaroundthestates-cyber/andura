// ══ STATS GRID — F10 3-Cell Compact ═══════════════════════════════════════
// Per mockup §F10 audit-driven V1 feature.
// Streak + Fatigue + Readiness 3-cell layout cu icons.
//
// Phase 3: props din parent (workoutStore.streak + engineWrappers.getFatigue
// + engineWrappers.getReadiness).

import type { JSX } from 'react';
import type { ReadinessOutput, FatigueOutput } from '../../lib/engineWrappers';

interface Props {
  streak: number;
  fatigue: FatigueOutput | null;
  readiness: ReadinessOutput | null;
}

export function StatsGrid({ streak, fatigue, readiness }: Props): JSX.Element {
  // §MED-CODE-23 — unit label below big number (2-line visual). Number rendered
  // separat, deci label = doar substantivul: "zi" la 1, "zile" altfel (fara
  // prefix "de" care apare la pluralRo 20+).
  const streakLabel = streak === 1 ? 'zi' : 'zile';
  return (
    <div
      className="grid grid-cols-3 gap-2 mb-4"
      role="region"
      aria-label="Statistici - streak, oboseala, energie"
    >
      <div className="bg-paper2 rounded-lg p-3 text-center">
        <div className="text-xs text-ink2 uppercase tracking-wider">Streak</div>
        <div className="text-2xl font-bold text-ink mt-1" data-testid="stats-streak">
          {streak}
        </div>
        <div className="text-xs text-ink2 mt-0.5" data-testid="stats-streak-label">{streakLabel}</div>
      </div>
      <div className="bg-paper2 rounded-lg p-3 text-center">
        <div className="text-xs text-ink2 uppercase tracking-wider">Oboseala</div>
        <div className="text-2xl font-bold text-ink mt-1" data-testid="stats-fatigue">
          {fatigue ? fatigue.score : '-'}
        </div>
        <div className="text-xs text-ink2 mt-0.5">{fatigue ? fatigue.label : 'NA'}</div>
      </div>
      <div className="bg-paper2 rounded-lg p-3 text-center">
        <div className="text-xs text-ink2 uppercase tracking-wider">Readiness</div>
        <div className="text-2xl font-bold text-ink mt-1" data-testid="stats-readiness">
          {readiness ? readiness.score : '-'}
        </div>
        <div className="text-xs text-ink2 mt-0.5">{readiness ? readiness.label : 'NA'}</div>
      </div>
    </div>
  );
}
