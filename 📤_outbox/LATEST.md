## Task: Faza 2.5 batch 2 Engine #2 Goal Adaptation V1 implement per ADR 026 §9.2 + ADR 018 §2
**Model:** Opus
**Status:** Complete

### Pre-flight
- Backup tag: `pre-faza2.5-goal-adaptation-v1-implement-2026-05-06-1446` ✅ pushed origin
- Clean tree pre-execution: yes
- Baseline tests: **1658 PASS / 0 FAIL** ✅
- Grep PATHS verified: ADR 026 §9.2 + ADR 018 §2 + ADR 024 + `src/engine/periodization/` + `src/coach/orchestrator/result.js` toate exist
- Tooling availability: `test:run` (vitest 3.2.4) + `typecheck` (tsc) ✅; **NO `lint`** (anti-Slip 4 transparent skip)

### Modificări

**`src/engine/goalAdaptation/`** NEW directory (8 source modules + 5 test files = 13 files, 2520 LOC):

Source modules:
- `constants.js` (313 LOC) — 5 templates ID + GOAL_TO_TEMPLATE + 4 PHASES + TDEE_MULTIPLIERS verbatim 0.82/0.75/1.00/1.08/1.15/±2% + DELOAD_KCAL_BONUS 1.03/1.05 + MACRO_BANDS protein 1.6-2.2 g/kg LBM + fat 0.8-1.0 g/kg + RECOMP_THRESHOLDS newbie 12w/detrained 6w/BF% high 25%/32% + TEMPLATE_BASE_MODIFIERS RIR + rep × 5 templates verbatim §9.2.4 + TEMPLATE_REST_SECONDS + MODE_OVERLAY estetica/forta/none multiplicative + PHASE_TRAINING_MODIFIERS + MODE_PHASE_CEILING ±20% Trigger 4 + PUSHBACK_TIERS 3 tiers + PUSHBACK_RISK_THRESHOLDS Tier 3 cap MEV-50% + 75% 1RM + REPROMPT_LIMITS 28d rolling/21d post-confirm/60d post-shift/cap 4/an + SEX enum
- `types.js` (92 LOC) — JSDoc `GoalAdaptationResult` extends DimensionResult + 6-field `GoalAdaptationBlueprint` (phase / kcal_target_delta_pct / macro_split / rep_range_modifier / rir_target_modifier / rest_time_modifier) + `MacroSplit` + `PushBackSignal` + `RepromptDecision`
- `templates.js` (103 LOC) — `resolveTemplateId` goal→template + `isNewbieEffect` + `isDetrainedReturn` + `isFatRichProfile` + `detectRecompSubPhase` (eligibil Tonifiere/Slăbire only)
- `phaseAutoDetection.js` (220 LOC) — `basePhaseForGoal` + `basePhaseForTemplate` + `tdeeMultiplierForPhase` cu CUT/BULK aggressive variants Marius opt-in + newbie+Forță combo + `applyDeloadKcalOverride` + `detectPhase` runtime + `computeLbm` + `computeMacroSplit` cu carb remainder
- `trainingModifiers.js` (161 LOC) — `resolveModeOverlay` case+diacritic insensitive + `computeRepRangeModifier` + `computeRirTargetModifier` + `computeRestTimeModifier` + `computeModePhaseMultipliers` cu ceiling rule clamp ±20%
- `pushBackTiers.js` (228 LOC) — `computeRiskScore` 4-factor additive (BF% + age 60+ + injury + forta×age cumulative) + `tierForScore` + `tier3ConservativeModifiers` + `computePushBackSignal` + `evaluateReprompt` 4-cooldown anti-spam logic
- `crossEngineHooks.js` (119 LOC) — `readIntensityCorridor` + `readVolumeCorridor` Hook 1 read-only + `applyTier3Conservative` cap intensity 75% + volume MEV-50% (anti-cascade preserve frozen Periodization) + `redistributeIntensity` interior corridor
- `index.js` (200 LOC) — entry `evaluate(ctx) → GoalAdaptationResult` async pure total + ENGINE_ID 'goalAdaptation' + computeConfidence

Tests (~5 files, 1084 LOC, 128 tests):
- `tests/templates.test.js` (24 tests) — resolveTemplateId 5 templates + isNewbieEffect + isDetrainedReturn + isFatRichProfile sex-specific + detectRecompSubPhase eligibility + multi-trigger
- `tests/phaseAutoDetection.test.js` (32 tests) — basePhaseForGoal/Template + tdeeMultiplierForPhase verbatim 0.82/0.75/1.08/1.15/1.00 + applyDeloadKcalOverride +3% bonus + detectPhase RECOMP override + computeLbm explicit/fallback + computeMacroSplit bands verbatim
- `tests/trainingModifiers.test.js` (26 tests) — resolveModeOverlay diacritic + computeRepRangeModifier 5 templates + Mode shifts ±1 + computeRirTargetModifier + computeRestTimeModifier 30s floor + computeModePhaseMultipliers ceiling clamp ±20%
- `tests/pushBackTiers.test.js` (27 tests) — computeRiskScore 4-factor + Tier mapping 0/1/≥2 + tier3ConservativeModifiers verbatim 0.50/0.75 + computePushBackSignal full + evaluateReprompt 4 cooldowns
- `tests/index.test.js` (19 tests) — entry contract DimensionResult + 6-field blueprint + total function + deterministic 10-invocation + RECOMP newbie + Tier 3 push-back + DELOAD kcal override + Mode forta rep shift -1 + confidence high

### Build + Tests
- **Tests:** 1658 → **1786 PASS / 0 FAIL** (+128 new tests Goal Adaptation batch 2)
- **Typecheck:** ✅ clean (`tsc --noEmit`)
- **Surgical bug fix pre-commit:** 1 test ctx mismatch (test "CUT phase + DELOAD" used `goal: 'hipertrofie'` + empty `recentSessions` → triggered RECOMP sub-phase auto-detection unexpected); fixed by changing test scope to "BULK phase + DELOAD" cu `goal: 'forta'` + recent sessions populated. ZERO src/ engine bugs uncovered.

### Commits (1)
- `bf9814e` feat(engine): batch 2 Goal Adaptation V1 implement per ADR 026 §9.2 + ADR 018 §2 — Pure-function module 8 source + 5 test files; evaluate(ctx) → GoalAdaptationResult Standardized Contract; 30 decisions Cluster 1-5 verbatim; 6-field blueprint; 5 templates + Mode overlay multiplicative + RECOMP sub-phase auto; TDEE thresholds verbatim; DELOAD kcal +3% override; 3-tier push-back proporțional + Tier 3 caps MEV-50%/75% 1RM; Re-prompt anti-spam (28d/21d/60d/cap 4/an); Cross-engine Hook 1 frozen read-only; 1658 → 1786 PASS / 0 FAIL (+128); typecheck clean; pattern Periodization V1 batch 1 commit `1303b62` honored; cumulative LOCKED V1 ~659 PRESERVED

### Pushed
- origin/main: yes (`a78a6d9..bf9814e main -> main`)

### Issues
- **Surgical bug fix transparency:** 1 test ctx mismatch fix pre-commit (test scope adjusted "CUT" → "BULK" + `recentSessions` populated să eviți RECOMP auto-detection trigger pe `tonifiere_definire` template detrained-return path). NU silent skip — explicit transparency. ZERO src/ engine bugs uncovered (engine logic correct: RECOMP sub-phase eligibility funcționează exact per spec §9.2.2 Cluster 2 + §2.5 Q5 LOCKED V1).
- **Tooling skipped (transparency):** `npm run lint` does NOT exist in package.json (anti-Slip 4 reinforced — verified pre-flight, NU fabricated execute).
- **Cumulative LOCKED V1 ~659 PRESERVED unchanged** (implementation aggregation only verbatim §9.2 spec, ZERO net new substantive decisions).
- Ceiling rule (Mode + Phase max −20%/+20%) cross-hook precedent §9.2.6 Reconsideration Trigger 4 candidate adoptat V1 conservative pre-emptive (anti-degenerate cumulative reduction Invariant 1 V≤MRV violation).
- **Pre-flight grep PATHS + tooling availability ✅** anti-Slip 4 + Slip 5 grep recidivă reinforced (memory rule `feedback_grep_before_prompt_cc.md` honored).

### Next action — chat NEW pickup priority pivot

**P1.2.5 batch 3 Faza 2.5 Engine #3 Energy Adjustment V1 pre-implement compile** (NEXT chat strategic per pipeline §42.10 sequential):
- Pre-compile §9.3 ADR 026 Engine #3 Energy Module-Level Spec V1 pattern Bugatti SSOT consistent §9.1+§9.2 (compile drafts LANDED commits `cd6d9a4` + `6be84f8`)
- Source: ADR 027 Engine #5 Energy Adjustment + chat strategic Energy spec materials (consumed archives)
- Pattern §9.1+§9.2 honored: Cluster 1-5 verbatim + Reconsideration Triggers + Cross-refs ADR 018 §2 + ADR 026 §1.10 Pipeline Order
- Estimate ~50-83 min real velocity X×3 rule (precedent §9.1+§9.2 compile drafts)

**Faza 2.5 batches 4-7 sequential per pipeline §42.10** (post §9.3 Energy compile + V1 implement):
- Engines #4 Bayesian → #5 Deload → #6 Tempo → #7 Specialization → #8 Warm-up
- Pre-implement compile §9.4-§9.8 ADR 026 pattern Bugatti SSOT consistent

**Faza 3 wiring real Strangler** (post all engines V1 LANDED):
- featureFlag `<engine>_via_orchestrator` rollout 0% + golden-master parity tests
- Phase 1-2 orchestrator foundation `src/coach/orchestrator/` LANDED safe commit `5a16550` reusable
