---
name: HANDOVER_INPUT_2026-05-03_NIGHT_LATE_PREBETA_SCOPE_EXPANSION
description: Handover post chat strategic 2026-05-03 night late — 7 LOCKED V1 noi (§36.55.1-4 + §36.56.1-3 + §36.57 prebeta scope rule) + Jeff Nippard gaps backlog + Injury Body Region Map opțiune A propusă pentru chat strategic NEW
type: handover-input
date: 2026-05-03 night late
session_duration: ~2h Daniel-time real
session_start_bandwidth: alignment 13/13 PASS
session_end_bandwidth: ~22% remaining (handover preventiv anti-saturation)
cumulative_locked_count: 72 → 79 (+7 acest chat)
priority_next_chat: PRIORITY 1 ABSOLUT continuă Jeff Nippard gap #1 wiring weakness → session builder + Injury Body Region Map decision (A vs drop)
---

# HANDOVER INPUT — Prebeta Scope Expansion + Coach Intelligence Roadmap

## §1 — CONTEXT SESIUNE

Sesiune 2026-05-03 night late, ~2h Daniel-time real, post deploy LIVE `andura.app` + alignment 13/13 PASS pe §36.78 + §36.79 + §36.80 (rebrand sweep + custom domain hotfix + BUG 2 auth flow not wired).

**Plan original chat:** Auth flow integration design (Priority 1 ABSOLUT) per §36.80 LOCKED.

**Pivot real:** Daniel a venit cu 3 idei de coach intelligence (variante exerciții diferențiate + substituții cascade anatomice + session abandonment) → expanded la 7 decizii LOCKED noi + 1 decizie meta-rule (§36.57 prebeta scope expansion).

**Auth flow integration design = AMÂNAT pentru chat strategic NEW separat** (next priority post acest handover ingest, după chat-ul curent care continuă coach intelligence roadmap).

---

## §2 — DECIZII LOCKED V1 NOI (acest chat)

### §36.55 — Coach Intelligence Cluster (Variante + Substituții + Mid-Set + Abandonment)

#### §36.55.1 Catalog Ceiling Soft Cap (LOCKED V1)

**Decizie:** Plafon variante biomecanice per pattern muscular.

**Mecanism:**
- Soft cap target: **3-4 variante distincte** per movement pattern (ex: lateral_raise_db, lateral_raise_cable, lateral_raise_machine)
- Codul **permite** introducerea unei a 5-a variante DAR impune justificare obligatorie în Pull Request (PR)
- Anti-arbitrary cap, anti-bloat, anti-onboarding kilometric

**Rationale:**
- Squats permite legitim 6+ variante (back, front, goblet, hack, bulgarian, box) — cap rigid 4 amputează realitate sală RO
- Soft cap + PR justification = disciplină catalog fără pierdere flexibilitate
- Aliniat anti-friction Maria 65 (selecție echipament onboarding NU devine kilometric)

**Cross-refs:**
- §36.36 Schema Extension Exercise Library (câmpuri obligatorii: equipment_type, equipment_alternatives, force_demand, muscle_target_primary/secondary, tier)
- §36.37 Smart-Routing Aparat Ocupat / Aparat Lipsă

#### §36.55.2 Substitutions Hierarchy LOCKED V1 (Algoritmică, NU Manual)

**Decizie:** Substituțiile pentru "Aparat ocupat" / "Aparat lipsă" sunt generate **algoritmic** din metadata existentă, NU listă manuală curatat per exercițiu.

**Mecanism:**
- Eliminat vector hardcoded `substitutions: [...]` per exercițiu (maintenance hell la 30+ exerciții × 5 substituții = 150+ relații manual)
- Algoritm sortează alternative pe baza **ierarhie strictă de priorități**:
  1. `primary_muscle` (cel mai important)
  2. `movement_pattern`
  3. `force_curve_profile`
  4. `equipment_class` (cel mai puțin important)
- **Ponderi numerice (40/30/20/10) RESPINSE V1** — pre-mature optimization fără data Beta reală
- Doar **ordering** locked, weights = TBD post-Beta cu real user behavior data
- `manual_override_ids` permis doar pentru cazuri excepționale unde algo greșește

**Filter cascadă:**
1. Exercițiu original → calculează scor similaritate
2. Filtrează după echipament disponibil user (din profile)
3. Top 3 recomandări (best match primă, restul "Alte alternative")

**Cross-refs:**
- §36.36 Schema cu metadata necesară (toate 4 câmpuri prioritizare deja în schema)
- §36.37 Smart-Routing buton [Aparat ocupat] / [Aparat lipsă]

#### §36.55.3 Mid-Set Switch Fallback LOCKED V1

**Decizie:** Când utilizatorul switch-uiește exercițiul **mid-execution** (apucă să facă 1-2 seturi, apoi aparat ocupat la pauză), engine handle prin "Hybrid Rule" cu UI Bridge.

**Mecanism (3 pași):**
1. **Save seturi lucrate:** Engine păstrează seturile deja completate la exercițiul original (ex: 2 seturi la `bench_press_flat_barbell`)
2. **Calcul greutate sugerată noul exercițiu:** Folosește `SIMILARITY_RATIO` map existent în `src/engine/exerciseMapping.js` (validat pre-flight grep — există! Range 0.75-1.25 + fallback `default: 0.9`) + funcția `getSimilarityMultiplier()` pentru a genera greutate inițială conservatoare bazată pe performanța din seturile deja lucrate
3. **UI Bridge — sugestie + edit user:** App afișează valoarea calculată ca **sugestie**, NU impune:
   ```
   "Sugestie: ${calcKg} kg · Ajustează după cum simți primul set"
   ```
   User are opțiunea să editeze greutatea direct înainte de a bifa setul.

**Edge case "no history" pe noul exercițiu:** SIMILARITY_RATIO multiplier folosit ca conversion factor cross-exercițiu + UI prompts user explicit că-i sugestie, NU baseline locked.

**Cross-refs:**
- `src/engine/exerciseMapping.js` (SIMILARITY_RATIO + getSimilarityMultiplier validat existent)
- §36.55.1 Catalog ceiling (variante distincte = 1RM separat per variant)
- ADR Pattern 14 No-Inference (engine sugerează, NU impune)
- SUFLET F2 ("AI-ul informează, nu impune")

#### §36.55.4 Abandonment Engine + §36.30 Override LOCKED V1

**Decizie:** Sesiuni abandonate (telefonul închis mid-training, pauză prelungită, urgențe) tratate ca **gap neutru**, NU resetează streak counters din ADR_OUTLIER_FILTER.

**Trigger detection (rest_timer based, NU timpi statici arbitrari):**
- **Rest timer activ:** Aplicația NU întreabă nimic, oricât de lungă pauza (Marius poate face 6-8 min pauză legitimă la squat heavy)
- **Rest timer expirat ȘI 10 min idle fără interacțiune:** Engine începe countdown abandonment
- **La redeschidere app:** Modal interstitial "Continuăm sesiunea sau încheiem aici?"
- **>4h inactivitate totală:** Auto-close sesiune, marchează `session_status: "abandoned"`, ecran curat next open
- **Drop "midnight rule":** Sesiune unică indiferent schimbare zi calendaristică, doar duration-based criterion

**Override §36.30 explicit clauză LOCKED:**
> Sesiunile abandonate (`session_status: 'abandoned'`) NU contează ca "sesiune normală intermediară", ci sunt tratate ca un **gap neutru (skip)**. Streak counter-ul §36.30 de validare a baseline-ului pe aceeași direcție NU se resetează la o sesiune abandonată, ci doar la o sesiune validă normală.

**Mecanică Marius example:**
```
[Sesiunea 1: Outlier ✅] → counter 1/3
[Sesiunea 2: Outlier ✅] → counter 2/3
[Sesiunea 3: Abandoned ⚪ (Neutral)] → counter PRESERVED 2/3
[Sesiunea 4: Outlier ✅] → counter 3/3 → baseline shift triggered
```

**Tratarea datelor incomplete (Outlier Protection):**
- Frecvența de antrenament: counted (engine știe că user a mers la sală)
- Progresoare 1RM și Deload triggers: complet excluse
- Pattern learning: ignored
- Anti-pollution istoricul cu date incomplete

**Cross-refs:**
- ADR_OUTLIER_FILTER §EXTENSIONS EXT-1 §36.30 Streak Counter Same Direction (acest override extends spec-ul existent)
- §36.34 Profile Reset (streak PRESERVE — UI/UX shift only) — distincție clară
- §36.35 Goal Shift (streak RESET 0 — context fizic schimbat) — distincție clară
- ADR 012 Calibration Tier Decay (60-day inactivity) — separate concern, NU overlap

---

### §36.56 — Pre-Session Energy Signal Cluster

#### §36.56.1 Pre-Session Energy Input LOCKED V1

**Decizie:** Selector semantic 3 opțiuni energie integrat **direct în Dashboard Greeting Card existent**, NU ecran separat / modal.

**UI:**
```
Cum ne simțim astăzi?
[🟢 Excelent]  [🟡 Normal / Ok]  [🔴 Obosit / Slab]
```

**Friction:** Exact 1 tap, ZERO ecrane suplimentare, ZERO timp pierdut.

**Anti-pattern (RESPINS):** Modal pre-flight check + greeting + start button = 3 friction points pre-set, Maria 65 abandonează la al 2-lea.

**Cross-refs:**
- §36.45 T2 cold-start mode detection (existing greeting card patterns)
- Anti-friction onboarding philosophy

#### §36.56.2 Silent Adaptive Adjustment LOCKED V1

**Decizie:** Selectarea 🔴 Obosit / Slab → engine ajustare **silent**, ZERO mesaj paternalist UI.

**Mecanism (fidel §36.16 RIR Matrix existent):**
- **🟢 Excelent:** Baseline normal, plan progresie standard
- **🟡 Normal:** Sensibilitate crescută la algoritmul de ajustare în jos (`in-session adjust` Q27) — acțiune imediată după primul set dacă efort peste limită (NU așteaptă 2 seturi proaste)
- **🔴 Obosit:** Engine activează mecanismul adaptiv §36.16 — ajustare **reps sau intensity** (NU set count, NU procente arbitrare hardcodate). Min 2 sets preserve prag stimulare neuromuscular (§36.16 wording).

**Silent execution:**
- User a apăsat 🔴 = a transmis starea, NU mai e nevoie de feedback paternalist "Azi mergem mai blând"
- Engine aplică ajustările direct în cifrele afișate pe ecranele exercițiilor
- ZERO text, ZERO explicații redundante (§36.17 silent UI update extension)

**Procente exacte de ajustare:** TBD post-Beta calibration (anti pre-mature optimization).

**Cross-refs:**
- §36.16 RIR Matrix Adaptiv (mecanism existent: reps reduction sau intensity, NU sets)
- §36.17 + §36.29 Mid-Session Silent UI Update LOCKED
- ADR Pattern 14 No-Inference

#### §36.56.3 Deload Suggestion Trigger LOCKED V1 (Wording Phase B Pending)

**Decizie:** 3 apăsări consecutive 🔴 → engine flag intern → sugestie **opțională** deload week la final sesiunea a 3-a, NU auto-trigger.

**Mecanism:**
- Trigger: 3 sesiuni consecutive cu user selection 🔴 Obosit / Slab
- Anti-pattern (RESPINS): Auto-trigger deload week pe 3 self-reports = false positive risk huge (user obosit la job ≠ sub-recuperat fizic)
- Aliniat ADR Pattern 14 + SUFLET F2 + filozofia F1 Triangulation (interval, NU single point automat)

**UI Trigger (la finalul sesiunii a 3-a, ecran sumar):**
- Status logic: **LOCKED V1**
- Status wording: **Placeholder V1 (Pending Bugatti tone review)**
- Text provizoriu: `"Vrei să luăm o săptămână mai ușoară? Putem planifica o perioadă de descărcare (deload) pentru refacere."`
- Acțiune viitoare: Revizuire + aliniere la standardul Sentence Case + voce persoana I plural în următoarea sesiune dedicată Phase B wording (sau direct cu Daniel chat strategic).

**Control user 100%:** Decizie aparține integral utilizatorului — engine sugerează, NU impune.

**Cross-refs:**
- §27 Phase B Wording Strategy
- §36.58 Phase B 51 strings LOCKED V1 (pattern existent)
- ADR Pattern 14 + SUFLET F2

---

### §36.57 — META-RULE: Prebeta Scope Expansion (LOCKED V1)

**Decizie meta-rule:** Toate deciziile luate de la acest moment înainte care țin de **SUFLET ANDURA / coach intelligence / UX core / engine adaptation** sunt **mandatory prebeta**. Non-negotiable.

**Mecanism:**
- NU se mai întreabă "prebeta sau post-Beta?" pentru fiecare feature
- Default = **prebeta** dacă atinge core experience (suflet Andura, coach intelligence, UX flow critic)
- Timing/realism = treaba lui Claude + Daniel + CC Opus să decidă cum prioritizăm execution-ul, NU rationale să respingem scope-ul
- NU mai sări la "ar dura X luni" ca push-back — Daniel n-a întrebat de timing când extinde scope

**Origine decizie:**
Acest chat 2026-05-03 night late: post discussion §36.55 + §36.56, Daniel a clarificat că "tot ce discutăm care face parte din sufletul Andura va fi prebeta". Claude a răspuns inițial cu push-back pe timing (12 luni delay) — Daniel a corectat: "am zis eu ceva de cât timp durează?". Lecție: scope expansion ≠ rationale respingere pe baza estimate-uri Claude.

**Implicații:**
- Beta-launch ASAP strategy LOCKED rămâne valid, dar timing **flexible** (NU forced)
- Soft Launch 1 ianuarie 2027 = **target aspirational**, NU hard deadline dacă scope esențial extends
- Quality > speed strict (Bugatti paradigm)

**Memory rule:** Codificat în memory persistent #24 Claude pentru chat-uri viitoare.

**Cross-refs:**
- SUFLET_ANDURA full vision
- §36.13 Beta-launch ASAP strategy
- Bugatti paradigm philosophy

---

## §3 — JEFF NIPPARD GAPS BACKLOG (Toate prebeta per §36.57)

În acest chat, Daniel a întrebat dacă Andura V1 ajunge "Jeff Nippard 24/7 replacer" după §36.55 + §36.56 implementate. Claude a răspuns sincer: ~30% Jeff Nippard, gap-uri reziduale.

### Gap-uri identificate (7 total) — Status decision:

#### Prebeta MANDATORY (per §36.57):

1. **#1 Wiring weakness → session builder** (~1-2 săpt CC dezvoltare)
   - Status: **DISCUTAT START**, NU LOCKED încă
   - Gap real: `weaknessDetector.js` orfan — calculează 1RM per muscle group, dar NU acționează (nu adaugă proactiv accessory targeted în session builder)
   - Exemplu: Engine VEDE deltoid posterior slab vs anterior → NU adaugă proactiv face pulls în programul Marius
   - Action next chat: design wiring + session builder integration

2. **#2 Plateau breaker auto** (variant change când stagnează — ~2-3 săpt + research științific)
   - Status: **NEDISCUTAT**, marcat backlog
   - Gap real: Stagnation detector flag-uiește 3 săpt fără progres, dar NU recomandă variant change
   - Concept Bugatti: Marius bench plateau 3 săpt → engine spune "săptămâna asta înlocuim flat barbell cu incline DB pause-rep, schimbăm stimulus, revenim peste 2 săpt"
   - Action future chat: design threshold + algorithm + research scientific basis

3. **#3 Recovery / readiness signals** (somn, stres, DOMS subiectiv)
   - Status: **PARȚIAL acoperit** prin §36.56.1 (energy selector) + §36.38 Pain Button (DOMS)
   - Gap rezidual: Daniel a confirmat că NU vrea întrebări user explicite suplimentare (somn / stres) — derivăm din statistici sesiune via §36.56.1
   - Decision: GAP ÎNCHIS pentru V1 prebeta cu §36.56 — suficient

4. **#4 Periodizare conștientă** (deload weeks, accumulation phases — ~2-3 luni dezvoltare)
   - Status: **NEDISCUTAT**, marcat backlog
   - Gap real: Zero concept "deload week", "intensificare 4 săpt", "accumulation phase". Doar progresie liniară per exercițiu cu deload trigger pe 3× RIR 0
   - Action future chat: design mesocycle planning + deload algorithms

5. **#6 Cross-exercițiu reasoning** (~2-4 luni dezvoltare)
   - Status: **NEDISCUTAT**, marcat backlog
   - Gap real: "Squat-ul tău stagnează pentru că hamstrings sunt slabi, hai să adăugăm RDL și pause-squats" — gap total
   - Action future chat: design graph relations exerciții + weak chain detection algorithm

6. **#7 Comunicare contextuală pre-session derivată din statistici sesiune (NU întrebări user explicite)**
   - Status: **PARȚIAL acoperit** prin §36.56.1 + §36.56.2 silent adjust
   - Daniel quote: "in afara de 5, tot trebuie... iar 7 ne luam datele din statistici din sesiune..."
   - Decision: GAP ÎNCHIS pentru V1 prebeta — derivat din §36.56 + statistici sesiune existing

#### V2+ (RESPINS prebeta):

7. **#5 Form / execuție feedback (video analysis)** — DROP definitiv
   - Daniel quote: "in afara de 5, tot trebuie..."
   - Risc legal + scope insane + camera permissions Maria 65 = OUT
   - V2+ teritoriu, NU prebeta, NU V1.5

#### NEW gap propus în chat (Injury Body Region Map):

8. **Injury-specific protocols — Body Region Map** (Opțiune A propusă)
   - Status: **PROPUS**, AȘTEAPTĂ Daniel decision next chat (A vs drop)
   - Context: §36.38 Pain Button existent este generic skip/reduce. NU este injury-specific protocol per zonă anatomică.

   **Opțiune A propusă (~1-2 săpt CC) — extensie naturală §36.38 + §36.36:**
   - User apasă "Mă doare" → "Unde?" → body map (umăr stâng / genunchi drept / lombară / etc)
   - Engine vede ce exerciții stresează zona (`muscle_target_primary` în schema §36.36) → automat skip toate în sesiunea curentă + propune alternative ZERO load pe zona afectată
   - Exemplu: user zice "umăr stâng" → engine skip OHP + bench + lateral raises + face pulls automat. Propune: leg day exclusiv + core
   - **NU recomandă rehab specific** ("fă band external rotations") — doar evită stres → zero medical device classification risc

   **Opțiune B (~3-4 săpt CC):**
   - Extension A + tracking durată recovery + re-introduction graduală cu test sets

   **Opțiune C (~2-3 luni, RISC LEGAL):**
   - Library protocoale rehab specific per zonă (knee valgus → terminal knee ext + glute med activation)
   - **TRECE LIMITA medical device** → EU AI Act risc + audit legal Stage 2 fail probabil
   - **REJECTED prebeta** indiferent §36.57

   **Recomandare Claude:** Opțiunea A prebeta (per §36.57 LOCKED), B post-Beta cu data reală, C NEVER

   **Action next chat:** Daniel decizie A vs drop complet (Opțiunea A discuție design completă + LOCK V1 sau backlog post-Beta)

---

## §4 — CARRY-OVERS NEDISCUTATE / AMÂNATE

### Priority 1 ABSOLUT (blocking Beta):

- **Auth flow integration design** (per §36.80 LOCKED)
  - Wireframe auth-first vs auth-banner-soft vs auth-modal patterns (Daniel CEO decizie UX)
  - Decizie route auth-callback wire: `/auth-callback?oobCode=...` la app shell main.js sau separate page
  - Migration path users existing IndexedDB local data Daniel → post-Magic-Link `users/{uid}` Firebase RTDB
  - Wording onboarding auth screen RO (Magic Link primary, Google OAuth secondary)
  - Error states UX (email invalid, link expired, network fail)
  - **Estimate per §36.80:** Strategic chat ~1-2h Daniel-time + CC Opus ~30-45 min real autonomous
  - **Status:** AMÂNAT acest chat, scope se preia în chat strategic NEW dedicat post acest handover ingest + chat continuare coach intelligence

### Implementation pending (CC Opus autonomous):

- **§36.55.1-4 implementation** (catalog ceiling + substitutions cascade + mid-set switch + abandonment)
- **§36.56.1-3 implementation** (energy selector + silent adjust + deload trigger)
- **Sprint UI re-spec** vanilla JS (7 BATCH_UI_NN per §36.77 anti-recurrence)
- **Phase B wording review** §36.56.3 deload suggestion text + alte placeholder strings

### Strategic chat NEW pending discussion (toate prebeta per §36.57):

- **Jeff Nippard gap #1 wiring weakness → session builder** (continuă din acest chat — Opțiune A Body Region Map decizie inclus)
- **Jeff Nippard gap #2 plateau breaker auto**
- **Jeff Nippard gap #4 periodizare conștientă**
- **Jeff Nippard gap #6 cross-exercițiu reasoning**

---

## §5 — STATUS V1 + DECIZII CUMULATIVE

### Cumulative LOCKED count post acest chat:

**72 → 79 (+7 acest chat)**

Breakdown +7:
- §36.55.1 Catalog Ceiling Soft Cap
- §36.55.2 Substitutions Hierarchy
- §36.55.3 Mid-Set Switch Fallback
- §36.55.4 Abandonment Engine + §36.30 override
- §36.56.1 Pre-Session Energy Input
- §36.56.2 Silent Adaptive Adjustment
- §36.56.3 Deload Suggestion Trigger (logic LOCKED, wording placeholder Phase B)
- §36.57 META-RULE Prebeta Scope Expansion (count +0 pentru că e meta-rule, NU feature)

**Notă:** §36.57 e meta-rule (despre cum se iau decizii viitoare), NU feature. Numerologic = 7 features locked + 1 meta-rule = 7 incremente count.

### Status V1 unchanged dimensiuni majore:

- 8/8 templates LOCKED
- F-NEW LOCKED V1
- MMI LOCKED V1
- Storage Full UX LOCKED V1
- 3 Blockers (1 partial + 1 RESOLVED + 1 full)
- Beta-launch ASAP strategy
- Suflet Andura translation map + filozofia 12k
- Self-Correction + Chat C + Pricing tiers + Telegram channel
- 8 ADR drafts ALL LOCKED V1
- ADR_MULTI_TENANT_AUTH Faza 1 Batch B code landed (NU wired = BUG 2 cause, blocking Beta)
- Phase B 51 strings INTEGRATED
- Cluster 10-batch foundation tests 1203 PASS
- Coverage/Build baselines locked
- Sprint UI Sequencing LOCKED V1
- Daniel solo gate Firebase live
- Sprint UI 6 UX LOCKED V1
- Slip Log §36.77 anti-recurrence
- **Andura V1 prod LIVE `andura.app` ✅**
- §36.78 Rebrand Sweep Phase 1-4
- §36.79 Custom Domain Base Path Hotfix
- §36.80 BUG 2 Firebase Auth Flow Not Wired NEXT CHAT PRIORITY 1 ABSOLUT

### Memory updates Claude (acest chat):

- **Memory #24 LOCKED 2026-05-03 night late:** §36.57 Prebeta Scope Rule — TOATE deciziile SUFLET ANDURA / coach intelligence / UX core / engine adaptation = MANDATORY prebeta. Non-negotiable. Default prebeta dacă atinge core. Timing/realism = treaba mea + Daniel + CC să prioritizăm execution, NU rationale respingere scope. NU mai sări la "ar dura X luni" ca push-back.

---

## §6 — PRE-FLIGHT VALIDATIONS APLICATE ACEST CHAT

Per memory rule #23 (pre-flight grep ABSOLUT ÎNAINTE primul artefact tehnic referă cod/path/framework):

✅ **§36.55.3 Mid-Set Switch validat:** `project_knowledge_search` pentru `START_SIMILAR Q48 factor conversie` returnat:
- `src/engine/exerciseMapping.js` cu `SIMILARITY_RATIO` map existent (range 0.75-1.25 + fallback `default: 0.9`)
- `getSimilarityMultiplier(target, source)` function existent
- Pattern wiring confirmat pre-LOCK = NU inventezi feature, extinzi infrastructure existent

✅ **§36.55.4 Abandonment validat:** project_knowledge_search pentru streak counter rules returnat:
- §36.26 + §36.30 outlier validation streak (NU presence streak)
- §36.34 Profile Reset PRESERVE
- §36.35 Goal Shift RESET 0
- ADR 012 inactivity decay (60 days, separate concern)
- Override §36.30 explicit clauză adăugată în §36.55.4 elimină ambiguity vault

✅ **§36.55 + §36.56 cross-refs all validated:** §36.16, §36.17, §36.29, §36.36, §36.37, §36.38, §36.45, ADR_OUTLIER_FILTER, ADR Pattern 14, SUFLET F1/F2 — toate verified existent în vault.

✅ **Injury Body Region Map (Opțiune A propusă):** Validare schema §36.36 — `muscle_target_primary` + `muscle_target_secondary` deja câmpuri obligatorii, deci wiring posibil zero refactor schema.

---

## §7 — VAULT FILES IMPACT (Aplicare CC Opus ingest)

### SSOT MUST UPDATE:

1. **`06-sessions-log/HANDOVER_GLOBAL_<latest>.md`** — append §36.55.1 + §36.55.2 + §36.55.3 + §36.55.4 + §36.56.1 + §36.56.2 + §36.56.3 + §36.57 + Cumulative count update 72 → 79 + status V1 dimensiuni unchanged + carry-over auth flow integration design + Jeff Nippard gaps backlog (1, 2, 4, 6 prebeta, 5 RESPINS, 3+7 acoperite §36.56) + injury body region map opțiune A propusă pending Daniel decision next chat + memory rule #24 LOCKED

2. **`03-decisions/ADR_OUTLIER_FILTER_v1.md`** — append §EXTENSIONS EXT-3 §36.55.4 Abandonment Override §36.30 (NU resetează streak counter same direction validation pe abandoned session)

3. **`03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md`** — flag pending decision §36.55 EXT-2 Body Region Map Opțiune A (sau create nou ADR draft separat dacă A LOCKED next chat)

4. **`07-meta/CLAUDE_CODE_RULES.md`** — referință §36.57 prebeta scope meta-rule (Claude self-discipline)

### NEW ADR draft posibil (dacă A LOCKED next chat):

5. **`03-decisions/ADR_INJURY_BODY_REGION_MAP_v1.md`** (DRAFT, post-Daniel A vs drop decision) — extension §36.38 Pain Button + body region UI + smart skip cascade per zona afectată + zero medical device claim

### PENDING wording locks (Phase B):

6. **`03-decisions/ADR_MODE_DETECTION_UI_v1.md`** sau new ADR — wording §36.56.3 deload suggestion (placeholder pending)

---

## §8 — NEXT ACTIONS (priority order)

### Pentru Daniel (manual):

1. **Acest moment:** drag acest handover în `📥_inbox/` → comandă CC: "Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL"
2. **Post-ingest:** sync GitHub Project Knowledge (sau Codespaces pull dacă birou)
3. **Open chat strategic NEW** (continuă din acest punct):
   - Paste alignment questions generate de CC Opus în primul mesaj
   - Pass criteria ≥10/12 PASS → PROCEED
   - Continuă DIRECT cu Jeff Nippard gap #1 wiring weakness → session builder design + Injury Body Region Map decizie Opțiune A vs drop

### Pentru Claude chat NEW (post alignment PASS):

1. **Jeff Nippard gap #1 design:** wiring `weaknessDetector.js` → `sessionBuilder.js` (proactive accessory recommendations bazate pe weak muscle groups detected)
2. **Injury Body Region Map decision:** Opțiune A LOCKED V1 design complet (UI body region picker + smart skip cascade + zero rehab claims) sau drop backlog post-Beta
3. **Continuare Jeff Nippard gaps #2, #4, #6** dacă bandwidth permite
4. **Auth flow integration design** când Daniel decide pivot la Priority 1 ABSOLUT

### Pentru CC Opus (ingest acest handover):

1. Pre-flight: git pull, status clean, baseline tests 1203 PASS, backup tag `pre-handover-2026-05-03-night-late-merge`
2. Identify input: `📥_inbox/HANDOVER_INPUT_2026-05-03_NIGHT_LATE_PREBETA_SCOPE_EXPANSION.md`
3. Read input + active SSOT `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
4. Merge → overwrite SSOT cu §36.55 + §36.56 + §36.57 + Jeff Nippard backlog + injury body region pending + cumulative 79
5. Apply ADR amendments inline (ADR_OUTLIER_FILTER §EXT-3 §36.55.4 + ADR_PAIN_DISCOMFORT §pending body region map)
6. Archive input la `📤_outbox/_archive/2026-05/NN_HANDOVER_2026-05-03_NIGHT_LATE_CONSUMED.md`
7. Generate alignment questions ≥12 Q-uri în `📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` (citation §X file.md + răspuns verbatim per Q)
8. Rotate previous LATEST.md → archive cu next NN
9. Write raport execution în `📤_outbox/LATEST.md`
10. Commits granulare (merge SSOT + ADR amendments + archive input + alignment + raport) + push origin/main

---

## §9 — VERIFICATION QUESTIONS (REMOVED — generate by CC Opus per §HANDOVER_PROTOCOL step 9)

Per memory rule #22: Alignment questions = STRICT CC Opus din vault SSOT post-merge, NU Claude chat în handover. Comanda standard "Ingest handover" deja include generare fresh `ALIGNMENT_QUESTIONS_CHAT_NEW.md`.

Acest handover NU include §VERIFICATION QUESTIONS — duplicate work + halucinare risc evitate.

---

## §10 — META

**Bandwidth handover-time:** ~22% remaining (handover preventiv anti-saturation per memory rule #15)
**Session quality:** Fresh decizii LOCKED V1 fără drift, pre-flight grep aplicat pentru toate cross-refs tehnice
**Memory updates pending:** Memory #24 added (§36.57 prebeta scope rule)
**Cross-ref vault audit:** 100% existent paths (NU presupun, NU inventez)

🦫 **Coach intelligence cluster expanded prebeta. Andura V1 scope evolves Bugatti standard. Continuare chat strategic NEW per §36.57 default rule.**
