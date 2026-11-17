// dp_prefatigue_relative_v1 (founder 2026-11-17: after Cable Row, Lat Pulldown, Incline
// Curl, Hammer Curl, Straight-Arm Pulldown the Reverse Pec Deck still asked 50x10 — "nu
// cred ca ia in calcul fatigue"). Real sessions from his account: the RPD rec came from
// the end of his 11-16 push day; on 11-17 it closed the pull day and he did 50x8, hard.
import { describe, it, expect } from 'vitest';
import {
  deltHeadsOf, priorWorkOn, referencePrior, relativePreFatigue, applyRelativePreFatigue, fatiguedReps,
} from '../preFatigue.js';

const PUSH = 1_794_810_686_000; // 2026-11-16
const row = (ex, w, ts, session = PUSH) => ({ ex, w, reps: '8', rpe: 7.5, ts, session });
/** His 11-16 push day, in order, ending on the Reverse Pec Deck. */
const pushDay = [
  ...[60, 60, 60, 50].map((w, i) => row('Flat Barbell Bench', w, PUSH + i)),
  ...[50, 50, 50, 50].map((w, i) => row('Incline Barbell Bench', w, PUSH + 10 + i)),
  ...[60, 50, 40, 40].map((w, i) => row('Machine Shoulder Press', w, PUSH + 20 + i)),
  ...[27, 23].map((w, i) => row('Cable Triceps Kickback Rope', w, PUSH + 30 + i)),
  ...[27, 23].map((w, i) => row('Cable Overhead Triceps Extension Rope', w, PUSH + 40 + i)),
  ...[8, 8].map((w, i) => row('DB Lateral Raise', w, PUSH + 50 + i)),
  row('Pec Deck / Cable Fly', 50, PUSH + 60),
  ...[50, 50].map((w, i) => row('Reverse Pec Deck', w, PUSH + 70 + i)),
];
/** His 11-17 pull day plan before the Reverse Pec Deck. */
const pullPrior = [
  { name: 'Cable Row', sets: 4 },
  { name: 'Lat Pulldown', sets: 4 },
  { name: 'Incline DB Curl', sets: 3 },
  { name: 'Hammer Curl', sets: 3 },
  { name: 'Straight-Arm Lat Pulldown', sets: 2 },
];

describe('which delt a lift works', () => {
  it('a row works the rear delt, a press the front, a lateral raise the side', () => {
    expect(deltHeadsOf('Cable Row')).toContain('delt_rear');
    expect(deltHeadsOf('Reverse Pec Deck')).toEqual(['delt_rear']);
    expect(deltHeadsOf('Flat Barbell Bench')).toEqual(['delt_front']);
    expect(deltHeadsOf('DB Lateral Raise')).toEqual(['delt_mid']);
    expect(deltHeadsOf('Lat Pulldown')).toEqual([]);
  });
});

describe('prior work on the lift’s muscle', () => {
  it('his pull day put 4 row sets on the rear delt; his push day none', () => {
    expect(priorWorkOn('Reverse Pec Deck', pullPrior)).toBe(4);
    expect(priorWorkOn('Reverse Pec Deck', referencePrior('Reverse Pec Deck', pushDay))).toBe(0);
  });

  it('direct work counts whole, a synergist by its force (curls after rows + pulldowns)', () => {
    // Hammer Curl: Cable Row 4 + Lat Pulldown 4 (biceps synergist, high force) + 3 direct curls.
    expect(priorWorkOn('Hammer Curl', pullPrior.slice(0, 3))).toBe(11);
  });

  it('the reference is the lifts before it in its newest session', () => {
    const ref = referencePrior('Reverse Pec Deck', pushDay);
    expect(ref.map((r) => r.name)).toContain('Flat Barbell Bench');
    expect(ref.find((r) => r.name === 'Machine Shoulder Press').sets).toBe(4);
    expect(ref.map((r) => r.name)).not.toContain('Reverse Pec Deck');
  });
});

describe('relative pre-fatigue', () => {
  it('RPD at the end of the pull day after a push-day reference → 4.8 % off', () => {
    expect(relativePreFatigue('Reverse Pec Deck', pullPrior, pushDay)).toBeCloseTo(0.048, 5);
  });

  it('the same place in the session as its reference → nothing (history already has it)', () => {
    const pullRef = [
      ...[66, 59, 59, 59].map((w, i) => row('Cable Row', w, PUSH + i)),
      ...[50, 50].map((w, i) => row('Reverse Pec Deck', w, PUSH + 10 + i)),
    ];
    expect(relativePreFatigue('Reverse Pec Deck', [{ name: 'Cable Row', sets: 4 }], pullRef)).toBe(0);
  });

  it('a lift never logged → nothing', () => {
    expect(relativePreFatigue('Face Pull', pullPrior, pushDay)).toBe(0);
  });
});

describe('applying it', () => {
  const dp = {
    roundToStep: (kg) => [41, 50, 59].reduce((b, r) => (Math.abs(r - kg) < Math.abs(b - kg) ? r : b), 41),
    _demoWorkingW: () => 50,
  };

  it('coarse stack (41/50/59): 50x10 keeps 50 and the reps drop to 8', () => {
    const result = { kg: 50, repsTarget: 10 };
    applyRelativePreFatigue(dp, 'Reverse Pec Deck', result, pullPrior, pushDay);
    expect(result.kg).toBe(50);
    expect(fatiguedReps(result, result.repsTarget)).toBe(8);
    expect(result.preFatigueRepsBefore).toBe(10);
  });

  it('a fine ladder takes the load down instead, below the fresh-context floor if it must', () => {
    const fine = { roundToStep: (kg) => Math.round(kg), _demoWorkingW: () => 50 };
    const result = { kg: 50, repsTarget: 10 };
    applyRelativePreFatigue(fine, 'Reverse Pec Deck', result, pullPrior, pushDay);
    expect(result.kg).toBe(48);
    expect(result.preFatigueKgBefore).toBe(50);
    expect(result.preFatigueReps).toBeUndefined();
  });

  it('bodyweight (no load) is left alone', () => {
    const result = { kg: 0, repsTarget: 10 };
    applyRelativePreFatigue(dp, 'Reverse Pec Deck', result, pullPrior, pushDay);
    expect(result).toEqual({ kg: 0, repsTarget: 10 });
  });

  it('the reps cut is bounded: at most 4 off, never below 4', () => {
    expect(fatiguedReps({ preFatigueReps: 0.12 }, 12)).toBe(8);
    expect(fatiguedReps({ preFatigueReps: 0.12 }, 5)).toBe(4);
    expect(fatiguedReps({}, 10)).toBe(10);
  });
});
