// ══ METRIC TYPE — per-exercise prescription axis (Wave 2 #7) ════════════════
// Guards the curated metric classification + the helper resolution. The data is
// always-on (the field lives in exercises.json); the BEHAVIORAL honoring is
// tested separately (scheduleAdapterAggregate.metricTypes.test.ts behind the flag).

import { describe, it, expect } from 'vitest';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';
import { getMetricType, isRepsMetric, isTimeMetric, isCarryMetric } from '../metricType.js';

const VALID = ['reps', 'time', 'distance', 'carry'];

const coreAutoNames = Object.entries(EXERCISE_METADATA)
  .filter(([, v]) => v.status === 'CORE_AUTO')
  .map(([k]) => k);

// The curated non-reps set (Daniel SSOT ANDURA-CORE-LIBRARY-v2 §DECISIONS).
const EXPECTED_TIME = [
  'Dead Hang',
  'Plank',
  'Side Plank',
  'Pallof Press Cable Standing',
  'Plate Pinch Hold',
  'Wrist Roller',
];
const EXPECTED_CARRY = ["Farmer's Walk DB", "Farmer's Walk Trap Bar"];

describe('metricType — data coverage over the 143 CORE_AUTO', () => {
  it('there are exactly 143 CORE_AUTO exercises (scope guard)', () => {
    expect(coreAutoNames).toHaveLength(143);
  });

  it('every CORE_AUTO resolves a VALID metric type (reps default or explicit)', () => {
    for (const name of coreAutoNames) {
      const m = getMetricType(name);
      expect(VALID, `${name} → ${m}`).toContain(m);
    }
  });

  it('every explicit library metric_type is valid', () => {
    for (const [name, meta] of Object.entries(EXERCISE_METADATA)) {
      if (meta.metric_type !== undefined) {
        expect(VALID, `${name}`).toContain(meta.metric_type);
      }
    }
  });

  it('the curated time-metric (isometric hold) exercises are tagged time', () => {
    for (const name of EXPECTED_TIME) {
      expect(isTimeMetric(name), `${name} should be time`).toBe(true);
      expect(isRepsMetric(name), `${name} must not be reps`).toBe(false);
    }
  });

  it('the curated carry exercises are tagged carry', () => {
    for (const name of EXPECTED_CARRY) {
      expect(isCarryMetric(name), `${name} should be carry`).toBe(true);
      expect(isRepsMetric(name), `${name} must not be reps`).toBe(false);
    }
  });

  it('a non-reps exercise never resolves to reps (the bug guard)', () => {
    for (const name of [...EXPECTED_TIME, ...EXPECTED_CARRY]) {
      expect(getMetricType(name)).not.toBe('reps');
    }
  });

  it('every OTHER CORE_AUTO is reps (default) — only the curated set is non-reps', () => {
    const nonReps = new Set([...EXPECTED_TIME, ...EXPECTED_CARRY]);
    for (const name of coreAutoNames) {
      if (!nonReps.has(name)) {
        expect(isRepsMetric(name), `${name} should default to reps`).toBe(true);
      }
    }
  });

  it('counts: 135 reps / 6 time / 0 distance / 2 carry over the 143', () => {
    const counts = { reps: 0, time: 0, distance: 0, carry: 0 };
    for (const name of coreAutoNames) counts[getMetricType(name)] += 1;
    expect(counts).toEqual({ reps: 135, time: 6, distance: 0, carry: 2 });
  });
});

describe('metricType — helper edge cases', () => {
  it('unknown name → reps (safe default)', () => {
    expect(getMetricType('Totally Made Up Lift')).toBe('reps');
    expect(isRepsMetric('Totally Made Up Lift')).toBe(true);
  });

  it('non-string input → reps', () => {
    // @ts-expect-error runtime guard
    expect(getMetricType(undefined)).toBe('reps');
    // @ts-expect-error runtime guard
    expect(getMetricType(null)).toBe('reps');
  });
});
