# Atomic Task File Template — Reference

**Purpose:** Reference template for atomic task files generated per BATCH at execution time.

**5 sample task files in this folder demonstrate format across all 4 active clusters:**

| Sample task | Cluster | Demonstrates |
|-------------|---------|--------------|
| `task_001_C001_auth_sendMagicLink_wire.md` | C | Wave 1 critical Auth chain entry-point cu test scaffolding |
| `task_002_A001_antrenor_date_header.md` | A | Surgical 1-3 LOC text addition + Karpathy anti-overengineering check |
| `task_003_B001_vanilla_legacy_archive.md` | B | Simplicity First large-scope cleanup (~30 findings closed) via file moves |
| `task_004_C019_subheader_shared_component.md` | C | Think Before Coding new shared component (P1 1-component-15-uses pattern) |
| `task_005_D001_bundle_code_split.md` | D | Goal-Driven multi-file refactor (perf gate Maria 65 LCP) |

---

## §1 File naming convention

`task_<seq>_<cluster><cluster_seq>_<short-slug>.md`

Examples:
- `task_001_C001_auth_sendMagicLink_wire.md` — first task overall, Cluster C task #1
- `task_002_A001_antrenor_date_header.md` — second overall, Cluster A task #1
- `task_127_C055_settings_themes_picker.md` — 127th overall, Cluster C task #55

**Seq monotonic increment across all clusters.** Cluster-internal counter per cluster (C001 → C080, A001 → A180, etc.).

---

## §2 Required sections per atomic task file

```markdown
# Task <ID> — <Short title>

**Cluster:** A | B | C | D
**Karpathy:** Surgical Changes | Simplicity First | Think Before Coding | Goal-Driven
**Effort:** S (≤30min) | M (≤4h) | L (multi-file)
**Beta blocker:** YES Wave 1 | YES Wave 2 | NO Wave 3
**Source finding(s):** (cite primary-source file:line verbatim per D008)

**File(s) touched:** src/path:line + ...
**Dependencies:** task_XXX (if blocked by other task)

## §A Pre-flight
Read primary-source line cited. ZERO recall din memorie. GitNexus impact + query commands.

## §B Implementation
Step-by-step surgical edit spec. Code blocks for new/changed code. Karpathy anti-overengineering check.

## §C Tests
Vitest/Playwright assertion spec. NU expand scope beyond task target.

## §D Commit
Atomic single-concern Bugatti commit message format:
fix(<TaskID>-<short-slug>): <description> (<source-citation>)

## §E Verify post-edit
gitnexus_detect_changes + grep test command + expected output.
```

---

## §3 Execution-time generation

**Design session (this):** ONLY 5 sample task files generated (this folder).

**Per-BATCH execution session (subsequent):**
1. CC autonomous reads `BATCH_NN.md` spec
2. For each task line item, CC expands → inline `task_<NNN>_<ID>_<slug>.md` file in this folder
3. CC executes per atomic task: §A → §E
4. CC commits per task
5. CC updates `_progress.md` after each task LANDED
6. Post-BATCH: tag + push + Daniel review

**Rationale:** generating 340 task files upfront = ~27k LOC artifacts that go stale during execution. Lazy generation per BATCH = fresh GitNexus context per task + minimal churn.

---

## §4 Karpathy anti-overengineering check per task

Every atomic task includes section verifying NO scope creep:

- ❌ NU add features beyond task scope (Karpathy SC)
- ❌ NU refactor surrounding code (separate task if needed)
- ❌ NU add abstractions beyond what task requires (YAGNI)
- ❌ NU half-finished implementations
- ❌ NU error handling for impossible scenarios
- ❌ NU comments beyond non-obvious WHY

If task feels like it's growing beyond effort estimate (S/M/L), STOP + Daniel decide split into multiple atomic tasks.

---

## §5 D008 anti-halucinare strict per task

Every `§A Pre-flight` section requires:

1. Read primary-source finding file LINE CITED verbatim
2. Read mockup `04-architecture/mockups/andura-clasic.html:<line>` if MP source
3. Read prod file scope verbatim before any edits
4. GitNexus impact + query commands run + report blast radius
5. NO recall din memorie — uncertain → READ first

**Pattern violation = task FAIL.** Re-paste task next session post-Daniel-decision.

---

🦫 **Task template README. 5 sample files reference. Execution-time generation per BATCH. Format strict — anti-halucinare + anti-overengineering invariant.**
