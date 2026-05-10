// Cluster B1+B2+B3+B13 — Multi-trigger orchestrator unification per ADR 026
// §9.8.2 verbatim.
//
// B1 Source 1 line 16 verbatim: Engine Deload = orchestrator unification 3
//    trigger sources:
//    - Composite Signal §36.41 (3/3 simultaneous Performance Drop >15% +
//      Rest Time Multiplier >1.5× + RIR Mismatch ≥2)
//    - AA Detection ADR 013 (autonomic arousal sustained pattern detection)
//    - Linear Block 4+1 existing (calendar Week 4 deload mesocycle classic
//      per §9.1 Periodization Cluster 2.1)
//
// B2 Prioritized hierarchy (Source 1 verbatim, Source 4 line 717):
//    Composite > AA > Linear (priority order — reactive overrides scheduled)
//    Multi-signal consolidation escaleaza severity (NU dilutes — additive)
//
// B3 Engine Deload SSOT deload domain (Source 1 + Source 3 reconciliation):
//    Composite -20% reduction §36.41 hard-disabled cand Engine Deload active
//    (anti math collision double-penalty)
//
// B13 Engine Energy Adjustment trigger preservation §36.82.3 (Source 1 + Source
//    4 line 729 verbatim): Engine Energy sustained low readiness 3+ consecutive
//    triggers Engine Deload evaluation (AA Detection candidate signal pattern).
//
// Pure functions — no side effects.

import {
  DELOAD_STATE,
  TRIGGER_SOURCE,
  PERIODIZATION_PHASE,
  DELOAD_WINDOW_TRIGGER,
  ENERGY_DIRECTION,
  COMPOSITE_THRESHOLDS,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Detect Composite Signal §36.41 trigger per Source 3 verbatim.
 *
 * 3/3 simultaneous threshold required:
 *   Performance Drop >15% AND Rest Time Multiplier >1.5× AND RIR Mismatch ≥2
 * Lifecycle: Idle → Flagged → Cooldown → Resolving (Source 3 §36.41)
 *
 * V1 = check Flagged state predicate based on threshold metrics passed.
 *
 * @param {Object} input
 * @param {number} [input.performanceDropPct]      - Performance Drop % from CDL telemetry
 * @param {number} [input.restTimeMultiplier]      - Rest Time Multiplier from CDL telemetry
 * @param {number} [input.rirMismatch]             - RIR Mismatch absolute count
 * @returns {{triggered: boolean, metricsHit: number, rationale: string}}
 */
export function detectCompositeTrigger({ performanceDropPct, restTimeMultiplier, rirMismatch }) {
  const perfHit = Number(performanceDropPct) > COMPOSITE_THRESHOLDS.performanceDropPct;
  const restHit = Number(restTimeMultiplier) > COMPOSITE_THRESHOLDS.restTimeMultiplier;
  const rirHit = Number(rirMismatch) >= COMPOSITE_THRESHOLDS.rirMismatchMin;

  const metricsHit = (perfHit ? 1 : 0) + (restHit ? 1 : 0) + (rirHit ? 1 : 0);
  const triggered = metricsHit === 3; // 3/3 simultaneous threshold per §36.41

  return {
    triggered,
    metricsHit,
    rationale: triggered
      ? 'composite_signal_36_41_threshold_3_of_3_simultaneous_flagged_state_source_3'
      : `composite_signal_below_threshold_${metricsHit}_of_3_metrics_hit`,
  };
}

/**
 * Detect AA Detection trigger per Source 2 ADR 013 cross-ref + B13 verbatim.
 *
 * AA Detection = autonomic arousal sustained pattern (Volume CUT 30% + RIR ↑ +
 * Intensity ↓ obligatoriu mechanic). V1 = trigger via:
 *   - Energy DOWN sustained 3+ consecutive (B13 cross-ref §36.82.3)
 *   - Pain-Aware sessions ≥2 last 10 (Cluster D4 reference-only via orchestrator)
 *   - Skip penalty AA marker direct (Cluster C4 1× reactive urgent skip)
 *
 * @param {Object} input
 * @param {boolean} [input.aaDetectionActive]            - Direct AA Detection flag from orchestrator
 * @param {boolean} [input.energyDownSustained]          - Energy DOWN sustained 3+ consecutive flag
 * @param {boolean} [input.aaMarkerDirectActive]         - Skip penalty AA marker direct flag
 * @returns {{triggered: boolean, sources: ReadonlyArray<string>, rationale: string}}
 */
export function detectAATrigger({ aaDetectionActive, energyDownSustained, aaMarkerDirectActive }) {
  const sources = [];
  if (aaDetectionActive === true) sources.push('aa_detection_direct_adr_013');
  if (energyDownSustained === true) sources.push('energy_down_sustained_3_consecutive_b13_36_82_3');
  if (aaMarkerDirectActive === true) sources.push('skip_penalty_aa_marker_direct_c4');

  const triggered = sources.length > 0;
  return {
    triggered,
    sources: Object.freeze(sources),
    rationale: triggered
      ? `aa_detection_triggered_sources_${sources.join('_plus_')}`
      : 'aa_detection_no_sources_active',
  };
}

/**
 * Detect Linear Block trigger per §9.1 Periodization Cluster 2.1 cross-ref.
 *
 * Linear trigger = `deload_window.trigger='CALENDAR'` from §9.1 emit field 5
 * (calendar Week 4 deload mesocycle classic).
 *
 * @param {Object} input
 * @param {string|null} [input.periodizationPhase]
 * @param {string|null} [input.deloadWindowTrigger]
 * @returns {{triggered: boolean, rationale: string}}
 */
export function detectLinearTrigger({ periodizationPhase, deloadWindowTrigger }) {
  const isDeloadPhase = periodizationPhase === PERIODIZATION_PHASE.DELOAD;
  const isCalendarTrigger = deloadWindowTrigger === DELOAD_WINDOW_TRIGGER.CALENDAR;
  const triggered = isDeloadPhase && isCalendarTrigger;

  return {
    triggered,
    rationale: triggered
      ? 'linear_block_calendar_week_4_deload_mesocycle_classic_9_1_cluster_2_1'
      : `linear_inactive_phase_${periodizationPhase ?? 'null'}_window_${deloadWindowTrigger ?? 'null'}`,
  };
}

/**
 * Detect EARLY_SAFETY trigger per §9.1 deload_window emit field 5 verbatim.
 *
 * EARLY_SAFETY = Invariant 5 Medical Safety override → REACTIVE_AA state escalate.
 *
 * @param {string|null|undefined} deloadWindowTrigger
 * @returns {{triggered: boolean, rationale: string}}
 */
export function detectEarlySafetyTrigger(deloadWindowTrigger) {
  const triggered = deloadWindowTrigger === DELOAD_WINDOW_TRIGGER.EARLY_SAFETY;
  return {
    triggered,
    rationale: triggered
      ? 'early_safety_periodization_deload_window_invariant_5_medical_safety_escalate'
      : 'no_early_safety_trigger',
  };
}

/**
 * Resolve trigger hierarchy per Cluster B2 priority order verbatim.
 *
 * Composite > AA > Linear (reactive overrides scheduled). Multi-signal
 * consolidation escaleaza severity (NU dilutes — additive). Returns primary
 * source winner + all active sources for severity additive composition.
 *
 * EXTENSION_FLAGGED priority: cand already in reactive deload Week 1 cu Flagged
 * state still active end-of-Week-1 → EXTENSION_FLAGGED takes priority over fresh
 * trigger detection.
 *
 * @param {Object} input
 * @param {{triggered: boolean}} input.composite       - From detectCompositeTrigger()
 * @param {{triggered: boolean}} input.aa              - From detectAATrigger()
 * @param {{triggered: boolean}} input.linear          - From detectLinearTrigger()
 * @param {{triggered: boolean}} input.earlySafety     - From detectEarlySafetyTrigger()
 * @param {boolean} [input.extensionEvaluating]        - True daca currently in Week 1 reactive cu Flagged still active
 * @returns {import('./types.js').TriggerDecision}
 */
export function resolveTriggerHierarchy({ composite, aa, linear, earlySafety, extensionEvaluating }) {
  const sourcesActive = [];
  if (composite?.triggered === true) sourcesActive.push(TRIGGER_SOURCE.COMPOSITE);
  if (aa?.triggered === true) sourcesActive.push(TRIGGER_SOURCE.AA);
  if (linear?.triggered === true) sourcesActive.push(TRIGGER_SOURCE.LINEAR);

  // EARLY_SAFETY override → escalate to REACTIVE_AA state (Invariant 5 Medical Safety)
  if (earlySafety?.triggered === true) {
    return {
      primarySource:  TRIGGER_SOURCE.AA,
      sourcesActive:  Object.freeze([TRIGGER_SOURCE.AA, ...sourcesActive]),
      resolvedState:  DELOAD_STATE.REACTIVE_AA,
      rationale:      'early_safety_periodization_deload_window_escalate_reactive_aa_invariant_5',
    };
  }

  // Extension priority — already in reactive deload + Flagged still active
  if (extensionEvaluating === true) {
    return {
      primarySource:  TRIGGER_SOURCE.EXTENSION,
      sourcesActive:  Object.freeze([TRIGGER_SOURCE.EXTENSION, ...sourcesActive]),
      resolvedState:  DELOAD_STATE.EXTENSION_FLAGGED,
      rationale:      'extension_week_2_flagged_state_still_active_end_of_week_1_b8',
    };
  }

  // Composite > AA > Linear priority order verbatim B2
  if (composite?.triggered === true) {
    return {
      primarySource:  TRIGGER_SOURCE.COMPOSITE,
      sourcesActive:  Object.freeze(sourcesActive),
      resolvedState:  DELOAD_STATE.REACTIVE_COMPOSITE,
      rationale:      `reactive_composite_priority_winner_b2_sources_${sourcesActive.join('_plus_')}`,
    };
  }
  if (aa?.triggered === true) {
    return {
      primarySource:  TRIGGER_SOURCE.AA,
      sourcesActive:  Object.freeze(sourcesActive),
      resolvedState:  DELOAD_STATE.REACTIVE_AA,
      rationale:      `reactive_aa_priority_winner_b2_sources_${sourcesActive.join('_plus_')}`,
    };
  }
  if (linear?.triggered === true) {
    return {
      primarySource:  TRIGGER_SOURCE.LINEAR,
      sourcesActive:  Object.freeze(sourcesActive),
      resolvedState:  DELOAD_STATE.SCHEDULED_LINEAR,
      rationale:      'scheduled_linear_calendar_week_4_b2_priority_lowest_no_reactive_override',
    };
  }

  // No triggers active → IDLE
  return {
    primarySource:  TRIGGER_SOURCE.NONE,
    sourcesActive:  Object.freeze([]),
    resolvedState:  DELOAD_STATE.IDLE,
    rationale:      'no_trigger_active_idle_state_baseline',
  };
}

/**
 * Composite hard-disabled check per Cluster B3 Source 3 verbatim.
 *
 * When Engine Deload active → Composite -20% reduction §36.41 hard-disabled
 * (anti math collision double-penalty).
 *
 * @param {string} resolvedState
 * @returns {boolean}
 */
export function isCompositeHardDisabled(resolvedState) {
  return resolvedState !== DELOAD_STATE.IDLE;
}

/**
 * Detect Energy DOWN sustained 3+ consecutive per Cluster B13 verbatim.
 *
 * Used pentru AA Detection candidate signal (cross-ref §36.82.3 + Source 1
 * line 16 verbatim "Engine #5 sustained low readiness 3+ consecutive triggers
 * Engine #4 evaluation").
 *
 * @param {ReadonlyArray<{energyDirection?: string}>} [recentSessions]
 * @returns {boolean}
 */
export function isEnergyDownSustained(recentSessions) {
  if (!Array.isArray(recentSessions)) return false;
  const trailing = recentSessions.slice(0, SCHEMA_CONSTANTS.energyDownConsecutiveThreshold);
  if (trailing.length < SCHEMA_CONSTANTS.energyDownConsecutiveThreshold) return false;
  return trailing.every((s) => s && s.energyDirection === ENERGY_DIRECTION.DOWN);
}
