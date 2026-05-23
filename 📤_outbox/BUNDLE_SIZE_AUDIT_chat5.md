# Bundle Size Audit — chat 5

**Date:** 2026-05-23 (chat 5 ACASA)
**Author:** Co-CTO investigation subagent (Opus)
**Mode:** READ-ONLY — `npm run build` measurement + report only, zero code changes
**Build:** Vite 5.4.21 production build, `dist/` clean rebuild
**Cross-refs:** D053 + D060 + D061 + D064 + D071 + `.size-limit.json` + `vite.config.js`

---

## §1 Executive summary

- **Total `dist/` size:** 1341.67 KB raw / **1.31 MB** (zero sourcemaps — vite `sourcemap: false`).
- **D053 budget compliance:** **PASS** — all 7 gated chunks under threshold with 1–73% headroom. Tightest gate: main entry (index) 148.84/150 KB gzip = **0.77% headroom** (~1.16 KB room).
- **Top 3 raw chunks:** `index-*.js` Sentry (451 KB / 149 KB gz) → `main-*.js` app (432 KB / 130.71 KB gz) → `vendor-data-*.js` Dexie (95 KB / 31.84 KB gz).
- **Top 3 gzipped chunks:** `index` Sentry 149 KB → `main` 130.71 KB → `vendor-data` Dexie 31.84 KB.
- **D061 font self-host:** VERIFIED present (`assets/inter-latin-wght-normal-Dx4kXJAl.woff2` 48.26 KB) but **path drift vs DECISIONS.md §D061 §2 docs** (expected `public/fonts/inter-var-latin.woff2`; actual mechanism = `@fontsource-variable/inter` package import via `src/styles/global.css` @font-face).
- **D061 vendor-lock anomaly:** `src/themes/themeManager.js:` still injects `https://fonts.googleapis.com/css2?family=...` dynamically for theme switch — Google Fonts CDN dependency NOT fully eliminated despite D061 LOCKED V1 claim "CSP `font-src 'self'`".

---

## §2 Measured size table

### §2.1 Gated chunks (.size-limit.json)

| Chunk | Raw bytes | Raw KB | Gzip KB | Limit KB | % of total raw | Gate |
|---|---:|---:|---:|---:|---:|---|
| `assets/index-*.js` (Sentry) | 451485 | 440.90 | 148.84 | 150 | 32.86% | PASS (0.77% headroom) |
| `assets/main-*.js` (app) | 432684 | 422.54 | 130.44 | 135 | 31.50% | PASS (3.38% headroom) |
| `assets/vendor-data-*.js` (Dexie) | 94876 | 92.65 | 31.84 | 33 | 6.91% | PASS (3.52% headroom) |
| `assets/vendor-react-*.js` | 75415 | 73.65 | 25.49 | 26 | 5.49% | PASS (1.96% headroom) |
| `assets/vendor-icons-*.js` (Lucide) | 32323 | 31.57 | 7.00 | 8 | 2.35% | PASS (12.5% headroom) |
| `assets/main-*.css` | 24482 | 23.91 | 6.22 | 6.5 | 1.78% | PASS (4.31% headroom) |
| `assets/vendor-state-*.js` (Zustand) | 648 | 0.63 | 0.40 | 1.5 | 0.05% | PASS (73.07% headroom) |

### §2.2 Largest ungated assets (raw bytes)

| File | Raw bytes | Raw KB | Notes |
|---|---:|---:|---|
| `assets/inter-latin-wght-normal-*.woff2` | 48256 | 47.13 | D061 font subset |
| `workbox-*.js` | 27063 | 26.43 | Workbox SW runtime (ungated) |
| `assets/Workout-BXutWf4x.js` | 23999 | 23.44 | Largest screen chunk |
| `assets/SchimbaFazaConfirm-*.js` | 8959 | 8.75 | |
| `assets/Onboarding-*.js` | 8386 | 8.19 | |
| `assets/SettingsNotifications-*.js` | 6909 | 6.75 | |
| `assets/SettingsPrivacy-*.js` | 6638 | 6.48 | |
| `assets/Auth-*.js` | 6264 | 6.12 | |
| `index.html` | 5545 | 5.42 | gzip 2.51 KB |
| `assets/WorkoutPreview-*.js` | 5693 | 5.56 | |
| `sw.js` | 4689 | 4.58 | Generated PWA SW |

### §2.3 Roll-up by category

| Category | Raw KB | % of dist | Notes |
|---|---:|---:|---|
| Sentry chunk (index-*.js) | 440.90 | 32.86% | Dynamic-import lazy + globIgnored from precache (D060 §3) |
| Main app chunk (main-*.js) | 422.54 | 31.50% | Eager critical path |
| Vendor (react+data+icons+state) | 198.50 | 14.80% | Cache-stable cross-deploy |
| Lazy screens (53 chunks) | ~150 | 11.2% | Per-route code-split |
| Font (Inter Latin subset) | 47.13 | 3.51% | D061 |
| CSS (single main-*.css) | 23.91 | 1.78% | |
| PWA runtime (sw + workbox + manifest + registerSW) | 31.86 | 2.37% | |
| HTML (index + 404) | 6.64 | 0.49% | |
| Icons (PNG 192+512) | 5.16 | 0.38% | |
| **Total** | **~1341.67** | **100%** | |

Chunk count: **53** `.js`+`.css` chunks in `dist/assets/` + 4 root files (`sw.js`, `workbox-*.js`, `registerSW.js`, `manifest.webmanifest`).

---

## §3 D053 budget compliance — verdict PASS

**All 7 chunks gated by `.size-limit.json` PASS** (size-limit CLI Chromium real-gzip measure):

```
main entry (index)      148.84 / 150  kB gzip   (loading 3.0s slow 3G, running 107ms Snapdragon 410)
main chunk (app code)   130.44 / 135  kB gzip   (loading 2.6s, running 167ms)
vendor (react)           25.49 / 26   kB gzip   (loading 498ms, running 42ms)
vendor (icons)            7.00 /  8   kB gzip   (loading 137ms, running 50ms)
vendor (data)            31.84 / 33   kB gzip   (loading 622ms, running 76ms)
vendor (state)            0.40 /  1.5 kB gzip   (loading 10ms, running 34ms)
CSS total                 6.22 /  6.5 kB gzip   (loading 122ms, running 0ms)
```

**Tightness ranking (least → most headroom):**

1. main entry (index) — **0.77%** room (~1.16 KB) — Sentry chunk on the edge. Single dependency bump = potential fail.
2. vendor (react) — **1.96%** room (~0.51 KB) — react/react-dom/react-router-dom locked.
3. main chunk (app) — **3.38%** room (~4.56 KB).
4. vendor (data) — **3.52%** room (~1.16 KB) — Dexie locked.
5. CSS total — **4.31%** room (~0.28 KB).
6. vendor (icons) — **12.50%** room (~1 KB) — Lucide runway per D053 §2 rationale.
7. vendor (state) — **73.07%** room — Zustand minimal.

**Headroom discipline preserved** per D053 §3 ratchet UP rule (D036). **WARN flag worth surfacing:** main entry (index) headroom <1% leaves zero growth room — any Sentry version bump or additional dynamic-import join could overflow.

---

## §4 Largest dependencies + bundle contributions

### §4.1 Confirmed largest single-source contributors

| Rank | Source | Chunk | Raw KB | Gzip KB | Evidence |
|---:|---|---|---:|---:|---|
| 1 | `@sentry/browser` 10.53.1 | `index-*.js` | 440.90 | 148.84 | First 500 chars verbatim: `const w=typeof __SENTRY_DEBUG__... Kt="10.53.1"`, "sentry" string matches inside chunk; vite.config.js §SW precache excludes globIgnore `assets/index-*.js` rationale "~145 KB gzip" (line 67-72) |
| 2 | App code (53 lazy screens routed) | `main-*.js` | 422.54 | 130.44 | Vite manualChunks default = everything not in vendor-* groups |
| 3 | `dexie` (IndexedDB) | `vendor-data-*.js` | 92.65 | 31.84 | vite.config.js line 134 `'vendor-data': ['dexie']` |
| 4 | `react`+`react-dom`+`react-router-dom` | `vendor-react-*.js` | 73.65 | 25.49 | vite.config.js line 131 |
| 5 | `lucide-react` | `vendor-icons-*.js` | 31.57 | 7.00 | vite.config.js line 133 |
| 6 | `@fontsource-variable/inter` (Latin subset WOFF2) | `inter-latin-wght-normal-*.woff2` | 47.13 | — | Self-host D061 |
| 7 | Workbox runtime (`vite-plugin-pwa`) | `workbox-*.js` | 26.43 | — | Generated SW |
| 8 | `Workout.tsx` route screen | `Workout-*.js` | 23.44 | 6.79 | Largest non-vendor lazy chunk |
| 9 | `zustand` | `vendor-state-*.js` | 0.63 | 0.40 | vite.config.js line 132 |
| 10 | All other lazy screens (52 chunks <9 KB each) | various | ~120 | — | Per-route code-split working |

### §4.2 Notable absence — clean tree-shake signals

- **No `firebase` SDK chunk** = ADR 002 REST API enforced (no Firebase JS SDK in bundle).
- **No `@tanstack/*`, `redux`, `react-query`, `apollo`** = clean Zustand-only state.
- **No moment/luxon/date-fns megachunk** = either tree-shaken or absent (worth grep verify post-Beta).

---

## §5 Font self-host verify D061 — VERIFIED with path drift

### §5.1 Self-host present + Latin subset confirmed

| Aspect | Status | Evidence |
|---|---|---|
| Latin subset WOFF2 in `dist/` | PRESENT | `dist/assets/inter-latin-wght-normal-Dx4kXJAl.woff2` = **48256 bytes** = matches D061 §2 "48 KB" target |
| `@font-face` self-host declaration | PRESENT | `src/styles/global.css:20-29` `src: url('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')` |
| Latin unicode-range filter | PRESENT | `src/styles/global.css:29` `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD` |
| `font-display: swap` FOUT parity | PRESENT | `src/styles/global.css:24` |
| Bundle savings vs full Inter | CONFIRMED | 48.26 KB Latin subset ≈ -86% vs hypothetical 344 KB full Variable (matches D061 §4 empirical claim) |

### §5.2 Documentation drift — D061 §2 path-of-record vs actual implementation

- **D061 §2 says:** "Inter Variable woff2 file = `public/fonts/inter-var-latin.woff2` self-hosted"
- **Actual:** No `public/fonts/` directory exists. Mechanism = `@fontsource-variable/inter` npm package import via `src/styles/global.css` `@font-face` `src: url('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')`. Vite resolves the package path, emits hashed WOFF2 to `dist/assets/inter-latin-wght-normal-*.woff2`.
- **Impact:** Functionally equivalent (self-hosted from same origin, not Google CDN). Same bundle size. Same `font-display: swap`. **BUT** DECISIONS.md §D061 §2 documents an asset path that does not exist on disk — future onboarding/audit may search `public/fonts/` and find nothing. Worth a 1-line clarification in D061 §2 or a brief D061a addendum: "actual import mechanism `@fontsource-variable/inter` package, emitted to `dist/assets/` hashed."

### §5.3 D061 vendor-lock anomaly — Google Fonts CDN reference still present

- **D061 §3 claims:** "CSP `font-src 'self'` baseline. Future font additions = same self-host paradigm. ZERO Google Fonts vendor dependency."
- **Actual:** `src/themes/themeManager.js` runtime-injects a `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${theme.fonts}&display=swap">` for theme switching.
- `vite.config.js:108-113` `runtimeCaching` rule still includes `urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i` → CacheFirst → confirms code path expects Google Fonts hits at runtime.
- **Impact:** D061 LOCKED V1 vendor-lock-elimination claim is **PARTIAL** — base Inter font is self-hosted (the big win), but theme system still depends on Google Fonts CDN for non-default themes. CSP `font-src 'self'` (if strictly enforced) would break theme switching. Worth verifying whether theme switching is active pre-Beta (Settings → Themes screen exists per `dist/assets/SettingsThemes-*.js`).

---

## §6 Optimization recommendations

### §6.1 Tier 1 — pre-Beta (high ROI, low risk)

1. **`themeManager.js` Google Fonts removal** — either bundle theme fonts via `@fontsource/*` packages (same self-host paradigm) OR remove theme variants pre-Beta if non-default themes deferred post-Beta. Resolves D061 vendor-lock claim drift. Effort: ~30 min if `@fontsource/*` swap.
2. **D061 §2 path documentation fix** — single-line clarification in DECISIONS.md §D061 §2 noting actual `@fontsource-variable/inter` package import path instead of nonexistent `public/fonts/inter-var-latin.woff2`. Effort: ~5 min.

### §6.2 Tier 2 — post-Beta candidates (per D053 §3 ratchet UP rule)

3. **Sentry chunk lazy-import audit** — `index-*.js` (Sentry) at 148.84/150 KB gzip = **0.77% headroom**. Vite warning surfaced: `src/util/sentry.js is dynamically imported by [...] but also statically imported by [13 callers including main.tsx, ErrorBoundary.tsx, engineWrappers.ts, 8 orchestrator adapters, db.js, scheduleStore.ts, coachVoice.ts]`. Mixed static + dynamic import = Vite cannot move into a separate chunk, so all consumers eagerly pull Sentry into `index-*.js`. **If even one of these 13 callers converted to dynamic import via opt-in telemetry gate, Sentry could be fully deferred** — would drop main entry from ~149 KB to <10 KB and unblock 145+ KB headroom for future growth. Reference: D055 Sentry consent gate already exists.
4. **`scheduleAdapter.js` mixed-import warning** — Same Vite warning: `src/engine/schedule/scheduleAdapter.js` dynamically imported by `scheduleStore.ts` but also statically imported by `scheduleAdapterAggregate.ts`. Fix = converge on one import style; current behavior = adapter stays in main chunk (no chunk split benefit lost in measurable kB, but Vite optimizer cannot route around).
5. **`Workout-*.js` 23.44 KB split** — largest non-vendor lazy chunk. Could split into Workout view + Workout actions + Workout post-summary if internal sub-routes warrant. Defer unless real-user metrics flag.
6. **Dexie tighter lazy** — `vendor-data` 31.84 KB gzip currently in primary route load (D060 §3 globIgnore from SW precache only — still on critical path eager). D060 §3 comments say "Dexie lazy import doar din DeleteAccountConfirm + SettingsExport" — verify primary critical path doesn't import Dexie eagerly. If only destructive actions import it, vendor-data should NOT be in initial bundle.
7. **`@sentry/browser` 10.53.1 → newer slim version** — Sentry SDK has historically released `@sentry/browser/esm` or tree-shake-optimized builds. Audit upstream for slim variants. Risk: D055 consent gate semantics may shift.

### §6.3 Tier 3 — speculative (post-real-metrics only)

8. **Icon barrel-import audit** — `lucide-react` 31.57 KB raw / 7 KB gzip. Verify all imports are named (e.g., `import { Heart } from 'lucide-react'`) not barrel (`import * as Icons from 'lucide-react'`). Lucide treeshakes well with named imports.
9. **CSS critical-path inline** — 24.48 KB raw / 6.22 KB gzip CSS. Vite emits as single `main-*.css` blocking link. Inline critical above-fold + defer rest = perf gain mobile 3G. D060 quadruple already approached LCP — only worth if Lighthouse regresses post-add.
10. **Asset compress audit** — `icon-512.png` 3941 bytes already small. No uncompressed images detected in `dist/`. Skip.

### §6.4 Anti-recommendation (per D053 §5 Bugatti rationale)

- **DO NOT aggressively code-split pre-Beta** — D053 explicitly defers shrink work post-Beta launch real metrics. Premature optimization without telemetry = waste. Headroom discipline preserved via visible budgets.

---

## §7 Production build warnings + errors

### §7.1 Warnings worth surfacing (2 total)

**Warning A — Sentry mixed import (yields full-chunk inflation):**

> `src/util/sentry.js is dynamically imported by src/react/lib/coachVoice.ts, src/react/stores/scheduleStore.ts but also statically imported by src/coach/orchestrator/adapters/bayesianNutritionAdapter.js, src/coach/orchestrator/adapters/deloadAdapter.js, src/coach/orchestrator/adapters/energyAdjustmentAdapter.js, src/coach/orchestrator/adapters/goalAdaptationAdapter.js, src/coach/orchestrator/adapters/periodizationAdapter.js, src/coach/orchestrator/adapters/specializationAdapter.js, src/coach/orchestrator/adapters/tempoAdapter.js, src/coach/orchestrator/adapters/warmupAdapter.js, src/db.js, src/main.tsx, src/react/components/ErrorBoundary.tsx, src/react/lib/engineWrappers.ts, dynamic import will not move module into another chunk.`

- **Implication:** 13 static importers anchor Sentry into main bundle path. The 2 dynamic import sites (`coachVoice.ts`, `scheduleStore.ts`) achieve nothing — Vite cannot split because static wins.
- **Action:** See §6.2 #3.

**Warning B — scheduleAdapter mixed import:**

> `src/engine/schedule/scheduleAdapter.js is dynamically imported by src/react/stores/scheduleStore.ts but also statically imported by src/react/lib/scheduleAdapterAggregate.ts, dynamic import will not move module into another chunk.`

- **Implication:** Cosmetic (only 1 static importer + 1 dynamic), but cleanup hygiene.
- **Action:** See §6.2 #4.

### §7.2 Errors

**Zero errors.** Build succeeded in 7.91s. 2279 modules transformed. PWA precache 60 entries (776.64 KiB) — note: precache reports KiB not KB.

### §7.3 PWA precache observation

- **Precache size:** 776.64 KiB (≈ 795 KB) per Workbox report
- **Total dist:** 1341.67 KB
- **Delta:** ~546 KB excluded from precache (matches D060 §3 globIgnore intent — Sentry index chunk ~441 KB + Dexie vendor-data ~92 KB ≈ 533 KB excluded). Healthy precache discipline preserved.

---

## §8 Cross-refs

- **D053** — Bundle budget raise pattern cu rationale (LOCKED V1 2026-05-23 chat 5). Verdict: this audit confirms PASS on all 7 raised thresholds with documented headroom; main entry (index) at 0.77% headroom is tightest gate worth attention.
- **D060** — PWA perf quadruple Lighthouse 64→97 (LOCKED V1). Verdict: quadruple infrastructure visible in build output (registerSW.js defer + Workbox globIgnore on Sentry + Dexie chunks + manualChunks vendor split). AuthCluster lazy split visible in 53 lazy chunks list.
- **D061** — Font self-host Inter Variable Latin subset -86% (LOCKED V1). Verdict: bundle reduction confirmed (48.26 KB Latin subset emitted), BUT path-of-record drift (actual `@fontsource-variable/inter` package import, not `public/fonts/inter-var-latin.woff2`) and partial vendor-lock (`themeManager.js` Google Fonts CDN runtime injection still present).
- **D064** — Modulepreload requestIdleCallback hash-agnostic (LOCKED V1). Verdict: not measured by this audit (runtime behavior, not bundle artifact). Pattern infrastructure present in source per cross-ref to AuthCluster lazy.
- **D071** — Lighthouse truly-final peak 97 (LOCKED V1). Verdict: bundle composition consistent with peak conditions documented (font self-host Latin subset 48 KB + quadruple optimization chunks visible). Real Lighthouse re-measure post-Beta deploy would re-verify; bundle-level audit does not directly score Lighthouse.

---

**Verdict roll-up:** Bundle size discipline **PASS** per D053. All 7 gates within budget. Sentry chunk tight (0.77% headroom) — flag for post-Beta lazy-import conversion via D055 consent gate path. D061 self-host **functionally landed** but **two documentation drifts** worth a small followup (path of record + Google Fonts CDN remaining in themeManager). Zero blockers; zero shrink work required pre-Beta per D053 §5 Bugatti rationale.
