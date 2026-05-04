# HANDOVER GLOBAL — Sesiune 2026-04-29 seară → 2026-05-02 PRE-LAUNCH FINAL

**Owner:** Daniel (CEO + Product). Claude = Co-CTO + Reviewer.
**Status:** SSOT activ. Înlocuiește versiunea dimineață a `HANDOVER_GLOBAL_2026-04-30.md`. **PRE-LAUNCH V1 SCOPE CLOSED — 0 sesiuni chat strategic rămase.**
**Data:** 2026-05-02 PRE-LAUNCH FINAL (post sesiune chat strategic 2026-05-02 [F-NEW-1/2/3/4 LOCKED V1 OBLIGATORIU + Muscle Memory Index hibrid LOCKED V1 + Storage Full UX 80%/95% LOCKED V1 + 3 Optimizări UX Friction LOCKED Onboarding 5→4 ecrane disclaimer integrat + Autofocus iOS workaround + The Next-Up Gaze + Friction Map V1 final + 3 BLOCKERS Sprint 4.x identificate (T&B Faza 2 persistence + Firebase Rules RTDB lock + D1 DEVELOPING refactor 5→6 tiers) + decizia GC Tombstones defer 6 luni evaluare 1 iul 2027 + Investiții confirmate ZERO buget nou; ~35 decizii LOCKED + ~6 push-back-uri productive Claude] + sesiunile anterioare preserved [Sprint 4 A+B LIVE prod + smoke test ADR 020 Phase 1 + i18n audit + morning v2 wording session + evening 2026-05-01 goal-ca-setting + 8 templates LOCKED + 2026-05-02 morning safety nutrition + 2026-05-02 evening Forță & Longevitate full spec + 2026-05-01 evening RESUBMIT Longevitate body complet + UX V1 LOCKED 16 sub-secțiuni + Distribution V1 + Pre-Launch V1 + REBRAND ANDURA LOCKED + andura.app + Investiții ~€500-700]).

---

## 0. STATUS ACTUAL

**Acest document = SSOT activ.** Conține:
- Strategy + vision lock-uit
- Pricing locked (Q-0507 UPDATED €100→€65) — **DEPRECATED 2026-05-02 Chat D §36.50** (Founding €39/an + Standard €59/an + Elite €79/an V1.1)
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
- §29 Safety Nutrition Pattern + 4 Templates V1 Full Spec (2026-05-02 morning — kcal floor + protein floor + 4 templates Slăbire majoră/moderată/Tonifiere baseline+3 sub-variants/Sănătate Generală)
- §29.2.5 Template Forță & Dezvoltare V1 LOCKED (2026-05-02 evening — 12 decizii LOCKED + 5 backlog: 18-45 ani min 6 luni sală, BMI 18.5-32 standard / 35 conditional, Linear Block 4+1 NU DUP V1, 4 zile L-Ma-Jo-V Upper/Lower split, PR Engine all-time best per (exercițiu, range reps), e1RM backend ASCUNS anti-RE, Safety Banner contextual săpt 3-4 BBS+BBP, Hip Thrust permis ≥6 luni cu UI educațional)
- §29.2.6 Template Longevitate V1 LOCKED **COMPLETE** (2026-05-01 evening RESUBMIT Option A — 13 decizii LOCKED + 3 backlog: Persona Maria 60-70 / vârstă mediană 65, 3 sesiuni/săpt L-Mi-V 35-40 min RPE 5-7, Continuous + Double Progression NU Lifestyle Deload toggle, 3 zile Full Body cu accente reale (A Stabilitate Genunchi/Șold + B Mobilitate Coloană/Umeri + C Autonomie/Plan Lateral), Sit-to-Stand + Cable Pull-throughs + Lateral Step-ups main lifts, Reps-first Double Progression 2×8→2×10→3×12, Mobilitate integrată Warm-up+Cool-down NU sesiuni separate, Cardio extern banner DISCRET WEEKEND 1×/săpt, Soft Redirect BMI>32 + slăbire → Slăbire Majoră, Sărbătorire 2 Trepte Mastery Milestone System Toast micro + Ecran elegant)
- §29.2.7 Sănătate Generală sub-variants 18-29 vs 30-49 = v3+ NU V1 (auto-reglarea RPE rezolvă diferențe biologice + onboarding self-selection routing 25 ani athletic baseline → Tonifiere/Forță; decizie data-driven post-launch analytics 6 luni)
- §29.5 UX Colateral V1 LOCKED **COMPLETE** (2026-05-01 evening RESUBMIT — 15 puncte + Swap Engine + Reset Cycles + Wording Reset: theme trio Obsidian/Alabaster/Carbon system-detect default + dynamic share cards branding andura.app + RO pur lock zero EN code-switching audit pre-launch + Hero minimalist + haptic 2 nivele + confetti EXCLUSIV evenimente mari + Design Tokens system + cronometru auto-start + video MP4/WebM cachare agresivă local-first + tab bar trio Azi/Istoric/Profil + sesiune persistentă mini-player + Local-First SQLite/IndexedDB + istoric listă cronologică + The Sticky Swap Engine cu 4-Swaps Rule + Clean Slate Reset Engine cycle reset matrice + Wording Reset Swap toast + sunete audio ducking + onboarding 5 ecrane <60 sec + editare istoric 3 niveluri + notificări locale opt-in + Streak Saver max 2 push/săpt)
- §29.6 Distribution Strategy V1 LOCKED (2026-05-01 evening RESUBMIT — Hibrid Soft Launch andura.app + zero marketing 4 săpt + DoD criteria target 1 ian 2027 + Beta 50 testeri segmentat invite-only 4 săpt + Free Early Access NU grandfathering permanent + Targeting RO storytelling-first r/Romania/FB grupuri + EN technical r/StrongerByScience/r/xxfitness/r/loseit + KPI primari Retention D7/D30 + Hard Stop signals + Feedback in-app email + Code Freeze 4 săpt post-launch + Hotfix max 12h)
- §29.7 Pre-Launch Checklist V1 LOCKED (2026-05-01 evening RESUBMIT — Legal DIY + Audit Plătit €300-500 1 lună înainte + Disclaimer medical onboarding checkbox + GDPR Privacy Policy + ADR 020 Phase 2 logs rotation €0 + D1 DEVELOPING refactor curățenie totală + Smoke Test gate-launch-prod.bat unificat + ADR 022 V2 Workflow Review hibrid Co-CTO + DoD Final Bugatti Grade 6 criterii)
- §30 Rebrand SalaFull → Andura LOCKED (2026-05-01 evening RESUBMIT — Andura 6 litere RO+EN + andura.app domeniu €10-15/an + Task CC Opus dedicat sweep paralel altă muncă: vault docs + cod + commits config + repo rename + GitHub Pages URL + email feedback signature)
- §31 Investiții LOCKED (2026-05-01 evening RESUBMIT — Total ~€500-700 primul an: consultanță legală €300-500 one-time + andura.app €10-15/an + Firebase Blaze €0-25/lună post-launch >1000 useri) **+ AMENDMENT 2026-05-02:** breakdown 6 luni primele ~€310-515 (Firebase free tier suficient cf §35 GC defer), zero buget nou sesiune 2026-05-02
- §22 F-NEW-1/2/3/4 **UPDATE 2026-05-02 — toate LOCKED V1 OBLIGATORIU** (NU mai flagged HIGH priority post i18n): F-NEW-1 i18n exerciții RO inversare regulă (UI Default RO + Toggle EN OFF) + F-NEW-2 Tier-aware progression 3 tiers + Sprinter Cap modifier + edge case Deload skip soft warning + F-NEW-3 Hyperreactive cooldown rate-limiting equipment 7-day rolling + phase change <24h silent absorb + edge case "User Pierdut" 25% aderență + 7 zile zero login + F-NEW-4 Plan ajustat banner "Plan ajustat astăzi pentru recovery" + buton "Folosesc varianta mea" replacement force-typing
- §29.5.5 Cronometru **AMENDMENT 2026-05-02:** extension §29.5.5 cu **The Next-Up Gaze** (preview vizual cartonaș set următor în timpul rest timer auto-start, soft highlight + border glow, ~1-2h Sonnet)
- §29.5.14 Onboarding Flow **AMENDMENT 2026-05-02:** **5 → 4 ecrane** (disclaimer medical mutat din ecran dedicat în ecran 4 Obiectiv cu checkbox obligatoriu disabled-until-checked, total <45 sec vs <60 sec anterior)
- §29.5 Autofocus iOS workaround NEW (§29.5.17 — `<input type="number" inputmode="numeric">` + `setTimeout 50ms` focus programatic la mount, zero tap suplimentar ecrane numerice)
- §29.5 Friction Map V1 final NEW (§29.5.18 — touchpoint matrix Onboarding 🟢 + Pauze 🟢 + Editare istoric 🟡 + Storage Full 🔴 + Disclaimer 🟡 + MMI prompt 🟡)
- §32 Muscle Memory Index (MMI) LOCKED V1 **NEW 2026-05-02** (algoritm hibrid Lookup + Boost: Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup, 6-12 luni 0.80×/1.25× boost / 12-24 luni 0.70×/1.10× / 24+ luni 0.60×/1.00× start proaspăt; Threshold trigger user-controlled 6+ luni pauză prompt "Vrei să reîncepem treptat sau de la zero?" + UI Bugatti tone "Pauza face parte din drum")
- §33 Storage Full UX Alert LOCKED V1 **NEW 2026-05-02** (Threshold 80% banner săptămânal discret NU blocant 3 buttons + Threshold 95% modal blocant 3 alegeri Export JSON / Activează Cloud Pro / Șterge automat 180 zile; ZERO data loss silent industry standard Apple/Google/Dropbox; Cap Pro upgrade prompt 1×/săpt + auto-rotate 180 zile DOAR cu consimțământ explicit)
- §34 Blockers Sprint 4.x Identified Pre-Launch **NEW 2026-05-02** (Blocker 1 T&B Faza 2 persistence Memory Paradox bug ~50-80h trad / ~3-5h Opus + Blocker 2 Firebase Rules RTDB lock production-blocker `database.rules.json` syntax sub 1h + Blocker 3 D1 DEVELOPING refactor 5→6 tiers ID renumber + schema migration runner + Golden Master ~8-12h trad / ~2-3h Opus)
- §35 Tombstones GC Defer 6 luni Post-Launch **NEW 2026-05-02** (Cloud Functions GC AMÂNAT primele 6 luni post-launch + borna evaluare oficială 1 iul 2027; rationale buget zero Firebase Spark plan + RTDB free tier 1GB ~3% în 6 luni; alegere A automation Blaze / B manual Daniel / C amână în continuare)

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
- ~~**v1 beachhead:** Tech-lifter ICP (100-500 users) prin Reddit/Discord/balene 10-20 antrenori powerlifteri geeks/word-of-mouth~~ **[DEPRECATED 2026-05-02 Chat D — §36.47 Beta cohorts 50 manual recruit (Inner Circle 20 + Gigel 15 + Power-User 15) + §36.53 Telegram NU Discord]**
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

**Andura positioning:** **"SensAI for Android"**.
- Android global ~70% market, ~75% Europe, ~85% Romania
- iOS users await v1.x Apple HealthKit + Capacitor wrapper
- ~~Pricing parity €65/an = no-brainer choice pe Android~~ → **Pricing sub-SensAI €59/an Standard** (DEPRECATED 2026-05-02 Chat D §36.50)

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

## 3. PRICING LOCKED (Q-0507 UPDATED in PRODUCT_STRATEGY_SPEC_v1) — **DEPRECATED 2026-05-02 Chat D §36.50**

> **§AMENDMENT 2026-05-02 Chat D — Pricing Final LOCKED V1 (Override §3):** §3 Pricing structure (Founding €60 lifetime + Pro €65/an + iOS €65/an + revenue math 10K-15.4K × €65) DEPRECATED de §36.50-§36.52 LOCKED V1 (Chat D). New tiers: **Founding €39/an cap 50** (3 ani LOCKED + 34% perpetual permanent) + **Standard €59/an** (sub-SensAI €65) + **Elite €79/an** V1.1 Martie 2027 (Core + Snapshot Gated Consultation Claude API). Auto-close mechanic la 50 Founding (§36.52). Conținut original §3 preserved ca audit trail istoric. Cross-ref: §36.50 Pricing Tiers + §36.51 Locked-In Guarantee + §36.52 Cap 50 + §1.3 PRODUCT_STRATEGY §AMENDMENT 2026-05-02 Chat D.

| Tier | Pricing | Justification |
|------|---------|---------------|
| ~~**Founding Members 100-500**~~ → **§36.52 cap 50 LOCKED V1** | ~~**€60 lifetime once**~~ → **€39/an LOCKED 3 ani + 34% perpetual** | DEPRECATED — §36.9 Founding lifetime ELIMINATE V1 + §36.50/§36.51/§36.52 |
| ~~**Pro standard v1+**~~ → **Standard V1 Core** | ~~**€6/lună sau €65/an**~~ → **€59/an** | DEPRECATED — §36.50 anchored sub-SensAI €65 (bootstrap solo trust deficit) |
| ~~**iOS post-v1.x** Same €65/an~~ | DEPRECATED V1 (Android-only confirmed §36.2) — Elite V1.1 Martie 2027 €79/an replaces upgrade tier |

**Schimbare vs Q-0507 inițial:** ~~-35% (€100 → €65)~~ → -41% Standard (€100 → €59) + -35% Founding (€60 lifetime → €39/an cu 3 ani LOCKED + 34% perpetual)

**Math revenue (DEPRECATED):**
- ~~10K users × €65/an = €650K/an~~ → revised post-Chat D §36.50 + cap 50 Founding cap loss €1.000/an reframing onest §36.52
- ~~15.4K users × €65/an = €1M/an target Year 2-3~~ → recalibrate cu mix 50 Founding €39 + N Standard €59 + N Elite €79

**Update aplicat în PRODUCT_STRATEGY_SPEC_v1.md** (sesiune 30 apr evening). **Chat D 2026-05-02 amendment aplicat în §1.2-§1.4 PRODUCT_STRATEGY DEPRECATED block + §29.6.3 amendment.**

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
- ~~Community features social v1 — Discord Premium Perk gated post-500 users (Q-0533)~~ **[DEPRECATED 2026-05-02 Chat D — §36.9 Discord ELIMINATE V1 + §36.53 Telegram Group + Topics replacement. ADR Q-0533 = DEPRECATED, NU exists ca file separat în 03-decisions/, doar referință în acest handover.]**

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

### Status update 2026-05-02 PRE-LAUNCH FINAL (chat strategic F-NEW LOCKED + MMI + Storage Full UX + UX Friction + 3 Blockers + GC defer)

- **F-NEW-1/2/3/4 LOCKED V1 OBLIGATORIU** (vezi §22 — UPDATE in-place din "flagged HIGH" → "LOCKED V1 OBLIGATORIU"): F-NEW-1 i18n exerciții RO inversare regulă (UI Default RO + Toggle EN OFF, lista finală 6 traduceri locked Romanian Deadlift → Îndreptări cu picioarele aproape drepte (RDL) etc., pattern reusable 3 categorii) + F-NEW-2 Tier-aware progression matrice 3 tiers Beginner 0-10 / Intermediate 11-50 / Advanced 51+ + Sprinter Cap modifier (compound 1.0 kg / isolation +1 rep) + Edge case Deload skip soft warning Bugatti tone + F-NEW-3 Cooldown rate-limiting (3+ înlocuiri 7-day rolling silent + phase change <24h absorb a 2-a) + Edge case "User Pierdut" dual condition aderență <25% AND 7 zile zero login + F-NEW-4 Banner "Plan ajustat astăzi pentru recovery" + buton "Folosesc varianta mea" replacement force-typing.

- **Muscle Memory Index (MMI) hibrid LOCKED V1** (vezi §32 NEW): algoritm Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup + boost progresie 3 săpt: 6-12 luni 0.80×/1.25× / 12-24 luni 0.70×/1.10× / 24+ luni 0.60×/1.00× start proaspăt. Threshold trigger user-controlled 6+ luni pauză prompt "Vrei să reîncepem treptat sau de la zero?" anti-paternalism agency 100%. UI wording "Pauza face parte din drum. Începem treptat — corpul tău își amintește." Justified V1 (Maria post-operație șold 8 luni revine ~iulie 2027). Effort ~3-4h Sonnet.

- **Storage Full UX Alert LOCKED V1** (vezi §33 NEW): Threshold 80% banner săptămânal discret NU blocant (Exportă datele JSON / Află despre Cloud Pro / Închide) + Threshold 95% modal blocant 3 alegeri obligatorii (Descarcă istoricul / Activează Cloud Pro / Șterge automat 180 zile alegere definitivă). ZERO data loss silent industry standard. Cap Pro upgrade 1×/săpt + auto-rotate 180 zile DOAR cu consimțământ explicit. Effort ~4-6h Sonnet. Justified V1 (primii power users 80MB ~6-12 luni, gap v1.5 risk crash silent prod).

- **3 Optimizări UX Friction LOCKED V1** (vezi §29.5.14 + §29.5.17 + §29.5.5 amendment + §29.5.18): Onboarding 5 → 4 ecrane (disclaimer medical mutat ecran 4 Obiectiv cu checkbox disabled-until-checked, total <45 sec vs <60 sec) + Autofocus iOS workaround (`<input type="number" inputmode="numeric">` + `setTimeout 50ms` focus programatic, zero tap suplimentar) + The Next-Up Gaze (preview vizual cartonaș set următor în timpul rest timer auto-start, soft highlight + border glow ~1-2h Sonnet extension §29.5.5) + Friction Map V1 final touchpoint matrix.

- **3 Blockers Sprint 4.x identificate pre-launch** (vezi §34 NEW): Blocker 1 T&B Faza 2 persistence Memory Paradox bug (~50-80h trad / ~3-5h Opus, user delete entry → reload → entry RE-APARE prin Firebase pull) + Blocker 2 Firebase Rules RTDB lock (rules currently OPEN dev mode = data theft risk prod, sintaxa corectă `database.rules.json` LOCKED, sub 1h Daniel + emulator + manual publish console) + Blocker 3 D1 DEVELOPING refactor 5→6 tiers (CALIBRATION_LEVELS 0-4 → 0-5 + ID renumber + schema migration runner + Golden Master ~30+ test cases, ~8-12h trad / ~2-3h Opus).

- **GC Tombstones defer 6 luni post-launch** (vezi §35 NEW): Cloud Functions GC AMÂNAT, borna evaluare oficială 1 iulie 2027. Rationale buget zero (Firebase Spark plan free, Tombstone ~30MB / 6 luni = ~3% din 1GB), focus retention. La 1 iul 2027 Daniel decide A automation Blaze / B manual / C mai amână.

- **Investiții confirmate ZERO buget nou sesiune 2026-05-02** (vezi §31 AMENDMENT): preserved §31.1 LOCKED €500-700 worst-case primul an. Breakdown 6 luni primele ~€310-515 (Firebase free tier suficient cf §35). Toate optimizările sesiunii = CC Opus task time (zero $) + Daniel review free.

- **Status v1 templates + scope:** 8/8 LOCKED design-wise (100%) preserved. UX Colateral 16 sub-secțiuni V1 LOCKED + 3 amendamente (§29.5.5 Next-Up Gaze + §29.5.14 4 ecrane + §29.5.17/.18 NEW). F-NEW 1/2/3/4 LOCKED V1 OBLIGATORIU (NU defer). MMI + Storage Full UX OBLIGATORIU V1 (~8-10h Sonnet total). Distribution V1 + Pre-Launch V1 + Rebrand + Investiții preserved §29.6/§29.7/§30/§31. **Sesiuni chat strategic rămase pre-launch v1: 0 (ZERO).** Toate decizii LOCKED. Pre-launch V1 scope CLOSED.

- **Tests:** 888/888 PASS unchanged (chat strategic, zero code touched).

- **Bandwidth Daniel:** ~3h Daniel-time real (~35 decizii LOCKED + ~6 push-back-uri productive Claude pe sesiune). Saturation triggered preventiv anti-halucinație. Sesiune chat strategic finală pre-launch — toate scope-urile închise.

### Status update 2026-05-01 evening RESUBMIT (chat strategic Longevitate body complet + UX colateral V1 LOCKED + Distribution + Pre-Launch + Rebrand + Investiții)

- **Longevitate §29.2.6 body COMPLET RESUBMIT Option A** (vezi §29.2.6 — completat 1:1 din input nou): 13 decizii LOCKED + 3 backlog (V2 + V3+). Truncation 2026-05-02 evening REZOLVATĂ. Persona Maria 60-70 / vârstă mediană 65 (range 50-59 mobilitate ridicată + 70-75 conservatoare). Frecvență 3 sesiuni/săpt L-Mi-V min 24h pauză + Durată 35-40 min max 45 + RPE 5-7 max (Săpt 1-2 RPE 5-6 / Săpt 3-4 RPE 6-7 zile bune) zero serii eșec muscular. Periodizare Continuous + Double Progression NU toggle Lifestyle Deload (eliminat V1 — RPE-driven natural). 3 zile Full Body cu accente reale: Ziua A Stabilitate Genunchi/Șold (Sit-to-Stand + Lat Pulldown + Bird-Dog) + Ziua B Mobilitate Coloană/Umeri (Cable Pull-throughs + Wall Push-ups + Pallof Press) + Ziua C Autonomie/Plan Lateral (Lateral Step-ups + Suitcase Carry + Modified Plank). Pool exerciții V1: PERMISE Sit-to-Stand + Leg Press + RDL gantere ușoare + Cable Pull-throughs + Step-ups + Lateral Step-ups + Lat Pulldown + Wall Push-ups + Bird-Dog + Modified Plank + Pallof Press. INTERZISE BBS + Conventional Deadlift + OHP + sărituri + Floor Push-ups + Hip Thrust pe bancă + Sit-ups + Russian Twists. Progresie Reps-first Double Progression 2×8→2×10→3×12 abia după 3×12 confortabil RPE 6-7 +1 kg + reset reps 8. Mobilitate integrată Warm-up+Cool-down NU sesiuni separate. Cardio extern banner DISCRET WEEKEND 1×/săpt vineri/sâmbătă "plimbare 20 min aer liber". Soft Redirect BMI>32 + slăbire → Slăbire Majoră wording locked. Sărbătorire 2 Trepte Mastery Milestone System: A Toast micro post-set "Ai adăugat o repetare la {Nume Exercițiu}. Progres consistent!" + B Ecran elegant Alabaster post-3×12 ciclu finalizat "Ai stăpânit mișcarea {Nume Exercițiu} cu o execuție excelentă". Anti-RE strict: NU "PR" sau "Record Nou" Longevitate (Sărbătorim Măiestria Mișcării + Consecvența).

- **UX Colateral V1 LOCKED COMPLETE 15 puncte + 3 sub-sisteme** (vezi §29.5 — restructurat din 5 directional flags la 16 sub-secțiuni LOCKED): Theme Trio Obsidian/Alabaster/Carbon system-detect default (Obsidian Dark only / Alabaster Light only / Carbon Dark industrial stins, drop Neon Dojo + Iron Vault). Dynamic Share Cards layout DRY identic cross-template + branding logo Andura + andura.app discret bottom card. RO Pur Lock zero EN code-switching audit pre-launch obligatoriu (excepții RPE/BMI/kcal cu explicații). Hero Minimalist + Haptic 2 nivele (puternic majore / discret rapide) + Confetti EXCLUSIV evenimente mari (Mastery Milestone + PR + Finalizare sesiune, exclus streak markers anti-oboseală) + Design Tokens Figma → Tailwind/CSS. Cronometru auto-start inteligent + ±30s on-the-fly + audio ducking. Video MP4/WebM 3-5 sec cachare agresivă local-first + max 3 linii pași expliciți. Tab Bar Trio (Azi/Istoric/Profil) + sesiune persistentă mini-player. Local-First SQLite/IndexedDB salvare instant + sync silențios fundal. Istoric listă cronologică minimalistă (Data | Greutate | Repetări | RPE) + stea aurie/platină PR. **The Sticky Swap Engine** max 3 alternative + Sticky Last Swap memorie + 4-Swaps Rule auto-învățare program de bază update permanent. **Clean Slate Reset Engine** swap = sticky doar până final ciclu curent + Reset Săpt 1 ciclu nou + matrice Cycle Reset cross-template (4 săpt toate / 5 săpt Forță). Wording Reset Swap Toast top screen 4 sec "Început de ciclu nou. Exercițiile revin la cele inițiale". Sunete audio ducking Spotify/Apple Music + mute toggle global (haptic activ). Onboarding 5 ecrane <60 sec (Nume + Vârstă no skip + Greutate&Înălțime SKIP PERMIS median demographic prior + Experiență no skip + Obiectivul no skip). Editare Istoric 3 niveluri (24h liberă / Zile 2-7 confirmare modal / >7 zile Hard Lock). Notificări locale opt-in default OFF + Streak Saver push server max 2/săpt 4 zile fără sesiune (wording per goal Forță "aperi progresul" / Longevitate "energie").

- **Distribution Strategy V1 LOCKED** (vezi §29.6 — NEW): Hibrid Soft Launch (app live URL public andura.app + zero marketing 4 săpt + word-of-mouth + grupuri restrânse). Data lansării condiționată DoD target 1 ianuarie 2027. DoD criteria 6: 8/8 templates cap-la-cap (zero mock data) + zero bug-uri critice (Onboarding + Swap Engine + Progresie) + ToS+Privacy validated + Beta închis 4 săpt 0 crash 7 zile + app load <2 sec local + zero TODO/DEVELOPING tags. Beta Recruitment 50 testeri segmentat invite-only 4 săpt: 15 Forță r/StrongerByScience + 15 Tonifiere r/xxfitness + 10 Slăbire FB/Reddit + 5 Sănătate Generală general + 5 Longevitate Maria 60-70 FB RO grupuri 50+ (signal trecere public completion >80% + zero crash 7 zile). **Pricing OVERRIDE §3:** V1 = 100% Free Early Access NU grandfathering permanent + tranziție V2 paid (Free 8 templates + tracking simplu / Premium Swap Engine memorie persistentă + Cardio Zone 2 + Analytics + Profile Typing). Sondaj pricing săpt 4 single-shot. Targeting eliminat r/programare + r/RoFails + r/longevity (mismatch). RO storytelling-first r/Romania mama 65 + FB grupuri 40/50+ + EN technical r/StrongerByScience + r/xxfitness + r/loseit. Copywriting Bugatti Grade RO storytelling + EN technical (locked wordings). KPI primari Retention D7+D30 + Session Completion + Onboarding Dropout. Scale signals D30 >40% + Completion >75% + zero Gigel. Hard Stop D30 <20% + Completion <50% + Crash >2%. Feedback in-app email subject `[Andura V1 Feedback]` + diagnostic body + săpt 2 pop-up single-shot + ~~Discord/Slack 24h critical~~ → **Telegram Group + Topics 🐛 #Bug-Reports 24h critical** (DEPRECATED 2026-05-02 Chat D §36.53/§36.54). Code Freeze 4 săpt post-launch zero feature noi + hotfix max 12h + Semantic Versioning v1.0.x.

- **Pre-Launch Checklist V1 LOCKED** (vezi §29.7 — NEW): Legal Guardrails Draft DIY Daniel + Audit Plătit €300-500 1 lună înainte (Lawyrup.ro / Iuris.ro / Avocatoo.ro RO/EU specializate). Disclaimer medical onboarding LOCKED checkbox obligatoriu pre-generare program "Andura este aplicație de wellness și nu înlocuiește sfatul medicului". GDPR Privacy Policy locked + button Settings "Șterge contul și datele mele definitiv" hard delete real-time. ADR 020 Phase 2 Logs Rotation custom JS €0 (rulează deschidere app + măsoară DB local + >30 zile sau >10MB șterge automat). D1 DEVELOPING Refactor curățenie totală pre-launch €0 (sistem D-N izolat + curățat + testat + zero TODO/DEVELOPING tags + zero comentarii experimentale). Smoke Test 1 script `gate-launch-prod.bat` unificat (NU 8 separate): Onboarding logic Maria 65 + Marius 25 + 1 sesiune completă/template cap-la-cap toate 8 + Data Persistence + Offline + PWA Service Worker <2 sec cache offline. ADR 022 V2 Workflow Review hibrid Co-CTO 4 pași: Drafting Daniel+Claude + Claude Review scan + Daniel Approval + Final Manual Pass. DoD Final Bugatti Grade 6 criterii (8/8 + zero TODO + smoke gate + ToS+GDPR audit + Beta 0 crash + load <2 sec).

- **Rebrand SalaFull → Andura LOCKED** (vezi §30 — NEW): Numele oficial ANDURA (anduranță = rezistență/durabilitate/energie). Domeniu LOCKED andura.app €10-15/an. Rationale: 6 litere memorabil cross-language RO+EN + zero pretenție medicală (vs KinetoFit risk Colegiu Fizioterapeuți + lege 229/2014) + cross-template universal Maria/Marius/toate + SEO clean unic + meta title "Andura — Aplicație Antrenament & Fitness Corect". Rebrand Sweep Task CC Opus Dedicat (paralel altă muncă) ~5h: vault docs + cod + commits config + repo rename salafull → andura + GitHub Pages URL + email signature `[Andura V1 Feedback]`. Timing ACUM NU la 1 ian 2027 (cu cât amâni cu atât sweep mai mare 20-30h+ refactor risk post-Sprint 4.x). **Status:** decizie LOCKED, sweep = SEPARATE task post-ingest (NU în acest run).

- **Investiții LOCKED** (vezi §31 — NEW): Total worst-case primul an (1000 useri) ~€500-700. Consultanță legală €300-500 one-time + andura.app €10-15/an + Firebase Blaze €0-25/lună post-launch >1000 useri. Bootstrap-friendly. Bugatti perception cere domeniu propriu (share cards andura.app branding pierde impact dacă URL=github.io). Override estimate anterior €500-2000 → €300-500 (platforme legaltech RO/EU specializate cost real refined).

- **Status v1 templates: 8/8 LOCKED design-wise (100%) — scope V1 templates LOCKED închis.** Rămase pre-launch v1: 1 sesiune chat strategic F-NEW thresholds + ADR 022 V2 + rebrand sweep + Sprint 4.x implementation + wording Phase B/C + beta sept-dec 2026 + audit legal dec 2026 + Soft Launch 1 ian 2027.

- **Tests:** 888/888 PASS unchanged (chat strategic, zero code touched).

- **Bandwidth Daniel:** ~3-4h Daniel-time real (~50 decizii LOCKED + ~15 push-back-uri productive Claude pe sesiune). Saturation triggered preventiv anti-halucinație. Truncation pattern din 2026-05-02 evening complet rezolvat prin resubmit Option A (zero info loss preserved).

### Status update 2026-05-02 evening (chat strategic Forță & Dezvoltare + Longevitate full spec lock — closing scope V1 templates 8/8 design-wise)

- **Forță & Dezvoltare V1 LOCKED full spec** (vezi §29.2.5): 12 decizii LOCKED + 5 backlog. User profile 18-45 ani / min 6 luni sală / BMI 18.5-32 standard / 18.5-35 conditional pe ≥6 luni experiență (Marius Powerbuilder validat — filtru experiență face safety, nu BMI brut). Periodizare Linear Block 4+1 LOCKED V1, NU DUP (auto-reglare RPE NU stăpânită <12 luni experiență, ego inflation risk; DUP = backlog v2 post-12 luni Linear). Frecvență 4×/săpt (L-Ma-Jo-V) Upper/Lower split A/B. Pool exerciții V1: BBS default + Trap Bar Deadlift default + OHP, Olympic lifts + 1RM testing + Box Squat INTERZISE V1. PR Engine LOCKED: Weight PR (aceeași plajă reps, greutate mai mare vs all-time best per exercițiu+range reps) sau Rep PR (aceeași greutate, mai multe reps), engine compară vs all-time best NU vs ultima sesiune. PR display anti-RE strict: user vede DOAR coordonata reală (`Record nou la {Nume Exercițiu}: {KG} kg × {Reps} repetări`), e1RM (Brzycki/Epley) calculat exclusiv backend ASCUNS user-facing. Share Card Forță cu PR detected vs Streak fallback (Săpt 1 vs Săpt ≥2 wording-uri). Safety Banner contextual DOAR săpt 3-4 (faza Intensificare RPE 8-9) pe BBS + BBP, NU spam paternalist fiecare sesiune. Barbell Hip Thrust PERMIS Forță Ziua C (vs Slăbire majoră interzis §29.2.1) — Marius ≥6 luni experiență control motor lombo-pelvic + UI educațional onboarding card unic (pad halteră + bancă fixată/ancorată).
- **Longevitate V1 LOCKED full spec parțial — INPUT TRUNCATED** (vezi §29.2.6): 17 decizii LOCKED + 5 backlog (per metadata input, body truncat post Age guardrail 75+ secțiune). Conținut salvat 1:1 ca primit. User profile 50-75 ani standard / 75+ guardrail medic (singura excepție de la ZERO medical screening §29.3.1). Background orice (sedentar 5+ ani / ex-activ / fost sportiv). BMI 18.5-32 (peste 32 → soft redirect Slăbire Majoră dacă target slăbire declarat). Capacity efort moderată-scăzută RPE 5-7 max NU 8-9. Comorbidități typical (NU întrebate user-facing): dureri lombare, artroză genunchi, osteopenie/osteoporoză post-meno, tensiune oscilantă, ex-ACL/meniscectomie. Template construit conservative-by-default presupunând limitări. Age guardrail 75+ = ecran discret informare Bugatti tone "recomandăm să ai acordul medicului tău înainte" + buton "Înțeleg și continui" — single-question age, NU questionnaire medical. **TRUNCATION FLAG:** Onboarding routing guardrail + Parametri high-level + Periodizare + Structura sesiune + Split sesiuni + Pool exerciții + Progresie + 5 backlog items NU disponibile în input (truncat post-Rationale 75+). Daniel poate re-submit complete handover ca next ingest input pentru completare §29.2.6.
- **Sănătate Generală sub-variants 18-29 vs 30-49 = v3+ NU V1** (vezi §29.2.7): auto-reglarea RPE rezolvă diferențele biologice. Onboarding self-selection routing filtrează 25 ani athletic baseline → Tonifiere/Forță. Decizie data-driven post-launch analytics 6 luni — NU presupuneri V1.
- **Status v1 templates: 8/8 LOCKED design-wise** (7 templates designed full spec + 1 confirmed NU spargem V1 = scope V1 templates LOCKED). Rămase pre-launch v1: ADR 022 extins + distribution strategy + pre-launch checklist + consultanță legală.
- **5 UX colateral flags sesiune dedicată post-handover** (vezi §29.5 — NU lockate V1, doar idei direcționale documentate): theme trio (Obsidian default / Alabaster / Carbon, drop Neon Dojo + Iron Vault) + light mode toggle obligatoriu + dynamic share cards i18n pattern §27.3-consistent + RO pur lock zero EN code-switching + hero minimalist + haptic + confetti + design tokens.
- **Tests:** 888/888 PASS unchanged (chat strategic, zero code touched).
- **Bandwidth Daniel:** ~3-4h Daniel-time real (12 Forță + 17 Longevitate + 1 Sănătate Generală sub-variants v3+ = 30 decizii + ~10 push-back-uri productive Claude + 5 UX colateral flags). Saturation triggered preventiv anti-halucinație. **INPUT TRUNCATION evidence:** body §29.2.6 cut mid-Rationale Age guardrail — Daniel may need to resubmit complete file dacă §29.2.6 conținut full spec dorit în SSOT.

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

1. Andura timeline calibration: CC velocity 2-4 luni pre-launch beta (post-recalibration 5-10× faster)
2. Andura pre-launch sequencing locked: Sprint 1 → 2 → 3 → 4
3. Andura T&B retention 90 zile (NU forever, NU 30 zile)
4. Andura anti-RE strategy = categorical universal user-facing + engine internals ASCUNSE
5. Andura tier system SSOT: 2 axe ortogonale (engine_tier + calibration_confidence) + N axes future
6. Andura Bayesian Nutrition + Sleep = MOTOR PASIV (zero input). Apple Health Sleep deferred v1.x
7. Andura force-typing AA HIGH eliminated permanent. Backfill = automated diff 100% + 20 control samples
8. ~~Andura Sprint 4 / Wave 6 backlog NEW idei JuggernautAI~~ — **DE ȘTERS** (info time-bounded, e în handover)

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

**5 axe execution unde Andura poate câștiga (combinație):**
1. Viziune ("oricine poate")
2. Aspect (Bugatti craft + 3D anatomical Claude Design)
3. Funcționalitate (7 features cognitive integrate)
4. User friendly (categorical universal + sub 120s onboarding + anti-paternalism ABSOLUTE)
5. Fool proof (Reality Engine + AA Detection + anti-RE)

**Architecture serves these axes, NU substitutes them.** MOAT = combinația.

---

## 11. CHALKBOARD educational layer in-app — LOCKED V1.1 (~feb-mar 2027 expansion play)

**§AMENDMENT 2026-05-02 late evening:** Status timing-shift "LOCKED Sprint 4" → "LOCKED V1.1 (~feb-mar 2027 expansion play)". V1 user vrea execuție rapidă, NU chatbot education. V1.1 = expansion play, justifică ~~Pro €65/an~~ → **Elite €79/an V1.1** upgrade reason (per §36.50 Chat D LOCKED). Spec preserved 1:1 (NU rescriere), doar timing shift. Cross-ref §36.10 + §36.50.



### 11.1 Concept

Chatbot educational pentru fundamentals fitness + brand education + beginner enablement. Tone: profesor pasionat, NU textbook.

### 11.2 Architecture LOCKED

**LLM v1:** Cloudflare Workers AI free tier (Llama 3.3 70B) SAU Groq free tier.
**Backup:** Gemini 2.0 Flash, DeepSeek V3 (concern data residency China), self-host Llama Hetzner GPU ~€60/lună.

**Free tier limits:**
- Free: 5 q/zi, 30 q/lună, $0.50/lună spend cap
- ~~Pro €65/an~~ → **Standard V1 Core €59/an** (DEPRECATED 2026-05-02 Chat D §36.50): 20 q/zi, 200 q/lună, $5/lună spend cap

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

**Storage:** ~~Firestore~~ **RTDB** (per §AMENDMENT 2026-05-02 late evening — stack actual NU folosește Firestore, cf §34.2 + Q-0352/Q-0362)
**Admin dashboard:** Daniel-only, list/tag/export CSV
**Effort:** 10-16h tradițional → 1-2h Opus comprehensive

**§AMENDMENT 2026-05-02 late evening — NPS UX LOCKED:** NPS passive în Settings + 1× banner discret la 30 zile post-onboarding. NU push notification proactiv (friction Maria 65). Dismiss easy → next prompt 60 zile. Cross-ref §36.4.

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

### Velocity reinforced 2026-05-02 PRE-LAUNCH FINAL (chat strategic F-NEW LOCKED + MMI + Storage Full UX + UX Friction + 3 Blockers + GC defer)

Chat strategic ~3h Daniel-time real cu **~35 decizii LOCKED** (4 F-NEW LOCKED V1 OBLIGATORIU + 3 MMI + 3 Storage Full UX + 3 UX Friction Optimizations + 1 Friction Map V1 + 3 Blockers Sprint 4.x identificate + 1 GC defer + Investiții confirmate ZERO buget nou + 8/8 templates preserved + 16 UX sub-secțiuni preserved cu 3 amendamente) + **~6 push-back-uri productive Claude**. **Velocity rule reinforced:** chat strategic dense pre-launch closing (F-NEW LOCKED + safety mechanisms + UX optimizations + Sprint 4.x blockers identification) = ~10-12 decizii/oră Daniel-time real cu Claude push-back productive. **Pattern resolved:** F-NEW priorities din "flagged separate post-i18n" la "LOCKED V1 OBLIGATORIU" reflect maturation post-multiple chat strategic sessions. **Realist rămas pre-launch v1: ZERO sesiuni chat strategic.** Toate scope-urile design + product strategy CLOSED. Restul = pure execution: rebrand sweep + ADR 022 V2 + Sprint 4.x cluster + Beta + audit + Soft Launch.

### Velocity reinforced 2026-05-01 evening RESUBMIT (chat strategic Longevitate body complet + UX colateral V1 LOCKED + Distribution + Pre-Launch + Rebrand + Investiții)

Chat strategic ~3-4h Daniel-time real cu **~50 decizii LOCKED** (13 Longevitate body resubmit + 16 UX colateral V1 + 11 Distribution Strategy + 6 Pre-Launch Checklist + 1 Rebrand + 3 Investiții) + **~15 push-back-uri productive Claude**. **Velocity rule reinforced:** chat strategic broad-scope cross-domain (Longevitate biomechanics + UX colateral system + Distribution + Legal + Rebrand) = ~12-15 decizii/oră Daniel-time real. **Pattern resolved:** truncation 2026-05-02 evening fragility rezolvată prin resubmit Option A — zero info loss principle preserved + lesson learned: chat strategic export → handover paste flow vulnerability mitigated prin user-driven resubmit pattern (NU dependență automation pre-flight integrity check). **Realist rămas pre-launch v1: 1 sesiune chat strategic** (F-NEW thresholds + muscle_memory_index + storage full UX) — restul = ADR 022 V2 draft + rebrand sweep + Sprint 4.x implementation + wording Phase B/C + beta + audit + Soft Launch.

### Velocity reinforced 2026-05-02 evening (chat strategic Forță & Dezvoltare + Longevitate full spec)

Chat strategic ~3-4h Daniel-time real cu 30 decizii LOCKED (12 Forță & Dezvoltare + 17 Longevitate + 1 Sănătate Generală sub-variants v3+ confirmation) + ~10 push-back-uri productive Claude + 5 UX colateral flags pentru sesiune dedicată post-handover. **Velocity rule reinforced:** chat strategic dense template design (Forță periodization + PR engine + safety banners + Longevitate joint protection + age guardrail) = ~7-8 decizii/oră Daniel-time real cu Claude push-back productive. Closing scope V1 templates 8/8 design-wise. **Realist rămas pre-launch v1: 4-5 sesiuni chat strategic** (vs 5-6 estimate post-2026-05-02 morning) — sesiuni rămase: ADR 022 extins draft + distribution strategy reconsider + F-NEW thresholds + pre-launch checklist (consolidated) + post-resubmit Longevitate dacă input truncat.

**Pattern noted:** input handover truncation accidentală expune fragility in chat strategic export → handover paste flow. Mitigation backlog v3 (NU V1 priority): chat artifact size monitoring + auto-split markers + handover ingest pre-flight integrity check (line count vs metadata expected). Pentru moment, §5 Safety net FLAG pattern aplicat — input archived as-is, truncation documentat în SSOT inline + DIFF_FLAGS audit + LATEST raport prominently.

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
12. ~~**Beta tester recruitment plan** (Reddit/Discord/balene)~~ **[RESOLVED 2026-05-02 Chat D §36.47 Beta cohorts 50 manual recruit + §36.53 Telegram channel]**
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
14. ~~**Beta tester recruitment plan** segmentat per goal (Reddit/Discord/balene tech-lifter beachhead Forță + r/xxfitness aesthetic-glutes Tonifiere + r/longevity Longevitate + Mompreneur communities Slăbire).~~ **[RESOLVED 2026-05-02 Chat D §36.47 Beta cohorts 50 manual recruit (3 cohorts: Inner Circle 20 + Gigel 15 + Power-User 15) + §36.53 Telegram channel]**
15. F-NEW-1 exercise names mapping RO — strategy hibrid locked (compound mari EN industry + izolări RO).

### Updated 2026-05-02 PRE-LAUNCH FINAL — Next Steps post-F-NEW LOCKED + MMI + Storage Full + UX Friction + 3 Blockers + GC defer

**ZERO sesiuni chat strategic rămase pre-launch v1.** Toate decizii LOCKED. Pre-launch V1 scope CLOSED. Restul = pure execution.

**Imediat (priority order post pre-launch final):**

1. **Rebrand sweep CC Opus dedicat** (paralel altă muncă) — SalaFull → Andura (~5h Opus). Vault docs + cod + commits config + repo rename + GitHub Pages URL + email signature `[Andura V1 Feedback]`.

2. **CC Opus ADR 022 V2 draft consolidare totul** — §29.2.5 Forță + §29.2.6 Longevitate complet + §29.2.7 + §29.5 (toate 16 sub-secțiuni + Next-Up Gaze + Onboarding 4 ecrane + Autofocus iOS + Friction Map V1) + §29.6 Distribution + §29.7 Pre-Launch + §22 F-NEW LOCKED V1 + §30 Rebrand + §31 Investiții + §32 MMI + §33 Storage Full UX + §34 Blockers Sprint 4.x + §35 GC defer. Workflow Co-CTO 4 pași (Drafting Daniel+Claude → Claude Review scan → Daniel Approval → Final Manual Pass per §29.7.5).

**Sprint 4.x implementation cluster (priority order — Blockers FIRST):**

3. **Blocker 2 Firebase Rules RTDB lock** (~30 min Daniel + CC Opus prompt) — `database.rules.json` syntax + emulator test + manual publish console (vezi §34.2).

4. **Blocker 3 D1 DEVELOPING refactor 5→6 tiers** (~2-3h Opus + Daniel review Golden Master) — CALIBRATION_LEVELS 0-4 → 0-5 + ID renumber + schema migration runner + Golden Master ~30+ test cases (vezi §34.3 + §29.7.3).

5. **Blocker 1 T&B Faza 2 persistence** (~3-5h Opus comprehensive) — Tombstones + Branching integration + UI prompt branch resolve (vezi §34.1).

6. **PR Engine Forță** (`src/engine/prTracker.js` ~4-6h) + **Linear Block 4+1 state machine** (~3-5h) + **Safety Banner contextual săpt 3-4** (~2-3h) + **Hip Thrust UI educațional onboarding card unic** (~1-2h) + **Age guardrail 75+** (~1-2h) + **Mastery Milestone Longevitate** Toast micro + Ecran elegant (~2-3h).

7. **The Sticky Swap Engine** max 3 alternatives + Sticky Last Swap + 4-Swaps Rule auto-învățare (~6-10h) + **Clean Slate Reset Engine** + **Wording Reset Swap Toast** (~3-5h).

8. **Onboarding 4 ecrane** + **Autofocus iOS workaround** + **Editare Istoric 3 niveluri** + **Notificări locale opt-in + Streak Saver push** (~3-5h fiecare modul).

9. **F-NEW-1 i18n exerciții RO bulk batch** + Toggle EN Settings (mapping 6 + pattern reusable, vezi §22).

10. **F-NEW-2 Tier-aware progression** + Sprinter Cap modifier + Edge case Deload skip soft warning (vezi §22).

11. **F-NEW-3 Cooldown logic** 14-day rolling + 7-day zero login dual condition + Equipment 7-day rolling silent + Phase change <24h absorb (vezi §22).

12. **F-NEW-4 Banner wording** + "Folosesc varianta mea" replacement (vezi §22).

13. **MMI hibrid** lookup + boost progresie + user-controlled prompt (~3-4h Sonnet, vezi §32).

14. **Storage Full UX** 80% banner + 95% modal blocant (~4-6h Sonnet, vezi §33).

15. **The Next-Up Gaze visual highlight** (~1-2h Sonnet extension §29.5.5).

**Wording + refactor + library (post Sprint 4.x cluster):**

16. **Wording Phase B remaining (~37 strings) + Phase C (~78 strings)** — bulk batch CC Sonnet.

17. **PARAMETRIC_PROGRAMS_DESIGN.md refactor** — focusModifier (CUT/BULK/MAINTAIN) → goal field nou (forta_dezvoltare / tonifiere_definire / slabire_majora / slabire_moderata / longevitate / sanatate_generala) + sub-routing.

18. **Exercise library extension** — adăugare ~50-150 exerciții (mobility + cardio low-impact + Forță accessory + Longevitate pool: Hack Squat, Trap Bar Deadlift, Romanian Deadlift, Barbell Hip Thrust, Sit-to-Stand, Cable Pull-throughs, Lateral Step-ups, Suitcase Carry, Wall Push-ups, Bird-Dog, Pallof Press, Modified Plank, etc.).

**Long term pre-launch (timeline 8-10 luni v1, target Soft Launch 1 ian 2027):**

19. **Beta Recruitment 50 testeri segmentat** (start sept 2026, beta period oct-dec 2026) per §29.6.2.

20. **Audit legal €300-500** (1 lună înainte 1 ian 2027 = dec 2026) per §29.7.1 + §31.

21. **Soft Launch 1 ianuarie 2027** condiționat DoD per §29.7.6. 🚀

22. **1 iulie 2027 — Borna GC Tombstones** evaluare volume real Firebase + decide automation/manual/defer per §35.

**Status timeline v1:** 8/8 templates LOCKED design-wise (100%) + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers identificate + GC defer 6 luni + 0 sesiuni chat strategic rămase pre-launch + timeline 8-10 luni v1 (per amendment §1.2).

### Updated 2026-05-01 evening RESUBMIT — Next Steps post-Longevitate body + UX V1 + Distribution + Pre-Launch + Rebrand

**Imediat (priority order post-resubmit Option A executed):**

1. **Rebrand sweep SalaFull → Andura** (vezi §30) — task CC Opus dedicat SEPARATE (post acest handover ingest run). Scope: vault docs + cod + commits config + repo rename salafull → andura + GitHub Pages URL update + email signature `[Andura V1 Feedback]`. Timing ACUM (~5h CC Opus). Rationale: refactor risk crește 4-6× post-Sprint 4.x.

2. **ADR 022 V2 Goal-Driven Program Templates draft** (vezi §29.7.5 workflow Co-CTO) — extins acum cu §29.2.5 Forță complete + §29.2.6 Longevitate COMPLETE (resubmit Option A integrat) + §29.2.7 Sănătate Generală v3+ + §29.5 UX Colateral V1 LOCKED (15 puncte + Swap Engine + Reset Cycles) + §29.6 Distribution + §29.7 Pre-Launch + §30 Rebrand + §31 Investiții. 4 pași: Drafting Daniel+Claude → Claude Review scan → Daniel Approval → Final Manual Pass.

3. **Sesiune chat strategic F-NEW thresholds + muscle_memory_index + storage full UX** (singura sesiune chat strategic rămasă pre-launch v1 — fresh bandwidth obligatoriu).

**Medium term (Sprint 4.x — adjusted scope post 8/8 LOCKED):**

4. **PARAMETRIC_PROGRAMS_DESIGN.md refactor** — focusModifier (CUT/BULK/MAINTAIN) → goal field nou (forta_dezvoltare / tonifiere_definire / slabire_majora / slabire_moderata / longevitate / sanatate_generala) + sub-routing (Tonifiere 3 sub-variants, Slăbire 2 sub-variants).

5. **Exercise library extension** — adăugare ~50-150 exerciții (mobility + cardio low-impact pentru Longevitate + Slăbire majoră + Tonifiere variants pool + Forță accessory pool — Hack Squat, Trap Bar Deadlift, Romanian Deadlift haltere/gantere, Barbell Hip Thrust, Sit-to-Stand, Cable Pull-throughs, Lateral Step-ups, Suitcase Carry, Wall Push-ups, Bird-Dog, Pallof Press, Modified Plank).

6. **Sprint 4.x implementation cluster** — PR Engine Forță (`src/engine/prTracker.js` ~4-6h) + Linear Block 4+1 state machine (~3-5h) + Safety Banner contextual săpt 3-4 (~2-3h) + Hip Thrust UI educațional onboarding card unic (~1-2h) + Age guardrail 75+ (~1-2h) + Mastery Milestone Longevitate (Toast micro + Ecran elegant ~2-3h) + The Sticky Swap Engine (max 3 alternatives + Sticky Last Swap + 4-Swaps Rule auto-învățare ~6-10h) + Clean Slate Reset Engine + Wording Reset Swap Toast (~3-5h) + Onboarding 5 ecrane <60 sec (~3-5h) + Editare Istoric 3 niveluri (~3-5h) + Notificări locale opt-in + Streak Saver push (~2-3h).

7. **Wording Phase B remaining (~37 strings)** + Phase C (~78 strings) — bulk batch CC Sonnet după plan complet templates V1 LOCKED.

8. **ADR 020 Phase 2 Logs Rotation** custom JS (~2-3h) — implementare €0 + integration `coachContext.buildContext` async refactor + add logs la ROTATABLE_KEYS + getTieredLogs integration în engines (vezi §29.7.2).

9. **D1 DEVELOPING tier code refactor** (~8-12h Sprint 4 — schema migration runner ID renumber + add DEVELOPING level la `CALIBRATION_LEVELS` 0-4 → 0-5 + zero TODO/DEVELOPING tags pre-launch).

10. **Smoke Test gate-launch-prod.bat unificat** (1 script NU 8 separate) — Onboarding logic Maria+Marius + 1 sesiune completă/template (toate 8) + Data Persistence + Offline + PWA Service Worker <2 sec.

**Long term pre-launch (timeline 8-10 luni v1, target Soft Launch 1 ian 2027):**

11. **Beta Recruitment 50 testeri segmentat** (start sept 2026, beta period oct-dec 2026) — 15 Forță r/StrongerByScience + 15 Tonifiere r/xxfitness + 10 Slăbire FB/Reddit + 5 Sănătate Generală + 5 Longevitate Maria FB RO grupuri 50+.

12. **Audit legal €300-500** (1 lună înainte 1 ian 2027 = dec 2026) — Lawyrup.ro / Iuris.ro / Avocatoo.ro RO/EU specializate. Scope: disclaimer medical RO + GDPR compliance + ToS validation.

13. **Soft Launch 1 ian 2027** condiționat DoD (vezi §29.7.6) — 8/8 cap-la-cap + zero TODO + smoke gate + ToS+GDPR audit + Beta 0 crash + load <2 sec.

**Status timeline v1:** 8/8 templates LOCKED design-wise (100%) — Forță & Dezvoltare full spec + Longevitate **COMPLETE** (resubmit Option A 13 LOCKED + 3 backlog) + Tonifiere baseline + 3 sub-variants + Slăbire majoră + Slăbire moderată + Sănătate Generală baseline (sub-variants 18-29 vs 30-49 = v3+ NU V1) + ~1 sesiune chat strategic rămasă pre-launch + timeline 8-10 luni v1 (per amendment §1.2).

### Updated 2026-05-02 evening — Next Steps post-Forță & Longevitate lock

**Imediat (priority order post Forță & Dezvoltare + Longevitate full spec lock):**

1. **CONFIRMARE Longevitate completă** — input file `HANDOVER_INPUT_2026-05-02_evening.md` truncated post Age guardrail 75+. Daniel decide:
   - **Option A:** Re-submit handover input cu §29.2.6 Longevitate body complet (Onboarding routing + Parametri + Periodizare + Structura + Split + Pool + Progresie + 5 backlog) → next ingest extends §29.2.6 from inline FLAG la full spec
   - **Option B:** Accept §29.2.6 truncat ca-i (User profile + Age guardrail 75+ doar) → §29.2.6 rămâne minimal V1 spec, restul recreated în sesiune Longevitate next
   - **Recomandare Claude:** Option A dacă chat strategic export disponibil intact (zero loss preferat).

2. **ADR 022 nou Goal-Driven Program Templates extins V2** — extins acum cu §29.2.5 Forță + §29.2.6 Longevitate (post-resubmit) + §29.2.7 Sănătate Generală sub-variants v3+ + §29.5 UX colateral flags. Cross-refs PARAMETRIC_PROGRAMS_DESIGN + PRODUCT_STRATEGY_SPEC_v1 + ADR 013 §SAFETY_TRIPWIRE foundation. Daniel + Claude review draft.

3. **Sesiune chat strategic UX colateral lockate** (vezi §29.5 — 5 flags noi): theme trio + light mode toggle + dynamic share cards i18n + RO pur lock + hero minimalist + haptic + confetti + design tokens. Decizie LOCK V1 vs V1.5 vs backlog cu effort estimate.

**Medium term (Sprint 4.x — adjusted scope post Forță + Longevitate):**

4. **PR Engine implementation Forță & Dezvoltare** — `src/engine/prTracker.js` (NEW) cu Weight PR + Rep PR detection vs all-time best per (exercițiu, range reps). e1RM (Brzycki/Epley) backend exclusiv. Anti-RE strict UI display "Record nou la {Nume Exercițiu}: {KG} kg × {Reps} repetări". Estimate ~4-6h Sprint 4.x.

5. **Safety Banner contextual implementation** — săpt 3-4 (faza Intensificare) DOAR pe BBS + BBP, NU repeat fiecare sesiune. Engine state machine săpt-aware (per Linear Block 4+1 5-week cyclic). Estimate ~2-3h Sprint 4.x.

6. **Hip Thrust UI educațional onboarding card unic** — Forță Ziua C, NU repeat fiecare sesiune. Pattern reusable Bird-Dog (Slăbire majoră), Pallof Press (Slăbire moderată). Estimate ~1-2h Sprint 4.x.

7. **Linear Block 4+1 engine state machine** — 5-week cyclic phase tracking (Acumulare săpt 1-2 / Intensificare săpt 3-4 / Deload săpt 5) cu transitions automate. Phase-aware wording engine ACTION layer + Safety Banner trigger. Estimate ~3-5h Sprint 4.x.

8. **Age guardrail 75+ ecran discret implementation** — Longevitate onboarding flow detection vârstă > 75 → ecran informare medic + buton "Înțeleg și continui". Engine routing post-confirm direct Longevitate. Estimate ~1-2h Sprint 4.x.

9. **PARAMETRIC_PROGRAMS_DESIGN.md refactor** (carry-over §26-§29.2 morning + evening) — focusModifier (CUT/BULK/MAINTAIN) → goal field nou (forta_dezvoltare / tonifiere_definire / slabire_majora / slabire_moderata / longevitate / sanatate_generala) + sub-routing (Tonifiere 3 sub-variants, Slăbire 2 sub-variants).

10. **Exercise library extension** — adăugare ~50-150 exerciții (mobility + cardio low-impact pentru Longevitate + Slăbire majoră + Tonifiere variants pool + Forță accessory pool — Hack Squat, Trap Bar Deadlift, Romanian Deadlift haltere/gantere, Barbell Hip Thrust cu pad + bancă fixată).

**Long term pre-launch:**

11. **Distribution strategy reconsider** sesiune dedicată — full launch vs hand-pick balene per decizia LOCKED non-vault sesiune 2026-05-02 morning.

12. **F-NEW thresholds + muscle_memory_index + storage full UX** sesiune dedicată — decizia non-vault realist intro pre-launch obligatoriu.

13. **Wording Phase B remaining** (~37 strings dp.js / sys.js / fatigue.js / reality.js / calibration.js) + Phase C (~78 strings dashboard / weight / plan) — bulk batch CC Sonnet după plan complet templates V1.

14. **Consultanță legală tech specializată RO/EU** ToS final + Privacy Policy specific (~€500-2000, NU optional per decizia LOCKED non-vault).

15. **Pre-launch checklist obligatoriu** integrare ADR 020 Phase 2 logs rotation + D1 DEVELOPING refactor + smoke test scope + 8 templates V1 spec + safety nutrition pattern + distribution strategy.

**Status timeline v1:** 8/8 templates LOCKED design-wise (100%) — Forță & Dezvoltare full spec + Longevitate full spec (partial input, body §29.2.6 awaits resubmit dacă Option A) + Tonifiere baseline + 3 sub-variants + Slăbire majoră + Slăbire moderată + Sănătate Generală baseline (sub-variants 18-29 vs 30-49 = v3+ NU V1) + ~4-5 sesiuni chat strategic rămase pre-launch + timeline 8-10 luni v1 (per amendment §1.2).

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

- **Tests:** **888/888 PASS** (752 baseline + 52 storage ADR 020 + 13 bootstrap + 37 reconciliation + 23 i18n + 22 whyEngine - 11 legacy whyEngine = +136 cumulat) — unchanged 2026-05-02 PRE-LAUNCH FINAL (chat strategic, zero code touched)
- **HEAD origin/main:** `c9929a8` pre-ingest 2026-05-02 PRE-LAUNCH FINAL (post handover ingest 2026-05-01 evening RESUBMIT push final SHA `c9929a8`) — post-ingest 2026-05-02 PRE-LAUNCH FINAL SHAs see `📤_outbox/LATEST.md`
- **Vault docs:** **52 active** + README + VAULT_RULES + PROMPT_CC_HYGIENE + PROMPT_CC_INGEST_HANDOVER (unchanged 2026-05-02 PRE-LAUNCH FINAL). Outbox archive (audit trail, NU vault docs): `📤_outbox/_archive/2026-04/01-28` + `2026-05/29-46+` (post handover ingest 2026-05-02 PRE-LAUNCH FINAL). `cc-reports/` DEPRECATED 30 apr (folder removed, content migrated).
- **Folder count:** 9 numerotate continuu (00-08) + 📥_inbox + 📤_outbox.
- **Backup tags origin:**
  - `pre-adr-020-impl` (ADR 020 rollback)
  - `pre-handover-ingest-2026-04-30-evening-v2` (evening v2 ingest rollback)
  - `pre-sprint4-a-b-2026-04-30` (Sprint 4 A+B rollback)
  - `pre-i18n-audit-2026-05-01` (i18n audit rollback)
  - `pre-handover-ingest-2026-05-01-morning` (morning v1 ingest rollback)
  - `pre-handover-ingest-2026-05-01-morning-v2` (morning v2 ingest rollback — chat strategic wording session)
  - `pre-handover-ingest-2026-05-01-evening` (evening ingest rollback — chat strategic goal-ca-setting + 53 strings Phase B partial + 5 amendamente)
  - `pre-handover-ingest-2026-05-02` (2026-05-02 morning ingest rollback — chat strategic safety nutrition pattern + 4 templates v1 full spec + 5 amendamente noi + 3 decizii arhitecturale)
  - `pre-handover-ingest-2026-05-02-evening` (2026-05-02 evening ingest rollback — chat strategic Forță & Dezvoltare V1 LOCKED 12 decizii + Longevitate V1 LOCKED 17 decizii input partial **TRUNCATED** + Sănătate Generală sub-variants v3+ + 5 UX colateral flags backlog)
  - `pre-handover-ingest-2026-05-01-evening-resubmit` (2026-05-01 evening RESUBMIT ingest rollback — Longevitate body complet 13 LOCKED + 3 backlog Option A + UX colateral V1 LOCKED 15 puncte + Swap Engine + Reset Cycles + Wording Reset + Distribution Strategy V1 LOCKED + Pre-Launch Checklist V1 LOCKED + REBRAND SalaFull → ANDURA LOCKED + andura.app + Investiții €500-700)
  - `pre-handover-ingest-2026-05-02-pre-launch-final` (2026-05-02 PRE-LAUNCH FINAL ingest rollback — F-NEW-1/2/3/4 LOCKED V1 OBLIGATORIU + MMI hibrid LOCKED V1 + Storage Full UX 80%/95% LOCKED V1 + 3 Optimizări UX Friction LOCKED + Friction Map V1 final + 3 Blockers Sprint 4.x identificate T&B Faza 2 + Firebase Rules + 5→6 tiers + GC Tombstones defer 6 luni evaluare 1 iul 2027 + Investiții confirmate ZERO buget nou; pre-launch V1 scope CLOSED 0 sesiuni chat strategic rămase)

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

## 22. FINDINGS NOI 2026-05-01 (F-NEW-1 până la F-NEW-4) — LOCKED V1 OBLIGATORIU 2026-05-02

**Status:** Flagged inițial 2026-05-01 morning post smoke test prod. **LOCKED V1 OBLIGATORIU 2026-05-02** sesiune chat strategic pre-launch final. Toate 4 = OBLIGATORIU V1 (NU defer Sprint 1.5, NU optional). Implementation = Sprint 4.x cluster.

### F-NEW-1 — i18n EXERCIȚII RO LOCKED V1 OBLIGATORIU

**Decizie inversare regulă (Gigel Test Validated):** UI Default = RO primary universal. Toggle Settings "Afișează denumiri internaționale (EN)" implicit OFF.

**Rationale:** Beachhead RO = r/Romania storytelling-first + FB grupuri 40/50+ + mămici active. Maria 65 ani + Gigica 35 ani non-tech = zero vocabular EN fitness. Prioritate clarity utilizator non-tehnic > recognition lifter advanced.

**Lista finală traduceri UI Default (Toggle OFF) — LOCKED:**

| Original EN | Wording UI RO Default |
|-------------|----------------------|
| Romanian Deadlift | Îndreptări cu picioarele aproape drepte (RDL) |
| Lat Pulldown | Tracțiuni la helcometru |
| Bulgarian Split Squat | Genuflexiuni pe un picior, cu sprijin pe bancă (Bulgarian Split Squat) |
| Cable Row | Ramat la cablu |
| Hip Thrust | Ridicări de bazin (Hip Thrust) |
| Face Pull | Tracțiuni spre față (Face Pull) |

**Pattern reusable pentru exerciții viitoare:**
- Tipare mari mișcare tradiționale → RO complet (Genuflexiuni, Îndreptări, Împins, Ramat, Tracțiuni)
- Variații moderne/specifice cu termen industrie consacrat → RO descriptiv mecanism + EN paranteză (Hip Thrust, Bulgarian Split Squat, Face Pull, RDL)
- Termenii sală RO consacrați → RO pur fără EN paranteză (helcometru, ramat la cablu)

**Toggle Settings EN (advanced users):** User activează → UI switch la denumiri internaționale (Lat Pulldown, Bulgarian Split Squat, Hip Thrust, etc.). DB internal indexează ambele variante pentru search cross-language.

**Status:** OBLIGATORIU V1 (Beachhead RO trust + brand consistency). Implementation: bulk batch CC Sonnet `src/i18n/ro.json` `exercises.*` namespace + `t('exercises.<id>')` UI layer + Toggle Settings logic.

### F-NEW-2 — PROGRESSION SCALING TIER-AWARE LOCKED V1 OBLIGATORIU

**Matrice 3 Tiers + Sprinter Cap Modifier — Frecvență progresie per Tier (sesiuni finalizate):**

| Tier | Status | Frecvență Progresie |
|------|--------|---------------------|
| Beginner | 0-10 sesiuni | La fiecare sesiune (RPE corect toate seturile) |
| Intermediate | 11-50 sesiuni | O dată la 2-3 sesiuni (acumulare volum) |
| Advanced | 51+ sesiuni | O dată la 4-6 sesiuni (micro-periodizare) |

**Incremente greutate (Micro-loading universal default):**
- Compound (BBS, BBP, RDL, Trap Bar): +1 kg până la +2.5 kg
- Izolare (Curls, Lateral Raises): +0.5 kg sau +1 rep înainte de urcare greutate

**Sprinter Cap Modifier (Profile Type Safety Override):**

**Trigger:** `Profile Type == Sprinter` (volume creep risk + hyperfocus correlation).

**Plafonare:**
- Max Compound Increment: **1.0 kg** (în loc de 2.5 kg)
- Max Isolation Increment: **+1 rep** (în loc de +0.5 kg)

**Rationale:** Sprinter Advanced (51+ sesiuni) cu pattern volume creep + hyperfocus 8h/zi care primește +2.5kg compound = alimentezi auto-aggression. Marathon/Strategic Advanced same tier beneficiază de progresie agresivă pentru că NU are pattern risc.

**Cross-ref:** ADR Q-0231 Profile Typing influences thresholds.

**Edge Case: User Advanced sare Deload Săpt 5 — Banner Soft Warning (Bugatti tone, autonomy preserved):**

> "Săptămâna de deload a trecut neutilizată. Sesiunea de azi merge mai bine la RPE 6-7 — corpul recuperează în mișcare, nu doar în repaus."

**Behavior:** banner soft warning, user păstrează agency 100%, NU force-deload retroactiv.

**Status:** OBLIGATORIU V1 (motorul de bază al aplicației). Implementation: `progressionEngine.js` (sau echivalent) respectă `ctx.engine_tier` / `ctx.calibration_confidence` + Sprinter cap override + Deload-skip soft banner.

### F-NEW-3 — HYPERREACTIVE COACH COOLDOWN LOCKED V1 OBLIGATORIU

**Equipment Unavailable Rate-Limiting:** Threshold 3+ înlocuiri echipament în fereastră rolling 7 zile → engine învață silent.

**Behavior:**
- Sticky Last Swap activ (engine afișează direct alternativa pe sesiunea următoare)
- 4-Swaps Rule kicks in background (validate permanentizare)
- ZERO banner / notificare afișată user
- Decision background, NU blocking

**Cross-ref:** §29.5.10 Sticky Swap Engine + §29.5.11 Clean Slate Reset Engine.

**Phase Change Rate-Limiting:** Threshold 2 schimbări manuale fază (Cut → Maintain → Cut) în <24h → a 2-a absorbită silent.

**Behavior:**
- Backend update setări transparent
- Confirmare discretă: "Obiectiv actualizat."
- ZERO modal full-screen sau ecran confirmare extensiv

**Edge Case "User Pierdut" Cooldown Override — Trigger condition compus (eliminare false positives):**

1. Aderență scade <25% pe fereastră 14 zile rolling **AND**
2. 7 zile consecutive zero login app

Doar AMBELE condiții = override cooldown 21 zile + activare ecran User Pierdut.

**Wording User Pierdut LOCKED (preserved §28.2):**
> "N-ai mai trecut de ceva timp pe aici. Nu-ți face griji pentru pauză: programul de azi e configurat să te repună în mișcare fără grabă."

**Rationale:** elimină alarme false din boală/concediu temporar (user 60% aderență + boală 7 zile = 22% artificial NU = pierdut real).

**Status:** OBLIGATORIU V1 (previne erori spam vizual UI).

### F-NEW-4 — PLAN AJUSTAT BANNER WORDING LOCKED V1 OBLIGATORIU

**Wording Banner — Eliminăm complet procentaje user-facing. Anti-RE strict.**

**Banner LOCKED:**
> "Plan ajustat astăzi pentru recovery."

NU "Plan redus 30%", NU "Adherence scăzută: 0%", NU "Deviation crescut: 100%".

**Buton Override — Replacement "Override (înțeleg riscurile)" force-typing eliminat:**

**Buton LOCKED:**
> "Folosesc varianta mea"

Agency explicit user, sound mature, Bugatti tone. Zero force-typing, zero medical disclaimer style.

**Status:** OBLIGATORIU V1 (anti-RE breach prod fix + protecție legală implicită).

**Cross-refs §22 (post-LOCK 2026-05-02):** ADR 013 §Anti-RE + §20 i18n decision B + §29.5.10 Sticky Swap Engine + §29.5.11 Clean Slate Reset + ADR Q-0231 Profile Typing + §28.2 User Pierdut wording + §34 Sprint 4.x Blockers + §29.6 Distribution Beachhead RO.

**§AMENDMENT 2026-05-02 SUFLET — F-NEW-4 cross-ref §36.17 Frustrat Viață mode trigger:** Banner "Plan ajustat astăzi pentru recovery." + buton "Folosesc varianta mea" devine output-ul **Frustrat Viață mode** detectat prin trigger UI deterministic `2+ skip-uri în aceeași săpt` (per §36.17 4 Moduri UI Detection). Mode detection precedă banner display — banner NU se afișează la primul skip izolat, doar la pattern detectat. Cross-ref `01-vision/SUFLET_ANDURA.md` §3 + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT).

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

#### 29.2.5 Template: Forță & Dezvoltare (LOCKED V1 — 2026-05-02 evening)

**12 decizii LOCKED + 5 backlog items.**

**User profile target:**
- **Vârstă:** 18-45 ani (peste 45 SNC recovery scade considerabil pentru efort maximal)
- **Background:** Minimum 6 luni sală regulat (≥2×/săpt) — prerechizit obligatoriu, motor control consolidat
- **BMI:** 18.5-32 standard / **18.5-35 conditional pe ≥6 luni experiență** (Marius Powerbuilder validat — filtrul experiență face safety, nu BMI brut)
- **Sex:** ambele (skew natural Marius/Iasmina)
- **Capacity efort:** ridicată (RPE 7-9 acceptabil)

**Onboarding routing guardrail:**

```
User selectează "Forță & Dezvoltare"
       ↓
Întrebare experiență: "Câtă experiență ai în sala de forță?"
       ├── Sub 6 luni ──► Soft redirect: "Pentru început, îți recomandăm Tonifiere Echilibrat pentru a-ți pregăti tendoanele."
       └── Peste 6 luni ──► Validat. BMI extended 18.5-35 conditional. Direct pe Forță.
```

**Parametri high-level:**
- **Frecvență:** 4 sesiuni/săpt (L-Ma-Jo-V), Upper/Lower split A/B alternation
- **Durată:** 60-75 min (rest 3-5 min compuse grele)
- **RPE:** 7-9 main lifts / 7-8 accesorii
- **Obiectiv:** progressive overload pe compuse (PR tracking) + hipertrofie accesorii

**Periodizare: Linear Block 4+1 (LOCKED V1, NU DUP):**

**De ce NU DUP V1:** auto-regulation RPE NU stăpânită încă la 6-12 luni experiență (recunoaște 8 vs 6 reps RPE 8 doar prin practice). DUP = ego inflation risk. DUP = backlog v2 post-12 luni user pe Linear.

**De ce DA Linear Block 4+1:** match demograficul prerequisite + deload built-in obligatoriu = anti-burnout/injury + engine state machine simplu + predictabilitate = trust user + DRY consistency cu Slăbire moderată.

**Mecanica 5 săptămâni cyclic:**

| Săptămâni | Faza | Structură | RPE | Obiectiv |
|-----------|------|-----------|-----|----------|
| 1-2 | Acumulare (Volum) | 3 seturi × 8-10 reps | 7-8 | Adaptare musculară, consolidare tehnică |
| 3-4 | Intensificare (Forță) | 3 seturi × 4-6 reps | 8-9 | Recrutare unități motorii, **Peak PR weeks** |
| 5 | Deload obligatoriu | 2 seturi × 8 reps la 60% greutate | 6 | Refacere SNC, reset oboseală |

**Structura sesiune (60-75 min):**

```
[00-08 min] Warm-up Specific:
  - 3 min Mobilitate articulară dinamică (cercuri șold/umeri, Cat-Cow, World's Greatest Stretch)
  - 5 min Activare specifică:
    * Lower zile: Glute Bridges cu bandă, Plank activare trunchi
    * Upper zile: Band Pull-aparts, YTWL manșeta rotatorilor
  - Ramp-up Main Lift (NU contorizat în timp): 50%×5 → 70%×3 → 85%×1 → Working Sets
[08-40 min] Main Work 1: 2 Exerciții Compuse (Rest 3-5 min, RPE 7-9)
[40-65 min] Main Work 2: 3 Exerciții Accesorii (Rest 1.5-2 min, RPE 7-8)
[65-70 min] Cool-down: Stretching static ușor (default). Decompresie vertebrală opțional doar dacă grip-ul nu e epuizat.
```

**DROP din warm-up:** sărituri/plyometrics (mismatch Forță heavy — pre-fatigue glicolitică + impact articular pre-squat 140kg RPE 9).

**Split A/B alternation (4 zile):**
- **Ziua A (Luni) — Lower Body 1:** Squat pattern dominant + Hamstrings/Glutes accessory
- **Ziua B (Marți) — Upper Body 1:** Horizontal Push/Pull dominant (Chest/Back)
- **Ziua C (Joi) — Lower Body 2:** Hinge pattern dominant + Quads/Calves accessory
- **Ziua D (Vineri) — Upper Body 2:** Vertical Push/Pull dominant (Shoulders/Lats/Arms)

**Pool exerciții V1 (LOCKED):**

🚫 **Interzise V1 Forță:**
- **Olympic lifts** (Snatch, Clean & Jerk) — necesită antrenor + tehnică elită
- **1RM testing** — toate PR-urile calculate pe seturi 4-6 reps (Săpt 3-4), zero risc accidentare
- **Box Squat** — majoritatea intermediarilor nu mențin tensiunea pe cutie, comprimare lombară periculoasă

✅ **Permise V1 Forță:**

*Ziua A — Lower Body 1 (Focus Genuflexiuni):*
- Main 1 (Squat Pattern): **Barbell Back Squat (default)** sau Safety Bar Squat
- Main 2 (Unilateral/Quad): Hack Squat sau **Bulgarian Split Squat (permis ≥6 luni experiență)**
- Accessory: Seated Leg Curls, DB Calf Raises, Weighted Plank

*Ziua B — Upper Body 1 (Horizontal):*
- Main 1 (Horizontal Push): **Barbell Bench Press (default)** sau Flat DB Press
- Main 2 (Horizontal Pull): Barbell Row sau Weighted Pull-ups
- Accessory: Incline DB Press, Seated Cable Row, Face Pulls, DB Bicep Curls

*Ziua C — Lower Body 2 (Focus Îndreptări):*
- Main 1 (Hinge Pattern): **Trap Bar Deadlift (default)** sau Conventional Barbell Deadlift (toggle puristi)
- Main 2 (Hip Extension): Romanian Deadlift (halteră sau gantere)
- Accessory: Leg Extensions, **Barbell Hip Thrust (permis Forță, vezi UI/UX cerințe mai jos)**, Hanging Leg Raises

*Ziua D — Upper Body 2 (Vertical):*
- Main 1 (Vertical Push): Barbell OHP sau Seated DB Shoulder Press
- Main 2 (Vertical Pull): Weighted Pull-ups sau Lat Pulldown
- Accessory: Lateral Raises, Triceps Rope Pushdown, Hammer Curls

**PR Engine + Anti-RE strict:**

**PR definition (LOCKED V1):**
- **Weight PR:** aceeași plajă reps, greutate mai mare vs all-time best (ex: 80kg × 8 → **82.5kg × 8**)
- **Rep PR:** aceeași greutate, mai multe reps vs all-time best (ex: 80kg × 8 → 80kg × **9**)
- Engine compară vs **all-time best per (exercițiu, range reps)** — NU vs ultima sesiune
- Aceeași performanță = NU PR (ex: 80kg × 8 → 80kg × 8 = nu PR, fallback streak)

**PR display UI (Anti-RE strict):**
- User vede DOAR coordonata reală: `"Record nou la {Nume Exercițiu}: {KG} kg × {Reps} repetări"`
- e1RM (Brzycki/Epley) calculat exclusiv în backend pentru smart progression — **NU exposed user-facing**
- Rationale: Marius nu se laudă pe Insta cu "e1RM 142.5kg" ci cu kg pe bară reali. Anti-RE total + valoare psihologică tangibilă.

**Share Card Forță & Dezvoltare:**

Variabile expuse:
- `{PR_lift}`: Exercițiul + greutatea PR (ex: "Împins cu gantere 34 kg", "Îndreptări 120 kg")
- `{streak_weeks}`: Săptămâni consecutive antrenament

Logica afișare:
```
PR în această sesiune?
 ├── DA  ──► Wording PR (Moneda de schimb)
 └── NU  ──► Wording Streak (Fallback)
```

Wording RO Default:

🏆 **Caz A (PR detected):**
> "Record personal nou la {PR_lift}! Forța se construiește pas cu pas."
> Exemplu: „Record personal nou la Împins cu gantere 34 kg!"

🔄 **Caz B (Fallback streak):**
- **Săpt 1 (Start):** "Primii pași spre o versiune mai puternică. Antrenament bifat!"
- **Săpt ≥2 (Consecvență):** "Săptămâna {streak_weeks} de progres continuu. Mai puternic decât ieri."

**Safety Banner contextual (Anti-paternalism):**

**Decizie:** banner siguranță **DOAR** Săptămâni 3-4 (Faza Intensificare RPE 8-9) pe **Barbell Back Squat + Barbell Bench Press**. NU repeat fiecare sesiune.

**Wording discret:**
> "⚠️ Intri în faza de intensificare (RPE 8-9). Asigură-te că folosești pini de siguranță sau ai un spotter pentru seriile grele."

**Rationale:** Marius vede banner-ul după 2 săpt fără avertisment → atenție maximă. NU spam paternalist, alert inteligent contextual.

**Barbell Hip Thrust — UI/UX cerință specifică:**

**Permis Forță Ziua C** (vs Slăbire Majoră interzis §29.2.1):
- Marius ≥6 luni experiență = control motor lombo-pelvic + mind-muscle connection
- Fără bariere anatomice (BMI 35 max, NU 35+ obesity severe)
- Monedă progressive overload real (5-10 kg increments)
- Exercițiu ideal pentru extensia șoldului fără forfecare lombară

**UI educațional onboarding card unic (NU repeat fiecare sesiune):**
> "Asigură-te că folosești o protecție de spumă (pad) pentru halteră și că banca este bine fixată/ancorată pentru a nu aluneca în timpul execuției."

**Backlog Forță (5 items):**

V2 / Sprint 4.x (Prioritate maximă post-launch):
1. **Powerbuilder Track (BMI 32-35):** template dedicat Marius bulky — volum crescut accesorii brațe/umeri, păstrează progresia forță compuse. Cod: foarte mic effort, doar variantă template DB.
2. **DUP Advanced Track (Post-12 luni):** alternativă Daily Undulating Periodization deblocată loyal users care stăpânesc auto-reglare RPE. Cod: mediu effort, distribuție intensități în săpt.
3. **Auto-Regulated Working Weight:** ramp-up indică oboseală acută → engine ajustează greutatea de lucru -2.5-5% preventiv. NU "Auto-Regulated Deload" (RPE self-report unreliable). Detection ramp-up = signal fizic objective.

V3+ (Future Vision):
4. **Form Check Video AI:** analiză biomecanică prin cameră. Costuri API mari + liability uriașă dacă AI greșește. Doar post-scaling cu bugete mari.
5. **Auto-Regulated Deload:** descărcare adaptivă bazată pe RPE history. Necesită coexistență cu DUP + RPE tracking precis. V3+ NU V2.

Cut completely:
- **Conjugate Method (Westside-style):** prea specific powerlifteri elite echipați. Risk supra-antrenament pentru natural lifter intermediar. Zero ROI.
- **Spotter Network (social feature):** moderation/GDPR/safety nightmare. Nu suntem rețea socială, suntem coach privat.

**§AMENDMENT 2026-05-02 SUFLET — RIR Matrix Marius compus + Sanity Bounds + Outlier Filter:**
- **RIR Matrix Adaptiv** (per §36.16): Marius mișcări compuse grele (RDL/Squat/Bench) → Verbal Ușor/Potrivit/Foarte greu mapat la RIR 4-5 / 2-3 / 0. Single RIR 0 ≠ deload immediate; **3 sesiuni consecutive same lift** → micro-deload activate.
- **Sanity Bounds Per Phase** (per §36.25 Layer C): Newbie (săpt 1-8) +10% / Intermediate (săpt 8-26) +5% / Advanced (săpt 26+) +2.5%. **Hard cap absolut +20% săpt** ORICE exercițiu (anti-bug calcul/tastare). Marius Deadlift: max +10%/+5%/+2.5% per phase.
- **Outlier Filter Marius** (per §36.24): praguri ±4 reps SAU ±20% greutate. Outlier confirmed = single low day flag (CDL note, baseline UNCHANGED). 3 consecutive same exercise → baseline shift downward (per §36.26).
- Cross-ref `01-vision/SUFLET_ANDURA.md` §3 + `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT) + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT) + `03-decisions/ADR_CASCADE_DEFENSE_v1.md` (DRAFT).

#### 29.2.6 Template: Longevitate (LOCKED V1 — 2026-05-01 evening RESUBMIT Option A — COMPLETE)

**Status:** 13 decizii LOCKED + 3 backlog items (V2 + V3+). Truncation 2026-05-02 evening REZOLVATĂ prin resubmit Option A — body complet acum integrat 1:1 din `HANDOVER_INPUT_2026-05-01_evening.md` §1.

**User profile target:**
- **Vârstă:** **50-75 ani standard / 75+ guardrail medic** (singura excepție de la ZERO medical screening §29.3.1)
- **Background:** orice (sedentar 5+ ani, ex-activ, fost sportiv)
- **BMI:** 18.5-32 (peste 32 → soft redirect Slăbire Majoră dacă target slăbire declarat)
- **Capacity efort:** moderată-scăzută (RPE 5-7 max, NU 8-9)
- **Comorbidități typical (NU întrebate user-facing):** dureri lombare, artroză genunchi, osteopenie/osteoporoză post-meno, tensiune oscilantă, ex-ACL/meniscectomie
- **Template construit conservative-by-default presupunând aceste limitări**

**Age guardrail 75+ (singura excepție ZERO screening §29.3.1):**

```
User introduce vârsta: 76 ani
       ↓
Engine detectează > 75
       ↓
Ecran discret informare (Bugatti tone):
"Ne bucurăm că ești aici! Deoarece siguranța ta este prioritatea noastră, îți recomandăm să ai acordul medicului tău înainte de a începe acest program de mișcare."
       ↓
User: [Înțeleg și continui]
```

**Rationale:** ZERO medical screening preserved în spirit, dar vârstă cronologică extremă = liability serioasă. Single-question age (anul nașterii), NU questionnaire medical.

**Persona Maria (LOCKED V1):**

> "Maria, 60-70 ani (vârstă mediană 65 ani): pensionară sau încă activă. Vrea independență funcțională (urcat scări fără dureri, ridicat de pe scaun, cărat sacoșe) + protecție articulară. Range vârstă acoperă 50-59 (mobilitate ridicată) + 70-75 (mișcări conservatoare)."

**Onboarding routing (LOCKED V1):**

User selectează "Longevitate" → engine cere: (1) anul nașterii (Age guardrail 75+) + (2) experiență sport ultimii 5 ani.

**Întrebare experiență:** "Cât de activ ai fost în ultimii 5 ani?"
- Activ (mișcare/sport săptămânal)
- Ocazional (mișcare din când în când)
- Sedentar (nu am mai făcut sport de mult timp)

**Routing intern Săpt 1 (auto-calibrat baseline):**
- Sedentar: 2 seturi × 8 reps, RPE 5 (limita jos, siguranță absolută)
- Ocazional: 2 seturi × 10 reps, RPE 5-6 (baseline curat)
- Activ: 2 seturi × 12 reps, RPE 6 (start mai sus, fără plictiseală)

**Drop:** întrebare auto-percepție capacity ("urcat scări") = Gigel-suspect medical screening, contra §29.3.1 ZERO medical.

**Parametri high-level (LOCKED V1):**

- **Frecvență:** 3 sesiuni/săpt (L-Mi-V), min 24h pauză obligatorie între sesiuni
- **Durată:** 35-40 min (max 45 cu warm-up + cool-down)
- **RPE:** 5-7 max (Săpt 1-2: RPE 5-6 / Săpt 3-4: RPE 6-7 zile bune). Zero serii la eșec muscular.
- **Obiectiv:** independență funcțională + protecție articulară + bone loading sigur

**Periodizare (LOCKED V1): Continuous + Double Progression**

Eliminăm blocuri rigide. Progresie continuă săptămânală: dacă utilizatorul obosit într-o zi, alege greutate mai mică pentru a rămâne în RPE-ul zilei. **NU toggle Lifestyle Deload** (eliminat V1 — friction inutilă, contra-pattern celelalte template-uri, RPE-driven natural).

**Structura sesiune (35-40 min):**

```
[00-08 min] Warm-up: Mobilitate articulară joint-by-joint (gleznă, șold, coloană, umeri)
[08-30 min] Main Work: 4 exerciții (2 forță + 1 echilibru + 1 core)
[30-35 min] Cool-down: Stretching static ușor + respirație
```

**Split sesiune Full Body cu accente reale (LOCKED V1):**

**Ziua A — Focus Stabilitate Genunchi & Șold (Bone Loading):**
- Main 1 (Squat Pattern): Sit-to-Stand pe cutie/bancă, 2×8-12 reps RPE 5-6 (control eccentric tendoane genunchi, zero impact)
- Main 2 (Upper Pull): Lat Pulldown din șezut, 2×8-12 reps
- Balance: Single-leg Stand cu sprijin perete, 2×20 sec
- Core: Bird-Dog, 2×10 reps/parte

**Ziua B — Focus Mobilitate Coloană & Umeri (Functional Movement):**
- Main 1 (Hinge Pattern): Cable Pull-throughs, 2×10-12 reps RPE 6 (zero presiune axială)
- Main 2 (Upper Push): Wall Push-ups, 2×8-12 reps
- Balance: Tandem Walking (mers călcâi-vârf)
- Core: Pallof Press la cablu, 2×10 reps/parte (anti-rotație, protecție lombară)

**Ziua C — Focus Autonomie & Plan Lateral (LOCKED V1):**
- Main 1 (Lateral/Unilateral): Lateral Step-ups treaptă 10-15 cm, 2×8 reps/parte RPE 6 (Gluteus Medius, anti-căzături)
- Main 2 (Functional Carry): Suitcase Carry ganteră ușoară, 2×30 sec/parte (forță prindere + stabilitate trunchi, imită cărat sacoșe)
- Balance: Step-ups frontale treaptă mică sprijin perete, 2×10 reps/parte (urcat scări)
- Core: Modified Plank pe genunchi, 2×20 sec

**Diferență mecanică reală:** A = bone loading axial sigur (Sit-to-Stand) / B = mobilitate fără presiune axială (Cable Pull-through) / C = pattern lateral + carries (anti-căzături + autonomie zilnică).

**Pool exerciții (LOCKED V1):**

✅ **PERMISE:**
- *Picioare:* Sit-to-Stand cutie/bancă, Leg Press la aparat, RDL cu gantere foarte ușoare, Cable Pull-throughs, Step-ups treaptă mică sprijin perete, Lateral Step-ups
- *Push:* Chest Press la aparat din șezut, Wall Push-ups
- *Pull:* Lat Pulldown din șezut, Seated Cable Row, Face Pulls cablu, Dumbbell Row sprijin genunchi
- *Balance & Core:* Single-leg Stand sprijin perete, Tandem Walking, Bird-Dog, Modified Plank pe genunchi, Suitcase Carry, Pallof Press cablu

🚫 **INTERZISE V1:**
- Halteră grea pe spate sau de la sol: BBS, Conventional Deadlift
- Mișcări deasupra capului: OHP (impingement umăr 60+)
- Impact articular sau exploziv: sărituri, Box Jumps, Burpees, Jumping Jacks
- Coborâre completă la sol pe spate/burtă: Floor Push-ups, Hip Thrust pe bancă, Sit-ups, Russian Twists (fluctuații tensiune + stres lombar)

**Progresie (LOCKED V1): Reps-first (Double Progression)**

Greutate neschimbată câteva săpt. User progresează prin reps:
```
2×8 → 2×10 → 3×12
```
Abia după 3×12 confortabil RPE 6-7 cu tehnică perfectă → engine crește greutate +1 kg + reset reps la 8.

**Mobilitate & Flexibility (LOCKED V1):**

Complet integrată în Warm-up + Cool-down. NU sesiuni separate V1. Primele 8 min = mobilitate joint-by-joint blândă (gleznă, șold, coloană, umeri). Ultimele 5 min = stretching static ușor + respirație.

**Cardio (LOCKED V1):**

Recomandat extern (NU în template forță). Banner DISCRET WEEKEND 1×/săpt (final ultima sesiune săptămână, vineri/sâmbătă):

> "Weekend-ul acesta este un moment excelent pentru o plimbare de 20 de minute în aer liber. Mișcarea naturală îți menține inima tânără."

**Rationale:** spam zilnic = friction. 1×/săpt = îndemn weekend Bugatti-discret.

**Soft Redirect BMI > 32 + target slăbire (LOCKED V1):**

User Maria BMI 34 + target slăbire onboarding → engine redirect Slăbire Majoră (protecție articulații).

**Wording (LOCKED):**
> "Pentru obiectivul tău de slăbire, am ales un program optimizat pentru articulații sănătoase și energie zilnică. Începem blând, construim solid!"

**Sărbătorire 2 Trepte — Mastery Milestone System (LOCKED V1):**

**A. Micro-Validation (Toast Notification — eveniment mic):**
- Trigger: salt repetări aceeași greutate (2×8 → 2×10, sau 2×10 → 3×12)
- Afișare: toast discret bottom screen post-set:
> "Ai adăugat o repetare la {Nume Exercițiu}. Progres consistent!"

**B. Mastery Milestone (Ecran Elegant — eveniment mare):**
- Trigger: finalizare ciclu Double Progression (3×12 confortabil RPE 6-7)
- Afișare: ecran elegant Alabaster/Light Mode:
> "Un moment de mândrie! Ai stăpânit mișcarea {Nume Exercițiu} cu o execuție excelentă. Corpul tău devine mai stabil și mai puternic în fiecare zi."

**Anti-RE strict:** NU folosim termenii "PR" sau "Record Nou" pentru Longevitate (presiune contra independenței funcționale Maria). Sărbătorim Măiestria Mișcării + Consecvența.

**Backlog Longevitate (3 items):**

V2 (Sprint 4.x):
1. **Joint-Specific Swaps** — user bifează disconfort genunchi pre-sesiune → engine schimbă auto exercițiu
2. **Balance Progression Track** — exerciții avansate echilibru post-3 luni consecvență
3. **Cardio Zone 2 Dedicated Module** — plimbare ghidată 20-30 min cu cronometru ecran

V3+:
- **Family Share Weekly Digest** — user trimite familiei pe WhatsApp rezumat minimalist activitate, opt-in obligatoriu privacy

**Note pe metadata 2026-05-02 evening "17 decizii LOCKED + 5 backlog":** input resubmit 2026-05-01 evening contține 13 decizii LOCKED + 3 backlog. Discrepanță vs metadata anterioară (17+5) reflectă consolidare Daniel post-clarificare scope (eliminare items overlap cu §29.5 UX colateral + §29.6 Distribution care erau intercalate în chat strategic original). Conținut current = SSOT autoritativ V1 Longevitate.

#### 29.2.7 Sănătate Generală sub-variants 18-29 vs 30-49 = v3+ NU V1 (LOCKED 2026-05-02 evening)

**Decizie:** Sănătate Generală sub-variants 18-29 ani vs 30-49 ani = **v3+ NU V1**. Auto-reglarea RPE rezolvă diferențele biologice (recovery + hormonal + bone density). Onboarding self-selection routing filtrează 25 ani athletic baseline → Tonifiere/Forță (nu rămân pe Sănătate Generală). Decizie data-driven post-launch analytics 6 luni — NU presupuneri V1.

**Rationale:** Single Sănătate Generală template baseline (vezi §29.2.4) acoperă 18-49 ani maintenance default. Sub-variants prematuri V1 = scope creep + complexity zero benefit (templates 8/8 LOCKED design-wise = scope V1 templates închis). Re-evaluat post 6 luni real users analytics: dacă bifurcation real evident → split v3+, altfel keep baseline single.

**Status v1 templates LOCK:** 8/8 LOCKED design-wise (7 templates designed full spec — Slăbire majoră / Slăbire moderată / Tonifiere baseline + 3 sub-variants / Sănătate Generală / Forță & Dezvoltare / Longevitate **[partial input]** + 1 confirmed NU spargem V1 = scope V1 templates LOCKED). Rămase pre-launch v1: ADR 022 extins + distribution strategy + pre-launch checklist + consultanță legală.

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
2. **Slăbire majoră safety pattern LOCKED (MFP-style):** source autoritate medicală EXTERNĂ citată (NU "Andura recomandă") + threshold gendered conditional pe sex + engine consequence concret + user agency păstrat (soft warning + continue, NU block) + pattern reusable orice safety boundary nutrition.
3. **Legal coverage realitate:** Pattern MFP + ADR 013 SAFETY_TRIPWIRE + ToS + Privacy Policy + onboarding medical conditions = ~80-90%. Restul 10-20% = consultanță legală tech specializată RO/EU pentru ToS final + Privacy Policy specific. Cost real €500-2000 NU optional. Flag pre-launch checklist obligatoriu.
4. **Realist rămas până la launch v1:** ~5-6 sesiuni chat strategic + plan complet ÎNAINTE execuție = unlock velocity beast Opus 24-36×.
5. **Anthropic dependency risk ~0.1% acceptat.**

**Cross-refs §29:** ADR 022 propus standalone (Goal-Driven Program Templates extins cu §29) + ADR 013 §SAFETY_TRIPWIRE (foundation pattern) + §26 Goal-ca-Setting + 8 Templates v1 (extins acum cu spec full §29.2) + §27 wording rewrite (pattern reusable safety) + §28 amendamente backlog (extins §28.6-§28.10) + §29.2.5 Forță & Dezvoltare V1 LOCKED + §29.2.6 Longevitate V1 LOCKED (input partial truncat) + §29.2.7 Sănătate Generală sub-variants v3+ NU V1 + §29.5 UX colateral flags backlog.

**§AMENDMENT 2026-05-02 SUFLET — RIR Matrix Maria izolare + Sit-to-Stand max:**
- **RIR Matrix Adaptiv** (per §36.16): Maria izolare/greutate corporală (Sit-to-Stand, Wall Push-ups) → Verbal Ușor/Potrivit/Foarte greu mapat la RIR 6+ / 3-4 / 0-1. **"Foarte greu" → reduce reps (NU sets)**, păstrează min 2 sets ca prag stimulare neuro-musculară.
- **Sit-to-Stand max 12 reps/set** (per §36.25 Layer C hard cap absolute exercise-specific): cap pentru anti-supraantrenament Maria 65 audience.
- **Outlier Filter Maria** (per §36.24): praguri ±3 reps SAU ±5 kg. Outlier confirmed treatment per §36.26 (single low day flag, NOT baseline shift).
- Cross-ref `01-vision/SUFLET_ANDURA.md` §3 + `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT) + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT).

### 29.5 UX Colateral V1 LOCKED — 15 puncte + Swap Engine + Reset Cycles + Wording Reset (2026-05-01 evening RESUBMIT)

**Status:** Flagged 2026-05-02 evening (5 idei direcționale) → **LOCKED V1 COMPLETE 2026-05-01 evening RESUBMIT** (15 puncte + 3 sub-sisteme). Carry-over directional flags rezolvați: theme trio + light mode toggle + dynamic share cards + RO pur + hero minimalist toate LOCKED V1 acum.

**§AMENDMENT 2026-05-02 SUFLET — 4 Moduri UI Detection + Bias Detection prompts + Validation-Seeking toast:**
- **4 Moduri UI Detection LOCKED V1** (per §36.17): Executor / Curios+Strategic / Frustrat Tehnic / Frustrat Viață / Validation-Seeking — pure event listeners + flags state local. ZERO ML/NLP runtime.
- **Volume Creep prompt LOCKED** (per §36.18): "Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?" [Continuă] [Sunt OK fără] — friction in-moment NU blocaj autonomy.
- **Auto-pedeapsă prompt LOCKED** (per §36.19): "Setul anterior a fost validat la efort optim. Greutatea a fost redusă cu peste 20% — confirmă dacă vrei un progres conservativ sau dacă revii la baseline." [Continuă cu greutatea redusă] [Revino la baseline].
- **Validation-Seeking toast LOCKED** (per §36.17): "Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează." (trigger: scroll repetat trend grafic + stagnation 7+ zile detected).
- Cross-ref `01-vision/SUFLET_ANDURA.md` §3 + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) + `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT).

#### 29.5.1 Theme Trio (LOCKED V1)

**3 teme premium exclusiv:**
- **Obsidian** (Dark premium)
- **Alabaster** (Light elegant)
- **Carbon** (Mid-tone industrial)

**Drop:** Neon Dojo + Iron Vault (overengineering).

**Default onboarding:** System-detect (telefon Dark Mode → Obsidian / Light Mode → Alabaster).

**Switch teme:** EXCLUSIV Settings (NU onboarding). Onboarding rămâne scurt + eficient.

**Identitate vizuală completă:** NU toggle generic Light/Dark deasupra. Obsidian = Dark only. Alabaster = Light only. Carbon = Dark industrial stins.

#### 29.5.2 Dynamic Share Cards (LOCKED V1)

**Layout DRY identic cross-template** (PR Forță / Mastery Longevitate / Streak / Sesiune End). Schimbă DOAR conținut text + date afișate per goal.

**Branding:** logo Andura + andura.app discret bottom card (semnătură fină brand lux, NU reclamă stridentă).

**Opt-in pe button distribuire:** NU toggle Settings dezactivare. User vrea privacy → nu apasă share button.

#### 29.5.3 RO Pur Lock — Zero EN Code-Switching (LOCKED V1)

**Audit complet pre-launch obligatoriu:** task CC Opus dedicat scan all .js/.html/.md user-facing.

**Excepții permise (acronime tech industry-standard):** RPE, BMI, kcal. Adaug explicații contextuale UI prima afișare.

**Exerciții traduse complet RO UI:** "Genuflexiuni cu haltera pe spate" (NU Barbell Back Squat), "Împins din culcat cu haltera" (NU Bench Press). EN labels DB hidden pentru search/internal logic.

#### 29.5.4 Hero Minimalist + Haptic + Confetti + Design Tokens (LOCKED V1)

**Hero onboarding:** fotografie abstractă/premium + tipografie impecabilă. **Drop Lottie + line-art** (ieftin, îmbătrânesc rapid). Static, elegant, curat.

**Haptic 2 nivele:**
- Puternic: momente majore (final set, final sesiune)
- Discret micro-vibration: acțiuni rapide (button tap, toggle change)

**Confetti EXCLUSIV evenimente mari:**
- Mastery Milestone Longevitate
- PR nou Forță
- Finalizare sesiune Sănătate Generală + Slăbire

**Exclus de la confetti:** streak markers (3 zile, 7 zile, 30 zile) — anti-oboseală vizuală.

**Design Tokens formal system:** Figma export → Tailwind/CSS variables. Toate culori + spațiere + fonturi exportate. Garantează consistență vizuală + extensibilitate fără rescriere stil.

#### 29.5.5 Cronometru & Pauze (LOCKED V1)

**Auto-start inteligent:** timer pauză pornește automat la bifare set finalizat (zero friction extra button).

**Ajustare on-the-fly:** butoane rapide ±30s direct ecran activ cronometru.

**Haptic discret final:** vibrație scurtă + sunet premium clopoțel stins. NU întrerupe muzica de fundal user (audio ducking).

**AMENDMENT 2026-05-02 — The Next-Up Gaze (preview vizual în timpul pauzei):**

Behavior: la pornire rest timer (auto-start §29.5.5 deja LIVE), ecran scoate în evidență discret cartonașul setului următor.

Visual treatment:
- Soft highlight / puls vizual pe cartonaș next set
- Folosește deja `ps-rec-kg` / `ps-rec-reps` existent în `restTimer.js`
- CSS animation + border glow subtle (NU flashy)

Rationale: user își trage sufletul → știe exact ce încarcă pe bară la secunda 0 a setului următor. Zero scroll, zero scanare vizuală.

Effort: ~1-2h Sonnet (extension §29.5.5 existing).

#### 29.5.6 Video & GIF Exerciții (LOCKED V1)

**Format:** MP4/WebM looping comprimat. Clipuri ultra-scurte 3-5 sec, fără sunet, unghi clar (diagonală/lateral).

**Cachare agresivă (Local-First):** la pornire program, descarcă fundal toate clipurile săptămânii respective. Subsol sală fără semnal → videourile pornesc instant.

**Pași expliciți sub video:** max 3 linii scurte text execuție corectă (ex: "1. Pieptul sus, spatele drept. 2. Coboară până la 90°. 3. Împinge în călcâie.").

#### 29.5.7 Tab Bar Navigation (LOCKED V1)

**Trio minimalist (3 tab-uri):** Azi (antrenament zilei) / Istoric (calendar + progres) / Profil (setări + obiective).

**Sesiune persistentă:** când user începe antrenament, ecran execuție prioritar. Iese accidental → mini-player vizibil top screen, antrenament rămâne activ fundal. Date NU se pierd niciodată.

#### 29.5.8 Local-First Architecture (LOCKED V1)

**Salvare locală timp real:** fiecare set bifat + greutate introdusă → salvată instant SQLite/IndexedDB local.

**Sync silențios fundal:** verifică periodic conexiune. Detectează ieșire zonă fără semnal → trimite date server fundal, NU blochează interfață.

#### 29.5.9 Istoric & Vizualizare Progres (LOCKED V1)

**Listă cronologică minimalistă:** eliminăm grafice complexe (greu citit telefon). Format: Data | Greutate | Repetări | RPE.

**Repere vizuale PR:** antrenamente cu PR marcate discret cu mică stea aurie/platină. Validare vizuală rapidă.

#### 29.5.10 The Sticky Swap Engine (LOCKED V1)

**Swap rapid alternative:** ecran execuție lângă fiecare exercițiu → button discret "Înlocuiește". User primește max 3 alternative directe (același tipar mișcare).

**Sticky Last Swap:** user înlocuiește Hack Squat cu Leg Press marți → joia viitoare Ziua A → engine afișează direct Leg Press cu indicator vizual "Înlocuit anterior".

**Auto-învățare 4-Swaps Rule:** dacă user face același swap 4× consecutiv în cadrul aceluiași ciclu → notificare discretă in-app:
> "Am observat că preferi {Nume Exercițiu Nou}. Vrei să îl setăm ca exercițiu principal în programul tău?"

User accept → program de bază update permanent. Refuz → rămâne mod swap temporar.

#### 29.5.11 Clean Slate Reset Engine (LOCKED V1)

**Persistență swap pe ciclu curent:** orice swap = sticky doar până final ciclu curent.

**Reset Săpt 1 ciclu nou:**
- Toate swap-urile temporare șterse
- Program revine la structura originală (baseline oficial)
- User re-decide swap-uri în noul ciclu

**Matrice Cycle Reset cross-template:**

| Modul | Durată Ciclu | Mecanică Periodizare | Reset Swap |
|-------|--------------|----------------------|------------|
| Sănătate Generală | 4 săpt | Continuous Baseline | Săpt 1 ciclu nou |
| Longevitate | 4 săpt | Continuous + Double Progression | Săpt 1 ciclu nou |
| Slăbire (Maj/Mod) | 4 săpt | Habit & Load Consistency | Săpt 1 ciclu nou |
| Tonifiere | 4 săpt | Cumulative Volume Progression | Săpt 1 ciclu nou |
| Forță & Dezvoltare | 5 săpt | Linear Block 4+1 (Deload inclus) | Săpt 1 ciclu nou (Săpt 6 reală) |

#### 29.5.12 Wording Reset Swap (LOCKED V1)

**Tip afișare:** Toast minimalist top screen, doar prima sesiune Săpt 1 ciclu nou, dispare singur 4 sec.

**Wording oficial:**
> "Început de ciclu nou. Exercițiile revin la cele inițiale — le poți înlocui din nou dacă ai nevoie."

**Rationale:** "exerciții" universal (acoperă aparate + bodyweight) + "le poți înlocui" leagă direct UI button "Înlocuiește" + zero jargon "baseline".

#### 29.5.13 Sunete & Ghidaj Audio (LOCKED V1)

**Respect player extern:** NU pause Spotify/Apple Music/YouTube. Sunete app (clopoțel pauză) → audio ducking peste muzica fundal.

**Mute toggle global:** 1 toggle Settings oprește toate sunetele app, lasă feedback haptic activ.

#### 29.5.14 Onboarding Flow (LOCKED V1 — AMENDMENT 2026-05-02: 5 → 4 ecrane disclaimer integrat)

**Max 4 ecrane colectare date (<45 sec — economie 1 ecran întreg):**
1. Nume
2. Vârstă (no skip — Age guardrail 75+ critical safety)
3. Greutate & Înălțime (**SKIP PERMIS** — engine folosește median demographic prior din synthetic database dacă skip)
4. Experiență ultimii 5 ani (no skip — calibrare program safety) **+ Obiectivul principal cu disclaimer integrat**

**Arhitectură ecran 4 final (disclaimer medical mutat din ecran dedicat):**
- Heading: "Care e obiectivul tău principal?"
- 3 opțiuni mari obiective (Forță / Slăbire / Longevitate / etc.)
- Sub opțiuni: checkbox cu wording §29.7.1 LOCKED:
  > "Înțeleg că Andura este o aplicație de wellness și nu înlocuiește sfatul medicului. Mă antrenez pe propria răspundere."
- Buton "Generează programul" disabled până checkbox bifat

**Fără Skip pe critical (vârstă + experiență + obiectiv):** generează risk major accidentare dacă lipsesc.

**Impact:** Onboarding total <45 sec (vs <60 sec anterior). Economie 1 ecran întreg.

**§AMENDMENT 2026-05-02 SUFLET — T1+ Completion-Based Unlock + 3 Câmpuri Gigel-Validated:**
- **T1+ unlock = completion-based, NU calendar** (per §36.21): Trigger = **4 sesiuni de antrenament finalizate complet** după T0 onboarding (ecranele 1-4). Self-paces — Marius 7-10 zile (4×/săpt), Maria 14-21 zile (3×/săpt). Skip permis "Mai târziu" → re-afișare discret peste 14 zile.
- **T1+ câmpuri minim 3 Gigel-validated** (per §36.22): (1) Istoric greutate medie 3-6 luni (numeric), (2) Activitate zilnică [Sedentar/Activ/Foarte activ], (3) Istoric nutrițional [Da/Nu/Nu știu sigur]. **NO jargon "deficit caloric" / "dietă restrictivă"**. "Nu știu sigur" critical option → engine calibrare conservativă.
- Cross-ref `01-vision/SUFLET_ANDURA.md` §3.

#### 29.5.17 Autofocus Tastatură Numerică — iOS Workaround (LOCKED V1 — NEW 2026-05-02)

**Implementation:**
- `<input type="number" inputmode="numeric">` pe câmpuri Vârstă/Greutate/Înălțime
- Workaround iOS Safari: focus programatic via `setTimeout 50ms` la mount component (`useEffect` / `onMount`)

**Rationale:** iOS Safari blochează `autofocus` standard post-page-load anti-spam. setTimeout 50ms = pattern industry tested.

**Impact:** zero tap suplimentar pe ecrane numerice.

#### 29.5.18 Friction Map V1 Final (LOCKED 2026-05-02)

| Touchpoint | Nivel V1 |
|------------|----------|
| Onboarding | 🟢 Ultra-Low (4 ecrane <45s + disclaimer integrat) |
| Input măsurători | 🟢 Ultra-Low (autofocus + iOS workaround) |
| Pauze între seturi | 🟢 Zero (auto-start §29.5.5 LIVE + Next-Up Gaze) |
| Editare istoric | 🟡 Medium justified (3 niveluri, integritate progresie) |
| Storage Full 95% | 🔴 High justified (zero data loss silent) |
| Disclaimer medical | 🟡 Medium justified (legal coverage) |
| MMI prompt 6+ luni | 🟡 Medium justified (1× per viața app, agency) |

#### 29.5.15 Editare Istoric (LOCKED V1)

**3 niveluri:**
1. **Editare liberă (24h):** modificare orice parametru direct Istoric, fără barieră.
2. **Editare cu confirmare (Zilele 2-7):** modal discret salvare:
   > "Modifici o sesiune din trecut. Ești sigur? Acest lucru va recalcula progresia pentru săptămânile următoare."
3. **Hard Lock (după 7 zile):** date complet înghețate, integritate progresie engine.

#### 29.5.16 Notificări (LOCKED V1)

**Reminder antrenament zilnic = NOTIFICARE LOCALĂ (Opt-in):**
- Generată telefon, NU server
- Default OFF
- User activează Settings sau final onboarding: "Vrei să îți amintim când e timpul pentru mișcare?"

**Streak Saver = NOTIFICARE PUSH SERVER:**
- Trigger: 4 zile fără sesiune
- Wording per goal:
  - Forță: "E timpul să îți aperi progresul"
  - Longevitate: "O scurtă sesiune de mișcare îți va reda energia"

**Limita STRICTĂ:** max 2 notificări push externe/săpt total. Telefon user rămâne curat.

**Cross-refs §29.5:** §27 wording rewrite filter Bugatti (voice unitar) + §29.2.5 Share Card Forță (PR vs streak fallback) + §29.2.6 Mastery Milestone Longevitate (Anti-RE strict NU "PR") + §30 Rebrand andura.app branding share cards + onboarding §26.4 Q1+Q1.5 conditional flow.

---

## 29.6 Distribution Strategy V1 LOCKED (2026-05-01 evening RESUBMIT)

### 29.6.1 Launch Type & Date

**Hibrid Soft Launch:**
- App live URL public andura.app
- Zero marketing 4 săpt
- Promovare exclusiv word-of-mouth + grupuri restrânse testare

**Data lansării:** condiționată DoD (NU fixă). **Target:** 1 ianuarie 2027 (8 luni timeline original §1.2 amendment).

**DoD criteria:**
1. 8/8 templates implementate cap-la-cap (zero mock data)
2. Zero bug-uri critice (Onboarding + Swap Engine + Progresie)
3. ToS + Privacy validated + integrate onboarding
4. Beta închis 4 săpt: 0 crash ultimele 7 zile
5. Performance: app load <2 sec local
6. Cod curat: zero TODO/DEVELOPING tags

### 29.6.2 Beta Recruitment

**Beta închis invite-only pre-Soft Launch.**

**Eșantion 50 testeri segmentat:**
- 15 × Forță (Reddit r/StrongerByScience)
- 15 × Tonifiere (r/xxfitness)
- 10 × Slăbire (Facebook/Reddit lifestyle change)
- 5 × Sănătate Generală (general)
- 5 × Longevitate (Maria 60-70 ani — recrutare Facebook RO grupuri 50+ stil viață sănătos + cunoștințe extinse)

**Durată Beta:** 4 săpt.

**Signal trecere public:** completion rate sesiune >80% ultima săpt + zero crash/blocaj date 7 zile.

### 29.6.3 Pricing Strategy

**V1 = 100% Free Early Access (FĂRĂ grandfathering permanent).**

**Wording transparență prima deschidere V1:**
> "Andura este acum în faza de Early Access (V1) și este complet gratuită pentru toți utilizatorii care ne ajută să o perfecționăm. La lansarea versiunii V2, toți utilizatorii activi vor trece la abonamentul Premium, beneficiind de un discount special de membru fondator."

**Tranziție V2 paid:**
- Free: 8 templates de bază + tracking simplu progres
- Premium: Swap Engine automatizat memorie persistentă + Cardio Zone 2 Guided Walks + Analytics detaliat per grupă musculară + Profile Typing avansat

**Sondaj pricing săpt 4 single-shot:** "Ce funcție ți-ar plăcea să vezi în Andura Premium?"

**Note vs §3 pricing existent:** §3 Founding Members €60 lifetime + Pro €65/an = positioning "SensAI for Android" pre-rebrand. **§29.6.3 OVERRIDE 2026-05-01 evening RESUBMIT:** V1 = 100% Free Early Access NU pricing tier-based la launch. Pricing tier-based DEFERRED V2 cu grandfathering Founding Members discount post-Free. Decision Daniel: bootstrap-friendly + community-first + zero friction launch + signal "merge" pre-revenue commitment.

**§AMENDMENT 2026-05-02 Chat D — Pricing Strategy FINAL LOCKED V1 (Override §29.6.3 RESUBMIT + §3 + §1.3 PRODUCT_STRATEGY):**

V1 launch NU mai e "100% Free Early Access" — pricing tier-based **direct la launch** per Chat D LOCKED. Reframing:
- **Founding V1 (cap 50):** €39/an LOCKED 3 ani + 34% perpetual permanent post-Anul 4 (per §36.50 + §36.51 + §36.52). Beta cohort §36.47.
- **Standard V1 Core:** €59/an (sub SensAI €65). Motorul deterministic local-first complet (per §36.50).
- **Elite V1.1 (Lansare Martie 2027):** €79/an. Core V1 + Snapshot Gated Consultation Claude API (per §36.50).

Auto-close mechanic la 50 Founding (per §36.52). NU "Free Early Access" anterior — Founding €39/an = signal commercial commitment + dogfooding + social proof primii 50.

Wording UI Plată Beta LOCKED Gigel test (per §36.51): *"Devino Membru Fondator pentru doar €39/an. Prețul tău rămâne blocat în primii 3 ani, iar ulterior păstrezi o reducere permanentă de 34% pe viață, indiferent cât de mult va crește prețul Andura."*

**Cross-refs:** §36.50 Pricing tiers + §36.51 Locked-In Guarantee + §36.52 Cap 50 Auto-Close + §36.46 Pricing Strategy Deferred Pre-Launch (now resolved Chat D) + §36.47 Beta cohorts + §1.3 PRODUCT_STRATEGY_SPEC §AMENDMENT 2026-05-02 Chat D DEPRECATED block.

### 29.6.4 Targeting Beachhead

**Eliminat:** r/programare + r/RoFails + r/longevity (mismatch audience).

**RO:**
- **r/Romania:** storytelling-first, story sincer Building in Public (mama 65 ani, biomecanică safety, solo dev 8 luni)
- **Facebook grupuri:** stil viață sănătos peste 40/50 ani + mămici active (empatic, fără jargon tehnic)

**EN:**
- **r/StrongerByScience:** validare matematică Linear Block + Double Progression + RPE
- **r/xxfitness:** Tonifiere feminin + simplitate UX
- **r/loseit:** Slăbire majoră/moderată + protecție articulații (eliminare impact)

**Copywriting Bugatti Grade RO storytelling:**
> "Am petrecut ultimele 8 luni și sute de ore de codare pentru a rezolva o problemă reală: mama mea are 65 de ani și vrea să se miște corect, fără să își distrugă spatele. Nicio aplicație de pe piață nu era destul de sigură pentru ea. Așa că am construit eu una, de la zero, bazată pe biomecanică și pe un algoritm de siguranță absolută. Este gratuită, fără reclame, și vreau să o dau oricui vrea să își ajute părinții sau să se antreneze corect."

**Copywriting Bugatti Grade EN technical:**
> "Solo developer building local-first training engine (zero server processing, max privacy) using Double Progression + RPE auto-regulation. Eliminates programming errors for longevity + strength. Sharing architecture (ADRs) + code for free Early Access testing."

**Efect viral organic:** share cards user-generated (Marius PR Insta + Maria Mastery Milestone WhatsApp familie) → useri noi pre-calificați + trust mare.

### 29.6.5 KPI & Signals

**KPI primari (zilnic):**
- Retention D7 + D30
- Session Completion Rate
- Onboarding Dropout Rate

**Scale signals ("merge bine, accelerăm marketing"):**
- Retention D30 >40%
- Session Completion >75%
- Zero Gigel Test failures (rutare corectă obiective)

**Hard Stop signals ("oprim totul, refacem"):**
- Retention D30 <20%
- Session Completion <50%
- Crash/Error Rate >2%

### 29.6.6 Feedback Loops

**Canal in-app email:** Profil/Settings → button "Trimite feedback / Raportează o problemă" → deschide email client cu subiect pre-completat `[Andura V1 Feedback]` + diagnostic body (model telefon + OS + ID anonim).

**Feedback active săpt 2:** users finalizează 2 săpt antrenament → pop-up discret single-shot:
> "Cum a fost prima ta lună cu Andura? Spune-ne părerea ta printr-un mesaj scurt."

**Centralizare:** ~~Discord/Slack channel echipă~~ → **Telegram Group + Topics 🐛 #Bug-Reports** (DEPRECATED 2026-05-02 Chat D §36.53/§36.54) — response 24h pe critical.

### 29.6.7 Code Freeze + Hotfixes

**Code Freeze 4 săpt post-launch:** zero feature noi. Toate idei → Backlog V2. 100% timp dedicat bug fixes + stabilitate + performance.

**Hotfix strategy:** bug blocker (crash salvare set) → fix producție max 12h. Semantic Versioning: v1.0.1, v1.0.2.

**Cross-refs §29.6:** §1.2 Distribution strategy amendment timeline 8-10 luni + §3 Pricing existing (overridden launch by §29.6.3) + §6 Scope locked + §29.5.14 Onboarding flow + §29.7 Pre-Launch Checklist + §30 Rebrand andura.app.

---

## 29.7 Pre-Launch Checklist V1 LOCKED (2026-05-01 evening RESUBMIT)

### 29.7.1 Legal Guardrails — Draft DIY + Audit Plătit

**Draft inițial Daniel:** ToS + Privacy Policy + disclaimer medical, folosind modele Local-First + industrie fitness.

**Audit final plătit (1 lună înainte 1 ian 2027):** €300-500 avocat tech RO/EU prin platforme legaltech (Lawyrup.ro / Iuris.ro / Avocatoo.ro).

**Scope audit:**
- Verificare disclaimer medical RO (exonerare răspundere civilă accidentare)
- GDPR compliance (Local-First + Firebase sync + drepturi user — Right to be forgotten + Data access)
- Validare ToS (clauze fără interpretări juridice periculoase)

**Disclaimer medical onboarding (LOCKED):**
> "Înțeleg că Andura este o aplicație de wellness și nu înlocuiește sfatul medicului. Mă antrenez pe propria răspundere."

Checkbox obligatoriu pre-generare program.

**GDPR Privacy Policy (LOCKED):**
> "Datele tale nu părăsesc telefonul tău decât pentru backup securizat. Nu vindem, nu procesăm și nu analizăm datele tale în scopuri comerciale."

+ button Settings "Șterge contul și datele mele definitiv" (hard delete real-time toate DB-uri).

**Note vs decizia LOCKED non-vault 2026-05-02 morning §29.4:** anterior estimat €500-2000 consultanță legală. **§29.7.1 OVERRIDE 2026-05-01 evening RESUBMIT:** €300-500 prin platforme legaltech RO/EU (mai ieftin, scope mai bine definit Draft DIY + Audit Plătit pattern). Bootstrap-friendly preserved.

### 29.7.2 ADR 020 Phase 2 Logs Rotation

**Implementat pre-launch Daniel custom JS script (€0):**
- Rulează la fiecare deschidere app
- Măsoară dimensiune DB locală
- Logs >30 zile sau >10MB → șterge automat
- Telefon user rămâne curat, memoria nu se încarcă

**Cross-ref:** §16 ADR 020 Storage Tiering Phase 1 LIVE prod + Phase 2 backlog (~2-3h Opus, blocat de `coachContext.buildContext` async refactor).

### 29.7.3 D1 DEVELOPING Refactor

**Curățenie totală pre-launch (€0):**
- Sistem routing D-N izolat complet
- Curățat + testat
- Production: zero TODO/DEVELOPING tags
- Zero comentarii experimentale

**Cross-ref:** D1 din §5 RESOLVED ADD DEVELOPING tier 6 nivele canonical + Sprint 4 implementation ~8-12h trad.

### 29.7.4 Smoke Test — Gate Global Production

**1 script `gate-launch-prod.bat` (NU 8 separate):**
1. Onboarding logic: simulează Maria 65 + Marius 25 (validare routing template)
2. 1 sesiune completă/template: rulează cap-la-cap toate 8 programe
3. Data Persistence + Offline: simulează deconectare → date rămân localStorage → sync Firebase reconectare
4. PWA Service Worker: load <2 sec din cache offline

### 29.7.5 ADR 022 V2 Workflow Review

**Workflow hibrid Co-CTO:**
1. **Drafting:** Daniel (Product Owner) + Claude (Co-CTO) generează ADR 022 V2 cu §29.2.5 Forță + §29.2.6 Longevitate complet + §29.2.7 + §29.5 + §29.6 + §29.7
2. **Claude Review:** scan draft pentru neconcordanțe ADR 013 + PARAMETRIC schema + edge cases nerezolvate
3. **Daniel Approval:** analizează raport Claude + corecții + approve merge SSOT
4. **Final Manual Pass:** Daniel cap-la-cap review întregul vault pre-codare

### 29.7.6 DoD Final Bugatti Grade

```
[ ] 8/8 Templates implementate cap-la-cap (zero mock data)
[ ] Cod curat: zero TODO/DEVELOPING tags + funcții neterminate
[ ] Smoke gate production rulat cu succes pe toate 8 templates
[ ] ToS + GDPR adaptate manual + audit avocat €300-500 + integrate onboarding
[ ] Beta închis 4 săpt: 0 crash-uri ultimele 7 zile
[ ] Performance: app load <2 sec local
```

**Cross-refs §29.7:** §29.6 Distribution Strategy DoD criteria + §16 ADR 020 + §5 D1 DEVELOPING + §29.4 decizia legală reconsiderată + §30 Rebrand sweep + ADR 022 V2 cross-ref.

---

## 30. Rebrand SalaFull → Andura LOCKED (2026-05-01 evening RESUBMIT)

### 30.1 Decision

**Numele oficial: ANDURA** (de la "anduranță" — rezistență, durabilitate, energie pe termen lung).

**Domeniu LOCKED:** `andura.app` (€10-15/an).

### 30.2 Rationale

- **6 litere** memorabil cross-language (RO + EN identic)
- **Zero pretenție medicală** (vs KinetoFit/FormaKineto = risk Colegiu Fizioterapeuți + lege 229/2014)
- **Cross-template universal:** Maria (Longevitate vitalitate) + Marius (Forță rezistență) + toate goalurile
- **SEO clean:** unic, controlul brand 100% din ziua 1
- **Meta title sugerat:** "Andura — Aplicație Antrenament & Fitness Corect"

### 30.3 Rebrand Sweep — Task CC Opus Dedicat (paralel cu altă muncă)

**Task scope:** vault docs + cod + commits config + repo rename salafull → andura + GitHub Pages URL update + email feedback signature `[Andura V1 Feedback]`.

**Timing:** ACUM (NU la 1 ian 2027). Rationale: cu cât amâni, cu atât sweep mai mare. Acum ~5h CC Opus. Post-implementare 8 templates + Sprint 4.x = 20-30h+ refactor risk + double naming gândire Daniel + beta testeri sept-dec primesc brand final.

**Status:** Decizie LOCKED 2026-05-01 evening RESUBMIT. Rebrand sweep = SEPARATE task (NU în acest handover ingest run). Daniel rulează prompt CC dedicat post-ingest.

**Cross-refs §30:** §29.5.2 Dynamic Share Cards branding andura.app + §29.6 Distribution copywriting Andura wording + §29.7.5 ADR 022 V2 Workflow + §31 Investiții (€10-15/an domeniu).

---

## 31. Investiții LOCKED (2026-05-01 evening RESUBMIT)

### 31.1 Total estimate primul an

| Item | Cost | When |
|------|------|------|
| Consultanță legală tech RO/EU (audit) | €300-500 one-time | 1 lună înainte 1 ian 2027 |
| Domeniu andura.app | €10-15/an | ACUM |
| Firebase Blaze plan (scaling progressive) | €0-25/lună | Post-launch dacă >1000 useri activi |
| **Total worst-case primul an (1000 useri):** | **~€500-700** | |

### 31.2 Rationale

Bootstrap-friendly. Bugatti perception cere domeniu propriu (share cards branding "andura.app discret jos" pierde impact dacă URL = github.io).

**Note vs estimate anterior 2026-05-02 morning §29.4:** Anterior consultanță legală €500-2000. **§31.1 OVERRIDE 2026-05-01 evening RESUBMIT:** €300-500 prin platforme legaltech RO/EU specializate (Lawyrup.ro / Iuris.ro / Avocatoo.ro). Cost real refined post-research piață legaltech.

**AMENDMENT 2026-05-02 — Breakdown 6 luni primele post-launch:**

| Item | Cost | Status |
|------|------|--------|
| Consultanță legală tech RO/EU | €300-500 one-time | Decembrie 2026 (1 lună înainte launch) |
| Domeniu andura.app | €10-15/an | ACUM (paralel rebrand sweep) |
| Firebase Blaze plan | €0-25/lună | Post-launch DOAR dacă >1000 useri activi |
| **Total realist primele 6 luni** | **~€310-515** | Firebase free tier suficient cf §35 GC defer |
| **Total worst-case primul an (1000 useri)** | **~€500-700** | Per §31.1 LOCKED |

**Cheltuieli ZERO Sesiunea 2026-05-02:** Toate optimizările sesiunii (F-NEW + MMI + Storage Full + UX Friction + 3 Blockers + GC defer) = CC Opus task time (zero $) + Daniel review free.

**Cross-refs §31:** §29.7.1 Audit Plătit + §30 Rebrand andura.app + §29.6 Distribution Strategy + §3 Pricing (V2 paid post-Free Early Access cf §29.6.3) + §35 GC defer 6 luni evaluare 1 iul 2027 condition Firebase Blaze upgrade.

**§AMENDMENT 2026-05-02 late evening — Legal Budget Stage 1+2 + Barter Avocat:**

| Stage | Cost | When |
|-------|------|------|
| Stage 1 ACUM | €0-50 | Templates ToS + Privacy Policy din avocatnet.ro / termene.ro adaptate manual cu Claude Opus pentru date sănătate Articolul 9 GDPR. Checkbox consimțământ separat onboarding (NU "accept toate"). |
| Stage 2 dec 2026 pre-launch | €200-400 | Review 1h cu avocat tech RO via Lawyrup.ro / Iuris.ro / Avocatoo.ro. NU full audit, doar review documente existente Stage 1. |
| **Total realist** | **€200-450** | (vs €300-500 §31.1 LOCKED) — sub bugetul existent |

**Barter avocat opțiune:** Daniel propune barter avocat prieten schimb Pro lifetime free pentru review legal real. NU obligatoriu plătit. Caut activ în beta period. Cross-ref §36.3 + §36.13 Beta-launch ASAP strategy.

---

## 32. Muscle Memory Index (MMI) LOCKED V1 (NEW 2026-05-02)

### 32.1 Algorithm Hibrid (Lookup + Boost)

**Formula:**
```
Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup
```

**Tabel multiplicatori + boost progresie:**

| Durată Pauză | Multiplicator Pornire | Boost Progresie (primele 3 săpt) |
|--------------|----------------------|-----------------------------------|
| 6-12 luni | 0.80× | 1.25× |
| 12-24 luni | 0.70× | 1.10× |
| 24+ luni | 0.60× | 1.00× (start proaspăt) |

**Rationale:** păstrăm peak_pre_pause ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare).

### 32.2 Threshold Trigger — User-Controlled

**6+ luni pauză → prompt user prima deschidere app:**

> "Vrei să reîncepem treptat, de unde ai rămas, sau preferi să o luăm de la zero?"

**Rationale:** anti-paternalism + agency 100%. NU hardcoded 6 luni rule, NU pre-pause-aware automatic. User decide.

### 32.3 UI Wording Re-engagement

**Wording LOCKED (Bugatti Tone):**
> "Pauza face parte din drum. Începem treptat — corpul tău își amintește."

**Comportament:**
- Opțional refusable
- User refuză → engine încarcă greutățile maxime istorice
- Banner discret avertizare risc accidentare la refuse (NU modal blocant)

**Status:** OBLIGATORIU V1 (~3-4h Sonnet implementare). Justified V1 inclusion: Maria post-operație șold revine după 8 luni = primii useri ajung iulie 2027, gap v1.5 risk reputational.

**Cross-refs §32:** ADR 009 calibration tiers + ADR Q-0231 Profile Typing + §29.5.16 Notificări (re-engagement push) + §28.2 User Pierdut wording (cooldown override) + §22 F-NEW-3 cooldown logic.

---

## 33. Storage Full UX Alert LOCKED V1 (NEW 2026-05-02)

### 33.1 Threshold 80% Capacitate (~80MB)

**Banner discret săptămânal (NU blocant):**
> "Spațiul aplicației se umple. Vrei să păstrezi istoricul vechi în cloud sau să-l exporți pe dispozitiv?"

**Buttons disponibile:**
- Exportă datele (JSON local download)
- Află mai multe despre Cloud (Pro upgrade info)
- Închide

**Frecvență afișare:** 1× pe săptămână până user acționează sau atinge 95%.

### 33.2 Threshold 95% Capacitate (~95MB) — Modal Blocant

**Modal blocant (NU se închide fără acțiune directă):**

User trebuie să aleagă explicit una din 3:
- [ ] Descarcă istoricul (Export JSON local)
- [ ] Activează modul Cloud (Upgrade Pro)
- [ ] Șterge automat datele mai vechi de 180 zile (Alegere definitivă)

**Rationale:** ZERO data loss silent. User informat explicit ce se întâmplă, alegerea = consimțământ documentat. Industry standard (Apple/Google Photos, Dropbox) — niciodată data loss fără confirm.

### 33.3 Edge Case Free User 95% Refuză Toate

**Soluție:** Cap Pro upgrade prompt 1×/săpt + auto-rotate >180 zile DOAR DACĂ user a ales explicit "Șterge automat" în modal blocant 95%.

**Status:** OBLIGATORIU V1 (~4-6h Sonnet). Justified V1 inclusion: primii power users ating 80MB ~6-12 luni post-launch, gap v1.5 risk crash silent prod.

**Cross-refs §33:** ADR 020 Storage Tiering Phase 1 LIVE + §29.7.2 ADR 020 Phase 2 Logs Rotation custom JS €0 + §29.6.3 Pricing V1 Free Early Access vs V2 Premium Cloud + §29.5.8 Local-First Architecture SQLite/IndexedDB.

**§AMENDMENT 2026-05-02 SUFLET — Cross-ref §36.23 Android Eviction:** Sync Validation pre-close session (separate concern dar similar mecanism). Înainte tap "Termină sesiunea" → app validate sync Firebase RTDB; sync fail → ecran sumar "Datele tale nu au fost încă salvate în cloud..." Vezi §36.23 + ADR 020 Storage Tiering.

**§AMENDMENT 2026-05-02 late evening — §33.2 Suprimare în Sesiune Activă LOCKED V1:**

Modal blocant 95% **suprimat dacă `session.status === 'active'`** — NU întrerupe utilizatorul mid-set. Resoluție prin 3 triggers comportamentale modal amânat:

1. **End of Session** (tap "Termină sesiunea") — modal afișat post-save.
2. **Fresh Open** (`onResume` / pornire proaspătă cu storage 95% AND zero sesiune activă) — modal afișat la deschidere.
3. **Abandoned Session** (4h inactivity → engine consideră sesiune abandonată + auto-save silent state curent → modal afișat la următoarea interacțiune user).

Flag `suppressStorageAlert` exclusiv in-memory state pe durata sesiunii active (NU localStorage). Crash recovery via câmp dedicat schema IndexedDB sesiune activă. ZERO cod în spec (comportamental only). Cross-ref §36.7.

---

## 34. Blockers Sprint 4.x Identified Pre-Launch (NEW 2026-05-02)

### 34.1 Blocker 1: T&B Pattern Faza 2 — Memory Paradox Bug

**Status:** PARTIAL FIX 2026-05-02 (Memory Paradox hotfix shipped) — full T&B Faza 1+2 remains a dedicated batch.

**§AMENDMENT 2026-05-02 (Sprint 4.x Batch B):**

Correction to prior wording: SSOT anterior afirma "ADR 021 Faza 1 LIVE doar algorithm core" implicând că o scaffolding T&B persistence layer există în cod. Verificat via `grep -rn "appendEvent\|reduceEvents\|tombstone\|TOMBSTONE\|branchConflict\|tnb_pattern" src/` (Batch A audit 2026-05-02): **ZERO matches**. Singura componentă T&B-related în `src/` era `src/engine/calibrationReconciliation.js` care implementează ADR 021 (calibration_state reconciliation), NOT [[TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC]] event-sourcing.

Faza 1 (event-sourcing layer cu `appendEvent` + `reduceEvents` + parallel-write shadow) **nu fusese implementată** anterior Batch B. Implementarea Faza 2 atop missing Faza 1 era inverted-dependency.

**Hotfix scope shipped Batch B Task 2 (commit `a23bf49`):**
- `src/util/tombstones.js` — minimal localStorage soft-delete tombstone schema, `deleteEntry()` wrapper, `applyTombstoneFilter()` + `applyTombstoneFilterToAll()` invoked from `syncFromFirebase` post-merge.
- 22 tests including the canonical Memory Paradox regression scenario (delete → simulate Firebase pull → tombstone filter → entry stays gone).
- 90-day retention (manual GC via `window.gcTombstones()`; auto-GC deferred per §35).
- Patches the user-visible bug: delete entry → reload → entry RE-APARE through Firebase pull.

**Full T&B Faza 1+2 status — STILL DEFERRED:**
- Event-sourcing API (`appendEvent` + `reduceEvents`) NOT shipped.
- Branching = când 2 devices scriu simultan același parentId → preservare ambele branch-uri + UI prompt "varianta A sau B?" — NOT shipped.
- Estimat dedicated Opus batch: 50-80h trad / **10-15h Opus comprehensive** (revised up from prior 3-5h estimate which under-scoped the parallel-write shadow + reduction layer + UI prompt).
- Recommended sequence: dedicated batch post current Sprint 4.x cluster, post Daniel Auth Migration dogfood verification.

**Cross-refs:** ADR 011 amendment §Firebase sync + ADR 021 §Implementation phasing Faza 2 + COGNITIVE_ARCHITECTURE_SPEC §Q9 + 04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md + Batch B raport `📤_outbox/LATEST.md` + 05-findings-tracker/FINDINGS_MASTER.md (SF-B).

### 34.2 Blocker 2: Firebase Rules RTDB Lock

**Status:** HARD BLOCKER pentru V1.

**Context:** Firebase rules currently OPEN (`allow read, write: if true`) per ADR 007 dev. Production launch cu rules open = oricine scrie `users/{anyUid}/coach-decisions` = data theft + mass corruption.

**Cum se rezolvă:** Daniel rulează prompt CC Opus dedicat pentru generare `database.rules.json` (RTDB syntax, NU Firestore — stack actual NU folosește Firestore + NU folosește Firebase Storage).

**Sintaxa corectă LOCKED:**

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    }
  }
}
```

**Workflow:** Daniel testează local cu Firebase emulator → publică manual în consolă Firebase. Sub 1h total.

**Cross-refs:** ADR 007 + Q-0352 + Q-0362 (RTDB NU Firestore).

### 34.3 Blocker 3: D1 DEVELOPING Refactor 5→6 Tiers

**Status:** HARD BLOCKER pentru V1.

**Context:** ADR 009 amendment 2026-04-30 evening = SSOT 6 nivele (DEVELOPING ID 2 inserted). Cod actual `src/engine/calibration.js` rulează încă 5 nivele (CALIBRATION_LEVELS 0-4). ADR 021 Faza 1 reconciliation pre-declares 6 nivele forward-compat, DAR consumer integration blocked până refactor cod.

**Cum se rezolvă:** task CC Opus dedicat Sprint 4.x — generare completă cod + teste + script migrare schema (existing users tier numeric → mapping nou cu DEVELOPING ID 2 inserted). Daniel intervine doar la final pentru review + rulare suite Golden Master.

**Effort estimate:** ~8-12h trad / ~2-3h Opus comprehensive.

**Scope refactor:**
- `CALIBRATION_LEVELS` enum 0-4 → 0-5 cu ID renumber
- Schema migration runner pentru users existenți pre-migration
- Update toate testele care reference levels (~30+ test cases)
- Engine consumers care folosesc tier comparisons (`>=`, `<` operators)
- Anti-regression Golden Master Suite

**Cross-refs:** §29.7.3 D1 DEVELOPING Refactor LOCKED V1 + ADR 009 amendment + §5 D1 RESOLVED ADD DEVELOPING tier.

### 34.4 §AMENDMENT 2026-05-02 SUFLET — Sprint 4.x Scope Extended cu Suflet Andura Implementation Cluster

Sprint 4.x scope V1 implementation cluster extended cu (per §36.16-§36.27):
- **RIR Matrix Adaptiv** (per §36.16): handler verbal feedback Ușor/Potrivit/Foarte greu → RIR numeric per (Profil × Categorie). Effort ~2-3h Opus.
- **4 Moduri UI Detection** (per §36.17): event listeners + flags state local (Executor / Curios+Strategic / Frustrat Tehnic / Frustrat Viață / Validation-Seeking). Effort ~2-3h Opus.
- **Bias Detection Observabilă** (per §36.18+§36.19): Volume Creep prompt + Auto-pedeapsă prompt. Effort ~2h Opus.
- **T1+ Onboarding Completion-Based** (per §36.21+§36.22): unlock 4 sesiuni + 3 câmpuri Gigel-validated + skip "Mai târziu" 14 zile. Effort ~2h Opus.
- **Android Eviction Sync Validation** (per §36.23): pre-close session sync validate. Effort ~1h Opus.
- **Outlier Filter Profile-Aware** (per §36.24+§36.26): praguri per (Profil × Categorie) + ASK pattern + 1 izolat ≠ baseline shift, 3 consecutive → shift. Effort ~2-3h Opus.
- **Cascade Defense 4 Layers** (per §36.25): schema validation + confidence INTERNAL + sanity bounds per phase + global cap +20% săpt + runtime invariant checks. Effort ~3-4h Opus.

**Total estimate Suflet Andura cluster:** ~14-18h Opus comprehensive (~2-3h wall-clock). Self-contained, codificabil direct fără dependencies externe.

**Cross-refs:** `01-vision/SUFLET_ANDURA.md` + 5 ADR drafts în `03-decisions/` + §36.16-§36.27.

---

## 35. Tombstones GC Defer 6 luni Post-Launch (NEW 2026-05-02)

### 35.1 Decizie LOCKED

**Cloud Functions Tombstone GC = AMÂNAT primele 6 luni post-launch.**

**Borna evaluare officială:** **1 iulie 2027** (exact 6 luni post Soft Launch 1 ian 2027).

### 35.2 Rationale (Bugatti Grade Buget Zero)

- **Zero efort dezvoltare:** Daniel NU pierde timp scriind/testând script GC (risc ștergere date valide accidental)
- **Fără costuri suplimentare:** Cloud Functions necesită upgrade Firebase Blaze plan. Rămânem pe planul gratuit Spark = risc financiar zero
- **Spațiu suficient cu margin:** RTDB free tier Spark = 1GB storage + 10GB/lună download. Tombstone ~50-100 bytes JSON × 50 deletes/user/lună × 1000 useri × 6 luni = ~30MB total = ~3% din 1GB
- **Focus retention:** Daniel conservă energie pentru retention metrics + stabilitate + UX, NU manual ops lunare

### 35.3 La 1 Iulie 2027

Daniel verifică volume real Firebase consolă + decide între:
- **A:** Implementare automată Cloud Functions GC (upgrade Blaze plan, ~€0-25/lună post-launch)
- **B:** Continuare manual cleanup script Daniel 1×/lună (cost zero)
- **C:** Mai amână GC dacă volume rămâne sub 5% capacitate

**Cross-refs §35:** ADR 011 amendment §Firebase sync (90 zile retention) + §31 Investiții (Firebase Blaze condition) + §34.1 T&B Faza 2 persistence (Tombstones generated by Sprint 4.x implementation).

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

**Sesiune 2026-05-02 evening LOCK (chat strategic Forță & Dezvoltare + Longevitate full spec — closing scope V1 templates 8/8 design-wise). 30 decizii LOCKED (12 Forță & Dezvoltare V1 + 17 Longevitate V1 input partial **TRUNCATED** + 1 Sănătate Generală sub-variants v3+ confirmation NU V1) + ~10 push-back-uri productive Claude + 5 UX colateral flags pentru sesiune dedicată post-handover (NU lockate V1). FORȚĂ & DEZVOLTARE V1 LOCKED FULL SPEC (§29.2.5): 18-45 ani min 6 luni sală + BMI 18.5-32 standard / 18.5-35 conditional pe ≥6 luni experiență (Marius Powerbuilder) + Linear Block 4+1 LOCKED V1 NU DUP (auto-reglare RPE NU stăpânită <12 luni) + 4 zile L-Ma-Jo-V Upper/Lower split A/B + Pool exerciții V1 (BBS default + Trap Bar Deadlift default + OHP, Olympic lifts + 1RM testing + Box Squat INTERZISE V1) + PR Engine all-time best per (exercițiu, range reps) Weight PR / Rep PR + e1RM Brzycki/Epley backend ASCUNS user-facing anti-RE strict + Share Card PR vs Streak fallback + Safety Banner contextual săpt 3-4 BBS+BBP NU spam paternalist + Hip Thrust permis ≥6 luni cu UI educațional onboarding card unic. LONGEVITATE V1 LOCKED 17 DECIZII PER METADATA (§29.2.6 INPUT TRUNCATED — body §29.2.6 disponibil doar User profile + Age guardrail 75+ ecran discret informare medic, restul Onboarding routing + Parametri + Periodizare + Structura + Split + Pool + Progresie + 5 backlog items missing — Daniel resubmit complete handover input pentru completare §29.2.6 inline). SĂNĂTATE GENERALĂ SUB-VARIANTS v3+ NU V1 (§29.2.7): auto-reglarea RPE rezolvă diferențele biologice 18-29 vs 30-49 + onboarding self-selection routing 25 ani athletic baseline → Tonifiere/Forță + decizie data-driven post-launch analytics 6 luni. STATUS V1 TEMPLATES: 8/8 LOCKED design-wise (100%) — scope V1 templates LOCKED închis. 5 UX COLATERAL FLAGS (§29.5): theme trio Obsidian/Alabaster/Carbon (drop Neon Dojo+Iron Vault) + light mode toggle + dynamic share cards i18n pattern §27.3-consistent + RO pur lock zero EN code-switching + hero minimalist + haptic + confetti + design tokens. 888/888 unchanged. Bandwidth Daniel ~3-4h Daniel-time real saturation triggered preventiv anti-halucinație. Realist rămas pre-launch v1: ~4-5 sesiuni chat strategic. Next: ADR 022 extins V2 cu §29.2.5+§29.2.6+§29.2.7+§29.5 + sesiune UX colateral lock V1 vs V1.5 vs backlog (priority RO pur audit + theme trio) + sesiune Longevitate resubmit dacă §29.2.6 body complet dorit + sesiune distribution strategy reconsider + sesiune F-NEW thresholds.**

**Sesiune 2026-05-02 LOCK (chat strategic safety nutrition + templates v1 full spec). 19 decizii LOCKED (7 safety nutrition + 4 templates V1 designate / 5 design units cu Tonifiere expanded + 5 backlog v2/Sprint 4.x + 3 arhitecturale colaterale) + 12+ push-back-uri productive Claude. SAFETY NUTRITION PATTERN COMPLET (§29.1): kcal floor 1200F/1500M static gendered (NIH+EFSA) + protein floor 1.6 g/kg dynamic (ISSN) + surplus optimization >0.5%/săpt engine internal + hidratare DROP safety. Pattern reusable: 2 nivele soft warning ZERO Hard Wall, agency 100%, threshold L2 = 3 zile consecutive (pattern detection NU fiziologie speculative), authority asymmetry NIH+EFSA kcal vs ISSN protein INTENȚIONAT documentat. 4 TEMPLATES V1 FULL SPEC (§29.2): Slăbire majoră (>15kg, 3×/săpt low-impact, recumbent bike LISS) + Slăbire moderată (<15kg, 4×/săpt Push/Pull split A/B, RDL hinge protection) + Tonifiere baseline + 3 sub-variants (4×/săpt, Echilibrat 50/50 / Lower 70/30 Gigica / Upper 70/30 Marius, BBS+BBP+Olympic+1RM+Russian Twists eliminate) + Sănătate Generală (3×/săpt Full Body NU split, 18-49 maintenance default). 5 amendamente backlog Sprint 4.x noi (§28.6-§28.10): Secondary Check >25% deficit + Seated Core Override Slăbire majoră + LISS ramp-down + Exercise Substitution System ADR + Tonifiere Advanced Track 5-day. 3 decizii arhitecturale colaterale (§29.3): ZERO întrebări medical screening onboarding (Gigel test catastrofal) + engine routing Slăbire majoră conservative-by-default + Anti-RE strict thresholds engine internal. Status v1: 5/8 templates lockate (62.5%) — rămase Forță & Dezvoltare + Longevitate. ~5-6 sesiuni chat strategic rămase pre-launch v1. 888/888 unchanged. Bandwidth Daniel ~15-20% — handover triggered preventiv. Next: ADR 022 extins cu §29 + sesiune Forță & Dezvoltare template (fresh bandwidth obligatoriu) + sesiune Longevitate template + sesiune distribution strategy reconsider.**

**Sesiune 2026-05-01 evening RESUBMIT LOCK (chat strategic Longevitate body complet Option A + UX colateral V1 LOCKED 15 puncte + Distribution Strategy V1 LOCKED + Pre-Launch Checklist V1 LOCKED + REBRAND SalaFull → ANDURA LOCKED + andura.app + Investiții ~€500-700). ~50 decizii LOCKED + ~15 push-back-uri productive Claude. **TRUNCATION 2026-05-02 EVENING REZOLVATĂ** prin resubmit Option A — body §29.2.6 acum COMPLETE (zero info loss restored). LONGEVITATE V1 LOCKED COMPLETE (§29.2.6 — 13 decizii LOCKED + 3 backlog V2/V3+): Persona Maria 60-70 vârstă mediană 65 (range 50-59 mobilitate ridicată + 70-75 conservatoare) + 3 sesiuni/săpt L-Mi-V 35-40 min RPE 5-7 max + Continuous + Double Progression NU Lifestyle Deload toggle + 3 zile Full Body cu accente reale (A Stabilitate Genunchi/Șold + B Mobilitate Coloană/Umeri + C Autonomie/Plan Lateral) + Sit-to-Stand + Cable Pull-throughs + Lateral Step-ups main lifts + Reps-first Double Progression 2×8→2×10→3×12 + Mobilitate integrată Warm-up+Cool-down + Cardio extern banner DISCRET WEEKEND 1×/săpt + Soft Redirect BMI>32+slăbire → Slăbire Majoră + Sărbătorire 2 Trepte Mastery Milestone (Toast micro + Ecran elegant) Anti-RE strict NU "PR" Longevitate. UX COLATERAL V1 LOCKED COMPLETE (§29.5 — 15 puncte + 3 sub-sisteme: theme trio Obsidian/Alabaster/Carbon system-detect default + dynamic share cards branding andura.app + RO pur lock zero EN audit pre-launch + Hero minimalist + haptic 2 nivele + confetti EXCLUSIV evenimente mari + Design Tokens system + cronometru auto-start + video MP4/WebM cachare local-first + tab bar trio Azi/Istoric/Profil + sesiune persistentă mini-player + Local-First SQLite/IndexedDB + istoric listă cronologică + **The Sticky Swap Engine 4-Swaps Rule auto-învățare** + **Clean Slate Reset Engine matrice cycle reset** + Wording Reset Swap toast + sunete audio ducking + onboarding 5 ecrane <60 sec + editare istoric 3 niveluri + notificări locale opt-in + Streak Saver max 2 push/săpt). DISTRIBUTION STRATEGY V1 LOCKED (§29.6): Hibrid Soft Launch andura.app + zero marketing 4 săpt + DoD criteria target 1 ian 2027 + Beta 50 testeri segmentat invite-only 4 săpt + **Free Early Access NU grandfathering V1 (override §3 pricing)** + Targeting RO storytelling-first + EN technical r/StrongerByScience+r/xxfitness+r/loseit + KPI Retention D7/D30 + Hard Stop signals + Feedback in-app email `[Andura V1 Feedback]` + Code Freeze 4 săpt post-launch + Hotfix max 12h. PRE-LAUNCH CHECKLIST V1 LOCKED (§29.7): Legal DIY + Audit Plătit €300-500 + Disclaimer medical onboarding + GDPR Privacy Policy + ADR 020 Phase 2 + D1 DEVELOPING refactor + gate-launch-prod.bat unificat + ADR 022 V2 Workflow Co-CTO + DoD 6 criterii. REBRAND SALAFULL → ANDURA LOCKED (§30): nume oficial ANDURA (anduranță) + andura.app €10-15/an LOCKED + 6 litere RO+EN + zero pretenție medicală + cross-template universal + sweep ACUM ~5h CC Opus paralel altă muncă (vault docs + cod + commits + repo rename + GitHub Pages URL + email signature) — sweep = SEPARATE task post-ingest. INVESTIȚII (§31): Total ~€500-700 primul an (consultanță legală €300-500 + andura.app €10-15/an + Firebase Blaze €0-25/lună post-launch >1000 useri). 888/888 unchanged. Bandwidth Daniel ~3-4h Daniel-time real saturation triggered preventiv anti-halucinație. Status V1: 8/8 templates 100% LOCKED design-wise. **Realist rămas pre-launch v1: 1 sesiune chat strategic** (F-NEW thresholds + muscle_memory_index + storage full UX). Next: rebrand sweep CC Opus dedicat ACUM + ADR 022 V2 draft cu §29.2.5+§29.2.6 COMPLETE+§29.2.7+§29.5+§29.6+§29.7+§30+§31 + sesiune F-NEW thresholds + Sprint 4.x implementation cluster (PR Engine + Linear Block + Safety Banner + Hip Thrust + Age guardrail + Mastery Milestone + Sticky Swap Engine + Clean Slate Reset + Onboarding 5 ecrane + Editare Istoric + Notificări) + wording Phase B/C bulk Sonnet + Beta sept-dec 2026 + audit legal dec 2026 + Soft Launch 1 ian 2027.**

## 36. Decizii LOCKED 2026-05-02 late evening (Gemini cross-check + Beta-launch ASAP) (NEW 2026-05-02 late evening)

**Source:** Sesiune chat strategic 2026-05-02 late evening — recovery halucinație handover chat anterior "Acasă" + 12 decizii LOCKED extracted din Gemini 3 cross-check + Batch A Sprint 4.x autonomous run COMPLETE PartialComplete + Batch B autonomous run COMPLETE 2026-05-02 (1110/1110 tests, 9 commits, vezi `📤_outbox/_archive/2026-05/48_LATEST_PREVIOUS_BATCH_A.md` archive).

**Cross-check provenance:** Daniel a rulat cross-check Gemini 3 cu specs Andura completă (7 dimensiuni). Output ~40% valid push-back, ~40% deja addressed în SSOT, ~20% halucinație/wrong context. Sesiunea 2026-05-02 late evening a tratat 4 puncte impact real + 5 product cleanup carry-over → 12 decizii LOCKED.

### 36.1 TWA Google Play V1 LOCKED

**Decizie:** Distribuție V1 = Google Play Store via TWA (Trusted Web Activity) wrapper, NU pure PWA Chrome install banner.

**Rationale:** Maria 65 + Gigica 35 instinct merge la Play Store, NU "Add to Home Screen" Chrome menu (80% abandonment friction). Trust signal Play Store = critic Beachhead RO.

**Cost:** €25 one-time Google Play developer account + ~1 zi setup CC Opus (Bubblewrap CLI generate AAB + listing Play Console + Digital Asset Links verification).

**Bonus avantaje:** reviews + rating social proof + updates frontend instant fără re-submit Play Store + listing SEO Google search "fitness app Romania" + crash reporting Google Play Console gratuit + Open Testing track Beta 50 invite-only sept 2026 direct Play Store internal testing.

**Cross-refs:** §29.6 Distribution Strategy V1 + §31 Investiții AMENDMENT 2026-05-02 late evening (€25 one-time TWA dev account adaugat la Stage 2 budget).

### 36.2 Android-only PWA Confirmed LOCKED

"SensAI for Android" positioning preserved (§29.6.3). Zero competiție directă cu SensAI iOS-only. iOS Safari ITP eviction IndexedDB problem = irelevantă (cancel finding Gemini #3).

**Cross-refs:** §29.6.3 Pricing V1 Free Early Access + §29.5.8 Local-First Architecture + §10 Differentiation.

### 36.3 Buget Legal Stage 1+2 + Barter Avocat LOCKED

**Stage 1 ACUM (€0-50):** Templates ToS + Privacy Policy free din avocatnet.ro / termene.ro adaptate manual cu Claude Opus pentru date sănătate Articolul 9 GDPR. Checkbox consimțământ separat onboarding (NU "accept toate").

**Stage 2 dec 2026 pre-launch (€200-400):** Review 1h cu avocat tech RO via Lawyrup.ro / Iuris.ro / Avocatoo.ro. NU full audit, doar review documente existente Stage 1.

**Total realist:** €200-450 (vs €300-500 §31.1 anterior). Sub bugetul existent.

**Barter avocat opțiune:** Daniel propune barter avocat prieten schimb Pro lifetime free pentru review legal real. NU obligatoriu plătit. Caut activ în beta period.

**Cross-refs:** §31 §AMENDMENT 2026-05-02 late evening + §36.13 Beta-launch ASAP strategy.

### 36.4 NPS Feedback System UX LOCKED

NPS passive în Settings + 1× banner discret la 30 zile post-onboarding. NU push notification proactiv (friction Maria 65). User accesează Settings → tab Feedback → tap NPS rating 1-5 + comment opțional. Engine afișează 1× banner discret la deschidere app la 30 zile post-onboarding ("Ne ajuți cu un feedback?") — dismiss easy. Dismiss = next prompt 60 zile.

**Tactical fix implementare:** §12 Feedback System spec zicea "Storage: Firestore" — stack actual e RTDB NU Firestore (cf §34.2 + Q-0352/Q-0362). CC Opus la implementation va folosi RTDB. §12 §AMENDMENT 2026-05-02 late evening aplicat.

### 36.5 Indicator Mișcare Monocromatic Theme-Aware LOCKED V1

(Q-0434 amendment) — Eliminăm orice culoare stridentă (săgeată verde/albastră contrastantă tip tutorial YouTube = friction Bugatti). Trecem la indicator monocromatic minimalist adaptat temei active.

**Mecanică vizuală:**
- Săgeată discretă, linii fine (Thin Stroke), integrată paleta theme activ
- Tema Obsidian (Dark Mode): săgeată albă semitransparentă (60% opacitate)
- Tema Alabaster (Light Mode): săgeată charcoal semitransparentă
- Subtle motion blur effect între poziția START și END (pur vizual elegant, NU săgeată didactică)

**Cross-refs:** §29.5 UX colateral V1 LOCKED (§29.5.13 video MP4/WebM cachare local-first) + theme trio Obsidian/Alabaster/Carbon (§29.5.6).

### 36.6 Wording 4 Elemente Fix Exerciții LOCKED V1

**Format standardizat 4 elemente:**
1. **Pornești** (poziționarea inițială corp + echipament)
2. **Coborâre / Tracțiune** (faza excentrică sau concentrică)
3. **Revenire** (întoarcere poziție start)
4. **Atenție critică** (siguranță articulară pentru prevenire accidentări)

**Exemplu Bulgarian Split Squat:**
> "Pornești stând în picioare, un picior sprijinit în spate pe o bancă, la o distanță de aproximativ un pas mare. Cobori încet îndoind genunchiul din față, păstrând spatele drept. Te ridici împingând puternic în călcâiul piciorului din față. Atenție: genunchiul din față NU trebuie să treacă peste vârful degetelor de la picior."

**Rationale:** Maria 65 fără antrenor = omiterea unui cue tehnic critic = potențial accidentare = liability real.

**Implementation status:** Hip Thrust 4-element wording deja LOCKED + landed în `src/components/hipThrustSetup.js` Batch B Task 5 (Foundation 4A). Pattern reusable pentru toate exerciții V1 — Daniel completează librăria 4-element wording pe măsură ce exercițiile se adaugă.

### 36.7 §33.2 Storage Full 95% Suprimare în Sesiune LOCKED V1

**Mecanică:**
- Modal blocant 95% suprimat dacă `session.status === 'active'`
- 4h inactivity → engine consideră sesiune abandonată + auto-save silent state curent → modal afișat la următoarea interacțiune user
- Flag `suppressStorageAlert` exclusiv in-memory state pe durata sesiunii active (NU localStorage). Crash recovery via câmp dedicat schema IndexedDB sesiune activă

**3 triggers comportamentale modal amânat:**
1. End of Session (tap "Termină sesiunea")
2. Fresh Open (`onResume` / pornire proaspătă cu storage 95% AND zero sesiune activă)
3. Abandoned Session (prima interacțiune user post-4h inactivitate)

ZERO cod în spec (comportamental only). §33.2 §AMENDMENT 2026-05-02 late evening aplicat.

### 36.8 Pricing V2 Amânat Post-Beta Data dec 2026 LOCKED

NU eliminare, defer. Decidem pe baza conversion data beta sept-dec 2026. Pre-launch lock arbitrary = risc churn la trecere paid.

**Cross-refs:** §3 Pricing LOCKED + §29.6.3 Free Early Access NU grandfathering V1 + §36.13 Beta-launch ASAP strategy.

### 36.9 Founding Members €60 Lifetime + Discord ELIMINATE V1 LOCKED

Doar Free permanent + V2 Pro €65/an post-launch. Simplificare scope V1 + zero Discord moderation overhead solo bootstrap. Sweep §29.6.3 + §1.4 PRODUCT_STRATEGY_SPEC pentru references removal. ADR Q-0533 Discord Premium Perk gated post-500 users = DEPRECATED.

**Action item Daniel:** sweep references "Founding Members" + "Discord Premium Perk" în §29.6.3 + §1.4 PRODUCT_STRATEGY_SPEC + ADR Q-0533 (mark DEPRECATED).

### 36.10 Chalkboard Educational Chatbot V1.1 (defer) LOCKED

V1 user vrea execuție rapidă, NU chatbot education. V1.1 (~feb-mar 2027) = expansion play, justifică Pro €65/an upgrade reason. §11 status update "LOCKED Sprint 4" → "LOCKED V1.1 (~feb-mar 2027 expansion play)" — §AMENDMENT 2026-05-02 late evening aplicat. Spec preserved 1:1 (NU rescriere), doar timing shift.

### 36.11 Wording Phase A/B/C Strategy LOCKED

Toate string-urile Phase A/B/C = procesate cu **Claude Opus dedicat** (NU Sonnet bulk batch).

**Phase B engine fatigue/reality/dp/proactive ~37 strings** = anti-RE absolut critical → mini-sesiune chat strategic ad-hoc 30-45 min Daniel-validated când CC ajunge implementation point.

**Pauză siguranță:** În momentul în care dezvoltarea ajunge la codul sensibil din Phase B engine, generarea bulk se OPREȘTE. Daniel deschide chat Claude nou dedicat (fresh bandwidth obligatoriu) → Claude pull SSOT (§25 + §27 batch 1-4 deja LOCKED ca pattern reference + §22 F-NEW-4 anti-RE wording lock + §23 Engine 12 variations LOCKED) → Daniel + Claude review fiecare text 30-45 min total → Filter Bugatti aplicat: zero formulare paternalistă + zero numerice vizibile + reframing pozitiv + voice persoana I plural → Wording locked → handover input mini → next CC Opus implementation Phase B.

**Cross-refs:** §25 Wording REMAINING + §27 Wording Phase B 53 strings finalizate.

### 36.12 Exercise Library Extension HARD BLOCKER V1 LOCKED (NU defer V1.1)

**Rationale Dependency Trap:** 8/8 templates LOCKED design-wise menționează exerciții care NU există încă în library actual. Library NU are aceste exerciții V1 → templates Longevitate + Tonifiere + Slăbire majoră NU funcționează → Maria 65 deschide app, primește template Longevitate, vede "Sit-to-Stand" → exercițiu inexistent → engine fallback la BBS (eliminat) → catastrofă safety.

**4 Piloni:**
- **Pilonul Longevitate & Mobilitate (Maria 65):** Sit-to-Stand, Lateral Step-ups, Wall Push-ups, Bird-Dog, Modified Plank
- **Pilonul Core & Antrenament Funcțional:** Pallof Press, Suitcase Carry, Bird-Dog
- **Pilonul Slăbire Majoră (Low-impact / Gigica 35):** Cable Pull-throughs, haltere/gantere pe suprafețe stabile
- **Pilonul Forță & Hipertrofie (Marius 25):** Trap Bar Deadlift, Hack Squat, Hip Thrust pe aparat, Face Pulls

**3 PB-uri tactice LOCKED:**
- **PB1:** Pool exhaustiv mișcări care acoperă 100% nevoile execuție 8 templates parametrice §29.2.4-§29.2.7. Numărul final = output mapping templates → exerciții, NU input arbitrary.
- **PB2:** NU blocăm structura JSON exercițiilor în spec strategic (prevenire data regression risk). Opus citește schema existentă src/exercises/ → extinde respectând schema → propune amendment doar dacă necesar.
- **PB3:** Pilot 1 exercițiu × 3-5 style variants Claude Design ÎNAINTE scale set complet (= număr exerciții × 2 poziții, output mapping).

**Status:** HARD BLOCKER V1 (NU defer V1.1). Implementare = Sprint 4.x dedicated batch (Batch D candidat — exercise library + imagini pilot, ~6-10h Opus + bottleneck Daniel review pilot 1-2h cf §36.13).

### 36.13 Strategy Beta-launch ASAP LOCKED

**Decizie:** Beta-launch full pentru prieteni/rude/network, NU 1 ian 2027 fix.

**Rationale:**
- Beta prieteni = trust real, NU strangers care depun plângeri ANSPDCP
- Audit legal proper post-beta, nu pre-beta (audit pre-beta prieteni = useless)
- Caut activ avocat printre prieteni → barter Pro lifetime free pentru review legal real (cross-ref §36.3)
- General public launch = când Daniel decide ready, NU calendar fix

**Realist Calendar:** Beta full launch ready ~7-10 zile calendar dacă Daniel alergă serios cu reviews + decisions între batches.

**Ce mai e de făcut major (post Batch B):**

| Batch | Scope | Effort Opus | Bottleneck Daniel |
|-------|-------|-------------|-------------------|
| Batch C | T&B Faza 1+2 full (event-sourcing layer + branching + UI prompt) | ~10-15h Opus dedicat (1-2h wall-clock) | Review post-implementation |
| Batch D | Library Extension §36.12 + Imagini Pilot §1.5 | ~6-10h Opus | Review pilot 1-2h imagini approve |
| Batch E | Features V1 (F-NEW-1/2/3/4 + MMI + Storage Full UX + Onboarding 4 ecrane + Editare Istoric + Notificări + Next-Up Gaze + NPS Feedback) | ~8-12h Opus | Review |
| Batch F | TWA Google Play setup + Bubblewrap + listing | ~1 zi Opus | 3h Daniel manual Play Console listing |
| Batch Legal | Privacy Policy + ToS templates | ~1h Opus (NU avocat) | Daniel review ToS |
| Batch Rebrand | Sweep SalaFull → Andura | ~5h Opus | Repo rename + email signature |
| Batch ADR 022 | V2 consolidation | ~1 batch Opus | Daniel review |
| Wording Phase A/C bulk + Phase B mini-chat ad-hoc | Per §36.11 | mixed | Daniel review Phase B chat |

**Total Opus wall-clock:** ~5-8h spread peste batches.
**Total Daniel-time:** ~10-15h (reviews + decisions + listing Play Console + pilot imagini approve + caut avocat prieten).

**Bottleneck Real:** NU codul. **Daniel** + reviews bandwidth + pilot imagini approve + listing Google Play Console manual + caut avocat prieten în network.

**Cross-refs:** §29.6 Distribution Strategy V1 LOCKED Soft Launch andura.app + §29.7 Pre-Launch Checklist V1 + §36.1 TWA Google Play + §36.3 Buget Legal + §31 Investiții AMENDMENT.

### 36.14 Lessons Learned 2026-05-02 late evening (workflow notes anti-halucinație)

#### 36.14.1 Bandwidth Self-Reporting Unreliable

Claude bandwidth raportat = unreliable când aproape saturare. Pattern observat: bandwidth real e ~50% din ce raportez când mă apropii de threshold. Chat anterior "Acasă" raportat fals 30-35% când real ~15-20% → halucinație handover artefact (400+ linii markdown).

**Solution:** chat nou fresh când raport bandwidth <30%, NU "mai întind". Handover artefact lung la <20% = halucinație garantată.

#### 36.14.2 Shell Detection Pre-Prompt

Daniel acasă ≠ automat PowerShell. Verifică shell type ÎNAINTE scriu prompt cu sintaxă specifică.

**Solution:** întreb explicit "PowerShell sau bash?" la START de prompt CC nou. Batch A + B au confirmat Git Bash on Windows = shell-ul de pe Daniel desktop.

#### 36.14.3 Hard Floor Time Run Opus

Lessons Batch A: Opus terminat în 20 min cu "PartialComplete" status când Daniel a vrut 8h utilization full.

**Solution:** prompt explicit "HARD FLOOR Xh — NU stop early, dacă scope principal termină rapid continuă cu Tier 2 backup tasks". Aplicat Batch B → Tier 1 + 3/4 Tier 2 done.

#### 36.14.4 SSOT Claims Verify Pre-Implementation

Lessons Batch A Finding B: SSOT zicea "Faza 1 LIVE algorithm core" → grep verify în src/ = ZERO matches. Spec out of sync cu cod.

**Solution:** prompt CC instruit să grep cod ÎNAINTE de implementare on critical claims, flag finding dacă mismatch. §34.1 §AMENDMENT 2026-05-02 documentat correction.

#### 36.14.5 Findings Tracker Mandatory

Lessons Batch A: raport conține findings dar findings tracker dedicat NU updated automat.

**Solution:** prompt CC future include explicit "update `05-findings-tracker/FINDINGS_MASTER.md` ca parte din raport". Aplicat Batch B → SF-A through SF-E added.

### 36.15 Status Snapshot Post Batch B (2026-05-02 late evening)

- **Batch A:** ✅ COMPLETE PartialComplete (4 commits, 888 → 955 tests, Blocker 2 partial + Blocker 3 full + Foundation 3 Safety Banner)
- **Batch B:** ✅ COMPLETE (9 commits, 955 → 1110 tests +155 net, Auth Faza 1 + Memory Paradox hotfix + Foundation 1/2/4 + SafetyBanner wiring + Tier 2 Findings sync + §34.1 amendment + Vite warnings cleared, vezi `📤_outbox/_archive/2026-05/48_LATEST_PREVIOUS_BATCH_A.md` + LATEST.md ingest report curent)
- **Wall-clock total Batch A+B:** ~30-40 min Opus autonomous (target initial 12h+8h = 20h, actual <1h Opus runtime)
- **Status V1:** 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix + 1 partial schema + 1 full) + 12 decizii LOCKED late evening + Beta-launch ASAP strategy LOCKED + 0 sesiuni chat strategic rămase
- **Next:** Batch C scope decision (T&B Faza 1+2 full SAU Library Extension + Imagini Pilot SAU Features V1 cluster) + chat nou strategic Beta-launch ASAP review + Daniel manual Firebase Console setup pentru Auth dogfood (per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02).

### 36.16 RIR Matrix Adaptiv (Profile + Exercise Category Aware) LOCKED V1

**Decizie:** Traducerea feedback verbal user → RIR numeric NU e funcție globală. Matrix adaptiv per Profile Type × Exercise Category.

**Verbal feedback layer V1 (Maria 65 + Gigica 35 non-tech):** "Cât de greu a fost?" → [Ușor / Potrivit / Foarte greu] (3 opțiuni, NU RPE/RIR explicit).

**Matrix conversie:**

| Profil | Tip Exercițiu | Verbal | RIR Numeric | Acțiune Engine |
|--------|---------------|--------|-------------|-----------------|
| Maria 65 (Beginner/Longevitate) | Izolare/Greutate corporală (Sit-to-Stand, Wall Push-ups) | Ușor | 6+ | Păstrează greutate, +2 reps |
| | | Potrivit | 3-4 | Optimum, menține |
| | | Foarte greu | 0-1 | **Reduce reps (NU sets)**, păstrează min 2 sets |
| Marius 25 (Advanced/Strategic) | Mișcări compuse grele (RDL, Squat, Bench) | Ușor | 4-5 | +2.5 kg |
| | | Potrivit | 2-3 | Optimum, +1 kg sau +1 rep |
| | | Foarte greu | 0 (3× consecutive same lift) | **Activează micro-deload** |

**Push-back productive Claude integrate:**
- Marius single RIR 0 ≠ deload immediate. Doar 3 sesiuni consecutive same exercise → micro-deload (anti-fragility).
- Maria "Foarte greu" → scădem rep target (8→6), NU sets count. Min 2 sets preserve prag stimulare neuro-musculară.

**Cross-refs:** §29.2.5 Engine Forță (Marius compus) + §29.2.6 Longevitate (Maria izolare) + ADR Pattern 14 No-Inference + `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT) + `01-vision/SUFLET_ANDURA.md` §3.

### 36.17 4 Moduri UI Detection LOCKED V1

**Decizie:** Mode detection NU prin language analysis (NU avem chat). Pure event listeners + flags pe acțiuni UI deterministe.

| Mod | Trigger UI | Engine Output |
|-----|-----------|---------------|
| **Executor** | Tap rapid "Set terminat" + skip mai departe | UI minimalist, cifre mari, ZERO explicații text |
| **Curios+Strategic** (comasat) | Tap "De ce?" / denumire exercițiu / grafic progresie | Expand detalii tehnice + raționament |
| **Frustrat Tehnic** | 3 retry consecutiv same set + Skip exercițiu | Sticky Swap Engine activate (înlocuire mișcare) |
| **Frustrat Viață** | 2+ skip-uri în aceeași săpt | Banner Anti-RE §22 F-NEW-4 (DEJA LOCKED): "Drumul continuă. Reluăm [ziua]." |
| **Validation-Seeking** | Scroll repetat trend grafic + stagnation 7+ zile detected | Toast: "Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează." |

**Implementare V1:** Event Listeners + Flags state local. ZERO ML/NLP runtime. Reguli logice curate.

**Wording locked:** Frustrat Tehnic + Validation-Seeking (mai sus). Frustrat Viață = §22 F-NEW-4 morning ingest.

**§AMENDMENT 2026-05-02 SELF-CORRECTION:** Mid-session recalibrare valori next set = 100% silent UI update pe card, ZERO prompt/modal/animație. Engine adaptează tactic session curent fără a întrerupe flow Executor. Recalibrarea se aplică doar dimensiunilor active session curent (kg/reps next set). Outlier prompt §36.24 = post-session-end ONLY, NU mid-set. Detail spec: §36.28 Realtime Per-Set Silent Recalibration + §36.29 mid-session silent UI clarification.

**Cross-refs:** §22 F-NEW-4 Anti-RE banner + §29.5 UX Colateral + Sticky Swap Engine §29.5 + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) + `01-vision/SUFLET_ANDURA.md` §3.

### 36.18 Bias Detection Observabilă V1 — Volume Creep LOCKED

**Decizie:** Auto-aggression manifest V1 NU prin nutrition (NO nutrition tracking V1) — prin Volume Creep observable.

**Trigger:** `(Sesiunea curentă are seturi finalizate la RPE >= 8) AND (User apasă "Adaugă set" 2× consecutiv same exercise)`

**Acțiunea:** Friction in-moment la apăsarea 2-a (NU final session), NU blocaj autonomy.

**Wording UI prompt LOCKED:**
> "Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?"
> [Continuă] [Sunt OK fără]

**Înregistrare:** Recap silent în CDL la final session, NU re-banner.

**Cross-refs:** ADR Pattern 14 + §22 anti-RE + ADR 011 CDL + `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT).

### 36.19 Bias Detection Observabilă V1 — Auto-pedeapsă LOCKED

**Decizie:** Auto-pedeapsă manifest V1 prin self-punishment manual weight reduction post-success.

**Trigger:** `(Setul N validat la RIR optim) AND (Setul N+1 are greutatea redusă manual cu >=20%)`

**Acțiunea:** Engine NU blochează (autonomy 100%), prompt informativ neutru data-driven.

**Wording UI LOCKED (sub cartonaș exercițiu):**
> "Setul anterior a fost validat la efort optim. Greutatea a fost redusă cu peste 20% — confirmă dacă vrei un progres conservativ sau dacă revii la baseline."
> [Continuă cu greutatea redusă] [Revino la baseline]

**Filozofie:** ZERO paternalism guru-style. ZERO "corpul tău poate susține" predictiv (engine NU știe). Informare neutră, user decide.

**Cross-refs:** ADR Pattern 14 + filter `01-vision/SUFLET_ANDURA.md` §1.1 F2 "AI-ul informează, nu impune" + `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT).

### 36.20 Bias Detection — Catastrofizare SCRAP V1 (Defer V2) LOCKED

**Decizie:** Eliminăm trigger detection catastrofizare V1.

**Rationale:** User-ul matur care vede 2+ skip-uri și încearcă manual Reset/Deload e act de **realism + autonomy**, NU bias negativ. Trigger anterior propus tratează ca infantil.

**V1 coverage:** Banner generic Anti-RE post 2+ skip §22 F-NEW-4 acoperă ~80% risc abandon. Suficient.

**V2 reconsider:** Catastrofizare reală = abandon proces (tap "Termină programul" / dezinstalare flow / reduce manual frecvență 4×→1×). Detection complex, scope V2.

**Cross-refs:** §22 F-NEW-4 + `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT).

### 36.21 T1+ Onboarding Completion-Based Unlock LOCKED V1

**Decizie:** T1+ profile typing NU calendar-based (anterior 7 zile fixe), ci completion-based.

**Trigger:** **4 sesiuni de antrenament finalizate complet** după T0 onboarding.

**Beneficiu:** Self-paces — Marius 25 atinge prag 7-10 zile (4×/săpt), Maria 65 atinge 14-21 zile (3×/săpt sub-target). Engine adaptă la rhythm real, NU presupune calendar.

**Skip permis:** Buton vizibil "Mai târziu". Skip → re-afișare discret peste 14 zile.

**Cross-refs:** §29.5 Onboarding 4 ecrane + Tier-based personalization (memory edit recent).

### 36.22 T1+ Câmpuri Minim 3 Gigel-Validated LOCKED V1

**Decizie:** T1+ colectează DOAR 3 variabile critice, wording simplu cuvinte standard.

**Câmpurile:**

1. **Istoric greutate recent:** "Ce greutate medie ai avut în ultimele 3-6 luni?" (input numeric)

2. **Activitate zilnică:** "Câți pași faci sau cât de activ ești în afara sălii?" — [Sedentar | Activ | Foarte activ]

3. **Istoric nutrițional recent:** "Ai mâncat mai puțin decât de obicei în ultimele 3 luni?" — [Da | Nu | Nu știu sigur]
   - **NO jargon "deficit caloric" / "dietă restrictivă"** (Gigel test fail Maria 65)
   - **"Nu știu sigur"** option critical: engine consideră potential deficit history, calibrare conservativă

**Filozofie:** Anti-decision-fatigue. Maria/Gigica NU primesc 10 câmpuri. 3 esențiale, restul defer V2.

**Cross-refs:** §29.5 Onboarding + Profile Typing tier system.

### 36.23 Android Eviction & Flight Mode Mitigation LOCKED V1

**Decizie:** Excludem context iOS Safari (Android-only LOCKED §36.2). Focusăm Android low-storage eviction + airplane mode mid-session.

**Mitigare V1:** Sync Validation pre-close session.

**Mecanică:**
- Înainte tap "Termină sesiunea" → app validate sync Firebase RTDB în fundal
- Sync fail (no rețea / error local) → ecran sumar message:
  > "Datele tale nu au fost încă salvate în cloud. Te rugăm să verifici conexiunea la internet pentru a preveni pierderea istoricului."
- Sesiune saved local IndexedDB până next sync reușit

**Cross-refs:** §36.2 Android-only PWA + §34.2 Firebase RTDB + ADR 020 Storage Tiering + §33 Storage Full UX (separate concern, similar mecanism).

### 36.24 Outlier Filter Profile-Aware + ASK Don't IGNORE LOCKED V1

**Decizie:** Outlier threshold per profile + per exercise category. NO ignore tăcut. ASK user explicit confirmation.

**Pragurile:**

| Profil | Categorie | Prag Deviație |
|--------|-----------|---------------|
| Maria 65 | Greutate corporală/Izolare | ±3 reps SAU ±5 kg |
| Marius 25 | Mișcări compuse grele | ±4 reps SAU ±20% greutate |

**Mecanica UI LOCKED:**
- Outlier detected → prompt confirmation:
  > "Sesiunea de astăzi pare diferită față de istoricul tău. Confirmă dacă greutatea și repetările introduse sunt corecte sau corectează-le."
  > [Confirm valorile] [Corectez valorile]

**Outlier confirmed treatment:**
- **1 sesiune izolată:** noted CDL, baseline UNCHANGED (presupunem zi proastă: somn slab, stres, glicemie)
- **3 sesiuni consecutive same exercise:** ABIA acum ajustare baseline downward (regresie reală, anti-supraantrenament) — vezi §36.26

**Filozofie:** ZERO inference cauză. ASK user. Engine adaptează pe efect observat, NU presupunere.

**Cross-refs:** ADR Pattern 14 No-Inference + §29.2.5 Engine Forță + Bayesian calibration logic + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT) + `01-vision/SUFLET_ANDURA.md` §3.

**§AMENDMENT 2026-05-02 SELF-CORRECTION:** Outlier prompt confirmation se afișează **post-session-end ONLY** (la tap "Termină sesiunea"), NU mid-set. Mid-set prompt = friction major Executor mode. Engine înregistrează silent valorile în CDL pe parcursul sesiunii; prompt §36.24 wording standard ("Sesiunea de astăzi pare diferită...") apare doar la închidere session. Vezi §36.28 + §36.29 pentru mid-session silent UI update spec.

### 36.25 Cascade Defense 4 Layers LOCKED V1

**Decizie:** Golden Master testing necesar dar NU suficient. Layered runtime defense.

**Layer A — Schema Validation Runtime:**
```javascript
if (!isValidExercise(recommendation.id)) {
    logErrorToCDL(recommendation);
    return getSafeDefaultRecommendation(userProfile);
}
```
Schema invalid → throw + log + safe default. NU propagate cascade.

**Layer B — Confidence Score INTERNAL signal (NU user-facing default):**
- Rămâne strict **internal engine signal**, invizibil user implicit
- User-facing DOAR în 2 cazuri:
  1. Outlier confirmation (per §36.24)
  2. Confidence DROPS HIGH→LOW mid-program (regresie reală signal)
- **Prima săptămână 4 sesiuni:** TOATE LOW confidence (zero istoric) — NU friction. Banner onboarding generic acoperă: "Programul se calibrează pe ritmul tău. Primele 4 sesiuni = baseline."

**Layer C — Sanity Bounds Per Progression Phase + Global Cap:**

| Faza | Max Progresie Săpt Compus |
|------|---------------------------|
| Newbie (săpt 1-8) | +10% |
| Intermediate (săpt 8-26) | +5% |
| Advanced (săpt 26+) | +2.5% |

**Failsafe Absolut Anti-Bug Global:** Indiferent profil/fază/exercițiu, hard cap **+20% săpt** ORICE exercițiu. Peste = blocked runtime, treated ca eroare calcul/tastare.

Hard caps absolute exercise-specific:
- Maria Sit-to-Stand: max 12 reps/set
- Marius Deadlift: max +10% (newbie) / +5% (intermediate) / +2.5% (advanced) săpt — restricted by phase

**Layer D — Runtime Invariant Checks:**
- Check continuu constants logice mid-session
- Violare regulă bază (ex: volum total today = 3× last week) → reset calculations + apply baseline conservativ
- Anti-cascade silent

**Cross-refs:** ADR 020 Storage + Schema validation + ADR 011 CDL logging + §29.2.5 Engine Forță bounds + `03-decisions/ADR_CASCADE_DEFENSE_v1.md` (DRAFT).

### 36.26 Outlier Confirmed ≠ New Baseline LOCKED V1

**Decizie:** Engine treatment outlier confirmed = single low day flag, NOT baseline downward shift immediate.

**Mecanică:**
- 1 sesiune izolată outlier confirmed → CDL note "low day flag", baseline UNCHANGED next session
- 3 sesiuni consecutive same exercise low day → baseline shift downward (real regression)

**Filozofie:** Bayesian rigidity prevention — single data point NU recalibrează priors agresiv. 3 consecutive = signal real, NOT noise.

**Cross-refs:** §36.24 Outlier Filter + ADR Pattern 14 No-Inference + Bayesian update logic + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT).

**§AMENDMENT 2026-05-02 SELF-CORRECTION:** Streak counter logic clarificat: 3 sesiuni consecutive same exercise = "neîntreruptă în aceeași direcție". Outlier upward la sesiunea 1 + normal la sesiunea 2 = streak reset la 0. Outlier upward la sesiunea 3 = counter restart la 1/3. Baseline shift requires 3 consecutive outlier sessions same exercise same direction. **Marius Bench Press validation shift baseline 50→52.5kg:** trebuie Sesiunea 1 (55×11) + Sesiunea 2 (55×11) + Sesiunea 3 (55×11) la rând; orice intermediate normal session = reset counter. Detail spec: §36.30 streak counter same direction + reset clarification + Marius example codified.

### 36.27 SUFLET_ANDURA SSOT new file (NEW 2026-05-02 SUFLET ANDURA ingest)

**Decizie:** Crează SSOT new file `01-vision/SUFLET_ANDURA.md` ca filozofie permanentă referită la fiecare engine module nou.

**Status:** SKELETON create 2026-05-02. Translation map V1 (~75% replicabil + ~15% mai bine + ~10% irreplicable + ~30% V2+) + 11 LOCKED summary cross-ref + STUB pentru filozofie 12k cuvinte sursă pending Daniel upload `Procesul_de_gandire_complet.md` la `📥_inbox/`.

**Filter peste filtrul Bugatti:** "Bugatti engineer mândru?" + "e în sufletul andura?" — dual gate.

**Cross-ref obligatoriu:** TOATE engine modules ADR-uri V1+ trebuie să referențieze `01-vision/SUFLET_ANDURA.md` pentru filozofie de fundament.

**Pending action Daniel:** ~~upload `Procesul_de_gandire_complet.md` 12k cuvinte la `📥_inbox/`~~ — **RESOLVED 2026-05-02 ingest commit `82dfbe6`.** Source ingested integral cu heading-shift +1 nivel; SUFLET_ANDURA §4 "Filozofia Completă" COMPLETE; DIFF_FLAGS archived ca `_archive/2026-05/56_*_RESOLVED.md`.

### 36.28 Realtime Per-Set Silent Recalibration LOCKED V1

**Decizie:** Engine recalibrează plan post fiecare set finalizat în timp real. Update UI pe cardul next set 100% silent — ZERO prompt, modal sau animație care să întrerupă flow Executor mode.

**Mecanică tehnică:**
- User tap "Set terminat" cu reps/kg actual
- Engine evaluează signal: matches plan / drop-off / spike
- Engine updateaza valorile pe cartonașul next set INSTANT (`kg` și/sau `reps` schimbă pe ecran)
- ZERO interruption — user vede direct noua recomandare pe ecran
- Recalibrare scope = doar dimensiuni active session curent (next set kg/reps), NU re-rank ipoteze F7 (alea se rank la session start sau outlier major)

**Exemplu Bench Press:**
- Plan inițial: 4 seturi × 50kg × 10 reps
- Set 1 + 2: 50×10 (normal) → engine confidence HIGH, baseline neschimbat
- Set 3: drop la 8 reps → engine ajustează silent set 4 la 50kg×8 sau 47.5kg×10
- User vede direct nouă recomandare pe card → execută

**Performance budget:** Layer D invariants checks pe fiecare "Set terminat" tap **≤ 50ms acceptable**.

**Cross-refs:** §36.17 mod Executor + §36.24 outlier filter + §36.25 Cascade Defense Layer D + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) + `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT — cross-ref realtime per-set).

### 36.29 §36.17 Mid-Session Silent UI Update Clarification LOCKED V1

**Decizie:** Formal codification că §36.17 mod Executor implică recalibrare silent. Adăugare ca §AMENDMENT inline în §36.17 (DEJA APLICATĂ post-acest ingest).

**Wording amendment §36.17:**
> Mid-session recalibrare valori next set = 100% silent UI update pe card, ZERO prompt/modal/animație. Engine adaptează tactic session curent fără a întrerupe flow Executor. Recalibrarea se aplică doar dimensiunilor active session curent (kg/reps next set). Outlier prompt §36.24 = post-session-end ONLY, NU mid-set.

**Cross-refs:** §36.17 + §36.24 + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT).

### 36.30 §36.26 Streak Counter Same Direction + Reset Clarification LOCKED V1

**Decizie:** Formal codification că §36.26 baseline shift trigger = 3 sesiuni consecutive **în aceeași direcție** (only upward sau only downward), NU 3 oricum. Streak counter resetează la prima revenire la baseline normal.

**Mecanică:**
- Sesiunea 1: outlier upward (e.g. 55kg × 11 vs plan 50×10) → counter = 1/3 same direction
- Sesiunea 2: revenire la baseline normal (50×10) → **counter RESET la 0**
- Sesiunea 3: outlier upward din nou → counter = 1/3 (NOT 2/3)
- Pentru baseline shift: 3 sesiuni consecutive same direction NEÎNTRERUPTE

**Exemplu Marius Bench Press shift baseline 50→52.5kg:**
- Trebuie: Sesiunea 1 (55×11) + Sesiunea 2 (55×11) + Sesiunea 3 (55×11) la rând
- Orice intermediate normal session = reset counter

**Cross-refs:** §36.26 §AMENDMENT 2026-05-02 SELF-CORRECTION (DEJA APLICATĂ post-acest ingest) + §36.24 + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT — adăugare streak counter spec + Marius example codified).

### 36.31 God Mode / Advanced Overrides RESPINS V1 LOCKED

**Decizie:** Eliminate complet din scope V1 — feature "God Mode" cu user manual override pentru Volume Tolerance / Muscle Fiber Profile / Baseline Learning Speed.

**Rationale:**
- Încalcă SUFLET F6 No-Inference + ADR Pattern 14 (engine NU presupune cauze user-declared fără verificare empirică)
- Self-assessment user notoriu wrong (Daniel zice "fast-twitch dominant" bazat pe ce? Test 1RM real sau perception?)
- Maria 65 NU bifează "fast-twitch profile" — feature pentru power users only = scope creep beachhead
- Gigel test fail — "Volume Tolerance" + "Muscle Fiber Profile" = jargon medical
- Engine adaptă natural prin recalibrare per-set (§36.28) + 3-consecutive baseline shift (§36.26 + §36.30) — feedback loop already exists

**Alternative path V1:** Daniel/Marius pot oricum schimba greutatea manual la execuție → engine adaptează natural via §36.28 silent recalibrare + §36.30 streak counter.

**V2 Reconsider:** post-beta data dacă Power User tier cohort confirmă demand real.

**Cross-refs:** `01-vision/SUFLET_ANDURA.md` §1.1 F6 No-Inference + ADR Pattern 14 + §36.21 T1+ Completion-Based + §36.22 T1+ Câmpuri Minim Gigel-Validated.

### 36.32 Explainability Module — Lazy Generation On-Demand LOCKED V1

**Decizie:** Adăugare modul Explainability "De ce?" pentru transparență decizională engine. Generare diagnostic string LAZY (on-demand la tap), NU în fundal pentru fiecare recomandare.

**Mecanică:**
- Card exercițiu cu buton secundar `[De ce?]`
- User tap → engine rulează funcția de generare diagnostic ÎN MOMENTUL APĂSĂRII (`onClick`)
- Engine citește: state curent + CDL recent + istoric baseline + applied rules
- Output: text scurt explicativ ce arată matematica din spate

**Exemplu output:**
> **De ce facem 52.5 kg × 8-10 reps astăzi?**
> - Ritmul tău de progresie: faza Intermediate
> - Ultimul tău set sesiunea anterioară: 50 kg × 11 reps (validated success)
> - 3/3 sesiuni consecutive progres upward → declanșat baseline shift
> - Sanity bound +5% săpt aplicat (Intermediate phase)

**Performance budget:**
- ZERO latency la deschidere ecran antrenament (lazy = NU pre-generate)
- Generare on-demand acceptable ≤ 100ms (citire CDL + state + format string)
- Memory minim, battery Android conservator

**Wording strings sensibile:** Phase B mini-sesiune Daniel-validated (NU bulk Sonnet auto-generate).

**Cross-refs:** §36.17 mod Curios+Strategic + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT — extends cu Explainability spec) + ADR Pattern 14 (engine reasoning transparent observable, NU inferred causes).

### 36.33 Time-Constrained Routine Adaptive Per Profile LOCKED V1

**Decizie:** Single time modifier feature, dar UI options adaptive per profile session length. ZERO biological state inference (NU "obosit", "dormit prost", "febră musculară" — pure time constraint factual).

**Mecanică UI:**

**A. Profil Marius / Strategic (Template-uri 60min):**
- Buton `[25 min]` Extreme Crunch
- Buton `[45 min]` Express Session

**B. Profil Maria / Longevitate (Template-uri 30-40min):**
- NU vede butoane 25/45 min (Gigel test fail — confuz pentru Maria 65)
- Folosește fluxul nativ `[Skip exercițiu]` per card mișcare dacă criză timp

**Algoritm Modul 25min Extreme Crunch (Marius):**
1. Filtrare: elimină complet exercițiile marcate `Tier 2` (izolare/accesorii: flexii biceps, extensii triceps, ridicări laterale)
2. Limitare volum Tier 1 compounds: dacă în program 4 seturi → reduce automat la max 2-3 seturi efort real
3. Rezultat: 2-3 mișcări mari executate rapid, conservând stimulul neuromuscular principal în 25 min

**Algoritm Modul 45min Express Session (Marius):**
1. Conservare Tier 1 compounds: rămân intacte volume + intensitate
2. Comprimare Tier 2: convertite automat în Supersets (A/B pairing) sau redus la 1 set efort maxim (RIR 0)
3. Rezultat: tot volume programat bifat, salvare timp prin elimination timpilor morți între accesorii

**Filozofie:**
- ZERO presupuneri despre DE CE user se grăbește (aliniat ADR Pattern 14)
- Pure utility tool — permite să nu sară peste antrenament total
- Exercise library trebuie să aibă parametru `tier` per exercițiu (Tier 1 = compound bază, Tier 2 = accesoriu/izolare)

**Schema impact exercise library:**
- Add field `tier: number` (1 | 2) la fiecare exercițiu
- Migration runner pentru exerciții existente (Daniel review categorization)

**Cross-refs:** §36.20 Catastrofizare SCRAP V1 + ADR Pattern 14 No-Inference + §36.12 Library Extension HARD BLOCKER (necesită field `tier` adăugat la schema).

### 36.34 Profile Validation Layer (Self-Correction Architectural) + User-Triggered Reset LOCKED V1

**Decizie:** Engine detectează drift comportamental față de profile declarat după 8 sesiuni completion-based + propune mode shift cu user consent. Mecanism deterministic, ZERO LLM runtime. Plus User-Triggered Reset manual fallback.

#### Trigger
- Audit comportamental rulează automat la **8 sesiuni complete finalizate** post T1+ onboarding (aliniat §36.21 spirit completion-based, NU calendar)
- Pentru frequency reală: Maria 3×/săpt → ~3 săpt; Marius 4-5×/săpt → ~2 săpt

#### Calcul de Drift (Math-Only, NU LLM)

Engine compară 3 metrici cheie de interacțiune cu așteptările profilului declarat:

| Metrică observată | Așteptare Profil Strategic | Realitate user (exemplu drift) |
|-------------------|----------------------------|--------------------------------|
| Rata apăsare buton "De ce?" | ≥ 30% din exerciții | < 5% (a ignorat explicațiile) |
| Timp pe ecran sumar | ≥ 45 secunde | < 15s consecutiv toate 8 sesiuni |
| Selecție rep ranges | Testează mid/upper bounds | Mereu lower bound |

#### Threshold Strict Anti-False-Positive (3/3 Simultaneous)

Promptul de mode shift se declanșează **DOAR DACĂ toate 3 metrici sunt divergente simultan**, NU 1 sau 2 din 3.

```
DECLANȘARE = (rate_de_ce < 5%)
            AND (timp_sumar < 15s în toate 8 sesiuni)
            AND (selecție_lower_bound mereu)
```

**Rationale:** Marius IQ 139 NU tap "De ce?" = înțelege deja, NU înseamnă Executor. Marius rapid pe sumar = grabă, NU înseamnă Executor. 2 din 3 = ambiguous → NU prompt → trust preserved.

#### Prompt UI (Phase B Wording Pending)

Placeholder logic LOCKED V1 în cod (Phase B mini-sesiune Daniel-validated pentru text final):

```javascript
const PROMPT_PROFILE_VALIDATION_PLACEHOLDER = {
  id: "prompt_profile_validation_mismatch",
  text: "[PHASE_B_WORDING_PENDING — fallback: Tiparele tale arată un stil mai direct. Schimbi la Executor?]",
  buttons: {
    confirm: "Da, schimbă",
    cancel: "Nu, păstrez [current_profile]"
  },
  status: "PHASE_B_LOCK_REQUIRED — DO NOT SHIP TO PRODUCTION"
};
```

#### Production Shipping Gate

**Pre-launch check OBLIGATORIU:**

> Este strict interzisă compilarea build-ului de producție dacă în baza de cod există flagul `PHASE_B_LOCK_REQUIRED` sau string-ul `PHASE_B_WORDING_PENDING`. Build script verifică grep, fail dacă match.

#### Cooldown

- User confirmă [Da, schimbă] → engine re-config UI (ascunde explicații auto, simplifică ecrane progresie)
- User refuză [Nu, păstrez] → counter reset, NU mai întreabă timp de **alte 24 sesiuni** (anti-friction nag)

#### User-Triggered Reset (Fallback Self-Correction)

Buton manual "Resetează profil & recalibrează" în Setări → Profil & Date pentru users care simt că engine NU i-a citit corect din prima săpt.

**Se șterg:**
- Date interacțiune (rata "De ce?" tap, timp pe sumar, selecții rep ranges)
- Istoric drift comportamental
- Profile declarat anterior

**Se păstrează intacte (CRITICAL):**
- Istoric forță (greutăți, repetiții, PR records)
- Streak counter §36.26 (3 consecutive same direction) — **PRESERVE** (UI/UX schimbare, fizicul intact)
- CDL session logs

**Re-init:**
- Deschide chestionarul simplificat T1+ (3 câmpuri minim per §36.22)
- Engine BASELINE state pentru următoarele 4 sesiuni (re-calibration phase)

**Rationale:** Reset profile = strict UI/UX & personalization shift. NU afectează starea fizică reală. Marius cu streak 2/3 spre baseline shift NU pierde progres fizic real.

**Cross-refs:** §36.17 mod detection (extends cu validation layer post-onboarding) + §36.21 T1+ Completion-Based + §36.22 T1+ Câmpuri Minim + §36.26 Streak Counter Preserve + §27 Phase B Wording Strategy + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT — adăugare Profile Validation Layer spec).

### 36.35 Goal Shift Event Handler LOCKED V1

**Decizie:** Schimbarea obiectivului (Estetică/Hipertrofie ↔ Forță/Performanță) = Eveniment de Schimbare Explicită declanșat de user din Setări. NU auto-detect silent. Engine aplică Modificatori de Template + interval calibration phase.

**Trigger:** User tap "Schimbă obiectiv" în Setări → Profil & Date

**Modificatori de Template:**

| Parametru | Profil Estetică (Hipertrofie) | Profil Forță (Performanță) |
|-----------|-------------------------------|----------------------------|
| Rep Ranges (Tier 1) | 8-12 repetiții | 4-6 repetiții |
| Intensitate (Load) | RIR 2 | RIR 1-0 |
| Timp odihnă | 90-120 secunde | 180-300 secunde |

#### Mecanica de calcul

**Conservare date fizice:**
- Istoric forță = INTACT
- PR records = INTACT
- CDL session logs = INTACT
- **Streak counter §36.26 = RESET la 0** (context fizic schimbat = signal nou independent)

**Conversia baseline (Starting Interval, NU single point):**

**Anti-pattern (RESPINS):** single formula 1RM (Epley/Brzycki) → cifră fixă (e.g. 57.5kg × 5 reps).

**Aliniat SUFLET F1 Triangulation:**
- Engine generează **interval larg** de adaptare (e.g. 52.5-57.5kg × 5 reps)
- Mesaj UI Modul Curios: *"Estimat: 52.5 - 57.5 kg × 5 reps. Primele 2 sesiuni după schimbarea obiectivului reprezintă o fază de calibrare."*
- §36.26 + §36.30 streak counter rules apply normal post-shift (3 consecutive same direction validates real baseline)

**Re-generarea blocului curent:**
La return ecran antrenament → user vede direct noile numere aplicate adaptate noului obiectiv.

**Filozofie aliniată:**
- Goal Shift = user explicit decision (autonomy 100%)
- Conversion = STARTING POINT cu uncertainty interval, NU baseline LOCKED
- Phase de calibrare 2 sesiuni = engine collects empirical data on actual user execution
- Bayesian update post-calibration = baseline real

**Cross-refs:** `01-vision/SUFLET_ANDURA.md` §1.1 F1 Triangulation + §36.26 Streak Counter (RESET on Goal Shift) + `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT — extends cu Goal Shift event handler) + Phase B wording pentru mesaj Modul Curios.

### 36.36 Schema Extension Exercise Library LOCKED V1

**Decizie:** Extindere schema `src/exercises/` cu metadate noi pentru Smart-Routing (§36.37) + Pain Button (§36.38) + Composite Signal (§36.41).

**Câmpuri obligatorii adăugate fiecărui exercițiu:**

| Field | Type | Values |
|-------|------|--------|
| `equipment_type` | enum | `barbell` / `dumbbell` / `machine` / `cable` / `bodyweight` / `band` |
| `equipment_alternatives` | string[] | Array IDs exerciții cu același target muscular, equipment diferit |
| `force_demand` | enum | `high` / `medium` / `low` (stres sistemic + neuromuscular) |
| `muscle_target_primary` | string[] | Pentru continuitate stimul la swap |
| `muscle_target_secondary` | string[] | Pentru continuitate stimul la swap |
| `tier` | number | 1 (compound bază) / 2 (accesoriu izolare) — DEJA în §36.33 |

**Migration runner:** Daniel review categorization la library extension batch (post Sprint 4.x cluster).

**Cross-refs:** §36.33 Time-Constrained tier + §36.37 Smart-Routing + §36.38 Pain Button + §36.41 Composite Signal.

### 36.37 Smart-Routing Aparat Ocupat / Aparat Lipsă LOCKED V1

**Decizie:** 2 butoane noi pe cardul exercițiului — `[Aparat ocupat]` + `[Aparat lipsă]` — cu logică determinist diferită bazată pe `force_demand`.

**Buton [Aparat ocupat]:**
```
if (force_demand === 'high')
  ──► Sticky Swap acum (propune echipament alternativ same muscle target)
else
  ──► Mută exercițiul curent la finalul listei sesiunii curente
```

**Rationale Cazul `high`:** Bench/Squat/Deadlift ocupat NU se mută la final pentru că force-dependent → user obosit la final → execuție compromisă. Recomandare alternativă acum (DB Bench / Trap Bar Deadlift).

**Rationale Cazul `else`:** DB Bench, izolare → mutare la final = friction zero, performance neaffected.

**Buton [Aparat lipsă]:** Engine caută în library exerciții cu același `muscle_target_primary` dar `equipment_type` diferit (ex: Benzi elastice / Gantere fallback la barbell lipsă).

**Cross-refs:** §36.36 Schema + §36.38 Pain Button (same UX pattern Sticky Swap) + §29.5 Sticky Swap Engine.

### 36.38 Pain/Discomfort Button — 3 Funcțional + Override CDL LOCKED V1

**Decizie:** Buton `[Am o durere / disconfort]` pe cardul exercițiului → meniu cu 3 opțiuni FUNCȚIONALE (NU diagnostic medical) + buton override pe Cazul 🔴 cu CDL log.

**Meniu 3 Opțiuni Funcționale:**

| Opțiune (UI) | Wording user | Engine action |
|--------------|--------------|---------------|
| 🔴 Red Flag | "Mă doare să continui" | Recomandă strong skip + 3 butoane (incl. override) |
| 🟡 Yellow Flag | "E inconfortabil, dar pot încerca" | 3 opțiuni: Test load -20% / Swap / Continuă normal |
| 🟢 Green Flag | "Sunt doar obosit / cu febră musculară" | Tag CDL `[Soreness Day Tag]`, plan neschimbat |

**Cazul 🔴 — 3 Butoane (Anti-Paternalism):**

UI prompt: *"Continuarea poate duce la accidentare. Recomandăm să sărim peste acest exercițiu."*

Butoane:
1. `[Înlocuiește exercițiul (Sticky Swap)]` — **CTA Principal** (mare, colorat)
2. `[Treci peste astăzi]` — Secundar (simplu)
3. `[Continui pe răspunderea mea]` — **Tertiar** (text gri, NON-CTA)

**Override CDL Log + Bias Detection V2 (deferred):**
- Apăsare buton 3 → log imediat în CDL: `[user_override_pain_redflag]`
- ToS Coverage: "User-acknowledged risk override"
- **V1:** doar logging silent
- **V2 (deferred post-beta):** escalation prompt dacă apăsat 3+ ori în 30 zile

**Cazul 🟡 — Yellow Flag:**
3 opțiuni egale:
1. `[Scade greutatea cu 20% (Set test)]`
2. `[Înlocuiește exercițiul (Sticky Swap)]`
3. `[Continuă normal (Sunt OK)]`

**Cazul 🟢 — Green Flag:**
Engine NU modifică plan. Tag CDL `[Soreness Day Tag]` → dacă perf scade în sesiune, NU tratează ca regresie reală (NU scade baseline next session).

**Filozofie aliniată:**
- SUFLET F2 "AI-ul informează, nu impune" (Cazul 🔴 NU forced skip)
- SUFLET F6 No-Inference (wording funcțional, NU diagnostic medical)
- ADR Pattern 14 (engine reacționează la observable, NU inferează cauză)
- Gigel test PASS (Maria 65 distinge funcțional, NU anatomic)

**Cross-refs:** §36.19 Auto-pedeapsă 20% (consistency) + §36.39 Yellow Flag 20% lock + §29.5 Sticky Swap + ADR Pattern 14 + SUFLET F2 + F6 + `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT — extends cu Pain Button override CDL EXT-1).

### 36.39 Yellow Flag -20% Test Load Consistency LOCKED V1

**Decizie:** Cazul 🟡 "Scade greutatea cu 20%" = consistency cu §36.19 (auto-pedeapsă) + §36.49 (Recovery Volume).

**Reducere fixă -20% în tot motorul Andura V1:**
- §36.19 Auto-pedeapsă reduction trigger (set N+1 redus manual ≥20% post-success)
- §36.39 Yellow Flag test load (-20% kg per set)
- §36.49 Recovery State Adjustment volume reduction (fix -20%)

**ZERO interval-uri (15-20% scrap).** Determinism maxim.

**Cross-refs:** §36.19 + §36.38 + §36.49.

### 36.40 Hormonal Estimation RESPINS V1 + Performance State Inference LOCKED V1

**Decizie:** Eliminat complet din scope V1 — feature "estimări cortizol/estrogen/testosteron din patterns" pentru ajustări tacite.

**Rationale RESPINS:**
- Încalcă SUFLET F6 No-Inference (engine inventează biologie internă fără verificare empirică)
- Validity științifică zero — cortizol salivar variază 200-400% în 24h, NU estimabil din patterns app fitness fără HRV/temp/sleep
- Black box engine pentru user → trust breach când user observă pattern fără explicație factuală în Modul Curios (§36.32)
- Liability risk reputațional masiv (jurnalist: "Andura pretinde estimează cortizol fără bloodwork")

**Soluție Înlocuire — Performance State Inference (LOCKED V1):**

| Ce pare semnal hormonal | Ce e de fapt în Andura V1 (observable) |
|-------------------------|----------------------------------------|
| "Cortizol ridicat" (suprasolicitare) | Performance Drop 2+ sesiuni + RIR raportat 0 la greutăți mici |
| "Testosteron scăzut" (oboseală cronică) | Stagnare forță 3+ săpt + timp refacere prelungit |
| "Estrogen luteal/menopauză" | OUT OF SCOPE V1 (NO cycle tracking, RESPINS §36.43) |

**Reguli Execuție:**
1. **Eliminare totală jargon hormonal** — în cod, baza de date, interfață: ZERO referire la hormoni sau markeri biologici
2. **Performance Proxies Only** — engine ajustează pe RIR + perf delta + adherence rate + pause patterns
3. **Modul Curios factual** — text strict observabil ("Am redus greutatea pentru că ultimele 2 sesiuni perf -15% baseline")

**Cross-refs:** SUFLET F6 No-Inference + ADR Pattern 14 + §36.31 God Mode RESPINS (same family) + §36.41 Composite Signal Layer + §36.32 Modul Curios factual.

### 36.41 Composite Signal Layer (Recovery State Adjustment) LOCKED V1

**Decizie:** Layer determinist tăcut care detectează multi-signal degradation simultaneous → aplică Recovery State Adjustment 2 sesiuni. ZERO inferență cauză biologică.

**Composite Signal Trigger — 3/3 Independent Thresholds Simultaneous:**

```
TRIGGER = (Performance Drop AND Rest Time Delta AND RIR Mismatch)
```

Per metric per exercițiu:

1. **Performance Drop** (LOCKED §36.49 dual-threshold):
   ```
   (avg(kg×reps) per set last 4 sessions − avg current) / avg last 4 ≥ 10%
   AND
   (Δ Kg ≥ 2.5 kg OR Δ Reps ≥ 2)
   ```

2. **Rest Time Delta:** Timp odihnă seturi ≥ +30% vs baseline personal exercițiu

3. **RIR Mismatch:** User raportează RIR ≤ 1 la load ≤ 90% baseline curent

**Per-Set Normalization (Anti-False-Positive):**

Calcul Performance Drop pe **avg(kg × reps) PER SET COMPLETAT** (NU volum total).

**Excluse din calcul:**
- Seturi marcate `skipped`
- Seturi marcate `forced-exit` (Aparat ocupat finalul)
- Seturi marcate `time-compressed` (Modul 25min)

**Lifecycle Recovery State Adjustment:**

| Phase | Action |
|-------|--------|
| **Kick-in** | 1 sesiune după trigger detectat |
| **Active** | 2 sesiuni consecutive — volum redus -20% (consistency §36.39) |
| **Auto-resume** | Sesiunea 4 — baseline normal |
| **Extension** | Dacă signals încă active la finalul sesiunii 3 → extend +1 sesiune (max 4 total) |

**Modul Curios Factual (post-hoc):**

User tap "De ce?" → engine output strict observable:
> "Am ajustat conservativ pe baza a 3 semnale de performanță din ultimele 2 sesiuni:
> - Scădere progres: -12%
> - Timp de odihnă crescut: +35%
> - Efort maxim raportat la greutate redusă."

**ZERO jargon hormonal.** Aliniat §36.32 Explainability Lazy.

**Excluse din Composite Signal:**
- Pain/Discomfort button (§36.38) — propriul flow, NU input Composite
- Self-reported fatigue text — NU există V1
- Cycle phase (§36.43 RESPINS V1)

**Performance Budget:** Layer D Cascade Defense ≤ 50ms per "Set terminat" tap (cross-ref `ADR_CASCADE_DEFENSE_v1.md` §EXTENSION 2026-05-02 SELF-CORRECTION + EXT-2 Composite Signal).

**Cross-refs:** §36.34 Profile Validation 3/3 simultaneous (same anti-false-positive pattern) + §36.40 Performance State Inference + §36.32 Modul Curios + §36.49 Dual-Threshold + §36.39 -20% reduction + ADR_CASCADE_DEFENSE Layer D.

### 36.42 ADR Review Process LOCKED V1

**Decizie:** Daniel review 5 ADR drafts NU se face în chat sumar 3 propoziții/ADR — file-by-file integral.

**Mecanică:**
1. **Pre-citire Claude:** Claude citește integral 5 ADR drafts (`ADR_RIR_MATRIX_ADAPTIVE_v1.md` + `ADR_MODE_DETECTION_UI_v1.md` + `ADR_BIAS_DETECTION_OBSERVABLE_v1.md` + `ADR_OUTLIER_FILTER_v1.md` + `ADR_CASCADE_DEFENSE_v1.md`)
2. **Raport structurat per ADR:** Pattern review checks (consistency cu §36.16-§36.49 + cross-refs validate + edge cases flagged + spec gaps identified)
3. **Verdict per ADR:** LOCK / amend (cu propunere wording) / reject (cu motiv)
4. **Daniel intervine:** doar pe ADR-uri flagged amend/reject sau Daniel-judgment-required

**Timeline:** Chat strategic dedicat ~1-1.5h. Pre-citire Claude ~20 min. Daniel decizii flagged ~30-45 min.

**Output:** 5 ADR-uri statusul Draft → LOCKED V1 (sau amend cu commit dedicat). Sprint 4.x cluster UNBLOCKED.

**Cross-refs:** Toate 5 ADR drafts + §36.15 Sprint 4.x cluster scope.

### 36.43 Cycle Tracking Femei RESPINS V1 LOCKED

**Decizie:** Eliminat complet din scope V1 — feature opt-in cycle tracking pentru femei.

**Rationale RESPINS:**
- Încalcă SUFLET F6 No-Inference (engine deduce phase din declared input)
- Gigel test fail — Maria 65 menopauză vs Gigica 50 perimenopauză vs femeie 25 ciclu regulat = 3 use cases biologice complet diferite, NU pot share single UI
- Scope creep beachhead — tracking cycle = UI dedicat + edge cases multiple + privacy concerns + cultural friction RO
- Composite Signal Layer (§36.41) acoperă deja drop performanță cauzat de cycle/menopauză via observable pure

**Coverage Compensatorie:** V1 prinde "stare biologică schimbată" tacit prin Composite Signal — independent de cauză (cycle, menopauză, stres, oboseală). User primește Recovery State Adjustment fără declarare anatomy.

**V2 Reconsider:** Post-beta data dacă cohort feminine confirmă demand explicit pentru cycle awareness vs Composite Signal coverage.

**Cross-refs:** SUFLET F6 + §36.31 God Mode RESPINS (same family) + §36.40 Hormonal Estimation RESPINS + §36.41 Composite Signal coverage.

### 36.44 Onboarding T0 Hard Minimum LOCKED V1

**Decizie:** T0 NU 100% obligatoriu (friction barrier) NICI 100% skippable (engine fără data minimum). Hibrid: 2 câmpuri Hard Minimum + 2 Skippable cu fallback synthetic.

**Câmpuri T0:**

| Field | Status | Rationale |
|-------|--------|-----------|
| Sex biologic | **Obligatoriu** | Engine NU poate alege șablonul de pornire + profile forță |
| Vârstă | **Obligatoriu** | Esential capacitate refacere + volum inițial |
| Înălțime | Skippable | Fallback synthetic prior database |
| Greutate | Skippable | Fallback synthetic prior database |

**Fallback Mechanic:** Skip H+G → engine folosește median synthetic prior database per (sex × vârstă):
- Femeie, 65 ani → fallback 1.63m / 68kg
- Bărbat, 25 ani → fallback 1.78m / 78kg

Synthetic 50+ profile demographic database = production infra (existing memory `Demographic Prior Database` per ADR 017).

**Privacy Policy Note (Phase Avocat):**

Vârsta = personal data sensitive în EU contexte medical-adjacent. Privacy policy needs explicit clause:
> "Vârsta folosită pentru calibrare profil refacere, NU stocată pe server, NU partajată terți."

Action item Avocat barter review pre-launch.

**Cross-refs:** §36.21 T1+ Completion-Based + §36.22 T1+ 3 Câmpuri Gigel-Validated + ADR 017 Demographic Prior Database.

### 36.45 T2 Wording Funcțional Mode Detection LOCKED V1

**Decizie:** Întrebarea T2 (cold-start mode detection) reformulată funcțional — NU jargon profile names.

**Wording UI Final T2:**

> **"Cum preferi să îți afișăm instrucțiunile?"**
>
> [ ] Vreau doar să văd greutatea și repetările → Mode Map: **Executor**
> [ ] Vreau să înțeleg și de ce s-au schimbat numerele → Mode Map: **Strategic**

**Plasă de Siguranță:**
- Cold-start binar Executor vs Strategic acoperă orice user (Maria/Marius/Gigica)
- Behavioral triggers §36.17 (Frustrat Tehnic / Frustrat Viață / Validation-Seeking) detectate independent de declared T2
- Auto-correction §36.34 la 8 sesiuni dacă cold-start greșit (drift behavioral 3/3 simultaneous → prompt mode shift)

**Gigel Test Pass:** Maria 65 înțelege "vreau doar să văd greutatea și repetările" (acțiune concretă). Marius IQ 139 înțelege "vreau să înțeleg de ce" (signal Strategic clear). Gigica 50 → fie/fie, mode-ul real validate behavior post-T2.

**Cross-refs:** §36.17 4 Moduri UI Detection + §36.34 Profile Validation Layer + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT — extends cu T2 wording funcțional EXT-7).

### 36.46 Pricing Strategy Deferred Pre-Launch LOCKED V1

**Decizie:** Pricing & Paywall flow NU în mandatory pre-launch questions. Skip pre-launch, decide la launch în funcție de piață.

**Rationale Defer:**
- Bootstrap solo Daniel — NU trebuie market data înainte beta
- Beta cohort 50 users (§36.47) = primary feedback channel
- Pricing optimal post-beta când cohort comportament real validat
- Founding Members lifetime free DEJA decis vault (§36.9 ELIMINATE V1, but Founding Members positioning question remains)

**Action Items Open:**
- Founding Members positioning (lifetime free vs first year free, cine intră) → BLOCKER pre-launch separat
- Standard pricing strategy → defer launch
- Trial mechanics (no card / card upfront / X days free) → defer launch

**Cross-refs:** §36.13 Beta-launch ASAP + §36.47 Beta Cohorts + Carry-over Founding Members positioning + §36.9 Founding Members + Discord ELIMINATE V1.

### 36.47 Beta Recruitment 50 Users 3 Cohorts LOCKED V1

**Decizie:** Primii 50 beta users selectați manual — NU marketing deschis. 3 cohort-uri target pentru feedback dogfooding multi-spectrum.

**Cohort Structure:**

| Cohort | Size | Profil | Scop Feedback |
|--------|------|--------|---------------|
| Daniel's Inner Circle | 20 | Prieteni/cunoscuți pasionați fitness | Bug reports + jargon-aware feedback |
| The "Gigel" Test Cohort | 15 | 50-60 ani (Maria/Gigica typology) | Simplitate UI + Gigel test live |
| Power-User Cohort | 15 | Marius typology (25 ani trag tare) | Limite engine progresie + edge cases |

**Channel Decision (BLOCKER pre-launch):** ~~Discord vs WhatsApp vs Telegram → action item separat decizie. Carry-over §29.6.3 Discord references sweep pending.~~ **[RESOLVED 2026-05-02 Chat D §36.53 Telegram WIN + §36.54 Topics + §36.55 GDPR Phone Privacy. Vault sweep applied 2026-05-02 — Discord references DEPRECATED.]**

**Realistic Check Open Items:**
- 20 inner circle realistic count? (Daniel solo verify)
- 15 Gigel cohort recruitment plan concret? (părinți, vecini, prieteni părinți)
- ~~Channel decide single (NU "Discord/WhatsApp" ambiguous)~~ **[RESOLVED 2026-05-02 Chat D §36.53 Telegram Group + Topics LOCKED V1.]**

**Cross-refs:** §36.13 Beta-launch ASAP + Carry-over Founding Members + Carry-over Discord references sweep §29.6.3.

### 36.48 Per-Set Normalization Performance Drop LOCKED V1

**Decizie:** Calcul Performance Drop în Composite Signal Layer (§36.41) pe **avg(kg × reps) PER SET COMPLETAT**, NU volum total sesiune.

**Formula:**
```
Performance Drop = (avg V last 4 sessions − avg V current) / avg V last 4 ≥ 10%
avg V = avg(kg × reps) per set VALIDATED
```

**Excluse din Calcul:**
- Seturi marcate `skipped`
- Seturi marcate `forced-exit` (ex: Aparat ocupat la finalul listei §36.37)
- Seturi marcate `time-compressed` (ex: Modul 25min §36.33)

**Rationale:** False positive risk: volum total sesiune < baseline pentru că user a folosit `[Aparat ocupat]` sau `[Modul 25min]` (constrângeri context legitime, NU oboseală cronică). Per-set normalization → Composite Signal NU triggerează când set count redus din motive context, doar când performance per set validat scade real.

**Aliniat §36.21 spirit completion-based, NU calendar/total-based.**

**Cross-refs:** §36.21 Completion-Based + §36.33 Time-Constrained + §36.37 Smart-Routing + §36.41 Composite Signal Layer.

### 36.49 Composite Signal Dual-Threshold + Recovery Volume -20% Fixed LOCKED V1

**Decizie:** Performance Drop trigger = dual-threshold (procentual + absolut). Recovery State Adjustment volume reduction = fix -20% (NU interval).

**Dual-Threshold Performance Drop:**
```
Performance Drop validated =
  (Procent Drop ≥ 10% per §36.48 formula)
  AND
  (Δ Kg ≥ 2.5 kg OR Δ Reps ≥ 2)
```

**Validation Test Cases — Maria 65 DB Bench Press (15kg × 10 reps baseline):**

**Scenariu A — Fluctuație normală:**
- Curent: 15kg × 9 reps
- Volum mediu trecut: 150 kg-reps/set
- Volum mediu curent: 135 kg-reps/set
- Procent drop: 10% ✓
- Δ Kg: 0 kg ✗
- Δ Reps: 1 rep ✗
- **Result: FALSE — NU triggerează (false positive evitat)**

**Scenariu B — Oboseală reală:**
- Curent: 15kg × 8 reps
- Volum mediu trecut: 150 kg-reps/set
- Volum mediu curent: 120 kg-reps/set
- Procent drop: 20% ✓
- Δ Reps: 2 reps ✓
- **Result: TRUE — Composite Signal validated**

**Recovery Volume Reduction — Fix -20%:** Eliminat interval 15-20%. Determinism maxim. Consistency cu:
- §36.19 Auto-pedeapsă (-20% manual reduction trigger)
- §36.39 Yellow Flag test load (-20%)
- §36.49 Recovery State Adjustment (-20%)

**Implementation Code Mechanic:** Recovery State Active 2 sesiuni → engine aplică reducere -20% volum total exercițiu:
- Reduce 1 set complet din structură, SAU
- Reduce proporțional repetările, păstrând intensitatea kg/bară intactă

Engine alege opțiunea care preserve cel mai bine pragul stimulare neuro-musculară per profil.

**Cross-refs:** §36.19 + §36.39 + §36.41 + §36.48.

### 36.50 Founding Members + Standard + Elite Pricing LOCKED V1

**Decizie:** Structura prețuri Andura V1 finalizată — anchored sub SensAI (€65/an) pentru piața RO bootstrap solo founder.

**Tabel Prețuri LOCKED V1:**

| Tier | Preț Anual | Context |
|------|-----------|---------|
| **Founding V1 (cap 50)** | **€39 / an** | 34% discount permanent vs Standard. Beta cohort §36.47. |
| **Standard V1 Core** | **€59 / an** | Motorul deterministic local-first complet. Sub SensAI €65. |
| **Elite V1.1 (Lansare Martie 2027)** | **€79 / an** | Core V1 + Snapshot Gated Consultation Claude API (max 30 requests/lună). |

**Rationale Pricing Sub-SensAI:**

Moats Andura V1 vs SensAI (insufficient pentru premium pricing la achiziție, sufficient pentru retenție):
- Local-first + Limba Română native (Maria 65 + Gigica 35 piață RO)
- Latență <100ms vs 3-8s SensAI (oboseală conversațională elimnată)
- Privacy total Zero Cloud Inference V1 (UE moat)

**De ce sub-SensAI obligatoriu:** Bootstrap solo founder fără brand → trust deficit → pricing trebuie sub competitor reputat. Moat tehnic NU e perceived value pentru Gigel — perceput abia după 3 luni utilizare.

**Push-back productive integrate:**
1. Standard €99 inițial RESPINS — depășea SensAI cu 50%, Gigel test fail brutal.
2. Elite €149 inițial RESPINS — saltul +51% Standard→Elite irațional vs SensAI unlimited LLM €65.
3. "Lifetime €50" RESPINS — sinucidere financiară pe termen lung, scope creep beachhead.

**Cross-refs:** §36.46 Pricing Strategy Deferred Pre-Launch (now resolved) + §36.47 Beta Recruitment 50 Users 3 Cohorts.

### 36.51 Founding Locked-In Price Guarantee — 3 Years + 34% Permanent LOCKED V1

**Decizie:** Founding Members beneficiază de garanție preț pe 2 paliere — locked 3 ani + discount permanent perpetual aliniat la Standard curent.

**Mecanică Garanție:**
- **Anii 1-3:** Founding Member plătește €39/an LOCKED indiferent de evoluția prețului Standard.
- **Din Anul 4:** Founding Member plătește **34% sub Standard CURENT** (NU Standard MOMENTAN la momentul aderării). Adică dacă Standard urcă la €79/an în 2030, Founding plătește €52/an (tot 34% discount).

**Validation Math Long-term:**

| An | Standard | Founding (34% sub Standard curent) |
|----|----------|-----------------------------------|
| 1-3 | €59/an | **€39/an LOCKED** |
| 4 (dacă Standard urcă la €69) | €69/an | €45/an |
| 5 (dacă Standard urcă la €79) | €79/an | €52/an |

**Wording UI Plată Beta — Gigel Test Compliant:**

> *"Devino Membru Fondator pentru doar €39/an. Prețul tău rămâne blocat în primii 3 ani, iar ulterior păstrezi o reducere permanentă de 34% pe viață, indiferent cât de mult va crește prețul Andura."*

**Push-back productive integrate:**
1. "20% discount din anul 4" RESPINS — wording trap care creează percepție trust breach când Standard urcă (Founding ajunge înapoi la prețul SensAI).
2. "Lifetime 50€" RESPINS — incompatibil cu sustenabilitate Firebase + Claude API costs scaling.

**Cross-refs:** §36.50 Pricing Tiers + §36.46 Pricing Strategy.

### 36.52 Founding Cohort Hard Cap 50 + Auto-Close Mechanic LOCKED V1

**Decizie:** Hard cap strict 50 utilizatori Founding Members. Mecanică auto-close în baza de date.

**Mecanica Cap:**
- **Cap exact:** 50 utilizatori Founding (NU 49, NU 51).
- **Auto-close trigger:** Odată ce al 50-lea utilizator activează abonamentul €39/an, tier-ul Founding se închide automat în baza de date locală + Firebase.
- **Post-cap behavior:** Următorii utilizatori care intră în aplicație văd direct prețul Standard de €59/an.
- **Wait-list V1.1:** Opțional, post-cap utilizatorii pot opta pentru wait-list Elite V1.1 Martie 2027.

**Math Cap Loss — Reframing Onest:**

NU e "buget marketing" — reframing onest necesar:
- 50 founding × €39 = **€1.950/an revenue Founding actual**
- Same 50 la Standard €59 = €2.950/an
- **Diferență €1.000/an = 34% revenue cedat** pentru:
  - High-signal dogfooding (50 useri reali testează la sânge motorul determinist în săli reale)
  - Social proof (primele 50 recenzii 5★ Google Play, esențiale lansare publică V1.1)
  - Growth loops (recomandări organice word-of-mouth)

Schimb comercial onest reciproc avantajos. ZERO disguise marketing.

**Push-back productive integrate:**
1. "Cap unlimited Founding" RESPINS — unlimited cap loss = unsustainable revenue future.
2. "Buget marketing €1.000" reframing — onestitate sacrificiu revenue, NU paravan corporate speak.

**Cross-refs:** §36.50 Pricing Tiers + §36.51 Locked-In Guarantee + §36.47 Beta Recruitment.

### 36.53 Beta Channel Decision — Telegram Group + Topics LOCKED V1

**Decizie:** Telegram Group cu funcția Topics = canal beta pentru cohort 50 Founding Members. **ELIMINĂ Discord + WhatsApp.**

**Rationale Telegram:**

| Platformă | Avantaje | Dezavantaje (Friction) |
|-----------|----------|------------------------|
| Discord | Organizare perfectă (threads/channels) | Maria 65 NU își va face cont. Prea multe ecrane onboarding. |
| WhatsApp Group | Zero friction. Toată lumea îl are. | Un singur fir conversație. Haos total raportare bug-uri. |
| **Telegram Group + Topics** | Organizat ca Discord (Topics) + UI chat familiar Maria | Necesită setare inițială confidențialitate număr telefon. |

**Decision: Telegram WIN pentru toate 3 cohorts:**
- **Daniel's Inner Circle (20):** prieteni/cunoscuți pasionați fitness — Telegram OK
- **The "Gigel" Test Cohort (15):** 50-60 ani Maria/Gigica typology — Telegram already deja folosit pentru știri/family chats
- **Power-User Cohort (15):** Marius typology — Telegram features Discord-like (topics, bots, search)

**Carry-over §29.6.3 Discord references sweep — OBLIGATORIU acum:**
- ~~`01-vision/PRODUCT_STRATEGY_SPEC_v1.md §1.4` — replace "Discord" → "Telegram Group + Topics"~~ **[COMPLETED 2026-05-02 vault sweep CC Opus — commit `eaa599f`]**
- `06-sessions-log/HANDOVER_GLOBAL §29.6.3` — replace + cross-ref §36.53
- ADR `Q-0533` — mark DEPRECATED + new ADR sau amendment

CC Opus task paralel ~30min — vault sweep mecanic identic Founding sweep.

**Cross-refs:** §36.47 Beta Recruitment 50 Users + §29.6.3 Discord references (DEPRECATED post §36.53) + §36.9 Founding Members + Discord ELIMINATE V1.

### 36.54 Telegram Topics Structure LOCKED V1

**Decizie:** 4 Topics structurate în grupul Telegram beta — simulează Discord channels în UI familiar Maria.

**Topics Structure:**

| Topic | Scop | Permissions |
|-------|------|-------------|
| 📌 `#Anunțuri` | Daniel postează updates, linkuri TWA/PWA noi, status producție | **Read-only** pentru utilizatori |
| 💬 `#General` | Chat liber, întrebări, discuții între membrii beta | Read + Write toți membrii |
| 🐛 `#Bug-Reports` | Capturi ecran, rapoarte crash (Marius typology) | Read + Write toți membrii |
| 💡 `#Sugestii-V1.1` | Idei pentru Elite tier AI Coach (V1.1 Martie 2027) | Read + Write toți membrii |

**Filozofie:**
- **Maria 65 friendly:** UI Telegram = familiar (deja folosit pentru știri, family). Zero learning curve UI.
- **Discord-like organization:** Topics simulează channels separation, dar fără friction Discord onboarding (account separat, UI complex).
- **Bot integration ready:** future automation deploy notifications + auto-feedback collector via Telegram Bot API.

**Cross-refs:** §36.53 Telegram Channel Decision.

### 36.55 GDPR Phone Privacy Onboarding Rule LOCKED V1

**Decizie:** Înainte de a primi link grupul Telegram, fiecare din cei 50 Founding Members primește **tutorial vizual 4-step** cu screenshot pentru protecția numărului de telefon.

**Problema:** Spre deosebire de Discord, pe Telegram membrii grupului își pot vedea numărul de telefon dacă NU au configurat corect profilul. **Privacy hole real GDPR/EU pentru beta cohort RO.**

**Mecanica Onboarding:**

Pre-grupul invite, Daniel trimite pe WhatsApp/Email un screenshot tutorial cu 4 pași și săgeți roșii:

```
[Pasul 1: Menu] → [Pasul 2: Settings] → [Pasul 3: Privacy] → [Pasul 4: Nobody]
```

**Rationale Vizual NU Text:**
- Maria 65 NU citește "Settings ──► Privacy and Security ──► Phone Number ──► Who can see my phone number: Nobody."
- Maria 65 URMĂREȘTE săgeți roșii pe imagine. Tutorial vizual = friction zero.
- Bugatti filter PASS: privacy hole acoperit elegant, NU "rule text" tip burocratic.

**Push-back productive integrate:**
1. "Instrucțiuni text traseu Settings ──► Privacy" RESPINS — text de tip traseu ignorat de utilizatori non-tehnici.
2. Screenshot tutorial 4-step + WhatsApp/Email pre-grup invite — adoptat ca rule LOCKED.

**Cross-refs:** §36.53 Telegram Channel + §36.54 Topics Structure + GDPR/Privacy Policy compliance.

### 36.56 5 ADR Drafts → LOCKED V1 (Process §36.42 EXECUTED) LOCKED V1

**Decizie:** Toate 5 ADR drafts pre-launch au fost reviewed file-by-file per §36.42 process (Claude pre-citire integrală + raport per ADR + Daniel decision pe flagged). Toate 5 → LOCKED V1.

**Tabel Verdict per ADR:**

| ADR file | Verdict | Amendments |
|----------|---------|------------|
| `ADR_RIR_MATRIX_ADAPTIVE_v1.md` | ✅ **LOCKED V1** | 0 (spec gap hybrid exercises = Sprint 4.x mecanic action item) |
| `ADR_MODE_DETECTION_UI_v1.md` (cu EXT-1 → EXT-7) | ✅ **LOCKED V1** | 3 amendments aplicate (vezi §36.57) |
| `ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (cu EXT-1) | ✅ **LOCKED V1** | 0 |
| `ADR_OUTLIER_FILTER_v1.md` (cu EXT-1 → EXT-3) | ✅ **LOCKED V1** | 1 amendment aplicat (vezi §36.57) |
| `ADR_CASCADE_DEFENSE_v1.md` (cu §EXTENSION + EXT-2) | ✅ **LOCKED V1** | 0 |

**Process Validation:**
- Claude pre-citire integrală: ~20 min (5 drafts citite cap-coadă + cross-refs validate vs §36.16-§36.49)
- Raport structurat per ADR: consistency check + edge cases + spec gaps + flag list
- Daniel decision pe flagged: 4 amendments confirmate, 0 reject
- Total chat strategic effort: ~1.5h (per estimate §36.42)

**Sprint 4.x Cluster UNBLOCKED:** Toate 5 ADR LOCKED → Sprint 4.x cluster scope complet.

**3 NEW ADR drafts STILL deferred Sprint 4.x cluster batch creation:**
- `ADR_COMPOSITE_SIGNAL_LAYER_v1.md` (LOCKED V1 post BATCH_01 2026-05-02) — §36.41 + §36.48 + §36.49
- `ADR_PAIN_DISCOMFORT_BUTTON_v1.md` (LOCKED V1 post BATCH_01 + EXT-1 DOMS hide 2026-05-02) — §36.38
- `ADR_SMART_ROUTING_EQUIPMENT_v1.md` (LOCKED V1 post BATCH_01 2026-05-02) — §36.36 + §36.37

**Cross-refs:** §36.42 ADR Review Process + 5 ADR drafts în `03-decisions/` + §34.4 Sprint 4.x cluster scope + §36.57 amendments aplicate.

### 36.57 4 Amendments Aplicate ADR_MODE_DETECTION + ADR_OUTLIER_FILTER LOCKED V1

**Decizie:** 4 amendments minore aplicate inline în ADR drafts pre-LOCK. Effort total ~15min mecanic. ZERO strategic re-discutare.

**Amendments ADR_MODE_DETECTION_UI_v1.md (3 amendments):**

#### Amendment 1: EXT-3 Profile Validation — Rolling Window Specification

**Trigger ambiguity (pre-amendment):** `rate_de_ce < 5%` calculat pe ce window? Cumulative all-time sau rolling?

**Amendment LOCKED:**
> Pragul de calcul pentru rata de apăsare pe butonul „De ce?" (`rate_de_ce < 5%`) NU se calculează pe tot istoricul utilizatorului, ci pe **un rolling window de exact ultimele 8 sesiuni consecutive finalizate**.

**Rationale:** Asigură consistența cu pattern-ul Composite Signal (§36.41 last 4 sessions cached). Elimină influența primelor săptămâni de utilizare.

#### Amendment 2: EXT-5 Cooldown Rationale — 3 Cicluri Audit Explicit

**Trigger ambiguity (pre-amendment):** "24 sesiuni cooldown" = magic number arbitrar.

**Amendment LOCKED:**
> Perioada de cooldown de 24 de sesiuni după refuzul utilizatorului de a schimba profilul este definită în mod explicit ca **3 cicluri complete de audit** (`3 × 8 sesiuni audit interval`).

**Rationale:** Motorul lasă să treacă exact 3 cicluri detecție înainte re-evaluare prompt drift. Eliminat senzație hărțuire user.

#### Amendment 3: EXT-6 Cross-Ref vs Goal Shift Distinction

**Trigger gap (pre-amendment):** EXT-6 specifies "streak counter PRESERVE" dar NU cross-ref ADR_OUTLIER EXT-2 distincție Profile Reset vs Goal Shift.

**Amendment LOCKED — text adăugat în EXT-6:**
> *"Notă de contrast: În timp ce Resetarea Manuală a Profilului din Setări (EXT-6) păstrează streak counter-ul de 3 sesiuni intact (fiind o schimbare strict de UI/UX), Schimbarea Obiectivului de antrenament (Goal Shift - ADR_OUTLIER EXT-2) RESETEAZĂ obligatoriu streak counter-ul la 0, deoarece contextul fizic și intensitatea de lucru se modifică complet."*

**Rationale:** Elimină ambiguitate cross-ADR. Cititor înțelege distincția PRESERVE vs RESET fără re-citire ADR_OUTLIER separately.

**Amendments ADR_OUTLIER_FILTER_v1.md (1 amendment):**

#### Amendment 4: EXT-2 PHASE_B_LOCK_REQUIRED Production Gate

**Trigger gap (pre-amendment):** EXT-2 Goal Shift Conversion Interval specifies "Phase B wording placeholder pending" dar NU declară explicit `PHASE_B_LOCK_REQUIRED` flag.

**Amendment LOCKED — code object adăugat în EXT-2:**

```javascript
const GOAL_SHIFT_CALIBRATION_PLACEHOLDER = {
  id: "goal_shift_calibration_notice",
  text: "[PHASE_B_WORDING_PENDING — fallback: Estimat: X-Y kg x Z reps. Primele 2 sesiuni sunt de calibrare.]",
  status: "PHASE_B_LOCK_REQUIRED — DO NOT SHIP TO PRODUCTION"
};
```

**Rationale:** Asigură că scriptul de build CI/CD (`npm run build:prod`) blochează corect compilarea aplicației dacă acest string nu a fost validat în Sesiunea Phase B. Consistency cu pattern existent ADR_MODE_DETECTION EXT-4.

**Production Gate Updated:**

Build script grep blocks shipping pe **AMBELE** placeholders:
- `PROMPT_PROFILE_VALIDATION_PLACEHOLDER` (ADR_MODE_DETECTION EXT-4) — §36.34 origin
- `GOAL_SHIFT_CALIBRATION_PLACEHOLDER` (ADR_OUTLIER_FILTER EXT-2 amended) — §36.35 origin

Phase B mini-sesiune scope updated: **35 strings cumulative confirmate** (33 existing + 2 NEW = §36.34 PROMPT_PROFILE_VALIDATION + §36.35 GOAL_SHIFT_CALIBRATION).

**§AMENDMENT 2026-05-02 Chat E — Inventory count correction (per §36.58):**

Phase B scope actual count = **51 strings cumulative** (NU 35), discovered în review chat strategic Chat E. Diferența 16 strings: §25 outdated inventory NU acoperă intensity labels (4) + technique descs (2) + start rationales (4) + phase timeline labels (4) + checkpoint sub-labels (1) + tempo notes (1 inflated estimate). Detail spec breakdown per §36.58: fatigue.js 8 + dp.js 20 + reality.js 6 + sys.js 13 + calibration.js 4 + 2 NEW placeholders = 51 cumulative.

**Amendment 2026-05-02 (per ALIGNMENT_QUESTIONS Q8):** verdicte total = **11 categorical** (10 tranziție + 1 ON_TARGET stare neutră). Summary dp.js count rămâne **20 strings** (verdict + supporting + transitions + UI labels). NU discrepancy real — clarification doar.

**Cross-refs:** §36.56 ADR Review Process EXECUTED + ADR_MODE_DETECTION_UI_v1 EXT-3/EXT-5/EXT-6 + ADR_OUTLIER_FILTER_v1 EXT-2 + §36.58 Phase B Wording 51 Strings LOCKED V1.

### 36.58 Phase B Engine Wording — 51 Strings LOCKED V1

**Decizie:** Toate string-urile user-facing din 5 module engine-level sunt LOCKED V1 cu wording final, post-review chat strategic Daniel + Claude (~2h, 50 Q-uri Chat E). Amendment §36.57 inventory: count actual = **51 strings** (NU 35), diferența discovered în review (intensity labels + technique descs + start rationales + phase timeline labels + checkpoint sub-labels NU acoperite în §25 outdated inventory).

#### Filter Bugatti aplicat strict (10 reguli)

1. **Sentence case pur** (NU CAPS, NU Title Case) per Q4 lock
2. **Voice persoana I plural** ("noi/menținem/recalibrăm") per §19 evening lock + Q3 lock
3. **ZERO numerice algoritmice raw** (scor X/100, RPE, readinessScore, userWeight) per §6 evening lock + Q6 lock
4. **ZERO category exposure** (`fatigue`/`sleepBad`/`formBad`/`strong` raw) per Q6 lock
5. **ZERO comenzi paternaliste** ("redu volumul!", "fă X reps") per §22 F-NEW-4 + Q7 lock
6. **Reframing pozitiv** (recuperare = goal, NU deficit) per §27 evening lock
7. **Temporal-safe** (păstrăm "azi", eliminăm "săptămâna asta"/"perioadă") per §6 evening + Q8 lock
8. **Emoji constraint** (păstrăm doar 🔴🟡🟢 semantic + 🟠 excepție RIR gauge) per Q2 + Q26.bis lock
9. **Phase RO native** (CUT→definire, BULK→creștere, MAINTENANCE→menținere) per §27 evening lock
10. **"reps" peste tot** (NU "repetiții" academic) per Q-pushback lock — vocabular gym RO universal

#### fatigue.js — 8 strings (4 verdicte + 4 detail)

| Cheie tehnică | Label user | Detail user |
|---|---|---|
| `HIGH_FATIGUE` | Azi mergem mai blând | Au fost câteva sesiuni grele recent. Volumul este calibrat mai conservator pentru o recuperare completă. |
| `MODERATE_FATIGUE` | Pas mai conservator | Astăzi menținem greutățile, cu accent pe tehnică și control. |
| `PEAK_FORM` | Suntem în formă bună | Recuperarea este completă. Avem energie să plusăm pe bară astăzi. |
| `NORMAL` | Pe drum bun | Ritmul este sănătos. Mergem cu planul de astăzi. |

#### dp.js — 20 strings (10 verdicte + 4 intensity + 2 adjust + 4 start)

**Verdicte progresie (10 strings):**

| Cheie tehnică | Label | Note |
|---|---|---|
| `INITIAL_START` | 🟡 Pornim conservator | Greutate de pornire. O recalibrăm după primul set. |
| `SCALE_BACK` | 🟡 Scădem un pas | ${lastW} kg → ${prevKg} kg · Nu am ajuns la intervalul de reps minim. |
| `PEAK_LIMIT` | 🟢 La vârf | ${lastW} kg este plafonul pe acest exercițiu. Focus pe o execuție impecabilă. |
| `CAP_REPS` | 🟢 Creștem reps | Suntem la plafonul de greutate (${maxKg} kg). Astăzi urcăm la ${targetReps} reps. |
| `TOO_HEAVY` | 🔴 E prea greu | Ultima dată: ${lastW} kg × ${lastReps} reps. Țintim ${targetReps} astăzi. |
| `CONSOLIDATE` | 🟡 Consolidăm reps | Ultima dată: ${lastW} kg × ${lastReps} reps. Țintim ${targetReps} astăzi. |
| `INCREASE` | 🟢 Creștem greutatea | ${lastW} kg → ${newKg} kg · Revenim la ${rMin} reps |
| `STAGNANT_PLUS_SET` | 🟡 Plus un set azi | Greutate constantă 3 sesiuni · Astăzi adăugăm 1 set |
| `MAINTAIN_CUT` | 🟡 Consolidare în definire | Stagnare 3 sesiuni la ${lastW} kg · În definire prioritizăm calitatea, nu greutatea |
| `TECHNIQUE_DROP_SET` | 🟡 Drop set la final | Stagnare lungă · Drop set pe ultimul: −30% greutate pentru a sparge platoul |
| `ON_TARGET` | 🟢 În țintă | Ultima: ${lastW} kg × ${lastReps} reps |

**Intensity labels — RIR gauge (4 strings, excepție 🟠 per Q26.bis):**

| Cheie tehnică | RIR range | Label |
|---|---|---|
| `INTENSITY_LIMIT` | 0-1 reps în rezervă | 🔴 La limită |
| `INTENSITY_HEAVY` | 1-2 reps în rezervă | 🟠 Greu |
| `INTENSITY_CHALLENGING` | 2-3 reps în rezervă | 🟡 Provocator |
| `INTENSITY_COMFORTABLE` | 3+ reps în rezervă | 🟢 Confortabil |

**In-session adjust pop-up (2 strings):**

| Cheie tehnică | Tip | Mesaj |
|---|---|---|
| `IN_SESSION_DOWN` | Pop-up Alert | Greutatea este prea mare · Trecem la ${newKg} kg pentru următorul set |
| `IN_SESSION_UP` | Pop-up Alert | Două seturi prea ușoare · Urcăm la ${newKg} kg pentru următorul set |

**Start verdicte (4 strings — `getInitialRecommendation`):**

| Cheie tehnică | Label | Note |
|---|---|---|
| `START_EXACT_MATCH` | 🟡 Continuăm | Pornim de la ultima sesiune: ${weight} kg |
| `START_SIMILAR` | 🟡 Pornire estimată | Pornim de la ${similarName} · ${weight} kg cu ajustare ×${multiplier} |
| `START_FALLBACK` | 🟡 Pornim conservator | Greutate de pornire · Recalibrăm după primul set |
| `READINESS_OVERRIDE` | (note only) | Recuperare incompletă · Menținem ${result.kg} kg azi |

#### reality.js — 6 strings

| Cheie tehnică | Tip | Text |
|---|---|---|
| `FIXED_PHASE_NOTICE` | Dashboard Card | Menținem ${KCAL_TARGET} kcal fix până la 20 iulie |
| `AUTO_PHASE_NOTICE` | Dashboard Card | Menținem ${KCAL_TARGET} kcal |
| `PROGRESS_TOO_SLOW` | Status Note | Progres mai lent decât țintit · Verificăm aportul sau activitatea |
| `PROGRESS_ON_TRACK` | Status Note | Suntem în ritmul țintit · Menținem direcția |
| `PROGRESS_PLATEAU` | Status Note | Greutatea nu a scăzut în ultimele 7 zile. Hai să vedem ce putem ajusta în strategie. |
| `PROGRESS_TOO_FAST` | Status Note | Slăbim un pic prea repede și riscăm să pierdem din masa musculară. Hai să creștem temporar aportul la ${suggestedKcal} kcal pentru a ne proteja progresul. |

#### sys.js — 13 strings (4 tempo + 2 technique + 3 contextual + 4 phase/checkpoint)

**Tempo notes (4 strings):**

| Cheie tehnică | Context | Text |
|---|---|---|
| `TEMPO_STRENGTH_COMPOUND` | Strength Compound | Ridicăm exploziv, coborâm controlat |
| `TEMPO_STRENGTH_ISO` | Strength Isolation | Mișcare controlată, fără elan |
| `TEMPO_BULK_COMPOUND` | Bulk Compound | Coborâre lentă, tensiune prelungită |
| `TEMPO_BULK_ISO` | Bulk Isolation | Strângere maximă în vârf |

**Technique descriptions (2 strings):**

| Cheie tehnică | Text |
|---|---|
| `TECHNIQUE_DROP_SET_SYS` | −30% greutate pe ultimul set · Mergem până nu mai putem |
| `TECHNIQUE_PARTIALS` | 10 reps parțiale după ultimul set complet |

**Contextual notes (3 strings):**

| Cheie tehnică | Text |
|---|---|
| `NOTE_SQUEEZE` | Strângere maximă în vârf |
| `NOTE_PUMP_QUALITY` | Calitatea execuției peste greutate |
| `NOTE_CUT_DEFENSE` | În definire menținem, nu împingem |

**Phase timeline labels (4 strings — `getTimeline()`):**

| Cheie tehnică | Text |
|---|---|
| `PHASE_CUT_TO_SUMMER` | Definire până la vară |
| `PHASE_SUMMER_PEAK` | Vară peak (menținere) |
| `PHASE_BULK_AUTUMN` | Creștere (toamnă-iarnă) |
| `PHASE_CUT_PRE_SUMMER` | Definire pre-vară |

**Checkpoint label (1 string — `getCheckpoints()`):**

| Cheie tehnică | Label | Sub-label |
|---|---|---|
| `CHECKPOINT_BULK_END` | Oprire creștere la ${bulkEndBF}% BF | ~${targetKg} kg — începe definirea |

#### calibration.js — 4 banner texts

| Tier | Cheie tehnică | Banner text |
|---|---|---|
| COLD_START (sesiuni 0-2) | `CALIB_COLD_START` | Învățăm cum lucrezi · Recomandările se personalizează după primele sesiuni |
| INITIAL (sesiuni 3-5) | `CALIB_INITIAL` | Învățăm cum lucrezi · Datele se adună cu fiecare sesiune |
| DEVELOPING (sesiuni 6-11) | `CALIB_DEVELOPING` | Tiparele prind contur · Recomandările folosesc datele tale |
| PERSONALIZING (sesiuni 12-40) | `CALIB_PERSONALIZING` | Recomandările sunt acum în mare parte personalizate · Continuăm să învățăm |

**Note:** PERSONALIZED + OPTIMIZED tiers păstrează `bannerText: null` (transparent UI), corect per maturity assumption.

#### 2 NEW placeholders Phase B critical (LOCKED V1)

**`PROMPT_PROFILE_VALIDATION_PLACEHOLDER` (§36.34 → ADR_MODE_DETECTION EXT-4):**

```javascript
const PROMPT_PROFILE_VALIDATION_PLACEHOLDER = {
  id: "profile_validation_drift_prompt",
  title: "Ajustăm modul de afișare a instrucțiunilor?",
  body: "Observăm că deschizi des explicațiile complete · Putem afișa contextul direct, fără să mai trebuiască să apeși pe 'De ce?'",
  buttons: {
    confirm: "Da, schimbă",
    cancel: "Nu, lasă așa"
  },
  status: "LOCKED V1 — production ready"
};
```

**`GOAL_SHIFT_CALIBRATION_PLACEHOLDER` (§36.35 → ADR_OUTLIER_FILTER EXT-2):**

```javascript
const GOAL_SHIFT_CALIBRATION_PLACEHOLDER = {
  id: "goal_shift_calibration_notice",
  title: "Recalibrăm pe noul obiectiv",
  body: "Primele 2 sesiuni sunt de calibrare · Estimăm ${minKg}-${maxKg} kg × ${reps} reps, ajustăm după ce avem date",
  subText: "Sesiunea ${current}/2",
  status: "LOCKED V1 — production ready"
};
```

#### Push-back-uri productive Claude integrate (10 majore)

1. **Q4 Title Case RESPINS** — sentence case pur RO native (Title Case = pattern EN forced translation)
2. **"reps" vs "repetiții" RESPINS** — păstrăm "reps" (vocabular gym RO universal naturalizat, equivalent kg)
3. **Q23 inconsistency "stagnare detectată" RESPINS** — păstrăm "stagnare" peste tot (RO gym natural NU engine-leak)
4. **Q24 "−30% greutate" notation FORCED** — simetric cu format `${lastW} kg → ${newKg} kg` din alte note
5. **Q26.bis 🟠 excepție justificată** — RIR gauge 4 niveluri logic distincte (NU tutorial-style noise)
6. **Q33 anti-paternalism "verifică" → "verificăm"** — voice plural collaborative, NU comandă
7. **Q35 "concentric" jargon ELIMINAT** — Maria 65 NU înțelege, traducere fizică ("ridicăm exploziv, coborâm controlat")
8. **Q39 "eșec" izolat psychological RESPINS** — "mergem până nu mai putem" voice plural conversațional
9. **Q42 "tipar" reductiv RESPINS** — continuitate narativă "învățăm cum lucrezi" Q41→Q42
10. **Q47 "Consolidăm" orfan ambiguu RESPINS** — "Continuăm" specific contextului EXACT_MATCH start

#### Production Gate Lift Status

**Pre-Phase B lock:** Build script CI/CD blochează shipping pe AMBELE placeholders pending wording validation.

**Post-Phase B lock (acum):** Wording final LOCKED V1 în ADR drafts. Build script CI/CD continuă să verifice flag-uri în code source (Sprint 4.x cluster va remove flag-urile la implementation), DAR strings-urile sunt clear pentru replacement.

**Lift production gate REQUIRES:**
- Sprint 4.x cluster: replace placeholder strings cu wording locked V1 + remove `PHASE_B_LOCK_REQUIRED` flags
- Test verification: `grep -rn "PHASE_B_LOCK_REQUIRED\|PHASE_B_WORDING_PENDING" src/` returnează ZERO matches
- CI/CD build pass

**Action item Sprint 4.x:** integration acestor 51 strings în code source ca parte din cluster batch implementation post-§36.56 ADR review process.

#### Source code updates pending Sprint 4.x

- `src/engine/fatigue.js` — 8 strings replace
- `src/engine/dp.js` — 20 strings replace
- `src/engine/reality.js` — 6 strings replace
- `src/engine/sys.js` — 13 strings replace
- `src/engine/calibration.js` — 4 banner texts replace
- 2 NEW placeholders integration în Sprint 4.x cluster modules respective

**Cross-refs:** §36.57 (production gate baseline + count amendment) + §36.34 (PROFILE_VALIDATION origin) + §36.35 (GOAL_SHIFT origin) + §22 F-NEW-4 (anti-paternalism lock) + §27 evening (phase RO + voice plural lock) + §19 evening (12 variations + voice unitar lock) + §6 evening (anti-RE numerice + temporal-safe lock) + §25 wording remaining + ADR_MODE_DETECTION_UI_v1 EXT-4 + ADR_OUTLIER_FILTER_v1 EXT-2.

### §36.59 FLAG 1 ADR 019 GDPR Discord refs → "community channel exposure" channel-agnostic LOCKED V1

**Data:** 2026-05-02 post §36.58 generare handover
**Sursă:** Chat strategic Daniel review ADR 019 GDPR data exposure section

**Decizie:** Înlocuire toate referințele "Discord" / "Discord channel" / "Discord community" din ADR 019 GDPR cu formulare channel-agnostic: "community channel exposure" / "public community channel" / "community engagement platform".

**Rationale:**
- ADR long-lived resilient — NU committezi azi la canal specific (Discord/Telegram/Slack/Reddit) când strategy marketing channel mix DEFERRED post-launch V1 (cross-ref §36.60)
- GDPR data exposure logic identică indiferent platformă (user data shared în public community = same risk profile)
- Future-proof: dacă mutăm Telegram → Discord → Reddit, ADR 019 NU necesită amendment

**Impact:**
- ADR 019 GDPR §AMENDMENT 2026-05-02 inline necesar (sweep "Discord" → "community channel")
- Cross-refs vault: orice doc care citează ADR 019 secțiunea data exposure → consistent terminology

**Status:** LOCKED V1 — ADR 019 amendment pending Sprint 4.x cluster (sau dedicated CC run earlier dacă scope mic)

### §36.60 TikTok/IG/FB/Discord public marketing channel mix DEFERRED post-launch V1 LOCKED V1

**Data:** 2026-05-02 post §36.58 generare handover
**Sursă:** Chat strategic Daniel decizie scope V1 vs V1.1

**Decizie:** Marketing channel mix public (TikTok / Instagram / Facebook / Discord / orice canal community public) = **DEFERRED post-launch V1**. Decizie firmă pre-V1.1 ~Februarie 2027 când:
- App live în producție stabilă
- Testimonials beta reale (NU synthetic / NU asumate)
- Bandwidth Daniel stable post launch chaos

**Rationale:**
- Pre-launch focus = build + ship, NU distribute
- Channel mix decizie premature fără data reală user behavior + retention
- Resource constraint: Daniel solo, channel management = hidden cost (content cadence, moderation, reply latency)
- V1.1 timing: 3-4 luni post launch = signal real ce funcționează vs ce e theatre

**Impact:**
- ADR 019 GDPR rămâne channel-agnostic (cross-ref §36.59)
- Pricing tiers (€39 Founding / €59 Standard / €79 Elite §36.50) NU dependent de channel marketing acum
- Telegram CTA (§36.53 + §36.54) rămâne sole pre-launch channel — NU expansion
- Roadmap V1.1 ~Februarie 2027 va include "Marketing Channel Mix Decision" ca milestone explicit

**Status:** LOCKED V1 — re-evaluare LOCKED pentru pre-V1.1 strategic review

### §36.62 ADR LOCKS POST ALIGNMENT_QUESTIONS 2026-05-02

3 ADR drafts → LOCKED V1 per Daniel responses ALIGNMENT_QUESTIONS:
- ADR_COMPOSITE_SIGNAL_LAYER_v1 LOCKED (Q1) — 3/3 threshold + lifecycle confirmed
- ADR_PAIN_DISCOMFORT_BUTTON_v1 LOCKED + EXT-1 (Q2) — DOMS hide behind "Mai multe opțiuni" expandable per Gigel test
- ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED (Q3) — tier-aware filtering + similarity 3/2/1 confirmed

**Cumulative LOCKED count:** 56 → 59 (+3 ADR drafts promoted)

### §36.63 §BATCH_PROTOCOL CODIFIED 2026-05-02

VAULT_RULES.md §BATCH_PROTOCOL section appended cu 8 elements MANDATORY (naming + header + disjuncte + fail-fast + zero gate + sequential + final batch + commit format) + trigger threshold + cross-refs Sprint 4.x pilot.

Pattern validated empiric Sprint 4.x cluster (5 batches sequential, zero errors). Now formal documentation prevent rediscovery effort.

**Cumulative LOCKED count:** 59 → 60 (+1 vault-rule formalized)

### §36.64 GOLDEN MASTER TESTS PRE-UI 2026-05-02

Snapshot tests created în `src/__tests__/golden-master/`:
- `dp-strings.golden.test.js` — dp.js intensity labels + initial recommendations + fatigue verdicte + calibration banners + sys.js timeline/tempo + Suflet Andura RIR Matrix (11 tests, 27 snapshots)
- `foundation-modules.golden.test.js` — Composite Signal 3/3 threshold + lifecycle state machine + Smart Routing tier-aware + Bias Detection 3/3 + Cascade Defense priority + Pain Button + Goal Shift Calibration (18 tests, 32 snapshots)

Per ALIGNMENT_QUESTIONS Q7 PRE-UI guard-rail. Industry pattern snapshot tests pentru protect Sprint UI Integration silent drift.

**Cumulative LOCKED count:** 60 → 60 (testing infra, NU decizie nouă)
**Tests delta:** 1174 → 1203 (+29)

### §36.65 NEXT CHAT AGENDA UPDATE 2026-05-02

Post ALIGNMENT_QUESTIONS Daniel responses — agenda revised:

**Removed (resolved/not necessary):**
- ❌ Q8 dp.js cosmetic count discrepancy fix (resolved Chat E Q4, 11 verdicte = 10+1 ON_TARGET, summary 20 OK)

**Confirmed deferred carry-overs:**
- Sprint UI Integration ~6-10h (post-3-ADR-LOCK ✅ + Firebase Auth solo Daniel)
- Manual exercise metadata audit ~2-3h (BATCH_05 acest cluster)
- Test coverage report (BATCH_07 acest cluster)
- Dependencies audit (BATCH_09 acest cluster — corectat: BATCH_08)
- Build perf baseline (BATCH_10 acest cluster — corectat: BATCH_09)

**Cumulative LOCKED count:** 60 → 60 (hygiene clarification, NU decizie nouă)

### §36.66 EXERCISE_METADATA AUDIT 2026-05-02

26 exerciții reviewed per ADR_SMART_ROUTING_EQUIPMENT_v1 criteria (force_demand + tier + muscle_target + equipment_type).

- **Changed:** 0 entries (conservative defaults empirically validated)
- **OK as-is:** 24 entries
- **FLAG post-Beta backlog:** 2 entries (Romanian Deadlift alternatives semantic mismatch hip-hinge vs knee-flexion + Hammer Curl alternatives expansion)

Sprint UI Integration consumă metadata audited din start (NO post-Beta blocking refactor needed). Detailed report `BATCH_05_AUDIT_DETAILS.md`.

**Cumulative LOCKED count:** 60 → 60 (data audit, NU decizie nouă)

### §36.67 CROSS-REFS AUDIT VAULT-WIDE 2026-05-02

Vault-wide audit `.md` cross-references (ADR + §X.Y + file links + path refs):
- **Total scanned:** ~50+ ADR refs + ~50+ §X.Y section refs + ~30+ path refs across **164 .md files**
- **Auto-fixed:** 3 (HANDOVER_GLOBAL §36.36 active list — `(NEW DRAFT)` → `(LOCKED V1 post BATCH_01 2026-05-02)`)
- **Preserved historical:** 2 locations (HANDOVER_GLOBAL line 4703 Sprint 4.x cluster execution session-lock entry + SPRINT_4X_FINAL_REPORT.md lines 355-357 BATCH_05 modificări) — audit trail per Bugatti paradigm
- **Broken:** 0
- **Manual review needed:** 0

Anti-drift Bugatti paradigm. Prevent rediscovery effort future. Detailed report `BATCH_06_CROSS_REFS_AUDIT.md`.

**Cumulative LOCKED count:** 60 → 60 (audit hygiene, NU decizie nouă)

### §36.68 TEST COVERAGE BASELINE 2026-05-02

Coverage baseline locked (vitest@3.2.4 + @vitest/coverage-v8): **lines 60.33%** / **branches 78.38%** / **functions 77.73%** / **statements 60.33%**.

- **Tests:** 1203 total, 75 files
- **High coverage (≥90%):** 18+ modules listed (schema + storage + auth + bootstrap + util core)
- **Gaps (<50%):** 8 modules (UI pages — legitimate Playwright e2e scope, NOT vitest unit)
- **Zero coverage:** 15 files (UI + themes + nav + sentry + admin tools)

Reference baseline pentru future regression detection. Sprint UI Integration impact assessment: coverage estimate post-Sprint ~70-75% lines (adding 1500-2000 covered lines în UI).

**Cumulative LOCKED count:** 60 → 60 (measurement, NU decizie nouă)

### §36.69 DEPENDENCIES AUDIT BASELINE 2026-05-02

Periodic dependency hygiene baseline:
- **Outdated:** 5 major (vite 5→8, vitest 3→4, @vitest/coverage-v8 3→4, @vitest/ui 3→4, jsdom 25→29) + 0 minor + 1 patch (@sentry/browser 10.50→10.51)
- **Vulnerabilities:** 0 critical + 0 high + 2 moderate (dev-only: esbuild dev server + vite optimized deps `.map`) + 0 low + 0 info

**Risk pre-Beta:** LOW — both moderate vulns dev-only, NOT exploitable production PWA Android. Major upgrades vite/vitest = post-Beta strategic backlog (breaking changes potential 1203 tests rewrite scope).

Detailed report `BATCH_08_DEPENDENCIES_AUDIT.md`.

**Cumulative LOCKED count:** 60 → 60 (measurement hygiene, NU decizie nouă)

### §36.70 BUILD PERF BASELINE 2026-05-02

Build performance baseline locked (vite@5.4.21):
- **Build time:** **4.026s wall-clock** (vite "built in 2.90s")
- **Total dist/:** **921 KB** (10 files, 4 JS chunks code-split + 1 CSS + HTML + 3 PWA assets)
- **JS gzipped:** ~265.69 KB / CSS gzipped: 5.98 KB / HTML gzipped: 11.53 KB
- **Cold-start mobile gzipped:** ~283 KB
- **3G slow estimate:** ~3.0s (acceptable PWA standard)

Reference baseline pre Sprint UI Integration (~+30 KB gzipped estimated, ~10% growth, ~+0.3s 3G acceptable). Regression check post-Sprint via `BATCH_09_BUILD_PERF_BASELINE.md`.

**Cumulative LOCKED count:** 60 → 60 (measurement, NU decizie nouă)

### §36.71 CLUSTER 10-BATCH SESSION LOCK 2026-05-02

**Cluster:** 10 batches sequential autonomous Opus execution
**Duration:** ~70min Opus runtime
**Status:** ✅ Complete (10/10 fail-fast strict, zero errors)

**Commits (10 hash):**
- BATCH_01 ADR LOCKS: `d48ef0d`
- BATCH_02 §BATCH_PROTOCOL: `d636895`
- BATCH_03 Golden Master: `70be861`
- BATCH_04 Hygiene: `fab67d7`
- BATCH_05 Metadata audit: `699679f`
- BATCH_06 Cross-refs: `775bf1b`
- BATCH_07 Coverage: `55e22c5`
- BATCH_08 Dependencies: `e26fdb7`
- BATCH_09 Build perf: `0c64a0c`
- BATCH_10 Final report: (acest commit)

**Key outcomes:**
- 3 ADR drafts → LOCKED V1 (cumulative LOCKED 56→59)
- §BATCH_PROTOCOL codified VAULT_RULES (cumulative LOCKED 59→60)
- Golden Master tests integrated pre-UI guard-rail (29 tests, 59 snapshots)
- 26 exerciții EXERCISE_METADATA audited (0 changed, 24 OK, 2 FLAG post-Beta)
- Vault-wide cross-refs hygiene complete (164 .md files, 3 auto-fixed, 0 broken)
- Coverage baseline locked (60.33% lines / 78.38% branches / 77.73% functions)
- Dependencies audit baseline (5 major + 2 mod dev-only vulns)
- Build perf baseline (4.026s / 921 KB / ~283 KB gzipped cold-start, ~3.0s on 3G)

**Tests delta:** 1174 → 1203 PASS (+29 net cluster, +8 test files)

**Final cumulative LOCKED count:** **60**

**Next:** Sprint UI Integration ~6-10h Opus (post Daniel solo Firebase Auth + DB rules + manual review flagged items dacă any).

Detailed cluster report: `📤_outbox/LATEST.md`. Per-batch reports: `📤_outbox/_archive/2026-05/BATCH_01_REPORT.md` through `BATCH_09_REPORT.md`.

### §36.72 SPRINT UI INTEGRATION SEQUENCING LOCKED V1 2026-05-02

**Decizie:** Sprint UI Integration **NU începe direct autonomous CC Opus** post cluster 10-batch. Sequencing real LOCKED:

1. **Daniel solo (~2-4h Daniel-time, gate critical pre Sprint UI):**
   - Firebase Auth setup live (Multi-tenant migration ADR LOCKED)
   - DB rules production deployment (`database.rules.json` publish)
   - GDPR screenshot tutorial (8-12 screenshots phone privacy onboarding §36.55)
   - Avocat barter outreach (Pro lifetime exchange GDPR audit)

2. **Strategic chat NEW Claude (~1-2h):** Sprint UI Integration design discussion — UX decizii multiple CEO Daniel needed:
   - 3 Card buttons flow (Aparat ocupat/lipsă/Disconfort §29.5 + Suflet Andura wiring + Pain Discomfort post EXT-1 cu DOMS hide)
   - Goal Shift card layout (§36.35) — position dashboard
   - DOMS expand pattern wording final ("Mai multe opțiuni" expandable per ADR_PAIN EXT-1)
   - Founding cap counter visibility tier-aware? (§36.50-§36.52)
   - Telegram CTA wiring placement layout (§36.53/§36.54)
   - PROMPT_PROFILE_VALIDATION UI render trigger pattern (§36.34)

3. **CC Opus autonomous (~6-10h):** Sprint UI Integration execution post strategic chat prompt design.

**Rationale lock:** Sprint UI = decizii UX strategice CEO Daniel, NU autonomous Opus. Risc generic dacă forțat acum = rescris post-Beta. Pattern §BATCH_PROTOCOL valid execution standard, dar requires upstream Daniel decisions.

**Empirical learnings cluster 10-batch (factor 5-7x optimism Opus estimates):**
- Sprint 4.x cluster pilot: ~70min actual vs 6-8h estimate
- Cluster 10-batch acest sesiune: ~70min actual vs estimate similar
- Future Opus estimates reduce proportional pentru clusters bine-spec'd cu disjuncte clean.

**§BATCH_PROTOCOL pattern scalability validated:** 10 batches sequential, fail-fast strict, zero errors. Pattern Sprint 4.x scalable la 10+ batches confirmat empirical.

**Read-only batches valid pattern:** Coverage + Dependencies + Build Perf baselines (BATCH_07-09) = pure measurement, NU code changes. Hygiene clusters legitimate scope.

**Auto-fixes safe la cross-refs (BATCH_06):** 3 auto-fixed, 0 broken, 0 manual review needed. Audit trail Bugatti respectat (2 historical refs preserved).

**Cumulative LOCKED count:** 60 → **61** (+1 Sprint UI sequencing decision LOCKED V1)

### §36.73 ALIGNMENT_QUESTIONS Q-Set NEW Resolution LOCKED V1 (2026-05-02 evening)

**Decizie:** Din 15 Q-uri propuse în `ALIGNMENT_QUESTIONS_CHAT_NEW.md` (cluster Sprint UI sequencing post-§36.72), **4 Q-uri rezolvate în chat alignment fără să intre în Sprint UI design**:

| Q | Status | Resolution |
|---|--------|------------|
| Q3 (CC batch sizing 5/7 batches) | ✅ RESOLVED → §36.74 BATCH_PROTOCOL extension | Halucinație chat anterior. Înlocuit cu regulă generică (vezi §36.74). |
| Q11 (GDPR + Avocat blocking Sprint UI) | ✅ RESOLVED → opțiunea C | GDPR + Avocat = pre-launch PUBLIC, NU pre-Beta închis cu prietenii. Sprint UI gate Daniel solo redus la Firebase Auth + DB rules (technical only). GDPR tutorial + Avocat outreach defer la launch oficial. |
| Q14 (Beta cohorts ratio €) | ✅ DEFER post-Beta | NU se discută înainte de launch oficial. După Beta cu prieteni avem date reale piață, atunci decidem ratio Founding/Standard/Elite. |
| Q15 (Marketing V1.1 timing reopen) | ✅ REJECTED | §36.60 LOCKED defer Februarie 2027. Întrebarea reopen = scope creep mascat. Out. |

**Cumulative LOCKED count impact:** +1 (61 → 62)

**Cross-refs:** §36.60 Marketing Channel Mix Decision V1.1 + §36.72 Sprint UI Sequencing LOCKED V1 + §36.47 Beta Recruitment 50 Users 3 Cohorts.

### §36.74 BATCH_PROTOCOL Extension — Default Batches + Single Output Report LOCKED V1 (2026-05-02 evening)

**Decizie:** Extension VAULT_RULES.md §BATCH_PROTOCOL (codified §36.63 cluster 10-batch) cu regula **mandatory default permanent**:

**Regula default:**
- Claude chat strategic generează **N artefacte CC prompts copy-ready distincte** (oricare N: 2, 3, 5, 6+) când scope-ul permite disjuncte clean
- Daniel drag toate N artefacte în 📥_inbox/
- Daniel comandă unică CC Opus: rulează batch-urile sequential per VAULT_RULES §BATCH_PROTOCOL
- CC Opus rulează batch după batch fail-fast strict
- **CC Opus produce 1 SINGUR raport `📤_outbox/LATEST.md` centralizat la final**, conținând outcomes pentru toate batch-urile rulate (NU 1 raport per batch separat în chat)
- Per-batch reports detaliate merg în `📤_outbox/_archive/<YYYY-MM>/BATCH_NN_REPORT.md` (consistent cu §36.63 cluster pattern)

**Excepție single prompt:**
- Single prompt CC = DOAR când scope nu se poate batch (interdependențe forțate, tot scope-ul atinge același module)
- Default = batch. Single = excepție justificată.

**Rationale:**
- Eficient pentru Daniel (drag-drop multiple, 1 comandă, 1 raport final)
- Empirical validated cluster 10-batch (factor 5-7x optimism, zero errors, raport centralizat funcționează)
- Reduce chat-back-and-forth pe per-batch progress

**Cumulative LOCKED count impact:** +1 (62 → 63)

**Cross-refs:** §36.63 §BATCH_PROTOCOL codified (cluster 10-batch session lock) + §36.71 Cluster Session Lock pattern + VAULT_RULES.md §BATCH_PROTOCOL.

### §36.75 Daniel Solo Gate Technical Execution Live LOCKED V1 (2026-05-02 evening)

**Decizie:** Documentare execution live Firebase Console manual setup completat de Daniel în chat alignment Q-uri. Sprint UI gate technical = CLEAR.

**Items completate:**

| Item | Status | Notes |
|------|--------|-------|
| Firebase Auth Email/Password + Magic Link enabled | ✅ DONE | Console live |
| Firebase Auth Google OAuth enabled | ✅ DONE | Public-facing project name = "Andura", support email = `maziludanielconstantin90@gmail.com` |
| Region confirmat europe-west1 | ✅ VERIFIED | GDPR EU residency per ADR_MULTI_TENANT_AUTH §5 |
| User Auth manual created | ✅ DONE | UID Daniel: `2GsDvxqXc4bvQGSm8B1Zft5S05i2`, email: `maziludanielconstantin90@gmail.com` |
| Backup RTDB local | ✅ DONE | Daniel salvat fișier export 49KB pe disk local |
| Data import în RTDB | ✅ DONE | Manual import via Console: `users/daniel` legacy + `users/{UID}` copy coexistă pre-cleanup task §TASK 1 acest batch |
| DB rules per-UID strict published | ✅ DONE | Sintaxa LOCKED §34.2 published live |
| Smoke test prod confirmat | ✅ DONE | GitHub Pages https://markaroundthestates-cyber.github.io/salafull/ returnează `401 Unauthorized` pe `users/daniel.json` — exact expected (rules active, Anonymous UUID legacy blocat) |

**Items deferred to launch oficial (NU pre-Beta închis cu prietenii):**
- GDPR screenshot tutorial (§36.55) → defer launch
- Avocat barter outreach → defer launch

**Sprint UI gate status:** **CLEAR** pentru CC Opus Sprint UI Integration execution post strategic chat NEW design discussion.

**Cumulative LOCKED count impact:** +1 (63 → 64)

**Cross-refs:** §36.72 Sprint UI Sequencing LOCKED V1 + §34.2 Blocker 2 Firebase Rules RTDB Lock (RESOLVED) + ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 Faza 1 Batch B + §36.73 Q11 resolution (GDPR/Avocat defer) + §36.55 GDPR Phone Privacy Onboarding (defer launch).

### §36.76 Sprint UI 6 Decizii UX LOCKED V1 (2026-05-03)

**Decizie:** Strategic chat NEW Sprint UI design 2026-05-03 a produs **6 decizii UX LOCKED V1** care înlocuiesc opțiunile A/B/C deschise în ALIGNMENT_QUESTIONS_CHAT_NEW.md (versiune verificare 8 active Q-uri post §36.73 Q-Set resolution).

| Q | Decizie LOCKED V1 | Rationale |
|---|---|---|
| **Q4 DOMS expand pattern** | **A** — Link "Mai multe opțiuni ▼" inline expand, state NU persistă per sesiune (fiecare instanțiere `<PainDiscomfortCard>` începe collapsed) | Minimalist Bugatti, fiecare sesiune nouă = curat; preserves Maria 65 cohort cold_start (NU înțelege DOMS terminology), expand voluntary T2+ savvy users |
| **Q5 Founding cap counter** | **C** — HIDDEN TOTAL în UI, atomic counter Firebase backend, "Founding sold out, ai Standard €59/an" message la cap reached | Anti-FOMO, anti-manipulation Gigel test pass, NU "Doar X locuri rămase" pressure tactic — counter funcționează silent backend, mesaj final onest |
| **Q6 3 Card buttons grouping** | **B** — Split 2+1 (Equipment row [Aparat ocupat] [Aparat lipsă] + Body row separat [Disconfort]) | Semantic split clear, Maria 65 percepe vizual că Row 2 e categorie diferită (body vs equipment), zero efort cognitiv |
| **Q7 Goal Shift card position** | **C** — Settings menu only (Settings → Profile & Data → "Schimbă obiectivul de antrenament"), complet scos din Dashboard | Dashboard sfânt session current + progres imediat; goal shift acțiune rară (~1×/3-6 luni typical), NU scope creep distraction Executor mode |
| **Q8 Telegram CTA placement** | **B revizuit** — Onboarding final screen 1× exposure cu wording specific + Settings → Comunitate section permanent post-onboarding | Maria/Gigica văd CTA exact când entuziaste de început, dismiss = NU mai apare Dashboard, rămâne Settings discoverable |
| **Q-PROMPT Profile Validation** | **C** — Card persistent Dashboard până user dismisses, NU mid-session interrupt, NU toast post-session | F2 SUFLET respect (informează NU impune), anti-paternalism real, dismiss own pace |

**Wording LOCKED Q8 onboarding (anti-RE preserved):**
> "Vrei să testezi alături de noi? Avem un grup restrâns pe Telegram unde Daniel răspunde la întrebări și ascultă idei. [Intră în grup] [Mai târziu]"

**Cumulative LOCKED count impact:** +6 (64 → 70)

**Cross-refs:** ADR_PAIN_DISCOMFORT_BUTTON_v1 EXT-1 + §29.5 UX Colateral 3 buttons + §36.34 Profile Validation Layer + §36.35 Goal Shift Event Handler + §36.50-§36.52 Founding pricing tiers + §36.53-§36.54 Telegram Channel + §36.72 Sprint UI Sequencing LOCKED V1.

### §36.77 Sprint UI Cluster ABORTED Pre-Flight + Slip Log Anti-Recurrence (2026-05-03)

**Status:** Cluster Sprint UI 7-batch (BATCH_UI_01..07) ABORTED imediat la BATCH_UI_01 pre-flight gate. Reason: spec-uri assume React/JSX framework, project actual = vanilla JavaScript per ADR 005. Incompatibility BLOCKING.

**CC Opus action (corect Bugatti paradigm):** STOP cluster execution, generate detailed STOP report (`📤_outbox/_archive/2026-05/BATCH_UI_01_REPORT.md`), centralized LATEST.md cu cluster aborted status + 3 recovery paths. Zero commits fabricat. Zero JSX files dead în vanilla bundle. Zero push tests-failing. Pattern §BATCH_PROTOCOL #4 fail-fast strict respected literal.

**Slip identification:** Claude chat strategic Sprint UI design (anterior acest chat) a halucinat React/JSX framework peste 7 artefacte BATCH_UI_NN fără verify stack real (ADR 005 vanilla JS LOCKED + pattern existent `src/components/*.js` factory functions safetyBanner/hipThrustSetup/modalManager).

**Rule violation:** Memorie #1 Claude ("Pre-flight grep nume cod ÎNAINTE referențiez") + Memorie #6 ("NU presupun"). Sărit pre-flight pentru velocity = pattern anti-Bugatti.

**Anti-recurrence rule (acest LOCK):**

ÎNAINTE primul artefact tehnic care referă cod/path/framework în chat strategic, OBLIGATORIU pre-flight Claude:
1. `project_knowledge_search` pentru ADR de framework + pattern existent component vecin
2. Dacă vault NU are spec clar: cere Daniel mostră fișier existent să copiezi pattern
3. NICIODATĂ "industry default React/Vue/X assumption" — vault SSOT primary, NU bias training

**CC behavior validated:** Pre-flight gate fail-fast strict a salvat ~7h fake commits + dead code. Bugatti paradigm working as intended. ZERO debt tehnic introdus. Raport STOP curat 4 minute = corect.

**Recovery Path A (recommended):** Strategic chat NEW Claude regenerate 7 BATCH_UI_NN cu vanilla JS pattern matching `safetyBanner.js` factory function (`createXxx(opts) → { element, dispose }`). Pattern: direct DOM `document.createElement` + `element.addEventListener` + state management via closures + dataset attributes + sessionStorage persistence (NU React hooks/PropTypes/JSX). Tests `.test.js` cu vitest jsdom DOM nodes direct.

**Cumulative LOCKED count impact:** 0 (slip log = lessons learned + anti-recurrence rule, NU decision adăugată — meta-rule despre cum CC comportă)

**Cross-refs:** ADR 005 Vanilla JS Stack Decision + §36.74 §BATCH_PROTOCOL.X Default Batches + Single Centralized Report + `📤_outbox/_archive/2026-05/BATCH_UI_01_REPORT.md` (STOP report detailed) + §36.72 Sprint UI Sequencing LOCKED V1 (re-spec needed Path A).

### §36.78 Rebrand Sweep Phase 1-4 Complete (2026-05-03 evening)

**Status:** Sweep `salafull` → `andura` Phase 1-4 EXECUTED autonomous CC Opus per §30 LOCKED 2026-05-01 RESUBMIT.

**Phases complete:**

- **Phase 1: Vault docs sweep** — ~25 active .md files swept (00-index, 01-vision×5, 02-audit, 03-decisions×10, 04-architecture×2, 05-findings-tracker×1, 06-sessions-log×1, 08-workflows×5, root README/VAULT_RULES/PROMPT_CC_HYGIENE, scripts/, tests/). 28 historical refs preserved (decision titles + session-lock entries + GitHub repo URL + local paths + voice-to-text anecdote + MOAT pricing strikethrough). Commit `ef3ef83`.

- **Phase 2: Source code + PWA manifest + sw.js** — 28 files swept (manifest.json name+paths, sw.js CACHE_VERSION reset andura-v1 + BASE /andura, index.html, vite.config base /andura/, playwright config, src/auth.js event andura:signedout + fallback origin, src/main.js sw register path, src/pages/weight.js download names + version andura-v1 + import accepts both andura+salafull backwards compat, src/util/dataCleanup.js + sentry.js release tag + test message, gate-b-script.js, .claude/settings.json workspace path, 16 playwright tests BASE_URL+goto). Refs preserved: `src/storage/db.js DB_NAME_PREFIX = 'salafull'` (IndexedDB user data continuity, rename = Daniel local data wipe, post-Beta migration optional). Commit `ef8626b`.

- **Phase 3: Config + package + CI** — package.json name andura, package-lock.json regenerated clean. CI workflows verified clean (no salafull refs). Commit `1640ffd`.

- **Phase 4: public/CNAME prep** — `public/CNAME` = `andura.app`. Vite copies la build dist/CNAME automat. Activation = manual Daniel post repo rename + DNS Namecheap config. Commit `3701df7`.

**Metrics:**
- Tests: **1203 → 1203 PASS** unchanged ✅
- Coverage: 60.33% lines / 78.38% branches (unchanged)
- Build: 3.24s / 921 KB / 283 KB gzipped (essentially unchanged ±0.01 KB hash variations)
- Commits: **4** (Phase 1 + Phase 2 + Phase 3 + Phase 4)
- Files changed cumulative: ~63 files
- Empirical Opus runtime: ~25-30 min actual vs estimate ~3.5-4.5h (factor 7-9x optimism — CONFIRMED 5x consecutive per §36.72 calibration)

**Pending Daniel manual steps post-sweep:**

1. **GitHub repo rename:** Settings → General → Rename `salafull` → `andura`
2. **Local remote update:** `git remote set-url origin https://github.com/markaroundthestates-cyber/andura.git`
3. **Local folder rename optional:** `salafull` → `andura` (low priority — paths în vault docs reference deja `/andura/` post-sweep, dar Daniel local path Windows menționat în câteva fișiere ca exception)
4. **Namecheap DNS config:** A records → GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) + CNAME `www` → `markaroundthestates-cyber.github.io`
5. **GitHub Pages settings:** Custom domain `andura.app` → enforce HTTPS toggle on
6. **Email signature update** `[Andura V1 Feedback]` (deja LOCKED §29.6, doar apply în client email)

**Cumulative LOCKED count impact:** +1 (70 → **71**)

**Cross-refs:** §30 Rebrand SalaFull → Andura LOCKED 2026-05-01 RESUBMIT + §31 Investiții (andura.app €13.18 actual achitat 2026-05-03 vs estimate €10-15) + §36.77 anti-recurrence rule (pre-flight respected acest task — vanilla JS pattern matching, NU presupun framework) + §36.75 Daniel solo gate Firebase (proiect Firebase deja rename "Andura" §36.75) + Sprint UI cluster aborted carry-over §36.76-77.

### §36.79 Custom Domain Base Path Hotfix (2026-05-03 evening)

**Status:** Hotfix EXECUTED post §36.78 Rebrand Sweep Phase 1-4. Daniel smoke test prod `andura.app` raportat 404 pe toate assets immediate post repo rename + DNS activation.

**Symptom:** Browser console post DNS propagation:
- `https://andura.app/andura/assets/main-*.js` → 404
- `https://andura.app/andura/manifest.json` → 404
- `Uncaught ReferenceError: startSession is not defined` (consequence — main.js never loaded)

**Root cause:** Phase 2 rebrand sweep schimbat `vite.config.js` base de la `'/salafull/'` → `'/andura/'`. Asta corect pentru subpath `markaroundthestates-cyber.github.io/andura/` DAR greșit pentru custom domain `andura.app/` unde root site = `/`, NU `/andura/`. Path resolution dublu prefix (`andura.app/andura/...`) → 404 toate assets.

**Decision LOCKED:** Custom domain `andura.app` = sursa adevărului unic post-launch. URL `github.io/andura/` deprecated (NU mai folosit nicăieri public). Toate paths config root-relative (`/`).

**Fix scope (5 categorii fișiere):**
- `vite.config.js` — base `/andura/` → `/`
- `public/sw.js` — BASE `/andura` → `''`, ASSETS array root-relative, **CACHE_VERSION bump `andura-v1` → `andura-v2`** (invalidate stale SW cache pe browsers existing)
- `public/manifest.json` — start_url+scope `/`, icons `/icon-*.png` (root)
- `src/main.js` — sw register `/sw.js` (root)
- `index.html` — manifest link + apple-touch-icon root paths
- `playwright.config.js` — baseURL `https://andura.app` + comment update
- 16 playwright tests — `BASE_URL = '/'` + `page.goto('/')` root-relative

**Rationale CACHE_VERSION bump:** users care au accesat `andura.app` imediat post-launch (înainte fix) au sw cu cache `andura-v1` care încearcă fetch `/andura/...` paths. Bump v2 = sw nou se activează, drop cache vechi, reîncarcă fresh paths root-relative.

**Verify:**
- Tests: 1203 PASS unchanged ✅
- Build: 3.22s success ✅
- `dist/CNAME = andura.app` preserved ✅
- `dist/manifest.json` start_url+scope `/` ✅
- `dist/sw.js` CACHE_VERSION `andura-v2`, BASE `''` ✅
- `grep '/andura/' dist/` = 0 hits ✅
- `git grep '/andura/' -- src/ public/ tests/ vite.config.js playwright.config.js index.html` = 0 hits ✅

**Deploy:** `npm run deploy` Published la `gh-pages` branch (commit `5d955ae` origin/main). GitHub Pages auto-rebuild → andura.app live cu paths root-relative (~1-2 min CDN propagation).

**Empirical Opus runtime:** ~10 min actual vs estimate ~25 min (factor 2.5x — hotfix simplu, pattern de sweep cunoscut din Phase 2).

**Pending Daniel manual:**
- Hard refresh browser (Ctrl+Shift+R) pentru forțare reload sw `andura-v1` → `andura-v2`
- Smoke confirm dashboard render normal post-fix
- DevTools Network tab: toate assets 200 OK

**Lessons learned (anti-recurrence ext):**
- Custom domain deployment ≠ subpath deployment. Pre-rebrand checklist viitor trebuie include "destination URL type: subpath sau custom domain root?" ca primul item.
- CACHE_VERSION bump = MANDATORY pe orice schema change la base paths sw.js (anti zombie cache pe users existing).
- Phase 4 spec original lipsea sw fetch intercept paths consideration — flag pentru custom-domain projects future.

**Cumulative LOCKED count impact:** +1 (71 → **72**)

**Cross-refs:** §30 Rebrand SalaFull → Andura LOCKED + §36.78 Rebrand Sweep Phase 1-4 (introduced base path mismatch) + §36.77 anti-recurrence rule (pre-flight respected — root cause identified clean, fix surgical no-fabricate) + §31 Investiții (andura.app €13.18 deja achitat).

### §36.80 DNS Activation andura.app LIVE + Smoke Prod Findings — BUG 2 Firebase Auth Flow Not Wired (2026-05-03 night)

**Status:** Post §36.79 hotfix push, Daniel a finalizat manual DNS Namecheap config + GitHub Pages custom domain activation + smoke test prod. Site LIVE, dar smoke a expus 2 finding-uri.

**Deploy completion (Daniel manual):**
- **DNS Namecheap:** 4 A records → GitHub Pages IPs (185.199.108.153 / .109.153 / .110.153 / .111.153) + CNAME `www` → `markaroundthestates-cyber.github.io`. Records vechi parkingpage + URL Redirect deleted.
- **GitHub repo rename:** `salafull` → `andura` (Settings → General).
- **Local remote update:** `git remote set-url origin https://github.com/markaroundthestates-cyber/andura.git`.
- **GitHub Pages Custom Domain:** `andura.app` saved + DNS check successful + Enforce HTTPS ON.
- **Result:** `https://andura.app/` LIVE cu HTTPS ✅ (verificat browser Daniel).

**Smoke prod findings (2 buguri raportate end-of-session):**

**BUG 1 — SW zombie cache 404 (SELF-HEALING, CLOSED):**
- Symptom: primele linii post hard refresh `main-*.css/js + manifest.json → 404` hash-uri vechi.
- Root cause: SW `andura-v1` (deployed pre-hotfix §36.79, fereastră ~10 min) cache-uise paths `/andura/...` 404. La hard refresh user, SW vechi încă servea cached paths broken ÎNAINTE să se înregistreze SW nou `andura-v2` (CACHE_VERSION bump §36.79).
- Verify self-healing: post linia `[SW] Activate complete... Version: andura-v2`, hash-uri noi build (`main-DpDxmZcE.js`, `index-D7JyUQ7S.js`) load OK 200, asset 404-uri DISAPPEAR.
- **Decision:** NU bug real, e tranziție expected post CACHE_VERSION bump. Closed. Documentat audit trail.
- **Action next chat:** None.

**BUG 2 — Firebase 401 Unauthorized PERSISTENT (REAL BUG, NEXT CHAT PRIORITY 1 ABSOLUT):**
- Symptom: repetitiv multiple cycles `GET/PUT/DELETE https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app/users/daniel.json → 401` + `[Firebase] clearFirebaseKeys: 0/3 removed`.
- **Root cause analysis:**
  1. Codul `src/firebase.js` are `LEGACY_USER_PATH = 'users/daniel'` ca fallback când `getAuthState()` returnează null (NU autentificat).
  2. `getUserPath()` resolver: dacă `auth?.uid` exists → `users/<uid>`, altfel fallback `users/daniel`.
  3. Pe `andura.app` proaspăt deschis, Daniel NU a făcut Magic Link sign-in flow → `getAuthState()` = null → resolver returnează `users/daniel` literal.
  4. DB Rules per-UID strict §36.75 BLOCHEAZĂ `users/daniel` (no `auth.uid` matches literal "daniel") → 401 toate operațiile.
  5. App încearcă cycle: get → clearFirebaseKeys (DELETE) → set (PUT) → toate 401.
- **Implication critic:** Auth flow Magic Link/OAuth NU complet wired în UI Andura production. Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 NOT landed:
  - "index.html route hookup pentru `/auth-callback` — Daniel wires when integrating UI shell (next batch)"
  - "Faza 2 banner UX 'Salvează contul' prompt for existing Anonymous users → dedicated 30-min wiring batch"
- **Status code:** Faza 1 Batch B `src/auth.js` REST helpers + `src/pages/auth.js` UI bare-DOM Magic Link landed code, DAR NU integrate în main app shell. User deschide `andura.app/` → vede dashboard direct (NU forced auth screen) → Firebase calls fail 401.
- **Decision LOCKED:** Beta-launch pre-condiție = auth flow integrat complet. Acum este blocking. Next chat = strategic NEW design discussion + prompt CC Opus dedicat.

**Action next chat (PRIORITY 1 ABSOLUT) — scope strategic chat NEW:**
- Wireframe auth-first vs auth-banner-soft vs auth-modal patterns (Daniel CEO decizie UX).
- Decizie route auth-callback wire: `/auth-callback?oobCode=...` la app shell main.js sau separate page.
- Migration path users existing IndexedDB local data Daniel → post-Magic-Link `users/{uid}` Firebase RTDB.
- Wording onboarding auth screen RO (Magic Link primary, Google OAuth secondary).
- Error states UX (email invalid, link expired, network fail).

**Action next chat — scope CC Opus dedicat (post strategic):**
- Wire `/auth-callback` route în `index.html` + `src/main.js` route handler.
- Integrare `createAuthScreen` din `src/pages/auth.js` în main app flow (forced gate dacă `getAuthState() == null`).
- Update `LEGACY_USER_PATH` fallback strategy: dacă custom domain prod + auth required → block dashboard render până auth, NU fallback `users/daniel`.
- Tests Playwright e2e flow Magic Link mock + Google OAuth mock.
- Smoke prod confirm: user nou pe `andura.app/` vede auth screen, NU dashboard direct.

**Estimate:** Strategic chat ~1-2h Daniel-time + CC Opus ~30-45 min real autonomous (factor 7-9x clusters mari, sau ~10-15 min hotfix scope-clean factor 2-3x).

**Memory rules NEW Claude self-discipline (referință):**
- **Rule #22 (2026-05-03 evening):** Alignment questions = STRICT CC Opus din vault SSOT post-merge, NU Claude chat în handover. Comanda standard "Ingest handover" deja include generare fresh `ALIGNMENT_QUESTIONS_CHAT_NEW.md` cu citation §X file.md + răspuns verbatim. Handover input NU mai include §VERIFICATION QUESTIONS — duplicate work + halucinare risk.
- **Rule #23 (2026-05-03 evening):** Pre-flight grep ABSOLUT ÎNAINTE primul artefact tehnic anti-halucinație React/JSX 2026-05-03 slip — extension §36.77 anti-recurrence rule. Vault SSOT primary, NU bias training framework.

**Cumulative LOCKED count impact:** 0 (count rămâne **72** — BUG 1 closed self-healing + BUG 2 finding documentat + decision LOCKED next-priority = NU adaugă număr nou §36.x distinct).

**Cross-refs:** §30 Rebrand + §31 Investiții (andura.app €13.18 LIVE) + §34.2 Blocker 2 Firebase Rules RTDB Lock RESOLVED + §36.75 Daniel Solo Gate Firebase Live (DB rules per-UID published) + §36.78 Rebrand Sweep Phase 1-4 + §36.79 Custom Domain Base Path Hotfix (CACHE_VERSION v2 = sursa BUG 1 self-heal) + ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 Faza 1 Batch B (relevant root cause BUG 2 — auth flow code landed dar NOT wired în app shell) + ADR 005 Vanilla JS Stack Decision + ADR 007 Firebase Open Rules + §AMENDMENT 2026-05-02 + VAULT_RULES.md §HANDOVER_PROTOCOL step 9 (memory rule #22 codification) + PROMPT_CC_HYGIENE.md §9 (memory rule #23 codification).

### §36.81 Coach Intelligence Cluster — Variante + Substituții + Mid-Set + Abandonment LOCKED V1 (2026-05-03 night late)

**Status:** Cluster 4 decizii LOCKED V1 post chat strategic 2026-05-03 night late. Origine: Daniel a venit cu 3 idei coach intelligence (variante exerciții diferențiate + substituții cascade anatomice + session abandonment) → expanded la 4 sub-decizii LOCKED V1 + cluster prebeta per §36.83 meta-rule.

**Renumbering note (vault hygiene):** Handover input chat strategic a folosit §36.55.1-4 (collision cu §36.55 GDPR Phone Privacy existent în vault). Re-numerotat cronologic post §36.80 ca §36.81.1-4 fără pierdere intent (cluster organization preserved).

#### §36.81.1 Catalog Ceiling Soft Cap LOCKED V1

**Decizie:** Plafon variante biomecanice per pattern muscular = soft cap target 3-4 variante distincte per movement pattern (ex: lateral_raise_db, lateral_raise_cable, lateral_raise_machine). Codul **permite** introducerea unei a 5-a variante DAR impune justificare obligatorie în PR.

**Rationale:** Anti-arbitrary cap, anti-bloat, anti-onboarding kilometric. Squats permite legitim 6+ variante (back, front, goblet, hack, bulgarian, box) — cap rigid 4 amputează realitate sală RO. Soft cap + PR justification = disciplină catalog fără pierdere flexibilitate. Aliniat anti-friction Maria 65.

**Cross-refs:** §36.36 Schema Extension Exercise Library (câmpuri obligatorii equipment_type + equipment_alternatives + force_demand + muscle_target_primary/secondary + tier) + §36.37 Smart-Routing Aparat Ocupat / Aparat Lipsă.

#### §36.81.2 Substitutions Hierarchy Algorithmic LOCKED V1

**Decizie:** Substituțiile pentru "Aparat ocupat" / "Aparat lipsă" sunt generate **algoritmic** din metadata existentă, NU listă manuală curatat per exercițiu. Eliminat vector hardcoded `substitutions: [...]` per exercițiu (maintenance hell la 30+ exerciții × 5 substituții = 150+ relații manual).

**Algoritm sortează alternative pe baza ierarhie strictă de priorități (ordering only LOCKED, weights TBD post-Beta):**
1. `primary_muscle` (cel mai important)
2. `movement_pattern`
3. `force_curve_profile`
4. `equipment_class` (cel mai puțin important)

**Ponderi numerice (40/30/20/10) RESPINSE V1** — pre-mature optimization fără data Beta reală. `manual_override_ids` permis doar pentru cazuri excepționale unde algo greșește.

**Filter cascadă:** Exercițiu original → calc scor similaritate → filtrează după echipament disponibil user (din profile) → top 3 recomandări (best match primă, restul "Alte alternative").

**Cross-refs:** §36.36 Schema cu metadata necesară (toate 4 câmpuri prioritizare deja în schema) + §36.37 Smart-Routing buton [Aparat ocupat] / [Aparat lipsă].

#### §36.81.3 Mid-Set Switch Fallback Hybrid Rule LOCKED V1

**Decizie:** Când utilizatorul switch-uiește exercițiul **mid-execution** (apucă să facă 1-2 seturi, apoi aparat ocupat la pauză), engine handle prin "Hybrid Rule" cu UI Bridge (3 pași):

1. **Save seturi lucrate:** Engine păstrează seturile deja completate la exercițiul original (ex: 2 seturi la `bench_press_flat_barbell`)
2. **Calcul greutate sugerată noul exercițiu:** Folosește `SIMILARITY_RATIO` map existent în `src/engine/exerciseMapping.js` (validat pre-flight grep — există! Range 0.75-1.25 + fallback `default: 0.9`) + funcția `getSimilarityMultiplier()` pentru greutate inițială conservatoare bazată pe performanța din seturile deja lucrate
3. **UI Bridge — sugestie + edit user:** App afișează valoarea calculată ca **sugestie**, NU impune: `"Sugestie: ${calcKg} kg · Ajustează după cum simți primul set"`. User editează direct înainte de a bifa setul.

**Edge case "no history" pe noul exercițiu:** SIMILARITY_RATIO multiplier folosit ca conversion factor cross-exercițiu + UI prompts user explicit că-i sugestie, NU baseline locked.

**Cross-refs:** `src/engine/exerciseMapping.js` SIMILARITY_RATIO + getSimilarityMultiplier validat existent + §36.81.1 Catalog ceiling (variante distincte = 1RM separat per variant) + ADR Pattern 14 No-Inference (engine sugerează, NU impune) + SUFLET F2 ("AI-ul informează, nu impune").

#### §36.81.4 Abandonment Engine + §36.30 Override LOCKED V1

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

**Cross-refs:** ADR_OUTLIER_FILTER §EXTENSIONS EXT-4 §36.81.4 (acest override extends spec-ul existent) + §36.30 Streak Counter Same Direction + §36.34 Profile Reset (streak PRESERVE — UI/UX shift only) — distincție clară + §36.35 Goal Shift (streak RESET 0 — context fizic schimbat) — distincție clară + ADR 012 Calibration Tier Decay (60-day inactivity) — separate concern, NU overlap.

### §36.82 Pre-Session Energy Signal Cluster — Energy Input + Silent Adjust + Deload Trigger LOCKED V1 (2026-05-03 night late)

**Status:** Cluster 3 decizii LOCKED V1 post chat strategic 2026-05-03 night late. Cluster prebeta per §36.83 meta-rule. Renumbering note: input handover §36.56.1-3 (collision cu §36.56 ADR Review Process) → re-numerotat §36.82.1-3 cronologic.

#### §36.82.1 Pre-Session Energy Input LOCKED V1

**Decizie:** Selector semantic 3 opțiuni energie integrat **direct în Dashboard Greeting Card existent**, NU ecran separat / modal.

**UI:**
```
Cum ne simțim astăzi?
[🟢 Excelent]  [🟡 Normal / Ok]  [🔴 Obosit / Slab]
```

**Friction:** Exact 1 tap, ZERO ecrane suplimentare, ZERO timp pierdut.

**Anti-pattern (RESPINS):** Modal pre-flight check + greeting + start button = 3 friction points pre-set, Maria 65 abandonează la al 2-lea.

**Cross-refs:** §36.45 T2 cold-start mode detection (existing greeting card patterns) + Anti-friction onboarding philosophy.

#### §36.82.2 Silent Adaptive Adjustment LOCKED V1

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

**Cross-refs:** §36.16 RIR Matrix Adaptiv (mecanism existent: reps reduction sau intensity, NU sets) + §36.17 + §36.29 Mid-Session Silent UI Update LOCKED + ADR Pattern 14 No-Inference.

#### §36.82.3 Deload Suggestion Trigger LOCKED V1 (Wording Phase B Pending)

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

**Cross-refs:** §27 Phase B Wording Strategy + §36.58 Phase B 51 strings LOCKED V1 (pattern existent) + ADR Pattern 14 + SUFLET F2.

### §36.83 META-RULE Prebeta Scope Expansion LOCKED V1 (2026-05-03 night late)

**Decizie meta-rule:** Toate deciziile luate de la acest moment înainte care țin de **SUFLET ANDURA / coach intelligence / UX core / engine adaptation** sunt **mandatory prebeta**. Non-negotiable.

**Renumbering note:** Input handover §36.57 (collision cu §36.57 Phase B Wording 51 Strings amendments) → re-numerotat §36.83 cronologic.

**Mecanism:**
- NU se mai întreabă "prebeta sau post-Beta?" pentru fiecare feature
- Default = **prebeta** dacă atinge core experience (suflet Andura, coach intelligence, UX flow critic)
- Timing/realism = treaba lui Claude + Daniel + CC Opus să decidă cum prioritizăm execution-ul, NU rationale să respingem scope-ul
- NU mai sări la "ar dura X luni" ca push-back — Daniel n-a întrebat de timing când extinde scope

**Origine decizie:** Acest chat 2026-05-03 night late: post discussion §36.81 + §36.82, Daniel a clarificat că "tot ce discutăm care face parte din sufletul Andura va fi prebeta". Claude a răspuns inițial cu push-back pe timing (12 luni delay) — Daniel a corectat: "am zis eu ceva de cât timp durează?". Lecție: scope expansion ≠ rationale respingere pe baza estimate-uri Claude.

**Implicații:**
- Beta-launch ASAP strategy LOCKED rămâne valid, dar timing **flexible** (NU forced)
- Soft Launch 1 ianuarie 2027 = **target aspirational**, NU hard deadline dacă scope esențial extends
- Quality > speed strict (Bugatti paradigm)

**Memory rule:** Codificat în memory persistent #24 Claude pentru chat-uri viitoare.

**Cross-refs:** SUFLET_ANDURA full vision + §36.13 Beta-launch ASAP strategy + Bugatti paradigm philosophy + 07-meta/CLAUDE_CODE_RULES.md (referință §36.83).

### §36.84 Jeff Nippard Gaps Backlog Catalog (2026-05-03 night late)

**Status:** Backlog catalog post chat strategic 2026-05-03 night late. NU LOCKED V1 (catalog only, +0 cumulative count). Toate gap-urile prebeta per §36.83 meta-rule, prioritizare next chats strategic.

**Context:** Daniel a întrebat dacă Andura V1 ajunge "Jeff Nippard 24/7 replacer" după §36.81 + §36.82 implementate. Claude răspuns sincer: ~30% Jeff Nippard, gap-uri reziduale.

**Gap-uri identificate (7 total):**

#### Prebeta MANDATORY (per §36.83):

1. **#1 Wiring weakness → session builder** (~1-2 săpt CC dezvoltare) — **DISCUTAT START**, NU LOCKED încă. Gap real: `weaknessDetector.js` orfan — calculează 1RM per muscle group, dar NU acționează (nu adaugă proactiv accessory targeted în session builder). Exemplu: Engine VEDE deltoid posterior slab vs anterior → NU adaugă proactiv face pulls în programul Marius. **Action next chat:** design wiring + session builder integration.

2. **#2 Plateau breaker auto** (variant change când stagnează — ~2-3 săpt + research științific) — **NEDISCUTAT**, marcat backlog. Gap real: Stagnation detector flag-uiește 3 săpt fără progres, dar NU recomandă variant change. Concept Bugatti: Marius bench plateau 3 săpt → engine spune "săptămâna asta înlocuim flat barbell cu incline DB pause-rep, schimbăm stimulus, revenim peste 2 săpt". **Action future chat:** design threshold + algorithm + research scientific basis.

3. **#3 Recovery / readiness signals** (somn, stres, DOMS subiectiv) — **PARȚIAL acoperit** prin §36.82.1 (energy selector) + §36.38 Pain Button (DOMS). Daniel confirmat că NU vrea întrebări user explicite suplimentare (somn / stres) — derivăm din statistici sesiune via §36.82.1. **Decision: GAP ÎNCHIS pentru V1 prebeta cu §36.82** — suficient.

4. **#4 Periodizare conștientă** (deload weeks, accumulation phases — ~2-3 luni dezvoltare) — **NEDISCUTAT**, marcat backlog. Gap real: Zero concept "deload week", "intensificare 4 săpt", "accumulation phase". Doar progresie liniară per exercițiu cu deload trigger pe 3× RIR 0. **Action future chat:** design mesocycle planning + deload algorithms.

5. **#6 Cross-exercițiu reasoning** (~2-4 luni dezvoltare) — **NEDISCUTAT**, marcat backlog. Gap real: "Squat-ul tău stagnează pentru că hamstrings sunt slabi, hai să adăugăm RDL și pause-squats" — gap total. **Action future chat:** design graph relations exerciții + weak chain detection algorithm.

6. **#7 Comunicare contextuală pre-session derivată din statistici sesiune (NU întrebări user explicite)** — **PARȚIAL acoperit** prin §36.82.1 + §36.82.2 silent adjust. Daniel quote: "in afara de 5, tot trebuie... iar 7 ne luam datele din statistici din sesiune...". **Decision: GAP ÎNCHIS pentru V1 prebeta** — derivat din §36.82 + statistici sesiune existing.

#### V2+ (RESPINS prebeta):

7. **#5 Form / execuție feedback (video analysis)** — **DROP definitiv**. Daniel quote: "in afara de 5, tot trebuie...". Risc legal + scope insane + camera permissions Maria 65 = OUT. V2+ teritoriu, NU prebeta, NU V1.5.

**Cross-refs:** §36.81 Coach Intelligence Cluster (gap #1 wiring weakness target) + §36.82 Pre-Session Energy Signal (gap #3 + #7 closed) + §36.83 META-RULE Prebeta Scope (toate prebeta default) + `src/engine/weaknessDetector.js` (orfan, target wiring next chat).

### §36.85 Injury Body Region Map — Opțiune A Propusă PENDING Daniel Decision Next Chat (2026-05-03 night late)

**Status:** PROPUS în chat strategic 2026-05-03 night late, AȘTEAPTĂ Daniel decision next chat (A vs drop). NU LOCKED V1 (+0 cumulative count). Cross-ref §36.84 Jeff Nippard backlog gap #8 NEW propus.

**Context:** §36.38 Pain Button existent este generic skip/reduce. NU este injury-specific protocol per zonă anatomică.

**Opțiune A propusă (~1-2 săpt CC) — extensie naturală §36.38 + §36.36:**
- User apasă "Mă doare" → "Unde?" → body map (umăr stâng / genunchi drept / lombară / etc)
- Engine vede ce exerciții stresează zona (`muscle_target_primary` în schema §36.36) → automat skip toate în sesiunea curentă + propune alternative ZERO load pe zona afectată
- Exemplu: user zice "umăr stâng" → engine skip OHP + bench + lateral raises + face pulls automat. Propune: leg day exclusiv + core
- **NU recomandă rehab specific** ("fă band external rotations") — doar evită stres → zero medical device classification risc

**Opțiune B (~3-4 săpt CC):** Extension A + tracking durată recovery + re-introduction graduală cu test sets.

**Opțiune C (~2-3 luni, RISC LEGAL):** Library protocoale rehab specific per zonă (knee valgus → terminal knee ext + glute med activation). **TRECE LIMITA medical device** → EU AI Act risc + audit legal Stage 2 fail probabil. **REJECTED prebeta** indiferent §36.83.

**Recomandare Claude:** Opțiunea A prebeta (per §36.83 LOCKED), B post-Beta cu data reală, C NEVER.

**Action next chat:** Daniel decizie A vs drop complet (Opțiunea A discuție design completă + LOCK V1 sau backlog post-Beta).

**Schema validation:** §36.36 — `muscle_target_primary` + `muscle_target_secondary` deja câmpuri obligatorii, deci wiring posibil zero refactor schema.

**Cross-refs:** §36.38 Pain/Discomfort Button (extension natural target) + §36.36 Schema Extension Exercise Library (`muscle_target_primary` deja existent) + §36.84 Jeff Nippard backlog gap #8 NEW + ADR_PAIN_DISCOMFORT_BUTTON_v1 §pending §36.85 (post Daniel decision A vs drop) + EU AI Act compliance (zero rehab claims).

### §36.86 ADR 023 LLM Intent Interpretation & Fallback Architecture LOCKED V1 (2026-05-03 audit total addendum)

**Status:** LOCKED V1 — partial spec ingest. **⚠️ Full sub-sections A-M (13 total) PENDING addendum source upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` (referenced sursa NOT delivered acest ingest — vezi DIFF_FLAGS.md P1 BLOCKER).**

**Context decizie:** Chat strategic 2026-05-03 (post audit consolidat 9 passes) DELOCK Cognitive Q4 "ZERO LLM runtime" pentru scope strict. Origine: T2 The Filter NU codificabil prin regex/NLP determinist → necesită LLM intent interpretation cu Bugatti sandbox preserved. Pattern emergent: vault Andura mature către "engine deterministic + LLM intent layer scope strict" hybrid.

**Highlights LOCKED (din summary HANDOVER_AUDIT_TOTAL §0 + §7 + AUDIT_VERIFICATION_REPORT §11):**

- **Scope strict 2 trigger points pre-Beta MANDATORY:** §36.38 Pain text input + §36.55.2 Equipment text input (echivalent §36.81.2 algorithmic substitutions cu equipment input). ZERO LLM pe volume / intensity / progression / abandonment / RPE / outlier detection / streak counter / mode detection. Determinism preserved pe core engine paths.
- **Provider chain:** Groq llama-3-8b-it primary → Gemini 1.5 Flash PAYG fallback → Local Regex Static Keywords last resort. Fallback automat la failure / latency exceed / cost cap.
- **Bugatti sandbox:** temperature 0.0 + Structured Outputs JSON schema + Regex Fallback local. Determinism preserved (same input → same output).
- **Sanitizer client-side PII** (whitelist exercise names + termeni fitness RO) — rezolvă N2 Privacy clause concern. Client-side ZERO PII trimis la LLM provider.
- **Async non-blocking** — rezolvă Cognitive Q11 latency budget (<300ms total decision) conflict.
- **Cache IndexedDB local** — ~55-60% hit rate target, ~80% token economy reduction.
- **Cost cap €10/lună hard** + €0.50/zi soft alert + €2/săpt soft alert. Hard enforcement requires Cloud Functions backend (vezi §36.92 D6 + Q11-INFRA D3 — depends Daniel decision Blaze plan upgrade).
- **CDL audit trail extension** cu `llm_metadata` field (provider, latency, token count, fallback chain triggered). MOAT pillar 3 (Decizii verificabile) preserved.
- **Gigel test PASS:** Maria 65 / Gigica 35 ZERO text input — folosesc 3 butoane predefined. Marius 25 optional "Altceva" text → LLM intent.

**Effort estimate:** ~6-10h Opus implementation + ~2-3h Daniel chat strategic refinement (already done acest chat).

**Pre-Beta:** mandatory Tier 1 (Pain) + Tier 2 (Equipment) ambele LIVE.

**File ADR creat:** `03-decisions/023-llm-intent-interpretation.md` — partial spec status LOCKED V1 cu flag PENDING upload addendum complet pentru sub-secțiuni A-M.

**Cross-refs:** ADR 022 ORPHAN naming collision (resolved via §36.92 + ORPHAN-1 cleanup) + Cognitive Architecture Spec Q4 ZERO LLM runtime § §36.87 §AMENDMENT 2026-05-03 DELOCK + Q11 latency budget + §36.38 Pain Button (Tier 1 trigger) + §36.81.2 Substitutions Hierarchy Algorithmic (Tier 2 equipment input adjacent) + N2 Privacy Clause (sanitizer rezolvă) + ADR 011 CDL audit trail (extension `llm_metadata`) + Q11-INFRA Cloud Functions decision pending Daniel (D3 + D6 hard cost enforcement).

### §36.87 Cognitive Q4 §AMENDMENT 2026-05-03 — DELOCK Condiționat LOCKED V1 (2026-05-03 audit total addendum)

**Decizie:** Cognitive Architecture Spec Q4 "ZERO LLM runtime" superseded de §36.86 ADR 023 scope strict. LLM permis EXCLUSIV pe 2 trigger points (§36.38 Pain text + §36.55.2 / §36.81.2 Equipment text), restul engine paths preserved deterministic.

**Rationale DELOCK:**
- T2 The Filter (NU codificabil prin regex/NLP determinist) era HIGH acceptable trade-off în audit consolidat → soluționat prin LLM intent layer scope strict
- Bugatti sandbox preserved (temperature 0.0 + Structured Outputs JSON schema + Regex Fallback)
- Cognitive Q11 latency NU compromised (async non-blocking)
- MOAT pillar 3 (Decizii verificabile) preserved (CDL `llm_metadata`)
- Anti-RE preserved (engine deterministic, LLM doar intent classification scope strict)

**§AMENDMENT inline target:** `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` Q4 "ZERO LLM runtime" → "ZERO LLM runtime EXCEPT scope strict per ADR 023 (2 trigger points Pain text + Equipment text)". Edit pending Sprint vault hygiene Q2 2026 (IMP-15) sau ad-hoc post addendum upload.

**Cross-refs:** §36.86 ADR 023 (sister decision) + COGNITIVE_ARCHITECTURE_SPEC_v1 Q4 + Q11 latency + Q26 anti-RE filter.

### §36.88 Bus Factor 1 = ACCEPTABLE TRADE-OFF Pre-Revenue LOCKED V1 (2026-05-03 audit total addendum)

**Decizie:** Bus factor 1 (Daniel solo developer) = ACCEPTABLE TRADE-OFF pre-revenue. Hire / co-founder reconsider post-revenue.

**Rationale:**
- Bootstrap solo $0 marketing constraint LOCKED §1.2 PRODUCT_STRATEGY
- Daniel persona ADHD 2e + endurance la limită somn LOCKED DANIEL_COMPLETE_PROFILE
- Vault SSOT + handover protocol + memory persistence = mitigation parțial (chat NEW recovery dacă Daniel down)
- Revenue trigger pentru reconsider hire = post-Founding cap 50 + Standard pricing month 6+ runway sustainability

**Mitigation transparency LOCKED:** SLA disclosure în ToS pre-launch (NEW-IDEATION-3 audit total). Wording propus: "Andura este dezvoltat de o echipă de 1 dezvoltator. Răspuns critical bugs în 48h working days, NU 24/7 support. Reconsider hire/co-founder post-revenue."

**Status finding:** N3 + BACKLOG-1 + R3 risk findings = ACCEPTABLE TRADE-OFF (NU mai e finding actionable, transparently disclosed în ToS).

**Cross-refs:** §1.2 PRODUCT_STRATEGY bootstrap solo + DANIEL_COMPLETE_PROFILE persona + ToS pre-launch legal audit Stage 2 + NEW-IDEATION-3 SLA disclosure (audit total ideation report §7) + N3 / BACKLOG-1 / R3 audit findings reclasificate.

### §36.89 Calibration Target Pre-Beta = 85-90% LOCKED V1 (2026-05-03 audit total addendum)

**Decizie:** Calibration target pre-Beta = 85-90% (NU 95%). Plan A+B+E. 95% post-launch luna 3-6 obligatoriu.

**Plan calibration A+B+E:**

- **A. Synthetic Demographic Prior scaled** (ADR 017) — pre-calibrare AA + MMI + Voice weights pe 500-1000 profiles synthetic. Effort: ~8-12h Opus dacă DEMO-1 verify shows incomplete (audit consolidat: scaffold OK, full 500 profiles NU verified — verify needed).
- **B. Observation mode prima 2 săpt Beta** — engine logează signals + computes recommendations DAR NU intervine activ user-facing. Săpt 3-4 Beta = recalibrate pe data reală cohort. Effort: ~2-3h CC (feature flag observation mode + analytics + recalibration trigger).
- **E. Expert validator coach paid** €500-1000 one-time — strength coach senior RO sau Jeff-Nippard-tier review sample 50 decizii engine pre-Beta. Daniel sourcing 2-4h.

**Reframing Beta = data collection phase, NU calibration validation phase.** Synthetic Demographic Prior pre-calibrate prior. Beta = real signal post-prior-erosion observation. Calibration validation = post-Beta luna 3+ public launch.

**Reasonable target adjustment justification:** TIME-1 Bayesian convergence math (40 sesiuni × 50 users / 4 săpt Beta = impossible 95% calibration validation pre-launch). 85-90% pre-Beta achievable cu plan A+B+E.

**Cross-refs:** §36.86 ADR 023 (LLM Intent metadata can input calibration data) + §36.90 TIME-1 reclassification + DEMO-1 Demographic Prior verify needed (FINDINGS_MASTER) + IMP-3 Synthetic Pre-Calibration (ideation top priority) + NEW-IDEATION-1 Expert Validator Coach (ideation NEW priority) + NEW-IDEATION-2 Observation Mode Beta (ideation NEW priority).

### §36.90 TIME-1 Bayesian Convergence Reclassification LOCKED V1 (2026-05-03 audit total addendum)

**Decizie:** TIME-1 finding (Beta 4 săpt vs Bayesian convergence 40 sesiuni × 50 users = 14-20 săpt math) reclasificat MEDIUM acceptable cu DEMO-1 verify done.

**Rationale:**
- Math correct DAR Beta = data collection phase, NU calibration validation phase
- Synthetic Demographic Prior pre-calibrate (§36.89 plan A) = NU dependent doar pe Beta cohort real data
- Calibration validation = post-Beta luna 3+ public launch (NU pre-Beta milestone)
- DEMO-1 verify needed: confirm scaffold sufficient pentru 500 profiles synthetic generation

**Status:** MEDIUM acceptable, NU CRITICAL impossible.

**Cross-refs:** §36.89 Calibration target 85-90% + DEMO-1 verify + AUDIT_VERIFICATION_REPORT §2 TIME-1 reframing.

### §36.91 T2 The Filter RESOLVED via ADR 023 LOCKED V1 (2026-05-03 audit total addendum)

**Decizie:** T2 The Filter finding (NU codificabil prin regex/NLP determinist, originally HIGH acceptable trade-off) = RESOLVED prin §36.86 ADR 023 LLM Intent Interpretation. Status finding: CLOSED.

**Rationale:**
- ADR 023 scope strict 2 trigger points (Pain text + Equipment text) acoperă core T2 Filter problem (intent interpretation user free-text input)
- Bugatti sandbox preserved (temperature 0.0 + structured outputs + regex fallback)
- Anti-RE preserved (engine deterministic, LLM scope strict)
- MOAT pillar 3 (Decizii verificabile) preserved (CDL `llm_metadata`)

**Action:** Remove T2 din finding-uri actionable list. Audit consolidat cumulative count post-RESOLVED.

**Cross-refs:** §36.86 ADR 023 (resolution mechanism) + AUDIT_VERIFICATION_REPORT §11 T2 reclassified RESOLVED + AUDIT_IDEATION_REPORT §7 T2 not candidate ideation (closed).

### §36.92 Audit Consolidat Reclasificare 4 Buckets META (2026-05-03 audit total)

**Operațiune meta (NU LOCKED V1 nou — reclasificare findings catalogating):**

Audit consolidat 9 passes (~63 raw findings) + Faza 1 verification + Faza 2 ideation + addendum chat strategic = reclasificare 4 buckets:

**Bucket 1: REZOLVABIL pre-Beta (~16 actionable)**
- 4 CRITICAL pre-Beta blockers (B4 RPE Verbal + B2 T&B Faza 1+2 + B3 Founding Cap atomic + N1+N5-NEW AUDIT_30_9 cleanup) — T1 demoted HIGH parțial mitigated, B1 demoted MEDIUM doc hygiene
- 12 HIGH cleanup batch (T1 decizie strategică + ADR 023 implementation + OBSERVABILITY-1 Sentry filter + CONTRADICTION-1 ADR 003 vs §36.16 + TRIPLE-1+QUADRUPLE-1 Onboarding+Goal SSOT + ORPHAN-1 ADR 022 split + R1-NEW Reconciliation Coordinator + N2 Privacy + DEAD-1 ADR 021 Faza 2 + Q11-INFRA Cloud Functions + DRIFT-1+DH2+NEW-2 + Observation Mode Beta)
- Total Opus realist: ~12-18h actual + Daniel chat strategic ~5-7h
- Plus expert validator coach paid €500-1000 one-time

**Bucket 2: Post-launch V1.1 (deferred ~10 items)**
- FM-16 Engine Self-Audit Weekly + FM-17 Memory-Aware Questions + IMP-15 Sprint Vault Hygiene Q2 2026 + NEW-IDEATION-3/4/5 + SG-* business metrics + multi-gym + HR optional + travel mode

**Bucket 3: Acceptabil trade-off permanent (~5 items)**
- Bus factor 1 ACCEPTED pre-revenue (§36.88) + N3 velocity + BACKLOG-1 + R3 + custom exercises REJECTED V1 + climate awareness DROP + audio recording form check DROP + group challenges PERMANENT REJECT (§1.7 anti-vendetă)

**Bucket 4: Reconsiderate (~6 items)**
- Cognitive Q4 DELOCK (§36.87) + T2 RESOLVED (§36.91) + TIME-1 MEDIUM (§36.90) + Calibration 85-90% (§36.89) + B1 Mode Detection demoted MEDIUM + I1 Volume Multiplier reframed -19% real

**Top 6 ideation integrate pre-Beta (din audit ideation §5 ranked Top 10):**
1. IMP-1 Volume Floor Guarantee META-RULE-QUINQUE — anti-amputation Maria 65 (~1h)
2. IMP-3 Synthetic Demographic Prior pre-Calibration plan A (~8-12h dacă DEMO-1 incomplete)
3. NEW-IDEATION-1 Expert Validator Coach Paid plan E (€500-1000 + 2-4h sourcing)
4. FM-2 Mobility/Warm-up Auto-Insertion (~5h, longevity 50+ Maria critical)
5. FM-8 Pre-Injury Recovery Debt PROACTIVE (~2-3h, anti-injury proactive)
6. IMP-4 Spec→Cod Tracking Matrix (~1.5h, anti-recurrence drift)

**Total cumulativ pre-Beta cleared (post-addendum):** ~30-45h Opus realist + ~12-18h Daniel chat strategic + €500-1000 expert validator one-time + 4-6 săpt calendaristic factor sustainability Daniel solo.

**Real findings count post-deduplication + reclassification:** ~40 actionable (NU 53 verification report, NU 63 raw audit). Audit consolidat acuratețe 7.5/10 (Faza 1 verdict).

**Decision points pending Daniel chat strategic NEW (D1-D6):**
- D1: T1 "Save the week silent" — A passive intelligence / C in-app banner pasiv (NU B opt-in friction Maria 65)
- D2: §36.86b DELOCK Mechanism META-RULE — "orice prebeta LOCKED V1 are date target; 2 săpt înainte de Beta lock NU e implementabil → V1.1 cu Daniel sign-off explicit"
- D3: Cloud Functions Blaze plan upgrade A/B (€5-10/lună budget vs Q11 violation explicit)
- D4: Goal Taxonomy LOCKED — A ADR 017 6 EN / B §26.3 5 RO / C hybrid (recommend C)
- D5: Sprint Vault Hygiene Q2 2026 — A dedicate 6-10h / B inline / C defer
- D6: ADR 023 cost monitoring infrastructure — A backend Cloud Functions / B frontend-only soft cap (depends D3)

**Decision points DONE acest addendum (din §0):** D-DONE-1 through D-DONE-6 (ADR 023 LOCKED + Cognitive Q4 DELOCK + Bus factor TRADE-OFF + Calibration 85-90% + TIME-1 MEDIUM + T2 RESOLVED).

**Cross-refs:** §36.86-§36.91 (decizii LOCKED V1 acest addendum) + AUDIT_VERIFICATION_REPORT (Faza 1 cap-coadă verify) + AUDIT_IDEATION_REPORT (Faza 2 ~50 idei NEW) + HANDOVER_AUDIT_TOTAL §1-§11 (synthesis cumulativ) + DIFF_FLAGS.md P1 BLOCKER (ADDENDUM source upload pending pentru ADR 023 sub-secțiuni A-M complete) + 05-findings-tracker/FINDINGS_MASTER.md (audit consolidat reclassification appended) + §36.80 Auth Flow Priority 1 ABSOLUT (separate sequencing).

### §36.93 D3 LOCKED B — Cloud Functions Blaze RESPINS, Spark Plan Retain (2026-05-03 chat strategic post-audit)

**Decizie:** D3 (din §36.92 decision points pending) → **B Spark Plan retain** LOCKED. Cloud Functions Blaze upgrade RESPINS pentru pre-Beta. Reconsider post-revenue confirmed.

**Rationale calculul real (NU paranoia):**
- Volum LLM SalaFull realist: **50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier** (14,400/zi limit free)
- Cost cap €10/lună din ADR 023 §2.H = paranoia, NU nevoie reală
- **Bootstrap-aware Bugatti:** scale când e problemă reală, NU ipotetică

**Implicații propagate:**
- **D6 = frontend-only soft cap** (depinde D3=B per §36.92 D6 spec)
- **ADR 023 §cost monitoring** = frontend telemetry acceptabil (NEW-IDEATION-5 backend deferred post-revenue)
- **Q11 latency budget violation** = accept explicit pre-Beta, reconsider post-100 useri reali
- **NEW-IDEATION-5 Cost monitoring backend** = DEFERRED post-revenue (NU pre-Beta blocker)

**Reconsideration triggers (per ADR 023 §2 update):**
1. Revenue confirmed (Founding cap 50 + Standard month 6+ runway sustainability)
2. Groq llama-3-8b-it deprecation forced (provider lifecycle)
3. Demand spike >5% Groq free tier (~720 calls/zi → ~250 useri activi)

**Cross-refs:** §36.92 D3 decision point RESOLVED + §36.86 ADR 023 §2.H cost cap + §36.88 Bus factor pre-revenue trade-off + ADR 023 §Reconsideration Trigger #2 update appended + Q11-INFRA finding RESOLVED via D3=B + NEW-IDEATION-5 Cost monitoring backend (deferred post-revenue).

### §36.94 ADR 025 CANDIDATE — "Andura Gândește pentru User" / Graceful Degradation Universal (2026-05-03 chat strategic post-audit)

**Decizie:** ADR 025 candidate file creation pending Faza 3 cleanup. Articulare retroactivă a principiului fondator implicit în deciziile bune existente.

**Origin story (preserve verbatim în ADR Context):**
> Excel "câte kg la leg press" 13 zile → app coach AI fitness Bugatti paradigm. Revelația retroactivă a principiului fondator articulat acest chat: "Andura gândește pentru user. User poate ignora orice feature. Andura tot funcționează cu acceptable quality."

**Decision wording proposed LOCKED V1 (verbatim handover §1):**
> "Aplicabilitate: ALL features V1 + V1.5 + V2+ permanent.
> Mecanism: graceful degradation mandatory + skippable everything + engine-pre-fills-default + user-override-optional.
> Filtru pre-feature LOCK: 'Dacă user ignoră complet feature, app-ul tot funcționează rezonabil?' DA → eligible LOCKED. NU → REJECTED indiferent tech sophistication."

**Status:** Candidate. ADR file `03-decisions/025-andura-gandeste-pentru-user.md` PENDING file creation Faza 3 (per recomandare G ADR Numbering Additive + audit Faza 3 ~2-3h CC autonomous).

**Cross-ref retroactiv (deciziile bune existente articulate retroactiv principiul):**
- B4 RPE Verbal skip → engine assume "Potrivit" default
- B2 T&B Faza 1+2 skip prompt → engine continuă cu generic progression
- §36.86 ADR 023 Pain text skip → engine assume zero pain
- §36.86 ADR 023 Equipment text skip → engine assume bodyweight default
- §36.44 T0 Onboarding skip → demographic prior din synthetic ADR 017
- §36.44 T1+ Profile Typing skip → engine acceptable from age/sex/kg

**Implicații pre-feature LOCK filter (forward-looking):**
- Toate feature decizii viitoare trebuie să treacă filtru "skip-tolerant rezonabil?"
- Reject-pattern: features care REQUIRE user input mandatory → REJECTED
- Engine-pre-fills-default mandatory pe toate user-input fields

**Cross-refs:** §36.86 ADR 023 (graceful degradation pattern existing) + §36.81 Coach Intelligence (substitutions hierarchy algorithmic = skip-tolerant) + §36.82 Pre-Session Energy (skip = baseline normal) + §36.44 T0 Hard Minimum + ADR 017 Demographic Prior + Gigel test (Maria 65 friction zero) + SUFLET F2 ("AI-ul informează, nu impune").

### §36.95 ADR Numbering Additive LOCKED — ORPHAN-1 Resolution (2026-05-03 chat strategic post-audit)

**Decizie:** ADR Numbering Additive Rule LOCKED — ZERO renumber existing, additive curat zero collision.

**ADR 022 ORPHAN-1 finding split (per audit Faza 1 §2 recomandare G):**

| ADR# | Topic | Status | File creation |
|------|-------|--------|---------------|
| **022** | Bayesian Nutrition Inference | PENDING file creation Faza 3 | `03-decisions/022-bayesian-nutrition-inference.md` |
| **023** | LLM Intent Interpretation & Fallback (existing) | LOCKED V1 partial spec | `03-decisions/023-llm-intent-interpretation.md` (ingested 2026-05-03 audit total) — **NU renumber** |
| **024** | Goal-Driven Program Templates | PENDING file creation Faza 3 | `03-decisions/024-goal-driven-program-templates.md` |
| **025** | Andura Gândește pentru User / Graceful Degradation Universal | PENDING file creation Faza 3 (§36.94 candidate) | `03-decisions/025-andura-gandeste-pentru-user.md` |

**ADR 023 LLM Intent existent NU renumber.** ADR 022 (Bayesian Nutrition) + ADR 024 (Goal-Driven Templates) = 2 scopes split din ORPHAN-1 collision.

**Naming collision history (per audit Faza 1 §2):** ADR 022 referenced 9+ places în vault (PRODUCT_STRATEGY §3.5.1 + DECISION_LOG + HANDOVER §29.7 / §28.6 / §29 multiple) cu 2 scopes propuse (Bayesian Nutrition + Goal-Driven Templates) → split necesar.

**Cross-refs:** §36.86 ADR 023 LLM Intent (existing) + §36.94 ADR 025 Candidate (Andura Gândește) + §36.92 ORPHAN-1 audit finding HIGH + audit Faza 1 §2 recomandare G + 110_VAULT_AUDIT_INVENTORY.md §4 ADR Drift Detection.

### §36.96 Vault Hygiene Sprint = Priority 0 + 8 Recomandări APROBATE Co-CTO (2026-05-03 chat strategic post-audit)

**Decizie strategică:** Vault Hygiene Sprint promovat **Priority 0 (înaintea pre-Beta blockers + Auth Flow §36.80)**. Per Daniel directive "decide tu, e pentru tine" → toate 8 recomandări audit Faza 1 APROBATE Co-CTO 100% (NU Daniel chat strategic suplimentar).

**Rationale promote Priority 0:**
- Daniel NU citește vault (psihic imposibil) — vault e pentru Claude chat + CC Opus
- Drift cumulativ → halucinare risc + indexare cost + inconsistențe răspuns chat-uri viitoare
- Fragmentări SSOT (Goal 5 + Onboarding 5 + Pricing 4 + Mode Detection 3 + RPE/RIR 3) + 4 ADR drift + 22 orphan wikilinks + DECISION_LOG UTF-8 broken + INDEX_MASTER stale 3 zile + HANDOVER_GLOBAL 5443 LOC mega-fișier blochează decizii downstream calitate
- **ZERO cod până vault clean** (sequencing strict per §36.92 §10 HANDOVER §10)

**8 recomandări APROBATE (per Daniel directive Co-CTO 100% delegation):**

| ID | Recomandare | Status |
|----|-------------|--------|
| A | HANDOVER_GLOBAL split = Option C (Active 30 zile + Archive cronologic per lună) | ✅ APROBAT execute Faza 3 |
| B | Goal Taxonomy + Onboarding SSOT consolidare = hybrid C (deja LOCKED §36.92 D4) — `01-vision/ONBOARDING_SSOT_V1.md` exhaustiv | ✅ APROBAT execute Faza 3 fără chat strategic extra |
| C | INDEX_MASTER refresh complete (stats 62+ files, pricing €39/€59/€79, ADR 023 + 8 drafts + 022/024/025 stubs add) | ✅ APROBAT mecanic CC |
| D | Archive policy = PĂSTREAZĂ audit pass 1-9 raw + sessions istorice ca audit trail permanent (NU consolidate, NU delete) | ✅ APROBAT zero change |
| E | Folder restructuring = NU change (00-08 + inbox/outbox solid) — exception DIFF_FLAGS root → 05-findings-tracker/ | ✅ APROBAT minimal change |
| F | Orphans cleanup 22 wikilinks MISSING + 3 UNREFERENCED (19 LOW delete refs + 4 MEDIUM EXEC_QUEUE rename → INSIGHTS_BACKLOG) | ✅ APROBAT mecanic |
| G | ADR 022 split fizic per ADR Numbering Additive rule (§36.95) — 022 + 024 + 025 stubs create | ✅ APROBAT |
| H | DECISION_LOG.md UTF-8 re-save (chars `â€™`, `Ã¢`, `Â§` proliferate) | ✅ APROBAT mecanic ~30min CC |

**Status faze Vault Hygiene Sprint:**
- Faza 1 Audit Structural: ✅ COMPLETE (110_VAULT_AUDIT_INVENTORY.md ~600 LOC §1-§9 + LATEST.md raport, commit `a5b1542`)
- Faza 2 Daniel Validare: ✅ COMPLETE (delegated Co-CTO 100%, 8 recomandări APROBATE acest handover)
- Faza 3 Execution Cleanup: ⏳ PENDING chat NEW (~2-3h CC autonomous Opus factor 7-9x realist)
- Faza 4 Maintenance Protocol LOCK: ⏳ PENDING chat NEW (~30min CC — vezi §36.97)

**Cross-refs:** 110_VAULT_AUDIT_INVENTORY.md §1-§9 (Faza 1 audit complete) + §36.92 D4 Goal Taxonomy hybrid C (B recomandare cross-ref) + DIFF_FLAGS.md P2-FLAG-1 D1-D6 status updates (D3=B + D5 superseded "Q2 2026" → "Priority 0 acum") + §36.80 Auth Flow Priority 1 ABSOLUT (preserved separat post-Vault Hygiene).

### §36.97 Faza 4 VAULT_HYGIENE_PASS = LOCK ca Rule (2026-05-03 chat strategic post-audit, codification PENDING Faza 3-4)

**Decizie:** VAULT_HYGIENE_PASS = extension comenzii standard "Ingest handover from inbox" cu STEP 10-15 vault hygiene mandatory automat. NU optional, NU prompt separat, parte din ingest flow.

**Spec STEP 10-15 (per audit Faza 1 §8):**
1. **STEP 10:** Detect new SSOT fragmentation (>1 file pe same topic introdus în această sesiune)
2. **STEP 11:** Detect new orphans (referințe noi la files absent SAU drift cu existing)
3. **STEP 12:** Detect ADR drift (new amendments fără INDEX_MASTER status update)
4. **STEP 13:** Detect HANDOVER size threshold (LOC > N → flag pentru split)
5. **STEP 14:** Auto-fix mecanic safe (cross-refs reciproce, INDEX_MASTER append, archive un-numbered)
6. **STEP 15:** Flag DIFF_FLAGS dacă consolidare manuală necesară (Daniel prompt next chat)

**Effort run:** ~10-15min CC autonomous per ingest.

**Codification PENDING Faza 3-4:**
- VAULT_RULES.md root §VAULT_HYGIENE_PASS NEW section
- PROMPT_CC_INGEST_HANDOVER.md update cu STEP 10-15

**Trigger post-codification:** post-ingest mandatory, NU optional, parte integrantă din "Ingest handover from inbox" command.

**Cross-refs:** 110_VAULT_AUDIT_INVENTORY.md §8 maintenance protocol spec + §36.96 Faza 3 sequencing (Faza 4 LOCK post-Faza 3 cleanup) + VAULT_RULES.md §HANDOVER_PROTOCOL extension target.

### §36.98 System Prompt Claude Chat Andura LOCKED V1 (2026-05-03 chat strategic post-audit)

**Decizie:** Generat artefact `SYSTEM_PROMPT_CLAUDE_CHAT_ANDURA.md` (post-fix vault structure + repo rebrand andura.app + ADR count 23 core + 8 drafts + Daniel-isms complete + vault hygiene rule mention + context state snapshot 85 LOCKED V1 → updated 87 post acest chat).

**Status:** Daniel folosește pentru chat NEW system prompt. Artefact generat în chat strategic acest sesiune (NU în vault încă). Cross-ref archiving pending la oportunitate.

**Cross-ref archive opportunity:** `08-workflows/CLAUDE_CHAT_INFRASTRUCTURE.md` extension — adaugă System Prompt section pentru consistency cross-chat.

**Cross-refs:** 08-workflows/CLAUDE_CHAT_INFRASTRUCTURE.md (potential archive target) + DANIEL_COMPLETE_PROFILE (Daniel-isms source) + Vault Hygiene Sprint outcome (post-fix vault structure reflecting acuratețe).

---

**Sesiune 2026-05-02 PRE-LAUNCH FINAL LOCK (chat strategic F-NEW LOCKED V1 OBLIGATORIU + MMI + Storage Full UX + UX Friction + 3 Blockers Sprint 4.x + GC defer + Investiții confirmate). ~35 decizii LOCKED + ~6 push-back-uri productive Claude. **PRE-LAUNCH V1 SCOPE CLOSED — 0 sesiuni chat strategic rămase.** F-NEW-1/2/3/4 LOCKED V1 OBLIGATORIU (§22 UPDATE in-place din "flagged HIGH" → "LOCKED V1 OBLIGATORIU"): F-NEW-1 i18n exerciții RO inversare regulă UI Default RO + Toggle EN OFF (lista finală 6 traduceri locked Romanian Deadlift → Îndreptări (RDL) / Lat Pulldown → Tracțiuni la helcometru / Bulgarian Split Squat / Cable Row / Hip Thrust / Face Pull, pattern reusable 3 categorii) + F-NEW-2 Tier-aware progression matrice 3 tiers Beginner 0-10 / Intermediate 11-50 / Advanced 51+ + Sprinter Cap modifier (compound 1.0 kg / isolation +1 rep) + Edge case Deload skip soft warning Bugatti tone "corpul recuperează în mișcare, nu doar în repaus" + F-NEW-3 Cooldown rate-limiting (3+ înlocuiri 7-day rolling silent + phase change <24h absorb a 2-a "Obiectiv actualizat") + Edge case "User Pierdut" dual condition aderență <25% AND 7 zile zero login (elimină false positives boală/concediu) + F-NEW-4 Banner "Plan ajustat astăzi pentru recovery" + buton "Folosesc varianta mea" replacement force-typing. MUSCLE MEMORY INDEX (MMI) HIBRID LOCKED V1 (§32 NEW): algoritm Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup + boost progresie 3 săpt (6-12 luni 0.80×/1.25× / 12-24 luni 0.70×/1.10× / 24+ luni 0.60×/1.00× start proaspăt) + threshold trigger user-controlled 6+ luni pauză prompt agency 100% + UI Bugatti tone "Pauza face parte din drum. Începem treptat — corpul tău își amintește." Justified V1 (Maria post-operație șold 8 luni revine ~iulie 2027). Effort ~3-4h Sonnet. STORAGE FULL UX ALERT LOCKED V1 (§33 NEW): Threshold 80% banner săptămânal NU blocant (3 buttons Exportă/Cloud Pro/Închide) + Threshold 95% modal blocant 3 alegeri obligatorii (Descarcă JSON / Activează Cloud / Șterge automat 180 zile alegere definitivă) ZERO data loss silent industry standard Apple/Google/Dropbox + Cap Pro upgrade 1×/săpt + auto-rotate 180 zile DOAR consimțământ explicit. Effort ~4-6h Sonnet. 3 OPTIMIZĂRI UX FRICTION LOCKED (§29.5.5 amendment + §29.5.14 + §29.5.17 + §29.5.18 NEW): Onboarding 5 → 4 ecrane disclaimer integrat ecran 4 Obiectiv (checkbox disabled-until-checked, total <45 sec vs <60 sec) + Autofocus iOS workaround `<input type="number" inputmode="numeric">` + setTimeout 50ms focus programatic (zero tap suplimentar) + The Next-Up Gaze preview vizual cartonaș set următor în timpul rest timer auto-start (soft highlight + border glow ~1-2h Sonnet extension §29.5.5) + Friction Map V1 final touchpoint matrix (Onboarding 🟢 / Pauze 🟢 / Editare istoric 🟡 / Storage Full 🔴 / Disclaimer 🟡 / MMI prompt 🟡). 3 BLOCKERS SPRINT 4.x IDENTIFICATE PRE-LAUNCH (§34 NEW): Blocker 1 T&B Faza 2 persistence Memory Paradox bug (~50-80h trad / ~3-5h Opus, user delete entry → reload → entry RE-APARE Firebase pull) + Blocker 2 Firebase Rules RTDB lock (production-blocker `database.rules.json` syntax LOCKED, sub 1h Daniel + emulator + manual publish) + Blocker 3 D1 DEVELOPING refactor 5→6 tiers (CALIBRATION_LEVELS 0-4 → 0-5 + ID renumber + schema migration + Golden Master ~30+ test cases, ~8-12h trad / ~2-3h Opus). GC TOMBSTONES DEFER 6 LUNI POST-LAUNCH (§35 NEW): Cloud Functions GC AMÂNAT, borna evaluare oficială 1 iulie 2027, rationale buget zero Firebase Spark plan + ~3% din 1GB / 6 luni; alegere A automation Blaze / B manual Daniel / C mai amână. INVESTIȚII CONFIRMATE ZERO BUGET NOU (§31 AMENDMENT): preserved €500-700 worst-case primul an + breakdown 6 luni primele ~€310-515 (Firebase free tier suficient cf §35 GC defer). 888/888 unchanged. Bandwidth Daniel ~3h Daniel-time real saturation triggered preventiv anti-halucinație. Status V1: 8/8 templates 100% LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers identificate + GC defer 6 luni + 0 sesiuni chat strategic rămase pre-launch. Next: rebrand sweep CC Opus dedicat ACUM + ADR 022 V2 draft consolidare totul + Sprint 4.x cluster (Blockers 2/3/1 FIRST → PR Engine + Linear Block + Safety Banner + Hip Thrust + Age guardrail + Mastery Milestone + Sticky Swap + Clean Slate Reset + Onboarding 4 ecrane + Autofocus iOS + Editare Istoric + Notificări + F-NEW 1/2/3/4 + MMI + Storage Full + Next-Up Gaze) + wording Phase B/C bulk Sonnet + PARAMETRIC refactor + exercise library + Beta sept-dec 2026 + audit legal dec 2026 + Soft Launch 1 ian 2027 🚀 + Borna GC 1 iul 2027.**

**Sesiune 2026-05-02 late evening LOCK (chat strategic Gemini cross-check 12 decizii LOCKED + Beta-launch ASAP strategy + Recovery halucinație handover chat anterior "Acasă"). 12 decizii LOCKED Gemini cross-check (TWA Google Play V1 / Android-only confirmed / Buget Legal Stage 1+2 + barter avocat / NPS Feedback UX / Indicator monocromatic theme-aware / Wording 4 elemente fix exerciții / §33.2 Storage Full 95% suprimare in-session / Pricing V2 amânat post-beta / Founding Members + Discord ELIMINATE V1 / Chalkboard V1.1 defer / Wording Phase A/B/C strategy / Exercise Library Extension HARD BLOCKER V1) + Beta-launch ASAP strategy LOCKED (NU 1 ian 2027 fix, beta prieteni/rude/network ~7-10 zile calendar ready, audit legal post-beta cu avocat prieten barter Pro lifetime, batches C-F + Legal + Rebrand + ADR 022 + Wording mixed). Lessons learned anti-halucinație: bandwidth self-reporting unreliable (~50% real vs raportat near saturation), shell detection pre-prompt obligatoriu, hard floor time run Opus instructed, SSOT claims verify pre-implementation, findings tracker mandatory în prompt CC. **Batch A + Batch B Sprint 4.x autonomous COMPLETE post chat:** Batch A 4 commits 888→955 tests + Batch B 9 commits 955→1110 tests +155 net (Auth Faza 1 + Memory Paradox hotfix + Foundation 1/2/4 + SafetyBanner wiring + Tier 2 findings sync + §34.1 amendment + Vite warnings cleared). Wall-clock total Batch A+B ~30-40 min Opus runtime. 1110/1110 unchanged. Bandwidth Daniel ~3-4h Daniel-time real saturation triggered preventiv anti-halucinație (chat anterior crash recovery). Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + 12 decizii LOCKED late evening + Beta-launch ASAP strategy + 0 sesiuni chat strategic rămase pre-launch. Next: Batch C scope decision (T&B Faza 1+2 full RECOMANDAT ~10-15h Opus / Library Extension + Imagini Pilot bottleneck Daniel review / Features V1 cluster) + chat nou strategic Beta-launch ASAP review + Daniel manual Firebase Console setup Auth dogfood + Founding Members + Discord references sweep §29.6.3 + §1.4 PRODUCT_STRATEGY_SPEC + ADR Q-0533 mark DEPRECATED.**

**Sesiune 2026-05-02 SUFLET ANDURA LOCK (chat strategic ingest "Procesul de gândire complet" 12k cuvinte alt chat Claude cu Daniel — material filozofic permanent codificat în SalaFull/Andura engine — adaptat V1 PWA cu Maria/Gigica/Marius beachhead). 11 decizii LOCKED noi (RIR Matrix Adaptiv profile + exercise category aware / 4 Moduri UI Detection pure event listeners / Bias Detection Observabilă Volume Creep + Auto-pedeapsă / Catastrofizare SCRAP V1 defer V2 / T1+ Onboarding Completion-Based 4 sesiuni / T1+ Câmpuri Minim 3 Gigel-Validated / Android Eviction Sync Validation pre-close / Outlier Filter Profile-Aware ASK Don't IGNORE / Cascade Defense 4 Layers / Outlier Confirmed ≠ New Baseline) + ~12 push-back-uri productive Claude (Marius single RIR 0, Maria reps NU sets, Validation-seeking trigger fragil, Frustrat split tehnic vs viață, Catastrofizare scrap, Auto-pedeapsă wording paternalist, T1+ Gigel test, Risc 3 wrong context, Outlier ASK don't IGNORE, Confidence INTERNAL not user-facing, Sanity bounds dinamice, Outlier ≠ baseline). Decizii cumulative pre-launch V1 = 23 (12 Acasă chat anterior + 11 Suflet Andura). SUFLET_ANDURA SSOT new file `01-vision/SUFLET_ANDURA.md` create ca SKELETON cu translation map V1 (~75% replicabil + ~15% mai bine + ~10% irreplicable + ~30% V2+) + 11 LOCKED summary cross-ref + STUB pentru filozofie 12k cuvinte sursă pending Daniel upload `Procesul_de_gandire_complet.md` la inbox. P1 BLOCKER flag în DIFF_FLAGS.md: source document NU în inbox, partial ingest procedat — fabricarea 12k content INTERZISĂ per zero-info-loss principle. 5 ADR drafts generate `03-decisions/` status DRAFT pending Daniel review (RIR_MATRIX_ADAPTIVE / MODE_DETECTION_UI / BIAS_DETECTION_OBSERVABLE / OUTLIER_FILTER / CASCADE_DEFENSE). 8 amendments inline aplicate §22 F-NEW-4 + §29.2.5 Engine Forță + §29.2.6 Longevitate + §29.5 UX Colateral + §29.5.14 Onboarding + §33.2 Storage Full + §34.4 Sprint 4.x scope extended + §36.16-§36.27 NEW. ZERO sesiuni chat strategic rămase pre-launch V1 (re-confirmed). 1110/1110 unchanged (zero code touched, vault docs only). Bandwidth Daniel ~2-3h chat strategic Suflet Andura saturation ~20% triggered preventiv. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + 23 decizii LOCKED cumulative + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + 5 ADR drafts pending Daniel review. Next: Batch C scope decision (Suflet Andura implementation cluster RECOMANDAT ~14-18h Opus comprehensive self-contained / T&B Faza 1+2 full alternativ / Library Extension alternativ) + Daniel upload `Procesul_de_gandire_complet.md` la inbox pentru completare SUFLET_ANDURA §4 Filozofia Completă + Daniel review 5 ADR drafts → LOCK or amend + Phase B mini-sesiune ad-hoc 30-45 min (33 strings remaining + 4 wording-uri Suflet Andura preview deja LOCKED) + Founding Members + Discord references sweep + Daniel manual Firebase Console setup Auth dogfood.**

**Sesiune 2026-05-02 SELF-CORRECTION LOCK** (chat strategic post audit vault SSOT clean — verificare halucinație suspicion proces de gândire 12k cuvinte = NU halucinat, document factually coherent + structura 15 patterns + 10 funcții F1-F10 + 8 linguistic L1-L8 verbatim + math fizic corect + Daniel-isms verified). 8 decizii LOCKED noi (Realtime Per-Set Silent Recalibration §36.28 + §36.17 mid-session silent UI clarification §36.29 + §36.26 streak counter same direction + reset clarification §36.30 + God Mode RESPINS V1 §36.31 + Explainability Module Lazy Generation §36.32 + Time-Constrained Adaptive Per Profile §36.33 + Profile Validation Layer 8 sesiuni 3/3 simultaneous threshold + User-Triggered Reset §36.34 + Goal Shift Event Handler interval calibration phase §36.35) + 8 push-back-uri productive Claude integrate (mid-set vs post-session prompt timing, streak same direction reset, God Mode SUFLET breach detection, Lazy on-demand generation, Time-Constrained adaptive Maria vs Marius, 8 NU 12 sesiuni audit, 3/3 simultaneous NU 40% threshold, Goal Shift interval NU single 1RM formula). Decizii cumulative pre-launch V1 = **31** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION). 3 §AMENDMENT inline aplicate (§36.17 + §36.24 + §36.26). 5 ADR drafts updated (MODE_DETECTION extends Profile Validation + Explainability + silent UI; OUTLIER_FILTER extends streak counter + Goal Shift; RIR_MATRIX cross-ref realtime per-set; CASCADE_DEFENSE cross-ref Layer D budget ≤50ms; BIAS_DETECTION untouched). Schema impact future Sprint 4.x: exercise library `tier` field + Setări 2 butoane noi (Schimbă obiectiv / Resetează profil) + build script production gate `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING`. ZERO sesiuni chat strategic rămase pre-launch V1 (re-confirmed 3rd time). 1110/1110 unchanged (vault docs only). Bandwidth Daniel ~30% triggered handover preventiv. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + **31 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + filozofia 12k cuvinte INGESTED + Self-Correction Architecture LOCKED + 5 ADR drafts pending Daniel review pre-LOCK. Next: Batch C scope decision (Suflet Andura + Self-Correction Implementation Cluster RECOMANDAT ~16-22h Opus comprehensive — extinde anterior 14-18h cu §36.28-§36.35 Self-Correction architecture / T&B Faza 1+2 alternativ / Library Extension alternativ) + Daniel review 5 ADR drafts → LOCK or amend (BLOCKER pe implementation cluster) + Phase B mini-sesiune ad-hoc (~33 strings remaining + 4 wording-uri Suflet preview + 1 wording NEW PROMPT_PROFILE_VALIDATION_PLACEHOLDER §36.34 + 1 wording NEW Goal Shift mesaj Modul Curios §36.35) + Founding Members + Discord references sweep + Daniel manual Firebase Console setup Auth dogfood.**

**Sesiune 2026-05-02 Chat C SELF-CORRECTION EXTENSION LOCK** (chat strategic post Self-Correction ingest precedent — 6 features cluster: Aparat Ocupat/Lipsă smart-routing dependent force_demand + Pain/Discomfort Button 3 funcțional anti-paternalism cu CDL override + Hormonal Estimation RESPINS V1 reframed Performance State Inference observable + Composite Signal Layer Recovery State Adjustment 3/3 simultaneous + Cycle Tracking RESPINS V1 + Onboarding T0/T2 wording functional + Pricing deferred pre-launch + Beta cohorts 3-tier 50 users). 14 decizii LOCKED noi (Schema Extension §36.36 + Smart-Routing §36.37 + Pain Button §36.38 + Yellow Flag -20% lock §36.39 + Hormonal Estimation RESPINS §36.40 + Composite Signal Layer §36.41 + ADR review process §36.42 + Cycle Tracking RESPINS §36.43 + T0 hard minimum §36.44 + T2 wording funcțional §36.45 + Pricing deferred §36.46 + Beta cohorts §36.47 + Per-set normalization §36.48 + Dual-threshold + Recovery -20% §36.49) + ~12 push-back-uri productive Claude integrate (Schema gap force_demand vs tier, Forced Skip paternalism mascat 3-button override, Diagnostic-flavored wording → funcțional, Hormonal estimation F6 violation + validity zero, 50% scor cumulative arbitrary → 3/3 thresholds, Recovery duration vague → 1/2/4/+1 lifecycle, Buton inconfort signal subjectiv → exclude Composite, Volume total false positive → per-set normalization, 10% threshold solo Maria false positive → dual-threshold absolute, ADR LOCK chat sumar teatru → file-by-file review, T2 jargon "Strategic" Gigel fail → wording funcțional, Cycle tracking F6 violation → Composite coverage). Decizii cumulative pre-launch V1 = **45** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C). 3 ADR drafts updated (MODE_DETECTION extends T2 wording funcțional EXT-7; BIAS_DETECTION extends Pain override CDL EXT-1; CASCADE_DEFENSE extends Composite Signal Layer D budget EXT-2; OUTLIER_FILTER + RIR_MATRIX untouched). 3 ADR NEW DRAFT defer creation Sprint 4.x cluster batch (COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON + SMART_ROUTING_EQUIPMENT). Schema impact future Sprint 4.x: exercise library equipment metadata + onboarding T0 fallback synthetic + Card 3 butoane noi (Aparat ocupat/lipsă/Disconfort) + Composite Signal module new src/engine/compositeSignal.js. ZERO sesiuni chat strategic STRATEGIC rămase pre-launch V1 — REMAINING doar tactical (ADR review 1.5h + Phase B wording 45min + Discord/Founding 25min cumulative ~3h). 1110/1110 unchanged (vault docs only). Bandwidth Daniel ~18% triggered handover preventiv. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + **45 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + Self-Correction Architecture LOCKED + Chat C Smart-Routing/Pain/Composite LOCKED + 5 ADR drafts pending Daniel review pre-LOCK + 3 NEW ADR drafts pending Sprint 4.x batch creation. Next: Priority 1 ADR review 5 drafts ~1.5h chat strategic dedicat → Sprint 4.x cluster UNBLOCKED → Priority 2 Phase B wording 35 strings 45min → Priority 3 Discord+Founding 25min → Priority 5 Founding+Discord vault sweep CC Opus 30min → Sprint 4.x cluster ~18-25h Opus comprehensive (Suflet Andura + Self-Correction + Chat C combined).**

**Sesiune 2026-05-02 Chat D PRICING + TELEGRAM + ADR LOCK** (chat strategic post Chat C SELF-CORRECTION EXTENSION ingest — 4 features cluster: Pricing/Founding final lock €39/€59/€79 + 34% perpetual + cap 50 + Telegram Beta Channel + Telegram Topics structure + GDPR phone privacy onboarding rule + 5 ADR drafts → LOCKED V1 cu 4 amendments aplicate). 8 decizii LOCKED noi (Pricing tiers §36.50 + Founding Locked-In Guarantee §36.51 + Cap 50 + Auto-close §36.52 + Telegram Channel §36.53 + Topics Structure §36.54 + GDPR Tutorial Vizual §36.55 + ADR Review Process EXECUTED §36.56 + 4 Amendments Aplicate §36.57) + ~3 push-back-uri productive Claude integrate (Pricing inițial €99/€149 RESPINS sub-SensAI, Lifetime €50 RESPINS, "20% discount din anul 4" wording trap RESPINS → 34% permanent perpetual). Decizii cumulative pre-launch V1 = **53** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D). 5 ADR drafts toate LOCKED V1 (RIR_MATRIX clean + MODE_DETECTION cu 3 amendments inline + BIAS_DETECTION clean + OUTLIER_FILTER cu 1 amendment inline + CASCADE_DEFENSE clean). 3 NEW ADR drafts STILL deferred Sprint 4.x cluster batch. Sprint 4.x cluster scope ADD: Pricing schema implementation (subscription_tier enum + founding_cap_counter atomic Firebase RTDB + auto-close mechanic). Production gate updated: build script grep ambele PHASE_B placeholders (PROFILE_VALIDATION + GOAL_SHIFT_CALIBRATION). Phase B scope confirmat 35 strings cumulative. ZERO sesiuni chat strategic STRATEGIC rămase pre-launch V1 — REMAINING doar: Phase B wording 45min strategic + 30min CC Opus vault sweep (Founding+Discord+Pricing references → Telegram replacement) + Daniel solo (Firebase Auth + DB rules + Avocat outreach + GDPR screenshot tutorial). 1110/1110 unchanged (vault docs only). Bandwidth Daniel ~45% triggered handover preventiv anti-saturation. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + **53 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + filozofia 12k INGESTED + Self-Correction Architecture LOCKED + Chat C Smart-Routing/Pain/Composite LOCKED + **Pricing tiers LOCKED + Telegram channel LOCKED + 5 ADR drafts ALL LOCKED V1**. Next: Priority 1 Phase B wording 35 strings ~45min strategic dedicat → production gate cleared → Priority 2 CC Opus vault sweep ~30min (Founding + Discord + Pricing references → Telegram) → Sprint 4.x cluster implementation ~18-25h Opus comprehensive ADD pricing schema (subscription_tier + founding_cap_counter + auto-close).**

**Sesiune 2026-05-02 Chat E PHASE B WORDING LOCK** (chat strategic post Chat D PRICING+TELEGRAM+ADR LOCK ingest — Phase B mini-sesiune ad-hoc 51 strings LOCKED V1 across 5 engine modules + 2 NEW placeholder finalizate + production gate cleared post-implementation). 1 decizie LOCKED nouă (Phase B Wording 51 Strings LOCKED V1 §36.58) + 10 push-back-uri productive Claude integrate (Title Case RESPINS sentence case pur, "repetiții" RESPINS "reps" naturalizat, Q23 "stagnare" inconsistency RESPINS, Q24 −30% notation simetric, Q26.bis 🟠 RIR excepție justificată, Q33 anti-paternalism "verificăm", Q35 jargon "concentric" eliminat, Q39 "eșec" izolat psihologic RESPINS, Q42 "tipar" reductiv RESPINS, Q47 "Consolidăm" orfan RESPINS). Decizii cumulative pre-launch V1 = **56** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59 ADR 019 channel-agnostic + §36.60 marketing channel mix DEFERRED V1.1). Detail breakdown 51 strings: fatigue.js 8 + dp.js 20 + reality.js 6 + sys.js 13 + calibration.js 4 + 2 NEW placeholders LOCKED. §36.57 inventory amendment inline (35 → 51 actual count, diferența 16 strings discovered în review Chat E NU acoperite în §25 outdated inventory). 2 ADR drafts updated cu §AMENDMENT 2026-05-02 Chat E inline (MODE_DETECTION_UI EXT-4 PROMPT_PROFILE_VALIDATION_PLACEHOLDER wording final + OUTLIER_FILTER EXT-2 GOAL_SHIFT_CALIBRATION_PLACEHOLDER wording final). Filter Bugatti aplicat strict 10 reguli (sentence case + voice plural + zero numerice algoritmice + zero category exposure + zero comenzi paternaliste + reframing pozitiv + temporal-safe + emoji constraint 🔴🟡🟢 + 🟠 RIR excepție + phase RO native + "reps" universal). Production gate path post-Chat E: wording LOCKED V1, integration Sprint 4.x cluster va remove `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING` flags la implementation source. ZERO sesiuni chat strategic rămase pre-launch V1 (re-confirmed 4th time). 1110/1110 unchanged (vault docs only, source code updates pending Sprint 4.x). Bandwidth Daniel ~2h chat Chat E saturation triggered handover preventiv. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + **56 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + filozofia 12k INGESTED + Self-Correction Architecture LOCKED + Chat C Smart-Routing/Pain/Composite LOCKED + Pricing tiers LOCKED + Telegram channel LOCKED + 5 ADR drafts ALL LOCKED V1 + **Phase B Wording 51 Strings LOCKED V1** + **§36.59 ADR 019 channel-agnostic flag LOCKED + §36.60 marketing channel mix DEFERRED V1.1 LOCKED**. **§36.59-60 post-Chat-E LOCKED summary:** §36.59 FLAG 1 ADR 019 GDPR Discord refs → "community channel exposure" channel-agnostic (sweep pending Sprint 4.x sau dedicated CC) + §36.60 TikTok/IG/FB/Discord public marketing channel mix DEFERRED post-launch V1 (~Februarie 2027 V1.1 milestone). **Cumulative pre-launch V1: 56 LOCKED.** Next: Priority 1 Sprint 4.x cluster implementation ~18-25h Opus comprehensive (56 decizii LOCKED + 51 wording strings + ADR_MODE_DETECTION + ADR_OUTLIER_FILTER + ADR_RIR_MATRIX + ADR_BIAS_DETECTION + ADR_CASCADE_DEFENSE + 3 NEW deferred ADR drafts + pricing schema + founding cap atomic + Telegram channel link surface + ADR 019 channel-agnostic sweep §36.59) → production gate cleared (replace 51 strings sources + remove 2 PHASE_B flags) → tests 1110/1110 + new tests for placeholders → commit batch C → Beta-launch ASAP ready. Daniel solo carry-overs: Avocat barter outreach + Firebase Auth Console + DB rules publish + GDPR screenshot tutorial.**

**Sesiune 2026-05-02 Sprint 4.x CLUSTER EXECUTION** (CC Opus autonomous run post Chat E ingest — 5 batches sequential fail-fast strict + zero errors). **Pure execution session — ZERO decizii noi LOCKED.** Cumulative count rămâne **56** (unchanged Chat E baseline + §36.59 + §36.60). 5 commits pushed origin/main: BATCH_01 `7302950` (ADR 019 channel-agnostic sweep §36.59 — 2 line edits + §AMENDMENT inline) + BATCH_02 `e23c9cb` (Phase B 51 strings LOCKED V1 §36.58 integration în 5 engines fatigue/dp/reality/sys/calibration + downstream renderIdle/logging callers + 1 fixture coachDirector.test) + BATCH_03 `6d24462` (Schema Extension §36.36 `src/schema/exerciseMetadata.js` cu 26 exerciții + 6 Suflet Andura modules foundation `src/engine/suflet-andura/` rir-matrix + modes-ui + bias-detection + tier-progression + cascade-defense + outlier-filter + index, +27 tests) + BATCH_04 `ecb04f7` (Self-Correction §36.28-§36.35 cluster `src/engine/self-correction/` realtime-per-set + profile-validation + goal-shift-calibration + Chat C features Smart-Routing §36.37 + Pain Button §36.38 + Composite Signal §36.41 cluster modules, +28 tests) + BATCH_05 `8a91e34` (Pricing Schema §36.50-§36.52 `src/schema/pricing.js` cu atomic counter + auto-close + 3 NEW ADR drafts `03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md` + `ADR_PAIN_DISCOMFORT_BUTTON_v1.md` + `ADR_SMART_ROUTING_EQUIPMENT_v1.md` status DRAFT V1 pending Daniel review pre-LOCK, +9 tests). Total adăugat: ~1700 LoC code + tests + 440 lines markdown ADR drafts. **Tests: 1110→1174/1174 PASS (+64 net, +8 test files)**. **Production gate CLEARED:** `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING` = 0 matches în src/. ADR drafts status post-cluster: 5 LOCKED V1 (RIR_MATRIX + MODE_DETECTION_UI + BIAS_DETECTION_OBSERVABLE + OUTLIER_FILTER + CASCADE_DEFENSE) + **3 DRAFT V1 NEW** (COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON + SMART_ROUTING_EQUIPMENT) pending Daniel review. Final consolidated report: `📤_outbox/SPRINT_4X_FINAL_REPORT.md` (commit `c283a81`). **§BATCH_PROTOCOL pattern locked verbal Chat E (fail-fast strict + strict disjuncte + naming alfabetic + zero gate + model în header) = PROBAT REAL în pilot Sprint 4.x cluster, zero errors** — codification formală în VAULT_RULES.md §BATCH_PROTOCOL = carry-over decizie locked verbal pentru next chat strategic. **Foundation level scope** (NOT full integration): UI integration deferred ~6-10h Opus dedicat (Suflet Andura wiring în RuleEngine/ProactiveEngine/StagnationDetector + Bias Detection signals plumbing CDL extension + 3 Card buttons UI Aparat ocupat/lipsă/Disconfort + Goal Shift card UI counter Sesiunea ${current}/2 + PROMPT_PROFILE_VALIDATION_PLACEHOLDER UI render + Founding cap counter Firebase transaction wiring real + Telegram channel CTA surface). 5 carry-overs flagged HONEST: UI Integration ~6-10h + Cascade↔Composite wiring + Manual exercise metadata audit ~2-3h + Golden Master tests ~1h + Atomic counter Firebase transaction real wiring. ZERO sesiuni strategic blocking pre-launch V1 — REMAINING doar review + tactical decisions + execution sprints. Bandwidth Daniel: NU activ (autonomous run). Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial + 1 partial + 1 full) + **56 decizii LOCKED cumulative (unchanged)** + Beta-launch ASAP strategy + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 5 ADR drafts LOCKED V1 + Phase B 51 strings LOCKED V1 INTEGRATED + §36.59-60 post-Chat-E + **Sprint 4.x foundation modules CREATE + tests 1174 PASS + 3 ADR drafts NEW DRAFT V1**. Next: Priority 1 next chat strategic ~30min (review 3 ADR drafts NEW → LOCK V1 sau amend) → Priority 2 codificare VAULT_RULES.md §BATCH_PROTOCOL formal + generare prompt CC Sprint UI Integration ~6-10h Opus → Priority 3 Daniel solo paralel (Avocat barter + Firebase Auth Console + DB rules + GDPR screenshot tutorial §36.55) → Beta cohorts 3-tier 50 users invitation §36.47 + §36.53 Telegram → Beta sept-dec 2026 → Soft Launch 1 ian 2027 🚀. Marketing Channel Mix Decision = milestone V1.1 explicit ~Februarie 2027 per §36.60.**

**Sesiune 2026-05-02 CLUSTER 10-BATCH + Sprint UI Sequencing LOCK** (chat strategic post Sprint 4.x ALIGNMENT_QUESTIONS Daniel responses + cluster 10-batch autonomous execution complete + Sprint UI Integration sequencing decision). 1 decizie LOCKED nouă (§36.72 Sprint UI Integration Sequencing LOCKED V1) + 10 ALIGNMENT_QUESTIONS responses integrate (Q1+Q3 LOCK V1 + Q2 AMEND EXT-1 DOMS hide + Q4-Q7 cluster batches + Q8-Q10 hygiene). Decizii cumulative pre-launch V1 = **64** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59-60 + 4 cluster 10-batch §36.62 ADR LOCKS + §36.63 §BATCH_PROTOCOL codified + §36.71 cluster session-lock + §36.72 Sprint UI sequencing + §36.73 Q-Set resolution + §36.74 BATCH_PROTOCOL ext + §36.75 Daniel solo gate execution). Cluster 10-batch autonomous COMPLETE: 10 commits pushed origin/main (`d48ef0d` BATCH_01 ADR LOCKS + `d636895` BATCH_02 §BATCH_PROTOCOL VAULT_RULES + `70be861` BATCH_03 Golden Master 29 tests/59 snapshots + `fab67d7` BATCH_04 hygiene Q8/Q9 + `699679f` BATCH_05 EXERCISE_METADATA audit 26 exerciții + `775bf1b` BATCH_06 cross-refs 164 .md + `55e22c5` BATCH_07 coverage 60.33% lines + `e26fdb7` BATCH_08 dependencies 5 major + `0c64a0c` BATCH_09 build perf 4.026s/921KB/283KB gzipped + `995ca47` BATCH_10 final report). Tests delta: **1174 → 1203 PASS** (+29 Golden Master, 75 test files). 8/8 ADR drafts LOCKED V1 active (RIR_MATRIX + MODE_DETECTION_UI + BIAS_DETECTION_OBSERVABLE + OUTLIER_FILTER + CASCADE_DEFENSE + COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON cu EXT-1 + SMART_ROUTING_EQUIPMENT). 0 DRAFT pending. Coverage baseline locked (60.33%/78.38%/77.73%/60.33%) + Build perf baseline locked (~283 KB gzipped cold-start ~3.0s on 3G). 2 moderate vulns dev-only (esbuild + vite, NOT exploitable production). 5 major outdated post-Beta backlog (vite 5→8 + vitest 3→4 + jsdom 25→29). Sprint UI Integration sequencing LOCKED V1 §36.72: NU autonomous direct, requires Daniel solo gate (Firebase Auth + DB rules + GDPR tutorial + Avocat) → strategic chat NEW UX design (~1-2h) → CC Opus autonomous (~6-10h). Empirical learnings: factor 5-7x optimism Opus estimates pentru clusters bine-spec'd (cluster 10-batch ~70min vs 6-8h estimate), §BATCH_PROTOCOL pattern scalable la 10+ batches confirmat zero errors, read-only batches (Coverage + Dependencies + Build Perf) valid pattern hygiene clusters, auto-fixes safe la cross-refs cu audit trail Bugatti preserved. ZERO sesiuni chat strategic blocking pre-launch V1 — REMAINING doar Daniel solo gate + Sprint UI design chat strategic. Bandwidth Daniel acest chat ~45% remaining la handover-time, NU activ (autonomous CC run integrate post strategic discussion). Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial + 1 partial + 1 full) + **64 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests 1203 PASS + Coverage/Build baselines locked + **Sprint UI Sequencing LOCKED V1 + §36.73 Q-Set resolution + §36.74 BATCH_PROTOCOL ext + §36.75 Daniel solo gate Firebase live**.

**Sesiune 2026-05-02 evening late HANDOVER INGEST FIREBASE DONE + Sprint UI gate CLEAR** (handover status snapshot post Firebase Daniel solo gate technical 100% complete + Daniel manual cleanup `users/daniel` legacy executat post sandbox blocked CC Opus batch). **Pure status ingest — ZERO decizii noi LOCKED.** Cumulative count rămâne **64** (post §36.73 + §36.74 + §36.75 deja integrate prior single batch CC Opus commits `92b9338` + `7f5d9fb` + `5564b9a`). 15 Q-uri ALIGNMENT_QUESTIONS status update: **7 RESOLVED** (Q1+Q3 deja LOCK V1 cluster batches, Q9+Q10 N/A post Firebase live, Q11 opțiunea C, Q14 DEFER, Q15 REJECTED) + **8 ACTIVE** pentru strategic chat NEW Sprint UI (Q2 split chat 1/2/3, Q4 DOMS wording final ADR_PAIN EXT-1, Q5 Founding cap counter visibility A/B/C, Q6 3 Card buttons grouping A/B/C, Q7 Goal Shift card position A/B/C, Q8 Telegram CTA placement A/B/C + Q12 estimate calibration A/B/C + Q13 Daniel-time CONFIRMED empirical opțiunea C ~30-45 min real). Q13 calibration empirical: Daniel solo Firebase ~30-45 min real (NU ~2-4h estimate inițial §36.72 + §36.65 — opțiunea C Q13 confirmed). Empirical factor 5-7x optimism CONFIRMED 3x (Sprint 4.x ~70min/6-8h + Cluster 10-batch ~70min/6-8h + Single batch §36.73-75 ~10min/30-45min). 5 carry-overs HONEST flagged: UI Integration ~6-10h scope strategic chat NEW + Cascade↔Composite wiring + Manual exercise metadata audit ~2-3h post-Beta (2 FLAG items §36.66) + Golden Master tests ~1h post-Sprint UI + Atomic counter Firebase transaction real wiring (batch-able cu Q5 Founding cap counter). Sprint UI plan: ~5-7 batches expected (BATCH_UI_01 3 Card buttons + BATCH_UI_02 Goal Shift + BATCH_UI_03 Founding cap + BATCH_UI_04 Telegram CTA + BATCH_UI_05 PROMPT_VALIDATION + 1-2 potential Suflet Andura wiring + integration tests) per §36.74 default batches rule. Sandbox CC Opus limitation noted: outbound HTTP DELETE blocked → pentru Firebase REST cleanup viitor, Daniel solo via Console = primary path (NU CC Opus). Bandwidth Daniel acest chat: NU activ (autonomous CC + Daniel solo manual cleanup discrete). 1203/1203 unchanged (vault docs + manual Firebase Console only). Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial + 1 RESOLVED §34.2 published live + 1 full) + **64 decizii LOCKED cumulative (unchanged)** + Beta-launch ASAP strategy + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR_MULTI_TENANT_AUTH Faza 1 Batch B confirmed live + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests 1203 PASS + Coverage/Build baselines locked + Sprint UI Sequencing LOCKED V1 + Daniel solo gate technical 100% COMPLETE + Sprint UI gate CLEAR pentru strategic chat NEW UX design. Next: Priority 1 strategic chat NEW Sprint UI design (~1-2h, 6 topice UX + Q12/Q13 calibration 1-line) → Priority 2 Claude generează N CC prompt artefacte distincte per §36.74 default batches → Priority 3 Daniel drag toate la inbox + comandă unică CC Opus → Priority 4 CC Opus autonomous Sprint UI execution (~6-10h estimate, ~1-2h actual factor 5-7x) → 1 raport LATEST.md final centralizat → smoke tests prod gates B/C/D → Beta cohorts 3-tier 50 users invitation §36.47 + §36.53 Telegram → Beta sept-dec 2026 → audit legal €300-500 dec 2026 → Soft Launch 1 ianuarie 2027 🚀. Marketing Channel Mix Decision = milestone V1.1 explicit ~Februarie 2027 per §36.60.** Next: Priority 1 Daniel solo (~2-4h) Firebase Auth + DB rules + GDPR tutorial + Avocat → Priority 2 next strategic chat NEW (~1-2h) Sprint UI design UX discussions Daniel CEO + prompt CC Opus generation → Priority 3 CC Opus autonomous (~6-10h) Sprint UI execution → smoke tests prod gates B/C/D → Beta cohorts 3-tier 50 users invitation §36.47 + §36.53 Telegram → Beta sept-dec 2026 → Soft Launch 1 ian 2027 🚀. Marketing Channel Mix Decision = milestone V1.1 explicit ~Februarie 2027 per §36.60.**

**Sesiune 2026-05-03 SPRINT UI 6 UX DECIZII LOCKED + CLUSTER ABORTED + REBRAND PRIORITY 1** (chat strategic NEW Sprint UI design 2026-05-03 + 7-batch cluster aborted pre-flight CC Opus + handover post-saturation ~20% bandwidth fresh). 6 decizii UX LOCKED V1 noi (§36.76: Q4 DOMS expand A inline NU persist + Q5 Founding cap C HIDDEN total UI + Q6 3 Card buttons B split 2+1 Equipment+Body + Q7 Goal Shift C Settings only + Q8 Telegram CTA B revizuit Onboarding 1× + Settings + Q-PROMPT Profile Validation C card persistent Dashboard) + 1 lessons learned anti-recurrence rule LOCKED (§36.77: Sprint UI cluster aborted pre-flight CC Opus + slip log Claude chat strategic React/JSX assumption peste vanilla JS ADR 005). Decizii cumulative pre-launch V1 = **70** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59-60 + 4 cluster 10-batch §36.62 ADR LOCKS + §36.63 §BATCH_PROTOCOL codified + §36.71 cluster session-lock + §36.72 Sprint UI sequencing + §36.73 Q-Set resolution + §36.74 BATCH_PROTOCOL ext + §36.75 Daniel solo gate execution + **§36.76 Sprint UI 6 UX LOCKED V1**). Sprint UI cluster STATUS: 🛑 ABORTED pre-flight BATCH_UI_01 — 7 prompts assume React/JSX framework, project actual = vanilla JS per ADR 005, incompatibility BLOCKING. CC Opus action: STOP cluster, raport STOP detailed (`📤_outbox/_archive/2026-05/BATCH_UI_01_REPORT.md`), 0 commits fabricat, 0 JSX dead code, 7 prompts STILL în `📥_inbox/` pentru re-spec Path A vanilla JS. Bugatti paradigm validated empirical (fail-fast strict pre-flight = corect, 0 debt tehnic introdus). REBRAND PRIORITY 1 ABSOLUT: §30 LOCKED 2026-05-01 RESUBMIT încă neexecutat — Daniel a redenumit Project Claude = "Andura" cross-platform brand consolidation, sweep `salafull` → `andura` (vault docs + cod + package.json + README + GitHub repo + Pages URL + email signature deja LOCKED §29.6) PENDING ÎNCĂ. Daniel decizie acest chat: rebrand sweep PRIORITAR ÎNAINTE re-spec Sprint UI (refactor double risc crește exponențial post-Sprint UI implementation). Custom domain `andura.app` decision pre-sweep (€10-15/an) sau folosim DOAR GitHub Pages URL `andura/` post-rename. Anti-recurrence rule §36.77 LOCKED: ÎNAINTE primul artefact tehnic care referă cod/path/framework în chat strategic, OBLIGATORIU `project_knowledge_search` pentru ADR de framework + pattern existent component vecin; dacă vault NU are spec clar: cere Daniel mostră fișier existent să copiezi pattern; NICIODATĂ "industry default React/Vue/X assumption" — vault SSOT primary, NU bias training. Bandwidth chat ~20% remaining la handover-time, fresh anti-saturation triggered preventiv. 1203/1203 unchanged (vault docs only acest ingest, ZERO source code touched). Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial + 1 RESOLVED + 1 full) + **70 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR_MULTI_TENANT_AUTH Faza 1 Batch B confirmed live + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests 1203 PASS + Coverage/Build baselines locked + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + **Sprint UI 6 UX LOCKED V1 §36.76 + Sprint UI cluster ABORTED pre-flight + Slip Log §36.77 anti-recurrence + Rebrand Priority 1 ABSOLUT**. Next: Priority 1 ABSOLUT Rebrand sweep §30 SalaFull → Andura ~5h CC Opus dedicat (vault docs + cod + package.json + repo rename GitHub) → Priority 2 Re-spec 7 BATCH_UI_NN vanilla JS pattern matching `safetyBanner.js` factory function strategic chat NEW (~30-45 min) + cluster execution autonomous CC Opus (~2-3h actual factor 5-7x) → Priority 3 Smoke tests prod gates B/C/D → Beta cohorts 3-tier 50 users invitation §36.47 + §36.53 Telegram → Beta sept-dec 2026 → audit legal €300-500 dec 2026 → Soft Launch 1 ianuarie 2027 🚀. Marketing Channel Mix Decision = milestone V1.1 explicit ~Februarie 2027 per §36.60.**

**Sesiune 2026-05-03 NIGHT REBRAND DEPLOY LIVE + HOTFIX + SMOKE PROD BUG 2 AUTH FLOW NOT WIRED** (sesiune ~5h Daniel-time real — milestone-uri majore deploy `andura.app` LIVE + 2 buguri raportate end-of-session). 2 decizii LOCKED V1 noi (§36.78 Rebrand Sweep Phase 1-4 Complete autonomous CC Opus ~25-30 min real factor 7-9x optimism CONFIRMED 5x consecutive + §36.79 Custom Domain Base Path Hotfix vite/sw/manifest/main/html/playwright + CACHE_VERSION bump v1→v2 anti zombie cache, ~10 min real factor 2.5x hotfix scope-clean). 1 finding-section LOCKED §36.80 (DNS Activation andura.app LIVE + Smoke Prod 2 buguri: BUG 1 SW zombie cache 404 SELF-HEALING CLOSED + BUG 2 Firebase 401 auth flow NOT WIRED REAL BUG → NEXT CHAT PRIORITY 1 ABSOLUT). Decizii cumulative pre-launch V1 = **72** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59-60 + 4 cluster 10-batch §36.62 ADR LOCKS + §36.63 §BATCH_PROTOCOL codified + §36.71 cluster session-lock + §36.72 Sprint UI sequencing + §36.73 Q-Set resolution + §36.74 BATCH_PROTOCOL ext + §36.75 Daniel solo gate execution + §36.76 Sprint UI 6 UX LOCKED V1 + §36.77 Slip Log anti-recurrence + **§36.78 Rebrand Sweep Phase 1-4 + §36.79 Custom Domain Base Path Hotfix** + §36.80 finding-only count unchanged). Memory updates Claude 2 reguli noi LOCKED 2026-05-03 evening (mem #22 alignment questions strict CC din vault SSOT NU Claude chat handover + mem #23 pre-flight grep ABSOLUT ÎNAINTE primul artefact tehnic anti-halucinație React/JSX 2026-05-03 slip; codificate VAULT_RULES §HANDOVER_PROTOCOL step 9 + PROMPT_CC_HYGIENE §9). Domain `andura.app` cumpărat Namecheap order #201394291 ($13.18 = €13.18 actual achitat vs estimate §31 €10-15, auto-renew ON, Domain Privacy free, NO PremiumDNS, NO Stellar Hosting). DNS Namecheap config + GitHub repo rename salafull→andura + Pages activation cu Enforce HTTPS ON + Site LIVE `https://andura.app/` ✅. SW activ post hotfix `andura-v2`. Firebase RTDB `fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app` (UID Daniel `2GsDvxqXc4bvQGSm8B1Zft5S05i2` provisioned manual §36.75) + DB Rules per-UID strict published §36.75 + Firebase Auth Magic Link + Google OAuth enabled console proiect "Andura". BUG 2 root cause: `src/firebase.js LEGACY_USER_PATH = 'users/daniel'` fallback când `getAuthState() = null` → DB rules per-UID strict §36.75 BLOCHEAZĂ `users/daniel` literal (no auth.uid match) → 401 toate operațiile cycle (get → clearFirebaseKeys DELETE → set PUT). Implication critic: ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 Faza 2 (banner UX "Salvează contul" + index.html route hookup `/auth-callback`) NOT landed, doar Faza 1 Batch B (`src/auth.js` REST helpers + `src/pages/auth.js` UI bare-DOM Magic Link) cod landed dar NOT wired în app shell main. User deschide `andura.app/` → vede dashboard direct (NU forced auth screen) → Firebase calls fail 401. Decision LOCKED: Beta-launch pre-condiție = auth flow integrat complet. Empirical calibration nuanță: factor 7-9x = clusters mari noi (Phase 1-4 sweep), factor 2-3x = hotfix-uri scope-clean (custom domain hotfix). 1203 → 1203 PASS unchanged (vault docs + cod refactor only, ZERO test changes). Build 4.715s → 3.24s (warmer cache). 28 historical refs preserved corect (audit trail Bugatti — DB_NAME_PREFIX salafull IndexedDB user data continuity, rename = local data wipe risc pre-Beta + 28 historical session-log entries). Bandwidth Daniel ~15-20% remaining triggered handover preventiv anti-halucinație. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial + 1 RESOLVED + 1 full) + **72 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR_MULTI_TENANT_AUTH Faza 1 Batch B code landed (NU wired = BUG 2 cause) + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests 1203 PASS + Coverage/Build baselines locked + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 anti-recurrence + **Andura V1 prod LIVE `andura.app` ✅ + §36.78 Rebrand Sweep Phase 1-4 + §36.79 Custom Domain Base Path Hotfix + §36.80 BUG 2 Firebase Auth Flow Not Wired NEXT CHAT PRIORITY 1 ABSOLUT**. Daniel manual items pending (LOW priority): local folder rename `C:\Users\Daniel\Documents\salafull` → `andura` optional + email signature `[Andura V1 Feedback]` apply Outlook/Gmail + `users/daniel` legacy delete from Firebase RTDB Console post auth flow live + verify migration `users/{uid}` complete. Next: **Priority 1 ABSOLUT Auth flow integration `andura.app` production** — strategic chat NEW design (~1-2h Daniel-time, scope: auth-first vs auth-banner-soft vs auth-modal pattern, route auth-callback wire decision, migration path local IndexedDB → post-auth Firebase users/{uid}, wording RO Magic Link primary + Google OAuth secondary, error states UX) + prompt CC Opus dedicat (~30-45 min autonomous factor 7-9x: wire `/auth-callback` route + `createAuthScreen` integration main shell + `LEGACY_USER_PATH` fallback strategy update block-render-until-auth NU fallback users/daniel + Tests Playwright e2e Magic Link + Google OAuth mock + smoke prod verification user nou vede auth screen NU dashboard direct) → Priority 2 (post auth flow live) Re-spec 7 BATCH_UI_NN vanilla JS pattern matching `safetyBanner.js` factory function `(opts) → { element, dispose }` Path A per §36.77 anti-recurrence rule strategic chat NEW ~30-45 min + cluster execution autonomous CC Opus ~2-3h actual factor 5-7x → Priority 3-N Smoke tests prod gates B/C/D pe `andura.app` post Sprint UI live + Beta cohorts 3-tier 50 users invitation §36.47 + §36.53 Telegram + Beta sept-dec 2026 + audit legal €300-500 dec 2026 + Soft Launch 1 ianuarie 2027 🚀. Marketing Channel Mix Decision = milestone V1.1 explicit ~Februarie 2027 per §36.60.**

**Sesiune 2026-05-03 NIGHT LATE PREBETA SCOPE EXPANSION + COACH INTELLIGENCE ROADMAP** (chat strategic ~2h Daniel-time real post deploy LIVE `andura.app` + alignment 13/13 PASS pe §36.78+§36.79+§36.80; pivot original Auth Flow Priority 1 → coach intelligence cluster + meta-rule prebeta scope). 7 decizii LOCKED V1 noi (§36.81 Coach Intelligence Cluster cu 4 sub: §36.81.1 Catalog Ceiling Soft Cap 3-4 variante + PR justification a 5-a / §36.81.2 Substitutions Hierarchy Algorithmic ordering primary_muscle→movement_pattern→force_curve_profile→equipment_class, ponderi 40/30/20/10 RESPINSE V1 / §36.81.3 Mid-Set Switch Fallback Hybrid Rule SIMILARITY_RATIO + UI Bridge sugestie+edit / §36.81.4 Abandonment Engine + §36.30 Override rest_timer based 10min idle + 4h auto-close + drop midnight rule, abandoned = gap neutru NU resetează streak counter; §36.82 Pre-Session Energy Signal Cluster cu 3 sub: §36.82.1 Pre-Session Energy Input 🟢🟡🔴 dashboard greeting card 1-tap / §36.82.2 Silent Adaptive Adjustment 🔴 = §36.16 RIR Matrix reps/intensity ZERO mesaj paternalist / §36.82.3 Deload Suggestion Trigger 3× consecutive 🔴 → optional NU auto-trigger, wording placeholder Phase B pending) + 1 META-RULE LOCKED V1 (§36.83 Prebeta Scope Expansion: toate deciziile SUFLET ANDURA / coach intelligence / UX core / engine adaptation = MANDATORY prebeta non-negotiable, default prebeta dacă atinge core, timing/realism = treaba Claude+Daniel+CC NU rationale respingere scope, NU "ar dura X luni" push-back). 1 backlog catalog (§36.84 Jeff Nippard Gaps Backlog 7 total: #1 Wiring weakness→session builder DISCUTAT START + #2 Plateau breaker auto NEDISCUTAT + #3 Recovery/readiness GAP ÎNCHIS via §36.82 + #4 Periodizare conștientă NEDISCUTAT + #5 Form/video DROP definitiv + #6 Cross-exercițiu reasoning NEDISCUTAT + #7 Comunicare contextuală GAP ÎNCHIS via §36.82+statistici sesiune). 1 propunere PENDING (§36.85 Injury Body Region Map Opțiune A propusă ~1-2 săpt extension §36.38 Pain Button + §36.36 schema, AȘTEAPTĂ Daniel decision next chat A vs drop). Renumbering vault hygiene applied: handover input chat strategic a folosit §36.55.1-4 + §36.56.1-3 + §36.57 (collision cu §36.55 GDPR Phone Privacy + §36.56 ADR Review + §36.57 Phase B Wording 51 Strings deja existente) → re-numerotat cronologic post §36.80 ca §36.81-§36.85 fără pierdere intent (cluster organization preserved). Decizii cumulative pre-launch V1 = **79** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59-60 + 4 cluster 10-batch §36.62 + §36.63 §BATCH_PROTOCOL + §36.71 + §36.72 + §36.73 + §36.74 + §36.75 + §36.76 + §36.77 + §36.78 + §36.79 + §36.80 finding-only + **§36.81.1 + §36.81.2 + §36.81.3 + §36.81.4 + §36.82.1 + §36.82.2 + §36.82.3 = 7 features locked**) + §36.83 META-RULE +0 + §36.84 backlog +0 + §36.85 pending +0 = 72 → **79** (+7). Memory rule NEW Claude #24 LOCKED 2026-05-03 night late: §36.83 Prebeta Scope Rule — TOATE deciziile SUFLET ANDURA / coach intelligence / UX core / engine adaptation = MANDATORY prebeta. Non-negotiable. Default prebeta dacă atinge core. Timing/realism = treaba Claude+Daniel+CC să prioritizăm execution, NU rationale respingere scope. NU mai sări la "ar dura X luni" ca push-back. Pre-flight validations chat: §36.81.3 Mid-Set Switch validat `src/engine/exerciseMapping.js` SIMILARITY_RATIO + getSimilarityMultiplier existent (NU inventezi feature, extinzi infrastructure) + §36.81.4 Abandonment validat §36.26+§36.30 outlier streak + §36.34 Profile Reset PRESERVE + §36.35 Goal Shift RESET 0 + ADR 012 inactivity decay separate concern + §36.85 Injury Body Region Map validat §36.36 schema muscle_target_primary + secondary deja existente (zero refactor). Auth flow integration design = AMÂNAT acest chat pentru chat strategic NEW separat (Priority 1 ABSOLUT §36.80 preserved post acest handover ingest, dar pivot real chat curent continuă coach intelligence). 1203/1203 PASS unchanged (vault docs only acest ingest, ZERO source code touched). Bandwidth Daniel ~22% remaining triggered handover preventiv anti-saturation per memory rule #15. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial + 1 RESOLVED + 1 full) + **79 decizii LOCKED cumulative** + Beta-launch ASAP strategy (timing flexible per §36.83) + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR_MULTI_TENANT_AUTH Faza 1 Batch B code landed (NU wired = BUG 2 cause, blocking Beta) + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests 1203 PASS + Coverage/Build baselines locked + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 anti-recurrence + Andura V1 prod LIVE `andura.app` ✅ + §36.78 Rebrand Sweep + §36.79 Custom Domain Hotfix + §36.80 BUG 2 Firebase Auth Flow NEXT CHAT PRIORITY 1 ABSOLUT (preserved) + **§36.81 Coach Intelligence Cluster + §36.82 Pre-Session Energy Signal Cluster + §36.83 META-RULE Prebeta Scope + §36.84 Jeff Nippard Gaps Backlog + §36.85 Injury Body Region Map PENDING + Memory #24 LOCKED**. Next: **Priority 1 ABSOLUT chat strategic NEW dedicat Auth Flow Integration** (§36.80 preserved, blocking Beta) — design ~1-2h Daniel-time + prompt CC Opus dedicat ~30-45min autonomous factor 7-9x → **Priority 2 chat strategic continuare coach intelligence roadmap** (post acest handover ingest, scope: Jeff Nippard gap #1 wiring weaknessDetector.js→sessionBuilder.js proactive accessory + Injury Body Region Map §36.85 decizie A vs drop + dacă bandwidth gap #2 plateau breaker + #4 periodizare + #6 cross-exercițiu) → **Priority 3 (post auth flow live)** Re-spec 7 BATCH_UI_NN vanilla JS Path A per §36.77 anti-recurrence + cluster execution autonomous CC Opus → Priority 4-N Smoke tests prod gates B/C/D + Beta cohorts 3-tier 50 users §36.47 + §36.53 Telegram + Beta sept-dec 2026 + audit legal €300-500 dec 2026 + Soft Launch 1 ianuarie 2027 🚀 (target aspirațional flexibil per §36.83). Marketing Channel Mix Decision = milestone V1.1 explicit ~Februarie 2027 per §36.60.**

**Sesiune 2026-05-03 AUDIT TOTAL CONSOLIDAT + ADR 023 LLM INTENT INTERPRETATION LOCKED V1 PARTIAL** (chat strategic post audit consolidat 9 passes ~63 raw findings + Faza 1 verification cap-coadă + Faza 2 ideation ~50 idei NEW + addendum reconsiderări — synthesis cumulativ în 4 fișiere total, dar 1 missing). 6 decizii LOCKED V1 noi (§36.86 ADR 023 LLM Intent Interpretation & Fallback Architecture provider chain Groq llama-3-8b-it primary → Gemini 1.5 Flash fallback → Local Regex last resort + scope strict 2 trigger points Pain text §36.38 + Equipment text §36.81.2 + Bugatti sandbox temperature 0.0 + Structured Outputs JSON + Regex Fallback + sanitizer client-side PII whitelist exercise names + termeni fitness RO + async non-blocking + cache IndexedDB ~55-60% hit rate + cost cap €10/lună hard + CDL `llm_metadata` extension + Gigel test PASS Maria/Gigica ZERO text input + Marius optional "Altceva" — **⚠️ partial spec ingest, full sub-sections A-M PENDING addendum source upload**; §36.87 Cognitive Q4 §AMENDMENT 2026-05-03 DELOCK condiționat ZERO LLM runtime → permis exclusiv 2 trigger points ADR 023 scope strict; §36.88 Bus factor 1 = ACCEPTABLE TRADE-OFF pre-revenue LOCKED + SLA disclosure ToS; §36.89 Calibration target pre-Beta 85-90% NU 95% + plan A+B+E Synthetic Demographic Prior + Observation mode 2 săpt Beta + Expert validator coach €500-1000 + 95% post-launch luna 3-6 obligatoriu; §36.90 TIME-1 Bayesian convergence reclassification MEDIUM acceptable cu DEMO-1 verify done; §36.91 T2 The Filter RESOLVED via ADR 023 originally HIGH acceptable trade-off → CLOSED). 1 META operation (§36.92 Audit consolidat reclasificare 4 buckets findings: REZOLVABIL pre-Beta ~16 + Post-launch V1.1 ~10 + Acceptabil trade-off permanent ~5 + Reconsiderate ~6 = ~40 actionable post-deduplication NU 53 verification NU 63 raw + 4 CRITICAL pre-Beta blockers B4 + B2 + B3 + N1+N5-NEW + 12 HIGH cleanup batch + Top 6 ideation integrate pre-Beta IMP-1 + IMP-3 + NEW-IDEATION-1 + FM-2 + FM-8 + IMP-4 + 6 D1-D6 decision points pending Daniel + 6 D-DONE 1-6 LOCKED acest addendum). **⚠️ P1 BLOCKER:** sursa addendum `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` (referenced ca sursă spec ADR 023 §2 sub-secțiuni A-M complete) **NU în inbox acest ingest** — partial ingest procedat per memory rule SUFLET ANDURA precedent (2026-05-02): fabricare conținut INTERZISĂ per zero-info-loss principle. ADR 023 status LOCKED V1 — partial spec; full sub-sections A-M PENDING upload addendum source viitor. Flag documentat în `DIFF_FLAGS.md` (newly created) + `05-findings-tracker/FINDINGS_MASTER.md` audit consolidat appended section. ADR file stub creat `03-decisions/023-llm-intent-interpretation.md` cu summary verifiable din HANDOVER §0 + §7 + AUDIT_VERIFICATION §11 + AUDIT_IDEATION §7. Decizii cumulative pre-launch V1 = **85** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59-60 + 4 cluster 10-batch §36.62 + §36.63 §BATCH_PROTOCOL + §36.71 + §36.72 + §36.73 + §36.74 + §36.75 + §36.76 + §36.77 + §36.78 + §36.79 + §36.80 finding-only + 7 features §36.81+§36.82 cluster + §36.83 META-RULE +0 + §36.84 backlog +0 + §36.85 pending +0 + **§36.86 ADR 023 LLM Intent + §36.87 Cognitive Q4 DELOCK + §36.88 Bus factor TRADE-OFF + §36.89 Calibration 85-90% + §36.90 TIME-1 MEDIUM + §36.91 T2 RESOLVED = 6 LOCKED V1 noi**) + §36.92 META reclasificare 4 buckets +0 = 79 → **85** (+6). Real findings count post-deduplication + reclassification: ~40 actionable (audit acuratețe 7.5/10 per Faza 1 verdict). Effort estimate cumulativ pre-Beta (post-addendum): ~30-45h Opus realist + ~12-18h Daniel chat strategic + €500-1000 expert validator one-time + 4-6 săpt calendaristic factor sustainability Daniel solo. Decision points D1-D6 pending Daniel chat strategic NEW (T1 A/C save week silent + §36.86b DELOCK Mechanism META-RULE + Cloud Functions Blaze decizie + Goal Taxonomy hybrid recommend C + Sprint Vault Hygiene Q2 2026 + ADR 023 cost monitoring backend). **ZERO cod până nu e tot solved** — sequencing strict per HANDOVER §10 (decision points D1-D6 chat strategic → ADR amendments + spec consolidations vault docs only → pre-Beta blockers CC Opus autonomous batches → HIGH cleanup batch → top 6 ideation integrate → Auth Flow §36.80 separately sequenced → Smoke tests prod gates B/C/D → Beta cohort recruitment §36.47 + §36.53 Telegram). Auth Flow §36.80 = Priority 1 ABSOLUT preserved separat de blockers list (per HANDOVER §1 footnote). 1203/1203 PASS unchanged (vault docs + ADR file + findings tracker + DIFF_FLAGS only acest ingest, ZERO source code touched). Bandwidth Daniel: NU activ (audit synthesis post chat strategic). Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 4 CRITICAL pre-Beta blockers (NU 5 — T1 demoted, B1 demoted) + 12 HIGH cleanup + Top 6 ideation integrate pre-Beta + **85 decizii LOCKED cumulative** + Beta-launch ASAP strategy (timing flexible per §36.83) + Suflet Andura translation map + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + **ADR 023 LOCKED V1 partial spec + ⚠️ PENDING addendum upload** + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests 1203 PASS + Coverage/Build baselines locked + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 anti-recurrence + Andura V1 prod LIVE `andura.app` ✅ + §36.78 Rebrand Sweep + §36.79 Custom Domain Hotfix + §36.80 BUG 2 Firebase Auth Flow Priority 1 ABSOLUT preserved + §36.81 Coach Intelligence Cluster + §36.82 Pre-Session Energy Signal Cluster + §36.83 META-RULE Prebeta Scope + §36.84 Jeff Nippard Backlog + §36.85 Body Region Map PENDING + Memory #24 LOCKED + **§36.86 ADR 023 + §36.87 Cognitive Q4 DELOCK + §36.88 Bus factor TRADE-OFF + §36.89 Calibration 85-90% + §36.90 TIME-1 MEDIUM + §36.91 T2 RESOLVED + §36.92 Audit reclasificare 4 buckets + DIFF_FLAGS P1 BLOCKER addendum source pending**. Next: **Priority 0 Daniel — upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` la inbox** pentru ADR 023 full sub-sections A-M ingest (current stub partial). **Priority 1 chat strategic NEW dedicat decision points D1-D6** (~5-7h Daniel chat strategic) — rezolvare T1 A/C + DELOCK Mechanism META-RULE + Cloud Functions Blaze decision + Goal Taxonomy hybrid C + Sprint Vault Hygiene Q2 2026 + ADR 023 cost monitoring infrastructure. **Priority 2 ABSOLUT chat strategic NEW Auth Flow Integration** (§36.80 preserved blocking Beta) — design ~1-2h Daniel-time + prompt CC Opus dedicat ~30-45min autonomous. **Priority 3 ADR amendments + spec consolidations** (vault docs only — TRIPLE-1+QUADRUPLE-1 Onboarding SSOT + R1-NEW Reconciliation §36.86b + ORPHAN-1 ADR 022 split). **Priority 4 Pre-Beta blockers CC Opus autonomous batches** per §BATCH_PROTOCOL §36.74 (B2 + B3 + B4 + N1 + ADR 023 implementation). **Priority 5 HIGH cleanup batch** + **Priority 6 Top 6 ideation integrate** + **Priority 7-N** Smoke tests + Beta cohort recruitment + audit legal + Soft Launch 1 ianuarie 2027 🚀 (target aspirațional flexibil per §36.83). Marketing Channel Mix Decision = milestone V1.1 ~Februarie 2027 per §36.60.**

**Sesiune 2026-05-03 VAULT HYGIENE SPRINT FAZA 1 + DECIZII STRATEGICE POST-AUDIT** (chat strategic post audit total consolidat 12/12 PASS alignment + Faza 1 audit structural CC Opus complete + Daniel revelație core principle "Andura gândește pentru user" + Co-CTO 100% delegation pe Faza 2 validare). 2 decizii LOCKED V1 noi count cumulative (§36.93 D3 LOCKED B Spark retain Cloud Functions Blaze RESPINS rationale calcul real 50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier 14400/zi limit bootstrap-aware Bugatti scale când e problemă reală NU ipotetică + reconsider triggers revenue/Groq deprecation/demand spike >5% + D6 frontend-only soft cap depinde D3=B + Q11 violation accept pre-Beta + NEW-IDEATION-5 backend cost monitoring DEFERRED post-revenue; §36.94 ADR 025 candidate "Andura Gândește pentru User" / Graceful Degradation Universal articulare retroactivă principiu fondator implicit aplicabilitate ALL features V1+V1.5+V2+ permanent + mecanism graceful degradation mandatory + skippable everything + engine-pre-fills-default + user-override-optional + filtru pre-feature LOCK "dacă user ignoră feature app-ul tot funcționează rezonabil" DA→eligible NU→REJECTED + cross-ref retroactiv B4 RPE skip + B2 T&B skip + ADR 023 Pain/Equipment skip + T0 Onboarding skip + T1+ Profile Typing skip) + 4 META operations (§36.95 ADR Numbering Additive LOCKED ZERO renumber existing + ADR 022 ORPHAN-1 split fizic per audit recomandare G → 022 Bayesian Nutrition + 024 Goal-Driven Templates + 025 Andura Gândește PENDING file creation Faza 3 + ADR 023 LLM Intent existent NU renumber additive curat zero collision; §36.96 Vault Hygiene Sprint = Priority 0 promote înaintea pre-Beta blockers + Auth Flow §36.80 + 8 recomandări APROBATE Co-CTO 100% delegation per Daniel directive "decide tu, e pentru tine" — A HANDOVER split Option C + B Onboarding SSOT V1 hybrid C + C INDEX_MASTER refresh + D archive preserve + E folder zero change + F orphans cleanup 22 wikilinks + G ADR 022/024/025 stubs + H DECISION_LOG UTF-8 fix; §36.97 Faza 4 VAULT_HYGIENE_PASS = LOCK rule codification PENDING Faza 3-4 — STEP 10-15 mandatory post-ingest auto-execute ~10-15min CC per ingest + VAULT_RULES.md §VAULT_HYGIENE_PASS NEW + PROMPT_CC_INGEST_HANDOVER.md update; §36.98 System Prompt Claude Chat Andura LOCKED V1 generat artefact pentru chat NEW context state snapshot 87 LOCKED V1). **Status faze Vault Hygiene Sprint:** Faza 1 ✅ COMPLETE (commit a5b1542 — 110_VAULT_AUDIT_INVENTORY.md ~600 LOC §1-§9 + LATEST.md raport) + Faza 2 ✅ COMPLETE (Co-CTO delegated 100% per Daniel directive, 8 recomandări APROBATE) + Faza 3 ⏳ PENDING chat NEW (~2-3h CC autonomous Opus factor 7-9x realist) + Faza 4 ⏳ PENDING chat NEW (~30min CC LOCK rule codification). **DIFF_FLAGS update:** P1-FLAG-1 ADDENDUM source upload status updated (Faza 3 va integra direct sub-secțiuni A-M ADR 023 din addendum context window NU file upload separate); P2-FLAG-1 D3 RESOLVED B + D2 ACCEPT propunere wording verbatim Co-CTO aliniat T3 + D4 LOCKED hybrid C deja per §36.92 + D5 SUPERSEDED Vault Hygiene Sprint = Priority 0 acum NU Q2 2026 + D6 frontend-only soft cap depends D3=B; D1 only remaining strategic (Save the week silent A/C). Decizii cumulative pre-launch V1 = **87** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 §36.59-60 + 4 cluster 10-batch + §36.63 + §36.71-§36.77 + §36.78-§36.79 + §36.80 finding-only + 7 features §36.81+§36.82 + §36.83 META +0 + §36.84 backlog +0 + §36.85 pending +0 + 6 §36.86-§36.91 audit total + §36.92 META +0 + **§36.93 D3 LOCKED B + §36.94 ADR 025 candidate = 2 LOCKED V1 noi**) + §36.95 META Numbering Additive +0 + §36.96 Vault Hygiene Sprint Priority 0 +0 + §36.97 META rule LOCK PENDING +0 + §36.98 System Prompt artefact +0 = 85 → **87** (+2). 1203/1203 PASS unchanged (vault docs + ADR 023 §AMENDMENT D3=B + DIFF_FLAGS update only acest ingest, ZERO source code touched). Bandwidth Daniel chat strategic ~18% remaining triggered handover preventiv anti-saturation per memory rule #15. Status V1: 8/8 templates LOCKED + F-NEW + MMI + Storage Full UX + 4 CRITICAL pre-Beta blockers + 12 HIGH cleanup + Top 6 ideation + **87 decizii LOCKED cumulative** + Beta-launch ASAP timing flexible §36.83 + Suflet Andura + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR 023 LOCKED V1 partial spec + ⚠️ PENDING addendum integration Faza 3 + Phase B 51 strings INTEGRATED + Cluster 10-batch tests 1203 PASS + Coverage/Build baselines + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 + Andura V1 prod LIVE `andura.app` ✅ + §36.78-§36.79 Rebrand+Hotfix + §36.80 BUG 2 Auth Flow Priority 1 ABSOLUT preserved + §36.81-§36.85 Coach/Energy/META/Backlog/Body Region + Memory #24 + §36.86-§36.91 audit total + §36.92 reclasificare 4 buckets + DIFF_FLAGS P1+P2 + **§36.93 D3=B Spark + §36.94 ADR 025 Andura Gândește candidate + §36.95 ADR Numbering Additive 022 Bayesian Nutrition + 024 Goal-Driven Templates + 025 Graceful Degradation + §36.96 Vault Hygiene Sprint Priority 0 + 8 recomandări APROBATE + §36.97 Faza 4 VAULT_HYGIENE_PASS LOCK PENDING + §36.98 System Prompt artefact**. Next: **Priority 0 ABSOLUT Faza 3 + Faza 4 Vault Hygiene Sprint execution** chat NEW dedicat — generate prompt CC Opus Faza 3 (~2-3h CC autonomous: 8 recomandări A-H execute mecanic) + prompt CC Opus Faza 4 (~30min CC: VAULT_RULES §VAULT_HYGIENE_PASS NEW + PROMPT_CC_INGEST_HANDOVER STEP 10-15 codification). **Priority 1 ABSOLUT Auth Flow Integration §36.80** post-Vault Hygiene clean (preserved blocking Beta — chat strategic ~1-2h Daniel + prompt CC Opus dedicat ~30-45min autonomous). **Priority 2 4 CRITICAL pre-Beta blockers** CC Opus autonomous batches per §BATCH_PROTOCOL §36.74 (B4 RPE Verbal + B2 T&B Faza 1+2 + B3 Founding Cap + N1+N5-NEW). **Priority 3 12 HIGH cleanup batch** + **Priority 4 Top 6 ideation integrate pre-Beta** + **Priority 5-N** Smoke tests + Beta cohort recruitment + audit legal + Soft Launch 1 ianuarie 2027 🚀 (target aspirațional flexibil per §36.83). Marketing Channel Mix Decision = milestone V1.1 ~Februarie 2027 per §36.60.**
---

## §36.99 ADR 026 candidate "Andura Offline Coaching Decision Tree Exhaustive" — PRE-BETA BLOCKER LOCKED V1

**Status:** Candidate LOCKED V1, ADR file creation `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` PENDING Faza 3 cleanup (post Vault Hygiene Sprint complete) sau chat strategic dedicat NEW post Vault Hygiene + Auth.

**Decision wording verbatim:**

> "Andura V1 Beta = offline pure coaching pe input structurat. Decision tree exhaustiv 1500-2000 ramuri pre-mapped de Claude (chat strategic) implementate de CC Opus în engine modules. Paritate target ~90-95% cu Claude pe input structurat tipic Maria/Gigica/Marius. ZERO LLM runtime pentru core coaching paths. ADR 023 LLM scope strict (Pain text + Equipment text) PRESERVED unchanged. Aplicabilitate: pre-Beta blocker per §36.57 Prebeta Scope Rule (coach intelligence core = mandatory prebeta non-negotiable)."

**Rationale:**

- **Suflet Andura aliniat:** SUFLET §1.1 ~75% replicabil V1 engine deterministic — F1 Triangulation + F2 Bias + F3+F4 Mode UI + F5 Push-back proporțional + F6 Adaptive output no inference = enumerable principles
- **Bugatti paradigm:** peak craft, ZERO compromise, refactor later NEVER happens
- **Cost zero scale:** 50 useri × 4 sesiuni × ZERO LLM call core = €0/lună core coaching (vs ADR 023 scope strict ~0.4% Groq free tier pentru Pain/Equipment text)
- **Determinism preserved:** Cognitive Q4 ZERO LLM runtime original intent honor pentru core engine paths
- **Knowledge breadth NU coaching live capability:** LLM-urile pierd pe persistent memory + latency + cost — gap arhitectural NEFIXAT de model upgrades. Knowledge breadth novel = content layer updatable, NU capability blocker (vezi §36.103)
- **Jeff demolish clear:** Andura full-built bate Jeff exhaustiv pe orice goal × experience × equipment (personalizare empirică + memory persistent + latency live + auto-detect bias/overtraining)

**Paritate target detail:**

| Input type | Paritate vs Claude | Note |
|------------|---------------------|------|
| Input pur structurat (vârstă/kg/BF%/PRs/equipment/schedule/history/recovery markers) | ~90-95% | Maria/Gigica/Marius tipic |
| Combinații rare multidimensionale (67 ani + post-COVID + ankle limitat + diabet) | ~60-70% | Edge cases Jeff oricum NU gestionează |
| Language ambiguous text input | ~40-60% | NU în scope offline — fallback ADR 023 LLM scope strict (Pain + Equipment text) |

**5-10% degradare grațioasă** pe combinații rare cu twist multidimensional unde Claude face inference probabilistic cross-domain. Decision tree degradează la "best fit branch" cu output decent dar sub-optimal vs Claude. **Acceptabil** pentru că restul 5-10% reprezintă scenarii pe care Jeff NU le gestionează deloc.

**Aliniat ADR 023 (NU contradicție):**

- ADR 023 LLM intent acoperă **interpretation language ambiguous** (Pain text + Equipment text)
- ADR 026 offline tree acoperă **reasoning structurat coaching** (volume, intensity, periodization, deload, substitution, nutrition)
- Hybrid clean: input STRUCTURAT (forms, buttons, sliders) → decision tree offline + input AMBIGUOUS (free-text Pain/Equipment) → LLM intent classification scope strict + coaching reasoning = offline pure deterministic

**Cross-refs:** [[03-decisions/023-llm-intent-interpretation|ADR 023]] preserved + [[03-decisions/018-engine-extensibility-architecture|ADR 018]] Dimension Registry foundation + [[01-vision/SUFLET_ANDURA|SUFLET ANDURA]] §1.1 ~75% replicabil V1 + Cognitive Q4 ZERO LLM runtime original intent honored core paths + §36.57 Prebeta Scope Rule mandatory + §36.94 ADR 025 candidate "Andura Gândește pentru User" graceful degradation aliniat (engine pre-fills default).

---

## §36.100 7 Engines Prescriptive NEW LOCKED V1 — Roadmap Pre-Beta

**Decision:** 7 engines prescriptive NEW adăugate la 14 reactive engines existing = **21 engines total coverage exhaustivă** pentru "bate Jeff offline pe input structurat". CC time = irrelevant per Daniel directive. Cu ADR 018 Dimension Registry foundation ready, adăugarea = plug-in curat zero refactor existing 14.

**Status:** LOCKED V1 roadmap, file creation per engine + spec generation = chat strategic dedicat NEW post Vault Hygiene + Auth.

### 7 Engines NEW (priority order pending Daniel decision chat NEW):

| # | Engine | Scope | Cross-ref ADR |
|---|--------|-------|---------------|
| 1 | **Periodization Engine** | Block / undulating / linear selection per goal × experience × frequency × age | NEW ADR pending |
| 2 | **Goal Adaptation Engine** | Cut / bulk / maintenance / recomp differential logic (volume / intensity / recovery / kcal) | [[03-decisions/024-goal-driven-program-templates\|ADR 024]] PENDING file create |
| 3 | **Bayesian Nutrition Engine** | Kcal / macro inference + adjustment per phase × goal × age × BF% × activity | [[03-decisions/022-bayesian-nutrition-inference\|ADR 022]] PENDING file create |
| 4 | **Deload Protocol Engine** | When (composite fatigue triggers) / how (volume cut / intensity hold / full rest) dedicat | NEW ADR pending |
| 5 | **Energy Adjustment Engine** | Sleep × stress × pre-session readiness → volume / intensity adjustment (extends §36.82 partial calibration) | NEW ADR pending |
| 6 | **Tempo/Form Cues Engine** | Text coaching cues (3-1-1, paused reps, ROM, mind-muscle connection) per exercise category | NEW ADR pending |
| 7 | **Specialization Engine** | Temporary lagging body part focus (Jeff signature) — auto-detect weakness + propose specialization block | NEW ADR pending |

### 14 Reactive Engines Existing (preserved unchanged):

dp / aa / ruleEngine / alternativeEngine / patternLearning / adherence / calibration / weaknessDetector / stagnationDetector / predictionEngine / plateauInterventions / proactiveEngine / whyEngine / sessionBuilder.

### Effort estimate realist:

- ~150-250h CC Opus per engine NEW × 7 = **~1050-1750h CC autonomous** spread peste 6-12 luni roadmap
- ~50-100h Daniel chat strategic spec generation + product UX integration decisions
- CC time irrelevant per Daniel directive ("nu îmi pasă cât rulează CC")
- Singura constraint reală = chat strategic Daniel-time pentru spec generation + decizii UX

**Cross-refs:** §36.99 ADR 026 candidate (engines vorbesc PRIN voices via Dimension Registry) + ADR 018 plug-in curat + §36.83 Beta-launch ASAP timing flexible (impact 6-9 luni adjust acceptable Daniel approved).

---

## §36.101 5 Voices Cognitive Architecture CONFIRMED (slip clarification)

**Status:** CONFIRMED arhitectura existing LOCKED, NU decizie nouă. Slip Claude-side imprecizie clarificat.

**5 voices arhitectura cognitive v1 (LOCKED):**

1. **HISTORICAL** — voice temporal past (data via Event Anchor R22)
2. **REALTIME** — voice temporal present (since last sleep cycle)
3. **PROJECTION** — voice temporal future (2 instanțe: tactical + strategic)
4. **ARBITRATOR** — meta-voice consensus (consume 3 temporal verdicts → final decision via 5-level Precedence Hierarchy + 27 reguli arbitration)
5. **ACTION** — execution voice (singurul cu mutation rights, build session + persist via Event Sourcing)

**Slip Claude:** răspuns inițial "3 voices" — confuzie între voices temporale (3 produc VoiceVerdict structured) și voices arhitecturale (5 total în 5-engine cognitive segmentation per Daniel vision 2026-04-28 NIGHT).

**Voice 6-th GOAL discutat → REJECTED §26.2:** goal = SETTING parametric pe ACTION layer, NU voice nou. Rationale validă pentru "voice nou rejected" (overengineering detection mismatch real-time silent), DAR statistica "98% NU schimbă goal" era mis-cited ca rationale general — vezi §36.102 clarification.

**Pentru offline coaching tree exhaustive (§36.99):**

- ✅ **5 voices = suficient.** NU lipsesc voices. Architectura cognitive layer ready
- ✅ **Engines noi vorbesc PRIN voices** via Dimension Registry ADR 018 — Periodization Engine contribuie verdict la HISTORICAL (ce periodization ai făcut) + REALTIME (ce e activ săpt asta) + PROJECTION (ce vine next mesocycle)

**Cross-refs:** [[04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE]] PARTEA 1-3 (27 reguli + VoiceVerdict schema + 5-level Precedence) + §26.2 Goal-ca-setting LOCKED + ADR 018 Dimension Registry plug-in pattern.

---

## §36.102 Goal Lifecycle Change Reconfirmed First-Class Supported (slip clarification)

**Status:** CONFIRMED arhitectura existing LOCKED, NU decizie nouă. Statistica mis-cited de Claude clarificată.

**Slip Claude:** citarea "98% NU schimbă goal post-onboarding" ca rationale general în răspunsul anterior. Statistica corect interpretat **strict** pentru "voice 6-th GOAL nou cu detection mismatch silent real-time" (overengineering rejected §26.2) — NU pentru "useri NU schimbă goal lifecycle".

**Realitatea lifecycle Gigel:**

```
Onboarding: SLĂBIRE (gras, vrea slim)
  ↓ 6-12 luni
MAINTAIN (a slăbit, vrea să țină)
  ↓ 12-24 luni
TONIFIERE/DEFINIRE (vrea aestetic)
sau
FORȚĂ (nivel avansat)
```

**Goal change lifecycle = pattern majoritar la useri serioși long-term, NU edge case 2%.**

**Arhitectura SUPORTĂ deja goal change first-class:**

1. **§36.35 Goal Shift Event Handler LOCKED V1** — user tap "Schimbă obiectiv" în Setări → Engine aplică Modificatori Template (rep ranges, RIR, rest time) + Streak Reset + 2-session calibration window (interval estimat NU single point per SUFLET F1 Triangulation)
2. **§26.5 Re-prompt periodic 4-6 săpt** — modal in-app "Obiectivul tău e încă X? Confirmă sau schimbă" (anti-rigid, anti-spam cooldown 21 zile post-confirm)
3. **Conservare date fizice:** PR records + CDL logs + istoric forță = INTACT post-shift
4. **5 templates V1 ready:** Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală

**Distincție tehnică critică:**

- **GOAL** = setting strategic user (5 template choice) — schimbat manual via Setări
- **PHASE** = automated CUT/BULK/MAINTAIN (sys.js calculează BF% + sezon) — sub-state per goal
- **MODE** = Estetică ↔ Forță (sub-modificator rep ranges/intensity)

Slăbire → Mentinere = goal switch explicit (template change). CUT → MAINTAIN automated = phase change (sub-state intern, NU template change).

**Cross-refs:** §36.35 Goal Shift Event Handler + §26.2 Goal-ca-setting LOCKED + §26.5 Re-prompt periodic + sys.js phase detection automated + ADR_OUTLIER_FILTER EXT-2 Goal Shift extension.

---

## §36.103 Knowledge Layer Update Cadence LOCKED V1 — Content Store NU Capability Blocker

**Decision wording verbatim:**

> "Knowledge layer Andura = content store updatable periodic, NU capability blocker arhitectural. Pattern: engines = logic stable (rare changes), knowledge = data periodic refresh. Update cadence LOCKED V1: quarterly (meta-analyses noi + tweaks volume/frequency landmarks) / bi-annual (exercise library extension) / annual (periodization template revisions per literature consensus shift). Mecanism delivery: Claude chat urmărește field research + generează patch specs cu rationale + cross-refs literature → CC Opus implementează patches incremental (~5-15h/quarter) → Feature Flags rollout gradual (10%/50%/100%) safe deployment → CDL audit trail post-deployment metrics check."

**Rationale:**

- **Engines = logic stable** (Schoenfeld volume landmarks nu se schimbă brusc, periodization templates Helms/Israetel evoluează lent)
- **Knowledge = data refresh** (exercise library, threshold values, MEV/MAV/MRV calibration, RPE matrix) tunabil via Remote Config + data files
- **ADR 018 Schema Versioning + Feature Flags ready infrastructure** pentru rollout safe
- **Avantaj competitiv vs Jeff:** Jeff vinde program 2024 încă în 2027 static. Andura updates quarterly automat — user primește latest research findings fără să cumpere program nou
- **Avantaj vs LLM frontier:** LLM-urile au knowledge cutoff fix (training date) — Andura quarterly fresh + structurat verificabil (NU "GPT a citit ceva")

**Knowledge layers extensibile:**

- Exercise library (`src/exercises/`) — ADR 022 V2 prevede ~50-150 exerciții add post-launch
- Decision tree rules — versionate per ADR 018 Schema Versioning
- Periodization templates — Helms/Israetel/Schoenfeld block schemes ca data files NOT cod
- Volume landmarks (MEV/MAV/MRV per muscle) — config tunabil
- Substitution rules — alternativeEngine extensibil (data NU logic refactor)
- RPE/RIR thresholds — Remote Config tunable per profile

**Update cadence detail:**

- **Quarterly** — meta-analyses noi (Schoenfeld lab output ~3-4/an), tweaks volume/frequency landmarks, RPE thresholds calibration
- **Bi-annual** — exercise library extension (variante noi populare community), substitution rules update
- **Annual** — periodization template revisions per literature consensus shift, MEV/MAV/MRV recalibrare

**Cross-refs:** ADR 018 Schema Versioning + Feature Flags + §36.99 ADR 026 offline tree (knowledge ≠ capability) + Exercise library schema §36.36 extension + alternativeEngine.js extensibilitate.

---

## §36.104 Effort Estimate Roadmap (informational, NU LOCKED)

**Realistic effort spread peste 6-12 luni roadmap pre-Beta:**

- **CC Opus autonomous:** ~1050-1750h (7 engines × 150-250h each)
- **Daniel chat strategic:** ~50-100h spec generation + UX integration decisions
- **Daniel-time real cu factor 7-9x slippage** — handover + ingestion + decision delays + life context cu copil mic + job + familie
- **Timing impact §36.83 Beta:** flexible adjust 6-9 luni acceptable per Daniel approval ("nu îmi pasă cât rulează CC")

**NU LOCKED** — estimare informational pending breakdown per engine în chat strategic dedicat NEW post Vault Hygiene + Auth.

---

## §36.105 Pivot Arhitectural Reconfirmed: "More Engine, Less LLM Runtime"

**Status:** CONFIRMED direcție arhitecturală existing LOCKED, NU decizie nouă. Reconfirmation post-discuție offline pure feasibility.

**Pivot direction:**

- **Engine layer expansion:** 14 → 21 engines (7 prescriptive NEW per §36.100)
- **LLM runtime reduction:** ZERO LLM core coaching paths (offline tree per §36.99)
- **LLM scope strict preserved:** Pain text + Equipment text per ADR 023 unchanged
- **Knowledge layer extensibil:** content store updatable quarterly per §36.103

**Aliniat:**

- Bugatti paradigm (peak craft, zero compromise)
- ADR 018 Engine Extensibility foundation
- ADR 023 LLM scope strict (NU contradicție, NU expansion)
- Cognitive Q4 ZERO LLM runtime original intent honor pentru core paths
- §36.94 ADR 025 candidate "Andura Gândește pentru User" graceful degradation
- SUFLET §1.1 ~75% replicabil V1 engine deterministic

**Cross-refs:** §36.99 ADR 026 + §36.100 7 engines + §36.101 voices confirmed + ADR 023 preserved + ADR 018 foundation + Cognitive Q4 honored.

---

## §36.106 Decision Point D2 NEW OPENED FOR DISCUSSION — Injury / Contraindication Mapping Onboarding + In-Session

**Status:** 🟡 OPENED FOR DISCUSSION — chat strategic dedicat NEW (post Vault Hygiene + Auth). NU LOCKED.

**Daniel articulation verbatim:**

> "Sa existe in onboarding o chestie de accidentari — gen daca omul are hernie sa nu il pui la deadlifts. Sau in exercitii langa butoanele de 'nu am aparat'. Sau undeva. Ne decidem in chat nou fresh."

**Scope candidate:**

- **Onboarding screen NEW** — checkbox/multi-select condiții medicale care exclud anumite mișcări specific (hernie disc lombară → exclude deadlift conventional + bent-over row, hernie abdominală → exclude squat heavy compresie + Valsalva maneuver, etc.)
- **Inline buton in-session** — adjacent "Nu am aparat" în UI exerciții, scope similar pentru flag contraindicație acută ("Mă doare X la mișcarea asta, exclude permanent / temporary / pentru azi")
- **Granular contraindication mapping** (NU SAFETY_TRIPWIRE_GLOBAL all-or-nothing per Cognitive Q18)
- **Auto-substitution via alternativeEngine** — exercise excluded → propose biomechanically similar safe alternative (deadlift conventional → trap bar deadlift / Romanian deadlift moderate / hip thrust / cable pull-through)

**Cross-refs existing arhitectura:**

- **Cognitive Q18 SAFETY_TRIPWIRE_GLOBAL** — checkbox condiții medicale onboarding → "Passive Mode" tripwire (Dumb Tracker excellent). Daniel proposal extends granular per condiție specific NU all-or-nothing
- **§36.38 Pain/Discomfort Button (ADR 023 Tier 1)** — text input free-form "Mă doare X în zona Y" → LLM intent classification → routing engine action. Daniel proposal complementary (predefined condiții vs free-text post-hoc)
- **§36.85 Pain Button + EU AI Act compliance** — zero rehab claims, NU dispozitiv medical. Daniel proposal trebuie atent legal phrasing (NU "diagnostic", DA "informativ contraindication user-declared")
- **alternativeEngine.js** — extension pentru contraindication mapping per condiție → safe alternative pool
- **§36.36 Schema Extension Exercise Library** — `muscle_target_primary` + `muscle_target_secondary` deja existing. NEW candidate: `contraindications: string[]` field per exercise (ex: deadlift_conventional → ["hernia_disc_lombara", "hernia_abdominala_acuta", "stenoza_spinala_severa"])

**Decision points pending strategic chat NEW:**

- **D2.1** Onboarding screen separat sau integrat în profil typing T1+? (impact friction Maria 65 vs comprehensive injury history)
- **D2.2** Granularity condiții — taxonomie predefinită (15-30 condiții common) vs free-text + LLM classify (ADR 023 extension Tier 3) vs hybrid
- **D2.3** UX placement in-session — buton inline lângă "Nu am aparat" sau separate "Discomfort/Risk" entry vs continue Pain Button §36.38 unified flow
- **D2.4** Liability boundary EU AI Act — wording "informativ user-declared" vs medical disclaimer requirements ToS
- **D2.5** User override "Vreau totuși să fac deadlift" → Liability Flag silent backend (R17 User Agency consistent) vs hard block
- **D2.6** Re-prompt periodic 6-12 luni "Condițiile tale medicale s-au schimbat?" similar §26.5 Goal Re-prompt
- **D2.7** Pregnancy specific handling (Q18 existing tripwire pregnancy pathway) — granular trimester-specific exclusions vs Passive Mode total

**Gigel test pending strategic chat:**

- Maria 65 — comfort completion checkbox condiții vs friction/medical-anxiety? Mediu cultural RO sensibilitate "diagnostic" vs "user-declared"?
- Gigica 35 — postpartum specific pathway vs generic? Diastasis recti contraindication common dar tabu cultural?
- Marius 25 — likely zero condiții, friction onboarding cost-benefit?

**Reasoning Claude pre-chat strategic:**

- **Probabil PRO** granular contraindication mapping pentru "bate Jeff" claim (Jeff zero personalizare injury) + SUFLET F2 ("AI-ul informează nu impune") + ADR 025 candidate graceful degradation (skip → engine assume zero contraindications default)
- **Probabil CONTRA** scope creep onboarding screen lung Maria 65 friction + EU AI Act medical device boundary risk + taxonomy maintenance burden
- **Probabil RECOMMEND hybrid:** taxonomie predefinită minimal (top 10-15 condiții common) onboarding + free-text Pain Button §36.38 post-hoc detection + alternativeEngine auto-substitution + user override liability flag

**Action chat strategic NEW:** Daniel + Claude review draft scope + decizie D2.1-D2.7 + ADR draft "Injury/Contraindication Mapping V1".

**Cross-refs:** Q18 SAFETY_TRIPWIRE_GLOBAL + §36.38 Pain Button + §36.85 EU AI Act compliance + alternativeEngine.js + §36.36 Schema Extension + SUFLET F2 + ADR 025 graceful degradation candidate + ADR 013 §SAFETY_TRIPWIRE.

---

## §36.107 Decision Point D3 NEW OPENED FOR DISCUSSION — Don't Like Button + Home Workouts + Calisthenics + Sport-Oriented Training

**Status:** 🟡 OPENED FOR DISCUSSION — chat strategic dedicat NEW (post Vault Hygiene + Auth + D2). NU LOCKED. 4 sub-buckets distinct scope vs §36.106 D2 medical.

**Daniel articulation verbatim:**

> "Optiune buton nu vresu/nu imi place, antrenamente de acasa, calestenice, sport orientated trainings?"

**Scope decomposition în 4 sub-buckets distinct:**

---

### D3.1 — Buton "Nu vreau / Nu îmi place" exercise (User Preference Pure)

**Distinct semantic vs existing:**

- "Nu am aparat" = logistic (echipament temporar absent)
- "Mă doare" = medical (§36.106 D2 contraindication)
- "Nu vreau / Nu îmi place" = preferință stylistic pură user (NU medical, NU logistic, NU temporary)

**Recomandare Claude pre-chat strategic:** ✅ **PRE-BETA mandatory**.

**Rationale:**
- Aliniat SUFLET F5 push-back proporțional cu risc — preferință stylistic = accept user, NU push (User Agency > Paternalism per R17)
- Low-effort UX extension existing alternative buttons (~1-2h CC)
- High-value retention (user nu primește repeat exercises pe care le urăște)
- Aliniat ADR 025 graceful degradation candidate (skip → engine substitute alternative default)

**Decision points pending:**

- **D3.1.1** Hard skip (exercise NEVER reappears în session future) vs Soft skip default (substitute in-session curent + reapare future cu re-evaluare context — user gust se schimbă cu progres) vs Hybrid user-controlled (Soft default + opt-in Hard skip advanced settings)
- **D3.1.2** Engine push-back 1× per exercise dislike — SUFLET F5: "engine argues once if exercise high-value pentru user goal (squat heavy hipertrofie quads optimal Marius), apoi accept"? Sau zero push-back accept silent (preferință = sacred)?
- **D3.1.3** Substitution priority — alternativeEngine biomechanical similarity hierarchy (squat → leg press → hack squat → split squat → goblet squat) vs user-driven choice (showcase 3 alternatives + user picks)?
- **D3.1.4** UX placement buton — adjacent "Nu am aparat" inline same row UI consistency, sau dropdown "Schimbă exercițiu" cu opțiuni multiple (logistic / medical / preferință) unified flow?

**Cross-refs:** SUFLET F5 push-back proporțional + R17 User Agency + alternativeEngine.js + §36.106 D2 Pain Button parallel + ADR 025 graceful degradation candidate.

---

### D3.2 — Antrenamente Acasă (Home Workouts)

**Scope candidate:** Template variant cu equipment minim subset pentru users care antrenează acasă (Maria 65 mobility issues + privacy / Gigica 35 postpartum + copil mic + time / Marius 25 backup secondary use case gym primary).

**Recomandare Claude pre-chat strategic:** ✅ **PRE-BETA mandatory**.

**Rationale:**
- **Maria 65 use case MASSIVE:** mobility issues + intimidating gym environment + transportation barriers + age cultural RO friction "bătrâni la sală" → home = unblock 30-40% Maria market segment
- **Gigica 35 use case MASSIVE:** postpartum + copil mic acasă + time constraint + privacy postpartum body insecurity → home = unblock 25-35% Gigica market segment
- **Marius 25 backup:** vacation / business travel / weather extreme / gym closed → home backup retention preserve
- **Existing arhitectura partial ready:** §36.36 Schema Extension Exercise Library + alternativeEngine.js extensibilitate

**Decision points pending:**

- **D3.2.1** Equipment hierarchy detail — bodyweight only / + dumbbells (1 pair / 2 pairs) / + bands / + pull-up bar / + adjustable bench / + cables home (TRX / rings) — granularity Q1 onboarding equipment filter
- **D3.2.2** Template variants per goal — fiecare din 5 templates V1 (Forță / Tonifiere / Slăbire / Longevitate / Sănătate) primește variant home equipment subset, sau template "HOME" separat distinct?
- **D3.2.3** Substitution algorithmic existing alternativeEngine acoperă 100% cazuri home, sau need exercise pool expansion ~30-50 exerciții bodyweight-friendly NEW (single-leg variations + tempo manipulations + pause reps + isometric holds + plyo regressions)?
- **D3.2.4** Hybrid switching gym/home — user trainer 3× gym + 2× home/săpt — engine handle dual schema sau template lock single environment?
- **D3.2.5** Progress tracking home challenges — bodyweight progresia mai dificil vs barbell load (rep + tempo + leverage manipulations) — engine logic adjusted vs gym standard?

**Cross-refs:** §36.36 Schema Extension Exercise Library + alternativeEngine.js + 5 templates V1 (potential variants) + Q1 onboarding equipment filter + Maria/Gigica/Marius beachhead market analysis.

---

### D3.3 — Calistenice (Bodyweight Discipline Distinct)

**Scope candidate:** Discipline distinct calistenice (pull-ups / dips / muscle-ups / planche / front lever / back lever / handstand / iron cross / human flag) cu skill progressions specifice (band-assisted → unweighted → weighted → skill progressions isometric holds + tempo manipulations).

**Recomandare Claude pre-chat strategic:** ⚠️ **POST-BETA v1.5** (NU pre-Beta).

**Rationale RESPINGERE pre-Beta:**
- **Niche audience pre-Beta:** Marius 25 advanced minoritate (~15-20% Marius segment) + ZERO Maria 65 + ZERO Gigica 35 → impact retention pre-Beta minim
- **Scope creep massive:** discipline distinct = whole programming science separate (skill progression trees + isometric holds + tempo work + leverage progressions + injury prevention shoulder/elbow specific calistenice common)
- **Effort estimate:** ~150-300h CC Opus full spec (calistenice library 80-120 exerciții + progression trees 15-20 skills + periodization specifice + injury prevention specific) — Bugatti standard NU rushed
- **Conflict scope V1 Beta-launch ASAP §36.83:** timing flexible adjust 6-9 luni acceptable, dar +6-9 luni adițional pentru calistenice = NEVER ship

**Pre-Beta alternative recommended:**
- **Include moves calistenice STANDARD în exercise library V1:** pull-ups + chin-ups + dips + push-ups variations + BW squats + lunges + pistol squat progression + handstand basics + L-sit
- **NU discipline distinct separat** — moves integrate ca exerciții normal în 5 templates V1 cu equipment "Pull-up bar" filter
- **Post-Beta v1.5 expansion:** discipline calistenice distinct cu skill progression trees + dedicated periodization + injury prevention specific

**Decision points pending (chat strategic NEW):**

- **D3.3.1** Pre-Beta: include moves calistenice standard în library (~10-15 moves) cu filter "Pull-up bar / Dip station" YES/NO?
- **D3.3.2** Post-Beta v1.5 scope: full discipline calistenice template + skill progression trees + 80-120 exerciții library expansion?
- **D3.3.3** Goal mapping calistenice — Forță & Dezvoltare ↔ calistenice strength (muscle-up / front lever / planche) + Tonifiere ↔ calistenice hypertrophy volume (push-ups variations + dips volume) + Longevitate ↔ calistenice mobility-friendly (handstand basics + L-sit)?
- **D3.3.4** Audience marketing post-Beta v1.5 — Marius 25 advanced niche dedicated marketing channel (Instagram/TikTok calistenice community RO) sau cross-sell internal users base?

**Cross-refs:** §36.83 Beta-launch ASAP timing flexible + §36.99 ADR 026 offline tree (calistenice = expansion knowledge layer §36.103) + Marius beachhead market analysis + post-Beta v1.5 roadmap.

---

### D3.4 — Sport-Oriented Training (Sport-Specific Programming)

**Scope candidate:** Programming specific per sport (football / soccer / tennis / climbing / running / cycling / MMA / boxing / volleyball / basketball / etc.) cu accessory work targeted + periodization off-season / pre-season / in-season + sport-specific injury prevention.

**Recomandare Claude pre-chat strategic:** ❌ **POST-BETA v2.0+** (definite NU pre-Beta).

**Rationale RESPINGERE pre-Beta:**
- **Niche-of-niche audience pre-Beta:** ~5-10% Marius 25 segment intersect cu sport amator competitiv + ZERO Maria 65 + ZERO Gigica 35 (yoga/pilates adjacent NU same scope) → impact retention pre-Beta neglijabil
- **Scope multiplication 10x:** 10+ sports × periodization (off/pre/in-season) × accessory specific × injury prevention sport-specific = drastic different programming per sport (football leg power vs tennis rotational vs climbing grip vs MMA neck = ZERO overlap)
- **Effort estimate:** ~500-1000h CC Opus full spec (sport library + periodization per sport + accessory pools + injury prevention specifice + season tracking)
- **Liability concern regulatory:** "sport coach" claim might trigger different regulatory framework (sport federation registrations RO/EU + insurance liability higher coach professional sport vs general fitness coach)
- **Conflict EU AI Act medical device boundary risk + sport injury liability shield** — different framework scrutiny

**Pre-Beta alternative recommended:**
- **Întrebare onboarding "Practici un sport competitiv?"** YES/NO + sport name (free-text) — ZERO programming impact pre-Beta, doar future v2 user base preparation
- **Post-Beta v2.0+ scope:** sport-oriented programming dedicated module cu top 3-5 sports populare RO (football + tennis + climbing + running + MMA) + periodization spec + accessory pools

**Decision points pending (chat strategic NEW):**

- **D3.4.1** Pre-Beta: întrebare onboarding sport YES/NO + free-text name (preparation v2) sau ZERO mention sport pre-Beta?
- **D3.4.2** Post-Beta v2.0+ scope: top 3-5 sports populare RO sau exhaustive 10+ sports?
- **D3.4.3** Liability framework — Andura sport-oriented = consultanță fitness sportiv (general) vs antrenor sportiv (regulated) — wording legal ToS adjustment?
- **D3.4.4** Periodization sport calendar tracking (off/pre/in/post-season) — manual user input vs auto-detect via competition dates input?
- **D3.4.5** Cross-sell internal V1 users base post-Beta v2 launch sau dedicated marketing channel sport community RO?

**Cross-refs:** §36.83 Beta-launch ASAP timing + §36.85 EU AI Act compliance + §31 Investment timeline + post-Beta v2.0+ roadmap + Marius advanced segment market expansion.

---

### Verdict Cumulativ Recomandare Claude D3.1-D3.4 (pre-chat strategic):

| Sub-bucket | Verdict | Effort | Audience Impact |
|------------|---------|--------|-----------------|
| **D3.1 Buton "Nu vreau"** | ✅ **PRE-BETA mandatory** | ~1-2h CC | High (toate Maria + Gigica + Marius) |
| **D3.2 Home Workouts** | ✅ **PRE-BETA mandatory** | ~30-80h CC (equipment filter + template variants + ~30-50 exerciții bodyweight library extension) | Massive (Maria 30-40% + Gigica 25-35% + Marius backup) |
| **D3.3 Calistenice discipline distinct** | ⚠️ **POST-BETA v1.5** (pre-Beta = standard moves în library) | ~150-300h CC v1.5 | Niche (Marius 25 advanced ~15-20%) |
| **D3.4 Sport-oriented programming** | ❌ **POST-BETA v2.0+** (pre-Beta = onboarding question doar) | ~500-1000h CC v2.0+ | Niche-of-niche (~5-10% Marius cross-sport) |

**Filter Bugatti pre-Beta strict:** D3.1 + D3.2 mandatory → "best" pe core market beachhead Maria/Gigica/Marius. D3.3 + D3.4 = scope creep care sacrifică core experience pentru tail features. **Bugatti NU înseamnă "everything", înseamnă "everything that matters peak craft".**

**Caveat Daniel directive "Andura needs to be the best":** dacă "best" = exhaustive niche coverage including calistenice + sport, atunci D3.3 fezabil prelungit timeline +6-9 luni. D3.4 NEVER pre-Beta — scope multiplication regulatory risk irreversible.

**Action chat strategic NEW:** Daniel + Claude review verdict + decizie D3.1-D3.4 sub-decisions + ADR drafts (D3.1 + D3.2 pre-Beta → integration existing ADR 026 + D3.3 + D3.4 post-Beta → ADR drafts deferred).

**Cross-refs:** §36.99 ADR 026 offline coaching tree + §36.100 7 engines prescriptive (Goal Adaptation + Specialization Engine relevant home/calistenice/sport) + §36.103 Knowledge cadence (post-Beta expansions) + §36.106 D2 medical contraindication parallel scope D NEW + Bugatti paradigm + §36.83 Beta-launch ASAP timing flexible.

---

## §37 Status Cumulative V1 Update

**Cumulative LOCKED count:** 87 → **90** (+3 substantive: §36.99 ADR 026 candidate + §36.100 7 engines roadmap + §36.103 Knowledge cadence). §36.101 + §36.102 + §36.105 = clarification slip-uri Claude (NU decizii noi). §36.104 = informational. §36.106 = D2 NEW opened for discussion (NU LOCKED). §36.107 = D3 NEW opened for discussion (NU LOCKED).

**Status V1 cumulative:**

8/8 templates LOCKED + F-NEW + MMI + Storage Full UX + 4 CRITICAL pre-Beta blockers + 12 HIGH cleanup + Top 6 ideation + **90 decizii LOCKED cumulative** + Beta-launch ASAP timing flexible §36.83 + Suflet Andura + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR 023 LOCKED V1 partial spec + ⚠️ PENDING addendum integration Faza 3 + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests **1203/1203 PASS** unchanged + Coverage/Build baselines + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 + Andura V1 prod LIVE `andura.app` ✅ + §36.78-§36.79 Rebrand+Hotfix + §36.80 BUG 2 Auth Flow Priority 1 ABSOLUT preserved + §36.81-§36.85 Coach/Energy/META/Backlog/Body Region + Memory #24 + §36.86-§36.91 audit total + §36.92 reclasificare 4 buckets + DIFF_FLAGS P1+P2 + §36.93-§36.98 Vault Hygiene Sprint Faza 1 + decizii strategice + **§36.99-§36.107 Andura Offline Coaching Decision Tree Exhaustive Roadmap + 7 Engines Prescriptive NEW + Knowledge Cadence + D2 Injury/Contraindication NEW opened + D3 Don't Like + Home + Calistenice + Sport-Oriented NEW opened**.

---

## §38 Decision Points Status Update

| ID | Topic | Status | Note |
|----|-------|--------|------|
| **D1** | Save the week silent | ✅ **LOCKED V1 (2026-05-05 morning)** | §50.4 7 Q sub-decisions — C Silent default + 3/4 threshold (Q20 reuse) + max 2 weeks consecutive cap + naming distinction Circuit Breaker 5% (§42.7) vs User adaptation 50% (D1 Q7 individual T1+ Profile Typing v1.5 trigger) |
| D2 §36.86b DELOCK Mechanism | ✅ RESOLVED | ACCEPT propunere wording verbatim Co-CTO |
| D3 Cloud Functions Blaze | ✅ RESOLVED | B Spark plan retain (§36.93) |
| D4 Goal Taxonomy | ✅ RESOLVED | hybrid C deja LOCKED §36.92 |
| D5 Sprint Vault Hygiene Q2 2026 | ✅ SUPERSEDED | Vault Hygiene Sprint = Priority 0 acum |
| D6 ADR 023 cost monitoring | ✅ RESOLVED | B frontend-only soft cap (depends D3=B) |
| **D2 NEW** | **Injury/Contraindication Mapping** | ✅ **LOCKED V1 (2026-05-05 morning)** | §50.3 13 sub-decisions — preset list ~15-20 condiții + 3-tier severity + curated DB NSCA+ACSM + "Mă doare" button distinct de "Nu pot" + 5th invariant Medical Safety Floor Absolut §42.9 extension + pregnancy defer v1.5 + recovery hybrid manual + zero telemetry pre-Beta GDPR |
| **D3 NEW** | **D3.1 Buton "Nu vreau" only — D3.2/D3.3/D3.4 deferred** | ✅ **D3.1 LOCKED V1 (2026-05-05 morning)** / 🟡 D3.2-D3.4 chat NEW separate | §50.1 D3.1 13 sub-decisions — Firestore sync blacklist + Hard Cap re-roll 2× max 7 încercări + lock substitute intra-mesociclu + "Nu pot" Settings list unblock + D3.1.6 Pattern Detection Passive 3-5 refuze soft prompt. D3.2 Don't Like + D3.3 Home + D3.4 Calistenice/Sport-Oriented chat strategic NEW Priority 4. |
| **D4 NEW** | **Mid-Session Resume Protocol** | ✅ **LOCKED V1 (2026-05-05 morning)** | §50.2 11 sub-decisions — IndexedDB per-set auto-save + Firestore sync on complete + dialog blocking 3 opțiuni + D4.2.1 NEW threshold 6h Recuperabilă/Abandonată filter + Q20 §45.3 reuse 3/4 + intensity hold + unified state machine 3 entry points + crash mid-set last completed saved |

---

## §39 Next Actions Priority Order

**Priority 0 ABSOLUT (existing per HANDOVER_GLOBAL session-lock):**

1. **Faza 3 + Faza 4 Vault Hygiene Sprint** chat NEW dedicat — 8 recomandări A-H + ADR 022/024/025 stubs + DECISION_LOG UTF-8 + INDEX_MASTER refresh + HANDOVER_GLOBAL split + VAULT_HYGIENE_PASS rule codification (~2.5-3.5h CC autonomous total)

**Priority 1 ABSOLUT (existing preserved):**

2. **Auth Flow §36.80 BUG 2 Firebase 401** chat strategic + prompt CC Opus dedicat (~1-2h Daniel + ~30-45min CC autonomous factor 7-9x)

**Priority 2 NEW (post Priority 0 + Priority 1):**

3. **ADR 026 + 7 Engines Prescriptive spec generation** chat strategic dedicat NEW — Daniel + Claude prioritize 7 engines order impact (Periodization first? Bayesian Nutrition first? Deload Protocol first?) + spec generation per engine + ADR drafts

4. **D2 NEW Injury/Contraindication Mapping** chat strategic dedicat NEW — D2.1-D2.7 decisions + ADR draft "Injury/Contraindication Mapping V1"

5. **D3 NEW Don't Like + Home + Calisthenics + Sport-Oriented Mapping** chat strategic dedicat NEW — D3.1-D3.4 decisions + ADR drafts pre-Beta integration (D3.1 + D3.2) sau post-Beta deferral (D3.3 + D3.4)

6. **D1 Save the week silent** chat strategic dedicat NEW (existing pending)

**Priority 3 (long-term):**

7. **ADR 022 + ADR 024 file creation** Faza 3 stubs + post-Beta full spec
8. **Knowledge cadence first quarterly patch** post-Beta data (Schoenfeld 2027 meta-analyses + tweaks)
9. **Beta Recruitment 50 testeri segmentat** (timing flexible §36.83)
10. **Audit legal €300-500** pre-public-launch
11. **Soft Launch** condiționat DoD complete

---

## §40 Verification Questions Generation Per VAULT_RULES §HANDOVER_PROTOCOL Step 9

CC Opus va genera ALIGNMENT_QUESTIONS_CHAT_NEW.md fresh post-merge cu citation §X file.md + răspuns verbatim per memory rule #22 + PROMPT_CC_HYGIENE §9. Format: ≥10/12 PASS = PROCEED chat strategic NEW, <10/12 = RE-SYNC mandatory.

**Topics expected verification:**

- Q: §36.99 ADR 026 candidate scope + paritate target + aliniat ADR 023?
- Q: §36.100 7 engines roadmap pre-Beta + lista exhaustivă + cross-refs ADR pending?
- Q: §36.101 5 voices CONFIRMED (slip clarification) + voice 6-th GOAL REJECTED rationale?
- Q: §36.102 Goal lifecycle change first-class supported (slip clarification 98% mis-cite)?
- Q: §36.103 Knowledge cadence quarterly/bi-annual/annual + mecanism Feature Flags?
- Q: §36.105 Pivot "More Engine Less LLM Runtime" reconfirmed aliniere ADR 023 unchanged?
- Q: §36.106 D2 NEW Injury/Contraindication Mapping OPENED FOR DISCUSSION + D2.1-D2.7 sub-decisions pending?
- Q: §36.107 D3 NEW Don't Like Button + Home Workouts + Calisthenics + Sport-Oriented OPENED FOR DISCUSSION + 4 sub-buckets distinct scope vs D2 medical?
- Q: D3.1 Buton "Nu vreau" Claude recommend PRE-BETA mandatory + rationale SUFLET F5?
- Q: D3.2 Home Workouts Claude recommend PRE-BETA mandatory + Maria 30-40% + Gigica 25-35% market unblock?
- Q: D3.3 Calistenice Claude recommend POST-BETA v1.5 + pre-Beta alternative moves standard în library?
- Q: D3.4 Sport-Oriented Claude recommend POST-BETA v2.0+ + pre-Beta alternative onboarding question doar?
- Q: Cumulative LOCKED count post acest ingest (87 → 90)?
- Q: Decision Points status post-update (D1 pending + D2 NEW pending + D3 NEW pending)?
- Q: Next Actions priority order Priority 0/1/2/3?
- Q: Faza 3 + Faza 4 Vault Hygiene Sprint preserved?
- Q: Auth Flow §36.80 Priority 1 ABSOLUT preserved?

---

## §41 Vault Hygiene Sprint Faza 3 + Faza 4 COMPLETE (2026-05-04 evening ingest)

### §41.1 Status: ✅ COMPLETE

CC Opus autonomous run ~25min. 8 recomandări A-H + Faza 4 codification executate. ZERO src/tests/scripts touched. ZERO information loss.

**Modificări sumar:**

- **G** — ADR stubs created: `022-bayesian-nutrition-inference.md` (3.7KB STUB) + `024-goal-driven-program-templates.md` (3.2KB STUB) + `025-andura-gandeste-pentru-user.md` (3.4KB CANDIDATE STUB) + `026-offline-coaching-decision-tree-exhaustive.md` (3.0KB CANDIDATE STUB cu 10 Open Questions ready chat strategic NEW).
- **H** — `DECISION_LOG.md` UTF-8 normalize: BOM stripped + 422 mojibake substitutions exact-codepoint applied (109× em-dash + 115× ă + 58× î + 43× ț + 34× → + restul). Saved UTF-8 no BOM LF. Romanian diacritics render correct.
- **F** — Orphan wikilinks cleanup: 21 MISSING (18 LOW stripped + 4 MEDIUM rewired EXEC_QUEUE → outbox workflow + ENGINE_ARCHITECTURE → COGNITIVE_ARCHITECTURE_SPEC_v1 + HANDOVER → HANDOVER_GLOBAL_2026-04-30_evening + 22nd ADR 022 resolved via stub G) + 3 UNREFERENCED (1 git mv archive + 1 git rm bit-identical duplicate + 1 KEEP COACHING_TEXTBOOK_SYNTHESIS legitim research). 39 replacements across 18 files. Verified zero `[[.]]` hits active vault.
- **C** — `INDEX_MASTER.md` refresh: 51 → 66 active vault files. ADR table 22 → 26. 8 Named ADRs section added explicit. Navigation entries §36.99-§36.107 + ADR stubs + ONBOARDING_SSOT_V1 + DIFF_FLAGS + VAULT_RULES root + PROMPT_CC_HYGIENE. Pricing entry updated Founding €39 + Standard €59 + Elite €79 V1.1 (Chat D 2026-05-02). VAULT CLEANUP HISTORY subsection 3 entries.
- **B** — `01-vision/ONBOARDING_SSOT_V1.md` created. Consolidare 5 SSOT-uri pre-existente fragmentate. 11 sections (Onboarding Flow 4 ecrane + Goal Taxonomy 5 templates + Profile Typing tier-aware + Equipment Filter + Pre-Session Readiness + Injury PENDING D2 + SAFETY_TRIPWIRE + Disclaimer + Anti-Reflex + Open Questions + Cross-Refs). Hybrid C §36.92 D4 LOCKED.
- **A** — HANDOVER_GLOBAL split DEFERRED. File 6058 LOC, threshold codified §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG candidate, >10000 LOC ESCALATE BLOCKER mandatory. Justificare CC: 30-day active window + ~50 wikilink cross-refs risk migration. Acceptable judgment call.
- **D** — Archive policy zero change confirmed (preserve permanent audit trail).
- **E** — DIFF_FLAGS root NU moved la 05-findings-tracker/ (CC judgment: high-visibility lângă VAULT_RULES + PROMPT_CC_HYGIENE root). Reversible oricând.
- **Faza 4** — `VAULT_RULES.md` §VAULT_HYGIENE_PASS section appended post §BATCH_PROTOCOL: trigger conditions + STEP 10-15 spec + §VAULT_HYGIENE_PASS.UTF8 sub-section mojibake substitutions library Python script reusable. Effort ~10-15min CC autonomous per ingest, ZERO Daniel-time. `PROMPT_CC_HYGIENE.md` §2 references VAULT_RULES authoritative.

### §41.2 Commits + Push

7 commits planned vault-docs-only `--no-verify` per P1-FLAG-NEW precedent (Codespace npm install drift pre-existing). Pending Daniel approval push origin main.

### §41.3 Issues preserved

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. NOT regression. Defer dedicated chat post Auth Flow §36.80.
- **§36.61 gap** chronological — pre-existing on origin/main pre-Faza 3+4. NOT introduced.
- **Heading hierarchy mixed §36.99-§36.107** (level 2) vs §36.59-§36.98 (level 3) — cosmetic only, pre-existing 2026-05-04 morning ingest.

---

## §42 ADR 026 Spec — Decisions 1-10 LOCKED V1 (Chat Strategic 2026-05-04)

Chat strategic dedicated ADR 026 "Andura Offline Coaching Decision Tree Exhaustive" candidate spec. 10 decizii fundamentale LOCKED V1 ready compile draft full chat NEW.

**Context arhitectural confirmed:** 21 engines total (14 reactive existing preserved + 7 prescriptive NEW per §36.100). 1500-2000 ramuri = SUM agregată distribuită ACROSS engines (Periodization ~200-300 ramuri intern + Goal Adaptation ~150-250 + Bayesian Nutrition ~250-350 + Energy Adjustment ~200 + Deload + Tempo + Specialization). ADR 026 = META-arhitectură global concerns SSOT (format ramură + cross-engine merge + testing + storage), NU monolith. ADR-uri engine individuale (022/024/etc) = domain-specific only.

### §42.1 Decizia 1 — Format ramură INTERN engine: B Standard ✅ LOCKED

**Format:**
```
INPUT: {persona_signals: age, sex, kg, BF%, experience_years, goal, equipment, frequency, PRs}
CONDITION: structurat boolean tree
OUTPUT: {periodization_block, volume_landmarks, exercise_priority, intensity_zone, deload_trigger, tempo_cues}
RATIONALE: literature ref (ex: Israetel 2017 MEV/MAV/MRV) + Bugatti reasoning
CROSS_REF: ADR 023 fallback condition + ADR 018 engine module owner
```

**Rationale:** Trasabilitate audit-trail + alimentează WhyEngine + cod auto-documentat verificabil producție. Type-safe TS extensibil.

### §42.2 Decizia 2 — Granularitate condiții: Hybrid B Medium baseline + C Fine selectiv ✅ LOCKED

**Baseline B Medium:** age groups <30 / 30-45 / 45-60 / 60-70 / 70+. Sex × experience baseline rezonabil.

**Fine selectiv C pe interacțiuni critice:**
- Vârstă × Obiectiv (deload volume 65 ani slăbire vs 20 ani hipertrofie)
- Experiență × Intensitate (RIR 0 begin vs advanced)
- Sex × Volume Landmarks (femei upper body MEV/MAV/MRV pragul corect)

**Rationale push-back chat:** C Fine brute force = 7 decades × 2 sex × 3 exp × 5 goal = 210 baseline + BF + freq + equip + PRs = 30000-50000 ramuri × 21 engines = ship NEVER + hallucination risk femeie 75+ Forță advanced ZERO literature. Bugatti adevărat ≠ max everything. Peak craft *unde contează*, smart trade-offs unde NU. Total 1500-2000/engine sustained sănătos.

### §42.3 Decizia 3 — Cross-engine merge META: B Extends Arbitrator existing via Dimension Registry ADR 018 ✅ LOCKED

**Mecanism:** Engines prescriptive contribuie verdicte via Dimension Registry ADR 018 către voices temporale existing (Periodization → HISTORICAL + REALTIME + PROJECTION). Verdictele agregate intră Arbitrator 5-level Precedence + 27 reguli unchanged.

**ZERO change Arbitrator. ZERO voce nouă** (5 voices LOCKED, voice 6-th GOAL rejected §26.2 preserved).

**Slip clarificare:** Termenul "voce virtuală" propus inițial chat = REJECTED (drift conceptual periculos vs 5-voice lock). Wording corect SSOT: "engines contribuie verdicte prin Dimension Registry, NU devin voci".

**Rationale:** Arbitrator deja designed multi-source consensus. Periodization spune "3 seturi" + Discomfort reactiv "genunchi inflamat scade 2 seturi" → Arbitrator dă câștig safety mecanic automat. Determinism absolut preserved. Scutim rescriere protocol from scratch.

### §42.4 Decizia 4 — Engine spec generation order: A Periodization prima ✅ LOCKED

**Rationale:** Periodization trasează limitele maxime volum + intensitate organism susține în timp (MEV/MAV/MRV per muscle group + block periodization phase). Toate celelalte engines = filtre reglaj fin în interiorul cadrului fundamental. Goal Adaptation redistribuie. Energy fluctuates. Bayesian inference relativă la baseline Periodization.

**Order roadmap proposed:** Periodization → Goal Adaptation → Bayesian Nutrition → Deload → Energy → Tempo → Specialization.

### §42.5 Decizia 5 — ADR 026 scope: B Standardizator ✅ LOCKED

**ADR 026 conține (Global Concerns SSOT):**
- Format ramură global
- Cross-engine merge protocol (Arbitrator extends via Dimension Registry)
- Testing strategy (4-invariant safety stack — vezi §42.9)
- Storage mechanisms
- Fallback telemetry circuit breaker
- Versioning deprecation window

**ADR-uri engine individuale (022 Bayesian / 024 Goal Adaptation / etc.) conțin (Domain Concerns):**
- Formule specifice (kcal Bayesian inference)
- Logic Cut/Bulk/Maintain Goal Adaptation
- Specificități biomecanice domain

**Rationale push-back chat:** C Comprehensive monolith 200+ pagini → nimeni citește → drift IRONIC mai mare decât B. Pattern industry standard separation of concerns. Documentația scurtă clară updatable Daniel + CC Opus.

### §42.6 Decizia 6 — Storage format ramuri: B Separate `engine-name.tree.ts` data file ✅ LOCKED

**Pattern:** Logic engine în `<engine-name>.engine.ts` + data ramuri în `<engine-name>.tree.ts` separat (split logic vs data, same repo, same monorepo).

**Rationale:** Tests izolat ramuri direct + tree-shaking Vite corect + grep metadata <5ms + type-safe TS const exhaustiv + updatable repo deploy. Data NOT decoupled în JSON/Firestore (over-engineering pre-Beta, runtime swappable feature aşteaptă post-Beta dacă demand real).

### §42.7 Decizia 7 — Fallback ZERO match: Safe-baseline + CDL telemetry + 5% Circuit Breaker per segment ✅ LOCKED

**Mecanism:**
1. ZERO match input → engine returns safe-baseline coarse generic per goal/age (NU refuză NU LLM escalate runtime — păstrăm offline ZERO LLM core paths preserved §36.99).
2. CDL log injectează `fallback_triggered: true` + persona signals snapshot (telemetry passive monitoring).
3. **Circuit Breaker 5% threshold per segment Maria/Gigica/Marius** — dacă rate fallback > 5% segment → trigger Hotfix Knowledge Sprint imediat NU așteaptă cycle quarterly.

**Rationale push-back chat:** Catch-all silențios = data sit there ramuri lipsă luni. Telemetry passive = insufficient single. Circuit Breaker activ = visible alarm + actionable cadence acceleration peak readiness.

### §42.8 Decizia 8 — Versioning quarterly updates: Additive + 18 luni deprecation window V_N-2 ✅ LOCKED

**Mecanism:**
- Update Q2 2026 → V2 ramuri additive (V1 useri existing rămân unchanged mid-program)
- 18 luni deprecation window V_N-2 → după 18 luni V1 sunset, useri migrate automat la V_latest în calibration window §36.35 (NU instant rupt)
- Maintenance ceiling: max 3 versions concurrent (V_latest + V_N-1 + V_N-2 deprecated → migration). Long-tail zombie versions prevented.

**Rationale push-back chat:** Pure Additive forever = 12 versiuni active 2030 = maintenance hell. Pure Full replace = trust breach mid-mesociclu user (Bugatti F5 push-back proporțional violation). Hybrid Additive + Deprecation 18 luni = balance respect user effort + maintenance cost.

### §42.9 Decizia 9 — Testing strategy: Hibrid Property-based + Persona Suite + 4-Invariant Safety Stack ✅ LOCKED

**Strategy:**
- **Property-based** (random persona × verify output sane via invariants — breadth coverage)
- **Persona simulation suite** (Maria/Gigica/Marius scenarios fixe + edge cases curated, ~50-100 tests representative — depth coverage)
- **4 invariante imutabile mandatory pass:**
  1. Volum: V ≤ MRV per muscle group
  2. Intensitate: RIR ≥ 0 (never below failure)
  3. Frecvență: ≤ 6 sessions/week per muscle group
  4. Deload: mandatory după 4-6 weeks mesocycle

**Rationale push-back chat:** V ≤ MRV singur = miss user gaming MRV cu RIR -2 + frequency 7x = pasted check dar overall unsafe combo. Stack 4 invariants = bulletproof safety net cumulative.

### §42.10 Decizia 10 — Engine activation order runtime: Sequential + Constraint Object Floor/Ceiling Range ±15% ✅ LOCKED

**Pipeline runtime per session build:**
1. **Periodization** generează **coridor (Floor + Ceiling)** baseline (ex: 12-16 seturi pectorali săpt). NU ceiling-only.
2. **Goal Adaptation** redistribuie volume în interiorul coridorului (ex: la slăbire scade chest 12 + crește picioare 16; la hipertrofie reverse). NU trece peste Ceiling NU sub Floor.
3. **Energy Adjustment** fluctuează ±15% baseline coridorului. **Bidirectional NU only-decrease** (zile peak readiness sleep 9h + stress low + RIR bank → UP boost +15% accelerator overload progressive real). Zile fatigue → DOWN -15%.

**Constraint Object immutable** propagat engine la engine (TypeScript readonly type-safe).

**Rationale push-back chat:** Energy only-decrease = miss opportunity peak readiness zile bune. System adevărat Bugatti **harvests good days NU just survives bad ones**. ±15% range bidirectional = progressive overload accelerator când organism gata, recovery support când nu. Coridor Floor/Ceiling Periodization = safety boundary, NU rigid setpoint.

---

## §43 Next Actions Priority Order (post 2026-05-04 evening ingest)

### Priority 0 — Push origin main vault changes (Daniel approval pending)

CC Vault Hygiene Faza 3+4 commits 1-7 push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved. Post-push optional cleanup `git branch -D backup-pre-rebase-2026-05-04 && git tag -d local-state-pre-rebase`.

### Priority 1 ABSOLUT — Auth Flow §36.80 BUG 2 Firebase 401

Chat strategic dedicat + prompt CC Opus dedicat. ~1-2h Daniel + ~30-45min CC autonomous. Production blocker preserved.

### Priority 2 — ADR 026 compile draft full + 7 engines spec generation start

Chat strategic NEW dedicat. Compile ADR 026 draft full din §42 deciziile 1-10 LOCKED. Apoi start engine spec generation **Periodization first** (§42.4) (~150-300 ramuri/chat strategic dedicat × ~2-3 chat-uri pentru Periodization spec complete bottom-up persona-driven Maria→Gigica→Marius).

D2 NEW Injury/Contraindication (D2.1-D2.7 sub-decisions) + D3 NEW Don't Like + Home + Calistenice + Sport-Oriented (D3.1-D3.4 verdicts) + D1 Save the week silent — chat strategic NEW separate.

### Priority 3 long-term

ADR 022 + ADR 024 + ADR 025 full spec generation (post Periodization spec). Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal. Soft Launch.

### DIFF_FLAGS update

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow §36.80.
- **HANDOVER_GLOBAL split FLAG candidate** = file ~6200-6300 LOC post §41-§44 merge (pre-merge 6058 + ~150-200 added). Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG, >10000 LOC ESCALATE BLOCKER mandatory. Currently sub threshold — flag NU triggered.

---

## §44 Status Cumulative Post Ingest (2026-05-04 evening)

**Cumulative LOCKED count:** 90 → **100** (+10 substantive ADR 026 decisions §42.1-§42.10).

**Vault state:**
- Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE (8 recomandări A-H + Faza 4 codified)
- 26 ADR active (22 + 4 stubs G recomandare)
- 66 active vault files (51 → 66 post-stubs + ONBOARDING_SSOT_V1)
- VAULT_RULES.md §VAULT_HYGIENE_PASS rule codified Faza 4
- Cluster 10-batch foundation tests **1203/1203 PASS** unchanged
- Andura V1 prod LIVE `andura.app` ✅ unchanged
- ADR 026 spec decisions 1-10 LOCKED ready compile draft full chat NEW

---

## §45 ADR 026 Spec Session COMPLETE — 75 Decisions LOCKED V1 (chat strategic 2026-05-04 night)

### §45.1 Status: ✅ COMPLETE

Chat strategic dedicat ADR 026 spec generation (4 batches × 10 Q-uri + Engine #8 NEW + 17 refinements). Total **75 substantive decisions LOCKED V1** ready compile ADR 026 draft full + Periodization Engine spec generation start.

**Context arhitectural confirmat post-batch:**
- 22 engines total (14 reactive existing + **8 prescriptive NEW** ← META §36.100 amendment 7→8)
- ADR 026 = META-arhitectură global concerns SSOT (format ramură + cross-engine merge + testing + storage + fallback + versioning)
- Periodization Engine = §42.4 LOCKED prima spec generation (post ADR 026 compile)
- Persona priority bottom-up Maria 65 → Gigica 35 → Marius 25 (Q8 LOCKED)
- Spec generation chat split = per dimension cross-persona (Q30 LOCKED)
- Estimated effort: 3-4 chat-uri strategic Periodization spec full

### §45.2 Decisions LOCKED Batch 1 (Q1-Q10)

1. **Q1 Schema TypeScript DecisionTreeBranch — A Strict typed exhaustiv** ✅ LOCKED
2. **Q2 WhyEngine integration depth — C Hybrid tech rationale + user_friendly auto-gen spec time** ✅ LOCKED
3. **Q3 Cross-Engine conflict resolution — C Safety > pipeline order** ✅ LOCKED + Safety tier composition (4 invariants §42.9 + ADR 023 contraindication overrides; verdict rescris instantaneu Safe-baseline)
4. **Q4 Versioning lock mechanism — C Hybrid program-level lock + per-engine override selective** ✅ LOCKED
5. **Q5 Testing DoD — B Bugatti standard 4 invariants + 100 persona + 1000 property-based** ✅ LOCKED
6. **Q6 Documentation format — C Hybrid JSDoc inline ramuri + markdown narrative engine-level** ✅ LOCKED
7. **Q7 Periodization scope — B Block + Linear pre-Beta** ✅ LOCKED + Linear allocation rule (Marius 25 Beginner 0-10 sesiuni OR goal "Forță Pură" explicit; Maria/Gigica = Block always)
8. **Q8 Persona spec generation order — A Bottom-up Maria → Gigica → Marius** ✅ LOCKED
9. **Q9 Volume Landmarks SoT — A Israetel constants V1 ship scope** ✅ LOCKED + Marius mitigation UI v1.5 roadmap notification ("Funcționezi pe baseline solid. Autoregulation + Bayesian calibration ajung în v1.5.")
10. **Q10 Mesocycle length + deload trigger — C 4 weeks default + adaptive override condition-based** ✅ LOCKED

### §45.3 Decisions LOCKED Batch 2 (Q11-Q20) + 4 refinements

11. **Q11 Telemetry CDL fallback retention — B 90 zile rolling window + daily Circuit Breaker check** ✅ LOCKED
12. **Q12 Engine activation criteria runtime — B Conditional per persona × goal × session context (Specialization only conditional V1)** ✅ LOCKED + AND condition explicit (Marius 25 Advanced AND lagging body part detected via patternLearning; uniform progress NU triggers)
13. **Q13 Engine module folder structure — B Per-domain `src/engines/<name>/{engine,tree,types,tests}.ts`** ✅ LOCKED
14. **Q14 Branch ID naming convention — B Semantic hierarchical** ✅ LOCKED + BranchId TS Template Literal Type validation + pre-commit hook script Node.js + CI scan all `.tree.ts` files for ID uniqueness across ecosystem (block commit on duplicate)
15. **Q15 Deprecation user notification flow — B Notification preview T-30 SUFLET F1 + opt-in moment migrate calibration window §36.35** ✅ LOCKED
16. **Q16 Exercise selection scope — B Periodization abstract priority + alternativeEngine resolves concrete** ✅ LOCKED + JSON output format spec time `{ primary_movement_pattern, accessory_priority, compound_first, intensity_zone_target, tempo_cues }`
17. **Q17 Frequency distribution split — B Adaptive per persona × goal × frequency × equipment** ✅ LOCKED
18. **Q18 Progressive overload mechanism — B Double progression** ✅ LOCKED
19. **Q19 Muscle group taxonomy — B Standard Israetel ~11-12 groups** ✅ LOCKED + Maria 65 Dual-Layer mapping (Israetel groups → 6 functional movement patterns: push/pull/hinge/squat/carry/rotate; MEV/MAV/MRV literature anchor preserved)
20. **Q20 Failure handling skipped session — B Resume + intensity hold** ✅ LOCKED + threshold rule (3/4 sessions = counts week with progression skip; ≤2/4 = repeat week N integral) + week 1 strict 4/4 cold-start

### §45.4 Decisions LOCKED Batch 3 (Q21-Q30) + 6 refinements

21. **Q21 Mesocycle phase structure ratio — B Adaptive per persona × experience** ✅ LOCKED + Marius 5:1 dual-signal extension criteria (RIR stable 1-2 maintained 4 weeks AND Energy 🟢/🟡 dominant NU 🔴 last 3 sessions §36.82)
22. **Q22 Beginner → Intermediate transition — B Performance-based per-lift 3-consecutive** ✅ LOCKED + Linear progression failure exact definition (rep stagnation in target range OR RIR 0 hit 3 sessions consecutive same weight)
23. **Q23 Equipment substitution philosophy — B Graceful via alternativeEngine** ✅ LOCKED + edge case flag (heavy compounds bodyweight no equivalent)
24. **Q24 Special populations pre-Beta scope — B Defer to D2 chat strategic NEW** ✅ LOCKED + Safe Baseline pre-Beta concrete definition (RIR ≥ 1 universal; Maria/Gigica RIR ≥ 2 default; zero 1RM compound max-effort; Marius 25 Advanced 85% 1RM theoretic intensity cap)
25. **Q25 Plateau detection per persona — B Per-persona threshold** ✅ LOCKED + Plateau vs Regression distinction Maria 65 (plateau = goal-aligned NU triggered; regression = >15% drop baseline 2+ sesiuni consecutive triggers plateauInterventions adapted + medical flag)
26. **Q26 Off-cycle return handling — B Detraining-aware per duration** ✅ LOCKED (2-3w: 80%vol/90%int week 1; 4-6w: 60%vol/80%int week 1; 6+w: fresh mesociclu) + literature verification spec time Mujika et al / Bosquet et al
27. **Q27 Goal change mid-mesociclu — A Force complete current** ✅ LOCKED + 50% threshold rule (week 1-2 <50% complete = cancel current + apply new goal immediate; week 3-4 ≥50% = finish current + apply next mesociclu)
28. **Q28 Coaching tone Periodization output — B Inline rationale brief Q2 user_friendly reuse** ✅ LOCKED
29. **Q29 Engine performance budget runtime — B <100ms per engine + <500ms total pipeline (Google RAIL guidelines)** ✅ LOCKED + CI test enforce regression detection
30. **Q30 Spec generation chat split — B Per dimension cross-persona** ✅ LOCKED

### §45.5 Decisions LOCKED Batch 4 (Q31-Q40) + 2 refinements

31. **Q31 Warm-up protocol scope — B Separate Warm-up Engine + Periodization working sets only** ✅ LOCKED → enables Engine #8 NEW
32. **Q32 Rest periods prescription — B Per persona × intensity zone × goal** ✅ LOCKED (Maria 60-90s universal; Gigica hypertrophy 1-3 min by exercise; Marius strength 3-5 min compound heavy)
33. **Q33 Tempo prescription standards — B Persona-aware (Maria verbal cues; Gigica hybrid; Marius numeric 3-0-X)** ✅ LOCKED
34. **Q34 Exercise variation cycling — C Per-persona adaptive** ✅ LOCKED + Gigica hybrid rule explicit (1-2 exercises swap × every 2 mesocycles, NOT all NOT every cycle)
35. **Q35 Session duration constraints — B Engine adapts to user time available** ✅ LOCKED (15/30/45/60/90 min input T2+ profile typing; engine prioritizes top-down compound → priority isolation → optional accessories)
36. **Q36 Multi-goal users handling — A Single primary goal V1 pre-Beta** ✅ LOCKED + UI roadmap notification onboarding ("Optimizarea pentru obiective multiple ex Cardio + Hipertrofie simultan disponibilă din v1.5")
37. **Q37 Asymmetry handling — B Defer post-Beta v1.5** ✅ LOCKED
38. **Q38 Periodization-Cut overlap — B Phase-agnostic Periodization + Goal Adaptation redistribuie within Floor/Ceiling §42.10** ✅ LOCKED
39. **Q39 Exercise order within session — B Per persona × goal** ✅ LOCKED (Maria functional/mobility first; Gigica/Marius compound first)
40. **Q40 RIR vs full data tracking input — C Tier-based RIR universal verbal + actual reps/weight tracked silent UI + bar speed opt-in Marius** ✅ LOCKED

### §45.6 Engine #8 Warm-up & Mobility Engine LOCKED V1 NEW

**META §36.100 AMENDMENT: 7 → 8 prescriptive engines** (22 engines total = 14 reactive + 8 prescriptive). Cumulative LOCKED count adjustment.

**Decizii Engine #8 LOCKED V1:**

1. **Scope strict pre-Beta** — activare neuromusculară universal + mobility general ONLY (NU corrective therapy, NU biomechanical limitations individuale; medical-adjacent → D2 v1.5 defer Q24 pattern)
2. **Pipeline placement §42.10 sequential extension:**
   ```
   Periodization → Goal Adaptation → Energy → Exercise Selection → Warm-up & Mobility → Execution
   ```
3. **Persona thresholds pre-Beta:**
   - Maria 65: rutină blândă activare articulară 5-10 min (mobility flow + bands light)
   - Gigica 35: warm-up general dynamic 5 min + 1 set ușor ramp pe primul exercițiu
   - Marius 25: ramp protocol heavy compounds (50%/70%/90% × 3-5 sets) + general warm-up minimal
4. **Pre-Beta MANDATORY** (Bugatti injury safety > scope discipline; ~50-80 ramuri V1 universal patterns; +1-2 chat-uri strategic spec generation post-Periodization)
5. **Instant Skip principle** (§36.94 ADR 025 "Andura Gândește pentru User" / Graceful Degradation Universal pattern reuse):
   - Default T0 skip → engine auto-calculates ramp-up sets integrated în first exercise (ZERO friction, ZERO ecran suplimentar)
   - T1+ Profile Typing: opt-in expanded warm-up routine
   - In-session toggle: "skip warm-up" button = engine collapse to ramp-up sets only

**Cooldown decision Q-final:** **C Defer post-Beta v1.5** (skip pre-Beta entirely, user self-managed; UI footer optional "Cooldown routines coming v1.5"). Engine #8 = strict Warm-up & Mobility pre-Beta.

### §45.7 Light Flags LOCKED V1 (tactic spec time)

- **Maria 65 deload protocol differential** — week deload = volume 50% reduction, intensity preserved, NU complete rest (literature: Galvão 2010 + Fragala 2019 elderly resistance training recovery)
- **Q16 JSON output format spec time** — `{ primary_movement_pattern, accessory_priority, compound_first, intensity_zone_target, tempo_cues, rest_period_seconds }` (extension Q32 + Q33 LOCKED)

### §45.8 Cumulative LOCKED count update

**Pre-session:** 100 LOCKED V1
**Post-session ADR 026 spec:** **175 LOCKED V1** (+75 substantive decisions: §42.1-§42.10 base + Q1-Q40 + 17 refinements + Engine #8 + cooldown + light flags)

---

## §46 Next Actions Priority Order (post 2026-05-04 night ingest)

### Priority 0 — Push origin main vault changes (Daniel approval pending)

CC ADR 026 spec session ingest commits push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved.

### Priority 1 ABSOLUT — Auth Flow §36.80 BUG 2 Firebase 401 (preserved separat)

Chat strategic dedicat tactic + prompt CC Opus dedicat. ~1-2h Daniel + ~30-45min CC autonomous. Production blocker preserved.

### Priority 2 — ADR 026 COMPILE DRAFT FULL + Periodization Engine spec generation start

Chat strategic NEW dedicat. **75 decisions LOCKED V1 ADR 026 spec ready compile draft full** in `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (replace candidate stub). Apoi start Periodization Engine spec generation **per dimension cross-persona** (Q30 LOCKED) — chat 1 Volume Landmarks all 3 persona, chat 2 Frequency Distribution all 3, chat 3 Progressive Overload all 3, chat 4 Mesocycle Structure all 3 (~3-4 chat-uri estimative).

### Priority 3 — D2 NEW + D3 NEW + D1 chat strategic NEW separate

D2 NEW Injury/Contraindication Mapping (D2.1-D2.7 sub-decisions) + D3 NEW Don't Like + Home + Calistenice + Sport-Oriented (D3.1-D3.4 verdicts) + D1 Save the week silent.

### Priority 4 long-term

ADR 022 + ADR 024 + ADR 025 full spec generation post Periodization spec. Engine #8 Warm-up & Mobility spec generation post Periodization spec (~1-2 chat-uri ramuri ~50-80). Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal. Soft Launch.

---

## §47 Alignment Questions Generation Rule LOCKED V1 (NEW)

**Status:** LOCKED V1 (codified 2026-05-04 night per Daniel directive — anti-recurrence pre-fed verbatim format).

**Authority:** SSOT pentru generation alignment questions post oricărui handover ingest. Trigger: mandatory step §HANDOVER_PROTOCOL step 9.

### §47.1 Why this rule exists

CC Opus default behavior la generate `ALIGNMENT_QUESTIONS_CHAT_NEW.md` poate produce 2 formate distincte:
- **Forma 1 (DEPRECATED):** Pre-fed verbatim — Q + citation + răspuns verbatim pre-scris
- **Forma 2 (LOCKED V1):** Search-driven — Q + search keywords + citation expected + PASS criteria, chat strategic NEW OBLIGAT să caute în Project Knowledge și să producă extract real

Forma 1 = chat strategic NEW recită pre-fed răspuns fără să verifice realitate vault → halucinație risc + zero validation actual SSOT alignment. Forma 2 = chat strategic NEW navighează vault SSOT autonomous + Daniel spot-check verbatim match.

### §47.2 Mandatory format

CC Opus MUST genera `ALIGNMENT_QUESTIONS_CHAT_NEW.md` exclusiv în format SEARCH-DRIVEN cu structura:

```markdown
## Q[N]: [Întrebare scurtă]

**Search keywords:** `"keyword1"` SAU `"keyword2"` SAU `"keyword3"`

**Citation expected:** `path/to/file.md` §X + cross-confirm `secondary_path.md`

**PASS criteria:**
- Confirm [literal cuvânt/cifră from vault]
- Listă [structură expected, ex: 8 recomandări A-H, 4 invariante]
- Confirm [verbatim phrase X "..."]
```

### §47.3 DEPRECATED format (NU mai folosi)

Pre-fed verbatim cu sub-section `**Răspuns verbatim:** "..."` care recită pre-scris answer = DEPRECATED. CC Opus MUST NOT genera acest format under any circumstances post 2026-05-04.

### §47.4 Pass / Fail Criteria pentru chat strategic NEW

| Score | Status | Action |
|-------|--------|--------|
| 12/12 | EXCELLENT | Search-driven verification full PASS — chat poate naviga vault SSOT autonomous. PROCEED. |
| 10-11/12 | PASS | PROCEED, flag specific Q-uri missed pentru re-sync targeted dacă material critical. |
| <10/12 | FAIL | RE-SYNC mandatory: chat strategic NEW NU navighează vault corect. Re-paste alignment questions după sync sau regenerare handover dacă SSOT incomplete. |

**Daniel spot-check post-paste mandatory:** chat NEW search rezultate vs response chat → mismatch verbatim sau citation eronat = FAIL Q.

### §47.5 Cross-refs amendments

`VAULT_RULES.md` §HANDOVER_PROTOCOL step 9 amendment + `PROMPT_CC_HYGIENE.md` §9 amendment + memory rule #22 amendment (Daniel chat side). CC Opus la fiecare ingest comandă "Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL" trebuie să respecte format search-driven STRICT.

---

## §48 DIFF_FLAGS Update (post 2026-05-04 night ingest)

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow §36.80.
- **HANDOVER_GLOBAL split FLAG candidate** = file post-merge §45-§47 estimated ~6500-6700 LOC (pre-merge ~6243 + ~250-400 added). Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG, >10000 LOC ESCALATE BLOCKER. Currently sub threshold — flag NU triggered but approaching. Recommend monitor next handover.
- **Engine #8 Warm-up & Mobility NEW** — flag in `INDEX_MASTER.md` engines section update + ADR 026 cross-ref + roadmap pre-Beta MANDATORY new entry.

---

## §49 Verification Questions Topics For Next Chat

**CC Opus MUST generate alignment questions search-driven format §47 LOCKED V1 din topics below. NOT pre-fed verbatim answers.**

**Suggested 12 Q-uri topics covering §45-§48:**

- Q: §45.2 Batch 1 (Q1-Q10) verbatim decisions LOCKED V1 + 5 refinements (Linear allocation rule + Marius mitigation UI v1.5 roadmap + Safety tier composition)?
- Q: §45.3 Batch 2 (Q11-Q20) verbatim decisions LOCKED V1 + 4 refinements (Specialization AND condition + BranchId build-time uniqueness + Maria 65 Dual-Layer mapping + 3/4 threshold rule)?
- Q: §45.4 Batch 3 (Q21-Q30) verbatim decisions LOCKED V1 + 6 refinements (Marius 5:1 dual-signal + Linear progression failure definition + Safe Baseline pre-Beta concrete + Plateau vs Regression Maria + 50% threshold goal change + detraining percentages)?
- Q: §45.5 Batch 4 (Q31-Q40) verbatim decisions LOCKED V1 + 2 refinements (Gigica hybrid rotation rule + UI roadmap notification)?
- Q: §45.6 Engine #8 Warm-up & Mobility LOCKED V1 + META §36.100 amendment 7→8 + 5 sub-decisions (scope + pipeline + persona thresholds + pre-Beta MANDATORY + Instant Skip principle)?
- Q: §45.6 Cooldown decision C defer post-Beta v1.5?
- Q: §45.7 Light flags Maria 65 deload 50% volume + Q16 JSON output format?
- Q: §45.8 Cumulative LOCKED count 100 → 175?
- Q: §46 Next Actions priority order Priority 0/1/2/3/4?
- Q: §47 Alignment Questions Generation Rule LOCKED V1 search-driven format mandatory + DEPRECATED pre-fed?
- Q: §48 DIFF_FLAGS Engine #8 NEW + HANDOVER_GLOBAL split flag approaching threshold?
- Q: ADR 026 spec session ready compile draft full + Periodization Engine spec generation start per dimension cross-persona Q30 LOCKED?

---

## §50 D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED V1 (chat strategic 2026-05-05 morning) — 41 substantive net

### §50.0 Status: ✅ COMPLETE

Chat strategic dedicat sub-decisions D3.1 (Buton "Nu vreau") + D4 NEW (Mid-Session Resume Protocol) + D2 (Injury/Contraindication Mapping) + D1 (Save the Week Silent). Total **41 substantive sub-decisions LOCKED V1** ready compile ADR 026 draft full chat strategic NEW dedicat.

**Context arhitectural confirmat:**
- D3.1 + D4 + D2 + D1 = sub-decisions ortogonale față de spec engine Periodization (§42.4 prima spec generation post ADR 026 compile)
- Toate 4 clusters integrate ADR 026 când chat strategic NEW dedicat compile draft full
- Naming distinction LOCKED: "Circuit Breaker population fallback 5%" (§42.7) vs "User adaptation signal 50%" (D1 Q7 individual user pattern)
- Pattern reuse extensiv: Q20 LOCKED 3/4 threshold (§45.3) reused în D4 Q7+Q8 + D1 Q2+Q3; §42.7 Circuit Breaker reused în D3.1 Q10 + D1 Q7; §42.9 Safety tier extended cu invariant 5 "Medical Safety" în D2 Q7

### §50.1 D3.1 Buton "Nu vreau" SUB-DECISIONS LOCKED V1 (10 Q + 3 refinements = 13 sub-decisions)

**Parent:** §36.107 D3.1 LOCKED PRE-BETA mandatory (rationale SUFLET F5).
**D3.1.1 LOCKED V1 pre-existing** (3 butoane up-front + 3 categorii semantic Maria 65 frictionless): Nu vreau (Contextual / no-memory) + Nu am chef (Psihologic / no-memory) + Nu pot (Mecanic-Fizic / blacklist permanent cross-session).

#### §50.1.1 Q1 Storage layer "Nu pot" blacklist — B Firestore sync ✅ LOCKED

Asigură consistența datelor multi-device (telefon + tabletă). Blacklist persistent salvat direct Firestore (deja live prod). Cross-device consistency Maria 65 critical.

#### §50.1.2 Q2 Schema JSON shape — B Object `{ exerciseId: { timestamp, intent } }` ✅ LOCKED

Single Source of Truth în format obiect. Timestamp = trasabilitate completă + permite curățare automată "Nu vreau"/"Nu am chef" (no-memory) sau analiză istoric refuzuri.

#### §50.1.3 Q3 Sync multi-device "Nu pot" — B Eventual consistency on session start ✅ LOCKED

Offline-first §36.99 preserved. Sync background la deschidere app, fără real-time listeners (NU CPU/battery overhead).

#### §50.1.4 Q4 Substitute primary match criteria — B Same muscle + movement pattern ✅ LOCKED

Push/pull/hinge/squat patterns. Equipment handle separat alternativeEngine ADR 023 (NU dublu work).

#### §50.1.5 Q5 Re-roll după 2 refuzuri consecutive — B 3 fresh batch + Hard Cap ✅ LOCKED

Listă nouă 3 exerciții după refuze 2 alternative. **Hard Cap LOCKED V1 refinement:** maximum 2 re-rolls = 1 primary + 2 alt + 3 fresh batch = 7 încercări total. La epuizare → fallback Q7 A (skip exercise + log telemetry CDL refuse pattern). Anti decision fatigue + anti infinite loop.

#### §50.1.6 Q6 Substitute persistence intra-mesociclu — B Lock primary substitute pe durata mesociclului + Sub-decision Unlock ✅ LOCKED

Substitute acceptat = lock pe restul săpt mesociclu (asigură progressive overload week-to-week + tracking volume corect). **Sub-decision Unlock LOCKED V1 refinement:** Dacă week 2 user dă "Nu vreau"/"Nu pot" pe substitute lock-uit → unlock + new resolver round; volume tracking continuă la nivel grup muscular (§42.10 Periodization Engine), NU restart mesociclu integral. Mapare muscle-group-level confirmed (NU exerciseId specific).

#### §50.1.7 Q7 Edge case ZERO substitute viable — A Skip exercise + log telemetry ✅ LOCKED

Caz extrem (deadlift heavy compound, alternative epuizate). Skip exercise + Circuit Breaker 5% threshold §42.7 reuse pentru raportare telemetrie.

#### §50.1.8 Q8 "Nu vreau"/"Nu am chef" reset window — A Imediat next session (zero memory) ✅ LOCKED

Per D3.1.1 LOCKED "no-memory next session". Preserves user agency, NU paternalism. State butoane reset complet next session, motorul sugerează din nou mișcările dacă optime.

#### §50.1.9 Q9 "Nu pot" Settings UI shape — A Listă simplă + unblock button per item ✅ LOCKED

Maria 65 frictionless minimalistă. Greșeală tap "Nu pot" → reintroduce mișcare 1 tap unblock. NU overengineering pre-Beta (B/C scope creep).

#### §50.1.10 Q10 Telemetry CDL track refuzuri — B Aggregate count per exerciseId silent ✅ LOCKED

CDL passive §42.7 pattern reuse. Circuit Breaker trigger Knowledge Sprint dacă rate refuzuri high segment. Per intent type ratio (Nu vreau/Nu am chef/Nu pot) = scope creep deferred post-Beta.

#### §50.1.11 D3.1.6 NEW Pattern Detection Passive (Prevenirea Iritării) ✅ LOCKED V1

**Regulă asistență cognitivă:** Deși zero-memory la nivel sesiune (Q8), sistemul monitorizează în fundal user refuzuri consecutive aceeași exercițiu **3-5 ori** prin "Nu vreau"/"Nu am chef".

**Acțiune UI:** Soft prompt discret: "Observăm că eviți acest exercițiu. Vrei să-l excluzi permanent din program?" + scurtătură directă Setări → Exerciții Excluse. Decizie finală 100% control utilizator. NU auto-blacklist (paternalism). Bugatti F4 cognitive friction anticipată.

### §50.2 D4 NEW Mid-Session Resume Protocol SUB-DECISIONS LOCKED V1 (10 Q + D4.2.1 NEW = 11 sub-decisions)

**Parent:** NEW topic deschis 2026-05-02 Daniel (DEFERRED). Cross-ref: §36.55.4 LOCKED abandoned session neutral streak (related, distinct scope).

#### §50.2.1 Q1 Auto-save granularity (D4.1) — A Per set logged silent IndexedDB ✅ LOCKED

Salvare automată în fundal la fiecare set încheiat. Fricțiune zero, în caz închidere forțată NU se pierde niciun set valid.

#### §50.2.2 Q2 Storage layer auto-save — A IndexedDB ✅ LOCKED

Offline-first §36.99 preserved. Capacity OK pentru session state. Evită limite localStorage + nu consumă baterie ca real-time sync.

#### §50.2.3 Q3 Sync Firestore timing — B On session complete ✅ LOCKED

Sesiunea locală trimisă cloud DOAR la "Încheie antrenamentul". Protejează traffic data + battery în timp efort.

#### §50.2.4 Q4 Resume prompt UX (D4.2) — A Dialog blocking imediat la app open ✅ LOCKED

Modal blocking deschidere app cu sesiune întreruptă. Maria 65 decide clar: Reia / Începe nouă / Marchează completă. Zero ambiguitate, NU elemente ascunse.

#### §50.2.5 Q5 Resume prompt actions — A 3 opțiuni (Reia / Începe nouă / Marchează completă) ✅ LOCKED

Per spec D4.2. "Marchează completă" critical pentru sesiune ~80% terminată user uitat să închidă (își amintește ore mai târziu).

#### §50.2.6 D4.2.1 NEW Filtrarea Dialogului Blocant pe Threshold ✅ LOCKED V1

**Regulă:** Eliminăm fricțiune cognitivă pentru sesiuni vechi abandoned. Sistem împarte scenarii pe threshold t=6h:

| Scenariu | Condiție Timp | Acțiune Backend | Impact UI |
|----------|---------------|-----------------|-----------|
| **Sesiune Recuperabilă** | Δt ≤ 6h ultima activitate | Stare IndexedDB intactă | Dialog blocking imediat: Reia / Închide / Începe nouă |
| **Sesiune Abandonată** | Δt > 6h ultima activitate | Auto-marked abandoned background (Silent Cleanup) + neutral streak §36.55.4 | Zero prompt UI: user intră direct app (Suflet, istoric, setări) fără întrerupere |

**Bugatti F4 anticipează:** Maria 65 vine să citească Suflet → NU dau dialog despre antrenament de ieri uitat. Sesiune abandoned >threshold = sistem decide silent, NU întreabă.

#### §50.2.7 Q6 Timeout abandon threshold (D4.3) — B 6h ✅ LOCKED

Permite pauze realiste zi (muncă, urgențe, drumuri). Întrerupere >6h = abandonare completă zi mental + fiziologic.

#### §50.2.8 Q7 Engine treatment partial session §42.10 (D4.4) — B Credit parțial proporțional (reuse §45.3) ✅ LOCKED

Aplică direct regula matricei volum existing:
- **Efort per exercițiu ≥ 50% seturi → exercițiul contorizat**
- **Efort per sesiune ≥ 3/4 exerciții → săptămâna completă (cu skip progresie)**
- **Sub praguri → repetare săptămână N integral**

Reuse Q20 LOCKED 3/4 threshold rule §45.3. NU duplicate logic, extend pattern existing.

#### §50.2.9 Q8 Impact partial session deload trigger Q10 mesocycle — C Count cu intensity hold next ✅ LOCKED

Săptămâna parțială contorizată în ciclu 4-săpt deload. Next session intensitate înghețată nivel anterior pentru evitare risc accidentare/supraantrenament. Reuse Q20 LOCKED "Resume + intensity hold" pattern.

#### §50.2.10 Q9 Scenarii A/B/C handler (D4.5) — B Unified state machine 3 entry points ✅ LOCKED

Single source resume logic, 3 entry points:
- A Background restore (app în background / lock screen seamless resume)
- B IndexedDB recovery (force kill / restart / baterie moartă)
- C localStorage offline persistence (offline mid-set până reconectare)

Același reducer central. NU duplicate code drift risk. Codul nu se duplică, riscul erori scade la zero.

#### §50.2.11 Q10 Crash mid-set recovery edge — A Last completed set saved + current incomplete discarded ✅ LOCKED

Stare date perfect curată, fără estimări/date parțiale corupte. User încredere totală istoric afișat. Reintroducere set <30s if needed = trust > false memory.

### §50.3 D2 Injury/Contraindication Mapping SUB-DECISIONS LOCKED V1 (10 Q + 3 sub-decisions D2.3 = 13 sub-decisions)

**Parent:** §36.107 D2 LOCKED PRE-BETA mandatory + Q24 Safe Baseline pre-Beta (§45.4 +RIR ≥ 1 universal + Marius 25 Advanced 85% 1RM cap) + Safety tier composition Q3 (§45.2 +4 invariants §42.9 + ADR 023 contraindication overrides).

**Topic critic:** MOAT real Andura, intersect Safety tier §42.9 + ADR 023 contraindication overrides. Gigel test brutal aici (Maria 65 hernie disc).

#### §50.3.1 Q1 Scope intake injuries onboarding — B Preset list (~15-20 condiții comune) ✅ LOCKED

Listă fixă opțiuni clare (lumbar, knee, shoulder, hypertension, cervicale, etc.). Elimină risc parsare greșită text liber + halucinație contraindication LLM. Maria 65 frictionless bifează zonă sensibilă. Expand quarterly Knowledge Sprint.

#### §50.3.2 Q2 Severity grading per condition — B 3-tier (ușor/moderat/sever) ✅ LOCKED

- **Sever** → Blacklist permanent pe tiparul mișcare afectat
- **Moderat** → Plafonare automată intensitate (RIR ≥ 2, max 75% 1RM)
- **Ușor** → Monitorizare pasivă fără modificări agresive volum

Maria 65 cognitive simple. Engine map → exercise filter strict per tier.

#### §50.3.3 Q3 Contraindication source authority — C Curated subset + literature ref per condition ✅ LOCKED

Bază date internă Andura curatoriată + referințe literatură specialitate per condiție. Rigoare științifică maximă + transparență totală. Evită "sfat medical nesolicitat" liability.

#### §50.3.4 D2.3.1 Sursa V1 — C Public guidelines NSCA + ACSM + Daniel curate subset ✅ LOCKED V1

Standardizare publică oficială. Cost 0. Audit-trail public sources = legal defense layer real + rigor max. Daniel curate subset relevant Andura V1.

#### §50.3.5 D2.3.2 Update cadence — Quarterly unified Knowledge Sprint ✅ LOCKED V1

Actualizări medicale exclusiv Knowledge Sprint general pre-Beta. Anti scope creep clar. NU separate medical-specific cadence.

#### §50.3.6 D2.3.3 Disclaimer UI legal cover — Mandatory consent onboarding + per-condition disclaimer ✅ LOCKED V1

Onboarding consent text + per-condition disclaimer "informații generale, NU înlocuiește consult medical; consultă medic specialist". Audit legal §46 P4 prerequisite anyway, codify acum lock.

#### §50.3.7 Q4 Pain mid-session real-time handling — A New D2 button "Mă doare" (separat de D3.1 "Nu pot") ✅ LOCKED

**Semantic distinct critical:**
- **"Nu pot"** (D3.1) = mecanic anticipat onboarding/pre-session = blacklist permanent muscle pattern
- **"Mă doare"** (D2 NEW) = acut mid-set = STOP exercise + log severity + propose alt + flag follow-up next session "Mai doare?"

Gigel test pass: Maria 65 simte durere acută NU vrea săpt blacklist, vrea STOP acum + reia mâine.

#### §50.3.8 Q5 "Mă doare" severity input — B 3-tier (ușor/moderat/sever) cu auto-action ✅ LOCKED

- **Ușor** → continue cu RIR+1 cap
- **Moderat** → skip exercise + alt
- **Sever** → STOP session + flag medical mention "consultă specialist"

NU paternalism direct medical advice (Gigel test). NU diagnosis.

#### §50.3.9 Q6 Cross-session memory "Mă doare" — C Permanent blacklist după 2-3 incidente ✅ LOCKED

Pattern detection passive Bugatti F4. Stricter threshold safety-critical (vs D3.1.6 "Nu vreau" 3-5x). 2-3 incidents same exercise → soft prompt UI "Excludem permanent? Pare să-ți facă rău consistent". User decide final.

#### §50.3.10 Q7 Contraindication override Safety tier composition Q3 — C Tier separat 5th invariant "Medical Safety" (Floor Absolut) ✅ LOCKED

**Sub-extension §42.9:** 5th invariant "no contraindicated exercise" deasupra current 4 invariants. Indiferent volumul optim (V≤MRV) calculat motoarele prescriptive, dacă exercise contraindicat mecanic → eliminat fără drept apel.

**Rationale:** V≤MRV doesn't matter dacă exercise = hernie disc kill. Medical safety = absolute floor, NU competing cu volume/intensity logic.

#### §50.3.11 Q8 Pregnancy handling pre-Beta — A Defer post-Beta v1.5 ✅ LOCKED

Per Q24 LOCKED Special populations Defer D2 (§45.4). Pregnancy = liability + literature complex per trimester. Pre-Beta scope discipline. UI roadmap onboarding notification "Optimizarea pentru sarcină va fi disponibilă în v1.5".

#### §50.3.12 Q9 Recovery from injury re-introduction — C Hybrid manual primary + soft prompt 4-6 săpt ✅ LOCKED

User manual unblock Setări (like D3.1.5) primary. Plus soft prompt 4-6 săptămâni post-incident "Vrei să reintroducem [Exercițiu] în program pentru testare stare?". Bugatti F4 cognitive: Maria 65 uită unblock; soft prompt anticipează. NU auto re-introduce (paternalism + medical liability).

#### §50.3.13 Q10 Telemetry CDL injuries pattern — A NU track (privacy strict medical pre-Beta) ✅ LOCKED

GDPR sensitive medical data pre-Beta = legal nightmare. Pre-Beta zero stocare cloud istoric dureri/condiții fizice. Procesare local exclusiv. Monitorizare anonimizată cloud amânată v1.5 după audit legal complete (§46 P4 prerequisite).

### §50.4 D1 Save the Week Silent SUB-DECISIONS LOCKED V1 (7 Q = 7 sub-decisions)

**Parent:** §36.107 D1 OPENED FOR DISCUSSION → LOCKED V1 acum. Pattern §36.55.4 abandoned session neutral streak reuse + §45.3 Q20 3/4 threshold rule reuse.

#### §50.4.1 Q1 Trigger condition — C Silent default ✅ LOCKED

Zero fricțiune. NU prompt-uri administrative sau confirmări manuale. Dacă prag sesiuni atins, săptămâna salvată automat fundal, streak-ul nu rupt.

#### §50.4.2 Q2 Threshold sessions completed required — A 3/4 sesiuni planificate ✅ LOCKED

Reuse Q20 LOCKED §45.3 threshold rule pentru consistency logic periodizare. User planifică 4 sesiuni + finalizează 3 → prag atins automat.

#### §50.4.3 Q3 Streak treatment week saved — C Counts cu progression skip ✅ LOCKED

Streak salvat. Săptămâna următoare îngheață parametri intensitate + volum. Protejează user de supraîncărcare la revenire după săpt parțială. Reuse Q20 LOCKED "Resume + intensity hold" pattern.

#### §50.4.4 Q4 UI feedback la save silent — B Subtle micro-copy în istoric ✅ LOCKED

Evită notificări invazive. Text "Săptămână salvată (3/4 sesiuni)" apare discret DOAR ecran istoric pentru transparență. Bugatti F1 user-language clear.

#### §50.4.5 Q5 Edge case 4/4 weeks consecutive cu 3/4 sesiuni — B Maximum 2 saved weeks consecutive ✅ LOCKED

A 3-a săptămână consecutivă cu ≤3/4 sesiuni → repetare integrală săptămâna N. Anti-drift volume calibration. 3 weeks @ 3/4 = volume calibration shifts subtle; max 2 = realistic life buffer dar engine recalibrate.

#### §50.4.6 Q6 Goal change interaction Q27 50% threshold rule — B Save week aplicat prima, goal change next mesocycle ✅ LOCKED

Logică cronologică: săpt curentă închisă conform plan existent + nou obiectiv intră vigoare start următor mesociclu. NU dublu logic same week.

#### §50.4.7 Q7 Telemetry CDL save week pattern — C Track + Circuit Breaker reuse §42.7 ✅ LOCKED

**Naming distinction LOCKED V1 (clarification compile ADR 026):**
- **Circuit Breaker population fallback 5%** (§42.7) — rate fallback cross-population trigger Knowledge Sprint hotfix
- **User adaptation signal 50%** (D1 Q7 individual) — user save weeks rate >50% trigger T1+ Profile Typing adaptation v1.5

Două thresholds distincte. NU paternalism intervention; passive monitoring → engine adapt frequency suggestion T1+ Profile Typing v1.5.

---

## §51 Cumulative LOCKED Count Update (post 2026-05-05 morning ingest)

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
- **HANDOVER_GLOBAL split FLAG approaching/AT threshold** = file post-merge §50-§55 estimated ~6900-7100 LOC (pre-merge 6448 + ~250-450 added §50-§55). Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG, >10000 LOC ESCALATE BLOCKER. **Recommend FLAG triggered acum dacă cifră actuală post-merge crosses 7000, plan split next handover concrete.** Verify actual LOC post-merge în VAULT_HYGIENE_PASS auto-trigger.
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

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW. Cumulative 216 LOCKED V1 post §50-§55 ingest. ADR 026 compile draft full ready 126 decisions chat strategic NEW Priority 2. Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE preserved. Auth Flow §36.80 Priority 1 ABSOLUT preserved separat. HANDOVER_GLOBAL split FLAG triggered approaching/AT threshold — plan split concrete next handover. D3.2-D3.4 + Engine #8 sub-decisions deferred Priority 4 chat strategic NEW separate.**

**Andura needs to be the best. ✊**
