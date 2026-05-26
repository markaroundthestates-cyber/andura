# Engine Correctness + Architecture Cohesion + Data Integrity Audit
**Date:** 2026-05-26
**Auditor lens:** Senior engineer (30y) due-diligence — "does the engine + architecture actually connect and WORK, or is it tape?"
**Scope (distinct from sibling audits on facade-wiring / decision-FACTORS / exercise-names):** OUTPUT CORRECTNESS (the math is *right*, not just "runs") + ARCHITECTURE COHESION (end-to-end seams) + DATA INTEGRITY (migrations / sync / new FCM+auth paths).
**Method:** Read engine source + traced real data flow user→store→engine→UI→persistence. Numerically sanity-tested the Bayesian core with realistic personas via Node. READ-ONLY, zero code changed.

---

## Exec Summary

**Verdict headline: The engine math is genuinely correct and the end-to-end data flow coheres. This is NOT tape.** The core engines (DP, Bayesian nutrition, readiness, fatigue, Brzycki weakness, periodization corridor, deload depth, muscle recovery, PR detection, US-Navy BF, Kalman, Mifflin TDEE, auth) compute sane, defensible values with proper guards (NaN/Inf/div-by-zero/clamps). The localStorage→engine→Firebase seam is correctly bridged. Auth session handling is mature. The Coach Brain Eval is a **real** evaluation harness, not hollow.

**However, there is ONE genuine data-loss seam (HIGH) and several architecture/maintainability smells that a buyer must price in.**

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH     | 1 |
| MED      | 4 |
| LOW      | 3 |

### Ranked headline findings

1. **[HIGH — broken seam] `syncToFirebase` whole-tree PUT clobbers `notificationPrefs` + `fcmTokens`.** The new FCM/notification RTDB paths are written as siblings under `users/<uid>`, but the main sync does a full-tree `PUT users/<uid>` carrying only `SYNC_KEYS` (which exclude those two keys). Next ordinary weight/kcal/workout log → debounced full PUT → **both nodes deleted server-side**. Push targeting + prefs silently lost; the scheduler reads gone nodes.
2. **[MED — computed-but-discarded] The Kalman filter output is never used for the TDEE value the UI shows.** `posterior.mu` returned in `nutrition_inference_metadata` is the *conjugate* posterior; `kalmanState.mu` only sets a `signals` flag + `trace`. The "Kalman adaptive TDEE" headline overstates what actually drives the number.
3. **[MED — domain mismatch, latent] Kalman noise constants are in kg-domain (Hall/Forbes ~0.22 kg/day, R=1 kg) but applied to a kcal-domain observation (~2400).** Currently harmless *only because* the Kalman output is discarded (finding #2). The day someone wires `kalmanState.mu` into the output, the scale mismatch becomes a real bug.
4. **[MED — two invocation paths diverge] The nutrition *target* the UI renders does NOT go through the orchestrator pipeline.** `getNutritionTargetsToday` calls `evaluate(ctx)` directly, bypassing `bayesianNutritionAdapter` (which hard-requires an upstream Constraint Object). So the Coach Brain Eval validates the *pipeline* decision, but the actual kcal number users see is produced by a different, un-evaluated path.
5. **[MED — posterior over-confidence] BN posterior sigma collapses to ~18–32 kcal after 3–5 observations**, producing a ±35 kcal 95% CI for TDEE — unrealistically tight. Calibration concern, not a wrong-number bug.
6. **[LOW] `weightDelta` field is a documented misnomer** (carries kcal, not kg) — maintainability landmine.
7. **[LOW] Two log representations** (`wv2-workout-store.sessionsHistory` vs legacy `logs` key) kept in sync by one writeback function — single point of divergence if it regresses.
8. **[LOW] `syncFromFirebase` array-merge dedups by `e.ts`;** entries lacking `ts` collapse/duplicate unpredictably.

---

## Engine-by-engine correctness table

| Engine | Formula / logic checked | Verdict | Realistic-input sanity | Evidence |
|--------|------------------------|---------|------------------------|----------|
| **US Navy BF%** | Hodgdon-Beckett metric: `495/(1.0324−0.19077·log10(waist−neck)+0.15456·log10(h))−450` (M); women constants 1.29579/0.35004/0.22100 | **CORRECT** | Clamped [2,60]%, div-by-zero + log-of-nonpositive guarded; LBM-constant projection sound | `src/engine/usNavyBF.js:17-59` |
| **Mifflin-St Jeor TDEE** | `10·kg+6.25·cm−5·age+5` (M) / `−161` (F), ×1.55 activity | **CORRECT** | 55kg/165/30F → ~1450; 110kg/184/30M → ~2850; sex-avg height fallback sane | `src/react/lib/userTdee.ts:53-71` |
| **Brzycki 1RM (weakness)** | `w×(36/(37−reps))`, guarded reps∈[1,12]; weak = group 1RM < 0.8× peer avg | **CORRECT** | Divisor-zero (reps=37) pre-guarded; float-rounding guard on threshold | `src/engine/weaknessDetector.js:25-28,140-170` |
| **PR detection** | weight (strict `>` max) → reps (more reps at ≥weight) → volume (strict `>` max w·reps); baseline excluded | **CORRECT** | Empty history → not-a-PR (non-trivial bar); ordering + scoping logic sound | `src/engine/prEngine.js:30-93` |
| **Readiness score** | base 60 + readinessPoints{5:40..1:0}, kcal/protein ratio penalties, clamp [10,100] | **CORRECT** | Cold-start `hasHistory` gate prevents dishonest "Zi de PR"; CUT path suppresses PR | `src/engine/readiness.js:24-71` |
| **Fatigue score** | weighted notes (sleep×13/fatigue×11/form×7/strong−9) + RPE-excess + sleep penalty, clamp [0,100] | **CORRECT** | `<2 sessions → DATE INSUFICIENTE` honest gate; thresholds sane | `src/engine/fatigue.js:5-95` |
| **Periodization corridor** | block/meso math `floor(w/len)+1`, week-in-meso `(w%4)+1` clamp[1,4]; intensity corridor hard-capped 90%, ×phase mult | **CORRECT** | Maria gate clamps M2/M3→M1; deload window at week-4 matches eval invariant | `src/engine/periodization/{macrocycle,mesocycle,index}.js` |
| **Deload depth** | `MAX(sched 45,reactive 60,behav 30)+capped modifiers`; extension→60%; resolving→~22.5%; clamp[0,100] | **CORRECT** | RIR+1/intensity−12.5% obligatory; atrophy-limit clamp sound | `src/engine/deload/depthCalculator.js:44-112` |
| **Muscle recovery** | max-of-heads aggregation; FATIGUED=35/PARTIAL=12; pain escalation raises-only, 3d recency | **CORRECT** | `daysSinceGroup` uses primary+secondary; lagging <0.6 peer avg; injectable `now` | `src/engine/muscleRecovery.js:68-204` |
| **Bayesian conjugate update** | Normal-Normal closed-form; precision-weighted; tier slope partition (T0 70/30, T1 20/80, T2 10/90) | **CORRECT** | 0 obs→prior; conflict demo1450/obs2200 T2→2200 (scale wins, by design); n=1 var falls back to prior | `src/engine/bayesianNutrition/priorPosterior.js:94-131` + Node test below |
| **Kalman 1D filter** | standard predict/update; gain `σ²pred/(σ²pred+R²)`; R² gate strict `>0.85`→EWMA fallback | **CORRECT (math)** but **UNUSED for output** + **kg/kcal domain mismatch** | Math is textbook; but result discarded (see MED-1) + Q/R in kg applied to kcal signal (MED-2) | `src/engine/bayesianNutrition/kalmanFilter.js:116-137`; output uses conjugate mu at `index.js:343` |
| **MMI silent auto-cap** | buckets 6-12mo 0.80×, 12-24mo 0.70×, 24+mo 0.60×; peak from pr-records | **CORRECT** | Respects explicit `refused`; no fabricated peak when pr-records empty | `src/react/lib/engineWrappers.ts:419-486` |
| **Nutrition target precedence** | manual log > phase-override(TDEE×mult) > goal-delta(mu×mult) > Bayesian mu; floor 1200 (sex-aware 1000F/1200M) | **CORRECT (no double-apply)** but complex | Manual phase wins over goal; goalMult applied once to maintenance mu → deficit/surplus correct | `engineWrappers.ts:733-781` |

### Bayesian numeric sanity test (executed)
```
0 obs T0:                 prior 1450 → posterior 1450, σ 250   ✓ (cold start = per-user maintenance)
Marius 3 obs ~2900 T1:    → posterior 2900, σ 32               ✓ sensible
Maria conflict 1450→2200 T2: → posterior 2200, σ 18            ✓ "cantarul castiga" by design
1 obs (n=1) T0:           1450 + obs1800 → 1555, σ 250         ✓ conservative (var falls back to prior)
```
Conclusion: in the **real wire** (`nutritionObservations.ts`) both `demographicMu` AND `observations[].weightDelta` are in **kcal** (energy-balance window TDEE). Units are coherent. The math produces reasonable kcal targets across Maria / Marius / cold-start. **No unit-collision bug** despite the misleading `weightDelta` field name.

---

## Architecture seam findings

### SEAM-1 [HIGH] — Whole-tree PUT clobbers FCM + notification RTDB nodes
**Evidence:**
- `src/firebase.js:221-253` `syncToFirebase()` → `fbSet(userPath, payload)` where `userPath = users/<uid>` and `fbSet` issues `method:'PUT'` to `${userPath}.json` (`firebase.js:176-186`). RTDB PUT to a path **replaces the entire node**.
- `payload` contains only `SYNC_KEYS` + `_device/_ts/_schemaVersion`. `SYNC_KEYS` (`firebase.js:80-84`) does **NOT** include `notificationPrefs` or `fcmTokens`.
- `src/react/lib/notificationPrefsSync.ts:79` writes `users/<uid>/notificationPrefs`; `src/react/lib/pushNotifications.ts:136` writes `users/<uid>/fcmTokens/<token>` — both **siblings** under the node that gets fully overwritten.
- `DB.set` arms a 3s-debounced `syncToFirebase` on **any** SYNC_KEY write (`firebase.js:371-374`). Logging a weight/kcal/set is the most common user action.

**Impact:** After enabling push, the next ordinary log fires a full-tree PUT that **deletes `notificationPrefs` + `fcmTokens` server-side**. `syncFromFirebase` only reads SYNC_KEYS, so it never restores them either. The scheduler (Agent B) that reads these nodes to send push finds them gone → silent loss of push delivery + user prefs. This is a real divergence/clobber between two writers to the same RTDB subtree.
**Why not CRITICAL:** No *local user data* loss (localStorage Tier-0 + SYNC_KEYS intact). Damage is confined to the new FCM/notification feature, server-side only.
**Fix direction (NOT applied):** `syncToFirebase` should PATCH (multi-path update) instead of root PUT, OR write under a dedicated subkey that the full PUT preserves, OR add the two keys to the payload as read-merge-preserve. Buyer should treat the FCM feature as not-yet-safe-with-sync.

### SEAM-2 [MED] — Kalman computed but discarded for the value users see
`src/engine/bayesianNutrition/index.js:328-336` computes `kalmanState` but `:343-345` returns `posterior.mu` (the conjugate value reassigned last at `:317-323`, mu unchanged). `engineWrappers.ts:747` reads `nutrition_inference_metadata.posterior.mu` = conjugate, never Kalman. In the real wire `recentObservedWeights/recentPredictedWeights` are never passed (`nutritionObservations.ts` builds `observations` only), so `computeR2([],[])=0` → gate fails → EWMA flag set — all moot since the value is discarded. The headline "Kalman adaptive TDEE" (e.g. `bayesianNutritionAggregate.ts:5`) overstates reality; the engine is a **conjugate Bayesian** estimator in practice.

### SEAM-3 [MED] — Two BN invocation paths; the UI target path skips the pipeline
`bayesianNutritionAdapter.invoke` (`src/coach/orchestrator/adapters/bayesianNutritionAdapter.js:123-130`) hard-fails `INVALID_INPUT` if `meta.constraintObject` absent. But `getNutritionTargetsToday` (`engineWrappers.ts:741`) calls `evaluate(ctx)` **directly** with `readBayesianNutritionContext()` output, which has **no** `constraintObject`. So:
- The **Coach Brain Eval** runs the orchestrator (8 adapters) → validates corridor/likelihood/deload.
- The **actual kcal number** users see is produced by the direct path, which the eval never exercises.
Both are individually fine (engine is total), but the safety net does not cover the production target value. Coverage gap for a buyer to note.

### SEAM-4 [LOW] — Dual log representation, single bridge
Engines `dp.js`/`fatigue.js`/`adherence.js` read legacy localStorage key `logs` (`{ex,w,reps,ts,session,rpe}`). The React SSOT is `wv2-workout-store.sessionsHistory` (`{exercises:[{sets:[{kg,reps,timestamp}]}]}`). The bridge is `persistSessionLogs` (`workoutStore.ts:223-243`), called by `finishSession` (`:496`). **Verified correct**: field mapping (`ex`,`w`,`reps` as String which dp.js `parseInt`s, `ts`,`session`,`rpe`) matches what `dp.js getLogs/getState` consume. The DP weight-recommendation engine therefore DOES receive real history. Risk is only that this single writeback is the lone seam; if it regresses, dp/fatigue silently go to INIT/insufficient.

### SEAM-5 [INFO — CORRECT] — Engine pure-function wrappers + Sentry instrumentation
`engineWrappers.ts` every adapter has try/catch → safe baseline + `captureException(source:'engine-adapter-fallback')`. There's even a test (`assert_all_adapters_instrumented.test.ts`) enforcing it. This is the right pattern — silent divergence is observable in prod, not swallowed. Good engineering.

---

## Data-integrity findings

| ID | Area | Verdict | Evidence |
|----|------|---------|----------|
| **DI-1** | Migration runner | **SAFE** — idempotent, fail-loud (Sentry critical), abort-and-preserve on `migrate()` throw (copies remaining entries unchanged), non-array skip, version-filter prevents re-apply | `src/migrations/migrationRunner.js:50-169` |
| **DI-2** | Migration registry | **SAFE (minimal)** — only 1 migration registered (TIER_5_TO_6 v1→v2). Dexie `SCHEMA_VERSION=2` with idempotent additive `status` backfill upgrade hook. No data-loss path. | `src/migrations/MIGRATIONS.js:68-74`; `src/storage/db.js:181-206` |
| **DI-3** | Dexie per-UID isolation | **SAFE** — namespace resolution uid→`andura_<uid>`, anon→`andura_anonymous_<deviceId>`, sanitized; `closeDb()` invalidates cache on auth migration (documented hard contract); wipe sweeps anon residue (GDPR) | `src/storage/db.js:116-145,322-371` |
| **DI-4** | `restoreSession` (boot rehydrate) | **SAFE + mature** — distinguishes definitive auth failure (signOut) from transient/offline (keep session, no force-logout); in-flight refresh dedup prevents token-rotation race; never throws | `src/auth.js:461-499,329-336` |
| **DI-5** | FCM/notificationPrefs new paths | **DATA-LOSS via SEAM-1** (see above) — the paths themselves don't corrupt, but the full-tree sync orphans/deletes them | `notificationPrefsSync.ts` + `pushNotifications.ts` vs `firebase.js:250` |
| **DI-6** | Firebase array merge (logs) | **WEAK** — `syncFromFirebase` merges arrays by `Set(e.ts)` uniqueness (`firebase.js:299-303`). Entries without `ts` → `tsSet.has(undefined)` collapses all undefined-ts entries to one, or duplicates. Object merge is local-priority (documented multi-device LWW limitation). | `firebase.js:293-308` |
| **DI-7** | Per-day object merge | **ACKNOWLEDGED LIMITATION** — same-date edits on two devices: local always wins regardless of recency (no per-entry timestamps). Documented in-code, deferred. Acceptable pre-Beta single-device. | `firebase.js:286-294` |

---

## Coach Brain Eval — is it real or hollow?
**It is REAL.** (`scripts/coach-brain-eval/*`, self-tested by `tests/engine/coach-brain-eval/harness.test.js`.)
- Deterministic seeded scenario generator across 3 archetypes (gigel/marius/maria), stratified evenly; edge scenarios (deload-week4, subfloor-kcal, cold-start) guaranteed.
- Runs the **full 8-adapter orchestrator pipeline** per scenario.
- Genuine invariants that catch injected violations: I1 corridor floor≤ceiling, I2 kcal-floor min+excludedCount, I3 deload-must-fire-week4, I4 NaN/Inf/undefined in outputs, I6 depth∈[0,100]+hard-halt detection. The harness test *proves the meter catches* deliberately-bad inputs.
- Optional LLM oracle (cross-checks categorical decisions: phase, deload depth ±10pp, tdeeDirection via argmax) — **skips gracefully without API key** (`oracleAvailable()` gate). Serializer exposes only EngineContext fields to the judge (no hidden-context leak, §7.2 enforced by test).
**Caveat (= SEAM-3):** it validates the **pipeline** decisions, NOT the direct `getNutritionTargetsToday` kcal value the UI renders. So it's an honest meter — but it doesn't meter everything that ships.

---

## Honest senior-engineer verdict

> **As a buyer doing due diligence: the engine + architecture genuinely WORK and COHERE. This is real engineering, not a facade held together with tape.**

The 9-engine math is correct under scrutiny and survives realistic-persona sanity tests (I ran the numbers). Guards against NaN/Infinity/div-by-zero/unit-clamps are present and consistent. The end-to-end data flow (user action → Zustand store → `persistSessionLogs` → localStorage `logs` → engines → Firebase SYNC_KEYS) is correctly bridged — I traced it and confirmed the field mappings line up, including the easy-to-break dual log representation. Auth is mature (offline-safe restore, token-rotation dedup, freshness gates). The evaluation harness is honest.

**What a buyer must price in (none are show-stoppers, but they're real):**
1. **One concrete server-side data-loss bug (SEAM-1)** in the newly-added FCM/notifications feature — the feature is not yet safe to ship alongside the existing whole-tree sync. Fixable (PATCH instead of PUT).
2. **A credibility gap between the "Kalman adaptive TDEE" framing and reality** (SEAM-2/3/5): in production the nutrition brain is a *conjugate Bayesian* estimator over energy-balance windows (which is sound), the Kalman layer is dead weight, the posterior is over-confident (σ collapse), and the value users see bypasses the very pipeline the eval validates. The marketing math is more elaborate than the operative math.
3. **Maintainability landmines** (kcal-in-a-field-named-weightDelta; kg-domain Kalman constants on a kcal signal) that are latent today but will bite whoever touches them next.

Net: the foundation is solid and the team demonstrably catches and fixes its own math bugs (e.g. the periodization conjugate ×2-slope CI-width fix, the §B-series Kalman guards). The defects are in the *seams between subsystems* and in *over-claimed sophistication*, not in the core arithmetic. A disciplined buyer would proceed, conditioning on closing SEAM-1 before any push-notification launch and de-risking the nutrition-brain narrative.

---

*Audit READ-ONLY. Zero files modified, zero commits. Findings carry file:line evidence; numeric claims verified via Node execution of the actual engine modules. Uncertainty flagged explicitly where present (e.g. SEAM-3 coverage gap is structural inference from call-site grep, confirmed against adapter guard + wrapper direct-call).*
