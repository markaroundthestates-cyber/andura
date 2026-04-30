import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { getAdherenceScore, computeAdherence } from '../adherence.js';

const { mockReadActiveForDate, mockReadAllActive } = vi.hoisted(() => ({
  mockReadActiveForDate: vi.fn(() => null),
  mockReadAllActive: vi.fn(() => []),
}));

vi.mock('../../util/coachDecisionLog.js', () => ({
  readActiveForDate: mockReadActiveForDate,
  readAllActive: mockReadAllActive,
}));

// Local date (YYYY-MM-DD) — matches `tod()` in src/db.js. Avoids UTC/local
// rollover flake (D6 — would fail when local crosses midnight before UTC).
const today = new Date().toLocaleDateString('sv');

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

// Tuesday 28 Apr 2026 → JS getDay()=2 → dayMap[2]=1 → PROG[1]=Marți (t:'free') = workout day
// Monday  27 Apr 2026 → JS getDay()=1 → dayMap[1]=0 → PROG[0]=Luni  (t:'off')  = rest day
const TUESDAY_APR28 = new Date(2026, 3, 28, 12, 0, 0);
const MONDAY_APR27  = new Date(2026, 3, 27, 12, 0, 0);

describe('getAdherenceScore — CDL workout pillar', () => {
  beforeAll(() => { vi.useFakeTimers(); });
  afterAll(() => { vi.useRealTimers(); });

  beforeEach(() => {
    localStorage.clear();
    mockReadActiveForDate.mockReturnValue(null);
  });

  it('rest day (Monday/PROG[0]=off) → automatic +30p regardless of CDL or logs', () => {
    vi.setSystemTime(MONDAY_APR27);
    const { score } = getAdherenceScore();
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('workout day + CDL executed=true → +30p workout', () => {
    vi.setSystemTime(TUESDAY_APR28);
    mockReadActiveForDate.mockReturnValue({ outcome: { executed: true } });
    const { score } = getAdherenceScore();
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('workout day + CDL executed=false → 0p (no kcal/prot/weight in setup)', () => {
    vi.setSystemTime(TUESDAY_APR28);
    mockReadActiveForDate.mockReturnValue({ outcome: { executed: false } });
    const { score } = getAdherenceScore();
    expect(score).toBe(0);
  });

  it("workout day + CDL executed='partial' → +30p workout", () => {
    vi.setSystemTime(TUESDAY_APR28);
    mockReadActiveForDate.mockReturnValue({ outcome: { executed: 'partial' } });
    const { score } = getAdherenceScore();
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('workout day + CDL outcome=null → falls back to logs (logs present → +30p)', () => {
    vi.setSystemTime(TUESDAY_APR28);
    mockReadActiveForDate.mockReturnValue({ outcome: null });
    setLogs([{ date: '2026-04-28', ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 1, session: 1 }]);
    const { score } = getAdherenceScore();
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('workout day + no CDL entry → falls back to logs (logs present → +30p)', () => {
    vi.setSystemTime(TUESDAY_APR28);
    // mockReadActiveForDate returns null by default (reset in beforeEach)
    setLogs([{ date: '2026-04-28', ex: 'Bench Press', w: 80, reps: '8', baseline: false, ts: 1, session: 1 }]);
    const { score } = getAdherenceScore();
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('workout day + no CDL + no logs → 0p workout → total 0', () => {
    vi.setSystemTime(TUESDAY_APR28);
    // mockReadActiveForDate returns null, localStorage is clear
    const { score } = getAdherenceScore();
    expect(score).toBe(0);
  });
});

describe('computeAdherence — CDL pure', () => {
  beforeEach(() => {
    mockReadAllActive.mockReturnValue([]);
  });

  function makeEntry(executed, deviation = false) {
    return {
      date: '2026-04-01',
      synthetic: false,
      outcome: { executed, deviation },
    };
  }

  it('empty CDL → score null, all zeros', () => {
    const result = computeAdherence();
    expect(result).toEqual({ score: null, proposed: 0, executed: 0, partial: 0, skipped: 0, deviated: 0 });
  });

  it('all executed=true → score 100', () => {
    mockReadAllActive.mockReturnValue([makeEntry(true), makeEntry(true), makeEntry(true)]);
    const { score, proposed, executed } = computeAdherence();
    expect(proposed).toBe(3);
    expect(executed).toBe(3);
    expect(score).toBe(100);
  });

  it('2 executed + 2 partial → score 75', () => {
    mockReadAllActive.mockReturnValue([
      makeEntry(true), makeEntry(true),
      makeEntry('partial'), makeEntry('partial'),
    ]);
    const { score, proposed, executed, partial } = computeAdherence();
    expect(proposed).toBe(4);
    expect(executed).toBe(2);
    expect(partial).toBe(2);
    expect(score).toBe(75);
  });

  it('all skipped → score 0', () => {
    mockReadAllActive.mockReturnValue([makeEntry(false), makeEntry(false), makeEntry(false)]);
    const { score, skipped } = computeAdherence();
    expect(skipped).toBe(3);
    expect(score).toBe(0);
  });

  it('deviated entries skipped in exec/partial/skipped counts, included in proposed', () => {
    mockReadAllActive.mockReturnValue([
      makeEntry(true),
      makeEntry(true),
      makeEntry(true, true),
      makeEntry(true, true),
    ]);
    const { score, proposed, executed, deviated } = computeAdherence();
    expect(proposed).toBe(4);
    expect(executed).toBe(2);
    expect(deviated).toBe(2);
    // rawScore = (2 × 1.0) / 4 × 100 = 50
    expect(score).toBe(50);
  });

  it('all deviated → score 0, deviated counter correct', () => {
    mockReadAllActive.mockReturnValue([
      makeEntry(true, true), makeEntry(true, true), makeEntry(true, true),
    ]);
    const { score, proposed, deviated, executed } = computeAdherence();
    expect(proposed).toBe(3);
    expect(deviated).toBe(3);
    expect(executed).toBe(0);
    expect(score).toBe(0);
  });

  it('mixed: 1 exec + 1 partial + 1 skipped + 1 deviated → score 38', () => {
    mockReadAllActive.mockReturnValue([
      makeEntry(true),
      makeEntry('partial'),
      makeEntry(false),
      makeEntry(true, true),
    ]);
    const result = computeAdherence();
    expect(result.proposed).toBe(4);
    expect(result.executed).toBe(1);
    expect(result.partial).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.deviated).toBe(1);
    // rawScore = (1 × 1.0 + 1 × 0.5) / 4 × 100 = 37.5 → rounds to 38
    expect(result.score).toBe(38);
  });
});
