// ══ BUILD #64 — PERSISTENT pain memory + proactive substitution ══════════════
// _ENGINE_WIRING_2026-06-07/F7_pain_outlier_spec.md §1 (dp_pain_memory_v1, OFF).
//
// The existing per-exercise pain module (exercisePain.js) DEMOTES a painful /
// skipped exercise in the pool and DECAYS the signal over time. The gap this
// closes: a DURABLE pin ("this hurt — hold the substitute until I say it's OK")
// that does NOT decay, plus a PROACTIVE swap to the curated chain substitute
// (not just a demote), plus a reversible clear-UX. Sits BESIDE exercisePain.js
// and mirrors its shape 1:1 (same _getAll / quota-guard / EN-key / sync pattern).
//
// Persistence (separate from the decaying dp-exercise-pain counter):
//   dp-pain-memory = { [engineName]: { region, intensity, pinnedTs, substitute } }
//   - engineName = EN canonical name (#41 discipline — the SAME key dp-exercise-pain
//     / dp-strength-posterior use). Synced (firebase.js SYNC_KEYS + NAME_KEYED) +
//     reset-parity (dataRegistry.js USER_DATA_KEYS).
//   - substitute = the chain substitute resolved ONCE at pin time (stable across
//     sessions, not re-rolled). Held until the pin is cleared.
//
// Anti-paternalism: never a hard ban — the swap is to a curated substitute, never
// the last-for-a-muscle (the pool's own last-option guard holds), always reversible
// via clearPainPin. Default-OFF → byte-identical (the caller builds painSwaps:null).

import { DB } from '../../db.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { getTransferSources } from '../exerciseMapping.js';
import { PAIN_REGION_GROUP_MAP } from '../muscleRecoveryConstants.js';
import { canonicalizeNameKeyedMap } from './logIdentity.js';

export const PAIN_MEMORY_KEY = 'dp-pain-memory';

/** @typedef {{region?:string, intensity?:number, pinnedTs?:number, substitute?:string|null}} PainPin */

/** @returns {Record<string, PainPin>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(PAIN_MEMORY_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * Resolve the proactive substitute for a painful exercise: the FIRST
 * getTransferSources candidate (chains PRIMARY → equipment_alternatives →
 * SIMILAR_EXERCISES → same-muscle last resort) suitable for the pin.
 *
 * Re-irritation guard (spec §1b.4c): skip a candidate whose primary muscle is in
 * the painful region's group(s) — BUT only for a REFERRED/JOINT pain, i.e. when the
 * painful region maps to a DIFFERENT muscle group than the pinned exercise's own
 * primary (e.g. shoulder pain on a chest press → route away from shoulder-loading
 * subs). For DIRECT same-muscle pain (the painful region IS the worked muscle, e.g.
 * chest pain on a bench), the curated chain substitute is the right movement-family
 * alternative and is NOT skipped — otherwise every same-muscle option is excluded
 * and the swap degrades to nothing. PURE — reads only the injected accessor + maps.
 *
 * @param {string} engineName EN canonical name of the painful exercise
 * @param {string|undefined} region the PainButton BodyRegion that was reported
 * @param {Iterable<string>} [activeNames] candidate pool for the muscle-match last resort
 * @returns {string|null} the substitute engineName, or null when none is suitable
 */
export function resolveSubstitute(engineName, region, activeNames) {
  if (typeof engineName !== 'string' || !engineName) return null;
  const painGroups = (region && PAIN_REGION_GROUP_MAP[region]) || [];
  const pinnedMeta = getExerciseMetadata(engineName);
  const pinnedPrimary = pinnedMeta ? pinnedMeta.muscle_target_primary : undefined;
  // Referred/joint pain = the painful region's group(s) do NOT include the worked
  // muscle. Only then does routing to a same-painful-region sub re-irritate.
  const referred =
    Array.isArray(painGroups) && painGroups.length > 0 &&
    !!pinnedPrimary && !painGroups.includes(pinnedPrimary);
  const sources = getTransferSources(engineName, getExerciseMetadata, activeNames);
  for (const cand of sources) {
    const meta = getExerciseMetadata(cand);
    const primary = meta ? meta.muscle_target_primary : undefined;
    if (referred && primary && painGroups.includes(primary)) continue; // re-irritates
    return cand;
  }
  return null;
}

/**
 * Pin a painful exercise — a DURABLE (non-decaying) record held until cleared.
 * The substitute is resolved ONCE here so the swap is stable session-to-session.
 * Additive + QUOTA-GUARDED (mirrors exercisePain.recordExerciseSkip): DB.set
 * returns {ok:false} on quota — surfaced, never thrown, so a full store degrades
 * to "no pin recorded" rather than corrupting the key.
 *
 * @param {string} engineName EN canonical name of the active exercise
 * @param {{region?:string, intensity?:number, nowMs?:number, activeNames?:Iterable<string>}} [opts]
 * @returns {{ok:boolean, error?:string}}
 */
export function pinPain(engineName, opts = {}) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  const { region, intensity, nowMs } = opts;
  const all = _getAll();
  all[engineName] = {
    region: typeof region === 'string' ? region : undefined,
    intensity: Number.isFinite(Number(intensity)) ? Number(intensity) : undefined,
    pinnedTs: Number(nowMs) || Date.now(),
    substitute: resolveSubstitute(engineName, region, opts.activeNames),
  };
  const res = DB.set(PAIN_MEMORY_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Clear a pin — reversible (the exercise returns to normal selection next session,
 * byte-identical to pre-pin). Quota-guarded. No-op when the pin is absent.
 * @param {string} engineName EN canonical name
 * @returns {{ok:boolean, error?:string}}
 */
export function clearPainPin(engineName) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  const all = _getAll();
  if (!(engineName in all)) return { ok: true };
  delete all[engineName];
  const res = DB.set(PAIN_MEMORY_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/** @returns {Record<string, PainPin>} a defensive copy of all active pins */
export function getPainPins() {
  return { ...(_getAll()) };
}

/**
 * Is this exercise currently pinned as painful? Used to thread the `pain` reason
 * into dp.js load-transition derivation (#75's deferred boundary).
 * @param {string} engineName EN canonical name
 * @returns {boolean}
 */
export function isPinnedPainful(engineName) {
  if (typeof engineName !== 'string' || !engineName) return false;
  return engineName in _getAll();
}

/**
 * Build the proactive-swap map { [engineName]: substitute } for the pool boundary.
 * Only pins that resolved a substitute are included — a pin with no suitable
 * substitute falls through to today's DEMOTE behavior (the penalty map), never a
 * hard hole. The caller gates this behind dp_pain_memory_v1; an empty map (the
 * common case — nobody pinned) → byte-identical pool order even with the flag ON.
 * @returns {Record<string, string>}
 */
export function painSwapMap() {
  // Phase-2b read-side: collapse the pin store onto CANONICAL keys so a pin set
  // under a historical alias AND the current name resolves to ONE swap the
  // (untouched) pool boundary matches against the canonical engineName. Merge
  // semantic = LATEST pin wins (a pin is a singular durable state "hold the sub",
  // not additive); the freshest pinnedTs carries the substitute the user last
  // chose. Off-library names keep themselves. Pins persist raw (Phase-3 writes id).
  const all = canonicalizeNameKeyedMap(
    _getAll(),
    (a, b) => ((Number(b && b.pinnedTs) || 0) >= (Number(a && a.pinnedTs) || 0) ? b : a),
  );
  const map = /** @type {Record<string, string>} */ ({});
  for (const engineName of Object.keys(all)) {
    const sub = all[engineName] && all[engineName].substitute;
    if (typeof sub === 'string' && sub) map[engineName] = sub;
  }
  return map;
}
