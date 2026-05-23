// Energy Adjustment Engine #3 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7
// RESOLVED V1 2026-05-08. Faza 3 STRANGLER batch 3 LANDED 2026-05-08.
//
// Pipeline §42.10 sequential — Energy Adjustment = 3rd engine post Engine #1
// Periodization (batch 1 commit `de4222b`) + Engine #2 Goal Adaptation (batch 2
// commit `905946c`). **Second downstream consumer** Constraint Object propagation
// (post Goal Adaptation first downstream).
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `energyAdjustment`.
// D2 Thin Adapter Scope: pure shape mapping `engineContext → engineInput`.
//   **D2 shape mapping concrete (identical pattern batch 2 Goal Adaptation):**
//   orchestrator slot `meta.constraintObject` → engine-specific input
//   `meta.periodizationConstraint` (per ADR 026 §9.3 Cluster 5 Hook 1 read-only
//   convention in engine source `src/engine/energyAdjustment/index.js:99`).
//   Adapter does the rename — engine purity ADR 018 §2 preserved.
// D3 Context Object Pre-Built Input: orchestrator builds engineContext once;
//   adapter consumes ready-data including upstream Constraint Object.
// D4 Result Type Output Contract: `{ ok, output | error }` never throws.
// D5 Cross-Cutting Concerns Orchestrator-Level: telemetry sub-spans + budget.
//
// **`forward_constraint_object` Hook 4 propagation per ADR 026 §9.3.1 #5:**
// Engine emits `meta.forward_constraint_object` (frozen pass-through of upstream
// Periodization Constraint Object via `forwardConstraintObject(periodizationConstraint)`
// per anti-cascade safeguard ADR_CASCADE_DEFENSE_v1 §EXT-2). Adapter surfaces
// it as `output.constraintObject` so orchestrator `runPipeline` propagates the
// frozen reference to downstream engines (Bayesian Nutrition #4, Tempo #5,
// Specialization #6, Warm-up #7, Deload #8 — toate consume Floor/Ceiling).
//
// **Missing Constraint Object handling per ADR 030 §3.6 RESOLVED V1 taxonomy
// (identical pattern batch 2 Goal Adaptation):** when
// `engineContext.meta.constraintObject == null/undefined` (Periodization
// adapter NU ran upstream OR ran cu hard severity halt), Energy Adjustment
// adapter returns INVALID_INPUT 'hard' severity (contract violation —
// downstream cannot trust engine output without upstream constraint baseline).
// Pattern fail-safe Bugatti craft = halt-strict, NU silent compute on
// missing upstream constraint per Anti-Cascade Silent.
//
// **Engine NEVER throws** per spec (`evaluate(ctx)` total function), dar D4
// violation insurance preserved cu try/catch ENGINE_THREW pattern (per ADR
// 030 §3.6 ENGINE_THREW 'hard' severity halt-strict default).
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.3 + §1.10
//      03-decisions/_FROZEN/027-engine-energy-adjustment.md SPEC REFERENCE redirect §9.3
//      src/engine/energyAdjustment/index.js (engine V1 LANDED commit `69ec9ce`)
//      src/coach/orchestrator/adapters/goalAdaptationAdapter.js (batch 2 precedent `905946c`)
//      src/coach/orchestrator/adapters/periodizationAdapter.js (batch 1 precedent `de4222b`)

import { ok, err } from '../result.js';
import { evaluate as evaluateEnergyAdjustment, ENGINE_ID } from '../../../engine/energyAdjustment/index.js';
import { captureException } from '../../../util/sentry.js';

/**
 * Energy Adjustment adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * D2 Shape mapping concrete: orchestrator-side `meta.constraintObject` slot
 * propagated by Periodization adapter is renamed to engine-side
 * `meta.periodizationConstraint` for `evaluate(ctx)` consumption (engine reads
 * via field name `periodizationConstraint` per ADR 026 §9.3 + engine source
 * line 99). Forward Constraint Object surface from `engineResult.meta.forward_constraint_object`
 * → `output.constraintObject` pentru downstream propagation by orchestrator.
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const energyAdjustmentAdapter = Object.freeze({
  id: ENGINE_ID, // 'energyAdjustment' per src/engine/energyAdjustment/index.js

  /**
   * Invoke the Energy Adjustment engine for the given EngineContext.
   *
   * Validates upstream Constraint Object presence (ADR 026 §1.10 sequential
   * mandate) — missing = INVALID_INPUT 'hard' severity halt per §3.6 fail-safe.
   *
   * @param {import('../types.js').EngineContext} ctx
   * @returns {Promise<import('../types.js').AdapterResult>}
   */
  async invoke(ctx) {
    // D4 contract surface: validate input shape minimally.
    if (ctx !== undefined && (ctx === null || typeof ctx !== 'object')) {
      return err({
        code: 'INVALID_INPUT',
        message: 'energyAdjustmentAdapter.invoke expected EngineContext object',
        severity: 'hard',
      });
    }

    // **Constraint Object prerequisite check per ADR 030 §3.6 + ADR 026 §1.10:**
    // Energy Adjustment requires upstream Periodization Constraint Object to
    // read intensity corridor (Floor/Ceiling) for asymmetric ±15% session-level
    // adjustment per §9.3.3 Cluster 3. Missing = halt-strict.
    const upstreamCO = ctx?.meta?.constraintObject;
    if (!upstreamCO || typeof upstreamCO !== 'object') {
      return err({
        code: 'INVALID_INPUT',
        message: 'Energy Adjustment requires upstream Constraint Object via Periodization adapter (engineContext.meta.constraintObject must be populated)',
        severity: 'hard', // contract violation per §3.6 — downstream cannot trust without baseline
      });
    }

    try {
      // **D2 shape mapping:** rename orchestrator-generic `constraintObject` slot
      // to engine-specific `periodizationConstraint` field. Engine purity
      // preserved per ADR 030 §2.2 D2 thin scope (identical pattern batch 2).
      const adaptedCtx = Object.freeze({
        ...ctx,
        meta: Object.freeze({
          ...ctx.meta,
          periodizationConstraint: upstreamCO,
        }),
      });

      const engineResult = await evaluateEnergyAdjustment(adaptedCtx);

      // **Forward Constraint Object Hook 4 propagation** per ADR 026 §9.3.1 #5:
      // engine emits `meta.forward_constraint_object` = frozen pass-through of
      // upstream Periodization CO. Surface as `output.constraintObject` for
      // orchestrator runPipeline to propagate downstream (Bayesian Nutrition,
      // Tempo, Specialization, Warm-up, Deload — toate consume Floor/Ceiling).
      const forwardedCO = engineResult?.meta?.forward_constraint_object ?? null;

      return ok({
        // Engine output preserved verbatim — adapter doesn't reshape (D2 thin).
        ...engineResult,
        // Surface forward Constraint Object explicit pentru orchestrator
        // detection. Frozen aici (defensive) — engine `forwardConstraintObject`
        // helper already freezes per crossEngineHooks.js, dar dublu-freeze safe.
        constraintObject: forwardedCO ? Object.freeze(forwardedCO) : null,
      });
    } catch (cause) {
      // Engine spec says NEVER throws but D4 violation insurance per §3.6 taxonomy.
      // ENGINE_THREW → 'hard' severity (downstream cannot trust upstream constraint).
      // Sentry capture per D063/D074 orchestrator pipeline adapter coverage —
      // production observability when engine totality contract violated.
      captureException(cause, {
        tags: { source: 'orchestrator-adapter-fallback', adapter: 'energyAdjustment' },
      });
      return err({
        code: 'ENGINE_THREW',
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
        severity: 'hard',
      });
    }
  },
});
