// Specialization Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 6 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #6): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation (cu `meta.periodizationConstraint`
// already provided) and orchestrated `runPipeline(ctx, [specializationAdapter])`
// path (cu `meta.constraintObject` propagated, adapter does D2 shape mapping
// rename to engine-expected `meta.periodizationConstraint`).
//
// **Fifth downstream Constraint Object consumer (read-only Hook 1 convention,
// NU re-emit Hook 4 — engine doesn't emit `meta.forward_constraint_object`).**
// Pattern follows Tempo batch 5 + Bayesian Nutrition batch 4 + Goal Adaptation
// batch 2 precedents (consume read-only, NU re-surface), DIVERGENT vs Energy
// Adjustment batch 3 Hook 4 explicit re-emission.
//
// Field name mapping verdict (per §0 prompt + pre-flight grep filesystem):
//   Engine reads `meta.periodizationConstraint` (same convention batches 2-5)
//   — adapter rename `meta.constraintObject` → `meta.periodizationConstraint`
//   (engine source line 185). Engine output blueprint = `{ activation_state,
//   target_muscle_group, mesocycle_progress, volume_modifier, ui_label,
//   cooldown_state, signals }` — NU include `forward_constraint_object` (only
//   `trace.forwardedConstraint` boolean flag). Adapter NU re-surface
//   `output.constraintObject`.
//
// **Activation state enum actual** (per `src/engine/specialization/constants.js`
// ACTIVATION_STATE export — values are descriptive snake_case strings):
//   - INELIGIBLE_NOT_MARIUS = 'ineligible_not_marius_persona_q12_locked'
//   - INELIGIBLE_NOT_ADVANCED = 'ineligible_not_advanced_tier_t0_calibration_window'
//   - INELIGIBLE_PHASE_GATE = 'ineligible_phase_gate_cut_or_maintain_q5_d_dual_safety'
//   - INELIGIBLE_INJURY_OVERRIDE / INELIGIBLE_NO_LAGGING / INELIGIBLE_COOLDOWN
//   - PROPOSAL_PENDING / ACTIVE / COMPLETED_EXIT
// Discrepancy noted vs prompt §4 names (e.g., `INELIGIBLE_PERSONA`/`INELIGIBLE_TIER`/
// `INELIGIBLE_PHASE`/`IN_COOLDOWN` — engine uses different naming). Tests
// import ACTIVATION_STATE direct pentru parity strict cu engine source.
//
// 3 fixture cases minim cover ADR 026 §9.6 Cluster A activation gating CRITICAL:
//   1. T1 Maria persona INELIGIBLE_NOT_MARIUS (Q12 §45.3 LOCKED Marius-ONLY gate)
//   2. T1 Marius Bulk + lagging shoulders detected → PROPOSAL_PENDING (Q15=B
//      anti-paternalism propose NU auto-activate)
//   3. T2 Marius Cut → INELIGIBLE_PHASE_GATE (Q5=D + Q13=A dual safety Cut DISABLE)
//
// Plus 5 edge cases:
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (per §3.6 fail-safe)
//   - Engine throws → ADAPTER_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='specialization'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 4 pipeline integration tests (6-adapter chain cumulative — NEW vs Tempo
// 5-adapter chain):
//   - Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization
//     full chain frozen propagation end-to-end (6 sub-spans)
//   - Constraint Object preserved frozen downstream after Specialization
//     (orchestrator chain via Energy Adjustment Hook 4 upstream, NU re-emitted)
//   - Periodization fails hard → cascade halt: ALL 5 downstream skipped
//   - Tempo fails hard → Specialization skipped (downstream halt cascade)
//
// See: 03-decisions/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/coach/orchestrator/adapters/specializationAdapter.js
//      src/coach/orchestrator/adapters/tempoAdapter.js (batch 5 precedent)
//      src/engine/specialization/constants.js (ACTIVATION_STATE enum SSOT)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluateSpecialization } from '../../../engine/specialization/index.js';
import { ACTIVATION_STATE } from '../../../engine/specialization/constants.js';
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

function defaultConstraintObject() {
  return Object.freeze({
    intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
    volume_per_muscle: {
      chest: { floor: 8, ceiling: 14 },
      back: { floor: 10, ceiling: 18 },
      legs: { floor: 12, ceiling: 20 },
    },
    phase: 'LOAD',
    deload_window: null,
    immutable_snapshot: true,
  });
}

// ── Fixture logs producing top weak group = "shoulders" ─────────────────────
//
// Brzycki 1RM = w × (36 / (37 - reps)). Reps in [1..12].
// Logs designed so 1RM avg distribution flags shoulders as ratio < 0.8.
//
// chest (bench_press 100×5)   ≈ 112.5
// back  (barbell_row 95×5)    ≈ 106.875
// legs  (squat 130×5)         ≈ 146.25
// shoulders (ohp 50×5)        ≈ 56.25
// avg ≈ 105.47 → shoulders ratio ≈ 0.53 < 0.8 weak ✓ (others all > 0.8)

function fixtureWeaknessLogsShoulders() {
  return [
    { ex: 'bench_press', w: 100, reps: 5 },
    { ex: 'barbell_row', w: 95, reps: 5 },
    { ex: 'squat', w: 130, reps: 5 },
    { ex: 'ohp', w: 50, reps: 5 },
  ];
}

// ── Fixtures user/session per ADR 026 §9.6 Cluster A activation gating ──────

function fixtureT1MariaPersona() {
  return {
    user: { sex: 'F', age: 65, kg: 60, experience: 'beginner', goal: 'forta' },
    recentSessions: [],
    weights: {},
    profileTier: 'T1',
    flags: {},
    meta: {
      persona: 'maria', // Q12 §45.3 LOCKED — Maria NU eligible V1
      goalPhase: 'BULK',
      painButtonActive: false,
    },
  };
}

function fixtureT1MariusBulkLaggingShoulders() {
  const logs = fixtureWeaknessLogsShoulders();
  return {
    user: { sex: 'M', age: 30, kg: 80, experience: 'intermediate', goal: 'forta' },
    recentSessions: [],
    weights: { squat: 130, bench: 100, deadlift: 150 },
    profileTier: 'T1',
    flags: {},
    meta: {
      persona: 'marius',
      goalPhase: 'BULK', // eligible Q5=D + Q13=A
      painButtonActive: false, // no injury
      lifetimeLogs: logs,
      recentLogs: logs, // same logs → consensus aligned
      cooldownHistory: {}, // no cooldown
      nowMs: 1714780800000, // 2026-05-04
      userProposalAccepted: null, // pending Q15=B
      periodizationPhase: 'LOAD',
      energyDirection: 'NONE',
      energyDownRecurrent: false,
      specializationWeeksElapsed: 0,
    },
  };
}

function fixtureT2MariusCut() {
  return {
    user: { sex: 'M', age: 35, kg: 85, experience: 'advanced', goal: 'hipertrofie' },
    recentSessions: [],
    weights: { squat: 150, bench: 120, deadlift: 180 },
    profileTier: 'T2',
    flags: {},
    meta: {
      persona: 'marius',
      goalPhase: 'CUT', // Q5=D + Q13=A dual safety gate Cut DISABLE
      painButtonActive: false,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Specialization engine consumes it natively:
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

describe('Specialization Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.6)', () => {
  it('T1 Maria persona → INELIGIBLE_NOT_MARIUS (Q12 §45.3 LOCKED Marius-ONLY) (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT1MariaPersona();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateSpecialization(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [specializationAdapter]);

    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('specialization');
    expect(orchResults[0].output.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
    // Ineligible early-return → target_muscle_group null + zero modifier
    expect(orchResults[0].output.meta.target_muscle_group).toBe(null);
    expect(orchResults[0].output.meta.volume_modifier.volumeIncreasePct).toBe(0);
    // Persona gate signal pushed
    expect(orchResults[0].output.signals).toContain(`specialization_${ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS}`);
  });

  it('T1 Marius Bulk + lagging shoulders detected → PROPOSAL_PENDING (Q15=B anti-paternalism) (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateSpecialization(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [specializationAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('specialization');
    expect(orchResults[0].output.meta.activation_state).toBe(ACTIVATION_STATE.PROPOSAL_PENDING);
    expect(orchResults[0].output.meta.target_muscle_group).toBe('shoulders');
    // ui_label RO native "Bloc focus Umeri" Q17=C
    expect(orchResults[0].output.meta.ui_label).toBe('Bloc focus Umeri');
    // Pre-acceptance: NU active → modifier zero
    expect(orchResults[0].output.meta.volume_modifier.volumeIncreasePct).toBe(0);
    expect(orchResults[0].output.meta.mesocycle_progress.exiting).toBe(false);
    // tier 'MED' for PROPOSAL_PENDING per engine line 397-399
    expect(orchResults[0].output.tier).toBe('MED');
  });

  it('T2 Marius Cut → INELIGIBLE_PHASE_GATE (Q5=D + Q13=A dual safety Cut DISABLE) (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT2MariusCut();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateSpecialization(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [specializationAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('specialization');
    expect(orchResults[0].output.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_PHASE_GATE);
    // No weakness detection (no logs) → target_muscle_group null
    expect(orchResults[0].output.meta.target_muscle_group).toBe(null);
    // Cut Disable signal emitted Q5=D + Q13=A dual safety
    expect(orchResults[0].output.signals).toContain('specialization_cut_disable_q5_d_q13_a_dual_safety_gate');
    expect(orchResults[0].output.signals).toContain(`specialization_${ACTIVATION_STATE.INELIGIBLE_PHASE_GATE}`);
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Specialization Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [specializationAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine throws → ADAPTER_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const throwingSpecializationAdapter = Object.freeze({
      id: 'specialization',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingSpecializationAdapter]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const budgetExceededAdapter = Object.freeze({
      id: 'specialization',
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

  it('telemetry sub-span fires cu adapterId="specialization" + durationMs + ok', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const subSpans = [];
    const results = await runPipeline(ctx, [specializationAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('specialization');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkLaggingShoulders()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [specializationAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('specialization');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization + GoalAdapt + Energy + Bayesian + Tempo upstream ──

describe('Specialization Adapter — Pipeline integration 6-adapter chain (ADR 026 §1.10 sequential)', () => {
  it('Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization full chain Constraint Object frozen propagation end-to-end', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, tempoAdapter, specializationAdapter],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(6);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(isOk(results[2])).toBe(true); // Energy Adjustment OK (received CO via Hook 1)
    expect(isOk(results[3])).toBe(true); // Bayesian Nutrition OK (received CO via Hook 1)
    expect(isOk(results[4])).toBe(true); // Tempo OK (received CO via Hook 1)
    expect(isOk(results[5])).toBe(true); // Specialization OK (received CO via Hook 1)
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');
    expect(results[2].output.id).toBe('energyAdjustment');
    expect(results[3].output.id).toBe('bayesianNutrition');
    expect(results[4].output.id).toBe('tempo');
    expect(results[5].output.id).toBe('specialization');

    // 6 sub-spans all fired
    expect(subSpans.length).toBe(6);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
    expect(subSpans[2].adapterId).toBe('energyAdjustment');
    expect(subSpans[3].adapterId).toBe('bayesianNutrition');
    expect(subSpans[4].adapterId).toBe('tempo');
    expect(subSpans[5].adapterId).toBe('specialization');
  });

  it('Constraint Object surfaced post Specialization for downstream propagation (preserved din Energy Adjustment Hook 4 via orchestrator currentCtx chain)', async () => {
    const userState = fixtureT1MariusBulkLaggingShoulders();
    const ctx = buildEngineContext(userState);

    // Inspector adapter checks ctx.meta.constraintObject after Specialization
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
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, tempoAdapter, specializationAdapter, inspectorAdapter],
    );

    expect(results.length).toBe(7);
    expect(isOk(results[6])).toBe(true);

    // Inspector received frozen Constraint Object preserved din upstream
    // Energy Adjustment Hook 4 emission (Specialization adapter NU re-emit, dar
    // orchestrator currentCtx chain preserved)
    expect(spy).toHaveBeenCalledTimes(1);
    const propagatedCO = spy.mock.calls[0][0];
    expect(propagatedCO).toBeTruthy();
    expect(Object.isFrozen(propagatedCO)).toBe(true);
    expect(propagatedCO.immutable_snapshot).toBe(true); // anti-cascade preserved
    expect(propagatedCO.phase).toBeTruthy(); // phase preserved post chain

    // Specialization adapter NU expose constraintObject in output (Tempo /
    // Bayesian Nutrition / Goal Adaptation pattern, NU Energy Adjustment Hook
    // 4 re-emission pattern)
    const specializationOutput = results[5].output;
    expect(specializationOutput.constraintObject).toBeUndefined();
  });

  it('Periodization fails hard → ALL 5 downstream skipped (cascade halt §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkLaggingShoulders());

    const failingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated upstream fault', severity: 'hard' }),
    });

    const goalAdSpy = vi.fn(goalAdaptationAdapter.invoke.bind(goalAdaptationAdapter));
    const energySpy = vi.fn(energyAdjustmentAdapter.invoke.bind(energyAdjustmentAdapter));
    const bayesianSpy = vi.fn(bayesianNutritionAdapter.invoke.bind(bayesianNutritionAdapter));
    const tempoSpy = vi.fn(tempoAdapter.invoke.bind(tempoAdapter));
    const specializationSpy = vi.fn(specializationAdapter.invoke.bind(specializationAdapter));

    const results = await runPipeline(ctx, [
      failingPeriodAdapter,
      Object.freeze({ id: 'goalAdaptation', invoke: goalAdSpy }),
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
      Object.freeze({ id: 'bayesianNutrition', invoke: bayesianSpy }),
      Object.freeze({ id: 'tempo', invoke: tempoSpy }),
      Object.freeze({ id: 'specialization', invoke: specializationSpy }),
    ]);

    expect(results.length).toBe(1); // halted dupa Periodization hard fail
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdSpy).not.toHaveBeenCalled();
    expect(energySpy).not.toHaveBeenCalled();
    expect(bayesianSpy).not.toHaveBeenCalled();
    expect(tempoSpy).not.toHaveBeenCalled();
    expect(specializationSpy).not.toHaveBeenCalled();
  });

  it('Tempo fails hard mid-pipeline → Specialization skipped (downstream halt cascade)', async () => {
    const ctx = buildEngineContext(fixtureT1MariusBulkLaggingShoulders());

    const failingTempoAdapter = Object.freeze({
      id: 'tempo',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated mid-pipeline fault', severity: 'hard' }),
    });

    const specializationSpy = vi.fn(specializationAdapter.invoke.bind(specializationAdapter));

    const results = await runPipeline(ctx, [
      periodizationAdapter,
      goalAdaptationAdapter,
      energyAdjustmentAdapter,
      bayesianNutritionAdapter,
      failingTempoAdapter,
      Object.freeze({ id: 'specialization', invoke: specializationSpy }),
    ]);

    expect(results.length).toBe(5); // Periodization OK + Goal OK + Energy OK + Bayesian OK + Tempo hard halt
    expect(isOk(results[0])).toBe(true);
    expect(isOk(results[1])).toBe(true);
    expect(isOk(results[2])).toBe(true);
    expect(isOk(results[3])).toBe(true);
    expect(results[4].ok).toBe(false);
    expect(results[4].error.severity).toBe('hard');
    expect(specializationSpy).not.toHaveBeenCalled();
  });
});
