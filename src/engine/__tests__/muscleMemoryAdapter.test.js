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

describe('applyMuscleMemoryUpgrade() — TRUE CAP (option c, 2026-06-17)', () => {
  // The MMI return weight is now a Math.min CAP: it can only ever LOWER the
  // incoming DP rec, never raise it above DP's own return-deload. A high incoming
  // rec is capped DOWN to the MMI weight; a rec already at/below the MMI weight is
  // left unchanged (no forensic flags, since no cap bit).

  it('CAP bites: incoming 130 > MMI 100 (peak=100, 8mo, wk0) → capped to 100', () => {
    const rec = { kg: 130 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    // MMI return = 100 * 0.80 * 1.25 = 100; min(130, 100) = 100 → cap bites.
    expect(out.kg).toBe(100);
    expect(out._muscleMemoryApplied).toBe(true);
    expect(out._mmiOriginalKg).toBe(130);
    expect(out._mmiPeakPrePauseKg).toBe(100);
    expect(out._mmiStartMultiplier).toBe(0.80);
    expect(out._mmiBoostMultiplier).toBe(1.25);
  });

  it('NO-OP: incoming 60 < MMI 100 → left UNCHANGED (cap never raises)', () => {
    // This is the option-c contract: DP's safer ~0.60x deload (60) is BELOW the
    // ~0.77x MMI start, so min wins → the rec stays at 60, NEVER raised to 100.
    const rec = { kg: 60 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(out.kg).toBe(60);
    expect(out._muscleMemoryApplied).toBeUndefined();
    expect(out).toBe(rec); // unchanged reference (no fabricated cap)
  });

  it('CAP bites at 24+ bucket: incoming 90 > MMI 60 (peak=100, 36mo) → 60', () => {
    const rec = { kg: 90 };
    const ctx = makeContext({ pauseMonths: 36 });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    // MMI return = 100 * 0.60 * 1.00 = 60; min(90, 60) = 60.
    expect(out.kg).toBe(60);
    expect(out._mmiStartMultiplier).toBe(0.60);
    expect(out._mmiBoostMultiplier).toBe(1.00);
  });

  it('CAP bites: 12-24 bucket incoming 120 > MMI 77 (peak=100, 18mo) → 77', () => {
    const rec = { kg: 120 };
    const ctx = makeContext({ pauseMonths: 18 });
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    // MMI return = 100 * 0.70 * 1.10 = 77; min(120, 77) = 77.
    expect(out.kg).toBe(77);
    expect(out._mmiStartMultiplier).toBe(0.70);
    expect(out._mmiBoostMultiplier).toBe(1.10);
  });

  it('forensic flags preserve audit trail when the cap bites (ADR 011)', () => {
    const rec = { kg: 130, repsTarget: 8 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(out._muscleMemoryApplied).toBe(true);
    expect(out._mmiOriginalKg).toBe(130);
    expect(out._mmiPeakPrePauseKg).toBe(100);
    expect(out._mmiBucket).toBeDefined();
    expect(out._mmiBucket.startMultiplier).toBe(0.80);
  });

  it('preserves all other recommendation fields when the cap bites', () => {
    const rec = { kg: 130, repsTarget: 8, status: 'NORMAL', statusLabel: 'x', progressionStage: 1 };
    const out = applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(out.repsTarget).toBe(8);
    expect(out.status).toBe('NORMAL');
    expect(out.statusLabel).toBe('x');
    expect(out.progressionStage).toBe(1);
  });

  it('does NOT mutate input recommendation (immutability)', () => {
    const rec = { kg: 130 };
    const before = JSON.stringify(rec);
    applyMuscleMemoryUpgrade(rec, 'Bench', makeContext(), FAKE_DP);
    expect(JSON.stringify(rec)).toBe(before);
  });

  it('idempotent — same input → same output (ADR 018 §2)', () => {
    const rec = { kg: 130 };
    const ctx = makeContext();
    const o1 = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    const o2 = applyMuscleMemoryUpgrade(rec, 'Bench', ctx, FAKE_DP);
    expect(o1).toEqual(o2);
  });

  it('missing dpEngine → caps (unrounded) when the MMI weight is below the rec', () => {
    const rec = { kg: 130 };
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
