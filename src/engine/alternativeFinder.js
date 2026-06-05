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
  const cascade = (meta && Array.isArray(meta.fallback_cascade)) ? meta.fallback_cascade : [];
  for (const step of cascade) {
    if (step.type === 'muscle_group_compose') {
      const ids = step.exercise_ids || [];
      if (ids.length && ids.every(id => offerable(id) && isExerciseAvailable(id, availableTypes))) {
        return {
          exercises: ids,
          isAlternative: true,
          cascadeStep: step.type,
          original: exerciseName,
        };
      }
    } else {
      const id = step.exercise_id;
      if (id && offerable(id) && isExerciseAvailable(id, availableTypes)) {
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
