import { describe, it, expect, beforeEach } from 'vitest';
import { AA } from '../aa.js';

const today = new Date().toISOString().slice(0, 10);

function makeLogs(count, notes = []) {
  return Array.from({ length: count }, (_, i) => ({
    ex: 'Bench Press', w: 80, reps: '8', baseline: false,
    date: today, ts: Date.now() - i * 3600000 * 24,
    session: Date.now() - i * 3600000 * 24,
    notes: i === 0 ? notes : [],
  }));
}

describe('AA.getRecoveryContext', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns ok:true when no notes', () => {
    localStorage.setItem('logs', JSON.stringify(makeLogs(6)));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.ok).toBe(true);
    expect(ctx.reason).toBeNull();
  });

  it('suppressDecrease when sleep bad in 2+ sessions', () => {
    const logs = [
      ...makeLogs(2, ['sleep']),
      ...makeLogs(4),
    ].map((l, i) => ({
      ...l, session: Date.now() - i * 86400000 * 2, ts: Date.now() - i * 86400000 * 2,
      notes: i < 2 ? ['sleep'] : [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.suppressDecrease).toBe(true);
  });

  it('forceDeload when fatigue >= 3', () => {
    const logs = Array.from({ length: 6 }, (_, i) => ({
      ex: 'Bench Press', w: 80, reps: '8', baseline: false,
      date: today, ts: Date.now() - i * 86400000 * 2,
      session: Date.now() - i * 86400000 * 2,
      notes: i < 3 ? ['fatigue'] : [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.forceDeload).toBe(true);
    expect(ctx.suppressIncrease).toBe(true);
  });
});

describe('AA.check — notes-only, no RPE dependency', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns null with no signals (no RPE increase trigger)', () => {
    // 6 clean logs, no notes — should NOT trigger increase (RPE logic removed)
    const logs = Array.from({ length: 6 }, (_, i) => ({
      ex: 'Squat', w: 100, reps: '5', baseline: false,
      date: today, ts: Date.now() - i * 86400000 * 2,
      session: Date.now() - i * 86400000 * 2,
      notes: [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    const result = AA.check('Squat');
    expect(result).toBeNull();
  });

  it('returns null with fewer than 4 logs', () => {
    const logs = Array.from({ length: 3 }, (_, i) => ({
      ex: 'Squat', w: 100, reps: '5', baseline: false,
      date: today, ts: Date.now() - i * 86400000,
      session: Date.now() - i * 86400000, notes: [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    expect(AA.check('Squat')).toBeNull();
  });
});
