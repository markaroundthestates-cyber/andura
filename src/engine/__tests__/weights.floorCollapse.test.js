// ══ F-1 / F-1b REGRESSION — getPrevWeight floor-collapse + heavy-compound map ══
//
// Audit 2026-06-07 (_AUDIT_STRESS / _AUDIT_ENGINE): getPrevWeight() returned the
// ladder FLOOR for any load above the ladder top (findIndex(w>=current) === -1 →
// idx<=0 → list[0]). A 140kg squat rated hard eased to 5kg; a 360kg leg-press
// return-deload cratered to 20kg; a 60kg DB press to 7kg. Two compounding causes:
//   (F-1b) the missing above-top branch in getPrevWeight, and
//   (F-1)  ~55 active CORE_AUTO heavy compounds UNMAPPED → bailib_stack (top 80).
//
// These tests use REAL production loads (per the project test-real-values rule),
// not round comfort numbers, across the down / deload / return / in-session paths.

import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  getPrevWeight,
  getEquipmentType,
  EQUIPMENT_WEIGHTS,
} from '../../config/weights.js';

// ── 1. UNIT — getPrevWeight above the ladder top steps DOWN, never the floor ───

describe('getPrevWeight above-ladder-top (F-1b)', () => {
  /** Floor of an exercise's equipment ladder. */
  function floorOf(ex) {
    const list = EQUIPMENT_WEIGHTS[getEquipmentType(ex)] || [];
    return list[0];
  }

  it('a heavy squat above its ladder steps one rung down, NOT to 5kg floor', () => {
    // Barbell Back Squat (High Bar) → barbell_heavy (floor 20). 140kg IS on the
    // ladder now (mapped), so prev = the adjacent lower rung 130 — sane one step.
    const prev = getPrevWeight(140, 'Barbell Back Squat (High Bar)');
    expect(prev).toBe(130);
    expect(prev).not.toBe(floorOf('Barbell Back Squat (High Bar)')); // not 20
    expect(prev).toBeGreaterThan(120);
  });

  it('a load ABOVE the ladder top steps one increment below the load (not floor)', () => {
    // Leg Press ladder (leg_press_plates) tops at 320; a 360kg log exceeds it →
    // step one top-increment (20) below the LOGGED load = 340, never the 20 floor.
    const prev = getPrevWeight(360, 'Leg Press');
    expect(prev).toBe(340);
    expect(prev).not.toBe(20); // the old floor-collapse value
    expect(prev).toBeLessThan(360); // strictly below current
  });

  it('a mapped dumbbell press above its top eases one step, not to 7kg', () => {
    // Flat DB Press → dumbbell (floor 7, top 50). 60kg exceeds the top → 60-2.5.
    const prev = getPrevWeight(60, 'Flat DB Press');
    expect(prev).toBe(57.5);
    expect(prev).not.toBe(7); // the old dumbbell floor-collapse
    expect(prev).toBeLessThan(60);
  });

  it('on-ladder getPrevWeight is unchanged (no regression below the top)', () => {
    expect(getPrevWeight(60, 'Lat Pulldown')).toBe(55); // bailib_stack rung below
    expect(getPrevWeight(50, 'Leg Press')).toBe(40);    // leg_press rung below
    expect(getPrevWeight(20, 'DB Lateral Raise')).toBe(18); // light_iso_db
  });
});

// ── 2. MAPPING — every previously-unmapped heavy compound has a real ladder ────

describe('heavy CORE_AUTO compounds are mapped to real ladders (F-1)', () => {
  const cases = [
    ['Barbell Back Squat (High Bar)', 'barbell_heavy', 360],
    ['Trap Bar Deadlift', 'barbell_heavy', 360],
    ['Hip Thrust', 'barbell_heavy', 360],
    ['Front Squat', 'barbell_heavy', 360],
    ['OHP', 'barbell_plates', 250],
    ['Barbell Row', 'barbell_plates', 250],
    ['Pendlay Row', 'barbell_plates', 250],
    ['Hack Squat Machine', 'leg_machine_heavy', 400],
    ['Pendulum Squat', 'leg_machine_heavy', 400],
    ['Smith Hip Thrust', 'leg_machine_heavy', 400],
    ['Hammer Strength Row', 'machine_plates', 250],
    ['T-Bar Row Machine', 'machine_plates', 250],
    ['Standing Calf Raise Machine', 'calf_machine', 250],
    ['Seated Leg Curl', 'leg_machine', 160],
  ];
  it.each(cases)('%s → %s (top %d, well above a real working load)', (ex, equip, top) => {
    expect(getEquipmentType(ex)).toBe(equip);
    const ladder = EQUIPMENT_WEIGHTS[equip];
    expect(ladder[ladder.length - 1]).toBe(top);
    expect(getEquipmentType(ex)).not.toBe('bailib_stack'); // no longer the 80-top default
  });

  it('a now-mapped compound rounds a heavy load onto its real ladder (not floor)', () => {
    // 140kg trap-bar deadlift is a real rung on barbell_heavy; getPrevWeight of a
    // 200kg log lands on 190, not the bailib 5kg floor it used to crater to.
    expect(getPrevWeight(200, 'Trap Bar Deadlift')).toBe(190);
  });
});

// ── 3. PIPELINE — the real recommend / return-deload / in-session down paths ──
// DB mocked with a mutable store (mirrors dp.returnDeload.test.js).

/** @type {Record<string, any>} */
let store = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn((key) => (key in store ? store[key] : null)),
    set: vi.fn((key, val) => { store[key] = val; }),
  },
  tod: () => new Date().toISOString().slice(0, 10),
  cleanEx: (/** @type {string} */ s) => s.replace(/ pump$/, '').trim(),
}));

const DAY = 24 * 3600 * 1000;
const NOW = new Date(2026, 5, 1, 12, 0, 0).getTime();

describe('production deload/return/in-session no longer crater heavy compounds', () => {
  /** @type {any} */
  let DP;
  beforeEach(async () => {
    store = {};
    store['phase-override'] = 'BULK'; // deterministic, avoids the CUT date branch
    ({ DP } = await import('../dp.js'));
  });

  it('squat 140kg sustained-hard SCALE/EASE BACK → ~130kg, never 5kg', () => {
    const EX = 'Barbell Back Squat (High Bar)';
    // Sustained greu with reps short of target → distress / ease-back path.
    store['logs'] = [
      { ex: EX, w: 140, reps: 4, rpe: 8.5, ts: NOW - 0 * DAY },
      { ex: EX, w: 140, reps: 4, rpe: 8.5, ts: NOW - 2 * DAY },
      { ex: EX, w: 140, reps: 4, rpe: 8.5, ts: NOW - 4 * DAY },
    ];
    const rec = DP.getSmartRecommendation(EX, null, null, NOW, 'grea', []);
    expect(rec.kg).toBeGreaterThan(100); // sane deload, NOT the 5kg crater
    expect(rec.kg).toBeLessThanOrEqual(140);
    expect(rec.kg).not.toBe(5);
  });

  it('leg-press 360kg 6-week return-deload → a fraction of 360, never 20kg', () => {
    const EX = 'Leg Press';
    store['logs'] = [
      { ex: EX, w: 360, reps: 10, rpe: 7.5, ts: NOW - 45 * DAY },
      { ex: EX, w: 360, reps: 10, rpe: 7.5, ts: NOW - 47 * DAY },
      { ex: EX, w: 360, reps: 10, rpe: 7.5, ts: NOW - 49 * DAY },
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBeGreaterThan(180); // a real deload fraction of 360
    expect(rec.kg).toBeLessThan(360);    // genuinely lighter than pre-gap
    expect(rec.kg).not.toBe(20);         // the old leg_press_plates floor-collapse
  });

  it('DB press 60kg sustained-hard down path → eased, never the 7kg floor', () => {
    const EX = 'Flat DB Press';
    store['logs'] = [
      { ex: EX, w: 60, reps: 4, rpe: 8.5, ts: NOW - 0 * DAY },
      { ex: EX, w: 60, reps: 4, rpe: 8.5, ts: NOW - 2 * DAY },
      { ex: EX, w: 60, reps: 4, rpe: 8.5, ts: NOW - 4 * DAY },
    ];
    const rec = DP.getSmartRecommendation(EX, null, null, NOW, 'grea', []);
    expect(rec.kg).toBeGreaterThan(40); // snapped onto the dumbbell ladder near the top
    expect(rec.kg).not.toBe(7);          // the old dumbbell floor-collapse
  });

  it('in-session single very-hard set on a heavy squat eases sanely, not to floor', () => {
    const EX = 'Barbell Back Squat (High Bar)';
    store['logs'] = [{ ex: EX, w: 140, reps: 10, rpe: 7.5, ts: NOW }];
    const adj = DP.checkInSessionAdjust(EX, [10], [8], {
      recKg: 140, recReps: 8, loggedKg: 140, setIdx: 1, nowMs: NOW,
    });
    if (adj && adj.adjust && typeof adj.newKg === 'number') {
      expect(adj.newKg).toBeGreaterThan(100); // one sane step down from 140
      expect(adj.newKg).not.toBe(5);
    }
  });
});
