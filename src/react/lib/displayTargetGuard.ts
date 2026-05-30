// ══ DISPLAY TARGET GUARD — re-guard the FINAL summed display kcal ══════════
//
// The Progres "Target Today" hero re-assembles the displayed kcal at the DISPLAY
// layer: engine target → fatigue ease (+) → aerobic class add-on (+). Those
// add-ons happen OUTSIDE the guarded engine path, so they can re-introduce the
// exact safety bugs the engine was built to kill:
//   - push a subponderal user below the healthy-floor guardrail (the add-ons run
//     on top of the engine's already-clamped target, but a manual edit / future
//     path could still under-run, and the safety message references this number);
//   - push a CUT/MAINTENANCE day ABOVE maintenance (the fatigue ease caps itself
//     at maintenance, but a stacked aerobic add-on can blow past it → a SURPLUS
//     on a cut day).
//
// This is the ONE guard applied to the FINAL summed target, AFTER ease + aerobic
// add-on. It REUSES the engine's own floor helpers (resolveKcalFloorForSex +
// clampKcalToHealthyFloor) rather than duplicating constants, and reads
// sex/weight/height at the I/O boundary. Order matches the engine: hard floor →
// healthy floor → (deficit-phase) maintenance ceiling.

import { resolveKcalFloorForSex } from '../../engine/bayesianNutrition/constants.js';
import { clampKcalToHealthyFloor } from '../../engine/bodyComposition.js';
import { useOnboardingStore } from '../stores/onboardingStore';
import { getCurrentWeightKg } from './userTdee';

export interface GuardedDisplayTarget {
  /** The guarded display kcal target. */
  kcal: number;
  /** True when the maintenance ceiling clamped the summed target down. */
  ceilingClamped: boolean;
}

/**
 * Re-guard the FINAL summed display kcal target (after fatigue ease + aerobic
 * add-on). Pure-ish I/O boundary (reads onboardingStore sex/height + canonical
 * current weight). Reuses the engine floor helpers — no duplicated constants.
 *
 * Invariants enforced, in order:
 *   1. Hard floor (sex-aware): never below 1200 (m) / 1000 (f). Hard floor ONLY
 *      (Daniel: no BMR floor at the display).
 *   2. Healthy floor: when BMI <= 18.5, never below the lean-gain surplus the
 *      engine guardrail enforces (clampKcalToHealthyFloor).
 *   3. Maintenance ceiling (deficit phases only): on a CUT/MAINTENANCE day the
 *      displayed target must NEVER exceed maintenance, even after ease + aerobic
 *      add-on. A day is "deficit" when the engine base target is at/below
 *      maintenance; surplus phases (BULK/STRENGTH, base > maintenance) are exempt.
 *
 * @param summedKcal     the post-(ease + aerobic add-on) display kcal.
 * @param baseAutoKcal   the engine's guarded base target (pre add-ons) — drives
 *                       the deficit/surplus classification for the ceiling.
 * @param maintenanceKcal user maintenance TDEE (null/non-finite → ceiling skipped).
 */
export function guardDisplayTarget(
  summedKcal: number,
  baseAutoKcal: number,
  maintenanceKcal: number | null,
): GuardedDisplayTarget {
  if (!Number.isFinite(summedKcal)) {
    return { kcal: summedKcal, ceilingClamped: false };
  }

  const { sex, height } = useOnboardingStore.getState().data;
  const weight = getCurrentWeightKg();

  // 1. Hard floor (sex-aware) — never below the absolute survival minimum.
  let kcal = Math.max(summedKcal, resolveKcalFloorForSex(sex));

  // 2. Healthy floor — subponderal (BMI <= 18.5) never below the lean-gain
  //    surplus the engine guardrail enforces. Cold-start (no stats) → passthrough.
  const healthy = clampKcalToHealthyFloor({
    kcalRecommendation: kcal,
    maintenanceKcal: maintenanceKcal ?? NaN,
    weightKg: weight,
    heightCm: height,
  });
  kcal = healthy.kcal;

  // 3. Maintenance ceiling — a deficit/maintenance day (engine base at/below
  //    maintenance) must never DISPLAY above maintenance after the add-ons.
  //    Skip the ceiling for surplus phases (base above maintenance = BULK/STRENGTH)
  //    and when the healthy floor deliberately raised a subponderal user up
  //    (clamped) — that raise is the higher-priority safety intent.
  let ceilingClamped = false;
  if (
    maintenanceKcal != null &&
    Number.isFinite(maintenanceKcal) &&
    !healthy.clamped &&
    baseAutoKcal <= maintenanceKcal &&
    kcal > maintenanceKcal
  ) {
    kcal = maintenanceKcal;
    ceilingClamped = true;
  }

  return { kcal: Math.round(kcal), ceilingClamped };
}
