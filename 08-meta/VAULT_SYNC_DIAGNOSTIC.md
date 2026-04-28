# VAULT SYNC DIAGNOSTIC — SalaFull Obsidian Vault

**See also:** [[INDEX_MASTER]] | [[OBSIDIAN_SETUP_GUIDE]] | [[ASYNC_EXECUTION_PROTOCOL]]

**Data:** 24 apr 2026  
**Scop:** Daniel are ~9-10 fișiere .md local; GitHub main are 33. Ghid de sincronizare.

---

## 1. Fișiere .md pe GitHub main (33 total)

### `00-index/` (1 fișier)
- `00-index/INDEX_MASTER.md`

### `03-decisions/` (1 fișier)
- `03-decisions/DECISION_LOG.md`

### `09-workflows/` (1 fișier)
- `09-workflows/ASYNC_EXECUTION_PROTOCOL.md`

### `10-exec-queue/` (2 fișiere)
- `10-exec-queue/EXEC_QUEUE.md`
- `10-exec-queue/EXEC_RESULTS.md`

### `docs/` (18 fișiere)
- `docs/AUDIT_BULLETPROOF_23APR.md`
- `docs/AUDIT_COACH_JS_24APR.md`
- `docs/CLAUDE_CODE_RULES.md`
- `docs/COACH_SPLIT_PLAN.md`
- `docs/CTX_ALLLOGS_AUDIT_1_5.md`
- `docs/FAZA_1_FINAL_REPORT.md`
- `docs/FAZA_2_EXECUTION_PLAN.md`
- `docs/FAZA_2_FINAL_REPORT.md`
- `docs/FAZA_2_OPUS_REVIEW.md`
- `docs/FAZA_2_ROADMAP.md`
- `docs/FAZA_3_ROADMAP.md`
- `docs/FIREBASE_AUDIT_1_8.md`
- `docs/FIX_PLAN_23APR.md`
- `docs/HARDCODED_AUDIT_1_2.md`
- `docs/LOG_SCHEMA_AUDIT_1_3.md`
- `docs/OBSIDIAN_SETUP_GUIDE.md`
- `docs/PROMPT_FAZA_1_1_SPLIT_EXECUTION.md`
- `docs/SESSIONBUILDER_AUDIT_1_6.md`

### `docs/decisions/` (9 ADR-uri)
- `docs/decisions/001-local-first-storage.md`
- `docs/decisions/002-firebase-rest-not-sdk.md`
- `docs/decisions/003-double-progression-engine.md`
- `docs/decisions/004-rule-engine-numeric-priorities.md`
- `docs/decisions/005-vanilla-js-no-framework.md`
- `docs/decisions/006-tier-storage-for-logs.md`
- `docs/decisions/007-firebase-open-rules.md`
- `docs/decisions/008-vitest-playwright-testing.md`
- `docs/decisions/009-calibration-tiers.md`

### Root (1 fișier)
- `AUDIT_REPORT.md` *(poate fi gitignored local — verifică `.gitignore`)*

---

## 2. Commits majore de azi (24 apr 2026) care au adăugat fișiere vault

Commits în ordine cronologică (cel mai vechi → cel mai nou):

| Hash | Fișiere adăugate |
|------|-----------------|
| `93962cb` / `3826d12` | `docs/decisions/001` → `009` (toate 9 ADR-uri) |
| `a07e561` | `09-workflows/ASYNC_EXECUTION_PROTOCOL.md`, `10-exec-queue/EXEC_QUEUE.md`, `10-exec-queue/EXEC_RESULTS.md` |
| `996aaa1` | `00-index/INDEX_MASTER.md` |
| `32f6904` | `docs/HARDCODED_AUDIT_1_2.md` |
| `79081d1` | `docs/LOG_SCHEMA_AUDIT_1_3.md` |
| `a5dedec` | `docs/CTX_ALLLOGS_AUDIT_1_5.md` |
| `d2dd940` | `docs/SESSIONBUILDER_AUDIT_1_6.md` |
| `c93013a` | `docs/FAZA_2_ROADMAP.md` (prima versiune) |
| `18b6b3c` | `docs/FIREBASE_AUDIT_1_8.md` |
| `2ee7333` | `docs/FAZA_1_FINAL_REPORT.md` |
| `63ce8cb` | `docs/FAZA_2_EXECUTION_PLAN.md` |
| `202ef35` | `docs/FAZA_2_OPUS_REVIEW.md` |
| `63d7d12` | `docs/FAZA_2_FINAL_REPORT.md`, `docs/FAZA_2_ROADMAP.md` (update) |
| `b8fc4d6` | `docs/FAZA_3_ROADMAP.md` |
| `4efaae8` | `docs/OBSIDIAN_SETUP_GUIDE.md` + wikilinks densification în toate fișierele |

**Dacă Daniel are ~9-10 fișiere** → e blocat înainte de commit `a07e561`. Lipsesc 23+ fișiere.

---

## 3. Instrucțiuni sync — Obsidian Git (recomandat)

### Metoda A — prin Obsidian (dacă ai plugin-ul Obsidian Git instalat)

1. Deschide Obsidian
2. `Ctrl+P` → tastează **"Obsidian Git: Pull"** → Enter
3. Asteaptă confirmarea: *"Pulled X commits"*
4. Verifică că vezi 33 fișiere .md (vezi secțiunea 4)

### Metoda B — prin Terminal (fallback dacă Obsidian Git nu merge)

```bash
# Navighează la folderul vault-ului (ajustează calea)
cd ~/Documents/salafull        # sau unde ai clonat repo-ul

# Verifică starea curentă
git status
git log --oneline -5

# Pull din main
git pull origin main

# Dacă ai modificări locale care blochează pull-ul:
git stash                      # salvează temporar modificările locale
git pull origin main
git stash pop                  # re-aplică modificările locale
```

### Metoda C — Reset complet dacă ai conflicte (ultimă soluție)

```bash
cd ~/Documents/salafull

# Salvează orice note proprii înainte!
git fetch origin
git reset --hard origin/main

# ATENȚIE: Asta suprascrie orice modificare locală necommitted.
# Folosește doar dacă ești sigur că nu ai nimic de salvat.
```

---

## 4. Probleme comune

### Auth failure la git pull
```
fatal: Authentication failed for 'https://github.com/...'
```
**Fix:** GitHub Personal Access Token expirat. Generează unul nou pe https://github.com/settings/tokens → repo scope → înlocuiește în credential manager.

### Merge conflict pe un .md file
```
CONFLICT (content): Merge conflict in docs/FAZA_2_ROADMAP.md
```
**Fix:**
```bash
# Acceptă versiunea din GitHub (overwrite cu versiunea remote)
git checkout --theirs docs/FAZA_2_ROADMAP.md
git add docs/FAZA_2_ROADMAP.md
git commit -m "resolve: accept remote version"
```

### Detached HEAD
```
HEAD detached at abc1234
```
**Fix:**
```bash
git checkout main
git pull origin main
```

### Obsidian Git plugin nu apare în Command Palette
- Verifică: `Settings → Community plugins` → Obsidian Git e activat (toggle ON)
- Dacă nu e instalat: `Settings → Community plugins → Browse` → caută "Obsidian Git" → Install → Enable

---

## 5. Verificare după pull

**Ar trebui să vezi:**

| Folder | Fișiere așteptate |
|--------|--------------------|
| `00-index/` | 1 (`INDEX_MASTER.md`) |
| `03-decisions/` | 1 (`DECISION_LOG.md`) |
| `09-workflows/` | 1 (`ASYNC_EXECUTION_PROTOCOL.md`) |
| `10-exec-queue/` | 2 (`EXEC_QUEUE.md`, `EXEC_RESULTS.md`) |
| `docs/` | 18 fișiere |
| `docs/decisions/` | 9 ADR-uri (`001` → `009`) |
| **Total** | **33 fișiere .md** (+ `AUDIT_REPORT.md` în root) |

**Verificare rapidă în terminal:**
```bash
find . -name "*.md" -not -path "./.git/*" | wc -l
# Ar trebui să returneze 33 (sau 34 dacă AUDIT_REPORT.md nu e gitignored)
```

**Verificare în Obsidian Graph View:**
- `Ctrl+G` → ar trebui să vezi ~33 noduri
- Nodul central mare = `INDEX_MASTER` (cel mai conectat)
- Cluster albastru separat = 9 ADR-uri din `docs/decisions/`

---

## 6. De ce s-a produs desync-ul

**Cauza:** Claude Code are un hook `Stop` care face auto-push după fiecare task. Obsidian Git face auto-pull doar la deschidere sau manual. Dacă Obsidian a rămas deschis în background în timp ce Claude Code a adăugat 20+ fișiere, vault-ul local a rămas în urmă.

**Prevenție pe viitor:**
- La începutul fiecărei sesiuni de lucru: `Ctrl+P` → "Obsidian Git: Pull"
- Sau activează auto-pull în Obsidian Git Settings: `Pull interval: 10` (minute)
