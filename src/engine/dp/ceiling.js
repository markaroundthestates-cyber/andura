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

// ══ BUILD F6c #35 — age-scaled TENDON load-rate cap (F6c spec §6) ════════════
// gainDecay (above) throttles the climb by the MUSCULAR strength ceiling; this is
// a SECOND, ORTHOGONAL throttle keyed on CHRONOLOGICAL age — connective tissue
// (tendon/ligament) adapts SLOWER than muscle, and that gap widens with age, so an
// older lifter's LOAD must climb slower than the muscular signal alone would allow
// (Daniel's explicit "65 vs 30 differ" rule). It is distinct from the recovery
// model (#5/#21 — WHEN a muscle is trained, path A); this caps HOW FAST the LOAD
// climbs (path B step). NOTE the input is CHRONOLOGICAL age (onboarding `age`,
// builder.ts:147), NOT trainingAge — ageFraction above is training-age and does
// NOT provide this cap (spec §9).
//
// Returns a max-allowed per-session load-increase FRACTION, monotonically
// DECREASING in chronological age: full step (1.0 = no cap) up to TENDON_FULL_AGE,
// linearly tapering to TENDON_FLOOR_FRAC at TENDON_CAP_AGE, then flat. Composed
// (MIN-style) with gainDecay + the deficit throttle at the climb site — it only
// ever LOWERS the up-step magnitude, NEVER raises it, and NEVER lowers below the
// PR-floor (the floor is applied separately, after this cap). An absent / invalid
// age returns 1.0 (neutral — a cold-start user is never penalized).
//
// UNVERIFIED DESIGN PROPOSAL (spec §9): the age knots + the floor fraction are a
// research/Daniel sanity-check item before dp_tendon_cap_v1 flips ON. The shape
// (older → smaller per-session load step) is the verified physiology; the exact
// numbers are tunable.
export const TENDON_FULL_AGE = 35;     // <= this age → no cap (full muscular step)
export const TENDON_CAP_AGE = 65;      // >= this age → the floor fraction (max taper)
// Smallest allowed per-session load-step fraction. Set BELOW the easy-run climb
// band's max (the find-your-weight pure-easy-run step caps at +0.50, dp.js) so the
// cap actually bites at the oldest ages (otherwise a 0.50 floor only equals the max
// and never reduces a step). DESIGN PROPOSAL (spec §9) — the magnitude is tunable.
export const TENDON_FLOOR_FRAC = 0.34;

/**
 * Max-allowed per-session LOAD-increase fraction for a chronological age. 1.0 at /
 * below TENDON_FULL_AGE (no cap), linearly tapering to TENDON_FLOOR_FRAC at
 * TENDON_CAP_AGE, flat thereafter. Absent / invalid age → 1.0 (neutral). PURE.
 * @param {number} ageYears chronological age (onboarding `age`)
 * @returns {number} in [TENDON_FLOOR_FRAC, 1]
 */
export function tendonLoadRateCap(ageYears) {
  const a = Number(ageYears);
  if (!Number.isFinite(a) || a <= 0) return 1;       // absent/invalid → neutral
  if (a <= TENDON_FULL_AGE) return 1;                // young → no cap
  if (a >= TENDON_CAP_AGE) return TENDON_FLOOR_FRAC; // old → max taper
  const span = TENDON_CAP_AGE - TENDON_FULL_AGE;
  const t = (a - TENDON_FULL_AGE) / span;            // 0..1 across the taper band
  return 1 - t * (1 - TENDON_FLOOR_FRAC);
}

// ══ BUILD F6c #37 — deficit-aware progression throttle (F6c spec §3) ═════════
// The dp.js climb is phase-BLIND today — it chases new-max PRs the same in a deep
// cut as in a bulk. D109 already encodes "in a deficit preserve, don't push" in the
// deload engine (depthCalculator.js:117); #37 extends it to the weight-climb. This
// is a pure throttle FACTOR on the NEW-max climb step (the pure-easy-run push above
// demonstrated capacity), composed (MIN) with gainDecay. It NEVER touches the
// PR-floor / catch-up to an already-OWNED load — a deficit must not crater capacity.
//
// UNVERIFIED DESIGN PROPOSAL (spec §9 — embodies the D109 product rule): the CUT
// factor needs a sim sweep + Daniel sanity-check before dp_deficit_throttle_v1 flips
// ON. In a deficit, recovery + the ability to add muscle/strength are blunted, so the
// new-max climb is damped (not stopped — a real strength gain in a cut still climbs,
// just slower). BULK/STRENGTH/MAINTENANCE = full climb (1.0).
export const DEFICIT_CLIMB_FACTOR = 0.5; // CUT new-max climb runs at ~half the rate

/**
 * Multiplier on the NEW-max climb step for the active energy phase. CUT throttles
 * (DEFICIT_CLIMB_FACTOR); BULK / STRENGTH / MAINTENANCE / absent → 1.0 (full climb,
 * byte-identical). PURE.
 * @param {string|null|undefined} phase resolveActivePhase token (CUT|BULK|MAINTENANCE|STRENGTH)
 * @returns {number} in (0,1]
 */
export function deficitClimbFactor(phase) {
  return phase === 'CUT' ? DEFICIT_CLIMB_FACTOR : 1;
}

// ══ BUILD #76 — energy → VOLUME / RIR / deload modulation (magnitude-aware) ══
// #37 (deficitClimbFactor above) only throttles the LOAD CLIMB RATE on a binary
// phase (CUT vs not). #76 is the DEEPER half Daniel flagged: it modulates the
// SESSION VOLUME + fatigue-management (RIR / deload), scaled by the deficit/surplus
// MAGNITUDE — not just the phase string. It is the path-A (volume) mirror of #37,
// composed at the React compose seam (scaleSetsByEnergy), never in the dp.js kg
// path. CRITICAL INVARIANT: this NEVER touches the prescribed kg — heavy load
// preserves muscle in a deficit; only sets / RIR / deload frequency move.
//
// Magnitude = { phase, severity } where severity ∈ [0,1] is the deficit/surplus
// kcal-shift as a FRACTION of maintenance (resolved at the React boundary from the
// coherent kcal-sizing model — the actual kcal-delta, NOT the bayesian
// likelihood typing; see scheduleAdapterAggregate.compose.ts).
//
// VOLUME (the policy _ENGINE_volume_policy §11 "aggressive cut: reduce volume
// 15-30%, PRESERVE intensity"): in a deficit cut session volume between
// VOLUME_CUT_MIN (mild, −15%) and VOLUME_CUT_MAX (deep, −30%), linearly in
// severity, anchored at the deficit ONSET threshold (a trivial deficit must not
// cut). In a surplus, allow a SMALL extra volume tolerance toward +10% (bounded;
// the MRV clamp lives downstream). MAINTENANCE / absent → 1.0 (no change).
//
// RIR: a deeper deficit pushes FURTHER from failure (recovery impaired) → a
// positive RIR shift up to RIR_SHIFT_MAX reps; a surplus can train slightly CLOSER
// to failure → a small negative shift. The shift is a label/target nudge only — it
// rides the rirTargetModifier band (display), NEVER the kg.
//
// DELOAD: a deeper/sustained deficit warrants deloads more often → a deloadBias in
// [0,1] (0 = no change, 1 = strongest pull-forward) the deload cadence can consume.
// Surfaced for the deload seam; the volume/RIR halves are the wired effect today.
//
// UNVERIFIED DESIGN PROPOSAL (spec §9): the cut band + onset + RIR/deload knobs are
// a sim-sweep + Daniel sanity-check item before dp_energy_volume_v1 flips ON. The
// SHAPE (deeper deficit → less volume + more RIR + more deloads, load untouched) is
// the verified principle; the numbers are tunable.
export const ENERGY_DEFICIT_ONSET = 0.05;   // below this severity → no cut (a trivial deficit)
export const VOLUME_CUT_MIN = 0.15;          // mild deficit → −15% volume
export const VOLUME_CUT_MAX = 0.30;          // deep deficit → −30% volume (policy floor)
export const SEVERITY_AT_MAX_CUT = 0.30;     // severity (30% kcal deficit) that reaches the max cut
export const VOLUME_SURPLUS_BONUS_MAX = 0.10; // deep surplus → up to +10% volume tolerance
export const SEVERITY_AT_MAX_SURPLUS = 0.15;  // severity (15% kcal surplus) that reaches the bonus
export const VOLUME_FACTOR_MIN = 0.70;        // hard clamp (the policy's deepest cut)
export const VOLUME_FACTOR_MAX = 1.10;        // hard clamp (the surplus ceiling)
export const RIR_SHIFT_MAX = 2;               // deep deficit → up to +2 RIR (further from failure)
export const RIR_SHIFT_SURPLUS_MAX = 1;       // deep surplus → up to −1 RIR (closer to failure)

/**
 * Magnitude-aware energy → session modulation. Returns the VOLUME multiplier
 * (clamped [VOLUME_FACTOR_MIN, VOLUME_FACTOR_MAX]), the RIR shift (reps further
 * from / closer to failure), and a deload-frequency bias [0,1]. The prescribed
 * LOAD is NEVER an output here — load is owned by the dp.js kg path and must not
 * move with nutrition (KEEP-LOAD invariant). MAINTENANCE / absent phase / a
 * sub-onset deficit → the neutral identity { volumeFactor:1, rirShift:0,
 * deloadBias:0 } (byte-identical caller). PURE — no I/O, no clock, no RNG.
 *
 * @param {{ phase: string|null|undefined, severity: number }|null|undefined} magnitude
 *   phase = resolveActivePhase token; severity = |kcalShift|/maintenance in [0,1].
 * @returns {{ volumeFactor: number, rirShift: number, deloadBias: number }}
 */
export function energyVolumeFactor(magnitude) {
  const phase = magnitude && typeof magnitude.phase === 'string' ? magnitude.phase : null;
  const sevRaw = magnitude && Number.isFinite(magnitude.severity) ? Number(magnitude.severity) : 0;
  const severity = Math.min(1, Math.max(0, sevRaw));
  const NEUTRAL = { volumeFactor: 1, rirShift: 0, deloadBias: 0 };

  if (phase === 'CUT') {
    // Sub-onset (a trivial deficit) → no modulation (don't punish a maintenance-ish cut).
    if (severity <= ENERGY_DEFICIT_ONSET) return NEUTRAL;
    // Linearly ramp the cut from MIN (at onset) to MAX (at SEVERITY_AT_MAX_CUT), then flat.
    const span = Math.max(1e-9, SEVERITY_AT_MAX_CUT - ENERGY_DEFICIT_ONSET);
    const t = Math.min(1, (severity - ENERGY_DEFICIT_ONSET) / span);
    const cut = VOLUME_CUT_MIN + t * (VOLUME_CUT_MAX - VOLUME_CUT_MIN);
    const volumeFactor = Math.max(VOLUME_FACTOR_MIN, Math.min(VOLUME_FACTOR_MAX, 1 - cut));
    // Deeper deficit → push further from failure (recovery impaired). 0..RIR_SHIFT_MAX.
    const rirShift = Math.round(t * RIR_SHIFT_MAX);
    // Deeper deficit → deloads more often. Bias scales with severity depth.
    const deloadBias = t;
    return { volumeFactor, rirShift, deloadBias };
  }

  if (phase === 'BULK' || phase === 'STRENGTH') {
    // Surplus → a SMALL extra volume tolerance (bounded; MRV clamp is downstream).
    if (severity <= ENERGY_DEFICIT_ONSET) return NEUTRAL;
    const span = Math.max(1e-9, SEVERITY_AT_MAX_SURPLUS - ENERGY_DEFICIT_ONSET);
    const t = Math.min(1, (severity - ENERGY_DEFICIT_ONSET) / span);
    const bonus = t * VOLUME_SURPLUS_BONUS_MAX;
    const volumeFactor = Math.max(VOLUME_FACTOR_MIN, Math.min(VOLUME_FACTOR_MAX, 1 + bonus));
    // Surplus → can train slightly CLOSER to failure. 0..−RIR_SHIFT_SURPLUS_MAX.
    const rirShift = -Math.round(t * RIR_SHIFT_SURPLUS_MAX);
    return { volumeFactor, rirShift, deloadBias: 0 };
  }

  // MAINTENANCE / absent / unknown → neutral.
  return NEUTRAL;
}

// ══ BUILD F6c #21 — relative strength (strength-to-bodyweight ratio) ═════════
// e1RM is already kg-scale and the ceiling is already BW-normalized, so mu/bw — a
// user's strength relative to their own bodyweight — is a one-line derivation from
// values that already exist. It is a NARRATION / correct-plateau-attribution signal
// (a user at mu/bw near the pattern's STRENGTH_STANDARD_RATIO is genuinely strong-
// for-their-weight, reinforcing a near-ceiling plateau classification); it does NOT
// move a prescribed kg. PURE.
/**
 * Strength-to-bodyweight ratio (e1RM per kg bodyweight). Returns 0 when either input
 * is unusable. @param {number} mu @param {number} bwKg @returns {number}
 */
export function relativeStrength(mu, bwKg) {
  const m = Number(mu);
  const bw = Number(bwKg);
  if (!Number.isFinite(m) || m <= 0 || !Number.isFinite(bw) || bw <= 0) return 0;
  return m / bw;
}

// ══ BUILD — behavioral training-level bands (e1RM/bodyweight per pattern) ═════
// The ELITE ceiling above (STRENGTH_STANDARD_RATIO) clips physically-absurd loads;
// these are the LOWER tier thresholds used to INFER a user's real training level
// from what they actually lift (convergenceGuard.resolveTier). For each movement
// pattern, the e1RM/bodyweight ratio at which a male lifter crosses into the
// INTERMEDIATE band and into the ADVANCED band. Below intermediate → beginner.
//
// SOURCE: public strength-standard references (strengthlevel.com / symmetric-
// strength style male standards, ~80-90kg bodyweight reference), rounded
// conservatively. The ADVANCED threshold deliberately sits BELOW the elite
// STRENGTH_STANDARD_RATIO ceiling (e.g. squat advanced 1.75 < elite 2.5, bench
// advanced 1.35 < elite 2.0) — reaching the advanced band is real-training-age
// proof, reaching elite is a competitive outlier. Female lifters scale via the
// SAME CEILING_SEX_FACTOR applied to the user's measured ratio before comparison
// (so one male-referenced table serves both). Only the MAIN patterns the bands
// are meaningful for are listed; an unlisted pattern (isolation) returns null
// (no level signal — isolations don't carry a clean strength-standard).
//
// strengthlevel.com male bodyweight-multiple standards (Intermediate / Advanced):
//   Squat        ~1.25 / ~1.75   Bench   ~1.0  / ~1.35
//   Deadlift     ~1.5  / ~2.25   OHP     ~0.6  / ~0.9
//   Row (bent)   ~1.0  / ~1.4
export const STRENGTH_TIER_BAND = Object.freeze({
  squat:      Object.freeze({ intermediate: 1.25, advanced: 1.75 }),
  deadlift:   Object.freeze({ intermediate: 1.50, advanced: 2.25 }),
  benchpress: Object.freeze({ intermediate: 1.00, advanced: 1.35 }),
  ohp:        Object.freeze({ intermediate: 0.60, advanced: 0.90 }),
  row:        Object.freeze({ intermediate: 1.00, advanced: 1.40 }),
});

/**
 * Classify a single movement's training level from the user's relative-strength
 * ratio (e1RM/bodyweight, already sex-normalized by the caller) against
 * STRENGTH_TIER_BAND. Returns null for a pattern with no band (isolation — no
 * strength-standard signal) or an unusable ratio. PURE.
 * @param {string} pattern classifyPattern token
 * @param {number} ratio sex-normalized e1RM/bodyweight
 * @returns {'beginner'|'intermediate'|'advanced'|null}
 */
export function classifyMovementLevel(pattern, ratio) {
  const band = STRENGTH_TIER_BAND[pattern];
  const r = Number(ratio);
  if (!band || !Number.isFinite(r) || r <= 0) return null;
  if (r >= band.advanced) return 'advanced';
  if (r >= band.intermediate) return 'intermediate';
  return 'beginner';
}

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
