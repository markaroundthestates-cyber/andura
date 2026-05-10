// ══ SESSION BUILDER — Construieste lista de exercitii pentru o sesiune ═══
// Pure function: no side effects, no class, no imports from app state.

import { contextSelectionEnabled } from './calibration.js';

const EXERCISES_BY_TYPE = {
  'PUSH': ['Incline DB Press', 'Pec Deck', 'DB Shoulder Press', 'Lateral Raises', 'Overhead Triceps', 'Pushdown'],
  'PULL': ['Lat Pulldown', 'Cable Row', 'Face Pulls', 'Bayesian Curl', 'Incline DB Curl'],
  'UMERI_BRATE': ['DB Shoulder Press', 'Lateral Raises', 'Rear Delt Fly', 'Bayesian Curl', 'Pushdown'],
  'UPPER_PICIOARE': ['Lat Pulldown', 'Incline DB Press', 'Leg Press', 'Leg Extension', 'Leg Curl'],
  'FULL_UPPER': ['Lat Pulldown', 'Incline DB Press', 'Cable Row', 'DB Shoulder Press', 'Bayesian Curl', 'Pushdown'],
};

const EQUIP_MAP = {
  'Incline DB Press': 'dumbbell', 'DB Shoulder Press': 'dumbbell',
  'Lateral Raises': 'dumbbell', 'Incline DB Curl': 'dumbbell',
  'Pec Deck': 'pec_deck', 'Rear Delt Fly': 'pec_deck',
  'Lat Pulldown': 'bailib_stack', 'Cable Row': 'bailib_stack',
  'Face Pulls': 'matrix_cable', 'Bayesian Curl': 'matrix_cable',
  'Overhead Triceps': 'matrix_cable', 'Pushdown': 'matrix_cable', 'Cable Fly': 'matrix_cable',
  'Leg Extension': 'leg_machine', 'Leg Curl': 'leg_machine',
  'Leg Press': 'leg_press_plates',
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
 * When contextSelectionEnabled flag is true, applies weakness-prioritized
 * ordering: exercises targeting ctx.weakGroups appear in positions 1-2.
 * Weakness-prioritized ordering. Does NOT add missing exercises.
 *
 * @param {string} sessionType - 'PUSH' | 'PULL' | 'UMERI_BRATE' | 'UPPER_PICIOARE' | 'FULL_UPPER'
 * @param {object} ctx - coach context with ctx.equipment.available and optionally ctx.weakGroups
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
 */
export function buildSession(sessionType, ctx) {
  const names = EXERCISES_BY_TYPE[sessionType] || EXERCISES_BY_TYPE['FULL_UPPER'];
  const available = ctx?.equipment?.available ?? [];
  const filtered = names.filter(n => available.includes(EQUIP_MAP[n]));
  let exercises = filtered.map(name => ({ name, sets: 3 }));

  if (contextSelectionEnabled && ctx?.weakGroups?.length > 0) {
    exercises = prioritizeWeakGroups(exercises, ctx.weakGroups);
  }

  return { type: sessionType, exercises };
}

/**
 * Reorder exercises so weak-group exercises appear in the first 2 positions.
 * Does NOT add exercises not already in the list.
 */
export function prioritizeWeakGroups(exercises, weakGroups) {
  const weakExerciseNames = new Set(
    weakGroups.flatMap(g => MUSCLE_GROUP_EXERCISES[g] ?? [])
  );

  const weak = exercises.filter(e => weakExerciseNames.has(e.name));
  const rest = exercises.filter(e => !weakExerciseNames.has(e.name));

  // Place weak exercises first (up to 2 positions), then the rest
  return [...weak.slice(0, 2), ...rest, ...weak.slice(2)];
}
