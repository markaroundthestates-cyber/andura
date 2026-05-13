---
title: ADR Smart Routing Equipment v1 → v2 (Tier-Aware Filtering + Cascade Ordered List Pattern + 5 Step Types Canonical)
type: entity
subtype: adr
status: locked-v2
locked_date: 2026-05-13f
supersedes_internal: adr-smart-routing-equipment-v1 LOCK V1 2026-05-02 (preserved historical body sections below)
mandatory_pre_beta: true
mandatory_pre_beta_scope: scope library 600-700 ex Daniel CEO directive verbatim 2026-05-13f "faci handover dar vreau sa prinzi asta obligatoriu. E mandatory pre beta"
authority_raw: 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md LOCK V2 2026-05-13f Co-CTO autonomous chat-current LANDED + 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md LOCK V1 2026-05-02 (supersede chain)
authority: 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md LOCKED V1 per ALIGNMENT_QUESTIONS Q3 Daniel response BATCH_05 final Sprint 4.x cluster
voice_preservation: synthesis + verbatim + bugatti + crossrefs
last_updated: 2026-05-13f
cross_refs:
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-025-andura-gandeste-pentru-user]]"
  - "[[adr-pain-discomfort-button]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[../../summaries/handover-2026-05-13f-bundle-5-adr-v2-strategic-plus-scope-library-600-700-mandatory-pre-beta-lock]]"
amendments:
  - date: 2026-05-13f
    note: Bundle 5 ADR amendment SMART_ROUTING_EQUIPMENT v2 strategic chat dedicat complet — LOCKED V2 LANDED raw layer `03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md` Co-CTO autonomous chat-current 2026-05-13f (post-strategic chat dedicat complete; toate principles Daniel approved tacit; mandatory pre-Beta blocker scope library 600-700 ex). **Cascade ordered list pattern unified LOCKED V1 Daniel principle** verbatim *"Daca am tractiuni si nu pot -> helcometru. Daca nu am helcometru -> assisted pullup machine. Daca nu am -> variatie de exercitii fie 1 exercitiu sau 2"* = 5 step types canonical absorbe ex-Pillar 1 + ex-Pillar 2 separate flat fields (`easier_machine` + `assisted_variant` + `muscle_group_compose 1-2 ex` + `bodyweight` + `light_variant` → implicit step 6 `skip` anti-paternalism v1 preserved). Pre-defined ordered list cascade per exercise în schema, engine traverses cascade până găsește step matching user equipment ownership + capability state real-time. Apply universal toate exerciții library (Co-CTO bias apply singur NU ask N times per *"sper sa nu o mai repet de 1000 ori"*). ADR v2 ~570 LOC + ~25 exemple mapping Co-CTO draft per category (pull/push horizontal/push vertical/legs compound/isolation/core) + 9 Co-CTO decisions motivate inline + revision_history frontmatter rev1→rev2 documented. Pre-flight grep `src/schema/exerciseMetadata.js` surfaced slip §AR.20-cousin RECURRENCE chat-current — V1 library actual 27 exerciții (NU ~60 assumed implicit ADR v2 §2.2 exemple) — Bundle 6.0.x sub-batches mass extension necesar pre-cascade populate. **Andura primary gym-focused paradigm LOCK V1** Daniel verbatim *"daca gigel locuieste in canal sa iasa sa mearga la sala. Andura e primary gym focused"* — bar = standard equipment expected primă treaptă cascade NU substitute artificial Gigel-ridiculous în sală. **Different-exercise-easier light variant semantic LOCK V1** Daniel verbatim *"push-up înlocuit cu kneeling push-up etc"* — NU same-exercise weight-reduced (preserve identity exercise tracking accuracy CDL). ZERO engine module mutation per ADR 026 §9 invariant preserved + ZERO breaking change additive schema. Marius advanced tier PARALLEL modifier 4-gate strict existing carve-out preserved Bundle 5 ADR v2.
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

- [[../../../03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2]] LOCK V2 2026-05-13f cascade ordered list pattern + 5 step types canonical + mandatory pre-Beta scope library 600-700 ex (supersedes v1)
- [[../../../03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1]] §Decision Tier-aware + similarity ranking + skip verbatim (preserved historical, superseded by v2)
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.37 (origin) + §36.36 Schema Extension
- [[../../../03-decisions/018-engine-extensibility-architecture]] §1 Dimension Registry plug-in additive
- [[../../../03-decisions/025-andura-gandeste-pentru-user]] graceful degradation engine pre-fills default alignment
- [[../../../03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1]] §9.4.6 Pain-Aware Clean Signal rule cross-ref
- [[../../../03-decisions/011-coach-decision-log-architecture]] CDL swap log audit
- [[../../../src/schema/exerciseMetadata.js]] BATCH_03 implementation schema canonical (`equipment_type` + `force_demand` + `tier` + `muscle_target_*`)
- [[../../../src/engine/smart-routing/]] V1 engine contract LOCK preserved orthogonal
- [[../../../src/pages/coach/equipmentSwap.js]] V1 LANDED BATCH 2 SLICE 2 commit `c5e7288` (mockup §equipment-swap V2 SoT free-text fallback)

🦫 **ADR Smart Routing Equipment LOCKED V1 2026-05-02. Tier-aware filtering (Tier 1 strict force_demand + Tier 2/3 muscle target) + similarity ranking (+3/+2/+1) + anti-paternalism skip default zero alternatives. UI fallback equipmentSwap.js LANDED engine orthogonal. Post 2026-05-13f: SUPERSEDED de ADR v2 LOCK V2 LANDED raw layer cu cascade ordered list pattern unified + 5 step types canonical + scope library 600-700 ex MANDATORY PRE-BETA.**
