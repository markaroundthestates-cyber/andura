---
title: ADR 001 — Local-First Storage (IndexedDB + Firebase Backup Tier)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/001-local-first-storage.md baseline foundational ADR
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-020-storage-tiering-strategy]]"
  - "[[adr-002-firebase-rest-not-sdk]]"
  - "[[../../concepts/moat-strategy]]"
amendments: []
---

# ADR 001 — Local-First Storage

## Synthesis

ADR 001 = decision local-first storage Andura foundational. IndexedDB primary storage user data (logs + sessions + profile + ratings + cumulative state) + Firebase REST API backup tier (NU SDK direct — vezi ADR 002). Privacy-conscious paradigm: user data NU streamed live to server fără explicit sync. Tier storage strategy 5→6 archive (vezi ADR 020). Differentiator vs competitors (MyFitnessPal cloud-first, Strong subscription gated). Daniel pricing post-Beta NU dependent on cloud storage cost (local-first = free user-side).

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-04-30 ADR 001 foundational rationale:
> *"local-first paradigm. user data în IndexedDB. Firebase backup tier doar. NU cloud-first. privacy-conscious moat."*

Daniel verbatim chat ACASĂ 2026-04-30 differentiator positioning:
> *"competitors cloud-first. user devine produs. noi local-first, user owner data."*

## Bugatti framing notes

**Gigel test relevance:** Local-first = data ownership clear user. NU dependency cloud post-cancel. Gigel can use Andura offline (gym basement no signal scenarios).

**Quality > Speed via privacy-conscious default:** Foundational paradigm decision drive scaling cost low (Beta free + post-Beta pricing fair).

**Anti-RE considerations:** Local-first paradigm enforces cross-ref ADR 002 Firebase REST not SDK + ADR 020 storage tiering 5→6 archive + ADR 019 GDPR k-anonymity validation = aligned stack invariant.

**Voice tone notes:** Privacy-conscious = brand voice differentiator. Romanian-first market scope NU iOS PERMANENT LOCK = unified positioning.

## Cross-refs raw layer

- [[../../../03-decisions/001-local-first-storage]] (foundational ADR baseline)
- [[../../../03-decisions/002-firebase-rest-not-sdk]] (Firebase REST API direct, NU SDK)
- [[../../../03-decisions/020-storage-tiering-strategy]] (tier 5→6 archive)
- [[../../../03-decisions/019-gdpr-k-anonymity-validation]] (GDPR k-anonymity)
- [[../../../03-decisions/006-tier-storage-for-logs]] (tier storage logs)
- [[../../../03-decisions/012-tier-decay-on-inactivity]] (tier decay)
- [[../../../src/storage/]] (IndexedDB implementation modules)

🦫 **ADR 001 LOCK V1 2026-04-30. Local-first storage IndexedDB + Firebase backup tier. Privacy-conscious moat foundational paradigm.**
