---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 14 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-04-30 evening v2 (handover ingest). Daniel paste in primul mesaj chat nou — chat răspunde cu citation explicită §X / ADR Y / file.md → pass criteria ≥12/14 corecte.
type: alignment-test
date: 2026-04-30 evening v2 (post handover ingest)
---

# Alignment Questions — Chat Nou Bootstrap (post evening v2 ingest)

**Use:** paste integral în primul mesaj chat Claude nou. Cere chat-ul să răspundă fiecare întrebare cu citation explicită (§X file.md / ADR Y).

**Pass criteria:** ≥12/14 corecte cu citation = **ALIGNED, continuă**. <12 = **INGEST FAIL** (chat-ul citește SSOT din vault prin `project_knowledge_search` și retry).

---

## ADR 020 Storage Tiering Phase 1 (NEW evening v2)

1. Care e **Phase 1 scope** ADR 020 (ce keys rotate la Tier 1)? Ce e **EXCLUS din Phase 1** și de ce? — ref `HANDOVER §16 ADR 020` + `ADR 020 §Decision SSOT` + `src/storage/tieringEngine.js` ROTATABLE_KEYS

2. Care e **failure mode** Tier 1 write fail? Ce protejează zero info loss principle? — ref `HANDOVER §16` + `ADR 020 §Risks #5` + `src/storage/tieringEngine.js` retry backoff

3. Câte teste Golden Master adăugate pentru ADR 020 Phase 1? Ce 4 fișiere noi în `src/storage/`? — ref `HANDOVER §15` + `HANDOVER §16` + `src/storage/__tests__/`

4. Ce e **mandatory pre-launch** Sprint 4.x pentru ADR 020 (altfel rotation NU rulează)? — ref `HANDOVER §6.7 status update` + `HANDOVER §14 imediat`

## Governance Hardening §7 DIFF + §8 Destructive Ops (NEW evening v2)

5. Ce 7 paşi obligatorii pentru §7 DIFF Protocol pre-overwrite SSOT? Ce eveniment l-a triggat (slip incident)? — ref `PROMPT_CC_HYGIENE.md §7` + `HANDOVER §17 SLIP #1`

6. Ce 7 triggers active §8 Destructive Ops Checklist? Ce e INTERZIS fără explicit Daniel approval? — ref `PROMPT_CC_HYGIENE.md §8` + `HANDOVER §17 SLIP #2`

7. Pe ce path nou apar **alignment questions** generate de CC Opus post-ingest? De ce NU mai în inbox? — ref `HANDOVER §18` + `VAULT_RULES.md §HANDOVER_PROTOCOL §Constraints absolute`

## Memory consolidation 30 → 17 reguli MANDATORY (NEW evening v2)

8. Care 4 reguli MANDATORY tightened post evening v2? Ce e specific pentru fiecare (1 linie)? — ref `HANDOVER §8.2`

9. Ce procent reduction a memory consolidation? Ce e principle locked despre memory vs handover separation? — ref `HANDOVER §8.2`

## D1-D15 + ADR amendments (preserved from evening v1)

10. Pe **D1 — DEVELOPING tier**, decizia finală + canonical 6 nivele + Sprint timing? — ref `HANDOVER §5 D1` + `DECISION_LOG §2026-04-30 evening` + `ADR 009 §AMENDMENT 2026-04-30 §Migration Plan §Sprint 2 #1 RESOLVED`

11. Pe **D13 — T&B Faza 2 strangler order**, decizie finală + blast radius rationale? — ref `HANDOVER §5 D13` + `ADR 021 §Implementation phasing Faza 2`

12. Care e **AA composite no-double-penalize** rationale (Gemini F1 amendment)? — ref `ADR 013 §AMENDMENT 2026-04-30 evening`

## Strategy + Pricing (preserved 1:1 din evening v1)

13. Care e **pricing locked** Founding Members + Pro standard + iOS post-v1.x? Math revenue 10K users target Year 2-3? — ref `HANDOVER §3` + `PRODUCT_STRATEGY_SPEC_v1 §1.3`

14. Care e **MOAT 7 features distinctive** Android-first? De ce "SensAI for Android" positioning? — ref `HANDOVER §2.1 + §2.2` + `MOAT_STRATEGY` competitor matrix

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

🦫 **Pass criteria ≥12/14 (≥86%) = ALIGNED.** Continui de la stare curentă post-Opus run evening v2. Daniel skip introductions, direct work pe ADR 021 / Sprint 4.x / Sprint 4 prompt comprehensive.
