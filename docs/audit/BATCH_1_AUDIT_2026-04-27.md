# Sprint Foundation Batch 1 — Adversarial Audit

**Date:** 2026-04-27
**Scope:** Dimension Registry + Standardized Contract + Decision Cluster (commits f4b7b0c, 403fb2a, 0cfdae7)
**Auditor:** Opus 4.7 (adversarial, post-build)
**Tests baseline:** 676/676 pass (583 baseline + 93 new)

---

## Verdict

**SAFE for Batch 2** — no CRITICAL findings. 1 HIGH advisory + 4 MEDIUM + 9 LOW for follow-up. Foundation is structurally sound; recommendations below should be addressed at strangler integration time (when AA + Profile Typing first port to dimensions), not as blockers for Batch 2 (Schema Versioning + Feature Flags).

Quality bar reached: contract guarantees pinned, validation comprehensive, edge cases handled defensively, async support correct, no anti-patterns detected.

---

## CRITICAL (block Batch 2)

**None.**

---

## HIGH (should-fix before strangler integration)

### HIGH-1 — Cluster trace shape diverges from ADR 011 §rationale; CDL adapter undocumented

**Location:** `decisionCluster.js:108-144` (return shape)
**Issue:** ADR 018 §3 promises trace alignment with ADR 011 `proposed.rationale.overridden` pattern. Cluster trace is much richer:

```
{ shortCircuited, stages: { GATE, ADJUSTMENT, ENHANCEMENT }, errors, stageMismatches }
```

vs ADR 011:

```
proposed.rationale: { winnerId, winnerPriority, overridden: [...] }
```

**Why matters:** When strangler ports CoachDirector to use cluster, the CDL write at `coachDirector.js:208-222` expects ADR 011 shape directly. There is no documented adapter from cluster trace → ADR 011 fields. In short-circuit case, the mapping is straightforward (`gateOutcome.trace.winner` → `winnerId`); in non-gate case the "winner" concept becomes ambiguous (multiple ADJUSTMENT recs all "win" cumulatively).

**Why NOT critical:** The mapping exists implicitly — the data is present in trace, just not in ADR 011's exact shape. Strangler-time refactor can derive it. But the absence of an explicit adapter helper or documentation creates a hand-off liability.

**Proposed fix:** In Batch 2 or strangler PR, add an adapter:

```js
// src/engine/decisionCluster.js
export function clusterTraceToADR011Rationale(trace) {
  if (trace.shortCircuited) {
    return {
      winnerId: trace.stages.GATE.winner.source,
      winnerPriority: trace.stages.GATE.winner.priority,
      overridden: trace.stages.GATE.overridden.map(o => o.source),
    };
  }
  // Non-gate case: highest-priority ADJUSTMENT rec is "winner"; rest are overridden
  const adj = trace.stages.ADJUSTMENT.fired;
  const [first, ...rest] = adj;
  return {
    winnerId: first ? first.source : 'NO_RULE_FIRED',
    winnerPriority: first ? first.priority : null,
    overridden: rest.map(r => r.source),
  };
}
```

Add tests covering both gate and non-gate flows. Document hand-off contract in cluster JSDoc.

---

## MEDIUM (nice-to-fix)

### MED-1 — `shorten_session` compound application produces misleading `originalCount`

**Location:** `decisionCluster.js:364-371`
**Issue:** When two ENHANCEMENT recs both emit `shorten_session`, the second uses the already-truncated array length as `originalCount`:

- baseSession.exercises = [A,B,C,D,E] (5)
- First shorten count=3 → exercises=[A,B,C], `shortened: {originalCount: 5, newCount: 3}`
- Second shorten count=2 → exercises=[A,B], `shortened: {originalCount: 3, newCount: 2}` ⚠

The trace's `originalCount: 3` is wrong from a user-facing perspective ("shortened from 5 to 2", not "from 3 to 2").

**Why matters:** Trace fidelity for CDL consumers (debug UI, analytics).

**Why NOT high:** Compound shorten is an unlikely real-world combination. Currently no two dimensions emit `shorten_session` simultaneously.

**Proposed fix:** Apply only highest-priority `shorten_session` (winner-takes-all per action verb within ENHANCEMENT). Pre-pipeline, dedupe `shorten_session` recs by keeping the lowest count (most restrictive):

```js
const shortens = enhancements.filter(e => e.rec.action === ACTIONS.SHORTEN_SESSION);
const winner = shortens.sort((a, b) => (a.rec.payload.count ?? Infinity) - (b.rec.payload.count ?? Infinity))[0];
// Apply only winner; record overridden-shortens in trace.
```

Alternative: capture true original at pipeline start via `baseExercisesLength`, propagate through `_runEnhancementStage`. Slightly more invasive.

Add test: `it('compound shorten_session uses true original count')`.

---

### MED-2 — Tie-break behavior on identical priorities not documented or tested

**Location:** `decisionCluster.js:179` (`gateRecs.sort`), `decisionCluster.js:237` (`adjustments.sort`), `decisionCluster.js:291` (`enhancements.sort`)
**Issue:** When two recommendations share a priority value (e.g., AA MED 75 and Vitality LOW 65 are documented at distinct priorities, but parity collisions are realistic — see ADR 016 §6 "Profile Typing + Vitality at parity 65"), Array.prototype.sort tie-break depends on input order. Modern V8 has stable sort (ECMA-2019), so input order wins, but this is not pinned in tests and not documented in code comments.

**Why matters:** Determinism is a contract guarantee (ADR 018 §2). Tie-break order affects which rec is the "winner" in stage compose and trace clarity.

**Why NOT high:** Modern Node/Vitest environments have stable sort. Behavior is correct; just unpinned.

**Proposed fix:** (a) Add a doc comment on each sort site: `// Stable sort: ties broken by input order (registry order at registration time).` (b) Add a test that asserts deterministic behavior: register two same-priority dims A then B, verify A appears before B in fired array. (c) Optional: explicit secondary tie-break by id alphabetical for cross-engine determinism guarantee.

---

### MED-3 — "Sets reduction caps acumulează" semantics under-specified; MIN interpretation unlocked

**Location:** `decisionCluster.js:244-248` (`composedSetsCap = Math.min(...)`)
**Issue:** ADR 018 §3 says "Sets reduction caps acumulează" (accumulate). Current implementation uses `Math.min` (most restrictive cap wins). This is one of three viable interpretations:

- **MIN** (current): `min(cap1, cap2)` — most restrictive wins
- **SUM**: `cap1 + cap2` — caps stack (nonsensical for caps)
- **SEQUENTIAL**: each cap applied after previous, equivalent to MIN

MIN and SEQUENTIAL converge mathematically, but a future reader may legitimately interpret "acumulează" as SUM and refactor away.

**Why matters:** Locked semantic via test prevents reinterpretation.

**Why NOT high:** Current MIN behavior is correct and tested. Issue is documentation, not behavior.

**Proposed fix:** Code comment at line 244 explaining the choice:

```js
// Sets caps compose via MIN (most restrictive wins). Equivalent to sequential
// application — `min(cap_so_far, new_cap) = new_cap` iff new_cap < cap_so_far.
// SUM interpretation would be nonsensical (caps don't stack additively).
```

Already covered by test `'composes sets caps via minimum (most restrictive wins)'` at decisionCluster.test.js:124. Confirmed locked. Doc-only fix.

---

### MED-4 — Contract guarantees (pure / deterministic / total) documented but not runtime-enforced

**Location:** `dimensionContract.js:5-12` (header doc) + `dimensionContract.js:154-178` (createDimensionResult)
**Issue:** ADR 018 §2 promises three guarantees:

1. **Pure** — no side effects in `analyze()`
2. **Deterministic** — no Date.now / Math.random in body
3. **Total** — never throws

`createDimensionResult` makes (3) trivial to comply with via early-return defaults. But (1) and (2) rely entirely on dimension implementer discipline. Cluster won't catch violations.

**Why matters:** A future dimension that does `localStorage.setItem` or `await fetch(...)` inside analyze() would silently break async determinism + pipeline reproducibility.

**Why NOT high:** Pre-Batch 1 dimensions don't exist yet. Convention is documented at the contract level; PR review can catch violations. No runtime enforcement is standard for JSDoc-typed APIs.

**Proposed fix:** Add a `runDimensionConformanceCheck(module)` helper in tests/ that:
- Runs analyze(input) twice with identical input — asserts deep-equal results (catches Date.now / random)
- Spies on global localStorage / fetch / Sentry — asserts no calls during analyze (catches side effects)

This becomes a re-usable test scaffold per dimension at strangler time. Out of scope for Batch 1 itself.

---

## LOW (cosmetic / refinement)

### LOW-1 — `STAGES` imported in `decisionCluster.test.js:3` but unused
Test uses string literal `'GATE'` (line 288, 320) instead of `STAGES.GATE`. Replace literals with const ref. Cosmetic, no behavior impact.

### LOW-2 — `findDimension` exported (registry) but unused in current codebase
Speculative API for future strangler. Acceptable — documented use-case in registry comments.

### LOW-3 — `assertValidRegistry` not called at module init
Registry could self-validate at import. Currently only called from tests. Add as dev-mode bootstrap:
```js
// src/engine/dimensionRegistry.js (dev guard)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  assertValidRegistry();
}
```
Catches malformed registrations at import-time in dev/test. Out of scope for Batch 1; add at strangler.

### LOW-4 — `shorten_session` `newCount` in trace doesn't clamp to actual exercises length
`{ payload: { count: 100 } }` on a 5-item array → `slice(0, 100)` returns 5 items, but trace records `newCount: 100`. Misleading.
**Fix:** `newCount: Math.min(Math.max(0, count), session.exercises.length)`. Trivial.

### LOW-5 — `REDUCE_VOLUME` accepts multiplier > 1 (would *increase* volume)
Verb `reduce_volume` implies <= 1, but no clamp. A misbehaving dimension could pass 1.5 → volume scales up. Caller-side problem; foundation acceptable.

### LOW-6 — `REDUCE_VOLUME` multiplier 0, negative, or NaN not defensively validated
Caller responsibility per contract. Could add a `Number.isFinite(...)  && multiplier >= 0` check at line 241 to skip pathological values. Low priority — `assertValidRecommendation` already requires payload to be object, but doesn't constrain multiplier shape.

### LOW-7 — `CDLEntry` typedef in `dimensionContract.js:26-27` is bare description
No property list. Should mirror ADR 011 schema (id, ts, date, context, proposed, outcome). Improves IDE intellisense. Optional.

### LOW-8 — Registry doesn't enforce ADR 018 §1 file convention (`src/engine/dimensions/<id>.js`)
Manual discipline only. Could add a registry helper that, given an id, checks the module path. Out of scope for foundation.

### LOW-9 — Cluster ignores dimension `tier` and `confidence` fields
Per ADR 018 they're informational ("tooling, debugging"). Could be considered for priority weighting in future (e.g., LOW-confidence dims discounted). LOW because ADR 018 explicitly defines them as informational.

---

## Strengths (preserve in any refactor)

1. **Static `DIMENSIONS = []` array per DP-1** — zero runtime mutation surface. Clean migration path documented inline.
2. **Comprehensive validation helpers** — `assertValidDimensionEntry`, `assertValidRegistry`, `assertValidDimensionResult`, `assertValidRecommendation` — all 4 with specific error messages. Catches malformed data at registration sites + tests.
3. **Calibration tier ordering case-insensitive normalization** (`_normalizeTierName` toUpperCase) — accommodates both ADR-doc `INITIAL` and runtime `initial` (calibration.js exposes lowercase). Defensive handoff between docs ↔ code.
4. **Frozen enums** (`Object.freeze` on STAGES/CONFIDENCE/TIERS/ACTIONS/ACTION_STAGE_MAP) — immutable, mutation attempts throw in strict mode. Test asserts immutability.
5. **`createDimensionResult` smart defaults** — coerces non-array → `[]`, non-object → `{}`, missing fields → no-signal defaults. Makes "total function" contract trivial to comply with.
6. **`Promise.allSettled` for async input** — graceful failure isolation. Single rejected promise doesn't kill pipeline.
7. **Sentry capture wrapped in try/catch** (`decisionCluster.js:457-461`) — Sentry's own failure can't crash cluster.
8. **Stage validation strict + non-strict modes** — test-time strictness catches mismatches early; production logs + continues.
9. **`baseSession` cloning** (`_cloneSession` deep-clones exercises, warnings, banners arrays) — input mutation impossible. Tested.
10. **Source attribution on warnings/banners** — UI can show "AA: easy on volume" with provenance. Trace transparency from edge to consumer.
11. **`findDimension` + `getActiveDimensions` accept `opts.dimensions` override** — tests can run isolated registry without singleton pollution.
12. **NULL_LOGGER default** — cluster never crashes on missing logger. Optional chaining (`logger.warn?.()`) survives partial logger objects.
13. **Frozen action verb enums + ACTION_STAGE_MAP** — single source of truth for stage routing. Extension hatch (unknown verb passes through).
14. **Trace structure rich + categorized** — fired/winner/overridden per stage, errors collected separately, stageMismatches surfaced. Better debugging surface than ADR 011 minimal `rationale`.
15. **DimensionResult tier/confidence informational only** — keeps cluster simple. Tier labels (HIGH/MED/LOW) can evolve per dimension without forcing cluster refactor.

---

## Test Coverage Audit

| Component | Source LOC | Test LOC | Tests | Coverage Estimate |
|---|---|---|---|---|
| dimensionRegistry.js | 196 | 226 | 31 | ~95% (all branches + error paths) |
| dimensionContract.js | 262 | 228 | 34 | ~95% (constants + validators + helpers) |
| decisionCluster.js | 469 | 348 | 28 | ~88% (3 stage runners + handlers + utils + async) |

**Coverage gaps identified (would lift cluster to ~95%):**
- No test for compound `shorten_session` (covers MED-1)
- No test for tie-break determinism on identical priorities (covers MED-2)
- No test for ADJUSTMENT handler with malformed payload (multiplier missing, cap NaN)
- No test for cluster.execute() returning `Promise` shape (only awaits via async)

These are HIGH-confidence skip — Batch 1 foundation passes; gaps are nice-to-add at strangler integration.

---

## Reconsideration Trigger Status (ADR 018)

| # | Trigger | Status |
|---|---|---|
| 1 | Dimension count plateau < 8 după 12 luni | N/A (Batch 1) |
| 2 | Cluster performance > 100ms | Sub-ms verified at N=10 dims |
| 3 | Schema migration runner failing > 5% | Batch 2 |
| 4 | Feature flag rollout NU folosit 6 luni | Batch 2 |
| 5 | Cross-dimension dependencies emerge | ✅ Aligned with ADR 016 DP-3 (independent dims) |
| 6 | Multi-tenant auth deployed | Future (per ADR 011 trigger #6) |

No triggers active or imminent.

---

## Verdict

**SAFE for Batch 2 (Schema Versioning + Feature Flags).**

HIGH-1 (CDL adapter) is the only finding worth flagging; it's a strangler-time adapter task, not a foundation defect. Batch 2 work is independent of HIGH-1.

MED-1 (shorten compound), MED-2 (tie-break), MED-3 (sets cap doc), MED-4 (contract conformance helper) — all are recommended polish at strangler integration time. None block Batch 2.

LOW findings are cosmetic / speculative — accumulate as TODOs.

**Recommendation:** proceed with Batch 2. Re-audit at strangler integration (when AA detection becomes the first ported dimension).

---

*Audit signed Opus 4.7 — 2026-04-27. 14 findings (0 critical, 1 high, 4 medium, 9 low) + 15 strengths.*
