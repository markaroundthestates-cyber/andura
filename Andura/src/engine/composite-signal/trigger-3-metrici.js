// ══ COMPOSITE SIGNAL §36.41 — 3-metric AND trigger ════════════════════════════
// LOCKED V1 per §36.41 Chat C — 3/3 simultaneous threshold (NU cumulative).
// False positive prevention: triggered DOAR cand TOATE 3 metrici simultan abnormal.
//
// Anatomical agnostic preserved post-C4.6 verify Big 11 wire compatible — signals
// arbitrate purely on performance metrics (performanceDropPct + restTimeMultiplier
// + rirMismatch), ZERO Big 6 EN hardcoded refs, ZERO Big 11 RO group keys per
// ADR_ENGINE_REFACTOR §4.6 LOCK V1 acceptance criteria. Composite signal layer is
// taxonomy-independent — works identical whether upstream engines emit Big 6 EN
// or Big 11 RO group keys (engines C4.1-4.5 LANDED return Big 11 RO post-refactor;
// composite-signal NU consumes group keys directly).

/**
 * @typedef {Object} CompositeSignalInput
 * @property {number} performanceDropPct rolling 3-session avg, % volume reduction (e.g. 0.20 = 20%)
 * @property {number} restTimeMultiplier vs normal exercise rest avg (e.g. 1.6 = 60% longer)
 * @property {number} declaredRir RPE-derived RIR
 * @property {number} actualRepsAtFailure max attempt reps observed
 * @property {number} expectedRepsAtRir reps expected at declared RIR
 */

const PERFORMANCE_DROP_THRESHOLD = 0.15;     // >15% volume drop
const REST_TIME_MULTIPLIER_THRESHOLD = 1.5;  // >1.5x normal
const RIR_MISMATCH_THRESHOLD = 2;            // declared RIR off by 2+ from actual

/**
 * Detect Composite Signal trigger (3/3 simultaneous abnormal).
 * @param {CompositeSignalInput} input
 * @returns {{ trigger: boolean, fired: string[] }}
 */
export function detectCompositeSignal(input) {
  const fired = [];
  if (input.performanceDropPct > PERFORMANCE_DROP_THRESHOLD)         fired.push('performance_drop');
  if (input.restTimeMultiplier > REST_TIME_MULTIPLIER_THRESHOLD)     fired.push('rest_time_excessive');
  const rirMismatch = Math.abs(input.expectedRepsAtRir - input.actualRepsAtFailure);
  if (rirMismatch >= RIR_MISMATCH_THRESHOLD)                         fired.push('rir_mismatch');

  return { trigger: fired.length === 3, fired };
}

export const COMPOSITE_SIGNAL_THRESHOLDS = {
  PERFORMANCE_DROP_THRESHOLD,
  REST_TIME_MULTIPLIER_THRESHOLD,
  RIR_MISMATCH_THRESHOLD,
};
