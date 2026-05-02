---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: Alignment questions pentru chat strategic nou post ingest 2026-05-02 SELF-CORRECTION. 14 întrebări verifiable cu citation §X / ADR Y. Pass criteria ≥10/14 (≥71%) cu citation explicit. Acoperă 8 LOCKED noi (§36.28-§36.35) + 3 inline amendments (§36.17/§36.24/§36.26) + 4 ADR drafts extended (MODE_DETECTION + OUTLIER_FILTER + RIR_MATRIX + CASCADE_DEFENSE).
type: alignment-questions
date: 2026-05-02 SELF-CORRECTION
---

# ALIGNMENT QUESTIONS — Chat Strategic Nou Post Ingest SELF-CORRECTION

**Pass criteria:** ≥10/14 răspunsuri cu citation **§X file.md** / **ADR Y** verificabile prin `project_knowledge_search` sau read direct.

**Refuz vag = STOP.** Răspunsuri tip "cred că..." / "din ce-mi amintesc..." / "probabil în §..." = FAIL. Retry `project_knowledge_search` sau regenerează handover.

**Source ingest:** `📤_outbox/_archive/2026-05/59_HANDOVER_INPUT_CONSUMED_2026-05-02_self_correction.md` (consumed) + `06-sessions-log/HANDOVER_GLOBAL §36.28-§36.35` + §36.17/§36.24/§36.26 §AMENDMENT inline + 4 ADR drafts updated în `03-decisions/`.

---

## §1 Realtime Per-Set Recalibration

**Q1.** Când user finalizează set 3 cu drop-off (8 reps în loc de 10), ce face engine? Update e silent sau prompt? Latency budget?

Citation așteptat: `06-sessions-log/HANDOVER_GLOBAL §36.28` SAU `03-decisions/ADR_MODE_DETECTION_UI_v1.md §EXTENSIONS EXT-1`. Răspuns: Engine actualizează valorile pe cartonașul next set (kg/reps) INSTANT, ZERO prompt/modal/animație. Latency budget Layer D check ≤ 50ms acceptable. User vede direct nouă recomandare → execută fără interruption flow.

**Q2.** După set 4 outlier upward (55kg × 11 vs plan 50×10), engine prompt mid-set sau post-session? De ce?

Citation așteptat: `§36.17 §AMENDMENT 2026-05-02 SELF-CORRECTION` + `§36.24 §AMENDMENT 2026-05-02 SELF-CORRECTION`. Răspuns: Post-session-end ONLY, NU mid-set. Mid-set prompt = friction major Executor mode. Engine înregistrează silent valorile, prompt confirmation §36.24 wording standard ("Sesiunea de astăzi pare diferită...") la tap "Termină sesiunea".

---

## §2 §36.26 Streak Counter Same Direction

**Q3.** Marius face Bench Press 3 sesiuni consecutive: (1) 55kg×11, (2) 50kg×10 normal, (3) 55kg×11. Engine declanșează baseline shift la sesiunea 4? De ce?

Citation așteptat: `§36.30` SAU `§36.26 §AMENDMENT 2026-05-02 SELF-CORRECTION` SAU `ADR_OUTLIER_FILTER_v1.md §EXTENSIONS EXT-1`. Răspuns: NU. Sesiunea 2 (revenire normal) resetează counter la 0. Sesiunea 3 outlier upward = counter restart la 1/3. Pentru baseline shift Marius trebuie să livreze 55kg×11 la 3 sesiuni consecutive NEÎNTRERUPTE same direction.

**Q4.** Streak counter este preserve sau reset la User-Triggered Profile Reset (§36.34)? La Goal Shift (§36.35)?

Citation așteptat: `§36.34` + `§36.35` + `ADR_OUTLIER_FILTER_v1.md §EXTENSIONS EXT-3`. Răspuns: Profile Reset = streak **PRESERVE** (UI/UX schimbare, fizicul intact, Marius NU pierde progres real). Goal Shift = streak **RESET la 0** (context fizic schimbat — Estetică→Forță = rep ranges + intensity diferite, signal nou independent).

---

## §3 God Mode RESPINS

**Q5.** De ce God Mode / Advanced Overrides cu Volume Tolerance / Muscle Fiber Profile / Baseline Learning Speed e RESPINS V1?

Citation așteptat: `§36.31` + `01-vision/SUFLET_ANDURA.md §1.1 F6 No-Inference` + ADR Pattern 14. Răspuns: Încalcă SUFLET F6 (engine NU presupune cauze user-declared fără verificare empirică). Self-assessment user notoriu wrong (fast-twitch dominant bazat pe ce?). Maria NU bifează — feature power user only = scope creep beachhead Maria/Gigica/Marius. Gigel test fail (jargon medical). V2 reconsider post-beta dacă Power User cohort confirmă demand.

**Q6.** Cum face Daniel/Marius ajustări agresive fără God Mode?

Citation așteptat: `§36.31` + `§36.28` + `§36.30`. Răspuns: Schimbă greutatea manual la execuție per set → engine adaptează natural via §36.28 silent recalibrare per-set + §36.26+§36.30 streak counter (3 consecutive same direction → baseline shift). Feedback loop natural existent.

---

## §4 Explainability Lazy Generation

**Q7.** Cum se generează diagnostic string pentru "De ce?"? În fundal sau on-demand? De ce?

Citation așteptat: `§36.32` + `ADR_MODE_DETECTION_UI_v1.md §EXTENSIONS EXT-2`. Răspuns: LAZY on-demand la `onClick` butonului `[De ce?]`, NU pre-generate în fundal. Performance budget: zero latency la deschidere ecran antrenament + ≤100ms generare on-demand. Memory minim, battery Android conservator.

**Q8.** Engine output diagnostic include ce 4 elemente?

Citation așteptat: `§36.32` SAU `ADR_MODE_DETECTION_UI_v1.md §EXTENSIONS EXT-2`. Răspuns: (1) Faza progresie (Newbie/Intermediate/Advanced), (2) Last set sesiunea anterioară (validated success/outlier), (3) Streak counter status (X/3 consecutive same direction), (4) Sanity bound aplicat per fază. Wording strings sensibile = Phase B mini-sesiune.

---

## §5 Time-Constrained Adaptive

**Q9.** Maria 65 vede butoanele [25 min] / [45 min] pe ecranul start? De ce sau de ce nu? Cum gestionează ea criză timp?

Citation așteptat: `§36.33`. Răspuns: NU vede. Template-uri Maria deja 30-40 min — 25min ar fi confuz Gigel test fail. Folosește fluxul nativ `[Skip exercițiu]` per card mișcare dacă criză timp.

**Q10.** Ce face algoritm Modul 25min Extreme Crunch (Marius)? Ce face Modul 45min Express Session?

Citation așteptat: `§36.33`. Răspuns: 25min = (1) elimină complet Tier 2 izolare/accesorii, (2) reduce Tier 1 compounds 4 seturi → 2-3 max. 45min = (1) conservă Tier 1 intacte, (2) Tier 2 convertite Supersets A/B sau redus 1 set RIR 0. ZERO inferență de ce user grăbit. Schema impact: exercise library `tier: number` field needed.

---

## §6 Profile Validation Layer

**Q11.** După câte sesiuni se declanșează auditul drift comportamental? De ce 8 NU 12?

Citation așteptat: `§36.34` SAU `ADR_MODE_DETECTION_UI_v1.md §EXTENSIONS EXT-3`. Răspuns: 8 sesiuni complete finalizate post T1+ (NU 12). Aliniat §36.21 spirit completion-based NU calendar. Maria 3×/săpt → ~3 săpt; Marius 4-5×/săpt → ~2 săpt. 12 prea mult — friction prea mare pentru users la frequency mai mică.

**Q12.** Care e threshold pentru declanșare prompt mode shift? 1 din 3 metrici? 2 din 3? 3 din 3?

Citation așteptat: `§36.34` SAU `ADR_MODE_DETECTION_UI_v1.md §EXTENSIONS EXT-3`. Răspuns: **3/3 simultaneous divergence** (NU 1 sau 2). Marius IQ 139 NU tap "De ce?" + rapid pe sumar = ambiguous (2/3) → NU prompt. Filter strict anti-false-positive — protejează users inteligenți rapizi de mode shift greșit. Cooldown post-prompt: 24 sesiuni dacă user refuză.

---

## §7 Goal Shift Event Handler

**Q13.** Marius schimbă goal Estetică → Forță. Baseline 50kg × 10 reps Bench. Ce arată engine?

Citation așteptat: `§36.35` SAU `ADR_OUTLIER_FILTER_v1.md §EXTENSIONS EXT-2`. Răspuns: Engine NU dă cifră fixă (e.g. 57.5kg × 5 reps via single 1RM formula = inferență). Generează **interval** (e.g. 52.5-57.5kg × 5 reps) + mesaj Modul Curios: "Estimat: 52.5 - 57.5 kg × 5 reps. Primele 2 sesiuni după schimbarea obiectivului reprezintă o fază de calibrare." Aliniat SUFLET F1 Triangulation. Streak counter RESET la 0. §36.26+§36.30 rules apply normal post-shift.

---

## §8 Bonus integration

**Q14.** Care e cumulative pre-launch V1 LOCKED count post acest ingest? Câte chat-uri strategice rămase?

Citation așteptat: `§36 EOF session-lock entry SELF-CORRECTION` + `§36.15`. Răspuns: **31 LOCKED** = 12 (Acasă §36.1-§36.15, dintre care §36.1-§36.12 sunt LOCKED noi + §36.13-§36.15 = strategy/lessons/status) + 11 (SUFLET ANDURA §36.16-§36.26) + 8 (Self-Correction §36.28-§36.35). §36.27 = SSOT pointer SUFLET_ANDURA, NU decizie LOCKED nouă. **ZERO sesiuni chat strategic rămase pre-launch V1** (re-confirmed 3rd time). Restul = pure execution Sprint 4.x.

---

## §9 Pass / Fail Criteria

| Score | Status | Acțiune |
|-------|--------|---------|
| ≥12/14 | EXCELLENT | Procede direct la Batch C scope decision sau Daniel ADR review |
| 10-11/14 | PASS | Confirmă alignment + procede |
| 8-9/14 | PASS minimum | Spot-check 2-3 răspunsuri vagi cu retry citation |
| <8/14 | FAIL | STOP. Retry `project_knowledge_search` pe HANDOVER_GLOBAL §36.28-§36.35 + 4 ADR drafts extended. Dacă <8 din nou → regenerare handover input cu fresh chat strategic. |

---

## §10 Production shipping gate critical (cross-ref)

Per `§36.34` + `ADR_MODE_DETECTION_UI_v1.md §EXTENSIONS EXT-4`:

> **STRICT INTERZIS COMPILAREA BUILD PRODUCȚIE** dacă în code base există:
> - String `PHASE_B_LOCK_REQUIRED`
> - String `PHASE_B_WORDING_PENDING`
>
> Build script (CI/CD pre-deploy) verifică grep, fail build dacă match. Forță Phase B mini-sesiune Daniel-validated pentru toate placeholderii înainte launch.

Implementation TBD în Batch C scope.

---

🦫 **Pass criteria: ≥10/14 (≥71%) cu citation §X file.md / ADR Y verificabilă. Refuz vag = STOP, retry sau regenerare handover. Source ingest: `_archive/2026-05/59_HANDOVER_INPUT_CONSUMED_2026-05-02_self_correction.md` + HANDOVER_GLOBAL §36.28-§36.35 + 3 inline §AMENDMENTs (§36.17/§36.24/§36.26) + 4 ADR drafts extended (MODE_DETECTION + OUTLIER_FILTER + RIR_MATRIX + CASCADE_DEFENSE; BIAS_DETECTION untouched). Cumulative pre-launch V1 = 31 LOCKED. Production shipping gate: PHASE_B_LOCK_REQUIRED + PHASE_B_WORDING_PENDING strings absent în code base obligatoriu pre-launch.**
