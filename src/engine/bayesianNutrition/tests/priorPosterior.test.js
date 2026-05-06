import { describe, it, expect } from 'vitest';
import {
  resolveTier,
  strongPriorSlope,
  initPriorFromDemographic,
  conjugateUpdate,
  decayPosteriorToPrior,
  evaluatePhaseReset,
  detectSpecialPriors,
} from '../priorPosterior.js';
import { CALIBRATION_TIERS, STRONG_PRIOR_SLOPE, EDGE_CASES } from '../constants.js';

describe('resolveTier — Cluster A2 tier-aware', () => {
  it('T0 / T1 / T2 case-insensitive', () => {
    expect(resolveTier({ profileTier: 'T0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier({ profileTier: 't1' })).toBe(CALIBRATION_TIERS.T1);
    expect(resolveTier({ profileTier: 'T2' })).toBe(CALIBRATION_TIERS.T2);
  });
  it('numeric strings 0/1/2', () => {
    expect(resolveTier({ profileTier: '0' })).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier({ profileTier: '1' })).toBe(CALIBRATION_TIERS.T1);
  });
  it('missing → T0 cold start defensive default', () => {
    expect(resolveTier({})).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier(null)).toBe(CALIBRATION_TIERS.T0);
    expect(resolveTier({ profileTier: 'foo' })).toBe(CALIBRATION_TIERS.T0);
  });
});

describe('strongPriorSlope — Cluster A2 verbatim 70/30→80/20→90/10', () => {
  it('T0 = 70% prior / 30% input (anti-overshoot)', () => {
    expect(strongPriorSlope(CALIBRATION_TIERS.T0)).toEqual({ prior: 0.70, input: 0.30 });
  });
  it('T1 = 20% prior / 80% input (calibration -50% per §3.5.1)', () => {
    expect(strongPriorSlope(CALIBRATION_TIERS.T1)).toEqual({ prior: 0.20, input: 0.80 });
  });
  it('T2 = 10% prior / 90% input (Convergence Guard satisfied)', () => {
    expect(strongPriorSlope(CALIBRATION_TIERS.T2)).toEqual({ prior: 0.10, input: 0.90 });
  });
  it('slopes sum to 1.0 invariant', () => {
    for (const t of [CALIBRATION_TIERS.T0, CALIBRATION_TIERS.T1, CALIBRATION_TIERS.T2]) {
      const s = strongPriorSlope(t);
      expect(s.prior + s.input).toBeCloseTo(1.0, 5);
    }
  });
  it('unknown tier → T0 defensive', () => {
    expect(strongPriorSlope('UNKNOWN')).toEqual(STRONG_PRIOR_SLOPE.T0);
  });
});

describe('initPriorFromDemographic — Cluster A1 Gaussian Conjugate Prior', () => {
  it('valid demographic mu/sigma → initialized prior', () => {
    const p = initPriorFromDemographic({ demographicMu: 75, demographicSigma: 5 });
    expect(p.mu).toBe(75);
    expect(p.sigma).toBe(5);
    expect(p.source).toBe('demographic_prior');
  });
  it('missing → defensive defaults mu=0 sigma=1', () => {
    const p = initPriorFromDemographic({});
    expect(p.mu).toBe(0);
    expect(p.sigma).toBe(1.0);
  });
  it('invalid sigma → defensive 1.0', () => {
    const p = initPriorFromDemographic({ demographicMu: 80, demographicSigma: -5 });
    expect(p.sigma).toBe(1.0);
  });
});

describe('conjugateUpdate — Normal-Normal closed-form A1+A2', () => {
  const prior = { mu: 0, sigma: 2.0, source: 'demographic_prior' };

  it('zero observations → posterior = prior', () => {
    const post = conjugateUpdate({
      prior,
      sampleMean: 5,
      sampleVariance: 1,
      observationsCount: 0,
      slope: { prior: 0.7, input: 0.3 },
    });
    expect(post.mu).toBe(prior.mu);
    expect(post.sigma).toBe(prior.sigma);
  });
  it('T0 70/30 slope → posterior shifts toward sample but prior dominates', () => {
    const post = conjugateUpdate({
      prior,
      sampleMean: 10,
      sampleVariance: 1,
      observationsCount: 5,
      slope: { prior: 0.70, input: 0.30 },
    });
    expect(post.mu).toBeGreaterThan(0);
    expect(post.mu).toBeLessThan(10);
    expect(post.sigma).toBeLessThan(prior.sigma); // posterior more confident
  });
  it('T2 90/10 slope vs T0 70/30 → T2 posterior shifts more toward sample', () => {
    const t0Post = conjugateUpdate({
      prior, sampleMean: 10, sampleVariance: 1, observationsCount: 5,
      slope: { prior: 0.70, input: 0.30 },
    });
    const t2Post = conjugateUpdate({
      prior, sampleMean: 10, sampleVariance: 1, observationsCount: 5,
      slope: { prior: 0.10, input: 0.90 },
    });
    expect(t2Post.mu).toBeGreaterThan(t0Post.mu);
  });
  it('posterior precision > prior precision (more data = more confident)', () => {
    const post = conjugateUpdate({
      prior, sampleMean: 5, sampleVariance: 1, observationsCount: 10,
      slope: { prior: 0.50, input: 0.50 },
    });
    expect(post.sigma).toBeLessThan(prior.sigma);
  });
  it('defensive — null prior → uses default prior {mu:0,sigma:1} then updates', () => {
    const post = conjugateUpdate({
      prior: null, sampleMean: 5, sampleVariance: 1, observationsCount: 5,
      slope: { prior: 0.5, input: 0.5 },
    });
    // With default prior mu=0 + sample mu=5, posterior shifts toward 5
    expect(Number.isFinite(post.mu)).toBe(true);
    expect(post.mu).toBeGreaterThan(0);
    expect(post.mu).toBeLessThan(5);
    expect(post.sigma).toBeLessThan(1.0); // posterior more confident post-update
  });
  it('defensive — null prior + zero observations → defaults preserved', () => {
    const post = conjugateUpdate({
      prior: null, sampleMean: 5, sampleVariance: 1, observationsCount: 0,
      slope: { prior: 0.5, input: 0.5 },
    });
    expect(post.mu).toBe(0);
    expect(post.sigma).toBe(1.0);
  });
});

describe('decayPosteriorToPrior — Cluster A3 natural posterior=prior_next', () => {
  it('valid posterior → prior cu source posterior_n_minus_1', () => {
    const next = decayPosteriorToPrior({ mu: 5, sigma: 1.5 });
    expect(next.mu).toBe(5);
    expect(next.sigma).toBe(1.5);
    expect(next.source).toBe('posterior_n_minus_1');
  });
  it('invalid posterior → defensive defaults', () => {
    const next = decayPosteriorToPrior(null);
    expect(next.mu).toBe(0);
    expect(next.sigma).toBe(1.0);
    expect(next.source).toBe('posterior_n_minus_1');
  });
});

describe('evaluatePhaseReset — Cluster A5 Hibrid Layer 1+2 reset / preserve Layer 4', () => {
  it('CUT → BULK transition → shouldReset true', () => {
    const r = evaluatePhaseReset({ previousPhase: 'CUT', currentPhase: 'BULK' });
    expect(r.shouldReset).toBe(true);
    expect(r.resetLayers).toEqual([1, 2]);
    expect(r.preserveLayers).toEqual([4]);
  });
  it('BULK → CUT transition → shouldReset true (symmetric)', () => {
    const r = evaluatePhaseReset({ previousPhase: 'BULK', currentPhase: 'CUT' });
    expect(r.shouldReset).toBe(true);
  });
  it('MAINTAIN → MAINTAIN no transition → shouldReset false', () => {
    const r = evaluatePhaseReset({ previousPhase: 'MAINTAIN', currentPhase: 'MAINTAIN' });
    expect(r.shouldReset).toBe(false);
  });
  it('null phases → defensive false', () => {
    const r = evaluatePhaseReset({});
    expect(r.shouldReset).toBe(false);
  });
});

describe('detectSpecialPriors — Cluster E2 edge cases', () => {
  it('pregnant condition → Passive Mode active', () => {
    const r = detectSpecialPriors({ medicalConditions: ['pregnant'] });
    expect(r.passiveMode).toBe(true);
    expect(r.passiveModeConditions).toContain('pregnant');
  });
  it('post-bariatric condition → Passive Mode active', () => {
    const r = detectSpecialPriors({ medicalConditions: ['post-bariatric'] });
    expect(r.passiveMode).toBe(true);
    expect(r.passiveModeConditions).toContain('post_bariatric');
  });
  it('kidney disease condition → Passive Mode active', () => {
    const r = detectSpecialPriors({ medicalConditions: ['kidney_disease'] });
    expect(r.passiveMode).toBe(true);
  });
  it('age 75+ → Special priors active + disclaimer', () => {
    const r = detectSpecialPriors({ age: 80 });
    expect(r.specialPriors).toBe(true);
    expect(r.specialPriorsReasons).toContain('age_75_plus');
    expect(r.disclaimerCopy).toBe(EDGE_CASES.disclaimerCopy);
  });
  it('ED history → Special priors active', () => {
    const r = detectSpecialPriors({ edHistory: true });
    expect(r.specialPriors).toBe(true);
    expect(r.specialPriorsReasons).toContain('ed_history');
  });
  it('healthy young user → no flags', () => {
    const r = detectSpecialPriors({ age: 30, medicalConditions: [] });
    expect(r.passiveMode).toBe(false);
    expect(r.specialPriors).toBe(false);
    expect(r.disclaimerCopy).toBe(null);
  });
  it('null user → defensive no flags', () => {
    const r = detectSpecialPriors(null);
    expect(r.passiveMode).toBe(false);
    expect(r.specialPriors).toBe(false);
  });
});
