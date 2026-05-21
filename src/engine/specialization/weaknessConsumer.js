// Cluster B Detection Logic + Reconciliation + Proposal per ADR 026 §9.6.2
// verbatim.
//
// **CRITICAL §36.84 Gap #1 + §9.6.5 E4:** Engine Specialization V1 = wiring
// detector → session builder action layer. ZERO new code engine logic detection
// — reuse `src/engine/weaknessDetector.js` orfan existing via import (NU
// reimplement 1RM ratio<0.8 logic).
//
// B1 Hibrid 1RM ratio<0.8 weaknessDetector reuse + visual/photo subjective
//    override (Q1=C SUFLET_ANDURA Daniel pattern dual-source) — primary signal
//    detector quantitative + secondary user-initiated subjective override
//    F4 user agency.
// B2 Consensus last-12-sessions + lifetime aggregate (Q2=C anti-noise volatil)
//    — both signals required convergent (recent + lifetime aligned). Single-
//    window divergence = signal flagged unstable, defer detection.
// B3 Top-1 discipline V1 (Q3=A simplicity — top-N parallel defer v1.5)
// B4 Hibrid reconciliere engine objective + user adjusts both stored CDL
//    Bugatti craft transparency (Q4=C — user agency F4 wins on conflict,
//    engine signal preserved CDL pentru future analytics post-Beta)
// B7 Proposal mechanism Q15=B propose user accept/reject NU auto-activate
//    silent (Marius decision retained, anti-paternalism F4)
//
// Pure functions — no side effects.

import { detectWeakGroups } from '../weaknessDetector.js';
import {
  CONSENSUS_WINDOW_SESSIONS,
  TOP_N_DISCIPLINE,
  WEAKNESS_THRESHOLD_RATIO,
  ELIGIBLE_GROUPS_SPECIALIZATION_BIG11,
  SECONDARY_TAG_WEIGHT_DEFAULT,
} from './constants.js';

/**
 * Consume weaknessDetector signal per Cluster B1 verbatim Q1=C — primary signal
 * 1RM ratio<0.8 vs reference distribution per movement category.
 *
 * Defensive wrapper: detector returns `{weakGroups: string[] sorted weakest first,
 * byGroup, ratio, average1RM}`. V1 Top-1 (Q3=A) extracts first element of
 * sorted weakGroups list (already weakest first per detector).
 *
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} [logs] - Workout logs (caller-provided)
 * @returns {{
 *   topWeakGroup: string|null,
 *   topRatio: number|null,
 *   weakGroupsAll: string[],
 *   ratios: Record<string, number>,
 *   rationale: string,
 * }}
 */
export function consumeWeaknessDetectorSignal(logs) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  if (safeLogs.length === 0) {
    return {
      topWeakGroup:  null,
      topRatio:      null,
      weakGroupsAll: [],
      ratios:        {},
      rationale:     'no_logs_no_detector_signal_evaluation',
    };
  }

  const detection = detectWeakGroups(safeLogs);
  const weak = Array.isArray(detection.weakGroups) ? detection.weakGroups : [];
  const ratios = /** @type {Record<string, number>} */ ((detection.ratio && typeof detection.ratio === 'object') ? detection.ratio : {});

  if (weak.length === 0) {
    return {
      topWeakGroup:  null,
      topRatio:      null,
      weakGroupsAll: [],
      ratios,
      rationale:     'detector_no_weak_groups_above_threshold_0_8_no_lagging_signal',
    };
  }

  // C4.4 Big 11 specialization scope filter per ADR_ENGINE_REFACTOR §3.4 LOCK V1:
  // 8 of 11 eligible — exclude picioare-quads / picioare-hamstrings / gambe
  // (anatomical conflict V1 — compound shared CNS + isolation trivial impact).
  const eligibleGroups = /** @type {string[]} */ (ELIGIBLE_GROUPS_SPECIALIZATION_BIG11);
  const eligibleWeak = weak.filter((g) => eligibleGroups.includes(g));

  if (eligibleWeak.length === 0) {
    return {
      topWeakGroup:  null,
      topRatio:      null,
      weakGroupsAll: [],
      ratios,
      rationale: `detector_signal_excluded_category_${weak[0]}_not_in_eligible_specialization_big11_anatomical_conflict_v1_§9_6_6_trigger_8_post_beta`,
    };
  }

  // Top-1 V1 (Q3=A simplicity — top-N parallel defer v1.5) from eligible scope
  const topGroup = eligibleWeak[0] ?? '';
  if (!topGroup) {
    return {
      topWeakGroup:  null,
      topRatio:      null,
      weakGroupsAll: [],
      ratios,
      rationale:     'detector_no_eligible_top_group',
    };
  }
  const topRatioRaw = ratios[topGroup];
  const topRatio = (typeof topRatioRaw === 'number' && Number.isFinite(topRatioRaw)) ? topRatioRaw : null;

  return {
    topWeakGroup:  topGroup,
    topRatio,
    weakGroupsAll: eligibleWeak.slice(0, TOP_N_DISCIPLINE),
    ratios,
    rationale: `top_1_weak_group_${topGroup}_ratio_${topRatio}_threshold_${WEAKNESS_THRESHOLD_RATIO}_q1_c_q3_a_eligible_big11_filter_applied`,
  };
}

/**
 * Compute weighted muscle group score per exercise per ADR_ENGINE_REFACTOR
 * §3.5 LOCK V1 weighted secondary consume policy — primary 1.0 + secondary
 * 0.3 weight (30% co-engage threshold).
 *
 * Used by Specialization PARALLEL modifier bump policy compatible Bundle
 * 6.0.4.2 RDL/Good Morning posterior chain dual-cluster (spate primary +
 * picioare-hamstrings secondary anatomically defensible compound contribution).
 *
 * Pure function — ADR-026 §9 invariant preserved (no Date.now / Math.random /
 * side effects).
 *
 * @param {Object} exerciseMeta            - EXERCISE_METADATA entry
 * @param {string} exerciseMeta.muscle_target_primary
 * @param {string[]} [exerciseMeta.muscle_target_secondary]
 * @param {string} targetGroup             - Big 11 canonical V1 group ID
 * @returns {number} Weight: 1.0 primary match | 0.3 secondary match | 0 neither
 */
export function computeWeightedGroupScore(exerciseMeta, targetGroup) {
  if (!exerciseMeta || typeof exerciseMeta !== 'object') return 0;
  if (typeof targetGroup !== 'string' || targetGroup.length === 0) return 0;
  if (exerciseMeta.muscle_target_primary === targetGroup) return 1.0;
  const secondary = Array.isArray(exerciseMeta.muscle_target_secondary)
    ? exerciseMeta.muscle_target_secondary
    : [];
  if (secondary.includes(targetGroup)) return SECONDARY_TAG_WEIGHT_DEFAULT;
  return 0;
}

/**
 * Evaluate consensus last-12-sessions + lifetime aggregate per Cluster B2 Q2=C
 * verbatim — anti-noise volatil. Both signals required convergent (recent +
 * lifetime aligned). Single-window divergence = signal flagged unstable.
 *
 * V1 implementation: caller supplies recent (last-12) logs subset + lifetime
 * full logs. Detector run twice; signals compared. Convergent = same top-1.
 *
 * @param {Object} input
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} [input.lifetimeLogs]
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} [input.recentLogs]
 * @returns {{
 *   consensusAligned: boolean,
 *   recentTopGroup: string|null,
 *   lifetimeTopGroup: string|null,
 *   rationale: string,
 * }}
 */
export function evaluateConsensus({ lifetimeLogs, recentLogs }) {
  const lifetime = consumeWeaknessDetectorSignal(lifetimeLogs);
  const recent = consumeWeaknessDetectorSignal(recentLogs);

  // Insufficient signal in either window → consensus NU evaluable
  if (!lifetime.topWeakGroup || !recent.topWeakGroup) {
    return {
      consensusAligned:  false,
      recentTopGroup:    recent.topWeakGroup,
      lifetimeTopGroup:  lifetime.topWeakGroup,
      rationale: `insufficient_signal_recent_${recent.topWeakGroup ?? 'null'}_lifetime_${lifetime.topWeakGroup ?? 'null'}_consensus_not_evaluable`,
    };
  }

  const aligned = recent.topWeakGroup === lifetime.topWeakGroup;
  return {
    consensusAligned:  aligned,
    recentTopGroup:    recent.topWeakGroup,
    lifetimeTopGroup:  lifetime.topWeakGroup,
    rationale: aligned
      ? `consensus_aligned_recent_lifetime_${recent.topWeakGroup}_q2_c_anti_noise_convergent`
      : `consensus_divergent_recent_${recent.topWeakGroup}_vs_lifetime_${lifetime.topWeakGroup}_q2_c_defer_detection_anti_flap`,
  };
}

/**
 * Evaluate Hibrid reconciliation per Cluster B4 Q4=C verbatim — engine
 * objective + user adjusts both stored CDL Bugatti craft transparency. User
 * agency F4 wins on conflict, engine signal preserved CDL pentru future
 * analytics post-Beta data validate engine accuracy vs user preference.
 *
 * @param {Object} input
 * @param {string|null} [input.engineObjective]    - Top-1 weak group from detector
 * @param {string|null} [input.userOverride]        - User-initiated subjective override Q1=C visual/photo
 * @returns {import('./types.js').ReconciliationResult}
 */
export function reconcileWeaknessTarget({ engineObjective, userOverride }) {
  const engine = typeof engineObjective === 'string' && engineObjective.length > 0
    ? engineObjective.toLowerCase()
    : null;
  const user = typeof userOverride === 'string' && userOverride.length > 0
    ? userOverride.toLowerCase()
    : null;

  // No signals — defer detection
  if (!engine && !user) {
    return {
      resolvedGroup:    null,
      engineObjective:  null,
      userAdjustment:   null,
      source:           'engine',
    };
  }

  // User override only — F4 user agency wins
  if (!engine && user) {
    return {
      resolvedGroup:    user,
      engineObjective:  null,
      userAdjustment:   user,
      source:           'user_override',
    };
  }

  // Engine only — no user adjustment
  if (engine && !user) {
    return {
      resolvedGroup:    engine,
      engineObjective:  engine,
      userAdjustment:   null,
      source:           'engine',
    };
  }

  // Both present — aligned or user override wins
  if (engine === user) {
    return {
      resolvedGroup:    engine,
      engineObjective:  engine,
      userAdjustment:   user,
      source:           'aligned',
    };
  }

  // Conflict — user agency F4 wins, engine preserved CDL Bugatti craft transparency
  return {
    resolvedGroup:    user,
    engineObjective:  engine,
    userAdjustment:   user,
    source:           'user_override',
  };
}

/**
 * Build complete weakness signal per Cluster B1+B2+B3+B4 bundled — primary
 * detector signal + consensus check + reconciliation + Top-1 discipline.
 *
 * Top-level orchestration consumed by index.js evaluate(ctx) — combines all
 * Cluster B sub-modules into single coherent signal pentru downstream
 * cooldown check + application strategy.
 *
 * @param {Object} input
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} [input.lifetimeLogs]
 * @param {Array<{ex?: string, w?: number, reps?: number | string}>} [input.recentLogs]
 * @param {string|null} [input.userOverrideGroup]
 * @returns {import('./types.js').WeaknessSignal}
 */
export function buildWeaknessSignal({
  lifetimeLogs,
  recentLogs,
  userOverrideGroup,
}) {
  const detector = consumeWeaknessDetectorSignal(lifetimeLogs);
  const consensus = evaluateConsensus({ lifetimeLogs, recentLogs });
  const reconciled = reconcileWeaknessTarget({
    engineObjective: detector.topWeakGroup,
    userOverride:    userOverrideGroup,
  });

  // Resolved group: user override > engine consensus-aligned > null
  // V1 conservative: if consensus NOT aligned AND no user override → null (defer)
  let targetGroup = null;
  if (reconciled.source === 'user_override') {
    // User override always wins F4 agency
    targetGroup = reconciled.resolvedGroup;
  } else if (consensus.consensusAligned && reconciled.resolvedGroup) {
    targetGroup = reconciled.resolvedGroup;
  }

  return {
    targetGroup,
    ratio:             detector.topRatio,
    consensusAligned:  consensus.consensusAligned,
    rationale: targetGroup
      ? `weakness_target_${targetGroup}_source_${reconciled.source}_consensus_${consensus.consensusAligned}_q1_c_q2_c_q3_a_q4_c`
      : `no_target_resolved_consensus_${consensus.consensusAligned}_engine_${detector.topWeakGroup ?? 'null'}_user_${userOverrideGroup ?? 'null'}_defer_detection`,
  };
}

/**
 * Evaluate proposal mechanism per Cluster B7 Q15=B verbatim — propose user
 * accept/reject NU auto-activate silent (Marius decision retained, anti-
 * paternalism F4).
 *
 * V1 conservative: caller supplies user proposal state (accepted/rejected/
 * pending). Engine surfaces; user owns activation.
 *
 * @param {Object} input
 * @param {boolean|null} [input.userAccepted]      - true=accepted, false=rejected, null/undefined=pending
 * @param {string|null} [input.targetGroup]
 * @returns {{
 *   activationApproved: boolean,
 *   userRejected: boolean,
 *   pending: boolean,
 *   rationale: string,
 * }}
 */
export function evaluateProposal({ userAccepted, targetGroup }) {
  const target = typeof targetGroup === 'string' ? targetGroup : null;

  if (userAccepted === true) {
    return {
      activationApproved: true,
      userRejected:       false,
      pending:            false,
      rationale: `proposal_accepted_user_decision_q15_b_target_${target ?? 'unspecified'}_specialization_engaged`,
    };
  }

  if (userAccepted === false) {
    return {
      activationApproved: false,
      userRejected:       true,
      pending:            false,
      rationale: `proposal_rejected_user_decision_q15_b_q16_a_hard_reject_12_weeks_cooldown_anti_nagging`,
    };
  }

  return {
    activationApproved: false,
    userRejected:       false,
    pending:            true,
    rationale: `proposal_pending_user_accept_reject_q15_b_anti_paternalism_marius_decision_retained_target_${target ?? 'unspecified'}`,
  };
}
