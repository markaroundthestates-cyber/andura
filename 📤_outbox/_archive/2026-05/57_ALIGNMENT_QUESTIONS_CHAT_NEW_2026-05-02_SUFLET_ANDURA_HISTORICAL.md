---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: Alignment questions pentru chat strategic nou post ingest 2026-05-02 SUFLET ANDURA. 18 întrebări verifiable cu citation §X / ADR Y. Pass criteria ≥12/15 (≥80%) cu citation explicit. Refuz vag = STOP, retry `project_knowledge_search` sau regenerare. Acoperă 11 LOCKED new (§36.16-§36.26) + SUFLET_ANDURA SSOT + 5 ADR drafts + P1 BLOCKER context.
type: alignment-questions
date: 2026-05-02 SUFLET ANDURA
---

# ALIGNMENT QUESTIONS — Chat Strategic Nou Post Ingest SUFLET ANDURA

**Pass criteria:** ≥12/15 răspunsuri cu citation **§X file.md** / **ADR Y** verificabile prin `project_knowledge_search` sau read direct.

**Refuz vag = STOP.** Răspunsuri tip "cred că e undeva în..." / "probabil în §29..." / "din ce-mi amintesc..." = FAIL. Retry cu citation explicit sau regenerează handover.

**Source ingest:** `📤_outbox/_archive/2026-05/53_HANDOVER_INPUT_CONSUMED_2026-05-02_suflet_andura.md` (consumed) + `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md §36.16-§36.27` + `01-vision/SUFLET_ANDURA.md` + `03-decisions/ADR_*_v1.md` (5 drafts).

---

## §1 RIR Matrix Adaptiv (§36.16)

**Q1. Care e mapping-ul verbal → RIR numeric pentru Maria 65 pe Sit-to-Stand "Foarte greu"? Ce acțiune ia engine-ul?**

Citation așteptat: `06-sessions-log/HANDOVER_GLOBAL §36.16` SAU `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md`. Răspuns: RIR 0-1 → reduce reps (NU sets), păstrează min 2 sets ca prag stimulare neuro-musculară.

**Q2. Ce se întâmplă când Marius 25 raportează "Foarte greu" la RDL o singură dată? Dar 3 sesiuni consecutive same lift?**

Citation așteptat: `§36.16` SAU `ADR_RIR_MATRIX_ADAPTIVE_v1`. Răspuns: Single RIR 0 ≠ deload immediate (legitim 1RM testing). 3 sesiuni consecutive same exercise → micro-deload activate.

---

## §2 4 Moduri UI Detection (§36.17)

**Q3. Care sunt cele 5 moduri detectate (4+1) și ce trigger UI deterministic are fiecare? De ce NU language analysis?**

Citation așteptat: `§36.17` SAU `ADR_MODE_DETECTION_UI_v1.md`. Răspuns: Executor (tap rapid + skip) / Curios+Strategic comasat (tap "De ce?" / denumire / grafic) / Frustrat Tehnic (3 retry + Skip exercițiu) / Frustrat Viață (2+ skip aceeași săpt) / Validation-Seeking (scroll repetat trend grafic + stagnation 7+ zile). NU language analysis pentru că Andura V1 = app cu UI, NU chat (per ADR 002 REST not SDK + zero NLP runtime).

**Q4. Ce wording LOCKED V1 are toast-ul Validation-Seeking?**

Citation așteptat: `§36.17`. Răspuns verbatim: "Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează."

**Q5. Cum interacționează modurile cu §22 F-NEW-4? Care trigger UI activează banner-ul "Plan ajustat astăzi pentru recovery."?**

Citation așteptat: `§22 §AMENDMENT 2026-05-02 SUFLET` + `§36.17`. Răspuns: Frustrat Viață mode (trigger 2+ skip aceeași săpt) → output banner F-NEW-4 LOCKED + buton "Folosesc varianta mea". Mode detection precedă banner display — banner NU se afișează la primul skip izolat.

---

## §3 Bias Detection Observabilă V1 (§36.18 + §36.19 + §36.20)

**Q6. Care e trigger-ul Volume Creep și ce wording prompt LOCKED V1?**

Citation așteptat: `§36.18` SAU `ADR_BIAS_DETECTION_OBSERVABLE_v1.md`. Răspuns: Trigger = `(seturi finalizate la RPE >= 8) AND (User apasă "Adaugă set" 2× consecutiv same exercise)`. Wording LOCKED: *"Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?"* + buttons [Continuă] [Sunt OK fără]. Friction in-moment, NU blocaj autonomy. Recap silent CDL la final session.

**Q7. Care e trigger-ul Auto-pedeapsă? De ce engine NU blochează acțiunea?**

Citation așteptat: `§36.19` SAU `ADR_BIAS_DETECTION_OBSERVABLE_v1.md`. Răspuns: Trigger = `(Setul N validat la RIR optim per §36.16) AND (Setul N+1 are greutatea redusă manual cu >=20%)`. Engine NU blochează (autonomy 100%), doar prompt informativ neutru data-driven. Filozofie: ZERO paternalism guru-style. ZERO "corpul tău poate susține" predictiv (engine NU știe).

**Q8. De ce Catastrofizare detection a fost SCRAP V1? Ce acoperă lacuna?**

Citation așteptat: `§36.20` SAU `ADR_BIAS_DETECTION_OBSERVABLE_v1.md`. Răspuns: User-ul matur care vede 2+ skip-uri și încearcă manual Reset/Deload e act de **realism + autonomy**, NU bias negativ. Trigger anterior trata user infantil. V1 coverage: banner Anti-RE §22 F-NEW-4 acoperă ~80% risc abandon. V2 reconsider: catastrofizare reală = abandon proces (tap "Termină programul" / dezinstalare / reduce manual frecvență 4×→1×).

---

## §4 T1+ Onboarding (§36.21 + §36.22)

**Q9. Ce trigger deblochează T1+? De ce NU calendar-based?**

Citation așteptat: `§36.21` SAU `06-sessions-log/HANDOVER_GLOBAL §29.5.14 §AMENDMENT 2026-05-02 SUFLET`. Răspuns: Trigger = **4 sesiuni de antrenament finalizate complet** după T0 onboarding. NU calendar (anterior 7 zile fixe) pentru că self-paces — Marius 7-10 zile (4×/săpt), Maria 14-21 zile (3×/săpt). Engine adaptă la rhythm real, NU presupune calendar.

**Q10. Care sunt cele 3 câmpuri minime T1+ Gigel-validated? De ce "Nu știu sigur" e critical pe câmp 3?**

Citation așteptat: `§36.22`. Răspuns: (1) Istoric greutate medie 3-6 luni (numeric), (2) Activitate zilnică [Sedentar/Activ/Foarte activ], (3) Istoric nutrițional ["Ai mâncat mai puțin decât de obicei?"] [Da/Nu/Nu știu sigur]. "Nu știu sigur" critical pentru că engine consideră potential deficit history → calibrare conservativă. NO jargon "deficit caloric" / "dietă restrictivă" (Gigel test fail Maria 65).

---

## §5 Android Eviction & Outlier (§36.23 + §36.24 + §36.26)

**Q11. Cum se mitigăează Android low-storage eviction + flight mode mid-session?**

Citation așteptat: `§36.23` SAU `06-sessions-log/HANDOVER_GLOBAL §33.2 §AMENDMENT 2026-05-02 SUFLET`. Răspuns: Sync Validation pre-close session — înainte tap "Termină sesiunea" → app validate sync Firebase RTDB în fundal. Sync fail → ecran sumar message: *"Datele tale nu au fost încă salvate în cloud. Te rugăm să verifici conexiunea la internet pentru a preveni pierderea istoricului."* Sesiune saved local IndexedDB până next sync reușit. Excludem context iOS Safari (Android-only LOCKED §36.2).

**Q12. Ce praguri outlier are Maria 65 izolare vs Marius 25 compus? Ce wording LOCKED V1 are prompt-ul ASK?**

Citation așteptat: `§36.24` SAU `ADR_OUTLIER_FILTER_v1.md`. Răspuns: Maria ±3 reps SAU ±5 kg (greutate corporală/izolare). Marius ±4 reps SAU ±20% greutate (mișcări compuse grele). Wording LOCKED: *"Sesiunea de astăzi pare diferită față de istoricul tău. Confirmă dacă greutatea și repetările introduse sunt corecte sau corectează-le."* + buttons [Confirm valorile] [Corectez valorile]. ASK don't IGNORE — ZERO inference cauză.

**Q13. Ce face engine-ul când 1 sesiune outlier e confirmată? Dar când 3 sesiuni consecutive same exercise sunt low day?**

Citation așteptat: `§36.26` SAU `ADR_OUTLIER_FILTER_v1.md`. Răspuns: 1 izolată → CDL note "low day flag", baseline UNCHANGED next session (presupunem zi proastă: somn slab, stres, glicemie). 3 consecutive same exercise low day → ABIA acum baseline shift downward (regresie reală). **Filozofie: Bayesian rigidity prevention** — single data point NU recalibrează priors agresiv. 3 consecutive = signal real, NOT noise.

---

## §6 Cascade Defense 4 Layers (§36.25)

**Q14. Care sunt cele 4 layers și ce face fiecare? Ce hard cap absolut anti-bug global apără indiferent de profil?**

Citation așteptat: `§36.25` SAU `ADR_CASCADE_DEFENSE_v1.md`. Răspuns:
- **Layer A** Schema Validation Runtime (`isValidExercise(recommendation.id)` → invalid = throw + log CDL + safe default profile-aware, NU propagate cascade)
- **Layer B** Confidence Score INTERNAL signal (NU user-facing default; user-facing DOAR în 2 cazuri: outlier confirmation + confidence DROPS HIGH→LOW mid-program)
- **Layer C** Sanity Bounds Per Phase (Newbie săpt 1-8 +10% / Intermediate 8-26 +5% / Advanced 26+ +2.5%) + **Hard cap absolut +20% săpt ORICE exercițiu** (anti-bug calcul/tastare). Maria Sit-to-Stand max 12 reps/set.
- **Layer D** Runtime Invariant Checks (volum total today ≤ 1.5× last week, recommendation.kg > 0, reps in [1,30], sets in [1,6]) → violare = reset + baseline conservativ + CDL log.

**Q15. De ce Confidence Score rămâne INTERNAL signal și nu user-facing default? În ce 2 cazuri devine user-facing?**

Citation așteptat: `§36.25 Layer B`. Răspuns: Anti-friction onboarding — prima săpt 4 sesiuni TOATE LOW confidence (zero istoric), display user = friction inutil. Banner onboarding generic acoperă: *"Programul se calibrează pe ritmul tău. Primele 4 sesiuni = baseline."* User-facing DOAR în: (1) Outlier confirmation prompt (per §36.24), (2) Confidence DROPS HIGH→LOW mid-program (regresie reală signal).

---

## §7 SUFLET_ANDURA SSOT (`01-vision/SUFLET_ANDURA.md`)

**Q16. Care e filter-ul dual gate peste filtrul Bugatti pentru engine modules noi? Ce procente ale "sufletului" sunt replicabile V1 vs irreplicable vs V2+ defer?**

Citation așteptat: `01-vision/SUFLET_ANDURA.md` §0 + §1. Răspuns: Filter dual gate = "Bugatti engineer mândru?" + "e în sufletul andura?". Procente: ~75% replicabil V1 engine deterministic (F1-F9 listed în §1.1 — triangulation, bias detection, mode detection, push-back proporțional, no-inference, causal chains, antifragile, sequence-dependent phasing) + ~15% MAI BINE decât Claude conversational (consistency + latency <100ms vs 3-8s + privacy local-first + predictabilitate + calibrare bayesian-style real) + ~10% IRREPLICABLE V1 (improvisation edge case nou + conversation depth bidirectional + meta-recunoaștere paste alt AI) + ~30% V2+ defer (onboarding cronologic 12 luni + photo quality gate + bias detection nutrition-based).

**Q17. Care 4 patterns din suflet NU se traduc în V1? De ce "Logging precis cerere" e ELIMINAT explicit?**

Citation așteptat: `01-vision/SUFLET_ANDURA.md` §2. Răspuns: (1) Conversație extensivă (Andura V1 = app cu UI, NU chat), (2) Paste output alt AI (NU use case Maria/Gigica), (3) Yevhen Shein calibrare brutală (presupune end-goal vizual encoded, Maria NU are), (4) Logging precis cerere — **contradicting viziunea Andura, ELIMINAT EXPLICIT**. Andura nu cere logging precis. User dă feedback verbal simplu (Ușor/Potrivit/Foarte greu) → engine traduce intern (per §36.16 RIR Matrix Adaptiv).

---

## §8 P1 BLOCKER + ADR drafts status

**Q18. Care e P1 BLOCKER documentat în DIFF_FLAGS.md și ce 5 ADR drafts sunt pending Daniel review?**

Citation așteptat: `📤_outbox/DIFF_FLAGS.md` + `03-decisions/ADR_*_v1.md` (5 files). Răspuns:

**P1 BLOCKER:** Source document `Procesul_de_gandire_complet.md` (~12k cuvinte filozofie permanent) referenced în handover §1.1 dar NU prezent în inbox. Per VAULT_RULES §5 zero-info-loss principle, fabricarea content INTERZISĂ. SUFLET_ANDURA §4 "Filozofia Completă" = STUB clear marcat. Daniel upload needed pentru completare.

**5 ADR drafts** (toate status `DRAFT — pending Daniel review`):
1. `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (origin §36.16)
2. `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (origin §36.17)
3. `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (origin §36.18 + §36.19 + §36.20)
4. `03-decisions/ADR_OUTLIER_FILTER_v1.md` (origin §36.24 + §36.26)
5. `03-decisions/ADR_CASCADE_DEFENSE_v1.md` (origin §36.25)

ADR-urile NU LOCKED automatic. Implementation Sprint 4.x cluster blocked pe LOCK status.

---

## §9 Bonus integration questions (cross-section)

**Q19. (Bonus) Care e total estimate Suflet Andura Implementation Cluster și de ce e self-contained?**

Citation așteptat: `06-sessions-log/HANDOVER_GLOBAL §34.4`. Răspuns: ~14-18h Opus comprehensive (~2-3h wall-clock). Self-contained = codificabil direct fără dependencies externe (Bias Detection + Mode Detection + RIR Matrix + Outlier + Cascade Defense + T1+ + Android Eviction). Single batch acoperă 5 ADR-uri post-LOCK. Total breakdown: RIR Matrix ~2-3h + 4 Moduri UI ~2-3h + Bias Detection ~2h + T1+ ~2h + Android Eviction ~1h + Outlier ~2-3h + Cascade Defense ~3-4h.

**Q20. (Bonus) Decizii LOCKED cumulative pre-launch V1 = ?**

Citation așteptat: `06-sessions-log/HANDOVER_GLOBAL §36 EOF session-lock entry SUFLET ANDURA`. Răspuns: **23 decizii LOCKED cumulative** = 12 din "Acasă" Gemini cross-check (§36.1-§36.12 + §36.13 Beta strategy + §36.14 Lessons + §36.15 Status, dintre care 12 LOCKED noi din §36.1-§36.12) + 11 SUFLET ANDURA (§36.16-§36.26). §36.27 = SSOT pointer SUFLET_ANDURA, NU LOCKED decizie nouă.

---

## §10 Pass / Fail Criteria

| Score | Status | Acțiune |
|-------|--------|---------|
| ≥17/20 | EXCELLENT | Procede direct la Batch C scope decision sau Daniel ADR review |
| 14-16/20 | PASS | Confirmă alignment + procede |
| 12-13/20 | PASS minimum | Spot-check 2-3 răspunsuri vagi cu retry citation |
| <12/20 | FAIL | STOP. Retry `project_knowledge_search` pe HANDOVER_GLOBAL §36 + SUFLET_ANDURA. Dacă <12 din nou → regenerare handover input cu fresh chat strategic. |

---

🦫 **Pass criteria: ≥12/15 (≥80%) cu citation §X file.md / ADR Y verificabilă. Refuz vag = STOP, retry `project_knowledge_search` sau regenerare handover. Source ingest: `_archive/2026-05/53_HANDOVER_INPUT_CONSUMED_2026-05-02_suflet_andura.md` + `HANDOVER_GLOBAL §36.16-§36.27` + `SUFLET_ANDURA.md` + 5 ADR drafts. P1 BLOCKER: 12k cuvinte filozofie sursă pending Daniel upload.**
