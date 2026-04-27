// ══ AUTO-AGGRESSION ADAPTER (ADR 018 strangler — Phase 1) ════════════════════
// Pure function. Translates the cluster's generic output (session.warnings[])
// into the legacy session shape produced by coachDirector.applyAAAdjustments
// (session.aaWarning for MED, session.aaBlocked + per-exercise set reduction
// for HIGH). The cluster stays free of AA-specific knowledge — all AA-shape
// mapping lives here.
//
// The adapter intentionally starts from `originalBaseSession` (NOT the cluster
// output) so that cluster-added fields (volumeMultiplier, warnings, etc.) do
// not leak into the legacy-compatible session. This guarantees byte-identical
// shape vs legacy output for the golden-master parity tests.
//
// Decommissioning path: once 100% rollout has soaked safely, delete this
// adapter + the legacy applyAAAdjustments + the feature flag, and let the
// cluster's native shape (warnings[]) flow through to the UI directly.

import { DIMENSION_ID as AA_DIMENSION_ID } from './autoAggressionDimension.js';

/**
 * Translate cluster output to legacy applyAAAdjustments shape.
 *
 * @param {object} clusterSession - Session returned by DecisionCluster.execute().session
 * @param {object} originalBaseSession - The session passed into the cluster (pre-AA)
 * @returns {object} Session with legacy aaWarning/aaBlocked fields (and exercise mutation for HIGH)
 */
export function aaClusterOutputToLegacyShape(clusterSession, originalBaseSession) {
  const warnings = Array.isArray(clusterSession?.warnings) ? clusterSession.warnings : [];
  const aa = warnings.find(w => w?.source === AA_DIMENSION_ID);

  // No AA recommendation fired → return base unchanged (matches legacy
  // `applyAAAdjustments` early-return for tier none/LOW which returns the
  // session reference unchanged).
  if (!aa) return originalBaseSession;

  if (aa.aaTier === 'MED') {
    const next = { ...originalBaseSession };
    next.aaWarning = {
      level: aa.level,
      signals: aa.signals,
      escalating: aa.escalating,
    };
    return next;
  }

  if (aa.aaTier === 'HIGH') {
    const next = { ...originalBaseSession };
    next.aaBlocked = {
      level: aa.level,
      signals: aa.signals,
      escalating: aa.escalating,
      requiresFrictionConfirmation: aa.requiresFrictionConfirmation === true,
    };
    const exercises = Array.isArray(originalBaseSession?.exercises)
      ? originalBaseSession.exercises
      : [];
    next.exercises = exercises.map(e => ({
      ...e,
      aaOriginalSets: e.sets,
      sets: Math.max(2, Math.floor((e.sets || 3) * 0.7)),
      aaReduced: true,
    }));
    return next;
  }

  // Unknown aaTier in payload (defensive) → no mutation.
  return originalBaseSession;
}
