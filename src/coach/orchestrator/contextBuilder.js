// EngineContext builder per ADR 030 D3 LOCKED V1.
//
// Orchestrator builds `engineContext = { user, recentSessions, weights,
// profileTier, ... }` ready-data per session-tick. Adapters consume via pure
// shape mapping per D2; they do NOT pull from app state directly.
//
// State shape evolution: schema change rupe 1 loc (this builder), NU 8 adapters
// scattering pull logic. Q-OPEN-1 versioning/migration PENDING — orchestrator
// vs adapter responsibility, defer chat strategic NEW post-Beta concrete signal.
//
// V1 defensive — accepts a `userState` already-aggregated from `coachContext`
// callers. Storage Tier 0/1/2 fallback strategy Q-OPEN-5 PENDING (defer until
// first Tier fallback edge case surfaces în faza 3 wiring).
//
// See: 03-decisions/030-adapter-design-pattern.md §2.3 D3 + §3 Q-OPEN-1 + Q-OPEN-5

/**
 * Build a frozen EngineContext from a userState aggregate. Defensive on
 * missing fields — V1 minimum required = `user` object; rest default empty.
 *
 * The output is `Object.freeze`-d shallow to surface accidental mutation by
 * adapters during faza 3 wiring (D2 thin scope = NU side effects).
 *
 * @param {object} [userState] - Aggregate care include user + recentSessions + weights + flags + meta
 * @returns {import('./types.js').EngineContext}
 */
export function buildEngineContext(userState) {
  const us = userState ?? {};
  const ctx = {
    user: us.user ?? {},
    recentSessions: Array.isArray(us.recentSessions) ? us.recentSessions : [],
    weights: us.weights ?? {},
    profileTier: us.profileTier ?? null,
    flags: us.flags ?? {},
    meta: us.meta ?? {},
  };
  return Object.freeze(ctx);
}
