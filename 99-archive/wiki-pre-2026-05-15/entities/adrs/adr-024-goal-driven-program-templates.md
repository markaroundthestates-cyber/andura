---
title: ADR 024 — Goal-Driven Program Templates (5 V1 + Q1-Q8 LOCKED Engine #2)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-06
authority: 03-decisions/024-goal-driven-program-templates.md SPEC READY V1 Q1-Q8 toate RESOLVED LOCKED + chat strategic 2026-05-04 evening late Cluster 1-5 + 2026-05-06 morning acasă Q6 D Hybrid
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-022-bayesian-nutrition-inference]]"
  - "[[adr-027-engine-energy-adjustment]]"
  - "[[adr-017-demographic-prior-database]]"
amendments: []
---

# ADR 024 — Goal-Driven Program Templates

## Synthesis

ADR 024 = Goal Adaptation Engine #2 pipeline §42.10 (2nd post Periodization). **5 templates V1 LOCKED:** Forță & Dezvoltare + Tonifiere & Definire + Slăbire + Longevitate + Sănătate Generală. Mode modifier (Estetică ↔ Forță) cross-template overlay = 10 perceived UI configs dar 5 logic core. Q1 5 vs 8 templates resolve (LOCKED 5, "8" misnumber legacy §26). Q2 Template variant matrix algorithmic generation (NU 180 hardcoded; ~25 base config × persona modifiers Maria 0.50/Gigica 0.70/Marius 1.00 × goal modifiers). Q3 Hook 1 → Bayesian Nutrition modulate kcal/macro NU override phase. Q4 Phase auto-detection thresholds CUT 0.82/CUT aggressive 0.75/BULK 1.08/BULK aggressive 1.15/MAINTAIN/RECOMP ±2%/DELOAD +3-5% (NU user pick phase, prevents gaming). Q5 RECOMP sub-state în Tonifiere/Slăbire NU template separate. Q6 D Hybrid Goal Shift = tier global preserve + template-specific signals soft-reset + 2-session calibration window + streak RESET + phase re-derive. Q7 3 tiers push-back proporțional cu risc (Tier 1 silent / Tier 2 banner / Tier 3 modal opt-in). Q8 Re-prompt 28d rolling + 21d cooldown post-confirm + 60d post Goal Shift + cap 4/an.

Engine = pure function `goalAdaptationEngine.evaluate(ctx) → GoalAdaptationResult` extending DimensionResult per ADR 018. Implementation `src/engine/goalAdaptation/` Faza 2.5 batch 2 LANDED. Big 6 lifecycle: Goal EDITABIL (5 templates choice + Goal Shift §36.35 cu calibration cost) + Phase IMUTABIL (sys.js calculează BF% + sezon, read-only) + Mode EDITABIL (toggle UI fără calibration cost).

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-05-06 morning acasă Q6 LOCK V1 D Hybrid rationale (Bugatti reality check):
> *"Q6 = decizie arhitecturală future-proofing post-Beta useri reali, NU urgent acum. App NU are useri, 3 sesiuni de ale mele logate."*

Daniel verbatim SUFLET F2 alignment Q7 push-back proporțional:
> *"AI-ul informează, nu impune. Tier 3 modal = max conservative modifiers, NU absolute refuse. User keeps autonomy. Te-am observat pattern X, recomand path Y, dar tu decizi."*

Daniel verbatim Q2 algorithmic generation rationale anti-180-hardcoded:
> *"180 hardcoded = ship NEVER + hallucination risk femeie 75+ Forță advanced ZERO literature. Algorithmic compose ~25 base × persona modifiers preserves Bugatti craft unde contează, smart trade-offs unde NU."*

## Bugatti framing notes

**Gigel test relevance:** User picks template din 5 (cu Mode overlay) = visual intuitive. Phase auto-detection invisible = zero gândire user. Goal Shift modal cu calibration cost transparent (NU silent).

**Quality > Speed via algorithmic generation:** ~25 base config + runtime modifiers preserves craft unde contează (persona-specific signals), smart trade-offs unde NU (no 180 hardcoded permutations).

**Anti-RE considerations:** Q6 D Hybrid Reversibility note — amendment când useri reali post-Beta dau signal contradictoriu (2-session window prea scurt/lung). Pattern: ship V1 LOCKED + monitor post-Beta signal.

**Anti-paternalism notes:** Tier 1 silent → Tier 2 banner → Tier 3 modal opt-in escalation respects user agency. NU absolute refuse. SUFLET F2 "AI-ul informează nu impune" alignment.

**Voice tone notes:** Daniel-ism *"app NU are useri, 3 sesiuni de ale mele logate"* — reality check anti-overengineering pattern. Defer post-Beta calibration validation NU pre-launch theoretical optimization.

## Cross-refs raw layer

- [[../../../03-decisions/024-goal-driven-program-templates]] §2 Q1-Q8 LOCKED V1 verbatim
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 + §9.X canonical
- [[../../../03-decisions/018-engine-extensibility-architecture]] §2 Dimension Registry Constraint Object
- [[../../../03-decisions/022-bayesian-nutrition-inference]] Hook 1 cross-engine kcal/macro modulate
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §26 + §26.5 + §36.35 + §36.92 D4 + §36.100 Engine #2 + §36.102
- [[../../../📤_outbox/_archive/2026-05/142_HANDOVER_2026-05-04_evening_late_periodization_goal_adaptation_CONSUMED]] Q1-Q5 + Q7-Q8 source
- [[../../../📤_outbox/_archive/2026-05/177_HANDOVER_2026-05-06_morning_SMTP_COMPLETE_SETTINGS_UX_Q6_LOCK_CONSUMED]] Q6 D Hybrid source
- [[../../../src/engine/goalAdaptation/]] V1 LANDED Faza 2.5 batch 2

🦫 **ADR 024 SPEC READY V1 LOCKED 2026-05-06. Engine #2 Goal Adaptation pipeline §42.10 2nd. 5 templates + Mode overlay + phase auto-detection + Q1-Q8 RESOLVED. Reversibil post-Beta useri reali signal.**
