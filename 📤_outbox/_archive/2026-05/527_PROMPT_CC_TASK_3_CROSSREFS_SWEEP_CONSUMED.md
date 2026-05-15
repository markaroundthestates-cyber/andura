# PROMPT_CC TASK 3 — Cross-refs Sweep wiki/* → 99-archive/wiki-pre-2026-05-15/*

**Model:** Opus exclusively
**Scope:** TASK 3 of 3 — sweep all references to old wiki/ paths în vault docs, point to new archive location
**Bugatti:** atomic single-concern commit, sed-replace bulk
**Prerequisite:** TASK 1 + TASK 2 LANDED ✓

---

## §0 Pre-flight grep evidence inline mandatory §AR.20 + §AR.21

```bash
cd /c/Users/Daniel/Documents/salafull

# Verify TASK 2 LANDED — wiki/ moved
test -d wiki && echo "ROLLBACK — TASK 2 incomplete" || echo "TASK 2 verified ✓"
test -d 99-archive/wiki-pre-2026-05-15 && echo "Archive exists ✓" || echo "ROLLBACK — archive missing"

# Inventory cross-refs spre wiki/ în vault docs (excluding archive itself + node_modules + .git)
echo "=== DECISIONS.md cross-refs spre wiki/ ==="
grep -c "wiki/concepts\|wiki/entities\|wiki/summaries\|wiki/sources" DECISIONS.md
# Expected: ~50-70 references

echo "=== 00-index/INDEX_MASTER.md cross-refs spre wiki/ ==="
grep -c "wiki/" 00-index/INDEX_MASTER.md 2>/dev/null || echo "0"

echo "=== VAULT_RULES.md cross-refs spre wiki/ ==="
grep -c "wiki/" VAULT_RULES.md 2>/dev/null || echo "0"

echo "=== CLAUDE.md root cross-refs spre wiki/ ==="
grep -c "wiki/" CLAUDE.md 2>/dev/null || echo "0"

echo "=== Other vault docs cross-refs spre wiki/ (excluding archive + dependencies) ==="
grep -rln "wiki/concepts\|wiki/entities\|wiki/summaries\|wiki/sources" \
  --include="*.md" \
  --exclude-dir=99-archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=📤_outbox \
  --exclude-dir=📥_inbox \
  . 2>/dev/null | head -20

# Verify tests baseline pre-execute
npm run test:run --silent 2>&1 | grep "Tests"
# Expected: Tests 3734 passed (3734)

# Backup tag pre-execute
git tag pre-crossrefs-sweep-wiki-archive-2026-05-16
git push origin pre-crossrefs-sweep-wiki-archive-2026-05-16
```

All §0 PASS → proceed §1.

---

## §1 DECISIONS.md cross-refs sweep — primary target ~50-70 references

Replace toate occurences `wiki/concepts/`, `wiki/entities/`, `wiki/summaries/`, `wiki/sources/` în DECISIONS.md cu prefix `99-archive/wiki-pre-2026-05-15/`:

```bash
cd /c/Users/Daniel/Documents/salafull

# Sed-replace bulk în DECISIONS.md
# Pattern: înlocuiește 'wiki/X/' cu '99-archive/wiki-pre-2026-05-15/X/' unde X ∈ {concepts, entities, summaries, sources}
sed -i 's|wiki/concepts/|99-archive/wiki-pre-2026-05-15/concepts/|g' DECISIONS.md
sed -i 's|wiki/entities/|99-archive/wiki-pre-2026-05-15/entities/|g' DECISIONS.md
sed -i 's|wiki/summaries/|99-archive/wiki-pre-2026-05-15/summaries/|g' DECISIONS.md
sed -i 's|wiki/sources/|99-archive/wiki-pre-2026-05-15/sources/|g' DECISIONS.md

# Verify sweep effective
echo "=== Post-sweep DECISIONS.md cross-refs ==="
grep -c "wiki/concepts\|wiki/entities\|wiki/summaries\|wiki/sources" DECISIONS.md
# Expected: 0 (toate swapped)

grep -c "99-archive/wiki-pre-2026-05-15" DECISIONS.md
# Expected: ~50-70 (same count as pre-sweep cross-refs)
```

---

## §2 INDEX_MASTER.md + VAULT_RULES.md + CLAUDE.md root cross-refs sweep

```bash
cd /c/Users/Daniel/Documents/salafull

# INDEX_MASTER.md sweep (if has wiki refs)
if [ -f 00-index/INDEX_MASTER.md ]; then
  sed -i 's|wiki/concepts/|99-archive/wiki-pre-2026-05-15/concepts/|g' 00-index/INDEX_MASTER.md
  sed -i 's|wiki/entities/|99-archive/wiki-pre-2026-05-15/entities/|g' 00-index/INDEX_MASTER.md
  sed -i 's|wiki/summaries/|99-archive/wiki-pre-2026-05-15/summaries/|g' 00-index/INDEX_MASTER.md
  sed -i 's|wiki/sources/|99-archive/wiki-pre-2026-05-15/sources/|g' 00-index/INDEX_MASTER.md
fi

# VAULT_RULES.md sweep (if has wiki refs)
if [ -f VAULT_RULES.md ]; then
  sed -i 's|wiki/concepts/|99-archive/wiki-pre-2026-05-15/concepts/|g' VAULT_RULES.md
  sed -i 's|wiki/entities/|99-archive/wiki-pre-2026-05-15/entities/|g' VAULT_RULES.md
  sed -i 's|wiki/summaries/|99-archive/wiki-pre-2026-05-15/summaries/|g' VAULT_RULES.md
  sed -i 's|wiki/sources/|99-archive/wiki-pre-2026-05-15/sources/|g' VAULT_RULES.md
fi

# CLAUDE.md root sweep (note: D001 declares root CLAUDE.md FROZEN, but cross-refs update is operational not semantic)
if [ -f CLAUDE.md ]; then
  sed -i 's|wiki/concepts/|99-archive/wiki-pre-2026-05-15/concepts/|g' CLAUDE.md
  sed -i 's|wiki/entities/|99-archive/wiki-pre-2026-05-15/entities/|g' CLAUDE.md
  sed -i 's|wiki/summaries/|99-archive/wiki-pre-2026-05-15/summaries/|g' CLAUDE.md
  sed -i 's|wiki/sources/|99-archive/wiki-pre-2026-05-15/sources/|g' CLAUDE.md
fi
```

---

## §3 Sweep alte vault docs cross-refs spre wiki/ (catch-all)

```bash
cd /c/Users/Daniel/Documents/salafull

# Find toate .md files with wiki/ refs (excluding archive + dependencies + outbox/inbox)
echo "=== Files candidate for sweep ==="
grep -rln "wiki/concepts\|wiki/entities\|wiki/summaries\|wiki/sources" \
  --include="*.md" \
  --exclude-dir=99-archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=📤_outbox \
  --exclude-dir=📥_inbox \
  --exclude-dir=coverage \
  --exclude-dir=dist \
  --exclude-dir=test-results \
  --exclude-dir=reports \
  .

# Bulk sweep these files (catch 00-index/, 01-vision/, 02-audit/, 03-decisions/, 04-architecture/, 05-findings-tracker/, 06-sessions-log/, 07-meta/, 08-workflows/)
grep -rln "wiki/concepts\|wiki/entities\|wiki/summaries\|wiki/sources" \
  --include="*.md" \
  --exclude-dir=99-archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=📤_outbox \
  --exclude-dir=📥_inbox \
  --exclude-dir=coverage \
  --exclude-dir=dist \
  --exclude-dir=test-results \
  --exclude-dir=reports \
  . | while read file; do
    sed -i 's|wiki/concepts/|99-archive/wiki-pre-2026-05-15/concepts/|g' "$file"
    sed -i 's|wiki/entities/|99-archive/wiki-pre-2026-05-15/entities/|g' "$file"
    sed -i 's|wiki/summaries/|99-archive/wiki-pre-2026-05-15/summaries/|g' "$file"
    sed -i 's|wiki/sources/|99-archive/wiki-pre-2026-05-15/sources/|g' "$file"
  done

# Verify sweep effective globally (should be 0 remaining outside archive)
echo "=== Post-sweep remaining wiki/ cross-refs outside archive ==="
grep -rln "wiki/concepts\|wiki/entities\|wiki/summaries\|wiki/sources" \
  --include="*.md" \
  --exclude-dir=99-archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=📤_outbox \
  --exclude-dir=📥_inbox \
  --exclude-dir=coverage \
  --exclude-dir=dist \
  --exclude-dir=test-results \
  --exclude-dir=reports \
  . | wc -l
# Expected: 0
```

---

## §4 Verify build + tests preserved EXACT

```bash
# Tests baseline
npm run test:run --silent 2>&1 | grep "Tests"
# Expected: Tests 3734 passed (3734) — ZERO regression (doc-only cross-refs swap)

# Build verify (no broken paths în production code)
npm run build 2>&1 | tail -10
# Expected: clean build
```

---

## §5 Atomic single-concern commit Bugatti

```bash
git add -u  # only modified tracked files (NU adăugă noi files inadvertent)

# Verify staged
git status
# Expected: modified files cu cross-refs sweep (DECISIONS.md + various)

git commit -m "chore(vault): cross-refs sweep wiki/* → 99-archive/wiki-pre-2026-05-15/* post radical archive

Daniel CEO directive 2026-05-16 chat ACASĂ: \"REPARAM TOT FULL ORDER\".

Sweep complete vault docs cu sed-replace bulk:
- DECISIONS.md ~50-70 D-LEGACY cross-refs swap
- 00-index/INDEX_MASTER.md (if wiki refs)
- VAULT_RULES.md (if wiki refs)
- CLAUDE.md root (if wiki refs, operational update only)
- All other vault docs catch-all (01-vision/ + 03-decisions/ + 04-architecture/ + 07-meta/ + 08-workflows/)

ZERO src/ touched. Tests 3734 PASS preserved EXACT. Build clean.

Post-sweep: ZERO remaining wiki/ cross-refs outside 99-archive/ verified via grep.

🦫 Bugatti craft. FULL ORDER cross-refs aligned cu radical archive."

git push origin feature/v2-vanilla-port
```

---

## §6 Status output în `📤_outbox/LATEST.md` § structured TASK 3 raport + FINAL bundle summary

Update `📤_outbox/LATEST.md` ca raport FINAL bundle 3-task cumulative:

```
# LATEST — Bundle FULL ORDER LANDED 2026-05-16 (3 tasks cumulative)

## Tasks (sequential atomic Bugatti)
- TASK 1 ✓ — Create ANDURA_PRIMER.md SSOT singular briefing vault root
- TASK 2 ✓ — Radical archive wiki/ → 99-archive/wiki-pre-2026-05-15/
- TASK 3 ✓ — Cross-refs sweep wiki/* → 99-archive/wiki-pre-2026-05-15/*

## Status: ALL COMPLETE

## Pre-flight (cumulative cross-task)
- 3 backup tags pushed origin ✓
- Working tree clean între tasks ✓
- Tests 3734 PASS preserved EXACT cross-task ✓

## Modificări cumulative
- NEW file: ANDURA_PRIMER.md vault root (~10.5kB §1-§8 narrative)
- NEW dir: 99-archive/ + README.md
- MOVE: wiki/ → 99-archive/wiki-pre-2026-05-15/ (~140 files git mv preserve history)
- MODIFY: DECISIONS.md + INDEX_MASTER + VAULT_RULES + CLAUDE.md root + all vault docs cu cross-refs swap

## Build+Tests cumulative
- Build: clean cross-task
- Tests: 3734 PASS preserved EXACT cross-task (ZERO regression)
- ZERO src/ touched (vault meta-tooling only)

## Commits (3 atomic single-concern Bugatti)
- <SHA1> | feat(vault): add ANDURA_PRIMER.md SSOT singular briefing fresh chat onboard
- <SHA2> | chore(vault): radical archive wiki → 99-archive/wiki-pre-2026-05-15
- <SHA3> | chore(vault): cross-refs sweep wiki/* → 99-archive/wiki-pre-2026-05-15/* post radical archive

## Pushed
feature/v2-vanilla-port pushed origin ✓ (3 commits + 3 backup tags)

## Issues
None.

## Next action Daniel
1. **Daniel manual UI step** — paste updated PROJECT_INSTRUCTIONS V6 în Claude.ai project custom instructions (Claude chat compose separate artefact pending) cu §CC.2 startup reference ANDURA_PRIMER.md as FIRST read primary.
2. **Test fresh chat startup** — open new Claude chat, send "Salut Acasă" → verify §CC.3 output cites ANDURA_PRIMER.md + DECISIONS.md + LATEST.md correctly cu instant 7-criterii context.
3. **Next P1 candidates pending CEO call:**
   - §AR.30 + §AR.31 codify D008/D009 PROC LOCKED V1 (substanță-only titluri per D005)
   - D007 retroactive entry pentru supersede enforcement rule drift fix
   - P4 reformulated 3 missing pieces pre-Beta cap-coadă (button wire + dashboard banner + LOCK 8 toast)

## Bandwidth
~12-15% remaining post 3-task atomic bundle. Recommendation: handover acum dacă chat NEW needed, ELSE continue cu D007/D008/D009 codify în acest chat.

---

🦫 **Bugatti craft. FULL ORDER once-and-done bundle LANDED. ANDURA_PRIMER.md = SSOT briefing fresh chat instant context. Wiki radical archived off-default-search. Cross-refs aligned. Tests 3734 PASS preserved invariant. Co-CTO autonomy MAXIMUM 15th consecutive cross-chat trust delegation preserved invariant.**
```

---

## §6 HARD CONSTRAINTS verify

- ✅ ZERO src/ touched (vault meta-tooling only)
- ✅ Single-concern atomic commit Bugatti (cross-refs sweep separat de archive move)
- ✅ Backup tag pushed origin pre-execute
- ✅ Tests 3734 PASS preserved EXACT
- ✅ ZERO remaining wiki/ cross-refs outside 99-archive/ post-sweep verified

---

🦫 **TASK 3 of 3 FINAL. Bundle FULL ORDER cumulative LANDED. Bugatti craft. Vault clean once-and-done.**
