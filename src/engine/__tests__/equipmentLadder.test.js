// ══ BUILD #10/E — learned per-gym equipment ladder tests (F4 spec §E) ════════
// (1) Pure inference: modal gap from distinct loads, min-distinct gate, sane band.
// (2) Persistence round-trip (synced dp-equipment-ladder).
// (3) Consumer: with the flag ON + a learned 2.5kg step, getNextWeight offers a
//     2.5kg increment where the hard-coded dumbbell table jumps more coarsely; flag
//     OFF → the hard-coded ladder (byte-identical).

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  learnedStepFromLogs,
  saveLearnedStep,
  learnedStep,
  LADDER_MIN_DISTINCT,
  EQUIPMENT_LADDER_KEY,
} from '../dp/equipmentLadder.js';
import { getNextWeight } from '../../config/weights.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

describe('learnedStepFromLogs — pure inference', () => {
  it('infers the modal gap from a 2.5kg ladder', () => {
    expect(learnedStepFromLogs([20, 22.5, 25, 27.5, 30])).toBe(2.5);
  });
  it('infers 5kg when that is the dominant gap', () => {
    expect(learnedStepFromLogs([60, 65, 70, 75, 80])).toBe(5);
  });
  it('returns 0 below the distinct-loads threshold (untrusted)', () => {
    const few = Array.from({ length: LADDER_MIN_DISTINCT - 1 }, (_, i) => 20 + i * 2.5);
    expect(learnedStepFromLogs(few)).toBe(0);
  });
  it('ignores out-of-band gaps (a big missed-session jump) and takes the real step', () => {
    // mostly 2.5kg steps + one 40kg outlier gap → modal 2.5kg wins.
    expect(learnedStepFromLogs([20, 22.5, 25, 27.5, 67.5])).toBe(2.5);
  });
});

describe('persistence — synced dp-equipment-ladder', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips the learned step', () => {
    saveLearnedStep('Flat DB Press', 2.5, 5);
    expect(learnedStep('Flat DB Press')).toBe(2.5);
    expect(/** @type {any} */ (DB.get(EQUIPMENT_LADDER_KEY))['Flat DB Press'].n).toBe(5);
  });
  it('returns 0 for an exercise with no learned step', () => {
    expect(learnedStep('Unknown Lift')).toBe(0);
  });
});

describe('weights.getNextWeight — learned ladder consumer', () => {
  const EX = 'Lat Pulldown'; // hard-coded bailib_stack = 5kg steps
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('FLAG OFF (default) — uses the hard-coded 5kg ladder (byte-identical)', () => {
    saveLearnedStep(EX, 2.5, 6); // learned step present but flag off
    // hard-coded: ...20, 25... → next after 20 is 25.
    expect(getNextWeight(20, EX)).toBe(25);
  });

  it('FLAG ON + learned 2.5kg step — offers the finer 2.5kg increment', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_learned_ladder_v1');
    saveLearnedStep(EX, 2.5, 6);
    // Refined ladder from the bailib floor (5) at 2.5kg → next after 20 is 22.5.
    expect(getNextWeight(20, EX)).toBe(22.5);
  });

  it('FLAG ON but no learned step — falls back to hard-coded (byte-identical)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_learned_ladder_v1');
    expect(getNextWeight(20, EX)).toBe(25);
  });

  it('FLAG ON + a COARSER learned step than hard-coded — never coarsens (keeps hard-coded)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_learned_ladder_v1');
    saveLearnedStep(EX, 10, 6); // coarser than the 5kg hard-coded spacing
    expect(getNextWeight(20, EX)).toBe(25); // unchanged
  });
});
