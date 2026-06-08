// ══ BUILD #76 — energy → VOLUME / RIR / deload modulation (magnitude-aware) ══
// Pure energyVolumeFactor(magnitude) tests. #37 only throttles the LOAD climb on a
// binary phase; #76 modulates the SESSION VOLUME + RIR + deload by the deficit/
// surplus MAGNITUDE. Asserts: deeper deficit → more volume cut (toward −30%) + more
// RIR + more deload bias; surplus → small extra volume + closer to failure; the
// neutral identity for MAINTENANCE / absent / sub-onset; and the hard clamps.
// CRITICAL: the function NEVER emits a load output (KEEP-LOAD invariant lives in the
// caller — proven in the compose test).

import { describe, it, expect } from 'vitest';
import {
  energyVolumeFactor,
  VOLUME_CUT_MIN,
  VOLUME_CUT_MAX,
  VOLUME_FACTOR_MIN,
  VOLUME_FACTOR_MAX,
  VOLUME_SURPLUS_BONUS_MAX,
  ENERGY_DEFICIT_ONSET,
  SEVERITY_AT_MAX_CUT,
  RIR_SHIFT_MAX,
} from '../dp/ceiling.js';

describe('energyVolumeFactor — magnitude-aware energy → volume/RIR/deload', () => {
  it('MAINTENANCE / absent / null → neutral identity (byte-identical caller)', () => {
    const neutral = { volumeFactor: 1, rirShift: 0, deloadBias: 0 };
    expect(energyVolumeFactor(null)).toEqual(neutral);
    expect(energyVolumeFactor(undefined)).toEqual(neutral);
    expect(energyVolumeFactor({ phase: 'MAINTENANCE', severity: 0.4 })).toEqual(neutral);
    expect(energyVolumeFactor({ phase: 'CUT', severity: 0 })).toEqual(neutral);
  });

  it('sub-onset deficit (a trivial cut) → neutral (do not punish maintenance-ish cut)', () => {
    const out = energyVolumeFactor({ phase: 'CUT', severity: ENERGY_DEFICIT_ONSET });
    expect(out).toEqual({ volumeFactor: 1, rirShift: 0, deloadBias: 0 });
  });

  it('mild deficit (just past onset) → ~−15% volume (the policy floor of the cut band)', () => {
    const out = energyVolumeFactor({ phase: 'CUT', severity: ENERGY_DEFICIT_ONSET + 1e-6 });
    expect(out.volumeFactor).toBeCloseTo(1 - VOLUME_CUT_MIN, 3); // ~0.85
    expect(out.rirShift).toBe(0); // shift ramps from 0
  });

  it('deep deficit (>= SEVERITY_AT_MAX_CUT) → −30% volume (policy ceiling) + max RIR', () => {
    const out = energyVolumeFactor({ phase: 'CUT', severity: SEVERITY_AT_MAX_CUT });
    expect(out.volumeFactor).toBeCloseTo(1 - VOLUME_CUT_MAX, 3); // 0.70
    expect(out.volumeFactor).toBe(VOLUME_FACTOR_MIN);            // clamped at the floor
    expect(out.rirShift).toBe(RIR_SHIFT_MAX);                    // furthest from failure
    expect(out.deloadBias).toBeCloseTo(1, 3);                    // deepest deload pull-forward
  });

  it('deeper deficit cuts MORE volume than a milder one (monotonic in severity)', () => {
    const mild = energyVolumeFactor({ phase: 'CUT', severity: 0.10 });
    const deep = energyVolumeFactor({ phase: 'CUT', severity: 0.25 });
    expect(deep.volumeFactor).toBeLessThan(mild.volumeFactor);
    expect(deep.rirShift).toBeGreaterThanOrEqual(mild.rirShift);
    expect(deep.deloadBias).toBeGreaterThan(mild.deloadBias);
  });

  it('surplus (BULK) → a SMALL extra volume tolerance (toward +10%), closer to failure', () => {
    const out = energyVolumeFactor({ phase: 'BULK', severity: 0.15 });
    expect(out.volumeFactor).toBeCloseTo(1 + VOLUME_SURPLUS_BONUS_MAX, 3); // ~1.10
    expect(out.volumeFactor).toBeGreaterThan(1);
    expect(out.rirShift).toBeLessThanOrEqual(0); // train slightly CLOSER to failure
    expect(out.deloadBias).toBe(0);              // no deload pull-forward in a surplus
  });

  it('STRENGTH behaves as a surplus (slight extra tolerance)', () => {
    const out = energyVolumeFactor({ phase: 'STRENGTH', severity: 0.15 });
    expect(out.volumeFactor).toBeGreaterThan(1);
  });

  it('hard clamps: factor never below VOLUME_FACTOR_MIN nor above VOLUME_FACTOR_MAX', () => {
    const extremeCut = energyVolumeFactor({ phase: 'CUT', severity: 1 });
    const extremeSurplus = energyVolumeFactor({ phase: 'BULK', severity: 1 });
    expect(extremeCut.volumeFactor).toBeGreaterThanOrEqual(VOLUME_FACTOR_MIN);
    expect(extremeSurplus.volumeFactor).toBeLessThanOrEqual(VOLUME_FACTOR_MAX);
  });

  it('defensive: a non-finite / negative severity clamps to 0 → neutral for CUT onset', () => {
    expect(energyVolumeFactor({ phase: 'CUT', severity: NaN })).toEqual(
      { volumeFactor: 1, rirShift: 0, deloadBias: 0 },
    );
    expect(energyVolumeFactor({ phase: 'CUT', severity: -0.5 })).toEqual(
      { volumeFactor: 1, rirShift: 0, deloadBias: 0 },
    );
  });

  it('the function emits NO load output (KEEP-LOAD: load is owned by the dp.js kg path)', () => {
    const out = energyVolumeFactor({ phase: 'CUT', severity: 0.3 });
    expect(out).not.toHaveProperty('kg');
    expect(out).not.toHaveProperty('targetKg');
    expect(out).not.toHaveProperty('load');
    expect(Object.keys(out).sort()).toEqual(['deloadBias', 'rirShift', 'volumeFactor']);
  });
});
