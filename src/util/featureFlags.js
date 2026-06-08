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

  // #8/D pain/injury per-exercise deprioritize (RISK MED — changes session
  // COMPOSITION, path A). When ON, repeated skip (durable synced `dp-exercise-pain`
  // counter, time-decayed) / recent pain-cdl report on a SPECIFIC exercise's muscle
  // demotes it in sessionBuilder.poolForGroup so a same-muscle sibling leads; never
  // a hard ban, never drops the last exercise for a muscle. OFF → empty penalty map
  // → byte-identical pool order (the existing muscle-GROUP pain handling only). No
  // F3 flag dependency. Reuses alternativeFinder/poolForGroup selection (no rebuild).
  dp_pain_deprioritize_v1: { rollout: 0, default: false },

  // #10/E learned per-gym equipment ladder (RISK LOW-MED — changes only the
  // GRANULARITY of a load step, bounded by the equipment snap's floor/ceiling). When
  // ON, the real available rungs are inferred from the user's DISTINCT logged loads
  // per exercise (modal gap = the gym's true increment) and refine getList →
  // getNextWeight/getPrevWeight/roundToEquipmentWeight; slow-converging (needs >=
  // LADDER_MIN_DISTINCT distinct loads) and ONLY refines FINER than the hard-coded
  // spacing (never coarsens). Persists `dp-equipment-ladder` (sync, quota-guarded).
  // OFF → the hard-coded table (byte-identical). No F3 flag dependency.
  dp_learned_ladder_v1: { rollout: 0, default: false },

  // #2/C plateau → intervention (RISK LOW-MED — the near_ceiling branch only
  // narrates + rotates a same-muscle variation, reversible, no kg crater; the
  // problem branch reuses an already-tested rep-shift / deload / variation path).
  // When ON, a stagnation (stagnationDetector >= PLATEAU_MIN_WEEKS) is classified
  // by classifyPlateau(mu, ceiling): near_ceiling → variation rotation (no deload),
  // problem → an escalating rep_shift→deload→variation intervention, midrange →
  // today's double-progression. OFF → no classification, no intervention
  // (byte-identical: the overlay is never reached). Depends on dp_ceiling_v1 for
  // the real EXPECTED/PROBLEM split (degrades to a flat-MAX_KG ceiling otherwise).
  dp_plateau_intervention_v1: { rollout: 0, default: false },

  // #3/F temperament: sandbagger vs grinder (RISK MED — deliberately discounts the
  // user's own rating, so a mis-detection could push a true grinder too hard → the
  // ceiling + the clamp band are the guards). When ON, a per-user RIR bias LEARNED
  // from rating-vs-(reps,load) patterns adjusts RATING_TO_RIR: a sandbagger's greu
  // is treated as having reserve (don't stall the climb), a grinder's usor as near
  // failure (don't over-climb). Slow EMA, clamped. Persists `dp-temperament` (sync,
  // quota-guarded). OFF → the global RATING_TO_RIR (byte-identical). Depends on
  // dp_e1rm_v1 (RIR is the lever it tunes); inert when e1RM is off.
  dp_temperament_v1: { rollout: 0, default: false },

  // #1/H active probing when uncertain (RISK MED-HIGH — deliberately prescribes a
  // single set ABOVE the smoothed mu to gather a high-information observation, so it
  // is bounded by the ceiling + ego-cap and gated to ONE set when FRESH only). When
  // ON, a wide Kalman posterior (sigma > SIGMA_PROBE_THRESHOLD) on a fresh
  // (readiness >= HIGH), non-hard last set offers a deliberate calibration test set
  // that shrinks sigma. OFF → no probe (byte-identical). Depends on
  // dp_strength_kalman_v1 (needs sigma; meaningless on raw kg).
  dp_active_probing_v1: { rollout: 0, default: false },

  // #4/I MPC — model-predictive progression (RISK HIGH — changes how the next load
  // is CHOSEN, path B). When ON, a small bounded set of candidate next-loads is
  // simulated forward N sessions through the SAME deterministic engine (the forward
  // model — no rebuild) under an assumed rating response and scored (e1RM gain
  // toward ceiling, penalized by oscillation / over-cap risk); the best candidate is
  // picked, but ONLY where it would change the greedy decision (common case → same
  // step, golden-safe). OFF → the greedy one-step double-progression (byte-identical).
  // Depends on dp_e1rm_v1 + dp_strength_kalman_v1 + dp_ceiling_v1 (its forward model).
  dp_mpc_v1: { rollout: 0, default: false },

  // ── F emphasis = specialization-phase (engine-wiring 2026-06-07) — wires the
  // EXISTING src/engine/specialization/ engine's already-computed volume_modifier
  // ({+30% target, +1 session, -25% others}, 4-week mesocycle) into session
  // COMPOSITION (path A — sets/exercises per group), which getDailyWorkout used
  // to DISCARD (it read only target_muscle_group). When ON, a user-picked
  // muscle-group EMPHASIS (focusPreset arms/chest/lower/upper/v-taper) routes its
  // primary group into the spec engine as the user-picked TARGET
  // (meta.userOverrideWeakGroup + auto-accept proposal), bypasses the persona/
  // phase eligibility gate (explicit opt-in — keeps the injury gate + MRV cap),
  // and CONSUMES the modifier: target rides applyWeaknessAmplification toward MRV
  // + the other groups relax to MEV (clamped, never below, never zero) via
  // applyEmphasisDeEmphasis. Phase-bounded to a 4-week mesocycle (auto-return).
  // OFF → no meta override is set + the de-emph helper is a no-op → the plan
  // composition is BYTE-IDENTICAL to today (the focus-bias path only). Changes
  // session COMPOSITION (path A), NOT per-exercise weight (path B) — the
  // calibration-sim hash is orthogonal + stays green flag-OFF. Flip ON is a human
  // gate (Daniel) AFTER review. See _ENGINE_WIRING_2026-06-07/
  // F_emphasis_specialization_spec.md.
  dp_emphasis_specialization_v1: { rollout: 0, default: false },

  // ── F6a Recovery/Fatigue-deepening cluster (engine-wiring 2026-06-08) — pure
  // signal detectors on top of the F3 substrate. Each defaults OFF (rollout 0) →
  // flag-OFF the live per-exercise prescription is BYTE-IDENTICAL (the
  // calibration-sim hash + golden gate hold). Flip ON is a human gate (Daniel)
  // AFTER reviewing the sim A/B. See
  // _ENGINE_WIRING_2026-06-07/F6a_recovery_fatigue_spec.md.

  // #26 sub-recovery from rating drift (RISK LOW — pure log read; narrates first,
  // never touches kg). When ON, detectSubRecoveryDrift flags EARLY systemic
  // under-recovery (greu-share rising at a matched working load across sessions,
  // or e1RM quietly suppressed at flat kg over >=2 muscle groups). The deload-
  // TIMING tier (feed a new candidate into the AA trigger) is DEFERRED behind the
  // PARTIAL deload-telemetry boundary (spec §7) — this build ships the pure
  // detector + the narration read only. OFF → the detector is never invoked →
  // byte-identical. Degrades to rating-drift-only when dp_e1rm_v1 is OFF.
  dp_subrecovery_drift_v1: { rollout: 0, default: false },

  // ── F6b Volume/Progress-intelligence cluster (engine-wiring 2026-06-08) —
  // volume + the SHAPE of progress: half path-A (sets), half narration of what
  // the engine already computes. Each defaults OFF (rollout 0) → flag-OFF the
  // deployed app is BYTE-IDENTICAL (calibration-sim hash + golden gate hold).
  // Flip ON is a human gate (Daniel) AFTER reviewing the sim/unit A/B. See
  // _ENGINE_WIRING_2026-06-07/F6b_volume_progress_spec.md.

  // V2 #14 rep-PR + volume-PR surfacing (RISK LOW — recognition only, never
  // alters a prescribed kg or set count). prEngine.detectPR ALREADY emits
  // weight|reps|volume; prRecordsWriteback collapsed it to a flat isPR boolean.
  // When ON, the writeback carries detection.type forward (set.prType) and the
  // badge renders a per-type i18n label so a rep/volume PR is first-class (the
  // PRs that keep coming for a near-ceiling user, where load-PRs dry up). OFF or
  // a set with no prType → today's flat " PR" badge → byte-identical.
  dp_rep_volume_pr_v1: { rollout: 0, default: false },

  // V3 #19 effective-reps / stimulus model (RISK LOW-MED — narration first).
  // effectiveReps(set) weights a set by proximity-to-failure via the existing
  // RATING_TO_RIR (dp.js:563): a set taken to failure ≈ full stimulus, a left-
  // in-the-tank set ≈ a fraction — quantifying the "junk volume" raw set-count
  // cannot see. Pure fn of the existing logs row (no new input, no persistence).
  // This build ships the pure estimator + the Progres narration read only; the
  // DOSE path (feed stimulusSets into the V1 landmark/session budget) is DEFERRED
  // (spec §2c.2 — needs V1 + a trim-only clamp). OFF → never computed → byte-
  // identical. Degrades to a neutral RIR=1 when no rating present.
  dp_effective_reps_v1: { rollout: 0, default: false },

  // V1 #10 learned MEV/MAV (RISK MED — path A, shifts how many sets a muscle gets).
  // Static landmarks today: ISRAETEL_BASELINES → computeMuscleVolumeTarget; every
  // user of the same persona/goal/experience gets the IDENTICAL MEV/MAV — no per-user
  // volume learning anywhere. When ON, learnVolumeLandmarks learns each muscle's
  // PERSONAL productive band from the user's own (weekly-sets → next-week-1RM-delta)
  // history: personalMAV = where progress saturates (junk volume past it), personalMEV
  // = where the muscle regresses (under-dosing). EMA-blended toward the Israetel prior
  // (alpha 0.3) + clamped to [0.6×, 1.6×] of the prior + the MRV hard cap + MEV floor
  // as guards (mirrors the F3 learned-recovery design 1:1). Pairs with V3: learns on
  // EFFECTIVE volume when dp_effective_reps_v1 is ALSO on, raw set count when off.
  // Persists `dp-learned-volume` (sync, muscle-keyed like dp-recovery-constants,
  // quota-guarded). OFF → computeMuscleVolumeTarget reads the static table → byte-
  // identical; the `?? baseline` fallback ALSO keeps any muscle with no learned data
  // byte-identical even when ON. The [0.6,1.6] clamp + alpha are DESIGN PROPOSALS
  // (spec §7) — sim sweep + Daniel review before flip (volume dose is a felt change).
  dp_learned_volume_v1: { rollout: 0, default: false },

  // V4 #15 auto-pivot near ceiling (RISK MED — PROPOSES a goal pivot, never auto-
  // switches: worst case is a dismissable banner). The classifier (classifyPlateau)
  // + the per-lift intervention (near_ceiling → variation rotation) already ship
  // behind dp_plateau_intervention_v1; this is the GOAL-level aggregation the audit's
  // #15 asks for — a thin new layer (proposeGoalPivot), NOT a rebuild. When ON,
  // nearCeilingShare aggregates the per-lift near_ceiling signal; when ≥ a broad
  // share of the user's main lifts are near their realistic ceiling AND a sustained
  // global stagnation persists, it PROPOSES switching off pure strength (→ hipertrofie
  // / recompozitie / sanatate, goals the table already supports). Reuses the entire
  // pushBackTiers re-prompt UX (evaluateReprompt) for the anti-spam cooldowns (28d
  // rolling / 60d post-goal-shift / 4-per-year cap) so it never nags. On accept the
  // consumer sets the goal (re-routing volume/intensity through the existing goal
  // modifiers); on decline → cooldown. Persists `dp-pivot-prompts` (sync — the
  // goal-shift anchor; phase-change-date records NUTRITION phase, NOT goal, so it
  // cannot double as the anchor). OFF → no aggregation, no proposal → byte-identical.
  // Depends on dp_ceiling_v1 for a real mu/ceiling split (degrades to a flat-MAX_KG
  // proximity otherwise). PIVOT_SHARE_THRESHOLD + the targets/wording are DESIGN
  // PROPOSALS (spec §7) — Daniel's product/UX call before flip. The live render-
  // surface wiring (the banner/modal consumer) is a UX moment DEFERRED for Daniel.
  dp_auto_pivot_v1: { rollout: 0, default: false },

  // V5 #27 trajectory planner (RISK LOW-MED — read-only narration; the module never
  // alters a prescription). goalForecast.projectLiftStrength already projects a per-
  // lift strength trajectory but is HONEST-yet-NAIVE: a pure linear slope + a flat 8%
  // cap that does NOT know the user's CEILING (can project past diminishing returns)
  // nor the GOAL (promises gains to a maintenance user). When ON, the projection
  // becomes ceiling-aware + goal-aware: the flat % cap is replaced by a per-week
  // DECAYED walk from current mu toward the ceiling (gainDecay) so the 8-week arc
  // ASYMPTOTES instead of extrapolating a straight line and can NEVER exceed the
  // realistic ceiling (the Eddie-Hall rule applied to narration); a maintenance goal
  // projects "hold ~current", not gains. The existing honesty guards (≥3 sessions,
  // flat/declining → no forecast) are untouched — it only makes a SHOWN forecast more
  // realistic, never invents one. The I/O boundary derives bw/sex/trainingAge/goal +
  // the ceiling and injects them; the pure math stays flag-free. NO new persistence.
  // OFF → the linear + flat-% math + the 4-week horizon (byte-identical). Depends on
  // dp_ceiling_v1 conceptually (degrades to today's flat-cap linear when the ceiling
  // is unusable — the forecast just stays naive, never breaks). The 8-week horizon is
  // a DESIGN PROPOSAL (spec §7) — Daniel sanity check before flip. LOWER over-promise
  // risk than today's uncapped linear (the ceiling clamp reduces it).
  dp_trajectory_v1: { rollout: 0, default: false },

  // #20 per-set fatigue curve (RISK LOW-MED — nudges SET COUNT by +/-1 within the
  // existing clamp, never kg). When ON, learnFatigueCurve classifies a user-per-
  // exercise as a MAINTAINER (flat curve → +1 working set) vs a CRASHER (early
  // drop-off → -1, never below 1 working set) from the within-session reps-vs-set
  // curve at a fixed load, EMA-smoothed. fatigueSetsAdjust feeds the SAME setsAdjust
  // channel _returnDeload uses — no new schedule plumbing. Persists `dp-fatigue-
  // curve` (sync, name-keyed, quota-guarded). OFF → the learner is never invoked +
  // setsAdjust 0 → byte-identical distributeGroupSets. Degrades to raw-reps drop-off
  // when dp_e1rm_v1 is OFF.
  dp_fatigue_curve_v1: { rollout: 0, default: false },

  // #5 ACWR readiness (RISK MED — adjusts the readiness SCORE, an existing driver,
  // path B). When ON, computeACWR (the rolling acute:chronic workload ratio, reusing
  // getMuscleState's per-set stress kernel + getLaggingMuscles' rolling-sum) adds an
  // ADDITIVE penalty to getReadinessScore on a systemic VOLUME SPIKE (ACWR > HIGH)
  // BEFORE the [10,100] clamp, so a "you feel fine but you've been piling on volume"
  // day crosses the existing <60 hold. One-way (only ever LOWERS toward the hold) +
  // bounded (penalty capped) → it can never crater kg. The deload-TIMING tier (a new
  // AA candidate) is DEFERRED behind the PARTIAL deload-telemetry boundary (spec §7).
  // OFF → no ACWR read, no term → byte-identical readiness score. Independent of #1.
  // UNVERIFIED thresholds (spec §7) — Daniel/research review before flip.
  dp_acwr_readiness_v1: { rollout: 0, default: false },

  // #30 weekly volume distribution by recovery (RISK MED — changes WHICH DAY a
  // group is trained, path A scheduling; never kg). When ON,
  // allocateWeeklyVolumeByRecovery re-skins the EXISTING M1 redistribution at the
  // WEEK level: a group whose recovery window has not elapsed (partial/fatigued)
  // defers its excess weekly budget to the groups that ARE fresh (room-to-MRV
  // weighted), conserving the week's TOTAL volume + MEV/MRV bounds (never below MEV,
  // never above MRV, never zeroes a trained group). OFF → the allocator is never
  // invoked → the positional split + intra-day M1 path run as today → byte-identical
  // composition. Even ON, an all-recovered / no-history week self-no-ops to a clone.
  dp_weekly_recovery_alloc_v1: { rollout: 0, default: false },

  // #32 detraining vs deload vs life-dip classifier (RISK MED-HIGH — the LIFE_DIP
  // branch SUPPRESSES a deload, so a mis-classification could let a fatigued user
  // grind; the ACWR-HIGH-forces-FATIGUE guard is the safety). When ON,
  // classifyPerformanceDip FUSES the already-computed _returnDeload (gap) +
  // computeACWR (#5) + detectSubRecoveryDrift (#26) + fatigue.js sleep/notes +
  // closed-days/kcal into one class and only RE-ROUTES among responses that already
  // exist (ramp / deload / hold). Its only NEW behavior is the LIFE_DIP branch
  // swapping an over-reactive deload for a HOLD when the cause is lifestyle (low
  // volume + bad sleep/missed/under-eating), never pushing harder than today. The
  // deload-suppression WIRING into the live session is DEFERRED behind the PARTIAL
  // deload-telemetry boundary (spec §7) — this ships the pure classifier. Degrades
  // to gap-vs-fatigue only (no LIFE_DIP) when #5/#26 are OFF (null inputs). OFF →
  // never called → _returnDeload + the deload hierarchy + the <60 hold run
  // independently as today → byte-identical.
  dp_dip_classifier_v1: { rollout: 0, default: false },

  // ── F6c Personalization cluster (engine-wiring 2026-06-08) — a thin layer that
  // SPENDS the F3 substrate (Kalman {mu,sigma}, ceiling, learned recovery, the
  // nutrition phase) on personalization beyond the population. Each defaults OFF
  // (rollout 0) → flag-OFF the deployed app is BYTE-IDENTICAL (the calibration-sim
  // hash + golden gate hold). Flip ON is a human gate (Daniel) AFTER reviewing the
  // sim/unit A/B. See _ENGINE_WIRING_2026-06-07/F6c_personalization_spec.md.

  // #31 trend-vs-noise (RISK LOW — re-classifies an existing branch input; cannot
  // change a load directly). The Kalman posterior already rejects a single bad day
  // (HIGH R), but the trend is never made EXPLICIT as a direction: legacy isStagnant
  // (dp.js) only checks raw-kg equality over the last 3 logs — rep-scheme-blind and
  // unable to distinguish a real downtrend from one bad day. When ON, trendDirection
  // folds the recent per-set e1RM through the SAME posterior and a direction is only
  // confident UP/DOWN when the net mu move clears its own noise band (TREND_Z·sigma);
  // a confidently CLIMBING lift is then NOT treated as stagnant (the +SET/technique
  // rescue is suppressed). OFF → the raw-kg equality test runs unchanged (byte-
  // identical). Reads the existing dp-strength-posterior; no new persistence. TREND_Z
  // is a DESIGN PROPOSAL (spec §9) — Daniel/sim sanity-check before flip. Degrades to
  // FLAT/unconfident (legacy path) when the Kalman fold yields nothing (cold start).
  dp_trend_signal_v1: { rollout: 0, default: false },

  // #33 population-prior cold-start (RISK LOW — first-session-only, no related lift).
  // F3 #4 transfer seeds a NEW lift from a RELATED one the user already has e1RM for;
  // #33 fires when there is NONE (a truly new user, first ever lift). A SHIPPED static
  // POPULATION_E1RM_PRIOR table (e1RM as a multiple of bodyweight per movement pattern
  // × sex × experience, keyed via the ceiling's classifyPattern) seeds the working kg
  // with a WIDE sigma (population guess — the first real set dominates fast). PRIVACY
  // (Daniel hard rule): an on-device static lookup from the user's OWN onboarding
  // sex/BW/experience only — NO data collection, NO server call, NO cohort telemetry;
  // a constant in the bundle, privacy-safe by construction. OFF → transfer-then-
  // suggestStartWeight (F3 behavior) → byte-identical. The table values are DESIGN
  // PROPOSALS (spec §9) — research/Daniel review before flip. No new persistence.
  dp_population_prior_v1: { rollout: 0, default: false },

  // #37 deficit-aware progression throttle (RISK MED — changes the climb RATE for
  // cutting users; never touches the PR-floor). D109 already encodes "in a deficit
  // preserve, don't push" in the deload engine; #37 extends it to the dp.js weight-
  // climb, which is phase-blind today (pushes for PRs the same in a deep cut as a
  // bulk). When ON, the already-resolved nutrition phase (resolveActivePhase →
  // CUT|BULK|MAINTENANCE|STRENGTH, threaded in read-only via opts — dp.js never
  // imports nutrition) scales the pure-easy-run NEW-max climb via deficitClimbFactor
  // (CUT throttles, others 1.0) and reframes a CUT hold as success (suppresses the
  // problem-plateau +SET on a near-cap cut). The PR-floor / catch-up to an already-
  // OWNED load is NEVER throttled — a deficit must not crater capacity. OFF →
  // deficitClimbFactor returns 1.0 + the reframe is inert → byte-identical. Absent
  // phase (cold start) → MAINTENANCE → no throttle. The CUT factor is a DESIGN
  // PROPOSAL (spec §9). Daniel-flag (it embodies the D109 product rule). No new
  // persistence.
  dp_deficit_throttle_v1: { rollout: 0, default: false },

  // #21 strength/bodyweight + cut/bulk aware (RISK MED — shifts the fatigue map for
  // users whose bodyweight is changing, path A; bounded by the existing recovery
  // clamp + slow EMA). relativeStrength(mu, bw) = mu/bw is a one-line derivation from
  // the ceiling's already-BW-normalized values (narration / correct plateau
  // attribution — does not move kg). The kg-affecting half: when bodyweight DROPS (a
  // cut) the same absolute e1RM is HIGHER relative strength but recovery + volume
  // tolerance FALL; when it RISES (a bulk) tolerance rises. A sustained bodyweight
  // trend nudges the EXISTING learned-recovery EMA (muscleMap.js learnRecovery) toward
  // the LONGER end of its [0.5×,2×] clamp in a cut, shorter in a surplus — no new
  // clamp, REUSE the existing band; volume tolerance then follows automatically (the
  // fatigue map → set counts). OFF → relativeStrength computed-but-unused + the EMA
  // gets no BW nudge → byte-identical. Composes with #37 (both read the phase) but is
  // independently flagged. Depends on F3 #2 (mu) + #5 (recovery EMA). No new
  // persistence (reuses dp-recovery-constants). Optional Daniel-flag.
  dp_strength_bw_ratio_v1: { rollout: 0, default: false },

  // #35 age-scaled tendon load-rate cap (RISK MED — slows LOAD progression for
  // older users; bounded — only caps the up-step, never the PR-floor). gainDecay
  // throttles the climb by the MUSCULAR ceiling; this is a SECOND, ORTHOGONAL
  // throttle keyed on CHRONOLOGICAL onboarding age (NOT trainingAge — ageFraction
  // is training-age and does NOT provide this cap), because connective tissue
  // (tendon/ligament) adapts slower than muscle and the gap widens with age
  // (Daniel's explicit "65 vs 30 differ" rule). When ON, tendonLoadRateCap(ageYears)
  // caps the per-session NEW-max load-increase FRACTION (composed MIN-style with
  // gainDecay + the deficit factor at the easy-run/CATCH-UP climb), threaded read-
  // only via opts.ageYears — dp.js never reads onboarding. The belowDemo catch-up to
  // an already-OWNED load is NEVER capped; the PR-floor is applied separately after.
  // OFF → tendonLoadRateCap returns 1.0 (no cap) → byte-identical. Absent/invalid age
  // → neutral 1.0 (a cold-start user is never penalized). The age knots + floor
  // fraction are DESIGN PROPOSALS (spec §9) — research/Daniel sanity-check before
  // flip (the shape is verified physiology, the numbers tunable). Daniel-flag (he
  // named the 65-vs-30 rule). No new persistence (curve = code constant).
  dp_tendon_cap_v1: { rollout: 0, default: false },

  // #12 stimulus-per-minute optimizer (RISK MED — changes WHICH tail exercise is
  // dropped by the time-budget trim; never the front, never below floor). The
  // trimSessionToTimeBudget drop is BLIND tail-first today (positionally-last),
  // optimizing priority order NOT training-value-per-minute — the "27-min legs"
  // complaint (a short day can lose a high-stimulus compound to a low-density
  // isolation just because it sits later). When ON, the DROP step removes the
  // LOWEST stimulus-per-minute candidate among the TRIMMABLE TAIL (positions at/
  // beyond MIN_EXERCISES_FLOOR — the FRONT priority/weak prefix is never a drop
  // candidate), so the remaining session is DENSER. stimulusScore reuses signals
  // already loaded (compound-vs-isolation via COMPOUND_EX + muscle-target breadth
  // via getExerciseMetadata) — NO new data source, NO persistence (pure transform).
  // A density tie → the positionally-last (legacy ordering preserved). OFF → strict
  // tail-first (out.pop) → byte-identical; the front/weak/priority protection + all
  // floors (>=4 ex / >=2 sets / >=25min / compound idx-0 >=3) are UNCHANGED in both
  // modes. The stimulusScore weighting is a DESIGN PROPOSAL (spec §9) — Daniel/
  // research sanity-check before flip (the shape is verified, the constants tunable).
  dp_stimulus_per_min_v1: { rollout: 0, default: false },

  // #34 N-of-1 self-experiment (RISK HIGH — deliberately perturbs prescription to
  // learn the user's OWN response; the guardrails are the safety envelope). The
  // MEASUREMENT half is fully REUSED from #31 (trendDirection's noise-aware Kalman
  // slope). A deliberately SMALL, infrequent, opt-in micro-block A/B on ONE
  // established lift: arm A (+sets/lower intensity) then arm B (−sets/higher) over
  // short equal blocks, slopes compared noise-aware (winner only when the slope diff
  // clears Z·sigma), the winner KEPT as a per-lift preference (dp-nof1-preference,
  // synced, EN-name-keyed) that biases that lift's future SET COUNT by ±1 (the
  // existing setsAdjust channel, clamped to the schedule MIN floor — never an unsafe
  // load; the kg is untouched; ego/anomaly caps still apply). MANDATORY guardrails:
  // never in a CUT (deficit confounds), never a beginner (no baseline), never >1 lift
  // at once, ALWAYS reversible (a null preference == today's behavior, the OFF-
  // equivalent even when ON). When ON, the consumer reads the kept preference + adds
  // the bias; OFF → never read + the bias is never applied → byte-identical. The
  // confounding controls + the micro-block length + the significance Z are DESIGN
  // PROPOSALS (spec §5d/§9) — sim sweep + Daniel review before flip. The LIVE auto-
  // scheduling of arms across sessions (advancing the in-flight counter during a
  // real session) is the fragile, confounding-sensitive part — shipped as a pure
  // orchestrator (advanceExperiment) whose live-session wiring is DEFERRED for
  // Daniel's review (the consumer-bias half IS fully wired). New persistence:
  // dp-nof1-preference (EN-name-keyed sync) + dp-nof1-experiment (in-flight state,
  // sync). Daniel-flag (the most novel + moat-personalization item).
  dp_nof1_v1: { rollout: 0, default: false },

  // §B027/D-4 audit fix (D046 §3.4 REVERSE FIX+FLIP-ON pre-Beta) — Bayesian
  // Nutrition Kalman 1D enable. Daniel CEO directive verbatim 2026-05-21:
  // "PRIMER §2 brand-promise 'Kalman adaptive TDEE NU 2000 kcal hardcoded'
  // must be REAL working NU OFF+EWMA fallback false-FULL". processNoise
  // Hall 2008 derivation documented B026 commit + 90-day convergence
  // simulator R²>0.85 test B029 commit. Default 100% rollout pre-Beta.
  // Existing isKalmanFeatureFlagEnabled API preserved (caller-provided
  // flags arg takes precedence — test isolation + per-call override OK).
  bayesian_kalman_v1: { rollout: 1, default: true },

  // #6 library canonical-alias writeback (RISK MED — touches the name-keying
  // boundary every name-keyed engine store reads). The alias map + chains-as-data
  // are ALWAYS-ON DATA (pure resolution + the deterministic substitution source);
  // this flag gates ONLY the BEHAVIORAL half: routing the persisted log key
  // through resolveCanonical in the workout writeback. The intent is to stop the
  // b32abac3 strand class (a log written under an RO/legacy display name is found
  // by the engine under the EN canonical). Gated default-OFF because resolving on
  // the WRITE side without the engine READ side (DP.getLogs) also resolving would
  // split a history mid-stream for a caller that feeds the engine an UNRESOLVED
  // name on the read side (the calibration-sim does exactly this with its legacy
  // synonym profile names). In production the screen passes the SAME engineName to
  // both the writeback and DP.recommend, so they already agree — flipping this ON
  // only HELPS the legacy/RO-display fallback path and never the canonical path.
  // OFF → engineKey derivation is byte-identical to pre-#6 (ex.engineName ??
  // ex.exerciseName, unresolved) → determinism hash + sim unchanged.
  dp_library_chains_v1: { rollout: 0, default: false },
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
