// Tests for ADR_ENGINE_REFACTOR §4.3 LOCK V1 — Hybrid template Decision §3.3
// + translator Big 11 EN→RO + Muscle Recovery state consume helpers.
// ZERO mutation phase cycle algorithm semantics (LOAD/LOAD+/PEAK/DELOAD
// preserved invariant). Pure additive layer assertions.

import { describe, it, expect } from 'vitest';
import { MS_PER_HOUR } from '../../../constants.js';
import {
  PHASE_CLUSTERS_BIG6,
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  BIG11_EN_TO_RO_MAP,
} from '../constants.js';
import {
  clusterWeightForGroup,
  toCanonicalRO,
  applyRecoveryStateRedistribution,
} from '../volumeLandmarks.js';

describe('PHASE_CLUSTERS_BIG6 — ADR_ENGINE_REFACTOR §4.3 LOCK V1', () => {
  it('contains exact 6 cluster names (push/pull/legs/upper/lower/full)', () => {
    expect(PHASE_CLUSTERS_BIG6).toHaveLength(6);
    expect(PHASE_CLUSTERS_BIG6).toEqual(['push', 'pull', 'legs', 'upper', 'lower', 'full']);
  });
  it('is frozen (Object.freeze invariant)', () => {
    expect(Object.isFrozen(PHASE_CLUSTERS_BIG6)).toBe(true);
  });
});

describe('CLUSTER_BIG6_TO_BIG11_WEIGHT — Decision §3.3 Hybrid weight allocation', () => {
  it('has all 6 cluster keys matching PHASE_CLUSTERS_BIG6', () => {
    expect(Object.keys(CLUSTER_BIG6_TO_BIG11_WEIGHT).sort()).toEqual(
      [...PHASE_CLUSTERS_BIG6].sort()
    );
  });

  it('is recursively frozen (outer + each cluster map)', () => {
    expect(Object.isFrozen(CLUSTER_BIG6_TO_BIG11_WEIGHT)).toBe(true);
    for (const cluster of PHASE_CLUSTERS_BIG6) {
      expect(Object.isFrozen(CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster])).toBe(true);
    }
  });

  it('each cluster weight distribution sums to ~1.0 (±0.01 tolerance)', () => {
    for (const cluster of PHASE_CLUSTERS_BIG6) {
      const sum = Object.values(CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster])
        .reduce((a, b) => a + b, 0);
      expect(sum).toBeGreaterThan(0.99);
      expect(sum).toBeLessThan(1.01);
    }
  });

  it('push cluster contains piept + umeri + triceps Big 11 RO keys', () => {
    const push = CLUSTER_BIG6_TO_BIG11_WEIGHT.push;
    expect(push).toHaveProperty('piept');
    expect(push).toHaveProperty('umeri');
    expect(push).toHaveProperty('triceps');
    expect(push.piept).toBe(0.40);
  });

  it('pull cluster contains spate + biceps + antebrate Big 11 RO keys', () => {
    const pull = CLUSTER_BIG6_TO_BIG11_WEIGHT.pull;
    expect(pull).toHaveProperty('spate');
    expect(pull).toHaveProperty('biceps');
    expect(pull).toHaveProperty('antebrate');
    expect(pull.spate).toBe(0.50);
  });

  it('legs cluster contains picioare-quads + picioare-hamstrings + fese + gambe + core', () => {
    const legs = CLUSTER_BIG6_TO_BIG11_WEIGHT.legs;
    expect(legs).toHaveProperty('picioare-quads');
    expect(legs).toHaveProperty('picioare-hamstrings');
    expect(legs).toHaveProperty('fese');
    expect(legs).toHaveProperty('gambe');
    expect(legs).toHaveProperty('core');
  });

  it('upper cluster spans 6 Big 11 groups (no leg groups)', () => {
    const upper = CLUSTER_BIG6_TO_BIG11_WEIGHT.upper;
    expect(Object.keys(upper)).toHaveLength(6);
    expect(upper).not.toHaveProperty('picioare-quads');
    expect(upper).not.toHaveProperty('picioare-hamstrings');
    expect(upper).not.toHaveProperty('fese');
    expect(upper).not.toHaveProperty('gambe');
  });

  it('lower cluster matches legs cluster (alias semantic equivalent)', () => {
    expect(CLUSTER_BIG6_TO_BIG11_WEIGHT.lower).toEqual(CLUSTER_BIG6_TO_BIG11_WEIGHT.legs);
  });

  it('full cluster spans all 11 Big 11 RO groups', () => {
    const full = CLUSTER_BIG6_TO_BIG11_WEIGHT.full;
    expect(Object.keys(full)).toHaveLength(11);
    const expectedGroups = [
      'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core',
      'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
    ];
    for (const g of expectedGroups) {
      expect(full).toHaveProperty(g);
    }
  });
});

describe('clusterWeightForGroup — Hybrid routing helper', () => {
  it('returns 0.40 for push cluster + piept group', () => {
    expect(clusterWeightForGroup('push', 'piept')).toBe(0.40);
  });
  it('returns 0.50 for pull cluster + spate group', () => {
    expect(clusterWeightForGroup('pull', 'spate')).toBe(0.50);
  });
  it('returns 0 when group absent în cluster (legs+piept)', () => {
    expect(clusterWeightForGroup('legs', 'piept')).toBe(0);
  });
  it('returns 0 when cluster unknown', () => {
    expect(clusterWeightForGroup('invalid_cluster', 'piept')).toBe(0);
  });
  it('returns 0 for null/undefined inputs (defensive)', () => {
    expect(clusterWeightForGroup(undefined, 'piept')).toBe(0);
    expect(clusterWeightForGroup('push', undefined)).toBe(0);
    expect(clusterWeightForGroup(null, null)).toBe(0);
  });
});

describe('BIG11_EN_TO_RO_MAP + toCanonicalRO — translator helper ADR §4.3', () => {
  it('maps all 11 Israetel EN keys to Big 11 RO canonical V1', () => {
    expect(BIG11_EN_TO_RO_MAP.chest).toBe('piept');
    expect(BIG11_EN_TO_RO_MAP.back).toBe('spate');
    expect(BIG11_EN_TO_RO_MAP.shoulders).toBe('umeri');
    expect(BIG11_EN_TO_RO_MAP.quads).toBe('picioare-quads');
    expect(BIG11_EN_TO_RO_MAP.hamstrings).toBe('picioare-hamstrings');
    expect(BIG11_EN_TO_RO_MAP.glutes).toBe('fese');
    expect(BIG11_EN_TO_RO_MAP.calves).toBe('gambe');
    expect(BIG11_EN_TO_RO_MAP.biceps).toBe('biceps');
    expect(BIG11_EN_TO_RO_MAP.triceps).toBe('triceps');
    expect(BIG11_EN_TO_RO_MAP.forearms).toBe('antebrate');
    expect(BIG11_EN_TO_RO_MAP.abs).toBe('core');
    expect(Object.keys(BIG11_EN_TO_RO_MAP)).toHaveLength(11);
  });

  it('BIG11_EN_TO_RO_MAP is frozen', () => {
    expect(Object.isFrozen(BIG11_EN_TO_RO_MAP)).toBe(true);
  });

  it('toCanonicalRO translates EN volumeMap → RO keys preserving values', () => {
    const enMap = { chest: 14, back: 18, quads: 14, hamstrings: 12, glutes: 12 };
    const roMap = toCanonicalRO(enMap);
    expect(roMap).toEqual({
      piept: 14,
      spate: 18,
      'picioare-quads': 14,
      'picioare-hamstrings': 12,
      fese: 12,
    });
  });

  it('toCanonicalRO preserves unknown keys unchanged (defensive)', () => {
    const mixedMap = { chest: 10, 'piept': 5, unknown_muscle: 3 };
    const result = toCanonicalRO(mixedMap);
    expect(result).toHaveProperty('piept');
    expect(result).toHaveProperty('unknown_muscle', 3);
  });

  it('toCanonicalRO handles null/undefined/non-object input', () => {
    expect(toCanonicalRO(undefined)).toEqual({});
    expect(toCanonicalRO(null)).toEqual({});
    expect(toCanonicalRO('not an object')).toEqual({});
  });

  it('toCanonicalRO handles empty volumeMap', () => {
    expect(toCanonicalRO({})).toEqual({});
  });
});

describe('applyRecoveryStateRedistribution — Muscle Recovery consume per §4.3', () => {
  const hoursAgo = (h) => Date.now() - h * MS_PER_HOUR;

  it('returns clone unchanged when logs empty (no Recovery state input)', () => {
    const volumeMap = { piept: 14, spate: 18, umeri: 16 };
    const result = applyRecoveryStateRedistribution(volumeMap, []);
    expect(result).toEqual(volumeMap);
    expect(result).not.toBe(volumeMap); // clone, not same reference
  });

  it('reduces fatigued group volume to 60% (×0.60)', () => {
    // Fatigued piept via 3 heavy chest sessions 2h ago
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Flat DB Press',    w: 32, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Pec Deck / Cable Fly', w: 20, reps: 10, rpe: 8, ts: hoursAgo(2) },
    ];
    const volumeMap = { piept: 14 };
    const result = applyRecoveryStateRedistribution(volumeMap, logs);
    expect(result.piept).toBeCloseTo(14 * 0.60, 5);
  });

  it('preserves recovered group volume unchanged (×1.0)', () => {
    // No logs touching spate → recovered
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
    ];
    const volumeMap = { spate: 18 };
    const result = applyRecoveryStateRedistribution(volumeMap, logs);
    expect(result.spate).toBe(18);
  });

  it('handles non-object volumeMap input defensively', () => {
    expect(applyRecoveryStateRedistribution(null, [])).toEqual({});
    expect(applyRecoveryStateRedistribution(undefined, [])).toEqual({});
  });

  it('handles non-array logs input defensively (returns clone)', () => {
    const volumeMap = { piept: 14, spate: 18 };
    expect(applyRecoveryStateRedistribution(volumeMap, null)).toEqual(volumeMap);
    expect(applyRecoveryStateRedistribution(volumeMap, undefined)).toEqual(volumeMap);
  });

  it('multiplies only matching groups; unrelated groups unchanged', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Flat DB Press',    w: 32, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Pec Deck / Cable Fly', w: 20, reps: 10, rpe: 8, ts: hoursAgo(2) },
    ];
    const volumeMap = { piept: 14, spate: 18, gambe: 12 };
    const result = applyRecoveryStateRedistribution(volumeMap, logs);
    expect(result.piept).toBeCloseTo(14 * 0.60, 5);
    expect(result.spate).toBe(18);
    expect(result.gambe).toBe(12);
  });

  it('clamps negative inputs to 0 (defensive) on Recovery state path', () => {
    // Trigger logs path (Math.max clamp on adjusted assign)
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
    ];
    const volumeMap = { piept: -5 };
    const result = applyRecoveryStateRedistribution(volumeMap, logs);
    expect(result.piept).toBeGreaterThanOrEqual(0);
  });
});
