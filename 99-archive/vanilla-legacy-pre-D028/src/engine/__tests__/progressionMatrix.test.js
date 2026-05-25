import { describe, it, expect } from 'vitest';
import {
  PROGRESSION_TIERS,
  getProgressionTier,
  getProgressionInterval,
  shouldProgressThisSession,
  getCompoundIncrement,
  getIsolationIncrement,
  isSprinterCapActive,
  getDeloadSkipWarning,
} from '../progressionMatrix.js';

describe('progressionMatrix — getProgressionTier (F-NEW-2 bands)', () => {
  it('returns BEGINNER for 0 sessions', () => {
    expect(getProgressionTier(0)).toBe(PROGRESSION_TIERS.BEGINNER);
  });

  it('returns BEGINNER for 10 sessions (upper bound inclusive)', () => {
    expect(getProgressionTier(10)).toBe(PROGRESSION_TIERS.BEGINNER);
  });

  it('returns INTERMEDIATE for 11 sessions (lower bound)', () => {
    expect(getProgressionTier(11)).toBe(PROGRESSION_TIERS.INTERMEDIATE);
  });

  it('returns INTERMEDIATE for 50 sessions (upper bound inclusive)', () => {
    expect(getProgressionTier(50)).toBe(PROGRESSION_TIERS.INTERMEDIATE);
  });

  it('returns ADVANCED for 51 sessions (lower bound)', () => {
    expect(getProgressionTier(51)).toBe(PROGRESSION_TIERS.ADVANCED);
  });

  it('returns ADVANCED for 200 sessions', () => {
    expect(getProgressionTier(200)).toBe(PROGRESSION_TIERS.ADVANCED);
  });

  it('falls back to BEGINNER on garbage input (defensive)', () => {
    expect(getProgressionTier(NaN)).toBe(PROGRESSION_TIERS.BEGINNER);
    expect(getProgressionTier(-5)).toBe(PROGRESSION_TIERS.BEGINNER);
    expect(getProgressionTier(undefined)).toBe(PROGRESSION_TIERS.BEGINNER);
    expect(getProgressionTier(null)).toBe(PROGRESSION_TIERS.BEGINNER);
  });
});

describe('progressionMatrix — getProgressionInterval (F-NEW-2 frequency)', () => {
  it('Beginner: every session', () => {
    expect(getProgressionInterval(PROGRESSION_TIERS.BEGINNER)).toBe(1);
  });

  it('Intermediate: every 2 sessions (lower bound of 2-3 window)', () => {
    expect(getProgressionInterval(PROGRESSION_TIERS.INTERMEDIATE)).toBe(2);
  });

  it('Advanced: every 4 sessions (lower bound of 4-6 window)', () => {
    expect(getProgressionInterval(PROGRESSION_TIERS.ADVANCED)).toBe(4);
  });
});

describe('progressionMatrix — shouldProgressThisSession', () => {
  it('Beginner progresses every session (sessionsSinceLast >= 1)', () => {
    expect(shouldProgressThisSession(5, 1)).toBe(true);
    expect(shouldProgressThisSession(5, 0)).toBe(false);
  });

  it('Intermediate holds for 1 session, progresses on 2nd', () => {
    expect(shouldProgressThisSession(25, 1)).toBe(false);
    expect(shouldProgressThisSession(25, 2)).toBe(true);
    expect(shouldProgressThisSession(25, 3)).toBe(true);
  });

  it('Advanced waits 4 sessions before progressing', () => {
    expect(shouldProgressThisSession(100, 3)).toBe(false);
    expect(shouldProgressThisSession(100, 4)).toBe(true);
    expect(shouldProgressThisSession(100, 6)).toBe(true);
  });
});

describe('progressionMatrix — Sprinter Cap modifier (Q-0231)', () => {
  it('isSprinterCapActive true for "sprinter"', () => {
    expect(isSprinterCapActive('sprinter')).toBe(true);
  });

  it('isSprinterCapActive case-insensitive ("Sprinter", "SPRINTER")', () => {
    expect(isSprinterCapActive('Sprinter')).toBe(true);
    expect(isSprinterCapActive('SPRINTER')).toBe(true);
    expect(isSprinterCapActive('  sprinter  ')).toBe(true);
  });

  it('isSprinterCapActive false for marathon / strategic / unknown / null', () => {
    expect(isSprinterCapActive('marathon')).toBe(false);
    expect(isSprinterCapActive('strategic')).toBe(false);
    expect(isSprinterCapActive('unknown')).toBe(false);
    expect(isSprinterCapActive(null)).toBe(false);
    expect(isSprinterCapActive(undefined)).toBe(false);
    expect(isSprinterCapActive('')).toBe(false);
  });

  it('compound increment defaults to 2.5 kg on non-sprinter profiles', () => {
    expect(getCompoundIncrement('marathon')).toBe(2.5);
    expect(getCompoundIncrement('strategic')).toBe(2.5);
    expect(getCompoundIncrement(null)).toBe(2.5);
  });

  it('compound increment caps at 1.0 kg under Sprinter Cap', () => {
    expect(getCompoundIncrement('sprinter')).toBe(1.0);
  });

  it('isolation defaults to 0.5 kg with reps-bump-first ladder', () => {
    expect(getIsolationIncrement('marathon')).toEqual({ kg: 0.5, repsBumpFirst: true });
    expect(getIsolationIncrement(null)).toEqual({ kg: 0.5, repsBumpFirst: true });
  });

  it('isolation forces reps-bump (zero kg) under Sprinter Cap', () => {
    expect(getIsolationIncrement('sprinter')).toEqual({ kg: 0, repsBumpFirst: true });
  });
});

describe('progressionMatrix — Deload skip warning (Bugatti tone LOCKED)', () => {
  it('returns the LOCKED wording verbatim per HANDOVER §22 F-NEW-2', () => {
    expect(getDeloadSkipWarning()).toBe(
      'Saptamana de deload a trecut neutilizata. Sesiunea de azi merge mai bine la RPE 6-7 — corpul recupereaza in miscare, nu doar in repaus.'
    );
  });

  it('warning contains no procentage / numeric leak (anti-RE strict)', () => {
    const w = getDeloadSkipWarning();
    expect(w).not.toMatch(/\d+%/);
    expect(w).not.toMatch(/deviation|adherence/i);
  });
});
