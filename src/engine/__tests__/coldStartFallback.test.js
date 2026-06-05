// ══ COLD-START FALLBACK — metadata-aware start weights (Daniel audit 2026-06-05)
// Compound movements outside the explicit BW_FRACTION/BASE_WEIGHTS table used to
// fall to the isolation default (0.12 / 10kg), so a heavy user was offered e.g.
// Romanian Deadlift @ 9kg. The fallback now derives a conservative fraction from
// muscle_target_primary × equipment_type. These tests pin the REAL outputs so a
// regression back to the floor fails loudly.

import { describe, it, expect } from 'vitest';
import { suggestStartWeight } from '../coldStartGuidelines.js';

const HEAVY = { bodyweightKg: 108, sex: 'm' };

describe('coldStartGuidelines — metadata-aware fallback for unlisted compounds', () => {
  it('Romanian Deadlift (hamstrings/barbell) starts like a compound, not the floor', () => {
    const w = suggestStartWeight('Romanian Deadlift', 'intermediate', HEAVY);
    // Old behaviour: ~13kg (0.12 default). New: hamstrings 0.60 × barbell 0.85 ×
    // 108 ≈ 55kg. Assert a sensible compound band (never the ~9-13 floor again).
    expect(w).toBeGreaterThanOrEqual(40);
    expect(w).toBeLessThanOrEqual(80);
  });

  it('Hip Thrust (glutes/barbell) starts heavy (it is a strong hip movement)', () => {
    const w = suggestStartWeight('Hip Thrust', 'intermediate', HEAVY);
    expect(w).toBeGreaterThanOrEqual(45);
    expect(w).toBeLessThanOrEqual(90);
  });

  it('Bulgarian Split Squat (quads/dumbbell, per-hand) is damped vs a barbell lift', () => {
    const w = suggestStartWeight('Bulgarian Split Squat', 'intermediate', HEAVY);
    // quads 0.70 × dumbbell 0.40 × 108 ≈ 30kg per hand — plausible, far above 10.
    expect(w).toBeGreaterThanOrEqual(18);
    expect(w).toBeLessThanOrEqual(45);
  });

  it('an explicit-table lift (Lat Pulldown) is UNCHANGED by the fallback', () => {
    // 0.62 × 108 = 67 (explicit path, not the fallback).
    expect(suggestStartWeight('Lat Pulldown', 'intermediate', HEAVY)).toBe(67);
  });

  it('an unknown-metadata movement still resolves to the conservative isolation default', () => {
    // No metadata → BW_FRACTION_DEFAULT (0.12); floored at the flat prior.
    const w = suggestStartWeight('__totally_unknown_movement__', 'intermediate', HEAVY);
    expect(w).toBeLessThanOrEqual(15);
    expect(w).toBeGreaterThan(0);
  });

  it('no-bodyweight flat path also lifts unlisted compounds off the 10kg floor', () => {
    // Romanian Deadlift flat = 0.51 fraction × 70 ref ≈ 36kg (was 10).
    const flat = suggestStartWeight('Romanian Deadlift', 'intermediate');
    expect(flat).toBeGreaterThanOrEqual(25);
  });
});
