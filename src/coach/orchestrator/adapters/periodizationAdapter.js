// Periodization Engine #1 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1 2026-05-08.
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `periodization` (ADR 026 §42.10 pipeline #1).
// D2 Thin Adapter Scope: pure shape mapping `engineContext → periodizationInput`
//   + Periodization engine call + Result type wrap. ZERO business logic în adapter
//   (engine stays pure per ADR 018 §2 Standardized Dimension Contract).
// D3 Context Object Pre-Built Input: orchestrator builds `engineContext` once;
//   adapter consumes ready-data, NO direct app state pulls.
// D4 Result Type Output Contract: `{ ok: true, output } | { ok: false, error }`
//   never throws. `severity: 'soft' | 'hard'` per §3.6 RESOLVED V1 taxonomy table.
// D5 Cross-Cutting Concerns Orchestrator-Level: Convergence Guard tier resolution +
//   Layer D ≤50ms budget + CDL telemetry sub-spans = orchestrator-level pre/post pipeline.
//
// Constraint Object propagation per ADR 026 §1.10 + ADR 030 D3:
//   adapter exposes `output.constraintObject` (frozen immutable) for orchestrator
//   to populate `engineContext.meta.constraintObject` for downstream engines (Goal
//   Adaptation, Energy Adjustment, Bayesian Nutrition, Tempo, Specialization,
//   Warm-up, Deload — all 7 downstream consume Constraint Object floor/ceiling).
//
// See: 03-decisions/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.1 + §1.10
//      src/engine/periodization/index.js (engine V1 LANDED commit `1303b62`)

import { ok, err } from '../result.js';
import { evaluate as evaluatePeriodization, ENGINE_ID } from '../../../engine/periodization/index.js';

/**
 * Periodization adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * Pure shape mapping: `EngineContext` is already the canonical input shape per
 * ADR 018 §2 + Periodization V1 `evaluate(ctx)` signature. Adapter passes ctx
 * through (D2 thin scope honored) + wraps result în AdapterResult Result type
 * + extracts Constraint Object for orchestrator propagation.
 *
 * `evaluate` is a TOTAL function (NEVER throws per its docstring) — defensive
 * try/catch preserved to honor D4 contract surface even on future spec changes
 * (anti-D4 violation insurance per ADR 030 §2.4).
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const periodizationAdapter = Object.freeze({
  id: ENGINE_ID, // 'periodization' per src/engine/periodization/index.js

  /**
   * Invoke the Periodization engine for the given EngineContext.
   *
   * @param {import('../types.js').EngineContext} ctx
   * @returns {Promise<import('../types.js').AdapterResult>}
   */
  async invoke(ctx) {
    // D4 contract surface: validate input shape minimally — total function
    // semantic preserved în engine (engine handles ctx===undefined gracefully)
    // dar adapter still emits structured INVALID_INPUT for non-object input
    // pentru consistency cu §3.6 taxonomy halt-strict.
    if (ctx !== undefined && (ctx === null || typeof ctx !== 'object')) {
      return err({
        code: 'INVALID_INPUT',
        message: 'periodizationAdapter.invoke expected EngineContext object',
        severity: 'hard', // contract violation — downstream cannot trust shape
      });
    }

    try {
      const engineResult = await evaluatePeriodization(ctx);

      // Constraint Object lives în engine `trace.constraintObject` per
      // src/engine/periodization/index.js line 161. Surface it via output for
      // orchestrator propagation to engineContext.meta.constraintObject pe
      // downstream engines (ADR 026 §1.10 + ADR 030 D3).
      const constraintObject = engineResult?.trace?.constraintObject ?? null;

      return ok({
        // Engine output preserved verbatim — adapter doesn't reshape (D2 thin).
        ...engineResult,
        // Surface Constraint Object explicit pentru orchestrator detection.
        // Frozen aici — orchestrator may double-freeze pentru meta propagation.
        constraintObject: constraintObject ? Object.freeze(constraintObject) : null,
      });
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
