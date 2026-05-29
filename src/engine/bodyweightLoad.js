// ══ BODYWEIGHT LOAD — effective-load model for bodyweight exercises ═══════
// Daniel (real bug 2026-05-30): "la bodyweight ar trebui sa ne gandim la
// greutatea utilizatorului si sa punem optiunea sa aiba extra weight ... si
// math trebuie sa iasa corect." A Dip / Pull-up / Push-up was treated like a
// barbell lift — a bare kg target was prescribed (often the equipment floor)
// and PR/volume math ignored the user's own bodyweight entirely. A pure
// bodyweight set logged kg=0 → detectPR returns null (w<=0 guard) → a user
// adding pull-up reps could NEVER score a PR. This module fixes the model.
//
// CLASSIFIER (mechanism): the exercise library already tags every entry with
// equipment_type (exerciseLibrary.js §36.36, D081 = coarse SoT). The 131
// 'bodyweight' entries ARE the curated set — we do NOT guess per-exercise at
// runtime. isBodyweightExercise() reads that tag. No new per-exercise list.
//
// FRACTION (how much of bodyweight the movement actually loads): rather than
// 131 hand-tuned numbers (over-engineered, drift-prone), we map the canonical
// English exercise NAME to a movement-PATTERN fraction. The names are
// canonical library keys, so the regex match is reliable + documented here.
//
// EFFECTIVE LOAD = bodyweightKg × patternFraction + addedKg
//   - Pull-up / Chin-up family    → 1.00 × BW (you hang your whole mass)
//   - Dip family                  → 1.00 × BW
//   - Inverted row (feet down)    → 0.60 × BW (partial — feet support some)
//   - Push-up family              → 0.65 × BW (classic biomechanics figure:
//                                    a standard push-up loads ~64-66% BW at
//                                    the hands; knee variants less, decline more
//                                    — we keep one conservative push-up fraction)
//   - Squat / lunge / pistol      → 0.60 × BW (legs carry part via the ground)
//   - Calf raise (standing)       → 1.00 × BW
//   - Glute bridge / hip thrust BW→ 0.55 × BW (hips loaded, shoulders supported)
//   - Hamstring (Nordic/GHR)      → 0.55 × BW (eccentric posterior chain)
//   - Hanging leg/knee raise, core, plank, hold, hyperextension, superman →
//     0 (isometric / no external rep-load; effective load = addedKg only, so
//     volume/PR track the ADDED weight only — a weighted plank/leg-raise still
//     progresses; a pure-bodyweight plank correctly carries no kg load).
//   - DEFAULT (unmatched bodyweight) → 0.65 (push-up-like, conservative).
//
// The fractions are deliberately round + conservative; the first real set's
// rating + AaFriction recalibrate downstream. They are NOT a strict
// physiology claim — they are a sane, documented load proxy so the math is
// CORRECT (non-zero, bodyweight-aware) instead of silently 0.
//
// Cross-refs:
//   - src/engine/exerciseLibrary.js EXERCISE_METADATA[name].equipment_type
//   - src/engine/coldStartGuidelines.js suggestStartWeight (loaded exercises)
//   - src/engine/prEngine.js detectPR (consumes effective kg as `w`)
//   - src/react/lib/scheduleAdapterAggregate.ts toPlannedExercise (target)

import { EXERCISE_METADATA } from './exerciseLibrary.js';

/**
 * True when the exercise is a bodyweight movement per the library's coarse
 * equipment_type tag (the curated SoT — no runtime guessing). Unknown names
 * (not in the library) → false (treated as loaded, the safe legacy path).
 * @param {string} exerciseName ENGLISH canonical name (library key)
 * @returns {boolean}
 */
export function isBodyweightExercise(exerciseName) {
  if (typeof exerciseName !== 'string') return false;
  const meta = EXERCISE_METADATA[exerciseName];
  return !!meta && meta.equipment_type === 'bodyweight';
}

// Movement-pattern fraction table. Ordered: the FIRST matching pattern wins,
// so more specific / heavier patterns are listed before generic ones. Each
// entry is [RegExp on the canonical English name, fraction of bodyweight].
const PATTERN_FRACTIONS = /** @type {Array<[RegExp, number]>} */ ([
  // Isometric / core / holds — no external rep-load (effective = addedKg only).
  [/\b(plank|hold|hang|dead bug|bird dog|hollow|superman|wall sit|l-sit|dragon flag|windshield|copenhagen|body saw|scapular)\b/i, 0],
  [/\b(hyperextension|reverse hyper|back extension)\b/i, 0],
  // Hanging ab work (leg/knee raise, toes-to-bar) — core, no bodyweight load.
  [/\b(leg raise|knee raise|toes-to-bar|garhammer|v-up|crunch|heel tap|reverse crunch)\b/i, 0],
  // Pull-up / chin-up family — full bodyweight through the arms.
  [/\b(pull-up|pullup|chin-up|chinup|chin up|pull up|muscle-up|toes-to-bar)\b/i, 1.0],
  // Dip family — full bodyweight (bench dip is lighter but still ~upper-body).
  [/\bbench dip\b/i, 0.6],
  [/\bdip\b/i, 1.0],
  // Inverted row — feet on floor support part of the mass.
  [/\binverted row\b/i, 0.6],
  // Push-up family — hands carry ~65% of bodyweight (classic figure).
  [/\b(push-up|pushup|push up)\b/i, 0.65],
  // Hamstring posterior-chain bodyweight (Nordic / GHR / slider curl).
  [/\b(nordic|glute-ham|ham raise|hamstring curl|razor curl|inverse curl)\b/i, 0.55],
  // Glute bridge / hip thrust bodyweight — hips loaded, upper body supported.
  [/\b(glute bridge|hip thrust|frog pump|hip extension|donkey kick|fire hydrant)\b/i, 0.55],
  // Calf raises — standing, full bodyweight over the ankle.
  [/\bcalf raise\b/i, 1.0],
  [/\b(tibialis raise)\b/i, 0.3],
  // Squat / lunge / pistol / hinge — lower-body, ground carries part.
  [/\b(squat|lunge|pistol|cossack|step-up|wall hip hinge|hip hinge)\b/i, 0.6],
]);

// Conservative default for any bodyweight exercise whose name matches no
// pattern (push-up-like). Never 0 for an unmatched movement so an unknown
// bodyweight lift still tracks a non-zero effective load.
export const BODYWEIGHT_FRACTION_DEFAULT = 0.65;

/**
 * Fraction of bodyweight that a bodyweight exercise loads, by movement pattern.
 * @param {string} exerciseName ENGLISH canonical name
 * @returns {number} fraction in [0, 1]
 */
export function bodyweightFraction(exerciseName) {
  if (typeof exerciseName !== 'string') return BODYWEIGHT_FRACTION_DEFAULT;
  for (const [re, frac] of PATTERN_FRACTIONS) {
    if (re.test(exerciseName)) return frac;
  }
  return BODYWEIGHT_FRACTION_DEFAULT;
}

/**
 * Effective training load (kg) for ONE rep of an exercise — the value that
 * volume (load × reps × sets), PR detection, and progression must use.
 *
 *   - Loaded exercise (barbell/dumbbell/machine/cable/band): effective = the
 *     external kg on the bar/stack. addedKg is ignored (the kg IS the load) —
 *     bodyweightKg is irrelevant. Returns `externalKg` unchanged (legacy path
 *     byte-for-byte: a non-bodyweight set's load is exactly what it always was).
 *   - Bodyweight exercise: effective = bodyweightKg × patternFraction + addedKg
 *     (belt/dumbbell added load; for assisted variants addedKg may be negative).
 *     When bodyweightKg is unknown/invalid → fall back to addedKg alone (never
 *     fabricate a bodyweight; the set still logs its added load honestly).
 *
 * Clamped at 0 (never negative — an assist heavier than effective bodyweight
 * would be nonsensical; floor at 0 so volume/PR stay sane).
 *
 * @param {string} exerciseName ENGLISH canonical name
 * @param {number} externalKg the kg the user entered (added weight for BW,
 *   else the bar/stack load)
 * @param {number|null|undefined} bodyweightKg user's current bodyweight
 * @returns {number} effective load in kg, rounded to 0.5 (real plate grid)
 */
export function effectiveLoadKg(exerciseName, externalKg, bodyweightKg) {
  const ext = Number(externalKg);
  const safeExt = Number.isFinite(ext) ? ext : 0;
  if (!isBodyweightExercise(exerciseName)) {
    // Loaded exercise — the kg the user entered IS the load (legacy unchanged).
    return safeExt;
  }
  const bw = Number(bodyweightKg);
  const frac = bodyweightFraction(exerciseName);
  const bwLoad = Number.isFinite(bw) && bw > 0 ? bw * frac : 0;
  const eff = Math.max(0, bwLoad + safeExt);
  return Math.round(eff * 2) / 2;
}
