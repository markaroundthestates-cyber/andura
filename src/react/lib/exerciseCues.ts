// ══ EXERCISE FORM CUES — short canonical technique line under the demo ═══════
// Daniel approved (2026-06-02): a 1-line form cue rendered UNDER the exercise
// demo image, in the same expandable demo box. Gigel (non-technical persona)
// doesn't know form from a name + image alone — a short, correct cue builds
// confidence and prevents injury.
//
// SCOPE = CURATED, QUALITY-OVER-COVERAGE. We author cues only for the lifts a
// normal user actually sees: the sessionBuilder ANCHOR_NAMES set + the common
// compounds (squat / deadlift / bench / OHP / row / pulldown / hip thrust /
// leg press / curls / pushdowns / raises / calf, etc.). The full 657-exercise
// library is NOT covered here on purpose: auto-generating cues for obscure
// lifts is an injury risk, so the rest stay GRACEFUL (no cue → render nothing,
// never a placeholder). Authoring all 657 quality cues is a separate content
// pass.
//
// i18n: this module is a pure NAME → KEY mapper — it holds ZERO localized copy
// (per the noHardcodedUiStrings .ts gate). The actual cue prose lives in the
// i18n bundles under `workout.cues.*` (en.json + ro.json, RO no-diacritics).
// The render boundary resolves the key via t(). These are COACHING cues, not
// medical advice (Andura is non-medical). Static map → deterministic.
//
// Keys map the ENGINE CANONICAL names (English IDs from
// src/engine/sessionBuilder.js EXERCISES_BY_TYPE / exerciseDisplay.ts), so the
// lookup mirrors exerciseDisplay / exerciseMedia / PR records exactly. Several
// engine names that are the same movement share one cue key (Pec Deck variants,
// the bodyweight/loaded squat names, conventional deadlift).

// Engine canonical exercise name → cue id (suffix under `workout.cues.`).
// One cue id can be shared by several engine names (same movement).
const CUE_KEY_BY_EXERCISE: Readonly<Record<string, string>> = {
  // Compound lifts (heaviest — the cue copy carries a coaching safety nudge).
  'Squat': 'squat',
  'Bodyweight Squat': 'squat',
  'DB Squat': 'squat',
  'Goblet Squat': 'squat',
  'Barbell Back Squat (High Bar)': 'squat',
  'Barbell Back Squat (Low Bar)': 'squat',
  'Box Squat': 'squat',
  'Front Squat': 'frontSquat',
  'Bulgarian Split Squat': 'bulgarianSplitSquat',
  'Deadlift': 'deadlift',
  'Conventional Deadlift': 'deadlift',
  'Romanian Deadlift': 'romanianDeadlift',
  'BB Good Morning': 'goodMorning',
  'Barbell Good Morning': 'goodMorning',
  'Hip Thrust': 'hipThrust',
  'Barbell Lunge': 'lunge',
  'DB Lunge': 'lunge',

  // Chest press.
  'Flat Barbell Bench': 'flatBench',
  'Flat DB Press': 'flatDbPress',
  'Incline DB Press': 'inclineDbPress',
  'Incline Barbell Bench': 'inclineBench',
  'Pec Deck': 'pecDeck',
  'Cable Fly': 'pecDeck',
  'Pec Deck / Cable Fly': 'pecDeck',

  // Shoulders.
  'DB Shoulder Press': 'dbShoulderPress',
  'Overhead Press': 'overheadPress',
  'OHP': 'overheadPress',
  'Lateral Raises': 'lateralRaises',
  'Lateral Raises (cable)': 'lateralRaisesCable',
  'Rear Delt Fly': 'rearDeltFly',
  'Rear Delt Cable': 'rearDeltCable',
  'Face Pulls': 'facePulls',

  // Back.
  'Lat Pulldown': 'latPulldown',
  'Pull-up': 'pullUp',
  'Chin-up': 'pullUp',
  'Cable Row': 'cableRow',
  'Chest-Supported Row': 'chestSupportedRow',
  'Barbell Row': 'barbellRow',

  // Biceps.
  'Bayesian Curl': 'bayesianCurl',
  'Incline DB Curl': 'inclineDbCurl',
  'Hammer Curl': 'hammerCurl',
  'Cable Curl': 'cableCurl',
  'Preacher Curl': 'preacherCurl',

  // Triceps.
  'Pushdown': 'pushdown',
  'Overhead Triceps': 'overheadTriceps',
  'Dip': 'dip',

  // Legs (machine) + calves.
  'Leg Press': 'legPress',
  'Leg Extension': 'legExtension',
  'Leg Curl': 'legCurl',
  'Calf Raise': 'calfRaise',
  'Calf Raises': 'calfRaise',
};

/**
 * Resolve the i18n cue key for an engine exercise name, or null when no cue is
 * curated for that exercise (the caller then renders nothing — graceful, never
 * a placeholder). The returned key is the full dotted i18n path
 * `workout.cues.<id>`; the caller passes it to t().
 *
 * @param engineName Engine canonical (English) exercise name.
 */
export function getExerciseCueKey(engineName: string): string | null {
  const id = CUE_KEY_BY_EXERCISE[engineName];
  return id ? `workout.cues.${id}` : null;
}
