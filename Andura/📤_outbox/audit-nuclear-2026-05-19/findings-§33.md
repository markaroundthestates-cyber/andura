# §33 — CI/CD Pipeline GitHub Actions Deploy Workflow

**Scope:** deploy.yml definition + Build isolation + Test stage gates + Tests verde mandatory + GH Pages auto-deploy D028 + Rollback + Env promotion + Artifact storage + Secrets handling + Cache strategy + Pipeline performance + Parallel jobs + Dependency caching + Node version matrix + Pre-deploy smoke + Notification + Tag automation + Branch trigger + PR preview + Concurrency

## Severity matrix §33

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 5 |
| MED | 4 |
| LOW | 4 (positive) |
| NIT | 1 |
| **Total** | **17** |

---

## CRITICAL findings

### §33-C1 — **deploy.yml has NO TEST GATE before deploy — production deploys can ship broken code**
**Severity:** CRITICAL (§33.3 + §33.4)
**Evidence:** `.github/workflows/deploy.yml` steps:
1. `actions/checkout@v4` ✓
2. `actions/setup-node@v4` (Node 20)
3. `npm install` (not `npm ci` — non-deterministic)
4. `npm run build`
5. `peaceiris/actions-gh-pages@v3` deploy
NO typecheck step. NO test step. NO lint step. Build ≠ test pass.
- `ci.yml` HAS typecheck + tests but runs INDEPENDENTLY (separate workflow). A push to main fires BOTH workflows concurrently — deploy CAN finish before ci validates → broken code shipped.
- `qa-report.yml` runs Playwright POST-deploy → reactive, not preventive.
**Karpathy:** Goal-Driven — Beta gate "tests verde mandatory before deploy" violated.
**Fix log:** Refactor `deploy.yml`:
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node@v4 (matching ci.yml Node version)
      - npm ci
      - npm run typecheck
      - npm run lint
      - npm run test:run
      - npm run build
      - upload-artifact dist
  deploy:
    needs: validate
    steps:
      - download-artifact dist
      - peaceiris/actions-gh-pages@v3
```

### §33-C2 — Node version inconsistency CI (Node 22) vs deploy (Node 20) (§20-H1 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §20-H1.

### §33-C3 — `npm install` in deploy.yml ≠ `npm ci` — non-deterministic builds (§20-H2 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §20-H2.

---

## HIGH findings

### §33-H1 — `actions/checkout@v4` and `peaceiris/actions-gh-pages@v3` not SHA-pinned (§33.13 + supply chain)
**Severity:** HIGH
**Evidence:** Workflow uses tags (`@v4`, `@v3`) not SHA. Tag re-targeting = supply chain risk. peaceiris/actions-gh-pages@v3 is older than current v4.
**Fix log:** SHA-pin each action via `@<full-sha-hash>` or upgrade to `@v4` for actions-gh-pages.

### §33-H2 — Rollback capability tested via tag-revert procedure NOT DOCUMENTED workflow_dispatch path (§33.6)
**Severity:** HIGH
**Evidence:** D028 PROC LOCKED V1 PERMANENT — rollback via vanilla index-vanilla-legacy.html swap manual. NOT automated workflow_dispatch.
**Fix log:** Add `workflow_dispatch` rollback trigger in deploy.yml: input tag/sha → checkout + deploy.

### §33-H3 — Environment promotion strategy single env prod only (§33.7) — covered §24-H3
**Severity:** HIGH

### §33-H4 — Pre-deploy smoke (post-deploy curl andura.app) ABSENT (§33.15)
**Severity:** HIGH
**Evidence:** Deploy completes; no health check. qa-report.yml runs E2E post-deploy ✓ partial coverage but Playwright is heavy.
**Fix log:** Add post-deploy step `curl -fsS https://andura.app/ > /dev/null` to verify deployment reachable; fail otherwise + Slack notify.

### §33-H5 — Deploy notification absent (manual Daniel review) (§33.16)
**Severity:** HIGH
**Evidence:** No Slack/email/discord notification on successful or failed deploy. Daniel manually checks andura.app post-push.
**Fix log:** Add Slack incoming webhook OR email-on-failure step.

---

## MED findings

### §33-M1 — Pipeline cache strategy npm cache (§33.10) — partially ✓ via setup-node `cache: npm`
**Severity:** MED — POSITIVE in ci.yml (`cache: npm`) BUT deploy.yml missing cache config.

### §33-M2 — Dependency caching `actions/cache@v4` (§33.13) — playwright browsers cached in ci.yml ✓
**Severity:** MED — POSITIVE
**Evidence:** ci.yml e2e-smoke job uses actions/cache@v4 for ~/.cache/ms-playwright ✓.

### §33-M3 — Workflow concurrency limits ✓ in ci.yml `concurrency: cancel-in-progress: true` (§33.20)
**Severity:** MED — POSITIVE
**Resolution:** ci.yml ✓; deploy.yml missing concurrency — could race.

### §33-M4 — Pipeline performance build time tracked NOT (§33.11)
**Severity:** MED
**Fix log:** Add `time` measurement; alert on regression.

---

## LOW (POSITIVE)

### §33-L1 — Pipeline secrets via GitHub Actions secrets ✓ (§33.9)
### §33-L2 — Branch trigger correct (only main triggers deploy) ✓ (§33.18)
### §33-L3 — Tests verde MANDATORY in ci.yml validate job ✓ (but §33-C1 disconnect with deploy)
### §33-L4 — Artifact storage retention 3 days ci.yml ✓ (§33.8)

---

## NIT findings

### §33-N1 — PR preview deploys absent (§33.19) — currently NU
**Resolution:** Defer post-Beta.

## Karpathy distribution §33
- Goal-Driven: 4 (C1, C2, H1, H4)
- Surgical Changes: 3 (C3, H2, H5)
