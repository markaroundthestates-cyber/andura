// ══ TDEE STRIP — Phase 6 task_22 Progres Dashboard Bayesian Target ═══════
// Real wire getNutritionTargetTodayReal async (task_04). Surface kcal +
// protein + source badge subtle (engine-bn / manual / baseline).
//
// §F-pass2-tdeestrip-01 (HIGH-EPSILON 2026-05-22) — mockup L1706 top row:
// Faza badge ("Faza: Auto" colored dot) + Sapt. counter ("Sapt. X /
// mesociclu") periodization context. Faza signal read from phase-override
// localStorage (B001 SchimbaFaza wire). Sapt counter derived from sessions
// count modulo 4 (4-week mesocycle convention; conservative defensive
// fallback to "1" cand sessions empty). Per Karpathy SF - local read pure
// pre-render, NO async wire pollution.

import type { JSX } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { Flame } from 'lucide-react';
import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../../lib/bayesianNutritionAggregate';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SOURCE_LABELS: Record<NutritionTarget['source'], string> = {
  manual: 'Setat manual',
  'engine-bn': 'Estimare adaptiva',
  baseline: 'Estimare initiala',
};

// §F-pass2-tdeestrip-01 — phase override labels (B001 SchimbaFazaConfirm wire).
// Default "Auto" cand absent OR explicit AUTO (mockup L1706 verbatim "Faza: Auto").
const PHASE_LABELS = {
  AUTO: 'Auto',
  CUT: 'Cut',
  BULK: 'Bulk',
  MAINTENANCE: 'Mentenanta',
  STRENGTH: 'Forta',
} as const;

const MESOCYCLE_WEEKS = 4; // Linear Block Periodization V1 — 4-week mesocycle clasic

// RO thousands separator (dot, ICU ro-RO) — consistency cross-strip parity
// cu BMRStrip ("1.850"). Prior raw {kcalTarget} rendea "2640" inconsistent
// langa BMRStrip "1.850". Mirror BMRStrip pattern toLocaleString('ro-RO').
function fmtNum(n: number): string {
  return n.toLocaleString('ro-RO').replace(/,/g, ' ');
}

/**
 * Read user phase override from localStorage (B001 SchimbaFazaConfirm
 * persist). Returns 'Auto' fallback cand absent / unknown value.
 */
function getCurrentPhaseLabel(): string {
  try {
    const raw = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as string | null;
    if (!raw) return PHASE_LABELS.AUTO;
    return (PHASE_LABELS as Record<string, string>)[raw] ?? PHASE_LABELS.AUTO;
  } catch {
    return PHASE_LABELS.AUTO;
  }
}

/**
 * Compute current week-in-mesocycle from sessions count. Conservative
 * defensive: sessions count / sessions-per-week-target → 1..4 wrap. Empty
 * sessions → week 1 (T0 fresh user).
 */
function computeWeekInMesocycle(sessionsCount: number, freqPerWeek: number): number {
  if (sessionsCount <= 0 || freqPerWeek <= 0) return 1;
  const weeksElapsed = Math.floor(sessionsCount / freqPerWeek);
  return (weeksElapsed % MESOCYCLE_WEEKS) + 1;
}

export function TDEEStrip(): JSX.Element {
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // §F-pass2-tdeestrip-02 — logged kcal today (manual nutrition log). null
  // cand user n-a logat inca → afisam doar tinta (NU fabricam "current").
  const loggedKcal = useNutritionStore((s) => s.getDaily(todayIso())?.kcal ?? null);
  // Default 3 sessions/week mid-range when frequency NU known (T0 fresh).
  const phaseLabel = useMemo(() => getCurrentPhaseLabel(), []);
  const weekInMeso = useMemo(
    () => computeWeekInMesocycle(sessionsHistory.length, 3),
    [sessionsHistory.length],
  );

  useEffect(() => {
    let cancelled = false;
    getNutritionTargetTodayReal(todayIso()).then((t) => {
      if (!cancelled) setTarget(t);
    });
    return () => { cancelled = true; };
  }, []);

  // §F-pass2-tdeestrip-02 — current-vs-tinta comparison (mockup L1796
  // "2 640 kcal · tinta 2 600"). Doar cand exista intake logat manual AND
  // tinta e engine/baseline genuina (source 'manual' = tinta echo-eaza
  // valoarea logata → delta 0 meaningless, ascundem comparatia).
  const showComparison =
    loggedKcal != null && target != null && target.source !== 'manual';
  const kcalDelta = showComparison ? loggedKcal - target.kcalTarget : 0;
  const deltaLabel = kcalDelta >= 0 ? `+${fmtNum(kcalDelta)}` : `-${fmtNum(Math.abs(kcalDelta))}`;

  return (
    <section
      data-testid="tdee-strip"
      className="bg-paper2 border border-line rounded-2xl p-4 mb-4"
      aria-label="Target nutritie azi"
    >
      <div className="flex items-center justify-between mb-2.5" data-testid="tdee-faza-row">
        <span
          data-testid="tdee-faza-badge"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ background: '#f0e8d8', color: '#7a6938' }}
        >
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#c69a2c' }}
          />
          Faza: {phaseLabel}
        </span>
        <span className="text-xs text-ink2" data-testid="tdee-mesocycle-week">
          Sapt. {weekInMeso} / mesociclu
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Flame className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
            {showComparison ? 'Azi vs tinta' : 'Target azi'}
          </p>
          {showComparison ? (
            /* §F-pass2-tdeestrip-02 — intake logat vs tinta (mockup L1796).
               "{logat} kcal · tinta {target} (delta)". */
            <p
              className="text-xl font-bold text-ink font-mono"
              data-testid="tdee-current-vs-target"
            >
              {fmtNum(loggedKcal)} kcal
              <span className="text-sm font-normal text-ink2 ml-2">
                · tinta {fmtNum(target.kcalTarget)} ({deltaLabel})
              </span>
            </p>
          ) : (
            <p className="text-xl font-bold text-ink font-mono">
              {target ? fmtNum(target.kcalTarget) : '—'} kcal
              <span className="text-sm font-normal text-ink2 ml-2">
                · {target ? fmtNum(target.proteinTarget) : '—'} g proteine
              </span>
            </p>
          )}
          {target && (
            <p className="text-xs text-ink2 mt-0.5" data-testid="tdee-source">
              {SOURCE_LABELS[target.source]}
            </p>
          )}
        </div>
      </div>
      {/* §F-pass2-tdeestrip-03 (MED Wave 7 2026-05-23) — italic explainer copy
          per mockup L1713 verbatim. Sets user expectation: engine auto-calculates,
          logging optional for calibration. */}
      <p
        className="text-xs text-ink3 mt-2.5 leading-snug italic"
        data-testid="tdee-explainer"
      >
        Engine calculeaza auto. Loghezi optional pentru calibrare reala.
      </p>
    </section>
  );
}
