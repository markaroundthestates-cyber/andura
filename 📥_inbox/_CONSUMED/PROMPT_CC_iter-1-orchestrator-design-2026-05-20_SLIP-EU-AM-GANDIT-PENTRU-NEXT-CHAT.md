# PROMPT_CC — Iter 1 Mass Fix Backlog Orchestrator Design 2026-05-20

**Trigger:** Daniel paste sesiune CC dedicated cwd `salafull/` next chat post-handover
**Model:** Opus 4.7 EXCLUSIVELY (anti-fallback policy NEVER downgrade)
**Mode:** Strategic design + tactical orchestrator generation, NU execution fix-uri
**Stop trigger UNIC:** Daniel explicit STOP signal (STOP / caveman / stai / Ctrl+C / "termina")
**Procedure:** D043 LOCKED V1 iter 1 design phase — fix execution post Daniel CEO approve plan
**Authority:** Daniel CEO directive verbatim chat birou 2026-05-20: *"se gandeasca si eventual sa imi faca un Atomic fix sau batch cu orchestrator, de cate prompturi e nevoie... pot fi si 500, ca sa taiem cat mai mult din munca"*

---

## §0 Identitate

Tu ești Co-CTO autonomous Andura. Daniel = CEO + Product Owner. Misiunea ta = design master orchestrator pentru iter 1 mass fix backlog convergence loop D043. Output: spec atomic granular per finding (50, 200, 500+ prompturi — cât e nevoie pentru peak Karpathy Surgical Changes + maximum parallelization).

NU executa fix-uri în această sesiune. Doar design + spec orchestrator. Daniel CEO valideaza plan post-LANDED design → trigger separate execution sessions per BATCH.

---

## §1 Pre-flight read mandatory

`Read` în ordine:

1. `ANDURA_PRIMER.md` complete §1-§8 (singular briefing instant context)
2. `DECISIONS.md` head 50 + `§D042` detail section + `§D043` detail section (LOCKED V1 ABSOLUTE gate path)
3. `📥_inbox/HANDOVER_2026-05-20_iter-1-mass-fix-planning.md` (predecessor chat handover narrative)
4. `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` (698 findings source 1)
5. `📤_outbox/mockup-vs-prod-parity-2026-05-20/SUMMARY.md` (263 findings source 2)
6. `📤_outbox/audit-nuclear-2026-05-19/_progress.md` (D029 multi-pass status)
7. `📤_outbox/mockup-vs-prod-parity-2026-05-20/_progress.md` (audit Pass 1+2+3+4+5 COMPLETE checkpoint)
8. Sample 3-5 audit-nuclear findings-§NN.md + 3-5 mockup vs prod findings-<screenId>.md (pentru pattern recognition exact format finding)

---

## §2 Design objectives

### §2.1 Aggregate backlog source-of-truth

Build master backlog file:
```
📥_inbox/iter-1-mass-fix/_MASTER_BACKLOG.md
```

Conține TOATE findings outstanding aggregated dual-source:
- **Audit Nuclear D029** (HEAD `b705c3f` 2026-05-19): 698 raw → 640 outstanding post Phase 7 fix `05d0859` (58 closed) → exclude ~250 no-op/POSITIVE confirms → **~390 real actionable**
- **Audit Mockup vs Prod** (HEAD curent `caaae99` 2026-05-20): 263 raw → exclude ~13 OK/positives → **~250 real actionable**
- Overlap check: §19 D029 (12 findings) vs Mockup audit (263) — dedupe overlap (estimat ~6 redundant)
- **Total iter 1 master backlog: ~635 real actionable findings** (range 600-700)

Per finding row:
| Source | Finding ID | Severity | Category | File scope | Karpathy fix | Effort | Beta blocker | Cluster ID | Dependencies |

### §2.2 Cluster grouping strategy

Grupare findings în BATCH-uri parallel-safe vs sequential dependent:

**Karpathy-driven primary axis:**
- **Cluster A — Surgical Changes single-file** (~250-300 findings): independent fix-uri 1-3 lines per finding, atomic commit. Parallelizable infinit.
- **Cluster B — Simplicity First small-refactor** (~80-100 findings): 1-2 files, ~20-50 LOC delete/restructure. Parallelizable per file.
- **Cluster C — Think Before Coding new-component** (~100-150 findings): 1-3 files new code (e.g., shared ConfirmModal + 7 use sites, CoachTodayCard engine wire). Parallelizable per component.
- **Cluster D — Goal-Driven multi-file refactor** (~80-120 findings): 5+ files coordinated (e.g., vanilla legacy migration 77+ files, zod boundary schemas, branded types, FSM discriminated unions, code-split). Sequential dependent or large single BATCH.
- **Cluster E — Paradigm decisions Daniel CEO** (~30-60 findings): cluster discussion sessions, NU CC autonomous (SettingsPrefs PARADIGM SWAP, F5 vs LOCK 9 disambiguation, Antrenor secondary reglaj contradictions). Deferred până Daniel CEO decision sessions.

**File-scope secondary axis** (within each cluster):
- Sub-cluster per file (e.g., Cluster A → src/react/routes/screens/antrenor/* sub-cluster, src/engine/* sub-cluster, etc.)
- Parallelization safe = different files within sub-cluster OR different sub-clusters

### §2.3 Atomic prompt count estimate

Daniel directive: *"de cate prompturi e nevoie... pot fi si 500"*.

Strategy:
- **Atomic granular Cluster A** = 1 prompt per finding (~250-300 prompturi). Maximum granularity Karpathy Surgical Changes. Fail-stop recovery cheap (re-paste single task).
- **Cluster B+C** = 1 prompt per finding cluster (~80 + 100 prompturi). Component-level atomic.
- **Cluster D** = 1 prompt per multi-file refactor task (~30-50 prompturi). Larger scope per prompt.
- **Cluster E** = deferred Daniel discussion sessions (NU CC prompturi).

**Estimated total atomic prompturi: ~450-550** (sub Daniel scope max 500+).

### §2.4 BATCH grouping for execution

Per execution session CC autonomous Opus continuous:
- **BATCH-uri Karpathy Surgical Changes**: ~24-30 task atomic per BATCH (per Phase 6 BATCH 24-task pattern D026 success). ~10 BATCH-uri total Cluster A. Cumulative ~50-60h CC continuous.
- **BATCH-uri Simplicity First**: ~15-20 task per BATCH. ~5 BATCH-uri total Cluster B.
- **BATCH-uri Think Before Coding**: ~10 task per BATCH (heavier reasoning load). ~10 BATCH-uri total Cluster C.
- **BATCH-uri Goal-Driven multi-file**: ~3-5 task per BATCH (large scope). ~10 BATCH-uri total Cluster D.
- **Cluster E**: Daniel discussion sessions, throughput depinde Daniel availability.

**Total BATCH-uri estimate: ~35-40 BATCH-uri CC autonomous + Cluster E Daniel sessions parallel.**

### §2.5 DAG dependencies

Detect inter-finding dependencies:
- F1 blocks F2 dacă F1 = component new (e.g., ConfirmModal) + F2 = use site usage
- F1 blocks F2 dacă F1 = file restructure (e.g., vanilla migration src/_legacy-vanilla/) + F2 = touches same file

Output:
```
📥_inbox/iter-1-mass-fix/_DAG.md
```

Mermaid graph BATCH-uri dependencies + critical path identify.

---

## §3 Output structure

```
📥_inbox/iter-1-mass-fix/
├── ORCHESTRATOR.md              # master spec + sequencing + fail-stop protocol + commit conventions
├── _MASTER_BACKLOG.md           # ~635 findings aggregated source-of-truth
├── _CLUSTER_A_surgical.md       # ~250-300 atomic task spec list
├── _CLUSTER_B_simplicity.md     # ~80-100 atomic task spec list
├── _CLUSTER_C_think-before.md   # ~100-150 atomic task spec list
├── _CLUSTER_D_goal-driven.md    # ~80-120 atomic task spec list
├── _CLUSTER_E_paradigm.md       # ~30-60 deferred Daniel CEO decisions
├── _DAG.md                      # dependency graph + critical path
├── task_001.md → task_NNN.md    # atomic finding fixes per Karpathy Surgical Changes (Cluster A primarily)
└── BATCH_001.md → BATCH_NN.md   # cluster groupings parallel-safe execution sessions
```

### §3.1 Atomic task file format

Per `task_NNN.md`:
```
# Task NNN — <Short title>

**Cluster:** A | B | C | D
**Karpathy fix:** Surgical Changes | Simplicity First | Think Before Coding | Goal-Driven
**Effort:** S (≤30min) | M (≤4h) | L (multi-file)
**Beta blocker:** YES (Tier 1) | YES (Tier 2) | NO
**Source finding(s):** F-<source>-<id> (cite audit-nuclear OR mockup-vs-prod)
**File(s) touched:** src/...:<line> + ...
**Dependencies:** task_XXX (if blocked by other task closing first)

## §A Pre-flight
<read file primary-source per D008 anti-halucinare>

## §B Implementation
<surgical edit spec exact, anti-overengineering>

## §C Tests
<vitest/playwright assertion update if needed, NU expand scope>

## §D Commit
<atomic single-concern Bugatti commit message format>

## §E Verify post-edit
<grep test command + expected output>
```

### §3.2 BATCH file format

Per `BATCH_NN.md`:
```
# BATCH NN — <Cluster + theme>

**Tasks included:** task_NNN → task_MMM (range continuous within cluster)
**Parallelization:** safe parallel (different files) | sequential (file dependency)
**Estimated duration:** ~Xh CC continuous Opus
**Fail-stop:** per task atomic commit; fail mid-BATCH → mark task failed în BATCH log + skip + continue

## Pre-flight BATCH
<git tag pre-batch backup + tests baseline green verify>

## Tasks loop sequence
1. Read task_<first>.md → execute → commit atomic
2. ...
3. Read task_<last>.md → execute → commit atomic

## Post-BATCH
<git tag post-batch milestone + push origin manual final>
```

### §3.3 ORCHESTRATOR.md master spec

```
# ORCHESTRATOR — Iter 1 Mass Fix Convergence Loop D043

**Total backlog:** ~635 findings actionable
**Total atomic tasks:** ~NNN
**Total BATCH-uri:** ~MM
**Estimated CC autonomous Opus continuous:** ~XXh cumulative (~Y days @ 8-10h/day sustainable)
**Daniel approval gate:** post-LANDED design, pre-execution

## §1 Execution protocol
<per BATCH atomic commit + fail-stop + push manual final per cluster milestone>

## §2 Fail-stop recovery
<per task fail → mark task_NNN.md FAILED + skip + continue BATCH + Daniel review post-BATCH>

## §3 Convergence check post iter 1
<run audit nuclear D029 procedure pe HEAD post-iter-1 + scan Track 7 systems aggregate → _aggregate-findings.md → CONTINUE iter 2 OR EXIT loop>

## §4 Backup tags + milestones
<pre-iter-1 backup tag + per-cluster milestone tag pushed origin>

## §5 Anti-recurrence
<D008 primary-source verify mandatory + D023 MCP write_file + D041 anti-inflation per task report>
```

---

## §4 Procedure constraints

### §4.1 Design only, NO execution

NU executa fix-uri în această sesiune. Doar design + spec orchestrator + atomic task files + BATCH files + DAG. Daniel CEO validates plan post-LANDED → trigger separate execution sessions per BATCH.

### §4.2 Anti-halucinare strict

Per finding citation primary-source mandatory:
- Audit Nuclear: cite `📤_outbox/audit-nuclear-2026-05-19/findings-§NN.md:<line>` per finding pulled
- Audit Mockup vs Prod: cite `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-<screenId>.md:<line>` per finding pulled
- Mockup ref: cite `04-architecture/mockups/andura-clasic.html:<line>` per finding reference
- Prod ref: cite `src/react/...:<line>` per finding reference

ZERO recall din memorie. ZERO fabricated finding IDs.

### §4.3 Bandwidth pacing /compact

Daniel `/compact` rezolvă context-ul instant fără pierdere. NU defer pe rațiune bandwidth — log progres + așteaptă Daniel `/compact` în session. CC continuă post-compact din checkpoint.

### §4.4 MCP filesystem write_file mandatory

D023 LOCKED V1 — toate vault writes via `filesystem:write_file` + post-write `filesystem:list_directory` verify. NU `create_file` pe Windows emoji paths.

### §4.5 Anti-inflation discipline D041

Format raport progres design phase:
- `Aggregated: NNN findings from source A + MMM from source B - overlap PPP = TTT total`
- `Atomic tasks generated: XXX`
- `BATCH-uri grouped: YY`
- `Estimated CC autonomous duration: ZZh cumulative measured per task effort S/M/L breakdown`

NU compound estimate "ready to start". Per-task measurement explicit.

---

## §5 Skills mandatory pre-task

- Sequential Thinking — root cause cluster reasoning + fix strategy per finding
- Karpathy 4 principii — attribution per finding mandatory + cluster A/B/C/D assignment
- Context7 — Tailwind class lookup, Lucide icon names, React 19 API reference dacă needed
- gstack /qa + /review — self-review embedded post each cluster spec LANDED
- Impeccable /critique — orchestrator design self-critique pre-DANIEL-LANDED

---

## §6 Start trigger

CC autonomous citește prompt + pre-flight §1 reads → design phase §2 → output structure §3 → STOP Daniel explicit OR design COMPLETE LANDED.

ETA design phase: ~3-5h Opus continuous (mostly read + cluster + write, low fix complexity). Daniel `/compact` dacă bandwidth low — NU defer.

Post design LANDED Daniel CEO review master spec → approve → trigger separate execution sessions per BATCH per D043 loop iter 1.

---

🦫 **Iter 1 Mass Fix Orchestrator Design. D043 loop iter 1 prep. NO execution. Atomic granular ~450-550 prompturi target. D042+D043 ABSOLUTE gate. /compact NU defer.**
