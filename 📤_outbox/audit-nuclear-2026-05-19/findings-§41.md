# §41 — External Dependencies Inventory + Version Audit

**Scope:** React + Tailwind + Zustand + Dexie + Firebase + Vite + TS + Vitest + Playwright + Workbox + Lucide + date-fns + Bayesian math lib + Each dep rationale + Pinning policy + Major upgrades + Deprecation + EOL + Bundle size impact + Alternative consideration

## Severity matrix §41

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MED | 5 |
| LOW | 4 (positive) |
| NIT | 1 |
| **Total** | **15** |

---

## CRITICAL findings

### §41-C1 — TypeScript declared `^6.0.3` BUT TypeScript 6.x doesn't exist publicly — verify actual installed
**Severity:** CRITICAL (§41.7)
**Evidence:** package.json `"typescript": "^6.0.3"`. TypeScript current stable is 5.7-ish. `^6.0.3` would match no stable release. Either:
- (a) Typo / aspirational version → npm install fails silently OR resolves to a beta/RC.
- (b) Internal beta channel used by Daniel.
- (c) Stale package.json — actual `node_modules/typescript/package.json` has different version.
**Fix log:** Check `node_modules/typescript/package.json`. If mismatch, pin to actual installed exact version (e.g., `5.7.2`).

---

## HIGH findings

### §41-H1 — date-fns ABSENT (§41.12 + §11-H2)
**Severity:** HIGH
**Resolution:** Per §11-H2.

### §41-H2 — Bayesian math library NOT explicit (§41.13)
**Severity:** HIGH
**Evidence:** Custom Kalman filter implementation in `src/engine/bayesianNutrition/kalmanFilter.js`. NO external math lib (mathjs, ml-matrix). OK for closed-form Conjugate Prior.

### §41-H3 — Major version upgrades scheduled (§41.16)
**Severity:** HIGH
**Evidence:** vite v5 → v8 fix available (§4-H1). React 19 latest stable. Lucide-react `^1.16.0` is OLD (current ~0.42x newer naming OR `^0.x`); `^1.16.0` matches old npm release pre-2023. Possible version mismatch.
**Fix log:** Verify lucide-react actual version + naming convention.

### §41-H4 — Bundle size impact per dependency (§41.19) — top 10 weight contributors
**Severity:** HIGH
**Resolution:** Per §5-C1 vendor split observed:
- React 72KB
- Lucide 21KB
- Dexie ??? (chunked to 1byte empty §5-C2)
- Zustand 0.6KB
- main 432KB (engines + adapters bundled)

---

## MED findings

### §41-M1 — Each dependency rationale (§41.14)
**Severity:** MED
**Evidence:** Header comments mention some rationale (Dexie for IDB, Zustand for state). Centralized rationale doc absent (§18-H3 .env.example pattern).

### §41-M2 — Version pinning policy (§41.15) — covered §20-H2
### §41-M3 — Deprecation warnings hunt (§41.17)
**Severity:** MED
**Fix log:** Run `npm install` watch deprecation warnings.

### §41-M4 — EOL deps hunt (§41.18)
**Severity:** MED

### §41-M5 — Alternative consideration documented (§41.20)
**Severity:** MED — POSITIVE
**Evidence:** D015 React pivot decision + D-LEGACY-002 Firebase REST not SDK = ALTERNATIVES considered + documented.

---

## LOW (POSITIVE)

### §41-L1 — React 19 + react-dom + react-router-dom v6.28 — modern stable ✓ (§41.1)
### §41-L2 — Tailwind 3.4.19 + autoprefixer + postcss ✓ (§41.2)
### §41-L3 — Zustand 5.0.13 — modern ✓ (§41.3)
### §41-L4 — Dexie 4.4.2 — modern ✓ (§41.4)

---

## NIT findings

### §41-N1 — Firebase SDK NOT installed (REST only per ADR 002) ✓
**Resolution:** OK.

## Karpathy distribution §41
- Goal-Driven: 1 (C1)
- Surgical Changes: 2 (H1, H3)
- Think Before Coding: 1 (H4)
