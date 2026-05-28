# PROMPT_CC TASK 2 — Radical Archive wiki/ → 99-archive/wiki-pre-2026-05-15/

**Model:** Opus exclusively
**Scope:** TASK 2 of 3 — radical archive wiki layer off-default-search-path, preserve fizic substanță
**Bugatti:** atomic single-concern commit, `git mv` preserve history rename detection
**Prerequisite:** TASK 1 LANDED ✓

---

## §0 Pre-flight grep evidence inline mandatory §AR.20 + §AR.21

```bash
# Verify wiki/ exists + has expected structure
test -d /c/Users/Daniel/Documents/salafull/wiki && echo "EXISTS — proceed" || echo "MISSING — HALT"

ls /c/Users/Daniel/Documents/salafull/wiki/
# Expected dirs: concepts, entities, summaries, sources, _design
# Expected files: index.md, log.md

# Verify 99-archive/ doesn't exist yet
test -d /c/Users/Daniel/Documents/salafull/99-archive && echo "EXISTS — HALT" || echo "MISSING — proceed"

# Count wiki files for sanity check post-move
find /c/Users/Daniel/Documents/salafull/wiki -name "*.md" | wc -l
# Expected: ~140 files

# Verify tests baseline pre-execute
npm run test:run --silent 2>&1 | grep "Tests"
# Expected: Tests 3734 passed (3734)

# Verify working tree clean (post TASK 1 commit)
git status --short
# Expected: empty (clean)

# Backup tag pre-execute
git tag pre-radical-archive-wiki-2026-05-16
git push origin pre-radical-archive-wiki-2026-05-16
```

All §0 PASS → proceed §1.

---

## §1 Create archive directory + git mv wiki/ → 99-archive/wiki-pre-2026-05-15/

```bash
cd /c/Users/Daniel/Documents/salafull

# Create archive parent dir
mkdir -p 99-archive

# Git mv pentru preserve history rename detection (NU shell mv)
git mv wiki 99-archive/wiki-pre-2026-05-15

# Verify move
ls 99-archive/wiki-pre-2026-05-15/
# Expected: concepts/ entities/ summaries/ sources/ _design/ index.md log.md

# Verify wiki/ no longer exists at root
test -d wiki && echo "ROLLBACK — wiki/ still exists" || echo "Move verified ✓"

# Count post-move
find 99-archive/wiki-pre-2026-05-15 -name "*.md" | wc -l
# Expected: ~140 files (same count pre-move)
```

---

## §2 Add 99-archive/ note README explicit purpose

Write file `C:\Users\Daniel\Documents\salafull\99-archive\README.md` cu content:

```markdown
# 99-archive/

**Off-default-search-path archive layer.** Files here preserve fizic substanță istoric vault, dar NU sunt active source-of-truth. Search default (CC + Claude chat) NU search-uiește acest folder. Citable on-demand explicit path read când e nevoie context Bugatti framing / voice preservation / verbatim quotes Daniel / historical reference.

## Subdirs

- **`wiki-pre-2026-05-15/`** — wiki layer Karpathy Real Option B archived post reglaj 2026-05-16. ~140 files: concepts/ + entities/adrs/ + entities/specs/ + entities/features/ + entities/engines/ + summaries/ + sources/ + _design/ + index.md + log.md. Esența preserved (Daniel verbatim quotes Categorii DA-DF + Bugatti framing + slip pattern history + voice + daniel-isms catalog). Active SSOT decizii post-reglaj = `../DECISIONS.md` singular live.

## Authority

DECISIONS.md §D001 wiki FREEZE post 2026-05-15 + Daniel CEO directive 2026-05-16 chat ACASĂ "REPARAM TOT, fără slips, halucinații, presupuneri, shortcuts" → radical archive pentru FULL ORDER.

🦫 **99-archive/ = deep-substance preserved off-radar. Active live = `DECISIONS.md` + `ANDURA_PRIMER.md` + `01-vision/` + `04-architecture/mockups/`.**
```

---

## §3 Verify build + tests preserved EXACT

```bash
# Verify build doesn't break (Vite paths)
npm run build 2>&1 | tail -20
# Expected: clean build, no broken imports referencing wiki/

# Tests baseline preserved
npm run test:run --silent 2>&1 | grep "Tests"
# Expected: Tests 3734 passed (3734) — ZERO regression (wiki/ NU referenced în src/ tests)

# Smoke E2E vs live andura.app (optional — if Playwright accessible)
# npm run test:e2e:smoke 2>&1 | tail -10
# Expected: 5/5 PASS
```

---

## §4 Atomic single-concern commit Bugatti

```bash
git add 99-archive/

# Verify staged
git status
# Expected: 99-archive/README.md NEW + 99-archive/wiki-pre-2026-05-15/* (renames from wiki/)

# Commit single-concern — git rename detection should kick in
git commit -m "chore(vault): radical archive wiki → 99-archive/wiki-pre-2026-05-15

Daniel CEO directive 2026-05-16 chat ACASĂ: \"REPARAM TOT, fara slips,
halucinatii, presupuneri, shortcuts. FULL ORDER.\"

Wiki layer (Karpathy Real Option B 3-layer 2026-05-11 → 2026-05-15)
moved physic to off-default-search-path archive. Esenta preserved fizic
(Daniel verbatim Categorii DA-DF + Bugatti framing + slip pattern history
+ voice preservation + daniel-isms catalog). Active SSOT decizii post-reglaj
= DECISIONS.md singular live + ANDURA_PRIMER.md briefing fresh chat.

~140 files renamed via git mv preserve history rename detection.

DECISIONS.md cross-refs spre wiki/ swap urmează în TASK 3 separate atomic commit.

ZERO src/ touched. Tests 3734 PASS preserved EXACT.

🦫 Bugatti craft. FULL ORDER once-and-done."

git push origin feature/v2-vanilla-port
```

---

## §5 Status output în `📤_outbox/LATEST.md` § structured TASK 2 raport

Update `📤_outbox/LATEST.md` ca raport intermediar TASK 2:

```
# LATEST — TASK 2 of 3 Radical Archive Wiki LANDED 2026-05-16

## Task
TASK 2 of 3 — Radical archive wiki/ → 99-archive/wiki-pre-2026-05-15/

## Status: COMPLETE

## Pre-flight
- Backup tag pre-radical-archive-wiki-2026-05-16 pushed origin ✓
- Working tree clean (post TASK 1) ✓
- Tests 3734 PASS pre-execute ✓
- wiki/ verified existence + ~140 files ✓
- 99-archive/ verified non-existence ✓

## Modificare
- NEW dir: 99-archive/
- NEW file: 99-archive/README.md (purpose + authority)
- MOVE: wiki/ → 99-archive/wiki-pre-2026-05-15/ (~140 files git mv preserve history)

## Build+Tests
- Build: clean (no broken imports referencing wiki/)
- Tests: 3734 PASS preserved EXACT
- ZERO src/ touched (vault meta-tooling only)

## Commits
- <SHA> | chore(vault): radical archive wiki → 99-archive/wiki-pre-2026-05-15
- ~140 files renamed via git mv + 1 new README

## Pushed
feature/v2-vanilla-port pushed origin ✓

## Issues
None.

## Next action
TASK 3 of 3 → DECISIONS.md + INDEX_MASTER cross-refs sweep wiki/* → 99-archive/wiki-pre-2026-05-15/*
```

---

## §6 HARD CONSTRAINTS verify

- ✅ ZERO src/ touched (vault meta-tooling only)
- ✅ Single-concern atomic commit Bugatti (archive move, NU bundled cu cross-refs)
- ✅ Backup tag pushed origin pre-execute
- ✅ Tests 3734 PASS preserved EXACT
- ✅ git mv preserve history rename detection (NU shell mv)
- ✅ Esența preserved fizic (zero content modification)

---

🦫 **TASK 2 of 3. Radical archive once-and-done. Bugatti craft. Esența preserved fizic off-default-search-path. FULL ORDER vault clean.**
