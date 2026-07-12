// ══ IN-SESSION GYM-LADDER STEPS (dp_gym_ladder_steps_v1) ═════════════════════════
// Daniel live 2026-07-08: Cable Row 79 kg rated greu -> the coach eased to "78 kg",
// a load no real stack has. roundToEquipmentWeight already snaps the COMPOSE-path rec
// onto the active gym's measured rungs, but dp.checkInSessionAdjust stepped its
// ease-back / manual-override loads with the GENERIC getPrev/NextWeight (the fine
// learned/generic ladder) — bypassing that choke-point. The flag rebinds those
// in-session steps onto getPrev/NextWeightGym = the active "Sala mea" ladder, so an
// adjusted set lands on a REAL rung. Flag OFF / no active gym -> the Gym steppers
// delegate to the generic ones -> byte-identical.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

import { DP } from '../dp.js';
import { getPrevWeightGym, getNextWeightGym, getEquipmentType, roundToEquipmentWeight } from '../../config/weights.js';

const NOW = new Date(2026, 6, 8, 12, 0, 0).getTime();
// His measured row ladder (~7 kg steps): 66 + 73 are BOTH real rungs from the log.
const ROW = [45, 52, 59, 66, 73, 80];

function seedGym(flagOn) {
  store = {};
  const eqType = getEquipmentType('Cable Row');
  store['dp-gyms'] = { activeId: 'g1', gyms: { g1: { id: 'g1', name: 'MyGym', stacks: { [eqType]: ROW } } } };
  store['logs'] = [{ ex: 'Cable Row', w: 66, reps: '10', rpe: 7.5, ts: NOW - 86400000, session: NOW - 86400000 }];
  localStorage.setItem('_devFlags', JSON.stringify({ dp_gym_ladder_steps_v1: flagOn }));
}

beforeEach(() => { localStorage.clear(); store = {}; });
afterEach(() => { try { localStorage.removeItem('_devFlags'); } catch { /* jsdom */ } });

describe('getPrev/NextWeightGym — active-gym ladder stepping', () => {
  it('flag ON + active gym → steps on the real rungs', () => {
    seedGym(true);
    expect(getPrevWeightGym(79, 'Cable Row')).toBe(73); // largest rung < 79 (NOT 78)
    expect(getPrevWeightGym(86, 'Cable Row')).toBe(80); // above top → the top rung
    expect(getNextWeightGym(66, 'Cable Row')).toBe(73); // next rung up (real step, no stall)
    expect(getPrevWeightGym(45, 'Cable Row')).toBe(45); // at the floor → hold the floor
  });

  it('flag OFF → delegates to the generic stepper (byte-identical)', () => {
    seedGym(false);
    // Generic bailib_stack step (NOT the gym ladder): proves the gym ladder is inert.
    expect(getPrevWeightGym(79, 'Cable Row')).not.toBe(73);
  });

  it('no active gym → generic stepper even with the flag on', () => {
    store = {};
    localStorage.setItem('_devFlags', JSON.stringify({ dp_gym_ladder_steps_v1: true }));
    expect(getPrevWeightGym(79, 'Cable Row')).not.toBe(73);
  });
});

describe('checkInSessionAdjust — in-session ease lands on a real gym rung', () => {
  it('79 rated greu → eases to a real rung (73), not the off-stack 78 (flag ON)', () => {
    seedGym(true);
    const r = DP.checkInSessionAdjust('Cable Row', [10], [9], {
      recKg: 79, recReps: 10, loggedKg: 79, wasManualOverride: true, setIdx: 2, nowMs: NOW,
    });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newKg).toBe(73);
    expect(ROW).toContain(r.newKg); // guarantee: a REAL rung
  });

  it('manual override 86 (>> rec 66) rated greu → real rung 80 (flag ON)', () => {
    seedGym(true);
    const r = DP.checkInSessionAdjust('Cable Row', [10], [8], {
      recKg: 66, recReps: 10, loggedKg: 86, wasManualOverride: true, setIdx: 1, nowMs: NOW,
    });
    expect(r.adjust).toBe(true);
    expect(ROW).toContain(r.newKg);
  });

  // Live 07-10 (founder account runs phase-override STRENGTH): the STRENGTH greu
  // branch eased from the REC (prevGym(73)=66), ignoring the heavier LOGGED 79 —
  // the G1 ease-from-logged fix had only covered the hypertrophy branch. With G1
  // parity the strength ease anchors on max(rec, logged) → 79 greu eases to 73.
  it('STRENGTH phase: 79 logged greu over rec 73 → eases to 73 (from logged), not 66 (from rec)', () => {
    seedGym(true);
    store['phase-override'] = 'STRENGTH';
    const r = DP.checkInSessionAdjust('Cable Row', [7.5, 10], [10, 8], {
      recKg: 73, recReps: 8, loggedKg: 79, wasManualOverride: true, setIdx: 2, nowMs: NOW,
    });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newKg).toBe(73);
  });

  it('STRENGTH phase legacy (G1 flag OFF) → eases from the rec (66) — frozen legacy', () => {
    seedGym(true);
    store['phase-override'] = 'STRENGTH';
    localStorage.setItem('_devFlags', JSON.stringify({ dp_gym_ladder_steps_v1: true, dp_greu_ease_from_logged_v1: false }));
    const r = DP.checkInSessionAdjust('Cable Row', [7.5, 10], [10, 8], {
      recKg: 73, recReps: 8, loggedKg: 79, wasManualOverride: true, setIdx: 2, nowMs: NOW,
    });
    expect(r.newKg).toBe(66);
  });

  it('flag OFF → the eased load is NOT forced onto the gym ladder (byte-identical path)', () => {
    seedGym(false);
    const r = DP.checkInSessionAdjust('Cable Row', [10], [9], {
      recKg: 79, recReps: 10, loggedKg: 79, wasManualOverride: true, setIdx: 2, nowMs: NOW,
    });
    expect(r.adjust).toBe(true);
    expect(r.newKg).not.toBe(73);
  });
});

// ── FOUNDER-STACK ABOVE-TOP ESCAPE (dp_gym_retires_founder_stacks_v1) ──────────
// Live 07-12: the founder's OLD-gym Leg Curl stack tops at 66, so at the NEW gym
// every rec got nearest-rung CLAMPED to 66 while the demonstrated load was 100.
// With an ACTIVE "Sala mea" gym, a weight ABOVE the old stack's top escapes to the
// generic ladder (the old top is where that machine ended, not a capacity ceiling);
// BELOW the top the founder rung spacing stays authoritative (no regressions).
describe('founder-stack above-top escape (active gym)', () => {
  it('active gym + weight above the old top → generic ladder (100 stays 100, not 66)', () => {
    seedGym(true); // any active gym (bailib measured); Leg Curl station unmeasured
    expect(roundToEquipmentWeight(100, 'Leg Curl')).toBe(100); // generic leg_machine rung
  });

  it('active gym + weight INSIDE the old stack → founder rung kept (no regression)', () => {
    seedGym(true);
    expect(roundToEquipmentWeight(50, 'Leg Curl')).toBe(48); // founder rung 48, not generic 50
  });

  it('no active gym → the old clamp behavior stands (byte-identical legacy)', () => {
    store = {};
    expect(roundToEquipmentWeight(100, 'Leg Curl')).toBe(66); // clamped to the old top
  });

  it('flag OFF → clamp even with an active gym (byte-identical legacy)', () => {
    seedGym(true);
    localStorage.setItem('_devFlags', JSON.stringify({ dp_gym_retires_founder_stacks_v1: false }));
    expect(roundToEquipmentWeight(100, 'Leg Curl')).toBe(66);
  });
});
