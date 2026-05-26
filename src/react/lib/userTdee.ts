// ══ USER TDEE — Per-user maintenance TDEE (Piesa 1 nutrition-brain fix) ═══
//
// Real per-user maintenance TDEE base pentru nutrition kcal target. Inlocuieste
// baza flat 2640 din engineWrappers.getNutritionTargetsToday (bug central:
// Maria 40kg mentenanta primea 2640, Marius 110kg/2m bulk primea 2851 — ambele
// absurde fiindca multiplicatorul de faza se aplica pe constanta hardcodata).
//
// Formula = Mifflin-St Jeor BMR (gold standard 1990) × activity factor 1.55.
//   M: 10·kg + 6.25·cm - 5·age + 5
//   F: 10·kg + 6.25·cm - 5·age - 161
//
// Reuse: aceeasi formula Mifflin-St Jeor folosita de BMRStrip.tsx (strip-ul
// "Calorii baza ~1.790 kcal/zi") + activity factor 1.55 verbatim din legacy
// SYS.estimateTDEE() (src/engine/sys.js:68 `Math.round(bmr * 1.55)`). 1.55 =
// "moderat activ" (3-5 sesiuni/sapt), default rezonabil pt user de sala.
//
// Pure-function discipline: computeMaintenanceTDEE NU citeste store / NU are
// side-effects. readUserMaintenanceTDEE = I/O boundary (citeste onboardingStore)
// + deleaga la pura. Returns null cand stats absente (cold start fara onboarding)
// → caller pastreaza fallback baseline.

import { useOnboardingStore } from '../stores/onboardingStore';
import type { Sex } from '../stores/onboardingStore';

// Activity factor "moderat activ" — verbatim legacy SYS.estimateTDEE()
// (src/engine/sys.js:68). Single source of truth pentru BMR→TDEE multiplier.
export const ACTIVITY_FACTOR = 1.55;

// Protein target g/kg greutate corporala. Spec Piesa 1: "Proteine = g/kg ×
// greutate (per-user, nu flat)". Constanta nu exista exportata in cod (engine
// MACRO_BANDS = g/kg LBM, dar LBM cere BF% indisponibil din onboarding singur).
// 1.8 g/kg corp = mid-range standard pentru trainee (sub pragul de alerta
// proactiveEngine.js:15 "2.2g/kg corp", peste minim conservare masa musculara).
export const PROTEIN_G_PER_KG_BODYWEIGHT = 1.8;

// Romanian population height averages (INS data ~2020). Fallback DOAR pentru
// useri pre-v3 cu height null (onboarded inainte de P-02). Mirror BMRStrip.tsx
// HEIGHT_CM_BY_SEX_AVG — Gigel vede estimare utila in loc de null.
const HEIGHT_CM_BY_SEX_AVG: Record<Sex, number> = { m: 178, f: 165 };

export interface UserStatsInput {
  sex: Sex | null;
  weightKg: number | null;
  ageYears: number | null;
  heightCm: number | null;
}

/**
 * Mifflin-St Jeor BMR (kcal/zi). Returns null cand inputs incomplete.
 * Foloseste height-ul colectat (P-02); fallback sex-avg doar cand height null.
 * Pure — identica cu BMRStrip.tsx computeMifflinStJeorBMR.
 */
export function computeMifflinStJeorBMR(stats: UserStatsInput): number | null {
  const { sex, weightKg, ageYears, heightCm } = stats;
  if (sex === null || weightKg === null || ageYears === null) return null;
  if (weightKg <= 0 || ageYears <= 0) return null;
  const h = heightCm !== null && heightCm > 0 ? heightCm : HEIGHT_CM_BY_SEX_AVG[sex];
  const base = 10 * weightKg + 6.25 * h - 5 * ageYears;
  const bmr = sex === 'm' ? base + 5 : base - 161;
  return Math.round(bmr);
}

/**
 * Per-user maintenance TDEE = BMR × activity factor. Returns null cand stats
 * incomplete (caller pastreaza baseline fallback). Pure function.
 */
export function computeMaintenanceTDEE(stats: UserStatsInput): number | null {
  const bmr = computeMifflinStJeorBMR(stats);
  if (bmr === null) return null;
  return Math.round(bmr * ACTIVITY_FACTOR);
}

/**
 * I/O boundary — read user stats din onboardingStore + compute maintenance
 * TDEE. Returns null cand stats absente (cold start) → caller fallback baseline.
 */
export function readUserMaintenanceTDEE(): number | null {
  const { sex, weight, age, height } = useOnboardingStore.getState().data;
  return computeMaintenanceTDEE({ sex, weightKg: weight, ageYears: age, heightCm: height });
}

/**
 * I/O boundary — read user bodyweight (kg) din onboardingStore. Pentru
 * protein target g/kg × greutate. Returns null cand absent.
 */
export function readUserWeightKg(): number | null {
  return useOnboardingStore.getState().data.weight;
}

/**
 * Protein target (g) = g/kg × greutate corporala. Pure. Returns null cand
 * greutate absenta (caller pastreaza protein baseline).
 */
export function computeProteinTargetG(weightKg: number | null): number | null {
  if (weightKg === null || weightKg <= 0) return null;
  return Math.round(weightKg * PROTEIN_G_PER_KG_BODYWEIGHT);
}
