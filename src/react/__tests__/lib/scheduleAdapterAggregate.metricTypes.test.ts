// ══ #7 METRIC-TYPE PRESCRIPTION HONORING (dp_metric_types_v1) ═══════════════
// A time / carry exercise must NOT receive a weight × reps prescription. The
// metric DATA is always stamped; the behavioral suppression is flag-gated.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSwappedExercise } from '../../lib/scheduleAdapterAggregate.compose';
import * as flags from '../../../util/featureFlags.js';

// buildSwappedExercise re-uses the SAME toPlannedExercise prescription path as the
// initial plan, so it is the cleanest single-exercise probe of the honoring logic.

describe('#7 metric-type honoring — flag OFF (default, byte-identical reps path)', () => {
  beforeEach(() => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id: string) =>
      id === 'dp_metric_types_v1' ? false : false,
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it('a TIME exercise (Plank) still gets a rep target + no targetSec (legacy)', () => {
    const ex = buildSwappedExercise('Plank', 0, 'test');
    expect(ex.metricType).toBe('time'); // DATA is always stamped
    expect(ex.targetReps).toBeGreaterThan(0); // legacy reps prescription preserved
    expect(ex.targetSec).toBeUndefined();
  });

  it('a CARRY exercise (Farmer\'s Walk DB) still gets a rep target (legacy)', () => {
    const ex = buildSwappedExercise("Farmer's Walk DB", 0, 'test');
    expect(ex.metricType).toBe('carry');
    expect(ex.targetReps).toBeGreaterThan(0);
    expect(ex.targetSec).toBeUndefined();
  });

  it('a normal REPS exercise (Flat Barbell Bench) is unchanged', () => {
    const ex = buildSwappedExercise('Flat Barbell Bench', 0, 'test');
    expect(ex.metricType).toBe('reps');
    expect(ex.targetReps).toBeGreaterThan(0);
    expect(ex.targetSec).toBeUndefined();
  });
});

describe('#7 metric-type honoring — flag ON (correctness fix)', () => {
  beforeEach(() => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id: string) =>
      id === 'dp_metric_types_v1' ? true : false,
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it('a TIME exercise (Plank) gets a DURATION, NOT reps', () => {
    const ex = buildSwappedExercise('Plank', 0, 'test');
    expect(ex.metricType).toBe('time');
    expect(ex.targetReps).toBe(0); // no "× reps" prescription
    expect(ex.targetSec).toBe(30); // a hold duration instead
  });

  it('a TIME hold (Dead Hang) gets seconds, not a weight × reps prescription', () => {
    const ex = buildSwappedExercise('Dead Hang', 0, 'test');
    expect(ex.targetReps).toBe(0);
    expect(ex.targetSec).toBeGreaterThan(0);
  });

  it('a CARRY (Farmer\'s Walk DB) gets a duration AND keeps its load', () => {
    const ex = buildSwappedExercise("Farmer's Walk DB", 0, 'test');
    expect(ex.metricType).toBe('carry');
    expect(ex.targetReps).toBe(0); // never "8 × 60kg reps"
    expect(ex.targetSec).toBe(40);
    // a carry still carries a LOAD (kg) — the load axis is not suppressed
    expect(ex.targetKg).toBeGreaterThanOrEqual(0);
  });

  it('a normal REPS exercise (Flat Barbell Bench) is UNTOUCHED even with the flag ON', () => {
    const ex = buildSwappedExercise('Flat Barbell Bench', 0, 'test');
    expect(ex.metricType).toBe('reps');
    expect(ex.targetReps).toBeGreaterThan(0);
    expect(ex.targetSec).toBeUndefined();
  });
});
