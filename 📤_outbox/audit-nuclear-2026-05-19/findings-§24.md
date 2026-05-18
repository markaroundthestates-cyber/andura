# §24 — Configuration Management Audit

**Scope:** Vite VITE_* env + Build-time vs runtime config + Feature flags + A/B test infra + Secrets management + Config drift between envs + .env.example + Firebase project IDs per env + CI secrets via GH Actions secrets + Local dev setup docs

## Severity matrix §24

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MED | 3 |
| LOW | 2 (positive) |
| NIT | 0 |
| **Total** | **10** |

---

## CRITICAL findings

### §24-C1 — Hardcoded production keys/URLs/DSN (§4-C2 + §4-H4 + §4-H5 reaffirmed)
**Severity:** CRITICAL
**Evidence:**
- `src/auth.js:24` `FIREBASE_API_KEY = window.__FIREBASE_API_KEY || 'PLACEHOLDER_WEB_API_KEY'`
- `src/firebase.js:7` `FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb...'`
- `src/util/sentry.js:4` `SENTRY_DSN = 'https://dcbb...'`
**Resolution:** Per §4-C2/H4/H5 + §18-H3.

---

## HIGH findings

### §24-H1 — Feature flags strategy NOT DOCUMENTED (§24.3)
**Severity:** HIGH
**Evidence:** `src/util/featureFlags.js` exists (per ls). Implementation NOT inspected. No documented decision: gradual rollout? user-segmented? env-based?
**Fix log:** Sample audit featureFlags.js + document in `08-workflows/feature-flags.md`.

### §24-H2 — A/B test infrastructure NOT DOCUMENTED (§24.4)
**Severity:** HIGH
**Evidence:** No A/B test framework wired. Solo Daniel pre-Beta — N/A. Post-Beta with 50 testers + future scale → may need split. Document decision.

### §24-H3 — Single Firebase project (no dev/staging/prod separation) (§24.6 + §24.8)
**Severity:** HIGH
**Evidence:** firebase.js uses single `fittracker-c34e8-default-rtdb` project. NO `firebase-dev` / `firebase-staging` separate projects.
**Reasoning:** Solo dev: dev + prod against same Firebase = data pollution risk (Daniel local testing writes to prod RTDB). Per `LEGACY_USER_PATH = 'users/daniel'` reserved literal path → partial isolation, but new tester data mixes.
**Fix log:** Pre-Beta: keep single project (cost). Document trust model: Daniel discipline = dev account isolated. Post-Beta: separate projects.

### §24-H4 — Local development setup documentation absent (§24.10)
**Severity:** HIGH (§18-H3 + §18-H4 partial cover)
**Evidence:** README.md status unknown (§18-C1). New contributor onboarding requires: install Node 22, `npm ci`, set VITE_* env, `npm run dev`. Not documented.
**Fix log:** Add to README "Local Development Setup" section.

---

## MED findings

### §24-M1 — Build-time vs runtime config decision (§24.2)
**Severity:** MED
**Evidence:** Vite VITE_* env vars baked at build time. Runtime config via `window.__FIREBASE_API_KEY` injection pattern attempted but inactive. Mixed approach.
**Fix log:** Document: build-time for non-secret-rotation values; runtime injection N/A pre-Beta.

### §24-M2 — Secrets management `.env.local` ignored ✓ (§24.5)
**Severity:** MED — POSITIVE
**Resolution:** `.gitignore` excludes `*.local`.

### §24-M3 — CI secrets via GH Actions secrets store (§24.9)
**Severity:** MED
**Evidence:** deploy.yml uses `${{ secrets.GITHUB_TOKEN }}` ✓. No VITE_* secrets wired in CI yet (because hardcoded in source §24-C1).

---

## LOW (POSITIVE)

### §24-L1 — Vite VITE_* prefix conventions respected ✓ (§24.1)
**Severity:** LOW positive
**Evidence:** `import.meta.env.VITE_APP_VERSION` sample. Vite enforces VITE_* exposed-to-client convention.

### §24-L2 — Feature flag scaffold present ✓
**Severity:** LOW positive
**Evidence:** `src/util/featureFlags.js`.

## Karpathy distribution §24
- Surgical Changes: 3 (H1, H2, H4)
- Goal-Driven: 1 (C1)
