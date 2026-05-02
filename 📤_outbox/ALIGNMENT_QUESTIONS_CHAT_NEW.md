---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: Alignment questions pentru chat strategic nou post ingest 2026-05-02 Chat C SELF-CORRECTION EXTENSION. 16 întrebări verifiable cu citation §X / ADR Y. Pass criteria ≥12/16 (≥75%) cu citation explicit. Acoperă 14 LOCKED noi (§36.36-§36.49) + 3 ADR drafts updated (MODE_DETECTION EXT-7 + BIAS_DETECTION EXT-1 + CASCADE_DEFENSE EXT-2). Cumulative pre-launch V1 = 45 LOCKED.
type: alignment-questions
date: 2026-05-02 Chat C Self-Correction Extension
---

# ALIGNMENT QUESTIONS — Chat Strategic Nou Post Ingest Chat C SELF-CORRECTION EXTENSION

**Pass criteria:** ≥12/16 răspunsuri cu citation **§X file.md** / **ADR Y** verificabile prin `project_knowledge_search` sau read direct.

**Refuz vag = STOP.** Răspunsuri tip "cred că..." / "din ce-mi amintesc..." = FAIL. Retry sau regenerează handover.

**Source ingest:** `📤_outbox/_archive/2026-05/61_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_C_self_correction_extension.md` (consumed) + `06-sessions-log/HANDOVER_GLOBAL §36.36-§36.49` + 3 ADR drafts updated în `03-decisions/`.

---

## §1 Schema Extension Exercise Library (§36.36)

**Q1.** Ce câmpuri obligatorii noi se adaugă fiecărui exercițiu din library? Care e diferența între `tier` și `force_demand`?

Citation așteptat: `06-sessions-log/HANDOVER_GLOBAL §36.36`. Răspuns: 5 câmpuri noi: `equipment_type` (enum: barbell/dumbbell/machine/cable/bodyweight/band) + `equipment_alternatives[]` + `force_demand` (high/medium/low) + `muscle_target_primary[]` + `muscle_target_secondary[]`. Plus `tier` (1/2) DEJA în §36.33. Diferență: `tier` = compound vs accesoriu (Time-Constrained logic), `force_demand` = stres sistemic neuromuscular (Smart-Routing logic § Aparat ocupat).

---

## §2 Smart-Routing Aparat Ocupat / Lipsă (§36.37)

**Q2.** Marius la sală: Bench Press ocupat. Ce face engine? Vs DB Curl ocupat — ce face engine? De ce diferă?

Citation așteptat: `§36.37`. Răspuns: Bench Press = `force_demand: high` → Sticky Swap acum (propune alternativă same muscle target, ex: DB Bench). DB Curl = `force_demand: medium/low` → mută la finalul listei sesiunii curente. Diferă pentru că force-dependent → user obosit la final = execuție compromisă; izolare → mutare = friction zero, performance neaffected.

**Q3.** User aparat de Lat Pulldown lipsă — ce face engine?

Citation așteptat: `§36.37 [Aparat lipsă]`. Răspuns: Engine caută în library exerciții cu același `muscle_target_primary` (lats) dar `equipment_type` diferit (ex: benzi elastice / gantere / pull-ups bodyweight) și propune ca fallback.

---

## §3 Pain/Discomfort Button (§36.38)

**Q4.** Care sunt cele 3 opțiuni funcționale ale Pain Button? De ce wording funcțional și NU diagnostic medical?

Citation așteptat: `§36.38`. Răspuns: 🔴 Red Flag "Mă doare să continui" / 🟡 Yellow Flag "E inconfortabil, dar pot încerca" / 🟢 Green Flag "Sunt doar obosit / cu febră musculară". Wording funcțional pentru: (1) SUFLET F6 No-Inference (engine NU diagnoză), (2) Gigel test PASS (Maria 65 distinge funcțional, NU anatomic), (3) Liability — diagnostic medical = scope medical app, NU wellness.

**Q5.** Cazul 🔴 Red Flag — ce 3 butoane apar și care e CTA principal? De ce NU forced skip?

Citation așteptat: `§36.38 Cazul 🔴`. Răspuns: 3 butoane: (1) `[Înlocuiește exercițiul (Sticky Swap)]` = CTA Principal mare colorat, (2) `[Treci peste astăzi]` = Secundar simplu, (3) `[Continui pe răspunderea mea]` = Tertiar text gri NON-CTA. NU forced skip pentru SUFLET F2 "AI-ul informează, nu impune" — autonomy 100% preservat.

**Q6.** Override "Continui pe răspunderea mea" → ce face engine? V1 vs V2?

Citation așteptat: `§36.38 + ADR_BIAS_DETECTION_OBSERVABLE_v1.md §EXT-1`. Răspuns: V1 = log silent în CDL `[user_override_pain_redflag]` cu payload (exerciseId, timestamp, severity, userAcknowledgedRisk: true). ToS Coverage "User-acknowledged risk override". V2 (deferred post-beta) = escalation prompt dacă apăsat 3+ ori în 30 zile.

---

## §4 -20% Consistency Lock (§36.39)

**Q7.** De ce Andura V1 folosește -20% fix în 3 locuri (NU interval 15-20%)? Care sunt cele 3 locuri?

Citation așteptat: `§36.39`. Răspuns: Determinism maxim. Cele 3 locuri: (1) §36.19 Auto-pedeapsă (set N+1 redus manual ≥20% post-success), (2) §36.39 Yellow Flag test load (-20% kg per set), (3) §36.49 Recovery State Adjustment volume reduction (-20%). ZERO interval-uri (15-20% scrap pentru determinism).

---

## §5 Hormonal Estimation RESPINS + Performance State Inference (§36.40)

**Q8.** De ce Hormonal Estimation (cortizol/estrogen/testosteron din patterns) e RESPINS V1? Ce înlocuiește?

Citation așteptat: `§36.40`. Răspuns: 4 motive: (1) Încalcă SUFLET F6 No-Inference (engine inventează biologie internă fără verificare empirică), (2) Validity științifică zero (cortizol salivar variază 200-400% în 24h, NU estimabil din patterns app fitness fără HRV/temp/sleep), (3) Black box engine pentru user → trust breach, (4) Liability risk reputațional ("SalaFull pretinde estimează cortizol fără bloodwork"). Înlocuiește = Performance State Inference observable (Performance Drop + RIR raportat + Stagnare forță, ZERO jargon hormonal).

---

## §6 Composite Signal Layer (§36.41 + §36.48 + §36.49)

**Q9.** Care e trigger-ul Composite Signal Layer? 1, 2 sau 3 metrici simultaneous?

Citation așteptat: `§36.41`. Răspuns: **3/3 simultaneous** (NU 1 sau 2). Trigger = (Performance Drop AND Rest Time Delta AND RIR Mismatch). Per metric: Performance Drop (§36.49 dual-threshold), Rest Time Delta (≥+30% vs baseline personal exercițiu), RIR Mismatch (RIR ≤1 la load ≤90% baseline). Same anti-false-positive pattern ca §36.34 Profile Validation Layer.

**Q10.** Maria 65 DB Bench Press baseline 15kg×10. Curent 15kg×9. Triggerează Composite Signal? De ce?

Citation așteptat: `§36.49 Scenariu A`. Răspuns: NU. Procent drop = 10% ✓ DAR Δ Kg = 0 ✗ AND Δ Reps = 1 ✗. Dual-threshold validated = (Procent ≥ 10%) AND (Δ Kg ≥ 2.5 OR Δ Reps ≥ 2). Singura condiție 1/2 absolută atinsă → FALSE → NU triggerează (false positive evitat).

**Q11.** Lifecycle Recovery State Adjustment — câte sesiuni durează? Ce se întâmplă dacă signals încă active?

Citation așteptat: `§36.41 Lifecycle`. Răspuns: 4 phases: Kick-in (1 sesiune după trigger detectat) → Active (2 sesiuni consecutive cu volum -20%) → Auto-resume (Sesiunea 4 baseline normal). Extension: dacă signals încă active la finalul sesiunii 3 → extend +1 sesiune (max 4 total).

**Q12.** De ce calcul Performance Drop pe avg PER SET COMPLETAT, NU volum total sesiune?

Citation așteptat: `§36.48`. Răspuns: False positive risk: volum total sesiune < baseline pentru că user a folosit `[Aparat ocupat]` (§36.37) sau `[Modul 25min]` (§36.33) = constrângeri context legitime, NU oboseală cronică. Per-set normalization → Composite NU triggerează când set count redus din motive context, doar când performance per set validat scade real. Excluse: seturi `skipped` / `forced-exit` / `time-compressed`.

---

## §7 ADR Review Process (§36.42)

**Q13.** Cum se face Daniel review 5 ADR drafts? Chat sumar 3 propoziții/ADR sau file-by-file?

Citation așteptat: `§36.42`. Răspuns: File-by-file integral, NU chat sumar. Mecanică: (1) Pre-citire Claude integral 5 drafts ~20min, (2) Raport structurat per ADR (consistency cu §36.16-§36.49 + cross-refs validate + edge cases + spec gaps), (3) Verdict per ADR LOCK/amend/reject + propunere wording, (4) Daniel intervine doar pe flagged amend/reject. Timeline ~1-1.5h chat strategic dedicat. Output: Sprint 4.x cluster UNBLOCKED.

---

## §8 Cycle Tracking RESPINS (§36.43)

**Q14.** De ce Cycle Tracking Femei e RESPINS V1? Ce acoperă lacuna?

Citation așteptat: `§36.43`. Răspuns: 4 motive: (1) Încalcă SUFLET F6 No-Inference (engine deduce phase din declared input), (2) Gigel test fail — Maria 65 menopauză vs Gigica 50 perimenopauză vs femeie 25 ciclu regulat = 3 use cases biologice complet diferite, NU pot share single UI, (3) Scope creep beachhead, (4) Composite Signal Layer (§36.41) deja acoperă drop performanță cauzat de cycle/menopauză via observable pure. Coverage compensatorie: V1 prinde "stare biologică schimbată" tacit prin Composite Signal independent de cauză.

---

## §9 Onboarding T0 + T2 (§36.44 + §36.45)

**Q15.** T0 onboarding — care 2 câmpuri sunt obligatorii și care 2 skippable cu fallback synthetic?

Citation așteptat: `§36.44`. Răspuns: **Obligatoriu**: Sex biologic + Vârstă (engine NU poate alege șablonul + capacitate refacere fără). **Skippable cu fallback**: Înălțime + Greutate (median synthetic per (sex × vârstă) din Demographic Prior Database ADR 017). Ex: Femeie 65 → fallback 1.63m/68kg; Bărbat 25 → 1.78m/78kg.

**Q16.** T2 wording final LOCKED — ce întrebare apare la cold-start? Ce mode-uri mapează?

Citation așteptat: `§36.45 + ADR_MODE_DETECTION_UI_v1.md §EXT-7`. Răspuns: *"Cum preferi să îți afișăm instrucțiunile?"* cu 2 opțiuni: (1) "Vreau doar să văd greutatea și repetările" → Mode Map: Executor (internal). (2) "Vreau să înțeleg și de ce s-au schimbat numerele" → Mode Map: Strategic (internal). Wording funcțional, NU jargon profile names ("Strategic" exposed = Gigel test fail Maria 65). Plasă siguranță: §36.17 behavioral triggers + §36.34 auto-correction la 8 sesiuni.

---

## §10 Pass / Fail Criteria

| Score | Status | Acțiune |
|-------|--------|---------|
| ≥14/16 | EXCELLENT | Procede direct la ADR review §36.42 sau Batch C scope decision |
| 12-13/16 | PASS | Confirmă alignment + procede |
| 10-11/16 | PASS minimum | Spot-check 2-3 răspunsuri vagi cu retry citation |
| <10/16 | FAIL | STOP. Retry `project_knowledge_search` pe HANDOVER_GLOBAL §36.36-§36.49 + 3 ADR drafts updated. Dacă <10 din nou → regenerare handover input cu fresh chat strategic. |

---

## §11 Bonus context

**Cumulative pre-launch V1 = 45 LOCKED:**
- 12 Acasă chat strategic (§36.1-§36.12 + §36.13-§36.15 strategy/lessons/status)
- 11 SUFLET ANDURA (§36.16-§36.26)
- 8 SELF-CORRECTION (§36.28-§36.35)
- 14 Chat C SELF-CORRECTION EXTENSION (§36.36-§36.49)

**ZERO sesiuni chat strategic STRATEGIC rămase pre-launch V1.** REMAINING doar tactical (~3h cumulative): ADR review 1.5h + Phase B wording 45min + Discord/Founding 25min.

**3 NEW ADR drafts pending** Sprint 4.x cluster batch (defer creation):
- `ADR_COMPOSITE_SIGNAL_LAYER_v1.md` (§36.41 + §36.48 + §36.49)
- `ADR_PAIN_DISCOMFORT_BUTTON_v1.md` (§36.38)
- `ADR_SMART_ROUTING_EQUIPMENT_v1.md` (§36.36 + §36.37)

**Sprint 4.x cluster scope refined: ~18-25h Opus comprehensive** (Suflet Andura + Self-Correction + Chat C combined, single batch acoperă 5 ADR-uri post-LOCK + 14 LOCKED noi Chat C).

---

🦫 **Pass criteria: ≥12/16 (≥75%) cu citation §X file.md / ADR Y verificabilă. Refuz vag = STOP, retry sau regenerare. Source ingest: `_archive/2026-05/61_*` (consumed) + HANDOVER_GLOBAL §36.36-§36.49 + 3 ADR drafts updated (MODE_DETECTION EXT-7 + BIAS_DETECTION EXT-1 + CASCADE_DEFENSE EXT-2). Cumulative pre-launch V1 = 45 LOCKED. ZERO sesiuni strategic rămase. Next: ADR review 5 drafts file-by-file (§36.42) → Sprint 4.x cluster UNBLOCKED.**
