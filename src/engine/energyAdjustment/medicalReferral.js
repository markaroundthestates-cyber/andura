// Cluster 5 sub-section — Safety/Compliance per ADR 026 §9.3.5 Q18=D verbatim.
//
// Medical referral copy Gigel test PASS LOCKED V1:
//   "Consulta medicul de familie sau un specialist in medicina sportiva"
//
// Generic "specialist" REJECTED (Daniel push-back mid-flight): ambiguous
// user could interpret as "antrenor specializat" sau "nutritionist" →
// dilueaza Invariant 5 Medical Safety message. Specific pathway = unambiguous.
//
// Trigger condition: Energy Adjustment 3-session sub-Floor cascade post Engine
// Deload escalation + composite low signals → engine surfaces medical referral
// banner (Bugatti craft "AI-ul informeaza, NU impune" SUFLET F2 alignment).
// NU absolute block, user keeps autonomy.
//
// Pain-Aware integration cross-ref Engine Deload Convergence Guard "T2 Unlock":
// Engine Energy NOT proactive trigger Pain-Aware (clean signal monitor only
// USER FRICTION via Pain Button). Decoupling safety/reward via Clean Signal
// rule preserved Invariant 5 Medical Safety.
//
// Pure functions — no side effects.

import { MEDICAL_REFERRAL_COPY } from './constants.js';

/**
 * Get medical referral copy verbatim per Q18=D LOCKED V1.
 *
 * @returns {string}
 */
export function getMedicalReferralCopy() {
  return MEDICAL_REFERRAL_COPY;
}

/**
 * Determine if medical referral banner should surface per Cluster 5 §9.3.5
 * trigger condition verbatim:
 *   "Energy Adjustment 3-session sub-Floor cascade (post Engine Deload
 *    escalation) + composite low signals → engine surfaces medical referral
 *    banner".
 *
 * @param {Object} input
 * @param {boolean} input.deloadEscalationTriggered  - From emitDeloadTrigger.escalationTriggered
 * @param {boolean} [input.compositeLowSignals]      - Orchestrator-level aggregated signal
 * @returns {{shouldSurface: boolean, copy: string|null, reasons: string[]}}
 */
export function evaluateMedicalReferralBanner({ deloadEscalationTriggered, compositeLowSignals }) {
  const reasons = [];
  let shouldSurface = false;

  if (deloadEscalationTriggered === true) {
    reasons.push('deload_escalation_triggered_3_session_sub_floor');
    if (compositeLowSignals === true) {
      reasons.push('composite_low_signals_aggregated');
      shouldSurface = true;
    } else {
      reasons.push('composite_low_signals_absent_no_surface');
    }
  } else {
    reasons.push('no_deload_escalation_no_surface');
  }

  return {
    shouldSurface,
    copy:    shouldSurface ? MEDICAL_REFERRAL_COPY : null,
    reasons,
  };
}

/**
 * Pain-Aware integration check per Cluster 5 §9.3.5 verbatim Convergence Guard
 * "T2 Unlock" Clean Signal rule:
 *   Engine Energy NOT proactive trigger Pain-Aware. Engine Energy adjustments
 *   NU contribuie pain_aware:true flag CDL — flag se seteaza STRICT
 *   user-triggered Pain Button only.
 *
 * Returns false always V1 — Energy NU proactive Pain-Aware trigger.
 * (Function exists pentru explicit anti-recurrence documentation.)
 *
 * @returns {boolean}
 */
export function isPainAwareProactiveTrigger() {
  return false; // V1 LOCKED — Clean Signal rule preserved Invariant 5 Medical Safety
}
