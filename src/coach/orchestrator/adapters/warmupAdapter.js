// Warm-up Engine #7 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08. Faza 3 STRANGLER batch 7 LANDED 2026-05-08.
//
// Pipeline §42.10 sequential — Warm-up = 7th engine post Engine #1 Periodization
// (batch 1 commit `de4222b`) + Engine #2 Goal Adaptation (batch 2 commit
// `905946c`) + Engine #3 Energy Adjustment (batch 3) + Engine #4 Bayesian
// Nutrition (batch 4) + Engine #5 Tempo (batch 5) + Engine #6 Specialization
// (batch 6 commit `b2c07d0`).
// **Sixth downstream consumer Constraint Object** (read-only Hook D1 per §9.7
// Cluster D — engine consumes via `meta.periodizationConstraint`).
//
// **Engine numbering clarification:** Source 1 + Source 2 reference "Engine #8"
// = chat strategic spec session ordering legacy (META §36.100 amendment 7→8
// prescriptive engines 2026-04-30 evening) NU pipeline §42.10 canonical position
// 7th. Penultimate prescriptive engine pre-Deload (§9.8 batch 8 final).
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `warmup`.
// D2 Thin Adapter Scope: pure shape mapping `engineContext → engineInput`.
//   **D2 shape mapping concrete (identical pattern batches 2-6):** orchestrator
//   slot `meta.constraintObject` → engine-specific input
//   `meta.periodizationConstraint` (per ADR 026 §9.7 Cluster D Hook D1 read-only
//   convention în engine source `src/engine/warmup/index.js:187`).
//   Adapter does the rename — engine purity ADR 018 §2 preserved.
// D3 Context Object Pre-Built Input: orchestrator builds engineContext once;
//   adapter consumes ready-data including upstream Constraint Object.
// D4 Result Type Output Contract: `{ ok, output | error }` never throws.
// D5 Cross-Cutting Concerns Orchestrator-Level: telemetry sub-spans + budget.
//
// **Constraint Object propagation downstream (Hook D1 read-only consume pattern,
// identical Specialization batch 6 + Tempo batch 5 + Bayesian Nutrition batch 4
// + Goal Adaptation batch 2 precedents — DIVERGENCE vs Energy Adjustment batch 3
// Hook 4 explicit re-emission):**
//   Warm-up engine consumes `meta.periodizationConstraint` read-only per Hook D1
//   convention (§9.7 Cluster D). Engine NU mutates, NU emits new Constraint
//   Object în output blueprint. Engine internally invokes
//   `forwardConstraintObject(periodizationConstraint)` în crossEngineHooks.js
//   dar stochează doar `trace.forwardedConstraint = boolean` (NU
//   `meta.forward_constraint_object`). Per pre-flight grep filesystem: Warm-up
//   engine output blueprint = `{ warmup_state, duration_min, routine_type,
//   general_sets, general_sets_list, specific_sets, specific_sets_list,
//   target_muscle_groups, skip_available, cooldown_state, ui_label, signals }`
//   (12 fields în meta — Hook 4 re-emission divergence vs Energy Adjustment).
//
//   Adapter therefore follows Specialization / Tempo / Bayesian / Goal pattern
//   (NU surface `output.constraintObject`) — orchestrator's
//   `currentCtx.meta.constraintObject` was already populated by Energy
//   Adjustment batch 3 Hook 4 re-emission upstream și rămâne propagated frozen
//   pentru downstream batch 8 (Deload) prin orchestrator's existing currentCtx
//   chain (NU explicit Hook 4 re-emission needed when engine doesn't emit).
//
// **Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05 birou after):**
//   Convergence Guard rule = behavioral validation cross-cutting all tier
//   transitions T0→T1→T2, NU Engine #7 specific (per Warm-up crossEngineHooks
//   line 163-185 verbatim). Actual T2 Unlock evaluation lives in
//   `src/coach/orchestrator/utilities/convergenceGuard.js` (Phase 1-2 foundation
//   commit `5a16550` reusable) — orchestrator-level concern, NU engine-emitted
//   metadata. Adapter does NOT propagate convergenceGuard (engine doesn't emit
//   `meta.convergenceGuard`; reference-only via `getConvergenceGuardReference()`
//   în engine module, called doar pentru `trace.convergenceGuardRef` NU output
//   blueprint).
//
// **Activation gating (Cluster A1) — engine handles internally:**
//   Engine warmup_state priority order Cluster A1:
//     1. Pain-Aware injury detection → INJURY_DISABLED (Pain Button user-triggered)
//     2. User opted skip toggle → SKIPPED (B4 Q65.3 buton vizibil session 1)
//     3. Periodization phase = DELOAD → DELOAD_LIGHTER (Hook D1)
//     4. Default → ACTIVE (full hybrid routine)
//   T0 Instant Skip principle (Cluster E1) = SkipDecision metadata flag
//   `t0InstantSkipDefault: true` în trace; warmup_state stays ACTIVE pentru T0
//   user fresh fără explicit `userOptedSkip: true` (anti-paternalism ADR 025
//   preserved — engine pre-fills, user keeps autonomy).
//   Adapter NU adds gating logic — engine total function NEVER throws orchestrates.
//
// **Persona-aware duration thresholds (Cluster B3 §45.6.3 verbatim):**
//   Maria 65: 5-10 min mobility flow + bands light
//   Gigica 35: 5-7 min dynamic + ramp first exercise
//   Marius 25: 8-10 min ramp protocol heavy compounds (50/70/90%) + general minimal
//
// **Energy DOWN auto-shorten (Cluster D3 anti-cascade):** upper bound clamped
// to 7 min preserve §1.10 Pipeline Order LOCKED V1 (consistent §9.5 Tempo D13
// precedent — Energy DOWN modulates duration NU intensity directly în Warm-up).
//
// **Missing Constraint Object handling per ADR 030 §3.6 RESOLVED V1 taxonomy
// (identical pattern batches 2-6):** when
// `engineContext.meta.constraintObject == null/undefined` (Periodization adapter
// NU ran upstream OR ran cu hard severity halt), Warm-up adapter returns
// INVALID_INPUT 'hard' severity (contract violation — downstream cannot trust
// engine output without upstream constraint baseline). Pattern fail-safe Bugatti
// craft = halt-strict, NU silent compute on missing upstream constraint per
// Anti-Cascade Silent.
//
// **Engine NEVER throws** per spec (`evaluate(ctx)` total function async), dar
// D4 violation insurance preserved cu try/catch ENGINE_THREW pattern (per ADR
// 030 §3.6 ENGINE_THREW 'hard' severity halt-strict default).
//
// See: 03-decisions/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.7 + §1.10
//      03-decisions/031-engine-warmup-mobility.md SPEC REFERENCE direct (reverse
//        pattern vs ADR 027/028/029 stub flip)
//      03-decisions/009-auto-aggression-readiness.md §AMENDMENT Convergence Guard
//      src/engine/warmup/index.js (engine V1 LANDED commit `20999fb` Faza 2.5 batch 7)
//      src/engine/warmup/crossEngineHooks.js (Hook D1-D5 read-only consume)
//      src/engine/warmup/durationCalculator.js (persona thresholds + Energy DOWN)
//      src/engine/warmup/skipManager.js (T0 Instant Skip default + B4 Q65.3)
//      src/coach/orchestrator/adapters/specializationAdapter.js (batch 6 precedent)
//      src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator-level T2 Unlock)

import { ok, err } from '../result.js';
import { evaluate as evaluateWarmup, ENGINE_ID } from '../../../engine/warmup/index.js';

/**
 * Warm-up adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * D2 Shape mapping concrete: orchestrator-side `meta.constraintObject` slot
 * (propagated by upstream Energy Adjustment Hook 4 re-emission batch 3) is
 * renamed to engine-side `meta.periodizationConstraint` for `evaluate(ctx)`
 * consumption (engine reads via field name `periodizationConstraint` per
 * ADR 026 §9.7 + engine source line 187).
 *
 * Engine consumes Constraint Object read-only (Hook D1 convention) — adapter
 * does NOT re-emit `output.constraintObject` (Specialization / Tempo / Bayesian
 * Nutrition / Goal Adaptation pattern, NOT Energy Adjustment Hook 4 pattern).
 * Orchestrator's currentCtx.meta.constraintObject remains populated frozen din
 * upstream Energy Adjustment Hook 4 emission for downstream batch 8 (Deload)
 * via existing currentCtx chain.
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const warmupAdapter = Object.freeze({
  id: ENGINE_ID, // 'warmup' per src/engine/warmup/index.js

  /**
   * Invoke the Warm-up engine for the given EngineContext.
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
        message: 'warmupAdapter.invoke expected EngineContext object',
        severity: 'hard',
      });
    }

    // **Constraint Object prerequisite check per ADR 030 §3.6 + ADR 026 §1.10:**
    // Warm-up requires upstream Periodization Constraint Object to condition
    // DELOAD detection (Hook D1) + downstream Deload baseline per ADR 026 §9.7
    // Cluster D. Missing = halt-strict (downstream Deload cannot trust output
    // without upstream constraint baseline).
    const upstreamCO = ctx?.meta?.constraintObject;
    if (!upstreamCO || typeof upstreamCO !== 'object') {
      return err({
        code: 'INVALID_INPUT',
        message: 'Warm-up requires upstream Constraint Object via Periodization adapter (engineContext.meta.constraintObject must be populated)',
        severity: 'hard', // contract violation per §3.6 — downstream cannot trust without baseline
      });
    }

    try {
      // **D2 shape mapping:** rename orchestrator-generic `constraintObject` slot
      // to engine-specific `periodizationConstraint` field. Engine purity
      // preserved per ADR 030 §2.2 D2 thin scope (identical pattern batches 2-6).
      const adaptedCtx = Object.freeze({
        ...ctx,
        meta: Object.freeze({
          ...ctx.meta,
          periodizationConstraint: upstreamCO,
        }),
      });

      const engineResult = await evaluateWarmup(adaptedCtx);

      // Warm-up engine consumes Constraint Object read-only per Hook D1
      // convention (§9.7 Cluster D). Engine NU emits new Constraint Object în
      // output blueprint (`meta.forward_constraint_object` absent in engine
      // output — only trace boolean flag). Constraint Object stays propagated
      // frozen din upstream Energy Adjustment Hook 4 batch 3 prin orchestrator's
      // existing currentCtx chain pentru downstream batch 8 (Deload consume
      // Floor/Ceiling). NU surface constraintObject din această adapter output
      // (Specialization / Tempo / Bayesian Nutrition / Goal Adaptation pattern,
      // NU Energy Adjustment Hook 4 re-emission pattern).
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
