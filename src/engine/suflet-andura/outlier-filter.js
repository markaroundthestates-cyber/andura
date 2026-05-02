// ══ OUTLIER FILTER — Profile-aware ASK Don't IGNORE ═══════════════════════════
// LOCKED V1 per ADR_OUTLIER_FILTER_v1 + EXT-2 Goal Shift calibration window
// (§36.35 + §36.58 LOCKED V1 wording GOAL_SHIFT_CALIBRATION_PLACEHOLDER).
// Rolling window 8 sessions + cooldown 3×8 sessions.

const ROLLING_WINDOW = 8;
const COOLDOWN_SESSIONS = 3 * ROLLING_WINDOW;
const GOAL_SHIFT_CALIBRATION_SESSIONS = 2; // primele 2 sesiuni post-shift = calibration

/**
 * @typedef {Object} SessionRecord
 * @property {string} ex exercise name
 * @property {number} weight kg
 * @property {number} reps
 * @property {number} ts timestamp ms
 * @property {boolean} [postGoalShift] true dacă session este în calibration window post-shift
 */

/**
 * Detect statistical outlier within rolling window 8 sessions.
 * Per §36.35: GOAL_SHIFT_CALIBRATION primele 2 sesiuni post-shift NU outlier-flagged.
 * @param {SessionRecord} candidate
 * @param {SessionRecord[]} window most recent 8 sessions for same exercise
 * @returns {{ isOutlier: boolean, reason: string|null }}
 */
export function detectOutlier(candidate, window) {
  if (candidate.postGoalShift) {
    return { isOutlier: false, reason: 'goal_shift_calibration_window' };
  }
  if (!window || window.length < 4) {
    return { isOutlier: false, reason: 'insufficient_window' };
  }

  const weights = window.map(s => s.weight).sort((a, b) => a - b);
  const median = weights[Math.floor(weights.length / 2)];
  const mad = median - weights[0]; // simplified MAD estimate

  const deviation = Math.abs(candidate.weight - median);
  if (deviation > 3 * mad && mad > 0) {
    return { isOutlier: true, reason: 'weight_3xmad_above_median' };
  }
  return { isOutlier: false, reason: null };
}

/**
 * Reset streak counter on goal shift event (per §36.35).
 * @returns {{ streak: number, calibrationSessionsRemaining: number }}
 */
export function onGoalShift() {
  return {
    streak: 0,
    calibrationSessionsRemaining: GOAL_SHIFT_CALIBRATION_SESSIONS,
  };
}

export const OUTLIER_FILTER_CONFIG = {
  ROLLING_WINDOW,
  COOLDOWN_SESSIONS,
  GOAL_SHIFT_CALIBRATION_SESSIONS,
};
