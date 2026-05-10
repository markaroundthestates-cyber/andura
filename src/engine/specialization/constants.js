// Engine Specialization V1 constants per ADR 026 §9.6 Cluster A-E verbatim.
//
// Pipeline §42.10 position 6th canonical: Periodization → Goal Adaptation →
// Energy → Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload.
// Engine numbering "Engine #7" in ADR 029 file naming = legacy chat strategic
// spec session ordering ULTIMUL prescriptive engine §36.100 100% milestone,
// NU pipeline canonical position (§9.6 clarifying header).
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.6
// (commit 92a69fd LANDED 2026-05-06 afternoon chat-6 acasa, 28 decisions
// Cluster A-E verbatim aggregation chat strategic 2026-05-05 birou late sources).
//
// Source 3 NU disponibil: ADR 029 = STUB legacy precedent §9.3 Energy ADR 027
// + §9.5 Tempo ADR 028 stub pattern. 2-way parity only Source 1 ↔ Source 2.
//
// **Critical scope §36.84 Gap #1:** Engine Specialization V1 = wiring detector
// → session builder action layer. ZERO new code engine logic detection — reuse
// `src/engine/weaknessDetector.js` orfan existing via import (NU reimplement
// 1RM ratio<0.8 logic).
//
// ZERO fabrication beyond §9.6 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.

/**
 * Calibration tier ids per ADR 009 + Cluster A activation gating Marius
 * Advanced profile-typing tier T1+ established gate (anti-noise T0 calibration
 * window).
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * Persona archetype per ADR 017 demographic prior + Cluster A activation
 * gating Q12 §45.3 LOCKED strict verbatim:
 *   Marius Advanced ONLY = eligible specialization
 *   Maria 65 + Gigica 35 = NU eligible V1 (anti-paternalism, specialization
 *   advanced concept anti-friction cognitive load early personas)
 *
 * @type {Readonly<{MARIA: 'maria', GIGICA: 'gigica', MARIUS: 'marius'}>}
 */
export const PERSONA = Object.freeze({
  MARIA:  'maria',
  GIGICA: 'gigica',
  MARIUS: 'marius',
});

/**
 * Eligible personas V1 strict per Q12 §45.3 LOCKED:
 *   Marius ONLY (Maria + Gigica NU eligible V1).
 * §9.6.6 Reconsideration Trigger 7 candidate post-Beta: Maria/Gigica T2+
 * Advanced sub-classification eligibility (anti-paternalism reduce gating).
 *
 * @type {ReadonlyArray<string>}
 */
export const ELIGIBLE_PERSONAS = Object.freeze([PERSONA.MARIUS]);

/**
 * Goal Adaptation phase enum per §9.2 cross-ref.
 * Cluster A activation gating Q5=D Cut DISABLE + Q13=A consistency dual safety.
 *
 * @type {Readonly<{BULK: 'BULK', CUT: 'CUT', RECOMP: 'RECOMP', MAINTAIN: 'MAINTAIN'}>}
 */
export const GOAL_PHASE = Object.freeze({
  BULK:     'BULK',
  CUT:      'CUT',
  RECOMP:   'RECOMP',
  MAINTAIN: 'MAINTAIN',
});

/**
 * Eligible Goal Adaptation phases V1 strict per Q5=D + Q13=A dual safety gate:
 *   BULK + RECOMP ONLY = eligible specialization
 *   CUT = DISABLE (deficit + extra volume = recovery risk universal anti-pattern)
 *   MAINTAIN = NU eligible V1 (specialization presupune accumulation phase
 *              context, MAINTAIN NU canonical scope)
 *
 * @type {ReadonlyArray<string>}
 */
export const ELIGIBLE_GOAL_PHASES = Object.freeze([
  GOAL_PHASE.BULK,
  GOAL_PHASE.RECOMP,
]);

/**
 * Periodization phase enum per §9.1 cross-ref. Specialization volume/frequency
 * modifier targets ACCUMULATION phases ONLY per Q11=B PARALLEL modifier (NU
 * REPLACE). PEAK + DELOAD phases incompatible (anti-cascade preserve §1.10).
 *
 * @type {Readonly<{ACCUMULATION: 'ACCUMULATION', LOAD: 'LOAD', PEAK: 'PEAK', DELOAD: 'DELOAD'}>}
 */
export const PERIODIZATION_PHASE = Object.freeze({
  ACCUMULATION: 'ACCUMULATION',
  LOAD:         'LOAD',
  PEAK:         'PEAK',
  DELOAD:       'DELOAD',
});

/**
 * Eligible Periodization phases for specialization modifier application per
 * Cluster C5 + Q11=B PARALLEL modifier verbatim:
 *   ACCUMULATION + LOAD = modifier applied (extra volume/frequency target weakness)
 *   PEAK = NU applied (high intensity emphasis incompatible specialization extra volume)
 *   DELOAD = NU applied (Engine #4 standard deload week 4 preserved non-negotiable Q12=A)
 *
 * @type {ReadonlyArray<string>}
 */
export const ELIGIBLE_PERIODIZATION_PHASES = Object.freeze([
  PERIODIZATION_PHASE.ACCUMULATION,
  PERIODIZATION_PHASE.LOAD,
]);

/**
 * Weakness detection threshold per Cluster B1 verbatim Q1=C — 1RM ratio<0.8 vs
 * group average. Cross-ref `src/engine/weaknessDetector.js` orfan reuse §36.84
 * Gap #1 (detector hardcoded 0.8 — constant duplicated here for transparency
 * specialization-side rationale documentation).
 *
 * @type {number}
 */
export const WEAKNESS_THRESHOLD_RATIO = 0.8;

/**
 * Consensus window per Cluster B2 Q2=C verbatim — last-12-sessions window for
 * recent signal anti-noise weekly volatility. Combined cu lifetime aggregate
 * convergent consensus required (anti-flap protection).
 *
 * @type {number}
 */
export const CONSENSUS_WINDOW_SESSIONS = 12;

/**
 * Top-N discipline per Cluster B3 Q3=A verbatim — Top-1 weak group V1 simplicity.
 * Top-N parallel multi-weakness defer v1.5 (§9.6.6 Reconsideration Trigger 5
 * candidate post-Beta).
 *
 * @type {number}
 */
export const TOP_N_DISCIPLINE = 1;

/**
 * Cooldown duration per Cluster B5 Q10=B + B6 Q16=A match Q10 verbatim:
 *   N=12 weeks same group anti-obsession (post-block exit)
 *   12 weeks hard reject anti-nagging (user rejected proposal)
 *
 * @type {number}
 */
export const COOLDOWN_WEEKS = 12;

/**
 * Mesocycle duration per Cluster A Q6=A + C3 Q9=A verbatim:
 *   Fixed 4-week mesocycle match Q10 §45.2 (simplicity V1).
 * §9.6.6 Reconsideration Trigger 3 candidate post-Beta: adaptive early exit
 * non-responders.
 *
 * @type {number}
 */
export const MESOCYCLE_DURATION_WEEKS = 4;

/**
 * Volume reduction percent for non-target muscle groups per Cluster C2 Q8=B
 * verbatim — partial -25% reduction maintenance dose redirect recovery
 * bandwidth toward weakness target.
 *
 * @type {number}
 */
export const VOLUME_REDUCTION_OTHER_GROUPS_PCT = -0.25;

/**
 * Volume modifier target weak group per Cluster C1 Q7=C verbatim — extra sets
 * per week target weak group (V1 default +30%, sub MRV §42.9 invariant 1
 * immutable cap absolute respect).
 *
 * @type {number}
 */
export const VOLUME_MODIFIER_TARGET_PCT = 0.30;

/**
 * Frequency modifier target weak group per Cluster C1 Q7=C verbatim — additional
 * weekly session targeting weak group. V1 default +1 session/week.
 *
 * @type {number}
 */
export const FREQUENCY_MODIFIER_TARGET_SESSIONS = 1;

/**
 * Application mode per Cluster C1 Q7=C — Hibrid Volume + Frequency layered
 * concurrent (NU exclusive choice, combinatorial recovery stimulus signal).
 *
 * @type {Readonly<{HYBRID: 'hybrid', VOLUME_ONLY: 'volume_only', FREQUENCY_ONLY: 'frequency_only'}>}
 */
export const APPLICATION_MODE = Object.freeze({
  HYBRID:          'hybrid',
  VOLUME_ONLY:     'volume_only',
  FREQUENCY_ONLY:  'frequency_only',
});

/**
 * Bugatti craft RO terminology label per Cluster C4 Q17=C verbatim — UI label
 * "Bloc focus [Grupa musculara]" RO native NU "Specialization Block" calque
 * Englez (anti-friction Maria/Gigica accessibility, Marius Advanced cohort RO
 * native preferred).
 *
 * @type {string}
 */
export const SPECIALIZATION_LABEL_RO_PREFIX = 'Bloc focus';

/**
 * Activation state enum per Cluster A1 emit verbatim — 6-field blueprint output:
 *   INELIGIBLE_NOT_MARIUS = persona NU Marius (Maria/Gigica reject Q12)
 *   INELIGIBLE_NOT_ADVANCED = profile-typing tier T0 (calibration window noise high)
 *   INELIGIBLE_PHASE_GATE = Goal phase NU Bulk/Recomp (Cut DISABLE Q5=D)
 *   INELIGIBLE_INJURY_OVERRIDE = PainButton signal injury weak group Q14=A
 *   INELIGIBLE_NO_LAGGING = weaknessDetector signal empty (no weak group identified)
 *   INELIGIBLE_COOLDOWN = within N=12 weeks cooldown (Q10=B + Q16=A)
 *   PROPOSAL_PENDING = engine eligible AND proposal pending user accept/reject Q15=B
 *   ACTIVE = user accepted proposal AND specialization block engaged
 *   COMPLETED_EXIT = 4-week mesocycle exit Q9=A (entering cooldown)
 *
 * @type {Readonly<Object<string, string>>}
 */
export const ACTIVATION_STATE = Object.freeze({
  INELIGIBLE_NOT_MARIUS:        'ineligible_not_marius_persona_q12_locked',
  INELIGIBLE_NOT_ADVANCED:      'ineligible_not_advanced_tier_t0_calibration_window',
  INELIGIBLE_PHASE_GATE:        'ineligible_phase_gate_cut_or_maintain_q5_d_dual_safety',
  INELIGIBLE_INJURY_OVERRIDE:   'ineligible_injury_pain_button_safety_override_q14_a',
  INELIGIBLE_NO_LAGGING:        'ineligible_no_lagging_group_detected_weakness_detector_empty',
  INELIGIBLE_COOLDOWN:          'ineligible_within_cooldown_q10_b_q16_a_anti_obsession',
  PROPOSAL_PENDING:             'proposal_pending_user_accept_reject_q15_b_anti_paternalism',
  ACTIVE:                       'active_specialization_block_engaged',
  COMPLETED_EXIT:               'completed_exit_mesocycle_4_weeks_q9_a_entering_cooldown',
});

/**
 * Schema-level constants — anti-magic-number per ADR 005 vanilla JS.
 *
 * @type {Readonly<{
 *   confidenceLowFloor: number,
 *   confidenceMediumFloor: number,
 * }>}
 */
export const SCHEMA_CONSTANTS = Object.freeze({
  confidenceLowFloor:    1,
  confidenceMediumFloor: 2,
});
