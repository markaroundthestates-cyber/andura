// dp_logged_rungs_snap_v1 (founder live 2026-10-01: "reverse pec deck cu o greutate pe
// care nu o are aparatul... nu e un caz izolat"; "61 in loc de 60 cat bag eu"). Real
// loads from his account dump; the stale June ladder record is his real one.
import { describe, it, expect, beforeEach } from 'vitest';
import { loggedRungsFromRows } from '../loggedRungs.js';
import { roundToEquipmentWeight } from '../../../config/weights.js';

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
    flags({ dp_logged_rungs_snap_v1: false });
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
