# Task B001 — Vanilla legacy archive `src/_legacy-vanilla/`

**Cluster:** B (Simplicity First)
**Karpathy:** Simplicity First (delete dead code at scale)
**Effort:** M (~1.5-2h)
**Beta blocker:** NO Wave 2 cleanup
**Source finding(s):**
- `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md:88-95` (§1-H2 28+ vanilla files)
- `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md:151-156` (§1-M3 vanilla CSS imports)
- `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md:157-160` (§1-M4 aa-friction.css)
- `📤_outbox/audit-nuclear-2026-05-19/findings-§04.md:182-185` (§4-M1 innerHTML vanilla only)
- `📤_outbox/audit-nuclear-2026-05-19/findings-§22.md` (vanilla dead code cluster — read verbatim)

**File(s) touched:**
- Move: `src/pages/**`, `src/components/**` (vanilla folder), `src/auth.js`, `src/onboarding.js`, `src/bootstrap.js`, `src/main.js`, `src/inject.js`, `src/state.js`, `src/router.js`, `src/styles/main.css`, `src/themes/**`, `src/styles/aa-friction.css`
- Target: `src/_legacy-vanilla/` (new folder)
- Edit: `tailwind.config.js` content path exclude `_legacy-vanilla/**`

**Dependencies:** None (B001 = first BATCH_B1 task)

---

## §A Pre-flight

Per D008 + D023 anti-halucinare:

```
Read src/pages/ folder listing
Read src/components/ folder listing (if exists - vanilla)
Read src/auth.js complete (verify NOT imported by React)
Read tailwind.config.js content config
Read package.json scripts (verify no build script references src/pages/)
```

GitNexus:
```
gitnexus_query({query: "vanilla legacy"})
gitnexus_impact({target: "src/pages", direction: "upstream"})
```

Confirm: `src/pages/*` NOT imported by React build (verified §1-H2 evidence). `src/auth.js` IS imported by React build via BATCH_C1 C001 (`import { sendMagicLink } from '../../../auth.js'`) — DECISION POINT:
- Option A — leave `src/auth.js` în original location (NOT moved), update only vanilla-only files
- Option B — move `src/auth.js` to `src/auth/sendMagicLink.ts` (TS migration) + update C001 import path
- Option C — copy `src/auth.js` symlink within `src/_legacy-vanilla/` while keeping live at root

**Choose Option A** per Karpathy SF (minimal change scope). `src/auth.js` stays at root — it's PART OF React build pipeline now post-D028.

### Files to move list (final after Option A decision)

```
src/pages/**                               → src/_legacy-vanilla/pages/
src/components/**                          → src/_legacy-vanilla/components/  (if exists vanilla)
src/onboarding.js                          → src/_legacy-vanilla/onboarding.js
src/bootstrap.js                           → src/_legacy-vanilla/bootstrap.js
src/main.js                                → src/_legacy-vanilla/main.js
src/inject.js                              → src/_legacy-vanilla/inject.js
src/state.js                               → src/_legacy-vanilla/state.js
src/router.js                              → src/_legacy-vanilla/router.js
src/styles/main.css                        → src/_legacy-vanilla/styles/main.css
src/themes/**                              → src/_legacy-vanilla/themes/
src/styles/aa-friction.css                 → src/_legacy-vanilla/styles/aa-friction.css
```

KEEP at root:
- `src/auth.js` (post-C001 React-consumed)
- `src/firebase.js` (post-C001 + main.tsx Sentry init dep)
- `src/db.js` (Dexie + React shared)
- `src/constants.js` (shared)
- `src/util/*` (shared sentry + coachDecisionLog + etc.)
- `src/engine/**` (engine core — NOT vanilla)
- `src/coach/orchestrator/**` (coach core — NOT vanilla)
- `src/styles/global.css` (React Tailwind)
- `src/react/**` (React build)
- `src/main.tsx` (React entry)
- `src/App.tsx` (will be deleted by A158 Wave 2 task — leave alone B001)
- `src/i18n/**` (verify if used by React — read first)

---

## §B Implementation

### Step 1 — Create archive folder

```powershell
New-Item -ItemType Directory src/_legacy-vanilla -Force
```

### Step 2 — Move files via git mv

```powershell
git mv src/pages src/_legacy-vanilla/pages
git mv src/onboarding.js src/_legacy-vanilla/onboarding.js
git mv src/bootstrap.js src/_legacy-vanilla/bootstrap.js
git mv src/main.js src/_legacy-vanilla/main.js
git mv src/inject.js src/_legacy-vanilla/inject.js
git mv src/state.js src/_legacy-vanilla/state.js
git mv src/router.js src/_legacy-vanilla/router.js
git mv src/styles/main.css src/_legacy-vanilla/styles/main.css
git mv src/themes src/_legacy-vanilla/themes
git mv src/styles/aa-friction.css src/_legacy-vanilla/styles/aa-friction.css
# src/components only if exists vanilla — verify first via ls
```

Per D023, on Windows emoji paths use filesystem:write_file equivalent (BUT `src/_legacy-vanilla/` is ASCII path — `git mv` works directly).

### Step 3 — Update tailwind.config.js

```diff
 content: [
-  './src/**/*.{js,jsx,ts,tsx,html}',
+  './src/**/*.{js,jsx,ts,tsx,html}',
+  '!./src/_legacy-vanilla/**',
   './index.html',
 ],
```

(Tailwind v3 supports negative `!` glob patterns.)

### Step 4 — Update index-vanilla-legacy.html

Per D028, `index-vanilla-legacy.html` backup references vanilla paths. Update to new `src/_legacy-vanilla/...` paths:

```diff
-<script type="module" src="/src/main.js"></script>
+<script type="module" src="/src/_legacy-vanilla/main.js"></script>
-<link rel="stylesheet" href="/src/styles/main.css">
+<link rel="stylesheet" href="/src/_legacy-vanilla/styles/main.css">
```

(Verify all vanilla path references via grep.)

### Step 5 — Verify React build NOT broken

```powershell
npm run build
```

Expect SUCCESS. If FAIL, identify import paths needing update + fix.

### Step 6 — Add README in archive folder

`src/_legacy-vanilla/README.md`:
```markdown
# Legacy Vanilla Build (archived 2026-XX-XX iter-1 BATCH_B1)

Per D028 React entry swap LANDED 2026-05-19, this vanilla pages/components/
auth/onboarding tree is preserved as backup at `index-vanilla-legacy.html`
entry. NOT compiled into React production bundle (Tailwind content excludes).

To run legacy vanilla: serve `index-vanilla-legacy.html` directly via dev server.

Closed via iter-1 BATCH_B1 task B001 — see DECISIONS.md §D028 + iter-1
ORCHESTRATOR.md.
```

---

## §C Tests

```powershell
npm run test:run                          # expect: 4522 PASS preserved (no test file moved)
npm run build                             # expect: dist/ built, NO src/_legacy-vanilla/ output in dist/assets
```

Verify dist/ build NOT include vanilla legacy:
```powershell
ls dist/assets | findstr -i "legacy\|pages\|themes"
```

Expect: NO matches. If matches found → vite picked up vanilla — investigate vite.config.js externals.

---

## §D Commit

Atomic but LARGE — many file moves. Single commit acceptable per Karpathy SF "move-and-rename ops":

```
chore(B001-vanilla-archive): archive src/pages/* + components + auth-adjacent JS + themes to src/_legacy-vanilla/ (NC§1-H2 cluster + 30 findings closed)

Closes audit nuclear §1-H2 + §1-M3 + §1-M4 + §4-M1 + §22.* vanilla cluster
(~30 findings collapsed into single archive op).

Files moved:
- src/pages/** → src/_legacy-vanilla/pages/
- src/onboarding.js + bootstrap.js + main.js + inject.js + state.js + router.js
  → src/_legacy-vanilla/
- src/styles/main.css + aa-friction.css + themes/* → src/_legacy-vanilla/styles+themes/

Files preserved at root (React-consumed):
- src/auth.js (post-C001 wire), src/firebase.js, src/db.js, src/constants.js,
  src/util/*, src/engine/**, src/coach/orchestrator/**, src/styles/global.css,
  src/react/**, src/main.tsx, src/App.tsx (deletion deferred A158)

tailwind.config.content excludes _legacy-vanilla/**.
index-vanilla-legacy.html paths updated to new archive locations.

Source-citation: 📤_outbox/audit-nuclear-2026-05-19/findings-§01.md:88-95 + §22.*
```

---

## §E Verify post-edit

```powershell
gitnexus_detect_changes
ls src/_legacy-vanilla/
ls src/                          # confirm src/ slimmed to React build essentials
npm run build                    # confirm React build green
npm run test:run                 # confirm 4522 PASS preserved
git diff HEAD~1 --stat           # confirm only file moves + tailwind.config + index-vanilla-legacy.html changes
```

Expected:
- gitnexus: ~30 file paths changed (moves) + tailwind.config + index-vanilla-legacy.html — no React/engine/coach symbols modified
- src/ listing: 4-5 root JS files + react/ + engine/ + coach/ + util/ + styles/ + _legacy-vanilla/ + main.tsx + App.tsx
- npm build: SUCCESS
- npm test: 4522 PASS
- git diff stat: ~30 renames (file path changes) + 2 config edits

---

🦫 **Task B001 — Vanilla legacy archive. ~1.5-2h Opus. Closes ~30 findings via single archive op. BATCH_B1 first task — unblocks D2 Tailwind ↔ CSS vars cleanup.**
