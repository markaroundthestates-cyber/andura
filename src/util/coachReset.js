// ══ COACH RESET — wipe AI learning state (B011) ═══════════════════════════
// Wipes coach-side learning/calibration storage keys while preserving user
// data (workout logs, weight logs, profile, phase log). Used by
// `ResetCoachConfirm.tsx` "Reseteaza coach" drill-down per mockup §11.
//
// Preserve invariant (mockup verbatim): "Datele tale de antrenament raman
// intacte. Ireversibil."

/**
 * Coach state localStorage keys (full-key, no prefix) wiped on reset.
 * Aligned with `firebase.js:51` REMOTE_COACH_KEYS array + engine consumers.
 */
export const COACH_STATE_KEYS = Object.freeze([
  // CDL tiers (decision log)
  'coach-decisions',
  'coach-decisions-aggregate',
  'coach-decisions-archive',
  'cdl-patterns',
  // Pattern learning
  'peak-hours',
  'session-start-hours',
  'auto-recommendations',
  'applied-recommendations',
  'applied-patterns',
  'detected-patterns',
  'pattern-learning-cache',
  // Accelerated learning
  'aggressive-loading-log',
  // Readiness signal cache
  'readiness',
  // Session draft state
  'session-draft',
  'workout-skips',
]);

/**
 * Prefix-keys wiped via localStorage scan.
 */
export const COACH_STATE_PREFIXES = Object.freeze([
  'aa-cooldown-', // aggressive aversion per-exercise cooldown
]);

/**
 * Wipe coach AI learning state.
 * @returns {{ keysCleared: number, prefixKeysCleared: number }}
 */
export function resetCoachState() {
  let keysCleared = 0;
  for (const key of COACH_STATE_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      keysCleared++;
    }
  }
  let prefixKeysCleared = 0;
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && COACH_STATE_PREFIXES.some((p) => k.startsWith(p))) {
      toRemove.push(k);
    }
  }
  for (const k of toRemove) {
    localStorage.removeItem(k);
    prefixKeysCleared++;
  }
  return { keysCleared, prefixKeysCleared };
}
