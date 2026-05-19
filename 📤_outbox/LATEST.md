# Track 7 Automated Testing Implementation — Running Checkpoint Log

**Status:** IN PROGRESS § 4 / 10 LANDED
**Started:** 2026-05-19 19:00 (HEAD pre `17b0bba` chore-auto; baseline tag `pre-track-7-automated-testing-2026-05-19` pushed origin @ `f1da8de`)
**Procedure:** D032 LOCKED V1 — Track 7 Automated Testing continuous neîntrerupt Opus exclusively
**Source spec:** `08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md` (cap-coadă §0-§9 read)
**Goal:** smoke Daniel manual pre-Beta ZERO surprize — audit-vs-UX gap close 75%→≥90% via 3-tier defense (Tier 1 in-repo + Tier 2 Checkly synthetic prod + Tier 3 Stagehand exploration)
**Model:** Opus 4.7 EXCLUSIVELY (anti-fallback policy NEVER downgrade)
**Stop trigger UNIC:** Daniel STOP explicit
**Push status:** §9 First Actions push origin LANDED (5 commits + backup tag). Phase commits §7.1+ local only — manual push at §7.10 milestone SAU Daniel trigger.

---

## §9 First Actions LANDED (2026-05-19 19:00-19:30)

Pre-flight cleanup + D032 vault writes + push origin + backup tag — baseline clean înainte de §7.1 loop start.

| Commit | Subject |
|--------|---------|
| `c04c4d8` | chore(vault): consume 4 inbox prompts + move Track 7 master spec to 08-workflows |
| `9fbf31f` | chore(vault): remove orphan inbox copies post-MCP-move |
| `9b27993` | chore(gitignore): exclude .obsidian UI state files |
| `f1da8de` | docs(decisions-§D032): Track 7 Automated Testing LOCKED V1 + primer §5/§6 update |

- **Push origin LANDED:** `git push origin main` (5 commits including pre-existing `17b0bba chore(auto)`)
- **Backup tag:** `pre-track-7-automated-testing-2026-05-19` @ `f1da8de` pushed origin (single conscious safety net)
- **Test baseline confirmed:** 4519 PASS vitest jsdom (via 3x pre-commit hook GREEN gate)
- **Node version:** v25.9.0 (>22.19 OK per Lighthouse 12+ requirement)
- **Working tree:** clean post §9 (only untracked = `📥_inbox/PROMPT_CC_track_7_implementation_v1.md` consumable-at-§7.10)

---

## §7.1 LANDED (2026-05-19 19:35) — Vitest persona fixtures + fast-check engine invariants + golden master POC

- **Commit (local):** `33d9aea` `feat(track-7-§7.1): Vitest persona fixtures + fast-check engine invariants + golden master POC`
- **Tests delta:** 4519 → 4546 (**+27 / -0**) full vitest jsdom 52s
- **New files (916 lines):**
  - `tests/fixtures/personas.ts` — 3 canonical personas (Gigel T0 / Marius T2 / Maria 65 T3) + Mulberry32 seeded log generator + 4 edge cases + Vitest 3.x test.extend() fixture
  - `tests/engine/invariants/kalman.test.ts` (13 tests) — fast-check property-based pe Kalman 1D + EWMA + R²Gate (ADR 018 Cluster B2)
  - `tests/engine/invariants/kcal-floor.test.ts` (9 tests) — LOCK 8 invariants on filterKcalFloorObservations
  - `tests/engine/golden-master/bayesian-nutrition.test.ts` (5 tests) — characterization snapshots 3 personas + LOCK 8 boundary + determinism
  - `tests/engine/golden-master/__snapshots__/bayesian-nutrition.test.ts.snap` — 3 golden master snapshots committed
- **Infra:**
  - `package.json`: +fast-check ^4.8.0 devDep
  - `vitest.config.js`: include +tests/engine/**/*.test.{js,ts} (Playwright .spec.* unchanged)
- **Karpathy dominant:** Goal-Driven (foundation testing-side, NU UI) + Surgical (NEW files only, ZERO existing engine code modifications) + Simplicity First (lean fixtures, no spec-assumed wrappers like brzycki1RM/runEnginePipeline that don't exist în Andura)
- **Deviations from spec:**
  - SKIPPED `brzycki1RM` invariant — function NU există în Andura engine (spec assumption incorrect)
  - SKIPPED `runEnginePipeline` wrapper — used real `evaluate(ctx)` from bayesianNutrition/index.js
  - SKIPPED 8 adapters × 3 personas exhaustive (master spec §4.2 ambitious) — POC 1 adapter (bayesianNutrition) cu 5 snapshots; expand în §7.2+ ca incremental coverage
  - `fc.float` flake în full vitest run (32-bit constraint + Math.fround boundary nondeterminism) → switched to `fc.double` + discrete evaluateR2Gate boundary tests
  - TS errors în BayesianNutritionResult JSDoc (types.js incomplete vs runtime: missing `id`+`recommendations`) → `any` cast în snapshotShape helper; snapshot is SoT for runtime shape contract
- **Next:** §7.2 starting now — Playwright E2E React 4-tab + `@nearform/playwright-firebase` auth fixture + Magic Link spec

---

## §7.2 LANDED (2026-05-19 19:50) — Playwright E2E React 4-tab + auth setup + Magic Link skeleton + axe-core a11y

- **Commit (local):** `f2d38e7` `feat(track-7-§7.2): Playwright E2E React 4-tab + auth setup + Magic Link skeleton + axe-core a11y`
- **Playwright tests delta:** 103 → 114 (**+11 / -0**) total Playwright suite
- **New files (309 lines):**
  - `tests/auth.setup.ts` — Firebase Admin SA → custom token → storageState; env-gated graceful skip when GOOGLE_APPLICATION_CREDENTIALS + PLAYWRIGHT_AUTH_TEST_UID absent (1 test in [setup] project)
  - `tests/magic-link.spec.ts` (3 tests) — Magic Link UI smoke auth-state-independent: email entry reachable / send-button network intercept / axe-core WCAG 2.1 AA zero critical+serious
  - `tests/smoke-react.spec.ts` (7 tests) — React 4-tab smoke: homepage bottom-nav presence + console errors capture / 4 tabs nav (auth-gated) / PWA offline SW cache / homepage axe-core WCAG 2.1 AA
- **Infra:**
  - `package.json`: +@axe-core/playwright ^4.11.3, +@nearform/playwright-firebase ^1.2.9 (transitive: firebase-admin)
  - `playwright.config.js`: NEW 'setup' project + 'all' dependencies ['setup'] + testIgnore tests/engine/** for Vitest/Playwright co-existence
- **Karpathy dominant:** Goal-Driven (E2E skeleton structure pentru §7.6 CI deploy.yml augment) + Surgical (additive only, existing v2-4-taburi-smoke.spec.js + scenarios/* untouched)
- **Deviations from spec:**
  - SKIPPED full Firebase Admin sign-in wiring (deferred §7.6 CI secrets pipeline — token stored localStorage as marker only)
  - SKIPPED Antrenor 14 sub-screens detail tests (skeleton 4-tab first, sub-screens iterative §7.3+ with visual regression baselines)
  - SKIPPED multi-browser config (Chromium/Firefox/WebKit/Mobile) — single Chromium default, multi-browser §7.6
  - SKIPPED Magic Link prod gate `andura.app` real — §7.7 Checkly Tier 2 synthetic prod owns this
  - eslint-disable wait-for-timeout antipattern AVOIDED — used `page.waitForRequest` deterministic
- **Anomalii:**
  - Playwright initial config conflict: testDir './tests' auto-discovered Vitest tests under tests/engine/ → Symbol redefine error (@vitest/expect vs @playwright/test). Resolution: testIgnore patterns în 'all' project.
- **Next:** §7.3 starting now — Visual regression `toHaveScreenshot()` + Lighthouse CI 12+ (axe-core a11y already integrated în §7.2)

---

## §7.3 LANDED (2026-05-19 20:00) — Visual regression toHaveScreenshot + Lighthouse CI 12+ config

- **Commit (local):** `1957b6f` `feat(track-7-§7.3): visual regression toHaveScreenshot + Lighthouse CI 12+ config`
- **New files (121 lines):**
  - `lighthouserc.js` — Lighthouse CI 12+ mobile preset + devtools throttling + 3 runs median anti-flake + 'lighthouse:no-pwa' preset thresholds (perf≥85 / a11y≥95 / best-practices≥90 / SEO≥90; FCP<1800 / LCP<2500 / CLS<0.1 / TBT<200)
  - `tests/visual-regression.spec.ts` (3 tests) — Playwright toHaveScreenshot() native: animations disabled + caret hide + maxDiffPixelRatio 0.02; iPhone 14 + iPhone SE + iPad Air viewports; dynamic content masking
- **Infra:**
  - `package.json` scripts: `lighthouse` / `lighthouse:live` / `visual:update` + @lhci/cli ^0.15.1 devDep
- **Karpathy dominant:** Goal-Driven (foundation pentru §7.6 CI deploy.yml gate) + Simplicity First (Playwright built-in toHaveScreenshot, NU plugin, ZERO config sprawl)
- **Deviations from spec:**
  - SKIPPED baseline generation pre-commit — CI Ubuntu Linux font rendering differs from local Windows, baselines must be generated în CI environment via first deploy.yml run with `--update-snapshots` artifact upload OR Daniel local CI-matched Docker
  - SKIPPED axe-core duplicate integration — already done în §7.2 magic-link + smoke-react
- **Next:** §7.4 starting now — Bundle budget size-limit + depcheck + madge + jscpd + license-checker + Snyk

---

## §7.4 LANDED (2026-05-19 20:15) — Bundle budget + code health gates (size-limit + depcheck + madge + jscpd + license-checker)

- **Commit (local):** `8f6a996` `feat(track-7-§7.4): bundle budget + code health gates (size-limit, depcheck, madge, jscpd, license-checker)`
- **New config files (42 lines):**
  - `.size-limit.json` — 3 gzip budgets: main ≤100 KB / vendor ≤150 KB / CSS ≤30 KB
  - `.jscpd.json` — duplication threshold 5% / minLines 30 / minTokens 50; ignore _legacy-vanilla + __snapshots__ + tests/golden-master + tests/simulation
- **Infra:**
  - 6 new npm scripts: `size` / `size:why` / `depcheck` / `madge:circular` / `jscpd` / `licenses`
  - +8 devDeps: size-limit ^12.1.0 + @size-limit/preset-app ^12.1.0 + depcheck ^1.4.7 + madge ^8.0.0 + jscpd ^4.2.3 + license-checker ^25.0.1 + firebase-admin ^13.6.0 (was transitive — pinned explicit recovery) + @testing-library/dom ^10.4.1 (was transitive — pinned explicit recovery)
- **Karpathy dominant:** Goal-Driven (per-PR gates config-ready pentru §7.6 CI augment) + Surgical (config-only changes, ZERO source code or test changes; existing 4546 PASS preserved)
- **Deviations from spec:**
  - Install required `--legacy-peer-deps` (madge@8 peerOptional typescript ^5.4.4 vs project typescript ^6.0.3 — madge CLI tool only, peer optional, doesn't affect runtime)
  - --legacy-peer-deps re-resolution DROPPED 2 previously-transitive deps (firebase-admin + @testing-library/dom) — recovered via explicit-install pins în same commit
  - 8 transitive vulnerabilities reported (4 low + 4 moderate) — triage assigned to §7.6 Snyk + npm audit workflow
- **Anomalii:**
  - First `npm i -D` attempt failed eresolve madge peer TS conflict → retry with `--legacy-peer-deps`
  - Initial install dropped firebase-admin + @testing-library/dom → pre-commit hook tsc check broke (Progres.test.tsx `screen`/`fireEvent` missing + auth.setup.ts firebase-admin module missing) → recovered via explicit install
- **Next:** §7.5 starting now — @langwatch/scenario coach voice persona scenarios + judge criteria anti-paternalism

---

## Cumulative status (refresh per phase)

- **§ LANDED:** 4 / 10 (40%)
- **Total commits local:** 5 §9 First Actions + 1 §7.1 + 1 §7.1-LATEST + 1 §7.2 + 1 §7.2-LATEST + 1 §7.3 + 1 §7.3-LATEST + 1 §7.4 = 12 commits since baseline `17b0bba`
- **Commits pushed origin:** 5 (§9 First Actions + chore-auto pre-existing) — §7.1+ local only
- **Cumulative Vitest tests:** 4519 → 4546 (+27) preserved
- **Cumulative Vitest test files:** 251 → 254 (+3)
- **Cumulative Playwright tests:** 103 → 117 (+14)
- **Cumulative Playwright test files:** 19 → 23 (+4)
- **Production readiness % estimate:** ~62% (Vitest invariants + Playwright skeleton + axe-core + visual regression skeleton + Lighthouse CI config + bundle/health gates config; full ratchet on first §7.6 CI run gating PRs)
- **Remaining ETA:** ~3-5 zile lucrătoare CC autonomous Opus exclusively per § atomic commit

---

## Daniel action items (gathered per phase deferrals — for §7.6+ CI augment + secrets pipeline)

- **Firebase Admin Service Account JSON** → upload to GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT` (used by §7.2 auth.setup.ts + §7.7 Checkly)
- **Playwright test UID** → GitHub Secret `PLAYWRIGHT_AUTH_TEST_UID` (test account provisioned în Firebase Auth)
- **Checkly account + token** → `CHECKLY_API_KEY` + `CHECKLY_ACCOUNT_ID` GitHub Secrets pentru §7.7 synthetic prod every-5min
- **Browserbase account + token** → `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID` GitHub Secrets pentru §7.8 Stagehand exploration nightly
- **Snyk token** → `SNYK_TOKEN` GitHub Secret pentru §7.6 vulnerability scan
- **GitHub branch protection `main`** → require Track 7 CI status checks + linear history + no force-push (per master spec §9)
- **Firebase Console manual** → Authorized domains `andura.app` + localhost + Firestore rules publish parity
- **Visual regression baselines** → first CI run pe Ubuntu Linux generates via `--update-snapshots` artifact → Daniel review + commit baselines (Windows-generated baselines won't match CI Linux fonts)
- **8 npm audit vulnerabilities triage** → 4 low + 4 moderate transitive from §7.4 install — Snyk action will surface în PR; Daniel decision npm audit fix vs manual upgrade case-by-case

---

## Blockers

(none §7.1)

---

## Anomalii encountered

- `fc.float` 32-bit constraint flake în full vitest run only (passes isolated). Resolution: switched to `fc.double` (64-bit, no 32-bit constraint). Lesson pentru §7.2+ — prefer fc.double pentru numerical generators.
- `BayesianNutritionResult` JSDoc incomplete vs runtime return shape (missing `id`+`recommendations`). Workaround: `any` cast în test helper; snapshot is contract SoT. NOT blocking, but flag pentru `gsd-extract-learnings` post-Track-7 — engine type definitions need audit.
