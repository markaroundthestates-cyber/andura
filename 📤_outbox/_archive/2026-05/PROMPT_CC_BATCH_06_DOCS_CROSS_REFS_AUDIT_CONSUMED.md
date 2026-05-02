# PROMPT_CC_BATCH_06_DOCS_CROSS_REFS_AUDIT

**Model:** Opus
**Order:** 6/10
**Dependencies:** BATCH_01 + BATCH_02 + BATCH_04 complete (ADR LOCKS + §BATCH_PROTOCOL + agenda update integrated)
**Scope:** Vault-wide audit cross-references broken/stale (.md only, NOT cod)
**Estimate:** ~1-1.5h

---

## CONTEXT

Vault complex 56→60 LOCKED decisions cumulative. Cross-refs drift inevitable peste timp:
- ADR refs vechi pointing to DRAFT status (now LOCKED post BATCH_01)
- §36.X numbers shifted/duplicated
- File paths mutate (e.g., reorganize folders)
- Stale links la fișiere mutate sau renamed

Prevention drift real per Bugatti paradigm. NU "refactor later".

---

## TASKS

### Task 6.1 — Inventory all .md files vault

Run: `find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" | sort > /tmp/all_md_files.txt`

Count: `wc -l /tmp/all_md_files.txt` (likely 50-150 files).

---

### Task 6.2 — Extract all cross-refs

For each .md file, extract:
1. **ADR refs:** `grep -h "ADR_" $(find . -name "*.md" ...) | sort -u > /tmp/adr_refs.txt`
2. **Section refs §X.Y:** `grep -hoE "§[0-9]+\.[0-9]+" $(find ...) | sort -u > /tmp/section_refs.txt`
3. **Internal file links:** `grep -hoE "\[.*\]\([^)]+\.md\)" $(find ...) | sort -u > /tmp/file_links.txt`
4. **Path refs:** `grep -hoE "\`[^\`]*\.(ts|tsx|js|jsx|md)\`" $(find ...) | sort -u > /tmp/path_refs.txt`

---

### Task 6.3 — Validate refs

For each ref category, validate:

**ADR refs:**
- Check ADR file exists: `ls 03-decisions/<adr-name>.md`
- Check status mention matches actual: dacă ref says "DRAFT" but file is "LOCKED V1" → STALE

**Section refs §X.Y:**
- Check §X.Y exists în target file (usually HANDOVER_GLOBAL.md): `grep "§X.Y" 06-sessions-log/HANDOVER_GLOBAL.md`
- Flag duplicates (§X.Y referenced but doesn't exist)

**File links `[text](path.md)`:**
- Verify path exists: `ls <path>`
- Flag broken (404)

**Path refs:**
- Verify code paths exist: `ls <path>`
- Flag broken

---

### Task 6.4 — Generate audit report

**Create file:** `📤_outbox/_archive/2026-05/BATCH_06_CROSS_REFS_AUDIT.md`

```markdown
# Cross-References Audit — Vault Wide (BATCH_06)

**Date:** 2026-05-02
**Scope:** All .md files vault-wide cross-references validation
**Total files audited:** <N>

## ADR refs

### Stale (LOCKED V1 but referenced as DRAFT)
- `<file.md>:<line>`: ADR_X referenced as DRAFT, actual LOCKED V1 since 2026-05-02 (BATCH_01)
<repeat>

### Broken (file not found)
- `<file.md>:<line>`: ADR_Y not found în 03-decisions/
<repeat>

### OK
- <count> ADR refs valid

## Section refs §X.Y

### Broken (target not found)
- `<file.md>:<line>`: §X.Y not found în target file
<repeat>

### Duplicates
- §X.Y referenced N times (acceptable / problem TBD)
<repeat>

### OK
- <count> section refs valid

## File links

### Broken (404)
- `<file.md>:<line>`: [text](path.md) → path missing
<repeat>

### OK
- <count> file links valid

## Path refs (code paths in docs)

### Broken
- `<file.md>:<line>`: \`src/X/Y.ts\` not found
<repeat>

### OK
- <count> path refs valid

## Fixes applied

### Auto-fixed (safe replacements)
- <file.md>:<line>: changed `ADR_X DRAFT` → `ADR_X LOCKED V1`
<repeat>

### Flagged manual review (NOT auto-fixed)
- <file.md>:<line>: ambiguous ref, requires Daniel decision
<repeat>

## Summary

- **Total refs scanned:** <N>
- **Broken:** <N>
- **Stale:** <N>
- **Auto-fixed:** <N>
- **Manual review needed:** <N>
```

---

### Task 6.5 — Apply auto-fixes (safe only)

**Safe auto-fixes:**
1. ADR DRAFT → LOCKED V1 references for ADRs locked în BATCH_01:
   - ADR_COMPOSITE_SIGNAL_LAYER_v1
   - ADR_PAIN_DISCOMFORT_BUTTON_v1
   - ADR_SMART_ROUTING_EQUIPMENT_v1
2. Path refs cu typo evident (e.g., `src/data/Exercise-metadata.ts` → `src/data/exercise-metadata.ts` if actual file lowercase)

**NOT auto-fixed (flag pentru Daniel review):**
- Ambiguous section refs (§X.Y could mean multiple)
- Renamed files cu unclear new path
- Cross-refs la documente external sau inboxonly artifacts

---

### Task 6.6 — Cross-ref HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry:

```markdown
### §36.67 CROSS-REFS AUDIT VAULT-WIDE 2026-05-02

Vault-wide audit `.md` cross-references (ADR + §X.Y + file links + path refs):
- **Total scanned:** <N> refs across <M> files
- **Auto-fixed:** <N> (ADR DRAFT→LOCKED V1 post BATCH_01 + safe path typos)
- **Manual review flagged:** <N> (see `BATCH_06_CROSS_REFS_AUDIT.md`)

Anti-drift Bugatti paradigm. Prevent rediscovery effort future.

**Cumulative LOCKED count:** 60 → 60 (audit hygiene, NU decizie nouă)
```

---

## VERIFICATION GATE

Pre-commit:
1. `ls 📤_outbox/_archive/2026-05/BATCH_06_CROSS_REFS_AUDIT.md` → file exists
2. `grep "§36.67 CROSS-REFS AUDIT" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match
3. `npm test` → all pass (no breakage from .md edits)
4. Sanity check: re-grep ADR DRAFT post-fix → ZERO matches pentru BATCH_01 ADRs (toate auto-fixed):
   - `grep "ADR_COMPOSITE_SIGNAL_LAYER_v1.*DRAFT" $(find . -name "*.md")` → expect ZERO
   - `grep "ADR_PAIN_DISCOMFORT_BUTTON_v1.*DRAFT" $(find . -name "*.md")` → expect ZERO
   - `grep "ADR_SMART_ROUTING_EQUIPMENT_v1.*DRAFT" $(find . -name "*.md")` → expect ZERO

---

## COMMIT

```
git add <auto-fixed .md files>
git add 📤_outbox/_archive/2026-05/BATCH_06_CROSS_REFS_AUDIT.md
git add 06-sessions-log/HANDOVER_GLOBAL.md
git commit -m "feat(batch-06): vault-wide cross-refs audit + auto-fixes safe

- <N> refs scanned across <M> .md files
- <N> auto-fixed (ADR DRAFT→LOCKED V1 + path typos)
- <N> manual review flagged (BATCH_06_CROSS_REFS_AUDIT.md)
- HANDOVER_GLOBAL §36.67 entry"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_06_REPORT.md`:

```markdown
# BATCH_06_DOCS_CROSS_REFS_AUDIT — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- Vault-wide audit <N> refs across <M> files
- Auto-fixes applied <N>
- Manual review flagged <N>
- BATCH_06_CROSS_REFS_AUDIT.md detailed report
- HANDOVER_GLOBAL §36.67 entry

## Verification gate
- [✅/❌] BATCH_06_CROSS_REFS_AUDIT.md exists
- [✅/❌] grep §36.67: 1 match
- [✅/❌] ZERO ADR DRAFT refs pentru BATCH_01 ADRs
- [✅/❌] npm test: all pass

## Issues
<none / lista manual review items pentru Daniel>

## Next batch
BATCH_07_TEST_COVERAGE_REPORT
```

Stop. Trigger BATCH_07.
