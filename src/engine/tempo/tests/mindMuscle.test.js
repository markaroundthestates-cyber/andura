import { describe, it, expect } from 'vitest';
import {
  resolveMindMuscleByTier,
  detectImplicitAcquisition,
  detectExplicitAcquisition,
  resolveSuppressionMode,
  evaluateSuppression,
  composeMindMuscleState,
} from '../mindMuscle.js';
import { SUPPRESSION_MODE, FREQUENCY_THRESHOLDS } from '../constants.js';

describe('resolveMindMuscleByTier — Cluster C5 Q5=C verbatim', () => {
  it('T0 → OFF (calibration noise anti-overfit)', () => {
    expect(resolveMindMuscleByTier('T0')).toBe(false);
  });

  it('T1 → active (profile-typing-aware)', () => {
    expect(resolveMindMuscleByTier('T1')).toBe(true);
  });

  it('T2 → active (adaptive depth)', () => {
    expect(resolveMindMuscleByTier('T2')).toBe(true);
  });

  it('null/undefined tier → conservative T0 default OFF', () => {
    expect(resolveMindMuscleByTier(null)).toBe(false);
    expect(resolveMindMuscleByTier(undefined)).toBe(false);
  });

  it('unknown tier string → conservative T0 default OFF', () => {
    expect(resolveMindMuscleByTier('T99')).toBe(false);
  });
});

describe('detectImplicitAcquisition — Cluster C7 Q9=D N=10 dual signal', () => {
  it('insufficient sessions (<N=10) → not acquired', () => {
    const r = detectImplicitAcquisition({ recentSessionsForMovement: [] });
    expect(r.acquiredImplicit).toBe(false);
    expect(r.sessionsCount).toBe(0);
  });

  it('exactly N=10 sessions all clean form → acquired', () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const r = detectImplicitAcquisition({ recentSessionsForMovement: sessions });
    expect(r.acquiredImplicit).toBe(true);
    expect(r.formBreakdownRate).toBe(0);
    expect(r.rationale).toContain('implicit_acquisition_n_10');
  });

  it('N=10 cu form breakdown rate >= threshold (20%) → not acquired', () => {
    // 3 form breakdowns / 10 = 30% > 20% threshold
    const sessions = [
      { formBreakdown: true },
      { formBreakdown: true },
      { formBreakdown: true },
      ...Array.from({ length: 7 }, () => ({ formBreakdown: false })),
    ];
    const r = detectImplicitAcquisition({ recentSessionsForMovement: sessions });
    expect(r.acquiredImplicit).toBe(false);
    expect(r.formBreakdownRate).toBeCloseTo(0.30, 2);
  });

  it('N=10 cu rate just below threshold (10%) → acquired', () => {
    const sessions = [
      { formBreakdown: true },
      ...Array.from({ length: 9 }, () => ({ formBreakdown: false })),
    ];
    const r = detectImplicitAcquisition({ recentSessionsForMovement: sessions });
    expect(r.acquiredImplicit).toBe(true);
    expect(r.formBreakdownRate).toBeCloseTo(0.10, 2);
  });

  it('N>10 sessions: only first 10 evaluated (rolling window per V1)', () => {
    const sessions = [
      ...Array.from({ length: 10 }, () => ({ formBreakdown: false })),
      // Older sessions ignored (sessions[10..] outside window)
      ...Array.from({ length: 5 }, () => ({ formBreakdown: true })),
    ];
    const r = detectImplicitAcquisition({ recentSessionsForMovement: sessions });
    expect(r.acquiredImplicit).toBe(true);
    expect(r.sessionsCount).toBe(10);
  });

  it('non-array input → safe defaults', () => {
    const r = detectImplicitAcquisition({ recentSessionsForMovement: null });
    expect(r.acquiredImplicit).toBe(false);
    expect(r.sessionsCount).toBe(0);
  });
});

describe('detectExplicitAcquisition — Cluster C7 Q9 user toggle "știu"', () => {
  it('movementId în user toggle list → explicit acquired', () => {
    expect(detectExplicitAcquisition({
      movementId:                'back_squat',
      userKnowToggleMovements:   ['back_squat', 'deadlift'],
    })).toBe(true);
  });

  it('movementId NOT în list → not acquired', () => {
    expect(detectExplicitAcquisition({
      movementId:                'bench_press',
      userKnowToggleMovements:   ['back_squat'],
    })).toBe(false);
  });

  it('empty list → not acquired', () => {
    expect(detectExplicitAcquisition({
      movementId:                'back_squat',
      userKnowToggleMovements:   [],
    })).toBe(false);
  });

  it('missing movementId → not acquired (defensive)', () => {
    expect(detectExplicitAcquisition({
      userKnowToggleMovements: ['back_squat'],
    })).toBe(false);
  });

  it('non-array userKnowToggleMovements → not acquired', () => {
    expect(detectExplicitAcquisition({
      movementId:                'back_squat',
      userKnowToggleMovements:   null,
    })).toBe(false);
  });
});

describe('resolveSuppressionMode — Cluster C17 Q17=C tier-aware', () => {
  it('T0 → HARD suppression (binary on/off)', () => {
    expect(resolveSuppressionMode('T0')).toBe(SUPPRESSION_MODE.HARD);
  });

  it('T1 → HARD suppression', () => {
    expect(resolveSuppressionMode('T1')).toBe(SUPPRESSION_MODE.HARD);
  });

  it('T2 → SOFT_AUTO_RETIRE (N=10 implicit + user re-activate)', () => {
    expect(resolveSuppressionMode('T2')).toBe(SUPPRESSION_MODE.SOFT_AUTO_RETIRE);
  });

  it('null tier → conservative HARD default', () => {
    expect(resolveSuppressionMode(null)).toBe(SUPPRESSION_MODE.HARD);
  });
});

describe('evaluateSuppression — hard T0/T1 vs soft T2 logic Q17=C', () => {
  it('T0 + explicit toggle → suppressed (hard)', () => {
    const r = evaluateSuppression({
      tier:               'T0',
      acquiredExplicit:   true,
      acquiredImplicit:   false,
    });
    expect(r.suppressed).toBe(true);
    expect(r.mode).toBe(SUPPRESSION_MODE.HARD);
    expect(r.rationale).toContain('explicit_user_toggle');
  });

  it('T0 + implicit ONLY (NO explicit) → NOT suppressed (hard mode ignores implicit)', () => {
    const r = evaluateSuppression({
      tier:               'T0',
      acquiredExplicit:   false,
      acquiredImplicit:   true,
    });
    expect(r.suppressed).toBe(false);
    expect(r.mode).toBe(SUPPRESSION_MODE.HARD);
  });

  it('T1 same hard mode behavior', () => {
    const r = evaluateSuppression({
      tier:               'T1',
      acquiredExplicit:   true,
      acquiredImplicit:   false,
    });
    expect(r.suppressed).toBe(true);
    expect(r.mode).toBe(SUPPRESSION_MODE.HARD);
  });

  it('T2 + explicit → suppressed (soft auto-retire)', () => {
    const r = evaluateSuppression({
      tier:               'T2',
      acquiredExplicit:   true,
      acquiredImplicit:   false,
    });
    expect(r.suppressed).toBe(true);
    expect(r.mode).toBe(SUPPRESSION_MODE.SOFT_AUTO_RETIRE);
  });

  it('T2 + implicit ONLY → suppressed (soft auto-retire respects implicit)', () => {
    const r = evaluateSuppression({
      tier:               'T2',
      acquiredExplicit:   false,
      acquiredImplicit:   true,
    });
    expect(r.suppressed).toBe(true);
    expect(r.rationale).toContain('implicit');
  });

  it('T2 + neither → not suppressed', () => {
    const r = evaluateSuppression({
      tier:               'T2',
      acquiredExplicit:   false,
      acquiredImplicit:   false,
    });
    expect(r.suppressed).toBe(false);
  });
});

describe('composeMindMuscleState — bundle integration', () => {
  it('T0 default → inactive, hard suppression mode, no acquisition', () => {
    const r = composeMindMuscleState({
      tier:                       'T0',
      movementId:                 'back_squat',
      userKnowToggleMovements:    [],
      recentSessionsForMovement:  [],
      deloadOverrideActive:       false,
    });
    expect(r.active).toBe(false);
    expect(r.suppressionMode).toBe(SUPPRESSION_MODE.HARD);
    expect(r.acquiredExplicit).toBe(false);
    expect(r.acquiredImplicit).toBe(false);
    expect(r.suppressedForMovement).toBe(false);
  });

  it('T0 + Deload override Q12=D → active despite tier OFF default', () => {
    const r = composeMindMuscleState({
      tier:                       'T0',
      movementId:                 'back_squat',
      deloadOverrideActive:       true,
    });
    expect(r.active).toBe(true);
    expect(r.rationale).toContain('deload_override_unlock');
  });

  it('T1 + explicit toggle for movement → active globally but suppressed for movement', () => {
    const r = composeMindMuscleState({
      tier:                       'T1',
      movementId:                 'back_squat',
      userKnowToggleMovements:    ['back_squat'],
      recentSessionsForMovement:  [],
    });
    expect(r.active).toBe(true);
    expect(r.acquiredExplicit).toBe(true);
    expect(r.suppressedForMovement).toBe(true);
    expect(r.rationale).toContain('suppressed_for_movement');
  });

  it('T2 + N=10 implicit acquisition → soft auto-retire suppression', () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const r = composeMindMuscleState({
      tier:                       'T2',
      movementId:                 'deadlift',
      recentSessionsForMovement:  sessions,
    });
    expect(r.acquiredImplicit).toBe(true);
    expect(r.suppressedForMovement).toBe(true);
    expect(r.suppressionMode).toBe(SUPPRESSION_MODE.SOFT_AUTO_RETIRE);
  });

  it('T1 + implicit acquisition → NOT suppressed (hard mode ignores implicit)', () => {
    const sessions = Array.from({ length: 10 }, () => ({ formBreakdown: false }));
    const r = composeMindMuscleState({
      tier:                       'T1',
      movementId:                 'deadlift',
      recentSessionsForMovement:  sessions,
    });
    expect(r.acquiredImplicit).toBe(true);
    expect(r.suppressedForMovement).toBe(false);
  });
});

describe('Convergence Guard cross-cutting reference invariant', () => {
  it('mind-muscle gating respects ADR 009 §AMENDMENT tier transitions cross-cutting', () => {
    // Verify mind-muscle state composition does NOT duplicate Convergence Guard
    // logic — it consumes tier as input only. ADR 009 amendment is canonical
    // SSOT (referenced via crossEngineHooks.getConvergenceGuardReference).
    const t0 = composeMindMuscleState({ tier: 'T0' });
    const t1 = composeMindMuscleState({ tier: 'T1' });
    const t2 = composeMindMuscleState({ tier: 'T2' });
    expect(t0.active).toBe(false);
    expect(t1.active).toBe(true);
    expect(t2.active).toBe(true);
    // Suppression mode differs T0/T1 vs T2 per Q17=C
    expect(t0.suppressionMode).toBe(SUPPRESSION_MODE.HARD);
    expect(t2.suppressionMode).toBe(SUPPRESSION_MODE.SOFT_AUTO_RETIRE);
  });
});

describe('Frequency thresholds invariant — N=10 default', () => {
  it('FREQUENCY_THRESHOLDS exposes N=10 default per Cluster C7', () => {
    expect(FREQUENCY_THRESHOLDS.acquisitionSessionsImplicitDefault).toBe(10);
  });

  it('formBreakdownRateThreshold = 0.20 (20% threshold)', () => {
    expect(FREQUENCY_THRESHOLDS.formBreakdownRateThreshold).toBe(0.20);
  });
});
