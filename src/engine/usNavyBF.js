// ══ US NAVY BF FORMULA — Body Fat % estimation + weight-at-target projection
// Metric form (Hodgdon-Beckett 1984) — inputs in cm (NU inches).
//
// Men:   %BF = 495 / (1.0324  − 0.19077·log10(waist − neck) + 0.15456·log10(height)) − 450
// Women: %BF = 495 / (1.29579 − 0.35004·log10(waist + hip − neck) + 0.22100·log10(height)) − 450
//
// Used as alternative to caliper / DEXA when only tape measurements available.

/** @param {number} n */
const LOG10 = (n) => Math.log(n) / Math.LN10;

/**
 * Estimate body-fat percentage via US Navy method (metric form).
 * @param {{sex?: string, height_cm?: number, neck_cm?: number, waist_cm?: number, hip_cm?: number}} [m]
 * @returns {number|null} BF% rounded to 1 decimal, or null when inputs invalid
 */
export function estimateBF_USNavy({ sex, height_cm, neck_cm, waist_cm, hip_cm } = {}) {
  if (!height_cm || !neck_cm || !waist_cm) return null;
  if (height_cm <= 0 || neck_cm <= 0 || waist_cm <= 0) return null;

  const sexLower = typeof sex === 'string' ? sex.toLowerCase() : '';
  const isFemale = sexLower === 'f' || sexLower === 'female';

  let bf;
  if (isFemale) {
    if (!hip_cm || hip_cm <= 0) return null;
    const inner = waist_cm + hip_cm - neck_cm;
    if (inner <= 0) return null;
    const denom = 1.29579 - 0.35004 * LOG10(inner) + 0.22100 * LOG10(height_cm);
    if (denom <= 0) return null;
    bf = 495 / denom - 450;
  } else {
    const inner = waist_cm - neck_cm;
    if (inner <= 0) return null;
    const denom = 1.0324 - 0.19077 * LOG10(inner) + 0.15456 * LOG10(height_cm);
    if (denom <= 0) return null;
    bf = 495 / denom - 450;
  }

  if (!Number.isFinite(bf)) return null;
  return Math.round(Math.max(2, Math.min(60, bf)) * 10) / 10;
}

/**
 * Project target weight given current weight + BF% and a target BF%.
 * Assumes LBM constant — only fat mass changes.
 *
 * @param {{currentKg?: number, currentBF?: number, targetBF?: number}} [p]
 * @returns {number|null} target weight kg rounded to 1 decimal, or null on invalid input
 */
export function projectWeightAtTargetBF({ currentKg, currentBF, targetBF } = {}) {
  if (!currentKg || currentBF == null || targetBF == null) return null;
  if (currentKg <= 0 || currentBF < 0 || currentBF >= 100) return null;
  if (targetBF < 0 || targetBF >= 100) return null;
  const lbm = currentKg * (1 - currentBF / 100);
  const targetKg = lbm / (1 - targetBF / 100);
  if (!Number.isFinite(targetKg) || targetKg <= 0) return null;
  return Math.round(targetKg * 10) / 10;
}
