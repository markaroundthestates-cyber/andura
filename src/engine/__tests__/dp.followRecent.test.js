// ══ Founder live 2026-10-01 — "nu tine cont de cat pot si imi face push in deficit"
// The founder's REAL September sets (account dump 2026-10-01, 1000 kcal cut, 148 →
// 88 kg bodyweight). Each block pins one flag ON vs OFF on the exact data that
// produced the complaint, so the OFF arm documents the bug and the ON arm the fix.
//   dp_recent_capacity_floor_v1 + dp_reps_follow_recent_v1 — Cable Row 73x10 rec
//   dp_cut_restraint_energy_v1  — Machine Shoulder Press 61-65 vs his 60
//   dp_cap_yields_to_repeated_v1 — Reverse Pec Deck clamped to the 45 kg cap
//   dp_corridor_forta_only_v1   — hypertrophy goal read as forta on isolation lifts

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';

const P = 7.5; // potrivit
const G = 8.5; // greu
const at = (m, d, h = 9) => Date.UTC(2026, m - 1, d, h, 0, 0);
const NOW = at(10, 1, 6);

const flags = (o) => localStorage.setItem('_devFlags', JSON.stringify(o));
const seed = (rows) => localStorage.setItem('logs', JSON.stringify(rows));
const set = (ex, w, reps, rpe, m, d, i = 0) => ({ ex, w, reps, rpe, ts: at(m, d) + i * 60000 });

// His MyGym Domnesti stacks (dp-gyms, measured in "Sala mea").
const MYGYM = {
  activeId: 'gym_mygym_domnesti',
  gyms: {
    gym_mygym_domnesti: {
      id: 'gym_mygym_domnesti',
      name: 'MyGym Domnesti',
      stacks: {
        bailib_stack: [4.5, 11, 18, 25, 32, 39, 45, 52, 59, 66, 73, 79, 86, 93, 100],
        dumbbell: [8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
        matrix_cable: [4.5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 64, 68, 73],
      },
    },
  },
};

const ROW = 'Cable Row';
const cableRow = [
  set(ROW, 73, 10, G, 8, 29, 0), set(ROW, 66, 8, P, 8, 29, 1), set(ROW, 66, 8, P, 8, 29, 2),
  set(ROW, 73, 7, P, 9, 10, 0), set(ROW, 66, 9, P, 9, 10, 1),
  set(ROW, 66, 7, P, 9, 16, 0), set(ROW, 59, 10, P, 9, 16, 1),
  set(ROW, 66, 8, P, 9, 22, 0), set(ROW, 66, 8, P, 9, 22, 1),
  set(ROW, 66, 7, P, 9, 29, 0), set(ROW, 59, 8, P, 9, 29, 1),
];

const MSP = 'Machine Shoulder Press';
const shoulder = [
  set(MSP, 60, 9, P, 9, 21, 0), set(MSP, 60, 7, P, 9, 21, 1), set(MSP, 60, 6, P, 9, 21, 2), set(MSP, 60, 7, P, 9, 21, 3),
  set(MSP, 60, 9, P, 9, 24, 0), set(MSP, 60, 7, P, 9, 24, 1), set(MSP, 55, 9, P, 9, 24, 2), set(MSP, 50, 11, P, 9, 24, 3),
  set(MSP, 60, 10, P, 9, 28, 0), set(MSP, 60, 9, P, 9, 28, 1), set(MSP, 60, 8, P, 9, 28, 2), set(MSP, 60, 8, P, 9, 28, 3),
];

const RPD = 'Reverse Pec Deck';
const rpd = [
  set(RPD, 50, 12, P, 8, 28, 0), set(RPD, 41, 12, P, 8, 28, 1),
  set(RPD, 41, 11, P, 9, 9, 0), set(RPD, 41, 12, P, 9, 9, 1),
  set(RPD, 41, 12, P, 9, 15, 0), set(RPD, 50, 10, P, 9, 15, 1),
  set(RPD, 50, 9, P, 9, 21, 0), set(RPD, 50, 8, P, 9, 21, 1),
  set(RPD, 54, 10, P, 9, 24, 0), set(RPD, 50, 10, P, 9, 24, 1),
  set(RPD, 50, 10, P, 9, 28, 0), set(RPD, 50, 10, P, 9, 28, 1),
];

// The plan path's goal modifiers for his hypertrophy goal (captured from compose).
const GOAL = { repRangeModifier: [10, 15], rirTargetModifier: [2, 3], intensityCorridor: { floor: 0.6, ceiling: 0.75 } };
const smart = (ex, opts = {}) => DP.getSmartRecommendation(ex, null, null, NOW, null, [], { ...GOAL, ...opts });

const NEW = {
  dp_recent_capacity_floor_v1: false, dp_reps_follow_recent_v1: false, dp_cut_restraint_energy_v1: false,
  dp_cap_yields_to_repeated_v1: false, dp_corridor_forta_only_v1: false, dp_logged_rungs_snap_v1: false,
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('dp-gyms', JSON.stringify(MYGYM));
  // His account's phase token (stale STRENGTH — see dp_cut_restraint_energy_v1).
  localStorage.setItem('phase-override', JSON.stringify('STRENGTH'));
});

describe('Cable Row — a month of 66x7-9 must not be prescribed 73x10', () => {
  beforeEach(() => seed(cableRow));

  it('OFF (the bug): the 08-29 73x10 single set floors the rec at 73', () => {
    flags(NEW);
    expect(smart(ROW).kg).toBe(73);
  });

  it('recent capacity floor + reps follow: 66 kg, reps within what he did + 1', () => {
    flags({ ...NEW, dp_recent_capacity_floor_v1: true, dp_reps_follow_recent_v1: true });
    const r = smart(ROW);
    expect(r.kg).toBe(66);
    expect(r.repsTarget).toBeLessThanOrEqual(9); // best recent at 66 is 9
    expect(r.repsTarget).toBeGreaterThanOrEqual(7);
  });

  it('the rep band stays coherent when reps sit under the goal floor (never "10–9")', () => {
    flags({ ...NEW, dp_recent_capacity_floor_v1: true, dp_reps_follow_recent_v1: true });
    const r = smart(ROW);
    const [lo, hi] = r.repsRange.split('–').map(Number);
    expect(lo).toBeLessThanOrEqual(r.repsTarget);
    expect(hi).toBeGreaterThanOrEqual(r.repsTarget);
  });
});

describe('Machine Shoulder Press on a cut — no e1RM push above the 60 he lifts', () => {
  beforeEach(() => seed(shoulder));

  it('ON with the resolved energy phase CUT: 60 kg (the load he works at)', () => {
    flags({ ...NEW, dp_recent_capacity_floor_v1: true, dp_reps_follow_recent_v1: true, dp_cut_restraint_energy_v1: true });
    expect(smart(MSP, { energyPhase: 'CUT' }).kg).toBe(60);
  });

  it('not on a cut → the restraint stays off (no behavior change outside a deficit)', () => {
    flags({ ...NEW, dp_cut_restraint_energy_v1: true });
    const onCut = smart(MSP, { energyPhase: 'CUT' }).kg;
    flags({ ...NEW, dp_cut_restraint_energy_v1: false });
    expect(smart(MSP, { energyPhase: 'BULK' }).kg).toBe(smart(MSP, { energyPhase: 'BULK' }).kg);
    expect(onCut).toBeLessThanOrEqual(smart(MSP, { energyPhase: 'CUT' }).kg);
  });
});

describe('Reverse Pec Deck — the 45 kg defensive cap vs 50 every session', () => {
  beforeEach(() => seed(rpd));

  it('OFF (the bug): "over the cap" → clamped to 45, reps pushed to the range top', () => {
    flags(NEW);
    expect(DP._effectiveMaxKg(RPD, 12)).toBe(45);
    const r = DP._recommendRaw(RPD, NOW);
    expect(r.status).toBe('CAP');
    expect(r.kg).toBe(45);
    expect(r.repsTarget).toBe(20);
  });

  it('cap yields to a load repeated in >= 2 sessions → no CAP, the rec stays at his 50', () => {
    flags({ ...NEW, dp_cap_yields_to_repeated_v1: true });
    expect(DP._effectiveMaxKg(RPD, 12)).toBeCloseTo(62.5, 5);
    const r = DP._recommendRaw(RPD, NOW);
    expect(r.status).not.toBe('CAP');
    expect(r.kg).toBeGreaterThanOrEqual(50);
  });

  it('a single heavier ego set never moves the cap', () => {
    seed([set(RPD, 41, 12, P, 9, 21), set(RPD, 41, 12, P, 9, 24), set(RPD, 70, 8, P, 9, 28)]);
    flags({ ...NEW, dp_cap_yields_to_repeated_v1: true });
    expect(DP._effectiveMaxKg(RPD, 12)).toBeLessThan(60);
  });

  it('hypertrophy goal [10,15] is not "forta" on a 12-floor isolation lift → no corridor cut', () => {
    flags({ ...NEW, dp_cap_yields_to_repeated_v1: true, dp_corridor_forta_only_v1: false });
    const cut = smart(RPD);
    flags({ ...NEW, dp_cap_yields_to_repeated_v1: true, dp_corridor_forta_only_v1: true });
    const fixed = smart(RPD);
    expect(cut.intensityCorridorApplied).toBeTruthy(); // OFF: misread as forta, load cut
    expect(fixed.intensityCorridorApplied).toBeUndefined();
    expect(fixed.kg).toBeGreaterThan(cut.kg);
  });
});
