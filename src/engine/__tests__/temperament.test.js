// ══ BUILD #3/F — temperament: sandbagger vs grinder tests (F4 spec §F) ═══════
// (1) Pure inference: a sandbagger (greu while holding reserve) → bias > 0; a
//     grinder (usor while reps collapse near the demonstrated max) → bias < 0; a
//     consistent rater → ~0; a thin history → null (neutral); the band is clamped.
// (2) Persistence round-trip (synced dp-temperament, global + per-exercise keys).
// (3) Consumer: with the flag ON, a learned sandbagger bias raises the RIR for a
//     greu set (so e1RM climbs); flag OFF → the legacy 3/1/0 map (byte-identical).

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  temperamentBiasFromLogs,
  structuralRir,
  saveTemperament,
  temperamentBias,
  TEMPERAMENT_KEY,
  GLOBAL_KEY,
  BIAS_CLAMP,
  MIN_SETS,
} from '../dp/temperament.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

// The 3-bucket reverse-map horizon the engine stores (workoutStore RATING_TO_RPE).
const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };

describe('structuralRir — true reserve from reps + load', () => {
  it('reps well over target + load below demonstrated → clear reserve', () => {
    // hit 12 reps when 8 asked, at 80% of demonstrated → reserve from BOTH signals.
    const r = structuralRir({ w: 80, reps: 12, repTarget: 8, demoKg: 100 });
    expect(r).toBeGreaterThan(1);
  });
  it('reps short at the demonstrated max → near failure (≈0 reserve)', () => {
    const r = structuralRir({ w: 100, reps: 5, repTarget: 8, demoKg: 100 });
    expect(r).toBe(0);
  });
  it('returns null for unusable reps', () => {
    expect(structuralRir({ w: 80, reps: 0, repTarget: 8, demoKg: 100 })).toBeNull();
  });
});

describe('temperamentBiasFromLogs — pure inference', () => {
  // A SANDBAGGER rates greu (assumed RIR 0) while structurally holding reserve.
  const sandbagger = Array.from({ length: MIN_SETS }, () => ({
    w: 80, reps: 12, rpe: RPE.greu, repTarget: 8, demoKg: 100,
  }));
  // A GRINDER rates usor (assumed RIR 3) while structurally near failure.
  const grinder = Array.from({ length: MIN_SETS }, () => ({
    w: 100, reps: 6, rpe: RPE.usor, repTarget: 8, demoKg: 100,
  }));
  // A CONSISTENT rater: potrivit (assumed RIR 1) with ~1 RIR of true reserve.
  const consistent = Array.from({ length: MIN_SETS }, () => ({
    w: 92, reps: 9, rpe: RPE.potrivit, repTarget: 8, demoKg: 100,
  }));

  it('a sandbagger gets a positive bias (don\'t stall the climb)', () => {
    const t = temperamentBiasFromLogs(sandbagger);
    expect(t).not.toBeNull();
    expect(t.bias).toBeGreaterThan(0.3);
  });
  it('a grinder gets a negative bias (don\'t over-climb)', () => {
    const t = temperamentBiasFromLogs(grinder);
    expect(t).not.toBeNull();
    expect(t.bias).toBeLessThan(0);
  });
  it('a consistent rater stays near neutral', () => {
    const t = temperamentBiasFromLogs(consistent);
    expect(t).not.toBeNull();
    expect(Math.abs(t.bias)).toBeLessThan(0.5);
  });
  it('a thin history stays neutral (null)', () => {
    expect(temperamentBiasFromLogs(sandbagger.slice(0, MIN_SETS - 1))).toBeNull();
  });
  it('the bias is clamped to the sane band', () => {
    // An extreme sandbagger can never exceed BIAS_CLAMP.
    const extreme = Array.from({ length: 40 }, () => ({
      w: 50, reps: 20, rpe: RPE.greu, repTarget: 8, demoKg: 100,
    }));
    const t = temperamentBiasFromLogs(extreme);
    expect(t.bias).toBeLessThanOrEqual(BIAS_CLAMP);
  });
});

describe('persistence — synced dp-temperament', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips a per-exercise and the global bias', () => {
    saveTemperament('Barbell Bench Press', { bias: 1.0, n: 10 });
    saveTemperament(GLOBAL_KEY, { bias: 0.5, n: 30 });
    expect(temperamentBias('Barbell Bench Press')).toBe(1.0);
    // an exercise WITHOUT its own entry falls back to the global bias.
    expect(temperamentBias('Some Other Lift')).toBe(0.5);
    expect(/** @type {any} */ (DB.get(TEMPERAMENT_KEY))[GLOBAL_KEY].n).toBe(30);
  });
  it('returns 0 when no trusted bias exists (neutral)', () => {
    expect(temperamentBias('Unknown Lift')).toBe(0);
  });
  it('an under-MIN_SETS per-exercise entry is not trusted (falls to 0 / global)', () => {
    saveTemperament('Thin Lift', { bias: 1.2, n: MIN_SETS - 1 });
    expect(temperamentBias('Thin Lift')).toBe(0);
  });
});

describe('DP._rirFromRpe — temperament consumer', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('FLAG OFF (default) — the legacy 3/1/0 map (byte-identical)', () => {
    // dp_temperament_v1 flipped default-ON (Wave 2026-06-14); pin it OFF to assert
    // the legacy 3/1/0 map (no learned bias) explicitly.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_temperament_v1: false }));
    saveTemperament('Barbell Bench Press', { bias: 1.5, n: 10 }); // present but flag off
    expect(DP._rirFromRpe(RPE.greu, 'Barbell Bench Press')).toBe(0);
    expect(DP._rirFromRpe(RPE.potrivit, 'Barbell Bench Press')).toBe(1);
    expect(DP._rirFromRpe(RPE.usor, 'Barbell Bench Press')).toBe(3);
  });

  it('FLAG ON + a sandbagger bias — lifts a greu set off RIR 0 (the climb resumes)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_temperament_v1');
    saveTemperament('Barbell Bench Press', { bias: 1.5, n: 10 });
    // greu base RIR 0 + 1.5 bias → 1.5 (the engine no longer treats it as failure).
    expect(DP._rirFromRpe(RPE.greu, 'Barbell Bench Press')).toBe(1.5);
  });

  it('FLAG ON + a grinder bias — never drops RIR below 0', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_temperament_v1');
    saveTemperament('Barbell Bench Press', { bias: -1.5, n: 10 });
    // greu base 0 + (-1.5) clamped at 0 (reserve is never negative).
    expect(DP._rirFromRpe(RPE.greu, 'Barbell Bench Press')).toBe(0);
    // usor base 3 + (-1.5) → 1.5 (discounted, don't over-climb).
    expect(DP._rirFromRpe(RPE.usor, 'Barbell Bench Press')).toBe(1.5);
  });

  it('FLAG ON but no ex supplied — the legacy map (byte-identical)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_temperament_v1');
    saveTemperament(GLOBAL_KEY, { bias: 1.5, n: 30 });
    expect(DP._rirFromRpe(RPE.greu)).toBe(0); // no ex → no bias lookup
  });
});
