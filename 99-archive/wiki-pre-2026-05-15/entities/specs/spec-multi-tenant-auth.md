---
title: Spec Multi-Tenant Auth Migration — Anonymous → Firebase Auth Real Magic Link + OAuth Sprint 3
type: entity-spec
status: draft
last_updated: 2026-05-12
cross_refs:
  - "[[../../../04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC]]"
  - "[[../adrs/adr-multi-tenant-auth]]"
  - "[[../adrs/adr-002-firebase-rest-not-sdk]]"
  - "[[../features/feature-auth-magic-link]]"
---

# Spec Multi-Tenant Auth Migration

## Synthesis

**MULTI_TENANT_AUTH_MIGRATION_SPEC** = technical spec migrate from Anonymous local-first UUID (`localStorage['device-id']`) to Firebase Auth real (Email Magic Link primary + OAuth Google secondary) preserving all existing data without loss while keeping ADR 002 (REST not SDK) intact via Firebase Auth REST API. Status DRAFT spec ready pentru Sprint 3 implementation. Cross-ref AUDIT_5000Q Q-0353 / Q-1053 / Q-1055.

**Schema migration BEFORE → AFTER:** Current state (Sprint 1-2) `firebase.js` paths hardcoded `users/daniel` single-user → AFTER `users/<auth.uid>` multi-tenant namespacing. Anonymous UUID preserved în `localStorage['device-id']` pre-migration backup pentru anonymous → auth.uid merge scenario (D12 routing Daniel 2 anonymous accounts pre-launch phone + PC test).

**Companion ADR:** [[../adrs/adr-multi-tenant-auth]] §AMENDMENT 2026-05-04 BATCH 1-6 LANDED Auth Phase 2 SMTP RESOLVED 2026-05-06 morning + 35 sub-decisions §56.13.X auto-retry 3x. Cross-ref ADR 007 firebase-open-rules §AMENDMENT 2026-05-02 database.rules.json LANDED gated Auth migration + ADR 019 GDPR k-anonymity validation k=5 minim quasi-identifiers SSOT. Feature LANDED [[../features/feature-auth-magic-link]] LOCK V1 ZERO password V1 + auto-retry 3x §56.13.1 network/HTTP 5xx resilience.

## Verbatim quotes Daniel

Daniel verbatim Magic Link primary + OAuth secondary rationale anti-password-fatigue:
> *"Email Magic Link primary + OAuth Google secondary. ZERO password V1. Anti-password-fatigue + GDPR k-anonymity k=5 minim quasi-identifiers SSOT."*

Daniel verbatim D12 routing Anonymous → Auth migration scenario test:
> *"folosesc 2 anonymous accounts pre-launch (phone + PC) — testez deja scenariu. Anonymous → Auth migration smooth (D12 routing). Merge cele 2 UUIDs sub un singur auth.uid ownership."*

Daniel verbatim ADR 002 REST not SDK preserved invariant:
> *"Firebase Auth REST API direct. ADR 002 firebase-rest-not-sdk LOCK V1 paradigm preserved. Bundle 50KB vs 200KB SDK."*

## Bugatti framing notes

**Gigel test relevance:** Magic Link flow "Email → Click link → In" = zero gândire user (NU password remember). Anti-password-fatigue mainstream pattern proven (Slack + Notion + Medium). Gigel test PASS.

**Quality > Speed via REST direct NU SDK:** Bundle 50KB vs 200KB ADR 002 LOCK V1 paradigm preserved. Selective scoping per endpoint Firebase Auth REST API direct.

**Anti-RE considerations:** ADR 007 §AMENDMENT 2026-05-02 database.rules.json LANDED gated Auth migration = anti-recurrence "single-user rules deployed before auth wiring → broken state". Pattern: gate critical infrastructure change cross-ADR dependency.

**Anti-paternalism notes:** ZERO password V1 = anti-paternalism (NU forced password complexity rules). Anonymous → Auth migration optional NU mandatory. User decides upgrade path.

**Voice tone notes:** Daniel-ism "anti-password-fatigue" recurring pattern (UX cognitive load discipline). Anonymous-first preserved cross-feature.

## Cross-refs raw layer

- [[../../../04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC]] §Goal + §Schema migration BEFORE→AFTER + §Sprint 3 implementation
- [[../../../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 BATCH 1-6 + Auth Phase 2 RESOLVED 2026-05-06
- [[../../../03-decisions/002-firebase-rest-not-sdk]] §AMENDMENT 2026-05-02 Auth migration prerequisite REST not SDK preserved
- [[../../../03-decisions/007-firebase-open-rules]] §AMENDMENT 2026-05-02 database.rules.json LANDED gated
- [[../../../03-decisions/019-gdpr-k-anonymity-validation]] k=5 minim 5 quasi-identifiers SSOT + §AMENDMENT 2026-05-02
- [[../../../03-decisions/011-coach-decision-log-architecture]] §AMENDMENT pipeline_event schema CDL audit trail
- [[../../../06-sessions-log/HANDOVER_AUTH_FLOW_*]] §56.13.X 35 sub-decisions Auth Phase 2 RESOLVED

🦫 **Spec Multi-Tenant Auth Migration DRAFT spec Sprint 3 implementation. Anonymous → Firebase Auth Real Magic Link primary + OAuth Google secondary. ZERO password V1 anti-password-fatigue. ADR 002 REST not SDK preserved invariant. Phase 2 RESOLVED 2026-05-06 SMTP COMPLETE.**
