---
title: Auth Flow Overview — Magic Link Phase 1 + Phase 2 SMTP + OAuth Sprint 3 Holistic
type: summary
status: live
last_updated: 2026-05-12
synthesis_scope: auth-flow
cross_refs:
  - "[[../entities/adrs/adr-multi-tenant-auth]]"
  - "[[../entities/adrs/adr-002-firebase-rest-not-sdk]]"
  - "[[../entities/adrs/adr-007-firebase-open-rules]]"
  - "[[../entities/adrs/adr-019-gdpr-k-anonymity-validation]]"
  - "[[../entities/features/feature-auth-magic-link]]"
  - "[[../entities/specs/spec-multi-tenant-auth]]"
---

# Auth Flow Overview

## Synthesis

**Andura Auth Flow** = Anonymous local-first UUID (`localStorage['device-id']`) → Firebase Auth Real (Email Magic Link primary + OAuth Google secondary) cu zero data loss + ZERO password V1. Authority: ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-04 BATCH 1-6 + Phase 2 SMTP RESOLVED 2026-05-06 + spec-multi-tenant-auth Sprint 3 implementation DRAFT.

**Phase 1 (Anonymous local-first):** UUID per device în `localStorage['device-id']`. Firebase REST direct (NU SDK per ADR 002 — bundle 50KB vs 200KB). Single-user paths hardcoded `users/daniel` (V0 prod). ADR 001 local-first-storage foundation IndexedDB primary + Firebase backup tier. Daniel pre-launch test 2 anonymous accounts phone + PC (D12 routing scenario merge cele 2 UUIDs sub un singur `auth.uid` post-migration).

**Phase 2 SMTP RESOLVED 2026-05-06 morning ACASĂ:** Magic Link end-to-end functional — custom SMTP email send via Firebase Functions equivalent + magic link token exchange flow. 35 sub-decisions §56.13.X auto-retry 3x preserved (network failures + HTTP 5xx eventually succeeds retry attempt 3 transient failures, tests `auth-wiring.test.js` §56.13.1). ADR 007 §AMENDMENT 2026-05-02 `database.rules.json` LANDED gated Auth migration (anti-recurrence "single-user rules deployed before auth wiring → broken state").

**Phase 3 OAuth Google secondary (Sprint 3 PENDING):** Multi-tenant `users/<auth.uid>` namespacing + Anonymous → Auth migration smooth (D12 scenario covered). ADR 019 GDPR k-anonymity validation k=5 minim + 5 quasi-identifiers SSOT + §AMENDMENT 2026-05-02 community channel-agnostic preserved. ADR 021 Calibration Drift Reconciliation Version Vector Max-Merge foundation pentru multi-device sync post-Auth (EC-5 Anonymous → Auth migration scenario covered).

## Verbatim quotes Daniel

Daniel verbatim §56.13.1 auto-retry 3x resilience rationale:
> *"sendMagicLink — §56.13.1 auto-retry 3x: retries up to 3x on network error then surfaces failure + retries on HTTP 5xx then surfaces last error + eventually succeeds on retry attempt 3 after transient failures."*

Daniel verbatim ZERO password V1 anti-password-fatigue rationale:
> *"ZERO password V1. Anti-password-fatigue + GDPR k-anonymity k=5 minim quasi-identifiers SSOT. Anonymous → Auth migration smooth (D12 routing)."*

Daniel verbatim ADR 002 REST not SDK preserved invariant:
> *"Firebase Auth REST API direct. ADR 002 firebase-rest-not-sdk LOCK V1 paradigm preserved. Bundle 50KB vs 200KB SDK."*

Daniel verbatim D12 routing 2 anonymous accounts pre-launch test:
> *"folosesc 2 anonymous accounts pre-launch (phone + PC) — testez deja scenariu. Anonymous → Auth migration smooth D12 routing."*

Daniel verbatim Phase 2 SMTP COMPLETE 2026-05-06 morning rationale:
> *"Magic Link SMTP COMPLETE end-to-end. ZERO password V1. Auth Phase 2 RESOLVED."*

## Bugatti framing notes

**Gigel test relevance cross-feature:** Magic Link flow "Email → Click link → In" = zero gândire user (NU password remember). Anti-password-fatigue mainstream pattern proven (Slack + Notion + Medium). Gigel test PASS.

**Quality > Speed via REST direct NU SDK:** ADR 002 LOCK V1 paradigm preserved cross-phase (bundle 50KB vs 200KB). Anti-vendor-lock-in pattern + selective scoping per endpoint Firebase Auth REST API.

**Anti-RE considerations cross-phase:** ADR 007 §AMENDMENT 2026-05-02 `database.rules.json` LANDED GATED Auth migration = anti-recurrence "single-user rules deployed before auth wiring → broken state". Auto-retry 3x §56.13.1 = anti-transient-failure pattern.

**Anti-paternalism notes:** ZERO password V1 = anti-paternalism (NU forced password complexity rules). Anonymous → Auth migration optional NU mandatory. User decides upgrade path. SUFLET F2 alignment cross-feature.

**Voice tone notes:** Daniel-isms "anti-password-fatigue" + "ZERO password V1" recurring patterns (UX cognitive load discipline). Anonymous-first preserved cross-phase.

## Cross-refs raw layer

- [[../../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 BATCH 1-6 + Auth Phase 2 RESOLVED 2026-05-06
- [[../../03-decisions/002-firebase-rest-not-sdk]] §AMENDMENT 2026-05-02 Auth migration prerequisite REST not SDK preserved
- [[../../03-decisions/007-firebase-open-rules]] §AMENDMENT 2026-05-02 `database.rules.json` LANDED gated
- [[../../03-decisions/019-gdpr-k-anonymity-validation]] k=5 minim 5 quasi-identifiers SSOT + §AMENDMENT 2026-05-02
- [[../../03-decisions/021-calibration-drift-reconciliation]] EC-5 Anonymous → Auth migration scenario foundation
- [[../../04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC]] §Goal + §Schema migration BEFORE→AFTER + §Sprint 3
- [[../../src/__tests__/auth-wiring.test.js]] §56.13.1 auto-retry 3x tests preserved
- [[../../06-sessions-log/HANDOVER_AUTH_FLOW_*]] §56.13.X 35 sub-decisions Phase 2 RESOLVED
- [[../../03-decisions/DECISION_LOG]] §2026-05-06 morning Auth Phase 2 SMTP COMPLETE entry

🦫 **Auth Flow holistic Phase 1 Anonymous + Phase 2 SMTP RESOLVED 2026-05-06 + Phase 3 OAuth PENDING Sprint 3. ZERO password V1 anti-password-fatigue. ADR 002 REST not SDK preserved cross-phase. Anonymous → Auth migration D12 scenario covered. Multi-device sync foundation ADR 021 Version Vector Max-Merge.**
