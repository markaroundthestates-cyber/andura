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
// ~250 kcal = banda rezonabila in jurul estimarii forward Mifflin; lasa
// observatiile sa miste posterior-ul fara overshoot.
export const DEMOGRAPHIC_SIGMA_KCAL = 250;

// Span minim al ferestrei (zile, de la prima la ultima cantarire) ca sa formeze
// o observatie valida. 7+ zile = o saptamana completa: zgomotul zilnic al
// scalei (apa/glicogen, ±4-5 kg) se mediaza, NU domina semnalul. Sub asta o
// fluctuatie de o zi ar produce o estimare TDEE garbage (fals pozitiv) →
// cantarul devine driver zilnic in loc de calibrator lent. Scale = calibrator
// lent (vezi cap-fisier), NU driver zilnic.
const MIN_WINDOW_DAYS = 7;

// Numarul minim de cantariri intr-o fereastra ca panta de regresie sa fie
// semnificativa (2 = minim matematic pentru o panta; cerem 3 ca o singura
// citire aberanta sa nu defineasca trend-ul).
const MIN_WEIGH_INS_FOR_TREND = 3;

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
 * Panta de regresie liniara (kg/zi) a greutatii in timp, prin cele mai mici
 * patrate. x = zile relative la primul punct, y = kg. Returns null cand < 2
 * puncte sau varianta x nula (toate in aceeasi zi). Pure.
 *
 * Folosita ca trend robust la zgomot: o singura cantarire aberanta (apa/
 * glicogen, ±4-5 kg intr-o zi) misca panta marginal in loc sa defineasca tot
 * delta (ca la point-to-point start→end). Asa o fluctuatie de o zi NU mai
 * produce o estimare TDEE garbage.
 */
function weightTrendSlopeKgPerDay(
  points: ReadonlyArray<{ dayOffset: number; kg: number }>,
): number | null {
  const n = points.length;
  if (n < 2) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const p of points) {
    sumX += p.dayOffset;
    sumY += p.kg;
    sumXY += p.dayOffset * p.kg;
    sumXX += p.dayOffset * p.dayOffset;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0 || !Number.isFinite(denom)) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  return Number.isFinite(slope) ? slope : null;
}

/**
 * Construieste observatia (kcal-space) din TREND-ul greutatii (panta de
 * regresie liniara) + intake-ul mediu logat, pe intreaga serie de cantariri.
 *
 * Span = zile de la prima la ultima cantarire. Cerem span >= MIN_WINDOW_DAYS
 * (>=7 zile, o saptamana) SI >= MIN_WEIGH_INS_FOR_TREND cantariri ca panta sa
 * fie semnificativa. Sub aceste praguri → ZERO observatie (zgomotul zilnic al
 * scalei domina; scale = calibrator lent, NU driver zilnic).
 *
 *   panta (kg/zi)  = regresie liniara peste cantaririle din serie
 *   Δgreutate      = panta × span_zile  (negativ = a slabit, robust la noise)
 *   intake_mediu   = media kcal logate in fereastra [prima, ultima]
 *   TDEE           = intake_mediu − (Δgreutate × 7700) / span_zile
 *                  = intake_mediu − panta × 7700
 *
 * Cantarul conduce inferenta lenta: daca trend-ul scade logand X, TDEE > X (a
 * cheltuit mai mult); daca trend-ul creste logand un "deficit", TDEE coboara
 * spre intake-ul REAL implicat de castig → log sub-raportat corectat. Energy
 * balance. Pure — ZERO mutation input, ZERO Date.now.
 */
export function buildNutritionObservations(
  weightLog: ReadonlyArray<WeightEntry>,
  dailyLog: ReadonlyArray<NutritionDailyEntry>,
): NutritionObservation[] {
  if (!Array.isArray(weightLog) || weightLog.length < MIN_WEIGH_INS_FOR_TREND) return [];

  const sorted = weightLog
    .filter((w) => w != null && Number.isFinite(w.kg) && typeof w.date === 'string')
    .map((w) => ({ kg: w.kg, ms: dateISOToMs(w.date), ts: w.ts }))
    .filter((w) => Number.isFinite(w.ms))
    .sort((a, b) => a.ms - b.ms);

  if (sorted.length < MIN_WEIGH_INS_FOR_TREND) return [];

  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const spanDays = (last.ms - first.ms) / MS_PER_DAY;
  // Fereastra prea scurta (sub o saptamana) → zgomotul zilnic domina → skip.
  if (spanDays < MIN_WINDOW_DAYS) return [];

  const avgIntake = avgLoggedIntakeInWindow(dailyLog, first.ms, last.ms);
  if (avgIntake == null) return []; // fara intake logat → nu putem estima

  // Trend robust: panta de regresie (kg/zi) peste TOATE cantaririle din serie,
  // NU delta point-to-point start→end (care ar lua un swing de o zi ca semnal).
  const slopeKgPerDay = weightTrendSlopeKgPerDay(
    sorted.map((p) => ({ dayOffset: (p.ms - first.ms) / MS_PER_DAY, kg: p.kg })),
  );
  if (slopeKgPerDay == null) return [];

  // Energy balance: TDEE = intake − energie stocata/zi = intake − panta × 7700.
  // panta>0 (ingrasare) → TDEE estimat SUB intake; panta<0 (slabire) → PESTE.
  const tdeeTrend = avgIntake - slopeKgPerDay * KCAL_PER_KG;

  // Defensiv: estimari absurde (scala glitch / mis-log extrem) → skip.
  if (!Number.isFinite(tdeeTrend) || tdeeTrend <= 0 || tdeeTrend > 12000) return [];

  return [
    {
      weightDelta: tdeeTrend, // contract: "sample value" in kcal (vezi cap-fisier)
      kcalDaily: Math.round(avgIntake),
      timestampMs: last.ts,
    },
  ];
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
 * Calibration tier din numarul de observatii. NB: dupa redesign-ul forward-
 * model (2026-05-27) builder-ul emite cel mult O observatie (un trend pe
 * intreaga serie), deci aceasta functie ramane DOAR pentru compat/teste — tier-
 * ul de productie se deriva din numarul de cantariri (vezi
 * tierFromWeighInCount). Pure.
 *   0-1 obs → T0 ; 2-4 obs → T1 ; 5+ obs → T2
 */
export function tierFromObservationCount(n: number): string {
  if (!Number.isFinite(n) || n <= 1) return 'T0';
  if (n <= 4) return 'T1';
  return 'T2';
}

// Cantariri minime ca trend-ul sa fie de incredere (input-dominated tier T1).
const WEIGH_INS_FOR_CALIBRATING_TIER = 4;

/**
 * Calibration tier din numarul de CANTARIRI (nu observatii) — scale = calibrator
 * lent. Cu putine cantariri (<4) ramanem T0 (70/30 prior-dominat: modelul
 * forward fizic conduce, scale abia il atinge). Cu >=4 cantariri pe un trend
 * suficient de lung → T1 (80/20: trend-ul calibreaza estimarea, lent). NU
 * urcam la T2 din scale: cantarul NU domina (90/10) ca sa NU clatine kcal de
 * la zi la zi — ramane calibrator lent peste saptamani, NU driver. Pure.
 */
export function tierFromWeighInCount(weighInCount: number): string {
  if (!Number.isFinite(weighInCount) || weighInCount < WEIGH_INS_FOR_CALIBRATING_TIER) {
    return 'T0';
  }
  return 'T1';
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

  // Tier din numarul de CANTARIRI (scale = calibrator lent, cap T1) — NU din
  // numarul de observatii (acum mereu <=1 dupa redesign-ul forward-model).
  return buildBayesianNutritionContext({
    weightLog,
    dailyLog,
    maintenanceTDEE,
    sex,
    profileTier: tierFromWeighInCount(weightLog.length),
  });
}
