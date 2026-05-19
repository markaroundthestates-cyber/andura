# HANDOVER INPUT — Auth Flow §36.80 Batch 1-6 + Closure (63 LOCKED V1)

**Date:** 2026-05-04 evening (post §56-§61 ingest + alignment 12/12 EXCELLENT)
**Source:** Chat strategic Daniel + Claude — 63 substantive sub-decisions LOCKED V1 acoperind Auth Flow refinements + Engine #8 Warm-up/Cool-down + Periodization defaults + RPE/RIR UX + Beta mechanics + Safety/Compliance + Notifications/Distribution.
**Cumulative:** 243 LOCKED V1 (post §56-§61) → **306 LOCKED V1** (+63 substantive net post-overlap).
**Authority:** Extends ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 + introduces Engine #8 spec sub-decisions + Periodization spec partial + Beta mechanics LOCKED V1.
**Cross-ref source:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.1-§56.19 + `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04.

---

## §62 BATCH 1 — Architecture & Process Decisions (10 LOCKED)

### §62.1 Email infrastructure `suport@andura.app` — Forward Daniel personal Gmail (Option A) ✅ LOCKED

MX records Namecheap → forward Daniel personal Gmail gratuit. ZERO Google Workspace ($6/lună rejected). ZERO temp gmail rejected. Pre-Beta 50 testeri scale-fezabil. Cross-ref §56.18.2 confirmation.

### §62.2 HANDOVER_GLOBAL split strategy — Thematic split (Option B) ✅ LOCKED

DIFF_FLAGS HANDOVER_GLOBAL split FLAG TRIGGERED 7214 LOC > 7000 threshold. Strategy LOCKED: thematic split (auth/engine/onboarding fișiere separate), NU chronological cut, NU __resolved__ folder dedicated. Cross-refs migration plan ~50+ wikilinks reference HANDOVER_GLOBAL §X — sweep + rewire required next chat strategic dedicat. Backup tag pre-split mandatory: `git tag pre-handover-split-2026-05-04-evening`.

### §62.3 CC Opus Auth Flow §36.80 implementation order — Phased (Option B) ✅ LOCKED

NU Big Bang single prompt all ~10 fișiere. Phased: firebase.js → auth.js → pages/auth.js → rest. Reduces blast radius per phase + intermediate validation gates. CC Opus prompt structure post-Daniel-manual-prep prerequisites complete.

### §62.4 Privacy Policy V1 Beta — Lock as-is template §56.8.2 ✅ LOCKED

`01-vision/PRIVACY_POLICY_V1_BETA.md` 5 puncte verbatim §56.8.2 LOCKED V1. Daniel validate sprint pre-Beta confirmat. Audit legal complet defer v1.5 (§46 P4 prerequisite).

### §62.5 ToS V1 Beta — Lock as-is template §56.8.3 ✅ LOCKED

`01-vision/TERMS_OF_SERVICE_V1_BETA.md` 4 puncte verbatim §56.8.3 LOCKED V1. Daniel validate sprint pre-Beta confirmat. Liability waivers absolute REJECTED preserved (RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83).

### §62.6 Firebase Email Template Magic Link RO — Lock as-is ✅ LOCKED

Subject: "Link-ul tău de acces în Andura". Body: brand Andura custom. Daniel manual setup Firebase Auth Console pre-CC.

### §62.7 Beta launch gate — Decalare oficială Quality > Speed default (Override §56.9.2) ✅ LOCKED

**OVERRIDE:** §56.9.2 "1 ianuarie 2027 optimistic" → **decalare oficial Quality > Speed default, target flexible**. NU forced 1 ian 2027 deadline. Septembrie 2026 testare Beta dacă șlefuire necesară = decalare fără ezitare. Cross-ref §36.83 META-RULE Prebeta Scope Expansion preserved.

### §62.8 Logout modal wording — Lock as-is §56.12.1 ✅ LOCKED

"Ești sigur că vrei să te deconectezi? Va trebui să te autentifici din nou pentru a-ți vedea datele." Anti-tap-accidental Maria 65 preserved.

### §62.9 Cleanup A weekly script trigger — Reminder Calendar duminică manual (Option A) ✅ LOCKED

NU cron automated Windows. NU skip. Daniel manual reminder Calendar duminică ~5min `admin-cleanup.js` rule. Pre-Beta 50 testeri scale-fezabil. Cross-ref §56.14.1 preserved.

### §62.10 Cleanup C Cloud Function v1.5 trigger — Manual Daniel decision retrospectiva post-Beta (Option B) ✅ LOCKED

NU auto-trigger Beta scale >X users. NU skip definitiv. Manual Daniel post-Beta retrospectiva = data-driven decision: volum real → justify Blaze plan upgrade pentru Cloud Functions SAU retain hibrid (manual A + client-side B sufficient). Cross-ref §56.14.3 update.

### §62.X META — Review Division of Labor LOCKED V1 ✅ LOCKED (workflow general impact)

Pattern LOCKED: text-heavy/legal artifacts (Privacy Policy, ToS, wording UI mass, copy beta) = review cross Claude + Gemini. Daniel rămâne pe ce DOAR el poate face: decizii strategice + hands-on tehnic (Firebase Console, MX setup, prompts CC, manual prep). Daniel = final approve + spot-check minimal post-review. Anti-bottleneck Daniel-time. Cross-ref MEMORY persistent rule new.

---

## §63 BATCH 2 — Onboarding & Conversion (10 LOCKED)

### §63.1 Onboarding T0 question order — Obiectiv first hook motivațional (Option B) ✅ LOCKED

Order: obiectiv → vârstă → sex → istoric medical simplu → frecvență. NU vârstă-first administrative plictisitor. Maria 65 captivată hook motivațional din prima atingere. Cross-ref §56.3.2 update inline.

### §63.2 Auth-banner-soft trigger — Imediat post-T0 plan generated (Option A) ✅ LOCKED

Banner "Salvează contul" apare imediat post Investment Phase plan T0 generat. User vede valoarea imediată + commitment crescut salvare profil. Cross-ref §56.3.1 confirm + §56.1.1.

### §63.3 Auth-banner-soft dismiss behavior — "Nu acum" explicit + reapariție 3 sesiuni (Option C) ✅ LOCKED

Buton explicit "Nu acum" dismiss. Reapariție după **3 sesiuni de antrenament finalizate complet (logged workout)** — NU app-open count. High commitment threshold ~3 săptămâni Maria 65 frecvență 2x/săpt. NU sâcâie zilnic + revine post-investment real.

### §63.4 Google OAuth scope — Email only minimum absolut (Option C) ✅ LOCKED

`scope: email` ONLY. NU profile basic, NU contacts. Privacy posture impecabilă Beta. Eliminates suspicion Maria 65. Cross-ref §56.2.1 update inline.

### §63.5 Magic Link expiration — 24h (Override Q5 reconsider) ✅ LOCKED

**OVERRIDE:** Q5 initial choice 1h → reconsider **24h expiration**. Maria 65 cross-context PWA Android tolerance: telefon slow + email întârzie 20-30 min + nu vede notif imediat. 1h = link expirat surpriză + Maria frustrare retry. 24h = balance security/UX Beta 50 testeri familie. Cross-ref §56.2.1.1 NEW.

### §63.6 Soft delete 30 zile reminder — Email day 25 "5 zile rămase + click reactivare" (Override Q6) ✅ LOCKED

**OVERRIDE:** Q6 initial choice ZERO notificări → reconsider email day 25 reminder. ZERO reminder contradice rationale soft delete §56.5.2 "Maria 65 click greșit = recovery 30 zile". Industry standard (Notion/Google/Apple) = reminder pre-deletion irreversible NU spam. Day 25 wording: "5 zile rămase. Click pentru reactivare cont." Pre-Beta 50 testeri = subprocess Daniel manual scale ~1-2/lună. Cloud Function automation defer v1.5. Cross-ref §56.5.2.1 NEW.

### §63.7 Fork Decision UI default highlight — ZERO default force user choice (Option C) ✅ LOCKED

NU [Cloud] highlighted, NU [Telefon] highlighted. Force user manual choice anti-mistake Maria 65 click greșit. User citește + confirmă conștient. Cross-ref §56.7.1 update inline.

### §63.8 Beta recruitment 50 testeri profile — 100% RO familie/prieteni Daniel (Option A) ✅ LOCKED

NU 70/30 RO/EN, NU 50/50. Control strict profile testeri + zero zgomot grupuri publice + feedback calitativ direct trust. Anti-localizare prematură. Cross-ref §56.18 strategy.

### §63.9 Onboarding skip behavior — Skip vizibil + synthetic Demographic Prior fallback (Override Q9) ✅ LOCKED

**OVERRIDE:** Q9 initial choice "NU skip mandatory" → reconsider skip vizibil. CONTRADICE foundation ADR 025 candidate "Andura Gândește pentru User" + ADR 014 Profile Typing tier-aware + §36.94 filtru pre-feature LOCK verbatim "Dacă user ignoră complet feature, app-ul tot funcționează rezonabil? DA → eligible LOCKED". Skip = FEATURE NU bug per memory persistent.

**Mecanism post-skip:** Demographic Prior Database (synthetic 50+ profiles × 90 zile) consume → engine generic acceptabil din age/sex/kg/height defaults. Cross-ref ADR 014 + ADR 017 + §36.94.

### §63.10 First session post-onboarding — "Plan generat. Începe când vrei" passive (Option C) ✅ LOCKED

NU auto-start sesiune imediat. NU tour 30 sec features. Passive choice = user libertate când start, evită panic forced-start Maria 65. Bugatti F4 cognitive friction zero.

---

## §64 BATCH 3 — Auth Edge Cases & Privacy (10 LOCKED)

### §64.1 Email change verification — Magic Link new address ONLY (Option A) ✅ LOCKED

NU double confirm Magic Link old + new (over-engineering). NU password-less ZERO friction (security hole). Magic Link new address only validate + auto-update Firebase `updateEmail`. Typo guard preserved §56.5.6. Cross-ref §56.5.4.1 NEW.

### §64.2 Account deletion confirmation flow — 2-step type "ȘTERGE" + click (Option B) ✅ LOCKED

NU 1-click + modal final (anti-tap-accidental insufficient). NU 3-step email + 24h delay + click (over-friction). Type "ȘTERGE" manual + click confirm = balance anti-Maria-65-mistake + reasonable friction. Cross-ref §56.5.2.2 NEW.

### §64.3 GDPR data portability Article 20 — Defer v1.5 manual cerere suport@andura.app (Option C) ✅ LOCKED

NU JSON download imediat Settings (scope creep pre-Beta). NU email cu link 24h expirare (infrastructure). Pre-Beta 50 testeri = cerere manuală suport@andura.app, Daniel proceseze. Automated button defer v1.5. Cross-ref §56.8.4 NEW.

### §64.4 Auth screen language — RO ONLY Beta (Option A) ✅ LOCKED

NU EN toggle vizibil pre-Beta, NU auto-detect browser. F-NEW-1 i18n LOCKED V1 OBLIGATORIU defer post-Beta. Testeri 100% RO confirmat §63.8. Cross-ref §56.2.0 NEW.

### §64.5 Magic Link inexistent email behavior — Silent send Firebase native + wording educativ email-side + soft-hint UI (Override Q5 reconsider) ✅ LOCKED

**OVERRIDE refined:** Q5 initial choice silent send raw → reconsider hibrid wording educativ.

**Email body wording verbatim (Magic Link):**
> "Dacă ai deja un cont Andura, acest link te va conecta direct la profilul tău existent. Dacă ești la prima accesare, am creat acum un cont nou pentru tine, iar progresul tău va fi salvat automat."

**Auth screen soft-hint UI sub email field:**
> "Verifică cu atenție adresa de e-mail introdusă pentru a te asigura că primești link-ul de acces."

Anti-account-enumeration security preserved (Firebase native) + anti-confusion typo Maria 65 educativ. Cross-ref §56.2.2.1 + §56.2.2.2 NEW.

### §64.6 Multi-account same email forwarder edge case — Documentat ghid testeri (Option B) ✅ LOCKED

Daniel test 2 conturi Google diferite same Gmail forwarder = imposibil Firebase Auth (limitation native). Accept limitare technical + documenta nota informativă document testare pre-Beta. NU workaround alias Gmail "+test". Cross-ref §56.5.7 NEW.

### §64.7 Session timeout inactivity — NEVER always-logged-in (Option A) ✅ LOCKED

NU 30 zile, NU 90 zile re-auth. Confirmă §56.11.1 always-logged-in `indexedDBLocalPersistence` + refresh token forever default. Token ID 1h auto-refresh background. Maria 65 NU re-auth surpriză. Cross-ref §56.11.3 NEW.

### §64.8 Telemetry opt-out toggle — ZERO toggle Settings (Option A) ✅ LOCKED

NU toggle vizibil "Permite telemetrie anonimă" default ON, NU default OFF + onboarding prompt. Aggregate anonymous events (`onboarding_started` etc) = GDPR-safe by design (FieldValue.increment counter only, ZERO PII). NU încarce interfață Settings. Cross-ref §56.15.3 NEW.

### §64.9 Service Worker update flow — Prompt subtil "Actualizare disponibilă. Reîncarcă" (Option B) ✅ LOCKED

NU silent background update (user surprise post-reload). NU force reload immediate (workout interruption disaster). Prompt non-disruptive workout-aware = user termină sesiune curentă apoi reload manual. Cross-ref §56.17.2 NEW.

### §64.10 Logout dormant DBs cleanup — 90 zile not-touched auto-delete (Option B) ✅ LOCKED

`andura_${uid}` not-touched 90 zile → Daniel weekly script optional detect + delete (per §56.12.2). NU 30 zile (privacy familie share tablet aggressive). NU 180 zile conservativ (storage waste). 90 zile = balance privacy/recovery window. Cross-ref §56.12.2.1 confirm.

---

## §65 BATCH 4 — Engine #8 Warm-up + Periodization Defaults (10 LOCKED)

### §65.1 Engine #8 Warm-up duration — 5-10 min adaptive (Override Q1 reconsider) ✅ LOCKED

**OVERRIDE:** Q1 initial choice 8-12 min adaptive → reconsider **5-10 min adaptive** compressed upper bound. RO pragmatism cultural (mainstream fitness apps Strong/Hevy = 5-8 min default). Maria 65 sesiune light 3-5 min. Guru forță upper bound 10 min (NU 12). Bugatti F4 "warm-up just enough" NU "warm-up academic complete". Cross-ref §Engine #8.1 NEW.

### §65.2 Engine #8 Warm-up exercises — Hybrid 1-2 general + 2-3 specific muscle group (Option C) ✅ LOCKED

User începe mobility general full-body (1-2 mișcări) → exerciții specifice grupe musculare vizate ziua respectivă (2-3 mișcări, ex: shoulder mobility înainte bench press). NU general only (insufficient prep), NU muscle-specific only (cold start problematic). Cross-ref §Engine #8.2 NEW.

### §65.3 Engine #8 Warm-up skip — "Sari peste încălzire" buton vizibil (Option A) ✅ LOCKED

NU skip after 3+ logged warm-ups (paternalism), NU NEVER skip (ADR 025 violation). Buton vizibil de la prima sesiune = ADR 025 graceful degradation alignment + Bugatti F4 zero forced friction. Cross-ref §Engine #8.3 NEW.

### §65.4 Cool-down post-session — Optional buton "Adaugă 2 min stretch" (Override Q4 reconsider) ✅ LOCKED

**OVERRIDE:** Q4 initial choice defer v1.5 → reconsider Option B optional 2 min stretch. ZERO cool-down V1 inconsistent vs warm-up MANDATORY. Industry research Schoenfeld/Helms = stretching 2-3 min post-session REDUCE DOMS perceput → Maria 65 retention crescut. Implementare minimă = 2-3 stretch static text-only ZERO UI complex. Cost dev ~30 min vs valoare retention. Cross-ref §Engine #8.4 NEW.

### §65.5 Periodization mesocycle length — 4 săptămâni clasic (Option A) ✅ LOCKED

NU 5-6 săptămâni hipertrofie focus, NU auto-adapt user goal. Predictabilitate maximă + ușor urmărit solo dev. Structure: 3 săptămâni progresie + 1 săptămână deload. Cross-ref §Periodization.1 NEW.

### §65.6 Deload week trigger — Hibrid auto săpt 4 + early-trigger §36.82 readiness 🔴 3x consecutive (Option C) ✅ LOCKED

NU auto-only (rigid). NU readiness-only (insufficient frequency). Hibrid = predictable structure + safety net oboseală reală. §36.82 cross-ref preserved (energy adjustment 3 sesiuni consecutive 🔴 → deload activ early). Cross-ref §Periodization.2 NEW.

### §65.7 Progressive overload increment — +2.5 kg compound / +1.25 kg isolation (Option A) ✅ LOCKED

NU +5% calculated rep PR (calculation overhead Maria 65), NU RPE-based (RIR scade → load up — too volatile T0). Discuri fizice standard RO sală 1.25/2.5/5/10/20 kg. Newbie friendly + intuitiv. Cross-ref §Periodization.3 NEW.

### §65.8 Frequency per muscle group T0 default — 2x/săptămână universal (Option A) ✅ LOCKED

NU chest/back 2x + legs 1x asymmetric, NU goal-adaptive (T0 insufficient data). 2x/week universal = research-backed (Schoenfeld 2016 meta-analysis hypertrophy frecvență optimă) + antrenamente scurte preserve Maria 65 friction tolerance. Cross-ref §Periodization.4 NEW.

### §65.9 Exercise library V1 size — ~40 mișcări compound-heavy Pareto 80/20 (Option A) ✅ LOCKED

NU ~80 variety, NU ~150 Jeff Nippard parity (scope creep masiv pre-Beta). Mișcări fundamentale 80% rezultate (genuflexiuni, îndreptări, împinsuri, tracțiuni etc). Descrieri execuție calitate înaltă > variety cu sloppy text. Cross-ref §ExerciseLibrary.1 NEW.

### §65.10 Exercise substitution UI — Defer chat dedicat §36.107 D3 NEW (Option C) ✅ LOCKED

NU "Don't like" button auto-swap V1 (complex algorithm), NU lista 3 alternative manual (UI scope creep). Lock V1 = zero substitution feature. Defer §36.107 D3 NEW chat strategic dedicat (D3.2 Don't Like + D3.3 Home + D3.4 Calistenice + Sport-Oriented). Cross-ref §ExerciseLibrary.2 confirm.

---

## §66 BATCH 5 — RPE/RIR UX + Beta Mechanics (10 LOCKED)

### §66.1 RPE input UX — Hibrid segmented default + slider 1-10 advanced toggle Settings (Option C) ✅ LOCKED

Default segmented "Ușor / OK / Greu / La limită" Maria 65 friendly. Advanced toggle Settings activate slider 1-10 numeric pentru Guru precision. Same UI scalable Maria → Guru. Cross-ref §RPE.1 NEW.

### §66.2 RIR input frequency — Per-exercise last set ONLY (Option B) ✅ LOCKED

NU per-set fiecare set (friction maximă), NU per-sesiune end summary 3 nivele (precision insuficientă). Last set per exercise = balance friction minimal + data quality acceptable. Engine ia oboseala necesară fără sâcâială. Cross-ref §RPE.2 NEW.

### §66.3 RPE/RIR skip behavior — Engine assume RIR 2 default (Option A) ✅ LOCKED

User skip → engine fundal RIR 2 moderate effort default. NU flag "no data" + NU adapt next session (rupe progresie). NU MANDATORY (ADR 025 violation). Alignment §36.94 B4 + ADR 025 graceful degradation universal. Cross-ref §RPE.3 confirm.

### §66.4 Rest timer between sets — Hibrid auto-start + skip button (Option C) ✅ LOCKED

NU auto-start countdown only (forced), NU manual user start only (friction). Auto-start post-set logged + skip button vizibil = user pregătit early skip 1 tap. Bugatti F4 zero forced friction. Cross-ref §RestTimer.1 NEW.

### §66.5 Rest timer duration default — Adaptive exercise type (Option B) ✅ LOCKED

NU 90s universal (compound under-rested + isolation over-rested). Compound 3 min + isolation 60s + accessory 45s. Research-aligned (Schoenfeld 2016 rest interval hypertrophy). Cross-ref §RestTimer.2 NEW.

### §66.6 Mid-session abandon — Auto-save + Resume per §50.2 D4 (Option A) ✅ LOCKED

NU prompt "Salvează sesiunea parțială?" (friction). NU discard silent (data loss). Auto-save IndexedDB local + resume next open user prompt continuation. Cross-ref §SessionLifecycle.1 confirm + §50.2 D4 Mid-Session Resume Protocol LOCKED V1.

### §66.7 Retention KPI primary pre-Beta — Hibrid D7 ≥45% target / ≥35% acceptable / <30% red flag (Override Q7 reconsider) ✅ LOCKED

**OVERRIDE:** Q7 initial choice D7 ≥60% → reconsider hibrid industry-calibrated. Industry benchmark fitness consumer Strong/Hevy publicly disclosed = 25-40% D7 medie. Familie/prieteni Daniel +10-15% bonus realistic = 35-55% range. 60% bar prea ridicat → risc panic premature pivot decisions. Hibrid:
- **Target:** D7 ≥45% (motivational realistic)
- **Acceptable:** D7 ≥35% (industry-calibrated familie/prieteni bonus)
- **Red flag:** D7 <30% (UX issue major)

Cross-ref §RetentionKPI.1 NEW.

### §66.8 Beta recruitment channel — 100% Daniel direct familie/prieteni (Option A) ✅ LOCKED

NU grupuri Facebook fitness RO, NU Reddit r/Romania r/Fitness. Control strict profile + zero zgomot public + feedback calitativ direct trust. Cross-ref §BetaRecruitment.1 NEW + §63.8 confirm.

### §66.9 Beta feedback collection — Email suport@andura.app + Google Form survey săptămânal duminică (Option B) ✅ LOCKED

NU email only (passive bug reports only). NU 1-on-1 calls top 5 testeri (bandwidth solo dev disaster). Hibrid email passive (bug reports oricând) + Google Form structured weekly Sunday digest. Cross-ref §BetaFeedback.1 NEW.

### §66.10 Pricing post-Beta v1.0 stable — Defer post-Beta retrospectiva data-driven (Option C) ✅ LOCKED

NU free forever bootstrap commitment (premature lock-in revenue model). NU freemium core+premium v2 (premature decision data insufficient). Defer post-Beta retro = pricing data-driven feedback 50 testeri + utilizare reală + market positioning RO fitness apps. Cross-ref §Pricing.1 NEW.

---

## §67 BATCH 6 — Safety, Compliance & Distribution (10 LOCKED)

### §67.1 Pregnancy declaration — Settings ONLY post-onboarding (Option B) ✅ LOCKED

NU Q4 medical checkbox onboarding (friction primă atingere). NU hibrid quick + detailed. Settings exclusive post-onboarding = preserve T0 5-7 întrebări Bugatti F4 frictionless. Cross-ref §Pregnancy.1 NEW + PRODUCT_STRATEGY §5.4 alignment.

### §67.2 Underage detection sub 16 — Defer v1.5 honor system (Option C) ✅ LOCKED

NU honor system checkbox V1, NU date-of-birth field auto-block. Beta 50 testeri adulți known direct Daniel = ZERO GDPR risk pre-Beta. Defer v1.5 honor system implementation. Cross-ref §Underage.1 NEW + PRODUCT_STRATEGY §5.2-§5.3 alignment.

### §67.3 Heart condition declaration UX — Settings ONLY + red disclaimer scroll-to-bottom + "Confirm clearance medical" (Option B-clarified) ✅ LOCKED

**B-CLARIFIED:** Settings exclusive post-onboarding (paritate pregnancy §67.1). NU Q onboarding (friction). User activează checkbox heart condition Settings → red disclaimer screen scroll-to-bottom + "Confirm că am clearance medical" buton final. Liability protected + zero churn legitim onboarding. Cross-ref §HeartCondition.1 NEW + PRODUCT_STRATEGY §5.8 alignment.

### §67.4 Eating disorder pattern detection — Defer v1.5+ insufficient telemetry pre-Beta (Option B) ✅ LOCKED

NU algoritm weight drop brutal V1 (insufficient data 50 testeri 6-12 luni minim). NU flag DOAR (incomplete intervention). Defer v1.5+ când telemetry advanced + sample size justify. Cross-ref §EatingDisorder.1 NEW + PRODUCT_STRATEGY §5.5 deferred status.

### §67.5 Disclaimer medical placement — Ecran 4 Obiectiv checkbox obligatoriu (Option A) ✅ LOCKED

NU Settings only (visibility insufficient). NU splash screen first launch (annoying). Ecran 4 Obiectiv onboarding checkbox obligatoriu disabled-until-checked + link expandabil ToS+Privacy = vizibilitate maximă în context configurare profil + accept legal conștient. Cross-ref §DisclaimerMedical.1 NEW + ONBOARDING_SSOT_V1 §8 alignment.

### §67.6 Notification permission request timing — NEVER request V1 push defer v2 (Option C) ✅ LOCKED

NU onboarding Q5 final, NU post first session complete. ZERO push V1 = ZERO permission request. Anti-spam Bugatti dignity + scope creep pre-Beta zero. Cross-ref §Notifications.1 NEW.

### §67.7 Push notification scope V1 — ZERO push V1 (Option A) ✅ LOCKED

NU "Azi ai programat X. Mergem?" V1 (per §6.1 LOCKED inițial deferred reconsidered V1). NU deload reminder + weekly mesocycle review push (scope creep). ZERO push V1 absolute. Defer v1.5+ când Daniel decide push strategy mature. Cross-ref §Notifications.2 NEW + §6.1 PRODUCT_STRATEGY override notation needed.

### §67.8 Email digest weekly Mesocycle Review — Opt-in default OFF + discovery prompt one-time post first mesocycle (Option C + clarification discovery) ✅ LOCKED

Default OFF în Settings = anti-spam GDPR. Discovery prompt one-time la finalul primului mesociclu (4 săpt timing): "Vrei rezumat mesociclu pe e-mail?" = moment perfect user data relevantă strânsă + propunere percepută valoare adăugată NU spam. Post-prompt: opt-in Settings only (organic find). Cross-ref §EmailDigest.1 NEW + §EmailDigest.Discovery NEW.

### §67.9 Achievement badges scope V1 — ZERO badges V1 SCOPE CUT (Option A) ✅ LOCKED

NU "praguri fizice reale" V1 (1×BW Bench / 2×BW Deadlift defer v1.5+). NU streak badges 7/30 zile. ZERO badges V1 = scope cut deliberate (NU revoke §6.5 PRODUCT_STRATEGY). Praguri fizice reale rămân piloni viziune produs Andura defer v1.5+. Bugatti dignity preserved + scope creep zero. Cross-ref §Badges.1 NEW.

### §67.10 App store distribution post-Beta — PWA + TWA Android Play Store ONLY (Option B + iOS REJECTED LOCKED PERMANENT) ✅ LOCKED

**iOS REJECTED LOCKED PERMANENT** (NEW):
- Pre-Beta: PWA only iOS users (browser default, ~20-30% rate fail tolerated)
- Post-Beta v1.0: NU iOS distribution
- Post-Beta v1.5: NU iOS distribution
- v2/v3: demand-driven only (real iOS user demand + revenue justify $99/an Apple Developer)

**Distribution V1 Beta + post-Beta v1.0/v1.5:**
- PWA installable browser
- TWA wrap Android Play Store (per §56.10.3 contingent rate fail >30% activation)

Cross-ref §AppDistribution.1 NEW + §56.10.2 iOS scope cut PERMANENT extension.

---

## §68 CLOSURE BATCH — UX Refinements Post-Implementation (3 LOCKED)

### §68.1 Onboarding skip post-skip UX — Transparență "Plan generat din date tipice" (Option A) ✅ LOCKED

User skip onboarding T0 → engine consume synthetic Demographic Prior fallback → plan generat afișat imediat cu wording verbatim:

> "Plan generat din date tipice. Îl poți ajusta oricând din profil."

NU prompt 2 întrebări critice post-skip (defeat purpose skip). NU silent default ZERO menționare (mystery anti-trust). Transparență = ADR 025 alignment "Andura Gândește pentru User" + ADR 014 + ADR 017 synthetic prior consume. Cross-ref §Onboarding.Skip.UX NEW.

### §68.2 Auth-banner reapariție definition "3 sesiuni" — Workout-logged-complete (Option clarification) ✅ LOCKED

"3 sesiuni" reapariție post-dismiss = **3 antrenamente finalizate complet salvate jurnal (logged workout)**, NU 3 app-open count. ~3 săptămâni Maria 65 frecvență 2x/săpt timing realistic high commitment. Banner reapare după effort real investit. Cross-ref §AuthBanner.Reapparition NEW + §63.3 clarification.

### §68.3 Email digest discovery prompt timing — Post first mesocycle complete (Option B) ✅ LOCKED

Prompt one-time descoperire feature = la finalul primului mesociclu 4 săptămâni completate: "Vrei rezumat mesociclu pe e-mail?" Moment perfect: user data relevantă strânsă + propunere valoare adăugată context. NU onboarding final mention (irrelevant timing). NU ZERO discovery (feature reach zero). Cross-ref §EmailDigest.Discovery NEW + §67.8 clarification.

---

## §69 SCENARIOS DECISION COVERAGE — PRE-BETA BLOCKER FLAG

### §69.1 Status scenarios 1500-2000 coverage decisions ⚠️ PRE-BETA BLOCKER

**Per §42.9 LOCKED V1 testing strategy:** Hibrid Property-based + Persona Suite Maria/Gigica/Marius + 4-Invariant Safety Stack mandatory pass. Persona simulation suite ~50-100 tests representative + edge cases curated.

**Coverage actual post chat-uri Auth + ADR 026 spec + Auth Flow §36.80 + Batch 1-6:**
- §42.1-§42.10 base 10 decisions LOCKED
- §45.2-§45.5 ADR 026 spec 75 decisions LOCKED
- §50.1-§50.4 D-cluster 41 decisions LOCKED
- §56.1-§56.19 Auth Flow §36.80 35 sub-decisions LOCKED
- §62-§68 Batch 1-6 + Closure 63 sub-decisions LOCKED
- **Total cumulative: 306 LOCKED V1**

**Gap pre-Beta:** ~1200-1700 scenarios decisions remaining (estimative AUDIT_5000Q + Persona Suite curated + edge cases enumerate). Acoperire actuală ~15-25% scope total scenarios.

**Decision Daniel + Claude:** TREBUIE TRECUT PRIN TOT SCENARIOS COVERAGE pre-Beta launch. Order:
1. Priority 1 ABSOLUT: CC Opus Auth Flow §36.80 implementation (post Daniel manual prep)
2. **Priority 2 NEW: Scenarios coverage chat-uri strategice dedicate** — ~5-15 chat-uri estimative pentru complete enumeration + decisions LOCKED. Cross-ref §42.9 testing strategy validation real.
3. Priority 3: ADR 026 compile draft full 126 decisions
4. Priority 4: Periodization Engine spec generation per dimension cross-persona

**Pre-Beta blocker:** Scenarios coverage incomplete = Beta launch IMPOSIBIL fără toate edge cases LOCKED + Persona Suite tests representative + 4-Invariant Safety Stack validated.

Cross-ref §42.9 + AUDIT_5000Q + ONBOARDING_SSOT_V1 §10 Open Questions + Beta launch decalare §62.7 Quality > Speed default justifies.

---

## §70 Cumulative LOCKED Count Update (post Batch 1-6 + Closure)

**Pre-session:** 243 LOCKED V1 (post §56-§61 Auth Flow §36.80 ingest)
**Post-session:** **306 LOCKED V1** (+63 substantive net post-overlap)

**Breakdown decomposition:**
- Batch 1 (Architecture & Process): 10 sub + 1 META review division of labor
- Batch 2 (Onboarding & Conversion): 10 sub
- Batch 3 (Auth Edge Cases & Privacy): 10 sub
- Batch 4 (Engine #8 + Periodization): 10 sub
- Batch 5 (RPE/RIR + Beta Mechanics): 10 sub
- Batch 6 (Safety, Compliance, Distribution): 10 sub
- Closure (UX Refinements): 3 sub

Total raw = 64. Overlap absorbed (META review pattern subsumed în workflow general) = **63 net**.

---

## §71 Next Actions Priority Order (post Batch 1-6 + Closure)

### Priority 0 — Push origin main vault changes (Daniel approval pending post-CC ingest)

CC ingest commits push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved.

### Priority 1 ABSOLUT — Auth Flow §36.80 CC Opus Implementation Phased (per §62.3)

**Model: Opus** (rationale: scope cross-file integrare ~10 fișiere phased order: firebase.js → auth.js → pages/auth.js → rest. Phased = blast radius minimal per phase + intermediate validation gates).

**Estimate:** ~30-45 min CC autonomous factor 7-9x clusters mari (refined post Batch 1-6 spec extensions: +5-10 min wording UI mass + medical disclaimer Ecran 4 + skip onboarding synthetic prior consume + auth-banner reapparition workout-logged-counter + email digest discovery prompt mesocycle + dormant DB cleanup 90 zile script + Magic Link 24h config + email day 25 reminder subprocess Daniel).

**Daniel manual prep prerequisites pre-CC (acasă):**
1. Firebase Auth Console setup (~15 min) — authorized domains andura.app + Email Template Magic Link RO + Google OAuth Client ID + Action URL https://andura.app/auth-callback + **Magic Link expiration 24h custom config**
2. `suport@andura.app` MX records Namecheap forward Daniel personal Gmail (~15 min)
3. Privacy Policy + ToS V1 Beta validate sprint cu review Claude + Gemini (~30-60 min, initial drafts created vault `01-vision/`, Daniel final approve minim spot-check per §62.X META)

### Priority 2 NEW — Scenarios Coverage 1500-2000 Decisions (chat-uri strategice dedicate)

Per §69.1 PRE-BETA BLOCKER. Estimate ~5-15 chat-uri strategice dedicate scenarios enumeration + decisions LOCKED + Persona Suite Maria/Gigica/Marius edge cases curated. Cross-ref §42.9 testing strategy validation real.

### Priority 3 — ADR 026 compile draft full 126 decisions (chat strategic NEW)

Compile structure: §42 base 10 + §45 spec 75 + §50.1 D3.1 13 + §50.2 D4 11 + §50.3 D2 13 + §50.4 D1 7 + naming distinction = 126 sub-decisions. Replace candidate stub `03-decisions/026-offline-coaching-decision-tree-exhaustive.md`.

### Priority 4 — Periodization Engine spec generation per dimension cross-persona

Chat 1 Volume Landmarks all 3 persona + chat 2 Frequency Distribution + chat 3 Progressive Overload + chat 4 Mesocycle Structure (~3-4 chat-uri estimative). Per Q30 LOCKED.

### Priority 5 — HANDOVER_GLOBAL split execution (per §62.2)

Thematic split (auth/engine/onboarding fișiere separate) + ~50+ wikilinks sweep + rewire. Backup tag `pre-handover-split-2026-05-04-evening` mandatory pre-execution. Chat strategic dedicat post-CC Auth Flow.

### Priority 6 long-term

D3.2-D3.4 + Engine #8 sub-decisions remaining. ADR 022 + 024 + 025 full spec generation post Periodization. Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal complete (§46 P4 prerequisite). Soft Launch (target flexible Quality>Speed default per §62.7).

---

## §72 DIFF_FLAGS Update (post Batch 1-6 + Closure)

- **iOS REJECTED LOCKED PERMANENT (NEW):** memory persistent rule + cross-ref §56.10 + §67.10 PWA + TWA Android only. Pre-Beta + post-Beta v1.0/v1.5 = ZERO iOS distribution. v2/v3 demand-driven only.
- **HANDOVER_GLOBAL split FLAG TRIGGERED preserved:** plan thematic split (per §62.2) post-CC Auth Flow chat strategic dedicat.
- **Scenarios Coverage PRE-BETA BLOCKER NEW (per §69.1):** Priority 2 chat-uri strategice ~5-15 dedicate. Beta launch IMPOSIBIL fără.
- **Beta launch decalare oficial Quality > Speed default (NEW per §62.7):** Override §56.9.2 "1 ian 2027 optimistic" preserved. Target flexible NU forced deadline.
- **Privacy Policy + ToS review division of labor (NEW per §62.X META):** Claude + Gemini review cross + Daniel final approve spot-check minim. Pattern reusable text-heavy/legal artifacts general workflow.

---

## §73 Cross-references Comprehensive

**ADR_MULTI_TENANT_AUTH_v1.md updates pending CC ingest:**
- §AMENDMENT 2026-05-04.10: Magic Link expiration 24h (override 1h)
- §AMENDMENT 2026-05-04.11: Email body wording educativ verbatim §64.5
- §AMENDMENT 2026-05-04.12: Auth screen soft-hint UI sub email field §64.5
- §AMENDMENT 2026-05-04.13: Session timeout NEVER always-logged-in confirm §64.7
- §AMENDMENT 2026-05-04.14: Telemetry ZERO toggle aggregate-only §64.8
- §AMENDMENT 2026-05-04.15: SW update prompt non-disruptive §64.9
- §AMENDMENT 2026-05-04.16: iOS REJECTED LOCKED PERMANENT §67.10
- §AMENDMENT 2026-05-04.17: Email change Magic Link new address only §64.1
- §AMENDMENT 2026-05-04.18: Account deletion 2-step ȘTERGE §64.2
- §AMENDMENT 2026-05-04.19: GDPR Article 20 portability defer v1.5 §64.3

**ADR 014 Onboarding Profile Typing tier-aware preserved:** §63.9 skip + synthetic Demographic Prior consume alignment.

**ADR 017 Demographic Prior Database K-NN K=10 preserved:** §63.9 + §68.1 transparency wording consume.

**ADR 025 candidate "Andura Gândește pentru User" preserved:** §63.9 + §65.3 + §66.3 + §68.1 alignment graceful degradation universal.

**PRODUCT_STRATEGY_SPEC_v1 amendments pending:**
- §5.4 Pregnancy Settings ONLY confirm §67.1
- §5.5 Eating disorder defer v1.5+ confirm §67.4
- §5.8 Heart condition Settings + red disclaimer scroll-to-bottom B-clarified §67.3
- §6.1 Push notifications ZERO V1 override (defer v2) §67.7
- §6.5 Achievement badges scope cut V1 (NU revoke pillar) §67.9

**ONBOARDING_SSOT_V1 amendments pending:**
- §3 T0 question order obiectiv-first §63.1
- §8 Disclaimer medical Ecran 4 Obiectiv mandatory §67.5

**HANDOVER_GLOBAL §X cross-refs preserved (zero info loss):** §36.75 + §36.78-§36.80 + §36.82-§36.83 + §36.93-§36.94 + §36.99 + §36.100 + §36.107 + §42.1-§42.10 + §45.2-§45.7 + §50.1-§50.4 + §56.1-§56.19 + §57-§61.

**DECISION_LOG entry NEW pending CC append:** "2026-05-04 evening — Batch 1-6 + Closure 63 sub-decisions LOCKED V1 (cumulative 306)" cu breakdown decomposition + chat resolution iterations push-back validated.

**INDEX_MASTER.md update pending:** cumulative 306 LOCKED V1 + Engine #8 spec sub-decisions + Periodization spec partial + Beta mechanics LOCKED + iOS REJECTED PERMANENT entry + Scenarios Coverage PRE-BETA BLOCKER FLAG entry.

---

🦫 **Andura needs to be the best. ✊**

**Generated:** Chat strategic 2026-05-04 evening Daniel + Claude post §56-§61 ingest + alignment 12/12 EXCELLENT + Batch 1-6 + Closure execution. Bandwidth ~22% remaining at handover-time = fresh aggregate decisions, NU recreation memorie saturată. Anti-recurrence saturation halucinație 30 apr preserved.

**Daniel next action acasă:**
1. Drag this file în `📥_inbox/HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED.md`
2. Comandă CC Opus: `Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL`
3. Daniel manual prep prerequisites Auth Flow CC Opus implementation phased Priority 1 ABSOLUT
