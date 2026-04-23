import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classifyLogs, aggregateLogs, archiveLogs, getTierBoundaries } from '../tierStorage.js';

// Mock DB to prevent localStorage access in tests
vi.mock('../../db.js', () => ({
  DB: { get: vi.fn(() => null), set: vi.fn() },
}));

const MS_DAY = 86400000;
const now = new Date('2026-04-23T12:00:00Z');

function makeLog(daysAgo, ex = 'Bench', w = 80, reps = 8) {
  const ts = now.getTime() - daysAgo * MS_DAY;
  return { ex, w, reps, ts, session: ts };
}

describe('getTierBoundaries', () => {
  it('live cutoff is 90 days ago', () => {
    const { liveCutoff } = getTierBoundaries(now);
    const diff = now.getTime() - liveCutoff.getTime();
    expect(Math.round(diff / MS_DAY)).toBe(90);
  });

  it('aggregate cutoff is 365 days ago', () => {
    const { aggregateCutoff } = getTierBoundaries(now);
    const diff = now.getTime() - aggregateCutoff.getTime();
    expect(Math.round(diff / MS_DAY)).toBe(365);
  });
});

describe('classifyLogs', () => {
  it('places recent logs in live tier', () => {
    const logs = [makeLog(30)];
    const { live, aggregate, archive } = classifyLogs(logs, now);
    expect(live).toHaveLength(1);
    expect(aggregate).toHaveLength(0);
    expect(archive).toHaveLength(0);
  });

  it('places 6-month-old logs in aggregate tier', () => {
    const logs = [makeLog(180)];
    const { live, aggregate, archive } = classifyLogs(logs, now);
    expect(aggregate).toHaveLength(1);
    expect(live).toHaveLength(0);
  });

  it('places 2-year-old logs in archive tier', () => {
    const logs = [makeLog(730)];
    const { live, aggregate, archive } = classifyLogs(logs, now);
    expect(archive).toHaveLength(1);
    expect(live).toHaveLength(0);
    expect(aggregate).toHaveLength(0);
  });

  it('handles empty logs', () => {
    const { live, aggregate, archive } = classifyLogs([], now);
    expect(live).toHaveLength(0);
    expect(aggregate).toHaveLength(0);
    expect(archive).toHaveLength(0);
  });

  it('handles logs without ts (places in live)', () => {
    const logs = [{ ex: 'Bench', w: 80, reps: 8 }];
    const { live } = classifyLogs(logs, now);
    expect(live).toHaveLength(1);
  });
});

describe('aggregateLogs', () => {
  it('groups by day', () => {
    const logs = [makeLog(180), makeLog(180), makeLog(181)];
    const result = aggregateLogs(logs);
    const days = Object.keys(result);
    expect(days.length).toBeGreaterThanOrEqual(1);
  });

  it('counts sets per day', () => {
    const logs = [makeLog(180), makeLog(180)];
    const result = aggregateLogs(logs);
    const firstDay = Object.values(result)[0];
    expect(firstDay.sets).toBe(2);
  });

  it('handles empty', () => {
    expect(aggregateLogs([])).toEqual({});
  });
});

describe('archiveLogs', () => {
  it('groups by month', () => {
    const logs = [makeLog(400), makeLog(430)];
    const result = archiveLogs(logs);
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it('counts sessions per month', () => {
    const logs = [makeLog(400, 'Bench', 80, 8), makeLog(403, 'Cable Row', 60, 8)];
    const result = archiveLogs(logs);
    const values = Object.values(result);
    expect(values.some(m => m.sessions >= 1)).toBe(true);
  });

  it('stores topExercises', () => {
    const logs = [makeLog(400), makeLog(400), makeLog(401)];
    const result = archiveLogs(logs);
    const firstMonth = Object.values(result)[0];
    expect(Array.isArray(firstMonth.topExercises)).toBe(true);
  });
});
