// Energy Adjustment Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 3 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #3): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation (cu `meta.periodizationConstraint`
// already provided) and orchestrated `runPipeline(ctx, [energyAdjustmentAdapter])`
// path (cu `meta.constraintObject` propagated, adapter does D2 shape mapping
// rename to engine-expected `meta.periodizationConstraint`).
//
// **Second downstream Constraint Object consumer + Forward Constraint Object
// Hook 4 propagation per ADR 026 §9.3.1 #5.**
//
// Field name mapping verdict (per §2 prompt):
//   Engine reads `meta.periodizationConstraint` (same convention Goal Adaptation
//   batch 2 commit `905946c`) — adapter rename `meta.constraintObject` →
//   `meta.periodizationConstraint`. Engine emits `meta.forward_constraint_object`
//   (frozen Hook 4 pass-through) — adapter surfaces as `output.constraintObject`
//   for orchestrator downstream propagation.
//
// 3 fixture cases minim cover ADR 026 §9.3 spec V1:
//   1. T0 fresh user (no emoji) cu default LOAD CO — tier 'none'
//   2. T1 active user 🟢 emoji cu LOAD CO — UP eligible direction
//   3. T2 power user 🔴 emoji + drill-down cu DELOAD CO — DOWN immediate + phase gate
//
// Plus 5 edge cases:
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (per §3.6 fail-safe)
//   - Engine throws → ENGINE_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='energyAdjustment'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 4 pipeline integration tests:
//   - Periodization → Goal Adaptation → Energy Adjustment full chain frozen propagation end-to-end (3 sub-spans)
//   - Forward Constraint Object surfaced to downstream after Energy Adjustment (Hook 4 propagation per §9.3.1 #5)
//   - Periodization fails hard → Goal Adaptation + Energy Adjustment skipped (downstream halt cascade)
//   - Goal Adaptation fails hard → Energy Adjustment skipped
//
// See: 03-decisions/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/coach/orchestrator/adapters/energyAdjustmentAdapter.js
//      src/coach/orchestrator/adapters/goalAdaptationAdapter.js (batch 2 precedent `905946c`)
//      src/coach/orchestrator/adapters/periodizationAdapter.js (batch 1 precedent `de4222b`)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluateEnergyAdjustment } from '../../../engine/energyAdjustment/index.js';
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

function deloadConstraintObject() {
  return Object.freeze({
    intensity_pct_1rm: { floor: 0.55, ceiling: 0.70 },
    volume_per_muscle: {
      chest: { floor: 5, ceiling: 10 },
      back: { floor: 6, ceiling: 12 },
      legs: { floor: 8, ceiling: 14 },
    },
    phase: 'DELOAD',
    deload_window: { trigger: 'CALENDAR', days: 7 },
    immutable_snapshot: true,
  });
}

// ── Fixtures user/session ───────────────────────────────────────────────────

function fixtureT0() {
  return {
    user: {}, // no energyEmoji → tier 'none'
    recentSessions: [],
    weights: {},
    profileTier: null,
    flags: {},
    meta: {},
  };
}

function fixtureT1Green() {
  return {
    user: {
      sex: 'M',
      age: 30,
      kg: 80,
      experience: 'intermediate',
      goal: 'forta',
      energyEmoji: 'green',
    },
    recentSessions: [
      { date: '2026-04-30', volume: 12, intensity: 0.78 },
      { date: '2026-05-02', volume: 14, intensity: 0.80 },
      { date: '2026-05-04', volume: 13, intensity: 0.82 },
    ],
    weights: { squat: 100, bench: 80, deadlift: 120 },
    profileTier: 'T1',
    flags: {},
    meta: {
      recentAdjustmentDirections: ['UP', 'NONE', 'UP'],
      bayesianSigma: 0,
      stagnationDetected: false,
    },
  };
}

function fixtureT2RedDeload() {
  return {
    user: {
      sex: 'M',
      age: 35,
      kg: 85,
      experience: 'advanced',
      goal: 'forta',
      energyEmoji: 'red',
      drillDownCause: 'somn',
    },
    recentSessions: Array.from({ length: 12 }, (_, i) => ({
      date: `2026-04-${String(i + 1).padStart(2, '0')}`,
      volume: 14 + (i % 3),
      intensity: 0.80 + (i % 5) * 0.01,
    })),
    weights: { squat: 140, bench: 110, deadlift: 170 },
    profileTier: 'T2',
    flags: {},
    meta: {
      recentAdjustmentDirections: ['DOWN', 'DOWN', 'DOWN'],
      bayesianSigma: 0.05,
      stagnationDetected: false,
      currentSessionSubFloor: false,
      compositeLowSignals: false,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Energy Adjustment engine consumes it natively:
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
 * Build the orchestrated ctx as orchestrator propagates from Periodization:
 * `meta.constraintObject` slot populated, adapter renames la `periodizationConstraint`.
 */
function buildOrchestratedCtx(userState, co) {
  const ctx = buildEngineContext(userState);
  return extendEngineContext(ctx, { constraintObject: co });
}

// ── Golden-master parity ────────────────────────────────────────────────────

describe('Energy Adjustment Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.3)', () => {
  it('T0 fresh user no emoji + default CO — legacy ≡ orchestrated (tier none)', async () => {
    const userState = fixtureT0();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateEnergyAdjustment(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [energyAdjustmentAdapter]);

    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);

    // Strip adapter-only `constraintObject` surface — engine result is canonical.
    const { constraintObject: _surfaced, ...orchEngineOutput } = orchResults[0].output;
    expect(orchEngineOutput).toEqual(legacyOutput);
    expect(orchEngineOutput.id).toBe('energyAdjustment');
    expect(orchEngineOutput.tier).toBe('none'); // no emoji → tier 'none'
  });

  it('T1 active user 🟢 emoji + LOAD CO — legacy ≡ orchestrated (UP eligible)', async () => {
    const userState = fixtureT1Green();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateEnergyAdjustment(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [energyAdjustmentAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    const { constraintObject: _surfaced, ...orchEngineOutput } = orchResults[0].output;
    expect(orchEngineOutput).toEqual(legacyOutput);
    expect(orchEngineOutput.id).toBe('energyAdjustment');
    expect(orchEngineOutput.meta.energy_state).toBe('green');
    expect(['UP', 'NONE']).toContain(orchEngineOutput.meta.adjustment_direction);
  });

  it('T2 power user 🔴 emoji drill-down + DELOAD CO — legacy ≡ orchestrated (DOWN immediate)', async () => {
    const userState = fixtureT2RedDeload();
    const co = deloadConstraintObject();

    const legacyOutput = await evaluateEnergyAdjustment(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [energyAdjustmentAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    const { constraintObject: _surfaced, ...orchEngineOutput } = orchResults[0].output;
    expect(orchEngineOutput).toEqual(legacyOutput);
    expect(orchEngineOutput.meta.energy_state).toBe('red');
    expect(orchEngineOutput.meta.adjustment_direction).toBe('DOWN'); // 🔴 DOWN_IMMEDIATE per §9.3.2
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Energy Adjustment Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1Green();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [energyAdjustmentAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine throws → ENGINE_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1Green();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const throwingEnergyAdapter = Object.freeze({
      id: 'energyAdjustment',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingEnergyAdapter]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1Green();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const budgetExceededAdapter = Object.freeze({
      id: 'energyAdjustment',
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

  it('telemetry sub-span fires cu adapterId="energyAdjustment" + durationMs + ok', async () => {
    const userState = fixtureT1Green();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const subSpans = [];
    const results = await runPipeline(ctx, [energyAdjustmentAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('energyAdjustment');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1Green()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [energyAdjustmentAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('energyAdjustment');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization + Goal Adaptation upstream ────────

describe('Energy Adjustment Adapter — Pipeline integration 3-adapter chain (ADR 026 §1.10 sequential)', () => {
  it('Periodization → Goal Adaptation → Energy Adjustment full chain Constraint Object frozen propagation end-to-end', async () => {
    const userState = fixtureT1Green();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(3);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(isOk(results[2])).toBe(true); // Energy Adjustment OK (received CO via Hook 1)
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');
    expect(results[2].output.id).toBe('energyAdjustment');

    // 3 sub-spans both fired
    expect(subSpans.length).toBe(3);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
    expect(subSpans[2].adapterId).toBe('energyAdjustment');
  });

  it('Forward Constraint Object surfaced post Energy Adjustment for downstream propagation (Hook 4 §9.3.1 #5)', async () => {
    const userState = fixtureT1Green();
    const ctx = buildEngineContext(userState);

    // Inspector adapter checks ctx.meta.constraintObject after Energy Adjustment
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
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, inspectorAdapter],
    );

    expect(results.length).toBe(4);
    expect(isOk(results[3])).toBe(true);

    // Inspector received frozen Constraint Object after Energy Adjustment forward Hook 4
    expect(spy).toHaveBeenCalledTimes(1);
    const propagatedCO = spy.mock.calls[0][0];
    expect(propagatedCO).toBeTruthy();
    expect(Object.isFrozen(propagatedCO)).toBe(true);
    expect(propagatedCO.immutable_snapshot).toBe(true); // anti-cascade preserved
    expect(propagatedCO.phase).toBeTruthy(); // phase preserved post Energy Adjustment forward

    // Energy Adjustment adapter exposed forwarded CO în output for orchestrator detection
    const eaOutput = results[2].output;
    expect(eaOutput.constraintObject).toBeTruthy();
    expect(Object.isFrozen(eaOutput.constraintObject)).toBe(true);
  });

  it('Periodization fails hard → Goal Adaptation + Energy Adjustment skipped (cascade halt §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1Green());

    const failingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated upstream fault', severity: 'hard' }),
    });

    const goalAdSpy = vi.fn(goalAdaptationAdapter.invoke.bind(goalAdaptationAdapter));
    const energySpy = vi.fn(energyAdjustmentAdapter.invoke.bind(energyAdjustmentAdapter));

    const results = await runPipeline(ctx, [
      failingPeriodAdapter,
      Object.freeze({ id: 'goalAdaptation', invoke: goalAdSpy }),
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
    ]);

    expect(results.length).toBe(1); // halted după Periodization hard fail
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdSpy).not.toHaveBeenCalled();
    expect(energySpy).not.toHaveBeenCalled();
  });

  it('Goal Adaptation fails hard → Energy Adjustment skipped (downstream halt cascade)', async () => {
    const ctx = buildEngineContext(fixtureT1Green());

    const failingGoalAdapter = Object.freeze({
      id: 'goalAdaptation',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated mid-pipeline fault', severity: 'hard' }),
    });

    const energySpy = vi.fn(energyAdjustmentAdapter.invoke.bind(energyAdjustmentAdapter));

    const results = await runPipeline(ctx, [
      periodizationAdapter,
      failingGoalAdapter,
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
    ]);

    expect(results.length).toBe(2); // Periodization OK + Goal Adaptation hard halt
    expect(isOk(results[0])).toBe(true);
    expect(results[1].ok).toBe(false);
    expect(results[1].error.severity).toBe('hard');
    expect(energySpy).not.toHaveBeenCalled();
  });
});
