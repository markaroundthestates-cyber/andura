# Dependencies Audit — Baseline (BATCH_08)

**Date:** 2026-05-02
**Tools:** `npm outdated` + `npm audit`

## Outdated packages

### Major updates available (defer — breaking changes)

| Package | Current | Latest | Wanted | Notes |
|---------|---------|--------|--------|-------|
| `vite` | 5.4.21 | 8.0.10 | 5.4.21 | major bump 5→8, breaking config changes |
| `vitest` | 3.2.4 | 4.1.5 | 3.2.4 | major bump 3→4, breaking API |
| `@vitest/coverage-v8` | 3.2.4 | 4.1.5 | 3.2.4 | major bump (coupled cu vitest) |
| `@vitest/ui` | 3.2.4 | 4.1.5 | 3.2.4 | major bump (coupled cu vitest) |
| `jsdom` | 25.0.1 | 29.1.1 | 25.0.1 | major 25→29, jsdom internals breaking |

**Total major outdated:** 5

### Minor updates available (low risk)

NU minor outdated detected.

**Total minor outdated:** 0

### Patch updates available (recommended)

| Package | Current | Wanted | Notes |
|---------|---------|--------|-------|
| `@sentry/browser` | 10.50.0 | 10.51.0 | patch bump, low risk |

**Total patch outdated:** 1

## Security audit

### Critical vulnerabilities
**0** — none.

### High vulnerabilities
**0** — none.

### Moderate vulnerabilities
**2:**

1. **`esbuild` <=0.24.2** (moderate)
   - Title: esbuild enables any website to send any requests to the development server and read the response
   - Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99
   - CWE: dev server request leak
   - Fix: requires vite major bump 5→8

2. **`vite` <=6.4.1** (moderate, transitive via esbuild)
   - Title: Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling
   - Advisory: https://github.com/advisories/GHSA-4w7w-66w2-5vf9
   - CWE-22 (Path Traversal) + CWE-200 (Information Exposure)
   - Fix: vite@8.0.10 (major bump breaking changes)

### Low / Info
**0** — none.

**Total vulnerabilities:** 2 moderate (transitive dev-only) + 0 high/critical.

## Dependency tree summary

- Production deps: 8
- Development deps: 315
- Optional: 51
- Total: 322

## Recommendations

### Immediate action
**None blocking pentru pilot Beta:**
- Both moderate vulns sunt **dev-only** (esbuild dev server + vite optimized deps `.map`) — NOT exploitable în production PWA frontend bundle
- SalaFull = Android-only PWA, dev server NU shipped la useri Beta
- Risk score reală: LOW (dev environment Daniel only)

### Pre-Beta launch
- `@sentry/browser` patch 10.50.0 → 10.51.0: safe `npm update @sentry/browser`
  - **Status:** acceptable defer post-Beta sau apply într-un batch separat
- 2 moderate vulns: monitor advisory updates, NOT blocking pre-Beta

### Post-Beta backlog
- `vite` 5 → 8 major: requires testing + vite.config breaking changes review
- `vitest` 3 → 4 major: API changes în test suite (potential 1203 tests rewrite scope)
- `jsdom` 25 → 29: testing env internals
- `@vitest/coverage-v8` + `@vitest/ui` coupled cu vitest major bump

### Acceptable defer
- All 2 moderate vulns NOT exploitable în context SalaFull frontend-only PWA Android distribution (dev server NEVER live)

## Baseline locked

This report = baseline 2026-05-02 reference. Future audits via:

```bash
npm outdated
npm audit
```

Compare against this baseline:
- **Outdated:** 5 major + 0 minor + 1 patch (target: monitor)
- **Vulnerabilities:** 0 critical / 0 high / 2 moderate (dev-only) / 0 low / 0 info (target: 0 critical/high)

## Cross-refs

- Vite 5→8 + vitest 3→4 = post-Beta strategic upgrade (potential breaking changes test suite)
- @sentry/browser patch = candidate single-batch update post-Beta
