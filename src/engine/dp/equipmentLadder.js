// ══ BUILD #10/E — learned per-gym equipment ladder (F4 spec §E) ══════════════
// config/weights.js snaps to a HARD-CODED increment table per exercise. The
// calibration factor absorbs a per-machine kg OFFSET but not the real INCREMENT
// LADDER (some gyms have 2.5kg dumbbell jumps, some 5kg; plate-loaded machines
// jump 10kg). This learns the real available rungs from the user's DISTINCT logged
// loads per exercise (sorted unique `w` → modal gap = the gym's true increment for
// that station) and exposes learnedStep(ex) → kg. weights.js consults it (behind
// dp_learned_ladder_v1) to refine the step; with no learned data it falls back to
// the hard-coded table → byte-identical.
//
// PURE inference (learnedStepFromLogs) + a SYNCED durable cache (dp-equipment-
// ladder, cal-factor pattern, name-keyed, quota-guarded). Slow-converging: needs
// >= LADDER_MIN_DISTINCT distinct logged loads before the step is trusted, so a
// thin history never overrides the safe hard-coded ladder.

import { DB } from '../../db.js';

export const EQUIPMENT_LADDER_KEY = 'dp-equipment-ladder';

// ── Tuning (no Daniel knob needed — fully learned, conservative) ─────────────
// Distinct logged loads required before the learned step is trusted.
export const LADDER_MIN_DISTINCT = 4;
// Sane learned-step bounds (kg): below this is sub-plate noise, above it is a gap
// from missed sessions / big jumps, not the station's true increment.
const STEP_MIN = 0.5;
const STEP_MAX = 25;
// Round a learned step to a clean rung (0.5kg granularity) so 2.4kg → 2.5kg.
const round05 = (x) => Math.round(x * 2) / 2;

/** @returns {Record<string, {step:number, n:number}>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(EQUIPMENT_LADDER_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * Infer the gym's true increment for one station from a list of logged loads.
 * PURE. Sorts the DISTINCT loads, takes the gaps between adjacent rungs, and
 * returns the MODAL (most common) gap — the increment the station actually offers.
 * Returns 0 when there is not enough distinct data (< LADDER_MIN_DISTINCT) or the
 * inferred step is out of the sane band → the caller keeps the hard-coded ladder.
 * @param {ReadonlyArray<number>} loggedLoads
 * @returns {number} learned step kg, or 0 when untrusted
 */
export function learnedStepFromLogs(loggedLoads) {
  if (!Array.isArray(loggedLoads)) return 0;
  const distinct = [...new Set(
    loggedLoads.map((w) => Number(w)).filter((w) => Number.isFinite(w) && w > 0),
  )].sort((a, b) => a - b);
  if (distinct.length < LADDER_MIN_DISTINCT) return 0;
  // Gaps between adjacent distinct rungs, rounded to 0.5kg buckets for a stable mode.
  const gaps = {};
  for (let i = 1; i < distinct.length; i++) {
    const g = round05(distinct[i] - distinct[i - 1]);
    if (g >= STEP_MIN && g <= STEP_MAX) gaps[g] = (gaps[g] || 0) + 1;
  }
  let bestGap = 0;
  let bestCount = 0;
  for (const [g, c] of Object.entries(gaps)) {
    const gap = Number(g);
    // Highest count wins; ties → the SMALLER gap (finer = safer, never over-coarsens).
    if (c > bestCount || (c === bestCount && gap < bestGap)) {
      bestCount = c;
      bestGap = gap;
    }
  }
  return bestGap;
}

/**
 * Persist the learned step for one exercise. Additive + QUOTA-GUARDED (mirrors
 * strengthKalman.savePosterior). Synced per-UID (dp-equipment-ladder in SYNC_KEYS).
 * @param {string} engineName EN canonical name
 * @param {number} step learned step kg
 * @param {number} n distinct loads it was inferred from
 * @returns {{ok:boolean, error?:string}}
 */
export function saveLearnedStep(engineName, step, n) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  if (!(Number(step) > 0)) return { ok: false, error: 'bad_step' };
  const all = _getAll();
  all[engineName] = { step: Number(step), n: Number(n) || 0 };
  const res = DB.set(EQUIPMENT_LADDER_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * The trusted learned step for one exercise, or 0 when none. Reads the synced
 * cache (sync DB). 0 → the caller keeps the hard-coded ladder (byte-identical).
 * @param {string} engineName EN canonical name
 * @returns {number}
 */
export function learnedStep(engineName) {
  const rec = _getAll()[engineName];
  if (!rec || !(Number(rec.step) > 0)) return 0;
  return Number(rec.step);
}
