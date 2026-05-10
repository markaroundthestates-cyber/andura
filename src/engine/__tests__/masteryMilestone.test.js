// Mastery Milestone tests — Foundation 4B (Batch B Task 6).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  incrementCounter,
  getCounters,
  getCurrentMilestone,
  getNextMilestone,
  formatMilestoneMessage,
  recordSessionComplete,
  resetCounters,
  MASTERY_MILESTONES,
} from '../masteryMilestone.js';

beforeEach(() => {
  localStorage.clear();
});

describe('MASTERY_MILESTONES — schema', () => {
  it('exposes 4 milestones at LOCKED thresholds', () => {
    expect(MASTERY_MILESTONES.map(m => m.count)).toEqual([10, 30, 60, 120]);
  });

  it('LOCKED milestone names', () => {
    expect(MASTERY_MILESTONES.map(m => m.name))
      .toEqual(['Inceput', 'Constanta', 'Stapanire', 'Maestru']);
  });
});

describe('incrementCounter', () => {
  it('counts increments per exercise', () => {
    incrementCounter('Squat');
    incrementCounter('Squat');
    incrementCounter('Bench');
    expect(getCounters().Squat.count).toBe(2);
    expect(getCounters().Bench.count).toBe(1);
  });

  it('returns null when not crossing a threshold', () => {
    for (let i = 1; i <= 9; i++) {
      const m = incrementCounter('Squat');
      expect(m).toBeNull();
    }
  });

  it('returns milestone exactly at session 10', () => {
    for (let i = 1; i <= 9; i++) incrementCounter('Squat');
    const m = incrementCounter('Squat');
    expect(m).toEqual({ count: 10, name: 'Inceput' });
  });

  it('returns milestone at session 30', () => {
    for (let i = 1; i <= 29; i++) incrementCounter('Squat');
    const m = incrementCounter('Squat');
    expect(m).toEqual({ count: 30, name: 'Constanta' });
  });

  it('returns milestone at session 60', () => {
    // Pre-seed counter to skip the bulk loop in test.
    localStorage.setItem('masteryCounters', JSON.stringify({ Squat: { count: 59, lastSessionTs: 0 } }));
    const m = incrementCounter('Squat');
    expect(m).toEqual({ count: 60, name: 'Stapanire' });
  });

  it('returns milestone at session 120', () => {
    localStorage.setItem('masteryCounters', JSON.stringify({ Squat: { count: 119, lastSessionTs: 0 } }));
    const m = incrementCounter('Squat');
    expect(m).toEqual({ count: 120, name: 'Maestru' });
  });

  it('does NOT re-fire milestone on session 11', () => {
    for (let i = 1; i <= 10; i++) incrementCounter('Squat');
    const m = incrementCounter('Squat');
    expect(m).toBeNull();
  });

  it('persists lastSessionTs', () => {
    incrementCounter('Squat', { now: 12345 });
    expect(getCounters().Squat.lastSessionTs).toBe(12345);
  });

  it('rejects empty exercise name', () => {
    expect(incrementCounter('')).toBeNull();
    expect(incrementCounter(null)).toBeNull();
  });
});

describe('getCurrentMilestone', () => {
  it('null below threshold', () => {
    for (let i = 1; i <= 9; i++) incrementCounter('Squat');
    expect(getCurrentMilestone('Squat')).toBeNull();
  });

  it('returns Inceput at 10-29', () => {
    for (let i = 1; i <= 15; i++) incrementCounter('Squat');
    expect(getCurrentMilestone('Squat').name).toBe('Inceput');
  });

  it('returns Maestru at 120+', () => {
    localStorage.setItem('masteryCounters', JSON.stringify({ Squat: { count: 200, lastSessionTs: 0 } }));
    expect(getCurrentMilestone('Squat').name).toBe('Maestru');
  });
});

describe('getNextMilestone', () => {
  it('returns Inceput for fresh exercise', () => {
    const next = getNextMilestone('Squat');
    expect(next.name).toBe('Inceput');
    expect(next.sessionsToGo).toBe(10);
  });

  it('returns sessions-to-go correctly mid-tier', () => {
    for (let i = 1; i <= 15; i++) incrementCounter('Squat');
    const next = getNextMilestone('Squat');
    expect(next.name).toBe('Constanta');
    expect(next.sessionsToGo).toBe(15);
  });

  it('returns null when Maestru reached', () => {
    localStorage.setItem('masteryCounters', JSON.stringify({ Squat: { count: 120, lastSessionTs: 0 } }));
    expect(getNextMilestone('Squat')).toBeNull();
  });
});

describe('formatMilestoneMessage', () => {
  it('LOCKED wording — Inceput', () => {
    const msg = formatMilestoneMessage({ count: 10, name: 'Inceput' }, 'Squat');
    expect(msg).toBe('Ai atins Inceput: 10 sesiuni complete la Squat.');
  });

  it('LOCKED wording — Maestru', () => {
    const msg = formatMilestoneMessage({ count: 120, name: 'Maestru' }, 'Bench Press');
    expect(msg).toBe('Ai atins Maestru: 120 sesiuni complete la Bench Press.');
  });

  it('returns empty on missing data', () => {
    expect(formatMilestoneMessage(null, 'Squat')).toBe('');
    expect(formatMilestoneMessage({ count: 10, name: 'Inceput' }, '')).toBe('');
  });

  it('Bugatti tone — no exclamation, no emoji', () => {
    const msg = formatMilestoneMessage({ count: 10, name: 'Inceput' }, 'Squat');
    expect(msg).not.toMatch(/[!]/);
    expect(msg).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });
});

describe('recordSessionComplete', () => {
  it('returns crossed=false when no milestone', () => {
    const res = recordSessionComplete('Squat');
    expect(res.crossed).toBe(false);
  });

  it('returns crossed=true with message when milestone hit', () => {
    for (let i = 1; i <= 9; i++) incrementCounter('Squat');
    const res = recordSessionComplete('Squat');
    expect(res.crossed).toBe(true);
    expect(res.milestone.count).toBe(10);
    expect(res.message).toBe('Ai atins Inceput: 10 sesiuni complete la Squat.');
  });
});

describe('resetCounters', () => {
  it('clears all counters', () => {
    incrementCounter('Squat');
    incrementCounter('Bench');
    resetCounters();
    expect(Object.keys(getCounters()).length).toBe(0);
  });
});
