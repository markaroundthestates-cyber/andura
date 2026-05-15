// ══ SUFLET ANDURA Big 11 ANATOMICAL AGNOSTIC INVARIANT ════════════════════════
// C4.7 ADR_ENGINE_REFACTOR §4.7 LOCK V1 acceptance criteria — vitality layer
// taxonomy-independent invariant preserve forward-going post engines C4.1-4.6
// refactor Big 11 RO canonical V1 LANDED. Behavioral proxy state (onboarding +
// vitality + session count) drives tier detection — NU anatomical group keys.

import { describe, it, expect } from 'vitest';
import {
  TIER_LEVELS,
  detectTier,
  isFeatureEnabledForTier,
} from '../tier-progression.js';
import { arbitrate as cascadeArbitrate } from '../cascade-defense.js';
import { detectBiasDrift } from '../bias-detection.js';

describe('sufletAndura — anatomical agnostic invariant Big 11 wire compatible', () => {
  it('detectTier driven by behavioral proxy state — NU anatomical group keys', () => {
    // Same state input regardless of Big 6 EN or Big 11 RO context upstream
    const state = { onboardingComplete: true, vitalityComplete: true, sessionCount: 15 };
    expect(detectTier(state)).toBe('T3');

    // detectTier source NU contain group keys
    const fnSource = detectTier.toString();
    expect(fnSource).not.toMatch(/['"](chest|back|shoulders|legs|arms)['"]/);
    expect(fnSource).not.toMatch(/['"](piept|spate|umeri|biceps|triceps|antebrate|fese|gambe)['"]/);
  });

  it('TIER_LEVELS taxonomy-independent (NU contain group keys în labels/requirements)', () => {
    for (const tier of Object.values(TIER_LEVELS)) {
      // Romanian-language labels may incidentally contain "chest" substring (e.g. "chestionar"
      // means "questionnaire") — that's NOT a Big 6 group key reference. We assert no
      // standalone group-key tokens (delimited by spaces, dashes, or string boundaries).
      const bigKeyPattern = /\b(chest|back|shoulders|legs|arms|piept|spate|umeri|biceps|triceps|antebrate|fese|gambe|picioare-quads|picioare-hamstrings)\b/i;
      expect(tier.label).not.toMatch(bigKeyPattern);
      // requirements may contain "chestionar" Romanian — strip that substring first
      const reqStripped = tier.requirements.replace(/chestionar/gi, '');
      expect(reqStripped).not.toMatch(bigKeyPattern);
    }
  });

  it('isFeatureEnabledForTier gates on feature ID + tier — anatomical-independent', () => {
    expect(isFeatureEnabledForTier('T2', 'biasDetection')).toBe(true);
    expect(isFeatureEnabledForTier('T0', 'biasDetection')).toBe(false);
    // feature names are engine/concept-level, NU group keys
    const fnSource = isFeatureEnabledForTier.toString();
    expect(fnSource).not.toMatch(/['"](chest|back|shoulders|legs|piept|spate|umeri)['"]/);
  });

  it('cascadeArbitrate driven by layer priority — NU anatomical group keys (Safety > Recovery > Progression > Optimization)', () => {
    const recs = [
      { engine: 'A', layer: 'progression', action: 'progress', priority: 1, rationale: 'r' },
      { engine: 'B', layer: 'safety',      action: 'rest_day', priority: 1, rationale: 'r' },
    ];
    const result = cascadeArbitrate(recs);
    expect(result.winner?.layer).toBe('safety'); // safety always wins regardless of group context
    const fnSource = cascadeArbitrate.toString();
    expect(fnSource).not.toMatch(/['"](chest|back|shoulders|legs|piept|spate|umeri)['"]/);
  });

  it('detectBiasDrift behavioral proxy NU branches on group keys', () => {
    const fnSource = detectBiasDrift.toString();
    expect(fnSource).not.toMatch(/['"](chest|back|shoulders|legs|piept|spate|umeri|biceps|triceps)['"]/);
  });
});
