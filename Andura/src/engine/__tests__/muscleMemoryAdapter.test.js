import { describe, it, expect, vi } from 'vitest';
import {
  applyMuscleMemoryUpgrade,
  readMmiState,
  computeWeeksSinceResume,
} from '../muscleMemoryAdapter.js';

const FAKE_DP = { roundToStep: (kg) => Math.round(kg * 2) / 2 };

function makeContext(overrides = {}) {
  return {
    userChoice: 'accepted',
    pauseMonths: 8,
    weeksSinceResume: 0,
    peakPrePauseKgPerExercise: { 'Bench': 100, 'Squat': 140 },
    ...overrides,
  };
}

describe('applyMuscleMemoryUpgrade() — no-op paths', () => {
  it('null recommendation → returned as-is', () => {
    expect(applyMuscleMemoryUpgrade(null, 'Bench', makeContext(), FAKE_DP)).toBeNull();
  });

  it('kg=0 → returned unchanged', () => {
    const rec = { kg: 0 };
    expect(applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP)).toBe(rec);
  });

  it('empty exercise name → returned unchanged', () => {
    const rec = { kg: 50 };
    expect(applyMuscleMemoryUpgrade(rec, '', makeContext(), FAKE_DP)).toBe(rec);
  });

  it('null mmiContext → returned unchanged', () => {
    const rec = { kg: 50 };
    expect(applyMuscleMemoryUpgrade(rec, 'Bench', null, FAKE_DP)).toBe(rec);
  });

  it('userChoice="refused" → baseline preserved (§32.3 — user refuse path)', () => {
    const rec = { kg: 50 };
    const ctx = makeContext({ userChoice: 'refused' });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(out.kg).toBe(50);
    expect(out._muscleMemoryApplied).toBeUndefined();
  });

  it('userChoice not yet decided (null) → baseline preserved', () => {
    const rec = { kg: 50 };
    const ctx = makeContext({ userChoice: null });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(out.kg).toBe(50);
  });

  it('no peak for this exercise → baseline preserved', () => {
    const rec = { kg: 50 };
    const ctx = makeContext({ peakPrePauseKgPerExercise: { 'OtherEx': 100 } });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(out.kg).toBe(50);
  });

  it('pauseMonths < 6 (under threshold) → baseline preserved', () => {
    const rec = { kg: 50 };
    const ctx = makeContext({ pauseMonths: 3 });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(out.kg).toBe(50);
  });
});

describe('applyMuscleMemoryUpgrade() — accepted path', () => {
  it('peak=100, pauseMonths=8, week=0 → 100×0.80×1.25 = 100 kg', () => {
    const rec = { kg: 60 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    // 100 * 0.80 = 80; * 1.25 = 100; rounded → 100
    expect(out.kg).toBe(100);
    expect(out._muscleMemoryApplied).toBe(true);
    expect(out._mmiOriginalKg).toBe(60);
    expect(out._mmiPeakPrePauseKg).toBe(100);
    expect(out._mmiStartMultiplier).toBe(0.80);
    expect(out._mmiBoostMultiplier).toBe(1.25);
  });

  it('peak=100, pauseMonths=8, week=3 → 80 kg (boost ended)', () => {
    const rec = { kg: 60 };
    const ctx = makeContext({ weeksSinceResume: 3 });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    // 100 * 0.80 = 80; * 1.00 = 80
    expect(out.kg).toBe(80);
    expect(out._mmiBoostMultiplier).toBe(1.0);
  });

  it('peak=100, pauseMonths=18 (12-24 bucket), week=0 → 100×0.70×1.10 = 77 → 77', () => {
    const rec = { kg: 50 };
    const ctx = makeContext({ pauseMonths: 18 });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    // 100 * 0.70 = 70; * 1.10 = 77; rounded to step (0.5) → 77
    expect(out.kg).toBe(77);
    expect(out._mmiStartMultiplier).toBe(0.70);
    expect(out._mmiBoostMultiplier).toBe(1.10);
  });

  it('peak=100, pauseMonths=36 (24+ bucket), week=0 → 100×0.60×1.00 = 60', () => {
    const rec = { kg: 50 };
    const ctx = makeContext({ pauseMonths: 36 });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(out.kg).toBe(60);
    expect(out._mmiStartMultiplier).toBe(0.60);
    expect(out._mmiBoostMultiplier).toBe(1.00);
  });

  it('forensic flags preserve audit trail (ADR 011 §append-only)', () => {
    const rec = { kg: 60, repsTarget: 8 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(out._muscleMemoryApplied).toBe(true);
    expect(out._mmiOriginalKg).toBe(60);
    expect(out._mmiPeakPrePauseKg).toBe(100);
    expect(out._mmiBucket).toBeDefined();
    expect(out._mmiBucket.startMultiplier).toBe(0.80);
  });

  it('preserves all other recommendation fields (shape passthrough)', () => {
    const rec = { kg: 60, repsTarget: 8, status: 'NORMAL', statusLabel: 'x', progressionStage: 1 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(out.repsTarget).toBe(8);
    expect(out.status).toBe('NORMAL');
    expect(out.statusLabel).toBe('x');
    expect(out.progressionStage).toBe(1);
  });

  it('does NOT mutate input recommendation (immutability)', () => {
    const rec = { kg: 60 };
    const before = JSON.stringify(rec);
    applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(JSON.stringify(rec)).toBe(before);
  });

  it('idempotent — same input → same output (ADR 018 §2)', () => {
    const rec = { kg: 60 };
    const ctx = makeContext();
    const o1 = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    const o2 = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(o1).toEqual(o2);
  });

  it('missing dpEngine → returns unrounded but still upgraded', () => {
    const rec = { kg: 60 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), null);
    expect(out._muscleMemoryApplied).toBe(true);
    expect(out.kg).toBeCloseTo(100, 5);
  });
});

describe('readMmiState() — I/O boundary helper', () => {
  it('null db → null', () => {
    expect(readMmiState(null)).toBeNull();
  });

  it('db without get → null', () => {
    expect(readMmiState({})).toBeNull();
  });

  it('db.get throws → null (defensive)', () => {
    const db = { get: vi.fn(() => { throw new Error('boom'); }) };
    expect(readMmiState(db)).toBeNull();
  });

  it('db.get returns object → returned as-is', () => {
    const state = { userChoice: 'accepted', pauseMonths: 8 };
    const db = { get: vi.fn(() => state) };
    expect(readMmiState(db)).toBe(state);
  });

  it('db.get returns null → null', () => {
    const db = { get: vi.fn(() => null) };
    expect(readMmiState(db)).toBeNull();
  });

  it('db.get returns non-object → null', () => {
    const db = { get: vi.fn(() => 'string') };
    expect(readMmiState(db)).toBeNull();
  });

  it('reads correct key "mmi-state"', () => {
    const db = { get: vi.fn(() => null) };
    readMmiState(db);
    expect(db.get).toHaveBeenCalledWith('mmi-state');
  });
});

describe('computeWeeksSinceResume() — pure helper', () => {
  it('resumeStartDate=2026-05-01, currentDate=2026-05-15 → 2 weeks', () => {
    expect(computeWeeksSinceResume('2026-05-01', '2026-05-15')).toBe(2);
  });

  it('same date → 0 weeks', () => {
    expect(computeWeeksSinceResume('2026-05-15', '2026-05-15')).toBe(0);
  });

  it('currentDate before resume → 0 (defensive)', () => {
    expect(computeWeeksSinceResume('2026-05-15', '2026-05-01')).toBe(0);
  });

  it('null/empty → 0', () => {
    expect(computeWeeksSinceResume(null, '2026-05-15')).toBe(0);
    expect(computeWeeksSinceResume('', '2026-05-15')).toBe(0);
    expect(computeWeeksSinceResume('2026-05-15', null)).toBe(0);
  });

  it('invalid date strings → 0', () => {
    expect(computeWeeksSinceResume('not-a-date', '2026-05-15')).toBe(0);
  });

  it('exactly 7 days → 1 week', () => {
    expect(computeWeeksSinceResume('2026-05-08', '2026-05-15')).toBe(1);
  });

  it('6 days → 0 weeks (floor)', () => {
    expect(computeWeeksSinceResume('2026-05-09', '2026-05-15')).toBe(0);
  });
});
