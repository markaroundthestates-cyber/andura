# SECTION 15 — Cross-cutting invariants (CRITICAL, gate 100%)

> The "never-delete / never-break" rules that span the WHOLE app. These are the
> safety + correctness + honesty laws that no screen, refactor, or feature is
> allowed to violate. Past audits passed green while a split source-of-truth and
> hardcoded strings shipped — because the invariants had no *guard test* pinning
> them. This section enumerates every invariant and, for each, verifies three
> things:
>   (a) **EXISTS** — the rule is implemented in code (grep the locus),
>   (b) **ENFORCED** — it is wired on the REAL production path (not a dead/
>       isolated helper that nothing calls), and
>   (c) **GUARDED** — a regression test pins it so it cannot silently break.
>
> **META-LESSON (apply to every step):** an invariant that is currently correct
> but has NO guard test is **PARTIAL, not PASS** — it is one refactor away from
> silently breaking, and that is exactly the failure class this whole audit
> exists to catch. "Currently true" ≠ "protected". Flag every unguarded
> invariant as a risk even when the live behavior is right today.
>
> Gate: **100%** (CRITICAL section — safety/correctness/honesty). ANY open FAIL
> in this section blocks Beta regardless of the percentage.

---

## 15.A — SAFETY GATES (the app must never let a user hurt themselves)

### [15.001] Medical disclaimer LOCK4 — gate is actually MOUNTED on the app shell
- **Check:** The medical-disclaimer modal is rendered by the authenticated app shell (Layout), not merely defined as an unused component.
- **Where:** `src/react/routes/Layout.tsx:96-99` (`<MedicalDisclaimerModal open={!acceptedDisclaimer} onAcknowledge={acceptDisclaimer} />`); component `src/react/components/MedicalDisclaimerModal.tsx`.
- **Expected:** Layout reads `acceptedDisclaimer` from `settingsStore` and mounts the modal with `open={!acceptedDisclaimer}` so it covers the entire `/app/*` tree before any training flow. Acknowledge is the only path (no cancel).
- **Verify:** `grep -n "MedicalDisclaimerModal" src/react/routes/Layout.tsx` → must show the mount (lines 21 import + 96 usage). Historical regression: AUDIT-2 §U-01 CRIT found the modal was built + unit-tested but `acceptDisclaimer()` had ZERO non-test callers (never mounted). Confirm the mount still exists.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: Layout.tsx:96-99 verbatim + confirm import line 21)_
- **Notes:** If the mount line is gone/commented → FAIL (regression to the U-01 bug class).

### [15.002] Medical disclaimer LOCK4 — cannot be bypassed (mandatory, no cancel/skip)
- **Check:** The disclaimer modal exposes no cancel / dismiss / skip affordance — acknowledge is the single exit.
- **Where:** `src/react/components/MedicalDisclaimerModal.tsx` (testid `disclaimer-acknowledge`; absence of `disclaimer-cancel`).
- **Expected:** No `disclaimer-cancel` testid; no backdrop-click or Escape that closes without accepting; the gate blocks the routed content underneath until accepted.
- **Verify:** `grep -nE "disclaimer-cancel|onClose|onDismiss|Escape|backdrop" src/react/components/MedicalDisclaimerModal.tsx` → must return zero dismissal paths. Guard test asserts it: `src/react/__tests__/Layout.disclaimerGate.test.tsx:59-62` ("mandatory gate — no cancel button").
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: grep output + test name)_
- **Notes:** A bypass (Escape closes, backdrop closes, or a Skip link) = FAIL — the medical gate is non-negotiable per LOCK4.

### [15.003] Medical disclaimer LOCK4 — acceptance PERSISTS (does not reappear every load)
- **Check:** Acknowledging sets `acceptedDisclaimer=true` + `acceptedDisclaimerAt` timestamp in `settingsStore`, persisted (zustand `partialize`), so a remount/reload does not re-show the gate.
- **Where:** `src/react/stores/settingsStore.ts` (`acceptDisclaimer`, `acceptedDisclaimer`, `acceptedDisclaimerAt`, partialize); consumed in `Layout.tsx:50-51`.
- **Expected:** After acknowledge, `acceptedDisclaimer===true` and `acceptedDisclaimerAt` is a number; on remount the modal is absent.
- **Verify:** Guard test `src/react/__tests__/Layout.disclaimerGate.test.tsx:50-71` proves (a) acknowledge sets both fields, (b) gate does not reappear after acknowledge + remount. Also `src/react/__tests__/stores/settingsStore.test.ts` for the store action.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: test lines + a manual Playwright reload check on seeded account)_
- **Notes:** If `acceptedDisclaimer` is NOT in the persisted `partialize` slice → gate reappears each load = PARTIAL (annoyance) trending FAIL (Gigel dismisses blindly → safety theater).

### [15.004] Kcal floor 1200 — the filter exists and the constant is exactly 1200
- **Check:** A Bayesian-Nutrition observation filter enforces a daily-kcal floor of 1200 (WHO-cited), as a named constant.
- **Where:** `src/engine/bayesianNutrition/observationFilter.js` (`filterKcalFloorObservations`); `src/engine/bayesianNutrition/constants.js` (`KCAL_FLOOR_DAILY_MIN`, `KCAL_FLOOR_CITATION_SOURCE`).
- **Expected:** `KCAL_FLOOR_DAILY_MIN === 1200`; filter returns `{ filtered, excludedCount, floorMin, citationSource }`; `floorMin === 1200`, `citationSource === WHO`.
- **Verify:** `grep -n "KCAL_FLOOR_DAILY_MIN" src/engine/bayesianNutrition/constants.js`. Guard test `tests/engine/invariants/kcal-floor.test.ts:24-36` asserts (fast-check, 500 runs) `floorMin === KCAL_FLOOR_DAILY_MIN === 1200` over arbitrary observations.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: constant value + test pass)_
- **Notes:** If the constant drifts from 1200 (e.g. someone lowers it for "aggressive cut") → FAIL. The floor is a medical-safety invariant, not a tunable.

### [15.005] Kcal floor 1200 — never breached on the real path (obs < 1200 are excluded)
- **Check:** Every observation with a finite `kcalDaily < 1200` is dropped; exactly-1200 is kept (>= boundary); obs without `kcalDaily` pass through.
- **Where:** `src/engine/bayesianNutrition/observationFilter.js`; consumed by `src/react/lib/nutritionObservations.ts:238` (`meta.kcalFloorMin = resolveKcalFloorForSex(sex)`) → forwarded into the engine via `buildBayesianNutritionContext`.
- **Expected:** `excludedCount` equals the count of obs with finite `kcalDaily < 1200`; filtered obs all have `kcalDaily >= 1200`; 1199 excluded, 1200 & 1201 kept.
- **Verify:** Guard test `tests/engine/invariants/kcal-floor.test.ts:38-50, 65-76, 128-137` (boundary + excludedCount, fast-check). Real-path wire: `grep -n "kcalFloorMin\|resolveKcalFloorForSex" src/react/lib/nutritionObservations.ts` → confirms the floor is forwarded from the production context builder, not just unit-tested in isolation.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: test pass + the nutritionObservations forward line)_
- **Notes:** NB sex-differentiated floor — `resolveKcalFloorForSex` may return 1000 for women / 1200 men (see constants.js `resolveKcalFloorForSex`). Confirm the women's floor is the DELIBERATE medical value and is itself ≥ a safe minimum; if the men's path can ever pass < 1200 → FAIL.

### [15.006] Kcal floor — filter is pure + non-mutating (cannot corrupt input)
- **Check:** `filterKcalFloorObservations` is referentially transparent and does not mutate its input array.
- **Where:** `src/engine/bayesianNutrition/observationFilter.js`.
- **Expected:** same input → identical output; input array unchanged after call; non-array/garbage input handled gracefully (returns empty filtered, floorMin still 1200).
- **Verify:** Guard test `tests/engine/invariants/kcal-floor.test.ts:78-104, 106-126` (referential transparency + no-mutation + null/garbage handling, fast-check).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: test pass)_
- **Notes:** Mutation here would silently corrupt the caller's observation array → wrong TDEE downstream.

### [15.007] Deload week-4 is non-negotiable (W4 always DELOAD)
- **Check:** The mesocycle week→phase map hardcodes week 4 = DELOAD and it is frozen.
- **Where:** `src/engine/periodization/constants.js:110-115` (`WEEK_PHASES = Object.freeze({ 1:LOAD, 2:LOAD+, 3:PEAK, 4:DELOAD })`); `src/engine/periodization/mesocycle.js:27-32` (`computePhase`).
- **Expected:** `WEEK_PHASES[4] === 'DELOAD'`; out-of-range weeks coerce to W1 LOAD (defensive, never throws); the object is `Object.freeze`d (cannot be mutated at runtime).
- **Verify:** `grep -n "WEEK_PHASES\|DELOAD" src/engine/periodization/constants.js`. Guard test under `src/engine/periodization/tests/` — locate the mesocycle/computePhase test that asserts W4=DELOAD. If NONE asserts week-4=DELOAD explicitly → PARTIAL (unguarded core-safety constant).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: constant + freeze + which test pins W4=DELOAD, or "no guard test → PARTIAL")_
- **Notes:** Deload week is recovery-mandatory; if a refactor lets W4 stay LOAD, users grind 4+ weeks with no recovery = injury risk.

### [15.008] Deload — DELOAD multipliers cut volume −45% / intensity −12.5%
- **Check:** DELOAD phase applies the recovery cut (not full load).
- **Where:** `src/engine/periodization/constants.js:122-124` (`DELOAD_MULTIPLIERS = { volumeMul: 0.55, intensityMul: 0.875 }`); applied `mesocycle.js:42-54` (`volumeMultiplierForPhase`, `intensityMultiplierForPhase`).
- **Expected:** DELOAD → volumeMul 0.55 (−45%), intensityMul 0.875 (−12.5%); all other phases 1.00.
- **Verify:** `grep -n "DELOAD_MULTIPLIERS\|volumeMul\|intensityMul" src/engine/periodization/constants.js mesocycle.js`. Guard test in `src/engine/periodization/tests/` asserting the multipliers — confirm one exists; if not → PARTIAL.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: constants + multiplier function + test)_
- **Notes:** DELOAD that does not cut volume = a fake deload (recovery defeated).

### [15.009] MRV cap is an ABSOLUTE ceiling (sets capped, never multiplied past MRV)
- **Check:** Per-muscle weekly set target is capped at the Israetel MRV baseline — `Math.min(raw, MRV)`, NOT `MRV × multiplier`.
- **Where:** `src/engine/periodization/volumeLandmarks.js:124-126` (`const raw = baseline.MAV × persona × recovery × goal × block × phase; const cappedAtMrv = Math.min(raw, baseline.MRV)`); MRV table `volumeLandmarks.js:38-48`.
- **Expected:** computed sets = `max(0, round(min(raw, MRV)))`; MRV is the hard absolute ceiling regardless of how high the persona/recovery/goal multipliers push `raw`.
- **Verify:** `grep -n "cappedAtMrv\|Math.min(raw" src/engine/periodization/volumeLandmarks.js`. Guard test in `src/engine/periodization/tests/` that feeds large multipliers and asserts output ≤ MRV. If absent → PARTIAL (an "anti-cascade hard cap" §9.5/§9.6 with no regression pin is fragile).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: cap line + which test exercises raw > MRV)_
- **Notes:** Audit observation L-§A038-01 already flags glutes MRV=16 as conservative — that's a *value* judgment; the *invariant* here is the CAP MECHANISM (min, not multiply). If a refactor changes `Math.min(raw, MRV)` to scale MRV → FAIL (volume can exceed recoverable ceiling).

### [15.010] AaFriction LOCK9 — aggressive-load detector exists + is pure
- **Check:** A per-set aggressive-loading detector (`detectAggressiveLoad`) exists with the 3-pattern check (fast_sets / kg_jump / rep_spike) and is a pure function.
- **Where:** `src/react/lib/aaFrictionDetect.ts:90-129` (`detectAggressiveLoad`); thresholds `:18-32`; modal `src/react/components/AaFrictionModal.tsx`.
- **Expected:** fast_sets when interval < 30s (with timestamp>0 guard), kg_jump > 20%, rep_spike > 50%; no trigger when history empty (no baseline); priority order returns first match.
- **Verify:** `grep -n "detectAggressiveLoad\|DEFAULT_THRESHOLDS" src/react/lib/aaFrictionDetect.ts`. Guard test `src/react/__tests__/components/AaFrictionModal.test.tsx` + any `aaFrictionDetect` unit test — confirm the 3 patterns + empty-history no-trigger are asserted.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: detector + thresholds + test coverage of the 3 reasons)_
- **Notes:** LOCK9 replaced "force-typing" (D-LEGACY-013) with friction (a confirm modal, not a hard block) — confirm it's friction, not a forced stop.

### [15.011] AaFriction LOCK9 — detector is WIRED on the real log-set path (the §06 recommendation-gap)
- **Check:** `detectAggressiveLoad` is actually called in `Workout.handleLogSet` BEFORE `logSet`, and a trigger surfaces `AaFrictionModal` to the user.
- **Where:** `src/react/routes/screens/antrenor/Workout.tsx` (handleLogSet pre-logSet check → `aaFrictionModal` state); cross-ref §06 workout-flow audit.
- **Expected:** on a real aggressive set the modal appears and the set is gated behind acknowledge; the threshold may be Vitality/Adherence-driven (`deriveThresholds`).
- **Verify:** `grep -n "detectAggressiveLoad\|AaFrictionModal\|aaFriction" src/react/routes/screens/antrenor/Workout.tsx`. Then Playwright on seeded account: log a set, then log a +25% kg set → modal must appear. **CROSS-REF §06 RECOMMENDATION-GAP FINDING:** §06 flags that the detector currently fires on the *user-typed* set but the engine's *recommended* progression is not itself friction-checked — i.e. friction guards manual over-reach but an aggressive engine recommendation could bypass it. Record whether the gap from §06 is confirmed here.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: Workout.tsx call site + Playwright modal-appears + §06 gap status)_
- **Notes:** If §06's recommendation-gap is real (engine rec not friction-checked) → PARTIAL at minimum: the invariant "no aggressive load lands silently" holds for manual input but not for engine recommendations. Note the proposed fix from §06.

### [15.012] Refusal-exhaustion — pool is exhaustive + offers each candidate once
- **Check:** The "Nu vreau" substitution pool (`findRefusalPool`) returns a ranked same-muscle pool minus already-tried names, and signals exhaustion ("ai incercat tot...") when the pool is empty — no infinite ping-pong, no repeats.
- **Where:** `src/engine/alternativeFinder.js:108-163` (`findRefusalPool`); store side `src/react/stores/workoutStore.ts:595-606` (`markRefusalTried`, per-`exIdx` `refusalTriedByEx`) + `:303` state field.
- **Expected:** each candidate offered once (tried names subtracted); empty pool → exhausted flag → the UI shows the exhaustion copy; `refusalTriedByEx` is runtime-only (NOT persisted — fresh slate per session, reset on start/finish/discard).
- **Verify:** `grep -n "findRefusalPool\|exhaust" src/engine/alternativeFinder.js`; `grep -n "refusalTriedByEx\|markRefusalTried" src/react/stores/workoutStore.ts`. Guard test: `src/react/__tests__/lib/moatSubstitution.e2e.test.ts` (refusal e2e) — confirm it asserts exhaustion + no-repeat. Confirm `refusalTriedByEx` is absent from the persist `partialize` (workoutStore.ts:652-658).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: pool fn + store field + partialize exclusion + e2e test)_
- **Notes:** This is the engine "refusing" to keep proposing — when it has nothing safe/different left, it must say so honestly, not loop or re-offer a refused movement.

### [15.013] Wake-lock — acquired on entering LIVE workout
- **Check:** `navigator.wakeLock.request('screen')` is called on Workout mount, stored in a ref, and re-acquired on `visibilitychange` (foreground) when the OS released it.
- **Where:** `src/react/routes/screens/antrenor/Workout.tsx:276-315` (lockRef + acquire + visibilitychange handler).
- **Expected:** on mount `acquire()` requests the screen lock (fail-silent if unsupported); on tab foreground with null lock it re-acquires; on background it clears the ref so foreground re-acquires fresh.
- **Verify:** `grep -n "wakeLock\|lockRef\|visibilitychange" src/react/routes/screens/antrenor/Workout.tsx`. Guard test `src/react/__tests__/screens/antrenor/Workout.test.tsx` — confirm it mocks `navigator.wakeLock` and asserts request-on-mount.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: acquire effect + test)_
- **Notes:** Without wake-lock the screen sleeps mid-set (phone on the bench) — Gigel-hostile.

### [15.014] Wake-lock — RELEASED on exit (no leak)
- **Check:** The Workout unmount cleanup releases the lock and removes the visibilitychange listener.
- **Where:** `src/react/routes/screens/antrenor/Workout.tsx:306-314` (cleanup: `removeEventListener` + `lockRef.current.release()` + null the ref).
- **Expected:** on unmount the lock is released (fail-silent) and the listener detached; no dangling lock after leaving the workout.
- **Verify:** `grep -n "release()\|removeEventListener" src/react/routes/screens/antrenor/Workout.tsx`. Guard test should assert release-on-unmount in `Workout.test.tsx`. If acquire is tested but release is NOT → PARTIAL (the leak path is unguarded).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: cleanup return fn + test for release)_
- **Notes:** A leaked wake-lock drains battery after the user leaves the session.

---

## 15.B — LEGAL / CONSENT / AGE GATES

### [15.015] Consent + terms acceptance is persisted
- **Check:** Terms/privacy acceptance (and the disclaimer, §15.003) is persisted in `settingsStore` (or equivalent) so a returning user is not re-prompted, and the acceptance is auditable (timestamp).
- **Where:** `src/react/routes/screens/cont/SettingsTerms.tsx`, `src/react/routes/screens/Terms.tsx` / `Privacy.tsx`; settingsStore acceptance fields + `partialize`.
- **Expected:** acceptance flags + timestamps persisted; legal text pages reachable; re-acceptance not forced on reload.
- **Verify:** `grep -nE "accepted|consent|terms" src/react/stores/settingsStore.ts`. Guard tests `src/react/__tests__/screens/cont/SettingsTerms.test.tsx`, `src/react/__tests__/screens/LegalPages.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: persisted fields + tests)_
- **Notes:** GDPR-adjacent: acceptance must be recorded with a timestamp to be defensible.

### [15.016] Sentry / telemetry is consent-gated (no PII before opt-in)
- **Check:** Error/analytics reporting does not initialize or send before consent.
- **Where:** consent-gate test `src/__tests__/sentry-consent-gate.test.ts`; privacy screen `src/react/routes/screens/cont/SettingsPrivacy.tsx`.
- **Expected:** no telemetry transport active until the user opts in; toggling consent off stops it.
- **Verify:** Run `src/__tests__/sentry-consent-gate.test.ts`. `grep -nE "consent|sentry|telemetry" src/react/routes/screens/cont/SettingsPrivacy.tsx`. Cross-ref §12 security.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: test pass + privacy toggle)_
- **Notes:** Cross-ref §12. If telemetry fires pre-consent → FAIL (GDPR).

### [15.017] Age-gate — minimum age is ENFORCED at onboarding (CODE REALITY = 18+, not 16)
- **Check:** Onboarding rejects an age below the minimum at the store boundary, so engines never receive an underage user.
- **Where:** `src/react/stores/onboardingStore.ts:64, 85, 137-140` (`age: { min: 18, max: 99 }`, validation in the setter); comment `:64` states **"CEO 2026-05-27 adults-only 18+ (supersedes D046 §28-H5 GDPR-16 parental-consent default)"**.
- **Expected:** age < 18 is rejected with a helpful message; downstream engines never see an invalid age; the input bound matches the store bound.
- **Verify:** `grep -nE "age:|min: 18|parental|16" src/react/stores/onboardingStore.ts`. Guard test `src/react/__tests__/stores/onboardingStore.test.ts` — confirm an out-of-range age (e.g. 8, 17) is rejected.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: bound 18, validation, test)_
- **Notes:** **CROSS-CUTTING DISCREPANCY (surface to Daniel):** the audit-prompt brief says "age-gate 16 + parental consent (GDPR Art. 8)", but the CODE is **18+ adults-only** (CEO 2026-05-27 supersede), with NO parental-consent flow. There is also a comment (`:66`) referencing a `min="16"` input elsewhere — verify the actual age input field min matches 18, NOT 16 (a stale `min="16"` UI attr would let a 16-yo type a valid-looking value the store then rejects, OR worse, slip through if the input is the only check). Record which value the real input enforces. If input says 16 but store says 18 → PARTIAL (mismatch / confusing UX); if the 18+ policy is intended, the brief is stale — note it, do not "fix" the code to 16.

### [15.018] Age-gate — no engine path consumes an unvalidated age
- **Check:** Every engine/aggregate that reads `age` gets it post-validation (the store is the single gate), never from raw form state.
- **Where:** `onboardingStore.ts` setter (validation) + consumers (`engineWrappers`, `nutritionObservations`, BMR/TDEE).
- **Expected:** validated age only; defensive defaults if somehow null.
- **Verify:** `grep -rn "\.age" src/react/lib src/engine --include=*.ts --include=*.js | head` → confirm reads route through the store, not an unguarded literal. Cross-ref §07 engines.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: consumer list + validation path)_
- **Notes:** An `age=8` reaching BMR would produce a dangerous kcal target.

---

## 15.C — ENGINE DETERMINISM / PURITY (ADR 026 §9)

### [15.019] Pure-function engines — no Date.now / Math.random / mutation in engine core
- **Check:** Engine modules under `src/engine/**` and the orchestrator are pure: no `Date.now()`, no `Math.random()`, no input mutation. Time/randomness/IO live at the I/O boundary (adapters / call-sites), not inside the engines.
- **Where:** ADR 026 §9 (`03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md`) + ADR 030 D4 (engines are TOTAL functions); engines `src/engine/**`.
- **Expected:** ZERO `Date.now`/`Math.random`/`new Date()` inside engine compute paths; same input → same output. Plumbing (store reads, timestamps) sits in `src/react/lib/*Aggregate.ts` / `*Observations.ts` boundary (e.g. `nutritionObservations.ts:32-34` explicitly documents pure-fn discipline with IO at the boundary).
- **Verify:** `grep -rn "Date.now\|Math.random\|new Date(" src/engine --include=*.js` → review each hit; legitimate only in test fixtures or documented boundary shims. Cross-ref §07. A clean engine core but NO scanner test pinning it → PARTIAL.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: grep hits triaged + whether a purity guard test/scanner exists)_
- **Notes:** Cross-ref §07. If a `Date.now()` sits inside an engine, determinism (and the golden-master tests) break under clock changes — non-reproducible coaching.

### [15.020] Pipeline never emits NaN / Infinity (TOTAL functions)
- **Check:** The full orchestrated pipeline (`runPipeline(buildEngineContext(state), ORDERED_ADAPTERS)`) never emits a non-finite numeric leaf across arbitrary valid user states.
- **Where:** `src/coach/orchestrator/index.js` (`runPipeline`), `contextBuilder.js`, `adapters/index.js` (`ORDERED_ADAPTERS`).
- **Expected:** every numeric field in the pipeline output is `Number.isFinite`.
- **Verify:** Guard test `tests/engine/invariants/pipeline-finite.test.ts` (fast-check fuzz, recursive `assertAllFinite` over the whole result, ADR 026 §9 + ADR 030 D4). Run it.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: test pass + run count)_
- **Notes:** A single unguarded division surfaces as `NaN` in the UI silently (false-confidence gap). This test is the guard; if it's skipped/quarantined → FAIL.

### [15.021] Kalman state is INERT — kcal comes from posterior.mu, not kalmanState.mu
- **Check:** The kcal TDEE estimate is read from the Bayesian conjugate **posterior.mu**, never from the (inert V1) `kalmanState.mu`.
- **Where:** `src/react/lib/engineWrappers.ts:585-595, 918-932, 989` (reads `result.meta.nutrition_inference_metadata.posterior.mu`); engine `src/engine/bayesianNutrition/index.js` delivers `posterior.mu` (index.js:344), NOT `kalmanState.mu` (Kalman = inert V1, comment engineWrappers.ts:591-595).
- **Expected:** every kcal target read uses `posterior.mu`; `kalmanState.mu` is not surfaced as the user-facing TDEE.
- **Verify:** `grep -n "posterior.mu\|kalmanState.mu" src/react/lib/engineWrappers.ts src/engine/bayesianNutrition/index.js`. Guard test `tests/engine/golden-master/bayesian-nutrition.test.ts` + `src/react/__tests__/lib/engineWrappers.targetKcal.test.ts`. Confirm NO call-site reads `kalmanState.mu` for display.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: posterior.mu reads + zero kalmanState.mu display + test)_
- **Notes:** This is a HONESTY invariant (the body-fat/split-source class). If a refactor swaps to `kalmanState.mu`, the displayed kcal would be the inert filter's value, not the real posterior = lying number.

---

## 15.D — WORKOUT STATE-MACHINE INTEGRITY

### [15.022] finishSession-once — no double-finish (idempotent finalize)
- **Check:** A session can be finalized only once; a second `handleSubmit` (double-tap, re-render race) must not double-append to `sessionsHistory` or double-increment the streak.
- **Where:** `src/react/routes/screens/antrenor/PostRpe.tsx:86-195` (`handleSubmit` → `finishSession` + `incrementStreak` + navigate); store `src/react/stores/workoutStore.ts:529-553` (`finishSession`).
- **Expected:** the submit button is guarded (e.g. `disabled` until a rating is picked — PostRpe.tsx:276 — AND/OR an in-flight / already-finished guard) so a second submit is a no-op; `finishSession` clears `sessionStart` so a re-entry has no active session.
- **Verify:** `grep -nE "isSubmitting|submittedRef|disabled|finishSession" src/react/routes/screens/antrenor/PostRpe.tsx`. **GAP CHECK:** the only visible guard is `disabled={pick === null}` (PostRpe.tsx:276) which blocks "no rating" but does NOT block a rapid double-tap after a pick. Verify whether an in-flight guard exists; if NOT, a fast double-tap could call `handleSubmit` twice → two `sessionsHistory` entries + double streak. Guard test `src/react/__tests__/screens/antrenor/PostRpe.handleSubmit.prRecords.test.tsx` — check it covers double-submit. If no double-submit test exists → PARTIAL (unguarded race).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: the actual guard(s) + whether a double-submit test pins it)_
- **Notes:** `finishSession` itself is not internally idempotent (it always pushes to `sessionsHistory` — workoutStore.ts:546); the protection must live at the call-site. If neither layer guards a double-tap → FAIL (corrupt history + lying streak). Propose: `useRef` submitting-latch in PostRpe.

### [15.023] setSessionContext-before-navigate — adaptation carries into the live session
- **Check:** `WorkoutPreview.handleStart` calls `setSessionContext(...)` BEFORE `navigate('workout')`, so the per-session intensityMod/pain context survives into the live Workout (location.state is ephemeral / lost on refresh).
- **Where:** `src/react/routes/screens/antrenor/WorkoutPreview.tsx:194-199` (`setSessionContext({ intensityMod, painContext }); navigate(gotoPath('workout'))`); store field `workoutStore.ts:294` (`sessionContext`, runtime-only, NOT persisted).
- **Expected:** the set call precedes navigate; Workout reads `sessionContext` to apply the intensity modifier to targets; context is cleared on teardown (finish/discard/reset) so it never leaks into a subsequent direct-entry session.
- **Verify:** `grep -n "setSessionContext\|navigate" src/react/routes/screens/antrenor/WorkoutPreview.tsx` (confirm order 198 then 199). `grep -n "sessionContext" src/react/stores/workoutStore.ts` (confirm cleared in finishSession:550 + discardSession:525 + reset:642, and absent from partialize:652-658). Guard test `src/react/__tests__/screens/antrenor/WorkoutPreview.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: call order + teardown clears + test)_
- **Notes:** This is U-03's fix; if navigate runs first (or context not cleared on teardown), the adaptation shown on preview either never reaches the session or leaks into the NEXT one (stale "minus" energy on a fresh direct-entry workout).

### [15.024] Session-context isolation — does NOT leak across sessions (runtime-only)
- **Check:** `sessionContext` and `refusalTriedByEx` are runtime-only (excluded from `partialize`) and cleared at every teardown path.
- **Where:** `workoutStore.ts:652-658` (partialize omits `sessionContext`, `refusalTriedByEx`, `sessionStart`); cleared in `startSession:473`, `discardSession:525-526`, `finishSession:550-551`, `reset:642`.
- **Expected:** a reload does not restore an old session's intensity/pain/refusal state; a new session starts with a clean slate.
- **Verify:** `grep -n "partialize\|sessionContext\|refusalTriedByEx" src/react/stores/workoutStore.ts`. Guard test `src/react/__tests__/stores/workoutStore.test.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: partialize exclusion + clears + test)_
- **Notes:** If these were persisted, a "minus energy + knee pain" context from a month ago would silently shape today's fresh session.

### [15.025] swapExercise integrity — only drops the swapped exercise's partial sets
- **Check:** Mid-session exercise swap clears ONLY `history[exIdx]` and never touches `sessionStart`/`streak`/`lastSession`/`sessionsHistory`/`prData`/other exercises' history (RISK §8.5 safety contract).
- **Where:** `workoutStore.ts:580-590` (`swapExercise`).
- **Expected:** `history[exIdx]` dropped; if swapping the current exercise, `setIdx`/`phase`/`prHit`/`prData` reset to a fresh logging start; everything else invariant.
- **Verify:** `grep -n "swapExercise" src/react/stores/workoutStore.ts`. Guard test `src/react/__tests__/screens/antrenor/Workout.swap.test.tsx` + `src/react/__tests__/lib/moatSubstitution.e2e.test.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: action + tests)_
- **Notes:** A swap that wiped sessionStart or other exercises' history would corrupt the whole session.

---

## 15.E — DESTRUCTIVE ACTIONS (each must be drill-down confirmed)

> Invariant: every irreversible action routes to a dedicated drill-down confirm
> screen (its own route + cancel path), never a one-tap inline button.

### [15.026] Logout → drill-down confirm
- **Check:** Logout routes to `LogoutConfirm` with an explicit confirm + cancel, and on confirm clears auth (`authSignOut`) + `setAuthenticated(false)`.
- **Where:** `src/react/routes/screens/cont/LogoutConfirm.tsx`.
- **Expected:** dedicated confirm screen; confirm calls `authSignOut`; cancel returns to Cont.
- **Verify:** `grep -nE "authSignOut|setAuthenticated|cancel" src/react/routes/screens/cont/LogoutConfirm.tsx`. Guard test in `src/react/__tests__/screens/cont/`. (Historical: gsd-security-auditor caught a missing `authSignOut` on a logout path — confirm it's present.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: confirm screen + authSignOut + test)_
- **Notes:** Missing `authSignOut` = session not actually ended = §A007-class security bug.

### [15.027] Delete account → drill-down confirm + freshness gate + full GDPR wipe
- **Check:** Delete account routes to `DeleteAccountConfirm`; requires recent re-auth (`isAuthFresh`); on confirm wipes Tier 0 (stores + `localStorage.clear()`), Tier 1 (IDB `wipeUserDB`), Tier 2 (RTDB DELETE) BEFORE `authSignOut` (so the token is still valid for the cloud DELETE); sets sync-suppression flag.
- **Where:** `src/react/routes/screens/cont/DeleteAccountConfirm.tsx:75-117` (handleConfirm), `:26-51` wipeAllLocalData, `:53-73` wipeRemoteData.
- **Expected:** stale auth → bounce to `/auth?reason=reauth_required_for_delete`; fresh → `window._suppressFirebaseSync=true`, await `wipeRemoteData(uid)` (with 8s timeout race), then `wipeAllLocalData()`, then `authSignOut()`, then navigate `/auth`.
- **Verify:** `grep -nE "isAuthFresh|wipeRemoteData|authSignOut|localStorage.clear|_suppressFirebaseSync" src/react/routes/screens/cont/DeleteAccountConfirm.tsx`. Guard test `src/react/__tests__/screens/cont/DeleteAccountConfirm.test.tsx`. Cross-ref §12 (GDPR Art. 17) + §08 (data-resurrection S-07).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: order of operations + freshness gate + test)_
- **Notes:** RE-S-01 fix (await wipeRemote BEFORE signout) is the data-resurrection invariant — if a refactor reorders signout before the cloud DELETE, the RTDB backup survives delete and restores on next login = GDPR FAIL. This ordering MUST stay; confirm the test pins the order.

### [15.028] Reset data → drill-down confirm
- **Check:** Reset-data (Tier 0 erasure, keep device-id) routes to `ResetDataConfirm` with confirm + cancel; pairs `reset()` + `resetStreak()` + clears `lastSession`/`sessionsHistory`.
- **Where:** `src/react/routes/screens/cont/ResetDataConfirm.tsx`.
- **Expected:** dedicated screen; confirm wipes per the documented Tier-0 semantics (workoutStore.ts:438-441 contract); cancel returns.
- **Verify:** `grep -nE "reset|resetStreak|lastSession|sessionsHistory|cancel" src/react/routes/screens/cont/ResetDataConfirm.tsx`. Guard test `src/react/__tests__/screens/cont/ResetDataConfirm.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: confirm screen + wipe calls + test)_
- **Notes:** Confirm it does NOT erase device-id (distinct from delete-account full wipe).

### [15.029] Reset coach → drill-down confirm (CDL / decisions cleared)
- **Check:** Reset-coach routes to `ResetCoachConfirm`; clears coach-decision state (CDL / coach-decisions) without nuking the user's training logs.
- **Where:** `src/react/routes/screens/cont/ResetCoachConfirm.tsx`; `src/util/coachReset.js`.
- **Expected:** dedicated confirm screen; confirm scopes the reset to coach state; cancel returns.
- **Verify:** `grep -nE "coachReset|coach-decisions|CDL|cancel" src/react/routes/screens/cont/ResetCoachConfirm.tsx src/util/coachReset.js`. Guard test `src/react/__tests__/screens/cont/ResetCoachConfirm.test.tsx` + `src/util/__tests__/coachReset.test.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: confirm screen + scoped reset + test)_
- **Notes:** Must not delete `logs`/`weights` (those are the user's data, not coach state).

### [15.030] Schimba faza → drill-down confirm
- **Check:** Changing the training phase/goal routes to `SchimbaFazaConfirm` with explicit confirm + cancel (not an inline toggle that silently re-plans).
- **Where:** `src/react/routes/screens/cont/SchimbaFazaConfirm.tsx`.
- **Expected:** dedicated confirm screen explaining the consequence (plan/periodization re-derive); cancel returns unchanged.
- **Verify:** `grep -nE "confirm|cancel|faza|phase|goal" src/react/routes/screens/cont/SchimbaFazaConfirm.tsx`. Guard test in `src/react/__tests__/screens/cont/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: confirm screen + test)_
- **Notes:** A phase change resets the mesocycle clock; doing it silently would surprise the user mid-block.

### [15.031] Redo onboarding → drill-down confirm
- **Check:** Re-doing onboarding routes to `RedoOnboardingConfirm` (it overwrites profile inputs feeding every engine) with confirm + cancel.
- **Where:** `src/react/routes/screens/cont/RedoOnboardingConfirm.tsx`.
- **Expected:** dedicated confirm; cancel returns.
- **Verify:** `grep -nE "confirm|cancel|onboarding|reset" src/react/routes/screens/cont/RedoOnboardingConfirm.tsx`. Guard test in `src/react/__tests__/screens/cont/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: confirm screen + test)_
- **Notes:** Overwriting age/sex/weight without a gate would corrupt engine inputs from one stray tap.

### [15.032] Destructive-action enumeration is COMPLETE (no ungated irreversible action)
- **Check:** There is NO irreversible/destructive action anywhere in the app that lacks a drill-down confirm.
- **Where:** `src/react/routes/screens/cont/SettingsDanger.tsx` (the danger hub) + router `src/react/routes/router.tsx`.
- **Expected:** every danger action in SettingsDanger links to one of the confirm routes (LogoutConfirm, DeleteAccountConfirm, ResetDataConfirm, ResetCoachConfirm, SchimbaFazaConfirm, RedoOnboardingConfirm); SettingsExport is non-destructive.
- **Verify:** `grep -nE "Confirm|navigate|gotoPath" src/react/routes/screens/cont/SettingsDanger.tsx`; cross-check every link resolves to a confirm route in `router.tsx`. Guard test `src/react/__tests__/screens/cont/SettingsDanger.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: action→confirm map + any ungated action)_
- **Notes:** Any inline destructive button (no confirm route) = FAIL — one-tap data loss for Gigel.

---

## 15.F — DATA / STORAGE INTEGRITY

### [15.033] Per-UID storage isolation (Tier 1 IDB namespace = `andura_<uid>`)
- **Check:** IndexedDB is namespaced per user — `andura_<uid>` post-auth, `andura_anonymous_<deviceId>` pre-auth — so two accounts on one device never share data.
- **Where:** `src/storage/db.js:65, 98-144` (`getNamespace`, `_sanitizeNamespace`, `DB_NAME_PREFIX`); §56.1.4 LOCKED V1.
- **Expected:** namespace resolves from `getAuthState()?.uid` (sanitized) → final DB name `andura_<uid>`; anonymous falls back to device-id; cached `_namespace` with a documented force-reset (`:148-151`) for testing.
- **Verify:** `grep -nE "getNamespace|DB_NAME_PREFIX|_sanitizeNamespace|andura_" src/storage/db.js`. Guard test `src/storage/__tests__/db.test.js`. Cross-ref §08 + §12.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: namespace resolution + test)_
- **Notes:** Cross-ref §08/§12. A shared/un-namespaced DB = account A sees account B's logs = privacy FAIL. Confirm the `_namespace` cache cannot serve a STALE namespace after a user switch (db.js:108-112 documents this as a hard contract — verify the reset is called on auth change).

### [15.034] Three-tier storage integrity (Tier 0 / Tier 1 / Tier 2)
- **Check:** The 3-tier model is coherent: Tier 0 = localStorage (`src/db.js`), Tier 1 = IndexedDB per-UID (`src/storage/db.js`), Tier 2 = Firebase RTDB (REST per ADR 002); the tiering engine reads/writes the right tier.
- **Where:** `src/storage/tieringEngine.js`; `src/db.js` (Tier 0); `src/storage/db.js` (Tier 1); `src/firebase.js` (Tier 2 sync).
- **Expected:** writes land in the documented tier; reads fall through tiers; the migration runner (`src/migrations/migrationRunner.js`) handles schema bumps without data loss.
- **Verify:** `grep -nE "tier|Tier" src/storage/tieringEngine.js`. Guard tests `src/storage/__tests__/tieringEngine.test.js`, `src/migrations/__tests__/2026-05-02-tier-5-to-6.test.js`. Cross-ref §08.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: tier wiring + tests)_
- **Notes:** Cross-ref §08. A tier mismatch (Tier 2 sync overwriting fresher Tier 0) is the data-loss class.

### [15.035] Append-only CDL (Coach Decision Log) — supersede, never overwrite
- **Check:** Coach decisions are append-only: a new decision for a date marks the prior `superseded=true` and PUSHES a new entry; it never edits/deletes the historical entry in place.
- **Where:** `src/util/coachDecisionLog.js:168` (`existing.superseded = true`), `:185` (`all.push(newEntry)`), `:178` (`superseded:false` on new), `:82` (active = `superseded !== true`).
- **Expected:** the log only grows; queries read the most-recent non-superseded entry; supersede chains preserved (`:276-282`).
- **Verify:** `grep -nE "superseded|push\(|supersedes" src/util/coachDecisionLog.js`. Guard test `src/util/__tests__/coachDecisionLog.test.js`. Confirm no path SPLICES/removes an entry.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: append + supersede lines + test)_
- **Notes:** Append-only is what makes the coach auditable (why did it recommend X on day N). An in-place overwrite would erase the decision history.

### [15.036] Logs writeback — finishSession persists per-set logs for the engines
- **Check:** `finishSession` writes per-set `LogEntry[]` to Tier 0 `logs` (capped 5000, newest-first) so the engine adapters (readiness/fatigue/adherence/MMI/stagnation) actually receive session history on the React production path.
- **Where:** `workoutStore.ts:529-537` (`persistSessionLogs` inside finishSession), `:192-243` (builders + cap LOGS_MAX=5000), `:223-243` soft-fail.
- **Expected:** logs persisted on finish; cap enforced; soft-fail on quota (engines tolerate missing logs → baseline). Per-set RPE derived from coarse rating (RATING_TO_RPE).
- **Verify:** `grep -nE "persistSessionLogs|LOGS_MAX|DB.set\('logs'" src/react/stores/workoutStore.ts`. Guard test `src/react/__tests__/stores/workoutStore.finishSession.logsWriteback.test.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: writeback call + cap + test)_
- **Notes:** CRIT #2 shape-check fix — before this, React-side finish never persisted logs → engines were input-starved forever. If writeback is removed, engines silently degrade to baseline ("DATE INSUFICIENTE") permanently. Cross-ref §07/§08.

### [15.037] sessionsHistory rolling cap (no unbounded localStorage growth)
- **Check:** `sessionsHistory` is capped at `SESSIONS_HISTORY_MAX=500` (newest-tail slice) so persist never blows the ~5MB localStorage quota over a 2-3 year horizon.
- **Where:** `workoutStore.ts:190` (`SESSIONS_HISTORY_MAX = 500`), `:546` (`.slice(-SESSIONS_HISTORY_MAX)`).
- **Expected:** append then slice to last 500; older sessions drop off the tail.
- **Verify:** `grep -nE "SESSIONS_HISTORY_MAX|slice\(-" src/react/stores/workoutStore.ts`. Guard test `src/react/__tests__/stores/workoutStore.test.ts` — confirm cap is asserted. If no test feeds >500 sessions → PARTIAL.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: cap + slice + test)_
- **Notes:** U-11 fix — without the cap, persist silently fails at quota → whole history lost.

---

## 15.G — HONESTY INVARIANTS (never fabricate a number/label)

### [15.038] Readiness empty-state shows "—", not a fabricated score (the orb)
- **Check:** When the engine has no readiness history (`score` null/undefined), the ReadinessOrb shows an em-dash "—" (ring 0, neutral aqua, dimmed) — it NEVER invents a number, and the empty state forces the non-PR cue.
- **Where:** `src/react/components/pulse/ReadinessOrb.tsx:43-59, 89` (`isEmpty` → display "—", `pulseColor` forced aqua, `data-empty`).
- **Expected:** `score` null → renders "—" (line 89), `data-empty="true"`, `data-can-pr="false"`, ring pct 0; a real score → the count-up number.
- **Verify:** `grep -nE "isEmpty|'—'|data-empty|pulseColor" src/react/components/pulse/ReadinessOrb.tsx`. Guard test `src/react/__tests__/components/pulse/ReadinessOrb.test.tsx` — confirm it asserts "—" on null score AND no fabricated PR cue.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: em-dash branch + test)_
- **Notes:** This is the anti-"fake 80" honesty rule — a fresh user with no history must not see a confident-looking readiness number the engine didn't actually compute.

### [15.039] intensityMod label is honest — no fabricated "+15%" / "−25%" deltas
- **Check:** The session intensity adaptation is shown as a qualitative bucket (plus/normal/minus banner + accent color), NOT a fabricated precise percentage; any percentage shown must be the engine's real value, not a hardcoded literal.
- **Where:** `src/react/routes/screens/antrenor/WorkoutPreview.tsx:56-74` (`bannerFor`/`durationFor`/`volumeFor` keyed on intensityMod) + `:163-180` (engineIntensityMod baseline); engineWrappers comment `:757` references −25%/+15% as goal-delta deadline guards (engine values), not UI fabrication.
- **Expected:** preview banner text comes from `t('workout.preview.intensityBanner.{plus|minus|normal}')`; duration/volume estimates are bucketed constants clearly framed as estimates, NOT presented as a measured per-user delta; any "%" in the UI traces to an engine output.
- **Verify:** `grep -nE "intensityBanner|durationFor|volumeFor|%|\+15|−25|-25" src/react/routes/screens/antrenor/WorkoutPreview.tsx`. Confirm no hardcoded "+15%" string is shown as if engine-computed. Guard test `src/react/__tests__/screens/antrenor/WorkoutPreview.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: banner source + any literal % in UI + test)_
- **Notes:** Honesty class — showing "+15% intensity" as a precise figure when the engine only produced a coarse "plus" bucket is a fabricated-confidence lie. If a literal "+15%" is rendered as engine output → FAIL.

### [15.040] No fabricated muscle-group title on a recovered/degraded session
- **Check:** When the plan can't re-derive (midnight rollover / pipeline halt), a finished session is saved under an HONEST neutral title ("Antrenament") + real logged sets, NOT a fabricated "Push (piept si umeri)" lie.
- **Where:** `src/react/routes/screens/antrenor/PostRpe.tsx:97-108` (H2 / HIGH-CODE-06 fix); pause title fallback `workoutStore.ts:481-483` ("(sesiune nedefinita)").
- **Expected:** missing plan → title "Antrenament" + exercises degrade to honest "Exercitiu N"; only a session with NOTHING logged is rejected.
- **Verify:** `grep -nE "Antrenament|Exercitiu|nedefinita|getTodayWorkout" src/react/routes/screens/antrenor/PostRpe.tsx`. Guard test `src/react/__tests__/screens/antrenor/PostRpe.test.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: honest-title branch + test)_
- **Notes:** The old 'Push' lie + the midnight data-loss bug are both pinned here. If a refactor reintroduces a guessed muscle title → FAIL (Bugatti truth violation).

---

## 15.H — i18n / LOCALE INVARIANTS

### [15.041] NO_DIACRITICS — RO UI strings carry no diacritics (D-LEGACY-064)
- **Check:** No user-facing string (RO or EN) renders Romanian diacritics (ă/â/î/ș/ț) on the high-traffic screens.
- **Where:** scanner `src/i18n/__tests__/i18nNoRoLeak.test.tsx` (renders Antrenor/Workout/EnergyCheck/Progres/Istoric/Cont under EN locale, asserts zero diacritics + zero RO-only tokens).
- **Expected:** the scanner passes across all listed screens; no diacritic character appears in rendered text.
- **Verify:** Run `src/i18n/__tests__/i18nNoRoLeak.test.tsx`. Cross-ref §09 i18n completeness. **GAP:** the forbidden-token list is "intentionally compact" (scanner header) — note that this is a *sampled* set of screens + tokens, so a diacritic on an UNLISTED screen could leak (this is the exact class §09 + the harness string-scanner must close with an ALL-files scan).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: scanner pass + list of covered screens)_
- **Notes:** Cross-ref §09. If the scanner is screen-sampled rather than exhaustive → PARTIAL (unguarded screens). The diacritics rule is per D-LEGACY-064; vault docs keep diacritics, UI/tests/commits do not.

### [15.042] EN-default zero-RO-leak — no Romanian word renders under EN locale
- **Check:** Under EN locale, no RO-only token leaks (Daniel mandate 2026-05-28: "sa nu vad cuvant in romana cand e pe engleza... nici in exercitii nici pe nicaieri").
- **Where:** `src/i18n/__tests__/i18nNoRoLeak.test.tsx` (forbidden RO-token list, high-confidence RO-only words excluding proper nouns / exercise IDs / cognates).
- **Expected:** zero forbidden RO tokens under EN across the covered screens.
- **Verify:** Run the scanner. Cross-ref §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: scanner pass)_
- **Notes:** Cross-ref §09. Same sampling caveat as 15.041 — a leak on an unlisted screen escapes. The harness's all-files i18n scanner (per WORKED EXAMPLE 09.001 InstallPrompt leak) is the real guard; this scanner is the screen-level backstop.

---

## SECTION 15 — SCORECARD ROLLUP

```
15 Cross-cutting invariants        PASS  PART  FAIL  BLOCK   %     GATE   STATUS
  A Safety gates (001-014)         --    --    --    --      --%
  B Legal/consent/age (015-018)    --    --    --    --      --%
  C Engine purity (019-021)        --    --    --    --      --%
  D Workout FSM (022-025)          --    --    --    --      --%
  E Destructive actions (026-032)  --    --    --    --      --%
  F Data/storage (033-037)         --    --    --    --      --%
  G Honesty (038-040)              --    --    --    --      --%
  H i18n (041-042)                 --    --    --    --      --%
  SECTION 15 TOTAL                 --    --    --    --      --%   100%   ----
```

> **Gate reminder:** CRITICAL section. ANY open FAIL here blocks Beta regardless
> of percentage. Every PARTIAL is an *unguarded invariant* — schedule a guard
> test before Beta even if the live behavior is currently correct, because the
> whole point of this audit is that "correct-but-unprotected" is one refactor
> from "silently broken". Known cross-section follow-ups to confirm:
>   - 15.011 AaFriction recommendation-gap (→ §06)
>   - 15.017 age-gate brief-vs-code discrepancy 16 vs 18 (surface to Daniel)
>   - 15.022 finishSession double-tap latch (likely PARTIAL — propose useRef)
>   - 15.041/15.042 i18n scanner is screen-sampled (→ §09 + harness all-files scan)
```
