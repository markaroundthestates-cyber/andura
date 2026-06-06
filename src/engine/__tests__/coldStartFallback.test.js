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

// ══ CHEST-FLY ISOLATION — must NOT be priced as a chest PRESS ════════════════
// Daniel coach audit 2026-06-06 ("chest fly 10 x 32"): the composer emits
// engineName 'Pec Deck / Cable Fly' (also 'Cable Fly' / 'DB Fly'), but those
// keys were ABSENT from BW_FRACTION + BASE_WEIGHTS (only a DEAD bare 'Pec Deck'
// key existed) so they fell to FALLBACK_MUSCLE_FRACTION['piept'] = 0.50 — the
// chest-PRESS share — and a fly was priced like a bench press (~32-50kg).
// These pin the isolation fraction and that a fly lands clearly BELOW a press.
describe('coldStartGuidelines — chest-fly isolations are NOT priced as presses', () => {
  const PRESS_FALLBACK_FRACTION = 0.5; // FALLBACK_MUSCLE_FRACTION['piept']
  for (const bw of [65, 100]) {
    const press = bw * PRESS_FALLBACK_FRACTION; // what the bug used to apply

    it(`Pec Deck / Cable Fly @ bw ${bw} uses the 0.30 machine-fly fraction, not the 0.50 press share`, () => {
      const fly = suggestStartWeight('Pec Deck / Cable Fly', 'intermediate', { bodyweightKg: bw, sex: 'm' });
      // 0.30 fraction floored at the 20kg fly prior: bw65 -> 20, bw100 -> 30.
      expect(fly).toBe(bw === 65 ? 20 : 30);
      // The old bug applied the 0.50 press share (bw65 -> ~35, bw100 -> ~50).
      expect(fly).toBeLessThan(press);
    });

    it(`Cable Fly @ bw ${bw} uses the 0.18 free-fly fraction, well below the press share`, () => {
      const fly = suggestStartWeight('Cable Fly', 'intermediate', { bodyweightKg: bw, sex: 'm' });
      // 0.18 floored at 12: bw65 -> max(12, 11.7)=12, bw100 -> 18.
      expect(fly).toBe(bw === 65 ? 12 : 18);
      expect(fly).toBeLessThan(press);
    });

    it(`DB Fly @ bw ${bw} (per-hand) uses the 0.18 free-fly fraction, well below the press share`, () => {
      const fly = suggestStartWeight('DB Fly', 'intermediate', { bodyweightKg: bw, sex: 'm' });
      expect(fly).toBe(bw === 65 ? 12 : 18);
      expect(fly).toBeLessThan(press);
    });
  }

  it('chest fly @ bw 65 is no longer the bugged ~32 press value', () => {
    const fly = suggestStartWeight('Pec Deck / Cable Fly', 'intermediate', { bodyweightKg: 65, sex: 'm' });
    expect(fly).toBeLessThanOrEqual(20);
  });
});
