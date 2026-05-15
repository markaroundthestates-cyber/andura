---
title: Onboarding T0 — Big 6 Hard Typing + §AMENDMENT 2026-05-10 setPhaseOverride Auto Template
type: entity-feature
status: locked-v1
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../adrs/adr-014-onboarding-profile-typing]]"
  - "[[../adrs/adr-017-demographic-prior-database]]"
  - "[[../adrs/adr-025-andura-gandeste-pentru-user]]"
---

# Onboarding T0

## Synthesis

**Onboarding T0** = Big 6 hard typing init session new user — 6 input field-uri mandatorii (age + sex + weight + height + BF estimate + goal template choice 5 options Forță/Tonifiere/Slăbire/Longevitate/Sănătate Generală). LOCK V1 per ADR 014 Onboarding Profile Typing + §AMENDMENT 2026-05-10 setPhaseOverride auto template Phase auto-detection per goal choice (CUT/BULK/MAINTAIN/RECOMP per ADR 024 §2.4 Q4 phase auto-detection thresholds).

**UX surface mockup V2:** Onboarding flow 6 screens sequential simple (1 input/screen NU all-at-once form overwhelm) + skip optional avem demographic prior fallback per ADR 017 (Maria 65 / Gigica 35 / Marius 25 anchor personas + 500 synthetic profile 50 crafted Romanian-first + 450 algorithmic × 90 zile lifecycle build phase only). Graceful degradation per ADR 025 — T0 skip = demographic prior fallback (retroactive validation example principiu fondator).

**Engine integration:** [[../adrs/adr-017-demographic-prior-database]] anchor personas Maria/Gigica/Marius template-persona fit testing matrix + cold-start signal pre-90-zile-lifecycle. Cross-engine Goal Adaptation Engine #2 (ADR 024) Q2 algorithmic generation modifiers persona-specific (Maria 0.50 / Gigica 0.70 / Marius 1.00) × goal modifiers (Hipertrofie 1.00 / Forță 0.70 / Recompoziție 0.85 / Longevitate 0.60 / Sănătate Generală 0.50). Big 6 lifecycle Imutabile Phase auto-detection (sys.js BF% + sezon, read-only) + Editabile Goal + Mode toggle.

## Verbatim quotes Daniel

Daniel verbatim Big 6 hard typing T0 rationale ADR 014 LOCK V1:
> *"Big 6 hard T0 onboarding — age + sex + weight + height + BF estimate + goal template choice. 6 input field-uri mandatorii. Skip optional cu demographic prior fallback Maria/Gigica/Marius anchor personas."*

Daniel verbatim §AMENDMENT 2026-05-10 setPhaseOverride auto template rationale:
> *"setPhaseOverride auto template — phase auto-detection per goal choice (CUT/BULK/MAINTAIN/RECOMP). Phase IMUTABIL user read-only per ADR 024 Q4. Goal EDITABIL via Goal Shift §36.35 cu calibration cost."*

Daniel verbatim ADR 025 graceful degradation T0 skip retroactive validation:
> *"T0 skip = demographic prior fallback. Retroactive validation example pattern fondator. Skippable everything + engine pre-fills default + user override optional."*

## Bugatti framing notes

**Gigel test relevance:** 1 input/screen sequential = anti-form-overwhelm Gigel test PASS (NU all-at-once 6-field intimidate). Demographic prior fallback skip optional graceful degradation.

**Quality > Speed via demographic prior database fallback:** Anchor personas Maria/Gigica/Marius enable cold-start NU "wait 90 sessions to know user". Pattern: synthetic profile 500 × 90 zile lifecycle bootstrap engine adaptation pre-real-data.

**Anti-RE considerations:** ADR 014 §AMENDMENT 2026-05-10 setPhaseOverride auto template = anti-recurrence "user picks goal BUT phase NU auto-set". Pattern: derive phase from goal + persona signals automatic.

**Anti-paternalism notes:** Skip optional T0 = ADR 025 graceful degradation principle alignment. Anti-mandatory-completion-gate. SUFLET F2 alignment "AI-ul informează, nu impune" — even at onboarding.

**Voice tone notes:** Daniel-ism "Big 6 hard typing" + "demographic prior fallback" technical vernacular preserved. Romanian-first synthetic profile 50 crafted preserved.

## Cross-refs raw layer

- [[../../../03-decisions/014-onboarding-profile-typing]] Big 6 hard T0 + §AMENDMENT 2026-05-10 setPhaseOverride auto template
- [[../../../03-decisions/017-demographic-prior-database]] 500 synthetic profile (50 crafted Romanian-first + 450 algorithmic) × 90 zile lifecycle build phase only
- [[../../../03-decisions/024-goal-driven-program-templates]] §2.4 Q4 Phase auto-detection thresholds + Big 6 lifecycle Imutabile/Editabile
- [[../../../03-decisions/025-andura-gandeste-pentru-user]] graceful degradation T0 skip retroactive validation pattern
- [[../../../01-vision/ONBOARDING_SSOT_V1]] §1 + §9 Anti-Reflex Protection
- [[../adrs/adr-014-onboarding-profile-typing]] (wiki entity SUB-BATCH 1 cross-ref)
- [[../adrs/adr-017-demographic-prior-database]] (wiki entity SUB-BATCH 2 cross-ref)

🦫 **Onboarding T0 Big 6 hard typing + §AMENDMENT 2026-05-10 setPhaseOverride auto template. Demographic prior fallback Maria/Gigica/Marius anchor personas + 500 synthetic profile × 90 zile lifecycle. ADR 025 graceful degradation skip optional. SUFLET F2 alignment anti-form-overwhelm Gigel test PASS.**
