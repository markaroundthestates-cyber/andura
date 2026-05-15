---
title: Port-First-Then-React Paradigm
type: concept
status: locked-v1
locked_date: 2026-05-10
authority: ADR 005 §AMENDMENT 2026-05-10 REVERT SUPERSEDE post mockup vs prod distincție Daniel screenshot andura.app prod live layout VECHI vs mockup V2 complet diferit
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../concepts/bugatti-craft]]"
  - "[[../concepts/mockup-vs-prod-distinction]]"
  - "[[../entities/adrs/adr-005-vanilla-js]]"
  - "[[../entities/specs/spec-port-first-step-1]]"
  - "[[../entities/specs/spec-react-migration-state-mapping]]"
  - "[[../entities/specs/spec-v1-features-audit]]"
amendments: []
---

# Port-First-Then-React Paradigm

## Synthesis

Port-First-Then-React = strategic ordering LOCK V1 2026-05-10 pentru migration Andura vanilla JS → React. Sequence: **Step 1** port mockup V2 vanilla JS clean state (`feature/v2-vanilla-port` branch) → **Step 2** React migration mecanic mapping post Step 1 validation Daniel Gates smoke andura.app. Paradigm REVERT SUPERSEDE post chat ACASĂ 2026-05-10 când Daniel screenshot andura.app prod live = layout VECHI complet diferit de mockup V2. ~70% Phase 1+2+3+3.5 React work (2026-05-08 → 2026-05-10) degeaba pentru prod app live; ~30% util permanent (LOCKED V1 spec valid + mockup design refined ghid React port). Sub-decisions 7/7 LOCK V1 Co-CTO bias preserved chat-current 2 2026-05-10 Daniel autonomy lock EXTINS scope.

**Sub-decisions LOCK V1:**
- #1 Clean state mockup ÎNTÂI (Bugatti SoT clean port single)
- #2 Structural restructure cap-coadă (port-once Daniel-only env)
- #3 Option B Structural rewrite per mockup
- #4 Selective port driven V1_FEATURES_AUDIT_V1 (carry value subset)
- #5 NEW branch `feature/v2-vanilla-port`
- #6 Vitest 2732 PASS preserved (post-strip baseline) + extend
- #7 Option B Preserve frozen mockup post-port (SoT continuity Step 1 → Step 2 React → future themes)

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-05-10 mockup vs prod distincție screenshot moment:
> *"ba ce dracu faci? Ai o aplicatie in productie care e vanila. Ai un mock 30% functional nemigrat si ne nimic... si tu cauti 1800 sau 2000 kcal? Si ma mai si intrebi pe mine inutil ce sa faci. Pe bune exact stilul hai sa punem acoperisul inainte sa punem peretii."*

Daniel verbatim chat ACASĂ 2026-05-10 continuation 2 autonomy lock EXTINS Co-CTO scope post-noapte:
> *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."*

Daniel verbatim chat ACASĂ 2026-05-10 Phase 3.6 HALT + paradigm shift:
> *"Phase 3.6 stop. n-are sens sa rebuild React fără să fie clear cum arată final state. mockup-first."*

Daniel verbatim chat ACASĂ 2026-05-10 mockup buguri sweep prerequisite:
> *"mockup-ul are buguri. trebuie sweep #1 inainte de port. NU port mockup buguros."*

Daniel verbatim chat ACASĂ 2026-05-11 BATCH 2 Antrenor port idle.js LANDED chat continuation:
> *"f1 patterns 5→2, f3 fatigue drop visual bar, f5 modal AA scoate, f13 rating notes drop V1 — astea sunt Co-CTO bias preserved per audit"*

## Bugatti framing notes

**Gigel test relevance:** Port-First = mockup design master final state validated visual + UX testable Daniel. Refacere structural rewrite acceptable pre-Beta = single port-once Daniel-only env (NU multi-iteration churn). Final port = Gigel-friendly final state direct, NU evolution dispersed în multi-React refactor iterativ.

**Quality > Speed rationale:** React migration prematur (Phase 1+2+3+3.5) când mockup design + V1 features audit NU clarified = work waste 70%. Port-First-Then-React = quality long-term: mockup as SoT clean (Step 1) → React port mecanic mapping (Step 2). Avoid acoperiș-pereți (acoperiș = React polish; pereți = mockup clean + V1 audit).

**Anti-RE considerations:** Slip pattern observed = React migration without clear final state visual (mockup) + V1 features verdict (audit). Anti-recurrence rule = sequence strict: **mockup clean** → **V1 features audit Co-CTO bias** → **vanilla port** → **React migration mecanic**.

**Anti-paternalism notes:** Port-First NU = Daniel review fiecare port detail. Co-CTO autonomous executes mockup sweep + V1 audit verdict + vanilla port + React mapping. Daniel review = la Beta a-z launch only (autonomy lock EXTINS PERMANENT 2026-05-11).

**Voice tone notes:** Daniel-ism "acoperiș-pereți" = analogy memorabil. Bugatti SoT clean port single = Bugatti craft applied at structural level. Branch naming `feature/v2-vanilla-port` reflects paradigm explicit. Mockup vs prod distincție permanent rule (any future strategic decision check current prod live state via screenshot).

## Cross-refs raw layer

- [[../../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 Port-First-Then-React LOCK V1 (REVERT SUPERSEDE 2026-05-08 React Migration LOCK V1)
- [[../../04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] §LOCK V1 7/7 sub-decisions Co-CTO autonomous
- [[../../04-architecture/V1_FEATURES_AUDIT_V1]] §LOCK V1 15/15 features Co-CTO bias preserved (10 keep + 4 modify + 1 drop V2-deferred F5)
- [[../../04-architecture/REACT_MIGRATION_STATE_MAPPING_V1]] §AMENDMENT 2026-05-10 status update (preserved canonical SSOT Step 2)
- [[../../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-10 chat-current 2 3 LOCK V1 substantive LANDED
- [[../../03-decisions/DECISION_LOG]] §2026-05-10 chat-current 2 autonomy lock EXTINS + 3 LOCK V1
- [[../../00-index/CURRENT_STATE]] §RECENT 2026-05-10 chat ACASĂ post Phase 3.6 attempt + mockup vs prod distincție + paradigm shift LANDED

🦫 **Port-First-Then-React LOCK V1 2026-05-10. Step 1 vanilla port → Step 2 React migration mecanic. Anti acoperiș-pereți paradigm permanent.**
