import { describe, it, expect } from 'vitest';
import {
  detectCalibrationLevel,
  shouldRecalibrate,
  applyRollingWindow,
  CALIBRATION_LEVELS,
} from '../calibration.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLog(daysAgo, exercise = 'Lat Pulldown', sessionId = '0') {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    date: d.toISOString().slice(0, 10),
    timestamp: d.toISOString(),
    ex: exercise,
    w: 30,
    reps: 8,
    session: `session-${sessionId}`,
  };
}

function makeCtxWithSessions(sessionCount, daysOld) {
  const logs = [];
  for (let i = 0; i < sessionCount; i++) {
    const dayOffset = sessionCount > 1 ? (daysOld / (sessionCount - 1)) * i : 0;
    const daysAgo = Math.max(0, daysOld - dayOffset);
    for (let s = 0; s < 3; s++) {
      logs.push(makeLog(daysAgo, 'Lat Pulldown', String(i)));
    }
  }
  return { allLogs: logs };
}

// ── detectCalibrationLevel ───────────────────────────────────────────────────

describe('detectCalibrationLevel', () => {
  it('returns COLD_START for 0 sessions', () => {
    const result = detectCalibrationLevel({ allLogs: [] });
    expect(result.name).toBe('cold_start');
  });

  it('returns COLD_START for 2 sessions in 3 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(2, 3));
    expect(result.name).toBe('cold_start');
  });

  it('returns COLD_START even with logs if <7 days old', () => {
    const ctx = makeCtxWithSessions(5, 4); // 5 sessions but only 4 days old
    const result = detectCalibrationLevel(ctx);
    expect(result.name).toBe('cold_start');
  });

  it('returns INITIAL for 8 sessions in 14 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(8, 14));
    expect(result.name).toBe('initial');
  });

  it('returns PERSONALIZING for 25 sessions in 60 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(25, 60));
    expect(result.name).toBe('personalizing');
  });

  it('returns PERSONALIZED for 60 sessions in 150 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(60, 150));
    expect(result.name).toBe('personalized');
  });

  it('returns OPTIMIZED for 200 sessions in 400 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(200, 400));
    expect(result.name).toBe('optimized');
  });

  it('returns a valid CALIBRATION_LEVELS entry', () => {
    const result = detectCalibrationLevel({ allLogs: [] });
    expect(result).toBe(CALIBRATION_LEVELS.COLD_START);
  });
});

// ── Feature flags per level ───────────────────────────────────────────────────

describe('COLD_START feature flags', () => {
  it('has patternsEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.patternsEnabled).toBe(false);
  });

  it('has weakGroupEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.weakGroupEnabled).toBe(false);
  });

  it('has stagnationEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.stagnationEnabled).toBe(false);
  });

  it('has predictionEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.predictionEnabled).toBe(false);
  });

  it('has a bannerText', () => {
    expect(typeof CALIBRATION_LEVELS.COLD_START.bannerText).toBe('string');
    expect(CALIBRATION_LEVELS.COLD_START.bannerText.length).toBeGreaterThan(0);
  });
});

describe('OPTIMIZED feature flags', () => {
  it('has all engines enabled', () => {
    const lvl = CALIBRATION_LEVELS.OPTIMIZED;
    expect(lvl.patternsEnabled).toBe(true);
    expect(lvl.weakGroupEnabled).toBe(true);
    expect(lvl.stagnationEnabled).toBe(true);
    expect(lvl.predictionEnabled).toBe(true);
    expect(lvl.responseProfileEnabled).toBe(true);
  });

  it('has rollingWindowMonths=6', () => {
    expect(CALIBRATION_LEVELS.OPTIMIZED.rollingWindowMonths).toBe(6);
  });

  it('has bannerText=null', () => {
    expect(CALIBRATION_LEVELS.OPTIMIZED.bannerText).toBeNull();
  });
});

// ── shouldRecalibrate ────────────────────────────────────────────────────────

describe('shouldRecalibrate', () => {
  it('returns true if never calibrated', () => {
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, null)).toBe(true);
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, undefined)).toBe(true);
  });

  it('returns false for daily tier if recalibrated <20h ago', () => {
    const recent = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // 10h ago
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, recent)).toBe(false);
  });

  it('returns true for daily tier if recalibrated >20h ago', () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25h ago
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, old)).toBe(true);
  });

  it('returns false for weekly tier if recalibrated 3 days ago', () => {
    const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(shouldRecalibrate(CALIBRATION_LEVELS.PERSONALIZING, recent)).toBe(false);
  });

  it('returns true for weekly tier if recalibrated 8 days ago', () => {
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    expect(shouldRecalibrate(CALIBRATION_LEVELS.PERSONALIZING, old)).toBe(true);
  });

  it('returns false for per_session tier regardless of time', () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    expect(shouldRecalibrate(CALIBRATION_LEVELS.COLD_START, old)).toBe(false);
  });
});

// ── applyRollingWindow ────────────────────────────────────────────────────────

describe('applyRollingWindow', () => {
  it('returns all logs if level has no rollingWindowMonths', () => {
    const logs = [makeLog(10), makeLog(200), makeLog(400)];
    const result = applyRollingWindow(logs, CALIBRATION_LEVELS.PERSONALIZED);
    expect(result.length).toBe(3);
  });

  it('filters logs older than 6 months for OPTIMIZED', () => {
    const recent = makeLog(30);   // 1 month ago — keep
    const old    = makeLog(200);  // ~6.5 months ago — filter
    const logs = [recent, old];
    const result = applyRollingWindow(logs, CALIBRATION_LEVELS.OPTIMIZED);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(recent);
  });

  it('keeps logs well within the 6-month window', () => {
    const withinWindow = makeLog(170); // 170 days < 180-day cutoff
    const result = applyRollingWindow([withinWindow], CALIBRATION_LEVELS.OPTIMIZED);
    expect(result.length).toBe(1);
  });

  it('returns empty array if all logs are outside window', () => {
    const veryOld = makeLog(500);
    const result = applyRollingWindow([veryOld], CALIBRATION_LEVELS.OPTIMIZED);
    expect(result.length).toBe(0);
  });
});
