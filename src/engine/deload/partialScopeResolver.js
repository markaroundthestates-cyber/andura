// Cluster B10 — Muscle-group-specific partial deload Hibrid per ADR 026 §9.8.2
// verbatim.
//
// B10 Source 1 line 16 verbatim:
//   Full-body sistemic trigger (Composite/AA cross-muscular signal) → deload
//   uniform all muscle groups
//   Per-muscle MRV alone trigger (single muscle volume landmarks exceeded per
//   §9.1 Cluster 3 Volume Landmarks Israetel) → partial deload doar muscle
//   group implicated
//
// Pure functions — no side effects.

import {
  TRIGGER_SOURCE,
} from './constants.js';

/**
 * Resolve partial scope per Cluster B10 verbatim Hibrid mechanic.
 *
 * Logic:
 *   1. Composite/AA cross-muscular trigger → null (full-body sistemic)
 *   2. Per-muscle MRV alone single muscle exceeded → muscle group list partial
 *   3. Defensive empty muscle groups + cross-muscular trigger → null fallback safe
 *
 * @param {Object} input
 * @param {string} input.primaryTriggerSource              - From TRIGGER_SOURCE enum
 * @param {ReadonlyArray<string>} [input.affectedMuscleGroups]  - Muscle groups exceeded MRV (per-muscle granular)
 * @param {boolean} [input.mrvExceededAlone]               - True dacă single muscle MRV exceeded (NU cross-muscular)
 * @returns {import('./types.js').PartialScopeDecision}
 */
export function resolvePartialScope({
  primaryTriggerSource,
  affectedMuscleGroups,
  mrvExceededAlone,
}) {
  const groups = Array.isArray(affectedMuscleGroups)
    ? affectedMuscleGroups.filter((g) => typeof g === 'string' && g.length > 0)
    : [];

  // Cross-muscular signal triggers (Composite/AA/Linear) → full-body sistemic
  // by default unless per-muscle MRV alone explicitly flagged
  const isCrossMuscular = primaryTriggerSource === TRIGGER_SOURCE.COMPOSITE
    || primaryTriggerSource === TRIGGER_SOURCE.AA
    || primaryTriggerSource === TRIGGER_SOURCE.LINEAR
    || primaryTriggerSource === TRIGGER_SOURCE.EXTENSION;

  // Per-muscle MRV alone → partial deload doar muscle group implicated
  if (mrvExceededAlone === true && groups.length > 0) {
    return {
      affectedMuscleGroups:  Object.freeze(groups),
      fullBodySystemic:      false,
      perMuscleMrvAlone:     true,
      rationale: `per_muscle_mrv_alone_partial_deload_groups_${groups.join('_')}_b10_9_1_cluster_3_israetel`,
    };
  }

  // Cross-muscular signal → full-body sistemic (null affected groups)
  if (isCrossMuscular) {
    return {
      affectedMuscleGroups:  null,
      fullBodySystemic:      true,
      perMuscleMrvAlone:     false,
      rationale: `cross_muscular_signal_${primaryTriggerSource}_full_body_sistemic_uniform_b10`,
    };
  }

  // Defensive: no trigger source → null full-body fallback safe
  return {
    affectedMuscleGroups:  null,
    fullBodySystemic:      true,
    perMuscleMrvAlone:     false,
    rationale: 'defensive_no_trigger_source_full_body_fallback_safe',
  };
}
