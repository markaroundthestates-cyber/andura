// ══ CASCADE DEFENSE — Multi-engine arbitration ════════════════════════════════
// LOCKED V1 per ADR_CASCADE_DEFENSE_v1 + EXT-2 Composite Signal Layer D budget ≤50ms.
// Priority order: Safety > Recovery > Progression > Optimization.
// Layer D budget per call ≤50ms (RuleEngine arbitration latency cap).

/**
 * @typedef {Object} EngineRecommendation
 * @property {string} engine engine id (e.g. 'ProactiveEngine', 'StagnationDetector')
 * @property {'safety'|'recovery'|'progression'|'optimization'} layer
 * @property {string} action 'deload' | 'rest_day' | 'progress' | 'maintain' | etc.
 * @property {number} priority numeric weight (higher = stronger signal within layer)
 * @property {string} rationale
 */

/** @type {Record<string, number>} */
const LAYER_PRIORITY = {
  safety:       4,
  recovery:     3,
  progression:  2,
  optimization: 1,
};

/**
 * Arbitrate between conflicting engine recommendations.
 * Returns the winning recommendation + the runner-ups (audit trail).
 * @param {EngineRecommendation[]} recommendations
 * @returns {{ winner: EngineRecommendation | null, runnerUps: EngineRecommendation[] }}
 */
export function arbitrate(recommendations) {
  if (!recommendations || !recommendations.length) return { winner: null, runnerUps: [] };

  const sorted = [...recommendations].sort((a, b) => {
    const layerDiff = (LAYER_PRIORITY[b.layer] ?? 0) - (LAYER_PRIORITY[a.layer] ?? 0);
    if (layerDiff !== 0) return layerDiff;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });

  return { winner: sorted[0], runnerUps: sorted.slice(1) };
}
