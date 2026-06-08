// ══ BUILD #4/I — MPC: model-predictive progression (F4 spec §I) ══════════════
// The greedy double-progression chooses the next load one step at a time. MPC adds
// a short, BOUNDED look-ahead: for a small set of candidate next-loads it SIMULATES
// each forward N sessions through the engine's OWN deterministic e1RM model — the
// SAME pure functions the live engine uses (ceilingE1RM-derived gainDecay throttle +
// Kalman updatePosterior + e1RM back-solve), NO rebuild — under an assumed
// target-hitting rating response, scores the expected outcome (e1RM gain toward the
// ceiling, penalized by over-cap and oscillation), and picks the best.
//
// MINIMAL + CHEAP by design (F4 spec §I fallback clause — do not over-engineer):
//   • few candidates (hold / +1 step / +2 steps), bounded horizon (HORIZON sessions);
//   • a PURE forward recurrence in e1RM space — no DB, no recommend() replay, no
//     side effects (a full recommend() forward replay would need DB snapshotting in
//     a render-time read path → unsafe; the e1RM/ceiling/Kalman math IS the engine's
//     load model, so replaying it pure is faithful + safe);
//   • SELECTIVE: returns the greedy candidate UNLESS a different candidate scores
//     materially better (margin gate) → in the common case the chosen load is the
//     greedy step (golden-safe, no surprise divergence).
//
// The caller (dp.getSmartRecommendation) gates this behind dp_mpc_v1 (default OFF)
// and only ever lets MPC pick AMONG the candidate loads it is given (all bounded by
// the ceiling + the engine's own step), so MPC can never invent an out-of-range load.

import { updatePosterior } from './strengthKalman.js';
import { gainDecay } from './ceiling.js';

// ── Tuning — Daniel knob: HORIZON + the scoring weights (the coach's "personality":
// how much it values raw gain vs avoiding oscillation/over-cap). Conservative.
export const HORIZON = 3;            // sessions to look ahead (bounded, cheap)
export const W_GAIN = 1.0;           // reward: predicted e1RM gain toward the ceiling
export const W_OVERCAP = 2.0;        // penalty: a candidate that overshoots the ceiling
export const W_OSCILLATION = 1.5;    // penalty: a candidate the model must scale back
// A candidate must beat the greedy choice by at least this score margin to override
// it — keeps MPC SELECTIVE (greedy wins ties → golden-safe common case).
export const OVERRIDE_MARGIN = 0.5;

/**
 * Pure forward simulation of ONE candidate starting e1RM through HORIZON sessions.
 * Each session: the assumed target-hitting response yields the candidate e1RM as an
 * observation; the Kalman posterior folds it (smoothing); the next session's load is
 * allowed to grow by a gainDecay-throttled step toward the ceiling. Accumulates the
 * over-cap and oscillation penalties. PURE — no DB, no side effects.
 *
 * @param {object} args
 * @param {number} args.startE1RM the candidate's e1RM (kg-scale)
 * @param {number} args.ceiling the realistic ceiling e1RM (0 = none → no throttle/cap)
 * @param {number} args.muNow the current posterior mean e1RM (the greedy anchor)
 * @param {number} args.sigmaNow the current posterior sigma
 * @param {number} args.stepE1RM the base per-session e1RM step (the engine's increment)
 * @returns {{finalE1RM:number, score:number}}
 */
export function simulateForward({ startE1RM, ceiling, muNow, sigmaNow, stepE1RM }) {
  let mu = Number(muNow) > 0 ? Number(muNow) : Number(startE1RM);
  let sigma = Number(sigmaNow) > 0 ? Number(sigmaNow) : 8;
  const ceil = Number(ceiling) > 0 ? Number(ceiling) : 0;
  const step = Number(stepE1RM) > 0 ? Number(stepE1RM) : 0;
  let load = Number(startE1RM) > 0 ? Number(startE1RM) : mu;
  let overcap = 0;
  let oscillation = 0;
  let ts = 0;
  for (let s = 0; s < HORIZON; s++) {
    // Over-cap penalty: the prescribed load sits above the realistic ceiling.
    if (ceil > 0 && load > ceil) {
      overcap += (load - ceil) / ceil;
      oscillation += 1; // an over-cap load forces a scale-back next session
    }
    // Fold the assumed target-hit observation into the posterior (smoothing).
    const post = updatePosterior({ mu, sigma, lastObsTs: ts, n: s + 1 }, [{ e1rm: load, ts: ts + 1 }]);
    if (post) { mu = post.mu; sigma = post.sigma; }
    ts += 1;
    // Next session's load: grow by a gainDecay-throttled step toward the ceiling.
    const decay = ceil > 0 ? gainDecay(mu, ceil) : 1;
    load = load + step * decay;
  }
  const gain = mu - (Number(muNow) > 0 ? Number(muNow) : Number(startE1RM));
  const gainNorm = ceil > 0 ? gain / ceil : gain / Math.max(1, mu);
  const score = W_GAIN * gainNorm - W_OVERCAP * overcap - W_OSCILLATION * (oscillation / HORIZON);
  return { finalE1RM: mu, score };
}

/**
 * Choose the best candidate index by forward score, SELECTIVELY: the greedy index
 * wins unless another candidate beats it by at least OVERRIDE_MARGIN. Returns the
 * greedy index when candidates are unusable (→ caller keeps the greedy load).
 *
 * @param {ReadonlyArray<number>} candidateE1RMs the candidate next-load e1RMs (kg-scale)
 * @param {number} greedyIdx index of the greedy (engine-chosen) candidate
 * @param {object} ctx { ceiling, muNow, sigmaNow, stepE1RM } forward-model context
 * @returns {{idx:number, overrodeGreedy:boolean, scores:number[]}}
 */
export function chooseCandidate(candidateE1RMs, greedyIdx, ctx) {
  if (!Array.isArray(candidateE1RMs) || candidateE1RMs.length === 0) {
    return { idx: greedyIdx | 0, overrodeGreedy: false, scores: [] };
  }
  const gi = Number.isInteger(greedyIdx) && greedyIdx >= 0 && greedyIdx < candidateE1RMs.length ? greedyIdx : 0;
  const scores = candidateE1RMs.map((e) => simulateForward({ startE1RM: e, ...ctx }).score);
  const greedyScore = scores[gi];
  let bestIdx = gi;
  let bestScore = greedyScore;
  for (let i = 0; i < scores.length; i++) {
    // A non-greedy candidate must beat the greedy by the margin to win (golden-safe).
    if (i !== gi && scores[i] > bestScore && scores[i] - greedyScore >= OVERRIDE_MARGIN) {
      bestScore = scores[i];
      bestIdx = i;
    }
  }
  return { idx: bestIdx, overrodeGreedy: bestIdx !== gi, scores };
}
