// End-to-end NaN/Infinity invariant — fast-check fuzz over the canonical
// coaching pipeline. ADR 026 §9 + ADR 030 D4: engines are TOTAL functions and
// MUST NEVER emit NaN / Infinity / non-finite numerics across arbitrary valid
// user states (false-confidence gap — a single unguarded division surfaces as
// NaN in the UI silently). Same property-based approach as kcal-floor.test.ts.
//
// Two canonical entry points fuzzed:
//   1. runPipeline(buildEngineContext(userState), ORDERED_ADAPTERS) — the full
//      8-adapter orchestrated pipeline (ADR 030 D1 topology).
//   2. coachDirector.buildSession(type) — the session orchestrator that wires
//      the legacy engines (predictionEngine / dp / readiness / reality / ...).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { runPipeline } from '../../../src/coach/orchestrator/index.js';
import { ORDERED_ADAPTERS } from '../../../src/coach/orchestrator/adapters/index.js';
import { buildEngineContext } from '../../../src/coach/orchestrator/contextBuilder.js';
import { coachDirector } from '../../../src/engine/coachDirector.js';
import { tod } from '../../../src/db.js';

// CDL writes are non-deterministic side effects (Date.now id) — stub so the
// fuzz stays pure + fast (mirror src/engine/__tests__/coachDirector.test.js).
vi.mock('../../../src/util/coachDecisionLog.js', async () => {
  const actual = await vi.importActual('../../../src/util/coachDecisionLog.js');
  return {
    ...actual,
    writeProposed: vi.fn((entry: Record<string, unknown>) => ({ ...entry, id: 'fuzz_cdl', ts: 0 })),
  };
});

/**
 * Recursively assert every numeric leaf in `value` is Number.isFinite. Throws
 * with the offending path so a counter-example pinpoints the engine field.
 */
function assertAllFinite(value: unknown, path = 'result'): void {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`non-finite number at ${path}: ${String(value)}`);
    }
    return;
  }
  if (value == null || typeof value !== 'object') return;
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) {
      throw new Error(`invalid Date at ${path}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertAllFinite(v, `${path}[${i}]`));
    return;
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    assertAllFinite(v, `${path}.${k}`);
  }
}

const finiteDouble = (min: number, max: number) =>
  fc.double({ min, max, noNaN: true, noDefaultInfinity: true });

// ── runPipeline arbitraries ─────────────────────────────────────────────────

const userArb = fc.record(
  {
    sex: fc.constantFrom('M', 'F'),
    age: fc.integer({ min: 14, max: 90 }),
    kg: finiteDouble(30, 250),
    bf: finiteDouble(3, 60),
    experience: fc.constantFrom('beginner', 'intermediate', 'advanced'),
    goal: fc.constantFrom('forta', 'hipertrofie', 'slabit', 'mentinere'),
    emoji: fc.constantFrom('🟢', '🟡', '🔴'),
  },
  { requiredKeys: [] },
);

const sessionArb = fc.record({
  date: fc.constantFrom('2026-04-30', '2026-05-02', '2026-05-04', '2026-05-10'),
  volume: finiteDouble(0, 60),
  intensity: finiteDouble(0, 1.2),
  subFloor: fc.boolean(),
});

const metaArb = fc.record(
  {
    weeksElapsed: fc.integer({ min: 0, max: 80 }),
    bayesianSigma: finiteDouble(0, 5),
    stagnationDetected: fc.boolean(),
    currentSessionSubFloor: fc.boolean(),
    compositeLowSignals: fc.boolean(),
    recentAdjustmentDirections: fc.array(fc.constantFrom('UP', 'DOWN', 'NONE'), { maxLength: 5 }),
  },
  { requiredKeys: [] },
);

const userStateArb = fc.record(
  {
    user: userArb,
    recentSessions: fc.array(sessionArb, { maxLength: 14 }),
    weights: fc.dictionary(
      fc.constantFrom('squat', 'bench', 'deadlift', 'ohp'),
      finiteDouble(0, 400),
      { maxKeys: 4 },
    ),
    profileTier: fc.constantFrom(null, 'T0', 'T1', 'T2', 'T3'),
    flags: fc.constant({}),
    meta: metaArb,
  },
  { requiredKeys: [] },
);

// runPipeline expects a mutable array; ORDERED_ADAPTERS is frozen (readonly).
const pipelineAdapters = [...ORDERED_ADAPTERS];

describe('Pipeline finite invariant — runPipeline (ADR 030 D4 totality)', () => {
  it('every numeric field across all adapter results is finite (no NaN/Infinity)', async () => {
    await fc.assert(
      fc.asyncProperty(userStateArb, async (userState) => {
        const ctx = buildEngineContext(userState);
        const results = await runPipeline(ctx, pipelineAdapters);
        // Pipeline may halt on a hard err — every result we DID get must be finite.
        assertAllFinite(results, 'pipeline');
      }),
      { numRuns: 400 },
    );
  });

  it('handles empty / minimal user state without emitting non-finite numerics', async () => {
    const ctx = buildEngineContext({});
    const results = await runPipeline(ctx, pipelineAdapters);
    expect(() => assertAllFinite(results)).not.toThrow();
  });
});

// ── coachDirector arbitraries (localStorage-driven) ─────────────────────────

const logArb = fc.record({
  ex: fc.constantFrom(
    'Lat Pulldown',
    'Cable Row',
    'Incline DB Press',
    'DB Shoulder Press',
    'Leg Press',
    'Lateral Raises',
    'Bayesian Curl',
  ),
  w: finiteDouble(0, 300),
  reps: fc.integer({ min: 0, max: 30 }),
  rpe: finiteDouble(1, 10),
});

const SESSION_TYPES = ['PUSH', 'PULL', 'UMERI_BRATE', 'PICIOARE', 'UNKNOWN_TYPE'];

describe('Pipeline finite invariant — coachDirector.buildSession (ADR 026 §9)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('phase-override', 'AUTO');
  });

  it('every numeric field in the built session is finite across arbitrary state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          readinessScore: fc.integer({ min: 10, max: 100 }),
          kcal: fc.integer({ min: 800, max: 5000 }),
          phase: fc.constantFrom('AUTO', 'CUT', 'BULK', 'MAINTENANCE', 'STRENGTH'),
          logs: fc.array(logArb, { maxLength: 20 }),
          sessionType: fc.constantFrom(...SESSION_TYPES),
        }),
        async ({ readinessScore, kcal, phase, logs, sessionType }) => {
          localStorage.clear();
          const today = tod();
          localStorage.setItem('readiness', JSON.stringify({ [today]: { score: readinessScore, emoji: '😐' } }));
          localStorage.setItem('phase-override', phase);
          localStorage.setItem('current-kcal', String(kcal));
          const stamped = logs.map((l, i) => ({ ...l, date: today, session: i + 1 }));
          localStorage.setItem('logs', JSON.stringify(stamped));

          const session = await coachDirector.buildSession(sessionType);
          assertAllFinite(session, 'session');
        },
      ),
      { numRuns: 200 },
    );
  });

  it('rest-day + readiness-not-set branches stay finite', async () => {
    // readiness not set → requiresReadinessInput path
    localStorage.clear();
    localStorage.setItem('phase-override', 'AUTO');
    const noReadiness = await coachDirector.buildSession('PUSH');
    expect(() => assertAllFinite(noReadiness)).not.toThrow();

    // low readiness → rest-day path
    const today = tod();
    localStorage.setItem('readiness', JSON.stringify({ [today]: { score: 20, emoji: '😴' } }));
    const restDay = await coachDirector.buildSession('PUSH');
    expect(() => assertAllFinite(restDay)).not.toThrow();
  });
});
