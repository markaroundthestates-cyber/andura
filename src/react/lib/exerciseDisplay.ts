// ══ EXERCISE DISPLAY — English engine key → user-facing display name + subtitle ═
// Display names follow the Maria/Gigel persona rule: movements whose conventional
// RO gym name IS English stay English (Face Pull, Lat Pulldown, Pec Deck, Romanian
// Deadlift); accessory moves with a natural RO term get good Romanian (Ridicari
// laterale, Ramat la cablu, Presa de picioare). Literal translations that confuse
// a normal user are banned (ex: "Trageri la fata" read as a facial → "Face Pull").
// CRIT parity fix (workout-flow): active Workout + WorkoutPreview rendered raw
// English engine keys ("Incline DB Press", "Pec Deck", "Lateral Raises", ...)
// in a Romanian-first app. The engine uses English names as CANONICAL IDs
// (PR records keyed by name, alternativeEngine maps, weight tables) — they are
// identity, NOT display strings. Translating at the engine source would break
// every keyed lookup, so the RO display name is applied at the React adapter
// boundary (scheduleAdapterAggregate.toPlannedExercise) instead. `id` keeps the
// English-derived slug so engine identity stays intact downstream.
//
// Coverage: the WHOLE engine exercise vocabulary, not just the strictly
// display-reachable subset. Only EXERCISES_BY_TYPE (sessionBuilder.js) names
// actually surface in a planned session today — buildSession FILTERS by
// equipment + prioritizeWeakGroups only REORDERS (no named-alternative swap;
// the old alternativeEngine is archived/dead, 99-archive/). The remaining names
// (MUSCLE_GROUP_EXERCISES, config tables in muscleMap.js/dp.js/config/weights.js,
// legacy constants.js PROG) are dormant config keys — covered defensively so the
// raw-key fallback can never embarrass us if any path ever surfaces them.
// There is NO nameRo field in the 657-exercise library; these are curated
// translations of the bounded engine vocabulary, not 657 fabricated strings.
//
// RO display names + subtitles for the default Push demo verbatim from mockup
// andura-clasic.html#L3970-3974 (Impins inclinat / Impins militar sezand /
// Ridicari laterale / Extensii triceps cablu). Remaining names use standard RO
// gym terminology; subtitles describe equipment/setup per src/engine/
// sessionBuilder.js EQUIP_MAP. NO_DIACRITICS_RULE (D-LEGACY-064).

export interface ExerciseDisplay {
  name: string;
  sub?: string;
}

// English engine key → user-facing display name + optional equipment/setup sub.
const EXERCISE_DISPLAY: Readonly<Record<string, ExerciseDisplay>> = {
  // ── Push ────────────────────────────────────────────────────────────────
  'Incline DB Press': { name: 'Impins inclinat', sub: 'Cu gantere · banc 30°' },
  'Flat DB Press': { name: 'Impins din piept', sub: 'Cu gantere · banc plat' },
  'DB Shoulder Press': { name: 'Impins militar sezand', sub: 'Cu gantere' },
  'Lateral Raises': { name: 'Ridicari laterale', sub: 'Cu gantere' },
  'Lateral Raises (cable)': { name: 'Ridicari laterale', sub: 'La cablu' },
  'Incline DB Press pump': { name: 'Impins inclinat', sub: 'Cu gantere · serii pump' },
  'Flat Barbell Bench': { name: 'Impins din piept', sub: 'Cu bara' },
  'Pec Deck': { name: 'Pec Deck', sub: 'Aparat fluturari' },
  'Pec Deck / Cable Fly': { name: 'Fluturari', sub: 'Pec deck / cablu' },
  'Cable Fly': { name: 'Fluturari la cablu', sub: 'Cablu' },
  'Overhead Triceps': { name: 'Extensii triceps peste cap', sub: 'Cablu' },
  'Pushdown': { name: 'Extensii triceps la cablu', sub: 'Cablu, prindere strans' },

  // ── Pull ────────────────────────────────────────────────────────────────
  'Lat Pulldown': { name: 'Lat Pulldown', sub: 'Aparat helcometru' },
  'Cable Row': { name: 'Ramat la cablu', sub: 'Aparat helcometru' },
  'Chest-Supported Row': { name: 'Ramat cu piept sprijinit', sub: 'Aparat' },
  'Face Pulls': { name: 'Face Pull', sub: 'Cablu' },
  'Bayesian Curl': { name: 'Flexii biceps la cablu', sub: 'Cablu' },
  'Incline DB Curl': { name: 'Flexii biceps inclinat', sub: 'Cu gantere · banc inclinat' },
  'Cable Curl': { name: 'Flexii biceps la cablu', sub: 'Cablu' },
  'Preacher Curl': { name: 'Flexii biceps la pupitru', sub: 'Banc preacher' },
  'Hammer Curl': { name: 'Hammer Curl', sub: 'Cu gantere · priza neutra' },
  'Rear Delt Fly': { name: 'Fluturari deltoid posterior', sub: 'Aparat fluturari' },
  'Rear Delt Cable': { name: 'Fluturari deltoid posterior', sub: 'Cablu' },

  // ── Legs ──────────────────────────────────────────────────────────────────
  'Leg Press': { name: 'Presa de picioare', sub: 'Aparat presa' },
  'Leg Extension': { name: 'Extensii cvadriceps', sub: 'Aparat picioare' },
  'Leg Curl': { name: 'Flexii femurale', sub: 'Aparat picioare' },
  'Romanian Deadlift': { name: 'Romanian Deadlift', sub: 'Cu bara' },
  'Calf Raise': { name: 'Ridicari pe varfuri', sub: 'Aparat gambe' },
  'Calf Raises': { name: 'Ridicari pe varfuri', sub: 'Aparat gambe' },
};

/**
 * Map an engine exercise name (English canonical key) to its Romanian display
 * form. Unknown names fall back to the original string with NO subtitle so the
 * UI never shows an empty label — Bugatti truth: nu inventam un nume RO pentru
 * un exercitiu necunoscut.
 */
export function toExerciseDisplay(engineName: string): ExerciseDisplay {
  return EXERCISE_DISPLAY[engineName] ?? { name: engineName };
}
