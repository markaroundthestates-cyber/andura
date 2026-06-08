// ══ BUILD F6a #26 — sub-recovery from rating drift (F6a spec §1) ═════════════
// EARLY systemic under-recovery detector. If `greu` creeps up at the SAME working
// load across sessions (or e1RM is quietly suppressed at flat kg), flag it BEFORE
// performance craters — so a coach line can pre-empt, and #32 (dipClassifier) can
// fuse it.
//
// PURE — a read of the durable `logs` only (no DB writes, no clock; `now` + the
// e1RM fn are injected). Mirrors dp/exercisePain.js module shape: small, flag-read
// at the consumer, never invoked when dp_subrecovery_drift_v1 is OFF.
//
// TWO drift signals per exercise, both from existing primitives:
//   - rating-drift   : the share of MATCHED-LOAD sets rated `greu` rises across the
//                      window (slope > 0), while reps are NOT below target (so it is
//                      NOT an overload set the reactive EASE-BACK already owns).
//   - e1RM-suppression: e1RMForSet (#1) on matched-load sets trends DOWN while load
//                      is flat (the rep-scheme-safe version). Degrades to OFF — the
//                      rating-drift signal alone — when dp_e1rm_v1 is OFF (no e1rmFn).
//
// Aggregate to a SYSTEMIC flag: >=2 muscle groups (EXERCISE_MUSCLES) drifting at
// once → {systemic:true}; a single exercise → {exercise-local} (narrate only).

import { EXERCISE_MUSCLES } from '../muscleMap.js';

// ── Daniel-tunable (F6a §1f / §7 — DESIGN PROPOSAL, needs a sim sweep + sanity
//    check before the flag flips ON, like the RATING_TO_RIR caveat) ────────────
export const DRIFT_WINDOW = 8;          // sets per exercise read (newest-first)
export const DRIFT_MIN_SETS = 4;        // need >=4 matched-load sets to judge a slope
export const DRIFT_GREU_SLOPE_MIN = 0.06; // greu-share slope per session to flag drift
export const DRIFT_E1RM_DROP_MIN = 0.03;  // >=3% e1RM suppression at flat load → drift
export const DRIFT_SYSTEMIC_GROUPS = 2;   // >=2 groups drifting at once → systemic
const DRIFT_LOAD_TOL = 1.05;            // matched load = modal kg +/- ~5% (one equip step)

/**
 * Least-squares slope of y over its index (0..n-1). PURE. Returns 0 for <2 points
 * or a degenerate x-variance (never NaN).
 * @param {number[]} ys
 * @returns {number}
 */
function _slope(ys) {
  const n = ys.length;
  if (n < 2) return 0;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += i; sy += ys[i]; sxx += i * i; sxy += i * ys[i];
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;
}

/**
 * The modal (most-frequent) working load among a set of kg values — the "matched
 * load" we compare like-for-like across sessions. PURE.
 * @param {number[]} kgs
 * @returns {number}
 */
function _modalLoad(kgs) {
  const counts = new Map();
  let best = 0, bestN = 0;
  for (const k of kgs) {
    if (!Number.isFinite(k) || k <= 0) continue;
    const c = (counts.get(k) || 0) + 1;
    counts.set(k, c);
    if (c > bestN || (c === bestN && k > best)) { bestN = c; best = k; }
  }
  return best;
}

/**
 * Per-exercise drift verdict over its recent matched-load sets. PURE.
 *
 * @param {ReadonlyArray<{w?:number, reps?:number|string, rpe?:number, ts?:number}>} logs
 *   newest-first set logs for ONE exercise (as DP.getLogs returns)
 * @param {string} ex EN canonical exercise name
 * @param {((w:number, reps:number|string, rpe?:number, ex?:string)=>number|null)|null} [e1rmFn]
 *   the e1RM-for-set fn (DP.e1RMForSet); null/omitted → rating-drift only (#1 OFF)
 * @returns {{drift:boolean, ratingDrift:boolean, e1rmDrift:boolean, groups:string[], slope:number}}
 */
export function detectExerciseDrift(logs, ex, e1rmFn) {
  const rows = (Array.isArray(logs) ? logs : [])
    .filter((l) => l && Number.isFinite(Number(l.w)) && Number(l.w) > 0)
    .slice(0, DRIFT_WINDOW)
    // chronological (oldest-first) so the slope is "across sessions forward".
    .reverse();
  const blank = { drift: false, ratingDrift: false, e1rmDrift: false, groups: [], slope: 0 };
  if (rows.length < DRIFT_MIN_SETS) return blank;

  const modal = _modalLoad(rows.map((l) => Number(l.w)));
  if (!(modal > 0)) return blank;
  const matched = rows.filter((l) => {
    const w = Number(l.w);
    return w >= modal / DRIFT_LOAD_TOL && w <= modal * DRIFT_LOAD_TOL;
  });
  if (matched.length < DRIFT_MIN_SETS) return blank;

  // rating-drift: greu-share rising, reps NOT collapsing (overload owned by EASE-BACK).
  const greuFlags = matched.map((l) => (Number(l.rpe) >= 8.5 ? 1 : 0));
  const slope = _slope(greuFlags);
  // reps falling below target would be an overload set, not under-recovery — only
  // count drift when the LATER matched sets are not also short on reps.
  const repVals = matched.map((l) => (typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps)));
  const firstReps = repVals.find((r) => Number.isFinite(r)) ?? 0;
  const lastReps = [...repVals].reverse().find((r) => Number.isFinite(r)) ?? firstReps;
  const repsHeld = !(Number.isFinite(firstReps) && Number.isFinite(lastReps) && lastReps < firstReps * 0.85);
  const ratingDrift = slope >= DRIFT_GREU_SLOPE_MIN && repsHeld;

  // e1RM-suppression (rep-scheme-safe): e1RM trending DOWN at flat load. Only when
  // the e1RM fn is supplied (dp_e1rm_v1 ON) — otherwise degrade to rating-drift.
  // Same reps-held guard as rating-drift: a reps COLLAPSE is an overload set the
  // reactive EASE-BACK owns (not under-recovery), and it suppresses e1RM too — so
  // it must NOT count as suppression drift.
  let e1rmDrift = false;
  if (typeof e1rmFn === 'function' && repsHeld) {
    const e1 = matched
      .map((l) => e1rmFn(Number(l.w), /** @type {any} */ (l.reps), l.rpe, ex))
      .filter((e) => Number.isFinite(e) && e > 0);
    if (e1.length >= DRIFT_MIN_SETS) {
      const first = e1[0];
      const last = e1[e1.length - 1];
      if (first > 0 && (first - last) / first >= DRIFT_E1RM_DROP_MIN) e1rmDrift = true;
    }
  }

  const drift = ratingDrift || e1rmDrift;
  const ms = (/** @type {Record<string,{primary:string[]}>} */ (EXERCISE_MUSCLES))[ex];
  const groups = drift && ms ? [...ms.primary] : [];
  return { drift, ratingDrift, e1rmDrift, groups, slope };
}

/**
 * Systemic sub-recovery verdict across every exercise the user trains. PURE.
 * Aggregates per-exercise drift; >= DRIFT_SYSTEMIC_GROUPS distinct muscle heads
 * drifting at once → systemic (the EARLY under-recovery the spec asks for). A
 * single drifting exercise → exercise-local (narrate only). `now` is accepted for
 * signature symmetry with the other detectors (#5/#32) but the slopes are
 * window-relative, so the verdict is independent of the absolute clock.
 *
 * @param {Record<string, ReadonlyArray<{w?:number, reps?:number|string, rpe?:number, ts?:number}>>} logsByEx
 * @param {number} [now]
 * @param {((w:number, reps:number|string, rpe?:number, ex?:string)=>number|null)|null} [e1rmFn]
 * @returns {{systemic:boolean, groups:string[], exercises:string[], severity:number}}
 */
export function detectSubRecoveryDrift(logsByEx, now, e1rmFn) {
  const driftingEx = [];
  const groupSet = new Set();
  if (logsByEx && typeof logsByEx === 'object') {
    for (const ex of Object.keys(logsByEx)) {
      const v = detectExerciseDrift(logsByEx[ex], ex, e1rmFn);
      if (v.drift) {
        driftingEx.push(ex);
        for (const g of v.groups) groupSet.add(g);
      }
    }
  }
  const groups = [...groupSet];
  const systemic = groups.length >= DRIFT_SYSTEMIC_GROUPS;
  // severity: 0 (none) .. 1 (broad) — share of drifting groups, capped. Narration
  // tiers + #32 read this; it never drives kg.
  const severity = systemic ? Math.min(1, groups.length / 4) : 0;
  return { systemic, groups, exercises: driftingEx, severity };
}
