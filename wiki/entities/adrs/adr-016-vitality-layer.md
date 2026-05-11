---
title: ADR 016 — Vitality Layer
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-27
authority: 03-decisions/016-vitality-layer.md raw layer §Decision (Vitality Layer dimensiune nouă engine plugged in via ADR 018 patterns + 8 componente — 6 behavioral proxy questions + scoring + reconciliation Profile Typing + tier gating T2+ + storage + plugin arhitectură ADR 018 + feature flag rollout)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-014-onboarding-profile-typing]]"
  - "[[adr-013-auto-aggression-detection]]"
  - "[[adr-017-demographic-prior-database]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-009-calibration-tiers]]"
  - "[[../../concepts/gigel-test]]"
amendments: []
---

# ADR 016 — Vitality Layer

## Synthesis

ADR 016 = decision **Vitality Layer** dimensiune nouă engine plugged-in via ADR 018 plugin patterns. Original LOCK V1 2026-04-27. Trigger: lipsa unei dimensiuni `state-of-being` produce concrete failures — AA detection oarbă la condiția de bază (user energie cronic scăzută + somn slab + stres ridicat are prag "auto-agresivitate" calibrat identic cu user în formă perfectă) + Profile Typing one-dimensional (Sprinter motivație înaltă + recovery rapid Daniel sănătos ≠ Sprinter motivație fluctuantă post-burnout) + Bloodwork OUT (Gigel filter — Daniel respins explicit DECISION_LOG 2026-04-26 privacy panic + scope creep medical + liability legal) + Cold-start state-blind (ADR 009 cold-start session usese age + experience fără signal pe energy/sleep/recovery). Soluția: set scurt **behavioral proxy questions opt-in** Gigel-friendly produc signal state-of-being. NU bloodwork. NU clinical. Combinate cu demographic data (age, kg, height, BMI) → context state calibrare engine. 8 componente: (1) Scope 6 întrebări behavioral proxy areas (Energie + Sleep quality + Stres cognitiv + Motivație + Reactivitate + Inflamație) — wording RO casual ordinal 4 opțiuni a→d (4→1 scor), (2) Scoring composite, (3) Reconciliation cu Profile Typing ADR 014, (4) Tier gating T2+ (cross-ref ADR 009 calibration_confidence), (5) Storage CDL extension, (6) Plugin arhitectură ADR 018 Dimension Registry, (7) Feature flag rollout 10%/50%/100%, (8) UI banner "Vitality check-in". Working title final: **"Vitality Layer"** (captures holistic intent energy + mood + sleep + stress + motivation + recovery, warm enough UI labels, short pentru cod `dimensions/vitality.js`). **NU spec implementabil.** Spec EXEC_QUEUE post-acceptance. Dependency: ADR 018 ACCEPTED 2026-04-27 foundation plugin.

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-04-27 sesiune INSIGHTS_BACKLOG ADR 016 articulation seminal:

> *"intrebari scurte despre user — cum te simti, energic/normal, temperamental, dormi bine, etc. Combinat cu age+kg+height+BMI ne indică direcția approximativ. Behavioral proxy questions = signal puternic, friction zero."*

(Context: Daniel articulation Vitality Layer concept inception — behavioral proxy NU bloodwork, friction zero opt-in, Gigel-friendly RO casual wording.)

Daniel verbatim chat strategic 2026-04-26 Bloodwork OUT explicit (cross-ref DECISION_LOG):

> *"NU bloodwork. Privacy panic Gigel filter. Scope creep medical. Liability legal. Out definitiv."*

(Context: Bloodwork integration respins explicit Daniel chat strategic — Vitality Layer behavioral proxy = subiacent need rămâne validă fără medical scope creep.)

Daniel articulation chat strategic universal Gigel-friendly wording rules (cross-ref ADR 013 + ADR 014):

> *"NU jargon medical. Test mental — cum reacționează un mecanic 45 ani non-tech? 4 opțiuni ordinale per întrebare, NU paragrafe libere."*

## Bugatti framing notes

**Gigel test relevance CRITICAL:** Vitality questions wording Gigel-friendly RO casual — "Te trezești odihnit?" NU "Câte ore dormi?" NU "Ai apnee de somn?". Behavioral proxy proxy phenomenological, NU clinical. Test mental constant: "Cum reacționează mecanic 45 ani non-tech?" Sample wording Q1 "Energic — am chef și putere" vs "Epuizat — aproape mereu fără energie" (ordinal 4→1 scor).

**Quality > Speed via opt-in friction-zero:** Skip mid-flow OK, parțial fill OK. NU forcing complete survey. Daniel push-back universal scope chat strategic anti-friction (cross-ref [[adr-013-auto-aggression-detection]] §AMENDED 2026-04-30 anti-paternalism ABSOLUTE).

**Anti-RE considerations:** Vitality scoring internal computation, NU user-facing "your vitality score is 14/24". User vede engine adaptations (volume adjustment / DELOAD trigger) NU score exposure. Anti-RE protection state-of-being calibration mechanism.

**Anti-paternalism notes:** Banner "Vitality check-in" opt-in NU forced. User refuses → engine fallback Demographic Prior ADR 017 (cold-start state-blind populated synthetic baseline). NU paternalism "TREBUIE complete profile".

**Voice tone notes:** "Behavioral proxy NU clinical" = SEMINAL Daniel articulation Vitality scope universal. Wording RO casual preserved identity Andura Gigel-friendly Romanian-first.

## Cross-refs raw layer

- [[../../../03-decisions/016-vitality-layer]] §Decision (Vitality Layer adopted) + §1 Scope 6 behavioral proxy areas (Q1-Q6 wording draft) + §Dependency ADR 018
- [[../../../03-decisions/018-engine-extensibility-architecture]] §Decision (Dimension Registry + Standardized Dimension Contract + Decision Cluster Engine + Schema Versioning + Feature Flags foundation Vitality plugin)
- [[../../../03-decisions/014-onboarding-profile-typing]] §Profile typing reconciliation (Vitality + Profile Typing integration component 3)
- [[../../../03-decisions/013-auto-aggression-detection]] §Decision (AA detection calibration sensitivity Vitality-informed thresholds)
- [[../../../03-decisions/017-demographic-prior-database]] §Decision (Demographic Prior cold-start fallback Vitality NU completed)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Schema (CDL extension Vitality context fields component 5)
- [[../../../03-decisions/009-calibration-tiers]] §Decision (T2+ gating component 4)
- [[../../../05-findings-tracker/INSIGHTS_BACKLOG]] §ADR 016 articulation 2026-04-27
- [[../../../03-decisions/DECISION_LOG]] §2026-04-27 sesiune END entry

🦫 **ADR 016 Vitality Layer LOCK V1 2026-04-27. Behavioral proxy 6 questions Gigel-friendly opt-in. NU bloodwork (Daniel respins explicit privacy panic + scope creep + liability). State-of-being signal complementar AA detection + Profile Typing + Cold-start. Plugin ADR 018 foundation. Spec EXEC_QUEUE post-acceptance pending.**
