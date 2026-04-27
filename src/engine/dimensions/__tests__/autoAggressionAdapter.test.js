import { describe, it, expect } from 'vitest';
import { aaClusterOutputToLegacyShape } from '../autoAggressionAdapter.js';

const baseSession = () => ({
  type: 'PUSH',
  exercises: [
    { name: 'Incline DB Press', sets: 4 },
    { name: 'DB Shoulder Press', sets: 3 },
    { name: 'Lateral Raises', sets: 3 },
  ],
});

const clusterSessionWithAA = (payload) => ({
  ...baseSession(),
  warnings: [{ source: 'AUTO_AGGRESSION', ...payload }],
});

describe('aaClusterOutputToLegacyShape — no AA recommendation', () => {
  it('returns originalBaseSession unchanged when no AA warning', () => {
    const orig = baseSession();
    const cluster = { ...orig, warnings: [] };
    const out = aaClusterOutputToLegacyShape(cluster, orig);
    expect(out).toBe(orig); // same reference (matches legacy `return session`)
  });

  it('returns originalBaseSession when warnings field missing entirely', () => {
    const orig = baseSession();
    const out = aaClusterOutputToLegacyShape({ ...orig }, orig);
    expect(out).toBe(orig);
  });

  it('ignores non-AA warnings (filters by source)', () => {
    const orig = baseSession();
    const cluster = { ...orig, warnings: [{ source: 'OTHER_DIM', message: 'noise' }] };
    const out = aaClusterOutputToLegacyShape(cluster, orig);
    expect(out).toBe(orig);
  });
});

describe('aaClusterOutputToLegacyShape — MED tier', () => {
  it('sets session.aaWarning with level/signals/escalating', () => {
    const orig = baseSession();
    const cluster = clusterSessionWithAA({
      aaTier: 'MED',
      level: 'soft',
      signals: ['volume_creep', 'frustration'],
      escalating: false,
    });
    const out = aaClusterOutputToLegacyShape(cluster, orig);
    expect(out.aaWarning).toEqual({
      level: 'soft',
      signals: ['volume_creep', 'frustration'],
      escalating: false,
    });
    expect(out.aaBlocked).toBeUndefined();
    expect(out.exercises).toEqual(orig.exercises); // exercises unchanged for MED
  });

  it('does not mutate originalBaseSession', () => {
    const orig = baseSession();
    const snapshot = JSON.stringify(orig);
    aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'MED', level: 'soft', signals: ['x'], escalating: true,
    }), orig);
    expect(JSON.stringify(orig)).toBe(snapshot);
  });

  it('preserves escalating=true through the adapter', () => {
    const out = aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'MED', level: 'soft', signals: ['volume_creep'], escalating: true,
    }), baseSession());
    expect(out.aaWarning.escalating).toBe(true);
  });
});

describe('aaClusterOutputToLegacyShape — HIGH tier', () => {
  it('sets session.aaBlocked with requiresFrictionConfirmation:true', () => {
    const out = aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'HIGH',
      level: 'hard',
      signals: ['volume_creep', 'calorie_acceleration', 'frustration', 'ignore_recovery'],
      escalating: true,
      requiresFrictionConfirmation: true,
    }), baseSession());
    expect(out.aaBlocked).toEqual({
      level: 'hard',
      signals: ['volume_creep', 'calorie_acceleration', 'frustration', 'ignore_recovery'],
      escalating: true,
      requiresFrictionConfirmation: true,
    });
    expect(out.aaWarning).toBeUndefined();
  });

  it('reduces sets per exercise to floor(sets * 0.7), min 2, with aaOriginalSets', () => {
    const out = aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'HIGH', level: 'hard', signals: ['x'], escalating: false, requiresFrictionConfirmation: true,
    }), baseSession());
    // 4 → floor(4*0.7) = 2 (min 2 = 2)
    // 3 → floor(3*0.7) = 2 (min 2 = 2)
    expect(out.exercises).toEqual([
      { name: 'Incline DB Press',  sets: 2, aaOriginalSets: 4, aaReduced: true },
      { name: 'DB Shoulder Press', sets: 2, aaOriginalSets: 3, aaReduced: true },
      { name: 'Lateral Raises',    sets: 2, aaOriginalSets: 3, aaReduced: true },
    ]);
  });

  it('clamps sets to minimum 2 even when 0.7 rounds below 2', () => {
    const orig = { ...baseSession(), exercises: [{ name: 'X', sets: 2 }] };
    const out = aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'HIGH', level: 'hard', signals: ['x'], escalating: false, requiresFrictionConfirmation: true,
    }), orig);
    // floor(2 * 0.7) = 1, but Math.max(2, 1) = 2
    expect(out.exercises[0].sets).toBe(2);
    expect(out.exercises[0].aaOriginalSets).toBe(2);
  });

  it('handles missing exercises array defensively', () => {
    const orig = { type: 'PUSH' };
    const out = aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'HIGH', level: 'hard', signals: ['x'], escalating: false, requiresFrictionConfirmation: true,
    }), orig);
    expect(out.exercises).toEqual([]);
    expect(out.aaBlocked).toBeDefined();
  });

  it('returns a new session reference (does not mutate originalBaseSession exercises)', () => {
    const orig = baseSession();
    const exercisesRef = orig.exercises;
    aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'HIGH', level: 'hard', signals: ['x'], escalating: false, requiresFrictionConfirmation: true,
    }), orig);
    // Original exercises array unchanged (sets still the original 4/3/3)
    expect(orig.exercises).toBe(exercisesRef);
    expect(orig.exercises[0].sets).toBe(4);
    expect(orig.exercises[0].aaReduced).toBeUndefined();
  });
});

describe('aaClusterOutputToLegacyShape — defensive', () => {
  it('unknown aaTier in payload leaves session unchanged', () => {
    const orig = baseSession();
    const out = aaClusterOutputToLegacyShape(clusterSessionWithAA({
      aaTier: 'WAT', level: 'soft', signals: [], escalating: false,
    }), orig);
    expect(out).toBe(orig);
  });

  it('returns base session if clusterSession is null', () => {
    const orig = baseSession();
    const out = aaClusterOutputToLegacyShape(null, orig);
    expect(out).toBe(orig);
  });
});
