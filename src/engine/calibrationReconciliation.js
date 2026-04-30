// ══ ADR 021 — Calibration Drift Reconciliation (Faza 1) ═════════════════════
// Per ADR 021 §Decision SSOT: multi-device sync algorithm cu zero progress loss.
//
//   - engine_tier:           Max Wins Monotonic (cantitate — session count)
//   - calibration_confidence: Monotonic Clock (calitate — observații negative
//                             preserved monotonic; state never regresses)
//   - version_vector:        Element-wise MAX merge per device UUID
//   - observations:          Union-merge (yo_yo + AA HIGH events monotonic)
//
// ── Faza scope ─────────────────────────────────────────────────────────────
//
// **Faza 1 (current — this module):** pure algorithm core + schema + tests.
// No persistence integration; consumers build `calibration_state` ad-hoc and
// pass to `reconcile(branchA, branchB)`.
//
// **Faza 2 (Sprint 4.x — D13 logs-first):** integrate reconciliation în
// Arbitrator T&B core post `calibrationContext.buildContext` async refactor.
// Persistence via CDL or dedicated `calibration-state` storage key TBD în
// Faza 2 design.
//
// **Faza 3 (post-launch v1):** decommission LWW. Cross-ref ADR 011 §Firebase
// sync amendment + ADR 021 §Implementation phasing §Faza 3.

// ── Schema constants ────────────────────────────────────────────────────────

/**
 * Confidence ordering (monotonic enum). Index N+1 strictly more progressed
 * than N. Reconciliation uses index comparison for max-progress wins.
 *
 * 6 nivele canonical post D1 routing (ADR 009 §AMENDMENT 2026-04-30 evening).
 * `DEVELOPING` will be added to active code in Sprint 4 implementation; ordering
 * here pre-declares it pentru forward-compatible reconciliation.
 */
export const CONFIDENCE_ORDER = Object.freeze([
  'COLD_START',
  'INITIAL',
  'DEVELOPING',     // ADR 009 §AMENDMENT D1 RESOLVED — Sprint 4 code refactor pending
  'PERSONALIZING',
  'PERSONALIZED',
  'OPTIMIZED',
]);

/**
 * Engine tier ordering (data volume axis per ADR 009 §AMENDMENT, COGNITIVE_ARCH R8/Q15).
 * T0 = cold (0-4 sessions), T1 = warming (5-20), T2 = calibrated (21+).
 */
export const ENGINE_TIER_ORDER = Object.freeze(['T0', 'T1', 'T2']);

/**
 * Engine tier thresholds — session count → tier.
 * Boundaries per ADR 009 §AMENDMENT §Mapare boundaries.
 */
export const ENGINE_TIER_THRESHOLDS = Object.freeze({
  T0: { min: 0, max: 4 },
  T1: { min: 5, max: 20 },
  T2: { min: 21, max: Infinity },
});

// ── Schema: createInitialCalibrationState ──────────────────────────────────

/**
 * Build initial `calibration_state` for a fresh user device.
 *
 * Pre-Faza-2 T&B prerequisite per ADR 021 §Implementation phasing §Pre-Faza-2:
 * "Migration runner pre-fill `version_vector` pentru existing users (init =
 * `{ <device_uuid>: 1 }`)."
 *
 * @param {string} [deviceId] - Stable per-device UUID (falsy → empty VV)
 * @param {number} [now=Date.now()] - Override timestamp (testing)
 * @returns {object} Fresh calibration_state per ADR 021 §Schema
 */
export function createInitialCalibrationState(deviceId, now = Date.now()) {
  return {
    engine_tier: 'T0',
    calibration_confidence: 'COLD_START',
    version_vector: deviceId ? { [deviceId]: 1 } : {},
    last_updated: new Date(now).toISOString(),
    session_count: 0,
    observations: {
      yo_yo_detected: false,
      aa_high_events: [],
      frustration_markers_count: 0,
      plateau_streaks_weeks: 0,
    },
  };
}

// ── Pure helpers (idempotent, no side effects) ──────────────────────────────

/**
 * Compute `engine_tier` from session count per ADR 009 §AMENDMENT thresholds.
 * Pure function — Max Wins Monotonic property: derived directly from cantitate
 * input, so larger session_count always produces tier ≥ smaller session_count.
 *
 * @param {number} sessionCount
 * @returns {'T0' | 'T1' | 'T2'}
 */
export function computeEngineTier(sessionCount) {
  const n = Number.isFinite(sessionCount) ? Math.max(0, Math.floor(sessionCount)) : 0;
  if (n <= ENGINE_TIER_THRESHOLDS.T0.max) return 'T0';
  if (n <= ENGINE_TIER_THRESHOLDS.T1.max) return 'T1';
  return 'T2';
}

/**
 * Max-progress confidence (Monotonic Clock per ADR 021 §Strategy
 * calibration_confidence). Returns the more-progressed of two enum values.
 *
 * Defensive: unknown enums treated as COLD_START (idx 0). NEVER throws.
 *
 * @param {string} a
 * @param {string} b
 * @returns {string} The later (more progressed) of a, b
 */
export function maxConfidence(a, b) {
  const idxA = CONFIDENCE_ORDER.indexOf(a);
  const idxB = CONFIDENCE_ORDER.indexOf(b);
  const safeA = idxA < 0 ? 0 : idxA;
  const safeB = idxB < 0 ? 0 : idxB;
  return CONFIDENCE_ORDER[Math.max(safeA, safeB)];
}

/**
 * Element-wise MAX merge of version vectors per ADR 021 §Reconciliation
 * algorithm.
 *
 * For each device key în either input, take MAX(va[key], vb[key]). Missing
 * keys treated as 0. Output contains union of all device keys.
 *
 * @param {Record<string, number> | undefined} va
 * @param {Record<string, number> | undefined} vb
 * @returns {Record<string, number>}
 */
export function mergeVersionVector(va, vb) {
  const merged = {};
  const a = va ?? {};
  const b = vb ?? {};
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of allKeys) {
    merged[k] = Math.max(_safeNum(a[k]), _safeNum(b[k]));
  }
  return merged;
}

/**
 * Union-merge of observations per ADR 021 §Reconciliation algorithm.
 * Negative observations preserved monotonically:
 *   - `yo_yo_detected`: OR (once true, stays true)
 *   - `aa_high_events`: union dedupe by event_id
 *   - `frustration_markers_count`: MAX (running counter, never decreases)
 *   - `plateau_streaks_weeks`: MAX (running counter, never decreases)
 *
 * @param {object | undefined} oa
 * @param {object | undefined} ob
 * @returns {object}
 */
export function mergeObservations(oa, ob) {
  return {
    yo_yo_detected: !!(oa?.yo_yo_detected || ob?.yo_yo_detected),
    aa_high_events: _dedupeAaEvents([
      ...(Array.isArray(oa?.aa_high_events) ? oa.aa_high_events : []),
      ...(Array.isArray(ob?.aa_high_events) ? ob.aa_high_events : []),
    ]),
    frustration_markers_count: Math.max(
      _safeNum(oa?.frustration_markers_count),
      _safeNum(ob?.frustration_markers_count)
    ),
    plateau_streaks_weeks: Math.max(
      _safeNum(oa?.plateau_streaks_weeks),
      _safeNum(ob?.plateau_streaks_weeks)
    ),
  };
}

// ── Reconciliation core (pure, idempotent) ──────────────────────────────────

/**
 * Reconcile two `calibration_state` branches into a canonical merged state.
 *
 * Algorithm per ADR 021 §Reconciliation algorithm pseudocode:
 *   1. session_count: MAX (canonical engine_tier derived from MAX)
 *   2. calibration_confidence: max-progress per ordering enum
 *   3. version_vector: element-wise MAX merge
 *   4. observations: union-merge (yo_yo OR, AA events dedupe, counters MAX)
 *
 * Pure function:
 *   - No side effects (no I/O, no globals).
 *   - Idempotent: `reconcile(reconcile(A, B), B) === reconcile(A, B)`.
 *   - Symmetric on quantitative ops (MAX): `reconcile(A, B)` and
 *     `reconcile(B, A)` produce equivalent canonical states modulo
 *     `last_updated` (which always reflects reconciliation time).
 *
 * @param {object} branchA - calibration_state from device A
 * @param {object} branchB - calibration_state from device B
 * @param {object} [opts]
 * @param {number} [opts.now=Date.now()] - Override timestamp (testing)
 * @returns {object} Canonical merged calibration_state
 */
export function reconcile(branchA, branchB, opts = {}) {
  const now = opts.now ?? Date.now();

  // Cantitate: max session count drives canonical engine_tier
  const maxSessions = Math.max(_safeNum(branchA?.session_count), _safeNum(branchB?.session_count));
  const canonicalEngineTier = computeEngineTier(maxSessions);

  // Calitate: max-progress confidence (monotonic clock)
  const canonicalConfidence = maxConfidence(
    branchA?.calibration_confidence,
    branchB?.calibration_confidence
  );

  // Version vector: element-wise MAX merge
  const canonicalVV = mergeVersionVector(branchA?.version_vector, branchB?.version_vector);

  // Observations: union-merge (monotonic accumulation)
  const canonicalObs = mergeObservations(branchA?.observations, branchB?.observations);

  return {
    engine_tier: canonicalEngineTier,
    calibration_confidence: canonicalConfidence,
    version_vector: canonicalVV,
    last_updated: new Date(now).toISOString(),
    session_count: maxSessions,
    observations: canonicalObs,
  };
}

// ── Local mutation: bumpVersion ─────────────────────────────────────────────

/**
 * Apply a local change to `calibration_state` — increment VV for current device.
 * Used when tier or confidence changes locally on a device (so subsequent sync
 * recognizes this branch advanced past the previous canonical state).
 *
 * Returns a NEW state object (immutable update); does not mutate input.
 *
 * @param {object} state - existing calibration_state
 * @param {string} deviceId - stable per-device UUID
 * @param {object} [opts]
 * @param {number} [opts.now=Date.now()]
 * @returns {object} Updated calibration_state with bumped VV
 */
export function bumpVersion(state, deviceId, opts = {}) {
  if (!state || !deviceId) return state;
  const now = opts.now ?? Date.now();
  const currentVv = state.version_vector ?? {};
  return {
    ...state,
    version_vector: {
      ...currentVv,
      [deviceId]: _safeNum(currentVv[deviceId]) + 1,
    },
    last_updated: new Date(now).toISOString(),
  };
}

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Dedupe AA HIGH events by `event_id` (preferred) or stringified body fallback.
 * Order preserved (first occurrence wins).
 */
function _dedupeAaEvents(events) {
  const seen = new Set();
  const out = [];
  for (const e of events) {
    if (e == null) continue;
    const id = typeof e === 'object' && e.event_id != null ? String(e.event_id) : JSON.stringify(e);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(e);
    }
  }
  return out;
}

/**
 * Coerce to safe non-negative number. Defensive against undefined/null/NaN.
 */
function _safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
