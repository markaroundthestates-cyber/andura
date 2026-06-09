// ══ USER PROFILE LEAF — weight / goal / protein I/O helpers ════════════════
// Hygiene split (zero behavior change): these store-reading helpers were defined
// in userTdee.ts. They read ONLY progresStore + onboardingStore — never the
// workoutStore. Extracting them into this LEAF lets phaseResolution.ts depend on
// them WITHOUT pulling userTdee's workoutStore edge, which closed a circular
// dependency (nutrition → userTdee → workoutStore → workoutStore.logic →
// nutrition, madge hard-gate). userTdee.ts re-exports every symbol here so all
// existing importers (`from './userTdee'`) resolve unchanged — public API kept.

import { useOnboardingStore } from '../stores/onboardingStore';
import { useProgresStore } from '../stores/progresStore';
import type { Goal } from '../stores/onboardingStore';

// 1.8 g/kg corp = mid-range standard pentru trainee (sub pragul de alerta
// proactiveEngine.js:15 "2.2g/kg corp", peste minim conservare masa musculara).
export const PROTEIN_G_PER_KG_BODYWEIGHT = 1.8;

/**
 * Sursa canonica de greutate CURENTA (kg) — adevarul unic pentru TOATE
 * citirile de greutate curenta din app (TDEE/BMR/proteine/BF%/pipeline).
 * Regula: ultima greutate LOGATA (progresStore.weightLog, cea mai recenta intrare
 * dupa data) daca exista, altfel greutatea de onboarding (initial/fallback).
 */
export function getCurrentWeightKg(): number | null {
  const weightLog = useProgresStore.getState().weightLog;
  // Cea mai recenta intrare dupa DATA, NU pozitia in array. addWeightEntry
  // adauga datele noi la coada indiferent de ordine → o cantarire back-dated
  // (zi uitata logata ulterior) ar deveni [length-1] si ar masca greutatea
  // curenta reala, corupand BMR/TDEE/proteine/BF%/periodizare. Comparam `date`
  // (YYYY-MM-DD, sortabil lexicografic) — robust la semantica mixta a lui `ts`
  // (live = Date.now(), importate = Date.UTC(date)).
  // reduce fara seed: acumulatorul e WeightEntry (NU | undefined sub
  // noUncheckedIndexedAccess); arunca pe array gol, de aceea guard-ul .length.
  const lastWeight = weightLog.length
    ? weightLog.reduce((m, e) => (e.date > m.date ? e : m))
    : undefined;
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
