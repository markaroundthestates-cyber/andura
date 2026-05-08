// Periodization Adapter — Golden-master parity tests legacy↔orchestrated.
//
// Faza 3 STRANGLER batch 1 (ADR 030 D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1
// 2026-05-08; ADR 026 §42.10 pipeline #1): zero-behavior-change strict between
// legacy direct `evaluate(ctx)` invocation and orchestrated `runPipeline(ctx,
// [periodizationAdapter])` path. Golden-master pattern per ADR 030 §3.6 table
// + Faza 3 STRANGLER acceptance gate.
//
// Adapter D2 thin scope strict: pure shape mapping `engineContext →
// engineInput` + Result wrap + Constraint Object surface. NO business logic.
// Identical input → identical engine output → identical adapter output.
//
// 3 fixture cases minim cover ADR 026 §9.1 spec V1:
//   1. T0 fresh user — empty ctx, default behavior (tier 'none')
//   2. T1 active user — moderate recentSessions + calibrated weights
//   3. T2 power user — long history + complex meta context
//
// Plus 3 edge case tests:
//   - Engine throws → ENGINE_THREW 'hard' severity halt (D4 violation insurance)
//   - BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6 alignment)
//   - Constraint Object frozen post-orchestrated path (immutability assertion)
//
// See: 03-decisions/030-adapter-design-pattern.md §3 RESOLVED V1
//      src/engine/periodization/index.js (engine V1 LANDED commit `1303b62`)

import { describe, it, expect, vi } from 'vitest';
import { evaluate as evaluatePeriodization } from '../../../engine/periodization/index.js';
import { periodizationAdapter } from '../adapters/periodizationAdapter.js';
import { runPipeline } from '../index.js';
import { buildEngineContext } from '../contextBuilder.js';
import { ok, err, isOk } from '../result.js';

// ── Fixtures ────────────────────────────────────────────────────────────────

function fixtureT0() {
  // T0 fresh user — minimal ctx, default behavior (tier 'none')
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
  // T1 active user — moderate recentSessions + calibrated weights
  return {
    user: {
      sex: 'M',
      age: 30,
      kg: 80,
      bf: 18,
      experience: 'intermediate',
      goal: 'forta',
    },
    recentSessions: [
      { date: '2026-04-30', volume: 12, intensity: 0.78 },
      { date: '2026-05-02', volume: 14, intensity: 0.80 },
      { date: '2026-05-04', volume: 13, intensity: 0.82 },
    ],
    weights: { squat: 100, bench: 80, deadlift: 120 },
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 5 },
  };
}

function fixtureT2() {
  // T2 power user — long history + complex meta context
  return {
    user: {
      sex: 'M',
      age: 35,
      kg: 85,
      bf: 14,
      experience: 'advanced',
      goal: 'forta',
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
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strip the adapter-only `constraintObject` surface field added by D2 thin
 * scope so we can deep-equal against legacy engine output (which keeps
 * Constraint Object inside `trace.constraintObject` per ADR 026 §9.1 spec).
 */
function stripAdapterSurface(adapterOutput) {
  if (!adapterOutput || typeof adapterOutput !== 'object') return adapterOutput;
  const { constraintObject: _surfaced, ...engineOutput } = adapterOutput;
  return engineOutput;
}

// ── Golden-master parity ────────────────────────────────────────────────────

describe('Periodization Adapter — Golden-master parity legacy↔orchestrated (ADR 030 §3 + ADR 026 §9.1)', () => {
  it('T0 fresh user — legacy direct call ≡ orchestrated path (zero-behavior-change)', async () => {
    const userState = fixtureT0();
    const ctx = buildEngineContext(userState);

    // Legacy: direct engine call
    const legacyOutput = await evaluatePeriodization(ctx);

    // Orchestrated: via runPipeline + periodizationAdapter
    const orchestratedResults = await runPipeline(ctx, [periodizationAdapter]);
    expect(orchestratedResults.length).toBe(1);
    expect(isOk(orchestratedResults[0])).toBe(true);

    // Strip adapter-only `constraintObject` surface — engine result is canonical.
    const orchestratedEngine = stripAdapterSurface(orchestratedResults[0].output);

    expect(orchestratedEngine).toEqual(legacyOutput);
    expect(orchestratedEngine.tier).toBe('none'); // empty user → 'none' per ADR 026 §9.1
  });

  it('T1 active user — legacy direct call ≡ orchestrated path (zero-behavior-change)', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    const legacyOutput = await evaluatePeriodization(ctx);

    const orchestratedResults = await runPipeline(ctx, [periodizationAdapter]);
    expect(isOk(orchestratedResults[0])).toBe(true);
    const orchestratedEngine = stripAdapterSurface(orchestratedResults[0].output);

    expect(orchestratedEngine).toEqual(legacyOutput);
    expect(orchestratedEngine.id).toBe('periodization');
    expect(['LOW', 'MED', 'HIGH', 'none']).toContain(orchestratedEngine.tier);
  });

  it('T2 power user — legacy direct call ≡ orchestrated path (zero-behavior-change)', async () => {
    const userState = fixtureT2();
    const ctx = buildEngineContext(userState);

    const legacyOutput = await evaluatePeriodization(ctx);

    const orchestratedResults = await runPipeline(ctx, [periodizationAdapter]);
    expect(isOk(orchestratedResults[0])).toBe(true);
    const orchestratedEngine = stripAdapterSurface(orchestratedResults[0].output);

    expect(orchestratedEngine).toEqual(legacyOutput);
    expect(orchestratedEngine.confidence).toBe('high'); // hasUser + hasRecentSessions + hasMacrocycleAnchor
  });
});

// ── Edge cases ──────────────────────────────────────────────────────────────

describe('Periodization Adapter — Edge cases (ADR 030 §3.6 + Q-OPEN-2 + Q-OPEN-6)', () => {
  it('engine throws → ENGINE_THREW err with severity hard (D4 violation insurance)', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    // Forge a throwing adapter (engine itself NEVER throws per spec — but
    // adapter-level catch insurance per ADR 030 §3.6 ENGINE_THREW taxonomy).
    const throwingPeriodAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => {
        throw new Error('simulated engine fault for D4 violation insurance');
      },
    });

    const results = await runPipeline(ctx, [throwingPeriodAdapter]);
    expect(results.length).toBe(1);
    expect(results[0].ok).toBe(false);
    // ADAPTER_THREW (orchestrator catches throw — adapter that throws is D4 violation)
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
  });

  it('BUDGET_EXCEEDED simulated → soft severity continues (Q-OPEN-2 + §3.6 alignment)', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    // Forge an adapter returning BUDGET_EXCEEDED soft severity.
    const budgetExceededAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'BUDGET_EXCEEDED', message: 'over 50ms budget', severity: 'soft' }),
    });
    // Plus a downstream OK adapter to confirm continue-graceful.
    const downstreamOk = Object.freeze({
      id: 'downstream',
      invoke: async () => ok({ value: 'reached' }),
    });

    const results = await runPipeline(ctx, [budgetExceededAdapter, downstreamOk]);
    expect(results.length).toBe(2);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('BUDGET_EXCEEDED');
    expect(results[0].error.severity).toBe('soft');
    expect(results[1].ok).toBe(true);
    expect(results[1].output.value).toBe('reached');
  });

  it('Constraint Object frozen post-orchestrated path + propagated to downstream meta', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    // Spy downstream adapter inspects ctx.meta.constraintObject after Periodization
    const spy = vi.fn();
    const inspectorAdapter = Object.freeze({
      id: 'inspector',
      invoke: async (downstreamCtx) => {
        spy(downstreamCtx.meta?.constraintObject);
        return ok({ inspected: true });
      },
    });

    const results = await runPipeline(ctx, [periodizationAdapter, inspectorAdapter]);

    expect(results.length).toBe(2);
    expect(isOk(results[0])).toBe(true);
    expect(isOk(results[1])).toBe(true);

    // Adapter exposes constraintObject în output (frozen)
    const co = results[0].output.constraintObject;
    expect(co).toBeTruthy();
    expect(Object.isFrozen(co)).toBe(true);

    // Downstream adapter received frozen Constraint Object via ctx.meta
    expect(spy).toHaveBeenCalledTimes(1);
    const propagated = spy.mock.calls[0][0];
    expect(propagated).toBeTruthy();
    expect(Object.isFrozen(propagated)).toBe(true);
    expect(propagated.immutable_snapshot).toBe(true); // per Periodization §9.6 ConstraintObject typedef
    expect(propagated).toBe(co); // same frozen reference propagated
  });

  it('telemetry sub-span fires per adapter call (Q-OPEN-3 RESOLVED V1 + ADR 011 schema)', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    const subSpans = [];
    const onSubSpan = (s) => subSpans.push(s);

    const results = await runPipeline(ctx, [periodizationAdapter], { onSubSpan });

    expect(results.length).toBe(1);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[0].ok).toBe(true);
    expect(typeof subSpans[0].durationMs).toBe('number');
    expect(subSpans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('telemetry sub-span captures err code + severity când adapter fails', async () => {
    const userState = fixtureT1();
    const ctx = buildEngineContext(userState);

    const failingAdapter = Object.freeze({
      id: 'periodization',
      invoke: async () => err({ code: 'INVALID_INPUT', message: 'bad shape', severity: 'hard' }),
    });

    const subSpans = [];
    const results = await runPipeline(ctx, [failingAdapter], { onSubSpan: (s) => subSpans.push(s) });

    expect(results[0].ok).toBe(false);
    expect(subSpans.length).toBe(1);
    expect(subSpans[0].adapterId).toBe('periodization');
    expect(subSpans[0].ok).toBe(false);
    expect(subSpans[0].errorCode).toBe('INVALID_INPUT');
    expect(subSpans[0].severity).toBe('hard');
  });
});
