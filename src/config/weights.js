// ══ EQUIPMENT WEIGHT CONFIGS ══════════════════════════════════
// Per-machine weight stacks based on real gym equipment (Matrix + Bailib + plates)

export const EQUIPMENT_WEIGHTS = {
  // Matrix Dual Adjustable Pulley (helcometru) — incremente ~4.5kg
  'matrix_cable': [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 63, 68, 72, 77, 81, 86, 90],

  // Bailib Lat Pulldown + Cable Row — incremente 5kg
  'bailib_stack': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],

  // Pec Deck / Rear Delt (aparat cu selector) — incremente ~4.5kg
  'pec_deck': [18, 23, 27, 32, 36, 41, 45, 50, 54, 59],

  // Leg Extension / Leg Curl (selector stack)
  'leg_machine': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],

  // Leg Press cu discuri olimpice (bara ~20kg + discuri per parte)
  'leg_press_plates': [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 320],

  // Gantere fixe cu etichete galbene — incremente 1kg mic, 2.5kg mare
  'dumbbell': [7, 8, 9, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50],
};

// Mapare exercițiu → tipul de echipament din sală
export const EXERCISE_EQUIPMENT_MAP = {
  'Lat Pulldown':          'bailib_stack',
  'Cable Row':             'bailib_stack',
  'Chest-Supported Row':   'bailib_stack',
  'Face Pulls':            'matrix_cable',
  'Bayesian Curl':         'matrix_cable',
  'Cable Curl':            'matrix_cable',
  'Overhead Triceps':      'matrix_cable',
  'Pushdown':              'matrix_cable',
  'Cable Fly':             'matrix_cable',
  'Lateral Raises (cable)':'matrix_cable',
  'Rear Delt Cable':       'matrix_cable',
  'Pec Deck / Cable Fly':  'pec_deck',
  'Rear Delt Fly':         'pec_deck',
  'Leg Extension':         'leg_machine',
  'Leg Curl':              'leg_machine',
  'Leg Press':             'leg_press_plates',
  'Incline DB Press':      'dumbbell',
  'Incline DB Press pump': 'dumbbell',
  'DB Shoulder Press':     'dumbbell',
  'Flat DB Press':         'dumbbell',
  'Lateral Raises':        'dumbbell',
  'Incline DB Curl':       'dumbbell',
  'Hammer Curl':           'dumbbell',
  'Preacher Curl':         'dumbbell',
  'Romanian Deadlift':     'dumbbell',
  'Calf Raises':           'dumbbell',
};

function getList(exerciseName) {
  const equipType = EXERCISE_EQUIPMENT_MAP[exerciseName] || 'bailib_stack';
  return EQUIPMENT_WEIGHTS[equipType] || EQUIPMENT_WEIGHTS['bailib_stack'];
}

export function getNextWeight(current, exerciseName) {
  const list = getList(exerciseName);
  const idx = list.findIndex(w => w >= current);
  if (idx === -1) return list[list.length - 1];
  if (list[idx] === current) return list[Math.min(idx + 1, list.length - 1)];
  return list[idx];
}

export function getPrevWeight(current, exerciseName) {
  const list = getList(exerciseName);
  const idx = list.findIndex(w => w >= current);
  if (idx <= 0) return list[0];
  return list[idx - 1];
}

export function roundToEquipmentWeight(weight, exerciseName) {
  const list = getList(exerciseName);
  return list.reduce((prev, curr) =>
    Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
  );
}

export function getEquipmentType(exerciseName) {
  return EXERCISE_EQUIPMENT_MAP[exerciseName] || 'bailib_stack';
}

// Backwards-compat aliases
export const DUMBBELL_WEIGHTS = EQUIPMENT_WEIGHTS['dumbbell'];
export const CABLE_WEIGHTS    = EQUIPMENT_WEIGHTS['bailib_stack'];
export const MACHINE_WEIGHTS  = EQUIPMENT_WEIGHTS['leg_machine'];

// Legacy EXERCISE_EQUIPMENT_TYPE alias (used nowhere currently, kept for safety)
export const EXERCISE_EQUIPMENT_TYPE = Object.fromEntries(
  Object.entries(EXERCISE_EQUIPMENT_MAP).map(([ex, t]) => [ex, t])
);
