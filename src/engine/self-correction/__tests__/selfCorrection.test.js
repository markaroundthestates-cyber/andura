import { describe, it, expect } from 'vitest';
import {
  detectRealtimeAdjust,
  shouldShowProfileValidation,
  PROFILE_VALIDATION_CONFIG,
  initiateGoalShift,
  advancePostShiftSession,
  buildCalibrationPlaceholderData,
} from '../index.js';

describe('Self-Correction — Realtime Per-Set §36.28', () => {
  it('2× RPE 10 → adjust DOWN', () => {
    const r = detectRealtimeAdjust({ rpes: [10, 10], reps: [8, 8], rMax: 12 });
    expect(r.direction).toBe('down');
  });
  it('2× Easy + reps maxime → adjust UP', () => {
    const r = detectRealtimeAdjust({ rpes: [6, 6], reps: [12, 12], rMax: 12 });
    expect(r.direction).toBe('up');
  });
  it('insufficient sets → none', () => {
    expect(detectRealtimeAdjust({ rpes: [10], reps: [8], rMax: 12 }).direction).toBe('none');
  });
});

describe('Self-Correction — Profile Validation §36.34', () => {
  it('window not full (<8 sessions) → no prompt', () => {
    const r = shouldShowProfileValidation({
      biasSignals: { whyTapRate: 0.10, avgSummaryDwellMs: 20000, repRangeOverrideRate: 0.40, declaredMode: 'EXECUTOR' },
      sessionsSinceLastRefusal: null,
      sessionCount: 5,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.reason).toBe('window_not_full');
  });
  it('cooldown active (<24 sessions since refusal) → no prompt', () => {
    const r = shouldShowProfileValidation({
      biasSignals: { whyTapRate: 0.10, avgSummaryDwellMs: 20000, repRangeOverrideRate: 0.40, declaredMode: 'EXECUTOR' },
      sessionsSinceLastRefusal: 10,
      sessionCount: 30,
    });
    expect(r.shouldPrompt).toBe(false);
    expect(r.reason).toBe('cooldown_active');
  });
  it('drift detected + window full + no cooldown → prompt', () => {
    const r = shouldShowProfileValidation({
      biasSignals: { whyTapRate: 0.10, avgSummaryDwellMs: 20000, repRangeOverrideRate: 0.40, declaredMode: 'EXECUTOR' },
      sessionsSinceLastRefusal: null,
      sessionCount: 30,
    });
    expect(r.shouldPrompt).toBe(true);
    expect(r.placeholderId).toBe('profile_validation_drift_prompt');
  });
  it('exposes config constants', () => {
    expect(PROFILE_VALIDATION_CONFIG.ROLLING_WINDOW_SESSIONS).toBe(8);
    expect(PROFILE_VALIDATION_CONFIG.COOLDOWN_AFTER_REFUSAL_SESSIONS).toBe(24);
  });
});

describe('Self-Correction — Goal Shift §36.35', () => {
  it('initiateGoalShift sets calibration active + 2 sessions remaining', () => {
    const s = initiateGoalShift('CUT', 'BULK');
    expect(s.calibrationActive).toBe(true);
    expect(s.calibrationSessionsRemaining).toBe(2);
    expect(s.streak).toBe(0);
  });
  it('advances post-shift session counter', () => {
    let s = initiateGoalShift('CUT', 'BULK');
    s = advancePostShiftSession(s);
    expect(s.sessionsSinceShift).toBe(1);
    expect(s.calibrationActive).toBe(true);
    s = advancePostShiftSession(s);
    expect(s.sessionsSinceShift).toBe(2);
    expect(s.calibrationActive).toBe(false);
  });
  it('builds GOAL_SHIFT_CALIBRATION_PLACEHOLDER per §36.58 LOCKED V1', () => {
    const data = buildCalibrationPlaceholderData({ minKg: 50, maxKg: 60, reps: 8, current: 1 });
    expect(data.id).toBe('goal_shift_calibration_notice');
    expect(data.title).toBe('Recalibram pe noul obiectiv');
    expect(data.body).toContain('50-60 kg × 8 reps');
    expect(data.subText).toBe('Sesiunea 1/2');
  });
});
