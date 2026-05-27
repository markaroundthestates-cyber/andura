// ══ USER TDEE — Per-user maintenance TDEE (Piesa 1 nutrition-brain fix) ═══
//
// Real per-user maintenance TDEE base pentru nutrition kcal target. Inlocuieste
// baza flat 2640 din engineWrappers.getNutritionTargetsToday (bug central:
// Maria 40kg mentenanta primea 2640, Marius 110kg/2m bulk primea 2851 — ambele
// absurde fiindca multiplicatorul de faza se aplica pe constanta hardcodata).
//
// MODEL FORWARD FIZIC (2026-05-27, redesign directiva Daniel CEO) — driver-ul
// deterministic, scale-independent, pentru kcal-ul de mentenanta zilnic:
//
//   kcal = BMR(Mifflin) × NEAT_BASE + (sesiuni_saptamana × PER_SESSION_NET) / 7
//
// Inlocuieste multiplicatorul fix 1.55 (defect central: 1.55 = "moderat activ"
// hardcodat ignora cate antrenamente face user-ul de fapt — 4 vs 6 sesiuni
// dadeau ACELASI numar). Acum termenul de activitate vine din sesiunile REAL
// logate saptamana asta (workoutStore.sessionsHistory), deci 4 vs 6 schimba
// numarul imediat, fara sa fie nevoie de cantar.
//
//   M: BMR = 10·kg + 6.25·cm - 5·age + 5
//   F: BMR = 10·kg + 6.25·cm - 5·age - 161
//
// Reuse: aceeasi formula Mifflin-St Jeor folosita de BMRStrip.tsx (strip-ul
// "Calorii baza"). Termenul de faza (cut/bulk) se aplica PESTE acest model in
// engineWrappers (goal/phase multiplier) — neschimbat.
//
// Pure-function discipline: computeMaintenanceTDEE NU citeste store / NU are
// side-effects (sesiunile vin ca parametru). readUserMaintenanceTDEE = I/O
// boundary (citeste onboardingStore + workoutStore) + deleaga la pura. Returns
// null cand stats absente (cold start fara onboarding) → caller fallback baseline.

import { useOnboardingStore } from '../stores/onboardingStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { Sex, Goal } from '../stores/onboardingStore';

// NEAT base = non-exercise activity thermogenesis multiplier (viata in afara
// salii: deplasari, casa, munca usoara). 1.25 = mijlocul benzii sedentar→usor
// activ din tabelele clasice de activitate Harris-Benedict/Mifflin (1.2
// sedentar, 1.375 usor activ). NU include antrenamentul — exercitiul intra
// explicit prin termenul de sesiuni (vezi PER_SESSION_NET_KCAL). Estimare
// documentata, conservativa.
export const NEAT_BASE = 1.25;

// Net kcal peste-repaus per sesiune de rezistenta (kcal). Banda tipica 250-350
// pentru o sesiune de 45-75 min de antrenament cu greutati (net peste BMR,
// dupa scaderea cheltuielii de repaus din durata). 300 = mijloc conservativ al
// benzii. Estimare — NU masura calorimetrica per-user.
export const PER_SESSION_NET_KCAL = 300;

// Fereastra de numarare a sesiunilor (zile). 7 = saptamana curenta de
// antrenament: termenul de activitate reflecta cadenta recenta reala.
export const SESSIONS_WINDOW_DAYS = 7;

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
  /**
   * Numarul de sesiuni de antrenament logate in fereastra curenta
   * (SESSIONS_WINDOW_DAYS). Termenul de activitate al modelului forward.
   * Optional — default 0 (cold start / fara antrenamente saptamana asta →
   * doar NEAT base, onest). Citit la I/O boundary din workoutStore.
   */
  sessionsThisWeek?: number;
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
 * Per-user maintenance TDEE via model forward fizic (deterministic, scale-
 * independent):
 *
 *   kcal = BMR × NEAT_BASE + (sessionsThisWeek × PER_SESSION_NET_KCAL) / 7
 *
 * Termenul de activitate (sesiuni × net / 7) e media zilnica a arderii din
 * antrenamente (varianta saptamana-medie: total saptamanal impartit pe 7 zile
 * → fara varfuri per-zi, neted). 0 sesiuni → doar NEAT base (onest). Mai multe
 * sesiuni → kcal mai mare imediat. Returns null cand stats incomplete (caller
 * pastreaza baseline fallback). Pure function.
 */
export function computeMaintenanceTDEE(stats: UserStatsInput): number | null {
  const bmr = computeMifflinStJeorBMR(stats);
  if (bmr === null) return null;
  const sessions =
    stats.sessionsThisWeek != null && Number.isFinite(stats.sessionsThisWeek) && stats.sessionsThisWeek > 0
      ? stats.sessionsThisWeek
      : 0;
  const neatBase = bmr * NEAT_BASE;
  const weeklySessionBurnPerDay = (sessions * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS;
  return Math.round(neatBase + weeklySessionBurnPerDay);
}

/**
 * Numara sesiunile logate in ultimele SESSIONS_WINDOW_DAYS, dupa timestamp-ul
 * de finish (LastSessionSummary.ts). Pure — primeste sesiunile + now ca
 * parametri (NU citeste store / NU Date.now intern).
 */
export function countSessionsInWindow(
  sessions: ReadonlyArray<{ ts: number }>,
  nowMs: number,
  windowDays: number = SESSIONS_WINDOW_DAYS,
): number {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;
  const cutoff = nowMs - windowDays * 24 * 60 * 60 * 1000;
  let count = 0;
  for (const s of sessions) {
    if (s != null && Number.isFinite(s.ts) && s.ts >= cutoff && s.ts <= nowMs) count += 1;
  }
  return count;
}

/**
 * I/O boundary — read user stats din onboardingStore + sesiuni recente din
 * workoutStore + compute maintenance TDEE (model forward). Returns null cand
 * stats absente (cold start) → caller fallback baseline.
 */
export function readUserMaintenanceTDEE(): number | null {
  const { sex, weight, age, height } = useOnboardingStore.getState().data;
  const sessionsThisWeek = countSessionsInWindow(
    useWorkoutStore.getState().sessionsHistory,
    Date.now(),
  );
  return computeMaintenanceTDEE({
    sex,
    weightKg: weight,
    ageYears: age,
    heightCm: height,
    sessionsThisWeek,
  });
}

/**
 * I/O boundary — read user bodyweight (kg) din onboardingStore. Pentru
 * protein target g/kg × greutate. Returns null cand absent.
 */
export function readUserWeightKg(): number | null {
  return useOnboardingStore.getState().data.weight;
}

/**
 * I/O boundary — read onboarding goal (RO vocab) din onboardingStore.
 * Pentru goal-delta nutrition kcal (slabire→deficit / masa→surplus) cand
 * NU exista override manual de faza (SchimbaFaza). Returns null cand absent.
 */
export function readOnboardingGoal(): Goal | null {
  return useOnboardingStore.getState().data.goal;
}

/**
 * Protein target (g) = g/kg × greutate corporala. Pure. Returns null cand
 * greutate absenta (caller pastreaza protein baseline).
 */
export function computeProteinTargetG(weightKg: number | null): number | null {
  if (weightKg === null || weightKg <= 0) return null;
  return Math.round(weightKg * PROTEIN_G_PER_KG_BODYWEIGHT);
}
