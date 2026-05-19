# TASK 6 — CURRENT_STATE §JUST_DECIDED periodic compaction → NEW dedicated rolling archive

**Model:** 🔴 OPUS
**Order:** 6/8
**Dependencies:** Task 5 complete (CURRENT_STATE §JUST_DECIDED contains Capacity A LANDED entry top — ordering decision Q3 = 5→6, post Task 5 added entry, NOW truncate)
**Scope:** Move §JUST_DECIDED entries pre-2026-04-30 (>7 days from chat-NEW4 cutoff) → NEW file `06-sessions-log/RECENT_DECIDED_ARCHIVE.md` append-only single-purpose. Truncate §JUST_DECIDED last 7 days only.
**Estimate:** ~15-20 min CC
**Risk:** info loss dacă MOVE incomplete sau truncate aggressive. Mitigation: backup tag + verify content preservation pre-truncate.

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT
═══════════════════════════════════════════════════════════════════

```bash
# 1. Verify Task 5 complete — Capacity A entry present în §JUST_DECIDED
head -100 00-index/CURRENT_STATE.md | grep -q '2026-05-07.*Run 2 Vault Cleanup LANDED' || \
  { echo "FAIL: Task 5 §JUST_DECIDED top entry missing — Task 6 PRE-condition fail"; exit 1; }

# 2. Verify destination NU exists (anti-overwrite)
test ! -f "06-sessions-log/RECENT_DECIDED_ARCHIVE.md" || \
  { echo "FAIL: RECENT_DECIDED_ARCHIVE already exists"; exit 1; }

# 3. Backup current §JUST_DECIDED content pentru audit trail
mkdir -p /tmp/task6-backup
cp 00-index/CURRENT_STATE.md /tmp/task6-backup/CURRENT_STATE-pre-task6.md
echo "✅ Backup CURRENT_STATE saved /tmp/task6-backup/"

# 4. Locate §JUST_DECIDED section boundaries
START_LINE=$(grep -n '^## JUST DECIDED\|^## JUST_DECIDED' 00-index/CURRENT_STATE.md | head -1 | cut -d: -f1)
NEXT_SECTION_LINE=$(awk -v start="$START_LINE" 'NR>start && /^## /' 00-index/CURRENT_STATE.md | head -1)
END_LINE=$(awk -v start="$START_LINE" 'NR>start && /^## / {print NR; exit}' 00-index/CURRENT_STATE.md)

echo "§JUST_DECIDED: line $START_LINE → $END_LINE (LOC: $((END_LINE - START_LINE)))"
JUST_DECIDED_LOC=$((END_LINE - START_LINE))

# Audit baseline §JUST_DECIDED 1128 LOC — verify în range
[ "$JUST_DECIDED_LOC" -ge 1000 ] && [ "$JUST_DECIDED_LOC" -le 1300 ] || \
  echo "WARN: §JUST_DECIDED LOC $JUST_DECIDED_LOC outside expected ~1128 (audit). Review."
```

═══════════════════════════════════════════════════════════════════
                  EXECUTION
═══════════════════════════════════════════════════════════════════

## Step 1 — Identify cutoff entries (>7 days from 2026-05-07 = pre-2026-04-30)

```bash
# Extract §JUST_DECIDED full section
sed -n "${START_LINE},${END_LINE}p" 00-index/CURRENT_STATE.md > /tmp/task6-just-decided-full.txt

# Identify entry boundaries via date markers
# Pattern entries: "**YYYY-MM-DD" sau "## YYYY-MM-DD" sau "*YYYY-MM-DD"
grep -n '^\*\*\?20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]' /tmp/task6-just-decided-full.txt > /tmp/task6-entry-boundaries.txt
cat /tmp/task6-entry-boundaries.txt | head -20

# Cutoff date: 2026-04-30 (entries STRICTLY before this date moved la archive)
# Post-cutoff (preserved în §JUST_DECIDED): 2026-04-30 → 2026-05-07 inclusive (7 days)
CUTOFF="2026-04-30"
echo "Cutoff date: $CUTOFF — entries >= cutoff preserved în §JUST_DECIDED"
```

## Step 2 — Create NEW `06-sessions-log/RECENT_DECIDED_ARCHIVE.md`

```bash
cat > 06-sessions-log/RECENT_DECIDED_ARCHIVE.md <<'HEADER'
# RECENT_DECIDED ARCHIVE — Rolling §JUST_DECIDED Compaction

**Status:** ACTIVE rolling archive (single-purpose append-only — §JUST_DECIDED entries >7 days truncated periodic per §CC.6)
**Authority:** META (vault meta-tooling, NU product/architecture)
**First-source:** `00-index/CURRENT_STATE.md` §JUST_DECIDED (live SSOT — entries migrate here cronologic descending când >7 days)
**Date created:** 2026-05-07 (Run 2 vault cleanup Task 6 — periodic compaction NEW pattern)
**Pattern rationale:** HANDOVER_GLOBAL_2026-04-30_evening.md = INDEX file post-split (~50 LOC navigation purpose) — preserved integrity. Single-purpose dedicated file pentru rolling archive §JUST_DECIDED preserves PK indexing clarity (NU contaminate top SSOT with append content).

**Truncation policy (per VAULT_RULES §CC.6 + §CC.9):**
- §JUST_DECIDED last 7 days (rolling) preserved în CURRENT_STATE
- Entries >7 days from latest chat-NEW move aici append-only descending chronologic
- Truncation triggered manual periodic OR automatic post-handover ingest dacă section >50 LOC `## RECENT` precedent

**Cross-refs:**
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED (live SSOT, source of truncation)
- [[../03-decisions/DECISION_LOG]] (master log full chronologic descending — distinct from this rolling archive)
- [[../00-index/INDEX_MASTER]] §POINTERS (deep history drill-down hub)
- [[../VAULT_RULES]] §CC.6 CURRENT_STATE.md Append-Only Architecture + §CC.9 Mandatory File Updates (Task 7 NEW)

---

## Migrated entries (descending chronologic from CURRENT_STATE §JUST_DECIDED, cutoff < 2026-04-30)

HEADER

# Append entries pre-cutoff via awk: extract entry blocks bounded by date markers
# Entry block: from "**YYYY-MM-DD" line until next "**YYYY-MM-DD" sau end of section
awk -v cutoff="2026-04-30" '
  /^\*\*[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/ {
    # Extract date from entry start
    match($0, /[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    entry_date = substr($0, RSTART, RLENGTH)
    if (entry_date < cutoff) {
      in_old_entry = 1
    } else {
      in_old_entry = 0
    }
  }
  in_old_entry { print }
' /tmp/task6-just-decided-full.txt >> 06-sessions-log/RECENT_DECIDED_ARCHIVE.md

ARCHIVE_LOC=$(wc -l < 06-sessions-log/RECENT_DECIDED_ARCHIVE.md)
echo "RECENT_DECIDED_ARCHIVE.md: $ARCHIVE_LOC LOC"
```

## Step 3 — Truncate CURRENT_STATE §JUST_DECIDED (last 7 days only)

```bash
# Extract §JUST_DECIDED entries >= cutoff (preserve)
awk -v cutoff="2026-04-30" '
  /^\*\*[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/ {
    match($0, /[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    entry_date = substr($0, RSTART, RLENGTH)
    if (entry_date >= cutoff) {
      in_recent = 1
    } else {
      in_recent = 0
    }
  }
  in_recent { print }
' /tmp/task6-just-decided-full.txt > /tmp/task6-just-decided-recent.txt

RECENT_LOC=$(wc -l < /tmp/task6-just-decided-recent.txt)
echo "§JUST_DECIDED post-truncate: $RECENT_LOC LOC (was $JUST_DECIDED_LOC)"

# Replace §JUST_DECIDED section în CURRENT_STATE.md
# Strategy: rebuild file = head pre-section + section header + recent entries + tail post-section
HEADER_LINE=$START_LINE
TAIL_LINE=$END_LINE

head -n "$((HEADER_LINE - 1))" /tmp/task6-backup/CURRENT_STATE-pre-task6.md > /tmp/task6-current-state-rebuilt.md

# Section header preserved + ADD pointer la NEW archive
echo "## JUST DECIDED" >> /tmp/task6-current-state-rebuilt.md
echo "" >> /tmp/task6-current-state-rebuilt.md
echo "*Cronologic descending — last 7 days only. Pre-2026-04-30 entries archived → [[../06-sessions-log/RECENT_DECIDED_ARCHIVE]] (Task 6 compaction 2026-05-07).*" >> /tmp/task6-current-state-rebuilt.md
echo "" >> /tmp/task6-current-state-rebuilt.md

# Append recent entries (preserved)
cat /tmp/task6-just-decided-recent.txt >> /tmp/task6-current-state-rebuilt.md

# Append tail (sections post §JUST_DECIDED)
tail -n "+${TAIL_LINE}" /tmp/task6-backup/CURRENT_STATE-pre-task6.md >> /tmp/task6-current-state-rebuilt.md

# Replace original
mv /tmp/task6-current-state-rebuilt.md 00-index/CURRENT_STATE.md
echo "✅ CURRENT_STATE §JUST_DECIDED truncated last 7 days only"
```

## Step 4 — Update CURRENT_STATE §POINTERS (add NEW archive pointer)

```bash
# Locate §POINTERS section
grep -n '^## POINTERS\|^## Pointers' 00-index/CURRENT_STATE.md
```

ADD entry în §POINTERS list (alphabetic OR after deep archive pointer):

```markdown
- **§JUST_DECIDED rolling archive (>7 days):** `06-sessions-log/RECENT_DECIDED_ARCHIVE.md` (Task 6 compaction 2026-05-07 NEW pattern, single-purpose dedicated file)
```

═══════════════════════════════════════════════════════════════════
                  VERIFY POST
═══════════════════════════════════════════════════════════════════

```bash
# 1. NEW archive file exists + non-empty
test -s "06-sessions-log/RECENT_DECIDED_ARCHIVE.md" || \
  { echo "FAIL: RECENT_DECIDED_ARCHIVE empty/missing"; exit 1; }
echo "✅ RECENT_DECIDED_ARCHIVE.md created $(wc -l < 06-sessions-log/RECENT_DECIDED_ARCHIVE.md) LOC"

# 2. CURRENT_STATE §JUST_DECIDED truncated
START_LINE_NEW=$(grep -n '^## JUST DECIDED\|^## JUST_DECIDED' 00-index/CURRENT_STATE.md | head -1 | cut -d: -f1)
END_LINE_NEW=$(awk -v start="$START_LINE_NEW" 'NR>start && /^## / {print NR; exit}' 00-index/CURRENT_STATE.md)
JUST_DECIDED_NEW_LOC=$((END_LINE_NEW - START_LINE_NEW))
echo "§JUST_DECIDED post-truncate LOC: $JUST_DECIDED_NEW_LOC (target ≤300, was $JUST_DECIDED_LOC)"
[ "$JUST_DECIDED_NEW_LOC" -le 350 ] || \
  echo "WARN: truncate insufficient — review cutoff date logic"

# 3. Capacity A entry preserved în §JUST_DECIDED (Task 5 entry top, post-cutoff 2026-05-07)
sed -n "${START_LINE_NEW},${END_LINE_NEW}p" 00-index/CURRENT_STATE.md | \
  grep -q '2026-05-07.*Run 2 Vault Cleanup LANDED' || \
  { echo "FAIL: Capacity A LANDED entry lost during truncate"; exit 1; }
echo "✅ Capacity A LANDED entry preserved în §JUST_DECIDED"

# 4. Total content preservation: §JUST_DECIDED + RECENT_DECIDED_ARCHIVE ≈ original §JUST_DECIDED
TOTAL_NEW=$((JUST_DECIDED_NEW_LOC + ARCHIVE_LOC))
echo "Total content preservation: §JUST_DECIDED $JUST_DECIDED_NEW_LOC + ARCHIVE $ARCHIVE_LOC = $TOTAL_NEW LOC"
echo "Original §JUST_DECIDED: $JUST_DECIDED_LOC LOC"
# Delta acceptable ±20 LOC pentru header overhead arrearchive

# 5. §POINTERS contains new archive ref
grep -q 'RECENT_DECIDED_ARCHIVE' 00-index/CURRENT_STATE.md || \
  echo "WARN: §POINTERS missing RECENT_DECIDED_ARCHIVE ref (manual edit needed)"
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git add 06-sessions-log/RECENT_DECIDED_ARCHIVE.md 00-index/CURRENT_STATE.md
git commit -m "feat(vault-cleanup): CURRENT_STATE §JUST_DECIDED periodic compaction → NEW RECENT_DECIDED_ARCHIVE rolling (Task 6)

Compaction strategy:
- §JUST_DECIDED entries pre-2026-04-30 (>7 days from chat-NEW4 cutoff) MOVED → 06-sessions-log/RECENT_DECIDED_ARCHIVE.md NEW append-only
- §JUST_DECIDED truncated last 7 days only (was $JUST_DECIDED_LOC LOC → $JUST_DECIDED_NEW_LOC LOC)
- §POINTERS updated cu NEW archive ref

Pattern rationale (Bugatti decision Q2):
- HANDOVER_GLOBAL_2026-04-30_evening.md = INDEX file post-split (~50 LOC navigation purpose) — integrity preserved
- Single-purpose dedicated file pentru rolling archive — PK indexing clarity (NU contaminate top SSOT inbound 91 with append content)

Total content preservation: $TOTAL_NEW LOC (vs original $JUST_DECIDED_LOC LOC) — header overhead delta acceptable.

Cross-refs: VAULT_RULES §CC.6 Append-Only Architecture + §CC.9 (Task 7 NEW) Mandatory File Updates Per Handover."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK
═══════════════════════════════════════════════════════════════════

```bash
git reset --hard HEAD^
rm -f 06-sessions-log/RECENT_DECIDED_ARCHIVE.md
cp /tmp/task6-backup/CURRENT_STATE-pre-task6.md 00-index/CURRENT_STATE.md
echo "Task 6 reverted — §JUST_DECIDED restored + RECENT_DECIDED_ARCHIVE removed"
```
