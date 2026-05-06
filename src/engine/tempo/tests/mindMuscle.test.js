import { describe, it, expect } from 'vitest';
import {
  resolveTier,
  isMindMuscleActive,
  evaluateAdaptiveFrequency,
  suppressionModeForTier,
  evaluateMindMuscleSuppression,
} from '../mindMuscle.js';
import {
  CALIBRATION_TIERS,
  SUPPRESSION_MODE,
  ADAPTIVE_FREQUENCY,
} from '../constants.js';

describe('resolveTier — shared utility cross-ref ADR 009 amendment', () => {
  it('T0 / T1 / T2 case-insensitive', () => {
    expect(resolveTier({ profileTier: 'T0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier({ profileTier: 't1' })).toBe(CALIBRATION_TIERS.T1);
    expect(resolveTier({ profileTier: 'T2' })).toBe(CALIBRATION_TIERS.T2);
  });
  it('numeric strings 0/1/2', () => {
    expect(resolveTier({ profileTier: '0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier({ profileTier: '1' })).toBe(CALIBRATION_TIERS.T1);
  });
  it('missing → T0 cold start defensive', () => {
    expect(resolveTier({})).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier(null)).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier({ profileTier: 'foo' })).toBe(CALIBRATION_TIERS.T0);
  });
});

describe('isMindMuscleActive — Cluster C5 Q5=C tier-aware', () => {
  it('T0 cold start → OFF (calibration noise high anti-overfit)', () => {
    expect(isMindMuscleActive({ tier: CALIBRATION_TIERS.T0 })).toBe(false);
  });
  it('T1 established → active (profile-typing-aware)', () => {
    expect(isMindMuscleActive({ tier: CALIBRATION_TIERS.T1 })).toBe(true);
  });
  it('T2 → active', () => {
    expect(isMindMuscleActive({ tier: CALIBRATION_TIERS.T2 })).toBe(true);
  });
  it('Cluster D12 Q12=D Deload week unlock override — T0 + deload → active', () => {
    expect(isMindMuscleActive({
      tier: CALIBRATION_TIERS.T0,
      deloadWeekUnlock: true,
    })).toBe(true);
  });
  it('Deload unlock applies regardless tier (T0 / T1 / T2)', () => {
    for (const t of Object.values(CALIBRATION_TIERS)) {
      expect(isMindMuscleActive({ tier: t, deloadWeekUnlock: true })).toBe(true);
    }
  });
});

describe('evaluateAdaptiveFrequency — Cluster C7 Q7=D + Q9=D dual signal', () => {
  it('Q9 explicit user toggle "știu" → acquired user_toggle_explicit_stiu', () => {
    const r = evaluateAdaptiveFrequency({
      userToggleAcquired: true,
      recentSessionsForMovement: [],
    });
    expect(r.shouldSurface).toBe(false);
    expect(r.acquiredVia).toBe('user_toggle_explicit_stiu');
  });
  it('Q9 implicit N=10 sessions clean → acquired implicit_n10_sessions_clean', () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const r = evaluateAdaptiveFrequency({ recentSessionsForMovement: sessions });
    expect(r.shouldSurface).toBe(false);
    expect(r.acquiredVia).toBe('implicit_n10_sessions_clean');
  });
  it('N=9 sessions clean (insufficient) → still surface', () => {
    const sessions = Array.from({ length: 9 }, () => ({ formBreakdown: false }));
    const r = evaluateAdaptiveFrequency({ recentSessionsForMovement: sessions });
    expect(r.shouldSurface).toBe(true);
    expect(r.acquiredVia).toBe(null);
  });
  it('N=10 sessions cu form breakdown în window → still surface (NU acquired)', () => {
    const sessions = [
      { formBreakdown: false },
      { formBreakdown: false },
      { formBreakdown: true },  // breaks the streak
      ...Array.from({ length: 7 }, () => ({ formBreakdown: false })),
    ];
    const r = evaluateAdaptiveFrequency({ recentSessionsForMovement: sessions });
    expect(r.shouldSurface).toBe(true);
  });
  it('Empty / null sessions → still surface defensive', () => {
    expect(evaluateAdaptiveFrequency({ recentSessionsForMovement: [] }).shouldSurface).toBe(true);
    expect(evaluateAdaptiveFrequency({ recentSessionsForMovement: null }).shouldSurface).toBe(true);
  });
  it('ADAPTIVE_FREQUENCY.acquisitionImplicitN = 10 verbatim Q9=D', () => {
    expect(ADAPTIVE_FREQUENCY.acquisitionImplicitN).toBe(10);
  });
});

describe('suppressionModeForTier — Cluster C17 Q17=C verbatim', () => {
  it('T0 → HARD suppression', () => {
    expect(suppressionModeForTier(CALIBRATION_TIERS.T0)).toBe(SUPPRESSION_MODE.HARD);
  });
  it('T1 → HARD suppression', () => {
    expect(suppressionModeForTier(CALIBRATION_TIERS.T1)).toBe(SUPPRESSION_MODE.HARD);
  });
  it('T2 → SOFT_AUTO_RETIRE (user can re-activate)', () => {
    expect(suppressionModeForTier(CALIBRATION_TIERS.T2)).toBe(SUPPRESSION_MODE.SOFT_AUTO_RETIRE);
  });
});

describe('evaluateMindMuscleSuppression — full Cluster C aggregate', () => {
  it('T0 + no acquisition → mind-muscle OFF, surface, HARD suppression mode', () => {
    const r = evaluateMindMuscleSuppression({
      tier: CALIBRATION_TIERS.T0,
      userToggleAcquired: false,
      recentSessionsForMovement: [],
    });
    expect(r.mindMuscleActive).toBe(false);
    expect(r.cueShouldSurface).toBe(true);
    expect(r.suppressionMode).toBe(SUPPRESSION_MODE.HARD);
    expect(r.acquiredVia).toBe(null);
  });
  it('T1 + explicit "știu" → active (T1+) + acquired + cue suppressed', () => {
    const r = evaluateMindMuscleSuppression({
      tier: CALIBRATION_TIERS.T1,
      userToggleAcquired: true,
    });
    expect(r.mindMuscleActive).toBe(true);
    expect(r.cueShouldSurface).toBe(false);
    expect(r.acquiredVia).toBe('user_toggle_explicit_stiu');
  });
  it('T2 + N=10 sessions clean → acquired + soft auto-retire', () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const r = evaluateMindMuscleSuppression({
      tier: CALIBRATION_TIERS.T2,
      recentSessionsForMovement: sessions,
    });
    expect(r.mindMuscleActive).toBe(true);
    expect(r.cueShouldSurface).toBe(false);
    expect(r.suppressionMode).toBe(SUPPRESSION_MODE.SOFT_AUTO_RETIRE);
    expect(r.acquiredVia).toBe('implicit_n10_sessions_clean');
  });
  it('Deload week unlock + T0 → active despite tier (Q12=D override)', () => {
    const r = evaluateMindMuscleSuppression({
      tier: CALIBRATION_TIERS.T0,
      deloadWeekUnlock: true,
    });
    expect(r.mindMuscleActive).toBe(true);
  });
});
