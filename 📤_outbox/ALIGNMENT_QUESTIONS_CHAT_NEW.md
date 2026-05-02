# ALIGNMENT QUESTIONS — Sprint UI Strategic Chat NEW (8 Active)

**Generat:** 2026-05-02 evening late post Firebase Daniel solo gate 100% complete
**Scope:** 8 Q-uri ACTIVE pentru strategic chat NEW Sprint UI design (7 anterior RESOLVED via §36.73)
**Cumulative LOCKED state:** 64 (unchanged — handover ingest pure status snapshot)
**Format:** anti-hallucination guards (split tranșe + checklist final + per-Q numbering explicit)

---

## ⚠️ MANDATORY PENTRU CHAT-UL CARE PRIMEȘTE ACEST DOCUMENT ⚠️

**Răspunde A/B/C pentru FIECARE Q listată — NU sări, NU re-clusteriza, NU "depinde, vedem".**

**Format obligatoriu per Q:**
```
Q[N]: [A|B|C] — [rationale 1-2 propoziții]
```

**Ai 8 Q-uri active. La final verifică checklist-ul §4 — 8/8 obligatoriu.**

---

## §1 — TRANȘA 1 (Q2-Q5): scope + wording + commerce — 4 Q-uri

### [Q2/8] Strategic chat scope — single sau split?

6 topice UX needed pentru Sprint UI: 3 Card buttons + Goal Shift + DOMS expand + Founding counter + Telegram CTA + PROMPT_VALIDATION trigger.

- **A)** Single chat ~1-2h — toate 6 într-o sesiune (bandwidth Daniel risc dacă lung)
- **B)** Split 2 chats — chat 1 engine UI (Card buttons + Goal Shift + DOMS) / chat 2 commerce-admin (Founding + Telegram + PROMPT_VALIDATION)
- **C)** Split 3 chats — focus 2 topice/chat, slower path la CC Opus

---

### [Q4/8] DOMS expand wording final (ADR_PAIN EXT-1)

ADR_PAIN_DISCOMFORT_BUTTON_v1 EXT-1 LOCKED V1 deja: 2 PRIMARY visible default ("Mișcarea mă deranjează" + "Simt o tensiune ciudată") + 1 SECONDARY behind expand "Mai multe opțiuni" ("Durere musculară severă post-antrenament (DOMS)").

- **A)** Wording final ca-i — copy/paste din ADR EXT-1, NU re-design
- **B)** Re-validate Maria 65 — testați wording cu Gigel persona pre-lock UI
- **C)** Alt wording propus — Daniel are alternativă specifică (indică textul)

---

### [Q5/8] Founding cap counter visibility

§36.50-§36.52 LOCKED: Founding €39 cap 50 users. Atomic counter implementat (BATCH_05 Sprint 4.x). UI integration pending.

- **A)** Public counter "47/50 founding spots remaining" — FOMO/urgency marketing classical
- **B)** Hidden counter — avoid scarcity manipulation perception, Bugatti integrity over conversion
- **C)** Tier-aware — public DOAR pe pricing page, hidden post-conversion (avoid post-purchase regret signal)

---

## §1.bis — checklist tranșă 1

```
[ ] Q2 răspuns
[ ] Q4 răspuns
[ ] Q5 răspuns
```
**3/3 înainte trecere la tranșa 2.**

---

## §2 — TRANȘA 2 (Q6-Q8): UI placement — 3 Q-uri

### [Q6/8] 3 Card buttons grouping logic

3 features: Aparat ocupat/lipsă (smart-routing §36.37) + Pain Discomfort (§36.38) + ?Disconfort (alt third button per §29.5).

- **A)** Single Card 3 separate buttons — visual grouping "Probleme acum?" cu 3 sub-actions (compact, low real estate)
- **B)** 3 distinct Cards independent — fiecare problem type = separate visual entity (mai clar dar takes space)
- **C)** Contextual single Card — appears DOAR mid-session pre-set, hidden la idle / dashboard

---

### [Q7/8] Goal Shift card position

§36.35 + §36.58 GOAL_SHIFT_CALIBRATION_PLACEHOLDER LOCKED V1 wording. Card afișează "Recalibrăm pe noul obiectiv" + counter "Sesiunea ${current}/2".

- **A)** Top dashboard — high visibility primele 2 sesiuni post-shift, dispare după
- **B)** In-flow per session — appears DOAR la session start, dismissable
- **C)** Setări only — confirmation discrete în Setări → Profil & Date, NU intrusive

---

### [Q8/8] Telegram CTA placement

§36.53 + §36.54 LOCKED: Telegram = sole pre-launch community channel.

- **A)** Onboarding screen 4 — early hook înainte first session (high install moment)
- **B)** Setări → Comunitate — discoverable, NU push (respect attention)
- **C)** Post-session prompt 1×/săpt — earned moment after success, soft suggestion

---

## §2.bis — checklist tranșă 2

```
[ ] Q6 răspuns
[ ] Q7 răspuns
[ ] Q8 răspuns
```
**3/3 înainte trecere la tranșa 3.**

---

## §3 — TRANȘA 3 (Q12-Q13): calibration — 2 Q-uri (1-line per Q OK)

### [Q12/8] Future Opus estimates: reduce sau preserve buffer?

Empirical confirmat 3x factor 5-7x: cluster 10-batch ~70min vs 6-8h estimate, single batch §36.73-75 ~10min vs 30-45min estimate, Sprint 4.x cluster ~70min vs 6-8h estimate.

- **A)** Reduce proportional — Sprint UI estimate ~6-10h → reality ~1-2h actual; planning realistic
- **B)** Preserve estimate — buffer pentru edge cases / debugging time, predictable plan
- **C)** Hybrid — communicate ambele (estimate "headline" 6-10h cu "reality factor 5-7x = 1-2h actual likely")

---

### [Q13/8] Daniel-time estimate calibration

§36.72 spune "~2-4h Daniel solo". Daniel solo Firebase actual: ~30-45 min real (per §36.75 evening late HANDOVER ingest).

- **A)** Realistic ~2-4h preserved — preserve original estimate
- **B)** Optimistic ~5-8h — reality include context-switching / deps / docs
- **C)** Pessimistic actual — Daniel mai eficient, ~30-45 min CONFIRMED EMPIRICAL ✅ (recommended LOCK opțiunea C)

---

## §3.bis — checklist tranșă 3

```
[ ] Q12 răspuns
[ ] Q13 răspuns
```
**2/2 înainte verificare finală §4.**

---

## §4 — VERIFICARE FINALĂ MANDATORY (8/8)

**Înainte de a încheia chat-ul / a genera CC prompts, verifică:**

```
[ ] Q2 — Strategic chat scope (single/split 2/split 3)
[ ] Q4 — DOMS wording final (LOCKED V1 ca-i / re-validate / alt)
[ ] Q5 — Founding counter visibility (public / hidden / tier-aware)
[ ] Q6 — 3 Card buttons grouping (single Card / 3 distinct / contextual)
[ ] Q7 — Goal Shift position (top / in-flow / Setări)
[ ] Q8 — Telegram CTA placement (onboarding / Setări / post-session)
[ ] Q12 — Future estimates (reduce / preserve / hybrid)
[ ] Q13 — Daniel-time (A realistic / B optimistic / C empirical confirmed)
```

**Total: 8/8 OBLIGATORIU.** Dacă ai răspuns <8, repornește din tranșa unde ai sărit.

---

## §5 — Q-URI CARE NU APAR (RESOLVED §36.73)

Pentru claritate — **NU re-deschide aceste Q-uri:**

| Q anterior | Status | Resolution |
|---|---|---|
| Q1 (gate strict vs parallel) | RESOLVED | §36.75 Daniel solo gate technical 100% COMPLETE — moot |
| Q3 (CC batch sizing 5/7) | RESOLVED | §36.74 BATCH_PROTOCOL extension default batches — Claude generează N artefacte natural per disjuncte |
| Q9 (Firebase Auth readiness) | RESOLVED | §36.75 DONE live |
| Q10 (DB rules deployment) | RESOLVED | §36.75 published live |
| Q11 (GDPR + Avocat blocking) | Opțiunea C | §36.73 — defer launch oficial, NU pre-Beta închis |
| Q14 (Beta cohorts ratio €) | DEFER | §36.73 — post-Beta cu date piață reale |
| Q15 (Marketing V1.1 reopen) | REJECTED | §36.73 — §36.60 LOCKED defer Februarie 2027 |

---

## §6 — POST-RESPONSES NEXT ACTION

Per §36.74 default batches MANDATORY:

1. ✅ Daniel răspuns 8/8 → Claude generează **N CC prompt artefacte distincte** copy-ready (per disjuncte clean Sprint UI, expected 5-7 batches)
2. ✅ Daniel drag toate N artefacte la `📥_inbox/`
3. ✅ Daniel comandă unică CC Opus: "Rulează toate batch-urile din inbox sequential per §BATCH_PROTOCOL"
4. ✅ CC Opus output: 1 SINGUR raport `📤_outbox/LATEST.md` centralizat final

**NU per-batch reports în chat. NU single mega prompt.** Per §36.74 LOCKED V1.

---

*Generat 2026-05-02 evening late post Firebase Daniel solo gate complete + handover ingest. Anti-hallucination guards: split 3 tranșe + checklist per tranșă + verificare finală 8/8 mandatory + RESOLVED list explicit. Cumulative 64 LOCKED V1 (unchanged — pure status snapshot ingest).*
