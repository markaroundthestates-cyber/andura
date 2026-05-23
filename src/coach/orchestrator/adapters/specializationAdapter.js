// Specialization Engine #6 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7
// RESOLVED V1 2026-05-08. Faza 3 STRANGLER batch 6 LANDED 2026-05-08.
//
// Pipeline §42.10 sequential — Specialization = 6th engine post Engine #1
// Periodization (batch 1 commit `de4222b`) + Engine #2 Goal Adaptation (batch 2
// commit `905946c`) + Engine #3 Energy Adjustment (batch 3 commits `8bd44ae`/
// `05bb1b0`) + Engine #4 Bayesian Nutrition (batch 4 commits `d2450ba`/`125ba0e`)
// + Engine #5 Tempo (batch 5 commits `86bc57e`/`189d764`).
// **Fifth downstream consumer Constraint Object** (read-only Hook 1 per §9.6
// Cluster A — engine consumes via `meta.periodizationConstraint`).
//
// **§36.84 Gap #1 critical scope:** Engine Specialization V1 = wiring detector
// → session builder action layer. ZERO new code engine logic detection — engine
// reuses `src/engine/weaknessDetector.js` orfan via import in
// `src/engine/specialization/weaknessConsumer.js`. Adapter wires engine into
// orchestrator pipeline (no detection logic la adapter level).
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `specialization`.
// D2 Thin Adapter Scope: pure shape mapping `engineContext → engineInput`.
//   **D2 shape mapping concrete (identical pattern batches 2-5):** orchestrator
//   slot `meta.constraintObject` → engine-specific input
//   `meta.periodizationConstraint` (per ADR 026 §9.6 Cluster A Hook 1
//   read-only convention in engine source `src/engine/specialization/index.js:185`).
//   Adapter does the rename — engine purity ADR 018 §2 preserved.
// D3 Context Object Pre-Built Input: orchestrator builds engineContext once;
//   adapter consumes ready-data including upstream Constraint Object.
// D4 Result Type Output Contract: `{ ok, output | error }` never throws.
// D5 Cross-Cutting Concerns Orchestrator-Level: telemetry sub-spans + budget.
//
// **Constraint Object propagation downstream (Hook 1 read-only consume pattern,
// identical Tempo batch 5 + Bayesian Nutrition batch 4 + Goal Adaptation batch
// 2 precedents — DIVERGENCE vs Energy Adjustment batch 3 Hook 4 explicit
// re-emission):**
//   Specialization engine consumes `meta.periodizationConstraint` read-only
//   per Cluster A Hook 1 (NU mutates, NU emits new Constraint Object). The
//   engine internally invokes `forwardConstraintObject(periodizationConstraint)`
//   in crossEngineHooks.js dar stocheaza doar `trace.forwardedConstraint =
//   boolean` (NU `meta.forward_constraint_object` in output blueprint). Per
//   investigation pre-flight grep filesystem: Specialization engine output
//   blueprint is `{ activation_state, target_muscle_group, mesocycle_progress,
//   volume_modifier, ui_label, cooldown_state, signals }` (7 fields in meta) —
//   Hook 4 re-emission divergence vs Energy Adjustment.
//
//   Adapter therefore follows Tempo / Bayesian Nutrition / Goal Adaptation
//   pattern (NU surface `output.constraintObject`) — orchestrator's
//   `currentCtx.meta.constraintObject` was already populated by Energy
//   Adjustment batch 3 Hook 4 re-emission upstream si ramane propagated frozen
//   pentru downstream batches 7-8 (Warm-up, Deload) prin orchestrator's
//   existing currentCtx chain (NU explicit Hook 4 re-emission needed when
//   engine doesn't emit).
//
// **Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05 birou after):**
//   Convergence Guard rule = behavioral validation cross-cutting all tier
//   transitions T0→T1→T2, NU Engine #6 specific (per Specialization
//   crossEngineHooks line 33-37 verbatim). Actual T2 Unlock evaluation lives
//   in `src/coach/orchestrator/utilities/convergenceGuard.js` (Phase 1-2
//   foundation commit `5a16550` reusable) — orchestrator-level concern, NU
//   engine-emitted metadata. Adapter does NOT propagate convergenceGuard
//   (engine doesn't emit `meta.convergenceGuard`; reference-only via
//   `getConvergenceGuardReference()` in engine module, called doar pentru
//   `trace.convergenceGuardRef` NU output blueprint).
//
// **Activation gating priority (Cluster A) — engine handles internally:**
//   1. Persona Q12 §45.3 LOCKED — Marius ONLY (Maria/Gigica reject V1)
//   2. Tier T1+ established (T0 calibration window noise high reject)
//   3. Goal Phase Q5=D + Q13=A dual safety — BULK + RECOMP ONLY (CUT DISABLE)
//   4. Injury Q14=A Safety Override — PainButton signal target group → disable
//   Eligibility result returned in `output.meta.activation_state` cu enum:
//   INELIGIBLE_NOT_MARIUS / INELIGIBLE_NOT_ADVANCED / INELIGIBLE_PHASE_GATE /
//   INELIGIBLE_INJURY_OVERRIDE / INELIGIBLE_NO_LAGGING / INELIGIBLE_COOLDOWN /
//   PROPOSAL_PENDING / ACTIVE / COMPLETED_EXIT (per constants.js ACTIVATION_STATE).
//   Adapter NU adds gating logic — engine total function NEVER throws orchestrates.
//
// **Missing Constraint Object handling per ADR 030 §3.6 RESOLVED V1 taxonomy
// (identical pattern batches 2-5):** when
// `engineContext.meta.constraintObject == null/undefined` (Periodization
// adapter NU ran upstream OR ran cu hard severity halt), Specialization
// adapter returns INVALID_INPUT 'hard' severity (contract violation —
// downstream cannot trust engine output without upstream constraint baseline).
// Pattern fail-safe Bugatti craft = halt-strict, NU silent compute on
// missing upstream constraint per Anti-Cascade Silent.
//
// **Engine NEVER throws** per spec (`evaluate(ctx)` total function async), dar
// D4 violation insurance preserved cu try/catch ENGINE_THREW pattern (per ADR
// 030 §3.6 ENGINE_THREW 'hard' severity halt-strict default).
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.6 + §1.10
//      03-decisions/_FROZEN/029-engine-specialization-block.md SPEC REFERENCE redirect canonical
//      03-decisions/_FROZEN/009-auto-aggression-readiness.md §AMENDMENT Convergence Guard
//      src/engine/specialization/index.js (engine V1 LANDED commit `4cf50ab`)
//      src/engine/specialization/activationGating.js (4-gate priority order)
//      src/engine/specialization/weaknessConsumer.js (§36.84 Gap #1 weaknessDetector orfan reuse)
//      src/coach/orchestrator/adapters/tempoAdapter.js (batch 5 precedent)
//      src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator-level T2 Unlock)

import { ok, err } from '../result.js';
import { evaluate as evaluateSpecialization, ENGINE_ID } from '../../../engine/specialization/index.js';
import { captureException } from '../../../util/sentry.js';

/**
 * Specialization adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * D2 Shape mapping concrete: orchestrator-side `meta.constraintObject` slot
 * (propagated by upstream Energy Adjustment Hook 4 re-emission batch 3) is
 * renamed to engine-side `meta.periodizationConstraint` for `evaluate(ctx)`
 * consumption (engine reads via field name `periodizationConstraint` per
 * ADR 026 §9.6 + engine source line 185).
 *
 * Engine consumes Constraint Object read-only (Hook 1 convention) — adapter
 * does NOT re-emit `output.constraintObject` (Tempo / Bayesian Nutrition /
 * Goal Adaptation pattern, NOT Energy Adjustment Hook 4 pattern).
 * Orchestrator's currentCtx.meta.constraintObject remains populated frozen
 * din upstream Energy Adjustment Hook 4 emission for downstream batches 7-8
 * via existing currentCtx chain.
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const specializationAdapter = Object.freeze({
  id: ENGINE_ID, // 'specialization' per src/engine/specialization/index.js

  /**
   * Invoke the Specialization engine for the given EngineContext.
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
        message: 'specializationAdapter.invoke expected EngineContext object',
        severity: 'hard',
      });
    }

    // **Constraint Object prerequisite check per ADR 030 §3.6 + ADR 026 §1.10:**
    // Specialization requires upstream Periodization Constraint Object to
    // condition activation gating + volume modifier per ADR 026 §9.6 Cluster A.
    // Missing = halt-strict (downstream Warm-up/Deload cannot trust output
    // without upstream constraint baseline).
    const upstreamCO = ctx?.meta?.constraintObject;
    if (!upstreamCO || typeof upstreamCO !== 'object') {
      return err({
        code: 'INVALID_INPUT',
        message: 'Specialization requires upstream Constraint Object via Periodization adapter (engineContext.meta.constraintObject must be populated)',
        severity: 'hard', // contract violation per §3.6 — downstream cannot trust without baseline
      });
    }

    try {
      // **D2 shape mapping:** rename orchestrator-generic `constraintObject` slot
      // to engine-specific `periodizationConstraint` field. Engine purity
      // preserved per ADR 030 §2.2 D2 thin scope (identical pattern batches 2-5).
      const adaptedCtx = Object.freeze({
        ...ctx,
        meta: Object.freeze({
          ...ctx.meta,
          periodizationConstraint: upstreamCO,
        }),
      });

      const engineResult = await evaluateSpecialization(adaptedCtx);

      // Specialization engine consumes Constraint Object read-only per Hook 1
      // convention (§9.6 Cluster A). Engine NU emits new Constraint Object in
      // output blueprint (`meta.forward_constraint_object` absent in engine
      // output — only trace boolean flag). Constraint Object stays propagated
      // frozen din upstream Energy Adjustment Hook 4 batch 3 prin orchestrator's
      // existing currentCtx chain pentru downstream batches 7-8 (Warm-up,
      // Deload toate consume Floor/Ceiling). NU surface constraintObject din
      // aceasta adapter output (Tempo / Bayesian Nutrition / Goal Adaptation
      // pattern, NU Energy Adjustment Hook 4 re-emission pattern).
      return ok({ ...engineResult });
    } catch (cause) {
      // Engine spec says NEVER throws but D4 violation insurance per §3.6 taxonomy.
      // ENGINE_THREW → 'hard' severity (downstream cannot trust upstream constraint).
      // Sentry capture per D063/D074 orchestrator pipeline adapter coverage —
      // production observability when engine totality contract violated.
      captureException(cause, {
        tags: { source: 'orchestrator-adapter-fallback', adapter: 'specialization' },
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
