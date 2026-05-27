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

import { EXERCISE_METADATA, getValidAlternatives } from './exerciseLibrary.js';

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

  const validNames = getValidAlternatives(exerciseName);
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

  // Traverse ordered cascade.
  const cascade = (meta && Array.isArray(meta.fallback_cascade)) ? meta.fallback_cascade : [];
  for (const step of cascade) {
    if (step.type === 'muscle_group_compose') {
      const ids = step.exercise_ids || [];
      if (ids.length && ids.every(id => isExerciseAvailable(id, availableTypes))) {
        return {
          exercises: ids,
          isAlternative: true,
          cascadeStep: step.type,
          original: exerciseName,
        };
      }
    } else {
      const id = step.exercise_id;
      if (id && isExerciseAvailable(id, availableTypes)) {
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
