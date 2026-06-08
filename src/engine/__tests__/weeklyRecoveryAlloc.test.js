// ══ BUILD F6a #30 — weekly volume distribution by recovery tests (spec §4e) ══
// allocateWeeklyVolumeByRecovery (pure). Asserts:
//   - all-recovered / no-state → clone, byte-identical (graceful degradation).
//   - total-volume conservation: sum(ON) == sum(OFF) (re-distribution only).
//   - bunched-day fix: a fatigued group sheds volume; a fresh group gains it.
//   - MEV/MRV bounds: no group below MEV, none above MRV.

import { describe, it, expect } from 'vitest';
import { allocateWeeklyVolumeByRecovery } from '../schedule/scheduleAdapter/volumeAdaptation.js';
import { ISRAETEL_BASELINES } from '../periodization/constants.js';

const sum = (m) => Object.values(m).reduce((a, b) => a + b, 0);

// A balanced mid-budget week (EN-keyed).
const WEEK = { chest: 14, back: 16, quads: 14, shoulders: 14, biceps: 12, triceps: 12 };

describe('F6a #30 weekly recovery allocation', () => {
  it('no recovery state → clone (byte-identical composition)', () => {
    const out = allocateWeeklyVolumeByRecovery(WEEK, {});
    expect(out).toEqual(WEEK);
    expect(out).not.toBe(WEEK); // a clone, not the same ref
  });

  it('all-recovered state → no-op', () => {
    const state = { piept: 'recovered', spate: 'recovered', umeri: 'recovered' };
    expect(allocateWeeklyVolumeByRecovery(WEEK, state)).toEqual(WEEK);
  });

  it('total weekly volume is conserved (re-distribution only)', () => {
    const state = { piept: 'fatigued', spate: 'recovered', umeri: 'recovered', triceps: 'recovered' };
    const out = allocateWeeklyVolumeByRecovery(WEEK, state);
    expect(sum(out)).toBeCloseTo(sum(WEEK), 6);
  });

  it('bunched-day fix: a fatigued group sheds, a fresh group gains', () => {
    const state = { piept: 'fatigued', umeri: 'recovered' };
    const out = allocateWeeklyVolumeByRecovery(WEEK, state);
    expect(out.chest).toBeLessThan(WEEK.chest);     // fatigued chest deferred
    // some fresh group picked up the freed volume
    const freshGained = ['shoulders', 'back', 'quads', 'biceps', 'triceps']
      .some((g) => out[g] > WEEK[g]);
    expect(freshGained).toBe(true);
  });

  it('respects MEV/MRV bounds for every group', () => {
    const state = { piept: 'fatigued', spate: 'fatigued', umeri: 'recovered' };
    const out = allocateWeeklyVolumeByRecovery(WEEK, state);
    for (const [en, v] of Object.entries(out)) {
      const lm = ISRAETEL_BASELINES[en];
      if (!lm) continue;
      expect(v, `${en} below MEV`).toBeGreaterThanOrEqual(lm.MEV - 1e-6);
      expect(v, `${en} above MRV`).toBeLessThanOrEqual(lm.MRV + 1e-6);
    }
  });
});
