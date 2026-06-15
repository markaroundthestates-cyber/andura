// CROSS-WEEK CARRYOVER BALANCE — PURE unit tests (dp_carryover_balance_v1,
// 2026-06-15). detectOwedClusters flags a region SCHEDULED last microcycle that
// got ZERO real working sets; reorderSplitForCarryover front-loads it this week
// (placement only — same day-type multiset, never last, spacing-safe). The OFF /
// empty-owed arm MUST be byte-identical to the legacy split. Deterministic: every
// time comes from the injected clock, never Date.now().

import { describe, it, expect } from 'vitest';
import { detectOwedClusters } from '../scheduleAdapter/carryoverBalance.js';
import { clusterForDay, frequencyToSplit, reorderSplitForCarryover } from '../scheduleAdapter/frequencySplit.js';

// A fixed planning clock (Thu 2026-06-04, LOCAL). resolveWeekStartMs derives the
// LOCAL MONDAY 00:00 of nowMs's week (the Monday-anchored microcycle boundary, like
// getWeekStartIso / mapDateToIndex) — Monday 2026-06-01 local — so the prior window
// [Monday-7d, Monday) is deterministic from nowMs. Built with LOCAL Date so the test
// agrees with the function's local-weekday math on any test machine's timezone.
const NOW_MS = new Date(2026, 5, 4, 12, 0, 0).getTime(); // Thu 2026-06-04 12:00 local
const WEEK_START = new Date(2026, 5, 1, 0, 0, 0, 0).getTime(); // Monday 2026-06-01 00:00 local
const IN_WINDOW = new Date(2026, 4, 30, 12, 0, 0).getTime(); // Sat 2026-05-30 — inside [Mon-7d, Mon)

// Real canonical exercises (verified muscle_target_primary RO group):
const EX = {
  chest: 'Incline DB Press',         // piept   → push/upper
  back: 'Lat Pulldown',              // spate   → pull/upper
  shoulders: 'DB Shoulder Press',    // umeri   → push/upper
  biceps: 'Incline DB Curl',         // biceps  → pull/upper
  quads: 'Leg Press',                // picioare-quads      → lower/legs
  hams: 'Romanian Deadlift',         // picioare-hamstrings → lower/legs
};

const log = (ex, ts) => ({ ex, ts, w: 50, reps: 8 });

// v-taper @4d week: Wed/Thu/Fri/Sat (indices 2,3,4,5). The de-emph template
// FOCUS_LOWER_DEEMPH_SPLITS[4] = ['push','pull','upper','lower'] → lower is LAST.
const VTAPER_WEEK = [false, false, true, true, true, true, false];
const ACTIVE_IDXS = [2, 3, 4, 5];

describe('detectOwedClusters — detection', () => {
  it('a region scheduled last week with ZERO in-window logs → owed', () => {
    // Only upper-body work last week → push/pull/upper all received real sets,
    // lower received NONE → owed = ['lower'].
    const recoveryLogs = [
      log(EX.chest, IN_WINDOW),
      log(EX.back, IN_WINDOW),
      log(EX.shoulders, IN_WINDOW),
      log(EX.biceps, IN_WINDOW),
    ];
    const owed = detectOwedClusters({
      recoveryLogs,
      activeWeek: VTAPER_WEEK,
      focusPreset: 'v-taper',
      nowMs: NOW_MS,
    });
    expect(owed).toEqual(['lower']);
  });

  it('a region TRAINED last week → not owed', () => {
    // Lower IS trained → lower not owed. Push/pull/upper also covered → owed empty.
    const recoveryLogs = [
      log(EX.chest, IN_WINDOW),
      log(EX.back, IN_WINDOW),
      log(EX.shoulders, IN_WINDOW),
      log(EX.biceps, IN_WINDOW),
      log(EX.quads, IN_WINDOW),
      log(EX.hams, IN_WINDOW),
    ];
    const owed = detectOwedClusters({
      recoveryLogs,
      activeWeek: VTAPER_WEEK,
      focusPreset: 'v-taper',
      nowMs: NOW_MS,
    });
    expect(owed).toEqual([]);
  });

  it('a log OUTSIDE the prior window does not count as trained', () => {
    // A lower log timestamped at NOW (this week, not the prior window) must NOT
    // rescue lower → lower is still owed.
    const recoveryLogs = [
      log(EX.chest, IN_WINDOW),
      log(EX.back, IN_WINDOW),
      log(EX.shoulders, IN_WINDOW),
      log(EX.biceps, IN_WINDOW),
      log(EX.quads, NOW_MS), // this week, outside [start-7d, start)
    ];
    const owed = detectOwedClusters({
      recoveryLogs,
      activeWeek: VTAPER_WEEK,
      focusPreset: 'v-taper',
      nowMs: NOW_MS,
    });
    expect(owed).toEqual(['lower']);
  });

  it('cold-start (no logs) → []', () => {
    expect(detectOwedClusters({
      recoveryLogs: [],
      activeWeek: VTAPER_WEEK,
      focusPreset: 'v-taper',
      nowMs: NOW_MS,
    })).toEqual([]);
  });

  it('malformed inputs → [] (graceful)', () => {
    expect(detectOwedClusters({ recoveryLogs: null, activeWeek: VTAPER_WEEK, nowMs: NOW_MS })).toEqual([]);
    expect(detectOwedClusters({ recoveryLogs: [], activeWeek: null, nowMs: NOW_MS })).toEqual([]);
    expect(detectOwedClusters({ recoveryLogs: [log(EX.chest, IN_WINDOW)], activeWeek: VTAPER_WEEK })).toEqual([]); // no nowMs/weekStartMs
    expect(detectOwedClusters()).toEqual([]);
  });

  it('honors an explicit weekStartMs over nowMs', () => {
    // With weekStartMs supplied, the window is [weekStartMs-7d, weekStartMs).
    const owed = detectOwedClusters({
      recoveryLogs: [log(EX.chest, IN_WINDOW), log(EX.back, IN_WINDOW), log(EX.shoulders, IN_WINDOW), log(EX.biceps, IN_WINDOW)],
      activeWeek: VTAPER_WEEK,
      focusPreset: 'v-taper',
      nowMs: 0, // would be useless, but weekStartMs takes precedence
      weekStartMs: WEEK_START,
    });
    expect(owed).toEqual(['lower']);
  });
});

describe('reorderSplitForCarryover — placement', () => {
  it("owed 'lower' last in [push,pull,upper,lower] → moved earlier, NOT last, multiset preserved", () => {
    const split = ['push', 'pull', 'upper', 'lower'];
    const out = reorderSplitForCarryover(split, ['lower']);
    expect(out[out.length - 1]).not.toBe('lower'); // no longer last
    expect(out.indexOf('lower')).toBeLessThan(split.length - 1); // earlier slot
    // Same day-type multiset (placement only, no add/drop).
    expect([...out].sort()).toEqual([...split].sort());
    // Reordering must not add same-cluster adjacency (all distinct here → 0).
    const adj = (s) => s.reduce((n, c, i) => n + (i > 0 && s[i - 1] === c ? 1 : 0), 0);
    expect(adj(out)).toBeLessThanOrEqual(adj(split));
  });

  it('non-owed split is returned UNCHANGED (byte-identical)', () => {
    const split = ['push', 'pull', 'upper', 'lower'];
    expect(reorderSplitForCarryover(split, [])).toBe(split); // same reference, no copy
    expect(reorderSplitForCarryover(split, ['push'])).toEqual(split); // push already first → no move
  });

  it('owed push (chest-only) goes to an earlier non-adjacency-worsening slot', () => {
    const split = ['pull', 'upper', 'lower', 'push'];
    const out = reorderSplitForCarryover(split, ['push']);
    expect(out.indexOf('push')).toBeLessThan(split.length - 1);
    expect([...out].sort()).toEqual([...split].sort());
  });
});

describe('determinism — same inputs × 2 are byte-identical', () => {
  const recoveryLogs = [
    log(EX.chest, IN_WINDOW),
    log(EX.back, IN_WINDOW),
    log(EX.shoulders, IN_WINDOW),
    log(EX.biceps, IN_WINDOW),
  ];
  it('detectOwedClusters is deterministic', () => {
    const a = detectOwedClusters({ recoveryLogs, activeWeek: VTAPER_WEEK, focusPreset: 'v-taper', nowMs: NOW_MS });
    const b = detectOwedClusters({ recoveryLogs, activeWeek: VTAPER_WEEK, focusPreset: 'v-taper', nowMs: NOW_MS });
    expect(a).toEqual(b);
  });
  it('reorderSplitForCarryover is deterministic', () => {
    const split = ['push', 'pull', 'upper', 'lower'];
    const a = reorderSplitForCarryover(split, ['lower']);
    const b = reorderSplitForCarryover(split, ['lower']);
    expect(a).toEqual(b);
  });
});

describe('empty owed → clusterForDay byte-identical across all positions', () => {
  it('matches the legacy clusterForDay for >=3 clusters (the flag-OFF guarantee)', () => {
    // Empty owedClusters → reorderSplitForCarryover returns the split unchanged →
    // every day's cluster is identical to the no-owed default-arg path.
    for (let preset of ['balanced', 'v-taper', 'lower']) {
      for (let day = 0; day < 7; day++) {
        const legacy = clusterForDay(VTAPER_WEEK, day, preset, false); // default owed []
        const withEmpty = clusterForDay(VTAPER_WEEK, day, preset, false, []);
        expect(withEmpty, `preset=${preset} day=${day}`).toBe(legacy);
      }
    }
    // And the split itself is byte-identical with empty owed.
    expect(frequencyToSplit(4, 'v-taper', false, [])).toEqual(frequencyToSplit(4, 'v-taper', false));
  });
});

describe('FOUNDER CASE — v-taper @4d, skipped lower last week', () => {
  it('this week the lower cluster is NOT the last active-day cluster', () => {
    // Last week: zero lower-body work logged (only upper-body), so detect flags lower.
    const recoveryLogs = [
      log(EX.chest, IN_WINDOW),
      log(EX.back, IN_WINDOW),
      log(EX.shoulders, IN_WINDOW),
      log(EX.biceps, IN_WINDOW),
    ];
    const owed = detectOwedClusters({
      recoveryLogs,
      activeWeek: VTAPER_WEEK,
      focusPreset: 'v-taper',
      nowMs: NOW_MS,
    });
    expect(owed).toContain('lower');

    // BEFORE: the last active day (Sat, idx 5) was 'lower'.
    const lastActiveDay = ACTIVE_IDXS[ACTIVE_IDXS.length - 1];
    expect(clusterForDay(VTAPER_WEEK, lastActiveDay, 'v-taper', false)).toBe('lower');

    // AFTER (owed threaded): the lower cluster is moved off the last slot — the
    // last active-day cluster is no longer 'lower' (the user trains legs fresh).
    const clustersAfter = ACTIVE_IDXS.map((d) => clusterForDay(VTAPER_WEEK, d, 'v-taper', false, owed));
    expect(clustersAfter[clustersAfter.length - 1]).not.toBe('lower');
    // 'lower' is still trained this week (placement only — never dropped).
    expect(clustersAfter).toContain('lower');
    // Same day-type multiset as the legacy week (no add/drop).
    const clustersBefore = ACTIVE_IDXS.map((d) => clusterForDay(VTAPER_WEEK, d, 'v-taper', false));
    expect([...clustersAfter].sort()).toEqual([...clustersBefore].sort());
  });
});
