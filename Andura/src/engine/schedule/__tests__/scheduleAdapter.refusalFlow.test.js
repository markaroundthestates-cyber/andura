// Bundle 4 — Tests for refusal flow storage extensions in scheduleAdapter.js
// Covers SKIPPED_EXERCISES_KEY + REFUSAL_COUNTER_KEY + REFUSAL_COUNTER_THRESHOLD
// and 6 helper functions (get/set/toggle skipped + get/increment/reset counter).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SKIPPED_EXERCISES_KEY,
  REFUSAL_COUNTER_KEY,
  REFUSAL_COUNTER_THRESHOLD,
  getSkippedExercises,
  setSkippedExercises,
  toggleSkippedExercise,
  getRefusalCounter,
  incrementRefusal,
  resetRefusalCounter,
} from '../scheduleAdapter.js';

beforeEach(() => {
  localStorage.clear();
});

describe('scheduleAdapter — refusal flow constants', () => {
  it('exports SKIPPED_EXERCISES_KEY = "wv2-skipped-exercises"', () => {
    expect(SKIPPED_EXERCISES_KEY).toBe('wv2-skipped-exercises');
  });

  it('exports REFUSAL_COUNTER_KEY = "wv2-refusal-counter"', () => {
    expect(REFUSAL_COUNTER_KEY).toBe('wv2-refusal-counter');
  });

  it('exports REFUSAL_COUNTER_THRESHOLD = 3 (Co-CTO bias Gigel sweet spot)', () => {
    expect(REFUSAL_COUNTER_THRESHOLD).toBe(3);
  });
});

describe('scheduleAdapter — getSkippedExercises', () => {
  it('empty start returns []', () => {
    expect(getSkippedExercises()).toEqual([]);
  });

  it('malformed JSON returns []', () => {
    localStorage.setItem(SKIPPED_EXERCISES_KEY, '{not-json');
    expect(getSkippedExercises()).toEqual([]);
  });

  it('non-array returns []', () => {
    localStorage.setItem(SKIPPED_EXERCISES_KEY, JSON.stringify({ wrong: 'shape' }));
    expect(getSkippedExercises()).toEqual([]);
  });

  it('dedupes entries', () => {
    localStorage.setItem(SKIPPED_EXERCISES_KEY, JSON.stringify(['A', 'B', 'A', 'C', 'B']));
    expect(getSkippedExercises()).toEqual(['A', 'B', 'C']);
  });

  it('filters non-string + empty entries', () => {
    localStorage.setItem(SKIPPED_EXERCISES_KEY, JSON.stringify(['A', 42, '', null, 'B', undefined]));
    expect(getSkippedExercises()).toEqual(['A', 'B']);
  });
});

describe('scheduleAdapter — setSkippedExercises', () => {
  it('persists deduped + filtered list', () => {
    setSkippedExercises(['A', 'B', 'A', 42, '', 'C']);
    expect(getSkippedExercises()).toEqual(['A', 'B', 'C']);
  });

  it('non-array input persists []', () => {
    setSkippedExercises('not array');
    expect(getSkippedExercises()).toEqual([]);
  });
});

describe('scheduleAdapter — toggleSkippedExercise', () => {
  it('adds exercise when absent', () => {
    const result = toggleSkippedExercise('Cable Curl');
    expect(result).toEqual(['Cable Curl']);
    expect(getSkippedExercises()).toEqual(['Cable Curl']);
  });

  it('removes exercise when present', () => {
    setSkippedExercises(['Cable Curl', 'Lateral Raises']);
    const result = toggleSkippedExercise('Cable Curl');
    expect(result).toEqual(['Lateral Raises']);
    expect(getSkippedExercises()).toEqual(['Lateral Raises']);
  });

  it('idempotent — add then remove yields original empty', () => {
    toggleSkippedExercise('Lat Pulldown');
    toggleSkippedExercise('Lat Pulldown');
    expect(getSkippedExercises()).toEqual([]);
  });

  it('empty / non-string input is no-op', () => {
    setSkippedExercises(['A']);
    expect(toggleSkippedExercise('')).toEqual(['A']);
    expect(toggleSkippedExercise(null)).toEqual(['A']);
    expect(getSkippedExercises()).toEqual(['A']);
  });
});

describe('scheduleAdapter — getRefusalCounter', () => {
  it('empty start returns {}', () => {
    expect(getRefusalCounter()).toEqual({});
  });

  it('malformed JSON returns {}', () => {
    localStorage.setItem(REFUSAL_COUNTER_KEY, 'not-json{');
    expect(getRefusalCounter()).toEqual({});
  });

  it('array stored returns {} (must be object)', () => {
    localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify(['A', 'B']));
    expect(getRefusalCounter()).toEqual({});
  });

  it('filters bad entries — non-numeric, negative, NaN', () => {
    localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify({
      'A': 3, 'B': -1, 'C': 'not-a-number', 'D': 2, '': 5,
    }));
    expect(getRefusalCounter()).toEqual({ A: 3, D: 2 });
  });
});

describe('scheduleAdapter — incrementRefusal', () => {
  it('first increment returns 1', () => {
    expect(incrementRefusal('Cable Curl')).toBe(1);
    expect(getRefusalCounter()).toEqual({ 'Cable Curl': 1 });
  });

  it('multiple increments accumulate per exercise', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    const result = incrementRefusal('Cable Curl');
    expect(result).toBe(3);
    expect(getRefusalCounter()).toEqual({ 'Cable Curl': 3 });
  });

  it('different exercises tracked independently', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Lat Pulldown');
    incrementRefusal('Cable Curl');
    expect(getRefusalCounter()).toEqual({ 'Cable Curl': 2, 'Lat Pulldown': 1 });
  });

  it('empty / non-string input returns 0', () => {
    expect(incrementRefusal('')).toBe(0);
    expect(incrementRefusal(null)).toBe(0);
    expect(getRefusalCounter()).toEqual({});
  });
});

describe('scheduleAdapter — resetRefusalCounter', () => {
  it('removes single entry preserving others', () => {
    incrementRefusal('A');
    incrementRefusal('B');
    incrementRefusal('B');
    resetRefusalCounter('A');
    expect(getRefusalCounter()).toEqual({ B: 2 });
  });

  it('no-op when entry absent', () => {
    incrementRefusal('A');
    resetRefusalCounter('NonExistent');
    expect(getRefusalCounter()).toEqual({ A: 1 });
  });

  it('no-op when invalid input', () => {
    incrementRefusal('A');
    resetRefusalCounter('');
    resetRefusalCounter(null);
    expect(getRefusalCounter()).toEqual({ A: 1 });
  });
});
