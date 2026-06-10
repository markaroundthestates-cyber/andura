// Tests for the metadata-derived load model (R5, Daniel coach audit 2026-06-10).
// Proves: gap exercises get a defensive cap + a real equipment step; curated
// entries always win; flag OFF is byte-identical legacy (null cap / 2.5 step).

import { describe, it, expect } from 'vitest';
import { deriveMaxKg, resolveMaxKg, resolveStep, clampCalibratedToDemonstrated } from '../loadModel.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';

describe('loadModel — deriveMaxKg (synthetic metadata)', () => {
  it('shoulder DB isolation → 18 (the Y Raise ego-load brake)', () => {
    expect(deriveMaxKg({ tier: 2, force_demand: 'medium', muscle_target_primary: 'umeri', equipment_type: 'dumbbell' })).toBe(18);
  });

  it('glute machine isolation → 150 (Hip Abduction keeps room but gains a brake)', () => {
    expect(deriveMaxKg({ tier: 2, force_demand: 'medium', muscle_target_primary: 'fese', equipment_type: 'machine' })).toBe(150);
  });

  it('back isolation spans pullover-to-shrug → machine 180, barbell 250 (heavy shrugs), cable 90', () => {
    expect(deriveMaxKg({ tier: 2, force_demand: 'medium', muscle_target_primary: 'spate', equipment_type: 'machine' })).toBe(180);
    // barbell shrug 250: a strong lifter shrugs 200kg+ → 180 false-braked them (audit 2026-06-10).
    expect(deriveMaxKg({ tier: 2, force_demand: 'medium', muscle_target_primary: 'spate', equipment_type: 'barbell' })).toBe(250);
    expect(deriveMaxKg({ tier: 2, force_demand: 'medium', muscle_target_primary: 'spate', equipment_type: 'cable' })).toBe(90);
  });

  it('compound ceilings: quads barbell 400, dumbbell damped per-hand', () => {
    expect(deriveMaxKg({ tier: 1, force_demand: 'high', muscle_target_primary: 'picioare-quads', equipment_type: 'barbell' })).toBe(400);
    expect(deriveMaxKg({ tier: 1, force_demand: 'high', muscle_target_primary: 'piept', equipment_type: 'dumbbell' })).toBe(77); // 220×0.35
  });

  it('no metadata → null (never guess blind)', () => {
    expect(deriveMaxKg(null)).toBeNull();
    expect(deriveMaxKg({})).toBeNull();
  });
});

describe('loadModel — resolveMaxKg precedence + flag arms', () => {
  const iso = { tier: 2, force_demand: 'medium', muscle_target_primary: 'umeri', equipment_type: 'dumbbell' };

  it('curated always wins (both arms)', () => {
    expect(resolveMaxKg({ curated: 25, meta: iso, flagOn: true })).toBe(25);
    expect(resolveMaxKg({ curated: 25, meta: iso, flagOn: false })).toBe(25);
  });

  it('OFF → null for a gap exercise (byte-identical legacy unbounded)', () => {
    expect(resolveMaxKg({ curated: undefined, meta: iso, flagOn: false })).toBeNull();
  });

  it('ON → derived cap fills the gap', () => {
    expect(resolveMaxKg({ curated: undefined, meta: iso, flagOn: true })).toBe(18);
  });
});

describe('loadModel — resolveStep', () => {
  const machine = { muscle_target_primary: 'fese', equipment_type: 'machine' };

  it('curated WEIGHT_STEPS wins', () => {
    expect(resolveStep({ curated: 4, meta: machine, flagOn: true })).toBe(4);
  });

  it('OFF → legacy flat 2.5', () => {
    expect(resolveStep({ curated: undefined, meta: machine, flagOn: false })).toBe(2.5);
  });

  it('ON → equipment-derived step (machine 5, dumbbell 2, cable 2.5)', () => {
    expect(resolveStep({ curated: undefined, meta: machine, flagOn: true })).toBe(5);
    expect(resolveStep({ curated: undefined, meta: { equipment_type: 'dumbbell' }, flagOn: true })).toBe(2);
    expect(resolveStep({ curated: undefined, meta: { equipment_type: 'cable' }, flagOn: true })).toBe(2.5);
  });
});

describe('loadModel — real Wave-2 library (Daniel audit exercises)', () => {
  it('Y Raise (umeri/dumbbell) gains an 18kg brake; Hip Abduction Machine 150; Smith Machine Shrug 180', () => {
    expect(resolveMaxKg({ curated: undefined, meta: getExerciseMetadata('Y Raise'), flagOn: true })).toBe(18);
    expect(resolveMaxKg({ curated: undefined, meta: getExerciseMetadata('Hip Abduction Machine'), flagOn: true })).toBe(150);
    // Shrug: whatever its tag, it must HAVE a finite brake now (was unbounded).
    expect(resolveMaxKg({ curated: undefined, meta: getExerciseMetadata('Smith Machine Shrug'), flagOn: true })).toBeGreaterThan(0);
  });
});

describe('loadModel — audit-2 refinements (2026-06-10 fresh-eyes sweep)', () => {
  it('umeri compound cap raised 150→180 (Machine Shoulder Press borderline false-brake)', () => {
    expect(deriveMaxKg({ tier: 1, force_demand: 'high', muscle_target_primary: 'umeri', equipment_type: 'machine' })).toBe(180);
  });
});

// ── clampCalibratedToDemonstrated — Daniel bug 2026-06-10 (real account) ─────────
// Leg Ext 96×10 (e1RM 128), learned factor 1.255 pushed the demonstrated-anchored
// base (90) to 110×15 — heavier AND more reps than any logged set. The factor may
// lift the base toward proven capacity but must never compound past it.
describe('loadModel — clampCalibratedToDemonstrated (factor-vs-demonstrated guard)', () => {
  it('trims factor over-inflation to the demonstrated-e1RM cap (110 base90 demo83 → 90)', () => {
    // cap = max(base 90, demo 83) = 90; min(calibrated 110, 90) = 90.
    expect(clampCalibratedToDemonstrated(110, 90, 83)).toBe(90);
  });

  it('lets the factor lift the base UP to demonstrated capacity (cold base under proof)', () => {
    // base 40 under-shoots; demo 56 is proven → factor allowed up to 56.
    expect(clampCalibratedToDemonstrated(56, 40, 56)).toBe(56);
    expect(clampCalibratedToDemonstrated(70, 40, 56)).toBe(56); // never past proof
  });

  it('never undoes a legitimate base progression (base is the floor)', () => {
    // base progressed to 100 above an older demo 83 → keep 100, only trim above it.
    expect(clampCalibratedToDemonstrated(100, 100, 83)).toBe(100);
    expect(clampCalibratedToDemonstrated(125, 100, 83)).toBe(100);
  });

  it('golden-safe: no demonstrated e1RM (cold start) → calibrated unchanged', () => {
    expect(clampCalibratedToDemonstrated(110, 0, 0)).toBe(110);
  });

  it('identity when the factor did not move the load (calibrated ≤ cap)', () => {
    expect(clampCalibratedToDemonstrated(80, 90, 83)).toBe(80);
  });

  it('non-positive / invalid loads pass through untouched', () => {
    expect(clampCalibratedToDemonstrated(0, 90, 83)).toBe(0);
    expect(clampCalibratedToDemonstrated(NaN, 90, 83)).toBeNaN();
  });
});
