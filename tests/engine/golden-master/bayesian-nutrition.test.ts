// Track 7 §7.1 — Golden master snapshots for Bayesian Nutrition engine.
// Per Michael Feathers characterization-test pattern: snapshot ALL engine outputs
// for canonical personas pre-refactor. Any deviation post-refactor = explicit
// review + intent confirmation. ZERO Date.now/Math.random (ADR 026 §9 invariant).
//
// Snapshots committed alongside this file in __snapshots__/ — reviewer vede
// diff în PR pentru orice engine behavior change.

import { describe, it, expect } from 'vitest';
import { evaluate } from '../../../src/engine/bayesianNutrition/index.js';
import {
  personaMariusT2,
  personaMaria65T3,
  personaGigelT0,
  type Persona,
} from '../../fixtures/personas';

// Construct deterministic EngineContext from a persona — no Date.now, no random.
// Observations derived from persona.history weight logs (already deterministic
// via seeded mulberry32 RNG în personas.ts).
function buildCtx(persona: Persona, overrides: Record<string, unknown> = {}) {
  const observations = persona.history.map((log) => ({
    weightDelta: log.weightDelta,
    kcalDaily: log.kcalDaily,
  }));
  return {
    user: {
      uid: persona.uid,
      age: persona.profile.age,
      sex: persona.profile.sex,
      experience: persona.profile.experience,
    },
    recentSessions: [],
    meta: {
      demographicMu: 0,
      demographicSigma: 0.5,
      observations,
      recentObservedWeights: [],
      recentPredictedWeights: [],
      energyDirection: 'neutral',
      previousPhase: 'maintain',
      currentPhase: persona.goal,
      adaptiveProfileTypingValue: 0.7,
      currentProfileTypingThreshold: 0.7,
      energyReadiness: 4,
      emoji: 'neutral',
      sleepSelfReport: persona.vitality?.sleep ?? 7,
      nowMs: 1747700000000,
      lastNutritionPromptMs: 0,
      nutritionPromptCountThisYear: 0,
      ...overrides,
    },
    flags: {},
  };
}

// Stable snapshot subset — exclude observations array (large, varies with persona
// history length) + tier (cumulative test). Focus pe posterior + likelihood +
// profile typing + ui tier + passive mode + signals (sorted).
// Loose `any` typing: BayesianNutritionResult JSDoc în types.js doesn't enumerate
// all runtime fields (id, recommendations) — snapshot is the SoT for shape contract.
function snapshotShape(result: any) {
  const { meta } = result;
  return {
    id: result.id,
    tier: result.tier,
    confidence: round(result.confidence, 6),
    signals: [...result.signals].sort(),
    recommendations: result.recommendations,
    blueprint: {
      prior: {
        mu: round(meta.nutrition_inference_metadata.prior.mu, 6),
        sigma: round(meta.nutrition_inference_metadata.prior.sigma, 6),
      },
      posterior: {
        mu: round(meta.nutrition_inference_metadata.posterior.mu, 6),
        sigma: round(meta.nutrition_inference_metadata.posterior.sigma, 6),
        observations_count:
          meta.nutrition_inference_metadata.posterior.observations_count,
        ci_lower: round(meta.nutrition_inference_metadata.posterior.ci_lower, 6),
        ci_upper: round(meta.nutrition_inference_metadata.posterior.ci_upper, 6),
      },
      confidence_interval: {
        lower: round(meta.nutrition_inference_metadata.confidence_interval.lower, 6),
        upper: round(meta.nutrition_inference_metadata.confidence_interval.upper, 6),
      },
      likelihood_probabilities: roundProbs(meta.likelihood_probabilities),
      ui_tier: meta.ui_tier,
      passive_mode_active: meta.passive_mode_active,
      blueprint_signals: [...meta.signals].sort(),
    },
  };
}

function round(n: number, digits: number): number {
  if (!Number.isFinite(n)) return n;
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

function roundProbs(probs: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of Object.keys(probs).sort()) {
    out[k] = round(probs[k]!, 6);
  }
  return out;
}

describe('Bayesian Nutrition — golden master snapshots', () => {
  it('personaGigelT0 cold-start (zero history, no observations)', async () => {
    const ctx = buildCtx(personaGigelT0);
    const result = await evaluate(ctx);
    expect(snapshotShape(result)).toMatchSnapshot();
    expect(result.id).toBe('bayesianNutrition');
  });

  it('personaMariusT2 mature 30-day history (cut goal, seed 1337)', async () => {
    const ctx = buildCtx(personaMariusT2);
    const result = (await evaluate(ctx)) as any;
    expect(snapshotShape(result)).toMatchSnapshot();
    expect(result.id).toBe('bayesianNutrition');
    expect(result.meta.nutrition_inference_metadata.posterior.observations_count).toBeGreaterThan(0);
  });

  it('personaMaria65T3 conservative 90-day (maintain, seed 2026)', async () => {
    const ctx = buildCtx(personaMaria65T3);
    const result = (await evaluate(ctx)) as any;
    expect(snapshotShape(result)).toMatchSnapshot();
    expect(result.id).toBe('bayesianNutrition');
  });

  it('LOCK 8 kcal floor — sub-1200 observations excluded from posterior update', async () => {
    const ctx = buildCtx(personaMariusT2, {
      observations: [
        { weightDelta: 0.1, kcalDaily: 2200 },
        { weightDelta: -0.2, kcalDaily: 800 }, // excluded
        { weightDelta: 0.05, kcalDaily: 1300 },
        { weightDelta: 0.0, kcalDaily: 1199 }, // excluded
      ],
    });
    const result = (await evaluate(ctx)) as any;
    expect(
      result.meta.nutrition_inference_metadata.posterior.observations_count,
    ).toBe(2);
  });

  it('determinism — same ctx yields identical output (pure function)', async () => {
    const ctx = buildCtx(personaMariusT2);
    const r1 = await evaluate(ctx);
    const r2 = await evaluate(ctx);
    expect(snapshotShape(r1)).toEqual(snapshotShape(r2));
  });
});
