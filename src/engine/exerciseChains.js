// ══ SUBSTITUTION CHAINS — chains-as-data (#6, Wave-2 library) ══════════════════
//
// EXPLICIT substitution chains are the PRIMARY, deterministic substitution source
// (ANDURA-CORE-LIBRARY-v2-2026-06-03.md §"Selectie engine" + §"Substitution chains
// (ordonate)"): "EXPLICIT chains PRIMARY (deterministic), `pattern` field SECONDARY
// fallback only. CONFIRMED." This replaces the hand-maintained SIMILAR_EXERCISES
// table as the primary cross-exercise source; SIMILAR_EXERCISES stays only as a
// documented fallback layer (a few cross-equipment kg ratios the chains don't
// encode) per exerciseMapping.js.
//
// DATA, not logic: each chain is an ORDERED array of canonical engineNames, best
// first, degrading toward bodyweight/redistribute. A name's substitutes are the
// names that follow it in any chain it appears in (forward order preserved). Every
// name here is a real library key (asserted by the chains test) — these are the
// canonical engineNames the engine emits, so the data needs no resolution itself.
//
// Source verbatim from the doc's §"Substitution chains (ordonate)", with the doc's
// abbreviations expanded to the live engineNames (e.g. "Back Squat" →
// "Barbell Back Squat (High Bar)", "Hyperext BW" → "Hyperextension Bodyweight").

/** @type {Readonly<Record<string, ReadonlyArray<ReadonlyArray<string>>>>} */
export const SUBSTITUTION_CHAINS = Object.freeze({
  chest: [
    ['Flat Barbell Bench', 'Flat DB Press', 'Flat Chest Press Machine', 'Smith Machine Bench', 'Push-up', 'Knee Push-up'],
    ['Incline Barbell Bench', 'Incline DB Press', 'Incline Chest Press Machine', 'Smith Incline Bench', 'Incline Push-up'],
    ['Cable Fly', 'Pec Deck / Cable Fly', 'DB Fly', 'Push-up'],
  ],
  back: [
    ['Lat Pulldown', 'Neutral-Grip Lat Pulldown', 'V-Bar Lat Pulldown', 'Band-Assisted Pull-up', 'Pull-up'],
    ['Cable Row', 'V-Bar Cable Row', 'Chest-Supported Row', 'DB Row', 'Inverted Row Bar'],
    ['Barbell Row', 'Pendlay Row', 'Chest-Supported DB Row', 'Cable Row', 'Inverted Row Bar'],
  ],
  shoulders: [
    ['OHP', 'Seated DB Press', 'Machine Shoulder Press', 'Smith OHP', 'Landmine Shoulder Press', 'Pike Push-up'],
    ['DB Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise', 'Leaning Lateral Raise'],
    ['Reverse Pec Deck', 'Cable Rear Delt Fly', 'DB Rear Delt Fly', 'Face Pull', 'Band Pull-Apart'],
  ],
  biceps: [
    ['Barbell Curl Standing', 'EZ-bar Curl Standing', 'DB Curl Standing', 'Cable Curl'],
    ['DB Hammer Curl Standing', 'Cable Hammer Curl Rope', 'Reverse Curl EZ-bar'],
    ['Incline DB Curl', 'Bayesian Curl', 'Cable Curl'],
  ],
  triceps: [
    ['Cable Triceps Pushdown Rope', 'Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown V-bar', 'Cable Triceps Pushdown Single-Arm', 'Diamond Push-up'],
    ['Cable Overhead Triceps Extension Rope', 'Cable Single-Arm Overhead Triceps Extension', 'DB Overhead Triceps Extension Two-Hand', 'Lying Triceps Extension EZ-bar'],
  ],
  quads: [
    ['Barbell Back Squat (High Bar)', 'Front Squat', 'Smith Machine Squat', 'Leg Press', 'Goblet Squat', 'Bodyweight Squat'],
    ['Leg Press', 'Hack Squat Machine', 'Pendulum Squat', 'Belt Squat', 'Goblet Squat'],
    ['Bulgarian Split Squat', 'DB Lunge', 'Reverse Lunge', 'Walking Lunge', 'Bodyweight Squat'],
  ],
  hamstrings: [
    ['Romanian Deadlift', 'DB Romanian Deadlift', 'Trap Bar Deadlift', 'Hyperextension Bodyweight'],
    ['Seated Leg Curl', 'Leg Curl', 'Standing Leg Curl', 'Band Leg Curl', 'Nordic Hamstring Curl Assisted'],
  ],
  glutes: [
    ['Hip Thrust', 'Smith Hip Thrust', 'Plate-Loaded Hip Thrust Machine', 'Glute Drive Machine', 'DB Hip Thrust', 'Glute Bridge Bodyweight'],
    ['Cable Glute Kickback', 'Hip Abduction Machine', 'Cable Pull-Through', 'Single-Leg Glute Bridge'],
  ],
  calves: [
    ['Standing Calf Raise Machine', 'Smith Standing Calf Raise', 'Leg Press Calf Raise', 'Standing DB Calf Raise', 'Single-Leg Calf Raise Bodyweight'],
    ['Seated Calf Raise Machine', 'Leg Press Calf Raise', 'Standing DB Calf Raise'],
  ],
  core: [
    ['Cable Crunch Kneeling', 'Reverse Crunch', 'Bicycle Crunch'],
    ['Ab Wheel Rollout', 'Plank', 'Dead Bug'],
    ['Hanging Leg Raise', 'Hanging Knee Raise', 'Captains Chair Leg Raise', 'Reverse Crunch'],
  ],
});

// Flat list of all chains for the lookup index (group key dropped — substitution
// is by movement family, encoded in the chain order itself).
const ALL_CHAINS = Object.values(SUBSTITUTION_CHAINS).flat();

/**
 * Ordered substitutes for `name`, drawn from the explicit chains: every name that
 * FOLLOWS `name` in any chain it appears in, best-first, de-duplicated, never the
 * name itself. The deterministic PRIMARY substitution source (the doc's "EXPLICIT
 * chains PRIMARY"). Returns [] for a name in no chain (the consumer then falls
 * through to its own fallback — equipment_alternatives / SIMILAR_EXERCISES).
 *
 * PURE. Does NOT resolve aliases — pass a canonical engineName (resolve upstream if
 * the inbound name might be an alias).
 *
 * @param {string} name canonical engineName
 * @returns {string[]} ordered, de-duplicated downstream substitutes
 */
export function getChainSubstitutes(name) {
  if (typeof name !== 'string' || name.length === 0) return [];
  const out = [];
  const seen = new Set([name]);
  for (const chain of ALL_CHAINS) {
    const i = chain.indexOf(name);
    if (i < 0) continue;
    for (let j = i + 1; j < chain.length; j++) {
      const n = chain[j];
      if (!seen.has(n)) { seen.add(n); out.push(n); }
    }
  }
  return out;
}
