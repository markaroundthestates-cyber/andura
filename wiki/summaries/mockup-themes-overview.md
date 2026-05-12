---
title: Mockup Themes Overview — Clasic Master SoT + Cross-Theme Paradigm + Mockup vs Prod Distinction
type: summary
status: live
last_updated: 2026-05-12
synthesis_scope: mockups
cross_refs:
  - "[[../concepts/mockup-vs-prod-distinction]]"
  - "[[../concepts/port-first-then-react]]"
  - "[[../entities/specs/spec-port-first-step-1]]"
  - "[[../entities/specs/spec-root-nav-v2]]"
---

# Mockup Themes Overview

## Synthesis

**Andura Mockups = 4 themes V2 design SoT canonical** (Clasic master FIRST per STRATEGIC SHIFT 2026-05-10 + Living Body + Luxury + Brain Coach 3 themes parity invariant LOCK V1) cu **Clasic master SINGLE SoT pre-Beta** (single-theme master FIRST = INTENTIONAL placeholder). Authority: [[../concepts/mockup-vs-prod-distinction]] permanent rule + [[../entities/specs/spec-port-first-step-1]] Port-First-Then-React paradigm Step 1 vanilla port mockup V2 → prod `src/`.

**Theme Parity Invariant LOCK V1 2026-05-10 night noapte:** Cross-theme cohesion preserved invariant (4 themes UI design preserved consistent post LB/Lux/BC ports). `screen-settings-themes` 4 theme cards Clasic/Living Body/Luxury/Brain Coach + `pickTheme()` toggles `.selected` class fără swap actual CSS variables = INTENTIONAL placeholder pre-Beta. Wire actual CSS var swap post-Beta when LB/Lux/BC mockups ported.

**Mockup vs prod distinction concept permanent rule:** Per [[../concepts/mockup-vs-prod-distinction]] (chat-current 2026-05-10) — screenshot prod live andura.app NU == mockup V2 design Clasic. Distincție permanent: mockup folder `04-architecture/mockups/` = V2 design SoT post-port target + prod `src/` live deployed = layout V1 prod legacy. Daniel screenshot 2026-05-10 revealed: ~70% Phase 1+2+3+3.5 work degeaba pentru prod app live + ~30% util permanent (LOCKED V1 spec valid + mockup design refined ghid React port).

**Mockup buguri sweep #1 PORT_FIRST prerequisite LANDED 2026-05-10:** Chain `a9ddfa8 → 8d16361` 8 substantive fixes pre-port (3 P0 Cloudflare email-protection injection + duplicate ID stub divs + medical disclaimer routing + 4 P1 audit-driven + 1 follow-up pickTheme JS unicode escape). File `andura-clasic.html` 2351 → 2144 LOC (-207 net). Pattern: clean state mockup ÎNTÂI sub-decision #1 LOCK V1 PORT_FIRST_STEP_1_PARADIGM_V1.

**Root Nav V2 §29.5.7 AMENDMENT LOCKED V1 2026-05-07 4 taburi:** Per [[../entities/specs/spec-root-nav-v2]] SUPERSEDE V1 trio Azi/Istoric/Profil → V2 quad **Antrenor/Progres/Istoric/Cont**. Naming evolutions chat-NEW1 → chat-NEW2 RO pure drop Anglicisms inconsistent. Mockup V2 design 4 taburi distincte non-overlapping bottom-nav line 1701-1715.

**Cross-theme P3 carry-forward deferral:** Theme parity invariant cross-check vs LB/Lux/BC (P3-ε defer dedicated chat post-Beta — single-theme Clasic master FIRST intentional placeholder). Pattern: defer cross-theme work până Clasic prod-deployed validated Daniel Gates manual smoke.

## Verbatim quotes Daniel

Daniel verbatim mockup vs prod distinction screenshot 2026-05-10 reveal:
> *"mockup vs prod distincție revealed via Daniel screenshot andura.app prod live = layout VECHI complet diferit de mockup V2. ~70% Phase 1+2+3+3.5 work degeaba pentru prod app live; ~30% util permanent (LOCKED V1 spec valid + mockup design refined ghid React port)."*

Daniel verbatim sub-decision #1 clean state mockup ÎNTÂI rationale:
> *"Port = mecanic mapping mockup → vanilla JS modules. Carrying mockup debt forward = anti-Bugatti (introduces buggy patterns la prod, contaminate fresh port). Quality > Speed default. Fix once în mockup (single SoT), port clean once."*

Daniel verbatim STRATEGIC SHIFT 2026-05-10 Clasic master FIRST:
> *"single-theme Clasic master FIRST = INTENTIONAL placeholder. Wire actual CSS var swap post-Beta when LB/Lux/BC mockups ported."*

Daniel verbatim Root Nav V2 chat-NEW2 SUPERSEDE final naming pivot:
> *"SUPERSEDE chat-NEW1 final V2 LOCK — Antrenor / Progres / Istoric / Cont. Naming pivot final. 'Coach' → 'Antrenor' (RO pure, drop Anglicisms inconsistent)."*

Daniel verbatim mockup buguri sweep #1 PORT_FIRST prerequisite:
> *"Mockup buguri sweep #1 PHASE A audit 6 P3 carry-forward findings — single-theme Clasic master scope deferred dedicated chat post-Beta. Status 🟡 P3 carry-forward deferred dedicated chat post-Beta single-theme master."*

## Bugatti framing notes

**Gigel test relevance:** Mockup themes invisible la user (engineering design SoT). Surface UI = post-port theme selection (Setări tab themes card 4 options — Clasic active V1, LB/Lux/BC placeholder V1.5+). Gigel test PASS theme as identity preference NU forced default.

**Quality > Speed via Clasic master FIRST STRATEGIC SHIFT:** Anti-cross-theme-parallel-development scope creep V1. Pattern: single-theme master deeply polished pre-Beta > 4 themes shallow parallel.

**Anti-RE considerations:** Mockup vs prod distinction permanent rule = anti-recurrence "screenshot prod live = mockup V2" pattern (Daniel 2026-05-10 reveal slip ~70% Phase work degeaba). Pattern: distinct folders mockups vs src/ prod boundaries preserved invariant.

**Anti-paternalism notes:** Theme choice user preference (NU forced "best theme" Andura recommendation). 4 themes parity invariant preserves user agency selection visual identity.

**Voice tone notes:** Daniel-isms "Clasic master FIRST INTENTIONAL placeholder" + "RO pure drop Anglicisms inconsistent" + "Bugatti craft Quality > Speed default" recurring patterns. Cross-feature UX discipline preserved.

## Cross-refs raw layer

- [[../../04-architecture/mockups/andura-clasic.html]] Clasic master V2 design SoT canonical 2144 LOC post sweep
- [[../../04-architecture/mockups/andura-living-body.html]] Living Body theme parity invariant LB
- [[../../04-architecture/mockups/andura-luxury.html]] Luxury theme parity invariant Lux
- [[../../04-architecture/mockups/andura-brain-coach.html]] Brain Coach theme parity invariant BC
- [[../../04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT]] V2 quad LOCKED 2026-05-07 chat-NEW1+NEW2
- [[../../04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] §1 Clean state mockup ÎNTÂI sub-decision #1 LOCK V1
- [[../../03-decisions/DECISION_LOG]] §2026-05-10 mockup buguri sweep #1 chain `a9ddfa8 → 8d16361` 8 substantive fixes
- [[../../DIFF_FLAGS]] §P3-α/β/γ/δ/ε/ζ mockup sweep 6 deferrals + §P2-A/B/C/D/E persona switcher dead infrastructure deferrals
- [[../concepts/mockup-vs-prod-distinction]] permanent rule concept SUB-BATCH 1 LANDED
- [[../entities/specs/spec-port-first-step-1]] (sibling spec Step 1 paradigm)
- [[../entities/specs/spec-root-nav-v2]] (sibling spec V2 quad 4 taburi)

🦫 **Mockup Themes Overview holistic 4 themes parity invariant LOCK V1 Clasic master FIRST + Living Body + Luxury + Brain Coach. Mockup vs prod distinction permanent rule. Mockup buguri sweep #1 PORT_FIRST prerequisite LANDED 2026-05-10. Root Nav V2 §29.5.7 quad Antrenor/Progres/Istoric/Cont RO pure naming. Single-theme Clasic master FIRST STRATEGIC SHIFT pre-Beta.**
