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

// SESSION_SIZE is the MAX exercises per session (sanity ceiling, anti-2h
// session), NOT a fixed count. The real count now falls out of the weekly
// volume budget (computeSessionExerciseCount) clamped to [MIN_SESSION, SESSION_SIZE].
const SESSION_SIZE = 8;
// Floor so a session is never a token 1-2 movements (junk-low). Beginner/T0
// lands near here naturally (persona modifier shrinks weekly volume); advanced
// climbs toward SESSION_SIZE — emergent, no per-tier hardcode.
const MIN_SESSION = 4;
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
// Per-exercise sanity clamp on the engine-derived set count. Below 2 = not a
// real working set; above 5 = junk volume / fatigue per Israetel per-exercise.
const MIN_SETS = 2;
const MAX_SETS = 5;
// Typical weekly frequency a muscle group is trained — the periodization
// volume target is sets/WEEK, but buildSession plans ONE session, so the
// weekly target is divided across the sessions that hit the group.
const WEEKLY_FREQUENCY = 2;

/**
 * Per-exercise set count derived from the engine's weekly volume target.
 *
 * Periodization emits `volume_target_pct` = sets/WEEK per Big-11 group (EN
 * keyed, varies by mesocycle phase — DELOAD halves it). This converts a
 * group's weekly target into a per-exercise count for ONE session: weekly
 * target / weekly frequency / exercises hitting the group this session,
 * clamped [MIN_SETS, MAX_SETS]. Returns DEFAULT_SETS when no target is known
 * for the group (empty map / unmapped group) so callers without periodization
 * context keep the stable default.
 *
 * @param {string} big11RoGroup - exercise muscle_target_primary (Big-11 RO)
 * @param {Record<string, number>|null|undefined} volumeTargets - Big-11 EN -> sets/week
 * @param {number} exercisesInGroup - how many session exercises hit this group
 * @returns {number}
 */
function setsForGroup(big11RoGroup, volumeTargets, exercisesInGroup) {
  if (!volumeTargets || typeof volumeTargets !== 'object') return DEFAULT_SETS;
  const enKey = BIG11_RO_TO_EN_MAP[big11RoGroup] ?? big11RoGroup;
  const weekly = volumeTargets[enKey];
  if (typeof weekly !== 'number' || !Number.isFinite(weekly) || weekly <= 0) {
    return DEFAULT_SETS;
  }
  const perExercise = weekly / WEEKLY_FREQUENCY / Math.max(1, exercisesInGroup);
  const rounded = Math.round(perExercise);
  return Math.min(MAX_SETS, Math.max(MIN_SETS, rounded));
}

/**
 * Session exercise count derived from the weekly volume budget — replaces the
 * old fixed SESSION_SIZE=6. For each Big-11 group the cluster trains:
 *
 *   sets_this_session  = weeklySets(group) / sessionsTrainingThatGroupThisWeek
 *   exercises_for_grp  = round( sets_this_session / SETS_PER_EXERCISE )
 *   count              = Σ exercises_for_grp over the cluster's groups
 *
 * Clamped to [MIN_SESSION, SESSION_SIZE]. When no volume signal is present
 * (empty user / absent volumeTargets / unknown sessions-per-group) we keep the
 * legacy DEFAULT_SESSION_SIZE so cold-start callers stay stable.
 *
 * `weeklySets(group)` is volumeTargets[EN-key] (periodization sets/week, EN
 * keyed — same RO→EN bridge setsForGroup uses). `sessionsTrainingThatGroup`
 * comes from ctx.weeklySessionsPerGroup (Big-11 RO keyed) computed by the
 * adapter from the frequency template — buildSession stays pure (no globals).
 *
 * @param {string[]} groups - the cluster's Big-11 RO target groups
 * @param {Record<string, number>|null|undefined} volumeTargets - Big-11 EN -> sets/week
 * @param {Record<string, number>|null|undefined} weeklySessionsPerGroup - Big-11 RO -> sessions/week
 * @returns {number} session exercise count in [MIN_SESSION, SESSION_SIZE]
 */
function computeSessionExerciseCount(groups, volumeTargets, weeklySessionsPerGroup) {
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
  return Math.min(SESSION_SIZE, Math.max(MIN_SESSION, total));
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

/** Lower rank = more preferred. 0 = has PR history, 1 = known anchor, 2 = new. */
function rank(name, prNames) {
  if (prNames.has(name)) return 0;
  if (ANCHOR_NAMES.has(name)) return 1;
  return 2;
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
 * } | null | undefined} ctx
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
 */
export function buildSession(cluster, ctx) {
  const targets = clusterGroupsOrdered(cluster);
  // Per-session exercise budget — from the weekly volume budget (not a fixed 6).
  const sessionSize = computeSessionExerciseCount(
    targets, ctx?.volumeTargets, ctx?.weeklySessionsPerGroup,
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

  // Set-count from the periodization volume signal (sets/week per group),
  // distributed across the exercises hitting each group this session. Without
  // a volumeTargets signal every exercise keeps DEFAULT_SETS (no-op).
  const groupOf = (name) => getExerciseMetadata(name).muscle_target_primary;
  const perGroupCount = chosen.reduce((acc, e) => {
    const g = groupOf(e.name);
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));
  let exercises = chosen.map((e) => {
    const g = groupOf(e.name);
    return { name: e.name, sets: setsForGroup(g, ctx?.volumeTargets, perGroupCount[g]) };
  });

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
