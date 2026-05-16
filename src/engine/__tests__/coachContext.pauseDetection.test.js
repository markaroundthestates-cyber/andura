import { describe, it, expect } from 'vitest';
import { computePauseDuration, extractSessionDates } from '../coachContext.js';

describe('computePauseDuration() — pure pause-since-last-session helper', () => {
  it('empty sessionDates → 0/0', () => {
    expect(computePauseDuration([], '2026-05-15')).toEqual({ daysSincePause: 0, pauseMonths: 0 });
  });

  it('null sessionDates → 0/0 (defensive)', () => {
    expect(computePauseDuration(null, '2026-05-15')).toEqual({ daysSincePause: 0, pauseMonths: 0 });
  });

  it('1 session yesterday → daysSincePause=1', () => {
    const r = computePauseDuration(['2026-05-14'], '2026-05-15');
    expect(r.daysSincePause).toBe(1);
    expect(r.pauseMonths).toBeCloseTo(1 / 30.44, 5);
  });

  it('1 session 6 months ago (≈183 days) → pauseMonths≥6', () => {
    const r = computePauseDuration(['2025-11-13'], '2026-05-15');
    expect(r.daysSincePause).toBeGreaterThanOrEqual(180);
    expect(r.pauseMonths).toBeGreaterThanOrEqual(6);
  });

  it('1 session 12 months ago → pauseMonths≥12', () => {
    const r = computePauseDuration(['2025-05-15'], '2026-05-15');
    expect(r.pauseMonths).toBeGreaterThanOrEqual(11.5);
    expect(r.pauseMonths).toBeLessThan(13);
  });

  it('takes latest of multiple dates (order-agnostic)', () => {
    const r = computePauseDuration(['2025-12-01', '2026-05-14', '2026-01-15'], '2026-05-15');
    expect(r.daysSincePause).toBe(1);
  });

  it('currentDate before last session → 0/0 (defensive, no negative pause)', () => {
    const r = computePauseDuration(['2026-05-20'], '2026-05-15');
    expect(r.daysSincePause).toBe(0);
    expect(r.pauseMonths).toBe(0);
  });

  it('invalid currentDate → 0/0', () => {
    expect(computePauseDuration(['2026-05-14'], '').daysSincePause).toBe(0);
    expect(computePauseDuration(['2026-05-14'], null).daysSincePause).toBe(0);
  });

  it('non-string entries filtered safely', () => {
    const r = computePauseDuration(['2026-05-14', null, 42, '2026-05-13'], '2026-05-15');
    expect(r.daysSincePause).toBe(1);
  });

  it('same date as current → 0/0', () => {
    expect(computePauseDuration(['2026-05-15'], '2026-05-15')).toEqual({ daysSincePause: 0, pauseMonths: 0 });
  });

  it('pure function — same input → same output', () => {
    const a = computePauseDuration(['2025-11-13'], '2026-05-15');
    const b = computePauseDuration(['2025-11-13'], '2026-05-15');
    expect(a).toEqual(b);
  });
});

describe('extractSessionDates() — pure helper', () => {
  it('empty array → []', () => {
    expect(extractSessionDates([])).toEqual([]);
  });

  it('extracts distinct dates only', () => {
    const logs = [
      { date: '2026-05-14', w: 50 },
      { date: '2026-05-14', w: 55 },
      { date: '2026-05-13', w: 50 },
    ];
    expect(extractSessionDates(logs)).toEqual(['2026-05-13', '2026-05-14']);
  });

  it('skips entries without date', () => {
    const logs = [{ date: '2026-05-14' }, {}, { date: null }, { date: '2026-05-13' }];
    expect(extractSessionDates(logs)).toEqual(['2026-05-13', '2026-05-14']);
  });

  it('null input → []', () => {
    expect(extractSessionDates(null)).toEqual([]);
  });

  it('sorted ascending', () => {
    const logs = [{ date: '2026-05-14' }, { date: '2026-05-01' }, { date: '2026-05-10' }];
    expect(extractSessionDates(logs)).toEqual(['2026-05-01', '2026-05-10', '2026-05-14']);
  });
});
