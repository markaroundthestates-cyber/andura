// ══ TARGET SAFETY — Smoke 2026-05-28 #16 ════════════════════════════════════
//
// Daniel CEO smoke 2026-05-28: user a introdus tinta 62kg de la 110kg cu
// deadline 4 iunie 2026 (3-4 zile) — ~48kg in 4 zile, fizic imposibil + grav
// periculos. App-ul a acceptat tacit. Plus: tinta era doar "notita in profil"
// nelegata de tinta kcal coach-ului.
//
// Aceasta lib are doua scopuri:
//   1) SIGURANTA: detecteaza tinte-cu-deadline imposibile (ritm > 1.5
//      kg/saptamana, plafonul fiziologic clasic 1% bodyweight/sapt cap-uit
//      absolut la 1.5kg/sapt). Genereaza warning + deadline realist sugerat.
//   2) CUPLARE KCAL: cand user a setat tinta + deadline, deriva tinta de kcal
//      = TDEE − deficit/surplus zilnic necesar, capat la ±25% TDEE (deficit
//      extrem cunoscut sa fie nesustenabil + sa erode masa musculara). Aceasta
//      override-uieste multiplicator-ul de goal-onboarding cand tinta e setata.
//
// Anti-paternalism: NU blocheaza salvarea tintei. Genereaza warning intern
// (UI surfaceaza); user decide. Engine math (Bayesian Nutrition posterior.mu)
// ramane neatins — aplicat pe layer-ul de "phase override" identic cu modul
// SchimbaFazaConfirm (un singur multiplicator → kcal-ul tinta). Floor sex-aware
// LOCK8 (1000f/1200b) preservat.

// Densitate caloric grasime corporala (kcal/kg) — clasica 1 lb grasime = 3500
// kcal → 1 kg = ~7700 kcal. Folosita pentru deriv. deficit-ului zilnic.
export const KCAL_PER_KG_BODYFAT = 7700;

// Ritm sanatos maxim de schimbare a greutatii (kg/saptamana). 1% bodyweight/
// sapt e standardul clasic (Helms et al. 2014, ISSN), DAR la useri grei (110
// kg) asta ar permite 1.1 kg/sapt; cap absolut la 1.5kg/sapt ca limita
// suplimentara pentru orice scale de bodyweight. Pierderea peste rate-ul asta
// = pierdere masa musculara accelerata + cortizol cronic + risc-yo-yo crescut.
export const MAX_SAFE_KG_PER_WEEK = 1.5;

// Deficit caloric maxim ca procent din TDEE — peste 25% e nesustenabil pe
// orizont lung (ACSM + Aragon & Schoenfeld 2020). Daniel example 110→62kg
// in 4 zile = deficit ~92,000 kcal/zi (fizic imposibil); cap-ul la 25% TDEE
// face ca tinta de kcal sa fie sustenabila chiar daca user-ul a ales un
// deadline absurd. Suplimentar floor-ul LOCK8 (1000f/1200b) ramane invariant.
export const MAX_DAILY_DEFICIT_TDEE_FRACTION = 0.25;

// Surplus maxim — bulk agresiv ~15% TDEE (Aragon 2020). Peste = exces de
// grasime fara castig muscular suplimentar. Distinct de deficit (asimetric).
export const MAX_DAILY_SURPLUS_TDEE_FRACTION = 0.15;

/**
 * Numarul de zile intre azi si o data tinta (YYYY-MM-DD sau YYYY-MM).
 * Returneaza null cand data invalida. Pure (now injectabil pentru teste).
 *
 * YYYY-MM e interpretat ca ultima zi a lunii respective (interpretarea
 * <input type="month"> standard "pana la sfarsitul lunii").
 */
export function daysUntilTarget(targetDate: string, now: Date = new Date()): number | null {
  if (typeof targetDate !== 'string' || targetDate.length === 0) return null;
  let endMs: number;
  // YYYY-MM-DD
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
  if (dayMatch) {
    const [, y, m, d] = dayMatch;
    endMs = Date.UTC(Number(y), Number(m) - 1, Number(d));
  } else {
    // YYYY-MM → ultima zi a lunii
    const monthMatch = /^(\d{4})-(\d{2})$/.exec(targetDate);
    if (!monthMatch) return null;
    const [, y, m] = monthMatch;
    // Date.UTC(year, month=0..11, 0) = ultima zi a lunii precedente, deci
    // pentru "luna m" trecem m+1 (m e 1..12) si 0 → ultima zi a lunii m.
    endMs = Date.UTC(Number(y), Number(m), 0);
  }
  if (!Number.isFinite(endMs)) return null;
  // Normalize "now" la ora 0:00 UTC pentru a evita off-by-one zonal.
  const startUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.floor((endMs - startUtc) / (24 * 60 * 60 * 1000));
  return days;
}

/**
 * Verdict siguranta pe ritm la deadline. `kind` discriminated:
 *   - 'unsafe' cand ritmul cerut > MAX_SAFE_KG_PER_WEEK. Surfaceaza
 *     `requiredKgPerWeek` (cat ar trebui sa schimbe) + `safeDeadlineDate`
 *     (cand ar atinge tinta la ritm sigur) pentru UI suggest.
 *   - 'safe' cand ritmul e sustenabil.
 *   - 'reached' cand user e deja la tinta (abs delta < 0.5 kg).
 */
export type TargetRateVerdict =
  | {
      kind: 'unsafe';
      requiredKgPerWeek: number;
      safeDeadlineDate: string; // YYYY-MM-DD
      direction: 'loss' | 'gain';
    }
  | { kind: 'safe'; requiredKgPerWeek: number; direction: 'loss' | 'gain' }
  | { kind: 'reached' };

/**
 * Evalueaza fezabilitatea unei tinte cu deadline. Pure (now injectabil).
 *
 * `unsafe` se declanseaza cand ritm-ul cerut depaseste MAX_SAFE_KG_PER_WEEK.
 * Returneaza null cand inputs incomplete (lipsa greutate curenta / tinta /
 * deadline) — caller decide UI fallback (no verdict surface).
 */
export function evaluateTargetRate(
  currentKg: number | null,
  targetKg: number | null,
  targetDate: string | null,
  now: Date = new Date(),
): TargetRateVerdict | null {
  if (!Number.isFinite(currentKg) || (currentKg as number) <= 0) return null;
  if (!Number.isFinite(targetKg) || (targetKg as number) <= 0) return null;
  if (!targetDate) return null;
  const days = daysUntilTarget(targetDate, now);
  if (days === null || days <= 0) return null;

  const cur = currentKg as number;
  const tgt = targetKg as number;
  const deltaKg = tgt - cur; // negativ = pierdere, pozitiv = castig
  if (Math.abs(deltaKg) < 0.5) return { kind: 'reached' };
  const direction: 'loss' | 'gain' = deltaKg < 0 ? 'loss' : 'gain';
  const weeks = days / 7;
  const requiredKgPerWeek = Math.abs(deltaKg) / weeks;

  if (requiredKgPerWeek > MAX_SAFE_KG_PER_WEEK) {
    // Calculeaza deadline-ul sigur (cand s-ar atinge tinta la ritm MAX_SAFE).
    const safeWeeks = Math.abs(deltaKg) / MAX_SAFE_KG_PER_WEEK;
    const safeDays = Math.ceil(safeWeeks * 7);
    const safeDate = new Date(now.getTime() + safeDays * 24 * 60 * 60 * 1000);
    const safeIso = safeDate.toISOString().slice(0, 10);
    return { kind: 'unsafe', requiredKgPerWeek, safeDeadlineDate: safeIso, direction };
  }
  return { kind: 'safe', requiredKgPerWeek, direction };
}

/**
 * Deriva kcal-ul tinta zilnic cand user-ul a setat o tinta + deadline.
 *
 *   deltaKg = targetKg − currentKg     (negativ = deficit; pozitiv = surplus)
 *   totalKcalShift = deltaKg × 7700
 *   dailyKcalShift = totalKcalShift / max(days, 1)
 *   tinta = TDEE + dailyKcalShift  (deficit la slabire, surplus la masa)
 *
 * Apoi se aplica cap-ul de siguranta: |dailyKcalShift| ≤ TDEE × MAX_FRACTION
 * (25% deficit / 15% surplus). Cap-ul protejeaza la deadline-uri imposibile
 * (ex: 110→62 in 4 zile → -92,000kcal/zi → cap automat la -25% TDEE).
 *
 * Returneaza null cand inputs incomplete (caller fallback la goal-multiplier).
 * Pure (now injectabil).
 */
export interface TargetKcalResult {
  kcalTarget: number;
  /** Daily shift aplicat fata de TDEE (negativ = deficit, pozitiv = surplus). */
  dailyShift: number;
  /** True cand cap-ul de siguranta a redus shift-ul (deadline imposibil). */
  capped: boolean;
  direction: 'loss' | 'gain' | 'maintain';
}

export function computeTargetKcalOverride(
  currentKg: number | null,
  targetKg: number | null,
  targetDate: string | null,
  tdee: number | null,
  now: Date = new Date(),
): TargetKcalResult | null {
  if (!Number.isFinite(currentKg) || (currentKg as number) <= 0) return null;
  if (!Number.isFinite(targetKg) || (targetKg as number) <= 0) return null;
  if (!Number.isFinite(tdee) || (tdee as number) <= 0) return null;
  if (!targetDate) return null;
  const days = daysUntilTarget(targetDate, now);
  if (days === null || days <= 0) return null;

  const tdeeNum = tdee as number;
  const cur = currentKg as number;
  const tgt = targetKg as number;
  const deltaKg = tgt - cur;
  if (Math.abs(deltaKg) < 0.5) {
    return { kcalTarget: Math.round(tdeeNum), dailyShift: 0, capped: false, direction: 'maintain' };
  }

  const totalKcalShift = deltaKg * KCAL_PER_KG_BODYFAT; // negativ la pierdere
  const dailyKcalShiftRaw = totalKcalShift / Math.max(days, 1);

  // Cap asimetric pe deficit (25%) vs surplus (15%) TDEE.
  const direction: 'loss' | 'gain' = deltaKg < 0 ? 'loss' : 'gain';
  const maxAbsShift =
    direction === 'loss'
      ? tdeeNum * MAX_DAILY_DEFICIT_TDEE_FRACTION
      : tdeeNum * MAX_DAILY_SURPLUS_TDEE_FRACTION;
  let dailyShift = dailyKcalShiftRaw;
  let capped = false;
  if (Math.abs(dailyKcalShiftRaw) > maxAbsShift) {
    dailyShift = direction === 'loss' ? -maxAbsShift : maxAbsShift;
    capped = true;
  }

  const kcalTarget = Math.round(tdeeNum + dailyShift);
  return { kcalTarget, dailyShift: Math.round(dailyShift), capped, direction };
}
