// ══ EXERCISE MAPPING — Estimare greutate initiala din exercitii similare ══════
//
// Legacy hand table (16 entries). Several KEYS are pre-F-1 display names
// (`Pushdown`, `Lateral Raises`) that are no longer the engineNames the library
// emits (the live CORE_AUTO names are `Cable Triceps Pushdown …`, `DB Lateral
// Raise`, …). Build #4 (F3 transfer cold-start) re-keys to the LIVE names below
// AND, as the primary source, reads the richer 657-entry `equipment_alternatives`
// library graph (getTransferSources). The legacy table stays as a curated
// fallback layer (a few cross-equipment ratios the library graph does not encode).

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
  'Lat Pulldown': ['Cable Row'],

  // ── F3 #4 RE-KEY to live CORE_AUTO engineNames (the names the engine emits) ──
  'DB Hammer Curl Standing': ['DB Curl Standing', 'Incline DB Curl', 'Bayesian Curl'],
  'DB Curl Standing': ['Incline DB Curl', 'Cable Curl', 'Bayesian Curl'],
  'Cable Triceps Pushdown Straight Bar': ['Cable Triceps Pushdown V-bar', 'Cable Triceps Pushdown Rope'],
  'Cable Triceps Pushdown Rope': ['Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown V-bar'],
  'Cable Triceps Pushdown V-bar': ['Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown Rope'],
  'DB Lateral Raise': ['Cable Lateral Raise', 'Machine Lateral Raise'],
  'Cable Lateral Raise': ['DB Lateral Raise', 'Machine Lateral Raise'],
  'Machine Lateral Raise': ['DB Lateral Raise', 'Cable Lateral Raise'],
  'Cable Rear Delt Fly': ['DB Rear Delt Fly', 'Reverse Pec Deck', 'Face Pull'],
  'DB Rear Delt Fly': ['Cable Rear Delt Fly', 'Reverse Pec Deck', 'Face Pull'],
  'Face Pull': ['Cable Rear Delt Fly', 'DB Rear Delt Fly'],
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

/**
 * @param {string} target
 * @param {string} source
 */
export function getSimilarityMultiplier(target, source) {
  const ratios = /** @type {Record<string, number>} */ (SIMILARITY_RATIO);
  return ratios[target + '_' + source] || ratios['default'] || 0.9;
}

// ══ F3 #4 — ordered transfer-source resolution (cross-exercise cold-start) ════
// Returns the related exercise NAMES to seed a new exercise's e1RM from, ordered
// best-first: (a) the library `equipment_alternatives` graph (657-entry, same
// movement family, library-maintained — the richest source), then (b) the legacy
// SIMILAR_EXERCISES hand table (re-keyed to live names), then (c) any CORE_AUTO
// sharing the same `muscle_target_primary` (last resort). De-duplicated, never
// includes the target itself. PURE — reads only the injected metadata accessor.
//
// @param {string} target the new exercise's engineName
// @param {(name:string)=>(object|null|undefined)} getMeta library metadata accessor
// @param {Iterable<string>} [activeNames] candidate pool for the muscle-match
//   last resort (the live CORE_AUTO names); omitted → muscle match skipped.
// @returns {string[]} ordered, de-duplicated related engineNames
export function getTransferSources(target, getMeta, activeNames) {
  const out = [];
  const seen = new Set([target]);
  const push = (n) => {
    if (typeof n === 'string' && n && !seen.has(n)) { seen.add(n); out.push(n); }
  };

  // (a) library equipment_alternatives — same movement family.
  const meta = typeof getMeta === 'function' ? getMeta(target) : null;
  const eqAlts = meta && Array.isArray(meta.equipment_alternatives) ? meta.equipment_alternatives : [];
  for (const n of eqAlts) push(n);

  // (b) legacy SIMILAR_EXERCISES (now re-keyed to live names).
  const sim = /** @type {Record<string, string[]>} */ (SIMILAR_EXERCISES)[target] || [];
  for (const n of sim) push(n);

  // (c) muscle_target_primary match — last resort, only when a candidate pool
  // is supplied. Keeps the seed in the right muscle when no family link exists.
  const primary = meta && meta.muscle_target_primary;
  if (primary && primary !== 'unknown' && activeNames) {
    for (const n of activeNames) {
      if (seen.has(n)) continue;
      const m = typeof getMeta === 'function' ? getMeta(n) : null;
      if (m && m.muscle_target_primary === primary) push(n);
    }
  }
  return out;
}
