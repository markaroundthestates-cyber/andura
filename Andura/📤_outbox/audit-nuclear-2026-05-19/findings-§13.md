# §13 — Error Handling Cross-Cutting Audit

**Scope:** Async defensive paths + Toast UX + Retry strategy + Graceful offline + Error boundary + Sentry + global handlers + form validation Big 6 bounds + sanitization + numeric parsing + double-click + paste + max-length + UX consistency + offline messages + concurrent modification + optimistic UI

## Severity matrix §13

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MED | 6 |
| LOW | 2 (positive) |
| NIT | 1 |
| **Total** | **14** |

---

## CRITICAL findings

### §13-C1 — ErrorBoundary `componentDidCatch` ONLY console.error → no Sentry → invisible production errors (§4-C1 root cause reaffirmed)
**Severity:** CRITICAL (§13.5 + §13.6)
**Evidence:** `src/react/components/ErrorBoundary.tsx:30-32`:
```ts
override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  console.error('[ErrorBoundary] caught render error:', error, errorInfo);
}
```
Comment line 4-5: "Phase 6+ wires Sentry sau similar telemetry pipeline." UNRESOLVED post Phase 6 LANDED.
**Fix log:** Per §4-C1 fix — wire `captureException(error, { extra: { errorInfo, componentStack: errorInfo.componentStack } })`. ETA: S.

---

## HIGH findings

### §13-H1 — Big 6 form validation bounds NOT VERIFIED at input level (§13.9 + §30.6)
**Severity:** HIGH
**Evidence:** Per §7-C4. Onboarding Step1-Step6 components NOT inspected. If age=8, weight=999, frequency=999 reach engine → demographic prior fails → engine NaN.
**Fix log:** Secondary pass + add `min/max/step` to numeric inputs + setField validation.

### §13-H2 — Submit double-click protection (§13.12) — Auth.tsx + Onboarding.tsx NOT verified disable-during-async
**Severity:** HIGH
**Evidence:** Auth.tsx `handleSend()` sets `setSent(true)` synchronously. No disable-during-async wrap (because the "send" is mocked currently §7-C2). Real wiring needs `useState<'idle'|'sending'>` + disabled button during 'sending'.
**Fix log:** Combined with §7-C2 fix.

### §13-H3 — Unhandled promise rejection global handler — UNVERIFIED wired (§13.7)
**Severity:** HIGH
**Evidence:** Grep `unhandledrejection` in src/ → ZERO hits in production code. `window.onunhandledrejection` handler absent. Async errors that escape try/catch → silent in browser, miss Sentry capture.
**Fix log:** Add `window.addEventListener('unhandledrejection', e => captureException(e.reason, { tags: { source: 'unhandledrejection' } }))` in main.tsx after initSentry.

### §13-H4 — Window error global handler — UNVERIFIED wired (§13.8)
**Severity:** HIGH
**Evidence:** Same pattern as §13-H3. `window.onerror` handler absent. Synchronous errors outside React tree (e.g., third-party script) — uncaught.
**Fix log:** Add `window.addEventListener('error', e => captureException(e.error, { tags: { source: 'window.error' } }))`.

---

## MED findings

### §13-M1 — Toast UX consistent pattern app-wide NOT verified (§13.2 + §13.15)
**Severity:** MED
**Evidence:** No central Toast component observed in `src/react/components/`. Vanilla legacy has `src/ui/ui.js` exporting `toast()`. React may use ad-hoc per-screen rendering. Inconsistent.
**Fix log:** Implement `<Toast />` global component + `useToast()` hook. Centralize message display + ARIA live region.

### §13-M2 — Retry strategy network failures (exponential backoff) ✓ in vanilla auth.js
**Severity:** MED — POSITIVE for vanilla; verify React wires it
**Evidence:** `src/auth.js:62-86` 3-attempt backoff 250/500ms ✓. But React Auth.tsx doesn't import sendMagicLink (§7-C2).

### §13-M3 — Graceful offline degradation Service Worker NetworkFirst Firebase ✓ infra; runtime UX UNVERIFIED
**Severity:** MED (§13.4)
**Evidence:** vite-plugin-pwa NetworkFirst (timeout 3s, fallback cache) ✓. Runtime UX: when offline, user sees stale data — banner "Esti offline" UNVERIFIED.

### §13-M4 — Form validation Big 6 BOUNDS already covered §13-H1

### §13-M5 — Free-text length limits absent — anti-RE per §10.5/§10.7 mitigates (no free-text fields V1)
**Severity:** MED — POSITIVE
**Evidence:** F13 DROP V1 §9-L4 ✓. No `<textarea>` in audit sample. Max-length non-issue V1.

### §13-M6 — Optimistic UI update + rollback on error (§13.20)
**Severity:** MED
**Evidence:** Sample logSet flow likely optimistic (Zustand updates immediately). Rollback on Firebase write fail UNVERIFIED.
**Fix log:** Audit logSet / state mutations + verify rollback policy.

---

## LOW (POSITIVE)

### §13-L1 — ErrorBoundary structurally present + fallback UI Daniel-direct voice "Ceva nu a mers" + "Incearca din nou" / "Reincarca" ✓
**Resolution:** Phase 6 task_20 LANDED ✓ UX path works; missing telemetry wire only.

### §13-L2 — Engine pipeline severity-aware error recovery 'soft'/'hard' per ADR 030 §3.6 ✓
**Resolution:** Covered §8-L4.

---

## NIT findings

### §13-N1 — Error messages "Esti offline" specific wording pending Daniel D024 review post-Beta
**Resolution:** OK for pre-Beta.

## Coverage map §13.x condensed

| Sub | Severity |
|-----|----------|
| 13.1 Async defensive | §1-C2 console.warn catch ✓; observability gap §13-C1 |
| 13.2 Toast UX | §13-M1 |
| 13.3 Retry strategy | §13-M2 ✓ vanilla |
| 13.4 Graceful offline | §13-M3 |
| 13.5 ErrorBoundary | §13-L1 ✓ structurally; §13-C1 telemetry |
| 13.6 Sentry | §4-C1 — DEAD prod |
| 13.7 unhandledrejection | §13-H3 |
| 13.8 window.error | §13-H4 |
| 13.9 Form validation Big 6 | §13-H1 |
| 13.10 Input sanitization XSS | XSS already audited §4-M1 ✓ no innerHTML |
| 13.11 Numeric parsing locale | §11-M2 |
| 13.12 Submit double-click | §13-H2 |
| 13.13 Paste clipboard | NOT VERIFIED MED secondary |
| 13.14 Max chars per field | §13-M5 ✓ |
| 13.15 Error states UX consistent | §13-M1 |
| 13.16 Required/optional fields | NOT VERIFIED MED secondary |
| 13.17 Recovery UX | §13-L1 ErrorBoundary |
| 13.18 Offline messages friendly | §13-M3 |
| 13.19 Concurrent modification | §12-H3 covered §12 |
| 13.20 Optimistic + rollback | §13-M6 |

## Karpathy distribution §13
- Think Before Coding: 2 (H3, H4)
- Goal-Driven: 3 (C1, H1, M3)
- Surgical Changes: 1 (M1)
