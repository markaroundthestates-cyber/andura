import { describe, it, expect } from 'vitest';
import { getAlternatives, resolveExercise, ALTERNATIVES } from '../alternativeEngine.js';

describe('ALTERNATIVES map', () => {
  it('covers at least 15 exercises', () => {
    expect(Object.keys(ALTERNATIVES).length).toBeGreaterThanOrEqual(15);
  });

  it('each exercise has at least 1 alternative', () => {
    for (const [ex, alts] of Object.entries(ALTERNATIVES)) {
      expect(alts.length, `${ex} should have alternatives`).toBeGreaterThan(0);
    }
  });
});

describe('getAlternatives', () => {
  it('returns alternatives for Lat Pulldown', () => {
    const alts = getAlternatives('Lat Pulldown', []);
    expect(alts.length).toBeGreaterThan(0);
  });

  it('filters out alternatives requiring unavailable equipment', () => {
    // Pull-ups require pullup_bar
    const alts = getAlternatives('Lat Pulldown', ['pullup_bar']);
    expect(alts).not.toContain('Pull-ups');
    expect(alts).not.toContain('Assisted Pull-ups');
  });

  it('returns all alternatives when no equipment is unavailable', () => {
    const allAlts = getAlternatives('Cable Row', []);
    const filteredAlts = getAlternatives('Cable Row', ['nonexistent']);
    expect(filteredAlts.length).toBe(allAlts.length);
  });

  it('returns empty for unknown exercise', () => {
    const alts = getAlternatives('Unknown Exercise XYZ', []);
    expect(alts).toHaveLength(0);
  });
});

describe('resolveExercise', () => {
  it('returns original if equipment is available', () => {
    const result = resolveExercise('Lat Pulldown', []);
    expect(result.exercise).toBe('Lat Pulldown');
    expect(result.isAlternative).toBe(false);
  });

  it('returns alternative when cable is unavailable', () => {
    const result = resolveExercise('Cable Row', ['cable']);
    expect(result.isAlternative).toBe(true);
    expect(result.exercise).not.toBe('Cable Row');
    expect(result.original).toBe('Cable Row');
  });

  it('returns original for unknown equipment requirement', () => {
    const result = resolveExercise('Incline DB Press', ['barbell']);
    // DB Press doesn't require barbell
    expect(result.exercise).toBe('Incline DB Press');
    expect(result.isAlternative).toBe(false);
  });

  it('handles exercise with no alternatives gracefully', () => {
    const result = resolveExercise('Unknown XYZ', ['cable']);
    expect(result.exercise).toBe('Unknown XYZ');
    expect(result.isAlternative).toBe(false);
  });
});
