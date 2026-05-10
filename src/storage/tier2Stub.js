// ══ TIER 2 COLD STORAGE — Firebase Firestore stub (ADR 020 §Tier 2) ════════
// Per ADR 020: archive >180 zile (pre-launch) / >365 zile (post-Pro) in
// Firestore via REST API (ADR 002 — REST not SDK). Lazy fetch on-demand only
// (e.g., user views "all-time progress" chart → fetch Tier 2 batch).
//
// ── Status ──────────────────────────────────────────────────────────────────
//
// **DEFERRED post-launch v1 + Pro tier launch.** Firebase Firestore costs at
// scale ($125/luna @ 100 users, $1500/luna @ 1000) gate this feature behind
// Pro paywall (DECISION_LOG §Pricing locked: Founding Members €60 lifetime,
// Pro €6/luna sau €65/an). Tier 1 (IndexedDB) covers up to 1 year retention
// pre-Pro — sufficient pentru launch beta.
//
// ── Future contract (when implemented) ──────────────────────────────────────
//
//   tier2Push(store, entries)   — async batch upload to Firestore (REST POST)
//   tier2Fetch(store, query)    — lazy on-demand read (UI charts only)
//   tier2Stats()                — { entryCount, lastSync, cost estimate }
//
// Auth context: post ADR_MULTI_TENANT_AUTH_v1 implementation, Firestore path
// becomes `users/{auth.uid}/coach-decisions-archive` (cross-ref ADR 011 §Firebase
// sync, ADR 002 REST, ADR_MULTI_TENANT_AUTH_v1).
//
// ── Why a stub now ──────────────────────────────────────────────────────────
//
//  - Public API surface declared early → consumers can call no-op fns without
//    branching on feature flag.
//  - Documentation locality: all Tier 2 design notes live alongside Tier 0/1
//    code, NU scattered in ADR-only.
//  - Future implementer (Sprint 4.x or post-launch) has clear entry point.

/**
 * Push Tier 1 cold entries (>180d) to Tier 2 Firestore. NO-OP currently —
 * Tier 2 deferred post-Pro launch.
 *
 * @param {string} _store - Tier 1 store name (e.g., 'cdl_tier1')
 * @param {Array<object>} _entries
 * @returns {Promise<{ pushed: 0, deferred: true, reason: string }>}
 */
export async function tier2Push(_store, _entries) {
  return {
    pushed: 0,
    deferred: true,
    reason: 'Tier 2 Firestore archive deferred post-launch v1 + Pro tier (ADR 020).',
  };
}

/**
 * Fetch entries from Tier 2 Firestore by query. NO-OP currently — returns
 * empty array. Caller should handle empty result gracefully (e.g., chart
 * shows Tier 0/1 data only).
 *
 * @param {string} _store
 * @param {object} [_query]
 * @returns {Promise<Array<object>>}
 */
export async function tier2Fetch(_store, _query) {
  return [];
}

/**
 * Telemetry stub — Tier 2 stats. Returns zero state pre-implementation.
 *
 * @returns {Promise<{ entryCount: 0, lastSync: null, monthlyEstCost: 0, deferred: true }>}
 */
export async function tier2Stats() {
  return {
    entryCount: 0,
    lastSync: null,
    monthlyEstCost: 0,
    deferred: true,
  };
}

/**
 * Feature flag — used by callers to branch rendering logic. Returns `false`
 * pre-implementation. When Tier 2 ships, flip to `true` (or better: gate via
 * `featureFlags.js` per-user rollout per ADR 018 §5).
 *
 * @returns {boolean}
 */
export function tier2Available() {
  return false;
}
