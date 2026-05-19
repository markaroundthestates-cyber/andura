# §31 — Auth Flow Edge Cases Comprehensive

**Scope:** Magic Link expired/replayed/malformed token + Rate limiting + Session refresh + Logout flow + Multi-device + Account deletion + OAuth Phase 3 PENDING + Cross-tab session sync + Token storage decision + Re-auth sensitive ops + Magic Link domain validation + SMTP deliverability + Email content compliance

## Severity matrix §31

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 4 |
| MED | 5 |
| LOW | 2 |
| NIT | 0 |
| **Total** | **14** |

---

## CRITICAL findings

### §31-C1 — Auth.tsx production Magic Link NOT WIRED (§7-C2 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §7-C2.

### §31-C2 — Mock login bypass shipped to production (§7-C1 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §7-C1.

### §31-C3 — ProtectedRoute Phase 2 stub — no real auth listener (§7-C3 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §7-C3.

---

## HIGH findings

### §31-H1 — Magic Link rate limiting (§31.4 + §4-H3 reaffirmed)
**Severity:** HIGH
**Resolution:** Per §4-H3.

### §31-H2 — OAuth Phase 3 PENDING (§31.9) — verify NU partial wired
**Severity:** HIGH
**Evidence:** Per PRIMER §3 OAuth Phase 3 PENDING. Auth.tsx React build: shows only Magic Link email input + Mock login bypass. NO Google/OAuth button visible. PARTIAL: src/auth.js does NOT export OAuth handlers (only `sendMagicLink`). OAuth not wired in current build.
**Resolution:** Properly PENDING; no partial wired surface exposing. OK.

### §31-H3 — Multi-device auth simultaneous handling (§31.7 + §7.18)
**Severity:** HIGH
**Evidence:** Cross-device requires real Firebase Auth listener (§7-C3 stub). Currently impossible to verify multi-device.
**Resolution:** Blocked by §7-C3 fix.

### §31-H4 — Re-authentication required for sensitive ops (§31.12)
**Severity:** HIGH
**Evidence:** Account deletion via SettingsDanger.tsx — does it re-prompt password/Magic Link? Per Firebase docs, `accounts:delete` requires recent auth. Verify implementation.
**Fix log:** Read SettingsDanger.tsx; ensure re-auth check OR document Firebase token freshness reliance.

---

## MED findings

### §31-M1 — Magic Link expired token UX (§31.1) — vanilla sendMagicLink exists but UX path NOT VERIFIED React
**Severity:** MED

### §31-M2 — Magic Link replayed token UX (§31.2 + §4.19)
**Severity:** MED
**Evidence:** Firebase Identity Toolkit oobCode single-use (default behavior). Replay attempt → API rejects → user sees error. Verify React error handling.

### §31-M3 — Magic Link malformed token UX (§31.3) — graceful error
**Severity:** MED
**Evidence:** Defer secondary.

### §31-M4 — Session management refresh strategy (§31.5 + §4-M6)
**Severity:** MED
**Resolution:** Per §4-M6.

### §31-M5 — Logout flow complete (§31.6 + §7.19)
**Severity:** MED
**Evidence:** SettingsDanger has logout option (per spec). Implementation needs verify: clear Zustand stores + IndexedDB + Firebase Auth + redirect splash.
**Fix log:** Verify SettingsDanger logout handler comprehensive.

---

## LOW (POSITIVE)

### §31-L1 — Token storage decision documented (localStorage per Firebase REST SDK pattern) ✓ (§31.11)
**Severity:** LOW — POSITIVE
**Evidence:** auth.js AUTH_STORAGE_KEYS frozen object; secure defaults considering SPA limitations §4-C4.

### §31-L2 — SMTP deliverability Phase 2 RESOLVED ✓ (§31.14)
**Severity:** LOW — POSITIVE
**Evidence:** D-LEGACY phase 2 batch 3 LANDED previously.

## Karpathy distribution §31
- Goal-Driven: 4 (C1, C2, C3, H3)
- Surgical Changes: 1 (H4)
