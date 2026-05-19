# §20 — Bundle / Build Artifact / Supply Chain Audit

**Scope:** Tree-shake + sourcemap strip + console.* strip + debug strip + env keys + asset optim + chunk strategy + critical CSS + license-checker + license compatibility + dep pinning + lockfile + postinstall hunt + Renovate/Dependabot + supply chain attack surface + build reproducibility + Node version pinned + SRI + bundle budget + secrets in artifact + unused deps + circular imports

## Severity matrix §20

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 5 |
| MED | 5 |
| LOW | 4 (positive) |
| NIT | 1 |
| **Total** | **18** |

---

## CRITICAL findings

### §20-C1 — Main bundle 432 KB over budget (§5-C1 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §5-C1.

### §20-C2 — Production secrets check: PLACEHOLDER_WEB_API_KEY in source ships to dist (§4-C2 reaffirmed)
**Severity:** CRITICAL (§20.20)
**Resolution:** Per §4-C2.

### §20-C3 — License compliance OSS scan NOT RUN (license-checker)
**Severity:** CRITICAL (§20.9 + §20.10)
**Evidence:** No license-checker run output saved. Manual check needed:
- React 19 MIT ✓
- Zustand MIT ✓
- Dexie Apache-2.0 ✓
- lucide-react ISC ✓
- @sentry/browser MIT ✓
- workbox MIT ✓
- vite-plugin-pwa MIT ✓
- All major deps known-compatible.
- BUT 759 total deps per npm audit metadata → transitive license risk unknown without scan.
**Fix log:** Run `npx license-checker --production --excludePrivatePackages --summary` post-audit. Filter GPL/AGPL/LGPL contamination. Document SBOM via `npx cyclonedx-bom`.

---

## HIGH findings

### §20-H1 — Node version inconsistency CI (Node 22) vs deploy (Node 20) (§20.17)
**Severity:** HIGH
**Evidence:** ci.yml uses Node 22. deploy.yml uses Node 20. package.json has NO `engines.node` field. Build reproducibility violated.
**Fix log:** Add to package.json `"engines": { "node": ">=20 <23" }`. Sync deploy.yml and ci.yml to same Node major version (recommend Node 22 LTS).

### §20-H2 — Dependency pinning policy (caret `^` everywhere) — exact pinning preferred for reproducibility (§20.11)
**Severity:** HIGH
**Evidence:** package.json uses `^X.Y.Z` for all deps. npm install picks latest within major.minor → CI run today vs tomorrow can differ.
**Reasoning:** package-lock.json locks ✓ but `npm install` (deploy.yml line 27) doesn't respect lockfile strictly. `npm ci` (ci.yml line 53) does. Inconsistency.
**Fix log:**
- (a) Change deploy.yml `npm install` → `npm ci` (deterministic install from lockfile).
- (b) Optionally pin exact versions (drop ^).

### §20-H3 — Postinstall scripts hunt — supply chain attack surface (§20.13)
**Severity:** HIGH
**Evidence:** Need `npm ls --json --omit=dev | jq '.dependencies | to_entries[] | select(.value.scripts)'` to enumerate postinstall scripts. Manual sample: husky runs `husky` in prepare → expected. Other deps unknown.
**Fix log:** Run `npx better-npm-audit audit` or `npx --yes can-i-deploy` to surface hooks. Audit each.

### §20-H4 — Renovate/Dependabot policy NOT DOCUMENTED (§20.14)
**Severity:** HIGH
**Evidence:** No `.github/dependabot.yml` OR `renovate.json`. Manual dep updates only.
**Fix log:** Add `.github/dependabot.yml` with weekly schedule + auto-merge for patches + manual review for minors/majors.

### §20-H5 — Unused dependencies hunt (depcheck) NOT RUN (§20.21)
**Severity:** HIGH
**Evidence:** No depcheck output saved. Manual sample: `lucide-react@^1.16` — version 1.x is old (current lucide-react ~0.42x with named import per react 18+). Verify still used as expected.
**Fix log:** `npx depcheck` audit; remove unused.

---

## MED findings

### §20-M1 — Tree-shaking effective production ✓ (§20.1) — covered §5-M1+M2+M3
**Severity:** MED — POSITIVE

### §20-M2 — Source maps strip ✓ (§20.2)
**Severity:** MED — POSITIVE (vite.config `sourcemap: false`)

### §20-M3 — Critical CSS inline NOT TESTED (§20.8)
**Severity:** MED
**Evidence:** Vite doesn't inline critical CSS by default. main-Berm.css = 17KB separate file. Above-fold render blocked by CSS download. Minor for 17KB.
**Fix log:** Acceptable for now; consider `vite-plugin-critical` if FCP target needs help.

### §20-M4 — Circular imports madge audit NOT RUN (§20.22)
**Severity:** MED
**Fix log:** `npx madge --circular src/` audit.

### §20-M5 — Asset optimization images compressed/fonts subset NOT VERIFIED (§20.6)
**Severity:** MED (§1-H5 covered)

---

## LOW (POSITIVE)

### §20-L1 — Lockfile committed package-lock.json ✓ (§20.12)
**Severity:** LOW positive
**Evidence:** `.gitignore` does NOT exclude package-lock.json.

### §20-L2 — Bundle artifact size monitored via Vite warning (chunkSizeWarningLimit) ✓
**Severity:** LOW positive (§5-M5 silenced 600 — partial)

### §20-L3 — Chunk strategy vendor split ✓ (§20.7)
**Severity:** LOW positive
**Evidence:** vite.config manualChunks split react/state/icons/data.

### §20-L4 — `.gitignore` comprehensive for secrets (firebase-service-account.json) ✓
**Severity:** LOW positive

---

## NIT findings

### §20-N1 — SRI integrity for third-party scripts N/A (no CDN scripts) — §4-H6 covered
**Resolution:** OK.

## Coverage map §20.x condensed

| Sub | Severity |
|-----|----------|
| 20.1 Tree-shake | §20-M1 ✓ |
| 20.2 Source maps strip | §20-M2 ✓ |
| 20.3 console.* strip | §1-C2 CRITICAL |
| 20.4 Debug strip | §1-C2 |
| 20.5 Env vars correct VITE_* | §4-C2 |
| 20.6 Asset optim | §1-H5 + §20-M5 |
| 20.7 Chunk strategy | §20-L3 ✓ |
| 20.8 Critical CSS inline | §20-M3 |
| 20.9 License compliance scan | §20-C3 |
| 20.10 License compat MIT/Apache OK | §20-C3 manual-known compatible |
| 20.11 Dep pinning policy | §20-H2 |
| 20.12 Lockfile integrity | §20-L1 ✓ |
| 20.13 Postinstall hunt | §20-H3 |
| 20.14 Renovate/Dependabot | §20-H4 |
| 20.15 Supply chain attack surface | §20-H3 + §20-C3 |
| 20.16 Build reproducibility | §20-H1 + §20-H2 |
| 20.17 Node version pinned | §20-H1 |
| 20.18 SRI | §20-N1 |
| 20.19 Bundle budget CI enforced | §5-C4 lighthouse-ci + bundlesize |
| 20.20 Production secrets in artifact | §20-C2 |
| 20.21 Unused deps depcheck | §20-H5 |
| 20.22 Circular imports madge | §20-M4 |

## Karpathy distribution §20
- Goal-Driven: 3 (C1, C2, C3)
- Surgical Changes: 2 (H1, H4)
- Think Before Coding: 1 (H3)
