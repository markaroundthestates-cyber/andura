// ══ PROGRESSION MATRIX (F-NEW-2 LOCKED V1 OBLIGATORIU) ══════════════════════
// Per HANDOVER §22 F-NEW-2 + ADR 009 §AMENDMENT D1 + Q-0231 (Profile Typing).
// Tier-aware progression frequency + Sprinter Cap modifier on weight increments.
//
// NOTE: this is a SEPARATE axis from CALIBRATION_LEVELS (calibration_confidence).
// Progression matrix tiers (Beginner/Intermediate/Advanced) are session-count
// bands that govern HOW OFTEN the engine bumps weight or reps. Calibration
// levels gate WHICH ENGINES run. Both axes are valid simultaneously per
// ADR 009 §AMENDMENT 2-axis model.
//
// V1 scope: pure helper module — no consumer wiring. Integration into dp.js /
// progressionEngine pending Sprint 4.x cluster (deferred per §34 Blockers).

/**
 * Progression tier names — frequency-of-progression axis (F-NEW-2 matrix).
 */
export const PROGRESSION_TIERS = Object.freeze({
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
});

/**
 * Session count → progression tier per F-NEW-2 LOCKED matrix:
 *   0-10 sess → Beginner (every session if RPE correct)
 *   11-50    → Intermediate (every 2-3 sessions, volume accumulation)
 *   51+      → Advanced (every 4-6 sessions, micro-periodization)
 *
 * @param {number} sessionsCount - Unique completed-session count
 * @returns {'BEGINNER'|'INTERMEDIATE'|'ADVANCED'}
 */
export function getProgressionTier(sessionsCount) {
  const n = Number(sessionsCount);
  if (!Number.isFinite(n) || n < 0) return PROGRESSION_TIERS.BEGINNER;
  if (n <= 10) return PROGRESSION_TIERS.BEGINNER;
  if (n <= 50) return PROGRESSION_TIERS.INTERMEDIATE;
  return PROGRESSION_TIERS.ADVANCED;
}

/**
 * Recommended interval (in sessions) between weight bumps for a given tier.
 * Returns the LOWER bound of the F-NEW-2 frequency window (most aggressive
 * progression that still respects the matrix).
 *
 * @param {'BEGINNER'|'INTERMEDIATE'|'ADVANCED'} tier
 * @returns {number} sessions between progressions
 */
export function getProgressionInterval(tier) {
  switch (tier) {
    case PROGRESSION_TIERS.BEGINNER:     return 1; // every session if RPE correct
    case PROGRESSION_TIERS.INTERMEDIATE: return 2; // every 2-3 sessions
    case PROGRESSION_TIERS.ADVANCED:     return 4; // every 4-6 sessions
    default:                              return 1;
  }
}

/**
 * Should the engine bump weight/reps THIS session given how many sessions
 * have passed since the last successful progression? Per F-NEW-2 frequency
 * matrix.
 *
 * @param {number} sessionsCount - Unique completed-session count
 * @param {number} sessionsSinceLastProgression - Sessions since last bump (0 = bumped last session)
 * @returns {boolean}
 */
export function shouldProgressThisSession(sessionsCount, sessionsSinceLastProgression) {
  const tier = getProgressionTier(sessionsCount);
  const interval = getProgressionInterval(tier);
  return Number(sessionsSinceLastProgression) >= interval;
}

/**
 * Compound exercise weight increment (kg). Default range +1.0 to +2.5 kg per
 * F-NEW-2 LOCKED. Sprinter Cap modifier (Q-0231 Profile Typing): when profile
 * type is `sprinter`, plafonare la 1.0 kg max (anti-volume-creep + hyperfocus
 * safety override).
 *
 * @param {string} [profileType] - Profile Type (sprinter / marathon / strategic / unknown)
 * @returns {number} kg increment
 */
export function getCompoundIncrement(profileType) {
  if (_isSprinter(profileType)) return 1.0;
  return 2.5;
}

/**
 * Isolation exercise progression. Default: +0.5 kg OR +1 rep before weight bump.
 * Sprinter Cap: forces +1 rep path (NU weight bump) — anti-aggression on
 * volume-creep risk profiles.
 *
 * @param {string} [profileType]
 * @returns {{ kg: number, repsBumpFirst: boolean }}
 */
export function getIsolationIncrement(profileType) {
  if (_isSprinter(profileType)) {
    return { kg: 0, repsBumpFirst: true };
  }
  return { kg: 0.5, repsBumpFirst: true };
}

/**
 * Sprinter Cap trigger: returns true when Profile Type == 'sprinter'.
 * Per Q-0231: Sprinter profiles (volume creep + hyperfocus correlation) need
 * progression plafonare. Marathon / Strategic / unknown profiles get full
 * default progression.
 *
 * @param {string} [profileType]
 * @returns {boolean}
 */
export function isSprinterCapActive(profileType) {
  return _isSprinter(profileType);
}

/**
 * Bugatti-tone soft warning shown to Advanced users who skip a scheduled
 * deload week. Wording LOCKED per HANDOVER §22 F-NEW-2 — DO NOT paraphrase.
 * Banner only — agency 100%, NO force-deload retroactive.
 *
 * @returns {string}
 */
export function getDeloadSkipWarning() {
  return 'Saptamana de deload a trecut neutilizata. Sesiunea de azi merge mai bine la RPE 6-7 — corpul recupereaza in miscare, nu doar in repaus.';
}

/** @param {unknown} profileType */
function _isSprinter(profileType) {
  if (typeof profileType !== 'string') return false;
  return profileType.trim().toLowerCase() === 'sprinter';
}
