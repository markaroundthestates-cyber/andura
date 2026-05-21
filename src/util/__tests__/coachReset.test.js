import { describe, it, expect, beforeEach } from 'vitest';
import { resetCoachState, COACH_STATE_KEYS, COACH_STATE_PREFIXES } from '../coachReset.js';

beforeEach(() => {
  localStorage.clear();
});

describe('resetCoachState', () => {
  it('clears all COACH_STATE_KEYS that exist', () => {
    for (const key of COACH_STATE_KEYS) {
      localStorage.setItem(key, JSON.stringify({ foo: 'bar' }));
    }
    const result = resetCoachState();
    expect(result.keysCleared).toBe(COACH_STATE_KEYS.length);
    for (const key of COACH_STATE_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('only counts keys that actually existed', () => {
    localStorage.setItem('coach-decisions', JSON.stringify([{ id: 'x' }]));
    const result = resetCoachState();
    expect(result.keysCleared).toBe(1);
  });

  it('removes prefix-keyed entries (aa-cooldown-*)', () => {
    localStorage.setItem('aa-cooldown-Bench Press', String(Date.now()));
    localStorage.setItem('aa-cooldown-Squat', String(Date.now()));
    const result = resetCoachState();
    expect(result.prefixKeysCleared).toBe(2);
    expect(localStorage.getItem('aa-cooldown-Bench Press')).toBeNull();
    expect(localStorage.getItem('aa-cooldown-Squat')).toBeNull();
  });

  it('preserves non-coach keys (workout logs, weights, profile)', () => {
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Bench' }]));
    localStorage.setItem('weights', JSON.stringify({ '2026-05-21': 80 }));
    localStorage.setItem('user-profile', JSON.stringify({ name: 'Daniel' }));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    localStorage.setItem('phase-log', JSON.stringify([{ date: '2026-05-01', phase: 'CUT' }]));

    resetCoachState();

    expect(JSON.parse(localStorage.getItem('logs') || 'null')).toEqual([{ ex: 'Bench' }]);
    expect(JSON.parse(localStorage.getItem('weights') || 'null')).toEqual({ '2026-05-21': 80 });
    expect(JSON.parse(localStorage.getItem('user-profile') || 'null')).toEqual({ name: 'Daniel' });
    expect(JSON.parse(localStorage.getItem('phase-override') || 'null')).toBe('CUT');
    expect(JSON.parse(localStorage.getItem('phase-log') || 'null')).toEqual([
      { date: '2026-05-01', phase: 'CUT' },
    ]);
  });

  it('is idempotent (second call no-op)', () => {
    localStorage.setItem('coach-decisions', JSON.stringify([{ id: 'x' }]));
    resetCoachState();
    const result2 = resetCoachState();
    expect(result2.keysCleared).toBe(0);
    expect(result2.prefixKeysCleared).toBe(0);
  });

  it('COACH_STATE_KEYS + COACH_STATE_PREFIXES are frozen', () => {
    expect(Object.isFrozen(COACH_STATE_KEYS)).toBe(true);
    expect(Object.isFrozen(COACH_STATE_PREFIXES)).toBe(true);
  });
});
