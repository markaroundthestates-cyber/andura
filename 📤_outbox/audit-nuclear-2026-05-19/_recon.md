# Recon snapshot — pre-§1-§50 audit

**HEAD:** `b705c3f5a1c41e90d23f70102a4ad8ab2989f00f`
**Tag baseline:** `deploy-react-production-2026-05-19` (+ phase-6-batch-landed-2026-05-19, phase-5-batch-landed-2026-05-18, pre-react-entry-swap-2026-05-19)
**Branch:** main (clean per git log).

## Repo top-level

`andura/` ← project name in package.json. NO `LICENSE`, NO `SECURITY.md`, NO `CONTRIBUTING.md`, NO `.env.example`, NO `.eslintrc*`, NO `prettier.config*`.

Top-level files of note:
- `index.html` — React production entry (minimal, see §1 / §15 / §16 findings)
- `index-vanilla-legacy.html` — vanilla preserved backup per D028
- `package.json` (v2.0.0)
- `tsconfig.json` — strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes ✓
- `vite.config.js`
- `firestore.rules` — per-UID strict + telemetry counters
- `database.rules.json` (RTDB) — per-UID strict minimal
- `playwright.config.js`, `tailwind.config.js`, `postcss.config.js`
- `gate-b.bat`, `gate-b-prod.bat`, `gate-c-prod.bat`, `gate-b-script.js` (smoke automation)
- `coverage/`, `dist/`, `reports/`, `simulations/` (build/test outputs)
- `📥_inbox/`, `📤_outbox/` (vault directories Daniel ↔ CC)

## package.json deps inventory

**Runtime deps (7):**
- `react@^19.0.0`, `react-dom@^19.0.0`, `react-router-dom@^6.28.0`
- `zustand@^5.0.13`
- `dexie@^4.4.2`
- `lucide-react@^1.16.0`
- `@sentry/browser@^10.49.0` ← in PRODUCTION deps, weight contributor

**Dev deps (29):** Playwright 1.59, Stryker mutation 9.6, Vitest 3.2, jsdom 25, fake-indexeddb 6.2, testing-library/react 16.3 + user-event 14.6 + jest-dom 6.9, types/react 19 / types/node 25.6 / types/jsdom 28, @vitejs/plugin-react 4.3, @vitest/coverage-v8 3.2, autoprefixer 10.5, gh-pages 6.1, husky 9.1, lint-staged 16.4, postcss 8.5, tailwindcss 3.4.19, typescript ^6.0.3, vite 5.2, vite-plugin-pwa 1.3, workbox-window 7.4

**FLAG:** TypeScript `^6.0.3` declared but TypeScript hasn't shipped a `6.x` (latest stable mid-2026 is 5.7-ish). Either a typo OR a beta channel — needs verification. See §3 + §41.

**NO:** firebase npm package — confirms D-LEGACY-002 Firebase via REST not SDK (although `@sentry/browser` and others may include fetch wrappers). Engine confirms via `src/firebase.js` raw REST.

## tsconfig strict flags

ALL critical strict flags enabled:
- `strict: true` (umbrella)
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `noImplicitOverride: true`
- `noUncheckedIndexedAccess: true` ✓ (§3.1)
- `exactOptionalPropertyTypes: true` ✓ (§3.2)

`allowJs: true` + `checkJs: false` — vanilla legacy `.js` files type-checked permissively. Means engines + adapters in `.js` are NOT type-checked (only React `.ts`/`.tsx` consumers).

## src/ tree (curated)

```
src/
├── App.tsx                          ← Phase 1 placeholder, NOT used by main.tsx (DEAD CODE candidate §22.3)
├── main.tsx                         ← React entry, RouterProvider
├── main.js                          ← Vanilla legacy entry (preserved per D028)
├── bootstrap.js, auth.js, onboarding.js  ← Vanilla legacy
├── db.js                            ← IndexedDB Dexie
├── firebase.js                      ← REST API wrapper
├── constants.js, state.js, router.js, inject.js, vite-env.d.ts
│
├── react/                           ← React production (Phase 1-6)
│   ├── components/   ← AaFrictionModal, BottomNav, Calendar7Day,
│   │                   ErrorBoundary, LoadingSkeleton, MedicalDisclaimerModal,
│   │                   NutritionInline, SessionPill, UpdatePrompt + Antrenor/, Progres/, Workout/ subdirs
│   ├── routes/       ← Layout, ProtectedRoute, router, screens/
│   │   └── screens/  ← Auth, Onboarding, Splash + antrenor/, cont/, progres/, istoric/ subdirs
│   ├── lib/          ← 10 helper files including 5 *Aggregate.ts adapters
│   ├── stores/       ← 7 Zustand stores (app, coach, nutrition, onboarding, progres, schedule, settings, workout)
│   └── __tests__/    ← React-specific tests
│
├── engine/           ← Big 11 + auxiliary engines (.js + .d.ts)
│   ├── bayesianNutrition/  ← Kalman filter + observation + prior/posterior + volume landmarks + crossEngineHooks
│   ├── periodization/      ← Macrocycle/Mesocycle + volume landmarks + crossEngineHooks
│   ├── deload/, energyAdjustment/, goalAdaptation/, schedule/, specialization/, tempo/, warmup/
│   ├── composite-signal/, pain-button/, self-correction/, smart-routing/, suflet-andura/
│   ├── dimensions/         ← Dimension Registry (Open-Closed)
│   ├── acceleratedLearning.js, acceleratedLearningAdapter.js
│   ├── adherence.js (Phase 6 task_08 real wire)
│   ├── aggressiveLoadingThreshold.js, alternativeEngine.js, autoAggressionDetection.js
│   ├── calibration.js, calibrationReconciliation.js
│   ├── coachContext.js, coachDirector.js (Phase 6 task_06 8-field enrich)
│   ├── coldStartGuidelines.js, decisionCluster.js
│   ├── dimensionContract.js, dimensionRegistry.js
│   ├── dp.js (Double Progression D-LEGACY-003)
│   ├── exerciseMapping.js, fatigue.js + .d.ts
│   ├── linearBlock.js, masteryMilestone.js
│   ├── muscleMap.js, muscleMemoryAdapter.js, muscleMemoryIndex.js
│   ├── muscleRecovery.js, muscleRecoveryConstants.js
│   ├── patternLearning.js, plateauInterventions.js
│   ├── predictionEngine.js, prEngine.js + .d.ts
│   ├── proactiveEngine.js, profileTyping.js, progressionMatrix.js
│   ├── readiness.js + .d.ts, reality.js, recompileEngine.js
│   ├── responseProfile.js, ruleEngine.js
│   ├── sessionBuilder.js, stagnationDetector.js
│   ├── sys.js, usNavyBF.js, weaknessDetector.js, whyEngine.js
│   └── __tests__/
│
├── coach/orchestrator/
│   ├── adapters/    ← 8 adapter chain per §1.3
│   ├── contextBuilder.js
│   ├── index.js, result.js, types.js
│   ├── utilities/
│   └── __tests__/
│
├── util/             ← coachDecisionLog (CDL), tierStorage, isoWeek, telemetry, autoBackup,
│                       cdlBackfill, sentry, dataCleanup, dataRegistry, featureFlags,
│                       logFilter, logBackup, logsMigration, tombstones, adminCleanupHelpers, adminPrefill
│
├── components/, pages/, themes/, ui/   ← Vanilla legacy (deprecated per D015, NU bundle prod?)
├── coach/orchestrator/                 ← shared between vanilla + React
├── i18n/, migrations/, schema/, simulator/, storage/, styles/, tests/, validation/, config/
```

**Source file count:** 575 `.js`/`.ts`/`.tsx` în src/.
**Test file count:** 253 `.test.*` + 17 Playwright `.spec.*` = 270 test files (~roughly matches §2 "251 files").

## index.html (React PRODUCTION entry, 30 LOC)

**CRITICAL issues:** minimal HTML, missing:
- NO `<link rel="manifest">` (vite-plugin-pwa may auto-inject during build, verify in dist/)
- NO `theme-color` meta
- NO `apple-touch-icon`
- NO description meta (Open Graph absent)
- NO favicon (`<link rel="icon">` absent)
- Title says "Andura — Clasic (React build Phase 1)" — STALE (Phase 1 deployed Phase 6)
- `color-scheme: dark` but app theme is paper/light → can cause flash and prefers-color-scheme mismatch
- Body inline styles set `background: #0a0a0a; color: #e8e8e8` BEFORE Tailwind loads → FOUC dark → light

## index-vanilla-legacy.html (preserved backup)

Vanilla preserved per D028 has manifest link, fonts preconnect, apple-touch-icon, theme-color, offline indicator. NOT shipped to production (Daniel renamed swap per D028 PROC LOCKED V1 PERMANENT).

## main.tsx (22 LOC, React entry)

- `StrictMode` enabled ✓
- `RouterProvider` from react-router-dom v6.28
- Imports `./styles/global.css`
- Hard-fails with `throw new Error` if `#root` element missing
- App.tsx is NOT imported by main.tsx — DEAD CODE (Phase 1 placeholder).

## CI/CD workflows

3 workflows in `.github/workflows/`:

### `deploy.yml` — GH Pages deploy
- Trigger: push to `main` (path-ignores vault dirs + .md)
- Node 20
- Steps: checkout → npm install (NU `npm ci`!) → npm run build → gh-pages action V3
- **MISSING:** NO typecheck, NO test gate, NO lint before deploy
- **MISSING:** NO `actions/checkout@v4` SHA pin (uses tag → supply chain attack surface)

### `ci.yml` — Validate + e2e-smoke
- Trigger: push to `main`/`dev` + PR to `main` + cron Mon 06:00 UTC
- **Node 22 ← INCONSISTENT cu deploy.yml Node 20!**
- Validate job: `npm ci` → typecheck → vitest test:run → build
- e2e-smoke job: workflow_dispatch / schedule only (cost optimization per D010)
- concurrency group `ci-${{ github.ref }}` cancel-in-progress ✓

### `qa-report.yml` — Post-deploy Playwright report
- Trigger: workflow_run after Deploy completes
- Runs Playwright headless chromium → posts commit comment/status
- Sleep 45s after deploy for GH Pages propagate
- core.setFailed if tests fail BUT deploy already happened → reactive not preventive

## Firestore + RTDB rules

`firestore.rules` per-UID strict + soft-delete subcollections + archive + telemetry counter limited-keys (FieldValue.increment only). Comment says "Daniel must publish manually via Firebase Console" — file = SSOT spec, Console publish = production effect → DRIFT risk if not synced.

`database.rules.json` per-UID strict minimal — only `users/$uid` write-read, default deny elsewhere. Smaller surface area, OK.

## vite.config.js

- `base: '/'` ✓
- Manual chunks vendor split: react/zustand/icons/data ✓
- `sourcemap: false` prod ✓ (§5.4)
- `chunkSizeWarningLimit: 600`
- VitePWA `registerType: 'autoUpdate'` ✓
- workbox runtimeCaching:
  - `firebaseio.com/*` → NetworkFirst (timeout 3s, maxAge 1d, max 50)
  - `fonts.googleapis.com/*` → CacheFirst (maxAge 1y, max 30)
- `devOptions: { enabled: false }` ← dev skip SW (HMR conflict) ✓
- includeAssets: icon-192, icon-512

## SW + manifest duplication CONFLICT

- `public/sw.js` — manual SW (cache name `andura-v2`, ASSETS=index.html + manifest.json + icons) → copied to dist/
- vite-plugin-pwa generates `dist/sw.js` from workbox config → conflicts with manual SW at same path?
- `public/manifest.json` AND vite-plugin-pwa generates `dist/manifest.webmanifest` (with different name + slightly different content)
- **VERIFY in dist:** which SW is registered? `import.meta.env.MODE` switching? Investigation needed for §16 finding.

## Husky pre-commit

`.husky/pre-commit` runs `npm run test:run` (vitest only). MISSING typecheck, MISSING lint. §21.12.

## Initial CRITICAL flags emerging (preview)

1. **§4 / §16**: dual SW + dual manifest conflict surface
2. **§33 deploy.yml**: NO test gate before deploy (`npm install`, build, deploy → typecheck + vitest happen only in separate ci.yml, NOT a prerequisite)
3. **§33**: Node version mismatch deploy (20) vs ci (22)
4. **§1 / §15**: production `index.html` missing manifest link, theme-color, apple-touch-icon, description, favicon, has stale "Phase 1" title
5. **§22 / §10.5**: `AaFrictionModal.tsx` EXISTS in src/react/components/ — verify NOT wired anywhere (F5 LOCK V1 = DROP V1 per §10.5)
6. **§41**: typescript `^6.0.3` doesn't exist — pin verification needed
7. **§18**: NO LICENSE, NO SECURITY.md, NO .env.example, NO CONTRIBUTING.md
8. **§1.8**: NO ESLint config — code formatting/quality not enforced
9. **§28**: Firestore rules require manual Console publish — drift risk
10. **§5.7-§5.34**: NO Lighthouse CI infrastructure visible — can't enforce Core Web Vitals at CI level
