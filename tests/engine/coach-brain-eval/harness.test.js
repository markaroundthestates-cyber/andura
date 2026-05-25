// Coach Brain Eval — harness self-tests.
//
// Validates the eval harness itself (NOT the engines): determinism of the
// generator, that the pipeline runs cleanly for generated scenarios, that
// invariants genuinely catch injected violations, comparator tolerance bands,
// and oracle graceful-skip + serializer fairness.
//
// Scope: scripts/coach-brain-eval/*. Engine correctness is validated by the
// invariant RESULTS (a separate concern); here we prove the meter is honest.

import { describe, it, expect } from 'vitest';
import {
  generateScenario,
  generateScenarios,
  edgeScenarios,
  ARCHETYPES,
} from '../../../scripts/coach-brain-eval/generator.js';
import { runScenario, runAll } from '../../../scripts/coach-brain-eval/runner.js';
import {
  checkCorridor,
  checkKcalFloor,
  checkDeloadWeek4,
  checkNoBadNumbers,
  checkSafetyBounds,
  checkScenario,
  runInvariants,
} from '../../../scripts/coach-brain-eval/invariants.js';
import { compareDimensions, COMPARATORS } from '../../../scripts/coach-brain-eval/comparators.js';
import {
  serializeEngineContextForJudge,
  oracleAvailable,
  callOracle,
  extractJson,
  cacheKey,
} from '../../../scripts/coach-brain-eval/oracle.js';
import { buildEngineContext } from '../../../src/coach/orchestrator/contextBuilder.js';

describe('generator — determinism + shape', () => {
  it('same seed yields byte-identical scenario (reproducible at scale)', () => {
    const a = generateScenario(123, { archetype: 'marius' });
    const b = generateScenario(123, { archetype: 'marius' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('different seeds yield different scenarios', () => {
    const a = generateScenario(1, { archetype: 'marius' });
    const b = generateScenario(2, { archetype: 'marius' });
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it('stratifies archetypes evenly across a batch', () => {
    const scs = generateScenarios(30, { baseSeed: 1 });
    const counts = {};
    for (const s of scs) counts[s.archetype] = (counts[s.archetype] || 0) + 1;
    expect(counts.gigel).toBe(10);
    expect(counts.marius).toBe(10);
    expect(counts.maria).toBe(10);
  });

  it('produces userState in the EngineContext shape engines consume', () => {
    const { userState } = generateScenario(5, { archetype: 'marius' });
    expect(userState.user).toHaveProperty('sex');
    expect(userState.user).toHaveProperty('age');
    expect(userState.user).toHaveProperty('goal');
    expect(Array.isArray(userState.recentSessions)).toBe(true);
    expect(userState.meta).toHaveProperty('weeksElapsed');
    expect(Array.isArray(userState.meta.observations)).toBe(true);
  });

  it('edge scenarios include all guaranteed-coverage cases', () => {
    const ids = edgeScenarios().map((s) => s.id);
    expect(ids).toContain('edge-deload-week4-marius');
    expect(ids).toContain('edge-subfloor-kcal-maria');
    expect(ids).toContain('edge-coldstart-gigel');
  });
});

describe('runner — full pipeline executes cleanly', () => {
  it('runs all 8 adapters OK for a well-formed scenario (no hard-halt)', async () => {
    const { results, decision } = await runScenario(generateScenario(10, { archetype: 'marius' }));
    expect(results.length).toBe(8);
    expect(decision.ok).toBe(true);
    expect(decision.haltedAt).toBeNull();
  });

  it('normalized decision exposes every dimension', async () => {
    const { decision } = await runScenario(generateScenario(11, { archetype: 'maria' }));
    const d = decision.dimensions;
    for (const dim of ['volume', 'phaseGoal', 'energy', 'nutrition', 'specialization', 'deload']) {
      expect(d).toHaveProperty(dim);
    }
  });

  it('pipeline output is deterministic (same scenario → same decision)', async () => {
    const sc = generateScenario(42, { archetype: 'gigel' });
    const r1 = await runScenario(sc);
    const r2 = await runScenario(sc);
    expect(JSON.stringify(r1.decision.dimensions)).toBe(JSON.stringify(r2.decision.dimensions));
  });
});

describe('invariants — genuinely catch violations (meter is honest)', () => {
  it('I1 corridor flags floor > ceiling', () => {
    const bad = { dimensions: { volume: { constraintObject: { intensity_pct_1rm: { floor: 0.9, ceiling: 0.5 }, volume_per_muscle: {} } } } };
    expect(checkCorridor(bad).length).toBeGreaterThan(0);
  });

  it('I1 corridor passes when floor <= ceiling', () => {
    const ok = { dimensions: { volume: { constraintObject: { intensity_pct_1rm: { floor: 0.5, ceiling: 0.9 }, volume_per_muscle: { chest: { floor: 8, ceiling: 14 } } }, intensityCorridor: { floor: 0.5, ceiling: 0.9 } } } };
    expect(checkCorridor(ok)).toEqual([]);
  });

  it('I2 kcal floor flags wrong min + wrong excludedCount', () => {
    const scenario = { userState: { meta: { observations: [{ kcalDaily: 900 }, { kcalDaily: 1300 }] } } };
    const decision = { dimensions: { nutrition: { kcalFloorMin: 1000, kcalFloorExcluded: 0 } } };
    const v = checkKcalFloor(decision, scenario);
    expect(v.length).toBe(2); // wrong min + wrong count (expected 1 excluded)
  });

  it('I2 kcal floor passes with correct min + count', () => {
    const scenario = { userState: { meta: { observations: [{ kcalDaily: 900 }, { kcalDaily: 1300 }] } } };
    const decision = { dimensions: { nutrition: { kcalFloorMin: 1200, kcalFloorExcluded: 1 } } };
    expect(checkKcalFloor(decision, scenario)).toEqual([]);
  });

  it('I3 deload week4 flags missing DELOAD when week === 4', () => {
    const scenario = { userState: { meta: { weeksElapsed: 3 } } }; // (3 % 4)+1 = 4
    const decision = { dimensions: { volume: { phase: 'LOAD' }, deload: { deloadState: 'IDLE' } }, raw: {} };
    const v = checkDeloadWeek4(decision, scenario);
    expect(v.length).toBeGreaterThan(0);
  });

  it('I3 deload week4 passes for non-week4', () => {
    const scenario = { userState: { meta: { weeksElapsed: 1 } } }; // week 2
    const decision = { dimensions: { volume: { phase: 'LOAD+' }, deload: { deloadState: 'IDLE' } }, raw: {} };
    expect(checkDeloadWeek4(decision, scenario)).toEqual([]);
  });

  it('I4 detects NaN / undefined / Infinity in outputs', () => {
    const decision = { dimensions: { deload: { depthPct: NaN }, energy: { adjustmentMagnitudePct: Infinity }, volume: { phase: undefined } } };
    const v = checkNoBadNumbers(decision);
    expect(v.some((m) => m.includes('NaN'))).toBe(true);
    expect(v.some((m) => m.includes('Infinity'))).toBe(true);
    expect(v.some((m) => m.includes('undefined'))).toBe(true);
  });

  it('I6 safety flags depth out of [0,100] + hard-halt', () => {
    const decision = { haltedAt: 'deload', pipelineErrors: [{ adapter: 'deload', code: 'INVALID_INPUT' }], dimensions: { deload: { depthPct: 150 } } };
    const v = checkSafetyBounds(decision);
    expect(v.some((m) => m.includes('out of [0,100]'))).toBe(true);
    expect(v.some((m) => m.includes('hard-halted'))).toBe(true);
  });

  it('runInvariants tallies a clean batch as zero violations', async () => {
    const runs = await runAll(generateScenarios(15, { baseSeed: 1 }));
    const res = runInvariants(runs);
    expect(res.totalScenarios).toBe(15);
    expect(res.totalViolations).toBe(0);
  });

  it('checkScenario aggregates per-invariant violations', () => {
    const scenario = { id: 's-bad', archetype: 'marius', userState: { meta: { weeksElapsed: 3, observations: [] } } };
    const decision = {
      haltedAt: null, pipelineErrors: [],
      dimensions: { volume: { phase: 'LOAD', constraintObject: { intensity_pct_1rm: { floor: 1, ceiling: 0 }, volume_per_muscle: {} } }, deload: { deloadState: 'IDLE' } },
      raw: {},
    };
    const out = checkScenario(scenario, decision);
    const codes = out.violations.map((v) => v.invariant);
    expect(codes).toContain('I1_corridor');
    expect(codes).toContain('I3_deload_week4');
  });
});

describe('comparators — tolerance bands', () => {
  it('categorical exact match (phase) is case-insensitive', () => {
    const r = COMPARATORS.phase({ volume: { phase: 'DELOAD' } }, { phase: 'deload' });
    expect(r.agree).toBe(true);
  });

  it('deload depth agrees within +-10pp, disagrees beyond', () => {
    expect(COMPARATORS.deloadDepth({ deload: { depthPct: 45 } }, { deloadDepthPct: 52 }).agree).toBe(true);
    expect(COMPARATORS.deloadDepth({ deload: { depthPct: 45 } }, { deloadDepthPct: 70 }).agree).toBe(false);
  });

  it('tdeeDirection derives argmax from likelihood probabilities', () => {
    const dims = { nutrition: { likelihood: { deficit_likelihood: 0.7, surplus_likelihood: 0.1, maintenance_likelihood: 0.2 } } };
    expect(COMPARATORS.tdeeDirection(dims, { tdeeDirection: 'deficit' }).agree).toBe(true);
    expect(COMPARATORS.tdeeDirection(dims, { tdeeDirection: 'surplus' }).agree).toBe(false);
  });

  it('compareDimensions only scores dimensions the oracle returned (abstain-safe)', () => {
    const dims = { volume: { phase: 'DELOAD' }, deload: { deloadState: 'SCHEDULED_LINEAR' } };
    const claude = { phase: 'DELOAD' }; // only phase present
    const cmp = compareDimensions(dims, claude);
    expect(cmp.totalCount).toBe(1);
    expect(cmp.agreeCount).toBe(1);
  });
});

describe('oracle — fairness + graceful skip', () => {
  it('serializer exposes ONLY EngineContext fields (no hidden context, §7.2)', () => {
    const ctx = buildEngineContext(generateScenario(7, { archetype: 'marius' }).userState);
    const s = serializeEngineContextForJudge(ctx);
    expect(Object.keys(s).sort()).toEqual(['meta', 'profileTier', 'recentSessions', 'user', 'weights']);
    // meta exposed to the judge must be a strict subset (no constraintObject leak etc.).
    expect(Object.keys(s.meta).sort()).toEqual(['emoji', 'observations', 'weeksElapsed']);
  });

  it('serializer is deterministic for the same ctx', () => {
    const ctx = buildEngineContext(generateScenario(8, { archetype: 'maria' }).userState);
    expect(JSON.stringify(serializeEngineContextForJudge(ctx))).toBe(JSON.stringify(serializeEngineContextForJudge(ctx)));
  });

  it('callOracle skips gracefully when no API key', async () => {
    if (oracleAvailable()) return; // only assert the skip path when key absent
    const ctx = buildEngineContext(generateScenario(9, { archetype: 'gigel' }).userState);
    const res = await callOracle(ctx);
    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
  });

  it('extractJson parses fenced + bare JSON', () => {
    expect(extractJson('```json\n{"phase":"DELOAD"}\n```')).toEqual({ phase: 'DELOAD' });
    expect(extractJson('noise {"a":1} trailing')).toEqual({ a: 1 });
    expect(extractJson('not json at all')).toBeNull();
  });

  it('cacheKey is stable for same (model, prompt)', () => {
    expect(cacheKey('m', 'p')).toBe(cacheKey('m', 'p'));
    expect(cacheKey('m', 'p')).not.toBe(cacheKey('m', 'q'));
  });
});
