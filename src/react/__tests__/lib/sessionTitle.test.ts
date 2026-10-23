// Founder 2026-10-23: "Workout - <group>" in history. Built from his REAL sessions
// (10-19..10-23 compositions and set counts).
import { describe, it, expect } from 'vitest';
import { sessionDisplayTitle, sessionGroupType } from '../../lib/sessionTitle';

const ex = (engineName: string, n: number) => ({ engineName, exerciseName: engineName, sets: Array.from({ length: n }, () => ({ rating: 'potrivit' as const })) });

const PUSH_1019 = [ex('Machine Shoulder Press', 3), ex('Flat Chest Press Machine', 3), ex('Incline DB Press', 3), ex('DB Lateral Raise', 3), ex('Reverse Pec Deck', 2), ex('Cable Overhead Triceps Extension Rope', 2)];
const PULL_1020 = [ex('Lat Pulldown', 3), ex('Chest-Supported Row', 2), ex('DB Shrug', 2), ex('Hammer Curl', 2), ex('Bayesian Curl', 2)];
const UPPER_1022 = [ex('Machine Shoulder Press', 4), ex('Chest-Supported Row', 3), ex('Lat Pulldown', 2), ex('DB Lateral Raise', 3), ex('Flat Barbell Bench', 3), ex('Reverse Pec Deck', 2), ex('Hammer Curl', 2)];
const LEGS_1023 = [ex('Leg Press', 3), ex('Leg Extension', 4), ex('Leg Curl', 4), ex('Leg Press Calf Raise', 3), ex('Seated Calf Raise Machine', 3), ex('Adduction Machine', 3)];

describe('sessionGroupType — the group a session actually trained', () => {
  it('his push / pull / upper / legs days', () => {
    expect(sessionGroupType({ exercises: PUSH_1019 })).toBe('PUSH');
    expect(sessionGroupType({ exercises: PULL_1020 })).toBe('PULL');
    expect(sessionGroupType({ exercises: UPPER_1022 })).toBe('UPPER');
    expect(sessionGroupType({ exercises: LEGS_1023 })).toBe('LEGS');
  });

  it('legs + upper in one session → full body; nothing logged → no group', () => {
    expect(sessionGroupType({ exercises: [...LEGS_1023.slice(0, 3), ...PUSH_1019.slice(0, 3)] })).toBe('FULL');
    expect(sessionGroupType({ exercises: [] })).toBeNull();
  });
});

describe('sessionDisplayTitle', () => {
  it('a generic saved title gains the group', () => {
    expect(sessionDisplayTitle({ title: 'Workout', exercises: PULL_1020 })).toBe('Workout - Pull (back and biceps)');
    expect(sessionDisplayTitle({ title: 'Workout', exercises: LEGS_1023 })).toBe('Workout - Legs');
    expect(sessionDisplayTitle({ title: 'Antrenament', exercises: PUSH_1019 })).toBe('Antrenament - Push (chest and shoulders)');
  });

  it('a real title passes through; a generic one with no exercises stays generic', () => {
    expect(sessionDisplayTitle({ title: 'Brate (Rogue)', exercises: PULL_1020 })).toBe('Brate (Rogue)');
    expect(sessionDisplayTitle({ title: 'Workout' })).toBe('Workout');
  });
});
