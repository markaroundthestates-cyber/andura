# TASK 7 — VAULT_RULES §CC.9 NEW Mandatory File Updates Per Handover (amendment LOCK V1)

**Model:** 🔴 OPUS
**Order:** 7/8
**Dependencies:** Task 6 complete (RECENT_DECIDED_ARCHIVE pattern landed — §CC.9 codifies practice)
**Scope:** Codify §CC.9 NEW section în VAULT_RULES.md after §CC.8 + cross-ref amendments în §CC.5 + §HANDOVER_PROTOCOL STEP 16 + PROMPT_CC_HYGIENE.md §10 + DECISION_LOG entry.
**Estimate:** ~15-20 min CC
**Risk:** numbering convention drift dacă §CC.9 collides existing convention. Mitigation: pre-flight grep §CC.9 NU pre-exists.

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT
═══════════════════════════════════════════════════════════════════

```bash
# 1. Verify VAULT_RULES.md §CC.1-§CC.8 existing (audit Phase B+ table line 873)
grep -nE '^### §CC\.[0-9]' VAULT_RULES.md
# Expect lines: §CC.1 through §CC.8 (8 entries)

# 2. Verify §CC.9 NU pre-exists (anti-collision)
grep -nE '^### §CC\.9' VAULT_RULES.md && \
  { echo "FAIL: §CC.9 already exists — numbering collision"; exit 1; }
echo "✅ §CC.9 numbering slot available"

# 3. Locate §CC.8 Cross-refs end position (insertion point for §CC.9 after)
CC8_LINE=$(grep -nE '^### §CC\.8' VAULT_RULES.md | head -1 | cut -d: -f1)
# Find next ## OR ### section after §CC.8 (or EOF)
INSERT_LINE=$(awk -v start="$CC8_LINE" 'NR>start && /^(##|---)/' VAULT_RULES.md | head -1)
echo "§CC.8 starts line $CC8_LINE | §CC.9 insertion point determined"

# 4. Verify §HANDOVER_PROTOCOL STEP 16 amendment section exists (cross-ref target)
grep -n '§HANDOVER_PROTOCOL STEP 16' VAULT_RULES.md | head -3

# 5. Verify PROMPT_CC_HYGIENE.md §10 exists (cross-ref target)
grep -n '^## 10\.\|^## §10' PROMPT_CC_HYGIENE.md | head -3
```

═══════════════════════════════════════════════════════════════════
                  EXECUTION (4 file updates)
═══════════════════════════════════════════════════════════════════

## Update 1 — VAULT_RULES.md §CC.9 NEW append (after §CC.8)

Use Edit tool to append AFTER §CC.8 final paragraph (before next ## section delimiter):

```markdown

### §CC.9 Mandatory File Updates Per Handover (LOCKED V1 2026-05-07)

**Authority:** Run 2 Vault Cleanup Task 7 — codify post-handover required file updates anti-recurrence missed updates discovered audit-vault-2026-05-07.md (CURRENT_STATE §ACTIVE_REFS stale post-Capacity-A + INDEX_MASTER stats drift "92 vs 93 actual" + missed §POINTERS sync).

**Scope:** Applies BOTH §CC.5 fast handover AND §HANDOVER_PROTOCOL deep ingest. Mandatory checklist post-merge SSOT.

**Mandatory updates (5 steps — ALL required, NU partial):**

1. **CURRENT_STATE.md** §JUST_DECIDED top entry append + §NOW move-then-replace (precedent → §RECENT) — existing §CC.5/§CC.6 mecanic.

2. **DECISION_LOG.md** entry append top descending cronologic — existing §CC.5/§HANDOVER_PROTOCOL §10.4.

3. **INDEX_MASTER.md** stats line refresh — NEW §CC.9.3:
   - Active vault files count actual (`find . -name "*.md" -not -path "*/_archive/*"` mecanic recount)
   - ADR breakdown (numbered count + named count + total)
   - NAVIGARE table cross-refs sync if files archived/created/renamed în handover scope

4. **CURRENT_STATE §ACTIVE_REFS / §ACTIVE_ADRS / §ACTIVE_FLAGS** sync — NEW §CC.9.4:
   - REMOVE references la archived files (post-archive merge)
   - ADD references la new SSOT files (post-create merge)
   - REDIRECT references la deprecated sections → canonical SSOT pointers

5. **Pre-flight grep wikilinks orphane** mandatory before commit — existing §CC.5 reinforced §CC.9.5:
   ```bash
   grep -rEn '\[\[<archived_file_basename_pattern>' \
     --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules \
     --exclude-dir=.git . | wc -l
   # Expect: 0 (all REDIRECT applied pre-archive)
   ```

**Failure mode:** any of 5 steps incomplete = handover INCOMPLETE. Next chat startup §CC.2 layered read va detecta drift via §CC.7 Layer 3 timestamp consistency check sau via stale references hit. Re-merge required.

**Goal §CC.9:** next chat startup §CC.2 layered read = TOT accurate; vault navigation fără garbage; PK indexing clarity preserved (NU contaminate top SSOT cu stale refs).

**Cross-refs:**
- §CC.5 Fast Handover Workflow (steps 1-2 mandatory minimum, §CC.9 extends adding 3-5)
- §HANDOVER_PROTOCOL STEP 16 Amendment (CURRENT_STATE update post-ingest, AMENDMENT below adds §CC.9 reference)
- `PROMPT_CC_HYGIENE.md` §10 Fast Handover Workflow (operational steps cross-ref §CC.9)

**Anti-recurrence rationale:** audit-vault-2026-05-07.md identified Drift 2 — INDEX_MASTER stats line 6 "92 fișiere active" stale vs actual 93 (off-by-one drift mecanic, undetected pre-audit). §CC.9 codifies stat refresh mandatory step pentru no-future-drift. Plus Drift 1 cumulative LOCKED count + Drift 3 stale chat-N references — toate prevenite via §CC.9 enforcement.
```

## Update 2 — VAULT_RULES.md §HANDOVER_PROTOCOL STEP 16 amendment cross-ref §CC.9

Locate STEP 16 amendment section (audit Phase B+ §CC.X cross-refs). Append paragraph at end:

```markdown

**§CC.9 Cross-ref (LOCKED V1 2026-05-07 Run 2 Task 7):** STEP 16 ingest action items extended per §CC.9 Mandatory File Updates Per Handover (5 steps total: CURRENT_STATE + DECISION_LOG + INDEX_MASTER stats + ACTIVE_REFS sync + Pre-flight grep). All 5 mandatory NU partial.
```

## Update 3 — VAULT_RULES.md §CC.5 cross-ref §CC.9

Locate §CC.5 (Fast Handover Workflow). Append paragraph at end of §CC.5 section:

```markdown

**§CC.9 extension (LOCKED V1 2026-05-07 Run 2 Task 7):** Fast handover workflow §CC.5 minimum steps 1-2 (CURRENT_STATE + DECISION_LOG). §CC.9 Mandatory File Updates Per Handover extends pentru full vault hygiene completeness — see §CC.9 below for 5-step mandatory checklist. Daniel's command "Update CURRENT_STATE per inbox handover" implicitly invokes §CC.9 (NU optional).
```

## Update 4 — PROMPT_CC_HYGIENE.md §10 cross-ref §CC.9

Locate §10 Fast Handover Workflow. Append paragraph at end:

```markdown

### §10.9 Mandatory File Updates Per Handover (cross-ref VAULT_RULES §CC.9 LOCKED V1 2026-05-07)

Steps §10.3-§10.7 above cover CURRENT_STATE + DECISION_LOG + archive + commit/push. **NEW per §CC.9 amendment:**

3. (existing) Update CURRENT_STATE.md §JUST_DECIDED + §NOW move-then-replace
4. (existing) Update DECISION_LOG.md entry append top
5. **NEW §10.9.1** — Update INDEX_MASTER.md stats line (active vault count + ADR breakdown) + NAVIGARE per-row sync if files archived/created
6. **NEW §10.9.2** — Sync CURRENT_STATE §ACTIVE_REFS / §ACTIVE_ADRS / §ACTIVE_FLAGS (REMOVE archived + ADD new SSOT + REDIRECT canonical)
7. **NEW §10.9.3** — Pre-flight grep wikilinks orphane mandatory before commit (per §CC.9.5)

**Failure mode:** §10.9.1-§10.9.3 incomplete = handover INCOMPLETE per §CC.9. Re-merge mandatory.

Cross-ref: VAULT_RULES.md §CC.9 (canonical authority).
```

## Update 5 — DECISION_LOG.md entry append top descending cronologic

```markdown
## 2026-05-07 — VAULT_RULES §CC.9 amendment LOCK V1 Mandatory File Updates Per Handover (vault meta-tooling)

**Status:** Vault meta-tooling decision (NU product/architecture). Cumulative LOCKED V1 ~659 PRESERVED unchanged.

**Authority:** Run 2 Vault Cleanup Task 7 (audit-vault-2026-05-07.md) — codify anti-recurrence missed file updates discovered audit (Drift 1+2+3 INDEX_MASTER stats stale + cumulative count drift + chat-N references stale).

**Decision:** §CC.9 NEW section în VAULT_RULES.md (additive numbering after §CC.8, NU sub-section §CC.5.X).

**Rationale numbering convention §CC.9 vs §CC.5.X (Bugatti decision Q1 2026-05-07 chat-NEW4):**
- §CC.9 = standalone authoritative section applying BOTH §CC.5 fast + §HANDOVER_PROTOCOL deep
- §CC.5.X sub-section ar implica "fast handover only" semantic incorrect
- Additive convention §CC.1→§CC.9 zero risk altering existing references (precedent ADR §9.1→§9.8 additive)

**5 mandatory steps codified §CC.9:**
1. CURRENT_STATE update (existing §CC.5/§CC.6)
2. DECISION_LOG entry (existing §10.4)
3. INDEX_MASTER stats refresh (NEW §CC.9.3)
4. CURRENT_STATE §ACTIVE_REFS sync (NEW §CC.9.4)
5. Pre-flight grep wikilinks orphane (existing §CC.5 reinforced §CC.9.5)

**Files modified atomic single batch:**
- UPDATED: VAULT_RULES.md (§CC.9 NEW after §CC.8 + §CC.5 cross-ref + §HANDOVER_PROTOCOL STEP 16 amendment cross-ref)
- UPDATED: PROMPT_CC_HYGIENE.md (§10.9 NEW Mandatory File Updates Per Handover cross-ref)
- UPDATED: 03-decisions/DECISION_LOG.md (this entry)

**Backup tag:** `pre-vault-cleanup-batch-2026-05-07-<HHMM>` (Run 2 master backup, rollback safety).

**Cross-refs:** [[../VAULT_RULES]] §CC.9 + §CC.5 + §HANDOVER_PROTOCOL STEP 16 amendment | [[../PROMPT_CC_HYGIENE]] §10.9 | audit-vault-2026-05-07.md (1454 LOC singular self-sufficient) Drift 1+2+3 + Phase D Batch 6.

**Note explicit:** §CC.9 = vault meta-tooling. NU contabilizat în cumulative LOCKED count product/architecture (separate concern — meta-tooling decisions live aici în DECISION_LOG dar NU inflate domain decision count care tracking-uiește product scope).
```

═══════════════════════════════════════════════════════════════════
                  VERIFY POST
═══════════════════════════════════════════════════════════════════

```bash
# 1. VAULT_RULES §CC.9 present + content schema
grep -n '^### §CC\.9' VAULT_RULES.md | head -1
grep -A 3 '^### §CC\.9' VAULT_RULES.md | head -5
# Expect: section header + Authority + Scope paragraph

# 2. §CC.9 contains 5 mandatory steps enumerate
grep -c '^[0-9]\. \*\*' VAULT_RULES.md  # rough count, manually verify section internal
sed -n '/^### §CC\.9/,/^---/p' VAULT_RULES.md | grep -E '^[1-5]\. \*\*' | wc -l
# Expect: 5

# 3. §CC.5 + §HANDOVER_PROTOCOL STEP 16 cross-ref §CC.9
grep -A 2 '^### §CC\.5' VAULT_RULES.md | grep -q '§CC\.9' || \
  echo "WARN: §CC.5 cross-ref §CC.9 missing"
grep -A 2 '§HANDOVER_PROTOCOL STEP 16' VAULT_RULES.md | grep -q '§CC\.9' || \
  echo "WARN: STEP 16 cross-ref §CC.9 missing"

# 4. PROMPT_CC_HYGIENE.md §10.9 present
grep -n '^### §10\.9\|^## 10\.9' PROMPT_CC_HYGIENE.md | head -1

# 5. DECISION_LOG.md entry top descending
head -20 03-decisions/DECISION_LOG.md | grep -q '2026-05-07.*§CC\.9 amendment' || \
  { echo "FAIL: DECISION_LOG entry missing"; exit 1; }
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add VAULT_RULES.md PROMPT_CC_HYGIENE.md 03-decisions/DECISION_LOG.md
git commit -m "feat(vault-meta): VAULT_RULES §CC.9 amendment LOCK V1 Mandatory File Updates Per Handover (Task 7)

§CC.9 NEW section codifies 5 mandatory file updates per handover (anti-recurrence missed updates discovered audit-vault-2026-05-07.md):

1. CURRENT_STATE update (existing §CC.5/§CC.6)
2. DECISION_LOG entry (existing §10.4)
3. INDEX_MASTER stats refresh (NEW §CC.9.3)
4. CURRENT_STATE §ACTIVE_REFS sync (NEW §CC.9.4)
5. Pre-flight grep wikilinks orphane (existing §CC.5 reinforced §CC.9.5)

Files modified atomic batch:
- VAULT_RULES.md §CC.9 NEW after §CC.8 + §CC.5 + §HANDOVER_PROTOCOL STEP 16 cross-refs
- PROMPT_CC_HYGIENE.md §10.9 NEW cross-ref
- DECISION_LOG.md entry top

Numbering convention rationale (Bugatti decision Q1 chat-NEW4):
- §CC.9 standalone applies BOTH §CC.5 fast + §HANDOVER_PROTOCOL deep
- §CC.5.X sub-section ar implica fast-handover-only semantic incorrect
- Additive convention zero risk altering existing references

Cumulative LOCKED V1 ~659 PRESERVED unchanged (vault meta-tooling NU product/architecture additive).

Cross-refs: audit-vault-2026-05-07.md Drift 1+2+3 + Phase D Batch 6 + Run 2 Task 7."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK
═══════════════════════════════════════════════════════════════════

```bash
git reset --hard HEAD^
echo "Task 7 reverted — §CC.9 amendment rolled back"
```
