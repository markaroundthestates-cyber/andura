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
import { getPrevWeightGym, getNextWeightGym, getEquipmentType } from '../../config/weights.js';

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

  it('flag OFF → the eased load is NOT forced onto the gym ladder (byte-identical path)', () => {
    seedGym(false);
    const r = DP.checkInSessionAdjust('Cable Row', [10], [9], {
      recKg: 79, recReps: 10, loggedKg: 79, wasManualOverride: true, setIdx: 2, nowMs: NOW,
    });
    expect(r.adjust).toBe(true);
    expect(r.newKg).not.toBe(73);
  });
});
