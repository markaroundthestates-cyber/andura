// ══ CALIBRATION-SIM — config + engine bridge (ported into _wt_p3 for CI) ════
// Ported from salafull/scripts/admin/_SIM_config.mjs. The vault version used a
// node localStorage shim + vite-node --root; under vitest+jsdom localStorage
// already exists, so we import the REAL engine modules with relative paths and
// only reset the store between profiles. Deterministic — no clock, no API.

import { DP } from '../../../src/engine/dp.js';
import { suggestStartWeight } from '../../../src/engine/coldStartGuidelines.js';
import { roundToEquipmentWeight } from '../../../src/config/weights.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { COMPOUND_EX, EX_SETS } from '../../../src/constants.js';
import { persistSessionLogs } from '../../../src/react/stores/workoutStore.logic.ts';
import { DB } from '../../../src/db.js';

export const N_PROFILES = 50;
export const N_SESSIONS = 50;
export const SESS_MIN = 30;
export const SESS_MAX = 50;
export const CONVERGE_BAND = 0.1;
export const SEED = 0xa9d04a;

/** Per-profile isolation: clear localStorage so one Gigel's logs/cal/bias never
 *  leak into the next (mirrors the vault resetStore). */
export function resetStore() {
  try {
    localStorage.clear();
    // dp_rep_class_v1 defaults ON (THE FLIP 2026-06-10) and re-points isolation
    // rep ranges (un-caps them in CUT), which shifts the rMin the demonstrated-
    // working-load floor back-solves at → it moves this sim's frozen prescription
    // hash. This sim drives getSmartRecommendation DIRECTLY, so (unlike the path-A
    // flips) the flip reaches it. Pin it OFF here to keep the frozen baseline a
    // true legacy-rep world (the determinism + calibration-drift guard the sim
    // exists for). The ON rep behavior is covered by dp/repRange.test.js + the
    // #70 persona-matrix + the full-path-sim ON arm.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_rep_class_v1: false }));
  } catch {
    /* jsdom always provides localStorage */
  }
}

// ── deterministic RNG (mulberry32) — identical to the vault harness ──────────
export function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const gauss = (r, mean, sd) => {
  const u = Math.max(1e-9, r());
  const v = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** Engine surface the run logic drives — the REAL prod modules. */
export const engine = {
  DP,
  suggestStartWeight,
  roundToEquipmentWeight,
  getExerciseMetadata,
  COMPOUND_EX,
  EX_SETS,
  persistSessionLogs,
  DB,
};
