// MAINTENANCE / OLDER effective-frequency RESHAPE (dp_maintenance_freq_reshape_v1,
// 2026-06-14, DEFAULT OFF) — a maintenance-goal OR older (age>=60) trainee at high
// nominal frequency is held to a goal-appropriate MAX effective training days
// (maintenance 4 / older 3 / older+maintenance 3): the excess nominal days become
// SPACED REST so the kept days are never consecutive (removing the eval's structure
// cap). DEFAULT OFF → the reshape never runs in a normal path → byte-identical.
//
// Hard invariants under test:
//   - maintenanceMaxDays: maintenance→4, older→3, older+maintenance→3, else null.
//   - reshapeMaintenanceWeek: caps to k SPACED (zero consecutive) days; <=k → input
//     unchanged; deterministic; pure (idempotent on its own output).
//   - flag OFF → a maintenance freq-7 week composes 7 training days (unchanged).
//   - flag ON → a maintenance freq-7 week composes 4 SPACED training days, the
//     reshaped-rest days return REST (null), and a trained adult <60 is untouched.

import { describe, it, expect, beforeEach } from 'vitest';
import { world, resetWorld, setPathAFlags } from '../../../../tests/engine/full-path-sim/fp-config.js';
import { DEV_FLAGS_KEY } from '../../../util/featureFlags.js';
import {
  maintenanceMaxDays,
  reshapeMaintenanceWeek,
} from '../scheduleAdapter/frequencySplit.js';

const MS_DAY = 86400000;
const WEEK_START = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon 2026-06-15
const RESHAPE_FLAG = 'dp_maintenance_freq_reshape_v1';
const SCHEDULE_STORE_KEY = 'wv2-schedule-store';

// Count consecutive-day adjacencies in a length-7 boolean active week.
function adjacency(week) {
  let n = 0;
  for (let i = 1; i < week.length; i++) if (week[i] && week[i - 1]) n += 1;
  return n;
}
function nTrain(week) {
  return week.filter(Boolean).length;
}

// ── PURE HELPERS ────────────────────────────────────────────────────────────
describe('maintenanceMaxDays — goal/age → effective day cap', () => {
  it('maintenance (any age) → 4', () => {
    expect(maintenanceMaxDays('mentenanta', 34)).toBe(4);
    expect(maintenanceMaxDays('mentenanta', 25)).toBe(4);
  });
  it('older (>=60) → 3', () => {
    expect(maintenanceMaxDays('masa', 65)).toBe(3);
    expect(maintenanceMaxDays('forta', 60)).toBe(3);
  });
  it('older + maintenance → 3 (the conservative cap)', () => {
    expect(maintenanceMaxDays('mentenanta', 65)).toBe(3);
  });
  it('trained adult <60, non-maintenance → null (no reshape)', () => {
    expect(maintenanceMaxDays('masa', 30)).toBeNull();
    expect(maintenanceMaxDays('forta', 45)).toBeNull();
    expect(maintenanceMaxDays('slabire', 28)).toBeNull();
    expect(maintenanceMaxDays(undefined, undefined)).toBeNull();
  });
});

describe('reshapeMaintenanceWeek — cap + SPACED rest', () => {
  const FULL7 = [true, true, true, true, true, true, true];
  const FREQ5 = [true, true, true, false, true, true, false]; // L,Ma,Mi,V,S

  it('caps freq-7 to 4 SPACED training days (zero consecutive)', () => {
    const out = reshapeMaintenanceWeek(FULL7, 4);
    expect(nTrain(out)).toBe(4);
    expect(adjacency(out)).toBe(0);
    // endpoint-even k=4 → Mon/Wed/Fri/Sun
    expect(out).toEqual([true, false, true, false, true, false, true]);
  });

  it('caps freq-7 to 3 SPACED training days (zero consecutive)', () => {
    const out = reshapeMaintenanceWeek(FULL7, 3);
    expect(nTrain(out)).toBe(3);
    expect(adjacency(out)).toBe(0);
    // endpoint-even k=3 → Mon/Thu/Sun
    expect(out).toEqual([true, false, false, true, false, false, true]);
  });

  it('caps freq-5 to 3 SPACED training days', () => {
    const out = reshapeMaintenanceWeek(FREQ5, 3);
    expect(nTrain(out)).toBe(3);
    expect(adjacency(out)).toBe(0);
  });

  it('returns the input UNCHANGED when already within the cap (<=k)', () => {
    const within = [true, false, true, false, true, false, false]; // 3 days
    expect(reshapeMaintenanceWeek(within, 4)).toBe(within); // same reference, no reshape
    expect(reshapeMaintenanceWeek(within, 3)).toBe(within); // exactly at cap → unchanged
  });

  it('is deterministic + idempotent (reshape of its own output is stable)', () => {
    const a = reshapeMaintenanceWeek(FULL7, 3);
    const b = reshapeMaintenanceWeek(FULL7, 3);
    expect(b).toEqual(a);
    // its output has 3 days <= cap → a second pass is a no-op (returns it unchanged)
    expect(reshapeMaintenanceWeek(a, 3)).toBe(a);
  });

  it('handles k=1 (single Monday) and a malformed week defensively', () => {
    expect(reshapeMaintenanceWeek(FULL7, 1)).toEqual([true, false, false, false, false, false, false]);
    const bad = [true, true];
    expect(reshapeMaintenanceWeek(bad, 3)).toBe(bad); // non-length-7 → unchanged
  });
});

// ── INTEGRATION through the real compose path (flag OFF gold-ref vs ON) ───────
function seedFlag(on) {
  const obj = { [RESHAPE_FLAG]: on === true };
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* jsdom */ }
}
function seedScheduleStore(week) {
  const days = week.map((a) => (a ? 'training' : 'rest'));
  try { localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days } })); } catch { /* */ }
}

// Compose every day of a nominal-7 week and report which days were TRAINING (a
// non-null plan with exercises) vs REST (null).
async function composeWeekTrainingDays(data) {
  const trainingIdxs = [];
  for (let off = 0; off < 7; off++) {
    resetWorld();
    setPathAFlags(false); // all default-ON flags forced OFF — isolate the new flag
    seedFlag(data.__reshapeOn);
    seedScheduleStore([true, true, true, true, true, true, true]); // nominal freq-7
    const { __reshapeOn, ...onboarding } = data;
    world.useOnboardingStore.setState({
      data: { ...onboarding, frequency: '7' },
      completed: true,
      completedAt: WEEK_START,
    });
    const plan = await world.composePlannedWorkoutToday(new Date(WEEK_START + off * MS_DAY));
    if (plan && !plan.error && Array.isArray(plan.exercises) && plan.exercises.length > 0) {
      trainingIdxs.push(off);
    }
  }
  return trainingIdxs;
}

describe('dp_maintenance_freq_reshape_v1 — gated through the compose path', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('OFF — a maintenance freq-7 week trains all 7 nominal days (byte-identical schedule)', async () => {
    const idxs = await composeWeekTrainingDays({
      __reshapeOn: false,
      age: 34, sex: 'f', goal: 'mentenanta', experience: 'intermediar', weight: 72, height: 170,
    });
    expect(idxs).toEqual([0, 1, 2, 3, 4, 5, 6]);
  }, 120000);

  it('ON — a maintenance freq-7 week trains 4 SPACED days; the rest return REST', async () => {
    const idxs = await composeWeekTrainingDays({
      __reshapeOn: true,
      age: 34, sex: 'f', goal: 'mentenanta', experience: 'intermediar', weight: 72, height: 170,
    });
    // endpoint-even k=4 → Mon/Wed/Fri/Sun
    expect(idxs).toEqual([0, 2, 4, 6]);
    expect(adjacency([0, 1, 2, 3, 4, 5, 6].map((i) => idxs.includes(i)))).toBe(0);
  }, 120000);

  it('ON — an older (65) freq-7 week trains 3 SPACED days', async () => {
    const idxs = await composeWeekTrainingDays({
      __reshapeOn: true,
      age: 65, sex: 'f', goal: 'mentenanta', experience: 'incepator', weight: 70, height: 162,
    });
    // older (>=60) → cap 3 → Mon/Thu/Sun
    expect(idxs).toEqual([0, 3, 6]);
  }, 120000);

  it('ON — a trained adult <60 (masa) is NOT reshaped (all 7 days train)', async () => {
    const idxs = await composeWeekTrainingDays({
      __reshapeOn: true,
      age: 30, sex: 'm', goal: 'masa', experience: 'intermediar', weight: 85, height: 180,
    });
    expect(idxs).toEqual([0, 1, 2, 3, 4, 5, 6]);
  }, 120000);
});
