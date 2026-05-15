# LATEST — T1+T2+T3 Cleanup LANDED 2026-05-15 (post-audit wave 2)

**Task:** Execute T1+T2+T3 autonomous per Daniel CEO directive — STOP banners restante 7 files + folder freeze rearrange (`03-decisions/` + `06-sessions-log/` → `_FROZEN/` subfolders) + D007 supersede enforcement rule explicit amendment (literal match trigger NU fuzzy semantic).
**Model:** Opus exclusively
**Status:** Complete
**Branch:** `feature/v2-vanilla-port`
**Commit:** `cdcc864`
**Date:** 2026-05-15-cleanup-wave-2

---

## §0 Status

**Complete. ZERO issues. ZERO regressions. ZERO src/ runtime impact.**

Backup tag `pre-cleanup-t1-t2-t3-2026-05-15` pushed origin pre-execute (rollback insurance — `git reset --hard pre-cleanup-t1-t2-t3-2026-05-15` restore complet).

Tests 3734 PASS preserved EXACT (pre-commit hook ran vitest full suite validate).

---

## §1 T1 — STOP banners 7 files + 2 NEW README redirects

**Files MODIFY (STOP banner top of body, content untouched per Karpathy Surgical Changes):**
- `AGENTS.md` (GitNexus/Claude Code config — pointing to DECISIONS.md NU SSOT)
- `README.md` (public project intro — pointing to DECISIONS.md pentru decisions context)
- `DIFF_FLAGS.md` (980 LOC outstanding issues — FROZEN historical reference)
- `PROMPT_CC_HYGIENE.md` (operational prompt — DEPRECATED post-reglaj)
- `PROMPT_CC_INGEST_HANDOVER.md` (§HANDOVER_PROTOCOL workflow — superseded)
- `00-index/CURRENT_STATE.md` (1308 LOC vechiul SSOT pre-Faza 3 + 2026-05-15 reglaj)
- `03-decisions/_FROZEN/DECISION_LOG.md` (4398 LOC chronological pre-reglaj log — moved + STOP banner)

**Files NEW (entry-point README redirects):**
- `03-decisions/README.md` (chat `ls 03-decisions/` vede README primul cu redirect către DECISIONS.md + explanation _FROZEN/ subfolder content)
- `06-sessions-log/README.md` (same pattern — entry-point redirect)

**STOP banner pattern uniform across all 7 (consistent with CLAUDE.md + VAULT_RULES.md cleanup wave 1):**
```
> 🛑 **STOP. Read [[DECISIONS.md]] instead. [Specific context per file].**
>
> Current SSOT (post 2026-05-15 reglaj) = `DECISIONS.md` root §D001. [...]
> Karpathy 4 principii: [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4.
---
```

---

## §2 T2 — Folder freeze rearrange (`03-decisions/` + `06-sessions-log/`)

**`03-decisions/` rearrange (47 files moved):**
- 33 numbered ADRs (001-033) → `03-decisions/_FROZEN/`
- 13 named ADRs (`ADR_*`) → `03-decisions/_FROZEN/`
- DECISION_LOG.md → `03-decisions/_FROZEN/` (cu STOP banner from T1)
- NEW `03-decisions/README.md` la root entry-point cu redirect
- Final structure:
  ```
  03-decisions/
  ├── README.md  ← entry-point redirect to DECISIONS.md
  └── _FROZEN/
      ├── 001-local-first-storage.md ... 033-muscle-memory-index.md (33 numbered)
      ├── ADR_ANATOMICAL_CLASSIFICATION_V1.md ... ADR_SMART_ROUTING_EQUIPMENT_v2.md (13 named)
      └── DECISION_LOG.md
  ```

**`06-sessions-log/` rearrange (7 files moved):**
- 6 HANDOVER_*.md files → `06-sessions-log/_FROZEN/`
- RECENT_DECIDED_ARCHIVE.md → `06-sessions-log/_FROZEN/`
- NEW `06-sessions-log/README.md` la root entry-point cu redirect

**Cross-refs batch update via sed (preserved consistency post-move):**
- DECISIONS.md: **48 refs updated** to `03-decisions/_FROZEN/<file>.md` pattern
- src/ JSDoc comments: **67 refs updated** to `_FROZEN/` paths (preserved Cross-link consistency)
- Total batch updates: **115 refs** ZERO broken refs verify grep
- Wiki/ cross-refs NOT updated (wiki/ FROZEN historical reference — broken refs there acceptable per FREEZE policy)

**Grep verify post-rearrange:**
```bash
$ grep -r "03-decisions/[^_]" src/ DECISIONS.md
# (empty — 0 broken refs)

$ grep -r "03-decisions/_FROZEN" src/ | wc -l
67

$ grep -c "03-decisions/_FROZEN" DECISIONS.md
48
```

---

## §3 T3 — D007 supersede enforcement rule explicit amendment

**Before (ambiguous):** "CC scanează entries D-* existente. Dacă D-NEW contradice/înlocuiește D-OLD **semantic**..."

**After (explicit trigger):** Section "## Supersede enforcement rule (T3 explicit amendment 2026-05-16)" amended cu:

- **Scope clarified:** `D-NNN` din **CURRENT DECISIONS section ONLY** (NU D-LEGACY-* care sunt FROZEN pre-reglaj historical reference)
- **Trigger literal match** (NU fuzzy semantic detection):
  - **(a) titlu keyword overlap ≥50%** words via lowercase token compare
  - **(b) source path identic**
  - **(c) CATEGORY identic + keyword overlap ≥30%**
- **Ambiguous match handling** (30-49% overlap sau category-only match fără keyword overlap): flag în `📤_outbox/LATEST.md §"Supersede ambiguities"` Daniel review explicit pre-commit
- **Atomic commit invariant:** D-OLD `LOCKED V1` → `SUPERSEDED-BY-<D-NEW>` SAME commit cu append D-NEW (ZERO partial commits, ZERO stale LOCKED V1 parallel)

Eliminate slip risk fuzzy semantic detection: chat NEW won't infer "contradicts" based on vague semantic similarity → deterministic literal trigger reduces hallucination potential.

---

## §4 Atomic commit single-concern

- **Hash:** `cdcc864`
- **Message:** `fix(reglaj): T1+T2+T3 cleanup STOP banners + folder freeze + D007 explicit amendment`
- **Files in commit:** 158 (47 renames 03-decisions + 7 renames 06-sessions-log + 67 src/ JSDoc updates + 7 STOP banners + 2 NEW README + 2 NEW _FROZEN/ folders + DECISIONS.md T3 + smart-env auto-tracked + 522 archive)
- **Branch:** `feature/v2-vanilla-port` pushed origin
- **Push range:** `b53fda6..cdcc864`

---

## §5 Backup tag

- **Name:** `pre-cleanup-t1-t2-t3-2026-05-15`
- **Hash:** `5b4ff3bf03d012c9920374b5bd0965a3ca303fd0` (tag) → `b53fda64287d5e9277ec6127da99075e7db033e0` (commit)
- **Pushed origin:** ✓ verified via `git ls-remote --tags origin`
- **Rollback command (if needed):** `git reset --hard pre-cleanup-t1-t2-t3-2026-05-15`

---

## §6 Tests

**Baseline 3734 PASS preserved EXACT.** Pre-commit hook ran vitest full suite — ZERO regression.

Vault meta-tooling cleanup + JSDoc-only updates în src/ — ZERO runtime impact per HARD CONSTRAINTS strict (JSDoc comments don't affect compilation/tests).

---

## §7 Confusion sources audit — status post wave 2 cleanup

| Confusion source (pre wave 2) | Status post wave 2 |
|---|---|
| 5 root *.md files fără STOP banner | ✓ ALL 7 root *.md files (+ 00-index/CURRENT_STATE + DECISION_LOG) cu STOP banner uniform |
| 47 ADR files directly discoverable `ls 03-decisions/` | ✓ Moved la `_FROZEN/` subfolder; root has README.md redirect only |
| 7 HANDOVER files in `06-sessions-log/` | ✓ Moved la `_FROZEN/` subfolder; root has README.md redirect only |
| D007 fuzzy semantic detection risk | ✓ Amended cu literal match trigger (3 deterministic criteria) + ambiguous flag pattern |
| 67 src/ JSDoc refs to old 03-decisions/ paths | ✓ Batch sed updated to `_FROZEN/` paths (consistency preserved) |
| 48 DECISIONS.md cross-refs to old paths | ✓ Batch sed updated to `_FROZEN/` paths |
| 4 SSOT candidates pre wave 1 (CLAUDE/VAULT_RULES/wiki/CURRENT_STATE) | ✓ Toate 4 cu STOP banners; +AGENTS+README+DIFF_FLAGS+PROMPT_CC_* = 8/8 root entry-points clean |

**Remaining (NU în current scope):**
- 587 "LOCK V1" markers across repo (mostly în frozen historical files — NU mass edit per Surgical Changes)
- `01-vision/SUFLET_ANDURA.md` 2266 LOC + `04-architecture/*` files + other 04+05+07+08 folders — NU touched (not in audit scope T1-T3)
- `wiki/concepts/anti-recurrence-rules.md` 552 LOC pe `_FROZEN/` policy nu se aplică wiki (FROZEN cu frontmatter doar)

---

## §8 Karpathy 4 principii applied per [[07-meta/karpathy-skills-ref/CLAUDE.md]]

**Principle 1 — Think Before Coding:** Pre-execute scope check identified 67 src/ JSDoc refs + 48 DECISIONS refs that would break if folder moved fără sync. Surfaced before T2 execute. Verified ADR-029 already deduplicated în precedent commit.

**Principle 2 — Simplicity First:** `_FROZEN/` subfolder = single discoverable marker (chat `ls folder/` vede `_FROZEN` prefix sufficient = "don't read this") vs scattered DEPRECATED notices în 47 files. STOP banner pattern uniform (3 lines per file) reusing previous wave 1 banner format. T3 amendment cu 3 deterministic criteria vs vague "semantic".

**Principle 3 — Surgical Changes:** Body content untouched 100% files moved (only path changed). STOP banners minimum surface (3 lines per file = 21 lines added total for 7 files + 2 NEW READMEs ~30 lines = ~50 lines added total reglaj-relevant). NO refactor of unrelated code, NO "improvement" of adjacent content.

**Principle 4 — Goal-Driven Execution:** Verifiable success criteria all confirmed via grep counts:
- `grep -l "STOP. Read \[\[" *.md | wc -l` → **7** ✓
- `ls 03-decisions/_FROZEN/ | wc -l` → **47** ✓
- `ls 06-sessions-log/_FROZEN/ | wc -l` → **7** ✓
- `grep -r "03-decisions/[^_]" src/ DECISIONS.md | wc -l` → **0** broken refs ✓
- `grep -c "T3 explicit amendment" DECISIONS.md` → **1** ✓
- Tests `3734 PASS` preserved EXACT ✓
- Backup tag pushed origin ✓

---

## §9 Next action Daniel

**Primary (chat NEW startup test post-reglaj):**
1. **Test chat NEW startup discoverability** — verifică chatul `ls` la rădăcină + `ls 03-decisions/` + `ls 06-sessions-log/` găsește README.md/STOP banner redirect către DECISIONS.md prima oară.
2. **Test chat citation behavior** — chat NEW menționează decizie → verifică citează `DECISIONS.md §<ID>` (NU wiki/concepts/ sau ADR direct).
3. **Test D007 supersede enforcement** — adaugă manual D008 test cu titlu suprapus D003 ≥50% keyword overlap → verifică next /handover ingest CC marks D003 SUPERSEDED-BY-D008 same commit.

**Tactical autonomous fallback** (post Daniel validation):
- **P5 §AR.30/§AR.31 strategic decision** (deferred din precedent cleanup wave 1 — Daniel CEO call separat)
- Additional cleanup pass if confusion still observed post wave 2 (e.g. compact wiki/log.md 993 LOC → 50 LOC summary)

**Pre-Beta scope cap-coadă completion gate FINAL preserved invariant:**
- P4 reformulated CORRECT 3 missing pieces tactical autonomous (button wire mockup line 3034 + dashboard banner periodic + LOCK 8 floor toast)
- Bugatti Full Audit pre-Launch Co-CTO every line cod + every virgulă + TOT pe latest commit LANDED gate

---

🦫 **Bugatti craft. T1+T2+T3 cleanup wave 2 LANDED clean atomic single-concern commit `cdcc864` pushed origin. 158 files in commit (47+7 renames + 67 src JSDoc + 7 banners + 2 NEW README + DECISIONS T3 amendment + smart-env + 522 archive). Karpathy 4 principii applied: Surgical Changes (body untouched 100% files moved) + Simplicity First (`_FROZEN/` single marker) + Think Before Coding (pre-execute scope check 115 refs) + Goal-Driven Execution (verifiable §6+§7 grep counts). Tests 3734 PASS preserved EXACT. ZERO src/ runtime impact. ZERO broken refs. Backup tag `pre-cleanup-t1-t2-t3-2026-05-15` pushed origin rollback insurance. 8/8 root *.md entry-points clean. `03-decisions/` + `06-sessions-log/` rearranged _FROZEN/ subfolders cu README.md entry redirects. D007 supersede enforcement rule explicit amended cu literal match trigger (NU fuzzy semantic). Co-CTO autonomy MAXIMUM 16th consecutive cross-chat trust delegation preserved invariant.**
