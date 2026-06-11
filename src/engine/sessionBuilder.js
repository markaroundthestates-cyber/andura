// ══ SESSION BUILDER — Construieste lista de exercitii pentru o sesiune ═══
// Pure function: no side effects, no class, no imports from app state.
//
// WP-4 (P3 moat): selection now pulls from the 657-entry exerciseLibrary by
// muscle group instead of a hardcoded ~22-name table. Filters: muscle group
// (session type) x available equipment (coarse equipment_type) x tier
// (persona/experience). Selection is DETERMINISTIC (seeded on user+day) and
// ANCHORS on the known engine names that carry PR history, so existing users
// keep continuity (the 18/21 names that exist verbatim as library keys).

import { EXERCISE_METADATA, getExerciseMetadata, isActiveMeta } from './exerciseLibrary.js';
import { BIG11_RO_TO_EN_MAP, CLUSTER_BIG6_TO_BIG11_WEIGHT, ISRAETEL_BASELINES } from './periodization/constants.js';
import { isExcludedMovement } from './movementExclusion.js';
import { EXERCISE_TIER_RANK, tierSelectScore, TIER_SELECTABLE_SA } from './exerciseTierRank.js';
import { applyFocusPolicy, deriveExerciseTags, focusRelevantTags } from './focusPolicy.js';

// buildSession's first param is now a Big-6 CLUSTER id (push/pull/legs/upper/
// lower/full) — the target muscle groups + their session-slot bias come from the
// shared CLUSTER_BIG6_TO_BIG11_WEIGHT map (periodization/constants.js, ADR_ENGINE_
// REFACTOR §4.3 SSOT). Each cluster's weight keys ARE the Big-11 RO target groups
// (library muscle_target_primary); the weights bias how many of the session's
// slots each group earns (heavier weight → more exercises/sets). This replaced the
// old hardcoded SESSION_TYPE_MUSCLE_TARGETS table whose absolute-weekday split
// surfaced legs only on Wednesday and never reached glutes/calves.
//
// Fallback cluster when an unknown id is passed (defensive): a balanced full body.
const FALLBACK_CLUSTER = 'full';

/**
 * Big-11 RO target groups for a cluster, ordered heaviest-weight-first so the
 * primary group (where the T1 compound anchor lands) leads. Unknown cluster →
 * the balanced full-body cluster.
 * @param {string} cluster - push|pull|legs|upper|lower|full
 * @returns {string[]} ordered Big-11 RO groups
 */
function clusterGroupsOrdered(cluster) {
  const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster]
    || CLUSTER_BIG6_TO_BIG11_WEIGHT[FALLBACK_CLUSTER];
  return Object.keys(weights).sort((a, b) => weights[b] - weights[a]);
}

// Coarse equipment types (library equipment_type). bodyweight is ALWAYS allowed
// (needs no gym equipment) so it is never gated by the missing-equipment filter.
const ALWAYS_AVAILABLE_EQUIPMENT = 'bodyweight';

// Known engine names that exist as library keys AND carry user PR history
// (DP records key on these EN names). Anchoring prefers them when valid for the
// group + equipment, so existing users do NOT lose visible PR continuity. 18/19
// current engine names map verbatim; `Pec Deck` -> `Pec Deck / Cable Fly` is the
// single documented divergence (handled via PEC_DECK_ALIAS at the call boundary).
const ANCHOR_NAMES = new Set([
  'Incline DB Press', 'Flat DB Press', 'DB Shoulder Press', 'Lateral Raises',
  'Lateral Raises (cable)', 'Rear Delt Fly', 'Rear Delt Cable', 'Overhead Triceps',
  'Pushdown', 'Lat Pulldown', 'Cable Row', 'Face Pulls', 'Bayesian Curl',
  'Incline DB Curl', 'Hammer Curl', 'Cable Curl', 'Leg Press', 'Leg Extension',
  'Leg Curl', 'Romanian Deadlift', 'Cable Fly', 'Pec Deck / Cable Fly',
]);

// BUG 2 fix — commonness bias. The library has NO popularity / "is_common" field
// (schema: equipment_type, force_demand, tier, skill_level, muscle_target_*,
// fallback_cascade, names — verified), so "obscure" can't be read off the data.
// Without a commonness signal the non-anchor fill ordered candidates by a SEEDED
// HASH = effectively random among 657, surfacing esoteric variants (Garhammer
// Raise, "Stability Ball Stir the Pot", Cable Tibialis Raise, Cossack Squat,
// Fire Hydrant, Windshield Wiper) over lifts a normal gym-goer recognizes.
//
// Fix = a CURATED set of standard, recognizable movements per Big-11 group (the
// lifts Gigel knows). It seeds a COMMON band in rank() between anchors and the
// long tail, so fills PREFER recognizable movements; obscure variants only appear
// when nothing common is left for the group. Exact library keys (nameEn). This
// only REORDERS non-anchor candidates — all gates (tier/skill/equipment, dedup,
// PR continuity) stay intact. ANCHOR_NAMES already rank above this, so they are
// not repeated here.
const COMMON_MOVEMENTS = new Set([
  // piept (chest) — barbell/DB/machine presses, incline, dips, push-up, flyes
  'Flat Barbell Bench', 'Incline Barbell Bench', 'Decline Barbell Bench',
  'Flat Chest Press Machine', 'Incline Chest Press Machine', 'Neutral Grip DB Press',
  'Dip', 'Weighted Dip', 'Push-up', 'DB Fly', 'Incline DB Fly', 'Pec Deck Rear',
  'Cable Crossover Standing', 'Close-Grip Bench Press',
  // umeri (shoulders) — overhead press, machine press, lateral/front/rear raises
  'OHP', 'Push Press', 'Seated DB Press', 'Standing DB Press', 'Arnold Press',
  'Machine Shoulder Press', 'DB Lateral Raise', 'Cable Lateral Raise',
  'Machine Lateral Raise', 'DB Front Raise', 'Cable Front Raise', 'Face Pull',
  'Reverse Pec Deck', 'DB Rear Delt Fly',
  // triceps — pushdowns, overhead extensions, skullcrushers, dips
  'Cable Triceps Pushdown Rope', 'Cable Triceps Pushdown Straight Bar',
  'Cable Triceps Pushdown V-bar', 'Lying Triceps Extension Barbell',
  'Lying Triceps Extension EZ-bar', 'Seated Overhead Triceps Extension EZ-bar',
  'Cable Overhead Triceps Extension Rope', 'Triceps Dip Parallel Bars',
  'Triceps Press Machine', 'Bench Dip',
  // spate (back) — pulldowns, rows, pull-ups/chin-ups, shrugs, deadlift
  'Wide-Grip Lat Pulldown', 'Close-Grip Lat Pulldown', 'Neutral-Grip Lat Pulldown',
  'Pull-up', 'Chin-up', 'Weighted Pull-up', 'Barbell Row', 'T-Bar Row',
  'Pendlay Row', 'DB Row', 'Chest-Supported DB Row', 'Wide-Grip Cable Row',
  'Close-Grip Cable Row', 'Conventional Deadlift', 'Trap Bar Deadlift',
  'BB Shrug', 'DB Shrug',
  // biceps — barbell/DB/EZ/cable curls, preacher, hammer
  'Barbell Curl Standing', 'EZ-bar Curl Standing', 'DB Curl Standing',
  'DB Curl Standing Alternate', 'DB Curl Seated Alternate', 'Preacher Curl',
  'DB Preacher Curl', 'Concentration Curl', 'DB Concentration Curl Standing',
  'Cable Curl Standing Straight Bar', 'Cable Curl Standing Rope',
  'DB Hammer Curl Standing', 'Cable Hammer Curl Rope', 'Spider Curl Barbell',
  // antebrate (forearms) — wrist curls, reverse curls, farmer's
  'Wrist Curl Barbell Seated Palms-Up', 'Reverse Wrist Curl Barbell Seated',
  "Farmer's Walk DB", 'Reverse Curl Barbell', 'Reverse Curl EZ-bar',
  // picioare-quads — squats, leg press, lunges, leg extension, hack/goblet squat
  'Barbell Back Squat (High Bar)', 'Barbell Back Squat (Low Bar)', 'Front Squat',
  'Hack Squat Machine', 'Goblet Squat', 'DB Squat', 'Bulgarian Split Squat',
  'DB Lunge', 'Walking Lunge', 'Reverse Lunge', 'Barbell Lunge', 'Leg Extension',
  '45-Degree Leg Press', 'Smith Machine Squat',
  // picioare-hamstrings — RDL variants, leg curls, good morning, deadlift
  'Conventional Deadlift', 'Stiff-Leg Deadlift', 'Seated Leg Curl',
  'Standing Leg Curl', 'Lying Leg Curl', 'Barbell Good Morning', 'DB Romanian Deadlift',
  // fese (glutes) — hip thrust, glute bridge, sumo, kickback
  'Hip Thrust', 'Barbell Glute Bridge', 'DB Hip Thrust', 'Cable Glute Kickback',
  'Glute Kickback Machine', 'Hip Abduction Machine', 'Sumo Deadlift',
  // gambe (calves) — standing/seated calf raise
  'Standing Calf Raise Machine', 'Seated Calf Raise Machine', 'Standing DB Calf Raise',
  'Leg Press Calf Raise', 'Donkey Calf Raise', 'Standing Barbell Calf Raise',
  // core (abs) — crunches, leg raises, planks, cable crunch
  'Reverse Crunch', 'Hanging Leg Raise', 'Hanging Knee Raise', 'Cable Crunch Kneeling',
  'Cable Crunch Standing', 'Decline Sit-up', 'Plank with Shoulder Tap', 'V-Up',
  'Ab Wheel Rollout', 'Cable Russian Twist',
]);

// SESSION_SIZE is the MAX exercises per session (sanity ceiling, anti-2h
// session), NOT a fixed count. The real count now falls out of the weekly
// volume budget (computeSessionExerciseCount) clamped to [minSession, SESSION_SIZE]
// where minSession is tier-aware (minSessionForTier).
const SESSION_SIZE = 8;
// Floor so a session is never a token 1-2 movements (junk-low). Tier-aware: a
// beginner (T0) lands near the base floor naturally (persona modifier shrinks
// weekly volume), but a TRAINED lifter (T1/T2+) should never present a session
// below MIN_SESSION_TRAINED — a 4-exercise day reads thin/under-cooked to someone
// past beginner. Advanced still climbs toward SESSION_SIZE — emergent above the
// floor, no per-tier hardcode of the COUNT, only of the floor.
const MIN_SESSION_BEGINNER = 4;
const MIN_SESSION_TRAINED = 5;
// #70-D5 — max exercises a BEGINNER (T0) gets per muscle group in a session. A
// novice training a group on several days of a high-freq split otherwise stacks
// 3 exercises × the compound set-floor on EACH day → over-MRV weekly (the policy:
// beginner = MEV/low-MAV, no peak). 2 keeps a beginner's per-group week in the
// novice band even on a 3×/week group frequency. Trained tiers are uncapped here.
const BEGINNER_MAX_SLOTS_PER_GROUP = 2;

// W-Split GAP 4 — MAJOR muscles that must never be slot-starved to ZERO on a
// full-body day (the big movers). The per-major-muscle WEEKLY maintenance floor
// (applyMaintenanceFloor) guarantees ≥ MEV in the BUDGET, but the session is
// slot-limited (SESSION_SIZE < the 11 full-body groups), so a focus that
// front-loads its emphasized region (upper → piept/spate/umeri win the slots +
// the extra-slot exemption) can push the posterior chain entirely OUT of the
// session — the budget floor then never reaches the day (Gigel 2d UPPER:
// hams/glutes/calves = 0). This set is the slot-side complement of the budget
// floor: each major muscle the cluster trains is GUARANTEED at least one slot so
// the MEV budget actually lands as an exercise. RO keys. Gated on
// ctx.maintenanceFloorGuarantee (dp_split_rebalance_v1) → OFF = byte-identical.
const MAJOR_MUSCLES_SLOT_GUARANTEE = Object.freeze([
  'piept', 'spate', 'umeri',
  'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
]);

// Daniel coach audit 2026-06-10 (#3): a single session must not pile on more than
// 2 BIG lower lifts (the systemic squat/hinge/lunge movers = tier-1 on the quad &
// hamstring movers). His live Legs day stacked 3 (Hack Squat + RDL + Walking Lunge)
// → too dense; 2 big + accessories is the right shape. Glute machines / calves /
// core are accessories (other groups), so they never count toward the cap.
const LOWER_BIG_GROUPS = new Set(['picioare-quads', 'picioare-hamstrings']);
const MAX_BIG_LOWER_LIFTS = 2;
// F7 (Daniel coach audit 2026-06-10) — the big-lower cap was keyed on tier===1
// alone, but several STANCE/variant compounds of the same systemic movement are
// library tier 2 (Wide-/Narrow-Stance Leg Press, DB Sumo/Pistol Squat, Lateral/
// Curtsy/Deficit Lunge). They are the SAME bilateral squat/press/hinge/lunge
// pattern as their tier-1 base, so a tier-2 Wide-Stance Leg Press slipped in as an
// "accessory" AFTER Squat+RDL → a 3rd big lift on the live Legs day. Classify a big
// lower lift by the MOVEMENT PATTERN token (the same coarse family movementKey uses
// for dedup) on the quad/ham groups, in ADDITION to the tier-1 signal — a strict
// superset that never drops a current tier-1 mover (incl. GHR/Nordic/good-morning/
// hyper) while folding the variant compounds in. The single-joint isolations of the
// same groups carry the DISTINCT leg-extension/leg-curl tokens (matched before the
// generic extension/curl), so they are NOT swept in. Keyed on the canonical token →
// works for every present + future stance variant of these patterns automatically.
const LOWER_BIG_MOVEMENT_TOKENS = new Set([
  'squat', 'leg-press', 'lunge', 'deadlift', 'hip-thrust', 'good-morning',
]);

/**
 * Tier-aware session-substance floor. T0 (beginner) keeps the base floor of 4;
 * every trained tier (T1/T2+, and unknown/null defensively) floors at 5 so a
 * trained lifter's session is never presented below 5 exercises.
 * @param {string|null|undefined} profileTier - 'T0' | 'T1' | 'T2' | null
 * @returns {number} minimum exercises per session for the tier
 */
function minSessionForTier(profileTier) {
  return profileTier === 'T0' ? MIN_SESSION_BEGINNER : MIN_SESSION_TRAINED;
}
// Default count when no volume signal is available (empty user / no
// volumeTargets) — preserves the legacy ~6-exercise session for cold-start.
const DEFAULT_SESSION_SIZE = 6;
// Typical working sets per exercise — converts a group's per-session set budget
// into an exercise count (sets_for_group / SETS_PER_EXERCISE).
const SETS_PER_EXERCISE = 3;
// Max T1 compound anchors per session (1-2 compound on the primary group).
const MAX_T1 = 2;

// Per-exercise set-count fallback when no engine volume signal is supplied
// (keeps pure-function callers without periodization context stable).
const DEFAULT_SETS = 3;
// Tier-scoped per-exercise clamps for the in-group distribution. A COMPOUND
// (tier 1, the group's anchor lift) earns the bulk of the volume; ISOLATION
// (tier 2/3) is trimmed. Within a session a compound must NEVER carry fewer
// working sets than an isolation of the same group — these clamps + the
// compound-first distribution order guarantee that.
const COMPOUND_MIN_SETS = 3;
const COMPOUND_MAX_SETS = 5;
const ISOLATION_MIN_SETS = 2;
const ISOLATION_MAX_SETS = 3;
// Recovery-aware floor for a NON-recovered group (M1 "make it bite"). The
// weekly budget is already cut upstream (partial ×0.80, fatigued ×0.60 in
// applyRecoveryToVolumeBudget); but the normal compound floor (3) absorbs that
// cut on a high-frequency day, so a fatigued group can look identical to a
// fresh one. When ctx.recoveryState marks a group partial/fatigued we LOWER its
// compound floor to this value so the SAME already-cut budget reaches the
// visible session (compound allowed down to 2). This is NOT an extra penalty —
// it only lets the existing cut express itself. Never below 2 (a non-recovered
// muscle gets a light touch, never zeroed). Isolation already floors at 2.
const NONRECOVERED_COMPOUND_MIN_SETS = 2;
// dp_tier_compound_floor_v1 — the FRESH (recovered) compound floor for a T0 NOVICE.
// 2 sets/exercise is genuinely effective (MEV) and keeps a beginner's recovery
// manageable; a TRAINED lifter (T1/T2) keeps the universal COMPOUND_MIN_SETS (3)
// so their fresh compounds are never stranded at 2. Only used when the flag is on
// AND the group is recovered AND the user is a beginner → flag OFF / trained →
// COMPOUND_MIN_SETS (byte-identical).
const NOVICE_COMPOUND_MIN_SETS = 2;
// Typical weekly frequency a muscle group is trained — the periodization
// volume target is sets/WEEK, but buildSession plans ONE session, so the
// weekly target is divided across the sessions that hit the group. Used as a
// LAST-RESORT fallback only when ctx.weeklySessionsPerGroup has no real
// frequency for the group (NOT a blind constant divisor any more — BUG 1).
const WEEKLY_FREQUENCY = 2;
// A library tier-1 entry IS the compound anchor of its group (force_demand:high,
// big movement). Used by the set distribution to weight the anchor higher.
const COMPOUND_TIER = 1;
// #72 emphasis specialization (dp_emphasis_specialization_v1) — when a group is
// EMPHASIZED (the user's look choice) AND its weekly budget has risen toward MAV
// upstream (applyWeaknessAmplification → MRV-half, with non-focus held at MEV via
// applyEmphasisDeEmphasis), the per-exercise compound clamp [3,5] previously
// CAPPED the extra volume at 5 so the emphasized lift looked identical to balanced
// (DIAG #2). Raising the compound ceiling for an emphasized group lets the already-
// raised weekly budget actually REACH the per-exercise set count (the +2-6 sets/wk
// specialization quantum, policy §3) — bounded by MRV upstream + this hard ceiling
// so it never blows out. Flag OFF → the emphasis ceiling is never used → the
// [3,5] clamp is byte-identical to today.
const COMPOUND_MAX_SETS_EMPHASIZED = 6;
// The emphasized COMPOUND floor — raised from COMPOUND_MIN_SETS (3) to 4 so the
// emphasized anchor lift VISIBLY carries more working sets than a balanced one.
// DIAG #2: emphasis added slots + front-position but the per-exercise set count
// stayed at the balanced 3, because the round-robin gives an emphasized group MANY
// slots so the raised weekly budget spreads thin instead of concentrating into the
// visible set number. Lifting the floor delivers the +sets the user expects on the
// focus compound (the +2-6/wk specialization quantum, policy §3), kept bounded by
// COMPOUND_MAX_SETS_EMPHASIZED + the MRV cap + the MEV-hold-on-others coupling
// upstream. NOT applied to a NON-RECOVERED emphasized group (the recovery floor
// wins — never force volume onto a fatigued muscle). Flag OFF → never used.
const COMPOUND_MIN_SETS_EMPHASIZED = 4;
// #70-D3 emphasized ISOLATION ceiling (dp_emphasis_specialization_v1). The
// COMPOUND-band raise above does nothing for a SMALL group that has NO compound
// in the library (biceps / triceps are isolation-only — curls, pushdowns,
// extensions). So an `arms` focus raised the weekly budget toward MAV upstream
// but the per-exercise ISOLATION clamp [2,3] capped each arm lift at 3 → biceps
// stalled ~6/wk on a 2×/wk split, below the 7-12 gold band (DIAG D3). For an
// emphasized + RECOVERED group whose weekly target still has room to grow toward
// MAV, the isolation ceiling rises to ISOLATION_MAX_SETS_EMPHASIZED so the direct
// arm work reaches the band (the +2-6 sets specialization quantum, policy §3),
// bounded by MAV upstream + this hard ceiling. Flag OFF / not emphasized → the
// [2,3] clamp is byte-identical.
const ISOLATION_MAX_SETS_EMPHASIZED = 5;

/**
 * Per-session set budget for one Big-11 group — the weekly volume target split
 * across the sessions that actually train the group this week.
 *
 * `realFreq` comes from ctx.weeklySessionsPerGroup[group] (the real sessions/week
 * the frequency template assigns); only when that is absent/invalid do we fall
 * back to WEEKLY_FREQUENCY (a sane last resort, NOT a blind constant divisor —
 * BUG 1 fix). Returns null when no usable weekly volume signal exists for the
 * group, so callers keep the stable DEFAULT_SETS per exercise.
 *
 * @param {string} big11RoGroup - exercise muscle_target_primary (Big-11 RO)
 * @param {Record<string, number>|null|undefined} volumeTargets - Big-11 EN -> sets/week
 * @param {Record<string, number>|null|undefined} weeklySessionsPerGroup - Big-11 RO -> sessions/week
 * @returns {number|null} per-session set budget for the group, or null when unknown
 */
function sessionSetBudget(big11RoGroup, volumeTargets, weeklySessionsPerGroup) {
  if (!volumeTargets || typeof volumeTargets !== 'object') return null;
  const enKey = BIG11_RO_TO_EN_MAP[big11RoGroup] ?? big11RoGroup;
  const weekly = volumeTargets[enKey];
  if (typeof weekly !== 'number' || !Number.isFinite(weekly) || weekly <= 0) {
    return null;
  }
  const rawFreq =
    weeklySessionsPerGroup && typeof weeklySessionsPerGroup === 'object'
      ? weeklySessionsPerGroup[big11RoGroup]
      : undefined;
  const realFreq =
    typeof rawFreq === 'number' && Number.isFinite(rawFreq) && rawFreq > 0
      ? rawFreq
      : WEEKLY_FREQUENCY;
  return weekly / realFreq;
}

/**
 * #71 COHERENT WEEKLY ALLOCATION (dp_coherent_weekly_alloc_v1) — derive a per-day
 * group budget that makes the per-EXERCISE set count CONSISTENT day-to-day.
 *
 * DIAG #3: today the per-session budget (weekly/freq) is split across HOWEVER MANY
 * exercises that day's cluster gave the group, so the SAME lift swings (Lat Pulldown
 * 3 on Pull where back gets 4 slots, 4-5 on Upper where back gets 2 slots) — each
 * day composes independently with no cross-day per-exercise reconciliation, and the
 * catch-all overlap "Upper" day balloons because it concentrates the whole per-day
 * budget onto its few slots.
 *
 * Fix: pin a STABLE per-exercise dose for the group, independent of how many slots a
 * given day landed. The dose = (weekly/freq) / expectedExercisesPerSession, where
 * expectedExercisesPerSession = round((weekly/freq) / SETS_PER_EXERCISE) — the SAME
 * sizing computeSessionExerciseCount uses, so it agrees with the slot demand. The
 * coherent day-budget is dose × actualExercisesThisDay, so each exercise lands at
 * ~dose regardless of the day's slot count.
 *
 * DE-BALLOON-ONLY (safe direction): we return min(weekly/freq, dose × actualEx) —
 * i.e. we only ever LOWER the day's budget, never raise it. When a day gave the
 * group FEWER slots than expected (the catch-all overlap "Upper" balloon + the HIGH
 * side of the same-lift swing), actualEx < expectedEx → dose×actualEx < weekly/freq,
 * so the budget shrinks and the per-exercise sets stop ballooning. When a day gave
 * AT-LEAST the expected slots (the well-behaved case), min() keeps the legacy
 * weekly/freq budget → those sessions are unchanged. This kills the 3↔5 swing's high
 * end + the balloon WITHOUT inflating any other day (which would change well-behaved
 * sessions + the prescribed-kg downstream). Returns null when there is no usable
 * per-session budget (caller keeps the legacy weekly/freq path).
 *
 * @param {number|null} perSessionBudget - sessionSetBudget(group) = weekly/freq
 * @param {number} actualExCount - exercises of this group placed THIS session
 * @returns {number|null} coherent per-day group budget, or null when unusable
 */
function coherentDayBudget(perSessionBudget, actualExCount) {
  if (typeof perSessionBudget !== 'number' || !Number.isFinite(perSessionBudget) || perSessionBudget <= 0) {
    return null;
  }
  if (!Number.isFinite(actualExCount) || actualExCount <= 0) return null;
  const expectedEx = Math.max(1, Math.round(perSessionBudget / SETS_PER_EXERCISE));
  const perExerciseDose = perSessionBudget / expectedEx;
  // De-balloon only — never raise above the legacy weekly/freq budget.
  return Math.min(perSessionBudget, perExerciseDose * actualExCount);
}

/**
 * Compound-anchored set distribution for the exercises of ONE group in a session.
 *
 * The OLD rule divided the budget EVENLY across the group's exercises, so a
 * many-exercise group (compounds + isolation) starved each lift toward MIN_SETS
 * while a single-exercise accessory group (one calf / one ab move) collected the
 * whole budget and clamped to 5 — accessories out-volumed compounds (BUG 1).
 *
 * New rule: the group's per-session budget is distributed with the PRIMARY
 * COMPOUND (tier 1) weighted higher than ISOLATION (tier 2/3). Compounds clamp
 * to [COMPOUND_MIN_SETS, COMPOUND_MAX_SETS], isolation to [ISOLATION_MIN_SETS,
 * ISOLATION_MAX_SETS]. Because a compound's floor (3) >= an isolation's ceiling
 * (3), a compound never carries fewer working sets than an isolation of the same
 * group. A tiny single-exercise accessory group (calves/core/forearms — no
 * compound) lands in the isolation band (~2-3), so you never get 5 sets of
 * tibialis. Total stays roughly aligned with the budget (anti-MRV blowout).
 *
 * When `state` is 'partial' or 'fatigued' (M1 "make it bite"), two things change
 * so the already-cut weekly budget (partial ×0.80 / fatigued ×0.60, applied
 * upstream) becomes VISIBLE on the day instead of being absorbed by the normal
 * floors: (1) the compound floor drops to NONRECOVERED_COMPOUND_MIN_SETS, and
 * (2) each exercise loses ~1 set (the "~1 fewer set than normal" the spec asks
 * for) BEFORE clamping. This is NOT a stacked extra penalty — it is the single
 * visible expression of the recovery state: an exercise already at its floor
 * stays at the floor (never cut into nothing), while one above the floor visibly
 * trains lighter. 'recovered' (and absent state) → unchanged floors, no
 * decrement (the common, no-regression path — most days).
 *
 * F6a #20 — the optional `fatigueAdjustFn` (name → -1|0|+1) is the per-set
 * fatigue-curve dose (dp_fatigue_curve_v1, default OFF → caller passes null →
 * adjust 0 → byte-identical). A learned MAINTAINER earns +1 working set, a CRASHER
 * loses 1, applied to that exercise's set count BEFORE the SAME [floor, ceiling]
 * clamp the recovery path already enforces — so +1 never exceeds the band's high
 * and -1 never drops below its low (≥ the ≥1-working-set floor the bands carry).
 *
 * #72 emphasis (dp_emphasis_specialization_v1) — when `emphasized` is true the
 * group's COMPOUND ceiling rises to COMPOUND_MAX_SETS_EMPHASIZED (6), and the
 * ANCHOR compound (first/highest-priority compound only) floors at
 * COMPOUND_MIN_SETS_EMPHASIZED (4) so the headline focus lift VISIBLY carries more
 * sets than balanced (DIAG #2: the round-robin gave the focus group MANY slots, so
 * the raised weekly budget spread thin instead of concentrating into the visible
 * set count). The raised FLOOR is ANCHOR-ONLY (not every compound) so a group that
 * already earns many weekly slots is not multiplied past its weekly budget (policy
 * §3 coupling), and only on a RECOVERED group (a non-recovered emphasized group
 * keeps the recovery floor — never force volume onto a fatigued muscle). Default
 * false → [3,5] byte-identical.
 *
 * TIER-AWARE FRESH COMPOUND FLOOR (dp_tier_compound_floor_v1) — `novice` true means
 * the user is a T0 beginner AND the flag is on: a FRESH (recovered) compound's floor
 * is allowed to sit at NOVICE_COMPOUND_MIN_SETS (2) instead of the universal
 * COMPOUND_MIN_SETS (3). Science: 2 sets/exercise is genuinely effective (MEV,
 * manageable recovery for a beginner); 3 is better for a TRAINED lifter (so a
 * trained lifter's fresh compound is never stranded below 3 — the universal default
 * already gives them 3). Default false → the fresh compound floor stays 3 for
 * everyone → byte-identical. The recovery (non-recovered → 2) + emphasis-anchor
 * floors are UNCHANGED in both modes.
 *
 * @param {Array<{name?: string, tier: number}>} exsInGroup - chosen exercises of this group (with tier)
 * @param {number|null} budget - per-session set budget for the group (sessionSetBudget)
 * @param {'recovered'|'partial'|'fatigued'} [state] - this group's recovery state
 * @param {((name: string) => number)|null} [fatigueAdjustFn] - F6a #20 per-exercise sets adjust (-1|0|+1); null/absent → 0
 * @param {boolean} [emphasized] - #72: this group is emphasized → raise the compound ceiling
 * @param {((name: string) => number)|null} [trimFn] - #19 effective-reps trim (≤0)
 * @param {boolean} [novice] - dp_tier_compound_floor_v1: T0 beginner → fresh compound floor may drop to 2
 * @returns {number[]} set count per exercise, index-aligned with exsInGroup
 */
function distributeGroupSets(exsInGroup, budget, state, fatigueAdjustFn, emphasized, trimFn, novice, anchorProtect) {
  const n = exsInGroup.length;
  if (n === 0) return [];
  // #19 V3 DOSE — the effective-reps TRIM is combined with the fatigue-curve adjust
  // into the SAME per-exercise integer adjust. The trim is clamped ≤0 (trim-only;
  // it can never ADD a set), so the worst it does is offset a maintainer's +1 — a
  // grinder who also has a flat curve nets 0, which is correct (their stimulus is
  // already dense). Both flags OFF → both fns null → adjust 0 → byte-identical.
  const trimOf = (e) =>
    typeof trimFn === 'function' && typeof e.name === 'string'
      ? Math.min(0, Number(trimFn(e.name)) || 0)
      : 0;
  const adjustOf = (e) => {
    const base =
      typeof fatigueAdjustFn === 'function' && typeof e.name === 'string'
        ? (Number(fatigueAdjustFn(e.name)) || 0)
        : 0;
    return base + trimOf(e);
  };
  // No volume signal → every exercise keeps the stable default (no-op path).
  // F6a #20 still applies the learned adjust here, clamped so a maintainer's +1
  // never exceeds the band ceiling and a crasher's -1 never drops below ≥1 set.
  if (budget == null) {
    return exsInGroup.map((e) => Math.min(COMPOUND_MAX_SETS, Math.max(1, DEFAULT_SETS + adjustOf(e))));
  }

  // Weight compounds higher than isolation so the anchor earns the volume.
  const COMPOUND_WEIGHT = 2;
  const ISOLATION_WEIGHT = 1;
  const weightOf = (e) => (e.tier === COMPOUND_TIER ? COMPOUND_WEIGHT : ISOLATION_WEIGHT);
  const totalWeight = exsInGroup.reduce((s, e) => s + weightOf(e), 0);

  // A non-recovered group: lower the compound floor (so the cut can reach below
  // the usual 3) AND shave one set per exercise (the visible "lighter today").
  const nonRecovered = state === 'partial' || state === 'fatigued';
  // dp_tier_compound_floor_v1 — a FRESH (recovered) compound for a T0 NOVICE may
  // floor at NOVICE_COMPOUND_MIN_SETS (2, MEV) instead of the universal 3; a TRAINED
  // lifter keeps 3. Inert (3) for a non-recovered group (the recovery floor wins) or
  // when the flag is off (novice false) → byte-identical.
  const freshCompoundFloor = novice ? NOVICE_COMPOUND_MIN_SETS : COMPOUND_MIN_SETS;
  const compoundFloor = nonRecovered ? NONRECOVERED_COMPOUND_MIN_SETS : freshCompoundFloor;
  const setShave = nonRecovered ? 1 : 0;
  // #72 — an emphasized + RECOVERED group raises its compound band: the ceiling
  // rises (so a high budget can reach 6), and the ANCHOR (first/highest-priority
  // compound only) earns the raised FLOOR so it visibly carries more sets — applied
  // to the anchor alone, NOT every compound, so a group that already gets many
  // weekly slots is not multiplied past its weekly budget (policy §3 coupling).
  const emphasizeRecovered = emphasized && !nonRecovered;
  const compoundCeiling = emphasized ? COMPOUND_MAX_SETS_EMPHASIZED : COMPOUND_MAX_SETS;
  const anchorIdx = emphasizeRecovered ? exsInGroup.findIndex((e) => e.tier === COMPOUND_TIER) : -1;
  // #70-D3 — an emphasized RECOVERED group raises its ISOLATION ceiling too, so a
  // SMALL isolation-only group (biceps/triceps — no compound in the library) can
  // reach the band on its direct arm work instead of being capped at 3 sets/lift.
  // The compound-band raise above is inert for these groups (no tier-1 anchor);
  // this is the lever that delivers the arms-emphasis +sets. Non-emphasized /
  // non-recovered → the normal [2,3] band (byte-identical).
  const isolationCeiling = emphasizeRecovered ? ISOLATION_MAX_SETS_EMPHASIZED : ISOLATION_MAX_SETS;

  // R4 anchor-protective shave (dp_anchor_sets_v1 via ctx.anchorProtect, Daniel
  // coach audit 2026-06-10): on a NON-RECOVERED group the 1-set shave + lowered
  // floor exempt the ANCHOR (first tier-1 compound) — the main lift keeps its
  // fresh 3-set floor and the lighter day is carried by the accessories (the
  // anchor's spared set is re-shaved from the BACK of the group so the group
  // total is preserved). OFF / recovered → protectIdx -1 → byte-identical.
  const protectIdx = anchorProtect === true && nonRecovered
    ? exsInGroup.findIndex((e) => e.tier === COMPOUND_TIER)
    : -1;
  const counts = exsInGroup.map((e, i) => {
    const isCompound = e.tier === COMPOUND_TIER;
    const share = (budget * weightOf(e)) / totalWeight;
    const isProtected = i === protectIdx;
    const rounded = Math.round(share) - (isProtected ? 0 : setShave) + adjustOf(e);
    // Anchor compound of an emphasized recovered group floors higher (visible +sets).
    const cFloor = i === anchorIdx ? COMPOUND_MIN_SETS_EMPHASIZED
      : isProtected ? freshCompoundFloor : compoundFloor;
    const lo = isCompound ? cFloor : ISOLATION_MIN_SETS;
    const hi = isCompound ? compoundCeiling : isolationCeiling;
    return Math.min(hi, Math.max(lo, rounded));
  });
  if (protectIdx >= 0) {
    // Re-shave the protected set from the back of the group (last isolation above
    // its floor), keeping the group's total equal to the unprotected world.
    let spare = counts[protectIdx]
      - Math.min(exsInGroup[protectIdx].tier === COMPOUND_TIER ? compoundCeiling : isolationCeiling,
          Math.max(compoundFloor, Math.round((budget * weightOf(exsInGroup[protectIdx])) / totalWeight) - setShave + adjustOf(exsInGroup[protectIdx])));
    for (let i = exsInGroup.length - 1; i >= 0 && spare > 0; i--) {
      if (i === protectIdx) continue;
      // Pull from the back, down to each exercise's own floor — a non-anchor
      // compound may yield to compoundFloor before an isolation drops to MEV.
      const floorI = exsInGroup[i].tier === COMPOUND_TIER ? compoundFloor : ISOLATION_MIN_SETS;
      while (spare > 0 && counts[i] > floorI) { counts[i] -= 1; spare -= 1; }
    }
  }
  return counts;
}

/**
 * Session exercise count derived from the weekly volume budget — replaces the
 * old fixed SESSION_SIZE=6. For each Big-11 group the cluster trains:
 *
 *   sets_this_session  = weeklySets(group) / sessionsTrainingThatGroupThisWeek
 *   exercises_for_grp  = round( sets_this_session / SETS_PER_EXERCISE )
 *   count              = Σ exercises_for_grp over the cluster's groups
 *
 * Clamped to [minSession, SESSION_SIZE] (minSession is tier-aware:
 * minSessionForTier — T0 floors at 4, trained tiers at 5). When no volume signal
 * is present (empty user / absent volumeTargets / unknown sessions-per-group) we
 * keep the legacy DEFAULT_SESSION_SIZE so cold-start callers stay stable.
 *
 * `weeklySets(group)` is volumeTargets[EN-key] (periodization sets/week, EN
 * keyed — same RO→EN bridge sessionSetBudget uses). `sessionsTrainingThatGroup`
 * comes from ctx.weeklySessionsPerGroup (Big-11 RO keyed) computed by the
 * adapter from the frequency template — buildSession stays pure (no globals).
 *
 * @param {string[]} groups - the cluster's Big-11 RO target groups
 * @param {Record<string, number>|null|undefined} volumeTargets - Big-11 EN -> sets/week
 * @param {Record<string, number>|null|undefined} weeklySessionsPerGroup - Big-11 RO -> sessions/week
 * @param {number} minSession - tier-aware substance floor (minSessionForTier)
 * @returns {number} session exercise count in [minSession, SESSION_SIZE]
 */
function computeSessionExerciseCount(groups, volumeTargets, weeklySessionsPerGroup, minSession) {
  if (!volumeTargets || typeof volumeTargets !== 'object') return DEFAULT_SESSION_SIZE;
  let total = 0;
  let sawSignal = false;
  for (const roGroup of groups) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const weekly = volumeTargets[enKey];
    if (typeof weekly !== 'number' || !Number.isFinite(weekly) || weekly <= 0) continue;
    const sessionsForGroup =
      weeklySessionsPerGroup && typeof weeklySessionsPerGroup === 'object'
        ? weeklySessionsPerGroup[roGroup]
        : undefined;
    const freq =
      typeof sessionsForGroup === 'number' && Number.isFinite(sessionsForGroup) && sessionsForGroup > 0
        ? sessionsForGroup
        : WEEKLY_FREQUENCY;
    const setsThisSession = weekly / freq;
    const exForGroup = Math.round(setsThisSession / SETS_PER_EXERCISE);
    if (exForGroup > 0) {
      total += exForGroup;
      sawSignal = true;
    }
  }
  if (!sawSignal) return DEFAULT_SESSION_SIZE;
  return Math.min(SESSION_SIZE, Math.max(minSession, total));
}

/**
 * Deterministic 32-bit hash of a string -> non-negative integer.
 * Used to seed selection so the same user+day produces the same picks
 * (critical for PR identity + user trust — no random fluctuation per render).
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Tier ceiling per profile tier. Beginner/T0 prefers T1 compound + simple T2;
 * advanced (T2+) unlocks T3 isolation/accessory. null -> conservative T2 cap.
 * @param {string|null|undefined} profileTier - 'T0' | 'T1' | 'T2' | null
 * @returns {number} highest library tier allowed
 */
function tierCeiling(profileTier) {
  switch (profileTier) {
    case 'T0': return 2; // beginner: compound + simple isolation, no accessories
    case 'T1': return 2;
    case 'T2': return 3; // advanced: allow T3 isolation/accessory
    default:   return 2; // unknown -> conservative
  }
}

// Numeric rank for movement skill (parallel to library `tier`). Higher = harder
// movement pattern. Used by skillCeiling + the poolForGroup skill gate.
const SKILL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

/**
 * Skill ceiling per profile tier — capability gate so a beginner is NEVER
 * prescribed an advanced movement (one-arm push-up, pistol, archer, etc.).
 * Mirrors the tier/experience semantics (tierForExperience: beginner→T0,
 * intermediate→T1, advanced→T2): T0 → beginner-only, T1 → up to intermediate,
 * T2+ → advanced allowed. null/unknown → conservative beginner-only.
 * @param {string|null|undefined} profileTier - 'T0' | 'T1' | 'T2' | null
 * @returns {number} highest SKILL_RANK allowed
 */
function skillCeiling(profileTier) {
  switch (profileTier) {
    case 'T0': return SKILL_RANK.beginner;     // beginner: only beginner movements
    case 'T1': return SKILL_RANK.intermediate; // intermediate: up to intermediate
    case 'T2': return SKILL_RANK.advanced;     // advanced: all skill levels
    default:   return SKILL_RANK.beginner;     // unknown -> conservative beginner-only
  }
}

/**
 * Movement skill rank for a library entry. Missing skill_level defaults to
 * beginner (safe: offer rather than wrongly exclude a basic move).
 * @param {{skill_level?: string}} meta
 * @returns {number}
 */
function skillRankOf(meta) {
  const lvl = meta?.skill_level;
  return (lvl != null && lvl in SKILL_RANK)
    ? /** @type {Record<string, number>} */ (SKILL_RANK)[lvl]
    : SKILL_RANK.beginner;
}

/**
 * Whether a library entry is selectable under the available equipment.
 * Coarse equipment_type must be available; bodyweight is always allowed.
 * @param {{equipment_type?: string}} meta
 * @param {Set<string>} available
 */
function equipmentOk(meta, available) {
  const type = meta?.equipment_type ?? '';
  if (type === ALWAYS_AVAILABLE_EQUIPMENT) return true;
  return available.has(type);
}

/**
 * Build the candidate pool for a muscle group under equipment + tier filters.
 * Returns library entries with muscle_target_primary === group, sorted
 * deterministically (anchors-with-PR first, then by a seeded order) so the
 * downstream pick is stable for a given seed.
 * @param {string} group - Big-11 canonical RO group
 * @param {Set<string>} available - coarse equipment types available
 * @param {number} maxTier - highest tier allowed
 * @param {number} maxSkill - highest SKILL_RANK allowed (capability gate)
 * @param {Set<string>} prNames - names that carry PR history (preferred anchors)
 * @param {number} seed
 * @param {Record<string, number>|null} [penalties] - #8/D per-exercise pain/skip
 *   penalty (engineName → 0..1); a penalized NON-PR exercise is demoted to the
 *   back of the pool so a same-muscle sibling leads. Null/empty → no reorder
 *   (byte-identical). Never DROPS an entry (anti-paternalism + last-option safety).
 * @param {Record<string, string>|null} [painSwaps] - #64 PERSISTENT pain memory
 *   proactive swap (engineName → curated substitute). When a PINNED painful
 *   exercise is in THIS group's pool AND its substitute belongs to the same group
 *   + passes the equipment/tier/skill gates AND the painful exercise is NOT the
 *   last option for the muscle, the pinned entry is REPLACED in-place by the
 *   substitute (held until the pin is cleared). Otherwise the pinned exercise is
 *   left untouched (the penalty demote still applies). Null/empty → no swap
 *   (byte-identical). Never DROPS the muscle's last option (anti-paternalism).
 * @param {{tokens: Set<string>, pressAllow: ReadonlyArray<string>}|null} [excludedMovements]
 *   #81 HARD contraindication/refusal exclusion (movementExclusion.buildExclusionTokens).
 *   A candidate whose movementKey token is in `tokens` (with the landmine/neutral
 *   shoulder-press carve-out) is REMOVED from the pool entirely — a same-muscle safe
 *   sibling (already in-pool) then leads — UNLESS it would empty the muscle (the
 *   last-option guard keeps a non-empty leg day). Null/empty → no removal
 *   (byte-identical). Unlike the penalty DEMOTE this is a hard REMOVE (safety).
 * @param {boolean} [danielTierSelect] - dp_daniel_tier_select_v1. When true the
 *   pool ordering uses Daniel's expert SELECTION band (tierRankOf) as the PRIMARY
 *   quality key (S<A<B<C<UNRANKED), REPLACING the ANCHOR_NAMES/COMMON_MOVEMENTS/
 *   seeded band ordering — PR-history continuity stays band 0, the seeded hash stays
 *   the within-band tiebreak, and squat-primacy + all gates are intact. A D-band
 *   pick is HARD-EXCLUDED from the pool (like a contraindication) UNLESS removing it
 *   would empty the muscle (last-option guard). Default false → byte-identical.
 * @returns {Array<{name: string, meta: object}>}
 */
export function poolForGroup(group, available, maxTier, maxSkill, prNames, seed, penalties, painSwaps, excludedMovements, danielTierSelect) {
  // ACTIVE visibility gate (Daniel SSOT 2026-06-05, supersedes 2026-06-03 CORE+
  // FALLBACK gate): auto-selection draws ONLY from the curated ACTIVE catalog
  // (CORE_AUTO — see isActiveMeta / ACTIVE_STATUSES) plus PR-history continuity.
  // The untagged long-tail, MANUAL_ADVANCED, DEPRECATED, ALIAS, MODIFIER AND the
  // single FALLBACK entry are ALL hidden (the FALLBACK band was investigated and
  // is NOT load-bearing — hamstrings carries 11 CORE_AUTO options). A group that
  // runs short simply redistributes its slots to other groups (no esoteric
  // variant ever surfaces over a common lift). Hidden exercises stay in the
  // library, just never auto-offered; widen ACTIVE_STATUSES (one place) to revert.
  const core = []; // ACTIVE (CORE_AUTO) + PR-history — the only auto pool now.
  for (const [name, meta] of Object.entries(EXERCISE_METADATA)) {
    if (meta.muscle_target_primary !== group) continue;
    if (meta.tier > maxTier) continue;
    if (skillRankOf(meta) > maxSkill) continue; // capability gate: never above skill ceiling
    if (!equipmentOk(meta, available)) continue;
    // PR continuity wins: an exercise the user has actually logged stays offered
    // regardless of status (don't yank a lift out from under an existing user).
    // dp_daniel_tier_select_v1 — when ON, ALSO admit Daniel's S/A picks that are
    // not (yet) CORE_AUTO (TIER_SELECTABLE_SA) so his top picks are reachable; this
    // replaces a static exercises.json status flip so flag-OFF stays byte-identical.
    if (
      isActiveMeta(meta) ||
      prNames.has(name) ||
      (danielTierSelect && TIER_SELECTABLE_SA.has(name))
    ) {
      core.push({ name, meta });
    }
  }

  // #64 PERSISTENT pain memory PROACTIVE SWAP — replace a PINNED painful exercise
  // in this group's pool with its persisted curated substitute, BEFORE ordering.
  // Bounded safety envelope: only when the substitute belongs to THIS group, passes
  // the equipment/tier/skill gates, is not already in the pool, and the painful
  // exercise is NOT the last option for the muscle (never drop a muscle's last
  // exercise — the same anti-ban guard the penalty path relies on). Otherwise the
  // pinned exercise is left in place (the penalty demote below still applies → it
  // degrades to today's behavior). Null/empty painSwaps → no swap (byte-identical).
  if (painSwaps) {
    for (let i = 0; i < core.length; i++) {
      const name = core[i].name;
      const sub = painSwaps[name];
      if (typeof sub !== 'string' || !sub) continue;
      if (core.length <= 1) break; // never drop the muscle's last option
      const subMeta = EXERCISE_METADATA[sub];
      if (!subMeta || subMeta.muscle_target_primary !== group) continue;
      if (subMeta.tier > maxTier) continue;
      if (skillRankOf(subMeta) > maxSkill) continue;
      if (!equipmentOk(subMeta, available)) continue;
      if (core.some((e) => e.name === sub)) {
        // The substitute is ALREADY offered for this group → the pinned exercise is
        // redundant; remove it so it can't be selected (the substitute covers the
        // muscle). Last-option guard above ensures the group is never emptied.
        core.splice(i, 1);
        i--;
      } else {
        // Replace the pinned entry in-place with its curated substitute.
        core[i] = { name: sub, meta: subMeta };
      }
    }
  }

  // #81 HARD movement EXCLUSION (contraindicated injury pattern / explicit refusal).
  // A candidate whose movement token is excluded is REMOVED from the pool (not just
  // demoted) so the safe same-muscle sibling already in `core` leads — UNLESS the
  // removal would empty the muscle (last-option guard: never an empty leg day).
  // SAFETY overrides PR continuity here: a disc patient who has logged RDL still must
  // not be handed RDL. The shoulder-press carve-out (landmine/neutral) is honored by
  // isExcludedMovement. Null/empty excl → the predicate is always false → no-op.
  if (excludedMovements && excludedMovements.tokens && excludedMovements.tokens.size > 0) {
    const kept = [];
    const dropped = [];
    for (const e of core) {
      const token = movementKey(e.name, e.meta).split('::')[1] ?? '';
      (isExcludedMovement(e.name, token, excludedMovements) ? dropped : kept).push(e);
    }
    // Only apply the removal when at least one SAFE option survives for the muscle —
    // otherwise keep the (contraindicated) pool rather than emit an empty group. The
    // round-robin in buildSession redistributes an empty group's slots elsewhere, so
    // when kept is empty leaving the originals is the conservative last-resort.
    if (kept.length > 0 && dropped.length > 0) {
      core.length = 0;
      core.push(...kept);
    }
  }

  // dp_daniel_tier_select_v1 — HARD-EXCLUDE Daniel's D-band picks (anti-pattern
  // blocklist: momentum / half-ROM / ego-load / joint-irritating) from the auto-
  // pool, the same hard-REMOVE shape as the #81 contraindication exclusion above.
  // A PR-history lift (the user actually logged it) is NEVER removed — continuity
  // wins (we don't yank a logged lift even if Daniel rates the variant D). Removal
  // is skipped when it would empty the muscle (last-option guard: never an empty
  // group). Flag OFF → no D read, no removal → byte-identical. Runs BEFORE ordering.
  if (danielTierSelect) {
    const kept = [];
    const dropped = [];
    for (const e of core) {
      (EXERCISE_TIER_RANK[e.name] === 'D' && !prNames.has(e.name) ? dropped : kept).push(e);
    }
    if (kept.length > 0 && dropped.length > 0) {
      core.length = 0;
      core.push(...kept);
    }
  }

  // Deterministic ordering: PR-anchored first (continuity), then SQUAT-PATTERN
  // primacy on the quads group, then plain anchors, then common, then the rest;
  // seeded-stable by name hash.
  //
  // SQUAT primacy (D-squat-lead 2026-06-06): the squat is the most systemic quad
  // pattern and must lead the leg day when fresh — but D104 tier-sort can't order
  // it ahead of the machine Leg Press because BOTH are tier-1, and Leg Press won
  // the quad anchor only because it sits in the legacy ANCHOR_NAMES (band 1) while
  // every squat pattern sits in COMMON (band 2). Founder live 2026-06-06: leg day
  // emitted Leg Press → RDL → squat (the squat landed 3rd, after a machine press +
  // a hinge). Here a quads squat pattern ranks ABOVE a non-squat quad anchor (the
  // Leg Press) so the squat becomes the quad anchor → leads the session. It stays
  // BELOW the user's own PR-history lift (band 0) so continuity is never broken.
  // Scoped to the quads group only (squatPrimacy is 0 for every other group), so
  // no other cluster's ordering moves. All squat variants are skill_level beginner
  // (Smith/Hack/Goblet/Belt — machine-guided), so a beginner gets a safe squat
  // lead; a free barbell squat is still skill-gated out for T0 in poolForGroup.
  // LEGACY ordering (flag OFF) — byte-identical to pre-Wave-1.1. PR continuity is an
  // absolute band-0, then squat-primacy, then the legacy ANCHOR/COMMON/seeded rank().
  const byRankSeed = (a, b) => {
    const aPr = prNames.has(a.name);
    const bPr = prNames.has(b.name);
    if (aPr !== bPr) return aPr ? -1 : 1;
    if (!aPr && !bPr) {
      const sa = squatPrimacy(a.name, a.meta);
      const sb = squatPrimacy(b.name, b.meta);
      if (sa !== sb) return sb - sa; // higher primacy first
    }
    const ra = rank(a.name, prNames);
    const rb = rank(b.name, prNames);
    if (ra !== rb) return ra - rb;
    return seededKey(a.name, seed) - seededKey(b.name, seed);
  };

  if (danielTierSelect) {
    // dp_daniel_tier_select_v1 — Wave 1.1 SCORE model. PR-history is NO LONGER an
    // absolute band-0 override: it is a BOUNDED bonus on top of Daniel's selection
    // band (tierSelectScore), so a logged mediocre lift can't beat a much-higher
    // unlogged one (logged-C 45 < unlogged-S 100; logged-A 90 ~ unlogged-S 100). The
    // PR-continuity SAFETY (a logged lift is never dropped) is preserved upstream by
    // the last-option guards (D-removal / exclusion) + the +10 log bonus keeping a
    // logged lift competitive — it just no longer trumps a far better unlogged pick.
    // Higher score first; squat-primacy (quads only) is a tiebreak above the seed.
    // PROGRESSION-CONTINUITY (Daniel live 2026-06-11): the +10 bonus can't lift a
    // logged-A progression over an unlogged-S sidegrade — the proper fix is a
    // progression-CONDITIONED bonus (backlog #42/#43), NOT a blanket raise (measured
    // to tank cohort convergence). Tracked there; this path stays the Wave-1.1 model.
    const scoreOf = (name) => tierSelectScore(name, { hasLog: prNames.has(name) });
    core.sort((a, b) => {
      const sa = squatPrimacy(a.name, a.meta);
      const sb = squatPrimacy(b.name, b.meta);
      if (sa !== sb) return sb - sa; // squat leads the quad anchor (quads only)
      const va = scoreOf(a.name);
      const vb = scoreOf(b.name);
      if (va !== vb) return vb - va; // higher score first
      return seededKey(a.name, seed) - seededKey(b.name, seed);
    });
    // BACK pattern coverage (Wave 1.1) — a spate session must PREFER a mix, not 3
    // vertical pulls. Once a pull pattern (vertical-pull / horizontal-row) is already
    // represented in the chosen-so-far order, additional same-pattern candidates take
    // a coverage PENALTY so an un-covered pattern's best option outranks a 3rd vertical
    // pull. Scoring bias only (greedy re-order of the existing pool), never a hard
    // block — so a back day with only vertical pulls still fills (last-option safety).
    if (group === 'spate') {
      reorderBackForCoverage(core, scoreOf, seed);
    }
  } else {
    core.sort(byRankSeed);
  }

  // #8/D pain/skip demotion: a penalized NON-PR exercise sinks to the back of the
  // pool (STABLE partition, relative order preserved) so a clean same-muscle
  // sibling leads. PR-history lifts (continuity) are NEVER demoted. Nothing is
  // dropped — the penalized exercise is still selectable if it is the only option
  // (the downstream slot-fill can still reach it). Empty/absent penalties → the
  // partition is a no-op (the predicate is always false) → byte-identical order.
  let ordered = core;
  if (penalties) {
    const PENALTY_DEMOTE = 0.5; // ≥ → demote (a single skip/mild pain stays in place)
    const clean = [];
    const demoted = [];
    for (const e of ordered) {
      const p = prNames.has(e.name) ? 0 : (penalties[e.name] ?? 0);
      (p >= PENALTY_DEMOTE ? demoted : clean).push(e);
    }
    ordered = clean.concat(demoted);
  }

  // SEX-BIAS CUT (Wave 1.1, Daniel 2026-06-09): exercise SELECTION quality must NOT
  // depend on the user's sex — Hip Thrust / Kickback / Abduction are valid for men,
  // Bench is valid for women. The old #73 MALE_RARE_LOWER reorder (demoting female-
  // common / male-rare lower accessories for a MALE user) is REMOVED here; sex now
  // lives ONLY in cold-start load seeding / strength + volume priors (coldStart
  // Guidelines / populationPrior), never in pick quality. sexBias is no longer
  // threaded into poolForGroup. Daniel's expert tier list (danielTierSelect) is the
  // sex-agnostic quality signal that supersedes it.
  return ordered;
}

/**
 * Squat-pattern primacy for the QUADS group only (D-squat-lead 2026-06-06). The
 * squat is the primary, most systemic quad compound and should lead the leg day
 * over the machine Leg Press / other quad accessories. Returns 1 for a tier-1
 * quads exercise whose movement pattern is a squat (movementKey ...::squat), else
 * 0 — so the ordering lever is inert for every other group and for non-squat /
 * non-compound quad lifts. Used ONLY as a tiebreak below PR continuity.
 *
 * @param {string} name - library exercise name
 * @param {{muscle_target_primary?: string, tier?: number}} meta
 * @returns {0|1} 1 = primary squat pattern on quads, 0 = everything else
 */
function squatPrimacy(name, meta) {
  if (meta?.muscle_target_primary !== 'picioare-quads') return 0;
  if (meta?.tier !== COMPOUND_TIER) return 0;
  return movementKey(name, meta) === 'picioare-quads::squat' ? 1 : 0;
}

// BACK pull-pattern classes (Wave 1.1 coverage bias). Uses the existing movementKey
// tokens: pulldown / pull-up / chin-up = a VERTICAL pull; row = a HORIZONTAL row.
// Everything else on the back (pullover lat-isolation, shrug traps, face-pull) is
// 'other' — it never triggers a coverage penalty (we only balance vertical-vs-row).
const BACK_VERTICAL_TOKENS = new Set(['pulldown', 'pull-up', 'chin-up']);
const BACK_ROW_TOKENS = new Set(['row']);
// Coverage penalty applied to a candidate whose pull pattern is ALREADY represented
// in the chosen-so-far set. Sized so an un-covered pattern's best option (even a B,
// 60) outranks an already-covered higher option (an S, 100, − penalty) when the
// uncovered side has a real candidate — i.e. it flips vertical-vs-row, not S-vs-C.
const BACK_COVERAGE_PENALTY = 45;

/**
 * Pull-pattern class of a back exercise: 'vertical' | 'row' | 'other'.
 * @param {string} name
 * @param {{muscle_target_primary?: string}} meta
 * @returns {'vertical'|'row'|'other'}
 */
function backPullPattern(name, meta) {
  const token = movementKey(name, meta).split('::')[1] ?? '';
  if (BACK_VERTICAL_TOKENS.has(token)) return 'vertical';
  if (BACK_ROW_TOKENS.has(token)) return 'row';
  return 'other';
}

/**
 * BACK pattern-coverage greedy re-order (Wave 1.1, dp_daniel_tier_select_v1). A back
 * session must PREFER a mix (≥1 vertical pull + ≥1 horizontal row), not 3 vertical
 * pulls. Greedy: repeatedly pick the highest EFFECTIVE-score candidate, where the
 * effective score subtracts BACK_COVERAGE_PENALTY when the candidate's pull pattern
 * (vertical / row) is ALREADY represented in what we've picked so far. So the first
 * vertical and the first row pay no penalty; a SECOND same-pattern candidate is
 * penalized, letting the un-covered pattern's best option leapfrog a 3rd vertical
 * pull. 'other' (pullover / shrug / face-pull) is never penalized. This is a scoring
 * BIAS (re-order), never a hard block — a vertical-only pool still fills in order.
 * Mutates `core` in place (the round-robin then picks from the front, naturally
 * alternating patterns). Deterministic: seed breaks score ties (same as the sort).
 *
 * @param {Array<{name: string, meta: object}>} core - tier-select-sorted back pool
 * @param {(name: string) => number} scoreOf - base selection score (band + log)
 * @param {number} seed
 */
function reorderBackForCoverage(core, scoreOf, seed) {
  if (core.length <= 1) return;
  const remaining = core.slice();
  const result = [];
  const covered = new Set(); // 'vertical' | 'row' already represented
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    let bestKey = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const e = remaining[i];
      const pattern = backPullPattern(e.name, e.meta);
      const penalty =
        (pattern === 'vertical' || pattern === 'row') && covered.has(pattern)
          ? BACK_COVERAGE_PENALTY
          : 0;
      const eff = scoreOf(e.name) - penalty;
      const key = seededKey(e.name, seed);
      if (eff > bestScore || (eff === bestScore && key < bestKey)) {
        bestScore = eff;
        bestKey = key;
        bestIdx = i;
      }
    }
    const [picked] = remaining.splice(bestIdx, 1);
    const pat = backPullPattern(picked.name, picked.meta);
    if (pat === 'vertical' || pat === 'row') covered.add(pat);
    result.push(picked);
  }
  core.length = 0;
  core.push(...result);
}

/**
 * Lower rank = more preferred. Bands (BUG 2 — commonness bias):
 *   0 = has PR history (continuity)   · 1 = known anchor
 *   2 = COMMON recognizable movement  · 3 = obscure / long-tail variant
 * Within a band the seeded hash tiebreaks (determinism preserved). The COMMON
 * band makes fills favor lifts a normal user knows; esoteric variants (rank 3)
 * surface only when nothing common is left for the group.
 */
function rank(name, prNames) {
  if (prNames.has(name)) return 0;
  if (ANCHOR_NAMES.has(name)) return 1;
  if (COMMON_MOVEMENTS.has(name)) return 2;
  return 3;
}

/** Seeded comparable key for a name (stable per seed, varied across seeds). */
function seededKey(name, seed) {
  return hashString(`${seed}:${name}`);
}

// BUG 5 fix — movement-pattern tokens. The library has NO explicit "movement
// family" field, so the same physical movement appears under many distinct names
// (e.g. "Cable Fly", "Pec Deck", "Incline DB Fly", "DB Fly" — all chest flyes).
// Deduping a session by EXACT NAME let two same-movement variants co-exist (the
// reported "chest fly twice" bug). We derive a coarse movement token from the
// name and treat (muscle_target_primary + token) as the movement identity.
//
// Order matters: the most specific token is matched first (e.g. "pulldown"/
// "pushdown" before the generic "pull"/"push", "leg curl" before "curl") so a Lat
// Pulldown is NOT collapsed with a Pull-up. Matching is WORD-BOUNDARY (not bare
// substring) so "row" does NOT falsely match inside "narrow" — that earlier bug
// mis-classified "Barbell Curl Narrow Grip" as a row. CONSERVATIVE by design: a
// name matching NO token gets a per-name unique key (falls back to exact-name
// dedup), so unrecognized movements are never wrongly collapsed.
// Each entry = [pattern, canonicalToken]. Distinct patterns that are the SAME
// physical movement share a canonical token so they collapse together (e.g.
// "pec deck", "pec", and "fly" are all the chest-fly movement). Listed
// most-specific-first so e.g. "leg curl" wins over the generic "curl", and
// "pec deck" / "rear delt" are resolved before the bare "deck"/"delt" never
// appear alone.
const MOVEMENT_TOKEN_DEFS = [
  ['pec deck', 'fly'], ['good morning', 'good-morning'], ['hip thrust', 'hip-thrust'],
  ['split squat', 'squat'], ['leg press', 'leg-press'], ['leg extension', 'leg-extension'],
  ['leg curl', 'leg-curl'], ['lateral raise', 'lateral-raise'], ['front raise', 'front-raise'],
  ['rear delt', 'rear-delt'], ['face pull', 'face-pull'], ['pulldown', 'pulldown'],
  ['pushdown', 'pushdown'], ['pullover', 'pullover'], ['pull-up', 'pull-up'],
  ['pullup', 'pull-up'], ['chin-up', 'chin-up'], ['chinup', 'chin-up'],
  ['deadlift', 'deadlift'], ['romanian', 'deadlift'], ['rdl', 'deadlift'],
  ['kickback', 'kickback'], ['skull', 'skull'], ['crunch', 'crunch'],
  ['shrug', 'shrug'], ['row', 'row'], ['lateral', 'lateral-raise'], ['squat', 'squat'],
  ['lunge', 'lunge'], ['calf', 'calf'], ['ohp', 'press'], ['press', 'press'], ['dip', 'dip'],
  ['fly', 'fly'], ['pec', 'fly'], ['hammer curl', 'hammer-curl'], ['curl', 'curl'],
  ['extension', 'extension'], ['raise', 'raise'], ['pull', 'pull'],
];

// Precompiled word-boundary matchers. \b is unreliable around hyphens (pull-up),
// so we anchor each pattern on a non-letter boundary (start/end or any char that
// is not a-z) on both sides. Patterns are already lowercased.
const MOVEMENT_TOKEN_RES = MOVEMENT_TOKEN_DEFS.map(([pattern, token]) => ({
  token,
  re: new RegExp(`(?:^|[^a-z])${pattern.replace(/[-]/g, '[-\\s]')}(?:$|[^a-z])`),
}));

/**
 * Coarse movement-pattern key for an exercise: muscle_target_primary + the first
 * matching movement token in the name (word-boundary match, most-specific first).
 * Two entries sharing this key are treated as the SAME movement for in-session
 * dedup.
 *
 * Names with no recognized token fall back to a name-unique key (`<group>::<name>`)
 * so they remain distinct — conservative: never collapse what we can't classify.
 *
 * @param {string} name - engine/library exercise name
 * @param {{muscle_target_primary?: string}} meta
 * @returns {string}
 */
export function movementKey(name, meta) {
  const group = meta?.muscle_target_primary ?? 'unknown';
  const lower = String(name).toLowerCase();
  for (const { token, re } of MOVEMENT_TOKEN_RES) {
    if (re.test(lower)) {
      // Press angle is a distinct stimulus: incline/decline presses must NOT
      // collapse with the flat press, so a PUSH day can still pair flat+incline
      // (audit HG-01). Scoped to the press token, so an "incline curl" still
      // keys as a curl, not a press.
      if (token === 'press' && /(?:^|[^a-z])(incline|decline)(?:$|[^a-z])/.test(lower)) {
        return `${group}::${lower.includes('decline') ? 'decline' : 'incline'}-press`;
      }
      return `${group}::${token}`;
    }
  }
  return `${group}::name:${lower}`;
}

/**
 * Build a session exercise list for the given session type.
 *
 * Pulls candidates from the 657-entry library by muscle group, filters by
 * available coarse equipment + tier (persona), and selects ~SESSION_SIZE
 * exercises: 1-2 T1 compound on the primary group + T2/T3 isolation across the
 * remaining groups. Selection is deterministic (seeded on ctx.seed) and anchors
 * on PR-carrying / known names for continuity.
 *
 * When ctx.weakGroups is non-empty (Specialization engine target), the weak
 * group is filled FIRST (more exercises = more volume) and its exercises are
 * reordered to positions 1-2. Per-exercise set counts come from
 * ctx.volumeTargets (periodization sets/week), falling back to DEFAULT_SETS.
 *
 * @param {string} cluster - Big-6 cluster id: 'push'|'pull'|'legs'|'upper'|'lower'|'full'
 * @param {{
 *   equipment?: { available?: string[] },
 *   weakGroups?: string[],
 *   profileTier?: string|null,
 *   prNames?: string[],
 *   seed?: string,
 *   volumeTargets?: Record<string, number>,
 *   weeklySessionsPerGroup?: Record<string, number>,
 *   recoveryState?: Record<string, 'recovered'|'partial'|'fatigued'>,
 *   emphasizedGroups?: string[],
 *   exercisePenalties?: Record<string, number>|null,
 *   painSwaps?: Record<string, string>|null,
 *   excludedMovements?: {tokens: Set<string>, pressAllow: ReadonlyArray<string>}|null,
 *   fatigueSetsAdjust?: ((name: string) => number)|null,
 *   effectiveRepsSetsTrim?: ((name: string) => number)|null,
 *   emphasisSetsBoost?: boolean,
 *   coherentAlloc?: boolean,
 *   tierCompoundFloor?: boolean,
 *   lateralRaiseGuarantee?: boolean,
 *   danielTierSelect?: boolean,
 *   focusPolicy?: boolean,
 *   focusId?: string,
 *   daysPerWeek?: number,
 * } | null | undefined} ctx
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
 *
 * #72 (ctx.emphasisSetsBoost, dp_emphasis_specialization_v1) — an emphasized group's
 * per-exercise compound ceiling rises so its raised weekly budget reaches the visible
 * sets. #71 (ctx.coherentAlloc, dp_coherent_weekly_alloc_v1) — each group's per-day
 * budget is derived from a STABLE per-exercise dose so the same lift no longer swings
 * across days. Both default OFF (absent → byte-identical to today).
 */
export function buildSession(cluster, ctx) {
  const targets = clusterGroupsOrdered(cluster);
  // Tier-aware substance floor: a trained lifter (T1/T2+) never lands below 5
  // exercises; T0 keeps the base floor of 4. Threaded into both the count clamp
  // and the post-drop floor guard so the fatigued exercise-drop can't breach it.
  const minSession = minSessionForTier(ctx?.profileTier);
  // Per-session exercise budget — from the weekly volume budget (not a fixed 6).
  const sessionSize = computeSessionExerciseCount(
    targets, ctx?.volumeTargets, ctx?.weeklySessionsPerGroup, minSession,
  );
  const available = new Set(ctx?.equipment?.available ?? []);
  const maxTier = tierCeiling(ctx?.profileTier);
  const maxSkill = skillCeiling(ctx?.profileTier);
  const prNames = new Set(ctx?.prNames ?? []);
  const seed = hashString(String(ctx?.seed ?? ''));
  // #8/D per-exercise pain/skip penalties (engineName → 0..1). Null/empty (the
  // common case + flag off) → poolForGroup order is byte-identical.
  const penalties = ctx?.exercisePenalties ?? null;
  // #64 PERSISTENT pain memory proactive swap (engineName → substitute). Null/empty
  // (the common case + flag off) → poolForGroup makes no swap → byte-identical.
  const painSwaps = ctx?.painSwaps ?? null;
  // #81 HARD contraindication/refusal exclusion descriptor ({tokens, pressAllow}).
  // Built by movementExclusion.buildExclusionTokens from the injury signal + the
  // persisted refusal list. Null / empty tokens (no injury + no refusal — the common
  // case) → poolForGroup removes nothing → byte-identical pool.
  const excludedMovements = ctx?.excludedMovements ?? null;
  // dp_daniel_tier_select_v1 — when true, poolForGroup orders by Daniel's expert
  // SELECTION band (tierRankOf) as the primary quality key + hard-excludes D-band
  // anti-patterns. Default absent (flag OFF / pure-fn callers) → false → the legacy
  // anchor/common/seeded ordering, no D removal → byte-identical pool.
  const danielTierSelect = ctx?.danielTierSelect === true;

  // Pools per target group (ordered: PR-anchored -> anchor -> new, seeded-stable).
  const pools = targets.map((g) => ({
    group: g,
    pool: poolForGroup(g, available, maxTier, maxSkill, prNames, seed, penalties, painSwaps, excludedMovements, danielTierSelect),
  }));

  // Focus EMPHASIS (D-focus-visible 2026-06-05) — the Big-11 RO groups the user's
  // chosen LOOK preset raises (arms→biceps/triceps/umeri, chest→piept/triceps, …).
  // Treated like a weak group for SURFACING (extra slot + front-of-session) so the
  // emphasis produces a VISIBLY different exercise list than balanced, not just a
  // higher weekly number that the SESSION_SIZE clamp + cluster-weight slot caps
  // absorb (the root cause of "arms/chest look identical to balanced"). Distinct
  // from weakGroups: emphasis is the user's explicit intent, weakGroups is
  // auto-detected lagging — but both deserve more visible volume, so they share
  // the surfacing levers. Empty (balanced) → byte-identical to pre-feature.
  const emphSet = new Set(
    (ctx?.emphasizedGroups ?? []).filter((g) => targets.includes(g)),
  );
  // Surfacing set = weak (auto) ∪ emphasized (user intent). Used for the slot-cap
  // exemption + the extra-slot budget so an emphasized group this cluster trains
  // wins more exercises even when the cluster-weight cap would otherwise hold it.
  const surfaceSet = new Set([...(ctx?.weakGroups ?? []), ...emphSet]);

  // Weakness bias: when the Specialization engine flags a weak Big-11 group
  // that this session trains, fill that group FIRST in the round-robin so it
  // wins the limited SESSION_SIZE slots = MORE exercises (more volume) on the
  // weak group. weakGroups arrive as Big-11 RO (specialization target), the
  // same vocabulary as the pool group keys (WP-3 bridge) so they match directly.
  // Emphasized groups (focus) share this front-fill for the same reason — both
  // live in surfaceSet (weak ∪ emphasized), which also drives the cap exemption.
  if (surfaceSet.size > 0) {
    pools.sort((a, b) => (surfaceSet.has(b.group) ? 1 : 0) - (surfaceSet.has(a.group) ? 1 : 0));
  }

  // Weight-biased per-group slot cap: heavier-weight groups in the cluster earn
  // MORE of the session's slots (cluster weights from CLUSTER_BIG6_TO_BIG11_
  // WEIGHT). Each cap = ceil(weight × sessionSize), min 1 so no target group is
  // starved. Caps may sum above sessionSize (rounding up) — that is fine, the
  // total is bounded by sessionSize in the fill loop; the per-group cap only
  // shapes the DISTRIBUTION (e.g. push: piept gets more slots than triceps).
  const clusterWeights =
    CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster] || CLUSTER_BIG6_TO_BIG11_WEIGHT[FALLBACK_CLUSTER];
  const slotCap = {};
  for (const g of targets) {
    const w = typeof clusterWeights[g] === 'number' ? clusterWeights[g] : 0;
    slotCap[g] = Math.max(1, Math.ceil(w * sessionSize));
    // #70-D5 — BEGINNER per-group slot cap. A beginner (T0) on a high-frequency
    // split that trains a group on several days (e.g. back on UPPER + 2× PULL)
    // got 3 back exercises EACH day → 3 days × 3 ex × the 3-set compound floor =
    // ~26 weekly sets, advanced-peak territory the weekly-budget cap can't undo
    // (the per-exercise FLOOR overrides a small budget). Capping a beginner at
    // BEGINNER_MAX_SLOTS_PER_GROUP exercises/group keeps the realized weekly
    // volume in the MEV/low-MAV band the policy wants (2 ex × 3 days × 3 = 18 <
    // the novice ceiling). Trained tiers (T1/T2+) are untouched (byte-identical).
    // The EMPHASIZED focus group is exempt (the user explicitly asked for it —
    // a beginner with a chest focus still gets the chest surfacing; only the
    // NON-focus groups are slot-capped to keep the novice week in band).
    if (ctx?.beginnerVolumeCap && ctx?.profileTier === 'T0' && !emphSet.has(g)) {
      slotCap[g] = Math.min(slotCap[g], BEGINNER_MAX_SLOTS_PER_GROUP);
    }
    // Focus EMPHASIS — an emphasized group earns ONE extra slot over its
    // cluster-weight cap so the preset surfaces as an additional exercise on that
    // group (the visible difference arms/chest were missing). The session total is
    // still bounded by effectiveSessionSize below, so this REDISTRIBUTES a slot
    // from the lowest-weight non-emphasized group toward the emphasized one.
    if (emphSet.has(g)) slotCap[g] += 1;
  }
  // Make ROOM for the emphasized extra slots: raise the session budget by the
  // number of emphasized groups this cluster trains (clamped to SESSION_SIZE).
  // Without this the session stays saturated at the balanced size and the extra
  // emphasized slot only DISPLACES another group rather than adding visible
  // volume. balanced / no emphasized group in this cluster → unchanged.
  const effectiveSessionSize = Math.min(SESSION_SIZE, sessionSize + emphSet.size);
  const groupCount = {};

  const chosen = [];
  const chosenNames = new Set();
  // BUG 5 — dedup by MOVEMENT (muscle + movement token), not exact name, so two
  // same-movement variants (e.g. two chest flyes under different names) can never
  // both land in one plan. chosenNames stays as the exact-name guard underneath.
  const chosenMovements = new Set();
  const isTaken = (e) =>
    chosenNames.has(e.name) || chosenMovements.has(movementKey(e.name, e.meta));
  // #3 (Daniel coach audit 2026-06-10) — a big lower lift = a tier-1 mover on the
  // quad/ham groups (squat/hinge/lunge/press). Cap at MAX_BIG_LOWER_LIFTS per
  // session so a legs/lower/full day never stacks 3+ heavy bilateral compounds.
  // F7 — big lower lift = a quad/ham mover that is EITHER tier-1 (the existing
  // signal, keeps GHR/Nordic/good-morning/hyper) OR carries a systemic compound
  // movement-pattern token (folds in the tier-2 stance/lunge/squat VARIANTS that
  // used to slip in as accessories). movementKey returns `<group>::<token>`; the
  // token after `::` is the family. Isolations (leg-extension/leg-curl) carry their
  // own distinct tokens → not in LOWER_BIG_MOVEMENT_TOKENS → correctly excluded.
  const isBigLower = (e) => {
    if (!LOWER_BIG_GROUPS.has(e.meta?.muscle_target_primary)) return false;
    if (e.meta?.tier === 1) return true;
    const token = movementKey(e.name, e.meta).split('::')[1] ?? '';
    return LOWER_BIG_MOVEMENT_TOKENS.has(token);
  };
  let bigLowerCount = 0;
  const bigLowerCapped = (e) => bigLowerCount >= MAX_BIG_LOWER_LIFTS && isBigLower(e);
  const take = (e, sets) => {
    chosen.push({ name: e.name, sets });
    chosenNames.add(e.name);
    chosenMovements.add(movementKey(e.name, e.meta));
    const g = e.meta?.muscle_target_primary;
    if (g) groupCount[g] = (groupCount[g] || 0) + 1;
    if (isBigLower(e)) bigLowerCount += 1;
  };

  // Phase 1 — T1 compound anchors on the PRIMARY group(s), up to MAX_T1.
  // Walk primary groups in order, taking the top T1 entry from each until MAX_T1.
  //
  // BUG 5 interaction with continuity-ranking: a T1 compound must NOT claim a
  // movement slot that a MORE-PREFERRED (PR-history rank 0 or known-anchor rank 1)
  // variant of the SAME movement would later want — otherwise dedup would drop the
  // user's familiar lift (e.g. T1 Cheat Curl Barbell stealing the biceps::curl
  // slot from the anchored Bayesian Curl / the logged Cable Curl). So we skip a T1
  // candidate when a strictly-higher-preference (lower rank) same-movement entry
  // exists in the pool; that preferred variant takes the slot in Phase 2.
  let t1Count = 0;
  for (const { pool } of pools) {
    if (t1Count >= MAX_T1) break;
    const t1 = pool.find((e) => {
      if (e.meta.tier !== 1 || isTaken(e)) return false;
      const mk = movementKey(e.name, e.meta);
      const myRank = rank(e.name, prNames);
      // Phase-1 anchor dedup tiebreak. LEGACY (flag OFF) defers a T1 to a
      // strictly-lower-rank (commonness) same-movement variant → byte-identical.
      // Under dp_daniel_tier_select_v1, preference must follow Daniel's SELECTION
      // band (tierSelectScore), NOT commonness — otherwise once the OHP dedup
      // collapses Machine Shoulder Press [S] and DB Shoulder Press [COMMON] onto
      // one movementKey, commonness would defer the S-band press to the B-band
      // one (the umeri anchor regresses). Use the same score the Phase-2 sort
      // uses so anchor + fill agree. (2026-06-09)
      const myScore = danielTierSelect
        ? tierSelectScore(e.name, { hasLog: prNames.has(e.name) })
        : 0;
      const preferredSameMovement = pool.some((o) =>
        movementKey(o.name, o.meta) !== mk
          ? false
          : danielTierSelect
            ? tierSelectScore(o.name, { hasLog: prNames.has(o.name) }) > myScore
            : rank(o.name, prNames) < myRank,
      );
      return !preferredSameMovement;
    });
    if (t1) {
      take(t1, DEFAULT_SETS);
      t1Count++;
    }
  }

  // Phase 2 — round-robin fill across groups (isolation T2/T3 + any remaining
  // T1), one per group per pass, until sessionSize or pools exhausted. Respect
  // the weight-biased slotCap so heavier groups accrue more slots (the cluster
  // weight bias). A weak group is exempt from its cap (it should win EXTRA
  // volume — that is the Specialization point).
  // #70-D5 — a BEGINNER's per-group slot cap is a HARD ceiling that binds even a
  // surfaceSet (weak/emphasized) group AND the remainder pass below: a novice
  // should never stack more than BEGINNER_MAX_SLOTS_PER_GROUP exercises on one
  // muscle in a session (over-MRV weekly on a high-freq split — DIAG D5). Trained
  // tiers have no hard cap (Infinity) → byte-identical.
  // The emphasized focus group is exempt from the hard cap too (a beginner's
  // explicit look choice surfaces; only non-focus groups are bound).
  const beginnerHardCapFor = (group) =>
    ctx?.beginnerVolumeCap && ctx?.profileTier === 'T0' && !emphSet.has(group)
      ? BEGINNER_MAX_SLOTS_PER_GROUP
      : Infinity;
  let progressed = true;
  while (chosen.length < effectiveSessionSize && progressed) {
    progressed = false;
    for (const { group, pool } of pools) {
      if (chosen.length >= effectiveSessionSize) break;
      // Weak (auto) AND emphasized (focus) groups are exempt from their cap — both
      // should win EXTRA volume (the Specialization point + the user's look choice)
      // — EXCEPT a beginner's hard per-group ceiling, which always binds.
      if ((groupCount[group] || 0) >= beginnerHardCapFor(group)) continue;
      const capped = !surfaceSet.has(group) && (groupCount[group] || 0) >= slotCap[group];
      if (capped) continue;
      const next = pool.find((e) => !isTaken(e) && !bigLowerCapped(e));
      if (next) {
        take(next, DEFAULT_SETS);
        progressed = true;
      }
    }
  }

  // Remainder pass — if the weighted caps left the session under budget (e.g. a
  // small cluster whose caps summed below effectiveSessionSize, or thin pools),
  // top up ignoring caps so the session still reaches its volume-driven size when
  // the library can supply it.
  progressed = true;
  while (chosen.length < effectiveSessionSize && progressed) {
    progressed = false;
    for (const { group, pool } of pools) {
      if (chosen.length >= effectiveSessionSize) break;
      // #70-D5 — the beginner per-group hard cap binds here too (the remainder
      // pass otherwise ignores all caps, re-stacking a small cluster's lone group).
      if ((groupCount[group] || 0) >= beginnerHardCapFor(group)) continue;
      const next = pool.find((e) => !isTaken(e) && !bigLowerCapped(e));
      if (next) {
        take(next, DEFAULT_SETS);
        progressed = true;
      }
    }
  }

  // #73 LATERAL-RAISE GUARANTEE (ctx.lateralRaiseGuarantee, dp_smart_selection_v1).
  // When the focus emphasizes the shoulders (umeri in emphSet — v-taper / upper /
  // shoulders) and this cluster trains umeri, the session MUST include a lateral
  // raise (the #1 width movement). The DIAG (_REF_gold_vtaper_cut) showed selection
  // picking press + rear-delt but NO lateral raise → the v-taper delts stalled at
  // ~16 instead of the 17-20 width band. Here, if no lateral raise landed, inject
  // one: prefer to REPLACE the lowest-priority umeri NON-press isolation (a rear
  // delt / face pull — width budget redirected to the lateral); else ADD it if the
  // session has room; else replace the single lowest-priority non-anchor exercise.
  // OFF (flag OFF / umeri not emphasized / no umeri target) → never runs →
  // byte-identical. The injected lateral flows into the set-distribution + ordering
  // below exactly like any other selected umeri exercise.
  if (ctx?.lateralRaiseGuarantee === true && targets.includes('umeri')) {
    const LATERAL_MK = 'umeri::lateral-raise';
    const hasLateral = chosen.some(
      (e) => movementKey(e.name, getExerciseMetadata(e.name)) === LATERAL_MK,
    );
    if (!hasLateral) {
      const umeriPool = pools.find((p) => p.group === 'umeri')?.pool ?? [];
      const lateral = umeriPool.find(
        (e) => movementKey(e.name, e.meta) === LATERAL_MK && !isTaken(e),
      );
      if (lateral) {
        // Removal candidate: the LAST-selected umeri isolation (tier >= 2) that is
        // NOT itself a press/lateral — i.e. a rear-delt / face-pull / Y-raise. Walk
        // from the back (lowest priority first). A press anchor is never removed.
        let removeIdx = -1;
        for (let i = chosen.length - 1; i >= 0; i--) {
          const m = getExerciseMetadata(chosen[i].name);
          if (m.muscle_target_primary !== 'umeri') continue;
          if ((m.tier ?? 2) <= COMPOUND_TIER) continue; // keep the press anchor
          removeIdx = i;
          break;
        }
        if (removeIdx >= 0) {
          const removed = chosen[removeIdx];
          chosenNames.delete(removed.name);
          chosenMovements.delete(movementKey(removed.name, getExerciseMetadata(removed.name)));
          const rg = getExerciseMetadata(removed.name).muscle_target_primary;
          if (rg && groupCount[rg]) groupCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: lateral.name, sets: DEFAULT_SETS });
          chosenNames.add(lateral.name);
          chosenMovements.add(movementKey(lateral.name, lateral.meta));
          groupCount.umeri = (groupCount.umeri || 0) + 1;
        } else if (chosen.length < SESSION_SIZE) {
          take(lateral, DEFAULT_SETS);
        } else {
          // No umeri isolation to swap + session full: replace the lowest-priority
          // non-anchor (tier >= 2) exercise so the guarantee still holds.
          let fallbackIdx = -1;
          for (let i = chosen.length - 1; i >= 0; i--) {
            if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
            fallbackIdx = i;
            break;
          }
          if (fallbackIdx >= 0) {
            const removed = chosen[fallbackIdx];
            chosenNames.delete(removed.name);
            chosenMovements.delete(movementKey(removed.name, getExerciseMetadata(removed.name)));
            const rg = getExerciseMetadata(removed.name).muscle_target_primary;
            if (rg && groupCount[rg]) groupCount[rg] -= 1;
            chosen.splice(fallbackIdx, 1, { name: lateral.name, sets: DEFAULT_SETS });
            chosenNames.add(lateral.name);
            chosenMovements.add(movementKey(lateral.name, lateral.meta));
            groupCount.umeri = (groupCount.umeri || 0) + 1;
          }
        }
      }
    }
  }

  // #R6a UPPER-DAY BICEPS GUARANTEE (ctx.bicepsGuarantee, dp_biceps_guarantee_v1).
  // Daniel coach audit 2026-06-10: his real Upper day (8 exercises) landed chest +
  // back + shoulders + triceps but NO biceps, even though `upper` weights biceps
  // 0.15 — the low slot share rounded biceps out. When a cluster TRAINS biceps
  // (upper / pull / full → targets includes 'biceps') the session MUST include at
  // least one biceps movement. If none landed, inject one: prefer to ADD if the
  // session has room; else replace the lowest-priority non-anchor isolation. OFF /
  // no biceps target → never runs → byte-identical.
  if (ctx?.bicepsGuarantee === true && targets.includes('biceps')) {
    const hasBiceps = chosen.some(
      (e) => getExerciseMetadata(e.name)?.muscle_target_primary === 'biceps',
    );
    if (!hasBiceps) {
      const bicepsPool = pools.find((p) => p.group === 'biceps')?.pool ?? [];
      const biceps = bicepsPool.find((e) => !isTaken(e));
      if (biceps) {
        if (chosen.length < SESSION_SIZE) {
          take(biceps, DEFAULT_SETS);
        } else {
          // Session full: replace the lowest-priority non-anchor (tier >= 2) exercise.
          let removeIdx = -1;
          for (let i = chosen.length - 1; i >= 0; i--) {
            if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
            removeIdx = i;
            break;
          }
          if (removeIdx >= 0) {
            const removed = chosen[removeIdx];
            chosenNames.delete(removed.name);
            chosenMovements.delete(movementKey(removed.name, getExerciseMetadata(removed.name)));
            const rg = getExerciseMetadata(removed.name).muscle_target_primary;
            if (rg && groupCount[rg]) groupCount[rg] -= 1;
            chosen.splice(removeIdx, 1, { name: biceps.name, sets: DEFAULT_SETS });
            chosenNames.add(biceps.name);
            chosenMovements.add(movementKey(biceps.name, biceps.meta));
            groupCount.biceps = (groupCount.biceps || 0) + 1;
          }
        }
      }
    }
  }

  // #2 (Daniel coach audit 2026-06-10) — UPPER arm de-duplication. The upper catch-all
  // is the densest day (it saturates to 8) and doubles up DIRECT-ARM isolation (a biceps
  // AND a triceps lift) though both groups carry only 0.15 weight. Triceps is already
  // hit hard by the day's presses (+ the Push day); biceps is the under-served arm
  // (pull + upper only), and the guarantee above already kept it. So on UPPER, drop the
  // redundant standalone TRICEPS isolation → the day lands at 7 focused lifts. Scoped to
  // 'upper' (pull is biceps-led, full-body needs breadth) and EXEMPT when triceps is the
  // user's emphasis (arms/triceps focus keeps its direct work). One removal, no refill.
  if (cluster === 'upper' && !emphSet.has('triceps')) {
    const primaryOf = (n) => getExerciseMetadata(n)?.muscle_target_primary;
    const isIso = (n) => (getExerciseMetadata(n)?.tier ?? 2) > COMPOUND_TIER;
    const hasBiceps = chosen.some((e) => primaryOf(e.name) === 'biceps');
    const triIdx = chosen.findIndex((e) => primaryOf(e.name) === 'triceps' && isIso(e.name));
    if (hasBiceps && triIdx >= 0 && chosen.length > minSession) {
      const removed = chosen[triIdx];
      chosenNames.delete(removed.name);
      chosenMovements.delete(movementKey(removed.name, getExerciseMetadata(removed.name)));
      if (groupCount.triceps) groupCount.triceps -= 1;
      chosen.splice(triIdx, 1);
    }
  }

  // Wave 1.3-B FOCUS-POLICY resolver (ctx.focusPolicy, dp_focus_policy_v1). When
  // the flag is ON, apply the per-focus LOCAL constraint policy (sessionCaps +
  // sessionRequirements from FOCUS_RULES) to the selected list: prune excess over a
  // cap, inject a missing required slot when a candidate exists, under the Daniel-
  // locked precedence (safety/recovery/coverage > requirements > caps > score). The
  // candidate POOL it injects from is the same per-group pools (already past every
  // upstream HARD exclude). OFF (flag absent → ctx.focusPolicy !== true) → never
  // called → byte-identical. Runs on `chosen` BEFORE set-distribution so any
  // injected/pruned exercise flows through the existing dosing + ordering.
  if (ctx?.focusPolicy === true) {
    // Flat candidate pool: every pool entry not already taken, de-duped by name.
    const seen = new Set(chosen.map((e) => e.name));
    const candidatePool = [];
    for (const { pool } of pools) {
      for (const e of pool) {
        if (!seen.has(e.name)) { seen.add(e.name); candidatePool.push({ name: e.name, meta: e.meta }); }
      }
    }
    const focusResolved = applyFocusPolicy(chosen, {
      focusId: ctx?.focusId,
      daysPerWeek: ctx?.daysPerWeek,
      // F5 (dp_latiso_dedup_v1) — the active week's derived clusters, threaded
      // from getDailyWorkout so requirementsFor can defer a weekly minimum to the
      // week's SPECIALIST days (v-taper lat-iso → Pull owns it, Upper lands at 7).
      weekClusters: ctx?.weekClusters ?? null,
      cluster,
      pool: candidatePool,
      prNames,
      movementKey,
      getMeta: getExerciseMetadata,
      // Match the Phase-2 selection score (Daniel tier list when ON, else neutral)
      // so the resolver's prune/inject tiebreak agrees with how the session was built.
      scoreOf: (name) =>
        danielTierSelect ? tierSelectScore(name, { hasLog: prNames.has(name) }) : -rank(name, prNames),
      sessionSizeCap: SESSION_SIZE,
    });
    if (Array.isArray(focusResolved) && focusResolved.length > 0) {
      chosen.length = 0;
      chosen.push(...focusResolved);
      // Rebuild the take()-tracking sets so the downstream set-distribution +
      // ordering see the resolved list (groupCount drives nothing further, but keep
      // chosenNames/Movements coherent for any later read).
      chosenNames.clear();
      chosenMovements.clear();
      for (const e of chosen) {
        chosenNames.add(e.name);
        chosenMovements.add(movementKey(e.name, getExerciseMetadata(e.name)));
      }
    }
  }

  // W-Split GAP 4 — MAJOR-MUSCLE SLOT GUARANTEE (ctx.maintenanceFloorGuarantee,
  // dp_split_rebalance_v1). The slot-side complement of the weekly maintenance
  // floor (applyMaintenanceFloor): the budget floor keeps every major muscle ≥ MEV
  // in the volume BUDGET, but a slot-limited full-body day whose focus front-loads
  // its emphasized region can drop a major muscle to ZERO SLOTS, so the floored
  // budget never becomes an exercise (Gigel 2d UPPER: hams/glutes/calves slotted
  // out entirely). Here, for each MAJOR muscle this cluster trains that ended with
  // NO exercise, inject one from its pool so the MEV budget lands on the day.
  // The injected slot is sized by the SAME sessionSetBudget path below (≥ its
  // MEV-derived band), so a de-emphasized major muscle is MAINTAINED, never zeroed.
  // Runs AFTER all fill + focus-policy so it is the final word on slot membership.
  // OFF (flag OFF / pure-fn callers) → never runs → byte-identical. Deterministic:
  // majors walked in a fixed order; the displaced slot is the lowest-priority
  // (highest-index) non-anchor exercise of the most over-slotted group.
  if (ctx?.maintenanceFloorGuarantee === true) {
    const groupOfName = (name) => getExerciseMetadata(name).muscle_target_primary;
    // Recount groupCount off `chosen` (focus-policy may have rebuilt the list).
    const liveCount = {};
    for (const e of chosen) {
      const g = groupOfName(e.name);
      if (g) liveCount[g] = (liveCount[g] || 0) + 1;
    }
    const majorsToTrain = MAJOR_MUSCLES_SLOT_GUARANTEE.filter((g) => targets.includes(g));
    for (const major of majorsToTrain) {
      if ((liveCount[major] || 0) > 0) continue; // already has a slot
      const pool = pools.find((p) => p.group === major)?.pool ?? [];
      const inject = pool.find((e) => !isTaken(e));
      if (!inject) continue; // library can't supply this group under the constraints
      if (chosen.length < SESSION_SIZE) {
        // Room left — simply add the maintenance slot.
        take(inject, DEFAULT_SETS);
        liveCount[major] = (liveCount[major] || 0) + 1;
        continue;
      }
      // Session full — displace the lowest-priority (last) exercise of the most
      // over-slotted group (the group carrying the MOST exercises, > 1). Removing a
      // 2nd+ slot of an over-allocated group (the focus front-loads its emphasized
      // region to 2 slots each) leaves that group with ≥ 1 exercise, so the swap
      // never steals another group's only slot and an anchor always survives. Walk
      // from the back so the lowest selection-priority slot of the biggest group
      // goes first; among groups tied on count, the one whose lowest slot is latest
      // (most expendable) wins. Deterministic.
      const majorSet = new Set(majorsToTrain);
      let removeIdx = -1;
      let bestOverflow = 1;
      for (let i = chosen.length - 1; i >= 0; i--) {
        const g = getExerciseMetadata(chosen[i].name).muscle_target_primary;
        const cnt = liveCount[g] || 0;
        if (cnt > bestOverflow) { bestOverflow = cnt; removeIdx = i; }
      }
      // No over-slotted group to thin (every group at exactly 1) — then a major
      // muscle is being crowded out by a NON-MAJOR group (arms/abs/forearms). A
      // major (a big mover the user de-emphasized to MAINTENANCE) outranks a small
      // isolation group for the last slot, so displace the lowest-priority
      // single-slot NON-MAJOR exercise. Majors already placed are never touched.
      if (removeIdx === -1) {
        for (let i = chosen.length - 1; i >= 0; i--) {
          const g = getExerciseMetadata(chosen[i].name).muscle_target_primary;
          if (!majorSet.has(g)) { removeIdx = i; break; }
        }
      }
      if (removeIdx >= 0) {
        const removed = chosen[removeIdx];
        const rg = getExerciseMetadata(removed.name).muscle_target_primary;
        chosenNames.delete(removed.name);
        chosenMovements.delete(movementKey(removed.name, getExerciseMetadata(removed.name)));
        if (rg && liveCount[rg]) liveCount[rg] -= 1;
        chosen.splice(removeIdx, 1, { name: inject.name, sets: DEFAULT_SETS });
        chosenNames.add(inject.name);
        chosenMovements.add(movementKey(inject.name, inject.meta));
        liveCount[major] = (liveCount[major] || 0) + 1;
      }
    }
  }

  const metaOf = (name) => getExerciseMetadata(name);
  const groupOf = (name) => metaOf(name).muscle_target_primary;

  // M1 "make it bite" — fatigued exercise drop. A muscle the user trained hard
  // recently (recovery state 'fatigued') should TRAIN LIGHT today: fewer
  // movements AND fewer sets, visibly lighter than a fresh day. The set-floor
  // drop below handles sets; here we drop ~1 exercise from each FATIGUED group
  // that has MORE THAN ONE exercise this session (keeping the highest-priority,
  // i.e. earliest-selected, so the anchor compound survives). Never drops a
  // group to zero — a fatigued muscle gets a light touch, not skipped. partial
  // and recovered groups keep all their exercises (sets-only adjustment). No
  // ctx.recoveryState (pure-fn callers) → recoveryState empty → ZERO drop.
  const recoveryState = ctx?.recoveryState ?? {};
  {
    const fatiguedGroupCount = {};
    for (const e of chosen) {
      const g = groupOf(e.name);
      if (recoveryState[g] === 'fatigued') {
        fatiguedGroupCount[g] = (fatiguedGroupCount[g] || 0) + 1;
      }
    }
    // For each fatigued group with >1 exercise, drop its LAST occurrence (lowest
    // selection priority) so the leading anchor stays. One drop per group.
    const dropLastFor = new Set(
      Object.keys(fatiguedGroupCount).filter((g) => fatiguedGroupCount[g] > 1),
    );
    if (dropLastFor.size > 0) {
      const lastIndexByGroup = {};
      chosen.forEach((e, i) => {
        const g = groupOf(e.name);
        if (dropLastFor.has(g)) lastIndexByGroup[g] = i;
      });
      // Tier-aware floor guard: the fatigued exercise-drop must NEVER push the
      // session below minSession (the ordering bug that let a 1-day-fatigue case
      // fall to 2 exercises). Apply only as many drops as keep chosen.length at or
      // above the floor — drop the LOWEST-priority occurrences first (highest
      // index) so the anchor compounds survive when a drop must be skipped.
      const maxDrops = Math.max(0, chosen.length - minSession);
      const candidateIdx = Object.values(lastIndexByGroup).sort((a, b) => b - a);
      const dropIdx = new Set(candidateIdx.slice(0, maxDrops));
      if (dropIdx.size > 0) {
        const trimmed = chosen.filter((_, i) => !dropIdx.has(i));
        chosen.length = 0;
        chosen.push(...trimmed);
      }
    }
  }

  // Set-count from the periodization volume signal (sets/week per group),
  // distributed across the exercises hitting each group this session with the
  // PRIMARY COMPOUND weighted higher than isolation (BUG 1 — compound-anchored,
  // not even-split). Without a volumeTargets signal every exercise keeps
  // DEFAULT_SETS (no-op). The group's per-session budget uses the REAL
  // sessions/week frequency (ctx.weeklySessionsPerGroup), not a blind 2. A
  // non-recovered group (partial/fatigued, ctx.recoveryState) lets its compound
  // dip below the normal 3-set floor so the already-cut budget shows on the day.
  // Bucket the chosen exercises by group (preserving order) so the distribution
  // sees the whole group at once (compound + isolation together).
  const byGroup = /** @type {Record<string, Array<{name: string, tier: number}>>} */ ({});
  for (const e of chosen) {
    const g = groupOf(e.name);
    (byGroup[g] ||= []).push({ name: e.name, tier: metaOf(e.name).tier });
  }
  // dp_tier_compound_floor_v1 — a T0 NOVICE's FRESH compound floor may drop to 2
  // (MEV). ctx.tierCompoundFloor is the resolved flag (set at the getDailyWorkout
  // seam); a beginner is gated on the resolved profileTier. Trained / flag OFF →
  // false → the universal 3-set fresh floor (byte-identical).
  const noviceCompoundFloor = ctx?.tierCompoundFloor === true && ctx?.profileTier === 'T0';
  // #71 coherent allocation + #72 emphasis sets-boost (both default OFF → the
  // distribution is byte-identical to today).
  const coherentAlloc = ctx?.coherentAlloc === true;
  const emphasisSetsBoost = ctx?.emphasisSetsBoost === true;
  // Per-exercise set count, keyed by name (group distribution applied once).
  const setsByName = /** @type {Record<string, number>} */ ({});
  for (const [g, exs] of Object.entries(byGroup)) {
    const perSessionBudget = sessionSetBudget(g, ctx?.volumeTargets, ctx?.weeklySessionsPerGroup);
    // #72 — an emphasized group raises its set band so the focus work carries
    // visibly more sets (DIAG #2), but ONLY when its WEEKLY target still has room to
    // grow toward its ceiling (policy: "an emphasized group's weekly set target rises
    // TOWARD MAV/MRV").
    // #70-D3 — gate the boost on the group's REAL ceiling. A multi-slot group that
    // can carry a COMPOUND this session (back / chest / legs) keeps the MAV gate so
    // an already-saturated v-taper back is not over-inflated. A SMALL group with NO
    // compound in the session (biceps / triceps — isolation-only) is gated on MRV
    // instead: an `arms` focus lerps the weekly budget toward MRV (≈23 > MAV 14), so
    // a MAV gate would silently disable the very boost the user asked for and leave
    // the arms stuck at 3 sets/lift (DIAG D3). The weekly MRV cap upstream still
    // bounds the total, so surfacing the per-exercise sets toward the band is safe.
    const enKey = BIG11_RO_TO_EN_MAP[g] ?? g;
    const weeklyForGroup =
      ctx?.volumeTargets && typeof ctx.volumeTargets === 'object' ? ctx.volumeTargets[enKey] : undefined;
    const landmark = ISRAETEL_BASELINES[enKey];
    const groupMav = landmark?.MAV;
    const hasCompoundThisSession = exs.some((e) => e.tier === COMPOUND_TIER);
    const ceilingLandmark = hasCompoundThisSession ? groupMav : landmark?.MRV;
    const belowCeiling =
      typeof weeklyForGroup === 'number' && typeof ceilingLandmark === 'number'
        ? weeklyForGroup < ceilingLandmark
        : true; // no signal → don't block the lift (the few-slot emphasis case)
    const isEmphasized = emphasisSetsBoost && emphSet.has(g) && belowCeiling;
    // #71 — pin a STABLE per-exercise dose so the same lift no longer swings with
    // however many slots this day's cluster gave the group (DIAG #3). OFF or no
    // usable budget → the legacy weekly/freq budget (byte-identical).
    // #70-D3 — but an EMPHASIZED ISOLATION-only group (biceps/triceps) is the
    // OPPOSITE case from the balloon #71 fixes: its big weekly budget (focus→MRV)
    // expects ~4 exercises, yet the session fits only 1-2 (cluster slots + a time
    // cap). The de-balloon then divides the dose by the EXPECTED count and crushes
    // the lone arm lift to ~3 sets — defeating the emphasis. So skip the de-balloon
    // for an emphasized isolation-only group: keep the full per-session budget so
    // its 1-2 lifts CONCENTRATE the volume toward the band (bounded by the raised
    // isolation ceiling + the weekly MRV cap). Groups with a compound keep #71.
    const skipDeballoon = isEmphasized && !hasCompoundThisSession;
    const budget = coherentAlloc && !skipDeballoon
      ? (coherentDayBudget(perSessionBudget, exs.length) ?? perSessionBudget)
      : perSessionBudget;
    const counts = distributeGroupSets(
      exs, budget, recoveryState[g], ctx?.fatigueSetsAdjust, isEmphasized,
      ctx?.effectiveRepsSetsTrim, noviceCompoundFloor, ctx?.anchorProtect === true,
    );
    exs.forEach((e, i) => { setsByName[e.name] = counts[i]; });
  }
  let exercises = chosen.map((e) => ({
    name: e.name,
    sets: setsByName[e.name] ?? DEFAULT_SETS,
  }));

  // W-Split GAP 4 — SENIOR / COLD-START per-session VOLUME CAP. A senior beginner
  // must not get ~20+ sets in session 1 (oracle grid: 68-72yo novice). ctx.
  // seniorSessionCap is a resolved MAX total sets for THIS session (age × experience
  // ceiling, computed at the getDailyWorkout seam behind dp_split_rebalance_v1).
  // When the assembled session exceeds it, trim sets proportionally from the
  // HIGHEST-set exercises first, never below SET_FLOOR (2 = MEV — a capped session
  // is still trained, never gutted). Absent (flag OFF / non-senior) → no-op →
  // byte-identical. Deterministic: trims by descending sets then stable index.
  const seniorCap = ctx?.seniorSessionCap;
  if (typeof seniorCap === 'number' && Number.isFinite(seniorCap) && seniorCap > 0) {
    const SET_FLOOR = 2;
    let total = exercises.reduce((a, e) => a + (e.sets || 0), 0);
    // Trim one set at a time from the current highest-set exercise (≥ floor) until
    // the total fits the cap or nothing is trimmable. Bounded: each pass removes ≥1
    // set, and the trimmable pool only shrinks → terminates.
    let guard = exercises.length * 12;
    while (total > seniorCap && guard-- > 0) {
      let maxIdx = -1;
      let maxSets = SET_FLOOR;
      exercises.forEach((e, i) => {
        if ((e.sets || 0) > maxSets) { maxSets = e.sets; maxIdx = i; }
      });
      if (maxIdx < 0) break; // every exercise already at the floor
      exercises[maxIdx] = { ...exercises[maxIdx], sets: exercises[maxIdx].sets - 1 };
      total -= 1;
    }
  }

  // BUG #6 ordering — primary lifts lead, isolation/accessory follow, so a small-
  // muscle isolation never lands ahead of a heavy compound (e.g. a biceps curl
  // before the 2nd back pull, pre-fatiguing grip — the round-robin fill otherwise
  // interleaves spate->biceps->spate). Stable sort by tier ascending (tier 1
  // anchors first); selection order is preserved within a tier via the index
  // tiebreak. Runs BEFORE weak-group front-loading so the Specialization engine
  // still gets the final say on its weak group's position.
  exercises = exercises
    .map((e, i) => ({ e, i, tier: metaOf(e.name).tier ?? 2 }))
    .sort((a, b) => (a.tier - b.tier) || (a.i - b.i))
    .map((x) => x.e);

  // Weakness-prioritized ordering is LIVE whenever the pipeline supplies a weak
  // group (the Specialization engine only emits one when its 4-gate eligibility
  // passes, so presence of weakGroups IS the gate — no separate global flag is
  // needed). Pairs with the pool-bias above: the weak group gets BOTH more
  // volume (extra slots) and front-of-session ordering. Focus EMPHASIS shares the
  // front-of-session lever (the user's look choice leads the session) — applied
  // AFTER weakness so an auto-detected weakness still wins the very front.
  if (emphSet.size > 0) {
    exercises = prioritizeWeakGroups(exercises, [...emphSet]);
  }
  if ((ctx?.weakGroups?.length ?? 0) > 0) {
    exercises = prioritizeWeakGroups(exercises, ctx?.weakGroups ?? []);
  }

  // F6 (Daniel coach audit 2026-06-10) — FOCUS-WEIGHTED accessory ordering. Within
  // the ACCESSORY band (tier > 1) a focus-RELEVANT isolation should lead the non-
  // focus accessories (his v-taper Pull: the lat-iso Machine Pullover before the
  // off-focus Shrug + Hyperextension). Stable sort keyed (tier, focus-relevance,
  // current index): tier stays primary so COMPOUNDS-FIRST is untouched, and the
  // current order is the final tiebreak so the weak/emphasis front-load above is
  // preserved within each band. Focus-relevance is derived from the SAME focus-
  // policy data the resolver enforces (focusRelevantTags ∩ the exercise's tags), so
  // it never drifts. Gated on dp_focus_policy_v1 (ctx.focusPolicy) + a real focusId
  // → balanced / flag-off → empty tag set → key is uniform → byte-identical order.
  if (ctx?.focusPolicy === true && ctx?.focusId) {
    const relevant = focusRelevantTags(ctx.focusId);
    if (relevant.size > 0) {
      const isFocusAccessory = (name) => {
        const meta = getExerciseMetadata(name);
        if ((meta?.tier ?? 2) <= COMPOUND_TIER) return false; // accessories only
        for (const tag of deriveExerciseTags(name, meta, movementKey)) {
          if (relevant.has(tag)) return true;
        }
        return false;
      };
      exercises = exercises
        .map((e, i) => ({ e, i, tier: getExerciseMetadata(e.name).tier ?? 2, foc: isFocusAccessory(e.name) ? 0 : 1 }))
        .sort((a, b) => (a.tier - b.tier) || (a.foc - b.foc) || (a.i - b.i))
        .map((x) => x.e);
    }
  }

  // #70-D2 COMPOUND-FIRST guarantee (final): the weak/emphasis front-loaders above
  // pull a target group's selected exercise to position 0, which can be an ISOLATION
  // when that group's slot resolved to one (a glute-emphasis leg day whose fese pick
  // is Cable Glute Kickback / Hip Abduction — both tier-2 isolations, the glute
  // COMPOUND hip-thrust not having been selected). That violates the "1-2 main
  // compounds FIRST, then accessories" rule. If the lead exercise is an isolation
  // (tier > 1) AND a COMPOUND (tier 1) exists later in the session, hoist the
  // earliest such compound to the front (stable; everything else keeps order). A
  // session with no compound (a pure isolation/arm accessory day) is left untouched
  // — leading with an isolation is allowed there. Pure reorder; never adds/drops.
  // Behind ctx.compoundFirstGuard (dp_emphasis_specialization_v1, default OFF →
  // byte-identical): only fires alongside the emphasis front-loader that creates
  // the isolation-leads case in the first place.
  if (ctx?.compoundFirstGuard === true && exercises.length > 1) {
    const tierOf = (name) => metaOf(name).tier ?? 2;
    if (tierOf(exercises[0].name) > COMPOUND_TIER) {
      const compoundIdx = exercises.findIndex((e) => tierOf(e.name) === COMPOUND_TIER);
      if (compoundIdx > 0) {
        const [lead] = exercises.splice(compoundIdx, 1);
        exercises.unshift(lead);
      }
    }
  }

  return { type: cluster, exercises };
}

/**
 * Reorder exercises so weak-group exercises appear in the first 2 positions.
 * Does NOT add exercises not already in the list.
 *
 * WP-4: weak groups are now Big-11 canonical RO groups (matching the library's
 * muscle_target_primary and the Specialization engine's target_muscle_group).
 * An exercise belongs to a weak group when its library muscle_target_primary is
 * in weakGroups. (Previously keyed on a hardcoded head-group table that the live
 * caller never matched — silent no-op. Now it actually reorders.)
 *
 * @param {Array<{name: string, sets: number}>} exercises
 * @param {Array<string>} weakGroups
 */
export function prioritizeWeakGroups(exercises, weakGroups) {
  const weakSet = new Set(weakGroups);
  const isWeak = (name) =>
    weakSet.has(getExerciseMetadata(name).muscle_target_primary);

  // No weak/emphasized exercise in this session → nothing to surface (no-op,
  // preserves the caller's order).
  if (!exercises.some((e) => isWeak(e.name))) return exercises.slice();

  // Stable TIER-major / weakness-minor ordering. The OLD rule sliced the weak
  // group's first 2 exercises to the front and dumped the rest to the BACK,
  // which broke compound-first two ways the founder hit live (2026-06-09):
  //   • Push (umeri emphasized): weak.slice(0,2) = DB Shoulder Press + Rear Delt
  //     Fly → the tier-2 Rear Delt Fly ISOLATION landed at #2, ahead of every
  //     chest compound.
  //   • Pull (spate emphasized, 4 back compounds): weak.slice(2) shoved Chin-up +
  //     Pull-up (tier-1 COMPOUNDS) to the very back, behind the biceps curls.
  // The single compoundFirstGuard only protected position 0, so #2+ stayed wrong.
  // Now: COMPOUND-first holds GLOBALLY (a tier-1 lift never sits behind a tier-2
  // isolation — the grip-fatigue rule, BUG #6), and WITHIN each tier band the
  // weak/emphasized group leads so it still visibly surfaces (its compound leads
  // the compounds; an isolation-only weak group leads the accessory block). Pure
  // reorder; never adds or drops an exercise.
  const tierOf = (name) => getExerciseMetadata(name).tier ?? 2;
  return exercises
    .map((e, i) => ({ e, i, tier: tierOf(e.name), weak: isWeak(e.name) ? 0 : 1 }))
    .sort((a, b) => (a.tier - b.tier) || (a.weak - b.weak) || (a.i - b.i))
    .map((x) => x.e);
}
