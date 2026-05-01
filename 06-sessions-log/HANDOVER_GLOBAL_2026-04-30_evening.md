# HANDOVER GLOBAL — Sesiune 2026-04-29 seară → 2026-05-01 morning v2

**Owner:** Daniel (CEO + Product). Claude = Co-CTO + Reviewer.
**Status:** SSOT activ. Înlocuiește versiunea dimineață a `HANDOVER_GLOBAL_2026-04-30.md`.
**Data:** 2026-05-01 morning v2 (post Sprint 4 A+B LIVE prod + smoke test ADR 020 Phase 1 + i18n audit completed + 4 wording categorii lock + 4 findings noi + chat strategic wording session — Engine 12 variations LOCKED + Phase A toasts/confirms aprobate tacit + Decizia #6 Recovery score).

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
- §25 Wording REMAINING Next Sesiune ~187 strings (Phase B ~58 + Phase C ~78 + Phase A restul ~20 + decisions pending)

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

---

## 15. TESTS & GIT STATE FINAL

- **Tests:** **888/888 PASS** (752 baseline + 52 storage ADR 020 + 13 bootstrap + 37 reconciliation + 23 i18n + 22 whyEngine - 11 legacy whyEngine = +136 cumulat) — unchanged morning v2 (chat strategic, zero code touched)
- **HEAD origin/main:** `70b22ff` pre-ingest morning v2 (post handover morning v1 push final) — post-ingest morning v2 SHAs see `📤_outbox/LATEST.md`
- **Vault docs:** **52 active** + README + VAULT_RULES + PROMPT_CC_HYGIENE + PROMPT_CC_INGEST_HANDOVER (unchanged morning v2). Outbox archive (audit trail, NU vault docs): `📤_outbox/_archive/2026-04/01-28` + `2026-05/29..` (post handover ingest morning v2). `cc-reports/` DEPRECATED 30 apr (folder removed, content migrated).
- **Folder count:** 9 numerotate continuu (00-08) + 📥_inbox + 📤_outbox.
- **Backup tags origin:**
  - `pre-adr-020-impl` (ADR 020 rollback)
  - `pre-handover-ingest-2026-04-30-evening-v2` (evening v2 ingest rollback)
  - `pre-sprint4-a-b-2026-04-30` (Sprint 4 A+B rollback)
  - `pre-i18n-audit-2026-05-01` (i18n audit rollback)
  - `pre-handover-ingest-2026-05-01-morning` (morning v1 ingest rollback)
  - `pre-handover-ingest-2026-05-01-morning-v2` (morning v2 ingest rollback — chat strategic wording session)

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

## 25. WORDING REMAINING NEXT SESIUNE (~187 strings, morning v2)

**Status:** Lista clară pentru next chat strategic wording session. Daniel review cu Claude pe filtru Bugatti.

### Phase B engine messaging — REMAINING (~58 strings)

Prioritate ordonată (importance × visibility):

1. **`readiness.js` — Verdicte readiness (6 strings)** ⭐ HIGH PRIORITY (vizibile constant header coach):
   - "Zi de PR" / "Sesiune solidă" / "Sesiune normală" / "Sesiune moderată" / "Sesiune ușoară" + 1
   - Recomandări audit: "Zi de vârf" / PĂSTREAZĂ / "Zi obișnuită" / "Mergi mai blând azi" / "Zi de recuperare"
   - **Status:** RECOMANDĂRI audit Opus, NEAPROBATE individual de Daniel — review next sesiune.

2. **`calibration.js` tier names (6 strings)** ⭐ HIGH VISIBILITY:
   - 6 nivele canonical post-D1: COLD_START / INITIAL / DEVELOPING / PERSONALIZING / PERSONALIZED / OPTIMIZED
   - Filozofie recomandată audit: progresie relațională ("învăț → cunosc → te înțeleg → adaptez → sincronizat → te citesc")
   - Recomandări audit: "Învăț cum lucrezi" PĂSTREAZĂ / "Cunosc ritmul tău" / "Te înțeleg din ce în ce mai bine" / "Adaptez programul la tine" / "Lucrăm sincronizat acum" / "Te citesc ca pe o carte deschisă"
   - **PUSHBACK Claude pending (din chat morning v2):** Tier 4 PERSONALIZED "Te cunosc bine acum" risc trust hit dublu dacă engine greșește post-promisiune. Tier 5 OPTIMIZED "Pe aceeași lungime de undă" (variație Daniel proposed) — nu e clar mapping per tier. Decizie next sesiune.

3. **F-NEW-4 Plan ajustat banner + skip reasons** ⭐ ANTI-RE BREACH PROD-VISIBLE:
   - Plan banner percentage leak ("Plan redus 30%") + paternalist override ("Override (înțeleg riscurile)") + numerice raw ("Adherence scăzută: 0%", "Deviation crescut: 100%")
   - Recomandări locked din chat morning v2: "Plan ajustat azi pentru recuperare. Volumul e mai blând." + "Vreau planul inițial." (anti-paternalism real)
   - **NEAPROBATE final** — review next sesiune cu specific context.
   - Skip reasons (4): "Sunt prea obosit azi" / "N-am timp astăzi" / "Mă doare ceva / sunt accidentat" / "Alt motiv" — voce user persoana 1.

4. **Onboarding (9 strings)** ⭐ FIRST IMPRESSION RETENTION:
   - Step text + button labels + baseline weight prompt
   - Pattern recomandat: warm conversational, NU tutorial robotic. Action-oriented buttons ("Mergem mai departe" vs "Next"). Anti-paternalism (NU "te rog completează").
   - REMAINING — fiecare string review individual next sesiune.

5. **`sys.js` — BMI/BF bands + phase logic (12 strings)** ⭐ ANTI-PATERNALISM CRITIC:
   - **PUSHBACK locked Daniel:** ELIMINĂ etichete medicale stigmatizante ("Obez", "Supraponderal").
   - Decizie locked: BMI/BF bands → "Sub țintă / În țintă / Peste țintă pentru obiectivul tău" (relativizat la goal user, NU absolut medical).
   - Phase logic: "Faza CUT" → "Faza de definire" / "Faza BULK" → "Faza de creștere" / "Faza MAINTAIN" → "Faza de menținere" — RECOMANDĂRI, neaprobate final.
   - Decizie pending: EN technical labels (CUT/BULK) păstrate Pro tier? Sau RO universal default?

6. **`dp.js` — Rest day, taper, deload (13 strings):**
   - Pattern recomandat: rationale, NU command. User înțelege DE CE pauza/deload.
   - REMAINING — review next sesiune.

7. **`proactiveEngine.js` — Lagging muscle alerts (9 strings):**
   - Pattern recomandat: observație + acțiune luată, NU verdict gol.
   - REMAINING — review next sesiune.

8. **`plateauInterventions.js` (8 strings):**
   - Folosește reframing "deblocare" din wording-ul Engine Down lock (vezi §23 DOWN V2).
   - REMAINING — review next sesiune.

9. **`fatigue.js` (8 strings):** Anti-RE absolut. Zero numerice + zero category exposure. REMAINING.

10. **`reality.js` (7 strings):** Reality Engine backend mostly. User-facing minimal — review next sesiune ce-i exact.

### Phase C page labels — REMAINING (~78 strings)

| File | Count | Status |
|---|---|---|
| `dashboard.js` | 45 | ⭐ MOST VISIBLE — review next sesiune (tabs, buttons, notifications, recovery widget) |
| `weight.js` | 23 | Empty states + modal labels + chart labels — review next sesiune |
| `plan.js` | 10 | Phase override (vezi `sys.js`) + counts — review next sesiune |

### Decisions pending (gândește între timp Daniel)

1. **Exercise alternatives strategy:** A (EN tech names + RO reasons) / B (RO complete) / **C hibrid** (compound mari EN + izolări RO) — Daniel decide listă specifică next sesiune.
2. **Day names:** Intl API (`Intl.DateTimeFormat('ro', { weekday: 'long' })`) sau hardcoded array? **Recomandare Claude: Intl** (no-brainer multilingv automat).
3. **EN translations strategy:** A manual / B Sonnet-assisted / **C Hybrid A+B** (brand-critical ~30 manual + restul ~210 Sonnet-assisted batch review). Recomandare Claude: Hybrid.
4. **BMI/BF bands wording:** LOCKED — "Sub/În/Peste țintă pentru obiectivul tău" (decisie Daniel chat morning v2).
5. **Phase names CUT/BULK EN-only Pro tier sau RO universal default?** REMAINING.
6. **Recovery score numeric exposure:** LOCKED — eliminat complet, decizia #6 (vezi §23).

### Pattern recomandat next sesiune

Daniel + Claude review per priority ordonat (#1-9 above), filter Bugatti aplicat, lock wording final → handover-uri batch după fiecare priority majoră (anti-saturation, anti-halucinație).

**Cross-refs:** `📤_outbox/_archive/2026-04/28_I18N_AUDIT_INFRASTRUCTURE_RAPORT.md` (full audit Opus, ~238 strings inventoried) + ADR 013 §Anti-RE + §23 Engine variations LOCKED + §24 Phase A aprobate tacit + filozofie chat morning v2 (anti-paternalism + Bugatti voice + reframing pozitiv + voice unitar persoana I plural + promise temporal safe).

---

🦫 **SSOT activ. Update-in-place. VS Code only. Single tool, single doc per topic.**

**Velocity beast confirmed: foundation work bine speciat ~24-36× (Sprint 4 A+B = 25 min Opus comprehensive pe estimate 10-15h).**

**"SensAI for Android" + €65/an parity + 7 features unique = positioning final.**

**Vision: oricine poate. Distribution: tech-lifter beachhead → mainstream. Bootstrap solo.**

**CC Opus = Co-CTO frate. Comprehensive prompts. Trust. Bigger picture.**

**Sistem 📥_inbox/📤_outbox live. VAULT_RULES authoritative. Daniel zero memory load.**

**Sesiune 2026-05-01 morning LOCK. Sprint 4 A+B LIVE prod (smoke test pass). i18n infrastructure + whyEngine rewrite + alert→modal LIVE. Anti-RE breach FIXED critical paths. 4 wording categorii lock + 4 findings noi (F-NEW-1..4) flag-uite. 888/888 stable. Bandwidth Daniel ~30% — chat strategic wording rewrite next priority.**

**Sesiune 2026-05-01 morning v2 LOCK (chat strategic wording session). Phase A toasts/confirms ~36 aprobate tacit (§24) + Engine 12 variații LOCKED 4×3 cu Recovery refactor banner global + per-exercise (§23) + Decizia #6 Recovery score numeric exposure ELIMINATED globally + implementation pattern hash deterministic LOCKED. ~187 strings REMAINING (Phase B ~58 + Phase C ~78 + Phase A restul ~20 + decisions pending #1/#3/#5) (§25). Variant selector + bulk batch i18n implementation pending Sprint 4.x post locks complete. 888/888 unchanged (chat strategic only, zero code touched). Bandwidth Daniel ~30% — handover triggered preventiv anti-saturation halucinație.**
