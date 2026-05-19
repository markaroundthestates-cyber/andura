# Deploy React Production LANDED — andura.app/ vanilla→React entry swap LIVE

**Date:** 2026-05-19
**Branch:** `main` (merged from `feature/v3-react-clasic` no-ff)
**Deploy SHA main:** `caaae99` (merge commit `merge(react): swap entry main → React production andura.app/ per D028`)
**Deploy URL:** https://andura.app/ (GitHub Pages custom domain CNAME, NU Firebase)
**Tag deploy:** `deploy-react-production-2026-05-19` (origin pushed)
**Backup pre-swap:** `pre-react-entry-swap-2026-05-19` (HEAD `fb0b10b` pre-swap restore point)
**ADR authority:** [[DECISIONS.md §D028]] STRATEGY LOCKED V1 2026-05-19
**Live verify:** 2026-05-19 22:05 UTC ~3-4min post push origin main

---

## §0 Deploy summary + checklist

### SHAs

| Artefact | SHA | Subject |
|---|---|---|
| ADR commit | `eae0b8d` | docs(decisions): D028 React entry swap strategy + vanilla preservation policy |
| Swap exec commit | `668f0e5` | feat(react): swap entry main → React build, vanilla preserved legacy |
| Merge commit main | `caaae99` | merge(react): swap entry main → React production andura.app/ per D028 |
| Pre-swap baseline | `fb0b10b` | (Phase 6 BATCH 24 closure HEAD pre-swap) |

### Tags

- `pre-react-entry-swap-2026-05-19` → `fb0b10b` (rollback hard reset point)
- `deploy-react-production-2026-05-19` → `caaae99` (deploy milestone marker main HEAD)

### Live verify checklist

- ✅ HTTP 200 `https://andura.app/` serves React shell `dist/index.html` (1.11kB minimal, was 63KB vanilla)
- ✅ `<title>Andura - Clasic (React build Phase 1)</title>` (NU `<title>Andura</title>` vanilla)
- ✅ `<script type="module" src="/assets/main-DhUhC8l-.js"></script>` (441KB exact local build SHA match)
- ✅ `<link rel="modulepreload" href="/assets/vendor-react-Dr5FLEDc.js">` (React 19 chunk split per Phase 5 task_20)
- ✅ `<link rel="modulepreload" href="/assets/vendor-state-BeI4iLF4.js">` (Zustand chunk)
- ✅ `<link rel="modulepreload" href="/assets/vendor-icons-BusRyph_.js">` (Lucide React chunk)
- ✅ `<div id="root"></div>` mount point present
- ✅ `<link rel="manifest" href="/manifest.webmanifest">` PWA manifest served correct (Andura RO-RO standalone portrait theme #c8412e)
- ✅ `<script src="/registerSW.js">` wires `navigator.serviceWorker.register('/sw.js', { scope: '/' })`
- ✅ `https://andura.app/sw.js` HTTP 200 OK (vite-plugin-pwa workbox SW Phase 6 task_21)
- ✅ ZERO vanilla markers (`id="page-coach"`, `id="today-screen"`, `id="offline-indicator"` ELIMINATED din live HTML root)
- ⏳ **Daniel manual gate**: BottomNav 4 taburi visual (Antrenor/Progres/Istoric/Cont) NU 6 taburi vanilla (Coach/Dashboard/Greutate/Program/Plan/Setari)
- ⏳ **Daniel manual gate**: `/splash` route initial post navigate root `/`
- ⏳ **Daniel manual gate**: DevTools Application tab → Service Workers `activated and running` + Cache Storage `workbox-precache-v2` 13 entries
- ⏳ **Daniel manual gate**: PWA install prompt offerable (Chrome → Install Andura)
- ⏳ **Daniel manual gate**: Existing PWA telefon Android → UpdatePrompt component triggered (cache invalidation vanilla→React vechiul SW)

---

## §1 Pre-deploy strategic adjustments (4 blockers surfaced + resolved)

User initial plan presumed Firebase Hosting + React = main entry. Pre-action verification per [[feedback_grep_before_prompt_cc]] + [[feedback_verify_remote_state]] surfaced 4 blockers:

### Blocker 1: Firebase Hosting infrastructure ABSENT

Verified `firebase.json`, `.firebaserc`, `firebase-tools` în `package.json`, `firebase` CLI = **ALL MISSING**. Production hosting = GitHub Pages (`.github/workflows/deploy.yml` `peaceiris/actions-gh-pages@v3` push to `gh-pages` branch + `public/CNAME`+`dist/CNAME` = `andura.app`). DNS andura.app `185.199.108-111.153` = GitHub Pages Fastly CDN (NU Firebase).

**Resolved:** Daniel chose Path A "GH Pages: merge → main (auto)" — matchează infrastructura existentă, zero infra-change, zero DNS migration risk.

### Blocker 2: React build = parallel test entry, NU main

Verified `vite.config.js` rollupOptions.input declared 2 parallel entries: `main: 'index.html'` (vanilla 63KB cu `#page-coach` inline) + `'react-test': 'react-test.html'` (React `#root` shell). `dist/index.html` produced from vanilla source → zero `id="root"` mount point. React build accesibil doar la `/react-test.html`.

**Resolved:** Swap necesar — modificare entry-point arhitecturală.

### Blocker 3: D015 LOCKED V1 conditional + D026 closure timing

D015 (2026-05-16) STRATEGY: "Vanilla `index.html` 6 taburi rămâne legacy live andura.app **până React migration LANDED**". D026 (2026-05-19 today) STRATEGY: "Phase 6 BATCH 24-task LANDED — Closes Pre-Beta LOCK 2 React Andura Clasic build". Convergența: today = momentul logic tipping per D015 conditional.

**Resolved:** Daniel chose Option 4 "STOP — escalează decizie ADR nouă" combinat cu Option 1 "rename pattern execution". D028 ADR scrisă pentru documenta strategy + rollback + preservation policy ÎNAINTE de execuție.

### Blocker 4: react-test.html dependency refs

Verified active code references: `tailwind.config.js:4` content scan, `src/main.tsx:14` error msg, `vite.config.js:70` input map. Restul references = `_FROZEN`/`_archive`/`_CONSUMED` docs (read-only legacy, NU active).

**Resolved:** 3-file edit minimal scope, atomic în Commit 2.

---

## §2 Implementation execution (2 atomic commits + backup tag + merge + push)

### Pre-execution backup

```
git tag -a pre-react-entry-swap-2026-05-19 -m "..." HEAD  # HEAD fb0b10b
git push origin pre-react-entry-swap-2026-05-19           # remote backup
```

### Commit 1: D028 ADR DECISIONS.md inline (eae0b8d)

Edits DECISIONS.md SSOT singular (per D001 directive 2026-05-15 reglaj):
- Frontmatter: `latest_entry: D026` → `D028`
- Catalog entry inserted după D026 (line 81)
- Detailed `### D028` section inserted înainte de footer (§1-§7: Context, Decision, Implementation, Rollback path, Vanilla preservation policy, Impact, Risk)
- Pre-commit hook husky verde mandatory: **4522 PASS** (vitest run 58.49s, 251 test files, transform 8.17s setup 56.31s)

### Commit 2: Swap entry exec (668f0e5)

```
git mv index.html → index-vanilla-legacy.html      # vanilla preserved repo backup
git mv react-test.html → index.html                # React shell devine entry main
```

Config edits (3 files):
- `vite.config.js` rollupOptions.input → single `main: 'index.html'` (react-test entry removed)
- `src/main.tsx` error msg `'Root element #root not found in react-test.html'` → `'... in index.html'`
- `tailwind.config.js` content scan path `'./react-test.html'` → `'./index.html'`

Build verification local: `npm run build` 6.71s, 1926 modules, `dist/index.html` 1.11kB React shell + assets cu vendor-react/state/icons chunks split + PWA SW + manifest invariant.

Pre-commit hook husky verde mandatory: **4522 PASS** (zero regression vitest run 59.67s).

### Merge + push origin main (caaae99)

```
git push origin feature/v3-react-clasic            # remote backup feature
git checkout main + git pull --ff-only             # sync local main
git merge --no-ff feature/v3-react-clasic -m "..." # 152 commits absorbed (150 prior + 2 swap)
git push origin main                               # triggers .github/workflows/deploy.yml
```

GH Actions workflow `Deploy to GitHub Pages` triggered:
- `actions/checkout@v4` → `actions/setup-node@v4 node-version: 20` → `npm install` → `npm run build` → `peaceiris/actions-gh-pages@v3` push `./dist` → `gh-pages` branch
- Workflow duration: ~3-4min (push ~22:01 UTC → React live detect 22:05 UTC)
- Filename hashes reproduce identical local build (`main-DhUhC8l-.js`, `vendor-react-Dr5FLEDc.js`, `main-Berm-M5j.css` exact match)

### Tag deploy

```
git tag -a deploy-react-production-2026-05-19 -m "..." HEAD  # caaae99
git push origin deploy-react-production-2026-05-19            # milestone marker
```

---

## §3 Carry-forward Phase 7 + Daniel manual gates pre-Beta

### Daniel Gates production manual (per D026 §4 carry-forward + D028 §6 impact)

1. **BottomNav 4 taburi visual** — Antrenor/Progres/Istoric/Cont vizibili la `andura.app/` (NU 6 taburi vanilla legacy)
2. **`/splash` route initial** — root `/` redirects splash post-mount
3. **Auth flow** — disclaimer medical modal LANDED + Big 6 hard T0 (PRIMER §4 sequencing)
4. **DevTools Application tab**:
   - Service Workers → `sw.js` `activated and running` scope `/`
   - Cache Storage → `workbox-precache-v2-https://andura.app/` 13 entries (~546KB)
   - Manifest → name=Andura standalone portrait theme #c8412e installable
5. **PWA install** Chrome → Install Andura → desktop shortcut launches standalone
6. **Telefon Android primary smoke** (per D026 §4 production manual gate):
   - Existing installed PWA: vanilla SW invalidates → UpdatePrompt component triggers → reload → React 4 taburi live
   - Fresh install: PWA install prompt + offline mode visit
7. **PRD smoke a-z** single comprehensive gate per PRIMER §4 sequencing

### Bugatti Full Audit pre-Launch (per D026 §4 nuclear gate candidate)

CC autonomous candidate post Daniel smoke findings — fiecare linie cod + fiecare virgulă latest commit LANDED inclusiv D028 swap.

### Title polish (minor cosmetic, post-Beta acceptable)

`<title>Andura - Clasic (React build Phase 1)</title>` rămas din react-test.html original — stale "Phase 1" descriptor. Polish post-Beta: simplify la `<title>Andura</title>` (matching original vanilla + manifest `name: 'Andura'`). NU blocking pre-Beta launch.

### Rollback path (instant, dacă smoke gate findings critical)

```
git revert caaae99                                    # revert merge commit
git push origin main                                  # triggers deploy.yml redeploy
# OR alternative hard reset:
git reset --hard pre-react-entry-swap-2026-05-19      # local restore baseline
git push origin main --force-with-lease               # remote restore (DESTRUCTIVE)
```

GH Pages auto-redeploy ~2-3min restores vanilla 6 taburi live. PWA SW `cleanupOutdatedCaches: true` + `registerType: 'autoUpdate'` invalidates client cached React, UpdatePrompt re-triggers.

---

## §4 Handover distribute cluster — D028 + D029 LANDED DECISIONS.md

Per `📥_inbox/PROMPT_CC_handover_distribute_2026-05-19.md` §1-§5 (consumed + archived).

### D028 category corection STRATEGY → PROC

D028 ADR scrisă în deploy cluster ca STRATEGY (production entry tipping moment angle). HANDOVER §6 + PROMPT_CC distribute §1 codifică categoria oficială **PROC** (entry swap rename pattern + rollback path + vanilla preservation policy — procedural lock NU strategic pivot, strategy = D015 pivot original). Catalog + detailed `### D028 — PROC —` + frontmatter status `LOCKED V1 PERMANENT` updated DECISIONS.md.

### D029 PROC NEW — Bugatti Audit Nuclear procedure

LOCKED V1 PERMANENT 2026-05-19 per Daniel CEO directive verbatim *"FULL AUDIT. Fiecare linie cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"* + *"absolut full"* + *"ruleaze neintrerupt pana nu il opresc eu"*.

- **§1 Mode** continuous neîntrerupt multi-noapte CC autonomous Opus MAX thinking budget. NU auto-terminate post §1-§24 primary — auto-iterative deep-dive secondary CRITICAL/HIGH → tertiary MED/LOW → quaternary NIT until Daniel STOP
- **§2 Stop trigger UNIC** Daniel explicit STOP/caveman/stai/Ctrl+C/"termina" (ZERO bandwidth/iteration/time auto-stop)
- **§3 Scope** ALL on HEAD post `deploy-react-production-2026-05-19` tag (`caaae99`): ~100k LOC source + ~250k+ total tests+docs+mockups
- **§4 Procedure** §1-§25 per `PROMPT_CC_audit_nuclear_full_2026-05-19.md` (source line-by-line + tests + TS strict + Security 16 sub + Performance 15 sub + A11y WCAG 2.1 AA 13 sub + UX flows 13 sub + Engine 20 sub + Compliance 14 sub + LOCK chain-of-trust + i18n RO + Data integrity + Error handling + State machine + Cross-browser + PWA spec + Telemetry + Documentation + Visual regression + Bundle + Git hygiene + Refactor-NEVER + Self-correction + Production readiness % weighted + Procedure meta)
- **§5 Output** log-only `📤_outbox/audit-nuclear-2026-05-19/` (findings-§N.md per category cu severity CRITICAL/HIGH/MED/LOW/NIT + SUMMARY.md aggregate matrix + production readiness % weighted final score + `_progress.md` checkpoint resume capable)
- **§6 Trigger** Daniel manual paste — NU auto-launch
- **§7 Risk** log-only ZERO modificare cod, bandwidth mitigated via `_progress.md` checkpoint

### Frontmatter DECISIONS.md

`latest_entry: D028` → `D029` + `total_entries: 28` → `29`.

---

## §5 Inbox archive + V6 minor structural update

### Inbox cleanup git mv → `📥_inbox/_CONSUMED/`

- `HANDOVER_2026-05-19_phase-6-landed-deploy-audit-prep.md` (consumed full §1-§8 narrative cluster context)
- `PROMPT_CC_handover_distribute_2026-05-19.md` (consumed full §1-§5 execution)

### Inbox PĂSTRAT (pending Daniel manual paste)

- **`📥_inbox/PROMPT_CC_audit_nuclear_full_2026-05-19.md`** — Daniel paste când e gata să lanseze audit nuclear. NU archive automat. Sesiune CC dedicated, paralel OK cu Daniel Gates smoke production manual (smoke CEO focus telefon, audit CC altă sesiune concurrent).

### V6 minor structural append (preserve invariant)

`01-vision/PROJECT_INSTRUCTIONS_V6.md` post-2026-05-19 STRUCTURAL UPDATES section (delta append-only, NU rewrite full):
- React v3 LANDED live (NU mai "React v3 future" per line 5 stale) — cross-refs D015 → D026 → D028
- Bugatti Audit Nuclear procedure D029 LOCKED V1 PROC definition + trigger mechanism

---

🦫 **Deploy React production LANDED + D028/D029 LOCKED V1 distribute LANDED. Handover archive complete. Inbox ready pentru Daniel manual paste audit nuclear. Pre-Beta milestones rămase: Daniel Gates smoke production manual + Bugatti audit nuclear iterative + fix combined backlog → Beta launch.**
