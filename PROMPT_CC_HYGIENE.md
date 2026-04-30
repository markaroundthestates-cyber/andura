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
cat VAULT_RULES.md             # Citește integral — reguli authoritative
ls 📥_inbox/                   # Vezi ce-a uploadat Daniel
ls 📤_outbox/                  # Expected: LATEST.md + _archive/ + .gitkeep
ls 📤_outbox/_archive/         # Vezi luni existente (YYYY-MM/)
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
- §3.3 Reports → `📤_outbox/LATEST.md` + archive (NU `cc-reports/` — deprecated)
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

- **Multiple handover-uri:** consolidează în 1, păstrează cel cu data cea mai recentă, archive restul în raport `📤_outbox/LATEST.md`
- **ADR amendment files separate:** merge inline în ADR original, delete amendment file
- **DEPRECATED files:** verify dacă info migrat, dacă da → DELETE, dacă nu → MERGE → DELETE

### 2.3 Path references sweep

```bash
# Verifică referințe path stale (post-rename folders, etc.)
grep -rn "06-findings-tracker\|07-sessions-log\|08-meta\|09-workflows\|05-prompts\|10-exec-queue\|docs/" --include="*.md" . | grep -v "cc-reports/"
```

Dacă output non-empty → corectează cu `sed` per VAULT_RULES.md §1 structure.

## 3. RAPORT — schema LATEST.md + archive lunar

### 3.1 Move existing LATEST.md → archive

```bash
# Determine current month folder
MONTH=$(date +%Y-%m)
mkdir -p "📤_outbox/_archive/$MONTH"

# Determine next NN number (continuă din întreaga arhivă, NU reset lunar)
NEXT_NN=$(find "📤_outbox/_archive/" -name "*.md" -type f | \
  grep -oE '/[0-9]+_' | grep -oE '[0-9]+' | sort -n | tail -1 | \
  awk '{printf "%02d", $1+1}')

# Dacă _archive/ e gol, start de la 06 (post-migration baseline)
if [ -z "$NEXT_NN" ] || [ "$NEXT_NN" = "00" ]; then
  NEXT_NN="06"
fi

# Move LATEST.md curent în archive (dacă există și NU e placeholder)
if [ -f "📤_outbox/LATEST.md" ] && ! grep -q "Empty (no recent CC run output)" "📤_outbox/LATEST.md"; then
  TASK_NAME=$(grep -m1 "^# " "📤_outbox/LATEST.md" | sed 's/^# //; s/[^a-zA-Z0-9]/_/g; s/__*/_/g; s/^_//; s/_$//' | head -c 50)
  git mv "📤_outbox/LATEST.md" "📤_outbox/_archive/$MONTH/${NEXT_NN}_${TASK_NAME}.md"
fi
```

### 3.2 Scrie raport nou ca LATEST.md

`📤_outbox/LATEST.md`:

```markdown
# <Task Name>

**Status:** Complete | Issues
**Date:** YYYY-MM-DD HH:MM
**Run wall-clock:** <X> min
**Model:** Opus | Sonnet

## Pre-flight
...

## Modificări
...

## Build + Tests
...

## Commits
- `<sha>` <commit message>

## Pushed: ✅ origin/main

## Issues / Ambiguities
...

## Next action Daniel
...

🦫
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

# Outbox report (LATEST + archive update)
git add -A 📤_outbox/
git commit -m "docs(outbox): <task_name> report (LATEST + archive update)"

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
ls 📥_inbox/                   # Expected: empty (only .gitkeep)
ls 📤_outbox/                  # Expected: LATEST.md + _archive/ + .gitkeep
ls 📤_outbox/_archive/         # Expected: <YYYY-MM>/ folder(s)
git log --oneline -10
git status                     # Expected: clean
npm run test:run               # Expected: 752/752 (sau current baseline)
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

---

## 7. HANDOVER INGESTION DIFF PROTOCOL — MANDATORY

**Trigger:** orice operație care overwrite SSOT existent (`06-sessions-log/HANDOVER_GLOBAL_*.md`, ADR-uri, PRODUCT_STRATEGY, COGNITIVE_ARCHITECTURE, etc).

**De ce există:** chat strategic generator (Claude) NU poate citi 700+ linii integral cu fidelitate când scrie paralel. Search per secțiune → sumarizare → pierde nuanțe (tabele, liste DO/DON'T, paragrafe specifice). Slip real 30 apr: halucinare handover prin search section-by-section → tabel competition matrix 6×5 + DO/DON'T list pierdut. Salvat doar prin diff retroactiv. Codificare obligatorie.

### Protocol pre-overwrite (NU SKIPABIL)

1. **READ vechi integral** (NU sumarizare, NU search per secțiune — `cat <ssot_path>` complete output)
2. **READ nou integral** (input din `📥_inbox/<file>`)
3. **DIFF semantic section-by-section:**
   - Pentru fiecare `## §X` în vechi → caută match exact sau semantic în nou
   - Pentru fiecare tabel, listă, code block în vechi → caută în nou
4. **FLAG missing content în `📤_outbox/DIFF_FLAGS.md`** (toate flag-urile, NU stop la primul):
   - Per finding: `§<section> | <type: tabel/listă/paragraf> | <summary scurt> | <action propus: PRESERVE/DROP/MERGE>`
   - Format: o linie per finding. Diff complet rulează până la final.
5. **STOP după diff complet. NU overwrite.** Raportez count flags + lista. Aștept Daniel decision per flag (A=preserve, B=drop, C=merge).
6. **Apply Daniel decisions** post-confirm.
7. **THEN overwrite + archive vechi** (NICIODATĂ DELETE — `git mv` la `📤_outbox/_archive/<YYYY-MM>/NN_HANDOVER_OLD_<date>.md`).

### Stop conditions

- Dacă `DIFF_FLAGS.md` există deja la start (flags pending) → STOP, refuz overwrite, raportez "flags pending Daniel decision".
- Dacă diff produce flags multiple → raportez count + lista, Daniel decide dacă merită re-generate handover sau processed individual (NU threshold numeric arbitrar — flags MERGE legitime la restructurare conștientă diferă de flags DROP la pierdere conținut).
- Dacă vechi NU există → safe, NU diff needed (initial creation).

### Cross-references

- §HANDOVER_PROTOCOL în `VAULT_RULES.md` (handover flow Daniel ↔ Claude ↔ CC Opus)
- §5 Safety net VAULT_RULES.md

---

## 8. DESTRUCTIVE OPS CHECKLIST — MANDATORY

**Trigger:** orice prompt cu operații destructive multiple sau de risc înalt:
- `git rm` (orice file)
- `git mv` cross-folder (vault hygiene)
- `git push --force` / `--force-with-lease`
- `rm -rf` (orice path)
- Overwrite SSOT (`HANDOVER_GLOBAL`, ADR, vision docs)
- Schema migration runner (DB transformations)
- Mass replace (`sed -i` / find+replace > 5 files)

**De ce există:** Daniel obosit la 02:00 + Claude obosit = ambii ratăm bug-uri în prompts CC. Slip potențial 30 apr: prompts cu force-push catastrofic, archive ÎNAINTE de diff, `git mv` silent fail Windows + emoji paths. Daniel a prins cu vigilență. Procesul trebuie fool-proof, NU Daniel-proof.

### Protocol pre-execution (CC Opus/Sonnet aplică)

Înainte de a executa OP destructiv, CC raportează:

```
## DESTRUCTIVE OP CHECK
- Op: <git rm / git mv / overwrite / push --force / etc>
- Target: <exact file/path/branch>
- Backup tag: <git tag name created pre-op>
- Reversible: <YES via tag / NO permanent loss>
- Confirm: <executing>
```

### Rules

1. **Backup tag obligatoriu** înainte de orice op destructiv (`git tag pre-<op-name>-<date>` + `git push origin <tag>`).
2. **Force-push INTERZIS** fără explicit Daniel approval în prompt original ("force-push autorizat: YES").
3. **`git mv` cross-folder cu emoji paths** (`📥_inbox/`, `📤_outbox/`) — verify post-move cu `ls` ambele paths (silent fail Windows posibil).
4. **Overwrite SSOT** trece prin §7 DIFF Protocol (NU skip).
5. **Mass replace** cu count check pre/post (`grep -c <pattern>` înainte și după, raport diff).
6. **Stop la prima eroare** — NU continue cu next op dacă curent fail (rollback via backup tag).

### Stop conditions

- Lipsă backup tag → STOP, create + retry.
- Force-push fără explicit approval → STOP, raportez Daniel.
- Silent fail detectat (mv reușit dar file nu apare la destinație) → STOP, restore din pre-tag.

### Cross-references

- §5 Safety net VAULT_RULES.md
- §7 DIFF Protocol (handover-specific case)
