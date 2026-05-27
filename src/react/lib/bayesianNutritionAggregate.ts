// ══ BAYESIAN NUTRITION AGGREGATE — Phase 6 task_04 Real Wire Async ═══════
// Per DECISIONS.md §D027 cascade. Replaces Phase 5 task_07 hardcoded
// baselines BASELINE_KCAL_TARGET=2640 / BASELINE_PROTEIN_TARGET=180 cu real
// engineWrappers.getNutritionTargetsToday() async wrapper care invoke
// bayesianNutrition.evaluate(ctx) Kalman filter posterior.mu output.
//
// Priority order preserved invariant:
//   1. Manual log (user override priority)
//   2. BN engine output (Kalman adaptive TDEE)
//   3. Baseline fallback (engine throws OR tier 'none' T0 fresh)
//
// Macros (protein) preserved baseline V1 — engine domain Kalman TDEE
// only NU emit macro split (anti-recurrence task_03 §1 inline note).

import { useNutritionStore } from '../stores/nutritionStore';
import { getNutritionTargetsToday } from './engineWrappers';
import type { BayesianNutritionContext } from '../../engine/bayesianNutrition/index';

export interface NutritionTarget {
  kcalTarget: number;
  proteinTarget: number;
  source: 'manual' | 'engine-bn' | 'baseline';
  confidence: number; // 0-1 Kalman filter posterior state
  // BUG #4 safety — true cand kcal-ul a fost ridicat la un surplus de crestere
  // fiindca user-ul e subponderal (BMI <= 18.5). UI arata mesajul de sustinere.
  healthyFloorClamped?: boolean;
}

/**
 * Get today's nutrition target via real engine wire. Async signature
 * consumed via useState + useEffect loading pattern în NutritionInline.
 *
 * Priority: manual log > BN engine evaluate output > baseline fallback.
 * Manual log entry detected via getDaily(dateISO).kcal !== null AND
 * .protein !== null (full manual override).
 *
 * @param dateISO YYYY-MM-DD daily entry key
 * @param userState optional engineContext seed pentru BN ctx pipeline
 */
export async function getNutritionTargetTodayReal(
  dateISO: string,
  userState?: BayesianNutritionContext,
): Promise<NutritionTarget> {
  // Priority 1: manual log full override
  const entry = useNutritionStore.getState().getDaily(dateISO);
  if (entry?.kcal != null && entry?.protein != null) {
    return {
      kcalTarget: entry.kcal,
      proteinTarget: entry.protein,
      source: 'manual',
      confidence: 1,
    };
  }

  // Priority 2: engine real wire (LOCK 8 floor 1200 + BUG #13 healthy-floor
  // guardrail enforced inside wrapper)
  const engineTargets = await getNutritionTargetsToday(userState);
  return {
    kcalTarget: engineTargets.kcalTarget,
    proteinTarget: engineTargets.proteinTargetG,
    source: engineTargets.source === 'engine' ? 'engine-bn' : 'baseline',
    confidence: engineTargets.confidence,
    healthyFloorClamped: engineTargets.healthyFloorClamped ?? false,
  };
}
