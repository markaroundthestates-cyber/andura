# TASK 3 — Stryker Baseline Mutation Testing Audit

═══════════════════════════════════════════════════════════════════
**Source-of-truth:**
- Daniel directive 2026-05-05 evening late: full scope `src/**/*.js` Bugatti audit baseline (NU cherry-pick "critical only")
- Existing config: `tests/golden-master/mutation/stryker.conf.js` (currently LIMITED scope ARBITRATOR + voices + dimensions doar — REQUIRES EXTEND)
- Hardware target: i7-8700K 6c/12t @ 3.70GHz + 64 GB RAM @ 3600 MHz (Windows 10 Pro)

**Run mode:** ALWAYS (independent de TASK 1/2 status — captures actual codebase state, baseline legit indif). CPU-bound long ~6-12h real.
═══════════════════════════════════════════════════════════════════

## Step 1 — Install Stryker deps

```powershell
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

Verify install: `npx stryker --version` returns valid version.

═══════════════════════════════════════════════════════════════════

## Step 2 — Update `tests/golden-master/mutation/stryker.conf.js`

**REPLACE** entire file content cu config Bugatti baseline:

```javascript
// Stryker mutation testing config — Bugatti baseline audit
// Per Daniel directive 2026-05-05 evening late: full src/**/*.js scope.
// Hardware: i7-8700K 6c/12t @ 3.70GHz + 64 GB RAM @ 3600 MHz.
//
// Run:
//   npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js
//
// Expected runtime: ~6-12h CPU-bound (mutants × full test suite re-run pe 19K LOC src/).

export default {
  packageManager: 'npm',
  reporters: ['progress', 'clear-text', 'html', 'json'],
  testRunner: 'vitest',

  // Bugatti baseline — FULL src/**/*.js scope per Daniel directive
  mutate: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
  ],

  // Thresholds first-run baseline = NO break (capture state, NU CI fail)
  thresholds: {
    high: 80,
    low: 60,
    break: 0,  // first-run baseline — NU break, audit only
  },

  vitest: {
    configFile: 'vitest.config.js',
  },

  // Concurrency calibrat pentru i7-8700K 6c/12t
  // Reserve 2 logical cores pentru OS + Daniel ne-blocked concurrent work
  concurrency: 6,
  timeoutMS: 10000,
  maxConcurrentTestRunners: 6,

  disableTypeChecks: false,

  mutator: {
    excludedMutations: [
      'StringLiteral',  // avoid trivial wording mutations noise
    ],
  },

  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'tests/**',
    'cc-reports/**',
    '📤_outbox/**',
    '📥_inbox/**',
    'scripts/**',
    'simulations/**',
    'reports/**',
  ],
};
```

═══════════════════════════════════════════════════════════════════

## Step 3 — Run Stryker baseline

```powershell
npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js
```

CPU-bound long ~6-12h pe i7-8700K cu ~19K LOC src/. Background process — orchestrator can wait via blocking spawn sau detach și poll exit code.

**Expected output paths (Stryker default):**
- HTML: `reports/mutation/mutation.html` — interactive viewer
- JSON: `reports/mutation/mutation.json` — machine-readable

═══════════════════════════════════════════════════════════════════

## Step 4 — Generate audit raport `tests/golden-master/mutation/baseline_<timestamp>.md`

**Post-run aggregate manual:** read `reports/mutation/mutation.json` și sintetizează raport markdown.

**Format raport:**

```markdown
# Stryker Baseline Mutation Testing Audit — <timestamp>

**Run config:** `tests/golden-master/mutation/stryker.conf.js`
**Scope:** `src/**/*.js` (excluding tests + __tests__)
**Total mutants generated:** N
**Total tests run:** M
**Run duration:** Hh Mm
**Hardware:** i7-8700K 6c/12t + 64 GB RAM

## Overall Mutation Score

- **Killed:** N (X.X%)
- **Survived:** N (X.X%)
- **No coverage:** N (X.X%)
- **Timeout:** N (X.X%)
- **Errors:** N (X.X%)

**Overall mutation score:** X.X%

## Per-cluster breakdown

| Cluster | LOC | Mutants | Killed | Survived | Score % | Status |
|---------|-----|---------|--------|----------|---------|--------|
| `src/engine/**` (35 engines) | ... | ... | ... | ... | ... | ✅ ≥80 / 🟡 60-79 / 🔴 <60 |
| `src/validation/**` | ... | ... | ... | ... | ... | ... |
| `src/simulator/**` | ... | ... | ... | ... | ... | ... |
| `src/storage/**` (db.js + Dexie) | ... | ... | ... | ... | ... | ... |
| `src/util/**` | ... | ... | ... | ... | ... | ... |
| `src/auth.js` + `src/firebase.js` | ... | ... | ... | ... | ... | ... |
| `src/pages/**` | ... | ... | ... | ... | ... | ... |
| `src/components/**` | ... | ... | ... | ... | ... | ... |
| `src/main.js` + entry points | ... | ... | ... | ... | ... | ... |

## Bugatti benchmark vs actual

- **Safety paths target:** ≥80% (4-Invariant Safety Stack §42.9 + 5th Medical Safety §50.3.10)
  - Actual: X.X% — ✅/🟡/🔴
- **Non-safety target:** ≥70%
  - Actual: X.X% — ✅/🟡/🔴

## Top 20 Survived Mutants Prioritized

### Priority 1 — CRITICAL Safety Paths (orice survived = bug silent waiting în production)

| # | File | Line | Mutator | Original | Mutated | Test gap |
|---|------|------|---------|----------|---------|----------|
| 1 | src/simulator/invariants.js | LXX | ConditionalExpression | `... < MRV` | `... <= MRV` | I1 boundary not tested |
| ... | ... | ... | ... | ... | ... | ... |

### Priority 2 — Engine logic (`src/engine/**/*.js`)

[Top survived mutants per engine ordered by impact]

### Priority 3 — Auth + Firebase

### Priority 4 — Validation + Simulator

### Priority 5 — Storage (db.js + Dexie)

### Priority 6 — Util

## Action items pentru Daniel review

1. **Critical safety mutants survived:** list paths + recommended test additions
2. **Clusters sub Bugatti threshold:** list + recommended priority fixes
3. **Test gaps identified:** specific patterns missing (e.g., boundary conditions, error paths, edge cases)
4. **Stryker timeouts/errors:** investigate root cause if non-trivial count

## Recommendations

- Threshold settings post-baseline: recommend `break: 75` for CI integration future once known-survived addressed
- Schedule next mutation run: post Engine #2 ADR 024 spec + adapter wiring stable
- Excluded mutations review: consider adding/removing per noise/signal ratio observed

═══════════════════════════════════════════════════════════════════
```

═══════════════════════════════════════════════════════════════════

## Step 5 — Commit raport-only

```powershell
git add tests/golden-master/mutation/stryker.conf.js
git add tests/golden-master/mutation/baseline_*.md
git add reports/mutation/    # if not gitignored, add HTML+JSON reporter outputs (decide based on size)
git commit -m "feat(mutation): Stryker baseline audit pre-Beta — full src/**/*.js scope"
git push origin main
```

**NOTE:** verify `reports/mutation/` size pre-commit. Dacă > 50 MB (HTML reporter can be big), add la `.gitignore` și commit doar JSON + markdown raport.

**ZERO modificări la `src/**`** în acest task — read-only audit. Doar config update + report files.

═══════════════════════════════════════════════════════════════════

## Edge cases handling

- **npm install Stryker fail:** abort task, append LATEST.md cu npm error log
- **Stryker run timeout/OOM:** capture partial results din `reports/mutation/`, generate raport cu warning "PARTIAL — completed N/M mutants", append LATEST.md
- **Test runner crash mid-run:** investigate vitest config compatibility cu Stryker vitest-runner (versions known compatible: stryker-mutator/core ^8 + @stryker-mutator/vitest-runner ^8)
- **HTML reporter too large for git:** gitignore + commit JSON + markdown only
- **Run completes but `mutation.json` missing/malformed:** generate raport from clear-text reporter output as fallback

═══════════════════════════════════════════════════════════════════

## Acceptance criteria

PASS:
- Stryker run complete (success exit 0 OR warnings non-fatal cu partial coverage)
- HTML + JSON reports generated în `reports/mutation/`
- Audit raport `tests/golden-master/mutation/baseline_<timestamp>.md` written + committed
- ZERO modificări la `src/**` (verify via `git diff --stat src/`)
- Push raport-only commit successful
- Mutation score per cluster captured (even if some clusters partial due timeout/error)

FAIL:
- Stryker install fail
- Stryker crash without ANY output

═══════════════════════════════════════════════════════════════════
