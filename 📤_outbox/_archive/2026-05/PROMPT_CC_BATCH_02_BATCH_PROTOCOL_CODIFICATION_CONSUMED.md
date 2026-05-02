# PROMPT_CC_BATCH_02_BATCH_PROTOCOL_CODIFICATION

**Model:** Opus
**Order:** 2/10
**Dependencies:** BATCH_01 complete (independent file scope, but sequential per cluster rule)
**Scope:** Codify §BATCH_PROTOCOL în VAULT_RULES.md per Sprint 4.x pilot validated
**Estimate:** ~1h

---

## CONTEXT

Per ALIGNMENT_QUESTIONS Q5 ✅ DA + Q10 ✅ 7 elements + commit format:

Sprint 4.x cluster execution (5 batches sequential, zero errors) validated `§BATCH_PROTOCOL` pattern verbal. Codification formală în `VAULT_RULES.md` MANDATORY pentru anti-rediscovery effort future.

---

## TASKS

### Task 2.1 — Append §BATCH_PROTOCOL în VAULT_RULES.md

**File:** `00-context-master/VAULT_RULES.md` (or wherever VAULT_RULES.md lives — verify path first via `find . -name "VAULT_RULES.md" -not -path "*/node_modules/*"`)

Append section la final file (sau înainte de EOF metadata dacă există):

```markdown
---

## §BATCH_PROTOCOL — Cluster Execution Standard

**Status:** LOCKED V1 (codified 2026-05-02 post Sprint 4.x pilot validation)
**Origin:** Sprint 4.x cluster (5 batches sequential, zero errors, 1110→1174 tests, 5 commits clean) — pattern validated empirically.

### Purpose

Standardize multi-batch sequential execution prin Claude Code Opus pentru clusters mari (>3 batches sau >2h Opus runtime). Prevent shared touch-point conflicts, gate dependencies, manual orchestration overhead.

### Core Rules (8 elements MANDATORY)

#### 1. Naming Convention
Pattern: `PROMPT_CC_BATCH_<NN>_<SCOPE>.md` unde:
- `<NN>` = 2-digit zero-padded sequential number (01, 02, ..., 10, 11)
- `<SCOPE>` = UPPERCASE_SNAKE_CASE descriptive (e.g., `ADR_LOCKS`, `GOLDEN_MASTER_TESTS`)

Alfabetic ordering = natural execution order.

#### 2. Header Obligatoriu
Each batch file MUST contain header:
```
**Model:** Opus | Sonnet
**Order:** N/Total
**Dependencies:** none | BATCH_XX complete
**Scope:** <one-line description>
**Estimate:** ~Xh
```

#### 3. Strict Disjuncte (zero shared touch-points)
Two batches în același cluster CANNOT modify same file or same logical unit. Verification pre-cluster: list all files modified per batch, ensure intersection = ∅.

Exception: HANDOVER_GLOBAL.md per-batch entries OK (append-only, separate sections).

#### 4. Fail-Fast Strict
Pe primul error în orice batch → STOP cluster execution. NU continue cu degraded scope. Daniel review report → manual restart sau amendment.

NU: skip failing batch, continue cu batches subsequent.

#### 5. Zero Gate Principle
Each batch self-contained — NU dependent runtime gate from another batch beyond declared `Dependencies` în header. If batch B needs runtime artifact from batch A → declare explicit în Dependencies.

NU: implicit dependencies (e.g., "BATCH_03 assumes Firebase Auth live without declaring").

#### 6. Sequential Auto-Trigger
Master command: "Execute BATCH_01 → BATCH_NN sequential per VAULT_RULES §BATCH_PROTOCOL. Fail-fast strict."

CC Opus reads each PROMPT_CC_BATCH_*.md în order, executes, generates report în `📤_outbox/_archive/<YYYY-MM>/BATCH_NN_REPORT.md`, triggers next.

#### 7. Final Batch Convention
Last batch în cluster (BATCH_NN) MUST:
- Aggregate all batch reports into single `📤_outbox/LATEST.md` consolidated
- Include: total commits + tests delta + ADR changes + carry-overs + next action recommended
- Append cumulative session-lock entry în HANDOVER_GLOBAL §36

#### 8. Commit Message Format
Each batch commits cu format:
```
feat(batch-NN): <one-line scope>

- bullet 1 detailed change
- bullet 2 detailed change
- bullet 3 cross-refs / verification
```

Example: `feat(batch-01): LOCK V1 cele 3 ADR drafts + EXT-1 DOMS hide`

### Trigger Threshold

§BATCH_PROTOCOL MANDATORY pentru:
- ≥3 batches în cluster
- ≥2h estimated Opus runtime cumulative
- Strategic execution session (NU exploratory)

OPTIONAL pentru:
- 1-2 batches isolated (use single PROMPT_CC standard)
- Exploratory work cu uncertainty pe scope

### Cross-References

- Sprint 4.x cluster pilot: `📤_outbox/SPRINT_4X_FINAL_REPORT.md` (commit `c283a81`)
- ALIGNMENT_QUESTIONS Q5 + Q10 codification scope: `06-sessions-log/HANDOVER_GLOBAL.md` §36.X
- Master orchestration command pattern: see PROMPT_CC_BATCH_*.md naming convention în `📥_inbox/` per cluster.
```

---

### Task 2.2 — Cross-ref HANDOVER_GLOBAL.md

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry sub §36 (după §36.62 din BATCH_01):

```markdown
### §36.63 §BATCH_PROTOCOL CODIFIED 2026-05-02

VAULT_RULES.md §BATCH_PROTOCOL section appended cu 8 elements MANDATORY (naming + header + disjuncte + fail-fast + zero gate + sequential + final batch + commit format) + trigger threshold + cross-refs Sprint 4.x pilot.

Pattern validated empiric Sprint 4.x cluster (5 batches sequential, zero errors). Now formal documentation prevent rediscovery effort.

**Cumulative LOCKED count:** 59 → 60 (+1 vault-rule formalized)
```

Update top-of-file `Total LOCKED` counter: 59 → 60.

---

## VERIFICATION GATE

Pre-commit:
1. `grep -c "§BATCH_PROTOCOL" <path-to-VAULT_RULES.md>` → expect ≥3 matches (header + cross-refs)
2. `grep "8 elements MANDATORY" <path-to-VAULT_RULES.md>` → expect 1 match
3. `grep "§36.63 §BATCH_PROTOCOL CODIFIED" 06-sessions-log/HANDOVER_GLOBAL.md` → expect 1 match
4. `npm test` → all pass

---

## COMMIT

```
git add 00-context-master/VAULT_RULES.md 06-sessions-log/HANDOVER_GLOBAL.md
git commit -m "feat(batch-02): codify §BATCH_PROTOCOL în VAULT_RULES post Sprint 4.x pilot

- 8 elements MANDATORY (naming + header + disjuncte + fail-fast + zero gate + sequential + final batch + commit format)
- Trigger threshold ≥3 batches sau ≥2h Opus
- Cross-refs Sprint 4.x cluster pilot c283a81
- HANDOVER_GLOBAL §36.63 entry + cumulative 59→60"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_02_REPORT.md`:

```markdown
# BATCH_02_BATCH_PROTOCOL_CODIFICATION — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- VAULT_RULES.md §BATCH_PROTOCOL section appended (8 elements + threshold + cross-refs)
- HANDOVER_GLOBAL §36.63 entry

## Verification gate
- [✅/❌] grep §BATCH_PROTOCOL: ≥3 matches
- [✅/❌] grep "8 elements MANDATORY": 1 match
- [✅/❌] grep §36.63: 1 match
- [✅/❌] npm test: all pass

## Issues
<none / lista>

## Next batch
BATCH_03_GOLDEN_MASTER_TESTS
```

Stop. Trigger BATCH_03.
