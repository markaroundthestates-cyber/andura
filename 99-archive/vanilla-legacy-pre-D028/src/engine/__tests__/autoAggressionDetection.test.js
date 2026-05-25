import { describe, it, expect } from 'vitest';
import {
  detectAutoAggression,
  aggregateAutoAggression,
  computeEscalation,
  _detectVolumeCreep,
  _detectCalorieAcceleration,
  _detectFrustrationMarkers,
  _detectIgnoreRecovery,
  _detectRecoveryDebt,
  _detectHyperfocusAmplifier,
  _computeCompositeFatigue,
  _computeTier,
} from '../autoAggressionDetection.js';
import {
  dateOffset,
  realWorkoutEntry,
  deviationEntry,
  skipEntry,
  entryWithAA,
  scenarioVolumeCreep,
  scenarioRecoveryDebt,
  scenarioCompositeFatigue,
  scenarioHyperfocus,
  scenarioClean,
} from '../../../tests/fixtures/cdlEntries.js';

// ── Signal #1 — Volume Creep ──────────────────────────────────────────────────

describe('_detectVolumeCreep', () => {
  it('triggers on 3 consecutive deviations within 21 days', () => {
    const entries = scenarioVolumeCreep({ count: 3, spreadDays: 3 });
    expect(_detectVolumeCreep(entries)).toBe(true);
  });

  it('does NOT trigger when 3 deviations span more than 21 days', () => {
    // 3 entries spread 11 days apart → span = 22 days > 21
    const entries = [
      deviationEntry({ date: dateOffset(22), proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: dateOffset(11), proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: dateOffset(0),  proposedSets: 16, actualSets: 20 }),
    ];
    expect(_detectVolumeCreep(entries)).toBe(false);
  });

  it('does NOT trigger when deviation has no volume creep (actualSets = proposedSets)', () => {
    const e1 = deviationEntry({ date: dateOffset(6), proposedSets: 16, actualSets: 20 });
    // Middle entry: deviation=true but no creep (actualSets === proposedSets)
    const e2 = { ...deviationEntry({ date: dateOffset(3) }), outcome: { ...deviationEntry({ date: dateOffset(3) }).outcome, actualSets: 16, proposedSets: 16 } };
    const e3 = deviationEntry({ date: dateOffset(0), proposedSets: 16, actualSets: 20 });
    expect(_detectVolumeCreep([e1, e2, e3])).toBe(false);
  });

  it('does NOT trigger when streak is broken by a non-deviation session', () => {
    const e1 = deviationEntry({ date: dateOffset(9), proposedSets: 16, actualSets: 20 });
    const e2 = realWorkoutEntry({ date: dateOffset(6) });   // no deviation — breaks streak
    const e3 = deviationEntry({ date: dateOffset(3), proposedSets: 16, actualSets: 20 });
    const e4 = deviationEntry({ date: dateOffset(0), proposedSets: 16, actualSets: 20 });
    expect(_detectVolumeCreep([e1, e2, e3, e4])).toBe(false);
  });
});

// ── Signal #2 — Calorie Acceleration ─────────────────────────────────────────

describe('_detectCalorieAcceleration', () => {
  it('triggers when kcal_target drops 350 kcal within 7 days', () => {
    const entries = [
      realWorkoutEntry({ date: dateOffset(6), kcal_target: 2500 }),
      realWorkoutEntry({ date: dateOffset(1), kcal_target: 2150 }),
    ];
    expect(_detectCalorieAcceleration(entries)).toBe(true);
  });

  it('does NOT trigger when kcal_target drops only 200 kcal in 7 days', () => {
    const entries = [
      realWorkoutEntry({ date: dateOffset(6), kcal_target: 2400 }),
      realWorkoutEntry({ date: dateOffset(1), kcal_target: 2200 }),
    ];
    expect(_detectCalorieAcceleration(entries)).toBe(false);
  });

  it('does NOT trigger when 600 kcal drop spans 14 days (outside 7-day window)', () => {
    const entries = [
      realWorkoutEntry({ date: dateOffset(14), kcal_target: 2800 }),
      realWorkoutEntry({ date: dateOffset(0),  kcal_target: 2200 }),
    ];
    expect(_detectCalorieAcceleration(entries)).toBe(false);
  });

  it('does NOT trigger when kcal_target is stable across all entries', () => {
    const entries = [
      realWorkoutEntry({ date: dateOffset(6), kcal_target: 2200 }),
      realWorkoutEntry({ date: dateOffset(3), kcal_target: 2210 }),
      realWorkoutEntry({ date: dateOffset(0), kcal_target: 2200 }),
    ];
    expect(_detectCalorieAcceleration(entries)).toBe(false);
  });
});

// ── Signal #3 — Frustration Markers ──────────────────────────────────────────

describe('_detectFrustrationMarkers', () => {
  it('triggers on rating=2 followed by volume creep within 14 days', () => {
    const e1 = realWorkoutEntry({ date: dateOffset(10), rating: 2 });
    const e2 = deviationEntry({ date: dateOffset(3), proposedSets: 16, actualSets: 20 });
    expect(_detectFrustrationMarkers([e1, e2])).toBe(true);
  });

  it('does NOT trigger on rating=2 without volume creep next session', () => {
    const e1 = realWorkoutEntry({ date: dateOffset(10), rating: 2 });
    const e2 = realWorkoutEntry({ date: dateOffset(3) });  // no deviation
    expect(_detectFrustrationMarkers([e1, e2])).toBe(false);
  });

  it('does NOT trigger on rating=3 (above threshold) with volume creep', () => {
    const e1 = realWorkoutEntry({ date: dateOffset(10), rating: 3 });
    const e2 = deviationEntry({ date: dateOffset(3), proposedSets: 16, actualSets: 20 });
    expect(_detectFrustrationMarkers([e1, e2])).toBe(false);
  });

  it('does NOT trigger when low rating and volume creep are more than 14 days apart', () => {
    const e1 = realWorkoutEntry({ date: dateOffset(20), rating: 2 });
    const e2 = deviationEntry({ date: dateOffset(3), proposedSets: 16, actualSets: 20 });
    expect(_detectFrustrationMarkers([e1, e2])).toBe(false);
  });
});

// ── Signal #4 — Ignore Recovery ──────────────────────────────────────────────

describe('_detectIgnoreRecovery', () => {
  it('triggers when 2+ fatigue sessions in 7 days with no early-stop and continued volume', () => {
    // Both entries have ≥50% Hard/Very Hard sets, no early stop, volume maintained
    const entries = scenarioCompositeFatigue({
      count: 2,
      setsRPE: [9, 10, 9, 9, 8],  // 4/5 = 80% Hard/Very Hard
      spreadDays: 2,
    });
    expect(_detectIgnoreRecovery(entries)).toBe(true);
  });

  it('does NOT trigger when an early-stop is logged in the window', () => {
    const entries = scenarioCompositeFatigue({
      count: 2,
      setsRPE: [9, 10, 9, 9, 8],
      spreadDays: 2,
      includeEarlyStop: true,
    });
    expect(_detectIgnoreRecovery(entries)).toBe(false);
  });

  it('does NOT trigger when only 1 fatigue session in the window', () => {
    const e1 = realWorkoutEntry({ date: dateOffset(4), setsRPE: [9, 10, 9, 9, 8] });  // fatigue
    const e2 = realWorkoutEntry({ date: dateOffset(2), setsRPE: [7, 8, 7, 8, 7] });  // no fatigue
    expect(_detectIgnoreRecovery([e1, e2])).toBe(false);
  });

  it('does NOT trigger when volume drops in fatigue sessions (recovery acknowledged)', () => {
    const e1 = realWorkoutEntry({ date: dateOffset(4), setsRPE: [9, 10, 9, 9, 8], proposedSets: 16, actualSets: 16 });
    // e2 has fatigue but dropped volume — user IS recovering
    const e2 = realWorkoutEntry({ date: dateOffset(2), setsRPE: [9, 10, 9, 9, 8], proposedSets: 16, actualSets: 8 });
    expect(_detectIgnoreRecovery([e1, e2])).toBe(false);
  });
});

// ── Signal #5 — Recovery Debt ─────────────────────────────────────────────────

describe('_detectRecoveryDebt (raw streak check)', () => {
  it('returns true on 3 consecutive ISO weeks with <2 rest_marked=true days', () => {
    const entries = scenarioRecoveryDebt({ weekCount: 3, restDaysPerWeek: 0 });
    expect(_detectRecoveryDebt(entries)).toBe(true);
  });

  it('returns false when streak breaks after 2 weeks (week 3 has ≥2 rest days)', () => {
    // W15: 0 rest days (streak=1), W16: 0 rest days (streak=2), W17: 2 rest days (streak resets)
    const entries = [
      realWorkoutEntry({ date: '2026-04-06' }),   // W15
      skipEntry({ date: '2026-04-07', restMarkedValue: false }),
      realWorkoutEntry({ date: '2026-04-13' }),   // W16
      skipEntry({ date: '2026-04-14', restMarkedValue: false }),
      skipEntry({ date: '2026-04-20', restMarkedValue: true }),  // W17 rest day 1
      skipEntry({ date: '2026-04-21', restMarkedValue: true }),  // W17 rest day 2 → streak breaks
    ];
    expect(_detectRecoveryDebt(entries)).toBe(false);
  });

  it('returns false when data spans only 2 consecutive weeks', () => {
    // Use absolute dates to avoid toISOString() timezone shift in fixture
    // W15 (Apr 6-12): 0 rest days → streak=1; W16 (Apr 13-19): 0 rest days → streak=2 → never reaches 3
    const entries = [
      realWorkoutEntry({ date: '2026-04-06' }),
      skipEntry({ date: '2026-04-07', restMarkedValue: false }),
      realWorkoutEntry({ date: '2026-04-13' }),
      skipEntry({ date: '2026-04-14', restMarkedValue: false }),
    ];
    expect(_detectRecoveryDebt(entries)).toBe(false);
  });
});

describe('detectAutoAggression — recovery debt combination rule', () => {
  it('includes recovery_debt in signals when combined with ≥1 other signal', () => {
    // Use absolute dates: 3 consecutive weeks <2 rest days (W15/W16/W17)
    // + 3 consecutive deviation entries in W17 that don't collide with debt workout dates
    const debtEntries = [
      realWorkoutEntry({ date: '2026-04-06' }),
      skipEntry({ date: '2026-04-07', restMarkedValue: false }),
      realWorkoutEntry({ date: '2026-04-13' }),
      skipEntry({ date: '2026-04-14', restMarkedValue: false }),
      realWorkoutEntry({ date: '2026-04-20' }),
      skipEntry({ date: '2026-04-21', restMarkedValue: false }),
    ];
    // Consecutive deviations on dates not occupied by debt workouts → streak unbroken
    const creepEntries = [
      deviationEntry({ date: '2026-04-22', proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: '2026-04-23', proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: '2026-04-24', proposedSets: 16, actualSets: 20 }),
    ];
    const allEntries = [...debtEntries, ...creepEntries];
    const result = detectAutoAggression({
      currentEntry: allEntries[allEntries.length - 1],
      recentEntries: allEntries.slice(0, -1),
    });
    expect(result.signals).toContain('volume_creep');
    expect(result.signals).toContain('recovery_debt');
  });

  it('excludes recovery_debt from signals when it is the only signal (singular = noise)', () => {
    const entries = scenarioRecoveryDebt({ weekCount: 3, restDaysPerWeek: 0 });
    const result = detectAutoAggression({
      currentEntry: entries[entries.length - 1],
      recentEntries: entries.slice(0, -1),
    });
    expect(result.signals).not.toContain('recovery_debt');
  });
});

// ── Composite + Integration ───────────────────────────────────────────────────

describe('_detectHyperfocusAmplifier', () => {
  it('returns amplified=true when daysWithHyperfocus ≥ 4', () => {
    const { cdlEntries, hyperfocusData } = scenarioHyperfocus({ daysWithHyperfocus: 5 });
    const result = detectAutoAggression({
      currentEntry: cdlEntries[cdlEntries.length - 1],
      recentEntries: cdlEntries.slice(0, -1),
      hyperfocusData,
    });
    expect(result.amplified).toBe(true);
    expect(result.amplifierReason).toBe('hyperfocus_pattern_8h_4days_per_week');
  });

  it('returns amplified=false when daysWithHyperfocus < 4', () => {
    const result = _detectHyperfocusAmplifier({ hoursInApp7d: 20, daysWithHyperfocus: 2 });
    expect(result.amplified).toBe(false);
    expect(result.reason).toBeNull();
  });
});

describe('computeEscalation', () => {
  it('returns true when MED tier appears in 2 consecutive ISO weeks', () => {
    const entries = [
      entryWithAA({ date: '2026-04-07', tier: 'MED' }),  // W15
      entryWithAA({ date: '2026-04-14', tier: 'MED' }),  // W16
    ];
    expect(computeEscalation(entries)).toBe(true);
  });

  it('returns false when MED tier appears in only 1 week', () => {
    const entries = [
      entryWithAA({ date: '2026-04-07', tier: 'MED' }),  // W15 only
    ];
    expect(computeEscalation(entries)).toBe(false);
  });

  it('returns false when MED weeks are non-consecutive (LOW week in between)', () => {
    const entries = [
      entryWithAA({ date: '2026-04-07', tier: 'MED' }),  // W15
      entryWithAA({ date: '2026-04-14', tier: 'LOW' }),  // W16 — breaks streak
      entryWithAA({ date: '2026-04-21', tier: 'MED' }),  // W17
    ];
    expect(computeEscalation(entries)).toBe(false);
  });
});

describe('aggregateAutoAggression', () => {
  it('returns tier=none and empty signals for clean entries (no AA populated)', () => {
    const entries = scenarioClean({ count: 8 });
    const result = aggregateAutoAggression(entries);
    expect(result.tier).toBe('none');
    expect(result.signals).toHaveLength(0);
    expect(result.escalating).toBe(false);
  });

  it('aggregates signals from entries with populated autoAggression', () => {
    const entries = [
      entryWithAA({ date: dateOffset(10), tier: 'LOW', signals: ['volume_creep'] }),
      entryWithAA({ date: dateOffset(5),  tier: 'MED', signals: ['volume_creep', 'frustration'] }),
    ];
    const result = aggregateAutoAggression(entries);
    expect(result.signals).toContain('volume_creep');
    expect(result.signals).toContain('frustration');
    expect(result.tier).toBe('MED');
  });

  it('excludes synthetic entries from aggregation', () => {
    const entries = [
      { ...entryWithAA({ date: dateOffset(5), tier: 'HIGH', signals: ['volume_creep'] }), synthetic: true },
    ];
    const result = aggregateAutoAggression(entries);
    expect(result.tier).toBe('none');
    expect(result.signals).toHaveLength(0);
  });

  it('returns empty result for empty input', () => {
    expect(aggregateAutoAggression([])).toMatchObject({ tier: 'none', signals: [] });
    expect(aggregateAutoAggression(null)).toMatchObject({ tier: 'none', signals: [] });
  });
});

describe('detectAutoAggression — clean profile', () => {
  it('returns tier=none and no signals for clean workout history', () => {
    const entries = scenarioClean({ count: 10 });
    const result = detectAutoAggression({
      currentEntry: entries[entries.length - 1],
      recentEntries: entries.slice(0, -1),
    });
    expect(result.tier).toBe('none');
    expect(result.signals).toHaveLength(0);
    expect(result.escalating).toBe(false);
    expect(result.amplified).toBe(false);
  });
});

describe('_computeTier — boundary cases', () => {
  it('maps 0 → none, 1 → LOW, 2 → MED, 3 → MED, 4 → HIGH, 5 → HIGH', () => {
    expect(_computeTier(0)).toBe('none');
    expect(_computeTier(1)).toBe('LOW');
    expect(_computeTier(2)).toBe('MED');
    expect(_computeTier(3)).toBe('MED');
    expect(_computeTier(4)).toBe('HIGH');
    expect(_computeTier(5)).toBe('HIGH');
  });

  it('returns none for negative input', () => {
    expect(_computeTier(-1)).toBe('none');
  });
});

describe('_computeCompositeFatigue', () => {
  it('returns true when ≥50% sets are Hard or Very Hard', () => {
    const entry = realWorkoutEntry({ setsRPE: [9, 10, 9, 7, 8] });  // 3/5 = 60% ≥9
    expect(_computeCompositeFatigue(entry)).toBe(true);
  });

  it('returns false when <50% sets are Hard or Very Hard', () => {
    const entry = realWorkoutEntry({ setsRPE: [7, 8, 9, 7, 7] });  // 1/5 = 20% ≥9
    expect(_computeCompositeFatigue(entry)).toBe(false);
  });

  it('excludes unrated sets from denominator', () => {
    // setsRPE = [9, 10] — only 2 rated, both Hard → 100% ≥9
    const entry = realWorkoutEntry({ setsRPE: [9, 10] });
    expect(_computeCompositeFatigue(entry)).toBe(true);
  });

  it('falls back to numeric rating ≤2 proxy when setsRPE is absent', () => {
    const entryLow = realWorkoutEntry({ rating: 2 });
    const entryNorm = realWorkoutEntry({ rating: 3 });
    expect(_computeCompositeFatigue(entryLow)).toBe(true);
    expect(_computeCompositeFatigue(entryNorm)).toBe(false);
  });
});
