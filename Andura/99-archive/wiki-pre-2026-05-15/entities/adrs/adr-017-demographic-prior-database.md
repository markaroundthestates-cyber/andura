---
title: ADR 017 — Demographic Prior Database
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-27
authority: 03-decisions/017-demographic-prior-database.md raw layer §Decision (Demographic Prior Database dimensiune nouă engine + 500 profile synthetic × 90 zile sesiuni + lifecycle build phase only)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-016-vitality-layer]]"
  - "[[adr-014-onboarding-profile-typing]]"
  - "[[adr-009-calibration-tiers]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[../../concepts/moat-strategy]]"
amendments: []
---

# ADR 017 — Demographic Prior Database

## Synthesis

ADR 017 = decision **Demographic Prior Database** dimensiune nouă engine build pe ADR 018 plugin patterns. Original LOCK V1 2026-04-27. Trigger: Andura engine cold-start (T0 COLD_START per ADR 009) operează cu signal minim (doar onboarding age, sex, kg, height, BMI, equipment + Profile Typing self-report dacă completed). Engine NU cunoaște user-ul personal. **Memory rule #25 + DECISION_LOG sesiune END 27 apr:** T0 skip onboarding = engine generic + demographic prior din synthetic + T1+ Profile Typing override demographic prior + Self-selection feature NOT bug. Decision: **500 profile synthetic × 90 zile sesiuni synthetic = lookup database**. Profile mix: ~50 manually crafted personas (Daniel HR 36 / Gigel mecanic 45 / Ana educatoare 55 / Iasmina OF 18 / Marius office 28 / Elena mama 35 / etc.) + ~450 algorithmic generated cu variație controlată (age × sex × kg × height × job × lifestyle × goal). Storage: local fixtures generated runtime în memory. **NU permanent.** Cost $0. **Lifecycle build phase only — la launch NU mai avem nevoie** (synthetic data NU contaminează Firebase, NU consumă storage permanent — post 100+ users reali, real behavioral data deplasează demographic prior). La cold start engine consultă K-nearest profile similar (age × sex × kg × height × BMI × job × lifestyle × goal) → aggregate behavioral signal → personalizat aproximativ încă din sesiunea 1. **11 dimensiuni profile schema** continuous (age 16-75, kg 40-150, height 150-200, bmi computed) + categorical (sex M/F, job sedentary/office/standing/manual_light/manual_heavy/shift_irregular, lifestyle low/moderate/active/very_active, goal aesthetic/strength/general_health/weight_loss/rehab/performance, training_history none/beginner/intermediate/advanced, equipment array, time_availability limited/moderate/flexible). 8 componente structurale + plugin arhitectură aliniat ADR 018 + lifecycle declaration. **NU spec implementabil.** Spec EXEC_QUEUE post-acceptance.

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-04-27 DECISION_LOG sesiune END Decision 5 seminal articulation:

> *"synthetic 500 profile × 90 zile = Demographic Prior Database. Profile mix: ~50 manually crafted (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.) + ~450 algorithmic generated cu variație controlată (age × sex × kg × height × job × lifestyle × goal). Storage: local fixtures generated runtime în memory. NU permanent. Cost $0. Lifecycle build phase only — la launch nu mai avem nevoie."*

Daniel verbatim chat strategic 2026-04-27 lifecycle insight cruciale post-launch:

> *"la launch nu mai avem nevoie de profilele de test... se sterg si firebase ramane gol... ma rog cu mine in el."*

(Context: Lifecycle declaration absolut — demographic prior = production infrastructure build phase + early launch. Post-100+ users reali, real behavioral data deplasează. Synthetic data NU contaminează Firebase storage permanent.)

Daniel articulation chat strategic 2026-04-26 Bloodwork OUT (cross-ref ADR 016):

> *"NU bloodwork. Privacy panic Gigel filter. Scope creep medical. Liability legal. Out definitiv."*

(Context: Bloodwork DEFINITIV OUT — Demographic Prior = signal cold-start alt path fără medical scope.)

Daniel articulation chat strategic universal scope persona naming (cross-ref [[../../concepts/andura-suflet]] + [[../../concepts/moat-strategy]]):

> *"Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35. Crafted personas reale. Romanian-first identity."*

## Bugatti framing notes

**Gigel test relevance CRITICAL:** Crafted personas "Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35" = identity Andura Romanian-first preserved (NU "user_001" / "user_002" generic). 11 dimensiuni profile capture demographic realism RO context.

**Quality > Speed via lifecycle build phase only:** Synthetic data ZERO permanent storage cost ($0 deployment infrastructure) + ZERO Firebase contamination + auto-discard post 100+ users reali. Bugatti craft pragmatic — NU over-engineer production database synthetic eternal.

**Anti-RE considerations:** K-nearest matching internal (age × sex × kg × height × BMI × job × lifestyle × goal), NU exposure user-side. User vede engine adaptations day 1, NU "this is your closest synthetic match". Anti-RE protection.

**Anti-paternalism notes:** Self-selection = feature NOT bug. T0 skip onboarding = acceptable (engine generic + demographic prior fallback), T1+ Profile Typing override când user signal disponibil. NU forcing complete onboarding paternalism.

**Voice tone notes:** "ma rog cu mine in el" = Daniel-ism humor preserved verbatim — synthetic data discard post-launch, Firebase rămâne gol initial cu Daniel (single-user Phase 1). Identity Andura voice fidelity §1.

## Cross-refs raw layer

- [[../../../03-decisions/017-demographic-prior-database]] §Decision (Demographic Prior adopted) + §1 Profile schema 11 dimensiuni + §Lifecycle build phase only
- [[../../../03-decisions/018-engine-extensibility-architecture]] §Decision (Dimension Registry + plugin foundation Demographic Prior)
- [[../../../03-decisions/016-vitality-layer]] §Decision (Vitality T2+ override Demographic Prior per user)
- [[../../../03-decisions/014-onboarding-profile-typing]] §Profile Typing override demographic prior T1+
- [[../../../03-decisions/009-calibration-tiers]] §Decision (T0 COLD_START = active singular dimensiune Demographic Prior)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Schema (CDL read-only context source — NU scrie outcome)
- [[../../../01-vision/MOAT_STRATEGY]] (Romanian-first identity + crafted personas DNA preserved)
- [[../../../05-findings-tracker/INSIGHTS_BACKLOG]] §ADR 017 articulation 2026-04-27
- [[../../../03-decisions/DECISION_LOG]] §2026-04-27 sesiune END Decision 5

🦫 **ADR 017 Demographic Prior Database LOCK V1 2026-04-27. 500 synthetic profile (50 crafted Romanian-first identity + 450 algorithmic variație controlată) × 90 zile sesiuni cold-start signal source. Lifecycle build phase only $0 cost zero Firebase contamination. Self-selection feature NOT bug. ma rog cu mine in el Daniel-ism preserved.**
