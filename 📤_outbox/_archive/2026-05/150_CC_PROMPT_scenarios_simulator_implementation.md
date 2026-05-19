# CC OPUS PROMPT — SCENARIOS SIMULATOR IMPLEMENTATION

**Model:** Opus (cross-engine integration + matrice generator + invariants validation = NON-mecanic)
**Estimate:** ~4-8h CC autonomous
**Mode:** `claude --dangerously-skip-permissions` (Daniel default)
**Path target:** `📤_outbox/CC_PROMPT_scenarios_simulator_implementation.md`

---

═══ START PROMPT CC ═══

**Task:** Implement Scenarios Simulator pe baza spec `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` + benchmark utility skeleton pe baza `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md`.

**Model:** Opus (cross-engine integration scope, NON-mecanic).

## STEP 1 — Pre-flight

```bash
git status                                 # verify clean tree
git branch --show-current                  # main
git tag pre-simulator-$(date +%Y-%m-%d-%H%M)
git push origin --tags
```

Read SSOT specs:
- `04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1.md` (architecture full)
- `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` (corpus + match metric)

Read engines existing code:
```bash
ls src/engine/                             # inventory existing engines
grep -r "export function" src/engine/      # signature inventory
```

Read engines specs cumulative din HANDOVER chat sessions (CRITICAL):
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §45.x cluster (Engines #1-#8 specs dispersed)
- `03-decisions/022-bayesian-nutrition-inference.md` (Engine #3 SPEC READY V1)
- `03-decisions/024-goal-driven-program-templates.md` (Engine #2 STUB caveat — workaround §9 design spec)
- `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (decision tree foundation)

## STEP 2 — Implementation tasks

### Task 1: Constraint Object types

Create `src/simulator/types.ts` per design §2.3:
- `ConstraintObject` readonly type
- `EngineOutput` per engine type
- `BranchReport` per design §5

### Task 2: Pruning module

Create `src/simulator/pruning.ts`:
- `pruneInvalidCombos(matrix3645): ValidBranches[]` — apply rules A-E per design §3.2
- Output ~1500-2000 valid branches
- Test: snapshot fixture pruned set + spot-check ~20 known-invalid combos correctly excluded

### Task 3: Engines pipeline orchestrator

Create `src/simulator/pipeline.ts`:
- `runEnginesPipeline(constraint: ConstraintObject): Promise<EnginesPipelineOutput>`
- Order LOCKED §42.10 (Periodization → Goal Adaptation → Energy → Exercise Selection → Warm-up → Execution + Tempo + Specialization → Deload trigger)
- Engine #2 fallback per design §9 (240 templates baked + flag `engine_2_spec_gap`)
- Async-capable per ADR 018 DP-2

### Task 4: Invariants validator

Create `src/simulator/invariants.ts`:
- 4-Invariant Safety Stack (§42.9): I1 volume<MRV, I2 RIR>0, I3 frequency<6, I4 deload mandatory
- 5th Medical Safety (§50.3.10): I5 contraindication respected
- `validateBranch(output: EnginesPipelineOutput): InvariantsCheck`

### Task 5: Flagging engine

Create `src/simulator/flagging.ts`:
- 6 categories per design §6 (engines_disagree, circuit_breaker_fallback, invariant_violation, output_non_sane, coverage_gap, persona_critical_edge)
- `flagBranch(branch: BranchReport): string[]`
- `claude_reasoning_required` boolean per branch

### Task 6: Runner + storage

Create `src/simulator/runner.ts`:
- `runFullSimulation(): Promise<void>`
- Iterates valid branches → pipeline → invariants → flags → BranchReport
- Writes:
  - `simulations/scenarios_coverage_v1.json` (full)
  - `simulations/scenarios_coverage_v1_flagged_only.json` (subset)
  - `📤_outbox/SCENARIOS_COVERAGE_REPORT_V1.md` (Markdown summary)

### Task 7: Validation corpus skeleton

Create `simulations/validation_corpus_v1.json`:
- Skeleton 250-500 queries per Validation Framework §2.1-2.2
- Persona × Goal-Phase × Experience × Equipment × History × Recovery sampled
- Empty `claude_reasoning` fields (filled separate Daniel chat strategic sessions)

### Task 8: Match metric utility

Create `src/simulator/matchMetric.ts`:
- 4-dim semantic agreement per Validation Framework §5.1
- `computeMatchScore(claudeReasoning, anduraOutput): MatchScore`
- Pre-Beta gate calc per §7

## STEP 3 — Tests

Create `src/simulator/__tests__/`:
- `pruning.test.ts` — snapshot pruned set + spot checks
- `pipeline.test.ts` — Property-based 1000 random ConstraintObject → invariants always PASS
- `invariants.test.ts` — Golden Master fixtures ~150-200 critical edge cases
- `flagging.test.ts` — Persona Suite ~50-100 representative (Maria 65 + injury combos, Marius advanced hyperfocus, Gigel beginner mom, etc.)
- `matchMetric.test.ts` — match score computation cu fixtures

Test target: existing `vitest + jsdom` setup (Daniel Gates infra reuse).

## STEP 4 — Output report

Generate `📤_outbox/LATEST.md` per format raport SSOT:

```
## Task: Scenarios Simulator Implementation
**Model:** Opus
**Status:** Complete | Issues | Failed

### Pre-flight
- Backup tag: pre-simulator-<date>
- Clean tree: yes/no

### Modificări
- src/simulator/* (8 files)
- simulations/* (corpus skeleton + first run output)
- Tests: X tests added, Y passing
- Build: pass/fail

### Commits
- <hash> feat(simulator): pruning + pipeline + invariants
- <hash> feat(simulator): flagging + runner + storage
- <hash> feat(simulator): validation corpus + match metric

### Pushed
- origin/main: yes/no

### Issues
- Engine #2 STUB workaround applied (240 templates fallback) — flagged ~X branches
- Engines #4-#8 spec consume HANDOVER §45.x raw read — confidence Y%

### Simulator first run stats
- Total branches: ~1500-2000
- AUTO_RESOLVED: X%
- FLAGGED: Y%
- INVARIANT_VIOLATION: Z (must be 0 — bug if non-zero)
- Performance: median Xms / P95 Yms (budget <50/<100ms)

### Next action
- Daniel: review flagged_only.json + decide Faza 2 chat-uri scope
- (or) Engine #2 ADR 024 full spec session priority
```

## STEP 5 — Constraints

- **Engine #2 STUB ALERT**: per design §9 workaround, NU pretinde spec complete. Flag explicit branches dependent.
- **Engines #4/#5/#6/#7/#8 specs raw HANDOVER read**: dacă spec ambiguous în HANDOVER §45.x → flag `engine_X_spec_ambiguous` în BranchReport, NU halucinați.
- **NU implementa Claude reasoning fill** — asta e Faza 2 Daniel chat strategic (Artefact 4). Simulator output flagged_only.json = INPUT pentru Faza 2.
- **NU implementa validation full run** — corpus skeleton + match metric utility only. Full validation run = post Daniel produce ground_truth_v1.json (separate Claude chat strategic sessions).
- **Performance budget enforce**: dacă median >50ms sau P95 >100ms = optimize before commit.
- **Push back productive**: dacă spec gap critical detected mid-implementation → STOP + raport `📤_outbox/LATEST.md` § Issues + escalate Daniel, NU forța implementation.

═══ END PROMPT CC ═══
