import { describe, it, expect } from 'vitest';
import {
  resolveCalibrationTier,
  magnitudeCeilingForTier,
  countConsecutiveGreenSessions,
  hasNoRecoveryRedFlags,
  isHighIntensityPhase,
  evaluateUpGating,
  computeAdjustmentDirection,
} from '../bidirectionalAdjustment.js';
import {
  ADJUSTMENT_DIRECTION,
  ADJUSTMENT_MAGNITUDE,
  CALIBRATION_TIERS,
} from '../constants.js';

describe('resolveCalibrationTier — §9.3.4 Cluster 4 Q13=B tier-aware', () => {
  it('T0 / T1 / T2 case-insensitive', () => {
    expect(resolveCalibrationTier({ profileTier: 'T0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveCalibrationTier({ profileTier: 't0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveCalibrationTier({ profileTier: 'T1' })).toBe(CALIBRATION_TIERS.T1);
    expect(resolveCalibrationTier({ profileTier: 'T2' })).toBe(CALIBRATION_TIERS.T2);
  });
  it('numeric strings 0/1/2 → T0/T1/T2', () => {
    expect(resolveCalibrationTier({ profileTier: '0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveCalibrationTier({ profileTier: '1' })).toBe(CALIBRATION_TIERS.T1);
  });
  it('missing → T0 cold start defensive default', () => {
    expect(resolveCalibrationTier({})).toBe(CALIBRATION_TIERS.T0);
    expect(resolveCalibrationTier(null)).toBe(CALIBRATION_TIERS.T0);
    expect(resolveCalibrationTier({ profileTier: 'foo' })).toBe(CALIBRATION_TIERS.T0);
  });
});

describe('magnitudeCeilingForTier — Q13=B verbatim T0 ±10% T1+ ±15%', () => {
  it('T0 cold start → 0.10 (±10% conservative)', () => {
    expect(magnitudeCeilingForTier(CALIBRATION_TIERS.T0)).toBe(ADJUSTMENT_MAGNITUDE.magnitudeT0);
    expect(magnitudeCeilingForTier(CALIBRATION_TIERS.T0)).toBeCloseTo(0.10, 5);
  });
  it('T1 established → 0.15 (±15% full range)', () => {
    expect(magnitudeCeilingForTier(CALIBRATION_TIERS.T1)).toBe(ADJUSTMENT_MAGNITUDE.magnitudeT1Plus);
    expect(magnitudeCeilingForTier(CALIBRATION_TIERS.T1)).toBeCloseTo(0.15, 5);
  });
  it('T2 → 0.15 (T1+ same range)', () => {
    expect(magnitudeCeilingForTier(CALIBRATION_TIERS.T2)).toBe(ADJUSTMENT_MAGNITUDE.magnitudeT1Plus);
  });
});

describe('countConsecutiveGreenSessions — UP gating condition 1 N≥3', () => {
  it('empty / null → 0', () => {
    expect(countConsecutiveGreenSessions([])).toBe(0);
    expect(countConsecutiveGreenSessions(null)).toBe(0);
  });
  it('3 consecutive green → 3', () => {
    const sessions = [
      { energyEmoji: 'green' },
      { energyEmoji: 'green' },
      { energyEmoji: 'green' },
    ];
    expect(countConsecutiveGreenSessions(sessions)).toBe(3);
  });
  it('2 green then yellow breaks streak → 2', () => {
    const sessions = [
      { energyEmoji: 'green' },
      { energyEmoji: 'green' },
      { energyEmoji: 'yellow' },
      { energyEmoji: 'green' },
    ];
    expect(countConsecutiveGreenSessions(sessions)).toBe(2);
  });
  it('first non-green breaks streak → 0', () => {
    const sessions = [{ energyEmoji: 'red' }, { energyEmoji: 'green' }];
    expect(countConsecutiveGreenSessions(sessions)).toBe(0);
  });
  it('🟢 emoji unicode supported', () => {
    const sessions = [{ energyEmoji: '🟢' }, { energyEmoji: '🟢' }];
    expect(countConsecutiveGreenSessions(sessions)).toBe(2);
  });
});

describe('hasNoRecoveryRedFlags — UP gating condition 2', () => {
  it('insufficient signal (< window) → false (conservative)', () => {
    expect(hasNoRecoveryRedFlags([])).toBe(false);
    expect(hasNoRecoveryRedFlags([{ energy: 'green' }])).toBe(false);
  });
  it('window 3 with no red → true', () => {
    const sessions = [
      { energy: 'green' },
      { energy: 'green' },
      { energy: 'amber' },
    ];
    expect(hasNoRecoveryRedFlags(sessions)).toBe(true);
  });
  it('any red in window → false', () => {
    const sessions = [
      { energy: 'green' },
      { energy: 'red' },
      { energy: 'green' },
    ];
    expect(hasNoRecoveryRedFlags(sessions)).toBe(false);
  });
});

describe('isHighIntensityPhase — Q7 4th condition Periodization phase gate', () => {
  it('PEAK / LOAD+ → true (high_intensity)', () => {
    expect(isHighIntensityPhase('PEAK')).toBe(true);
    expect(isHighIntensityPhase('LOAD+')).toBe(true);
  });
  it('LOAD / DELOAD → false (NU high_intensity)', () => {
    expect(isHighIntensityPhase('LOAD')).toBe(false);
    expect(isHighIntensityPhase('DELOAD')).toBe(false);
  });
  it('null / undefined → false defensive', () => {
    expect(isHighIntensityPhase(null)).toBe(false);
    expect(isHighIntensityPhase(undefined)).toBe(false);
  });
});

describe('evaluateUpGating — §9.3.3 Q7=B asymmetric UP gating cumulative', () => {
  const greenSessions = [
    { energyEmoji: 'green', energy: 'green' },
    { energyEmoji: 'green', energy: 'green' },
    { energyEmoji: 'green', energy: 'green' },
  ];

  it('all 4 conditions passed → UP gate open', () => {
    const r = evaluateUpGating({
      recentSessions: greenSessions,
      periodizationPhase: 'LOAD',
      stagnationDetected: false,
    });
    expect(r.passed).toBe(true);
    expect(r.reasons).toContain('up_gating_all_conditions_passed');
  });
  it('insufficient consecutive green → blocked', () => {
    const r = evaluateUpGating({
      recentSessions: [{ energyEmoji: 'green' }, { energyEmoji: 'yellow' }],
      periodizationPhase: 'LOAD',
    });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('up_blocked_insufficient_consecutive_green');
  });
  it('PEAK phase blocks UP — anti "Sarcastic UP" Marius 5:1 sapt 4-5', () => {
    const r = evaluateUpGating({
      recentSessions: greenSessions,
      periodizationPhase: 'PEAK',
    });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('up_blocked_periodization_phase_high_intensity');
  });
  it('LOAD+ phase blocks UP', () => {
    const r = evaluateUpGating({
      recentSessions: greenSessions,
      periodizationPhase: 'LOAD+',
    });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('up_blocked_periodization_phase_high_intensity');
  });
  it('stagnation detected blocks UP', () => {
    const r = evaluateUpGating({
      recentSessions: greenSessions,
      periodizationPhase: 'LOAD',
      stagnationDetected: true,
    });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('up_blocked_stagnation_detected');
  });
  it('recovery red in window blocks UP', () => {
    const sessionsWithRed = [
      { energyEmoji: 'green', energy: 'red' },
      { energyEmoji: 'green', energy: 'green' },
      { energyEmoji: 'green', energy: 'green' },
    ];
    const r = evaluateUpGating({
      recentSessions: sessionsWithRed,
      periodizationPhase: 'LOAD',
    });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('up_blocked_recovery_red_in_window');
  });
  it('insufficient recovery signal (< window) emits distinct reason, NOT red_in_window (E-13)', () => {
    // Only 2 sessions, NO red present — cauza e semnal insuficient, NU red.
    const r = evaluateUpGating({
      recentSessions: [
        { energyEmoji: 'green', energy: 'green' },
        { energyEmoji: 'green', energy: 'green' },
      ],
      periodizationPhase: 'LOAD',
    });
    expect(r.passed).toBe(false);
    expect(r.reasons).toContain('up_blocked_recovery_signal_insufficient');
    expect(r.reasons).not.toContain('up_blocked_recovery_red_in_window');
  });
});

describe('computeAdjustmentDirection — §9.3.3 full integration bidirectional asymmetric', () => {
  const greenSessions = [
    { energyEmoji: 'green', energy: 'green' },
    { energyEmoji: 'green', energy: 'green' },
    { energyEmoji: 'green', energy: 'green' },
  ];

  it('🔴 RED → DOWN immediate single trigger anti-burnout', () => {
    const r = computeAdjustmentDirection({
      aggregationSignal: { state: 'red', drillDownCause: 'somn', categoryRule: 'DOWN_IMMEDIATE' },
      recentSessions: [],
      periodizationPhase: 'LOAD',
      tier: CALIBRATION_TIERS.T1,
    });
    expect(r.direction).toBe(ADJUSTMENT_DIRECTION.DOWN);
    expect(r.magnitudePct).toBe(-0.15);
    expect(r.upGatingPassed).toBe(false);
  });
  it('🟢 GREEN + all UP gates passed T1+ → UP +15%', () => {
    const r = computeAdjustmentDirection({
      aggregationSignal: { state: 'green', drillDownCause: null, categoryRule: 'UP_ELIGIBLE' },
      recentSessions: greenSessions,
      periodizationPhase: 'LOAD',
      tier: CALIBRATION_TIERS.T1,
    });
    expect(r.direction).toBe(ADJUSTMENT_DIRECTION.UP);
    expect(r.magnitudePct).toBe(0.15);
    expect(r.upGatingPassed).toBe(true);
  });
  it('🟢 GREEN + all UP gates passed T0 → UP +10% (tier-aware Q13=B)', () => {
    const r = computeAdjustmentDirection({
      aggregationSignal: { state: 'green', drillDownCause: null, categoryRule: 'UP_ELIGIBLE' },
      recentSessions: greenSessions,
      periodizationPhase: 'LOAD',
      tier: CALIBRATION_TIERS.T0,
    });
    expect(r.direction).toBe(ADJUSTMENT_DIRECTION.UP);
    expect(r.magnitudePct).toBe(0.10);
  });
  it('🟢 GREEN + PEAK phase → blocked NONE (anti-Sarcastic UP)', () => {
    const r = computeAdjustmentDirection({
      aggregationSignal: { state: 'green', drillDownCause: null, categoryRule: 'UP_ELIGIBLE' },
      recentSessions: greenSessions,
      periodizationPhase: 'PEAK',
      tier: CALIBRATION_TIERS.T1,
    });
    expect(r.direction).toBe(ADJUSTMENT_DIRECTION.NONE);
    expect(r.magnitudePct).toBe(0);
    expect(r.upGatingPassed).toBe(false);
  });
  it('🟡 YELLOW → NONE caution preserve baseline', () => {
    const r = computeAdjustmentDirection({
      aggregationSignal: { state: 'yellow', drillDownCause: null, categoryRule: 'NONE' },
      recentSessions: [],
      periodizationPhase: 'LOAD',
      tier: CALIBRATION_TIERS.T1,
    });
    expect(r.direction).toBe(ADJUSTMENT_DIRECTION.NONE);
    expect(r.magnitudePct).toBe(0);
  });
  it('🔴 DOWN T0 magnitude tier-aware -10%', () => {
    const r = computeAdjustmentDirection({
      aggregationSignal: { state: 'red', drillDownCause: null, categoryRule: 'DOWN_IMMEDIATE' },
      recentSessions: [],
      periodizationPhase: 'LOAD',
      tier: CALIBRATION_TIERS.T0,
    });
    expect(r.direction).toBe(ADJUSTMENT_DIRECTION.DOWN);
    expect(r.magnitudePct).toBe(-0.10);
  });
});
