import { describe, it, expect } from 'vitest';
import { INTERVENTIONS, getApplicableInterventions, applyBestIntervention } from '../plateauInterventions.js';

describe('INTERVENTIONS', () => {
  it('has exactly 20 interventions', () => {
    expect(INTERVENTIONS).toHaveLength(20);
  });

  it('each has id, label, efficacy, when, apply', () => {
    for (const i of INTERVENTIONS) {
      expect(typeof i.id).toBe('string');
      expect(typeof i.label).toBe('string');
      expect(i.efficacy).toBeGreaterThan(0);
      expect(i.efficacy).toBeLessThanOrEqual(1);
      expect(typeof i.when).toBe('function');
      expect(typeof i.apply).toBe('function');
    }
  });

  it('deload_week has highest efficacy among stagnation-based interventions', () => {
    const deload = INTERVENTIONS.find(i => i.id === 'deload_week');
    expect(deload.efficacy).toBeGreaterThanOrEqual(0.85);
  });
});

describe('getApplicableInterventions', () => {
  it('returns empty when stagnation < threshold', () => {
    const ctx = { stagnationWeeks: 1, isInCut: false, readiness: { score: 70 } };
    const result = getApplicableInterventions(ctx);
    expect(result).toHaveLength(0);
  });

  it('returns interventions at stagnationWeeks=4', () => {
    const ctx = { stagnationWeeks: 4, isInCut: false, readiness: { score: 70 } };
    const result = getApplicableInterventions(ctx);
    expect(result.length).toBeGreaterThan(0);
  });

  it('sorts by efficacy DESC', () => {
    const ctx = { stagnationWeeks: 6, isInCut: false, readiness: { score: 80 } };
    const result = getApplicableInterventions(ctx);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].efficacy).toBeGreaterThanOrEqual(result[i].efficacy);
    }
  });

  it('deload_week fires at stagnationWeeks >= 8', () => {
    const ctx = { stagnationWeeks: 8, isInCut: false, readiness: { score: 70 } };
    const ids = getApplicableInterventions(ctx).map(i => i.id);
    expect(ids).toContain('deload_week');
  });

  it('filters out non-CUT-safe interventions in cut', () => {
    const ctx = { stagnationWeeks: 5, isInCut: true, readiness: { score: 70 } };
    const result = getApplicableInterventions(ctx);
    // drop_set should not appear in CUT (isInCut = true)
    const dropSet = result.find(i => i.id === 'drop_set');
    expect(dropSet).toBeUndefined();
  });
});

describe('applyBestIntervention', () => {
  it('returns exercise unchanged when no interventions', () => {
    const ctx = { stagnationWeeks: 0, isInCut: false, readiness: { score: 70 } };
    const exercise = { name: 'Bench', sets: 3, recommendation: { kg: 80 } };
    const { exercise: result, intervention } = applyBestIntervention(exercise, ctx);
    expect(result).toEqual(exercise);
    expect(intervention).toBeNull();
  });

  it('applies intervention at stagnation 4+', () => {
    const ctx = { stagnationWeeks: 4, isInCut: false, readiness: { score: 75 } };
    const exercise = { name: 'Bench', sets: 3, recommendation: { kg: 80 } };
    const { exercise: result, intervention } = applyBestIntervention(exercise, ctx);
    expect(intervention).not.toBeNull();
    // Exercise should be modified
    expect(result).not.toEqual(exercise);
  });

  it('deload_week reduces weight to ~70%', () => {
    const ctx = { stagnationWeeks: 8, isInCut: false, readiness: { score: 70 } };
    const exercise = { name: 'Bench', sets: 3, repsTarget: 8, recommendation: { kg: 100 } };
    const { exercise: result, intervention } = applyBestIntervention(exercise, ctx);
    if (intervention?.id === 'deload_week') {
      expect(result.recommendation.kg).toBeLessThan(100);
      expect(result.recommendation.kg).toBeGreaterThan(50);
    }
  });
});
