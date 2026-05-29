# SECTION 07 — Engines pipeline (Periodization … MMI #9)

> **Weight 10% · Gate 98% · CRITICAL.** This is "the brain". The audit goal is
> blunt: every engine's I/O contract holds, every invariant is enforced, output
> is deterministic + honest. The known landmines this section was authored to
> catch: (a) the Bayesian "honesty step" — the displayed kcal MUST be the
> Bayesian conjugate posterior, NOT a `kalmanState.mu` that was computed then
> discarded (2026-05-26 NUTRITION-MATH-FLAGS §A); (b) pure-function violations
> (`Date.now()`/`Math.random()`/mutation inside an engine) per ADR 026 §9 +
> ADR 030 D2; (c) the engine→UI localization boundary (engines must emit a
> semantic `key`, not prose) — ties to §09; (d) safety invariants: kcal floor
> 1200/1000, deload week-4 non-negotiable, MRV cap, medical-disclaimer gates.
>
> **Pipeline canonical order** (`src/coach/orchestrator/adapters/index.js:52`
> `ORDERED_ADAPTERS`): 1 Periodization → 2 Goal Adaptation → 3 Energy Adjustment
> → 4 Bayesian Nutrition → 5 Tempo → 6 Specialization → 7 Warm-up → 8 Deload.
> Engine #9 MMI composes LAST in the recommendation chain (`muscleMemoryAdapter`).
> Auxiliary engines: Muscle Recovery (Big-11), Weakness Detector (Brzycki 1RM),
> PR Wall, Readiness (5-state + cold-start-from-priors), Streak, Coach Director
> (orchestrator runner).
>
> **How to run a "pure-function" step deterministically.** From repo root:
> `npx vitest run <path>` for the cited test; `npx grep`/ripgrep for the source
> greps. Determinism steps: import the engine in a Node REPL, call `evaluate(ctx)`
> twice with a frozen `ctx`, deep-equal the two outputs.

---

## 07.A — Orchestrator / Coach Director (the runner)

### [07.001] Pipeline composes in the canonical prescriptive order
- **Check:** `ORDERED_ADAPTERS` is exactly Periodization → GoalAdaptation → EnergyAdjustment → BayesianNutrition → Tempo → Specialization → Warmup → Deload, in that order.
- **Where:** `src/coach/orchestrator/adapters/index.js:52-61`.
- **Expected:** array order matches ADR 026 §42.10; ordering is driven by this explicit frozen array, NOT barrel export order.
- **Verify:** Read `index.js:52-61`; assert the 8 entries in sequence. Run `npx vitest run src/coach/orchestrator/__tests__/orchestrator.test.js` and confirm an ordering assertion exists; if absent, PARTIAL (ordering not test-pinned).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.002] `ORDERED_ADAPTERS` is frozen (refactor-proof against alphabetical sort)
- **Check:** The ordered-adapters array is `Object.freeze`-d so a downstream refactor cannot silently reorder.
- **Where:** `src/coach/orchestrator/adapters/index.js:52` (`Object.freeze([...])`).
- **Expected:** `Object.isFrozen(ORDERED_ADAPTERS) === true`.
- **Verify:** `node -e "import('./src/coach/orchestrator/adapters/index.js').then(m=>console.log(Object.isFrozen(m.ORDERED_ADAPTERS)))"` → `true`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.003] MMI #9 is NOT in the orchestrator adapter pipeline (composes last in recommendation chain)
- **Check:** Muscle Memory (engine #9) is applied AFTER the 8-engine orchestrator pipeline, in the DP→AA→accelerated-learning→MMI recommendation chain, not as a 9th `ORDERED_ADAPTERS` entry.
- **Where:** `src/engine/muscleMemoryAdapter.js:1-19` (compose order doc) + `index.js` (no `muscleMemoryAdapter` in ORDERED_ADAPTERS).
- **Expected:** MMI applied last (`applyMuscleMemoryUpgrade` is the last word on re-resume); ORDERED_ADAPTERS has 8 entries, not 9.
- **Verify:** grep `muscleMemory` in `src/coach/orchestrator/adapters/index.js` → zero matches; confirm `muscleMemoryAdapter.js:8-12` documents LAST-in-chain.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.004] Constraint Object propagates frozen, engine-to-engine, no shared state
- **Check:** When an adapter returns `output.constraintObject`, the runner extends a NEW frozen `EngineContext` for downstream adapters (immutable propagation, not shared mutable state).
- **Where:** `src/coach/orchestrator/index.js:162-171` + `contextBuilder.js:77-83` (`extendEngineContext` freezes).
- **Expected:** each propagation step produces a new `Object.freeze`-d ctx; the constraint object itself is frozen (`Object.isFrozen(co) ? co : Object.freeze(co)`).
- **Verify:** Read `index.js:164-171`; confirm `extendEngineContext` returns `Object.freeze({...ctx, meta})`. Run `npx vitest run src/coach/orchestrator/__tests__/contextBuilder.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.005] `buildEngineContext` shallow-freezes ctx + meta (surfaces accidental adapter mutation)
- **Check:** The built EngineContext is frozen so an adapter that tries to mutate `ctx`/`ctx.meta` throws (strict) or no-ops (sloppy) — never silently corrupts downstream input.
- **Where:** `src/coach/orchestrator/contextBuilder.js:56-65` (`Object.freeze(ctx)`, `Object.freeze(meta)`).
- **Expected:** `Object.isFrozen(ctx) && Object.isFrozen(ctx.meta)`.
- **Verify:** `node` import `buildEngineContext({user:{}})` → assert both frozen.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.006] Adapters never throw — runner captures thrown adapters as structured `ADAPTER_THREW`
- **Check:** An adapter that throws is caught and converted to `err({code:'ADAPTER_THREW', severity:'hard'})`, not propagated as an exception.
- **Where:** `src/coach/orchestrator/index.js:118-134`.
- **Expected:** try/catch around `adapter.invoke`; thrown → structured err with `adapterId` tagged.
- **Verify:** Run `npx vitest run src/coach/orchestrator/__tests__/adapterEngineThrew.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.007] Severity-aware halt: `hard` error halts pipeline, `soft` continues
- **Check:** `resolveSeverity` defaults absent severity to `hard` (Anti-Cascade Silent fail-safe); `BUDGET_EXCEEDED` → `soft`. Hard halts (`break`), soft continues.
- **Where:** `src/coach/orchestrator/index.js:33-52,152-160`.
- **Expected:** absent severity → `hard`; `INVALID_INPUT`/`ENGINE_THREW`/`ADAPTER_THREW`/`INVALID_ADAPTER` → `hard`; `BUDGET_EXCEEDED` → `soft`.
- **Verify:** Read `:44-52`; run `npx vitest run src/coach/orchestrator/__tests__/orchestrator.test.js` for severity branch coverage.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.008] Missing/invalid adapter → `INVALID_ADAPTER` hard halt (no silent skip)
- **Check:** A falsy adapter or one without `invoke` produces `INVALID_ADAPTER` hard err and breaks the loop.
- **Where:** `src/coach/orchestrator/index.js:95-114`.
- **Expected:** pipeline does not silently skip a broken adapter.
- **Verify:** Read `:95-114`; assert `break` after pushing `invalidErr`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.009] Runner timer uses `performance.now()` (monotonic), Date.now only as telemetry fallback
- **Check:** `nowMs()` prefers `performance.now()`; the `Date.now()` fallback is telemetry-only (duration measurement), never feeds engine logic.
- **Where:** `src/coach/orchestrator/index.js:61-66,116,135`.
- **Expected:** `Date.now()` result used only for `durationMs` sub-span, not passed into any `adapter.invoke` input.
- **Verify:** Read `:116,135`; confirm `nowMs()` value is used solely for `durationMs`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.010] `runPipeline` is a total function over a bad adapters arg
- **Check:** Non-array `adapters` → returns `[]` (never throws).
- **Where:** `src/coach/orchestrator/index.js:87-89`.
- **Expected:** `runPipeline(ctx, null)` → `[]`.
- **Verify:** `node` call with `null`/`undefined`/`{}` → `[]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.011] Result envelope is discriminated union (`{ok:true,output}` | `{ok:false,error}`), `err` never throws
- **Check:** `ok`/`err`/`isOk`/`mapOk` honor the D4 contract; `err('string')` becomes `{code:'GENERIC'}`; `mapOk` catches thrown transforms as `MAP_THREW`.
- **Where:** `src/coach/orchestrator/result.js:17-69`.
- **Expected:** errors first-class data, never exceptions.
- **Verify:** Run `npx vitest run src/coach/orchestrator/__tests__/result.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.012] Every orchestrator adapter is instrumented (telemetry coverage assertion exists)
- **Check:** A test asserts all 8 adapters are wired with telemetry sub-span instrumentation (no silent adapter).
- **Where:** `src/coach/orchestrator/__tests__/assertAllOrchestratorAdaptersInstrumented.test.js`.
- **Expected:** test passes; covers all 8 ORDERED_ADAPTERS.
- **Verify:** `npx vitest run src/coach/orchestrator/__tests__/assertAllOrchestratorAdaptersInstrumented.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.013] Golden-master parity test exists for each of the 8 adapters
- **Check:** Each adapter has a `*Parity.test.js` proving adapter output == direct engine `evaluate` output (adapter is thin shape-mapping only).
- **Where:** `src/coach/orchestrator/__tests__/{periodization,goalAdaptation,energyAdjustment,bayesianNutrition,tempo,specialization,warmup,deload}Parity.test.js`.
- **Expected:** all 8 parity files exist + pass.
- **Verify:** `npx vitest run src/coach/orchestrator/__tests__/` (run the whole dir) → 8 parity suites green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.B — Engine #1 Periodization (Floor/Ceiling volume — emits Constraint Object)

### [07.020] Input contract: consumes `ctx.{user,recentSessions,profileTier,meta}` defensively
- **Check:** `evaluate(ctx)` unpacks defensively; missing fields default to empty without throwing.
- **Where:** `src/engine/periodization/index.js:72-77`.
- **Expected:** `evaluate(undefined)` returns a valid PeriodizationResult with `tier:'none'`.
- **Verify:** `node` import `periodization/index.js`; `await evaluate(undefined)` → object with `id:'periodization'`, `tier:'none'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.021] Output shape: blueprint has the 5 prescriptive fields
- **Check:** `result.meta` = `{mesocycle_phase, volume_target_pct, intensity_target_pct, macrocycle_block, deload_window}`.
- **Where:** `src/engine/periodization/index.js:163-170`.
- **Expected:** all 5 keys present; `result.{id,tier,confidence,signals,recommendations,trace,meta}` envelope present.
- **Verify:** `node` `await evaluate(seedCtx)`; assert keys.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.022] Emits the Constraint Object (Floor/Ceiling) for downstream engines
- **Check:** Periodization emits a Constraint Object (phase, volumeMap, intensityCorridor, deloadWindow) — the single upstream source the other 7 engines consume.
- **Where:** `src/engine/periodization/index.js:154-161` (`emitConstraintObject`).
- **Expected:** `trace.constraintObject` populated; corridor present.
- **Verify:** `node` `await evaluate(seedCtx)`; assert `result.trace.constraintObject` non-null with `intensityCorridor`/`volumeMap`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.023] Intensity hard-cap ≤ 90% 1RM enforced
- **Check:** `enforceHardCapIntensity` caps the phase-multiplied corridor ceiling at the 90% 1RM hard cap.
- **Where:** `src/engine/periodization/index.js:147-152` + `crossEngineHooks.js` `enforceHardCapIntensity`.
- **Expected:** ceiling never exceeds the documented hard cap regardless of phase multiplier.
- **Verify:** `node` import `enforceHardCapIntensity`; pass ceiling above cap → assert clamped.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.024] PURE-FUNCTION INVARIANT: no `Date.now()`/`Math.random()`/mutation in periodization/**
- **Check:** No `Date.now(`, `Math.random(`, or bare `new Date(` inside the periodization engine source (tests excluded). `weeksElapsed` comes via `meta`, not the wall clock.
- **Where:** `src/engine/periodization/**` (excluding `tests/`).
- **Expected:** zero matches in non-test source. (`mesocycle.js:97,127` matches are comments only — confirm.)
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(" src/engine/periodization --glob '!**/tests/**'` → zero CODE matches (comment-only lines acceptable, flag if in executable line).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.025] DETERMINISM: same frozen ctx → byte-identical output (×2 calls)
- **Check:** Two `evaluate(frozenCtx)` calls deep-equal.
- **Where:** `src/engine/periodization/index.js`.
- **Expected:** `JSON.stringify(a) === JSON.stringify(b)`.
- **Verify:** `node` call twice; `assert.deepStrictEqual`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.026] No side effects: no localStorage/Firebase/IndexedDB/window in periodization/**
- **Check:** Engine source references no I/O sinks.
- **Where:** `src/engine/periodization/**`.
- **Expected:** zero `localStorage`/`firebase`/`indexedDB`/`window.` in non-test code. (Grep already showed only a doc-comment match in `index.js:61`.)
- **Verify:** `rg -n "localStorage|firebase|indexedDB|window\." src/engine/periodization --glob '!**/tests/**'` → comment-only.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.027] `tier:'none'` only when ctx empty; otherwise `'MED'` (honest confidence)
- **Check:** Empty user → tier `'none'`; populated user → `'MED'`; `confidence` scales with data completeness (user/sessions/macrocycle anchor).
- **Where:** `src/engine/periodization/index.js:172-180,43-51`.
- **Expected:** confidence `low`/`medium`/`high` reflects real data presence, not fabricated certainty.
- **Verify:** `npx vitest run src/engine/periodization/tests/index.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.028] Deload window week-4 calendar trigger present (non-negotiable seed)
- **Check:** When the mesocycle phase is DELOAD (calendar week-4) and not a Marius extension, a `CALENDAR` deload window of 7 days is emitted.
- **Where:** `src/engine/periodization/index.js:120-131`.
- **Expected:** `deloadWindow = {trigger:'CALENDAR', days:7}` on a week-4 DELOAD phase.
- **Verify:** `npx vitest run src/engine/periodization/tests/mesocycle.test.js` + `integration.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.029] Trigger hierarchy EARLY_SAFETY > EXTENSION_MARIUS > CALENDAR
- **Check:** `resolveTrigger` honors the documented priority; EARLY_SAFETY forces a 7-day deload window even off-calendar.
- **Where:** `src/engine/periodization/index.js:108-131` + `mesocycle.js` `resolveTrigger`.
- **Expected:** EARLY_SAFETY wins; Marius extension suppresses calendar deload (`marius_extension_granted_no_deload` signal).
- **Verify:** `npx vitest run src/engine/periodization/tests/hybridTemplate.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.C — Engine #2 Goal Adaptation (5 templates + phase auto-detect)

### [07.040] Input contract + 6-field blueprint output
- **Check:** `result.meta` = `{phase, kcal_target_delta_pct, macro_split, rep_range_modifier, rir_target_modifier, rest_time_modifier}`.
- **Where:** `src/engine/goalAdaptation/index.js:171-179`.
- **Expected:** all 6 fields present; envelope present.
- **Verify:** `node` `await evaluate(seedCtx)`; assert keys.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.041] Five goal templates resolvable + a default
- **Check:** `resolveTemplateId` maps the goal vocabulary to the template set and defaults to `tonifiere_definire` for unknown goals.
- **Where:** `src/engine/goalAdaptation/templates.js:13,26-30` + `TEMPLATE_IDS`.
- **Expected:** the documented template set (≥5) exists; unknown goal → safe default (not throw).
- **Verify:** `npx vitest run src/engine/goalAdaptation/tests/templates.test.js`; confirm a per-template count assertion.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.042] Phase auto-detection (CUT/BULK/MAINTAIN/RECOMP) from goal+sessions
- **Check:** `detectPhase` derives a phase from goal/template/user/recentSessions; RECOMP sub-phase handled.
- **Where:** `src/engine/goalAdaptation/index.js:105-108` + `phaseAutoDetection.js`.
- **Expected:** deterministic phase mapping; signals appended.
- **Verify:** `npx vitest run src/engine/goalAdaptation/tests/phaseAutoDetection.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.043] Consumes Periodization Constraint read-only, redistributes INTERIOR Floor/Ceiling (no re-emit)
- **Check:** Goal Adaptation reads `meta.periodizationConstraint`, adjusts within the corridor (Tier-3 conservative when modal pushback), and does NOT emit a new Constraint Object.
- **Where:** `src/engine/goalAdaptation/index.js:91-94,158-169`.
- **Expected:** adjusted corridors stay inside the periodization Floor/Ceiling; adapter does not surface `output.constraintObject` (parity with adapter doc).
- **Verify:** `npx vitest run src/engine/goalAdaptation/tests/index.test.js`; confirm Tier-3 conservative branch.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.044] Deload kcal override applied when constraint phase is DELOAD
- **Check:** `applyDeloadKcalOverride` mutates the base multiplier when `periodizationConstraint.phase === 'DELOAD'`; emits `deload_kcal_override_applied`.
- **Where:** `src/engine/goalAdaptation/index.js:113-125`.
- **Expected:** override applied only in deload week.
- **Verify:** `npx vitest run src/engine/goalAdaptation/tests/index.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.045] PURE-FUNCTION INVARIANT: no Date.now/Math.random/mutation in goalAdaptation/**
- **Check:** No wall-clock or RNG in goalAdaptation engine source (tests excluded).
- **Where:** `src/engine/goalAdaptation/**`.
- **Expected:** zero matches (grep of `src/engine` showed none in goalAdaptation source).
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(" src/engine/goalAdaptation --glob '!**/tests/**'` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.046] DETERMINISM ×2 + no I/O sinks
- **Check:** same frozen ctx → identical output; no localStorage/firebase/indexedDB.
- **Where:** `src/engine/goalAdaptation/**`.
- **Expected:** deep-equal; zero I/O sink matches.
- **Verify:** `node` deep-equal ×2; `rg -n "localStorage|firebase|indexedDB|window\." src/engine/goalAdaptation --glob '!**/tests/**'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.047] Push-back tiers (risk gating) emit signals, never blocking-modal silently
- **Check:** `computePushBackSignal` returns a tier + reasons; Tier-3 modal is the only escalation and is surfaced via signals (semantic), not prose.
- **Where:** `src/engine/goalAdaptation/index.js:152-156` + `pushBackTiers.js`.
- **Expected:** `pushback_<tier>` + `risk_<reason>` signals emitted.
- **Verify:** `npx vitest run src/engine/goalAdaptation/tests/pushBackTiers.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.D — Engine #3 Energy Adjustment (±15% tier-aware)

### [07.060] Input + output: emoji aggregation + bidirectional adjustment direction
- **Check:** `evaluate` aggregates emoji inputs, resolves a calibration tier, and computes an adjustment direction (UP/DOWN/NONE).
- **Where:** `src/engine/energyAdjustment/index.js:22-44` + `bidirectionalAdjustment.js`.
- **Expected:** result envelope present; direction emitted.
- **Verify:** `node` `await evaluate(seedCtx)`; assert direction in `ADJUSTMENT_DIRECTION`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.061] ±15% adjustment magnitude is tier-aware (T0 conservative)
- **Check:** Adjustment magnitude is bounded and scaled by calibration tier (anti-overshoot for cold-start T0).
- **Where:** `src/engine/energyAdjustment/bidirectionalAdjustment.js` + `constants.js`.
- **Expected:** magnitude ≤ documented ±15% cap; T0 dampened.
- **Verify:** `npx vitest run src/engine/energyAdjustment/tests/bidirectionalAdjustment.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.062] Adjustment applied INTERIOR the periodization corridor (Floor/Ceiling respected)
- **Check:** `applyIntensityAdjustmentInterior`/`applyVolumeAdjustmentInterior` keep the adjusted values inside the upstream constraint corridor.
- **Where:** `src/engine/energyAdjustment/index.js:33-40` + `crossEngineHooks.js`.
- **Expected:** never breaches Floor/Ceiling.
- **Verify:** `npx vitest run src/engine/energyAdjustment/tests/index.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.063] Yo-yo anti-flap suppression (no oscillation between adjustments)
- **Check:** `applyYoyoSuppression` prevents UP/DOWN flapping across consecutive sessions.
- **Where:** `src/engine/energyAdjustment/index.js:32` + `yoyoAntiFlap.js`.
- **Expected:** repeated borderline inputs do not oscillate.
- **Verify:** `npx vitest run src/engine/energyAdjustment/tests/yoyoAntiFlap.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.064] Medical referral banner emitted as semantic flag (not auto-action)
- **Check:** `evaluateMedicalReferralBanner` surfaces a referral signal when sustained-down energy crosses threshold — informational, not blocking.
- **Where:** `src/engine/energyAdjustment/index.js:41` + `medicalReferral.js`.
- **Expected:** banner is a tiered signal (ties to medical-disclaimer gate §15), not a forced modal.
- **Verify:** `npx vitest run src/engine/energyAdjustment/tests/index.test.js` (medical referral branch).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.065] Energy Adjustment re-emits Constraint Object (Hook 4) for downstream
- **Check:** Unlike Goal Adaptation/Bayesian (read-only), Energy Adjustment explicitly forwards/re-emits the Constraint Object so the chain stays populated for batches 4-8.
- **Where:** `src/engine/energyAdjustment/index.js:39` (`forwardConstraintObject`) + adapter batch-3 note.
- **Expected:** adapter surfaces `output.constraintObject` (the runner then propagates frozen).
- **Verify:** Read `energyAdjustmentAdapter.js`; confirm `output.constraintObject` set. Run `energyAdjustmentParity.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.066] PURE-FUNCTION INVARIANT + DETERMINISM + no I/O (energyAdjustment/**)
- **Check:** No Date.now/Math.random/new Date; no localStorage/firebase/indexedDB; ×2 deep-equal.
- **Where:** `src/engine/energyAdjustment/**`.
- **Expected:** zero matches; deterministic.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(|localStorage|firebase|indexedDB|window\." src/engine/energyAdjustment --glob '!**/tests/**'` → zero; `node` deep-equal ×2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.E — Engine #4 Bayesian Nutrition (Normal-Normal posterior — THE HONESTY STEP)

### [07.080] HONESTY: displayed kcal == Bayesian conjugate posterior.mu, NOT kalmanState.mu
- **Check:** The number the user sees is `nutrition_inference_metadata.posterior.mu` (the conjugate posterior), and the React layer reads exactly that field. `kalmanState` is stored ONLY in `trace`, never reassigned into `posterior`.
- **Where:** `src/engine/bayesianNutrition/index.js:317-323` (posterior set), `328-335` (kalmanState → `trace.kalmanState` only), `341-349` (`posterior.mu` written to metadata); React read `src/react/lib/engineWrappers.ts:918`.
- **Expected:** `posterior.mu` (conjugate) is the displayed value; `kalmanState.mu` is never assigned into `posterior.mu`.
- **Verify:** `rg -n "posterior\.mu\s*=\s*kalmanState" src/engine/bayesianNutrition/index.js` → MUST be zero. Read `index.js:341-349` to confirm metadata uses `posterior.mu`. Read `engineWrappers.ts:918` `result.meta?.nutrition_inference_metadata?.posterior?.mu`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED  *(2026-05-26 NUTRITION-MATH-FLAGS §A: Kalman is computed-then-discarded; conjugate posterior is what ships. Verify framing is honest — see 07.081.)*
- **Evidence:** _____
- **Notes:** Root-class: D047 PRIMER §2 "Kalman adaptive TDEE" brand promise vs operative conjugate. If PRIMER §2 still says raw "Kalman" without the conjugate clarification → PARTIAL (honesty-of-framing), not a wrong-number FAIL.

### [07.081] Brand-promise honesty: "Kalman" label vs operative conjugate estimator
- **Check:** Any user-facing or doc claim of "Kalman adaptive TDEE" is reconciled with the operative reality (conjugate Normal-Normal posterior; Kalman output discarded).
- **Where:** `ANDURA_PRIMER.md §2`; `src/react/lib/bayesianNutritionAggregate.ts:5-6` header comment still says "Kalman filter posterior.mu output" (stale wording).
- **Expected:** framing says "Bayesian conjugate adaptive estimator" (or equivalent honest label); no claim that the shipped number is a Kalman output.
- **Verify:** Read `bayesianNutritionAggregate.ts:1-14`; grep PRIMER for "Kalman". If header comment claims Kalman drives the shipped number → PARTIAL (misleading code comment).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** `bayesianNutritionAggregate.ts:5-6` literally says "invoke bayesianNutrition.evaluate(ctx) Kalman filter posterior.mu output" — inaccurate; the wired value is conjugate (`engineWrappers.ts:922` correctly says conjugat NU Kalman). Fix the stale comment.

### [07.082] Kalman fallback chain is inert-by-default on the live wire (EWMA, R²=0)
- **Check:** On the real wire, `recentObservedWeights`/`recentPredictedWeights` are never passed → `computeR2([],[]) === 0` → R²>0.85 gate fails → EWMA fallback active. Confirm this matches the audit observation and is harmless because the output is discarded.
- **Where:** `src/engine/bayesianNutrition/index.js:326-336`; `kalmanFilter.js:75-97,256-303`.
- **Expected:** with empty arrays, `runKalmanWithFallback` returns `ewmaFallbackActive:true, r2:0`.
- **Verify:** `node` import `runKalmanWithFallback({previousState:{mu:3000,sigma:200}, observation:2770, recentObserved:[], recentPredicted:[], flags:{bayesian_kalman_v1:true}})` → `ewmaFallbackActive:true`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Latent landmine: `kalmanFilter.js:122` Q derived in kg-domain (0.22) but observation is kcal (~3000) — harmless ONLY because output discarded (NUTRITION-MATH-FLAGS §B). If anyone wires `posterior.mu = kalmanState.mu`, this becomes a real scale bug. Flag as a regression-guard requirement.

### [07.083] HARD RULE §3.5.1 D5: engine NEVER emits a specific kcal number
- **Check:** The Bayesian engine output emits `likelihood_probabilities {deficit/surplus/maintenance}` + posterior metadata, NOT a prescriptive kcal target. The kcal target is derived downstream in the React wrapper.
- **Where:** `src/engine/bayesianNutrition/index.js:430-438` (blueprint has no kcal-target field); `116-149` (likelihoods only).
- **Expected:** no `kcal_target`/`recommendation` kcal value in engine output; `recommendations: []`.
- **Verify:** `node` `await evaluate(ctx)`; assert `result.recommendations.length === 0` and `result.meta` has no kcal-target key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.084] Conjugate Normal-Normal closed-form (no MCMC/JAX), tier-slope blend is a valid partition
- **Check:** `conjugateUpdate` uses precision-weighted closed-form; the tier slope (`prior`+`input`=1.0) is applied as a weight partition (no spurious ×2 sigma-narrowing — the E-03 fix).
- **Where:** `src/engine/bayesianNutrition/priorPosterior.js:94-131` (esp. `110-125`).
- **Expected:** `posteriorPrecision = priorPrec×slopePrior + N×likPrec×slopeInput`; defensive fallbacks when precision ≤0.
- **Verify:** `npx vitest run src/engine/bayesianNutrition/tests/priorPosterior.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.085] Tier slope: T0 70/30, T1 80/20, T2 90/10
- **Check:** `strongPriorSlope` returns the documented prior/input blend per calibration tier; defaults to T0 for unknown tier.
- **Where:** `src/engine/bayesianNutrition/priorPosterior.js:48-51` + `constants.js STRONG_PRIOR_SLOPE`; `resolveTier:31-38`.
- **Expected:** T0={prior:.7,input:.3}, T1={.8,.2}, T2={.9,.1} (per §9.4.1 A2 doc).
- **Verify:** `node` import `strongPriorSlope('T0'|'T1'|'T2')`; assert ratios.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.086] KCAL FLOOR 1200 (sex-aware 1000f/1200b) excludes sub-floor observations from learning
- **Check:** `filterKcalFloorObservations` drops observations with `kcalDaily` below the sex-derived floor BEFORE sample mean/variance — engine learns honest data only. The CDL log keeps the original (append-only transparency).
- **Where:** `src/engine/bayesianNutrition/index.js:263-282` + `observationFilter.js`; floor default 1200 when sex unknown.
- **Expected:** sub-floor observations excluded; `trace.kcalFloorFilter.excludedCount` reflects exclusions; `weightDelta`-only observations (no `kcalDaily`) pass through unchanged.
- **Verify:** `npx vitest run src/engine/bayesianNutrition/tests/observationFilter.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** This is the LEARNING-side floor. The DISPLAY-side floor is enforced in the wrapper — see 07.087.

### [07.087] KCAL FLOOR enforced on the DISPLAYED target (Math.max guard in wrapper)
- **Check:** The final displayed kcal is `Math.max(adjustedMu, readUserKcalFloor())` and any target/phase override is also floored — no path can ship a sub-floor target.
- **Where:** `src/react/lib/engineWrappers.ts:930,943` (`Math.max(..., readUserKcalFloor())`).
- **Expected:** every kcal branch (Bayesian, goal-mult, personal-target, phase-override) is floored sex-aware.
- **Verify:** `npx vitest run src/react/__tests__/lib/engineWrappers.getNutritionTargetsToday.test.ts`; assert sub-floor inputs clamp.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Ties to §15 invariants + §03 progress nutrition.

### [07.088] Subponderal guardrail (BMI≤18.5 → surplus, not deficit) applied AFTER precedence
- **Check:** `applyHealthyFloorGuardrail` raises kcal to a moderate growth surplus (TDEE×1.08) when the user is underweight, applied after the phase/target/goal precedence so it catches any deficit source.
- **Where:** `src/react/lib/engineWrappers.ts:738-751,948`; `targetSafety.ts`/`clampKcalToHealthyFloor`.
- **Expected:** underweight user never gets a deficit/maintenance target; `healthyFloorClamped:true` surfaced to UI.
- **Verify:** `npx vitest run src/react/__tests__/lib/engineWrappers.getNutritionTargetsToday.test.ts` (BUG #4/#13 cases).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.089] Impossible-deadline target is capped (±25% deficit / +15% surplus TDEE)
- **Check:** `computeTargetKcalOverride` caps the daily shift asymmetrically so a 110→62kg-in-4-days target cannot produce a dangerous kcal.
- **Where:** `src/react/lib/targetSafety.ts:156-196` (`MAX_DAILY_DEFICIT_TDEE_FRACTION=0.25`, surplus 0.15).
- **Expected:** absurd deadline → `capped:true`, shift clamped; floor still applied downstream.
- **Verify:** `node` import `computeTargetKcalOverride(110,62,'2026-06-04',2500, new Date('2026-05-31'))` → `capped:true`, kcal ≥ floor.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** `evaluateTargetRate` (`targetSafety.ts:101-130`) also surfaces an `unsafe` verdict + suggested safe deadline — anti-paternalism (warns, does not block).

### [07.090] Passive Mode tripwire (>75 / ED history / medical conditions) → semantic signals, no specific kcal
- **Check:** `detectSpecialPriors` flags passive mode + special priors; engine surfaces `passive_mode_*` / `special_priors_*` signals and a Tier-2 banner — never a prescriptive number, preserving Maria-65 autonomy.
- **Where:** `src/engine/bayesianNutrition/index.js:240-253,402-404,420-424` + `priorPosterior.js:199-233`.
- **Expected:** `passive_mode_active:true` routes UI to Tier-2 banner (medical referral), not a blocking modal.
- **Verify:** `npx vitest run src/engine/bayesianNutrition/tests/index.test.js` (passive mode branch).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Ties to medical-disclaimer gate §15.

### [07.091] Phase reset Hybrid (CUT↔BULK) resets Layer 1+2, preserves Layer 4 (streak)
- **Check:** `evaluatePhaseReset` flags reset only on CUT→BULK / BULK→CUT transitions; preserves Goal-Shift streak (Layer 4).
- **Where:** `src/engine/bayesianNutrition/index.js:255-261` + `priorPosterior.js:170-183`.
- **Expected:** `shouldReset:true` only on those transitions; `preserveLayers` includes Layer 4.
- **Verify:** `npx vitest run src/engine/bayesianNutrition/tests/priorPosterior.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.092] Validate-persisted-state guard prevents catastrophic mu→0 silent default
- **Check:** `validateKalmanState` rejects corrupt persisted state (mu NaN, sigma negative) so a loaded-from-storage corruption cannot produce a "lose 80kg overnight" recommendation.
- **Where:** `src/engine/bayesianNutrition/kalmanFilter.js:216-240`.
- **Expected:** invalid state → `{valid:false, reason}`; caller prompts re-calibration.
- **Verify:** `npx vitest run src/engine/bayesianNutrition/tests/kalmanFilter.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.093] σ posterior collapse (CI too tight) — calibration flag, NOT a wrong-number bug
- **Check:** With several concordant observations, posterior σ shrinks aggressively → CI can become unrealistically tight (~±35 kcal). Confirm σ affects only the displayed confidence band/likelihoods, NOT `posterior.mu` (the kcal target stays correct).
- **Where:** `src/engine/bayesianNutrition/priorPosterior.js:118-130`; NUTRITION-MATH-FLAGS §D.
- **Expected:** kcal target unaffected; only CI/likelihood over-confident. Acceptable as PARTIAL (calibration), not FAIL.
- **Verify:** `node` run `conjugateUpdate` with 5 tight observations; observe σ; confirm `posterior.mu` reasonable.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Proposed (Daniel-supervised, math-touch): σ-floor clamp (~60-80 kcal). Do NOT apply unsupervised.

### [07.094] PURE-FUNCTION INVARIANT: no Date.now/Math.random/mutation in bayesianNutrition/** engine
- **Check:** The engine modules (`index.js`, `priorPosterior.js`, `kalmanFilter.js`, `observationFilter.js`, `volumeLandmarks.js`, `profileTyping.js`, `crossEngineHooks.js`) contain no wall-clock/RNG. Time comes via `meta.nowMs` injection (`index.js:407`).
- **Where:** `src/engine/bayesianNutrition/**` (tests excluded).
- **Expected:** zero `Date.now(`/`Math.random(`/`new Date(` in non-test source; `nowMs` is read from `meta`, not generated.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(" src/engine/bayesianNutrition --glob '!**/tests/**'` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.095] DETERMINISM: same ctx (incl. injected nowMs) → identical output
- **Check:** Two `evaluate(frozenCtx)` calls with the same `meta.nowMs` deep-equal.
- **Where:** `src/engine/bayesianNutrition/index.js`.
- **Expected:** deep-equal output.
- **Verify:** `node` call ×2 with `meta.nowMs` fixed; `assert.deepStrictEqual`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.096] No I/O sinks in the engine (localStorage/Firebase live only at the React wrapper boundary)
- **Check:** Engine modules never touch storage; the wrapper (`engineWrappers.ts`, `bayesianNutritionAggregate.ts`) is the only I/O boundary.
- **Where:** `src/engine/bayesianNutrition/**` vs `src/react/lib/*`.
- **Expected:** zero `localStorage`/`firebase`/`indexedDB`/`useStore` in engine source.
- **Verify:** `rg -n "localStorage|firebase|indexedDB|useNutritionStore|useProgresStore" src/engine/bayesianNutrition --glob '!**/tests/**'` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.097] Total function: empty ctx → tier 'none', no throw
- **Check:** `evaluate({})` / `evaluate(undefined)` returns a valid result with `tier:'none'` (no observations + no demographic prior) and never throws.
- **Where:** `src/engine/bayesianNutrition/index.js:209-222,446-450`.
- **Expected:** `tier === 'none'`; envelope intact.
- **Verify:** `node` `await evaluate(undefined)` → `tier:'none'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.098] Adapter requires upstream Constraint Object (INVALID_INPUT hard) — orchestrator path coverage gap
- **Check:** `bayesianNutritionAdapter.invoke` returns `INVALID_INPUT` hard when `ctx.meta.constraintObject` is absent; AND note the coverage gap: the orchestrator builds ctx from a WORKOUT userState (no nutrition observations/demographicMu) → orchestrator path returns `tier:'none'`/mu≈0, while the SHIPPED value comes from the DIRECT path (`readBayesianNutritionContext` → `evaluate`).
- **Where:** `src/coach/orchestrator/adapters/bayesianNutritionAdapter.js:118-130`; direct path `src/react/lib/engineWrappers.ts:~741,904-918`; NUTRITION-MATH-FLAGS §C.
- **Expected:** adapter gate present; AND a real-wire eval/regression test exists for the DIRECT path (the value users actually see), since the orchestrator/Coach-Brain-Eval path does not exercise the shipped kcal.
- **Verify:** Read adapter `:123-130`. Confirm `src/react/__tests__/lib/nutritionPipeline.realwire.test.ts` exists + passes (`npx vitest run src/react/__tests__/lib/nutritionPipeline.realwire.test.ts`). If only the orchestrator path is evaluated and no direct-path eval exists → PARTIAL (coverage gap, not wrong number).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Recommendation (NUTRITION-MATH-FLAGS §C): add a 9th eval case driving the DIRECT path; do NOT force the shipped value through the orchestrator (that touches math/ctx-build).

### [07.099] Manual log + source precedence honored (manual > engine-bn > baseline)
- **Check:** `getNutritionTargetTodayReal` returns `source:'manual'` when a full manual entry exists; otherwise engine; otherwise baseline.
- **Where:** `src/react/lib/bayesianNutritionAggregate.ts:40-65`.
- **Expected:** precedence order exact; manual confidence=1.
- **Verify:** `npx vitest run src/react/__tests__/lib/nutritionObservations.test.ts` + aggregate tests.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.F — Engine #5 Tempo / Form cues

### [07.110] Output: tempo prescription + form cues + mind-muscle, emitted as semantic data
- **Check:** `evaluate` returns tempo prescription, form cues, and mind-muscle cue references (not raw UI prose baked in).
- **Where:** `src/engine/tempo/index.js` + `tempoPrescription.js`, `formCues.js`, `mindMuscle.js`.
- **Expected:** result envelope present; cues are keys/structured, translatable downstream.
- **Verify:** `node` `await evaluate(seedCtx)`; inspect blueprint. `npx vitest run src/engine/tempo/tests/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.111] Consumes Constraint Object read-only (no re-emit)
- **Check:** Tempo reads `meta.periodizationConstraint` but does not emit a new one (same pattern as Goal/Bayesian).
- **Where:** `src/engine/tempo/index.js` + `tempo/crossEngineHooks.js`.
- **Expected:** adapter does not surface `output.constraintObject`.
- **Verify:** Read `tempoAdapter.js`; run `tempoParity.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.112] PURE-FUNCTION INVARIANT + DETERMINISM + no I/O (tempo/**)
- **Check:** No Date.now/Math.random/new Date; no I/O sinks; ×2 deep-equal.
- **Where:** `src/engine/tempo/**`.
- **Expected:** zero matches; deterministic.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(|localStorage|firebase|indexedDB" src/engine/tempo --glob '!**/tests/**'` → zero; `node` deep-equal ×2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.113] LOCALIZATION BOUNDARY: form-cue strings are semantic keys, not hardcoded prose (ties §09)
- **Check:** Form cues / mind-muscle text emitted by the engine are keys (or canonical RO with a documented translation seam), so the React boundary localizes — not English/RO prose hardcoded into the engine output the UI renders verbatim.
- **Where:** `src/engine/tempo/formCues.js`, `mindMuscle.js`.
- **Expected:** engine emits `key`-style identifiers; UI maps to i18n. If raw prose is emitted and rendered directly → PARTIAL (i18n leak risk).
- **Verify:** Read `formCues.js`/`mindMuscle.js`; grep for diacritics + user-prose returned to UI. Cross-check `noHardcodedStrings`/`i18nNoRoLeak` scanner covers any React consumer.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.G — Engine #6 Specialization (4-gate)

### [07.120] Four-gate activation gating enforced
- **Check:** `activationGating` requires all four documented gates before specialization activates (no premature specialization for cold-start/Maria).
- **Where:** `src/engine/specialization/activationGating.js` + `index.js`.
- **Expected:** specialization inactive unless 4 gates pass; signals reflect gate state.
- **Verify:** `npx vitest run src/engine/specialization/tests/` (activation gating cases).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.121] Consumes Weakness Detector output (orphan wire-in §36.84 Gap #1)
- **Check:** `weaknessConsumer` ingests weakness-detector signals to target specialization at lagging groups.
- **Where:** `src/engine/specialization/weaknessConsumer.js` + `index.js`.
- **Expected:** weak groups influence specialization target.
- **Verify:** `npx vitest run src/engine/specialization/tests/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.122] Specialization suspended during deload (non-negotiable, Q12-A)
- **Check:** When deload is active, specialization is frozen/suspended (resumes post-deload) — Deload engine emits `specialization_suspended_*`.
- **Where:** `src/engine/deload/index.js:406-415` (`consumeSpecializationActive`).
- **Expected:** `suspended:true` during deload state.
- **Verify:** `npx vitest run src/engine/deload/tests/index.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.123] PURE-FUNCTION INVARIANT + DETERMINISM + no I/O (specialization/**)
- **Check:** No Date.now/Math.random/new Date; no I/O; ×2 deep-equal.
- **Where:** `src/engine/specialization/**`.
- **Expected:** zero matches; deterministic.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(|localStorage|firebase|indexedDB" src/engine/specialization --glob '!**/tests/**'` → zero; `node` deep-equal ×2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.H — Engine #7 Warm-up / Mobility

### [07.130] Output: warmup routine + duration + cooldown emit
- **Check:** `evaluate` composes a persona-aware warmup routine (5-10 min hybrid, T0 instant-skip default) + cooldown signal.
- **Where:** `src/engine/warmup/index.js` + `routineComposer.js`, `durationCalculator.js`, `cooldownEmitter.js`, `skipManager.js`.
- **Expected:** duration bounded; T0 skip default present.
- **Verify:** `npx vitest run src/engine/warmup/tests/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.131] Consumes deload DELOAD_LIGHTER signal (next-session lookahead)
- **Check:** Warmup honors the Deload `forwardWarmupLighterSignal` (lighter warmup during deload).
- **Where:** `src/engine/deload/index.js:417-423` + `warmup/crossEngineHooks.js`.
- **Expected:** lighter routine when deload active.
- **Verify:** `npx vitest run src/engine/warmup/tests/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.132] PURE-FUNCTION INVARIANT + DETERMINISM + no I/O (warmup/**)
- **Check:** No Date.now/Math.random/new Date; no I/O; ×2 deep-equal.
- **Where:** `src/engine/warmup/**`.
- **Expected:** zero matches; deterministic.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(|localStorage|firebase|indexedDB" src/engine/warmup --glob '!**/tests/**'` → zero; `node` deep-equal ×2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.133] LOCALIZATION BOUNDARY: warmup/cooldown labels are keys, not prose
- **Check:** Routine/cooldown text emitted is key-style, localized at the React boundary.
- **Where:** `src/engine/warmup/routineComposer.js`, `cooldownEmitter.js`.
- **Expected:** no rendered-verbatim prose with diacritics in engine output.
- **Verify:** Read modules; grep diacritics returned to UI.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.I — Engine #8 Deload (week-4 non-negotiable + MRV invariant) — TERMINAL

### [07.140] Output: 9-field blueprint emit verbatim
- **Check:** `result.meta` = `{deload_state, depth_pct, duration_weeks, intensity_modifier, partial_scope, notification_tier, wording, ui_label, signals}`.
- **Where:** `src/engine/deload/index.js:442-453`.
- **Expected:** all 9 fields present in both idle and active paths.
- **Verify:** `node` `await evaluate(seedCtx)` for IDLE + active; assert keys.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.141] WEEK-4 SCHEDULED_LINEAR deload is non-negotiable (calendar trigger)
- **Check:** A calendar week-4 (`DELOAD` phase / `CALENDAR` window) deterministically produces `SCHEDULED_LINEAR` deload state with the canonical depth.
- **Where:** `src/engine/deload/index.js:275-281,310-327` + `triggerHierarchy.js detectLinearTrigger`; `constants.js:36,51-58,178`.
- **Expected:** week-4 → `SCHEDULED_LINEAR`, `duration_weeks:1`, depth from MAX formula.
- **Verify:** `npx vitest run src/engine/deload/tests/triggerHierarchy.test.js` + `index.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Ties to §15 cross-cutting invariants (deload week-4).

### [07.142] Final_Depth = MAX(scheduled 45%, reactive 60%, behavioral 30%) + capped behavioral modifiers
- **Check:** `computeFinalDepth` takes the MAX of the three depth components; behavioral modifiers are additive and capped (15%), never multiplicative (anti-cascade).
- **Where:** `src/engine/deload/index.js:329-349` + `depthCalculator.js`; `constants.js:170-186` (45/60/30, cap 15, extension preserve 60).
- **Expected:** reactive (60) overrides scheduled (45); behavioral additive within cap.
- **Verify:** `npx vitest run src/engine/deload/tests/depthCalculator.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.143] Extension depth clamped to 60% (atrophy literature limit Schoenfeld/Helms)
- **Check:** Week-2 extension depth never exceeds the 60% atrophy-limit; emits the documented signal.
- **Where:** `src/engine/deload/index.js:347-349` + `constants.js:174 depthExtensionPreservePct:60`.
- **Expected:** clamped at 60%.
- **Verify:** `npx vitest run src/engine/deload/tests/depthCalculator.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.144] MRV INVARIANT: partial scope resolves per-muscle when MRV exceeded alone
- **Check:** `resolvePartialScope` returns a per-muscle partial scope (not full-body) when MRV-exceeded is the sole driver; full-body systemic only on cross-muscular signals.
- **Where:** `src/engine/deload/index.js:391-404` + `partialScopeResolver.js`.
- **Expected:** per-muscle scope when `mrvExceededAlone`; emits `deload_partial_scope_per_muscle_mrv_alone_*`.
- **Verify:** `npx vitest run src/engine/deload/tests/partialScopeResolver.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.145] Intensity modifier obligatoriu: RIR +1, intensity −12.5%
- **Check:** Active deload always applies `{rir_increment:1, intensity_pct_decrement:12.5}` (the obligatory B4 modifier).
- **Where:** `src/engine/deload/index.js:351-355` + `constants.js:176-177` + `depthCalculator.resolveIntensityModifier`.
- **Expected:** active state → those exact values; idle → zeros.
- **Verify:** `node` active vs idle blueprint; assert `intensity_modifier`. (`buildIdleBlueprint:172-182` zeros.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.146] Trigger hierarchy: Composite > AA > Linear (+ EARLY_SAFETY override)
- **Check:** `resolveTriggerHierarchy` honors priority; multi-signal consolidation escalates severity additively.
- **Where:** `src/engine/deload/index.js:284-306` + `triggerHierarchy.js`.
- **Expected:** documented priority; `deload_multi_signal_consolidation_*` on ≥2 active sources; composite hard-disabled when engine-deload active (anti-math-collision).
- **Verify:** `npx vitest run src/engine/deload/tests/triggerHierarchy.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.147] Hard reset linear block (anti back-to-back week-5)
- **Check:** After a reactive deload, `applyHardResetLinear`/`computeDuration` reset the linear block so no back-to-back week-5 deload stacks.
- **Where:** `src/engine/deload/index.js:357-389` + `durationManager.js`.
- **Expected:** `hardResetLinearApplied` signal on reactive trigger.
- **Verify:** `npx vitest run src/engine/deload/tests/durationManager.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.148] Notification tier: T0 silent, T1+ banner_detailed
- **Check:** `resolveNotificationTier` returns SILENT for T0 cold-start (anti-friction) and BANNER_DETAILED for T1/T2.
- **Where:** `src/engine/deload/index.js:133-138,430-433` + `constants.js:137-140`.
- **Expected:** tier-correct notification surface.
- **Verify:** `npx vitest run src/engine/deload/tests/index.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.149] LOCALIZATION: deload wording/ui_label are RO strings — confirm boundary handling
- **Check:** `WORDING_RO` + `buildUiLabel` emit RO prose directly in the engine output (`constants.js:213-239`). Confirm the React boundary either renders these as canonical RO no-diacritics OR maps them to i18n keys — and that they are diacritic-free per D-LEGACY-064.
- **Where:** `src/engine/deload/constants.js:213-221,232-239`.
- **Expected:** strings are no-diacritics RO; if EN locale is needed, a translation seam exists. Engine-emitted prose is a deviation from the "emit key, not prose" rule → PARTIAL unless a documented mapping exists.
- **Verify:** Read `constants.js:213-239`; confirm no diacritics; check the React deload banner consumer for `t()` mapping. Ties to §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Deload (and Readiness 07.182, PR 07.171) emit RO prose directly — this is the cross-cutting localization-boundary smell to flag for §09.

### [07.150] PURE-FUNCTION INVARIANT + DETERMINISM + no I/O (deload/**)
- **Check:** No Date.now/Math.random/new Date; no I/O; ×2 deep-equal; constants doc claims "ZERO Date.now / Math.random".
- **Where:** `src/engine/deload/**` (`constants.js:17` asserts this).
- **Expected:** zero matches; deterministic.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(|localStorage|firebase|indexedDB" src/engine/deload --glob '!**/tests/**'` → zero; `node` deep-equal ×2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.151] Deload adapter requires upstream Constraint Object (terminal, no re-emit)
- **Check:** `deloadAdapter` consumes the frozen constraint read-only (Hook D1), is terminal (forwardedConstraint null), and follows the read-only consume pattern.
- **Where:** `src/coach/orchestrator/adapters/deloadAdapter.js` + `deload/index.js:425-428`.
- **Expected:** terminal; parity test green.
- **Verify:** `npx vitest run src/coach/orchestrator/__tests__/deloadParity.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.J — Engine #9 MMI (Muscle Memory — composes LAST)

### [07.160] MMI applied last in recommendation chain, opt-in gated
- **Check:** `applyMuscleMemoryUpgrade` only modifies a recommendation when `mmiContext.userChoice === 'accepted'`; refused/undecided → baseline pipeline wins unchanged.
- **Where:** `src/engine/muscleMemoryAdapter.js:46-85`.
- **Expected:** non-accepted → recommendation returned untouched; accepted → MMI start weight with forensic flags.
- **Verify:** `npx vitest run src/engine/__tests__/muscleMemoryAdapter.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.161] Forensic audit trail on upgrade (append-only transparency)
- **Check:** An MMI upgrade tags `_muscleMemoryApplied`, `_mmiOriginalKg`, `_mmiPeakPrePauseKg`, `_mmiStartMultiplier`, `_mmiBoostMultiplier`, `_mmiBucket`.
- **Where:** `src/engine/muscleMemoryAdapter.js:75-84`.
- **Expected:** all 6 forensic fields present on upgrade.
- **Verify:** `node` call with accepted ctx; assert flags.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.162] MMI start weight + boost are deterministic; `weeksSinceResume` passed explicitly (no wall clock)
- **Check:** `computeMmiStartingWeight`/`computeMmiBoostMultiplier` are pure; `computeWeeksSinceResume(resumeDate, currentDate)` takes the current date as an explicit arg (no internal `Date.now()`).
- **Where:** `src/engine/muscleMemoryAdapter.js:122-130`; `muscleMemoryIndex.js`.
- **Expected:** current date injected; deterministic.
- **Verify:** Read `:122-130` (uses `new Date(arg)` on passed strings, not `Date.now()`). `npx vitest run src/engine/__tests__/muscleMemoryIndex.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** `new Date(resumeStartDate)`/`new Date(currentDate)` parse explicit args — acceptable (seedable). Confirm no bare `new Date()`/`Date.now()`.

### [07.163] MMI silent-cap behavior wired in React layer
- **Check:** The React wrapper enforces the MMI silent-cap (re-resume conservative start) test pins behavior.
- **Where:** `src/react/__tests__/lib/engineWrappers.mmi-silent-cap.test.ts`.
- **Expected:** test passes.
- **Verify:** `npx vitest run src/react/__tests__/lib/engineWrappers.mmi-silent-cap.test.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.164] `readMmiState` is the single DB seam (I/O isolated from pure adapter)
- **Check:** DB read is encapsulated in `readMmiState(db)`; the upgrade function itself is pure.
- **Where:** `src/engine/muscleMemoryAdapter.js:103-111`.
- **Expected:** only `readMmiState` touches `db.get`; `applyMuscleMemoryUpgrade` takes data in.
- **Verify:** Read `:103-111`; confirm seam isolation.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.K — Auxiliary: PR Wall (PR Engine)

### [07.170] PR detection: weight / reps / volume, first-ever set is not a PR
- **Check:** `detectPR` returns weight/reps/volume PR types with strict-greater comparisons; empty prior history → null (non-trivial bar).
- **Where:** `src/engine/prEngine.js:30-93`.
- **Expected:** correct PR classification; baseline-injected entries excluded.
- **Verify:** `npx vitest run src/engine/__tests__/prEngine.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.171] LOCALIZATION BOUNDARY: `formatPRMessage` emits hardcoded RO prose
- **Check:** `formatPRMessage` returns RO sentences directly (`Record nou la ...`) — engine-emitted prose, not a semantic key.
- **Where:** `src/engine/prEngine.js:103-116`.
- **Expected:** per the "emit key not prose" rule this is a deviation → PARTIAL unless the React PR badge re-derives via i18n keys and ignores this string. Confirm diacritic-free (D-LEGACY-064) regardless.
- **Verify:** Read `:103-116`; confirm no diacritics; check the React PrFlash/PR badge consumer — does it call `formatPRMessage` (prose) or build from `detection.{type,kg,reps}` via `t()`?
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Flag for §09. If the UI uses `detection` + i18n and `formatPRMessage` is only a non-React/test helper, downgrade severity.

### [07.172] PURE: detectPR has no Date.now/Math.random/mutation
- **Check:** PR detection is pure over (exercise, set, history).
- **Where:** `src/engine/prEngine.js`.
- **Expected:** zero wall-clock/RNG; no mutation of `history`.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(|\.push\(|\.sort\(" src/engine/prEngine.js` → no input mutation (uses `.filter`/`.reduce`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.L — Auxiliary: Weakness Detector (Brzycki 1RM)

### [07.180] Brzycki 1RM formula + valid rep range [1,12]
- **Check:** `brzycki1RM = weight × 36/(37-reps)`; returns null outside reps 1-12 or falsy inputs.
- **Where:** `src/engine/weaknessDetector.js:25-28`.
- **Expected:** correct formula; null guards; no divide-by-zero (reps=37 impossible by guard).
- **Verify:** `node` `brzycki1RM(100,5)` ≈ 112.5; `brzycki1RM(100,13)` === null. `npx vitest run src/engine/__tests__/weaknessDetector.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.181] Weak-group detection: <80% of peer-average 1RM, Big-11 grouping
- **Check:** `detectWeakGroups` flags groups with relative 1RM < 0.80 of the average; requires ≥2 groups; uses last log per exercise (max ts).
- **Where:** `src/engine/weaknessDetector.js:140-170` + `getLastLogPerExercise:57-73` + `resolveGroup:81-104`.
- **Expected:** weak groups sorted weakest-first; ratio rounded to avoid float mismatch.
- **Verify:** `npx vitest run src/engine/__tests__/weaknessDetector.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.182] PURE: weaknessDetector has no Date.now/Math.random/mutation
- **Check:** Pure over the logs array; uses Map/reduce, no input mutation.
- **Where:** `src/engine/weaknessDetector.js`.
- **Expected:** zero wall-clock/RNG; no mutation of `logs`.
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(" src/engine/weaknessDetector.js` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.M — Auxiliary: Muscle Recovery (Big-11) + Muscle Map

### [07.190] Big-11 canonical taxonomy + recovery state thresholds
- **Check:** `getRecoveryByGroup` aggregates muscle-head state into Big-11 groups; FATIGUED≥35, PARTIAL≥12; pain escalation only RAISES state (never lowers).
- **Where:** `src/engine/muscleRecovery.js:41-59,68-` + `muscleRecoveryConstants.js`.
- **Expected:** 11 groups; thresholds applied; pain recency window 3 days.
- **Verify:** `npx vitest run src/engine/__tests__/muscleRecovery.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.191] Time injection: `now` is an injectable default param (`now = Date.now()`)
- **Check:** Recovery/muscle-map functions accept `now` as a default-parameter (`getRecoveryByGroup(logs, pain, now = Date.now())`, `getMuscleState(logs, now = Date.now())`) so tests inject a fixed clock — the SEEDABLE determinism pattern per ADR 026 §9.
- **Where:** `src/engine/muscleRecovery.js:68,98,126,159`; `src/engine/muscleMap.js:62`.
- **Expected:** every time-dependent fn has an injectable `now`; no bare in-body `Date.now()` that can't be overridden.
- **Verify:** Read the four `muscleRecovery.js` signatures + `muscleMap.js:62`; confirm default-param pattern (acceptable). Tests pass a fixed `now`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Default-param `now = Date.now()` is the documented seedable boundary (header `muscleRecovery.js:8-10`) — PASS. Contrast with bare in-body `new Date()` in adherence/proactive/sys/readiness/dp (07.200-07.204) which are NOT injectable.

### [07.192] DETERMINISM with injected `now`: same logs + same now → identical state
- **Check:** Two `getRecoveryByGroup(logs, pain, FIXED_NOW)` calls deep-equal.
- **Where:** `src/engine/muscleRecovery.js`.
- **Expected:** deep-equal.
- **Verify:** `node` call ×2 with fixed now; deep-equal.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.N — Auxiliary: Readiness (5-state + cold-start-from-priors)

### [07.195] Five-state verdict + semantic `key` (i18n boundary done right)
- **Check:** `getReadinessVerdict` returns a `key` (PR_DAY/SOLID/NORMAL/MODERATE/LIGHT/REST/REST_RECOVER) AND a canonical RO `label` — the React boundary translates via the key; the prose label is back-compat for engine tests.
- **Where:** `src/engine/readiness.js:53-74`.
- **Expected:** every verdict has a `key`; UI uses `coachEngine.readiness.labels.*` via key (per Wave E4 comment `:55-57`).
- **Verify:** Read `:53-74`; confirm `key` on every branch. Check the React readiness consumer uses `key`+`t()`, not `label` verbatim.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** This is the GOOD pattern (semantic key emitted). Use as the contrast reference for 07.149/07.171 prose-emitting engines.

### [07.196] Cold-start: no PR-day claim without training history (honesty)
- **Check:** With `hasHistory=false` (fresh user), even a top readiness score does NOT promote "Zi de PR" — it returns NORMAL. Honest: nothing to beat.
- **Where:** `src/engine/readiness.js:53,66-68`.
- **Expected:** `hasHistory=false` + high score → `key:'NORMAL'`, `canPR:false`.
- **Verify:** `node` `getReadinessVerdict(95, {hasHistory:false})` → NORMAL. `npx vitest run src/engine/__tests__/readiness.test.js` + `readiness.boundaries.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Relevant to the always-present orb cold-start path (§02).

### [07.197] Score uses per-user nutrition targets (not flat 2000/180) — fair to small users
- **Check:** `getComputedReadinessScore(targetKcal, targetProt)` threads per-user targets; falls back to flat constants only at cold-start. Prevents penalizing Maria (1400 kcal target) against a flat 2000.
- **Where:** `src/engine/readiness.js:90-115` (esp. `:112-113`).
- **Expected:** per-user target used when threaded; ratio fair.
- **Verify:** `node` compare score for kcal=1400/target=1400 vs flat 2000; threaded version not penalized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.198] Readiness is NOT a pure ADR-026-§9 engine — I/O baked in (DB + bare `new Date()`)
- **Check:** `readiness.js` reads/writes `DB` (`saveReadiness`, `getTodayReadiness`) and uses a bare `new Date()` (`:105`) — it is a legacy auxiliary engine with I/O at module scope, NOT one of the pure pipeline engines.
- **Where:** `src/engine/readiness.js:77-88,105`.
- **Expected:** Acknowledge as legacy boundary engine. The pure scoring core (`getReadinessScore`, `getReadinessVerdict`) IS pure; the wrappers do I/O. Flag `:105` bare `new Date()` as non-injectable (can't seed "yesterday").
- **Verify:** Read `:77-88,102-115`. Confirm pure core vs I/O wrapper split.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** `getComputedReadinessScore` computes "yesterday" via bare `new Date()` (`:105`) — not injectable → that branch is not deterministically testable. PARTIAL: recommend a `now` param like muscleRecovery.

---

## 07.O — Auxiliary engines: pure-function violation sweep (the §9 audit)

> These steps grep the engine tree for impurity. Default-parameter `now = Date.now()`
> (muscleRecovery/muscleMap/scheduleAdapter) is the SEEDABLE pattern → acceptable.
> Bare in-body `new Date()` / `Date.now()` (not injectable) is the violation.

### [07.200] VIOLATION SWEEP: `adherence.js` uses bare `new Date()` (non-injectable)
- **Check:** `adherence.js:8` `new Date().getDay()` and `:94` `new Date()` are in-body, non-injectable wall-clock reads.
- **Where:** `src/engine/adherence.js:8,94`.
- **Expected:** Flag — adherence's day-of-week + cutoff depend on the wall clock with no `now` injection → not deterministically testable, ADR 026 §9 boundary smell.
- **Verify:** `rg -n "new Date\(\)" src/engine/adherence.js`; confirm no `now` param on the enclosing fn.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Fix: thread `now` as a default param. PARTIAL (auxiliary, not a prescriptive pipeline engine).

### [07.201] VIOLATION SWEEP: `proactiveEngine.js` heavily wall-clock dependent (bare `new Date()`/`Date.now()`)
- **Check:** `proactiveEngine.js` reads the clock in many spots (`:24,52,93,119,161,189,213,214,236,266`) without injection.
- **Where:** `src/engine/proactiveEngine.js`.
- **Expected:** Flag — time-of-day greetings / staleness windows depend on un-injected clock → non-deterministic; hard to seed for tests.
- **Verify:** `rg -n "new Date\(\)|Date\.now\(\)" src/engine/proactiveEngine.js` → 10+ matches; confirm none injectable.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** PARTIAL — proactive nudges are auxiliary; recommend a `now`/`getHour` injection seam.

### [07.202] VIOLATION SWEEP: `sys.js` uses bare `new Date()` (`:89,178,232,274`)
- **Check:** `sys.js` reads the wall clock in-body, including a phase decision `new Date() < TARGET_DATE` (`:274`).
- **Where:** `src/engine/sys.js:89,178,232,274`.
- **Expected:** Flag — `:274` makes a CUT/AUTO phase decision off the live date with no injection → the result changes by calendar date, non-deterministic.
- **Verify:** `rg -n "new Date\(\)" src/engine/sys.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** PARTIAL. Same `new Date() < TARGET_DATE` smell appears in `dp.js` (07.203).

### [07.203] VIOLATION SWEEP: `dp.js` phase logic uses bare `new Date() < TARGET_DATE` (`:187,291,334,361,395`)
- **Check:** The DP (progression) engine gates CUT/AUTO on a live `new Date() < TARGET_DATE` comparison without injection in 5 places.
- **Where:** `src/engine/dp.js:187,291,334,361,395`.
- **Expected:** Flag — recommendation weight can change purely because the wall-clock crossed `TARGET_DATE`, with no seedable override → determinism/testability risk on a SAFETY-adjacent engine (it sets prescribed load).
- **Verify:** `rg -n "new Date\(\) < TARGET_DATE" src/engine/dp.js` → 5 matches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Higher concern than the other auxiliaries because DP drives prescribed load. Recommend injecting `now`/phase explicitly (mirror the §9 pipeline engines which take phase via constraint, not the clock).

### [07.204] VIOLATION SWEEP: `calibration.js` uses bare `Date.now()` (`:190,216,235,263`)
- **Check:** Calibration tier/staleness math reads `Date.now()` in-body (no injection).
- **Where:** `src/engine/calibration.js:190,216,235,263`.
- **Expected:** Flag — staleness/recalibration windows depend on the un-injected clock; one branch (`:189-190`) does fall back to `new Date()`.
- **Verify:** `rg -n "Date\.now\(\)|new Date\(\)" src/engine/calibration.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** PARTIAL — recommend `now` injection.

### [07.205] CONFIRM: the 8 prescriptive pipeline engines have ZERO clock/RNG (clean)
- **Check:** A single sweep across the 8 pipeline engine dirs returns zero `Date.now(`/`Math.random(`/bare `new Date(` in non-test source — proving the §9 purity invariant holds where it matters most (the brain pipeline), and that all impurity is isolated to auxiliary engines (07.200-07.204).
- **Where:** `src/engine/{periodization,goalAdaptation,energyAdjustment,bayesianNutrition,tempo,specialization,warmup,deload}/**` + `muscleMemoryAdapter.js`.
- **Expected:** zero matches in those dirs (tests excluded).
- **Verify:** `rg -n "Date\.now\(|Math\.random\(|new Date\(" src/engine/periodization src/engine/goalAdaptation src/engine/energyAdjustment src/engine/bayesianNutrition src/engine/tempo src/engine/specialization src/engine/warmup src/engine/deload --glob '!**/tests/**'` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** This is the headline §9 invariant for the gate. The 8 pipeline engines clean = the brain is deterministic; the auxiliary clock reads (07.200-07.204) are the punch-list.

### [07.206] No `Math.random()` anywhere in `src/engine/**` (zero RNG in the brain)
- **Check:** Absolutely no `Math.random(` in any engine source (pipeline or auxiliary).
- **Where:** `src/engine/**`.
- **Expected:** zero matches (the earlier full-tree grep returned none).
- **Verify:** `rg -n "Math\.random\(" src/engine` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## 07.P — Cross-cutting engine pipeline integration

### [07.210] End-to-end moat pipeline e2e test passes (real engines, no mocks)
- **Check:** The moat pipeline e2e test exercises the real engine chain end-to-end.
- **Where:** `src/engine/__tests__/moatPipeline.e2e.test.js`.
- **Expected:** passes; no mocked engine math.
- **Verify:** `npx vitest run src/engine/__tests__/moatPipeline.e2e.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.211] Real-wire nutrition pipeline regression guard passes (direct path)
- **Check:** `nutritionPipeline.realwire.test.ts` drives the shipped DIRECT path (`readBayesianNutritionContext` → `evaluate` → wrapper) end-to-end with zero mocks.
- **Where:** `src/react/__tests__/lib/nutritionPipeline.realwire.test.ts`.
- **Expected:** passes; proves the conjugate posterior 3224→2820-style adaptation is real.
- **Verify:** `npx vitest run src/react/__tests__/lib/nutritionPipeline.realwire.test.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.212] All engine batch suites green (regression baseline)
- **Check:** The engine `__tests__` batch + per-engine suites all pass (the ~4290+ baseline).
- **Where:** `src/engine/__tests__/**` + `src/engine/*/tests/**` + `src/coach/orchestrator/__tests__/**`.
- **Expected:** zero failing engine tests.
- **Verify:** `npx vitest run src/engine src/coach` → all green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** Green tests are necessary but not sufficient — past audits found bugs the tests encoded. Pair with the manual honesty steps (07.080-07.082).

### [07.213] Budget guard: pipeline sub-spans respect the <50ms-median per-engine budget
- **Check:** The orchestrator budget utility flags engines exceeding the documented budget (`BUDGET_EXCEEDED` soft).
- **Where:** `src/coach/orchestrator/utilities/budget.js` + `__tests__/budget.test.js`.
- **Expected:** budget enforced as soft (continue-graceful), not silent.
- **Verify:** `npx vitest run src/coach/orchestrator/utilities/__tests__/budget.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.214] Convergence guard (T0→T1→T2 unlock) is orchestrator-level, not engine-emitted
- **Check:** `convergenceGuard` lives at orchestrator level; engines reference it but do not emit `meta.convergenceGuard`.
- **Where:** `src/coach/orchestrator/utilities/convergenceGuard.js` + `__tests__/convergenceGuard.test.js`.
- **Expected:** tier-unlock logic centralized; engine purity preserved.
- **Verify:** `npx vitest run src/coach/orchestrator/utilities/__tests__/convergenceGuard.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

### [07.215] Engine outputs never mutate the input ctx (immutability across the chain)
- **Check:** No engine mutates `ctx`/`ctx.meta`; the frozen ctx (07.005) would surface a mutation attempt. Confirm via a frozen-ctx call that does not throw and that `ctx` is unchanged after `evaluate`.
- **Where:** all 8 `evaluate` fns; `src/coach/orchestrator/contextBuilder.js`.
- **Expected:** post-`evaluate`, the input ctx is deep-equal to its pre-call snapshot.
- **Verify:** `node` snapshot ctx → `await evaluate(ctx)` → deep-equal snapshot, per engine.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _____
- **Notes:** _____

---

## SECTION 07 GATE

- **Gate:** 98%. CRITICAL section — zero open FAIL permitted on safety invariants
  (kcal floor 07.086/07.087/07.088/07.089, deload week-4 07.141, MRV 07.144,
  medical-disclaimer/passive-mode 07.090) and the honesty step (07.080).
- **Known PARTIALs expected (framing/calibration, not wrong-number):** 07.081
  (stale "Kalman" comment in `bayesianNutritionAggregate.ts`), 07.082/07.093
  (Kalman inert + σ collapse — documented, harmless today), 07.098 (orchestrator
  eval coverage gap), 07.149/07.171 (engine-emitted RO prose vs semantic key),
  07.200-07.204 (auxiliary-engine bare-clock impurity).
- **Headline PASS expected:** 07.205 (the 8 pipeline engines are clock/RNG-free)
  and 07.206 (zero RNG in the whole engine tree) — the core §9 determinism gate.
- Emit the running scorecard after this section.
