// ══ BUILD F6c #33 — population-prior cold-start unit tests (F6c spec §2) ═════
// The pure static lookup (sex/BW/experience → e1RM) + the DP seed back-solve.
// Privacy by construction: a bundle constant, computed on-device from onboarding.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  populationPriorE1RM,
  POPULATION_E1RM_PRIOR,
  PRIOR_SEX_FACTOR,
  POPULATION_SIGMA,
  COLDSTART_CONFIDENCE_PENALTY,
  COLDSTART_EQUIP_AXIS,
  coldStartAgeFactor,
  COLDSTART_AGE_FLOOR,
} from '../populationPrior.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';
import { DP } from '../../dp.js';

beforeEach(() => {
  localStorage.clear();
});

describe('populationPriorE1RM — static demographic lookup', () => {
  it('returns null without a usable bodyweight (falls to suggestStartWeight)', () => {
    expect(populationPriorE1RM('Leg Press', { bodyweightKg: null, sex: 'm' })).toBeNull();
    expect(populationPriorE1RM('Leg Press', { bodyweightKg: 0, sex: 'm' })).toBeNull();
    expect(populationPriorE1RM('Leg Press', {})).toBeNull();
  });

  it('e1RM = ratio × bw × sexF × ageDamp × confidence × equipAxis (#80 cold-start damps)', () => {
    const bw = 80;
    const r = populationPriorE1RM('Barbell Back Squat', {
      bodyweightKg: bw, sex: 'm', experience: 'intermediate', age: 30,
    });
    expect(r).not.toBeNull();
    const ratio = POPULATION_E1RM_PRIOR.squat.intermediate;
    // #80: age 30 → no age damp (1.0); no-history confidence + load-axis always apply.
    const meta = getExerciseMetadata('Barbell Back Squat');
    const eqF = meta && COLDSTART_EQUIP_AXIS[meta.equipment_type] != null
      ? COLDSTART_EQUIP_AXIS[meta.equipment_type]
      : 0.80;
    expect(r.e1rm).toBeCloseTo(
      ratio * bw * PRIOR_SEX_FACTOR.m * 1 * COLDSTART_CONFIDENCE_PENALTY * eqF, 6);
    expect(r.pattern).toBe('squat');
    expect(r.sigma).toBe(POPULATION_SIGMA);
  });

  it('#80 chronological-age damper lowers an older user\'s seed (60+ bites)', () => {
    const young = populationPriorE1RM('Leg Press', { bodyweightKg: 85, sex: 'm', experience: 'intermediate', age: 30 });
    const old = populationPriorE1RM('Leg Press', { bodyweightKg: 85, sex: 'm', experience: 'intermediate', age: 65 });
    expect(old.e1rm).toBeLessThan(young.e1rm);
    expect(old.e1rm).toBeCloseTo(young.e1rm * coldStartAgeFactor(65), 6);
    // age-absent → neutral (no damp), equals the young (no-age) seed.
    const noAge = populationPriorE1RM('Leg Press', { bodyweightKg: 85, sex: 'm', experience: 'intermediate' });
    expect(noAge.e1rm).toBeCloseTo(young.e1rm, 6);
  });

  it('#80 coldStartAgeFactor: flat ≤45, taper to floor at 70+', () => {
    expect(coldStartAgeFactor(30)).toBe(1);
    expect(coldStartAgeFactor(45)).toBe(1);
    expect(coldStartAgeFactor(70)).toBe(COLDSTART_AGE_FLOOR);
    expect(coldStartAgeFactor(80)).toBe(COLDSTART_AGE_FLOOR);
    expect(coldStartAgeFactor(60)).toBeGreaterThan(COLDSTART_AGE_FLOOR);
    expect(coldStartAgeFactor(60)).toBeLessThan(1);
    expect(coldStartAgeFactor(null)).toBe(1); // absent → neutral
  });

  it('applies the female sex factor', () => {
    const m = populationPriorE1RM('Barbell Back Squat', { bodyweightKg: 70, sex: 'm', experience: 'beginner' });
    const f = populationPriorE1RM('Barbell Back Squat', { bodyweightKg: 70, sex: 'f', experience: 'beginner' });
    expect(f.e1rm).toBeCloseTo(m.e1rm * PRIOR_SEX_FACTOR.f, 6);
  });

  it('advanced > intermediate > beginner for the same lift', () => {
    const p = (exp) => populationPriorE1RM('Bench Press', { bodyweightKg: 80, sex: 'm', experience: exp }).e1rm;
    expect(p('advanced')).toBeGreaterThan(p('intermediate'));
    expect(p('intermediate')).toBeGreaterThan(p('beginner'));
  });

  it('an unknown experience falls to the beginner tier (conservative)', () => {
    const odd = populationPriorE1RM('Bench Press', { bodyweightKg: 80, sex: 'm', experience: 'godlike' });
    const beg = populationPriorE1RM('Bench Press', { bodyweightKg: 80, sex: 'm', experience: 'beginner' });
    expect(odd.e1rm).toBeCloseTo(beg.e1rm, 6);
  });
});

describe('DP.coldStartPopulationSeed — back-solve to a working kg', () => {
  it('returns a positive working kg for an external-load lift', () => {
    const seed = DP.coldStartPopulationSeed('Leg Press', 10, {
      bodyweightKg: 80, sex: 'm', experience: 'intermediate',
    });
    expect(seed).not.toBeNull();
    expect(seed.kg).toBeGreaterThan(0);
    expect(seed.sigma).toBe(POPULATION_SIGMA);
  });

  it('a heavier user gets a heavier seed (no equipment-floor crater)', () => {
    const light = DP.coldStartPopulationSeed('Leg Press', 10, { bodyweightKg: 60, sex: 'm', experience: 'intermediate' });
    const heavy = DP.coldStartPopulationSeed('Leg Press', 10, { bodyweightKg: 120, sex: 'm', experience: 'intermediate' });
    expect(heavy.kg).toBeGreaterThan(light.kg);
  });

  it('returns null with no usable bodyweight', () => {
    expect(DP.coldStartPopulationSeed('Leg Press', 10, { bodyweightKg: null })).toBeNull();
  });
});
