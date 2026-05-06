// Cluster C — Mind-Muscle Connection + Adaptive Frequency per ADR 026 §9.5.3 verbatim.
//
// C5 Mind-muscle tier-aware T0 OFF / T1+ profile-typing (Q5=C)
// C7 Adaptive frequency reduces post-acquisition (Q7=D + Q9=D dual signal)
// C15 Tier-aware depth (Q15=B) — handled în formCues.cueDepthForTier()
// C17 Suppression hard T0/T1 + soft auto-retire T2+ (Q17=C)
//
// Cross-ref ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock"
// — tier resolution via shared utility `src/coach/orchestrator/utilities/convergenceGuard.js`
// (NU duplicate logic — owned by ADR 009 amendment per §9.4.6 reference precedent).
//
// Pure functions — no side effects.

import {
  CALIBRATION_TIERS,
  ADAPTIVE_FREQUENCY,
  SUPPRESSION_MODE,
} from './constants.js';
import { resolveTier as resolveTierShared } from '../../coach/orchestrator/utilities/convergenceGuard.js';

/**
 * Resolve calibration tier from ctx via shared utility per Cluster C5 cross-ref.
 *
 * NU duplicate Convergence Guard logic — reference shared `convergenceGuard.js`
 * stub utility (rule owned by ADR 009 §AMENDMENT 2026-05-05 birou after).
 *
 * V1 stub passthrough behavior — full re-eval pending Q-OPEN-7 resolution per
 * ADR 030 §3 + ADR 009 amendment.
 *
 * @param {Object} [ctx]
 * @returns {import('./types.js').CalibrationTier}
 */
export function resolveTier(ctx) {
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  // Try profileTier from ctx top-level OR userState shape via shared utility
  const direct = typeof safeCtx.profileTier === 'string' ? safeCtx.profileTier : null;
  if (direct) {
    const t = direct.toUpperCase();
    if (t === CALIBRATION_TIERS.T0 || t === '0') return CALIBRATION_TIERS.T0;
    if (t === CALIBRATION_TIERS.T1 || t === '1') return CALIBRATION_TIERS.T1;
    if (t === CALIBRATION_TIERS.T2 || t === '2') return CALIBRATION_TIERS.T2;
  }
  const shared = resolveTierShared({ profileTier: direct });
  if (typeof shared === 'string') {
    const t = shared.toUpperCase();
    if (t === CALIBRATION_TIERS.T0 || t === '0') return CALIBRATION_TIERS.T0;
    if (t === CALIBRATION_TIERS.T1 || t === '1') return CALIBRATION_TIERS.T1;
    if (t === CALIBRATION_TIERS.T2 || t === '2') return CALIBRATION_TIERS.T2;
  }
  return CALIBRATION_TIERS.T0;
}

/**
 * Mind-muscle tier gate per Cluster C5 Q5=C verbatim:
 *   T0 cold start: OFF (calibration window noise high, anti-overfit early signals)
 *   T1+ established: profile-typing-aware activation
 *
 * @param {Object} input
 * @param {import('./types.js').CalibrationTier} input.tier
 * @param {boolean} [input.deloadWeekUnlock]    - Cluster D12 Q12=D override
 * @returns {boolean}
 */
export function isMindMuscleActive({ tier, deloadWeekUnlock }) {
  // Cluster D12 Q12=D: Deload week → mind-muscle unlock (override tier-aware default)
  if (deloadWeekUnlock === true) return true;
  return tier !== CALIBRATION_TIERS.T0;
}

/**
 * Adaptive frequency per Cluster C7 Q7=D + Q9=D dual signal verbatim.
 *
 * Q7=D: cue surface frequency reduces post-acquisition.
 * Q9=D: explicit "știu" user toggle (acquired) + implicit N=10 sessions consecutive
 *       cu form breakdown < threshold.
 *
 * Returns true dacă cue should still surface (NU acquired); false dacă acquired
 * (cue reduces).
 *
 * @param {Object} input
 * @param {boolean} [input.userToggleAcquired]              - Explicit "știu" user toggle Q9 explicit
 * @param {ReadonlyArray<{formBreakdown?: boolean}>} [input.recentSessionsForMovement]
 *   Trailing sessions for this movement (most-recent-first), used for implicit acquisition signal
 * @returns {{shouldSurface: boolean, acquiredVia: string|null}}
 */
export function evaluateAdaptiveFrequency({ userToggleAcquired, recentSessionsForMovement }) {
  // Q9 explicit signal: user toggled "știu"
  if (userToggleAcquired === true) {
    return { shouldSurface: false, acquiredVia: 'user_toggle_explicit_stiu' };
  }

  // Q9 implicit signal: N=10 sessions consecutive cu form breakdown < threshold
  if (Array.isArray(recentSessionsForMovement)
      && recentSessionsForMovement.length >= ADAPTIVE_FREQUENCY.acquisitionImplicitN) {
    const trailingN = recentSessionsForMovement.slice(0, ADAPTIVE_FREQUENCY.acquisitionImplicitN);
    const allBelow = trailingN.every((s) => s && s.formBreakdown !== true);
    if (allBelow) {
      return { shouldSurface: false, acquiredVia: 'implicit_n10_sessions_clean' };
    }
  }

  return { shouldSurface: true, acquiredVia: null };
}

/**
 * Resolve suppression mode per Cluster C17 Q17=C verbatim:
 *   T0/T1 hard suppression = user toggle "știu" Q9 explicit → cue NU surface
 *   T2+ soft auto-retire = N=10 implicit → cue auto-retire (user can re-activate)
 *
 * @param {import('./types.js').CalibrationTier} tier
 * @returns {import('./types.js').SuppressionMode}
 */
export function suppressionModeForTier(tier) {
  if (tier === CALIBRATION_TIERS.T2) return SUPPRESSION_MODE.SOFT_AUTO_RETIRE;
  return SUPPRESSION_MODE.HARD;
}

/**
 * Evaluate full mind-muscle + frequency suppression decision per Cluster C aggregate.
 *
 * Combines C5 tier gate + C7 adaptive frequency + C17 suppression mode.
 *
 * @param {Object} input
 * @param {import('./types.js').CalibrationTier} input.tier
 * @param {boolean} [input.deloadWeekUnlock]
 * @param {boolean} [input.userToggleAcquired]
 * @param {ReadonlyArray<Object>} [input.recentSessionsForMovement]
 * @returns {{
 *   mindMuscleActive: boolean,
 *   cueShouldSurface: boolean,
 *   suppressionMode: import('./types.js').SuppressionMode,
 *   acquiredVia: string|null,
 * }}
 */
export function evaluateMindMuscleSuppression({
  tier,
  deloadWeekUnlock,
  userToggleAcquired,
  recentSessionsForMovement,
}) {
  const mindMuscleActive = isMindMuscleActive({ tier, deloadWeekUnlock });
  const freq = evaluateAdaptiveFrequency({ userToggleAcquired, recentSessionsForMovement });
  const suppressionMode = suppressionModeForTier(tier);
  return {
    mindMuscleActive,
    cueShouldSurface: freq.shouldSurface,
    suppressionMode,
    acquiredVia: freq.acquiredVia,
  };
}
