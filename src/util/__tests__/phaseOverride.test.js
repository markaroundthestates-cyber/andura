import { describe, it, expect, beforeEach } from 'vitest';
import { setPhaseOverride, getPhaseOverride } from '../phaseOverride.js';

beforeEach(() => {
  localStorage.clear();
});

describe('setPhaseOverride', () => {
  it('persists CUT phase + phase-change-date + phase-log entry', () => {
    const result = setPhaseOverride('CUT', 2500);
    expect(result.phase).toBe('CUT');
    // Coherent sizing (audit MED 2): CUT snapshot = TDEE -20% (matches AUTO path).
    expect(result.kcalTarget).toBe(Math.round(2500 * 0.8)); // 2000
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(JSON.parse(localStorage.getItem('phase-override') || 'null')).toBe('CUT');
    const log = JSON.parse(localStorage.getItem('phase-log') || '[]');
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ phase: 'CUT', kcalTarget: 2000 });
  });

  it('persists BULK phase with +12% kcal (coherent with AUTO)', () => {
    const result = setPhaseOverride('BULK', 2500);
    expect(result.kcalTarget).toBe(Math.round(2500 * 1.12)); // 2800
  });

  it('persists MAINTENANCE phase at 100% TDEE', () => {
    const result = setPhaseOverride('MAINTENANCE', 2500);
    expect(result.kcalTarget).toBe(2500);
  });

  it('persists STRENGTH phase +5% kcal', () => {
    const result = setPhaseOverride('STRENGTH', 2500);
    expect(result.kcalTarget).toBe(Math.round(2500 * 1.05)); // 2625
  });

  it('AUTO clears override to null + logs AUTO entry', () => {
    setPhaseOverride('CUT', 2500);
    const result = setPhaseOverride('AUTO', 2500);
    expect(result.phase).toBe('AUTO');
    expect(JSON.parse(localStorage.getItem('phase-override') || 'undefined')).toBeNull();
    const log = JSON.parse(localStorage.getItem('phase-log') || '[]');
    expect(log[log.length - 1]).toMatchObject({ phase: 'AUTO', kcalTarget: 2500 });
  });

  it('replaces same-day entry (no duplicates per date)', () => {
    setPhaseOverride('CUT', 2500);
    setPhaseOverride('BULK', 2500);
    const log = JSON.parse(localStorage.getItem('phase-log') || '[]');
    expect(log).toHaveLength(1);
    expect(log[0].phase).toBe('BULK');
  });
});

describe('getPhaseOverride', () => {
  it('returns null when no override set', () => {
    expect(getPhaseOverride()).toBeNull();
  });

  it('returns persisted CUT', () => {
    setPhaseOverride('CUT', 2500);
    expect(getPhaseOverride()).toBe('CUT');
  });

  it('returns null after AUTO clear', () => {
    setPhaseOverride('CUT', 2500);
    setPhaseOverride('AUTO', 2500);
    expect(getPhaseOverride()).toBeNull();
  });

  it('ignores invalid stored value', () => {
    localStorage.setItem('phase-override', JSON.stringify('INVALID'));
    expect(getPhaseOverride()).toBeNull();
  });
});
