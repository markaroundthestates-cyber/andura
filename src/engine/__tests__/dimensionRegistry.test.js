import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  DIMENSIONS,
  CALIBRATION_TIER_ORDER,
  getActiveDimensions,
  isCalibrationGateOpen,
  findDimension,
  assertValidDimensionEntry,
  assertValidRegistry,
} from '../dimensionRegistry.js';
import { DEV_FLAGS_KEY } from '../../util/featureFlags.js';

const validModule = { analyze: () => ({}) };

const sampleEntry = (overrides = {}) => ({
  id: 'TEST_DIM',
  module: validModule,
  stage: 'ADJUSTMENT',
  priority: 50,
  enabledFlag: null,
  requiresCalibration: null,
  schemaVersion: 1,
  ...overrides,
});

describe('dimensionRegistry — DIMENSIONS array', () => {
  it('starts empty in Sprint Foundation Batch 1', () => {
    expect(Array.isArray(DIMENSIONS)).toBe(true);
    expect(DIMENSIONS).toHaveLength(0);
  });

  it('passes registry validation when empty', () => {
    expect(() => assertValidRegistry()).not.toThrow();
  });
});

describe('dimensionRegistry — CALIBRATION_TIER_ORDER', () => {
  it('exports ordered ADR 009 tier sequence', () => {
    expect(CALIBRATION_TIER_ORDER).toEqual([
      'COLD_START',
      'INITIAL',
      'PERSONALIZING',
      'PERSONALIZED',
      'OPTIMIZED',
    ]);
  });
});

describe('dimensionRegistry — isCalibrationGateOpen', () => {
  it('returns true when required=null (always-on)', () => {
    expect(isCalibrationGateOpen(null, 'COLD_START')).toBe(true);
    expect(isCalibrationGateOpen(null, null)).toBe(true);
  });

  it('returns false when required tier specified but ctx tier missing', () => {
    expect(isCalibrationGateOpen('INITIAL', null)).toBe(false);
  });

  it('returns true when ctx tier ≥ required (case-insensitive)', () => {
    expect(isCalibrationGateOpen('INITIAL', 'INITIAL')).toBe(true);
    expect(isCalibrationGateOpen('INITIAL', 'PERSONALIZING')).toBe(true);
    expect(isCalibrationGateOpen('initial', 'optimized')).toBe(true);
  });

  it('returns false when ctx tier < required', () => {
    expect(isCalibrationGateOpen('INITIAL', 'COLD_START')).toBe(false);
    expect(isCalibrationGateOpen('PERSONALIZING', 'INITIAL')).toBe(false);
  });

  it('returns false for unknown tier names', () => {
    expect(isCalibrationGateOpen('UNKNOWN_TIER', 'INITIAL')).toBe(false);
    expect(isCalibrationGateOpen('INITIAL', 'UNKNOWN_TIER')).toBe(false);
  });
});

describe('dimensionRegistry — getActiveDimensions', () => {
  it('returns empty array when given empty registry', () => {
    expect(getActiveDimensions({}, { dimensions: [] })).toEqual([]);
  });

  it('keeps dimensions with no calibration requirement and no flag', () => {
    const dims = [sampleEntry({ id: 'A' })];
    const active = getActiveDimensions({ calibrationLevel: 'cold_start' }, { dimensions: dims });
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('A');
  });

  it('filters dimensions whose calibration requirement is unmet', () => {
    const dims = [
      sampleEntry({ id: 'COLD_OK',  requiresCalibration: null }),
      sampleEntry({ id: 'INIT_REQ', requiresCalibration: 'INITIAL' }),
    ];
    const active = getActiveDimensions({ calibrationLevel: 'cold_start' }, { dimensions: dims });
    expect(active.map(d => d.id)).toEqual(['COLD_OK']);
  });

  it('accepts calibrationLevel as object with .name', () => {
    const dims = [sampleEntry({ id: 'INIT_REQ', requiresCalibration: 'INITIAL' })];
    const active = getActiveDimensions(
      { calibrationLevel: { name: 'personalizing' } },
      { dimensions: dims }
    );
    expect(active).toHaveLength(1);
  });

  it('skips dimensions with enabledFlag explicitly false', () => {
    const dims = [
      sampleEntry({ id: 'FLAG_ON',  enabledFlag: 'feature_a' }),
      sampleEntry({ id: 'FLAG_OFF', enabledFlag: 'feature_b' }),
    ];
    const active = getActiveDimensions(
      { calibrationLevel: 'optimized' },
      { dimensions: dims, flags: { feature_a: true, feature_b: false } }
    );
    expect(active.map(d => d.id)).toEqual(['FLAG_ON']);
  });

  it('skips dimensions whose flag is missing from resolved map (fail-closed, audit MED-5)', () => {
    const dims = [sampleEntry({ id: 'NEW_FLAG', enabledFlag: 'unknown_flag' })];
    const active = getActiveDimensions(
      { calibrationLevel: 'optimized' },
      { dimensions: dims, flags: {} }
    );
    expect(active).toHaveLength(0);
  });

  it('opts.flags fail-closed: missing key = dimension skipped (matches production)', () => {
    const dims = [
      sampleEntry({ id: 'EXPLICIT_TRUE',  enabledFlag: 'f_on'  }),
      sampleEntry({ id: 'EXPLICIT_FALSE', enabledFlag: 'f_off' }),
      sampleEntry({ id: 'MISSING_KEY',    enabledFlag: 'f_missing' }),
    ];
    const active = getActiveDimensions(
      { calibrationLevel: 'optimized' },
      { dimensions: dims, flags: { f_on: true, f_off: false } }
    );
    expect(active.map(d => d.id)).toEqual(['EXPLICIT_TRUE']);
  });

  it('delegates to featureFlags.isEnabled when no opts.flags supplied (production path)', () => {
    // Unknown flag, no dev override → isEnabled fails-closed → filtered out.
    const dims = [sampleEntry({ id: 'X', enabledFlag: 'whatever' })];
    const active = getActiveDimensions({ calibrationLevel: 'optimized' }, { dimensions: dims });
    expect(active).toHaveLength(0);
  });

  it('combines tier + flag filters', () => {
    const dims = [
      sampleEntry({ id: 'A', requiresCalibration: 'PERSONALIZING', enabledFlag: 'a_flag' }),
      sampleEntry({ id: 'B', requiresCalibration: 'INITIAL',       enabledFlag: 'b_flag' }),
      sampleEntry({ id: 'C', requiresCalibration: null,            enabledFlag: null     }),
    ];
    const active = getActiveDimensions(
      { calibrationLevel: 'initial' },
      { dimensions: dims, flags: { a_flag: true, b_flag: false } }
    );
    // A: tier closed; B: flag off; C: passes
    expect(active.map(d => d.id)).toEqual(['C']);
  });
});

describe('dimensionRegistry — getActiveDimensions integration with featureFlags', () => {
  const cleanLs = () => {
    try {
      localStorage.removeItem(DEV_FLAGS_KEY);
      localStorage.removeItem('user-id');
      localStorage.removeItem('device-id');
    } catch { /* ignore */ }
  };
  beforeEach(cleanLs);
  afterEach(cleanLs);

  it('uses real isEnabled when no opts.flags provided — dev override true keeps dimension', () => {
    localStorage.setItem('device-id', 'dev-test-user');
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ test_flag_v1: true }));
    const dims = [sampleEntry({ id: 'X', enabledFlag: 'test_flag_v1' })];
    const active = getActiveDimensions({ calibrationLevel: 'optimized' }, { dimensions: dims });
    expect(active.map(d => d.id)).toEqual(['X']);
  });

  it('uses real isEnabled when no opts.flags provided — dev override false filters out', () => {
    localStorage.setItem('device-id', 'dev-test-user');
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ test_flag_v1: false }));
    const dims = [sampleEntry({ id: 'X', enabledFlag: 'test_flag_v1' })];
    const active = getActiveDimensions({ calibrationLevel: 'optimized' }, { dimensions: dims });
    expect(active).toHaveLength(0);
  });

  it('unknown flag without dev override fails-closed (filters out)', () => {
    // No dev override, no FLAGS entry → isEnabled returns false → dimension filtered.
    const dims = [sampleEntry({ id: 'X', enabledFlag: 'never_registered_flag' })];
    const active = getActiveDimensions({ calibrationLevel: 'optimized' }, { dimensions: dims });
    expect(active).toHaveLength(0);
  });

  it('passes ctx.userId through to isEnabled (deterministic per-user resolution)', () => {
    // Force-enable via dev override on specific flag; expect dimension active
    // regardless of userId (dev override wins). Sanity that ctx.userId path
    // doesn't crash when userId provided directly.
    localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ test_flag_v1: true }));
    const dims = [sampleEntry({ id: 'X', enabledFlag: 'test_flag_v1' })];
    const active = getActiveDimensions(
      { calibrationLevel: 'optimized', userId: 'explicit-user-id' },
      { dimensions: dims }
    );
    expect(active).toHaveLength(1);
  });
});

describe('dimensionRegistry — findDimension', () => {
  it('returns undefined for unknown id', () => {
    expect(findDimension('NOPE', [])).toBeUndefined();
  });

  it('returns matching entry by id', () => {
    const dims = [sampleEntry({ id: 'A' }), sampleEntry({ id: 'B' })];
    expect(findDimension('B', dims)?.id).toBe('B');
  });
});

describe('dimensionRegistry — assertValidDimensionEntry', () => {
  it('passes valid entry', () => {
    expect(() => assertValidDimensionEntry(sampleEntry())).not.toThrow();
  });

  it('rejects null/non-object input', () => {
    expect(() => assertValidDimensionEntry(null)).toThrow(/object/);
    expect(() => assertValidDimensionEntry('foo')).toThrow(/object/);
  });

  it('rejects missing or non-string id', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ id: '' }))).toThrow(/id/);
    expect(() => assertValidDimensionEntry(sampleEntry({ id: 42 }))).toThrow(/id/);
  });

  it('rejects entry whose module lacks an analyze function', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ module: {} }))).toThrow(/analyze/);
    expect(() => assertValidDimensionEntry(sampleEntry({ module: null }))).toThrow(/module/);
  });

  it('rejects invalid stage', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ stage: 'OOPS' }))).toThrow(/stage/);
  });

  it('rejects priority out of range', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ priority: -1 }))).toThrow(/priority/);
    expect(() => assertValidDimensionEntry(sampleEntry({ priority: 101 }))).toThrow(/priority/);
    expect(() => assertValidDimensionEntry(sampleEntry({ priority: 'high' }))).toThrow(/priority/);
  });

  it('rejects unknown calibration tier', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ requiresCalibration: 'WAT' }))).toThrow(/requiresCalibration/);
  });

  it('accepts UPPERCASE and lowercase tier names', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ requiresCalibration: 'INITIAL' }))).not.toThrow();
    expect(() => assertValidDimensionEntry(sampleEntry({ requiresCalibration: 'initial' }))).not.toThrow();
  });

  it('rejects non-positive integer schemaVersion', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ schemaVersion: 0 }))).toThrow(/schemaVersion/);
    expect(() => assertValidDimensionEntry(sampleEntry({ schemaVersion: 1.5 }))).toThrow(/schemaVersion/);
    expect(() => assertValidDimensionEntry(sampleEntry({ schemaVersion: '1' }))).toThrow(/schemaVersion/);
  });

  it('rejects non-string enabledFlag (other than null)', () => {
    expect(() => assertValidDimensionEntry(sampleEntry({ enabledFlag: 42 }))).toThrow(/enabledFlag/);
  });
});

describe('dimensionRegistry — assertValidRegistry', () => {
  it('rejects non-array', () => {
    expect(() => assertValidRegistry({})).toThrow(/array/);
  });

  it('rejects duplicate ids', () => {
    const dims = [sampleEntry({ id: 'A' }), sampleEntry({ id: 'A' })];
    expect(() => assertValidRegistry(dims)).toThrow(/duplicate/);
  });

  it('passes valid heterogeneous registry', () => {
    const dims = [
      sampleEntry({ id: 'A', stage: 'GATE', priority: 95 }),
      sampleEntry({ id: 'B', stage: 'ADJUSTMENT', priority: 65, requiresCalibration: 'INITIAL' }),
      sampleEntry({ id: 'C', stage: 'ENHANCEMENT', priority: 30, enabledFlag: 'ui_v1' }),
    ];
    expect(() => assertValidRegistry(dims)).not.toThrow();
  });
});
