import { describe, it, expect } from 'vitest';
import { coachDirector } from '../coachDirector.js';

describe('coachDirector.buildLightMobility', () => {
  it('returns mobility-only session ~15 min, no lifts', () => {
    const session = coachDirector.buildLightMobility({}, {});
    expect(session.type).toBe('MOBILITY_LIGHT');
    expect(session.durationMin).toBe(15);
    expect(session.isMobility).toBe(true);
    expect(Array.isArray(session.exercises)).toBe(true);
    expect(session.exercises.length).toBeGreaterThanOrEqual(4);
    session.exercises.forEach(ex => {
      expect(ex.isMobility).toBe(true);
      expect(ex.name).toBeTruthy();
    });
  });

  it('includes band pull-aparts + scapular activation as listed mockup spec', () => {
    const session = coachDirector.buildLightMobility({}, {});
    const names = session.exercises.map(e => e.name);
    expect(names.some(n => /band pull-aparts/i.test(n))).toBe(true);
    expect(names.some(n => /scapular/i.test(n))).toBe(true);
  });
});

describe('coachDirector.rebalanceWeekAfterSkip', () => {
  it('distributes volume boost across next up to 2 sessions', () => {
    const result = coachDirector.rebalanceWeekAfterSkip({}, {}, 'luni');
    expect(result.skippedDay).toBe('luni');
    expect(result.adjustments.length).toBeGreaterThan(0);
    expect(result.adjustments.length).toBeLessThanOrEqual(2);
    result.adjustments.forEach(a => {
      expect(a.day).toBeTruthy();
      expect(a.volumeBoostPct).toBeGreaterThan(0);
    });
  });

  it('returns no adjustments when week is over (duminica skipped)', () => {
    const result = coachDirector.rebalanceWeekAfterSkip({}, {}, 'duminica');
    expect(result.adjustments).toEqual([]);
    expect(result.note).toMatch(/normal de luni/i);
  });

  it('unrecognized day → empty adjustments with explanatory note', () => {
    const result = coachDirector.rebalanceWeekAfterSkip({}, {}, 'WAT');
    expect(result.adjustments).toEqual([]);
    expect(result.note).toMatch(/nu a fost recunoscuta/i);
  });
});

describe('coachDirector.generateSafeSessionForRestDay', () => {
  it('returns reduced-intensity session ≤2 sets per exercise, intensityFactor 0.7', () => {
    const ctx = { equipment: { available: ['dumbbell', 'matrix_cable', 'bailib_stack'] } };
    const session = coachDirector.generateSafeSessionForRestDay({}, ctx, 'UMERI_BRATE');
    expect(session.isSafeRestDay).toBe(true);
    expect(session.intensityFactor).toBe(0.7);
    expect(session.type).toBe('UMERI_BRATE');
    expect(session.exercises.length).toBeLessThanOrEqual(4);
    session.exercises.forEach(ex => {
      expect(ex.sets).toBeLessThanOrEqual(2);
      expect(ex.isSafeRestDay).toBe(true);
    });
  });

  it('defaults to UMERI_BRATE when no alternativeType provided', () => {
    const ctx = { equipment: { available: ['dumbbell', 'matrix_cable'] } };
    const session = coachDirector.generateSafeSessionForRestDay({}, ctx);
    expect(session.type).toBe('UMERI_BRATE');
  });

  it('handles missing ctx without throwing', () => {
    const session = coachDirector.generateSafeSessionForRestDay({}, null, 'PUSH');
    expect(session.isSafeRestDay).toBe(true);
    expect(Array.isArray(session.exercises)).toBe(true);
  });
});
