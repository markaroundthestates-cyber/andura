// Cluster B4+B5 — Final_Depth formula + AA-driven mechanic per ADR 026 §9.8.2
// verbatim.
//
// B4 AA-driven mechanic obligatoriu (Source 1 + Source 2 ADR 013 verbatim):
//    Volume CUT 30% obligatoriu + RIR ↑ obligatoriu + Intensity ↓ obligatoriu
//    Daniel push-back fundamental: "volum pastrat moderat" reinforces
//    aggressive pattern → Engine NU pedepseste dorinta munca, REGLEAZA
//    unsustainable pattern.
//
// B5 Final_Depth formula (Source 1 line 16 verbatim):
//    Final_Depth = MAX(Scheduled 45%, Reactive 60%, Behavioral 30%) +
//                  Behavioral_Modifiers
//    Reactive overrides scheduled (60% > 45%) — confirm priority B2 hierarchy
//    Behavioral_Modifiers additive (NU multiplicative — anti-cascade preserve)
//    Multi-signal NU dilutes severity, ADAUGA controls peste physiological depth
//
// B9 Extension depth preserve 60% (Source 1 verbatim):
//    Week 2 reactive deload preserve 60% depth (NU escalate 70%)
//    Atrophy literature limit Schoenfeld/Helms canonical
//
// Pure functions — no side effects.

import {
  DELOAD_STATE,
  GOAL_PHASE,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Compute Final_Depth per Cluster B5 verbatim.
 *
 * Final_Depth = MAX(Scheduled 45%, Reactive 60%, Behavioral 30%) +
 *               Behavioral_Modifiers (additive, capped per behavioralModifiersCapPct).
 *
 * V1 simplification: extension-active state clamps to depthExtensionPreservePct
 * (60%) per Cluster B9 atrophy literature limit (Week 2 NU escalate 70%).
 *
 * @param {Object} input
 * @param {string} input.deloadState                      - DELOAD_STATE enum value
 * @param {ReadonlyArray<string>} [input.sourcesActive]   - All trigger sources active (multi-signal additive)
 * @param {number} [input.behavioralModifiersInputPct]    - Caller-supplied behavioral modifiers (capped)
 * @returns {import('./types.js').DepthDecision}
 */
export function computeFinalDepth({ deloadState, sourcesActive, behavioralModifiersInputPct }) {
  const sources = Array.isArray(sourcesActive) ? sourcesActive : [];

  // Determine which depth tiers are active per state mapping
  const isScheduled = deloadState === DELOAD_STATE.SCHEDULED_LINEAR;
  const isReactive = deloadState === DELOAD_STATE.REACTIVE_COMPOSITE
    || deloadState === DELOAD_STATE.REACTIVE_AA;
  const isExtension = deloadState === DELOAD_STATE.EXTENSION_FLAGGED;
  const isResolving = deloadState === DELOAD_STATE.RESOLVING;

  // Behavioral component active when multi-signal (≥2 trigger sources active)
  // OR explicit non-trivial behavioral modifiers input.
  const isBehavioral = sources.length >= 2;

  // Build candidate depth values per state
  const scheduledPct = isScheduled ? SCHEMA_CONSTANTS.depthScheduledPct : 0;
  const reactivePct = isReactive ? SCHEMA_CONSTANTS.depthReactivePct : 0;
  const behavioralPct = isBehavioral ? SCHEMA_CONSTANTS.depthBehavioralPct : 0;

  // MAX formula (Source 1 verbatim B5)
  let baseDepth = Math.max(scheduledPct, reactivePct, behavioralPct);

  // Resolving state → step-down depth (transition phase post-deload back to baseline)
  if (isResolving) {
    baseDepth = Math.max(0, SCHEMA_CONSTANTS.depthScheduledPct / 2); // half scheduled = ~22.5%
  }

  // Behavioral_Modifiers additive (capped per SCHEMA_CONSTANTS.behavioralModifiersCapPct)
  const requestedModifiers = Number.isFinite(behavioralModifiersInputPct)
    ? Math.max(0, behavioralModifiersInputPct)
    : 0;
  const behavioralModifiersAppliedPct = Math.min(
    requestedModifiers,
    SCHEMA_CONSTANTS.behavioralModifiersCapPct,
  );

  let finalDepthPct = baseDepth + behavioralModifiersAppliedPct;

  // B9 Extension depth preserve 60% atrophy literature limit
  let extensionDepthClamped = false;
  if (isExtension) {
    finalDepthPct = SCHEMA_CONSTANTS.depthExtensionPreservePct;
    extensionDepthClamped = true;
  }

  // Defensive cap final depth ceiling at 100% (logical bound — engine can't cut >100% volume)
  finalDepthPct = Math.min(100, Math.max(0, finalDepthPct));

  let rationale;
  if (deloadState === DELOAD_STATE.IDLE) {
    rationale = 'idle_no_deload_active_no_depth_emit';
  } else if (extensionDepthClamped) {
    rationale = 'extension_depth_preserve_60_atrophy_literature_limit_b9_schoenfeld_helms';
  } else if (isResolving) {
    rationale = 'resolving_step_down_transition_phase_back_to_baseline';
  } else {
    rationale = `final_depth_max_scheduled_${scheduledPct}_reactive_${reactivePct}_behavioral_${behavioralPct}_plus_modifiers_${behavioralModifiersAppliedPct}_b5`;
  }

  return {
    finalDepthPct,
    scheduledPct,
    reactivePct,
    behavioralPct,
    behavioralModifiersAppliedPct,
    extensionDepthClamped,
    rationale,
  };
}

/**
 * Apply Goal Adaptation phase modulation per Cluster D2 verbatim.
 *
 * CUT preserve depth 60% (Marius retention pattern — anti-aggressive deload during deficit)
 * BULK Marius full classical 45% scheduled (recovery week classical per §9.1 Cluster 2.1)
 * MAINTAIN/RECOMP baseline preserved
 *
 * V1 = light coupling — only CUT phase override active when scheduled state.
 *
 * @param {Object} input
 * @param {number} input.baseDepthPct
 * @param {string|null} [input.goalPhase]
 * @param {string} input.deloadState
 * @returns {{adjustedDepthPct: number, rationale: string}}
 */
export function applyGoalPhaseModulation({ baseDepthPct, goalPhase, deloadState }) {
  const phase = typeof goalPhase === 'string' ? goalPhase.toUpperCase() : null;
  const base = Number.isFinite(baseDepthPct) ? baseDepthPct : 0;

  // CUT phase + SCHEDULED_LINEAR → escalate depth to 60% Marius retention pattern
  if (phase === GOAL_PHASE.CUT && deloadState === DELOAD_STATE.SCHEDULED_LINEAR) {
    return {
      adjustedDepthPct: SCHEMA_CONSTANTS.depthExtensionPreservePct, // 60% retention
      rationale: 'cut_phase_scheduled_linear_escalate_60_marius_retention_pattern_d2',
    };
  }

  return {
    adjustedDepthPct: base,
    rationale: phase === GOAL_PHASE.BULK
      ? 'bulk_phase_classical_45_recovery_week_d2_baseline'
      : `goal_phase_${phase ?? 'null'}_baseline_preserved_d2`,
  };
}

/**
 * Resolve intensity modifier per Cluster B4 verbatim AA-driven mechanic.
 *
 * RIR ↑ +1 obligatoriu + Intensity ↓ -12.5% obligatoriu (consistent §9.1
 * Cluster 2.1 deload classic Linear).
 *
 * Daniel push-back fundamental: "volum pastrat moderat" reinforces aggressive
 * pattern → Engine NU pedepseste dorinta munca, REGLEAZA unsustainable pattern.
 * Volume CUT 30% obligatoriu = primary depth lever (nu inclus in intensity_modifier
 * — separat in depth_pct field).
 *
 * @param {string} deloadState
 * @returns {import('./types.js').IntensityModifier}
 */
export function resolveIntensityModifier(deloadState) {
  if (deloadState === DELOAD_STATE.IDLE) {
    return Object.freeze({
      rir_increment:           0,
      intensity_pct_decrement: 0,
    });
  }
  return Object.freeze({
    rir_increment:           SCHEMA_CONSTANTS.rirIncrement,           // +1 obligatoriu
    intensity_pct_decrement: SCHEMA_CONSTANTS.intensityPctDecrement,  // -12.5% obligatoriu
  });
}
