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
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { isEnabled } from '../../util/featureFlags.js';

// ── POPULATION PRIOR (spec §9) — LIVE: dp_population_prior_v1 is ON (rollout 1) ──
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

// ── #80 — cold-start safety dampers (policy _ENGINE_load_bf_rate_policy §1) ──────
// The raw POPULATION_E1RM_PRIOR ratio × bodyweight × sex over-seeds day-1 loads a
// coach would never give to an OLDER, DETRAINED or sedentary new user (audit: a 65F
// beginner Goblet Squat @ ~37kg; a 60yo detrained Leg Press @ ~180kg). The prior
// encodes only sex + experience — NOT chronological age, the load AXIS (a dumbbell
// goblet cannot be loaded at a barbell 1RM), nor the policy's no-history confidence
// penalty. These three damps (compose multiplicatively, only ever LOWER the seed)
// land coach-sane day-1 loads while keeping the signal-floor (target ~RPE 6-7, the
// first set then recalibrates — undershoot+ramp > overshoot).

// CONNECTIVE/strength decline with chronological age — older → lighter, meaningful
// at 60+/65+ (policy §1 + Daniel's "65 vs 30 differ"). Mirrors the tendon-cap age
// shape (ceiling.js): no damp at/below FULL_AGE, linear taper to FLOOR at FLOOR_AGE.
export const COLDSTART_AGE_FULL = 45;     // <= → no damp (1.0)
export const COLDSTART_AGE_FLOOR_AGE = 70; // >= → max taper (the floor)
export const COLDSTART_AGE_FLOOR = 0.62;   // smallest age multiplier

// No-history confidence penalty (policy §1: ×0.90–0.95 — SMALL, experience already
// encodes "unknown/weak", don't double-discount). A cold-start seed is by definition
// no-history → always applied.
export const COLDSTART_CONFIDENCE_PENALTY = 0.92;

// Load-AXIS factor: the prior ratio is a barbell/free-weight 1RM. A dumbbell (per-
// hand) goblet/movement, a band, or a cable variant cannot be loaded at that 1RM,
// so price the seed on the movement's real load axis. machine ≈ barbell. Mirrors the
// coldStartGuidelines FALLBACK_EQUIP_FACTOR spirit (per-hand DB carries far less).
export const COLDSTART_EQUIP_AXIS = Object.freeze({
  barbell: 1.0, machine: 0.90, cable: 0.80, dumbbell: 0.45, band: 0.40, bodyweight: 1.0,
});

// PATTERN×EQUIPMENT axis overrides (gym-log arc 2026-06-11). A single per-equipment
// factor is too coarse — Daniel's two real sessions proved it in BOTH directions:
//   - DB PRESSES seeded HIGH (Seated DB 30/hand vs real 20-25; Incline DB 40 vs
//     25-30): the press ratios are barbell-TOTAL 1RMs; per-hand dumbbell work runs
//     ≈ 75-85% of the bar split across two hands MINUS a stability tax → ≈0.36,
//     not the generic 0.45.
//   - CABLE/MACHINE REAR-DELT class seeded LOW 2-4× (Face Pull 9-16 vs real 27-36;
//     Reverse Pec Deck 12.5-18 vs real 24): the `lateral` ratio is calibrated on
//     strict DB lateral raises; rope/stack rear-delt machinery (both hands, better
//     leverage) carries far MORE than a DB lateral — these overrides RAISE the
//     axis above the generic cable/machine damp (a deliberate, documented
//     exception to "damps only lower"; bounded, and the 60F-beginner floor stays
//     coach-sane: face pull ≈ 6-7kg).
// Keyed `pattern|equipment_type`; everything absent falls to COLDSTART_EQUIP_AXIS.
export const COLDSTART_PATTERN_EQUIP_AXIS = Object.freeze({
  'benchpress|dumbbell': 0.36,
  'ohp|dumbbell': 0.36,
  'lateral|cable': 1.30,
  'lateral|machine': 1.20,
});

// Bug 3a (founder real-data 2026-06-28) — machine/Smith PRESS axis bump behind
// dp_coldstart_machine_press_v1. A back-supported, bilaterally-guided machine press
// carries MORE than the free-weight 'ohp'/'benchpress' barbell-total ratio assumes,
// so eqF defaulting to the generic machine damp 0.90 under-seeds it (founder machine
// OHP cold-started ~30kg @bw75 intermediate vs his real 36-43). 1.10 is the tightest
// bump that lands an experienced presser in-band WITHOUT over-seeding a beginner (the
// experience ratio + the machine step absorb it: a 60F beginner stays ~18kg). Read ONLY
// when the flag is on (at the lookup below); off → byte-identical to the generic 0.90 axis.
const COLDSTART_PATTERN_EQUIP_AXIS_MACHINE_PRESS = Object.freeze({
  'ohp|machine': 1.10,
  'benchpress|machine': 1.10,
});

const EXPERIENCE_KEYS = ['beginner', 'intermediate', 'advanced'];

/**
 * Chronological-age damper on the cold-start seed: 1.0 at/below COLDSTART_AGE_FULL,
 * linear taper to COLDSTART_AGE_FLOOR at COLDSTART_AGE_FLOOR_AGE, flat thereafter.
 * Absent/invalid age → 1.0 (neutral — a young or age-unknown user is not penalized).
 * @param {number|null|undefined} ageYears @returns {number} in [FLOOR, 1]
 */
export function coldStartAgeFactor(ageYears) {
  const a = Number(ageYears);
  if (!Number.isFinite(a) || a <= 0) return 1;
  if (a <= COLDSTART_AGE_FULL) return 1;
  if (a >= COLDSTART_AGE_FLOOR_AGE) return COLDSTART_AGE_FLOOR;
  const span = COLDSTART_AGE_FLOOR_AGE - COLDSTART_AGE_FULL;
  return 1 - ((a - COLDSTART_AGE_FULL) / span) * (1 - COLDSTART_AGE_FLOOR);
}

/**
 * Population-typical e1RM (kg-scale) for a new lift from the user's OWN demographic
 * profile. PURE — a static on-device lookup. Returns null when bodyweight is
 * unusable (the caller falls to today's suggestStartWeight).
 *
 * @param {string} ex canonical engineName
 * @param {{ bodyweightKg?: number|null, sex?: string|null, experience?: string|null, age?: number|null }} profile
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
  // #80 cold-start safety damps (policy §1): chronological-age × no-history
  // confidence × load-axis. Each only ever LOWERS the seed; absent age / unknown
  // equipment → neutral 1.0 → byte-identical to the prior raw seed.
  const ageF = coldStartAgeFactor(profile ? profile.age : undefined);
  const meta = getExerciseMetadata(ex);
  // Pattern×equipment override first (gym-log arc 2026-06-11 — presses-per-hand
  // down, cable/machine rear-delt class up), then the per-equipment axis.
  const eqKey = meta ? `${pattern}|${meta.equipment_type}` : '';
  const eqOverride = meta
    ? (COLDSTART_PATTERN_EQUIP_AXIS[eqKey]
        ?? (isEnabled('dp_coldstart_machine_press_v1') ? COLDSTART_PATTERN_EQUIP_AXIS_MACHINE_PRESS[eqKey] : undefined))
    : undefined;
  const eqF = eqOverride != null
    ? eqOverride
    : (meta && COLDSTART_EQUIP_AXIS[meta.equipment_type] != null)
      ? COLDSTART_EQUIP_AXIS[meta.equipment_type]
      : 0.80; // unknown equipment → the conservative cable-level axis
  const e1rm = ratio * bw * sexF * ageF * COLDSTART_CONFIDENCE_PENALTY * eqF;
  if (!(e1rm > 0)) return null;
  return { e1rm, sigma: POPULATION_SIGMA, pattern };
}
