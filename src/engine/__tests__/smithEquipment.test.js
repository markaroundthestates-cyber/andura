// Smith-machine avoid toggle (2026-06-24) — the founder hates the Smith machine.
// The 'smith' missing-equipment id drives an ADDITIVE name-based exclusion via
// equipmentMap.smithExerciseNames(), unioned into equipmentMissingNames at the
// getDailyWorkout seam (sessionBuilder.dropEquipmentMissing, last-option guarded).
// These tests guard the SET DERIVATION — the one thing that, if wrong, silently
// excludes the wrong exercises. equipment_type is deliberately NOT retagged.
import { describe, it, expect } from 'vitest';
import { smithExerciseNames } from '../equipmentMap.js';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';

describe('smithExerciseNames — Smith-machine avoid set', () => {
  const names = smithExerciseNames();

  it('derives a non-trivial Smith set, every name carrying the word "Smith"', () => {
    // ~30 Smith variants in the library; a floor guards against the regex breaking
    // to 0 (feature dead) and an upper bound against it capturing the whole library.
    expect(names.length).toBeGreaterThanOrEqual(28);
    expect(names.length).toBeLessThan(45);
    for (const n of names) expect(/\bsmith\b/i.test(n)).toBe(true);
  });

  it('every Smith exercise is equipment_type "machine" (no retag — additive only)', () => {
    for (const n of names) {
      expect(EXERCISE_METADATA[n]).toBeDefined();
      expect(EXERCISE_METADATA[n].equipment_type).toBe('machine');
    }
  });

  it('captures known Smith variants', () => {
    expect(names).toContain('Smith OHP');
    expect(names).toContain('Smith Machine Bench');
  });

  it('does NOT capture free-barbell or non-Smith machine lifts', () => {
    expect(names).not.toContain('Flat Barbell Bench');
    expect(names).not.toContain('Reverse Pec Deck');
    expect(names.some((n) => /back squat/i.test(n))).toBe(false);
  });
});
