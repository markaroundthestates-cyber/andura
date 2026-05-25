// ══ INTEGRATION SMOKE TEST — runner pipeline end-to-end (10 candidates) ════
// Validates plumbing: pruning → pipeline → invariants → flagging → BranchReport.

import { describe, it, expect } from 'vitest';
import { runFullSimulation, branchId, filterFlaggedOnly } from '../runner.js';

/** @typedef {import('../types.js').ConstraintObject} ConstraintObject */

/** @returns {ConstraintObject} */
function mk(overrides = {}) {
  return /** @type {ConstraintObject} */ ({
    persona: { name: 'Test', age: 30, sex: 'M', kg: 75, height: 175, bmi: 24, job: 'office', lifestyle: 'sedentary' },
    goal: { template: 'Tonifiere', phase: 'MAINTAIN', mode: 'Estetica' },
    experience: 'intermediate',
    equipment: ['dumbbell'],
    schedule: { frequency: 3, session_duration_target: 60 },
    history: { tier: 'T2', cdl_window: [] },
    recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: [] },
    profile_typing: { primary: 'mixed', secondary: 'mixed', confidence: 0.5 },
    demographic_prior: { anchor_personas: [] },
    ...overrides,
  });
}

describe('branchId deterministic generation', () => {
  it('same input → same id', () => {
    const c = mk({ persona: { ...mk().persona, name: 'Maria' } });
    expect(branchId(c)).toBe(branchId(c));
  });
  it('contains persona + goal + experience + equipment + frequency + tier + recovery', () => {
    const id = branchId(mk({
      persona: { ...mk().persona, name: 'Maria 65', age: 65 },
      goal: { template: 'Longevitate', phase: 'MAINTAIN', mode: 'Estetica' },
      experience: 'beginner',
      equipment: ['bodyweight'],
      schedule: { frequency: 3, session_duration_target: 60 },
      history: { tier: 'T1', cdl_window: [] },
      recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['knee_arthrosis'] },
    }));
    expect(id).toContain('maria65');
    expect(id).toContain('longevitate-maintain');
    expect(id).toContain('beginner');
    expect(id).toContain('bodyweight');
    expect(id).toContain('3x');
    expect(id).toContain('T1');
    expect(id).toContain('knee_arthrosis');
  });
});

describe('runFullSimulation end-to-end smoke (10 candidates)', () => {
  it('runs pipeline without throwing + produces summary structure', async () => {
    const candidates = [
      mk(),
      mk({ persona: { ...mk().persona, age: 65, name: 'Maria 65' }, experience: 'beginner', equipment: ['bodyweight'], goal: { template: 'Longevitate', phase: 'MAINTAIN', mode: 'Estetica' } }),
      mk({ persona: { ...mk().persona, age: 65 }, goal: { template: 'Forta', phase: 'BULK', mode: 'Forta' } }), // PRUNE_A
      mk({ recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['pregnant'] }, goal: { template: 'Slabire', phase: 'CUT', mode: 'Estetica' } }), // TRIPWIRE
      mk({ experience: 'beginner', schedule: { frequency: 6, session_duration_target: 60 } }), // PRUNE_C
      mk({ experience: 'advanced', equipment: ['barbell', 'dumbbell'], schedule: { frequency: 5, session_duration_target: 90 }, goal: { template: 'Forta', phase: 'BULK', mode: 'Forta' } }),
      mk({ goal: { template: 'Forta', phase: 'CUT', mode: 'Forta' } }), // PRUNE_E
      mk({ recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['ed_history'] } }), // persona_critical_edge
      mk({ goal: { template: 'Slabire', phase: 'CUT', mode: 'Estetica' }, persona: { ...mk().persona, age: 35 } }),
      mk({ goal: { template: 'Tonifiere', phase: 'RECOMP', mode: 'Estetica' }, experience: 'intermediate' }),
    ];

    const result = await runFullSimulation(candidates);

    expect(result.summary.total_candidates).toBe(10);
    expect(result.summary.valid_branches + result.summary.pruned_count + result.summary.tripwire_count).toBe(10);
    expect(result.branches.length).toBe(result.summary.valid_branches);

    // Engine #2 STUB workaround flag should fire on every valid branch.
    for (const b of result.branches) {
      expect(b.flags).toContain('engine_2_spec_gap');
    }

    // Performance: smoke run is far below 50ms median budget.
    expect(result.performance.median_ms).toBeLessThan(50);
  });

  it('filterFlaggedOnly returns only branches needing Claude reasoning', async () => {
    const result = await runFullSimulation([mk(), mk({ recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['pregnant_post_q3'] } })]);
    const flagged = filterFlaggedOnly(result.branches);
    for (const b of flagged) {
      expect(b.claude_reasoning_required).toBe(true);
    }
  });
});
