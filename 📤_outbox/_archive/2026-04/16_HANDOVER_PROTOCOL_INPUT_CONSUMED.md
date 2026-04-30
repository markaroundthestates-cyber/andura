# HANDOVER_PROTOCOL §X — INPUT pentru VAULT_RULES.md

**Type:** Input pentru CC Sonnet — adaugă secțiune nouă în VAULT_RULES.md la final.
**Daniel pune în:** `📥_inbox/HANDOVER_PROTOCOL_INPUT.md`
**Comandă CC:** vezi `## PROMPT CC` la finalul fișierului.

---

## Conținut secțiune nouă pentru VAULT_RULES.md

Adaugă la sfârșitul fișierului (înainte de orice `🦫` final dacă există):

```markdown
---

## §HANDOVER_PROTOCOL — Cross-session continuity & saturation prevention

**Status:** Locked (introdus 2026-04-30, post-saturation incident chat strategic).
**Authority:** SSOT pentru handover flow Daniel ↔ Claude chat ↔ CC Opus.

### Why this protocol exists

Sesiuni Claude chat strategic se saturează după 3-5h conversație complexă. Saturarea = bandwidth degradat → halucinații flow procedural (NU conținut). Pe 30 apr 2026, saturarea a produs 3 iterații consecutive halucinate în scrierea handover-ului → vault contaminat → recovery audit + fix run + 7 commits.

**Anti-recurrence:** acest protocol formalizează când + cum se scrie handover, ca să **NU** mai fie scris cu bandwidth scăzut.

### Principle: Continuous over end-of-session

Handover **NU** e document scris la finalul sesiunii dintr-o singură bucată. Handover = **aggregate al deciziilor marcate progresiv** pe parcursul sesiunii, când Claude e fresh. La handover-time, Claude doar structurează aggregate-ul deja existent în memoria conversațională, NU re-creează tot din memoria saturată.

### Self-monitoring transparent (Claude responsibility)

La fiecare 5-7 mesaje grele SAU când Claude detectează degradare, raportează în răspunsul curent 1 linie scurtă:

```
Bandwidth: ~X% remaining, OK încă Y mesaje grele.
```

SAU când e timpul:

```
Bandwidth: ~25% — recomand handover ACUM, încă-s fresh.
```

NU întrerupe flow. NU întreabă. Doar raportare. Daniel decide acționează sau ignoră.

### Decision logging silent (Claude responsibility)

Când Daniel zice ceva care e **decizie LOCKED cu impact vault** (D-N routing, ADR new, scope changes, pricing, positioning), Claude **mental marchează** și păstrează running log intern progresiv în sesiune. NU generează artefact mic la fiecare decizie (overhead Daniel = anti-pattern).

La handover-time: handover = aggregate al deciziilor marcate mental când fresh.

### Handover flow (când e timpul)

**Trigger:** Bandwidth ~25-30% remaining SAU Daniel decide explicit "scriem handover".

**Steps:**

1. **Claude chat strategic** scrie handover comprehensive ca artefact descărcabil (`HANDOVER_INPUT_<topic>.md`)
2. **Daniel** drag în `📥_inbox/`
3. **Daniel** rulează prompt CC scurt pentru ingest (vezi §INGEST_PROMPT)
4. **CC Opus** citește input + active SSOT din `06-sessions-log/HANDOVER_GLOBAL_<date>_<period>.md`
5. **CC Opus** merge ambele în 1 versiune unique (zero info loss)
6. **CC Opus** overwrite SSOT same name cu merged version
7. **CC Opus** archive input la `📤_outbox/_archive/<YYYY-MM>/NN_HANDOVER_INPUT_CONSUMED.md` (NICIODATĂ DELETE)
8. **CC Opus** scrie raport execution în `📤_outbox/LATEST.md`
9. **CC Opus** generează alignment questions pentru chat nou (în `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`)
10. **CC Opus** commit + push origin/main
11. **Daniel** sync Project Knowledge GitHub
12. **Daniel** open chat Claude nou
13. **Daniel** paste alignment questions primul mesaj
14. **Chat nou** răspunde cu citation `§X file.md / ADR Y` → pass criteria ≥12/15

### Constraints absolute

- **Inbox = strict input Daniel only.** CC Opus NICIODATĂ NU scrie în inbox (excepție: alignment questions output post-ingest, conform step 9).
- **Zero info loss.** Toate input-urile inbox archive-uite în outbox post-consume, NICIODATĂ delete fizic.
- **Backup tag git** pre-cleanup major obligatoriu (`pre-handover-merge-<date>` sau similar).
- **NU** scrie handover dintr-o bucată la final sesiune saturată. Aggregate progresiv.
- **NU** sări peste alignment questions verify în chat nou — fără verificare = risc continuare cu drift.

### Stop conditions

- Dacă Claude chat e saturat <30% bandwidth dar Daniel cere handover comprehensive → Claude flag explicit "saturat, recomand chat nou pentru scriere handover, NU aici".
- Dacă alignment questions <12/15 în chat nou → INGEST FAIL, retry `project_knowledge_search` în chat sau regenerare questions.
- Dacă merge conflict pre-existent în vault → STOP, Daniel manual resolve, NU CC override automat.

### Cross-references

- §3.3 outbox schema (LATEST.md + _archive/<YYYY-MM>/NN_*.md cronologic continuu)
- §INBOX_FLOW (Daniel input only)
- `PROMPT_CC_HYGIENE.md` §3.2 raport format expected

🦫 **Handover protocol locked. Anti-saturation enforced. Vault hygiene preserved.**
```

---

## Conținut prompt CC reusable scurt — §INGEST_PROMPT

Adaugă la finalul VAULT_RULES.md (după §HANDOVER_PROTOCOL) sau ca fișier separat la root: `PROMPT_CC_INGEST_HANDOVER.md`.

**Recomandare:** fișier separat root → mai ușor de găsit + copy când trebuie.

```markdown
# PROMPT CC — INGEST HANDOVER

**Use:** Daniel rulează când a pus handover NEW în `📥_inbox/`. CC Opus ingest per VAULT_RULES §HANDOVER_PROTOCOL automat.

**Model:** 🔴 OPUS (vault-wide merge SSOT = Opus zone)

**Tu tastezi în CC:**

\`\`\`
/model opus
\`\`\`

**Apoi paste integral între markeri:**

═══════════════════════════════════════════════════════════════════
                  START PROMPT — INGEST HANDOVER
═══════════════════════════════════════════════════════════════════

# TASK: Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL

**Action:**
1. Pre-flight: git pull, status clean, baseline tests PASS, backup tag pre-merge.
2. Identify input file în `📥_inbox/HANDOVER_INPUT_*.md` (sau similar).
3. Read input + active SSOT `06-sessions-log/HANDOVER_GLOBAL_<latest>.md`.
4. Merge ambele în 1 versiune unique zero info loss → overwrite SSOT same name.
5. Archive input la `📤_outbox/_archive/<YYYY-MM>/NN_HANDOVER_INPUT_CONSUMED.md` (next NN).
6. Generate alignment questions (10-15 adversarial cu citation §X expected) → `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`.
7. Rotate previous LATEST.md → archive cu next NN.
8. Write raport execution în `📤_outbox/LATEST.md` per PROMPT_CC_HYGIENE §3.2.
9. Commits granulare (merge SSOT + archive input + alignment + raport) + push origin/main.

**Constraints:** per VAULT_RULES §HANDOVER_PROTOCOL — zero info loss, NO delete, backup tag obligatoriu, baseline tests unchanged.

**Output expected:** raport `📤_outbox/LATEST.md` cu summary modificări + commits SHA + push confirm + next action Daniel (sync + chat nou + alignment questions).

═══════════════════════════════════════════════════════════════════
                  END PROMPT — INGEST HANDOVER
═══════════════════════════════════════════════════════════════════
```

---

## PROMPT CC — Apply this artefact to vault

**Model:** 🟢 **SONNET** (mecanic clear scope, 2 fișiere, append-only)

**Tu tastezi în CC:**

```
/model sonnet
```

**Apoi paste integral între markeri:**

═══════════════════════════════════════════════════════════════════
              START PROMPT — APPLY HANDOVER_PROTOCOL
═══════════════════════════════════════════════════════════════════

# TASK: Apply HANDOVER_PROTOCOL section to VAULT_RULES + create reusable ingest prompt

## Pre-flight

```powershell
cd C:\Users\Daniel\Documents\salafull
git pull origin main
git status   # expect clean
```

## Step 1 — Read input

```powershell
cat "📥_inbox/HANDOVER_PROTOCOL_INPUT.md"
```

## Step 2 — Append §HANDOVER_PROTOCOL section to VAULT_RULES.md

Open `VAULT_RULES.md` end-of-file. Append integral conținutul secțiunii `## §HANDOVER_PROTOCOL — Cross-session continuity & saturation prevention` din input file (de la `## §HANDOVER_PROTOCOL` până la `🦫 **Handover protocol locked...`).

**NU modifica** alte secțiuni VAULT_RULES.md existente. Doar append la final.

## Step 3 — Create reusable ingest prompt

Create new file: `PROMPT_CC_INGEST_HANDOVER.md` la root vault (alongside VAULT_RULES.md).

Conținut: integral block-ul `# PROMPT CC — INGEST HANDOVER` din input file (de la `# PROMPT CC — INGEST HANDOVER` până la `END PROMPT — INGEST HANDOVER`).

## Step 4 — Archive input

Move `📥_inbox/HANDOVER_PROTOCOL_INPUT.md` → `📤_outbox/_archive/2026-04/<next-NN>_HANDOVER_PROTOCOL_INPUT_CONSUMED.md`.

```powershell
$nextNN = "<determinat din ls archive>"
git mv "📥_inbox/HANDOVER_PROTOCOL_INPUT.md" "📤_outbox/_archive/2026-04/${nextNN}_HANDOVER_PROTOCOL_INPUT_CONSUMED.md"
```

## Step 5 — Verify baseline

```powershell
npm run test:run   # expect 752/752 PASS unchanged
```

## Step 6 — Commits + push

```powershell
git add VAULT_RULES.md
git commit -m "feat(rules): §HANDOVER_PROTOCOL — cross-session continuity + saturation prevention"

git add PROMPT_CC_INGEST_HANDOVER.md
git commit -m "feat(vault): PROMPT_CC_INGEST_HANDOVER reusable prompt for Opus auto-ingest"

git add "📤_outbox/_archive/2026-04/<NN>_HANDOVER_PROTOCOL_INPUT_CONSUMED.md"
git commit -m "chore(outbox): archive HANDOVER_PROTOCOL input post-apply"

git push origin main
```

## Step 7 — Rotate LATEST + write raport

Move `📤_outbox/LATEST.md` curent → archive cu next NN. Write new LATEST.md cu raport scurt:

- Status Complete
- Modificări: VAULT_RULES.md §HANDOVER_PROTOCOL appended + PROMPT_CC_INGEST_HANDOVER.md created + input archived
- Tests: 752/752 PASS unchanged
- Commits: <SHAs> + push confirm
- Next action Daniel: NONE — protocol live, future handovers folosesc §INGEST_PROMPT din PROMPT_CC_INGEST_HANDOVER.md

## Constraints

- **NU modifica** secțiuni existente VAULT_RULES.md (doar append).
- **NU modifica** cod sursă.
- **NU șterge** input — archive only.
- Baseline tests 752/752 PASS unchanged.

═══════════════════════════════════════════════════════════════════
              END PROMPT — APPLY HANDOVER_PROTOCOL
═══════════════════════════════════════════════════════════════════
