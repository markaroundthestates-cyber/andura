import { describe, it, expect } from 'vitest';
import {
  lookupIsraetelLandmarks,
  lookupIsraetelLandmarksRO,
  resolveMovementCategory,
  volumeMetricWeight,
  computeWeightedVolume,
  countCompoundObservations,
  computeIsolationDegradation,
  computePersonalizedLandmarks,
} from '../volumeLandmarks.js';
import {
  VOLUME_METRIC_WEIGHTS as _VOLUME_METRIC_WEIGHTS,
  VOLUME_LANDMARKS,
  MOVEMENT_CATEGORY,
} from '../constants.js';
import {
  ISRAETEL_BASELINES,
  BIG11_RO_TO_EN_MAP,
} from '../../periodization/constants.js';

describe('lookupIsraetelLandmarks — Cluster C1 base', () => {
  it('chest → MEV/MAV/MRV from Israetel', () => {
    const r = lookupIsraetelLandmarks('chest');
    expect(r).toHaveProperty('MEV');
    expect(r).toHaveProperty('MAV');
    expect(r).toHaveProperty('MRV');
  });
  it('case-insensitive', () => {
    expect(lookupIsraetelLandmarks('CHEST')).not.toBe(null);
  });
  it('unknown muscle → null defensive', () => {
    expect(lookupIsraetelLandmarks('foo')).toBe(null);
    expect(lookupIsraetelLandmarks(null)).toBe(null);
  });
});

describe('lookupIsraetelLandmarksRO — C4.8 Big 11 RO migration via translator inverse (ADR §4.8 LOCK V1)', () => {
  it('piept → returns chest baseline (Israetel literature reference invariant preserved)', () => {
    const r = lookupIsraetelLandmarksRO('piept');
    expect(r).not.toBeNull();
    expect(r).toEqual(ISRAETEL_BASELINES.chest);
    expect(r).toHaveProperty('MEV');
    expect(r).toHaveProperty('MAV');
    expect(r).toHaveProperty('MRV');
  });

  it('spate → returns back baseline', () => {
    expect(lookupIsraetelLandmarksRO('spate')).toEqual(ISRAETEL_BASELINES.back);
  });

  it('umeri → returns shoulders baseline', () => {
    expect(lookupIsraetelLandmarksRO('umeri')).toEqual(ISRAETEL_BASELINES.shoulders);
  });

  it('picioare-quads → returns quads baseline (RO native split)', () => {
    expect(lookupIsraetelLandmarksRO('picioare-quads')).toEqual(ISRAETEL_BASELINES.quads);
  });

  it('picioare-hamstrings → returns hamstrings baseline (RO native NU calque)', () => {
    expect(lookupIsraetelLandmarksRO('picioare-hamstrings')).toEqual(ISRAETEL_BASELINES.hamstrings);
  });

  it('fese → returns glutes baseline (Big 11 RO canonical V1 NEW)', () => {
    expect(lookupIsraetelLandmarksRO('fese')).toEqual(ISRAETEL_BASELINES.glutes);
  });

  it('gambe → returns calves baseline', () => {
    expect(lookupIsraetelLandmarksRO('gambe')).toEqual(ISRAETEL_BASELINES.calves);
  });

  it('biceps → returns biceps baseline (RO ≡ EN)', () => {
    expect(lookupIsraetelLandmarksRO('biceps')).toEqual(ISRAETEL_BASELINES.biceps);
  });

  it('triceps → returns triceps baseline (RO ≡ EN)', () => {
    expect(lookupIsraetelLandmarksRO('triceps')).toEqual(ISRAETEL_BASELINES.triceps);
  });

  it('antebrate → returns forearms baseline', () => {
    expect(lookupIsraetelLandmarksRO('antebrate')).toEqual(ISRAETEL_BASELINES.forearms);
  });

  it('core → returns abs baseline', () => {
    expect(lookupIsraetelLandmarksRO('core')).toEqual(ISRAETEL_BASELINES.abs);
  });

  it('unknown RO group → null defensive (NU translator fallback)', () => {
    expect(lookupIsraetelLandmarksRO('unknown_ro_group')).toBeNull();
    expect(lookupIsraetelLandmarksRO('chest')).toBeNull(); // Big 6 EN NU în RO_TO_EN map
    expect(lookupIsraetelLandmarksRO(null)).toBeNull();
    expect(lookupIsraetelLandmarksRO(undefined)).toBeNull();
    expect(lookupIsraetelLandmarksRO('')).toBeNull();
  });

  it('Israetel literature reference invariant preserved — lookupIsraetelLandmarks(EN) returns same value pre/post C4.8 (ZERO mutation existing function)', () => {
    expect(lookupIsraetelLandmarks('chest')).toEqual(ISRAETEL_BASELINES.chest);
    expect(lookupIsraetelLandmarks('glutes')).toEqual(ISRAETEL_BASELINES.glutes);
    expect(lookupIsraetelLandmarks('forearms')).toEqual(ISRAETEL_BASELINES.forearms);
  });

  it('BIG11_RO_TO_EN_MAP inverse translator complete 11 entries Big 11 canonical V1', () => {
    expect(Object.keys(BIG11_RO_TO_EN_MAP).length).toBe(11);
    expect(BIG11_RO_TO_EN_MAP.piept).toBe('chest');
    expect(BIG11_RO_TO_EN_MAP.spate).toBe('back');
    expect(BIG11_RO_TO_EN_MAP.umeri).toBe('shoulders');
    expect(BIG11_RO_TO_EN_MAP['picioare-quads']).toBe('quads');
    expect(BIG11_RO_TO_EN_MAP['picioare-hamstrings']).toBe('hamstrings');
    expect(BIG11_RO_TO_EN_MAP.fese).toBe('glutes');
    expect(BIG11_RO_TO_EN_MAP.gambe).toBe('calves');
    expect(BIG11_RO_TO_EN_MAP.antebrate).toBe('forearms');
    expect(BIG11_RO_TO_EN_MAP.core).toBe('abs');
  });

  it('BIG11_RO_TO_EN_MAP frozen immutable (Object.freeze invariant)', () => {
    expect(Object.isFrozen(BIG11_RO_TO_EN_MAP)).toBe(true);
  });
});

describe('resolveMovementCategory — Cluster B3 weighted classification', () => {
  it('squat / deadlift → lower_compound', () => {
    expect(resolveMovementCategory('squat')).toBe(MOVEMENT_CATEGORY.LOWER_COMPOUND);
    expect(resolveMovementCategory('deadlift')).toBe(MOVEMENT_CATEGORY.LOWER_COMPOUND);
    expect(resolveMovementCategory('hip_thrust')).toBe(MOVEMENT_CATEGORY.LOWER_COMPOUND);
  });
  it('bench / OHP / row → upper_compound', () => {
    expect(resolveMovementCategory('bench_press')).toBe(MOVEMENT_CATEGORY.UPPER_COMPOUND);
    expect(resolveMovementCategory('overhead_press')).toBe(MOVEMENT_CATEGORY.UPPER_COMPOUND);
    expect(resolveMovementCategory('row')).toBe(MOVEMENT_CATEGORY.UPPER_COMPOUND);
    expect(resolveMovementCategory('pull_up')).toBe(MOVEMENT_CATEGORY.UPPER_COMPOUND);
  });
  it('curl / lateral_raise → isolation default', () => {
    expect(resolveMovementCategory('bicep_curl')).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(resolveMovementCategory('lateral_raise')).toBe(MOVEMENT_CATEGORY.ISOLATION);
  });
  it('unknown → isolation defensive (NU over-credit)', () => {
    expect(resolveMovementCategory('foo')).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(resolveMovementCategory(null)).toBe(MOVEMENT_CATEGORY.ISOLATION);
  });
});

describe('volumeMetricWeight — Cluster B3 verbatim 3:2:1', () => {
  it('lower_compound × 3', () => {
    expect(volumeMetricWeight(MOVEMENT_CATEGORY.LOWER_COMPOUND)).toBe(3);
  });
  it('upper_compound × 2', () => {
    expect(volumeMetricWeight(MOVEMENT_CATEGORY.UPPER_COMPOUND)).toBe(2);
  });
  it('isolation × 1', () => {
    expect(volumeMetricWeight(MOVEMENT_CATEGORY.ISOLATION)).toBe(1);
    expect(volumeMetricWeight('unknown')).toBe(1); // defensive default
  });
});

describe('computeWeightedVolume — full session aggregate', () => {
  it('mixed session compound + isolation', () => {
    const r = computeWeightedVolume([
      { movementId: 'squat', sets: 4 },          // 4 × 3 = 12
      { movementId: 'bench_press', sets: 4 },    // 4 × 2 = 8
      { movementId: 'lateral_raise', sets: 3 },  // 3 × 1 = 3
    ]);
    expect(r).toBe(23);
  });
  it('empty session → 0', () => {
    expect(computeWeightedVolume([])).toBe(0);
    expect(computeWeightedVolume(null)).toBe(0);
  });
  it('invalid sets → skipped defensive', () => {
    const r = computeWeightedVolume([
      { movementId: 'squat', sets: 'foo' },
      { movementId: 'bench_press', sets: 4 },
    ]);
    expect(r).toBe(8);
  });
});

describe('countCompoundObservations — Cluster C1 trailing window', () => {
  it('counts sessions with compound in 14d window', () => {
    const sessions = [
      { daysAgo: 1, movements: [{ movementId: 'squat' }] },
      { daysAgo: 5, movements: [{ movementId: 'bench_press' }] },
      { daysAgo: 10, movements: [{ movementId: 'curl' }] }, // isolation only
    ];
    expect(countCompoundObservations(sessions)).toBe(2);
  });
  it('sessions outside 14d window NU counted', () => {
    const sessions = [
      { daysAgo: 1, movements: [{ movementId: 'squat' }] },
      { daysAgo: 20, movements: [{ movementId: 'deadlift' }] },
    ];
    expect(countCompoundObservations(sessions)).toBe(1);
  });
  it('empty → 0 defensive', () => {
    expect(countCompoundObservations([])).toBe(0);
    expect(countCompoundObservations(null)).toBe(0);
  });
});

describe('computeIsolationDegradation — Cluster C1 0.3× cand compound <3', () => {
  it('compound observations >= 3 → factor 1.0', () => {
    const sessions = [
      { daysAgo: 1, movements: [{ movementId: 'squat' }] },
      { daysAgo: 3, movements: [{ movementId: 'bench_press' }] },
      { daysAgo: 5, movements: [{ movementId: 'deadlift' }] },
    ];
    const r = computeIsolationDegradation(sessions);
    expect(r.factor).toBe(1.0);
    expect(r.compoundCount).toBe(3);
  });
  it('compound observations < 3 → factor 0.3 (graceful degradation)', () => {
    const sessions = [
      { daysAgo: 1, movements: [{ movementId: 'squat' }] },
      { daysAgo: 3, movements: [{ movementId: 'bench_press' }] },
    ];
    const r = computeIsolationDegradation(sessions);
    expect(r.factor).toBe(VOLUME_LANDMARKS.isolationGracefulDegradationFactor);
    expect(r.factor).toBeCloseTo(0.3, 5);
    expect(r.compoundCount).toBe(2);
  });
  it('zero compound → factor 0.3', () => {
    expect(computeIsolationDegradation([]).factor).toBe(0.3);
  });
});

describe('computePersonalizedLandmarks — Cluster C1 Hibrid lookup + regression', () => {
  it('compound movement (squat) → regression applied factor 1.0', () => {
    const r = computePersonalizedLandmarks({
      muscleGroup: 'quads',
      movementCategory: MOVEMENT_CATEGORY.LOWER_COMPOUND,
      recentSessions: [],
    });
    expect(r.regressionApplied).toBe(true);
    expect(r.degradationFactor).toBe(1.0);
  });
  it('isolation cu compound observations < 3 → factor 0.3 applied to MEV/MAV/MRV', () => {
    const r = computePersonalizedLandmarks({
      muscleGroup: 'biceps',
      movementCategory: MOVEMENT_CATEGORY.ISOLATION,
      recentSessions: [],
    });
    expect(r.regressionApplied).toBe(false);
    expect(r.degradationFactor).toBe(0.3);
    // Israetel biceps MEV=8 → 8 × 0.3 = 2.4
    expect(r.mev).toBeCloseTo(8 * 0.3, 5);
  });
  it('isolation cu compound observations >= 3 → factor 1.0 (NU degradation)', () => {
    const sessions = [
      { daysAgo: 1, movements: [{ movementId: 'squat' }] },
      { daysAgo: 3, movements: [{ movementId: 'bench_press' }] },
      { daysAgo: 5, movements: [{ movementId: 'deadlift' }] },
    ];
    const r = computePersonalizedLandmarks({
      muscleGroup: 'biceps',
      movementCategory: MOVEMENT_CATEGORY.ISOLATION,
      recentSessions: sessions,
    });
    expect(r.degradationFactor).toBe(1.0);
  });
  it('unknown muscle → null defensive', () => {
    const r = computePersonalizedLandmarks({
      muscleGroup: 'unknown',
      movementCategory: MOVEMENT_CATEGORY.LOWER_COMPOUND,
    });
    expect(r).toBe(null);
  });
});
