# Simulations — Scenarios Coverage Suite

Per `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` + `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` (LOCKED V1 2026-05-05 evening late).

## LOCKED V1 values (2026-05-05 evening late)

- `§1` north star: **≥95% Claude parity strict**
- `§5` weights: **Safety 0.35 + Exercise 0.25 + Sets/reps/RIR 0.20 + Key principles 0.20** (universal, NU ghilotină conditional)
- `§7` gates: **Gate 1 ≥95% MATCH | Gate 2 DROPPED entirely | Gate 3 selective Daniel review pe Claude-judge flagged uncertain ~5-15%**
- `§2` corpus scope: **500 queries**

## Files

- `validation_corpus_v1.json` — 500-query corpus skeleton (empty, populated în Daniel + Claude chat strategic ground truth phase ~5 chats × 100 queries)
- `ground_truth_v1.json` — Claude reasoning baseline per query (empty)
- `match_results_v1.json` — auto-eval output history (empty)
- `run_validation.js` — orchestrator (corpus → ground_truth → andura_output → match metric → aggregate)
- `validation_runs/<YYYY-MM-DD>/` — per-run output (corpus_run_<id>.json + match_aggregate_<id>.md)

## Pipeline implementation

- `src/simulator/types.js` — JSDoc ConstraintObject + EngineOutput + BranchReport
- `src/simulator/pruning.js` — pruning rules A-E (3645 → ~1500-2000 valid branches)
- `src/simulator/pipeline.js` — engines pipeline orchestrator (LOCKED §42.10 order; engine #2 fallback §9; real engine wiring deferred)
- `src/simulator/invariants.js` — 4-Invariant Safety Stack + 5th Medical Safety
- `src/simulator/flagging.js` — 6 flagged categories per design §6
- `src/simulator/runner.js` — full simulation orchestrator
- `src/validation/matchMetric.js` — match metric utility (LOCK V1 weighted scoring)

## Tests

- `src/simulator/__tests__/pruning.test.js`
- `src/simulator/__tests__/invariants.test.js`
- `src/simulator/__tests__/flagging.test.js`
- `src/simulator/__tests__/runner-smoke.test.js`
- `src/validation/__tests__/matchMetric.test.js`

Run: `npm run test:run` (vitest existing infra).

## Deferred (post-Beta blockers)

- Real engine pure-function adapter: existing engines în `src/engine/` coupled cu app context (CDL, localStorage, Firebase) — pure-function refactor required pentru simulator usage. Scope: separate task post Engine #2 ADR 024 full spec + Engines #4-#8 ADR canonical (027/028/029).
- Claude-judge LLM call în `scoreKeyPrinciples` — currently token-Jaccard placeholder.
- 500-query corpus + ground truth population — Claude chat strategic ground truth phase (~5 chats Daniel-time guided).
