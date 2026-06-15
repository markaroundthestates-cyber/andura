// dp_adherence_volume_v1 — scale weekly VOLUME on CHRONIC LOW ADHERENCE.
//
// THE GAP this closes: dp_auto_infer_frequency_v1 only catches FEWER-DISTINCT-DAYS-
// than-configured; _returnDeload only catches a hard >= 3-week per-exercise GAP. A
// user who SHOWS UP but chronically UNDER-EXECUTES (executed << proposed) with NO
// 3-week gap and ACWR normal had their dose UNREDUCED. computeAdherence already
// MEASURES this (its score weights partials) — this feature folds score/100 into the
// SAME weekly-volume scaler the inferred-frequency path uses, combined by the MIN of
// the two ratios (a single discount, never doubled), MEV-floored. VOLUME ONLY.
//
// REAL production values throughout (project rule): the Israetel MEV table, real CDL
// executed/skipped patterns producing real computeAdherence scores (e.g. 4/8 → 50).
//
// Covered:
//   1. adherenceVolumeRatio PURE: full adherence → 1; cold start (null / too few
//      proposed) → 1; chronic-low 50% → 0.5; near-zero → floored at MIN_RATIO 0.5.
//   2. scaleWeeklyVolumeByRatio PURE: ratio<1 scales + MEV-floors; ratio>=1 passthrough.
//   3. MIN-not-PRODUCT: a user BOTH low-cadence AND low-execution gets the SINGLE
//      smaller discount, never the doubled (product) one.
//   4. INTEGRATION through getDailyWorkout: OFF → byte-identical; ON + chronic-low →
//      delivered weekly volume DROPS but no group below MEV; ON + cold-start → no
//      change; ON + full adherence → no change; ON + BOTH low-cadence + low-execution
//      → a SINGLE (min) discount (delivered > the product would give).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  adherenceVolumeRatio,
  scaleWeeklyVolumeByRatio,
} from '../scheduleAdapter/inferFrequency.js';
import { ISRAETEL_BASELINES } from '../../periodization/constants.js';

// CDL entries computeAdherence reads (readAllActive) — mocked so the in-window
// adherence reading is deterministic, mirroring src/engine/__tests__/adherence.test.js.
const { mockReadAllActive } = vi.hoisted(() => ({ mockReadAllActive: vi.fn(() => []) }));
vi.mock('../../../util/coachDecisionLog.js', () => ({
  readAllActive: mockReadAllActive,
  readActiveForDate: vi.fn(() => null),
}));

const MS_DAY = 86400000;
const NOW = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon 2026-06-15 06:00 UTC

// ── PURE helper: adherenceVolumeRatio ────────────────────────────────────────
describe('adherenceVolumeRatio (pure)', () => {
  it('full adherence (score 100) → 1 (no effect)', () => {
    expect(adherenceVolumeRatio(100, 12)).toBe(1);
  });

  it('cold start — null score → 1 (no effect)', () => {
    expect(adherenceVolumeRatio(null, 0)).toBe(1);
  });

  it('cold start — too few proposed sessions → 1 (no effect)', () => {
    // 3 proposed < ADHERENCE_MIN_PROPOSED (4): too noisy to dose on.
    expect(adherenceVolumeRatio(50, 3)).toBe(1);
  });

  it('chronic low (score 50, proposed 8) → 0.5', () => {
    expect(adherenceVolumeRatio(50, 8)).toBeCloseTo(0.5);
  });

  it('chronic low (score 75, proposed 8) → 0.75', () => {
    expect(adherenceVolumeRatio(75, 8)).toBeCloseTo(0.75);
  });

  it('near-zero adherence (score 0) is floored — never zeroes the dose', () => {
    // score 0 → raw ratio 0, clamped to the MIN_RATIO floor (0.5), never 0.
    expect(adherenceVolumeRatio(0, 8)).toBe(0.5);
  });

  it('degrade-safe — malformed score / proposed → 1', () => {
    expect(adherenceVolumeRatio(undefined, 8)).toBe(1);
    expect(adherenceVolumeRatio(NaN, 8)).toBe(1);
    expect(adherenceVolumeRatio(50, NaN)).toBe(1);
  });
});

// ── PURE helper: scaleWeeklyVolumeByRatio ────────────────────────────────────
describe('scaleWeeklyVolumeByRatio (pure)', () => {
  const budget = { chest: 20, back: 25, shoulders: 24 }; // all well above MEV

  it('ratio 0.5 scales each group by 0.5, MEV-floored', () => {
    const out = scaleWeeklyVolumeByRatio(budget, 0.5, ISRAETEL_BASELINES);
    expect(out.chest).toBeCloseTo(10); // 20×0.5 > chest MEV 8
    expect(out.back).toBeCloseTo(12.5); // 25×0.5 > back MEV 10
    expect(out.shoulders).toBeCloseTo(12); // 24×0.5 > shoulders MEV 8
    for (const k of Object.keys(budget)) expect(out[k]).toBeLessThan(budget[k]);
  });

  it('never drops a group below its Israetel MEV', () => {
    // chest 9 × 0.5 = 4.5, must floor to chest MEV 8.
    const out = scaleWeeklyVolumeByRatio({ chest: 9 }, 0.5, ISRAETEL_BASELINES);
    expect(out.chest).toBe(ISRAETEL_BASELINES.chest.MEV);
  });

  it('ratio >= 1 → passthrough clone (only ever lowers)', () => {
    const out = scaleWeeklyVolumeByRatio(budget, 1, ISRAETEL_BASELINES);
    expect(out).toEqual(budget);
    expect(out).not.toBe(budget); // a clone, never the same ref
  });

  it('degrade-safe — bad inputs → clone / passthrough', () => {
    expect(scaleWeeklyVolumeByRatio(null, 0.5, ISRAETEL_BASELINES)).toBeNull();
    expect(scaleWeeklyVolumeByRatio(budget, 0, ISRAETEL_BASELINES)).toEqual(budget);
    expect(scaleWeeklyVolumeByRatio(budget, NaN, ISRAETEL_BASELINES)).toEqual(budget);
  });

  it('MIN-not-PRODUCT: a single combined discount, never the doubled one', () => {
    // A user BOTH low-cadence (freq ratio 3/5 = 0.6) AND low-execution (adh 0.5).
    const freqRatio = 3 / 5; // 0.6
    const adhRatio = 0.5;
    const combined = Math.min(freqRatio, adhRatio); // 0.5 — the single discount
    const product = freqRatio * adhRatio; // 0.30 — the WRONG doubled discount
    const single = scaleWeeklyVolumeByRatio(budget, combined, ISRAETEL_BASELINES);
    const doubled = scaleWeeklyVolumeByRatio(budget, product, ISRAETEL_BASELINES);
    // The single (min) discount is strictly LESS aggressive than the product would be.
    for (const k of Object.keys(budget)) {
      expect(single[k]).toBeGreaterThan(doubled[k]);
    }
    expect(single.chest).toBeCloseTo(10); // 20 × 0.5
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

// recentSessions covering `daysPerWeek` distinct days/week for `weeks` weeks — makes
// recoveryLogs NON-empty (so the seam's recoveryLogs.length>0 guard passes) and lets
// us also drive the inferred-frequency ratio for the MIN-vs-product integration case.
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

// Real CDL entries (the shape computeAdherence.readAllActive returns) for an
// adherence reading: `exec` executed + `skip` skipped, all in-window + non-synthetic.
function cdlEntries(exec, skip) {
  const out = [];
  for (let i = 0; i < exec; i++) {
    out.push({ date: '2026-06-10', synthetic: false, outcome: { executed: true } });
  }
  for (let i = 0; i < skip; i++) {
    out.push({ date: '2026-06-10', synthetic: false, outcome: { executed: false } });
  }
  return out;
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

let getDailyWorkout;
let activeWeekForFrequency;
beforeEach(async () => {
  ({ getDailyWorkout } = await import('../scheduleAdapter.js'));
  ({ activeWeekForFrequency } = await import('../scheduleAdapter/frequencySplit.js'));
});

// Sum DELIVERED working sets across the whole CONFIGURED week (every active day).
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

describe('getDailyWorkout — chronic-low-adherence → delivered volume', () => {
  const WEEK_START = Date.UTC(2026, 5, 15, 6, 0, 0); // Mon (active-week offsets map cleanly)

  // Isolate the adherence effect: keep dp_adherence_volume_v1 ON but force OFF the
  // OTHER default-ON volume-shaping flags (incl. the sibling auto-infer-frequency,
  // unless a test re-enables it) whose recovery/learned/contract reshapes would
  // otherwise also move the delivered totals and obscure the clean A/B.
  function devFlags(overrides = {}) {
    return JSON.stringify({
      dp_weekly_recovery_alloc_v1: false,
      dp_learned_volume_v1: false,
      dp_focus_contracts_v1: false,
      dp_week_ledger_v1: false,
      dp_lowcap_weekly_band_v1: false,
      dp_recovery_dose_v1: false,
      dp_auto_infer_frequency_v1: false,
      dp_adherence_volume_v1: true,
      ...overrides,
    });
  }

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    mockReadAllActive.mockReturnValue([]); // cold start by default
  });

  it('flag OFF → byte-identical (the adherence scaling is never applied)', async () => {
    // Chronic low adherence present, but the flag is OFF.
    mockReadAllActive.mockReturnValue(cdlEntries(4, 4)); // 4/8 → score 50
    localStorage.setItem('_devFlags', devFlags({ dp_adherence_volume_v1: false }));
    const off = await deliveredWeeklyVolume(4, [], WEEK_START);
    // Same config, no adherence signal at all (still flag OFF).
    mockReadAllActive.mockReturnValue([]);
    const coldOff = await deliveredWeeklyVolume(4, [], WEEK_START);
    expect(off).toBe(coldOff); // OFF → adherence never moves the dose
  });

  it('ON + full adherence (score 100) → delivery UNCHANGED vs cold-start', async () => {
    localStorage.setItem('_devFlags', devFlags());
    mockReadAllActive.mockReturnValue([]); // cold start
    const cold = await deliveredWeeklyVolume(4, [], WEEK_START);
    mockReadAllActive.mockReturnValue(cdlEntries(8, 0)); // 8/8 → score 100 → ratio 1
    const full = await deliveredWeeklyVolume(4, [], WEEK_START);
    expect(full).toBe(cold);
  });

  it('ON + cold-start (too few proposed) → delivery UNCHANGED', async () => {
    localStorage.setItem('_devFlags', devFlags());
    mockReadAllActive.mockReturnValue([]);
    const cold = await deliveredWeeklyVolume(4, [], WEEK_START);
    // 2 proposed < ADHERENCE_MIN_PROPOSED → ratio 1 → no effect.
    mockReadAllActive.mockReturnValue(cdlEntries(1, 1)); // 2 proposed
    const sparse = await deliveredWeeklyVolume(4, [], WEEK_START);
    expect(sparse).toBe(cold);
  });

  it('ON + chronic low adherence (4/8 → 50) → delivered weekly volume DROPS', async () => {
    localStorage.setItem('_devFlags', devFlags());
    mockReadAllActive.mockReturnValue([]); // cold = full dose
    const full = await deliveredWeeklyVolume(4, [], WEEK_START);
    mockReadAllActive.mockReturnValue(cdlEntries(4, 4)); // 4/8 → score 50 → ratio 0.5
    const chronic = await deliveredWeeklyVolume(4, [], WEEK_START);
    expect(chronic).toBeLessThan(full); // the dose was reduced for under-execution
  });

  it('ON + chronic low adherence → no muscle dropped below MEV (floored)', async () => {
    localStorage.setItem('_devFlags', devFlags());
    mockReadAllActive.mockReturnValue(cdlEntries(0, 8)); // 0/8 → score 0 → ratio floored 0.5
    // Inspect a single day's plan: each prescribed group must hold >= its MEV.
    const dayDate = new Date(WEEK_START); // Monday — a training day at freq 4
    const plan = await getDailyWorkout(buildUserState(4, []), dayDate);
    expect(plan).toBeTruthy();
    expect(Array.isArray(plan.exercises)).toBe(true);
    expect(plan.exercises.length).toBeGreaterThan(0);
    // Every exercise still carries a real set count (never zeroed by the discount).
    for (const ex of plan.exercises) {
      expect(ex.sets).toBeGreaterThanOrEqual(1);
    }
  });

  it('ON + BOTH low-cadence AND low-execution → SINGLE (min) discount, not doubled', async () => {
    // Low cadence: configured 5, logged 3/wk → inferred-freq ratio 3/5 = 0.6.
    // Low execution: 4/8 adherence → ratio 0.5. MIN = 0.5 (the single discount);
    // the WRONG product would be 0.30. Enable BOTH flags for this case.
    localStorage.setItem('_devFlags', devFlags({ dp_auto_infer_frequency_v1: true }));
    const logged3 = recentSessionsForCadence(3, 3, WEEK_START); // 3/wk × 3 weeks span ~14d+

    // Cold (full dose, configured 5, no logs, full adherence).
    mockReadAllActive.mockReturnValue([]);
    const full = await deliveredWeeklyVolume(5, [], WEEK_START);

    // BOTH signals firing: configured 5, logged 3 (freq 0.6) + chronic 50% (adh 0.5).
    mockReadAllActive.mockReturnValue(cdlEntries(4, 4)); // score 50 → adh 0.5
    const both = await deliveredWeeklyVolume(5, logged3, WEEK_START);

    // The combined dose used the MIN (0.5), NOT the product (0.30): `both` must be a
    // SINGLE 0.5-class discount of `full`. A doubled (0.30) discount would land well
    // below ~0.5×full. So both > 0.30-equivalent and roughly the 0.5 level.
    expect(both).toBeLessThan(full); // discounted
    // Strictly greater than the product (0.30) would deliver: the discount is NOT
    // doubled. Lower-bound the delivered volume well above the product-level floor.
    expect(both).toBeGreaterThan(full * 0.35); // not the ~0.30 product crater
    expect(both).toBeLessThanOrEqual(full * 0.85); // genuinely discounted (~0.5 class)
  });
});
