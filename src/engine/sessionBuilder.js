// ══ SESSION BUILDER — Construieste lista de exercitii pentru o sesiune ═══
// Pure function: no side effects, no class, no imports from app state.
//
// WP-4 (P3 moat): selection now pulls from the 657-entry exerciseLibrary by
// muscle group instead of a hardcoded ~22-name table. Filters: muscle group
// (session type) x available equipment (coarse equipment_type) x tier
// (persona/experience). Selection is DETERMINISTIC (seeded on user+day) and
// ANCHORS on the known engine names that carry PR history, so existing users
// keep continuity (the 18/21 names that exist verbatim as library keys).

import { EXERCISE_METADATA, getExerciseMetadata } from './exerciseLibrary.js';
import { BIG11_RO_TO_EN_MAP, CLUSTER_BIG6_TO_BIG11_WEIGHT } from './periodization/constants.js';

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
// Typical weekly frequency a muscle group is trained — the periodization
// volume target is sets/WEEK, but buildSession plans ONE session, so the
// weekly target is divided across the sessions that hit the group. Used as a
// LAST-RESORT fallback only when ctx.weeklySessionsPerGroup has no real
// frequency for the group (NOT a blind constant divisor any more — BUG 1).
const WEEKLY_FREQUENCY = 2;
// A library tier-1 entry IS the compound anchor of its group (force_demand:high,
// big movement). Used by the set distribution to weight the anchor higher.
const COMPOUND_TIER = 1;

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
 * @param {Array<{tier: number}>} exsInGroup - chosen exercises of this group (with tier)
 * @param {number|null} budget - per-session set budget for the group (sessionSetBudget)
 * @param {'recovered'|'partial'|'fatigued'} [state] - this group's recovery state
 * @returns {number[]} set count per exercise, index-aligned with exsInGroup
 */
function distributeGroupSets(exsInGroup, budget, state) {
  const n = exsInGroup.length;
  if (n === 0) return [];
  // No volume signal → every exercise keeps the stable default (no-op path).
  if (budget == null) return exsInGroup.map(() => DEFAULT_SETS);

  // Weight compounds higher than isolation so the anchor earns the volume.
  const COMPOUND_WEIGHT = 2;
  const ISOLATION_WEIGHT = 1;
  const weightOf = (e) => (e.tier === COMPOUND_TIER ? COMPOUND_WEIGHT : ISOLATION_WEIGHT);
  const totalWeight = exsInGroup.reduce((s, e) => s + weightOf(e), 0);

  // A non-recovered group: lower the compound floor (so the cut can reach below
  // the usual 3) AND shave one set per exercise (the visible "lighter today").
  const nonRecovered = state === 'partial' || state === 'fatigued';
  const compoundFloor = nonRecovered ? NONRECOVERED_COMPOUND_MIN_SETS : COMPOUND_MIN_SETS;
  const setShave = nonRecovered ? 1 : 0;

  return exsInGroup.map((e) => {
    const isCompound = e.tier === COMPOUND_TIER;
    const share = (budget * weightOf(e)) / totalWeight;
    const rounded = Math.round(share) - setShave;
    const lo = isCompound ? compoundFloor : ISOLATION_MIN_SETS;
    const hi = isCompound ? COMPOUND_MAX_SETS : ISOLATION_MAX_SETS;
    return Math.min(hi, Math.max(lo, rounded));
  });
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
 * @returns {Array<{name: string, meta: object}>}
 */
function poolForGroup(group, available, maxTier, maxSkill, prNames, seed) {
  const pool = [];
  for (const [name, meta] of Object.entries(EXERCISE_METADATA)) {
    if (meta.muscle_target_primary !== group) continue;
    if (meta.tier > maxTier) continue;
    if (skillRankOf(meta) > maxSkill) continue; // capability gate: never above skill ceiling
    if (!equipmentOk(meta, available)) continue;
    pool.push({ name, meta });
  }
  // Deterministic ordering: PR-anchored names first (continuity), then plain
  // anchors, then the rest. Within each band, seeded-stable by name hash.
  pool.sort((a, b) => {
    const ra = rank(a.name, prNames);
    const rb = rank(b.name, prNames);
    if (ra !== rb) return ra - rb;
    return seededKey(a.name, seed) - seededKey(b.name, seed);
  });
  return pool;
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
  ['lunge', 'lunge'], ['calf', 'calf'], ['press', 'press'], ['dip', 'dip'],
  ['fly', 'fly'], ['pec', 'fly'], ['curl', 'curl'],
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
 * } | null | undefined} ctx
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
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

  // Pools per target group (ordered: PR-anchored -> anchor -> new, seeded-stable).
  const pools = targets.map((g) => ({
    group: g,
    pool: poolForGroup(g, available, maxTier, maxSkill, prNames, seed),
  }));

  // Weakness bias: when the Specialization engine flags a weak Big-11 group
  // that this session trains, fill that group FIRST in the round-robin so it
  // wins the limited SESSION_SIZE slots = MORE exercises (more volume) on the
  // weak group. weakGroups arrive as Big-11 RO (specialization target), the
  // same vocabulary as the pool group keys (WP-3 bridge) so they match directly.
  const weakSet = new Set(ctx?.weakGroups ?? []);
  if (weakSet.size > 0) {
    pools.sort((a, b) => (weakSet.has(b.group) ? 1 : 0) - (weakSet.has(a.group) ? 1 : 0));
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
  }
  const groupCount = {};

  const chosen = [];
  const chosenNames = new Set();
  // BUG 5 — dedup by MOVEMENT (muscle + movement token), not exact name, so two
  // same-movement variants (e.g. two chest flyes under different names) can never
  // both land in one plan. chosenNames stays as the exact-name guard underneath.
  const chosenMovements = new Set();
  const isTaken = (e) =>
    chosenNames.has(e.name) || chosenMovements.has(movementKey(e.name, e.meta));
  const take = (e, sets) => {
    chosen.push({ name: e.name, sets });
    chosenNames.add(e.name);
    chosenMovements.add(movementKey(e.name, e.meta));
    const g = e.meta?.muscle_target_primary;
    if (g) groupCount[g] = (groupCount[g] || 0) + 1;
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
      const preferredSameMovement = pool.some(
        (o) => movementKey(o.name, o.meta) === mk && rank(o.name, prNames) < myRank,
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
  let progressed = true;
  while (chosen.length < sessionSize && progressed) {
    progressed = false;
    for (const { group, pool } of pools) {
      if (chosen.length >= sessionSize) break;
      const capped = !weakSet.has(group) && (groupCount[group] || 0) >= slotCap[group];
      if (capped) continue;
      const next = pool.find((e) => !isTaken(e));
      if (next) {
        take(next, DEFAULT_SETS);
        progressed = true;
      }
    }
  }

  // Remainder pass — if the weighted caps left the session under budget (e.g. a
  // small cluster whose caps summed below sessionSize, or thin pools), top up
  // ignoring caps so the session still reaches its volume-driven size when the
  // library can supply it.
  progressed = true;
  while (chosen.length < sessionSize && progressed) {
    progressed = false;
    for (const { pool } of pools) {
      if (chosen.length >= sessionSize) break;
      const next = pool.find((e) => !isTaken(e));
      if (next) {
        take(next, DEFAULT_SETS);
        progressed = true;
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
  // Per-exercise set count, keyed by name (group distribution applied once).
  const setsByName = /** @type {Record<string, number>} */ ({});
  for (const [g, exs] of Object.entries(byGroup)) {
    const budget = sessionSetBudget(g, ctx?.volumeTargets, ctx?.weeklySessionsPerGroup);
    const counts = distributeGroupSets(exs, budget, recoveryState[g]);
    exs.forEach((e, i) => { setsByName[e.name] = counts[i]; });
  }
  let exercises = chosen.map((e) => ({
    name: e.name,
    sets: setsByName[e.name] ?? DEFAULT_SETS,
  }));

  // Weakness-prioritized ordering is LIVE whenever the pipeline supplies a weak
  // group (the Specialization engine only emits one when its 4-gate eligibility
  // passes, so presence of weakGroups IS the gate — no separate global flag is
  // needed). Pairs with the pool-bias above: the weak group gets BOTH more
  // volume (extra slots) and front-of-session ordering.
  if ((ctx?.weakGroups?.length ?? 0) > 0) {
    exercises = prioritizeWeakGroups(exercises, ctx?.weakGroups ?? []);
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

  const weak = exercises.filter((e) => isWeak(e.name));
  const rest = exercises.filter((e) => !isWeak(e.name));

  // Place weak exercises first (up to 2 positions), then the rest
  return [...weak.slice(0, 2), ...rest, ...weak.slice(2)];
}
