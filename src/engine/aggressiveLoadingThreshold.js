// ══ AGGRESSIVE LOADING THRESHOLD — TIER-AWARE ══════════════════════════════
// Per [[wiki/concepts/aggressive-loading-warning-tier-aware]] LOCK V1 2026-05-14
// + [[03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1]] §EXT-2 NEW
//
// Engine confidence-aware threshold dynamic per exercise category:
//   - Low confidence (T0): tolerate deviații mari — recommendation poate fi
//     conservativă vs realitatea user (cold-start, Demographic Prior atipic etc.)
//   - High confidence (T2/T3 collapsed to T2 per engine model — see notes below):
//     flag aggressive justified, engine confident on baseline.
//
// Tier mapping (engine model has T0/T1/T2 via computeEngineTier; spec T3 ≡ T2):
//   T0 = 0-4 sesiuni (ENGINE_TIER_THRESHOLDS.T0)
//   T1 = 5-20 sesiuni (ENGINE_TIER_THRESHOLDS.T1)
//   T2 = 21+ sesiuni (ENGINE_TIER_THRESHOLDS.T2) — also accepts 'T3' fallback to T2
//
// Exercise category mapping (schema field):
//   compound  = schema tier 1 (forta) — heavy multi-joint loads
//   isolation = schema tier 2 (hipertrofie) || tier 3 (accesoriu) — single-joint
//
// Pure functions — ADR 026 §9 invariant: NO Date.now / Math.random / mutation.

export const AGGRESSIVE_LOADING_THRESHOLDS = Object.freeze({
  T0: Object.freeze({ compound: 0.50, isolation: 1.00 }),  // +50% / +100%
  T1: Object.freeze({ compound: 0.30, isolation: 0.75 }),  // +30% / +75%
  T2: Object.freeze({ compound: 0.20, isolation: 0.50 }),  // +20% / +50%
  T3: Object.freeze({ compound: 0.20, isolation: 0.50 }),  // +20% / +50% (alias T2)
});

const VALID_TIERS = Object.freeze(['T0', 'T1', 'T2', 'T3']);
const VALID_CATEGORIES = Object.freeze(['compound', 'isolation']);
const FALLBACK_TIER = 'T2';  // conservative — engine confident assumption
// Threshold fallback: compound = stricter threshold → more warnings = safer.
const FALLBACK_CATEGORY = 'compound';
// Categorization fallback for unknown/orphan exercise metadata: most free-text
// exercises are accessories, default to isolation (higher threshold, fewer false
// positives when we don't know what the exercise is).
const CATEGORIZE_FALLBACK = 'isolation';

/**
 * Get threshold ratio for (tier, category).
 * Unknown tier → fallback T2 conservative.
 * Unknown category → fallback compound conservative.
 *
 * @pure
 * @param {string} tier - 'T0' | 'T1' | 'T2' | 'T3'
 * @param {string} category - 'compound' | 'isolation'
 * @returns {number} threshold ratio (e.g. 0.20 = +20%)
 */
export function getThresholdForTierAndCategory(tier, category) {
  const safeTier = VALID_TIERS.includes(tier) ? tier : FALLBACK_TIER;
  const safeCategory = VALID_CATEGORIES.includes(category) ? category : FALLBACK_CATEGORY;
  return AGGRESSIVE_LOADING_THRESHOLDS[safeTier][safeCategory];
}

/**
 * Map exercise schema entry → category 'compound' | 'isolation'.
 * Compound = schema tier 1 (forta — heavy multi-joint).
 * Isolation = schema tier 2/3 OR unknown (conservative fallback to isolation).
 *
 * Optional override via explicit `category` field on metadata for future schema
 * extension. Today uses tier as authority.
 *
 * @pure
 * @param {object|null|undefined} metadata - exercise metadata entry
 * @returns {'compound' | 'isolation'}
 */
export function categorizeExercise(metadata) {
  if (!metadata) return CATEGORIZE_FALLBACK;
  if (metadata.category === 'compound' || metadata.category === 'isolation') {
    return metadata.category;
  }
  if (metadata.tier === 1) return 'compound';
  if (metadata.tier === 2 || metadata.tier === 3) return 'isolation';
  return CATEGORIZE_FALLBACK;
}

/**
 * Evaluate whether (actualKg vs recommendedKg) is aggressive per (tier, category).
 * Aggressive = deviationPct >= threshold for that (tier, category).
 *
 * Edge cases:
 *   - recommendedKg <= 0 OR actualKg <= 0 → not aggressive (no baseline to compare)
 *   - actualKg <= recommendedKg → not aggressive (deviation negative or zero)
 *
 * @pure
 * @param {number} recommendedKg - engine baseline recommendation
 * @param {number} actualKg - user override input
 * @param {string} tier - 'T0' | 'T1' | 'T2' | 'T3'
 * @param {string} category - 'compound' | 'isolation'
 * @returns {{isAggressive: boolean, deviationPct: number, threshold: number}}
 */
export function evaluateAggressiveLoading(recommendedKg, actualKg, tier, category) {
  const r = Number.isFinite(recommendedKg) ? recommendedKg : 0;
  const a = Number.isFinite(actualKg) ? actualKg : 0;
  const threshold = getThresholdForTierAndCategory(tier, category);

  if (r <= 0 || a <= 0) {
    return { isAggressive: false, deviationPct: 0, threshold };
  }
  const deviationPct = (a - r) / r;
  return {
    isAggressive: deviationPct >= threshold,
    deviationPct,
    threshold,
  };
}
