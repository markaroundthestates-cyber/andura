// Cluster A activation gating per ADR 026 §9.6.1 verbatim — strict V1 LOCKED.
//
// Gating logic ordered priority (early-return first match):
//   1. Persona check Q12 §45.3 LOCKED — Marius ONLY (Maria + Gigica reject V1)
//   2. Tier check Q5=D context — T1+ established (T0 calibration window noise high)
//   3. Phase gate Q5=D + Q13=A dual safety — Bulk + Recomp ONLY (Cut DISABLE)
//   4. Injury safety override Q14=A — PainButton signal weak group → auto-disable
//   5. Lagging detection §36.84 Gap #1 — weaknessDetector signal required (no weak → ineligible)
//
// All checks return EligibilityResult cu state + reason for transparency CDL
// audit trail. Anti-paternalism F4 + Layer 5 Medical Safety §42.9 invariant 5
// defense-in-depth (3-layer defense: Q5 phase + Q13 reconciliation + Q14 injury).
//
// Pure functions — no side effects.

import {
  ELIGIBLE_PERSONAS,
  ELIGIBLE_GOAL_PHASES,
  CALIBRATION_TIERS,
  ACTIVATION_STATE,
} from './constants.js';

/**
 * Check persona eligibility per Cluster A Q12 §45.3 LOCKED verbatim.
 *
 * Marius ONLY = eligible specialization (advanced concept anti-friction Maria/
 * Gigica cognitive load early personas).
 *
 * @param {string|null|undefined} persona
 * @returns {boolean}
 */
export function isEligiblePersona(persona) {
  if (typeof persona !== 'string') return false;
  return ELIGIBLE_PERSONAS.includes(persona.toLowerCase());
}

/**
 * Check tier eligibility per Cluster A activation gating Marius Advanced
 * profile-typing tier T1+ established gate (anti-noise T0 calibration window).
 *
 * @param {string|null|undefined} tier                - 'T0' | 'T1' | 'T2'
 * @returns {boolean}
 */
export function isEligibleTier(tier) {
  if (typeof tier !== 'string') return false;
  return tier === CALIBRATION_TIERS.T1 || tier === CALIBRATION_TIERS.T2;
}

/**
 * Check Goal Adaptation phase eligibility per Cluster A Q5=D + Q13=A dual
 * safety gate verbatim. BULK + RECOMP ONLY (Cut DISABLE — deficit + extra
 * volume = recovery risk universal anti-pattern).
 *
 * @param {string|null|undefined} goalPhase            - 'BULK' | 'CUT' | 'RECOMP' | 'MAINTAIN'
 * @returns {boolean}
 */
export function isEligibleGoalPhase(goalPhase) {
  if (typeof goalPhase !== 'string') return false;
  return ELIGIBLE_GOAL_PHASES.includes(goalPhase.toUpperCase());
}

/**
 * Detect injury auto-disable per Cluster D D4 Q14=A verbatim — PainButton
 * signal injury weak group → engine auto-disabled (Safety Override §42.9
 * invariant 5 cross-cutting Layer 5 Medical Safety defense-in-depth).
 *
 * V1 simplification: caller supplies injury signal (active boolean + affected
 * groups list); orchestrator layer wires PainButton telemetry consume per ADR
 * 030 D2 thin scope. NU Tempo direct mutation (anti-cascade preserve §1.10).
 *
 * @param {Object} input
 * @param {boolean} [input.painButtonActive]                          - PainButton signal active
 * @param {ReadonlyArray<string>|Array<string>} [input.affectedGroups] - Muscle groups flagged injury
 * @param {string|null} [input.targetGroup]                            - Specialization candidate target
 * @returns {{disabled: boolean, affectedGroup: string|null, rationale: string}}
 */
export function detectInjuryAutoDisable({
  painButtonActive,
  affectedGroups,
  targetGroup,
}) {
  if (painButtonActive !== true) {
    return {
      disabled:       false,
      affectedGroup:  null,
      rationale:      'pain_button_inactive_no_injury_safety_override',
    };
  }

  const affected = Array.isArray(affectedGroups) ? affectedGroups : [];
  const safeTarget = typeof targetGroup === 'string' ? targetGroup.toLowerCase() : null;

  // Disable cand injury signal active AND target group affected (or any active when target null)
  if (safeTarget && affected.map((g) => String(g).toLowerCase()).includes(safeTarget)) {
    return {
      disabled:      true,
      affectedGroup: safeTarget,
      rationale:     `injury_pain_button_target_group_${safeTarget}_safety_override_q14_a_invariant_5`,
    };
  }

  // Defensive: pain active but no target match — V1 conservative auto-disable
  // pentru safety-first when any pain signal active (anti-injury risk preserve)
  if (affected.length > 0) {
    return {
      disabled:      true,
      affectedGroup: affected[0],
      rationale:     `injury_pain_button_active_groups_${affected.join('_')}_safety_override_q14_a_conservative`,
    };
  }

  return {
    disabled:       false,
    affectedGroup:  null,
    rationale:      'pain_button_active_but_no_specific_groups_no_disable',
  };
}

/**
 * Composite eligibility check — runs all gating checks in priority order
 * early-return on first ineligibility flag. Returns EligibilityResult cu
 * state + reason string for CDL audit trail transparency.
 *
 * Gating order:
 *   1. Persona (Marius) → Q12 §45.3 LOCKED
 *   2. Tier (T1+) → Marius Advanced profile-typing established
 *   3. Goal Phase (Bulk/Recomp) → Q5=D + Q13=A dual safety
 *   4. Injury (PainButton) → Q14=A Safety Override §42.9 invariant 5
 *
 * Lagging detection (Cluster B weaknessDetector signal) handled separately
 * by `weaknessConsumer` module — NU in gating scope (Cluster A pre-detection).
 *
 * @param {Object} input
 * @param {string} [input.persona]
 * @param {string} [input.tier]
 * @param {string} [input.goalPhase]
 * @param {boolean} [input.painButtonActive]
 * @param {ReadonlyArray<string>|Array<string>} [input.painAffectedGroups]
 * @param {string|null} [input.candidateTargetGroup]
 * @param {boolean} [input.userPickedEmphasis] - F emphasis-specialization opt-in:
 *   the user EXPLICITLY picked this muscle-group emphasis (a LOOK preset), so the
 *   persona (Gate 1) + goal-phase (Gate 3) gates are bypassed — anti-paternalism
 *   cuts the other way for an explicit opt-in ("the user asked for it"). The
 *   injury Safety Override (Gate 4) is ALWAYS kept (universal anti-injury), and
 *   the downstream MRV cap on the volume trade is preserved. Default false →
 *   identical to the strict V1 4-gate (only set when
 *   dp_emphasis_specialization_v1 is on).
 * @returns {import('./types.js').EligibilityResult}
 */
export function evaluateEligibility({
  persona,
  tier,
  goalPhase,
  painButtonActive,
  painAffectedGroups,
  candidateTargetGroup,
  userPickedEmphasis,
}) {
  const emphasisBypass = userPickedEmphasis === true;

  // Gate 1: Persona Q12 §45.3 LOCKED — bypassed for an explicit user-picked
  // emphasis (the user asked for it; anti-paternalism F4).
  if (!emphasisBypass && !isEligiblePersona(persona)) {
    return {
      eligible: false,
      state:    ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS,
      reason:   `persona_${persona ?? 'unknown'}_not_marius_q12_45_3_locked_strict_v1`,
    };
  }

  // Gate 2: Tier T1+ established (Marius Advanced profile-typing)
  if (!isEligibleTier(tier)) {
    return {
      eligible: false,
      state:    ACTIVATION_STATE.INELIGIBLE_NOT_ADVANCED,
      reason:   `tier_${tier ?? 'unknown'}_not_t1_plus_calibration_window_noise_anti_overfit`,
    };
  }

  // Gate 3: Goal Phase Q5=D + Q13=A dual safety gate Cut DISABLE — bypassed for an
  // explicit user-picked emphasis (the user asked for it; injury Gate 4 below + the
  // MRV cap remain the universal safety net).
  if (!emphasisBypass && !isEligibleGoalPhase(goalPhase)) {
    return {
      eligible: false,
      state:    ACTIVATION_STATE.INELIGIBLE_PHASE_GATE,
      reason:   `goal_phase_${goalPhase ?? 'unknown'}_not_bulk_or_recomp_q5_d_q13_a_dual_safety_cut_disable_recovery_risk`,
    };
  }

  // Gate 4: Injury PainButton Q14=A Safety Override
  const injury = detectInjuryAutoDisable({
    painButtonActive,
    affectedGroups: painAffectedGroups,
    targetGroup:    candidateTargetGroup,
  });
  if (injury.disabled) {
    return {
      eligible: false,
      state:    ACTIVATION_STATE.INELIGIBLE_INJURY_OVERRIDE,
      reason:   injury.rationale,
    };
  }

  // All gates passed — caller proceeds to Cluster B weaknessDetector + cooldown
  return {
    eligible: true,
    state:    ACTIVATION_STATE.PROPOSAL_PENDING,
    reason:   `gating_passed_marius_advanced_${tier}_${goalPhase}_no_injury_proposal_pending_q15_b`,
  };
}
