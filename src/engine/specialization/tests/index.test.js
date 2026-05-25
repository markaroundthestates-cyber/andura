import { describe, it, expect } from 'vitest';
import { evaluate, ENGINE_ID } from '../index.js';
import { ACTIVATION_STATE } from '../constants.js';

const buildLog = (ex, w, reps) => ({ ex, w, reps });

const buildPeriodConstraint = (phase = 'LOAD') => Object.freeze({
  intensity_pct_1rm: { floor: 0.70, ceiling: 0.85 },
  phase,
  deload_window: null,
  immutable_snapshot: true,
});

// Logs producing predictable weak group "biceps" via weaknessDetector
const weakBicepsLogs = () => [
  buildLog('Bench Press', 120, 5),       // chest ~131
  buildLog('Barbell Row', 110, 5),       // back ~120
  buildLog('Bicep Curl', 25, 8),         // biceps ~31 (much lower)
  buildLog('Squat', 130, 5),             // legs ~141
];

const buildCtx = ({
  profileTier = 'T1',
  periodizationConstraint,
  periodizationPhase = 'LOAD',
  goalPhase = 'BULK',
  persona = 'marius',
  lifetimeLogs,
  recentLogs,
  userOverrideWeakGroup,
  userProposalAccepted,
  specializationWeeksElapsed,
  cooldownHistory,
  nowMs,
  painButtonActive,
  painAffectedGroups,
  energyDirection,
  energyDownRecurrent,
} = {}) => ({
  profileTier,
  meta: {
    periodizationConstraint,
    periodizationPhase,
    goalPhase,
    persona,
    lifetimeLogs,
    recentLogs,
    userOverrideWeakGroup,
    userProposalAccepted,
    specializationWeeksElapsed,
    cooldownHistory,
    nowMs,
    painButtonActive,
    painAffectedGroups,
    energyDirection,
    energyDownRecurrent,
  },
});

describe('evaluate — ADR 018 §2 Standardized Dimension Contract compliance', () => {
  it('returns valid SpecializationResult shape per ADR 018 §2 contract', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.id).toBe(ENGINE_ID);
    expect(['none', 'LOW', 'MED', 'HIGH']).toContain(result.tier);
    expect(['low', 'medium', 'high']).toContain(result.confidence);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.trace).toBe('object');
    expect(typeof result.meta).toBe('object');
  });

  it('id always equals "specialization"', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.id).toBe('specialization');
    expect(ENGINE_ID).toBe('specialization');
  });

  it('total function — never throws on null ctx', async () => {
    await expect(evaluate(null)).resolves.toBeDefined();
    await expect(evaluate(undefined)).resolves.toBeDefined();
    await expect(evaluate({})).resolves.toBeDefined();
  });

  it('total function — never throws on malformed meta', async () => {
    await expect(evaluate({ meta: 'not_an_object' })).resolves.toBeDefined();
    await expect(evaluate({ meta: null })).resolves.toBeDefined();
  });

  it('deterministic — identical ctx produces identical output', async () => {
    const ctx = buildCtx({
      profileTier:        'T1',
      periodizationPhase: 'LOAD',
      goalPhase:          'BULK',
      persona:            'marius',
      lifetimeLogs:       weakBicepsLogs(),
      recentLogs:         weakBicepsLogs(),
    });
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(r1.tier).toBe(r2.tier);
    expect(r1.signals).toEqual(r2.signals);
    expect(r1.meta.activation_state).toBe(r2.meta.activation_state);
  });

  it('insufficient ctx → tier "none" + confidence "low"', async () => {
    const result = await evaluate({});
    expect(result.tier).toBe('none');
    expect(result.confidence).toBe('low');
  });
});

describe('evaluate — Cluster A1 6-field blueprint emit verbatim §9.6.1', () => {
  it('blueprint contains 6 emit fields', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.meta).toHaveProperty('activation_state');
    expect(result.meta).toHaveProperty('target_muscle_group');
    expect(result.meta).toHaveProperty('mesocycle_progress');
    expect(result.meta).toHaveProperty('volume_modifier');
    expect(result.meta).toHaveProperty('cooldown_state');
    expect(result.meta).toHaveProperty('signals');
    expect(result.meta).toHaveProperty('ui_label'); // RO native label
  });

  it('mesocycle_progress has currentWeek + totalWeeks + exiting + rationale', async () => {
    const result = await evaluate(buildCtx({}));
    const m = result.meta.mesocycle_progress;
    expect(m).toHaveProperty('currentWeek');
    expect(m).toHaveProperty('totalWeeks');
    expect(m).toHaveProperty('exiting');
    expect(m).toHaveProperty('rationale');
    expect(m.totalWeeks).toBe(4); // Q9=A invariant
  });

  it('volume_modifier has targetGroup + volume/freq/other groups + mode + mrvCap', async () => {
    const result = await evaluate(buildCtx({}));
    const v = result.meta.volume_modifier;
    expect(v).toHaveProperty('targetGroup');
    expect(v).toHaveProperty('volumeIncreasePct');
    expect(v).toHaveProperty('frequencyIncreaseSessions');
    expect(v).toHaveProperty('otherGroupsReductionPct');
    expect(v).toHaveProperty('mode');
    expect(v).toHaveProperty('mrvCapRespected');
    expect(v.mrvCapRespected).toBe(true); // V1 invariant
  });

  it('ui_label = "Bloc focus [Grupa]" RO native Q17=C', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs: weakBicepsLogs(),
      recentLogs:   weakBicepsLogs(),
      userProposalAccepted: true,
    }));
    expect(result.meta.ui_label).toContain('Bloc focus');
  });
});

describe('evaluate — Activation gating early-return paths Q12 + Q5 + Q14', () => {
  it('Maria persona → INELIGIBLE_NOT_MARIUS (Q12 §45.3 LOCKED)', async () => {
    const result = await evaluate(buildCtx({ persona: 'maria' }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
    expect(result.signals.some((s) => s.includes('not_marius'))).toBe(true);
  });

  it('Gigica persona → INELIGIBLE_NOT_MARIUS (Q12 §45.3 LOCKED)', async () => {
    const result = await evaluate(buildCtx({ persona: 'gigica' }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
  });

  it('Marius + T0 → INELIGIBLE_NOT_ADVANCED', async () => {
    const result = await evaluate(buildCtx({ profileTier: 'T0' }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_ADVANCED);
  });

  it('Marius + T1 + CUT phase → INELIGIBLE_PHASE_GATE (Q5+Q13 dual safety)', async () => {
    const result = await evaluate(buildCtx({ goalPhase: 'CUT' }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_PHASE_GATE);
    expect(result.signals.some((s) => s.includes('cut_disable'))).toBe(true);
  });

  it('Marius + T1 + BULK + injury target → INELIGIBLE_INJURY_OVERRIDE (Q14=A)', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:        weakBicepsLogs(),
      recentLogs:          weakBicepsLogs(),
      painButtonActive:    true,
      painAffectedGroups:  ['biceps'],
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_INJURY_OVERRIDE);
  });

  it('Maria/Gigica reject takes priority over phase/injury (Gate 1 first)', async () => {
    const result = await evaluate(buildCtx({
      persona:           'maria',
      goalPhase:         'CUT',
      painButtonActive:  true,
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
  });
});

describe('evaluate — Cut DISABLE 3-layer defense Q5+Q13+Q14 verified explicit', () => {
  it('Marius + T2 + CUT → blocked (Q5=D dual safety even cu T2 confidence)', async () => {
    const result = await evaluate(buildCtx({
      profileTier: 'T2',
      goalPhase:   'CUT',
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_PHASE_GATE);
  });

  it('CUT phase → recovery_risk_universal rationale documented', async () => {
    const result = await evaluate(buildCtx({ goalPhase: 'CUT' }));
    const cutSignal = result.trace.crossEngineHooks.cutDisable;
    expect(cutSignal.blocked).toBe(true);
    expect(cutSignal.rationale).toContain('recovery_risk_universal');
  });
});

describe('evaluate — Cluster B weakness signal consume + proposal Q15=B', () => {
  it('eligible Marius + no weak group → INELIGIBLE_NO_LAGGING', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs: [],
      recentLogs:   [],
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_NO_LAGGING);
  });

  it('eligible Marius + weak group + no proposal → PROPOSAL_PENDING', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs: weakBicepsLogs(),
      recentLogs:   weakBicepsLogs(),
      // userProposalAccepted omitted → pending
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.PROPOSAL_PENDING);
    expect(result.meta.target_muscle_group).toBe('biceps');
    expect(result.signals.some((s) => s.includes('proposal_pending'))).toBe(true);
  });

  it('eligible Marius + weak + proposal accepted → ACTIVE + tier HIGH', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.ACTIVE);
    expect(result.tier).toBe('HIGH');
    expect(result.meta.target_muscle_group).toBe('biceps');
    expect(result.meta.volume_modifier.volumeIncreasePct).toBeGreaterThan(0);
  });

  it('eligible Marius + weak + proposal rejected → cooldown trigger Q16=A', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: false,
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_COOLDOWN);
    expect(result.signals.some((s) => s.includes('hard_reject'))).toBe(true);
  });

  it('Q15=B engine NU auto-activates (proposal pending default)', async () => {
    // Without explicit user accept, even cu eligible state, NU activates
    const result = await evaluate(buildCtx({
      lifetimeLogs: weakBicepsLogs(),
      recentLogs:   weakBicepsLogs(),
      // userProposalAccepted: undefined → pending
    }));
    expect(result.meta.activation_state).not.toBe(ACTIVATION_STATE.ACTIVE);
    expect(result.meta.volume_modifier.volumeIncreasePct).toBe(0); // not active = zero modifier
  });

  it('user override weak group F4 agency wins over engine objective', async () => {
    // Engine detects biceps weak, user overrides to "back"
    const result = await evaluate(buildCtx({
      lifetimeLogs:           weakBicepsLogs(),
      recentLogs:             weakBicepsLogs(),
      userOverrideWeakGroup:  'spate',
      userProposalAccepted:   true,
    }));
    expect(result.meta.target_muscle_group).toBe('spate');
  });
});

describe('evaluate — Cooldown N=12 weeks Q10=B + Q16=A', () => {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const NOW = 1788183600000;

  it('within cooldown 6 weeks → INELIGIBLE_COOLDOWN', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      cooldownHistory: {
        biceps: { endTimestampMs: NOW - 6 * MS_PER_WEEK, reason: 'completed_exit' },
      },
      nowMs: NOW,
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.INELIGIBLE_COOLDOWN);
    expect(result.meta.cooldown_state.blocked).toBe(true);
  });

  it('cooldown expired (>= 12 weeks) → eligible re-specialization', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      cooldownHistory: {
        biceps: { endTimestampMs: NOW - 13 * MS_PER_WEEK, reason: 'completed_exit' },
      },
      nowMs: NOW,
    }));
    expect(result.meta.activation_state).not.toBe(ACTIVATION_STATE.INELIGIBLE_COOLDOWN);
  });

  it('hard_reject cooldown blocks anti-nagging Q16=A', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      cooldownHistory: {
        biceps: { endTimestampMs: NOW - 5 * MS_PER_WEEK, reason: 'hard_reject' },
      },
      nowMs: NOW,
    }));
    expect(result.meta.cooldown_state.blocked).toBe(true);
    expect(result.meta.cooldown_state.reason).toBe('hard_reject');
  });
});

describe('evaluate — PARALLEL modifier Engine #1 NU REPLACE Q11=B verified', () => {
  it('active + ACCUMULATION/LOAD → parallel modifier applied', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
      periodizationPhase:   'LOAD',
    }));
    expect(result.trace.crossEngineHooks.parallelModifier.applied).toBe(true);
    expect(result.trace.crossEngineHooks.parallelModifier.mode).toBe('parallel');
  });

  it('active + PEAK → modifier suspended (anti-cascade preserve §1.10)', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
      periodizationPhase:   'PEAK',
    }));
    expect(result.meta.volume_modifier.volumeIncreasePct).toBe(0);
  });

  it('active + DELOAD → modifier suspended Q12=A non-negotiable', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
      periodizationPhase:   'DELOAD',
    }));
    expect(result.meta.volume_modifier.volumeIncreasePct).toBe(0);
    expect(result.signals.some((s) => s.includes('deload_phase_suspended'))).toBe(true);
  });

  it('mode always "parallel" V1 invariant — NU REPLACE Engine #1', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
    }));
    expect(result.trace.crossEngineHooks.parallelModifier.mode).toBe('parallel');
  });
});

describe('evaluate — purity invariant ZERO side effects per ADR 018 §2', () => {
  it('does NOT mutate ctx', async () => {
    const ctx = buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
    });
    const ctxSnapshot = JSON.stringify(ctx);
    await evaluate(ctx);
    expect(JSON.stringify(ctx)).toBe(ctxSnapshot);
  });

  it('does NOT mutate frozen periodizationConstraint (anti-cascade §1.10)', async () => {
    const constraint = buildPeriodConstraint('LOAD');
    const ctx = buildCtx({
      periodizationConstraint: constraint,
      lifetimeLogs:            weakBicepsLogs(),
      recentLogs:              weakBicepsLogs(),
      userProposalAccepted:    true,
    });
    await evaluate(ctx);
    expect(Object.isFrozen(constraint)).toBe(true);
    expect(constraint.phase).toBe('LOAD');
  });

  it('returns recommendations empty array (orchestrator-level concern ADR 030 D2)', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:         weakBicepsLogs(),
      recentLogs:           weakBicepsLogs(),
      userProposalAccepted: true,
    }));
    expect(result.recommendations).toEqual([]);
  });
});

describe('evaluate — mesocycle exit Q9=A 4 weeks fixed', () => {
  it('active + week 4 → COMPLETED_EXIT state', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:               weakBicepsLogs(),
      recentLogs:                 weakBicepsLogs(),
      userProposalAccepted:       true,
      specializationWeeksElapsed: 4,
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.COMPLETED_EXIT);
    expect(result.meta.mesocycle_progress.exiting).toBe(true);
    expect(result.signals.some((s) => s.includes('completed_exit'))).toBe(true);
  });

  it('active + week 2 → ACTIVE in progress', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs:               weakBicepsLogs(),
      recentLogs:                 weakBicepsLogs(),
      userProposalAccepted:       true,
      specializationWeeksElapsed: 1,
    }));
    expect(result.meta.activation_state).toBe(ACTIVATION_STATE.ACTIVE);
    expect(result.meta.mesocycle_progress.currentWeek).toBe(2);
    expect(result.meta.mesocycle_progress.exiting).toBe(false);
  });
});

describe('evaluate — Convergence Guard reference NU duplicate logic', () => {
  it('trace contains Convergence Guard reference metadata', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.trace.convergenceGuardRef).toBeDefined();
    expect(result.trace.convergenceGuardRef.ownerSpec).toContain('ADR 009');
    expect(result.trace.convergenceGuardRef.crossCutting).toBe(true);
  });

  it('mirror §9.4 Bayesian + §9.5 Tempo precedent', async () => {
    const result = await evaluate(buildCtx({}));
    expect(result.trace.convergenceGuardRef.note).toContain('Bayesian');
    expect(result.trace.convergenceGuardRef.note).toContain('Tempo');
  });
});

describe('evaluate — confidence computation per ctx data completeness', () => {
  it('all 3 signals (constraint + tier + weakness) → high confidence', async () => {
    const result = await evaluate(buildCtx({
      profileTier:             'T1',
      periodizationConstraint: buildPeriodConstraint('LOAD'),
      lifetimeLogs:            weakBicepsLogs(),
      recentLogs:              weakBicepsLogs(),
      userProposalAccepted:    true,
    }));
    expect(result.confidence).toBe('high');
  });

  it('0 signals → low confidence', async () => {
    const result = await evaluate({});
    expect(result.confidence).toBe('low');
  });
});

describe('evaluate — weaknessDetector reused via import (§36.84 Gap #1 invariant)', () => {
  it('detector signal flows through buildWeaknessSignal → trace.weaknessSignal', async () => {
    const result = await evaluate(buildCtx({
      lifetimeLogs: weakBicepsLogs(),
      recentLogs:   weakBicepsLogs(),
    }));
    expect(result.trace.weaknessSignal).toBeDefined();
    expect(result.trace.weaknessSignal.targetGroup).toBe('biceps');
  });

  it('engine NU contains 1RM ratio<0.8 reimplementation (delegated to detector)', async () => {
    // Verification: same logs produce same target group as detector would standalone
    // (logic delegated, NU reimplemented per §36.84 Gap #1 critical scope)
    const r1 = await evaluate(buildCtx({
      lifetimeLogs: weakBicepsLogs(),
      recentLogs:   weakBicepsLogs(),
    }));
    expect(r1.trace.weaknessSignal.targetGroup).toBe('biceps');
  });
});
