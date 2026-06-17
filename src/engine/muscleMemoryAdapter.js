// ══ MUSCLE MEMORY ADAPTER — Engine Consumer Layer ══════════════════════════
// Per [[03-decisions/_FROZEN/033-muscle-memory-index]] §32.1-§32.3 SPEC LOCKED V1
// 2026-05-02 + LOCK 10 pre-Beta promote 2026-05-15.
//
// Compose pipeline order (LOCK 10 LAST in chain — refunda baseline when user
// opted-in, applied AFTER accelerated learning so the MMI starting point wins
// on re-resume):
//   DP.recommend
//     → AA.applyTo
//       → applyAcceleratedLearningUpgrade   (LOCK 9 user-strength learning)
//         → applyMuscleMemoryUpgrade        (LOCK 10 — re-resume cap, when opted-in)
//
// Ordering rationale: accelerated learning was designed for active-training
// users whose overrides indicate they out-pace the baseline. MMI applies when
// the user is returning from a 6+ month pause — there is no recent CDL signal
// to upgrade, and we want the conservative starting weight to win. If both
// somehow applied, MMI (re-resume start) should be the last word.
//
// Pure functions — ADR 026 §9 invariant.

import {
  computeMmiStartingWeight,
  computeMmiBoostMultiplier,
} from './muscleMemoryIndex.js';

/**
 * Apply the MMI return-weight as a SAFETY CAP on a recommendation when the user
 * has opted-in (mmiContext.userChoice === 'accepted'). Returns recommendation
 * unchanged when user refused, hasn't decided, or under-threshold.
 *
 * Daniel decision (option c, 2026-06-17): MMI is a TRUE CAP — the MMI-derived
 * return weight can only ever LOWER the incoming rec toward a safe return load,
 * NEVER raise it above DP's own independent return-deload (~0.60x peak). So the
 * final kg = Math.min(incoming DP rec, MMI return weight). A returnee keeps DP's
 * safer 0.60x deload (min(0.60x, 0.77x) = 0.60x) instead of being overwritten
 * UPWARD to the ~0.77x MMI start. The forensic flags are stamped ONLY when the
 * cap actually bites (mmiReturnKg < incoming rec); a no-op cap returns the
 * recommendation unchanged.
 *
 * Forensic flags on cap (ADR 011 §append-only audit trail):
 *   _muscleMemoryApplied: true
 *   _mmiOriginalKg: <baseline before MMI cap>
 *   _mmiPeakPrePauseKg: <peak from pr-records pre-pause>
 *   _mmiStartMultiplier: <0.80 | 0.70 | 0.60>
 *   _mmiBoostMultiplier: <1.25 | 1.10 | 1.00>
 *   _mmiBucket: <bucket reference>
 *
 * @pure (idempotent — ADR 018 §2)
 * @param {{kg?: number} & Record<string, any>} recommendation - {kg, ...} from upstream pipeline
 * @param {string} exerciseName - EN canonical name (peakMap is EN-keyed)
 * @param {{userChoice?: string, pauseMonths?: number, peakPrePauseKgPerExercise?: Record<string, number>, weeksSinceResume?: number} | null | undefined} mmiContext
 * @param {{ roundToStep?: (kg: number, ex: string) => number } | null | undefined} dpEngine - DP reference for roundToStep
 * @returns {Object}
 */
export function applyMuscleMemoryUpgrade(recommendation, exerciseName, mmiContext, dpEngine) {
  if (!recommendation || typeof recommendation.kg !== 'number' || recommendation.kg <= 0) {
    return recommendation;
  }
  if (typeof exerciseName !== 'string' || !exerciseName) return recommendation;
  if (!mmiContext) return recommendation;
  // User explicit refused or not opted-in → baseline pipeline wins (§32.3
  // "refuse path = engine incarca greutatile maxime istorice").
  if (mmiContext.userChoice !== 'accepted') return recommendation;

  const peakMap = mmiContext.peakPrePauseKgPerExercise;
  if (!peakMap || typeof peakMap !== 'object') return recommendation;
  const peakKg = peakMap[exerciseName];
  if (typeof peakKg !== 'number' || !Number.isFinite(peakKg) || peakKg <= 0) {
    return recommendation;
  }

  const pauseMonths = mmiContext.pauseMonths ?? 0;
  const mmiStart = computeMmiStartingWeight(peakKg, pauseMonths);
  if (!mmiStart) return recommendation;

  const weeks = typeof mmiContext.weeksSinceResume === 'number' ? mmiContext.weeksSinceResume : 0;
  const boost = computeMmiBoostMultiplier(weeks, pauseMonths);
  const mmiReturnKg = mmiStart.startKg * boost;

  const roundedMmiKg = dpEngine && typeof dpEngine.roundToStep === 'function'
    ? dpEngine.roundToStep(mmiReturnKg, exerciseName)
    : mmiReturnKg;

  // TRUE CAP (option c): never raise above the incoming DP rec — DP's own
  // return-deload already gives a safer load (~0.60x peak). When the MMI return
  // weight is NOT below the incoming rec, the cap is a no-op → return unchanged
  // (no forensic flags, so the audit trail only records a real cap).
  if (!(roundedMmiKg < recommendation.kg)) return recommendation;

  return {
    ...recommendation,
    kg: roundedMmiKg,
    _muscleMemoryApplied: true,
    _mmiOriginalKg: recommendation.kg,
    _mmiPeakPrePauseKg: peakKg,
    _mmiStartMultiplier: mmiStart.multiplier,
    _mmiBoostMultiplier: boost,
    _mmiBucket: mmiStart.bucket,
  };
}

/**
 * I/O boundary helper — read MMI state from DB.
 * Encapsulated for testability + single seam between pure adapter and DB.
 *
 * Persisted shape:
 *   {
 *     userChoice: 'accepted' | 'refused',
 *     pauseMonths: <number>,
 *     promptedAt: '<ISO8601>',
 *     resumeStartDate: '<YYYY-MM-DD>',
 *     peakPrePauseKgPerExercise: { '<exName>': <kg>, ... }
 *   }
 *
 * @param {{ get?: (key: string) => unknown } | null | undefined} db - DB reference exposing .get(key)
 * @returns {Object|null}
 */
export function readMmiState(db) {
  if (!db || typeof db.get !== 'function') return null;
  try {
    const v = db.get('mmi-state');
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Derive `weeksSinceResume` from `resumeStartDate` + current ISO date.
 * Pure boundary helper — current date passed explicitly to keep determinism.
 *
 * @pure
 * @param {string|null|undefined} resumeStartDate - 'YYYY-MM-DD'
 * @param {string} currentDate - 'YYYY-MM-DD'
 * @returns {number} weeks elapsed (floor), 0 when invalid / future
 */
export function computeWeeksSinceResume(resumeStartDate, currentDate) {
  if (typeof resumeStartDate !== 'string' || !resumeStartDate) return 0;
  if (typeof currentDate !== 'string' || !currentDate) return 0;
  const a = new Date(resumeStartDate).getTime();
  const b = new Date(currentDate).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  const days = (b - a) / (1000 * 60 * 60 * 24);
  return Math.floor(days / 7);
}
