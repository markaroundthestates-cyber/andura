# PROMPT CC HYGIENE — Opus Autonomous

**Cum folosești:**
1. Daniel uploadează artefacte în `📥_inbox/`
2. Daniel commit + push
3. Daniel rulează `/model opus` în CC
4. Daniel paste tot conținutul de mai jos (de la `══` în jos)
5. Opus execută autonomous, raport final în chat + `📤_outbox/`

---

═══ START PROMPT ═══

# OPUS AUTONOMOUS — Vault Hygiene + Inbox Processing

**Owner:** Daniel (CEO + Product). Tu = Co-CTO frate, autonomous.
**Working dir:** `/workspaces/salafull`
**Goal:** Procesează `📥_inbox/`, integrează în vault SSOT, igienizează, raport în `📤_outbox/`.

## 0. PRE-FLIGHT MANDATORY

```bash
cd /workspaces/salafull
git pull origin main
cat VAULT_RULES.md   # Citește integral — reguli authoritative
ls 📥_inbox/         # Vezi ce-a uploadat Daniel
ls 📤_outbox/        # Vezi numerotare existentă (pentru next number)
```

**Citește `VAULT_RULES.md` integral înainte de orice acțiune.** Acolo sunt:
- Structura vault (§1)
- SSOT files lock-uite (§2)
- Reguli permanente (§3)
- Workflow (§4)
- Safety net (§5)
- Anti-patterns (§6)

## 1. PROCESARE 📥_inbox/

Pentru FIECARE fișier din `📥_inbox/` (excluding `.gitkeep`):

### 1.1 Identifică tipul

Citește fișierul. Determină tip:
- **VAULT_RULES.md / PROMPT_CC_HYGIENE.md** → mută la root (acestea-s system files)
- **HANDOVER_*.md** → integrează în `06-sessions-log/HANDOVER_GLOBAL_*.md` (update-in-place)
- **ADR_*.md / ADR amendment** → merge inline în ADR existent (NU fișier separat) sau ADR nou în `03-decisions/`
- **SPEC_*.md / architecture** → fișier nou în `04-architecture/` sau update existing
- **PROMPT_*.md (CC)** → execută conform conținut, apoi delete (one-shot)
- **PRODUCT_STRATEGY update** → update-in-place în `01-vision/PRODUCT_STRATEGY_SPEC_v1.md`
- **Findings / insights** → integrează în `05-findings-tracker/FINDINGS_MASTER.md` sau `INSIGHTS_BACKLOG.md`
- **Other** → flag în raport, decide pe baza conținut

### 1.2 Aplică reguli VAULT_RULES.md §3

- §3.1 Update-in-place > create-new
- §3.2 Un HANDOVER_GLOBAL activ
- §3.3 Reports → `cc-reports/`
- §3.4 1 topic = 1 fișier
- §5 Safety net înainte de DELETE

### 1.3 ȘTERGE fișierul din 📥_inbox/ după procesare

```bash
rm "📥_inbox/<filename>"
```

Excepție: dacă fișierul e VAULT_RULES.md sau PROMPT_CC_HYGIENE.md → `git mv` la root, NU rm.

## 2. VAULT HYGIENE PASS

După ce 📥_inbox/ e procesat, fă sweep hygiene:

### 2.1 Scan duplicate

```bash
# Verifică dacă există handover-uri multiple în 06-sessions-log/
ls 06-sessions-log/HANDOVER*

# Verifică dacă există ADR amendments ca fișiere separate (anti-pattern)
ls 03-decisions/*AMENDMENT*

# Verifică dacă există DEPRECATED markers
grep -rn "DEPRECATED\|SUPERSEDED" --include="*.md" .
```

### 2.2 Acțiuni automatic

- **Multiple handover-uri:** consolidează în 1, păstrează cel cu data cea mai recentă, archive restul în `📤_outbox/NN_HANDOVERS_ARCHIVED.md`
- **ADR amendment files separate:** merge inline în ADR original, delete amendment file
- **DEPRECATED files:** verify dacă info migrat, dacă da → DELETE, dacă nu → MERGE → DELETE

### 2.3 Path references sweep

```bash
# Verifică referințe path stale (post-rename folders, etc.)
grep -rn "06-findings-tracker\|07-sessions-log\|08-meta\|09-workflows\|05-prompts\|10-exec-queue\|docs/" --include="*.md" . | grep -v "cc-reports/"
```

Dacă output non-empty → corectează cu `sed` per VAULT_RULES.md §1 structure.

## 3. RAPORT 📤_outbox/

### 3.1 Determină număr next

```bash
ls 📤_outbox/ | grep -oP '^\d+' | sort -n | tail -1
```

Next number = highest + 1 (formatat 2 digits: 01, 02, ..., 10, 11).

### 3.2 Scrie raport

`📤_outbox/<NN>_<TASK_NAME_SHORT>.md`:

```markdown
# Outbox Report <NN> — <Task Name>

**Status:** Complete | Issues
**Date:** YYYY-MM-DD HH:MM
**Run wall-clock:** <X> min
**Files processed from 📥_inbox/:** <count>

## Acțiuni executate

### Inbox processing
- `<filename>` → <action: integrat în X / mutat la root / executat / etc.> → DELETED
- ...

### Vault hygiene
- <duplicate found / merged / cleanup action>
- ...

### Path references sweep
- <X stale references corrected> | None found

## Modificări vault

| Fișier | Acțiune | Detalii |
|--------|---------|---------|
| ... | UPDATE / CREATE / DELETE / MERGE | ... |

## Issues / Ambiguities

- <flagged ambiguities, NU rezolvate unilateral> | None

## Tests

- Tests: <X/Y passed> | Skipped (no code touched)

## Commits

- `<sha>` <commit message>

## Next actions pentru Daniel

- <orice flagged ambiguity needing decision>

🦫
```

### 3.3 Cleanup 📤_outbox/ FIFO

Păstrează ultimele 5 rapoarte. Dacă `<NN>` >= 6:

```bash
# Șterge raportul cu (NN - 5)
ls 📤_outbox/ | grep -oP '^\d+' | sort -n | head -n -5 | while read num; do
  rm "📤_outbox/$(ls 📤_outbox/ | grep "^$num")"
done
```

## 4. COMMITS

Commit per categorie acțiune (NU un mega-commit):

```bash
# Inbox processing
git add -A 📥_inbox/ <files-modified-by-inbox>
git commit -m "feat(vault): process 📥_inbox — integrate <X> artifacts into SSOT"

# Hygiene
git add -A
git commit -m "chore(vault): hygiene pass — <duplicates removed / paths corrected>"

# Outbox report
git add -A 📤_outbox/
git commit -m "docs(outbox): <NN>_<task_name> report"

git push origin main
```

## 5. STOP CONDITIONS

- NU șterge fișiere din SSOT lock list (VAULT_RULES.md §2)
- NU atinge `src/`, `tests/`, `scripts/`, configs
- Dacă fișier `📥_inbox/` ambiguu → flag în raport, NU procesa unilateral
- NU întreba Daniel — decide tu, raport la final
- ZERO information loss principle absolut

## 6. VERIFY POST-RUN

```bash
ls 📥_inbox/   # Expected: empty (only .gitkeep)
ls 📤_outbox/  # Expected: ≤5 reports + .gitkeep
git log --oneline -10
git status     # Expected: clean
npm run test:run  # Expected: 752/752 (sau current baseline)
```

═══ END PROMPT ═══

---

## NOTE PENTRU DANIEL

**Când să rulezi:**
- După ce uploadezi 1+ fișiere în `📥_inbox/`
- Periodic preventiv (săptămânal) chiar dacă inbox e gol — face hygiene sweep
- Post sesiune chat majoră (cleanup duplicate inevitabile)

**Costuri:**
- Token usage Opus: moderate (citește VAULT_RULES + inbox + cross-refs)
- Wall-clock: 5-15 min typical
- Plan x20 reset 5h reduce concern

**Dacă Opus eșuează:**
- Verifică raport în `📤_outbox/` ultimul → vezi unde s-a oprit
- Verifică `git status` → vezi ce e necomitat
- Re-run prompt (idempotent — Opus reia de unde s-a oprit)
