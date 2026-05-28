// ══ NUTRITION PROJECTION — Piesa 4 nutrition-brain fix ("Preconizare") ════
//
// Forward projection din traiectoria curenta a userului (Daniel verbatim:
// "daca continui asa, in 3-4 saptamani o sa ai X greutate, Y bf"). NU o
// promisiune — o extrapolare la ritmul curent (intake mediu vs TDEE estimat).
//
// ── Lantul de calcul ────────────────────────────────────────────────────
//   balanta zilnica  = avgIntake − tdeeEstimate         (kcal/zi)
//   Δgreutate        = (balanta × zile) / 7700           (kg; 7700 kcal/kg)
//   greutate proiect. = greutate curenta + Δgreutate
//   bf% proiectat    = recompute din fat mass nou / greutate noua
//
// ── TDEE estimat (de unde) ─────────────────────────────────────────────────
// tdeeEstimate = BN engine posterior.mu (readTdeeEstimateKcal in engineWrappers)
// = cheltuiala energetica estimata a userului (kcal/zi), driven de
// demographicMu (mentenanta Piesa 1) + observatiile energy-balance (Piesa 2).
// NU folosim kcalTarget (acela e tinta ajustata pe faza+floor, NU expenditure).
//
// ── BF% proiectat — split FM:LBM ────────────────────────────────────────────
// Presupunem ca delta de greutate e PREDOMINANT masa grasa, LBM ~conservat:
//   - LOSS (deficit): 0.75 din Δkg = fat mass (cut bun pastreaza muschiul;
//     ~75% FM loss e tipic la deficit moderat cu proteine adecvate).
//   - GAIN (surplus): 0.60 din Δkg = fat mass (lean bulk → ~40% LBM gain
//     posibil la trainee; restul FM). Conservator: nu supra-promitem muschi.
// LBM_nou = LBM_curent + (1 − fmRatio)·Δkg ; FM_nou = FM_curent + fmRatio·Δkg
// bf%_nou = FM_nou / greutate_noua. Daca currentBfPct null (fara masuratori)
// → proiectam DOAR greutatea, omitem bf (estimateBF_USNavy needs tape).
//
// Pure-function discipline: ZERO Date.now / Math.random / mutation / store
// read. horizonDays + now-derived inputs injectate la I/O boundary (caller).

// Forbes/Hall: ~7700 kcal per kg greutate corporala. Single source semantic
// (mirror nutritionObservations.KCAL_PER_KG / kalmanFilter.js:28).
export const KCAL_PER_KG = 7700;

// Split masa grasa : masa slaba pentru delta de greutate proiectata.
// Documentat in cap-fisier. LOSS 0.75 FM / GAIN 0.60 FM.
export const FM_RATIO_LOSS = 0.75;
export const FM_RATIO_GAIN = 0.6;

// Sub aceasta balanta absoluta (kcal/zi) consideram traiectoria "mentenanta"
// (zgomot intake/cantar domina) → "te mentii", NU proiectam delta nesemnificativa.
// ~75 kcal/zi × 28 zile / 7700 ≈ 0.27 kg pe 4 sapt — sub pragul perceptibil.
export const MAINTENANCE_BALANCE_KCAL = 75;

// Clamp defensiv pe delta proiectata (kg) — protejeaza de intake/TDEE absurd
// (ex: log gresit 8000 kcal). ±0.5 kg/sapt × 6 sapt orizont max ≈ 3 kg cap pe
// 28 zile la balanta sanatoasa; cap la 8 kg ca margine larga anti-glitch.
export const MAX_ABS_DELTA_KG = 8;

export type ProjectionDirection = 'loss' | 'gain' | 'maintain';

export interface ProjectionInput {
  /** TDEE estimat (kcal/zi) — BN engine posterior.mu. Null cand indisponibil. */
  tdeeEstimateKcal: number | null;
  /** Intake mediu zilnic recent (kcal/zi). Null cand nicio zi logata. */
  avgIntakeKcal: number | null;
  /** Greutate curenta (kg). Null cand absenta. */
  currentWeightKg: number | null;
  /** BF% curent (procent 0-100). Null cand nederivabil (fara masuratori). */
  currentBfPct: number | null;
  /** Orizont proiectie in zile (injectat — ex 28 pentru ~4 sapt). */
  horizonDays: number;
}

export interface ProjectionResult {
  /** Orizontul proiectiei (zile) — echo input, pentru UI label. */
  horizonDays: number;
  /** Greutate proiectata (kg, 1 zecimala). */
  projectedWeightKg: number;
  /** Delta greutate proiectata (kg, 1 zecimala; negativ = slabire). */
  deltaWeightKg: number;
  /** BF% proiectat (procent 0-100, 1 zecimala). Null cand currentBfPct null. */
  projectedBfPct: number | null;
  /** Directia traiectoriei. */
  direction: ProjectionDirection;
}

/**
 * Proiectie forward pura. Returns null cand nu putem proiecta (TDEE sau intake
 * sau greutate absente). 'maintain' cand balanta sub pragul perceptibil →
 * deltaWeightKg ~0, projectedWeight = currentWeight, bf neschimbat.
 */
export function projectTrajectory(input: ProjectionInput): ProjectionResult | null {
  const { tdeeEstimateKcal, avgIntakeKcal, currentWeightKg, currentBfPct, horizonDays } = input;

  if (tdeeEstimateKcal == null || !Number.isFinite(tdeeEstimateKcal)) return null;
  if (avgIntakeKcal == null || !Number.isFinite(avgIntakeKcal)) return null;
  if (currentWeightKg == null || !Number.isFinite(currentWeightKg) || currentWeightKg <= 0) {
    return null;
  }
  if (!Number.isFinite(horizonDays) || horizonDays <= 0) return null;

  const balanceKcal = avgIntakeKcal - tdeeEstimateKcal;

  // Maintenance guard — balanta sub prag → traiectorie plata.
  if (Math.abs(balanceKcal) < MAINTENANCE_BALANCE_KCAL) {
    return {
      horizonDays,
      projectedWeightKg: round1(currentWeightKg),
      deltaWeightKg: 0,
      projectedBfPct: currentBfPct != null && Number.isFinite(currentBfPct)
        ? round1(currentBfPct)
        : null,
      direction: 'maintain',
    };
  }

  let deltaKg = (balanceKcal * horizonDays) / KCAL_PER_KG;
  // Clamp absurd (intake/TDEE glitch).
  deltaKg = Math.max(-MAX_ABS_DELTA_KG, Math.min(MAX_ABS_DELTA_KG, deltaKg));

  const projectedWeightKg = currentWeightKg + deltaKg;
  const direction: ProjectionDirection = deltaKg < 0 ? 'loss' : 'gain';

  // BF% recompute — delta predominant fat mass, LBM ~conservat.
  let projectedBfPct: number | null = null;
  if (currentBfPct != null && Number.isFinite(currentBfPct) && currentBfPct > 0 && currentBfPct < 100) {
    const currentFatMass = currentWeightKg * (currentBfPct / 100);
    const fmRatio = direction === 'loss' ? FM_RATIO_LOSS : FM_RATIO_GAIN;
    const projectedFatMass = currentFatMass + fmRatio * deltaKg;
    if (projectedWeightKg > 0 && projectedFatMass >= 0) {
      const bf = (projectedFatMass / projectedWeightKg) * 100;
      // Clamp la banda fiziologica (mirror estimateBF_USNavy 2-60).
      projectedBfPct = round1(Math.max(2, Math.min(60, bf)));
    }
  }

  return {
    horizonDays,
    projectedWeightKg: round1(projectedWeightKg),
    deltaWeightKg: round1(deltaKg),
    projectedBfPct,
    direction,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── I/O boundary (impure plumbing) ──────────────────────────────────────────

import { useProgresStore, latestBodyMeasurements } from '../stores/progresStore';
import { useNutritionStore } from '../stores/nutritionStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { readBayesianNutritionContext } from './nutritionObservations';
import { readTdeeEstimateKcal } from './engineWrappers';
import { getCurrentWeightKg } from './userTdee';
import { estimateBF_USNavy } from '../../engine/usNavyBF.js';
import { estimateBF_Deurenberg } from '../../engine/bodyComposition.js';

/** Orizont default proiectie — 28 zile (~4 saptamani), per Daniel verbatim. */
export const DEFAULT_HORIZON_DAYS = 28;

// Cate zile recente de intake logat folosim ca medie "ritm curent". Fereastra
// scurta = reflecta traiectoria ACTUALA, nu istoric vechi. ~14 zile = 2 sapt.
const RECENT_INTAKE_WINDOW_DAYS = 14;

/** Parse 'YYYY-MM-DD' → millis UTC. Returns NaN cand invalid. */
function dateISOToMs(dateISO: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Media intake-ului logat (kcal) pe ultimele `windowDays` zile pana la `nowMs`.
 * Pure (nowMs injectat). Foloseste DOAR zile cu kcal logat manual. Returns null
 * cand nicio zi logata in fereastra.
 */
export function avgRecentLoggedIntake(
  dailyLog: ReadonlyArray<{ dateISO: string; kcal: number | null }>,
  nowMs: number,
  windowDays: number = RECENT_INTAKE_WINDOW_DAYS,
): number | null {
  const startMs = nowMs - windowDays * 24 * 60 * 60 * 1000;
  let sum = 0;
  let count = 0;
  for (const entry of dailyLog) {
    if (entry.kcal == null || !Number.isFinite(entry.kcal)) continue;
    const ms = dateISOToMs(entry.dateISO);
    if (!Number.isFinite(ms)) continue;
    if (ms >= startMs && ms <= nowMs) {
      sum += entry.kcal;
      count += 1;
    }
  }
  if (count === 0) return null;
  return sum / count;
}

/**
 * Deriva BF% curent (procent 0-100) — model two-tier:
 *   - ACURAT: US-Navy cand neck+waist (+hip femei) masurate (persistate in
 *     progresStore.bodyData via SettingsProfile) + height/sex onboarding.
 *   - ESTIMAT: fallback Deurenberg (BMI/varsta/sex) — mereu disponibil
 *     post-onboarding (Big6 + height). Estimare populationala (~4-5% SE).
 * Returns null DOAR la cold start total (fara stats onboarding). Pure-ish:
 * citeste stores. NU divide la fractie aici — consumer (projectTrajectory)
 * asteapta PERCENT 0-100 (conventia usNavyBF). Engine fraction-boundary e
 * separat (scheduleAdapterAggregate.estimateBfFraction).
 */
export function deriveCurrentBfPct(): number | null {
  const { sex, height, age } = useOnboardingStore.getState().data;
  // Canonical greutate curenta (ultima logata > onboarding) pentru Deurenberg —
  // era inghetata pe onboarding (audit CRIT split source-of-truth).
  const weight = getCurrentWeightKg();
  const bodyData = useProgresStore.getState().bodyData;
  // Smoke 2026-05-28 #15 — agregare per camp peste TOATE intrarile (NU doar
  // ultima). Cand gat-ul a fost introdus din Cont si piept-ul din Progres,
  // ultima intrare nu mai are gat → BF% cadea pe Deurenberg desi gat-ul tot
  // exista in istoric. Same source of truth pentru ambele formulare.
  const latest = latestBodyMeasurements(bodyData);

  // Tier 1 (ACURAT) — US-Navy cand exista masuratori (neck + waist).
  if (latest.neckCm !== undefined && latest.waistCm !== undefined) {
    const args: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number; hip_cm?: number } = {};
    if (sex) args.sex = sex;
    if (height) args.height_cm = height;
    args.neck_cm = latest.neckCm;
    args.waist_cm = latest.waistCm;
    if (latest.hipsCm !== undefined) args.hip_cm = latest.hipsCm;
    const navy = estimateBF_USNavy(args);
    if (navy != null) return navy;
  }

  // Tier 2 (ESTIMAT) — Deurenberg din onboarding (mereu disponibil post-onb).
  return estimateBF_Deurenberg({
    weightKg: weight ?? NaN,
    heightCm: height ?? NaN,
    ageYears: age ?? NaN,
    ...(sex ? { sex } : {}),
  });
}

/**
 * I/O boundary — citeste TDEE estimat (BN posterior.mu) + intake recent mediu +
 * greutate curenta + BF% derivat → deleaga la projectTrajectory pura.
 *
 * `now` injectabil pentru test determinism (default Date.now la boundary).
 * Returns null cand nu putem proiecta (lipsa TDEE / intake / greutate).
 */
export async function readNutritionProjection(
  now: number = Date.now(),
  horizonDays: number = DEFAULT_HORIZON_DAYS,
): Promise<ProjectionResult | null> {
  const ctx = readBayesianNutritionContext();
  const tdeeEstimateKcal = await readTdeeEstimateKcal(ctx);

  const dailyLog = useNutritionStore.getState().dailyLog;
  const avgIntakeKcal = avgRecentLoggedIntake(dailyLog, now);

  // Canonical greutate curenta: ultima logata > onboarding (sursa unica, audit CRIT).
  const currentWeightKg = getCurrentWeightKg();

  const currentBfPct = deriveCurrentBfPct();

  return projectTrajectory({
    tdeeEstimateKcal,
    avgIntakeKcal,
    currentWeightKg,
    currentBfPct,
    horizonDays,
  });
}
