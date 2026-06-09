// ══ BODY-COMP LEAF — estimateBfFraction (module-graph cut) ════════════════
// Hygiene split (zero behavior change): estimateBfFraction was defined in
// scheduleAdapterAggregate.builder.ts and re-exported by the aggregate barrel.
// engineWrappers.nutrition.ts consumed it FROM the barrel, while builder.ts /
// compose.ts / workoutStore.logic.ts each import FROM nutrition.ts — closing 3
// circular dependencies through the barrel (madge hard-gate). This LEAF module
// depends only on engine/bodyComposition.js (a true leaf with no onward imports
// into this cluster), so nutrition.ts and builder.ts both import from here and
// the nutrition→aggregate back-edge is severed. The barrel + builder.ts keep
// re-exporting estimateBfFraction → public API unchanged.

import { estimateBF_Deurenberg } from '../../engine/bodyComposition.js';

/**
 * Estimate body-fat as a FRACTION (0.0-1.0) from BMI/age/sex via Deurenberg
 * 1991: BF% = 1.20·BMI + 0.23·age − 10.8·sex − 5.4 (sex: male=1, female=0).
 * The percent is divided by 100 → FRACTION, because the engine thresholds are
 * fractional (bfPctHighMale 0.25); a raw percent would false-positive every
 * user (CRITICAL trap). Clamp [0.03, 0.60]. undefined when any input missing →
 * engine sees absent → no false BF-high risk (computeRiskScore guards
 * Number.isFinite(bf) && bf > 0). Population estimate, fitness-not-medicine —
 * NOT a body-composition measurement. Pure.
 *
 * @param input weight (kg), height (cm), age (years), sex ('m'|'f')
 */
export function estimateBfFraction(input: {
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  sex?: string | null;
}): number | undefined {
  // Canonical Deurenberg math lives in engine/bodyComposition (PERCENT 2-60).
  // Single source of truth — here we divide to a FRACTION at the engine
  // boundary (engine thresholds are fractional; raw percent false-positives
  // every user, CRITICAL trap) + apply the engine clamp [0.03, 0.60].
  const bfPercent = estimateBF_Deurenberg({
    weightKg: Number(input.weight),
    heightCm: Number(input.height),
    ageYears: Number(input.age),
    ...(typeof input.sex === 'string' ? { sex: input.sex } : {}),
  });
  if (bfPercent == null) return undefined;
  const fraction = bfPercent / 100; // percent → FRACTION (engine thresholds are fractional)
  return Math.min(0.6, Math.max(0.03, fraction));
}
