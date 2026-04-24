import { describe, it, expect, beforeEach } from 'vitest';
import { buildCoachContext } from '../coachContext.js';
import { detectCalibrationLevel } from '../calibration.js';

function makeSession(sessionIdx, logsPerSession = 3) {
  const msPerDay = 86400000;
  const sessionTs = Date.now() - sessionIdx * msPerDay * 2;
  const date = new Date(sessionTs).toISOString().slice(0, 10);
  return Array.from({ length: logsPerSession }, (_, j) => ({
    ex: 'Bench Press', w: 80, reps: '8', baseline: false,
    date, ts: sessionTs + j * 60000, session: sessionTs,
  }));
}

describe('buildCoachContext — allLogs full history', () => {
  beforeEach(() => { localStorage.clear(); });

  it('ctx.allLogs contains ALL logs, not just last 3 sessions', () => {
    // Store 10 sessions × 3 logs = 30 logs
    const allLogs = Array.from({ length: 10 }, (_, i) => makeSession(i)).flat();
    localStorage.setItem('logs', JSON.stringify(allLogs));

    const ctx = buildCoachContext();

    expect(ctx.allLogs).toBeDefined();
    expect(ctx.allLogs.length).toBe(30);
  });

  it('ctx.allLogs has more logs than recentLogs when history > 3 sessions', () => {
    const allLogs = Array.from({ length: 10 }, (_, i) => makeSession(i)).flat();
    localStorage.setItem('logs', JSON.stringify(allLogs));

    const ctx = buildCoachContext();
    const recentLogsCount = ctx.recentLogs.flatMap(s => s.logs).length;

    expect(ctx.allLogs.length).toBeGreaterThan(recentLogsCount);
  });
});

describe('detectCalibrationLevel — correct tier with full history', () => {
  it('returns COLD_START with only 2 sessions', () => {
    const logs = Array.from({ length: 2 }, (_, i) => makeSession(i)).flat();
    const level = detectCalibrationLevel({ allLogs: logs });
    expect(level.name).toBe('cold_start');
  });

  it('returns PERSONALIZING (not COLD_START) with 15 sessions over 35 days', () => {
    const logs = Array.from({ length: 15 }, (_, i) => {
      // Spread sessions over 35 days so daysSinceFirst >= 28
      const msAgo = (35 - i * 2) * 86400000;
      const sessionTs = Date.now() - msAgo;
      const date = new Date(sessionTs).toISOString().slice(0, 10);
      return [{ ex: 'Squat', w: 100, reps: '5', baseline: false, date, ts: sessionTs, session: sessionTs }];
    }).flat();

    const level = detectCalibrationLevel({ allLogs: logs });
    expect(level.name).not.toBe('cold_start');
    expect(['personalizing', 'personalized', 'optimized']).toContain(level.name);
  });

  it('returns PERSONALIZED/OPTIMIZED with 85 sessions over 190 days', () => {
    const logs = Array.from({ length: 85 }, (_, i) => {
      const msAgo = (190 - i * 2) * 86400000;
      const sessionTs = Date.now() - msAgo;
      const date = new Date(sessionTs).toISOString().slice(0, 10);
      return [{ ex: 'Squat', w: 100, reps: '5', baseline: false, date, ts: sessionTs, session: sessionTs }];
    }).flat();

    const level = detectCalibrationLevel({ allLogs: logs });
    expect(['personalized', 'optimized']).toContain(level.name);
  });
});
