// ══ COLD-START FALLBACK — metadata-aware start weights (Daniel audit 2026-06-05)
// Compound movements outside the explicit BW_FRACTION/BASE_WEIGHTS table used to
// fall to the isolation default (0.12 / 10kg), so a heavy user was offered e.g.
// Romanian Deadlift @ 9kg. The fallback now derives a conservative fraction from
// muscle_target_primary × equipment_type. These tests pin the REAL outputs so a
// regression back to the floor fails loudly.

import { describe, it, expect } from 'vitest';
import { suggestStartWeight } from '../coldStartGuidelines.js';
import { roundToEquipmentWeight, getEquipmentType } from '../../config/weights.js';

const HEAVY = { bodyweightKg: 108, sex: 'm' };

describe('coldStartGuidelines — metadata-aware fallback for unlisted compounds', () => {
  it('Romanian Deadlift (hamstrings/barbell) starts like a compound, not the floor', () => {
    const w = suggestStartWeight('Romanian Deadlift', 'intermediate', HEAVY);
    // Old behaviour: ~13kg (0.12 default), then ~55kg (fallback). Now an EXPLICIT
    // 0.80 fraction (Gigel sim Target 4 — RDL was -45% to -75% of true): 0.80 × 108
    // ≈ 86kg. Assert a sensible heavy-compound band (never the ~9-13 floor again).
    expect(w).toBeGreaterThanOrEqual(60);
    expect(w).toBeLessThanOrEqual(110);
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

  it('an explicit-table lift (Lat Pulldown) uses the explicit fraction (Target 4 raised 0.62 -> 0.72)', () => {
    // 0.72 × 108 = 78 (explicit path, not the fallback). Raised from 0.62 (was 67)
    // per the Gigel sim Target 4 (cable compounds seeded too low).
    expect(suggestStartWeight('Lat Pulldown', 'intermediate', HEAVY)).toBe(78);
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

// ══ TINY ISOLATIONS — cold-start floor must match reality, not the 18kg machine
// stack (Gigel sim 2026-06-06, Target 3) ════════════════════════════════════════
// The CORE_AUTO names the composer emits (DB/Cable/Machine Rear Delt Fly + Lateral
// Raise, Reverse Pec Deck) were UNMAPPED in EXERCISE_EQUIPMENT_MAP → snapped on the
// bailib_stack default (5kg floor, coarse 5kg steps); the sim's legacy 'Rear Delt
// Fly' snapped on the 18kg pec_deck floor (+40% to +400% overshoot, movement wasted
// 24-48 sessions). They now route to light DB / fine-cable ladders so the (already
// low 0.06) fraction lands at a realistic ~3-6kg, never floored at 18.
describe('cold-start tiny isolations snap to a realistic light floor (<= ~6kg, not 18)', () => {
  const TINY_DB = ['DB Rear Delt Fly', 'DB Lateral Raise', 'Leaning Lateral Raise'];
  const TINY_CABLE = ['Cable Rear Delt Fly', 'Cable Lateral Raise', 'Machine Lateral Raise', 'Reverse Pec Deck'];

  it('the tiny rear-delt / lateral isolations route to a light ladder, not pec_deck/bailib', () => {
    for (const ex of TINY_DB) expect(getEquipmentType(ex)).toBe('light_iso_db');
    for (const ex of TINY_CABLE) expect(getEquipmentType(ex)).toBe('light_iso_cable');
  });

  it('a snapped free rear-delt-fly cold-start lands light (<= 6kg), never the 18kg machine floor', () => {
    // The free DB / cable fly (true ~3-6kg) must land light. The machine Reverse Pec
    // Deck legitimately uses a stack (heavier), so it is asserted separately below.
    for (const ex of ['DB Rear Delt Fly', 'Cable Rear Delt Fly']) {
      const raw = suggestStartWeight(ex, 'intermediate', { bodyweightKg: 80, sex: 'm' });
      const snapped = roundToEquipmentWeight(raw, ex);
      expect(snapped).toBeLessThanOrEqual(6); // was 18 (pec_deck floor) → +200% overshoot
      expect(snapped).toBeGreaterThan(0);
    }
  });

  it('the bare canonical Rear Delt Fly cold-start lands light (<= ~6kg), not the 18kg pec_deck floor', () => {
    // The ANCHOR_NAME / library-key 'Rear Delt Fly' (still emitted for users with PR
    // history, and driven by the diary cohort) routed to pec_deck → its 5kg prior was
    // re-floored to the 18kg minimum plate (frozen +0.745 cold-start bias, Gigel sim
    // 2026-06-06 Target 3). It now rounds on the light DB ladder.
    expect(getEquipmentType('Rear Delt Fly')).toBe('light_iso_db');
    const raw = suggestStartWeight('Rear Delt Fly', 'intermediate', { bodyweightKg: 80, sex: 'm' });
    const snapped = roundToEquipmentWeight(raw, 'Rear Delt Fly');
    expect(snapped).toBeLessThanOrEqual(6); // was 18 → ~+260% overshoot at true ~5kg
    expect(snapped).toBeGreaterThan(0);
  });

  it('machine PRESSES are unchanged by the rear-delt re-route (floors intact)', () => {
    // Guard: the Part-A fix must not lower any machine PRESS floor.
    const MID = { bodyweightKg: 84, sex: 'm' };
    // chest fly machine keeps its pec_deck stack (legitimately heavier than a fly DB)
    expect(getEquipmentType('Pec Deck / Cable Fly')).toBe('pec_deck');
    // presses keep their stacks and seed well above the tiny-isolation floor
    expect(suggestStartWeight('DB Shoulder Press', 'intermediate', MID)).toBeGreaterThanOrEqual(10);
    expect(suggestStartWeight('Incline DB Press', 'intermediate', MID)).toBeGreaterThanOrEqual(15);
    expect(suggestStartWeight('Leg Press', 'intermediate', MID)).toBeGreaterThanOrEqual(120);
  });

  it('the machine Reverse Pec Deck is no longer floored at the 18kg stack', () => {
    const raw = suggestStartWeight('Reverse Pec Deck', 'intermediate', { bodyweightKg: 80, sex: 'm' });
    const snapped = roundToEquipmentWeight(raw, 'Reverse Pec Deck');
    // Machine selector (heavier than a free fly) but well under the old 18kg floor.
    expect(snapped).toBeLessThan(18);
    expect(snapped).toBeGreaterThan(0);
  });

  it('even a HEAVY user (108kg) keeps the rear-delt fly tiny (the 0.06 fraction holds)', () => {
    const raw = suggestStartWeight('DB Rear Delt Fly', 'intermediate', HEAVY);
    expect(roundToEquipmentWeight(raw, 'DB Rear Delt Fly')).toBeLessThanOrEqual(10);
  });

  it('the light ladder snaps a ~3.5kg target to a real fine step, not up to 5/18', () => {
    expect(roundToEquipmentWeight(3.5, 'DB Rear Delt Fly')).toBeLessThanOrEqual(4);
    expect(roundToEquipmentWeight(3.5, 'Cable Rear Delt Fly')).toBeLessThanOrEqual(5);
  });
});

// ══ CABLE / BARBELL COMPOUND cold-starts raised (Gigel sim Target 4) ══════════
// barbell mean signed-err was -0.59, cable -0.30; the first session opened these
// compounds 33-75% below true. The fractions are raised so the FIRST prescription
// is realistic (Target 1's re-anchor then absorbs any remaining gap from session 2).
describe('cold-start cable/barbell compounds are no longer seeded absurdly low (Target 4)', () => {
  const MID = { bodyweightKg: 85, sex: 'm' }; // a typical intermediate male

  it('Romanian Deadlift opens like a real hinge (>= ~60kg @ 85kg bw), not the old ~43', () => {
    const w = suggestStartWeight('Romanian Deadlift', 'intermediate', MID);
    expect(w).toBeGreaterThanOrEqual(60); // 0.80 × 85 = 68 (was ~0.51 -> ~43)
  });

  it('Lat Pulldown / Cable Row open at the raised 0.72 fraction, not 0.62', () => {
    expect(suggestStartWeight('Lat Pulldown', 'intermediate', MID)).toBeGreaterThanOrEqual(58); // 0.72×85≈61
    expect(suggestStartWeight('Cable Row', 'intermediate', MID)).toBeGreaterThanOrEqual(58);
  });

  it('Face Pull (canonical CORE_AUTO name) is no longer the ~0.11 umeri-iso fallback', () => {
    // Was: umeri-iso 0.16 × cable 0.70 ≈ 0.11 (≈9kg). Now explicit 0.16 (≈14kg).
    const w = suggestStartWeight('Face Pull', 'intermediate', MID);
    expect(w).toBeGreaterThanOrEqual(11);
  });

  it('Leg Press opens heavier (1.9 fraction) so an advanced lifter is not at -40%', () => {
    const w = suggestStartWeight('Leg Press', 'intermediate', { bodyweightKg: 90, sex: 'm' });
    expect(w).toBeGreaterThanOrEqual(150); // 1.9 × 90 = 171 (was 1.6 -> 144)
  });

  it('still SANE: none of the raised compounds overshoot wildly for a light user', () => {
    const LIGHT = { bodyweightKg: 60, sex: 'f' };
    // female factor 0.78 keeps a light beginner from an aggressive start.
    expect(suggestStartWeight('Romanian Deadlift', 'beginner', LIGHT)).toBeLessThanOrEqual(45);
    expect(suggestStartWeight('Lat Pulldown', 'beginner', LIGHT)).toBeLessThanOrEqual(45);
  });
});

// ══ LEG PRESS = the 45deg SLED, globally (Daniel SSOT 2026-06-06) ════════════
// The canonical `Leg Press` the engine anchors/offers IS the 45deg incline/sled
// (most commercial gyms have the sled — it loads MORE than a horizontal press).
// Its 1.9 cold-start fraction reflects the higher sled load; the lower-load
// `Horizontal Leg Press` is the selectable alternative and must price BELOW it
// for the same lifter. PR history keyed on `Leg Press` is untouched (the emitted
// name did not change — only its identity/RO label/equipment-alternatives), so
// no existing logs are stranded.
describe('the default Leg Press is the 45deg sled (loads higher than horizontal)', () => {
  it('the 45deg sled (canonical `Leg Press`) opens HIGHER than the `Horizontal Leg Press`', () => {
    const MID = { bodyweightKg: 90, sex: 'm' };
    const sled = suggestStartWeight('Leg Press', 'intermediate', MID);              // 1.9 fraction
    const horizontal = suggestStartWeight('Horizontal Leg Press', 'intermediate', MID); // 0.70 fallback
    expect(sled).toBeGreaterThan(horizontal);
    expect(sled).toBeGreaterThanOrEqual(150); // 1.9 × 90 = 171 — a real 45deg sled number
  });

  it('a light beginner female stays sane on the 45deg sled (not absurd)', () => {
    // 60kg f beginner: 60 × 1.9 × 0.78 (female) × 0.7 (beginner) ≈ 62kg — a
    // reasonable first sled prescription (carriage + plates), the first set recalibrates.
    const w = suggestStartWeight('Leg Press', 'beginner', { bodyweightKg: 60, sex: 'f' });
    expect(w).toBeGreaterThanOrEqual(50);
    expect(w).toBeLessThanOrEqual(90);
  });

  it('a strong male is not absurd on the 45deg sled', () => {
    // 100kg advanced male: 100 × 1.9 × 1.3 = 247kg — heavy but real for a sled at
    // advanced training age (RIR on the first set trims any overshoot).
    const w = suggestStartWeight('Leg Press', 'advanced', { bodyweightKg: 100, sex: 'm' });
    expect(w).toBeLessThanOrEqual(260);
    expect(w).toBeGreaterThanOrEqual(180);
  });
});
