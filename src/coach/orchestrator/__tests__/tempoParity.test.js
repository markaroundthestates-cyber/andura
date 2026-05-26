// Tempo Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 5 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #5): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation (cu `meta.periodizationConstraint`
// already provided) and orchestrated `runPipeline(ctx, [tempoAdapter])` path
// (cu `meta.constraintObject` propagated, adapter does D2 shape mapping rename
// to engine-expected `meta.periodizationConstraint`).
//
// **Fourth downstream Constraint Object consumer (read-only Hook 1 convention,
// NU re-emit Hook 4 — engine doesn't emit `meta.forward_constraint_object`).**
// Pattern follows Bayesian Nutrition batch 4 + Goal Adaptation batch 2
// precedents (consume read-only, NU re-surface), DIVERGENT vs Energy Adjustment
// batch 3 Hook 4 explicit re-emission.
//
// Field name mapping verdict (per §0 prompt + pre-flight grep filesystem):
//   Engine reads `meta.periodizationConstraint` (same convention batches 2-4)
//   — adapter rename `meta.constraintObject` → `meta.periodizationConstraint`
//   (engine source line 147). Engine output blueprint = `{ tempo_prescription,
//   form_cue, mind_muscle_active, cue_delivery_timing, signals,
//   mind_muscle_state }` — NU include `forward_constraint_object` (only
//   `trace.forwardedConstraint` boolean flag). Adapter NU re-surface
//   `output.constraintObject`.
//
// 3 fixture cases minim cover ADR 026 §9.5 + ADR 028 spec V1 (Tempo
// Cluster A-E):
//   1. T0 fresh user no profileTier + no movementId, CO provided → tier 'MED',
//      mind_muscle_active=false (T0 OFF default Q5=C), persona default Gigica
//   2. T1 active user profileTier='T1' + back_squat compound + LOAD phase
//      energyDirection=UP → tier 'MED', mind_muscle_active=true (T1+ Q5=C),
//      cue Marius numeric persona Q18=D, depth='rich' (Q15=B)
//   3. T2 power user profileTier='T2' + Deload phase Q12=D + persona Maria
//      verbal-only zero-notation → tier 'MED', mind_muscle_active=true (Deload
//      override + T2 default), depth='adaptive' Q15=B, soft auto-retire Q17=C
//
// Plus 5 edge cases:
//   - MISSING constraintObject → INVALID_INPUT 'hard' severity halt (per §3.6 fail-safe)
//   - Engine throws → ADAPTER_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
//   - Sub-span telemetry fires cu adapterId='tempo'
//   - Sub-span captures err code + severity on hard halt
//
// Plus 4 pipeline integration tests (5-adapter chain cumulative — NEW vs
// Bayesian Nutrition 4-adapter chain):
//   - Periodization → GoalAdapt → EnergyAdj → BayesianNutrition → Tempo full
//     chain frozen propagation end-to-end (5 sub-spans)
//   - Constraint Object preserved frozen downstream after Tempo (orchestrator
//     chain via Energy Adjustment Hook 4 upstream, NU re-emitted by Tempo)
//   - Periodization fails hard → cascade halt: Goal Adaptation + Energy +
//     Bayesian + Tempo skipped
//   - Bayesian Nutrition fails hard → Tempo skipped (downstream halt cascade)
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/coach/orchestrator/adapters/tempoAdapter.js
//      src/coach/orchestrator/adapters/bayesianNutritionAdapter.js (batch 4 precedent)
//      src/coach/orchestrator/adapters/energyAdjustmentAdapter.js (batch 3 precedent)
//      src/coach/orchestrator/adapters/goalAdaptationAdapter.js (batch 2 read-only consume precedent)
//      src/coach/orchestrator/adapters/periodizationAdapter.js (batch 1 precedent)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluateTempo } from '../../../engine/tempo/index.js';
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

// ── Fixtures user/session per ADR 026 §9.5 + ADR 028 spec V1 ────────────────

function fixtureT0FreshUser() {
  return {
    user: {}, // minimal — no demographics
    recentSessions: [],
    weights: {},
    profileTier: null,
    flags: {},
    meta: {
      // No movementId → tier=MED (because CO present, but no movement context).
      // No persona → defaults Gigica per resolvePersona fallback.
      // No periodizationPhase → no high-intensity / deload / energy modulations.
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
      { date: '2026-04-30', formBreakdown: false },
      { date: '2026-05-02', formBreakdown: false },
      { date: '2026-05-04', formBreakdown: true },
    ],
    weights: { squat: 100, bench: 80, deadlift: 120 },
    profileTier: 'T1',
    flags: {},
    meta: {
      movementId: 'back_squat',
      movementCategory: 'compound',
      periodizationPhase: 'LOAD+',
      energyDirection: 'UP',
      persona: 'marius', // numeric pure imperative tone Q18=D
      formBreakdownToggled: false,
      userReportedFormBreakdown: false,
      userKnowToggleMovements: [],
      userInitiatedTapToExpand: false,
      postSetFeedbackContext: null,
    },
  };
}

function fixtureT2PowerUserDeload() {
  // 10 sessions form_breakdown=false → implicit acquisition Q9=D N=10 trigger
  const recentSessionsForMovement = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
  return {
    user: {
      sex: 'F',
      age: 35,
      kg: 65,
      experience: 'advanced',
      goal: 'hipertrofie',
    },
    recentSessions: recentSessionsForMovement,
    weights: { squat: 90, bench: 60, deadlift: 110 },
    profileTier: 'T2',
    flags: {},
    meta: {
      movementId: 'romanian_deadlift',
      movementCategory: 'compound',
      periodizationPhase: 'DELOAD', // Q12=D mind-muscle unlock + Deload tempo
      energyDirection: 'NONE',
      persona: 'maria', // verbal-only zero-notation strict (Q3 Daniel push-back)
      formBreakdownToggled: false,
      userReportedFormBreakdown: false,
      userKnowToggleMovements: [], // no explicit toggle
      userInitiatedTapToExpand: false,
      postSetFeedbackContext: null,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the legacy ctx as Tempo engine consumes it natively:
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

describe('Tempo Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.5)', () => {
  it('T0 fresh user no profileTier + no movementId, CO provided → tier MED, mind_muscle_active=false (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT0FreshUser();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateTempo(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [tempoAdapter]);

    expect(orchResults.length).toBe(1);
    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('tempo');
    // tier='MED' because CO present (one-of-three conditions — NU all three null)
    expect(orchResults[0].output.tier).toBe('MED');
    // mind_muscle_active=false because tier null → defaults T0 OFF (Q5=C calibration window)
    expect(orchResults[0].output.meta.mind_muscle_active).toBe(false);
    // Persona defaults Gigica (middle-ground hibrid, anti-overfit cold start)
    expect(orchResults[0].output.meta.form_cue.persona).toBe('gigica');
  });

  it('T1 active user back_squat LOAD+ energy UP persona Marius → mind_muscle_active=true + numeric tone (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT1ActiveUser();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateTempo(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [tempoAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('tempo');
    expect(orchResults[0].output.tier).toBe('MED');
    // T1 mind-muscle ON per MIND_MUSCLE_ACTIVATION_BY_TIER.T1=true
    expect(orchResults[0].output.meta.mind_muscle_active).toBe(true);
    // Persona Marius numeric pure imperative Q18=D — cue ends with "Execute."
    expect(orchResults[0].output.meta.form_cue.persona).toBe('marius');
    expect(orchResults[0].output.meta.form_cue.cueText).toMatch(/Execute\.$/);
    // Depth tier-aware T1='rich' Q15=B
    expect(orchResults[0].output.meta.form_cue.depth).toBe('rich');
    // LOAD+ phase = HIGH_INTENSITY_PHASES.LOAD_PLUS → form-conservative amplification
    expect(orchResults[0].output.signals).toContain('tempo_form_conservative_amplification_high_intensity');
  });

  it('T2 power user Deload + persona Maria + 10 sessions no breakdown → mind_muscle_active=true (deload override) + soft auto-retire (legacy ≡ orchestrated)', async () => {
    const userState = fixtureT2PowerUserDeload();
    const co = defaultConstraintObject();

    const legacyOutput = await evaluateTempo(buildLegacyCtx(userState, co));
    const orchResults = await runPipeline(buildOrchestratedCtx(userState, co), [tempoAdapter]);

    expect(isOk(orchResults[0])).toBe(true);
    expect(orchResults[0].output).toEqual(legacyOutput);
    expect(orchResults[0].output.id).toBe('tempo');
    expect(orchResults[0].output.tier).toBe('MED');
    // Deload Q12=D unlock + T2 default both true
    expect(orchResults[0].output.meta.mind_muscle_state.active).toBe(true);
    // Persona Maria verbal-only Q3 Daniel push-back fundamental — "De ce ... Pentru ..."
    expect(orchResults[0].output.meta.form_cue.persona).toBe('maria');
    expect(orchResults[0].output.meta.form_cue.cueText).toMatch(/^De ce/);
    // Depth tier-aware T2='adaptive' Q15=B
    expect(orchResults[0].output.meta.form_cue.depth).toBe('adaptive');
    // Soft auto-retire mode T2+ Q17=C
    expect(orchResults[0].output.meta.mind_muscle_state.suppressionMode).toBe('soft_auto_retire');
    // Deload signal emitted Q12=D
    expect(orchResults[0].output.signals).toContain('mind_muscle_unlock_deload_q12_d');
    // 10 sessions no breakdown ≥ N=10 + rate 0 < threshold → implicit acquisition
    expect(orchResults[0].output.meta.mind_muscle_state.acquiredImplicit).toBe(true);
  });
});

// ── Edge cases severity-aware policy ────────────────────────────────────────

describe('Tempo Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('MISSING constraintObject → INVALID_INPUT hard severity halt (§3.6 fail-safe)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildEngineContext(userState); // NU populate constraintObject
    expect(ctx.meta.constraintObject).toBeNull();

    const results = await runPipeline(ctx, [tempoAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(results[0].error.message).toMatch(/Constraint Object/i);
  });

  it('engine throws → ADAPTER_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const throwingTempoAdapter = Object.freeze({
      id: 'tempo',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingTempoAdapter]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const budgetExceededAdapter = Object.freeze({
      id: 'tempo',
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

  it('telemetry sub-span fires cu adapterId="tempo" + durationMs + ok', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildOrchestratedCtx(userState, defaultConstraintObject());

    const subSpans = [];
    const results = await runPipeline(ctx, [tempoAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('tempo');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures errorCode + severity on missing-CO halt', async () => {
    const ctx = buildEngineContext(fixtureT1ActiveUser()); // no CO

    const subSpans = [];
    const results = await runPipeline(ctx, [tempoAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('tempo');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});

// ── Pipeline integration cu Periodization + GoalAdapt + Energy + Bayesian upstream ──

describe('Tempo Adapter — Pipeline integration 5-adapter chain (ADR 026 §1.10 sequential)', () => {
  it('Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo full chain Constraint Object frozen propagation end-to-end', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const results = await runPipeline(
      ctx,
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, tempoAdapter],
      { onSubSpan: (s) => subSpans.push(s) },
    );

    expect(results.length).toBe(5);
    expect(isOk(results[0])).toBe(true); // Periodization OK
    expect(isOk(results[1])).toBe(true); // Goal Adaptation OK (received CO)
    expect(isOk(results[2])).toBe(true); // Energy Adjustment OK (received CO via Hook 1)
    expect(isOk(results[3])).toBe(true); // Bayesian Nutrition OK (received CO via Hook 1)
    expect(isOk(results[4])).toBe(true); // Tempo OK (received CO via Hook 1)
    expect(results[0].output.id).toBe('periodization');
    expect(results[1].output.id).toBe('goalAdaptation');
    expect(results[2].output.id).toBe('energyAdjustment');
    expect(results[3].output.id).toBe('bayesianNutrition');
    expect(results[4].output.id).toBe('tempo');

    // 5 sub-spans all fired
    expect(subSpans.length).toBe(5);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[1].adapterId).toBe('goalAdaptation');
    expect(subSpans[2].adapterId).toBe('energyAdjustment');
    expect(subSpans[3].adapterId).toBe('bayesianNutrition');
    expect(subSpans[4].adapterId).toBe('tempo');
  });

  it('Constraint Object surfaced post Tempo for downstream propagation (preserved din Energy Adjustment Hook 4 via orchestrator currentCtx chain)', async () => {
    const userState = fixtureT1ActiveUser();
    const ctx = buildEngineContext(userState);

    // Inspector adapter checks ctx.meta.constraintObject after Tempo
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
      [periodizationAdapter, goalAdaptationAdapter, energyAdjustmentAdapter, bayesianNutritionAdapter, tempoAdapter, inspectorAdapter],
    );

    expect(results.length).toBe(6);
    expect(isOk(results[5])).toBe(true);

    // Inspector received frozen Constraint Object preserved din upstream
    // Energy Adjustment Hook 4 emission (Tempo adapter NU re-emit, dar
    // orchestrator currentCtx chain preserved)
    expect(spy).toHaveBeenCalledTimes(1);
    const propagatedCO = spy.mock.calls[0][0];
    expect(propagatedCO).toBeTruthy();
    expect(Object.isFrozen(propagatedCO)).toBe(true);
    expect(propagatedCO.immutable_snapshot).toBe(true); // anti-cascade preserved
    expect(propagatedCO.phase).toBeTruthy(); // phase preserved post chain

    // Tempo adapter NU expose constraintObject in output (Bayesian Nutrition /
    // Goal Adaptation pattern, NU Energy Adjustment Hook 4 re-emission pattern)
    const tempoOutput = results[4].output;
    expect(tempoOutput.constraintObject).toBeUndefined();
  });

  it('Periodization fails hard → Goal Adaptation + Energy Adjustment + Bayesian + Tempo skipped (cascade halt §3.6)', async () => {
    const ctx = buildEngineContext(fixtureT1ActiveUser());

    const failingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated upstream fault', severity: 'hard' }),
    });

    const goalAdSpy = vi.fn(goalAdaptationAdapter.invoke.bind(goalAdaptationAdapter));
    const energySpy = vi.fn(energyAdjustmentAdapter.invoke.bind(energyAdjustmentAdapter));
    const bayesianSpy = vi.fn(bayesianNutritionAdapter.invoke.bind(bayesianNutritionAdapter));
    const tempoSpy = vi.fn(tempoAdapter.invoke.bind(tempoAdapter));

    const results = await runPipeline(ctx, [
      failingPeriodAdapter,
      Object.freeze({ id: 'goalAdaptation', invoke: goalAdSpy }),
      Object.freeze({ id: 'energyAdjustment', invoke: energySpy }),
      Object.freeze({ id: 'bayesianNutrition', invoke: bayesianSpy }),
      Object.freeze({ id: 'tempo', invoke: tempoSpy }),
    ]);

    expect(results.length).toBe(1); // halted dupa Periodization hard fail
    expect(results[0].error.code).toBe('INVALID_INPUT');
    expect(results[0].error.severity).toBe('hard');
    expect(goalAdSpy).not.toHaveBeenCalled();
    expect(energySpy).not.toHaveBeenCalled();
    expect(bayesianSpy).not.toHaveBeenCalled();
    expect(tempoSpy).not.toHaveBeenCalled();
  });

  it('Bayesian Nutrition fails hard mid-pipeline → Tempo skipped (downstream halt cascade)', async () => {
    const ctx = buildEngineContext(fixtureT1ActiveUser());

    const failingBayesianAdapter = Object.freeze({
      id: 'bayesianNutrition',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'simulated mid-pipeline fault', severity: 'hard' }),
    });

    const tempoSpy = vi.fn(tempoAdapter.invoke.bind(tempoAdapter));

    const results = await runPipeline(ctx, [
      periodizationAdapter,
      goalAdaptationAdapter,
      energyAdjustmentAdapter,
      failingBayesianAdapter,
      Object.freeze({ id: 'tempo', invoke: tempoSpy }),
    ]);

    expect(results.length).toBe(4); // Periodization OK + Goal OK + Energy OK + Bayesian hard halt
    expect(isOk(results[0])).toBe(true);
    expect(isOk(results[1])).toBe(true);
    expect(isOk(results[2])).toBe(true);
    expect(results[3].ok).toBe(false);
    expect(results[3].error.severity).toBe('hard');
    expect(tempoSpy).not.toHaveBeenCalled();
  });
});
