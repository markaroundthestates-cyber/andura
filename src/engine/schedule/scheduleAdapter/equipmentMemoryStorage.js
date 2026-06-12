// ── Equipment-memory storage (founder Busy/Missing redesign 2026-06-12) ──────
// Split sibling of refusalFlowStorage / missingEquipmentStorage (barrel preserved).
//
// PER-EXERCISE missing-equipment memory, distinct from the COARSE 10-item
// wv2-missing-equipment picker (missingEquipmentStorage.js, Account › AparateLipsa):
//   - wv2-missing-equipment  → 10 coarse station IDs (gantere / leg-press / …)
//     the user manually toggles; getDailyWorkout subtracts the coarse TYPES.
//   - wv2-equipment-missing-exercises (THIS module) → the set of SPECIFIC EN
//     canonical EXERCISE names the user told the coach they cannot do because
//     THAT machine/station is absent (the in-session "Aparat lipsa" → confirm
//     flow). getDailyWorkout HARD-excludes exactly these names from future
//     composition (sessionBuilder, last-option guarded).
//
// KEY LEVEL + BLAST RADIUS (documented per founder spec): the exercise library
// (exercises.json) carries only a COARSE `equipment_type` (6 buckets: dumbbell/
// barbell/cable/machine/bodyweight/band) — there is NO fine-grained machine/
// station id, and NO same-machine "skip-substitute family" mapping to extend to.
// So the most HONEST identity available is the exercise's CANONICAL EN NAME (the
// same key DP / poolForGroup / sessionBuilder use). Remembering "Leg Extension is
// missing" therefore excludes EXACTLY that one named exercise from future
// composition — NOT the whole `machine` bucket (that would wrongly drop Leg Press,
// Chest Press, etc. too). Blast radius = one exercise name per entry. Same-name
// aliases collapse to ONE canonical key (canonicalLoggedName), mirroring the
// refusal/skipped read-side, so a movement remembered under a historical alias
// AND its current name yields one entry the (untouched) pipeline matches against.
//
// Device-local v1 (NOT in firebase.js SYNC_KEYS — same as wv2-refusal-counter /
// wv2-missing-equipment / wv2-skipped-exercises). Cleared with the rest of the
// wv2 layer on a full data reset. Reversible: removeMissingEquipmentExercise (the
// Account list's remove action) makes the exercise available again.

import { canonicalLoggedName } from '../../dp/logIdentity.js';

export const EQUIPMENT_MISSING_EXERCISES_KEY = 'wv2-equipment-missing-exercises';

/**
 * Read the per-exercise missing-equipment list from localStorage. Collapses each
 * name to its CANONICAL identity (canonicalLoggedName) before the dedupe — an
 * alias + the current name fold to one entry the (untouched) pipeline consumer
 * matches on. Filters to non-empty strings. Safe against malformed JSON / non-
 * array / disabled storage (returns []).
 *
 * @returns {string[]} canonical EN exercise names the user marked equipment-missing
 */
export function getMissingEquipmentExercises() {
  let raw = null;
  try { raw = localStorage.getItem(EQUIPMENT_MISSING_EXERCISES_KEY); } catch { return []; }
  if (!raw) return [];
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed
    .filter(e => typeof e === 'string' && e.length > 0)
    .map(canonicalLoggedName))];
}

/**
 * Persist the per-exercise missing-equipment list. Dedupes (canonicalized) +
 * filters to non-empty strings before write so storage never holds junk.
 *
 * @param {string[]} list
 */
export function setMissingEquipmentExercises(list) {
  const safe = Array.isArray(list)
    ? [...new Set(list.filter(e => typeof e === 'string' && e.length > 0).map(canonicalLoggedName))]
    : [];
  try { localStorage.setItem(EQUIPMENT_MISSING_EXERCISES_KEY, JSON.stringify(safe)); } catch { /* noop */ }
}

/**
 * Remember ONE exercise as equipment-missing (in-session "Aparat lipsa" confirm).
 * Idempotent — adding an already-remembered name is a no-op. Empty / non-string
 * input silently rejected. Returns the new list.
 *
 * @param {string} exerciseName English canonical engine name
 * @returns {string[]} new list post-add (canonical)
 */
export function addMissingEquipmentExercise(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) {
    return getMissingEquipmentExercises();
  }
  const canon = canonicalLoggedName(exerciseName);
  const current = getMissingEquipmentExercises();
  if (current.includes(canon)) return current;
  const next = [...current, canon];
  setMissingEquipmentExercises(next);
  return next;
}

/**
 * Forget ONE exercise (the Account list's remove action — the user got the
 * equipment, so the coach may recommend it again). Preserves the other entries.
 * No-op when the entry is absent / input invalid. Returns the new list.
 *
 * @param {string} exerciseName English canonical engine name
 * @returns {string[]} new list post-remove (canonical)
 */
export function removeMissingEquipmentExercise(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) {
    return getMissingEquipmentExercises();
  }
  const canon = canonicalLoggedName(exerciseName);
  const current = getMissingEquipmentExercises();
  if (!current.includes(canon)) return current;
  const next = current.filter(e => e !== canon);
  setMissingEquipmentExercises(next);
  return next;
}

/**
 * True when the given exercise is remembered as equipment-missing. Canonical-
 * aware (matches an alias against its current-name entry and vice-versa).
 *
 * @param {string} exerciseName English canonical engine name
 * @returns {boolean}
 */
export function isEquipmentMissingExercise(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return false;
  return getMissingEquipmentExercises().includes(canonicalLoggedName(exerciseName));
}
