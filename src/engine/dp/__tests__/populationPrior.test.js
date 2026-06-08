// ══ BUILD F6c #33 — population-prior cold-start unit tests (F6c spec §2) ═════
// The pure static lookup (sex/BW/experience → e1RM) + the DP seed back-solve.
// Privacy by construction: a bundle constant, computed on-device from onboarding.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  populationPriorE1RM,
  POPULATION_E1RM_PRIOR,
  PRIOR_SEX_FACTOR,
  POPULATION_SIGMA,
} from '../populationPrior.js';
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

  it('e1RM = ratio × bodyweight × sexFactor for the matched pattern + experience', () => {
    const bw = 80;
    const r = populationPriorE1RM('Barbell Back Squat', {
      bodyweightKg: bw, sex: 'm', experience: 'intermediate',
    });
    expect(r).not.toBeNull();
    const ratio = POPULATION_E1RM_PRIOR.squat.intermediate;
    expect(r.e1rm).toBeCloseTo(ratio * bw * PRIOR_SEX_FACTOR.m, 6);
    expect(r.pattern).toBe('squat');
    expect(r.sigma).toBe(POPULATION_SIGMA);
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
