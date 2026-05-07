# HANDOVER_GLOBAL Thematic Split Plan — 2026-05-05 overnight

**Status:** 📋 **PLAN READY** — execution DEFERRED to dedicated session per VAULT_RULES §HANDOVER_PROTOCOL safety net (atomic operation requirement, blast radius minimization).
**Source:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (~7673 LOC > 7000 §VAULT_HYGIENE_PASS STEP 13 FLAG threshold; <10000 NOT ESCALATE BLOCKER).
**Strategy:** §62.2 thematic split LOCKED V1 (NU chronological cut, NU `__resolved__` folder). 7 theme files + master index file.
**Backup tag:** `pre-handover-split-2026-05-05-overnight` (pushed 2026-05-05 overnight, rollback safety).
**Wikilinks impact estimate:** ~115 file references found via grep across vault (many archived, ~30+ active need rewire).

---

## §1 Theme File Mapping (Section → File)

Section headers grepped from source (`^## §X` headers). Section assignments per dominant domain (cross-cutting refs noted):

### Theme: HANDOVER_AUTH_FLOW_2026-04-30_evening.md

Sections covering Auth Flow §36.80 BUG 2 + Phase 1 wiring + Phase 2 spec batches + Privacy/ToS:
- §56 Auth Flow §36.80 BUG 2 RESOLUTION SUB-DECISIONS (35 sub-decisions §56.1-§56.19)
- §57 Cumulative LOCKED Count Update post Auth Flow
- §58 Next Actions Priority Order post Auth Flow
- §59 DIFF_FLAGS Update post Auth Flow
- §60 Cross-refs Updates Required CC ingest
- §61 Verification Questions Topics
- §62 BATCH 1 Architecture & Process
- §63 BATCH 2 Onboarding & Conversion
- §64 BATCH 3 Auth Edge Cases & Privacy
- §66 BATCH 5 RPE/RIR UX + Beta Mechanics (auth-adjacent)
- §67 BATCH 6 Safety, Compliance & Distribution
- §68 CLOSURE BATCH UX Refinements

### Theme: HANDOVER_ENGINES_SPEC_2026-04-30_evening.md

Sections covering ADR 026 spec sessions + Engines #1-#8:
- §42 ADR 026 Spec Decisions 1-10 LOCKED
- §43 Next Actions Priority Order post 2026-05-04 evening
- §44 Status Cumulative Post 2026-05-04 evening
- §45 ADR 026 Spec Session COMPLETE (Q1-Q40 + 17 refinements + Engine #8)
- §46 Next Actions Priority Order post night
- §65 BATCH 4 Engine #8 Warm-up + Periodization Defaults
- §36.99 ADR 026 candidate (foundation)
- §36.100 7→8 Engines Prescriptive NEW Roadmap
- §36.105 Pivot "More Engine, Less LLM Runtime"

### Theme: HANDOVER_ONBOARDING_T0_2026-04-30_evening.md

Sections covering T0 Mechanics + Profile Typing + Demographic Prior:
- §36.101 5 Voices Cognitive Architecture CONFIRMED
- §36.102 Goal Lifecycle Change Reconfirmed First-Class
- (Plus T0 Mechanics 75 LOCKED V1 sections — currently dispersed în §36.x cluster, exact section #s grep needed)

### Theme: HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md

Sections covering D-cluster sub-decisions:
- §50 D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED (44 substantive net)
- §51 Cumulative LOCKED Count Update post 2026-05-05 morning
- §52 Next Actions Priority Order post morning
- §53 DIFF_FLAGS Update post morning
- §54 Cross-refs Updates Required
- §55 Verification Questions Topics
- §36.106 Decision Point D2 NEW OPENED FOR DISCUSSION
- §36.107 Decision Point D3 NEW OPENED FOR DISCUSSION

### Theme: HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md

Sections covering Vault Hygiene Sprint + §47 Alignment Rule + split protocols:
- §41 Vault Hygiene Sprint Faza 3 + Faza 4 COMPLETE
- §47 Alignment Questions Generation Rule LOCKED V1
- §48 DIFF_FLAGS Update post 2026-05-04 night
- §49 Verification Questions Topics

### Theme: HANDOVER_SCENARIOS_COVERAGE_2026-04-30_evening.md

Sections covering scenarios coverage PRE-BETA BLOCKER + testing strategy:
- §69 SCENARIOS DECISION COVERAGE PRE-BETA BLOCKER FLAG (NEW)
- §70 Cumulative LOCKED Count Update post Batch 1-6 + Closure
- §71 Next Actions Priority Order post Batch 1-6 + Closure
- §72 DIFF_FLAGS Update post Batch 1-6 + Closure
- §73 Cross-references Comprehensive

### Theme: HANDOVER_MISC_2026-04-30_evening.md

Residual sections:
- §36.103 Knowledge Layer Update Cadence LOCKED V1
- §36.104 Effort Estimate Roadmap (informational)
- §37 Status Cumulative V1 Update
- §38 Decision Points Status Update
- §39 Next Actions Priority Order
- §40 Verification Questions Generation Per HANDOVER_PROTOCOL Step 9
- (Plus all §1-§35 historical sections older context — likely majority residual)

---

## §2 Execution Checklist (PENDING dedicated chat)

### Pre-flight
- [x] Backup tag `pre-handover-split-2026-05-05-overnight` pushed 2026-05-05 overnight
- [ ] Open dedicated chat strategic CC autonomous mode `claude --dangerously-skip-permissions`
- [ ] Read full source `HANDOVER_GLOBAL_2026-04-30_evening.md` (~7673 LOC) to load all section content
- [ ] Verify all `## §X` section headers indexed (grep complete)

### Step 3 — Split execution (per theme file)
- [ ] Create 7 theme files cu provenance header preserving original date 2026-04-30 evening
- [ ] Per theme: append assigned sections verbatim cu original `## §X` headers preserved
- [ ] Validate per theme: source LOC ≈ sum split LOC (±10% header overhead acceptable)
- [ ] Cross-section ambiguous → assign primary cluster + cross-ref în secondary

### Step 4 — Master file becomes index
- [ ] Replace `HANDOVER_GLOBAL_2026-04-30_evening.md` content cu INDEX-ONLY file (theme links + section→file mapping table)
- [ ] Validate index references all theme files
- [ ] Preserve original timestamp metadata în index header

### Step 5 — Wikilinks rewire (~30+ active files)
- [ ] Run grep `HANDOVER_GLOBAL_2026-04-30_evening` --include="*.md" --exclude-dir=node_modules .`
- [ ] Per match: determine target section quoted → lookup section→file → rewrite wikilink
- [ ] Preserve display text after pipe (NU break human readable refs)
- [ ] Verify ~30+ active files updated (excluding archived)

### Step 6 — INDEX_MASTER navigation refresh
- [ ] Update SSOT activ section: replace single reference cu list of theme files
- [ ] Document split execution în Last updated header
- [ ] ADR cross-refs preserve

### Step 7 — DECISION_LOG entry
- [ ] APPEND 1 entry top descending cronologic "2026-05-05 overnight — HANDOVER_GLOBAL Thematic Split Execution (§62.2 LOCKED V1)"
- [ ] List 7 theme files created
- [ ] Master file content replaced cu INDEX
- [ ] Backup tag rollback safety
- [ ] Cross-refs

### Step 8 — DIFF_FLAGS update
- [ ] P1-FLAG-HANDOVER-SPLIT status flip 🟡 OPEN → 🟢 RESOLVED
- [ ] Update line + footer summary

### Verification
- [ ] Pre-commit hook PASS pre-final commit
- [ ] Post-commit verify: source LOC vs sum split LOC delta ±10%
- [ ] Wikilinks rewire count vs ~30+ active files expected

---

## §3 Risks Documented

1. **Atomic operation requirement:** 7-file split + ~30+ wikilinks rewire = single transaction or risk corruption mid-execution. Cannot reliably partition în multiple sessions without coordination.
2. **Cross-section ambiguity:** several sections fit 2+ themes (ex: §65 BATCH 4 Engine #8 Warm-up = Engines theme; §66 BATCH 5 RPE/RIR = Auth-adjacent given UX wording în auth flow but spans engines too). Decision: assign PRIMARY cluster, add cross-ref în SECONDARY in target theme file headers.
3. **Older sections §1-§35:** historical context likely truncated or already moved. Verify în execution prepass. Misc theme catches residual.
4. **Wikilinks form variability:** some refs use `[[HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]]`, others `[[HANDOVER_GLOBAL_2026-04-30_evening]]`, others `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (relative path). All forms must be detected + rewritten.
5. **Performance:** ~30+ active file edits + 7 file writes + 1 large file rewrite (master → index) is heavy git ops. Pre-commit hook full vitest run after each commit may slow execution; consider grouping commits.

---

## §4 Why Deferred (per master prompt §STEP 5 push-back productive)

Master prompt explicit allows partial status: *"If overnight time runs out mid-task: STOP at task boundary, write partial report cu Status=Partial + checkpoint state + recommended Daniel resumption. NU partial commits within a task (atomic per task — all or nothing per task scope)."*

This task = TRUE atomic per task scope. Partial split = data corruption risk on ~7673 LOC source + cross-vault references. Rather than risk integrity, plan delivered as actionable artefact for dedicated session execution.

**Execution session estimate:** ~2-3h CC autonomous în dedicated chat cu full context budget reserved (no task interleaving). Pre-Beta NU blocks (P1-FLAG-HANDOVER-SPLIT preserved 🟡 OPEN per existing DIFF_FLAGS).

---

## §5 Cross-refs

- VAULT_RULES.md §VAULT_HYGIENE_PASS STEP 13 (split threshold protocol)
- HANDOVER_GLOBAL_2026-04-30_evening.md §62.2 (thematic split strategy LOCKED V1)
- DIFF_FLAGS.md P1-FLAG-HANDOVER-SPLIT (status flag preserved)
- DECISION_LOG.md (entry to add post execution)
- 00-index/INDEX_MASTER.md (navigation refresh post execution)

---

🦫 **Plan ready 2026-05-05 overnight per CC TASK 5 batch overnight. Status=Partial per master prompt §STEP 5 push-back productive. Atomic execution deferred dedicated chat strategic NEW. Source HANDOVER_GLOBAL_2026-04-30_evening.md preserved untouched (zero data loss, zero corruption risk). Wikilinks across ~30+ active vault files preserved untouched.**
