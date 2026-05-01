---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 15 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-05-01 evening (handover ingest — chat strategic goal-ca-setting + 8 templates programe v1 + 53 strings Phase B partial + 5 amendamente backlog + timeline 8-10 luni). Daniel paste in primul mesaj chat nou — chat răspunde cu citation explicită §X / ADR Y / file.md → pass criteria ≥12/15 corecte.
type: alignment-test
date: 2026-05-01 evening (post handover ingest evening)
---

# Alignment Questions — Chat Nou Bootstrap (post 2026-05-01 evening ingest)

**Use:** paste integral în primul mesaj chat Claude nou. Cere chat-ul să răspundă fiecare întrebare cu citation explicită (§X file.md / ADR Y).

**Pass criteria:** ≥12/15 corecte cu citation = **ALIGNED, continuă**. <12 = **INGEST FAIL** (chat-ul citește SSOT din vault prin `project_knowledge_search` și retry).

---

## Goal-ca-Setting + 8 Templates Programe v1 (NEW evening)

1. De ce **goal = setting NU voice nou**? Care 5 motive principale (98% NU schimbă goal, sparge math R8, etc.)? — ref `HANDOVER §26.2 Decizie LOCKED` + `COG-ARCH §R8 voice weights`

2. Care 8 templates programe v1 + cui se adresează fiecare? Care 2 dropped din v1 (rationale)? — ref `HANDOVER §26.3 Goal taxonomy v1`

3. Onboarding flow concrete — care e Q1 + Q1.5 conditional (cele 2 cazuri) + target sub 90s? — ref `HANDOVER §26.4 Onboarding flow`

4. Wording per goal = ACTION layer parametric — care pattern i18n key + 3 exemple verdicte per goal (Gigel longevity / Gigica aesthetic / Performance)? — ref `HANDOVER §26.6 Wording per goal` + `HANDOVER §23 Engine 12 variations baseline`

## Wording Rewrite Phase B Evening — 4 Batch-uri 53 Strings (NEW evening)

5. Batch 1 (17 strings) — care 6 readiness verdicte LOCKED (filozofie descriptive NU predictive)? Ce înseamnă SKIP_PAIN_MILD vs SKIP_INJURY split? — ref `HANDOVER §27.1 Readiness verdicte` + `HANDOVER §27.1 Skip Reasons`

6. F-NEW-4 plan banner — care 3 wording-uri locked (înlocuiesc percentage leak + paternalist override + numerice raw)? — ref `HANDOVER §27.1 F-NEW-4 Plan Adjusted Banner`

7. Batch 2 — care 6 calibration tier names LOCKED (filozofie descriptive ZERO relational)? De ce "Faza de dezvoltare" preferred peste "Faza de creștere"? — ref `HANDOVER §27.2 Calibration tier names + sys.js`

8. Batch 3 proactiveEngine — care e numerics policy (factual user-confirmable vs algorithmic diagnostics)? Care 3 alerts Weight Trend split direction-aware? — ref `HANDOVER §27.3 Decizii arhitecturale` + `HANDOVER §28.5 Weight Trend Engine Refactor`

9. Batch 4 plateauInterventions — care e two-layer messaging (badge UI vs mesaj proactive coach)? De ce internal engine tags ("+10% Volum") rămân exclusiv în logica engine? — ref `HANDOVER §27.4 Two-layer messaging` + `ADR 013 §Anti-RE`

## Amendamente Backlog Sprint 4.x (NEW evening)

10. F-NEW-3 hyperreactive cooldown re-locked Option C — care 3 reguli (global cap + per-trigger-type cap + cooldown 21 zile)? — ref `HANDOVER §28.4 F-NEW-3 Cooldown` + `HANDOVER §28.2 Threshold Trigger Logic`

11. Edge case durere cronică SKIP_INJURY mini-prompt secundar — care 2 routing options (nouă vs recurentă) + impact engine? — ref `HANDOVER §28.1 Durere Cronică vs Accidentare Acută`

12. Trigger principal F-NEW-4 banner — de ce "3 sesiuni planificate ratate în 14 zile" cross-frequency vs "consecutive" ambiguu? Care e wording User Pierdut <25% aderență? — ref `HANDOVER §28.2 Threshold Trigger Logic`

## Decizii Arhitecturale Evening + Timeline + Governance

13. Care 5 decizii arhitecturale evening LOCKED (tier policy RO universal / voice persoana plural+singular / numerics policy / Weight Trend split / two-layer messaging)? — ref `HANDOVER §0 Decizii arhitecturale` + `HANDOVER §27 batch-uri`

14. Timeline v1 ajustat 8-10 luni (vs 2-4 inițial) — care e trade-off rationale (90%+ market via goal taxonomy) + scope V1 adăugat (5 items)? — ref `HANDOVER §1.2 AMENDMENT 2026-05-01 evening` + `HANDOVER §26.8 Timeline impact`

15. Care 7 backup tags origin post-ingest evening + HEAD pre-ingest evening + tests count + outbox archive range 2026-05? — ref `HANDOVER §15 Tests & Git State`

---

## Răspuns expected format chat nou

Pentru fiecare întrebare, format strict:

```
Q<N>: <răspuns scurt 1-3 propoziții>
Citation: <file.md §X> sau <ADR Y §Z>
Confidence: HIGH | MEDIUM | LOW
```

**LOW confidence** = chat nu a găsit citation directă în Project Knowledge → flag pentru Daniel + retry `project_knowledge_search`.

---

🦫 **Pass criteria ≥12/15 (≥80%) = ALIGNED.** Continui de la stare curentă post-Opus run evening. Daniel skip introductions, direct work pe priorități post-evening: ADR 022 nou Goal-Driven Program Templates + PARAMETRIC_PROGRAMS_DESIGN refactor + 8 templates programe design (2-4 sesiuni dedicate) + bulk batch i18n implementation 53 strings locked + Sprint 4.x amendamente.
