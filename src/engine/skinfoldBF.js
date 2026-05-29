// ══ SKINFOLD BF — Jackson-Pollock 3-site + Siri ══════════════════════════
// Estimare grasime corporala din pliuri cutanate masurate cu caliper (mm).
// Mai acurata decat US Navy (tape) cand user-ul are caliper; optional/advanced.
//
// Jackson-Pollock 3-site → densitate corporala (g/cm3), apoi Siri → %BF.
//
// Men (piept + abdomen + coapsa):
//   D = 1.10938 - 0.0008267·S + 0.0000016·S² - 0.0002574·age
// Women (triceps + suprailiac + coapsa):
//   D = 1.0994921 - 0.0009929·S + 0.0000023·S² - 0.0001392·age
//   unde S = suma celor 3 pliuri (mm).
// Siri:  %BF = 495 / D − 450
//
// PLAUSIBILITY GUARD (mirror usNavyBF) — pliuri in afara benzii fiziologice
// (un caliper citeste tipic 2-50 mm per sit; garbage paste / unit confusion)
// → null, deci consumer-ul cade pe US Navy / Deurenberg. Varsta ceruta (intra
// in formula); fara ea → null.
const SKINFOLD_BOUNDS = Object.freeze({ min: 2, max: 60 }); // mm per sit, realist caliper
const AGE_BOUNDS = Object.freeze({ min: 10, max: 100 });

/** True cand v e finit si in [min, max]. */
const inRange = (v, b) => Number.isFinite(v) && v >= b.min && v <= b.max;

/**
 * Estimate body-fat percentage via Jackson-Pollock 3-site skinfold + Siri.
 * Returns null cand vreun pliu / varsta lipseste, e non-pozitiv, SAU in afara
 * benzii fiziologice (garda anti-garbage-in, mirror usNavyBF).
 *
 * Men sites:   chest_mm, abdomen_mm, thigh_mm.
 * Women sites: triceps_mm, suprailiac_mm, thigh_mm.
 *
 * @param {{sex?: string, age?: number, chest_mm?: number, abdomen_mm?: number, thigh_mm?: number, triceps_mm?: number, suprailiac_mm?: number}} [m]
 * @returns {number|null} BF% rounded to 1 decimal, or null when inputs invalid
 */
export function estimateBF_skinfold3({
  sex,
  age,
  chest_mm,
  abdomen_mm,
  thigh_mm,
  triceps_mm,
  suprailiac_mm,
} = {}) {
  if (!inRange(age, AGE_BOUNDS)) return null;

  const sexLower = typeof sex === 'string' ? sex.toLowerCase() : '';
  const isFemale = sexLower === 'f' || sexLower === 'female';

  const sites = isFemale
    ? [triceps_mm, suprailiac_mm, thigh_mm]
    : [chest_mm, abdomen_mm, thigh_mm];

  for (const s of sites) {
    if (!inRange(s, SKINFOLD_BOUNDS)) return null;
  }

  const sum = sites[0] + sites[1] + sites[2];

  let density;
  if (isFemale) {
    density =
      1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * age;
  } else {
    density =
      1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * age;
  }

  if (!Number.isFinite(density) || density <= 0) return null;

  // Siri equation.
  const bf = 495 / density - 450;
  if (!Number.isFinite(bf)) return null;
  return Math.round(Math.max(2, Math.min(60, bf)) * 10) / 10;
}
