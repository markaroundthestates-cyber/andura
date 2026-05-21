// ══ ALTERNATIVE ENGINE — Exercitii alternative per echipament ════════════
// Daca un echipament e indisponibil, returneaza alternative filtrate dupa
// echipamentul disponibil. ALTERNATIVES mapeaza exercitiu → [alternative].

export const ALTERNATIVES = {
  'Incline DB Press':       ['Incline Barbell Press', 'Landmine Press', 'Cable Incline Fly'],
  'Flat DB Press':          ['Flat Barbell Press', 'Pec Deck / Cable Fly', 'Push-ups weighted'],
  'Pec Deck / Cable Fly':   ['Cable Fly', 'DB Fly', 'Incline DB Press'],
  'Cable Fly':              ['Pec Deck / Cable Fly', 'DB Fly', 'Resistance Band Fly'],
  'DB Shoulder Press':      ['Barbell OHP', 'Machine Shoulder Press', 'Landmine Press'],
  'Lateral Raises':         ['Cable Lateral Raise', 'Machine Lateral Raise', 'Band Lateral Raise'],
  'Overhead Triceps':       ['Skull Crushers', 'Cable Triceps Extension', 'Triceps Dip'],
  'Pushdown':               ['Cable Pushdown', 'Band Pushdown', 'Bench Dip'],
  'Lat Pulldown':           ['Pull-ups', 'Assisted Pull-ups', 'Cable Pullover'],
  'Cable Row':              ['DB Row', 'Barbell Row', 'Machine Row'],
  'Face Pulls':             ['Band Pull-Apart', 'Rear Delt Fly', 'Cable Rear Delt'],
  'Bayesian Curl':          ['Cable Curl', 'Incline DB Curl', 'Preacher Curl'],
  'Incline DB Curl':        ['Bayesian Curl', 'Hammer Curl', 'Barbell Curl'],
  'Leg Press':              ['Hack Squat', 'Goblet Squat', 'Bulgarian Split Squat'],
  'Romanian Deadlift':      ['Stiff Leg Deadlift', 'Good Morning', 'Nordic Curl'],
  'Leg Curl':               ['Romanian Deadlift', 'Nordic Curl', 'Glute Ham Raise'],
  'Leg Extension':          ['Sissy Squat', 'Step-ups', 'Terminal Knee Extension'],
  'Calf Raise':             ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
};

// Equipment tags: exercitii care necesita echipament specific
const REQUIRES_EQUIPMENT = {
  cable:     ['Cable Fly', 'Cable Row', 'Face Pulls', 'Bayesian Curl', 'Lat Pulldown',
               'Pushdown', 'Cable Lateral Raise', 'Cable Rear Delt', 'Cable Incline Fly',
               'Cable Pullover', 'Cable Triceps Extension', 'Cable Curl'],
  pec_deck:  ['Pec Deck / Cable Fly'],
  barbell:   ['Barbell OHP', 'Barbell Row', 'Flat Barbell Press', 'Incline Barbell Press',
               'Leg Press', 'Romanian Deadlift', 'Stiff Leg Deadlift', 'Good Morning'],
  machine:   ['Machine Shoulder Press', 'Machine Row', 'Machine Lateral Raise', 'Leg Press',
               'Leg Curl', 'Leg Extension', 'Hack Squat', 'Calf Raise'],
  dumbbells: ['Incline DB Press', 'Flat DB Press', 'DB Shoulder Press', 'Incline DB Curl',
               'DB Row', 'DB Fly'],
  pullup_bar: ['Pull-ups', 'Assisted Pull-ups', 'Nordic Curl'],
};

/**
 * Determina ce echipament este necesar pentru un exercitiu.
 * @param {string} exerciseName
 * @returns {string|null}
 */
function equipmentFor(exerciseName) {
  for (const [equip, exercises] of Object.entries(REQUIRES_EQUIPMENT)) {
    if (exercises.some(e => e.toLowerCase() === exerciseName.toLowerCase())) return equip;
  }
  return null;
}

/**
 * Returneaza alternative disponibile pentru un exercitiu.
 * @param {string} exerciseName
 * @param {string[]} unavailableEquipment - lista echipamentelor indisponibile
 * @returns {string[]}
 */
export function getAlternatives(exerciseName, unavailableEquipment = []) {
  const unavailLower = unavailableEquipment.map((e) => e.toLowerCase());
  const altMap = /** @type {Record<string, string[]>} */ (ALTERNATIVES);
  const alternatives = altMap[exerciseName] ?? [];

  return alternatives.filter((alt) => {
    const equip = equipmentFor(alt);
    if (!equip) return true; // bodyweight or unknown — assume available
    return !unavailLower.some(u => u.includes(equip) || equip.includes(u));
  });
}

/**
 * Daca exercitiul original necesita echipament indisponibil, returneaza prima alternativa.
 * @param {string} exerciseName
 * @param {string[]} [unavailableEquipment]
 * @returns {{ exercise: string, isAlternative: boolean, noAlt?: boolean, original?: string }}
 */
export function resolveExercise(exerciseName, unavailableEquipment = []) {
  const requiredEquip = equipmentFor(exerciseName);
  const unavailLower = unavailableEquipment.map(e => e.toLowerCase());
  const isBlocked = requiredEquip
    && unavailLower.some(u => u.includes(requiredEquip) || requiredEquip.includes(u));

  if (!isBlocked) return { exercise: exerciseName, isAlternative: false };

  const alts = getAlternatives(exerciseName, unavailableEquipment);
  if (alts.length === 0) return { exercise: exerciseName, isAlternative: false, noAlt: true };

  return { exercise: alts[0] ?? exerciseName, isAlternative: true, original: exerciseName };
}
