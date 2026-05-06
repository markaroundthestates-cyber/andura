// Cluster B6+B7+B8 — Adaptive duration + Hard Reset Linear + Extension per
// ADR 026 §9.8.2 verbatim.
//
// B6 Adaptive duration (Source 1 line 16 verbatim):
//    Scheduled fix: 1 săpt (calendar Linear Block Week 4)
//    Reactive adaptive: 1-2 săpt cu Flagged-only state qualifier (Composite/AA trigger)
//
// B7 Reactive deload Hard Reset Linear Block counter (Source 1 line 16 verbatim):
//    Week N reactive deload triggered → Week 1 NEW cycle post-deload
//    Anti back-to-back scheduled Week 5 (Reactive Week 4 → Calendar Week 5 =
//    double deload exploitation prevention)
//
// B8 Extension week 2 Flagged-only (Source 1 line 16 verbatim):
//    Reactive deload extended la 2 săpt DOAR dacă Flagged state still active
//    end-of-Week-1
//    NU Cooldown / NU Resolving state extension (anti false-positive deload prelungit)
//
// Pure functions — no side effects.

import {
  DELOAD_STATE,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Compute duration per Cluster B6 verbatim.
 *
 * Scheduled fix: 1 săpt (calendar Linear Block Week 4)
 * Reactive adaptive: 1-2 săpt cu Flagged-only state qualifier
 * Extension flagged: total = 2 săpt (Week 1 reactive + Week 2 extension)
 * Resolving / IDLE: 0 săpt
 *
 * @param {Object} input
 * @param {string} input.deloadState
 * @param {boolean} [input.flaggedStillActive]   - True dacă Flagged state still active end-of-Week-1
 * @returns {import('./types.js').DurationDecision}
 */
export function computeDuration({ deloadState, flaggedStillActive }) {
  let durationWeeks;
  let extensionEvaluated = false;
  let extensionGranted = false;
  let hardResetLinearApplied = false;

  if (deloadState === DELOAD_STATE.IDLE || deloadState === DELOAD_STATE.RESOLVING) {
    durationWeeks = 0;
  } else if (deloadState === DELOAD_STATE.SCHEDULED_LINEAR) {
    durationWeeks = SCHEMA_CONSTANTS.durationScheduledWeeks; // 1 săpt fix
  } else if (deloadState === DELOAD_STATE.REACTIVE_COMPOSITE
             || deloadState === DELOAD_STATE.REACTIVE_AA) {
    durationWeeks = SCHEMA_CONSTANTS.durationReactiveMinWeeks; // 1 săpt initial reactive
    extensionEvaluated = true; // extension considered end-of-Week-1
    hardResetLinearApplied = true; // B7 reactive triggered → Hard Reset Linear post-deload
  } else if (deloadState === DELOAD_STATE.EXTENSION_FLAGGED) {
    durationWeeks = SCHEMA_CONSTANTS.durationReactiveMaxWeeks; // 2 săpt total (Week 1 + Week 2)
    extensionEvaluated = true;
    extensionGranted = flaggedStillActive === true;
    hardResetLinearApplied = true;
  } else {
    durationWeeks = SCHEMA_CONSTANTS.durationScheduledWeeks; // defensive fallback
  }

  let rationale;
  if (deloadState === DELOAD_STATE.IDLE) {
    rationale = 'idle_no_duration_emit';
  } else if (deloadState === DELOAD_STATE.RESOLVING) {
    rationale = 'resolving_transition_phase_no_active_duration';
  } else if (deloadState === DELOAD_STATE.SCHEDULED_LINEAR) {
    rationale = 'scheduled_fix_1_week_calendar_linear_block_b6';
  } else if (deloadState === DELOAD_STATE.EXTENSION_FLAGGED) {
    rationale = `extension_week_2_flagged_${flaggedStillActive ? 'still_active' : 'NOT_active_anti_false_positive'}_b8_b9_60_atrophy_limit`;
  } else {
    rationale = 'reactive_adaptive_1_week_initial_extension_evaluated_end_of_week_1_b6_b8';
  }

  return {
    durationWeeks,
    extensionEvaluated,
    extensionGranted,
    hardResetLinearApplied,
    rationale,
  };
}

/**
 * Evaluate extension Week 2 per Cluster B8 verbatim.
 *
 * Reactive deload extended la 2 săpt DOAR dacă Flagged state still active
 * end-of-Week-1. NU Cooldown / NU Resolving state extension (anti false-positive
 * deload prelungit).
 *
 * @param {Object} input
 * @param {number} [input.weekActiveCount]              - Current week count în deload (1 = Week 1, 2 = Week 2)
 * @param {boolean} [input.flaggedStillActive]          - End-of-Week-1 evaluation result
 * @param {boolean} [input.cooldownStateActive]         - True if Composite Signal lifecycle Cooldown
 * @param {boolean} [input.resolvingStateActive]        - True if Composite Signal lifecycle Resolving
 * @returns {{
 *   extensionGranted: boolean,
 *   reason: string,
 * }}
 */
export function evaluateExtension({
  weekActiveCount,
  flaggedStillActive,
  cooldownStateActive,
  resolvingStateActive,
}) {
  // Only evaluate at end-of-Week-1 boundary
  const week = Number(weekActiveCount);
  if (!Number.isFinite(week) || week !== 1) {
    return {
      extensionGranted: false,
      reason: 'extension_evaluation_only_at_end_of_week_1_boundary',
    };
  }

  // Cooldown state → NO extension (anti false-positive prelungit B8)
  if (cooldownStateActive === true) {
    return {
      extensionGranted: false,
      reason: 'cooldown_state_active_NO_extension_b8_anti_false_positive',
    };
  }

  // Resolving state → NO extension (anti false-positive prelungit B8)
  if (resolvingStateActive === true) {
    return {
      extensionGranted: false,
      reason: 'resolving_state_active_NO_extension_b8_anti_false_positive',
    };
  }

  // Flagged state still active → extension granted
  if (flaggedStillActive === true) {
    return {
      extensionGranted: true,
      reason: 'flagged_state_still_active_end_of_week_1_extension_granted_b8',
    };
  }

  return {
    extensionGranted: false,
    reason: 'flagged_state_NOT_active_end_of_week_1_no_extension_b8',
  };
}

/**
 * Clamp extension depth per Cluster B9 verbatim.
 *
 * Week 2 reactive deload preserve 60% depth (NU escalate 70%). Atrophy
 * literature limit Schoenfeld/Helms canonical.
 *
 * @param {number} requestedDepthPct
 * @returns {{depthPct: number, clamped: boolean, rationale: string}}
 */
export function clampExtensionDepth(requestedDepthPct) {
  const requested = Number(requestedDepthPct);
  const limit = SCHEMA_CONSTANTS.depthExtensionPreservePct;

  if (!Number.isFinite(requested) || requested <= limit) {
    return {
      depthPct:  Number.isFinite(requested) ? requested : limit,
      clamped:   false,
      rationale: 'extension_depth_within_60_atrophy_limit_b9',
    };
  }

  return {
    depthPct:  limit,
    clamped:   true,
    rationale: `extension_depth_clamped_${requested}_to_60_atrophy_literature_limit_schoenfeld_helms_b9`,
  };
}

/**
 * Apply Hard Reset Linear Block counter per Cluster B7 verbatim.
 *
 * Week N reactive deload triggered → Week 1 NEW cycle post-deload (anti
 * back-to-back scheduled Week 5 exploitation prevention).
 *
 * @param {Object} input
 * @param {boolean} [input.reactiveTriggered]
 * @param {number} [input.currentMesoWeek]
 * @returns {{
 *   hardResetApplied: boolean,
 *   newMesoWeek: number,
 *   rationale: string,
 * }}
 */
export function applyHardResetLinear({ reactiveTriggered, currentMesoWeek }) {
  if (reactiveTriggered !== true) {
    const week = Number.isFinite(currentMesoWeek) ? currentMesoWeek : 1;
    return {
      hardResetApplied: false,
      newMesoWeek:      week,
      rationale:        'no_reactive_trigger_no_hard_reset',
    };
  }

  // Reactive trigger → Hard Reset Linear Block counter post-deload
  return {
    hardResetApplied: true,
    newMesoWeek:      1, // Week 1 NEW cycle post-deload
    rationale:        'reactive_triggered_hard_reset_linear_block_week_1_new_cycle_anti_back_to_back_week_5_b7',
  };
}

/**
 * Anti-abuse extension cap check per §9.1 Cluster 2.3 cross-ref + B14 Marius
 * 5:1 dual-signal extension max 2 consecutive verbatim.
 *
 * @param {number} consecutiveExtensions
 * @returns {{allowed: boolean, rationale: string}}
 */
export function isExtensionAllowedByCap(consecutiveExtensions) {
  const n = Number(consecutiveExtensions);
  if (!Number.isFinite(n)) {
    return {
      allowed:   true,
      rationale: 'unknown_count_defensive_assume_allowed',
    };
  }

  const allowed = n < SCHEMA_CONSTANTS.maxConsecutiveExtensions;
  return {
    allowed,
    rationale: allowed
      ? `extension_allowed_${n}_below_max_${SCHEMA_CONSTANTS.maxConsecutiveExtensions}_anti_abuse_b14_9_1_2_3`
      : `extension_BLOCKED_${n}_at_or_above_max_${SCHEMA_CONSTANTS.maxConsecutiveExtensions}_anti_abuse_marius_5_1`,
  };
}
