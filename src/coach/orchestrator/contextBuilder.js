// EngineContext builder per ADR 030 D3 LOCKED V1.
//
// Orchestrator builds `engineContext = { user, recentSessions, weights,
// profileTier, ... }` ready-data per session-tick. Adapters consume via pure
// shape mapping per D2; they do NOT pull from app state directly.
//
// State shape evolution: schema change rupe 1 loc (this builder), NU 8 adapters
// scattering pull logic.
//
// Q-OPEN-1 RESOLVED V1 2026-05-08 — Migration Runner orchestrator-level
// pre-pipeline integration point în acest fișier (ADR 018 §4 eager-on-app-load
// alignment). Adapter D2 thin scope preserved. Schema version field on
// EngineContext.meta.schemaVersion tracks running migration generation.
//
// Q-OPEN-5 RESOLVED V1 2026-05-08 — Hierarchical fallback Tier 1 IndexedDB
// primary → Tier 0 ephemeral session memory → Tier 2 Firestore async background
// sync (NEVER pipeline blocking). Silent degradation default per ADR 025.
// Optional storageAdapter parameter: `read(key)` returns
// `{ value, tier, staleness_ms }`. Staleness propagated meta.staleness_ms.
//
// V1 defensive — accepts a `userState` already-aggregated from `coachContext`
// callers. Faza 3 batch 1 Periodization wiring will exercise concrete fallback.
//
// See: 03-decisions/030-adapter-design-pattern.md §2.3 D3 + §3.1 + §3.5 RESOLVED V1
//      03-decisions/018-engine-extensibility-architecture.md §4 Migration Runner
//      03-decisions/020-storage-tiering-strategy.md (Tier 1 primary local-first)

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
