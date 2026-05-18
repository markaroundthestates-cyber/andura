// Deload Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 8 ULTIM (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED
// V1 2026-05-18; ADR 026 §42.10 pipeline #8 TERMINAL FINAL): zero-behavior-change
// strict between legacy direct `evaluate(ctx)` invocation (cu
// `meta.periodizationConstraint` already provided) and orchestrated
// `runPipeline(ctx, [deloadAdapter])` path (cu `meta.constraintObject`
// propagated, adapter does D2 shape mapping rename to engine-expected
// `meta.periodizationConstraint`).
//
// **Seventh and last downstream Constraint Object consumer (read-only Hook D1
// convention, NU re-emit Hook 4 — engine's forwardConstraintObject returns null
// terminal V1).** Pattern follows Specialization batch 6 + Warmup batch 7 +
// Tempo batch 5 + Bayesian Nutrition batch 4 + Goal Adaptation batch 2
// precedents (consume read-only, NU re-surface), DIVERGENT vs Energy Adjustment
// batch 3 Hook 4 explicit re-emission.
//
// **Pipeline §42.10 CLOSURE FINAL 8/8 V1 prescriptive engines complete** post
// Engine Deload V1 wired via this adapter (test covers full 8-adapter chain).
//
// Field name mapping verdict (per §0 prompt + pre-flight grep filesystem):
//   Engine reads `meta.periodizationConstraint` (same convention batches 2 +
//   4-7) — adapter rename `meta.constraintObject` → `meta.periodizationConstraint`
//   (engine source line 227). Engine output blueprint = `{ deload_state,
//   depth_pct, duration_weeks, intensity_modifier, partial_scope,
//   notification_tier, wording, ui_label, signals }` — 9 fields in meta — NU
//   include `forward_constraint_object` (engine forwardConstraintObject returns
//   null V1 terminal, only `trace.forwardedConstraint = null`). Adapter NU
//   re-surface `output.constraintObject`.
//
// **DELOAD_STATE enum actual** (per `src/engine/deload/constants.js`
// DELOAD_STATE export — values are simple uppercase keys):
//   - IDLE                = 'IDLE'
//   - SCHEDULED_LINEAR    = 'SCHEDULED_LINEAR'
//   - REACTIVE_COMPOSITE  = 'REACTIVE_COMPOSITE'
//   - REACTIVE_AA         = 'REACTIVE_AA'
//   - EXTENSION_FLAGGED   = 'EXTENSION_FLAGGED'
//   - RESOLVING           = 'RESOLVING'
// Tests import DELOAD_STATE direct pentru parity strict cu engine source
// (anti-drift if enum renamed future, batch 6+ lesson preserved).
//
// 3 fixture cases minim cover ADR 026 §9.8 Cluster A-E semantics:
//   1. T0 fresh user no triggers → IDLE state baseline, tier 'LOW',
//      notification_tier=SILENT (T0 anti-friction), depth_pct=0, duration_weeks=0
//   2. T1 Marius scheduled DELOAD week (Periodization phase=DELOAD,
//      deload_window.trigger=CALENDAR) → SCHEDULED_LINEAR state, depth_pct=45,
//      duration_weeks=1, notification_tier=BANNER_DETAILED
//   3. T2 Marius composite trigger (performance drop >15% + rest time >1.5x +
//      RIR mismatch ≥2) → REACTIVE_COMPOSITE state, depth_pct ≥45,
//      intensity_modifier obligatoriu { rir_increment:1, intensity_pct_decrement:12.5 }
//
// Plus 5 edge cases (parity warmupParity precedent):
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (§3.6)
//   - Engine evaluate throws via vi.spyOn → ENGINE_THREW 'hard' severity halt
//     (adapter own try/catch D4 violation insurance per §3.6 taxonomy)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='deload'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 4 pipeline integration tests (8-adapter full chain cumulative — NEW vs
// Warmup 7-adapter chain — TERMINAL closure 8/8):
//   - Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization
//     → Warm-up → Deload full chain end-to-end (8 sub-spans, pipeline §42.10
//     COMPLETE post LANDED)
//   - Constraint Object preserved frozen propagated through entire 8-chain via
//     Energy Hook 4 upstream emission (verify final ctx still has
//     constraintObject post-Deload — Deload doesn't strip; engine
//     forwardConstraintObject returns null V1 dar orchestrator currentCtx chain
//     preserved upstream emission)
//   - Periodization fails hard → ALL 7 downstream skipped (Deload NU invoked)
//   - Warm-up fails hard → Deload skipped (downstream halt cascade ULTIM)
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §3 RESOLVED V1
//      03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.8 + §42.10 TERMINAL
//      src/coach/orchestrator/adapters/deloadAdapter.js
//      src/coach/orchestrator/adapters/warmupAdapter.js (batch 7 precedent verbatim)
//      src/engine/deload/constants.js (DELOAD_STATE + NOTIFICATION_TIER + TRIGGER_SOURCE SSOT)

import { describe, it, expect, vi } from 'vitest';
import * as deloadEngineModule from '../../../engine/deload/index.js';
import { evaluate as evaluateDeload } from '../../../engine/deload/index.js';
import { DELOAD_STATE, NOTIFICATION_TIER, TRIGGER_SOURCE } from '../../../engine/deload/constants.js';
import { deloadAdapter } from '../adapters/deloadAdapter.js';
import { warmupAdapter } from '../adapters/warmupAdapter.js';
import { specializationAdapter } from '../adapters/specializationAdapter.js';
import { tempoAdapter } from '../adapters/tempoAdapter.js';
import { bayesianNutritionAdapter } from '../adapters/bayesianNutritionAdapter.js';
import { energyAdjustmentAdapter } from '../adapters/energyAdjustmentAdapter.js';
import { goalAdaptationAdapter } from '../adapters/goalAdaptationAdapter.js';
import { periodizationAdapter } from '../adapters/periodizationAdapter.js';
import { runPipeline } from '../index.js';
import { buildEngineContext, extendEngineContext } from '../contextBuilder.js';
import { ok, err, isOk } from '../result.js';

// ── Fixtures Constraint Object ──────────────────────────────────────────────

function defaultConstraintObject(phase = 'LOAD', deloadWindow = null) {
  return Object.freeze({
    intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
    volume_per_muscle: {
      chest: { floor: 8, ceiling: 14 },
      back: { floor: 10, ceiling: 18 },
      legs: { floor: 12, ceiling: 20 },
    },
    phase,
    deload_window: deloadWindow,
    immutable_snapshot: true,
  });
}

// ── Fixtures user/session per ADR 026 §9.8 Cluster A-E ──────────────────────

function fixtureT0FreshIdle() {
  return {
    user: { sex: 'M', age: 30, kg: 75, experience: 'beginner', goal: 'forta' },
    recentSessions: [],
    weights: {},
    profileTier: 'T0',
    flags: {},
    meta: {
      persona: 'gigica',
      goalPhase: 'MAINTAIN',
      painButtonActive: false,
      targetMuscleGroups: ['chest'],
      energyDirection: 'NONE',
    },
  };
}

function fixtureT1MariusScheduledDeload() {
  return {
    user: { sex: 'M', age: 25, kg: 80, experience: 'intermediate', goal: 'forta' },
    recentSessions: [],
    weights: { squat: 130, bench: 100, deadlift: 150 },
    profileTier: 'T1',
    flags: {},
    meta: {
      persona: 'marius',
      goalPhase: 'BULK',
      painButtonActive: false,
      targetMuscleGroups: ['chest', 'shoulders'],
      energyDirection: 'NONE',
    },
  };
}

function fixtureT2MariusCompositeTrigger() {
  return {
    user: { sex: 'M', age: 35, kg: 85, experience: 'advanced', goal: 'hipertrofie' },
    recentSessions: [],
    weights: { squat: 150, bench: 120, deadlift: 180 },
    profileTier: 'T2',
    flags: {},
    meta: {
      persona: 'marius',
      goalPhase: 'BULK',
      painButtonActive: false,
      targetMuscleGroups: ['back', 'arms'],
      energyDirection: 'NONE',
      // Composite §36.41 3/3 simultaneous threshold trigger
      performanceDropPct: 20,  // > 15%
      restTimeMultiplier: 1.6, // > 1.5x
      rirMismatch: 3,          // >= 2
    },
  };
}

// ── Fixture for Marius BULK base (pipeline integration upstream + IDLE deload) ──
function fixtureT1MariusBulkBase() {
  return {
    user: { sex: 'M', age: 25, kg: 80, experience: 'intermediate', goal: 'forta' },
    recentSessions: [],
    weights: { squat: 130, bench: 100, deadlift: 150 },
    profileTier: 'T1',
    flags: {},
    meta: {
      persona: 'marius',
      goalPhase: 'BULK',
      painButtonActive: false,
      targetMuscleGroups: ['chest', 'shoulders'],
      energyDirection: 'NONE',
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Deload engine consumes it natively:
 * `meta.periodizationConstraint` populated directly (no orchestrator translation).
 */
function buildLegacyCtx(userState, co) {
  const ctx = buildEngineContext(userState);
  return Object.freeze({
    ...ctx,
    meta: Object.freeze({ ...ctx.meta, periodizationConstraint: co }),
  });
}

/**
 * Build the orchestrated ctx as orchestrator propagates from upstream Energy
 * Adjustment Hook 4 emission: `meta.constraintObject` slot populated, adapter
 * renames la `periodizationConstraint`.
 */
function buildOrchestratedCtx(userState, co) {
  const ctx = buildEngineContext(userState);
  return extendEngineContext(ctx, { constraintObject: co });
}

// ── Golden-master parity ────────────────────────────────────────────────────

describe('Deload Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.8)', () => {
  it('T0 fresh user no triggers → IDLE state baseline, tier LOW, notification_tier SILENT (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT0FreshIdle();
    const co = defaultConstraintObject('LOAD'); // no deload_window → no Linear trigger

    const legacyOutput = await evaluateDeload(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [deloadAdapter]);

    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('deload');
    // No triggers → IDLE baseline (Cluster A1 default)
    expect(orchResults[0].output.meta.deload_state).toBe(DELOAD_STATE.IDLE);
    expect(orchResults[0].output.tier).toBe('LOW'); // tier='LOW' since periodizationConstraint populated
    expect(orchResults[0].output.meta.depth_pct).toBe(0);
    expect(orchResults[0].output.meta.duration_weeks).toBe(0);
    expect(orchResults[0].output.meta.notification_tier).toBe(NOTIFICATION_TIER.SILENT); // T0 anti-friction
    expect(orchResults[0].output.meta.ui_label).toBe('');
    expect(orchResults[0].output.meta.intensity_modifier.rir_increment).toBe(0);
    expect(orchResults[0].output.meta.intensity_modifier.intensity_pct_decrement).toBe(0);
  });

  it('T1 Marius scheduled DELOAD week (Periodization phase=DELOAD + deload_window CALENDAR) → SCHEDULED_LINEAR state, depth 45%, duration 1, banner_detailed (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT1MariusScheduledDeload();
    const co = defaultConstraintObject('DELOAD', { trigger: 'CALENDAR', days: 7 });

    const legacyOutput = await evaluateDeload(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [deloadAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('deload');
    expect(orchResults[0].output.meta.deload_state).toBe(DELOAD_STATE.SCHEDULED_LINEAR);
    expect(orchResults[0].output.tier).toBe('MED'); // SCHEDULED_LINEAR → MED per engine
    expect(orchResults[0].output.meta.depth_pct).toBe(45); // Source 1 verbatim B5 calendar Linear Block
    expect(orchResults[0].output.meta.duration_weeks).toBe(1); // Source 1 verbatim B6 calendar 1 sapt
    expect(orchResults[0].output.meta.notification_tier).toBe(NOTIFICATION_TIER.BANNER_DETAILED); // T1 established
    expect(orchResults[0].output.meta.ui_label).toBe('Saptamana de recuperare');
    // intensity_modifier obligatoriu cand active deload
    expect(orchResults[0].output.meta.intensity_modifier.rir_increment).toBe(1);
    expect(orchResults[0].output.meta.intensity_modifier.intensity_pct_decrement).toBe(12.5);
    // Linear trigger source signal pushed
    expect(orchResults[0].output.signals).toContain('deload_trigger_linear_scheduled_linear');
  });

  it('T2 Marius composite trigger 3/3 simultaneous → REACTIVE_COMPOSITE state, depth ≥45%, intensity_modifier {rir+1, intensity-12.5} (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT2MariusCompositeTrigger();
    const co = defaultConstraintObject('LOAD'); // Periodization LOAD phase, composite metrics trigger reactive

    const legacyOutput = await evaluateDeload(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [deloadAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('deload');
    // Composite > AA > Linear priority — Composite 3/3 wins
    expect(orchResults[0].output.meta.deload_state).toBe(DELOAD_STATE.REACTIVE_COMPOSITE);
    expect(orchResults[0].output.tier).toBe('HIGH'); // REACTIVE_COMPOSITE → HIGH
    // Final_Depth MAX(45,60,30) = 60 per B5 Reactive overrides scheduled (≥45 minimum)
    expect(orchResults[0].output.meta.depth_pct).toBeGreaterThanOrEqual(45);
    // intensity_modifier obligatoriu per B4 Daniel push-back AA-driven mechanic
    expect(orchResults[0].output.meta.intensity_modifier.rir_increment).toBe(1);
    expect(orchResults[0].output.meta.intensity_modifier.intensity_pct_decrement).toBe(12.5);
    // Banner detailed pentru T2 established
    expect(orchResults[0].output.meta.notification_tier).toBe(NOTIFICATION_TIER.BANNER_DETAILED);
    // Composite trigger source signal + hard-disable signal
    expect(orchResults[0].output.signals).toContain('deload_trigger_composite_reactive_composite');
    expect(orchResults[0].output.signals).toContain('composite_signal_36_41_hard_disabled_engine_deload_active_b3_anti_math_collision');
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Deload Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1MariusScheduledDeload();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [deloadAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine evaluate throws via vi.spyOn → ENGINE_THREW err with severity hard (adapter own try/catch D4 violation insurance)', async () => {
    const userState = fixtureT1MariusScheduledDeload();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject('DELOAD', { trigger: 'CALENDAR', days: 7 }));

    const spy = vi.spyOn(deloadEngineModule, 'evaluate').mockRejectedValueOnce(new Error('simulated engine fault for D4 violation insurance'));

    try {
      const results = await runPipeline(ctx, [deloadAdapter]);
      expect(results[0].ok).toBe(false);
      // Adapter's own try/catch wraps engine throw → ENGINE_THREW per §3.6 taxonomy
      expect(results[0].error.code).toBe('ENGINE_THREW');
      expect(results[0].error.severity).toBe('hard');
    } finally {
      spy.mockRestore();
    }
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1MariusScheduledDeload();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject('LOAD'));

    const budgetExceededAdapter = Object.freeze({
      id: 'deload',
      invoke: async () => err({ code: 'BUDGET_EXCEEDED', message: 'over 50ms budget', severity: 'soft' }),
    });
    const downstreamOk = Object.freeze({
      id: 'downstream',
      invoke: async () => ok({ value: 'reached' }),
    });

    const results = await runPipeline(ctx, [budgetExceededAdapter, downstreamOk]);
    expect(results.length).toBe(2);
    expect(results[0].error.code).toBe('BUDGET_EXCEEDED');
    expect(results[0].error.severity).toBe('soft');
    expect(results[1].ok).toBe(true);
  });

  it('telemetry sub-span fires cu adapterId="deload" + durationMs + ok', async () => {
    const userState = fixtureT1MariusScheduledDeload();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject('LOAD'));

    const subSpans = [];
    const results = await runPipeline(ctx, [deloadAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('deload');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1MariusScheduledDeload()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [deloadAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('deload');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization + GoalAdapt + Energy + Bayesian + Tempo + Specialization + Warmup upstream ──

describe('Deload Adapter — Pipeline integration 8-adapter TERMINAL chain (ADR 026 §1.10 + §42.10 sequential FINAL)', () => {
  it('Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization → Warm-up → Deload full 8-chain end-to-end (pipeline §42.10 COMPLETE 8/8 V1)', async () => {
    const userState = fixtureT1MariusBulkBase();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [
        periodizationAdapter,
        goalAdaptationAdapter,
        energyAdjustmentAdapter,
        bayesianNutritionAdapter,
        tempoAdapter,
        specializationAdapter,
        warmupAdapter,
        deloadAdapter,
      ],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(8);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(isOk(results[2])).toBe(true); // Energy Adjustment OK (received CO via Hook 1)
    expect(isOk(results[3])).toBe(true); // Bayesian Nutrition OK (received CO via Hook 1)
    expect(isOk(results[4])).toBe(true); // Tempo OK (received CO via Hook 1)
    expect(isOk(results[5])).toBe(true); // Specialization OK (received CO via Hook 1)
    expect(isOk(results[6])).toBe(true); // Warm-up OK (received CO via Hook D1)
    expect(isOk(results[7])).toBe(true); // Deload OK (received CO via Hook D1) — TERMINAL
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');
    expect(results[2].output.id).toBe('energyAdjustment');
    expect(results[3].output.id).toBe('bayesianNutrition');
    expect(results[4].output.id).toBe('tempo');
    expect(results[5].output.id).toBe('specialization');
    expect(results[6].output.id).toBe('warmup');
    expect(results[7].output.id).toBe('deload');

    // 8 sub-spans all fired — pipeline §42.10 COMPLETE
    expect(subSpans.length).toBe(8);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
    expect(subSpans[2].adapterId).toBe('energyAdjustment');
    expect(subSpans[3].adapterId).toBe('bayesianNutrition');
    expect(subSpans[4].adapterId).toBe('tempo');
    expect(subSpans[5].adapterId).toBe('specialization');
    expect(subSpans[6].adapterId).toBe('warmup');
    expect(subSpans[7].adapterId).toBe('deload');
  });

  it('Constraint Object preserved post-Deload (orchestrator currentCtx chain via Energy Adjustment Hook 4 upstream — Deload NU re-emit, NU strip)', async () => {
    const userState = fixtureT1MariusBulkBase();
    const ctx = buildEngineContext(userState);

    // Inspector adapter checks ctx.meta.constraintObject after Deload
    const spy = vi.fn();
    const inspectorAdapter = Object.freeze({
      id: 'inspector',
      invoke: async (downstreamCtx) => {
        spy(downstreamCtx.meta?.constraintObject);
        return ok({ inspected: true });
      },
    });

    const results = await runPipeline(
      ctx,
      [
        periodizationAdapter,
        goalAdaptationAdapter,
        energyAdjustmentAdapter,
        bayesianNutritionAdapter,
        tempoAdapter,
        specializationAdapter,
        warmupAdapter,
        deloadAdapter,
        inspectorAdapter,
      ],
    );

    expect(results.length).toBe(9);
    expect(isOk(results[8])).toBe(true);

    // Inspector received frozen Constraint Object preserved din upstream Energy
    // Adjustment Hook 4 emission (Deload adapter NU re-emit, dar orchestrator
    // currentCtx chain preserved — Deload doesn't strip)
    expect(spy).toHaveBeenCalledTimes(1);
    const propagatedCO = spy.mock.calls[0][0];
    expect(propagatedCO).toBeTruthy();
    expect(Object.isFrozen(propagatedCO)).toBe(true);
    expect(propagatedCO.immutable_snapshot).toBe(true); // anti-cascade preserved
    expect(propagatedCO.phase).toBeTruthy(); // phase preserved post chain

    // Deload adapter NU expose constraintObject in output (Specialization /
    // Warmup / Tempo / Bayesian / Goal Adaptation pattern, NU Energy Adjustment
    // Hook 4 re-emission pattern). Engine forwardConstraintObject returns null
    // V1 terminal — trace.forwardedConstraint=null.
    const deloadOutput = results[7].output;
    expect(deloadOutput.constraintObject).toBeUndefined();
  });

  it('Periodization fails hard → ALL 7 downstream skipped including Deload TERMINAL (cascade halt §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkBase());

    const failingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated upstream fault', severity: 'hard' }),
    });

    const goalAdSpy = vi.fn(goalAdaptationAdapter.invoke.bind(goalAdaptationAdapter));
    const energySpy = vi.fn(energyAdjustmentAdapter.invoke.bind(energyAdjustmentAdapter));
    const bayesianSpy = vi.fn(bayesianNutritionAdapter.invoke.bind(bayesianNutritionAdapter));
    const tempoSpy = vi.fn(tempoAdapter.invoke.bind(tempoAdapter));
    const specializationSpy = vi.fn(specializationAdapter.invoke.bind(specializationAdapter));
    const warmupSpy = vi.fn(warmupAdapter.invoke.bind(warmupAdapter));
    const deloadSpy = vi.fn(deloadAdapter.invoke.bind(deloadAdapter));

    const results = await runPipeline(ctx, [
      failingPeriodAdapter,
      Object.freeze({ id: 'goalAdaptation', invoke: goalAdSpy }),
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
      Object.freeze({ id: 'bayesianNutrition', invoke: bayesianSpy }),
      Object.freeze({ id: 'tempo', invoke: tempoSpy }),
      Object.freeze({ id: 'specialization', invoke: specializationSpy }),
      Object.freeze({ id: 'warmup', invoke: warmupSpy }),
      Object.freeze({ id: 'deload', invoke: deloadSpy }),
    ]);

    expect(results.length).toBe(1); // halted dupa Periodization hard fail
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdSpy).not.toHaveBeenCalled();
    expect(energySpy).not.toHaveBeenCalled();
    expect(bayesianSpy).not.toHaveBeenCalled();
    expect(tempoSpy).not.toHaveBeenCalled();
    expect(specializationSpy).not.toHaveBeenCalled();
    expect(warmupSpy).not.toHaveBeenCalled();
    expect(deloadSpy).not.toHaveBeenCalled();
  });

  it('Warm-up fails hard mid-pipeline → Deload TERMINAL skipped (downstream halt cascade ULTIM)', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkBase());

    const failingWarmupAdapter = Object.freeze({
      id: 'warmup',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated mid-pipeline fault', severity: 'hard' }),
    });

    const deloadSpy = vi.fn(deloadAdapter.invoke.bind(deloadAdapter));

    const results = await runPipeline(ctx, [
      periodizationAdapter,
      goalAdaptationAdapter,
      energyAdjustmentAdapter,
      bayesianNutritionAdapter,
      tempoAdapter,
      specializationAdapter,
      failingWarmupAdapter,
      Object.freeze({ id: 'deload', invoke: deloadSpy }),
    ]);

    expect(results.length).toBe(7); // Periodization OK + Goal OK + Energy OK + Bayesian OK + Tempo OK + Specialization OK + Warmup hard halt
    expect(isOk(results[0])).toBe(true);
    expect(isOk(results[1])).toBe(true);
    expect(isOk(results[2])).toBe(true);
    expect(isOk(results[3])).toBe(true);
    expect(isOk(results[4])).toBe(true);
    expect(isOk(results[5])).toBe(true);
    expect(results[6].ok).toBe(false);
    expect(results[6].error.severity).toBe('hard');
    expect(deloadSpy).not.toHaveBeenCalled();
  });
});

// Anti-dead-code: ensure all enum imports used (anti-drift sanity)
describe('Deload Adapter — Enum import anti-drift sanity', () => {
  it('TRIGGER_SOURCE enum + DELOAD_STATE enum imported from constants.js are live (NU dead imports)', () => {
    expect(typeof TRIGGER_SOURCE.COMPOSITE).toBe('string');
    expect(typeof DELOAD_STATE.IDLE).toBe('string');
  });
});
