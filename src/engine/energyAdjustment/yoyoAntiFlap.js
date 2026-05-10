// Cluster 4 sub-section — Yo-yo Anti-Flap per ADR 026 §9.3.4 Q14=D verbatim.
//
// 3-session rolling window V1 only:
//   daca adjustment direction flipped UP→DOWN→UP in 3 sesiuni consecutive →
//   engine SUPPRESSES 3rd flip, holds current direction, logs signal
//   'yoyo_anti_flap_suppressed'.
//
// Sprinter/Marathon profile-typing modulators DEFERRED v1.5+ post-Beta data
// real signal validation (Q14 deferred).
//
// Cross-ref [[ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction
// §50.4 D1 + §EXT-2 — discipline foundation Yo-yo anti-flap consistent
// ecosystem.
//
// Pure functions — no side effects.

import { ADJUSTMENT_DIRECTION, YOYO_ANTI_FLAP } from './constants.js';

/**
 * Detect yo-yo flap pattern in 3-session rolling window per Q14=D verbatim.
 *
 * Pattern: UP→DOWN→UP (or DOWN→UP→DOWN — symmetric) in trailing window.
 * V1 windowSize = 3 (LOCKED). recentDirections array ordered most-recent-first
 * (consistent CDL convention recentSessions descending).
 *
 * @param {ReadonlyArray<import('./types.js').AdjustmentDirection>} recentDirections
 * @param {number} [windowSize]
 * @returns {{flapDetected: boolean, pattern: string|null}}
 */
export function detectFlapPattern(recentDirections, windowSize = YOYO_ANTI_FLAP.windowSize) {
  if (!Array.isArray(recentDirections)) return { flapDetected: false, pattern: null };
  if (recentDirections.length < windowSize - 1) {
    // Need windowSize - 1 history to detect 3rd-flip incoming
    return { flapDetected: false, pattern: null };
  }
  const window = recentDirections.slice(0, windowSize - 1);
  // Detect alternating pattern in window (length 2): UP→DOWN or DOWN→UP
  const a = window[0];
  const b = window[1];
  if (a === ADJUSTMENT_DIRECTION.UP && b === ADJUSTMENT_DIRECTION.DOWN) {
    return { flapDetected: true, pattern: 'UP_DOWN' };
  }
  if (a === ADJUSTMENT_DIRECTION.DOWN && b === ADJUSTMENT_DIRECTION.UP) {
    return { flapDetected: true, pattern: 'DOWN_UP' };
  }
  return { flapDetected: false, pattern: null };
}

/**
 * Apply yo-yo anti-flap suppression to incoming adjustment direction per
 * Q14=D V1 only. Suppresses 3rd flip, holds current (preceding) direction.
 *
 * Examples:
 *   recent: [DOWN, UP] + incoming UP   → flap UP_DOWN_UP → suppress, hold DOWN
 *   recent: [UP, DOWN] + incoming DOWN → flap DOWN_UP_DOWN → suppress, hold UP
 *   recent: [UP, UP] + incoming DOWN   → no flap (no alternation in window)
 *
 * Sprinter/Marathon profile-typing modulators V1 deferred — return null when
 * sprinterMarathonModulatorsActive flag set (V1 always false LOCKED).
 *
 * @param {Object} input
 * @param {import('./types.js').AdjustmentDirection} input.incomingDirection
 * @param {ReadonlyArray<import('./types.js').AdjustmentDirection>} [input.recentDirections]
 * @returns {import('./types.js').YoyoFlapState}
 */
export function applyYoyoSuppression({ incomingDirection, recentDirections }) {
  // V1 stub: Sprinter/Marathon profile-typing modulators DEFERRED post-Beta
  if (YOYO_ANTI_FLAP.sprinterMarathonModulatorsActive === true) {
    // V1.5+ candidate: profile-typing-aware anti-flap thresholds — STUB
    return {
      flapDetected:  false,
      suppressed:    false,
      heldDirection: incomingDirection,
    };
  }

  const detection = detectFlapPattern(recentDirections);
  if (!detection.flapDetected) {
    return {
      flapDetected:  false,
      suppressed:    false,
      heldDirection: incomingDirection,
    };
  }

  // Check 3rd flip would extend alternation: incoming flips again.
  //
  // Pattern naming convention: a=window[0]=most recent, b=window[1]=prior.
  // Pattern 'UP_DOWN' ⟺ a=UP, b=DOWN. Chronologically: DOWN→UP.
  // Pattern 'DOWN_UP' ⟺ a=DOWN, b=UP. Chronologically: UP→DOWN.
  //
  // True 3-session flap = incoming continues alternation (chronological view):
  //   pattern UP_DOWN (chrono DOWN→UP) + incoming DOWN → DOWN→UP→DOWN ✓ flap
  //   pattern DOWN_UP (chrono UP→DOWN) + incoming UP   → UP→DOWN→UP   ✓ flap
  const lastDir = (recentDirections && recentDirections[0]) || null;
  const wouldFlapAgain = (
    detection.pattern === 'UP_DOWN' && incomingDirection === ADJUSTMENT_DIRECTION.DOWN
  ) || (
    detection.pattern === 'DOWN_UP' && incomingDirection === ADJUSTMENT_DIRECTION.UP
  );

  if (wouldFlapAgain) {
    return {
      flapDetected:  true,
      suppressed:    true,
      heldDirection: lastDir, // hold current (preceding) direction
    };
  }

  // Pattern detected but incoming NU extends alternation — no suppression needed
  return {
    flapDetected:  true,
    suppressed:    false,
    heldDirection: incomingDirection,
  };
}

/**
 * V1.5+ stub: Sprinter/Marathon profile-typing modulators per Q14 deferred.
 *
 * Returns null V1 (deferred post-Beta data real signal validation). Future
 * implementation: Sprinter persona = aggressive flips OK / Marathon = strict
 * 3-session lock + magnitude per profile (Sprinter ±15% / Marathon ±10% rolling).
 *
 * @param {string} _profileType - 'sprinter' | 'marathon' | null
 * @returns {null}
 */
export function getProfileTypingModulator(_profileType) {
  return null; // V1 deferred
}
