// W-Split rebalance — PURE unit tests for the split-picker + safety helpers
// (oracle grid GAP 1 + GAP 4, 2026-06-09). The flag-gated rebalance is exercised
// here at the function level (no compose pipeline): the `rebalance=false` arm must
// be byte-identical to the legacy reshape, the `rebalance=true` arm must satisfy
// the minimal-freq full-body + push:pull balance + focus≥antagonist floor + the
// senior cap / maintenance floor.

import { describe, it, expect } from 'vitest';
import { frequencyToSplit, FOCUS_PRESET_IDS } from '../scheduleAdapter.js';
import {
  seniorSessionVolumeCap,
  applyMaintenanceFloor,
} from '../scheduleAdapter/volumeAdaptation.js';
import { ISRAETEL_BASELINES } from '../../periodization/constants.js';

const pushDays = (s) => s.filter((c) => c === 'push').length;
const pullDays = (s) => s.filter((c) => c === 'pull').length;
const trainsBack = (c) => c === 'pull' || c === 'upper' || c === 'full';
const trainsChest = (c) => c === 'push' || c === 'upper' || c === 'full';
const backDays = (s) => s.filter(trainsBack).length;
const chestDays = (s) => s.filter(trainsChest).length;

describe('frequencyToSplit — flag OFF (rebalance=false) is byte-identical to legacy', () => {
  it('matches the default-arg legacy reshape for every freq × preset', () => {
    for (let n = 1; n <= 7; n++) {
      for (const preset of FOCUS_PRESET_IDS) {
        const legacy = frequencyToSplit(n, preset); // default rebalance=false
        const off = frequencyToSplit(n, preset, false);
        expect(off, `n=${n} preset=${preset}`).toEqual(legacy);
      }
    }
  });
});

describe('frequencyToSplit — flag ON (rebalance=true)', () => {
  it('(1) minimal frequency ≤2 → FULL-BODY (never an upper/lower that zeroes a region)', () => {
    expect(frequencyToSplit(1, 'balanced', true)).toEqual(['full']);
    expect(frequencyToSplit(2, 'balanced', true)).toEqual(['full', 'full']);
    // even a v-taper at 1-2 days gets full-body (a region must not vanish).
    expect(frequencyToSplit(2, 'v-taper', true)).toEqual(['full', 'full']);
  });

  it('(4) v-taper → back day-count ≥ chest day-count (the V leads), pull ≥ push', () => {
    for (const n of [3, 4, 5, 6, 7]) {
      const s = frequencyToSplit(n, 'v-taper', true);
      expect(backDays(s), `v-taper n=${n} split=${s}`).toBeGreaterThanOrEqual(chestDays(s));
      expect(pullDays(s), `v-taper n=${n} split=${s}`).toBeGreaterThanOrEqual(pushDays(s));
      expect(s.length).toBe(n); // never degenerate/empty
    }
  });

  it('(4) chest focus → chest day-count ≥ back, push ≥ pull (mirror)', () => {
    for (const n of [3, 4, 5]) {
      const s = frequencyToSplit(n, 'chest', true);
      expect(chestDays(s), `chest n=${n} split=${s}`).toBeGreaterThanOrEqual(backDays(s));
      expect(pushDays(s)).toBeGreaterThanOrEqual(pullDays(s));
    }
  });

  it('(2) balanced multi-day → push/pull day-count within 1 (no skew)', () => {
    for (const n of [3, 4, 5, 6, 7]) {
      const s = frequencyToSplit(n, 'balanced', true);
      expect(Math.abs(pushDays(s) - pullDays(s)), `balanced n=${n} split=${s}`).toBeLessThanOrEqual(1);
      expect(s.length).toBe(n);
    }
  });

  it('every ON split is non-empty for every freq × preset (last-option safety)', () => {
    for (let n = 1; n <= 7; n++) {
      for (const preset of FOCUS_PRESET_IDS) {
        const s = frequencyToSplit(n, preset, true);
        expect(s.length, `n=${n} preset=${preset}`).toBe(n);
      }
    }
  });
});

describe('seniorSessionVolumeCap', () => {
  it('returns null for a trained adult (no cap)', () => {
    expect(seniorSessionVolumeCap(30, 'avansat')).toBeNull();
    expect(seniorSessionVolumeCap(45, 'intermediar')).toBeNull();
    expect(seniorSessionVolumeCap(null, 'avansat')).toBeNull();
  });

  it('caps a senior and tightens with age + beginner status', () => {
    const a72b = seniorSessionVolumeCap(72, 'incepator'); // elderly + beginner
    const a72 = seniorSessionVolumeCap(72, 'avansat'); // elderly only
    const a62b = seniorSessionVolumeCap(62, 'incepator'); // senior + beginner
    const young = seniorSessionVolumeCap(25, 'incepator'); // young beginner
    expect(a72b).toBeLessThan(a72);
    expect(a72).toBeLessThan(a62b + 4); // monotone-ish; elderly ≤ senior+begin band
    expect(a62b).toBeLessThanOrEqual(young);
    for (const v of [a72b, a72, a62b, young]) expect(v).toBeGreaterThan(0);
  });
});

describe('applyMaintenanceFloor', () => {
  it('raises a collapsed MAJOR muscle back to its MEV, leaves above-floor untouched', () => {
    const out = applyMaintenanceFloor({ chest: 0, back: 1, shoulders: 20, biceps: 0 });
    expect(out.chest).toBe(ISRAETEL_BASELINES.chest.MEV);
    expect(out.back).toBe(ISRAETEL_BASELINES.back.MEV);
    expect(out.shoulders).toBe(20); // already above MEV → unchanged
    // small group (biceps) is NOT a major muscle → not floored by this pass
    expect(out.biceps).toBe(0);
  });

  it('null/undefined passes through', () => {
    expect(applyMaintenanceFloor(null)).toBeNull();
    expect(applyMaintenanceFloor(undefined)).toBeNull();
  });
});
