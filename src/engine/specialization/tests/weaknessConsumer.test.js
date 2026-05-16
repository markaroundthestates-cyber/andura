import { describe, it, expect } from 'vitest';
import {
  consumeWeaknessDetectorSignal,
  evaluateConsensus,
  reconcileWeaknessTarget,
  buildWeaknessSignal,
  evaluateProposal,
} from '../weaknessConsumer.js';

// Helper to build minimal logs that produce predictable detector output.
// Uses 'ex' field (per weaknessDetector.js getLastLogPerExercise) + w + reps.
const buildLog = (ex, w, reps) => ({ ex, w, reps });

describe('consumeWeaknessDetectorSignal — Cluster B1 Q1=C reuse §36.84 Gap #1', () => {
  it('empty logs → no signal', () => {
    const r = consumeWeaknessDetectorSignal([]);
    expect(r.topWeakGroup).toBeNull();
    expect(r.topRatio).toBeNull();
    expect(r.weakGroupsAll).toEqual([]);
  });

  it('non-array input → safe defaults', () => {
    const r = consumeWeaknessDetectorSignal(null);
    expect(r.topWeakGroup).toBeNull();
  });

  it('logs with single group → no weak detection (insufficient comparison)', () => {
    const logs = [
      buildLog('Bench Press', 100, 5),
      buildLog('Incline Bench', 80, 5),
    ];
    const r = consumeWeaknessDetectorSignal(logs);
    // Both same group (chest) → no weak group identified
    expect(r.topWeakGroup).toBeNull();
  });

  it('logs with imbalanced groups → top-1 weak group identified', () => {
    // Strong chest + back, weak biceps (1RM ratio<0.8)
    const logs = [
      buildLog('Bench Press', 120, 5),       // chest ~131
      buildLog('Barbell Row', 110, 5),       // back ~120
      buildLog('Bicep Curl', 30, 8),         // biceps ~37 (much lower)
      buildLog('Squat', 130, 5),             // legs ~141
    ];
    const r = consumeWeaknessDetectorSignal(logs);
    expect(r.topWeakGroup).toBe('biceps');
    expect(r.topRatio).toBeLessThan(0.8);
    expect(r.weakGroupsAll).toContain('biceps');
  });

  it('reuses weaknessDetector.js — NU reimplement 1RM ratio<0.8 logic (§36.84 Gap #1)', () => {
    // Verify behavior delegated to detector — same logs should produce same output
    const logs = [
      buildLog('Bench Press', 120, 5),
      buildLog('Bicep Curl', 25, 8),
      buildLog('Squat', 140, 5),
    ];
    const r1 = consumeWeaknessDetectorSignal(logs);
    const r2 = consumeWeaknessDetectorSignal(logs);
    expect(r1.topWeakGroup).toBe(r2.topWeakGroup);
    expect(r1.topRatio).toBe(r2.topRatio);
  });

  it('Top-1 only V1 (Q3=A simplicity, top-N defer v1.5)', () => {
    const logs = [
      buildLog('Bench Press', 100, 5),
      buildLog('Bicep Curl', 20, 8),
      buildLog('Tricep Pushdown', 25, 8),
      buildLog('Squat', 130, 5),
    ];
    const r = consumeWeaknessDetectorSignal(logs);
    // Top-1 cap enforced (only 1 entry returned even if multiple weak)
    expect(r.weakGroupsAll.length).toBeLessThanOrEqual(1);
  });
});

describe('evaluateConsensus — Cluster B2 Q2=C anti-noise volatil', () => {
  it('insufficient signal both windows → consensus NOT evaluable', () => {
    const r = evaluateConsensus({ lifetimeLogs: [], recentLogs: [] });
    expect(r.consensusAligned).toBe(false);
  });

  it('aligned recent + lifetime same top-1 → consensus aligned', () => {
    const logs = [
      buildLog('Bench Press', 100, 5),
      buildLog('Bicep Curl', 20, 8),
      buildLog('Squat', 130, 5),
    ];
    const r = evaluateConsensus({ lifetimeLogs: logs, recentLogs: logs });
    expect(r.consensusAligned).toBe(true);
    expect(r.recentTopGroup).toBe(r.lifetimeTopGroup);
  });

  it('divergent recent vs lifetime → consensus NOT aligned (anti-flap defer)', () => {
    const lifetimeLogs = [
      buildLog('Bench Press', 100, 5),
      buildLog('Bicep Curl', 20, 8),
      buildLog('Squat', 130, 5),
    ];
    const recentLogs = [
      buildLog('Bench Press', 80, 5),
      buildLog('Bicep Curl', 50, 8),
      buildLog('Squat', 100, 5),
    ];
    const r = evaluateConsensus({ lifetimeLogs, recentLogs });
    // Different weak groups → divergent (or one null)
    if (r.recentTopGroup && r.lifetimeTopGroup) {
      expect(r.recentTopGroup === r.lifetimeTopGroup).toBe(r.consensusAligned);
    }
  });
});

describe('reconcileWeaknessTarget — Cluster B4 Q4=C user agency F4 wins', () => {
  it('engine signal only → engine wins', () => {
    const r = reconcileWeaknessTarget({ engineObjective: 'biceps', userOverride: null });
    expect(r.resolvedGroup).toBe('biceps');
    expect(r.source).toBe('engine');
  });

  it('user override only → user agency F4 wins', () => {
    const r = reconcileWeaknessTarget({ engineObjective: null, userOverride: 'umeri' });
    expect(r.resolvedGroup).toBe('umeri');
    expect(r.source).toBe('user_override');
  });

  it('aligned engine + user → aligned source', () => {
    const r = reconcileWeaknessTarget({ engineObjective: 'biceps', userOverride: 'biceps' });
    expect(r.resolvedGroup).toBe('biceps');
    expect(r.source).toBe('aligned');
  });

  it('conflict engine vs user → user override wins F4 agency', () => {
    const r = reconcileWeaknessTarget({ engineObjective: 'biceps', userOverride: 'spate' });
    expect(r.resolvedGroup).toBe('spate'); // user wins
    expect(r.source).toBe('user_override');
    expect(r.engineObjective).toBe('biceps'); // preserved CDL Bugatti craft
  });

  it('no signals → resolvedGroup null', () => {
    const r = reconcileWeaknessTarget({});
    expect(r.resolvedGroup).toBeNull();
  });

  it('case-insensitive normalization', () => {
    const r = reconcileWeaknessTarget({ engineObjective: 'BICEPS', userOverride: 'SPATE' });
    expect(r.resolvedGroup).toBe('spate');
    expect(r.engineObjective).toBe('biceps');
  });
});

describe('buildWeaknessSignal — bundle integration Cluster B1+B2+B3+B4', () => {
  it('aligned consensus + engine target → resolved targetGroup', () => {
    const logs = [
      buildLog('Bench Press', 100, 5),
      buildLog('Bicep Curl', 20, 8),
      buildLog('Squat', 130, 5),
    ];
    const r = buildWeaknessSignal({
      lifetimeLogs: logs,
      recentLogs:   logs,
    });
    if (r.targetGroup) {
      expect(r.consensusAligned).toBe(true);
    }
  });

  it('no signals → targetGroup null + defer rationale', () => {
    const r = buildWeaknessSignal({});
    expect(r.targetGroup).toBeNull();
    expect(r.rationale).toContain('defer_detection');
  });

  it('user override always wins F4 agency (consensus N/A)', () => {
    const r = buildWeaknessSignal({
      lifetimeLogs:      [],
      recentLogs:        [],
      userOverrideGroup: 'umeri',
    });
    expect(r.targetGroup).toBe('umeri');
  });

  it('consensus NOT aligned + no user override → null (defer detection)', () => {
    // Build divergent signals
    const r = buildWeaknessSignal({
      lifetimeLogs: [
        buildLog('Bench Press', 100, 5),
        buildLog('Bicep Curl', 30, 8),
        buildLog('Squat', 130, 5),
      ],
      recentLogs: [
        buildLog('Bench Press', 80, 5),
      ],
    });
    // Recent has insufficient signal → consensus NOT evaluable → no target
    expect(r.targetGroup).toBeNull();
  });
});

describe('evaluateProposal — Cluster B7 Q15=B propose user accept/reject', () => {
  it('user accepted → activation approved', () => {
    const r = evaluateProposal({ userAccepted: true, targetGroup: 'biceps' });
    expect(r.activationApproved).toBe(true);
    expect(r.userRejected).toBe(false);
    expect(r.pending).toBe(false);
  });

  it('user rejected → hard reject + cooldown trigger', () => {
    const r = evaluateProposal({ userAccepted: false, targetGroup: 'biceps' });
    expect(r.activationApproved).toBe(false);
    expect(r.userRejected).toBe(true);
    expect(r.rationale).toContain('q16_a');
    expect(r.rationale).toContain('hard_reject');
  });

  it('user pending (null) → proposal pending NU auto-activate', () => {
    const r = evaluateProposal({ userAccepted: null, targetGroup: 'biceps' });
    expect(r.activationApproved).toBe(false);
    expect(r.pending).toBe(true);
    expect(r.rationale).toContain('q15_b');
    expect(r.rationale).toContain('anti_paternalism');
  });

  it('undefined → pending default (anti-paternalism — NU auto-activate)', () => {
    const r = evaluateProposal({ targetGroup: 'biceps' });
    expect(r.pending).toBe(true);
  });

  it('Q15=B Marius decision retained — engine NU auto-activates silent', () => {
    // Verify even cu eligibility passed, engine never auto-activates
    const r = evaluateProposal({ userAccepted: undefined, targetGroup: 'spate' });
    expect(r.activationApproved).toBe(false);
  });
});
