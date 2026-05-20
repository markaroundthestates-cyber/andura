# §1 — Source Code Audit (line-by-line)

**HEAD:** `b705c3f` | **Scope:** src/react/** + src/engine/** + src/coach/orchestrator/** + src/util/** + src/db.js + src/constants.js + mockup parity + comments + formatting + ESLint + CSS + fonts + assets + animation + touch + encoding + imports + boundaries
**Method:** Strategic sampling + pattern hunts (grep aggregated). Pure read-only static analysis. Karpathy 4 principii each finding-tagged.

## Severity matrix §1

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 6 |
| MED | 8 |
| LOW | 5 |
| NIT | 4 |
| **Total** | **27** |

---

## CRITICAL findings

### §1-C1 — `index.html` production entry stale + missing critical PWA + meta tags
**Severity:** CRITICAL
**Evidence:** `index.html:1-30` (30 LOC total)
**Karpathy:** Surgical Changes — small fix high impact pre-Beta
**Finding:**
- Title `Andura — Clasic (React build Phase 1)` — STALE; Phase 6 deployed.
- NO `<link rel="manifest">` — PWA installability degraded (vite-plugin-pwa MAY auto-inject, verify dist/index.html).
- NO `theme-color` meta — Android Chrome status bar generic gray, brand identity loss.
- NO `apple-touch-icon` — iOS home screen icon fallback default.
- NO `description` meta — SEO/social share preview empty.
- NO `viewport-fit=cover` — iOS notch safe-area not respected.
- `color-scheme: dark` set inline `:root` while app theme = paper/light (`--paper: #faf7f1`) → form controls/scrollbars render dark, mismatched.
- Inline body `background: #0a0a0a; color: #e8e8e8` BEFORE Tailwind global.css loads → FOUC dark → light flash.
- index.html DUPLICATES inline `<style>` block with brand-incoherent dark theme.

Reasoning: this is the PRODUCTION entry served at andura.app/. Daniel-direct register + Suflet Andura cream warm light = misrepresented at landing.
**Fix log:** Rewrite index.html to mirror vanilla-legacy structure (manifest link, theme-color #c8412e, apple-touch-icon, viewport-fit=cover, description), drop inline dark color-scheme, drop inline body background, update title to "Andura". ETA: S (≤30min).

### §1-C2 — Production `console.warn` / `console.error` ships to bundle (14+ statements)
**Severity:** CRITICAL (data privacy + perf)
**Evidence:**
- `src/react/lib/engineWrappers.ts:118,149,198,220,299,343,406,424,463` — 9 `console.warn` defensive catch logs.
- `src/react/lib/scheduleAdapterAggregate.ts:110` — `console.warn`.
- `src/react/components/ErrorBoundary.tsx:31` — `console.error('[ErrorBoundary] caught render error:', error, errorInfo)` (logs FULL error + componentStack).
- `src/react/routes/screens/cont/SettingsDanger.tsx:39`, `SettingsExport.tsx:72` — `console.warn` with exception object.
- `vite.config.js:64-85` — NO `esbuild: { drop: ['console', 'debugger'] }`, NO terserOptions drop_console.
**Karpathy:** Simplicity First — single Vite config flag.
**Reasoning:** Vite default esbuild minify does NOT strip console. Production users open DevTools → see internal engine + auth error stacks → information leak + DevTools-driven perf cost. ErrorBoundary logs componentStack which can expose route shape + token names. anti-surveillance branding violation (§43.8) — even though it's outbound only to console, opens privacy axiom.
**Fix log:** Add `esbuild: { drop: ['console', 'debugger'] }` în vite.config.js OR replace console.* w/ telemetry-safe wrapper (`util/sentry.js` already imports `@sentry/browser` — wire). Preserve dev-only console via `if (import.meta.env.DEV)` gate or vite drop config (drops only in build).

### §1-C3 — Tailwind color tokens DIVERGENT from global.css `:root` CSS variables
**Severity:** CRITICAL (design system drift, dark-mode-future blocker)
**Evidence:**
- `tailwind.config.js:11-23` defines `colors: { paper: '#faf7f1', paper2: '#f3ede1', ink: '#1a1815', ink2: '#3a342d', line: '#e7e0d0', brick: '#c8412e', ...}` as HARDCODED HEX.
- `src/styles/global.css:17-26` defines `:root { --paper, --paper-2, --ink, --ink-2, --ink-3, --line, --line-strong, --brick }` as CSS vars.
- DRIFT:
  - global.css `--ink-3` (WCAG fix muted text 5.13:1) NOT in Tailwind config → no `text-ink3` utility → components fall back to hex literals or unused.
  - global.css `--line-strong` (interactive UI 3.23:1 SC 1.4.11) NOT in Tailwind.
  - Tailwind `brickdark`, `olive`, `deep`, `succ`, `warn`, `danger` NOT in `:root` CSS vars.
- Components mixing systems: `bg-paper text-ink` (Tailwind utility resolves to hardcoded hex) vs `var(--paper)` (CSS var). Dark mode override via CSS var (theme swap class) would NOT affect Tailwind utilities.
**Karpathy:** Surgical Changes — single decision: Tailwind utilities reference CSS vars OR drop CSS vars.
**Reasoning:** Future dark-mode SettingsAppearance LANDED Phase 6 (per §6.10/§19.18 expectation) cannot toggle by simply re-binding CSS vars — Tailwind utilities baked at build time. Maintenance debt: a brand color change requires edits in BOTH places. WCAG fixes documented in global.css comments (--ink-3, --line-strong) NOT propagated to Tailwind config.
**Fix log:** Migrate tailwind.config.js → `colors: { paper: 'var(--paper)', paper2: 'var(--paper-2)', ink: 'var(--ink)', ink2: 'var(--ink-2)', ink3: 'var(--ink-3)', line: 'var(--line)', lineStrong: 'var(--line-strong)', brick: 'var(--brick)', ... }`. Add `ink3` + `lineStrong` utilities. Test parity post-build.

### §1-C4 — NO ESLint configuration → §1.8 "ESLint rules respected" UNFALSIFIABLE
**Severity:** CRITICAL (engineering hygiene, pre-Beta)
**Evidence:** repo root + .config dirs scan: NO `.eslintrc*`, NO `eslint.config.*`, package.json devDeps has NO `eslint*` packages. `.husky/pre-commit` runs ONLY `npm run test:run` (vitest).
**Karpathy:** Think Before Coding — without static analysis, slip-flag patterns recurring; per `feedback_grep_before_prompt_cc.md` user memory, anti-recurrence rules require enforceable surface.
**Reasoning:** Without ESLint:
- §3.4 `any`/`unknown` hunt RELIES on grep alone, no automated `no-explicit-any` rule.
- §22 dead code (unused exports, unreachable branches) NOT detected statically — `no-unused-vars` absent.
- §1.7 Prettier formatting consistency claim cannot be verified (no Prettier config either).
- §1.16 import organization (external first) NOT enforced — `eslint-plugin-import` absent.
- §1.18 module boundaries NOT enforced.
- React-specific: NO `eslint-plugin-react-hooks` → missing `exhaustive-deps` validation on useEffect (Antrenor.tsx:67-73 useEffect runs `getCoachToday()` once — relies on empty deps array being correct, no hook lint validates).
**Fix log:** Install `eslint`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`. Minimal config based on React 19 + TS strict. Add `npm run lint` to husky pre-commit + ci.yml validate job.

---

## HIGH findings

### §1-H1 — `src/App.tsx` dead code (Phase 1 placeholder never imported)
**Severity:** HIGH (dead code §22.3 + bundle ghost)
**Evidence:** `src/main.tsx:1-22` imports `RouterProvider` + `./react/routes/router` only. `src/App.tsx:1-26` is a Phase 1 splash placeholder w/ 🦫 emoji + "Phase 1 Foundation LANDED" stale text. No grep hits for App.tsx imports outside file itself.
**Karpathy:** Simplicity First.
**Fix log:** Delete `src/App.tsx` entirely. If reused later, recreate.

### §1-H2 — Vanilla legacy `src/pages/*.js` still in src/ tree (28+ files)
**Severity:** HIGH (bundle bloat + maintenance confusion + §22.3 dead code at scale)
**Evidence:** `ls src/pages/` shows `auth.js`, `coach/*.js` (15+ files: aaFrictionModal, aggressiveLoadingModal, aparateLipsa, etc.), `weight.js` (1000+ LOC, multiple TODO markers e.g. line 584 "implement water tracking"). Per D028 React entry swap, vanilla preserved as `index-vanilla-legacy.html` — but `src/pages/*` is shared by both vanilla AND was supposed to be deprecated for React build.
**Karpathy:** Surgical Changes — vanilla preserved per D028 IS the LEGACY backup; React new build doesn't need src/pages/.
**Reasoning:** Tree-shaking: if `tailwind.config.content` includes `'./src/**/*.{js,jsx,ts,tsx}'`, Tailwind scans vanilla files generating utility classes consumed only by vanilla — bloating React build CSS. Verify dist/css size budget §5.1.
- Risk: a developer (Daniel or future contractor) accidentally edits vanilla path thinking it's active.
- `src/pages/coach/aaFrictionModal.js` co-exists with `src/react/components/AaFrictionModal.tsx` — naming confusion.
**Fix log:** Move `src/pages/` + `src/components/` (vanilla components folder) + `src/auth.js`, `src/onboarding.js`, `src/bootstrap.js`, `src/main.js`, `src/inject.js`, `src/state.js`, `src/router.js` into `src/_legacy-vanilla/` (or `99-archive/vanilla-source-pre-2026-05-19/`). Update tailwind.config.content to exclude `_legacy-vanilla/**`. Or alternative: keep ONLY in tag `pre-react-entry-swap-2026-05-19` and remove from main HEAD (vanilla preserved via tag-checkout not live tree).

### §1-H3 — Persona-aware CSS classes (Maria/Gigel/Marius) defined but underutilized
**Severity:** HIGH (§29.13 component variants + §50.6 cognitive mental model)
**Evidence:** `src/styles/global.css:29-35` defines `.persona-maria`, `.persona-gigel`, `.persona-marius` w/ `--body`, `--small`, `--display`, `--tight` overrides. `Antrenor.tsx:94` wraps `<section className="persona-${persona}">`. Grep hits for `persona-${`:
  - Antrenor.tsx — only one entry point uses persona wrapper
  - Other tab roots (Progres, Istoric, Cont) — NOT verified using persona class
**Karpathy:** Goal-Driven — Maria 65 needs LARGER text. If only Antrenor applies persona, other tabs miss persona scaling.
**Reasoning:** §50.6 "Maria 65: large tap targets, plain language, low cognitive overhead" requires CSS scaling consistent app-wide. Cont tab has 9 sub-screens — Settings Profile editing text inputs needs persona-aware sizing for Maria 65 visual accommodation.
**Fix log:** Hoist persona wrapper from Antrenor.tsx → Layout.tsx (`<div className="min-h-screen bg-paper text-ink flex flex-col persona-${persona}">`), ensuring all 4 tabs + nested routes inherit. Verify .body-text/.small-text/.display-text are used in screens (currently NOT verified — utility classes may be ghost-defined).

### §1-H4 — Fonts NOT preloaded NOR self-hosted: Inter declared but never loaded
**Severity:** HIGH (§1.11 + §5.30 FCP target)
**Evidence:** `tailwind.config.js:7-10` declares `font-sans: Inter` + serif Lora + mono JetBrains Mono. `global.css:42` `font-family: 'Inter', system-ui, sans-serif`. `index.html` has NO `<link rel="preload" as="font">`, NO `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` for Inter. Vanilla legacy index uses Bebas Neue + DM Sans + JetBrains via Google Fonts CSS link. React build: Inter font NEVER FETCHED → falls back to system-ui silently.
**Karpathy:** Think Before Coding — design language relies on Inter consistency.
**Reasoning:** Mockup `andura-clasic.html` DESIGN MASTER specifies font weights + Bebas Neue display. React build silently degrades to platform-default sans. Romanian glyphs ș/ț/â/î/ă render OK in system-ui but typography character lost → brand voice "warm Romanian" undermined.
**Fix log:** Either (a) self-host Inter woff2 in `/public/fonts/` + `@font-face` in global.css + `<link rel="preload" as="font" type="font/woff2" crossorigin>` în index.html, OR (b) preconnect+stylesheet Google Fonts mirror vanilla-legacy approach. Choose self-host for offline support (§16 PWA spec) + GDPR (§28 — Google Fonts external transfer EU debate).

### §1-H5 — Image/asset optimization absent: only icon-192/icon-512 PNG, no WebP/AVIF
**Severity:** HIGH (§1.12 + §5.32)
**Evidence:** `public/` contains `icon-192.png`, `icon-512.png`, `manifest.json`, `sw.js`, `CNAME`. No image assets in `src/react/` (icons via lucide-react ✓). NO srcset/picture tags. Maskable icon 512 reused (OK). NO splash screen iOS variants (per D015 deferred, but verify in §16).
**Karpathy:** Surgical Changes — only 2 PNG icons.
**Fix log:** Convert icon-192/icon-512 to optimized PNG (currently uncompressed?) + WebP fallback variants. ETA: S.

### §1-H6 — Duplicate Service Worker registration risk (public/sw.js + vite-plugin-pwa generated)
**Severity:** HIGH (§16 PWA)
**Evidence:**
- `public/sw.js` (manual, 1.0+, version `andura-v2`, caches /index.html + /manifest.json + icons).
- `vite.config.js:17-62` VitePWA generates `dist/sw.js` from workbox config (registerType: 'autoUpdate', NetworkFirst Firebase + CacheFirst fonts).
- Vite copies `public/` to `dist/` → manual sw.js OVERWRITES OR conflicts with generated sw.js at same path?
- index.html does NOT explicitly `<script>navigator.serviceWorker.register('/sw.js')</script>` — vite-plugin-pwa auto-injects registration script during build.
**Karpathy:** Think Before Coding — which SW wins runtime?
**Reasoning:** If public/sw.js is copied AFTER vite-plugin-pwa generation (or vice versa) → wrong SW served. Worst case: manual SW registers, caches stale assets, BLOCKS workbox update flow (UpdatePrompt component never triggers because `controllerchange` event not fired). Phase 6 task_21 PWA UpdatePrompt + NetworkFirst Firebase efectively disabled if manual SW wins.
**Fix log:** Delete `public/sw.js` entirely. Rely SOLELY on vite-plugin-pwa generated SW. Test installability + update prompt fresh build dist/. Cross-verify §16 finding.

---

## MED findings

### §1-M1 — `as any` unjustified cast în critical engine wrapper
**Severity:** MED
**Evidence:** `src/react/lib/engineWrappers.ts:279` `const result = await evaluateBN(ctx as any) as { tier?: string; ... }`. Eslint-disable comment line 278 acknowledges intent but doesn't justify rationale.
**Karpathy:** Simplicity First — engine should expose typed signature.
**Fix log:** Update `src/engine/bayesianNutrition/index.js` to declare types via `.d.ts` companion file with `evaluateBN(ctx: BNContext): Promise<BNResult>`. Remove `as any`.

### §1-M2 — TODO/FIXME markers persist (11 hits in vanilla pages + 1 in src/router.js + 1 in i18n + 1 in observationFilter)
**Severity:** MED (§22.1)
**Evidence:**
- `src/engine/bayesianNutrition/observationFilter.js:106` — `TODO(CEO-review): wording draft batch 2026-05-16 TASK 7 pending Daniel review` (legitimate D024 wording backlog).
- `src/i18n/index.js:5` — `TODO_EN markers` (placeholder en locale, OK pending v2).
- `src/pages/coach/renderIdle.js:106` — vanilla legacy, ignore.
- `src/pages/weight.js:584,586,597,599,601,603,952` — 7 TODOs (water/supplement/photo grid/sleep/energy/closed-day indicator/supplement checklist) — vanilla legacy.
- `src/router.js:27` — `TODO Step 5 workout exit back-stack pop. Current stub no-op` — vanilla router.
**Karpathy:** Simplicity First — if vanilla legacy delisted (§1-H2), TODOs disappear with it.
**Fix log:** Convert observationFilter.js TODO → comment referencing D024 LOCKED V1 + §47.5 pending wording backlog. Vanilla TODOs evaporate w/ §1-H2 fix.

### §1-M3 — `src/styles/main.css` (vanilla legacy) imports 4 themes never used by React
**Severity:** MED (§1.10 CSS dead code + §5.1 bundle)
**Evidence:** `src/styles/main.css:1-4` imports `theme-global.css`, `theme-forge.css`, `theme-zen.css`, `theme-anime.css`. Sets `--bg: #0a0a0a` dark theme. NOT imported by React global.css. React build via main.tsx imports ONLY `src/styles/global.css`. Vanilla legacy main.css → vanilla legacy index references via `<link href="/src/styles/main.css">`. Tailwind content scans `./src/**/*.{js,jsx,ts,tsx}` — `.css` not scanned but no purge concern.
**Karpathy:** Surgical Changes.
**Fix log:** Move vanilla `src/styles/main.css` + `src/themes/*` → `_legacy-vanilla/` aligned w/ §1-H2.

### §1-M4 — `aa-friction.css` separate file for one component (could be Tailwind inline)
**Severity:** MED (§1.10 micro-fragmentation)
**Evidence:** `src/styles/aa-friction.css` exists. `AaFrictionModal.tsx` uses Tailwind only — does NOT import aa-friction.css explicitly. Likely VANILLA legacy css file.
**Fix log:** Verify aa-friction.css NOT referenced by React; delete if unused.

### §1-M5 — Comments use Romanian diacritics liberally (low confusion risk, but inconsistent w/ NO_DIACRITICS spirit)
**Severity:** MED → LOW reclassify (UI rule scope only)
**Evidence:** `grep -E "[ăâîșțĂÂÎȘȚ]" src/react/**/*.tsx` returns multiple hits but ALL in `//` comments + JSDoc, NOT in JSX text content. §9.2 NO_DIACRITICS_RULE = "UI/tests/mockups" scope. Comments OK.
**Resolution:** No finding — confirmed UI clean.

### §1-M6 — JSDoc/inline comment quality inconsistent across modules
**Severity:** MED (§1.6)
**Evidence:** `engineWrappers.ts` has rich JSDoc with @example, @cross-refs DECISIONS.md. `Antrenor.tsx` has dense module header comment with phase tasks. BUT `App.tsx` (dead code) has stale Phase 1 narrative. Comment-to-code ratio varies wildly: heavy on engine wrappers + screens; minimal on store files (need verify Zustand stores).
**Karpathy:** Goal-Driven — comments serve onboarding new dev. Pre-Beta solo Daniel OK; if first contractor onboarded, JSDoc gaps will sting.
**Fix log:** Sample audit each Zustand store + adapter file post-Beta. NOT BLOCKING pre-Beta.

### §1-M7 — `src/react/lib/coachVoice.ts` has cosmetic mockup-unicode escape comment that misleads
**Severity:** MED (§1.6)
**Evidence:** `coachVoice.ts:1` (per grep): `// Mockup unicode escapes (â = â, — = em-dash, „/" = quotes)` — comment looks like a translation table but the chars are RENDERED IN COMMENT (not escapes). Suggests prior intent: code use ASCII-safe escapes + decode at render? Or remnant of a refactor?
**Fix log:** Read full coachVoice.ts to clarify intent; if dead-comment, delete.

### §1-M8 — `engineWrappers.ts` 466 LOC single file — extract candidates
**Severity:** MED (§22.6, §22.9 200-line files could-be-50)
**Evidence:** 466 LOC, ~7 distinct engine wrapping functions (readiness, fatigue, prDelta, todayWorkout, nutritionTargetsToday, adherenceOutput, patternsBanner STAGNATION + LOW_ADHERENCE, proactiveAlerts). Each wrapper has try/catch + fallback. Single file = single concern (engine wrappers) — debatable.
**Karpathy:** Simplicity First vs Surgical Changes tension — splitting introduces N files w/ same imports. Current monolith fine.
**Resolution:** ACCEPTABLE — Karpathy Simplicity First wins. Mark NIT only if naming-grouped poorly.

---

## LOW findings

### §1-L1 — Inconsistent emoji use in code (🦫 în App.tsx dead code)
**Severity:** LOW (§22.3 dead code adjacent)
**Resolution:** Disappears with §1-H1 fix.

### §1-L2 — `.css` files do not contain Tailwind `@layer` directives — minor optimization missed
**Severity:** LOW (§1.10 CSS specificity opportunity)
**Evidence:** `global.css` has `:root { --paper, --ink, ... }` at top-level instead of `@layer base { :root { ... } }`. Mixing custom CSS with Tailwind utilities lacks cascade isolation.
**Fix log:** Wrap custom `:root` + `.persona-*` in `@layer base` and `@layer components` respectively.

### §1-L3 — `import type { JSX } from 'react'` boilerplate in every component
**Severity:** LOW (§3.17 type imports separated — actually GOOD pattern, just verbose)
**Evidence:** Every `*.tsx` declares `import type { JSX } from 'react'`. With React 19 + `jsx: 'react-jsx'`, return type can default to JSX.Element through tsconfig — verify if explicit import is needed.
**Resolution:** Convention preserved for clarity. NIT-tier acceptable.

### §1-L4 — Comment density extremes (some files 30%+ comments, others <5%)
**Severity:** LOW (style preference)
**Resolution:** Acceptable — high-stakes engines warrant heavy comments; UI components lean.

### §1-L5 — `data-testid` attribute pervasive in components (good for E2E, slight DOM bloat)
**Severity:** LOW (§5.1 bundle impact)
**Evidence:** AaFrictionModal.tsx has 6 `data-testid` attributes (aa-friction-backdrop, modal, title, body, reason, pause, continue). Adds runtime attribute bytes.
**Resolution:** Acceptable — Playwright E2E requires stable selectors. Production gzip absorbs.

---

## NIT findings

### §1-N1 — Comment header divider style inconsistency
**Evidence:** Some files use `// ══` Unicode box drawing, others `// ──`. Mockup heritage. Cosmetic.

### §1-N2 — `as const` usage inconsistent
**Evidence:** `AaFrictionModal.tsx:38` uses `as const` on COPY object. Other components use plain object literals. Consider centralizing literal-narrowing utility.

### §1-N3 — Mixed quote styles single vs double in TS/TSX
**Evidence:** Without Prettier enforcement (§1-C4), quote style varies. NIT.

### §1-N4 — Some files use `function` declaration, others `const arrow`
**Evidence:** `export function App()` vs other modules using `const ComponentName = () => {}`. Style choice.

---

## Coverage map §1.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 1.1 | src/react/** ALL line-by-line | SAMPLED (143 files, key screens + components) | C/H/M/L |
| 1.2 | src/engine/** Big 11 + auxiliary | SAMPLED (231 .js files, see §8 + §38) | covered §8 |
| 1.3 | src/coach/orchestrator/** 8 adapter chain | SAMPLED structure (covered §47 + §48) | covered §47 |
| 1.4 | src/util/** + db.js + constants.js | SAMPLED structure (covered §12 + §17) | covered §12 |
| 1.5 | mockup andura-clasic.html DESIGN MASTER parity | SCAN (verbal verify §19 deep) | covered §19 |
| 1.6 | Comments quality JSDoc inline | §1-M6 — inconsistent | MED |
| 1.7 | Code formatting consistency Prettier | §1-N3 + §1-C4 — Prettier absent | CRITICAL |
| 1.8 | ESLint rules respected | §1-C4 — ESLint absent | CRITICAL |
| 1.9 | Vanilla legacy src/pages/*.js deprecated state | §1-H2 — still in tree | HIGH |
| 1.10 | CSS technical debt | §1-C3 + §1-M3 + §1-M4 + §1-L2 | CRITICAL |
| 1.11 | Font loading FOUT/FOIT | §1-H4 — Inter declared never loaded | HIGH |
| 1.12 | Image/asset optimization | §1-H5 — no WebP/AVIF | HIGH |
| 1.13 | Animation performance | NOT AUDITED (deferred secondary pass) | — |
| 1.14 | Touch event handling | NOT AUDITED (deferred — see §15 cross-browser) | — |
| 1.15 | Encoding UTF-8 BOM line endings | NOT AUDITED (BOM scan deferred) | — |
| 1.16 | Import statement organization | OBSERVED OK (external first → internal) | NIT |
| 1.17 | Module boundaries respected | OBSERVED OK (react/lib → engine/ via wrapper layer ✓) | — |
| 1.18 | Public vs private API surfaces | OBSERVED — NO barrel exports (acceptable) | NIT |

## Karpathy 4 principii distribution §1

- Think Before Coding: 4 findings (C1, C4, H4, H6)
- Simplicity First: 5 findings (C2, H1, M1, M2, M8)
- Surgical Changes: 4 findings (C3, H2, H5, M3)
- Goal-Driven Execution: 2 findings (H3, M6)
- Multi-principle: most findings
