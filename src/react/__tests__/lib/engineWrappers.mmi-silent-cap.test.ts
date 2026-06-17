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

describe('applyMmiCapToWorkout — silent auto-cap by bucket (TRUE CAP, option c)', () => {
  // The cap can only ever LOWER the incoming DP rec to the MMI return weight; an
  // incoming rec already at/below the MMI weight is left UNCHANGED (min wins).
  it('pauseMonths < 6 → NO cap (baseline preserved)', () => {
    seedDb({
      lastSessionDate: '2026-01-21', // ~4 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(100);
  });

  it('pauseMonths 7 (6-12 bucket) → caps an over-aggressive 240 DOWN to 200', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // ~7 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
      // No mmi-state → silent auto-opt-in (userChoice synthesized 'accepted')
    });
    // Incoming DP rec 240 is ABOVE the MMI return → the cap bites and lowers it.
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    // MMI return = peakKg 200 * 0.80 * 1.25 (week 0) = 200; min(240, 200) = 200.
    expect(out.exercises[0]!.targetKg).toBe(200);
  });

  it('pauseMonths 7 — incoming already BELOW the MMI return → UNCHANGED (cap never raises)', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // ~7 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    // DP's safer return-deload (100) is below the MMI 200 → min keeps 100.
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 100 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(100);
  });

  it('pauseMonths 18 (12-24 bucket) → caps 240 DOWN to 150 (0.70x + 1.10x boost)', () => {
    seedDb({
      lastSessionDate: '2024-11-21', // ~18 luni
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    // MMI return = 200 * 0.70 * 1.10 (week 0) = 154 → snapped to 150; min(240,150)=150.
    expect(out.exercises[0]!.targetKg).toBe(150);
  });

  it('pauseMonths 25 (24+ bucket) → caps 240 DOWN to 120 (0.60x, no boost)', () => {
    seedDb({
      lastSessionDate: '2024-04-22', // ~25 luni
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    // MMI return = 200 * 0.60 * 1.00 = 120; min(240, 120) = 120.
    expect(out.exercises[0]!.targetKg).toBe(120);
  });

  it('userChoice="refused" → baseline preserved (anti-paternalism §32.3)', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // 7 luni pause (would cap if not refused)
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
      mmiState: { userChoice: 'refused' },
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(240);
  });

  it('no pr-records → baseline preserved (no fabricated peak)', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // 7 luni pause
      prRecords: [], // empty
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(240);
  });

  it('no logs at all → baseline preserved (fresh user T0)', () => {
    seedDb({
      lastSessionDate: null,
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(240);
  });

  it('exercise without pr-record entry → baseline preserved per-exercise', () => {
    seedDb({
      lastSessionDate: '2025-10-15', // 7 luni pause
      prRecords: [{ ex: 'Leg Press', kg: 200 }], // ONLY Leg Press has peak
    });
    const workout = makeWorkout([
      { name: 'Leg Press', targetKg: 240 }, // capped → 200
      { name: 'Leg Curl', targetKg: 50 }, // no peak → baseline kept
    ]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.exercises[0]!.targetKg).toBe(200); // capped down
    expect(out.exercises[1]!.targetKg).toBe(50); // unchanged
  });

  it('preserves PlannedExercise non-kg fields (id, name, sets, reps, restSec)', () => {
    seedDb({
      lastSessionDate: '2025-10-15',
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
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
    const workout = makeWorkout([{ name: 'Leg Press', targetKg: 240 }]);
    const out = applyMmiCapToWorkout(workout);
    expect(out.workoutTitle).toBe('Antrenament azi');
    expect(out.exerciseCount).toBe(1);
    expect(out.estimatedDuration).toBe(50);
    expect(out.intensityMod).toBe('normal');
  });

  it('RO-display name with EN engineName → cap resolves the EN peak (was DEAD for RO)', () => {
    // The DEFECT: peakPrePauseKgPerExercise is keyed EN ('Leg Press') but the
    // planned exercise `name` is the RO display 'Presa de picioare'. Keying on
    // ex.name missed the peak → MMI cap dead for every RO returnee. Now keyed on
    // ex.engineName (EN canonical) → the peak resolves + the cap bites.
    seedDb({
      lastSessionDate: '2024-04-22', // ~25 luni → 0.60x bucket
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    const workout: PlannedWorkoutOutput = {
      ...makeWorkout([{ name: 'Presa de picioare', targetKg: 240 }]),
    };
    // Stamp the EN canonical engineName the compose path always sets.
    workout.exercises[0]!.engineName = 'Leg Press';
    const out = applyMmiCapToWorkout(workout);
    // MMI return = 200 * 0.60 * 1.00 = 120; min(240, 120) = 120 → cap NO LONGER dead.
    expect(out.exercises[0]!.targetKg).toBe(120);
  });
});

describe('getTodayWorkout — MMI cap wired post-pipeline', () => {
  it('returning user 7 luni pause → over-aggressive rec capped DOWN via getTodayWorkout', async () => {
    seedDb({
      lastSessionDate: '2025-10-15',
      prRecords: [{ ex: 'Leg Press', kg: 200 }],
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 240 }]),
    );
    const out = await getTodayWorkout();
    expect(out).not.toBeNull();
    // MMI return = 0.80*1.25*200 = 200; min(240, 200) = 200 (cap bites).
    expect(out!.exercises[0]!.targetKg).toBe(200);
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

  it('Maria 65 persona long pause 25 luni → 0.60x cap lowers an over-aggressive rec', async () => {
    seedDb({
      lastSessionDate: '2024-04-22', // ~25 luni
      prRecords: [{ ex: 'Leg Press', kg: 100 }], // Maria conservative peak
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 100 }]),
    );
    const out = await getTodayWorkout();
    // MMI return = 100 * 0.60 * 1.00 = 60; min(100, 60) = 60 (cap bites — keeps Maria safe).
    expect(out!.exercises[0]!.targetKg).toBe(60);
  });

  it('Marius post-pause 7 luni — DP deload BELOW the MMI return → unchanged (cap never raises)', async () => {
    seedDb({
      lastSessionDate: '2025-10-15', // ~7 luni
      prRecords: [{ ex: 'Leg Press', kg: 240 }], // Marius performant peak
    });
    vi.mocked(composePlannedWorkoutToday).mockResolvedValueOnce(
      makeWorkout([{ name: 'Leg Press', targetKg: 120 }]),
    );
    const out = await getTodayWorkout();
    // MMI return = 240 * 0.80 * 1.25 = 240; min(120, 240) = 120 → DP's safer deload wins.
    expect(out!.exercises[0]!.targetKg).toBe(120);
  });
});
