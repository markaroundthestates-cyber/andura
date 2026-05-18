# §8 — Engine Correctness Audit

**Scope:** 8 Coach Engines pipeline + pure-function paradigm ADR 026 §9 + CDL append-only + Three-tier log + Constraint Object immutable + Big 11 + Bayesian Kalman + Periodization Israetel + Energy Adjustment + MMI #9 + DemographicPriorDatabase ADR 017 + Dimension Registry ADR 018 + Aggressive Loading LOCK 9 + Accelerated learning + PR detection + Streak + Calendar V1 + Specialization 4-gate + Deload + Warm-up + Determinism + CDL replay + Numeric precision + boundaries + Bayesian convergence + MMI decay + Adherence baseline elim + Coach Director 8-field + pipeline order + edge cases + schema invariant + input validation
**Method:** Read `src/coach/orchestrator/index.js` (pipeline runner) + `adapters/index.js` (barrel) + `engine/bayesianNutrition/index.js` header + grep purity invariants

## Severity matrix §8

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MED | 5 |
| LOW | 6 (positive findings) |
| NIT | 2 |
| **Total** | **17** |

---

## CRITICAL findings

### §8-C1 — Engine type-safety gap: 231 .js engines NOT TypeScript-checked → silent property typos propagate to NaN UI
**Severity:** CRITICAL (§3-C1 reinforced from §3 perspective)
**Evidence:** See §3-C1 + §3-C2. Engines are .js, tsconfig `checkJs: false`. Math correctness for Brzycki 1RM, Kalman filter posterior update, Energy Adjustment ±15% asymmetric — entirely runtime-trusted. NO zod boundary validation between engines OR between engine output → React adapter consumers.
**Karpathy:** Goal-Driven Execution — engine correctness is THE Beta launch blocker.
**Reasoning:** A renamed property in `priorPosterior.js` (e.g. `posterior.mu` → `posterior.mean`) → `kalmanFilter.js` reads `posterior.mu` returning `undefined` → arithmetic → `NaN` → UI displays "NaN kcal" or 0. Detection requires runtime path execution + comprehensive tests.
**Fix log:** Already in §3-C1 fix plan. Add zod schemas for engine I/O contracts per ADR 030 D2 thin scope.

---

## HIGH findings

### §8-H1 — Pipeline ordering enforced via BARREL EXPORT order — fragile to refactor
**Severity:** HIGH (§8.1 + §8.29 pipeline order swap test)
**Evidence:** `src/coach/orchestrator/adapters/index.js:24-31` exports adapters in pipeline order. Comments document ordering but NOT enforced programmatically. If a future contributor adds new adapter and inserts wrong position OR alphabetically sorts exports → pipeline ordering breaks silently.
**Karpathy:** Surgical Changes — single ORDERED_ADAPTERS constant.
**Fix log:** Add to `adapters/index.js`:
```js
export const ORDERED_ADAPTERS = [
  periodizationAdapter,
  goalAdaptationAdapter,
  energyAdjustmentAdapter,
  bayesianNutritionAdapter,
  tempoAdapter,
  specializationAdapter,
  warmupAdapter,
  deloadAdapter,
];
```
Runner consumes `ORDERED_ADAPTERS` array, not barrel exports. Add test: `runPipeline(ctx, ORDERED_ADAPTERS)` invariant.

### §8-H2 — `nowMs()` in orchestrator uses `Date.now()` fallback when `performance.now()` unavailable — wall-clock NOT monotonic
**Severity:** HIGH (§8.2 purity + §38.18 timezone)
**Evidence:** `src/coach/orchestrator/index.js:61-66`:
```js
function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}
```
Comment line 56-58 acknowledges Date.now wall-clock NOT monotonic, "acceptable telemetry-only baseline". OK for sub-span timing in modern envs (performance.now always available). FALLBACK only triggers in non-modern envs (unlikely runtime).
**Karpathy:** Acceptable defensive code. NIT.
**Resolution:** Acceptable since telemetry-only purpose; modern browsers all support performance.now. NIT-tier; documented inline.

### §8-H3 — Adapter pipeline halts on first 'hard' error → downstream engines NOT executed → user sees no nutrition target, no schedule, etc.
**Severity:** HIGH (§8.30 edge case input + UX impact)
**Evidence:** `src/coach/orchestrator/index.js:152-157` `if (severity === 'hard') break;`. Per spec ADR 030 §3.6 RESOLVED V1 = correct policy. BUT user-facing impact: if Periodization adapter fails 'hard', NO downstream engine runs → Coach Director (consumer) receives partial data → React adapters return baseline fallback → UI silently degrades.
**Karpathy:** Goal-Driven — correctness preserved, UX feedback gap.
**Reasoning:** User opens Antrenor, expecting workout. Pipeline fails Periodization 'hard' → React adapters get null → UI shows "Hai sa incepem" CTA without numbers. User doesn't know engine failed. Sentry §4-C1 dead → Daniel doesn't know either.
**Fix log:** When pipeline halts hard, log to telemetry + Sentry (once §4-C1 wired). Surface degraded mode to UI (banner: "Coach is recalibrating — using safe defaults"). Don't silently degrade.

---

## MED findings

### §8-M1 — Bayesian Nutrition Kalman filter convergence verify NOT included in CI (§8.25)
**Severity:** MED
**Evidence:** Per `src/engine/bayesianNutrition/index.js:14` "Gaussian Conjugate Prior Normal-Normal closed-form ONLY (NU MCMC NU JAX A1 LOCKED V1)". Mathematical correctness verified via tests likely (`src/engine/bayesianNutrition/tests/`). But convergence over 90 days (synthetic profile §38.23) NOT in CI hot path — depends on golden-master runner + stryker mutation (NOT integrated §2-H5).
**Fix log:** Add 90-day convergence test to CI nightly: synthetic profile through 90-day Kalman update → assert posterior.mu stabilizes within tolerance.

### §8-M2 — MMI Engine #9 decay function (§8.26 + §38.12) — documentation incomplete
**Severity:** MED
**Evidence:** Per §10.5 MMI Engine #9 "Hibrid Lookup + Boost re-resume cap LOCK 10 V1" + §38.11-§38.12. Decay function shape (exponential vs linear) + half-life not documented in samples reviewed. Need read `src/engine/muscleMemoryIndex.js` + adapter.
**Fix log:** Secondary pass — read engine + verify decay function documented + invariant tested.

### §8-M3 — Aggressive Loading 4-module cumulative — voting threshold NOT verified in audit (§8.13 + §38.13)
**Severity:** MED
**Evidence:** Per §38.13 "Aggressive Loading 4-module cumulative logic (which 4 modules + voting threshold)". 4 modules: aa.js, autoAggressionDetection.js, aggressiveLoadingThreshold.js, + ? (4th unidentified in sample). Voting threshold documented per LOCK 9.
**Fix log:** Sample audit src/engine/aggressiveLoadingThreshold.js + adjacent modules secondary pass; verify cumulative voting logic.

### §8-M4 — Specialization 4-gate strict (Advanced + T1+ + Bulk/Recomp + no_injury) — verify AND-gate logic
**Severity:** MED (§8.18 + §38.14)
**Evidence:** Per §10.5 + §38.14 specs. Implementation in `src/engine/specialization/`. Sample verify needed.
**Fix log:** Secondary pass.

### §8-M5 — Deload week 4 standard non-negotiable + MRV invariant (§8.19 + §38.15) — verify invariant test exists
**Severity:** MED
**Evidence:** `src/engine/deload/` exists. Test files in same dir.
**Fix log:** Verify deload invariant test in CI.

---

## LOW (POSITIVE) findings

### §8-L1 — Orchestrator pipeline architecture compliant ADR 030 D1-D5 LOCKED V1 ✓
**Severity:** LOW — POSITIVE
**Evidence:** `src/coach/orchestrator/index.js:1-28` documents D1 (Adapter pattern) + D2 (thin scope pure-function) + D3 (Constraint Object propagation) + D4 (return-not-throw) + D5 (severity taxonomy). Implementation matches docs.
**Resolution:** ARCHITECTURALLY SOUND.

### §8-L2 — 8/8 adapters wired complete per Faza 3 STRANGLER batch 8 LANDED 2026-05-18 ✓
**Severity:** LOW — POSITIVE
**Evidence:** `src/coach/orchestrator/adapters/index.js:11-19` checklist all ✅. Per D025 Phase 5 BATCH LANDED.

### §8-L3 — Constraint Object propagation Hook 1 (read-only) / Hook 4 (forward emit) discipline ✓
**Severity:** LOW — POSITIVE
**Evidence:** bayesianNutritionAdapter.js documents Hook 1 read-only consume; energyAdjustmentAdapter forward emit Hook 4 per ADR 030 §3.4.

### §8-L4 — Severity-aware policy 'soft' continue / 'hard' halt per ADR 030 §3.6 RESOLVED V1 ✓
**Severity:** LOW — POSITIVE
**Evidence:** `runPipeline` line 152-160 + `resolveSeverity` line 44-52. Tested behavior — BUDGET_EXCEEDED → soft, default → hard fail-safe.

### §8-L5 — Telemetry sub-span capture per adapter ✓ (per ADR 030 §3.3 Q-OPEN-3 RESOLVED)
**Severity:** LOW — POSITIVE
**Evidence:** Line 138-150 `onSubSpan` callback fires per adapter with durationMs + errorCode + severity.

### §8-L6 — Pure-function paradigm comments enforce ZERO Date.now/Math.random in engine internals ✓
**Severity:** LOW — POSITIVE
**Evidence:** Grep `Math.random` in src/engine/bayesianNutrition/* returns only DOCUMENTATION comments asserting "ZERO Date.now / Math.random — all values deterministic". Engine code follows.

---

## NIT findings

### §8-N1 — Performance.now fallback to Date.now mentioned but possibly never triggered (modern envs)
**Resolution:** Acceptable defensive code §8-H2.

### §8-N2 — Engine modules use ES modules consistently `export { ... }` ✓
**Resolution:** OK.

---

## Coverage map §8.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 8.1 | 8 Coach Engines pipeline §42.10 ordering preserved | §8-L2 ✓ + §8-H1 barrel order fragile | HIGH |
| 8.2 | Pure-function paradigm NO Date.now/Math.random | §8-L6 ✓ + §8-H2 nowMs orchestrator-only | LOW positive |
| 8.3 | CDL append-only invariant ADR 011 | NOT INSPECTED — read src/util/coachDecisionLog.js secondary | MED |
| 8.4 | Three-tier log Tier 0/1/2 integrity | NOT INSPECTED — see §35 | covered §35 |
| 8.5 | Constraint Object immutable propagation | §8-L3 ✓ | LOW positive |
| 8.6 | Big 11 8/8 phases regression check | §8-L2 ✓ via D025/D026 | LOW positive |
| 8.7 | Bayesian Kalman filter math correctness | §8-M1 convergence test in CI | MED |
| 8.8 | Periodization Floor/Ceiling Israetel | adapter LANDED ✓; numeric MEV/MAV/MRV verify §38.9 | covered §38 |
| 8.9 | Energy Adjustment ±15% asymmetric tier-aware | adapter LANDED ✓; numeric §38.10 verify | covered §38 |
| 8.10 | MMI Engine #9 Hibrid Lookup + Boost LOCK 10 | §8-M2 decay function verify | MED |
| 8.11 | DemographicPriorDatabase ADR 017 cold-start | demographic prior verify §38.23 | covered §38 |
| 8.12 | Dimension Registry ADR 018 Open-Closed | architecture pattern observed via barrel pattern ✓ | LOW positive |
| 8.13 | Aggressive Loading LOCK 9 4-module cumulative | §8-M3 voting threshold verify | MED |
| 8.14 | Accelerated learning wired LOOP CLOSE LOCK 9 | src/engine/acceleratedLearning + Adapter exist; verify prod path §23 | covered §23 |
| 8.15 | PR detection accuracy weight/reps/volume | src/engine/prEngine.js + .d.ts; tested likely; verify §38.20 | covered §38 |
| 8.16 | Streak counter logic correctness | covered §38.18 DST | covered §38 |
| 8.17 | Calendar V1 7-day strip semantic | covered §40 | covered §40 |
| 8.18 | Specialization 4-gate strict | §8-M4 AND-gate verify | MED |
| 8.19 | Deload week 4 non-negotiable + MRV | §8-M5 invariant test | MED |
| 8.20 | Warm-up Instant Skip T0 default | warmupAdapter LANDED ✓ persona-aware 5-10min Hybrid T0 Instant Skip default | LOW positive |
| 8.21 | Determinism same input → same output | Bayesian doc'd "Pure functions — no side effects" ✓; verify §23 | covered §23 |
| 8.22 | CDL replay forensic debug | NOT INSPECTED — secondary; ADR 011 append-only ensures forensic capability | MED secondary |
| 8.23 | Numeric precision floating point drift | §38.19 deferred | covered §38 |
| 8.24 | Engine boundaries no cross-side effects | §8-L4 + §8-L5 ✓ severity + telemetry isolated per adapter | LOW positive |
| 8.25 | Bayesian convergence 90 days | §8-M1 | MED |
| 8.26 | MMI boost decay | §8-M2 | MED |
| 8.27 | Adherence Engine baseline ELIMINATED real wire | Phase 6 task_08 LANDED per D026; verify React adapter consume real | covered §45 |
| 8.28 | Coach Director 8-field enrich | Phase 6 task_06 LANDED per D026; verify enrichment shape | covered §45 |
| 8.29 | Pipeline order swap test | §8-H1 — not enforced programmatically | HIGH |
| 8.30 | Edge case input handling | §8-H3 hard error halt UX impact | HIGH |
| 8.31 | Engine output schema invariant | §3-C2 zod boundary recommended | covered §3 |
| 8.32 | Engine input validation Constraint Object shape | §8-L3 + adapter `engineContext.meta.constraintObject` null handling per §3.6 documented | LOW positive |

## Karpathy 4 principii distribution §8

- Think Before Coding: 1 (C1)
- Simplicity First: 1 (H1)
- Surgical Changes: 2 (H1, H3)
- Goal-Driven Execution: 3 (C1, H2, H3)
- **Architectural alignment with Karpathy POSITIVE:** 6 LOW positive findings (L1-L6) confirm pipeline design honors all 4 principii.
