// Track 7 §7.1 — Persona fixtures for engine deterministic verification.
// Three canonical personas covering tier coverage T0/T2/T3 + edge case generators.
// Used by tests/engine/invariants/ + tests/engine/golden-master/.

import { test as baseTest } from 'vitest';

export type Sex = 'M' | 'F';
export type Experience = 'novice' | 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'cut' | 'maintain' | 'bulk';

export interface PersonaProfile {
  age: number;
  sex: Sex;
  weight: number;
  height: number;
  experience: Experience;
  joints?: string[];
}

export interface PersonaVitality {
  mood: 'low' | 'medium' | 'high';
  soreness: 'low' | 'medium' | 'high';
  sleep: number;
}

export interface WeightLog {
  date: string;
  weight: number;
  kcalDaily: number;
  weightDelta: number;
}

export interface Persona {
  uid: string;
  profile: PersonaProfile;
  tier: 0 | 1 | 2 | 3;
  onboardingDone: boolean;
  goal: Goal;
  history: WeightLog[];
  vitality?: PersonaVitality;
}

// Deterministic seeded RNG (Mulberry32) — same seed = same persona history.
// Critical pentru golden master reproducibility across CI runs.
function mulberry32(seed: number): () => number {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface LogGenOptions {
  adherence?: number;
  kcalBase?: number;
  weightStartKg?: number;
  weightDriftKgPerDay?: number;
  seed?: number;
}

export function generateDaysLogs(
  days: number,
  opts: LogGenOptions = {},
): WeightLog[] {
  const {
    adherence = 0.85,
    kcalBase = 2000,
    weightStartKg = 80,
    weightDriftKgPerDay = -0.05,
    seed = 42,
  } = opts;
  const rng = mulberry32(seed);
  const logs: WeightLog[] = [];
  let currentWeight = weightStartKg;
  const startDate = new Date('2026-01-01T00:00:00Z');
  for (let i = 0; i < days; i++) {
    if (rng() > adherence) continue;
    const date = new Date(startDate.getTime() + i * 86400000);
    const weight = +(currentWeight + (rng() - 0.5) * 0.4).toFixed(2);
    const weightDelta = +(weight - currentWeight).toFixed(3);
    const kcalDaily = Math.round(kcalBase + (rng() - 0.5) * 400);
    logs.push({
      date: date.toISOString().slice(0, 10),
      weight,
      kcalDaily,
      weightDelta,
    });
    currentWeight += weightDriftKgPerDay;
  }
  return logs;
}

// Tier 0 — Gigel cold-start, novice, ZERO history, onboarding incomplete.
export const personaGigelT0: Persona = {
  uid: 'gigel-t0-fresh',
  profile: {
    age: 32,
    sex: 'M',
    weight: 88,
    height: 178,
    experience: 'novice',
  },
  tier: 0,
  onboardingDone: false,
  goal: 'cut',
  history: [],
};

// Tier 2 — Marius intermediate, 30 zile history, adherence 85%, slight cut.
export const personaMariusT2: Persona = {
  uid: 'marius-t2-mature',
  profile: {
    age: 28,
    sex: 'M',
    weight: 82,
    height: 182,
    experience: 'intermediate',
  },
  tier: 2,
  onboardingDone: true,
  goal: 'cut',
  history: generateDaysLogs(30, {
    adherence: 0.85,
    kcalBase: 2400,
    weightStartKg: 82,
    weightDriftKgPerDay: -0.07,
    seed: 1337,
  }),
  vitality: { mood: 'high', soreness: 'low', sleep: 7.5 },
};

// Tier 3 — Maria 65 beginner conservative, 90 zile, adherence 70%, joints care.
export const personaMaria65T3: Persona = {
  uid: 'maria-65-conservative',
  profile: {
    age: 67,
    sex: 'F',
    weight: 64,
    height: 162,
    experience: 'beginner',
    joints: ['knee-left'],
  },
  tier: 3,
  onboardingDone: true,
  goal: 'maintain',
  history: generateDaysLogs(90, {
    adherence: 0.7,
    kcalBase: 1700,
    weightStartKg: 64,
    weightDriftKgPerDay: 0,
    seed: 2026,
  }),
  vitality: { mood: 'medium', soreness: 'medium', sleep: 6.8 },
};

// Edge case fixtures — patterns NU acoperite de canonical 3 personas.
export const edgeCases = {
  perfectAdherence30d: generateDaysLogs(30, { adherence: 1.0, seed: 100 }),
  zeroAdherence30d: generateDaysLogs(30, { adherence: 0, seed: 101 }),
  bulkToCutDay15: [
    ...generateDaysLogs(15, {
      adherence: 0.9,
      kcalBase: 2800,
      weightStartKg: 82,
      weightDriftKgPerDay: 0.05,
      seed: 200,
    }),
    ...generateDaysLogs(15, {
      adherence: 0.9,
      kcalBase: 2200,
      weightStartKg: 82.7,
      weightDriftKgPerDay: -0.06,
      seed: 201,
    }),
  ],
  injuryRecovery14d: generateDaysLogs(14, {
    adherence: 0.4,
    kcalBase: 2200,
    seed: 300,
  }),
};

// Vitest fixture extension — type-safe inject în test signatures:
//   test('foo', ({ personaGigelT0 }) => { ... });
// Pattern Vitest 3.x: async ({}, use) => { await use(value); }
export const test = baseTest.extend<{
  personaGigelT0: Persona;
  personaMariusT2: Persona;
  personaMaria65T3: Persona;
  edgeCases: typeof edgeCases;
}>({
  personaGigelT0: async ({}, use) => {
    await use(personaGigelT0);
  },
  personaMariusT2: async ({}, use) => {
    await use(personaMariusT2);
  },
  personaMaria65T3: async ({}, use) => {
    await use(personaMaria65T3);
  },
  edgeCases: async ({}, use) => {
    await use(edgeCases);
  },
});
