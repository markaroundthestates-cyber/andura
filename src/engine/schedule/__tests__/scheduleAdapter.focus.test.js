// FOCUS SELECTOR (D-focus 2026-06-02) — the user picks an aesthetic LOOK and
// Andura shapes volume + split around it.
//
// ADR 025 "override optional": Andura decides by default (focusPreset='balanced'
// → byte-identical to pre-feature). A preset biases the weekly volume budget
// (emphasized→MRV, de-emphasized→MEV maintenance floor) AND reshapes the split
// (a de-emphasized lower body frees a leg day for the focus region).
//
// Hard invariants under test:
//   - balanced → IDENTICAL to pre-feature (deep equal; the whole feature opt-in).
//   - v-taper → umeri/spate weekly volume UP, legs DOWN toward MEV (NEVER below),
//     one fewer leg day in the split (the freed day → push/pull).
//   - arms/chest/lower → their emphasized groups up; rest neutral.
//   - de-emphasized legs are NOT re-amplified by weakness (M2) / imbalance (M3).
//   - recovery (M1) still cuts a fried focused muscle; the time cap still applies.
//   - determinism: same now + state + preset → identical plan.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyWorkout,
  frequencyToSplit,
  FOCUS_PRESETS,
  FOCUS_PRESET_IDS,
} from '../scheduleAdapter.js';
import { ISRAETEL_BASELINES, BIG11_RO_TO_EN_MAP } from '../../periodization/constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// Marius @ 4 days/week (frequency '4' → upper/lower/upper/lower template). Monday
// is the FIRST cluster of the 4-day week. High persona keeps budgets off the
// clamp so a bias is observable.
const MONDAY_2026_05_18 = new Date(2026, 4, 18); // dayIdx 0 (L)

function buildUserState(overrides = {}) {
  const { user, ...rest } = overrides;
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: '4', ...(user || {}) },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...rest,
  };
}

// Weekly budget entry (sets/week) for a Big-11 RO group from a plan's volumeTargets
// (EN-keyed). Returns the number or undefined.
function weeklyVol(plan, roGroup) {
  const enKey = BIG11_RO_TO_EN_MAP[roGroup];
  return plan.volumeTargets ? plan.volumeTargets[enKey] : undefined;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Preset data map ───────────────────────────────────────────────────────
describe('FOCUS_PRESETS — goal/look → per-group emphasis map', () => {
  it('exposes the five presets, balanced = empty no-op', () => {
    expect(FOCUS_PRESET_IDS).toEqual(['balanced', 'v-taper', 'arms', 'chest', 'lower']);
    expect(FOCUS_PRESETS.balanced).toEqual({ emphasize: [], deEmphasize: [] });
  });

  it('v-taper emphasizes width (umeri+spate), de-emphasizes lower body', () => {
    expect(FOCUS_PRESETS['v-taper'].emphasize).toEqual(['umeri', 'spate']);
    expect(FOCUS_PRESETS['v-taper'].deEmphasize).toEqual([
      'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
    ]);
  });

  it('arms/chest/lower emphasize, none de-emphasize', () => {
    expect(FOCUS_PRESETS.arms.deEmphasize).toEqual([]);
    expect(FOCUS_PRESETS.chest.emphasize).toContain('piept');
    expect(FOCUS_PRESETS.lower.emphasize).toContain('fese');
  });

  it('every preset map is frozen (immutable)', () => {
    for (const id of FOCUS_PRESET_IDS) expect(Object.isFrozen(FOCUS_PRESETS[id])).toBe(true);
  });
});

// ── Focus-aware split reshaping ─────────────────────────────────────────────
describe('frequencyToSplit — focus-aware split reshaping', () => {
  it('balanced → templates UNCHANGED (byte-identical to no-arg)', () => {
    for (let n = 1; n <= 7; n++) {
      expect(frequencyToSplit(n, 'balanced')).toEqual(frequencyToSplit(n));
    }
  });

  it('v-taper @ 4 days: Upper/Lower/Upper/Lower → Push/Pull/Upper/Lower (spaced, one leg day)', () => {
    const balanced = frequencyToSplit(4, 'balanced');
    expect(balanced).toEqual(['upper', 'lower', 'upper', 'lower']);
    const vtaper = frequencyToSplit(4, 'v-taper');
    // Recovery-SPACED template: the push muscles (chest/shoulders/triceps) must
    // NOT land on consecutive training days. push(Mon)→pull(Tue)→upper(Thu, 72h
    // after push)→lower(Fri). The old slot-swap gave ['upper','push',...] = UPPER
    // then PUSH back-to-back → fried second session (the 27-min thin-session bug).
    expect(vtaper).toEqual(['push', 'pull', 'upper', 'lower']);
    const legDays = vtaper.filter((c) => c === 'lower' || c === 'legs').length;
    expect(legDays).toBe(1);
    expect(legDays).toBeLessThan(balanced.filter((c) => c === 'lower' || c === 'legs').length);
    // No two ADJACENT days both train the push muscles (push + upper overlap on
    // chest/shoulders/triceps; consecutive = fried). Guards against regression.
    const HITS_PUSH = new Set(['push', 'upper', 'full']);
    for (let i = 1; i < vtaper.length; i++) {
      expect(HITS_PUSH.has(vtaper[i]) && HITS_PUSH.has(vtaper[i - 1])).toBe(false);
    }
  });

  it('v-taper @ 5 days reshapes a lower slot, always retains ≥1 leg day', () => {
    const vtaper = frequencyToSplit(5, 'v-taper');
    const legDays = vtaper.filter((c) => c === 'lower' || c === 'legs').length;
    expect(legDays).toBeGreaterThanOrEqual(1);
    const balancedLegDays = frequencyToSplit(5).filter((c) => c === 'lower' || c === 'legs').length;
    expect(legDays).toBeLessThan(balancedLegDays);
  });

  it('emphasis-only presets (arms/chest/lower) leave the split UNCHANGED', () => {
    for (const id of ['arms', 'chest', 'lower']) {
      for (let n = 1; n <= 7; n++) {
        expect(frequencyToSplit(n, id)).toEqual(frequencyToSplit(n));
      }
    }
  });

  it('unknown preset → balanced template (graceful)', () => {
    expect(frequencyToSplit(4, 'nonsense')).toEqual(frequencyToSplit(4));
  });
});

// ── balanced = byte-identical to pre-feature ────────────────────────────────
describe('balanced focus = zero behavior change (opt-in)', () => {
  it("plan with focusPreset 'balanced' deep-equals plan with NO focusPreset", async () => {
    const noFocus = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const balanced = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'balanced' } }),
      MONDAY_2026_05_18,
    );
    expect(balanced).toEqual(noFocus);
  });

  it('unknown/garbage focusPreset → treated as balanced (deep equal)', async () => {
    const noFocus = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const garbage = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'not-a-preset' } }),
      MONDAY_2026_05_18,
    );
    expect(garbage).toEqual(noFocus);
  });
});

// ── v-taper volume bias ─────────────────────────────────────────────────────
describe('v-taper — emphasized width UP, de-emphasized legs toward MEV', () => {
  it('umeri + spate weekly volume UP vs balanced', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(vtaper, 'umeri')).toBeGreaterThan(weeklyVol(balanced, 'umeri'));
    expect(weeklyVol(vtaper, 'spate')).toBeGreaterThan(weeklyVol(balanced, 'spate'));
    // Emphasized never exceeds MRV.
    expect(weeklyVol(vtaper, 'umeri')).toBeLessThanOrEqual(ISRAETEL_BASELINES.shoulders.MRV);
    expect(weeklyVol(vtaper, 'spate')).toBeLessThanOrEqual(ISRAETEL_BASELINES.back.MRV);
  });

  it('legs (quads/hams/glutes/calves) DOWN toward MEV, NEVER below MEV', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    const legGroups = [
      ['picioare-quads', 'quads'],
      ['picioare-hamstrings', 'hamstrings'],
      ['fese', 'glutes'],
      ['gambe', 'calves'],
    ];
    for (const [ro, en] of legGroups) {
      const before = weeklyVol(balanced, ro);
      const after = weeklyVol(vtaper, ro);
      expect(after).toBeLessThan(before); // relaxed toward maintenance
      expect(after).toBeGreaterThanOrEqual(ISRAETEL_BASELINES[en].MEV); // floor, never abandoned
    }
  });

  it('piept/core/biceps/triceps stay NEUTRAL (unchanged vs balanced)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    for (const ro of ['piept', 'biceps', 'triceps', 'core']) {
      expect(weeklyVol(vtaper, ro)).toBeCloseTo(weeklyVol(balanced, ro), 6);
    }
  });
});

// ── arms / chest / lower analogous ──────────────────────────────────────────
describe('arms / chest / lower — emphasized groups up, rest neutral', () => {
  it('arms → biceps + triceps UP', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const arms = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'arms' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(arms, 'biceps')).toBeGreaterThan(weeklyVol(balanced, 'biceps'));
    expect(weeklyVol(arms, 'triceps')).toBeGreaterThan(weeklyVol(balanced, 'triceps'));
  });

  it('chest → piept UP, legs unchanged (no de-emphasis)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const chest = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'chest' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(chest, 'piept')).toBeGreaterThan(weeklyVol(balanced, 'piept'));
    expect(weeklyVol(chest, 'picioare-quads')).toBeCloseTo(weeklyVol(balanced, 'picioare-quads'), 6);
  });

  it('lower → fese + quads + hams UP', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const lower = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'lower' } }),
      MONDAY_2026_05_18,
    );
    expect(weeklyVol(lower, 'fese')).toBeGreaterThan(weeklyVol(balanced, 'fese'));
    expect(weeklyVol(lower, 'picioare-quads')).toBeGreaterThan(weeklyVol(balanced, 'picioare-quads'));
  });
});

// ── Focus BEATS auto-balance (M2/M3 suppression on de-emphasized) ───────────
describe('focus suppresses auto-signals on de-emphasized groups', () => {
  // Sessions in the past that make QUADS lagging (heavy hams/glutes, tiny quads)
  // and quad/ham + push/pull data — placed `daysAgo` so recovery has cleared but
  // still inside the 14-day lagging/imbalance lookback.
  function laggingLegSessions(now, daysAgo = 6) {
    const ts = now - daysAgo * DAY_MS;
    const set = (kg) => ({ kg, reps: 8, timestamp: ts });
    return [
      {
        ts,
        exercises: [
          // quads: tiny (1 set) → lagging vs peers
          { exerciseName: 'Leg Extension', sets: [set(40)] },
          // hamstrings + glutes: heavy → quad/ham imbalance toward quads? no —
          // these make hams DOMINANT, so the imbalance would push quads up.
          { exerciseName: 'Romanian Deadlift', sets: [set(60), set(60), set(60), set(60)] },
          { exerciseName: 'Hip Thrust', sets: [set(80), set(80), set(80), set(80)] },
        ],
      },
    ];
  }

  it('v-taper: a lagging de-emphasized leg group is NOT amplified above its balanced budget', async () => {
    const logs = laggingLegSessions(MONDAY_2026_05_18.getTime());
    // Without focus: weakness/imbalance may raise the leg group.
    const balanced = await getDailyWorkout(
      buildUserState({ recentSessions: logs }),
      MONDAY_2026_05_18,
    );
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' }, recentSessions: logs }),
      MONDAY_2026_05_18,
    );
    // The de-emphasized quad budget under v-taper must be at or below its balanced
    // counterpart — the auto-signals did NOT re-inflate the minimized region.
    for (const ro of ['picioare-quads', 'picioare-hamstrings']) {
      expect(weeklyVol(vtaper, ro)).toBeLessThanOrEqual(weeklyVol(balanced, ro) + 1e-6);
      // Still floored at MEV (maintained, not abandoned).
      const en = BIG11_RO_TO_EN_MAP[ro];
      expect(weeklyVol(vtaper, ro)).toBeGreaterThanOrEqual(ISRAETEL_BASELINES[en].MEV);
    }
  });
});

// ── De-emphasized divisor — the lone leg day must LIGHTEN, not fatten ────────
// D-focus-divisor 2026-06-06 (founder live: "powerlifter legs, could barely walk").
// A v-taper collapses the lower body 2 leg days → 1 AND lowers the weekly leg
// budget toward MEV. The BUG: the per-session set budget = weeklyBudget /
// sessionsPerGroup, and collapsing to one leg day dropped the divisor 2→1, so the
// whole (reduced) weekly leg budget landed on the SINGLE leg day → a FATTER session
// (≈29 sets) than a balanced leg day (≈25). Fix: a de-emphasized group keeps the
// BALANCED divisor, so its lone leg day stays ~light. Invariant: a v-taper leg day's
// total sets ≤ a balanced leg day's, and well below the old ≈29.
describe('v-taper leg day LIGHTENS (de-emphasized divisor fix)', () => {
  // Founder setup: freq 4 → active L/Ma/J/V. Balanced has TWO leg days (Ma=dayIdx1,
  // V=dayIdx4); v-taper collapses to ONE (V=dayIdx4). Compare the leg-day sessions.
  const TUE = new Date(2026, 4, 19); // dayIdx 1 — balanced 'lower'
  const FRI = new Date(2026, 4, 22); // dayIdx 4 — balanced 'lower' AND v-taper 'lower'
  const totalSets = (plan) => (plan.exercises || []).reduce((s, e) => s + e.sets, 0);

  it('v-taper single leg day ≤ both balanced leg days (no re-concentration)', async () => {
    const balTue = await getDailyWorkout(buildUserState(), TUE);
    const balFri = await getDailyWorkout(buildUserState(), FRI);
    const vtFri = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      FRI,
    );
    // All three are leg days (LOWER cluster) — same comparison basis.
    expect(balTue.sessionType).toBe('LOWER');
    expect(balFri.sessionType).toBe('LOWER');
    expect(vtFri.sessionType).toBe('LOWER');
    const vt = totalSets(vtFri);
    // The v-taper leg day must NOT be heavier than a balanced leg day — the whole
    // point of de-emphasis (the bug had it at 29 vs 25/27).
    expect(vt).toBeLessThanOrEqual(totalSets(balTue));
    expect(vt).toBeLessThanOrEqual(totalSets(balFri));
    // Hard ceiling well below the old ≈29-set "powerlifter legs" regression.
    expect(vt).toBeLessThan(28);
  });

  it('the de-emphasized leg compounds are not pushed to their max set count', async () => {
    const vtFri = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      FRI,
    );
    // The squat + the leg press (quad compounds) must sit BELOW COMPOUND_MAX_SETS (5)
    // — the divisor bug had Leg Press:4 / RDL:5; the fix keeps them ~3.
    const setOf = (name) =>
      (vtFri.exercises || []).find((e) => e.name === name)?.sets ?? null;
    const legPress = setOf('Leg Press');
    if (legPress !== null) expect(legPress).toBeLessThan(5);
  });
});

// ── Recovery + time guards still apply ──────────────────────────────────────
describe('recovery (M1) + time cap remain guards under focus', () => {
  // A heavy shoulder session TODAY fries umeri (the v-taper EMPHASIZED group).
  function friedShouldersToday(now) {
    return [
      {
        ts: now,
        exercises: [
          {
            exerciseName: 'DB Shoulder Press',
            sets: [
              { kg: 30, reps: 8, timestamp: now },
              { kg: 30, reps: 8, timestamp: now },
              { kg: 30, reps: 8, timestamp: now },
              { kg: 30, reps: 8, timestamp: now },
            ],
          },
        ],
      },
    ];
  }

  it('a fried EMPHASIZED muscle is still cut by recovery today (focus shapes intent, not safety)', async () => {
    const fried = friedShouldersToday(MONDAY_2026_05_18.getTime());
    // v-taper emphasizes umeri → high weekly budget; but fried today → M1 cuts it.
    const noRecovery = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    const withRecovery = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' }, recentSessions: fried }),
      MONDAY_2026_05_18,
    );
    // The fresh-day emphasized umeri budget is cut once umeri is fried today.
    expect(weeklyVol(withRecovery, 'umeri')).toBeLessThan(weeklyVol(noRecovery, 'umeri'));
  });

  it('estimatedDurationMin (time cap surface) is present + finite under a preset', async () => {
    const plan = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    expect(Number.isFinite(plan.estimatedDurationMin)).toBe(true);
  });
});

// ── Determinism ─────────────────────────────────────────────────────────────
describe('focus determinism', () => {
  it('same now + state + preset → identical plan across runs', async () => {
    const state = () => buildUserState({ user: { focusPreset: 'v-taper' } });
    const a = await getDailyWorkout(state(), MONDAY_2026_05_18);
    const b = await getDailyWorkout(state(), MONDAY_2026_05_18);
    expect(a).toEqual(b);
  });
});

// ── VISIBLE DIFFERENTIATION (D-focus-visible 2026-06-05) ─────────────────────
// Daniel: "whatever I pick I get the v-taper workout." Root cause was NOT a
// persistence/cache bug — it was that arms/chest produced an exercise-for-exercise
// CLONE of balanced's session (only v-taper changed the SPLIT, so only v-taper
// LOOKED different). The weekly volume bias was real but the SESSION_SIZE clamp +
// cluster-weight slot caps + per-exercise set clamps absorbed it, so the visible
// exercise list never moved. These tests assert each preset now produces a
// DISTINGUISHABLE generated session for the SAME frequency + state.
describe('focus presets produce VISIBLY distinguishable sessions', () => {
  // A comparable signature of the actual generated session: the ordered exercise
  // names + their set counts. Two presets are distinguishable iff this differs.
  function sessionSignature(plan) {
    return (plan.exercises || []).map((e) => `${e.name}:${e.sets}`).join('|');
  }

  it('arms ≠ balanced — the generated session differs (not a clone)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const arms = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'arms' } }),
      MONDAY_2026_05_18,
    );
    expect(sessionSignature(arms)).not.toBe(sessionSignature(balanced));
  });

  it('chest ≠ balanced — the generated session differs (not a clone)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const chest = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'chest' } }),
      MONDAY_2026_05_18,
    );
    expect(sessionSignature(chest)).not.toBe(sessionSignature(balanced));
  });

  it('v-taper ≠ balanced — the generated session differs (split + content)', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const vtaper = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'v-taper' } }),
      MONDAY_2026_05_18,
    );
    expect(sessionSignature(vtaper)).not.toBe(sessionSignature(balanced));
    // v-taper also changes the session TYPE on this day (PUSH, not UPPER).
    expect(vtaper.sessionType).not.toBe(balanced.sessionType);
  });

  it('all four presets are pairwise distinguishable (no two share a session)', async () => {
    const presets = ['balanced', 'arms', 'chest', 'v-taper'];
    const sigs = {};
    for (const p of presets) {
      const plan = await getDailyWorkout(
        buildUserState({ user: { focusPreset: p } }),
        MONDAY_2026_05_18,
      );
      sigs[p] = sessionSignature(plan);
    }
    const seen = new Set();
    for (const p of presets) {
      expect(seen.has(sigs[p]), `${p} session is a duplicate of another preset`).toBe(false);
      seen.add(sigs[p]);
    }
  });

  it('arms surfaces an arm movement (triceps pushdown / curl) balanced lacks', async () => {
    const balanced = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const arms = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'arms' } }),
      MONDAY_2026_05_18,
    );
    const names = (plan) => new Set((plan.exercises || []).map((e) => e.name));
    const armsNames = names(arms);
    const balancedNames = names(balanced);
    // At least one exercise present under arms that is NOT in the balanced session
    // (the extra arm/shoulder slot the emphasis earned).
    const added = [...armsNames].filter((n) => !balancedNames.has(n));
    expect(added.length).toBeGreaterThan(0);
  });

  it('lower surfaces on a LEG day (emphasis cannot show on an upper day, honestly)', async () => {
    // Monday @ freq 4 is an UPPER day → no leg group trained → lower preset is a
    // no-op there (correct + honest). The leg emphasis surfaces on the leg day
    // (Tuesday, dayIdx 1 = the 2nd active day = 'lower' cluster). Compare the
    // generated session there.
    const TUESDAY = new Date(2026, 4, 19); // dayIdx 1 (Ma) — 'lower' cluster @ freq4
    const balanced = await getDailyWorkout(buildUserState(), TUESDAY);
    const lower = await getDailyWorkout(
      buildUserState({ user: { focusPreset: 'lower' } }),
      TUESDAY,
    );
    expect(sessionSignature(lower)).not.toBe(sessionSignature(balanced));
  });
});
