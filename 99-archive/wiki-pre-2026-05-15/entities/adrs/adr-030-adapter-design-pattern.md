---
title: ADR 030 — Adapter Design Pattern (Hexagonal Foundation Faza 3 STRANGLER 7/8 LANDED)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/030-adapter-design-pattern.md D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1 Hexagonal foundation Faza 3 STRANGLER 7/8 LANDED
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../../concepts/moat-strategy]]"
  - "[[adr-026-offline-coaching-tree]]"
amendments: []
---

# ADR 030 — Adapter Design Pattern

## Synthesis

ADR 030 = Adapter Design Pattern adoption pentru Hexagonal architecture foundation Andura. D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1. Faza 3 STRANGLER 7/8 LANDED 2026-05-08 chat unified (Batches 4-7 + 4 themes V2 SSOT compliance LANDED chat-current paralel). Adapter pattern decouples core domain logic engines (pipeline §42.10) from external dependencies (Firebase Auth + IndexedDB + LLM API + UI rendering). Future-proof pentru framework changes (vanilla → React Step 2 + future post-React shifts). Each engine domain logic = port; adapter = framework-specific implementation. Strangler pattern Martin Fowler aplicat pentru gradual migration Faza 3 batches.

**5 D-cluster LOCKED V1:**
- D1 Adapter pattern adoption (vs alternative Dependency Injection direct)
- D2 Port/Adapter naming convention `<Engine>Port` / `<Engine>Adapter`
- D3 Adapter factory bootstrap (init adapter cu env config)
- D4 Adapter test pattern (parity tests `<Engine>ParityTest`)
- D5 Strangler migration sequence (Faza 3 batches 1-8)

**7 Q-OPEN RESOLVED V1:**
- Q1 (RESOLVED) Adapter scope boundary
- Q2 (RESOLVED) Adapter init lazy vs eager
- Q3 (RESOLVED) Adapter error handling layer
- Q4 (RESOLVED) Adapter mock vs real în test
- Q5 (RESOLVED) Adapter cross-engine communication
- Q6 (RESOLVED) Adapter telemetry hook
- Q7 (RESOLVED) Adapter version migration

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-04-30 ADR 030 LOCK V1 rationale:
> *"hexagonal foundation pentru engines auxiliare. adapter pattern decouples framework changes. future-proof."*

Daniel verbatim chat ACASĂ 2026-05-08 chat unified Faza 3 STRANGLER 7/8 LANDED:
> *"Faza 3 STRANGLER batches 4-7 LANDED + 4 themes V2 SSOT compliance LANDED paralel. ~10-12 LOCKED V1 cumulative ~697 → ~707-709."*

Daniel verbatim chat ACASĂ 2026-05-08 Adapter pattern moat positioning:
> *"adapter pattern = moat structural. framework changes cap-coadă, core engines stable."*

## Bugatti framing notes

**Gigel test relevance:** Adapter pattern = structural Bugatti craft. NU surface user. Background discipline pentru future-proof framework migration. Gigel UX surface stays clean.

**Quality > Speed via Strangler:** Gradual migration Faza 3 batches 1-8 instead of big-bang rewrite. Each batch atomic LANDED + parity test verify ZERO regression. Faza 3 STRANGLER 7/8 LANDED 2026-05-08.

**Anti-RE considerations:** Slip pattern observed §AR.1 pre-flight grep filesystem ÎNAINTE reference paths — ADR 030 LOCKED V1 referenced cu fuzzy slug `030-decision-cluster-strangler` în multiple DECISION_LOG entries + RECENT_DECIDED_ARCHIVE (Faza 2C wikilink fix sweep 2026-05-11 14 instances + replace_all). Anti-recurrence rule: canonical slug verbatim cite.

**Anti-paternalism notes:** Adapter pattern = engineer-side discipline, NU user-facing complexity. User experiences simplified UX Gigel-friendly.

**Voice tone notes:** ADR 030 historical naming drift slip catalysator pentru `/wiki-lint` ADR naming refactor 14 instances Faza 2C 2026-05-11. Bugatti craft preserve canonical slugs.

## Cross-refs raw layer

- [[../../../03-decisions/030-adapter-design-pattern]] (D1-D5 LOCKED V1 + Q-OPEN-1→7 RESOLVED V1)
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] (cross-ref pipeline §42.10)
- [[../../../03-decisions/018-engine-extensibility-architecture]] (related ADR 018 extensibility)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-08 chat unified Faza 3 STRANGLER 7/8 LANDED + §2026-05-11 Faza 2C wikilink fix sweep ADR naming refactor
- [[../../../00-index/CURRENT_STATE]] §ACTIVE_ADRS top 3 inclusive ADR 030

🦫 **ADR 030 LOCK V1 2026-04-30. Adapter Design Pattern Hexagonal foundation. D1-D5 LOCKED + Q-OPEN-1→7 RESOLVED V1. Faza 3 STRANGLER 7/8 LANDED 2026-05-08.**
