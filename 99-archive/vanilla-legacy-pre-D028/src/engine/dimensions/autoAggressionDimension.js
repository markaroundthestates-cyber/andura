// ══ AUTO-AGGRESSION DIMENSION (ADR 018 §6 — Strangler Phase 1) ══════════════
// Wraps existing aggregateAutoAggression detection (called by buildCoachContext)
// and exposes it through the Dimension contract. The legacy
// applyAAAdjustments method in coachDirector remains intact — this dimension
// is gated behind the `aa_via_cluster` feature flag (default 0% rollout) and
// is only consulted when that flag is enabled for the current user.
//
// The dimension itself does NOT mutate sessions. It emits an INJECT_WARNING
// recommendation carrying { aaTier, level, signals, escalating, ...flags } in
// the payload. Translation to the legacy session.aaWarning / session.aaBlocked
// shape (and the HIGH-tier exercise set reduction) is performed by the
// autoAggressionAdapter post-cluster — keeping the cluster generic.

import { createDimensionResult } from '../dimensionContract.js';

export const DIMENSION_ID = 'AUTO_AGGRESSION';

/** Stage 3 ENHANCEMENT priority for MED-tier soft warning (ADR 004 mid-band). */
const PRIORITY_MED = 65;
/** Stage 3 ENHANCEMENT priority for HIGH-tier blocker (ADR 004 critical-band). */
const PRIORITY_HIGH = 95;

/** @param {unknown} signals */
function _coerceSignals(signals) {
  if (!Array.isArray(signals)) return [];
  return signals.filter((s) => typeof s === 'string');
}

/**
 * Pure analyze() per Dimension contract (ADR 018 §2).
 *
 * @param {{ ctx?: { autoAggression?: { tier?: string, signals?: any, escalating?: boolean, amplified?: boolean, amplifierReason?: string } } } | null | undefined} input - DimensionInput
 * @returns {import('../dimensionContract.js').DimensionResult}
 */
export function analyze(input) {
  const aa = input?.ctx?.autoAggression;

  if (!aa || aa.tier === 'none' || aa.tier === 'LOW') {
    return createDimensionResult({
      id: DIMENSION_ID,
      tier: 'none',
      confidence: 'low',
      meta: { aaTier: aa?.tier ?? 'none' },
    });
  }

  const signals = _coerceSignals(aa.signals);
  const escalating = aa.escalating === true;
  const amplified = aa.amplified === true;

  if (aa.tier === 'MED') {
    return createDimensionResult({
      id: DIMENSION_ID,
      tier: 'MED',
      confidence: 'medium',
      signals,
      recommendations: [{
        action: 'inject_warning',
        priority: PRIORITY_MED,
        payload: {
          aaTier: 'MED',
          level: 'soft',
          signals: aa.signals,
          escalating: aa.escalating,
        },
        rationale: 'AA MED tier — soft warning (ADR 013 §6)',
      }],
      meta: { aaTier: 'MED', escalating, amplified },
    });
  }

  if (aa.tier === 'HIGH') {
    return createDimensionResult({
      id: DIMENSION_ID,
      tier: 'HIGH',
      confidence: 'high',
      signals,
      recommendations: [{
        action: 'inject_warning',
        priority: PRIORITY_HIGH,
        payload: {
          aaTier: 'HIGH',
          level: 'hard',
          signals: aa.signals,
          escalating: aa.escalating,
          requiresFrictionConfirmation: true,
        },
        rationale: 'AA HIGH tier — friction-modal blocker (ADR 013 §6)',
      }],
      meta: { aaTier: 'HIGH', escalating, amplified },
    });
  }

  // Unknown tier — treat as none (defensive, never throws).
  return createDimensionResult({
    id: DIMENSION_ID,
    tier: 'none',
    confidence: 'low',
    meta: { aaTier: aa.tier },
  });
}
