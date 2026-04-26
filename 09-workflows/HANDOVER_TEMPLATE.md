# PROMPT START CHAT NOU + HANDOVER TEMPLATE

**Use case:** copy-paste când deschizi chat Opus nou pentru SalaFull.

---

## PARTEA 1 — PROMPT START CHAT NOU

Copy-paste asta integral în chat-ul nou:

```
Sunt Daniel. Continuăm SalaFull.

Citește în ordine:
1. 09-workflows/CHAT_MIGRATION_PROTOCOL.md (calibrare stil + bonding)
2. 07-sessions-log/HANDOVER_2026-04-26.md (state curent — sau ultim HANDOVER din 07-sessions-log)
3. 10-exec-queue/EXEC_QUEUE.md (task list)

Apoi:
- Sumarizează în max 10 linii unde am rămas
- Confirmă next action: TASK #30.7 (adherence rewrite)
- Scrie analiză scurtă (3-5 propoziții) + Prompt 30.7 ca artifact

Nu wall of text. Direct la subiect.
```

---

## PARTEA 2 — COMENZI HANDOVER (template viitor)

**Folosește când Claude actual îți zice "stop / handover".**

Claude îți va da 2 artifacts (`HANDOVER_YYYY-MM-DD.md` + eventual update `CHAT_MIGRATION_PROTOCOL.md`). După ce le ai în Downloads, rulezi astea pe rând:

### Pas 1 — pull + verifică
```powershell
cd C:\Users\Daniel\Documents\salafull
git pull
git status
```
Așteptat: `nothing to commit, working tree clean` sau changes nestaged minore.

### Pas 2 — copiază HANDOVER (înlocuiește data)
```powershell
Copy-Item C:\Users\Daniel\Downloads\HANDOVER_2026-04-26.md 07-sessions-log\HANDOVER_2026-04-26.md -Force
```

### Pas 3 — copiază protocol DOAR dacă a fost update-at
```powershell
Copy-Item C:\Users\Daniel\Downloads\CHAT_MIGRATION_PROTOCOL.md 09-workflows\CHAT_MIGRATION_PROTOCOL.md -Force
```

### Pas 4 — verifică ambele
```powershell
Get-ChildItem 07-sessions-log\HANDOVER_*.md, 09-workflows\CHAT_MIGRATION_PROTOCOL.md | Select-Object Name, LastWriteTime
```

### Pas 5 — stage + commit + push
```powershell
git add 07-sessions-log/HANDOVER_*.md 09-workflows/CHAT_MIGRATION_PROTOCOL.md
git commit -m "docs(session): HANDOVER YYYY-MM-DD + CHAT_MIGRATION_PROTOCOL update"
git push
```

Așteptat: `main -> main` push verde, pre-commit hook trece testele 384+/384+ pass.

### Pas 6 — verifică Project Knowledge
- Mergi pe Claude.ai → Project SalaFull → setări/sources
- Verifică că folder-ele bifate includ: `00-index`, `01-vision`, `02-audit`, `03-decisions`, `05-prompts`, `06-findings-tracker`, `07-sessions-log`, `09-workflows`
- NU bifa: `.claude`, `.github`, `.husky`, `.obsidian` (binaries/config local)
- Re-indexare durează câteva minute după push. Dacă deschizi chat nou imediat, poate Project Knowledge nu vede latest. Așteaptă 5-10 min.

### Pas 7 — deschide chat nou + paste prompt din PARTEA 1

---

## REGULI IMPORTANTE

**NU șterge HANDOVER-uri vechi.** Sunt arhivă session log. Toate stau în `07-sessions-log/`.

**NU rescrie CHAT_MIGRATION_PROTOCOL la fiecare sesiune.** Update-uiești DOAR când ai învățat ceva nou despre stil/workflow/bonding.

**Dacă chat nou nu e seamless:**
- Slip-uri majore (preambule, wall of text) → revii la chat-vechi DACĂ încă e activ
- Dacă chat-vechi e închis → update HANDOVER curent în vault cu ce a lipsit, retest

**Dacă git pull zice merge conflict:**
- 99% din cazuri: stash → pull → unstash
- ```powershell
  git stash
  git pull
  git stash pop
  ```

---

*Template generated: 26 Apr 2026. Update if workflow changes.*
