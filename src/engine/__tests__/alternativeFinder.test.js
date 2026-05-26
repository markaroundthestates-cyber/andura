import { describe, it, expect } from 'vitest';
import { findAlternatives, getFallbackCascade } from '../alternativeFinder.js';

// Ported from archived smart-routing/__tests__/smartRouting.test.js (WP-2 MOAT revive).
// The archived handleEquipmentBusy case is NOT ported — v1 equipment-detection module
// is intentionally NOT revived (P3-MOAT-DESIGN.md §2). findAlternatives cases preserved
// verbatim; getFallbackCascade cases are NEW per design §5.1.

describe('findAlternatives §36.37 (ranking)', () => {
  it('Tier 1 forta (Lat Pulldown) returns alternatives all force_demand: high', () => {
    const r = findAlternatives('Lat Pulldown');
    expect(r.shouldSkip).toBe(false);
    expect(r.alternatives.length).toBeGreaterThan(0);
  });

  it('unknown exercise → shouldSkip', () => {
    const r = findAlternatives('UnknownExercise');
    expect(r.shouldSkip).toBe(true);
    expect(r.alternatives).toEqual([]);
  });

  it('Tier 2 isolation has alternatives ranked by similarity', () => {
    const r = findAlternatives('Lateral Raises');
    expect(r.alternatives.length).toBeGreaterThan(0);
    // Ranked: same muscle_target_primary first
    r.alternatives.forEach(alt => {
      expect(alt.similarity).toBeGreaterThan(0);
    });
  });

  it('alternatives are sorted descending by similarity', () => {
    const r = findAlternatives('Lateral Raises');
    for (let i = 1; i < r.alternatives.length; i++) {
      expect(r.alternatives[i - 1].similarity).toBeGreaterThanOrEqual(r.alternatives[i].similarity);
    }
  });
});

describe('getFallbackCascade §5.1 (cascade traversal)', () => {
  it('returns original (no swap) when its equipment_type is available', () => {
    const r = getFallbackCascade('Incline Barbell Bench', ['barbell', 'machine', 'dumbbell', 'bodyweight']);
    expect(r.isAlternative).toBe(false);
    expect(r.exercise).toBe('Incline Barbell Bench');
  });

  it('traverses cascade to first available step (easier_machine) when original equip missing', () => {
    // Incline Barbell Bench is barbell; barbell unavailable, machine available
    // → first cascade step easier_machine (Smith Incline Bench, equipment_type machine).
    const r = getFallbackCascade('Incline Barbell Bench', ['machine', 'dumbbell', 'bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.exercise).toBe('Smith Incline Bench');
    expect(r.cascadeStep).toBe('easier_machine');
    expect(r.original).toBe('Incline Barbell Bench');
  });

  it('skips unavailable steps and lands on bodyweight step when only bodyweight available', () => {
    const r = getFallbackCascade('Incline Barbell Bench', ['bodyweight']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).toBe('bodyweight');
    expect(r.exercise).toBe('Pike Push-up');
  });

  it('muscle_group_compose step returns an exercises array (1-2 exercises)', () => {
    // dumbbell-only: machine steps skip → muscle_group_compose (DB) hits before bodyweight.
    const r = getFallbackCascade('Incline Barbell Bench', ['dumbbell']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).toBe('muscle_group_compose');
    expect(Array.isArray(r.exercises)).toBe(true);
    expect(r.exercises.length).toBeGreaterThan(0);
    expect(r.exercises.length).toBeLessThanOrEqual(2);
  });

  it('degrades to ranking when no cascade and original equip missing but a ranked alt is available', () => {
    // Flat Barbell Bench (barbell) has no fallback_cascade; ranked alt Flat DB Press is
    // dumbbell. barbell unavailable, dumbbell available → degrade to ranking → Flat DB Press.
    const r = getFallbackCascade('Flat Barbell Bench', ['dumbbell']);
    expect(r.isAlternative).toBe(true);
    expect(r.cascadeStep).toBe('ranking');
    expect(r.exercise).toBe('Flat DB Press');
    expect(r.original).toBe('Flat Barbell Bench');
  });

  it('no cascade + nothing available → honest noAlt skip', () => {
    const r = getFallbackCascade('Lat Pulldown', []);
    expect(r.isAlternative).toBe(false);
    expect(r.noAlt).toBe(true);
    expect(r.original).toBe('Lat Pulldown');
  });

  it('unknown exercise → honest noAlt skip (anti-paternalism, NU forteaza inferior)', () => {
    const r = getFallbackCascade('UnknownExercise', ['barbell', 'machine']);
    expect(r.isAlternative).toBe(false);
    expect(r.noAlt).toBe(true);
  });

  it('bodyweight original is always available (no equipment needed)', () => {
    const r = getFallbackCascade('Pike Push-up', []);
    expect(r.isAlternative).toBe(false);
    expect(r.exercise).toBe('Pike Push-up');
  });
});
