// ══ BUILD #65 — log-outlier QUARANTINE ledger ════════════════════════════════
// _ENGINE_WIRING_2026-06-07/F7_pain_outlier_spec.md §2b.4 (dp_log_outlier_v1, OFF).
//
// A reversible, per-UID ledger of which sets the outlier detector excluded from
// learning. The outlier set STAYS in `logs` VERBATIM (never deleted — the same
// flag-not-delete stance as anomalyGuard.js:9-12); only its LEARNING contribution
// is suppressed. This ledger lets the UI SURFACE the flagged set so the user can
// REVERT ("asta a fost real" → re-fed to learning via dp.js's userConfirmed path).
//
// Persistence: dp-log-quarantine = { [engineName]: [ { ts, w, reps, z } ] }
//   - engineName = EN canonical name (#41 discipline — the SAME key the posterior
//     uses). Synced (firebase.js SYNC_KEYS + NAME_KEYED) + reset-parity
//     (dataRegistry.js USER_DATA_KEYS).
// Purely additive + QUOTA-GUARDED (mirrors exercisePain.recordExerciseSkip): a
// missing ledger degrades to "no quarantine surfaced" (conservative). Default-OFF
// → never written → byte-identical.

import { DB } from '../../db.js';

export const LOG_QUARANTINE_KEY = 'dp-log-quarantine';
// Rolling cap per exercise — a ledger is a surface-and-revert aid, not an archive.
export const QUARANTINE_MAX_PER_EX = 20;

/** @typedef {{ts:number, w:number, reps:number, z:number}} QuarantineEntry */

/** @returns {Record<string, QuarantineEntry[]>} */
function _getAll() {
  const raw = /** @type {any} */ (DB.get(LOG_QUARANTINE_KEY));
  return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
}

/**
 * Record a quarantined (outlier) set. Additive + QUOTA-GUARDED — never throws.
 * De-duplicated by ts (the same set re-folded on a re-render is not double-listed).
 * @param {string} engineName EN canonical name
 * @param {{ts?:number, w?:number, reps?:number, z?:number}} entry
 * @returns {{ok:boolean, error?:string}}
 */
export function quarantineSet(engineName, entry) {
  if (typeof engineName !== 'string' || !engineName || !entry) return { ok: false, error: 'bad_key' };
  const ts = Number(entry.ts) || 0;
  const all = _getAll();
  const list = Array.isArray(all[engineName]) ? all[engineName] : [];
  if (ts && list.some((e) => Number(e.ts) === ts)) return { ok: true }; // already listed
  const rec = {
    ts,
    w: Number(entry.w) || 0,
    reps: Number(entry.reps) || 0,
    z: Number.isFinite(Number(entry.z)) ? Number(entry.z) : 0,
  };
  all[engineName] = [rec, ...list].slice(0, QUARANTINE_MAX_PER_EX);
  const res = DB.set(LOG_QUARANTINE_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Remove a quarantined set (revert — "that was real"). Quota-guarded. Matches by
 * ts. No-op when absent. The caller re-feeds the set to learning via dp.js's
 * existing userConfirmed path (consistent with the fat-finger confirm semantics).
 * @param {string} engineName EN canonical name
 * @param {number} ts the quarantined set's timestamp
 * @returns {{ok:boolean, error?:string}}
 */
export function unquarantineSet(engineName, ts) {
  if (typeof engineName !== 'string' || !engineName) return { ok: false, error: 'bad_key' };
  const all = _getAll();
  const list = Array.isArray(all[engineName]) ? all[engineName] : null;
  if (!list) return { ok: true };
  const next = list.filter((e) => Number(e.ts) !== Number(ts));
  if (next.length === list.length) return { ok: true }; // nothing matched
  if (next.length === 0) delete all[engineName];
  else all[engineName] = next;
  const res = DB.set(LOG_QUARANTINE_KEY, all);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Whether a specific set (by exercise + ts) is currently quarantined — used to
 * EXCLUDE it from the posterior fold + calibration on re-read.
 * @param {string} engineName EN canonical name
 * @param {number} ts
 * @returns {boolean}
 */
export function isQuarantined(engineName, ts) {
  if (typeof engineName !== 'string' || !engineName) return false;
  const list = _getAll()[engineName];
  if (!Array.isArray(list)) return false;
  const T = Number(ts);
  if (!Number.isFinite(T) || T === 0) return false;
  return list.some((e) => Number(e.ts) === T);
}

/**
 * The quarantined sets for one exercise (defensive copy), or [] when none.
 * @param {string} engineName EN canonical name
 * @returns {QuarantineEntry[]}
 */
export function getQuarantine(engineName) {
  const list = _getAll()[engineName];
  return Array.isArray(list) ? list.map((e) => ({ ...e })) : [];
}
