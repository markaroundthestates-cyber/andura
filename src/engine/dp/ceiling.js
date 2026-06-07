// ══ BUILD #3 — realistic ceiling + diminishing returns (F3 spec §3) ══════════
// A normalized strength-standard e1RM ceiling replaces the flat, hand-maintained
// MAX_KG (dp.js:95-137) — which was fragile (any unmapped CORE_AUTO inherited the
// 80kg default → F-1 crater class) and unnormalized (no bodyweight/sex/training-
// age scaling, no diminishing returns).
//
//   ceiling(e1RM) = standardRatio(pattern) × bodyweight × sexFactor × ageFraction
//
// Daniel HARD rule: a user must never be prescribed stronger than physically real
// (the "Eddie-Hall ceiling"). The gain the engine prescribes DECAYS to 0 as the
// estimate approaches the ceiling, so a climb mathematically cannot exceed it and
// slows long before it. mu/ceiling also disambiguates a near-ceiling plateau
// (expected, genetic) from a problem plateau (recovery/technique/adherence).
//
// UNVERIFIED constants (F3 §10): the strength-standard ratios are an ELITE-tier
// e1RM-to-bodyweight table for a reference INTERMEDIATE-TO-ADVANCED MALE, sourced
// from public strength-standard references (strengthlevel.com "Elite" tier,
// rounded conservatively HIGH so the derived ceiling never sits BELOW the old
// MAX_KG for a mapped lift — the §8.4 gate). They are flagged for a Daniel/research
// review before dp_ceiling_v1 flips ON. Pure functions — no side effects, no DB.

import { getExerciseMetadata } from '../exerciseLibrary.js';

// Elite e1RM as a multiple of bodyweight, per movement pattern (reference adv male).
// Deliberately generous (elite tier) so the ceiling clips ONLY physically-absurd
// loads, never a strong-but-real lifter. A pattern not matched falls to a safe
// generic isolation multiple.
export const STRENGTH_STANDARD_RATIO = Object.freeze({
  squat: 2.5,        // back/front squat, hack, leg press is handled separately (machine)
  deadlift: 3.0,     // hinge / RDL / trap bar
  hipthrust: 4.0,    // glute hip thrust (very high absolute loads)
  benchpress: 2.0,   // flat/incline barbell+DB press patterns
  ohp: 1.2,          // overhead press
  row: 1.8,          // horizontal pull
  pulldown: 1.6,     // vertical pull / lat pulldown
  legpress: 5.0,     // machine leg press (huge absolute loads)
  legiso: 2.2,       // leg extension / curl (machine)
  calf: 4.0,         // calf raise (machine, very high loads)
  bicep: 0.6,        // curl
  tricep: 1.0,       // pushdown / extension
  lateral: 0.4,      // lateral / rear-delt raise (per-hand tiny share)
  chestfly: 0.9,     // pec deck / fly
  generic: 1.5,      // unmatched — safe generic compound-ish
});

// Sex factor mirroring the cold-start model (coldStartGuidelines SEX_FACTOR).
export const CEILING_SEX_FACTOR = Object.freeze({ m: 1.0, f: 0.78 });

// Attainable FRACTION of the elite ceiling grows with training age (distinct-day
// sessions logged). A novice cannot realistically reach the elite ceiling; a
// seasoned lifter can approach it. Saturating curve, floored so even a cold-start
// user gets a finite (not tiny) ceiling. ~0.55 at 0 sessions → ~0.95 asymptote.
export const AGE_FRACTION_FLOOR = 0.55;
export const AGE_FRACTION_CEIL = 0.98;
const AGE_HALF_SESSIONS = 60; // sessions at which the fraction is ~halfway up the band

/**
 * Attainable fraction of the elite ceiling for a given training age.
 * @param {number} trainingAge distinct-day sessions logged for this lift/user
 * @returns {number} in [AGE_FRACTION_FLOOR, AGE_FRACTION_CEIL]
 */
export function ageFraction(trainingAge) {
  const a = Number.isFinite(trainingAge) && trainingAge > 0 ? trainingAge : 0;
  const span = AGE_FRACTION_CEIL - AGE_FRACTION_FLOOR;
  // Saturating: floor + span · a/(a + half).
  return AGE_FRACTION_FLOOR + span * (a / (a + AGE_HALF_SESSIONS));
}

// Movement-pattern classifier from the exercise name (+ metadata muscle). Keyed on
// the canonical CORE_AUTO engineNames. Order matters (most-specific first).
/** @param {string} ex @returns {string} */
export function classifyPattern(ex) {
  const n = String(ex || '');
  const meta = getExerciseMetadata(ex);
  const muscle = meta ? meta.muscle_target_primary : 'unknown';
  if (/leg press/i.test(n)) return 'legpress';
  if (/calf/i.test(n)) return 'calf';
  if (/leg curl|leg extension/i.test(n)) return 'legiso';
  if (/hip thrust/i.test(n)) return 'hipthrust';
  if (/deadlift|romanian|rdl|hinge/i.test(n)) return 'deadlift';
  if (/squat/i.test(n)) return 'squat';
  if (/ohp|overhead press|shoulder press/i.test(n)) return 'ohp';
  if (/lateral|rear delt|reverse pec|face pull/i.test(n)) return 'lateral';
  if (/pulldown|pull-?up|chin-?up/i.test(n)) return 'pulldown';
  if (/row/i.test(n)) return 'row';
  if (/curl/i.test(n) || muscle === 'biceps') return 'bicep';
  if (/triceps|pushdown|press machine/i.test(n) || muscle === 'triceps') return 'tricep';
  if (/pec deck|cable fly|\bfly\b/i.test(n)) return 'chestfly';
  if (/bench|chest press|dip/i.test(n) || muscle === 'piept') return 'benchpress';
  if (muscle === 'picioare-quads' || muscle === 'fese' || muscle === 'picioare-hamstrings') return 'squat';
  return 'generic';
}

/**
 * Derived realistic e1RM ceiling (kg-scale) for an exercise.
 * @param {string} ex canonical engineName
 * @param {number} bwKg bodyweight
 * @param {string} [sex] 'm' | 'f'
 * @param {number} [trainingAge] distinct-day sessions logged
 * @returns {number} ceiling e1RM in kg, or 0 when bodyweight is unusable
 */
export function ceilingE1RM(ex, bwKg, sex, trainingAge) {
  const bw = Number(bwKg);
  if (!Number.isFinite(bw) || bw <= 0) return 0;
  const ratio = STRENGTH_STANDARD_RATIO[classifyPattern(ex)] ?? STRENGTH_STANDARD_RATIO.generic;
  const sexF = CEILING_SEX_FACTOR[String(sex).toLowerCase()] ?? CEILING_SEX_FACTOR.m;
  return ratio * bw * sexF * ageFraction(trainingAge);
}

// Diminishing-returns exponent (F3 §3b). Higher p → the decay bites later (gains
// stay near-full until closer to the ceiling, then drop sharply).
export const GAIN_DECAY_P = 3;

/**
 * Fraction of the base step the engine is ALLOWED to add, decaying to 0 as the
 * estimate approaches the ceiling: gainDecay = 1 - (mu/ceiling)^p, clamped [0,1].
 * Far from the ceiling → ~1 (full step); at/over the ceiling → 0 (no climb).
 * @param {number} mu current e1RM estimate
 * @param {number} ceiling derived ceiling e1RM
 * @returns {number} in [0,1]
 */
export function gainDecay(mu, ceiling) {
  const m = Number(mu);
  const c = Number(ceiling);
  if (!Number.isFinite(c) || c <= 0) return 1;          // no ceiling info → no throttle
  if (!Number.isFinite(m) || m <= 0) return 1;
  const r = Math.min(1, Math.max(0, m / c));
  return Math.max(0, 1 - Math.pow(r, GAIN_DECAY_P));
}

// Plateau classification thresholds (F3 §3b — distinguish a near-ceiling plateau
// from a problem plateau via mu/ceiling).
export const NEAR_CEILING_RATIO = 0.9;  // >= → EXPECTED (near genetic ceiling)
export const PROBLEM_PLATEAU_RATIO = 0.7; // < → PROBLEM (recovery/technique/adherence)

/**
 * Classify a stagnation by how close the estimate sits to the ceiling.
 * @param {number} mu @param {number} ceiling
 * @returns {'near_ceiling'|'problem'|'midrange'}
 */
export function classifyPlateau(mu, ceiling) {
  const c = Number(ceiling);
  const m = Number(mu);
  if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(m) || m <= 0) return 'midrange';
  const r = m / c;
  if (r >= NEAR_CEILING_RATIO) return 'near_ceiling';
  if (r < PROBLEM_PLATEAU_RATIO) return 'problem';
  return 'midrange';
}
