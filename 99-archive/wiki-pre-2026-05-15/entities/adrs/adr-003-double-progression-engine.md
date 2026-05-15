---
title: ADR 003 — Double Progression Engine
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-23
authority: 03-decisions/003-double-progression-engine.md raw layer §Decision (5-stage DP engine INIT → SCALE_BACK → CONSOLIDATE → INCREASE → TECHNIQUE/DROP)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-004-rule-engine-numeric-priorities]]"
  - "[[adr-009-calibration-tiers]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[../specs/spec-cognitive-architecture]]"
amendments: []
---

# ADR 003 — Double Progression Engine

## Synthesis

ADR 003 = decision implements 5-stage Double Progression (DP) engine ca core weight recommendation system. Original LOCK V1 2026-04-23. Stages: **INIT** (no history, initial estimation similar exercises) → **SCALE_BACK** (missed reps last session, reduce weight) → **CONSOLIDATE** (hit reps but RIR>2, stay) → **INCREASE** (hit all reps RIR≤2, increase by equipment step) → **TECHNIQUE/DROP** (plateau trigger, change technique). Weight increments equipment-specific (dumbbells 2.5kg / cable stack 2.5kg / barbell 5kg). Engine personalizat real performance history, NU fixed tables. Trade-off: requires minimum 2-3 sessions history meaningful. Cross-exercise fatigue accumulation NOT addressed în DP single-exercise — addressed by RuleEngine ADR 004 + FatigueIndex composite layer. Foundation pentru Coach Decision Log ADR 011 + Calibration Tiers ADR 009 progressive engine activation.

## Verbatim quotes Daniel

Verbatim quotes Daniel: catalog pending raw-layer text limited — synthesis-only entity per voice policy §1 footnote 6 exception. ADR 003 raw foundational 2026-04-23 technical decision pre daniel-isms catalog dense accumulation (chat strategic 2026-04-30+ density). Daniel general verbatim chat strategic 2026-04-29 → 2026-05-11 universal scope DP engine philosophy (cross-ref [[adr-026-offline-coaching-tree]] Q1-Q40 + Engine 8 pipeline §42.10 foundational):

> *"Coach urca/reduce. NU text fields abuse-prone. Buckets prescribed."*

Daniel articulation Anti-RE rule context (cross-ref [[../../concepts/anti-recurrence-rules]]) re text input UX universal applies DP recommendation surfacing:

> *"daca imi zici reps in reserve ma supar"*

(Context: RIR jargon technical user-facing wording filtered Gigel test friendly — DP backend RIR≤2 trigger, UI presents simplified instructions NU jargon.)

## Bugatti framing notes

**Gigel test relevance:** DP engine outputs presented UI-side cu Gigel-friendly wording (Coach urca/reduce semnal user-facing, NU "RIR ≤ 2" technical jargon). Backend RIR threshold technical, frontend Gigel filter applied.

**Quality > Speed via principled system:** 5 stages = adequate granularity recommendation engine fără over-engineering ML approaches. Adaptive personalizat actual performance history, NU population-fixed tables.

**Anti-RE considerations:** DP stages public-facing transparent (user inteligible "scale back / consolidate / increase") = anti-RE neutral. Stage names internal NU expose to user; user vede recommendation rezultat NU stage label.

**Voice tone notes:** Daniel-ism cross-ref "Coach urca/reduce" semnal arbitration layer = preserved identity NU lobotomy RIR jargon.

## Cross-refs raw layer

- [[../../../03-decisions/003-double-progression-engine]] §Decision (5-stage DP) + §Consequences
- [[../../../03-decisions/004-rule-engine-numeric-priorities]] §Decision (rule engine layer above DP)
- [[../../../03-decisions/009-calibration-tiers]] §Decision (DP gated per tier — minimum sessions trigger)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Schema (DP decisions captured CDL)
- [[../../../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1]] §Engine 1 Periodization (DP integration spec)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-23 entry

🦫 **ADR 003 Double Progression Engine LOCK V1 2026-04-23. 5-stage core weight recommendation foundation engine pipeline. Coach urca/reduce semnal Gigel-friendly user-facing wording layered above RIR technical backend.**
