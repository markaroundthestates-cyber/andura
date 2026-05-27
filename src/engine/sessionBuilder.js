// ══ SESSION BUILDER — Construieste lista de exercitii pentru o sesiune ═══
// Pure function: no side effects, no class, no imports from app state.

import { contextSelectionEnabled } from './calibration.js';
import { getExerciseMetadata } from './exerciseLibrary.js';
import { normalizeToCoarseTypes } from './equipmentMap.js';
import { big11ToHeads, HEAD_TO_BIG11 } from './muscleGroupMap.js';

const EXERCISES_BY_TYPE = {
  'PUSH': ['Incline DB Press', 'Pec Deck', 'DB Shoulder Press', 'Lateral Raises', 'Overhead Triceps', 'Pushdown'],
  'PULL': ['Lat Pulldown', 'Cable Row', 'Face Pulls', 'Bayesian Curl', 'Incline DB Curl'],
  'UMERI_BRATE': ['DB Shoulder Press', 'Lateral Raises', 'Rear Delt Fly', 'Bayesian Curl', 'Pushdown'],
  'UPPER_PICIOARE': ['Lat Pulldown', 'Incline DB Press', 'Leg Press', 'Leg Extension', 'Leg Curl'],
  'FULL_UPPER': ['Lat Pulldown', 'Incline DB Press', 'Cable Row', 'DB Shoulder Press', 'Bayesian Curl', 'Pushdown'],
};

// Maps muscle group names to exercises that train them primarily
const MUSCLE_GROUP_EXERCISES = {
  delt_rear:   ['Rear Delt Fly', 'Rear Delt Cable', 'Face Pulls'],
  delt_mid:    ['Lateral Raises', 'Lateral Raises (cable)'],
  delt_front:  ['DB Shoulder Press', 'Incline DB Press'],
  lat:         ['Lat Pulldown', 'Cable Row'],
  bi_long:     ['Bayesian Curl', 'Incline DB Curl', 'Cable Curl', 'Hammer Curl'],
  tri_long:    ['Overhead Triceps'],
  chest_upper: ['Incline DB Press'],
  chest_mid:   ['Pec Deck', 'Flat DB Press', 'Cable Fly'],
  quad:        ['Leg Press', 'Leg Extension'],
  hamstring:   ['Leg Curl', 'Romanian Deadlift'],
};

/**
 * Build a session exercise list for the given session type.
 * Filters by available equipment from ctx.equipment.available.
 *
 * Equipment filtering is COARSE per D081: an exercise is performable when its
 * library `equipment_type` (barbell|dumbbell|machine|cable|bodyweight|band) is
 * in the available coarse-type set. ctx.equipment.available may carry coarse
 * types directly OR legacy fine engine IDs (matrix_cable/bailib_stack/...) —
 * both are normalized to coarse via normalizeToCoarseTypes(). Bodyweight is
 * always performable (no equipment required).
 *
 * When contextSelectionEnabled flag is true, applies weakness-prioritized
 * ordering: exercises targeting ctx.weakGroups appear in positions 1-2.
 * Weakness-prioritized ordering. Does NOT add missing exercises.
 *
 * @param {string} sessionType - 'PUSH' | 'PULL' | 'UMERI_BRATE' | 'UPPER_PICIOARE' | 'FULL_UPPER'
 * @param {{ equipment?: { available?: string[] }, weakGroups?: string[] } | null | undefined} ctx
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
 */
export function buildSession(sessionType, ctx) {
  const byType = /** @type {Record<string, string[]>} */ (EXERCISES_BY_TYPE);
  const names = byType[sessionType] || byType['FULL_UPPER'] || [];
  const availableCoarse = new Set(normalizeToCoarseTypes(ctx?.equipment?.available ?? []));
  const filtered = names.filter((n) => {
    const type = getExerciseMetadata(n).equipment_type;
    if (type === 'bodyweight') return true;
    return availableCoarse.has(type);
  });
  let exercises = filtered.map((name) => ({ name, sets: 3 }));

  if (contextSelectionEnabled && (ctx?.weakGroups?.length ?? 0) > 0) {
    exercises = prioritizeWeakGroups(exercises, ctx?.weakGroups ?? []);
  }

  return { type: sessionType, exercises };
}

/**
 * Reorder exercises so weak-group exercises appear in the first 2 positions.
 * Does NOT add exercises not already in the list.
 *
 * weakGroups entries may be engine HEAD groups (delt_rear, lat, quad, ... —
 * MUSCLE_GROUP_EXERCISES keys) OR Big-11 RO groups (umeri, spate,
 * picioare-quads, ... — the vocabulary the live pipeline emits via the
 * Specialization engine's target_muscle_group). Big-11 RO groups are expanded
 * to their composing head groups via muscleGroupMap.big11ToHeads, so weakness
 * prioritization connects across both vocabularies (deferred-P1 vocab bridge).
 *
 * @param {Array<{name: string, sets: number}>} exercises
 * @param {Array<string>} weakGroups
 */
export function prioritizeWeakGroups(exercises, weakGroups) {
  const muscleMap = /** @type {Record<string, string[]>} */ (MUSCLE_GROUP_EXERCISES);
  // Resolve each group to head keys: a direct head key stays as-is; a Big-11 RO
  // group expands to its composing heads. (HEAD_TO_BIG11 membership tells the
  // two apart — head keys are NOT Big-11 RO values.)
  const headGroups = weakGroups.flatMap((g) =>
    (g in HEAD_TO_BIG11) ? [g] : big11ToHeads(g)
  );
  const weakExerciseNames = new Set(
    headGroups.flatMap((g) => muscleMap[g] ?? [])
  );

  const weak = exercises.filter((e) => weakExerciseNames.has(e.name));
  const rest = exercises.filter((e) => !weakExerciseNames.has(e.name));

  // Place weak exercises first (up to 2 positions), then the rest
  return [...weak.slice(0, 2), ...rest, ...weak.slice(2)];
}
