// ══ NUTRITION OBSERVATIONS BUILDER — Piesa 2 nutrition-brain fix ═══════════
//
// Construieste array-ul de observatii + BayesianNutritionContext din care
// engine-ul Bayesian/Kalman (src/engine/bayesianNutrition/index.js) iese din
// tier 'none' si ADAPTEAZA TDEE-ul real per-user. Pana la Piesa 2, cele 2
// call-site-uri (NutritionInline.tsx, TDEEStrip.tsx) chemau engine-ul cu ctx
// gol → evaluateBN({}) → tier 'none' → baseline. Acum hranesc engine-ul cu:
//   1. demographicMu = TDEE mentenanta per-user (Piesa 1) → prior real, scapa
//      tier-none chiar cu 0 observatii (fresh user primeste estimare per-user).
//   2. observations[] = TDEE estimat din ENERGY BALANCE pe ferestre de trend
//      greutate (cantarul = adevarul de baza).
//
// ── CONTRACTUL EXACT al engine-ului (verificat in index.js, NU ghicit) ──────
// Engine-ul citeste meta.observations[].weightDelta (numeric), face media
// (sampleMean) si o combina conjugat Normal-Normal cu meta.demographicMu →
// posterior.mu. engineWrappers.ts:654 citeste posterior.mu CA estimare kcal
// TDEE. Deci AMBELE (demographicMu + observation.weightDelta) sunt in KCAL —
// fiecare observatie poarta estimarea TDEE (kcal) a ferestrei respective, NU
// delta de kg. (Numele field-ului "weightDelta" e mostenit din schema V1
// weightDelta-only; engine-ul il foloseste generic ca "sample value".)
// meta.kcalFloorMin = floor sex-diferentiat forwarded la filterKcalFloor.
// profileTier (T0/T1/T2) seteaza blend-ul prior/input (T0=70/30, T1=20/80).
//
// ── ENERGY BALANCE (grain of salt — crede cantarul) ─────────────────────────
// Principiu: TDEE ≈ intake_logat_mediu − (Δgreutate_kg × 7700 kcal/kg) / zile.
// Fereastra de trend greutate (de la o cantarire la urmatoarea) = adevarul de
// baza. Daca user logheaza deficit dar se ingrasa (Δgreutate > 0), termenul
// (Δkg × 7700) creste TDEE-ul estimat → tratam log-ul ca sub-raportat. Logul
// e un input zgomotos; schimbarea de greutate conduce inferenta. Conjugate
// update + Kalman din engine sunt noise-robust by design (vezi index.js).
//
// Pure-function discipline: buildBayesianNutritionContext + helperele sunt
// pure (ZERO Date.now / Math.random / mutation / store read). Plumbing-ul
// (citire store + onboarding) sta la I/O boundary in call-site-uri.

import type { BayesianNutritionContext } from '../../engine/bayesianNutrition/index';
import { useProgresStore } from '../stores/progresStore';
import type { WeightEntry } from '../stores/progresStore';
import { useNutritionStore } from '../stores/nutritionStore';
import type { NutritionDailyEntry } from '../stores/nutritionStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import type { Sex } from '../stores/onboardingStore';
import { readUserMaintenanceTDEE } from './userTdee';
import { resolveKcalFloorForSex } from '../../engine/bayesianNutrition/constants.js';

// Forbes/Hall: ~7700 kcal per kg de greutate corporala (mixed FFM:FM loss).
// Verbatim Kalman filter comment (kalmanFilter.js:28). Single source semantic.
export const KCAL_PER_KG = 7700;

// Demographic prior sigma (kcal). Latimea incertitudinii prior-ului per-user.
// ~250 kcal = banda rezonabila in jurul mentenantei Mifflin (activity factor
// 1.55 ipoteza); lasa observatiile sa miste posterior-ul fara overshoot.
export const DEMOGRAPHIC_SIGMA_KCAL = 250;

// Variatia minima de zile intre 2 cantariri ca sa formeze o fereastra valida.
// Sub asta, zgomotul scalei (apa/glicogen) domina semnalul → skip.
const MIN_WINDOW_DAYS = 1;

export interface ObservationsBuilderInput {
  weightLog: ReadonlyArray<WeightEntry>;
  dailyLog: ReadonlyArray<NutritionDailyEntry>;
  /** TDEE mentenanta per-user (Piesa 1 readUserMaintenanceTDEE). Null cand stats absente. */
  maintenanceTDEE: number | null;
  sex: Sex | null;
  /** 'T0' | 'T1' | 'T2' calibration tier. Default 'T0' cold start. */
  profileTier?: string;
}

/** Observatie interna in unitati kcal (weightDelta = estimare TDEE fereastra). */
export interface NutritionObservation {
  weightDelta: number; // estimare TDEE (kcal) a ferestrei — vezi contract sus
  kcalDaily: number; // intake mediu logat (kcal) — pentru floor filter
  timestampMs: number; // ts-ul cantaririi de capat fereastra (ordering)
  [k: string]: unknown; // compat schema engine observations (index signature)
}

/** Parse 'YYYY-MM-DD' → millis UTC. Pure (NU Date.now). Returns NaN cand invalid. */
function dateISOToMs(dateISO: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Media intake-ului logat (kcal) pe intervalul [startMs, endMs]. Foloseste
 * DOAR zilele cu kcal logat manual (kcal != null). Returns null cand nicio zi
 * logata in fereastra (NU putem estima energy balance fara intake). Pure.
 */
function avgLoggedIntakeInWindow(
  dailyLog: ReadonlyArray<NutritionDailyEntry>,
  startMs: number,
  endMs: number,
): number | null {
  let sum = 0;
  let count = 0;
  for (const entry of dailyLog) {
    if (entry.kcal == null || !Number.isFinite(entry.kcal)) continue;
    const ms = dateISOToMs(entry.dateISO);
    if (!Number.isFinite(ms)) continue;
    if (ms >= startMs && ms <= endMs) {
      sum += entry.kcal;
      count += 1;
    }
  }
  if (count === 0) return null;
  return sum / count;
}

/**
 * Construieste observatiile (kcal-space) din trend greutate + intake logat.
 *
 * Pentru fiecare pereche consecutiva de cantariri (sortate crescator pe data):
 *   Δgreutate = kg_end − kg_start  (negativ = a slabit)
 *   zile = (ms_end − ms_start) / zi
 *   intake_mediu = media kcal logate in fereastra
 *   TDEE_fereastra = intake_mediu − (Δgreutate × 7700) / zile
 *
 * Cantarul conduce: daca a slabit logand X, TDEE > X (a cheltuit mai mult);
 * daca s-a ingrasat logand un "deficit", TDEE_fereastra scade catre intake-ul
 * REAL implicat de castig → log sub-raportat corectat de scala. Energy balance.
 *
 * Sare ferestrele fara intake logat (NU inventam intake) sau cu zile < prag
 * (zgomot scala domina). Pure — ZERO mutation input.
 */
export function buildNutritionObservations(
  weightLog: ReadonlyArray<WeightEntry>,
  dailyLog: ReadonlyArray<NutritionDailyEntry>,
): NutritionObservation[] {
  if (!Array.isArray(weightLog) || weightLog.length < 2) return [];

  const sorted = weightLog
    .filter((w) => w != null && Number.isFinite(w.kg) && typeof w.date === 'string')
    .map((w) => ({ kg: w.kg, ms: dateISOToMs(w.date), ts: w.ts }))
    .filter((w) => Number.isFinite(w.ms))
    .sort((a, b) => a.ms - b.ms);

  const observations: NutritionObservation[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const start = sorted[i - 1];
    const end = sorted[i];
    if (start == null || end == null) continue;
    const days = (end.ms - start.ms) / MS_PER_DAY;
    if (days < MIN_WINDOW_DAYS) continue;

    const avgIntake = avgLoggedIntakeInWindow(dailyLog, start.ms, end.ms);
    if (avgIntake == null) continue; // fara intake logat → nu putem estima

    const deltaKg = end.kg - start.kg;
    // Energy balance: TDEE = intake − energie stocata/zi. Δkg>0 (ingrasare) →
    // termen negativ → TDEE estimat SUB intake (a mancat peste cheltuiala);
    // Δkg<0 (slabire) → termen pozitiv → TDEE PESTE intake.
    const tdeeWindow = avgIntake - (deltaKg * KCAL_PER_KG) / days;

    // Defensiv: estimari absurde (scala glitch / mis-log extrem) → skip.
    if (!Number.isFinite(tdeeWindow) || tdeeWindow <= 0 || tdeeWindow > 12000) continue;

    observations.push({
      weightDelta: tdeeWindow, // contract: "sample value" in kcal (vezi cap-fisier)
      kcalDaily: Math.round(avgIntake),
      timestampMs: end.ts,
    });
  }

  return observations;
}

/**
 * Construieste BayesianNutritionContext complet pentru engine. Pure.
 *
 * - meta.demographicMu = TDEE mentenanta per-user (Piesa 1) → prior real kcal,
 *   scapa tier-none chiar cu 0 observatii (fresh user → estimare per-user).
 * - meta.observations = energy-balance TDEE per fereastra trend greutate.
 * - meta.kcalFloorMin = floor sex-diferentiat (femei 1000 / barbati 1200).
 * - profileTier = T0/T1/T2 blend prior/input.
 *
 * Returns ctx gol-dar-valid cand maintenanceTDEE null SI zero observatii (cold
 * start fara onboarding) → engine ramane tier 'none' → wrapper fallback baza
 * per-user/baseline (comportament Piesa 1 preserved).
 */
export function buildBayesianNutritionContext(
  input: ObservationsBuilderInput,
): BayesianNutritionContext {
  const { weightLog, dailyLog, maintenanceTDEE, sex, profileTier } = input;
  const observations = buildNutritionObservations(weightLog, dailyLog);

  const meta: NonNullable<BayesianNutritionContext['meta']> = {
    observations,
    kcalFloorMin: resolveKcalFloorForSex(sex),
  };
  // Prior real per-user → escape tier 'none' chiar cu 0 observatii.
  if (maintenanceTDEE != null && Number.isFinite(maintenanceTDEE)) {
    meta.demographicMu = maintenanceTDEE;
    meta.demographicSigma = DEMOGRAPHIC_SIGMA_KCAL;
  }

  return {
    profileTier: profileTier ?? 'T0',
    meta,
  };
}

/**
 * Calibration tier din numarul de observatii acumulate. Mai multe date →
 * tier mai mare → engine-ul are incredere mai mare in input vs prior:
 *   0-1 obs → T0 (cold start, 70/30 prior-dominat, anti-overshoot)
 *   2-4 obs → T1 (80/20 input-dominat, calibrare in curs)
 *   5+  obs → T2 (90/10 input puternic, posterior erodeaza prior)
 * Pure.
 */
export function tierFromObservationCount(n: number): string {
  if (!Number.isFinite(n) || n <= 1) return 'T0';
  if (n <= 4) return 'T1';
  return 'T2';
}

/**
 * I/O boundary — citeste progresStore.weightLog + nutritionStore.dailyLog +
 * onboarding (sex via store, maintenance TDEE via Piesa 1) → construieste
 * BayesianNutritionContext pentru engine. Delegare la pure
 * buildBayesianNutritionContext. Tier derivat din nr. observatii.
 *
 * Mirror userTdee.readUserMaintenanceTDEE pattern (I/O boundary thin, logica
 * pura). Apelat din NutritionInline + TDEEStrip ca sa hraneasca engine-ul.
 */
export function readBayesianNutritionContext(): BayesianNutritionContext {
  const weightLog = useProgresStore.getState().weightLog;
  const dailyLog = useNutritionStore.getState().dailyLog;
  const sex = useOnboardingStore.getState().data.sex;
  const maintenanceTDEE = readUserMaintenanceTDEE();

  const observations = buildNutritionObservations(weightLog, dailyLog);
  return buildBayesianNutritionContext({
    weightLog,
    dailyLog,
    maintenanceTDEE,
    sex,
    profileTier: tierFromObservationCount(observations.length),
  });
}
