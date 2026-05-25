import { describe, it, expect } from 'vitest';
import {
  emitConstraintObject,
  enforceHardCapIntensity,
  intensityCorridorForGoal,
} from '../crossEngineHooks.js';
import { HARD_CAP_INTENSITY_PCT_1RM, ISRAETEL_BASELINES } from '../constants.js';

describe('enforceHardCapIntensity — §9.6 Layer C 90% 1RM cap', () => {
  it('caps ceiling at HARD_CAP_INTENSITY_PCT_1RM (0.90)', () => {
    const corridor = enforceHardCapIntensity({ floor: 0.5, ceiling: 0.95 });
    expect(corridor.ceiling).toBe(HARD_CAP_INTENSITY_PCT_1RM);
    expect(corridor.ceiling).toBe(0.90);
  });

  it('preserves ceiling unchanged if under cap', () => {
    const corridor = enforceHardCapIntensity({ floor: 0.5, ceiling: 0.85 });
    expect(corridor.ceiling).toBe(0.85);
  });

  it('preserves floor unchanged if under ceiling', () => {
    const corridor = enforceHardCapIntensity({ floor: 0.55, ceiling: 0.85 });
    expect(corridor.floor).toBe(0.55);
  });

  it('clamps floor when exceeds ceiling (defensive symmetry)', () => {
    const corridor = enforceHardCapIntensity({ floor: 0.95, ceiling: 0.80 });
    expect(corridor.floor).toBeLessThanOrEqual(corridor.ceiling);
  });

  it('returns frozen corridor', () => {
    const corridor = enforceHardCapIntensity({ floor: 0.5, ceiling: 0.85 });
    expect(Object.isFrozen(corridor)).toBe(true);
  });

  it('defensive: undefined input returns valid corridor (0, 0.90)', () => {
    const corridor = enforceHardCapIntensity();
    expect(corridor.floor).toBe(0);
    expect(corridor.ceiling).toBe(HARD_CAP_INTENSITY_PCT_1RM);
  });

  it('defensive: non-numeric inputs coerce to defaults', () => {
    const corridor = enforceHardCapIntensity({ floor: 'foo', ceiling: 'bar' });
    expect(corridor.floor).toBe(0);
    expect(corridor.ceiling).toBe(HARD_CAP_INTENSITY_PCT_1RM);
  });

  it('negative floor coerces to 0', () => {
    const corridor = enforceHardCapIntensity({ floor: -0.5, ceiling: 0.85 });
    expect(corridor.floor).toBe(0);
  });
});

describe('intensityCorridorForGoal — goal-derived corridors', () => {
  it('Forta → highest band (0.78, 0.90)', () => {
    expect(intensityCorridorForGoal('forta')).toEqual({ floor: 0.78, ceiling: 0.90 });
  });
  it('Hipertrofie → standard hypertrophy band (0.70, 0.85)', () => {
    expect(intensityCorridorForGoal('hipertrofie')).toEqual({ floor: 0.70, ceiling: 0.85 });
  });
  it('Recompozitie → middle band (0.65, 0.80)', () => {
    expect(intensityCorridorForGoal('recompozitie')).toEqual({ floor: 0.65, ceiling: 0.80 });
  });
  it('Longevitate → moderate band (0.55, 0.75)', () => {
    expect(intensityCorridorForGoal('longevitate')).toEqual({ floor: 0.55, ceiling: 0.75 });
  });
  it('Sanatate → lowest band (0.50, 0.70)', () => {
    expect(intensityCorridorForGoal('sanatate')).toEqual({ floor: 0.50, ceiling: 0.70 });
  });
  it('unknown goal default to hipertrofie band', () => {
    expect(intensityCorridorForGoal('foo')).toEqual({ floor: 0.70, ceiling: 0.85 });
  });
});

describe('emitConstraintObject — §9.6 immutable Constraint Object', () => {
  const baseInput = {
    phase: 'LOAD',
    volumeMap: { chest: 14, back: 18, quads: 14 },
    intensityCorridor: { floor: 0.70, ceiling: 0.85 },
    deloadWindow: null,
  };

  it('returns frozen object (immutable_snapshot anti-cascade safeguard)', () => {
    const co = emitConstraintObject(baseInput);
    expect(Object.isFrozen(co)).toBe(true);
    expect(co.immutable_snapshot).toBe(true);
  });

  it('volume_per_muscle entries frozen + within MEV/MRV corridor', () => {
    const co = emitConstraintObject(baseInput);
    expect(Object.isFrozen(co.volume_per_muscle)).toBe(true);
    for (const [muscle, corridor] of Object.entries(co.volume_per_muscle)) {
      expect(Object.isFrozen(corridor)).toBe(true);
      const baseline = ISRAETEL_BASELINES[muscle];
      if (baseline) {
        expect(corridor.floor).toBe(baseline.MEV);
        expect(corridor.ceiling).toBeLessThanOrEqual(baseline.MRV);
      }
    }
  });

  it('sub-MEV target → floor clamped NU peste ceiling (E-01, paritate intensity)', () => {
    // Maria + sanatate: chest MAV 14 × 0.50 × 0.50 ≈ 3.5 → 4 sets, sub MEV 8.
    const co = emitConstraintObject({ ...baseInput, volumeMap: { chest: 4 } });
    const corridor = co.volume_per_muscle.chest;
    expect(corridor.floor).toBeLessThanOrEqual(corridor.ceiling);
    expect(corridor.ceiling).toBe(4); // deliberate sub-MEV target preserved
    expect(corridor.floor).toBe(4);   // floor lowered to ceiling, NU forced to MEV 8
  });

  it('volume ceiling capped at MRV (over-spec input clamped)', () => {
    const co = emitConstraintObject({
      ...baseInput,
      volumeMap: { chest: 999 }, // way over MRV
    });
    expect(co.volume_per_muscle.chest.ceiling).toBe(ISRAETEL_BASELINES.chest.MRV);
  });

  it('intensity hard-capped at 90% (over-spec ceiling clamped)', () => {
    const co = emitConstraintObject({
      ...baseInput,
      intensityCorridor: { floor: 0.5, ceiling: 0.95 },
    });
    expect(co.intensity_pct_1rm.ceiling).toBe(HARD_CAP_INTENSITY_PCT_1RM);
  });

  it('phase passthrough', () => {
    expect(emitConstraintObject({ ...baseInput, phase: 'DELOAD' }).phase).toBe('DELOAD');
    expect(emitConstraintObject({ ...baseInput, phase: 'PEAK' }).phase).toBe('PEAK');
  });

  it('deload_window passthrough + frozen when present', () => {
    const co = emitConstraintObject({
      ...baseInput,
      deloadWindow: { trigger: 'CALENDAR', days: 7 },
    });
    expect(co.deload_window).toEqual({ trigger: 'CALENDAR', days: 7 });
    expect(Object.isFrozen(co.deload_window)).toBe(true);
  });

  it('null deload_window passthrough', () => {
    const co = emitConstraintObject({ ...baseInput, deloadWindow: null });
    expect(co.deload_window).toBeNull();
  });

  it('unknown muscle group ceiling = sets value (no MRV info to cap with)', () => {
    const co = emitConstraintObject({
      ...baseInput,
      volumeMap: { unknown_muscle: 12 },
    });
    expect(co.volume_per_muscle.unknown_muscle.ceiling).toBe(12);
    expect(co.volume_per_muscle.unknown_muscle.floor).toBe(0);
  });

  it('empty volumeMap → empty volume_per_muscle (defensive)', () => {
    const co = emitConstraintObject({ ...baseInput, volumeMap: {} });
    expect(co.volume_per_muscle).toEqual({});
  });

  it('downstream engines cannot mutate Constraint Object (anti-cascade)', () => {
    const co = emitConstraintObject(baseInput);
    expect(() => { co.phase = 'MUTATED'; }).toThrow(TypeError);
    expect(() => { co.intensity_pct_1rm.ceiling = 1.0; }).toThrow(TypeError);
  });
});
