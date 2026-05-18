// ══ TDEE STRIP — Phase 6 task_22 Progres Dashboard Bayesian Target ═══════
// Real wire getNutritionTargetTodayReal async (task_04). Surface kcal +
// protein + source badge subtle (engine-bn / manual / baseline).

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../../lib/bayesianNutritionAggregate';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SOURCE_LABELS: Record<NutritionTarget['source'], string> = {
  manual: 'Setat manual',
  'engine-bn': 'Estimare adaptiva',
  baseline: 'Estimare initiala',
};

export function TDEEStrip(): JSX.Element {
  const [target, setTarget] = useState<NutritionTarget | null>(null);

  useEffect(() => {
    let cancelled = false;
    getNutritionTargetTodayReal(todayIso()).then((t) => {
      if (!cancelled) setTarget(t);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      data-testid="tdee-strip"
      className="bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-4"
      aria-label="Target nutritie azi"
    >
      <Flame className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          Target azi
        </p>
        <p className="text-xl font-bold text-ink font-mono">
          {target?.kcalTarget ?? '—'} kcal
          <span className="text-sm font-normal text-ink2 ml-2">
            · {target?.proteinTarget ?? '—'} g proteine
          </span>
        </p>
        {target && (
          <p className="text-xs text-ink2 mt-0.5" data-testid="tdee-source">
            {SOURCE_LABELS[target.source]}
          </p>
        )}
      </div>
    </section>
  );
}
