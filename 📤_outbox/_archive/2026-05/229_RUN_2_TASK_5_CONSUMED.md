# TASK 5 — INDEX_MASTER + CURRENT_STATE + DIFF_FLAGS refresh post-cleanup

**Model:** 🔴 OPUS
**Order:** 5/8
**Dependencies:** Tasks 1+3 complete (4 NEW split files exist + 3 archived; counts depend pe ambele)
**Scope:** Refresh stats line + ADR breakdown + VAULT CLEANUP HISTORY entry + CURRENT_STATE §ACTIVE_REFS + DIFF_FLAGS Capacity A LANDED entry + §JUST_DECIDED top entry NEW.
**Estimate:** ~15-20 min CC
**Risk:** stat drift introduced re-fix later. Mitigation: count actual files post-cleanup, NU presupun.

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT (count actual files post-cleanup)
═══════════════════════════════════════════════════════════════════

```bash
# 1. Count active vault files actual (NU audit baseline 93 — recalculate post-Tasks 1+3)
ACTIVE_COUNT=$(find . -name "*.md" -type f \
  -not -path "*/_archive/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  | wc -l)
echo "Active vault files post-cleanup: $ACTIVE_COUNT"

# Expected calculation:
#   Pre-cleanup (audit): 93 active
#   +4 from Task 1 split (PRE_LAUNCH + INVESTITII + 033-MMI + KNOWLEDGE_LAYER)
#   -3 from Task 3 archive (SPLIT_PLAN + VAULT_HYGIENE + MISC)
#   = 94 expected
# If diverges ±1 → INFO log; ±3+ → ESCALATE

# 2. Count ADR-uri actual
NUMBERED_ADR=$(ls 03-decisions/[0-9][0-9][0-9]-*.md 2>/dev/null | wc -l)
NAMED_ADR=$(ls 03-decisions/ADR_*.md 2>/dev/null | wc -l)
echo "Numbered ADRs (001-XXX): $NUMBERED_ADR"
echo "Named ADRs (ADR_*): $NAMED_ADR"
# Expected: 33 numbered (001-033 post Task 1 ADR 033 NEW) + 9 named (audit Phase B+ Group 03-decisions)

# 3. Capture archive NN sequence used Task 3 (for VAULT CLEANUP HISTORY entry)
# These were saved în /tmp/run-2-progress.log (per master orchestrator step)
# OR re-derive: ls latest 3 archives by ctime
ls -t 📤_outbox/_archive/2026-05/*DEPRECATED.md | head -3 > /tmp/task5-recent-archives.txt
echo "Recent 3 archives:"
cat /tmp/task5-recent-archives.txt
```

═══════════════════════════════════════════════════════════════════
                  EXECUTION (3 file refresh sequential)
═══════════════════════════════════════════════════════════════════

## Update 1 — `00-index/INDEX_MASTER.md`

### Stats line refresh (line 6 audit Phase B+)

Use Edit tool (str_replace) cu pattern:

**Original:**
```
92 fișiere active vault... 42 ADR-uri active total — 33 numbered 001-032 + 9 named ADR_*
```

**Replace cu (use $ACTIVE_COUNT + $NUMBERED_ADR + $NAMED_ADR actual):**
```
$ACTIVE_COUNT fișiere active vault... $((NUMBERED_ADR + NAMED_ADR)) ADR-uri active total — $NUMBERED_ADR numbered 001-0$(printf "%02d" $((NUMBERED_ADR))) + $NAMED_ADR named ADR_*
```

NOTE: Audit identified off-by-one drift "33 numbered 001-032" actual e 32 numerical files. Post-Task 1 ADR 033 NEW → 33 numbered correct now.

### NAVIGARE per-row review (REDIRECT entries la archived → canonical)

```bash
# Identify rows referencing archived files
grep -n '\[\[HANDOVER_GLOBAL_2026-04-30_evening\]\]' 00-index/INDEX_MASTER.md | head -20
grep -n '§3\|§26\|§29\|§29\.7\|§31\|§32\|§36\.50\|§36\.103' 00-index/INDEX_MASTER.md | head -20

# Per row referencing archived §X-section: REDIRECT cu canonical SSOT pointer
# Common patterns:
# - "Pricing locked... §36.50" → "Pricing locked... [[PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02"
# - "Knowledge layer cadence... §36.103" → "[[KNOWLEDGE_LAYER_CADENCE_V1]]"
# - "Vault Hygiene Sprint... §41" → "[[VAULT_RULES]] §VAULT_HYGIENE_PASS"
# - "ADR 026 candidate... §36.99" → "[[026-offline-coaching-decision-tree-exhaustive]] §9.X"
# - "8 templates V1... §26" → "[[ONBOARDING_SSOT_V1]] §1 + [[024-goal-driven-program-templates]]"

# Apply Edit tool per match — verbatim REDIRECT
```

### VAULT CLEANUP HISTORY entry NEW append (post existing 2026-05-04 entries)

Append section în `## VAULT CLEANUP HISTORY`:

```markdown
### 2026-05-07 (Run 2 Vault Cleanup — Capacity A LANDED + sub-section split)

**Scope:** Run 2 multi-task batch ~120-180 min CC autonomous (8 tasks sequential fail-stop).

**Capacity A archive (Task 3):**
- 📤_outbox/_archive/2026-05/<NN1>_HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05_DEPRECATED.md (171 LOC, 0 inbound, plan executed)
- 📤_outbox/_archive/2026-05/<NN2>_HANDOVER_VAULT_HYGIENE_2026-04-30_evening_CAPACITY_A_DEPRECATED.md (127 LOC, content covered VAULT_RULES §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9)
- 📤_outbox/_archive/2026-05/<NN3>_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md (5716 LOC, content covered ADR 026 §9.X canonical post-pipeline)

**Pre-archive sub-section split preservation (Task 1 — 4 unique active value sections):**
- 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md (from §29.7)
- 01-vision/INVESTITII_PRIVATE.md (from §31)
- 03-decisions/033-muscle-memory-index.md (from §32, ADR 033 STUB SPEC PLACEHOLDER)
- 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md (from §36.103)

**Pre-archive REDIRECT (Task 2):** 12 inbound wikilinks redirected → canonical SSOT targets (VAULT_RULES + ADR 026 §9.X + PRODUCT_STRATEGY §AMENDMENT 2026-05-02 + ONBOARDING_SSOT_V1 + ADR 022/024 + 4 NEW split files Task 1).

**Canonical REDIRECT spans (Task 4):** Span 1 Pricing → PRODUCT_STRATEGY §AMENDMENT 2026-05-02 canonical (MOAT_STRATEGY line 113 + INDEX_MASTER NAVIGARE entry redirected). Spans 5+6+8 verified canonical (no edit needed).

**Stats refresh:** $ACTIVE_COUNT fișiere active vault (was 93 pre-cleanup) | $NUMBERED_ADR numbered ADRs (was 32, +1 NEW ADR 033 from §32 split) | $NAMED_ADR named ADRs (unchanged) | total $((NUMBERED_ADR + NAMED_ADR)) ADRs.

**§CC.5.X amendment LOCK V1 (Task 7):** VAULT_RULES §CC.9 NEW + §HANDOVER_PROTOCOL STEP 16 amendment cross-ref + PROMPT_CC_HYGIENE.md §10 cross-ref. Mandatory file updates per handover (5 steps): CURRENT_STATE + DECISION_LOG + INDEX_MASTER stats + CURRENT_STATE §ACTIVE_REFS sync + Pre-flight grep wikilinks orphane.

**§JUST_DECIDED periodic compaction (Task 6):** entries pre-2026-04-30 moved → NEW `06-sessions-log/RECENT_DECIDED_ARCHIVE.md` append-only. CURRENT_STATE §JUST_DECIDED truncated last 7 days.

**Backup tag:** `pre-vault-cleanup-batch-2026-05-07-<HHMM>` (rollback safety).

**Tests baseline:** 2648 PASS / 0 FAIL preserved (doc-only operations ZERO src changes).

**Cumulative LOCKED V1 ~659 PRESERVED unchanged** (vault hygiene meta-tooling NU product/architecture additive).
```

## Update 2 — `00-index/CURRENT_STATE.md`

### §ACTIVE_REFS update (REMOVE archived + ADD NEW split files)

```bash
# Locate §ACTIVE_REFS section (line ~1737-1752 per audit, may shift post-cleanup)
grep -n '^## ACTIVE_REFS\|^## ACTIVE REFS' 00-index/CURRENT_STATE.md
```

REMOVE:
- `[[HANDOVER_VAULT_HYGIENE_2026-04-30_evening]]` references (any §)
- `[[HANDOVER_MISC_2026-04-30_evening]]` references (any §)

ADD pointers la new split files + canonical SSOT post-archive:
- `[[PRE_LAUNCH_CHECKLIST_V1]]` (operational checklist canonical pre-Beta)
- `[[KNOWLEDGE_LAYER_CADENCE_V1]]` (active rule canonical)
- `[[033-muscle-memory-index]]` (STUB SPEC PLACEHOLDER post-Beta v1.5 candidate)
- `[[VAULT_RULES]] §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9 amendment + §CC.9` (NEW Task 7) — canonical vault hygiene rules
- `[[026-offline-coaching-decision-tree-exhaustive]] §9.X canonical` (post-pipeline §42.10 V1 closure aggregate)

### §JUST_DECIDED top entry NEW append (Capacity A LANDED)

Append top cu chronologic descending:

```markdown
**2026-05-07 — Run 2 Vault Cleanup LANDED (Capacity A + sub-section split + §CC.9 amendment):**

*Run 2 multi-task batch CC autonomous ~120-180 min: Task 1 split 4 sub-sections + Task 2 REDIRECT 12 inbound + Task 3 archive 3 files + Task 4 canonical spans + Task 5 INDEX/CURRENT_STATE/DIFF_FLAGS refresh + Task 6 §JUST_DECIDED compaction → RECENT_DECIDED_ARCHIVE NEW + Task 7 VAULT_RULES §CC.9 amendment LOCK V1 + Task 8 verify push.*

**Files split (Task 1):** 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md + 01-vision/INVESTITII_PRIVATE.md + 03-decisions/033-muscle-memory-index.md + 08-workflows/KNOWLEDGE_LAYER_CADENCE_V1.md.

**Files archived (Task 3):** HANDOVER_GLOBAL_SPLIT_PLAN + HANDOVER_VAULT_HYGIENE + HANDOVER_MISC → 📤_outbox/_archive/2026-05/<NN>_*_DEPRECATED.md.

**§CC.9 amendment NEW (Task 7):** Mandatory File Updates Per Handover — 5 steps codified (CURRENT_STATE + DECISION_LOG + INDEX_MASTER stats + ACTIVE_REFS sync + Pre-flight grep wikilinks orphane). Cross-ref §CC.5 fast handover + §HANDOVER_PROTOCOL STEP 16 amendment + PROMPT_CC_HYGIENE.md §10.

**§JUST_DECIDED compaction NEW (Task 6):** entries pre-2026-04-30 (>7 days from chat-NEW4) moved la new file `06-sessions-log/RECENT_DECIDED_ARCHIVE.md` (single-purpose rolling archive, NU contaminat HANDOVER_GLOBAL INDEX integrity).

**Cumulative LOCKED V1 ~659 PRESERVED unchanged** (vault hygiene meta-tooling NU product/architecture additive).

**Tests baseline 2648 PASS preserved.** Backup tag `pre-vault-cleanup-batch-2026-05-07-<HHMM>` rollback safety.

**Cross-refs:** audit-vault-2026-05-07.md (1454 LOC singular self-sufficient) Phase D Batch 1+2+3+4+5+6 + Phase B+ §HANDOVER_MISC table (line ranges verbatim §29.7+§31+§32+§36.103) + Phase C.1 Spans 1+5+6+8.
```

## Update 3 — `DIFF_FLAGS.md`

Append entry NEW post existing P1 entries:

```markdown
## P1-FLAG-CAPACITY-A-LANDED — Run 2 Vault Cleanup ✅ LANDED 2026-05-07

**Status:** ✅ LANDED 2026-05-07 (vault hygiene meta-tooling)

**Scope:** Capacity A LOCKED archive + sub-section split + REDIRECT + canonical spans + INDEX/CURRENT_STATE/DIFF_FLAGS refresh + §CC.9 amendment + §JUST_DECIDED compaction.

**Evidence:**
- Tasks 1-8 complete sequential fail-stop (CC autonomous Run 2)
- 3 files archived: HANDOVER_GLOBAL_SPLIT_PLAN + HANDOVER_VAULT_HYGIENE + HANDOVER_MISC
- 4 new split files created standalone canonical (Task 1)
- 12 inbound REDIRECT verified 0 residual matches active vault
- Tests baseline 2648 PASS preserved (doc-only ZERO src)
- Backup tag `pre-vault-cleanup-batch-2026-05-07-<HHMM>`

**Cross-refs:** audit-vault-2026-05-07.md + CURRENT_STATE §JUST_DECIDED 2026-05-07 entry + INDEX_MASTER VAULT CLEANUP HISTORY 2026-05-07 entry.
```

═══════════════════════════════════════════════════════════════════
                  VERIFY POST
═══════════════════════════════════════════════════════════════════

```bash
# 1. INDEX_MASTER stats actualizate
grep -E 'fișiere active|ADR-uri active' 00-index/INDEX_MASTER.md | head -3
# Expect: $ACTIVE_COUNT + correct ADR breakdown

# 2. CURRENT_STATE §ACTIVE_REFS NU mai conține archived refs
grep -A 30 '## ACTIVE_REFS' 00-index/CURRENT_STATE.md | grep -E 'HANDOVER_(MISC|VAULT_HYGIENE)' && \
  { echo "FAIL: residual archived refs în §ACTIVE_REFS"; exit 1; }
echo "✅ §ACTIVE_REFS clean"

# 3. CURRENT_STATE §JUST_DECIDED top entry NEW Capacity A LANDED
head -50 00-index/CURRENT_STATE.md | grep -q '2026-05-07.*Run 2 Vault Cleanup LANDED' || \
  { echo "FAIL: §JUST_DECIDED missing Capacity A entry"; exit 1; }

# 4. DIFF_FLAGS contains P1-FLAG-CAPACITY-A-LANDED
grep -q 'P1-FLAG-CAPACITY-A-LANDED' DIFF_FLAGS.md || \
  { echo "FAIL: DIFF_FLAGS missing Capacity A entry"; exit 1; }

# 5. Header timestamp refresh CURRENT_STATE
grep -E '^Updated:' 00-index/CURRENT_STATE.md | head -1
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add 00-index/INDEX_MASTER.md 00-index/CURRENT_STATE.md DIFF_FLAGS.md
git commit -m "feat(vault-cleanup): refresh INDEX_MASTER + CURRENT_STATE + DIFF_FLAGS post Capacity A (Task 5)

INDEX_MASTER:
- Stats refresh: 92 → $ACTIVE_COUNT fișiere active vault | 33 numbered (post ADR 033 NEW) + $NAMED_ADR named ADRs
- VAULT CLEANUP HISTORY 2026-05-07 entry detailed (Run 2 scope full)
- NAVIGARE per-row REDIRECT archived refs → canonical SSOTs

CURRENT_STATE:
- §ACTIVE_REFS REMOVE archived + ADD 4 new split files + canonical SSOT pointers (VAULT_RULES + ADR 026 §9.X)
- §JUST_DECIDED top entry NEW: Run 2 Vault Cleanup LANDED 2026-05-07 narrative
- Header Updated timestamp refresh

DIFF_FLAGS:
- P1-FLAG-CAPACITY-A-LANDED entry NEW (status ✅ LANDED + evidence)

Cumulative LOCKED V1 ~659 PRESERVED unchanged."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK
═══════════════════════════════════════════════════════════════════

```bash
git reset --hard HEAD^
echo "Task 5 reverted — INDEX/CURRENT_STATE/DIFF_FLAGS rolled back"
```
