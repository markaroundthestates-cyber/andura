import { describe, it, expect } from 'vitest';
import { pruneBranch, pruneInvalidCombos, PRUNE_VERDICTS } from '../pruning.js';

/** @typedef {import('../types.js').ConstraintObject} ConstraintObject */

/**
 * @param {Partial<ConstraintObject> & {
 *   ageOverride?: number, goal?: any, equipment?: string[], experience?: any,
 *   frequency?: number, tier?: any, vitality?: any, injuries?: string[]
 * }} [opts]
 * @returns {ConstraintObject}
 */
function mkBranch(opts = {}) {
  const age = opts.ageOverride ?? 30;
  return /** @type {ConstraintObject} */ ({
    persona: { name: 'Test', age, sex: 'F', kg: 70, height: 170, bmi: 24, job: 'office', lifestyle: 'sedentary' },
    goal: opts.goal ?? { template: 'Tonifiere', phase: 'MAINTAIN', mode: 'Estetica' },
    experience: opts.experience ?? 'intermediate',
    equipment: opts.equipment ?? ['dumbbell'],
    schedule: { frequency: opts.frequency ?? 3, session_duration_target: 60 },
    history: { tier: opts.tier ?? 'T2', cdl_window: [] },
    recovery: { vitality_tier: opts.vitality ?? 'MED', pre_session_readiness: 'GREEN', injury_flags: opts.injuries ?? [] },
    profile_typing: { primary: 'mixed', secondary: 'mixed', confidence: 0.5 },
    demographic_prior: { anchor_personas: [] },
  });
}

describe('Pruning A — persona × goal biological', () => {
  it('Maria 65 + Forta → PRUNE_A', () => {
    const r = pruneBranch(mkBranch({ ageOverride: 65, goal: { template: 'Forta', phase: 'BULK', mode: 'Forta' } }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_A);
    expect(r.rule).toBe('A');
  });
  it('80yo + Slabire CUT → PRUNE_A', () => {
    const r = pruneBranch(mkBranch({ ageOverride: 80, goal: { template: 'Slabire', phase: 'CUT', mode: 'Estetica' } }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_A);
  });
  it('Pregnant + CUT → TRIPWIRE Passive Mode', () => {
    const r = pruneBranch(mkBranch({ injuries: ['pregnant'], goal: { template: 'Slabire', phase: 'CUT', mode: 'Estetica' } }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.TRIPWIRE);
  });
});

describe('Pruning B — equipment × goal redundancy', () => {
  it('bodyweight only + Forta → PRUNE_B', () => {
    const r = pruneBranch(mkBranch({ equipment: ['bodyweight'], goal: { template: 'Forta', phase: 'BULK', mode: 'Forta' } }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_B);
  });
  it('full gym + Slabire + beginner → PRUNE_B (redundant cu Tonifiere)', () => {
    const r = pruneBranch(mkBranch({
      equipment: ['barbell', 'dumbbell', 'machines'],
      experience: 'beginner',
      goal: { template: 'Slabire', phase: 'CUT', mode: 'Estetica' },
    }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_B);
  });
});

describe('Pruning C — experience × frequency biological', () => {
  it('beginner + 6x → PRUNE_C', () => {
    const r = pruneBranch(mkBranch({ experience: 'beginner', frequency: 6 }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_C);
  });
  it('advanced + 2x → PRUNE_C (sub-optimal MEV)', () => {
    const r = pruneBranch(mkBranch({ experience: 'advanced', frequency: 2 }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_C);
  });
});

describe('Pruning D — history × recovery contradiction', () => {
  it('T0 + severe injury → TRIPWIRE medical referral', () => {
    const r = pruneBranch(mkBranch({ tier: 'T0', injuries: ['severe_back_injury'] }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.TRIPWIRE);
  });
});

describe('Pruning E — goal × phase invalid', () => {
  it('Forta + CUT → PRUNE_E', () => {
    const r = pruneBranch(mkBranch({ goal: { template: 'Forta', phase: 'CUT', mode: 'Forta' } }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_E);
  });
  it('Longevitate + BULK → PRUNE_E (Gigel test fail)', () => {
    const r = pruneBranch(mkBranch({ goal: { template: 'Longevitate', phase: 'BULK', mode: 'Estetica' } }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.PRUNE_E);
  });
});

describe('VALID branches (sanity)', () => {
  it('Maria-equivalent + Longevitate + MAINTAIN + bodyweight 3x → VALID', () => {
    const r = pruneBranch(mkBranch({
      ageOverride: 60, goal: { template: 'Longevitate', phase: 'MAINTAIN', mode: 'Estetica' },
      experience: 'beginner', frequency: 3, equipment: ['bodyweight'],
    }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.VALID);
  });
  it('Marius advanced + Forta + BULK + barbell 5x → VALID', () => {
    const r = pruneBranch(mkBranch({
      ageOverride: 25, goal: { template: 'Forta', phase: 'BULK', mode: 'Forta' },
      experience: 'advanced', frequency: 5, equipment: ['barbell', 'dumbbell'],
    }));
    expect(r.verdict).toBe(PRUNE_VERDICTS.VALID);
  });
});

describe('pruneInvalidCombos batch', () => {
  it('partitions input into valid + pruned + tripwires', () => {
    const candidates = [
      mkBranch({ ageOverride: 25, goal: { template: 'Tonifiere', phase: 'MAINTAIN', mode: 'Estetica' } }),
      mkBranch({ ageOverride: 65, goal: { template: 'Forta', phase: 'BULK', mode: 'Forta' } }), // PRUNE_A
      mkBranch({ injuries: ['pregnant'], goal: { template: 'Slabire', phase: 'CUT', mode: 'Estetica' } }), // TRIPWIRE
    ];
    const r = pruneInvalidCombos(candidates);
    expect(r.valid.length).toBe(1);
    expect(r.pruned.length).toBe(1);
    expect(r.tripwires.length).toBe(1);
  });
});
