// ══ BUG 3b — SUB-FLOOR DEMONSTRATED-LOAD BRIDGE (recommend PR-floor ONLY) ════════
// A lifter who logs heavy loads ONLY at reps BELOW the phase rep-floor (e.g. machine
// OHP 43x6 + 40x7 against an 8-rep floor) has demonstrated capacity that the raw
// _demonstratedWorkingW (which keeps only reps >= floor) discards entirely — so the
// recommend PR-floor reads 0, never lifts the rec, and the load drifts below what the
// user actually owns under repeated greu ratings.
//
// This bridges those SUB-FLOOR sets to the phase rep target via e1RM. SUB-FLOOR ONLY:
// a set at/above floor is already credited by the raw helper, and — crucially — the
// SYNERGIST floor (dp.js:2684 synFloorW) keeps calling the RAW helper, so it stays 0
// for an isolation's own rep range (Cable Curl 54x11-at-floor-15) and the pre-fatigue
// discount is never clamped up. Excludes a failed-AND-short grind (rpe >= 8.5): a set
// the user could not own does not set a floor.
//
// NOT ceiling-capped: the bridge is a load the user ACTUALLY completed, back-solved to
// MORE reps (=> always <= the logged kg), so it can never exceed reality. Capping it
// against a population ceiling would demote a PROVEN load — the very bug this fixes.
//
// PURE: callers inject the log window + the e1RM primitives (no dp.js import, lives
// under dp/ per the growth moratorium). Defensive: any bad input degrades to 0.

/**
 * Demonstrated working kg recovered from the user's SUB-FLOOR sets, or 0.
 * @param {ReadonlyArray<{w?:number,reps?:number|string,rpe?:number}>} logs newest-first
 * @param {number} floorReps phase rep-range minimum
 * @param {(w:number,reps:number,rpe:number)=>(number|null|undefined)} e1RMForSet
 * @param {(e1rm:number,repTarget:number)=>number} kgFromE1RM
 * @returns {number}
 */
export function subfloorDemoW(logs, floorReps, e1RMForSet, kgFromE1RM) {
  const floor = Number.isFinite(floorReps) ? floorReps : 8;
  let bestE1RM = 0;
  for (const l of (Array.isArray(logs) ? logs : [])) {
    const w = Number(l && l.w);
    if (!(w > 0)) continue;
    const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
    if (!Number.isFinite(reps) || reps <= 0 || reps >= floor) continue; // sub-floor ONLY
    const rpe = Number(l.rpe) || 7;
    if (rpe >= 8.5) continue; // a failed / overload grind is not owned capacity
    const e = typeof e1RMForSet === 'function' ? e1RMForSet(w, reps, rpe) : null;
    if (e != null && Number.isFinite(e) && e > bestE1RM) bestE1RM = e;
  }
  if (bestE1RM <= 0) return 0;
  const kg = typeof kgFromE1RM === 'function' ? kgFromE1RM(bestE1RM, floor) : 0;
  return Number.isFinite(kg) && kg > 0 ? kg : 0;
}
