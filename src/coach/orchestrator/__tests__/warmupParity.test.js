// Warm-up Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 7 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #7): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation (cu `meta.periodizationConstraint`
// already provided) and orchestrated `runPipeline(ctx, [warmupAdapter])` path
// (cu `meta.constraintObject` propagated, adapter does D2 shape mapping rename
// to engine-expected `meta.periodizationConstraint`).
//
// **Sixth downstream Constraint Object consumer (read-only Hook D1 convention,
// NU re-emit Hook 4 — engine doesn't emit `meta.forward_constraint_object`).**
// Pattern follows Specialization batch 6 + Tempo batch 5 + Bayesian Nutrition
// batch 4 + Goal Adaptation batch 2 precedents (consume read-only, NU re-surface),
// DIVERGENT vs Energy Adjustment batch 3 Hook 4 explicit re-emission.
//
// Field name mapping verdict (per §0 prompt + pre-flight grep filesystem):
//   Engine reads `meta.periodizationConstraint` (same convention batches 2-6) —
//   adapter rename `meta.constraintObject` → `meta.periodizationConstraint`
//   (engine source line 187). Engine output blueprint = `{ warmup_state,
//   duration_min, routine_type, general_sets (count), general_sets_list,
//   specific_sets (count), specific_sets_list, target_muscle_groups,
//   skip_available, cooldown_state, ui_label, signals }` — 12 fields în meta —
//   NU include `forward_constraint_object` (only `trace.forwardedConstraint`
//   boolean flag). Adapter NU re-surface `output.constraintObject`.
//
// **WARMUP_STATE enum actual** (per `src/engine/warmup/constants.js`
// WARMUP_STATE export — values are simple uppercase keys, NOT descriptive
// snake_case strings):
//   - ACTIVE          = 'ACTIVE'
//   - SKIPPED         = 'SKIPPED'
//   - DELOAD_LIGHTER  = 'DELOAD_LIGHTER'
//   - INJURY_DISABLED = 'INJURY_DISABLED'
// Tests import WARMUP_STATE direct pentru parity strict cu engine source
// (anti-drift if enum renamed future, batch 6 lesson preserved).
//
// **T0 Instant Skip default semantics (§65.3 Source 1 Option A):**
// SkipDecision returns `t0InstantSkipDefault: true` în trace metadata, dar
// warmup_state STAYS ACTIVE pentru T0 fresh user fără explicit `userOptedSkip:
// true` (anti-paternalism ADR 025 — engine pre-fills, user keeps autonomy).
// `skip_available` boolean = true ALWAYS V1 (buton vizibil session 1).
//
// **Persona-aware duration thresholds (Cluster B3 §45.6.3 verbatim):**
//   Maria 65: range 5-10 → midpoint 8 (ACTIVE no Energy DOWN)
//   Gigica 35: range 5-7 → midpoint 6
//   Marius 25: range 8-10 → midpoint 9 (ACTIVE no Energy DOWN)
//   Energy DOWN auto-shorten: upper clamped to 7 (anti-cascade Cluster D3)
//   DELOAD: upper clamped to 7 (lighter routine Cluster D1)
//
// 3 fixture cases minim cover ADR 026 §9.7 Cluster A-E persona-aware semantics:
//   1. T0 Maria fresh user — default ACTIVE (T0 Instant Skip = trace flag, NU
//      auto SKIPPED state per anti-paternalism). skip_available=true.
//      duration_min = 8 (Maria 5-10 midpoint). Confirms §65.3 Option A.
//   2. T1 Marius Bulk active expanded routine — ACTIVE state, hybrid routine,
//      Marius range 8-10 midpoint 9. cooldown_state.offered=true (post-session
//      §65.4 OVERRIDE Q4). ui_label "Încălzire ~9 min" RO native.
//   3. T2 Marius Deload week + Energy DOWN auto-shorten D3 — DELOAD_LIGHTER
//      state (priority over Energy DOWN), Marius range clamped 7. tier 'MED'.
//
// Plus 5 edge cases:
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (§3.6 fail-safe)
//   - Engine throws → ADAPTER_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='warmup'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 4 pipeline integration tests (7-adapter chain cumulative — NEW vs
// Specialization 6-adapter chain):
//   - Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization
//     → Warm-up full chain frozen propagation end-to-end (7 sub-spans)
//   - Constraint Object preserved frozen downstream after Warm-up (orchestrator
//     chain via Energy Adjustment Hook 4 upstream, NU re-emitted by Warm-up)
//   - Periodization fails hard → cascade halt: ALL 6 downstream skipped
//   - Specialization fails hard → Warm-up skipped (downstream halt cascade)
//
// See: 03-decisions/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/coach/orchestrator/adapters/warmupAdapter.js
//      src/coach/orchestrator/adapters/specializationAdapter.js (batch 6 precedent)
//      src/engine/warmup/constants.js (WARMUP_STATE enum SSOT)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluateWarmup } from '../../../engine/warmup/index.js';
import { WARMUP_STATE } from '../../../engine/warmup/constants.js';
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

function defaultConstraintObject(phase = 'LOAD') {
  return Object.freeze({
    intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
    volume_per_muscle: {
      chest: { floor: 8, ceiling: 14 },
      back: { floor: 10, ceiling: 18 },
      legs: { floor: 12, ceiling: 20 },
    },
    phase,
    deload_window: null,
    immutable_snapshot: true,
  });
}

// ── Fixtures user/session per ADR 026 §9.7 Cluster A-E persona thresholds ──

function fixtureT0MariaFresh() {
  return {
    user: { sex: 'F', age: 65, kg: 60, experience: 'beginner', goal: 'forta' },
    recentSessions: [],
    weights: {},
    profileTier: 'T0',
    flags: {},
    meta: {
      persona: 'maria', // Maria 65 mobility flow 5-10 min
      goalPhase: 'CUT',
      painButtonActive: false,
      targetMuscleGroups: ['legs', 'glutes'],
      energyDirection: 'NONE',
    },
  };
}

function fixtureT1MariusBulkActive() {
  return {
    user: { sex: 'M', age: 25, kg: 80, experience: 'intermediate', goal: 'forta' },
    recentSessions: [],
    weights: { squat: 130, bench: 100, deadlift: 150 },
    profileTier: 'T1',
    flags: {},
    meta: {
      persona: 'marius', // Marius 25 ramp 50/70/90% range 8-10 min
      goalPhase: 'BULK',
      painButtonActive: false,
      targetMuscleGroups: ['chest', 'shoulders'],
      energyDirection: 'NONE',
    },
  };
}

function fixtureT2MariusDeloadEnergyDown() {
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
      energyDirection: 'DOWN', // D3 auto-shorten anti-cascade
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Warm-up engine consumes it natively:
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

describe('Warm-up Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.7)', () => {
  it('T0 Maria fresh user — default ACTIVE state (T0 Instant Skip = SkipDecision metadata flag, NU auto-SKIPPED per anti-paternalism ADR 025) (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT0MariaFresh();
    const co = defaultConstraintObject('LOAD');

    const legacyOutput = await evaluateWarmup(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [warmupAdapter]);

    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('warmup');
    // T0 Maria fresh user fără userOptedSkip → default ACTIVE state (engine
    // anti-paternalism ADR 025 — engine pre-fills, user keeps autonomy).
    expect(orchResults[0].output.meta.warmup_state).toBe(WARMUP_STATE.ACTIVE);
    expect(orchResults[0].output.tier).toBe('HIGH'); // ACTIVE → HIGH per engine line 313-316
    // skip_available always true V1 (Source 1 §65.3 Option A buton vizibil session 1)
    expect(orchResults[0].output.meta.skip_available).toBe(true);
    // Maria 65 mobility flow 5-10 min → midpoint 8
    expect(orchResults[0].output.meta.duration_min).toBe(8);
    expect(orchResults[0].output.meta.routine_type).toBe('hybrid'); // V1 LOCKED Q65.2 Option C
    expect(orchResults[0].output.meta.ui_label).toBe('Încălzire ~8 min');
  });

  it('T1 Marius Bulk active expanded routine — ACTIVE hybrid Marius 8-10 range midpoint 9 (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT1MariusBulkActive();
    const co = defaultConstraintObject('LOAD');

    const legacyOutput = await evaluateWarmup(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [warmupAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('warmup');
    expect(orchResults[0].output.meta.warmup_state).toBe(WARMUP_STATE.ACTIVE);
    expect(orchResults[0].output.tier).toBe('HIGH');
    // Marius 25 range 8-10 midpoint 9 (no Energy DOWN no DELOAD)
    expect(orchResults[0].output.meta.duration_min).toBe(9);
    expect(orchResults[0].output.meta.routine_type).toBe('hybrid');
    // Hybrid 1-2 general + 2-3 specific (Cluster B2 §65.2 Option C)
    expect(orchResults[0].output.meta.general_sets).toBeGreaterThanOrEqual(1);
    expect(orchResults[0].output.meta.general_sets).toBeLessThanOrEqual(2);
    expect(orchResults[0].output.meta.general_sets_list.length).toBe(orchResults[0].output.meta.general_sets);
    expect(orchResults[0].output.meta.specific_sets).toBeGreaterThanOrEqual(0);
    expect(orchResults[0].output.meta.specific_sets).toBeLessThanOrEqual(3);
    // Cooldown offered post-session (§65.4 OVERRIDE Q4 Source 1 supersedes defer)
    expect(orchResults[0].output.meta.cooldown_state.offered).toBe(true);
    expect(orchResults[0].output.meta.cooldown_state.content).toBe('text-only');
    expect(orchResults[0].output.meta.cooldown_state.durationMin).toBe(2);
    // ui_label RO native "Încălzire ~9 min"
    expect(orchResults[0].output.meta.ui_label).toBe('Încălzire ~9 min');
  });

  it('T2 Marius Deload week + Energy DOWN auto-shorten D3 → DELOAD_LIGHTER (priority over Energy DOWN per Cluster A1 priority order) (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT2MariusDeloadEnergyDown();
    const co = defaultConstraintObject('DELOAD'); // Periodization phase = DELOAD

    const legacyOutput = await evaluateWarmup(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [warmupAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('warmup');
    // Cluster A1 priority: DELOAD > Energy DOWN modulation
    expect(orchResults[0].output.meta.warmup_state).toBe(WARMUP_STATE.DELOAD_LIGHTER);
    expect(orchResults[0].output.tier).toBe('MED'); // DELOAD_LIGHTER → MED per engine line 313-314
    // Marius 8-10 with DELOAD upper clamp 7 + Energy DOWN clamp 7 → lowerBound>upper → snap to 7
    expect(orchResults[0].output.meta.duration_min).toBe(7);
    // DELOAD signal pushed
    expect(orchResults[0].output.signals).toContain('warmup_deload_lighter_d1_periodization_recovery_week');
    // Energy DOWN auto-shorten signal also pushed
    expect(orchResults[0].output.signals).toContain('warmup_energy_down_auto_shorten_d3_anti_cascade');
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Warm-up Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1MariusBulkActive();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [warmupAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine throws → ADAPTER_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1MariusBulkActive();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject('LOAD'));

    const throwingWarmupAdapter = Object.freeze({
      id: 'warmup',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingWarmupAdapter]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1MariusBulkActive();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject('LOAD'));

    const budgetExceededAdapter = Object.freeze({
      id: 'warmup',
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

  it('telemetry sub-span fires cu adapterId="warmup" + durationMs + ok', async () => {
    const userState = fixtureT1MariusBulkActive();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject('LOAD'));

    const subSpans = [];
    const results = await runPipeline(ctx, [warmupAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('warmup');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkActive()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [warmupAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('warmup');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization + GoalAdapt + Energy + Bayesian + Tempo + Specialization upstream ──

describe('Warm-up Adapter — Pipeline integration 7-adapter chain (ADR 026 §1.10 sequential)', () => {
  it('Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization → Warm-up full chain Constraint Object frozen propagation end-to-end', async () => {
    const userState = fixtureT1MariusBulkActive();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, tempoAdapter, specializationAdapter, warmupAdapter],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(7);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(isOk(results[2])).toBe(true); // Energy Adjustment OK (received CO via Hook 1)
    expect(isOk(results[3])).toBe(true); // Bayesian Nutrition OK (received CO via Hook 1)
    expect(isOk(results[4])).toBe(true); // Tempo OK (received CO via Hook 1)
    expect(isOk(results[5])).toBe(true); // Specialization OK (received CO via Hook 1)
    expect(isOk(results[6])).toBe(true); // Warm-up OK (received CO via Hook D1)
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');
    expect(results[2].output.id).toBe('energyAdjustment');
    expect(results[3].output.id).toBe('bayesianNutrition');
    expect(results[4].output.id).toBe('tempo');
    expect(results[5].output.id).toBe('specialization');
    expect(results[6].output.id).toBe('warmup');

    // 7 sub-spans all fired
    expect(subSpans.length).toBe(7);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
    expect(subSpans[2].adapterId).toBe('energyAdjustment');
    expect(subSpans[3].adapterId).toBe('bayesianNutrition');
    expect(subSpans[4].adapterId).toBe('tempo');
    expect(subSpans[5].adapterId).toBe('specialization');
    expect(subSpans[6].adapterId).toBe('warmup');
  });

  it('Constraint Object surfaced post Warm-up for downstream propagation (preserved din Energy Adjustment Hook 4 via orchestrator currentCtx chain)', async () => {
    const userState = fixtureT1MariusBulkActive();
    const ctx = buildEngineContext(userState);

    // Inspector adapter checks ctx.meta.constraintObject after Warm-up
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
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, tempoAdapter, specializationAdapter, warmupAdapter, inspectorAdapter],
    );

    expect(results.length).toBe(8);
    expect(isOk(results[7])).toBe(true);

    // Inspector received frozen Constraint Object preserved din upstream
    // Energy Adjustment Hook 4 emission (Warm-up adapter NU re-emit, dar
    // orchestrator currentCtx chain preserved)
    expect(spy).toHaveBeenCalledTimes(1);
    const propagatedCO = spy.mock.calls[0][0];
    expect(propagatedCO).toBeTruthy();
    expect(Object.isFrozen(propagatedCO)).toBe(true);
    expect(propagatedCO.immutable_snapshot).toBe(true); // anti-cascade preserved
    expect(propagatedCO.phase).toBeTruthy(); // phase preserved post chain

    // Warm-up adapter NU expose constraintObject în output (Specialization /
    // Tempo / Bayesian Nutrition / Goal Adaptation pattern, NU Energy Adjustment
    // Hook 4 re-emission pattern)
    const warmupOutput = results[6].output;
    expect(warmupOutput.constraintObject).toBeUndefined();
  });

  it('Periodization fails hard → ALL 6 downstream skipped (cascade halt §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkActive());

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

    const results = await runPipeline(ctx, [
      failingPeriodAdapter,
      Object.freeze({ id: 'goalAdaptation', invoke: goalAdSpy }),
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
      Object.freeze({ id: 'bayesianNutrition', invoke: bayesianSpy }),
      Object.freeze({ id: 'tempo', invoke: tempoSpy }),
      Object.freeze({ id: 'specialization', invoke: specializationSpy }),
      Object.freeze({ id: 'warmup', invoke: warmupSpy }),
    ]);

    expect(results.length).toBe(1); // halted după Periodization hard fail
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdSpy).not.toHaveBeenCalled();
    expect(energySpy).not.toHaveBeenCalled();
    expect(bayesianSpy).not.toHaveBeenCalled();
    expect(tempoSpy).not.toHaveBeenCalled();
    expect(specializationSpy).not.toHaveBeenCalled();
    expect(warmupSpy).not.toHaveBeenCalled();
  });

  it('Specialization fails hard mid-pipeline → Warm-up skipped (downstream halt cascade)', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkActive());

    const failingSpecializationAdapter = Object.freeze({
      id: 'specialization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated mid-pipeline fault', severity: 'hard' }),
    });

    const warmupSpy = vi.fn(warmupAdapter.invoke.bind(warmupAdapter));

    const results = await runPipeline(ctx, [
      periodizationAdapter,
      goalAdaptationAdapter,
      energyAdjustmentAdapter,
      bayesianNutritionAdapter,
      tempoAdapter,
      failingSpecializationAdapter,
      Object.freeze({ id: 'warmup', invoke: warmupSpy }),
    ]);

    expect(results.length).toBe(6); // Periodization OK + Goal OK + Energy OK + Bayesian OK + Tempo OK + Specialization hard halt
    expect(isOk(results[0])).toBe(true);
    expect(isOk(results[1])).toBe(true);
    expect(isOk(results[2])).toBe(true);
    expect(isOk(results[3])).toBe(true);
    expect(isOk(results[4])).toBe(true);
    expect(results[5].ok).toBe(false);
    expect(results[5].error.severity).toBe('hard');
    expect(warmupSpy).not.toHaveBeenCalled();
  });
});
