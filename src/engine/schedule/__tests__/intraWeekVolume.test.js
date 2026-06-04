// ══ INTRA-WEEK VOLUME — measurement layer tests (Phase 1, UNWIRED) ═════════
// Pure-function coverage: done working-set volume per Big-11 EN group across the
// current microcycle window + recover-only deficit. Uses REAL library exercises
// so the RO→EN mapping (BIG11_RO_TO_EN_MAP) is exercised end-to-end.

import { describe, it, expect } from 'vitest';
import {
  doneVolumeByGroupThisWeek,
  deficitByGroup,
  SECONDARY_SET_CREDIT,
} from '../intraWeekVolume.js';

// Window: [weekStart, now]. Pick stable epoch ms.
const WEEK_START = Date.UTC(2026, 5, 1, 0, 0, 0); // Mon 2026-06-01 00:00 UTC
const NOW = Date.UTC(2026, 5, 4, 12, 0, 0); // Thu 2026-06-04 12:00 UTC

/** Build a logged session with N sets per exercise. */
function session(ts, exercises) {
  return {
    ts,
    title: 'Test',
    exercises: exercises.map(([name, nSets]) => ({
      exerciseName: name,
      sets: Array.from({ length: nSets }, () => ({ kg: 50, reps: 8 })),
    })),
  };
}

describe('SECONDARY_SET_CREDIT', () => {
  it('defaults to 0.5', () => {
    expect(SECONDARY_SET_CREDIT).toBe(0.5);
  });
});

describe('doneVolumeByGroupThisWeek', () => {
  it('counts logged sets per PRIMARY group, EN-keyed (matches volumeTargets keys)', () => {
    // Flat DB Press: primary piept→chest, secondary [triceps]→triceps
    const done = doneVolumeByGroupThisWeek([session(NOW - 1000, [['Flat DB Press', 4]])], WEEK_START, NOW);
    expect(done.chest).toBe(4);
    // secondary credit 0.5 * 4 = 2
    expect(done.triceps).toBe(2);
  });

  it('credits 0.5 per set to EACH secondary group', () => {
    // Incline DB Press: primary piept, secondary [umeri, triceps]
    const done = doneVolumeByGroupThisWeek([session(NOW - 1, [['Incline DB Press', 3]])], WEEK_START, NOW);
    expect(done.chest).toBe(3);
    expect(done.shoulders).toBe(1.5);
    expect(done.triceps).toBe(1.5);
  });

  it('maps all Big-11 RO keys to volumeTargets-compatible EN keys', () => {
    const done = doneVolumeByGroupThisWeek(
      [
        session(NOW - 5, [
          ['Romanian Deadlift', 2], // primary picioare-hamstrings→hamstrings, secondary spate→back
          ['Lat Pulldown', 2], // primary spate→back, secondary biceps→biceps
        ]),
      ],
      WEEK_START,
      NOW,
    );
    expect(done.hamstrings).toBe(2); // RDL primary
    // back: RDL secondary (0.5*2=1) + Lat Pulldown primary (2) = 3
    expect(done.back).toBe(3);
    expect(done.biceps).toBe(1); // Lat Pulldown secondary 0.5*2
    // keys are EN (volumeTargets vocab), never RO
    for (const k of Object.keys(done)) {
      expect(['picioare-hamstrings', 'spate', 'piept']).not.toContain(k);
    }
  });

  it('aggregates across multiple in-window sessions', () => {
    const done = doneVolumeByGroupThisWeek(
      [
        session(WEEK_START + 1000, [['Flat DB Press', 4]]),
        session(NOW - 1000, [['Flat DB Press', 3]]),
      ],
      WEEK_START,
      NOW,
    );
    expect(done.chest).toBe(7);
    expect(done.triceps).toBe(3.5); // (4+3)*0.5
  });

  it('excludes sessions before weekStart and after now', () => {
    const done = doneVolumeByGroupThisWeek(
      [
        session(WEEK_START - 1, [['Flat DB Press', 5]]), // before window
        session(NOW + 1, [['Flat DB Press', 5]]), // after window
        session(NOW, [['Flat DB Press', 2]]), // exactly at boundary → included
        session(WEEK_START, [['Flat DB Press', 1]]), // exactly at boundary → included
      ],
      WEEK_START,
      NOW,
    );
    expect(done.chest).toBe(3); // only the two boundary-inclusive sessions
  });

  it('honors a custom secondaryCredit via opts', () => {
    const done = doneVolumeByGroupThisWeek(
      [session(NOW, [['Flat DB Press', 4]])],
      WEEK_START,
      NOW,
      { secondaryCredit: 0.25 },
    );
    expect(done.chest).toBe(4);
    expect(done.triceps).toBe(1); // 4 * 0.25
  });

  it('secondaryCredit:0 drops all secondary contribution', () => {
    const done = doneVolumeByGroupThisWeek(
      [session(NOW, [['Flat DB Press', 4]])],
      WEEK_START,
      NOW,
      { secondaryCredit: 0 },
    );
    expect(done.chest).toBe(4);
    expect(done.triceps).toBeUndefined();
  });

  it('skips unknown/unmapped exercises without throwing', () => {
    const done = doneVolumeByGroupThisWeek(
      [session(NOW, [['Totally Made Up Exercise XYZ', 5]])],
      WEEK_START,
      NOW,
    );
    // 'unknown' primary sentinel is not in BIG11_RO_TO_EN_MAP → skipped
    expect(done).toEqual({});
  });

  it('empty / missing history → empty object, no throw', () => {
    expect(doneVolumeByGroupThisWeek([], WEEK_START, NOW)).toEqual({});
    expect(doneVolumeByGroupThisWeek(null, WEEK_START, NOW)).toEqual({});
    expect(doneVolumeByGroupThisWeek(undefined, WEEK_START, NOW)).toEqual({});
  });

  it('tolerates malformed sessions/exercises (missing fields) without throwing', () => {
    const done = doneVolumeByGroupThisWeek(
      [
        null,
        {},
        { ts: NOW }, // no exercises
        { ts: NOW, exercises: [null, {}, { exerciseName: 'Flat DB Press' }] }, // no sets
        { ts: NOW, exercises: [{ exerciseName: 'Flat DB Press', sets: [] }] }, // empty sets
        session(NOW, [['Flat DB Press', 2]]), // the only real contribution
      ],
      WEEK_START,
      NOW,
    );
    expect(done.chest).toBe(2);
  });

  it('is deterministic (same input → same output)', () => {
    const hist = [session(NOW, [['Incline DB Press', 3]])];
    expect(doneVolumeByGroupThisWeek(hist, WEEK_START, NOW)).toEqual(
      doneVolumeByGroupThisWeek(hist, WEEK_START, NOW),
    );
  });
});

describe('deficitByGroup', () => {
  it('computes max(0, target - done) per group key in target', () => {
    const target = { chest: 12, back: 16, biceps: 8 };
    const done = { chest: 5, back: 16, biceps: 10 };
    expect(deficitByGroup(target, done)).toEqual({
      chest: 7, // 12 - 5
      back: 0, // exactly met
      biceps: 0, // over-done → clamped, never negative
    });
  });

  it('is recover-only: an over-done group is 0, never negative', () => {
    const out = deficitByGroup({ chest: 10 }, { chest: 25 });
    expect(out.chest).toBe(0);
    expect(out.chest).toBeGreaterThanOrEqual(0);
  });

  it('treats a missing done entry as 0 (full deficit)', () => {
    expect(deficitByGroup({ chest: 12 }, {})).toEqual({ chest: 12 });
    expect(deficitByGroup({ chest: 12 }, null)).toEqual({ chest: 12 });
  });

  it('is keyed by target, ignoring extra done keys', () => {
    const out = deficitByGroup({ chest: 10 }, { chest: 4, back: 99 });
    expect(out).toEqual({ chest: 6 });
    expect(out.back).toBeUndefined();
  });

  it('skips non-finite target values', () => {
    const out = deficitByGroup({ chest: 10, bad: NaN, weird: Infinity }, { chest: 2 });
    expect(out).toEqual({ chest: 8 });
  });

  it('empty / missing target → empty object, no throw', () => {
    expect(deficitByGroup({}, { chest: 5 })).toEqual({});
    expect(deficitByGroup(null, { chest: 5 })).toEqual({});
    expect(deficitByGroup(undefined, undefined)).toEqual({});
  });

  it('composes with doneVolumeByGroupThisWeek output (EN keys align)', () => {
    const done = doneVolumeByGroupThisWeek([session(NOW, [['Flat DB Press', 4]])], WEEK_START, NOW);
    // target uses the SAME EN volumeTargets vocabulary
    const out = deficitByGroup({ chest: 12, triceps: 6 }, done);
    expect(out.chest).toBe(8); // 12 - 4
    expect(out.triceps).toBe(4); // 6 - 2
  });
});
