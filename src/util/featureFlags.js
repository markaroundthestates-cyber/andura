// ══ FEATURE FLAGS (ADR 018 §5) ══════════════════════════════════════════════
// Per-user deterministic rollout cu hash bucketing. Used by Dimension Registry
// (ADR 018 §1) to gate dimensions behind staged rollout (10% → 50% → 100%).
//
// Per ADR 018 DP-6 (APPROVED 2026-04-27): per-user rollout NU global on/off.
// Independent buckets per flag — Vitality 10% si Demographic Prior 10% NU sunt
// acelasi 10% useri.
//
// Resolution order pentru `isEnabled(flagId, userId)`:
//   1. localStorage._devFlags JSON override (dev-only force; ignored if malformed)
//   2. Per-user hash bucketing: hash(userId + flagId) % 100 < rollout * 100
//   3. Flag default boolean (false daca flag necunoscut)

import { logger } from './logger.js';

/**
 * @typedef {object} FlagDefinition
 * @property {number} rollout - 0..1; fraction of users for whom the flag is on
 * @property {boolean} default - Fallback when userId can't be resolved
 */

/**
 * Static flag registry. Adaugare flag = edit aici (rollout %, default).
 *
 * Initial state Sprint Foundation Batch 2: empty. Flags se adauga on
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
  // "vizor fara usa" 2026-05-06 morning chat-2 acasa: 0/8 engines wired in
  // coach decision flow live pre-Strangler).
  //
  // Default 0% — production behavior unchanged (Periodization stays orphan).
  // Golden-master parity tests legacy↔orchestrated zero-behavior-change strict
  // in `src/coach/orchestrator/__tests__/periodizationParity.test.js`.
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
  // legacy↔orchestrated zero-behavior-change strict in
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
  // legacy↔orchestrated zero-behavior-change strict in
  // `src/coach/orchestrator/__tests__/energyAdjustmentParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  energy_adjustment_via_orchestrator: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 4 Bayesian Nutrition wiring real (ADR 030 D1-D5
  // LOCKED V1 + Q-OPEN-1→7 RESOLVED V1 2026-05-08; ADR 026 §42.10 pipeline #4).
  // When ON, coach decision flow invokes Bayesian Nutrition Engine via orchestrator
  // `runPipeline` cu `bayesianNutritionAdapter` cumulative 4-adapter chain
  // (Periodization → Goal Adaptation → Energy Adjustment → Bayesian Nutrition);
  // when OFF, Bayesian remains un-invoked via orchestrator (engine V1 LANDED
  // commit `8615ec1` standalone, NU yet wired into live coach flow).
  //
  // Adapter D2 shape mapping concrete (identical pattern batches 2-3):
  // orchestrator slot `meta.constraintObject` → engine-side
  // `meta.periodizationConstraint` (per §9.4 Cluster C Hook 1 convention).
  // Engine consumes Constraint Object read-only — adapter follows Goal
  // Adaptation pattern (NU re-emit `output.constraintObject`, since engine
  // doesn't emit `meta.forward_constraint_object` in output blueprint).
  // Constraint Object stays propagated downstream din upstream Energy
  // Adjustment Hook 4 emission (batch 3) prin orchestrator's existing
  // currentCtx chain.
  //
  // Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05) = orchestrator-
  // level concern via `src/coach/orchestrator/utilities/convergenceGuard.js`,
  // NU engine-emitted metadata. Adapter does NOT propagate convergenceGuard.
  //
  // Missing upstream Constraint Object = INVALID_INPUT 'hard' severity halt
  // per ADR 030 §3.6 fail-safe Anti-Cascade Silent default.
  //
  // Default 0% — production behavior unchanged. Golden-master parity tests
  // legacy↔orchestrated zero-behavior-change strict in
  // `src/coach/orchestrator/__tests__/bayesianNutritionParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  bayesian_nutrition_via_orchestrator: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 5 Tempo wiring real (ADR 030 D1-D5 LOCKED V1 +
  // Q-OPEN-1→7 RESOLVED V1 2026-05-08; ADR 026 §42.10 pipeline #5 + ADR 026
  // §9.5 canonical SSOT + ADR 028 SPEC REFERENCE redirect). When ON, coach
  // decision flow invokes Tempo Engine via orchestrator `runPipeline` cu
  // `tempoAdapter` cumulative 5-adapter chain (Periodization → Goal Adaptation
  // → Energy Adjustment → Bayesian Nutrition → Tempo); when OFF, Tempo remains
  // un-invoked via orchestrator (engine V1 LANDED commit `d82d118` Faza 2.5
  // batch 5 standalone, NU yet wired into live coach flow).
  //
  // Adapter D2 shape mapping concrete (identical pattern batches 2-4):
  // orchestrator slot `meta.constraintObject` → engine-side
  // `meta.periodizationConstraint` (per §9.5 Cluster A1 Hook 1 convention).
  // Engine consumes Constraint Object read-only — adapter follows Bayesian
  // Nutrition / Goal Adaptation pattern (NU re-emit `output.constraintObject`,
  // since engine doesn't emit `meta.forward_constraint_object` in output
  // blueprint, only `trace.forwardedConstraint` boolean). Constraint Object
  // stays propagated downstream din upstream Energy Adjustment Hook 4 emission
  // (batch 3) prin orchestrator's existing currentCtx chain.
  //
  // Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05) =
  // orchestrator-level concern via
  // `src/coach/orchestrator/utilities/convergenceGuard.js`, NU engine-emitted
  // metadata. Adapter does NOT propagate convergenceGuard.
  //
  // Missing upstream Constraint Object = INVALID_INPUT 'hard' severity halt
  // per ADR 030 §3.6 fail-safe Anti-Cascade Silent default.
  //
  // Default 0% — production behavior unchanged. Golden-master parity tests
  // legacy↔orchestrated zero-behavior-change strict in
  // `src/coach/orchestrator/__tests__/tempoParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  tempo_via_orchestrator: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 6 Specialization wiring real (ADR 030 D1-D5 LOCKED V1
  // + Q-OPEN-1→7 RESOLVED V1 2026-05-08; ADR 026 §42.10 pipeline #6 + ADR 026
  // §9.6 canonical SSOT + ADR 029 SPEC REFERENCE redirect). When ON, coach
  // decision flow invokes Specialization Engine via orchestrator `runPipeline`
  // cu `specializationAdapter` cumulative 6-adapter chain (Periodization →
  // Goal Adaptation → Energy Adjustment → Bayesian Nutrition → Tempo →
  // Specialization); when OFF, Specialization remains un-invoked via
  // orchestrator (engine V1 LANDED commit `4cf50ab` Faza 2.5 batch 6 standalone
  // — wires `weaknessDetector` orfan per §36.84 Gap #1 via import in
  // `weaknessConsumer.js`, NU yet wired into live coach flow).
  //
  // Engine = PARALLEL volume+frequency modifier on top of Periodization for
  // advanced users (Marius persona gate strict Q12 §45.3 LOCKED + tier T1+ +
  // phase Bulk/Recomp + NU injury invariant 5). Hook 1 read-only consume CO
  // (anti-cascade safeguard).
  //
  // Adapter D2 shape mapping concrete (identical pattern batches 2-5):
  // orchestrator slot `meta.constraintObject` → engine-side
  // `meta.periodizationConstraint` (per §9.6 Cluster A Hook 1 convention).
  // Engine consumes Constraint Object read-only — adapter follows Tempo /
  // Bayesian Nutrition / Goal Adaptation pattern (NU re-emit
  // `output.constraintObject`, since engine doesn't emit
  // `meta.forward_constraint_object` in output blueprint, only
  // `trace.forwardedConstraint` boolean). Constraint Object stays propagated
  // downstream din upstream Energy Adjustment Hook 4 emission (batch 3) prin
  // orchestrator's existing currentCtx chain.
  //
  // Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05) =
  // orchestrator-level concern via
  // `src/coach/orchestrator/utilities/convergenceGuard.js`, NU engine-emitted
  // metadata. Adapter does NOT propagate convergenceGuard.
  //
  // Missing upstream Constraint Object = INVALID_INPUT 'hard' severity halt
  // per ADR 030 §3.6 fail-safe Anti-Cascade Silent default.
  //
  // Default 0% — production behavior unchanged. Golden-master parity tests
  // legacy↔orchestrated zero-behavior-change strict in
  // `src/coach/orchestrator/__tests__/specializationParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  specialization_via_orchestrator: { rollout: 0, default: false },

  // Faza 3 STRANGLER batch 7 Warm-up wiring real (ADR 030 D1-D5 LOCKED V1 +
  // Q-OPEN-1→7 RESOLVED V1 2026-05-08; ADR 026 §42.10 pipeline #7 + ADR 026 §9.7
  // canonical SSOT + ADR 031 SPEC REFERENCE direct). When ON, coach decision flow
  // invokes Warm-up Engine via orchestrator `runPipeline` cu `warmupAdapter`
  // cumulative 7-adapter chain (Periodization → Goal Adaptation → Energy
  // Adjustment → Bayesian Nutrition → Tempo → Specialization → Warm-up); when
  // OFF, Warm-up remains un-invoked via orchestrator (engine V1 LANDED commit
  // `20999fb` Faza 2.5 batch 7 standalone, NU yet wired into live coach flow).
  //
  // Engine = adaptive warm-up routine 5-10 min Hybrid 1-2 general dynamic + 2-3
  // specific muscle prep, persona-aware thresholds (Maria 5-10 mobility flow /
  // Gigica 5-7 dynamic+ramp / Marius 8-10 ramp 50-70-90%), T0 Instant Skip
  // default §65.3 Source 1 Option A (skipDecision metadata flag — warmup_state
  // stays ACTIVE pentru T0 fresh fara explicit userOptedSkip per anti-paternalism
  // ADR 025) + T1+ opt-in expanded routine, optional 2 min text-only cooldown
  // post-session (§65.4 Source 1 OVERRIDE Q4 reconciled). Hook D1 read-only
  // consume CO. Convergence Guard orchestrator-level NU engine-emitted
  // (Specialization/Tempo/Bayesian/Goal Adaptation precedent).
  //
  // Adapter D2 shape mapping concrete (identical pattern batches 2-6):
  // orchestrator slot `meta.constraintObject` → engine-side
  // `meta.periodizationConstraint` (per §9.7 Cluster D Hook D1 convention).
  // Engine consumes Constraint Object read-only — adapter follows Specialization
  // / Tempo / Bayesian Nutrition / Goal Adaptation pattern (NU re-emit
  // `output.constraintObject`, since engine doesn't emit
  // `meta.forward_constraint_object` in output blueprint, only
  // `trace.forwardedConstraint` boolean). Constraint Object stays propagated
  // downstream din upstream Energy Adjustment Hook 4 emission (batch 3) prin
  // orchestrator's existing currentCtx chain pentru batch 8 Deload.
  //
  // Missing upstream Constraint Object = INVALID_INPUT 'hard' severity halt
  // per ADR 030 §3.6 fail-safe Anti-Cascade Silent default.
  //
  // Default 0% — production behavior unchanged. Golden-master parity tests
  // legacy↔orchestrated zero-behavior-change strict in
  // `src/coach/orchestrator/__tests__/warmupParity.test.js`.
  // Ramp via _devFlags or explicit rollout edit aici post Daniel cont propriu
  // Faza 4 smoke validation orchestrated path comportament corect.
  warmup_via_orchestrator: { rollout: 0, default: false },

  // ── F3 Core-Intelligence layer (engine-wiring 2026-06-07) — additive,
  // compute-alongside, kill-switchable. Each defaults OFF (rollout 0) → with the
  // flag off the live per-exercise prescription is BYTE-IDENTICAL to today (the
  // calibration-sim hash + golden-master gate hold flag-OFF). Flip to ON is a
  // human gate (Daniel) AFTER reviewing the calibration-sim A/B. See
  // _ENGINE_WIRING_2026-06-07/F3_core_intelligence_spec.md.

  // #1 e1RM substrate (RISK HIGH — rewrites how per-exercise weight is decided).
  // When ON, the PR-floor (_demonstratedWorkingW) + find-your-weight demoW
  // compare loads in RIR-corrected e1RM space (Epley, R_CAP=12) instead of raw
  // kg, so high-rep work (60×12) no longer floors identically to 60×8. Within a
  // fixed rep band the back-solved kg is identical → golden-safe. Bodyweight/band
  // exercises are EXCLUDED (e1RM=null → today's raw-kg path). OFF → raw kg.
  dp_e1rm_v1: { rollout: 0, default: false },

  // #2 per-exercise Kalman strength latent (RISK MED — smooths an existing
  // signal). When ON, the demoW/PR-floor read a Kalman posterior `mu` over the
  // per-set e1RM (#1) instead of the raw max-of-logs, with a time-scaled process
  // noise so variance grows with time-since-last-set. Reuses the pure
  // kalmanUpdate1D from bayesianNutrition. Persists `dp-strength-posterior` (sync,
  // quota-guarded). OFF → raw e1RM (or raw kg if #1 also off). Depends on #1.
  dp_strength_kalman_v1: { rollout: 0, default: false },

  // #3 realistic ceiling + diminishing returns (RISK MED — Daniel HARD rule:
  // never prescribed stronger than physically real). When ON, a normalized
  // strength-standard e1RM ceiling (pattern × bodyweight × sex × training-age)
  // replaces the flat MAX_KG, and the gain-rate decays to 0 near the ceiling so a
  // climb mathematically cannot exceed it. OFF → flat MAX_KG (current). Depends
  // on #1 for the e1RM unit; degrades to a kg ceiling if #1 off.
  dp_ceiling_v1: { rollout: 0, default: false },

  // #4 cross-exercise transfer cold-start (RISK LOW — first-session-only). When
  // ON, a NEW exercise with no logs seeds its working load from a RELATED lift the
  // user already has e1RM for (equipment_alternatives → re-keyed SIMILAR_EXERCISES
  // → muscle match over the user's logged lifts), scaled by the similarity ratio,
  // in e1RM space (so the rep scheme normalizes). OFF → suggestStartWeight only
  // (current). Depends on #1's e1RM; degrades to suggestStartWeight when no related
  // e1RM exists. Only the first session of a new exercise (no history to regress).
  dp_transfer_coldstart_v1: { rollout: 0, default: false },

  // #5 per-user learned recovery (RISK MED — shifts the fatigue map / which days
  // + muscles get trained, path A). When ON, getMuscleState reads a per-muscle
  // recovery time-constant LEARNED from when the user's e1RM on that muscle's
  // lifts returns to baseline (sourced from the durable `logs`, NOT the D107
  // behavioral log), blended toward the global prior via a slow EMA and clamped to
  // [0.5x, 2x] of the global. Persists `dp-recovery-constants` (sync, quota-
  // guarded). OFF → the fixed MUSCLE_HEADS globals (current). Independent of #1.
  dp_learned_recovery_v1: { rollout: 0, default: false },

  // #6 intensity corridor as an e1RM band (RISK HIGH — directly bounds prescribed
  // kg BOTH ways). When ON, the periodization %1RM corridor {floor,ceiling} bounds
  // the implied %1RM of the prescribed load = (kg·(1+repTarget_eff/30))/mu: too
  // light → raised to floor, too heavy → lowered to ceiling. The real path-A+path-B
  // unify (F2 deferred it here pending e1RM). Applied as the LAST load step, EXEMPT
  // during a return-deload comeback. OFF / no corridor → no-op. Depends on #1 + #2
  // (needs mu). The last + riskiest sub-build — must ride green #1+#2 sims first.
  dp_intensity_corridor_v1: { rollout: 0, default: false },

  // ── F4 Adaptive layer (engine-wiring 2026-06-07) — guard/learning layers on
  // top of the F3 substrate. Each defaults OFF (rollout 0) → flag-off the live
  // per-exercise prescription is BYTE-IDENTICAL (the calibration-sim hash + golden
  // gate hold). Flip ON is a human gate (Daniel) AFTER reviewing the sim A/B. See
  // _ENGINE_WIRING_2026-06-07/F4_adaptive_layer_spec.md.

  // #6/B ego-jump cap (RISK LOW — only ever LOWERS a too-aggressive prescription
  // toward the proven working load, bounded below by the PR-floor so it cannot
  // crater). When ON, a USER-DRIVEN ego jump (logged load > rec × EGO_JUMP_RATIO)
  // that was THEN rated greu / missed reps caps the NEXT prescription at
  // rec × EGO_JUMP_RATIO and down-weights that set's calibration (so the inflated
  // kg doesn't bake into the factor). OFF → no cap (the existing SCALE-BACK /
  // EASE-BACK reactive brakes only). Independent of the F3 flags (works on raw kg;
  // sharper on the e1RM jump when dp_e1rm_v1 ON).
  dp_ego_cap_v1: { rollout: 0, default: false },

  // §B027/D-4 audit fix (D046 §3.4 REVERSE FIX+FLIP-ON pre-Beta) — Bayesian
  // Nutrition Kalman 1D enable. Daniel CEO directive verbatim 2026-05-21:
  // "PRIMER §2 brand-promise 'Kalman adaptive TDEE NU 2000 kcal hardcoded'
  // must be REAL working NU OFF+EWMA fallback false-FULL". processNoise
  // Hall 2008 derivation documented B026 commit + 90-day convergence
  // simulator R²>0.85 test B029 commit. Default 100% rollout pre-Beta.
  // Existing isKalmanFeatureFlagEnabled API preserved (caller-provided
  // flags arg takes precedence — test isolation + per-call override OK).
  bayesian_kalman_v1: { rollout: 1, default: true },
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
 * Defensive — returns null daca localStorage throws sau ambele missing.
 *
 * Per ADR 018 §5 Implementation notes: 'device-id' e UUID generated first run
 * in firebase.js. 'user-id' rezervat pentru future multi-tenant auth (per
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
      logger.warn(`[FeatureFlags] ${DEV_FLAGS_KEY} is not a plain object — ignoring`);
      return null;
    }
    return parsed;
  } catch {
    logger.warn(`[FeatureFlags] ${DEV_FLAGS_KEY} is not valid JSON — ignoring`);
    return null;
  }
}

/**
 * Determine whether a flag is enabled for a given user.
 *
 * Resolution order:
 *   1. _devFlags JSON override (dev only)
 *   2. Per-user hash bucketing — hash(userId + flagId) % 100 < rollout * 100
 *   3. Flag default (false daca flag unknown)
 *
 * @param {string} flagId - Flag identifier (must exist in FLAGS for non-default behavior)
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
