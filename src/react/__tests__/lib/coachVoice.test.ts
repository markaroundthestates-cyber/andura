// ══ COACH VOICE TESTS — Lookup Library + coachPick() Selector ════════════
// Per spec task_03 §4 B — deterministic seed + diacritics rule.

import { describe, it, expect, beforeEach } from 'vitest';
import { coachPick, COACH_VOICE, COACH_VOICE_SAFE_FALLBACK } from '../../lib/coachVoice';

// Wave E4 — coachPick now prefers per-locale pools from the i18n bundle;
// tests here assert against the canonical RO COACH_VOICE constant, so pin
// RO before each test. EN coverage is verified separately by
// src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch {}
  _resetI18nCache();
  setLocale('ro');
});

describe('COACH_VOICE library shape', () => {
  it('preset bucket non-empty', () => {
    expect(COACH_VOICE.preset.length).toBeGreaterThan(0);
  });

  it('postUsor / postPotrivit / postGreu all present', () => {
    expect(COACH_VOICE.postUsor.length).toBeGreaterThan(0);
    expect(COACH_VOICE.postPotrivit.length).toBeGreaterThan(0);
    expect(COACH_VOICE.postGreu.length).toBeGreaterThan(0);
  });

  it('endSession nested by rating (usor/potrivit/greu)', () => {
    expect(COACH_VOICE.endSession.usor.length).toBeGreaterThan(0);
    expect(COACH_VOICE.endSession.potrivit.length).toBeGreaterThan(0);
    expect(COACH_VOICE.endSession.greu.length).toBeGreaterThan(0);
  });

  it('rest + transition + reflectie + preview present (task_10 rename endExercise→transition)', () => {
    expect(COACH_VOICE.rest.length).toBeGreaterThan(0);
    expect(COACH_VOICE.transition.length).toBeGreaterThan(0);
    expect(COACH_VOICE.reflectie.length).toBeGreaterThan(0);
    expect(COACH_VOICE.preview.length).toBeGreaterThan(0);
  });

  it('endExercise category removed (task_10 rename → transition)', () => {
    expect('endExercise' in COACH_VOICE).toBe(false);
  });

  it('transition category coachPick deterministic seed=0', () => {
    expect(coachPick('transition', undefined, 0)).toBe(COACH_VOICE.transition[0]);
  });
});

describe('coachPick — deterministic seed', () => {
  it('seed=0 returns first item preset', () => {
    expect(coachPick('preset', undefined, 0)).toBe(COACH_VOICE.preset[0]);
  });

  it('seed=0 returns first item endSession.usor', () => {
    expect(coachPick('endSession', 'usor', 0)).toBe(COACH_VOICE.endSession.usor[0]);
  });

  it('seed=1 returns second item postPotrivit', () => {
    expect(coachPick('postPotrivit', undefined, 1)).toBe(COACH_VOICE.postPotrivit[1]);
  });

  it('seed modulo pool length wraps correctly', () => {
    const poolLen = COACH_VOICE.preset.length;
    const seed = poolLen * 3 + 2;
    expect(coachPick('preset', undefined, seed)).toBe(COACH_VOICE.preset[2]);
  });

  it('seed deterministic — same seed returns same item across calls', () => {
    const a = coachPick('rest', undefined, 5);
    const b = coachPick('rest', undefined, 5);
    expect(a).toBe(b);
  });

  it('seed deterministic endSession.greu', () => {
    expect(coachPick('endSession', 'greu', 0)).toBe(COACH_VOICE.endSession.greu[0]);
    expect(coachPick('endSession', 'greu', 1)).toBe(COACH_VOICE.endSession.greu[1]);
  });
});

describe('coachPick — fallback (LOW-CODE-11 fix: safe fallback NU empty string)', () => {
  it('SAFE_FALLBACK constant is non-empty string', () => {
    expect(COACH_VOICE_SAFE_FALLBACK).toBeTruthy();
    expect(typeof COACH_VOICE_SAFE_FALLBACK).toBe('string');
    expect(COACH_VOICE_SAFE_FALLBACK.length).toBeGreaterThan(0);
  });

  it('endSession fara rating returns safe fallback (NU empty string)', () => {
    const result = coachPick('endSession');
    expect(result).toBe(COACH_VOICE_SAFE_FALLBACK);
    expect(result).not.toBe('');
  });

  it('endSession cu rating necunoscut returns safe fallback (NU empty string)', () => {
    // @ts-expect-error testing runtime fallback on invalid rating
    const result = coachPick('endSession', 'usoara', 0);
    expect(result).toBe(COACH_VOICE_SAFE_FALLBACK);
    expect(result).not.toBe('');
  });

  it('category necunoscuta returns safe fallback (NU empty string)', () => {
    // @ts-expect-error testing runtime fallback on invalid category
    const result = coachPick('unknown-cat', undefined, 0);
    expect(result).toBe(COACH_VOICE_SAFE_FALLBACK);
    expect(result).not.toBe('');
  });

  it('SAFE_FALLBACK respects no-diacritics rule (D-LEGACY-064)', () => {
    expect(/[ăâîșțĂÂÎȘȚşţŞŢ]/.test(COACH_VOICE_SAFE_FALLBACK)).toBe(false);
  });

  it('known categories return library pool item (NU safe fallback)', () => {
    const result = coachPick('preset', undefined, 0);
    expect(result).not.toBe(COACH_VOICE_SAFE_FALLBACK);
    expect(COACH_VOICE.preset).toContain(result);
  });
});

describe('coachPick — Math.random default mode', () => {
  it('without seed returns valid pool item (non-empty)', () => {
    const result = coachPick('preset');
    expect(COACH_VOICE.preset).toContain(result);
  });

  it('without seed la endSession returns valid nested pool item', () => {
    const result = coachPick('endSession', 'potrivit');
    expect(COACH_VOICE.endSession.potrivit).toContain(result);
  });
});

describe('Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no Romanian diacritics in entire library', () => {
    const allStrings = JSON.stringify(COACH_VOICE);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(allStrings)).toBe(false);
  });

  it('no s-cedilla / t-cedilla edge variants', () => {
    const allStrings = JSON.stringify(COACH_VOICE);
    expect(/[şţŞŢ]/.test(allStrings)).toBe(false);
  });

  it('em-dash converted la standard hyphen', () => {
    const allStrings = JSON.stringify(COACH_VOICE);
    expect(/—/.test(allStrings)).toBe(false);
  });
});
