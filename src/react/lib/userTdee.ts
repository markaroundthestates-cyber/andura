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
// BLEND planned-prior → actual-posterior (2026-05-27 rafinare, directiva
// Daniel): la cold-start pur-actual ar da un user nou (planifica 4, inca n-a
// logat o saptamana) numarul SEDENTAR → sub-hranit. Deci termenul de sesiuni e
// un blend de incredere: frecventa PLANIFICATA (calendar/onboarding) e prior-ul
// la cold-start, sesiunile logate REAL il rafineaza pe masura ce se aduna
// istoric (vezi BLEND_FULL_WEEKS + blendEffectiveSessions). Cantarul
// (nutritionObservations) ramane calibratorul lent de fond.
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
import { useProgresStore } from '../stores/progresStore';
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

// ── Planned-prior → actual-posterior confidence blend (2026-05-27 refinement) ──
// Folosind DOAR sesiunile real-logate, un user nou care PLANIFICA 4/saptamana
// dar inca n-a logat o saptamana intreaga primeste numarul SEDENTAR (BMR×1.25 +
// 0) → sub-hranit. Fix (directiva Daniel CEO): frecventa PLANIFICATA = prior la
// cold-start, sesiunile logate REAL rafineaza estimarea pe masura ce trece
// timpul (blend de incredere, NU switch dur, NU pur-actual):
//
//   effectiveSessions = w × actualThisWeek + (1 − w) × plannedPerWeek
//
// w (increderea in actual) creste cu numarul de SAPTAMANI de istoric logat:
// ~0 saptamani → w≈0 (crede planul) ; rampa liniara → w≈1 la BLEND_FULL_WEEKS.
// Efect: user nou care planifica 4 e hranit pentru 4 imediat; cine logheaza 6
// constant deriva spre 6; cine planifica 4 dar face 2 deriva in jos. Cantarul
// (deja conectat in nutritionObservations, calibrator lent) ramane adevarul de
// fond care corecteaza orice eroare reziduala peste saptamani — deci blend-ul e
// doar o punte rezonabila + sigur la gaming (declari 7, faci 2 → te ingrasi →
// cantarul prinde). Reuse spiritul tier-ramp (tierFromWeighInCount) — rampa
// mica documentata, NU un subsistem nou.
//
// 4 saptamani = ~o saptamana per "tier" (T0→T1 calibrare la 4 cantariri,
// nutritionObservations) → la 4 saptamani de cadenta reala increderea in actual
// e completa; pana atunci planul tine kcal-ul realist.
export const BLEND_FULL_WEEKS = 4;

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
   * (SESSIONS_WINDOW_DAYS). Posterior-ul (semnalul ACTUAL) al modelului forward.
   * Optional — default 0 (fara antrenamente logate saptamana asta). Citit la
   * I/O boundary din workoutStore.
   */
  sessionsThisWeek?: number;
  /**
   * Frecventa de antrenament PLANIFICATA (sesiuni/saptamana) — prior-ul la
   * cold-start. Sursa: planul explicit din calendar (zile active) sau, in
   * lipsa, onboarding.frequency. Optional — cand absent NU exista prior, deci
   * blend-ul cade pe actual pur (w=1). Citit la I/O boundary.
   */
  plannedPerWeek?: number;
  /**
   * Numarul de SAPTAMANI de istoric de antrenament logat (span de la prima
   * sesiune pana acum). Conduce w-ul blend-ului: 0 → crede planul, creste spre
   * incredere completa in actual la BLEND_FULL_WEEKS. Optional — default 0
   * (cold start). Citit la I/O boundary din workoutStore.
   */
  loggedWeeks?: number;
}

/**
 * Greutatea de incredere w in semnalul ACTUAL (vs planul prior), 0..1. Rampa
 * liniara: 0 saptamani logate → 0 (crede planul) ; creste spre 1 la
 * BLEND_FULL_WEEKS saptamani de istoric. Pure.
 */
export function blendWeightFromLoggedWeeks(loggedWeeks: number): number {
  if (!Number.isFinite(loggedWeeks) || loggedWeeks <= 0) return 0;
  if (loggedWeeks >= BLEND_FULL_WEEKS) return 1;
  return loggedWeeks / BLEND_FULL_WEEKS;
}

/**
 * Termenul efectiv de sesiuni dupa blend-ul planned-prior → actual-posterior.
 *
 *   effectiveSessions = w × actual + (1 − w) × planned ,  w = ramp(loggedWeeks)
 *
 * Cand NU exista plan (plannedPerWeek absent/<=0) → nu exista prior → cade pe
 * actual pur (comportamentul pur-actual anterior). Pure.
 */
export function blendEffectiveSessions(
  actualThisWeek: number,
  plannedPerWeek: number | null | undefined,
  loggedWeeks: number,
): number {
  const actual = Number.isFinite(actualThisWeek) && actualThisWeek > 0 ? actualThisWeek : 0;
  const planned =
    plannedPerWeek != null && Number.isFinite(plannedPerWeek) && plannedPerWeek > 0
      ? plannedPerWeek
      : null;
  if (planned === null) return actual; // fara prior → actual pur
  const w = blendWeightFromLoggedWeeks(loggedWeeks);
  return w * actual + (1 - w) * planned;
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
 *   kcal = BMR × NEAT_BASE + (effectiveSessions × PER_SESSION_NET_KCAL) / 7
 *
 * Termenul de activitate (sesiuni × net / 7) e media zilnica a arderii din
 * antrenamente. effectiveSessions = blend planned-prior → actual-posterior
 * (vezi blendEffectiveSessions): la cold-start (0 saptamani logate) foloseste
 * frecventa PLANIFICATA (user nou care planifica 4 e hranit pentru 4, NU
 * sedentar-zero), apoi deriva spre sesiunile logate REAL pe masura ce se aduna
 * istoric (BLEND_FULL_WEEKS). Fara plan → cade pe actual pur. Returns null cand
 * stats incomplete (caller pastreaza baseline fallback). Pure function.
 */
export function computeMaintenanceTDEE(stats: UserStatsInput): number | null {
  const bmr = computeMifflinStJeorBMR(stats);
  if (bmr === null) return null;
  const effectiveSessions = blendEffectiveSessions(
    stats.sessionsThisWeek ?? 0,
    stats.plannedPerWeek,
    stats.loggedWeeks ?? 0,
  );
  const neatBase = bmr * NEAT_BASE;
  const weeklySessionBurnPerDay = (effectiveSessions * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS;
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
 * Numarul de SAPTAMANI de istoric de antrenament logat: span de la cea mai
 * veche sesiune pana acum, in saptamani intregi. 0 sesiuni → 0. Pure (primeste
 * sesiunile + now ca parametri). Conduce w-ul blend-ului — cu cat istoricul e
 * mai lung, cu atat increderea in cadenta reala (vs plan) e mai mare.
 */
export function countLoggedWeeks(
  sessions: ReadonlyArray<{ ts: number }>,
  nowMs: number,
): number {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;
  let oldest = Infinity;
  for (const s of sessions) {
    if (s != null && Number.isFinite(s.ts) && s.ts <= nowMs && s.ts < oldest) oldest = s.ts;
  }
  if (!Number.isFinite(oldest)) return 0;
  const spanDays = (nowMs - oldest) / (24 * 60 * 60 * 1000);
  return Math.floor(spanDays / 7);
}

// Calendar override key — mirror scheduleAdapter.CALENDAR_OVERRIDE_KEY. Citit
// inline aici (NU import din scheduleAdapter.js) ca sa NU tragem intregul graf
// engine-orchestrator (runPipeline + 8 adaptere + sessionBuilder + biblioteca)
// in graful de module al lib-ului de nutritie pentru o singura cheie
// localStorage — coupling fragil, blast-radius minim (Bugatti).
const CALENDAR_OVERRIDE_KEY = 'wv2-calendar-override';

/** ISO week-start (luni) YYYY-MM-DD pentru o data. Mirror scheduleAdapter.getWeekStartIso. */
function weekStartIso(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const jsDow = date.getDay(); // duminica=0 ... sambata=6
  const mondayIdx = jsDow === 0 ? 6 : jsDow - 1;
  const monday = new Date(date);
  monday.setDate(monday.getDate() - mondayIdx);
  return monday.toLocaleDateString('sv'); // YYYY-MM-DD local tz
}

/**
 * Numarul de zile active din override-ul de calendar al saptamanii CURENTE
 * (planul explicit pe zile). Returns null cand absent / saptamana trecuta /
 * malformat — exact semantica getCalendarOverride (week-key invalideaza natural
 * override-ul vechi). Reads localStorage → I/O boundary.
 */
function readCalendarPlannedDays(now: Date = new Date()): number | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(CALENDAR_OVERRIDE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as { weekStartIso?: unknown; selectedDays?: unknown };
  if (obj.weekStartIso !== weekStartIso(now)) return null; // saptamana trecuta → ignora
  if (!Array.isArray(obj.selectedDays)) return null;
  const activeDays = obj.selectedDays.filter(
    (d) => d != null && (d as { active?: boolean }).active === true,
  ).length;
  return activeDays > 0 ? activeDays : null;
}

/**
 * I/O boundary — read frecventa de antrenament PLANIFICATA (sesiuni/saptamana).
 * Prefera planul EXPLICIT din calendar (numarul de zile active din override-ul
 * saptamanii curente) cand exista; altfel cade pe onboarding.frequency
 * (declarat la onboard). Returns null cand niciun semnal disponibil. Reads
 * localStorage + store → I/O boundary (NU pura).
 */
export function readPlannedSessionsPerWeek(): number | null {
  // Plan explicit calendar = numarul de zile active in override-ul saptamanii
  // curente. Prefer asta — e alegerea concreta a user-ului pe zile.
  const calendarPlanned = readCalendarPlannedDays();
  if (calendarPlanned != null) return calendarPlanned;
  // Fallback onboarding.frequency ('2'|'3'|'4'|'5' → numar).
  const freq = useOnboardingStore.getState().data.frequency;
  if (freq != null) {
    const n = Number(freq);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * I/O boundary — read user stats din onboardingStore + sesiuni recente din
 * workoutStore + frecventa planificata (calendar/onboarding) + compute
 * maintenance TDEE (model forward cu blend planned-prior → actual-posterior).
 * Returns null cand stats absente (cold start) → caller fallback baseline.
 */
export function readUserMaintenanceTDEE(): number | null {
  const { sex, age, height } = useOnboardingStore.getState().data;
  const sessionsHistory = useWorkoutStore.getState().sessionsHistory;
  const now = Date.now();
  const sessionsThisWeek = countSessionsInWindow(sessionsHistory, now);
  const loggedWeeks = countLoggedWeeks(sessionsHistory, now);
  const plannedPerWeek = readPlannedSessionsPerWeek();
  return computeMaintenanceTDEE({
    sex,
    // Canonical curent: ultima greutate logata > onboarding (sursa unica).
    weightKg: getCurrentWeightKg(),
    ageYears: age,
    heightCm: height,
    sessionsThisWeek,
    loggedWeeks,
    // exactOptionalPropertyTypes: omit plannedPerWeek entirely cand absent (NU
    // assign undefined explicit). Fara plan → blend cade pe actual pur.
    ...(plannedPerWeek != null ? { plannedPerWeek } : {}),
  });
}

/**
 * Sursa canonica de greutate CURENTA (kg) — adevarul unic pentru TOATE
 * citirile de greutate curenta din app (TDEE/BMR/proteine/BF%/pipeline). Era
 * fragmentata: nutritia/corpul citeau greutatea INGHETATA din onboarding, dar
 * LogWeight scrie doar in progresStore.weightLog → logarea unei greutati nu
 * misca nimic (split source-of-truth, audit CRIT).
 *
 * Regula: ultima greutate LOGATA (progresStore.weightLog, cea mai recenta intrare
 * dupa data) daca exista, altfel greutatea de onboarding (initial/fallback).
 * Onboarding ramane seed-ul + fallback-ul (seedFromProfileIfEmpty intact).
 * Reads stores → I/O boundary (NU pura). Returns null cand niciun semnal.
 */
export function getCurrentWeightKg(): number | null {
  const weightLog = useProgresStore.getState().weightLog;
  const lastWeight = weightLog[weightLog.length - 1];
  return lastWeight?.kg ?? useOnboardingStore.getState().data.weight ?? null;
}

/**
 * I/O boundary — read user bodyweight (kg). Pentru protein target g/kg ×
 * greutate. Delegheaza la sursa canonica getCurrentWeightKg (ultima greutate
 * logata > onboarding) ca logarea unei greutati sa miste tinta de proteine.
 * Returns null cand absent.
 */
export function readUserWeightKg(): number | null {
  return getCurrentWeightKg();
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
