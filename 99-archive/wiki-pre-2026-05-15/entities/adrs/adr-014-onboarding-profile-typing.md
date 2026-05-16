---
title: ADR 014 — Onboarding Profile Typing (Big 6 T0)
type: entity
subtype: adr
status: amended
locked_date: 2026-04-30
authority: 03-decisions/014-onboarding-profile-typing.md ADR + §AMENDMENT 2026-05-05 Big 6 hard T0 + §AMENDMENT 2026-05-10 auto template setPhaseOverride 6th option
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-026-offline-coaching-tree]]"
  - "[[../specs/spec-port-first-step-1]]"
amendments:
  - date: 2026-05-05
    note: Big 6 hard T0 LOCK V1
  - date: 2026-05-10
    note: setPhaseOverride auto template 6th option (ONBOARDING_SSOT_V1 §2 GOAL TAXONOMY V2)
---

# ADR 014 — Onboarding Profile Typing

## Synthesis

ADR 014 = Onboarding Profile Typing strategy. Big 6 T0 questions LOCK V1 (sex + age + weight + height + experience + goal) → profile typing taxonomy → recommended template/phase auto-detection. §AMENDMENT 2026-05-05 hard T0 lock = NU mai discussion, ship. §AMENDMENT 2026-05-10 setPhaseOverride auto template 6th option (post chat ACASĂ continuation Daniel verbatim "auto care selecteaza automat faza recomandata" — slip recovery context: Claude generated grep `1800|2000` în src/ ratând Strategy LOCK V1 Port-First-Then-React Step 1). Auto template = 6th option ONBOARDING_SSOT_V1 §2 GOAL TAXONOMY V2 amendment production-aligned setPhaseOverride() prod. Tests profileTyping 42 cases (src/engine/__tests__/profileTyping.test.js). Cross-ref Workflow antrenament V1 LOCK = Task 23 Cluster #6 Phase 2 (auto-advance pauză + manual edit kg+reps + 3-state ENERGY 🟢🟡🔴).

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-05-11 anti-halucinație context slip catalysator (auto template recovery):
> *"aia cu 2000 kcal e defapt auto care selecteaza automat faza recomandata. ma da nu am discutat toate astea? ce dracu e nevoie sa plang in fiecare chat sa nu mai inventezi informatii false?"*

Daniel verbatim chat ACASĂ 2026-05-05 §AMENDMENT Big 6 hard T0 lock:
> *"hard T0 onboarding cluster — Big 6 questions LOCK V1. NU mai discussion. ship."*

Daniel verbatim chat ACASĂ 2026-05-10 §AMENDMENT setPhaseOverride auto template (post mockup buguri sweep):
> *"auto template — 6th option. setPhaseOverride() in prod. ONBOARDING_SSOT_V1 §2 GOAL TAXONOMY V2 amendment."*

## Bugatti framing notes

**Gigel test relevance:** Big 6 T0 = minimum friction onboarding. Gigel completes 6 questions, profile auto-typed, recommended template/phase displayed. NU 20+ questions overwhelming.

**Quality > Speed via auto template:** 6th option auto = "Marius nu vrea sa aleaga manual phase. Coach decide pentru el." Default sensible based on Big 6 → reduced choice friction.

**Anti-RE considerations:** Slip pattern §AR.1 + §AR.2 pre-flight grep + source-of-truth verify — Claude searched `1800|2000` în src/ presupunând "2000 kcal hardcoded" was prod issue, ratând Daniel previously LOCKED V1 auto template paradigm. Anti-recurrence rule: vault search systematic ÎNAINTE prompt CC.

**Voice tone notes:** Daniel push-back "ce dracu e nevoie sa plang in fiecare chat sa nu mai inventezi informatii false?" + "NU MA MAI INTREBI NIMIC FARA SA VERIFICI" — catalysator pentru anti-halucinație plan + Karpathy Option B Faza 3.

## Cross-refs raw layer

- [[../../../03-decisions/014-onboarding-profile-typing]] §AMENDMENT 2026-05-05 + §AMENDMENT 2026-05-10
- [[../../../01-vision/ONBOARDING_SSOT_V1]] §2 GOAL TAXONOMY V2 amendment 2026-05-10 setPhaseOverride 6th option
- [[../../../03-decisions/024-goal-driven-program-templates]] (program templates)
- [[../../../src/engine/__tests__/profileTyping.test.js]] (42 tests)
- [[../../../src/engine/bayesianNutrition/tests/profileTyping.test.js]] (24 tests)
- [[../../../06-sessions-log/HANDOVER_ONBOARDING_T0_2026-04-30_evening]] (onboarding T0 deep)
- [[../../../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-11 chat ACASĂ Anti-halucinație plan slip context (auto template recovery)

🦫 **ADR 014 LOCK V1 2026-04-30 + §AMENDMENT 2026-05-05 Big 6 hard T0 + §AMENDMENT 2026-05-10 setPhaseOverride auto template 6th option. Onboarding Profile Typing minimum friction.**
