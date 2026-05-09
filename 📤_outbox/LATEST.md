# LATEST — GitHub Actions Cost Optimization 5 Fixes (ci.yml + deploy.yml)

**Task:** GitHub Actions cost optimization post 3000/3000 monthly cap hit + $10 extra budget — paths-ignore vault/mockups + concurrency cancel-in-progress + combine validate job + e2e-smoke manual+cron + deploy paths-ignore
**Model:** Opus 4.7
**Status:** ✅ LANDED (2 workflow YAML edits + YAML syntactic valid + paths-ignore consistency verified + 2731 tests preserved)
**Date:** 2026-05-10 0153
**Backup tag:** `pre-actions-cost-optimization-2026-05-10-0153` (pushed origin)
**Authority:** Daniel directive — root cause 3 workflows on push main (~10-15 min Playwright × frequent vault doc pushes burning budget); pre-Beta zero users live so e2e on every push not critical (Daniel local Playwright headed + qa-report post-deploy + cron weekly safety net triple mitigation)

---

## PHASE 1 — Pre-flight grep (anti-hallucination)

### File structures verified pre-edit

| File | LOC pre | Jobs | Triggers | Existing concurrency | Existing paths-ignore |
|------|---------|------|----------|---------------------|----------------------|
| `.github/workflows/ci.yml` | 88 | 4 (typecheck + unit-tests + build + e2e-smoke) | push + pull_request | NONE | NONE |
| `.github/workflows/deploy.yml` | 28 | 1 (deploy via peaceiris/actions-gh-pages@v3) | push main | NONE | NONE |
| `.github/workflows/qa-report.yml` | 142 | 1 (qa workflow_run on Deploy completed) | workflow_run | N/A | N/A |

✅ Match expected structure exactly. NO file drift detected. NU touched qa-report.yml per spec (cascading savings automatic via deploy.yml path filter).

---

## PHASE 2 — LAND ci.yml (4 fixes 1+2+3+4)

### Fix #1 paths-ignore — skip CI on vault docs/mockups commits

```yaml
on:
  push:
    branches: [main, dev]
    paths-ignore:
      - '04-architecture/mockups/**'
      - '00-index/**'
      - '01-vision/**'
      - '02-audit/**'
      - '03-decisions/**'
      - '05-findings-tracker/**'
      - '06-sessions-log/**'
      - '07-meta/**'
      - '08-workflows/**'
      - '📥_inbox/**'
      - '📤_outbox/**'
      - '**.md'
  pull_request:
    branches: [main]
    paths-ignore: [identic 12 entries]
```

**Rationale:** 11 vault paths + `**.md` catch-all. Daniel push pattern pre-Beta = vault docs (CURRENT_STATE updates fast handover, ADR, DECISION_LOG, outbox archive) + mockups (themes batches WCAG, polish iterații). Estimated 60-80% pre-Beta commits skip CI = major savings.

### Fix #2 concurrency cancel-in-progress

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

**Rationale:** Push back-to-back pattern Daniel themes batches → vechi runs cancel auto, doar latest rulează. Free savings on rapid commit sequences.

### Fix #3 combine validate job (sequential typecheck + unit + build, 1 npm ci)

```yaml
jobs:
  validate:
    name: Validate (typecheck + unit + build)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 (node 22 + cache npm)
      - run: npm ci
      - name: TypeScript Type Check
        run: npm run typecheck
      - name: Unit Tests (vitest)
        run: npm run test:run
      - name: Build
        run: npm run build
      - uses: actions/upload-artifact@v4 (dist/ retention 3 days)
```

**Rationale:** Pre-edit 3 paralel jobs each `npm ci` × `setup-node cache` = scumpe duplicate. 1 sequential job = 1 npm ci. ~50% reducere pe CI runs care chiar trebuie să ruleze (post path filter).

### Fix #4 e2e-smoke if condition + workflow_dispatch + schedule cron

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 06:00 UTC

jobs:
  e2e-smoke:
    needs: validate
    if: ${{ github.event_name == 'workflow_dispatch' || github.event_name == 'schedule' }}
    steps:
      - ... + Cache Playwright browsers (NEW actions/cache@v4 step, key playwright-chromium-${{runner.os}}-${{hashFiles('package-lock.json')}})
      - npx playwright install chromium --with-deps
      - npx playwright test tests/e2e/smoke --reporter=line (timeout 10min)
```

**Rationale:** Pe push/PR e2e-smoke SKIP automat (if condition fails). Manual trigger via GitHub UI Actions tab "Run workflow" pe ci.yml când Daniel vrea verify. Cron Monday 06:00 UTC safety net weekly. Triple mitigation: qa-report.yml rămâne post-deploy intact (qa-report doesn't use --with-deps, only chromium) + Daniel local Playwright headed acasă + cron weekly. Plus NEW Playwright browsers cache step = saves ~3-5 min per e2e run when cache hit.

---

## PHASE 3 — LAND deploy.yml (fix 5)

```yaml
on:
  push:
    branches: [main]
    paths-ignore: [identic 12 entries cu ci.yml]
  workflow_dispatch:  # NEW manual escape hatch
```

**Rationale:** vault docs/mockups commits NU schimbă app production. Path filter identic ci.yml = consistent skip pattern. Adăugat workflow_dispatch pentru manual trigger Daniel când vrea force redeploy (safety escape hatch).

**Cascading savings:** qa-report.yml has `workflow_run on Deploy completed` trigger. With deploy.yml path filter, qa-report rulează doar când Deploy real run-uit (i.e., real src changes), NU pe vault commits. Automatic savings without touching qa-report.yml.

---

## Modifications

| File | LOC pre | LOC post | Delta |
|------|---------|----------|-------|
| `.github/workflows/ci.yml` | 88 | 106 | +18 (paths-ignore 24 lines + concurrency 3 + workflow_dispatch + schedule + cache step − 4 jobs collapsed to 2) |
| `.github/workflows/deploy.yml` | 28 | 41 | +13 (paths-ignore 13 lines + workflow_dispatch 1) |
| `.github/workflows/qa-report.yml` | 142 | 142 | 0 (NU touched per spec) |

---

## Build + Tests

```
$ npm run test:run
Test Files  148 passed (148)
     Tests  2731 passed (2731)
  Duration  30.30s
```

✅ 2731 PASS preserved EXACT (gate verde — Vitest baseline matched, ZERO src impact, workflow YAML only).

---

## Phase 4 Post-fix verification

### YAML syntactic validity (parsed via local `yaml` package)

```
$ node -e "yaml.parse(...)" both files
YAML valid both files
ci.yml jobs: [ 'validate', 'e2e-smoke' ]
ci.yml triggers: [ 'push', 'pull_request', 'workflow_dispatch', 'schedule' ]
ci.yml concurrency: present
ci.yml e2e if: ${{ github.event_name == 'workflow_dispatch' || github.event_name == 'schedule' }}
deploy.yml triggers: [ 'push', 'workflow_dispatch' ]
deploy.yml paths-ignore count: 12
```

### Paths-ignore consistency cross-files

```
ci.yml push paths-ignore: 12
ci.yml PR paths-ignore: 12
deploy.yml push paths-ignore: 12
Match ci.push == ci.PR: true ✅
Match ci.push == deploy.push: true ✅
```

All 3 paths-ignore lists IDENTICAL 12 entries (11 vault paths + `**.md` catch-all).

---

## Commits + push

- Backup tag: `pre-actions-cost-optimization-2026-05-10-0153` pushed origin (rollback safety).
- Commit: `chore(ci): GitHub Actions cost optimization 5 fixes — paths-ignore vault/mockups + concurrency cancel-in-progress + combine validate job + e2e-smoke manual+cron + deploy paths-ignore (~707-709 LOCKED V1 preserved)` — SHA populated post-commit.
- Pushed origin/main.

⚠ **Note:** This commit itself touches `.github/workflows/**` which IS NOT în paths-ignore list (intentional — workflow changes need CI verify). However, paths-ignore entry could be considered for `.github/workflows/**` future if ever desired (currently NOT excluded, allows CI to run on workflow changes for safety).

---

## Issues / Halt conditions

None. Phase 1 file structures matched expected exactly (4 jobs ci.yml + peaceiris gh-pages deploy.yml + workflow_run qa-report.yml). Phase 2-3 YAML edits successful (Write tool full-file replacement per spec). Phase 4 verification clean (YAML valid both files + paths-ignore consistency 3-way verified + 2731 tests preserved).

---

## Next action

**Daniel monitor GitHub Actions tab next 24-48h verify reduction:**

1. **Push pe vault doc only** (e.g., next CURRENT_STATE update) → CI run NU rulează (path filter working) ✅ verify
2. **Push pe src/* file** → CI runs `validate` job combined (typecheck + unit + build sequential, ~1 npm ci) + e2e-smoke SKIP automat (if condition false on push event)
3. **Manual trigger e2e** via GitHub UI Actions tab → "Run workflow" pe ci.yml → e2e-smoke runs (testing manual escape hatch)
4. **Monitor billing dashboard 7-14 zile** reducere consumption Actions minutes vs precedent baseline (target: 60-80% reduction pre-Beta vault doc commits)

**Cascading savings auto:** qa-report.yml rulează doar când Deploy real run-uit (vault commits skip Deploy → skip qa-report).

---

## Cumulative state

- **LOCKED V1 ~707-709 PRESERVED** unchanged (CI optimization meta-tooling NU additive product/architecture).
- **Pure CI workflow YAML edits** — ZERO src changes, ZERO mockups touch, ZERO test impact.
- **Stack precedent:** chat-current 7 WCAG batches LANDED clean (cc98b46 + b439530 + dfa3bbd + 0542640 + ddc3396 + f30507d + 3cdfed7 + 18be826 LATEST_CONSOLIDATED) — this commit = post-pipeline orthogonal optimization.
- **Archive precedent LATEST (Task 5 LB :root lift)** → `📤_outbox/_archive/2026-05/280_THEMES_BATCH_WCAG_LB_ROOT_LIFT_TASK5.md`.
- **3 mitigations preserved** for skipped e2e-on-push: (1) qa-report.yml post-deploy automated remains intact + (2) Daniel local Playwright headed acasă + (3) weekly cron Monday 06:00 UTC safety net.
- **Manual escape hatches:** workflow_dispatch on both ci.yml (force CI + e2e) + deploy.yml (force redeploy) — Daniel can override path filters when needed via Actions tab UI.
