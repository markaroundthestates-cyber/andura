# LATEST — Faza 3 Batch 1 PARTIAL: Orchestrator Foundation Phase 1-2 LANDED + Phase 3-4 BLOCKED

**Task:** Wire Periodization Engine #1 via Strangler Pattern, ADR 030 D1-D5 foundation + featureFlag rollout 0%
**Model:** Opus
**Status:** Issue — Phase 1-2 delivered (orchestrator foundation reusable for all 8 future engines), Phase 3-4 BLOCKED on missing prerequisite (Periodization Engine #1 per ADR 026 §1 NOT implemented in src/). Daniel direction needed.

---

## Pre-flight

- Clean tree: ✅ (only `tests/golden-master/mutation/stryker-run.log` untracked, scope acceptable)
- Branch main: ✅
- Backup tag: `pre-batch1-periodization-wire-2026-05-06-1218` ✅ pushed origin

## Discovery anti-hallucination grep — CRITICAL FINDING

**Definitive: Periodization Engine #1 per ADR 026 §1 NOT implemented as src/ module wired into coach decision flow.**

Discovery sequence:
1. `ls src/coach/` → DOES NOT EXIST. Created NEW pentru orchestrator.
2. `grep "periodization" src/` → only 5 files match: `simulator/{pipeline,flagging,types}.js` + `engine/{progressionMatrix,plateauInterventions}.js`. NONE = canonical Periodization Engine.
3. `grep "PeriodizationResult|periodizationEngine|evaluate.*Periodization" src/` → **ZERO matches** — canonical signature per ADR 026 §1 doesn't exist.
4. `grep "MEV|MAV|MRV|mesocycle|macrocycle" src/` → only `src/simulator/invariants.js` + tests (validation invariants, NU engine impl).
5. `progressionMatrix.js` line 27 = comment "micro-periodization" label only.
6. `plateauInterventions.js` line 149 = `id: 'periodization_wave'` intervention label only.
7. **`linearBlock.js` (closest existing)** = simple 4+1 week state machine §29.2.5 Forță & Dezvoltare V1 LOCKED legacy reference; **NOT match ADR 026 §1 spec** (mesocycle phases + double progression + extension trigger Marius 5:1 + Volume Landmarks MEV/MAV/MRV Israetel + Linear Block macrocycle 3 mesocycles/block 12-21 săpt + cross-engine hooks). Headers reference §29.2.5 legacy NU ADR 026 §1 spec.
8. **Critical: `grep "linearBlock|getWeekPolicy|isDeloadWeek|getCycleWeek" src/`** → only file matches `linearBlock.js` itself + own tests. **`linearBlock.js` IS NOT consumed by `coachDirector.js` or any other engine — it's ORPHAN code, NOT wired into coach decision flow live.**
9. AA Strangler precedent confirmed `coachDirector.js:169-202` cu featureFlag `aa_via_cluster` + cluster route. ADR 018 §6 Migration Path mentions AA + Profile Typing only — Periodization NOT mentioned because engine doesn't exist.

**Conclusion:** Periodization Engine #1 per ADR 026 §1 spec exists doar pe hârtie. ZERO src/ implementation matches spec. Strangler Pattern requires existing-implementation-in-flow to strangle — there's nothing wired to strangle.

**This is exactly Daniel's "vizor fără ușă" reframe în concrete form:** specs LOCKED, dar ușile (engine implementations) lipsesc. ADR 026 + 8/8 engine ADRs SPEC COMPLETE pe hârtie, dar NONE implementat ca src/ engine module match canonical spec signature.

---

## Phase-by-phase delivered

### ✅ Phase 1 LANDED — Foundation Types + Result Helpers

**Files NEW:**
- `src/coach/orchestrator/types.js` (40 LOC) — JSDoc typedefs `EngineContext` (D3) + `EngineAdapter` (D1+D2) + `AdapterResult` discriminated union (D4) + `AdapterError` envelope
- `src/coach/orchestrator/result.js` (60 LOC) — helpers `ok()`, `err()` (string | structured), `isOk()` type-guard, `mapOk()` transform with throw capture
- `src/coach/orchestrator/__tests__/result.test.js` — **17 tests PASS**

### ✅ Phase 2 LANDED — Orchestrator Skeleton + Context Builder + Utilities Stubs

**Files NEW:**
- `src/coach/orchestrator/index.js` (45 LOC) — `runPipeline(ctx, adapters[])` sequential per ADR 026 §42.10. V1 default = continue-on-err (Q-OPEN-6 graceful, ADR 025 aligned). Defensive: invalid adapter → `INVALID_ADAPTER` err; throwing adapter (D4 violation) → `ADAPTER_THREW` err with cause; preserves explicit adapterId vs auto-tag.
- `src/coach/orchestrator/contextBuilder.js` (25 LOC) — `buildEngineContext(userState)` returns `Object.freeze`-d shallow ctx (D2 mutation guard). Defensive on null/undefined input. Coerces non-array recentSessions → empty.
- `src/coach/orchestrator/utilities/convergenceGuard.js` (15 LOC) — V1 stub `resolveTier(userState)` passthrough `userState?.profileTier ?? null`. Full Q-OPEN-7 PENDING re-eval cadence per Convergence Guard "T2 Unlock" (ADR 009 §AMENDMENT 2026-05-05 birou after).
- `src/coach/orchestrator/utilities/budget.js` (50 LOC) — `withBudget(fn, budgetMs=50)` Promise.race timeout. `BUDGET_EXCEEDED` err if slow; `WITHIN_BUDGET_THREW` err if fn throws. `isBudgetExceeded(result)` helper. V1 simple — concrete cancel semantics Q-OPEN-2 PENDING (no AbortController threading V1).

**Tests NEW:**
- `__tests__/orchestrator.test.js` — **11 tests PASS** (sequential ordering + err continuation + throw capture + adapterId tagging + invalid adapter + sync invoke + empty list)
- `__tests__/contextBuilder.test.js` — **8 tests PASS** (frozen ctx + defensive coercion + null/undefined safe + mutation throws TypeError)
- `utilities/__tests__/convergenceGuard.test.js` — **4 tests PASS** (passthrough + null-safe + purity guard)
- `utilities/__tests__/budget.test.js` — **11 tests PASS** (within budget + BUDGET_EXCEEDED via fake timers + sync/async throw capture + INVALID_FN guard + isBudgetExceeded helper)

**Total Phase 1-2 tests NEW:** 47 tests

### 🔴 Phase 3 BLOCKED — PeriodizationAdapter

**Cannot deliver as specified.** Prompt instruction: *"Thin shape mapping: `engineContext → existingPeriodizationEngine.input shape → invoke → wrap output Result type per D4`. NU duplicate engine logic — adapter = port shape only."*

Reality: there IS no `existingPeriodizationEngine` matching ADR 026 §1 spec. Wrapping `linearBlock.js` (orphan 4+1 state machine §29.2.5) misrepresents Periodization Engine status — adapter would either:
- Wrap orphan code that's not în coach flow (no Strangler value — nothing to strangle)
- Implement Periodization Engine logic inline în adapter (anti-Bugatti craft transparency, violates D2 thin scope, misrepresents engine implementation status)

Per prompt explicit STOP rule: *"STOP confirm dacă: Existing periodization engine NU pure function (per ADR 018 §Standardized Dimension Contract) — flag refactor scope, NU rezolvi singur"* — actual situation worse: NO existing periodization engine în coach flow at all.

### 🔴 Phase 4 BLOCKED — Wiring + FeatureFlag

Cannot wire `periodization_via_orchestrator` flag în `coachDirector.js` because:
- New orchestrated path (flag ON) needs PeriodizationAdapter Phase 3 — blocked
- Legacy path (flag OFF) doesn't exist — `coachDirector.js` doesn't currently call any periodization engine. There's no legacy-vs-new dichotomy to gate.
- Adding flag for non-existent code path = dead-code commit, anti-Bugatti.

---

## Build + Tests

- `npm run test:run`: **1448 PASS / 0 FAIL** (1401 prev + 47 new orchestrator tests)
- 98 test files passed
- Duration 16.49s
- Golden-master parity legacy↔orchestrated: **N/A** (Phase 3 blocked, no parity to validate)

---

## Commits

Pending — orchestrator foundation Phase 1-2 ready stage + commit. Will land single commit cu scope reflecting partial delivery + blocker discovery.

## Pushed
- origin/main: pending post-commit
- Backup tag: ✅ `pre-batch1-periodization-wire-2026-05-06-1218` pushed pre-execution

---

## Issues — Phase 3-4 BLOCKER + 3 OPTIONS DANIEL DIRECTION

**Blocker root cause:** Spec-implementation gap. ADR 026 + 8/8 engine ADRs (022/024/025/027/028/029) SPEC COMPLETE pe hârtie. Engine implementations matching spec signatures (`engineX.evaluate(ctx) → EngineXResult` per ADR 018 §2) NU exist în src/. Strangler Pattern presupposes engine-in-flow to strangle — premise NU holds for Periodization V1.

**3 Options Daniel direction (NU recomandare aici per memory rule "decizii tactice eu decid singur" — dar acest e strategic scope decision, NU tactical):**

### Option A — Spec-First, Implementation-First Pivot (RECOMMENDED Bugatti craft)

Implement Periodization Engine V1 per ADR 026 §1 spec FIRST ca pure-function module în `src/engine/periodization/`. Includes:
- Mesocycle phase transitions (§45.3 Q18 double progression rep-first)
- Trigger hierarchy (EARLY DELOAD safety > EXTENSION Marius 5:1 dual-signal > CALENDAR default)
- Volume Landmarks MEV/MAV/MRV (Israetel 11 grupuri × persona modifiers Maria 0.50 / Gigica 0.70 / Marius 1.00 × goal modifiers)
- Macrocycle 3 mesocycles/block Linear Block (NU DUP NU Conjugate)
- Cross-engine hooks (NU wire faza 3, doar emit Constraint Object Floor/Ceiling)
- Pure function `evaluate(ctx) → PeriodizationResult` per ADR 018 §2 Standardized Dimension Contract

Estimated scope: 2-4 chat-uri strategic spec refinement + 8-15 batches CC implementation (per §36.100 Engine #2 estimate ~150-250h CC autonomous similar precedent). Post-LANDED reluăm Faza 3 batch 1 wiring cu real engine to strangle.

### Option B — Pivot Sequence Pipeline §42.10 to Engine Cu Implementation Existing

Reorder pipeline batch sequence: start cu engine that DOES have implementation in coach flow. Candidates din `src/engine/`:
- `aa.js` Auto-Adjust 3-session pattern + `decisionCluster.js` already cu Strangler precedent `aa_via_cluster` (ALREADY wired V1 cluster route ALREADY exists, alt batch din ADR 018 §6 Phase 1) — **NU candidate, deja Strangled**
- `calibration.js` calibration tier engine (foundational, used by other engines)
- `readiness.js` readiness score engine (used pre-session)
- `recompileEngine.js` weekly recompile pe skip/absență

NONE map exact la ADR 026 §42.10 8-engine spec. Reorder = pragmatic reality check (ship one Strangler proof-of-concept on existing engine), but breaks pipeline ordering invariant (Periodization → Goal Adaptation → ... per ADR 026 §1.10 Constraint Object Floor/Ceiling propagation).

### Option C — Wire `linearBlock.js` AS V1 Periodization (deliberately scoped subset)

Treat `linearBlock.js` ca V1 Periodization Engine (deliberately scoped subset of ADR 026 §1 full spec):
- Acceptă: V1 = simple 4+1 state machine; full spec = V1.5/V2 amendment future
- Adapter shape: `engineContext → linearBlock.getWeekPolicy(opts) → wrap Result D4`
- Wires linearBlock from orphan → coach flow (real value-add, even if scope-limited)
- Documents explicit în ADR 030 §5 Reconsideration Triggers: "V1 Periodization scope subset of ADR 026 §1 full spec; expand post-Beta"

**Risk:** misrepresents Periodization Engine status — Bugatti craft transparency concern. Daniel "vizor fără ușă" reframe specifically about NOT shipping incomplete cores. Counter-argument: V1 IS some periodization (cycle phase awareness) wired, vs ZERO Periodization wired today.

### Daniel decide între A/B/C

**My judgment Bugatti:** Option A = honest path. Specs LOCKED → implementation needed → wiring last. Skip B (breaks pipeline ordering) + C (status misrepresentation). Cost = chat-uri strategic + multi-batch CC implementation BEFORE Faza 3 batch 1 can deliver as originally specified. But Phase 1-2 orchestrator foundation LANDED este genuinely re-usable when Periodization Engine V1 exists — NU wasted work.

---

## Issues — Sub-blocker

- **Initial test failure 2 cases** (low impact, fixed clean): `buildEngineContext(null)` și `resolveTier(null)` failed because JS default param `= {}` doesn't apply to explicit `null` (only `undefined`). Fixed via `userState ?? {}` și `userState?.profileTier`. 1448 PASS final.
- Cumulative LOCKED V1 NU incrementat acest commit per scope vault-docs-only-this-batch — Phase 1-2 = D3 (contextBuilder) + D4 (Result helpers) + D5 (utility stubs) implementation tracked, NU decisions noi. ADR 030 D1-D5 deja LOCKED V1 chat strategic 2026-05-06 morning acasă (NU ingestat în vault încă, separate §CC.5 ulterior).

---

## Next action — DANIEL DIRECTION REQUIRED

**Halt point:** Phase 3-4 BLOCKED on Periodization Engine #1 implementation gap. Cannot proceed without Daniel selecting Option A / B / C.

**Phase 1-2 foundation LANDED safely:** 1448 PASS / 0 FAIL. Orchestrator infrastructure reusable for all 8 future engine adapters per D1 — when Periodization Engine V1 exists (Option A path) sau pivot engine selected (Option B sau C), Phases 3-4 unblock cleanly.

**Recommendation present commit:**
1. Commit Phase 1-2 LANDED ca foundation work (orchestrator infrastructure unblocked, value-add)
2. Push origin/main pentru CI verification + audit trail
3. Daniel selecteze Option A/B/C → next chat strategic / CC batch
4. §CC.5 fast handover ulterior consume Phase 1-2 foundation + blocker discovery + Daniel decision option selected

**NU SMOKE TEST ENABLED V1** — `localStorage.setItem('_devFlags', '{"periodization_via_orchestrator": true}')` flag NU added (Phase 4 blocked). Smoke deferred până Phase 3-4 unblock.
