// Bayesian Nutrition Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 4 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #4): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation (cu `meta.periodizationConstraint`
// already provided) and orchestrated `runPipeline(ctx, [bayesianNutritionAdapter])`
// path (cu `meta.constraintObject` propagated, adapter does D2 shape mapping
// rename to engine-expected `meta.periodizationConstraint`).
//
// **Third downstream Constraint Object consumer (read-only Hook 1 convention,
// NU re-emit Hook 4 — engine doesn't emit `meta.forward_constraint_object`).**
// Pattern follows Goal Adaptation batch 2 precedent (consume read-only, NU
// re-surface), DIVERGENT vs Energy Adjustment batch 3 Hook 4 explicit re-emission.
//
// Field name mapping verdict (per §0 prompt + pre-flight grep filesystem):
//   Engine reads `meta.periodizationConstraint` (same convention Goal Adaptation
//   batch 2 + Energy Adjustment batch 3) — adapter rename `meta.constraintObject`
//   → `meta.periodizationConstraint` (engine source line 222).
//   Engine output blueprint = `{ nutrition_inference_metadata,
//   likelihood_probabilities, profile_typing, ui_tier, passive_mode_active,
//   signals }` — NU include `forward_constraint_object` (only `trace.forwardedConstraint`
//   = boolean flag). Adapter NU re-surface `output.constraintObject`.
//
// 3 fixture cases minim cover ADR 026 §9.4 + ADR 022 spec V1 (Bayesian Nutrition
// Cluster A-E):
//   1. T0 fresh user no observations + no demographicMu → tier 'none', confidence 'low'
//   2. T1 active user 7 observations + demographicMu populated + energyDirection='UP' → tier 'MED'
//   3. T2 power user 30+ observations + tight posterior + profile typing established → tier 'MED'
//
// Plus 5 edge cases:
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (per §3.6 fail-safe)
//   - Engine throws → ADAPTER_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='bayesianNutrition'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 4 pipeline integration tests (4-adapter chain cumulative — NEW vs Energy
// Adjustment 3-adapter chain):
//   - Periodization → GoalAdaptation → EnergyAdjustment → BayesianNutrition full
//     chain frozen propagation end-to-end (4 sub-spans)
//   - Constraint Object surfaced downstream after Bayesian Nutrition (preserved
//     din upstream Energy Adjustment Hook 4 emission, propagated via orchestrator
//     currentCtx chain even though Bayesian adapter NU re-emit)
//   - Periodization fails hard → cascade halt: Goal Adaptation + Energy +
//     Bayesian skipped (downstream halt cascade)
//   - Energy Adjustment fails hard mid-pipeline → Bayesian Nutrition skipped
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/coach/orchestrator/adapters/bayesianNutritionAdapter.js
//      src/coach/orchestrator/adapters/energyAdjustmentAdapter.js (batch 3 precedent)
//      src/coach/orchestrator/adapters/goalAdaptationAdapter.js (batch 2 read-only consume precedent)
//      src/coach/orchestrator/adapters/periodizationAdapter.js (batch 1 precedent)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluateBayesianNutrition } from '../../../engine/bayesianNutrition/index.js';
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

// ── Fixtures user/session per ADR 022 spec V1 + ADR 026 §9.4 ────────────────

function fixtureT0FreshUser() {
  return {
    user: {}, // minimal — no demographic baseline
    recentSessions: [],
    weights: {},
    profileTier: null,
    flags: {},
    meta: {
      // No demographicMu → tier 'none' resolution in engine
      // No observations → posterior = prior (demographic baseline)
    },
  };
}

function fixtureT1ActiveUser() {
  return {
    user: {
      sex: 'M',
      age: 30,
      kg: 80,
      experience: 'intermediate',
      goal: 'forta',
    },
    recentSessions: [
      { date: '2026-04-30', volume: 12, intensity: 0.78, movements: [{ type: 'compound', volume: 8 }, { type: 'isolation', volume: 4 }] },
      { date: '2026-05-02', volume: 14, intensity: 0.80, movements: [{ type: 'compound', volume: 9 }, { type: 'isolation', volume: 5 }] },
      { date: '2026-05-04', volume: 13, intensity: 0.82, movements: [{ type: 'compound', volume: 8 }, { type: 'isolation', volume: 5 }] },
    ],
    weights: { squat: 100, bench: 80, deadlift: 120 },
    profileTier: 'T1',
    flags: {},
    meta: {
      demographicMu: 0.0, // demographic prior baseline kcal delta
      demographicSigma: 1.2,
      observations: [
        { weightDelta: -0.3, adherence: 0.85, reportedEnergy: 'normal' },
        { weightDelta: -0.2, adherence: 0.90, reportedEnergy: 'green' },
        { weightDelta: -0.4, adherence: 0.80, reportedEnergy: 'normal' },
        { weightDelta: -0.3, adherence: 0.85, reportedEnergy: 'green' },
        { weightDelta: -0.2, adherence: 0.95, reportedEnergy: 'normal' },
        { weightDelta: -0.3, adherence: 0.85, reportedEnergy: 'green' },
        { weightDelta: -0.4, adherence: 0.80, reportedEnergy: 'normal' },
      ],
      previousPhase: 'LOAD',
      currentPhase: 'LOAD',
      energyDirection: 'UP',
      recentObservedWeights: [80.0, 79.7, 79.5, 79.3, 79.0, 78.7, 78.4],
      recentPredictedWeights: [80.0, 79.8, 79.6, 79.4, 79.2, 79.0, 78.8],
      energyReadiness: 'normal',
      emoji: 'green',
      sleepSelfReport: 'good',
      adaptiveProfileTypingValue: 0.70,
      currentProfileTypingThreshold: 0.65,
      engine2Phase: 'CUT',
      engine3InferredPhase: 'CUT',
      nowMs: 1714780800000, // 2026-05-04
      lastNutritionPromptMs: 1714694400000, // 1 zi in urma
      nutritionPromptCountThisYear: 3,
    },
  };
}

function fixtureT2PowerUser() {
  return {
    user: {
      sex: 'M',
      age: 35,
      kg: 85,
      experience: 'advanced',
      goal: 'forta',
    },
    recentSessions: Array.from({ length: 12 }, (_, i) => ({
      date: `2026-04-${String(i + 1).padStart(2, '0')}`,
      volume: 14 + (i % 3),
      intensity: 0.80 + (i % 5) * 0.01,
      movements: [
        { type: 'compound', volume: 10 + (i % 3) },
        { type: 'isolation', volume: 4 + (i % 2) },
      ],
    })),
    weights: { squat: 140, bench: 110, deadlift: 170 },
    profileTier: 'T2',
    flags: {},
    meta: {
      demographicMu: 0.0,
      demographicSigma: 0.8, // tighter prior at T2
      observations: Array.from({ length: 30 }, (_, i) => ({
        weightDelta: -0.3 + (i % 5) * 0.05,
        adherence: 0.82 + (i % 4) * 0.04,
        reportedEnergy: i % 3 === 0 ? 'green' : 'normal',
      })),
      previousPhase: 'LOAD',
      currentPhase: 'LOAD',
      energyDirection: 'NONE',
      recentObservedWeights: Array.from({ length: 14 }, (_, i) => 85 - i * 0.2),
      recentPredictedWeights: Array.from({ length: 14 }, (_, i) => 85 - i * 0.18),
      energyReadiness: 'high',
      emoji: 'green',
      sleepSelfReport: 'good',
      adaptiveProfileTypingValue: 0.80,
      currentProfileTypingThreshold: 0.75,
      engine2Phase: 'CUT',
      engine3InferredPhase: 'CUT',
      nowMs: 1714780800000,
      lastNutritionPromptMs: 1714521600000,
      nutritionPromptCountThisYear: 8,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Bayesian Nutrition engine consumes it natively:
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

describe('Bayesian Nutrition Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.4)', () => {
  it('T0 fresh user no observations + no demographicMu → tier none (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT0FreshUser();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateBayesianNutrition(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [bayesianNutritionAdapter]);

    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('bayesianNutrition');
    expect(orchResults[0].output.tier).toBe('none'); // no obs + no demographicMu
    // Confidence = 'medium' here: hasPriorSource=true (always — demographic prior baseline)
    // + hasPeriodizationConstraint=true (CO provided in test). Score 2 → 'medium' per
    // computeConfidence engine helper. 'low' would require absent CO + no obs.
    expect(orchResults[0].output.confidence).toBe('medium');
  });

  it('T1 active user 7 obs + demographicMu + energy UP → tier MED (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT1ActiveUser();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateBayesianNutrition(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [bayesianNutritionAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('bayesianNutrition');
    expect(orchResults[0].output.tier).toBe('MED');
    expect(orchResults[0].output.meta.likelihood_probabilities).toBeTruthy();
    expect(orchResults[0].output.meta.passive_mode_active).toBe(false);
  });

  it('T2 power user 30 obs + tight prior → tier MED + posterior CI (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT2PowerUser();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateBayesianNutrition(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [bayesianNutritionAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.tier).toBe('MED');
    expect(orchResults[0].output.meta.nutrition_inference_metadata.posterior).toBeTruthy();
    expect(orchResults[0].output.meta.nutrition_inference_metadata.confidence_interval).toBeTruthy();
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Bayesian Nutrition Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [bayesianNutritionAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine throws → ADAPTER_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const throwingBayesianAdapter = Object.freeze({
      id: 'bayesianNutrition',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingBayesianAdapter]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const budgetExceededAdapter = Object.freeze({
      id: 'bayesianNutrition',
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

  it('telemetry sub-span fires cu adapterId="bayesianNutrition" + durationMs + ok', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const subSpans = [];
    const results = await runPipeline(ctx, [bayesianNutritionAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('bayesianNutrition');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1ActiveUser()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [bayesianNutritionAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('bayesianNutrition');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization + Goal Adaptation + Energy upstream ───

describe('Bayesian Nutrition Adapter — Pipeline integration 4-adapter chain (ADR 026 §1.10 sequential)', () => {
  it('Periodization → GoalAdapt → EnergyAdj → Bayesian full chain Constraint Object frozen propagation end-to-end', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(4);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(isOk(results[2])).toBe(true); // Energy Adjustment OK (received CO via Hook 1)
    expect(isOk(results[3])).toBe(true); // Bayesian Nutrition OK (received CO via Hook 1)
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');
    expect(results[2].output.id).toBe('energyAdjustment');
    expect(results[3].output.id).toBe('bayesianNutrition');

    // 4 sub-spans all fired
    expect(subSpans.length).toBe(4);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
    expect(subSpans[2].adapterId).toBe('energyAdjustment');
    expect(subSpans[3].adapterId).toBe('bayesianNutrition');
  });

  it('Constraint Object surfaced post Bayesian Nutrition for downstream propagation (preserved din Energy Adjustment Hook 4 via orchestrator currentCtx chain)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildEngineContext(userState);

    // Inspector adapter checks ctx.meta.constraintObject after Bayesian Nutrition
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
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, inspectorAdapter],
    );

    expect(results.length).toBe(5);
    expect(isOk(results[4])).toBe(true);

    // Inspector received frozen Constraint Object preserved din upstream
    // Energy Adjustment Hook 4 emission (Bayesian adapter NU re-emit, dar
    // orchestrator currentCtx chain preserved)
    expect(spy).toHaveBeenCalledTimes(1);
    const propagatedCO = spy.mock.calls[0][0];
    expect(propagatedCO).toBeTruthy();
    expect(Object.isFrozen(propagatedCO)).toBe(true);
    expect(propagatedCO.immutable_snapshot).toBe(true); // anti-cascade preserved
    expect(propagatedCO.phase).toBeTruthy(); // phase preserved post chain

    // Bayesian Nutrition adapter NU expose constraintObject in output (Goal
    // Adaptation pattern, NU Energy Adjustment Hook 4 re-emission pattern)
    const bayesianOutput = results[3].output;
    expect(bayesianOutput.constraintObject).toBeUndefined();
  });

  it('Periodization fails hard → Goal Adaptation + Energy Adjustment + Bayesian Nutrition skipped (cascade halt §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1ActiveUser());

    const failingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated upstream fault', severity: 'hard' }),
    });

    const goalAdSpy = vi.fn(goalAdaptationAdapter.invoke.bind(goalAdaptationAdapter));
    const energySpy = vi.fn(energyAdjustmentAdapter.invoke.bind(energyAdjustmentAdapter));
    const bayesianSpy = vi.fn(bayesianNutritionAdapter.invoke.bind(bayesianNutritionAdapter));

    const results = await runPipeline(ctx, [
      failingPeriodAdapter,
      Object.freeze({ id: 'goalAdaptation', invoke: goalAdSpy }),
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
      Object.freeze({ id: 'bayesianNutrition', invoke: bayesianSpy }),
    ]);

    expect(results.length).toBe(1); // halted dupa Periodization hard fail
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdSpy).not.toHaveBeenCalled();
    expect(energySpy).not.toHaveBeenCalled();
    expect(bayesianSpy).not.toHaveBeenCalled();
  });

  it('Energy Adjustment fails hard mid-pipeline → Bayesian Nutrition skipped (downstream halt cascade)', async () => {
    const ctx = buildEngineContext(fixtureT1ActiveUser());

    const failingEnergyAdapter = Object.freeze({
      id: 'energyAdjustment',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated mid-pipeline fault', severity: 'hard' }),
    });

    const bayesianSpy = vi.fn(bayesianNutritionAdapter.invoke.bind(bayesianNutritionAdapter));

    const results = await runPipeline(ctx, [
      periodizationAdapter,
      goalAdaptationAdapter,
      failingEnergyAdapter,
      Object.freeze({ id: 'bayesianNutrition', invoke: bayesianSpy }),
    ]);

    expect(results.length).toBe(3); // Periodization OK + Goal Adaptation OK + Energy Adjustment hard halt
    expect(isOk(results[0])).toBe(true);
    expect(isOk(results[1])).toBe(true);
    expect(results[2].ok).toBe(false);
    expect(results[2].error.severity).toBe('hard');
    expect(bayesianSpy).not.toHaveBeenCalled();
  });
});
