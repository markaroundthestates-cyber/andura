# HANDOVER GLOBAL — Sesiune 2026-04-29 seară → 2026-05-02

**Owner:** Daniel (CEO + Product). Claude = Co-CTO + Reviewer.
**Status:** SSOT activ. Înlocuiește versiunea dimineață a `HANDOVER_GLOBAL_2026-04-30.md`.
**Data:** 2026-05-02 (post Sprint 4 A+B LIVE prod + smoke test ADR 020 Phase 1 + i18n audit completed + chat strategic morning v2 wording session [Engine 12 variations + Decizia #6 + Phase A aprobate tacit] + chat strategic evening 2026-05-01 session [goal-ca-setting + 8 templates programe v1 LOCKED + 53 strings Phase B partial + 5 amendamente backlog + timeline v1 ajustat 8-10 luni] + chat strategic 2026-05-02 session [safety nutrition pattern complet + 4 templates v1 full spec + 5 amendamente noi + 3 decizii arhitecturale colaterale]).

---

## 0. STATUS ACTUAL

**Acest document = SSOT activ.** Conține:
- Strategy + vision lock-uit
- Pricing locked (Q-0507 UPDATED €100→€65)
- Sprint 1+2+3 partial deliverables
- D1-D15 decizii LOCKED (15/15 RESOLVED)
- Sprint 4 / Wave 6 backlog complet
- Sprint 4 A+B LIVE prod (boot wire + ADR 021 Faza 1 algorithm)
- i18n infrastructure LIVE post-audit (whyEngine rewrite cu 4 categorical lock + alert→modal anti-RE compliance)
- 4 findings noi 2026-05-01 (F-NEW-1..F-NEW-4) flag-uite separate priorities
- Memory persistent state (consolidat 30→17 reguli evening v2)
- Vault cleanup state final (sesiune 30 apr evening)
- Sistem inbox/outbox live
- ADR amendments consolidate (009 inline, 019 GDPR standalone)
- §16 ADR 020 Storage Tiering Phase 1 implementation notes
- §17 Governance hardening (§HANDOVER_PROTOCOL + §7 DIFF + §8 Destructive Ops)
- §18 Inbox strict Daniel — bug fix evening v2
- §19 Sprint 4 A+B Implementation Notes
- §20 i18n Decision B Locked + Audit Completed
- §21 Wording Categorical "De ce?" Locked + Anti-RE Absolute Reaffirmed
- §22 Findings Noi 2026-05-01 (F-NEW-1..F-NEW-4)
- §23 Engine Wording 12 Variații LOCKED + Decizia #6 Recovery Score (morning v2)
- §24 Phase A Toasts/Confirms Aprobate Tacit ~36 strings (morning v2)
- §25 Wording REMAINING Next Sesiune (~103 strings post-evening, updated)
- §26 Goal-ca-Setting + 8 Templates Programe v1 LOCKED (evening — major scope shift v1)
- §27 Wording Rewrite Phase B Evening — 4 Batch-uri 53 Strings Finalizate (evening)
- §28 Amendamente Backlog Sprint 4.x (evening 5 + 2026-05-02 5 noi = 10 total)
- §29 Safety Nutrition Pattern + 4 Templates V1 Full Spec (2026-05-02 — kcal floor + protein floor + 4 templates Slăbire majoră/moderată/Tonifiere baseline+3 sub-variants/Sănătate Generală)

**Pentru chat nou:** citește acest fișier + `VAULT_RULES.md` (root) + `PROMPT_CC_HYGIENE.md` (root). Restul context = Project Knowledge GitHub.

---

## 1. VISION FINAL LOCKED

### 1.1 Product vision

> **"Oricine, orice țară, orice categorie de om, orice sex, orice vârstă, orice grad de antrenat sau nu, să instaleze aplicația, să o înțeleagă, să dea rezultate bune, și să aibă minimum friction."**

— Daniel, 2026-04-29 seară

**Implicații concrete:**
- Engine universal valid biologic (NU tech-lifter exclusive)
- 7 features distinctive funcționează pentru orice user
- Calibration tiers auto-adaptive
- Anti-paternalism ABSOLUTE indiferent de profil
- UX onboarding sub 120s (Q-0586)
- RO + EN simultan v1, alte limbi v1.x
- Min friction = Bayesian inference pasiv + categorical universal display + multi-gym auto-detect

### 1.2 Distribution strategy

**NU vision = distribution.** Distribuție incremental:
- **v1 beachhead:** Tech-lifter ICP (100-500 users) prin Reddit/Discord/balene 10-20 antrenori powerlifteri geeks/word-of-mouth
- **v1.5+ expand:** Mainstream cu cash flow Founding Members + early Pro
- **v2+ global:** Marketing budget ads/SEO/ASO

Bootstrap solo $0 marketing. Timeline **2-4 luni pre-launch beta** (post-velocity recalibration), 12-18 post-launch.

**AMENDMENT 2026-05-01 evening:** Timeline v1 ajustat **8-10 luni** (vs 2-4 luni inițial post-velocity). Trade-off acceptat pentru product care servește 90%+ market via goal-ca-setting + 8 templates programe v1 (vezi §26). Velocity recalibration NU e contradictă — adăugarea scope (8 templates + exercise library extension + goal-aware ACTION wording + 5 segments ICP) e sub timeline original "12-18 post-launch v1.5+ expand" comprimat în v1 launch.

---

## 2. STRATEGIC POSITIONING LOCKED

### 2.1 "SensAI for Android"

**Insight critical (2026-04-29 seară):** SensAI = iOS exclusive. NU există pe Android.

**Realitate piață:**
- iOS: SensAI mature win (wearable Apple Health + Lock Screen + Dynamic Island + brand)
- **Android: SensAI NU există**. Competitori = Fitbod ($95.99/an), JuggernautAI niche, Hevy logging, Arvo niche
- **Zero Android competitor cu cognitive architecture full + wearable HRV + cross-pillar reasoning**

**SalaFull positioning:** **"SensAI for Android"**.
- Android global ~70% market, ~75% Europe, ~85% Romania
- iOS users await v1.x Apple HealthKit + Capacitor wrapper
- Pricing parity €65/an = no-brainer choice pe Android

### 2.2 Cele 7 features distinctive (MOAT)

1. **AA Detection** (5 signals: volume_creep, frustration, recovery_debt, ignore_recovery, calorie_acceleration) + composite + tier LOW/MED/HIGH
2. **Reality Engine validation** 3 layere (auto-delete <2min, prompt <5/15min, post-session validation)
3. **Anti-RE strategy** categorical universal user-facing + engine internals ASCUNSE indiferent tier
4. **Fiber Type Inference per-exercise automated** (4 layere: rep stability + RPE delta + volume tolerance + confounders)
5. **Bayesian Nutrition INFERENCE pasiv** (zero input user, motor pasiv din kg trend + force progression + mood + adherence + RPE + readiness emoji)
6. **Multi-Gym 5 săli paralele** + equipment_unavailable per-gym
7. **5-engine cognitive architecture** (HISTORICAL + REALTIME + PROJECTION + ARBITRATOR + ACTION) — explained as branding

**MOAT window:** 12-24 luni înainte ca SensAI/Rizin să replice. Velocity > obscurity.

---

## 3. PRICING LOCKED (Q-0507 UPDATED in PRODUCT_STRATEGY_SPEC_v1)

| Tier | Pricing | Justification |
|------|---------|---------------|
| **Founding Members 100-500** | **€60 lifetime once** | Loyalty engineering, evangheliști permanenți, primii adopters tech-lifter ICP |
| **Pro standard v1+** | **€6/lună sau €65/an** | Parity SensAI ($69.99/an = ~€65). Competitive price, MOAT pe features unique |
| **iOS post-v1.x** | Same €65/an | Cross-platform consistency când Apple HealthKit ready |

**Schimbare vs Q-0507 inițial:** -35% (€100 → €65)

**Math revenue:**
- 10K users × €65/an = €650K/an
- 15.4K users × €65/an = €1M/an target Year 2-3

**Update aplicat în PRODUCT_STRATEGY_SPEC_v1.md** (sesiune 30 apr evening).

---

## 4. SPRINT 1+2+3 PARTIAL — DELIVERABLES (2026-04-30 dimineața)

### 4.1 Velocity calibration BRUTAL

- **Estimate inițial:** 6-9h
- **Real wall-clock:** 28 min
- **Off factor: 17× faster**

**Implicații estimate viitoare:**
- Timeline 5-9 luni pre-launch = probabil **2-3 luni real**
- Sprint 3 full implementation 65-105h "dedicated session" = probabil **3-5h real**
- Wave 6 features 180-290h = probabil **15-25h real**

**Memory rule update:** estimate-uri developer ÷ 10-15 pentru Opus comprehensive runs.

**Constraints care NU se accelerează:**
- Daniel review hours (UX validation manual)
- Legal/external review (consultancy)
- Beta tester recruitment (organic time)
- iPhone test device acquisition (logistic)

### 4.2 Sprint 1 — 5 acțiuni docs SSOT lock-up ✅

1. Firebase EU verified (europe-west1)
2. ADR 009 amendment tier system SSOT (engine_tier T0/T1/T2 + calibration_confidence COLD_START→OPTIMIZED ortogonale, forward-compatible N axes) — **CONSOLIDAT INLINE în 009 sesiune evening**
3. PRODUCT_STRATEGY Nutrition/Sleep inference IN_SCOPE (logging stays OUT, inference IN, Apple Health Sleep deferred v1.x)
4. ADR 011 LWW deprecated → T&B mandatory pre-launch + 90 zile retention + ADR 013 force-typing eliminated permanent + ADR 018 status update + Pro pause retention 90 zile
5. Anti-RE banner sweep — 8 leaks inventar (6 percentage + 2 numerical) flagged D2-D5

### 4.3 Sprint 2 — 3 acțiuni validation infrastructure ✅

6. `scripts/backfill_diff.js` — automated 100% comparison + 20 control samples + smoke test
7. Golden Master Suite scaffold + 30 generated profiles (10 beginner + 10 intermediate + 10 advanced) + Stryker config (npm install deferred D7)
8. `scripts/gdpr_k_anonymity_check.js` + ADR amendment k=5 SSOT (quasi-identifiers: age_bucket, sex, experience_tier, decision_type, timestamp_week_bucket) — **PROMOVAT la ADR 019 standalone sesiune evening**

### 4.4 Sprint 3 partial — 2 acțiuni design specs ✅

9. `ADR_MULTI_TENANT_AUTH_v1.md` + `04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md` (UUID Anonymous → Firebase Auth real, 3-phase migration plan)
10. `04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md` (append-only log + branch detection + tombstone 90 zile + UI prompt + GC Cloud Function)

### 4.5 Stats execuție

- **14 commits pushed** la `origin/main`
- **HEAD post-Sprint:** `89199db`
- **HEAD post-evening cleanup:** `5cb5660` (vault cleanup + folder renumber + path refs sweep + inbox/outbox installed)
- **Tests:** 752/752 stable (D6 flake adherence Thursday OFF rezolvat de la sine)
- **Reports:** `📤_outbox/_archive/2026-04/08_SPRINT1_EXECUTION_REPORT.md` + `09_SPRINT2_EXECUTION_REPORT.md` + `10_SPRINT3_PARTIAL_EXECUTION_REPORT.md` (legacy `cc-reports/` deprecated 30 apr, migrated to outbox archive).

---

## 5. D1-D15 ROUTING DECISIONS — TOATE LOCKED

**Status:** **15/15 RESOLVED 2026-04-30 evening** (post chat strategic Sprint 1+2+3 partial review + Gemini cross-check + ADR 020-021 + amendments).

**Citire context complet:** `📤_outbox/_archive/2026-04/08_SPRINT1_EXECUTION_REPORT.md` + `09_SPRINT2_EXECUTION_REPORT.md` + `10_SPRINT3_PARTIAL_EXECUTION_REPORT.md` (legacy `cc-reports/` migrated 30 apr).

| # | Decizie | Status final + rationale scurt |
|---|---------|-------------------------------|
| **D1** | DEVELOPING tier add or drop? | ✅ **ADD DEVELOPING** — 6 nivele canonical (COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED). Sprint 4 implementation ~8-12h cod + tests + schema migration. Rationale Daniel: *"dezvoltam dupa ce terminam cu restul, de ce sa ne dam in cap dupa cu testari?"* — post-Sprint 3 full, zero-disruption sequencing. |
| **D2-D4** | Anti-RE wording rewrite leak #1/#2/#3 | ✅ **DEFER Sprint 1.5** — wording rewrite tracked în Sprint 1.5 backlog (post-v1 launch, când beta useri 5+ produc real-world signal). |
| **D5** | Anti-RE wording rewrite leak #4 | ✅ **Categorical only verdict** (NU numerical leak în any wording) — Sprint 1.5. |
| **D6** | `adherence.test.js` Thursday OFF flake | ✅ **REZOLVAT** post date rollover (752/752 stable). |
| **D7** | Stryker mutation testing `npm install` timing | ✅ **Stryker autonomous overnight Sonnet baseline + Daniel review** — NU blocks Sprint 4. Reviewer: Sonnet generates baseline, Daniel manual review escalates to Claude chat technical pe ambiguity. |
| **D8** | Manual profiles 100 craft pace | ✅ **Sonnet generates JSON 5/sprint** — 5 manually-crafted anchor personas per sprint, algorithmic 450 fill-up restul (per ADR 017). |
| **D9** | GDPR k-anonymity validation timing | ✅ **Post-100-real-users** (NU pre-launch mock — needs real distribution data per ADR 019). |
| **D10** | `cc-reports/` în `.gitignore` line 16 | ✅ **REZOLVAT prin outbox migration schema** — folder DEPRECATED 30 apr, replaced de `📤_outbox/LATEST.md` + `_archive/<YYYY-MM>/NN_*.md` (per VAULT_RULES.md §3.3). |
| **D11** | Auth provider strategy (Multi-tenant ADR) | ✅ **Magic Link primary + Google OAuth secondary** — Magic Link UX zero-friction (one-tap email link), Google for users care preferă SSO. |
| **D12** | Anonymous accounts pre-launch (Daniel testing) | ✅ **2 anonymous accounts pre-launch (phone + PC)** + flag pre-Faza-1 manual merge timing — Daniel testează scenario reconciliation real (per ADR 021 §EC-5). |
| **D13** | T&B Faza 2 strangler order (logs vs weights first) | ✅ **Logs first** — high-frequency write, blast radius low (data path frequent dar non-critical UX). Per ADR 021 §Implementation phasing Faza 2. |
| **D14** | Branch conflict UI (BranchConflictModal) | ✅ **3 options + auto-resolve cronologic** — User vede 3 variante (A, B, MERGE) + auto-resolve cu last-modified timestamp dacă user nu alege în 30s (anti-friction). |
| **D15** | Token refresh strategy (Multi-tenant Auth) | ✅ **Pre-expiry refresh 10min** + retry 401 cu single backoff — anti-spike server load + transparent UX (NU forced re-login mid-session). |

**Cross-ref canonical:** [[DECISION_LOG]] §2026-04-30 evening (full context Gemini Q10 BLIND SPOTS + F1 AA composite formula + amendments cascade).

---

## 6. SCOPE FINAL LOCKED — Sprint 4 / Wave 6 backlog

### 6.1 Pre-launch v1 core (existing scope)

**180-290h tradițional → 15-25h realist post-recalibration:**
- 5-engine architecture full (HISTORICAL + REALTIME + PROJECTION + ARBITRATOR + ACTION)
- Reality Engine 3 layere
- AA Detection 5 signals + composite + tier
- Bayesian Nutrition Inference 5-layer (motor pasiv)
- Sleep inference (REALTIME readiness + post-session RPE proxy)
- RPE per-set inference (smart inference + selective prompt outliers)
- Multi-Gym 5 săli + equipment_unavailable per-gym
- Fiber Type Inference per-exercise (4 layere)
- UI Tabs Restructure (Statistici, Setări, etc.)
- Onboarding sub 120s
- Anti-RE categorical universal display
- Free tier permanent + Pro paywall
- Sprint 3 full implementation (Multi-tenant auth real Firebase + T&B integral + legal review extern)

### 6.2 Pre-launch v1 — 4 features SensAI take ADĂUGATE (~46-74h)

| # | Feature | Effort | Note |
|---|---------|--------|------|
| 1 | Smart Swap conversational text | 8-12h spec + 15-20h impl | Layer LLM (Sonnet) peste alternative engine. NU voice (Q-1133) |
| 2 | Smart Modify whole workout text | 10-15h | Dimension RUNTIME_MODIFY combined cu #1 same LLM layer |
| 5 | Conversational "Why?" rationale | 10-15h | LLM read-only peste CDL trace. Engine deterministic preserved (anti-RE) |
| 4 | Google Fit Android only | 10-15h | Apple HealthKit DEFER v1.x (no iOS test device) |
| 8 | Progress tab adaptive per platform | 8-12h | Android cu wearable recovery, iOS/Web cu logged data + "wearable coming v1.x" placeholder |

### 6.3 Pre-launch v1 — 4 idei JuggernautAI ADĂUGATE (~24-37h)

| # | Feature | Effort | Tip |
|---|---------|--------|-----|
| A | Meet Peaking / Target-date programming | 5-8h | Integrate existing PROJECTION reverse calc |
| B | Bridge Blocks / Recovery transition | 8-12h | Dimension nouă RECOVERY_BRIDGE injectează deload la phase transitions |
| C | MEV/MAV/MRV research input | research only | Integrate existing Fiber Type Inference spec Sprint 4 |
| D | Dynamic Coaching Cues per exercise | 3-5h spec + 8-12h impl | Integrate existing engine-generated form cues din pattern detected |

### 6.4 v1.5 planificat

- Equipment ID via photo (Multi-Gym integration) — 12-18h. Vision API identificare aparat + suggest substitut

### 6.5 v1.x cu iPhone test device (€100-200 second-hand)

- Apple HealthKit integration (parity Android Google Fit)
- Lock Screen iOS + Dynamic Island (cu Capacitor wrapper)
- Form check via photo (DEFER v1.5+, vision tech matures + legal review)

### 6.6 Skip permanent

- Set-by-set adaptation sub 500ms (Arvo) — value/cost ratio prost
- Voice coaching (Ray, ElevenLabs) — Q-1133 lock
- Methodology presets user-facing (Mentzer/FST-7/Y3T) — anti-RE violation
- Exercise library 4000+ — quality > quantity, ~200 illustration 3D anatomical preserved
- Human coach hybrid — bootstrap solo zero resurse
- Community features social v1 — Discord Premium Perk gated post-500 users (Q-0533)

### 6.7 Total scope effort

**Pre-launch v1 ADĂUGAT peste existing: ~115-181h** (4 SensAI + 4 JuggernautAI + Chalkboard + Feedback)
**Cu velocity recalibration: 12-22h real** Claude Code + Daniel review hours.

**Adăugări post-Gemini cross-check 2026-04-30 evening:**

- **Storage Tiering ADR 020 (CRITICAL pre-launch):** ~10-15h Sprint 4 mandatory (Dexie integration + migration runner + Tier 0/1 read/write paths în engine + tests Golden Master).
- **Calibration Drift ADR 021 (pre-Faza-2 T&B):** ~8-12h Sprint 3 full (reconciliation algorithm + schema bump + multi-device test scenarios).
- **Bayesian Strong Prior PRODUCT_STRATEGY §3.5.1:** ~2-3h Sprint 4 spec (T0 + Self-report 80/20 strategy detail + signals input doc).
- **AA composite no-double-penalize ADR 013 amendment:** ~2-3h Sprint 4 (cross-signal dedupe logic în composite tier function + test cases).

**Total nou adăugat:** ~22-33h tradițional, ~3-7h velocity recalibrated Opus comprehensive.

**Total cumulat pre-launch v1 actual:** **137-214h tradițional → 15-29h velocity Opus comprehensive** (vs estimate inițial 115-181h tradițional → 12-22h velocity).

**Timeline pre-launch beta: 2-4 luni realist** (unchanged — adăugările sunt absorbite în velocity buffer Sprint 3 + Sprint 4 existing).

### Status update 2026-04-30 evening v2

- **ADR 020 Storage Tiering Phase 1: ✅ LIVE** (Dexie.js Tier 0/1 + 52 tests + zero regression). Implementat în ~25 min Opus = velocity ~30-50× pe foundation work bine speciat. Phase 2 logs rotation = Sprint 4.x backlog (~2-3h Opus, blocat de `coachContext.buildContext` async refactor).
- **Wire `initAutoBackup()` în app boot** = ~30 min Sprint 4.x **mandatory pre-launch** (altfel rotation NU rulează — Tier 0 acumulează indefinit, PWA crash silent risk reapare).
- **ADR 021 Calibration Drift** = next priority Sprint 3 full (~8-12h trad / ~3-5h velocity Opus). Pre-Faza-2 T&B prerequisite.

### Status update 2026-05-01 morning (post Sprint 4 A+B + i18n audit)

- **Sprint 4 A wire LIVE prod** — `runMigrations()` + `initAutoBackup()` wired în `src/main.js` `init()` cu graceful degradation. `src/bootstrap.js` testable wrappers extracted. `window.__forceRotation()` dev helper. Smoke test prod **PASS funcțional** (IndexedDB lazy-create OK, persistence OK, init logs ordered, rotation `{rotated: 0, perKey: [3 stores], errors: []}`).
- **Sprint 4 B ADR 021 Faza 1 LIVE** — algorithm core pure (`src/engine/calibrationReconciliation.js` ~280 LOC) + 37 tests EC-1..EC-6 mandatory. Faza 2 persistence + integration deferred (post coachContext.buildContext async refactor + LWW decommission timeline).
- **D6 adherence flake permanent fixed** (UTC vs local date misalignment — `toLocaleDateString('sv')` switch).
- **i18n infrastructure LIVE post-audit** — `src/i18n/index.js` `t(key, vars?)` helper + RO/EN bundles + 23 tests. `whyEngine.js` rewritten cu 4 verdict-based categorical wording-uri lock-uite (anti-RE absolute, ZERO leak `[category]` codes, ZERO numerice). `modals.js` `alert()` browser native → modal in-app DOM cu i18n.
- **Smoke test prod descoperă 4 findings noi user-facing breach** — vezi §22 (F-NEW-1..F-NEW-4): exercise names EN, progression scaling tier-aware, hyperreactive coach cooldown, plan ajustat banner percentage leak.
- **Tests:** 854 → **888 PASS** (+34: 23 i18n + 22 whyEngine - 11 legacy whyEngine).
- **Phase 5 i18n bulk replace DEFERRED** — 238 strings remaining = audit raport input pentru Daniel chat strategic wording rewrite session. NU bulk replace în run autonomous.

### Status update 2026-05-01 morning v2 (chat strategic wording session)

- **Wording rewrite session STARTED** chat strategic morning v2. **Phase A toasts/confirms ~36 strings COMPLET** în tabel Bugatti aprobat tacit (vezi §24). **Phase B Engine messaging — Engine variations 12 strings LOCKED** (vezi §23 — 4 verdicte × 3 variants UP/DOWN/HOLD + RECOVERY refactorat banner global + per-exercise). **Phase B restul ~58 strings (readiness verdicts, dp/sys/proactiveEngine/plateau/fatigue/calibration tier names, skip reasons) + Phase C page labels ~78 + Phase A restul ~20 = REMAINING next sesiune** (vezi §25).
- **Decizia #6 Recovery score numeric exposure RESOLVED** (vezi §23): eliminăm complet numărul. Doar verdicte text "Recuperat / În refacere / Epuizat". Anti score-chasing + anti overthinking. Pro tier NU primește expunere numerică — decizie globală.
- **Implementation pattern hash deterministic LOCKED** pentru variant selector — `hash(today_sv + exercise_id) % 3` cu `toLocaleDateString('sv')` (anti-midnight-flicker, same pattern ca D6 fix din `adherence.test.js`). Variant selector = pending implementation Sprint 4.x parte din wording rewrite implementation.
- **Filter Bugatti aplicat strict** prin 6 runde pushback iterative — eliminat: "ridicăm miza" (poker), "resetăm calitatea mișcării" (mecanic), "calitatea mișcării" abstract, "sistem suprasolicitat" (server alert jargon), "vârf de formă mâine" (promise temporal nesigur), "coach-ul observă" (voice inconsistent persoana 3 vs plural inclusiv).
- **Tests:** 888/888 PASS unchanged (sesiune chat strategic only, zero code touched).
- **Bandwidth Daniel:** ~30% chat strategic ended, handover triggered preventiv ÎNAINTE saturation halucinație.

### Status update 2026-05-01 evening (chat strategic goal-ca-setting + 53 strings Phase B partial)

- **Goal-ca-setting + 8 templates programe v1 LOCKED** (vezi §26): 5 voices RĂMÂN neschimbate (HISTORICAL/REALTIME/PROJECTION/ARBITRATOR/ACTION), goal injectat ca SETTING profil + 8 templates programe (1 Forță + 3 Tonifiere + 2 Slăbire + 1 Longevitate + 1 Sănătate Generală) + onboarding flow Q1+Q1.5 conditional + re-prompt periodic 4-6 săpt.
- **Wording rewrite Phase B partial — 53 strings finalizate** în 4 batch-uri (vezi §27): Batch 1 readiness verdicte (6) + skip reasons (5) + F-NEW-4 plan banner (3) + 3 amendamente. Batch 2 calibration tier names (6) + sys.js phase logic + BMI/BF (6). Batch 3 proactiveEngine.js complet (12 alerts cu 5 contexte noi). Batch 4 plateauInterventions.js two-layer (6 interventions × 2 layers).
- **5 amendamente backlog Sprint 4.x** (vezi §28): durere cronică split (SKIP_PAIN_MILD vs SKIP_INJURY) + threshold trigger logic F-NEW-3/F-NEW-4 + revenire pauză lungă (>14 zile) + F-NEW-3 cooldown re-locked Option C + Weight Trend engine refactor split direction-aware (3 alert types).
- **Decizii arhitecturale evening LOCKED**: Tier policy RO universal default (EN tech labels CUT/BULK eliminate complet) + voice persoana I plural ("noi") coach vs persoana I singular ("eu") user + numerics policy proactive (factual user-confirmable păstrate, algorithmic diagnostics ELIMINATE) + Weight Trend split direction-aware + two-layer messaging plateauInterventions (badge UI + mesaj proactive coach).
- **Wording REMAINING reduced ~187 → ~103 strings** post-evening (vezi §25 updated): Phase B restul ~37 (dp/sys/fatigue/reality/calibration) + Phase C ~78 (dashboard/weight/plan) + Phase A restul ~20 + Onboarding ~9 (UNBLOCKED post goal taxonomy).
- **Timeline v1 ajustat: 8-10 luni** (vs 2-4 inițial) — trade-off acceptat pentru 90%+ market coverage via goal taxonomy. Vezi §1.2 amendment.
- **Tests:** 888/888 PASS unchanged (sesiune chat strategic, zero code touched).
- **Bandwidth Daniel:** ~30% chat strategic evening ended, handover triggered preventiv anti-saturation. Wall-clock ~3-4h Daniel-time real (5 decizii product MAJORE + 5 decizii arhitecturale + 53 strings + 5 amendamente).

### Status update 2026-05-02 (chat strategic safety nutrition + 4 templates v1)

- **Safety nutrition pattern LOCKED complet** (vezi §29.1): kcal floor 1200F/1500M static gendered (NIH+EFSA) + protein floor 1.6 g/kg dynamic (ISSN) + surplus rate threshold engine internal >0.5%/săpt (NU exposed) + hidratare DROP safety pattern (rămâne observational §27.3). Pattern reusable: 2 nivele soft warning, ZERO Hard Wall, agency 100%, threshold L2 = 3 zile consecutive (pattern detection NU fiziologie speculative). Authority asymmetry NIH+EFSA kcal vs ISSN protein INTENȚIONAT documentat.
- **4 Templates programe v1 LOCKED full spec** (vezi §29.2): Slăbire majoră (>15kg, 3×/săpt, low-impact, recumbent bike LISS, BMI implicit 30+) + Slăbire moderată (<15kg, 4×/săpt Push/Pull split A/B, RDL hinge protection lombară) + Tonifiere baseline + 3 sub-variants (4×/săpt, 50/50 Echilibrat / 70/30 Lower-dominant Gigica / 70/30 Upper-dominant Marius, BBS+BBP+Olympic+1RM eliminate, Russian Twists eliminate) + Sănătate Generală (3×/săpt Full Body NU split, 18-49 maintenance default, consistency check pool exerciții cu Tonifiere).
- **5 templates lockate / 8 v1 (62.5%).** Rămase: Forță & Dezvoltare + Longevitate + potențial Sănătate Generală sub-variants. Tonifiere counted ca 1 baseline cu 3 sub-variants split (5 design units cu Tonifiere expanded).
- **5 amendamente backlog Sprint 4.x noi** (vezi §28.6-§28.10): Secondary Check >25% deficit maintenance refinement (floor static fragility) + Seated Core Override Slăbire majoră (Bird-Dog→Seated Knee Raises feedback-driven) + LISS ramp-down Slăbire majoră (15→8-10min săpt 3+) + Exercise Substitution System ADR separat (Tonifiere dynamic slotting) + Tonifiere Advanced Track 5-day (a 5-a sesiune optional weak points).
- **3 decizii arhitecturale colaterale LOCKED** (vezi §29.3): ZERO întrebări medical screening onboarding (Gigel test catastrofal — bloodwork rejected analog) + engine routing Slăbire majoră BMI 30+18kg target = template low-impact aplicat conservative-by-default + Anti-RE strict pragul 0.5%/săpt + protein 1.6 g/kg + 25% deficit = engine internal NU exposed user-facing.
- **Decizii non-vault dinainte de sesiune:** launch strategy reconsider (full launch vs hand-pick balene — sesiune dedicată distribution strategy needed) + legal coverage realitate ~80-90% via MFP pattern + ADR 013 SAFETY_TRIPWIRE + ToS + Privacy Policy (consultanță legală tech RO/EU specializată ~€500-2000 NU optional pre-launch) + realist rămas ~5-6 sesiuni chat strategic pre-launch v1 + Anthropic dependency risk ~0.1% acceptat.
- **Tests:** 888/888 PASS unchanged (chat strategic, zero code touched).
- **Bandwidth Daniel:** ~15-20% remaining final, handover triggered preventiv. Wall-clock ~3h Daniel-time real (19 decizii LOCKED + 12+ push-back-uri productive + 3 web searches NIH/Harvard/EFSA/INSP).

---

## 7. VAULT STATE FINAL (post sesiune 30 apr evening)

### 7.1 Cleanup executat

**125 → 49 vault docs** (-61%). 76 fișiere deleted/migrated. ZERO information loss (uniques migrated în SSOT înainte de delete, git history backup).

**Foldere removed:** `05-prompts/`, `10-exec-queue/`, `docs/`, `99-archive/` (gol post-cleanup).

**Renumerotare:** 06→05, 07→06, 08→07, 09→08 (continuu post-removal).

### 7.2 Sistem inbox/outbox LIVE

**`📥_inbox/`** — Daniel uploadează aici fișiere noi. Opus consumă + delete.
**`📤_outbox/`** — schema activă (per VAULT_RULES.md §3.3): `LATEST.md` = 1 file activ vizibil top-level (Daniel paste-uiește în chat); existing LATEST.md → MOVE în `_archive/<YYYY-MM>/NN_<TASK>.md` la next CC run. Numerotare `NN` cronologic continuu (NU reset lunar, NU FIFO). `_archive/` = istoric infinit, intact, zero info loss.

**Files la root:**
- `VAULT_RULES.md` — reguli permanente (SSOT list, structura, protocol inbox/outbox)
- `PROMPT_CC_HYGIENE.md` — prompt reutilizabil pentru Opus

### 7.3 ADR amendments consolidate

- **ADR 009 amendment** → merge inline în `009-calibration-tiers.md` ca `## AMENDMENT 2026-04-30`
- **ADR_GDPR_AMENDMENT** → promovat la **ADR 019** standalone (`019-gdpr-k-anonymity-validation.md`) — n-avea ADR original GDPR
- **VAULT_RULES.md §2** updated: ADR list `001-*.md → 019-*.md`
- Cross-refs sync (DECISION_LOG, INDEX_MASTER, COGNITIVE_ARCH, PRODUCT_STRATEGY, scripts/README)

### 7.4 Path references sweep

8 stale references corectate post folder renumber:
- README.md, INDEX_MASTER.md, HANDOVER_TEMPLATE, CLAUDE_CHAT_INFRASTRUCTURE, CHAT_MIGRATION_PROTOCOL, DECISION_LOG, INSIGHTS_BACKLOG

### 7.5 Drop Obsidian

Daniel n-a deschis Obsidian de 3+ zile, n-a simțit lipsa. VS Code only. Single tool SSOT real.

### 7.6 Q-0507 pricing UPDATE aplicat

`PRODUCT_STRATEGY_SPEC_v1.md` §1.3, §1.4, §1.5, §1.8 — pricing €60 lifetime / €65/an + paywall structure + "SensAI for Android" positioning + launch sequence.

§"Open Items" — "Pro pause data freezing" RESOLVED (90 zile retention per ADR 011).

### 7.7 Outstanding A2 din raport 01

Handover narrative §0 cu instrucțiuni post-consolidare obsolete (mențiuni `99-archive/` care nu mai există) — **decizia: B** (lasă naturally, overwrite la next handover). Handover-ul ăsta e overwrite respectiv.

---

## 8. MEMORY PERSISTENT FINAL STATE

### 8.1 Entries currently active (8 total)

1. SalaFull timeline calibration: CC velocity 2-4 luni pre-launch beta (post-recalibration 5-10× faster)
2. SalaFull pre-launch sequencing locked: Sprint 1 → 2 → 3 → 4
3. SalaFull T&B retention 90 zile (NU forever, NU 30 zile)
4. SalaFull anti-RE strategy = categorical universal user-facing + engine internals ASCUNSE
5. SalaFull tier system SSOT: 2 axe ortogonale (engine_tier + calibration_confidence) + N axes future
6. SalaFull Bayesian Nutrition + Sleep = MOTOR PASIV (zero input). Apple Health Sleep deferred v1.x
7. SalaFull force-typing AA HIGH eliminated permanent. Backfill = automated diff 100% + 20 control samples
8. ~~SalaFull Sprint 4 / Wave 6 backlog NEW idei JuggernautAI~~ — **DE ȘTERS** (info time-bounded, e în handover)

### 8.2 Memory consolidation 2026-04-30 evening v2

**Memory consolidat 30 → 17 reguli (-43%).** Clustere agresive (Daniel persona, anti-paternalism, format chat, prompts CC SSOT). Reguli MANDATORY întărite:

- **Reg #1 Prompts CC SSOT MANDATORY:** ARTEFACT MEREU 1-click copy + ZERO markdown chat (cerere explicită Daniel post slip 30 apr).
- **Reg #9 Format chat MANDATORY:** răspunsuri scurte + push-back direct + zero filler.
- **Reg #10 Model selection MANDATORY:** Opus = base default, Sonnet doar mecanic justificat.
- **Reg #15 Context state proactiv MANDATORY:** bandwidth raport la 5-7 mesaje grele.

**Pricing + positioning + CC Opus principle + vault hygiene system** — toate au fost evaluate ca candidates în evening v1 → unele integrate ca reguli, altele rămân tactical în handover.

**Principle locked:** memory = principles cross-context. Tactical/time-bounded = handover.

---

## 9. PRINCIPLE LOCK-UIT — CC Opus 4.7 autonomous

> **CC Opus 4.7 autonomous = Co-CTO frate, NU Sonnet executor. Treat-l cu trust + bigger picture context, NU cu micro-prompts sequenced.**

**Evidence empirică:**
- Sprint 1+2+3 partial (10 acțiuni, scope mixt) = 28 min real, 14 commits, ZERO întrebări
- Estimate 6-9h. Real 28 min = **17× faster**

**Velocity table:**
| Mode | Velocity vs developer estimate |
|------|-------------------------------|
| Opus autonomous comprehensive (single big prompt) | **17× faster** verified |
| Opus sequential micro-prompts | ~3-5× faster estimated |
| Sonnet autonomous | ~2-3× faster typical |

**Estimate rule:** developer tradițional ÷ 10-15 pentru Opus comprehensive.

---

## 10. DIFFERENTIATION REALITY 2026

**"AI = comoditate. Diferența = viziune + aspect + funcționalitate + user friendly + fool proof."** — Daniel

**5 axe execution unde SalaFull poate câștiga (combinație):**
1. Viziune ("oricine poate")
2. Aspect (Bugatti craft + 3D anatomical Claude Design)
3. Funcționalitate (7 features cognitive integrate)
4. User friendly (categorical universal + sub 120s onboarding + anti-paternalism ABSOLUTE)
5. Fool proof (Reality Engine + AA Detection + anti-RE)

**Architecture serves these axes, NU substitutes them.** MOAT = combinația.

---

## 11. CHALKBOARD educational layer in-app — LOCKED Sprint 4

### 11.1 Concept

Chatbot educational pentru fundamentals fitness + brand education + beginner enablement. Tone: profesor pasionat, NU textbook.

### 11.2 Architecture LOCKED

**LLM v1:** Cloudflare Workers AI free tier (Llama 3.3 70B) SAU Groq free tier.
**Backup:** Gemini 2.0 Flash, DeepSeek V3 (concern data residency China), self-host Llama Hetzner GPU ~€60/lună.

**Free tier limits:**
- Free: 5 q/zi, 30 q/lună, $0.50/lună spend cap
- Pro €65/an: 20 q/zi, 200 q/lună, $5/lună spend cap

### 11.3 Abuse prevention multi-layer (must-have v1)

- L1: Rate limit per user
- L2: Hard cap per request (max 500 chars input, 600 tokens output, 3 turns history)
- L5: Monthly spend cap per user
- L6: Global circuit breaker

**Nice-to-have v1.5:** L3 velocity rate limit, L4 pattern detection (entropy + classifier).

### 11.4 Cost

- LLM free tier: $0
- Firebase Cloud Functions: $0 (free 2M/lună)
- Firebase Auth: $0 (free first 50K MAU)
- **Total Year 1: $0-20/lună** la 100-500 users
- Worst case 10K users: $10-70/lună (1% revenue ratio)

### 11.5 Effort

- Tehnic: 35-55h tradițional → 3-5h Opus comprehensive
- Daniel content: 10-20h pentru 15-20 articles base v1

---

## 12. FEEDBACK SYSTEM in-app — LOCKED Sprint 4

3 components:
1. **Bug report** — descriere + screenshot opțional + auto-context (device, version, last action, CDL trace 24h)
2. **Feature request** — text + categorie (training/nutrition/UX/Chalkboard/cognitive features/other)
3. **General feedback** — NPS rating 1-5 lunar + comentariu opțional

**Storage:** Firestore (free tier scale mic, $0)
**Admin dashboard:** Daniel-only, list/tag/export CSV
**Effort:** 10-16h tradițional → 1-2h Opus comprehensive

---

## 13. WORKFLOW DANIEL ↔ CLAUDE ↔ OPUS (locked)

```
1. Claude chat → generez artefact (handover, ADR draft, prompt CC, etc.)
2. Daniel → drag & drop în 📥_inbox/
3. Daniel → /model opus în CC
4. Daniel → paste comandă CC ready-made
5. Opus → citește VAULT_RULES + 📥_inbox/, integrează în SSOT
6. Opus → ȘTERGE 📥_inbox/* (consumat)
7. Opus → MOVE existing 📤_outbox/LATEST.md → 📤_outbox/_archive/<YYYY-MM>/NN_<TASK>.md (cronologic continuu) + scrie raport nou ca 📤_outbox/LATEST.md
8. Opus → commit + push
9. Daniel → review raport, decide next
```

**Daniel NU memorează reguli.** Toate sunt în VAULT_RULES.md.
**Claude NU ține tracker mental.** Citește VAULT_RULES la pre-flight chat nou.
**Opus aplică reguli mecanic.** Nu interpretează — execută per spec.

### §HANDOVER_PROTOCOL + §7 DIFF + §8 Destructive Ops (2026-04-30 evening v2)

**§HANDOVER_PROTOCOL** (`VAULT_RULES.md`) acum operează cu **§7 DIFF Protocol mandatory** (`PROMPT_CC_HYGIENE.md`). Future ingest handover:

1. CC Opus citește input + SSOT vechi integral (NU sumarizare, NU search per secțiune)
2. Diff semantic section-by-section → flag missing în `📤_outbox/DIFF_FLAGS.md`
3. STOP pentru Daniel decision (A=preserve, B=drop, C=merge) per flag
4. Apply decisions → overwrite SSOT → archive vechi (NICIODATĂ delete)

**§8 Destructive Ops Checklist activ** — backup tag obligatoriu pre-op (`pre-<op-name>-<date>` push origin), force-push INTERZIS fără explicit Daniel approval ("force-push autorizat: YES" în prompt), `git mv` cross-folder cu emoji paths verify post-move cu `ls`.

**Cross-refs:** `PROMPT_CC_HYGIENE.md` §7 + §8, `VAULT_RULES.md` §HANDOVER_PROTOCOL.

### Velocity reinforced 2026-05-01 morning

Sprint 4 A+B realizat ~25 min Opus comprehensive (estimate trad ~10-15h, velocity **24-36×**). i18n audit + infrastructure + whyEngine rewrite + 23+22 tests + alert→modal replacement = ~30 min Opus comprehensive (estimate trad ~6-8h, velocity ~12-16×). Bandwidth budgeting Daniel-time = real × 3 confirmed pe foundation work bine speciat. Memory rule reinforced: estimate-uri developer ÷ 10-15 pentru Opus comprehensive runs cu spec clear.

### Velocity rule reinforced 2026-05-01 morning v2 (chat strategic ≠ CC velocity)

Chat strategic wording session ~6 runde iterative pushback = ~45 min Daniel-time real (NU CC velocity — chat strategic = Daniel + Claude human collaboration cu filter Bugatti aplicat per string, NU Opus autonomous run). Bandwidth budgeting Daniel-time = real × 3 confirmed. **§7 DIFF + §8 Destructive Ops mandatory pentru ingest** — reinforced post chat morning v2.

### Velocity reinforced 2026-05-01 evening (chat strategic product strategy + wording)

Chat strategic evening ~3-4h Daniel-time real cu 5 decizii product MAJORE (goal-ca-setting pivot + 8 templates programe v1 + onboarding flow + timeline impact + re-prompt periodic) + 5 decizii arhitecturale (tier policy RO + voice persoana plural/singular + numerics policy + Weight Trend split + two-layer messaging) + 53 strings wording (4 batch-uri) + 5 amendamente backlog. **Pattern Claude failure mode noted:** overconfident initial recommendations require Daniel forced clarification ("ești sigur?", "dar dacă...?") pentru pivot la simpler architecture. **Lesson locked:** când proposing complex architecture (e.g. voice nou peer cu 5 voices), ask "există variant simpler?" ÎNAINTE de a accepta. Push-back Daniel iterativ a forțat 3 pivots majore Claude (dimension → voice → setting; Slăbire 1 template → 2; "Forță maximă" → "Sarcină crescută").

### Velocity reinforced 2026-05-02 (chat strategic safety nutrition + templates v1)

Chat strategic ~3h Daniel-time real cu 19 decizii LOCKED (7 safety patterns + 4 templates v1 designate / 5 design units + 5 backlog v2/Sprint 4.x + 3 arhitecturale colaterale) + 12+ push-back-uri productive Claude (eliminat surplus-side safety scope creep / drop ACSM citation pe kcal / drop EFSA pe protein / eliminat Hard Wall + buton disabled / eliminat fiziologie speculative threshold 3-day / eliminat Russian Twists / fix Hip Thrust setup Slăbire majoră / fix mers bandă → recumbent bike Slăbire majoră / fix BBS + BBP elimination consistency / fix screening medical onboarding catastrofal / fix BMI-routing inconsistency vs §26.3 / fix reps protocol beginners obezi). **Velocity rule reinforced:** chat strategic dense cu domain expertise (safety + biomechanics + sport science) = ~6-7 decizii/oră Daniel-time real cu Claude push-back productive. Bandwidth budget: chat strategic ~3h = 19 decizii LOCKED → cap maxim înainte saturation halucinație. **Realist rămas pre-launch v1: ~5-6 sesiuni chat strategic** (per decizia LOCKED non-vault).

---

## 14. NEXT STEPS — POST HANDOVER

### Imediat (chat nou după validare aliniere)

1. **Verify alignment questions** ≥12/15 (chat nou citește `📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`)
2. **Daniel atașează raport CC i18n audit** (din `📤_outbox/_archive/2026-04/` LATEST.md previous post audit run — `24_SPRINT_4_A_B_BOOT_WIRE_ADR021_RECONCILIATION_RAPORT.md` + i18n raport în current LATEST anterior)
3. **Wording rewrite session** chat strategic — Daniel review listă completă strings extracted din audit Opus (~238 strings remaining post Phase 1-4), decide:
   - Wording-uri auto-puse în `ro.json` (4 lock + restul) — accept sau rescrie
   - EN translations strategy (Daniel scrie sau Sonnet asistă?)
   - Exercise names mapping F-NEW-1 (auto vs review fiecare?)
   - Phased approach: Phase A toasts/confirms (~36 strings, quick wins) / Phase B engine messaging (~70 strings, domain expertise) / Phase C page labels (~80 strings, bulk batch)

### Medium term (Sprint 4.x)

4. **F-NEW-3 hyperreactive coach** cooldown trigger logic (Daniel decide threshold: A=1 mod/24h triggers + 3+ silent, B=cooldown per trigger type, C=combined global+per-type cap)
5. **F-NEW-2 progression scaling tier-aware** verify `progressionEngine.js` respectă `ctx.engine_tier`/`calibration_confidence` pentru advanced users (+0.5kg micro-loading vs +2.5kg uniform)
6. **F-NEW-4 Plan ajustat banner** wording rewrite (parte din i18n audit Phase B + sesiune wording — categorical, anti-paternalism, zero numerice)
7. **Faza 2 ADR 021 integration** (post coachContext.buildContext async refactor + persistence layer design + LWW decommission timeline)
8. **Phase 2 logs rotation** (Sprint 4.x — async refactor + add logs la ROTATABLE_KEYS + getTieredLogs integration în engines)
9. **D1 DEVELOPING tier code refactor** (~8-12h Sprint 4 — schema migration runner ID renumber + add DEVELOPING level la `CALIBRATION_LEVELS` 0-4 → 0-5)
10. **Storage Full UX alert design** — Sprint 4.1 Daniel review wording (anti-paternalist per ADR 013 patterns)

### Long term (v1.5+)

11. **Sprint 4 / Wave 6 execution** (12-22h Opus realist) — 4 SensAI + 4 JuggernautAI + Chalkboard + Feedback
12. **Beta tester recruitment plan** (Reddit/Discord/balene)
13. **iPhone test device acquisition** (€100-200 second-hand) — pentru v1.x
14. **Equipment ID via photo** (Multi-Gym integration v1.5)
15. **Apple HealthKit integration full** (v1.x cu test device)
16. **Mainstream expand cu cash flow** Founding Members + early Pro

### Pre-launch v1 readiness state

ADR 020 Phase 1 ✅ LIVE prod (smoke test pass). ADR 021 Faza 1 ✅ LIVE algorithm core. i18n infrastructure LIVE + whyEngine rewritten cu wording lock + alert→modal compliance.

**Anti-RE breach descoperit prin smoke test = i18n audit + wording rewrite priority maxim ÎNAINTE D1 DEVELOPING + Phase 2 logs.** Sense check: ce sens are tier refactor când user vede `[pattern] STAGNATION` în chat banner.

Logs growth bounded de existing slice 5000. Pre-launch budget viable 6-12 luni user history.

### Updated 2026-05-01 evening — Next Steps post-evening

**Imediat (chat nou după ingest evening):**
1. Verify alignment questions ≥12/15 (regenerate post-ingest evening cu coverage goal-ca-setting + 53 strings + 5 amendamente).
2. Daniel review SSOT evening update — verifică §26/§27/§28 + §1.2 timeline amendment + §6.7 status update + §25 wording remaining decreased.
3. **Decizie ADR nou vs amendment** — recomandare Claude: **ADR 022 Goal-Driven Program Templates** standalone (decizie product strategic distinct, cross-refs PARAMETRIC_PROGRAMS_DESIGN + PRODUCT_STRATEGY_SPEC_v1).
4. Implementation prompt CC Sonnet pentru bulk batch i18n update cu 53 strings locked + amendamente backlog.

**Medium term (Sprint 4.x — adjusted scope post goal taxonomy):**
5. PARAMETRIC_PROGRAMS_DESIGN.md refactor — focusModifier (CUT/BULK/MAINTAIN) → goal field nou (forta_dezvoltare / tonifiere_definire / slabire / longevitate / sanatate_generala) + sub-routing. focusModifier devine modifier secundar phase logic.
6. **8 templates programe v1 design** — sesiuni dedicate cu coach domain expertise (Daniel articulează pattern + Claude review). Estimate 2-4 sesiuni dedicate.
7. **Exercise library extension** — adăugare ~50-100 exerciții pentru mobility (squat la perete, hip CARs, dead bug, bird dog) + cardio (LISS treadmill, cycling, rowing) pentru Longevitate + Slăbire majoră templates.
8. F-NEW-3 + F-NEW-4 implementation cu threshold logic + cooldown 21 zile + escalation User Pierdut + re-engagement banner (vezi §28).
9. Weight Trend engine refactor — split direction-aware 3 alert types `weight_trend_on_target` / `_slow` / `_fast` (vezi §28.5).
10. Re-prompt periodic goal modal — implementation timer + modal in-app (2-3h, vezi §26.5).
11. **ACTION layer wording per goal parametric** — i18n bundle extension `t('engine.<verdict>.<goal>.<variant>')`. Sprint 4.x scope post-locks complete (vezi §26.6).
12. Variant selector hash deterministic implementation (din morning v2 §23): `hash(today_sv + exercise_id) % 3` + bulk batch i18n cu 12 variations.

**Long term (v1 launch readiness):**
13. **Timeline v1 ajustat: 8-10 luni** (vs 2-4 inițial post-velocity, vezi §1.2 amendment).
14. **Beta tester recruitment plan** segmentat per goal (Reddit/Discord/balene tech-lifter beachhead Forță + r/xxfitness aesthetic-glutes Tonifiere + r/longevity Longevitate + Mompreneur communities Slăbire).
15. F-NEW-1 exercise names mapping RO — strategy hibrid locked (compound mari EN industry + izolări RO).

### Updated 2026-05-02 — Next Steps post-2026-05-02

**Imediat (priority order post safety nutrition + 4 templates v1):**
1. **ADR 022 nou Goal-Driven Program Templates** (deja flag-uit evening 2026-05-01) — extins acum cu safety nutrition pattern §29.1 + 4 templates V1 spec §29.2. Daniel + Claude review draft, cross-refs PARAMETRIC_PROGRAMS_DESIGN + PRODUCT_STRATEGY_SPEC_v1 + ADR 013 §SAFETY_TRIPWIRE.
2. **Sesiune chat strategic dedicată: Forță & Dezvoltare template** (cel mai complex — periodization, PR tracking, deload weeks). Fresh bandwidth obligatoriu. Template 6/8 v1.
3. **Sesiune chat strategic Longevitate template** (50+ specific — joint protection, cardio focus, mobility priority). Template 7/8 v1.

**Medium term:**
4. **Sesiune chat strategic distribution strategy reconsider** (full launch vs hand-pick balene per decizia LOCKED non-vault sesiune 2026-05-02 #1).
5. **Sesiune chat strategic F-NEW thresholds + muscle_memory_index + storage full UX** (decizia non-vault realist intro pre-launch obligatoriu).
6. **Wording Phase B remaining** (~37 strings dp.js / sys.js / fatigue.js / reality.js / calibration.js) — bulk batch CC Sonnet după plan complet templates.
7. **Wording Phase C UI labels** (~78 strings dashboard / weight / plan) — bulk batch CC Sonnet.
8. **PARAMETRIC_PROGRAMS_DESIGN.md refactor** — focusModifier (CUT/BULK/MAINTAIN) → goal field nou + sub-routing (carry-over evening 2026-05-01).
9. **Exercise library extension** — ~50-100 exerciții mobility + cardio low-impact pentru Longevitate + Slăbire majoră + Tonifiere variants pool.
10. **F-NEW-3 + F-NEW-4 implementation** Sprint 4.x cu threshold logic + cooldown + escalation User Pierdut + Weight Trend split + safety nutrition pattern integration (vezi §28).

**Long term pre-launch:**
11. **Consultanță legală tech specializată RO/EU** ToS final + Privacy Policy specific (~€500-2000, NU optional per decizia LOCKED non-vault).
12. **Pre-launch checklist obligatoriu** integrare ADR 020 Phase 2 logs rotation + D1 DEVELOPING refactor + smoke test scope.
13. **Status timeline v1:** 5/8 templates lockate (62.5%) + ~5-6 sesiuni chat strategic rămase pre-launch + timeline 8-10 luni v1 (per amendment §1.2).

---

## 15. TESTS & GIT STATE FINAL

- **Tests:** **888/888 PASS** (752 baseline + 52 storage ADR 020 + 13 bootstrap + 37 reconciliation + 23 i18n + 22 whyEngine - 11 legacy whyEngine = +136 cumulat) — unchanged 2026-05-02 (chat strategic, zero code touched)
- **HEAD origin/main:** `8065ce8` pre-ingest 2026-05-02 (post handover evening 2026-05-01 push final) — post-ingest 2026-05-02 SHAs see `📤_outbox/LATEST.md`
- **Vault docs:** **52 active** + README + VAULT_RULES + PROMPT_CC_HYGIENE + PROMPT_CC_INGEST_HANDOVER (unchanged 2026-05-02). Outbox archive (audit trail, NU vault docs): `📤_outbox/_archive/2026-04/01-28` + `2026-05/29-37..` (post handover ingest 2026-05-02). `cc-reports/` DEPRECATED 30 apr (folder removed, content migrated).
- **Folder count:** 9 numerotate continuu (00-08) + 📥_inbox + 📤_outbox.
- **Backup tags origin:**
  - `pre-adr-020-impl` (ADR 020 rollback)
  - `pre-handover-ingest-2026-04-30-evening-v2` (evening v2 ingest rollback)
  - `pre-sprint4-a-b-2026-04-30` (Sprint 4 A+B rollback)
  - `pre-i18n-audit-2026-05-01` (i18n audit rollback)
  - `pre-handover-ingest-2026-05-01-morning` (morning v1 ingest rollback)
  - `pre-handover-ingest-2026-05-01-morning-v2` (morning v2 ingest rollback — chat strategic wording session)
  - `pre-handover-ingest-2026-05-01-evening` (evening ingest rollback — chat strategic goal-ca-setting + 53 strings Phase B partial + 5 amendamente)
  - `pre-handover-ingest-2026-05-02` (2026-05-02 ingest rollback — chat strategic safety nutrition pattern + 4 templates v1 full spec + 5 amendamente noi + 3 decizii arhitecturale)

---

## 16. ADR 020 STORAGE TIERING PHASE 1 — Implementation Notes

**Status:** Phase 1 **LIVE** 2026-04-30 evening v2. Phase 2 logs rotation = Sprint 4.x backlog.

**Architecture:**
- `src/storage/db.js` (220 LOC): Dexie singleton + typed accessor API + namespace per-user
- `src/storage/tieringEngine.js` (290 LOC): rotation orchestrator + retry backoff + idempotency
- `src/storage/tieredRead.js` (70 LOC): async unified Tier 0+1 read merger
- `src/storage/tier2Stub.js` (80 LOC): Firebase Tier 2 stub (deferred post-Pro launch)
- 52 tests Golden Master Suite

**Phase 1 scope:** rotate `coach-decisions` + `coach-decisions-aggregate` + `applied-patterns` ONLY (NOT logs).

**Phase 2 scope (Sprint 4.x):**
- Add `logs` la `ROTATABLE_KEYS` după `coachContext.buildContext` async-aware refactor
- Engine read paths integration (`coachDirector.js`, `calibration.js`, `decisionCluster.js`)
- Wire `initAutoBackup()` în `src/main.js` app boot (CRITICAL pre-launch — altfel rotation NU rulează)

**ADR 020 §6 Open Items defaults aplicate:**
- Rotation threshold: size > 4MB OR age > 30d (configurabil prin constants)
- Storage Full UX alert: Sentry warn only (NU UI prompt încă) — Sprint 4.1 Daniel review wording
- Failure mode: 3-attempt exponential backoff [1s, 2s, 4s] + Sentry critical persistent fail
- Multi-tenant namespacing: `firebase.userPath` sanitized pre-Auth, `auth.uid` post-Auth (TODO)
- Periodic check: 1h (`ROTATION_CHECK_INTERVAL_MS = 3600000`)
- Profile typing v2 footprint: telemetry via `getStorageStats()` post-deploy

**Backup tag:** `pre-adr-020-impl` pushed origin (rollback safe).

**Cross-refs:** [[020-storage-tiering-strategy]] §Decision SSOT + §6 Open Items + ADR 011 §retention 90d + ADR 002 §Firebase REST.

---

## 17. GOVERNANCE HARDENING — §HANDOVER_PROTOCOL + §7 DIFF + §8 Destructive Ops

**Status:** Live 2026-04-30 evening v2. Mandatory pentru toate future CC runs.

**Anti-slip codificare post 30 apr incident:**

**SLIP #1 (handover halucinare):** chat strategic generator NU poate citi 700+ linii integral cu fidelitate când scrie paralel. Search per secțiune → sumarizare → pierde nuanțe (tabele, liste DO/DON'T). Salvat doar prin diff retroactiv 30 apr (LOSS-1 competition matrix 6×5 + LOSS-2 DO/DON'T list).

**Mitigation §7 DIFF Protocol (`PROMPT_CC_HYGIENE.md`):**
1. READ vechi integral (NU sumarizare)
2. READ nou integral
3. DIFF semantic section-by-section
4. FLAG missing în `📤_outbox/DIFF_FLAGS.md` (toate flag-urile, NU stop la primul)
5. STOP după diff complet — aștept Daniel decision per flag (A=preserve, B=drop, C=merge)
6. Apply decisions
7. THEN overwrite + archive vechi (NEVER delete)

**SLIP #2 (destructive ops fragile):** prompts CC obosit + Daniel obosit = ambii ratăm bug-uri. Force-push catastrofic, archive ÎNAINTE de diff, `git mv` silent fail Windows + emoji paths.

**Mitigation §8 Destructive Ops Checklist:**
- Triggers: `git rm`, `git mv` cross-folder, force-push, `rm -rf`, SSOT overwrite, schema migrations, mass replace >5 files
- Backup tag obligatoriu pre-op
- Force-push INTERZIS fără explicit Daniel approval ("force-push autorizat: YES" în prompt)
- `git mv` cross-folder cu emoji paths → verify post-move cu `ls`
- Stop la prima eroare (rollback via backup tag)

**Cross-refs:** `PROMPT_CC_HYGIENE.md` §7 + §8 + `VAULT_RULES.md` §HANDOVER_PROTOCOL §5 Safety net.

---

## 18. INBOX STRICT DANIEL — Bug Fix evening v2

**Status:** Fixed 2026-04-30 evening v2. Inbox = ZERO CC writes, no exceptions.

**Bug original:** `VAULT_RULES.md` §HANDOVER_PROTOCOL step 9 + §Constraints absolute permitea CC să scrie `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` ca "excepție output post-ingest". Contradicție cu principiul "inbox = strict input Daniel".

**Fix aplicat:**
- `git mv 📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md → 📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` (top-level, NU în archive — file activ output)
- `VAULT_RULES.md` §HANDOVER_PROTOCOL step 9 path updated → `📤_outbox/`
- `VAULT_RULES.md` §Constraints absolute bullet 1: dropped "excepție", replaced cu "ZERO excepții. Toate output-urile CC merg în `📤_outbox/`"
- `PROMPT_CC_INGEST_HANDOVER.md` step 6 path updated → `📤_outbox/`

**Pattern future ingest:** alignment questions output = `📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` top-level. Daniel atașează manual în chat nou.

---

## 19. SPRINT 4 A+B IMPLEMENTATION NOTES

**Status:** LIVE 2026-05-01 morning.

### TASK A — Boot wire

- `src/bootstrap.js` (62 LOC NEW): wrappers testable `runBootMigrations`, `startTierRotation`, `exposeForceRotationHelper`. Graceful degradation per ADR 018 §4 — never throws.
- `src/main.js` `init()` ordering updated: migrations BEFORE Firebase sync, rotation AFTER (per spec). `window.__forceRotation` dev helper exposed pentru post-deploy smoke test.
- `src/engine/__tests__/adherence.test.js` D6 fix permanent (UTC → local date `toLocaleDateString('sv')`).
- 13 tests new (`src/__tests__/bootstrap.test.js`).

### TASK B — ADR 021 Faza 1

- `src/engine/calibrationReconciliation.js` (~280 LOC NEW): pure algorithm — Schema constants (`CONFIDENCE_ORDER` 6 nivele post D1 + `ENGINE_TIER_ORDER` T0/T1/T2 + thresholds), `createInitialCalibrationState`, `computeEngineTier` (Max Wins Monotonic), `maxConfidence` (Monotonic Clock), `mergeVersionVector` (element-wise MAX), `mergeObservations` (union, monotonic — yo_yo OR, AA dedupe, counters MAX), `reconcile(branchA, branchB, opts)`, `bumpVersion`.
- 37 tests EC-1..EC-6 mandatory + Schema validation + helpers + reconcile happy path + idempotency.
- ADR 021 §Pre-Faza-2 marked **✅ LIVE 2026-05-01**. Faza 2 persistence + integration deferred.

### Faza 1 vs Faza 2 boundary clarification

Algorithm pure + tests în Faza 1. NU integrate VV tracking în `calibration.js` activ — premature pre-D1 DEVELOPING refactor (5→6 tier mapping incomplete). Documentation inline JSDoc + ADR 021 §Implementation phasing updated.

### Smoke test prod ADR 020 Phase 1 (2026-05-01 morning)

- ✅ `window.__forceRotation()` works, `{rotated: 0, perKey: [3 stores], errors: []}`
- ✅ IndexedDB lazy-create OK, persistence OK, init logs ordered
- ❌ `alert()` browser native cu rationale codes raw descoperit la "❓ De ce?" — i18n audit + whyEngine rewrite priority (✅ FIXED post audit run, vezi §20-21)
- ❌ Plan ajustat banner percentage leak — F-NEW-4 flagged separate (vezi §22)
- ❌ Hyperreactive coach observat — F-NEW-3 flagged separate (vezi §22)

**Cross-refs:** [[021-calibration-drift-reconciliation]] §Pre-Faza-2 LIVE marker + ADR 020 §Wire integration + §15 Tests state.

---

## 20. I18N DECISION B LOCKED + AUDIT COMPLETED

**Status:** Decision locked + audit COMPLETED 2026-05-01 morning. Infrastructure LIVE + critical anti-RE fix LIVE. Phase 5 bulk replace DEFERRED pentru Daniel chat strategic wording rewrite session.

### Decizie arhitecturală

ÎNAINTE wording rewrite, extract TOATE user-facing strings în i18n bundle JSON decoupled. Spec lock-uit ([[PRODUCT_STRATEGY_SPEC_v1]] §i18n + [[COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q5: "Hardcoded enums în Arbitrator + JSON i18n bundle în Frontend") finally honored la nivel implementation.

### Implementation LIVE (Phase 1-4)

- **`src/i18n/index.js`** (135 LOC): `t(key, vars?)` helper + `getCurrentLocale()` + `setLocale()` + lazy JSON imports + var interpolation `{name}` + fallback chain (locale → EN → key)
- **`src/i18n/ro.json`**: bundles initial cu `why.categorical.*` (4 wording-uri lock-uite) + `modals.*` + `common.*`
- **`src/i18n/en.json`**: identical structure cu `TODO_EN: <RO content>` markers (Daniel completează manual)
- **`src/i18n/__tests__/i18n.test.js`** (23 tests): t() + locale + bundle integrity (RO/EN identical keys verified)
- **`src/engine/whyEngine.js`** rewritten: `selectVerdict(rec, ctx)` priority ladder + `t('why.categorical.<verdict>')`. Legacy `[category]` raw codes ELIMINATED, numeric leaks ELIMINATED.
- **`src/pages/coach/modals.js`** `showWhyForExercise`: `alert()` browser native → `_renderWhyModal()` in-app DOM modal cu i18n title + dismiss + summary single string + XSS-safe HTML escape.
- **22 whyEngine tests** rewritten covering verdict logic + zero leak verification.

### Audit findings statistics

- **251 user-facing string candidates** detected (Romanian chars în quotes, excl comments)
- **Post-Phase-1-4 remaining:** 238 strings across ~25 files
- **Threshold STOP @ 300:** ✅ NU triggered
- **Top files:** dashboard.js (45), weight.js (23), dp.js (13), modals.js (12 remaining), sys.js (12), readiness.js (11), plan.js (10), onboarding.js (9), proactiveEngine.js (9), renderIdle.js (8), plateauInterventions.js (8), fatigue.js (8), reality.js (7), calibration.js (7)
- **Categories:** ~25 toasts + 8 confirms + 3 alerts + ~30 modal titles + ~20 banners + ~80 page labels + ~70 engine messaging + 9 onboarding + 6 verdicts + 4 skip reasons + 7 day names + 12 exercise alternatives reasons

### Phase 5 bulk replace — DEFERRED pentru wording rewrite session

Strategic decision: 238 strings = high replacement effort cu mixed wording quality + risk în 25 fragile UI files. Documented full inventory în raport audit pentru Daniel chat strategic decision (Phase A toasts/confirms ~36 quick wins, Phase B engine messaging ~70 cu domain expertise, Phase C page labels ~80 bulk batch).

**Cross-refs:** [[PRODUCT_STRATEGY_SPEC_v1]] §i18n + [[COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q5 + raport audit `📤_outbox/_archive/2026-04/<NN>_*_RAPORT.md` (post-rotation NN).

---

## 21. WORDING CATEGORICAL "DE CE?" LOCKED + ANTI-RE ABSOLUTE REAFFIRMED

**Status:** Wording 4 categorii LOCKED 2026-05-01 morning + LIVE în `ro.json` (i18n audit run completat).

### Context

Smoke test prod a expus `alert()` browser native cu format `[phase] Ești în faza CUT...`, `[readiness] Readiness scăzut (3)...`, `[pattern] Pattern detectat: STAGNATION` — catastrofic UX + anti-RE breach. `whyEngine.js` rewrite priority maxim **DONE** post-audit.

### 4 categorii verdict-based

| Verdict | Trigger logic | Wording lock |
|---------|---------------|--------------|
| Up | `rec.kg > lastWeight` | "Creștem greutatea la {exercise} pentru că ai progresat constant în ultimele săptămâni. Noua țintă e adaptată astfel încât să menținem ritmul, fără să sacrificăm forma." |
| Down | `rec.kg < lastWeight` | "Reducem puțin greutatea la {exercise} pentru a prioritiza tehnica. Uneori, un mic pas în spate e necesar pentru a debloca următorul salt în forță. Rămânem pe poziții!" |
| Hold | default fallback | "Păstrăm greutatea la {exercise} astăzi. Ești într-o zonă excelentă de consolidare, iar asta ne asigură că baza e solidă înainte de următoarea creștere." |
| Recovery | `ctx.readiness.score < READINESS_MED` (override toate celelalte) | "Reducem volumul la {exercise} pentru că semnele de oboseală sunt prezente. E mai inteligent să te refaci azi, ca să revii cu forțe proaspete la antrenamentul următor." |

### Constraints

- ZERO leak: niciun `[phase]/[readiness]/[pattern]/[category]`
- ZERO numerice: `score`, `kg`, `RPE`, percentages NU apar user-facing
- Single message per verdict (NU array de reasons cu categorii multiple)
- Reframing pozitiv (NU "nu ai progresat" — "deblocare" + "consolidare" + "antrenamentul următor")
- Variație finală (anti-repetiție wallpaper)
- Exercise name interpolation prin `{exercise}` placeholder (i18n vars)

### Anti-RE strategy reaffirmed ABSOLUTE

Categorical verdict only user-facing. Engine internals (signal codes, phase enum, readiness numerical, pattern types) ASCUNSE indiferent de tier. Cross-tier consistency = single source of truth: `ro.json` `why.categorical.*` lock-uit.

**Cross-refs:** ADR 013 §Anti-RE strategy + [[PRODUCT_STRATEGY_SPEC_v1]] §wording + §6 Open Items D2-D5 Sprint 1.5 wording rewrite (categorical only) + i18n audit raport.

---

## 22. FINDINGS NOI 2026-05-01 (F-NEW-1 până la F-NEW-4)

**Status:** Flag-uite 2026-05-01 morning, NU fix imediat (separate priorities post i18n audit). Daniel review post-handover pentru sequencing.

### F-NEW-1 — i18n exerciții RO

- **Issue:** exercise names hardcoded EN (Lateral Raises, Lat Pulldown, etc.). Gigel non-tech RO nu citește engleza.
- **Fix:** mapping EN→RO în `src/i18n/ro.json` `exercises.*` namespace + `t('exercises.<id>')` în UI display layer.
- **Owner:** chat strategic wording rewrite session post-audit.
- **Priority:** HIGH (user-facing, RO target market). Acceptable EN technical names în industry-standard cazuri (Lat Pulldown, Cable Row, Romanian Deadlift) — Daniel decide caz-by-caz.

### F-NEW-2 — Progression scaling pe `experience_tier`

- **Issue:** incremente weight uniform în `progressionEngine` (suspected). Advanced 30 ani sală ≠ +2.5kg pe izolări vs Beginner. ADR 009 calibration tiers spec deja PERSONALIZED/OPTIMIZED scaling, DAR implementation posibil hardcoded uniform.
- **Fix:** verify `progressionEngine.js` (sau echivalent) respectă `ctx.engine_tier` / `ctx.calibration_confidence` pentru increment scaling. Audit + tests pentru tier-aware scaling.
- **Owner:** Sprint 4.x backlog post i18n.
- **Priority:** HIGH (advanced users core MOAT — Bugatti-grade progression accuracy).

### F-NEW-3 — Hyperreactive coach (zero cooldown)

- **Issue:** schimbare phase auto→cut + lipsă aparat = "plan ajustat" la fiecare modificare. User normal modifică plan rutinier → primește alarme la fiecare click → trust erosion + alarm fatigue în 3 secunde.
- **Fix:** cooldown trigger logic configurable. Acceptable threshold TBD Daniel decision:
  - **Option A:** 1 modificare în 24h triggerează banner, 3+ silent (anti-spam)
  - **Option B:** cooldown pe trigger type (phase change OK once/24h, equipment unavailable rate-limited)
  - **Option C:** combined — global cap + per-trigger-type cap
- **Owner:** Sprint 4.x backlog post i18n + Daniel decision threshold.
- **Priority:** HIGH (Gigel test fail — trust erosion immediate).

### F-NEW-4 — Plan ajustat banner wording rewrite

- **Issue:** percentage leak ("Plan redus 30% astăzi pentru recovery") + paternalist override ("Override (înțeleg riscurile)") + numerice raw ("Adherence scăzută: 0%", "Deviation crescut: 100%").
- **Fix:** wording rewrite categorical, anti-paternalism wording (NU "înțeleg riscurile" force-typing), zero numerice user-facing.
- **Owner:** i18n audit Phase B + sesiune wording rewrite Daniel review.
- **Priority:** HIGH (visible în prod, anti-RE breach).
- **Cross-ref:** D2-D5 Sprint 1.5 backlog (deja flag-uit, acum confirm prod-visible).

**Cross-refs:** §6 Open Items + ADR 013 §Anti-RE + i18n audit raport `📤_outbox/_archive/2026-04/<NN>_*_RAPORT.md` + §20 i18n decision B locked.

---

## 23. ENGINE WORDING 12 VARIAȚII LOCKED + DECIZIA #6 RECOVERY SCORE (morning v2)

**Status:** LOCKED 2026-05-01 morning v2 (chat strategic wording session). Implementation = i18n bundle update + `whyEngine.js` variant selector cu hash deterministic = pending Sprint 4.x.

### 12 variații complete (4 verdicte × 3 variants)

**🟢 UP (Progresie):**

```
V1: "Te-ai adaptat excelent. Azi creștem greutatea la {exercise}, fără să sacrificăm tehnica."
V2: "Progresul tău e vizibil. Urcăm greutatea la {exercise} pentru a continua evoluția, cu aceeași execuție curată."
V3: "Ești gata pentru următorul nivel la {exercise}. Ridicăm sarcina astăzi, păstrând forma perfectă."
```

**🔴 DOWN (Reglaj tehnic):**

```
V1: "Prioritizăm tehnica azi la {exercise}. Un pas în spate e scurtătura către progresul viitor."
V2: "Refinăm execuția la {exercise}. Un reglaj fin acum deblochează următorul nivel de forță."
V3: "Facem un reglaj tehnic la {exercise}. Ajustăm greutatea pentru a consolida execuția și a reporni creșterea."
```

**🟡 HOLD (Consolidare):**

```
V1: "Păstrăm greutatea la {exercise} astăzi. Ești într-o zonă excelentă de consolidare, iar asta ne asigură că baza e solidă."
V2: "Consolidăm progresul la {exercise}. Încă o sesiune-două la acest nivel și suntem gata să urcăm."
V3: "Rămânem pe poziții la {exercise}. Stăpânește total acest prag înainte de a adăuga rezistență suplimentară."
```

**🔵 RECOVERY (Refacere) — REFACTOR arhitectural (banner global + per-exercise):**

```
GLOBAL BANNER (top of page): "Zi de refacere: Programul de azi e mai blând pentru a permite corpului să se reconstruiască."

V1 (per-exercise): "Reducem ritmul la {exercise} azi. Recuperarea acum înseamnă forță proaspătă la antrenamentul următor."
V2 (per-exercise): "Ajustăm volumul la {exercise} azi. Corpul are nevoie de refacere ca să revii puternic în sesiune."
V3 (per-exercise): "Prioritizăm refacerea la {exercise}. O sesiune mai ușoară acum pregătește terenul pentru un vârf de formă la următorul antrenament."
```

**Rationale Recovery refactor:** anterior un singur mesaj per-exercise = repetiție logică detectabilă pe 5 exerciții/sesiune Recovery. Now factored corect (banner global = context Recovery o singură dată; per-exercise = variation Bugatti).

### Decizia #6 Recovery score numeric exposure — RESOLVED

| Status | Wording locked |
|---|---|
| High | "Recuperat" |
| Medium | "În refacere" |
| Low | "Epuizat" |

**Decizie:** ELIMINĂ numărul complet pentru toate categoriile de useri. Antrenor olimpic NU spune "ești recuperat 72%" — dă verdict clar. Anti score-chasing + anti overthinking. **Pro tier NU primește expunere numerică** (decizie globală, NU tier-gated).

### Implementation pattern locked (variant selector hash deterministic)

```javascript
// Pattern hash deterministic — anti-flicker + zero Math.random
const todayStr = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD' local stable
const variantIndex = hash(todayStr + exercise_id) % 3;
return variants[variantIndex];
```

**Garanție:** user vede același mesaj pe tot parcursul zilei pentru același exercițiu (refresh / re-deschidere app = consistent). Pe 5 exerciții într-o zi → probabil vede toate 3 variații = app pare că "scrie" în timp real, NU câmp dintr-un tabel. Same pattern ca D6 fix `adherence.test.js` (anti-midnight-flicker prin local date stable).

### Filter Bugatti aplicat strict (6 runde pushback iterative)

Eliminat în chat strategic morning v2:
- "ridicăm miza" (jargon poker)
- "resetăm calitatea mișcării" (jargon mecanic)
- "calitatea mișcării" abstract
- "sistem suprasolicitat" (jargon server alert)
- "vârf de formă mâine" (promise temporal nesigur)
- "coach-ul observă" (voice inconsistent persoana 3 vs plural inclusiv)

### Relație cu §21 (4 categorii baseline pre-variations)

§21 = wording 4 categorii baseline LIVE post i18n audit (whyEngine rewrite ELIMINATED `[category]` raw codes). §23 = extension morning v2 cu 12 variations + Recovery refactor + Decizia #6. Implementation Sprint 4.x va înlocui 4 baseline cu 12 variations + variant selector. Anti-RE absolute preserved (zero leak, zero numerice, zero category exposure indiferent tier).

**Cross-refs:** `src/engine/whyEngine.js` `selectVerdict()` priority ladder + `src/i18n/ro.json` `why.categorical.*` namespace (post-Sprint-4.x va include 12 variations + recovery banner) + ADR 013 §Anti-RE absolute + §21 4 verdict-based wording baseline.

---

## 24. PHASE A TOASTS/CONFIRMS — APROBATE TACIT (~36 strings, morning v2)

**Status:** Aprobate tacit prin progres iterativ wording session morning v2 (Daniel a confirmat batch progresând la engine logic). Implementation = bulk batch CC Sonnet în `ro.json`.

### Toasts (~25)

| Curent | Locked |
|---|---|
| "✓ Notificări active" | "Notificări activate." |
| "❌ Antrenament anulat" | "Antrenament încheiat." |
| "⚠ Selectează exercițiu" | "Alege un exercițiu." |
| "Set salvat" | "Set înregistrat." |
| "Greutate actualizată" | "Greutate înregistrată." |
| "Antrenament finalizat" | "Antrenament încheiat. Bună treabă!" |
| "Eroare la salvare" | "N-am putut salva. Mai încercăm o dată?" |
| "Conexiune pierdută" | "Lucrăm offline acum." |

**Restul ~17 toasts (modificare aplicată, date sincronizate, conexiune restabilită, plus 14 alte):** REMAINING next sesiune review individual cu context (vezi §25).

### Confirm dialogs (~5 din 8)

| Curent | Locked |
|---|---|
| "Anulezi antrenamentul? Nicio dată nu va fi salvată." | "Închizi sesiunea? Datele de azi se pierd." |
| "Ești sigur?" generic | EVITĂ — fă specific contextului fiecare caz |
| Full reset confirm | "Resetare completă: ștergem tot permanent. Continui?" |

**Restul ~3 confirms (Ai N seturi nefinalizate, Ștergi acest antrenament, +1):** REMAINING next sesiune review individual.

### Alert dialogs `dataCleanup.js` (3 strings)

REMAINING — review next sesiune. Recomandare convertire la in-app modal/toast (anti-`alert()` browser native = parte din anti-Bugatti UX cleanup global, same pattern ca §20 audit `alert()`→modal whyEngine fix).

**Cross-refs:** §20 i18n audit Phase 1-4 LIVE + §25 wording REMAINING priority list.

---

## 25. WORDING REMAINING NEXT SESIUNE (~103 strings post-evening, updated)

**Status:** Updated 2026-05-01 evening — 53 strings finalizate Phase B partial (vezi §27 batch-uri 1-4). REMAINING reduced ~187 → **~103 strings**. Lista actualizată pentru next chat strategic wording session.

**FINALIZATE evening (53 strings):** readiness verdicte (6) + skip reasons (5) + F-NEW-4 plan banner (3) + calibration tier names (6) + sys.js phase logic + BMI/BF (6) + proactiveEngine.js complet (12) + plateauInterventions.js two-layer (6 × 2 layers = 12 wordings) + 3 amendamente backlog wording. Vezi §27 detail batch-uri.

**REMAINING ~103 strings post-evening (updated structure):**

### Phase B engine messaging — REMAINING (~37 strings post-evening)

**FINALIZATE evening Phase B (vezi §27):** readiness verdicte (6) ✅, calibration tier names (6) ✅, sys.js phase logic + BMI/BF (6) ✅, proactiveEngine.js (12) ✅, plateauInterventions.js (12 = 6 × 2 layers) ✅. **Total Phase B finalizate: 42 strings.**

**REMAINING Phase B (~37 strings):**

1. **`dp.js` — Rest day, taper, deload (13 strings):**
   - Pattern recomandat: rationale, NU command. User înțelege DE CE pauza/deload.
   - **NEEDS source code review** pentru extras strings exact.

2. **`sys.js` restul (~6 strings)** — phase transitions, override prompts, duration notifications. **NEEDS source code review.**

3. **`fatigue.js` (8 strings):** Anti-RE absolut. Zero numerice + zero category exposure. **NEEDS source code review.**

4. **`reality.js` (7 strings):** Reality Engine backend mostly. User-facing minimal — review next sesiune.

5. **`calibration.js` (3 strings)** — banner text restul (post tier names locked).

6. **F-NEW-4 plan banner restul:** finalizat cele 3 strings principale evening (vezi §27 Batch 1). Skip reasons split SKIP_PAIN_MILD vs SKIP_INJURY locked (vezi §27 Batch 1 + §28.1 mini-prompt secundar).

### Phase C page labels — REMAINING (~78 strings)

| File | Count | Status |
|---|---|---|
| `dashboard.js` | 45 | ⭐ MOST VISIBLE — review next sesiune (tabs, buttons, notifications, recovery widget) |
| `weight.js` | 23 | Empty states + modal labels + chart labels — review next sesiune |
| `plan.js` | 10 | Phase override (vezi `sys.js`) + counts — review next sesiune |

### Decisions evening updated

1. **Exercise alternatives strategy:** ✅ LOCKED hibrid (compound mari EN industry + izolări RO) — confirmat evening.
2. **Day names:** ✅ LOCKED Intl API (`Intl.DateTimeFormat('ro', { weekday: 'long' })`) — confirmat evening.
3. **EN translations strategy:** A manual / B Sonnet-assisted / **C Hybrid A+B** (brand-critical ~30 manual + restul ~210 Sonnet-assisted batch review). Recomandare Claude: Hybrid. Decizie pending Daniel.
4. **BMI/BF bands wording:** ✅ LOCKED — "Sub/În/Peste țintă pentru obiectivul tău" (vezi §27 Batch 2).
5. **Phase names CUT/BULK:** ✅ LOCKED — RO universal default ("Faza de definire / dezvoltare / menținere"), EN tech labels eliminate complet indiferent Pro tier (vezi §27 Batch 2).
6. **Recovery score numeric exposure:** ✅ LOCKED — eliminat complet, decizia #6 (vezi §23).
7. **Hash deterministic 12 variations Engine:** ✅ RECONFIRMED evening — `hash(today_sv + exercise_id) % 3` (vezi §23 implementation pattern).

### Pattern recomandat next sesiune

Daniel + Claude review per priority ordonat (#1-9 above), filter Bugatti aplicat, lock wording final → handover-uri batch după fiecare priority majoră (anti-saturation, anti-halucinație).

**Cross-refs:** `📤_outbox/_archive/2026-04/28_I18N_AUDIT_INFRASTRUCTURE_RAPORT.md` (full audit Opus, ~238 strings inventoried) + ADR 013 §Anti-RE + §23 Engine variations LOCKED + §24 Phase A aprobate tacit + §27 wording rewrite Phase B evening 53 strings + §28 amendamente backlog.

---

## 26. GOAL-CA-SETTING + 8 TEMPLATES PROGRAME V1 LOCKED (evening — major scope shift v1)

**Status:** LOCKED 2026-05-01 evening (chat strategic core voice + goal taxonomy). Cea mai mare decizie product strategic din vault — necesită ADR 022 nou + PARAMETRIC_PROGRAMS_DESIGN refactor + exercise library extension.

### 26.1 Context decizie + push-back iterativ

Sesiune morning v2 LOCKED 12 variații Engine wording (§23). Verificare ulterioară a expus gap critical: wording Engine presupune toți useri sunt **performance/strength-focused**:

- **Gigel 65 ani M MAINTAIN goal** (frică ramolire, longevity) — Engine UP "creștem greutatea, păstrând forma perfectă" = stres + risc injury. Wording trebuie reassurance + funcționalitate.
- **Gigica 35 ani F MAINTAIN goal** (frică estetică, glutes-focused) — Engine UP "următorul nivel de forță" = irelevant. Wording trebuie aesthetic outcome.

Ambii MAINTAIN identic în engine, motivație underlying complet diferită → wording diferit. Plus catalog programe insuficient: ambii primesc bench/squat/deadlift baseline indiferent goal.

**Diagnoza inițială Claude:** GOAL voice nou peer cu HISTORICAL/REALTIME/PROJECTION/ARBITRATOR/ACTION → 6 voices total.

**Push-back Daniel iterativ** prin întrebări simple ("dar dacă goal e setting, plus poate fi schimbat?") → Claude pivot major: **goal-ca-setting câștigă, NU voice nou**.

### 26.2 Decizie LOCKED: Goal = SETTING, NU voice nou

**Rationale:**
- 98% useri NU schimbă goal după onboarding (Daniel intuiție validată) → mismatch detection infrastructure overengineering pentru edge case rar.
- Problema reală e **catalog programe + exercise library**, NU interpretation pipeline.
- Voice nou = sparge math R8 (1/5 → 1/6 weights recalibrate) + observability complex pentru zero benefit real.
- Setting = mental model curat user, implementation simplă (2-3h vs 12-18h voice), debuggable.
- Wording per goal = ACTION layer parametric, NU voice arbitration.

**5 voices RĂMÂN neschimbate:** HISTORICAL + REALTIME + PROJECTION + ARBITRATOR + ACTION. Schema VoiceVerdict NU se modifică. R8 weights NU recalibrate.

### 26.3 Goal taxonomy v1: 8 templates programe

| Goal Primary (Q1) | Wording Card Onboarding (Persoana I) | Templates Backend | Cui se adresează |
|-------------------|--------------------------------------|-------------------|------------------|
| **Forță & Dezvoltare** | "Vreau să cresc în forță și masă musculară" | 1 Template | Performance pure, PR-uri, hipertrofie agresivă |
| **Tonifiere & Definire** | "Vreau corpul mai tonifiat și definit" | 3 Templates: Focus picioare & fesieri (Gigica) / Focus partea superioară (Marius) / Echilibrat | Segmentul aesthetic major |
| **Slăbire** | "Vreau să slăbesc" | 2 Templates: Slăbire moderată (<15kg) / Slăbire majoră (>15kg) | Moderată: core-strength + cardio normal. Majoră: low-impact + bodyweight + progresie lentă |
| **Longevitate** | "Vreau să-mi mențin sănătatea și mobilitatea" | 1 Template | Segmentul 50+, focus protecția articulațiilor + independență motrică |
| **Sănătate Generală** | "Vreau să fiu activ și în formă" | 1 Template | Segmentul 18-49 fără focus aesthetic sau performance specific |

**Total scope V1: 8 templates programe.**

**Decizii sub-routing internal (NU expuse user):**
- Slăbire <15kg vs >15kg = routing intern via Q1.5 question "Cât îți propui să slăbești?" + 2 cards (Sub 15kg / Peste 15kg). Fără etichete medicale stigmatizante user-facing.
- Tonifiere focus = Q1.5 question "Pe ce zonă vrei să punem accentul?" + 3 cards (Picioare/Fesieri / Partea superioară / Echilibrat).

**Drop din v1 (vs propunere inițială 6 primary):**
- **Rehab eliminat** — necesită fizioterapeut, NU algoritm. Risc liability + trust hit fatal dacă engine recomandă greșit. v2+ candidate.
- **General Health + Longevity NU comasate** — diferențe biologice fundamental între 28 ani și 65 ani (testosteron, recovery, bone density). Same template = nimeni servit.

### 26.4 Onboarding flow concrete

```
Q1: Care e obiectivul tău principal? [5 cards visual: Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală]
   ↓
Q1.5 (conditional, doar Tonifiere): Pe ce zonă vrei să punem accentul? [3 cards: Picioare/Fesieri / Partea superioară / Echilibrat]
Q1.5 (conditional, doar Slăbire): Cât îți propui să slăbești? [2 cards: Sub 15kg / Peste 15kg]
   ↓
Q2-4: Parametri fizici (vârstă, sex, kg, height) + logistică (echipament + frecvență)
```

**Target onboarding sub 90s** (vs Q-0586 baseline 120s) — flow visual cu cards, zero text inutil.

### 26.5 Re-prompt periodic goal review

**Trigger:** la 4-6 săpt sau phase change automated → modal in-app:
> "Obiectivul tău e încă [X]? Confirmă sau schimbă."

**Implementation:** timer + modal (2-3h Sprint 4.x), anti-rigid + anti-spam (cooldown 21 zile post-confirm).

**Justification:** elimină rigiditate "setting once forever" + previne friction "must change manually deeply în settings". User simte că app îl ține pe track + dă agency.

### 26.6 Wording per goal (ACTION layer parametric, NU voice nou)

ACTION engine wording trees primesc goal ca parametru. Conditional în ACTION layer:
- **Gigel longevity →** wording reassurance (Engine UP "Te-ai adaptat excelent. Azi consolidăm la {exercise}, fără să sacrificăm tehnica.").
- **Gigica aesthetic-glutes →** wording aesthetic outcome (Engine UP "Progresul e vizibil. Urcăm greutatea la {exercise} pentru tonus susținut.").
- **Performance →** wording locked existent (12 variations §23 morning v2 LOCKED).

**Implementation:** i18n bundle extension cu goal-aware templates, pattern `t('engine.up.<goal>.<variant>')`. Sprint 4.x scope post-locks complete.

### 26.7 Risk principal locked accepted

**Gigica aesthetic-glutes specific** primește template "Tonifiere & Definire — Focus picioare & fesieri" baseline. Posibil 30% Gigica market churn dacă template insuficient specializat (e.g., user vrea hip thrust 3x/săpt + glute kickback heavy, primește mix). Mitigation v1.5+: feedback userilor reali → modifier system (anti-celulită cardio LISS, glute hypertrophy specific, etc.).

**Liability concern subtle Slăbire majoră (>15kg):** user BMI 36+ recovery realități fundamental diferite. Template low-impact cardio + bodyweight + progresie lentă = corect tactic, dar require atent QA + onboarding wording care NU expune medical labels.

### 26.8 Timeline impact + scope V1

**Timeline v1 ajustat: 8-10 luni** (vs 2-4 luni post-velocity inițial). Trade-off acceptat pentru product care servește 90%+ market.

**Scope V1 adăugat:**
- 8 templates programe v1 design (Daniel + Claude review, 2-4 sesiuni dedicate).
- Exercise library extension ~50-100 exerciții (mobility + cardio low-impact pentru Longevitate + Slăbire majoră).
- ACTION layer wording per goal parametric (i18n bundle extension).
- PARAMETRIC_PROGRAMS_DESIGN refactor (focusModifier → goal field nou).
- Re-prompt periodic goal modal.

**Cross-refs:** ADR 022 propus standalone "Goal-Driven Program Templates" (cross-refs PARAMETRIC_PROGRAMS_DESIGN + PRODUCT_STRATEGY_SPEC_v1) + COG-ARCH §R8 (5 voices weights NU recalibrate) + §1.2 Distribution amendment timeline.

---

## 27. WORDING REWRITE PHASE B EVENING — 4 BATCH-URI 53 STRINGS FINALIZATE

**Status:** Finalizate 2026-05-01 evening prin chat strategic wording session. Implementation = bulk batch CC Sonnet în `ro.json` + amendamente backlog Sprint 4.x.

### 27.1 Batch 1: Readiness + Skip Reasons + F-NEW-4 (17 strings)

**Readiness verdicte (6 strings, header coach vizibil constant):**

| ID Intern | LOCKED |
|-----------|--------|
| READINESS_HIGH | "Ești pe val azi" |
| READINESS_GOOD | "Sesiune solidă" (PĂSTRAT — cross-goal) |
| READINESS_NORMAL | "Zi obișnuită" |
| READINESS_MODERATE | "Mergi mai blând azi" |
| READINESS_LOW | "Zi de recuperare" |
| READINESS_VERY_LOW | "Corpul cere pauză azi" |

**Filozofie:** descriptive, nu predictive. "PR" jargon eliminat. Anti-paternalism — observații fiziologice, NU directive.

**Skip Reasons (5 strings, voce user persoana I):**

| ID Intern | Wording | Backend Signal |
|-----------|---------|-----------------|
| SKIP_FATIGUE | "Sunt prea obosit azi" | Oboseală generală (volum ajustat tura următoare) |
| SKIP_TIME | "N-am timp astăzi" | Problemă program (sesiune amânată) |
| SKIP_PAIN_MILD | "Mă doare ceva azi" | DOMS / disconfort minor (scade intensitatea local) |
| SKIP_INJURY | "Sunt accidentat" | Signal critic safety (deload/recovery forțat) |
| SKIP_OTHER | "Alt motiv" | Fallback neutru |

**Note:** Split SKIP_PAIN_MILD vs SKIP_INJURY = engine signal diferit critical pentru routing safety override (vezi §28.1 mini-prompt secundar nouă/recurentă).

**F-NEW-4 Plan Adjusted Banner (3 strings):**

| Curent (catastrofic) | LOCKED |
|----------------------|--------|
| "Plan redus 30% astăzi pentru recovery" | "Plan ajustat azi pentru recuperare. Volumul e mai blând." |
| "Override (înțeleg riscurile)" | "Vreau planul inițial" |
| "Adherence: 0% / Deviation: 100%" | "Câteva sesiuni sărite recent. Programul de azi e mai blând, te susținem să revii treptat." |

### 27.2 Batch 2: Calibration tier names + sys.js (12 strings)

**Calibration tier names (6 strings, banner header coach):**

| Tier ID | LOCKED |
|---------|--------|
| COLD_START | "Învăț cum lucrezi." |
| INITIAL | "Îți învăț ritmul." |
| DEVELOPING | "Te înțeleg din ce în ce mai bine." |
| PERSONALIZING | "Adaptez programul la tine." |
| PERSONALIZED | "Programul e calibrat pe tine." |
| OPTIMIZED | "Programul tău e optimizat." |

**Filozofie:** descriptive/action-oriented, ZERO relational claims. Anti trust-hit — engine greșește, user blamează setările/calibrarea, NU promisiunea AI. Rezolvă PUSHBACK Claude pending morning v2 (Tier 4/5 trust hit dublu).

**sys.js phase logic + BMI/BF (6 strings):**

| ID Intern | LOCKED |
|-----------|--------|
| PHASE_CUT | "Faza de definire" |
| PHASE_BULK | "Faza de dezvoltare" |
| PHASE_MAINTAIN | "Faza de menținere" |
| BMI_BAND_LOW | "Sub țintă pentru obiectivul tău" |
| BMI_BAND_NORMAL | "În țintă pentru obiectivul tău" |
| BMI_BAND_HIGH | "Peste țintă pentru obiectivul tău" |

**Decizii LOCKED:**
- Tier policy: **RO universal default**, EN tech labels (CUT/BULK) eliminate complet indiferent Pro tier (anti-jargon Bugatti voice unitar).
- BMI etichete medicale stigmatizante ("Obez", "Supraponderal") eliminate complet.
- "Faza de dezvoltare" preferred peste "Faza de creștere" sau "Faza de construcție" (mai polivalent: Gigel longevity / Gigica tonus / Performance forță).

### 27.3 Batch 3: proactiveEngine.js complet (12 strings)

| Context | LOCKED |
|---------|--------|
| Readiness / Record | "Ești pe val azi. Au trecut două săptămâni de la ultima ridicare maximă — poate fi ziua cea mai bună." |
| Undertrained Groups | "Nu am lucrat de peste 5 zile pentru {groups}. Le integrăm în următoarea sesiune." |
| Streak | "{streak} zile de antrenament la rând. Ritmul e excelent." |
| Inactivity | "{daysSinceLast} zile fără antrenament. Reluăm treptat cu o sesiune ușoară." |
| Hydration | "Nivelul de hidratare de azi e sub țintă. Un pahar de apă înainte de antrenament ajută." |
| Sleep Debt | "Refacerea din timpul somnului a fost mai mică recent. Sesiunea de azi merită cu un strop mai multă atenție pe execuție." |
| Kcal Deficit | "Energia din alimentație e sub nivelul obișnuit. Avem grijă la intensitatea de azi." |
| Protein Deficit | "Aportul proteic a fost mai mic în ultimele zile. E un detaliu esențial pentru refacerea musculară." |
| Peak Hours | "Observăm că ai cel mai bun randament în alt interval orar. Dacă programul îți permite, testează acea fereastră." |
| Weight Trend (Target) | "Evoluția greutății urmează ritmul stabilit. Continuăm consecvent." |
| Weight Trend (Slow) | "Evoluția greutății e mai lentă decât ritmul stabilit. Ajustăm planul în următoarele zile." |
| Weight Trend (Fast) | "Evoluția greutății e mai rapidă decât țintit. Verificăm împreună intensitatea și aportul caloric." |

**Decizii arhitecturale LOCKED:**
- **Numerics policy:** factual user-confirmable păstrate (`{streak}`, `{daysSinceLast}`, `{groups}`). Algorithmic diagnostics ELIMINATE (readiness score, ml apă raw, kcal diff exact, percentages).
- **Weight Trend split:** 3 alerts distinct direction-aware (on-target / off-target slow / off-target fast) NU 1 single message. Engine raportează factual indiferent direcție, anti-cheerleader bias. Vezi §28.5 engine refactor.
- **Sleep Debt wording observative pur** (NU promite intervenție automată) — "merită cu strop mai multă atenție pe execuție" (sugestie user) NU "punem accentul pe tehnică" (promise engine action care NU e implementat).

### 27.4 Batch 4: plateauInterventions.js two-layer (12 wordings = 6 interventions × 2 layers)

| Internal Engine Tag | Badge Card Exercițiu (Scurt UI) | Mesaj Proactive Coach (Context complet Modal) |
|---------------------|--------------------------------|-----------------------------------------------|
| "Drop Set" | "Serie extinsă" | "Stagnăm la {exercise}. Aplicăm o serie extinsă (Drop Set) ca să deblocăm progresul." |
| "Rest-Pause" | "Pauză scurtă" | "Consolidăm forța la {exercise}. Folosim micro-pauze în interiorul seriei pentru a depăși pragul actual." |
| "Reps Parțiale" | "Repetări parțiale" | "Extindem efortul la {exercise}. Adăugăm repetări parțiale la finalul seriei când execuția completă devine grea — stimulul rămâne maxim până la limită." |
| "Tempo 3-1-3" | "Tempo controlat" | "Reglăm viteza de execuție la {exercise}. Coborâm greutatea în 3 secunde și o ridicăm la fel de lent." |
| "+10% Volum" | "Volum crescut" | "Creștem volumul de lucru la {exercise} astăzi. Mai multe seturi sau repetări pentru a stimula adaptarea." |
| "Intensitate +2.5kg" | "Sarcină crescută" | "Urcăm ușor greutatea la {exercise} azi. Un stimul mai mare de rezistență ne va ajuta să continuăm progresul." |

**Decizii arhitecturale LOCKED:**
- **Two-layer messaging:** badge scurt UI (card exercițiu, NU aglomerează) + mesaj complet doar în Proactive Modal (sesiune introduction). Pattern reusable F-NEW-3 banner cooldown + future interventions.
- **Anti-RE strict:** internal engine tags ("+10% Volum", "Intensitate +2.5kg") rămân EXCLUSIV în logica matematică engine. NU ajung niciodată în i18n bundle sau user-facing.
- **Backend → UI mapping:** backend trimite tag tehnic, UI apelează `t('interventions.<tag>')` pentru afișare curată.
- **Voice consistent:** sigură, directă, precisă, fără promisiuni false sau exprimări exagerate ("forță maximă" eliminat → "Sarcină crescută" descriptive).

**Cross-refs:** ADR 013 §Anti-RE absolute + §23 Engine 12 variations LOCKED + §25 wording REMAINING updated + `📤_outbox/_archive/2026-04/28_I18N_AUDIT_INFRASTRUCTURE_RAPORT.md`.

---

## 28. AMENDAMENTE BACKLOG SPRINT 4.x (evening — 5 amendments)

**Status:** Locked 2026-05-01 evening pentru implementation Sprint 4.x post wording rewrite session complete.

### 28.1 Edge Case: Durere Cronică vs Accidentare Acută (split SKIP_PAIN_MILD vs SKIP_INJURY)

**Problemă:** User cu accidentare cronică (genunchi vechi) bifează SKIP_INJURY → engine activează deload forțat permanent. Sau invers, marchează SKIP_PAIN_MILD → engine subestimează durere recurentă.

**Soluție implementare:**
- Selectare SKIP_INJURY → mini-prompt secundar: **"Este o problemă nouă sau una veche, recurentă?"**
- **Nouă** → Deload acut + recovery forțat 7-14 zile.
- **Recurentă** → Ajustare cronică exerciții (înlocuire automată mișcări care stresează zona afectată).

**Owner:** Sprint 4.x backlog F-NEW-3 cooldown logic + safety routing.

### 28.2 Threshold Trigger Logic F-NEW-3 + F-NEW-4 (Plan Banner)

**Trigger principal:** 3 sesiuni planificate (scheduled) ratate în ultimele 14 zile.
- Tratament corect cross-frequency: user 4×/săpt rateaza 3 = trigger; user 3×/săpt life chaos rateaza 3 pe 2 săpt = trigger.
- Eliminat ambiguitatea "consecutive".

**Aderență tier-aware (per ADR 009):** Calculul aderenței <50% raportat la planul săptămânal individual user, NU baseline universal. Plan 2×/săpt cu ambele sesiuni făcute = 100% aderență, banner NU se declanșează.

**Cooldown:** 21 zile cooldown post-banner. Excepție: trigger separat "User Pierdut" la <25% aderență = banner reactivat cu wording diferit re-engagement.

**Wording User Pierdut LOCKED:**
> "N-ai mai trecut de ceva timp pe aici. Nu-ți face griji pentru pauză: programul de azi e configurat să te repună în mișcare fără grabă."

### 28.3 Edge Case: Revenire după pauză lungă (Inactivitate ≥14 zile)

**Trigger:** Prima deschidere app după interval inactivitate ≥14 zile.

**Wording Banner Re-engagement LOCKED:**
> "Bun venit înapoi! Reluăm treptat ca să-i dăm corpului timp să se readapteze."

**Acțiune engine:** volumul ajustat automat în jos pentru prima săptămână (re-onboarding fizic).

**Diferența vs F-NEW-4 normal banner:** distinct trigger + wording, NU "missed sessions" warning surveillance log.

### 28.4 F-NEW-3 Hyperreactive Coach Cooldown — Re-locked Option C

**Decizie LOCKED post chat strategic morning v2 → re-confirmed evening:** Combined global + per-trigger-type cap (Option C original).
- Global cap: max 1 banner ajustare/săpt user.
- Per-trigger-type: phase change OK once/24h, equipment unavailable rate-limited 3+/săpt silent.
- Cooldown 21 zile post-banner standard (vezi 28.2).

**Owner:** Sprint 4.x implementation + Daniel review threshold reali.

### 28.5 Weight Trend Engine Refactor (Split direction-aware)

**Refactor needed:** Engine actual produce single message Weight Trend. Refactor → 3 alert types:
- `weight_trend_on_target` (deviation < 10%)
- `weight_trend_slow` (deviation pozitivă > 10% — slăbește mai încet decât plan SAU câștigă mai încet decât plan)
- `weight_trend_fast` (deviation negativă > 10% — slăbește mai rapid decât plan SAU câștigă mai rapid decât plan)

**Threshold deviation 10%** = INITIAL_V1_GUESSWORK, recalibrate post 50+ users.

**Owner:** Sprint 4.x — engine refactor `proactiveEngine.js checkWeightTrend()` + 3 message types în i18n bundle (vezi §27 Batch 3 wording-uri locked).

**Cross-refs:** §22 F-NEW-3 + F-NEW-4 + ADR 009 §calibration_confidence aderență tier-aware + ADR 013 §Anti-RE intervention model + §27 Batch 3 proactiveEngine wording.

### 28.6 Secondary Check >25% deficit maintenance (2026-05-02)

**Problema:** floor static 1200F/1500M ignoră variabilitate masivă greutate/BMR. Femeie 95kg BMR ~1700, maintenance 2000, floor 1200 = deficit 40% periculos. Femeie 50kg BMR ~1300, floor 1200 = deficit 8% suboptim dar safe.

**Soluție:** engine flag suplimentar când deficit setat >25% maintenance, chiar dacă valoarea peste floor static. Soft warning diferit, mai blând.

**Owner:** Sprint 4.x post v1 launch + data reală analytics.

### 28.7 Seated Core Override Slăbire majoră (2026-05-02)

**Problema:** user BMI 36+ — așezare/ridicare pe saltea (Bird-Dog quadrupedie, Modified Plank prone) extrem laborioasă, obositoare, descurajantă.

**Soluție V2:** păstrăm exercițiile sol în V1 (biomecanic excelente). Dacă feedback final-sesiune bifează "tranziții dificile" → engine override automat:
- Bird-Dog → Seated Knee Raises (ridicări genunchi din șezut)
- Modified Plank → Seated Cable Wood Chops (tăieri lemne cablu din șezut)

User pe bancă/picioare, eliminăm coborâre saltea.

**Owner:** Sprint 4.x backlog feedback-driven personalization.

### 28.8 LISS Ramp-down Slăbire majoră (2026-05-02)

**Problema:** 15min recumbent bike din total 45min = 33% timp cardio joasă intensitate. Util săpt 1-2 ca buffer refacere. Săpt 3+ ineficient.

**Soluție V2:**
- Săpt 1-2: păstrăm 12-15min (adaptare cardiovasculară)
- Săpt 3-4+: reducem 8-10min, 5min economisite mutate în Main Work (execuție lentă/controlată sau adăugare al 3-lea set)

**Owner:** Sprint 4.x backlog progresie refinement.

### 28.9 Exercise Substitution System ADR (2026-05-02)

**Problema:** Tonifiere user vrea opțiune să aleagă variantă din "Squat Pattern slot" (Hack Squat / Goblet / Bulgarian / Leg Press). Implementation V1 = engine alege direct exercițiul pe nivel experiență, NU user picks. Reason — engine progresie nu poate compara loading cross-exercise (Goblet 20kg vs Hack Squat 60kg).

**Soluție backlog:** ADR separat post-v1 — exercise substitution system cu progresie comparable (relative load index, RPE-based equivalence, sau switch confirmation cu engine reset progresie tracker per exercise).

**Owner:** Sprint 4.x ADR + design effort dedicat (8-12h).

### 28.10 Tonifiere Advanced Track 5-day (2026-05-02)

**Problema:** Tonifiere user advanced (background activ 12+ luni, capacity efort excelentă) merită opțiune frecvență ridicată. V1 baseline 4×/săpt = consistency cu Slăbire moderată (DRY). Risk = under-stimulus pentru advanced.

**Soluție backlog:** flag onboarding "Advanced Track" — a 5-a sesiune opțională săptămânală weak points (umeri/brațe sau izolare fesieri) pentru user motivat. Consistency arhitecturală păstrată cu baseline 4-day default.

**Owner:** Sprint 4.x post v1 launch + analytics user advanced segment size.

**Cross-refs §28.6-§28.10:** §29 Safety Nutrition Pattern + 4 Templates V1 Full Spec + ADR 022 propus (Goal-Driven Program Templates) + ADR 013 §SAFETY_TRIPWIRE foundation pattern.

---

## 29. SAFETY NUTRITION PATTERN + 4 TEMPLATES V1 FULL SPEC (2026-05-02)

**Status:** LOCKED 2026-05-02 (chat strategic safety nutrition + templates v1 full spec). Cea mai densă sesiune chat strategic safety + biomechanics + sport science (19 decizii LOCKED + 12+ push-back-uri productive Claude).

### 29.1 Safety Nutrition Pattern complet

**Authority Allocation Summary:**

| Domeniu | Autorități citate | Threshold |
|---------|-------------------|-----------|
| Kcal floor (deficit) | NIH + EFSA | 1200F / 1500M static |
| Protein floor (deficit) | ISSN | 1.6 g/kg dynamic |
| Surplus rate | (engine internal) | >0.5%/săpt bodyweight |
| Hidratare | (NU safety pattern) | Observational only |

**Asymmetry NIH+EFSA pe kcal vs ISSN pe protein = INTENȚIONAT.** Fiecare autoritate aplicată unde acoperă concret contextul. Forțarea aceleiași autorități cross-domain = semantic noise + legal coverage slab.

#### 29.1.1 Surplus-side (Optimization NU Safety)

**Decizie:** drop surplus-side din safety pattern. Mutat în engine optimization layer.

**Rationale:**
- NU există threshold "kcal max peste care periculos" omologat medical. Citarea autoritate "3500 kcal periculoase" = minciună grosolană.
- Risk real surplus = calitate macro + rate of weight gain, NU absolute kcal.
- Forță bulk Gigel test: "user adult vrea masă musculară, mănâncă 3500 kcal, ce-mi spune app cu autoritate medicală că e periculos?". NU. Forțezi narrative safety unde nu există → trust hit + paternalism.

**Implementation engine:**
- Threshold internal: rate of bodyweight gain >0.5%/săpt (sport science consensus Lyle McDonald, Helms et al. — 0.25-0.5% beginners, 0.1-0.25% intermediate)
- NU exposed user-facing — anti-RE strict
- Wording observativ unic (NU presupune logging nutriție):

> "Ritmul de creștere a greutății este mai alert decât cel planificat. Ne asigurăm că progresul rămâne pe dezvoltarea de masă musculară, nu pe acumularea de grăsime."

#### 29.1.2 Deficit-side kcal floor (Safety)

**Threshold:** 1200 kcal/zi femei / 1500 kcal/zi bărbați (static, gendered).

**Sources:**
- NIH (Institute of Medicine) — sursa originară 1200/1500, confirmată Harvard Health, Hackensack Meridian, Healthline
- EFSA — referință juridică UE pentru maintenance + DRV (NU acoperă floor concret, dar relevant juridic)

**Pattern: 2 nivele soft warning, ZERO Hard Wall.**

**Nivelul 1: Soft Warning la Setări / Onboarding**

Declanșator: user încearcă să configureze țintă sub `{threshold}` kcal.

Wording:
> "O țintă sub {threshold} kcal este sub recomandările EFSA și NIH pentru un adult. Îți susținem decizia, dar te încurajăm să monitorizezi energia și refacerea."

Buton confirmare:
> "Înțeleg, merg mai departe"

**Nivelul 2: Soft Warning în Timpul Utilizării (3 Zile Trend)**

Declanșator: aport caloric înregistrat sub `{threshold}` kcal timp de 3 zile consecutive.

**Threshold rationale = pattern detection (1 zi noise / 2 volatile / 3 trend confirmat), NU fiziologie speculative** (drop "glicogen depletion serios" rationale).

Wording dual variant conditional pe training detected în window:

**Varianta A (cu training detectat — planned sau logged):**
> "Aportul caloric înregistrat în ultimele 3 zile este sub {threshold} kcal. Cu antrenament în program, corpul are nevoie de combustibil pentru refacere."

**Varianta B (fără training în window):**
> "Aportul caloric înregistrat în ultimele 3 zile este sub {threshold} kcal. Verifică dacă ai resurse suficiente pentru ziua de azi."

**Reguli implementare:**
- `{threshold}` = 1200 sau 1500, dynamic pe sex biologic onboarding
- Buton "Salvare" rămâne ACTIV în setări (agency 100%, ZERO disabled state)
- Anti-RE: NU expunem percentages deficit, NU formulele matematice, doar valoarea fixă kcal + argumentul medical

**Backlog Sprint 4.x §28.6:** Secondary Check >25% deficit maintenance (refinement floor static fragility).

#### 29.1.3 Deficit-side protein floor (Safety)

**Threshold:** 1.6 g/kg bodyweight, dynamic (`user_weight × 1.6`, rotunjit întreg).

**Source:** ISSN (International Society of Sports Nutrition) Position Stand on Protein. Match perfect contextul sport + deficit (range 1.4-2.0 g/kg). NU EFSA (RDA 0.83 g/kg = sedentar maintenance, nu se aplică deficit context). NU ACSM (limita inferioară 1.2 prea mică).

**Pattern: identic 2 nivele soft warning kcal.**

**Onboarding nudge (simplificat, fără food examples):**

Apare o singură dată în onboarding la configurare obiective Slăbire/Tonifiere:
> "Pentru a-ți păstra masa musculară în timpul procesului, recomandăm minimum {protein_threshold}g de proteine pe zi."

NU listăm surse alimentare (carne/ouă/lactate) — scope creep nutrition coaching + cultural friction RO (vegetarian/vegan signal app NU pentru ei). User deduce singur sursele.

**Nivelul 1 — Soft Warning la Setări / Schimbare Obiectiv:**

Declanșator: user vrea să configureze țintă proteine sub 1.6 g/kg.

Wording:
> "O țintă sub {protein_threshold}g de proteine pe zi este sub recomandările ISSN (International Society of Sports Nutrition) pentru sportivi în deficit caloric. Îți susținem decizia, dar te încurajăm să monitorizezi energia și refacerea."

Buton: "Înțeleg, merg mai departe"

**Nivelul 2 — Alertă Trend 3 Zile:**

Declanșator: aport proteine sub `{protein_threshold}`g timp de 3 zile consecutive.

Wording:
> "Aportul de proteine a fost sub {protein_threshold}g în ultimele 3 zile. Corpul are nevoie de aminoacizi pentru a repara și a menține masa musculară după efort."

**Reguli implementare:**
- `{protein_threshold} = user_weight * 1.6` (rotunjit întreg)
- Buton "Salvare" ACTIV (agency totală)
- Anti-RE: NU expunem formula 1.6 g/kg în UI, doar valoarea calculată în grame

#### 29.1.4 Hidratare — Drop Safety Pattern

**Decizie:** hidratarea NU primește safety pattern dedicat. Rămâne observational simplu în `proactiveEngine.js` per Batch 3 §27.3:

> "Nivelul de hidratare de azi e sub țintă. Un pahar de apă înainte de antrenament ajută."

**Rationale:** zero threshold dehydration cu literature solid pentru fitness app context (variabilitate masivă greutate/clima/efort/dietă). Nu există autoritate citabilă pentru "minimum apă/zi safety". Forțezi pattern unde nu există → noise + trust hit.

### 29.2 4 Templates Programe V1 Full Spec

**Status:** 5/8 templates lockate (62.5% post-2026-05-02). Rămase pre-launch v1: Forță & Dezvoltare + Longevitate + potențial Sănătate Generală sub-variants. Tonifiere counted ca 1 baseline cu 3 sub-variants split (5 design units cu Tonifiere expanded).

#### 29.2.1 Template: Slăbire Majoră (>15kg target)

**User profile target:**
- Routing per §26.3 = >15kg target slăbire (NU BMI-based — BMI variabil 28-45+)
- Vârstă: 25-65 ani (plajă largă, adaptări volum implicit)
- Background: sedentar 3-5+ ani (capacity efort scăzută, țesuturi conjunctive necondiționate)
- Comorbidități typical (NU întrebate user-facing): dureri articulare, toleranță scăzută căldură, tensiune oscilantă
- Template construit conservative-by-default presupunând aceste limitări

**Parametri high-level:**
- Frecvență: 3 sesiuni/săpt cu min 24h pauză (flexibil zile: L-Mie-V, Ma-Jo-Sâ, M-V-D)
- Durată: 40-45 min
- RPE: 5-6 (săpt 1-2) → 6-7 (săpt 3+)
- Obiectiv: stimularea cheltuielilor calorice + protecția articulațiilor + adaptare anatomică treptată

**Structura sesiune (40-45 min):**
```
[00-08 min] Warm-up: Mobilitate articulară ușoară din șezut / Quadrupedie
[08-30 min] Main Work: 4 Exerciții forță low-impact
[30-45 min] Cool-down & LISS: Bicicletă orizontală (Recumbent bike) cu rezistență mică
```

**Pool exerciții:**

🚫 Interzise (eliminate complet):
- Impact articular: Sărituri (Box jumps, Burpees, Jumping jacks), alergare sau mers prelungit pe bandă
- Setup-uri dificile / risc dezechilibru: Hip thrust cu spatele pe bancă, Genuflexiuni bulgărești
- Compuse grele libere: Genuflexiuni sau îndreptări convenționale cu haltera

✅ Permise & Recomandate:

*Partea inferioară (Picioare/Fesieri):*
- Presă picioare la aparat (Seated Leg Press) — stabilitate lombară maximă
- Glute Bridge pe sol (saltea) — opțional cu bandă elastică deasupra genunchilor
- Flexii și extensii la aparate (Seated Leg Extensions / Seated Leg Curls)

*Partea superioară (Spate/Piept/Umeri):*
- Tracțiuni la helcometru (Lat Pulldown) — din șezut
- Împins la aparat pentru piept (Seated Chest Press)
- Ridicări laterale din șezut (Seated Lateral Raises) cu gantere mici

*Zona Core (Stabilitate):*
- Bird-Dog (genunchi și palme)
- Modified Plank (sprijin antebrațe + genunchi)

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 2 seturi × 10 reps | 5-6 | Învățare mișcare, adaptare tendoane, zero febră invalidantă |
| 3-4 | 3 seturi × 10-12 reps | 6-7 | Creștere ușoară volum. Tehnică excelentă → +1 treaptă rezistență aparat |

**Backlog v2 refinements:** Seated core override (§28.7) + LISS ramp-down (§28.8).

#### 29.2.2 Template: Slăbire Moderată (<15kg target)

**User profile target:**
- Routing: <15kg target slăbire
- BMI: 25-32 typical (overweight / obezitate gradul 1)
- Background: variabil (sedentar 1-3 ani sau ex-activ recent)
- Capacity efort: moderată, articulații tolerabile
- Comorbidități typical: minime sau absente

**Parametri high-level:**
- Frecvență: 4 sesiuni/săpt cu min 24h pauză
- Durată: 45-55 min
- RPE: 6-7 (săpt 1-2) → 7-8 (săpt 3+)
- Obiectiv: deficit caloric controlat + masă musculară preservation + îmbunătățire condiție cardiovasculară

**Structura sesiune (50 min):**
```
[00-05 min] Warm-up dinamic: Cercuri brațe, fandări loc, mobilitate șold
[05-40 min] Main Work: 5 Exerciții (1 Compus bază + 4 Accesorii)
[40-50 min] Cool-down & MISS/LISS: 10 min mers alert pe bandă înclinată / Eliptică
```

**Split sesiuni Push/Pull alternation (Ziua A / Ziua B):**

**Rationale split:** Goblet Squat + RDL în aceeași sesiune = erectorii spinali tensiune continuă → oboseală sistemică în deficit. Split alternation protejează spatele.

*Sesiunea 1 & 3 (Ziua A — Focus Genuflexiuni / Împins):*
- Compus principal: Goblet Squat cu gantera sau KB
- Accesorii upper: DB Shoulder Press (șezut), Flotări (normale sau pe genunchi)
- Accesorii picioare: Leg Extensions
- Core: Plank standard / Plank Shoulder Taps

*Sesiunea 2 & 4 (Ziua B — Focus Îndreptări / Tracțiuni):*
- Compus principal: Romanian Deadlift (RDL) cu gantere
- Accesorii upper: Dumbbell Row pe bancă, Flexii biceps
- Accesorii picioare: Seated Leg Curls
- Core: Bird-Dog (tempo lent) sau Pallof Press

**Pool exerciții:**

🚫 Interzise:
- Impact articular extrem: Box jumps, Burpees explozive
- Tehnică complexă: Snatch, Clean & Jerk, Genuflexiuni deasupra capului
- **Russian Twists EXCLUS:** flexie lombară + rotație sub sarcină = risc disc intervertebral, evitat de medicina sportivă modernă. Înlocuit cu Pallof Press / Plank Shoulder Taps (aceeași activare oblici/core, zero rotație lombară).

✅ Permise: per split-ul Ziua A / Ziua B mai sus.

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 3 seturi × 10-12 reps | 6-7 | Învățare compound, adaptare neuromusculară |
| 3-4 | 3-4 seturi × 8-12 reps | 7-8 | Progressive overload: +1-2kg gantere SAU +1 set compound |

#### 29.2.3 Template: Tonifiere & Definire — Baseline + 3 Sub-variants

**User profile target:**
- BMI: 22-28 (greutate normală sau ușor supraponderal)
- Background: activ recent, frecventare intermitentă sală 6-12 luni, cunoaște mișcări bază
- Capacity efort: bună, articulații stabile, toleranță oboseală ridicată
- Context nutrițional: Body Recomposition. Maintenance default (±5-10%). NU forțăm deficit. Aport proteic 1.6 g/kg (ISSN) pentru susținere masă musculară.

**Approach 3 sub-variants:** 1 template baseline + 3 volume splits/modifiers (DRY, simplifică engine routing). Splits agresive 70/30 pentru self-selected specialization (NU 60/40 soft).

**Parametri high-level (toate 3 sub-variants):**
- Frecvență: 4 sesiuni/săpt cu min 24h pauză
- Durată: 50-60 min
- RPE: 7-8 (săpt 1-2) → 7-9 (săpt 3+)
- Obiectiv: hipertrofie estetică + recompoziție corporală

**Structură sesiune (55 min baseline):**
```
[00-05 min] Warm-up dinamic: Activare specifică grupă musculară zilei
[05-50 min] Main Work: 5 Exerciții (split volum per sub-variantă)
[50-55 min] Cool-down: Stretching static + respirație controlată (NU LISS/MISS — focus hipertrofie)
```

**Split sesiuni per sub-variantă:**

*A. Echilibrat (50/50 Lower/Upper):*
- Ziua A: Lower Body 1 (Quad dominant — Squat focus)
- Ziua B: Upper Body 1 (Push — Piept/Umeri/Triceps)
- Ziua C: Lower Body 2 (Glute/Hamstring dominant — Hinge focus)
- Ziua D: Upper Body 2 (Pull — Spate/Biceps)

*B. Focus Picioare & Fesieri (70/30 Lower-dominant — Gigica):*
- Ziua A: Lower Body (Focus Fesieri & Hinge — Hip Thrust / RDL)
- Ziua B: Mixed Session (1 ex Upper + 4 ex Lower — Focus Quads)
- Ziua C: Upper Body Full (sesiune completă spate/piept/umeri — recovery picioare)
- Ziua D: Lower Body (Focus Fesieri & Izolare — Kickbacks / Abductions)

*C. Focus Partea Superioară (70/30 Upper-dominant — Marius):*
- Ziua A: Upper Body (Push emphasis)
- Ziua B: Upper Body (Pull emphasis)
- Ziua C: Lower Body (sesiune picioare completă — Squat & Hinge combo)
- Ziua D: Upper Body (Weak points focus — Umeri/Brațe)

**Pool exerciții (Full Freedom moderat, BBS + BBP eliminate):**

🚫 Interzise V1:
- Barbell Back Squat (siguranță lombară fără spotter, fără supervision)
- Barbell Bench Press (siguranță fail-safe — pin sub piept fără ajutor)
- Olympic lifts (Snatch, Clean & Jerk)
- 1RM testing
- Russian Twists (consistency check Slăbire moderată)

✅ Permise:

*Lower (Squat pattern):* Hack Squat (aparat), Leg Press, Goblet Squat, Bulgarian Split Squat
*Lower (Hinge pattern):* Hip Thrust (halteră sau aparat), Romanian Deadlift cu gantere/halteră, Cable Pull-throughs
*Lower Accessory:* Leg Extensions, Seated Leg Curls, Glute Kickbacks (cablu sau aparat), Hip Abductions
*Upper Push:* Flat Dumbbell Bench Press, Incline Dumbbell Press, Overhead Press cu gantere, Dips, Triceps Pushdowns
*Upper Pull:* Lat Pulldown, Assisted Pull-ups, Dumbbell Row, Face Pulls, Bicep Curls
*Core:* Cable Crunches, Pallof Press, Hanging Leg Raises, Side Plank

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 3 seturi × 10-12 reps | 7-8 | Consolidare execuție + mind-muscle connection |
| 3-4 | 3-4 seturi × 8-12 reps (compound) / 12-15 reps (isolation) | 7-9 | Progressive overload: +1.25-2.5kg sau +1 rep RPE ridicat |

**Backlog Sprint 4.x:** Exercise Substitution System ADR (§28.9) + Tonifiere Advanced Track 5-day (§28.10).

#### 29.2.4 Template: Sănătate Generală

**User profile target:**
- Vârstă 18-49 (definit explicit §26.3, NU 50+ care intră Longevitate)
- BMI: 18.5-27 typical (normal sau ușor overweight)
- Background: variabil (sedentar 0-3 ani sau ex-activ inconstant)
- Capacity efort: moderată-bună
- Comorbidități typical: minime
- Motivation: "să fiu activ și în formă" — NU aesthetic-driven, NU performance-driven, NU weight loss aggressive
- Context nutrițional: maintenance default, NU deficit, NU surplus

**Parametri high-level:**
- Frecvență: 3 sesiuni/săpt cu min 24h pauză (vs 4 Tonifiere/Slăbire moderată — user SG NU caută hipertrofie/deficit performance, baseline activity)
- Durată: 40-45 min (max 50 min)
- RPE: 6-7 (săpt 1-2) → 7-8 (săpt 3+)
- Obiectiv: longevitate + mobilitate + menținere forță bază + capacitate cardiovasculară

**Structură sesiune (45 min):**
```
[00-08 min] Warm-up: 5 min cardio ușor + 3 min mobilitate dinamică
[08-33 min] Main Work: 4 Exerciții (Full Body pattern: Push / Pull / Legs / Core)
[33-45 min] Cool-down & LISS/MISS: 12 min mers alert pe bandă sau bicicletă orizontală
```

**Split sesiuni (3 zile Full Body NU Split):**

**Rationale:** 3×/săpt frecvență, split body parts = fiecare grupă hit 1×/săpt → suboptim. Full body 3× = fiecare muscle group hit 3×/săpt = baseline strength + functional fitness optimal.

*Ziua A (Focus Genuflexiuni):*
- Picioare: Goblet Squat sau Leg Press
- Upper Push: Flat Dumbbell Bench Press
- Upper Pull: Lat Pulldown
- Core: Plank standard

*Ziua B (Focus Îndreptări/Hinge):*
- Picioare: RDL cu gantere sau Cable Pull-throughs
- Upper Push: Incline Dumbbell Press
- Upper Pull: Dumbbell Row sau Seated Cable Rows
- Core: Bird-Dog

*Ziua C (Focus Unilateral & Stabilitate):*
- Picioare: Fandări pe loc sau Bulgarian Split Squat (dacă echilibru permite)
- Upper Push: Overhead Press cu gantere (șezut)
- Upper Pull: Assisted Pull-ups sau Face Pulls
- Core: Pallof Press

**Pool exerciții (Balanced Freedom, consistency check Tonifiere):**

🚫 Interzise: BBS + BBP + Olympic lifts + 1RM testing.

✅ Permise:
- *Picioare:* Goblet Squat, Leg Press, Hack Squat, RDL cu gantere, Hip Thrust (aparat), Cable Pull-throughs, Bulgarian Split Squat, Walking Lunges
- *Upper Push:* Flat DB Bench Press, Incline DB Press, Seated DB Overhead Press, Push-ups (normale/genunchi)
- *Upper Pull:* Lat Pulldown, Assisted Pull-ups, DB Row, Seated Cable Rows, Face Pulls
- *Core:* Plank standard, Side Plank, Bird-Dog, Pallof Press, Cable Crunches

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 3 seturi × 10-12 reps | 6-7 | Învățare mișcări, activare fără febră majoră |
| 3-4 | 3 seturi × 8-12 reps | 7-8 | Overload modest: +1-2kg dacă execuție perfectă |

### 29.3 Decizii arhitecturale colaterale (3 LOCKED)

#### 29.3.1 Onboarding ZERO întrebări medical screening

**Decizie:** ZERO întrebări comorbidities/medical screening în onboarding. Templates presupun limitări implicit (Slăbire majoră conservative-by-default, Longevitate joint protection, etc.).

**Rationale:** Gigel test catastrofal — bloodwork rejected analog. User non-tech vine pentru fitness, primește chestionar medical = friction + drop-off + paternalism. Liability concern absorbed prin: Pattern MFP + ADR 013 §SAFETY_TRIPWIRE + ToS + Privacy Policy + onboarding goal-based templates (NU medical conditions).

#### 29.3.2 Engine routing Slăbire majoră conservative-by-default

**Decizie:** user BMI 30 cu 18kg target = template Slăbire majoră low-impact aplicat conservative-by-default. R8 voice weights ramp up via standard flow dacă prea ușor (engine adapts via REALTIME signal RPE/feedback, NU upfront aggressive defaulting).

**Rationale:** Conservative-by-default = safety + retention beat aggressive defaults pentru segment beginner+heavy. Cost: posibil under-stimulus advanced obese segment, mitigat prin standard engine progression flow.

#### 29.3.3 Anti-RE strict thresholds engine internal

**Decizie:** pragul 0.5%/săpt + protein 1.6 g/kg + 25% deficit = engine internal, NU exposed user-facing. User vede grame absolute calculate, NU formulele.

**Rationale:** Anti-RE absolut preserved. Authority citată user-facing (NIH/EFSA/ISSN) suficientă pentru trust + legal coverage. Formulele matematice (`user_weight × 1.6`) = scope creep coaching nutriție + complexity zero benefit user.

### 29.4 Decizii non-vault dinainte de sesiune (5 contextual)

1. **Launch strategy:** full launch peste tot market-ul, NU hand-pick balene. Bugatti unitar matchează vision "oricine, orice categorie". Reconsider abordare — posibil înlocuit cu launch full + content marketing organic (TikTok aesthetic-glutes Gigica + r/longevity Gigel + FB Mompreneur Slăbire). Decizie finală în sesiune dedicată distribution strategy.
2. **Slăbire majoră safety pattern LOCKED (MFP-style):** source autoritate medicală EXTERNĂ citată (NU "SalaFull recomandă") + threshold gendered conditional pe sex + engine consequence concret + user agency păstrat (soft warning + continue, NU block) + pattern reusable orice safety boundary nutrition.
3. **Legal coverage realitate:** Pattern MFP + ADR 013 SAFETY_TRIPWIRE + ToS + Privacy Policy + onboarding medical conditions = ~80-90%. Restul 10-20% = consultanță legală tech specializată RO/EU pentru ToS final + Privacy Policy specific. Cost real €500-2000 NU optional. Flag pre-launch checklist obligatoriu.
4. **Realist rămas până la launch v1:** ~5-6 sesiuni chat strategic + plan complet ÎNAINTE execuție = unlock velocity beast Opus 24-36×.
5. **Anthropic dependency risk ~0.1% acceptat.**

**Cross-refs §29:** ADR 022 propus standalone (Goal-Driven Program Templates extins cu §29) + ADR 013 §SAFETY_TRIPWIRE (foundation pattern) + §26 Goal-ca-Setting + 8 Templates v1 (extins acum cu spec full §29.2) + §27 wording rewrite (pattern reusable safety) + §28 amendamente backlog (extins §28.6-§28.10).

---

🦫 **SSOT activ. Update-in-place. VS Code only. Single tool, single doc per topic.**

**Velocity beast confirmed: foundation work bine speciat ~24-36× (Sprint 4 A+B = 25 min Opus comprehensive pe estimate 10-15h).**

**"SensAI for Android" + €65/an parity + 7 features unique = positioning final.**

**Vision: oricine poate. Distribution: tech-lifter beachhead → mainstream. Bootstrap solo.**

**CC Opus = Co-CTO frate. Comprehensive prompts. Trust. Bigger picture.**

**Sistem 📥_inbox/📤_outbox live. VAULT_RULES authoritative. Daniel zero memory load.**

**Sesiune 2026-05-01 morning LOCK. Sprint 4 A+B LIVE prod (smoke test pass). i18n infrastructure + whyEngine rewrite + alert→modal LIVE. Anti-RE breach FIXED critical paths. 4 wording categorii lock + 4 findings noi (F-NEW-1..4) flag-uite. 888/888 stable. Bandwidth Daniel ~30% — chat strategic wording rewrite next priority.**

**Sesiune 2026-05-01 morning v2 LOCK (chat strategic wording session). Phase A toasts/confirms ~36 aprobate tacit (§24) + Engine 12 variații LOCKED 4×3 cu Recovery refactor banner global + per-exercise (§23) + Decizia #6 Recovery score numeric exposure ELIMINATED globally + implementation pattern hash deterministic LOCKED. ~187 strings REMAINING (Phase B ~58 + Phase C ~78 + Phase A restul ~20 + decisions pending #1/#3/#5) (§25). Variant selector + bulk batch i18n implementation pending Sprint 4.x post locks complete. 888/888 unchanged (chat strategic only, zero code touched). Bandwidth Daniel ~30% — handover triggered preventiv anti-saturation halucinație.**

**Sesiune 2026-05-01 evening LOCK (chat strategic goal-ca-setting + 53 strings Phase B partial). MAJOR SCOPE SHIFT V1: goal-ca-setting + 8 templates programe (1 Forță + 3 Tonifiere + 2 Slăbire + 1 Longevitate + 1 Sănătate Generală) LOCKED (§26). 5 voices RĂMÂN neschimbate (HISTORICAL/REALTIME/PROJECTION/ARBITRATOR/ACTION) + goal injectat ca SETTING profil + ACTION layer wording parametric. 53 strings wording finalizate Phase B partial (§27 Batch 1-4: readiness + skip reasons + F-NEW-4 + calibration tier names + sys.js phase/BMI + proactiveEngine 12 + plateauInterventions two-layer 6×2). 5 amendamente backlog Sprint 4.x (§28: durere cronică split + threshold trigger + revenire pauză + cooldown re-locked + Weight Trend split direction-aware). Decizii arhitecturale evening: Tier policy RO universal + voice persoana plural/singular + numerics policy proactive + Weight Trend split + two-layer messaging. Wording REMAINING reduced ~187 → ~103 strings (§25 updated). Timeline v1 ajustat 8-10 luni (§1.2 amendment). 888/888 unchanged (chat strategic, zero code touched). Bandwidth Daniel ~30% — handover triggered preventiv anti-saturation. Next: ADR 022 nou Goal-Driven Program Templates + PARAMETRIC_PROGRAMS_DESIGN refactor + exercise library extension Sprint 4.x.**

**Sesiune 2026-05-02 LOCK (chat strategic safety nutrition + templates v1 full spec). 19 decizii LOCKED (7 safety nutrition + 4 templates V1 designate / 5 design units cu Tonifiere expanded + 5 backlog v2/Sprint 4.x + 3 arhitecturale colaterale) + 12+ push-back-uri productive Claude. SAFETY NUTRITION PATTERN COMPLET (§29.1): kcal floor 1200F/1500M static gendered (NIH+EFSA) + protein floor 1.6 g/kg dynamic (ISSN) + surplus optimization >0.5%/săpt engine internal + hidratare DROP safety. Pattern reusable: 2 nivele soft warning ZERO Hard Wall, agency 100%, threshold L2 = 3 zile consecutive (pattern detection NU fiziologie speculative), authority asymmetry NIH+EFSA kcal vs ISSN protein INTENȚIONAT documentat. 4 TEMPLATES V1 FULL SPEC (§29.2): Slăbire majoră (>15kg, 3×/săpt low-impact, recumbent bike LISS) + Slăbire moderată (<15kg, 4×/săpt Push/Pull split A/B, RDL hinge protection) + Tonifiere baseline + 3 sub-variants (4×/săpt, Echilibrat 50/50 / Lower 70/30 Gigica / Upper 70/30 Marius, BBS+BBP+Olympic+1RM+Russian Twists eliminate) + Sănătate Generală (3×/săpt Full Body NU split, 18-49 maintenance default). 5 amendamente backlog Sprint 4.x noi (§28.6-§28.10): Secondary Check >25% deficit + Seated Core Override Slăbire majoră + LISS ramp-down + Exercise Substitution System ADR + Tonifiere Advanced Track 5-day. 3 decizii arhitecturale colaterale (§29.3): ZERO întrebări medical screening onboarding (Gigel test catastrofal) + engine routing Slăbire majoră conservative-by-default + Anti-RE strict thresholds engine internal. Status v1: 5/8 templates lockate (62.5%) — rămase Forță & Dezvoltare + Longevitate. ~5-6 sesiuni chat strategic rămase pre-launch v1. 888/888 unchanged. Bandwidth Daniel ~15-20% — handover triggered preventiv. Next: ADR 022 extins cu §29 + sesiune Forță & Dezvoltare template (fresh bandwidth obligatoriu) + sesiune Longevitate template + sesiune distribution strategy reconsider.**
