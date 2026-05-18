# §5 — Performance Audit

**Scope:** Bundle size + Core Web Vitals (LCP/FID/CLS/TBT/SI/INP/TTFB) + Lighthouse + code-split + tree-shake + critical render path + React renders + memoization + Zustand subscriptions + Dexie queries + memory + service workers + RUM
**Method:** dist/ bundle inspection, grep for memoization/lazy patterns, vite.config review, index.html dist verify

## Severity matrix §5

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 6 |
| MED | 5 |
| LOW | 3 |
| NIT | 2 |
| **Total** | **20** |

---

## CRITICAL findings

### §5-C1 — Main bundle **432 KB UNCOMPRESSED** vs §5.23 budget "main < 100KB" → **4.3x OVER BUDGET**
**Severity:** CRITICAL
**Evidence:** `dist/assets/main-DhUhC8l-.js` = 432 KB (uncompressed). Production deploy 2026-05-19 01:00 build.
- `vendor-react-Dr5FLEDc.js`: 72 KB
- `vendor-icons-BusRyph_.js`: 21 KB (lucide-react)
- `vendor-state-BeI4iLF4.js`: 655 bytes (zustand)
- `vendor-data-l0sNRNKZ.js`: **1 byte (!!!)** — chunk effectively empty
- CSS `main-Berm-M5j.css`: 17 KB
- `workbox-bdb082da.js`: 22 KB
- **Total initial JS:** ~525 KB uncompressed; gzipped est. 150-200 KB.
**Karpathy:** Surgical Changes — code-split route-based + lazy load.
**Reasoning:**
- Per §5.23 prompt budget: "vendor < 200KB, main < 100KB enforced numeric". CURRENT MAIN 4.3x over.
- Maria 65 phone slab on 3G (§5.7): @ 50 KB/s effective 3G, 432 KB main = **8.6 seconds** download alone. LCP > 5s certain. §5.16 LCP target <2.5s = FAIL massively.
- TTI Maria 65 phone: 432 KB JS parse/eval ~1.5-2s on slab Android Romania → §5.9 TTI Maria 65 target NOT MET.
**Fix log:**
- Route-based code splitting per Antrenor/Progres/Istoric/Cont — each tab lazy-loaded. ETA: M.
- Sub-screens (cont/Settings*, antrenor/PostSummary, etc.) lazy per route.
- Run `npx vite-bundle-visualizer` (devDependency) to profile what's in main bundle. Expected culprits: engines (231 .js files) bundled into main; lucide-react if not tree-shaken (already 21KB chunk separate, so tree-shake working).
- Engines should likely be in their OWN vendor chunk (`vendor-engines`) since they're called from React lib/ adapters.

### §5-C2 — `vendor-data` chunk = 1 BYTE → Dexie NOT properly chunk-split (bundled into main)
**Severity:** CRITICAL (bundle config drift §5.7)
**Evidence:** `dist/assets/vendor-data-l0sNRNKZ.js` = 1 byte. vite.config.js manualChunks `'vendor-data': ['dexie']` — Dexie should be ~30 KB. Empty chunk indicates Vite + Rollup treats Dexie imports as inlined to consumers chunk (likely main).
**Karpathy:** Think Before Coding — verify chunking actually works.
**Reasoning:** Dexie is likely imported via `src/db.js` (vanilla) AND `src/react/lib/dexieMigration.ts`. If db.js is also in main bundle (vanilla legacy slipped into React build), entire Dexie ships in main rather than its own chunk. Or Vite drops empty chunk anyway.
**Fix log:** Run `vite build --debug` + `npx vite-bundle-visualizer`. Verify Dexie chunk hit count. If vanilla src/db.js is the culprit pulling Dexie into main, code-split or refactor (related to §1-H2 vanilla legacy quarantine).

### §5-C3 — NO route-based code splitting (zero `React.lazy()` calls)
**Severity:** CRITICAL (§5.3)
**Evidence:** Grep `React\.lazy\|lazy(` in src/react/ → ONE hit which is a COMMENT in `Layout.tsx:7` ("Phase 7+ wires lazy() per route — current pattern eager-load preserved cu Suspense boundary ready pentru incremental migration"). NO actual lazy() invocations. router.tsx imports all 30+ screen components eagerly.
**Karpathy:** Surgical Changes — route-level lazy() = 1-line change per route.
**Reasoning:** 30+ screens loaded synchronously at app start. Each screen ~5-10 KB → bundling overhead. User who opens Antrenor doesn't need Cont/SettingsProfile loaded; nor Istoric route. Cold start payload could be cut ~30-50%.
**Fix log:** Convert each route in `router.tsx`:
```ts
const Antrenor = lazy(() => import('./screens/antrenor/Antrenor').then(m => ({ default: m.Antrenor })));
// or rewrite to default exports for cleaner pattern
```
Test each lazy route renders correctly. Layout.tsx already has `<Suspense fallback={<LoadingSkeleton />}>` ready.

### §5-C4 — NO Core Web Vitals capture (no web-vitals package, no Lighthouse CI)
**Severity:** CRITICAL (§5.15 + §5.16-§5.22 + §5.24)
**Evidence:**
- Grep `web-vitals\|lighthouse` in package.json → ZERO production deps for web-vitals.
- No `.github/workflows/lighthouse*.yml` exists.
- No `performance.mark`/`performance.measure` usage in src/.
- ci.yml validates typecheck + tests + build, but NO lighthouse-ci step.
- §5.21 INP, §5.22 TTFB, §5.16-§5.20 LCP/FID/CLS/TBT/SI — NONE measured/enforced.
**Karpathy:** Goal-Driven Execution — Beta entry requires perf evidence.
**Reasoning:** Without measurement, perf targets are aspirational. Maria 65 phone real-device test is the only validation channel.
**Fix log:**
- Add `web-vitals@^4` to dependencies. Wire reporting in `src/util/telemetry.js` (respecting opt-in per §17.1).
- Add `.github/workflows/lighthouse-ci.yml` running `@lhci/cli` on PR + post-deploy. Config `lighthouserc.json` w/ assertions: LCP < 2.5s, CLS < 0.1, INP < 200ms, TBT < 200ms.
- Add `bundlesize` budget config (package.json scripts) + CI enforce: main.js < 200KB gzip (relaxed from §5.23 100KB target until code-split done), vendor-react < 80KB, etc.

---

## HIGH findings

### §5-H1 — `dist/index.html` (1.1 KB) STILL contains stale Phase 1 title + inline dark style
**Severity:** HIGH (§1-C1 confirmed)
**Evidence:** dist/index.html:6 `<title>Andura — Clasic (React build Phase 1)</title>`. dist/index.html:9-22 inline dark color-scheme + dark body bg. Confirms §1-C1 finding: stale + brand-incoherent.
**Resolution:** Fix per §1-C1 (single file edit).

### §5-H2 — Zero `useMemo` / `useCallback` in React codebase (verify intentional vs missed opportunity)
**Severity:** HIGH (§5.10 + §5.28)
**Evidence:** Grep `useMemo|useCallback` in src/react/ → 0 hits. Antrenor screen subscribes to ~10 store fields (workoutStore + coachStore). Each prop/derived value re-evaluated on every store change → child re-renders.
**Karpathy:** Goal-Driven — for Maria 65 phone, every saved render counts.
**Reasoning:**
- Selector functions in Zustand (`s => s.streak`) → fine, primitive shallow compare.
- But computed values like `showReactivate = lastSession !== null && Date.now() - lastSession.ts > 14d && !reactivateDismissed && pausedSnapshot === null` (Antrenor.tsx:78-82) recomputed every render. `Date.now()` in render body → triggers re-render at next tick if anything else changes.
- Children passing object/array props (e.g., `<StatsGrid stats={{streak, ...}} />`) get new object reference each render → child re-renders even if values unchanged.
**Fix log:**
- Memoize derived state w/ `useMemo`.
- Lift `Date.now()` outside render OR use `useEffect` to compute once on mount + refresh on lastSession change.
- Profile w/ React DevTools Profiler — confirm hot paths.

### §5-H3 — `src/react/stores/scheduleStore.ts:75` ONE dynamic import in entire React tree (engine adapter)
**Severity:** HIGH (§5.3 + opportunity)
**Evidence:** `import('../../engine/schedule/scheduleAdapter.js')` — sole dynamic import. Other adapters (coachDirectorAggregate, bayesianNutritionAggregate, etc.) loaded synchronously.
**Karpathy:** Surgical Changes.
**Reasoning:** Engine adapters could ALL be dynamically imported, especially for screens not on hot path (Istoric, Cont).
**Fix log:** Audit adapter import sites; move heavy engine adapters to `await import(...)` from store actions instead of top-level imports.

### §5-H4 — `console.warn` 14× in production code = perf cost + privacy leak (§1-C2 reaffirmed)
**Severity:** HIGH (§5.5 + §1-C2 combined)
**Evidence:** See §1-C2 — vite has no `esbuild: { drop: ['console'] }`. Per call to console.warn — even though minimal, parses + DevTools open → slows.
**Resolution:** §1-C2 fix doubles.

### §5-H5 — `manifest.json` (vanilla 636 bytes) + `manifest.webmanifest` (PWA 465 bytes) duplicated in dist/
**Severity:** HIGH (§16 + §5.1)
**Evidence:** `dist/manifest.json` AND `dist/manifest.webmanifest`. dist/index.html line 29 `<link rel="manifest" href="/manifest.webmanifest">` — only webmanifest linked. manifest.json ships unused (~636 bytes wasted CDN bandwidth + cache).
**Resolution:** §1-H6 fix (delete public/manifest.json) eliminates.

### §5-H6 — `dist/sw.js` 2 KB + `workbox-bdb082da.js` 22 KB. SW load adds 24 KB at /sw scope.
**Severity:** HIGH (§5.1 + §16)
**Evidence:** PWA SW + workbox ship. NetworkFirst on Firebase + CacheFirst Google Fonts. Reasonable size, but verify which sw.js is registered — manual `public/sw.js` (2KB) shipped, OR vite-plugin-pwa generated overrides at same path?
**Resolution:** Tied to §1-H6 + §4-H7.

---

## MED findings

### §5-M1 — `vendor-react` = 72 KB; React 19 + react-dom + react-router-dom split correct ✓
**Severity:** MED (positive)
**Evidence:** Tree-shake working. R19 + DOM + Router-6 = 72KB chunk reasonable.
**Resolution:** OK.

### §5-M2 — `vendor-icons` 21 KB (lucide-react) — only used icons bundled ✓
**Severity:** MED (positive)
**Resolution:** OK (lucide-react ESM tree-shaking working).

### §5-M3 — Tree-shaking effective on Zustand (655 B) — confirms ESM imports clean
**Severity:** MED (positive)
**Resolution:** OK.

### §5-M4 — CSS bundle 17 KB unminified — Tailwind purge effective sample
**Severity:** MED (positive)
**Resolution:** OK. Tailwind purge via `tailwind.config.content` paths working.

### §5-M5 — `chunkSizeWarningLimit: 600` set in vite.config — masks 432KB main chunk warning
**Severity:** MED (§5.23 + bundle hygiene)
**Evidence:** `vite.config.js:84` raised threshold to 600KB to silence Vite warning about main chunk size.
**Reasoning:** Silenced warning is hidden tech debt. Should LOWER to 250 + actually fix chunking (§5-C1, §5-C3).
**Fix log:** After code-splitting (§5-C3), lower `chunkSizeWarningLimit` back to default 500.

---

## LOW findings

### §5-L1 — `sourcemap: false` in vite.config.js ✓
**Severity:** LOW (positive §5.4)
**Resolution:** Confirmed.

### §5-L2 — Initial render uses `<Suspense>` boundary in Layout.tsx ready for lazy migration ✓
**Severity:** LOW (positive prep)
**Resolution:** OK.

### §5-L3 — No detached DOM nodes investigation — Chrome DevTools snapshot deferred
**Severity:** LOW (§5.26)
**Resolution:** Manual investigation post-Beta on real device.

---

## NIT findings

### §5-N1 — `modulepreload` hints for vendor-react/vendor-state/vendor-icons in dist/index.html ✓ (positive)
**Resolution:** Vite auto-injects.

### §5-N2 — `dist/registerSW.js` = 134 bytes (tiny SW registration helper) ✓
**Resolution:** OK.

---

## Coverage map §5.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 5.1 | Bundle size analysis | §5-C1 — 432 KB main | CRITICAL |
| 5.2 | Tree-shaking effective | §5-M1/M2/M3 — POSITIVE | — |
| 5.3 | Code splitting routes lazy | §5-C3 — zero lazy | CRITICAL |
| 5.4 | Source maps strip | ✓ vite.config sourcemap:false | LOW positive |
| 5.5 | console.* strip production | §5-H4 = §1-C2 — NOT stripped | CRITICAL §1 |
| 5.6 | Debug code strip | vite default minify strips `if(process.env.DEV)` but no `__DEV__` block; console NOT stripped | MED |
| 5.7 | Lighthouse mobile 3G | NOT RUN — §5-C4 no infra | CRITICAL |
| 5.8 | Lighthouse desktop | NOT RUN | CRITICAL §5-C4 |
| 5.9 | TTI Maria 65 perception | NOT MEASURED, predicted >5s due to §5-C1 | CRITICAL |
| 5.10 | React render profile | §5-H2 — useMemo absent | HIGH |
| 5.11 | Zustand subscriptions granularity | OK — selectors used (s => s.streak, etc.) per Antrenor.tsx sample | LOW |
| 5.12 | Dexie query patterns optimized | NOT AUDITED — see §35 | covered §35 |
| 5.13 | Memory leaks useEffect cleanup | sample Antrenor.tsx:73 returns cleanup ✓; broader audit needed | LOW secondary |
| 5.14 | Critical render path | §5-C1 + §5-C3 — large main + no lazy | CRITICAL |
| 5.15 | RUM Real User Monitoring | §5-C4 — absent | CRITICAL |
| 5.16 | **LCP < 2.5s** | predicted FAIL @ 3G | CRITICAL §5-C1 |
| 5.17 | **FID < 100ms** | unclear, 432KB JS eval blocking | HIGH |
| 5.18 | **CLS < 0.1** | needs Lighthouse measure | HIGH §5-C4 |
| 5.19 | **TBT < 200ms** | predicted FAIL | CRITICAL §5-C1 |
| 5.20 | **Speed Index < 3.4s** | predicted FAIL | CRITICAL §5-C1 |
| 5.21 | **INP < 200ms** | needs measure §5-C4 | HIGH |
| 5.22 | **TTFB < 800ms** | GH Pages CDN dependent ~200-400ms typical | MED |
| 5.23 | Bundle budget per chunk | §5-C1 — 4.3x main over budget | CRITICAL |
| 5.24 | CI-enforceable perf thresholds | §5-C4 — absent | CRITICAL |
| 5.25 | Memory long-session | NOT TESTED — manual session pause/resume test | MED secondary |
| 5.26 | Detached DOM hunt | §5-L3 — manual | LOW |
| 5.27 | Worker termination | N/A no Web Workers | — |
| 5.28 | useMemo/useCallback appropriate | §5-H2 — zero usage | HIGH |
| 5.29 | Suspense boundaries strategic | Layout.tsx has 1 — good single boundary; works w/ §5-C3 lazy | MED |
| 5.30 | FCP < 1.8s | depends on §5-C1 | CRITICAL §5-C1 |
| 5.31 | Largest interactive < 3s | depends on §5-C1 + §5-H2 | CRITICAL §5-C1 |
| 5.32 | Image lazy-load + responsive | N/A no images shipped (icons only) | — |
| 5.33 | Font display swap | §1-H4 Inter not loaded | HIGH §1 |
| 5.34 | Lighthouse PWA score ≥ 90 | §5-C4 unmeasured but PWA infra OK (manifest + SW) | MED secondary |

## Karpathy 4 principii distribution §5

- Think Before Coding: 2 (C2, H2)
- Simplicity First: 1 (M5)
- Surgical Changes: 5 (C1, C3, H1, H3, H6)
- Goal-Driven Execution: 3 (C4, H2, H5)
