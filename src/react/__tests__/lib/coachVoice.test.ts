// ══ COACH VOICE TESTS — Lookup Library + coachPick() Selector ════════════
// Per spec task_03 §4 B — deterministic seed + diacritics rule.

import { describe, it, expect } from 'vitest';
import { coachPick, COACH_VOICE } from '../../lib/coachVoice';

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

describe('coachPick — fallback', () => {
  it('endSession fara rating returns empty string', () => {
    expect(coachPick('endSession')).toBe('');
  });

  it('endSession cu rating necunoscut TypeScript prevent at compile — runtime empty', () => {
    // @ts-expect-error testing runtime fallback on invalid rating
    expect(coachPick('endSession', 'usoara', 0)).toBe('');
  });

  it('category necunoscuta returns empty string', () => {
    // @ts-expect-error testing runtime fallback on invalid category
    expect(coachPick('unknown-cat', undefined, 0)).toBe('');
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
