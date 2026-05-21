// ══ MUSCLE MEMORY INDEX (MMI) — Engine #9 ══════════════════════════════════
// Per [[03-decisions/_FROZEN/033-muscle-memory-index]] §32.1-§32.3 SPEC verbatim
// LOCKED V1 2026-05-02 + LOCK 10 pre-Beta scope directive cross-chat 14 birou
// 2026-05-14 Daniel CEO "totul pre-Beta" supersede defer v1.5 rationale.
//
// Formula (§32.1):
//   Greutate Pornire = Peak Pre-Pauza × Multiplicator Lookup
//
// Tabel multiplicatori + boost progresie (primele 3 saptamani post-resume):
//   6-12 luni  → 0.80× pornire, 1.25× boost
//   12-24 luni → 0.70× pornire, 1.10× boost
//   24+ luni   → 0.60× pornire, 1.00× boost (start proaspat)
//
// Trigger threshold (§32.2): >= 6 luni pauza → prompt user prima deschidere.
// User-controlled (anti-paternalism): accepted | refused | not-yet-prompted.
//
// Pure functions — ADR 026 §9 invariant: NO Date.now / Math.random / mutation.

export const MMI_LOOKUP_TABLE = Object.freeze({
  // [minMonths, maxMonths) buckets — minMonths inclusive, maxMonths exclusive
  // (24+ bucket uses Infinity as open-ended ceiling per spec "24+ luni").
  buckets: Object.freeze([
    Object.freeze({ minMonths: 6, maxMonths: 12, startMultiplier: 0.80, boostMultiplier: 1.25, boostWeeksDuration: 3 }),
    Object.freeze({ minMonths: 12, maxMonths: 24, startMultiplier: 0.70, boostMultiplier: 1.10, boostWeeksDuration: 3 }),
    Object.freeze({ minMonths: 24, maxMonths: Infinity, startMultiplier: 0.60, boostMultiplier: 1.00, boostWeeksDuration: 3 }),
  ]),
  thresholdMonthsMin: 6,  // < 6 luni → no MMI trigger
});

/**
 * Lookup MMI bucket for a given pause duration in months.
 * @pure
 * @param {number} pauseMonths
 * @returns {{minMonths: number, maxMonths: number, startMultiplier: number, boostMultiplier: number, boostWeeksDuration: number} | null} bucket entry or null when under threshold / invalid
 */
export function getMmiBucketForPauseMonths(pauseMonths) {
  if (typeof pauseMonths !== 'number' || !Number.isFinite(pauseMonths)) return null;
  if (pauseMonths < MMI_LOOKUP_TABLE.thresholdMonthsMin) return null;
  for (const bucket of MMI_LOOKUP_TABLE.buckets) {
    if (pauseMonths >= bucket.minMonths && pauseMonths < bucket.maxMonths) {
      return bucket;
    }
  }
  return null;
}

/**
 * Compute MMI starting weight per ADR 033 §32.1 formula.
 * @pure
 * @param {number} peakPrePauseKg - peak weight before pause (from pr-records)
 * @param {number} pauseMonths
 * @returns {{startKg: number, multiplier: number, bucket: Object} | null}
 */
export function computeMmiStartingWeight(peakPrePauseKg, pauseMonths) {
  if (typeof peakPrePauseKg !== 'number' || !Number.isFinite(peakPrePauseKg) || peakPrePauseKg <= 0) {
    return null;
  }
  const bucket = getMmiBucketForPauseMonths(pauseMonths);
  if (!bucket) return null;
  return {
    startKg: peakPrePauseKg * bucket.startMultiplier,
    multiplier: bucket.startMultiplier,
    bucket,
  };
}

/**
 * Compute boost multiplier for the first N weeks post-resume.
 * Boost applies to weeks 0..(boostWeeksDuration-1). After that, returns 1.0.
 * @pure
 * @param {number} weeksSinceResume - 0-indexed (0 = current week)
 * @param {number} pauseMonths
 * @returns {number} multiplier (1.0 = no boost / boost expired)
 */
export function computeMmiBoostMultiplier(weeksSinceResume, pauseMonths) {
  const bucket = getMmiBucketForPauseMonths(pauseMonths);
  if (!bucket) return 1.0;
  if (typeof weeksSinceResume !== 'number' || !Number.isFinite(weeksSinceResume)) return 1.0;
  if (weeksSinceResume < 0 || weeksSinceResume >= bucket.boostWeeksDuration) return 1.0;
  return bucket.boostMultiplier;
}

/**
 * Decision: should MMI prompt be shown on app entry?
 * §32.2: 6+ luni pauza + user not yet decided (accepted/refused).
 * @pure
 * @param {number} pauseMonths
 * @param {boolean} alreadyPromptedThisSession - in-session de-dupe flag
 * @param {string|null|undefined} userChoice - 'accepted' | 'refused' | null
 * @returns {boolean}
 */
export function shouldShowMmiPrompt(pauseMonths, alreadyPromptedThisSession, userChoice) {
  if (alreadyPromptedThisSession === true) return false;
  if (userChoice === 'accepted' || userChoice === 'refused') return false;
  if (typeof pauseMonths !== 'number' || !Number.isFinite(pauseMonths)) return false;
  return pauseMonths >= MMI_LOOKUP_TABLE.thresholdMonthsMin;
}
