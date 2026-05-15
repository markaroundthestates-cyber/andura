---
title: F4 — Readiness Verdict + Score (Engine readiness.js Compute + UI Display)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F4"
  - "[[../engines/engine-readiness]]"
  - "[[../adrs/adr-027-engine-energy-adjustment]]"
  - "[[../adrs/adr-018-engine-extensibility-architecture]]"
---

# F4 — Readiness Verdict + Score

## Synthesis

**F4 Readiness Verdict + Score** = core coach value pre-session pre-set decision. V1 prod `getTodayReadiness` + `getReadinessVerdict` + `READINESS_LABELS` engine `readiness.js` compute score + UI display verdict label + numeric. V1_AUDIT verdict **KEEP verbatim** — "Ești gata azi: ✅ Verde / 🟡 Galben / 🔴 Roșu" simple + actionable Gigel-friendly. Engine deja pure functions ADR 018 §2 contract preserved.

**UX surface mockup V2:** Verdict card prominentă în Antrenor idle pre-session — emoji + label + sub-text 3-line stack. Cross-engine integration [[../engines/engine-readiness]] 5-state emoji (😴 Epuizat / 😕 Obosit / 😐 Normal / 😊 Bine / 🔥 Excelent) thresholds READINESS_PR 85 / HIGH 70 / MED 55 / LOW 40 + score mapping kcal/protein delta yesterday.

**Engine integration downstream:** [[../adrs/adr-027-engine-energy-adjustment]] consume readiness score → asymmetric trigger logic Q7=B UP cumulative N≥3 anti-Sarcastic + DOWN immediate recovery imperative. Tier-aware Q13=B T0=±10% T1+=±15%. BATCH 2 SLICE 1 energyCheck.js port LANDED commit `8a4c39e` 3-state V2 mockup simplified (Excelent/Normal/Obosit) + cause drill 4 cauze 🔴 only.

## Verbatim quotes Daniel

Daniel verbatim §F4 audit keep verbatim core coach value rationale:
> *"Readiness = core coach value. 'Ești gata azi: ✅ Verde / 🟡 Galben / 🔴 Roșu' simple + actionable. Gigel înțelege immediate. Engine deja pure functions ADR 018 §2 contract preserved. Direct port."*

Daniel verbatim cross-engine Energy Adjustment asymmetric trigger anti-Sarcastic UP:
> *"UP +15% requires N≥3 conditions cumulative + Periodization phase gate. NU sarcastic UP Marius 5:1 săpt 4-5. DOWN -15% single trigger immediate — recovery imperative."*

## Bugatti framing notes

**Gigel test relevance:** Emoji + label "Ești gata azi: ✅ Verde" = zero gândire user (recognize traffic light pattern instant). Anti-jargon (NU "Readiness Quotient: 0.85"). Gigel test PASS.

**Quality > Speed via pure functions engine + UI display direct:** Engine compute deterministic (NU NLP runtime per SUFLET §1.1) + UI port verbatim. Pattern: engine separation of concerns preserved ADR 018 §2 contract.

**Anti-RE considerations:** Core coach value preserved invariant cross-V1 → V2 port. NU re-design "readiness questionnaire" elaborate. Direct port keep verdict simple.

**Anti-paternalism notes:** Verdict informează NU impune ("ești 🔴 roșu, NU antrenezi azi"). User agency preserved — decision pe propria răspundere downstream. SUFLET F2 "AI-ul informează, nu impune".

**Voice tone notes:** Daniel-isms "Verde/Galben/Roșu" traffic light vernacular RO preserved. Anti-corporate-jargon (NU "Performance Readiness Index").

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F4 verdict KEEP verbatim
- [[../../../src/engine/readiness.js]] READINESS_PR/HIGH/MED/LOW thresholds + READINESS_LABELS pure functions
- [[../../../src/pages/coach/energyCheck.js]] V2 port LANDED BATCH 2 SLICE 1 commit `8a4c39e`
- [[../../../03-decisions/027-engine-energy-adjustment]] §asymmetric trigger Q7=B + Q13=B tier-aware downstream consume
- [[../../../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract pure functions
- [[../../../04-architecture/mockups/andura-clasic.html]] §antrenor readiness card prominentă V2 SoT
- [[../engines/engine-readiness]] (5-state emoji gauge + score mapping integrated)

🦫 **F4 Readiness Verdict + Score KEEP verbatim. Core coach value pre-session. Engine pure functions readiness.js + UI emoji + label + sub-text 3-line stack. Cross-engine Energy Adjustment asymmetric trigger. Gigel test PASS traffic light pattern.**
