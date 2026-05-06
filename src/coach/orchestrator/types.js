// Orchestrator types — JSDoc typedefs per ADR 030 D1-D5 LOCKED V1.
// See: 03-decisions/030-adapter-design-pattern.md

/**
 * Pre-built input shape for engines per ADR 030 D3.
 *
 * Orchestrator builds this once per session-tick (single read pass aggregate).
 * Adapters are pure mappers `engineContext → engineInput`; they do NOT pull
 * from app state directly — schema evolution rupe 1 loc (this builder), NU
 * 8 adapters scattering pull logic.
 *
 * Optional fields are populated lazily as features land. V1 minimal shape
 * mirrors `coachContext` consumers (user, recentSessions, weights, profileTier).
 *
 * @typedef {object} EngineContext
 * @property {object} user            - User profile snapshot (sex, age, kg, BF%, experience, goal, ...)
 * @property {Array<object>} recentSessions - CDL snapshot ordered desc by date (Tier 1 IndexedDB read)
 * @property {object} [weights]       - PR / current load map per exercise
 * @property {string} [profileTier]   - Calibration tier resolved by Convergence Guard (D5)
 * @property {object} [flags]         - FeatureFlags resolved snapshot (per ADR 018 §5)
 * @property {object} [meta]          - Cross-cutting telemetry IDs (sessionTickId, traceId, ...)
 */

/**
 * Adapter contract per ADR 030 D1+D2.
 *
 * 1 per engine (D1 — engine #N nou = new adapter additive, NU edit central).
 * Thin scope (D2 — pure shape mapping `engineContext → engineInput` + Result-typed
 * passthrough; NU side effects, NU bundled telemetry).
 *
 * Side effects (CDL writes, Firestore Tier 2 sync, telemetry) live în orchestrator
 * layer separate per D5.
 *
 * @typedef {object} EngineAdapter
 * @property {string} id                                   - Unique adapter identifier (e.g. 'periodization', 'goalAdaptation')
 * @property {(ctx: EngineContext) => AdapterResult} invoke - Pure shape map + engine call + Result wrap
 */

/**
 * Discriminated union output per ADR 030 D4 — never throws, errors first-class
 * in type system. Composable with sequential pipeline §42.10 short-circuit
 * fail-safe (Anti-Cascade Silent precedent ADR_CASCADE_DEFENSE_v1 §EXT-2).
 *
 * Verbosity mitigation: `isOk(result)` helper at call site rezolvă ergonomics.
 *
 * @typedef {{ ok: true, output: any } | { ok: false, error: AdapterError }} AdapterResult
 */

/**
 * Structured error envelope. `code` = stable machine-readable taxonomy;
 * `message` = human-readable detail; `cause` = optional original throwable.
 *
 * @typedef {object} AdapterError
 * @property {string} code              - Stable taxonomy (e.g. 'BUDGET_EXCEEDED', 'INVALID_INPUT', 'ENGINE_THREW')
 * @property {string} message           - Human-readable explanation
 * @property {Error|unknown} [cause]    - Original exception when adapter caught a throw
 * @property {string} [adapterId]       - Which adapter produced this error (set by orchestrator)
 */

export {};
