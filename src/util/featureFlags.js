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
  // (2026-06-10 full-audit cleanup: the 8 retired coachDirector-strangler flags
  // — aa_via_cluster + the 7 *_via_orchestrator — were DELETED. They gated a
  // path that no longer exists: the live React path (getDailyWorkout.js →
  // runPipeline) invokes the engines directly and unconditionally. NOTE:
  // runPipeline/adapters/contextBuilder in src/coach/orchestrator/ are LIVE.)

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
  dp_e1rm_v1: { rollout: 1, default: true },

  // #2 per-exercise Kalman strength latent (RISK MED — smooths an existing
  // signal). When ON, the demoW/PR-floor read a Kalman posterior `mu` over the
  // per-set e1RM (#1) instead of the raw max-of-logs, with a time-scaled process
  // noise so variance grows with time-since-last-set. Reuses the pure
  // kalmanUpdate1D from bayesianNutrition. Persists `dp-strength-posterior` (sync,
  // quota-guarded). OFF → raw e1RM (or raw kg if #1 also off). Depends on #1.
  dp_strength_kalman_v1: { rollout: 1, default: true },

  // #3 realistic ceiling + diminishing returns (RISK MED — Daniel HARD rule:
  // never prescribed stronger than physically real). When ON, a normalized
  // strength-standard e1RM ceiling (pattern × bodyweight × sex × training-age)
  // replaces the flat MAX_KG, and the gain-rate decays to 0 near the ceiling so a
  // climb mathematically cannot exceed it. OFF → flat MAX_KG (current). Depends
  // on #1 for the e1RM unit; degrades to a kg ceiling if #1 off.
  dp_ceiling_v1: { rollout: 1, default: true },

  // #4 cross-exercise transfer cold-start (RISK LOW — first-session-only). When
  // ON, a NEW exercise with no logs seeds its working load from a RELATED lift the
  // user already has e1RM for (equipment_alternatives → re-keyed SIMILAR_EXERCISES
  // → muscle match over the user's logged lifts), scaled by the similarity ratio,
  // in e1RM space (so the rep scheme normalizes). OFF → suggestStartWeight only
  // (current). Depends on #1's e1RM; degrades to suggestStartWeight when no related
  // e1RM exists. Only the first session of a new exercise (no history to regress).
  // FLIPPED ON 2026-06-11 (gym-log arc): the swap-coldstart hole from Daniel's
  // real session (DB Shoulder Press history 22.5 → swap Seated DB Press came back
  // a generic 30 coldstart) traced HERE — the transfer path existed but was
  // dormant. Safe to light now: getSimilarityMultiplier is equipment/unit-aware
  // (DB per-hand ↔ BB total ×0.4/×2.5, anchored on Daniel's real DB30↔BB60).
  dp_transfer_coldstart_v1: { rollout: 1, default: true },

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

  // W-Goal — coherent STRENGTH goal (RISK HIGH — makes goal=forta a REAL strength
  // prescription, not hypertrophy-with-long-rest). ONE flag that flips BOTH levers
  // atomically: (a) UNCLAMP the rep floor — for an e1RM-eligible barbell COMPOUND,
  // the goal rep band's low (forta [3,8]) is honored below the per-exercise
  // REP_RANGES default [8,12] (today max(8,3)=8 erases it → forta ≡ hipertrofie on
  // every main lift); (b) turn the %1RM intensity corridor ON for that same path so
  // the lower reps ride the HEAVIER {0.78,0.90} load — never lower reps at a
  // hypertrophy load (incoherent). Only forta's band has a low < default, so other
  // goals (hipertrofie [8,12] etc.) are byte-identical even with the flag ON; the
  // corridor is also still inert at cold-start (needs Kalman mu). Subsumes #6's
  // corridor for the forta compound path. Needs #1 + #2 (mu). OFF → BYTE-IDENTICAL
  // (forta still floors to 8, corridor stays gated by #6 alone). Human gate (Daniel).
  dp_strength_goal_v1: { rollout: 1, default: true },

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

  // #65 log OUTLIER detector vs the user's OWN posterior band (RISK MED — changes
  // WHAT the engine learns from, path B). When ON, a logged set whose RIR-corrected
  // e1RM is > OUTLIER_Z (4) std-devs ABOVE the user's mature Kalman posterior mu (a
  // likely over-log / typo the coarse fat-finger guard misses) is EXCLUDED from the
  // two learning steps — _recordCalibration/_recordSessionBias (calibrationSafe gate)
  // + the Kalman posterior fold — but KEPT in `logs` VERBATIM and recorded to a
  // reversible dp-log-quarantine ledger ("asta a fost real" re-feeds via the existing
  // userConfirmed path). UPPER-tail only (an under-log is real fatigue). Fires only
  // when the posterior is mature (n >= OUTLIER_MIN_N). OFF → never called →
  // byte-identical. ON-but-dp_strength_kalman_v1-OFF → no posterior → degrades to the
  // fat-finger guard only (still safe, just not personalized). Distinct from the ×10
  // fat-finger guard (anomalyGuard.sanityCheckSet) which is a physical/typo check.
  dp_log_outlier_v1: { rollout: 0, default: false },

  // #8/D pain/injury per-exercise deprioritize (RISK MED — changes session
  // COMPOSITION, path A). When ON, repeated skip (durable synced `dp-exercise-pain`
  // counter, time-decayed) / recent pain-cdl report on a SPECIFIC exercise's muscle
  // demotes it in sessionBuilder.poolForGroup so a same-muscle sibling leads; never
  // a hard ban, never drops the last exercise for a muscle. OFF → empty penalty map
  // → byte-identical pool order (the existing muscle-GROUP pain handling only). No
  // F3 flag dependency. Reuses alternativeFinder/poolForGroup selection (no rebuild).
  dp_pain_deprioritize_v1: { rollout: 1, default: true },

  // #64 PERSISTENT pain memory + proactive substitution (RISK MED — changes
  // session COMPOSITION, path A: it SWAPS a pinned exercise, not just demotes).
  // When ON, a user-PINNED painful exercise (durable, non-decaying dp-pain-memory
  // store) is PROACTIVELY REPLACED in sessionBuilder.poolForGroup with its
  // persisted curated chain substitute (getTransferSources, skip-re-irritating-
  // region), until the user clears the pin ("Nu ma mai doare"). Never the
  // last-for-a-muscle (the pool's last-option guard holds); no suitable substitute
  // → falls back to the existing DEMOTE. OFF → painSwaps null → byte-identical pool
  // order (the decaying dp_pain_deprioritize_v1 demote rides its OWN flag,
  // unchanged). Also threads the pain flag into dp.js load-transition reason
  // derivation (#75) so a pinned exercise's load drop reads reason='pain' →
  // open-ended window. Reuses getTransferSources / poolForGroup (no rebuild).
  dp_pain_memory_v1: { rollout: 1, default: true },

  // #10/E learned per-gym equipment ladder (RISK LOW-MED — changes only the
  // GRANULARITY of a load step, bounded by the equipment snap's floor/ceiling). When
  // ON, the real available rungs are inferred from the user's DISTINCT logged loads
  // per exercise (modal gap = the gym's true increment) and refine getList →
  // getNextWeight/getPrevWeight/roundToEquipmentWeight; slow-converging (needs >=
  // LADDER_MIN_DISTINCT distinct loads) and ONLY refines FINER than the hard-coded
  // spacing (never coarsens). Persists `dp-equipment-ladder` (sync, quota-guarded).
  // OFF → the hard-coded table (byte-identical). No F3 flag dependency.
  // FLIPPED ON 2026-06-11 (gym-log arc): refine-only (never coarsens) and slow —
  // safe; pairs with the NEW template layer below for full ladder snapping.
  dp_learned_ladder_v1: { rollout: 1, default: true },

  // Equipment-ladder TEMPLATE layer (gym-log arc 2026-06-11, Daniel: "daca omu
  // logheaza x, sa stie ca aparatul are greutatile y"). Per-USER per-EXERCISE:
  // logged weights accumulate as observations (`dp-equipment-obs`); 2-3 distinct
  // values matching a COMMON commercial stack/dumbbell/plate template (
  // equipmentTemplates.js — Daniel's gym seeded the first three) resolve the
  // WHOLE ladder instantly, and rounding snaps to real rungs (Lat Pulldown 60 →
  // 59 on his 10lb stack). Precedence: curated (future photo) > matched template
  // > the generic rounding (untouched fallback). OFF → byte-identical.
  dp_equipment_ladder_v1: { rollout: 1, default: true },

  // dp_accessory_rotation_v1 (2026-06-11, Daniel "monotonia tampa") — ANCHOR/
  // ACCESSORY rotation. On a mature account everything is logged → PR-stickiness
  // made every week identical. Policy: anchors (tier-1 compounds) REPEAT,
  // accessories (tier 2-3 isolations) ROTATE weekly. sessionBuilder.poolForGroup
  // alternates the top two equal-ish LOGGED isolations on the ISO-week parity
  // (derived from the existing seed `uid|weekStartIso|dayIdx`, NOT Date.now()).
  // Refusal/structural demotes stay stronger (a demoted lift is never a rotation
  // candidate). OFF → byte-identical pool order.
  dp_accessory_rotation_v1: { rollout: 1, default: true },

  // dp_rotation_intraweek_v1 (2026-06-12, isolation-rotation arc — extends the
  // CROSS-week dp_accessory_rotation_v1 to the INTRA-week dimension). The sweep
  // flagged 43 "repetate adiacent" signals: ADJACENT training days repeat the SAME
  // exercises. Founder verdict: ANCHORS (logged DP-tracked lifts + tier-1 compounds)
  // repeat BY DESIGN (DP continuity needs stable anchors), but UNLOGGED isolations of
  // equal-ish standing should VARY on adjacent days. When ON, sessionBuilder.poolForGroup
  // rotates the top equal-ish UNLOGGED isolation head by the training-day ordinal WITHIN
  // the week (intraWeekDayOrdinal, derived from the active-week split — NOT Date.now()),
  // so consecutive training days surface a DIFFERENT equivalent-role variant of the same
  // family. SAFE SET = unlogged only (no DP history to disrupt; cold-start seeds transfer
  // cleanly via the fixed transfer layer); a LOGGED isolation is an anchor and STAYS.
  // Never violates refusal/structural demotes, the focus contracts, PR-protection, or the
  // maintenance floors; when no equivalent exists the repeat STAYS (a repeat beats a worse
  // lift). Runs BEFORE the cross-week dp_accessory_rotation_v1 head-swap on a DISJOINT set
  // (unlogged vs logged), so the two never interact. OFF → byte-identical pool order.
  dp_rotation_intraweek_v1: { rollout: 1, default: true },

  // Warm-up ramp (gym-log arc 2026-06-11, design-pass deferred item). The opening
  // tier-1 compound gets REAL warm-up sets (50%×10 → 70%×6 → 90%×3, depth by
  // working load: <25 none / <40 one / <60 two / else three), snapped on the
  // exercise's own equipment ladder, threaded ADDITIVELY as warmup.warmupSets
  // (engine warmupRamp.js → compose.ts → WorkoutPreview discreet line). Primers
  // are not working sets: no volume/PR/log impact. OFF → field omitted →
  // byte-identical.
  dp_warmup_ramp_v1: { rollout: 1, default: true },

  // #42 progression-conditioned selection bonus (gym-log arc 2026-06-11). The
  // blanket "+20 for anything logged" was MEASURED harmful (full-path convergence
  // 13.6%→1%, craters 53→69) and refused; THIS is the conditional form: only
  // exercises with a REAL upward e1RM trend (3%+ over the last 5 exposures, >=3
  // sets, single bad day tolerated) earn a +5 selection bonus — under the +10
  // log-bonus, can never jump a tier band. PROBE-GATED at the validation burst
  // (same metrics as the historical refusal); flipped down if the cohort regresses.
  dp_progression_bonus_v1: { rollout: 1, default: true },

  // #43 demonstrated-base lookback (gym-log arc 2026-06-11). The demonstrated
  // working base read ONE session (last-session-only) — a single weak day reset
  // the base (his real Lat Pulldown 45 case). Now: max-of-medians over the last
  // 3 distinct sessions, clamped to +5% above the LATEST session (a long layoff
  // still lowers the base WITH the user — never forces an old number instantly).
  dp_base_lookback_v1: { rollout: 1, default: true },

  // Recovery window stretched by DOSE × UNACCUSTOMEDNESS (gym-log arc 2026-06-11,
  // Daniel live: "legs fresh" per Andura, real = lingering DOMS after a big-volume
  // session + a long no-legs gap). The flat per-head window scales ×[1.0..1.8]:
  // dose (session sets vs the user's typical, cap 1.6) × unaccustomed (days since
  // the PREVIOUS exposure, ramp 10→21d, cap 1.4). Typical dose on an accustomed
  // muscle → ×1.0 EXACT (the QA-F9 K=1.8 anchors hold byte-identically). Stretch-
  // only — never makes a muscle look fresher than reality.
  dp_recovery_dose_v1: { rollout: 1, default: true },

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

  // #59 D107 behavioral-log distillation → per-user rating-semantic offset (RISK
  // MED — discounts the user's own rating, like temperament; the clamp band + the
  // ceiling/PR-floor are the guards). The D107 behavior log (durable per-UID IDB
  // `behavior_tier1`) is COLLECTED but DARK — no engine reads it. When ON, a
  // periodic on-device (NO LLM) PURE distillation mines the SEMANTIC events only
  // (`rec` shown vs `log` committed — `tap` debug noise is EXCLUDED) for the
  // rating↔behavior mismatch UNIQUE to this log (the user rates greu yet ENTERED
  // more than prescribed + hit top reps → their greu has reserve), folds it into a
  // single per-user RIR offset (slow EMA, clamped, MIN_PAIRS floor), and
  // dp._rirFromRpe ADDS it to RATING_TO_RIR (composes with the temperament bias,
  // each on its own flag). Persists `dp-behavior-tuning` (fixed-key object, synced
  // per-UID — NOT name-keyed). OFF → the distillation never runs + the consumer
  // reads no offset → byte-identical (the calibration-sim cohort has no behavior
  // log, so even ON it is neutral on the sim). Deterministic (the only time used is
  // each event's own `t`). This is the FIRST distilled signal; the loop is
  // extensible (a sibling field in distillBehavior). Daniel-flag.
  dp_behavior_distill_v1: { rollout: 0, default: false },

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
  dp_emphasis_specialization_v1: { rollout: 1, default: true },

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
  dp_effective_reps_v1: { rollout: 1, default: true },

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
  dp_learned_volume_v1: { rollout: 1, default: true },

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
  // FLIPPED ON 2026-06-12 — Daniel live (post sweep audit): "forta nu creste la fel
  // de repede la infinit" = the sanity check the flip was waiting for. The naive
  // linear+flat-cap path he saw ("~105.3 in ~4 wks" while cutting) is exactly the
  // over-promise this kills: decayed walk to the ceiling + cut/maintenance holds.
  dp_trajectory_v1: { rollout: 1, default: true },

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
  dp_acwr_readiness_v1: { rollout: 1, default: true },

  // #30 weekly volume distribution by recovery (RISK MED — changes WHICH DAY a
  // group is trained, path A scheduling; never kg). When ON,
  // allocateWeeklyVolumeByRecovery re-skins the EXISTING M1 redistribution at the
  // WEEK level: a group whose recovery window has not elapsed (partial/fatigued)
  // defers its excess weekly budget to the groups that ARE fresh (room-to-MRV
  // weighted), conserving the week's TOTAL volume + MEV/MRV bounds (never below MEV,
  // never above MRV, never zeroes a trained group). OFF → the allocator is never
  // invoked → the positional split + intra-day M1 path run as today → byte-identical
  // composition. Even ON, an all-recovered / no-history week self-no-ops to a clone.
  dp_weekly_recovery_alloc_v1: { rollout: 1, default: true },

  // #71 coherent weekly volume allocation (engine-wiring 2026-06-08) (RISK MED —
  // changes the per-EXERCISE set count, path A; never kg). Today buildSession sizes
  // each group's per-session budget as weekly/freq, then splits it across HOWEVER
  // MANY exercises that day's cluster gave the group — so the SAME lift swings (Lat
  // Pulldown 3 on a Pull day where back gets 4 slots, 4-5 on an Upper day where back
  // gets 2), and the catch-all overlap "Upper" day balloons its few slots into 5-set
  // presses (DIAG #3 incoherent-weekly-allocation). When ON, coherentDayBudget pins a
  // STABLE per-exercise dose = (weekly/freq) / expectedExercisesPerSession (the SAME
  // sizing computeSessionExerciseCount uses) and hands distributeGroupSets dose ×
  // actualExercisesThisDay, so each exercise lands at ~dose regardless of the day's
  // slot count → consistent day-to-day, weekly total conserved. OFF → the legacy
  // weekly/freq budget → byte-identical composition (calibration-sim hash orthogonal:
  // path A, not the dp.js path-B kg). Flip ON is a human gate (Daniel) AFTER the sim
  // A/B. See _DIAG_session_composition_2026-06-08.md #3 + _ENGINE_volume_policy §71.
  dp_coherent_weekly_alloc_v1: { rollout: 1, default: true },

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
  dp_population_prior_v1: { rollout: 1, default: true },

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
  dp_deficit_throttle_v1: { rollout: 1, default: true },

  // #76 energy → VOLUME / RIR / deload modulation (magnitude-aware) (RISK MED —
  // changes session SET-VOLUME + the RIR display band for cutting/bulking users,
  // path A; NEVER the prescribed kg). #37 (dp_deficit_throttle_v1) only throttles
  // the LOAD CLIMB RATE on the binary phase; #76 is the DEEPER half Daniel flagged:
  // it consumes the deficit/surplus MAGNITUDE (the coherent kcal-shift as a fraction
  // of maintenance, resolveEnergyMagnitude → energyVolumeFactor) and modulates the
  // SESSION — cutting weekly/session volume −15% (mild deficit) toward −30% (deep
  // deficit) per _ENGINE_volume_policy §11, pushing RIR further from failure
  // (recovery impaired), and biasing deloads more often; a surplus mirrors it
  // (small extra volume tolerance toward +10%, MRV-bounded, train slightly closer
  // to failure). Applied at the React compose seam (scaleSetsByEnergy, AFTER the
  // readiness scale, composing MIN-style on its already-reduced sets so they never
  // double-cut below the MEV floor MIN_SETS_PER_EX). CRITICAL INVARIANT — KEEP LOAD:
  // ONLY sets + the RIR display band move; the prescribed targetKg is UNTOUCHED
  // (heavy load preserves muscle in a deficit — nutrition modulates volume +
  // fatigue-management, never the kg). sessionBuilder/dp never import nutrition —
  // the resolved {phase,severity} token is passed read-only. OFF → magnitude null →
  // volumeFactor 1.0 + rirShift 0 → byte-identical (the calibration-sim kg path is
  // never touched; the full-path-sim OFF hash is unchanged). The cut band + onset +
  // RIR/deload knobs are a DESIGN PROPOSAL (spec §9) — sim sweep + Daniel sanity-
  // check before flip; the SHAPE (deeper deficit → less volume + more RIR + more
  // deloads, load untouched) is the verified principle. No new persistence.
  dp_energy_volume_v1: { rollout: 1, default: true },

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
  dp_tendon_cap_v1: { rollout: 1, default: true },

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
  dp_stimulus_per_min_v1: { rollout: 1, default: true },

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

  // #7 per-exercise metric types (RISK MED — changes the PRESCRIPTION SHAPE for a
  // non-reps movement, the only correctness-fix half of #7). The metric_type DATA
  // (exercises.json) + the metricType.js resolver are ALWAYS-ON + inert; this flag
  // gates ONLY the BEHAVIORAL honoring at the compose boundary: a time / carry
  // exercise (Plank / Side Plank / Dead Hang / Pallof / Plate Pinch Hold / Wrist
  // Roller / Farmer's Walk) no longer receives a weight × reps prescription — its
  // targetReps is suppressed (0) and a prescribed DURATION (targetSec) is emitted
  // instead (a load may still ride for a carry / weighted hold). OFF → the legacy
  // reps × weight prescription (today's behavior, byte-identical: the full-path-sim
  // never enables this flag, so the determinism hash holds). The full seconds /
  // distance LOGGING UI (SetLogInput) is a fragile UX remainder DEFERRED for
  // Daniel — flag-ON today stops the WRONG rep prescription + carries the metric +
  // targetSec to the consumer; the dedicated timer input lands at the UI pass.
  dp_metric_types_v1: { rollout: 1, default: true },

  // #73 goal/sex-aware exercise SELECTION (engine-wiring 2026-06-08) (RISK MED —
  // changes session COMPOSITION, path A; never kg). Two biases, both default OFF →
  // the chosen exercise list is BYTE-IDENTICAL to today. When ON:
  //  (1) LATERAL-RAISE GUARANTEE — when the focus emphasizes the shoulders (umeri
  //      in emphasizedGroups: v-taper / upper / shoulders) and the cluster trains
  //      umeri, the session is guaranteed to include a lateral raise (the #1 width
  //      movement) — the DIAG miss where selection picked press + rear-delt but NO
  //      lateral raise, leaving the v-taper delts at ~16 instead of the 17-20 band.
  //  (2) SEX/COMMONNESS BIAS — a man's leg-day accessory pool prefers the lifts
  //      common for men (RDL / leg extension / leg curl / squat / leg press / hip
  //      abductor / calf) and DEMOTES moves common for women + rare for men (cable
  //      glute kickback / hip thrust / cable-ankle); women → inverse (no demotion).
  //      A pure REORDER (poolForGroup), never a hard ban — every option stays
  //      reachable if nothing else fits (anti-paternalism, last-option safety).
  // OFF → no umeri injection + sexBias null → byte-identical pool order +
  // composition (the calibration-sim hash is path-B/orthogonal + stays green; the
  // full-path-sim OFF arm unchanged). Flip ON is a human gate (Daniel) AFTER the
  // sim A/B. See _REF_gold_vtaper_cut_2026-06-08 + _ENGINE_volume_policy §73.
  dp_smart_selection_v1: { rollout: 0, default: false },

  // #74 goal-realism push-back layer (engine-wiring 2026-06-08) (RISK LOW —
  // pure detection + a reframe MESSAGE; never blocks, never touches kg/sets,
  // surfaced ONCE at goal-set with an anti-spam cooldown). Andura today just
  // OBEYS the goal — it can't refuse/reframe an impossible or contradictory ask
  // ("lose 18kg in 7 weeks", "+8kg muscle AND visible abs in 12 weeks", a
  // beginner wanting 7 hard days/week). A real coach reframes gently: shows the
  // realistic RANGE, proposes the sustainable alternative. When ON, the
  // goal-set surface runs src/engine/goalRealism.js (rate-of-change band labels,
  // BF gate via bodyComposition.js as a noisy BAND, contradiction + frequency
  // detectors) and renders a gentle reframe (i18n keys goalRealism.* EN/RO) the
  // user can dismiss + proceed. OFF → the detector is never invoked + no message
  // renders → the deployed app is BYTE-IDENTICAL (a goal-set advisory, NOT the
  // dp.js kg path — the calibration-sim hash is orthogonal + stays green). Flip
  // ON is a human gate (Daniel) AFTER review. The band/zone constants are
  // calibrated from _ENGINE_load_bf_rate_policy_2026-06-08 §3 + §4 (verified
  // physiology — Helms/ISSN/Aragon). See spec §4.
  dp_goal_realism_v1: { rollout: 0, default: false },

  // #75 load-transition-window + reason-derivation (engine-wiring 2026-06-08)
  // (RISK MED — changes how dp.js READS reps right after a forced load change,
  // path B; never invents a load, only SUPPRESSES a misread or CAPS a rebound).
  // After a forced load change ≥10%, raw reps are misleading: an UP-jump drops
  // reps (8kg×20→10kg×12 = e1RM continuity, NOT regression) so today's ease-back
  // could fire a FALSE demotion; a DOWN move spikes reps (10→8 = −20% → 3×20+)
  // which the catch-up/easy-run path could misread as headroom and OVERSHOOT on
  // the rebound. When ON, deriveLoadTransition opens a 2-3 exposure window (per-
  // reason; pain OPEN-ENDED until 2 pain-free exposures) where: UP-jump + e1RM
  // continuity → suppress_regression (the ease-back is skipped, the post-jump rep
  // drop re-climbs normally); DOWN move → cap_rebound holds the upward correction
  // to the min increment until 2 clean exposures. The DOWN reason is DERIVED by
  // priority (pain #64 > deload > equipment > manual > failed-reps/form > fatigue
  // > unknown→CONSERVATIVE) from signals dp.js already has, defaulting conservative
  // when unknown (no aggressive auto-climb). OFF → deriveLoadTransition is never
  // invoked → byte-identical (the calibration-sim hash holds flag-OFF; ON is the
  // validation gate). Flip ON is a human gate (Daniel) AFTER the sim A/B. The
  // thresholds (10% / 2-3 exposures / 7% e1RM tolerance) are DESIGN PROPOSALS from
  // _ENGINE_progression_rir_rest_count_policy_2026-06-08 §1 `load_transition_window`.
  dp_load_transition_v1: { rollout: 0, default: false },

  // #63 coach-confidence subtle line (RISK LOW — pure narration, no prescription
  // path). Surfaces the per-exercise Kalman posterior UNCERTAINTY (sigma) carried
  // on PlannedExercise.confidence (F5-W0) as a GENTLE qualitative tier — wide sigma
  // / cold-start → "still learning you", narrow → "dialed in". confidenceTier maps
  // {sigma,n} → one of LEARNING / GETTING_THERE / DIALED_IN + an i18n key; the
  // thresholds anchor to the engine's own SIGMA_PROBE_THRESHOLD (so "still learning"
  // never contradicts "the engine would probe here"). MINIMALISM (Daniel LOCK
  // 2026-06-08 §5): one subtle line, NEVER a number/RIR/1RM/sigma/chart. The
  // PRESCRIPTION (kg/reps/sets) is untouched — this feature has zero path to a
  // weight or set count. OFF → the parent gate returns null → no extra DOM, the
  // Workout screen is byte-identical. No new persistence (reads dp-strength-
  // posterior via the carried confidence field). Optional Daniel-flag.
  dp_coach_confidence_v1: { rollout: 0, default: false },

  // #56 moat "why?" on-tap one-liner (RISK LOW — read-only narration). Upgrades the
  // "why this exercise?" explainer's data source from the coarse kg-vs-last re-guess
  // (getWhyExerciseSummary) to the engine's REAL decision reason — PlannedExercise
  // .recReason.status (F5-W0). whyForStatus maps the machine status enum (EASE BACK /
  // CONSOLIDATE / INIT / INCREASE / …) to a plain-RO i18n sentence (why.reason.*),
  // never the engine's hardcoded copy (i18n-leak rule). MINIMALISM: one sentence,
  // available ON TAP, never auto-pushed. OFF → handleOpenWhy uses the existing
  // categorical summary → byte-identical (no new DOM, no behavior change). No new
  // persistence. Optional Daniel-flag.
  dp_moat_why_v1: { rollout: 0, default: false },

  // behavioral tier auto-detect (engine-wiring) (RISK MED — overrides the user's
  // self-reported experience, which then drives session COUNT / volume / slot caps
  // via minSessionForTier/tierCeiling, path A; never the dp.js kg). The self-
  // reported experience seeds profileTier ONLY as a cold-start guess; behavior is
  // the truth. When ON, resolveBehavioralTier (convergenceGuard.js) infers the REAL
  // training level from logged behavior and OVERRIDES the seed in BOTH directions:
  //  - PRIMARY signal = STRENGTH relative to bodyweight (best RIR-corrected e1RM /
  //    bodyweight per main pattern vs STRENGTH_TIER_BAND, sex-normalized). A user
  //    can have years of prior training before installing Andura, so the in-app
  //    session COUNT does NOT block promotion to advanced — strength itself is the
  //    proof (an advanced ratio basically cannot occur without real training age).
  //  - CORROBORATE = progression rate: a lift still climbing near-linearly (newbie
  //    gains) suppresses an advanced (T2) promotion (caps to T1).
  //  - The session count ONLY gates the literal zero-data cold-start (need ≥2-3
  //    logged sessions before acting); never blocks promotion once strength exists.
  // Asymmetric: demotion (the over-claimer) is fast, advanced promotion trusts the
  // strength signal. Hysteresis (profileTier_lastChange_ts + a min-sessions gate)
  // stops the tier yo-yoing. OFF → resolveBehavioralTier is never invoked at the
  // builder seam → profileTier = tierForExperience(seed) byte-identical (the self-
  // report). Changes session COMPOSITION (path A), NOT per-exercise kg — the
  // calibration-sim hash is orthogonal + stays green flag-OFF. The bands +
  // hysteresis knobs are DESIGN PROPOSALS — Daniel/research review before flip.
  dp_behavioral_tier_v1: { rollout: 0, default: false },

  // tier-aware FRESH compound set floor (engine-wiring) (RISK LOW — only ever
  // RAISES a fresh compound's floor from 2→3 for a trained lifter, bounded by the
  // existing [floor, ceiling] clamp; path A, never kg). distributeGroupSets floors
  // a fresh compound at COMPOUND_MIN_SETS=3 today; a NON-recovered group drops to
  // NONRECOVERED_COMPOUND_MIN_SETS=2. Science: 2 sets/exercise is genuinely
  // effective (esp. beginners / limited recovery), 3 is better for trained/advanced
  // lifters — what drives growth is WEEKLY sets per muscle. When ON, the FRESH
  // compound floor is TIER-AWARE: a TRAINED lifter (T1/T2) keeps the floor at 3
  // (compounds never stranded at 2 when the muscle is fresh), a T0 novice may sit
  // at 2 (MEV, manageable recovery — current behavior preserved for T0). The
  // recovery path (non-recovered → 2) and the emphasized anchor floor are UNCHANGED
  // in both modes. OFF → the universal COMPOUND_MIN_SETS=3 floor → byte-identical
  // (the calibration-sim hash is path-B/orthogonal + stays green). Threaded into
  // distributeGroupSets via ctx.tierCompoundFloor (resolved at the getDailyWorkout
  // seam). Flip ON is a human gate (Daniel) AFTER the sim A/B.
  dp_tier_compound_floor_v1: { rollout: 0, default: false },

  // Daniel expert tier-list SELECTION (Wave 1, 2026-06-09) (RISK MED — changes
  // session COMPOSITION, path A; never kg). Wires the founder's hand-ranked
  // exercise-selection tier list (src/engine/exerciseTierRank.js, S/A/B/C/D per
  // muscle) into poolForGroup as the PRIMARY quality ordering key, so the engine
  // prescribes from HIS ranked list ("Andura picks like Daniel"). When ON,
  // poolForGroup orders a group's auto-pool by tierRankOf(nameEn) (S<A<B<C<UNRANKED),
  // REPLACING the legacy ANCHOR_NAMES/COMMON_MOVEMENTS/seeded band ordering — PR-
  // history continuity stays band 0 (a user's logged lift is NEVER reordered), the
  // seeded hash stays the within-band tiebreak (determinism), and the squat-primacy
  // + equipment/tier/skill/pain/exclusion gates are untouched. D-band picks are HARD-
  // EXCLUDED from the auto-pool (like the contraindication remove) UNLESS removing one
  // would empty the muscle (last-option safety guard). OFF → poolForGroup is byte-
  // identical to today (the legacy rank() ordering; no tier-rank read, no D removal) →
  // the calibration-sim/persona-matrix/full-path-sim determinism hashes hold flag-OFF.
  // Threaded via ctx.danielTierSelect (resolved at the getDailyWorkout seam). LIVE as
  // of 2026-06-09 — the founder-gated flip ON (default-ON, full rollout) after the
  // persona-matrix + calibration-sim validated it ON; the determinism sims were
  // re-baselined for the ON-default world (selection now follows Daniel's tier list).
  // Wave 2 (the ~31 missing S/A movements + the adductor MACHINE group) is a separate
  // library add — NOT this flag.
  dp_daniel_tier_select_v1: { rollout: 1, default: true },

  // Wave 1.3 focus-policy (DATA ONLY — INERT until its resolver lands). Per-focus
  // PATTERN policy (session caps, per-session requirements, cross-day weekly
  // minimums, frequency caps) lives as the frozen FOCUS_RULES table in
  // src/engine/focusPolicy.js. This flag GATES the future resolver that will read
  // that table at the compose seam — it is NOT YET wired to sessionBuilder/compose
  // (no consumer imports FOCUS_RULES this step). OFF → the table is never read →
  // byte-identical to today. The resolver (a LATER Wave 1.3 step) flips this on.
  dp_focus_policy_v1: { rollout: 1, default: true },

  // Focus VOLUME CONTRACTS (2026-06-12 focus-contracts arc) — a per-focus WEEKLY
  // group-volume cap/floor layer (applyFocusVolumeContracts, focusVolumeContracts.js),
  // applied to the weekly volume budget AFTER the maintenance floor and BEFORE the
  // intra-week makeup / recovery cut. It enforces the founder-approved volume
  // CONTRACTS the per-session focus-policy resolver cannot reach (cross-group
  // relationships): balanced back ≤1.6×median(other majors) + shoulders floor; upper
  // back ≤1.5×shoulders/chest + arms floors; arms biceps≥0.85×triceps + shoulders cap;
  // shoulders back<shoulders; chest chest>back & chest>triceps; v-taper back cap +
  // shoulders floor; back biceps floor; lower upper-maintenance caps. Pure +
  // deterministic (median/ratio math on the budget map, no Math.random/Date.now);
  // every touched group is clamped to [MEV, MRV] so a cap never starves a group and a
  // floor never exceeds MRV — the maintenance floor stays supreme. OFF (pinned OFF in
  // the fp cohorts via FLIPPED_FLAGS) → the budget passes through untouched →
  // byte-identical (the full-path-sim hash holds). The sub-bucket caps (OHP/shrug/
  // close-grip) ride the existing dp_focus_policy_v1 resolver via new derived tags +
  // FOCUS_RULES entries — those are gated by THIS flag at the resolver call so the
  // whole contract behavior flips together.
  dp_focus_contracts_v1: { rollout: 1, default: true },

  // CROSS-DAY WEEK LEDGER (2026-06-12 focus-contracts arc, closing the 4 GAP notes) —
  // extends the established deterministic day→cluster derivation (weekClustersFor /
  // weekSessionSpreadByGroup) into a per-group SET + per-sub-bucket SLOT projection of
  // the week's PRIOR days (computeWeekLedger, weekLedger.js), so day N can react to what
  // days 0..N-1 already delivered — the cross-day view the focus-contracts layer needs
  // for the 4 contracts a per-day pass cannot reach: (1) ARMS biceps≥0.85×triceps over
  // the WEEK (a second direct-biceps slot is injected when the projected week biceps
  // trails 0.85×triceps; close-grip stays protected); (2) CHEST close-grip ≤4 sets/wk (a
  // later push day's maxCloseGrip tightens to 0 once the prior days projected the quota);
  // (3) SHOULDERS lateral≥6 & rear≥6 sets/wk @4d+ (a SECOND lateral/rear slot is added on
  // a later shoulder day when the week still owes the quota — not an impossible 5-set
  // dose); (4) LOWER back ≤0.65×max-lower @4d+ (the upper days of a lower-focus week shave
  // their back allocation toward the cap reading the ledger, never below MEV). Pure +
  // deterministic (clusterForDay + budget/session division — no Math.random/Date.now/log
  // read), O(active days). MEV floors + coverage + PR-protection + DP anchors all keep
  // precedence (a cap never drops below MEV; a LOGGED lift is never displaced). OFF
  // (pinned OFF in the fp cohorts via FLIPPED_FLAGS) → the ledger is never built → null
  // threaded → byte-identical (the full-path-sim hash holds).
  dp_week_ledger_v1: { rollout: 1, default: true },

  // F3 ID-MIGRATION APPLY (2026-06-12, manager) — one-shot per boot AFTER
  // hydrate (reactBoot.runPostAuthSync): re-keys legacy exercise names onto
  // canonical engine names in every name-keyed store (logs/pr-records rows,
  // objectKey stores, ex-extra-sets-* dynamic keys) ON THE DEVICE, then the
  // sync layer pushes canonical names up. THE durable half of the fix: the
  // 06-10 server-side remap was clobbered by a device pushing stale local
  // state back; device-side migration converges every replica regardless of
  // sync direction. Idempotent (clean store = no-op), collision-AVERSE (a
  // store needing an alias↔canonical MERGE is skipped + reported, never
  // auto-folded), backup-first per store, fail-silent at the boot call site
  // (the read-shim keeps resolving legacy names either way). OFF → boot does
  // nothing (runner never called) → byte-identical.
  dp_id_migration_apply_v1: { rollout: 1, default: true },

  // A2.1 consolidated honest DECISION TRACE (audit-grade, additive). When ON, the
  // compose seam attaches a `decisionTrace` field — a structured array of the REAL
  // multi-factor reasons that shaped THIS session's plan (phase / readiness /
  // recovery cut / emphasis / deload / focus / time budget / DP load tally /
  // finalDecision), each DERIVED from a signal the path actually computed (an
  // unfired factor is omitted, never fabricated). It is INERT observability — no UI
  // consumer yet (A2.2 owns rendering) — and is invisible to the prescription
  // determinism hash (which reads only sessionType/intensityMod/exerciseCount +
  // per-exercise engineName|sets|reps|kg), so it NEVER changes the plan. Default ON
  // (cheap, side-effect-free); OFF → no field attached → byte-identical output.
  dp_decision_trace_v1: { rollout: 1, default: true },

  // A4 nutrition coached recommendation vs math target (Hardening, 2026-06-09)
  // (RISK LOW — additive; only ever pulls the kcal target back TOWARD maintenance,
  // never makes it more aggressive, never below the sex floor). The math target
  // (TDEE − deficit / + surplus) is goal-driven + bounded only by the hard sex
  // floor (CEO LOCK 2026-05-31): a bare floor stops "dangerous" but not "too
  // aggressive" — a 150kg→90kg-in-8wk cut math-targets a punishing floored 1200.
  // When ON, getCoherentKcaltoday emits BOTH numbers: the math target stays
  // available (mathKcal, for the honest "why"), and the COACHED recommendation
  // (what the user follows) is the math target BOUNDED to a sustainable rate —
  // deficit ≤25% below maintenance, surplus ≤20% above (Helms/ISSN evidence) —
  // with a reason token (deficit_capped_sustainable / surplus_capped_moderate /
  // at_floor / within_sustainable) surfaced on the output. OFF → no coached
  // override, kcal == the math target → BYTE-IDENTICAL to today (the nutrition
  // snapshots + safety tests hold flag-OFF). Flip ON is a human gate (Daniel).
  dp_nutrition_coached_v1: { rollout: 0, default: false },

  // W-Split (oracle grid GAP 1 + GAP 4, 2026-06-09) — WEEK-LEVEL split + safety
  // wiring, all behind THIS one flag. Five coupled fixes that the per-exercise
  // brain cannot reach: (1) freq ≤2 → FULL-BODY templates (never an upper/lower
  // split that zeroes a region — fixes the once-weekly user + the 72yo 2-day
  // upper/lower that left back<chest); (2) push:pull DAY-COUNT balance on
  // multi-day splits; (3) FOCUS drives the day-type MIX (v-taper/back/upper →
  // PULL-heavy week, lower → leg-heavy); (4) HARD FLOOR — a focus region's weekly
  // day-count ≥ its antagonist (v-taper: back-exposure ≥ chest-exposure), the
  // split rebalanced until it holds; (5) senior/cold-start PER-SESSION volume cap
  // (age×experience) + a per-major-muscle weekly MAINTENANCE FLOOR so no major
  // muscle collapses to ~0. Determinism: all tie-breaks reuse the existing seeded
  // keys (no Math.random/Date.now). OFF (rollout 0, default false) → every code
  // path early-returns to the pre-feature shape → BYTE-IDENTICAL (the full-path-sim
  // hash + golden gate hold; this flag is NOT in the fp ON cohort). Flip ON is a
  // human gate (Daniel) AFTER the persona-matrix A/B review.
  dp_split_rebalance_v1: { rollout: 1, default: true },

  // W-Meso (2026-06-09) — intra-block RIR ramp. The mesocycle deload already
  // fires (W3 −45% volume / −20% load, weeksElapsed wired), but the LOAD/LOAD+/
  // PEAK accumulation weeks compose IDENTICALLY because the intended intra-block
  // RIR drift (rirTargetForPhase, mesocycle.js) was computed but DARK. This wires
  // it: the phase shifts the rir DISPLAY band (compose.ts shiftRirBand, label only
  // — never the kg, KEEP-LOAD) so early weeks run HIGHER RIR (more in reserve)
  // ramping to LOWER RIR at PEAK (accumulation→intensification). DELOAD unaffected.
  // Behavior CHANGES across weeks → must be byte-identical OFF: rollout 0 / default
  // false → phaseRirShift never called, the band passes through unchanged → the
  // full-path-sim hash + golden gate hold (NOT in the fp ON cohort). Flip ON is a
  // human gate (Daniel) after a focused multi-week ON review.
  dp_meso_rir_v1: { rollout: 0, default: false },

  // Metadata-derived rep-range resolver (Daniel coach audit 2026-06-10) (RISK
  // MED — the band feeds EVERY consumer coherently: prescription + live-adjust
  // + getRepsRange display + the demonstrated-weight floor back-solve at rMin
  // (dp.js:819/1460), so kg can shift INDIRECTLY where the rep target moves —
  // a compound back-solved at 6 floors slightly higher than at 8). The curated
  // DP.REP_RANGES is keyed on the OLD ~143-name vocabulary ('Lateral Raises',
  // 'Pec Deck / Cable Fly', 'Overhead Triceps'); the live Wave-2 library (657)
  // emits different canonical engineNames ('Cable Lateral Raise', 'Cable Fly',
  // 'Y Raise', …) that miss those keys, so every new-library exercise fell
  // through to the flat [8,12] default — izolari shown 8-10 instead of their
  // built 12-20/15-20 bands (the per-exercise ranges were DARK for exactly the
  // exercises users train). When ON, DP.getPhaseAwareRepRange derives a
  // class-aware base range from each exercise's OWN metadata (muscle + tier +
  // force_demand, src/engine/dp/repRange.js — scales to all 657, catches the
  // calf t1/high mistag), curated REP_RANGES still wins when the name hits, and
  // the CUT cap stops crushing isolation reps to 10 (hybrid policy: the deficit
  // is carried by volume, not by stripping the isolation stimulus). OFF →
  // byte-identical legacy lookup + CUT cap. THE FLIP 2026-06-10 — default ON
  // after the before/after verification on Daniel's real workout (18/22 toward
  // spec, 0 regressions) + repRange 26 + dp 178 green. Added to fp-config
  // FLIPPED_FLAGS so the A/B baseline forces it explicitly OFF (hashOff/hashOn
  // byte-for-byte): the frozen prescription stream pins the legacy rep band, and
  // honoring the metadata-derived ranges would move the hashes. ON behavior is
  // proven on the before/after probe + the #70 persona matrix, NOT in this stream.
  dp_rep_class_v1: { rollout: 1, default: true },

  // R5 load-model (Daniel coach audit 2026-06-10 "Y Raise 25kg ego-load") (RISK
  // MED-HIGH — MOVES kg: caps + steps). The curated MAX_KG/WEIGHT_STEPS enumerate
  // ~60 staples; every other exercise (Y Raise, Hip Abduction Machine, Smith
  // Shrug, Machine Pullover, Hammer Curl, ...) had NO defensive cap → the
  // double-progression climbed it without the at-cap reps-growth brake
  // (dp.js keys the brake solely on a present maxKg), and NO equipment step →
  // generic 2.5 even on 5kg machine stacks. When ON, dp/loadModel.js derives a
  // defensive cap (muscle × equipment × class, clip-only-absurd, founder-
  // mirrored isolation values) + a real equipment step for the gaps; curated
  // entries always win. OFF → byte-identical legacy (curated-or-null cap, flat
  // 2.5 step). THE FLIP 2026-06-10 — probe on Daniel's real 22-exercise program
  // PASSED: the only braked lift is Y Raise (ego-load 25kg → cap 18, the audit
  // target); every legit lift is well under its derived cap (Hyperext 55 vs 180,
  // RDL vs 360, presses vs 220) and every curated cap wins unchanged. Pinned OFF
  // in fp-config FLIPPED_FLAGS (path A) + calibration-sim resetStore (path B,
  // direct getSmartRecommendation) so both determinism baselines stay frozen.
  dp_load_model_v1: { rollout: 1, default: true },

  // R4 anchor-protective shave (Daniel coach audit 2026-06-10 "main lifts primesc
  // 3 seturi, nu totul 2") (RISK LOW-MED — moves SETS distribution, never kg). On
  // a NON-RECOVERED group the legacy shave hit every exercise including the
  // anchor (Daniel's real day: Smith Squat at 2 sets, readiness 60). When ON, the
  // first tier-1 compound of the group is EXEMPT from the shave + keeps the fresh
  // 3-set floor; the spared set is re-shaved from the back of the group
  // (isolations above their floor) so the group TOTAL stays equal — "coach-ul
  // taie din accesorii, nu din lift-ul principal". OFF → byte-identical. Pinned
  // OFF in the fp-config FLIPPED_FLAGS baseline (path-A composition surface).
  dp_anchor_sets_v1: { rollout: 1, default: true },

  // #R6a upper-day biceps guarantee (Daniel coach audit 2026-06-10 "ziua Upper nu
  // are biceps") (RISK LOW — selection only, never kg). A cluster that trains
  // biceps (upper/pull/full) must include >=1 biceps movement; the low slot share
  // (upper biceps 0.15) rounded it out of his real 8-exercise Upper day. When ON,
  // a biceps movement is injected if none landed (add if room, else replace the
  // lowest-priority non-anchor isolation). OFF → byte-identical. Pinned OFF in the
  // fp-config FLIPPED_FLAGS baseline (path-A composition surface).
  dp_biceps_guarantee_v1: { rollout: 1, default: true },

  // #R6d cross-week lumbar redundancy dedup (Daniel coach audit 2026-06-10 "RDL +
  // Hyperextension aceeasi saptamana") (RISK MED — trims session COMPOSITION; OFF
  // by default pending Daniel A/B because cluster-granularity can occasionally
  // demote a hinge that was not truly redundant). When ON, a REPEAT leg/posterior
  // day this week demotes the heavy lumbar hip-hinge family (deadlift/good-morning/
  // back-extension) via the existing poolForGroup demote channel so a non-hinge
  // sibling (leg curl) leads; the FIRST leg day keeps its hinge; demote-only +
  // last-option guarded → never strands. FLIPPED ON 2026-06-10 (Daniel approved
  // the conservative build "de acord conservator"; his real week showed the exact
  // RDL+Hyperextension redundancy it removes).
  dp_lumbar_dedup_v1: { rollout: 1, default: true },

  // Refusal-memory soft demote (Daniel 2026-06-10 "fa-l cumva reversibil sau sa
  // apara totusi recomandarile refuzate"). A "nu vreau" swap-away increments the
  // existing wv2-refusal-counter (now timestamped); composition demotes that
  // exercise via getRefusalPenalties (poolForGroup penalty channel: stable-
  // partition to the back, PR-history protected, last-option guarded — NEVER a
  // ban) with a 28-day half-life decay so it returns on its own. Swap pick-lists
  // are untouched (the refused exercise still appears there) and the threshold-3
  // "permanent?" modal flow is unchanged. Empty counter → empty map →
  // byte-identical (sims/fresh users carry no refusals). Device-local v1 (the
  // counter is not in SYNC_KEYS).
  dp_refusal_memory_v1: { rollout: 1, default: true },

  // Equipment-memory HARD exclusion (founder Busy/Missing redesign 2026-06-12).
  // The in-session "Aparat lipsa" → confirm flow PERSISTS the specific exercise
  // whose machine/station the user does not have (wv2-equipment-missing-exercises,
  // a per-EXERCISE name set distinct from the COARSE 10-item wv2-missing-equipment
  // picker). When ON, getDailyWorkout HARD-excludes those exact EN canonical names
  // from future composition (sessionBuilder, last-option guarded — never an empty
  // muscle). UNLIKE the refusal soft-demote (dp_refusal_memory_v1) this is a HARD
  // filter, NOT a decaying demote: a missing machine stays missing until the user
  // removes it from the Account list. Empty store (the common case + every sim /
  // fresh user) → empty set → byte-identical composition. Device-local v1 (NOT in
  // SYNC_KEYS). Pinned OFF in the full-path-sim FLIPPED_FLAGS so the all-off A/B
  // baseline stays byte-for-byte (resetWorld clears localStorage → inert anyway).
  dp_equipment_memory_v1: { rollout: 1, default: true },

  // F5 cross-day lat-iso dedup (Daniel coach-review 2026-06-10 + the D117 #2
  // "Upper 8→7" intent). The v-taper lat_isolation weekly minimum (1/wk) was
  // translated into a per-session requirement on EVERY qualifying day → Machine
  // Pullover injected on BOTH Pull and Upper (cross-day redundancy). With this
  // ON, the GENERALIST 'upper' day defers a weekly target whose SPECIALIST days
  // this week (pull/back) can deliver the weekly count by themselves — derived
  // from the pure day→cluster map (weekClustersFor), no ledger. rear_delt (2/wk
  // > 1 specialist day) keeps its Upper exposure; a pure Upper/Lower split (0
  // specialist days) defers nothing — the regression a blanket drop would cause.
  // OFF → weekClusters null → byte-identical.
  dp_latiso_dedup_v1: { rollout: 1, default: true },
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
