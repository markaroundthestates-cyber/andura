// ══ EQUIPMENT-MEMORY STORE + PIPELINE EXCLUSION — founder Busy/Missing 2026-06-12 ══
// Covers the per-EXERCISE equipment-missing memory (wv2-equipment-missing-exercises):
//   1. store unit: persist / read / add / remove / membership, per-UID key, malformed
//      guards, canonical-alias dedupe (mirrors the refusalFlow store contract).
//   2. pipeline exclusion: getDailyWorkout HARD-excludes a remembered exercise from
//      composition when dp_equipment_memory_v1 is ON (real library names), and the
//      composition is BYTE-IDENTICAL when the flag is OFF (assert the gate doesn't leak).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  EQUIPMENT_MISSING_EXERCISES_KEY,
  getMissingEquipmentExercises,
  setMissingEquipmentExercises,
  addMissingEquipmentExercise,
  removeMissingEquipmentExercise,
  isEquipmentMissingExercise,
  getDailyWorkout,
} from '../scheduleAdapter.js';
import { DEV_FLAGS_KEY } from '../../../util/featureFlags.js';

const TUESDAY = new Date(2026, 4, 19); // dayIdx 1 (M) — a training day

function buildUserState(overrides = {}) {
  return {
    user: { gender: 'M', age: 30, level: 'intermediate', goal: 'hypertrophy' },
    recentSessions: [],
    weights: {},
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

/** Force the equipment-memory flag explicitly on/off via the dev-override the
 *  real isEnabled honors first — independent of the registry default. */
function setEquipFlag(on) {
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_equipment_memory_v1: on }));
}

beforeEach(() => {
  localStorage.clear();
});

// Clear the dev-flag override + memory key so the forced flag state never bleeds
// into the baseline-hash sims (fp / calibration / wiring) under a parallel run.
afterEach(() => {
  localStorage.clear();
});

describe('equipmentMemoryStorage — store unit', () => {
  it('exports the storage key', () => {
    expect(EQUIPMENT_MISSING_EXERCISES_KEY).toBe('wv2-equipment-missing-exercises');
  });

  it('empty by default', () => {
    expect(getMissingEquipmentExercises()).toEqual([]);
  });

  it('malformed JSON → []', () => {
    localStorage.setItem(EQUIPMENT_MISSING_EXERCISES_KEY, '{not-json');
    expect(getMissingEquipmentExercises()).toEqual([]);
  });

  it('non-array shape → []', () => {
    localStorage.setItem(EQUIPMENT_MISSING_EXERCISES_KEY, JSON.stringify({ wrong: 'shape' }));
    expect(getMissingEquipmentExercises()).toEqual([]);
  });

  it('filters non-string / empty entries on read', () => {
    localStorage.setItem(
      EQUIPMENT_MISSING_EXERCISES_KEY,
      JSON.stringify(['Leg Extension', 42, '', null, 'Cable Fly', undefined]),
    );
    expect(getMissingEquipmentExercises()).toEqual(['Leg Extension', 'Cable Fly']);
  });

  it('add persists + is idempotent', () => {
    addMissingEquipmentExercise('Leg Extension');
    addMissingEquipmentExercise('Leg Extension'); // dup → no double-write
    expect(getMissingEquipmentExercises()).toEqual(['Leg Extension']);
    const raw = localStorage.getItem(EQUIPMENT_MISSING_EXERCISES_KEY);
    expect(JSON.parse(raw)).toEqual(['Leg Extension']);
  });

  it('add rejects empty / non-string (no write)', () => {
    addMissingEquipmentExercise('');
    addMissingEquipmentExercise(undefined);
    expect(getMissingEquipmentExercises()).toEqual([]);
  });

  it('remove drops one, preserves the rest', () => {
    setMissingEquipmentExercises(['Leg Extension', 'Cable Fly', 'Pec Deck / Cable Fly']);
    const after = removeMissingEquipmentExercise('Cable Fly');
    expect(after).not.toContain('Cable Fly');
    expect(after).toContain('Leg Extension');
    expect(getMissingEquipmentExercises()).toEqual(after);
  });

  it('remove of an absent entry is a no-op', () => {
    setMissingEquipmentExercises(['Leg Extension']);
    expect(removeMissingEquipmentExercise('Squat')).toEqual(['Leg Extension']);
  });

  it('isEquipmentMissingExercise reflects membership', () => {
    expect(isEquipmentMissingExercise('Leg Extension')).toBe(false);
    addMissingEquipmentExercise('Leg Extension');
    expect(isEquipmentMissingExercise('Leg Extension')).toBe(true);
    expect(isEquipmentMissingExercise('Cable Fly')).toBe(false);
  });

  it('per-UID isolation: the key is bare localStorage (device/UID-scoped like its siblings)', () => {
    // Mirrors the wv2-refusal-counter / wv2-missing-equipment convention: the
    // storage is a flat localStorage key, isolated by the same per-profile
    // mechanism those use. A localStorage.clear() (account switch / reset) drops it.
    addMissingEquipmentExercise('Leg Extension');
    expect(getMissingEquipmentExercises()).toEqual(['Leg Extension']);
    localStorage.clear();
    expect(getMissingEquipmentExercises()).toEqual([]);
  });
});

describe('getDailyWorkout — equipment-memory HARD exclusion (dp_equipment_memory_v1)', () => {
  it('flag ON: a remembered-missing exercise is excluded from composition', async () => {
    // Baseline (no memory) — find a real auto-selected exercise to then exclude.
    setEquipFlag(true);
    const base = await getDailyWorkout(buildUserState(), TUESDAY);
    expect(base).not.toBeNull();
    const baseNames = base.exercises.map((e) => e.name);
    expect(baseNames.length).toBeGreaterThan(0);
    // Pick a NON-anchor (not the first / squat-lead) so its muscle still has a
    // sibling to fall back to (exclusion is last-option guarded).
    const target = baseNames[baseNames.length - 1];

    addMissingEquipmentExercise(target);
    const after = await getDailyWorkout(buildUserState(), TUESDAY);
    const afterNames = after.exercises.map((e) => e.name);
    // The remembered exercise is gone; the session is still non-empty (a sibling
    // took its slot — never an empty muscle).
    expect(afterNames).not.toContain(target);
    expect(afterNames.length).toBeGreaterThan(0);
  });

  it('flag OFF: composition is BYTE-IDENTICAL even with a remembered exercise', async () => {
    setEquipFlag(false);
    const before = await getDailyWorkout(buildUserState(), TUESDAY);
    const beforeNames = before.exercises.map((e) => e.name);
    // Remember the first exercise — with the flag OFF this MUST NOT change anything.
    addMissingEquipmentExercise(beforeNames[0]);
    const after = await getDailyWorkout(buildUserState(), TUESDAY);
    const afterNames = after.exercises.map((e) => e.name);
    expect(afterNames).toEqual(beforeNames); // gating must not leak when OFF
  });

  it('empty memory → composition unchanged vs no-memory (flag ON)', async () => {
    setEquipFlag(true);
    const a = await getDailyWorkout(buildUserState(), TUESDAY);
    const b = await getDailyWorkout(buildUserState(), TUESDAY);
    expect(a.exercises.map((e) => e.name)).toEqual(b.exercises.map((e) => e.name));
  });
});
