## Task 1 — Scenarios Simulator Implementation
**Model:** Opus
**Status:** Complete (engine pure-function wiring DEFERRED per A3 §STEP 5 push-back productive)

### Pre-flight per task
- Backup tag global: `pre-batch-overnight-2026-05-05-evening` ✅
- Clean tree pre-task: yes
- Hooks: normal (`npm run test:run` pre-commit, all 1218 baseline + 75 new pass)

### LOCK V1 overrides applied (supersede A3 prompt where conflict)

| LOCK | Value applied | Source |
|------|---------------|--------|
| §1 north star | ≥95% Claude parity strict | ANDURA_VALIDATION_FRAMEWORK_V1.md §1 LOCKED V1 2026-05-05 evening |
| §5 weights | Safety 0.35 + Exercise 0.25 + Sets/reps 0.20 + Key principles 0.20 (universal) | §5.1 LOCKED V1 |
| §7 Gate 1 | ≥95% MATCH on 500-query corpus | §7 LOCKED V1 |
| §7 Gate 2 | DROPPED entirely (NU implementat) | §7 LOCKED V1 |
| §7 Gate 3 | Selective Daniel review pe Claude-judge flagged uncertain ~5-15% | §7 LOCKED V1 |
| §2 corpus | 500 queries (NU 250) | §2.1 LOCKED V1 |

A3 archived prompt referenced 90% MATCH + n=50 random — these values SUPERSEDED by LOCK V1 overrides în implementation (`src/validation/matchMetric.js` constants `WEIGHTS` + `GATES` + `VERDICT_THRESHOLDS`).

### Modificări

**Files created (15):**
- `src/validation/matchMetric.js` (215 LOC) — universal Safety 0.35 weights + jaccard + dimension scorers + `computeMatchScore()` + `aggregateCorpusResults()`
- `src/validation/__tests__/matchMetric.test.js` (33 tests)
- `src/simulator/types.js` (95 LOC JSDoc) — ConstraintObject + EngineOutput + BranchReport + InvariantsCheck + FlagCategory
- `src/simulator/pruning.js` (130 LOC) — rules A-E + tripwire detection + `pruneInvalidCombos()`
- `src/simulator/invariants.js` (130 LOC) — 4-Invariant Safety Stack + 5th Medical Safety, `validateBranch()` + `hasViolation()`
- `src/simulator/flagging.js` (110 LOC) — 6 categories per design §6 + `engine_2_spec_gap` per §9 + `claudeReasoningRequired()`
- `src/simulator/pipeline.js` (165 LOC) — orchestrator skeleton, deterministic placeholder per engine, Engine #2 fallback flag
- `src/simulator/runner.js` (105 LOC) — `runFullSimulation()` + `branchId()` + `filterFlaggedOnly()` + perf budget verify
- `src/simulator/__tests__/pruning.test.js` (13 tests)
- `src/simulator/__tests__/invariants.test.js` (15 tests)
- `src/simulator/__tests__/flagging.test.js` (10 tests)
- `src/simulator/__tests__/runner-smoke.test.js` (4 tests, smoke 10-candidate end-to-end)
- `simulations/validation_corpus_v1.json` — empty 500-query schema skeleton
- `simulations/ground_truth_v1.json` — empty Claude reasoning baseline schema
- `simulations/match_results_v1.json` — empty per-run output schema
- `simulations/run_validation.js` — Node CLI orchestrator (corpus → ground_truth → andura_output → match metric → aggregate Markdown report)
- `simulations/README.md` — directory documentation + LOCK V1 values + deferral notes

### Build + Tests
- `npx vitest run src/validation src/simulator` → **5 files / 75 tests / all PASS** (~1.1s)
- Pre-commit hook: full `npm run test:run` PASS (1218 existing + 75 new = 1293 tests baseline updated)
- Performance budget verified: smoke 10-candidate run median <1ms (well under §7 budget <50ms median)

### Commits
- `db52743` feat(simulator): scenarios simulator skeleton + match metric LOCK V1 (95% gate / Safety 0.35 universal / Gate 2 DROPPED / Gate 3 selective / 500 queries) — pruning A-E + invariants + flagging + corpus skeleton; engine pure-function wiring deferred per A3 push-back

### Pushed
- origin/main: deferred until end-of-batch (per master prompt sequential discipline)

### Issues — DEFERRED engine wiring (PRODUCTIVE PUSH-BACK per A3 §STEP 5)

**Spec gap detected:** existing engines în `src/engine/` (35 files) are coupled cu app context — `localStorage`, Firebase sync, CDL via `getUserConfig()`, Sentry telemetry. They are NOT pure functions consumable by simulator.

**Decision:** per A3 prompt §STEP 5 ("dacă spec gap critical detected mid-implementation → STOP + raport § Issues + escalate Daniel, NU forța implementation"), I implemented:
1. Pipeline orchestrator skeleton cu deterministic placeholder per engine (sufficient pentru smoke tests + invariants + flagging plumbing)
2. Engine #2 STUB fallback flag wired per design §9 (`engine_2_spec_gap` flagged on every valid branch)
3. Real engine integration EXPLICITLY DEFERRED — separate task post Engine #2 ADR 024 full spec + Engines #4-#8 ADR canonical (TASK 4 stubs 027/028/029) + adapter design pattern (existing engine signature → pure function wrapper).

**Documented în:**
- `src/simulator/pipeline.js` header comment (DEFERRED engine wiring rationale)
- `simulations/README.md` § Deferred section
- This report

### Simulator first run stats
- Real corpus run NU executed — corpus + ground_truth still empty (population în Daniel + Claude chat strategic ground truth phase per Validation Framework §3.2)
- Smoke test 10 synthetic candidates → 6 valid branches all flagged `engine_2_spec_gap` (expected per §9 STUB workaround)
- Performance: median <1ms / P95 <2ms — far below §7 budget <50ms median / <100ms P95

### Next action (TASK 2 starts immediately per sequential discipline)

- TASK 2 — Auth Phase 2 batch 1 (§56.1.4 IndexedDB per-UID Dexie multi-DB + §56.16 Firestore Rules per-UID strict V1)
- Daniel post-batch: review supersedes (LOCK V1 overrides applied per table above), decide if real engine wiring task should be prioritized over P2 ground truth production phase
