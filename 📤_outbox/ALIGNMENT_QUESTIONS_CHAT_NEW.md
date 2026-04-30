---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 15 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-05-01 morning (handover ingest + Sprint 4 A+B + i18n audit). Daniel paste in primul mesaj chat nou — chat răspunde cu citation explicită §X / ADR Y / file.md → pass criteria ≥12/15 corecte.
type: alignment-test
date: 2026-05-01 morning (post handover ingest)
---

# Alignment Questions — Chat Nou Bootstrap (post 2026-05-01 morning ingest)

**Use:** paste integral în primul mesaj chat Claude nou. Cere chat-ul să răspundă fiecare întrebare cu citation explicită (§X file.md / ADR Y).

**Pass criteria:** ≥12/15 corecte cu citation = **ALIGNED, continuă**. <12 = **INGEST FAIL** (chat-ul citește SSOT din vault prin `project_knowledge_search` și retry).

---

## Sprint 4 A+B Implementation (NEW 2026-05-01)

1. Care e contractul `runBootMigrations()` + `startTierRotation()` în `src/bootstrap.js`? Ce înseamnă "graceful degradation" (return value pe throw)? — ref `HANDOVER §19` + `ADR 018 §4` + `src/bootstrap.js`

2. Care 4 wording-uri categorical "De ce?" lock-uite + ce verdict trigger-uri folosesc (Up/Down/Hold/Recovery)? Ce override priority are Recovery? — ref `HANDOVER §21` + `src/i18n/ro.json` `why.categorical.*` + `src/engine/whyEngine.js` `selectVerdict`

3. ADR 021 Faza 1 vs Faza 2 boundary — ce e LIVE acum + ce deferred (3 motive concrete)? — ref `HANDOVER §19 Faza 1 vs 2` + `ADR 021 §Implementation phasing` + `calibrationReconciliation.js` JSDoc

4. Smoke test prod ADR 020 Phase 1 — ce a trecut funcțional + ce 4 user-facing breach descoperite? — ref `HANDOVER §19 Smoke test` + `HANDOVER §22` (F-NEW-1..4)

## i18n Decision B + Anti-RE Compliance (NEW 2026-05-01)

5. De ce decizia "i18n bundle ÎNAINTE wording rewrite" e correctă? Ce ar fi consecința rewrite întâi? — ref `HANDOVER §20 Decizie arhitecturală` + `PRODUCT_STRATEGY_SPEC_v1 §i18n` + `COG-ARCH §Q5`

6. Ce strategy folosește `whyEngine.selectVerdict` (priority ladder)? Care 5 input semnalează `recovery` indiferent de tier? — ref `src/engine/whyEngine.js` `selectVerdict` + `HANDOVER §21 Constraints` + `ADR 013 §Anti-RE`

7. Care 5 categorii anti-RE leak interzise în output user-facing (anti-RE absolute reaffirmed)? — ref `HANDOVER §21 Anti-RE strategy` + `ADR 013 §Anti-RE`

## Findings Noi 2026-05-01 (F-NEW-1..F-NEW-4)

8. Care 4 findings noi flag-uite + priority + owner pentru fiecare? — ref `HANDOVER §22`

9. F-NEW-3 hyperreactive coach — ce 3 opțiuni propose pentru cooldown threshold? Care e Gigel test rationale? — ref `HANDOVER §22 F-NEW-3` + ADR 013 §Gigel test

10. F-NEW-2 progression scaling — ce relație are cu ADR 009 calibration tiers? De ce advanced ≠ +2.5kg uniform? — ref `HANDOVER §22 F-NEW-2` + `ADR 009 §AMENDMENT calibration_confidence`

## Governance + Tests state

11. Ce 5 backup tags existente origin (rollback safe)? — ref `HANDOVER §15 Backup tags origin`

12. Tests count post-2026-05-01 morning + breakdown new tests adăugate (5 categorii)? — ref `HANDOVER §15 Tests` + `§19 Sprint 4 A+B` + `§20 i18n`

## Preserved 1:1 verification (din evening v2)

13. Pe **D1 — DEVELOPING tier**, decizia finală + canonical 6 nivele + Sprint timing? — ref `HANDOVER §5 D1` + `DECISION_LOG §2026-04-30 evening` + `ADR 009 §AMENDMENT §Migration Plan §Sprint 2 #1 RESOLVED`

14. Care e **pricing locked** Founding Members + Pro standard + iOS post-v1.x? Math revenue 10K users target Year 2-3? — ref `HANDOVER §3` + `PRODUCT_STRATEGY_SPEC_v1 §1.3`

15. Care e §HANDOVER_PROTOCOL §7 DIFF + §8 Destructive Ops mandatory pre-overwrite SSOT (5 paşi key)? — ref `PROMPT_CC_HYGIENE.md §7-§8` + `VAULT_RULES.md §HANDOVER_PROTOCOL`

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

🦫 **Pass criteria ≥12/15 (≥80%) = ALIGNED.** Continui de la stare curentă post-Opus run morning. Daniel skip introductions, direct work pe wording rewrite session (Phase A toasts/confirms ~36 quick wins) sau F-NEW-3 cooldown decision.
