═══════════════════════════════════════════════════════════════════
TASK: REBRAND SWEEP `salafull` → `andura` (§30 LOCKED 2026-05-01 RESUBMIT)
Model: Opus
Mode: Autonomous fail-fast strict, 5 phases sequential, raport final centralizat LATEST.md
═══════════════════════════════════════════════════════════════════

## §0 — CONTEXT + GATES MANDATORY

**Domain LOCKED:** `andura.app` (cumpărat Namecheap 2026-05-03, order #201394291).

**Repo curent:** `markaroundthestates-cyber/salafull` GitHub. Daniel face manual GitHub repo rename + remote update DUPĂ Phase 5 complete (NU în acest task, doar prep).

**Dir local:** `C:\Users\Daniel\Documents\salafull` ACASĂ (Windows + PowerShell). Path-ul rămâne neschimbat acest task — repo rename local = decizie Daniel post-sweep, NU forțat aici.

**Scope strict acest task:** internal strings + file paths internal + config files. NU schimbi:
- Numele folderului local pe disk (rămâne `salafull`)
- Remote URL Git (Daniel update manual post sweep)
- GitHub Pages URL deployed (Daniel rename repo manual post Phase 5)

**Gate fail-fast strict:** orice Phase fail (build broken, tests broken, type errors) = STOP imediat, raport detailed în LATEST.md, ZERO commits fabricate.

**Pre-flight OBLIGATORIU ÎNAINTE Phase 1:**
1. `git status` — must be clean working tree, branch `main`
2. `npm run test:run` — baseline 1203 PASS confirm
3. `npm run build` — baseline 4.026s / 921 KB confirm
4. `git log -1` — confirm last commit hash known

Dacă pre-flight FAIL → STOP, raport.

---

## §1 — PHASE 1: VAULT DOCS SWEEP (164+ .md files)

**Scope:** toate `.md` din vault: `00-index/`, `01-vision/`, `02-audit/`, `03-decisions/`, `04-architecture/`, `05-findings-tracker/`, `06-sessions-log/`, `07-meta/`, `08-workflows/`, `📥_inbox/`, `📤_outbox/`, plus root level `*.md` (README.md, VAULT_RULES.md, etc.).

**Regula sweep:**
- `SalaFull` → `Andura` (case-sensitive, capitalizat în prose)
- `salafull` → `andura` (lowercase, în paths/code refs)
- `Sala Full` → `Andura` (cu space, dacă există)
- **EXCEPȚII NU schimba:**
  - Path-ul local Windows `C:\Users\Daniel\Documents\salafull` (rămâne — Daniel rename manual disk post-sweep)
  - GitHub repo URL `markaroundthestates-cyber/salafull` (rămâne — Daniel rename repo manual post Phase 5)
  - GitHub Pages URL `markaroundthestates-cyber.github.io/salafull/` (rămâne — Daniel update manual post repo rename)
  - Historical session-log entries cu cuvântul "salafull" în context istoric (e.g., `§29.6 SalaFull → Andura LOCKED` — rămâne preserved ca audit trail)
  - Decizia §30 title `Rebrand SalaFull → Andura LOCKED` — rămâne preserved (audit trail)

**Cum decizi exception vs sweep:**
- Dacă referința e prospectivă/forward-looking ("Andura V1", "andura.app") → SWEEP
- Dacă referința e istorică/retrospectivă ("SalaFull → Andura rebrand decision") → PRESERVE
- Dacă în dubiu → PRESERVE + flag în raport pentru Daniel review

**Tooling:**
- `git grep -l "salafull\|SalaFull\|Sala Full" -- '*.md'` pentru list complete
- Per-file edit cu context awareness (NU regex global brute)
- Commit per major section (vault-docs-batch-1, vault-docs-batch-2 dacă necesar pentru rollback granular)

**Verify Phase 1:**
- `git grep "salafull" -- '*.md' | wc -l` → list rămase (expected: doar exceptions documented)
- Daniel review raport list rămase ÎNAINTE Phase 2

**Commit message Phase 1:**
```
chore(rebrand): vault docs SalaFull → Andura sweep (Phase 1)

Per §30 LOCKED 2026-05-01 RESUBMIT. Forward-looking refs swept.
Historical audit trail preserved (§29.6 §30 §36.x rebrand decisions).

Files changed: <count>
Refs swept: <count>
Refs preserved (historical): <count>
```

---

## §2 — PHASE 2: COD SOURCE SWEEP (`src/`, `tests/`, `public/`)

**Scope source code:**
- `src/**/*.js` — toate fișierele JS source
- `tests/**/*.js` — test fișiere
- `public/manifest.json` — PWA manifest (`name`, `short_name`, `start_url`, `scope`, icons paths)
- `public/sw.js` — Service Worker (`CACHE_VERSION`, `BASE` const)
- `index.html` — title, meta, paths assets
- `vite.config.js` (sau vite.config.ts) — `base` config pentru GitHub Pages

**Regula sweep specifică cod:**
- `'salafull'` (string literals) → `'andura'`
- `/salafull/` (paths în URLs) → `/andura/` 
- `BASE = '/salafull'` în `public/sw.js` → `BASE = '/andura'`
- `CACHE_VERSION = 'salafull-v3'` în `public/sw.js` → `CACHE_VERSION = 'andura-v1'` (RESET version la v1 — fresh cache nume nou, NU continuă counter)
- `start_url`, `scope`, icons paths în `manifest.json`: `/salafull/` → `/andura/`
- `name: "SalaFull"`, `short_name: "SalaFull"` în `manifest.json` → `"Andura"`
- `description` în `manifest.json` rămâne neschimbat dacă NU conține "salafull"

**Verify Phase 2:**
- `git grep "salafull\|SalaFull" -- 'src/' 'tests/' 'public/' '*.js' '*.json' '*.html'` → expected: 0 hits
- `npm run build` → must succeed, no errors
- `npm run test:run` → must remain 1203 PASS (zero regression)
- `npm run typecheck` → no new errors
- Verify `dist/` build output paths: `dist/manifest.json` conține `/andura/`, `dist/sw.js` conține `BASE = '/andura'`

**Dacă tests fail:** STOP, raport detailed care test + ce assertion broken, ZERO commit.

**Commit message Phase 2:**
```
chore(rebrand): source code + PWA manifest + sw.js sweep (Phase 2)

Per §30 LOCKED. CACHE_VERSION reset andura-v1 (fresh cache nume nou).
Tests: 1203 → 1203 PASS unchanged.
Build: <time>s / <size> KB.

Files changed: <count>
```

---

## §3 — PHASE 3: CONFIG + PACKAGE FILES

**Scope:**
- `package.json` — `"name": "salafull"` → `"name": "andura"`
- `package-lock.json` — auto-regenerate via `npm install` (NU edit manual JSON)
- `README.md` — title + description sweep
- `vite.config.js` — `base: '/salafull/'` → `base: '/andura/'` (dacă există base config)
- `playwright.config.js` — orice `baseURL` cu `salafull` → `andura`
- `.github/workflows/*.yml` — orice referință `salafull` în CI configs (deploy paths, env vars)

**Procedure:**
1. Edit `package.json` name field
2. Run `rm package-lock.json && npm install` ca să regenerezi lock file curat
3. Verify `package-lock.json` top-level `"name": "andura"`
4. Run `npm run test:run` → 1203 PASS
5. Run `npm run build` → success
6. Edit README.md prose + headings
7. Edit vite.config + playwright config + .github workflows

**Verify Phase 3:**
- `npm run test:run` → 1203 PASS
- `npm run build` → success
- `git grep "salafull" -- 'package.json' 'package-lock.json' 'vite.config.js' 'playwright.config.js' '.github/'` → 0 hits

**Commit message Phase 3:**
```
chore(rebrand): config + package + CI workflows sweep (Phase 3)

Per §30 LOCKED. package.json name andura. lock regenerated clean.
README rewritten. vite base /andura/. CI workflows updated.

Tests: 1203 PASS. Build: success.
```

---

## §4 — PHASE 4: DNS + CNAME PREP (NU activate, doar pregătire)

**Scope:** create `public/CNAME` file pentru GitHub Pages custom domain.

**Conținut `public/CNAME`:**
```
andura.app
```

(Singur linie, no trailing newline issue — gh-pages lib gestionează.)

**Update `vite.config.js` pentru CNAME persistence:**
- Asigură că `public/CNAME` e copiat în `dist/` la build (default behavior Vite — fișierele din `public/` se copy în `dist/` root automat)
- Verify post-build: `dist/CNAME` exists cu conținut `andura.app`

**Update `package.json` deploy script (dacă necesar):**
- Default `gh-pages -d dist` păstrează `dist/CNAME` în branch `gh-pages` deploy

**NU face acum:**
- NU push Daniel's git remote update
- NU GitHub repo rename
- NU configure DNS records Namecheap
- NU activate custom domain GitHub Pages settings

**Verify Phase 4:**
- `npm run build` → success
- `cat dist/CNAME` → `andura.app`
- `git status` → only `public/CNAME` new file + minor vite.config dacă needed

**Commit message Phase 4:**
```
chore(rebrand): add public/CNAME for andura.app (Phase 4)

Per §30 LOCKED. CNAME prepared for post-sweep GitHub Pages activation.
Activation = manual Daniel step post-repo-rename + DNS Namecheap config.

Build: dist/CNAME present.
```

---

## §5 — PHASE 5: VAULT SSOT UPDATE + RAPORT FINAL

**Scope:**
- Update `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` cu nou §36.78 entry "Rebrand Sweep Phase 1-4 Complete"
- Update `📤_outbox/LATEST.md` cu raport final centralizat
- Move existing LATEST.md → `📤_outbox/_archive/2026-05/<NN>_LATEST_PREVIOUS_<context>.md` (next NN)

**§36.78 entry template (draft):**
```markdown
### §36.78 Rebrand Sweep Phase 1-4 Complete (2026-05-03 evening)

**Status:** Sweep `salafull` → `andura` Phase 1-4 EXECUTED autonomous CC Opus.

**Phases complete:**
- Phase 1: Vault docs sweep (164+ .md, <X> refs swept, <Y> historical preserved)
- Phase 2: Source code + PWA manifest + sw.js (CACHE_VERSION reset andura-v1)
- Phase 3: package.json name + lock regenerate + README + configs
- Phase 4: public/CNAME prep andura.app (NOT activated)

**Metrics:**
- Tests: 1203 → 1203 PASS unchanged
- Build: <time>s / <size> KB
- Commits: <count> (Phase 1 + Phase 2 + Phase 3 + Phase 4 = 4 commits min)

**Pending Daniel manual steps post-sweep:**
1. GitHub repo rename: `salafull` → `andura` (Settings → General → Rename)
2. Local remote update: `git remote set-url origin https://github.com/markaroundthestates-cyber/andura.git`
3. Local folder rename optional: `salafull` → `andura` (low priority, paths în vault docs reference deja /andura/ post-sweep)
4. Namecheap DNS config: A records → GitHub Pages IPs + CNAME www → markaroundthestates-cyber.github.io
5. GitHub Pages settings → Custom domain `andura.app` → enforce HTTPS
6. Email signature update [Andura V1 Feedback]

**Cumulative LOCKED count impact:** +1 (70 → 71)

**Cross-refs:** §30 Rebrand SalaFull → Andura LOCKED + §31 Investiții (andura.app €13.18 actual achitat 2026-05-03 vs estimate €10-15) + §36.77 anti-recurrence rule (pre-flight respected acest task).
```

**LATEST.md format:**
```markdown
# REBRAND SWEEP COMPLETE — Phase 1-4 Autonomous

**Task:** Rebrand `salafull` → `andura` per §30 LOCKED 2026-05-01 RESUBMIT
**Model:** Opus
**Status:** ✅ Complete 4/4 Phases
**Date:** 2026-05-03

## Pre-flight
- ✅ git clean, branch main
- ✅ Tests baseline: 1203 PASS
- ✅ Build baseline: <time>s / <size> KB

## Modificări per Phase

### Phase 1: Vault docs (~164 .md)
<details>

### Phase 2: Source code + PWA
<details>

### Phase 3: Config + package
<details>

### Phase 4: CNAME prep
<details>

## Build + Tests post-sweep
- Tests: 1203 PASS (unchanged)
- Build: <time>s / <size> KB
- Typecheck: clean

## Commits (4 hash list)
- Phase 1: <hash>
- Phase 2: <hash>
- Phase 3: <hash>
- Phase 4: <hash>

## Pushed
✅ origin/main

## Issues
<none / list>

## Next action Daniel manual
1. GitHub repo rename via Settings UI
2. Update local remote URL
3. Namecheap DNS config (A records GitHub Pages IPs)
4. GitHub Pages settings → Custom domain andura.app
5. Email signature update

(Detailed steps în §36.78 + acest LATEST.md.)
```

**Final commit Phase 5:**
```
chore(rebrand): vault SSOT update §36.78 + LATEST raport (Phase 5)

Per §30 LOCKED execution complete. 70 → 71 cumulative LOCKED count.
Daniel manual steps documented (repo rename + DNS + Pages config).

Co-CTO: Opus autonomous Phase 1-4. Daniel CEO Phase 5+ manual.
```

**Push final:** `git push origin main`

---

## §6 — STOP CONDITIONS (fail-fast strict)

**STOP imediat dacă:**
1. Pre-flight FAIL (dirty git, tests <1203 PASS, build broken pre-sweep)
2. Phase 1 grep post-sweep > 50 historical preserved (likely over-preservation, Daniel review needed)
3. Phase 2 tests scad sub 1203 PASS post-sweep
4. Phase 2 build broken
5. Phase 3 `npm install` fails post package.json edit
6. Phase 4 dist/CNAME absent post-build
7. Orice TypeScript error nou introdus
8. Git push fail (auth, conflict)

**STOP action:** raport detailed în LATEST.md cu Phase exact + symptom + ultimul commit safe + recommendation rollback sau fix.

**ZERO fabricated commits, ZERO mock data, ZERO push tests-failing.**

---

## §7 — EFFORT ESTIMATE

- Phase 1: ~1.5-2h (164 files context-aware sweep)
- Phase 2: ~1-1.5h (cod + tests + verify)
- Phase 3: ~30 min
- Phase 4: ~15 min
- Phase 5: ~30 min raport

**Total estimate Opus runtime:** ~3.5-4.5h actual (factor 5-7x optimism = ~30-50 min real per empirical learnings cluster 10-batch §36.71).

**Daniel-time estimate:** ~5-6h (chat verify + decizii intermediare exception calls Phase 1 + DNS post-sweep manual).

---

EXECUTE Phase 1 → Phase 5 sequential fail-fast. Raport final LATEST.md complet cu manual steps Daniel post-sweep. Cleanup branch dacă creezi feature branch (default = direct main per Bugatti paradigm small-team-solo).
