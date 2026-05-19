# §25 — API Contract Integrity Firebase REST

**Scope:** REST endpoint versioning + Fallback on Firebase schema change + Error response handling all paths + Rate limit headers respect + Retry exponential backoff + Circuit breaker + Mock fidelity + Idempotency keys + Optimistic concurrency control + Timeout AbortController + REST vs SDK rationale ADR 002

## Severity matrix §25

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 3 |
| MED | 4 |
| LOW | 2 (positive) |
| NIT | 0 |
| **Total** | **9** |

---

## HIGH findings

### §25-H1 — Rate limit headers `Retry-After` respect NOT IMPLEMENTED (§25.4)
**Severity:** HIGH
**Evidence:** `src/firebase.js` fbGet/fbSet/fbRemove fetch wrappers. No header inspection for `Retry-After` on 429/503. Auth retry logic in src/auth.js exponential backoff fixed 250/500/1000ms — not Retry-After driven.
**Fix log:** In fbSet/fbGet, on `429 || 503`: parse `Retry-After` header, respect delay. Add to retry policy.

### §25-H2 — Timeout AbortController NOT USED for Firebase requests (§25.10)
**Severity:** HIGH
**Evidence:** `src/firebase.js` fbGet/fbSet uses bare `fetch(url, { cache: 'no-store' })` — no `AbortController`. Slow 3G → request hangs indefinitely (no timeout).
**Fix log:** Add `const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 15000); fetch(url, { signal: ctrl.signal, ... })`.

### §25-H3 — Idempotency keys for write ops (§25.8) — NOT IMPLEMENTED
**Severity:** HIGH
**Evidence:** Firebase RTDB write operations are mostly PUT idempotent by path. But POST (push) operations generate new IDs server-side → retry creates duplicate. Audit which writes are PUT vs POST.
**Fix log:** Audit fbSet usage; ensure retried write operations don't duplicate (e.g., session log).

---

## MED findings

### §25-M1 — REST endpoint versioning strategy (§25.1)
**Severity:** MED
**Evidence:** Firebase REST API v1 hardcoded paths (`/v1/accounts:sendOobCode`). No version abstraction. If Firebase deprecates v1 → manual updates. OK pre-Beta.

### §25-M2 — Fallback for Firebase schema change (§25.2)
**Severity:** MED
**Evidence:** No schema versioning on Firebase user docs. Adds risk for schema migration §12-C1.

### §25-M3 — Error response handling 4xx/5xx mapping (§25.3)
**Severity:** MED
**Evidence:** auth.js handles 4xx (deterministic, no retry) vs 5xx (transient, retry) ✓. Generic Firebase write errors mapped less explicitly — see secondary pass.

### §25-M4 — Optimistic concurrency control etag/version field (§25.9)
**Severity:** MED
**Evidence:** Firebase RTDB doesn't expose ETag standard. Firestore has `update_time` field. Audit usage.

---

## LOW (POSITIVE)

### §25-L1 — Retry strategy auth.js exponential backoff ✓ (§25.5)
**Severity:** LOW positive
**Evidence:** auth.js:62-86 documented retry with jitter potential (250/500ms is fixed; "exponential" loose).

### §25-L2 — REST vs SDK decision rationale documented ADR 002 LOCKED V1 ✓ (§25.11)
**Severity:** LOW positive
**Evidence:** D-LEGACY-002 "Firebase via REST API NU SDK pentru bundle size". Decision preserved.

## Karpathy distribution §25
- Goal-Driven: 2 (H1, H2)
- Surgical Changes: 1 (H3)
