// ══ REAL MACHINE-STACK SNAP — founder live gym session 2026-06-12 ════════════════
// (_LADDER_SNAP_2026-06-12.md.) The recommended weight must snap to a rung the
// founder's PIN machines actually have. The dumbbell/cable ladders already snap fine;
// these tests lock the pin-MACHINE stations (Cable Row / Reverse Pec Deck / Shoulder
// Press machine / Smith OHP / Pec Deck / Leg Curl) onto his MEASURED step-6 stacks,
// using the REAL off-grid values from his debug log, and prove the flag-OFF path is
// byte-identical (the generic rounder result unchanged).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveRealStack, REAL_STACKS } from '../dp/realMachineStacks.js';
import { roundToEquipmentWeight } from '../../config/weights.js';
import * as flags from '../../util/featureFlags.js';

const forceFlag = (on) =>
  vi.spyOn(flags, 'isEnabled').mockImplementation((id) =>
    id === 'dp_real_ladder_snap_v1' ? on : false,
  );

describe('resolveRealStack — explicit founder stations', () => {
  it('maps Cable Row to the row stack (6..90)', () => {
    expect(resolveRealStack('Cable Row')).toBe(REAL_STACKS.ROW_STACK);
  });
  it('maps Reverse Pec Deck + Pec Deck to the pec-deck stack (6..96)', () => {
    expect(resolveRealStack('Reverse Pec Deck')).toBe(REAL_STACKS.PEC_DECK_STACK);
    expect(resolveRealStack('Pec Deck / Cable Fly')).toBe(REAL_STACKS.PEC_DECK_STACK);
  });
  it('maps Machine Shoulder Press + Smith OHP to the shoulder stack (6..96)', () => {
    expect(resolveRealStack('Machine Shoulder Press')).toBe(REAL_STACKS.SHOULDER_STACK);
    expect(resolveRealStack('Smith OHP')).toBe(REAL_STACKS.SHOULDER_STACK);
  });
  it('maps the Leg Curl family to the leg-curl stack (6..66)', () => {
    expect(resolveRealStack('Leg Curl')).toBe(REAL_STACKS.LEG_CURL_STACK);
    expect(resolveRealStack('Seated Leg Curl')).toBe(REAL_STACKS.LEG_CURL_STACK);
    expect(resolveRealStack('Standing Leg Curl')).toBe(REAL_STACKS.LEG_CURL_STACK);
  });
  it('the four measured stacks are exactly the founder-reported rungs', () => {
    expect([...REAL_STACKS.ROW_STACK]).toEqual([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90]);
    expect([...REAL_STACKS.PEC_DECK_STACK]).toEqual([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96]);
    expect([...REAL_STACKS.SHOULDER_STACK]).toEqual([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96]);
    expect([...REAL_STACKS.LEG_CURL_STACK]).toEqual([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66]);
  });
});

describe('resolveRealStack — only the confirmed stations snap (no blind fallback)', () => {
  it('returns null for an unmapped machine (Leg Press is plate-loaded → keep its ladder)', () => {
    // Leg Press is eq=machine but NOT a founder-measured pin stack (it is plate-
    // loaded). No blind step-6 fallback → null → keeps its existing leg_press ladder.
    expect(resolveRealStack('Leg Press')).toBeNull();
    expect(resolveRealStack('Leg Extension')).toBeNull();
    expect(resolveRealStack('Smith Machine Bench')).toBeNull();
  });
  it('returns null for non-machine equipment (dumbbell/cable/barbell/bodyweight)', () => {
    expect(resolveRealStack('Incline DB Press')).toBeNull();
    expect(resolveRealStack('Cable Fly')).toBeNull();
    expect(resolveRealStack('Flat Barbell Bench')).toBeNull();
    expect(resolveRealStack('Pull-up')).toBeNull();
  });
  it('returns null for an unknown / bad name (defensive, never throws)', () => {
    expect(resolveRealStack('Totally Unknown Lift')).toBeNull();
    expect(resolveRealStack('')).toBeNull();
    expect(resolveRealStack(undefined)).toBeNull();
    expect(resolveRealStack(42)).toBeNull();
  });
});

describe('roundToEquipmentWeight — FLAG ON snaps the rec onto the real stack', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Cable Row off-grid recs snap to the real row stack (nearest rung)', () => {
    forceFlag(true);
    // The founder-reported off-grid recs from his debug log → nearest real rung.
    expect(roundToEquipmentWeight(75, 'Cable Row')).toBe(72);
    expect(roundToEquipmentWeight(73, 'Cable Row')).toBe(72);
    expect(roundToEquipmentWeight(70, 'Cable Row')).toBe(72); // 70 → 72 (dist 2 < 4 to 66)
    expect(roundToEquipmentWeight(77, 'Cable Row')).toBe(78);
  });

  it('Reverse Pec Deck 22.5 snaps to 24 (he hand-corrected this)', () => {
    forceFlag(true);
    expect(roundToEquipmentWeight(22.5, 'Reverse Pec Deck')).toBe(24);
  });

  it('a tie rounds DOWN for safety (the lighter rung)', () => {
    forceFlag(true);
    // 21 is exactly between 18 and 24 on the pec-deck stack → round DOWN to 18.
    expect(roundToEquipmentWeight(21, 'Reverse Pec Deck')).toBe(18);
    // 69 is exactly between 66 and 72 on the row stack → round DOWN to 66.
    expect(roundToEquipmentWeight(69, 'Cable Row')).toBe(66);
  });

  it('Leg Curl above its short stack snaps to the top real rung (66)', () => {
    forceFlag(true);
    expect(roundToEquipmentWeight(70, 'Leg Curl')).toBe(66);
    expect(roundToEquipmentWeight(40, 'Leg Curl')).toBe(42); // 40 → nearest 42 (dist 2 < 4 to 36)
  });

  it('Shoulder Press machine + Smith OHP snap to the shoulder stack', () => {
    forceFlag(true);
    expect(roundToEquipmentWeight(55, 'Smith OHP')).toBe(54);
    expect(roundToEquipmentWeight(50, 'Machine Shoulder Press')).toBe(48);
  });

  it('does NOT touch dumbbell/cable recs (their ladders already snap correctly)', () => {
    forceFlag(true);
    // Incline DB Press → dumbbell ladder; 30/25/22.5 already exist → unchanged.
    expect(roundToEquipmentWeight(30, 'Incline DB Press')).toBe(30);
    expect(roundToEquipmentWeight(22.5, 'Incline DB Press')).toBe(22.5);
    // Cable Fly (matrix_cable) — 18 already a rung.
    expect(roundToEquipmentWeight(18, 'Cable Fly')).toBe(18);
  });
});

describe('roundToEquipmentWeight — FLAG OFF is byte-identical (the generic rounder)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('flag OFF → Cable Row returns the legacy bailib_stack rung, NOT the real stack', () => {
    forceFlag(false);
    // bailib_stack = [5,10,15..80] → 75 is an exact legacy rung. With the real-stack
    // snap OFF the result must be the legacy 75 (NOT 72), proving zero leak.
    expect(roundToEquipmentWeight(75, 'Cable Row')).toBe(75);
    expect(roundToEquipmentWeight(73, 'Cable Row')).toBe(75); // legacy nearest of [70,75]
  });

  it('flag OFF → Reverse Pec Deck returns the legacy light_iso_cable rung (22.5 exists)', () => {
    forceFlag(false);
    expect(roundToEquipmentWeight(22.5, 'Reverse Pec Deck')).toBe(22.5);
  });
});
