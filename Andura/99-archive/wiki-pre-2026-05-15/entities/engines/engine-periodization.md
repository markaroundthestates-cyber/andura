---
title: Engine Periodization — Long-Term Schedule Generator Pipeline §42.10 1st
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-024-goal-driven-program-templates]]"
  - "[[../adrs/adr-027-engine-energy-adjustment]]"
  - "[[../../../src/engine/periodization/]]"
---

# Engine Periodization — Long-Term Schedule Generator Pipeline §42.10 1st

## Synthesis

**Engine Periodization = pipeline §42.10 1st position** (foundational, post Coach Director orchestrator dispatch). Long-term schedule generator producing Constraint Object Floor/Ceiling Range volume coridor pentru mesocycle (~4 săptămâni) + macrocycle (~12-16 săptămâni) sequence. Implementation `src/engine/periodization/` sub-modules: `constants.js` + `index.js` + `mesocycle.js` + `macrocycle.js` + `crossEngineHooks.js` + `volumeLandmarks.js` + integration tests 84 + macro 28 + meso 37 = 149 tests LANDED Faza 2.5 batch 1.

**Decision domain:** Volume Landmarks Cluster 3 (MEV/MAV/MRV per Israetel + Helms framework adapted Romanian-first vernacular) + sequence linear/undulating per goal template (Forță RIR 1-3/Tonifiere RIR 0-2/Slăbire 1-2/Longevitate 2-3/Sănătate Generală 2-3). Output Constraint Object propagated downstream pipeline — Goal Adaptation §2 (ADR 024) redistribuie volume IN INTERIORUL coridor Floor/Ceiling NU trece peste; Energy Adjustment §3 (ADR 027) fluctuează ±15% session-level NU touch mesocycle phase.

**Persona-aware Volume Landmarks Q19 §45.3 LOCKED:** Maria 65 Dual-Layer functional → Israetel mapping aplicat conservatorism (MEV 60% vs Marius MEV 100% baseline) + Gigica 35 intermediate hibrid + Marius 25 advanced full Israetel framework. RECOMP sub-state newbie effect / detrained return >6w / fat-rich first 12 weeks per ADR 024 Q5.

## Verbatim quotes Daniel

Daniel verbatim Q19 §45.3 Maria 65 Dual-Layer functional Israetel mapping rationale:
> *"Maria 65 Dual-Layer functional → Israetel mapping conservatorism. MEV 60% vs Marius MEV 100% baseline. Persona-aware Volume Landmarks NU one-size-fits-all framework."*

Daniel verbatim Constraint Object immutable propagated pipeline §42.10 §1.10 LOCKED:
> *"Periodization §1 generează coridor Floor + Ceiling baseline → Goal Adaptation §2 redistribuie în interior, NU trece peste. Constraint Object immutable propagated. Single source of truth phase auto-derived."*

## Bugatti framing notes

**Gigel test relevance:** Periodization internal engine — surface UI = program template card cu phase emoji discret (CUT/BULK/MAINTAIN/RECOMP/DELOAD). User vede output NU input (Volume Landmarks invisible).

**Quality > Speed via Israetel framework adapted persona-aware:** Battle-tested research foundation + Romanian-first vernacular adaptation Maria/Gigica/Marius distinct. NU one-size-fits-all generic.

**Anti-RE considerations:** Constraint Object immutable propagated = anti-cascade silent (engine downstream NU poate override Floor/Ceiling Range stabilit Periodization). Pattern preserved cross-engine pipeline §42.10 §1.10.

**Anti-paternalism notes:** Phase auto-detection (CUT/BULK etc per ADR 024 Q4) prevents user gaming aggressive CUT permanent. SUFLET F2 alignment — engine informează (phase status read-only UI) NU impune absolute restriction.

**Voice tone notes:** Daniel-ism "coridor" + "Constraint Object" technical vernacular preserved. Romanian-first persona mapping (Dual-Layer functional Maria 65 explicit).

## Cross-refs raw layer

- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.1 + §1.10 Pipeline §42.10 1st canonical SSOT
- [[../../../03-decisions/024-goal-driven-program-templates]] §2.3 Q3 Hook 2 cross-engine consume Constraint Object Floor/Ceiling
- [[../../../03-decisions/027-engine-energy-adjustment]] §pipeline 3rd ±15% NU touch mesocycle phase
- [[../../../03-decisions/032-engine-deload-protocol]] §pipeline 8th cross-engine deload week MRV invariant
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §45.3 Q19 Maria Dual-Layer functional + Volume Landmarks Cluster 3
- [[../../../src/engine/periodization/]] V1 LANDED Faza 2.5 batch 1 + 149 tests
- [[../../../src/engine/periodization/volumeLandmarks.js]] (MEV/MAV/MRV per Israetel adapted persona-aware)

🦫 **Engine Periodization pipeline §42.10 1st foundational. Long-term schedule Floor/Ceiling Range coridor. Israetel framework adapted persona-aware Maria/Gigica/Marius. Constraint Object immutable propagated downstream.**
