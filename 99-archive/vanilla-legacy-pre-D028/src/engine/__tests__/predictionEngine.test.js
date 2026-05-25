import { describe, it, expect } from 'vitest';
import { absenceProbabilityByDay, getHighRiskDays, predictToday } from '../predictionEngine.js';

// Create logs with sessions on specific days of week
function makeSessionLogs(dayOfWeekCounts) {
  const logs = [];
  let baseTs = Date.now() - 90 * 24 * 3600 * 1000;
  for (const [dow, count] of Object.entries(dayOfWeekCounts)) {
    for (let i = 0; i < count; i++) {
      // Find next occurrence of this day of week from baseTs
      const d = new Date(baseTs + i * 7 * 24 * 3600 * 1000);
      while (d.getDay() !== Number(dow)) d.setDate(d.getDate() + 1);
      const session = d.getTime();
      logs.push({ ex: 'Bench', w: 80, reps: 8, ts: session, session });
    }
  }
  return logs;
}

function makeSkips(dayOfWeekCounts) {
  const skips = {};
  let baseDate = new Date(Date.now() - 90 * 24 * 3600 * 1000);
  for (const [dow, count] of Object.entries(dayOfWeekCounts)) {
    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate.getTime() + i * 7 * 24 * 3600 * 1000);
      while (d.getDay() !== Number(dow)) d.setDate(d.getDate() + 1);
      // Use local date (not toISOString which is UTC) to avoid off-by-one around midnight
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      skips[localDate] = true;
    }
  }
  return skips;
}

describe('absenceProbabilityByDay', () => {
  it('returns 7 entries (one per day)', () => {
    const result = absenceProbabilityByDay([], {});
    expect(result).toHaveLength(7);
  });

  it('marks days as insufficient when < 3 total', () => {
    const logs = makeSessionLogs({ 1: 2 }); // 2 Monday sessions
    const result = absenceProbabilityByDay(logs, {});
    expect(result[1].insufficient).toBe(true);
  });

  it('calculates probability correctly', () => {
    // 6 sessions, 4 skips on Monday = 4/(6+4) = 0.4
    const logs = makeSessionLogs({ 1: 6 });
    const skips = makeSkips({ 1: 4 });
    const result = absenceProbabilityByDay(logs, skips);
    expect(result[1].probability).toBeCloseTo(0.4, 1);
  });

  it('returns 0 probability for days with no skips', () => {
    const logs = makeSessionLogs({ 3: 5 }); // 5 Wed sessions, 0 skips
    const result = absenceProbabilityByDay(logs, {});
    expect(result[3].probability).toBe(0);
  });

  it('includes day name labels', () => {
    const result = absenceProbabilityByDay([], {});
    const dayNames = result.map(d => d.day);
    expect(dayNames).toContain('Luni');
    expect(dayNames).toContain('Sambata');
  });
});

describe('getHighRiskDays', () => {
  it('returns empty for no high-risk days', () => {
    const result = getHighRiskDays([], {});
    expect(result).toHaveLength(0);
  });

  it('flags days above threshold', () => {
    const logs = makeSessionLogs({ 1: 5 }); // 5 Monday sessions
    const skips = makeSkips({ 1: 5 }); // 5 Monday skips → 50% probability
    const result = getHighRiskDays(logs, skips, 0.3);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].recommendation).toBeDefined();
  });
});

describe('predictToday', () => {
  it('returns isHighRisk: false for clean history', () => {
    const result = predictToday([], {});
    expect(result.isHighRisk).toBe(false);
  });

  it('returns dow and day name', () => {
    const result = predictToday([], {});
    expect(result.dow).toBeGreaterThanOrEqual(0);
    expect(result.dow).toBeLessThanOrEqual(6);
    expect(typeof result.day).toBe('string');
  });
});

// ── Edge / error branches (50% branch baseline) ──────────────────────────────

describe('predictionEngine — edge + defensive branches', () => {
  it('absenceProbabilityByDay handles null/undefined inputs gracefully', () => {
    const a = absenceProbabilityByDay(null, null);
    const b = absenceProbabilityByDay(undefined, undefined);
    expect(a).toHaveLength(7);
    expect(b).toHaveLength(7);
    a.forEach(d => {
      expect(Number.isFinite(d.probability)).toBe(true);
      expect(d.sessions).toBe(0);
      expect(d.skips).toBe(0);
    });
  });

  it('skipsPerDayOfWeek ignores malformed date keys (no NaN dow leak)', () => {
    // Invalid date strings → getDay() NaN → bucket skipped, not counted.
    const skips = { 'not-a-date': true, '': true, 'NaN-NaN-NaN': true };
    const result = absenceProbabilityByDay([], skips);
    expect(result).toHaveLength(7);
    expect(result.reduce((sum, d) => sum + d.skips, 0)).toBe(0);
  });

  it('logs without session/ts are skipped (insufficient stays true)', () => {
    const logs = [{ ex: 'Bench', w: 80 }, { ex: 'Row' }]; // no ts/session
    const result = absenceProbabilityByDay(logs, {});
    result.forEach(d => expect(d.sessions).toBe(0));
  });

  it('falls back to todTs key when session id absent (uses ts)', () => {
    const ts = new Date('2026-05-04T10:00:00').getTime(); // a Monday
    const logs = Array.from({ length: 3 }, () => ({ ex: 'Bench', ts }));
    const result = absenceProbabilityByDay(logs, {});
    // All 3 share the same day key → counts as 1 distinct session that day.
    const monday = result[1];
    expect(monday.sessions).toBe(1);
  });

  it('getHighRiskDays threshold is strict (probability === threshold excluded)', () => {
    // 5 sessions + 5 skips Monday = 0.5 prob; threshold 0.5 → strict > excludes.
    const logs = makeSessionLogs({ 1: 5 });
    const skips = makeSkips({ 1: 5 });
    expect(getHighRiskDays(logs, skips, 0.5)).toHaveLength(0);
    expect(getHighRiskDays(logs, skips, 0.49).length).toBeGreaterThan(0);
  });

  it('predictToday surfaces recommendation when today is high-risk', () => {
    const dow = new Date().getDay();
    // Build 5 sessions + 5 skips on TODAY dow → 0.5 prob > 0.3 → high risk.
    const logs = makeSessionLogs({ [dow]: 5 });
    const skips = makeSkips({ [dow]: 5 });
    const result = predictToday(logs, skips);
    expect(result.isHighRisk).toBe(true);
    expect(result.recommendation).toMatch(/sanse sa sari/i);
    expect(Number.isFinite(result.probability)).toBe(true);
  });
});
