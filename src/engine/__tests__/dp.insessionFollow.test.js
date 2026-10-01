// ══ Founder live 2026-10-01 — in-session, he leads and the next set follows ══════
// "nu tine cont de cat bag eu" + "daca prima oara fac 10 repetari dupa clar pot ori 10
// ori mai putine... nu tot 10 mereu". His REAL Cable Row September sets + MyGym stacks.
// dp_insession_follow_user_v1 OFF documents the bug, ON the fix.

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';

const P = 7.5; // potrivit
const G = 8.5; // greu
const at = (m, d, h = 9) => Date.UTC(2026, m - 1, d, h, 0, 0);
const NOW = at(10, 1, 6);
const flags = (o) => localStorage.setItem('_devFlags', JSON.stringify(o));
const seed = (rows) => localStorage.setItem('logs', JSON.stringify(rows));
const set = (ex, w, reps, rpe, m, d, i = 0) => ({ ex, w, reps, rpe, ts: at(m, d) + i * 60000 });

const MYGYM = {
  activeId: 'gym_mygym_domnesti',
  gyms: { gym_mygym_domnesti: { id: 'gym_mygym_domnesti', name: 'MyGym Domnesti', stacks: {
    bailib_stack: [4.5, 11, 18, 25, 32, 39, 45, 52, 59, 66, 73, 79, 86, 93, 100],
  } } },
};
const ROW = 'Cable Row';
const cableRow = [
  set(ROW, 73, 10, G, 8, 29, 0), set(ROW, 66, 8, P, 8, 29, 1), set(ROW, 66, 8, P, 8, 29, 2),
  set(ROW, 73, 7, P, 9, 10, 0), set(ROW, 66, 9, P, 9, 10, 1),
  set(ROW, 66, 7, P, 9, 16, 0), set(ROW, 59, 10, P, 9, 16, 1),
  set(ROW, 66, 8, P, 9, 22, 0), set(ROW, 66, 8, P, 9, 22, 1),
  set(ROW, 66, 7, P, 9, 29, 0), set(ROW, 59, 8, P, 9, 29, 1),
];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('dp-gyms', JSON.stringify(MYGYM));
  localStorage.setItem('phase-override', JSON.stringify('STRENGTH'));
});

describe('in-session — he leads, the next set follows', () => {
  const adjust = (ex, rec, logged, opts = {}) => DP.checkInSessionAdjust(
    ex, [P], [logged.reps],
    { recKg: rec.kg, recReps: rec.reps, loggedKg: logged.kg, wasManualOverride: true, setIdx: 1, nowMs: NOW, ...opts },
  );

  beforeEach(() => seed(cableRow));

  it('OFF (the bug): one pin lower (73 → 66) is inside the noise band → next set shows 73 again', () => {
    flags({ dp_insession_follow_user_v1: false });
    const r = adjust(ROW, { kg: 73, reps: 10 }, { kg: 66, reps: 9 });
    expect(r.newKg === undefined || r.newKg === 73).toBe(true);
  });

  it('ON: one pin lower anchors the next set at 66, reps follow the 9 he did', () => {
    flags({ dp_insession_follow_user_v1: true });
    const r = adjust(ROW, { kg: 73, reps: 10 }, { kg: 66, reps: 9 });
    expect(r).toMatchObject({ adjust: true, dir: 'down', newKg: 66, newReps: 9 });
  });

  it('ON: a potrivit set short on reps at the rec load → next target = reps he did (not 10 again)', () => {
    flags({ dp_insession_follow_user_v1: true });
    const r = DP.checkInSessionAdjust('Lat Pulldown', [P], [8],
      { recKg: 52, recReps: 10, loggedKg: 52, wasManualOverride: true, setIdx: 1, nowMs: NOW });
    expect(r).toMatchObject({ adjust: true, newReps: 8, holdKg: 52 });
  });

  it('ON: went HEAVIER with fewer reps → his choice, no rep cut below the rec', () => {
    flags({ dp_insession_follow_user_v1: true });
    const r = DP.checkInSessionAdjust('Lat Pulldown', [P], [8],
      { recKg: 52, recReps: 10, loggedKg: 59, wasManualOverride: true, setIdx: 1, nowMs: NOW });
    expect(r.newReps === undefined || r.newReps >= 8).toBe(true);
    expect(r.newKg === undefined || r.newKg >= 52).toBe(true);
  });
});
