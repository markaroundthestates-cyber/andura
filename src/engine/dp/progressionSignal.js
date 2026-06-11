// ══ #42 PROGRESSION SIGNAL — "is the user PROGRESSING on this lift?" ══════════
// Backlog #42/#43 dedicated round. The tier-select selection score
// (exerciseTierRank.tierSelectScore) carries a documented but UNWIRED
// `progressing` hook (RECENT_PROGRESS_BONUS = +5). #42 wires it: only the lifts
// the user is DEMONSTRABLY progressing on earn the selection bonus — NOT every
// logged lift.
//
// WHY CONDITIONAL (the historical refusal — do NOT repeat it). A blanket "+20 on
// anything logged" was MEASURED to make every logged lift sticky and TANK the
// full-path cohort: convergedPct 13.6% → 1%, craters 53 → 69 (exerciseTierRank.js
// §hasLog NOTE + dp_progression_bonus_v1 flag rationale). The fix is a signal that
// fires ONLY for a real upward trend, so a stagnant/regressing logged lift gets
// NO boost and a genuinely-better unlogged sidegrade can still win.
//
// PURE + DETERMINISTIC. This module never reads the DB or the clock: the caller
// passes the exercise's own log rows (DP.getLogs-style: newest-first, {w,reps,rpe,
// ts}) and OPTIONALLY dp.js's exact `e1RMForSet` closure so the progression trend
// is measured in the SAME RIR-corrected e1RM space the rest of the engine uses
// (continuity with the PR-floor / Kalman). With no closure it falls back to a
// documented inline Epley (same R_CAP=12, same 3-bucket RIR map as dp.js) so a
// pure-fn caller still gets a correct trend. Returns false on thin/cold history →
// the bonus is inert (byte-identical) for a new user.

// ── Tunables (DESIGN PROPOSALS — conservative; sim sweep + Daniel before flip) ──
// Window: the most-recent N exposures the trend is judged over. 3-5 per the spec —
// long enough that one bad day cannot define it, short enough to track a real climb.
export const TREND_WINDOW = 5;
// Minimum DISTINCT exposures required before we will call anything "progressing".
// < this → cold/thin history → not progressing (the bonus stays off until there is
// a real series — a single heavy log is not a trend).
export const MIN_EXPOSURES = 3;
// Net e1RM gain (oldest-in-window → best-recent) that counts as a real upward
// trend, as a FRACTION of the oldest e1RM. 3% clears typical session-to-session
// e1RM noise (a one-rep wobble at a fixed load is ~1-2%); a genuine load climb
// (64→68 kg ≈ +6%) clears it comfortably. Conservative so a flat lift never qualifies.
export const PROGRESS_THRESHOLD = 0.03;
// Epley effective-rep saturation cap (mirrors dp.js E1RM_R_CAP — high-rep linear
// over-estimate guard) for the inline fallback when no e1RMForSet closure is passed.
const E1RM_R_CAP = 12;
// 3-bucket RIR fallback (mirrors dp.js RATING_TO_RIR): usor 3 / potrivit 1 / greu 0.
// A legacy/absent rpe → potrivit-equivalent (RIR 1), the engine's neutral default.
function rirFromRpe(rpe) {
  const r = Number(rpe);
  if (!Number.isFinite(r)) return 1;
  if (r <= 6.5) return 3;
  if (r >= 8.5) return 0;
  return 1;
}

/**
 * Inline RIR-corrected, saturated Epley e1RM for one set — the documented fallback
 * when the caller does not inject dp.js's e1RMForSet. SAME math as dp.js
 * (W·(1 + min(R_CAP, reps+RIR)/30)) so the two never diverge. Returns null on
 * unusable inputs (no/zero load or reps) → that set is skipped.
 * @param {number} w @param {number} reps @param {number} [rpe] @returns {number|null}
 */
function inlineE1RM(w, reps, rpe) {
  const W = Number(w);
  const R = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
  if (!Number.isFinite(W) || W <= 0) return null;
  if (!Number.isFinite(R) || R <= 0) return null;
  const rEff = Math.min(E1RM_R_CAP, R + rirFromRpe(rpe));
  return W * (1 + rEff / 30);
}

/**
 * Reduce log ROWS (newest-first) to a per-set e1RM SERIES in chronological order
 * (oldest → newest), capped to the most-recent `window` exposures. A row missing a
 * usable load/reps yields no e1RM and is skipped. Shared by the progression trend
 * (#42) and the base lookback (#43). PURE.
 *
 * @param {Array<{w?:number, reps?:number|string, rpe?:number, ts?:number}>} rows newest-first
 * @param {((w:number, reps:number, rpe:number)=>(number|null))|null} [e1RMForSet] dp.js closure; null → inline Epley
 * @param {number} [window] cap to the most-recent N rows (default TREND_WINDOW)
 * @returns {number[]} e1RM values oldest→newest (length ≤ window)
 */
export function e1rmSeries(rows, e1RMForSet, window = TREND_WINDOW) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const f = typeof e1RMForSet === 'function' ? e1RMForSet : inlineE1RM;
  const recent = rows.slice(0, Math.max(1, window)); // newest-first, capped
  const out = [];
  // Walk oldest→newest so the returned series is chronological (a trend reads L→R).
  for (let i = recent.length - 1; i >= 0; i--) {
    const l = recent[i];
    const e = f(Number(l && l.w), Number(l && l.reps), Number(l && l.rpe) || 7);
    if (e != null && Number.isFinite(e) && e > 0) out.push(e);
  }
  return out;
}

/**
 * Is the user PROGRESSING on this lift? True only when a robust upward trend over
 * the recent window clears PROGRESS_THRESHOLD. Robust against a single bad day:
 * the trend compares the OLDEST in-window e1RM against the BEST of the recent half
 * (not strictly the last set), so one dip does not erase a climb — but a stagnant
 * or regressing series never qualifies (the historical-refusal guard).
 *
 * Requires MIN_EXPOSURES distinct usable sets; thinner history → false (inert).
 * PURE — rows + an optional e1RMForSet closure; no DB, no clock.
 *
 * @param {Array<{w?:number, reps?:number|string, rpe?:number, ts?:number}>} rows newest-first
 * @param {((w:number, reps:number, rpe:number)=>(number|null))|null} [e1RMForSet]
 * @returns {boolean}
 */
export function isProgressing(rows, e1RMForSet) {
  const series = e1rmSeries(rows, e1RMForSet, TREND_WINDOW);
  if (series.length < MIN_EXPOSURES) return false; // thin/cold → not a trend
  const oldest = series[0];
  if (!(oldest > 0)) return false;
  // BEST of the recent half (the back of the series) vs the oldest in-window value.
  // Using the recent-half MAX (not strictly series[series.length-1]) makes the
  // signal tolerant of a single down day at the very end: a 64→68→73→77→(74 bad)
  // run is still progressing. A flat or downward series has a recent-half max at or
  // below the oldest → no qualifying gain → false.
  const half = Math.ceil(series.length / 2);
  let recentBest = 0;
  for (let i = series.length - half; i < series.length; i++) {
    if (series[i] > recentBest) recentBest = series[i];
  }
  return recentBest >= oldest * (1 + PROGRESS_THRESHOLD);
}

/**
 * Build the set of PROGRESSING exercise names from a name→rows accessor over the
 * user's logged lifts. The I/O boundary (getDailyWorkout) supplies the logged names
 * + a `getRowsFor(name)` reader (DP.getLogs) + dp.js's e1RMForSet; this stays pure.
 * Only names with a real upward trend are included → the selection bonus is
 * conditional, never blanket.
 *
 * @param {Iterable<string>} loggedNames canonical EN engine names the user has logged
 * @param {(name:string)=>Array<{w?:number,reps?:number|string,rpe?:number,ts?:number}>} getRowsFor
 * @param {((w:number, reps:number, rpe:number)=>(number|null))|null} [e1RMForSet]
 * @returns {Set<string>} names the user is progressing on
 */
export function progressingNames(loggedNames, getRowsFor, e1RMForSet) {
  const out = new Set();
  if (!loggedNames || typeof getRowsFor !== 'function') return out;
  for (const name of loggedNames) {
    if (typeof name !== 'string' || !name) continue;
    const rows = getRowsFor(name);
    if (isProgressing(rows, e1RMForSet)) out.add(name);
  }
  return out;
}
