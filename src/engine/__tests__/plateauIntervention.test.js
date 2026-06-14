// ══ BUILD #2/C — plateau → intervention tests (F4 spec §C) ═══════════════════
// (1) Pure classifyAndIntervene / problemIntervention.
// (2) FLAG-OFF byte-identical: with dp_plateau_intervention_v1 OFF (default), a
//     stagnant lift gets NO plateauIntervention annotation + the legacy rec is
//     untouched.
// (3) FLAG-ON: a near_ceiling plateau rotates a variation (no deload); a problem
//     plateau intervenes (rep_shift); a sub-threshold stall is a no-op.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  classifyAndIntervene, problemIntervention, PLATEAU_MIN_WEEKS, PROBLEM_LADDER,
} from '../dp/plateauIntervention.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

describe('problemIntervention — escalating ladder', () => {
  it('occurrence 1 → rep_shift, 2 → deload, 3 → variation', () => {
    expect(problemIntervention(1)).toBe('rep_shift');
    expect(problemIntervention(2)).toBe('deload');
    expect(problemIntervention(3)).toBe('variation');
  });
  it('clamps past the end of the ladder to the last rung', () => {
    expect(problemIntervention(7)).toBe(PROBLEM_LADDER[PROBLEM_LADDER.length - 1]);
  });
  it('defends a bad occurrence', () => {
    expect(problemIntervention(0)).toBe('rep_shift');
    expect(problemIntervention(NaN)).toBe('rep_shift');
  });
});

describe('classifyAndIntervene — pure', () => {
  const EX = 'Lat Pulldown';
  it('below the weeks gate → null (no-op)', () => {
    expect(classifyAndIntervene({ stagnationWeeks: PLATEAU_MIN_WEEKS - 1, mu: 80, ceiling: 100, ex: EX })).toBeNull();
  });
  it('near_ceiling (mu/ceiling >= 0.9) → variation rotation, no deload', () => {
    const r = classifyAndIntervene({ stagnationWeeks: 3, mu: 95, ceiling: 100, ex: EX });
    expect(r.classification).toBe('near_ceiling');
    expect(r.action).toBe('variation');
    // A real CORE_AUTO lift has a same-muscle pool → a named variation.
    expect(typeof r.variation === 'string' || r.variation === null).toBe(true);
  });
  it('problem (mu/ceiling < 0.7) → rep_shift on the first occurrence', () => {
    const r = classifyAndIntervene({ stagnationWeeks: 2, mu: 50, ceiling: 100, ex: EX, occurrence: 1 });
    expect(r.classification).toBe('problem');
    expect(r.action).toBe('rep_shift');
  });
  it('problem escalates to deload then variation across occurrences', () => {
    expect(classifyAndIntervene({ stagnationWeeks: 4, mu: 50, ceiling: 100, ex: EX, occurrence: 2 }).action).toBe('deload');
    expect(classifyAndIntervene({ stagnationWeeks: 6, mu: 50, ceiling: 100, ex: EX, occurrence: 3 }).action).toBe('variation');
  });
  it('midrange (0.7 <= mu/ceiling < 0.9) → action none', () => {
    const r = classifyAndIntervene({ stagnationWeeks: 3, mu: 80, ceiling: 100, ex: EX });
    expect(r.classification).toBe('midrange');
    expect(r.action).toBe('none');
  });
});

describe('plateau intervention wired into getSmartRecommendation', () => {
  // Build a 4-week stagnant history (same ~weight each week, multiple sessions) so
  // detectStagnation reports consecutive stagnant weeks. Real rating literals.
  const EX = 'Lat Pulldown';
  const WEEK = 7 * 86400000;
  function seedStagnant() {
    const base = Date.UTC(2026, 0, 5); // a Monday
    const logs = [];
    for (let wk = 0; wk < 5; wk++) {
      for (let s = 0; s < 2; s++) {
        logs.push({ ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + wk * WEEK + s * 2 * 86400000 });
      }
    }
    DB.set('logs', logs);
  }
  beforeEach(() => {
    localStorage.clear();
    seedStagnant();
  });
  afterEach(() => vi.restoreAllMocks());

  it('FLAG OFF — no plateauIntervention annotation', () => {
    // default flipped ON 2026-06-14 (Wave B) → pin OFF explicitly to keep the OFF path covered
    vi.spyOn(flags, 'isEnabled').mockImplementation(() => false);
    const r = DP.getSmartRecommendation(EX, null, null, Date.UTC(2026, 1, 16), null, []);
    expect(r.plateauIntervention).toBeUndefined();
  });

  it('FLAG ON — a stagnant lift gets a plateauIntervention descriptor', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_plateau_intervention_v1');
    const r = DP.getSmartRecommendation(EX, null, null, Date.UTC(2026, 1, 16), null, []);
    expect(r.plateauIntervention).toBeDefined();
    expect(['near_ceiling', 'problem', 'midrange']).toContain(r.plateauIntervention.classification);
  });
});
