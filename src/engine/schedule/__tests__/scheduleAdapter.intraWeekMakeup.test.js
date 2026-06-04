// INTRA-WEEK DEFICIT RECOVERY (D-intra-week 2026-06-04, Phase 2) — when earlier
// sessions THIS microcycle were skipped / ended early, the volume they owed is
// MADE UP on a later day, bounded by:
//   - per-group proration TO-DATE (a group whose sessions are all UPCOMING has NO
//     deficit — Thursday must not chase Saturday's leg day);
//   - the LOCKED ≤+30%/session cap;
//   - recovery (the makeup is injected BEFORE the M1 cut, so a FATIGUED group's
//     makeup is trimmed — body overrides calendar);
//   - the Israetel MRV hard cap (makeup never pushes a group over its max).
//
// COLD START (no weekContext / no done volume) → makeup all 0 → the plan is
// byte-identical to pre-feature.
//
// Two layers under test:
//   A. the PURE helpers (weekSessionSpreadByGroup / computeIntraWeekMakeup /
//      applyMakeupToVolumeBudget) — full determinism, exact arithmetic;
//   B. the WIRED plan (getDailyWorkout reads userState.weekContext).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout } from '../scheduleAdapter.js';
import {
  weekSessionSpreadByGroup,
  computeIntraWeekMakeup,
  applyMakeupToVolumeBudget,
  MAKEUP_PER_SESSION_CAP_FRACTION,
} from '../scheduleAdapter/intraWeekMakeup.js';
import { activeWeekForFrequency, frequencyToSplit } from '../scheduleAdapter/frequencySplit.js';
import { ISRAETEL_BASELINES } from '../../periodization/constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// Marius @ 5 days/week (frequency '5' → upper/lower/push/pull/legs). Active week
// L,Ma,Mi,V,S → day0:upper, day1:lower, day2:push, day4:pull, day5:legs. High
// persona keeps budgets off the clamp so a makeup bump is observable.
const WEDNESDAY_2026_05_20 = new Date(2026, 4, 20); // dayIdx 2 (push: piept/umeri/triceps)
const MONDAY_2026_05_18 = new Date(2026, 4, 18); // dayIdx 0 (upper)

function buildUserState(overrides = {}) {
  const { user, ...rest } = overrides;
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: '5', ...(user || {}) },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...rest,
  };
}

// weekContext the React builder would assemble: DONE working-set volume per EN
// group this microcycle + the week anchor. The makeup logic reads ONLY this
// (recentSessions drive recovery separately), so feeding volumeDone directly is
// the deterministic way to assert deficit behaviour.
function weekContext(volumeDone, weekStartMs) {
  return { volumeDone, weekStartMs };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── A. PURE helpers ─────────────────────────────────────────────────────────
describe('weekSessionSpreadByGroup — PAST+TODAY vs TODAY+FUTURE per group', () => {
  const aw5 = activeWeekForFrequency('5'); // L,Ma,Mi,V,S

  it('on Wednesday (push), chest is elapsed on upper+push, remaining only on push', () => {
    const { elapsed, remaining } = weekSessionSpreadByGroup(aw5, 2);
    // piept trained day0 (upper) + day2 (push) → both elapsed; only day2 remains.
    expect(elapsed.piept).toBe(2);
    expect(remaining.piept).toBe(1);
  });

  it('legs groups on MONDAY are ALL upcoming (elapsed 0) — no past leg day yet', () => {
    const { elapsed, remaining } = weekSessionSpreadByGroup(aw5, 0);
    // lower (day1) + legs (day5) are both AFTER Monday → quads elapsed 0.
    expect(elapsed['picioare-quads']).toBeUndefined();
    expect(remaining['picioare-quads']).toBe(2);
  });

  it('today counts in BOTH elapsed and remaining (it is due now AND still trainable today)', () => {
    const { elapsed, remaining } = weekSessionSpreadByGroup(aw5, 2);
    // umeri trained only on push (day2 = today) → elapsed includes today, remaining too.
    expect(elapsed.umeri).toBe(2); // upper(day0) + push(day2=today)
    expect(remaining.umeri).toBe(1); // push(day2=today)
  });
});

describe('computeIntraWeekMakeup — proration + recover-only deficit + ≤30% cap', () => {
  const split5 = frequencyToSplit(5);
  const aw5 = activeWeekForFrequency('5');
  // A flat base budget so the arithmetic is easy to read.
  const base = { chest: 20, shoulders: 20, triceps: 20, back: 20, biceps: 20 };

  it('a skipped group earlier this week → positive makeup, capped at 30% of base', () => {
    // Query Wednesday (push). chest elapsed=2, weeklySessions(chest)=upper+push=2 →
    // expectedPerSession=20/2=10 → targetToDate=10*2=20. Done 0 → deficit 20.
    // remainingDays(chest on/after Wed)=1 (push today) → raw makeup=20/1=20, but the
    // cap = 0.30*20 = 6 → makeup = 6 (the LOCKED ≤+30%/session cap bites).
    const spread = weekSessionSpreadByGroup(aw5, 2);
    const { added, behind } = computeIntraWeekMakeup(base, { chest: 0 }, split5, spread);
    expect(added.chest).toBeCloseTo(6, 9);
    // deficit 20 − makeup 6 = 14 still owed after today.
    expect(behind.chest).toBeCloseTo(14, 9);
  });

  it('spread divides the deficit across remaining days (no cap when share is small)', () => {
    // back: query Monday (day0=upper). back elapsed=1 (upper). weeklySessions(back)=
    // upper+pull=2 → expectedPerSession=10 → targetToDate=10. Done 0 → deficit 10.
    // remainingDays(back on/after Mon)=upper(day0)+pull(day4)=2 → raw makeup=10/2=5.
    // cap=0.30*20=6 → 5 < 6 → makeup=5 (the spread, not the cap, governs).
    const spread = weekSessionSpreadByGroup(aw5, 0);
    const { added } = computeIntraWeekMakeup(base, { back: 0 }, split5, spread);
    expect(added.back).toBeCloseTo(5, 9);
  });

  it('a group whose sessions are ALL UPCOMING gets NO deficit (no false makeup)', () => {
    // Monday query: quads elapsed 0 (lower+legs are both later) → targetToDate 0 →
    // deficit 0 → NO makeup, even though done is 0.
    const spread = weekSessionSpreadByGroup(aw5, 0);
    const baseLegs = { quads: 18 };
    const { added, behind } = computeIntraWeekMakeup(baseLegs, { quads: 0 }, split5, spread);
    expect(added.quads).toBeUndefined();
    expect(behind.quads).toBeUndefined();
  });

  it('cold start: empty volumeDone but a partly-elapsed week still yields makeup ONLY where elapsed>0', () => {
    // Wednesday: chest elapsed 2 → deficit; quads elapsed 1 (Mon lower) → deficit.
    // umeri elapsed 2 → deficit. A no-done week is the "skipped everything" case.
    const spread = weekSessionSpreadByGroup(aw5, 2);
    const baseAll = { chest: 20, shoulders: 20, triceps: 20, quads: 18 };
    const { added } = computeIntraWeekMakeup(baseAll, {}, split5, spread);
    expect(added.chest).toBeGreaterThan(0);
    expect(added.shoulders).toBeGreaterThan(0);
    // quads: elapsed 1 (Monday lower) → real deficit, capped.
    expect(added.quads).toBeGreaterThan(0);
  });

  it('over-done group → NO cut (recover-only): makeup 0, behind 0', () => {
    // chest done 50 ≫ targetToDate 20 → deficit 0 → no makeup, nothing behind.
    const spread = weekSessionSpreadByGroup(aw5, 2);
    const { added, behind } = computeIntraWeekMakeup(base, { chest: 50 }, split5, spread);
    expect(added.chest).toBeUndefined();
    expect(behind.chest).toBeUndefined();
  });

  it('no makeup is ever negative; the cap fraction is the documented 0.30', () => {
    expect(MAKEUP_PER_SESSION_CAP_FRACTION).toBe(0.30);
  });
});

describe('applyMakeupToVolumeBudget — additive, MRV-capped, pure', () => {
  it('adds the makeup to the matching group, returns a NEW map', () => {
    const src = { chest: 14, shoulders: 12 };
    const out = applyMakeupToVolumeBudget(src, { chest: 6 });
    expect(out).not.toBe(src);
    expect(out.chest).toBe(20);
    expect(out.shoulders).toBe(12);
    expect(src.chest).toBe(14); // input untouched
  });

  it('HARD-caps the bumped group at its Israetel MRV (never over the recoverable max)', () => {
    // chest MRV = 22. base 20 + makeup 6 = 26 → clamped to 22.
    const out = applyMakeupToVolumeBudget({ chest: 20 }, { chest: 6 });
    expect(out.chest).toBe(ISRAETEL_BASELINES.chest.MRV);
  });

  it('never LOWERS a group already above its MRV', () => {
    const out = applyMakeupToVolumeBudget({ chest: 30 }, { chest: 4 });
    expect(out.chest).toBe(30); // already > MRV; bump clamped down to current, not below
  });

  it('empty makeup → shallow clone, byte-identical values', () => {
    const src = { chest: 14, back: 18 };
    expect(applyMakeupToVolumeBudget(src, {})).toEqual(src);
  });
});

// ── B. WIRED plan (getDailyWorkout reads userState.weekContext) ──────────────
describe('getDailyWorkout — intra-week makeup wired into the daily plan', () => {
  it('(a) skipped group earlier this week → makeup ADDED on a later day, ≤+30%, ≤MRV', async () => {
    const baseline = await getDailyWorkout(buildUserState(), WEDNESDAY_2026_05_20);
    // chest skipped (done 0) but elapsed on upper → a real deficit on the push day.
    const withDeficit = await getDailyWorkout(
      buildUserState({ weekContext: weekContext({ chest: 0 }, MONDAY_2026_05_18.getTime()) }),
      WEDNESDAY_2026_05_20,
    );
    expect(baseline).not.toBeNull();
    expect(withDeficit).not.toBeNull();
    // chest budget grows vs the no-makeup baseline.
    expect(withDeficit.volumeTargets.chest).toBeGreaterThan(baseline.volumeTargets.chest);
    // …by at most +30% of the base chest budget (the LOCKED cap).
    const cap = MAKEUP_PER_SESSION_CAP_FRACTION * baseline.volumeTargets.chest;
    expect(withDeficit.volumeTargets.chest - baseline.volumeTargets.chest)
      .toBeLessThanOrEqual(cap + 1e-9);
    // …and never over MRV.
    expect(withDeficit.volumeTargets.chest).toBeLessThanOrEqual(ISRAETEL_BASELINES.chest.MRV + 1e-9);
    // The makeup is surfaced as DATA on the plan (no copy this phase).
    expect(withDeficit.weekMakeup.added.chest).toBeGreaterThan(0);
    expect(withDeficit.weekMakeup.behind.chest).toBeGreaterThan(0);
  });

  it('(b) a FATIGUED group makeup is TRIMMED by recovery (recovery overrides the makeup)', async () => {
    // A recent heavy chest session (1 day ago) keeps chest NON-recovered TODAY.
    const chestSession = (ts) => ({
      ts,
      exercises: [
        {
          exerciseName: 'Flat DB Press',
          sets: [
            { kg: 40, reps: 8, timestamp: ts },
            { kg: 40, reps: 8, timestamp: ts },
            { kg: 40, reps: 8, timestamp: ts },
          ],
        },
      ],
    });
    const recent = [chestSession(WEDNESDAY_2026_05_20.getTime() - 1 * DAY_MS)];
    // SAME chest deficit fed BUT chest is fatigued today.
    const freshMakeup = await getDailyWorkout(
      buildUserState({ weekContext: weekContext({ chest: 0 }, MONDAY_2026_05_18.getTime()) }),
      WEDNESDAY_2026_05_20,
    );
    const fatiguedMakeup = await getDailyWorkout(
      buildUserState({
        recentSessions: recent,
        weekContext: weekContext({ chest: 0 }, MONDAY_2026_05_18.getTime()),
      }),
      WEDNESDAY_2026_05_20,
    );
    expect(freshMakeup).not.toBeNull();
    expect(fatiguedMakeup).not.toBeNull();
    // Recovery cut runs AFTER the makeup add, so the fatigued chest ends LOWER than
    // the same group's made-up-but-fresh budget — recovery overrode the makeup.
    expect(fatiguedMakeup.volumeTargets.chest).toBeLessThan(freshMakeup.volumeTargets.chest);
  });

  it('(c) a group whose sessions are all UPCOMING gets NO deficit-driven makeup', async () => {
    // Query MONDAY (upper). Legs are all later this week → quads elapsed 0 → even a
    // 0-done leg group registers NO deficit, so the plan equals the no-makeup run.
    const baseline = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const withUpcomingLegs = await getDailyWorkout(
      buildUserState({
        weekContext: weekContext({ quads: 0, hamstrings: 0, glutes: 0 }, MONDAY_2026_05_18.getTime()),
      }),
      MONDAY_2026_05_18,
    );
    expect(baseline).not.toBeNull();
    expect(withUpcomingLegs).not.toBeNull();
    // No leg makeup surfaced.
    expect(withUpcomingLegs.weekMakeup.added.quads).toBeUndefined();
    // Monday is an upper day; quads/hams/glutes are not even trained today, and they
    // carry no deficit → their budget is unchanged vs baseline.
    expect(withUpcomingLegs.volumeTargets.quads).toBe(baseline.volumeTargets.quads);
    expect(withUpcomingLegs.volumeTargets.hamstrings).toBe(baseline.volumeTargets.hamstrings);
  });

  it('(d) cold start / no weekContext → plan BYTE-IDENTICAL (no makeup)', async () => {
    const noCtx = await getDailyWorkout(buildUserState(), WEDNESDAY_2026_05_20);
    const empty = await getDailyWorkout(buildUserState(), WEDNESDAY_2026_05_20);
    expect(noCtx).not.toBeNull();
    expect(noCtx.volumeTargets).toEqual(empty.volumeTargets);
    expect(noCtx.exercises).toEqual(empty.exercises);
    // weekMakeup present but EMPTY on the cold-start plan (data field always emitted).
    expect(noCtx.weekMakeup).toEqual({ added: {}, behind: {} });
    // A weekContext whose done volume meets/exceeds EVERY elapsed group's to-date
    // target records NO deficit → byte-identical to the no-context baseline. (A high
    // done value across all push groups + the legs/back groups that are elapsed by
    // Wednesday — feed them all so no group reports a shortfall.)
    const allMet = {
      chest: 99, shoulders: 99, triceps: 99, back: 99, biceps: 99,
      quads: 99, hamstrings: 99, glutes: 99, calves: 99, abs: 99, forearms: 99,
    };
    const overDone = await getDailyWorkout(
      buildUserState({ weekContext: weekContext(allMet, MONDAY_2026_05_18.getTime()) }),
      WEDNESDAY_2026_05_20,
    );
    expect(overDone.volumeTargets).toEqual(noCtx.volumeTargets);
    expect(overDone.exercises).toEqual(noCtx.exercises);
    expect(overDone.weekMakeup).toEqual({ added: {}, behind: {} });
  });

  it('(e) over-done group → NO cut to chase the week (recover-only): budget not below baseline', async () => {
    const baseline = await getDailyWorkout(buildUserState(), WEDNESDAY_2026_05_20);
    const overDone = await getDailyWorkout(
      buildUserState({
        weekContext: weekContext({ chest: 99 }, MONDAY_2026_05_18.getTime()),
      }),
      WEDNESDAY_2026_05_20,
    );
    expect(baseline).not.toBeNull();
    expect(overDone).not.toBeNull();
    // Over-doing chest never LOWERS its budget (recover-only — we never owe back).
    expect(overDone.volumeTargets.chest).toBe(baseline.volumeTargets.chest);
    expect(overDone.weekMakeup.added.chest).toBeUndefined();
  });

  it('determinism: same now + weekContext + user → identical plan across runs', async () => {
    const state = () =>
      buildUserState({ weekContext: weekContext({ chest: 0 }, MONDAY_2026_05_18.getTime()) });
    const a = await getDailyWorkout(state(), WEDNESDAY_2026_05_20);
    const b = await getDailyWorkout(state(), WEDNESDAY_2026_05_20);
    expect(a).not.toBeNull();
    expect(a.volumeTargets).toEqual(b.volumeTargets);
    expect(a.exercises).toEqual(b.exercises);
    expect(a.weekMakeup).toEqual(b.weekMakeup);
  });

  it('MRV invariant across the WHOLE made-up plan — no group ever exceeds its MRV', async () => {
    // Aggressive deficits on every push group to stress the cap + clamp chain.
    const plan = await getDailyWorkout(
      buildUserState({
        weekContext: weekContext({ chest: 0, shoulders: 0, triceps: 0 }, MONDAY_2026_05_18.getTime()),
      }),
      WEDNESDAY_2026_05_20,
    );
    expect(plan).not.toBeNull();
    for (const [enKey, sets] of Object.entries(plan.volumeTargets)) {
      const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
      if (typeof mrv === 'number') {
        expect(sets).toBeLessThanOrEqual(mrv + 1e-9);
      }
    }
  });
});
