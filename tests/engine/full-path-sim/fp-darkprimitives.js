// ══ FULL-PATH-SIM — DARK path-A primitives (NOT full-path-drivable, by design) ══
// HONEST COVERAGE NOTE: dp_dip_classifier_v1 (classifyPerformanceDip) and
// dp_auto_pivot_v1 (proposeGoalPivot) have NO live caller in the session-composition
// path — grep confirms (fp-config header). They are PURE decision primitives shipped
// behind their flags but not yet wired into getDailyWorkout / compose / dp. The
// full-path cohort therefore CANNOT observe their effect on the session; pretending
// otherwise would be faking coverage.
//
// What this module DOES: exercise each at its deepest REACHABLE seam (a direct call
// with realistic inputs) so the flip decision has at least UNIT-level evidence the
// primitive behaves, with a loud flag that it is not yet seam-wired. When these get a
// live caller, fold them into the cohort run + remove this module.

import { classifyPerformanceDip, DIP_CLASS } from '../../../src/engine/dp/dipClassifier.js';
import { proposeGoalPivot } from '../../../src/engine/dp/autoPivot.js';

/**
 * Drive classifyPerformanceDip across the cause scenarios its branches cover.
 * Returns the observed class per scenario (the flip-decision evidence). The flag
 * is irrelevant here — the function is pure + uncalled in prod; this proves the
 * LOGIC is correct so wiring it later is the only remaining step.
 */
export function exerciseDipClassifier() {
  const acwrHigh = { acwr: 1.8 };
  const acwrLow = { acwr: 1.0 };
  return {
    gap: classifyPerformanceDip({ returnDeload: { multiplier: 0.85 } }).class, // DETRAINING
    fatigueByAcwr: classifyPerformanceDip({
      acwr: acwrHigh, fatigue: { recommend: 'deload', sleepBad: 0 },
    }).class, // FATIGUE (safety guard)
    lifeDip: classifyPerformanceDip({
      acwr: acwrLow, fatigue: { recommend: 'reduce', sleepBad: 3 },
    }), // LIFE_DIP + suppressDeload:true
    none: classifyPerformanceDip({ acwr: acwrLow, fatigue: { recommend: 'none', sleepBad: 0 } }).class,
    degradeNoAcwr: classifyPerformanceDip({ fatigue: { recommend: 'deload', sleepBad: 3 } }).class, // FATIGUE
  };
}

/**
 * Drive proposeGoalPivot: a broadly near-ceiling, long-stagnated population should
 * yield a proposal; a midrange one should not. PURE — the flag gates the (absent)
 * CALLER, not this function.
 */
export function exerciseAutoPivot(nowMs) {
  const nearCeiling = [
    { ex: 'Lat Pulldown', mu: 98, ceiling: 100 },
    { ex: 'Leg Press', mu: 197, ceiling: 200 },
    { ex: 'Cable Row', mu: 78, ceiling: 80 },
    { ex: 'Romanian Deadlift', mu: 118, ceiling: 120 },
  ];
  const midrange = [
    { ex: 'Lat Pulldown', mu: 60, ceiling: 100 },
    { ex: 'Leg Press', mu: 120, ceiling: 200 },
    { ex: 'Cable Row', mu: 50, ceiling: 80 },
  ];
  return {
    proposed: proposeGoalPivot({
      lifts: nearCeiling, maxStagnationWeeks: 4, currentGoalId: 'forta', nowMs, prompts: {},
    }),
    notProposedMidrange: proposeGoalPivot({
      lifts: midrange, maxStagnationWeeks: 4, currentGoalId: 'forta', nowMs, prompts: {},
    }),
    notProposedFresh: proposeGoalPivot({
      lifts: nearCeiling, maxStagnationWeeks: 0, currentGoalId: 'forta', nowMs, prompts: {},
    }),
  };
}

export { DIP_CLASS };
