import { describe, it, expect } from 'vitest';
import {
  rirToIntensity, getTargetRirRange,
  MODES, isValidMode, getDefaultMode,
  detectBiasDrift,
  detectTier, isFeatureEnabledForTier,
  cascadeArbitrate,
  detectOutlier, onGoalShift, OUTLIER_FILTER_CONFIG,
} from '../index.js';

describe('Suflet Andura — RIR Matrix', () => {
  it('maps RIR 0 → LIMIT', () => {
    expect(rirToIntensity(0).key).toBe('LIMIT');
    expect(rirToIntensity(0).label).toBe('🔴 La limita');
  });
  it('maps RIR 1.5 → HEAVY (🟠 RIR exception per Q26.bis)', () => {
    expect(rirToIntensity(1.5).key).toBe('HEAVY');
    expect(rirToIntensity(1.5).label).toBe('🟠 Greu');
  });
  it('maps RIR 5 → COMFORTABLE', () => {
    expect(rirToIntensity(5).key).toBe('COMFORTABLE');
  });
  it('strength compound → tighter target (RIR 1-2)', () => {
    const r = getTargetRirRange({ profile: 'STRENGTH', exerciseCategory: 'compound' });
    expect(r.targetRirMin).toBe(1);
    expect(r.targetRirMax).toBe(2);
  });
  it('hipertrofie default → RIR 2-3', () => {
    const r = getTargetRirRange({ profile: 'HYPERTROPHY', exerciseCategory: 'isolation' });
    expect(r.targetRirMin).toBe(2);
    expect(r.targetRirMax).toBe(3);
  });
});

describe('Suflet Andura — Modes UI', () => {
  it('exposes 4 modes', () => {
    expect(MODES.map(m => m.key)).toEqual(['STRATEGIC', 'EXECUTOR', 'HYBRID', 'AUTO']);
  });
  it('validates known mode', () => {
    expect(isValidMode('STRATEGIC')).toBe(true);
    expect(isValidMode('UNKNOWN')).toBe(false);
  });
  it('default mode = AUTO', () => {
    expect(getDefaultMode()).toBe('AUTO');
  });
});

describe('Suflet Andura — Bias Detection', () => {
  it('declared EXECUTOR + 3 high signals → trigger', () => {
    const r = detectBiasDrift({
      whyTapRate: 0.10,
      avgSummaryDwellMs: 20000,
      repRangeOverrideRate: 0.40,
      declaredMode: 'EXECUTOR',
    });
    expect(r.trigger).toBe(true);
    expect(r.fired.length).toBe(3);
  });
  it('declared EXECUTOR + 2 high signals → no trigger (3/3 threshold)', () => {
    const r = detectBiasDrift({
      whyTapRate: 0.10,
      avgSummaryDwellMs: 20000,
      repRangeOverrideRate: 0.10,
      declaredMode: 'EXECUTOR',
    });
    expect(r.trigger).toBe(false);
  });
});

describe('Suflet Andura — Tier Progression', () => {
  it('not onboarded → T0', () => {
    expect(detectTier({ onboardingComplete: false, vitalityComplete: false, sessionCount: 0 })).toBe('T0');
  });
  it('onboarded only → T1', () => {
    expect(detectTier({ onboardingComplete: true, vitalityComplete: false, sessionCount: 0 })).toBe('T1');
  });
  it('vitality + few sessions → T2', () => {
    expect(detectTier({ onboardingComplete: true, vitalityComplete: true, sessionCount: 5 })).toBe('T2');
  });
  it('full + 12+ sessions → T3', () => {
    expect(detectTier({ onboardingComplete: true, vitalityComplete: true, sessionCount: 15 })).toBe('T3');
  });
  it('biasDetection requires T2+', () => {
    expect(isFeatureEnabledForTier('T1', 'biasDetection')).toBe(false);
    expect(isFeatureEnabledForTier('T2', 'biasDetection')).toBe(true);
  });
});

describe('Suflet Andura — Cascade Defense', () => {
  it('safety beats progression', () => {
    const recs = [
      { engine: 'A', layer: 'progression', action: 'increase', priority: 5 },
      { engine: 'B', layer: 'safety',      action: 'rest_day', priority: 3 },
    ];
    const r = cascadeArbitrate(recs);
    expect(r.winner.engine).toBe('B');
  });
  it('within layer, higher priority wins', () => {
    const recs = [
      { engine: 'X', layer: 'recovery', action: 'deload',  priority: 2 },
      { engine: 'Y', layer: 'recovery', action: 'maintain', priority: 5 },
    ];
    expect(cascadeArbitrate(recs).winner.engine).toBe('Y');
  });
  it('empty list → null winner', () => {
    expect(cascadeArbitrate([]).winner).toBeNull();
  });
});

describe('Suflet Andura — Outlier Filter', () => {
  it('post-goal-shift session bypasses outlier detection', () => {
    const r = detectOutlier(
      { ex: 'Bench', weight: 100, reps: 5, ts: Date.now(), postGoalShift: true },
      []
    );
    expect(r.isOutlier).toBe(false);
    expect(r.reason).toBe('goal_shift_calibration_window');
  });
  it('insufficient window (<4 sessions) → no outlier flag', () => {
    expect(detectOutlier({ ex: 'Bench', weight: 50, reps: 8, ts: 0 }, []).isOutlier).toBe(false);
  });
  it('onGoalShift resets streak + sets calibration counter', () => {
    const r = onGoalShift();
    expect(r.streak).toBe(0);
    expect(r.calibrationSessionsRemaining).toBe(2);
  });
  it('config exposes constants', () => {
    expect(OUTLIER_FILTER_CONFIG.ROLLING_WINDOW).toBe(8);
    expect(OUTLIER_FILTER_CONFIG.COOLDOWN_SESSIONS).toBe(24);
    expect(OUTLIER_FILTER_CONFIG.GOAL_SHIFT_CALIBRATION_SESSIONS).toBe(2);
  });
});
