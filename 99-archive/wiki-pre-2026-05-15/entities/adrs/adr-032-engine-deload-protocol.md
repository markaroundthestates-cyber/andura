---
title: ADR 032 — Engine Deload Protocol (Engine 2 Pipeline §42.10)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/032-engine-deload-protocol.md deload engine spec pipeline §42.10 Engine 2
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-027-engine-energy-adjustment]]"
amendments: []
---

# ADR 032 — Engine Deload Protocol

## Synthesis

ADR 032 = Engine Deload Protocol spec. Engine 2 pipeline §42.10 ADR 026 SSOT. LOCK V1 2026-04-30. Trigger hierarchy + duration manager + depth calculator + cross-engine hooks + partialScopeResolver. Detect fatigue accumulated → trigger deload week reduce volume/intensity 40-60% pentru recovery. Sub-modules `src/engine/deload/`: triggerHierarchy + durationManager + depthCalculator + crossEngineHooks + partialScopeResolver. Mockup buguri sweep #1 2026-05-10 FIX 2 Deload variant — `getDeloadBanner(session)` returns banner string when `session._deload` flagged. Antrenor home variant 3rd cream warm card + Heatmap legenda Recuperare (wire pe idle.js port 2026-05-11 BATCH 2 SUB-BATCH 2 idle.js port).

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-04-30 Deload engine rationale:
> *"deload mandatory engine. fatigue accumulated trigger reduce 40-60%. NU optional. Engine 2 pipeline."*

Daniel verbatim chat ACASĂ 2026-05-10 Mockup FIX 2 Deload variant:
> *"deload variant — Antrenor home 3rd cream warm card. Heatmap legenda 'Recuperare'. wire mockup."*

## Bugatti framing notes

**Gigel test relevance:** Deload banner UX = explicit clarity. "Săptămâna de Recuperare" — Gigel knows what's happening, NU surprise low-effort week.

**Quality > Speed via mandatory engine:** Deload protocol NU optional → prevents overtraining cumulative pattern. Anti-recurrence injury risk.

**Voice tone notes:** "Recuperare" în mockup heatmap legend = Gigel-friendly Romanian term (NU "deload" technical Anglo). Coach jargon refactor 2026-05-10 mockup buguri sweep #1.

## Cross-refs raw layer

- [[../../../03-decisions/032-engine-deload-protocol]] (Deload engine spec)
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §42.10 Engine 2
- [[../../../src/engine/deload/]] (sub-modules triggerHierarchy + durationManager + depthCalculator + crossEngineHooks + partialScopeResolver)
- [[../../../src/engine/deload/tests/index.test.js]] (tests deload 39 cases)
- [[../../../04-architecture/mockups/andura-clasic.html]] (post-sweep #1 FIX 2 Deload variant banner)
- [[../../../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-11 BATCH 2 SUB-BATCH 2 idle.js port FIX 2 Deload wire

🦫 **ADR 032 LOCK V1 2026-04-30. Engine 2 Deload Protocol pipeline §42.10. Mandatory engine prevent overtraining. Mockup FIX 2 Deload variant LANDED 2026-05-10.**
