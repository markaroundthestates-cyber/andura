// Cluster 3 — Adjustment Dimensions & Bidirectional ±15% per ADR 026 §9.3.3 verbatim.
//
// Q33 §45.5 reuse selective volume + intensity scope.
// Q6=D bidirectional ±15% conservative range corridor magnitude maxim.
// Q7=B asymmetric trigger logic:
//   DOWN -15%: single trigger immediate (anti-burnout protect prima)
//   UP +15%: strict requires N≥3 conditions cumulative AND Periodization phase
//            gate "high_intensity != true" (anti "Sarcastic UP" Marius 5:1
//            sapt 4-5 cascade aggressive Invariant 1 + Invariant 5 violation).
//
// Tier-aware Q13=B: T0=±10% conservative / T1+=±15% full range.
//
// Pure functions — no side effects.

import {
  ADJUSTMENT_DIRECTION,
  ADJUSTMENT_MAGNITUDE,
  UP_GATING_CONDITIONS,
  CALIBRATION_TIERS,
  RECOVERY_RED_FLAG,
} from './constants.js';

/**
 * Resolve calibration tier id from ctx profileTier (case-insensitive).
 * Defensive default 'T0' (cold start conservative) when missing/invalid.
 *
 * @param {{profileTier?: string}} [ctx]
 * @returns {import('./types.js').CalibrationTier}
 */
export function resolveCalibrationTier(ctx) {
  if (!ctx || typeof ctx.profileTier !== 'string') return CALIBRATION_TIERS.T0;
  const t = ctx.profileTier.toUpperCase();
  if (t === CALIBRATION_TIERS.T0 || t === '0') return CALIBRATION_TIERS.T0;
  if (t === CALIBRATION_TIERS.T1 || t === '1') return CALIBRATION_TIERS.T1;
  if (t === CALIBRATION_TIERS.T2 || t === '2') return CALIBRATION_TIERS.T2;
  return CALIBRATION_TIERS.T0;
}

/**
 * Resolve magnitude ceiling per tier-aware Q13=B verbatim.
 * T0 cold start: ±10% conservative anti-overfit early signals.
 * T1, T2 established: ±15% full range calibration validated.
 *
 * @param {import('./types.js').CalibrationTier} tier
 * @returns {number}
 */
export function magnitudeCeilingForTier(tier) {
  if (tier === CALIBRATION_TIERS.T0) return ADJUSTMENT_MAGNITUDE.magnitudeT0;
  return ADJUSTMENT_MAGNITUDE.magnitudeT1Plus;
}

/**
 * Count consecutive emoji-GREEN sessions trailing recentSessions (window
 * boundary: first non-GREEN session breaks streak).
 *
 * Per UP gating Cluster 3 §9.3.3 condition 1: N≥3 sessions consecutive cu
 * emoji GREEN stable.
 *
 * @param {ReadonlyArray<{energyEmoji?: string}>} recentSessions
 * @returns {number}
 */
export function countConsecutiveGreenSessions(recentSessions) {
  if (!Array.isArray(recentSessions)) return 0;
  let count = 0;
  for (const s of recentSessions) {
    if (!s) break;
    const e = typeof s.energyEmoji === 'string' ? s.energyEmoji.toLowerCase() : null;
    if (e === 'green' || e === 'g' || e === '🟢') {
      count += 1;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Check recovery red flags absent in trailing N-session window (default 3).
 * Returns true daca ZERO 'red' energy in window (UP gating condition 2).
 *
 * @param {ReadonlyArray<{energy?: string}>} recentSessions
 * @param {number} [windowSize]
 * @returns {boolean}
 */
export function hasNoRecoveryRedFlags(recentSessions, windowSize = UP_GATING_CONDITIONS.recoveryRedWindow) {
  if (!Array.isArray(recentSessions)) return false; // defensive: insufficient data → NU pass UP gate
  const windowEntries = recentSessions
    .filter((s) => s && typeof s.energy === 'string')
    .slice(0, windowSize);
  if (windowEntries.length < windowSize) return false; // insufficient signal — conservative
  return windowEntries.every((s) => s.energy !== RECOVERY_RED_FLAG);
}

/**
 * Check Periodization phase gate "high_intensity != true" per Q7 4th condition
 * verbatim. UP +15% NU triggers cand Periodization mesocycle phase = PEAK or LOAD+.
 *
 * Anti "Sarcastic UP" Marius 5:1 sapt 4-5 cascade aggressive prevent.
 *
 * @param {string|null|undefined} periodizationPhase
 * @returns {boolean}
 */
export function isHighIntensityPhase(periodizationPhase) {
  if (typeof periodizationPhase !== 'string') return false;
  return UP_GATING_CONDITIONS.forbiddenPhases.includes(periodizationPhase);
}

/**
 * Evaluate UP +15% gating cumulative conditions per Cluster 3 §9.3.3 Q7=B.
 *
 * Returns `{passed, reasons}` — passed = true requires ALL 4 conditions:
 *   1. N≥3 sessions consecutive emoji GREEN stable
 *   2. no recovery red flags trailing window
 *   3. no stagnation markers (passed via input flag — orchestrator-level signal)
 *   4. Periodization phase NOT high_intensity (NU PEAK NU LOAD+)
 *
 * @param {Object} input
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @param {string|null} [input.periodizationPhase]
 * @param {boolean} [input.stagnationDetected]
 * @returns {{passed: boolean, reasons: string[]}}
 */
export function evaluateUpGating({ recentSessions, periodizationPhase, stagnationDetected }) {
  const reasons = [];

  // Condition 1: N≥3 sessions consecutive GREEN
  const greenCount = countConsecutiveGreenSessions(recentSessions);
  if (greenCount < UP_GATING_CONDITIONS.minConsecutiveGreenSessions) {
    reasons.push('up_blocked_insufficient_consecutive_green');
  }

  // Condition 2: no recovery red flags trailing window
  if (!hasNoRecoveryRedFlags(recentSessions)) {
    reasons.push('up_blocked_recovery_red_in_window');
  }

  // Condition 3: no stagnation markers (orchestrator-level signal)
  if (stagnationDetected === true) {
    reasons.push('up_blocked_stagnation_detected');
  }

  // Condition 4: Periodization phase gate "high_intensity != true"
  if (isHighIntensityPhase(periodizationPhase)) {
    reasons.push('up_blocked_periodization_phase_high_intensity');
  }

  const passed = reasons.length === 0;
  if (passed) reasons.push('up_gating_all_conditions_passed');
  return { passed, reasons };
}

/**
 * Compute bidirectional adjustment decision per Cluster 3 §9.3.3 verbatim.
 *
 * Q7=B asymmetric trigger logic:
 *   DOWN: single trigger immediate (categoryRule = DOWN_IMMEDIATE)
 *   UP:   N≥3 + recovery + phase gate cumulative
 *   NONE: YELLOW caution preserve baseline
 *
 * Magnitude tier-aware Q13=B: T0 ±10% / T1+ ±15%.
 *
 * @param {Object} input
 * @param {import('./types.js').EnergyAggregationSignal} input.aggregationSignal
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @param {string|null} [input.periodizationPhase]
 * @param {import('./types.js').CalibrationTier} input.tier
 * @param {boolean} [input.stagnationDetected]
 * @returns {import('./types.js').BidirectionalAdjustmentDecision}
 */
export function computeAdjustmentDirection({
  aggregationSignal,
  recentSessions,
  periodizationPhase,
  tier,
  stagnationDetected,
}) {
  const ceiling = magnitudeCeilingForTier(tier);
  const rule = aggregationSignal && aggregationSignal.categoryRule;

  if (rule === 'DOWN_IMMEDIATE') {
    return {
      direction:       ADJUSTMENT_DIRECTION.DOWN,
      magnitudePct:    -ceiling,
      upGatingPassed:  false,
      gatingReasons:   ['down_immediate_red_emoji'],
    };
  }

  if (rule === 'UP_ELIGIBLE') {
    const gating = evaluateUpGating({
      recentSessions,
      periodizationPhase,
      stagnationDetected,
    });
    if (gating.passed) {
      return {
        direction:       ADJUSTMENT_DIRECTION.UP,
        magnitudePct:    ceiling,
        upGatingPassed:  true,
        gatingReasons:   gating.reasons,
      };
    }
    return {
      direction:       ADJUSTMENT_DIRECTION.NONE,
      magnitudePct:    0,
      upGatingPassed:  false,
      gatingReasons:   gating.reasons,
    };
  }

  // NONE — YELLOW or null emoji
  return {
    direction:       ADJUSTMENT_DIRECTION.NONE,
    magnitudePct:    0,
    upGatingPassed:  false,
    gatingReasons:   ['none_baseline_preserved'],
  };
}
