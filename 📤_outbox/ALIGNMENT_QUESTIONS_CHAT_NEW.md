---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 15 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-05-01 morning v2 (handover ingest — chat strategic wording session: Engine 12 variations LOCKED + Phase A aprobate tacit + Decizia #6 + Wording REMAINING). Daniel paste in primul mesaj chat nou — chat răspunde cu citation explicită §X / ADR Y / file.md → pass criteria ≥12/15 corecte.
type: alignment-test
date: 2026-05-01 morning v2 (post handover ingest morning v2)
---

# Alignment Questions — Chat Nou Bootstrap (post 2026-05-01 morning v2 ingest)

**Use:** paste integral în primul mesaj chat Claude nou. Cere chat-ul să răspundă fiecare întrebare cu citation explicită (§X file.md / ADR Y).

**Pass criteria:** ≥12/15 corecte cu citation = **ALIGNED, continuă**. <12 = **INGEST FAIL** (chat-ul citește SSOT din vault prin `project_knowledge_search` și retry).

---

## Engine Wording 12 Variații + Decizia #6 (NEW morning v2)

1. Care 4 verdicte au fiecare câte 3 variații LOCKED (Engine wording)? De ce 3 variants/verdict (rationale anti-wallpaper)? — ref `HANDOVER §23 12 variații complete` + chat morning v2 filozofie

2. Care e refactor-ul arhitectural Recovery (§23) vs §21 baseline? Ce face banner global vs per-exercise? — ref `HANDOVER §23 RECOVERY` + `HANDOVER §21` baseline

3. Decizia #6 Recovery score numeric exposure — care e wording-ul locked (3 statuses) + ce primește Pro tier (decizie globală)? — ref `HANDOVER §23 Decizia #6`

4. Care e implementation pattern variant selector (`hash(today_sv + exercise_id) % 3`)? Ce garanție oferă (consistență per zi/exercițiu)? Ce relație cu D6 fix? — ref `HANDOVER §23 Implementation pattern locked` + `adherence.test.js` D6 fix

## Filter Bugatti + Phase A aprobate tacit (NEW morning v2)

5. Care 6 elemente eliminate prin filter Bugatti în chat morning v2 (cu motivul fiecăruia)? — ref `HANDOVER §23 Filter Bugatti` + `HANDOVER §6.7 Status update morning v2`

6. Phase A toasts/confirms aprobate tacit — care 8 toasts + 3 confirms locked au wording final? Câte toasts + confirms remaining? — ref `HANDOVER §24 Toasts` + `HANDOVER §24 Confirm dialogs`

## Wording REMAINING priorities (NEW morning v2)

7. Care prioritate #1-3 din Phase B engine messaging REMAINING? Câte strings fiecare prioritate? — ref `HANDOVER §25 Phase B engine messaging`

8. `calibration.js` tier names — ce 6 nivele canonical post-D1 + care PUSHBACK Claude pending pentru Tier 4 + Tier 5? — ref `HANDOVER §25 priority #2` + `ADR 009 §AMENDMENT calibration_confidence`

9. F-NEW-4 plan ajustat banner — ce wording locked din chat morning v2 înlocuiește percentage leak? Voce cărei persoane pentru skip reasons? — ref `HANDOVER §25 priority #3` + `HANDOVER §22 F-NEW-4`

10. Care 6 decisions pending pentru next sesiune wording (Daniel gândește între timp)? Care sunt LOCKED morning v2 (#4, #6)? — ref `HANDOVER §25 Decisions pending`

## Governance + Tests state morning v2

11. Care 6 backup tags origin (rollback safe) după ingest morning v2? — ref `HANDOVER §15 Backup tags origin`

12. Tests count post-2026-05-01 morning v2 — câte tests + de ce unchanged vs morning v1? — ref `HANDOVER §15 Tests` + `HANDOVER §6.7 Status update morning v2`

## Preserved 1:1 verification (carry-over morning v1 + earlier)

13. §21 baseline 4 verdict-based wording-uri (LIVE post i18n audit) vs §23 extension 12 variations — care e relația + ce Anti-RE constraints absolute (5 categorii leak interzise)? — ref `HANDOVER §21` + `HANDOVER §23 Relație cu §21` + `ADR 013 §Anti-RE`

14. Care e **pricing locked** Founding Members + Pro standard + iOS post-v1.x? Math revenue 10K users target Year 2-3? — ref `HANDOVER §3` + `PRODUCT_STRATEGY_SPEC_v1 §1.3`

15. Velocity rule reinforced morning v2 — de ce chat strategic ≠ CC velocity? Ce ratio Daniel-time real × bandwidth budgeting? — ref `HANDOVER §13 Velocity rule reinforced morning v2`

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

🦫 **Pass criteria ≥12/15 (≥80%) = ALIGNED.** Continui de la stare curentă post-Opus run morning v2. Daniel skip introductions, direct work pe wording rewrite session next priorities (Phase B #1 readiness verdicts → #2 calibration tier names → #3 plan ajustat banner) sau implementation Sprint 4.x (variant selector + bulk batch i18n cu wording-urile locked din §23 + §24).
