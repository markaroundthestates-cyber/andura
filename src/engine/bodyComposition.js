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

// ══ HEALTHY-FLOOR GUARDRAIL — anti-undereating safety (BUG #13 + BUG #4) ════
//
// WHO healthy-minimum BMI = 18.5 (sub = subponderal). Cand greutatea curenta e
// deja la/sub BMI 18.5, un deficit (kcal sub mentenanta) ar conduce spre rau.
//
// BUG #4 (CEO 2026-05-27) — un user subponderal trebuie sa CREASCA spre o
// greutate sanatoasa, NU sa stea la mentenanta. Mentenanta inseamna sa ramana
// subponderal pe termen nelimitat. Deci guardrail-ul NU mai clamp la mentenanta
// (zero deficit); clamp UP la un SURPLUS moderat de crestere lenta-sanatoasa
// (TDEE × LEAN_GAIN_SURPLUS_MULT, +8%) — exact faza BULK conservativa pe care
// engine-ul o recomanda deja AUTO unui user subponderal (phaseAutoDetection
// detectAutoPhaseFromBodyComp → BULK la BMI <= 18.5). Reuse acelasi
// multiplicator (single source, ZERO magic number nou).
//
// Guardrail-ul actioneaza pe OUTPUT (recomandarea de kcal), NU blocheaza
// input-ul (anti-paternalism ADR 013) — clamp UP + mesaj de sustinere.
//
// Distinct de LOCK 8 (floor absolut 1200 kcal/zi): acela e un plafon jos in
// valoare absoluta; ASTA e relativ la fiziologia user-ului (mentenanta lui),
// ca un user subponderal sa primeasca un surplus de crestere, NU deficit.

/** Pragul WHO de BMI sanatos-minim. Sub = subponderal → surplus de crestere. */
export const HEALTHY_MIN_BMI = 18.5;

// Multiplicatorul de surplus pentru crestere lenta-sanatoasa la subponderali —
// identic cu BULK conservativ (TDEE_MULTIPLIERS.BULK_CONSERVATIVE 1.08) pe care
// phaseAutoDetection il recomanda deja AUTO unui user sub BMI 18.5. +8% peste
// mentenanta = surplus modest (~0.25 kg/saptamana), nu un bulk agresiv. Tinut
// aici (NU importat din goalAdaptation/constants) ca bodyComposition sa ramana
// un leaf pur fara dep pe graful de faze — valoarea e o constanta documentata.
export const LEAN_GAIN_SURPLUS_MULT = 1.08;

/**
 * BMI = greutate(kg) / inaltime(m)². Pure. Returns null cand inputs invalide.
 *
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number|null} BMI (1 zecimala) sau null
 */
export function computeBMI(weightKg, heightCm) {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (!Number.isFinite(heightCm) || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi)) return null;
  return Math.round(bmi * 10) / 10;
}

/**
 * Greutatea (kg) corespunzatoare BMI sanatos-minim pentru o inaltime data —
 * tinta de greutate "sanatoasa de jos" spre care crestem un user subponderal.
 * Pure. Returns null cand inaltimea invalida.
 *
 * @param {number} heightCm
 * @returns {number|null} greutate la BMI 18.5 (1 zecimala) sau null
 */
export function healthyFloorWeightKg(heightCm) {
  if (!Number.isFinite(heightCm) || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round(HEALTHY_MIN_BMI * heightM * heightM * 10) / 10;
}

/**
 * Guardrail anti-subnutritie pe recomandarea de kcal (BUG #13 + BUG #4).
 *
 * Cand user-ul e deja la/sub BMI sanatos-minim (subponderal), coach-ul NU il
 * tine in deficit SAU la mentenanta — il duce spre o greutate sanatoasa cu un
 * SURPLUS moderat de crestere lenta (tinta = mentenanta × LEAN_GAIN_SURPLUS_MULT,
 * +8%). Recomandarea finala = max(rec, surplus de crestere): daca rec e SUB
 * surplus (deficit/mentenanta/surplus prea mic) o ridicam; daca e deja >= surplus
 * trece neatinsa (bulk explicit egal/mai mare).
 *
 * `clamped` (semnal UI pentru mesajul de sustinere) = subponderal, derivat DIRECT
 * din BMI <= HEALTHY_MIN_BMI — NU din comparatia leanGain-vs-rec. Motiv (audit
 * HIGH): pentru useri mici unde floor-ul absolut (1200) depaseste surplus-ul de
 * crestere (ex: Maria mentenanta 1104 → leanGain 1192, rec floored la 1200 > 1192),
 * vechea conditie `rec < leanGain` ramanea false → mesajul de sustinere nu se
 * afisa exact pentru cohorta subponderala vizata. Mesajul ("esti sub greutatea
 * sanatoasa, tinta are un mic surplus") e adevarat + util pentru ORICE subponderal,
 * indiferent daca kcal-ul a fost ridicat sau era deja la/peste surplus.
 *
 * Pure. Cand lipsesc greutate/inaltime/mentenanta (cold start) → passthrough
 * (nu fabricam un clamp fara semnal).
 *
 * @param {Object} input
 * @param {number} input.kcalRecommendation - kcal recomandat (post faza/goal)
 * @param {number} input.maintenanceKcal    - mentenanta reala per-user (kcal/zi)
 * @param {number|null} [input.weightKg]     - greutate curenta (kg)
 * @param {number|null} [input.heightCm]     - inaltime (cm)
 * @returns {{kcal: number, clamped: boolean, currentBmi: number|null}}
 */
export function clampKcalToHealthyFloor({ kcalRecommendation, maintenanceKcal, weightKg, heightCm }) {
  const rec = Number(kcalRecommendation);
  const maint = Number(maintenanceKcal);
  if (!Number.isFinite(rec)) return { kcal: rec, clamped: false, currentBmi: null };

  const bmi = computeBMI(Number(weightKg), Number(heightCm));
  // Fara semnal de fiziologie (cold start) sau mentenanta absenta → passthrough.
  if (bmi === null || !Number.isFinite(maint) || maint <= 0) {
    return { kcal: rec, clamped: false, currentBmi: bmi };
  }
  // Subponderal (BMI <= HEALTHY_MIN_BMI) → mesaj de sustinere ON (derivat din BMI
  // direct) + kcal cel putin la surplus-ul de crestere (ridica daca sub el; un
  // bulk explicit >= surplus trece neatins via max).
  if (bmi <= HEALTHY_MIN_BMI) {
    const leanGainTarget = Math.round(maint * LEAN_GAIN_SURPLUS_MULT);
    return { kcal: Math.max(rec, leanGainTarget), clamped: true, currentBmi: bmi };
  }
  return { kcal: rec, clamped: false, currentBmi: bmi };
}
