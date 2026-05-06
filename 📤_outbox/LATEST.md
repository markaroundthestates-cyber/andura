## Task: Faza 2.5 batch 7 Engine Warm-up V1 implement per ADR 026 §9.7 + ADR 018 §2
**Model:** Opus
**Status:** Complete

### Pre-flight
- `git fetch --all` ✅ (chat-5 lesson learned applied — anti-drift local-vs-remote check FIRST)
- Local in sync cu origin/main `57394d1` post §CC.5 ingest chat-5 + §9.7 compile
- Backup tag: `pre-faza2.5-batch7-warmup-v1-implement-2026-05-06-2117` ✅ pushed origin
- Clean tree pre-execution: yes
- Baseline tests: **2382 PASS / 0 FAIL** ✅
- Pattern precedent verified: `src/engine/specialization/` exists local (8 files, V1 batch 6 commit `4cf50ab`)
- Target absent verified: `src/engine/warmup/` did NOT exist pre-execution
- §9.7 source confirmed: ADR 026 lines 1286+ §9.7 LANDED commit `c15ad0f` (21 decisions Cluster A-E)
- Tooling availability: `test:run` (vitest 3.2.4) + `typecheck` (tsc) ✅; **NO `lint`** (anti-Slip 4 transparent skip)

### Modificări

**`src/engine/warmup/`** NEW directory (8 source modules + 5 test files = 13 files, 2478 LOC):

Source modules:
- `constants.js` (277 LOC) — CALIBRATION_TIERS T0/T1/T2 + PERSONA Maria/Gigica/Marius + WARMUP_STATE enum (ACTIVE/SKIPPED/DELOAD_LIGHTER/INJURY_DISABLED) + ROUTINE_TYPE Hybrid V1 + GOAL_PHASE + PERIODIZATION_PHASE + ENERGY_DIRECTION + SCHEMA_CONSTANTS (duration 5-10 min default + Energy DOWN clamp 7 + Hybrid sets 1-2 general + 2-3 specific + cooldown 2 min) + PERSONA_DURATION (Maria 5-10 / Gigica 5-7 / Marius 8-10 ramp) + GENERAL_DYNAMIC_EXERCISES RO native pool + SPECIFIC_MUSCLE_EXERCISES RO map per muscle group + MARIUS_RAMP_PROTOCOL 50/70/90% × 5/3/1 + COOLDOWN_STRETCHES RO native + buildUiLabel("Încălzire ~X min")
- `types.js` (182 LOC) — JSDoc `WarmupResult` extends DimensionResult + 12-field `WarmupBlueprint` (warmup_state + duration_min + routine_type + general_sets/list + specific_sets/list + target_muscle_groups + skip_available + cooldown_state + ui_label + signals) + `DurationDecision` + `RoutineDecision` + `SkipDecision` + `CooldownState` + 4 cross-engine signal types + `ConvergenceGuardReference` typedef
- `durationCalculator.js` (167 LOC) — `resolvePersonaDuration` Cluster B3 verbatim + `resolveGoalPhaseModifier` Cluster D2 light coupling + `isDeloadWeek` Cluster D1 + `isEnergyDownAutoShorten` Cluster D3 anti-cascade + `computeDuration` integration B1+B2+B3+D
- `routineComposer.js` (151 LOC) — `selectGeneralExercises` 1-2 general dynamic Cluster B2 + `selectSpecificExercises` 2-3 specific cu Specialization weak group prioritize Cluster D4 PARALLEL modifier + `composeRoutine` integration Hybrid Q65.2
- `skipManager.js` (104 LOC) — `resolveSkipDefaultByTier` T0 instant skip ramp-up integrated / T1+ opt-in expanded Cluster E1 §45.6.5 + `isSkipAvailable` always true V1 Source 1 §65.3 buton vizibil session 1 anti-paternalism ADR 025 + `computeSkipDecision` integration
- `cooldownEmitter.js` (62 LOC) — `composeCooldown` optional 2 min stretch text-only Source 1 §65.4 OVERRIDE Q4 RECONCILED supersedes Source 2 §45.6 Q-Cooldown defer + suppress când INJURY_DISABLED (Pain-Aware §9.4.6 reference)
- `crossEngineHooks.js` (229 LOC) — `consumeFrozenConstraint` Hook D1 read-only anti-cascade §1.10 + `consumeGoalPhase` Hook D2 light coupling + `consumeEnergyReadiness` Hook D3 + `consumeSpecializationWeakGroup` Hook D4 §9.6 PARALLEL modifier + `forwardConstraintObject` Hook D5 pass-through immutable + `getConvergenceGuardReference` §9.4.6 reference-only metadata (NU duplicate logic) + `isPainAwareProactiveTrigger` returns false V1 (Clean Signal rule preserved Invariant 5) + `detectInjuryDisabled` Pain Button user-triggered detection
- `index.js` (334 LOC) — entry `evaluate(ctx) → WarmupResult` async pure total + ENGINE_ID 'warmup' + `computeConfidence` + `resolveTier` + `buildInsufficientBlueprint` + warmup_state determination priority order (INJURY_DISABLED > SKIPPED > DELOAD_LIGHTER > ACTIVE) + tier semantic (HIGH=ACTIVE / MED=SKIPPED|DELOAD_LIGHTER / LOW=INJURY_DISABLED / none=insufficient) + pipeline 7th canonical clarified header (NU "Engine #8" legacy)

Tests (~5 files, 972 LOC, 107 tests):
- `tests/index.test.js` (271 LOC, 23 tests) — public API contract + ENGINE_ID + tier 'none' insufficient ctx + total function + deterministic 10-invocation + ZERO side effects ctx frozen + 12-field blueprint complete + warmup_state determination priority + skip_available always true V1 + routine_type "hybrid" V1 + ui_label RO native + cooldown offered ACTIVE / suppressed INJURY_DISABLED + confidence high
- `tests/durationCalculator.test.js` (200 LOC, 28 tests) — persona thresholds Maria/Gigica/Marius verbatim + Goal phase modifier + DELOAD week detection + Energy DOWN auto-shorten + computeDuration integration + Energy DOWN priority over Marius BULK ramp + durationMin integer rounded
- `tests/routineComposer.test.js` (172 LOC, 21 tests) — selectGeneralExercises 1-2 clamp + selectSpecificExercises Specialization weak group prioritize + Hybrid integration + RO native exercises verified + unknown muscle skipped defensive + routineType always "hybrid" V1 LOCKED Q65.2
- `tests/skipManager.test.js` (107 LOC, 15 tests) — T0 instant skip ramp-up integrated + T1+ opt-in expanded + skipAvailable always true V1 invariant + anti-paternalism (NU disable după 3+ logged) + integration computeSkipDecision
- `tests/crossEngineHooks.test.js` (222 LOC, 20 tests) — Hook D1 frozen read-only + DELOAD signal + Hook D2 phase modulation rationale + Hook D3 Energy DOWN autoShortenApplied + Hook D4 weak group prioritize + Hook D5 pass-through immutable + getConvergenceGuardReference frozen + isPainAwareProactiveTrigger false V1 + detectInjuryDisabled Pain Button signal

### Build + Tests
- **Tests:** 2382 → **2489 PASS / 0 FAIL** (+107 new tests Warm-up batch 7)
- **Typecheck:** ✅ clean (`tsc --noEmit`)
- **ZERO regression** — baseline preserved exact pre/post + all new tests pass clean first-run (NO surgical bug fixes needed — pattern §9.6 Specialization V1 batch 6 cleanest precedent honored)

### Commits (1)
- `20999fb` feat(engine): warmup V1 implement per ADR 026 §9.7 batch 7 — pipeline §42.10 7th — 8 source modules + 5 test files; pure function evaluate(ctx) → WarmupResult per ADR 018 §2 + ADR 030 D2 thin scope; Cluster A-E full coverage (I/O contract + warmup protocol B1-B5 + cool-down strategy C1-C3 + cross-engine hooks D1-D5 + edge cases E1-E3); 2382 → 2489 PASS / 0 FAIL (+107); typecheck clean; pattern §9.6 Specialization commit `4cf50ab` cleanest precedent honored; cumulative LOCKED V1 ~659 PRESERVED

### Pushed
- origin/main: yes (`57394d1..20999fb main -> main`)

### Issues
- **ZERO STOP triggered** during pre-flight (chat-5 NEW anti-recurrence rule applied — `git fetch --all` first, in sync confirmed before backup tag).
- **ZERO src/ engine bugs uncovered** first-pass clean — pattern §9.6 Specialization V1 batch 6 cleanest precedent honored. NO surgical bug fixes needed (mai bun decât batch 1 4 fixes mesocycle, batch 2 1 test ctx, batch 3 1 yoyo logic, batch 4 1 test expectation, batch 5 0 — Warm-up matches batch 5 best-case clean).
- **Tooling skipped (transparency):** `npm run lint` does NOT exist in package.json (anti-Slip 4 reinforced — verified pre-flight, NU fabricated execute).
- **Pipeline canonical position 7th clarified header** — `index.js` + `constants.js` documentation explicitly cite §42.10 position 7th canonical (post §9.6 Specialization 6th LANDED commit `4cf50ab` precedent) + clarify "Engine #8" naming legacy chat strategic spec session ordering 2026-04-30 evening META §36.100 amendment 7→8 prescriptive engines ≠ pipeline 7th canonical position. Anti-recurrence numbering ambiguity batch 8 (§9.8 Deload final) reference reinforced.
- **Convergence Guard reference pattern excellent** — `crossEngineHooks.getConvergenceGuardReference()` returns frozen metadata (ownerSpec ADR 009 §AMENDMENT + ruleName + cleanSignalRule) NU duplicate eval logic (consistent §9.4 Bayesian + §9.5 Tempo + §9.6 Specialization precedent). Orchestrator layer evaluates actual T2 unlock per ADR 030 D5 cross-cutting utility.
- **Pain-Aware §9.4.6 reference preserved** — `isPainAwareProactiveTrigger()` returns false V1 LOCKED (Clean Signal rule consistent §9.5+§9.6 precedent — Warm-up references but NU acts proactively, user-triggered Pain Button only). `detectInjuryDisabled()` consumes orchestrator-level Pain Button state.
- **Cumulative LOCKED V1 ~659 PRESERVED unchanged** (implementation aggregation only verbatim §9.7 spec, ZERO net new substantive decisions).
- **ADR Warm-up file ABSENT recommendation** carry-forward — recommend NEW ADR `031-engine-warmup-mobility.md` SPEC REFERENCE direct (reverse pattern vs ADR 027/028/029 stub flip). Separate task post-CC low priority post batch 8 LANDED.

### Next action — chat NEW pickup priority pivot

**P1.2.5 batch 8 Faza 2.5 §9.8 Engine Deload Protocol compile + V1 implement FINAL** (NEXT chat strategic):
- Pipeline §42.10 closure complete 8/8 prescriptive engines
- Source canonical chat strategic 2026-04-30 evening §45.4 Engine #4 Deload Protocol + ADR 013 AA Detection cross-ref + composite signal §36.41 multi-trigger orchestrator unification per Source 1 line 16 (`148_HANDOVER_..._engines3-4-5_spec_sessions_CONSUMED.md`)
- Pattern §9.1-§9.7 honored: Cluster A-E verbatim + Reconsideration Triggers + Cross-refs ADR 018 §2 + ADR 026 §1.10 Pipeline Order + position 8th canonical
- Estimate: §9.8 compile ~50-83 min + V1 implement ~50-83 min real (precedent batches 1-7 actual)

**Pipeline §42.10 status post batch 7 LANDED:**
- ✅ 7/8 §9 specs LANDED (§9.1-§9.7)
- ✅ 7/8 engines V1 LANDED (Periodization + Goal Adaptation + Energy + Bayesian + Tempo + Specialization + **Warm-up THIS batch 7**)
- 🟡 §9.8 Deload compile + V1 implement PENDING batch 8 final

**Faza 3 STRANGLER wiring real** (post all 8/8 engines V1 LANDED batch 8 final):
- featureFlag `<engine>_via_orchestrator` rollout 0% default OFF
- Golden-master parity tests legacy↔orchestrated
- Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED safe commit `5a16550` reusable

**ADR Warm-up NEW file recommendation** (post §9.7 LOCKED + V1 LANDED, low priority post-CC):
- Create `03-decisions/031-engine-warmup-mobility.md` cu SPEC REFERENCE direct → §9.7 SSOT canonical (reverse pattern vs ADR 027/028/029 stub flip)
