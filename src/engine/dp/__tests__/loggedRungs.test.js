// dp_logged_rungs_snap_v1 (founder live 2026-10-01: "reverse pec deck cu o greutate pe
// care nu o are aparatul... nu e un caz izolat"; "61 in loc de 60 cat bag eu"). Real
// loads from his account dump; the stale June ladder record is his real one.
import { describe, it, expect, beforeEach } from 'vitest';
import { loggedRungsFromRows } from '../loggedRungs.js';
import { roundToEquipmentWeight, getNextWeight, getPrevWeight, getNextWeightGym, getEquipmentType } from '../../../config/weights.js';

const rows = (ex, ws) => ws.map((w, i) => ({ ex, w, reps: 10, ts: 1_790_000_000_000 - i * 86_400_000 }));

describe('loggedRungsFromRows — the loads he actually sets', () => {
  it('Machine Shoulder Press 50/55/60/70/80 → modal 5 kg fills 65 and 75', () => {
    expect(loggedRungsFromRows(rows('Machine Shoulder Press', [60, 60, 55, 50, 70, 80]), 'Machine Shoulder Press'))
      .toEqual([50, 55, 60, 65, 70, 75, 80]);
  });

  it('Reverse Pec Deck on a Matrix stack 41/50/54 → no invented rungs (no corroborated step)', () => {
    expect(loggedRungsFromRows(rows('Reverse Pec Deck', [50, 50, 54, 41, 41]), 'Reverse Pec Deck'))
      .toEqual([41, 50, 54]);
  });

  it('a single distinct load is not a ladder → null', () => {
    expect(loggedRungsFromRows(rows('Leg Curl', [100, 100, 100]), 'Leg Curl')).toBeNull();
  });

  it('only the most recent 24 sets count (an old gym fades out)', () => {
    const recent = rows('Leg Extension', Array(24).fill(75).map((w, i) => (i % 2 ? 84 : w)));
    const old = rows('Leg Extension', [129, 138]).map((r) => ({ ...r, ts: r.ts - 90 * 86_400_000 }));
    expect(loggedRungsFromRows([...recent, ...old], 'Leg Extension')).toEqual([75, 84]);
  });
});

describe('roundToEquipmentWeight — logged rungs beat stale priors', () => {
  const flags = (o) => localStorage.setItem('_devFlags', JSON.stringify(o));
  beforeEach(() => {
    localStorage.clear();
    // His real June record for Reverse Pec Deck (old gym 18/24/30, step 6) — every load
    // above ~42 clamped to 42 on the user-ladder path.
    localStorage.setItem('dp-equipment-ladder', JSON.stringify({
      'Reverse Pec Deck': { max: 30, min: 18, modalGaps: 2, n: 3, nDistinct: 3, step: 6 },
    }));
    localStorage.setItem('logs', JSON.stringify([
      ...rows('Reverse Pec Deck', [50, 50, 54, 50, 41, 41]),
      ...rows('Machine Shoulder Press', [60, 60, 60, 55, 50, 60]),
    ]));
  });

  it('OFF (the bug): a 54 rec clamps to the stale 42', () => {
    flags({ dp_logged_rungs_snap_v1: false, dp_logged_loads_sacred_v1: false, dp_steps_follow_logged_v1: false });
    expect(roundToEquipmentWeight(54, 'Reverse Pec Deck')).toBe(42);
  });

  it('ON: 54 stays 54, 45 → 41 (a load he sets), 42 → 41', () => {
    flags({ dp_logged_rungs_snap_v1: true });
    expect(roundToEquipmentWeight(54, 'Reverse Pec Deck')).toBe(54);
    expect(roundToEquipmentWeight(42, 'Reverse Pec Deck')).toBe(41);
  });

  it('ON: above his heaviest the chain may go up but never clamps below a load he uses', () => {
    flags({ dp_logged_rungs_snap_v1: true });
    expect(roundToEquipmentWeight(60, 'Reverse Pec Deck')).toBeGreaterThanOrEqual(54);
  });

  it('ON: Machine Shoulder Press 61.8 → 60 (the 61 he kept correcting)', () => {
    flags({ dp_logged_rungs_snap_v1: true });
    expect(roundToEquipmentWeight(61.8, 'Machine Shoulder Press')).toBe(60);
    expect(roundToEquipmentWeight(61, 'Machine Shoulder Press')).toBe(60);
  });
});

// Founder audit 2026-10-09 ("verifica daca mai e vre-o linie de greutati pe vre-un aparat
// incorecta fata de ce loghez eu"): every lift he logged at his gym, each load he set run
// through the snap + steps. Real loads and his real Sala mea stacks.
describe('the ladder follows the loads he sets (2026-10-09 audit)', () => {
  const flags = (o) => localStorage.setItem('_devFlags', JSON.stringify(o));
  const gym = (stacks) => localStorage.setItem('dp-gyms', JSON.stringify({
    activeId: 'g', gyms: { g: { id: 'g', name: 'MyGym Domnesti', stacks } },
  }));
  const DUMBBELLS = [8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
  const MATRIX = [4.5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 64, 68, 73];
  beforeEach(() => localStorage.clear());

  it('a load set again and again is never snapped away — not even by the gym stack', () => {
    gym({ dumbbell: DUMBBELLS });
    localStorage.setItem('logs', JSON.stringify(rows('Preacher Curl', [25, 25, 25])));
    expect(roundToEquipmentWeight(25, 'Preacher Curl')).toBe(25);
    flags({ dp_logged_loads_sacred_v1: false });
    expect(roundToEquipmentWeight(25, 'Preacher Curl')).not.toBe(25);
  });

  it('above the ladder top "next" steps UP (M Torture 60 was "next" 59)', () => {
    expect(getNextWeight(60, 'Pec Deck / Cable Fly')).toBe(65);
    flags({ dp_steps_follow_logged_v1: false });
    expect(getNextWeight(60, 'Pec Deck / Cable Fly')).toBe(59);
  });

  it('outside his range the snap continues HIS increment, not an old-gym ladder', () => {
    localStorage.setItem('dp-equipment-ladder', JSON.stringify({
      'Machine Shoulder Press': { max: 81, min: 41, modalGaps: 2, n: 3, nDistinct: 3, step: 10 },
    }));
    localStorage.setItem('logs', JSON.stringify(rows('Machine Shoulder Press', [60, 60, 55, 55, 50, 60])));
    expect(roundToEquipmentWeight(65, 'Machine Shoulder Press')).toBe(65);
    expect(roundToEquipmentWeight(75, 'Machine Shoulder Press')).toBe(75);
  });

  it('every load he uses sits on one measured stack → that stack is the station (RPD = Matrix)', () => {
    gym({ matrix_cable: MATRIX, dumbbell: DUMBBELLS });
    localStorage.setItem('logs', JSON.stringify(rows('Reverse Pec Deck', [50, 50, 41, 41, 32, 32, 54, 59])));
    expect(roundToEquipmentWeight(64, 'Reverse Pec Deck')).toBe(64);
    expect(getNextWeightGym(59, 'Reverse Pec Deck')).toBe(64);
    flags({ dp_station_from_loads_v1: false });
    expect(getNextWeightGym(59, 'Reverse Pec Deck')).not.toBe(64);
  });

  it('an unmapped dumbbell lift is a dumbbell, not the cable stack', () => {
    expect(getEquipmentType('Wrist Curl DB Seated Palms-Up')).toBe('dumbbell');
    flags({ dp_unmapped_by_library_v1: false });
    expect(getEquipmentType('Wrist Curl DB Seated Palms-Up')).toBe('bailib_stack');
  });

  it('a grid step a kilo off his load becomes his load; a real plate step between sparse loads survives', () => {
    localStorage.setItem('logs', JSON.stringify(rows('Pec Deck / Cable Fly', [60, 60, 57, 57, 55, 50, 45])));
    expect(getPrevWeight(60, 'Pec Deck / Cable Fly')).toBe(57); // grid 59 → his 57
    localStorage.setItem('logs', JSON.stringify(rows('Leg Press', [80, 80, 60, 60])));
    expect(getPrevWeight(80, 'Leg Press')).toBeGreaterThan(60); // a real plate rung, not his 60
  });

  it('a float a hair off his load comes back as his load (Bayesian Curl 13.999999999999998 → 14)', () => {
    localStorage.setItem('logs', JSON.stringify(rows('Bayesian Curl', [14, 14, 18])));
    expect(roundToEquipmentWeight(13.999999999999998, 'Bayesian Curl')).toBe(14);
  });

  it('a new cable lateral raise lands on his cable pulley, not the generic fine ladder', () => {
    gym({ matrix_cable: MATRIX, dumbbell: DUMBBELLS });
    expect(roundToEquipmentWeight(17.5, 'Cable Lateral Raise')).toBe(18);
    expect(roundToEquipmentWeight(7, 'DB Lateral Raise')).toBe(8); // his rack starts at 8
    expect(roundToEquipmentWeight(41, 'Reverse Pec Deck')).not.toBe(41); // a machine borrows no Matrix pin
    flags({ dp_gym_light_station_v1: false });
    expect(roundToEquipmentWeight(17.5, 'Cable Lateral Raise')).toBe(17.5);
  });

  it('above his heaviest the smaller real step wins (Flat Chest Press 70 → 75, not +10)', () => {
    localStorage.setItem('logs', JSON.stringify(rows('Flat Chest Press Machine', [70, 60, 60, 70, 60])));
    expect(getNextWeight(70, 'Flat Chest Press Machine')).toBe(75);
    expect(roundToEquipmentWeight(75, 'Flat Chest Press Machine')).toBe(75);
  });
});
