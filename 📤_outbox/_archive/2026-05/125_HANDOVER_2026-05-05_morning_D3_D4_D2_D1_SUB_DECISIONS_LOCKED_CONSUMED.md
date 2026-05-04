# HANDOVER 2026-05-05 morning — D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED V1 (~41 substantive)

**Source chat:** Claude chat strategic 2026-05-05 morning (post-alignment 12/12 PASS pe §45-§49 ingest 2026-05-04 night).
**Pre-session cumulative LOCKED:** 175 V1 (post §45-§49 ingest).
**Post-session cumulative LOCKED:** **216 V1** (+41 substantive sub-decisions: D3.1 13 + D4 11 + D2 13 + D1 7 + naming clarification 2 minus overlap = 41 net).
**Status chat:** ✅ COMPLETE clean (handover scris la ~22% bandwidth fresh, NU saturat).

---

## §50 Status: ✅ COMPLETE

Chat strategic dedicat sub-decisions D3.1 (Buton "Nu vreau") + D4 NEW (Mid-Session Resume Protocol) + D2 (Injury/Contraindication Mapping) + D1 (Save the Week Silent). Total **41 substantive sub-decisions LOCKED V1** ready compile ADR 026 draft full chat strategic NEW dedicat.

**Context arhitectural confirmat:**
- D3.1 + D4 + D2 + D1 = sub-decisions ortogonale față de spec engine Periodization (§42.4 prima spec generation post ADR 026 compile)
- Toate 4 clusters integrate ADR 026 când chat strategic NEW dedicat compile draft full
- Naming distinction LOCKED: "Circuit Breaker population fallback 5%" (§42.7) vs "User adaptation signal 50%" (D1 Q7 individual user pattern)
- Pattern reuse extensiv: Q20 LOCKED 3/4 threshold (§45.3) reused în D4 Q7+Q8 + D1 Q2+Q3; §42.7 Circuit Breaker reused în D3.1 Q10 + D1 Q7; §42.9 Safety tier extended cu invariant 5 "Medical Safety" în D2 Q7

---

## §50.1 D3.1 Buton "Nu vreau" SUB-DECISIONS LOCKED V1 (10 Q + 3 refinements = 13 sub-decisions)

**Parent:** §36.107 D3.1 LOCKED PRE-BETA mandatory (rationale SUFLET F5).
**D3.1.1 LOCKED V1 pre-existing** (3 butoane up-front + 3 categorii semantic Maria 65 frictionless): Nu vreau (Contextual / no-memory) + Nu am chef (Psihologic / no-memory) + Nu pot (Mecanic-Fizic / blacklist permanent cross-session).

### §50.1.1 Q1 Storage layer "Nu pot" blacklist — B Firestore sync ✅ LOCKED

Asigură consistența datelor multi-device (telefon + tabletă). Blacklist persistent salvat direct Firestore (deja live prod). Cross-device consistency Maria 65 critical.

### §50.1.2 Q2 Schema JSON shape — B Object `{ exerciseId: { timestamp, intent } }` ✅ LOCKED

Single Source of Truth în format obiect. Timestamp = trasabilitate completă + permite curățare automată "Nu vreau"/"Nu am chef" (no-memory) sau analiză istoric refuzuri.

### §50.1.3 Q3 Sync multi-device "Nu pot" — B Eventual consistency on session start ✅ LOCKED

Offline-first §36.99 preserved. Sync background la deschidere app, fără real-time listeners (NU CPU/battery overhead).

### §50.1.4 Q4 Substitute primary match criteria — B Same muscle + movement pattern ✅ LOCKED

Push/pull/hinge/squat patterns. Equipment handle separat alternativeEngine ADR 023 (NU dublu work).

### §50.1.5 Q5 Re-roll după 2 refuzuri consecutive — B 3 fresh batch + Hard Cap ✅ LOCKED

Listă nouă 3 exerciții după refuze 2 alternative. **Hard Cap LOCKED V1 refinement:** maximum 2 re-rolls = 1 primary + 2 alt + 3 fresh batch = 7 încercări total. La epuizare → fallback Q7 A (skip exercise + log telemetry CDL refuse pattern). Anti decision fatigue + anti infinite loop.

### §50.1.6 Q6 Substitute persistence intra-mesociclu — B Lock primary substitute pe durata mesociclului + Sub-decision Unlock ✅ LOCKED

Substitute acceptat = lock pe restul săpt mesociclu (asigură progressive overload week-to-week + tracking volume corect). **Sub-decision Unlock LOCKED V1 refinement:** Dacă week 2 user dă "Nu vreau"/"Nu pot" pe substitute lock-uit → unlock + new resolver round; volume tracking continuă la nivel grup muscular (§42.10 Periodization Engine), NU restart mesociclu integral. Mapare muscle-group-level confirmed (NU exerciseId specific).

### §50.1.7 Q7 Edge case ZERO substitute viable — A Skip exercise + log telemetry ✅ LOCKED

Caz extrem (deadlift heavy compound, alternative epuizate). Skip exercise + Circuit Breaker 5% threshold §42.7 reuse pentru raportare telemetrie.

### §50.1.8 Q8 "Nu vreau"/"Nu am chef" reset window — A Imediat next session (zero memory) ✅ LOCKED

Per D3.1.1 LOCKED "no-memory next session". Preserves user agency, NU paternalism. State butoane reset complet next session, motorul sugerează din nou mișcările dacă optime.

### §50.1.9 Q9 "Nu pot" Settings UI shape — A Listă simplă + unblock button per item ✅ LOCKED

Maria 65 frictionless minimalistă. Greșeală tap "Nu pot" → reintroduce mișcare 1 tap unblock. NU overengineering pre-Beta (B/C scope creep).

### §50.1.10 Q10 Telemetry CDL track refuzuri — B Aggregate count per exerciseId silent ✅ LOCKED

CDL passive §42.7 pattern reuse. Circuit Breaker trigger Knowledge Sprint dacă rate refuzuri high segment. Per intent type ratio (Nu vreau/Nu am chef/Nu pot) = scope creep deferred post-Beta.

### §50.1.11 D3.1.6 NEW Pattern Detection Passive (Prevenirea Iritării) ✅ LOCKED V1

**Regulă asistență cognitivă:** Deși zero-memory la nivel sesiune (Q8), sistemul monitorizează în fundal user refuzuri consecutive aceeași exercițiu **3-5 ori** prin "Nu vreau"/"Nu am chef".

**Acțiune UI:** Soft prompt discret: "Observăm că eviți acest exercițiu. Vrei să-l excluzi permanent din program?" + scurtătură directă Setări → Exerciții Excluse. Decizie finală 100% control utilizator. NU auto-blacklist (paternalism). Bugatti F4 cognitive friction anticipată.

---

## §50.2 D4 NEW Mid-Session Resume Protocol SUB-DECISIONS LOCKED V1 (10 Q + D4.2.1 NEW = 11 sub-decisions)

**Parent:** NEW topic deschis 2026-05-02 Daniel (DEFERRED). Cross-ref: §36.55.4 LOCKED abandoned session neutral streak (related, distinct scope).

### §50.2.1 Q1 Auto-save granularity (D4.1) — A Per set logged silent IndexedDB ✅ LOCKED

Salvare automată în fundal la fiecare set încheiat. Fricțiune zero, în caz închidere forțată NU se pierde niciun set valid.

### §50.2.2 Q2 Storage layer auto-save — A IndexedDB ✅ LOCKED

Offline-first §36.99 preserved. Capacity OK pentru session state. Evită limite localStorage + nu consumă baterie ca real-time sync.

### §50.2.3 Q3 Sync Firestore timing — B On session complete ✅ LOCKED

Sesiunea locală trimisă cloud DOAR la "Încheie antrenamentul". Protejează traffic data + battery în timp efort.

### §50.2.4 Q4 Resume prompt UX (D4.2) — A Dialog blocking imediat la app open ✅ LOCKED

Modal blocking deschidere app cu sesiune întreruptă. Maria 65 decide clar: Reia / Începe nouă / Marchează completă. Zero ambiguitate, NU elemente ascunse.

### §50.2.5 Q5 Resume prompt actions — A 3 opțiuni (Reia / Începe nouă / Marchează completă) ✅ LOCKED

Per spec D4.2. "Marchează completă" critical pentru sesiune ~80% terminată user uitat să închidă (își amintește ore mai târziu).

### §50.2.6 D4.2.1 NEW Filtrarea Dialogului Blocant pe Threshold ✅ LOCKED V1

**Regulă:** Eliminăm fricțiune cognitivă pentru sesiuni vechi abandoned. Sistem împarte scenarii pe threshold t=6h:

| Scenariu | Condiție Timp | Acțiune Backend | Impact UI |
|----------|---------------|-----------------|-----------|
| **Sesiune Recuperabilă** | Δt ≤ 6h ultima activitate | Stare IndexedDB intactă | Dialog blocking imediat: Reia / Închide / Începe nouă |
| **Sesiune Abandonată** | Δt > 6h ultima activitate | Auto-marked abandoned background (Silent Cleanup) + neutral streak §36.55.4 | Zero prompt UI: user intră direct app (Suflet, istoric, setări) fără întrerupere |

**Bugatti F4 anticipează:** Maria 65 vine să citească Suflet → NU dau dialog despre antrenament de ieri uitat. Sesiune abandoned >threshold = sistem decide silent, NU întreabă.

### §50.2.7 Q6 Timeout abandon threshold (D4.3) — B 6h ✅ LOCKED

Permite pauze realiste zi (muncă, urgențe, drumuri). Întrerupere >6h = abandonare completă zi mental + fiziologic.

### §50.2.8 Q7 Engine treatment partial session §42.10 (D4.4) — B Credit parțial proporțional (reuse §45.3) ✅ LOCKED

Aplică direct regula matricei volum existing:
- **Efort per exercițiu ≥ 50% seturi → exercițiul contorizat**
- **Efort per sesiune ≥ 3/4 exerciții → săptămâna completă (cu skip progresie)**
- **Sub praguri → repetare săptămână N integral**

Reuse Q20 LOCKED 3/4 threshold rule §45.3. NU duplicate logic, extend pattern existing.

### §50.2.9 Q8 Impact partial session deload trigger Q10 mesocycle — C Count cu intensity hold next ✅ LOCKED

Săptămâna parțială contorizată în ciclu 4-săpt deload. Next session intensitate înghețată nivel anterior pentru evitare risc accidentare/supraantrenament. Reuse Q20 LOCKED "Resume + intensity hold" pattern.

### §50.2.10 Q9 Scenarii A/B/C handler (D4.5) — B Unified state machine 3 entry points ✅ LOCKED

Single source resume logic, 3 entry points:
- A Background restore (app în background / lock screen seamless resume)
- B IndexedDB recovery (force kill / restart / baterie moartă)
- C localStorage offline persistence (offline mid-set până reconectare)

Același reducer central. NU duplicate code drift risk. Codul nu se duplică, riscul erori scade la zero.

### §50.2.11 Q10 Crash mid-set recovery edge — A Last completed set saved + current incomplete discarded ✅ LOCKED

Stare date perfect curată, fără estimări/date parțiale corupte. User încredere totală istoric afișat. Reintroducere set <30s if needed = trust > false memory.

---

## §50.3 D2 Injury/Contraindication Mapping SUB-DECISIONS LOCKED V1 (10 Q + 3 sub-decisions D2.3 = 13 sub-decisions)

**Parent:** §36.107 D2 LOCKED PRE-BETA mandatory + Q24 Safe Baseline pre-Beta (§45.4 +RIR ≥ 1 universal + Marius 25 Advanced 85% 1RM cap) + Safety tier composition Q3 (§45.2 +4 invariants §42.9 + ADR 023 contraindication overrides).

**Topic critic:** MOAT real Andura, intersect Safety tier §42.9 + ADR 023 contraindication overrides. Gigel test brutal aici (Maria 65 hernie disc).

### §50.3.1 Q1 Scope intake injuries onboarding — B Preset list (~15-20 condiții comune) ✅ LOCKED

Listă fixă opțiuni clare (lumbar, knee, shoulder, hypertension, cervicale, etc.). Elimină risc parsare greșită text liber + halucinație contraindication LLM. Maria 65 frictionless bifează zonă sensibilă. Expand quarterly Knowledge Sprint.

### §50.3.2 Q2 Severity grading per condition — B 3-tier (ușor/moderat/sever) ✅ LOCKED

- **Sever** → Blacklist permanent pe tiparul mișcare afectat
- **Moderat** → Plafonare automată intensitate (RIR ≥ 2, max 75% 1RM)
- **Ușor** → Monitorizare pasivă fără modificări agresive volum

Maria 65 cognitive simple. Engine map → exercise filter strict per tier.

### §50.3.3 Q3 Contraindication source authority — C Curated subset + literature ref per condition ✅ LOCKED

Bază date internă Andura curatoriată + referințe literatură specialitate per condiție. Rigoare științifică maximă + transparență totală. Evită "sfat medical nesolicitat" liability.

### §50.3.4 D2.3.1 Sursa V1 — C Public guidelines NSCA + ACSM + Daniel curate subset ✅ LOCKED V1

Standardizare publică oficială. Cost 0. Audit-trail public sources = legal defense layer real + rigor max. Daniel curate subset relevant Andura V1.

### §50.3.5 D2.3.2 Update cadence — Quarterly unified Knowledge Sprint ✅ LOCKED V1

Actualizări medicale exclusiv Knowledge Sprint general pre-Beta. Anti scope creep clar. NU separate medical-specific cadence.

### §50.3.6 D2.3.3 Disclaimer UI legal cover — Mandatory consent onboarding + per-condition disclaimer ✅ LOCKED V1

Onboarding consent text + per-condition disclaimer "informații generale, NU înlocuiește consult medical; consultă medic specialist". Audit legal §46 P4 prerequisite anyway, codify acum lock.

### §50.3.7 Q4 Pain mid-session real-time handling — A New D2 button "Mă doare" (separat de D3.1 "Nu pot") ✅ LOCKED

**Semantic distinct critical:**
- **"Nu pot"** (D3.1) = mecanic anticipat onboarding/pre-session = blacklist permanent muscle pattern
- **"Mă doare"** (D2 NEW) = acut mid-set = STOP exercise + log severity + propose alt + flag follow-up next session "Mai doare?"

Gigel test pass: Maria 65 simte durere acută NU vrea săpt blacklist, vrea STOP acum + reia mâine.

### §50.3.8 Q5 "Mă doare" severity input — B 3-tier (ușor/moderat/sever) cu auto-action ✅ LOCKED

- **Ușor** → continue cu RIR+1 cap
- **Moderat** → skip exercise + alt
- **Sever** → STOP session + flag medical mention "consultă specialist"

NU paternalism direct medical advice (Gigel test). NU diagnosis.

### §50.3.9 Q6 Cross-session memory "Mă doare" — C Permanent blacklist după 2-3 incidente ✅ LOCKED

Pattern detection passive Bugatti F4. Stricter threshold safety-critical (vs D3.1.6 "Nu vreau" 3-5x). 2-3 incidents same exercise → soft prompt UI "Excludem permanent? Pare să-ți facă rău consistent". User decide final.

### §50.3.10 Q7 Contraindication override Safety tier composition Q3 — C Tier separat 5th invariant "Medical Safety" (Floor Absolut) ✅ LOCKED

**Sub-extension §42.9:** 5th invariant "no contraindicated exercise" deasupra current 4 invariants. Indiferent volumul optim (V≤MRV) calculat motoarele prescriptive, dacă exercise contraindicat mecanic → eliminat fără drept apel.

**Rationale:** V≤MRV doesn't matter dacă exercise = hernie disc kill. Medical safety = absolute floor, NU competing cu volume/intensity logic.

### §50.3.11 Q8 Pregnancy handling pre-Beta — A Defer post-Beta v1.5 ✅ LOCKED

Per Q24 LOCKED Special populations Defer D2 (§45.4). Pregnancy = liability + literature complex per trimester. Pre-Beta scope discipline. UI roadmap onboarding notification "Optimizarea pentru sarcină va fi disponibilă în v1.5".

### §50.3.12 Q9 Recovery from injury re-introduction — C Hybrid manual primary + soft prompt 4-6 săpt ✅ LOCKED

User manual unblock Setări (like D3.1.5) primary. Plus soft prompt 4-6 săptămâni post-incident "Vrei să reintroducem [Exercițiu] în program pentru testare stare?". Bugatti F4 cognitive: Maria 65 uită unblock; soft prompt anticipează. NU auto re-introduce (paternalism + medical liability).

### §50.3.13 Q10 Telemetry CDL injuries pattern — A NU track (privacy strict medical pre-Beta) ✅ LOCKED

GDPR sensitive medical data pre-Beta = legal nightmare. Pre-Beta zero stocare cloud istoric dureri/condiții fizice. Procesare local exclusiv. Monitorizare anonimizată cloud amânată v1.5 după audit legal complete (§46 P4 prerequisite).

---

## §50.4 D1 Save the Week Silent SUB-DECISIONS LOCKED V1 (7 Q = 7 sub-decisions)

**Parent:** §36.107 D1 OPENED FOR DISCUSSION → LOCKED V1 acum. Pattern §36.55.4 abandoned session neutral streak reuse + §45.3 Q20 3/4 threshold rule reuse.

### §50.4.1 Q1 Trigger condition — C Silent default ✅ LOCKED

Zero fricțiune. NU prompt-uri administrative sau confirmări manuale. Dacă prag sesiuni atins, săptămâna salvată automat fundal, streak-ul nu rupt.

### §50.4.2 Q2 Threshold sessions completed required — A 3/4 sesiuni planificate ✅ LOCKED

Reuse Q20 LOCKED §45.3 threshold rule pentru consistency logic periodizare. User planifică 4 sesiuni + finalizează 3 → prag atins automat.

### §50.4.3 Q3 Streak treatment week saved — C Counts cu progression skip ✅ LOCKED

Streak salvat. Săptămâna următoare îngheață parametri intensitate + volum. Protejează user de supraîncărcare la revenire după săpt parțială. Reuse Q20 LOCKED "Resume + intensity hold" pattern.

### §50.4.4 Q4 UI feedback la save silent — B Subtle micro-copy în istoric ✅ LOCKED

Evită notificări invazive. Text "Săptămână salvată (3/4 sesiuni)" apare discret DOAR ecran istoric pentru transparență. Bugatti F1 user-language clear.

### §50.4.5 Q5 Edge case 4/4 weeks consecutive cu 3/4 sesiuni — B Maximum 2 saved weeks consecutive ✅ LOCKED

A 3-a săptămână consecutivă cu ≤3/4 sesiuni → repetare integrală săptămâna N. Anti-drift volume calibration. 3 weeks @ 3/4 = volume calibration shifts subtle; max 2 = realistic life buffer dar engine recalibrate.

### §50.4.6 Q6 Goal change interaction Q27 50% threshold rule — B Save week aplicat prima, goal change next mesocycle ✅ LOCKED

Logică cronologică: săpt curentă închisă conform plan existent + nou obiectiv intră vigoare start următor mesociclu. NU dublu logic same week.

### §50.4.7 Q7 Telemetry CDL save week pattern — C Track + Circuit Breaker reuse §42.7 ✅ LOCKED

**Naming distinction LOCKED V1 (clarification compile ADR 026):**
- **Circuit Breaker population fallback 5%** (§42.7) — rate fallback cross-population trigger Knowledge Sprint hotfix
- **User adaptation signal 50%** (D1 Q7 individual) — user save weeks rate >50% trigger T1+ Profile Typing adaptation v1.5

Două thresholds distincte. NU paternalism intervention; passive monitoring → engine adapt frequency suggestion T1+ Profile Typing v1.5.

---

## §51 Cumulative LOCKED count update

**Pre-session:** 175 LOCKED V1 (post §45-§49 ingest 2026-05-04 night).
**Post-session sub-decisions:** **216 LOCKED V1** (+41 substantive sub-decisions: D3.1 13 + D4 11 + D2 13 + D1 7 - overlap = 41 net).

---

## §52 Next Actions Priority Order (post 2026-05-05 morning ingest)

### Priority 0 — Push origin main vault changes (Daniel approval pending)

CC ingest commits push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved.

### Priority 1 ABSOLUT — Auth Flow §36.80 BUG 2 Firebase 401 (preserved separat)

Chat strategic dedicat tactic + prompt CC Opus dedicat. ~1-2h Daniel + ~30-45min CC autonomous. Production blocker preserved unchanged.

### Priority 2 — ADR 026 COMPILE DRAFT FULL (extended scope post-D)

**Pre-session ready compile:** 75 decisions (§42.1-§42.10 base 10 + §45.2-§45.5 spec 75).
**Post-session ready compile:** **126 decisions ready compile draft full** = 75 spec + D3.1 13 + D4 11 + D2 13 + D1 7 + naming distinction Circuit Breaker vs User adaptation = 126 sub-decisions ADR 026 compile in `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (replace candidate stub).

**Compile structure recommended:** §42 base + §45 spec + §50.1 D3.1 + §50.2 D4 + §50.3 D2 + §50.4 D1 + §51 cumulative.

### Priority 3 — Periodization Engine spec generation start (post ADR 026 compile)

Per dimension cross-persona Q30 LOCKED: chat 1 Volume Landmarks all 3 persona + chat 2 Frequency Distribution all 3 + chat 3 Progressive Overload all 3 + chat 4 Mesocycle Structure all 3 (~3-4 chat-uri estimative).

### Priority 4 — D3.2-D3.4 + Engine #8 sub-decisions (deferred)

D3.2 Don't Like + D3.3 Home + D3.4 Calistenice + Sport-Oriented (D3.2-D3.4 verdicts §36.107) chat strategic NEW.
Engine #8 Warm-up & Mobility sub-decisions (~50-80 ramuri V1 spec) chat strategic NEW post Periodization spec.

### Priority 5 long-term

ADR 022 + 024 + 025 full spec generation post Periodization spec. Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal complete (§46 P4 prerequisite D2 telemetry post-Beta v1.5). Soft Launch.

---

## §53 DIFF_FLAGS Update (post 2026-05-05 morning ingest)

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow §36.80.
- **HANDOVER_GLOBAL split FLAG approaching threshold** = file post-merge §50-§53 estimated ~6900-7100 LOC (pre-merge ~6700-6900 + ~200-250 added §50-§53). Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG, >10000 LOC ESCALATE BLOCKER. **Currently AT/CROSSING threshold — recommend FLAG triggered acum, plan split next handover concrete.**
- **D3.1.6 NEW Pattern Detection Passive** — flag in INDEX_MASTER.md SUFLET section update + ADR 026 cross-ref + roadmap pre-Beta MANDATORY new entry.
- **D4 NEW Mid-Session Resume Protocol** — flag in INDEX_MASTER.md core mechanics section update + ADR 026 cross-ref + roadmap pre-Beta MANDATORY new entry.
- **D2.3.1/3.2/3.3 Medical Database & Liability** — flag in INDEX_MASTER.md SAFETY section update + ADR 026 cross-ref + audit legal §46 P4 prerequisite link.

---

## §54 Cross-refs Updates Required (CC ingest mandatory)

**INDEX_MASTER.md updates:**
- D3.1 status: OPENED FOR DISCUSSION → LOCKED V1 (10 Q + D3.1.6 NEW)
- D4 NEW: add full entry SUFLET section LOCKED V1 (10 Q + D4.2.1 NEW)
- D2 status: OPENED FOR DISCUSSION → LOCKED V1 (10 Q + D2.3 sub-decisions)
- D1 status: OPENED FOR DISCUSSION → LOCKED V1 (7 Q)
- Cumulative LOCKED count: 175 → **216**

**DECISION_LOG.md +1 condensed entry:** referencing HANDOVER_GLOBAL §50.1-§50.4 verbatim (top of file, cronologic descending, header `2026-05-05 morning — D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED V1`).

**ADR 026 candidate stub** preserved unchanged (compile draft full chat strategic NEW Priority 2 când Daniel decide).

**Cross-refs:** [[026-offline-coaching-decision-tree-exhaustive]] (ready compile 126 decisions chat NEW Priority 2) | [[023-llm-intent-interpretation]] (Safety tier composition extended cu invariant 5 Medical Safety §50.3.10) | [[018-engine-extensibility-architecture]] (Dimension Registry foundation) | [[025-andura-gandeste-pentru-user]] (Instant Skip principle pattern reused D3.1 + D4) | HANDOVER §36.107 (D1/D2/D3.1 OPENED → LOCKED V1) + §36.99 (offline-first preservation D3.1 Q3 + D4 Q2) + §36.55.4 (abandoned session neutral streak D4.2.1 + D1 trigger) + §42.7 (Circuit Breaker pattern reused D3.1 Q10 + D1 Q7) + §42.9 (Safety tier extended invariant 5 D2 Q7) + §42.10 (Periodization muscle-group-level tracking D3.1 Q6 unlock + D4 Q7+Q8) + §45.3 Q20 (3/4 threshold rule reused D4 Q7+Q8 + D1 Q2+Q3).

---

## §55 Verification Questions Topics For Next Chat

**CC Opus MUST generate alignment questions search-driven format §47 LOCKED V1 din topics below. NOT pre-fed verbatim answers.**

**Suggested 12 Q-uri topics covering §50-§54:**

- Q: §50.1 D3.1 Buton "Nu vreau" 10 Q + Hard Cap re-roll Q5 + Unlock substitute Q6 + D3.1.6 Pattern Detection Passive verbatim?
- Q: §50.2 D4 Mid-Session Resume Protocol 10 Q + D4.2.1 NEW filtrare dialog blocant threshold 6h verbatim (Recuperabilă vs Abandonată)?
- Q: §50.2 Q7+Q8 reuse Q20 LOCKED §45.3 3/4 threshold rule + intensity hold pattern?
- Q: §50.3 D2 Injury/Contraindication 10 Q + D2.3.1/3.2/3.3 Medical Database (NSCA+ACSM + quarterly + disclaimer mandatory)?
- Q: §50.3.10 Q7 Safety tier extension invariant 5 "Medical Safety" Floor Absolut deasupra 4 invariants §42.9?
- Q: §50.3.7 Q4 semantic distinction "Nu pot" (D3.1 mecanic) vs "Mă doare" (D2 acut mid-session)?
- Q: §50.4 D1 Save the Week Silent 7 Q + naming distinction Circuit Breaker 5% vs User adaptation 50%?
- Q: §50.4 Q2+Q3 reuse Q20 LOCKED §45.3 + Q5 anti-drift cap max 2 saved weeks consecutive?
- Q: §51 Cumulative LOCKED count 175 → 216?
- Q: §52 Next Actions priority order Priority 0/1/2/3/4/5 + ADR 026 compile 126 decisions ready?
- Q: §53 DIFF_FLAGS HANDOVER_GLOBAL split FLAG triggered (AT threshold ~6900-7100 LOC)?
- Q: §54 Cross-refs INDEX_MASTER + DECISION_LOG +1 entry + ADR 026 candidate stub preserved?

---

🦫 **216 LOCKED V1 post §50-§55 ingest. ADR 026 compile draft full ready 126 decisions. Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE preserved. Auth Flow §36.80 Priority 1 ABSOLUT preserved separat. HANDOVER_GLOBAL split FLAG triggered approaching threshold — plan split concrete next handover. D3.2-D3.4 + Engine #8 sub-decisions deferred Priority 4 chat strategic NEW separate.**

**Andura needs to be the best. ✊**
