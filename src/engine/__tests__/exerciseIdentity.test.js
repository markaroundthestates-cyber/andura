// ══ ID-MIGRATION Phase 1 — identity lint + resolver (2026-06-11) ═════════════
// Answers Daniel's "why do audits miss these?" with MACHINERY, not promises:
//   (a) identity LINT — every entry has a stable unique kebab id; no alias
//       collides with a real name/id (the name-key bug class becomes a CI fail,
//       not a gym discovery);
//   (b) resolver — name/id/alias all resolve to the canonical name (the two
//       PROVEN historical renames from the 2026-06-10 data remap included);
//   (c) coverage-of-inputs LINT — the recovery muscle map must resolve EVERY
//       ACTIVE exercise (the 27/657 blindness class can never silently return).
import { describe, it, expect } from 'vitest';
import {
  EXERCISE_METADATA,
  resolveExerciseName,
  exerciseIdOf,
  isActiveMeta,
} from '../exerciseLibrary.js';
import { musclesForExercise } from '../muscleMap.js';

const entries = Object.entries(EXERCISE_METADATA);

describe('identity LINT — ids/aliases across the whole library', () => {
  it('every entry carries a kebab-case id', () => {
    const missing = entries.filter(([, m]) => typeof m.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id));
    expect(missing.map(([n]) => n)).toEqual([]);
  });

  it('ids are unique across all entries', () => {
    const seen = new Map();
    const dups = [];
    for (const [n, m] of entries) {
      if (seen.has(m.id)) dups.push(`${m.id} (${seen.get(m.id)} vs ${n})`);
      seen.set(m.id, n);
    }
    expect(dups).toEqual([]);
  });

  it('no alias collides with a real entry name or another id', () => {
    const names = new Set(entries.map(([n]) => n));
    const ids = new Set(entries.map(([, m]) => m.id));
    const bad = [];
    for (const [n, m] of entries) {
      for (const a of m.aliases ?? []) {
        if (names.has(a)) bad.push(`alias "${a}" on "${n}" is a REAL entry name`);
        if (ids.has(a)) bad.push(`alias "${a}" on "${n}" collides with an id`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('resolveExerciseName / exerciseIdOf', () => {
  it('canonical name resolves to itself; id resolves to the name', () => {
    expect(resolveExerciseName('Leg Press')).toBe('Leg Press');
    expect(resolveExerciseName(exerciseIdOf('Leg Press'))).toBe('Leg Press');
    expect(exerciseIdOf('Romanian Deadlift')).toBe('romanian-deadlift');
  });

  it('the two PROVEN historical renames resolve as aliases (2026-06-10 data remap)', () => {
    expect(resolveExerciseName('Chest Fly')).toBe('Cable Fly');
    expect(resolveExerciseName('Overhead Triceps Extension')).toBe('Cable Overhead Triceps Extension Rope');
  });

  it('unknown / empty → null (no invented sentinel)', () => {
    expect(resolveExerciseName('Total Nonsense Movement')).toBeNull();
    expect(resolveExerciseName('')).toBeNull();
    expect(resolveExerciseName(null)).toBeNull();
    expect(exerciseIdOf('Total Nonsense Movement')).toBeNull();
  });
});

describe('coverage-of-inputs LINT — name-keyed lookups must cover the active library', () => {
  // Pure-grip ISOMETRIC holds load no modelled Big-11 recovery head (forearms are
  // not a recovery group — muscleMap headsForGroup('antebrate') === []). They are
  // antebrate-primary with NO secondary major muscle, so musclesForExercise → null
  // is CORRECT, not a map gap (a Farmer's Walk or Reverse Curl, which DO load a
  // secondary major muscle, must still resolve — they are NOT exempt here).
  const GRIP_ISOMETRIC_EXEMPT = new Set(['Wrist Roller', 'Plate Pinch Hold', 'Dead Hang']);

  it('musclesForExercise resolves 100% of ACTIVE (CORE_AUTO) exercises (except pure-grip isometrics)', () => {
    const blind = entries
      .filter(([, m]) => isActiveMeta(m))
      .filter(([n]) => !GRIP_ISOMETRIC_EXEMPT.has(n))
      .filter(([n]) => musclesForExercise(n) === null)
      .map(([n]) => n);
    expect(blind).toEqual([]);
  });

  it('musclesForExercise resolves the overwhelming majority of the WHOLE library (>=95%)', () => {
    const resolved = entries.filter(([n]) => musclesForExercise(n) !== null).length;
    expect(resolved / entries.length).toBeGreaterThanOrEqual(0.95);
  });
});
