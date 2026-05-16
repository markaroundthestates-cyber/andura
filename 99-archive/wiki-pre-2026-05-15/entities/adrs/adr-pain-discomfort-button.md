---
title: ADR Pain Discomfort Button v1 (3-Tier Input + Override CDL)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md LOCKED V1 per ALIGNMENT_QUESTIONS Q2 Daniel response BATCH_05 final Sprint 4.x cluster (with EXT-1)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../concepts/andura-suflet]]"
  - "[[../concepts/gigel-test]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-smart-routing-equipment]]"
amendments: []
---

# ADR Pain Discomfort Button v1

## Synthesis

ADR_PAIN_DISCOMFORT_BUTTON = 3-tier pain input observable + override CDL flag pentru hard-block bypass + audit log. Context: User raportează durere/disconfort în timpul sesiunii. App NU este unealtă medicală — F2 SUFLET stipulează "AI-ul informează, nu impune", și Gigel test (paranoia rezonabilă post-MVP audit legal) cere ZERO medical claims în UI/wording. Existing solutions (Fitbod / Strong / Hevy) ori ignoră complet input pain (paternalism mascat reverse — user trebuie să decidă singur), ori medicalizează (paternalism direct — questionnaire diagnostic). Origine §36.38 Chat C SELF-CORRECTION EXTENSION.

**3 PAIN_OPTIONS (anti-paternalism, anti-medical-claim):**
| Cheie | Label V1 | Level | Engine output |
|-------|----------|-------|---------------|
| `discomfort_general` | "Mișcarea mă deranjează" | general (observable subjective) | `suggest_alternative` smart-routing |
| `discomfort_specific` | "Simt o tensiune ciudată" | specific (localized observable) | `reduce_volume` (skip last set sau reduce kg ~10%) |
| `doms_severe` | "DOMS sever" | technical (gym-savvy users; optional) | `skip` (rest exercise, propose alternative muscle group) |

**ZERO medical claim wording** în UI — NU "consult doctor", NU "recovery time estimate", NU "diagnostic suggestion".

**Override CDL F2 SUFLET respect:** User poate override hard-block engine dacă engine flag-ează red zone (e.g., Composite Signal triggered pe acest exercițiu). Buton `[Continuă pe propria răspundere]` — logged CDL `user_override_pain_redflag: true`. Audit trail pentru injury liability case (cross-ref ADR 013 Liability Flag pattern).

## Verbatim quotes Daniel

Daniel verbatim 3-tier wording LOCKED 2026-05-02 anti-medical-claim:
> *"Mișcarea mă deranjează / Simt o tensiune ciudată / DOMS sever — anti-medical-claim wording. ZERO 'consult doctor'. ZERO 'recovery time estimate'. ZERO 'diagnostic suggestion'. App NU este unealtă medicală."*

Daniel verbatim Gigel test paranoia post-MVP audit legal rationale:
> *"Gigel test = paranoia rezonabilă post-MVP audit legal. ZERO medical claims UI. F2 SUFLET 'AI-ul informează, nu impune'. Existing apps ori ignoră ori medicalizează. Andura = 3-tier observable, anti-paternalism."*

Daniel verbatim Override CDL F2 respect rationale:
> *"User poate override hard-block engine. [Continuă pe propria răspundere] button. Logged CDL audit trail. F2 respect — user agency preserved chiar la red zone signal."*

## Bugatti framing notes

**Gigel test relevance:** 3-tier wording vernacular *"Mișcarea mă deranjează / Simt o tensiune ciudată / DOMS sever"* = anti-medical-jargon. Gigel post-MVP audit legal PASS verdict explicit. User-facing wording observable subjective, NU diagnostic.

**Quality > Speed via 3-tier observable input:** general → specific → DOMS technical = progressive disclosure observable, NU questionnaire diagnostic. Anti-paternalism preserved.

**Anti-RE considerations:** Pattern V1 LANDED via BATCH 2 SLICE 1 commit `f941fd7` painButton.js port mockup V2 SoT (3 visible + Altceva textarea) — audit primat applied mockup V2 SoT supersede ADR EXT-1 *"2 PRIMARY + 1 SECONDARY"*. Engine PAIN_OPTIONS contract LOCK V1 preserved orthogonal — UI override only.

**Anti-paternalism notes:** Override CDL F2 respect = user agency preserved chiar la red zone signal. Pattern: engine flag + log + propose, NU forced override silent. ADR 025 graceful degradation alignment.

**Voice tone notes:** Daniel-ism "Continuă pe propria răspundere" button label preserved (user takes responsibility explicit). ZERO patronizing wording.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1]] §Decision 3 PAIN_OPTIONS + Override CDL verbatim
- [[../../../01-vision/SUFLET_ANDURA]] §F2 "AI-ul informează, nu impune" foundation
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.38 (origin) Chat C SELF-CORRECTION EXTENSION
- [[../../../03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1]] §9.4.6 Convergence Guard Clean Signal rule preserved engine NU proactive trigger
- [[../../../03-decisions/011-coach-decision-log-architecture]] CDL override audit log
- [[../../../03-decisions/013-auto-aggression-detection]] Liability Flag pattern audit trail
- [[../../../04-architecture/mockups/andura-clasic.html]] §pain-button line 786-790 V2 SoT (3 visible + Altceva textarea)
- [[../../../src/pages/coach/painButton.js]] V1 LANDED BATCH 2 SLICE 1 commit `f941fd7` (audit primat applied)

🦫 **ADR Pain Discomfort Button LOCKED V1 2026-05-02. 3-tier observable input + ZERO medical claims + Override CDL F2 respect audit trail. Gigel test paranoia post-MVP audit legal PASS verdict. Anti-paternalism preserved.**
