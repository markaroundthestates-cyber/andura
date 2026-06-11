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

// ══ ROUNDING-UNIVERSAL — template MATCH + snap-to-ladder (CEO design 2026-06-11) ══
// _GYMLOG_FINDINGS_2026-06-11.md §GENERALIZARE: the learn-from-logs rounding does
// NOT learn the gym rung-by-rung. From 2-3 DISTINCT logged loads it MATCHES one of
// the common factory ladders (equipmentTemplates.js) and then knows the WHOLE ladder
// instantly. Per-USER per-MACHINE. Precedence at snap: curated (photo, future seam)
// > matched template (here) > generic fallbackRound (config/weights.js — untouched,
// never regresses, the cold-start safety net).
//
// Persistence: a SEPARATE synced key `dp-equipment-obs` (cal-factor pattern, name-
// keyed, quota-guarded), so BUILD #10/E's `dp-equipment-ladder` (the modal-step
// cache) stays byte-identical. Per exercise we store the distinct observed loads
// (capped) + the last matched templateId. The match is RECOMPUTABLE from the obs,
// so the stored templateId is an optimization/continuity layer, not a drift source.

import { EQUIPMENT_TEMPLATES, getTemplate } from '../equipmentTemplates.js';

export const EQUIPMENT_OBS_KEY = 'dp-equipment-obs';

// Distinct loads to retain per exercise (a station's ladder is fully pinned by a
// handful of distinct rungs — more is noise + storage). Oldest dropped past the cap.
export const OBS_CAP = 12;
// Distinct observations needed before a match is trusted (CEO: "din 2-3 valori").
export const MATCH_MIN_DISTINCT = 2;
// A logged load counts as "on a rung" when within this kg of the nearest rung. Kept
// BELOW half the finest auto-match cadence (the 1kg-integer low end of the metric DB
// set) so a between-rungs load (e.g. 3.5 on a 1kg ladder, 0.5 away from both 3 and 4)
// is correctly OFF the ladder and a too-dense template cannot match everything — yet
// still absorbs a hand-entry round-off (22.5 vs 22.7 = 0.2). NOTE: no sub-1kg micro-
// plate template is in the auto-match library for this reason (a 1kg cadence would
// match nearly any integer-ish pair); micro plates are a curated-only (photo) source.
export const RUNG_TOL = 0.4;
// How many distinct observations may MISS the ladder and the template still match
// (CEO: tolerant to 1 outlier — "userul poate gresi o intrare"; real case Cable Row
// 77 in a 73/78 gym). A single bad entry never blocks an otherwise-clean match.
export const OUTLIER_BUDGET = 1;

/** @returns {Record<string, {loads:number[], templateId?:string}>} */
function _getAllObs() {
  const raw = /** @type {any} */ (DB.get(EQUIPMENT_OBS_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/** Sorted distinct finite positive loads. @param {ReadonlyArray<number>} arr */
function _distinct(arr) {
  return [...new Set(
    (Array.isArray(arr) ? arr : []).map((w) => Number(w)).filter((w) => Number.isFinite(w) && w > 0),
  )].sort((a, b) => a - b);
}

/** Nearest rung distance for one load against a sorted ladder. @returns {number} */
function _nearestDist(steps, load) {
  let best = Infinity;
  for (let i = 0; i < steps.length; i++) {
    const d = Math.abs(steps[i] - load);
    if (d < best) best = d;
    else if (steps[i] > load && d > best) break; // sorted → distance only grows past min
  }
  return best;
}

/**
 * Record a distinct logged working load for one exercise into the observation
 * accumulator, then (re)resolve the best-matching template and cache its id.
 * Additive + QUOTA-GUARDED (mirrors saveLearnedStep / savePosterior). Synced per-UID
 * (dp-equipment-obs). Idempotent on a repeat load (already-known rungs are not
 * duplicated; the obs set is distinct). PURE except the single DB read+write.
 * @param {string} engineName EN canonical name
 * @param {number} kg the logged working load (per-hand for DBs — the value the user enters)
 * @returns {{ok:boolean, error?:string, templateId:string|null}}
 */
export function observeLoggedWeight(engineName, kg) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key', templateId: null };
  const w = Number(kg);
  if (!(Number.isFinite(w) && w > 0)) return { ok: false, error: 'bad_load', templateId: null };
  const all = _getAllObs();
  const prev = all[engineName] && Array.isArray(all[engineName].loads) ? all[engineName].loads : [];
  // distinct union, keep the most-recent OBS_CAP (drop oldest distinct rungs first).
  const merged = _distinct([...prev, w]);
  const loads = merged.length > OBS_CAP ? merged.slice(merged.length - OBS_CAP) : merged;
  const match = matchTemplate(loads);
  const rec = /** @type {{loads:number[], templateId?:string}} */ ({ loads });
  if (match.templateId) rec.templateId = match.templateId;
  all[engineName] = rec;
  const res = DB.set(EQUIPMENT_OBS_KEY, all);
  if (res && res.ok === false) return { ok: false, error: res.error, templateId: match.templateId };
  return { ok: true, templateId: match.templateId };
}

/**
 * Match a set of distinct observed loads to the best common ladder template.
 * PURE — no DB. A template MATCHES when at least MATCH_MIN_DISTINCT distinct loads
 * fall ON its rungs (within RUNG_TOL) and the loads that MISS are within
 * OUTLIER_BUDGET (one fat-finger entry tolerated). Among matching templates the best
 * is the one with the most on-rung loads, then the tightest total rung error, then
 * the FINEST ladder (smallest mean step — never over-coarsens), then a stable id
 * tiebreak. Confidence ∈ [0,1] = on-rung fraction, lightly scaled by how many
 * distinct loads corroborate (a 2-load match is weaker than a 5-load match).
 * @param {ReadonlyArray<number>} observations
 * @returns {{templateId:string|null, confidence:number}}
 */
export function matchTemplate(observations) {
  const loads = _distinct(observations);
  if (loads.length < MATCH_MIN_DISTINCT) return { templateId: null, confidence: 0 };
  let best = null;
  for (const t of EQUIPMENT_TEMPLATES) {
    const steps = t.steps;
    if (!Array.isArray(steps) || steps.length < 2) continue;
    let onRung = 0;
    let totalErr = 0;
    for (const load of loads) {
      const d = _nearestDist(steps, load);
      if (d <= RUNG_TOL) { onRung += 1; totalErr += d; }
    }
    const misses = loads.length - onRung;
    if (onRung < MATCH_MIN_DISTINCT || misses > OUTLIER_BUDGET) continue;
    const meanStep = (steps[steps.length - 1] - steps[0]) / (steps.length - 1);
    const cand = { id: t.id, onRung, totalErr, meanStep };
    if (best == null
      || cand.onRung > best.onRung
      || (cand.onRung === best.onRung && cand.totalErr < best.totalErr - 1e-9)
      || (cand.onRung === best.onRung && Math.abs(cand.totalErr - best.totalErr) <= 1e-9 && cand.meanStep < best.meanStep - 1e-9)
      || (cand.onRung === best.onRung && Math.abs(cand.totalErr - best.totalErr) <= 1e-9 && Math.abs(cand.meanStep - best.meanStep) <= 1e-9 && cand.id < best.id)
    ) best = cand;
  }
  if (best == null) return { templateId: null, confidence: 0 };
  // confidence: on-rung fraction, scaled by corroboration (caps at >=4 distinct).
  const onRungFrac = best.onRung / loads.length;
  const corroboration = Math.min(1, best.onRung / 4);
  const confidence = Math.round(onRungFrac * (0.6 + 0.4 * corroboration) * 1000) / 1000;
  return { templateId: best.id, confidence };
}

/** The active ladder steps for one exercise from a recomputed match, or null. */
function _activeLadder(engineName) {
  const rec = _getAllObs()[engineName];
  if (!rec) return null;
  // RECOMPUTE the match from the stored obs (never trust the cached templateId
  // blindly — a later observation could have broken the old match). Deterministic
  // + the persisted id is only a continuity hint, not a source of truth.
  const id = matchTemplate(rec.loads || []).templateId;
  const t = id ? getTemplate(id) : null;
  return t && Array.isArray(t.steps) && t.steps.length >= 2 ? t.steps : null;
}

/**
 * Snap a weight to the active ladder for one exercise, with precedence:
 *   curated (photo — future seam, `curatedSteps` arg) > matched template > fallback.
 * `fallbackRound` is the generic rounding callback (config/weights.js
 * roundToEquipmentWeight) — called UNCHANGED when no learned/curated ladder exists,
 * so cold-start + flag-off are byte-identical. DETERMINISTIC, defensive (zero throw):
 * any bad input degrades to fallbackRound(kg) (or kg when no fallback given).
 *
 * @param {string} engineName EN canonical name
 * @param {number} kg the weight to snap
 * @param {(w:number)=>number} [fallbackRound] generic rounding fn (the safety net)
 * @param {ReadonlyArray<number>} [curatedSteps] photo-curated rungs (win when present)
 * @returns {number}
 */
export function snapToLadder(engineName, kg, fallbackRound, curatedSteps) {
  const w = Number(kg);
  const fb = () => {
    try { return typeof fallbackRound === 'function' ? Number(fallbackRound(w)) : w; }
    catch { return w; }
  };
  if (!Number.isFinite(w)) return fb();
  // 1) curated (photo) wins outright when supplied + usable.
  const curated = Array.isArray(curatedSteps)
    ? curatedSteps.map(Number).filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b)
    : null;
  const ladder = (curated && curated.length >= 1)
    ? curated
    : (typeof engineName === 'string' && engineName ? _activeLadder(engineName) : null);
  if (!ladder || ladder.length < 1) return fb();
  // 2) nearest rung on the active ladder; ties → the LOWER rung (conservative load).
  let bestRung = ladder[0];
  let bestDist = Math.abs(ladder[0] - w);
  for (let i = 1; i < ladder.length; i++) {
    const d = Math.abs(ladder[i] - w);
    if (d < bestDist - 1e-9) { bestDist = d; bestRung = ladder[i]; }
  }
  // Rungs derived from imperial stacks land on noisy kg (130lb → 58.97); snap the
  // returned rung to a displayable 0.5kg granularity so the user sees 59, not 59.02.
  return round05(bestRung);
}

/**
 * The active matched template id for one exercise (read-only introspection / the
 * future photo-curation UI), or null when unmatched. @param {string} engineName
 * @returns {string|null}
 */
export function activeTemplateId(engineName) {
  const rec = _getAllObs()[engineName];
  if (!rec) return null;
  return matchTemplate(rec.loads || []).templateId;
}
