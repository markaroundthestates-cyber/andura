# Async Execution Protocol

## Overview

Daniel pune task-uri în `10-exec-queue/EXEC_QUEUE.md`. Claude Code le execută în ordine de prioritate și scrie rezultatele în `10-exec-queue/EXEC_RESULTS.md`. Push automat via hook Stop.

---

## Workflow

### 1. Daniel adaugă task

Editează `EXEC_QUEUE.md`, adaugă un bloc cu status `PENDING`. Exemplu minimal:

```
## TASK #5
**Priority:** HIGH
**Status:** PENDING
**Description:** Adaugă validare pentru inputul de greutate în logging.js
**Acceptance:** Build ✓, test:all baseline neschimbat, valoarea 0 sau negativă e respinsă cu toast
```

### 2. Trigger execuție

| Trigger | Efect |
|---------|-------|
| Daniel scrie **"check queue"** | Claude Code citește EXEC_QUEUE.md și execută tot ce e PENDING |
| Daniel scrie **"run task #N"** | Claude Code execută doar task-ul specificat |
| Daniel scrie **"night mode ON"** | Activează NIGHT MODE (vezi secțiunea de mai jos) |

### 3. Ordinea execuției

```
HIGH → MEDIUM → LOW
```

În cadrul aceleiași priorități: ordine numerică (TASK #1 înainte de TASK #2).

Dacă un task are `Dependencies: TASK #X` și TASK #X nu e DONE → se sare task-ul curent, se marchează `BLOCKED`, se trece la următorul.

### 4. Execuție task

1. Marchează task-ul `IN_PROGRESS` în EXEC_QUEUE.md
2. Execută conform `Description` și `Acceptance`
3. Verifică acceptance criteria (build, teste, comportament)
4. La succes: marchează `DONE` în EXEC_QUEUE.md
5. Scrie intrare în EXEC_RESULTS.md cu timestamp, fișiere schimbate, durată
6. Push automat via hook Stop

### 5. La eșec

- Marchează task-ul `FAILED` în EXEC_QUEUE.md
- Scrie cauza completă în EXEC_RESULTS.md (eroare, fișier, linie)
- Nu blochează execuția celorlalte task-uri — trece la next

---

## Status values

| Status | Semnificație |
|--------|-------------|
| `PENDING` | În așteptare |
| `IN_PROGRESS` | Se execută acum |
| `DONE` | Finalizat, acceptance criteria îndeplinite |
| `FAILED` | Eșuat — cauza în EXEC_RESULTS.md |
| `BLOCKED` | Dependency neîndeplinită |
| `SKIPPED` | Omis explicit (Daniel a marcat manual) |

---

## Silent mode (default)

Claude Code execută **fără prompts, fără confirmări, fără întrebări**.

- Zero `"Ești sigur că..."` sau `"Vrei să continui?"`
- Zero pauze intermediare pentru aprobare
- Dacă ceva e ambiguu: alege interpretarea cea mai conservatoare, marchează în Results

Excepție: dacă task-ul cere explicit `[CONFIRM]` în description.

---

## NIGHT MODE

### Activare

```
Daniel: "night mode ON"
```

sau task cu tag `[NIGHT]` în description.

### Dezactivare

```
Daniel: "night mode OFF"
```

sau la finalul sesiunii (nu persistă între conversații).

### Comportament NIGHT MODE

- **Zero întrebări** — nici măcar pentru edge cases
- **Zero pauze** — nu așteaptă feedback intermediar
- **Execuție continuă** — procesează toate task-urile PENDING din queue de sus până jos
- **La blocker**: marchează `FAILED` + descrie cauza în max 3 linii → trece la next task imediat
- **La ambiguitate**: alege varianta care nu distruge date existente, notează alegerea în Results
- **La test failure neașteptat**: STOP pe task-ul curent (marchează FAILED), dar continuă cu restul queue-ului

### Ce NU face în NIGHT MODE

- Nu face `rm -rf` sau operații destructive ireversibile fără `[DESTRUCTIVE]` tag explicit
- Nu face push force pe `main`
- Nu modifică `.env` sau fișiere de credențiale
- Nu face deploy manual (GitHub Pages se face automat din push)

---

## Fișiere relevante

| Fișier | Rol |
|--------|-----|
| `10-exec-queue/EXEC_QUEUE.md` | Task-uri de executat |
| `10-exec-queue/EXEC_RESULTS.md` | Rezultate și log execuție |
| `.claude/settings.json` | Hook Stop — auto-push după fiecare task |

---

## Exemplu sesiune completă

```
Daniel: "check queue"

Claude Code:
  → citește EXEC_QUEUE.md
  → găsește TASK #3 (HIGH, PENDING), TASK #4 (MEDIUM, PENDING)
  → execută TASK #3: marchează IN_PROGRESS → face modificările → build ✓ → test ✓ → marchează DONE
  → execută TASK #4: marchează IN_PROGRESS → build eșuează → marchează FAILED → scrie cauza
  → scrie EXEC_RESULTS.md → push automat
  → raportează: "Queue procesată: 1 DONE, 1 FAILED. Task #4: [cauza]"
```
