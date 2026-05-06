## Task: Faza 2.5 batch 6 Engine Specialization V1 implement (ADR 026 §9.6 SSOT)
**Model:** Opus
**Status:** Complete

### Pre-flight
- Backup tag: `pre-faza2.5-specialization-v1-implement-2026-05-06-1655` ✅ pushed origin
- Clean tree pre-execution: yes (post §9.6 compile commit `92a69fd` + LATEST sync `3defdeb`)
- Branch: `main` ✅
- Last commits include `92a69fd` (§9.6 Specialization compile source canonical) ✅
- ADR 026 §9.6 sections §9.6.1 → §9.6.7 confirmed (lines 1286-1506) ✅
- Target dir `src/engine/specialization/` clean (NU pre-existing) ✅
- **`src/engine/weaknessDetector.js` orfan EXISTS** (4199 bytes, 126 LOC, 3 exports: `brzycki1RM`, `compute1RMByGroup`, `detectWeakGroups`) ✅ — §36.84 Gap #1 reuse premise satisfied
- Reference patterns confirmed: `src/engine/{periodization,goalAdaptation,energyAdjustment,bayesianNutrition,tempo}/`
- ADR 018 §2 + `src/engine/dimensionContract.js` available
- PainButton signal: `src/engine/pain-button/` exists (index.js, override-cdl.js, pain-input.js)
- Tooling: node v24.14.0 + npm 11.9.0 + vitest 3.2.4 ✅
- Convergence Guard shared utility `src/coach/orchestrator/utilities/convergenceGuard.js` available (Phase 1-2 foundation commit `5a16550`)

### Modificări

**`src/engine/specialization/` NEW — 14 files, 3682 LOC total** (1955 source + 1727 test):

**7 source modules (1955 LOC):**
- `constants.js` (249 LOC) — CALIBRATION_TIERS + PERSONA + ELIGIBLE_PERSONAS Marius ONLY (Q12 §45.3 LOCKED) + GOAL_PHASE + ELIGIBLE_GOAL_PHASES Bulk/Recomp ONLY (Q5=D Cut DISABLE) + PERIODIZATION_PHASE + ELIGIBLE_PERIODIZATION_PHASES Accumulation/Load (Q11=B PARALLEL modifier accumulation phases ONLY) + WEAKNESS_THRESHOLD_RATIO 0.8 + CONSENSUS_WINDOW_SESSIONS 12 + TOP_N_DISCIPLINE 1 (Q3=A simplicity) + COOLDOWN_WEEKS 12 (Q10=B + Q16=A) + MESOCYCLE_DURATION_WEEKS 4 (Q9=A) + VOLUME_REDUCTION_OTHER_GROUPS_PCT -0.25 (Q8=B) + VOLUME_MODIFIER_TARGET_PCT +0.30 + FREQUENCY_MODIFIER_TARGET_SESSIONS +1 + APPLICATION_MODE hybrid (Q7=C) + SPECIALIZATION_LABEL_RO_PREFIX "Bloc focus" (Q17=C RO native) + ACTIVATION_STATE 9 enum values + SCHEMA_CONSTANTS
- `types.js` (197 LOC) — JSDoc typedefs: CalibrationTier + Persona + GoalPhase + PeriodizationPhase + ApplicationMode + ActivationState + EligibilityResult + WeaknessSignal + ReconciliationResult + CooldownState + VolumeModifier + MesocycleProgress + SpecializationBlueprint + SpecializationResult + 5 cross-engine signal typedefs
- `activationGating.js` (197 LOC) — Cluster A: `isEligiblePersona` + `isEligibleTier` + `isEligibleGoalPhase` + `detectInjuryAutoDisable` (PainButton signal Q14=A) + `evaluateEligibility` composite 4-gate priority order early-return (persona Q12 → tier T1+ → phase Q5+Q13 → injury Q14)
- `weaknessConsumer.js` (290 LOC) — Cluster B: imports `weaknessDetector` orfan §36.84 Gap #1 reuse + `consumeWeaknessDetectorSignal` (Top-1 Q3=A) + `evaluateConsensus` (last-12 + lifetime Q2=C anti-flap) + `reconcileWeaknessTarget` (user agency F4 wins Q4=C) + `buildWeaknessSignal` bundle integration + `evaluateProposal` (Q15=B propose user accept/reject NU auto-activate)
- `cooldownManager.js` (165 LOC) — Cluster B5+B6: `getCooldownEntry` (Map/Object history) + `evaluateCooldown` (N=12 weeks tracking + missing nowMs conservative block) + `buildCooldownEntry` orchestrator persistence helper, deterministic via caller-provided nowMs (NU Date.now per ADR 018 §2)
- `applicationStrategy.js` (185 LOC) — Cluster C: `translateGroupToRO` (chest/back/shoulders/legs/biceps/triceps/core RO native) + `buildUiLabel` "Bloc focus [Grupă]" Q17=C + `isApplicationPhaseEligible` (Accumulation/Load only Q11=B + Q12=A cross-ref) + `computeVolumeModifier` (hybrid V+F + -25% other groups + MRV cap respect invariant Q7=C+Q8=B) + `computeMesocycleProgress` (4-week fixed Q9=A exit detection)
- `crossEngineHooks.js` (255 LOC) — Cluster D: D1 `emitParallelModifier` (Q11=B NU REPLACE Engine #1) + D2 `emitDeloadPreserved` (Q12=A non-negotiable Engine #4 owns) + D3 `emitCutDisable` (Q5+Q13 dual safety gate Engine #2 phase) + D4 `emitInjuryAutoDisable` (Q14=A PainButton invariant 5 Layer 5 Medical Safety) + D5 `emitLightCoupling` (Energy DOWN recurrent conservative scaling + Tempo preserved Engine #6) + `getConvergenceGuardReference` mirror §9.4 Bayesian commit `8615ec1` + §9.5 Tempo commit `d82d118` precedent (NU duplicate logic) + `forwardConstraintObject` anti-cascade §1.10 immutable Hook 1
- `index.js` (417 LOC) — `evaluate(ctx) → Promise<SpecializationResult>` orchestrator: defensive ctx unpacking + tier resolution + Periodization Constraint Object Hook 1 read-only + Cluster B weakness signal consume + Cluster A activation gating eligibility check + cross-engine hooks emit (5 Cluster D) + early-return ineligible paths (gating fail / no lagging / cooldown active) + proposal evaluation (rejected → cooldown trigger / accepted → ACTIVE / pending → PROPOSAL_PENDING) + mesocycle exit detection (week ≥ 4 → COMPLETED_EXIT) + Cluster C volume modifier compose + 6-field blueprint emit + signals enumerated + confidence (3-tier scoring) + tier semantic ('none'/'LOW'/'MED'/'HIGH' state-mapped) + recommendations [] (orchestrator concern ADR 030 D2 thin scope) + Convergence Guard ref în trace + forward Constraint Object frozen

**6 test files (1727 LOC, +190 tests):**
- `activationGating.test.js` (244 LOC, 32 tests) — eligibility matrix Marius/Maria/Gigica + tier T0/T1/T2 + phase Bulk/Recomp/Cut + injury Q14=A + composite priority order (4-gate early-return)
- `weaknessConsumer.test.js` (233 LOC, 24 tests) — detector reuse §36.84 Gap #1 invariant + consensus alignment + Top-1 discipline + reconciliation user agency F4 + proposal mechanism Q15=B NU auto-activate
- `cooldownManager.test.js` (219 LOC, 20 tests) — Map/Object history + N=12 weeks tracking + hard reject anti-nagging + boundary expiration + missing nowMs conservative + buildCooldownEntry duration invariant
- `applicationStrategy.test.js` (264 LOC, 36 tests) — RO native labels + phase eligibility (Accumulation/Load only) + hybrid V+F + -25% other groups + 4-week exit Q9=A + MRV cap respect invariant
- `crossEngineHooks.test.js` (285 LOC, 36 tests) — D1-D5 hooks + Convergence Guard frozen reference mirror §9.4+§9.5 + forwardConstraintObject anti-cascade
- `index.test.js` (482 LOC, 42 tests) — ADR 018 §2 contract compliance + total function (never throws) + deterministic + purity (no ctx mutation, no frozen constraint mutation, recommendations empty) + 6-field blueprint + activation gating early-return paths (Maria/Gigica/T0/CUT/injury) + Cut DISABLE 3-layer defense Q5+Q13+Q14 + Cluster B Q15=B propose/accept/reject + cooldown N=12 weeks Q10+Q16 + PARALLEL Q11=B verified + mesocycle exit Q9=A + Convergence Guard reference + weaknessDetector reuse §36.84 invariant

### Build + Tests
- Pre-commit hook ran `npm run test:run` → **2382 PASS / 0 FAIL** ✅
- Baseline 2192 → 2382 = **+190 tests** Specialization V1 (target estimat 120-160 tests, ~30 over budget — split was cleanest by module, 6 test files)
- Test files: 124 → 130 = +6 new test files
- ZERO regression strict: all 2192 prior tests still PASS exact
- Duration full suite: ~104s (no perceptible regression vs prior baseline)

### Commits (1)
- `4cf50ab` feat(engine): Specialization V1 implement — Faza 2.5 batch 6 (ADR 026 §9.6 SSOT) — 7 source modules + 6 test files, +190 tests (2192 → 2382 PASS), Cluster A-E verbatim §9.6 spec source canonical commit `92a69fd`, **§36.84 Gap #1 invariant verified — weaknessDetector.js orfan REUSED via import (NU reimplemented 1RM ratio<0.8 detection logic, wiring detector → session builder action layer per Source 1 Engine #7 = "the cleanest spec session")**, 2-way parity only (ADR 029 STUB legacy precedent §9.3 Energy + §9.5 Tempo ADR 027/028 stub pattern), activation gating strict 4-gate priority order (Marius Q12 → tier T1+ → phase Q5+Q13 → injury Q14), Convergence Guard reference-only pattern via crossEngineHooks (NU duplicate logic, mirror §9.4 Bayesian commit `8615ec1` + §9.5 Tempo commit `d82d118` precedent finally consumed shared utility `5a16550`), PARALLEL modifier Engine #1 NU REPLACE Q11=B preserved §1.10 anti-cascade

### Pushed
- origin/main: yes (`3defdeb..4cf50ab main -> main`)

### Issues
- **ZERO src/ engine bugs found** — first run all 190 Specialization tests PASS, NU surgical fixes pre-commit needed (precedent batches: Periodization `mesocycle.js` Number(null)=0 + per-week NaN; Energy yoyo label-vs-chronological inversion; Bayesian priorPosterior expectation; Tempo zero bugs first-pass clean precedent commit `d82d118`). Specialization batch 6 first-pass clean execution — pattern Tempo precedent honored. Partial credit la Source 1 Engine #7 "cleanest spec session pas 1 → fix Q19 → final" (line 117 `149_HANDOVER`) — clarity spec → clarity implementation.
- **§36.84 Gap #1 invariant verified critical scope** — `import { detectWeakGroups } from '../weaknessDetector.js'` în `weaknessConsumer.js` line 23 (zero new code engine logic detection). Engine #7 = wiring detector → session builder action layer. Test `index.test.js` "evaluate — weaknessDetector reused via import" verifies signal flows through buildWeaknessSignal → trace.weaknessSignal cu identical output for identical logs.
- **7 source modules (NU 8) — `index.js` orchestrator counted as 7th** — handover spec mentioned "7-8 source modules". Opted for 7 (activationGating + weaknessConsumer + cooldownManager + applicationStrategy + crossEngineHooks + constants + types + index orchestrator counted ca 8th file but logical 7-module architecture). Module split balance V1 — each module ~150-300 LOC scope-appropriate. Anti-premature-abstraction per CLAUDE.md guidance (no merging or splitting beyond functional boundaries).
- **6 test files vs 5-6 spec range** — opted for 6 (one per source module + index.test.js integration). 5+1 split (5 source modules tested independently + index.test.js end-to-end ADR 018 §2 contract compliance) — clearer test surface area + scope. Tests focus pe verifying ALL anti-recurrence checklist items explicit (Maria/Gigica reject Q12 + Cut DISABLE Q5+Q13+Q14 dual safety + cooldown Q10+Q16 + PARALLEL NU REPLACE Q11=B + mesocycle exit Q9=A + Convergence Guard ref).
- **190 tests slightly over target 120-160** — variance acceptable per scope decisions count (28 cluster decisions × ~7 tests average per decision invariant verification) + 6 test files vs 5 (split clarity). Precedent comparison: Tempo V1 batch 5 +152 tests / Bayesian V1 batch 4 +142 / Energy V1 batch 3 +112 / Goal Adaptation V1 batch 2 +128. Specialization 190 highest count due to 6-field blueprint complexity + 4-gate activation gating priority order matrix coverage.
- **Activation gating 4-gate priority order verified explicit** (anti-recurrence checklist all items honored):
  - Maria/Gigica reject Q12 §45.3 LOCKED (3 dedicated tests: Maria reject + Gigica reject + priority over phase/injury)
  - Cut DISABLE 3-layer defense Q5+Q13+Q14 (3 dedicated tests: Cut blocked Marius+T2 + recovery_risk_universal rationale + dual safety dedicated)
  - Injury PainButton auto-disable Q14=A (4 dedicated tests: target affected + non-target conservative + invariant 5 layer 5 + case-insensitive)
  - Tier T1+ established gate (3 dedicated tests: T0 reject + T1/T2 eligible + null safety)
- **PARALLEL modifier Engine #1 NU REPLACE Q11=B verified explicit** — 4 dedicated tests (active+ACCUMULATION applied / active+PEAK suspended / active+DELOAD suspended Q12=A / mode always 'parallel' invariant). Trace contains `crossEngineHooks.parallelModifier` cu mode='parallel' canonical V1.
- **Q15=B propose user accept/reject NU auto-activate verified explicit** — 5 dedicated tests în weaknessConsumer.test.js + index.test.js verifies engine NEVER auto-activates without explicit user accept (default pending state cu eligibility passed → PROPOSAL_PENDING NU ACTIVE). Anti-paternalism F4 invariant preserved.
- **Pipeline canonical position 6th preserved** — engine `id = 'specialization'` consistent cu §9.6.1 verbatim. Tests verify ENGINE_ID === 'specialization'. NU "Engine #7" naming în code (consistent §9.6 compile clarification ADR 029 legacy chat strategic spec session ordering ULTIMUL prescriptive engine §36.100 100% milestone ≠ pipeline canonical position).
- **Convergence Guard reference-only pattern verified** — `getConvergenceGuardReference()` returns frozen metadata only (NO evaluation), mirrors §9.4 Bayesian + §9.5 Tempo precedent. Test "mirrors §9.4 Bayesian + §9.5 Tempo precedent" verifies `note` field references both prior engines + commit `5a16550` shared utility. ZERO duplicate logic în Specialization module.
- **Anti-cascade §1.10 preserved** — `forwardConstraintObject` returns frozen pass-through (NU mutate input); `evaluate(ctx)` defensive ctx unpacking but no mutation; tests verify `JSON.stringify(ctx)` unchanged post-call + `Object.isFrozen(constraint)` preserved.
- **Cluster A-E sum check 28 decisions ↔ implementation:** A (5 decisions: persona+tier+phase+injury+mesocycle 4w) + B (7 decisions: detector consume+consensus+top-1+reconciliation+cooldown+hard-reject+proposal) + C (5 decisions: hybrid V+F+other groups -25%+4w exit+RO label+accumulation phases) + D (5 decisions: parallel+deload+cut disable+injury+light coupling) + E (5 implicit: WhyEngine ref via signals + Q19=B noted + Q20=D Bayesian future via constants comment + weaknessDetector reuse §36.84 + dual safety rationale) + 1 cross-cutting (weaknessDetector reuse) = 28 cumulative. ✅ ZERO net new substantive — aggregation only verbatim §9.6 spec.
- **Cumulative LOCKED V1 ~659 PRESERVED unchanged** — V1 implement = aggregation only verbatim spec sources, ZERO net new substantive product/architecture cumulative.

### Next action — chat NEW pickup priority

**P1.2.5 batch 7 Faza 2.5 §9.7 Warm-up compile + V1 implement** (NEXT chat strategic recomandat):
- Pre-implement compile §9.7 Warm-up Module-Level Spec V1 ADR 026 pattern Bugatti SSOT consistent §9.1+§9.2+§9.3+§9.4+§9.5+§9.6
- Source canonical: `📤_outbox/_archive/2026-05/...` Engine #8 Warm-up section (chat strategic 2026-05-05 birou date — Engine #8 Warm-up & Mobility LOCKED §45.6 reference) — ~28-30 decisions Cluster A-E expected
- Pure-function module în `src/engine/warmup/` per ADR 018 §2 + ADR 026 §9.7 spec
- Pattern Specialization V1 batch 6 (commit `4cf50ab`): ~7 source modules + ~5-6 test files
- Estimate ~50-83 min real velocity X×3 rule (precedent batches 1-6 actual reference)

**P1.2.5 batch 8 Faza 2.5 §9.8 Deload Protocol compile + V1 implement** (post Warm-up V1 LANDED):
- Engine #4 Deload Protocol — last gate per pipeline §42.10 + standard deload week 4 preserved non-negotiable Q12=A cross-cut Specialization
- Pipeline §42.10 sequential canonical 8/8 milestone: Periodization → Goal Adaptation → **Energy** (3rd LANDED) → **Bayesian** (4th LANDED) → **Tempo** (5th LANDED) → **Specialization** (6th LANDED batch 6) → **Warm-up** (7th NEXT batch 7) → **Deload** (8th LAST batch 8)

**ADR 027 + ADR 028 + ADR 029 stub flip task** (post §9.8 LOCKED + V1 LANDED, low priority post-CC):
- Redirect ADR 027 (Energy) + ADR 028 (Tempo) + ADR 029 (Specialization) STUB → SPEC REFERENCE → §9.3 + §9.5 + §9.6 single source of truth canonical (pattern follow-up Bugatti SSOT consolidation)

**Cumulative LOCKED V1 ~659 PRESERVED unchanged** — toate batch implements + §9.X compile aggregations = verbatim spec sources, ZERO net new substantive product/architecture cumulative.
