// Goal Adaptation Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 2 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #2): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation (cu `meta.periodizationConstraint`
// already provided) and orchestrated `runPipeline(ctx, [goalAdaptationAdapter])`
// path (cu `meta.constraintObject` propagated, adapter does D2 shape mapping
// rename to engine-expected `meta.periodizationConstraint`).
//
// **First downstream consumer Constraint Object propagation pattern.**
//
// 3 fixture cases minim cover ADR 026 §9.2 spec V1:
//   1. T0 fresh user with default Constraint Object — tier 'none'
//   2. T1 active user with calibrated Constraint Object
//   3. T2 power user with refined Constraint Object + complex meta
//
// Plus 5 edge cases:
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (per §3.6 fail-safe)
//   - Engine throws → ENGINE_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='goalAdaptation'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 2 pipeline integration tests:
//   - Periodization → Goal Adaptation propagation Constraint Object frozen
//   - Periodization fails hard → Goal Adaptation skipped (downstream halt per §3.6)
//
// See: 03-decisions/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/coach/orchestrator/adapters/periodizationAdapter.js (batch 1 precedent `de4222b`)
//      src/coach/orchestrator/__tests__/periodizationParity.test.js (parity test pattern)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluateGoalAdaptation } from '../../../engine/goalAdaptation/index.js';
import { goalAdaptationAdapter } from '../adapters/goalAdaptationAdapter.js';
import { periodizationAdapter } from '../adapters/periodizationAdapter.js';
import { runPipeline } from '../index.js';
import { buildEngineContext, extendEngineContext } from '../contextBuilder.js';
import { ok, err, isOk } from '../result.js';

// ── Fixtures Constraint Object ──────────────────────────────────────────────

function defaultConstraintObject() {
  return Object.freeze({
    intensity_pct_1rm: { floor: 0.65, ceiling: 0.85 },
    volume_per_muscle: {
      chest: { floor: 8, ceiling: 16 },
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
    user: {},
    recentSessions: [],
    weights: {},
    profileTier: null,
    flags: {},
    meta: {},
  };
}

function fixtureT1() {
  return {
    user: {
      sex: 'M',
      age: 30,
      kg: 80,
      bf: 18,
      experience: 'intermediate',
      goal: 'forta',
      trainingWeeks: 30,
    },
    recentSessions: [
      { date: '2026-04-30', volume: 12, intensity: 0.78 },
      { date: '2026-05-02', volume: 14, intensity: 0.80 },
      { date: '2026-05-04', volume: 13, intensity: 0.82 },
    ],
    weights: { squat: 100, bench: 80, deadlift: 120 },
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 5, tdeeKcal: 2800 },
  };
}

function fixtureT2() {
  return {
    user: {
      sex: 'M',
      age: 35,
      kg: 85,
      bf: 14,
      experience: 'advanced',
      goal: 'forta',
      trainingWeeks: 80,
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
      weeksElapsed: 11,
      consecutiveExtensions: 1,
      earlySafetyTriggered: false,
      recovery: { green: true, strength: 'high' },
      tdeeKcal: 3100,
      aggressiveOptIn: false,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Goal Adaptation engine consumes it natively:
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

describe('Goal Adaptation Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.2)', () => {
  it('T0 fresh user with default CO — legacy direct call ≡ orchestrated path', async () => {
    const userState = fixtureT0();
    const co = defaultConstraintObject();

    // Legacy: ctx cu meta.periodizationConstraint direct
    const legacyCtx = buildLegacyCtx(userState, co);
    const legacyOutput = await evaluateGoalAdaptation(legacyCtx);

    // Orchestrated: ctx cu meta.constraintObject; adapter renames
    const orchCtx = buildOrchestratedCtx(userState, co);
    const orchResults = await runPipeline(orchCtx, [goalAdaptationAdapter]);
    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);

    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('goalAdaptation');
    expect(orchResults[0].output.tier).toBe('none'); // empty user → 'none'
  });

  it('T1 active user with LOAD CO — legacy ≡ orchestrated (zero-behavior-change)', async () => {
    const userState = fixtureT1();
    const co = defaultConstraintObject(); // LOAD phase

    const legacyOutput = await evaluateGoalAdaptation(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [goalAdaptationAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('goalAdaptation');
    expect(['LOW', 'MED', 'HIGH', 'none']).toContain(orchResults[0].output.tier);
  });

  it('T2 power user with DELOAD CO — legacy ≡ orchestrated + deload kcal override applied', async () => {
    const userState = fixtureT2();
    const co = deloadConstraintObject(); // DELOAD triggers Cluster 3 kcal override

    const legacyOutput = await evaluateGoalAdaptation(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [goalAdaptationAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    // High confidence post hasUser + hasPeriodizationConstraint + hasTdee
    expect(orchResults[0].output.confidence).toBe('high');
    // Deload kcal override signal expected per phaseAutoDetection.js logic
    expect(orchResults[0].output.signals).toContain('deload_kcal_override_applied');
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Goal Adaptation Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [goalAdaptationAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine throws → ENGINE_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const throwingGoalAdapter = Object.freeze({
      id: 'goalAdaptation',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingGoalAdapter]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const budgetExceededAdapter = Object.freeze({
      id: 'goalAdaptation',
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

  it('telemetry sub-span fires cu adapterId="goalAdaptation" + durationMs + ok', async () => {
    const userState = fixtureT1();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const subSpans = [];
    const results = await runPipeline(ctx, [goalAdaptationAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('goalAdaptation');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [goalAdaptationAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('goalAdaptation');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization upstream ──────────────────────────

describe('Goal Adaptation Adapter — Pipeline integration cu Periodization upstream (ADR 026 §1.10 sequential)', () => {
  it('Periodization → Goal Adaptation propagates Constraint Object frozen end-to-end', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [periodizationAdapter, goalAdaptationAdapter],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(2);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');

    // Periodization adapter surfaced frozen Constraint Object
    const periodCO = results[0].output.constraintObject;
    expect(periodCO).toBeTruthy();
    expect(Object.isFrozen(periodCO)).toBe(true);
    expect(periodCO.immutable_snapshot).toBe(true);

    // Sub-spans both fired
    expect(subSpans.length).toBe(2);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
  });

  it('Periodization fails hard → Goal Adaptation skipped (downstream halt per §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1());

    const failingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated upstream fault', severity: 'hard' }),
    });

    const goalAdaptationSpy = vi.fn(goalAdaptationAdapter.invoke.bind(goalAdaptationAdapter));
    const wrappedGoalAdapter = Object.freeze({
      id: 'goalAdaptation',
      invoke: goalAdaptationSpy,
    });

    const results = await runPipeline(ctx, [failingPeriodAdapter, wrappedGoalAdapter]);

    expect(results.length).toBe(1); // halted după Periodization hard fail
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdaptationSpy).not.toHaveBeenCalled(); // downstream skipped
  });
});
