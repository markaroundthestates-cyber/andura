// Deload Engine #8 adapter per ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-18. Faza 3 STRANGLER batch 8 ULTIM LANDED 2026-05-18.
//
// Pipeline §42.10 sequential — Deload = 8th TERMINAL FINAL prescriptive engine
// post Engine #1 Periodization (batch 1 commit `de4222b`) + Engine #2 Goal
// Adaptation (batch 2 commit `905946c`) + Engine #3 Energy Adjustment (batch 3)
// + Engine #4 Bayesian Nutrition (batch 4) + Engine #5 Tempo (batch 5) +
// Engine #6 Specialization (batch 6 commit `b2c07d0`) + Engine #7 Warm-up
// (batch 7). **Seventh and last downstream consumer Constraint Object**
// (read-only Hook D1 per §9.8.4 Cluster D — engine consumes via
// `meta.periodizationConstraint`).
//
// **Engine numbering clarification:** Source 1 references "Engine #4 Deload
// Protocol" = chat strategic spec session ordering legacy 2026-05-05 birou
// after (3-engine cluster #3+#4+#5 spec session — Bayesian + Deload + Energy
// grouped) NU pipeline §42.10 canonical position 8th FINAL. Pipeline order
// canonical = sequential gate flow upstream → midstream → **Deload terminal**.
//
// **Pipeline §42.10 CLOSURE FINAL 8/8 V1 prescriptive engines complete** post
// Engine Deload V1 wired via this adapter (Faza 3 STRANGLER topology terminal).
//
// D1 Per-Engine Topology: 1-of-8 adapters, this is `deload` ULTIM.
// D2 Thin Adapter Scope: pure shape mapping `engineContext → engineInput`.
//   **D2 shape mapping concrete (identical pattern batches 2 + 4-7 read-only,
//   NU Energy Adjustment Hook 4 re-emission):** orchestrator slot
//   `meta.constraintObject` → engine-specific input `meta.periodizationConstraint`
//   per Hook D1 read-only convention §9.8.4 Cluster D + engine source
//   `src/engine/deload/index.js` line 227 (`meta.periodizationConstraint || null`).
//   Adapter does the rename — engine purity ADR 018 §2 preserved.
// D3 Context Object Pre-Built Input: orchestrator builds engineContext once;
//   adapter consumes ready-data including upstream Constraint Object.
// D4 Result Type Output Contract: `{ ok, output | error }` never throws.
// D5 Cross-Cutting Concerns Orchestrator-Level: telemetry sub-spans + budget.
//
// **Constraint Object propagation downstream (Hook D1 read-only consume pattern
// identical Specialization batch 6 + Warmup batch 7 + Tempo batch 5 + Bayesian
// Nutrition batch 4 + Goal Adaptation batch 2 precedents — DIVERGENCE vs Energy
// Adjustment batch 3 Hook 4 explicit re-emission):**
//   Deload engine consumes `meta.periodizationConstraint` read-only per Hook D1
//   convention (§9.8.4 Cluster D). Engine NU mutates, NU emits new Constraint
//   Object in output blueprint. Internally invokes
//   `forwardConstraintObject(periodizationConstraint)` in crossEngineHooks.js
//   dar returneaza null V1 — Deload TERMINAL pipeline §42.10 8th FINAL (NU
//   forward downstream V1, NU engine 9th consumer exista V1).
//
//   Adapter therefore follows Specialization / Warmup / Tempo / Bayesian / Goal
//   Adaptation pattern (NU surface `output.constraintObject`) — orchestrator's
//   `currentCtx.meta.constraintObject` was already populated by Energy
//   Adjustment batch 3 Hook 4 re-emission upstream si ramane propagated frozen
//   prin orchestrator's existing currentCtx chain (Deload terminal — NU
//   re-emission needed since engine doesn't emit).
//
// **Engine output blueprint 9-field Cluster A1+C1 verbatim emit (Source 1):**
//   { deload_state, depth_pct, duration_weeks, intensity_modifier,
//     partial_scope, notification_tier, wording, ui_label, signals }
//
// **Missing Constraint Object handling per ADR 030 §3.6 RESOLVED V1 taxonomy
// (identical pattern batches 2-7):** when
// `engineContext.meta.constraintObject == null/undefined` (Periodization adapter
// NU ran upstream OR ran cu hard severity halt), Deload adapter returns
// INVALID_INPUT 'hard' severity (contract violation — Deload reads Hook D1
// `periodizationConstraint.phase` + `deload_window.trigger` pentru
// SCHEDULED_LINEAR detection). Pattern fail-safe Bugatti craft = halt-strict,
// NU silent compute on missing upstream constraint per Anti-Cascade Silent.
//
// **Engine NEVER throws** per spec (`evaluate(ctx)` total function async per
// ADR 018 §2), dar D4 violation insurance preserved cu try/catch ENGINE_THREW
// pattern (per ADR 030 §3.6 ENGINE_THREW 'hard' severity halt-strict default
// — Deload terminal so halt has no downstream impact, dar fail-safe preserved).
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §2 + §3 RESOLVED V1
//      03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.8 + §42.10 + §1.10
//      03-decisions/_FROZEN/001-...periodization (Hook D1 source Constraint Object SSOT)
//      src/engine/deload/index.js (engine V1 LANDED Faza 2.5 batch 8 ULTIM)
//      src/engine/deload/crossEngineHooks.js (Hook D1-D7 read-only consume + terminal D7 forward null)
//      src/engine/deload/triggerHierarchy.js (Composite > AA > Linear B2 priority)
//      src/coach/orchestrator/adapters/warmupAdapter.js (batch 7 precedent verbatim)

import { ok, err } from '../result.js';
import { evaluate as evaluateDeload, ENGINE_ID } from '../../../engine/deload/index.js';
import { captureException } from '../../../util/sentry.js';

/**
 * Deload adapter — implements `EngineAdapter` contract per ADR 030 D2.
 *
 * D2 Shape mapping concrete: orchestrator-side `meta.constraintObject` slot
 * (propagated by upstream Energy Adjustment Hook 4 re-emission batch 3) is
 * renamed to engine-side `meta.periodizationConstraint` for `evaluate(ctx)`
 * consumption (engine reads via field name `periodizationConstraint` per
 * ADR 026 §9.8.4 + engine source line 227).
 *
 * Engine consumes Constraint Object read-only (Hook D1 convention) — adapter
 * does NOT re-emit `output.constraintObject` (Specialization / Warmup / Tempo /
 * Bayesian Nutrition / Goal Adaptation pattern, NOT Energy Adjustment Hook 4
 * pattern). Deload TERMINAL pipeline §42.10 8th FINAL — engine's
 * `forwardConstraintObject` returns null V1 (no engine 9th consumer downstream).
 *
 * @type {import('../types.js').EngineAdapter}
 */
export const deloadAdapter = Object.freeze({
  id: ENGINE_ID, // 'deload' per src/engine/deload/index.js

  /**
   * Invoke the Deload engine for the given EngineContext.
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
        message: 'deloadAdapter.invoke expected EngineContext object',
        severity: 'hard',
      });
    }

    // **Constraint Object prerequisite check per ADR 030 §3.6 + ADR 026 §1.10:**
    // Deload requires upstream Periodization Constraint Object pentru Linear
    // Block detection (Hook D1: phase=DELOAD + deload_window.trigger=CALENDAR
    // signals SCHEDULED_LINEAR state). Missing = halt-strict (cannot trust
    // upstream baseline per Anti-Cascade Silent).
    const upstreamCO = ctx?.meta?.constraintObject;
    if (!upstreamCO || typeof upstreamCO !== 'object') {
      return err({
        code: 'INVALID_INPUT',
        message: 'Deload requires upstream Constraint Object via Periodization adapter (engineContext.meta.constraintObject must be populated)',
        severity: 'hard', // contract violation per §3.6 — Hook D1 baseline mandatory
      });
    }

    try {
      // **D2 shape mapping:** rename orchestrator-generic `constraintObject`
      // slot to engine-specific `periodizationConstraint` field. Engine purity
      // preserved per ADR 030 §2.2 D2 thin scope (identical pattern batches 2
      // + 4-7 NU Energy Adjustment Hook 4 re-emission).
      const adaptedCtx = Object.freeze({
        ...ctx,
        meta: Object.freeze({
          ...ctx.meta,
          periodizationConstraint: upstreamCO,
        }),
      });

      const engineResult = await evaluateDeload(adaptedCtx);

      // Deload engine consumes Constraint Object read-only per Hook D1
      // convention (§9.8.4 Cluster D). Engine NU emits new Constraint Object
      // in output blueprint (forwardConstraintObject returns null — Deload
      // TERMINAL pipeline §42.10 8th FINAL). NU surface constraintObject din
      // aceasta adapter output (Specialization / Warmup / Tempo / Bayesian /
      // Goal Adaptation pattern).
      return ok({ ...engineResult });
    } catch (cause) {
      // Engine spec says NEVER throws but D4 violation insurance per §3.6
      // taxonomy. ENGINE_THREW → 'hard' severity (Deload terminal — halt has
      // no downstream impact dar fail-safe preserved Bugatti craft).
      // Sentry capture per D063/D074 orchestrator pipeline adapter coverage —
      // production observability when engine totality contract violated.
      captureException(cause, {
        tags: { source: 'orchestrator-adapter-fallback', adapter: 'deload' },
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
