---
title: ADR Smart Routing Equipment v1 (Tier-Aware Filtering + Similarity Ranking + Anti-Paternalism Skip)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md LOCKED V1 per ALIGNMENT_QUESTIONS Q3 Daniel response BATCH_05 final Sprint 4.x cluster
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-025-andura-gandeste-pentru-user]]"
  - "[[adr-pain-discomfort-button]]"
  - "[[adr-011-coach-decision-log-architecture]]"
amendments: []
---

# ADR Smart Routing Equipment v1

## Synthesis

ADR_SMART_ROUTING_EQUIPMENT = Tier-aware filtering + similarity ranking + anti-paternalism skip pentru exercise substitution în 3 situații regulate sală: (1) "Aparat ocupat" (banal — alți useri folosesc), (2) "Aparat lipsă" (sala specifică nu are standard), (3) "Aparat defect" (rar). Existing apps (Fitbod, Hevy) oferă substituții generice — recomandă orice exercițiu same grupă musculară. Pentru **Tier 1 forță** (e.g., Bench Press), substituție lateral generic (e.g., Lateral Raise) = INFERIOR functional outcome. Origine §36.37 Chat C SELF-CORRECTION EXTENSION + §36.36 Schema Extension.

**Tier-aware alternative filtering:**
| Tier | Filtering rule |
|------|----------------|
| **Tier 1 (forță compound)** | Alternatives DOAR cu `force_demand: 'high'` (strict match) |
| **Tier 2 (hipertrofie isolation)** | Alternatives cu același `muscle_target_primary` (flexibility ridicată) |
| **Tier 3 (accesorii)** | Idem Tier 2 (muscle target match) |

**Schema dependency §36.36:** each exercise în library are `equipment_type` + `equipment_alternatives` + `force_demand` + `tier` + `muscle_target_primary` + `muscle_target_secondary`. Implemented `src/schema/exerciseMetadata.js` BATCH_03.

**Similarity ranking aggregated score:** +3 dacă same `muscle_target_primary` / +2 dacă same `force_demand` / +1 dacă same `equipment_type`. Highest-score alternative surfaced first; user alege final.

**Anti-paternalism: skip exercise default behavior dacă zero valid alternatives** (e.g., Tier 1 compound cu echipament unic la sala asta): **skip exercise propose** (NU forțezi substituție inferior). Exemple: Bench Press lipsă + DB lipsă → skip *"Bench Press today, propose alternative session structure"* (NU forțezi Push-Up cu RPE 10).

## Verbatim quotes Daniel

Daniel verbatim Q3 ALIGNMENT response Tier-aware filtering rationale:
> *"Tier 1 forță compound = alternatives DOAR force_demand 'high' strict match. NU lateral raise pentru bench press absent. Lateral generic = INFERIOR functional outcome pentru forță împingere orizontală."*

Daniel verbatim anti-paternalism skip exercise rationale:
> *"Bench Press lipsă + DB lipsă → skip propose alternative session structure. NU forțezi Push-Up cu RPE 10. Anti-paternalism preserved."*

Daniel verbatim BATCH 2 SLICE 2 equipmentSwap.js port LANDED rationale (mockup V2 SoT):
> *"Free-text fallback per mockup §equipment-swap fired post smart-routing engine ZERO valid alternatives. UI fallback only, NU engine touch. Coach swap interpretation DEFERRED V2 mockup verbatim 'Caut swap echivalent...' analogous Altceva pattern painButton."*

## Bugatti framing notes

**Gigel test relevance:** Skip exercise propose alternative session structure = anti-paternalism (NU forced inferior substitute). User-facing wording propose, NU prescribe.

**Quality > Speed via Tier-aware strict matching:** Tier 1 strict `force_demand: 'high'` vs Tier 2 flexible muscle target = NU same filtering cross-tier. Anti-generic-substitution preserved.

**Anti-RE considerations:** Pattern V1 LANDED via BATCH 2 SLICE 2 commit `c5e7288` equipmentSwap.js port — engine contract `src/engine/smart-routing/` LOCK V1 preserved orthogonal, UI fallback only. Coach swap interpretation DEFERRED V2 same scope ca Altceva pain note (anti-scope-creep V1 discipline).

**Anti-paternalism notes:** Skip exercise = anti-paternalism core principle. ADR 025 graceful degradation alignment (engine pre-fills default safe path când zero valid alternatives). User can accept skip OR override via Altceva free-text.

**Voice tone notes:** Daniel-ism "anti-paternalism preserved" recurring pattern (SUFLET F2 + R17 User Agency foundation). Pattern: engine propose + user decides, NU engine forces.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1]] §Decision Tier-aware + similarity ranking + skip verbatim
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.37 (origin) + §36.36 Schema Extension
- [[../../../03-decisions/018-engine-extensibility-architecture]] §1 Dimension Registry plug-in additive
- [[../../../03-decisions/025-andura-gandeste-pentru-user]] graceful degradation engine pre-fills default alignment
- [[../../../03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1]] §9.4.6 Pain-Aware Clean Signal rule cross-ref
- [[../../../03-decisions/011-coach-decision-log-architecture]] CDL swap log audit
- [[../../../src/schema/exerciseMetadata.js]] BATCH_03 implementation schema canonical (`equipment_type` + `force_demand` + `tier` + `muscle_target_*`)
- [[../../../src/engine/smart-routing/]] V1 engine contract LOCK preserved orthogonal
- [[../../../src/pages/coach/equipmentSwap.js]] V1 LANDED BATCH 2 SLICE 2 commit `c5e7288` (mockup §equipment-swap V2 SoT free-text fallback)

🦫 **ADR Smart Routing Equipment LOCKED V1 2026-05-02. Tier-aware filtering (Tier 1 strict force_demand + Tier 2/3 muscle target) + similarity ranking (+3/+2/+1) + anti-paternalism skip default zero alternatives. UI fallback equipmentSwap.js LANDED engine orthogonal.**
