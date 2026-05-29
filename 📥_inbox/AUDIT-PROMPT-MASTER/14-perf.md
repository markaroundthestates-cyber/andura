# SECTION 14 — PERFORMANCE / BUNDLE / MOTION BUDGET / COLD-START

> **Weight 4% · Gate 90% · Critical: no.**
>
> **What this section is.** The "is the app fast + smooth on a Maria-65
> mid-range phone, and does the Pulse motion not jank" audit. It checks four
> distinct cost surfaces, each verified independently:
>   1. **Bundle budgets** — every `.size-limit.json` budget present + green, the
>      main chunk under budget, the 657-exercise dataset code-split, vendor
>      splits correct, the 23 lazy sub-routes actually split out of the shell.
>   2. **Motion budget** — the Pulse aurora (3 blurred blobs + conic depth +
>      grain + vignette), the ReadinessOrb (breathing core + 2 conic auras + 2
>      halo rings), the Pulse idioms (gradShift / shine / auraSpin / glowBreath /
>      ring) — all transform/opacity-only, GPU-composited, `will-change` tagged
>      where it earns it, and **fully collapsed** under `prefers-reduced-motion`
>      AND `[data-calm="1"]`. No infinite layout-thrash. 60fps target. Plus the
>      desktop bezel transform cost.
>   3. **Cold-start / LCP** — `applyInitialTheme()`/`applyInitialPalette()` run
>      pre-mount (no FOUC), `font-display:swap`, self-hosted Latin-subset fonts,
>      Splash → first-paint, no render-blocking script, `injectRegister:'script-defer'`.
>   4. **Runtime** — `SessionElapsed` 1Hz leaf isolation (no full-subtree
>      re-render), `useCountUp` rAF cleanup + reduced-motion snap, wake-lock no
>      leak, the Istoric session list (NOT virtualized), no memory leak in the
>      workout `setInterval` loops.
>
> **The machine bar.** `npm run size` (`size-limit` + `@size-limit/preset-app`)
> is the deterministic gate for the 8 bundle budgets; `npm run lighthouse`
> (`lhci autorun`, `lighthouserc.cjs`, mobile preset, 3 runs) is the
> deterministic gate for FCP/LCP/CLS/TBT + the perf category score. Both REQUIRE
> a fresh `npm run build` first (`dist/` must exist + be current). The motion +
> runtime steps are the JUDGEMENT items those two harnesses cannot prove — run
> via Playwright performance trace / FPS observation / `getComputedStyle` reads.
>
> **Device model.** "Maria-65 phone" = mid-range Android (~Moto G / 4× CPU
> slowdown, 3G-ish). The lighthouse `preset:'mobile'` + `throttlingMethod:'devtools'`
> approximates this. Where a step says "on a Maria-65 phone", the Playwright
> verify uses CDP `Emulation.setCPUThrottlingRate(4)` + a slow-network profile.
>
> **Budget-baseline caveat.** `lighthouserc.cjs` thresholds are the RATCHETED
> first-CI-run realistic baseline (perf ≥0.60, FCP <3.5s, LCP <4.5s, CLS <0.2,
> TBT <800ms — lines 45-52), NOT the master-spec aspirational bar (perf ≥85,
> FCP <1.8s, LCP <2.5s, CLS <0.1, TBT <200ms — lines 8-9). A step that passes
> the realistic gate but misses the aspirational bar is recorded **PARTIAL** with
> the measured value, so Daniel can rule on the ratchet-up before Beta.

---

## 14.0 — Harness prerequisites (every budget/lighthouse step depends on these)

### [14.001] Production build is current + present
- **Check:** `dist/` exists and reflects the current `src/` (size-limit + lighthouse both read `dist/`).
- **Where:** `package.json:12` (`"build": "vite build"`); `vite.config.js:172` (`outDir: 'dist'`).
- **Expected:** `npm run build` completes with zero errors; `dist/assets/` contains hashed `index-*.js`, `main-*.js`, `data-library-*.js`, `vendor-react-*.js`, `vendor-icons-*.js`, `vendor-data-*.js`, `vendor-state-*.js`, plus CSS + the SW (`sw.js`, `workbox-*.js`, `manifest.webmanifest`).
- **Verify:** `npm run build` → exit 0; `ls dist/assets/*.js dist/assets/*.css dist/sw.js dist/manifest.webmanifest`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: build exit code + the dist/assets listing.)_
- **Notes:** If build fails → this whole section's machine steps are BLOCKED (record the build error). A stale `dist/` would make every budget step measure the wrong bytes.

### [14.002] size-limit tooling resolves + config loads
- **Check:** `size-limit` + `@size-limit/preset-app` are installed and the config parses.
- **Where:** `package.json:47` (`"size": "size-limit"`), `package.json:61,96` (deps); `.size-limit.json` (8 entries).
- **Expected:** `npm run size` runs the 8 budgets without a config/parse error; each entry's `path` glob matches exactly one (or the intended) `dist/assets/*` file.
- **Verify:** `npm run size` → emits a table of 8 rows (each name from `.size-limit.json`), gzip on, no "no files found" warning.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: the full size-limit table output.)_
- **Notes:** A glob that matches ZERO files (e.g. a vendor chunk got merged away) is a silent budget hole — record as FAIL, not PASS.

### [14.003] Lighthouse CI tooling resolves + config loads
- **Check:** `@lhci/cli` is installed and `lighthouserc.cjs` parses; preview server starts.
- **Where:** `package.json:39` (`"lighthouse": "lhci autorun"`), `package.json:58`; `lighthouserc.cjs:22-60`.
- **Expected:** `npm run lighthouse` boots `npm run preview` (vite preview on :4173), runs 3 mobile-preset passes, asserts the thresholds, uploads to temporary-public-storage.
- **Verify:** `npm run lighthouse` → 3 runs complete, an assertion summary prints, an HTML report URL is emitted.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: assertion summary + report URL + median scores.)_
- **Notes:** If preview won't boot (port busy) → BLOCKED with the reason. The live variant is `npm run lighthouse:live` (`--collect.url=https://andura.app`).

---

## 14.1 — Bundle budgets (.size-limit.json — 8 entries, all gzip)

### [14.010] "main entry (index)" budget ≤ 150 KB gzip
- **Check:** `dist/assets/index-*.js` (the entry / Sentry-on-demand chunk) is within its budget.
- **Where:** `.size-limit.json:2-7` (name "main entry (index)", limit "150 KB", gzip true).
- **Expected:** measured gzip size ≤ 150 KB. NOTE: per `vite.config.js:86-89` the `index-*` chunk = the unnamed dynamic-import chunk (Sentry ~145 KB gzip) and is `globIgnores`'d from precache — its weight only lands on telemetry opt-in users, but the budget still pins it.
- **Verify:** `npm run size` → the "main entry (index)" row passes (green). Cross-check raw: `ls -l dist/assets/index-*.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: measured gzip + headroom.)_
- **Notes:** If over → `npm run size:why` (`size-limit --why`) to attribute the bloat. Sentry is the dominant cost; a non-Sentry import leaking into this chunk is the likely regression.

### [14.011] "main chunk (app code)" budget ≤ 175 KB gzip
- **Check:** `dist/assets/main-*.js` (the app shell first-paint chunk) within budget.
- **Where:** `.size-limit.json:8-13` (limit "175 KB").
- **Expected:** measured gzip ≤ 175 KB. This is the chunk the BUNDLE-CI-RED + ROUTE_LAZY_LOAD work fought to keep under budget (router.tsx flipped 4 tab homes eager→lazy; main.tsx idle-preloads Splash/Auth).
- **Verify:** `npm run size` → "main chunk (app code)" row green; `ls -l dist/assets/main-*.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** If over → check (a) a heavy screen eagerly imported into the shell (regression of `router.tsx:32-35` lazy), (b) the exercise dataset leaking back into main (data-library split, `vite.config.js:219-221`). `size:why` confirms.

### [14.012] "data-library (exercise dataset)" budget ≤ 28 KB gzip
- **Check:** `dist/assets/data-library-*.js` (657 exercises + equipmentMap + muscleGroupMap) within budget.
- **Where:** `.size-limit.json:14-19` (limit "28 KB"); split rule `vite.config.js:219-221` (`src/engine/(exerciseLibrary|equipmentMap|muscleGroupMap).js` → `data-library`).
- **Expected:** measured gzip ≤ 28 KB; the dataset is a SEPARATE chunk, NOT in `main-*.js` (raw ~485 KB → highly compressible static payload pulled out of main per the vite comment lines 184-191).
- **Verify:** `npm run size` → "data-library" row green; confirm a `data-library-*.js` file actually exists in `dist/assets/` (proves the split fired).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: gzip size + that the file exists.)_
- **Notes:** If NO `data-library-*.js` exists → the manualChunks regex stopped matching (e.g. a file renamed) → dataset silently back in main → FAIL even if "main" still passes (it would be over). Cross-ref [14.011].

### [14.013] "vendor (react)" budget ≤ 26 KB gzip
- **Check:** `dist/assets/vendor-react-*.js` (react + react-router stack) within budget.
- **Where:** `.size-limit.json:20-25` (limit "26 KB"); split `vite.config.js:205-207`.
- **Expected:** gzip ≤ 26 KB; contains react + react-router + react-router-dom + @remix-run/router. NOTE per vite comment (lines 199-198): react-dom + scheduler are deliberately NOT here (they stay in main, `vite.config.js:202-204` returns undefined).
- **Verify:** `npm run size` → "vendor (react)" row green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** —

### [14.014] "vendor (icons)" budget ≤ 8 KB gzip
- **Check:** `dist/assets/vendor-icons-*.js` (lucide-react) within budget.
- **Where:** `.size-limit.json:26-31` (limit "8 KB"); split `vite.config.js:211-213`.
- **Expected:** gzip ≤ 8 KB. lucide-react is tree-shaken (per-icon named imports like `X, MoreHorizontal` in SessionTimer.tsx:40) so only USED glyphs ship — if this chunk balloons, a `import * as Icons` or a barrel re-export is leaking the whole set.
- **Verify:** `npm run size` → "vendor (icons)" row green; `size:why` if over (lists every icon dragged in).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** A regression here usually = someone imported lucide via a namespace/barrel, defeating tree-shaking.

### [14.015] "vendor (data)" budget ≤ 33 KB gzip
- **Check:** `dist/assets/vendor-data-*.js` (Dexie/IndexedDB) within budget.
- **Where:** `.size-limit.json:32-37` (limit "33 KB"); split `vite.config.js:214-216`.
- **Expected:** gzip ≤ 33 KB. Dexie is lazy-imported only from destructive flows (export/delete) per the vite comment (lines 79-85) + `globIgnores`'d from precache (`vite.config.js:88`), so its weight is off the first-install path — but the budget still pins the chunk.
- **Verify:** `npm run size` → "vendor (data)" row green; confirm `vendor-data-*.js` exists.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** Cross-ref §13 PWA — this chunk + `index-*` (Sentry) are the two `globIgnores` entries that need the `app-assets-js` StaleWhileRevalidate runtime cache (`vite.config.js:155-165`) to work offline.

### [14.016] "vendor (state)" budget ≤ 1.5 KB gzip
- **Check:** `dist/assets/vendor-state-*.js` (zustand) within budget.
- **Where:** `.size-limit.json:38-43` (limit "1.5 KB"); split `vite.config.js:208-210`.
- **Expected:** gzip ≤ 1.5 KB (zustand is tiny — a tight budget catches an accidental store-middleware/persist bloat landing here).
- **Verify:** `npm run size` → "vendor (state)" row green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** —

### [14.017] "CSS total" budget ≤ 12 KB gzip
- **Check:** `dist/assets/*.css` total within budget.
- **Where:** `.size-limit.json:44-49` (limit "12 KB", glob matches ALL css).
- **Expected:** gzip ≤ 12 KB for ALL emitted CSS combined (Tailwind purged + global.css + the inline `<style>` blocks are component-scoped JS, NOT in this glob).
- **Verify:** `npm run size` → "CSS total" row green; `ls -l dist/assets/*.css`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** If over → Tailwind purge (`content` globs) likely missing a path, or an unpurged safelist. The aurora/orb `<style>` blocks live in JS bundles (AuroraBackground.tsx:48, ReadinessOrb.tsx:108) so they count against JS budgets, not this one — note that when attributing.

### [14.018] All 8 budgets pass as a single gate (CI-equivalent)
- **Check:** `npm run size` exits 0 (every one of the 8 budgets green).
- **Where:** `.size-limit.json` (all 8 entries); CI wiring (cross-ref the workflow that runs `size`).
- **Expected:** exit code 0, no row over limit, no "no files found" row.
- **Verify:** `npm run size`; `echo $?` (PowerShell: `$LASTEXITCODE`) → 0.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: exit code + table.)_
- **Notes:** This is the single machine gate for 14.1. A non-zero exit with any individual budget step PASS above = contradiction → re-measure.

### [14.019] No unexpected large chunk outside the 8 budgeted globs
- **Check:** No `dist/assets/*.js` chunk over ~30 KB gzip escapes a size-limit budget (an un-budgeted heavy chunk = a blind spot).
- **Where:** all `dist/assets/*.js` vs the 8 globs in `.size-limit.json`.
- **Expected:** every heavy chunk is either budgeted or is an expected lazy route chunk (Antrenor/Progres/Istoric/Cont + sub-screens, hashed). No surprise 100 KB chunk with no budget.
- **Verify:** `ls -lS dist/assets/*.js` (sorted by size) → eyeball the top entries; gzip the largest un-budgeted one and confirm it's a known lazy route, not a leaked vendor.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: top-5 chunks by size + which budget each maps to.)_
- **Notes:** `chunkSizeWarningLimit: 600` (`vite.config.js:228`) raises Vite's own warning so a heavy lazy chunk won't be flagged at build — this manual step is the backstop.

---

## 14.2 — Code-splitting (lazy routes + Suspense + no eager heavy import)

### [14.030] All 4 tab homes are lazy (split out of main shell)
- **Check:** Antrenor / Progres / Istoric / Cont are `React.lazy`, not eager imports.
- **Where:** `src/react/routes/router.tsx:32-35`.
- **Expected:** each is `lazy(() => import('./screens/.../X').then(m => ({default: m.X})))`; each produces its own `dist/assets/*-*.js` chunk; none appears in `main-*.js`.
- **Verify:** read router.tsx:32-35 (all 4 `lazy(`); `grep -n "lazy(" src/react/routes/router.tsx` → ≥27 entries; in dist, confirm separate `Antrenor-*.js` / `Progres-*.js` / `Istoric-*.js` / `Cont-*.js` chunks exist.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: the 4 lazy lines + the 4 dist chunks.)_
- **Notes:** Per the router comment (lines 11-15) eager-importing these pushed main +5.5 KB over budget. A regression to eager = FAIL + likely [14.011] also fails.

### [14.031] All 23 sub-routes are lazy + the count matches
- **Check:** Every non-home sub-screen (Antrenor 11+2 confirm, Progres 4, Istoric 2, Cont 18) is `React.lazy`.
- **Where:** `src/react/routes/router.tsx:39-102` (the lazy declarations) + the route table lines 134-225.
- **Expected:** the router header claims "23" sub-routes (line 8); the ACTUAL lazy count is higher now (PARITY waves added FinishEarly/ProgramChange/WeightTimeline/PrWall + more Cont confirms) — verify EVERY route element is wrapped in `<LazyRoute>` or `<TopLevelRoute>` (both Suspense-wrap), zero eager `<Screen/>` in the route table.
- **Verify:** `grep -nE "element: <(Lazy|TopLevel)Route>" src/react/routes/router.tsx | wc -l` vs total `element:` count → equal (every element is Suspense-wrapped). `grep -c "= lazy(" src/react/routes/router.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: lazy count + wrapped-element count vs total element count.)_
- **Notes:** The "23" in the header comment is stale (route count grew) — record the real number. A route element NOT wrapped in Lazy/TopLevel = eager import = FAIL.

### [14.032] Suspense fallback is the canonical LoadingSkeleton (no layout shift)
- **Check:** Lazy chunk load shows a stable skeleton, not a blank flash or CLS spike.
- **Where:** `router.tsx:109-115` (`LazyRoute` → `<Suspense fallback={<LoadingSkeleton testId="lazy-route-fallback" />}>`).
- **Expected:** every lazy route resolves through `LazyRoute`/`TopLevelRoute`; the fallback is `LoadingSkeleton` (single source); fallback occupies layout so the chunk swap causes no CLS.
- **Verify:** Playwright (CPU 4× throttle) navigate `/app/progres` → observe `[data-testid="lazy-route-fallback"]` paints, then content; capture CLS via PerformanceObserver `layout-shift` during the swap → ≈0.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: fallback seen + CLS during swap.)_
- **Notes:** Router comment (line 107) targets "~50-100ms typical chunk load 3G median, no layout shift". A fallback that's smaller than the loaded content = CLS → PARTIAL.

### [14.033] Top-level entry routes lazy + double-wrapped with ErrorBoundary
- **Check:** Splash / Auth / AuthCallback / Onboarding / Terms / Privacy / NotFound are lazy + crash-safe.
- **Where:** `router.tsx:39-48` (lazy) + `router.tsx:126-132` (`TopLevelRoute` = `ErrorBoundary` ⊃ `LazyRoute`).
- **Expected:** these 7 are `lazy` (one-time-entry flow, not daily tabs — ROUTE_LAZY_LOAD_INVESTIGATION lines 17-19) AND wrapped in ErrorBoundary so a first-contact render crash shows fallback UI, not a white screen.
- **Verify:** read router.tsx:135-142,225 (each entry route uses `<TopLevelRoute>`); confirm `lazy(` for each at lines 39-48.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** —

### [14.034] No heavy screen eagerly imported into the shell
- **Check:** No top-of-tree eager `import` pulls a route/screen body into `main-*.js`.
- **Where:** `src/main.tsx:1-16` (entry imports) + `router.tsx` import block (lines 21-27 only static: lazy/Suspense, router, ProtectedRoute, Layout, LoadingSkeleton, ErrorBoundary).
- **Expected:** main.tsx imports only the router + boot/theme/sentry-gate + global.css; router.tsx statically imports ONLY the shell primitives (ProtectedRoute, Layout, LoadingSkeleton, ErrorBoundary) — every screen is `lazy`.
- **Verify:** `grep -nE "^import .*screens/" src/react/routes/router.tsx` → ZERO static screen imports (all screens via `lazy(`). `grep -nE "^import" src/main.tsx` → no screen import.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: the grep output.)_
- **Notes:** A static `import { Antrenor }` at top of router.tsx would defeat the split silently (still renders) — this grep catches it.

### [14.035] Critical lazy chunks idle-preloaded post-mount (no Suspense stall on first nav)
- **Check:** Splash + Auth chunks are prefetched at idle so the first route swap is instant.
- **Where:** `src/main.tsx:102-112` (`preloadCriticalChunks` via `requestIdleCallback`, setTimeout(200) fallback for Safari <16.4).
- **Expected:** post-mount idle → `import('./screens/Splash')` + `import('./screens/Auth')` fire (warm the chunk cache), zero LCP impact (idle, off main-thread critical path).
- **Verify:** Playwright load `/` → Network panel shows Splash + Auth chunk fetched shortly after first paint (not blocking); confirm `requestIdleCallback` path taken in a Chromium trace.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: network timing of the two preloads vs FCP.)_
- **Notes:** Per D060/D064 (main.tsx:89) this is the modulepreload-equivalent Vite omits for dynamic imports. If the preloads block render (fired sync, not idle) → PARTIAL.

---

## 14.3 — Motion budget (aurora / orb / Pulse idioms — GPU + reduced-motion + calm)

### [14.050] Aurora blobs animate transform-only (compositor, not layout/paint)
- **Check:** The 3 aurora blobs animate ONLY `transform` (translate/scale), never width/height/top/left/filter per-frame.
- **Where:** `src/react/components/pulse/AuroraBackground.tsx:100-111` (`@keyframes pulseAurora1/2/3` — all `transform: translate(...) scale(...)`).
- **Expected:** keyframes touch only `transform`; `filter: blur(64px)` is STATIC (set once line 56, not animated) so the expensive blur is rasterized once, not recomputed per frame.
- **Verify:** read AuroraBackground.tsx:100-111 → keyframes are transform-only; line 56 blur is on `.pulse-aurora-blob` base, not in any `@keyframes`. Playwright → DevTools Performance/Rendering "Paint flashing" off during idle (no repaint), Layers panel shows blobs on their own compositor layer.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: keyframe props + paint-flashing observation.)_
- **Notes:** An animated `filter`/`width` here would re-rasterize a 64-80px blur every frame = catastrophic on Maria-65 → FAIL. Currently static blur = correct.

### [14.051] Aurora blobs are `will-change: transform` (single composite, GPU-promoted)
- **Check:** Each blob is tagged `will-change: transform` so it's promoted to its own GPU layer.
- **Where:** `AuroraBackground.tsx:57` (`will-change: transform; mix-blend-mode: screen;`).
- **Expected:** `will-change: transform` present on `.pulse-aurora-blob`; the blob count is exactly 3 (b1/b2/b3) so layer count is bounded (will-change is NOT mass-applied — only the moving blobs).
- **Verify:** read AuroraBackground.tsx:55-58; `grep -c "will-change" src/react/components/pulse/AuroraBackground.tsx`; Playwright Layers panel → exactly 3 promoted blob layers (+ depth), not hundreds.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** Over-applying `will-change` (e.g. to every card) would explode GPU memory on a low-end phone — verify it's scoped to the genuinely-moving aurora/confetti (global.css:624 confetti also has it, which is correct — short-lived).

### [14.052] Conic depth sweep is transform-only + bounded
- **Check:** The `.pulse-aurora-depth` conic-gradient layer rotates via `transform` only.
- **Where:** `AuroraBackground.tsx:81-87` + `@keyframes pulseAuroraConic` line 112 (`to { transform: translate(-50%,-50%) rotate(360deg); }`).
- **Expected:** rotation is `transform: rotate`, 64s cycle (`calc(64s / max(var(--motion), .3))`); the conic-gradient is painted once (static background), only the layer transform spins. opacity .6 static.
- **Verify:** read lines 81-87,112; Playwright → no repaint of the conic layer during the spin (Paint flashing).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** A 170%×170% conic that re-paints per frame would be heavy; transform-spin of a once-painted layer is cheap.

### [14.053] Grain layer is a static inline SVG data-URI (no per-frame noise regen)
- **Check:** The `.pulse-aurora-grain` is a static `background-image` SVG turbulence, NOT an animated/canvas noise.
- **Where:** `AuroraBackground.tsx:89-92` (inline `data:image/svg+xml,...feTurbulence...`, opacity .05).
- **Expected:** grain is a single static 120×120 tiled SVG, no animation, opacity .05 (barely there) — zero runtime cost after first paint.
- **Verify:** read lines 89-92 → no `animation` on `.pulse-aurora-grain`; it's a data-URI background.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** `feTurbulence` is rasterized once. The header (line 35) claims "no canvas, no particles" — verify that holds.

### [14.054] Aurora collapses fully under prefers-reduced-motion
- **Check:** With `prefers-reduced-motion: reduce`, all aurora animations stop.
- **Where:** `AuroraBackground.tsx:117-119` (scoped `@media (prefers-reduced-motion: reduce) { .pulse-aurora-blob, .pulse-aurora-depth { animation: none !important; } }`) + the GLOBAL block `global.css:924-931` (`*,*::before,*::after { animation-duration: 0.01ms !important; ... }`).
- **Expected:** under reduced-motion the blobs + depth are static (no drift, no spin) — both the scoped rule AND the global cap apply (belt + suspenders).
- **Verify:** Playwright `page.emulateMedia({ reducedMotion: 'reduce' })` → load app → `getComputedStyle(blob).animationName === 'none'` (or animationDuration ≈ 0.01ms).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: computed animation on a blob under reduced-motion.)_
- **Notes:** —

### [14.055] Aurora collapses fully under [data-calm="1"]
- **Check:** Setting `data-calm="1"` on the root hard-stops the aurora loops (motion=0 escape).
- **Where:** `AuroraBackground.tsx:113-116` (`[data-calm="1"] .pulse-aurora-blob, [data-calm="1"] .pulse-aurora-depth { animation: none !important; }`).
- **Expected:** `<html data-calm="1">` → blobs + depth static.
- **Verify:** Playwright `document.documentElement.setAttribute('data-calm','1')` → `getComputedStyle(blob).animationName === 'none'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** ⚠️ **GAP to flag:** grep finds NO JS writer for `data-calm` or `--motion` anywhere in `src/` (only the CSS consumers in AuroraBackground/ReadinessOrb/Splash/Sparkline/PulseMark + the [data-calm] rules). So the calm escape + the `--motion` intensity scalar are CSS-ready but **never set by the app** — `var(--motion)` always falls back to the `max(...,.4)`/`.3`/`.25`/`.35` floor (full motion), and `[data-calm="1"]` never fires except via this manual test. Record PARTIAL with this note: the motion-intensity picker / calm wiring is absent. The settings Appearance picker may be intended to set it — verify whether SettingsAppearance writes `--motion`/`data-calm`; if not, the "dial motion down" affordance is dead.

### [14.056] ReadinessOrb layers animate transform/opacity-only
- **Check:** Orb core breath + 2 conic auras + 2 halo rings animate only transform/opacity.
- **Where:** `ReadinessOrb.tsx:133-136` (`@keyframes orbBreath` scale+opacity, `orbSpin`/`orbSpinRev` rotate, `orbPulseRing` scale+opacity).
- **Expected:** all transform/opacity; the conic `filter: blur(8px)` on auras (line 117) is STATIC, not animated.
- **Verify:** read ReadinessOrb.tsx:108-136 → keyframes transform/opacity-only, blur static (line 117 base, not in keyframes).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** 5 simultaneous infinite loops on ONE element cluster — bounded (one orb on screen at a time, Antrenor hero) so acceptable, but verify only one orb mounts at once.

### [14.057] ReadinessOrb collapses under reduced-motion + calm
- **Check:** Orb loops stop under both prefers-reduced-motion and [data-calm="1"].
- **Where:** `ReadinessOrb.tsx:137-147` (both the `[data-calm="1"]` block + the scoped `@media (prefers-reduced-motion: reduce)` block set `animation: none !important`).
- **Expected:** core/aura/aura2/pulse static under both conditions; the center count-up also snaps (see [14.070]).
- **Verify:** Playwright reduced-motion emulate → orb `.orb-core` animationName 'none'; set `data-calm="1"` → same.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** —

### [14.058] Pulse idioms (gradShift/shine/auraSpin/glowBreath/ring) are transform/opacity/background-position-only
- **Check:** The shared Pulse motion classes don't trigger layout.
- **Where:** `global.css:857-861` (`@keyframes pulse-grad-shift` background-position, `pulse-shine` transform, `pulse-aura-spin` rotate, `pulse-glow-breath` opacity, `pulse-ring` scale+opacity).
- **Expected:** gradShift animates `background-position` (cheap, no layout), shine/auraSpin/ring use transform, glowBreath uses opacity. `.pulse-orb-aura` blur (line 900) static.
- **Verify:** read global.css:857-905 → confirm each keyframe's animated property is in {transform, opacity, background-position}.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** `background-position` animation is compositor-friendly for a fixed-size gradient; acceptable.

### [14.059] Pulse idioms collapse under reduced-motion + [data-calm="1"]
- **Check:** gradShift/shine/orb-aura/live-glow/ring + the 3 ambient auroras stop under both.
- **Where:** `global.css:907-919` ([data-calm="1"] block) + `global.css:924-931` (global reduced-motion cap).
- **Expected:** every looping Pulse idiom + `.animate-aurora-1/2/3` collapse under [data-calm] (line 915-917) and the global * cap covers reduced-motion.
- **Verify:** Playwright reduced-motion → `.pulse-gradtext` animationDuration ≈0.01ms; `data-calm="1"` → `.animate-aurora-1` animationName 'none'.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** Cross-ref [14.055] — [data-calm] coverage exists in CSS but is never set in JS.

### [14.060] No infinite layout-thrash animation anywhere
- **Check:** No `@keyframes` animates a layout-triggering property (width/height/margin/top/left/padding) on an `infinite` loop.
- **Where:** `global.css` all `@keyframes` (lines 490-861) + the component `<style>` blocks (AuroraBackground/ReadinessOrb/Splash/Sparkline/PulseMark).
- **Expected:** every `infinite` animation uses only transform/opacity/background-position/stroke-dashoffset/filter-static. Finite one-shots (ripple, confetti, success-burst, check-draw) may be richer but don't loop.
- **Verify:** `grep -nE "@keyframes" src/styles/global.css` → for each infinite-paired keyframe, confirm no `width:|height:|top:|left:|margin|padding` inside; same scan of the 5 component `<style>` blocks.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: list of infinite keyframes + their animated props.)_
- **Notes:** Known infinite loops: aurora-1/2/3, pulse-grad-shift/shine/aura-spin/glow-breath/ring, orbBreath/orbSpin/orbSpinRev/orbPulseRing, andura-breath/flame/ambient-drift/shimmer, splashDotFloat, pulseAurora1/2/3/Conic, spark, pulse-mark-wave. Verify ALL are transform/opacity/bg-position.

### [14.061] 60fps during the Antrenor hero (orb + aurora live) on a throttled CPU
- **Check:** The Coach home (orb + aurora + Pulse idioms all live) holds ~60fps on Maria-65.
- **Where:** Antrenor home rendering ReadinessOrb + Layout's AuroraBackground.
- **Expected:** during idle hero animation, frame rate stays ≥ ~55fps with 4× CPU throttle; no long task > 50ms repeating.
- **Verify:** Playwright + CDP `Emulation.setCPUThrottlingRate(4)` → navigate `/app/antrenor` (seeded) → capture a 5s performance trace → analyze frames (`browser.startTracing` / Performance trace) → median FPS + longest task.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: median FPS + longest main-thread task during idle.)_
- **Notes:** If < 50fps → likely the mix-blend-mode + multiple blurred layers compositing cost; consider fewer blob layers on coarse-pointer/low-end. Record the measured number.

### [14.062] Desktop phone bezel transform cost is one-time (no per-frame relayout)
- **Check:** The ≥768px desktop bezel (#root as device screen, overflow scroll, translateZ(0)) doesn't cost per-frame.
- **Where:** `global.css:975-1053` (desktop bezel block: `#root` becomes fixed-size scroll container, `transform: translateZ(0)` containing block, `::before` ring + `::after` notch).
- **Expected:** the bezel is static chrome (translateZ(0) promotes once); inner scroll is the only motion; no animation on the bezel. The mobile (<768px) path is edge-to-edge, zero frame (PWA invariant, `global.css:962-973`).
- **Verify:** Playwright desktop viewport (≥768px) → scroll the inner content → DevTools Rendering "Paint flashing": bezel ring/notch do NOT repaint, only content scrolls; Layers shows #root promoted once.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: paint observation on scroll.)_
- **Notes:** Memory note (Pulse redesign): the bezel must not break sticky SubHeader / fixed BottomNav — that's a parity/layout check, here we only verify it's not a perf cost. Mobile must stay frameless.

### [14.063] backdrop-filter blur(14px) on glass cards has a no-blur fallback (cost + legibility)
- **Check:** Glass surfaces use `backdrop-filter: blur(14px)` with a `@supports not` fallback.
- **Where:** `global.css:420-421` (blur) + `global.css:451-456` (`@supports not (backdrop-filter...)` fallback for legibility/perf).
- **Expected:** blur present with `-webkit-` prefix; a `@supports not` block gives a solid-ish fill where backdrop-filter is unsupported (older Android WebView) so text stays legible AND the GPU isn't asked for an unsupported effect.
- **Verify:** read global.css:420-421,451-456; Playwright on a glass card → computed `backdrop-filter` = blur(14px) in Chromium.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** Count how many simultaneous backdrop-filter surfaces stack — many overlapping blurs on one screen is a known low-end killer. If a screen stacks ≥3 live blur layers over the animated aurora → PARTIAL (note the screen).

---

## 14.4 — Cold-start / LCP / FOUC

### [14.080] Theme applied pre-mount (no FOUC light→dark flash)
- **Check:** `applyInitialTheme()` sets `<html data-theme>` synchronously BEFORE React mounts.
- **Where:** `src/main.tsx:19` (`applyInitialTheme()` called before `createRoot`) + `themeSync.ts:32-48` (synchronous localStorage read, default 'dark').
- **Expected:** the data-theme attribute is set in the same synchronous tick as module eval, before first paint → no light-then-dark flash. Default 'dark' matches the index.html FOUC shell (#090b13).
- **Verify:** read main.tsx:18-26 (applyInitialTheme + applyInitialPalette + syncHtmlLang all pre-createRoot at line 78); Playwright fresh load (dark default) → no white/light flash frame at first paint (screenshot at ~50ms).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: first-paint screenshot + the pre-mount call order.)_
- **Notes:** `applyInitialPalette()` (main.tsx:22) + `applyInitialAccent()` also pre-mount (paletteSync.ts:109-113). A persisted light-mode user re-skins on hydrate — acceptable (dark is the common default).

### [14.081] index.html FOUC shell matches the dark default (no flash before CSS loads)
- **Check:** The inline `<style>` in index.html paints the dark Pulse shell before global.css arrives.
- **Where:** `index.html:66-84` (inline `html,body { background:#090b13; color:#f3f5fc; ... }` + `#root { min-height:100vh }`).
- **Expected:** the pre-hydration paint = Pulse-dark (#090b13 / #f3f5fc), Manrope/Inter/system fallback — so the very first frame already looks like the app, not a white page.
- **Verify:** read index.html:66-84; Playwright throttle network → the first frame (before global.css) is dark, not white.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** `<meta name="theme-color" content="#090b13">` (line 6) + `color-scheme: dark light` (line 8) reinforce. A light-default user still flashes dark first here — accepted (CEO default is dark).

### [14.082] Fonts are self-hosted Latin-subset @font-face with font-display:swap
- **Check:** Pulse fonts (Space Grotesk / Manrope / Space Mono + Inter fallback) self-hosted, Latin-subset, swap.
- **Where:** `global.css:30-68` (5 `@font-face`, each `font-display: swap`) + the D061 note (index.html:42-48: Latin subset 344→48KB via @fontsource, no Google Fonts).
- **Expected:** every `@font-face` has `font-display: swap` (FOUT not FOIT — text visible immediately in fallback, swaps when font loads); Latin unicode-range subset (no Cyrillic/extended) so the WOFF2 is small; `font-src 'self'` CSP (index.html:16) — no external font fetch.
- **Verify:** `grep -c "font-display: swap" src/styles/global.css` → ≥5; `grep -n "unicode-range" src/styles/global.css`; Network panel → fonts fetched from same-origin, no fonts.googleapis.com.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: font-display count + unicode-range + network origin.)_
- **Notes:** The Google-fonts runtime cache (`vite.config.js:127-133`) is vestigial now fonts are self-hosted — note it but it's harmless. Verify the Latin subset covers the no-diacritics RO glyph set (D-LEGACY-064) — it should, RO-no-diacritics is pure Latin.

### [14.083] No render-blocking script in <head>
- **Check:** The SW registration + module entry don't block first paint.
- **Where:** `vite.config.js:48` (`injectRegister: 'script-defer'` — registerSW.js gets `defer`) + `index.html:88` (`<script type="module" src="/src/main.tsx">` — modules are deferred by spec) + the SPA-redirect inline script (index.html:54-65, tiny, runs sync but trivial).
- **Expected:** `registerSW.js` is `defer` (D060 / Lighthouse-perf — eliminates the ~952ms render-block the default 'auto' caused, vite.config.js:42-47); the entry is a module (non-blocking); the only sync inline script is the ~10-line SPA redirect decoder.
- **Verify:** build → inspect `dist/index.html` → `registerSW.js` has `defer`; no synchronous `<script src>` without defer/async except the trivial inline redirect. Lighthouse "render-blocking resources" audit ≈ 0ms.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: dist/index.html script tags + lighthouse render-block ms.)_
- **Notes:** —

### [14.084] DNS-prefetch hints for Firebase/Sentry endpoints present
- **Check:** First auth/telemetry connects are warmed via dns-prefetch.
- **Where:** `index.html:38-41` (dns-prefetch for the RTDB host, identitytoolkit, securetoken, sentry ingest).
- **Expected:** the 4 dns-prefetch links resolve DNS early (~50-100ms saved on first auth/telemetry per §36-M3 note line 35); Google Fonts preconnect correctly REMOVED post self-host (line 37).
- **Verify:** read index.html:35-41 → 4 `dns-prefetch`, no `fonts.googleapis/gstatic` preconnect.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** —

### [14.085] Splash auto-advance (2600ms) does not block or stall first interaction
- **Check:** The Splash is tap-to-skip + auto-advances; it doesn't trap a returning user.
- **Where:** `src/react/routes/screens/Splash.tsx:28` (`ADVANCE_MS = 2600`) + lines 36-48 (tap/Enter/Space skip, single timer, guarded by advancedRef).
- **Expected:** Splash paints fast (lazy chunk, idle-preloaded per [14.035]); auto-advances at 2.6s OR on tap/keyboard immediately; routes by `isAuthenticated` (returning user → /app/antrenor, anon → /auth). No double-navigate (advancedRef guard).
- **Verify:** Playwright load `/` → tap → navigates immediately (< 2600ms); reload, wait 2.6s → auto-advances. Confirm one navigate only.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: skip timing + auto-advance timing.)_
- **Notes:** 2.6s is a deliberate brand beat, not a perf stall — but for a daily returning user it's a forced wait unless they tap. Note if Gigel-friendliness suggests a shorter authed-user path. Not a perf FAIL.

### [14.086] LCP / FCP / CLS / TBT within the lighthouse gate (measured)
- **Check:** The core web vitals pass the committed lighthouse assertions.
- **Where:** `lighthouserc.cjs:49-52` (FCP <3500ms, LCP <4500ms, CLS <0.2, TBT <800ms — all 'error'); perf category ≥0.60 (line 45).
- **Expected:** all four assertions pass on the mobile preset (3-run median). Record the MEASURED values, not just pass/fail.
- **Verify:** `npm run lighthouse` → read the assertion results + the median numeric values from the HTML report.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: FCP/LCP/CLS/TBT median + perf score.)_
- **Notes:** ⚠️ Passing the realistic gate but missing the ASPIRATIONAL bar (perf ≥85, FCP <1.8s, LCP <2.5s, CLS <0.1, TBT <200ms — lighthouserc.cjs:8-9) = record **PARTIAL** with the gap, since this is the pre-Beta Daniel quality bar. The aurora/blur compositing + the orb is the likely TBT/perf-score drag — note it.

### [14.087] Live-URL lighthouse (andura.app) within gate
- **Check:** Production (real host + HTTP/2 + cache headers) passes.
- **Where:** `package.json:40` (`lighthouse:live`), `lighthouserc.cjs` (live run re-enables uses-http2 / uses-long-cache-ttl skipped locally, lines 32-38).
- **Expected:** the live run scores ≥ the local run (real CDN/cache helps); FCP/LCP within gate on the deployed PWA.
- **Verify:** `npm run lighthouse:live` → median scores + vitals.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** GH Pages can't set custom HTTP headers (index.html:9-15) so `uses-long-cache-ttl` may warn on live too — note if so.

---

## 14.5 — Runtime (timers, rAF, wake-lock, lists, leaks)

### [14.100] SessionElapsed isolates the 1Hz tick (no full workout-subtree re-render)
- **Check:** The per-second elapsed clock re-renders ONLY the leaf, not the whole active-session subtree.
- **Where:** `src/react/components/Workout/SessionElapsed.tsx:27-42` (owns its own `setInterval` + `elapsed` state, renders only the `MM:SS` span) + `SessionTimer.tsx:289` (`memo`) + the perf note SessionTimer.tsx:48-52,284-288 (passes raw `sessionStart` epoch, NOT a per-second `elapsedSec`).
- **Expected:** `Workout.tsx` does NOT hold `elapsed` state ticking each second (comment lines 251-254 confirms it was moved out); `SessionTimer` is `React.memo` so the chrome holds across ticks; only `SessionElapsed` reconciles each second.
- **Verify:** read SessionElapsed.tsx fully + SessionTimer.tsx:48-53,284-289; Playwright React Profiler (or a render-count instrument) during a live session → only the elapsed leaf commits each second, parent stays put. Or CPU trace: per-second work is tiny (one text node update).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: render-count or trace showing leaf-only per-second commit.)_
- **Notes:** This is the headline Maria/Gigel low-end fix (a 1Hz full-subtree reconcile on the most interactive screen). A regression (elapsed prop back on SessionTimer) defeats memo → FAIL.

### [14.101] SessionElapsed interval cleared on unmount + startedAt change
- **Check:** The clock interval has no leak across session start/discard.
- **Where:** `SessionElapsed.tsx:34-40` (`useEffect` returns `clearInterval`, deps `[startedAt]`; `startedAt===null` early-returns with no interval).
- **Expected:** interval created only when `startedAt != null`; cleared on unmount and on `startedAt` change; parked at 0:00 with no timer when null.
- **Verify:** read lines 34-40; Playwright start → discard → start again → confirm only ONE interval active (no accumulation) via a leak probe or by counting active timers.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** —

### [14.102] useCountUp cancels its rAF on unmount + re-trigger (no leaked frame loop)
- **Check:** The count-up rAF tween is cancelled on cleanup and guarded against re-trigger.
- **Where:** `src/react/hooks/useCountUp.ts:48-92` (`rafRef`, cleanup `cancelAnimationFrame` line 89-91, re-trigger guard `animatedToRef` line 53).
- **Expected:** the effect's cleanup cancels the pending frame; an unrelated re-render with unchanged `to` does NOT restart the tween (guard); deps `[to, durationMs, from]`.
- **Verify:** read useCountUp.ts:48-92; mount a component with the hook, unmount mid-tween → confirm no further rAF callbacks (no console/leak after unmount).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** Used by ReadinessOrb (score) + Istoric hero stats — multiple instances on a screen, so a leaked loop per instance would compound.

### [14.103] useCountUp snaps to final value under reduced-motion (JS motion a11y)
- **Check:** The count-up is JS-driven (NOT covered by the CSS reduced-motion block) and must snap.
- **Where:** `useCountUp.ts:18-24,60-64` (`prefersReducedMotion()` matchMedia check → `setValue(to)` no rAF).
- **Expected:** under `prefers-reduced-motion: reduce`, the hook sets the final value immediately, no tween; SSR/test init = final value (line 44) so no flicker.
- **Verify:** Playwright reduced-motion emulate → ReadinessOrb score shows the final number instantly (no visible count-up); read useCountUp.ts:18-24,60-64.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** This is the one motion path the global CSS cap CANNOT cover (it's JS rAF, not CSS animation) — the explicit matchMedia check is the correct fix. Verify it actually reads the live media query, not a stale value. (Note: it does NOT also gate on `[data-calm]` — only prefers-reduced-motion; consistent with [14.055] gap.)

### [14.104] Workout wake-lock acquires on mount, releases on unmount, re-acquires on visibility
- **Check:** Screen wake-lock has no sentinel leak + re-acquires after tab background.
- **Where:** `src/react/routes/screens/antrenor/Workout.tsx:276-315` (acquire on mount, `visibilitychange` re-acquire, cleanup releases + nulls `lockRef`).
- **Expected:** `nav.wakeLock.request('screen')` on mount (guarded `!lockRef.current` so no double-acquire); on tab hidden the OS auto-releases + ref nulled (line 300-302); on visible re-acquires; unmount releases + removes the listener (lines 306-314). All fail-silent (no wakeLock API → noop).
- **Verify:** read Workout.tsx:276-315; Playwright start workout → `navigator.wakeLock` sentinel active → background tab → foreground → still/again active → exit workout → sentinel released (no lingering lock).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** A leaked wake-lock = the phone never sleeps after the user leaves the workout = battery drain (Maria-65 pain). The cleanup at 306-314 prevents it — verify it fires on every exit path (navigate away, finish, cancel).

### [14.105] Workout rest-countdown + inactivity intervals cleared (no leak)
- **Check:** The two other `setInterval` loops in Workout clean up.
- **Where:** `Workout.tsx:257-270` (rest countdown, clears on phase change + on reaching 0) + `Workout.tsx:339-347` (inactivity 30s watch, clears on `lastActivityAt` change/unmount).
- **Expected:** each `useEffect` returns `clearInterval`; rest interval also self-clears at 0 (line 262); no interval runs when not in `rest` phase (early return line 258).
- **Verify:** read Workout.tsx:257-270,339-347; Playwright run through rest → logging transitions repeatedly → confirm intervals don't accumulate.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** Three interval-bearing effects on one screen (elapsed-leaf, rest, inactivity) — verify the total active timer count returns to baseline after exiting the workout.

### [14.106] Istoric session list is NOT virtualized — assess against expected volume
- **Check:** The history list renders all sessions (`.map` over full array) — confirm this is acceptable at realistic data volume.
- **Where:** `src/react/routes/screens/istoric/Istoric.tsx:47` (`[...sessionsHistory].sort(...)`) + the list render (passes `sessionsHistory` to the list component) + `Istoric.tsx:120` (`prHistory.map`).
- **Expected:** for a Beta user (weeks→months of sessions, ~tens to low-hundreds of rows) a plain `.map` is fine — virtualization (react-window) is NOT warranted yet. The spec mention "virtualized session list" is the THRESHOLD to watch, not a current requirement.
- **Verify:** `grep -nE "react-window|react-virtual|virtuoso|FixedSizeList" src` → ZERO (no virtualization lib); confirm the list is a plain map; Playwright seed ~200 sessions → scroll the Istoric list under 4× CPU throttle → measure scroll FPS + initial render time.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: row count tested + scroll FPS + initial render ms.)_
- **Notes:** PARTIAL if a heavy per-row component (ExerciseMedia, count-up, sparkline per row) makes a few-hundred-row list janky on Maria-65 — then recommend windowing. PASS if smooth at realistic volume. This is a JUDGEMENT call on the data model, not a hard rule.

### [14.107] ExerciseMedia images lazy-load + async-decode + "coming soon" placeholder (no eager media cost)
- **Check:** Exercise media defers loading + has an honest placeholder (no broken-image cost / no eager fetch of every tile).
- **Where:** `src/react/components/ExerciseMedia.tsx:142-152` (`<img loading="lazy" decoding="async">`), `:126-140` (video `playsInline muted`), `:74-121` (placeholder — `t('common.imageSoon')`, diagonal-hatch / radial wash, no spinner).
- **Expected:** `loading="lazy"` + `decoding="async"` on the `<img>` so off-screen media isn't fetched/decoded on the main thread; the placeholder is pure CSS (no network) when no asset exists (V1 = most exercises). Card video is `muted playsInline loop` (autoplay-eligible, cheap).
- **Verify:** read ExerciseMedia.tsx:74-152; Playwright WorkoutPreview with a long exercise list → Network panel: off-screen exercise tiles do NOT fetch media until scrolled into view; placeholders are CSS-only.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: lazy/async attrs + network behavior.)_
- **Notes:** V1 ships mostly placeholders (`getExerciseMedia` returns none → zero media network) so the realistic first-Beta cost is ~0 media bytes — note that. The video variant autoplaying multiple on-screen could cost; verify only one card video mounts at a time.

---

## 14.6 — Network / data-fetch cost (Firebase REST, polling, images)

### [14.120] Firebase via REST (no SDK weight) + bounded call count
- **Check:** Firebase is REST (ADR 002), not the full SDK, and isn't chatty.
- **Where:** the auth/data layer (REST endpoints in the CSP `connect-src`, index.html:16: identitytoolkit / securetoken / firebaseinstallations / *.firebaseio.com / *.firebasedatabase.app) — NO `firebase` SDK chunk in `dist/`.
- **Expected:** no `firebase`/`firebase-app` vendor chunk (REST = fetch calls, not the ~hundreds-of-KB SDK); auth + sync use a bounded set of REST calls at boot (runReactBoot, main.tsx:71), not a polling loop.
- **Verify:** `grep -rn "from 'firebase" src` → zero SDK imports (REST only); confirm no `firebase-*.js` chunk in `dist/assets`; Playwright login + idle 60s → Network shows NO repeating poll to firebaseio.com (event-driven only).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: grep + network idle observation.)_
- **Notes:** Cross-ref §08 (data) + §12 (security). Here the concern is purely the bytes + request count. A setInterval polling Firebase would be a perf+battery FAIL — verify absence.

### [14.121] No chatty background polling on any screen
- **Check:** No screen sets up a recurring network poll (vs the local-only setInterval clocks).
- **Where:** all `setInterval` usages — confirm they're LOCAL (clock/countdown/inactivity), none issue a network request.
- **Expected:** the only intervals are SessionElapsed (1Hz local), Workout rest-countdown + inactivity (local). None fetch.
- **Verify:** `grep -rnE "setInterval" src/react` → each hit's body is local state, no `fetch`/Firebase call inside any interval.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: list of every setInterval + confirmation none fetches.)_
- **Notes:** —

### [14.122] Firebase runtime cache + 3s timeout (offline-friendly, not blocking)
- **Check:** Firebase reads are NetworkFirst with a 3s timeout so a slow network doesn't hang the UI.
- **Where:** `vite.config.js:106-124` (Firebase RTDB `NetworkFirst`, `networkTimeoutSeconds: 3`, BackgroundSync queue for writes).
- **Expected:** reads fall back to cache after 3s (no infinite spinner on Maria-65 3G); writes queue + replay on reconnect (firebase-write-queue, 24h retention).
- **Verify:** read vite.config.js:106-124; Playwright offline → Firebase read served from cache within ~3s, no hang. (Cross-ref §13 PWA.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill.)_
- **Notes:** This is a perf-perceived win (no hang) AND a §13 offline item — record here as the load-cost angle.

---

## 14.7 — PWA precache size as a first-install load cost (cross-ref §13)

### [14.140] Precache excludes the two heavy on-demand chunks (Sentry + Dexie)
- **Check:** First-install precache does NOT ship the Sentry (`index-*`) or Dexie (`vendor-data-*`) chunks.
- **Where:** `vite.config.js:86-89` (`globIgnores: ['**/assets/index-*.js', '**/assets/vendor-data-*.js']`) + the rationale lines 69-89 (Sentry ~145 KB + Dexie ~32 KB gzip off the first-install path).
- **Expected:** the `dist/sw.js` precache manifest does NOT list `index-*.js` or `vendor-data-*.js`; both are served on-demand via the `app-assets-js` StaleWhileRevalidate runtime cache (vite.config.js:155-165) so they still work offline after first use.
- **Verify:** build → grep `dist/sw.js` (or the workbox precache manifest) for `index-` and `vendor-data-` → absent from precache; present-able via runtime cache. Sum the precached entry sizes = first-install weight.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: precache manifest entries + total precache gzip size + confirmation the two are excluded.)_
- **Notes:** Maria-65 + Gigel first-install UX saves ~177 KB gzip (145 Sentry + 32 Dexie). This is the §13↔§14 cross-ref: §13 owns SW correctness, §14 owns the install-weight angle. A regression that precaches Sentry = a heavier first install = PARTIAL here.

### [14.141] Total precache size is reasonable for a 3G first install
- **Check:** The full precache (main + vendor-react/icons/state + data-library + route chunks + CSS + fonts + icons) is a sane first-install payload.
- **Where:** `vite.config.js:67-68` (`globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`) minus the globIgnores.
- **Expected:** the precached set installs in a few seconds on 3G; no surprise multi-MB asset (e.g. an un-subset font, a large PNG icon). Fonts are Latin-subset WOFF2 (small); icons are 192/512 PNG (bounded).
- **Verify:** build → sum the precache manifest sizes (raw + gzip); flag any single precached asset > ~100 KB.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: total precache size + largest entries.)_
- **Notes:** Cross-ref [14.082] fonts + §13 PWA. If the data-library chunk (657 exercises, ~28 KB gzip) is precached, that's correct (it's needed for the core flow) — distinguish it from Sentry/Dexie which are not.

---

## 14.8 — Section gate

### [14.900] Section 14 gate — perf ≥ 90% + no open FAIL in a load-blocking step
- **Check:** Aggregate the section score; emit the scorecard row.
- **Where:** this section's step verdicts.
- **Expected:** Section % = Σ(scores)/(PASS+PARTIAL+FAIL) × 100 ≥ 90% to pass the gate. The machine bar (`npm run size` all-green [14.018] + `npm run lighthouse` within gate [14.086]) is necessary but not sufficient — the motion/runtime judgement steps must also hold.
- **Verify:** tally all 14.0xx-14.7xx verdicts; compute %; emit the RUNNING SCORECARD row for "14 Performance".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill: PASS/PART/FAIL/BLOCK counts + computed %.)_
- **Notes:** Known watch-items to weight: (1) the `--motion` / `[data-calm]` JS wiring GAP ([14.055]/[14.059]) — CSS-ready, app-unset; (2) aspirational-vs-realistic lighthouse delta ([14.086]); (3) un-virtualized Istoric list at scale ([14.106]). If lighthouse's perf score sits at the realistic floor (~0.60) rather than the aspirational ≥0.85, record the section as PARTIAL-heavy and surface to Daniel for the pre-Beta ratchet.
```
