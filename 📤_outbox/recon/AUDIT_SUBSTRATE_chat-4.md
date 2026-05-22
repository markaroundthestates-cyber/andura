# AUDIT SUBSTRATE — Chat 4 health scan

**Generated:** 2026-05-22 (read-only investigation)
**Branch:** main, 98 commits ahead origin/main (D031 invariant intact)
**Baseline verdict:** **GREEN** — vitest 4930 PASS / 7 todo / 0 FAIL · TS strict-js **0 errors** · ESLint **0 errors / 5 warnings** · size-limit **all 5 budgets pass** (main entry 145.57/150 kB, app chunk 119.53/120 kB)

---

## §1 Sanity counts

| Check | Count | Sample / notes |
|-------|-------|----------------|
| TS strict-js errors | **0** | clean post-A022 (D045 §B005) |
| ESLint errors | **0** | -- |
| ESLint warnings | **5** | 4 unused-var + 1 unused eslint-disable directive |
| Vitest tests | **4930 PASS / 7 todo / 0 FAIL** | 292 test files, 65.2s duration |
| `console.*` total în `src/` | **111** across 32 files | majority vanilla legacy (`src/auth.js`, `src/main.js`, `src/firebase.js`, `src/bootstrap.js`, `src/util/dataCleanup.js`, `src/engine/coachDirector.js`) |
| `console.*` în React `src/react/**` | **19** across 7 files | 12× `engineWrappers.ts` warn (defensive engine fail fallback) + 2× ErrorBoundary + 5× drill-down confirm (3 of those DEV-gated) |
| `console.log` în production (non-test) | **~25** | `bootstrap.js:25,50,70` · `main.js:113,184,212` · `firebase.js:151,157,164,183,188,194` · `dataCleanup.js` 14× · `pages/authShell.js:283` · `pages/coach/state.js:11` · `engine/coachDirector.js:135` · `util/adminPrefill.js:60` |
| TODO/FIXME/HACK/XXX comments | **17** across 7 files | `pages/weight.js` (6× water/supplement/photo stubs) · `pages/coach/renderIdle.js:106` · `i18n/__tests__/i18n.test.js` (legit TODO_EN locale markers) · `engine/bayesianNutrition/{kalmanFilter,observationFilter}` (post-Beta calibration) · `router.js:27` (back-stack stub) |
| `@ts-ignore` / `@ts-expect-error` | **2 prod + 3 tests** | `engineWrappers.ts:20` (historical comment, no active directive) + 3 `coachVoice.test.ts` + `navigation.test.ts:91` (intentional runtime-fallback tests). NOTE: `prEngine.d.ts:2`, `fatigue.d.ts:2`, `readiness.d.ts:2` are doc comments referencing elimination, NOT active directives. |
| `: any` annotation usage | **0** | grep `:\s*any\b` zero matches src/**/*.{ts,tsx} |
| `as any` cast usage | **0 active** | 2 matches found are both COMMENTS documenting D045 §B005 elimination |
| `dangerouslySetInnerHTML` | **0** | -- |
| `eval(` | **0** | clean |
| Deprecated React lifecycle (`componentWillMount` / `UNSAFE_` / etc.) | **0** | clean |
| Inline `style={{` în `src/react/**/*.tsx` | **14** across 10 files | mix legit (dynamic CSS vars, computed dimensions, transition timing) and a few candidates for Tailwind migration |
| `useEffect(..., [])` empty-deps suspects | **0 matches via regex** | grep didn't catch any explicit empty array (likely existing patterns use named deps; missing-deps audit deferred to rule-of-hooks lint warnings — 0 reported) |

---

## §2 Surface findings NOT in ledger

Each anti-pattern → fix scope + cluster ownership for Substrate Wave.

### SUB-001 — Production `console.log` in vanilla legacy modules
- **Files:** `src/bootstrap.js` (3), `src/main.js` (3), `src/firebase.js` (6), `src/util/dataCleanup.js` (14), `src/util/adminPrefill.js` (1), `src/pages/authShell.js` (1), `src/pages/coach/state.js` (1), `src/engine/coachDirector.js` (1)
- **Severity:** **LOW** (informational logs, no PII, no secrets leaked; Sentry initialized for prod error capture)
- **Problem:** ~25 `console.log` calls in production code path (non-DEV-gated). Adds DevTools noise + minor perf cost + unprofessional surface for power-users opening console pre-Beta launch.
- **Fix:** Wrap în `if (import.meta.env.DEV) console.log(...)` OR replace cu structured logger (`src/util/telemetry.js` already exists). Keep `console.warn` / `console.error` (legit failure capture, Sentry hooks).
- **Effort:** **M** (~25 sites, mostly mechanical wrap; verify tests still pass)
- **Cluster suggestion:** **SUBSTRATE-ALFA** (console-strip)

### SUB-002 — React surface `console.warn` ungated in engineWrappers
- **Files:** `src/react/lib/engineWrappers.ts` (10 sites lines 125, 156, 205, 227, 356, 403, 467, 491, 530, 589), `src/react/lib/scheduleAdapterAggregate.ts:121`, `src/react/components/ErrorBoundary.tsx:34`
- **Severity:** **NIT** (defensive logging on engine failure is GOOD pattern; partial DEV-gate inconsistency)
- **Problem:** `engineWrappers.ts` console.warn calls fire în production. Compare to `DeleteAccountConfirm.tsx:32` + `ResetDataConfirm.tsx:32` which DO gate behind `import.meta.env.DEV`. Inconsistent policy.
- **Fix:** Decide policy: (a) keep prod warn (Sentry breadcrumb value) — current default, OR (b) DEV-gate ALL warn calls. Recommend (a) + ensure Sentry beforeSend deduplicates. Add brief comment în each block documenting intent.
- **Effort:** **S** (policy doc + verify Sentry config)
- **Cluster suggestion:** **SUBSTRATE-ALFA** (sibling to SUB-001)

### SUB-003 — Stale TODOs in `src/pages/weight.js` legacy
- **Files:** `src/pages/weight.js:585, 587, 598, 600, 602, 604, 953` (7 TODOs)
- **Severity:** **NIT**
- **Problem:** 7 TODO comments for water/supplement/photo/sleep/energy tracking features. `pages/weight.js` = vanilla legacy pre-D028 swap (React Clasic now primary). Stale debt.
- **Fix:** EITHER (a) Convert TODO → ADR/D-entry if features still planned post-Beta, OR (b) delete TODOs if `pages/weight.js` slated for full removal post-D028.
- **Effort:** **S** (triage decision; possibly LL if file slated to delete entirely)
- **Cluster suggestion:** **SUBSTRATE-BETA** (legacy hygiene)

### SUB-004 — ESLint warnings hygiene
- **Files:** `src/react/__tests__/components/SubHeader.test.tsx:6` (unused `JSX` import) · `src/util/__tests__/sentryBeforeSend.test.js:13,14,27` (3 unused vars) · `src/util/__tests__/sentryBeforeSend.test.js:137` (unused eslint-disable directive)
- **Severity:** **NIT**
- **Problem:** 5 ESLint warnings all în test files, fix would zero out warn count.
- **Fix:** Prefix unused vars cu `_` to match `/^_/u` allow pattern, OR remove unused imports/decls. Auto-fixable: 1 of 5 via `eslint --fix`.
- **Effort:** **S** (~10 min)
- **Cluster suggestion:** **SUBSTRATE-GAMMA** (lint zeroes)

### SUB-005 — Inline styles candidates for design-system migration
- **Files (10):** `Calendar7Day.tsx`, `ReadinessVerdict.tsx`, `CoachTodayCard.tsx`, `SVGCountdownRing.tsx`, `CoachRestCard.tsx`, `HeatMapWeekly.tsx`, `Auth.tsx`, `SettingsNotifications.tsx`, `SettingsSubscription.tsx`, `WorkoutPreview.tsx`
- **Severity:** **LOW**
- **Problem:** 14 `style={{...}}` inline usages. Audit shows MOSTLY legit dynamic values (CSS custom prop reads `color: 'var(--brick)'`, computed dimensions `height: ${pct}%`, transition timing `'stroke-dashoffset 350ms linear'`). NOT pure styling bypass — current state is defensible.
- **Fix:** No-op pentru dynamic cases. Optionally migrate static `style={{ background: 'var(--status-info-bg)' }}` (`SettingsSubscription.tsx:29`) la Tailwind class with arbitrary value if design-system parity desired.
- **Effort:** **S** (1-2 sites swap, rest defensible as-is)
- **Cluster suggestion:** **SUBSTRATE-DELTA** (design-system parity, optional polish)

### SUB-006 — Vanilla legacy `src/router.js` back-stack stub
- **Files:** `src/router.js:27`
- **Severity:** **LOW** (Coach Step 5 only, NOT user-facing critical pre-Beta)
- **Problem:** `// TODO Step 5 (workout exit) — implement back-stack pop. Current stub no-op.` Workout exit may rely on this if NOT already migrated to React router. Verify if D028 React router fully covers.
- **Fix:** Verify `react-router-dom` `useNavigate(-1)` already covers ALL workout exit paths în React Clasic; if yes, mark stub as legacy-dead-code; if no, implement OR document defer.
- **Effort:** **M** (verify scope + decide)
- **Cluster suggestion:** **SUBSTRATE-BETA** (legacy hygiene)

### SUB-007 — Vanilla `console.log` in adminPrefill (dev-only utility)
- **Files:** `src/util/adminPrefill.js:60`
- **Severity:** **NIT**
- **Problem:** Single `console.log` în an admin/dev utility — likely never reaches prod build (tree-shaken if no import), but worth confirming via vite-bundle analyze if `adminPrefill` is in `main` chunk.
- **Fix:** Confirm tree-shake OR add DEV gate.
- **Effort:** **S**
- **Cluster suggestion:** **SUBSTRATE-ALFA** (folded into console-strip)

### SUB-008 — Storage access pattern proliferation
- **Files:** 113 `localStorage`/`sessionStorage` matches în React (~57 files; ~half are tests)
- **Severity:** **NIT** (not a bug, observation)
- **Problem:** Heavy direct `localStorage` access în stores + components. D028 React Clasic uses IndexedDB Dexie wrapper + Tier 0/1/2 pattern; mixed localStorage usage may bypass tier rotation.
- **Fix:** No urgent action; audit candidates for migration to `storage/` abstraction. Verify SubStrate Tier 0 keys ALL flow through `dataRegistry.js` USER_DATA_KEYS for proper rotation/cleanup.
- **Effort:** **L** (deferred audit, post-Beta cleanup)
- **Cluster suggestion:** **SUBSTRATE-EPSILON** (observability, NOT urgent)

---

## §3 Bundle/perf snapshot

**Size budgets (all PASS via `npm run size`):**

| Bundle | Size (gzip) | Budget | Headroom |
|--------|-------------|--------|----------|
| main entry (index) | **145.57 kB** | 150 kB | 4.43 kB (97% used) |
| main chunk (app code) | **119.53 kB** | 120 kB | 0.47 kB (99.6% used) |
| vendor react | **24.81 kB** | 26 kB | 1.19 kB |
| vendor icons | **5.55 kB** | 6 kB | 0.45 kB |
| CSS total | **4.92 kB** | 5 kB | 0.08 kB (98.4% used) |

**Concerns:** **main chunk + CSS at >98% capacity**. ANY new feature addition will tip over. Substrate Wave should keep budget pressure on radar.

**Loading time on slow 3G (Maria 65 target):**
- main entry: 2.9s · app chunk: 2.4s · vendor react: 485ms · vendor icons: 109ms · CSS: 97ms

**Lazy routes:** **35 routes lazy-loaded via `React.lazy()`** în `src/react/routes/router.tsx`. Eager: Splash, Auth, AuthCallback, Onboarding, 4 tab home pages (Antrenor/Progres/Istoric/Cont), Layout, ProtectedRoute (~9 eager). Total React screens ~83 files. **Excellent code-split ratio** (D046 §3.3 LANDED).

**dist/assets size:** 1.3 MB raw / 44 chunks. Largest non-vendor: `index-PS-8IrxQ.js` 441 KB raw, `main-uxRagsuP.js` 399 KB raw (gzip ratios in budgets above).

**Top deps în package.json:**
- React 19, ReactDOM 19, react-router-dom 6.28
- @sentry/browser 10.49 (observability)
- dexie 4.4 (IndexedDB wrapper)
- zustand 5.0 (stores)
- lucide-react 1.16 (icons)
- Firebase: NO SDK (REST per ADR 002)

No bloat surprises. Dependency footprint disciplined.

**Recommendations:**
- Monitor main chunk +CSS budget pressure pre-Beta; consider lifting limits modestly OR splitting further if next feature pushes over.
- `vendor-data` chunk (94.876 KB raw) = Dexie likely, NOT in size-limit budgets (uncovered). Add to budgets pre-Beta.

---

## §4 Dispatch summary (Substrate Wave optional parallel cu Ledger Wave)

| Cluster | Items | Files affected | Est | Theme | Priority |
|---------|-------|----------------|-----|-------|----------|
| **SUBSTRATE-ALFA** | SUB-001, SUB-002, SUB-007 | ~10 prod files (vanilla legacy + React engineWrappers) | **1.5h** | console-strip + DEV-gate policy unify | **LOW** (cosmetic, no Bugatti gate fail) |
| **SUBSTRATE-BETA** | SUB-003, SUB-006 | `src/pages/weight.js` (7 TODOs) + `src/router.js:27` | **1h** | legacy hygiene + TODO triage | **LOW** (defer post-React Clasic prod LANDED verification) |
| **SUBSTRATE-GAMMA** | SUB-004 | 2 test files | **15min** | lint zeroes (5 warnings → 0) | **NIT** (cheap polish) |
| **SUBSTRATE-DELTA** | SUB-005 | 1-2 component files (rest defensible) | **20min** | design-system parity (optional) | **NIT** (purely optional) |
| **SUBSTRATE-EPSILON** | SUB-008 | broad audit | **defer** | storage abstraction migration audit | **DEFER** post-Beta |

**Parallel safe:** [SUBSTRATE-ALFA, SUBSTRATE-BETA, SUBSTRATE-GAMMA, SUBSTRATE-DELTA] — all independent file scopes, no overlap. SUBSTRATE-EPSILON deferred (post-Beta observability work).

**Defer (low priority):** SUBSTRATE-EPSILON

**Critical surprises:** **NONE.** Substrate baseline is genuinely clean post-A022. Most "findings" are LOW/NIT-tier polish, not bugs. Bugatti gate substrate-side: **HEALTHY**.

**Bundle pressure:** main chunk + CSS budgets are at 99% / 98% headroom respectively. Surface this as a LEDGER-side concern pentru feature waves Z-axis, NOT a substrate bug. Recommend Substrate Wave ADD `vendor-data` chunk to `.size-limit.json` (currently uncovered ~95 KB raw / ~30 KB est gzip).
