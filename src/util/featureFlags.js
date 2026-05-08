// ══ FEATURE FLAGS (ADR 018 §5) ══════════════════════════════════════════════
// Per-user deterministic rollout cu hash bucketing. Used by Dimension Registry
// (ADR 018 §1) to gate dimensions behind staged rollout (10% → 50% → 100%).
//
// Per ADR 018 DP-6 (APPROVED 2026-04-27): per-user rollout NU global on/off.
// Independent buckets per flag — Vitality 10% și Demographic Prior 10% NU sunt
// același 10% useri.
//
// Resolution order pentru `isEnabled(flagId, userId)`:
//   1. localStorage._devFlags JSON override (dev-only force; ignored if malformed)
//   2. Per-user hash bucketing: hash(userId + flagId) % 100 < rollout * 100
//   3. Flag default boolean (false dacă flag necunoscut)

/**
 * @typedef {object} FlagDefinition
 * @property {number} rollout - 0..1; fraction of users for whom the flag is on
 * @property {boolean} default - Fallback when userId can't be resolved
 */

/**
 * Static flag registry. Adăugare flag = edit aici (rollout %, default).
 *
 * Initial state Sprint Foundation Batch 2: empty. Flags se adaugă on
 * dimension port (Vitality, Demographic Prior, AA detection, Profile Typing).
 *
 *   FLAGS = {
 *     vitality_layer_v1:    { rollout: 0.00, default: false },
 *     demographic_prior_v1: { rollout: 0.00, default: false },
 *     aa_detection_v1:      { rollout: 1.00, default: true  },
 *     profile_typing_v1:    { rollout: 0.00, default: false },
 *   };
 *
 * @type {Object<string, FlagDefinition>}
 */
export const FLAGS = Object.freeze({
  // Strangler switch + dimension-activation flag for AA detection (ADR 018 §6
  // Phase 1). When ON, coachDirector routes AA through the Decision Cluster
  // + autoAggressionAdapter; when OFF, legacy applyAAAdjustments runs.
  // Default 0% — production behavior unchanged. Ramp via _devFlags or
  // explicit edit here once golden-master parity is validated.
  aa_via_cluster: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 1 Periodization wiring real (ADR 030 D1-D5 LOCKED V1
  // + Q-OPEN-1→7 RESOLVED V1 2026-05-08; ADR 026 §42.10 pipeline #1). When ON,
  // coach decision flow invokes Periodization Engine via orchestrator
  // `runPipeline` cu `periodizationAdapter`; when OFF, Periodization remains
  // un-invoked (current state — Faza 3 BLOCKED scope-major discovery seminal
  // "vizor fără ușă" 2026-05-06 morning chat-2 acasă: 0/8 engines wired în
  // coach decision flow live pre-Strangler).
  //
  // Default 0% — production behavior unchanged (Periodization stays orphan).
  // Golden-master parity tests legacy↔orchestrated zero-behavior-change strict
  // în `src/coach/orchestrator/__tests__/periodizationParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici once Daniel cont propriu
  // smoke (Faza 4) validates wiring real comportament corect.
  periodization_via_orchestrator: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 2 Goal Adaptation wiring real (ADR 026 §42.10
  // pipeline #2; first downstream Constraint Object consumer post Periodization
  // batch 1 commit `de4222b`). When ON, coach decision flow invokes Goal
  // Adaptation via `runPipeline` cu `goalAdaptationAdapter`; when OFF, Goal
  // Adaptation remains un-invoked (orphan pre-Strangler same as Periodization).
  //
  // Adapter D2 shape mapping concrete: orchestrator slot `meta.constraintObject`
  // → engine-side `meta.periodizationConstraint` (per §9.2.5 Cluster 5 Hook 1
  // convention). Missing upstream Constraint Object = INVALID_INPUT 'hard'
  // severity halt per ADR 030 §3.6 fail-safe Anti-Cascade Silent default.
  //
  // Default 0% — production behavior unchanged. Golden-master parity tests
  // legacy↔orchestrated zero-behavior-change strict în
  // `src/coach/orchestrator/__tests__/goalAdaptationParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  goal_adaptation_via_orchestrator: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 3 Energy Adjustment wiring real (ADR 026 §42.10
  // pipeline #3; second downstream Constraint Object consumer + Forward
  // Constraint Object Hook 4 propagation per §9.3.1 #5). When ON, coach
  // decision flow invokes Energy Adjustment via `runPipeline` cu
  // `energyAdjustmentAdapter`; when OFF, Energy Adjustment remains un-invoked
  // (orphan pre-Strangler same as Periodization + Goal Adaptation).
  //
  // Adapter D2 shape mapping concrete (identical pattern batch 2): orchestrator
  // slot `meta.constraintObject` → engine-side `meta.periodizationConstraint`
  // (per §9.3 Cluster 5 Hook 1 convention). Adapter additionally surfaces
  // `engineResult.meta.forward_constraint_object` (frozen pass-through Hook 4)
  // as `output.constraintObject` for orchestrator downstream propagation
  // (Bayesian Nutrition #4 + Tempo #5 + Specialization #6 + Warm-up #7 +
  // Deload #8 toate consume forwarded Floor/Ceiling).
  //
  // Missing upstream Constraint Object = INVALID_INPUT 'hard' severity halt
  // per ADR 030 §3.6 fail-safe Anti-Cascade Silent default.
  //
  // Default 0% — production behavior unchanged. Golden-master parity tests
  // legacy↔orchestrated zero-behavior-change strict în
  // `src/coach/orchestrator/__tests__/energyAdjustmentParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  energy_adjustment_via_orchestrator: { rollout: 0, default: false },
});

/** localStorage key holding the dev override JSON map. */
export const DEV_FLAGS_KEY = '_devFlags';

/**
 * DJB2 string hash — deterministic, fast, simple. NOT cryptographic — but
 * sufficient pentru per-user bucketing where collision-resistance is not a
 * security concern. Same input → same 32-bit unsigned output across runtimes.
 *
 * Reference: Daniel J. Bernstein, comp.lang.c posting 1991.
 *
 * @param {string} str
 * @returns {number} 32-bit unsigned int
 */
export function hashStringDjb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    hash |= 0; // force 32-bit signed via bitwise op
  }
  return hash >>> 0; // convert to unsigned
}

/**
 * Resolve userId pentru bucketing. Order: 'user-id' > 'device-id' > null.
 * Defensive — returns null dacă localStorage throws sau ambele missing.
 *
 * Per ADR 018 §5 Implementation notes: 'device-id' e UUID generated first run
 * în firebase.js. 'user-id' rezervat pentru future multi-tenant auth (per
 * ADR 011 reconsideration trigger #6).
 *
 * @returns {string|null}
 */
export function resolveUserId() {
  try {
    return localStorage.getItem('user-id') || localStorage.getItem('device-id') || null;
  } catch {
    return null;
  }
}

/**
 * Read + parse `_devFlags` localStorage entry. Returns null pe missing /
 * malformed / non-object content. Logs warning on malformed input.
 *
 * @returns {Object<string, boolean>|null}
 */
export function readDevFlags() {
  let raw;
  try { raw = localStorage.getItem(DEV_FLAGS_KEY); }
  catch { return null; }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn(`[FeatureFlags] ${DEV_FLAGS_KEY} is not a plain object — ignoring`);
      return null;
    }
    return parsed;
  } catch {
    console.warn(`[FeatureFlags] ${DEV_FLAGS_KEY} is not valid JSON — ignoring`);
    return null;
  }
}

/**
 * Determine whether a flag is enabled for a given user.
 *
 * Resolution order:
 *   1. _devFlags JSON override (dev only)
 *   2. Per-user hash bucketing — hash(userId + flagId) % 100 < rollout * 100
 *   3. Flag default (false dacă flag unknown)
 *
 * @param {string} flagId - Flag identifier (must exist în FLAGS for non-default behavior)
 * @param {string} [userId] - Defaults to resolveUserId() output
 * @param {object} [opts]
 * @param {Object<string, FlagDefinition>} [opts.flags=FLAGS] - Override registry (testing)
 * @returns {boolean}
 */
export function isEnabled(flagId, userId, opts = {}) {
  const flags = opts.flags ?? FLAGS;

  // (1) Dev override — wins over rollout for testing flexibility.
  const dev = readDevFlags();
  if (dev && Object.prototype.hasOwnProperty.call(dev, flagId)) {
    return dev[flagId] === true;
  }

  const flag = flags[flagId];
  if (!flag) return false; // Unknown flag — fail-closed (no surprise activation).

  // (2) Hash bucketing — short-circuits at 0% / 100% rollout.
  if (typeof flag.rollout === 'number') {
    if (flag.rollout <= 0) return false;
    if (flag.rollout >= 1) return true;
    const uid = userId ?? resolveUserId();
    if (!uid) return flag.default === true; // Fallback la default when uid unresolvable.
    const bucket = hashStringDjb2(uid + flagId) % 100;
    return bucket < flag.rollout * 100;
  }

  // (3) No rollout specified → fall back to default boolean.
  return flag.default === true;
}
