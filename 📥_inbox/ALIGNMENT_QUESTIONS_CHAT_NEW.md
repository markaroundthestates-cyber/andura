---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 10-15 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-04-30 evening v2. Daniel paste in primul mesaj chat nou — chat răspunde cu citation §X / ADR Y / file.md → pass criteria ≥12/15 corecte.
type: alignment-test
date: 2026-04-30 evening v2
---

# Alignment Questions — Chat Nou Bootstrap

**Use:** paste integral în primul mesaj chat Claude nou. Cere chat-ul să răspundă fiecare întrebare cu citation explicită (§X file.md / ADR Y).

**Pass criteria:** ≥12/15 corecte cu citation = **ALIGNED, continuă**. <12 = **INGEST FAIL** (chat-ul citește SSOT din vault prin `project_knowledge_search` și retry).

---

## Sesiune curentă D1-D15

1. Ce a decis Daniel pe **D1 — DEVELOPING tier**? Add (6 nivele) sau drop (5)? Cu rationale scurt + Sprint timing. — ref `HANDOVER_GLOBAL_2026-04-30_evening §1.1` D1 + `ADR 009 §AMENDMENT 2026-04-30`

2. **D7 Stryker mutation testing** — varianta finală decisă? Cine reviewer (Daniel manual / Claude chat technical / both)? Care e scope-ul review-ului tehnic post-baseline? — ref `HANDOVER §1.1` D7 + `HANDOVER_INPUT_INBOX §1.1`

3. **D12 — câte anonymous accounts** folosește Daniel pre-launch + pe ce devices? Ce flag pentru pre-Faza-1 manual merge timing? — ref `HANDOVER §1.1` D12

4. **D13 — T&B Faza 2 strangler order:** spec original (weights first) vs decizia finală? Cu blast radius rationale. — ref `HANDOVER §1.1` D13

## Gemini cross-check

5. Care **3 BLIND SPOTS** a flagat Gemini Q10? Care e considerat BLOCKER pre-launch vs deferable? — ref `HANDOVER §1.2` Q10 + `ADR 020 §Context` + `ADR 021 §Context`

6. Ce sugestie Gemini a fost **RESPINSĂ explicit** de Daniel + Claude pe AA Detection signals 4+5? Care e mic counter-point ACCEPTAT din push-back? — ref `HANDOVER §1.3` F1 + `ADR 013 §AMENDMENT 2026-04-30 evening`

## ADR 020 Storage Tiering

7. Ce **3 tier-uri storage** definite (Tier 0/1/2)? Care library Tier 1 + bundle size? Care budget Tier 0 hard ceiling? — ref `ADR 020 §Decision (SSOT)`

8. Care e **rotation trigger** (size-based / time-based / hybrid)? Care e threshold initial Tier 0 → Tier 1? — ref `ADR 020 §Rotation trigger`

9. ADR 020 e **CRITICAL pre-launch** sau deferable post-launch? De ce (rationale tehnic)? — ref `ADR 020 §Context` + `HANDOVER §6.7 updated` + `DECISION_LOG 2026-04-30 evening §1`

## ADR 021 Calibration Drift

10. Ce mecanism pe **axa `engine_tier`** la sync conflict? Ce pe **axa `calibration_confidence`**? — ref `ADR 021 §Decision (SSOT)`

11. Ce schema **field-uri** are `calibration_state`? Ce role are **Version Vector** la sync conflict resolution? — ref `ADR 021 §Schema` + `§Reconciliation algorithm pseudocode`

12. Cum interactionează ADR 021 cu **T&B Faza 2 implementation**? Pre-launch immediate sau pre-Faza-2 spec? — ref `ADR 021 §Implementation phasing` + `HANDOVER §1.1` D13

## PRODUCT_STRATEGY §3.5.1 + ADR 013 amendment

13. La **T0 + Self-report fill**, ce ratio prior strong / baseline demographic? Care e calibration time impact (% reduction)? — ref `PRODUCT_STRATEGY_SPEC_v1 §3.5.1`

14. **ADR 013 amendment 2026-04-30 evening** — ce a sugerat Gemini și ce a decis Daniel + Claude pe consolidare signals 4+5? Ce edge case implementation flag pe composite tier function? — ref `ADR 013 §AMENDMENT 2026-04-30 evening`

## Schema outbox + state final

15. Unde e **LATEST.md** curent (path)? Care fișier a fost mutat în archive ca **NN=13**? Ce există în `📥_inbox/` post-Opus run vs înainte? Ce vault rules guvernează schema? — ref `📤_outbox/LATEST.md` + `📤_outbox/_archive/2026-04/13_OUTBOX_SCHEMA_MIGRATION.md` + `VAULT_RULES.md §3.3` + `PROMPT_CC_HYGIENE.md §3.1`

---

## Bonus — verify PROJECTION engine context

16. (Optional, +1 dacă răspunde corect) Per Gemini Q1 sugestie gating PROJECTION T0 — care e finding-ul Opus run în `src/engine/dimensionRegistry.js`? E PROJECTION engine dimension registered current sau doar UI utility (`dashboard.js calcProjection`)? — ref `📤_outbox/LATEST.md §PROJECTION engine verify`

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

🦫 **Pass criteria ≥12/15 (≥80%) = ALIGNED.** Continui de la stare curentă post-Opus run. Daniel skip introductions, direct work.
