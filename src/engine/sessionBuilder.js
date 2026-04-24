// ══ SESSION BUILDER — Construiește lista de exerciții pentru o sesiune ═══
// Pure function: no side effects, no class, no imports from app state.

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

/**
 * Build a session exercise list for the given session type.
 * Filters by available equipment from ctx.equipment.available.
 *
 * @param {string} sessionType - 'PUSH' | 'PULL' | 'UMERI_BRATE' | 'UPPER_PICIOARE' | 'FULL_UPPER'
 * @param {object} ctx - coach context with ctx.equipment.available
 * @returns {{ type: string, exercises: Array<{name: string, sets: number}> }}
 */
export function buildSession(sessionType, ctx) {
  const names = EXERCISES_BY_TYPE[sessionType] || EXERCISES_BY_TYPE['FULL_UPPER'];
  const available = ctx?.equipment?.available ?? [];
  const filtered = names.filter(n => available.includes(EQUIP_MAP[n]));
  return { type: sessionType, exercises: filtered.map(name => ({ name, sets: 3 })) };
}
