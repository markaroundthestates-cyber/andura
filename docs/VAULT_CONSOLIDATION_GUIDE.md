# Vault Consolidation — Ghid pentru Daniel

**See also:** [[INDEX_MASTER]] | [[OBSIDIAN_SETUP_GUIDE]] | [[VAULT_SYNC_DIAGNOSTIC]]

**Data:** 24 apr 2026

---

## Diagnostic rapid

| Item | Status |
|------|--------|
| `github.com/markaroundthestates-cyber/salafull-vault` | **404 — nu există** |
| `github.com/markaroundthestates-cyber/salafull` | ✅ activ — tot codul + vault |
| Referințe la "salafull-vault" în repo | **0** — nicio referință |
| Folder `05-prompts/` în repo | nu există (prompts sunt în `docs/`) |

**Concluzie:** Nu există un repo separat `salafull-vault`. Tot munca (cod + docs) e în `salafull`. Dacă Obsidian-ul tău e conectat la un folder diferit sau la un repo inexistent, asta explică de ce nu vede fișierele noi.

---

## Problema

Vault-ul tău local Obsidian e montat pe un folder **vechi sau greșit** (ex: un clone care nu e `salafull`, sau un folder manual fără git).

Munca reală merge în:
```
https://github.com/markaroundthestates-cyber/salafull
```

Structura corectă (ce ar trebui să vadă Obsidian):
```
salafull/
├── 00-index/          ← INDEX_MASTER.md
├── 03-decisions/      ← DECISION_LOG.md
├── 09-workflows/      ← ASYNC_EXECUTION_PROTOCOL.md
├── 10-exec-queue/     ← EXEC_QUEUE.md, EXEC_RESULTS.md
├── docs/              ← 18 rapoarte + OBSIDIAN_SETUP_GUIDE.md
├── docs/decisions/    ← 9 ADR-uri (001-009)
├── src/               ← cod JS (nu apare în Obsidian Graph View)
└── tests/             ← teste (nu apare în Obsidian Graph View)
```

---

## Soluție — Clone fresh + mount ca Obsidian vault (Windows)

### Pasul 1 — Închide Obsidian complet

Asigură-te că Obsidian e complet închis (nu doar minimizat în taskbar).

### Pasul 2 — Găsește unde e vault-ul vechi

Deschide **File Explorer** și caută folderul `salafull` sau `salafull-vault`. Locații tipice:
```
C:\Users\Daniel\Documents\salafull
C:\Users\Daniel\Documents\salafull-vault
C:\Users\Daniel\Obsidian\salafull-vault
C:\Users\Daniel\Desktop\salafull
```

### Pasul 3 — Redenumește folderul vechi ca backup (opțional)

Dacă ai note personale în folderul vechi pe care vrei să le păstrezi, redenumeste-l:

**Windows PowerShell:**
```powershell
# Navighează unde e folderul (ajustează calea)
cd C:\Users\Daniel\Documents

# Redenumește ca backup
Rename-Item salafull-vault salafull-vault-OLD
# sau
Rename-Item salafull salafull-OLD
```

Dacă folderul nu are nimic valoros (e gol sau are doar câteva fișiere vechi), poți să-l ștergi direct.

### Pasul 4 — Clone repo salafull

**Windows PowerShell** (în același folder unde era vault-ul vechi):
```powershell
# Asigură-te că ești în folderul corect
cd C:\Users\Daniel\Documents

# Clone repo (înlocuiește TOKEN cu Personal Access Token dacă e repo privat)
git clone https://github.com/markaroundthestates-cyber/salafull.git

# Sau cu token (dacă ți se cere autentificare):
git clone https://TOKEN@github.com/markaroundthestates-cyber/salafull.git
```

**Alternativ, dacă ai GitHub Desktop:**
1. File → Clone repository
2. URL: `https://github.com/markaroundthestates-cyber/salafull`
3. Local path: alege unde vrei

### Pasul 5 — Deschide Obsidian și montează vault-ul nou

1. Deschide Obsidian
2. Click **"Open folder as vault"** (sau dacă ai vault-uri: Manage vaults → Add vault → Open folder)
3. Navighează la folderul `salafull` tocmai clonat
4. Click **Open**

### Pasul 6 — Verificare

După deschidere, ar trebui să vezi în sidebar:
- `00-index/` — cu `INDEX_MASTER.md`
- `03-decisions/` — cu `DECISION_LOG.md`
- `09-workflows/`
- `10-exec-queue/`
- `docs/` — cu 18 fișiere + subfolder `decisions/`
- `src/`, `tests/` (folderele de cod — pot fi ignorate în Obsidian)

**Graph View** (`Ctrl+G`): ar trebui să vezi 33+ noduri conectate, cu `INDEX_MASTER` ca nod central.

**Număr fișiere .md** (verificare în PowerShell):
```powershell
cd C:\Users\Daniel\Documents\salafull
(Get-ChildItem -Recurse -Filter "*.md").Count
# Ar trebui: 33 sau 34
```

---

## Configurare Obsidian Git (pentru auto-sync viitor)

După ce vault-ul e montat corect, instalează plugin-ul **Obsidian Git**:

1. `Settings → Community plugins → Browse` → caută "Obsidian Git" → Install → Enable
2. `Settings → Obsidian Git`:
   - **Auto pull interval:** `10` (minute) — pull automat la fiecare 10 min
   - **Auto push interval:** `0` (dezactivat — push manual sau lăsă Claude Code să facă push)
   - **Pull on startup:** `ON`

Astfel, de fiecare dată când Claude Code face push (după fiecare task), Obsidian va sincroniza automat în 10 minute.

---

## Troubleshoot

### Auth failed la clone
```
fatal: Authentication failed for 'https://github.com/...'
```
Generează un **Personal Access Token**:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → scope: `repo` (full)
3. Copiază token-ul
4. Folosește-l în loc de parolă (sau în URL: `https://TOKEN@github.com/...`)

### "Repository not found"
Repo-ul e **privat**. Ai nevoie de token sau să fii autentificat cu contul `markaroundthestates-cyber`.

### Obsidian nu vede fișierele după clone
- Verifică că ai deschis **folderul root** `salafull/`, nu un subfolder
- Settings → About → **Reload app** (sau repornești Obsidian)

### src/ și tests/ apar în Graph View și fac dezordine
Poți să le ascunzi în Obsidian:
- Settings → Files and links → **Excluded files** → adaugă `src` și `tests`

---

## Long-term

Repo `salafull` conține cod + vault în același repo — asta e alegerea arhitecturală (ADR [[005-vanilla-js-no-framework]]). Nu e nevoie de repo separat. Obsidian ignoră fișierele `.js`/`.ts`/etc. și afișează doar `.md`.

Dacă pe viitor vrei vault separat de cod, opțiunea e un **git submodule** sau **Obsidian Sync** — dar decizia e amânată pentru FAZA 4.
