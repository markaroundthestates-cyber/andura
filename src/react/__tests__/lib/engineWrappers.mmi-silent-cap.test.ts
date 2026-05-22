// ══ MMI SILENT AUTO-CAP TESTS — engineWrappers getTodayWorkout wire ══════
// Per ENGINE-DEEPER-AUDIT chat 5 HIGH fix tactical scope-limited.
// LOCK 10 ADR-033 §32.1 buckets verbatim: 6-12mo 0.80x, 12-24mo 0.70x,
// 24+mo 0.60x startMultiplier + boost first 3 weeks.
//
// Silent auto-cap design: pauseMonths >= 6 + userChoice !== 'refused' →
// synthesize 'accepted' for adapter (UI prompt DEFERRED Iter urmator).
// User explicit 'refused' respected → baseline preserved.
//
// Returning user personas benefit:
//   Marius post-pauza 7 luni → 0.80x cap activ silent (no UI prompt yet)
//   Maria 65 long-pause 25 luni → 0.60x cap activ silent (fresh-start safe)
//
// DP.roundToStep delegates la roundToEquipmentWeight (src/config/weights.js)
// — snaps to real gym equipment list. Tests use 'Leg Press' (leg_press_plates
// list [20,30,...140,150,160,180,200,220,240,...320]) pentru predictable
// rounding boundaries.
//
// Romanian no-diacritics per D-LEGACY-064.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/scheduleAdapterAggregate', () => ({
  composePlannedWorkoutToday: vi.fn(),
}));

import {
  getTodayWorkout,
  applyMmiCapToWorkout,
  type PlannedWorkoutOutput,
} from '../../lib/engineWrappers';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';

// Helper: seed DB localStorage cu logs (sessions) + pr-records + mmi-state.
// computePauseDuration calc: pauseMonths = days / 30.44 → days needed pentru
// targeted bucket. Tests use tod() current date implicit (jsdom Date.now).
function seedDb(opts: {
  lastSessionDate: string | null;
  prRecords?: Array<{ ex: string; kg: number }>;
  mmiState?: { userChoice?: string; resumeStartDate?: string } | null;
}) {
  localStorage.clear();
  if (opts.lastSessionDate !== null) {
    localStorage.setItem(
      'logs',
      JSON.stringify([{ date: opts.lastSessionDate, ex: 'Leg Press', kg: 80, reps: 8 }]),
    );
  }
  if (opts.prRecords !== undefined) {
    localStorage.setItem('pr-records', JSON.stringify(opts.prRecords));
  }
  if (opts.mmiState !== undefined) {
    localStorage.setItem('mmi-state', JSON.stringify(opts.mmiState));
  }
}

function makeWorkout(exercises: Array<{ name: string; targetKg: number }>): PlannedWorkoutOutput {
  return {
    workoutTitle: 'Antrenament azi',
    exerciseCount: exercises.length,
    estimatedDuration: 50,
    intensityMod: 'normal',
    exercises: exercises.map((e, idx) => ({
      id: `ex-${idx}`,
      name: e.name,
      sets: 3,
      targetReps: 8,
      targetKg: e.targetKg,
      restSec: 90,
    })),
    volumeKg: 0,
    warmup: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// Pause months calc: days / 30.44. Buckets via days delta from today.
// Use historic dates well past threshold to avoid jsdom Date.now drift edge cases.
// 7 luni  → 2025-10-15 (>= 213 days from 2026-05-23)
// 18 luni → 2024-11-21 (~548 days)
// 25 luni → 2024-04-22 (~762 days)
// 4 luni  → 2026-01-21 (under threshold)
//
// DP.roundToStep('Leg Press', X) snaps to leg_press_plates list:
//   [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
//    180, 200, 220, 240, 260, 280, 300, 320]

describe('applyMmiCapToWorkout — silent auto-cap by bucket', () => {
  it('pauseMonths < 6 → NO cap (baseline preserved)', () => {
    seedDb({
      lastSessionDate: '2026-01-21', // ~4 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(100);
  });

  it('pauseMonths 7 (6-12 bucket) → 0.80x cap silent active', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // ~7 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
      // No mmi-state → silent auto-opt-in (userChoice synthesized 'accepted')
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    // peakKg=200 * 0.80 = 160; boost 1.25 (week 0, resumeStartDate absent) = 200
    // roundToEquipmentWeight(200, 'Leg Press') = 200 (exact list match)
    expect(out.exercises[0]!.targetKg).toBe(200);
  });

  it('pauseMonths 18 (12-24 bucket) → 0.70x cap + 1.10x boost', () => {
    seedDb({
      lastSessionDate: '2024-11-21', // ~18 luni
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    // peakKg=200 * 0.70 = 140; boost 1.10 (week 0) = 154
    // roundToEquipmentWeight(154, 'Leg Press') → closest to 154 in list = 150
    expect(out.exercises[0]!.targetKg).toBe(150);
  });

  it('pauseMonths 25 (24+ bucket) → 0.60x cap (start proaspat, no boost)', () => {
    seedDb({
      lastSessionDate: '2024-04-22', // ~25 luni
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    // peakKg=200 * 0.60 = 120; boost 1.00 = 120
    // roundToEquipmentWeight(120, 'Leg Press') = 120 (exact match)
    expect(out.exercises[0]!.targetKg).toBe(120);
  });

  it('userChoice="refused" → baseline preserved (anti-paternalism §32.3)', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // 7 luni pause (would trigger cap if not refused)
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
      mmiState: { userChoice: 'refused' },
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(100);
  });

  it('no pr-records → baseline preserved (no fabricated peak)', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // 7 luni pause
      prRecords: [], // empty
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(100);
  });

  it('no logs at all → baseline preserved (fresh user T0)', () => {
    seedDb({
      lastSessionDate: null,
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(100);
  });

  it('exercise without pr-record entry → baseline preserved per-exercise', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // 7 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }], // ONLY Leg Press has peak
    });
    const workout = makeWorkout([
      { name: 'Leg Press', targetKg: 100 }, // capped → 200
      { name: 'Leg Curl', targetKg: 50 }, // no peak → baseline kept
    ]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(200); // capped
    expect(out.exercises[1]!.targetKg).toBe(50); // unchanged
  });

  it('preserves PlannedExercise non-kg fields (id, name, sets, reps, restSec)', () => {
    seedDb({
      lastSessionDate: '2025-10-15',
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.id).toBe('ex-0');
    expect(out.exercises[0]!.name).toBe('Leg Press');
    expect(out.exercises[0]!.sets).toBe(3);
    expect(out.exercises[0]!.targetReps).toBe(8);
    expect(out.exercises[0]!.restSec).toBe(90);
  });

  it('preserves PlannedWorkoutOutput top-level fields (title, count, etc)', () => {
    seedDb({
      lastSessionDate: '2025-10-15',
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.workoutTitle).toBe('Antrenament azi');
    expect(out.exerciseCount).toBe(1);
    expect(out.estimatedDuration).toBe(50);
    expect(out.intensityMod).toBe('normal');
  });
});

describe('getTodayWorkout — MMI cap wired post-pipeline', () => {
  it('returning user 7 luni pause → cap applied via getTodayWorkout', async () => {
    seedDb({
      lastSessionDate: '2025-10-15',
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 100 }]),
    );
    const out = await getTodayWorkout();
    expect(out).not.toBeNull();
    expect(out!.exercises[0]!.targetKg).toBe(200); // 0.80*1.25*200=200, rounded=200
  });

  it('fresh user (no logs) → pipeline output passthrough unchanged', async () => {
    seedDb({ lastSessionDate: null });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 100 }]),
    );
    const out = await getTodayWorkout();
    expect(out!.exercises[0]!.targetKg).toBe(100);
  });

  it('rest day (pipeline returns null) → returns null (no MMI applied)', async () => {
    seedDb({
      lastSessionDate: '2025-10-15',
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(null);
    const out = await getTodayWorkout();
    expect(out).toBeNull();
  });

  it('pipeline throws → null fallback (defensive)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(composePlannedWorkoutToday).mockRejectedValueOnce(new Error('pipeline boom'));
    const out = await getTodayWorkout();
    expect(out).toBeNull();
    warnSpy.mockRestore();
  });

  it('Maria 65 persona long pause 25 luni → 0.60x bucket cap silent active', async () => {
    seedDb({
      lastSessionDate: '2024-04-22', // ~25 luni
      prRecords: [{ ex: 'Leg Press', kg: 100 }], // Maria conservative peak
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 60 }]),
    );
    const out = await getTodayWorkout();
    // peakKg=100 * 0.60 = 60; boost 1.00 = 60; rounded = 60 (exact list match)
    expect(out!.exercises[0]!.targetKg).toBe(60);
  });

  it('Marius post-pause 7 luni persona → 0.80x bucket + boost week 0', async () => {
    seedDb({
      lastSessionDate: '2025-10-15', // ~7 luni
      prRecords: [{ ex: 'Leg Press', kg: 240 }], // Marius performant peak
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 120 }]),
    );
    const out = await getTodayWorkout();
    // peakKg=240 * 0.80 = 192; boost 1.25 (week 0) = 240; rounded = 240
    expect(out!.exercises[0]!.targetKg).toBe(240);
  });
});
