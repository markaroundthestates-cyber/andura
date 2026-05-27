// ══ SESSION BUILDER — Construieste lista de exercitii pentru o sesiune ═══
// Pure function: no side effects, no class, no imports from app state.
//
// WP-4 (P3 moat): selection now pulls from the 657-entry exerciseLibrary by
// muscle group instead of a hardcoded ~22-name table. Filters: muscle group
// (session type) x available equipment (coarse equipment_type) x tier
// (persona/experience). Selection is DETERMINISTIC (seeded on user+day) and
// ANCHORS on the known engine names that carry PR history, so existing users
// keep continuity (the 18/21 names that exist verbatim as library keys).

import { contextSelectionEnabled } from './calibration.js';
import { EXERCISE_METADATA, getExerciseMetadata } from './exerciseLibrary.js';

// Session type -> Big-11 canonical RO muscle groups (library muscle_target_primary).
// Replaces the hardcoded EXERCISES_BY_TYPE name table. Primary group(s) first =
// where the T1 compound anchor lands.
const SESSION_TYPE_MUSCLE_TARGETS = {
  'PUSH':           ['piept', 'umeri', 'triceps'],
  'PULL':           ['spate', 'biceps'],
  'LEGS':           ['picioare-quads', 'picioare-hamstrings', 'fese', 'gambe'],
  'UMERI_BRATE':    ['umeri', 'biceps', 'triceps'],
  'UPPER_PICIOARE': ['spate', 'piept', 'picioare-quads', 'picioare-hamstrings'],
  'FULL_UPPER':     ['piept', 'spate', 'umeri'],
};

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

// Target session length (exercises per session).
const SESSION_SIZE = 6;
// Max T1 compound anchors per session (1-2 compound on the primary group).
const MAX_T1 = 2;

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
 * @param {Set<string>} prNames - names that carry PR history (preferred anchors)
 * @param {number} seed
 * @returns {Array<{name: string, meta: object}>}
 */
function poolForGroup(group, available, maxTier, prNames, seed) {
  const pool = [];
  for (const [name, meta] of Object.entries(EXERCISE_METADATA)) {
    if (meta.muscle_target_primary !== group) continue;
    if (meta.tier > maxTier) continue;
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

/**
 * Build a session exercise list for the given session type.
 *
 * Pulls candidates from the 657-entry library by muscle group, filters by
 * available coarse equipment + tier (persona), and selects ~SESSION_SIZE
 * exercises: 1-2 T1 compound on the primary group + T2/T3 isolation across the
 * remaining groups. Selection is deterministic (seeded on ctx.seed) and anchors
 * on PR-carrying / known names for continuity.
 *
 * When contextSelectionEnabled flag is true and ctx.weakGroups is non-empty,
 * applies weakness-prioritized ordering (weak-group exercises to positions 1-2).
 *
 * @param {string} sessionType - 'PUSH'|'PULL'|'LEGS'|'UMERI_BRATE'|'UPPER_PICIOARE'|'FULL_UPPER'
 * @param {{
 *   equipment?: { available?: string[] },
 *   weakGroups?: string[],
 *   profileTier?: string|null,
 *   prNames?: string[],
 *   seed?: string,
 * } | null | undefined} ctx
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
 */
export function buildSession(sessionType, ctx) {
  const targets =
    SESSION_TYPE_MUSCLE_TARGETS[sessionType] ||
    SESSION_TYPE_MUSCLE_TARGETS['FULL_UPPER'];
  const available = new Set(ctx?.equipment?.available ?? []);
  const maxTier = tierCeiling(ctx?.profileTier);
  const prNames = new Set(ctx?.prNames ?? []);
  const seed = hashString(String(ctx?.seed ?? ''));

  // Pools per target group (ordered: PR-anchored -> anchor -> new, seeded-stable).
  const pools = targets.map((g) => ({
    group: g,
    pool: poolForGroup(g, available, maxTier, prNames, seed),
  }));

  const chosen = [];
  const chosenNames = new Set();

  // Phase 1 — T1 compound anchors on the PRIMARY group(s), up to MAX_T1.
  // Walk primary groups in order, taking the top T1 entry from each until MAX_T1.
  let t1Count = 0;
  for (const { pool } of pools) {
    if (t1Count >= MAX_T1) break;
    const t1 = pool.find((e) => e.meta.tier === 1 && !chosenNames.has(e.name));
    if (t1) {
      chosen.push({ name: t1.name, sets: 3 });
      chosenNames.add(t1.name);
      t1Count++;
    }
  }

  // Phase 2 — round-robin fill across groups (isolation T2/T3 + any remaining
  // T1), one per group per pass, until SESSION_SIZE or pools exhausted.
  let progressed = true;
  while (chosen.length < SESSION_SIZE && progressed) {
    progressed = false;
    for (const { pool } of pools) {
      if (chosen.length >= SESSION_SIZE) break;
      const next = pool.find((e) => !chosenNames.has(e.name));
      if (next) {
        chosen.push({ name: next.name, sets: 3 });
        chosenNames.add(next.name);
        progressed = true;
      }
    }
  }

  let exercises = chosen;

  if (contextSelectionEnabled && (ctx?.weakGroups?.length ?? 0) > 0) {
    exercises = prioritizeWeakGroups(exercises, ctx?.weakGroups ?? []);
  }

  return { type: sessionType, exercises };
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
