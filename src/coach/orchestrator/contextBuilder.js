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
// pre-pipeline integration point in acest fisier (ADR 018 §4 eager-on-app-load
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
 * adapters during faza 3 wiring (D2 thin scope = NU side effects). `meta` is
 * also frozen (so Constraint Object propagation requires new frozen context
 * per pipeline step — see `runPipeline` in index.js).
 *
 * `meta.constraintObject` placeholder slot per ADR 026 §1.10 + ADR 030 D3:
 * Periodization (ADR 026 §9.1) emits Constraint Object via adapter result
 * `output.constraintObject`; orchestrator (`runPipeline` in index.js) freezes
 * si propagates it via new frozen EngineContext to downstream engines (Goal
 * Adaptation, Energy Adjustment, Bayesian Nutrition, Tempo, Specialization,
 * Warm-up, Deload — all 7 downstream consume Floor/Ceiling per ADR 030 §3.4
 * sequential strict V1 + §3.6 ENGINE_THREW 'hard' severity halt protect).
 *
 * @param {object} [userState] - Aggregate care include user + recentSessions + weights + flags + meta
 * @returns {import('./types.js').EngineContext}
 */
export function buildEngineContext(userState) {
  const us = userState ?? {};
  const sourceMeta = us.meta && typeof us.meta === 'object' ? us.meta : {};
  const meta = { ...sourceMeta };
  // Constraint Object placeholder — populated by orchestrator post-Periodization.
  if (!('constraintObject' in meta)) {
    meta.constraintObject = null;
  }
  const ctx = {
    user: us.user ?? {},
    recentSessions: Array.isArray(us.recentSessions) ? us.recentSessions : [],
    weights: us.weights ?? {},
    profileTier: us.profileTier ?? null,
    flags: us.flags ?? {},
    meta: Object.freeze(meta),
  };
  return Object.freeze(ctx);
}

/**
 * Extend a frozen EngineContext with additional meta fields, returning a new
 * frozen context. Used by `runPipeline` in index.js to propagate Constraint
 * Object emitted by Periodization (ADR 026 §9.1) to downstream engines per
 * ADR 030 D3 + §3.4 sequential strict V1.
 *
 * @param {import('./types.js').EngineContext} ctx
 * @param {object} metaPatch - Shallow merge into existing meta
 * @returns {import('./types.js').EngineContext}
 */
export function extendEngineContext(ctx, metaPatch) {
  if (!ctx || typeof ctx !== 'object' || !metaPatch || typeof metaPatch !== 'object') {
    return ctx;
  }
  const nextMeta = Object.freeze({ ...ctx.meta, ...metaPatch });
  return Object.freeze({ ...ctx, meta: nextMeta });
}
