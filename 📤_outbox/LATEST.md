# Track 7 Automated Testing Implementation — Running Checkpoint Log

**Status:** IN PROGRESS § 9 / 10 LANDED — 90% (§7.10 final smoke gated on Daniel manual setup per `📥_inbox/SETUP_DANIEL_TRACK_7.md`)
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

## §7.5 LANDED (2026-05-19 20:15) — Coach voice persona scenarios SKELETON (@langwatch/scenario DEFERRED rationale)

- **Commit (local):** `ecf320a` `feat(track-7-§7.5): coach voice persona scenarios skeleton — @langwatch/scenario DEFERRED rationale`
- **CRITICAL DEFERRAL:** Master spec §1.6 prescribed @langwatch/scenario LLM-agent framework. Andura coach is RULE-BASED engine orchestration (`src/coach/orchestrator/index.js runPipeline(ctx, adapters)`), NU LLM chat completion. Confirmed via grep src/: ZERO production LLM imports (openai/anthropic/@google/genai/@ai-sdk all absent).
- **New skeleton file (98 lines):**
  - `tests/engine/coach-scenarios/coach-voice.scenarios.test.ts` — 8 tests (1 sanity persona fixture import + 7 `it.todo()` scenarios cataloged):
    - Scenario 1: Gigel skipped 3 workouts → anti-paternalism (LOCK F2)
    - Scenario 2: Marius T2 PR break attempt → HARD_CAP_INTENSITY_PCT_1RM 0.90
    - Scenario 3: Maria 65 joint pain → pain-button + LOCK 4 Medical Disclaimer
    - Scenario 4: bulk→cut Day 15 → BN Cluster A5 phase reset
    - Scenario 5: Post-injury recovery → tier downgrade + LOCK 9 suppress
    - Scenario 6: Deload week → deload engine recommendation
    - Scenario 7: Per-set RIR 0 → AaFriction LOCK 9 PerSetSafetyModal
  - Each `it.todo()` has inline activation criteria comments with expected engine signal/wording assertions for future implementation.
- **Activation criteria for full §7.5 implementation:**
  1. Build `src/coach/llm-coach.js` with `callAnduraCoach(input)` chat interface wrapping runPipeline outputs
  2. Provision `LANGWATCH_API_KEY` în GitHub Secrets
  3. `npm i -D @langwatch/scenario`
  4. Convert each `it.todo()` → `scenario.run({ agent: callAnduraCoach, ... })`
- **Interim coverage:** §7.1 golden master snapshots cover engine deterministic outputs for 3 personas + edge cases. Coverage gap: coach text generation wording (deferred until orchestrator wording surface stabilizes).
- **Karpathy dominant:** Goal-Driven (don't install framework that can't run pe current state) + Simplicity First (skeleton with clear activation criteria beats ambitious-but-broken install)
- **Deviations from spec:** @langwatch/scenario install DEFERRED — saves ~10MB until LLM coach wrapper exists.
- **Next:** §7.6 → §7.10 remaining phases require Daniel inputs OR heavy CI surgery — chat session checkpoint here at 50% milestone

---

## Cumulative status (refresh per phase)

- **§ LANDED:** 9 / 10 (90%) — Daniel re-engaged 2026-05-19 evening: §7.9 cleanup + §7.4 audit fix + §7.6 CI augment + §7.7 Checkly + §7.8 Stagehand + §7.10 prep ALL LANDED ca skeleton ready-to-activate
- **Total commits local since baseline `17b0bba`:** ~22 commits (5 §9 First Actions + 14 phase commits §7.1-§7.10-prep + auto-commits + LATEST checkpoints + SETUP)
- **Commits pushed origin:** 5 §9 First Actions only — §7.1-§7.10-prep local only (preserve D030 anti-recurrence, manual push at Daniel trigger sau §7.10 final smoke PASS)
- **Cumulative Vitest tests:** 4519 → 4547 (+28 = 27 §7.1 + 1 §7.5 sanity) baseline preserved
- **Cumulative Vitest test files:** 251 → 255 (+4: §7.1 fixtures + invariants + golden master + §7.5 coach scenarios)
- **Cumulative Playwright tests:** 103 → ~17 (massive React-focused reduction post §7.9 cleanup)
- **Cumulative Playwright test files:** 19 → ~7 (auth.setup + magic-link + smoke-react + visual-regression + v2-4-taburi survivor + __checks__/critical-paths Checkly + tests/coach-scenarios coach-voice)
- **Production readiness % estimate:** ~75% (Track 7 90% LANDED ca skeleton ready-to-activate; Daniel manual setup unlocks remaining 10% pentru §7.10 final smoke PASS)
- **Remaining ETA:** Daniel-blocked (~3-4 ore manual setup pe SETUP_DANIEL_TRACK_7.md A+B+C → CI green → Daniel mobile smoke ~30-45 min → §7.10 LANDED)

---

## §7.6-§7.9 LANDED (2026-05-19 evening Daniel re-engage)

### §7.9 LANDED — vanilla legacy E2E cleanup
- **Commit:** `b4d1950` `feat(track-7-§7.9): vanilla legacy E2E cleanup — delete 20 obsolete files`
- **DELETED 20 files (~1800 lines):**
  - 10 tests/e2e/scenarios/*.spec.js (admin-prefill, bf-live-update, calibration-ui, coach-screen, cut-rep-display, data-integrity, readiness, rest-timer, session-logs-persist, week2-ui)
  - 1 tests/e2e/smoke/critical-paths.spec.js (legacy GitHub Pages vanilla)
  - 2 tests/e2e/fixtures/ (sessions.js + users.js — consumed only by deleted specs)
  - 3 tests/e2e/helpers/ (assertions.js + setup.js + storage.js)
  - 4 root specs (integration + regression + smoke + visual — all vanilla `.nb` selectors)
- **KEEPS:** tests/e2e/v2-4-taburi-smoke.spec.js (V2/V1 fallback) + all Track 7 NEW + tests/golden-master/ + tests/simulation/ (separate node-based systems)
- **Playwright tests:** 117 → ~17 (massive React-focused E2E baseline reduction)

### §7.4-fix LANDED — npm audit safe patches
- **Commit:** `d801426` `fix(track-7-§7.4-audit): npm audit fix safe patch bumps (brace-expansion + ws)`
- **Safe patches:** brace-expansion 5.0.5→5.0.6 + ws 8.20.0→8.20.1 (both transitive devDep-only)
- **Remaining:** 14 vulns (12 low + 2 moderate) require `--force` semver-major — DEFERRED to Daniel case-by-case (D.3 SETUP)

### §7.6 LANDED — deploy.yml + ci.yml + nightly workflow augment
- **Commit:** `acb05e3` `feat(track-7-§7.6): deploy.yml + ci.yml augment skeleton + nightly workflow (Stryker+Stagehand) — placeholder secret refs ready-to-activate`
- **`.github/workflows/ci.yml` augmented:**
  - validate job: +lint + size + depcheck + madge:circular + jscpd + licenses + npm audit + Snyk (all `continue-on-error: true` initially)
  - e2e-smoke job: fixed broken `tests/e2e/smoke/` path → now references Track 7 §7.2+§7.3 specs + v2-4-taburi survivor + auth.setup env vars
  - +Lighthouse CI step
- **`.github/workflows/deploy.yml` augmented:**
  - lighthouse-live job: post-deploy Lighthouse vs live andura.app
  - checkly-deploy job: gated on CHECKLY_API_KEY secret
- **NEW `.github/workflows/track-7-nightly.yml`:**
  - Daily 03:00 UTC cron (06:00 EEST Romania morning)
  - stryker-mutation-engine job: full mutation report upload (30-day retention)
  - stagehand-exploration job: gated on BROWSERBASE_API_KEY + ANTHROPIC_API_KEY
- **`package.json` scripts:** test:smoke / test:e2e / test:e2e:smoke updated post-§7.9; +test:engine + mutation:engine + exploration

### §7.7 LANDED — Checkly synthetic prod skeleton
- **Commit:** `10d43ca` `feat(track-7-§7.7): Checkly synthetic prod config + critical paths skeleton — ready-to-activate`
- **NEW checkly.config.ts:** defineConfig projectName 'Andura PWA' + frequency 5min EU CDN (2 locations) + Romania CDN proximity + cost note: 5min × 2 locations = ~8,640/lună exceeds Free Hobby 1,500 — recommend 30min OR upgrade $40/mo
- **NEW __checks__/critical-paths.spec.ts (4 active + 3 future tests):**
  - Active (no auth): homepage 4 taburi / Magic Link UI / Antrenor tab nav / PWA SW + manifest
  - Future (auth-gated): AaFriction LOCK 9 / LockExercises LOCK 4 / Engine API Firestore latency
- **Slack alert routing:** Daniel configures în Checkly UI (NU în code — sensitive webhook)

### §7.8 LANDED — Stagehand persona exploration template
- **Commit:** `a1491a7` `feat(track-7-§7.8): Stagehand persona exploration nightly template — ready-to-activate`
- **NEW scripts/nightly-exploration.mjs (186 lines):**
  - ESM .mjs Node 22+ native (no transpile)
  - Activation guard: silent exit when env absent
  - Dynamic imports @browserbasehq/stagehand + zod (lazy install)
  - 3 personas mirror §7.1: Gigel T0 / Marius T2 / Maria 65 T3
  - Anomaly schema zod: 10 types × 4 severity levels P0-P3
  - GitHub Issues queue auto-create cu labels exploration-anomaly + severity-* + nightly-stagehand
  - Stagehand actions stagehand.act() persona + stagehand.extract() schema-constrained
  - Romanian persona prompting + Magic Link login fallback

### §7.10 prep LANDED — final smoke checklist + tag finalize script
- **Commit:** `103d50e` `chore(track-7-§7.10-prep): final smoke checklist + tag finalize script`
- **NEW 📤_outbox/TRACK_7_FINAL_SMOKE_CHECKLIST.md (174 lines):**
  - §0 Pre-conditions verify (13 CC autonomous checks)
  - §1 Tier 1 CI status (7 GitHub Actions jobs GREEN)
  - §2 Tier 2 Checkly 24h synthetic baseline
  - §3 Tier 3 Stagehand overnight queue
  - §4 Daniel mobile manual smoke (7 sections × ~50 checkboxes pe 4 taburi cap-coadă)
  - §5 Final sign-off CEO directive verbal confirmation
  - §6 Final commit + tag + push pipeline (ready-to-run bash)
  - §7 Post-§7.10 cleanup (consume prompts + archive LATEST + update primer)
- **NEW scripts/track-7-finalize.sh (79 lines):**
  - Pre-checks: baseline tag exists + WT clean + tag uniqueness
  - Stats summary diff since baseline
  - Annotated tag `track-7-automated-testing-landed-YYYY-MM-DD`
  - Output Daniel next-steps push instructions

### SETUP_DANIEL_TRACK_7.md LANDED — comprehensive manual setup checklist
- **Commit:** `d88bb00` `docs(setup): SETUP_DANIEL_TRACK_7.md — comprehensive manual setup checklist`
- **NEW 📥_inbox/SETUP_DANIEL_TRACK_7.md (269 lines):**
  - Dependency graph A→C→CI / B→live auth / D parallel
  - Section A: 5 accounts (~60-90 min)
  - Section B: Firebase Console manual (~30-45 min)
  - Section C: GitHub Repo Settings (~30 min) — branch protection + 11 secrets + 6 labels + permissions
  - Section D: 5 CEO decisions pending (F5/LOCK 9 / Firebase API / npm audit / Checkly cost / visual baselines)
  - Section E: 7-step activation test sequence
  - Section F: Status tracker table

---

## §7.10 BLOCKED on Daniel manual setup (per `📥_inbox/SETUP_DANIEL_TRACK_7.md`)

### §7.6 deploy.yml CI augment requires:
- Firebase Admin SA JSON → `FIREBASE_SERVICE_ACCOUNT` GitHub Secret
- Test account UID provisioned în Firebase Auth → `PLAYWRIGHT_AUTH_TEST_UID` GitHub Secret
- `SNYK_TOKEN` GitHub Secret pentru vulnerability scan action
- Approval pentru major deploy.yml surgery (existing CI workflow likely has business logic worth preserving) — Co-CTO autonomous decision deferral aside, this is high-impact CI change worth Daniel review before merge

### §7.7 Checkly synthetic prod requires:
- Checkly account (Free Hobby tier 1500 browser checks/lună sufficient pentru solo dev — paid upgrade $40/mo when scaling)
- `CHECKLY_API_KEY` + `CHECKLY_ACCOUNT_ID` GitHub Secrets
- `npm create checkly@latest` interactive setup (requires Daniel interaction)
- Slack webhook URL pentru `#andura-alerts` channel routing
- Optional: Sentry incident integration (per master spec §2 Rocky AI auto-triage)

### §7.8 Stagehand exploration nightly requires:
- Browserbase account (paid product; pricing TBD)
- `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID` GitHub Secrets
- Anthropic API key pentru Claude 4.7 model used by Stagehand (`ANTHROPIC_API_KEY`)
- GitHub issue queue label setup (`exploration-anomaly` / `nightly-stagehand` labels)

### §7.9 Vanilla legacy E2E cleanup:
- Mechanical work: enumerate + delete obsolete tests/e2e/ vanilla-port-era specs (Track 5 backlog mentions 23 fails pre-existing on `feature/v2-vanilla-port` branch). NO Daniel input needed.
- BUT requires careful diff review — some specs may have logic salvageable for React port (auth helpers, fixture setup).
- Safe to do in next chat after Daniel re-engages.

### §7.10 Production readiness Lighthouse live verify + Daniel manual smoke:
- Requires §7.6 deploy.yml LANDED + Daniel mobile manual smoke session
- Final milestone push origin: tag `track-7-automated-testing-landed-2026-05-XX` + push all commits since `17b0bba`

---

## Session summary (Daniel resume hint)

**5/10 phases LANDED în chat session 2026-05-19 evening (19:00-20:20, ~80 min CC autonomous Opus 4.7 exclusively):**

1. ✅ §9 First Actions — D032 LOCKED + ANDURA_PRIMER §5/§6 + .gitignore + push origin + backup tag
2. ✅ §7.1 — Vitest persona fixtures + fast-check invariants + golden master POC (4519→4546 tests +27)
3. ✅ §7.2 — Playwright E2E React 4-tab + auth setup + Magic Link + axe-core (Playwright 103→114 +11)
4. ✅ §7.3 — Visual regression toHaveScreenshot + Lighthouse CI 12+ (Playwright 114→117 +3)
5. ✅ §7.4 — Bundle budget + code health gates (6 configs + 6 npm scripts)
6. ✅ §7.5 — Coach voice scenarios skeleton (@langwatch/scenario DEFERRED rationale)

**Next chat resume:** Read this LATEST.md + Daniel decides on Daniel-action items list. §7.6 deploy.yml CI augment is the highest-leverage next phase (gates §7.7+§7.8). Alternative: §7.9 vanilla cleanup (mechanical, no inputs needed) as warm-up.

**Push status:** `git push origin main` shows 10 unpushed commits + 2 unpushed checkpoint tags (TBD if §7.5 needs tag). Manual push at §7.10 milestone OR Daniel explicit trigger.

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
