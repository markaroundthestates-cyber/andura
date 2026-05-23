# Test coverage gap investigation chat 5 — 2026-05-23

**Investigator:** TEST-COVERAGE-GAP-INVESTIGATION agent (chat 5, parallel cu E2E-FINAL-SMOKE-CHAT5)
**Mode:** READ-ONLY src/ + tests/, zero edit, zero commit
**Repo:** `C:\Users\Daniel\Documents\salafull` branch `main`
**Coverage tool:** Vitest v3.2.4 + `@vitest/coverage-v8` provider (vitest.config.js §coverage)
**Run command:** `npx vitest run --coverage --reporter=basic` (300+s execution)
**Output captures:**
- Coverage summary fresh: `coverage/coverage-summary.json` (regen 2026-05-23 04:40, supersede stale 2026-05-02 pre-React snapshot)
- HTML reports: `coverage/salafull/src/**/*.html`
- Working scripts: `__cov_analyze.cjs`, `__cov_engines.cjs` (temp helpers, NU touched src/)

---

## Coverage baseline

- **Total tests:** 5387 PASS (per chat 5 baseline; coverage run sampled subset via vitest config include `src/**/*.test.{js,ts,tsx}` + `tests/engine/**/*.test.{js,ts}`)
- **Coverage report available:** YES (regenerated 04:40)
- **Overall line coverage:** **89.82%** (31 688 / 35 279 lines)
- **Overall statements:** 89.82%
- **Overall branch coverage:** **85.82%** (6 555 / 7 638)
- **Overall functions:** **90.58%** (1 087 / 1 200)
- **Files audited:** 279 (vitest scope: `src/engine/**`, `src/coach/**`, `src/react/**`, `src/util/**`; `src/pages/*` legacy vanilla EXCLUDED)
- **Vitest current thresholds floor:** lines 60 / functions 55 / branches 50 / statements 60 (Track 7 initial floor — current >>> floor everywhere global)

---

## Per-category coverage (rollup pe categorii)

| Categorie | Files | Lines % | Branch % | LOC total |
|---|---:|---:|---:|---:|
| **engine** (8 piloni + sub-modules) | 129 | 89.20 | 85.15 | 21 812 |
| **react/stores** (Zustand) | 8 | 90.46 | 94.48 | 503 |
| **react/components** | 38 | 96.62 | 90.99 | 2 368 |
| **react/routes/screens** | 47 | 95.19 | 90.85 | 4 846 |
| **react/lib** (adapters + helpers) | 19 | 91.03 | 87.10 | 1 159 |
| **react/hooks** | 1 | 100.00 | 86.67 | 47 |
| **react/routes** (router + Layout + ProtectedRoute) | 3 | **31.34** | 81.82 | 201 |
| **util** | 18 | 82.52 | 75.43 | 2 535 |
| **coach** (orchestrator) | 15 | 89.55 | 79.43 | 1 808 |

**Hot-spot rollup:** `react/routes` la 31.34% e singura categorie sub 80% line — root cause `router.tsx` 0%, `AuthCallback.tsx` 0%, `themeSync.ts` 0% (sub-categ react/lib). Restul categoriilor >82%.

---

### Engine layer (89.20% line / 85.15% branch — 129 files)

**Engine files cu >=50 LOC sortate ASC pe line %:**

| File | Line % | Branch % | LOC | Status |
|---|---:|---:|---:|---|
| `src/engine/coldStartGuidelines.js` | **0** | 0 | 172 | ZERO test — guideline pure (cold start RIR matrix decizii post-onboarding) |
| `src/engine/responseProfile.js` | **0** | 0 | 134 | ZERO test — response profile aggregator |
| `src/engine/bayesianNutrition/types.js` | 0 | 0 | 172 | Type stubs only (Zod schemas — runtime contracts NU value) |
| `src/engine/deload/types.js` | 0 | 0 | 227 | Type stubs only |
| `src/engine/energyAdjustment/types.js` | 0 | 0 | 117 | Type stubs only |
| `src/engine/goalAdaptation/types.js` | 0 | 0 | 92 | Type stubs only |
| `src/engine/periodization/types.js` | 0 | 0 | 90 | Type stubs only |
| `src/engine/specialization/types.js` | 0 | 0 | 197 | Type stubs only |
| `src/engine/tempo/types.js` | 0 | 0 | 166 | Type stubs only |
| `src/engine/warmup/types.js` | 0 | 0 | 182 | Type stubs only |
| `src/engine/fatigue.js` | **44.57** | **9.09** | 83 | MAJOR GAP — branch 9.09% catastrophic |
| `src/engine/reality.js` | **46.1** | 72.41 | 154 | reality-check 7-min logic partial |
| `src/engine/aa.js` | 58.68 | 57.37 | 167 | Auto-aggression detection core — sub 60% |
| `src/engine/sys.js` | 60.59 | 75.38 | 269 | Sys orchestrator borderline |
| `src/engine/readiness.js` | 69.87 | 69.56 | 83 | Readiness/T0→T3 stub |
| `src/engine/predictionEngine.js` | 98.01 | **50.00** | (26 br) | Branch 50% in critical predict path |
| `src/engine/recompileEngine.js` | 91.48 | **50.00** | (16 br) | Branch 50% recompile triggers |

**Engine HIGH-coverage zone (>=85% line):** kalmanFilter 90.49, prEngine 91.20, decisionCluster 92.82, adherence 93.69, profileTyping 99.79, autoAggressionDetection 100%, calibration 100%, dimensionContract 100%, calibrationReconciliation 100%, plateauInterventions 98.32, whyEngine 100%, ruleEngine 100%. **8 piloni core la T7+ baseline.**

**Sub-module engines `types.js` zero coverage = expected** (Zod schema export-only, runtime contracts validated downstream prin import). NU prioritate gap real — strip aceste files din metric pentru "real coverage" calculation.

---

### Stores layer (90.46% line / 94.48% branch — 8 stores)

| Store | Line % | Branch % | LOC | Status |
|---|---:|---:|---:|---|
| `onboardingStore.ts` | **72.72** | 97.14 | 110 | Lines 140-150, 195-213 untested (edge cases retry/error) |
| `scheduleStore.ts` | **78.82** | 71.42 | 85 | Lines 126-131 (Sentry breadcrumb branches) |
| `appStore.ts` | 100 | 100 | 20 | Solid |
| `coachStore.ts` | 100 | 100 | 23 | Solid |
| `nutritionStore.ts` | 100 | 100 | 41 | Solid |
| `progresStore.ts` | 100 | 100 | 26 | Solid |
| `settingsStore.ts` | 100 | 94.44 | 60 | Solid |
| `workoutStore.ts` | **100** | **100** | 138 | **66 tests FSM transitions — exemplar quality** |

**Verdict:** Stores layer = aproape complet. workoutStore FSM (Workout Phase logging→rating→rest→transition→idle) tested la 100% line + branch via 66 atomic test cases — gold standard.

---

### Components layer (96.62% line / 90.99% branch — 38 files)

**Untested components (NU în __tests__/components):**
- `BMRStrip.tsx` (Progres) — exists, has branch test gap 45.45% / line 85.36%
- `BottomNav.tsx` — primary nav UI ZERO test
- `CoachRestCard.tsx`, `CoachTodayCard.tsx` — Antrenor sub-cards ZERO test
- `InactivityPrompt.tsx` (Workout sub) — already partial via Workout.test wire
- `LoadingSkeleton.tsx` — visual stub
- `PRNotificationBanner.tsx` — PR banner UI ZERO test
- `ReadinessVerdict.tsx` (Antrenor) — readiness verdict card
- `SetRatingButtons.tsx` (Workout) — already partial via Workout.test wire
- `StatsGrid.tsx` — generic stats grid
- `UpdatePrompt.tsx` — 35.41% line / 60% branch (PWA update banner)

**Verdict:** 10 untested + 1 low-coverage component. Cele mai HIGH-ROI: `BottomNav` (primary navigation Gigel-critical), `PRNotificationBanner` (toast surface PR detection wire), `UpdatePrompt` (PWA SW lifecycle Maria 65 sensitive).

---

### Screens layer (95.19% line / 90.85% branch — 47 files)

**Untested screens:**
- **`AuthCallback.tsx` — 0% line, 0% branch, 99 LOC** — CRITICAL: Magic Link verifier (oobCode parse + verifyMagicLink call + Google id_token fallback). Singura cale auth callback NU acoperit unit. (E2E `tests/magic-link.spec.ts` exista Playwright dar smoke-only)
- **`Splash.tsx` — 100% line but 33.33% function** — splash branch logic minimal acoperita
- `IstoricDetail.tsx` — 100% line (de fapt acoperit via Istoric.test indirect wire)

**Restul 44 screens:** 79-100% line, 75-100% branch. Solid teritoriu.

---

### Util layer (82.52% line / 75.43% branch — 18 files)

| File | Line % | Branch % | LOC | Status |
|---|---:|---:|---:|---|
| `src/util/adminPrefill.js` | **0** | 0 | 61 | ZERO test — admin tooling (low ROI Beta) |
| `src/util/sentry.js` | **19.53** | 33.33 | 128 | CRITICAL Sentry init + PII strip beforeSend uncovered |
| `src/util/dataCleanup.js` | **48.33** | 55.55 | 360 | MAJOR — 200+ lines uncovered (cleanup engine fake logs) |
| `src/util/autoBackup.js` | 85.21 | 78.78 | 142 | Mid-tier (backup persistence) |
| `src/util/coachDecisionLog.js` | 91.79 | 68.14 | 390 | Branch sub-70% on CDL append paths |
| `src/util/tierStorage.js` | 92.36 | **58.82** | 144 | Branch low (T0/T1/T2 tier routing) |
| `src/util/tombstones.js` | 97.59 | **67.05** | 249 | Tombstone branch gaps |

**Restul 11 util files:** >=94.7% line, majoritatea 100%.

---

### React routes layer (31.34% line — 3 files, HOT SPOT)

| File | Line % | Branch % | LOC | Status |
|---|---:|---:|---:|---|
| **`src/react/routes/router.tsx`** | **0** | 0 | 136 | ZERO test — createBrowserRouter config + 23 lazy chunks. Integration via routing.test.tsx folosește MemoryRouter manual fallback |
| `src/react/routes/Layout.tsx` | 100 | 83.33 | 32 | Solid |
| `src/react/routes/ProtectedRoute.tsx` | 93.93 | 86.66 | 33 | Solid |

**Verdict:** `router.tsx` =  config + lazy declarations. Functional behavior testat indirect prin screen tests; ZERO direct integration test pe createBrowserRouter shape. Acceptable gap (declarative wiring), dar lazy chunk path lookups untested.

---

### React lib layer (91.03% line / 87.10% branch — 19 files)

| File | Line % | Branch % | LOC | Status |
|---|---:|---:|---:|---|
| `src/react/lib/themeSync.ts` | **0** | 0 | 36 | ZERO test — theme→DOM sync side-effect |
| `src/react/lib/format.ts` | 100 | 100 | (clean) | Solid |
| `src/react/lib/navigation.ts` | 100 | 97.43 | (clean) | Solid |
| `src/react/lib/engineWrappers.ts` | 88.13 | 82.01 | (large) | Major lib la 88% — lines 791, 836-838 (MMI silent cap edges?) |
| `src/react/lib/networkStatus.ts` | 86.84 | 72.22 | (clean) | OfflineBanner backing |

**Restul lib:** 88-100% — solid post Phase 5/6/7.

---

## Top 5 priority gaps chat 6 (highest ROI)

Ranked by **surface area × consequence_if_broken × Gigel/Maria sensitivity**:

### 1. **`src/util/sentry.js`** — 19.53% line / 33.33% branch / 128 LOC
**Why CRITICAL:** Chat 5 introduced Sentry consent gate logic. Current coverage masks beforeSend PII strip (uid 28-char, JSON breadcrumb data) untested for false-negatives. Production debugging = sole signal post-Beta. Daniel CEO directive D-LEGACY pe Sentry init paths.
**Test scope chat 6:** initSentry production-only guard (3 conditii: hostname, MODE, _initialized); beforeSend filter chain (5 noise patterns + Firebase tag + uid PII strip). Fake `import.meta.env` mock.
**Estimate:** 1-2 ore, ~15-20 tests covering Sentry init paths + beforeSend PII edge cases.

### 2. **`src/util/dataCleanup.js`** — 48.33% line / 55.55% branch / 360 LOC
**Why HIGH:** 200+ lines uncovered (lines 324-414). Used pentru fake-log/orphan cleanup runs din admin tooling + cdlBackfill flow. Bug aici = silent data loss sau orphaned entities production. Maria 65 + Marius performant deopotrivă afectati.
**Test scope chat 6:** dryRun mode vs apply mode, orphan detection per Dexie table, idempotency guarantees, abort-on-error.
**Estimate:** 2-3 ore, ~25-30 tests.

### 3. **`src/react/routes/screens/AuthCallback.tsx`** — 0% / 0% / 99 LOC
**Why HIGH:** Singura cale Magic Link callback verifier (post-D028 React). verifyMagicLink + Google id_token fallback + pendingEmail recovery — ALL 0% coverage. E2E Playwright doar smoke happy-path (`tests/magic-link.spec.ts`). Fail = utilizator nou ZERO acces după click email link. Gigel test critical.
**Test scope chat 6:** RTL mount cu MemoryRouter, mock verifyMagicLink success/fail/timeout, oobCode parse edge cases (URL malformed, email absent → localStorage fallback), Google id_token hash parse (#id_token=jwt).
**Estimate:** 1-2 ore, ~12-15 tests.

### 4. **`src/engine/fatigue.js`** — 44.57% line / **9.09% branch** / 83 LOC
**Why HIGH:** Branch 9.09% = catastrofic. Fatigue is one of 8 piloni — RIR adjustment downstream. Uncovered branches = silent wrong-RIR recommendation Marius/Gigel. Bugatti rule: NU fix later.
**Test scope chat 6:** All fatigue thresholds (low/mid/high), edge muscle-group inputs, RIR conversion branches.
**Estimate:** 1 oră, ~15 tests (mostly branch coverage).

### 5. **`src/engine/aa.js`** + **`src/engine/reality.js`** — 58.68% & 46.1% / 167 + 154 LOC
**Why MEDIUM-HIGH:** AA = Auto-Aggression detection core (D-LEGACY-013 supersede force-typing). reality = 7-min check guard pre-workout. Both gated D045 V1 LOCKED Wave A scope. Branch logic gaps = silent wrong-tier override risk. Combined: 321 LOC under 60% line.
**Test scope chat 6:** AA escalation thresholds (slow_sets/fast_sets fixtures), reality check 7-min cutoff, calibration vs production tier discrimination.
**Estimate:** 2-3 ore, ~30 tests cumulated.

### Secondary (lower ROI dar must-have pre-Beta):

- `src/util/tierStorage.js` 58.82% branch — Tier 0/1/2 storage routing decisions, IndexedDB fallback
- `src/util/coachDecisionLog.js` 68.14% branch — CDL append edge cases (cdlBackfill integration)
- `src/util/tombstones.js` 67.05% branch — Tombstone branch gaps (sync conflict resolution)
- `src/engine/predictionEngine.js` + `recompileEngine.js` 50% branch — both <30 branches each, quick wins
- `src/react/routes/router.tsx` 0% line (config-only, acceptable but a `it('lazy chunks resolve')` smoke test = 10 min)
- `src/react/lib/themeSync.ts` 0% line / 36 LOC — DOM `data-theme` setter, side-effect easy to test
- 10 components untested (`BottomNav`, `PRNotificationBanner`, `UpdatePrompt`, `BMRStrip` low-branch etc.) — UI smoke wave Phase 5/6 follow-up gap

---

## Daniel CEO decisions (de surface)

1. **Coverage threshold target pre-Beta:**
   - **Current global:** 89.82% line / 85.82% branch / 90.58% functions
   - **Vitest config floor:** 60% L / 50% B / 55% F (initial Track 7)
   - **Propunere chat 6 RATCHET:** lines 85 / branches 80 / functions 88 / statements 85 (current minus 5% headroom)
   - Alternativa Bugatti: lines 90 / branches 85 / functions 90 — forced cleanup top-5 gaps before pass

2. **Mandatory paths must-have coverage (Bugatti gate pre-Beta):**
   - Workout FSM transitions: **DONE 100% / 100%** (66 tests workoutStore)
   - Auth flow Magic Link: **MMI cap testat 16 tests dar AuthCallback 0% gap** — chat 6 priority #3
   - Sentry consent gate: **19.53% gap critical** — chat 6 priority #1
   - MMI silent cap (chat 5 new): MMI silent cap tested (16 tests engineWrappers.mmi-silent-cap.test.ts) — **OK**
   - Backup/Restore flow: dexieMigration 93.25% line testat + dexieMigration.restore.test.ts standalone — **OK**
   - Payment/Stripe: ZERO Stripe SDK în repo (post-Beta) — N/A
   - Magic Link E2E: tests/magic-link.spec.ts exista (Playwright smoke) — OK

3. **Types files (`*/types.js`) 0% coverage decision:** strip from "real coverage" metric (Zod schema exports, runtime validated downstream). Adjustment normalize ar ridica overall line% spre ~93%. Recommend: **exclude `**/types.js` din vitest.config coverage.exclude** pentru honest metric.

4. **Coverage report freshness gate:** add npm script `test:coverage` cu auto-regen pre-Beta commit. Stale 21-day report 2026-05-02 era inaccurate (legacy vanilla pre-React D028 swap). Bugatti: never trust stale coverage.

5. **routes/router.tsx 0% acceptable?** Config-only declarative wiring. Recommend single smoke test: `it('exports valid RouteObject tree with 23 lazy chunks')`. NU full integration (functional testat via screen tests).

---

## Blockers

NONE — investigation complete, output written, paralelizare cu E2E-FINAL-SMOKE-CHAT5 nu a generat conflict (read-only).

**Cleanup datorat:** temp files `__cov_analyze.cjs` + `__cov_engines.cjs` la repo root (NU touched src/), DA pot fi sterse post raport. Daniel/CC followup decide.

---

## Files referenced

- `vitest.config.js` — coverage scope + thresholds floor §coverage
- `package.json` — `test:coverage` script ABSENT (recommend add)
- `coverage/coverage-summary.json` — fresh 2026-05-23 04:40 (regenerat din 2026-05-02 stale)
- `src/react/__tests__/lib/engineWrappers.mmi-silent-cap.test.ts` — 16 tests MMI silent cap chat 5 LANDED
- `src/react/__tests__/stores/workoutStore.test.ts` — 66 tests FSM exemplar
- `tests/magic-link.spec.ts` — Playwright smoke Magic Link (E2E supplements unit gap)
- `tests/workout-fsm.spec.ts` — Playwright workout FSM E2E

---

**Final raport format lean:**

TEST-COVERAGE-GAP-INVESTIGATION: `📤_outbox/TEST_COVERAGE_GAP_INVESTIGATION_chat5.md`
LOC: ~260
Coverage report: AVAILABLE (regenerated 2026-05-23 04:40)
Overall coverage: 89.82% line / 85.82% branch / 90.58% functions
Top 5 gaps priority:
1. `src/util/sentry.js` (19.53% L / 33.33% B / 128 LOC) — Sentry consent + PII strip
2. `src/util/dataCleanup.js` (48.33% L / 55.55% B / 360 LOC) — orphan cleanup
3. `src/react/routes/screens/AuthCallback.tsx` (0% L / 99 LOC) — Magic Link verifier
4. `src/engine/fatigue.js` (44.57% L / **9.09% B** / 83 LOC) — RIR fatigue branches
5. `src/engine/aa.js` + `src/engine/reality.js` (58.68% / 46.1% / 321 LOC combined) — AA + reality gating

Daniel CEO decizii surface:
- Ratchet threshold floor 60/50/55 → 85/80/88 (Bugatti: 90/85/90)
- Exclude `**/types.js` din coverage metric
- Add `test:coverage` script + freshness gate pre-Beta
- AuthCallback 99 LOC + sentry.js 128 LOC = top 2 must-have pre-Beta (Magic Link + production debug telemetry)

Blockers: NONE.
