import { describe, it, expect, beforeEach } from 'vitest';
import { getAdherenceScore } from '../adherence.js';

const today = new Date().toISOString().slice(0, 10);

function setLogs(logs) {
  localStorage.setItem('logs', JSON.stringify(logs));
}

describe('getAdherenceScore — workout compliance', () => {
  beforeEach(() => { localStorage.clear(); });

  it('counts 3 real sets as workout done', () => {
    setLogs([
      { date: today, ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 1, session: 1 },
      { date: today, ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 2, session: 1 },
      { date: today, ex: 'Squat',       w: 100, reps: '5', baseline: false, ts: 3, session: 1 },
    ]);
    const { score } = getAdherenceScore();
    // workout compliance (+30) should be awarded since todayLogs.length > 0
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('does NOT count __early_stop__ marker as a workout set', () => {
    // Only log for today is the early_stop marker — no real sets
    setLogs([
      { date: today, ex: '__early_stop__', w: 0, reps: '0', baseline: false, ts: 1, session: 1,
        earlyStop: { reason: 'tired', setsCompleted: 0, totalSets: 6 } },
    ]);
    const { score: scoreWithMarker } = getAdherenceScore();

    // Compare to truly empty logs
    localStorage.setItem('logs', '[]');
    const { score: scoreEmpty } = getAdherenceScore();

    expect(scoreWithMarker).toBe(scoreEmpty);
  });

  it('counts real sets even when early_stop marker is also present', () => {
    setLogs([
      { date: today, ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 1, session: 1 },
      { date: today, ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 2, session: 1 },
      { date: today, ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 3, session: 1 },
      { date: today, ex: '__early_stop__', w: 0, reps: '0', baseline: false, ts: 4, session: 1,
        earlyStop: { reason: 'time', setsCompleted: 3, totalSets: 6 } },
    ]);
    const { score } = getAdherenceScore();
    expect(score).toBeGreaterThanOrEqual(30);
  });
});
