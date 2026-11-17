// dp_refused_rungs_v1 (founder 2026-11-17: "pe aparatul de reverse pec deck nu exista 45kg
// cat recomanda andura"). Real case from his account: Reverse Pec Deck reads on the Matrix
// stack he measured in Sala mea, after a hard 50 the ease offered 45 and he set 41.
import { describe, it, expect, beforeEach } from 'vitest';
import { refusedRungsFromRows, withoutRefused } from '../loggedRungs.js';
import { getPrevWeightGym, getNextWeightGym, roundToEquipmentWeight } from '../../../config/weights.js';

const DAY = 86_400_000;
const T0 = 1_794_897_701_927; // his 2026-11-17 pull session
const MATRIX = [4.5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 64, 68, 73, 77, 82, 86, 91];
const RPD = 'Reverse Pec Deck';

/** Two-set sessions at 50 on the days before T0 (his real Oct–Nov history). */
const history = (n) => Array.from({ length: n }, (_, i) => [
  { ex: RPD, w: 50, reps: '9', rpe: 7.5, session: T0 - (i + 1) * 3 * DAY, ts: T0 - (i + 1) * 3 * DAY + 60_000 },
  { ex: RPD, w: 50, reps: '8', rpe: 7.5, session: T0 - (i + 1) * 3 * DAY, ts: T0 - (i + 1) * 3 * DAY + 180_000 },
]).flat();
const today = [
  { ex: RPD, w: 50, reps: '8', rpe: 8.5, session: T0, ts: T0 + 3_200_000 },
  { ex: RPD, w: 41, reps: '8', rpe: 7.5, session: T0, ts: T0 + 3_400_000 },
];
const easeOnMatrix = (w) => [...MATRIX].reverse().find((r) => r < w) ?? NaN;

describe('refusedRungsFromRows — a rung he stepped past is not on his machine', () => {
  it('legacy rows: a hard 50 eased to 45, he set 41 → 45 refused', () => {
    expect(refusedRungsFromRows([...history(6), ...today], RPD, easeOnMatrix)).toEqual([45]);
  });

  it('the stored rec (rk) is the offer: set 1 rec 45 after last time 50, he set 41 → 45 refused', () => {
    const rows = [...history(3), { ex: RPD, w: 41, reps: '10', rpe: 7.5, rk: 45, session: T0, ts: T0 + 60_000 }];
    expect(refusedRungsFromRows(rows, RPD)).toEqual([45]);
  });

  it('a climb he declined is not a missing rung (rec 54, he stayed at 50)', () => {
    const rows = [...history(3), { ex: RPD, w: 50, reps: '10', rpe: 7.5, rk: 54, session: T0, ts: T0 + 60_000 }];
    expect(refusedRungsFromRows(rows, RPD)).toEqual([]);
  });

  it('a hard set followed by the offered rung itself refuses nothing', () => {
    const rows = [...history(3), { ...today[0] }, { ...today[1], w: 45 }];
    expect(refusedRungsFromRows(rows, RPD, easeOnMatrix)).toEqual([]);
  });

  it('a rung he sets later in the window is real again', () => {
    const later = { ex: RPD, w: 45, reps: '10', rpe: 7.5, session: T0 + 3 * DAY, ts: T0 + 3 * DAY };
    expect(refusedRungsFromRows([...history(6), ...today, later], RPD, easeOnMatrix)).toEqual([]);
  });

  it('the inference only reads an ease inside one session (a new session may start lower)', () => {
    const nextDay = { ex: RPD, w: 41, reps: '10', rpe: 7.5, session: T0 + DAY, ts: T0 + DAY };
    const rows = [...history(3), { ...today[0], ts: T0 + 3_200_000 }, nextDay];
    expect(refusedRungsFromRows(rows, RPD, easeOnMatrix)).toEqual([]);
  });

  it('withoutRefused keeps the ladder when fewer than two rungs would remain', () => {
    expect(withoutRefused([41, 45, 50], [45])).toEqual([41, 50]);
    expect(withoutRefused([41, 45], [41, 45])).toEqual([41, 45]);
  });
});

describe('his ladder after the refusal (active gym Matrix stack)', () => {
  const flags = (o) => localStorage.setItem('_devFlags', JSON.stringify(o));
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('dp-gyms', JSON.stringify({
      activeId: 'gym_mygym_domnesti',
      gyms: { gym_mygym_domnesti: { id: 'gym_mygym_domnesti', name: 'MyGym Domnesti', stacks: { matrix_cable: MATRIX } } },
    }));
    localStorage.setItem('logs', JSON.stringify([...history(6), ...today]));
  });

  it('ON: the ease after a hard 50 is 41, and 45 never comes back as a snap', () => {
    flags({ dp_refused_rungs_v1: true });
    expect(getPrevWeightGym(50, RPD)).toBe(41);
    expect(roundToEquipmentWeight(45, RPD)).not.toBe(45);
    expect(getNextWeightGym(41, RPD)).not.toBe(45);
  });

  it('OFF (the bug): the ease after a hard 50 is 45', () => {
    flags({ dp_refused_rungs_v1: false });
    expect(getPrevWeightGym(50, RPD)).toBe(45);
  });

  it('other lifts on the same Matrix stack keep 45', () => {
    flags({ dp_refused_rungs_v1: true });
    expect(getPrevWeightGym(50, 'Cable Lateral Raise')).toBe(45);
  });
});
