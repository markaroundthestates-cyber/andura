// Tests for the metadata-derived rep-range resolver (Daniel coach audit
// 2026-06-10). Proves the Wave-2 library (657, canonical names that miss the
// curated old-vocab REP_RANGES keys) now resolves correct class-aware ranges
// instead of the flat [8,12] fallback, and that CUT no longer crushes isolations.

import { describe, it, expect } from 'vitest';
import {
  deriveBaseRepRange,
  deriveExerciseClass,
  isHighFatigueCompound,
  resolveRepRange,
} from '../repRange.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';

describe('repRange — deriveBaseRepRange (synthetic metadata)', () => {
  it('heavy compound (tier 1 / high force) → 6-10', () => {
    expect(deriveBaseRepRange({ tier: 1, force_demand: 'high', muscle_target_primary: 'piept' })).toEqual([6, 10]);
    expect(deriveBaseRepRange({ tier: 1, force_demand: 'high', muscle_target_primary: 'picioare-quads' })).toEqual([6, 10]);
  });

  it('shoulder isolation (umeri tier 2) → 12-20', () => {
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'umeri' })).toEqual([12, 20]);
  });

  it('leg-machine isolation (quads/hams tier 2) → 15-20', () => {
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'picioare-quads' })).toEqual([15, 20]);
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'picioare-hamstrings' })).toEqual([15, 20]);
  });

  it('chest/back isolation (tier 2) → 12-15', () => {
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'piept' })).toEqual([12, 15]);
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'spate' })).toEqual([12, 15]);
  });

  it('arms (biceps/triceps) → 10-15', () => {
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'biceps' })).toEqual([10, 15]);
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'triceps' })).toEqual([10, 15]);
  });

  it('calf MISTAG (tier 1 / high force) → still isolation 12-20', () => {
    // The library tags Standing Calf Raise Machine as tier 1 / force high; the
    // muscle override must keep it a high-rep isolation, not a 6-10 compound.
    expect(deriveBaseRepRange({ tier: 1, force_demand: 'high', muscle_target_primary: 'gambe' })).toEqual([12, 20]);
    expect(isHighFatigueCompound({ tier: 1, force_demand: 'high', muscle_target_primary: 'gambe' })).toBe(false);
  });

  it('forearms / core → 12-20', () => {
    expect(deriveBaseRepRange({ tier: 1, force_demand: 'high', muscle_target_primary: 'antebrate' })).toEqual([12, 20]);
    expect(deriveBaseRepRange({ tier: 2, force_demand: 'medium', muscle_target_primary: 'core' })).toEqual([12, 20]);
  });

  it('null / unknown metadata → legacy neutral [8,12]', () => {
    expect(deriveBaseRepRange(null)).toEqual([8, 12]);
    expect(deriveBaseRepRange(undefined)).toEqual([8, 12]);
  });
});

describe('repRange — deriveExerciseClass', () => {
  it('classifies compounds vs isolations', () => {
    expect(deriveExerciseClass({ tier: 1, force_demand: 'high', muscle_target_primary: 'spate' })).toBe('compound');
    expect(deriveExerciseClass({ tier: 2, force_demand: 'medium', muscle_target_primary: 'umeri' })).toBe('isolation');
    expect(deriveExerciseClass({ tier: 1, force_demand: 'high', muscle_target_primary: 'gambe' })).toBe('isolation');
  });
});

describe('repRange — resolveRepRange precedence + CUT policy', () => {
  it('curated range wins over derived', () => {
    const meta = { tier: 2, force_demand: 'medium', muscle_target_primary: 'umeri' }; // derived 12-20
    expect(resolveRepRange({ curated: [8, 12], meta })).toEqual([8, 12]);
  });

  it('falls back to derived when no curated range', () => {
    const meta = { tier: 2, force_demand: 'medium', muscle_target_primary: 'picioare-quads' };
    expect(resolveRepRange({ curated: undefined, meta })).toEqual([15, 20]);
  });

  it('CUT does NOT crush isolation reps (the bug Daniel reported)', () => {
    const meta = { tier: 2, force_demand: 'medium', muscle_target_primary: 'umeri' };
    expect(resolveRepRange({ curated: undefined, meta, isInCut: true })).toEqual([12, 20]);
  });
});

describe('repRange — real Wave-2 library (Daniel target list)', () => {
  const cases = [
    ['Cable Lateral Raise', [12, 20]],
    ['Cable Rear Delt Fly', [12, 20]],
    ['Y Raise', [12, 20]],
    ['Cable Fly', [12, 15]],
    ['Leg Extension', [15, 20]],
    ['Leg Curl', [15, 20]],
    ['Standing Calf Raise Machine', [12, 20]],
    ['Hip Abduction Machine', [12, 20]],
    ['Cable Overhead Triceps Extension Rope', [10, 15]],
    ['Smith Machine Squat', [6, 10]],
    ['Romanian Deadlift', [6, 10]],
    ['Lat Pulldown', [6, 10]],
    ['Cable Row', [6, 10]],
    ['Smith OHP', [6, 10]],
  ];

  it.each(cases)('%s resolves to the correct class-aware range', (name, expected) => {
    const meta = getExerciseMetadata(name);
    expect(meta, `metadata missing for ${name}`).toBeTruthy();
    expect(deriveBaseRepRange(meta)).toEqual(expected);
  });
});
