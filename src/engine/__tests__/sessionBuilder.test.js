/**
 * Tests for TASK #22e + #22f — sessionBuilder pure function + weakness ordering.
 */

import { describe, it, expect } from 'vitest';
import { buildSession, prioritizeWeakGroups } from '../sessionBuilder.js';

const allEquip = ['dumbbell', 'pec_deck', 'bailib_stack', 'matrix_cable', 'leg_machine', 'leg_press_plates'];
const ctx = (available = allEquip, weakGroups = []) => ({ equipment: { available }, weakGroups });

// ── buildSession — OPT C pure function ───────────────────────────────────

describe('buildSession — pure function', () => {
  it('returns correct type field for PUSH', () => {
    const session = buildSession('PUSH', ctx());
    expect(session.type).toBe('PUSH');
  });

  it('PUSH session includes chest and shoulder exercises', () => {
    const session = buildSession('PUSH', ctx());
    const names = session.exercises.map(e => e.name);
    expect(names).toContain('Incline DB Press');
    expect(names).toContain('DB Shoulder Press');
    expect(names).toContain('Lateral Raises');
  });

  it('PULL session includes lat and curl exercises', () => {
    const session = buildSession('PULL', ctx());
    const names = session.exercises.map(e => e.name);
    expect(names).toContain('Lat Pulldown');
    expect(names).toContain('Cable Row');
    expect(names).toContain('Bayesian Curl');
  });

  it('unknown type falls back to FULL_UPPER exercises', () => {
    const session = buildSession('UNKNOWN_TYPE', ctx());
    expect(session.type).toBe('UNKNOWN_TYPE');
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('filters exercises by available equipment', () => {
    const limitedCtx = ctx(['dumbbell', 'bailib_stack']);
    const session = buildSession('PUSH', limitedCtx);
    const names = session.exercises.map(e => e.name);
    expect(names).not.toContain('Pec Deck');
    expect(names).not.toContain('Overhead Triceps');
    expect(names).toContain('Incline DB Press');
  });

  it('each exercise has sets defaulting to 3', () => {
    const session = buildSession('PULL', ctx());
    for (const ex of session.exercises) {
      expect(ex.sets).toBe(3);
    }
  });

  it('handles missing ctx.equipment gracefully', () => {
    const session = buildSession('PUSH', {});
    expect(session.type).toBe('PUSH');
    expect(session.exercises).toEqual([]);
  });
});

// ── prioritizeWeakGroups — OPT A weakness ordering ───────────────────────

describe('prioritizeWeakGroups — weakness ordering', () => {
  it('delt_rear weak → Face Pulls moves to first 2 positions', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Cable Row', sets: 3 },
      { name: 'Face Pulls', sets: 3 },
      { name: 'Bayesian Curl', sets: 3 },
    ];
    const result = prioritizeWeakGroups(exercises, ['delt_rear']);
    const names = result.map(e => e.name);
    expect(names.indexOf('Face Pulls')).toBeLessThan(2);
  });

  it('does NOT add exercises not in the original list', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Cable Row', sets: 3 },
    ];
    // delt_rear exercises (Face Pulls, Rear Delt Fly) are NOT in the list
    const result = prioritizeWeakGroups(exercises, ['delt_rear']);
    const names = result.map(e => e.name);
    expect(names).not.toContain('Face Pulls');
    expect(names).not.toContain('Rear Delt Fly');
    expect(result).toHaveLength(2);
  });

  it('preserves original ordering when weakGroup exercises not in session', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Bayesian Curl', sets: 3 },
      { name: 'Cable Row', sets: 3 },
    ];
    // quad exercises (Leg Press, Leg Extension) are not in this PULL session
    const result = prioritizeWeakGroups(exercises, ['quad']);
    const names = result.map(e => e.name);
    expect(names).toEqual(['Lat Pulldown', 'Bayesian Curl', 'Cable Row']);
  });

  it('total exercise count does not change after reordering', () => {
    const exercises = [
      { name: 'Lat Pulldown', sets: 3 },
      { name: 'Cable Row', sets: 3 },
      { name: 'Face Pulls', sets: 3 },
      { name: 'Bayesian Curl', sets: 3 },
      { name: 'Incline DB Curl', sets: 3 },
    ];
    const result = prioritizeWeakGroups(exercises, ['delt_rear']);
    expect(result).toHaveLength(exercises.length);
  });
});
