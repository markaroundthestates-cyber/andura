---
title: ADR 005 — Vanilla JS No Framework
type: entity
subtype: adr
status: amended
locked_date: 2026-04-30
authority: 03-decisions/005-vanilla-js-no-framework.md raw layer §AMENDMENT 2026-05-10 Port-First-Then-React LOCK V1 REVERT SUPERSEDE
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../../concepts/port-first-then-react]]"
  - "[[../../concepts/bugatti-craft]]"
  - "[[../specs/spec-port-first-step-1]]"
  - "[[../specs/spec-react-migration-state-mapping]]"
amendments:
  - date: 2026-05-08
    note: React Migration LOCK V1 — Phase 1+2+3+3.5 React scaffold work (~70% degeaba post screenshot)
  - date: 2026-05-10
    note: REVERT SUPERSEDE — Port-First-Then-React paradigm LOCK V1 post mockup vs prod distincție Daniel screenshot
  - date: 2026-05-13c
    note: S3 Guards Bundle 1 LANDED chain 2 atomic commits clean (S3.C `d41e111` session guard double-start + S3.D `47729ed` bottom-nav HIDE in-session) — `feature/v2-vanilla-port` branch active vanilla port continuation Port-First-Then-React paradigm preserved invariant (NU React/JSX touched ZERO Step 2 React migration). Bundle 1 vanilla DOM toggle imperativ pattern via `$()` helper + CSS class toggle `body.in-session` + appended CSS rule `body.in-session .nav { display: none; }` în `src/styles/main.css` — all pure vanilla JS + native DOM API consistent ADR 005 original LOCK V1 stack discipline. Tests 2984 → 3006 PASS (+22 net new). ZERO HARD CONSTRAINT violation (ZERO main branch + ZERO React/JSX + ZERO --no-verify + ZERO engine module mutation + ZERO src/storage.js creation + ZERO localStorage key NEW + ZERO .obsidian/ modifications + ZERO mockup andura-clasic.html modification + ZERO index.html markup change CSS+JS class toggle only + ZERO `confirm()` prompt added anti-paternalism preserved)
---

# ADR 005 — Vanilla JS No Framework (Port-First-Then-React §AMENDMENT 2026-05-10)

## Synthesis

ADR 005 = decision adoption vanilla JS stack pre-React. Original LOCK V1 2026-04-30 (NU framework, NU TypeScript, vanilla JS + Vite + vitest + Playwright). §AMENDMENT 2026-05-08 = React Migration LOCK V1 attempt (Phase 1+2+3+3.5 React scaffold work cu Vite + React 19 + state mapping). §AMENDMENT 2026-05-10 = **REVERT SUPERSEDE** post chat ACASĂ Daniel screenshot andura.app prod live revealed layout VECHI complet diferit de mockup V2 (~70% Phase 1+2+3+3.5 React work degeaba pentru prod). Port-First-Then-React paradigm LOCK V1: Step 1 vanilla port mockup → prod cu `feature/v2-vanilla-port` branch → Step 2 React migration mecanic mapping post Step 1 validation Daniel Gates smoke. Sub-decisions 7/7 LOCK V1 Co-CTO bias preserved chat-current 2 2026-05-10.

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-05-10 mockup vs prod screenshot moment (REVERT SUPERSEDE trigger):
> *"ba ce dracu faci? Ai o aplicatie in productie care e vanila. Ai un mock 30% functional nemigrat si ne nimic... si tu cauti 1800 sau 2000 kcal? Si ma mai si intrebi pe mine inutil ce sa faci. Pe bune exact stilul hai sa punem acoperisul inainte sa punem peretii."*

Daniel verbatim chat ACASĂ 2026-05-10 Phase 3.6 HALT + paradigm shift:
> *"Phase 3.6 stop. n-are sens sa rebuild React fără să fie clear cum arată final state. mockup-first."*

Daniel verbatim chat ACASĂ 2026-04-30 original vanilla JS rationale:
> *"NU framework. Vanilla JS, Vite, vitest. Bugatti simple stack. Build chestii fără overhead React."*

## Bugatti framing notes

**Quality > Speed via paradigm respect:** Original LOCK V1 vanilla JS chosen for simplicity + low overhead. React Migration §AMENDMENT 2026-05-08 attempt prematur fără mockup design + V1 features audit clarified → ~70% work degeaba. Port-First-Then-React paradigm = Bugatti SoT clean port single mockup → vanilla prod → React mecanic mapping post-validation.

**Anti-RE considerations:** Slip pattern observed = React migration without clear final state visual (mockup) + V1 features verdict. Anti-recurrence rule cross-ref `concepts/port-first-then-react.md`.

**Voice tone notes:** Daniel-ism "acoperiș-pereți" analogy = catalysator REVERT SUPERSEDE. Branch naming `feature/v2-vanilla-port` reflects paradigm explicit.

## Cross-refs raw layer

- [[../../../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 Port-First-Then-React LOCK V1 (REVERT SUPERSEDE 2026-05-08)
- [[../../../04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] §LOCK V1 7/7 sub-decisions Co-CTO autonomous
- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §LOCK V1 15/15 features
- [[../../../04-architecture/REACT_MIGRATION_STATE_MAPPING_V1]] §AMENDMENT 2026-05-10 status update
- [[../../../00-index/CURRENT_STATE]] §RECENT 2026-05-10 chat ACASĂ post Phase 3.6 attempt + paradigm shift LANDED

🦫 **ADR 005 vanilla JS LOCK V1 2026-04-30 + §AMENDMENT 2026-05-08 React Migration (SUPERSEDED) + §AMENDMENT 2026-05-10 Port-First-Then-React REVERT SUPERSEDE LOCK V1.**
