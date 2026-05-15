---
title: Auth Magic Link — SMTP Phase 2 RESOLVED 2026-05-06 + §AMENDMENT 2026-05-04 BATCH 1-6
type: entity-feature
status: locked-v1
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../adrs/adr-multi-tenant-auth]]"
  - "[[../adrs/adr-007-firebase-open-rules]]"
  - "[[../adrs/adr-002-firebase-rest-not-sdk]]"
  - "[[../../../src/pages/auth.js]]"
---

# Auth Magic Link

## Synthesis

**Auth Magic Link feature** = Multi-tenant Authentication Magic Link SMTP flow LOCKED V1 per ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-04 BATCH 1-6 + Auth Phase 2 RESOLVED 2026-05-06. Implementation `src/auth*.js` Firebase Auth REST API direct NU SDK (per ADR 002) + custom SMTP email send via Firebase Functions equivalent + magic link token exchange flow + 35 sub-decisions §56.13.X auto-retry 3x network failures + HTTP 5xx eventually succeeds retry attempt 3 transient failures (tests `src/__tests__/auth-wiring.test.js` §56.13.1 auto-retry 3x).

**UX surface mockup V2:** Auth flow — Email input → Send Magic Link button → toast "Verifică email" → user click email link → app open + auto-login. ZERO password V1 (anti-password-fatigue + GDPR k-anonymity k=5 minim per ADR 019). Anonymous → Auth migration smooth (D12 scenario Daniel pre-launch test 2 anonymous accounts phone + PC merge).

**Engine integration:** Cross-ref [[../adrs/adr-007-firebase-open-rules]] single-user personal rules + §AMENDMENT 2026-05-02 database.rules.json LANDED gated Auth migration + ADR 019 GDPR k-anonymity k=5 + 5 quasi-identifiers SSOT + §AMENDMENT 2026-05-02 community channel-agnostic. ADR 021 Calibration Drift Reconciliation Version Vector Max-Merge multi-device sync foundation post-Auth (EC-5 Anonymous → Auth migration scenario covered).

## Verbatim quotes Daniel

Daniel verbatim Auth Magic Link RESOLVED 2026-05-06 morning rationale ZERO password V1:
> *"Magic Link SMTP COMPLETE end-to-end. ZERO password V1. Anti-password-fatigue + GDPR k-anonymity k=5 minim. Anonymous → Auth migration smooth D12 scenario."*

Daniel verbatim §56.13.1 auto-retry 3x network failures rationale:
> *"sendMagicLink — §56.13.1 auto-retry 3x: retries up to 3x on network error then surfaces failure + retries on HTTP 5xx then surfaces last error + eventually succeeds on retry attempt 3 after transient failures."*

## Bugatti framing notes

**Gigel test relevance:** Magic Link flow "Email → Click link → In" = zero gândire user (NU password remember). Gigel test PASS anti-password-fatigue mainstream pattern (Slack + Notion + Medium proven).

**Quality > Speed via Firebase REST direct NU SDK:** Per ADR 002 firebase-rest-not-sdk LOCK V1 — bundle 50KB vs 200KB SDK + selective scoping per endpoint. Auto-retry 3x preserved resilience.

**Anti-RE considerations:** ADR 007 §AMENDMENT 2026-05-02 database.rules.json LANDED gated Auth migration = anti-recurrence "single-user rules deployed before auth wiring → broken state". Pattern: gate critical infrastructure change cross-ADR dependency.

**Anti-paternalism notes:** ZERO password V1 = anti-paternalism (NU forced password complexity rules). Anonymous → Auth migration optional NU mandatory. User decides upgrade path.

**Voice tone notes:** Daniel-ism "anti-password-fatigue" recurring pattern (UX cognitive load discipline). Anonymous-first preserved.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 BATCH 1-6 + Auth Phase 2 RESOLVED 2026-05-06
- [[../../../03-decisions/002-firebase-rest-not-sdk]] §AMENDMENT 2026-05-02 Auth migration prerequisite
- [[../../../03-decisions/007-firebase-open-rules]] §AMENDMENT 2026-05-02 database.rules.json LANDED gated
- [[../../../03-decisions/019-gdpr-k-anonymity-validation]] k=5 minim + 5 quasi-identifiers SSOT
- [[../../../03-decisions/021-calibration-drift-reconciliation]] EC-5 Anonymous → Auth migration scenario
- [[../../../src/__tests__/auth-wiring.test.js]] §56.13.1 auto-retry 3x tests preserved
- [[../../../06-sessions-log/HANDOVER_AUTH_FLOW_*]] §56.13.X 35 sub-decisions Auth Phase 2 RESOLVED

🦫 **Auth Magic Link SMTP Phase 2 RESOLVED 2026-05-06. §AMENDMENT 2026-05-04 BATCH 1-6 LOCKED. ZERO password V1 anti-password-fatigue mainstream pattern. Firebase REST direct NU SDK ADR 002 bundle 50KB. Auto-retry 3x §56.13.1 network/HTTP 5xx resilience. Anonymous → Auth migration smooth D12 scenario.**
