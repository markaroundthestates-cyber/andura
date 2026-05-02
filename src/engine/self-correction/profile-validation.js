// ══ SELF-CORRECTION §36.34 — Profile Validation Layer ═════════════════════════
// LOCKED V1 per §36.34 + ADR_MODE_DETECTION_UI EXT-4 (rolling 8 sessions + cooldown 3×8).
// Trigger PROMPT_PROFILE_VALIDATION_PLACEHOLDER (§36.58 LOCKED V1 wording).
// Cross-ref: Bias Detection (suflet-andura/bias-detection.js) feeds 3/3 simultaneous threshold.

import { detectBiasDrift } from '../suflet-andura/bias-detection.js';

const ROLLING_WINDOW_SESSIONS = 8;
const COOLDOWN_AFTER_REFUSAL_SESSIONS = 24; // 3 × 8 audit cycles per §36.34 EXT-2

/**
 * @typedef {Object} ProfileValidationResult
 * @property {boolean} shouldPrompt
 * @property {string|null} placeholderId
 * @property {string|null} reason
 */

/**
 * Decide whether to surface PROMPT_PROFILE_VALIDATION_PLACEHOLDER.
 * Uses Bias Detection 3/3 simultaneous threshold + cooldown logic.
 *
 * @param {{
 *   biasSignals: import('../suflet-andura/bias-detection.js').BiasSignals,
 *   sessionsSinceLastRefusal: number | null,
 *   sessionCount: number
 * }} ctx
 * @returns {ProfileValidationResult}
 */
export function shouldShowProfileValidation(ctx) {
  // Need rolling window of at least 8 sessions
  if (ctx.sessionCount < ROLLING_WINDOW_SESSIONS) {
    return { shouldPrompt: false, placeholderId: null, reason: 'window_not_full' };
  }

  // Cooldown: don't re-prompt within 24 sessions of last refusal
  if (ctx.sessionsSinceLastRefusal !== null && ctx.sessionsSinceLastRefusal < COOLDOWN_AFTER_REFUSAL_SESSIONS) {
    return { shouldPrompt: false, placeholderId: null, reason: 'cooldown_active' };
  }

  const drift = detectBiasDrift(ctx.biasSignals);
  if (!drift.trigger) {
    return { shouldPrompt: false, placeholderId: null, reason: 'no_drift_detected' };
  }

  return {
    shouldPrompt: true,
    placeholderId: 'profile_validation_drift_prompt',
    reason: 'bias_drift_3of3',
  };
}

export const PROFILE_VALIDATION_CONFIG = {
  ROLLING_WINDOW_SESSIONS,
  COOLDOWN_AFTER_REFUSAL_SESSIONS,
};
