# DEPENDENCY AUDIT

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** LIVE audit doc — pre-Beta baseline
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §41-H1/H2/H3/H4)
**Cross-ref:** package.json, vite.config.js, ADR 002 firebase-rest-not-sdk

---

## §1 Scop

Doc inventariind dependency-urile Andura cu rationale, version policy si
bundle-impact estimate. Update la fiecare major-version upgrade scheduled
sau la fiecare ratchet bundle-budget pre-Beta.

---

## §2 Production runtime dependencies

| Dep | Version | Rationale | Bundle impact |
|-----|---------|-----------|---------------|
| react | ^19.0.0 | UI framework — D028 React Clasic vanilla→React swap LANDED | ~72KB (gzipped) primary |
| react-dom | ^19.0.0 | DOM renderer pair cu react | bundled cu react |
| react-router-dom | ^6.28.0 | Routing client-side. NU upgrade to v7 yet (breaking API changes — deferred post-Beta). | ~13KB |
| zustand | ^5.0.13 | State management lightweight. ADR-locked alternative to Redux. | ~0.6KB |
| dexie | ^4.4.2 | IndexedDB wrapper Tier 1 storage. Chunked dynamic-import (§5-C2 vendor split pending). | ~38KB lazy chunk |
| lucide-react | ^1.16.0 | Icon library tree-shaken. **VERIFIED 2026-05-22**: 1.16.0 = current latest (npm view confirmed); NOT stale. Per-icon import strategy keeps bundle small. | ~21KB (selective import) |
| @sentry/browser | ^10.49.0 | Error tracking pending §13-C1 Sentry wire (CRIT). | ~45KB pending wire |

**NU folosim:** Firebase SDK (ADR 002 — REST API direct + custom auth.js).

---

## §3 Dev dependencies key

| Dep | Version | Purpose | Status |
|-----|---------|---------|--------|
| vite | ^5.2.0 | Build tool. **OUTDATED minor** — installed 5.4.21, latest 8.0.14 major-upgrade. | §41-H3 + §4-H1 deferred CRIT wave |
| typescript | ^6.0.3 | Type checker strict mode. | OK |
| vitest | ^3.2.4 | Unit test runner. Latest 4.1.7 major upgrade pending. | OK current; upgrade deferred |
| @playwright/test | ^1.59.1 | E2E test runner. | OK |
| tailwindcss | ^3.4.19 | Styling utility. v4 breaking — deferred. | OK |
| @vitejs/plugin-react | ^4.3.0 | React + Vite integration. | OK |
| @testing-library/react | ^16.3.2 | RTL component tests. | OK |
| eslint | ^9.18.0 | Linting. warn-only initial mode (§1-C4 audit). | warn-only |
| husky | ^9.1.7 | Pre-commit hook runner. | OK |
| fast-check | ^4.8.0 | Property-based testing simulations. | OK |
| @stryker-mutator/core | ^9.6.1 | Mutation testing engine + adapter. | OK |

---

## §4 §41-H1 — date-fns absent (§11-H2 + §40-H1)

### §4.1 Probleme rezolvate

- DST week boundary handling (Oct/March transitions)
- Week start ISO 8601 Monday consistency
- Date diff cu DST-aware logic (NU `Date.now() - other`)

### §4.2 Decizie LOCKED V1

**Adopta `date-fns@^4.x` ca dep production** pentru:
- `scheduleStore.weekStartIso()` reliability across DST
- Calendar7Day date math precision
- Calibration drift reconciliation timestamp diff
- Tier 0/1 expiry boundary checks (24h, 90d)

**Alternative considerate:**
- Day.js: similar API dar mai mic bundle. RESPINS — date-fns mai stabil
  ecosystem + tree-shakeable per-fn import (similar la lucide).
- Luxon: locale-aware mai bun pentru i18n. RESPINS — overkill pentru
  pre-Beta single-locale (RO).
- Native `Date` + manual logic: RESPINS — DST bugs documented in §40-H1.

### §4.3 Implementare

Adauga in `package.json` dependencies:
```json
"date-fns": "^4.1.0"
```

Tree-shaken per-fn imports: `import { addDays, differenceInCalendarDays } from 'date-fns'`.

Bundle impact estimate: ~5KB per import group selectiv.

---

## §5 §41-H3 — Major version upgrades scheduled

### §5.1 Current outdated state (post npm-outdated 2026-05-22)

| Pkg | Current | Latest | Plan |
|-----|---------|--------|------|
| @eslint/js | 9.39.4 | 10.0.1 | Pre-Beta minor bumps OK |
| @playwright/test | 1.59.1 | 1.60.0 | Pre-Beta minor bumps OK |
| @sentry/browser | 10.50.0 | 10.53.1 | OK current minor |
| @vitejs/plugin-react | 4.7.0 | 6.0.2 | DEFERRED post-Beta + vite upgrade |
| @vitest/coverage-v8 | 3.2.4 | 4.1.7 | DEFERRED post-Beta cu vitest 4 |
| @vitest/ui | 3.2.4 | 4.1.7 | DEFERRED post-Beta cu vitest 4 |
| eslint | 9.39.4 | 10.4.0 | DEFERRED post-Beta minor cycle |
| eslint-plugin-react-hooks | 5.2.0 | 7.1.1 | DEFERRED post-Beta |
| jsdom | 25.0.1 | 29.1.1 | DEFERRED post-Beta breaking-changes risk |
| lint-staged | 16.4.0 | 17.0.5 | DEFERRED post-Beta minor cycle |
| postcss | 8.5.14 | 8.5.15 | Trivial bump OK |
| react-router-dom | 6.30.3 | 7.15.1 | **DEFERRED post-Beta** — v7 breaking API |
| tailwindcss | 3.4.19 | 4.3.0 | **DEFERRED post-Beta** — v4 breaking (CSS-first config) |
| vite | 5.4.21 | 8.0.14 | **DEFERRED §4-H1 CRIT wave** — coordinate cu plugin ecosystem |
| vitest | 3.2.4 | 4.1.7 | DEFERRED post-Beta cu coverage-v8 + ui |

### §5.2 lucide-react verify

`lucide-react@^1.16.0` — installed actual 1.16.0. **NU stale.** npm view
confirma 1.16.0 = latest released version. Package renamed istoric din
diferite namespaces; current package nume `lucide-react` is correct.

### §5.3 Pre-Beta upgrade policy

- Patch bumps (x.y.Z): OK ad-hoc fix-mode
- Minor bumps (x.Y.z): OK pre-Beta cu test suite green post-bump
- Major bumps (X.y.z): DEFERRED post-Beta UNLESS security-critical CVE

---

## §6 §41-H2 — Bayesian math library NOT explicit

### §6.1 Custom Kalman filter rationale

`src/engine/bayesianNutrition/kalmanFilter.js` — custom 1D Kalman pentru
posterior update calorie balance / weight trend. Closed-form Conjugate
Prior (Normal-Normal) → ZERO need for general math lib (numjs, mljs etc).

**Decizie:** keep custom implementation. Pros:
- Zero dep overhead (~0KB)
- Domain-specific logic transparent
- Drift test §38-H5 1000-day acceptable (LANDED 2026-05-22 cluster ETA)

**Anti-pattern flag:** daca extindem la multi-dim (covariance matrix
nutrition + sleep + recovery cross-correlation) → re-evalueaza adoption
matrix-math lib. Pre-Beta: NU necesar.

---

## §7 §41-H4 — Bundle size impact top contributors

### §7.1 Top weight contributors (estimate pre-§5-C1 vendor split)

| Rank | Module | Estimate | Notes |
|------|--------|----------|-------|
| 1 | engines + adapters bundled | ~280KB | Tree-shake pending §5-C1 |
| 2 | react + react-dom | ~72KB | Cannot reduce, framework baseline |
| 3 | @sentry/browser | ~45KB | Pending §13-C1 wire; lazy-load consider post-Beta |
| 4 | dexie | ~38KB | Already lazy-chunked (§5-C2 pending verify) |
| 5 | lucide-react (selective) | ~21KB | Per-icon import tree-shaken |
| 6 | react-router-dom | ~13KB | Routing core, cannot reduce |
| 7 | date-fns (selective post §41-H1) | ~5-8KB | Tree-shaken per-fn import |
| 8 | zustand | ~0.6KB | Negligible |

**Main bundle current target:** ~432KB pre-§5-C1 vendor split. Post-split
target: ~150-200KB main + ~250KB lazy chunks.

### §7.2 Bundle analyzer

Run `npm run size:why` for detailed report. **size-limit** config NU enforced
yet — gate-mode TBD post-Beta CI/CD wave.

---

## §8 Security audit pre-Beta

- `npm audit` baseline clean target — no HIGH/CRITICAL pre-launch
- Run `npm audit --omit=dev` to filter dev-dep noise
- Dependabot grouped updates LANDED §33-H1 (commit 8b7fde15)

---

## §9 Audit chain

- Major upgrade → DECISIONS.md LOCKED V1 + ADR if breaking
- New runtime dep → this doc append + DECISIONS.md note
- Bundle ratchet → §5-C1 vendor split CRIT wave landing
- date-fns adopted post §41-H1 LANDED commit (2026-05-22)
