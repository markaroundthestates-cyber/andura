// Goal Adaptation Engine #2 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7
// RESOLVED V1 2026-05-08. Faza 3 STRANGLER batch 2 LANDED 2026-05-08.
//
// Pipeline §42.10 sequential — Goal Adaptation = 2nd engine post Engine #1
// Periodization. **First downstream consumer Constraint Object propagation**
// — reads Periodization output via `engineContext.meta.constraintObject`
// (frozen, populated by orchestrator post-Periodization adapter per batch 1
// LANDED 2026-05-08 commit `de4222b`).
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `goalAdaptation`.
// D2 Thin Adapter Scope: pure shape mapping `engineContext → engineInput`.
//   **D2 shape mapping concrete:** generic orchestrator slot `meta.constraintObject`
//   → engine-specific input `meta.periodizationConstraint` (per ADR 026 §9.2
//   Cluster 5 Hook 1 read-only convention in engine source). Adapter does the
//   rename — engine purity ADR 018 §2 preserved (engine reads its own field name,
//   adapter handles propagation slot translation).
// D3 Context Object Pre-Built Input: orchestrator builds engineContext once;
//   adapter consumes ready-data including upstream Constraint Object.
// D4 Result Type Output Contract: `{ ok, output | error }` never throws.
// D5 Cross-Cutting Concerns Orchestrator-Level: telemetry sub-spans + budget.
//
// **Missing Constraint Object handling per ADR 030 §3.6 RESOLVED V1 taxonomy:**
//   When `engineContext.meta.constraintObject == null/undefined` (Periodization
//   adapter NU ran upstream OR ran cu hard severity halt), Goal Adaptation
//   adapter returns INVALID_INPUT 'hard' severity (contract violation —
//   downstream cannot trust engine output without upstream constraint baseline).
//   Pattern fail-safe Bugatti craft = halt-strict, NU silent compute on
//   missing upstream constraint per Anti-Cascade Silent ADR_CASCADE_DEFENSE_v1.
//
// **Engine NEVER throws** per spec (`evaluate(ctx)` total function), dar D4
// violation insurance preserved cu try/catch ADAPTER_THREW pattern (per ADR
// 030 §3.6 ADAPTER_THREW 'hard' severity halt-strict default).
//
// See: 03-decisions/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.2 + §1.10
//      03-decisions/024-goal-driven-program-templates.md Q1-Q8 LOCKED V1
//      src/engine/goalAdaptation/index.js (engine V1 LANDED commit `bf9814e`)
//      src/coach/orchestrator/adapters/periodizationAdapter.js (batch 1 precedent `de4222b`)

import { ok, err } from '../result.js';
import { evaluate as evaluateGoalAdaptation, ENGINE_ID } from '../../../engine/goalAdaptation/index.js';

/**
 * Goal Adaptation adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * D2 Shape mapping concrete: orchestrator-side `meta.constraintObject` slot
 * propagated by Periodization adapter is renamed to engine-side
 * `meta.periodizationConstraint` for `evaluate(ctx)` consumption. Engine reads
 * via field name `periodizationConstraint` per Cluster 5 Hook 1 convention
 * (ADR 026 §9.2.5 + src/engine/goalAdaptation/index.js:92).
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const goalAdaptationAdapter = Object.freeze({
  id: ENGINE_ID, // 'goalAdaptation' per src/engine/goalAdaptation/index.js

  /**
   * Invoke the Goal Adaptation engine for the given EngineContext.
   *
   * Validates upstream Constraint Object presence (ADR 026 §1.10 sequential
   * mandate) — missing = INVALID_INPUT 'hard' severity halt per §3.6 fail-safe
   * Anti-Cascade Silent default.
   *
   * @param {import('../types.js').EngineContext} ctx
   * @returns {Promise<import('../types.js').AdapterResult>}
   */
  async invoke(ctx) {
    // D4 contract surface: validate input shape minimally.
    if (ctx !== undefined && (ctx === null || typeof ctx !== 'object')) {
      return err({
        code: 'INVALID_INPUT',
        message: 'goalAdaptationAdapter.invoke expected EngineContext object',
        severity: 'hard',
      });
    }

    // **Constraint Object prerequisite check per ADR 030 §3.6 + ADR 026 §1.10:**
    // Goal Adaptation requires upstream Periodization Constraint Object to
    // redistribute volume/intensity INTERIOR Floor/Ceiling. Missing = halt-strict.
    const upstreamCO = ctx?.meta?.constraintObject;
    if (!upstreamCO || typeof upstreamCO !== 'object') {
      return err({
        code: 'INVALID_INPUT',
        message: 'Goal Adaptation requires upstream Constraint Object via Periodization adapter (engineContext.meta.constraintObject must be populated)',
        severity: 'hard', // contract violation per §3.6 — downstream cannot trust without baseline
      });
    }

    try {
      // **D2 shape mapping:** rename orchestrator-generic `constraintObject` slot
      // to engine-specific `periodizationConstraint` field. Engine purity
      // preserved (engine reads its expected field name, adapter handles
      // propagation translation per ADR 030 §2.2 D2 thin scope precedent).
      const adaptedCtx = Object.freeze({
        ...ctx,
        meta: Object.freeze({
          ...ctx.meta,
          periodizationConstraint: upstreamCO,
        }),
      });

      const engineResult = await evaluateGoalAdaptation(adaptedCtx);

      // Goal Adaptation engine NU emits new Constraint Object (consumes only
      // per Hook 1 read-only convention §9.2.5). Constraint Object stays
      // propagated frozen din upstream Periodization for downstream batches
      // (Energy Adjustment, Bayesian Nutrition, etc.). NU surface
      // constraintObject din aceasta adapter output.
      return ok({ ...engineResult });
    } catch (cause) {
      // Engine spec says NEVER throws but D4 violation insurance per §3.6 taxonomy.
      return err({
        code: 'ENGINE_THREW',
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
        severity: 'hard',
      });
    }
  },
});
