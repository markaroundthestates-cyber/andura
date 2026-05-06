// Convergence Guard utility stub per ADR 030 D5 LOCKED V1.
//
// Cross-cutting orchestrator-level utility (NOT per-adapter) per D5. V1 stub
// returns existing tier from userState.profileTier — full re-eval per
// `03-decisions/009-calibration-tiers.md §AMENDMENT 2026-05-05 birou after
// Convergence Guard "T2 Unlock" Behavioral Validation Rule` PENDING resolve
// per Q-OPEN-7 (re-eval cadence: per session-tick vs batch periodic + cooldown).
//
// V1 behavior: passthrough existing tier. NO re-evaluation. Marked stub
// explicitly so faza 3 wiring callers know full behavior comes later.
//
// See: 03-decisions/030-adapter-design-pattern.md §2.5 D5 + §3 Q-OPEN-7
//      03-decisions/009-calibration-tiers.md §AMENDMENT 2026-05-05 birou after

/**
 * Resolve the calibration tier for a user state.
 *
 * V1 stub: returns `userState.profileTier ?? null` unchanged. NO re-eval.
 *
 * Future (Q-OPEN-7 resolved): apply Convergence Guard behavioral validation
 * rule (T2 Unlock requires N consecutive sessions cu pattern X) per cadence
 * decided post-Beta budget measurement (Q-OPEN-2 dependency).
 *
 * @param {{profileTier?: string|null}} [userState]
 * @returns {string|null}
 */
export function resolveTier(userState) {
  return userState?.profileTier ?? null;
}
