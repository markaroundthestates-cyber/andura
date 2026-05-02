// ══ BIAS DETECTION — Mode drift observable ════════════════════════════════════
// LOCKED V1 per ADR_BIAS_DETECTION_OBSERVABLE_v1 + §36.34 Profile Validation Layer.
// Observable signals (event listeners — pure, no inference): "De ce?" tap rate,
// time on summary, rep range selections.
// Threshold: rolling window 8 sessions + 3/3 simultaneous signals → trigger
// PROMPT_PROFILE_VALIDATION_PLACEHOLDER (§36.58 LOCKED V1 wording).

/**
 * @typedef {Object} BiasSignals
 * @property {number} whyTapRate rolling 8 sessions, "De ce?" button tap rate (0-1)
 * @property {number} avgSummaryDwellMs average time spent on session summary
 * @property {number} repRangeOverrideRate user adjusts engine-suggested rep range (0-1)
 * @property {string} declaredMode user-declared mode în onboarding (STRATEGIC/EXECUTOR/HYBRID/AUTO)
 */

/**
 * Detect 3/3 simultaneous threshold per §36.34 (NU 40% cumulative score).
 * Returns trigger flag + which signals fired.
 * @param {BiasSignals} signals
 * @returns {{ trigger: boolean, fired: string[] }}
 */
export function detectBiasDrift(signals) {
  const fired = [];

  // Strategic profile = high "De ce?" engagement (>5%) + long summary dwell (>15s)
  // Executor profile = low "De ce?" engagement (<2%) + quick summary scan (<5s)
  if (signals.declaredMode === 'EXECUTOR') {
    if (signals.whyTapRate > 0.05) fired.push('whyTapRate_high');
    if (signals.avgSummaryDwellMs > 15000) fired.push('summaryDwell_high');
    if (signals.repRangeOverrideRate > 0.30) fired.push('repRangeOverride_high');
  } else if (signals.declaredMode === 'STRATEGIC') {
    if (signals.whyTapRate < 0.02) fired.push('whyTapRate_low');
    if (signals.avgSummaryDwellMs < 5000) fired.push('summaryDwell_low');
    if (signals.repRangeOverrideRate < 0.05) fired.push('repRangeOverride_low');
  }

  return { trigger: fired.length >= 3, fired };
}
