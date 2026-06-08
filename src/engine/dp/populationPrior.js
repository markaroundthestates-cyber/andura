// ══ BUILD F6c #33 — POPULATION-PRIOR cold-start (F6c spec §2) ════════════════
// F3 #4 transfer cold-start seeds a NEW lift from a RELATED lift the user already
// has an e1RM for; #33 COMPLEMENTS it — it fires when there is NO related lift (a
// truly new user, their first ever lift). It expresses the existing demographic
// cold-start (sex / bodyweight / experience, today's suggestStartWeight) as a
// proper Kalman PRIOR with uncertainty: a population-typical e1RM (as a multiple of
// bodyweight, per movement pattern × sex × experience) seeded with a WIDE sigma, so
// the very first real set the user logs dominates fast (the prior washes out).
//
// PRIVACY (Daniel hard rule): the table below is a SHIPPED static constant in the
// bundle, looked up ON-DEVICE from the user's OWN onboarding sex / bodyweight /
// experience. NO data is collected, NO server call, NO cohort telemetry. It is
// privacy-safe by construction.
//
// PURE — no DB, no side effects. REUSES classifyPattern (ceiling.js:72) for the
// movement key so it shares the ceiling's movement taxonomy (no new classifier).

import { classifyPattern } from './ceiling.js';

// ── UNVERIFIED DESIGN PROPOSAL (spec §9) — research / Daniel sanity-check before
//    dp_population_prior_v1 flips ON ──
// e1RM as a MULTIPLE OF BODYWEIGHT, per movement pattern, for a TYPICAL lifter at
// each experience tier (reference MALE — the sex factor is applied separately).
// These are POPULATION-TYPICAL (not elite): the same movement taxonomy as
// STRENGTH_STANDARD_RATIO (ceiling.js:28, the ELITE ceiling) but at a typical/
// novice fraction. Deliberately conservative — the wide sigma + the first real set
// recalibrate fast, so a touch low beats an over-seed. Keyed on classifyPattern's
// pattern ids; the experience bucket is the EN onboarding tier.
export const POPULATION_E1RM_PRIOR = Object.freeze({
  //              beginner  intermediate  advanced   (× bodyweight, e1RM)
  squat:      Object.freeze({ beginner: 0.90, intermediate: 1.35, advanced: 1.85 }),
  deadlift:   Object.freeze({ beginner: 1.10, intermediate: 1.65, advanced: 2.25 }),
  hipthrust:  Object.freeze({ beginner: 1.40, intermediate: 2.20, advanced: 3.00 }),
  benchpress: Object.freeze({ beginner: 0.70, intermediate: 1.10, advanced: 1.50 }),
  ohp:        Object.freeze({ beginner: 0.45, intermediate: 0.70, advanced: 0.95 }),
  row:        Object.freeze({ beginner: 0.65, intermediate: 1.00, advanced: 1.35 }),
  pulldown:   Object.freeze({ beginner: 0.60, intermediate: 0.90, advanced: 1.20 }),
  legpress:   Object.freeze({ beginner: 1.80, intermediate: 2.80, advanced: 3.80 }),
  legiso:     Object.freeze({ beginner: 0.70, intermediate: 1.10, advanced: 1.55 }),
  calf:       Object.freeze({ beginner: 1.40, intermediate: 2.20, advanced: 3.00 }),
  bicep:      Object.freeze({ beginner: 0.22, intermediate: 0.35, advanced: 0.48 }),
  tricep:     Object.freeze({ beginner: 0.35, intermediate: 0.55, advanced: 0.75 }),
  lateral:    Object.freeze({ beginner: 0.12, intermediate: 0.20, advanced: 0.28 }),
  chestfly:   Object.freeze({ beginner: 0.30, intermediate: 0.50, advanced: 0.68 }),
  generic:    Object.freeze({ beginner: 0.50, intermediate: 0.80, advanced: 1.10 }),
});

// Sex factor — mirrors the ceiling + cold-start models (CEILING_SEX_FACTOR /
// coldStartGuidelines SEX_FACTOR) for cross-model consistency.
export const PRIOR_SEX_FACTOR = Object.freeze({ m: 1.0, f: 0.78 });

// A WIDE prior sigma (spec §2b): the population seed is a guess, so the posterior
// starts uncertain and the first real observation dominates. Wider than the Kalman
// SIGMA_PRIOR (8) so the prior washes out fast.
export const POPULATION_SIGMA = 16;

const EXPERIENCE_KEYS = ['beginner', 'intermediate', 'advanced'];

/**
 * Population-typical e1RM (kg-scale) for a new lift from the user's OWN demographic
 * profile. PURE — a static on-device lookup. Returns null when bodyweight is
 * unusable (the caller falls to today's suggestStartWeight).
 *
 * @param {string} ex canonical engineName
 * @param {{ bodyweightKg?: number|null, sex?: string|null, experience?: string|null }} profile
 * @returns {{ e1rm:number, sigma:number, pattern:string }|null}
 */
export function populationPriorE1RM(ex, profile) {
  const bw = profile && Number(profile.bodyweightKg);
  if (!Number.isFinite(bw) || bw <= 0) return null;
  const pattern = classifyPattern(ex);
  const row = POPULATION_E1RM_PRIOR[pattern] ?? POPULATION_E1RM_PRIOR.generic;
  const expRaw = profile && typeof profile.experience === 'string' ? profile.experience : '';
  const exp = EXPERIENCE_KEYS.includes(expRaw) ? expRaw : 'beginner';
  const ratio = row[exp];
  if (!Number.isFinite(ratio) || ratio <= 0) return null;
  const sexKey = profile && typeof profile.sex === 'string' ? profile.sex.toLowerCase() : '';
  const sexF = PRIOR_SEX_FACTOR[sexKey] ?? PRIOR_SEX_FACTOR.m;
  const e1rm = ratio * bw * sexF;
  if (!(e1rm > 0)) return null;
  return { e1rm, sigma: POPULATION_SIGMA, pattern };
}
