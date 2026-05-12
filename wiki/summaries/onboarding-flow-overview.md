---
title: Onboarding Flow Overview — Big 6 Hard Typing T0 + Demographic Prior + Goal Template Choice 5 V1
type: summary
status: live
last_updated: 2026-05-12
synthesis_scope: onboarding
cross_refs:
  - "[[../entities/adrs/adr-014-onboarding-profile-typing]]"
  - "[[../entities/adrs/adr-017-demographic-prior-database]]"
  - "[[../entities/adrs/adr-025-andura-gandeste-pentru-user]]"
  - "[[../entities/features/feature-onboarding-t0]]"
  - "[[../entities/adrs/adr-024-goal-driven-program-templates]]"
---

# Onboarding Flow Overview

## Synthesis

**Andura Onboarding Flow = Big 6 hard typing T0 init session new user per ADR 014 + 5 templates goal choice V1 per ADR 024 Q1 LOCKED + demographic prior fallback Maria/Gigica/Marius anchor personas per ADR 017 + graceful degradation skip optional per ADR 025 retroactive validation example.

**Big 6 hard typing T0:** 6 input field-uri mandatorii — age + sex + weight + height + BF estimate + goal template choice 5 options (Forță / Tonifiere / Slăbire / Longevitate / Sănătate Generală). Per [[../entities/adrs/adr-014-onboarding-profile-typing]] LOCK V1 + §AMENDMENT 2026-05-10 setPhaseOverride auto template Phase auto-detection per goal choice (CUT/BULK/MAINTAIN/RECOMP per ADR 024 §2.4 Q4 phase auto-detection thresholds).

**UX flow 6 screens sequential simple:** 1 input/screen NU all-at-once form overwhelm (anti-form-overwhelm Gigel test PASS). Pattern: progressive disclosure preserves cognitive load minim cross-screen. Skip optional avem demographic prior fallback per ADR 025 graceful degradation principle ("Skippable everything" + "engine pre-fills default" + "user override optional" 4 elemente core).

**Demographic prior database fallback:** Per [[../entities/adrs/adr-017-demographic-prior-database]] — 500 synthetic profile (50 crafted Romanian-first + 450 algorithmic) × 90 zile lifecycle build phase only. Anchor personas Maria 65 / Gigica 35 / Marius 25 template-persona fit testing matrix + cold-start signal pre-90-zile-lifecycle. Pattern: bootstrap engine adaptation pre-real-data via synthetic profile coverage breadth.

**Cross-engine integration Goal Adaptation Engine #2:** Per [[../entities/adrs/adr-024-goal-driven-program-templates]] Q2 algorithmic generation modifiers persona-specific (Maria 0.50 / Gigica 0.70 / Marius 1.00) × goal modifiers (Hipertrofie 1.00 / Forță 0.70 / Recompoziție 0.85 / Longevitate 0.60 / Sănătate Generală 0.50). Big 6 lifecycle Imutabile Phase auto-detection (sys.js BF% + sezon, read-only) + Editabile Goal + Mode toggle.

**ONBOARDING_SSOT_V1 §1 + §9 Anti-Reflex Protection cross-ref source authority** — guard rails new user pre-burnout pattern.

## Verbatim quotes Daniel

Daniel verbatim Big 6 hard typing T0 ADR 014 LOCK V1:
> *"Big 6 hard T0 onboarding — age + sex + weight + height + BF estimate + goal template choice. 6 input field-uri mandatorii. Skip optional cu demographic prior fallback Maria/Gigica/Marius anchor personas."*

Daniel verbatim §AMENDMENT 2026-05-10 setPhaseOverride auto template:
> *"setPhaseOverride auto template — phase auto-detection per goal choice (CUT/BULK/MAINTAIN/RECOMP). Phase IMUTABIL user read-only per ADR 024 Q4. Goal EDITABIL via Goal Shift §36.35 cu calibration cost."*

Daniel verbatim ADR 025 graceful degradation T0 skip retroactive validation:
> *"T0 skip = demographic prior fallback. Retroactive validation example pattern fondator. Skippable everything + engine pre-fills default + user override optional."*

Daniel verbatim Q2 algorithmic generation rationale anti-180-hardcoded:
> *"180 hardcoded = ship NEVER + hallucination risk femeie 75+ Forță advanced ZERO literature. Algorithmic compose ~25 base × persona modifiers preserves Bugatti craft unde contează, smart trade-offs unde NU."*

Daniel verbatim §36.94 ADR 025 articulation principle fondator retroactiv:
> *"Aplicabilitate: ALL features V1 + V1.5 + V2+ permanent. Mecanism: graceful degradation mandatory + skippable everything + engine-pre-fills-default + user-override-optional."*

## Bugatti framing notes

**Gigel test relevance:** 1 input/screen sequential = anti-form-overwhelm Gigel test PASS (NU all-at-once 6-field intimidate). Demographic prior fallback skip optional graceful degradation pattern.

**Quality > Speed via demographic prior database fallback:** Anchor personas Maria/Gigica/Marius enable cold-start NU "wait 90 sessions to know user". Pattern: synthetic profile 500 × 90 zile lifecycle bootstrap engine adaptation pre-real-data.

**Anti-RE considerations:** ADR 014 §AMENDMENT 2026-05-10 setPhaseOverride auto template = anti-recurrence "user picks goal BUT phase NU auto-set". Pattern: derive phase from goal + persona signals automatic.

**Anti-paternalism notes:** Skip optional T0 = ADR 025 graceful degradation principle alignment. Anti-mandatory-completion-gate. SUFLET F2 alignment "AI-ul informează, nu impune" — even at onboarding. R17 User Agency > Paternalism foundation.

**Voice tone notes:** Daniel-isms "Big 6 hard typing" + "demographic prior fallback" + "skippable everything + engine pre-fills default + user override optional" recurring patterns (Bugatti paradigm peak craft Excel 13 zile origin story preserved).

## Cross-refs raw layer

- [[../../03-decisions/014-onboarding-profile-typing]] Big 6 hard T0 + §AMENDMENT 2026-05-10 setPhaseOverride auto template
- [[../../03-decisions/017-demographic-prior-database]] 500 synthetic profile (50 crafted Romanian-first + 450 algorithmic) × 90 zile lifecycle
- [[../../03-decisions/024-goal-driven-program-templates]] §2.4 Q4 Phase auto-detection thresholds + Big 6 lifecycle + Q2 algorithmic generation
- [[../../03-decisions/025-andura-gandeste-pentru-user]] graceful degradation retroactive validation T0 skip example
- [[../../01-vision/SUFLET_ANDURA]] §F2 "AI-ul informează, nu impune" + R17 User Agency > Paternalism
- [[../../01-vision/ONBOARDING_SSOT_V1]] §1 + §9 Anti-Reflex Protection guard rails new user
- [[../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.94 ADR 025 articulation principle fondator retroactiv
- [[../entities/features/feature-onboarding-t0]] V1 feature LOCK + §AMENDMENT setPhaseOverride implementation cross-ref

🦫 **Onboarding Flow holistic Big 6 hard typing T0 + 5 templates goal choice V1 + demographic prior fallback Maria/Gigica/Marius + graceful degradation skip optional ADR 025 principle fondator retroactiv. 1 input/screen progressive disclosure anti-form-overwhelm Gigel test PASS. Bootstrap engine adaptation pre-real-data via synthetic profile 500.**
