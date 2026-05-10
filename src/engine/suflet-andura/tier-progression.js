// ══ TIER PROGRESSION T0/T1/T2/T3 ═══════════════════════════════════════════════
// LOCKED V1 per §36.16-§36.26 SUFLET ANDURA + §36.44 (T0 hard minimum) + §36.45 (T2 wording functional).
// Self-selection = FEATURE NOT bug — user can skip onboarding (T0) and engine
// uses synthetic demographic prior (50+ profile × 90 zile) as fallback.

/** @type {Record<string, { id: number, label: string, requirements: string }>} */
export const TIER_LEVELS = {
  T0: { id: 0, label: 'Pornire rapida',          requirements: 'Skip onboarding · engine generic + demographic prior' },
  T1: { id: 1, label: 'Profil de baza',          requirements: 'Profile Typing complete (chestionar T1+)' },
  T2: { id: 2, label: 'Profil + vitalitate',     requirements: 'T1 + vitality data adaugata' },
  T3: { id: 3, label: 'Profil personalizat',     requirements: 'T2 + behavioral real (post 12 sesiuni)' },
};

/**
 * Detect current tier based on user state.
 * @param {{ onboardingComplete: boolean, vitalityComplete: boolean, sessionCount: number }} state
 * @returns {keyof TIER_LEVELS}
 */
export function detectTier(state) {
  if (!state.onboardingComplete) return 'T0';
  if (!state.vitalityComplete) return 'T1';
  if (state.sessionCount < 12) return 'T2';
  return 'T3';
}

/**
 * Whether a feature is enabled for the given tier.
 * Engines respect tier gating to prevent false positives la sesiuni putine.
 * @param {keyof TIER_LEVELS} tier
 * @param {string} feature
 * @returns {boolean}
 */
export function isFeatureEnabledForTier(tier, feature) {
  const tierId = TIER_LEVELS[tier].id;
  const featureMin = {
    'patternLearning':   1,
    'biasDetection':     2,
    'compositeSignal':   2,
    'cascadeDefense':    2,
    'outlierFilter':     2,
    'responseProfile':   3,
    'goalShiftHandling': 1,
  };
  return tierId >= (featureMin[feature] ?? 0);
}
