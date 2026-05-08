// Bayesian Nutrition Engine #4 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7
// RESOLVED V1 2026-05-08. Faza 3 STRANGLER batch 4 LANDED 2026-05-08.
//
// Pipeline §42.10 sequential — Bayesian Nutrition = 4th engine post Engine #1
// Periodization (batch 1 commit `de4222b`) + Engine #2 Goal Adaptation (batch 2
// commit `905946c`) + Engine #3 Energy Adjustment (batch 3 commits `8bd44ae`/
// `05bb1b0`). **Third downstream consumer Constraint Object** (read-only Hook 1
// per §9.4 Cluster C — engine consumes via `meta.periodizationConstraint`).
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `bayesianNutrition`.
// D2 Thin Adapter Scope: pure shape mapping `engineContext → engineInput`.
//   **D2 shape mapping concrete (identical pattern batches 2-3):** orchestrator
//   slot `meta.constraintObject` → engine-specific input
//   `meta.periodizationConstraint` (per ADR 026 §9.4 Cluster C Hook 1 read-only
//   convention în engine source `src/engine/bayesianNutrition/index.js:222`).
//   Adapter does the rename — engine purity ADR 018 §2 preserved.
// D3 Context Object Pre-Built Input: orchestrator builds engineContext once;
//   adapter consumes ready-data including upstream Constraint Object.
// D4 Result Type Output Contract: `{ ok, output | error }` never throws.
// D5 Cross-Cutting Concerns Orchestrator-Level: telemetry sub-spans + budget.
//
// **Constraint Object propagation downstream (Hook 1 read-only consume pattern,
// identical Goal Adaptation batch 2 precedent — DIVERGENCE vs Energy Adjustment
// batch 3 Hook 4 explicit re-emission):**
//   Bayesian Nutrition engine consumes `meta.periodizationConstraint` read-only
//   per Cluster C Hook 1 (NU mutates, NU emits new Constraint Object). The engine
//   internally invokes `forwardConstraintObject(periodizationConstraint)` în
//   crossEngineHooks.js dar stochează doar `trace.forwardedConstraint = boolean`
//   (NU `meta.forward_constraint_object` în output blueprint). Per investigation
//   pre-flight grep filesystem: Bayesian engine output blueprint is
//   `{ nutrition_inference_metadata, likelihood_probabilities, profile_typing,
//   ui_tier, passive_mode_active, signals }` — Hook 4 re-emission divergence
//   vs Energy Adjustment.
//
//   Adapter therefore follows Goal Adaptation pattern (NU surface
//   `output.constraintObject`) — orchestrator's `currentCtx.meta.constraintObject`
//   was already populated by Energy Adjustment batch 3 Hook 4 re-emission upstream
//   și rămâne propagated frozen pentru downstream batches 5-8 (Tempo,
//   Specialization, Warm-up, Deload) prin orchestrator's existing currentCtx
//   chain (NU explicit Hook 4 re-emission needed when engine doesn't emit).
//
// **Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05 birou after):**
//   Convergence Guard rule = behavioral validation cross-cutting all tier
//   transitions T0→T1→T2, NU Engine #3 specific (per Bayesian crossEngineHooks
//   line 16-19 verbatim). Actual T2 Unlock evaluation lives in
//   `src/coach/orchestrator/utilities/convergenceGuard.js` (Phase 1-2 foundation
//   commit `5a16550` reusable) — orchestrator-level concern, NU engine-emitted
//   metadata. Adapter does NOT propagate convergenceGuard (engine doesn't emit
//   `meta.convergenceGuard`; reference-only via `getConvergenceGuardReference()`
//   în engine module, NU called în evaluate output).
//
// **Missing Constraint Object handling per ADR 030 §3.6 RESOLVED V1 taxonomy
// (identical pattern batches 2-3):** when
// `engineContext.meta.constraintObject == null/undefined` (Periodization
// adapter NU ran upstream OR ran cu hard severity halt), Bayesian Nutrition
// adapter returns INVALID_INPUT 'hard' severity (contract violation —
// downstream cannot trust engine output without upstream constraint baseline).
// Pattern fail-safe Bugatti craft = halt-strict, NU silent compute on
// missing upstream constraint per Anti-Cascade Silent.
//
// **Engine NEVER throws** per spec (`evaluate(ctx)` total function async), dar
// D4 violation insurance preserved cu try/catch ENGINE_THREW pattern (per ADR
// 030 §3.6 ENGINE_THREW 'hard' severity halt-strict default).
//
// See: 03-decisions/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.4 + §1.10
//      03-decisions/022-bayesian-nutrition-inference.md SPEC READY V1
//      03-decisions/009-auto-aggression-readiness.md §AMENDMENT Convergence Guard
//      src/engine/bayesianNutrition/index.js (engine V1 LANDED commit `8615ec1`)
//      src/coach/orchestrator/adapters/energyAdjustmentAdapter.js (batch 3 precedent)
//      src/coach/orchestrator/adapters/goalAdaptationAdapter.js (batch 2 precedent — read-only consume pattern)
//      src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator-level T2 Unlock)

import { ok, err } from '../result.js';
import { evaluate as evaluateBayesianNutrition, ENGINE_ID } from '../../../engine/bayesianNutrition/index.js';

/**
 * Bayesian Nutrition adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * D2 Shape mapping concrete: orchestrator-side `meta.constraintObject` slot
 * (propagated by upstream Energy Adjustment Hook 4 re-emission batch 3) is
 * renamed to engine-side `meta.periodizationConstraint` for `evaluate(ctx)`
 * consumption (engine reads via field name `periodizationConstraint` per
 * ADR 026 §9.4 + engine source line 222).
 *
 * Engine consumes Constraint Object read-only (Hook 1 convention) — adapter
 * does NOT re-emit `output.constraintObject` (Goal Adaptation pattern, NOT
 * Energy Adjustment pattern). Orchestrator's currentCtx.meta.constraintObject
 * remains populated frozen din upstream Energy Adjustment Hook 4 emission for
 * downstream batches 5-8 via existing currentCtx chain.
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const bayesianNutritionAdapter = Object.freeze({
  id: ENGINE_ID, // 'bayesianNutrition' per src/engine/bayesianNutrition/index.js

  /**
   * Invoke the Bayesian Nutrition engine for the given EngineContext.
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
        message: 'bayesianNutritionAdapter.invoke expected EngineContext object',
        severity: 'hard',
      });
    }

    // **Constraint Object prerequisite check per ADR 030 §3.6 + ADR 026 §1.10:**
    // Bayesian Nutrition requires upstream Periodization Constraint Object to
    // condition prior posterior inference per ADR 026 §9.4 Cluster C. Missing =
    // halt-strict (downstream Tempo/Specialization/Warm-up/Deload cannot trust
    // posterior without upstream constraint baseline).
    const upstreamCO = ctx?.meta?.constraintObject;
    if (!upstreamCO || typeof upstreamCO !== 'object') {
      return err({
        code: 'INVALID_INPUT',
        message: 'Bayesian Nutrition requires upstream Constraint Object via Periodization adapter (engineContext.meta.constraintObject must be populated)',
        severity: 'hard', // contract violation per §3.6 — downstream cannot trust without baseline
      });
    }

    try {
      // **D2 shape mapping:** rename orchestrator-generic `constraintObject` slot
      // to engine-specific `periodizationConstraint` field. Engine purity
      // preserved per ADR 030 §2.2 D2 thin scope (identical pattern batches 2-3).
      const adaptedCtx = Object.freeze({
        ...ctx,
        meta: Object.freeze({
          ...ctx.meta,
          periodizationConstraint: upstreamCO,
        }),
      });

      const engineResult = await evaluateBayesianNutrition(adaptedCtx);

      // Bayesian Nutrition engine consumes Constraint Object read-only per
      // Hook 1 convention (§9.4 Cluster C). Engine NU emits new Constraint
      // Object în output blueprint (`meta.forward_constraint_object` absent
      // in engine output — only trace boolean flag). Constraint Object stays
      // propagated frozen din upstream Energy Adjustment Hook 4 batch 3 prin
      // orchestrator's existing currentCtx chain pentru downstream batches
      // 5-8 (Tempo, Specialization, Warm-up, Deload toate consume Floor/Ceiling).
      // NU surface constraintObject din această adapter output (Goal Adaptation
      // pattern, NU Energy Adjustment Hook 4 re-emission pattern).
      return ok({ ...engineResult });
    } catch (cause) {
      // Engine spec says NEVER throws but D4 violation insurance per §3.6 taxonomy.
      // ENGINE_THREW → 'hard' severity (downstream cannot trust upstream constraint).
      return err({
        code: 'ENGINE_THREW',
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
        severity: 'hard',
      });
    }
  },
});
