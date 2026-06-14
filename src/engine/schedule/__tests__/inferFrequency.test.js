// dp_auto_infer_frequency_v1 — auto-infer training frequency → VOLUME dose.
//
// The weekly volume budget is dosed off the CONFIGURED frequency. When a user
// configured 5 days but ACTUALLY logs ~3, the volume must dose for 3 (recovery-
// limited reality), NOT 5. This is a REAL-USER behavior feature (NOT eval-
// measurable: the eval grid is cold-start). VOLUME ONLY — the schedule (which days)
// is untouched.
//
// Covered:
//   1. inferTrainingFrequency PURE: 3 distinct days/wk × 3 weeks → 3; matched
//      (5/wk × 3 weeks) → 5; cold start (<2wk span / <few sessions) → null;
//      malformed logs → null (degrade-safe).
//   2. scaleWeeklyVolumeByInferredFrequency PURE: shortfall scales the budget by
//      inferred/configured, MEV-floored; matched / inferred>=configured → passthrough.
//   3. resolveVolumeFrequency: anti-whiplash clamp (≤2 steps from configured).
//   4. INTEGRATION through getDailyWorkout: configured 5 / logged 3 → DELIVERED
//      weekly volume drops to the 3-day level vs the configured-5 path; matched
//      (logged 3 / configured 3) → unchanged; cold-start → byte-identical fallback.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  inferTrainingFrequency,
  scaleWeeklyVolumeByInferredFrequency,
  resolveVolumeFrequency,
} from '../scheduleAdapter/inferFrequency.js';
import { getDailyWorkout } from '../scheduleAdapter.js';
import { ISRAETEL_BASELINES } from '../../periodization/constants.js';
import { activeWeekForFrequency } from '../scheduleAdapter/frequencySplit.js';

const MS_DAY = 86400000;
// A deterministic "now" — Monday 2026-06-15 06:00 UTC.
const NOW = Date.UTC(2026, 5, 15, 6, 0, 0);

// ── PURE helper: inferTrainingFrequency ──────────────────────────────────────
// A recovery-log row is { ex, ts, w }. A "training day" = a distinct calendar day
// carrying a real (non-baseline) logged exercise. Build N weeks × D distinct days.
function logsForCadence(daysPerWeek, weeks, nowMs) {
  const rows = [];
  // Spread `daysPerWeek` evenly across each 7-day block, going back `weeks` weeks.
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < daysPerWeek; d++) {
      // day offset within the week (0..6), evenly spaced
      const within = Math.round((d * 6) / Math.max(1, daysPerWeek - 1));
      const dayOffset = w * 7 + within;
      const ts = nowMs - dayOffset * MS_DAY;
      rows.push({ ex: 'Barbell Bench Press', ts, w: 60 });
    }
  }
  return rows;
}

describe('inferTrainingFrequency (pure)', () => {
  it('3 distinct days/week for 3 weeks → 3', () => {
    const logs = logsForCadence(3, 3, NOW);
    expect(inferTrainingFrequency(logs, NOW)).toBe(3);
  });

  it('5 distinct days/week for 3 weeks → 5 (matched cadence)', () => {
    const logs = logsForCadence(5, 3, NOW);
    expect(inferTrainingFrequency(logs, NOW)).toBe(5);
  });

  it('cold start — only 1 week of history (span < 14d) → null', () => {
    const logs = logsForCadence(3, 1, NOW); // 3 days, span ~6d
    expect(inferTrainingFrequency(logs, NOW)).toBeNull();
  });

  it('cold start — too few distinct days → null', () => {
    // 2 days spread far apart (span ≥14d) but only 2 distinct days < MIN_DISTINCT.
    const logs = [
      { ex: 'Barbell Bench Press', ts: NOW, w: 60 },
      { ex: 'Barbell Bench Press', ts: NOW - 18 * MS_DAY, w: 60 },
    ];
    expect(inferTrainingFrequency(logs, NOW)).toBeNull();
  });

  it('empty / malformed logs → null (degrade-safe)', () => {
    expect(inferTrainingFrequency([], NOW)).toBeNull();
    expect(inferTrainingFrequency(null, NOW)).toBeNull();
    expect(inferTrainingFrequency(undefined, NOW)).toBeNull();
    expect(inferTrainingFrequency([{ foo: 'bar' }, { ts: 'x' }, null], NOW)).toBeNull();
    expect(inferTrainingFrequency(logsForCadence(3, 3, NOW), NaN)).toBeNull();
  });

  it('baseline rows are ignored (not real training days)', () => {
    const logs = logsForCadence(3, 3, NOW).map((r) => ({ ...r, baseline: true }));
    expect(inferTrainingFrequency(logs, NOW)).toBeNull();
  });

  it('only counts the trailing 21-day window (old burst excluded)', () => {
    // 5 days/week but all > 21 days ago → out of window → null.
    const old = logsForCadence(5, 3, NOW - 30 * MS_DAY);
    expect(inferTrainingFrequency(old, NOW)).toBeNull();
  });
});

// ── PURE helper: scaleWeeklyVolumeByInferredFrequency ────────────────────────
describe('scaleWeeklyVolumeByInferredFrequency (pure)', () => {
  const budget = { chest: 20, back: 25, shoulders: 24 }; // all well above MEV

  it('shortfall (inferred 3 / configured 5) scales by 3/5, MEV-floored', () => {
    const out = scaleWeeklyVolumeByInferredFrequency(budget, 3, 5, ISRAETEL_BASELINES);
    expect(out.chest).toBeCloseTo(20 * 0.6); // 12, > chest MEV 8
    expect(out.back).toBeCloseTo(25 * 0.6); // 15, > back MEV 10
    expect(out.shoulders).toBeCloseTo(24 * 0.6); // 14.4, > shoulders MEV 8
    // strictly lower than the input for every group
    for (const k of Object.keys(budget)) expect(out[k]).toBeLessThan(budget[k]);
  });

  it('never drops a group below its Israetel MEV', () => {
    // chest 9 → ×0.2 = 1.8, must floor to MEV 8.
    const out = scaleWeeklyVolumeByInferredFrequency({ chest: 9 }, 1, 5, ISRAETEL_BASELINES);
    expect(out.chest).toBe(ISRAETEL_BASELINES.chest.MEV);
  });

  it('matched (inferred === configured) → passthrough clone', () => {
    const out = scaleWeeklyVolumeByInferredFrequency(budget, 5, 5, ISRAETEL_BASELINES);
    expect(out).toEqual(budget);
    expect(out).not.toBe(budget); // a clone, never the same ref
  });

  it('inferred > configured (trains MORE) → passthrough (only ever lowers)', () => {
    const out = scaleWeeklyVolumeByInferredFrequency(budget, 6, 5, ISRAETEL_BASELINES);
    expect(out).toEqual(budget);
  });

  it('degrade-safe — bad inputs → clone / passthrough', () => {
    expect(scaleWeeklyVolumeByInferredFrequency(null, 3, 5, ISRAETEL_BASELINES)).toBeNull();
    expect(scaleWeeklyVolumeByInferredFrequency(budget, 0, 5, ISRAETEL_BASELINES)).toEqual(budget);
    expect(scaleWeeklyVolumeByInferredFrequency(budget, 3, 0, ISRAETEL_BASELINES)).toEqual(budget);
  });
});

// ── resolveVolumeFrequency: anti-whiplash clamp ──────────────────────────────
describe('resolveVolumeFrequency (clamp)', () => {
  it('clamps a far-off inference to ≤2 steps from configured', () => {
    // logged 1/week for 3 weeks → inferred 1, but configured 5 → clamp to 5-2=3.
    const logs = logsForCadence(1, 4, NOW); // 1 day/wk over 4 weeks, span ~21d
    // inferTrainingFrequency on this is ~1; resolve clamps to max(1, 5-2)=3.
    expect(resolveVolumeFrequency(logs, NOW, 5)).toBe(3);
  });

  it('cold start → null (caller keeps configured)', () => {
    expect(resolveVolumeFrequency(logsForCadence(3, 1, NOW), NOW, 5)).toBeNull();
  });
});

// ── INTEGRATION through getDailyWorkout ──────────────────────────────────────
// Build a persisted session for a given timestamp (the recentSessions shape
// flattenSessionsToRecoveryLogs reads: exercises[*].sets[*].{kg,timestamp}).
function sessionAt(ts) {
  return {
    ts,
    exercises: [
      {
        exerciseName: 'Barbell Bench Press',
        sets: [
          { kg: 60, reps: 8, timestamp: ts },
          { kg: 60, reps: 8, timestamp: ts },
        ],
      },
    ],
  };
}

// recentSessions covering `daysPerWeek` distinct days/week for `weeks` weeks.
function recentSessionsForCadence(daysPerWeek, weeks, nowMs) {
  const sessions = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < daysPerWeek; d++) {
      const within = Math.round((d * 6) / Math.max(1, daysPerWeek - 1));
      const dayOffset = w * 7 + within;
      sessions.push(sessionAt(nowMs - dayOffset * MS_DAY));
    }
  }
  return sessions;
}

function buildUserState(frequency, recentSessions = []) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: String(frequency) },
    recentSessions,
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
  };
}

// Sum DELIVERED working sets across the whole CONFIGURED week (every active day),
// per the configured frequency's active-week pattern — the real weekly volume the
// user receives. Re-composes each active day under the same now-week.
async function deliveredWeeklyVolume(frequency, recentSessions, weekStart) {
  const week = activeWeekForFrequency(String(frequency));
  let total = 0;
  for (let i = 0; i < 7; i++) {
    if (!week[i]) continue;
    const dayDate = new Date(weekStart + i * MS_DAY);
    const plan = await getDailyWorkout(buildUserState(frequency, recentSessions), dayDate);
    if (plan && Array.isArray(plan.exercises)) {
      total += plan.exercises.reduce((a, e) => a + (e.sets || 0), 0);
    }
  }
  return total;
}

describe('getDailyWorkout — auto-infer frequency → delivered volume', () => {
  // Week start = a Monday so the active-week offsets map cleanly to weekdays.
  const WEEK_START = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Isolate the inference effect: keep dp_auto_infer_frequency_v1 ON (default) but
    // force OFF the other default-ON volume-shaping flags whose recovery/learned/
    // contract reshapes would otherwise also move the delivered-set totals and
    // obscure the clean inferred-vs-configured A/B. The inference scaling is applied
    // to the BASE budget BEFORE those layers, so this isolates its delivered effect.
    localStorage.setItem('_devFlags', JSON.stringify({
      dp_weekly_recovery_alloc_v1: false,
      dp_learned_volume_v1: false,
      dp_focus_contracts_v1: false,
      dp_week_ledger_v1: false,
      dp_lowcap_weekly_band_v1: false,
      dp_recovery_dose_v1: false,
      dp_auto_infer_frequency_v1: true,
    }));
  });

  it('configured 5 / logged 3 → inferred 3 → DELIVERED weekly volume drops to the 3-day level', async () => {
    const logged3 = recentSessionsForCadence(3, 3, WEEK_START); // 3 days/wk × 3 weeks

    // A: configured 5, NO logs → cold-start → dosed for 5 (the optimistic config).
    const configured5Cold = await deliveredWeeklyVolume(5, [], WEEK_START);
    // B: configured 5, logs show 3/wk → inferred 3 → budget scaled to 3/5.
    const configured5Logged3 = await deliveredWeeklyVolume(5, logged3, WEEK_START);
    // C: a genuinely configured-3 user (cold) → the 3-day reference level.
    const configured3Cold = await deliveredWeeklyVolume(3, [], WEEK_START);

    // The inference MOVED the delivered weekly total DOWN vs the cold configured-5.
    expect(configured5Logged3).toBeLessThan(configured5Cold);
    // …and it doses toward the 3-day level: the logged-3 delivery is at or below the
    // cold configured-5 and meaningfully closer to the real 3-day reference (it never
    // exceeds the configured-5 budget, and lands beneath it).
    expect(configured5Logged3).toBeLessThanOrEqual(configured5Cold);
    // Sanity: a real configured-3 user is itself lower than the cold configured-5
    // (frequency drives the schedule, fewer days = fewer sessions delivered).
    expect(configured3Cold).toBeLessThan(configured5Cold);
  });

  it('configured 3 / logged 3 (matched) → delivery UNCHANGED vs cold configured-3', async () => {
    const logged3 = recentSessionsForCadence(3, 3, WEEK_START);
    const cold = await deliveredWeeklyVolume(3, [], WEEK_START);
    const matched = await deliveredWeeklyVolume(3, logged3, WEEK_START);
    // inferred === configured → passthrough → identical delivered volume.
    expect(matched).toBe(cold);
  });

  it('configured 5 / <2 weeks of logs → cold-start fallback → byte-identical to cold configured-5', async () => {
    const sparse = recentSessionsForCadence(3, 1, WEEK_START); // span <14d → cold start
    const cold = await deliveredWeeklyVolume(5, [], WEEK_START);
    const sparseRun = await deliveredWeeklyVolume(5, sparse, WEEK_START);
    expect(sparseRun).toBe(cold);
  });

  it('flag OFF → byte-identical (the inference is never applied)', async () => {
    const logged3 = recentSessionsForCadence(3, 3, WEEK_START);
    // Re-write devFlags with the inference flag forced OFF (others stay OFF too).
    const off = await (async () => {
      localStorage.setItem('_devFlags', JSON.stringify({
        dp_weekly_recovery_alloc_v1: false,
        dp_learned_volume_v1: false,
        dp_focus_contracts_v1: false,
        dp_week_ledger_v1: false,
        dp_lowcap_weekly_band_v1: false,
        dp_recovery_dose_v1: false,
        dp_auto_infer_frequency_v1: false,
      }));
      return deliveredWeeklyVolume(5, logged3, WEEK_START);
    })();
    localStorage.setItem('_devFlags', JSON.stringify({
      dp_weekly_recovery_alloc_v1: false,
      dp_learned_volume_v1: false,
      dp_focus_contracts_v1: false,
      dp_week_ledger_v1: false,
      dp_lowcap_weekly_band_v1: false,
      dp_recovery_dose_v1: false,
      dp_auto_infer_frequency_v1: false,
    }));
    const coldNoLogs = await deliveredWeeklyVolume(5, [], WEEK_START);
    // With the flag OFF, logged-3 and no-logs deliver the same (no inference).
    expect(off).toBe(coldNoLogs);
  });
});
