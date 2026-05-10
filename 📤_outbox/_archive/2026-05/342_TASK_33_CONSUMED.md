# TASK 33 — PR Wall Scope Clarify Recovery

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous (scope verify recovery)
**Cluster:** Standalone 6 features recovery · Atom 2/6
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte 6 features recovery — existing prod `src/pages/coach/pr.js` `togglePRWall` / `renderPRWall`

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify PR Wall existing prod
grep -niE "togglePRWall|renderPRWall|extractAndSavePRs|pr-records|PR.*Wall" src/pages/coach/pr.js | head -20

# Verify mockup × 4 PR Wall representation
for skin in clasic living-body luxury brain-coach; do
  grep -niE "PR.Wall|record personal|recorduri|PR-uri" 04-architecture/mockups/andura-$skin.html | head -5
done
```

---

## §1 Scope

Verify PR Wall feature existing prod (`src/pages/coach/pr.js`) + mockup representation × 4. NU additive, scope clarify recovery.

**Existing prod feature:**
- `extractAndSavePRs()` — extract personal records logs
- `togglePRWall()` — expand/collapse top 3 → all entries
- `renderPRWall()` — render entries cu kg + reps + date
- Empty state "Niciun record personal încă"

**Acțiuni:**
1. Verify mockup × 4 PR Wall present (sau Theme Parity gap → Task 22)
2. Spec V2 doc dacă needed
3. NU code modification

---

## §2 Files modify

ZERO src changes. Possibly mockup × 4 dacă missing.

---

## §3 Acceptance criteria

1. ✅ Prod PR Wall verified existing
2. ✅ Mockup × 4 representation status flagged
3. ✅ Tests 2731 PASS preserved EXACT
4. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task33-prwall-scope-clarify-$(date +%Y-%m-%d-%H%M)
git push origin pre-task33-prwall-scope-clarify-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (dacă applicable)

```
docs(features-recovery): PR Wall scope clarify V2 spec

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery preserved.

PR Wall verified existing prod src/pages/coach/pr.js (togglePRWall/renderPRWall).
Mockup × 4 representation status flagged.

Standalone Task 33/N Phase 2 orchestrator (atom 2/6 features recovery).
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport `📤_outbox/LATEST.md`

```
## TASK 33 — PR Wall Scope Clarify Recovery

- **Model:** Opus
- **Status:** Complete (scope verify)
- **Pre-flight:** <prod verified + mockup × 4 status>
- **Mockup × 4:** <PARITY / GAP>
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Next action:** TASK 34 (Photo progress body scope clarify recovery)
```
