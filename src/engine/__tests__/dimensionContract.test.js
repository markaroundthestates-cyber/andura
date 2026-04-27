import { describe, it, expect } from 'vitest';
import {
  STAGES,
  CONFIDENCE,
  TIERS,
  ACTIONS,
  ACTION_STAGE_MAP,
  createDimensionResult,
  assertValidDimensionResult,
  assertValidRecommendation,
  isActionStageCompatible,
} from '../dimensionContract.js';

describe('dimensionContract — constants', () => {
  it('STAGES enumerates GATE / ADJUSTMENT / ENHANCEMENT', () => {
    expect(STAGES).toEqual({
      GATE: 'GATE',
      ADJUSTMENT: 'ADJUSTMENT',
      ENHANCEMENT: 'ENHANCEMENT',
    });
  });

  it('STAGES is frozen (immutable enum)', () => {
    expect(Object.isFrozen(STAGES)).toBe(true);
    expect(() => { STAGES.NEW_STAGE = 'oops'; }).toThrow();
  });

  it('CONFIDENCE enumerates low / medium / high', () => {
    expect(CONFIDENCE).toEqual({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' });
  });

  it('TIERS includes none/LOW/MED/HIGH', () => {
    expect(TIERS.NONE).toBe('none');
    expect(TIERS.HIGH).toBe('HIGH');
  });

  it('ACTIONS exposes canonical action verbs', () => {
    expect(ACTIONS.GATE_SESSION).toBe('gate_session');
    expect(ACTIONS.REDUCE_VOLUME).toBe('reduce_volume');
    expect(ACTIONS.INJECT_WARNING).toBe('inject_warning');
  });

  it('ACTION_STAGE_MAP routes verbs to stages correctly', () => {
    expect(ACTION_STAGE_MAP[ACTIONS.GATE_SESSION]).toBe(STAGES.GATE);
    expect(ACTION_STAGE_MAP[ACTIONS.REDUCE_VOLUME]).toBe(STAGES.ADJUSTMENT);
    expect(ACTION_STAGE_MAP[ACTIONS.INJECT_BANNER]).toBe(STAGES.ENHANCEMENT);
  });
});

describe('dimensionContract — createDimensionResult', () => {
  it('returns a no-signal default for `{ id }`', () => {
    const result = createDimensionResult({ id: 'TEST' });
    expect(result).toEqual({
      id: 'TEST',
      tier: 'none',
      confidence: 'low',
      signals: [],
      recommendations: [],
      trace: {},
      meta: {},
    });
  });

  it('preserves caller-provided fields', () => {
    const result = createDimensionResult({
      id: 'X',
      tier: 'HIGH',
      confidence: 'high',
      signals: ['a', 'b'],
      recommendations: [
        { action: 'reduce_volume', priority: 65, payload: { multiplier: 0.85 }, rationale: 'tired' },
      ],
      trace: { foo: 1 },
      meta: { primary: 'bar' },
    });
    expect(result.tier).toBe('HIGH');
    expect(result.signals).toEqual(['a', 'b']);
    expect(result.recommendations).toHaveLength(1);
    expect(result.trace.foo).toBe(1);
    expect(result.meta.primary).toBe('bar');
  });

  it('coerces non-array signals/recommendations to defaults', () => {
    const result = createDimensionResult({
      id: 'X',
      signals: 'not-an-array',
      recommendations: 'not-an-array',
    });
    expect(result.signals).toEqual([]);
    expect(result.recommendations).toEqual([]);
  });

  it('coerces non-object trace/meta to defaults', () => {
    const result = createDimensionResult({ id: 'X', trace: 'str', meta: null });
    expect(result.trace).toEqual({});
    expect(result.meta).toEqual({});
  });

  it('throws if partial is not an object', () => {
    expect(() => createDimensionResult(null)).toThrow(/object/);
    expect(() => createDimensionResult('foo')).toThrow(/object/);
  });

  it('throws if id is missing or not a non-empty string', () => {
    expect(() => createDimensionResult({})).toThrow(/id/);
    expect(() => createDimensionResult({ id: '' })).toThrow(/id/);
    expect(() => createDimensionResult({ id: 42 })).toThrow(/id/);
  });
});

describe('dimensionContract — assertValidDimensionResult', () => {
  const valid = () => createDimensionResult({ id: 'OK' });

  it('passes a freshly constructed result', () => {
    expect(() => assertValidDimensionResult(valid())).not.toThrow();
  });

  it('rejects null/non-object input', () => {
    expect(() => assertValidDimensionResult(null)).toThrow(/object/);
    expect(() => assertValidDimensionResult('foo')).toThrow(/object/);
  });

  it('rejects missing or non-string id', () => {
    expect(() => assertValidDimensionResult({ ...valid(), id: '' })).toThrow(/id/);
    expect(() => assertValidDimensionResult({ ...valid(), id: 1 })).toThrow(/id/);
  });

  it('rejects non-string tier', () => {
    expect(() => assertValidDimensionResult({ ...valid(), tier: 0 })).toThrow(/tier/);
  });

  it('rejects unknown confidence', () => {
    expect(() => assertValidDimensionResult({ ...valid(), confidence: 'foo' })).toThrow(/confidence/);
  });

  it('rejects non-array signals', () => {
    expect(() => assertValidDimensionResult({ ...valid(), signals: 'oops' })).toThrow(/signals/);
  });

  it('rejects non-string elements inside signals', () => {
    expect(() => assertValidDimensionResult({ ...valid(), signals: ['ok', 42] })).toThrow(/signals/);
  });

  it('rejects non-array recommendations', () => {
    expect(() => assertValidDimensionResult({ ...valid(), recommendations: {} })).toThrow(/recommendations/);
  });

  it('cascades into recommendation validation', () => {
    expect(() =>
      assertValidDimensionResult({
        ...valid(),
        recommendations: [{ action: 'x' }], // missing priority/payload/rationale
      })
    ).toThrow(/priority/);
  });

  it('rejects array trace', () => {
    expect(() => assertValidDimensionResult({ ...valid(), trace: [] })).toThrow(/trace/);
  });

  it('rejects array meta', () => {
    expect(() => assertValidDimensionResult({ ...valid(), meta: [] })).toThrow(/meta/);
  });
});

describe('dimensionContract — assertValidRecommendation', () => {
  const valid = () => ({
    action: 'reduce_volume',
    priority: 50,
    payload: { multiplier: 0.9 },
    rationale: 'because',
  });

  it('passes a complete recommendation', () => {
    expect(() => assertValidRecommendation(valid())).not.toThrow();
  });

  it('rejects null', () => {
    expect(() => assertValidRecommendation(null)).toThrow(/object/);
  });

  it('rejects missing action', () => {
    expect(() => assertValidRecommendation({ ...valid(), action: '' })).toThrow(/action/);
    expect(() => assertValidRecommendation({ ...valid(), action: 0 })).toThrow(/action/);
  });

  it('rejects priority out of range', () => {
    expect(() => assertValidRecommendation({ ...valid(), priority: -1 })).toThrow(/priority/);
    expect(() => assertValidRecommendation({ ...valid(), priority: 101 })).toThrow(/priority/);
    expect(() => assertValidRecommendation({ ...valid(), priority: 'low' })).toThrow(/priority/);
  });

  it('rejects non-object payload', () => {
    expect(() => assertValidRecommendation({ ...valid(), payload: null })).toThrow(/payload/);
    expect(() => assertValidRecommendation({ ...valid(), payload: 'foo' })).toThrow(/payload/);
    expect(() => assertValidRecommendation({ ...valid(), payload: [] })).toThrow(/payload/);
  });

  it('rejects non-string rationale', () => {
    expect(() => assertValidRecommendation({ ...valid(), rationale: 123 })).toThrow(/rationale/);
  });

  it('embeds parentId in error messages', () => {
    expect(() => assertValidRecommendation(null, 'MY_DIM')).toThrow(/MY_DIM/);
  });
});

describe('dimensionContract — isActionStageCompatible', () => {
  it('GATE actions match GATE stage', () => {
    expect(isActionStageCompatible('gate_session', 'GATE')).toBe(true);
    expect(isActionStageCompatible('gate_session', 'ADJUSTMENT')).toBe(false);
  });

  it('ADJUSTMENT actions match ADJUSTMENT stage', () => {
    expect(isActionStageCompatible('reduce_volume', 'ADJUSTMENT')).toBe(true);
    expect(isActionStageCompatible('reduce_volume', 'GATE')).toBe(false);
  });

  it('ENHANCEMENT actions match ENHANCEMENT stage', () => {
    expect(isActionStageCompatible('inject_warning', 'ENHANCEMENT')).toBe(true);
    expect(isActionStageCompatible('inject_warning', 'GATE')).toBe(false);
  });

  it('unknown actions pass through (extension hatch)', () => {
    expect(isActionStageCompatible('totally_new_verb', 'GATE')).toBe(true);
    expect(isActionStageCompatible('totally_new_verb', 'ADJUSTMENT')).toBe(true);
  });
});
