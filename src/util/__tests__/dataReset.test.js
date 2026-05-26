// A2 H-1 audit fix — authoritative reset key-clearing tests.
import { describe, it, expect, beforeEach } from 'vitest';
import { clearUserDataKeys, RESET_LEGACY_KEYS } from '../dataReset.js';
import { PRESERVE_ON_RESET_KEYS } from '../dataRegistry.js';

beforeEach(() => {
  localStorage.clear();
});

describe('clearUserDataKeys', () => {
  it('clears all wv2-* Zustand store keys', () => {
    localStorage.setItem('wv2-workout-store', 'x');
    localStorage.setItem('wv2-nutrition-store', 'x');
    localStorage.setItem('wv2-progres-store', 'x');
    clearUserDataKeys();
    expect(localStorage.getItem('wv2-workout-store')).toBeNull();
    expect(localStorage.getItem('wv2-nutrition-store')).toBeNull();
    expect(localStorage.getItem('wv2-progres-store')).toBeNull();
  });

  it('clears ALL unprefixed engine data keys (the A2 H-1 root cause)', () => {
    for (const key of RESET_LEGACY_KEYS) {
      localStorage.setItem(key, JSON.stringify({ v: 1 }));
    }
    clearUserDataKeys();
    for (const key of RESET_LEGACY_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('clears dynamic-prefix runtime keys (aa-cooldown-*, ex-extra-sets-*, ...)', () => {
    localStorage.setItem('aa-cooldown-Bench', '1');
    localStorage.setItem('ex-extra-sets-Squat', '2');
    localStorage.setItem('muscle-extra-chest', '3');
    localStorage.setItem('backup-2026', 'snapshot');
    clearUserDataKeys();
    expect(localStorage.getItem('aa-cooldown-Bench')).toBeNull();
    expect(localStorage.getItem('ex-extra-sets-Squat')).toBeNull();
    expect(localStorage.getItem('muscle-extra-chest')).toBeNull();
    expect(localStorage.getItem('backup-2026')).toBeNull();
  });

  it('PRESERVES account session (firebase-* tokens) so user stays logged in', () => {
    localStorage.setItem('firebase-id-token', 'tok');
    localStorage.setItem('firebase-uid', 'uid');
    localStorage.setItem('firebase-refresh-token', 'rtok');
    localStorage.setItem('firebase-id-token-expiry', '999');
    localStorage.setItem('logs', 'data');
    clearUserDataKeys();
    expect(localStorage.getItem('firebase-id-token')).toBe('tok');
    expect(localStorage.getItem('firebase-uid')).toBe('uid');
    expect(localStorage.getItem('firebase-refresh-token')).toBe('rtok');
    expect(localStorage.getItem('firebase-id-token-expiry')).toBe('999');
    expect(localStorage.getItem('logs')).toBeNull();
  });

  it('PRESERVES device identity + UI prefs (PRESERVE_ON_RESET_KEYS)', () => {
    for (const key of PRESERVE_ON_RESET_KEYS) {
      localStorage.setItem(key, 'keep');
    }
    localStorage.setItem('coach-decisions', 'wipe-me');
    clearUserDataKeys();
    for (const key of PRESERVE_ON_RESET_KEYS) {
      expect(localStorage.getItem(key)).toBe('keep');
    }
    expect(localStorage.getItem('coach-decisions')).toBeNull();
  });

  it('returns the count of keys removed', () => {
    localStorage.setItem('wv2-workout-store', 'x');
    localStorage.setItem('logs', 'x');
    localStorage.setItem('device-id', 'keep'); // preserved, not counted
    const removed = clearUserDataKeys();
    expect(removed).toBe(2);
  });
});
