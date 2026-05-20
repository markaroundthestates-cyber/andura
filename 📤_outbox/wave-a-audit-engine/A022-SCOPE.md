# A022 TypeScript strict checkJs .js — Scope Assessment

**Source:** Wave A iter 1 deferred — autonomous overnight Explore agent investigation 2026-05-21.
**Status:** READ-ONLY. No tsconfig changes made.
**Verdict:** LARGE multi-batch, 6 atomic sub-tasks recommended.

---

## §1 Current tsconfig state

- `tsconfig.json` lines 9-11:
  - `allowJs: true` ✓ ALREADY ENABLED
  - `checkJs: false` ← target of A022 flip
  - `strict: true` ✓ globally active
- `noEmit: true` ✓ — flipping checkJs surfaces errors în CI/IDE doar, NO runtime impact
- `eslint.config.js` flat config minimal React 19 + TS strict (warnings-only gate)

## §2 .js file inventory

**Total:** 425 .js files in src/ (excluding node_modules + dist + tests).

**Distribution:**
- `src/engine/` core + subtrees: 169 files (43 core + 45 tests + 81 submodules)
- `src/pages/` + coach: 28 files
- `src/util/`: 29 files
- `src/storage/`: 11 files (Dexie IndexedDB wrappers)
- `src/migrations/`: 8 files
- `src/coach/orchestrator/` + adapters: 20 files
- Other (components, schema, simulator, validation, themes, i18n, config): 152 files

## §3 Migration target

`checkJs: true` enables:
- TypeScript type-checks ALL .js files (via existing `allowJs: true`)
- NO emit changes (noEmit: true)
- TS reads JSDoc types + infers from usage
- Strict mode rules cascade: noImplicitAny + noImplicitReturns + noUncheckedIndexedAccess + exactOptionalPropertyTypes

## §4 Sample 10-file inspection (src/engine/ representative)

Avg ~4.5 estimated errors per file from sample inspection:
- `aa.js` — 6-8 errors (sessions[l.session] unsafe, arr[0].ts no bounds)
- `acceleratedLearning.js` — 2-3 errors (JSDoc good, loop type assertion gap)
- `adherence.js` — 4-5 errors (DB.get untyped, optional chaining unsafe)
- `bayesianNutrition/kalmanFilter.js` — 1-2 errors (best practice cu Number.isFinite guards)
- `calibration.js` — 5-7 errors (ctx untyped, dates inference weak, key access unsafe)
- `coachDirector.js` — 6-9 errors (exercises loop untyped, object fields any)
- `coachDecisionLog.js` — 4-6 errors (DB.get untyped, JSON.stringify unsafe)
- `sessionBuilder.js` — 3-4 errors (EXERCISES_BY_TYPE[key] no validation)
- `dp.js` — 4-6 errors (roundToEquipmentWeight params untyped)
- `migrationRunner.js` — 2-3 errors (db.get return untyped)

**Error projection across 425 files:**
- Conservative: ~1,615 errors
- Mid-range: ~1,912 errors
- Pessimistic: ~2,252 errors

**Most common categories:**
1. Implicit any (40%) — function params + object literals + DB reads
2. Unsafe indexing (25%) — `arr[i]`, `obj[key]` without bounds
3. Optional chaining misuse (20%) — `?.` but no null guard
4. Missing type assertions (10%) — loops, destructuring, map/reduce
5. Array access without guards (5%)

## §5 Incremental sub-task split

A022 split în 6 atomic phases (TOO LARGE pentru one wave):

| ID | Scope | File count | Effort | Risk |
|---|---|---|---|---|
| **A022a** | src/util/ | ~16 core files (~1500 LOC) | 30 min | LOW |
| **A022b** | src/migrations/ | 5 files (~400 LOC) | 25 min | LOW |
| **A022c** | src/storage/ | 5 core files (~600 LOC) | 35 min | MEDIUM |
| **A022d** | src/engine/calibration.js + calibrationReconciliation.js | 2 files (~700 LOC) | 45 min | MEDIUM |
| **A022e** | src/engine/bayesianNutrition/ + tempo/ | 16 files (~2200 LOC) | 60 min | MEDIUM |
| **A022f** | src/engine/core* | 43 files (~4500 LOC) | 120-150 min | HIGH |
| **Prep** | .d.ts type stubs (db.js, constants.js, weights.js) | ~5 files | 20 min | LOW (unblocks rest) |

**Total:** ~9-11h cumulative. Phase 1 (Prep + A022a-A022e) = ~3.5h Wave 2 candidate. A022f defer Wave 3 sau post-Beta.

## §6 Risk + false-positive storm

**If checkJs flipped naively GLOBALLY:**
- Cascade DB.get() missing return type → 100+ "implicit any" errors instant
- Storage layer assumption collapse 40+ engine files
- ~200-300 fixable-in-batch errors (same root cause)
- ~60-80 GENUINE unsafe pattern bugs uncovered (real wins!)

**Mitigation strategy mandatory:**
1. Add .d.ts type stubs FIRST (db.js exports, constants.js, config/weights.js)
2. THEN enable checkJs per-directory via tsconfig `include` pattern
3. Fix per-directory în parallel paralel atomic batches
4. Global checkJs flip ABIA dupa A022a-A022e LANDED (A022f optional decision Daniel)

## §7 Effort estimate honest

**Total:** 9-11h Opus continuous cycle
**Wave 2 Phase 1 (Prep + A022a-A022e):** ~3.5h
**Wave 3 / post-Beta Phase 2 (A022f + global flip):** ~4-5h

Real pace observed Wave A: ~5-8 min/task. Surface analysis confirms ~25-30 errors fixable per 15-min batch (when in flow).

## §8 Daniel decisions needed

1. **D-1** Type stubs first (.d.ts pentru db.js + constants + weights) — proceed autonomous Wave 2 prep step?
2. **D-2** A022 split în 6 batches (A022a-A022f) vs single 3-5h task — confirmare strategy
3. **D-3** Global checkJs flip TIMING — dupa A022a-A022e (Wave 2) sau dupa A022f (Wave 3)?
4. **D-4** Acceptable error count pre-flip — current estimate 1600-2200 errors visible imediat. Acceptable working set sau need stub-first reducție to <500?

---

🦫 **A022 LARGE confirmed (425 .js files, ~1600-2200 errors estimated). Split în 6 atomic phases + .d.ts stubs prep. Wave 2 Phase 1 ~3.5h. Wave 3/post-Beta Phase 2 ~4-5h. Daniel decisions 4 itemi.**
