// ══ ALTERNATIVE FINDER — Smart-Routing §36.37 (ported WP-2 MOAT revive) ═══════
// Pure functions: inputs in, alternatives out — zero I/O, zero app-state import.
// Two substitution paths per ADR_SMART_ROUTING_EQUIPMENT_v2 LOCK V2 §3:
//   (1) ranking-based  → findAlternatives (graceful-degradation path, v1 §36.37)
//   (2) fallback_cascade ordered per-exercise → getFallbackCascade (cascade v2 primar)
// Cascade is primary when present; ranking is graceful degradation.
//
// PORT NOTE (WP-2): findAlternatives ported verbatim from archived
// 99-archive/vanilla-legacy-pre-D028/src/engine/smart-routing/alternative-finder.js —
// only the import path changed (schema/exerciseMetadata.js -> ./exerciseLibrary.js).
// getFallbackCascade is NEW per P3-MOAT-DESIGN.md §5.1 (cascade traversal).
// NOT yet wired into sessionBuilder/scheduleAdapter/UI (later work-package).

import { EXERCISE_METADATA, getValidAlternatives, isActiveExercise } from './exerciseLibrary.js';

// ── ACTIVE visibility gate (Daniel SSOT 2026-06-05) ─────────────────────────
// Every alternative this module OFFERS must be ACTIVE (CORE_AUTO). The swap
// audit proved the broad pool reached all 657 entries and never read `status`,
// so untagged/exotic/contraindicated variants surfaced as top swap picks. The
// gate is applied to the OFFERED candidate, never to the SOURCE exercise: the
// user may be swapping out a non-active lift (a legacy PR exercise, an already-
// swapped pick), and that source still resolves to active alternatives. Single
// source of truth is isActiveExercise (exerciseLibrary.ACTIVE_STATUSES) —
// widen there to re-enable a status band everywhere at once.
const offerable = (name) => isActiveExercise(name);

/**
 * Find ranked alternatives for an exercise. Default: skip if zero valid alternatives
 * (NU fortezi substitutie inferior — anti-paternalism per §36.37).
 *
 * @param {string} exerciseName
 * @returns {{ alternatives: { name: string, similarity: number }[], shouldSkip: boolean }}
 */
export function findAlternatives(exerciseName) {
  const meta = EXERCISE_METADATA[exerciseName];
  if (!meta) return { alternatives: [], shouldSkip: true };

  // ACTIVE gate: only offer curated CORE_AUTO alternatives (drop untagged/
  // MANUAL_ADVANCED/FALLBACK from the curated equipment_alternatives list).
  const validNames = getValidAlternatives(exerciseName).filter(offerable);
  if (!validNames.length) return { alternatives: [], shouldSkip: true };

  // Rank by similarity: same muscle_target_primary > same equipment_type > same force_demand
  const ranked = validNames.map(altName => {
    const altMeta = EXERCISE_METADATA[altName];
    let similarity = 0;
    if (altMeta.muscle_target_primary === meta.muscle_target_primary) similarity += 3;
    if (altMeta.equipment_type === meta.equipment_type) similarity += 1;
    if (altMeta.force_demand === meta.force_demand) similarity += 2;
    return { name: altName, similarity };
  }).sort((a, b) => b.similarity - a.similarity);

  return { alternatives: ranked, shouldSkip: false };
}

/**
 * Is an exercise performable given the coarse equipment_type set currently available?
 * Bodyweight is always available (no equipment). Unknown exercise → not available
 * (conservative: cannot prescribe what we have no metadata for).
 * @param {string} exerciseName
 * @param {string[]} availableTypes - coarse equipment_type values available (barbell|dumbbell|machine|cable|bodyweight|band)
 * @returns {boolean}
 */
function isExerciseAvailable(exerciseName, availableTypes) {
  const meta = EXERCISE_METADATA[exerciseName];
  if (!meta) return false;
  if (meta.equipment_type === 'bodyweight') return true;
  return availableTypes.includes(meta.equipment_type);
}

/**
 * BROAD-library degradation: search ALL 657 entries (not the thin curated
 * equipment_alternatives list) for a performable, same-muscle alternative.
 *
 * WHY: the curated equipment_alternatives is rich for the 631 library exercises
 * that carry a fallback_cascade, but the ~22 ORIGINAL anchor lifts (Leg Press,
 * Incline DB Press, Flat Barbell Bench, ...) have NO cascade and only 1-2 curated
 * alts. When none of those is performable with availableTypes, findAlternatives
 * dead-ends at shouldSkip → getFallbackCascade returned a premature noAlt for a
 * marquee lift. This widens the search to the whole library so an anchor on
 * missing/busy equipment still lands a NAMED same-muscle swap (P3-MOAT-DESIGN §5.1
 * "degrade to ranking-based search over the BROAD 657 library by muscle_target_primary").
 *
 * Rule (mirrors getValidAlternatives' tier/force philosophy, just over the broad
 * pool instead of the thin curated list):
 *   - Same muscle_target_primary as the original (a real, never-cross-muscle swap).
 *   - Performable with availableTypes (bodyweight always counts).
 *   - tier-1 strength (force_demand:'high'): candidates MUST also be force_demand:'high'
 *     (NU degrade a heavy compound to an isolation/light movement — same strict
 *     rule getValidAlternatives applies to tier-1). If none qualify, return [] →
 *     honest noAlt (anti-paternalism: never force a clearly inferior substitute).
 *   - tier-2/3: same-muscle flexible (any performable same-muscle alternative).
 * Ranked best-first: same equipment_type +1, same force_demand +2, same tier +1.
 *
 * @param {string} exerciseName
 * @param {string[]} availableTypes - coarse equipment_type values available
 * @returns {{ name: string, similarity: number }[]} ranked broad-library candidates
 */
function findBroadAlternatives(exerciseName, availableTypes) {
  const meta = EXERCISE_METADATA[exerciseName];
  if (!meta || meta.muscle_target_primary === 'unknown') return [];

  const tier1Strict = meta.tier === 1 && meta.force_demand === 'high';

  const candidates = [];
  for (const [name, m] of Object.entries(EXERCISE_METADATA)) {
    if (name === exerciseName) continue;
    if (!offerable(name)) continue; // ACTIVE gate: only offer CORE_AUTO swaps
    if (m.muscle_target_primary !== meta.muscle_target_primary) continue;
    if (tier1Strict && m.force_demand !== 'high') continue; // NU degrade heavy compound
    if (!isExerciseAvailable(name, availableTypes)) continue;
    let similarity = 0;
    if (m.equipment_type === meta.equipment_type) similarity += 1;
    if (m.force_demand === meta.force_demand) similarity += 2;
    if (m.tier === meta.tier) similarity += 1;
    candidates.push({ name, similarity });
  }
  return candidates.sort((a, b) => b.similarity - a.similarity);
}

/**
 * REFUSAL POOL — exhaustive ranked same-muscle pool for the "Nu vreau" path.
 *
 * Daniel smoke 2026-05-28: the prior refusal path returned `alternatives[0]` of
 * the thin curated `equipment_alternatives` list (1-3 entries). Tap "Nu vreau"
 * on Flat Bench -> got Incline Bench. Tap again -> swapped exercise's first alt
 * -> often pinged back to Flat Bench. Two-element ping-pong. For tier-1 high-
 * force lifts (Cheat Curl Barbell) whose 2 curated alts didn't both pass the
 * tier-1 strict rule, the path dead-ended at `shouldSkip:true` -> the UI told
 * the user "no alternative" on an exercise that has a whole sea of same-muscle
 * variants in the 657-entry library. Both failures.
 *
 * Refusal semantics ≠ equipment semantics:
 *   - Equipment busy/missing = hard blocker (can the user PERFORM this movement
 *     right now?). Tier-1 strict makes sense — don't degrade heavy compound to
 *     an isolation just because a machine is occupied.
 *   - "Nu vreau" = taste decision (user doesn't WANT this one today). Ignore
 *     equipment entirely + don't enforce tier-1 strict (user explicitly said no,
 *     offering a lighter same-muscle alternative is honest UX, not paternalism).
 *
 * This builds the EXHAUSTIVE broad-library same-muscle pool the UI then cycles
 * through one-at-a-time, tracking a per-session "tried" set so the user sees
 * each candidate only once (no repeats until the pool is exhausted). When the
 * pool runs out, the caller gets `poolExhausted: true` and shows Daniel's copy
 * "ai incercat tot ce pot oferi pentru [muscle group]".
 *
 * Ranking: best-first by similarity to the original (same equipment_type +1,
 * same force_demand +2, same tier +1) — so the FIRST proposal is the closest
 * substitute; subsequent ones degrade gracefully toward lighter/different
 * equipment / tier variants of the same muscle target.
 *
 * @param {string} exerciseName  English canonical engine name of the original
 * @param {string[]} [triedNames=[]] English canonical names already refused this
 *   session (the original + every prior swap; caller maintains the set in store)
 * @returns {{ candidates: { name: string, similarity: number }[], muscleGroup: string }}
 *   - candidates: ranked same-muscle pool minus `triedNames` (empty -> exhausted)
 *   - muscleGroup: the original's muscle_target_primary (for the "ai incercat
 *     tot pentru [muscleGroup]" exhaustion copy). 'unknown' when no metadata.
 */
export function findRefusalPool(exerciseName, triedNames = []) {
  const meta = EXERCISE_METADATA[exerciseName];
  if (!meta || meta.muscle_target_primary === 'unknown') {
    return { candidates: [], muscleGroup: 'unknown' };
  }
  const muscleGroup = meta.muscle_target_primary;
  const tried = new Set(triedNames);
  // The original is implicit-tried (already swapped out) — make sure it never
  // re-appears even when the caller forgets to include it in triedNames.
  tried.add(exerciseName);

  const candidates = [];
  for (const [name, m] of Object.entries(EXERCISE_METADATA)) {
    if (tried.has(name)) continue;
    if (!offerable(name)) continue; // ACTIVE gate: only offer CORE_AUTO swaps
    if (m.muscle_target_primary !== muscleGroup) continue;
    // Refusal = preference. Equipment + tier-1 strict NOT enforced (the user
    // chose to swap; we honor the choice with the closest available match
    // and let the caller's UI gracefully exhaust the pool).
    let similarity = 0;
    if (m.equipment_type === meta.equipment_type) similarity += 1;
    if (m.force_demand === meta.force_demand) similarity += 2;
    if (m.tier === meta.tier) similarity += 1;
    candidates.push({ name, similarity });
  }
  candidates.sort((a, b) => b.similarity - a.similarity);
  return { candidates, muscleGroup };
}

/**
 * Resolve an exercise to itself or a substitute using the ordered fallback_cascade,
 * degrading to ranking-based findAlternatives when no cascade step is available.
 *
 * Logic (P3-MOAT-DESIGN.md §5.1):
 *  1. If the original exercise is performable with availableTypes → return it (no swap).
 *  2. Else traverse fallback_cascade in order (easier_machine → assisted_variant →
 *     muscle_group_compose → bodyweight → light_variant); return the FIRST step whose
 *     exercise(s) are all available with availableTypes.
 *  3. If fallback_cascade is absent OR no step is valid → degrade to findAlternatives
 *     ranking → first ranked alternative that is available.
 *  4. If still nothing → { noAlt: true } (anti-paternalism: NU forteaza inferior;
 *     UI tells the user honestly "no good alternative, skip it").
 *
 * Pure function: inputs in, resolution out. No I/O.
 *
 * @param {string} exerciseName
 * @param {string[]} availableTypes - coarse equipment_type values available
 * @returns {{ exercise?: string, exercises?: string[], isAlternative: boolean, cascadeStep?: string, original?: string, noAlt?: boolean }}
 */
export function getFallbackCascade(exerciseName, availableTypes = []) {
  const meta = EXERCISE_METADATA[exerciseName];

  // Original performable as-is → no substitution.
  if (meta && isExerciseAvailable(exerciseName, availableTypes)) {
    return { exercise: exerciseName, isAlternative: false };
  }

  // Traverse ordered cascade. ACTIVE gate: a cascade step is only taken when its
  // target exercise(s) are ACTIVE (CORE_AUTO) — a curated cascade may point at an
  // untagged/hidden variant (438 of 1041 CORE_AUTO cascade refs do), and we must
  // never surface a hidden exercise via a swap. A step whose target is hidden is
  // SKIPPED; traversal falls through to the gated ranking / broad-library
  // degradation below (both active-only), which coverage proves always lands an
  // active same-muscle swap for every group that has one available.
  // SWAP-001 (moat) — a cascade step is only taken when its target shares the
  // SOURCE's muscle_target_primary. Some curated cascades end in a degrade-to-
  // anything tail (Floor Press Barbell:piept -> bodyweight Diamond Push-up:triceps;
  // Smith Incline Bench:piept -> Pike Push-up:umeri; Seated Leg Curl:hamstrings ->
  // Glute Bridge:fese). Because bodyweight is always performable, that cross-muscle
  // tail short-circuited and PREEMPTED the same-muscle ranking / broad-library
  // degradations below — breaking the documented "never cross-muscle" moat that
  // resolveBusySwap / resolveMissingSwap / EquipmentSwap rely on. Skipping a
  // cross-muscle step makes traversal fall through to those same-muscle paths, so
  // a genuinely-available same-muscle alternative is always preferred over a
  // cross-muscle cascade tail. A compose step must have ALL its ids same-muscle.
  const srcMuscle = meta ? meta.muscle_target_primary : undefined;
  const sameMuscle = (id) => EXERCISE_METADATA[id]?.muscle_target_primary === srcMuscle;
  const cascade = (meta && Array.isArray(meta.fallback_cascade)) ? meta.fallback_cascade : [];
  for (const step of cascade) {
    if (step.type === 'muscle_group_compose') {
      const ids = step.exercise_ids || [];
      if (ids.length && ids.every(id => sameMuscle(id) && offerable(id) && isExerciseAvailable(id, availableTypes))) {
        return {
          exercises: ids,
          isAlternative: true,
          cascadeStep: step.type,
          original: exerciseName,
        };
      }
    } else {
      const id = step.exercise_id;
      if (id && sameMuscle(id) && offerable(id) && isExerciseAvailable(id, availableTypes)) {
        return {
          exercise: id,
          isAlternative: true,
          cascadeStep: step.type,
          original: exerciseName,
        };
      }
    }
  }

  // Graceful degradation #1 → ranking over the thin curated equipment_alternatives.
  const { alternatives } = findAlternatives(exerciseName);
  const firstAvailable = alternatives.find(alt => isExerciseAvailable(alt.name, availableTypes));
  if (firstAvailable) {
    return {
      exercise: firstAvailable.name,
      isAlternative: true,
      cascadeStep: 'ranking',
      original: exerciseName,
    };
  }

  // Graceful degradation #2 → search the BROAD 657 library by muscle_target_primary.
  // Catches the anchor lifts (no cascade + thin curated alts) so a marquee lift on
  // missing/busy equipment still resolves a NAMED same-muscle swap instead of a
  // premature noAlt (P3-MOAT-DESIGN §5.1). tier/force philosophy enforced inside.
  const broad = findBroadAlternatives(exerciseName, availableTypes);
  if (broad.length) {
    return {
      exercise: broad[0].name,
      isAlternative: true,
      cascadeStep: 'broad_library',
      original: exerciseName,
    };
  }

  // Nothing in the whole library matches — honest skip (anti-paternalism).
  return { isAlternative: false, noAlt: true, original: exerciseName };
}

// ══ SWAP PICK-LIST — founder redesign 2026-06-05 (manual short list) ═════════
// Replaces the blind auto-swap (one alternative cycled via a tried-set) with a
// SHORT, decidable manual pick-list the experienced lifter chooses from. The
// engine produces a RANKED 4-5 row list for the SAME muscle, drawn ONLY from the
// active (CORE_AUTO) pool, minus everything already in today's session. Row 1 is
// a pre-selected SMART pick (the highest-effectiveness genuinely-DISTINCT match,
// never a near-duplicate twin of the busy exercise). Exactly ONE bodyweight row
// is force-included when the muscle has one (the universal fallback). The UI then
// renders the list and lets the user pick any row; pre-selected is the default.
//
// Ranking heuristics layered on the same-muscle pool:
//   1. EFFECTIVENESS — best movement/isolation match ranks highest (same
//      sub-movement + same tier/force profile as the original).
//   2. EQUIPMENT-UBIQUITY prior — dumbbell/barbell/basic-cable/bodyweight score
//      high (99% of gyms have them); machine/band stations score lower.
//   3. DIVERSIFY MODALITY — when prior busy-skips are passed in (triedNames /
//      the per-slot tried-set), equipment_types already tried/busy are demoted,
//      and a run of busy machine-skips pivots firmly toward free weights.
//   4. NEAR-DUPLICATE avoidance for the PRE-PICK only (rows 2-5 may include a
//      close cousin; the pre-pick must be a real, distinct alternative).
//   5. CONTRAINDICATED denylist — defensive no-op today (the CORE_AUTO gate
//      already excludes Behind-the-Neck / Upright Row), but if such a movement
//      were ever re-tagged active it is never the pre-pick and ranks last.

// Coarse equipment ubiquity prior (heuristic 2). dumbbell/barbell/bodyweight are
// in virtually every gym; basic cable nearly so; machines vary by gym; band is
// niche. Higher = more ubiquitous → preferred for a swap. Tunable single SoT.
const EQUIPMENT_UBIQUITY = {
  dumbbell: 5,
  barbell: 5,
  bodyweight: 5,
  cable: 4,
  machine: 2,
  band: 1,
};

// Free-weight coarse types — a run of busy machine-skips pivots toward these
// (heuristic 3: infer the gym is machine-poor in this category).
const FREE_WEIGHT_TYPES = new Set(['dumbbell', 'barbell', 'bodyweight']);

// Classically-contraindicated movement name fragments (heuristic 5). The
// CORE_AUTO gate already removes these, so this is a defensive net: never let one
// be the pre-pick, and rank it last if it ever surfaces active. Lowercased match.
const CONTRAINDICATED_FRAGMENTS = [
  'behind the neck',
  'behind-the-neck',
  'upright row',
  'upright-row',
];

function isContraindicated(name) {
  const s = String(name).toLowerCase();
  return CONTRAINDICATED_FRAGMENTS.some((frag) => s.includes(frag));
}

// ── umeri sub-bucket (recon Section C: the coarse `umeri` group conflates press
// / lateral / rear-delt). A shoulder PRESS refusal must not return an unrelated
// lateral raise. Classify a shoulder movement into one of three sub-movements by
// name (the library has no movement field). Non-umeri muscles return null (no
// sub-bucketing — they are already coherent single movements). Cheap + cited.
function shoulderSubBucket(name) {
  const s = String(name).toLowerCase();
  if (/lateral raise|y raise|leaning lateral/.test(s)) return 'lateral';
  if (/rear delt|reverse pec|face pull|pull-apart|pull apart/.test(s)) return 'rear';
  if (/press|ohp|push-up|pushup/.test(s)) return 'press';
  return 'other';
}

// Sub-movement key for ranking cohesion. For umeri we split press/lateral/rear;
// for every other muscle the muscle itself is the sub-movement (already coherent).
function subMovementKey(name, meta) {
  if (meta && meta.muscle_target_primary === 'umeri') return `umeri:${shoulderSubBucket(name)}`;
  return meta ? meta.muscle_target_primary : 'unknown';
}

// ── Near-duplicate detection (heuristic 4). Two same-muscle exercises are
// near-duplicates when, after stripping equipment/grip qualifier words, their
// residual MOVEMENT tokens are (near-)identical — e.g. "Pec Deck / Cable Fly"
// (machine) vs "Cable Fly" (cable) both reduce to the fly movement. We compare
// the residual token SETS: identical residual, or one a subset of the other with
// a high Jaccard overlap, = near-duplicate. Used ONLY to disqualify the pre-pick.
const EQUIPMENT_QUALIFIER_WORDS = new Set([
  'cable', 'machine', 'db', 'dumbbell', 'barbell', 'bb', 'ez-bar', 'ez', 'smith',
  'band', 'bodyweight', 'assisted', 'seated', 'standing', 'incline', 'flat',
  'high', 'low', 'wide-grip', 'wide', 'narrow', 'neutral-grip', 'neutral',
  'v-bar', 'rope', 'single-arm', 'single-leg', 'chest-supported', 'converging',
  'landmine', 'hammer', 'strength',
]);

function movementTokens(name) {
  return new Set(
    String(name)
      .toLowerCase()
      .replace(/[/]/g, ' ')
      .split(/[\s_-]+/)
      .filter((tok) => tok.length > 1 && !EQUIPMENT_QUALIFIER_WORDS.has(tok)),
  );
}

function isNearDuplicate(nameA, nameB) {
  const a = movementTokens(nameA);
  const b = movementTokens(nameB);
  if (a.size === 0 || b.size === 0) return false;
  let inter = 0;
  for (const tok of a) if (b.has(tok)) inter += 1;
  if (inter === 0) return false;
  const union = a.size + b.size - inter;
  const jaccard = inter / union;
  // (1) Identical residual movement, only hardware differs — e.g. "DB Lateral
  // Raise" vs "Cable Lateral Raise" (both {lateral,raise}). Pointless swap.
  if (jaccard >= 1) return true;
  // (2) One FULL name is a literal multi-word sub-PHRASE of the other — e.g.
  // "Cable Fly" appears verbatim inside "Pec Deck / Cable Fly" (the busy
  // machine's name literally spells out its own twin). This is the exact
  // station-twin case the founder named (Cable Pec Deck must not pre-pick Pec
  // Deck). Uses the RAW normalized names (equipment words kept) so the literal
  // phrase is detectable; requires >=2 shared words so a lone generic word
  // ("fly") never trips it. A different modality of the same muscle ("DB Fly")
  // is NOT a verbatim sub-phrase of "Pec Deck / Cable Fly" → stays a valid pick.
  const rawA = String(nameA).toLowerCase().replace(/[/]/g, ' ').replace(/\s+/g, ' ').trim();
  const rawB = String(nameB).toLowerCase().replace(/[/]/g, ' ').replace(/\s+/g, ' ').trim();
  const wordsA = rawA.split(' ');
  const wordsB = rawB.split(' ');
  const subWords = wordsA.length <= wordsB.length ? wordsA : wordsB;
  const supRaw = wordsA.length <= wordsB.length ? rawB : rawA;
  const subPhrase = subWords.join(' ');
  if (
    subWords.length >= 2 &&
    (supRaw === subPhrase || supRaw.includes(`${subPhrase} `) || supRaw.includes(` ${subPhrase}`))
  ) {
    return true;
  }
  return false;
}

/**
 * Build the SHORT manual swap pick-list for an exercise (founder redesign).
 *
 * Returns a ranked list of 4-5 same-muscle, active (CORE_AUTO) candidates the UI
 * renders as a pick sheet. The FIRST entry (`prePick:true`) is the smart default
 * (highest-effectiveness genuinely-distinct match, never a near-duplicate twin of
 * `exerciseName`). EXACTLY one entry carries `isBodyweight:true` when the muscle
 * has a bodyweight option (force-included even if pure effectiveness would rank it
 * lower); when the muscle has none, the list simply omits one (never fabricated).
 *
 * @param {string} exerciseName English canonical name of the exercise to replace
 * @param {string[]} [excludeNames=[]] English canonical names already in today's
 *   session (any slot) — never offered (no duplicate-in-session, ever).
 * @param {string[]} [triedNames=[]] English canonical names already tried/busy at
 *   this slot (the per-slot tried-set) — drives DIVERSIFY MODALITY: their
 *   equipment_types are demoted, and a run of busy machine-skips pivots toward
 *   free weights. Also excluded from the list (never re-offered).
 * @returns {{ items: Array<{ name: string, prePick: boolean, isBodyweight: boolean, equipmentType: string, score: number }>, muscleGroup: string }}
 */
export function buildSwapPickList(exerciseName, excludeNames = [], triedNames = []) {
  const meta = EXERCISE_METADATA[exerciseName];
  if (!meta || meta.muscle_target_primary === 'unknown') {
    return { items: [], muscleGroup: 'unknown' };
  }
  const muscleGroup = meta.muscle_target_primary;
  const origSub = subMovementKey(exerciseName, meta);
  const excluded = new Set([exerciseName, ...excludeNames, ...triedNames]);

  // DIVERSIFY MODALITY signals (heuristic 3): equipment types the user already
  // tried/skipped at this slot. A run of busy machine-skips (>=2 machine/cable
  // station tries) means the gym is machine-poor here → pivot to free weights.
  const triedTypes = new Set(
    triedNames
      .map((n) => EXERCISE_METADATA[n]?.equipment_type)
      .filter((t) => typeof t === 'string'),
  );
  const stationTriesCount = triedNames.filter((n) => {
    const t = EXERCISE_METADATA[n]?.equipment_type;
    return t === 'machine' || t === 'cable' || t === 'band';
  }).length;
  const pivotToFreeWeights = stationTriesCount >= 2;

  // Build the same-muscle candidate pool (active only, minus excluded).
  const pool = [];
  for (const [name, m] of Object.entries(EXERCISE_METADATA)) {
    if (excluded.has(name)) continue;
    if (!offerable(name)) continue;
    if (m.muscle_target_primary !== muscleGroup) continue;
    const sub = subMovementKey(name, m);
    const ubiquity = EQUIPMENT_UBIQUITY[m.equipment_type] ?? 2;

    // EFFECTIVENESS (heuristic 1): same sub-movement as the original is the best
    // match; same tier + same force_demand reflect the same training stimulus.
    let score = 0;
    if (sub === origSub) score += 100; // same movement family (umeri-aware)
    if (m.tier === meta.tier) score += 20;
    if (m.force_demand === meta.force_demand) score += 15;
    if (m.equipment_type === meta.equipment_type) score += 5;

    // UBIQUITY prior (heuristic 2): a TIE-BREAKER, not a primary driver — prefer
    // gym-ubiquitous equipment when effectiveness is otherwise equal. Kept small
    // (x2 → spread 2..10) so it never outranks a same-movement / same-stimulus
    // match (effectiveness FIRST per the founder).
    score += ubiquity * 2;

    // DIVERSIFY MODALITY (heuristic 3): demote an equipment_type already tried at
    // this slot; on a machine-poor pivot, boost free weights / demote stations.
    if (triedTypes.has(m.equipment_type)) score -= 30;
    if (pivotToFreeWeights) {
      if (FREE_WEIGHT_TYPES.has(m.equipment_type)) score += 40;
      else score -= 25;
    }

    // CONTRAINDICATED (heuristic 5): defensive — rank any such movement last.
    if (isContraindicated(name)) score -= 1000;

    pool.push({
      name,
      equipmentType: m.equipment_type,
      isBodyweight: m.equipment_type === 'bodyweight',
      sub,
      score,
    });
  }

  if (pool.length === 0) return { items: [], muscleGroup };

  pool.sort((a, b) => b.score - a.score);

  // PRE-PICK (heuristic 4): the highest-effectiveness candidate that is NOT a
  // near-duplicate twin of the original, NOT contraindicated, and NOT a
  // bodyweight movement (bodyweight is the universal FALLBACK row — the founder's
  // "when nothing is free" option — so a push-up/dip is never the smart default
  // for a loaded movement; it would be a low-effectiveness pre-pick). EXCEPTION:
  // when the original itself is bodyweight, a bodyweight pre-pick is honest.
  // Fall back through these constraints in order so the pre-pick is never empty.
  const origIsBodyweight = meta.equipment_type === 'bodyweight';
  const prePickEligible = (c) =>
    !isNearDuplicate(exerciseName, c.name) &&
    !isContraindicated(c.name) &&
    (origIsBodyweight || !c.isBodyweight);
  const prePick =
    pool.find(prePickEligible) ??
    pool.find((c) => !isNearDuplicate(exerciseName, c.name) && !isContraindicated(c.name)) ??
    pool[0];

  // Assemble: pre-pick first, then the rest in rank order, capped to a SHORT
  // list. Guarantee EXACTLY ONE bodyweight row — force-include the best single
  // bodyweight option even if effectiveness ranked it lower; drop any extra
  // bodyweight rows. When the muscle has no bodyweight option, omit (no fabrication).
  const MAX_ROWS = 5;
  const ordered = [prePick, ...pool.filter((c) => c !== prePick)];

  const bestBodyweight = ordered.find((c) => c.isBodyweight) ?? null;
  const result = [];
  let bodyweightPlaced = false;
  for (const c of ordered) {
    if (c.isBodyweight) {
      // Only the single best bodyweight survives, and only once.
      if (bodyweightPlaced || c !== bestBodyweight) continue;
      bodyweightPlaced = true;
    }
    result.push(c);
    if (result.length >= MAX_ROWS) break;
  }
  // If the one bodyweight option exists but got squeezed out by the cap, swap it
  // into the LAST slot so the universal fallback is always present (exactly one).
  if (bestBodyweight && !bodyweightPlaced && result.length > 0) {
    result[result.length - 1] = bestBodyweight;
    bodyweightPlaced = true;
  }
  // The pre-pick must remain row 1 even after the bodyweight reshuffle.
  if (result[0] !== prePick) {
    const at = result.indexOf(prePick);
    if (at > 0) {
      result.splice(at, 1);
      result.unshift(prePick);
      if (result.length > MAX_ROWS) result.length = MAX_ROWS;
    }
  }

  const items = result.map((c) => ({
    name: c.name,
    prePick: c === prePick,
    isBodyweight: c.isBodyweight,
    equipmentType: c.equipmentType,
    score: c.score,
  }));

  return { items, muscleGroup };
}
