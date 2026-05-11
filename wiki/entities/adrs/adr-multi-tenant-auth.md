---
title: ADR Multi-Tenant Auth v1 (Magic Link + SMTP)
type: entity
subtype: adr
status: amended
locked_date: 2026-04-30
authority: 03-decisions/ADR_MULTI_TENANT_AUTH_v1.md §AMENDMENT 2026-05-04 evening BATCH 1-6 + §AMENDMENT 2026-05-05.7 Big 6 hard T0
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../../concepts/moat-strategy]]"
  - "[[../specs/spec-multi-tenant-auth]]"
amendments:
  - date: 2026-05-04
    note: §AMENDMENT BATCH 1-6 + 35 sub-decisions resolution Auth Flow §36.80
  - date: 2026-05-05
    note: §AMENDMENT.7 Big 6 hard T0
  - date: 2026-05-06
    note: Auth Phase 2 RESOLVED morning — SMTP Magic Link COMPLETE end-to-end commit landed
---

# ADR Multi-Tenant Auth v1

## Synthesis

ADR_MULTI_TENANT_AUTH_v1 = decision multi-tenant auth architecture Andura cu Magic Link via SMTP (NU OAuth dependency third-party). LOCK V1 2026-04-30 baseline + §AMENDMENT 2026-05-04 evening BATCH 1-6 (35 sub-decisions resolution Auth Flow §36.80 chat strategic resolution) + §AMENDMENT 2026-05-05.7 Big 6 hard T0. Auth Phase 2 RESOLVED 2026-05-06 morning (SMTP Magic Link COMPLETE end-to-end). Auto-retry 3x pattern §56.13.1 (network error + HTTP 5xx + eventually succeeds). DIFF_FLAGS §P1-FLAG-AUTH-PHASE2 flip 🔴 P1 ABSOLUT URGENT → 🟢 RESOLVED. Pattern: Magic Link generation server-side → SMTP delivery → user click → token validate → session create. Sub-decisions BATCH 1-6 spec authority pentru tenant isolation + onboarding T0 + session lifecycle.

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-04-30 → 2026-05-04 evening Auth Flow §36.80 resolution:
> *"magic link via SMTP, NU OAuth third-party dependency. tenant isolation. session lifecycle clean. 35 sub-decisions resolve BATCH 1-6."*

Daniel verbatim chat ACASĂ 2026-05-06 morning Auth Phase 2 RESOLVED:
> *"SMTP magic link complete end-to-end. test live: trimit link, primesc email, click, sesiune. functional."*

Daniel verbatim chat ACASĂ 2026-05-05 §AMENDMENT.7 Big 6 hard T0:
> *"hard T0 onboarding cluster — Big 6 questions LOCK V1. NU mai discussion. ship."*

Daniel verbatim chat ACASĂ 2026-05-04 night ALIGNMENT_QUESTIONS §47 format DEPRECATED:
> *"format pre-fed verbatim raspuns DEPRECATED. search-driven mandatory. Q + search keywords + citation expected + PASS criteria."*

## Bugatti framing notes

**Gigel test relevance:** Magic Link UX = Gigel-friendly. No password complexity. User enter email → receive link → click → in. Simple flow.

**Quality > Speed via end-to-end test 2026-05-06:** Auth Phase 2 RESOLVED end-to-end verify (NU spec-only). DIFF_FLAGS flip 🔴 → 🟢 cu evidence commit + smoke. Bugatti craft = ship + verify.

**Anti-RE considerations:** Auto-retry 3x pattern §56.13.1 = anti-recurrence transient failures (network + HTTP 5xx). Tests existing src/__tests__/auth-wiring.test.js verify retry behavior.

**Anti-paternalism notes:** Auth NU = surveillance. Auth = ownership user data tenant isolation. Multi-tenant architecture = future-proof scaling fără privacy compromise.

**Voice tone notes:** Daniel-ism "magic link via SMTP" simple description. Anti-OAuth dependency framework-side = Andura standalone moat strategy.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 evening BATCH 1-6 + §AMENDMENT.7 Big 6 hard T0
- [[../../../04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC]] (multi-tenant auth migration spec)
- [[../../../06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening]] §56.13.1 auto-retry 3x + §36.80 35 sub-decisions resolution
- [[../../../DIFF_FLAGS]] §P1-FLAG-AUTH-PHASE2 RESOLVED 2026-05-06 morning + §P1-FLAG-AUTH-DANIEL-PREP RESOLVED 2026-05-04 night
- [[../../../src/__tests__/auth-wiring.test.js]] (retry 3x tests §56.13.1)
- [[../../../src/__tests__/auth.test.js]] + [[../../../src/__tests__/auth-batch2.test.js]] (auth + batch2 tests)

🦫 **ADR_MULTI_TENANT_AUTH_v1 LOCK V1 + §AMENDMENT 2026-05-04 BATCH 1-6 + §AMENDMENT.7 + Auth Phase 2 RESOLVED 2026-05-06. Magic Link via SMTP + auto-retry 3x. Tenant isolation.**
