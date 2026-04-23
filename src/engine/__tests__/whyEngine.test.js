import { describe, it, expect } from 'vitest';
import { explainRecommendation, whySummary } from '../whyEngine.js';

const makeCtx = (overrides = {}) => ({
  readiness: { score: 75 },
  isInCut: false,
  user: { phase: 'AUTO' },
  patterns: [],
  ...overrides,
});

describe('explainRecommendation', () => {
  it('returns summary and reasons', () => {
    const exercise = { name: 'Bench Press', recommendation: { kg: 80, status: 'CONSOLIDATE' } };
    const result = explainRecommendation(exercise, makeCtx());
    expect(result.summary).toBeTruthy();
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  it('includes performance reason for CONSOLIDATE', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80, status: 'CONSOLIDATE' } };
    const result = explainRecommendation(ex, makeCtx());
    const perf = result.reasons.find(r => r.category === 'performance');
    expect(perf).toBeDefined();
    expect(perf.text).toContain('80');
  });

  it('includes performance reason for INCREASE', () => {
    const ex = { name: 'Cable Row', recommendation: { kg: 65, status: 'INCREASE' } };
    const result = explainRecommendation(ex, makeCtx());
    const perf = result.reasons.find(r => r.category === 'performance');
    expect(perf.text).toContain('progres');
  });

  it('includes phase reason for CUT', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80 } };
    const result = explainRecommendation(ex, makeCtx({ isInCut: true }));
    const phase = result.reasons.find(r => r.category === 'phase');
    expect(phase).toBeDefined();
    expect(phase.text).toContain('CUT');
  });

  it('includes readiness reason with correct score', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80 } };
    const result = explainRecommendation(ex, makeCtx({ readiness: { score: 92 } }));
    const readinessReason = result.reasons.find(r => r.category === 'readiness');
    expect(readinessReason).toBeDefined();
    expect(readinessReason.text).toContain('92');
  });

  it('includes equipment reason for alternatives', () => {
    const ex = { name: 'DB Row', recommendation: { kg: 40 }, isAlternative: true, original: 'Cable Row' };
    const result = explainRecommendation(ex, makeCtx());
    const equip = result.reasons.find(r => r.category === 'equipment');
    expect(equip).toBeDefined();
    expect(equip.text).toContain('Cable Row');
  });

  it('includes pattern reason when patterns present', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80 } };
    const ctx = makeCtx({ patterns: [{ type: 'early_end', message: 'Sărești des ultimele 2 seturi' }] });
    const result = explainRecommendation(ex, ctx);
    const pattern = result.reasons.find(r => r.category === 'pattern');
    expect(pattern).toBeDefined();
  });

  it('handles missing exercise gracefully', () => {
    const result = explainRecommendation(null, makeCtx());
    expect(result.summary).toBeTruthy();
  });

  it('includes RIR annotation', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80, rir: 2 } };
    const result = explainRecommendation(ex, makeCtx());
    const rirReason = result.reasons.find(r => r.text?.includes('RIR'));
    expect(rirReason).toBeDefined();
  });

  it('deduplicates identical reasons from multiple sources', () => {
    const duplicatePattern = { type: 'SKIP_DAY', message: 'Joi are 88% skip rate' };
    const ctx = makeCtx({ patterns: [duplicatePattern, duplicatePattern, duplicatePattern] });
    const ex = { name: 'Bench', recommendation: { kg: 80 } };
    const result = explainRecommendation(ex, ctx);
    const patternReasons = result.reasons.filter(r => r.category === 'pattern');
    expect(patternReasons.length, 'Duplicate pattern reasons must be collapsed to 1').toBe(1);
  });
});

describe('whySummary', () => {
  it('returns string', () => {
    const ex = { name: 'Bench', recommendation: { kg: 80, status: 'CONSOLIDATE' } };
    expect(typeof whySummary(ex, makeCtx())).toBe('string');
  });
});
