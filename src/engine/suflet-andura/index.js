// ══ SUFLET ANDURA — Public API barrel ═════════════════════════════════════════
// Cluster §36.16-§36.26 + ADR_RIR_MATRIX + ADR_MODE_DETECTION_UI +
// ADR_BIAS_DETECTION_OBSERVABLE + ADR_OUTLIER_FILTER + ADR_CASCADE_DEFENSE.

export { RIR_MATRIX, rirToIntensity, getTargetRirRange } from './rir-matrix.js';
export { MODES, isValidMode, getDefaultMode } from './modes-ui.js';
export { detectBiasDrift } from './bias-detection.js';
export { TIER_LEVELS, detectTier, isFeatureEnabledForTier } from './tier-progression.js';
export { arbitrate as cascadeArbitrate } from './cascade-defense.js';
export { detectOutlier, onGoalShift, OUTLIER_FILTER_CONFIG } from './outlier-filter.js';
