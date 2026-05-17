// ══ BAYESIAN NUTRITION AGGREGATE — React-side TDEE/Protein Resolver ══════
// Phase 5 task_07 — adapter pentru Nutrition daily target.
// ZERO src/engine/* mutation per orchestrator §7. Composes react-side
// nutritionStore manual entries cu BN engine evaluate output (Phase 6+
// real wire) cu fallback baseline (mockup 2640 kcal / 180g protein).

import { useNutritionStore } from '../stores/nutritionStore';

// Baseline mockup wv2 verbatim (andura-clasic.html L1812/L1825). Phase 6+
// replaces cu BN evaluate(ctx) output (Kalman filter R2 gate + Bayesian
// posterior update — currently engine is async ctx-dependent + Tier-aware,
// requires DB stack + user profile, hard la consume sync React-side).
const BASELINE_KCAL_TARGET = 2640;
const BASELINE_PROTEIN_TARGET = 180;

export interface NutritionTarget {
  kcalTarget: number;
  proteinTarget: number;
  source: 'manual' | 'engine-bn' | 'baseline';
}

/**
 * Get today's nutrition target. Priority order: manual log > BN engine
 * evaluate output > baseline mockup. Phase 5 task_07 thin composer
 * (manual + baseline only); Phase 6+ wires BN evaluate(ctx) async.
 */
export function getNutritionTargetToday(dateISO: string): NutritionTarget {
  const entry = useNutritionStore.getState().getDaily(dateISO);
  if (entry?.kcal != null && entry?.protein != null) {
    return {
      kcalTarget: entry.kcal,
      proteinTarget: entry.protein,
      source: 'manual',
    };
  }
  // Phase 6+: const bnOutput = await bnEvaluate(ctx); if (bnOutput) ...
  return {
    kcalTarget: BASELINE_KCAL_TARGET,
    proteinTarget: BASELINE_PROTEIN_TARGET,
    source: 'baseline',
  };
}
