// ══ BUILD F6b V4 #15 — Auto-pivot near ceiling unit tests (spec §4c) ═════════
// Pure aggregator + proposal decision over EXISTING primitives (classifyPlateau +
// evaluateReprompt). PROPOSES, never auto-applies. The sim-plan cases (spec §4c):
//   - all lifts near ceiling (mu/ceiling ≥ 0.9) + sustained stagnation → PROPOSE.
//   - sub-ceiling lifts (mu/ceiling < 0.7 = problem) → NO pivot (per-lift path owns it).
//   - share below threshold → NO pivot.
//   - too few lifts → NO pivot.
//   - the anti-spam cooldown blocks a re-prompt inside the post-goal-shift window.
//   - a target identical to the current goal is dropped.

import { describe, it, expect } from 'vitest';
import {
  nearCeilingShare,
  proposeGoalPivot,
  PIVOT_SHARE_THRESHOLD,
  PIVOT_TARGETS,
} from '../autoPivot.js';
import { NEAR_CEILING_RATIO } from '../ceiling.js';

const DAY = 86400000;
const NOW = Date.UTC(2026, 5, 1);

// A lift at a given mu/ceiling ratio (ceiling fixed at 100 → mu = ratio*100).
const liftAt = (ex, ratio) => ({ ex, mu: ratio * 100, ceiling: 100 });

describe('F6b V4 #15 — nearCeilingShare', () => {
  it('counts only lifts classified near_ceiling (≥ 0.9 mu/ceiling)', () => {
    const lifts = [liftAt('a', 0.95), liftAt('b', 0.92), liftAt('c', 0.5)];
    const { share, nearCount, total } = nearCeilingShare(lifts);
    expect(total).toBe(3);
    expect(nearCount).toBe(2);
    expect(share).toBeCloseTo(2 / 3, 5);
  });

  it('ignores lifts with no usable mu (degrades, never NaN)', () => {
    const lifts = [liftAt('a', 0.95), { ex: 'b', mu: 0, ceiling: 100 }, { ex: 'c' }];
    const { nearCount, total } = nearCeilingShare(lifts);
    expect(total).toBe(1);
    expect(nearCount).toBe(1);
  });

  it('empty / non-array → zero share', () => {
    expect(nearCeilingShare([]).share).toBe(0);
    expect(nearCeilingShare(null).share).toBe(0);
  });
});

describe('F6b V4 #15 — proposeGoalPivot', () => {
  const allNearCeiling = [liftAt('a', 0.95), liftAt('b', 0.93), liftAt('c', 0.91)];

  it('all lifts near ceiling + sustained stagnation → PROPOSE (not auto-applied)', () => {
    const out = proposeGoalPivot({
      lifts: allNearCeiling,
      maxStagnationWeeks: 3,
      currentGoalId: 'forta',
      nowMs: NOW,
    });
    expect(out).not.toBeNull();
    expect(out.propose).toBe(true);
    expect(out.share).toBeGreaterThanOrEqual(PIVOT_SHARE_THRESHOLD);
    expect(out.targets.length).toBeGreaterThan(0);
    expect(out.targets).not.toContain('forta'); // proposes OFF pure strength
  });

  it('sub-ceiling lifts (problem plateau, < 0.7) → NO pivot (per-lift path owns it)', () => {
    const subCeiling = [liftAt('a', 0.5), liftAt('b', 0.55), liftAt('c', 0.6)];
    const out = proposeGoalPivot({
      lifts: subCeiling,
      maxStagnationWeeks: 3,
      currentGoalId: 'forta',
      nowMs: NOW,
    });
    expect(out).toBeNull();
  });

  it('share below threshold → NO pivot', () => {
    const mixed = [liftAt('a', 0.95), liftAt('b', 0.5), liftAt('c', 0.5), liftAt('d', 0.5)];
    const out = proposeGoalPivot({
      lifts: mixed,
      maxStagnationWeeks: 3,
      currentGoalId: 'forta',
      nowMs: NOW,
    });
    expect(out).toBeNull();
  });

  it('too few main lifts → NO pivot (no population call)', () => {
    const out = proposeGoalPivot({
      lifts: [liftAt('a', 0.95), liftAt('b', 0.93)],
      maxStagnationWeeks: 3,
      currentGoalId: 'forta',
      nowMs: NOW,
    });
    expect(out).toBeNull();
  });

  it('no sustained stagnation → NO pivot (a real plateau is the trigger)', () => {
    const out = proposeGoalPivot({
      lifts: allNearCeiling,
      maxStagnationWeeks: 1,
      currentGoalId: 'forta',
      nowMs: NOW,
    });
    expect(out).toBeNull();
  });

  it('anti-spam: a recent goal shift (< 60d) BLOCKS the re-prompt', () => {
    const out = proposeGoalPivot({
      lifts: allNearCeiling,
      maxStagnationWeeks: 3,
      currentGoalId: 'forta',
      nowMs: NOW,
      prompts: { lastGoalShiftMs: NOW - 10 * DAY }, // 10d ago, inside the 60d cooldown
    });
    expect(out).toBeNull();
  });

  it('anti-spam: a goal shift OUTSIDE the 60d window does NOT block', () => {
    const out = proposeGoalPivot({
      lifts: allNearCeiling,
      maxStagnationWeeks: 3,
      currentGoalId: 'forta',
      nowMs: NOW,
      prompts: { lastGoalShiftMs: NOW - 90 * DAY },
    });
    expect(out).not.toBeNull();
  });

  it('drops a target identical to the current goal; null if nothing left to propose', () => {
    // current goal == every target would be impossible (targets are off-strength), so
    // verify hipertrofie is dropped when the user is already on it.
    const out = proposeGoalPivot({
      lifts: allNearCeiling,
      maxStagnationWeeks: 3,
      currentGoalId: 'hipertrofie',
      nowMs: NOW,
    });
    expect(out).not.toBeNull();
    expect(out.targets).not.toContain('hipertrofie');
    expect(PIVOT_TARGETS).toContain('hipertrofie');
  });

  it('the near_ceiling threshold is exactly classifyPlateau NEAR_CEILING_RATIO', () => {
    // a lift right at the ratio counts as near_ceiling (boundary reuse, no new threshold).
    const atBoundary = [liftAt('a', NEAR_CEILING_RATIO), liftAt('b', NEAR_CEILING_RATIO), liftAt('c', NEAR_CEILING_RATIO)];
    expect(nearCeilingShare(atBoundary).share).toBe(1);
  });
});
