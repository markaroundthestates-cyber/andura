// ══ EXERCISE MAPPING — Estimare greutate initiala din exercitii similare ══════

export const SIMILAR_EXERCISES = {
  'Cable Curl': ['Bayesian Curl', 'Incline DB Curl'],
  'Preacher Curl': ['Bayesian Curl', 'Incline DB Curl', 'Cable Curl'],
  'Hammer Curl': ['Incline DB Curl', 'Bayesian Curl'],
  'Overhead Triceps': ['Pushdown'],
  'Pushdown': ['Overhead Triceps'],
  'Rear Delt Fly': ['Face Pulls'],
  'Face Pulls': ['Rear Delt Fly'],
  'Lateral Raises (cable)': ['Lateral Raises'],
  'Lateral Raises': ['Lateral Raises (cable)'],
  'Cable Fly': ['Pec Deck / Cable Fly', 'Pec Deck'],
  'Pec Deck': ['Pec Deck / Cable Fly', 'Cable Fly'],
  'Pec Deck / Cable Fly': ['Cable Fly', 'Pec Deck'],
  'DB Shoulder Press': ['Incline DB Press'],
  'Incline DB Press': ['DB Shoulder Press'],
  'Cable Row': ['Lat Pulldown'],
  'Lat Pulldown': ['Cable Row']
};

export const SIMILARITY_RATIO = {
  'Cable Curl_Bayesian Curl': 0.85,
  'Preacher Curl_Bayesian Curl': 0.80,
  'Hammer Curl_Incline DB Curl': 1.1,
  'Overhead Triceps_Pushdown': 1.0,
  'Pushdown_Overhead Triceps': 1.0,
  'Cable Fly_Pec Deck / Cable Fly': 0.85,
  'Cable Fly_Pec Deck': 0.85,
  'Pec Deck_Cable Fly': 1.0,
  'DB Shoulder Press_Incline DB Press': 0.75,
  'Incline DB Press_DB Shoulder Press': 1.25,
  'Cable Row_Lat Pulldown': 1.1,
  'Lat Pulldown_Cable Row': 0.9,
  'default': 0.9
};

export function getSimilarityMultiplier(target, source) {
  return SIMILARITY_RATIO[target + '_' + source] || SIMILARITY_RATIO.default;
}
