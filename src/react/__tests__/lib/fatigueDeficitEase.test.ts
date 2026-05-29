import { describe, it, expect } from 'vitest';
import { easeDeficitForFatigue } from '../../lib/fatigueDeficitEase';

describe('easeDeficitForFatigue', () => {
  it('eases an active deficit under HIGH_FATIGUE (half deficit, capped)', () => {
    // deficit 400 → half = 200 → capped at 150.
    const r = easeDeficitForFatigue(2000, 2400, 'HIGH_FATIGUE');
    expect(r.eased).toBe(true);
    expect(r.addedKcal).toBe(150);
    expect(r.easedKcal).toBe(2150);
  });

  it('eases by half the deficit when below the cap', () => {
    // deficit 200 → half = 100 (< 150 cap).
    const r = easeDeficitForFatigue(2200, 2400, 'HIGH_FATIGUE');
    expect(r.eased).toBe(true);
    expect(r.addedKcal).toBe(100);
    expect(r.easedKcal).toBe(2300);
  });

  it('never crosses maintenance', () => {
    // tiny deficit 40 → half 20 < meaningful floor → no-op (and never > maint).
    const r = easeDeficitForFatigue(2360, 2400, 'HIGH_FATIGUE');
    expect(r.eased).toBe(false);
    expect(r.easedKcal).toBe(2360);
  });

  it('no-op when fatigue is not high', () => {
    expect(easeDeficitForFatigue(2000, 2400, 'NORMAL').eased).toBe(false);
    expect(easeDeficitForFatigue(2000, 2400, 'MODERATE_FATIGUE').eased).toBe(false);
    expect(easeDeficitForFatigue(2000, 2400, null).eased).toBe(false);
  });

  it('no-op when there is no deficit (target at/above maintenance)', () => {
    expect(easeDeficitForFatigue(2400, 2400, 'HIGH_FATIGUE').eased).toBe(false);
    expect(easeDeficitForFatigue(2600, 2400, 'HIGH_FATIGUE').eased).toBe(false);
  });

  it('no-op when maintenance unknown', () => {
    expect(easeDeficitForFatigue(2000, null, 'HIGH_FATIGUE').eased).toBe(false);
    expect(easeDeficitForFatigue(2000, NaN, 'HIGH_FATIGUE').eased).toBe(false);
  });

  it('never lowers the target', () => {
    const r = easeDeficitForFatigue(2000, 2400, 'HIGH_FATIGUE');
    expect(r.easedKcal).toBeGreaterThanOrEqual(2000);
  });
});
