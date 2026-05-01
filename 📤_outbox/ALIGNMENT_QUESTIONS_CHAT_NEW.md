---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 15 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-05-02 (handover ingest — chat strategic safety nutrition pattern complet + 4 templates programe v1 full spec + 5 amendamente backlog noi + 3 decizii arhitecturale colaterale + 5 decizii non-vault contextual). Daniel paste in primul mesaj chat nou — chat răspunde cu citation explicită §X / ADR Y / file.md → pass criteria ≥12/15 corecte.
type: alignment-test
date: 2026-05-02 (post handover ingest 2026-05-02)
---

# Alignment Questions — Chat Nou Bootstrap (post 2026-05-02 ingest)

**Use:** paste integral în primul mesaj chat Claude nou. Cere chat-ul să răspundă fiecare întrebare cu citation explicită (§X file.md / ADR Y).

**Pass criteria:** ≥12/15 corecte cu citation = **ALIGNED, continuă**. <12 = **INGEST FAIL** (chat-ul citește SSOT din vault prin `project_knowledge_search` și retry).

---

## Safety Nutrition Pattern (NEW 2026-05-02)

1. Care e authority allocation pe cele 4 domenii safety nutrition (kcal/protein/surplus/hidratare)? De ce asymmetry NIH+EFSA vs ISSN INTENȚIONAT? — ref `HANDOVER §29.1 Authority Allocation Summary` + `§29.1.5`

2. De ce surplus-side = OPTIMIZATION NU SAFETY? Care e Gigel test rationale + threshold internal engine + wording observativ unic? — ref `HANDOVER §29.1.1 Surplus-side`

3. Kcal floor pattern — care 2 nivele soft warning + threshold gendered + threshold L2 rationale (3 zile pattern detection NU fiziologie)? Care wording dual variant Nivel 2 (cu/fără training)? — ref `HANDOVER §29.1.2 Deficit-side kcal floor`

4. Protein floor — care formula dynamic + source ISSN + onboarding nudge + de ce NU listăm food examples? — ref `HANDOVER §29.1.3 Deficit-side protein floor`

5. De ce hidratare DROP safety pattern? Care e wording observational simplu (rămâne în proactiveEngine)? — ref `HANDOVER §29.1.4 Hidratare` + `§27.3 Batch 3`

## 4 Templates Programe V1 Full Spec (NEW 2026-05-02)

6. Slăbire majoră (>15kg) — care 4 user profile assumptions + frecvență/durată/RPE + de ce recumbent bike NU mers bandă + de ce Hip Thrust cu spatele pe bancă INTERZIS? — ref `HANDOVER §29.2.1 Slăbire Majoră`

7. Slăbire moderată (<15kg) — care e split Push/Pull alternation Ziua A/B rationale (de ce Goblet Squat + RDL aceeași sesiune = oboseală sistemică)? De ce Russian Twists EXCLUS? — ref `HANDOVER §29.2.2 Slăbire Moderată`

8. Tonifiere — care 3 sub-variants + split rationale (50/50 Echilibrat / 70/30 Lower Gigica / 70/30 Upper Marius)? Care 4 categorii INTERZISE V1 (BBS+BBP+Olympic+1RM)? — ref `HANDOVER §29.2.3 Tonifiere`

9. Sănătate Generală — de ce Full Body 3× NU split per body parts? Care vârstă target și consistency check pool exerciții cu Tonifiere? — ref `HANDOVER §29.2.4 Sănătate Generală`

## Decizii Arhitecturale + Backlog (NEW 2026-05-02)

10. ZERO întrebări medical screening onboarding — care e Gigel test catastrofal rationale + cum e absorbed liability concern? — ref `HANDOVER §29.3.1 Onboarding ZERO`

11. Engine routing Slăbire majoră BMI 30+18kg = template low-impact "conservative-by-default" — care e cost + mitigation? — ref `HANDOVER §29.3.2 Engine routing`

12. Anti-RE strict thresholds (0.5%/săpt + 1.6 g/kg + 25% deficit) — de ce engine internal NU exposed user-facing? Ce vede user? — ref `HANDOVER §29.3.3 Anti-RE strict`

13. Care 5 amendamente backlog Sprint 4.x noi (§28.6-§28.10) + owners + rationale fiecare? — ref `HANDOVER §28.6-§28.10`

## Status v1 + Governance

14. Status v1: câte templates lockate / 8 + cele rămase + ~câte sesiuni chat strategic rămase pre-launch + timeline v1 ajustat? — ref `HANDOVER §29.2 Status` + `§14 Updated 2026-05-02` + `§1.2 AMENDMENT timeline`

15. Care 8 backup tags origin post-ingest 2026-05-02 + HEAD pre-ingest + 19 decizii LOCKED breakdown (7 safety + 4 templates + 5 backlog + 3 arhitecturale)? — ref `HANDOVER §15 Tests & Git State` + `§13 Velocity reinforced 2026-05-02`

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

🦫 **Pass criteria ≥12/15 (≥80%) = ALIGNED.** Continui de la stare curentă post-Opus run 2026-05-02. Daniel skip introductions, direct work pe priorități post-2026-05-02: ADR 022 nou Goal-Driven Program Templates (extins cu §29 safety + 4 templates) + sesiune Forță & Dezvoltare template (cel mai complex — periodization + PR tracking + deload weeks, fresh bandwidth obligatoriu) + sesiune Longevitate template (50+ specific) + sesiune distribution strategy reconsider.
