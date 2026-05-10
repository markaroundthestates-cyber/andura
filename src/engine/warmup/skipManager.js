// Cluster E1 + Cluster B4 — Skip management per ADR 026 §9.7.5 + §9.7.2 verbatim.
//
// E1 Source 2 §45.6.5 Instant Skip principle:
//    Default T0 skip → engine auto-calculates ramp-up sets integrated in first
//    exercise (ZERO friction, ZERO ecran suplimentar)
//    T1+ Profile Typing: opt-in expanded warm-up routine
//    In-session toggle: "skip warm-up" button = engine collapse to ramp-up sets only
//
// B4 Source 1 §65.3 verbatim Q65.3 Option A:
//    "Sari peste incalzire" buton vizibil de la prima sesiune
//    NU skip after 3+ logged warm-ups (paternalism violation ADR 025)
//    NU NEVER skip (paternalism violation ADR 025 — "Andura gandeste pentru user")
//
// Anti-paternalism consistent ADR 025 graceful degradation — engine pre-fills
// default, user keeps autonomy. Engine emits skip availability boolean +
// rationale, orchestrator layer applies UI per ADR 030 D2 thin scope.
//
// Pure functions — no side effects.

import {
  CALIBRATION_TIERS,
} from './constants.js';

/**
 * Resolve skip default per tier per Cluster E1 verbatim Source 2 §45.6.5.
 *
 * T0 cold start: instant skip default (ramp-up integrated in first exercise,
 * ZERO ecran suplimentar — anti-friction calibration window)
 * T1+ established: opt-in expanded warm-up routine respected (NU default skip)
 *
 * @param {string} tier
 * @returns {{
 *   t0InstantSkipDefault: boolean,
 *   t1PlusOptInExpanded: boolean,
 *   rationale: string,
 * }}
 */
export function resolveSkipDefaultByTier(tier) {
  if (tier === CALIBRATION_TIERS.T0) {
    return {
      t0InstantSkipDefault:  true,
      t1PlusOptInExpanded:   false,
      rationale:             'tier_t0_instant_skip_default_ramp_up_integrated_e1_45_6_5',
    };
  }
  if (tier === CALIBRATION_TIERS.T1 || tier === CALIBRATION_TIERS.T2) {
    return {
      t0InstantSkipDefault:  false,
      t1PlusOptInExpanded:   true,
      rationale:             `tier_${tier.toLowerCase()}_opt_in_expanded_routine_respected_e1`,
    };
  }
  // Defensive: unknown tier → T0 conservative defaults (cold start safety)
  return {
    t0InstantSkipDefault:  true,
    t1PlusOptInExpanded:   false,
    rationale:             'tier_unknown_default_t0_cold_start_conservative',
  };
}

/**
 * Skip availability check per Cluster B4 verbatim Source 1 §65.3 Option A.
 *
 * Returns true ALWAYS V1 — buton vizibil de la prima sesiune. Anti-paternalism:
 *   NU skip after 3+ logged warm-ups (paternalism violation)
 *   NU NEVER skip (paternalism violation ADR 025)
 *
 * V1 LOCKED true. Future §9.7.6 Reconsideration Trigger 3 candidate post-Beta:
 * progressive nudge "te-am observat sari incalzirea — recomand X" Tier 2 banner
 * (NU Tier 3 modal blocking — preserve autonomy) cand skip rate >50% correlates
 * cu injury rate elevated.
 *
 * @returns {boolean}
 */
export function isSkipAvailable() {
  return true;
}

/**
 * Compute full skip decision per Cluster E1 + B4 integration.
 *
 * @param {Object} input
 * @param {string} input.tier
 * @param {boolean} [input.userOptedSkip]    - Caller passes from in-session toggle ctx
 * @returns {import('./types.js').SkipDecision}
 */
export function computeSkipDecision({ tier, userOptedSkip }) {
  const tierDefaults = resolveSkipDefaultByTier(tier);
  const skipAvailable = isSkipAvailable();
  const opted = userOptedSkip === true;

  let rationale = tierDefaults.rationale;
  if (opted) {
    rationale = `user_opted_skip_in_session_toggle_b4_q65_3_${tierDefaults.rationale}`;
  }

  return {
    skipAvailable,
    userOptedSkip:           opted,
    t0InstantSkipDefault:    tierDefaults.t0InstantSkipDefault,
    t1PlusOptInExpanded:     tierDefaults.t1PlusOptInExpanded,
    rationale,
  };
}
