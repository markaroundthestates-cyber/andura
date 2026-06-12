// ══ BUILD #3 — realistic ceiling + diminishing returns (F3 spec §3) tests ════
// Pure ceiling/decay helpers. Asserts the Daniel HARD rule (gain decays to 0 at
// the ceiling), the plateau disambiguation, and the §8.4 no-regression invariant
// (the derived ceiling sits ABOVE the old hand-tuned MAX_KG for mapped lifts).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ceilingE1RM,
  gainDecay,
  ageFraction,
  classifyPattern,
  classifyPlateau,
  isTransferCompatible,
  AGE_FRACTION_FLOOR,
  AGE_FRACTION_CEIL,
} from '../dp/ceiling.js';
import { DP } from '../dp.js';

describe('gainDecay — diminishing returns toward the ceiling (Daniel HARD rule)', () => {
  it('full step far from the ceiling, zero step at/over it', () => {
    expect(gainDecay(50, 200)).toBeCloseTo(1 - Math.pow(0.25, 3), 6); // ~0.984 — near-full
    expect(gainDecay(200, 200)).toBe(0); // AT ceiling → no climb
    expect(gainDecay(260, 200)).toBe(0); // OVER ceiling → clamped to 0 (never negative)
  });

  it('monotonically decreases as the estimate rises toward the ceiling', () => {
    const a = gainDecay(100, 200);
    const b = gainDecay(150, 200);
    const c = gainDecay(190, 200);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(c).toBeLessThan(0.2); // small step just below the ceiling (1 - 0.95^3 ≈ 0.14)
  });

  it('no ceiling info → no throttle (returns 1)', () => {
    expect(gainDecay(100, 0)).toBe(1);
    expect(gainDecay(100, NaN)).toBe(1);
  });
});

describe('ageFraction — attainable fraction grows with training age', () => {
  it('floors a novice and asymptotes a veteran within the band', () => {
    expect(ageFraction(0)).toBeCloseTo(AGE_FRACTION_FLOOR, 6);
    expect(ageFraction(200)).toBeGreaterThan(ageFraction(20));
    expect(ageFraction(100000)).toBeLessThan(AGE_FRACTION_CEIL); // never reaches the cap
  });
});

describe('classifyPattern', () => {
  it('routes canonical CORE_AUTO names to the right movement pattern', () => {
    expect(classifyPattern('Barbell Back Squat (High Bar)')).toBe('squat');
    expect(classifyPattern('Romanian Deadlift')).toBe('deadlift');
    expect(classifyPattern('Leg Press')).toBe('legpress');
    expect(classifyPattern('Flat Barbell Bench')).toBe('benchpress');
    expect(classifyPattern('DB Lateral Raise')).toBe('lateral');
    expect(classifyPattern('Cable Triceps Pushdown Rope')).toBe('tricep');
  });

  it('a chest-muscle press MACHINE is benchpress, not tricep (gym-log 2026-06-12)', () => {
    // 'Flat Chest Press Machine' / 'Hammer Press Machine' contain 'press machine'
    // (the old tricep token) but are mtp='piept' chest presses — they must classify
    // as benchpress so the transfer guard treats them as a pressing movement.
    expect(classifyPattern('Flat Chest Press Machine')).toBe('benchpress');
    expect(classifyPattern('Hammer Press Machine')).toBe('benchpress');
    expect(classifyPattern('Converging Chest Press')).toBe('benchpress');
  });

  it('a true triceps machine stays tricep (no over-correction)', () => {
    // mtp is NOT 'piept' for these → the chest-press guard does not fire.
    expect(classifyPattern('Cable Triceps Pushdown Straight Bar')).toBe('tricep');
    expect(classifyPattern('Cable OH Triceps Rope')).toBe('tricep');
  });
});

describe('isTransferCompatible — cold-start movement-family guard', () => {
  it('admits same pattern and same family (presses, pulls, legs)', () => {
    expect(isTransferCompatible('ohp', 'ohp')).toBe(true);
    expect(isTransferCompatible('benchpress', 'ohp')).toBe(true);   // both push
    expect(isTransferCompatible('row', 'pulldown')).toBe(true);     // both pull
    expect(isTransferCompatible('squat', 'legiso')).toBe(true);     // Bulgarian ← Leg Extension
    expect(isTransferCompatible('squat', 'legpress')).toBe(true);
  });

  it('rejects a press seeding from a fly / rear-delt isolation (the bug)', () => {
    expect(isTransferCompatible('ohp', 'lateral')).toBe(false);       // Smith OHP ✗ Reverse Pec Deck
    expect(isTransferCompatible('benchpress', 'chestfly')).toBe(false); // Converging ✗ Cable Fly
    expect(isTransferCompatible('benchpress', 'lateral')).toBe(false);
  });

  it('an unfamilied isolation only transfers to its own pattern', () => {
    expect(isTransferCompatible('bicep', 'bicep')).toBe(true);
    expect(isTransferCompatible('bicep', 'tricep')).toBe(false);
    expect(isTransferCompatible('chestfly', 'benchpress')).toBe(false);
    expect(isTransferCompatible('generic', 'ohp')).toBe(false); // generic ≠ any family
  });
});

describe('classifyPlateau — near-ceiling vs problem (F3 §3b)', () => {
  it('separates an expected near-ceiling plateau from a problem plateau', () => {
    expect(classifyPlateau(190, 200)).toBe('near_ceiling'); // 0.95 >= 0.9
    expect(classifyPlateau(120, 200)).toBe('problem');      // 0.60 < 0.7
    expect(classifyPlateau(160, 200)).toBe('midrange');     // 0.80
    expect(classifyPlateau(100, 0)).toBe('midrange');       // no ceiling → midrange
  });
});

describe('§8.4 invariant — _effectiveMaxKg never caps below old MAX_KG (flag ON)', () => {
  // The hand-tuned MAX_KG values are DEFENSIVE caps set well above world-class
  // loads (dp.js comment). The realistic strength-standard ceiling can sit BELOW
  // such an absurd defensive cap — so _effectiveMaxKg takes the MAX of the two: a
  // mapped lift is NEVER capped below its MAX_KG (the §8.4 no-regression gate),
  // and an UNMAPPED lift gets a finite derived ceiling instead of the 80kg-default
  // fragility. Force the flag ON via the _devFlags override.
  const MAPPED = [
    'Flat Barbell Bench', 'Barbell Back Squat (High Bar)',
    'Leg Press', 'OHP', 'Cable Triceps Pushdown Rope', 'DB Lateral Raise',
    'Pec Deck / Cable Fly', 'Leg Curl', 'Leg Extension',
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('_devFlags', JSON.stringify({ dp_ceiling_v1: true }));
    // A heavy trained lifter so the bodyweight source resolves sanely.
    localStorage.setItem('weights', JSON.stringify({ '2026-06-01': 110 }));
  });

  for (const ex of MAPPED) {
    it(`${ex}: effective cap >= MAX_KG`, () => {
      const repMin = (DP.REP_RANGES[ex] || [8, 12])[0];
      const eff = DP._effectiveMaxKg(ex, repMin);
      const maxKg = DP.MAX_KG[ex];
      expect(maxKg).toBeGreaterThan(0); // sanity: these are mapped
      expect(eff).toBeGreaterThanOrEqual(maxKg);
    });
  }

  it('an UNMAPPED lift gets a finite derived ceiling (kills the 80kg-default F-1)', () => {
    // A loaded machine lift with no MAX_KG entry.
    const ex = 'Hammer Strength Chest Press'; // not in MAX_KG (verify below)
    expect(DP.MAX_KG[ex]).toBeUndefined();
    const eff = DP._effectiveMaxKg(ex, 8);
    expect(Number.isFinite(eff)).toBe(true);
    expect(eff).toBeGreaterThan(0);
  });
});

describe('ceilingE1RM guards', () => {
  it('returns 0 for unusable bodyweight', () => {
    expect(ceilingE1RM('Flat Barbell Bench', 0, 'm', 100)).toBe(0);
    expect(ceilingE1RM('Flat Barbell Bench', NaN, 'm', 100)).toBe(0);
  });

  it('female factor lowers the ceiling vs male', () => {
    const m = ceilingE1RM('Flat Barbell Bench', 70, 'm', 100);
    const f = ceilingE1RM('Flat Barbell Bench', 70, 'f', 100);
    expect(f).toBeLessThan(m);
    expect(f).toBeCloseTo(m * 0.78, 6);
  });
});
