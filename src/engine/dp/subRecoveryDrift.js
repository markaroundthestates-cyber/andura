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

import { musclesForExercise } from '../muscleMap.js';
import { isEnabled } from '../../util/featureFlags.js';

// ── Daniel-tunable (F6a §1f / §7 — DESIGN PROPOSAL, needs a sim sweep + sanity
//    check before the flag flips ON, like the RATING_TO_RIR caveat) ────────────
export const DRIFT_WINDOW = 8;          // sets per exercise read (newest-first)
export const DRIFT_MIN_SETS = 4;        // need >=4 matched-load sets to judge a slope
export const DRIFT_GREU_SLOPE_MIN = 0.06; // greu-share slope per session to flag drift
export const DRIFT_E1RM_DROP_MIN = 0.03;  // >=3% e1RM suppression at flat load → drift
export const DRIFT_SYSTEMIC_GROUPS = 2;   // >=2 groups drifting at once → systemic
const DRIFT_LOAD_TOL = 1.05;            // matched load = modal kg +/- ~5% (one equip step)
// dp_drift_session_window_v1 (live 2026-08-28) — the legacy per-SET reading let
// (a) months-old rows vote a deload TODAY (no age cutoff: founder's June-only
// Flat DB Press window kept REACTIVE_AA latched through July+August), and
// (b) within-session fatigue read as under-recovery (set 1 fresh vs set 5 tired
// at the same load = a fake negative e1RM "drift"). ON: only sets younger than
// DRIFT_MAX_AGE_DAYS vote, and both signals aggregate PER SESSION (greu-share /
// best-set e1RM per session, slope ACROSS sessions — the spec's actual intent).
export const DRIFT_MAX_AGE_DAYS = 21;   // sets older than this cannot vote
export const DRIFT_MIN_SESSIONS = 3;    // >=3 distinct sessions to judge a slope

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
 * @param {number} [now] wall-clock ms; enables the session-mode age window
 *   (dp_drift_session_window_v1) — omitted → no age cutoff (legacy/test path)
 * @returns {{drift:boolean, ratingDrift:boolean, e1rmDrift:boolean, groups:string[], slope:number}}
 */
export function detectExerciseDrift(logs, ex, e1rmFn, now) {
  const sessionMode = isEnabled('dp_drift_session_window_v1');
  const blank = { drift: false, ratingDrift: false, e1rmDrift: false, groups: [], slope: 0 };
  let rows = (Array.isArray(logs) ? logs : [])
    .filter((l) => l && Number.isFinite(Number(l.w)) && Number(l.w) > 0);
  // Age window (session mode, when `now` is supplied): a stale era must not vote a
  // deload today — only recent sets describe the CURRENT recovery state.
  if (sessionMode && Number.isFinite(now)) {
    const oldest = now - DRIFT_MAX_AGE_DAYS * 86_400_000;
    rows = rows.filter((l) => Number.isFinite(Number(l.ts)) && Number(l.ts) >= oldest);
  }
  // Session mode reads the WHOLE age window (8 sets ≈ only 2 real sessions — too
  // few to ever reach DRIFT_MIN_SESSIONS); legacy keeps the 8-set window.
  if (!sessionMode) rows = rows.slice(0, DRIFT_WINDOW);
  // chronological (oldest-first) so the slope is "across sessions forward".
  rows = rows.reverse();
  if (rows.length < DRIFT_MIN_SETS) return blank;

  const modal = _modalLoad(rows.map((l) => Number(l.w)));
  if (!(modal > 0)) return blank;
  const matched = rows.filter((l) => {
    const w = Number(l.w);
    return w >= modal / DRIFT_LOAD_TOL && w <= modal * DRIFT_LOAD_TOL;
  });
  if (matched.length < DRIFT_MIN_SETS) return blank;

  // Session mode: aggregate PER SESSION so within-session fatigue (set 1 fresh vs
  // set 5 tired at the same load) can never read as under-recovery. Sessions are
  // keyed by the durable row's `session` anchor (fallback: calendar day).
  const bySession = sessionMode ? new Map() : null;
  if (bySession) {
    for (const l of matched) {
      const key = Number.isFinite(Number(l.session)) ? Number(l.session) : Math.floor(Number(l.ts) / 86_400_000);
      if (!bySession.has(key)) bySession.set(key, []);
      bySession.get(key).push(l);
    }
    if (bySession.size < DRIFT_MIN_SESSIONS) return blank;
  }
  const sessions = bySession ? [...bySession.values()] : null;

  const toReps = (l) => (typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps));
  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

  // rating-drift: greu-share rising, reps NOT collapsing (overload owned by EASE-BACK).
  // Session mode: share per SESSION, slope across sessions; legacy: per set.
  const greuSeries = sessions
    ? sessions.map((ss) => mean(ss.map((l) => (Number(l.rpe) >= 8.5 ? 1 : 0))))
    : matched.map((l) => (Number(l.rpe) >= 8.5 ? 1 : 0));
  const slope = _slope(greuSeries);
  // reps falling below target would be an overload set, not under-recovery — only
  // count drift when the LATER matched sets are not also short on reps.
  const repVals = sessions
    ? sessions.map((ss) => mean(ss.map(toReps).filter(Number.isFinite)))
    : matched.map(toReps);
  const firstReps = repVals.find((r) => Number.isFinite(r)) ?? 0;
  const lastReps = [...repVals].reverse().find((r) => Number.isFinite(r)) ?? firstReps;
  const repsHeld = !(Number.isFinite(firstReps) && Number.isFinite(lastReps) && lastReps < firstReps * 0.85);
  const ratingDrift = slope >= DRIFT_GREU_SLOPE_MIN && repsHeld;

  // e1RM-suppression (rep-scheme-safe): e1RM trending DOWN at flat load. Only when
  // the e1RM fn is supplied (dp_e1rm_v1 ON) — otherwise degrade to rating-drift.
  // Same reps-held guard as rating-drift: a reps COLLAPSE is an overload set the
  // reactive EASE-BACK owns (not under-recovery), and it suppresses e1RM too — so
  // it must NOT count as suppression drift. Session mode compares each session's
  // BEST matched set (freshest proxy of capacity) first-session vs last-session.
  let e1rmDrift = false;
  if (typeof e1rmFn === 'function' && repsHeld) {
    const perSet = (ls) => ls
      .map((l) => e1rmFn(Number(l.w), /** @type {any} */ (l.reps), l.rpe, ex))
      .filter((e) => Number.isFinite(e) && e > 0);
    const e1 = sessions
      ? sessions.map((ss) => Math.max(0, ...perSet(ss))).filter((e) => e > 0)
      : perSet(matched);
    if (e1.length >= (sessions ? DRIFT_MIN_SESSIONS : DRIFT_MIN_SETS)) {
      const first = e1[0];
      const last = e1[e1.length - 1];
      if (first > 0 && (first - last) / first >= DRIFT_E1RM_DROP_MIN) e1rmDrift = true;
    }
  }

  const drift = ratingDrift || e1rmDrift;
  const ms = musclesForExercise(ex); // QA-F8: curated OR metadata-derived
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
      // `now` forwarded → session mode's age window (stale eras can't vote).
      const v = detectExerciseDrift(logsByEx[ex], ex, e1rmFn, now);
      if (v.drift) {
        driftingEx.push(ex);
        for (const g of v.groups) groupSet.add(g);
      }
    }
  }
  const groups = [...groupSet];
  // Session mode: a SINGLE multi-head lift (Cable Row → mid_trap+lat) must not
  // read as "systemic" — the spec's intent is multiple LIFTS drifting at once.
  const enoughExercises = isEnabled('dp_drift_session_window_v1')
    ? driftingEx.length >= DRIFT_SYSTEMIC_GROUPS
    : true;
  const systemic = groups.length >= DRIFT_SYSTEMIC_GROUPS && enoughExercises;
  // severity: 0 (none) .. 1 (broad) — share of drifting groups, capped. Narration
  // tiers + #32 read this; it never drives kg.
  const severity = systemic ? Math.min(1, groups.length / 4) : 0;
  return { systemic, groups, exercises: driftingEx, severity };
}
