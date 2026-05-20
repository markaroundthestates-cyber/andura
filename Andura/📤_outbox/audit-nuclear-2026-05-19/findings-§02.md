# §2 — Test Files Audit (~270 files)

**Scope:** All `*.test.{js,ts,tsx}` under `src/` (253 files) + `tests/**/*.spec.js` Playwright E2E (17 files) ≈ 270 test files (prompt mentions "251 files" — close match).
**Method:** Sample inspection of vitest config + Playwright config + setup file + key engine + React tests + smoke tests. Pattern grep for flake risks.

## Severity matrix §2

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 5 |
| MED | 6 |
| LOW | 3 |
| NIT | 2 |
| **Total** | **18** |

---

## CRITICAL findings

### §2-C1 — Playwright E2E targets PRODUCTION live `https://andura.app` (no local dev server)
**Severity:** CRITICAL
**Evidence:** `playwright.config.js:13` `baseURL: 'https://andura.app'`. NO `webServer: { command: 'npm run dev', port: ... }` block. `tests/smoke.spec.js` + `tests/e2e/**` all navigate to `page.goto('/')` resolving to live production.
**Karpathy:** Think Before Coding — CI Playwright job validates LIVE PROD, not PR build.
**Reasoning:**
- `ci.yml` e2e-smoke runs `npx playwright test tests/e2e/smoke` after building dist/ but NEVER serves dist/. baseURL still resolves to production.
- A regression in PR code that breaks something is NOT caught by E2E in CI — E2E always tests whatever is currently on https://andura.app.
- `qa-report.yml` runs post-deploy Playwright vs live → at least closes the loop, but findings POST-deploy = reactive not preventive.
- Smoke test "app loads in under 5 seconds" measures network latency to GH Pages CDN from GH Actions runner — wildly variable, false flakes.
- Cannot run E2E offline / CI without internet.
- Architecture coupling between test runner ↔ shipped production.
**Fix log:** Add `webServer: { command: 'npm run preview', port: 4173, reuseExistingServer: !process.env.CI }` to playwright.config.js. Change `baseURL` to `http://localhost:4173`. Keep a separate `playwright.smoke-prod.config.js` for post-deploy live smoke (qa-report.yml). Total ETA: M.

### §2-C2 — Vitest config missing coverage thresholds, testTimeout overrides, retry policy
**Severity:** CRITICAL (Beta entry quality gate, §2.8 + §2.9 + §50.3)
**Evidence:** `vitest.config.js:8-37`:
- NO `test.testTimeout` (default 5000ms — single slow async test fails undeterministically).
- NO `test.hookTimeout` (default 5000ms — same).
- NO `test.retry` (Vitest 1.0+ default 0 retries → flake masquerades as fail).
- `coverage.provider: 'v8'` ✓ + `reporter: ['text', 'json-summary', 'html']` ✓ but NO `coverage.thresholds: { lines: N, functions: N, branches: N, statements: N }` — coverage gate UNENFORCED.
- `coverage.include` MISSING → defaults to "all files Vitest sees" — may over-include build artifacts unintentionally.
- NO `test.passWithNoTests: false` — empty test file passes silently.
**Karpathy:** Goal-Driven Execution — Beta entry criteria §50.3 mentions "tests verde mandatory" but the green bar is meaningless if N% coverage / N flakes acceptable.
**Reasoning:** Without testTimeout/hookTimeout explicit, slow CI runs are nondeterministic. Without coverage thresholds, regression in test coverage (engineer drops tests during refactor) → silent.
**Fix log:** Add to vitest.config.js:
```js
test: {
  ...,
  testTimeout: 10000,
  hookTimeout: 10000,
  retry: 1,
  passWithNoTests: false,
  coverage: {
    ...,
    thresholds: {
      lines: 80,
      functions: 75,
      branches: 70,
      statements: 80,
    },
    include: ['src/engine/**', 'src/coach/**', 'src/react/**', 'src/util/**'],
  },
}
```
Adjust thresholds based on actual current coverage % (TBD — run `npm run test:run -- --coverage`).

---

## HIGH findings

### §2-H1 — Playwright config NO retries, NO workers limit
**Severity:** HIGH (§2.6 + flake mitigation)
**Evidence:** `playwright.config.js` — NO `retries: process.env.CI ? 2 : 0`, NO `workers: process.env.CI ? 1 : undefined`. Default: 0 retries, workers = #cores.
**Karpathy:** Surgical Changes — 2-line fix.
**Reasoning:** Per D019, 23 E2E fails LOCK 4 disclaimer regression backlog — flakes will compound. CI runners shared CPU → unlimited workers cause resource contention → false fails.
**Fix log:** Add `retries: process.env.CI ? 2 : 0` + `workers: process.env.CI ? 2 : undefined` + `fullyParallel: true`.

### §2-H2 — Smoke tests use vanilla legacy suppression flags AFTER React entry swap (D028)
**Severity:** HIGH (test-coupling rot post-D028 + §2.5 fixtures realistic)
**Evidence:** `tests/smoke.spec.js:5-11` `page.addInitScript(() => { window._suppressAAFrictionModal = true; window._suppressOnboardingOverlay = true; });`. Grep `_suppressAAFrictionModal` consumed at `src/components/modalManager.js:124` AND `src/onboarding.js:38` — BOTH are vanilla legacy paths. React build (production post-D028) does NOT consume these flags.
**Karpathy:** Think Before Coding — react entry swap rendered these flags inert.
**Reasoning:** Smoke tests probably PASS in production because React initial load doesn't render AA friction modal anyway (Antrenor.tsx shows it conditionally only post-set during workout — not at /load) and React onboarding renders only at /onboarding/:step. So tests pass BY ACCIDENT not by suppression. False sense of confidence — equivalent to dead test code.
**Fix log:** Either (a) remove `addInitScript` block entirely if production smoke = `/` landing (no modal anyway), or (b) wire React-equivalent suppression (Zustand store flag readable from window) and update components AaFrictionModal.tsx + Onboarding.tsx to honor it.

### §2-H3 — Vitest setup file lacks fake-indexeddb registration + console.error→throw + cleanup
**Severity:** HIGH (test isolation + §2.15 + §2.4 flake)
**Evidence:** `src/react/__tests__/setup.ts:1-4` — only `import '@testing-library/jest-dom/vitest'`. NO global `import 'fake-indexeddb/auto'`. NO `beforeEach(() => { cleanup(); })`. NO console.error → fail conversion (catches PropTypes warnings + React act warnings + key warnings).
**Reasoning:** Per `package.json` deps `fake-indexeddb@^6.2.5` is installed. Each Dexie test must manually `import 'fake-indexeddb/auto'` — easy to forget → tests using real IndexedDB across tests share state → cross-test leak. React act warnings (test environment side effect emit) silently pass.
**Fix log:** Augment `setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => { cleanup(); });

// Fail tests on unexpected console.error (React warnings, PropTypes, etc.)
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    originalError(...args);
    throw new Error(`Unexpected console.error: ${args.join(' ')}`);
  };
});
```

### §2-H4 — Antrenor.test.tsx mock returns BASELINE only → real coachDirectorAggregate path UNTESTED
**Severity:** HIGH (§2.2 + §2.3 + §2.5)
**Evidence:** `src/react/__tests__/screens/antrenor/Antrenor.test.tsx:11-23` `vi.mock('../../../lib/coachDirectorAggregate', () => ({ getCoachToday: vi.fn(async () => ({ readiness: null, fatigue: null, plannedWorkout: null, isRestDay: true, patternsBanner: [], prWallRecent: [], alerts: [], source: 'baseline' as const })) }))` — always returns null/baseline shape. Real Phase 6 task_06 8-field enrich path NOT exercised by Antrenor smoke tests. Tests verify shell renders + clicks; do NOT verify integration with real engine outputs.
**Karpathy:** Goal-Driven — Beta entry requires real-engine integration confidence.
**Reasoning:** Antrenor screen with `source: 'engine'` (real aggregate) may render different banner combinations / persona-aware messaging that the baseline mock never exercises. Bug in adapter wiring would not surface.
**Fix log:** Add `Antrenor.integration.test.tsx` separate file: mock IndexedDB w/ fake-indexeddb, seed CDL events, run real `getCoachToday`, assert UI reflects real engine output. Keep current Antrenor.test.tsx as "shell + interaction smoke."

### §2-H5 — Stryker mutation testing scripts exist but no CI integration
**Severity:** HIGH (§2.10)
**Evidence:** `package.json` scripts include `"mutation": "npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js"` + Stryker deps installed. NOT invoked by CI workflows. NOT part of pre-commit. Mutation score = current unknown.
**Karpathy:** Goal-Driven — mutation testing answers "is my test suite catching real bugs or just exercising lines?"
**Reasoning:** Coverage % is necessary but insufficient; mutation testing reveals tests that pass without actually validating. For engine math correctness (§38) mutation testing is the gold standard.
**Fix log:** Add manual `npm run mutation` to nightly cron (or weekly) GitHub Action; persist Stryker report as artifact; alert if mutation score drops below threshold.

---

## MED findings

### §2-M1 — Limited time-mock coverage (only 11 files use `vi.setSystemTime` / `vi.useFakeTimers`)
**Severity:** MED (§2.13)
**Evidence:** Grep `vi\.setSystemTime\|vi\.useFakeTimers` in `src/**/*.test.*` = 11 hits. Streak counter (§38.18 DST timezone-aware), Calendar V1 (§40), Tier transitions (§35.4 Tier 0 24h promote) — all time-dependent. Need full inventory of which time-sensitive engines have time-mocks.
**Fix log:** Audit engines with time-dependent invariants; ensure each has at least one DST transition test + leap-year test + midnight boundary test.

### §2-M2 — Test naming convention inconsistency (describe block styles vary)
**Severity:** MED (§2.16)
**Evidence:** Sample Antrenor.test.tsx uses ASCII art header `══ ANTRENOR HOME TESTS ══` + describe nested. Other tests likely vary. Inconsistent → grep-fu cost when searching.
**Resolution:** Style. Wire ESLint plugin-vitest or jest naming convention rule (depends §1-C4 fix).

### §2-M3 — Coverage report excludes `src/__tests__/**` (golden master fixtures) but includes other __tests__ → asymmetry
**Severity:** MED
**Evidence:** `vitest.config.js:23-34` excludes:
- `src/__tests__/**` (golden master root location ✓)
- `src/**/*.test.js` ✓
- `src/**/*.spec.js` ✓
- `src/**/__tests__/**` ✓ — this excludes ALL __tests__ in subfolders too, including `src/engine/__tests__/`, `src/react/__tests__/`. So tests for engines won't count toward coverage of `src/engine/*.js`. Wait: exclude means "don't report COVERAGE of these files" — i.e., don't show test files in coverage report (correct intent). But the wording is slightly ambiguous — verify whether tests still RUN.
**Reasoning:** Looking at `include: ['src/**/*.test.{js,ts,tsx}']` — yes tests run (include glob). Exclude is for coverage-attribution. OK config.
**Resolution:** Confirmed acceptable; CLARIFY-COMMENT inline why.

### §2-M4 — Playwright `tests/` flat top-level mixes spec types (smoke + integration + regression + visual + simulation)
**Severity:** MED (§2.17 + §2.18 pyramid balance)
**Evidence:** `tests/` has `smoke.spec.js`, `integration.spec.js`, `regression.spec.js`, `visual.spec.js` (top-level) + `tests/e2e/smoke/critical-paths.spec.js` (nested newer organization). Mixed paradigm → which runs when?
- `package.json` `test:e2e: playwright test tests/e2e` runs ONLY tests/e2e subfolder (excludes flat-level smoke.spec.js, integration.spec.js, regression.spec.js, visual.spec.js).
- `test:e2e:smoke: playwright test tests/e2e/smoke`.
- Bare `npm test` runs ALL `tests/` per playwright.config.js `testDir: './tests'`.
**Reasoning:** Confusing structure → developer may not know which subset CI runs. Top-level legacy specs may be stale.
**Fix log:** Either consolidate: move legacy `tests/*.spec.js` to `tests/legacy/` OR `tests/e2e/<category>/` and update `package.json` scripts + playwright.config.js to single `testDir`.

### §2-M5 — Test pyramid skew analysis missing — possible E2E-heavy
**Severity:** MED (§2.18)
**Evidence:** Counts unverified manually:
- 253 .test.* (unit + integration vitest jsdom)
- 17 .spec.* (Playwright E2E)
- Ratio 253:17 ≈ 15:1 → very unit-heavy. Pyramid OK from this view BUT need to filter integration (jsdom-with-Dexie) vs pure unit.
**Resolution:** Acceptable ratio. SAMPLE-COMMENT only — verify in secondary pass via folder split count.

### §2-M6 — D019 E2E disclaimer dismiss 23-fail backlog NOT addressed in primary deploy gate
**Severity:** MED (§2.6 + §10.7 LOCK 4)
**Evidence:** Per D019 + DECISIONS.md, 23 E2E fails caused by LOCK 4 Medical Disclaimer pre-test require disclaimer-dismiss helper. Backlog flagged but unresolved. Currently CI e2e-smoke runs only `tests/e2e/smoke` subset → 23 fails may be in `tests/e2e/scenarios` not in CI hot path.
**Fix log:** Implement disclaimer-dismiss page fixture (Playwright `test.beforeEach`) in helper module under `tests/e2e/helpers/` (folder already exists). Resolve 23-fail backlog OR scope to known-broken project markers `test.fixme` so failure mode is explicit.

---

## LOW findings

### §2-L1 — Bare `tests/fixtures/` + `tests/e2e/fixtures/` duplication potential
**Severity:** LOW
**Evidence:** Two fixtures dirs. Need investigate content overlap.
**Resolution:** Defer secondary pass.

### §2-L2 — Test setup imports `@testing-library/jest-dom/vitest` (not /jest) — correct path for vitest
**Severity:** LOW (sanity confirm)
**Resolution:** OK.

### §2-L3 — `silent: 'passed-only'` masks PASS test output (intentional for clean CI)
**Severity:** LOW
**Resolution:** OK.

---

## NIT findings

### §2-N1 — Test files use BDD-style describe/it consistently
**Resolution:** OK.

### §2-N2 — Mock function names use camelCase consistent
**Resolution:** OK.

---

## Coverage map §2.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 2.1 | Coverage gap detection | Coverage % UNVERIFIED (no thresholds + report not in CI) | CRITICAL §2-C2 |
| 2.2 | Assert quality real invariant | §2-H4 — mocks short-circuit real path | HIGH |
| 2.3 | Mock fidelity | §2-H4 — Antrenor.test mock returns baseline only | HIGH |
| 2.4 | Flake risk Date.now/Math.random | engine purity COMMENTS-only (no violations sampled); Playwright timing 5s threshold flaky vs live (§2-C1) | MED |
| 2.5 | Test data fixtures realistic | partially via mocks; secondary pass | MED |
| 2.6 | E2E disclaimer dismiss backlog | §2-M6 — D019 unresolved | MED |
| 2.7 | Vitest vs Playwright split | §2-M4 — confusing structure | MED |
| 2.8 | testTimeout/hookTimeout | §2-C2 — absent | CRITICAL |
| 2.9 | Coverage % per module | §2-C2 — no thresholds enforced | CRITICAL |
| 2.10 | Mutation testing | §2-H5 — Stryker installed, NOT integrated | HIGH |
| 2.11 | Cyclomatic complexity hunt | NOT AUDITED (deferred — needs eslint-plugin-complexity per §1-C4) | — |
| 2.12 | Determinism/reproducibility engine | Engine COMMENTS assert deterministic; verify §8 | covered §8 |
| 2.13 | Time-mock comprehensive | §2-M1 — only 11 files; verify per-engine DST/leap | MED |
| 2.14 | Snapshot integrity | golden-master/__snapshots__ exists; verify content size + intent §22 secondary | — |
| 2.15 | Test isolation | §2-H3 — no global cleanup + fake-indexeddb not in setup | HIGH |
| 2.16 | Naming convention BDD | OK | NIT |
| 2.17 | E2E live smoke 5/5 | §2-C1 — depends on live prod; carry-forward Phase 7 manual | CRITICAL |
| 2.18 | Pyramid balance | §2-M5 — unit-heavy OK; integration count needs split | MED |
| 2.19 | 50-profile × 90-day synthetic | golden-master/ exists w/ profiles + runner; verify production infra §38 | covered §38 |

## Karpathy 4 principii distribution §2

- Think Before Coding: 3 (C1, H2, H5)
- Simplicity First: 2 (H3, M4)
- Surgical Changes: 4 (H1, H4, M2, M6)
- Goal-Driven Execution: 3 (C2, H4, H5)
