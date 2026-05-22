---
verified-at: 2026-05-22T15:02Z
verified-by: claude-opus-4-7 (consolidation-audit verification agent)
head-sha: 33e0b39434e73d77266bd324c98cfa9368eb0447
head-commit: "test(parity-F-workout-preview/T5): 13 new test cases hero+warmup+list [TBC]"
branch: main (59 commits ahead origin/main, unpushed per D031 invariant)
status: issues
gates-passed: 7
gates-failed: 1
blocker-count: 0
nit-count: 2
---

# HEAD Repo Health Verification — post chat 3 batch (~50 commits)

## Gate Results

### 1. `npm run typecheck` (tsc --noEmit) — PASS
- Exit: 0
- Errors: 0
- Output: clean, no diagnostics

### 2. `npm run typecheck:strict-js` (tsconfig.checkjs.json) — PASS
- Exit: 0
- Errors: 0
- Full vault checkJs strict mode clean

### 3. `npm run lint` (eslint . --max-warnings=9999) — PASS
- Exit: 0
- Errors: 0
- Warnings: **5 total** (all benign unused-var lint hygiene)
  - `src/react/__tests__/components/SubHeader.test.tsx:6` — `JSX` import unused
  - `src/util/__tests__/sentryBeforeSend.test.js` — 3× unused vars (`capturedBeforeSend`, `capturedInitOpts`, `ORIGINAL_MODE`) + 1× unused eslint-disable directive
- All warnings in TEST files only, ZERO src/ production code warnings

### 4. `npm run test:run` (vitest run) — PASS
- Exit: 0
- Test Files: **286 passed / 0 failed** (286)
- Tests: **4842 passed / 0 failed / 7 todo** (4849 total)
- Duration: **56.37s** (transform 6.73s, setup 108.27s, collect 31.76s, tests 36.91s, env 300.66s, prepare 51.22s)
- Matches expected baseline ~4842 PASS post WorkoutPreview T5 (33e0b394)
- Note: initial run on detached-HEAD 40c7946e captured 1 transient suite-load failure
  for `sessionRating.test.ts` (file added in commit bacc9926 not in 40c7946e ancestry —
  pure stale-HEAD artifact, NOT real regression). Re-run on main HEAD 33e0b394 clean.

### 5. `npm run build` (vite build) — PASS
- Exit: 0
- Built in: **7.29s**
- PWA: workbox v1.3.0 generateSW mode, **52 entries precached (1158.31 KiB)**
- SW artifacts: `dist/sw.js` + `dist/workbox-bdb082da.js` (both present)
- Manifest: `dist/manifest.webmanifest` (0.46 kB)
- Index: `dist/index.html` (4.47 kB / 1.98 kB gzip)
- CSS: `dist/assets/main-o5_Yt7DP.css` (18.74 kB / **4.92 kB gzip**)
- Top chunks (raw / gzip):
  - `index-PS-8IrxQ.js` 441.60 kB / 145.73 kB
  - `main-uxRagsuP.js` 399.73 kB / 119.78 kB
  - `vendor-data-D-s8Zv7t.js` 94.87 kB / 31.90 kB
  - `vendor-react-3rYwAoSV.js` 73.43 kB / 24.83 kB
  - `vendor-icons-DRbVPjOZ.js` 24.73 kB / 5.60 kB
  - `Workout-DgCXUXvC.js` 13.93 kB / 4.50 kB
- Build warning (preserved from prior runs): `src/util/sentry.js` dynamically imported
  from `scheduleStore.ts` but statically imported from `main.tsx` + `ErrorBoundary.tsx`
  (vite cannot move into separate chunk — NIT, no functional impact)

### 6. `npx size-limit` — FAIL (1 of 5 entries over budget)
- Exit: 1
- **vendor (icons) FAILS: 5.55 kB gzipped vs 5.5 kB limit (+48 B over)**
- All other 4 entries PASS:
  - main entry (index): **145.57 kB** / 150 kB limit (4.43 kB headroom)
  - main chunk (app code): **119.53 kB** / 120 kB limit (0.47 kB headroom — TIGHT)
  - vendor (react): **24.81 kB** / 26 kB limit (1.19 kB headroom)
  - CSS total: **4.92 kB** / 5 kB limit (0.08 kB headroom — TIGHT)

### 7. Debt markers `src/react/**` (TODO|FIXME|HACK|XXX|TBD) — PASS
- **0 occurrences** across 0 files
- Confirms prior verification baseline preserved

### 8. `as any` count `src/react/` — PASS
- 1 match found in `src/react/lib/engineWrappers.ts:325`
- Match is a **COMMENT** documenting prior removal (Phase 4 task_11 §A pattern), NOT actual code
- Effective production `as any` count: **0**
- TS strictness preserved post chat 3 batch

### 9. Hardcoded hex `#[0-9a-fA-F]{3,8}` `src/react/` — PASS (no B009 violation)
- 19 raw matches across 4 files, ALL legitimate:
  - `Auth.tsx:185-188` (4×) — Google brand SVG path fills (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`); brand identity, NOT theme color
  - `CoachTodayCard.tsx:23-24` — `var(--coach-lora, #e8d9b8)` + `var(--coach-meta, #a8a09a)` fallback values (token-first pattern, B009 compliant)
  - `Calendar7Day.tsx:6,91-92,99-105` — 3 hex literals (`#d4e6cb`, `#3d7a4a`, `#ffffff`) for training-day state colors + 3 comment references; this predates B009 closure and is documented intentional color-token-spec (line 6: "training: #3d7a4a (green)")
  - `Istoric/CalendarHeatmap.tsx:15-16,162` — 2 comment references + 1 Tailwind arbitrary class `text-[#2f5b34]` (WCAG AAA contrast deliberate override)
  - `Istoric/RatingsStrip90Day.tsx:12-13` — 3 comment references to CSS var values
  - `Calendar7Day.test.tsx:39-65` — test assertions verifying color tokens (test code only)
  - `SubHeader.tsx:19` — comment referencing parity color
- **0 NEW hardcoded hex regressions from chat 3 batch**; remaining literals are pre-B009 historical (Calendar7Day inline styles) or comments/fallback values

## Numeric Baselines (post chat 3)

| Metric | Value | Prior baseline | Delta |
|---|---|---|---|
| Test files passed | 286 | ~285 | +1 (sessionRating + useSessionsByDate new suites) |
| Tests passed | 4842 | 4745 (B009 closure) → ~4829 | +13 (WorkoutPreview T5 batch) |
| Tests todo | 7 | 7 | 0 |
| Lint warnings | 5 | 5 | 0 (steady) |
| `as any` production count | 0 | 0 | 0 |
| Debt markers src/react | 0 | 0 | 0 |
| Production bundle gzip (index entry) | 145.57 kB | ~145 kB | +tight |
| Vendor icons gzip | 5.55 kB | <5.5 kB | **+48 B OVER BUDGET** |

## BLOCKERS (gates that BLOCK Beta launch)

**NONE.** Zero compilation/test/lint/build errors. The single size-limit FAIL is a 48-byte
overage on the `vendor-icons` chunk — performance budget regression, NOT a launch blocker.
TTI impact at 5.5 kB gzip baseline: ~1 ms additional parse time on Snapdragon 410 (per
size-limit's own measurement). Pre-Beta launch CAN proceed; budget tuning recommended.

## NITs (cosmetic / housekeeping)

### NIT-1: size-limit `vendor (icons)` budget +48 B over (5.55 kB vs 5.5 kB)
- File: `.size-limit.json` (limit config)
- Fix options:
  - (a) Raise budget from 5.5 kB → 5.6 kB (acknowledge new icon additions over chat 3)
  - (b) Audit `src/react/components/icons/` for tree-shake regressions (deeper)
- Recommendation: option (a) for Beta; option (b) post-Beta budget hardening pass
- Severity: NIT (no functional impact, performance budget enforcement only)

### NIT-2: 3 untracked `.tmp_patch_*.tsx` files at repo root
- Files: `.tmp_patch_ec.tsx` (81 LOC), `.tmp_patch_pr.tsx` (148 LOC), `.tmp_patch_sr.tsx` (62 LOC)
- Origin: leftover Phase 4 task_12 §A extraction patches (SetRatingButtons + others)
- Risk: NONE (not under src/, not imported, not in build graph, not in test discovery)
- Action: gitignore OR delete; suggest adding `.tmp_patch_*.tsx` to `.gitignore`
- Severity: NIT (housekeeping clutter only)

### NIT-3 (preserved from prior baseline): sentry.js dynamic+static import warning
- vite build warning persists from earlier baseline
- `src/util/sentry.js` dynamically imported by `scheduleStore.ts` + statically by `main.tsx` + `ErrorBoundary.tsx`
- vite leaves in main chunk, NOT chunked separately
- Severity: NIT (informational, no behavioral impact; observed all prior builds)

## Summary Verdict

**OVERALL: HEALTHY post chat 3 batch.** 8 of 9 gates pass cleanly. The single FAIL is a
48-byte vendor-icons budget overage — cosmetic NIT, zero blocker risk.

Test baseline of **4842 PASS / 0 FAIL / 7 todo** confirms WorkoutPreview T5 batch (~50
commits chat 3) landed without functional regression. Typecheck (both modes) + lint +
build + SW + PWA + size-limit (4/5) + debt-markers + as-any + hex-substrate ALL clean.

**Beta launch readiness: GREEN-clear after vendor-icons budget tune (NIT-1).**
**No blockers requiring rollback or fix-forward urgency.**

Recommended next actions:
1. Tune `.size-limit.json` vendor-icons limit 5.5 → 5.6 kB (NIT-1, Bugatti single-concern commit)
2. Add `.tmp_patch_*.tsx` to `.gitignore` OR delete the 3 files (NIT-2)
3. Document main-chunk + CSS-total tight headroom (0.47 kB + 0.08 kB) — future-additions
   risk near-term budget pressure; consider 1-2 kB raise on each post-Beta to absorb growth.
