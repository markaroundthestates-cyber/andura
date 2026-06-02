// ══ EXERCISE CUES TESTS — curated form cue lookup (Daniel 2026-06-02) ════════
// Asserts: the curated compound set resolves to a cue key; aliases share keys;
// uncovered → null (graceful); every cue key resolves to real bundle copy in
// BOTH locales; RO copy carries no diacritics (D-LEGACY-064); the sessionBuilder
// ANCHOR_NAMES set has no silent miss; locale selects RO vs EN.

import { describe, it, expect, beforeEach } from 'vitest';
import { getExerciseCueKey } from '../../lib/exerciseCues';
import { t, setLocale, _resetI18nCache } from '../../../i18n/index.js';

// Pin a known locale per test (default app locale is EN since 2026-05-28).
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch {}
  _resetI18nCache();
  setLocale('en');
});

// Verbatim from src/engine/sessionBuilder.js ANCHOR_NAMES — these carry user
// PR continuity and are the common lifts a normal user sees; none must silently
// miss a cue.
const ANCHOR_NAMES = [
  'Incline DB Press', 'Flat DB Press', 'DB Shoulder Press', 'Lateral Raises',
  'Lateral Raises (cable)', 'Rear Delt Fly', 'Rear Delt Cable', 'Overhead Triceps',
  'Pushdown', 'Lat Pulldown', 'Cable Row', 'Face Pulls', 'Bayesian Curl',
  'Incline DB Curl', 'Hammer Curl', 'Cable Curl', 'Leg Press', 'Leg Extension',
  'Leg Curl', 'Romanian Deadlift', 'Cable Fly', 'Pec Deck / Cable Fly',
];

const COMPOUNDS = [
  'Squat', 'Front Squat', 'Bulgarian Split Squat', 'Deadlift', 'Conventional Deadlift',
  'BB Good Morning', 'Barbell Good Morning', 'Hip Thrust', 'Barbell Lunge', 'DB Lunge',
  'Flat Barbell Bench', 'Incline DB Press', 'Incline Barbell Bench', 'DB Shoulder Press',
  'Overhead Press', 'Pull-up', 'Chin-up', 'Chest-Supported Row', 'Barbell Row',
  'Preacher Curl', 'Dip', 'Calf Raise', 'Calf Raises',
];

const DIACRITICS = /[ăâîșțĂÂÎȘȚşţŞŢ]/;

describe('getExerciseCueKey — coverage', () => {
  it('returns a workout.cues.* key for a covered compound (Leg Press)', () => {
    expect(getExerciseCueKey('Leg Press')).toBe('workout.cues.legPress');
  });

  it('covers every sessionBuilder ANCHOR_NAME (no silent miss on common lifts)', () => {
    for (const name of ANCHOR_NAMES) {
      const key = getExerciseCueKey(name);
      expect(key, `missing cue key for anchor "${name}"`).toBeTruthy();
      // Key must resolve to real copy (t() falls back to the key itself if missing).
      expect(t(key as string), `unresolved bundle key for "${name}"`).not.toBe(key);
    }
  });

  it('resolves aliases onto a shared cue key (Pec Deck, Cable Fly, bodyweight squat)', () => {
    expect(getExerciseCueKey('Pec Deck')).toBe('workout.cues.pecDeck');
    expect(getExerciseCueKey('Cable Fly')).toBe('workout.cues.pecDeck');
    expect(getExerciseCueKey('Pec Deck / Cable Fly')).toBe('workout.cues.pecDeck');
    expect(getExerciseCueKey('Bodyweight Squat')).toBe(getExerciseCueKey('Squat'));
    expect(getExerciseCueKey('Conventional Deadlift')).toBe(getExerciseCueKey('Deadlift'));
    expect(getExerciseCueKey('Chin-up')).toBe(getExerciseCueKey('Pull-up'));
  });

  it('returns null for an uncovered / obscure exercise (graceful nothing)', () => {
    expect(getExerciseCueKey('Archer Pull-up')).toBeNull();
    expect(getExerciseCueKey('Cossack Squat')).toBeNull();
    expect(getExerciseCueKey('Bench Press')).toBeNull(); // engine canonical is 'Flat Barbell Bench'
    expect(getExerciseCueKey('Totally Made Up Movement')).toBeNull();
  });
});

describe('getExerciseCueKey — bundle resolution + diacritics', () => {
  it('resolves to real EN copy under EN locale', () => {
    setLocale('en');
    expect(t(getExerciseCueKey('Squat') as string)).toMatch(/chest up/i);
    expect(t(getExerciseCueKey('Leg Press') as string)).toMatch(/back and hips flat/i);
  });

  it('resolves to real RO copy under RO locale', () => {
    setLocale('ro');
    expect(t(getExerciseCueKey('Squat') as string)).toMatch(/spate drept/i);
  });

  it('RO cue copy carries NO diacritics (D-LEGACY-064) across the whole curated set', () => {
    setLocale('ro');
    const names = [...new Set([...ANCHOR_NAMES, ...COMPOUNDS])];
    for (const name of names) {
      const key = getExerciseCueKey(name);
      if (!key) continue;
      const ro = t(key);
      expect(ro, `unresolved RO cue for "${name}"`).not.toBe(key);
      expect(DIACRITICS.test(ro), `diacritics in RO cue for "${name}": ${ro}`).toBe(false);
    }
  });
});
