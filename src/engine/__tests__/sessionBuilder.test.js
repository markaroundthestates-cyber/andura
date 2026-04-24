/**
 * Tests for TASK #22e — sessionBuilder pure function extraction.
 */

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';

const allEquip = ['dumbbell', 'pec_deck', 'bailib_stack', 'matrix_cable', 'leg_machine', 'leg_press_plates'];
const ctx = (available = allEquip) => ({ equipment: { available } });

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

  it('CUT / RECOMP fallback uses FULL_UPPER when type is unknown', () => {
    const session = buildSession('UNKNOWN_TYPE', ctx());
    expect(session.type).toBe('UNKNOWN_TYPE');
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('filters exercises by available equipment', () => {
    // Only dumbbell and bailib_stack available — no pec_deck or matrix_cable
    const limitedCtx = ctx(['dumbbell', 'bailib_stack']);
    const session = buildSession('PUSH', limitedCtx);
    const names = session.exercises.map(e => e.name);
    // Pec Deck requires pec_deck — should be excluded
    expect(names).not.toContain('Pec Deck');
    // Overhead Triceps requires matrix_cable — should be excluded
    expect(names).not.toContain('Overhead Triceps');
    // Incline DB Press requires dumbbell — should be included
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
    // No equipment available → empty exercises list
    expect(session.type).toBe('PUSH');
    expect(session.exercises).toEqual([]);
  });
});
