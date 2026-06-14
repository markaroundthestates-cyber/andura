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
import { isExcludedMovement, LUMBAR_HINGE_SENTINEL } from './movementExclusion.js';
import { EXERCISE_TIER_RANK, tierSelectScore, TIER_SELECTABLE_SA, HAS_LOG_BONUS } from './exerciseTierRank.js';
import { applyFocusPolicy, deriveExerciseTags, focusRelevantTags, ledgerSetFloors } from './focusPolicy.js';
import { isoWeek } from '../util/isoWeek.js';
// R6d-b (2026-06-11) — the curated lumbar-hinge name lists, shared with the
// cross-day dedup so the in-session pairing rule never drifts from it. Import is
// cycle-safe: lumbarDedup → frequencySplit → (constants, focus) only.
import { LUMBAR_HINGES, BACK_EXTENSION_FAMILY } from './schedule/scheduleAdapter/lumbarDedup.js';

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
// BEGINNER session-size cap (dp_beginner_session_size_v1, ctx.beginnerSessionSize).
// The elite-coach rubric wants a NOVICE at <=4-5 exercises/session (compound-first,
// few patterns mastered); the /10 eval docked the beginner for 8/session on EVERY
// config. When ctx.beginnerSessionSize is a number (the getDailyWorkout seam resolves
// 5 for a beginner under the flag), it is the EFFECTIVE session-size cap used IN PLACE
// OF SESSION_SIZE for this build — the fill loop targets it, the guarantees' ADD
// branch is bounded by it (a major is COVERED via a chosen compound's primary/
// secondary rather than forcing a separate slot above the cap), and the focus still
// leads (>=2 focus slots). Null/absent (flag OFF / non-beginner / pure-fn callers) →
// SESSION_SIZE (8) → byte-identical.
const FOCUS_MIN_SLOTS_BEGINNER = 2;
// BEGINNER weekly per-muscle band CEILING (sets/week), dp_beginner_session_size_v1
// refine 2026-06-14. The 5-slot cap concentrated the focus into ~2 slots/day; ×3-5
// days the focus muscle's WEEKLY delivered sets overshot the beginner band (the eval
// judge: "back 18 + shoulders 16 handed to a 19yo NOVICE is advanced-volume territory
// far above the beginner band"). The fix sizes the per-session FOCUS slot budget so
// the focus's WEEKLY delivered sets land IN the novice band (~8-12) instead of scaling
// unbounded with frequency: maxFocusSlotsThisSession = clamp(floor(CEIL / (focus
// sessions/week × nominal sets/slot)), 1, FOCUS_MIN_SLOTS_BEGINNER). At freq-2 (focus
// trained ~2×/wk) this stays 2 (the in-band freq-2 WINS are preserved); at freq-3+
// (focus trained 3-5×/wk) it drops to 1 focus slot/day so the week stays ~9-14, not
// 18-20. Nominal sets/slot ≈ DEFAULT_SETS (a beginner compound floors at ~3); the real
// per-exercise sizing varies, so the band is a slot-side guide, not an exact ledger.
const BEGINNER_WEEKLY_BAND_CEILING = 12;
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
// §beginner-volume-v2 — a BEGINNER's EMPHASIZED-group ISOLATION per-exercise set
// ceiling (applied as a FINAL clamp at the end of buildSession, after the cross-day
// ledger delt-quota floor that would otherwise re-raise them). The focus signature
// (shoulders/back/v-taper) legitimately surfaces press + lateral + rear (+ a
// cross-day 2nd rear) on each of the 2 days the split trains the emphasized muscle —
// those SLOTS are a focus contract we keep. But the budget-share rounding + the delt
// quota handed several of those isolations 3 sets, stacking the muscle to ~20 weekly
// (above the ~10-14 beginner emphasized band). A novice's accessory isolation grows
// fine at 2 sets (MEV) — the EXTRA 3rd set is junk volume on a small head. Clamp a
// beginner's emphasized-group ISOLATIONS to 2; the COMPOUND anchor (press/row) is
// untouched, and an ISOLATION-ONLY emphasized group (biceps/triceps/calves) is EXEMPT
// so the arms/calves emphasis stays ABOVE its MEV. Gated on the v2 flag; OFF → the
// normal emphasized isolation band → byte-identical.
const BEGINNER_EMPHASIS_ISOLATION_MAX_SETS = 2;
// LOW-CAPACITY weekly-band CLAMP (dp_lowcap_weekly_band_v1, 2026-06-14). The eval
// judge docked MAINTENANCE-goal + OLDER (age >=60) personas because their weekly
// volume scaled LINEARLY with frequency: p9 (Cristina, 34F, mentenanta, 35-min cap)
// rose to ~67 total at freq-7; p10 (Maria, 65F, mentenanta, incepator) to ~71 at
// freq-5 — "over-prescribed for a maintenance/older trainee". An elite coach holds a
// maintenance/older trainee's weekly volume NEAR its band regardless of training
// days: extra days = LIGHTER sessions, not more total volume. Generalizes the
// Cycle-15 BEGINNER focus weekly-band clamp to ALL trained muscles for these personas.
// For a PRIMARY MOVER cap each muscle's per-session DELIVERED sets to its band ceiling
// floor(perMuscleCeiling / sessionsTrainingThatMuscle) (>= MEV) so its WEEKLY sum lands
// in the maintenance band irrespective of frequency (a 2-session major → ~2/session →
// ~4-6/wk; a 1-session major → the ceiling). For an OVER-COUNTED ACCESSORY (biceps/
// triceps/forearms/shoulders, whose structural session count over-estimates realized
// exposures) hold its CONCENTRATED day at exactly the maintenance dose so its single
// realized exposure stays >= the floor (not crushed to MEV by the inflated divisor). Trim
// the group's HIGHEST-set exercise first toward MEV (2); when a muscle still over-shoots
// with every slot at MEV (a high-frequency split packed it into many 2-set slots), DROP
// the lowest-priority extra slot, never the muscle's only slot (no orphan). Maintenance
// legitimately sits BELOW growth-MEV (the judge accepts ~4-6 sets/muscle for a time-
// capped maintenance trainee). The high-frequency consecutive-days structure (a muscle
// trained 4-5x at MEV) is a FREQUENCY reshape, out of this fix's scope — p9 6-7d improves
// from volume but does not fully reach the band. Gated on ctx.lowCapWeeklyBand (the
// getDailyWorkout seam sets it only for goal mentenanta / age >=60 under the flag) →
// null → no-op → byte-identical.
const LOWCAP_MAINT_FLOOR = 4;       // per-MUSCLE WEEKLY maintenance minimum (judge-accepted)
const LOWCAP_PER_SESSION_MEV = 2;   // per-EXERCISE / per-session MEV (never trim a slot below this)
// FOCUS exemption ceiling for the low-cap weekly-band clamp (dp_lowcap_weekly_band_v1
// two-tier refine, 2026-06-14). A maintenance/older trainee WITH a focus still emphasizes
// that focus — it must LEAD / be the week's signature — just at a modest overall volume.
// The flat perMuscleCeiling (~5) clamped the FOCUS muscle to the NON-focus maintenance
// band too, destroying the signature (the judge's "focus muscle not emphasized" cap: p9
// v-taper back→4, p9 chest→clamped). So the FOCUS / emphasized-region muscles (the band's
// emphasizedGroups — for v-taper BOTH umeri AND spate) get a HIGHER ceiling so the focus
// stays EMPHASIZED and clearly LEADS, while still WELL below hypertrophy-MAV (maintenance-
// with-a-focus, not a growth block). Non-focus muscles keep perMuscleCeiling → drop to
// maintenance, bounding total. 11: a 2-session focus → floor(11/2)=5/session → ~10/wk
// (leads, vs non-focus ~4-5), a 1-session focus → ~11/wk — both modest, total stays bounded.
const LOWCAP_FOCUS_CEILING = 11;    // per-MUSCLE WEEKLY ceiling for FOCUS / emphasized groups
const LOWCAP_FOCUS_PER_SESSION_MIN = 3; // per-SESSION focus floor (> non-focus MEV 2 → focus leads)
// ACCESSORY RO groups whose STRUCTURAL weekly session count OVER-counts their realized
// exposures: they are weight-map keys of several clusters (upper/pull/push count
// biceps/triceps/shoulders) but only earn a real slot on ONE concentrated arm/shoulder
// day (their small cluster-weight rounds them out of the others). Dividing the ceiling
// by the inflated structural count would crush a single realized exposure to MEV (biceps
// trained truly once → 2/wk). So when one of these groups is CONCENTRATED in a session
// (≥2 slots = its primary day), the clamp protects it at the full maintenance dose
// instead of the divisor floor. The PRIMARY MOVERS (chest/back/quads/hams/glutes/calves/
// core) ARE slotted every counted day, so their session count is realized accurately and
// they correctly divide (a 2x major lands ~4-6 weekly, light per day) — never protected.
const LOWCAP_OVERCOUNTED_ACCESSORIES = new Set(['biceps', 'triceps', 'antebrate', 'umeri']);

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
//
// CAPPED 6 → 4 (Daniel focus-sweep verdict 2026-06-11). The sweep (8 focuses ×
// 1-7 days) surfaced 5-set anchors everywhere the emphasis fired (Smith OHP 5×2
// days = 10/wk vertical press on v-taper/shoulders; Close-Grip Bench 5) and his
// coach verdict was consistent across every focus: an emphasized lift carries
// 3-4 working sets, and the SURPLUS budget belongs in a SECOND variation/angle
// (3+2), not in a 5th-6th set of the same movement (his shoulders band: press
// 6-8/wk total). With the floor below at 4 the emphasized anchor is now PINNED
// at 4 — visibly above the balanced 3, never a 5-6-set monolith. (The
// non-emphasized COMPOUND_MAX_SETS stays 5 — a legacy band the unemphasized
// budget rarely reaches; emphasis concentrates into MORE VARIATIONS, not more
// sets per lift.)
const COMPOUND_MAX_SETS_EMPHASIZED = 4;
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
//
// CAPPED 5 → 4 (Daniel focus-sweep verdict 2026-06-11). The 5-set isolation was
// the sweep's clearest smell: Reverse Pec Deck 5× on a 1-day UPPER ("absurd"),
// Cable OH Triceps 5×, Hip Abduction 5× on generic lower. His rule: an isolation
// is 2-3 sets, 4 tolerable when slots are scarce — five sets of one isolation
// never; split across two angles instead (OH triceps 3 + pressdown 2). 4 still
// clears the arms-band math D3 fixed (1-2 curls × 3-4 sets × days ≥ band floor).
const ISOLATION_MAX_SETS_EMPHASIZED = 4;
// REAR-DELT dose cap (Daniel sweep verdict follow-up 2026-06-12 "RevPecDeck 4 →
// 2-3 + lateral"). The rear delt is a SMALL short-ROM head: even under a shoulder
// focus, a 4th set of one rear-delt isolation is junk volume — his rule keeps the
// fly-family at 2-3 and lets the LATERAL carry the emphasized 4th set (it reaches
// 4 through its own share + the emphasized isolation ceiling above). Plain band
// (3) already caps non-focus days, so this only bites the emphasized raise.
const REAR_DELT_ISOLATION_MAX_SETS = 3;
// The rear-delt isolation family (mirrors exerciseChains rear-delt chain): pec-deck
// reverse, rear-delt flys, face pulls, pull-aparts. Name-match is on the canonical
// EN engine names the session carries.
const REAR_DELT_ISOLATION_RE = /rear delt|reverse pec deck|face pull|pull-apart/i;

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
function distributeGroupSets(exsInGroup, budget, state, fatigueAdjustFn, emphasized, trimFn, novice, anchorProtect, structuralDemotes, emphasizedCeiling) {
  const n = exsInGroup.length;
  if (n === 0) return [];
  // R6d-b structural demote (Daniel focus-sweep review 2026-06-11): an exercise
  // the week-structure demoted (a REPEAT-day heavy hinge — lumbarDedupPenalties)
  // that still made the session must train LIGHT: it loses anchor status (no
  // emphasized floor/protection) and clamps to the PLAIN isolation band (2-3
  // sets, never the emphasized raise) — "the second weekly hinge exposure is
  // light", never RDL 4 sets × 3 days. Null/absent → byte-identical.
  const isDemoted = (e) =>
    !!structuralDemotes && typeof e.name === 'string' && structuralDemotes.has(e.name);
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
  // A structurally-demoted compound (repeat-day hinge) weighs like an isolation —
  // the budget concentrates on the day's CLEAN movers instead.
  const COMPOUND_WEIGHT = 2;
  const ISOLATION_WEIGHT = 1;
  const weightOf = (e) => (e.tier === COMPOUND_TIER && !isDemoted(e) ? COMPOUND_WEIGHT : ISOLATION_WEIGHT);
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
  // CONCENTRATION CAP (Daniel sweep verdict 2026-06-11). The emphasized per-exercise
  // ceiling (4) applies whenever the group is the user's FOCUS — NOT only when the
  // volume boost fires. When an emphasized group is already AT/above MAV the boost
  // path is disabled (no headroom), but WITHOUT this its compound reverted to the
  // legacy ceiling 5 → his exact complaint: v-taper 4d Smith OHP 5 × 2 days = 10/wk.
  // Capping at 4 regardless of headroom spreads the surplus to a 2nd variation /
  // isolation (umeri 5/3/3 → 4/4/4), never a 5-6-set monolith. The FLOOR boost stays
  // headroom-gated (emphasizeRecovered). emphasizedCeiling false (non-focus group /
  // flag off) → the legacy 5 ceiling (byte-identical).
  const emphCeil = emphasized || emphasizedCeiling;
  const compoundCeiling = emphCeil ? COMPOUND_MAX_SETS_EMPHASIZED : COMPOUND_MAX_SETS;
  const anchorIdx = emphasizeRecovered
    ? exsInGroup.findIndex((e) => e.tier === COMPOUND_TIER && !isDemoted(e))
    : -1;
  // #70-D3 — an emphasized RECOVERED group raises its ISOLATION ceiling too, so a
  // SMALL isolation-only group (biceps/triceps — no compound in the library) can
  // reach the band on its direct arm work instead of being capped at 3 sets/lift.
  // The compound-band raise above is inert for these groups (no tier-1 anchor);
  // this is the lever that delivers the arms-emphasis +sets. Non-emphasized /
  // non-recovered → the normal [2,3] band (byte-identical).
  // Isolation ceiling rises to 4 for a focus group too — so the surplus shaved off
  // the capped compound (5→4) lands on a 2nd isolation instead of being lost.
  const isolationCeiling = (emphasizeRecovered || emphasizedCeiling) ? ISOLATION_MAX_SETS_EMPHASIZED : ISOLATION_MAX_SETS;

  // R4 anchor-protective shave (dp_anchor_sets_v1 via ctx.anchorProtect, Daniel
  // coach audit 2026-06-10): on a NON-RECOVERED group the 1-set shave + lowered
  // floor exempt the ANCHOR (first tier-1 compound) — the main lift keeps its
  // fresh 3-set floor and the lighter day is carried by the accessories (the
  // anchor's spared set is re-shaved from the BACK of the group so the group
  // total is preserved). OFF / recovered → protectIdx -1 → byte-identical.
  const protectIdx = anchorProtect === true && nonRecovered
    ? exsInGroup.findIndex((e) => e.tier === COMPOUND_TIER && !isDemoted(e))
    : -1;
  const counts = exsInGroup.map((e, i) => {
    // A structurally-demoted compound is banded as an ISOLATION (plain band — it
    // never takes the emphasized raise): the repeat-day hinge trains 2-3 light.
    const isCompound = e.tier === COMPOUND_TIER && !isDemoted(e);
    const share = (budget * weightOf(e)) / totalWeight;
    const isProtected = i === protectIdx;
    const rounded = Math.round(share) - (isProtected ? 0 : setShave) + adjustOf(e);
    // Anchor compound of an emphasized recovered group floors higher (visible +sets).
    const cFloor = i === anchorIdx ? COMPOUND_MIN_SETS_EMPHASIZED
      : isProtected ? freshCompoundFloor : compoundFloor;
    const lo = isCompound ? cFloor : ISOLATION_MIN_SETS;
    // Rear-delt fly-family isolations never take the emphasized 4th set (junk
    // volume on a small head — Daniel "2-3 + lateral"); the lateral still earns
    // the raised ceiling through its own share.
    const isoCeil = typeof e.name === 'string' && REAR_DELT_ISOLATION_RE.test(e.name)
      ? Math.min(REAR_DELT_ISOLATION_MAX_SETS, isolationCeiling)
      : isolationCeiling;
    const hi = isCompound ? compoundCeiling : (isDemoted(e) ? ISOLATION_MAX_SETS : isoCeil);
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
 * dp_accessory_rotation_v1 — ISO-week PARITY from the existing rotationSeed.
 *
 * The live seed is `${uid}|${getWeekStartIso(date)}|${dayIdx}` (getDailyWorkout):
 * the middle field is the week-start ISO date (Monday, YYYY-MM-DD). We map that date
 * to its ISO week (isoWeek → 'YYYY-Www') and return the week NUMBER's parity (even→0,
 * odd→1). Using the WEEK (not the raw seed hash) is what makes the rotation move
 * exactly once per calendar week — every day of the same week shares the parity, and
 * consecutive weeks flip it, so a mature account's equal-ish accessories alternate
 * week-to-week (the whole point). DETERMINISTIC: a pure function of the seed string,
 * never Date.now(). Returns null when the seed has no parsable 'YYYY-MM-DD' week field
 * (pure-fn callers pass arbitrary seeds like 'pain-demote-seed') → no rotation.
 *
 * @param {unknown} rawSeed - ctx.seed (expected `uid|weekStartIso|dayIdx`)
 * @returns {0|1|null} ISO-week parity, or null when the week field is unparsable
 */
function weekParityFromSeed(rawSeed) {
  if (typeof rawSeed !== 'string' || rawSeed.length === 0) return null;
  const parts = rawSeed.split('|');
  // The week field is the middle segment; require the YYYY-MM-DD shape so an arbitrary
  // test seed (no '|', or a non-date middle) yields null rather than a bogus parity.
  const weekField = parts.length >= 2 ? parts[1] : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekField)) return null;
  let week;
  try {
    week = isoWeek(weekField); // 'YYYY-Www'
  } catch {
    return null;
  }
  const m = /-W(\d{2})$/.exec(week);
  if (!m) return null;
  return (Number(m[1]) % 2 === 0 ? 0 : 1);
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
 * @param {Record<string, number>|null} [structuralPenalties] - R6d-b WEEK-STRUCTURE
 *   demotes (the lumbar repeat-day hinge spacing). Same demote-only semantics as
 *   `penalties` with ONE deliberate difference: they apply to PR-history lifts too —
 *   the whole point is spacing the user's OWN heavy logged hinge (Daniel sweep
 *   review 2026-06-11: his logged RDL sailed through the repeat-hinge-day demote via
 *   the PR exemption → RDL heavy 3×/week on a lower-focus week). Never a drop.
 * @param {boolean} [accessoryRotation] - dp_accessory_rotation_v1. When true the
 *   FINAL ordered pool runs rotateAccessoryHead: among the TOP isolation (tier>1)
 *   candidates, when the first two are score-equal-ish AND BOTH carry PR/log history,
 *   their order alternates on the ISO-week parity (weekParity) — so a mature account
 *   (everything logged → PR-stickiness made every week identical) alternates its
 *   logged accessories week-to-week while ANCHORS (tier-1 compounds) repeat. Demote
 *   (refusal/structural) is preserved — a demoted lift is never a rotation candidate.
 *   Default falsy → no rotation → byte-identical pool order.
 * @param {0|1|null} [weekParity] - ISO-week parity (even→0, odd→1) derived from the
 *   EXISTING rotationSeed (ctx.seed = `uid|weekStartIso|dayIdx`) by buildSession, NOT
 *   Date.now(). Drives which of the two equal-ish logged accessories leads. Null /
 *   absent → no rotation (defensive: a caller without a parsable week seed).
 * @param {Set<string>|null} [progressingNames] - #42 PROGRESSION-CONDITIONED selection
 *   bonus (dp_progression_bonus_v1). When the tier-select score model is active, a
 *   candidate the user is DEMONSTRABLY progressing on (dp/progressionSignal) earns the
 *   bounded RECENT_PROGRESS_BONUS (+5) — strictly SMALLER than a selection band (20),
 *   so an ACTIVE logged progression edges ahead of an equal-band sidegrade WITHOUT
 *   jumping a band (the Cable Curl 23→27→32 keeps its slot). CONDITIONAL by design:
 *   only progressing lifts qualify, never every logged lift (a blanket bonus was
 *   measured to tank cohort convergence — exerciseTierRank §hasLog). Null/empty (flag
 *   OFF / pure-fn callers) → no progression term → byte-identical scoring.
 * @param {boolean} [intraWeekRotation] - dp_rotation_intraweek_v1. When true the FINAL
 *   ordered pool runs rotateIntraWeekHead (BEFORE the cross-week rotateAccessoryHead):
 *   among the TOP equal-ish UNLOGGED isolations (tier>1, NOT in prNames, NOT demoted) it
 *   rotates which variant leads by the TRAINING-DAY ORDINAL within the week
 *   (intraWeekDayOrdinal), so ADJACENT training days surface a DIFFERENT equivalent-role
 *   sibling of the same family. UNLOGGED-only by design (a logged isolation is a DP anchor
 *   → stays); the demote (refusal/structural) stays stronger; no equivalent → the repeat
 *   stays. Operates on a DISJOINT set from rotateAccessoryHead (unlogged vs logged), so the
 *   two never interact. Default falsy → no rotation → byte-identical pool order.
 * @param {number|null} [intraWeekDayOrdinal] - 0-based ordinal of TODAY among the active
 *   training days of the week (the SAME `position` clusterForDay computes: count of active
 *   days before dayIdx), derived by buildSession's caller from the active-week split — NOT
 *   Date.now(). Drives which equal-ish unlogged variant leads so consecutive ordinals
 *   differ. Null/absent (flag off / pure-fn callers) → no intra-week rotation (defensive).
 * @returns {Array<{name: string, meta: object}>}
 */
export function poolForGroup(group, available, maxTier, maxSkill, prNames, seed, penalties, painSwaps, excludedMovements, danielTierSelect, structuralPenalties, accessoryRotation, weekParity, progressingNames, intraWeekRotation, intraWeekDayOrdinal) {
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
    // PROGRESSION-CONDITIONED bonus (#42, dp_progression_bonus_v1): a logged lift the
    // user is DEMONSTRABLY progressing on (progressingNames, dp/progressionSignal) adds
    // the bounded RECENT_PROGRESS_BONUS (+5) on top of band+log — strictly smaller than
    // a band step (20), so an ACTIVE progression edges ahead of an equal-ish sidegrade
    // WITHOUT jumping a band (Cable Curl 23→27→32 keeps its slot; an unlogged-S still
    // beats a logged-A). CONDITIONAL by construction — a stagnant logged lift is NOT in
    // the set, so this is NOT the blanket raise that tanked cohort convergence
    // (exerciseTierRank §hasLog). Null/empty set → progressing=false → byte-identical.
    const isProgressing = (name) => !!progressingNames && progressingNames.has(name);
    const scoreOf = (name) =>
      tierSelectScore(name, { hasLog: prNames.has(name), progressing: isProgressing(name) });
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
  // sibling leads. PR-history lifts (continuity) are NEVER demoted by the SOFT
  // (pain/skip/refusal) channel. Nothing is dropped — the penalized exercise is
  // still selectable if it is the only option (the downstream slot-fill can still
  // reach it). Empty/absent penalties → the partition is a no-op → byte-identical.
  //
  // R6d-b STRUCTURAL channel (2026-06-11): week-structure demotes (lumbar repeat-
  // day spacing) PIERCE the PR exemption by design — the heavy hinge they space is
  // precisely the user's logged lift. Same demote-only partition, never a drop.
  let ordered = core;
  if (penalties || structuralPenalties) {
    const PENALTY_DEMOTE = 0.5; // ≥ → demote (a single skip/mild pain stays in place)
    const clean = [];
    const demoted = [];
    for (const e of ordered) {
      const soft = prNames.has(e.name) ? 0 : (penalties?.[e.name] ?? 0);
      const structural = structuralPenalties?.[e.name] ?? 0;
      (Math.max(soft, structural) >= PENALTY_DEMOTE ? demoted : clean).push(e);
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

  // dp_accessory_rotation_v1 — ANCHOR/ACCESSORY rotation (Daniel "monotonia tampa"
  // 2026-06-11). On a MATURE account everything is logged, so PR-stickiness made
  // every program identical week-to-week. Policy: ANCHORS repeat (tier-1 compounds +
  // the lifts the user progresses on), ACCESSORIES rotate (tier 2-3 isolations). This
  // is the FINAL step on the fully-ordered pool: it alternates the two top equal-ish
  // LOGGED isolations on the ISO-week parity. It runs LAST (after the tier-select sort
  // AND the penalty/structural demote partition) so a refusal/structural demote — by
  // construction already at the BACK of `ordered` — is never a rotation candidate; the
  // demote stays strictly stronger than the rotation (a refused lift can NOT return via
  // rotation before its half-life decays it back under the 0.5 cutoff). OFF (falsy
  // flag / null parity / pure-fn callers) → no reorder → byte-identical.
  // dp_rotation_intraweek_v1 — INTRA-WEEK isolation rotation (isolation-rotation arc
  // 2026-06-12). Extends the SAME anchor/accessory philosophy to the WITHIN-week
  // dimension: adjacent training days repeat the same UNLOGGED isolations (the sweep's
  // "repetate adiacent" info signals). Policy (founder-approved): ANCHORS repeat (logged
  // DP-tracked lifts + tier-1 compounds — DP continuity needs them stable), UNLOGGED
  // isolations of equal-ish standing VARY on adjacent days. This runs on the fully-
  // ordered pool BEFORE the cross-week rotateAccessoryHead, on a DISJOINT candidate set
  // (UNLOGGED here vs LOGGED there) so the two rotations never fight: the unlogged head
  // intra-week step surfaces is invisible to the logged-pair cross-week step. The demote
  // partition already moved a refused/structural lift to the BACK, so (like the cross-week
  // step) a demote is never a rotation candidate. OFF (falsy flag / null ordinal / pure-fn
  // callers) → no reorder → byte-identical.
  if (intraWeekRotation && typeof intraWeekDayOrdinal === 'number' && intraWeekDayOrdinal >= 0) {
    ordered = rotateIntraWeekHead(ordered, {
      dayOrdinal: intraWeekDayOrdinal, seed, prNames, penalties, structuralPenalties, danielTierSelect,
    });
  }
  if (accessoryRotation && (weekParity === 0 || weekParity === 1)) {
    return rotateAccessoryHead(ordered, {
      weekParity, seed, prNames, penalties, structuralPenalties, danielTierSelect,
    });
  }
  return ordered;
}

// dp_accessory_rotation_v1 — "equal-ish" rank threshold. Under danielTierSelect (the
// live default) the pool is scored by tierSelectScore: a one-BAND gap is 20 pts
// (S100→A80), a PR/log bonus is +10 (HAS_LOG_BONUS). Two candidates are rotatable
// only when they are the SAME selection band — i.e. the score delta is driven solely
// by the (≤10) log bonus, NEVER by a band difference. Threshold = HAS_LOG_BONUS so a
// same-band pair (real delta 0 once BOTH are logged, the rule's precondition) rotates
// while a cross-band pair (≥20) does not: rotation only ever swaps options the coach
// rates QUALITATIVELY EQUIVALENT, never trades a better lift for a worse one. On the
// legacy (flag-OFF) ordering the pool is rank()-banded; there the same-rank head is
// already adjacent so the threshold is applied on the band score (0 within a rank).
const ROTATION_SCORE_EPSILON = HAS_LOG_BONUS;

/**
 * Selection score used to judge "equal-ish" for rotation. Mirrors the score the
 * pool was SORTED by so the rotation never disagrees with the ordering: the Daniel
 * tier-select score when that path is on, else the legacy commonness rank() mapped
 * to a higher-is-better scale (so two same-rank lifts read as a 0 delta).
 * @param {string} name
 * @param {Set<string>} prNames
 * @param {boolean} danielTierSelect
 * @returns {number} higher = preferred (same scale as the active sort)
 */
function rotationScoreOf(name, prNames, danielTierSelect) {
  return danielTierSelect
    ? tierSelectScore(name, { hasLog: prNames.has(name) })
    : -rank(name, prNames); // legacy: lower rank = better → negate so higher = better
}

/**
 * ANCHOR/ACCESSORY rotation head-swap (dp_accessory_rotation_v1).
 *
 * Operates ONLY on the very front of the already-ordered pool. Finds the first two
 * ISOLATION (tier > 1) entries; if they are score-equal-ish (|Δ| <= ROTATION_SCORE_
 * EPSILON), BOTH carry PR/log history (the user actually trains both — so each
 * progresses on its OWN history in the weeks it leads, exactly what a coach does),
 * and NEITHER is a demote candidate (refusal/structural penalty ≥ the 0.5 cutoff, or
 * a structural demote at any level), then their relative order ALTERNATES on the ISO-
 * week parity: even weeks keep A→B, odd weeks swap to B→A. Deterministic (parity is a
 * pure function of the existing seed). Never touches a tier-1 ANCHOR, a single
 * candidate, a demoted lift, or anything past the head pair. A pure, allocation-light
 * reorder (swaps two array slots at most); returns a new array so `ordered` is intact.
 *
 * NOTE on focus REQUIREMENTS: the focus-policy resolver runs AFTER selection on the
 * `chosen` list and injects its own required slots from the pool, so rotation never
 * creates a ping-pong with it — rotation only reorders equal-ish siblings the focus
 * is indifferent between (a focus that REQUIRES a specific tag injects that exercise
 * regardless of which equal-ish sibling rotation surfaced first).
 *
 * @param {Array<{name: string, meta: object}>} ordered - the fully-ordered pool
 * @param {{weekParity: 0|1, seed: number, prNames: Set<string>,
 *   penalties: Record<string, number>|null, structuralPenalties: Record<string, number>|null,
 *   danielTierSelect: boolean}} ctx
 * @returns {Array<{name: string, meta: object}>}
 */
function rotateAccessoryHead(ordered, ctx) {
  if (!Array.isArray(ordered) || ordered.length < 2) return ordered;
  const { weekParity, prNames, penalties, structuralPenalties, danielTierSelect } = ctx;
  const DEMOTE = 0.5; // SAME cutoff the penalty partition uses — keep in lock-step.
  // A lift is rotation-eligible only if it is NOT demoted. Refusal/skip/pain ride
  // `penalties` (PR-exempt — a logged lift's soft penalty is 0 there too, mirroring
  // the partition), structural (lumbar) demotes pierce the PR exemption → both checked
  // at the SAME ≥0.5 cutoff so the rotation candidate set never includes a back-of-pool
  // demote (the demote stays strictly stronger than the rotation).
  const isDemoted = (name) => {
    const soft = prNames.has(name) ? 0 : (penalties?.[name] ?? 0);
    const structural = structuralPenalties?.[name] ?? 0;
    return Math.max(soft, structural) >= DEMOTE;
  };
  // Find the FIRST TWO ISOLATION (tier>1) entries in pool order — i.e. the literal
  // TOP of the accessory band ("the first two candidates"). We do NOT skip past a
  // better-ranked isolation to find a logged one: if the top isolation is an UNLOGGED
  // sidegrade it leads on its quality and there is nothing to alternate (the rule is
  // "the top two are equal-ish AND BOTH logged"). The eligibility checks (both logged,
  // neither demoted, equal-ish) are then applied to exactly that head pair.
  let iA = -1;
  let iB = -1;
  for (let i = 0; i < ordered.length; i++) {
    if ((ordered[i].meta?.tier ?? 2) <= COMPOUND_TIER) continue; // skip tier-1 anchors
    if (iA === -1) { iA = i; continue; }
    iB = i;
    break;
  }
  if (iA === -1 || iB === -1) return ordered; // <2 isolations (single candidate) → no rotation
  const a = ordered[iA];
  const b = ordered[iB];
  // BOTH top isolations must be LOGGED (the user trains both → each progresses on its
  // own history in its weeks) and NEITHER demoted (refusal/structural stays stronger).
  if (!prNames.has(a.name) || !prNames.has(b.name)) return ordered;
  if (isDemoted(a.name) || isDemoted(b.name)) return ordered;
  const sA = rotationScoreOf(a.name, prNames, danielTierSelect);
  const sB = rotationScoreOf(b.name, prNames, danielTierSelect);
  if (Math.abs(sA - sB) > ROTATION_SCORE_EPSILON) return ordered; // not equal-ish → keep quality order
  // Even week → keep the sorted lead (A first); odd week → swap so B leads. Only the
  // two head slots move; everything else (incl. the rest of the family, which the
  // movement-dedup will collapse anyway) keeps its position.
  if (weekParity === 0) return ordered;
  const out = ordered.slice();
  out[iA] = b;
  out[iB] = a;
  return out;
}

/**
 * INTRA-WEEK isolation rotation head-swap (dp_rotation_intraweek_v1, isolation-rotation
 * arc 2026-06-12).
 *
 * Sibling of rotateAccessoryHead, one dimension over: that step rotates the top two
 * equal-ish LOGGED isolations CROSS-week (binary ISO-week parity); THIS step rotates the
 * top equal-ish UNLOGGED isolations WITHIN the week so ADJACENT training days surface a
 * DIFFERENT equivalent-role variant of the same family. The two are disjoint by
 * construction — logged vs unlogged — so they never compete for the same head.
 *
 * Mechanism: find the FIRST UNLOGGED isolation (tier>1, NOT in prNames, NOT demoted) in
 * pool order — the literal top of the rotatable-accessory band — then gather the run of
 * subsequent isolations that are ALSO unlogged + undemoted + score-EQUAL-ISH to that head
 * (|Δ| <= ROTATION_SCORE_EPSILON, the SAME equal-ish notion accessoryRotation uses). Those
 * are the interchangeable equivalent-role candidates (same group + slot role; the pool sort
 * already grouped same-band siblings adjacently, and the round-robin + movementKey dedup
 * collapse the family to ONE slot, so whichever leads fills it). The candidate at
 * (dayOrdinal mod k) is rotated to the FRONT of the group, the rest keep relative order —
 * a deterministic cyclic shift by the training-day ordinal, so consecutive training days
 * (ordinal d, d+1) lead with consecutive variants (the adjacent-day variety). Only those
 * equal-ish unlogged SLOTS are permuted; anchors (tier-1 / logged), demoted lifts, and any
 * lower-ranked candidate keep their positions.
 *
 * NEVER rotates when: <2 equal-ish unlogged candidates exist (a single option / a logged
 * anchor head → the repeat STAYS, never forcing a worse lift); the head is logged (DP
 * continuity — a logged isolation is an anchor); a candidate is demoted (refusal/structural
 * stays strictly stronger — the demote partition already sank it to the back, exactly as in
 * rotateAccessoryHead). A pure, allocation-light reorder; returns a new array so `ordered`
 * is intact. Like the cross-week step it only reorders equal-ish siblings the focus is
 * indifferent between — a focus REQUIREMENT injects its specific tag regardless (the
 * resolver runs AFTER selection on `chosen`), so this never ping-pongs the contracts.
 *
 * @param {Array<{name: string, meta: object}>} ordered - the fully-ordered pool
 * @param {{dayOrdinal: number, seed: number, prNames: Set<string>,
 *   penalties: Record<string, number>|null, structuralPenalties: Record<string, number>|null,
 *   danielTierSelect: boolean}} ctx
 * @returns {Array<{name: string, meta: object}>}
 */
function rotateIntraWeekHead(ordered, ctx) {
  if (!Array.isArray(ordered) || ordered.length < 2) return ordered;
  const { dayOrdinal, prNames, penalties, structuralPenalties, danielTierSelect } = ctx;
  if (!Number.isFinite(dayOrdinal) || dayOrdinal < 0) return ordered;
  const DEMOTE = 0.5; // SAME cutoff the penalty partition + rotateAccessoryHead use.
  const isDemoted = (name) => {
    const soft = prNames.has(name) ? 0 : (penalties?.[name] ?? 0);
    const structural = structuralPenalties?.[name] ?? 0;
    return Math.max(soft, structural) >= DEMOTE;
  };
  // A rotatable candidate is an UNLOGGED isolation (tier>1) that is not demoted. Logged
  // isolations are anchors (DP continuity) and are excluded — so this set is disjoint from
  // rotateAccessoryHead's logged set.
  const eligible = (e) =>
    (e.meta?.tier ?? 2) > COMPOUND_TIER && !prNames.has(e.name) && !isDemoted(e.name);

  // Group the eligible candidates by EQUIVALENT ROLE = movementKey (muscle_target_primary +
  // movement-pattern token). A lateral and a rear-delt fly are both unlogged umeri
  // isolations but DIFFERENT roles (umeri::lateral-raise vs umeri::rear-delt), so swapping
  // one for the other is NOT an equivalent-role variation — only same-role siblings rotate.
  // This matches the round-robin, which collapses a family to ONE slot by exactly this key,
  // so each role's slot varies independently across adjacent days (e.g. the lateral slot
  // AND the rear-delt slot both rotate, not just whichever isolation leads the pool).
  // Walk in pool order so each role's "lead" is its highest-ranked member (the sorted head),
  // and equal-ish is judged against that lead.
  /** @type {Map<string, number[]>} role movementKey → candidate indices (pool order) */
  const roleSlots = new Map();
  for (let i = 0; i < ordered.length; i++) {
    const e = ordered[i];
    if (!eligible(e)) continue;
    const key = movementKey(e.name, e.meta);
    const arr = roleSlots.get(key);
    if (arr) arr.push(i);
    else roleSlots.set(key, [i]);
  }
  if (roleSlots.size === 0) return ordered; // no unlogged isolation → nothing to rotate

  let out = null; // lazily cloned on the first actual swap (else byte-identical return)
  for (const indices of roleSlots.values()) {
    // The role's lead is its first (highest-ranked) member; keep only the equal-ish run.
    const leadName = ordered[indices[0]].name;
    const leadScore = rotationScoreOf(leadName, prNames, danielTierSelect);
    const slots = indices.filter(
      (idx) => Math.abs(rotationScoreOf(ordered[idx].name, prNames, danielTierSelect) - leadScore) <= ROTATION_SCORE_EPSILON,
    );
    const k = slots.length;
    if (k < 2) continue; // a single equal-ish equivalent → no rotation (repeat stays)
    // Cyclic shift so the (dayOrdinal mod k)-th equal-ish variant leads; the rest keep
    // relative order — a stable rotation, so consecutive ordinals lead with consecutive
    // variants. ordinal aligning with the sorted lead (off 0) → this role is unchanged.
    const off = ((dayOrdinal % k) + k) % k;
    if (off === 0) continue;
    if (out === null) out = ordered.slice();
    const picks = slots.map((idx) => out[idx]);
    const rotated = picks.slice(off).concat(picks.slice(0, off));
    for (let j = 0; j < slots.length; j++) out[slots[j]] = rotated[j];
  }
  return out === null ? ordered : out;
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

// dp_selection_dedup_v1 — FINER sub-family dedup (Daniel, eval 2026-06-13). The
// base token list above has NO "bench" entry, so "Smith Machine Bench" / "Smith
// Incline Bench" match nothing → fall to a per-NAME unique key and slip past the
// in-session movement dedup: a PUSH/chest day pairs "Smith Machine Bench" (name-
// key) WITH "Flat Chest Press Machine" (piept::press) = TWO flat presses (the /10
// eval's "two of three slots are the same flat press"). Recognizing "bench" as a
// chest PRESS — and reusing the SAME incline/decline angle carve-out — collapses
// the two flat presses onto ONE piept::press slot, while a Smith INCLINE bench
// keys as piept::incline-press (a DISTINCT, complementary sub-family that is KEPT,
// so the freed slot fills with the in-pool incline = a SWAP, never a drop). Off →
// the base list only → byte-identical key. Single extra matcher (cheaper than
// re-deriving the whole list) appended ONLY when deepFamily is on.
const BENCH_TOKEN_RE = new RegExp('(?:^|[^a-z])bench(?:$|[^a-z])');

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
 * @param {boolean} [deepFamily=false] - dp_selection_dedup_v1: also resolve "bench"
 *   as a press sub-family (flat/incline/decline) so two flat presses can't co-occur.
 *   Default false → byte-identical to the pre-flag key (used by every NON-dedup
 *   consumer — rotation / squat-primacy / back-coverage — which stay unchanged).
 * @returns {string}
 */
export function movementKey(name, meta, deepFamily = false) {
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
  // dp_selection_dedup_v1 finer pass — a "bench" with no base-list token is a chest
  // press; honor the SAME angle split so a flat bench collapses with the flat press
  // and an incline/decline bench keys to its own complementary sub-family.
  if (deepFamily && BENCH_TOKEN_RE.test(lower)) {
    if (/(?:^|[^a-z])(incline|decline)(?:$|[^a-z])/.test(lower)) {
      return `${group}::${lower.includes('decline') ? 'decline' : 'incline'}-press`;
    }
    return `${group}::press`;
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
 *   selectionDedup?: boolean,
 *   danielTierSelect?: boolean,
 *   focusPolicy?: boolean,
 *   focusId?: string,
 *   daysPerWeek?: number,
 *   structuralPenalties?: Record<string, number>|null,
 *   lumbarPairDedup?: boolean,
 *   accessoryRotation?: boolean,
 *   rotationIntraWeek?: boolean,
 *   intraWeekDayOrdinal?: number|null,
 *   progressionBonus?: boolean,
 *   progressingNames?: Set<string>|null,
 *   focusLeadSplits?: {focus: string, nonFocusMevCeilings: Record<string, number>, sessionsPerGroup?: Record<string, number>, armSlotGuarantee?: boolean}|null,
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
  // BEGINNER session-size cap (dp_beginner_session_size_v1). When the seam resolves a
  // numeric ctx.beginnerSessionSize (5 for a beginner under the flag), it REPLACES the
  // SESSION_SIZE (8) ceiling for THIS build: the fill loop targets it and every
  // guarantee's ADD branch is bounded by it (the relax — a major rides a compound's
  // primary/secondary instead of forcing a separate slot above the cap). Floored at
  // minSession so the cap can never undercut the substance floor. Null/absent (flag
  // OFF / non-beginner / pure-fn callers) → SESSION_SIZE → byte-identical.
  const beginnerCap =
    typeof ctx?.beginnerSessionSize === 'number'
    && Number.isFinite(ctx.beginnerSessionSize)
    && ctx.beginnerSessionSize > 0
      ? Math.max(minSession, ctx.beginnerSessionSize)
      : null;
  const effectiveCap = beginnerCap ?? SESSION_SIZE;
  // Per-session exercise budget — from the weekly volume budget (not a fixed 6).
  const sessionSizeRaw = computeSessionExerciseCount(
    targets, ctx?.volumeTargets, ctx?.weeklySessionsPerGroup, minSession,
  );
  // The beginner cap also bounds the volume-derived count so the slot demand the cap
  // distributes never exceeds it (a high-frequency novice's budget otherwise sizes the
  // session at SESSION_SIZE before the cap trims). OFF → sessionSize === sessionSizeRaw.
  const sessionSize = Math.min(sessionSizeRaw, effectiveCap);
  const available = new Set(ctx?.equipment?.available ?? []);
  const maxTier = tierCeiling(ctx?.profileTier);
  const maxSkill = skillCeiling(ctx?.profileTier);
  const prNames = new Set(ctx?.prNames ?? []);
  const seed = hashString(String(ctx?.seed ?? ''));
  // dp_accessory_rotation_v1 — ISO-week parity for the anchor/accessory rotation,
  // derived from the EXISTING rotationSeed (ctx.seed = `uid|weekStartIso|dayIdx`, the
  // SAME string buildSession already hashes for selection — NOT Date.now()). The
  // middle field is the week-start ISO date (getWeekStartIso → Monday YYYY-MM-DD), so
  // weekParityFromSeed maps it to its ISO week then even→0 / odd→1. Null when the flag
  // is off OR the seed has no parsable week field (pure-fn callers like the unit tests
  // pass arbitrary seeds) → poolForGroup performs no rotation → byte-identical.
  const accessoryRotation = ctx?.accessoryRotation === true;
  const weekParity = accessoryRotation ? weekParityFromSeed(ctx?.seed) : null;
  // dp_rotation_intraweek_v1 — INTRA-WEEK isolation rotation. The training-day ordinal
  // WITHIN the week (0-based: the SAME `position` clusterForDay computes — count of active
  // days before today's dayIdx) is supplied by the caller (getDailyWorkout, which holds the
  // active-week split) via ctx.intraWeekDayOrdinal; it is NOT Date.now(). poolForGroup uses
  // it to rotate the top equal-ish UNLOGGED isolation by the ordinal so adjacent training
  // days vary. Off (flag absent) / no ordinal (pure-fn callers pass none) → null → no
  // intra-week rotation → byte-identical pool order.
  const intraWeekRotation = ctx?.rotationIntraWeek === true;
  const intraWeekDayOrdinal =
    intraWeekRotation && typeof ctx?.intraWeekDayOrdinal === 'number' && ctx.intraWeekDayOrdinal >= 0
      ? ctx.intraWeekDayOrdinal
      : null;
  // #8/D per-exercise pain/skip penalties (engineName → 0..1). Null/empty (the
  // common case + flag off) → poolForGroup order is byte-identical.
  const penalties = ctx?.exercisePenalties ?? null;
  // R6d-b structural (week-structure) penalties — the lumbar repeat-day demote.
  // Unlike pain/skip these apply to PR lifts too (poolForGroup) AND thread into
  // the set distribution: a demoted hinge that still makes the session (thin
  // pool / multi-slot group) trains LIGHT (isolation band) instead of anchoring
  // 4 sets — Daniel sweep review 2026-06-11 ("RDL heavy 1-2×/week, not 3").
  const structuralPenalties = ctx?.structuralPenalties ?? null;
  const structuralDemoteSet = structuralPenalties
    ? new Set(Object.keys(structuralPenalties).filter((n) => (structuralPenalties[n] ?? 0) >= 0.5))
    : null;
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
  // #42 PROGRESSION-CONDITIONED selection bonus (dp_progression_bonus_v1, default
  // OFF → null → no progression term → byte-identical scoring). When ON, the I/O
  // boundary (getDailyWorkout) computes the set of EN names the user is demonstrably
  // PROGRESSING on (dp/progressionSignal over DP.getLogs) and threads it here; a
  // candidate in the set earns the bounded +5 in poolForGroup's tier-select score
  // (never a band step). Gated on ctx.progressionBonus so the set is only consulted
  // when the flag is on (a stray set without the gate is ignored).
  const progressingNames = (ctx?.progressionBonus === true && ctx?.progressingNames instanceof Set)
    ? ctx.progressingNames
    : null;

  // EQUIPMENT-MEMORY hard exclusion (founder Busy/Missing redesign 2026-06-12,
  // dp_equipment_memory_v1). The SPECIFIC EN canonical exercise names the user
  // remembered as equipment-missing (in-session "Aparat lipsa" → confirm). A
  // NAME-level hard remove — distinct from the coarse equipment_type availability
  // gate (a missing Leg-Extension machine must drop ONLY Leg Extension, not the
  // whole `machine` bucket) and from the SOFT pain/refusal demote (those reorder;
  // this removes). Applied as a post-filter on each group's pool with the SAME
  // last-option guard the #81 / D-band hard removals use: never empty a muscle —
  // if every option for a group is remembered-missing, the originals are kept
  // (the user still gets a session; the in-session swap can move it). Empty set
  // (the common case + every sim) → the predicate is always false → byte-identical.
  const equipmentMissingSet = Array.isArray(ctx?.equipmentMissingNames)
    ? new Set(ctx.equipmentMissingNames.filter((n) => typeof n === 'string' && n.length > 0))
    : null;
  const dropEquipmentMissing = (pool) => {
    if (!equipmentMissingSet || equipmentMissingSet.size === 0) return pool;
    const kept = pool.filter((e) => !equipmentMissingSet.has(e.name));
    // Last-option guard — never hand back an empty group (round-robin would just
    // redistribute its slots, but keeping the originals is the conservative choice
    // matching the #81/D-band removals above).
    return kept.length > 0 && kept.length < pool.length ? kept : pool;
  };

  // Pools per target group (ordered: PR-anchored -> anchor -> new, seeded-stable).
  const pools = targets.map((g) => ({
    group: g,
    pool: dropEquipmentMissing(
      poolForGroup(g, available, maxTier, maxSkill, prNames, seed, penalties, painSwaps, excludedMovements, danielTierSelect, structuralPenalties, accessoryRotation, weekParity, progressingNames, intraWeekRotation, intraWeekDayOrdinal),
    ),
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

  // FOCUS-SAFE victim guard (Daniel eval 2026-06-13 regression fix). The slot-
  // injection blocks below (the FULL-BODY posterior+quad floor, the split-day
  // triceps guarantee) seat a slot by DISPLACING "the lowest-priority slot of the
  // most over-slotted group". That victim-selection was NOT focus-aware: on an
  // UPPER-biased focus with a small/slot-starved session it could displace the
  // FOCUS muscle's own slot, breaking the focus signature → the judge's "focus
  // muscle not emphasized" cap (p1_arms_2d biceps→4, p6_back_1d back no longer
  // leads). The rule is NOT "never touch a focus group" — the WINS (p5_v-taper_3d)
  // displaced a focus slot that had genuine SURPLUS and the focus still LED. So:
  // a focus slot is displaceable ONLY while its group retains a STRICT slot lead
  // afterward (count-1 > the max NON-focus group's count). When removing it would
  // tie/lose the lead, REJECT the victim (the block then YIELDs — a defensible
  // covered trade the judge does not cap). Pure helper over `liveCount` snapshots.
  // `focusGroupOf(name)` = the name's primary group when that group is a focus
  // group (emphSet) OR the name is focus-relevant by width/iso tag, else null.
  const focusRelevantSet = focusRelevantTags(ctx?.focusId);
  const focusGroupOf = (name) => {
    const meta = getExerciseMetadata(name) || {};
    const g = meta.muscle_target_primary;
    if (g && emphSet.has(g)) return g;
    if (focusRelevantSet.size > 0 && g) {
      const tg = deriveExerciseTags(name, meta, (n, m) => movementKey(n, m, ctx?.selectionDedup === true));
      for (const t of tg) if (focusRelevantSet.has(t)) return g;
    }
    return null;
  };
  // True when removing one slot from group `vg` (current count `liveCount[vg]`)
  // would NOT break the focus lead: either `vg` is not a focus group, or it keeps
  // a STRICT lead over every non-focus group after the removal. `liveCount` is the
  // caller's live per-group census; `isFocus(g)` tells which groups count as focus.
  const removalKeepsFocusLead = (vg, liveCount, isFocus) => {
    if (!isFocus(vg)) return true; // not a focus group → free to thin
    let maxNonFocus = 0;
    for (const [g, n] of Object.entries(liveCount)) {
      if (!isFocus(g) && n > maxNonFocus) maxNonFocus = n;
    }
    return ((liveCount[vg] || 0) - 1) > maxNonFocus; // must STILL strictly lead
  };

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
    // BEGINNER cap focus floor — at the tight 5-slot cap an emphasized group's
    // cluster-weight cap can round to 1 (low-weight focus on a full/upper cluster),
    // which would let the focus SIGNATURE collapse to a single lift. Floor an
    // emphasized group at FOCUS_MIN_SLOTS_BEGINNER (2) so the focus still LEADS even
    // at the cap (1 focus compound + 1 focus accessory). The WEEKLY over-volume this
    // 2-slots-every-day allocation caused at freq 3-5 is corrected by the focus
    // weekly-band SET clamp below (DELIVERED-set ceiling, not slot count — so the
    // focus stays VISIBLE as 2 exercises while its weekly sets land in band). Non-
    // beginner (beginnerCap null) → never raised → byte-identical.
    if (beginnerCap !== null && emphSet.has(g)) {
      slotCap[g] = Math.max(slotCap[g], FOCUS_MIN_SLOTS_BEGINNER);
    }
  }
  // Make ROOM for the emphasized extra slots: raise the session budget by the
  // number of emphasized groups this cluster trains (clamped to SESSION_SIZE).
  // Without this the session stays saturated at the balanced size and the extra
  // emphasized slot only DISPLACES another group rather than adding visible
  // volume. balanced / no emphasized group in this cluster → unchanged.
  // BEGINNER cap: the emphasized extra slots are bounded by effectiveCap (5), NOT
  // SESSION_SIZE (8), so a novice's focus day stays at the cap — the focus still
  // LEADS (it keeps its +1 slotCap so it wins the limited slots), it just does not
  // BALLOON the count past 5. OFF → effectiveCap === SESSION_SIZE → byte-identical.
  const effectiveSessionSize = Math.min(effectiveCap, sessionSize + emphSet.size);
  const groupCount = {};

  const chosen = [];
  const chosenNames = new Set();
  // dp_selection_dedup_v1 (Daniel, eval 2026-06-13) — the FINER sub-family dedup
  // switch. When ON, the in-session movement dedup keys with deepFamily=true so a
  // "bench" resolves to its chest-press sub-family (flat collapses with the flat
  // press; incline/decline stay distinct = the complementary swap). EVERY
  // chosenMovements add/has/delete below goes through `dedupKey` so the key is
  // CONSISTENT within the session (an add+delete under mismatched keys would leak a
  // ghost). NON-dedup movementKey consumers (rotation / squat-primacy / back-
  // coverage / big-lower / exclusion-token) stay on the plain key → unchanged.
  // OFF (default-absent / pure-fn callers) → deepFamily false → byte-identical.
  const deepFamilyDedup = ctx?.selectionDedup === true;
  const dedupKey = (name, meta) => movementKey(name, meta, deepFamilyDedup);
  // BUG 5 — dedup by MOVEMENT (muscle + movement token), not exact name, so two
  // same-movement variants (e.g. two chest flyes under different names) can never
  // both land in one plan. chosenNames stays as the exact-name guard underneath.
  const chosenMovements = new Set();
  const isTaken = (e) =>
    chosenNames.has(e.name) || chosenMovements.has(dedupKey(e.name, e.meta));
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
    chosenMovements.add(dedupKey(e.name, e.meta));
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
      const mk = dedupKey(e.name, e.meta);
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
        dedupKey(o.name, o.meta) !== mk
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
          chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
          const rg = getExerciseMetadata(removed.name).muscle_target_primary;
          if (rg && groupCount[rg]) groupCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: lateral.name, sets: DEFAULT_SETS });
          chosenNames.add(lateral.name);
          chosenMovements.add(dedupKey(lateral.name, lateral.meta));
          groupCount.umeri = (groupCount.umeri || 0) + 1;
        } else if (chosen.length < effectiveCap) {
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
            chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
            const rg = getExerciseMetadata(removed.name).muscle_target_primary;
            if (rg && groupCount[rg]) groupCount[rg] -= 1;
            chosen.splice(fallbackIdx, 1, { name: lateral.name, sets: DEFAULT_SETS });
            chosenNames.add(lateral.name);
            chosenMovements.add(dedupKey(lateral.name, lateral.meta));
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
        if (chosen.length < effectiveCap) {
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
            chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
            const rg = getExerciseMetadata(removed.name).muscle_target_primary;
            if (rg && groupCount[rg]) groupCount[rg] -= 1;
            chosen.splice(removeIdx, 1, { name: biceps.name, sets: DEFAULT_SETS });
            chosenNames.add(biceps.name);
            chosenMovements.add(dedupKey(biceps.name, biceps.meta));
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
  //
  // #R6a-T2 (2026-06-13): the "+ the Push day" premise is FALSE on a pure UPPER/LOWER
  // split (no push day) — there the de-dup ORPHANS direct triceps to 0 sets/wk. When
  // ctx.tricepsSplitGuarantee is true (upper day on a no-push week + flag ON) the de-dup
  // STILL RUNS — it frees the redundant-arm slot so a WEAK/EMPHASIZED group (M2 weakness
  // amplification, focus) can claim it FIRST — and the #R6a-T2 GUARANTEE below restores a
  // direct-triceps lift ORPHAN-SAFELY (swap an OVER-slotted, non-surfaced isolation; never
  // drop a major/surfaced group below its slot). So a no-push upper day lands BOTH the
  // amplified weak group AND a direct-triceps lift. Push-day week / flag OFF → de-dup runs
  // + the guarantee never fires → byte-identical.
  if (cluster === 'upper' && !emphSet.has('triceps')) {
    const primaryOf = (n) => getExerciseMetadata(n)?.muscle_target_primary;
    const isIso = (n) => (getExerciseMetadata(n)?.tier ?? 2) > COMPOUND_TIER;
    const hasBiceps = chosen.some((e) => primaryOf(e.name) === 'biceps');
    const triIdx = chosen.findIndex((e) => primaryOf(e.name) === 'triceps' && isIso(e.name));
    if (hasBiceps && triIdx >= 0 && chosen.length > minSession) {
      const removed = chosen[triIdx];
      chosenNames.delete(removed.name);
      chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
      if (groupCount.triceps) groupCount.triceps -= 1;
      chosen.splice(triIdx, 1);
    }
  }

  // R6d-b (Daniel focus-sweep review 2026-06-11) — IN-SESSION lumbar pairing.
  // The cross-day dedup (lumbarDedupPenalties) spaces hinge exposures across the
  // week, but a single leg/lower day could still stack a HEAVY hip-hinge (the
  // deadlift family) WITH a back-extension accessory — double systemic lumbar
  // load in one session (his 4d-lower Thursday: BB Squat + RDL 4 sets +
  // Hyperextension in the same workout). When a deadlift-family hinge is chosen,
  // drop the back-extension-family accessory (one removal, no refill — the same
  // shape as the #2 arm de-dup above; minSession-guarded). Gated on the same
  // dp_lumbar_dedup_v1 seam (ctx.lumbarPairDedup); OFF → byte-identical.
  if (ctx?.lumbarPairDedup === true && chosen.length > minSession) {
    const backExt = new Set(BACK_EXTENSION_FAMILY);
    const hasHeavyHinge = chosen.some(
      (e) => LUMBAR_HINGES.includes(e.name) && !backExt.has(e.name),
    );
    const extIdx = chosen.findIndex((e) => backExt.has(e.name));
    if (hasHeavyHinge && extIdx >= 0) {
      const removed = chosen[extIdx];
      const rg = getExerciseMetadata(removed.name).muscle_target_primary;
      chosenNames.delete(removed.name);
      chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
      if (rg && groupCount[rg]) groupCount[rg] -= 1;
      chosen.splice(extIdx, 1);
    }
  }

  // Full-body FOCUS slot-crunch yield set (Daniel sweep review 2026-06-11; the
  // 1-3-day extension approved 2026-06-11 eve — his external review + his "ok",
  // option 1: "focus minimums must win over full lower preservation for non-lower
  // focuses"). On a 1-3-day full-body FOCUS week the 8 slots/session cannot hold
  // all lower majors AND the focus's width/curl minimums AND chest+back — so the
  // LEG region (quads+hams+glutes) yields its SURPLUS slots to the focus's HIGH
  // minimums, down to a REGION floor. Used by BOTH the focus-policy resolver (a
  // surplus leg compound/accessory is displaceable) and the maintenance-floor
  // (the leg region is guaranteed at REGION level, not per-group).
  //
  // REGION FLOOR: 1 slot/session on a true 1-day week (weekly maintenance IS that
  // one day; the focus signature outranks a 4th leg slot — Daniel's explicit 1-day
  // call), 2 slots/session at 2-3 days (legs stay PROMINENT-maintained: 4-6 region
  // slots/week; the freed slot carries the lateral/rear/curl the focus demands).
  // POLICY NOTE: this consciously relaxes the 2026-06-10 Gigel "per-group never
  // zero at 2d" rule to REGION+coverage for FOCUS users — a de-emphasized group
  // may ride secondary coverage (Glute Drive maintains hams) within a maintained
  // region; the gate test asserts the new contract. balanced (emphSet empty) and
  // leg-emphasized focuses (lower) never collapse; calves (gambe) are OUTSIDE the
  // region and keep the per-group guarantee. 4+ days → split days carry the focus
  // → no collapse (byte-identical).
  const LEG_REGION_GROUPS = ['picioare-quads', 'picioare-hamstrings', 'fese'];
  const focusActive = emphSet.size > 0;
  const legsEmphasized = LEG_REGION_GROUPS.some((g) => emphSet.has(g));
  const daysPerWeekN = Number(ctx?.daysPerWeek) || 1;
  const fullBodyCrunch = daysPerWeekN <= 3;
  const legRegionFloor = daysPerWeekN <= 1 ? 1 : 2;
  const yieldGroups = new Set();
  if (fullBodyCrunch && focusActive) {
    for (const g of (ctx?.deEmphasizedGroups ?? [])) yieldGroups.add(g);
    if (!legsEmphasized) for (const g of LEG_REGION_GROUPS) yieldGroups.add(g);
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
      // dp_focus_contracts_v1 — gate the focus-contracts-arc additions (direct
      // arm-work injection + shrug/close-grip/arm-OHP sub-bucket caps) inside the
      // resolver. OFF → the resolver is byte-identical to the pre-arc behavior.
      contractsOn: ctx?.focusContracts === true,
      // dp_arms_signature_v1 — gate the arms-only signature additions inside the
      // resolver (back-lat maintenance cap + raised direct-arm per-session minimums) so
      // biceps + triceps lead the week's volume. OFF → the arms rule is byte-identical.
      armsSignatureOn: ctx?.armsSignature === true,
      // Yieldable regions (Daniel sweep review 2026-06-11) — explicit preset
      // de-emphasis ∪ the collapsed leg region on a non-leg full-body focus day. A
      // surplus compound of these groups may yield to a HIGH focus requirement,
      // down to the REGION floor (1 at 1d, 2 at 2-3d). balanced / no focus →
      // empty → no yield (byte-identical).
      deEmphasizedGroups: [...yieldGroups],
      deEmphRegionFloor: legRegionFloor,
      // F5 (dp_latiso_dedup_v1) — the active week's derived clusters, threaded
      // from getDailyWorkout so requirementsFor can defer a weekly minimum to the
      // week's SPECIALIST days (v-taper lat-iso → Pull owns it, Upper lands at 7).
      weekClusters: ctx?.weekClusters ?? null,
      // CROSS-DAY WEEK LEDGER (dp_week_ledger_v1) — the projection of the week's prior
      // days, threaded so requirementsFor + the cap-loop can enforce the cross-day SLOT
      // contracts (close-grip weekly set cap, lateral/rear second-slot quota, biceps:
      // triceps weekly parity). Null → the contract gates degrade to the per-day-only
      // behaviour (byte-identical to the pre-ledger resolver).
      weeklyLedger: ctx?.weeklyLedger ?? null,
      cluster,
      pool: candidatePool,
      prNames,
      // dp_selection_dedup_v1 — hand the resolver the SAME deep-family keyer the
      // in-session dedup uses, so its tag derivation (chest_press), its movement
      // dedup (mkOf/inMovement) and its press caps all see a "bench" as a chest
      // press. Without this the resolver keys "Smith Machine Bench" as a per-name
      // key → no chest_press tag → minChestPressSlots:1 thinks the day has no press
      // and INJECTS a 2nd flat (Flat Chest Press Machine), re-creating the very
      // duplicate the dedup just removed. OFF → dedupKey === movementKey → unchanged.
      movementKey: dedupKey,
      getMeta: getExerciseMetadata,
      // Match the Phase-2 selection score (Daniel tier list when ON, else neutral)
      // so the resolver's prune/inject tiebreak agrees with how the session was built.
      scoreOf: (name) =>
        danielTierSelect ? tierSelectScore(name, { hasLog: prNames.has(name) }) : -rank(name, prNames),
      // BEGINNER cap: the resolver's inject step is bounded by effectiveCap (5), not
      // SESSION_SIZE (8), so a focus-policy required slot never pushes a novice past
      // the cap (it prefers a SWAP/prune at the cap). OFF → effectiveCap === SESSION_SIZE.
      sessionSizeCap: effectiveCap,
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
        chosenMovements.add(dedupKey(e.name, getExerciseMetadata(e.name)));
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
    // De-emphasized region (Daniel sweep review 2026-06-11). When a FOCUS de-
    // emphasizes a multi-group region (v-taper → legs = quads+hams+glutes), the
    // per-GROUP guarantee forces THREE leg slots on a full-body day, leaving no
    // room for the focus's width work — and then it tug-of-wars the width that
    // focus-policy just injected. On a focus day the de-emphasized region is
    // MAINTENANCE (ONE compound, not one PER sub-group), so guarantee it at REGION
    // level: a de-emphasized major is skipped here once ANOTHER de-emphasized group
    // already holds a slot (the region is present). The FIRST de-emphasized group
    // still gets its slot (legs never zeroed). Empty deEmph (balanced / no focus) →
    // every major is its own region → byte-identical per-group behavior.
    const deEmphMajors = new Set(
      [...yieldGroups].filter((g) => MAJOR_MUSCLES_SLOT_GUARANTEE.includes(g)),
    );
    const deEmphRegionSlots = () =>
      [...deEmphMajors].reduce((n, g) => n + (liveCount[g] || 0), 0);
    const majorsToTrain = MAJOR_MUSCLES_SLOT_GUARANTEE.filter((g) => targets.includes(g));
    // INDIRECT coverage (2026-06-11 sweep review): a major with zero PRIMARY slots
    // that is a SECONDARY target of a chosen exercise is already maintained (a Glute
    // Drive maintains hams; a press maintains triceps). Used as a skip below and by
    // the region coverage-swap.
    const coveredBySecondaryOf = (major) =>
      chosen.some((e) => {
        const sec = getExerciseMetadata(e.name)?.muscle_target_secondary;
        return Array.isArray(sec) && sec.includes(major);
      });
    for (const major of majorsToTrain) {
      if ((liveCount[major] || 0) > 0) continue; // already has a slot
      // A secondary-covered major is maintained — skip (aligned with focus-policy
      // PR-fallback's coverage rule, so inject + floor never tug-of-war).
      if (coveredBySecondaryOf(major)) continue;
      // Region-level guarantee for a de-emphasized region: when the region already
      // holds the FLOOR (1 at 1d, 2 at 2-3d) the surplus yields to the focus. But a
      // major that is WHOLLY uncovered at the floor (no primary, no secondary) would
      // be abandoned — two leg ISOLATIONS (Leg Ext + Leg Curl) cannot cover three
      // leg majors, and a coach maintains the region with COMPOUNDS. COVERAGE-
      // PRESERVING SWAP: replace a region isolation X (primary G) with a pool
      // COMPOUND Y whose primary is THIS major AND whose secondary still covers G —
      // slot count stays at the floor while every region major gains coverage
      // (Leg Curl[hams] -> Glute Drive[fese+hams]). No such Y -> accept the gap
      // (the genuine 2-in-3 limit Daniel signed off on for focus weeks).
      if (deEmphMajors.has(major) && deEmphRegionSlots() >= legRegionFloor) {
        const compoundPool = (pools.find((p) => p.group === major)?.pool ?? [])
          .filter((e) => (getExerciseMetadata(e.name)?.tier ?? 2) <= 1 && !isTaken(e));
        for (const cand of compoundPool) {
          const candSec = getExerciseMetadata(cand.name)?.muscle_target_secondary;
          const candCovers = Array.isArray(candSec) ? candSec : [];
          const victimIdx = chosen.findIndex((e) => {
            const m = getExerciseMetadata(e.name) || {};
            const g = m.muscle_target_primary;
            return !!g && LEG_REGION_GROUPS.includes(g) && (m.tier ?? 2) > 1 && candCovers.includes(g);
          });
          if (victimIdx < 0) continue;
          const victim = chosen[victimIdx];
          const vg = getExerciseMetadata(victim.name).muscle_target_primary;
          chosenNames.delete(victim.name);
          chosenMovements.delete(dedupKey(victim.name, getExerciseMetadata(victim.name)));
          if (vg && liveCount[vg]) liveCount[vg] -= 1;
          chosen.splice(victimIdx, 1, { name: cand.name, sets: DEFAULT_SETS });
          chosenNames.add(cand.name);
          chosenMovements.add(dedupKey(cand.name, cand.meta));
          liveCount[major] = (liveCount[major] || 0) + 1;
          break;
        }
        continue; // region at floor — swapped for coverage, or true 2-in-3 limit
      }
      const pool = pools.find((p) => p.group === major)?.pool ?? [];
      const inject = pool.find((e) => !isTaken(e));
      if (!inject) continue; // library can't supply this group under the constraints
      if (chosen.length < effectiveCap) {
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
      //
      // FOCUS-PROTECT (Daniel sweep review 2026-06-11): a non-focus maintenance
      // major (e.g. calves on a SHOULDERS day) must NOT displace the FOCUS region
      // or a focus-relevant width/curl the focus-policy just injected — the focus
      // HIGH requirement outranks a small muscle's maintenance floor. When the only
      // displaceable victim would be focus-protected, the maintenance major YIELDS
      // (removeIdx stays -1 → no inject; maintained across the week via volume).
      // focusPolicy OFF / balanced (emphSet empty, no focus tags) → never protects
      // → byte-identical.
      // FOCUS-PROTECT applies ONLY in the single-day full-body crunch (the same
      // gate as the leg-region collapse): there, the focus's HIGH minimum outranks
      // a small muscle's maintenance for the marginal slot. At 2+ days the
      // maintenance floor is UNCHANGED (it may displace a focus slot to keep a major
      // ≥ MEV — the Gigel 2d UPPER gate), and the focus width still fits via the
      // 'full'-cluster minimums. fullBodyCrunch false → never protects → byte-identical.
      const focusTags = (fullBodyCrunch && ctx?.focusPolicy === true)
        ? focusRelevantTags(ctx?.focusId) : new Set();
      const isFocusProtected = (name) => {
        if (!fullBodyCrunch) return false;
        const g = getExerciseMetadata(name).muscle_target_primary;
        if (g && emphSet.has(g)) return true; // the focus region itself
        if (focusTags.size === 0) return false;
        const tg = deriveExerciseTags(name, getExerciseMetadata(name), dedupKey);
        for (const t of tg) if (focusTags.has(t)) return true; // injected width/curl
        return false;
      };
      const majorSet = new Set(majorsToTrain);
      let removeIdx = -1;
      for (let i = chosen.length - 1; i >= 0; i--) {
        const g = getExerciseMetadata(chosen[i].name).muscle_target_primary;
        if ((liveCount[g] || 0) <= 1) continue;          // not over-slotted
        if (isFocusProtected(chosen[i].name)) continue;  // never displace the focus
        removeIdx = i; break; // lowest-priority (highest-index) over-slotted non-focus slot
      }
      // No over-slotted non-focus group to thin — then a major muscle is being
      // crowded out by a NON-MAJOR group (arms/abs/forearms). A major outranks a
      // small isolation group for the last slot, so displace the lowest-priority
      // single-slot NON-MAJOR exercise — but still never the focus (region/relevant).
      // Majors already placed are never touched.
      if (removeIdx === -1) {
        for (let i = chosen.length - 1; i >= 0; i--) {
          const g = getExerciseMetadata(chosen[i].name).muscle_target_primary;
          if (majorSet.has(g)) continue;
          if (isFocusProtected(chosen[i].name)) continue;
          removeIdx = i; break;
        }
      }
      // BEGINNER cap upper-major coverage trade (dp_beginner_session_size_v1 refine
      // 2026-06-14). At the 5-slot cap a LOWER-focus full-body day fills all 5 slots
      // with legs (the focus region front-loads quads/hams/glutes) → chest/back/
      // shoulders ORPHANED at 0 weekly (p1_lower_3d back=0/shoulders=0 → judge orphan
      // cap 5.0). The passes above protect every focus leg slot, so they yield. But an
      // UPPER MAJOR (chest/back/shoulders) outranks a SURPLUS leg ISOLATION for the
      // missing slot: a coach gives a beginner a horizontal pull + a press even on a
      // leg-focus day. So when the orphaned `major` is a NON-LEG major and no other
      // victim exists, displace the lowest-priority FOCUS leg SURPLUS slot — a leg
      // group that keeps >=1 slot AND a leg REGION that keeps >=legRegionFloor slots
      // after the trade (the focus still LEADS the day, legs are never orphaned). Prefer
      // an ISOLATION (tier > COMPOUND_TIER) so a leg COMPOUND's broad coverage survives.
      // No such surplus → accept the gap (a genuinely all-leg saturated day). Non-leg
      // major only — a leg orphan is handled by the leg-coverage trade above. Non-
      // beginner (beginnerCap null) → never runs → byte-identical.
      if (
        removeIdx === -1
        && beginnerCap !== null
        && !LEG_REGION_GROUPS.includes(major)
      ) {
        const legSlots = () => LEG_REGION_GROUPS.reduce((n, g) => n + (liveCount[g] || 0), 0);
        for (const isoOnly of [true, false]) {
          for (let i = chosen.length - 1; i >= 0; i--) {
            const m = getExerciseMetadata(chosen[i].name) || {};
            const g = m.muscle_target_primary;
            if (!g || !LEG_REGION_GROUPS.includes(g)) continue;       // legs only
            if ((liveCount[g] || 0) <= 1) continue;                   // keep the group's last slot
            if (legSlots() - 1 < legRegionFloor) continue;            // keep the region floor
            if (isoOnly && (m.tier ?? 2) <= COMPOUND_TIER) continue;  // pass 1: spare leg compounds
            removeIdx = i; break;
          }
          if (removeIdx >= 0) break;
        }
      }
      if (removeIdx >= 0) {
        const removed = chosen[removeIdx];
        const rg = getExerciseMetadata(removed.name).muscle_target_primary;
        chosenNames.delete(removed.name);
        chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
        if (rg && liveCount[rg]) liveCount[rg] -= 1;
        chosen.splice(removeIdx, 1, { name: inject.name, sets: DEFAULT_SETS });
        chosenNames.add(inject.name);
        chosenMovements.add(dedupKey(inject.name, inject.meta));
        liveCount[major] = (liveCount[major] || 0) + 1;
      }
    }
  }

  // #R6a-T FULL-BODY TRICEPS GUARANTEE (ctx.tricepsFullbodyGuarantee,
  // dp_triceps_fullbody_guarantee_v1). Elite-coach eval ceiling 2026-06-13: the #1
  // "not-a-9" complaint on full-body weeks is "arms under-served — add 3-4 direct
  // triceps sets, there's room". Direct triceps landed at 0 sets/week on most
  // freq<=3 FULL-BODY configs even though `full` weights triceps 0.10 — the low
  // slot share rounds it out AND the MAJOR-MUSCLE maintenance floor above (which
  // does NOT list arms as majors) preferentially displaces a naturally-selected
  // triceps to seat a missing major. The biceps guarantee already protects biceps,
  // so a full-body day guaranteed biceps but NOT triceps — an asymmetry the eval
  // flagged. Mirror that guarantee, SCOPED TO `full` ONLY: on upper/push/pull/lower
  // there IS a Push day, so direct triceps gets indirect pressing coverage across
  // the week and the deliberate #2 upper-day triceps de-dup HOLDS — untouched. An
  // all-full-body week (freq<=3) has no separate Push day, so triceps needs the
  // guarantee.
  //
  // PLACEMENT: runs AFTER the maintenance floor (the prior "final word on slot
  // membership") so the floor cannot undo the inject. ORPHAN-SAFE + LENGTH-STABLE:
  // it PREFERS to REPLACE an OVER-slotted group's lowest-priority non-anchor
  // isolation (a group keeping >=1 slot after removal — so no muscle is orphaned,
  // and the session exercise COUNT is unchanged so the downstream time-budget trim
  // is not perturbed for a time-capped user). Only when NO over-slotted isolation
  // exists does it ADD a slot, and only if the session has room; otherwise it
  // accepts the gap (a genuinely single-slotted, saturated day) rather than orphan a
  // muscle. OFF / non-full cluster / no triceps target → never runs → byte-identical.
  if (
    ctx?.tricepsFullbodyGuarantee === true
    && cluster === 'full'
    && targets.includes('triceps')
  ) {
    const primaryOfName = (name) => getExerciseMetadata(name)?.muscle_target_primary;
    const hasTriceps = chosen.some((e) => primaryOfName(e.name) === 'triceps');
    if (!hasTriceps) {
      const tricepsPool = pools.find((p) => p.group === 'triceps')?.pool ?? [];
      const triceps = tricepsPool.find((e) => !isTaken(e));
      if (triceps) {
        // Per-group slot census so a REPLACE only ever targets an OVER-slotted group.
        const slotCount = {};
        for (const e of chosen) {
          const g = primaryOfName(e.name);
          if (g) slotCount[g] = (slotCount[g] || 0) + 1;
        }
        // Largest NON-emphasized group's slot count — the bar an emphasized group must
        // stay strictly above to remain the day's volume LEAD (mirrors the downstream
        // time-trim's emphasized-signature guard). An emphasized group may yield a
        // SURPLUS slot (umeri 3 → 2 still leads vs 1) but not its lead slot (umeri 2 →
        // 1 ties): yielding the lead would demote the focus AND the trim would drop the
        // injected triceps anyway. balanced (emphSet empty) → no restriction.
        let maxNonEmph = 0;
        for (const [g, n] of Object.entries(slotCount)) {
          if (!emphSet.has(g) && n > maxNonEmph) maxNonEmph = n;
        }
        // Lowest-priority (highest-index) non-anchor (tier >= 2) isolation whose group
        // still has another slot — replacing it never orphans + keeps the count. An
        // EMPHASIZED group is only displaceable while it would STILL strictly lead
        // (its surplus, not its signature slot); else ADD/accept-gap below.
        let removeIdx = -1;
        for (let i = chosen.length - 1; i >= 0; i--) {
          if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
          const g = primaryOfName(chosen[i].name);
          if (!g || (slotCount[g] || 0) <= 1) continue; // would orphan g
          if (emphSet.has(g) && (slotCount[g] - 1) <= maxNonEmph) continue; // keep focus lead
          removeIdx = i;
          break;
        }
        if (removeIdx >= 0) {
          const removed = chosen[removeIdx];
          chosenNames.delete(removed.name);
          chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
          const rg = getExerciseMetadata(removed.name).muscle_target_primary;
          if (rg && groupCount[rg]) groupCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: triceps.name, sets: DEFAULT_SETS });
          chosenNames.add(triceps.name);
          chosenMovements.add(dedupKey(triceps.name, triceps.meta));
          groupCount.triceps = (groupCount.triceps || 0) + 1;
        } else if (chosen.length < effectiveCap) {
          // No over-slotted isolation to swap, but the session has room — add the slot.
          take(triceps, DEFAULT_SETS);
        }
        // else: saturated + every group single-slotted → accept the gap (no orphan).
      }
    }
  }

  // #R6a-T2 SPLIT-DAY (UPPER/LOWER) TRICEPS GUARANTEE (ctx.tricepsSplitGuarantee,
  // dp_triceps_split_guarantee_v1). Triceps-orphan eval ceiling 2026-06-13: on a pure
  // UPPER/LOWER 4-day split (upper/lower/upper/lower) direct triceps landed at 0 sets/wk
  // in 48 configs. Root cause: the #2 upper-day de-dup (above) removes the standalone
  // triceps on `upper` justified by "the Push day already covers triceps" — FALSE for a
  // U/L split (no push day). The full-body guarantee (#R6a-T) only fires on `full`, and
  // the biceps guarantee (#R6a) has no triceps mirror — so on U/L weeks triceps falls
  // through every net. ctx.tricepsSplitGuarantee is true ONLY on an `upper` day of a
  // NO-PUSH week (gated in getDailyWorkout).
  //
  // PLACEMENT (mirrors #R6a-T): runs AFTER the focus-policy rebuild (which wipes + rebuilds
  // `chosen`) AND the maintenance floor, so neither can undo the inject — the early biceps
  // guarantee survives only because biceps is focus-relevant; triceps under a shoulders/
  // back focus is not, so it MUST restore here. ORPHAN-SAFE + LENGTH-STABLE + SURFACE-SAFE:
  // PREFER to REPLACE an OVER-slotted (group keeps >=1 slot), NON-SURFACED (not weak/
  // emphasized) isolation — so no muscle is orphaned, the count is unchanged, and the M2
  // weakness / focus amplification slot is never clawed back. Only when no such victim
  // exists does it ADD (if room); else accept the gap. OFF / push-day week / no triceps
  // target / triceps already present → never runs → byte-identical.
  if (ctx?.tricepsSplitGuarantee === true && targets.includes('triceps')) {
    const primaryOfName = (name) => getExerciseMetadata(name)?.muscle_target_primary;
    const hasTriceps = chosen.some((e) => primaryOfName(e.name) === 'triceps');
    if (!hasTriceps) {
      const tricepsPool = pools.find((p) => p.group === 'triceps')?.pool ?? [];
      const triceps = tricepsPool.find((e) => !isTaken(e));
      if (triceps) {
        // Per-group slot census so a REPLACE only ever targets an OVER-slotted group.
        const slotCount = {};
        for (const e of chosen) {
          const g = primaryOfName(e.name);
          if (g) slotCount[g] = (slotCount[g] || 0) + 1;
        }
        // Largest NON-surfaced group's slot count — the bar a surfaced (weak/emphasized)
        // group must stay strictly above to remain the day's volume LEAD (mirrors the
        // #R6a-T full-body guarantee). A surfaced group may yield a SURPLUS slot (umeri
        // 4 → 3 still leads vs spate 2) but not its lead slot, so the M2 weakness /
        // focus signature is preserved. balanced (surfaceSet empty) → no restriction.
        let maxNonSurfaced = 0;
        for (const [g, n] of Object.entries(slotCount)) {
          if (!surfaceSet.has(g) && n > maxNonSurfaced) maxNonSurfaced = n;
        }
        // Lowest-priority (highest-index) non-anchor (tier >= 2) isolation whose group
        // still has another slot (no orphan). A SURFACED group is displaceable only while
        // it would STILL strictly lead after the yield (its surplus, not its signature
        // slot) — so the weak/focus lead is never clawed back.
        let removeIdx = -1;
        for (let i = chosen.length - 1; i >= 0; i--) {
          if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
          const g = primaryOfName(chosen[i].name);
          if (!g || (slotCount[g] || 0) <= 1) continue; // would orphan g
          if (surfaceSet.has(g) && (slotCount[g] - 1) <= maxNonSurfaced) continue; // keep lead
          removeIdx = i;
          break;
        }
        if (removeIdx >= 0) {
          const removed = chosen[removeIdx];
          chosenNames.delete(removed.name);
          chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
          const rg = getExerciseMetadata(removed.name).muscle_target_primary;
          if (rg && groupCount[rg]) groupCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: triceps.name, sets: DEFAULT_SETS });
          chosenNames.add(triceps.name);
          chosenMovements.add(dedupKey(triceps.name, triceps.meta));
          groupCount.triceps = (groupCount.triceps || 0) + 1;
        } else if (chosen.length < effectiveCap) {
          // No over-slotted non-surfaced isolation to swap, but there is room — add it.
          take(triceps, DEFAULT_SETS);
        }
        // else: saturated + every group single-slotted/surfaced → accept the gap.
      }
    }
  }

  // #R6b SPATE-INJURY HAMSTRING LEG-CURL GUARANTEE (ctx.legCurlGuarantee,
  // dp_legcurl_guarantee_v1). The disc/lower-back ('spate') exclusion removes the
  // entire spinal-loading hinge family (RDL / deadlift / good-morning / hip-thrust /
  // squat via tokens, + the GHR / Nordic / hyperextension erector-extension family
  // via the LUMBAR_HINGE sentinel) — which leaves hamstrings with NO slotted primary
  // mover on the slot-limited full-body days (the 14/32 p7 hams=0 orphan, 2026-06-13).
  // The spine-NEUTRAL option — Seated/Lying/Standing Leg Curl (knee flexion, no axial
  // load) — IS in the pool but is a deprioritized isolation the slot allocation does
  // not reliably seat. When a cluster TRAINS hamstrings (full/lower/legs/pull → targets
  // includes 'picioare-hamstrings') AND the spate hinge family is excluded (the sentinel
  // is in the exclusion set — spate-specific) AND no PRIMARY hamstring movement landed,
  // inject a spine-neutral leg curl. This is the BACKFILL that makes re-adding the GHR
  // exclusion safe (without it, excluding GHR would orphan hams).
  //
  // Mirrors the #R6a biceps / #R6a-T triceps guarantee — ORPHAN-SAFE + LENGTH-STABLE:
  // PREFER to REPLACE an over-slotted NON-FOCUS isolation (a group keeping >=1 slot,
  // so no muscle is orphaned + the count is unchanged so the time-budget trim is not
  // perturbed); only ADD when no such victim exists AND there is room; else accept the
  // gap (a genuinely saturated single-slotted day) rather than orphan a muscle. Runs
  // AFTER the maintenance floor (the prior "final word on slot membership") so the
  // floor cannot undo the inject. OFF / no hams target / no spate exclusion → never
  // runs → byte-identical.
  if (
    ctx?.legCurlGuarantee === true
    && targets.includes('picioare-hamstrings')
    && excludedMovements?.tokens?.has?.(LUMBAR_HINGE_SENTINEL)
  ) {
    const primaryOfName = (name) => getExerciseMetadata(name)?.muscle_target_primary;
    const hasHams = chosen.some((e) => primaryOfName(e.name) === 'picioare-hamstrings');
    if (!hasHams) {
      // Spine-neutral leg curl ONLY (movementKey token `leg-curl` = knee flexion, no
      // axial load) — from the (already spate-filtered) hamstrings pool, so the heavy
      // hinge family is gone and we never re-seat a contraindicated mover.
      const hamsPool = pools.find((p) => p.group === 'picioare-hamstrings')?.pool ?? [];
      const legCurl = hamsPool.find(
        (e) => !isTaken(e) && movementKey(e.name, e.meta).split('::')[1] === 'leg-curl',
      );
      if (legCurl) {
        // Per-group slot census so a REPLACE only ever targets an OVER-slotted group.
        const slotCount = {};
        for (const e of chosen) {
          const g = primaryOfName(e.name);
          if (g) slotCount[g] = (slotCount[g] || 0) + 1;
        }
        // Largest NON-emphasized group's slot count — the bar an emphasized group must
        // stay strictly above to remain the day's volume LEAD (mirrors the triceps
        // guarantee's emphasized-signature guard). balanced (emphSet empty) → 0.
        let maxNonEmph = 0;
        for (const [g, n] of Object.entries(slotCount)) {
          if (!emphSet.has(g) && n > maxNonEmph) maxNonEmph = n;
        }
        // Lowest-priority (highest-index) non-anchor isolation whose group still has
        // another slot — replacing it never orphans + keeps the count. An EMPHASIZED
        // group is only displaceable while it would STILL strictly lead (its surplus,
        // not its signature slot).
        let removeIdx = -1;
        for (let i = chosen.length - 1; i >= 0; i--) {
          if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
          const g = primaryOfName(chosen[i].name);
          if (!g || (slotCount[g] || 0) <= 1) continue; // would orphan g
          if (emphSet.has(g) && (slotCount[g] - 1) <= maxNonEmph) continue; // keep focus lead
          removeIdx = i;
          break;
        }
        if (removeIdx >= 0) {
          const removed = chosen[removeIdx];
          chosenNames.delete(removed.name);
          chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
          const rg = getExerciseMetadata(removed.name).muscle_target_primary;
          if (rg && groupCount[rg]) groupCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: legCurl.name, sets: DEFAULT_SETS });
          chosenNames.add(legCurl.name);
          chosenMovements.add(dedupKey(legCurl.name, legCurl.meta));
          groupCount['picioare-hamstrings'] = (groupCount['picioare-hamstrings'] || 0) + 1;
        } else if (chosen.length < effectiveCap) {
          // No over-slotted isolation to swap, but the session has room — add the slot.
          take(legCurl, DEFAULT_SETS);
        }
        // else: saturated + every group single-slotted → accept the gap (no orphan).
      }
    }
  }

  // #LEG FULL-BODY POSTERIOR+QUAD FLOOR (ctx.posteriorChainFloor,
  // dp_posterior_chain_floor_v1, default ON). Elite-coach invariant: a FULL-BODY day
  // ALWAYS trains quads AND the posterior chain. On freq 1-3 all-full-body weeks under
  // an upper-biased focus (v-taper / chest / shoulders / upper / back) the focus zeroes
  // the leg weights, so the leg majors fall out of `targets`; the MAJOR-MUSCLE SLOT
  // GUARANTEE above therefore SKIPS them (majorsToTrain filters on targets), the 2-in-3
  // region floor leaves hams+glutes at 0 once quads alone hold legRegionFloor, and
  // FOCUS-PROTECT denies legs the marginal slot — 88 grid configs had weekly posterior=0,
  // 38 quads=0, 17 all-three=0 (a chest program that NEVER trained legs). This block is
  // the FINAL word on slot membership for legs: it runs AFTER fill + focus-policy + the
  // maintenance floor + every later guarantee, and for these TWO specific leg slots it
  // OVERRIDES focus-protect (the entire point — a coach never zeroes legs on a full-body
  // day, focus or not). Scoped `cluster === 'full'` ONLY: a U/L split's `upper` day
  // legitimately has 0 legs (the Lower day trains them), so it is untouched. Deterministic
  // (fixed walk order). OFF / non-full cluster → never runs → byte-identical.
  if (ctx?.posteriorChainFloor === true && cluster === 'full') {
    const QUAD = 'picioare-quads';
    const HAMS = 'picioare-hamstrings';
    const GLUTES = 'fese';
    const POSTERIOR = [HAMS, GLUTES];
    const primaryOfName = (name) => getExerciseMetadata(name)?.muscle_target_primary;
    // Live per-group slot census off `chosen` (every prior block may have rebuilt it).
    const liveCount = {};
    for (const e of chosen) {
      const g = primaryOfName(e.name);
      if (g) liveCount[g] = (liveCount[g] || 0) + 1;
    }
    // Displace the lowest-priority (highest-index) NON-ANCHOR slot of the MOST over-
    // slotted UPPER group — the focus's surplus 3rd back/chest/shoulder isolation. The
    // victim's group must keep >=1 slot after removal (never orphan; never take a major's
    // only slot), must NOT be a leg group (we are ADDING legs, not robbing them), and
    // prefers a non-compound (tier > COMPOUND_TIER) so an anchor survives. Returns the
    // chosen index to displace, or -1 when no genuine surplus exists.
    const findUpperSurplusVictim = () => {
      // Candidate upper groups carrying > 1 slot, by descending slot count (most over-
      // slotted first), then by group name for a deterministic tiebreak.
      const overSlottedUpper = Object.entries(liveCount)
        .filter(([g, n]) => n > 1 && !LEG_REGION_GROUPS.includes(g))
        .sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))
        .map(([g]) => g);
      if (overSlottedUpper.length === 0) return -1;
      const overSet = new Set(overSlottedUpper);
      // FOCUS-SAFE (Daniel eval 2026-06-13): a candidate victim whose group is a FOCUS
      // group (emphSet) or is focus-relevant by tag is rejected UNLESS its group keeps a
      // STRICT slot lead after the removal — so the floor never un-emphasizes the focus to
      // seat legs (p1_arms_2d biceps / p6_back_1d back). A genuine SURPLUS focus slot
      // (p5_v-taper_3d back 27→23, still leading) IS still displaceable. balanced /
      // no focus (focus groups absent from liveCount) → predicate always true → unchanged.
      const isFocusGroup = (name) => focusGroupOf(name) !== null;
      const focusSafe = (name) => {
        const g = primaryOfName(name);
        if (!isFocusGroup(name)) return true; // non-focus surplus → always displaceable
        return removalKeepsFocusLead(g, liveCount, (gg) => {
          // a group counts as focus if it is in emphSet OR holds any focus-relevant slot
          if (emphSet.has(gg)) return true;
          return chosen.some((e) => primaryOfName(e.name) === gg && focusGroupOf(e.name) !== null);
        });
      };
      // Pass 1: lowest-priority NON-anchor (tier > COMPOUND_TIER) slot of an over-slotted,
      // FOCUS-SAFE upper group. Pass 2 (fallback): any non-anchor slot of an over-slotted
      // FOCUS-SAFE upper group regardless of tier ordering — already covered by pass 1's
      // tier filter, so pass 2 drops the tier filter to accept a tier<=COMPOUND_TIER
      // surplus only if the group still keeps >=1 slot. Walk from the back for lowest
      // selection priority. Prefer NON-focus surplus first (it never risks the lead).
      for (const focusOk of [false, true]) {
        for (let i = chosen.length - 1; i >= 0; i--) {
          const g = primaryOfName(chosen[i].name);
          if (!overSet.has(g)) continue;
          if ((liveCount[g] || 0) <= 1) continue; // would orphan g
          if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
          if (isFocusGroup(chosen[i].name) !== focusOk) continue; // non-focus pass first
          if (!focusSafe(chosen[i].name)) continue; // never break the focus lead
          return i;
        }
      }
      for (const focusOk of [false, true]) {
        for (let i = chosen.length - 1; i >= 0; i--) {
          const g = primaryOfName(chosen[i].name);
          if (!overSet.has(g)) continue;
          if ((liveCount[g] || 0) <= 1) continue; // would orphan g
          if (isFocusGroup(chosen[i].name) !== focusOk) continue; // non-focus pass first
          if (!focusSafe(chosen[i].name)) continue; // never break the focus lead
          return i;
        }
      }
      return -1;
    };
    // Seat `inject` (a pool entry {name, meta}) for leg group `targetGroup`. LENGTH-
    // STABLE FIRST (mirrors the triceps / leg-curl guarantees): PREFER to DISPLACE a
    // genuine UPPER SURPLUS slot so the session COUNT is unchanged — the downstream
    // time-trim is then not perturbed and cannot sacrifice another major's only slot to
    // restore the count. Only when there is NO upper surplus AND the session is still
    // BELOW its true per-day size (effectiveSessionSize, NOT the SESSION_SIZE ceiling —
    // padding to the ceiling would force the time-trim to drop a real upper major) does
    // it ADD. Otherwise ACCEPT THE GAP: on a micro-session (1-2 day full-body) where
    // every upper group is single-slotted, seating a leg would necessarily orphan an
    // upper major, so the leg yields here and is maintained across the week. Mirrors the
    // maintenance-floor swap bookkeeping (chosen / chosenNames / chosenMovements /
    // liveCount).
    const seatLeg = (inject, targetGroup) => {
      if (!inject) return;
      const victimIdx = findUpperSurplusVictim();
      if (victimIdx >= 0) {
        const removed = chosen[victimIdx];
        const rg = primaryOfName(removed.name);
        chosenNames.delete(removed.name);
        chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
        if (rg && liveCount[rg]) liveCount[rg] -= 1;
        chosen.splice(victimIdx, 1, { name: inject.name, sets: DEFAULT_SETS });
        chosenNames.add(inject.name);
        chosenMovements.add(dedupKey(inject.name, inject.meta));
        liveCount[targetGroup] = (liveCount[targetGroup] || 0) + 1;
        return;
      }
      if (chosen.length < effectiveSessionSize) {
        take(inject, DEFAULT_SETS);
        liveCount[targetGroup] = (liveCount[targetGroup] || 0) + 1;
        return;
      }
      // BEGINNER cap leg-coverage trade (dp_beginner_session_size_v1): at the 5-slot
      // cap the upper groups are single-slotted so findUpperSurplusVictim yields none
      // and the leg would be abandoned — but a beginner FULL-BODY day must train legs
      // (the elite invariant), and a leg MAJOR outranks a small-arm/core ACCESSORY for
      // a novice. So when no upper surplus exists AND the session is at the cap, trade
      // the lowest-priority single-slot NON-FOCUS, NON-MAJOR, NON-LEG accessory (a
      // biceps/triceps/core/forearm iso — the arm work the focus piled onto the cap)
      // for the leg compound. NEVER displace the focus, a major upper region (chest/
      // back/shoulders — covered directly or via a press secondary), or a leg slot. No
      // such accessory → accept the gap (a saturated all-major day). Non-beginner
      // (beginnerCap null) → never runs → byte-identical (the legacy accept-the-gap).
      if (beginnerCap !== null) {
        const majorSet = new Set(MAJOR_MUSCLES_SLOT_GUARANTEE);
        const liveOf = (g) => liveCount[g] || 0;
        // Pass 1 prefers a NON-FOCUS small accessory (the focus is never thinned while a
        // non-focus arm/core iso exists). Pass 2 (focusOk) allows a FOCUS small-accessory
        // ISO (tier > COMPOUND_TIER) whose group keeps >=1 slot after the trade — so an
        // ARMS focus (biceps+triceps are BOTH focus, no non-focus accessory exists) still
        // gets its leg: the 2nd triceps ISO yields, the focus COMPOUND + its other arm slot
        // stay, and the arm volume still LEADS the week. Never a focus's last slot, never a
        // focus compound, never a major upper region or a leg.
        let removeIdx = -1;
        for (const focusOk of [false, true]) {
          for (let i = chosen.length - 1; i >= 0; i--) {
            const g = primaryOfName(chosen[i].name);
            if (!g || majorSet.has(g) || LEG_REGION_GROUPS.includes(g)) continue; // keep majors + legs
            const isFocus = focusGroupOf(chosen[i].name) !== null;
            if (isFocus !== focusOk) continue;                                     // non-focus first
            if (isFocus) {
              if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue; // keep the focus compound
              if (liveOf(g) <= 1) continue;                                        // never the focus's last slot
            }
            removeIdx = i;
            break;
          }
          if (removeIdx >= 0) break;
        }
        if (removeIdx >= 0) {
          const removed = chosen[removeIdx];
          const rg = primaryOfName(removed.name);
          chosenNames.delete(removed.name);
          chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
          if (rg && liveCount[rg]) liveCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: inject.name, sets: DEFAULT_SETS });
          chosenNames.add(inject.name);
          chosenMovements.add(dedupKey(inject.name, inject.meta));
          liveCount[targetGroup] = (liveCount[targetGroup] || 0) + 1;
        }
      }
      // else: no upper surplus + at day size → accept the gap (seating would orphan a major).
    };
    // BEGINNER cap RELAX (dp_beginner_session_size_v1): at the 5-slot cap a leg major
    // is considered COVERED when a chosen COMPOUND hits it as a SECONDARY target — a
    // novice's 4-5 compounds already train the posterior chain indirectly (squat hits
    // glutes/hams, a press hits triceps). The judge explicitly accepts this ("hams get
    // 0 but that is a covered light-leg trade for a beginner, not a true orphan"), so
    // the floor does NOT displace a focus/chest slot to seat a separate leg-iso it does
    // not need. Non-beginner (beginnerCap null) → predicate false → the full
    // primary-only floor runs as today → byte-identical.
    const coveredBySecondaryCompound = (major) =>
      beginnerCap !== null
      && chosen.some((e) => {
        const m = getExerciseMetadata(e.name) || {};
        if ((m.tier ?? 2) > COMPOUND_TIER) return false; // compound coverage only
        const sec = Array.isArray(m.muscle_target_secondary) ? m.muscle_target_secondary : [];
        return sec.includes(major);
      });
    // QUAD FLOOR — >=1 quad-primary slot. Prefer a tier<=COMPOUND_TIER compound (leg
    // press / hack squat); fall back to any available quad.
    if ((liveCount[QUAD] || 0) === 0 && !coveredBySecondaryCompound(QUAD)) {
      const quadPool = pools.find((p) => p.group === QUAD)?.pool ?? [];
      const compound = quadPool.find(
        (e) => !isTaken(e) && (getExerciseMetadata(e.name)?.tier ?? 2) <= COMPOUND_TIER,
      );
      const inject = compound || quadPool.find((e) => !isTaken(e));
      seatLeg(inject, QUAD);
    }
    // POSTERIOR FLOOR — >=1 (hams|glutes)-primary slot. Prefer a COMPOUND that covers
    // BOTH (RDL / hip-thrust / glute-drive — primary in one posterior group, secondary
    // covering the other, e.g. a `fese` compound with `picioare-hamstrings` secondary).
    // Walk hams then glutes for a deterministic fixed order. Fall back to any available
    // posterior compound, then any available posterior movement.
    const posteriorSlots = POSTERIOR.reduce((n, g) => n + (liveCount[g] || 0), 0);
    const posteriorCoveredBySecondary = POSTERIOR.some((g) => coveredBySecondaryCompound(g));
    if (posteriorSlots === 0 && !posteriorCoveredBySecondary) {
      const coversBoth = (e) => {
        const m = getExerciseMetadata(e.name) || {};
        const sec = Array.isArray(m.muscle_target_secondary) ? m.muscle_target_secondary : [];
        return POSTERIOR.some((p) => p !== m.muscle_target_primary && sec.includes(p));
      };
      let inject = null;
      // Pass A — a compound (tier<=COMPOUND_TIER) covering both posterior sub-groups.
      for (const g of POSTERIOR) {
        const pool = pools.find((p) => p.group === g)?.pool ?? [];
        inject = pool.find(
          (e) => !isTaken(e) && (getExerciseMetadata(e.name)?.tier ?? 2) <= COMPOUND_TIER && coversBoth(e),
        );
        if (inject) break;
      }
      // Pass B — any compound on either posterior sub-group.
      if (!inject) {
        for (const g of POSTERIOR) {
          const pool = pools.find((p) => p.group === g)?.pool ?? [];
          inject = pool.find(
            (e) => !isTaken(e) && (getExerciseMetadata(e.name)?.tier ?? 2) <= COMPOUND_TIER,
          );
          if (inject) break;
        }
      }
      // Pass C — any available posterior movement.
      if (!inject) {
        for (const g of POSTERIOR) {
          const pool = pools.find((p) => p.group === g)?.pool ?? [];
          inject = pool.find((e) => !isTaken(e));
          if (inject) break;
        }
      }
      if (inject) seatLeg(inject, primaryOfName(inject.name));
    }
  }

  // #HAMS HYPERTROPHY/STRENGTH HAMSTRING FLOOR (ctx.hamstringFloor,
  // dp_hamstring_floor_v1, default ON). A MASS-BUILDING / STRENGTH program (goal masa /
  // forta) must NEVER zero a hamstring — a major prime mover. The Cycle-11 posterior
  // floor above treats hams∪glutes as ONE region, so a GLUTE movement alone (Glute Drive)
  // satisfies it and leaves HAMSTRINGS at 0; the Cycle-7 leg-curl guarantee only fires on
  // the lower-back ('spate') exclusion path. So on a masa v-taper (legs de-emphasized) the
  // glutes get covered but hams stay zero (62 masa/forta grid configs had hams=0 — e.g.
  // p4/p5/p8_v-taper_3d glutes present, hams 0). De-emphasis means MAINTENANCE (MEV), never
  // zero, for a growth goal. When ON + the cluster TRAINS legs (full/lower/legs → targets
  // includes hamstrings) + no hamstring-primary slot landed, inject ONE hamstring-primary
  // movement: PREFER a hinge (RDL / Glute-Ham Raise — a tier<=COMPOUND_TIER hams compound),
  // fall back to a machine LEG CURL. INJURY-COMPOSED: when a spate (disc/lower-back) signal
  // is present the dedicated Cycle-7 leg-curl guarantee already owns this path (a spine-
  // neutral leg curl, no axial-load hinge) — this block DEFERS so it never double-injects
  // and never seats a contraindicated hinge. Knee injury (p6) keeps leg curl knee-friendly
  // (it is in the already-filtered pool). ORPHAN-SAFE + LENGTH-STABLE (mirrors the leg-curl
  // guarantee): PREFER to REPLACE an over-slotted NON-FOCUS isolation (group keeps >=1
  // slot, count unchanged so the time-trim is not perturbed); a FOCUS surplus is only
  // displaceable while its group STILL strictly leads (never drop the focus below its lead);
  // only ADD when no victim exists AND there is room (within effectiveCap — respects the
  // beginner 5-cap); else accept the gap (a saturated single-slotted day) rather than orphan
  // a major. Runs AFTER the posterior floor (the prior final word on leg slots) so a glute-
  // only posterior cover can no longer leave hams at 0. Scope is goal-gated at the seam:
  // mentenanta / slabire / age>=60 are NOT here (reduced lower volume is correct for them —
  // left to the existing floors). OFF / non-leg cluster / spate exclusion → never runs →
  // byte-identical.
  if (
    ctx?.hamstringFloor === true
    && targets.includes('picioare-hamstrings')
    && !excludedMovements?.tokens?.has?.(LUMBAR_HINGE_SENTINEL)
  ) {
    const primaryOfName = (name) => getExerciseMetadata(name)?.muscle_target_primary;
    const hasHams = chosen.some((e) => primaryOfName(e.name) === 'picioare-hamstrings');
    if (!hasHams) {
      const hamsPool = pools.find((p) => p.group === 'picioare-hamstrings')?.pool ?? [];
      // PREFER a hinge — a tier<=COMPOUND_TIER hams compound (RDL / Glute-Ham Raise /
      // trap-bar); FALL BACK to a machine leg curl (movementKey token `leg-curl`); then any
      // available hams movement. (On a spate persona this block has already DEFERRED, so a
      // contraindicated hinge can never be reached here.)
      const inject =
        hamsPool.find(
          (e) => !isTaken(e) && (getExerciseMetadata(e.name)?.tier ?? 2) <= COMPOUND_TIER,
        )
        || hamsPool.find(
          (e) => !isTaken(e) && movementKey(e.name, e.meta).split('::')[1] === 'leg-curl',
        )
        || hamsPool.find((e) => !isTaken(e));
      if (inject) {
        // Per-group slot census so a REPLACE only ever targets an OVER-slotted group.
        const slotCount = {};
        for (const e of chosen) {
          const g = primaryOfName(e.name);
          if (g) slotCount[g] = (slotCount[g] || 0) + 1;
        }
        // Largest NON-emphasized group's slot count — the bar an emphasized group must stay
        // strictly above to remain the day's volume LEAD (mirrors the leg-curl guarantee).
        let maxNonEmph = 0;
        for (const [g, n] of Object.entries(slotCount)) {
          if (!emphSet.has(g) && n > maxNonEmph) maxNonEmph = n;
        }
        // Lowest-priority (highest-index) non-anchor isolation whose group still has another
        // slot — replacing it never orphans + keeps the count. PREFER an UPPER NON-FOCUS
        // surplus (pass 1) so the focus is never thinned while a non-focus accessory exists;
        // then a FOCUS upper surplus (pass 2). A FOCUS group is displaceable only while it
        // keeps a per-day CO-LEAD after the trade (>= the day's max non-focus): on a full-body
        // day the focus is the WEEK's volume lead across its OTHER days, so trading ONE surplus
        // focus isolation down to a tie (never below) leaves the focus the week lead while a
        // missing PRIME MOVER (hams) is restored — the elite-coach trade. Excludes LEG groups
        // in passes 1-2 (handled by pass 3).
        let removeIdx = -1;
        for (const focusOk of [false, true]) {
          for (let i = chosen.length - 1; i >= 0; i--) {
            if ((getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
            const g = primaryOfName(chosen[i].name);
            if (!g || LEG_REGION_GROUPS.includes(g)) continue;    // upper isolations only here
            if ((slotCount[g] || 0) <= 1) continue;                // would orphan g
            if (emphSet.has(g) !== focusOk) continue;              // non-focus surplus first
            if (emphSet.has(g) && (slotCount[g] - 1) < maxNonEmph) continue; // keep focus co-lead
            removeIdx = i;
            break;
          }
          if (removeIdx >= 0) break;
        }
        // Pass 3 — when NO upper surplus exists (the at-cap masa full-body case: the contracts/
        // dedup flags single-slot every upper group and the posterior floor already seated a
        // glute + quad), trade an OVER-SLOTTED QUAD or GLUTE's 2nd slot for the hamstring (the
        // prompt-sanctioned "over-slotted quad's 2nd slot" swap). For a masa goal the posterior
        // chain is over-weighted on quads/glutes while hams is ZERO — rebalancing one surplus
        // quad/glute slot into a hamstring is the correct length-stable trade. Never the group's
        // LAST slot (no orphan); prefer the lowest-priority (highest-index) ISOLATION, then any
        // surplus slot. Walk fese (glutes) before quads so a quad compound anchor is preferred-
        // kept; never touch a hams slot (it is the target).
        if (removeIdx < 0) {
          const SURPLUS_LEG_PREFERENCE = ['fese', 'picioare-quads'];
          for (const onlyIso of [true, false]) {
            for (let i = chosen.length - 1; i >= 0 && removeIdx < 0; i--) {
              const g = primaryOfName(chosen[i].name);
              if (!SURPLUS_LEG_PREFERENCE.includes(g)) continue;   // quad/glute surplus only
              if ((slotCount[g] || 0) <= 1) continue;               // never a leg's last slot
              if (onlyIso && (getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER) continue;
              removeIdx = i;
            }
            if (removeIdx >= 0) break;
          }
        }
        if (removeIdx >= 0) {
          const removed = chosen[removeIdx];
          chosenNames.delete(removed.name);
          chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
          const rg = getExerciseMetadata(removed.name).muscle_target_primary;
          if (rg && groupCount[rg]) groupCount[rg] -= 1;
          chosen.splice(removeIdx, 1, { name: inject.name, sets: DEFAULT_SETS });
          chosenNames.add(inject.name);
          chosenMovements.add(dedupKey(inject.name, inject.meta));
          groupCount['picioare-hamstrings'] = (groupCount['picioare-hamstrings'] || 0) + 1;
        } else if (chosen.length < effectiveCap) {
          // No over-slotted non-leg isolation to swap, but the session has room — add.
          take(inject, DEFAULT_SETS);
        }
        // else: saturated + every non-leg group single-slotted → accept the gap (no orphan).
      }
    }
  }

  // #FOCUS-LEAD ARMS SLOT GUARANTEE (ctx.focusLeadSplits, dp_focus_lead_splits_v1).
  // On an ARMS-focus UPPER/LOWER split the arms get NO day of their own — they ride one
  // leftover slot per upper day, so direct biceps/triceps DELIVER ~bi4/tri5 while back/
  // legs lead (p2/p7_arms_4d). The dp_arms_signature_v1 budget floor cannot help: the
  // slot scarcity caps delivery below the budget. Here, on an upper day, GUARANTEE that
  // each direct-arm group (biceps/triceps) reaches a SECOND slot by REPLACING an over-
  // slotted NON-FOCUS UPPER surplus (back/chest — group keeps >=1 slot, count unchanged
  // so the time-trim is undisturbed); never orphan a major, never the focus's own slot.
  // The non-focus set-trim below then drops the surplus majors toward MEV so bi+tri lead.
  // Only fires on an `upper` cluster (the lower day carries no arms). OFF / non-arms /
  // non-upper → never runs → byte-identical.
  if (
    ctx?.focusLeadSplits
    && ctx.focusLeadSplits.focus === 'arms'
    && ctx.focusLeadSplits.armSlotGuarantee === true
    && cluster === 'upper'
  ) {
    const primaryOfName = (name) => getExerciseMetadata(name)?.muscle_target_primary;
    for (const armGroup of ['biceps', 'triceps']) {
      // Per-group slot census (recomputed each pass — a prior swap changes the counts).
      const slotCount = {};
      for (const e of chosen) {
        const g = primaryOfName(e.name);
        if (g) slotCount[g] = (slotCount[g] || 0) + 1;
      }
      if ((slotCount[armGroup] || 0) >= 2) continue; // already has a 2nd arm slot
      // A 2nd direct-arm exercise from the group's pool, not already taken.
      const inject = (pools.find((p) => p.group === armGroup)?.pool ?? []).find(
        (e) => !isTaken(e),
      );
      if (!inject) continue; // no distinct 2nd arm movement available — accept the gap
      // Replace an OVER-SLOTTED NON-FOCUS UPPER lift whose group keeps >=1 slot (never
      // orphan). UPPER non-arm majors only (back/chest/shoulders) — never a leg (the lower
      // day owns those) and never an arm group. PREFER an ISOLATION (pass 1, lowest-priority
      // first); fall back to a non-focus COMPOUND surplus (pass 2 — on a pull-heavy upper day
      // both back slots can be vertical-pull/row COMPOUNDS, so a 2nd back compound is the only
      // surplus; trading it for the missing focus arm is the elite-coach call — back keeps its
      // other slot). Never the group's LAST slot (no orphan).
      const NONFOCUS_UPPER = new Set(['spate', 'piept', 'umeri']);
      let removeIdx = -1;
      for (const isoOnly of [true, false]) {
        for (let i = chosen.length - 1; i >= 0; i--) {
          const isCompound = (getExerciseMetadata(chosen[i].name).tier ?? 2) <= COMPOUND_TIER;
          if (isoOnly && isCompound) continue;          // pass 1: spare compounds
          const g = primaryOfName(chosen[i].name);
          if (!g || !NONFOCUS_UPPER.has(g)) continue;
          if ((slotCount[g] || 0) <= 1) continue;       // would orphan g
          removeIdx = i;
          break;
        }
        if (removeIdx >= 0) break;
      }
      if (removeIdx >= 0) {
        const removed = chosen[removeIdx];
        chosenNames.delete(removed.name);
        chosenMovements.delete(dedupKey(removed.name, getExerciseMetadata(removed.name)));
        const rg = getExerciseMetadata(removed.name).muscle_target_primary;
        if (rg && groupCount[rg]) groupCount[rg] -= 1;
        chosen.splice(removeIdx, 1, { name: inject.name, sets: DEFAULT_SETS });
        chosenNames.add(inject.name);
        chosenMovements.add(dedupKey(inject.name, inject.meta));
        groupCount[armGroup] = (groupCount[armGroup] || 0) + 1;
      }
      // else: no over-slotted non-focus upper surplus → accept the gap (never orphan).
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
    // CONCENTRATION CAP (2026-06-11) — the emphasized per-exercise CEILING (4)
    // applies whenever the group is the FOCUS, independent of the belowCeiling
    // headroom gate that controls the volume BOOST. An at-MAV focus group thus
    // still caps its compound at 4 (surplus → a 2nd variation) instead of the
    // legacy 5 (his v-taper 4d OHP 5×2=10/wk). Same flag as the boost.
    const isEmphasizedGroup = emphasisSetsBoost && emphSet.has(g);
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
      structuralDemoteSet, isEmphasizedGroup,
    );
    exs.forEach((e, i) => { setsByName[e.name] = counts[i]; });
  }
  let exercises = chosen.map((e) => ({
    name: e.name,
    sets: setsByName[e.name] ?? DEFAULT_SETS,
  }));

  // CROSS-DAY LEDGER SET FLOORS (gap 3, dp_week_ledger_v1) — when the week ledger
  // projects a delt sub-bucket (lateral / rear) BELOW the founder's ≥6-set weekly quota,
  // the carrier isolation on THIS qualifying day must train at its full per-exercise
  // dose (not the thin 2-set default) so the slots that exist across the week add up to
  // the quota. This is a per-exercise FLOOR (only ever RAISES a too-thin dose, bounded
  // by the junk-volume ceiling baked into the floor value), applied AFTER distribution so
  // it does not perturb the budget math. Ledger absent / no delt contract / quota already
  // met → empty map → no-op (byte-identical). Determinism: reads only the ledger numbers.
  const setFloors = ctx?.weeklyLedger
    ? ledgerSetFloors(ctx?.focusId, ctx?.daysPerWeek, ctx.weeklyLedger)
    : {};
  if (Object.keys(setFloors).length > 0) {
    exercises = exercises.map((e) => {
      const tags = deriveExerciseTags(e.name, getExerciseMetadata(e.name), dedupKey);
      let floor = 0;
      for (const [tag, minSets] of Object.entries(setFloors)) {
        if (tags.has(tag) && minSets > floor) floor = minSets;
      }
      return floor > e.sets ? { ...e, sets: floor } : e;
    });
  }
  // §beginner-volume-v2 — the cross-day ledger delt-quota floor (above) RAISES a
  // beginner's emphasized lateral/rear isolations back to the ≥6-set weekly dose,
  // re-inflating the focus muscle to ~20/wk (the over-volume the eval flagged). For a
  // novice the WIDTH SLOTS are what matter (the exposure the focus promises) — keep
  // them, but cap each emphasized-group ISOLATION at MEV (2): the weekly quota is met
  // by the slot COUNT (3 slots × 2 = 6), not a 3-set-per-lift dose. The COMPOUND
  // (press) is exempt (it stays at the distribution floor). Gated on the v2 ctx flag +
  // T0; OFF / trained → no clamp → byte-identical (the ledger floor stands). This is
  // the last pass that the ledger floor can no longer undo.
  if (ctx?.beginnerEmphasisSlotCap === true && ctx?.profileTier === 'T0' && emphSet.size > 0) {
    // An emphasized group is clampable ONLY when it has a COMPOUND in the session
    // (the press/row carries the dose) — an isolation-only emphasized group
    // (biceps/triceps/calves) is EXEMPT so the focus stays ABOVE its MEV.
    const emphGroupHasCompound = new Set();
    for (const e of exercises) {
      const m = getExerciseMetadata(e.name);
      const g = m?.muscle_target_primary;
      if (g && emphSet.has(g) && (m?.tier ?? 2) === COMPOUND_TIER) emphGroupHasCompound.add(g);
    }
    exercises = exercises.map((e) => {
      const meta = getExerciseMetadata(e.name);
      const g = meta?.muscle_target_primary;
      const isIsolation = (meta?.tier ?? 2) > COMPOUND_TIER;
      return g && emphSet.has(g) && emphGroupHasCompound.has(g) && isIsolation && e.sets > BEGINNER_EMPHASIS_ISOLATION_MAX_SETS
        ? { ...e, sets: BEGINNER_EMPHASIS_ISOLATION_MAX_SETS }
        : e;
    });
  }

  // BEGINNER FOCUS WEEKLY-BAND CLAMP (dp_beginner_session_size_v1 refine 2026-06-14).
  // The 5-slot cap concentrated the focus muscle, but at freq 3-5 the focus's WEEKLY
  // DELIVERED sets still overshot the novice band: chest_3d 18, back_3d 20, shoulders_3d
  // 18, v-taper_5d back 18 + shoulders 16 (the judge: "advanced-volume territory far
  // above the beginner band"). The cause is DELIVERED sets, not slot count — the focus
  // press anchors carry 3-4 sets × the days the group is trained, and the cross-day delt
  // ledger floor re-inflates the isolations (beginner-volume-v2 exempts the compound, so
  // it cannot fix this). Enforce the band on DELIVERED sets directly: bound each
  // EMPHASIZED group's THIS-SESSION total to floor(CEIL / sessions/week) so the WEEKLY
  // sum lands ≤ the beginner band ceiling (~12). freq-2 (group trained ~2×/wk) →
  // floor(12/2)=6 sets/session, which the in-band freq-2 wins already sit at-or-below →
  // PRESERVED; freq-3+ (3-5×/wk) → 4-3 sets/session → ~9-12 weekly, not 18-20. Trim the
  // group's HIGHEST-set exercise first (the compound press surplus), never below SET_FLOOR
  // (2 = MEV — the focus still LEADS its band, never gutted). Runs AFTER the ledger floor
  // + beginner-volume-v2 so neither can re-inflate past the band. Beginner-only (gated on
  // ctx.beginnerSessionSize, the same flag) → null / non-beginner → no-op → byte-identical.
  if (typeof ctx?.beginnerSessionSize === 'number' && emphSet.size > 0) {
    const FOCUS_SET_FLOOR = 2; // MEV — the focus is trimmed toward band, never gutted
    for (const g of emphSet) {
      const sessions = Math.max(1, Number(ctx?.weeklySessionsPerGroup?.[g]) || 1);
      const maxGroupSets = Math.max(
        FOCUS_SET_FLOOR,
        Math.floor(BEGINNER_WEEKLY_BAND_CEILING / sessions),
      );
      // Indices of this group's exercises, this session.
      const idxs = exercises
        .map((e, i) => ({ i, g: getExerciseMetadata(e.name)?.muscle_target_primary }))
        .filter((x) => x.g === g)
        .map((x) => x.i);
      let total = idxs.reduce((n, i) => n + (exercises[i].sets || 0), 0);
      // Trim the highest-set exercise of the group first until the group total is in band
      // or every slot is at the floor. Deterministic (descending sets, then index).
      while (total > maxGroupSets) {
        let pick = -1;
        for (const i of idxs) {
          if ((exercises[i].sets || 0) <= FOCUS_SET_FLOOR) continue;
          if (pick < 0 || exercises[i].sets > exercises[pick].sets) pick = i;
        }
        if (pick < 0) break; // every slot at the floor — cannot trim further
        exercises[pick] = { ...exercises[pick], sets: exercises[pick].sets - 1 };
        total -= 1;
      }
    }
  }

  // LOW-CAPACITY PER-MUSCLE WEEKLY-BAND CLAMP (dp_lowcap_weekly_band_v1, 2026-06-14).
  // For a MAINTENANCE-goal or OLDER (age >=60) trainee, bound EACH trained muscle's
  // WEEKLY delivered volume to the maintenance band so the total does NOT scale
  // linearly with frequency (the eval defect: p9 up to 67/wk at freq-7, p10 71/wk at
  // freq-5 — "over-prescribed for a maintenance/older trainee"). Mirror the Cycle-15
  // beginner FOCUS weekly-band clamp but apply to ALL trained muscles: bound each
  // group's THIS-SESSION delivered sets to its band cap (a primary mover divides the
  // ceiling by its session count; an over-counted accessory holds its concentrated day
  // at the maintenance dose) so weekly lands in the maintenance band. Trim the group's
  // HIGHEST-set exercise first toward MEV (2), then DROP the lowest-priority extra slot
  // when a muscle still over-shoots with every slot at MEV — never the only slot (no
  // orphan), and a muscle present in a session keeps >= the maintenance floor weekly.
  // Composes with the time-cap (dp_hard_time_cap_v1) + senior cap below —
  // each only reduces, so the tighter result wins. ctx.lowCapWeeklyBand null (flag
  // OFF / trained adult under 60) → no-op → byte-identical.
  const lowCapBand = ctx?.lowCapWeeklyBand;
  if (lowCapBand && typeof lowCapBand === 'object'
    && typeof lowCapBand.perMuscleCeiling === 'number') {
    const ceiling = lowCapBand.perMuscleCeiling;
    // TWO-TIER ceiling (focus-aware refine): the FOCUS / emphasized-region muscles get the
    // higher LOWCAP_FOCUS_CEILING so the focus stays EMPHASIZED and LEADS the week, while
    // non-focus muscles keep perMuscleCeiling (drop to maintenance, bounding the total). The
    // band's emphasizedGroups are the RO group ids the focus emphasizes (v-taper = BOTH umeri
    // AND spate) — the same emphSet the getDailyWorkout seam threads. Empty / balanced →
    // every group uses perMuscleCeiling → identical to the pre-refine flat clamp.
    const focusGroups = new Set(
      Array.isArray(lowCapBand.emphasizedGroups) ? lowCapBand.emphasizedGroups : [],
    );
    const dropped = new Set();
    // Group this session's exercises by their primary muscle.
    const byMuscle = /** @type {Record<string, number[]>} */ ({});
    exercises.forEach((e, i) => {
      const g = getExerciseMetadata(e.name)?.muscle_target_primary;
      if (!g) return;
      (byMuscle[g] = byMuscle[g] || []).push(i);
    });
    // Real per-group weekly training frequency (the getDailyWorkout seam snapshots it
    // BEFORE the de-emphasis divisor inflation, so a de-emphasized major trained truly
    // once is not over-trimmed). Fall back to ctx.weeklySessionsPerGroup when absent.
    const trueSessions = lowCapBand.sessionsPerGroup;
    for (const [g, idxsAll] of Object.entries(byMuscle)) {
      const sessions = Math.max(
        1,
        Number(trueSessions?.[g] ?? ctx?.weeklySessionsPerGroup?.[g]) || 1,
      );
      // An OVER-COUNTED accessory (biceps/triceps/forearms/shoulders) is a weight-map
      // key of several clusters but earns a real slot on ONE concentrated arm/shoulder
      // day — its STRUCTURAL session count over-estimates realized exposures, so dividing
      // the ceiling by it would crush its single realized exposure to MEV (biceps trained
      // truly once → 2/wk). When such a group is CONCENTRATED here (≥2 slots = its primary
      // day) it is held at the maintenance dose instead. A PRIMARY MOVER's session count
      // is realized accurately (the splits slot it every counted day) → it uses the
      // divisor cap below and a 2x major correctly lands ~4-6 weekly (light per day).
      // A FOCUS / emphasized-region muscle uses the HIGHER focus ceiling so it stays the
      // week's signature (it must LEAD). A focus muscle is NOT treated as an over-counted
      // accessory (umeri is an over-counted accessory key, but on a v-taper it is a FOCUS
      // pillar that must be emphasized, not floored to maintenance) — it divides the focus
      // ceiling like a primary mover so a 2-session focus lands ~10/wk (leads), not 4.
      const isFocusGroup = focusGroups.has(g);
      const groupCeiling = isFocusGroup ? LOWCAP_FOCUS_CEILING : ceiling;
      const protectAccessory =
        !isFocusGroup
        && LOWCAP_OVERCOUNTED_ACCESSORIES.has(g) && idxsAll.length >= 2;
      // A PRIMARY MOVER is realized accurately by the structural session count: its band
      // cap = floor(ceiling/sessions) (a 2-session major → ~2/session → ~4-6/wk; a 1-
      // session major → the ceiling), floored at the per-session MEV (2) so a single
      // exposure stays trained. This keeps a major's WEEKLY in the maintenance band
      // without crushing it under the floor (sessions × cap ≥ sessions × 2 ≥ the floor).
      // An OVER-COUNTED ACCESSORY's structural count is inflated (it slots once on a
      // concentrated arm/shoulder day), so on that concentrated day it is held at exactly
      // the maintenance dose (its single realized exposure stays ≥ the floor, not crushed
      // to MEV by the inflated divisor) — cap == floor == maintFloor.
      // A FOCUS group's per-session cap floors at LOWCAP_FOCUS_PER_SESSION_MIN (3) so it
      // stays STRICTLY above the non-focus per-session MEV (2) at EVERY frequency — the
      // signature leads even when the divisor (floor(ceiling/sessions)) would otherwise
      // collapse it to MEV at freq >=4. A non-focus / primary mover floors at MEV.
      const perSessionFloor = isFocusGroup ? LOWCAP_FOCUS_PER_SESSION_MIN : LOWCAP_PER_SESSION_MEV;
      const maxGroupSets = protectAccessory
        ? LOWCAP_MAINT_FLOOR
        : Math.max(perSessionFloor, Math.floor(groupCeiling / sessions));
      const idxs = idxsAll.slice();
      const totalOf = () => idxs.reduce((n, i) => n + (exercises[i].sets || 0), 0);
      // STEP 1 — trim the group's highest-set exercise down toward the per-exercise MEV
      // (2). Deterministic (highest sets, then lowest index). Maintenance legitimately
      // sits below growth-MEV, so a muscle's per-exercise dose can land at 2.
      while (totalOf() > maxGroupSets) {
        let pick = -1;
        for (const i of idxs) {
          if ((exercises[i].sets || 0) <= LOWCAP_PER_SESSION_MEV) continue;
          if (pick < 0 || exercises[i].sets > exercises[pick].sets) pick = i;
        }
        if (pick < 0) break; // every slot at MEV — STEP 2 (slot drop) handles the rest
        exercises[pick] = { ...exercises[pick], sets: exercises[pick].sets - 1 };
      }
      // STEP 2 — when the muscle still over-shoots its band with EVERY slot already at
      // MEV (a high-frequency split packed it into many 2-set slots — extra DAYS should
      // be lighter, not more total volume), DROP the lowest-priority extra slot. Keep at
      // least ONE slot for the muscle (never orphan) and never the lead/lowest-index
      // slot. A maintenance trainee needs one exposure of a muscle per session, not
      // several — this is the slot-side complement of the set trim.
      // EXCEPTION — a FOCUS group's multi-slot day IS the week's signature. Dropping its
      // 2nd slot (when both are already at MEV and only ~1 over the divisor cap) collapses
      // the focus to a single MEV exposure → it ties/loses the lead vs the non-focus MEV
      // floor (the freq-3 regression: v-taper umeri 12→6). STEP 1 already bounded its per-
      // exercise sets and the FOCUS per-session floor (LOWCAP_FOCUS_PER_SESSION_MIN) keeps a
      // single surviving slot above the non-focus MEV; the focus keeps its slots so it LEADS.
      // Non-focus groups still slot-drop (extra days SHOULD be lighter, not more volume). The
      // residual freq 4-5 total overflow is the FREQUENCY/STRUCTURE reshape — out of scope.
      while (!isFocusGroup && totalOf() > maxGroupSets && idxs.length > 1) {
        // Drop the LAST (lowest-priority by session order) remaining slot of the group.
        const drop = idxs[idxs.length - 1];
        dropped.add(drop);
        idxs.pop();
      }
    }
    if (dropped.size > 0) {
      exercises = exercises.filter((_, i) => !dropped.has(i));
    }
  }

  // #FOCUS-LEAD NON-FOCUS REGION TRIM (ctx.focusLeadSplits, dp_focus_lead_splits_v1).
  // On a focus-emphasis UPPER/LOWER split where the focus region does NOT clearly lead,
  // bound EACH non-focus MAJOR group's WEEKLY delivered volume toward its MEV so the focus
  // region strictly leads (lower focus: upper back/chest/shoulders → MEV so legs lead;
  // arms focus: back/chest/shoulders/quads/hams/glutes → MEV so the floored bi/tri lead).
  // Mirrors the lowcap weekly-band technique: bound each group's THIS-SESSION delivered
  // sets to floor(MEV / sessions/week) (its weekly sum lands ~MEV), trimming the group's
  // HIGHEST-set exercise first toward the per-exercise MEV (2). SLOT-PRESERVING: never
  // drops a slot (no orphan, length/coverage preserved) — only trims sets, never below the
  // per-exercise MEV (2). The maintenance MEV is the supreme floor (de-emphasis means
  // MAINTENANCE, never zero). Composes with lowcap/senior/time caps (each only reduces, the
  // tighter wins). Null (focus leads / not a U/L split / flag OFF) → no-op → byte-identical.
  const focusLead = ctx?.focusLeadSplits;
  if (focusLead && typeof focusLead === 'object'
    && focusLead.nonFocusMevCeilings && typeof focusLead.nonFocusMevCeilings === 'object') {
    const FL_PER_EX_MEV = 2; // per-exercise MEV — never trim a slot below this
    const ceilings = focusLead.nonFocusMevCeilings;
    const flSessions = focusLead.sessionsPerGroup;
    // ARMS — floor each direct-arm exercise's dose on the upper days so the WEEKLY
    // bi/tri delivery reaches at least its MEV (the slot guarantee adds the slots; this
    // floors the per-slot SETS so 1-2 slots × the two upper days clear MEV). Bounded by
    // the dp_arms_signature_v1 budget floor (bi 22 / tri 18 — well above this), so it
    // surfaces intended volume, never invents it. Runs BEFORE the non-focus trim so the
    // arms rise while the non-focus majors fall. Only fires on the arms focus + an upper
    // day (cluster trains the arms). RAISE-only (never lowers a higher dose).
    if (focusLead.focus === 'arms' && cluster === 'upper') {
      const FL_ARM_FLOOR = 3; // per-exercise floor so 2 upper days × 1-2 slots ≥ MEV
      exercises = exercises.map((e) => {
        const g = getExerciseMetadata(e.name)?.muscle_target_primary;
        return (g === 'biceps' || g === 'triceps') && e.sets < FL_ARM_FLOOR
          ? { ...e, sets: FL_ARM_FLOOR }
          : e;
      });
    }
    // Group this session's exercises by primary muscle.
    const byMuscle = /** @type {Record<string, number[]>} */ ({});
    exercises.forEach((e, i) => {
      const g = getExerciseMetadata(e.name)?.muscle_target_primary;
      if (!g) return;
      (byMuscle[g] = byMuscle[g] || []).push(i);
    });
    for (const [g, idxs] of Object.entries(byMuscle)) {
      const mev = ceilings[g];
      if (typeof mev !== 'number' || mev <= 0) continue; // only the listed non-focus majors
      const sessions = Math.max(
        1,
        Number(flSessions?.[g] ?? ctx?.weeklySessionsPerGroup?.[g]) || 1,
      );
      // The per-session delivered cap whose weekly sum lands ~MEV, floored at the
      // per-exercise MEV so a single exposure stays trained (never zeroed).
      const maxGroupSets = Math.max(FL_PER_EX_MEV, Math.floor(mev / sessions));
      const totalOf = () => idxs.reduce((n, i) => n + (exercises[i].sets || 0), 0);
      // Trim the group's highest-set exercise first toward the per-exercise MEV.
      while (totalOf() > maxGroupSets) {
        let pick = -1;
        for (const i of idxs) {
          if ((exercises[i].sets || 0) <= FL_PER_EX_MEV) continue;
          if (pick < 0 || exercises[i].sets > exercises[pick].sets) pick = i;
        }
        if (pick < 0) break; // every slot at MEV — slot-preserving, no drop
        exercises[pick] = { ...exercises[pick], sets: exercises[pick].sets - 1 };
      }
    }
  }

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
        for (const tag of deriveExerciseTags(name, meta, dedupKey)) {
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
