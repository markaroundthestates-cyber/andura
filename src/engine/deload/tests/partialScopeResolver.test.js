import { describe, it, expect } from 'vitest';
import { resolvePartialScope } from '../partialScopeResolver.js';
import { TRIGGER_SOURCE } from '../constants.js';

describe('resolvePartialScope — Cluster B10 Hibrid mechanic verbatim', () => {
  it('Composite trigger + cross-muscular → null full-body sistemic', () => {
    const r = resolvePartialScope({
      primaryTriggerSource: TRIGGER_SOURCE.COMPOSITE,
    });
    expect(r.affectedMuscleGroups).toBe(null);
    expect(r.fullBodySystemic).toBe(true);
    expect(r.perMuscleMrvAlone).toBe(false);
  });

  it('AA trigger + cross-muscular → null full-body sistemic', () => {
    const r = resolvePartialScope({
      primaryTriggerSource: TRIGGER_SOURCE.AA,
    });
    expect(r.affectedMuscleGroups).toBe(null);
    expect(r.fullBodySystemic).toBe(true);
  });

  it('Linear trigger → null full-body sistemic (cross-muscular signal)', () => {
    const r = resolvePartialScope({
      primaryTriggerSource: TRIGGER_SOURCE.LINEAR,
    });
    expect(r.affectedMuscleGroups).toBe(null);
    expect(r.fullBodySystemic).toBe(true);
  });

  it('Per-muscle MRV alone + groups → partial deload muscle group list', () => {
    const r = resolvePartialScope({
      primaryTriggerSource:    TRIGGER_SOURCE.COMPOSITE,
      affectedMuscleGroups:    ['chest'],
      mrvExceededAlone:        true,
    });
    expect(r.affectedMuscleGroups).toEqual(['chest']);
    expect(r.perMuscleMrvAlone).toBe(true);
    expect(r.fullBodySystemic).toBe(false);
  });

  it('Per-muscle MRV alone + multiple groups → partial deload all listed', () => {
    const r = resolvePartialScope({
      primaryTriggerSource:    TRIGGER_SOURCE.AA,
      affectedMuscleGroups:    ['chest', 'shoulders', 'triceps'],
      mrvExceededAlone:        true,
    });
    expect(r.affectedMuscleGroups).toEqual(['chest', 'shoulders', 'triceps']);
    expect(r.perMuscleMrvAlone).toBe(true);
  });

  it('Per-muscle MRV alone + empty groups → null full-body fallback safe', () => {
    const r = resolvePartialScope({
      primaryTriggerSource:    TRIGGER_SOURCE.COMPOSITE,
      affectedMuscleGroups:    [],
      mrvExceededAlone:        true,
    });
    expect(r.affectedMuscleGroups).toBe(null);
    expect(r.fullBodySystemic).toBe(true);
  });

  it('NONE trigger source → null full-body fallback defensive', () => {
    const r = resolvePartialScope({
      primaryTriggerSource: TRIGGER_SOURCE.NONE,
    });
    expect(r.affectedMuscleGroups).toBe(null);
    expect(r.fullBodySystemic).toBe(true);
  });

  it('Invalid muscle groups (non-string) → filtered out', () => {
    const r = resolvePartialScope({
      primaryTriggerSource:    TRIGGER_SOURCE.AA,
      affectedMuscleGroups:    ['chest', null, 123, 'back'],
      mrvExceededAlone:        true,
    });
    expect(r.affectedMuscleGroups).toEqual(['chest', 'back']);
  });

  it('EXTENSION trigger → null full-body sistemic', () => {
    const r = resolvePartialScope({
      primaryTriggerSource: TRIGGER_SOURCE.EXTENSION,
    });
    expect(r.fullBodySystemic).toBe(true);
  });

  it('Frozen affectedMuscleGroups output (immutable)', () => {
    const r = resolvePartialScope({
      primaryTriggerSource:    TRIGGER_SOURCE.AA,
      affectedMuscleGroups:    ['chest'],
      mrvExceededAlone:        true,
    });
    expect(Object.isFrozen(r.affectedMuscleGroups)).toBe(true);
  });
});
