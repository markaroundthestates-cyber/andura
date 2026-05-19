# PROMPT_CC_BATCH_04_HYGIENE_CLEANUP

**Model:** Opus
**Order:** 4/10
**Dependencies:** BATCH_01 + BATCH_02 + BATCH_03 complete (independent file scope, sequential per cluster)
**Scope:** Q8 + Q9 hygiene per ALIGNMENT_QUESTIONS — agenda cleanup + outbox status confirmation
**Estimate:** ~30-45min

---

## CONTEXT

Per ALIGNMENT_QUESTIONS Daniel responses:
- **Q8 ✅ NOT necessary** — dp.js cosmetic count discrepancy fix → SCOATE din next chat agenda (Chat E Q4 deja resolved categoric: 11 verdicte = 10 tranziție + 1 ON_TARGET stare neutră, summary 20 strings consistent).
- **Q9 ✅ Păstrat outbox** — `SPRINT_4X_FINAL_REPORT.md` rămâne read-only consolidated reference în `📤_outbox/`, NOT mutat la sessions-log.

---

## TASKS

### Task 4.1 — Confirm Q4 dp.js cosmetic resolved

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Search §36.58 (inventory dp.js strings) — verify cu `grep "11 verdicte" 06-sessions-log/HANDOVER_GLOBAL.md` și `grep "ON_TARGET" 06-sessions-log/HANDOVER_GLOBAL.md`.

If §36.58 already states clearly "11 verdicte categorical totale (10 tranziție + 1 ON_TARGET stare neutră), summary 20 strings dp.js" → NU modifica, doar add cross-ref entry confirmation.

If §36.58 ambiguous → add inline amendment:

```markdown
**Amendment 2026-05-02 (per ALIGNMENT_QUESTIONS Q8):** verdicte total = **11 categorical** (10 tranziție + 1 ON_TARGET stare neutră). Summary dp.js count rămâne **20 strings** (verdict + supporting + transitions + UI labels). NU discrepancy real — clarification doar.
```

---

### Task 4.2 — Confirm SPRINT_4X_FINAL_REPORT outbox status

**File:** `📤_outbox/SPRINT_4X_FINAL_REPORT.md`

Verify file exists: `ls 📤_outbox/SPRINT_4X_FINAL_REPORT.md`. Confirm commit hash `c283a81` în git log: `git log --oneline | grep c283a81`.

**NU mutat** la sessions-log per Q9. Append small footer la final fișier:

```markdown
---

**Status 2026-05-02:** Read-only consolidated reference. Păstrat `📤_outbox/` per ALIGNMENT_QUESTIONS Q9 Daniel response. NOT rotated archive (LATEST cycle), NOT mutat sessions-log. Future-reference cluster snapshot.
```

---

### Task 4.3 — Update next chat agenda în HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Search "next chat agenda" sau "next strategic chat" în file. Update sau append:

```markdown
### §36.65 NEXT CHAT AGENDA UPDATE 2026-05-02

Post ALIGNMENT_QUESTIONS Daniel responses — agenda revised:

**Removed (resolved/not necessary):**
- ❌ Q8 dp.js cosmetic count discrepancy fix (resolved Chat E Q4, 11 verdicte = 10+1 ON_TARGET, summary 20 OK)

**Confirmed deferred carry-overs:**
- Sprint UI Integration ~6-10h (post-3-ADR-LOCK ✅ + Firebase Auth solo Daniel)
- Manual exercise metadata audit ~2-3h (BATCH_05 acest cluster)
- Test coverage report (BATCH_07 acest cluster)
- Dependencies audit (BATCH_09 acest cluster)
- Build perf baseline (BATCH_10 acest cluster)

**Cumulative LOCKED count:** 60 → 60 (hygiene clarification, NU decizie nouă)
```

---

## VERIFICATION GATE

Pre-commit:
1. `grep "§36.65 NEXT CHAT AGENDA UPDATE" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match
2. `grep "Read-only consolidated reference" 📤_outbox/SPRINT_4X_FINAL_REPORT.md` → 1 match (footer added)
3. `npm test` → all pass (no test breakage from .md edits)

---

## COMMIT

```
git add 06-sessions-log/HANDOVER_GLOBAL.md 📤_outbox/SPRINT_4X_FINAL_REPORT.md
git commit -m "feat(batch-04): hygiene cleanup post ALIGNMENT_QUESTIONS Q8 + Q9

- Q8 dp.js cosmetic count: confirmed resolved Chat E Q4 (no fix needed)
- Q9 SPRINT_4X_FINAL_REPORT outbox status: read-only reference footer
- HANDOVER_GLOBAL §36.65 next chat agenda update"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_04_REPORT.md`:

```markdown
# BATCH_04_HYGIENE_CLEANUP — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- §36.58 dp.js cosmetic confirmed resolved (NU amendment needed sau inline clarification added)
- SPRINT_4X_FINAL_REPORT.md outbox footer added
- HANDOVER_GLOBAL §36.65 next chat agenda update

## Verification gate
- [✅/❌] grep §36.65: 1 match
- [✅/❌] grep outbox footer: 1 match
- [✅/❌] npm test: all pass

## Issues
<none / lista>

## Next batch
BATCH_05_EXERCISE_METADATA_AUDIT
```

Stop. Trigger BATCH_05.
