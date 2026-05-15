// Convergence Guard utility stub per ADR 030 D5 LOCKED V1.
//
// Cross-cutting orchestrator-level utility (NOT per-adapter) per D5.
// Q-OPEN-7 RESOLVED V1 2026-05-08 — batch periodic per session-end (NOT
// per-session-tick) + cooldown asymmetric upgrade/downgrade per ADR 030 §3.7.
//
// V1 stub passthrough preserved (zero-effect baseline). V1.5 amendment per
// session-end: post-session CDL write triggers re-eval per ADR 009 §AMENDMENT
// 2026-05-05 birou after Behavioral Validation Rule:
//   - Tier upgrade (T0→T1→T2): NO cooldown (welcome event)
//   - Tier downgrade (T2→T1, T1→T0): cooldown 7 zile minim + N=3 consecutive
//     sessions confirming pattern (ADR 009 §AMENDMENT N=3 reuse)
//
// Engagement-modulated cooldown: DEFER post-Beta concrete signal.
//
// See: 03-decisions/_FROZEN/030-adapter-design-pattern.md §2.5 D5 + §3.7 RESOLVED V1
//      03-decisions/_FROZEN/009-calibration-tiers.md §AMENDMENT 2026-05-05 birou after

/**
 * Resolve the calibration tier for a user state.
 *
 * V1 stub: returns `userState.profileTier ?? null` unchanged. NO re-eval.
 *
 * V1.5 (Q-OPEN-7 RESOLVED scheduled per-session-end): apply Convergence Guard
 * behavioral validation rule (T2 Unlock requires N=3 consecutive sessions cu
 * pattern X) per session-end cadence + cooldown 7 zile minim downgrade +
 * `userState.profileTier_lastChange_ts` field check.
 *
 * @param {{profileTier?: string|null, profileTier_lastChange_ts?: number}} [userState]
 * @returns {string|null}
 */
export function resolveTier(userState) {
  return userState?.profileTier ?? null;
}
