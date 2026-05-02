# ADR_SMART_ROUTING_EQUIPMENT_v1

**Status:** DRAFT V1 — pending Daniel review pre-LOCK
**Data:** 2026-05-02 (creat în BATCH_05 final Sprint 4.x cluster)
**Origine:** §36.37 Chat C SELF-CORRECTION EXTENSION + §36.36 Schema Extension

---

## Context

User în sală întâlnește situații regulate: "Aparat ocupat" (banal — alți useri folosesc echipamentul), "Aparat lipsă" (sala specifică nu are toate aparatele standard), sau "Aparat defect" (rar). Existing apps (Fitbod, Hevy) oferă substituții generice — recomandă orice exercițiu care lucrează aceeași grupă musculară. Pentru **Tier 1 forță** (e.g., Bench Press), substituție lateral generic (e.g., Lateral Raise) = INFERIOR functional outcome (lateral raise NU substituie bench press pentru forță împingere orizontală).

Soluție: **Tier-aware filtering** + similarity ranking + anti-paternalism skip.

## Decision

### Tier-aware alternative filtering

| Tier | Filtering rule |
|------|----------------|
| **Tier 1 (forță compound)** | Alternatives DOAR cu `force_demand: 'high'` (strict match) |
| **Tier 2 (hipertrofie isolation)** | Alternatives cu același `muscle_target_primary` (flexibility ridicată) |
| **Tier 3 (accesorii)** | Idem Tier 2 (muscle target match) |

**Schema dependency** (§36.36): each exercise în library are `equipment_type` + `equipment_alternatives` + `force_demand` + `tier` + `muscle_target_primary` + `muscle_target_secondary`. Implemented `src/schema/exerciseMetadata.js` BATCH_03.

### Similarity ranking

Alternatives ranked by aggregated similarity score:
- `+3` dacă same `muscle_target_primary`
- `+2` dacă same `force_demand`
- `+1` dacă same `equipment_type`

Highest-score alternative surfaced first; user alege final.

### Anti-paternalism: skip exercise

Default behavior dacă **zero valid alternatives** (e.g., Tier 1 compound cu echipament unic la sala asta): **skip exercise** propose (NU forțezi substituție inferior). Exemple:
- Bench Press lipsă + DB lipsă → skip "Bench Press today, propose alternative session structure" (NU forțezi Push-Up cu RPE 10)
- Squat Rack ocupat extended → propose Leg Press (force_demand: 'high' qualified per Tier 1)

User mereu poate **override** alegerea engine: pick orice substitute manual (logged ca `user_override_smart_routing` pentru audit).

## Consequences

### Positive
- **Functional outcome integrity** pentru Tier 1 forță (NU dilution training stimulus)
- **Universally applicable** — sala home cu DB only se descurcă ok (fewer alternatives, dar same tier filter)
- **Anti-paternalism preserved** — user override = first-class feature
- **Audit trail** — fiecare smart routing decision logged în CDL pentru post-incident analysis

### Negative
- **Schema maintenance overhead** — 26+ exercises require manual audit per metadata field (BATCH_03 conservative defaults; full audit = backlog separat)
- **Cold start** — pentru exerciții lipsă din EXERCISE_METADATA, fallback default (`tier: 2`, `force_demand: 'medium'`) poate suggest substituții suboptimale until manual audit
- **Equipment availability detection** = manual user input (NU automatic — sensor/IoT integration NU în scope V1)

### Neutral
- Implementation skeleton pre-Beta în `src/engine/smart-routing/` (BATCH_04). Wiring în UI Card 3 buttons (Aparat ocupat/lipsă/Disconfort §29.5) pending Sprint UI integration.

## Alternatives considered

1. **Generic substitution (any same-muscle exercise)** — REJECTED: Tier 1 forță necesită equipment match strict; lateral raise pentru bench press = functional regression
2. **User manual selection only (no engine suggestion)** — REJECTED: friction excesivă mid-session (user trebuie să cunoască alternatives valide); Maria 65 NU are knowledge gym-deep
3. **ML-based similarity (embedding distance)** — DEFERRED V2+ (zero training data pre-Beta; Beta cohort 50 users insufficient pentru robust embeddings)
4. **Centralized exercise database external** (e.g., MuscleAndStrength.com API) — REJECTED: dependency externă + licensing risc; metadata privată permitea customization granular

## Cross-refs

- §36.37 Smart-Routing Equipment Detection (HANDOVER_GLOBAL)
- §36.36 Schema Extension (foundation field requirements)
- ADR_RIR_MATRIX_ADAPTIVE (force_demand semantics aliniate cu intensity scoring)
- ADR_PAIN_DISCOMFORT_BUTTON (override pattern shared)
- §29.5 UX Colateral Card 3 buttons (Aparat ocupat/lipsă/Disconfort)
- Implementation: `src/engine/smart-routing/` + `src/schema/exerciseMetadata.js` (BATCH_03+04)
- Tests: `src/engine/smart-routing/__tests__/smartRouting.test.js`

## Reconsideration triggers

1. **Manual exercise metadata audit completed** (post Sprint dedicated audit) → tighten conservative defaults, add force_demand granular gradations (e.g., `medium-high`)
2. **Beta cohort home gym (DB only) > 50% users** → add fallback chain (Tier 1 → Tier 2 with degradation flag) instead of skip
3. **Sensor/IoT equipment availability** (Apple Vision Pro AR, gym partner integration) post V1.1+ → automate detection
4. **F-NEW-1 i18n exerciții RO traduceri** trigger schema extension (lookup via translated name)
