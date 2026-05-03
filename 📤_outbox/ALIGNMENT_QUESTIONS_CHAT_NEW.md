# ALIGNMENT QUESTIONS — Chat Strategic NEW (post Ingest 2026-05-03 night late PREBETA SCOPE EXPANSION)

**Owner:** CC Opus (generate per VAULT_RULES §HANDOVER_PROTOCOL step 9 + memory rule #22).
**Pass criteria:** ≥12/15 PASS (≥80%) → PROCEED chat strategic NEW (Auth Flow Integration sau Coach Intelligence Continuare per Daniel decision).
**Source:** Vault SSOT post-merge `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` + ADR amendments + meta updates.
**Format:** Q + citation `§X file.md` + răspuns verbatim din vault.

---

## §1 — Coach Intelligence Cluster (§36.81)

### Q1 — Câte variante distincte sunt cap-ul soft per pattern muscular și ce mecanism guvernează depășirea acestuia?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.81.1 Catalog Ceiling Soft Cap LOCKED V1.

**Răspuns verbatim:** Soft cap target 3-4 variante distincte per movement pattern (ex: lateral_raise_db, lateral_raise_cable, lateral_raise_machine). Codul **permite** introducerea unei a 5-a variante DAR impune justificare obligatorie în PR. Anti-arbitrary cap, anti-bloat, anti-onboarding kilometric. Squats permite legitim 6+ variante (back, front, goblet, hack, bulgarian, box) — cap rigid 4 amputează realitate sală RO.

---

### Q2 — Ce ierarhie strictă guvernează algoritmul de substituții și ce status au ponderile numerice?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.81.2 Substitutions Hierarchy Algorithmic LOCKED V1.

**Răspuns verbatim:** Algoritmul sortează alternative pe baza ierarhie strictă de priorități (ordering only LOCKED, weights TBD post-Beta): 1. `primary_muscle` (cel mai important), 2. `movement_pattern`, 3. `force_curve_profile`, 4. `equipment_class` (cel mai puțin important). **Ponderi numerice (40/30/20/10) RESPINSE V1** — pre-mature optimization fără data Beta reală. `manual_override_ids` permis doar pentru cazuri excepționale unde algo greșește. Eliminat vector hardcoded `substitutions: [...]` per exercițiu (maintenance hell la 30+ exerciții × 5 substituții = 150+ relații manual).

---

### Q3 — Cum funcționează Mid-Set Switch Fallback Hybrid Rule și ce infrastructură existentă reutilizează?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.81.3 Mid-Set Switch Fallback Hybrid Rule LOCKED V1.

**Răspuns verbatim:** Engine handle prin "Hybrid Rule" cu UI Bridge (3 pași): 1) Save seturi lucrate (ex: 2 seturi la `bench_press_flat_barbell`), 2) Calcul greutate sugerată noul exercițiu folosind `SIMILARITY_RATIO` map existent în `src/engine/exerciseMapping.js` (validat pre-flight grep — există! Range 0.75-1.25 + fallback `default: 0.9`) + funcția `getSimilarityMultiplier()`, 3) UI Bridge afișează `"Sugestie: ${calcKg} kg · Ajustează după cum simți primul set"` — user editează direct înainte de a bifa setul. Engine sugerează, NU impune (ADR Pattern 14 + SUFLET F2).

---

### Q4 — Cum tratează engine sesiunile abandonate față de streak counter §36.30?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.81.4 Abandonment Engine + §36.30 Override LOCKED V1 + ADR_OUTLIER_FILTER_v1.md EXT-4.

**Răspuns verbatim:** Sesiunile abandonate (`session_status: 'abandoned'`) NU contează ca "sesiune normală intermediară", ci sunt tratate ca un **gap neutru (skip)**. Streak counter-ul §36.30 de validare a baseline-ului pe aceeași direcție NU se resetează la o sesiune abandonată, ci doar la o sesiune validă normală. Trigger detection rest_timer based (NU timpi statici): rest timer activ NU întreabă nimic, rest timer expirat ȘI 10 min idle = countdown abandonment, >4h inactivitate totală = auto-close, drop "midnight rule".

---

### Q5 — Cum se diferențiază matrix-ul de streak counter între Profile Reset / Goal Shift / Abandoned?

**Citation:** `03-decisions/ADR_OUTLIER_FILTER_v1.md` §EXTENSIONS EXT-1 + EXT-2 + EXT-3 + EXT-4.

**Răspuns verbatim:** Profile Reset §36.34 (EXT-3) = PRESERVE (UI/UX shift only, fizicul intact). Goal Shift §36.35 (EXT-2) = RESET la 0 (context fizic schimbat = signal nou independent). Abandoned §36.81.4 (EXT-4) = PRESERVE (gap neutru, skip). Sesiune normală same direction (EXT-1) = INCREMENT 1/3, 2/3, 3/3. Sesiune normală opposite direction (EXT-1) = RESET 0.

---

## §2 — Pre-Session Energy Signal Cluster (§36.82)

### Q6 — Unde este integrat selectorul de energie și care este friction-ul exact?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.82.1 Pre-Session Energy Input LOCKED V1.

**Răspuns verbatim:** Selector semantic 3 opțiuni energie integrat **direct în Dashboard Greeting Card existent**, NU ecran separat / modal. UI: `Cum ne simțim astăzi? [🟢 Excelent] [🟡 Normal / Ok] [🔴 Obosit / Slab]`. **Friction:** Exact 1 tap, ZERO ecrane suplimentare, ZERO timp pierdut. Anti-pattern (RESPINS): Modal pre-flight check + greeting + start button = 3 friction points pre-set, Maria 65 abandonează la al 2-lea.

---

### Q7 — Ce face engine la selectarea 🔴 Obosit/Slab, fără mesaj UI?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.82.2 Silent Adaptive Adjustment LOCKED V1.

**Răspuns verbatim:** Engine activează mecanismul adaptiv §36.16 — ajustare **reps sau intensity** (NU set count, NU procente arbitrare hardcodate). Min 2 sets preserve prag stimulare neuromuscular (§36.16 wording). Silent execution: User a apăsat 🔴 = a transmis starea, NU mai e nevoie de feedback paternalist "Azi mergem mai blând". Engine aplică ajustările direct în cifrele afișate pe ecranele exercițiilor. ZERO text, ZERO explicații redundante. Procente exacte de ajustare: TBD post-Beta calibration (anti pre-mature optimization).

---

### Q8 — Care este trigger-ul pentru sugestia deload și ce status are wording-ul?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.82.3 Deload Suggestion Trigger LOCKED V1 (Wording Phase B Pending).

**Răspuns verbatim:** Trigger: 3 sesiuni consecutive cu user selection 🔴 Obosit / Slab → engine flag intern → sugestie **opțională** deload week la final sesiunea a 3-a, NU auto-trigger. Anti-pattern (RESPINS): Auto-trigger deload week pe 3 self-reports = false positive risk huge (user obosit la job ≠ sub-recuperat fizic). UI Trigger la finalul sesiunii a 3-a, ecran sumar. Status logic: **LOCKED V1**. Status wording: **Placeholder V1 (Pending Bugatti tone review)**. Text provizoriu: `"Vrei să luăm o săptămână mai ușoară? Putem planifica o perioadă de descărcare (deload) pentru refacere."`. Control user 100%: engine sugerează, NU impune.

---

## §3 — META-RULE Prebeta Scope (§36.83)

### Q9 — Ce categorii de decizii sunt MANDATORY prebeta per §36.83 și ce push-back-uri sunt interzise?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.83 META-RULE Prebeta Scope Expansion LOCKED V1 + 07-meta/CLAUDE_CODE_RULES.md Self-discipline rules.

**Răspuns verbatim:** Toate deciziile luate de la acest moment înainte care țin de **SUFLET ANDURA / coach intelligence / UX core / engine adaptation** sunt **mandatory prebeta**. Non-negotiable. Default = **prebeta** dacă atinge core experience. Timing/realism = treaba lui Claude + Daniel + CC Opus să decidă cum prioritizăm execution-ul, NU rationale să respingem scope-ul. NU mai sări la "ar dura X luni" ca push-back — Daniel n-a întrebat de timing când extinde scope. Memory rule #24 codification.

---

### Q10 — Cum se modifică timeline-ul Beta-launch ASAP + Soft Launch 1 ianuarie 2027 sub §36.83?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.83 Implicații.

**Răspuns verbatim:** Beta-launch ASAP strategy LOCKED rămâne valid, dar timing **flexible** (NU forced). Soft Launch 1 ianuarie 2027 = **target aspirational**, NU hard deadline dacă scope esențial extends. Quality > speed strict (Bugatti paradigm). Cumulative count post acest chat: **79 LOCKED** (72 → 79, +7 features cluster §36.81+§36.82; §36.83 meta-rule = +0; §36.84 backlog = +0; §36.85 pending = +0).

---

## §4 — Jeff Nippard Backlog + Body Region Map (§36.84 + §36.85)

### Q11 — Care este status-ul gap #3 (Recovery/readiness) și gap #7 (Comunicare contextuală) în Andura V1?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.84 Jeff Nippard Gaps Backlog Catalog.

**Răspuns verbatim:** **#3 Recovery / readiness signals** — PARȚIAL acoperit prin §36.82.1 (energy selector) + §36.38 Pain Button (DOMS). Daniel confirmat că NU vrea întrebări user explicite suplimentare (somn / stres) — derivăm din statistici sesiune via §36.82.1. Decision: **GAP ÎNCHIS pentru V1 prebeta cu §36.82** — suficient. **#7 Comunicare contextuală pre-session derivată din statistici sesiune** — PARȚIAL acoperit prin §36.82.1 + §36.82.2 silent adjust. Daniel quote: "in afara de 5, tot trebuie... iar 7 ne luam datele din statistici din sesiune...". Decision: **GAP ÎNCHIS pentru V1 prebeta** — derivat din §36.82 + statistici sesiune existing.

---

### Q12 — Care gap-uri Jeff Nippard rămân backlog prebeta și care e singurul DROP definitiv?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.84 Jeff Nippard Gaps Backlog Catalog.

**Răspuns verbatim:** Prebeta MANDATORY (per §36.83) pending: #1 Wiring weakness → session builder (~1-2 săpt CC, DISCUTAT START), #2 Plateau breaker auto (~2-3 săpt + research științific, NEDISCUTAT), #4 Periodizare conștientă (deload weeks, accumulation phases — ~2-3 luni, NEDISCUTAT), #6 Cross-exercițiu reasoning (~2-4 luni, NEDISCUTAT). V2+ DROP definitiv: **#5 Form / execuție feedback (video analysis)** — risc legal + scope insane + camera permissions Maria 65 = OUT. V2+ teritoriu, NU prebeta, NU V1.5.

---

### Q13 — Ce 3 opțiuni există pentru Injury Body Region Map și care este recomandarea?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.85 Injury Body Region Map + 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md EXT-2 PENDING.

**Răspuns verbatim:** **Opțiune A propusă (~1-2 săpt CC) — extensie naturală §36.38 + §36.36:** body map zonă afectată + engine skip exerciții care stresează zona via `muscle_target_primary` + propune alternative ZERO load. NU recomandă rehab specific → zero medical device classification risc. **Opțiune B (~3-4 săpt CC):** Extension A + tracking durată recovery + re-introduction graduală cu test sets. **Opțiune C (~2-3 luni, RISC LEGAL):** Library protocoale rehab specific per zonă — TRECE LIMITA medical device → EU AI Act risc + audit legal Stage 2 fail probabil — REJECTED prebeta indiferent §36.83. **Recomandare Claude:** Opțiunea A prebeta (per §36.83 LOCKED), B post-Beta cu data reală, C NEVER.

---

## §5 — Status & Priority

### Q14 — Care este Priority 1 ABSOLUT preserved post acest handover ingest, și ce este Priority 2?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.80 BUG 2 Firebase Auth Flow Not Wired + session-lock 2026-05-03 night late.

**Răspuns verbatim:** **Priority 1 ABSOLUT chat strategic NEW dedicat Auth Flow Integration** (§36.80 preserved, blocking Beta) — design ~1-2h Daniel-time + prompt CC Opus dedicat ~30-45min autonomous factor 7-9x: wire `/auth-callback` route + `createAuthScreen` integration main shell + `LEGACY_USER_PATH` fallback strategy update block-render-until-auth NU fallback users/daniel + Tests Playwright e2e + smoke prod verification. **Priority 2 chat strategic continuare coach intelligence roadmap** (post acest handover ingest, scope: Jeff Nippard gap #1 wiring weaknessDetector.js→sessionBuilder.js proactive accessory + Injury Body Region Map §36.85 decizie A vs drop + dacă bandwidth gap #2 plateau breaker + #4 periodizare + #6 cross-exercițiu).

---

### Q15 — Care este cumulative LOCKED count cumulativ post acest ingest, și ce update-uri ADR au fost aplicate?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` session-lock 2026-05-03 night late + 03-decisions/ADR_OUTLIER_FILTER_v1.md EXT-4 + ADR_PAIN_DISCOMFORT_BUTTON_v1.md EXT-2 PENDING.

**Răspuns verbatim:** Decizii cumulative pre-launch V1 = **79** (72 → 79, +7 features: §36.81.1 + §36.81.2 + §36.81.3 + §36.81.4 + §36.82.1 + §36.82.2 + §36.82.3). §36.83 META-RULE +0 + §36.84 backlog +0 + §36.85 pending +0. ADR amendments aplicate: **ADR_OUTLIER_FILTER_v1.md EXT-4** §36.81.4 Abandonment Override §36.30 (streak counter PRESERVE pe abandoned) + **ADR_PAIN_DISCOMFORT_BUTTON_v1.md EXT-2 PENDING** §36.85 Injury Body Region Map Opțiune A propusă (AȘTEAPTĂ Daniel decision next chat A vs drop). Memory rule NEW Claude #24 LOCKED 2026-05-03 night late: §36.83 Prebeta Scope Rule. CLAUDE_CODE_RULES.md actualizat cu Self-discipline rules section (§36.77 + §36.83 + §HANDOVER_PROTOCOL).

---

🦫 **Vault SSOT clean. 79 LOCKED cumulative. §36.81 Coach Intelligence + §36.82 Pre-Session Energy + §36.83 META-RULE Prebeta + §36.84 Jeff Nippard Backlog + §36.85 Body Region Map PENDING. Andura V1 prod LIVE `andura.app`. Auth flow integration = Priority 1 ABSOLUT preserved.**
