// ══ STRANGLER AA — Golden-Master Parity Tests (ADR 018 §6 Phase 1) ═══════════
// Runs the legacy `applyAAAdjustments` and the cluster+adapter route on the
// same input and asserts the resulting session is deep-equal.
//
// Acceptance: 100% byte-identical session shape across all 12 scenarios. Once
// these tests pass and the soak window completes, the strangler flag can be
// ramped without behavior change vs the legacy path.

import { describe, it, expect } from 'vitest';
import { CoachDirector } from '../coachDirector.js';
import { DecisionCluster } from '../decisionCluster.js';
import { analyze as aaAnalyze, DIMENSION_ID as AA_DIMENSION_ID } from '../dimensions/autoAggressionDimension.js';
import { aaClusterOutputToLegacyShape } from '../dimensions/autoAggressionAdapter.js';

const baseSession = () => ({
  type: 'PUSH',
  exercises: [
    { name: 'Incline DB Press',  sets: 4 },
    { name: 'DB Shoulder Press', sets: 3 },
    { name: 'Lateral Raises',    sets: 3 },
  ],
});

/** Legacy route — direct call to applyAAAdjustments. */
function legacyRoute(ctx) {
  const director = new CoachDirector();
  return director.applyAAAdjustments(baseSession(), ctx);
}

/** Cluster + adapter route — single AA dimension, no other dimensions. */
async function clusterRoute(ctx) {
  const orig = baseSession();
  const result = aaAnalyze({ ctx });
  const cluster = new DecisionCluster();
  const { session: clusterSession } = await cluster.execute(
    [result],
    orig,
    { entries: [{ id: AA_DIMENSION_ID, stage: 'ENHANCEMENT' }] }
  );
  return aaClusterOutputToLegacyShape(clusterSession, orig);
}

async function assertParity(ctx) {
  const legacy  = legacyRoute(ctx);
  const cluster = await clusterRoute(ctx);
  expect(cluster).toEqual(legacy);
  return { legacy, cluster };
}

describe('Strangler AA — golden-master parity (legacy === cluster+adapter)', () => {
  it('1. tier none — autoAggression missing entirely', async () => {
    await assertParity({});
  });

  it('2. tier none — autoAggression.tier === "none"', async () => {
    await assertParity({
      autoAggression: { tier: 'none', signals: [], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
  });

  it('3. tier LOW — signals empty (no mutation expected)', async () => {
    await assertParity({
      autoAggression: { tier: 'LOW', signals: [], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
  });

  it('4. tier LOW — signals=["volume_creep"] (no mutation expected)', async () => {
    await assertParity({
      autoAggression: { tier: 'LOW', signals: ['volume_creep'], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
  });

  it('5. tier MED — escalating=false, single signal', async () => {
    const { legacy } = await assertParity({
      autoAggression: { tier: 'MED', signals: ['volume_creep'], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
    expect(legacy.aaWarning).toEqual({
      level: 'soft', signals: ['volume_creep'], escalating: false,
    });
  });

  it('6. tier MED — escalating=true, 3 signals', async () => {
    const { legacy } = await assertParity({
      autoAggression: {
        tier: 'MED',
        signals: ['volume_creep', 'frustration', 'ignore_recovery'],
        escalating: true, amplified: false, amplifierReason: null, riskFlags: [],
      }
    });
    expect(legacy.aaWarning.escalating).toBe(true);
    expect(legacy.aaBlocked).toBeUndefined();
  });

  it('7. tier MED — signals empty (defensive edge)', async () => {
    await assertParity({
      autoAggression: { tier: 'MED', signals: [], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
  });

  it('8. tier HIGH — escalating=false, single signal', async () => {
    const { legacy } = await assertParity({
      autoAggression: { tier: 'HIGH', signals: ['volume_creep'], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
    expect(legacy.aaBlocked).toEqual({
      level: 'hard', signals: ['volume_creep'], escalating: false, requiresFrictionConfirmation: true,
    });
    // HIGH tier mutates exercises: sets reduced to floor(s*0.7) min 2
    expect(legacy.exercises[0]).toMatchObject({ name: 'Incline DB Press',  sets: 2, aaOriginalSets: 4, aaReduced: true });
    expect(legacy.exercises[1]).toMatchObject({ name: 'DB Shoulder Press', sets: 2, aaOriginalSets: 3, aaReduced: true });
    expect(legacy.exercises[2]).toMatchObject({ name: 'Lateral Raises',    sets: 2, aaOriginalSets: 3, aaReduced: true });
  });

  it('9. tier HIGH — escalating=true, 4 signals', async () => {
    const { legacy } = await assertParity({
      autoAggression: {
        tier: 'HIGH',
        signals: ['volume_creep', 'calorie_acceleration', 'frustration', 'ignore_recovery'],
        escalating: true, amplified: true, amplifierReason: 'hyperfocus_pattern_8h_4days_per_week', riskFlags: [],
      }
    });
    expect(legacy.aaBlocked.escalating).toBe(true);
    expect(legacy.aaBlocked.signals).toHaveLength(4);
  });

  it('10. tier HIGH — signals undefined (defensive edge)', async () => {
    await assertParity({
      autoAggression: { tier: 'HIGH', escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
  });

  it('11. state transition — MED first run, HIGH second run', async () => {
    // Each call uses a fresh baseSession so state from MED doesn't leak into HIGH.
    await assertParity({
      autoAggression: { tier: 'MED', signals: ['volume_creep'], escalating: false, amplified: false, amplifierReason: null, riskFlags: [] }
    });
    await assertParity({
      autoAggression: {
        tier: 'HIGH',
        signals: ['volume_creep', 'calorie_acceleration', 'frustration', 'ignore_recovery'],
        escalating: true, amplified: false, amplifierReason: null, riskFlags: [],
      }
    });
  });

  it('12. ctx.autoAggression === null (full defensive)', async () => {
    await assertParity({ autoAggression: null });
  });
});
