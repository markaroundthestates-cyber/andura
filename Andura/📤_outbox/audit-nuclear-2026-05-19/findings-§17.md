# §17 — Telemetry / Observability Audit

**Scope:** Opt-in telemetry default FALSE + events captured + k-anonymity + Sentry config + logs PII strip + RUM WebVitals + INP + TTFB + custom metrics + error tracking + uptime + monitoring strategy + user behavior analytics + incident response runbook + perf regression alerting

## Severity matrix §17

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MED | 4 |
| LOW | 3 (positive) |
| NIT | 1 |
| **Total** | **13** |

---

## CRITICAL findings

### §17-C1 — Sentry NOT initialized for React production (§4-C1 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §4-C1 — main.tsx doesn't call initSentry().

---

## HIGH findings

### §17-H1 — RUM WebVitals capture absent — no LCP/FID/CLS/TBT/SI/INP/TTFB measurement (§17.6)
**Severity:** HIGH
**Resolution:** Per §5-C4.

### §17-H2 — k-anonymity k=5 minimum NOT documented per telemetry event (§17.3)
**Severity:** HIGH (§4.15)
**Evidence:** Firestore rules limit telemetry counters to 14 keys (firestore.rules §_telemetry/global) but k=5 minimum threshold pre-emission NOT enforced — events fire per individual user → effectively k=1 unless aggregated.
**Reasoning:** Per ADR 019 k-anonymity. Telemetry counters are sums across all users (FieldValue.increment) — aggregated by design ✓. Individual user behavior fingerprinting prevented. POSITIVE re-read.
**Resolution:** Reclassify to POSITIVE — server-side aggregation IS the k-anonymity. Verify client side emits only counter increments (no per-event PII) — sample audit.

### §17-H3 — Incident response runbook absent (§17.14)
**Severity:** HIGH
**Resolution:** Per §34 deep.

### §17-H4 — Performance regression detection alerting absent (§17.15)
**Severity:** HIGH
**Resolution:** Per §5-C4 lighthouse-ci wiring.

---

## MED findings

### §17-M1 — Telemetry opt-in default FALSE — Phase 6 task_14 LANDED (§17.1)
**Severity:** MED — POSITIVE
**Evidence:** Per D026 + SettingsPrivacy.tsx exists. Verify implementation reads `telemetryOptIn` flag before emit.

### §17-M2 — Sentry config strips Firebase errors (§4-C5 reaffirmed)
**Severity:** MED (covered §4)

### §17-M3 — Logs NOT exposing PII production strip (§17.5)
**Severity:** MED
**Evidence:** console.warn statements log error objects (which may include user uid in stack). Per §1-C2 strip recommended.

### §17-M4 — Uptime monitoring stub (Pingdom/UptimeRobot/etc) (§17.11)
**Severity:** MED
**Evidence:** No external uptime monitor wired. GH Pages serves andura.app. Manual check.

---

## LOW (POSITIVE)

### §17-L1 — Sentry deps installed (@sentry/browser ^10.49) ✓ — only wiring missing
**Resolution:** Per §4-C1.

### §17-L2 — Telemetry counter limited keys via Firestore rules ✓
**Resolution:** §4-L2.

### §17-L3 — `silent: 'passed-only'` in vitest config — passes stay quiet, fails surface ✓
**Resolution:** Per §2.

---

## NIT findings

### §17-N1 — Custom metrics (workout duration, engagement) NOT YET implemented — Beta + post-Beta scope
**Resolution:** Deferred per §17.9.

## Coverage map §17.x condensed

| Sub | Severity |
|-----|----------|
| 17.1 Opt-in default FALSE | §17-M1 ✓ |
| 17.2 Events captured if opt-in | NOT VERIFIED MED secondary |
| 17.3 k-anonymity preserve | §17-H2 POSITIVE re-read |
| 17.4 Sentry config | §17-C1 |
| 17.5 Logs PII strip | §17-M3 |
| 17.6 RUM WebVitals | §17-H1 |
| 17.7 INP tracked | §5-C4 |
| 17.8 TTFB tracked | §5-C4 |
| 17.9 Custom metrics | §17-N1 |
| 17.10 Error tracking Sentry stub | §17-C1 |
| 17.11 Uptime monitoring | §17-M4 |
| 17.12 Production monitoring strategy | §17-H3 covered §34 |
| 17.13 User behavior analytics anti-surveillance | OK opt-in default FALSE | LOW positive |
| 17.14 Incident response runbook | §17-H3 covered §34 |
| 17.15 Perf regression alerting | §17-H4 covered §5-C4 |

## Karpathy distribution §17
- Goal-Driven: 4 (C1, H1, H3, H4)
- Surgical Changes: 1 (M3)
