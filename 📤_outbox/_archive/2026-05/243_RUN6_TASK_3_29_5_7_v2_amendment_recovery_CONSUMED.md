# Task 3 — §29.5.7 V2 amendment verify + recovery from archive if needed

**Model:** Opus
**Velocity:** ~10-15 min
**Scope:** Vault meta-tooling content recovery. Cumulative LOCKED V1 ~688 PRESERVED unchanged.

## Pre-flight MANDATORY

```bash
git status                                      # clean tree post Task 2 commit
```

## Context

§29.5.7 V2 amendment carry-forward chat-NEW1 (per CURRENT_STATE §JUST_DECIDED narrative): *"§29.5.7 V2 amendment write spec vault SSOT — pending scribe HANDOVER_MISC + DECISION_LOG cumulative entries net"*.

**Run 2 Task 1 split** extracted DOAR §29.7+§31+§32+§36.103 from HANDOVER_MISC → standalone files. **§29.5.7 NU split standalone** — content rămâne în archive `📤_outbox/_archive/2026-05/223_HANDOVER_MISC_2026-04-30_evening_DEPRECATED.md` only.

Run 6 must verify: dacă §29.5.7 content already migrated în ADR 026 §9.X canonical SSOT (some prior CC session) SAU recovery extraction needed din archive standalone canonical OR ADD ADR 026 §9.X.

## Steps

### Step 3.1 — Search ADR 026 §9.X for §29.5.7 content

```bash
grep -n "29.5.7\|§29.5.7" 03-decisions/026-offline-coaching-decision-tree-exhaustive.md
grep -rEn "29.5.7" --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules --exclude-dir=.git . | head -20
```

If found in ADR 026 §9.X with substantive content (NU just reference) → **MIGRATED status confirmed**. Document final location în Task 3 report. STOP Step 3.4 (no recovery needed).

If found ONLY in carry-forward references (CURRENT_STATE pending narrative) WITHOUT canonical destination → **RECOVERY needed**. Continue Step 3.2.

### Step 3.2 — Locate §29.5.7 content în archive

```bash
# Find HANDOVER_MISC archive file
ls -la 📤_outbox/_archive/2026-05/ | grep -i "HANDOVER_MISC"
# Expected: ~221_HANDOVER_MISC_..._DEPRECATED.md OR ~223_HANDOVER_MISC_..._DEPRECATED.md (per CURRENT_STATE archive references)

# Extract §29.5.7 verbatim section
grep -A 200 "^### §29.5.7\|^## §29.5.7" 📤_outbox/_archive/2026-05/<NN>_HANDOVER_MISC_*.md
```

### Step 3.3 — Recovery decision tree

**Option A — ADD ADR 026 §9.X canonical** (if §29.5.7 = SUFLET ANDURA / coach intelligence / engine adaptation scope):
- Identify appropriate §9.X subsection în ADR 026 (cross-ref §9.1-§9.8 existing structure)
- APPEND §29.5.7 V2 amendment content verbatim cu cross-ref source archive
- Update ADR 026 §RECENT or §POINTERS section if material

**Option B — Standalone canonical file** (if §29.5.7 = workflow / vault meta-tooling / non-engine scope):
- Create `08-workflows/<scope>_29_5_7_V2_AMENDMENT.md` OR appropriate folder per §3.x ADR Numbering
- Verbatim content extraction from archive
- Update INDEX_MASTER NAVIGARE row if file new

**Option C — DECISION_LOG entry only** (if §29.5.7 = punctual decision NU spec content):
- Append entry în DECISION_LOG with verbatim content + cross-ref archive

**Anti-fabrication MANDATORY:** NU invent §29.5.7 content from memory. Use ONLY archive extraction verbatim.

### Step 3.4 — Update CURRENT_STATE §JUST_DECIDED carry-forward

Edit `00-index/CURRENT_STATE.md` `## JUST_DECIDED` Task 1 entry append section "Mid-flight unresolved carry-forward":

REPLACE line `§29.5.7 V2 amendment verify + recovery — Task 3 acest batch`
WITH:
- If MIGRATED already: `§29.5.7 V2 amendment ✅ verified migrated [target_path]:§ canonical SSOT`
- If RECOVERY done: `§29.5.7 V2 amendment ✅ recovered from archive → [target_path]:§ canonical SSOT new`

### Step 3.5 — Wikilinks update if file created/migrated

Per VAULT_RULES §CC.9.5 pre-flight grep wikilinks orphane:

```bash
grep -rEn "\[\[.*29.5.7" --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules --exclude-dir=.git . | head -20
# Verify all wikilinks resolve to canonical destination post-recovery
```

## Validation

- ✅ §29.5.7 V2 amendment final location documented (migrated SAU recovered)
- ✅ ZERO fabrication (verbatim archive extraction only)
- ✅ Cross-refs canonical SSOT updated CURRENT_STATE
- ✅ Wikilinks resolve correct (no orphaned references)

## Report format `📤_outbox/LATEST.md` Task 3 section

```
### Task 3 — §29.5.7 V2 amendment verify + recovery
- Status: Complete
- Pre-flight: clean tree
- Modificări:
  - <path>: §29.5.7 V2 amendment <migrated verified | recovered from archive>
  - 00-index/CURRENT_STATE.md §JUST_DECIDED: carry-forward updated final location
  - <if file new>: INDEX_MASTER NAVIGARE row added
- Commits: <SHA> "feat(vault-hygiene): Run 6 Task 3 §29.5.7 V2 amendment <verify | recovery>"
- Pushed: origin/main
- Issues: none / <if archive content missing flag>
- Next: Task 4 §AR.14 + §AR.15 add VAULT_RULES
```

**STOP. Continue Task 4 only after Task 3 success report verified.**
