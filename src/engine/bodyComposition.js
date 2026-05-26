// ══ BODY COMPOSITION — two-tier body-fat % estimation ════════════════════
//
// Tier 1 (ESTIMATE): Deurenberg 1991 — BMI/age/sex only. Always available
//   post-onboarding (Big 6 + height). Population estimate (~4-5% SE), NOT a
//   body-composition measurement. Frame as estimate in UI.
// Tier 2 (ACCURATE): US-Navy (usNavyBF.js) — needs neck + waist (+hip female).
//
// Deurenberg returns a PERCENT (2-60), mirroring estimateBF_USNavy convention.
// Some engine code (goalAdaptation.computeLbm / pushBackTiers.computeRiskScore)
// expects a FRACTION (0-1) — that boundary divides by 100 at its own call site
// (scheduleAdapterAggregate.estimateBfFraction). Keep each consumer correct;
// convert at the boundary, NU here.
//
// Pure: ZERO Date.now / Math.random / mutation.

/**
 * Estimate body-fat percentage via Deurenberg (1991) — BMI/age/sex.
 *   BF% = 1.20·BMI + 0.23·age − 10.8·S − 5.4   (S = 1 male, 0 female)
 *   BMI = weightKg / heightM²
 *
 * Population estimate (~4-5% SE). Returns PERCENT (clamped 2-60), or null when
 * inputs invalid. Pure.
 *
 * @param {{sex?: string, weightKg?: number, heightCm?: number, ageYears?: number}} [m]
 * @returns {number|null} BF% rounded to 1 decimal, or null on invalid input
 */
export function estimateBF_Deurenberg({ sex, weightKg, heightCm, ageYears } = {}) {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (!Number.isFinite(heightCm) || heightCm <= 0) return null;
  if (!Number.isFinite(ageYears) || ageYears <= 0) return null;
  if (typeof sex !== 'string') return null;

  const sexLower = sex.toLowerCase();
  const sexFactor = sexLower === 'm' || sexLower === 'male' ? 1 : 0;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bf = 1.2 * bmi + 0.23 * ageYears - 10.8 * sexFactor - 5.4;

  if (!Number.isFinite(bf)) return null;
  return Math.round(Math.max(2, Math.min(60, bf)) * 10) / 10;
}
