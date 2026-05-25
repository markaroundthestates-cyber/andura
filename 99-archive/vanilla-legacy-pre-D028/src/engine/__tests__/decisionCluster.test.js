import { describe, it, expect, vi } from 'vitest';
import { DecisionCluster, decisionCluster } from '../decisionCluster.js';
import { createDimensionResult, ACTIONS } from '../dimensionContract.js';

const rec = (overrides = {}) => ({
  action: ACTIONS.REDUCE_VOLUME,
  priority: 50,
  payload: { multiplier: 0.9 },
  rationale: 'test',
  ...overrides,
});

const result = (id, overrides = {}) =>
  createDimensionResult({
    id,
    tier: 'MED',
    confidence: 'medium',
    recommendations: [],
    ...overrides,
  });

describe('decisionCluster — empty / no-op cases', () => {
  it('returns baseSession unchanged when no dimensions provided', async () => {
    const cluster = new DecisionCluster();
    const baseSession = { exercises: [{ name: 'Push', sets: 3 }], volumeMultiplier: 1 };
    const { session, trace } = await cluster.execute([], baseSession);
    expect(session.exercises).toEqual(baseSession.exercises);
    expect(session.volumeMultiplier).toBe(1);
    expect(trace.shortCircuited).toBe(false);
    expect(trace.errors).toEqual([]);
    expect(trace.stages.GATE.fired).toEqual([]);
    expect(trace.stages.ADJUSTMENT.fired).toEqual([]);
    expect(trace.stages.ENHANCEMENT.fired).toEqual([]);
  });

  it('handles non-array input by treating as empty', async () => {
    const cluster = new DecisionCluster();
    const { session, trace } = await cluster.execute(null, { foo: 'bar' });
    expect(session.foo).toBe('bar');
    expect(trace.shortCircuited).toBe(false);
  });

  it('does not mutate the input baseSession', async () => {
    const cluster = new DecisionCluster();
    const baseSession = { exercises: [{ name: 'A', sets: 4 }] };
    const before = JSON.stringify(baseSession);
    await cluster.execute(
      [result('D', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, payload: { multiplier: 0.5 } })] })],
      baseSession
    );
    expect(JSON.stringify(baseSession)).toBe(before);
  });

  it('exports a default singleton instance', () => {
    expect(decisionCluster).toBeInstanceOf(DecisionCluster);
  });
});

describe('decisionCluster — Stage 1 GATE short-circuit', () => {
  it('short-circuits when a gate_session recommendation fires', async () => {
    const cluster = new DecisionCluster();
    const dr = result('REST', {
      recommendations: [rec({ action: ACTIONS.GATE_SESSION, priority: 100, payload: { reason: 'rest_day' } })],
    });
    const { session, trace } = await cluster.execute([dr], { exercises: [{ name: 'X' }] });
    expect(trace.shortCircuited).toBe(true);
    expect(session.gated).toBe(true);
    expect(session.gateAction).toBe(ACTIONS.GATE_SESSION);
    expect(session.gateSource).toBe('REST');
    expect(session.exercises).toEqual([]);
    expect(trace.stages.GATE.winner.source).toBe('REST');
    expect(trace.stages.GATE.winner.priority).toBe(100);
  });

  it('highest-priority gate wins when multiple fire', async () => {
    const cluster = new DecisionCluster();
    const a = result('A', { recommendations: [rec({ action: ACTIONS.GATE_SESSION, priority: 50, rationale: 'A' })] });
    const b = result('B', { recommendations: [rec({ action: ACTIONS.GATE_SESSION, priority: 95, rationale: 'B' })] });
    const c = result('C', { recommendations: [rec({ action: ACTIONS.GATE_SESSION, priority: 70, rationale: 'C' })] });
    const { trace } = await cluster.execute([a, b, c], {});
    expect(trace.stages.GATE.winner.source).toBe('B');
    expect(trace.stages.GATE.winner.priority).toBe(95);
    expect(trace.stages.GATE.fired).toHaveLength(3);
    expect(trace.stages.GATE.overridden.map(o => o.source).sort()).toEqual(['A', 'C']);
  });

  it('all non-winning recommendations (across stages) are recorded as overridden', async () => {
    const cluster = new DecisionCluster();
    const gateD = result('GATE', {
      recommendations: [rec({ action: ACTIONS.GATE_SESSION, priority: 95 })],
    });
    const adjD = result('ADJ', {
      recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, priority: 65, payload: { multiplier: 0.9 } })],
    });
    const enhD = result('ENH', {
      recommendations: [rec({ action: ACTIONS.INJECT_BANNER, priority: 30, payload: { msg: 'hi' } })],
    });
    const { trace } = await cluster.execute([gateD, adjD, enhD], {});
    expect(trace.stages.GATE.overridden.map(o => o.source).sort()).toEqual(['ADJ', 'ENH']);
    expect(trace.stages.ADJUSTMENT.fired).toEqual([]);   // skipped due to short-circuit
    expect(trace.stages.ENHANCEMENT.fired).toEqual([]);
  });
});

describe('decisionCluster — Stage 2 ADJUSTMENT', () => {
  it('composes volume multipliers multiplicatively (0.9 × 0.7 = 0.63)', async () => {
    const cluster = new DecisionCluster();
    const a = result('A', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, priority: 75, payload: { multiplier: 0.9 } })] });
    const b = result('B', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, priority: 65, payload: { multiplier: 0.7 } })] });
    const { session, trace } = await cluster.execute([a, b], { volumeMultiplier: 1 });
    expect(trace.stages.ADJUSTMENT.composedVolumeMultiplier).toBeCloseTo(0.63, 5);
    expect(session.volumeMultiplier).toBeCloseTo(0.63, 5);
    expect(trace.stages.ADJUSTMENT.fired).toHaveLength(2);
  });

  it('composed multiplier respects existing baseSession.volumeMultiplier', async () => {
    const cluster = new DecisionCluster();
    const a = result('A', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, payload: { multiplier: 0.5 } })] });
    const { session } = await cluster.execute([a], { volumeMultiplier: 0.8 });
    // 0.8 * 0.5 = 0.4
    expect(session.volumeMultiplier).toBeCloseTo(0.4, 5);
  });

  it('composes sets caps via minimum (most restrictive wins)', async () => {
    const cluster = new DecisionCluster();
    const a = result('A', { recommendations: [rec({ action: ACTIONS.REDUCE_SETS, priority: 70, payload: { cap: 12 } })] });
    const b = result('B', { recommendations: [rec({ action: ACTIONS.REDUCE_SETS, priority: 60, payload: { cap: 8 } })] });
    const c = result('C', { recommendations: [rec({ action: ACTIONS.REDUCE_SETS, priority: 50, payload: { cap: 10 } })] });
    const { session, trace } = await cluster.execute([a, b, c], {});
    expect(trace.stages.ADJUSTMENT.composedSetsCap).toBe(8);
    expect(session.setsCap).toBe(8);
  });

  it('applies calibrate_aa_threshold by stashing payload on session', async () => {
    const cluster = new DecisionCluster();
    const dr = result('VITALITY', {
      recommendations: [rec({ action: ACTIONS.CALIBRATE_AA_THRESHOLD, payload: { tighten: true } })],
    });
    const { session } = await cluster.execute([dr], {});
    expect(session.aaThresholdCalibration).toEqual({ tighten: true });
  });

  it('applies set_baseline_volume + set_baseline_frequency', async () => {
    const cluster = new DecisionCluster();
    const dr = result('DEMO', {
      recommendations: [
        rec({ action: ACTIONS.SET_BASELINE_VOLUME, payload: { sets: 16 } }),
        rec({ action: ACTIONS.SET_BASELINE_FREQUENCY, payload: { target: 3.5 } }),
      ],
    });
    const { session } = await cluster.execute([dr], {});
    expect(session.baselineVolume).toBe(16);
    expect(session.baselineFrequency).toBe(3.5);
  });

  it('orders fired adjustments by priority DESC for trace determinism', async () => {
    const cluster = new DecisionCluster();
    const dims = [
      result('LOW', { recommendations: [rec({ priority: 30 })] }),
      result('HIGH', { recommendations: [rec({ priority: 90 })] }),
      result('MED', { recommendations: [rec({ priority: 60 })] }),
    ];
    const { trace } = await cluster.execute(dims, {});
    const priorities = trace.stages.ADJUSTMENT.fired.map(f => f.priority);
    expect(priorities).toEqual([90, 60, 30]);
  });

  it('logs and ignores unknown ADJUSTMENT actions (extension hatch)', async () => {
    const warn = vi.fn();
    const cluster = new DecisionCluster({ logger: { warn, error: () => {} } });
    const dr = result('X', {
      recommendations: [rec({ action: 'mystery_adjust', priority: 50, payload: {} })],
    });
    const { session, trace } = await cluster.execute([dr], {});
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/Unknown ADJUSTMENT/));
    // Unknown action still recorded in trace as fired but didn't mutate session
    expect(trace.stages.ADJUSTMENT.fired).toHaveLength(1);
    expect(session.volumeMultiplier).toBe(1);
  });

  it('tie-break on identical priorities: input order wins (registry order)', async () => {
    const cluster = new DecisionCluster();
    const a = result('A', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, priority: 65, payload: { multiplier: 0.9 } })] });
    const b = result('B', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, priority: 65, payload: { multiplier: 0.95 } })] });
    const { trace } = await cluster.execute([a, b], {});
    expect(trace.stages.ADJUSTMENT.fired[0].source).toBe('A');
    expect(trace.stages.ADJUSTMENT.fired[1].source).toBe('B');
  });
});

describe('decisionCluster — Stage 3 ENHANCEMENT', () => {
  it('inject_warning appends to session.warnings with source attribution', async () => {
    const cluster = new DecisionCluster();
    const dr = result('AA', {
      recommendations: [rec({ action: ACTIONS.INJECT_WARNING, payload: { message: 'easy on volume', severity: 'soft' } })],
    });
    const { session } = await cluster.execute([dr], {});
    expect(session.warnings).toHaveLength(1);
    expect(session.warnings[0].source).toBe('AA');
    expect(session.warnings[0].message).toBe('easy on volume');
    expect(session.warnings[0].severity).toBe('soft');
  });

  it('inject_banner appends to session.banners with source attribution', async () => {
    const cluster = new DecisionCluster();
    const dr = result('CAL', {
      recommendations: [rec({ action: ACTIONS.INJECT_BANNER, payload: { text: 'calibrating' } })],
    });
    const { session } = await cluster.execute([dr], { banners: [{ source: 'OLD', text: 'previous' }] });
    expect(session.banners).toHaveLength(2);
    expect(session.banners[0].source).toBe('OLD');
    expect(session.banners[1].source).toBe('CAL');
  });

  it('shorten_session truncates exercises array', async () => {
    const cluster = new DecisionCluster();
    const dr = result('PATTERN', {
      recommendations: [rec({ action: ACTIONS.SHORTEN_SESSION, payload: { count: 3 } })],
    });
    const { session } = await cluster.execute([dr], {
      exercises: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }],
    });
    expect(session.exercises).toHaveLength(3);
    expect(session.shortened).toEqual({ source: 'PATTERN', originalCount: 5, newCount: 3 });
  });

  it('shorten_session no-ops if exercises absent or count missing', async () => {
    const cluster = new DecisionCluster();
    const dr = result('P', {
      recommendations: [rec({ action: ACTIONS.SHORTEN_SESSION, payload: {} })],
    });
    const { session } = await cluster.execute([dr], {});
    expect(session.exercises).toBeUndefined();
    expect(session.shortened).toBeUndefined();
  });
});

describe('decisionCluster — async dimension support (DP-2)', () => {
  it('awaits Promise<DimensionResult> input', async () => {
    const cluster = new DecisionCluster();
    const sync = result('S', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, payload: { multiplier: 0.8 } })] });
    const async = Promise.resolve(
      result('A', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, payload: { multiplier: 0.5 } })] })
    );
    const { session, trace } = await cluster.execute([sync, async], {});
    expect(trace.stages.ADJUSTMENT.composedVolumeMultiplier).toBeCloseTo(0.4, 5);
    expect(session.volumeMultiplier).toBeCloseTo(0.4, 5);
  });

  it('handles a rejected promise gracefully — logs to Sentry, continues', async () => {
    const captureException = vi.fn();
    const error = vi.fn();
    const cluster = new DecisionCluster({ logger: { error, warn: () => {} }, sentry: { captureException } });
    const goodAsync = Promise.resolve(
      result('OK', { recommendations: [rec({ action: ACTIONS.REDUCE_VOLUME, payload: { multiplier: 0.6 } })] })
    );
    const badAsync = Promise.reject(new Error('dimension exploded'));
    const { session, trace } = await cluster.execute([goodAsync, badAsync], {});
    expect(captureException).toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
    expect(trace.errors).toHaveLength(1);
    expect(trace.errors[0].reason).toMatch(/dimension exploded/);
    // Pipeline keeps going for the good dimension
    expect(session.volumeMultiplier).toBeCloseTo(0.6, 5);
  });

  it('skips null / undefined results without crashing', async () => {
    const cluster = new DecisionCluster();
    const dr = result('OK');
    const { trace } = await cluster.execute([null, dr, undefined], {});
    expect(trace.errors.length).toBe(2);
  });

  it('rejects malformed result shape but continues with valid ones', async () => {
    const cluster = new DecisionCluster();
    const malformed = { id: 'BAD' }; // missing required fields per contract
    const good = result('GOOD');
    const { trace } = await cluster.execute([malformed, good], {});
    expect(trace.errors).toHaveLength(1);
    expect(trace.errors[0].reason).toMatch(/confidence|tier|signals/);
  });

  it('does not invoke Sentry when no sentry sink is provided', async () => {
    const cluster = new DecisionCluster(); // no sentry
    const bad = Promise.reject(new Error('boom'));
    await expect(cluster.execute([bad], {})).resolves.toBeDefined(); // does not throw
  });
});

describe('decisionCluster — Stage validation', () => {
  it('records mismatch when dimension declared GATE but emits inject_warning', async () => {
    const warn = vi.fn();
    const cluster = new DecisionCluster({ logger: { warn, error: () => {} } });
    const dr = result('X', {
      recommendations: [rec({ action: ACTIONS.INJECT_WARNING, payload: { msg: 'hi' } })],
    });
    const entry = { id: 'X', stage: 'GATE', module: { analyze: () => {} }, priority: 95, enabledFlag: null, requiresCalibration: null, schemaVersion: 1 };
    const { trace } = await cluster.execute([dr], {}, { entries: [entry] });
    expect(trace.stageMismatches).toHaveLength(1);
    expect(trace.stageMismatches[0].dimensionId).toBe('X');
    expect(trace.stageMismatches[0].declaredStage).toBe('GATE');
    expect(trace.stageMismatches[0].action).toBe('inject_warning');
    expect(warn).toHaveBeenCalled();
  });

  it('throws on mismatch when strict=true', async () => {
    const cluster = new DecisionCluster({ strict: true });
    const dr = result('X', {
      recommendations: [rec({ action: ACTIONS.INJECT_WARNING })],
    });
    const entry = { id: 'X', stage: 'GATE', module: { analyze: () => {} }, priority: 95, enabledFlag: null, requiresCalibration: null, schemaVersion: 1 };
    await expect(cluster.execute([dr], {}, { entries: [entry] })).rejects.toThrow(/Stage mismatch/);
  });

  it('passes silently when no entries provided (validation disabled)', async () => {
    const cluster = new DecisionCluster({ strict: true }); // strict but no entries → no validation
    const dr = result('X', {
      recommendations: [rec({ action: ACTIONS.INJECT_WARNING })],
    });
    const { trace } = await cluster.execute([dr], {});
    expect(trace.stageMismatches).toEqual([]);
  });

  it('accepts unknown action verbs (extension hatch)', async () => {
    const cluster = new DecisionCluster({ strict: true });
    const dr = result('X', {
      recommendations: [rec({ action: 'totally_new_verb', priority: 50 })],
    });
    const entry = { id: 'X', stage: 'GATE', module: { analyze: () => {} }, priority: 95, enabledFlag: null, requiresCalibration: null, schemaVersion: 1 };
    await expect(cluster.execute([dr], {}, { entries: [entry] })).resolves.toBeDefined();
  });
});

describe('decisionCluster — multi-stage integration', () => {
  it('runs ADJUSTMENT then ENHANCEMENT in a single pipeline pass', async () => {
    const cluster = new DecisionCluster();
    const aa = result('AA', {
      recommendations: [
        rec({ action: ACTIONS.REDUCE_VOLUME, priority: 75, payload: { multiplier: 0.7 } }),
        rec({ action: ACTIONS.INJECT_WARNING, priority: 30, payload: { msg: 'AA active' } }),
      ],
    });
    const profile = result('PROFILE', {
      recommendations: [
        rec({ action: ACTIONS.REDUCE_VOLUME, priority: 65, payload: { multiplier: 0.95 } }),
        rec({ action: ACTIONS.INJECT_BANNER, priority: 25, payload: { txt: 'sprinter mode' } }),
      ],
    });
    const { session, trace } = await cluster.execute([aa, profile], { volumeMultiplier: 1 });
    expect(session.volumeMultiplier).toBeCloseTo(0.7 * 0.95, 5);
    expect(session.warnings).toHaveLength(1);
    expect(session.banners).toHaveLength(1);
    expect(trace.shortCircuited).toBe(false);
    expect(trace.stages.ADJUSTMENT.fired).toHaveLength(2);
    expect(trace.stages.ENHANCEMENT.fired).toHaveLength(2);
  });
});
