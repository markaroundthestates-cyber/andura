# DECISION LOG — Andura

## 2026-05-04 evening — Auth Flow Batch 1-6 + Closure 63 sub-decisions LOCKED V1 (cumulative 306)

**Status:** Chat strategic 2026-05-04 evening Daniel + Claude post §56-§61 ingest + alignment 12/12 EXCELLENT — 63 substantive sub-decisions LOCKED V1 acoperind Auth Flow refinements + Engine #8 Warm-up/Cool-down + Periodization defaults + RPE/RIR UX + Beta mechanics + Safety/Compliance + Notifications/Distribution. Cumulative LOCKED 243 → **306** (+63 substantive net post-overlap).

**Authority:** Extends §AMENDMENT 2026-05-04 (Faza 2 Auth Flow §36.80 wiring spec) cu refinements + overrides + edge cases. Multiple amendments inline per §3.1: ADR_MULTI_TENANT_AUTH_v1 +10 sub-amendments .1-.10 + PRODUCT_STRATEGY_SPEC_v1 §5.4/§5.5/§5.8/§6.1/§6.5 + ONBOARDING_SSOT_V1 §1/§8.

**Breakdown decomposition (per HANDOVER §62-§68):**

- **Batch 1 (§62) Architecture & Process — 10 sub + 1 META review division of labor:** Email infrastructure forward Gmail Daniel personal (Option A) + HANDOVER_GLOBAL split thematic (Option B) + CC Auth Flow phased implementation (Option B) + Privacy Policy/ToS lock as-is V1 Beta + Firebase Email Template Magic Link RO + Beta launch decalare oficial Quality > Speed default OVERRIDE §56.9.2 + Logout modal wording lock + Cleanup A weekly script reminder Calendar + Cleanup C Cloud Function defer post-Beta retrospectiva manual + META Review Division of Labor Claude+Gemini text-heavy/legal review cross + Daniel final approve spot-check minim
- **Batch 2 (§63) Onboarding & Conversion — 10 sub:** T0 question order obiectiv-first hook motivațional (Option B) + Auth-banner-soft trigger imediat post-T0 plan generated (Option A) + dismiss "Nu acum" + reapariție 3 sesiuni logged workout (Option C) + Google OAuth scope email only (Option C) + Magic Link expiration 24h OVERRIDE Q5 1h (Option B) + Soft delete email day 25 reminder OVERRIDE Q6 ZERO notificări (Option B) + Fork Decision UI ZERO default force user choice (Option C) + Beta recruitment 100% RO familie/prieteni (Option A) + Onboarding skip vizibil + synthetic Demographic Prior fallback OVERRIDE Q9 (Option B + ADR 014 + ADR 017 + ADR 025 alignment) + First session passive "Plan generat. Începe când vrei" (Option C)
- **Batch 3 (§64) Auth Edge Cases & Privacy — 10 sub:** Email change Magic Link new address ONLY (Option A) + Account deletion 2-step type "ȘTERGE" + click (Option B) + GDPR data portability defer v1.5 manual cerere suport@ (Option C) + Auth screen RO ONLY Beta (Option A) + Magic Link inexistent email behavior silent send Firebase + wording educativ email + soft-hint UI OVERRIDE Q5 hibrid (Option B+) + Multi-account same email forwarder documentat ghid testeri (Option B) + Session timeout NEVER always-logged-in (Option A) + Telemetry ZERO toggle Settings aggregate-only (Option A) + SW update prompt subtil non-disruptive workout-aware (Option B) + Logout dormant DBs cleanup 90 zile (Option B)
- **Batch 4 (§65) Engine #8 Warm-up + Periodization Defaults — 10 sub:** Warm-up duration 5-10 min adaptive OVERRIDE Q1 (Option B) + Warm-up exercises hybrid 1-2 general + 2-3 specific muscle group (Option C) + Warm-up skip "Sari peste încălzire" buton vizibil (Option A + ADR 025 alignment) + Cool-down optional buton "Adaugă 2 min stretch" OVERRIDE Q4 (Option B + Schoenfeld/Helms research) + Periodization mesocycle 4 săptămâni clasic 3 progresie + 1 deload (Option A) + Deload trigger hibrid auto săpt 4 + early §36.82 readiness 🔴 3x consecutive (Option C) + Progressive overload +2.5kg compound / +1.25kg isolation (Option A) + Frequency 2x/săpt universal T0 default (Option A + Schoenfeld 2016) + Exercise library V1 ~40 mișcări compound-heavy Pareto 80/20 (Option A) + Exercise substitution UI defer §36.107 D3 (Option C)
- **Batch 5 (§66) RPE/RIR UX + Beta Mechanics — 10 sub:** RPE input hibrid segmented default + slider 1-10 advanced toggle (Option C) + RIR input per-exercise last set ONLY (Option B) + RPE/RIR skip default RIR 2 (Option A + ADR 025 alignment) + Rest timer hibrid auto-start + skip button (Option C) + Rest timer adaptive exercise type compound 3 min/isolation 60s/accessory 45s (Option B + Schoenfeld 2016) + Mid-session abandon Auto-save + Resume per §50.2 D4 (Option A) + Retention KPI primary D7 ≥45% target / ≥35% acceptable / <30% red flag OVERRIDE Q7 60% (Option C industry-calibrated Strong/Hevy 25-40%) + Beta recruitment 100% Daniel direct familie/prieteni (Option A) + Beta feedback hibrid email + Google Form Sunday digest (Option B) + Pricing post-Beta defer retro data-driven (Option C)
- **Batch 6 (§67) Safety, Compliance & Distribution — 10 sub:** Pregnancy declaration Settings ONLY post-onboarding (Option B) + Underage detection sub 16 defer v1.5 honor system (Option C) + Heart condition Settings + red disclaimer scroll-to-bottom + "Confirm clearance medical" B-clarified + Eating disorder pattern detection defer v1.5+ (Option B) + Disclaimer medical Ecran Obiectiv onboarding checkbox obligatoriu (Option A) + Notification permission timing NEVER request V1 (Option C) + Push notification scope ZERO push V1 OVERRIDE PRODUCT_STRATEGY §6.1 (Option A) + Email digest weekly opt-in default OFF + discovery prompt one-time post first mesocycle (Option C+) + Achievement badges ZERO badges V1 SCOPE CUT NU revoke pillar (Option A) + **App store distribution PWA + TWA Android Play Store ONLY + iOS REJECTED LOCKED PERMANENT (NEW Option B)**
- **Closure (§68) UX Refinements Post-Implementation — 3 sub:** Onboarding skip post-skip UX transparență "Plan generat din date tipice" (Option A + ADR 025 alignment) + Auth-banner reapariție definition "3 sesiuni" workout-logged-complete clarification + Email digest discovery prompt timing post first mesocycle complete (Option B)

**§69 Scenarios Decision Coverage PRE-BETA BLOCKER FLAG (NEW):** ~1200-1700 scenarios decisions remaining (estimative AUDIT_5000Q + Persona Suite Maria/Gigica/Marius edge cases + 4-Invariant Safety Stack validation). Acoperire actuală ~15-25% scope total. Beta launch IMPOSIBIL fără TREBUIE TRECUT PRIN TOT scenarios coverage. Priority 2 NEW ~5-15 chat-uri strategice dedicate enumeration + decisions LOCKED.

**Cross-refs amendments inline appended:**
- [[ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 evening BATCH 1-6 .1-.10 (Magic Link 24h + email educativ + soft-hint UI + session NEVER + telemetry ZERO toggle + SW update prompt + iOS PERMANENT + email change new only + deletion 2-step ȘTERGE + GDPR Article 20 defer)
- [[PRODUCT_STRATEGY_SPEC_v1]] §5.4 (Pregnancy Settings ONLY) + §5.5 (Eating disorder defer v1.5+) + §5.8 (Heart Settings + red disclaimer B-clarified) + §6.1 (Push V1 ZERO override) + §6.5 (Achievement badges scope cut V1 NU revoke pillar)
- [[ONBOARDING_SSOT_V1]] §1 (T0 question order obiectiv-first reorder ecrane 5) + §8 (Disclaimer medical UX placement Ecran Obiectiv post §1 reorder)
- [[026-offline-coaching-decision-tree-exhaustive]] (Priority 3 compile 126 decisions ready post-CC + scenarios coverage)
- [[023-llm-intent-interpretation]] preserved
- [[014-onboarding-profile-typing]] (§63.9 skip + synthetic Demographic Prior consume) preserved
- [[017-demographic-prior-database]] (§63.9 + §68.1 transparency wording) preserved
- [[025-andura-gandeste-pentru-user]] (§63.9 + §65.3 + §66.3 + §68.1 graceful degradation universal) preserved
- [[HANDOVER_GLOBAL_2026-04-30_evening]] §62-§73 verbatim sub-sections + §70 cumulative + §71 priorities + §72 DIFF_FLAGS + §73 cross-refs comprehensive

**Next:** CC Opus Auth Flow §36.80 implementation phased Priority 1 ABSOLUT (~30-45 min CC autonomous post Daniel manual prep prerequisites: Firebase Console + Magic Link 24h custom config + suport@andura.app MX forward Daniel Gmail + Privacy Policy + ToS validate sprint cu review Claude+Gemini per §62.X META). Priority 2 NEW Scenarios Coverage chat-uri strategice dedicate (~5-15) PRE-BETA BLOCKER. Priority 3 ADR 026 compile 126 decisions chat strategic NEW. Priority 4 Periodization Engine spec generation per dimension cross-persona Q30. Priority 5 HANDOVER_GLOBAL split thematic execution (§62.2). Priority 6 long-term D3.2-D3.4 + Engine #8 + ADR 022/024/025 + Knowledge cadence + Beta Recruitment + Audit legal complete + Soft Launch (target flexible Quality>Speed default §62.7).

---

## 2026-05-04 evening — Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions LOCKED V1 (Priority 1 ABSOLUT CC implementation pending)

**Status:** Chat strategic dedicat Auth Flow §36.80 BUG 2 Firebase 401 production blocker. **35 substantive sub-decisions LOCKED V1** ready CC Opus implementation Priority 1 ABSOLUT. Cumulative LOCKED 216 → **243** (+27 substantive net post-overlap).

**Root cause confirmed §36.80 BUG 2:** `getUserPath()` returnează `'users/daniel'` literal când `getAuthState()=null` → DB Rules per-UID strict §36.75 BLOCHEAZĂ → 401 cycle infinit. Code-level fix LOCKED §56.1.3: `getUserPath()` returnează **obligatoriu `null`** mode Anonymous → toate apelurile Firebase API blocate → app rulează exclusiv local IndexedDB → bucla 401 eliminată mecanic.

**Chat resolution iterations (push-back validated):**
- PIN custom 6-digit REJECTED → Magic Link nativ Firebase reused (Spark plan retain §36.93)
- Hard delete imediat REJECTED → Soft delete 30 zile grace (GDPR Article 17 "without undue delay")
- LWW field-level CRDT REJECTED pre-Beta → Record-level LWW (defer v1.5 când avem real conflict telemetry)
- Fork Decision suprascrie definitiv REJECTED → Archive 7 zile + export local JSON backup
- iOS Universal Links REJECTED pre-Beta → Android-only + iOS v2/v3 demand-driven
- Logout wipe IndexedDB REJECTED → Preserve local + opt-in toggle Settings advanced default OFF
- ToS liability absolute REJECTED → "în măsura permisă de lege" + retain neglijență gravă/dol (RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83)
- Termen "biometrice" REJECTED → Andura NU colectează biometric data în sens GDPR

**Decizii LOCKED V1 — see HANDOVER_GLOBAL §56.1-§56.19 verbatim sub-sections:**

- **§56.1 Auth Pattern UX & Anonymous Mode (4 sub):** auth-banner-soft + Anonymous preserve fallback local-first + `getUserPath()=null` BUG 2 fix + IndexedDB namespace per UID `andura_${uid}` Dexie multi-DB
- **§56.2 Auth Methods & UI Wording (2 sub):** Google OAuth primary + Firebase Email Link nativ fallback + auth screen wording LOCKED V1 (titlu/subtitlu/CTA/loading/success)
- **§56.3 Onboarding Position & Email Timing (2 sub):** auth screen DUPĂ T0 + T0 scope 3-5 min max 5-7 întrebări cheie
- **§56.4 Migration Strategy (3 sub):** Daniel-only `users/daniel` legacy + `_migration` flag persistent Firestore + rollback strategy idempotent
- **§56.5 Account Lifecycle (6 sub):** recovery email lost refusal pattern wording + soft delete 30 zile grace `users/{uid}/_deleted` + reactivation flow `auth/user-disabled` + email change `updateEmail` nativ retain uid + conflict detection preventiv + current address typo guard
- **§56.6 Multi-device & Concurrent Sessions (2 sub):** silent sync transparent + Record-level LWW pre-Beta
- **§56.7 Anonymous→Auth Merge (2 sub):** Fork Decision UI explicit + archive 7 zile `_archived/{uid}/{timestamp}` + export local JSON
- **§56.8 GDPR & Legal (3 sub):** double bifa Privacy + ToS + Privacy Policy V1 Beta template + ToS V1 Beta template "în măsura permisă de lege"
- **§56.9 Sunset Timeline & Beta Gate (2 sub):** sunset Anonymous post-Beta v1.5 + 30 zile grace + Beta launch gate target 1 ianuarie 2027 optimistic Quality>Speed
- **§56.10 PWA Cross-Context (3 sub):** Magic Link Universal Links Android only pre-Beta + iOS scope cut v2/v3 + TWA wrap Android v1.5 contingent rate fail >30%
- **§56.11 Session Persistence & Offline UX (2 sub):** Always Logged In `indexedDBLocalPersistence` + offline non-blocking banner local data
- **§56.12 Logout Behavior (3 sub):** Settings bottom + double-confirmation modal + logout preserve IndexedDB + opt-in toggle + unsynced data warning calm wording
- **§56.13 Network Resilience (1 sub):** Magic Link auto-retry 3x + manual fallback
- **§56.14 Cleanup Mechanism (3 sub):** A weekly script `admin-cleanup.js` Daniel + B client-side fallback + C Cloud Function defer post-Beta v1.5
- **§56.15 Telemetry & Observability (2 sub):** T0→Auth conversion aggregate counters anonymous + `_telemetry/global` Firestore `FieldValue.increment(1)` Spark compatible
- **§56.16 DB Rules Firestore Update (1 sub):** Security Rules v1 pre-Beta extended `users/{uid}` + `_deleted/{uid}` + `_archived/{uid}/{docId}` per-UID strict §36.75
- **§56.17 Service Worker Auth State Caching (1 sub):** SW + Firebase Auth coexistence standard SDK pattern
- **§56.18 Daniel Manual Setup Pre-CC (2 sub):** Firebase Auth Console + `suport@andura.app` MX
- **§56.19 Scope OUT v1.5+ (3 sub):** marketing email opt-in OUT + deep linking OUT + logout all devices revoke OUT

**Cross-refs:** [[ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 (Faza 2 wiring spec LOCKED V1 inline) | [[026-offline-coaching-decision-tree-exhaustive]] (Priority 2 compile 126 decisions ready, post-CC Auth) | [[023-llm-intent-interpretation]] (Safety tier preserved) | `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (initial drafts created from §56.8.2/3 templates LOCKED V1, Daniel validate sprint pre-Beta) | [[HANDOVER_GLOBAL_2026-04-30_evening]] §56.1-§56.19 verbatim + §57 cumulative + §58 priorities + §59 DIFF_FLAGS + §60 cross-refs + §61 topics + §36.75 (DB Rules per-UID strict extended) + §36.78/§36.79/§36.80 (Rebrand + Hotfix + BUG 2 RESOLVED chat strategic) + §36.93 (D3 Spark retain) + §36.94 ADR 025 (Instant Skip pattern reused `getUserPath()=null` graceful degradation) + §36.99 (offline-first preservation §56.11.2) + §50.4 Q20 §45.3 (Q20 pattern reuse — record-level LWW NU duplicate logic) + §46 P4 (audit legal post-Beta v1.5 prerequisite preserved Privacy Policy GDPR profundă)

**Next:** CC Opus Auth Flow §36.80 implementation Priority 1 ABSOLUT (~30-45 min CC autonomous factor 7-9x clusters mari) — scope cross-file integrare ~10 fișiere `firebase.js` + `auth.js` + `pages/auth.js` + `index.html` + `main.js` + `_migration` flow + `_deleted` lifecycle + `_archived/` archive flow + IndexedDB namespace per UID + Firestore rules update + wording RO LOCKED + Playwright e2e + `admin-cleanup.js` script + setup Daniel runbook documentation. **Daniel manual prep prerequisites pre-CC:** Firebase Auth Console (~15 min) + `suport@andura.app` MX forward (~15 min) + Privacy Policy + ToS validate sprint (~30-60 min, initial drafts created vault).

---

## 2026-05-05 morning — D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED V1 (41 substantive net)

**Status:** Chat strategic dedicat sub-decisions D3.1 (Buton "Nu vreau") + D4 NEW (Mid-Session Resume Protocol) + D2 (Injury/Contraindication Mapping) + D1 (Save the Week Silent). Total **41 substantive sub-decisions LOCKED V1** ready compile ADR 026 draft full chat strategic NEW dedicat. Cumulative LOCKED 175 → **216**.

**Context arhitectural confirmat:**
- D3.1 + D4 + D2 + D1 = sub-decisions ortogonale față de spec engine Periodization (§42.4 prima spec generation post ADR 026 compile)
- Toate 4 clusters integrate ADR 026 când chat strategic NEW dedicat compile draft full
- Naming distinction LOCKED: "Circuit Breaker population fallback 5%" (§42.7) vs "User adaptation signal 50%" (D1 Q7 individual user pattern T1+ Profile Typing v1.5 trigger)
- Pattern reuse extensiv: Q20 LOCKED 3/4 threshold (§45.3) reused în D4 Q7+Q8 + D1 Q2+Q3; §42.7 Circuit Breaker reused în D3.1 Q10 + D1 Q7; §42.9 Safety tier extended cu invariant 5 "Medical Safety" în D2 Q7

**Decizii LOCKED — see HANDOVER_GLOBAL §50.1-§50.4 verbatim sub-sections:**

- **§50.1 D3.1 Buton "Nu vreau" (13 sub-decisions):** Q1 Firestore sync blacklist + Q2 Object schema `{exerciseId: {timestamp, intent}}` + Q3 Eventual consistency on session start + Q4 Same muscle + movement pattern substitute + Q5 3 fresh batch + Hard Cap max 7 încercări + Q6 Lock primary substitute intra-mesociclu + Sub-decision Unlock muscle-group-level tracking + Q7 Skip exercise + Circuit Breaker §42.7 reuse + Q8 Imediat next session zero memory + Q9 Settings list unblock per item + Q10 Aggregate count silent CDL + **D3.1.6 NEW Pattern Detection Passive 3-5 refuze soft prompt (Bugatti F4)**

- **§50.2 D4 NEW Mid-Session Resume Protocol (11 sub-decisions):** Q1 Per set logged silent IndexedDB + Q2 IndexedDB storage + Q3 Firestore sync on session complete + Q4 Dialog blocking imediat la app open + Q5 3 opțiuni (Reia/Începe nouă/Marchează completă) + **D4.2.1 NEW Filtrarea Dialog Blocant Threshold 6h** (Sesiune Recuperabilă Δt≤6h dialog blocking / Sesiune Abandonată Δt>6h Silent Cleanup zero prompt) + Q6 6h timeout abandon + Q7 Credit parțial proporțional Q20 §45.3 reuse + Q8 Count cu intensity hold next + Q9 Unified state machine 3 entry points (Background/IndexedDB/localStorage) + Q10 Last completed set saved current incomplete discarded

- **§50.3 D2 Injury/Contraindication (13 sub-decisions):** Q1 Preset list ~15-20 condiții comune onboarding + Q2 3-tier severity (sever blacklist / moderat plafonare RIR≥2 75% 1RM / ușor monitorizare pasivă) + Q3 Curated subset + literature ref per condition + **D2.3.1 NSCA+ACSM Daniel curate** + **D2.3.2 Quarterly Knowledge Sprint unified** + **D2.3.3 Disclaimer mandatory consent + per-condition** + Q4 NEW D2 button "Mă doare" semantic distinct de D3.1 "Nu pot" + Q5 3-tier severity auto-action (ușor RIR+1 / moderat skip+alt / sever STOP+flag medical) + Q6 Permanent blacklist după 2-3 incidente "Mă doare" + Q7 5th invariant "Medical Safety" Floor Absolut §42.9 extension + Q8 Pregnancy Defer post-Beta v1.5 + Q9 Hybrid manual unblock + soft prompt 4-6 săpt re-introduce + Q10 NU track injuries telemetry pre-Beta GDPR strict

- **§50.4 D1 Save the Week Silent (7 sub-decisions):** Q1 C Silent default (zero fricțiune) + Q2 3/4 sesiuni planificate Q20 §45.3 reuse + Q3 Counts cu progression skip Q20 reuse + Q4 Subtle micro-copy istoric + Q5 Maximum 2 saved weeks consecutive cap (3rd repeat integral, anti-drift volume calibration) + Q6 Save week prima + goal change next mesocycle (Q27 50% threshold reuse) + Q7 Track + Circuit Breaker reuse §42.7 + **naming distinction LOCKED V1: Circuit Breaker population fallback 5% (§42.7) vs User adaptation signal 50% (D1 Q7 individual T1+ Profile Typing v1.5 trigger)**

**§38 Decision Points table updates:** D1 OPENED → LOCKED V1 (§50.4) + D2 NEW OPENED → LOCKED V1 (§50.3) + D3 NEW OPENED → D3.1 LOCKED V1 (§50.1) D3.2-D3.4 chat NEW separate Priority 4 + D4 NEW LOCKED V1 (§50.2) added.

**Cross-refs:** [[026-offline-coaching-decision-tree-exhaustive]] (ready compile 126 decisions chat NEW Priority 2) | [[023-llm-intent-interpretation]] (Safety tier extended cu invariant 5 Medical Safety §50.3.10) | [[018-engine-extensibility-architecture]] (Dimension Registry foundation) | [[025-andura-gandeste-pentru-user]] (Instant Skip principle reused D3.1 + D4) | [[HANDOVER_GLOBAL_2026-04-30_evening]] §50.1-§50.4 verbatim + §51 cumulative + §52 priorities + §53 DIFF_FLAGS + §54 cross-refs + §55 topics + §36.107 (D1/D2/D3.1 OPENED → LOCKED V1) + §36.99 (offline-first §50.1 Q3 + §50.2 Q2) + §36.55.4 (abandoned session neutral streak §50.2 D4.2.1 + §50.4 trigger) + §42.7 (Circuit Breaker pattern reused §50.1 Q10 + §50.4 Q7) + §42.9 (Safety tier extended invariant 5 §50.3.10) + §42.10 (Periodization muscle-group-level tracking §50.1 Q6 unlock + §50.2 Q7+Q8) + §45.3 Q20 (3/4 threshold rule reused §50.2 Q7+Q8 + §50.4 Q2+Q3)

**Next:** Compile ADR 026 draft full din §42 base (10) + §45 spec (75) + §50.1 D3.1 (13) + §50.2 D4 (11) + §50.3 D2 (13) + §50.4 D1 (7) + naming distinction = **126 decisions LOCKED V1** ready compile in `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (replace candidate stub) + Periodization Engine spec generation start per dimension cross-persona Q30 LOCKED. Chat strategic NEW dedicat post Auth Flow §36.80 BUG 2.

---

## 2026-05-04 night — ADR 026 SPEC SESSION COMPLETE 75 Decisions LOCKED V1 + Engine #8 NEW + §47 Alignment Questions Rule LOCKED V1

**Status:** Chat strategic dedicat ADR 026 spec generation (4 batches × 10 Q-uri + Engine #8 NEW + 17 refinements). Total **75 substantive decisions LOCKED V1** ready compile ADR 026 draft full + Periodization Engine spec generation start. Cumulative LOCKED 100 → **175**.

**Context arhitectural confirmat post-batch:**
- 22 engines total (14 reactive existing + **8 prescriptive NEW** ← META §36.100 amendment 7→8, Engine #8 Warm-up & Mobility NEW pre-Beta MANDATORY)
- ADR 026 = META-arhitectură global concerns SSOT (format ramură + cross-engine merge + testing + storage + fallback + versioning)
- Periodization Engine = §42.4 LOCKED prima spec generation (post ADR 026 compile)
- Persona priority bottom-up Maria 65 → Gigica 35 → Marius 25 (Q8 LOCKED)
- Spec generation chat split = per dimension cross-persona (Q30 LOCKED)
- Estimated effort: 3-4 chat-uri strategic Periodization spec full

**Decizii LOCKED Batch 1-4 (Q1-Q40 + 17 refinements) — see HANDOVER_GLOBAL §45.2-§45.5 verbatim:**

- **Batch 1 (Q1-Q10) §45.2:** Schema TypeScript Strict typed (Q1) + WhyEngine Hybrid (Q2) + Cross-engine Safety>pipeline (Q3 + Safety tier composition refinement) + Versioning Hybrid program-level + per-engine override (Q4) + Testing Bugatti standard 4 invariants + 100 persona + 1000 property-based (Q5) + Documentation Hybrid JSDoc + markdown narrative (Q6) + Periodization Block + Linear pre-Beta (Q7 + Linear allocation rule refinement) + Persona order Bottom-up Maria → Gigica → Marius (Q8) + Volume Landmarks Israetel constants V1 (Q9 + Marius mitigation UI v1.5) + Mesocycle 4 weeks default + adaptive override (Q10)

- **Batch 2 (Q11-Q20) §45.3:** Telemetry CDL 90 zile rolling (Q11) + Engine activation conditional Specialization only (Q12 + AND condition explicit) + Per-domain folder structure (Q13) + BranchId Semantic hierarchical (Q14 + Template Literal Type + CI uniqueness) + Deprecation T-30 SUFLET F1 (Q15) + Periodization abstract priority + alternativeEngine concrete (Q16 + JSON output spec) + Frequency Adaptive (Q17) + Double progression (Q18) + Israetel 11-12 muscle groups (Q19 + Maria 65 Dual-Layer mapping 6 functional movement patterns) + Resume + intensity hold (Q20 + 3/4 threshold rule + week 1 strict 4/4 cold-start)

- **Batch 3 (Q21-Q30) §45.4:** Mesocycle Adaptive (Q21 + Marius 5:1 dual-signal extension) + Beginner→Intermediate Performance-based 3-consecutive (Q22 + Linear progression failure definition rep stagnation OR RIR 0 hit 3 sessions same weight) + Equipment Graceful via alternativeEngine (Q23) + Special populations Defer D2 (Q24 + Safe Baseline pre-Beta concrete RIR ≥ 1 universal + Marius 25 Advanced 85% 1RM cap) + Plateau Per-persona (Q25 + Plateau vs Regression Maria 65 distinction >15% drop 2+ sesiuni) + Off-cycle Detraining-aware per duration (Q26: 2-3w 80%v/90%i + 4-6w 60%v/80%i + 6+w fresh + Mujika/Bosquet literature) + Goal change Force complete current (Q27 + 50% threshold rule cancel<50% / finish≥50%) + Coaching tone Inline rationale brief Q2 reuse (Q28) + Performance budget <100ms/engine + <500ms total pipeline RAIL (Q29 + CI test enforce) + Spec generation Per dimension cross-persona (Q30)

- **Batch 4 (Q31-Q40) §45.5:** Warm-up Separate Engine (Q31 → enables Engine #8 NEW) + Rest periods Per persona × intensity × goal (Q32: Maria 60-90s + Gigica 1-3min + Marius 3-5min) + Tempo Persona-aware (Q33: Maria verbal + Gigica hybrid + Marius numeric 3-0-X) + Variation Per-persona adaptive (Q34 + Gigica hybrid rule 1-2 swap × every 2 mesocycles) + Session duration adapts (Q35: 15/30/45/60/90 min input T2+ profile typing) + Multi-goal Single primary V1 pre-Beta (Q36 + UI v1.5 roadmap) + Asymmetry Defer post-Beta v1.5 (Q37) + Periodization-Cut Phase-agnostic + Goal Adaptation redistribuie (Q38) + Exercise order Per persona × goal (Q39: Maria functional first / Gigica/Marius compound first) + RIR Tier-based universal verbal + actual silent UI + bar speed opt-in Marius (Q40)

**Engine #8 Warm-up & Mobility LOCKED V1 NEW (§45.6) — META §36.100 amendment 7→8 prescriptive engines (22 total = 14 reactive + 8 prescriptive):**

1. Scope strict pre-Beta — activare neuromusculară universal + mobility general ONLY (NU corrective therapy NU biomechanical limitations medical-adjacent → D2 v1.5 defer Q24 pattern)
2. Pipeline placement §42.10 sequential extension: `Periodization → Goal Adaptation → Energy → Exercise Selection → Warm-up & Mobility → Execution`
3. Persona thresholds pre-Beta: Maria 65 mobility flow 5-10min + Gigica 35 dynamic 5min + 1 ramp set + Marius 25 ramp 50%/70%/90% × 3-5 sets heavy compounds
4. Pre-Beta MANDATORY (Bugatti injury safety > scope discipline; ~50-80 ramuri V1; +1-2 chat-uri strategic spec post-Periodization)
5. Instant Skip principle (§36.94 ADR 025 reuse): default T0 skip → engine auto-calculates ramp-up sets integrated în first exercise; T1+ Profile Typing opt-in expanded; in-session toggle skip = collapse to ramp-up only

**Cooldown C Defer post-Beta v1.5 (§45.6 final).**

**Light Flags LOCKED V1 (§45.7):** Maria 65 deload 50% volume reduction intensity preserved (Galvão 2010 + Fragala 2019 elderly literature) + Q16 JSON output format `{ primary_movement_pattern, accessory_priority, compound_first, intensity_zone_target, tempo_cues, rest_period_seconds }`.

**§47 Alignment Questions Generation Rule LOCKED V1 NEW:** CC Opus MUST genera `ALIGNMENT_QUESTIONS_CHAT_NEW.md` exclusiv în format SEARCH-DRIVEN. Pre-fed verbatim DEPRECATED post 2026-05-04 night. Cross-refs amendments: VAULT_RULES §HANDOVER_PROTOCOL step 9 + PROMPT_CC_HYGIENE §9 + memory rule #22 (Daniel chat side).

**Cross-refs:** [[026-offline-coaching-decision-tree-exhaustive]] (candidate stub → ready compile draft full chat NEW Priority 2) | [[018-engine-extensibility-architecture]] (Dimension Registry foundation §42.3) | [[023-llm-intent-interpretation]] (LLM scope strict + Safety tier composition Q3) | [[022-bayesian-nutrition-inference]] | [[024-goal-driven-program-templates]] | [[025-andura-gandeste-pentru-user]] (Instant Skip principle §45.6 reuse) | [[HANDOVER_GLOBAL_2026-04-30_evening]] §45-§49 + §36.82 (Energy 🟢/🟡/🔴 cross-ref Q21) + §36.100 (META amendment 7→8) + §36.94 (ADR 025 pattern reuse) + §36.35 (calibration window §42.8 + Q15)

**Next:** Compile ADR 026 draft full din §42 base + §45 spec session = 85 decisions LOCKED V1 (10 base §42 + 75 spec §45) + Periodization Engine spec generation per dimension cross-persona (Q30 LOCKED): chat 1 Volume Landmarks all 3 persona + chat 2 Frequency Distribution + chat 3 Progressive Overload + chat 4 Mesocycle Structure (~3-4 chat-uri estimative). Chat strategic NEW dedicat post Auth Flow §36.80 BUG 2.

---

## 2026-05-04 evening — ADR 026 Spec Decisions 1-10 LOCKED V1 (chat strategic 2026-05-04)

**Status:** 10 decizii fundamentale ADR 026 "Andura Offline Coaching Decision Tree Exhaustive" LOCKED V1 ready compile draft full chat NEW. Cumulative LOCKED 90 → 100.

**Context:** 21 engines total (14 reactive existing + 7 prescriptive NEW §36.100). 1500-2000 ramuri SUM agregată distribuită ACROSS engines. ADR 026 = META-arhitectură global concerns SSOT (format ramură + cross-engine merge + testing + storage), NU monolith. ADR-uri engine individuale (022/024/etc) = domain-specific.

**Decizii LOCKED V1:**

1. **§42.1 Format ramură INTERN engine — B Standard** ✅ LOCKED — INPUT/CONDITION/OUTPUT/RATIONALE/CROSS_REF schema standardizată (persona signals → boolean tree → periodization block + volume landmarks + intensity zone + tempo cues, literature ref + ADR cross-refs). Type-safe TS extensibil. Trasabilitate audit-trail + alimentează WhyEngine + cod auto-documentat verificabil producție.

2. **§42.2 Granularitate condiții — Hybrid B Medium baseline + C Fine selectiv** ✅ LOCKED — B baseline age groups <30/30-45/45-60/60-70/70+ × sex × experience. C Fine selectiv 3 interacțiuni critice: vârstă × obiectiv (deload volume 65 ani slăbire vs 20 hipertrofie) + experiență × intensitate (RIR 0 begin vs advanced) + sex × volume landmarks (femei upper body MEV/MAV/MRV). Push-back chat: C Fine brute force 30000-50000 ramuri × 21 engines = ship NEVER + halucination risk femeie 75+ Forță advanced ZERO literature. Total 1500-2000/engine sustained sănătos.

3. **§42.3 Cross-engine merge META — B Extends Arbitrator existing via Dimension Registry ADR 018** ✅ LOCKED — Engines prescriptive contribuie verdicte via Dimension Registry către voices temporale existing (Periodization → HISTORICAL + REALTIME + PROJECTION). Verdicte agregate intră Arbitrator 5-level Precedence + 27 reguli unchanged. ZERO change Arbitrator. ZERO voce nouă (5 voices LOCKED, voice 6-th GOAL rejected §26.2 preserved). Slip clarificare: termenul "voce virtuală" REJECTED (drift conceptual periculos vs 5-voice lock). Wording corect SSOT: "engines contribuie verdicte prin Dimension Registry, NU devin voci".

4. **§42.4 Engine spec generation order — A Periodization prima** ✅ LOCKED — Periodization trasează limitele maxime volum + intensitate organism susține (MEV/MAV/MRV per muscle group + block periodization phase). Toate celelalte engines = filtre reglaj fin în interiorul cadrului fundamental. Order roadmap proposed: Periodization → Goal Adaptation → Bayesian Nutrition → Deload → Energy → Tempo → Specialization.

5. **§42.5 ADR 026 scope — B Standardizator** ✅ LOCKED — ADR 026 conține Global Concerns SSOT (format ramură global + cross-engine merge protocol + testing strategy + storage mechanisms + fallback telemetry circuit breaker + versioning deprecation window). ADR-uri engine individuale conțin Domain Concerns (formule specifice kcal Bayesian / logic Cut/Bulk/Maintain Goal Adaptation / specificități biomecanice domain). Push-back chat: C Comprehensive monolith 200+ pagini → nimeni citește → drift IRONIC mai mare decât B. Pattern industry standard separation of concerns.

6. **§42.6 Storage format ramuri — B Separate `engine-name.tree.ts` data file** ✅ LOCKED — Logic engine în `<engine-name>.engine.ts` + data ramuri în `<engine-name>.tree.ts` separat (split logic vs data, same repo, same monorepo). Tests izolat ramuri direct + tree-shaking Vite corect + grep metadata <5ms + type-safe TS const exhaustiv + updatable repo deploy. Data NOT decoupled în JSON/Firestore (over-engineering pre-Beta, runtime swappable feature aşteaptă post-Beta dacă demand real).

7. **§42.7 Fallback ZERO match — Safe-baseline + CDL telemetry + 5% Circuit Breaker per segment** ✅ LOCKED — (1) ZERO match input → engine returns safe-baseline coarse generic per goal/age (NU refuză NU LLM escalate runtime — păstrăm offline ZERO LLM core paths preserved §36.99). (2) CDL log injectează `fallback_triggered: true` + persona signals snapshot (telemetry passive monitoring). (3) Circuit Breaker 5% threshold per segment Maria/Gigica/Marius — dacă rate fallback > 5% segment → trigger Hotfix Knowledge Sprint imediat NU așteaptă cycle quarterly. Push-back chat: catch-all silențios = data sit there ramuri lipsă luni. Telemetry passive = insufficient single. Circuit Breaker activ = visible alarm + actionable cadence acceleration peak readiness.

8. **§42.8 Versioning quarterly updates — Additive + 18 luni deprecation window V_N-2** ✅ LOCKED — Update Q2 2026 → V2 ramuri additive (V1 useri existing rămân unchanged mid-program). 18 luni deprecation window V_N-2 → după 18 luni V1 sunset, useri migrate automat la V_latest în calibration window §36.35 (NU instant rupt). Maintenance ceiling: max 3 versions concurrent (V_latest + V_N-1 + V_N-2 deprecated → migration). Push-back chat: Pure Additive forever = 12 versiuni active 2030 = maintenance hell. Pure Full replace = trust breach mid-mesociclu user (Bugatti F5 push-back proporțional violation). Hybrid Additive + Deprecation 18 luni = balance respect user effort + maintenance cost.

9. **§42.9 Testing strategy — Hibrid Property-based + Persona Suite + 4-Invariant Safety Stack** ✅ LOCKED — Property-based (random persona × verify output sane via invariants — breadth coverage). Persona simulation suite (Maria/Gigica/Marius scenarios fixe + edge cases curated, ~50-100 tests representative — depth coverage). 4 invariante imutabile mandatory pass: (1) Volum V ≤ MRV per muscle group; (2) Intensitate RIR ≥ 0 (never below failure); (3) Frecvență ≤ 6 sessions/week per muscle group; (4) Deload mandatory după 4-6 weeks mesocycle. Push-back chat: V ≤ MRV singur = miss user gaming MRV cu RIR -2 + frequency 7x = pasted check dar overall unsafe combo. Stack 4 invariants = bulletproof safety net cumulative.

10. **§42.10 Engine activation order runtime — Sequential + Constraint Object Floor/Ceiling Range ±15%** ✅ LOCKED — Pipeline runtime per session build: (1) Periodization generează coridor (Floor + Ceiling) baseline (ex: 12-16 seturi pectorali săpt). NU ceiling-only. (2) Goal Adaptation redistribuie volume în interiorul coridorului (slăbire scade chest 12 + crește picioare 16; hipertrofie reverse). NU trece peste Ceiling NU sub Floor. (3) Energy Adjustment fluctuează ±15% baseline coridorului. Bidirectional NU only-decrease (zile peak readiness sleep 9h + stress low + RIR bank → UP boost +15% accelerator overload progressive real). Zile fatigue → DOWN -15%. Constraint Object immutable propagat engine la engine (TypeScript readonly type-safe). Push-back chat: Energy only-decrease = miss opportunity peak readiness zile bune. System adevărat Bugatti harvests good days NU just survives bad ones.

**Cross-refs:** [[026-offline-coaching-decision-tree-exhaustive]] (candidate stub, compile draft full PENDING chat NEW Priority 2) | [[018-engine-extensibility-architecture]] (Dimension Registry foundation §42.3) | [[023-llm-intent-interpretation]] (LLM scope strict preserved unchanged §42.7) | [[022-bayesian-nutrition-inference]] (engine #3 §42.4 order, stub PENDING) | [[024-goal-driven-program-templates]] (engine #2 §42.4 order, stub PENDING) | [[HANDOVER_GLOBAL_2026-04-30_evening]] §42.1-§42.10 + §43 next actions + §44 cumulative 100

**Next:** Compile ADR 026 draft full din §42 deciziile 1-10 LOCKED + start Periodization Engine spec generation (~150-300 ramuri × ~2-3 chat-uri spec complete bottom-up persona-driven Maria→Gigica→Marius). Chat strategic NEW dedicat post Auth Flow §36.80 BUG 2.

---

## 2026-05-04 evening — §CHAT_CONTINUITY_PROTOCOL LOCKED V1 (vault meta-tooling)

**Status:** Vault meta-tooling decision (NU product/architecture). Codifică layer SSOT live deasupra `§HANDOVER_PROTOCOL` existing pentru chat-to-chat fast iteration între deep merges. Zero impact pe product scope/architecture decisions cumulative count.

**Authority:** Daniel directive 2026-05-04 evening — chat NEW startup ~5000+ LOC `HANDOVER_GLOBAL` (split candidate per §VAULT_HYGIENE_PASS STEP 13) integral citire = friction nesustenabil, plus ~1h CC deep handover overhead per saturation cycle = 50% productivity loss real.

**Decision:** Add layer light deasupra `§HANDOVER_PROTOCOL` existent (NU înlocuiește):
- `00-index/CURRENT_STATE.md` SSOT live ~200 LOC append-only architecture (`NOW + JUST_DECIDED + NEXT + ACTIVE_REFS + ACTIVE_ADRS + ACTIVE_FLAGS + RECENT + POINTERS`)
- Chat NEW startup layered read mandatory 4-step (CURRENT_STATE → HANDOVER active sections → top 3 ADRs → DIFF_FLAGS P1)
- Fast handover workflow ~5-10 min CC: APPEND-only `## JUST DECIDED` + move-then-replace `## NOW` (precedent → `## RECENT`) + APPEND DECISION_LOG + archive artefact + commit/push
- Deep merge `§HANDOVER_PROTOCOL` existing preserved unchanged (saturation-driven, weekly/major milestone, DIFF Protocol §7 + ALIGNMENT_QUESTIONS §9 ≥12/15)

**Append vs replace reconciliation per section CURRENT_STATE:**
- Content history sections (`## JUST DECIDED`, `## RECENT`, `## POINTERS`) = strict append-only
- Active state pointers (`## NOW`, `## NEXT`, `## ACTIVE_*`) = overwrite OK (precedent `## NOW` move-uit la `## RECENT`, NU lost)

**Files modified atomic single batch (Pas 1):**
- UPDATED: `VAULT_RULES.md` (§CHAT_CONTINUITY_PROTOCOL NEW §CC.1-§CC.8 + §HANDOVER_PROTOCOL STEP 16 amendment)
- UPDATED: `PROMPT_CC_HYGIENE.md` (§10 fast-handover workflow + §11 chat NEW startup verify format)
- UPDATED: `00-index/INDEX_MASTER.md` (CURRENT_STATE "READ FIRST" entry top navigation + header refresh)
- UPDATED: `03-decisions/DECISION_LOG.md` (this entry)

**Pas 2 (separate commit):** CREATE `00-index/CURRENT_STATE.md` din state real (read HANDOVER_GLOBAL actual + DECISION_LOG actual + DIFF_FLAGS actual, sintetizează din ele — NU pre-fed content).

**Backup tag:** `pre-chat-continuity-protocol-2026-05-04` (rollback safety).

**Cross-refs:** [[VAULT_RULES]] §CHAT_CONTINUITY_PROTOCOL §CC.1-§CC.8 + §HANDOVER_PROTOCOL STEP 16 amendment | [[PROMPT_CC_HYGIENE]] §10-§11 | [[INDEX_MASTER]] navigation top entry "READ FIRST".

**Next:** Pas 2 — generate CURRENT_STATE.md from real state synthesis.

**Note explicit:** §CHAT_CONTINUITY_PROTOCOL = vault meta-tooling. NU contabilizat în cumulative LOCKED count product/architecture decisions (separate concern — meta-tooling decisions live aici în DECISION_LOG dar NU inflate domain decision count care tracking-uiește product scope).

---

## 2026-04-30 evening — Gemini cross-check + ADR 020-021 + amendments

**Status:** Cross-check Gemini 3 Pro on 8 vault docs (VAULT_RULES, PROJECT_VISION, COGNITIVE_ARCHITECTURE_SPEC_v1, ADR 009, 011, 013, 018, 019) → 4 action items new + 1 sugestie respinsă. D1-D15 routing 15/15 locked.

**Action items new (acceptate Daniel + Claude):**

1. **ADR 020 Storage Tiering Strategy** — Tier 0 hot (`localStorage` 30d, ~1-2MB), Tier 1 warm (`IndexedDB` via Dexie.js, 30-180d, 50-500MB), Tier 2 cold (Firebase >180d). Rotation trigger `initAutoBackup` + threshold size>4MB sau age>30d. **CRITICAL pre-launch v1** (Gemini Q10 BLIND SPOT #1 — PWA limit ~5MB).
2. **ADR 021 Calibration Drift Reconciliation** — `engine_tier` Max Wins Monotonic, `calibration_confidence` Monotonic Clock (negative observations preserved), Version Vector pe object calibration cu max-merge sync. Pre-Faza-2 T&B (Gemini Q10 BLIND SPOT #2).
3. **PRODUCT_STRATEGY §3.5.1 Strong Prior Strategy (Tier-Based)** — T0 Skip = Demographic Prior baseline; T0 + Self-report = Strong Prior 80% input + 20% baseline (calibration time -50%); T1+ behavioral inference erodează. Cross-ref ADR 022 Bayesian Sprint 4 (Gemini Q9).
4. **ADR 013 amendment composite no-double-penalize** — signals 4 + 5 share trigger event ("skip recovery day") → composite tier function dedupe per `trigger_signature` (NU per signal index). Sprint 4 implementation detail (Gemini F1 counter-point accepted).

**Sugestie Gemini respinsă:**

- **Consolidare AA signals 4+5 în "Recovery Non-Compliance"** — granularitatea AA messaging anti-RE = critică pentru user clarity ("ignori oboseală" ≠ "skip rest day" mesaje diferite). ADR 013 §1 lock-uit (5 signals separate preserved).

**D1-D15 routing 15/15 locked:**

D1 ADD DEVELOPING (6 nivele Sprint 4 ~8-12h) | D2-D4 DEFER Sprint 1.5 anti-RE wording | D5 categorical only verdict | D6 REZOLVAT post-rollover | D7 Stryker autonomous overnight Sonnet baseline + Daniel review | D8 Sonnet generates JSON 5/sprint | D9 GDPR validation post-100-real-users | D10 REZOLVAT outbox migration | D11 Magic Link primary + Google secondary | D12 2 anonymous accounts pre-launch + flag pre-Faza-1 merge | D13 T&B Faza 2 logs first | D14 BranchConflictModal 3 options + auto-resolve cronologic | D15 pre-expiry refresh 10min + retry 401.

**Schema outbox LATEST.md activă** — `📤_outbox/LATEST.md` = 1 file vizibil + `_archive/2026-04/` 13 files cronologic.

**Cross-refs:** [[020-storage-tiering-strategy]] | [[021-calibration-drift-reconciliation]] | [[013-auto-aggression-detection]] §AMENDMENT 2026-04-30 evening | [[PRODUCT_STRATEGY_SPEC_v1]] §3.5.1 | [[HANDOVER_GLOBAL_2026-04-30_evening]] §6.7 (effort updated 137-214h tradițional → 15-29h velocity Opus)

**Next:** Sprint 4 implementation start (ADR 020 prioritate maxim — pre-launch critical).

---

## 2026-04-30 — ADR 009 AMENDMENT — Tier System SSOT ACCEPTED

**Status:** Amendment formalized post chat strategic 2026-04-29 (Daniel + Claude Opus 4.7). Closes AUDIT_5000Q Q-0182.

**Decizie SSOT:** Două axe ortogonale, NU contradictorii:
- `engine_tier` (T0/T1/T2) = data volume axis → controlează voice weighting (R8/Q15)
- `calibration_confidence` (COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED) = signal quality axis → controlează pattern learning gates (ADR 009)

**Forward-compatible:** N axes future (nutrition/sleep/fiber calibration) follow same pattern.

**Migration:** Sprint 1 docs only. Sprint 2 decision needed: (a) DEVELOPING tier add or remove (handover SSOT 6 nivele vs ADR 009 active 5 nivele), (b) code refactor renaming + schema versioning bump.

**Cross-refs:** [[009-calibration-tiers]] §AMENDMENT 2026-04-30 (consolidated inline) | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] | [[PRODUCT_STRATEGY_SPEC_v1]]

**Next:** Sprint 2 — code refactor decision + DEVELOPING tier add/remove decision.

## 2026-04-27 — ADR 017 Demographic Prior Database ACCEPTED

**Status:** 7/7 decision points approved post-Opus draft review.

**Componente specificate:**
1. Profile schema — 11 dimensions (age, sex, kg, height, BMI, job, lifestyle, goal, training_history, equipment, time_availability)
2. Profile mix — 50 manually crafted (6 anchor personas + 44 edge cases) + 450 algorithmic = 500 total
3. Behavioral generator — rule-based shape + stochastic Gaussian noise (calibratabil, NU ML)
4. Storage — runtime in-memory generation, ~10 MB, ~50ms startup, zero persistence
5. Plugin architecture (ADR 018) — DemographicPriorDimension cu standardized contract, T0 active singura
6. Tier gating — T0-only hard gate (T1+ skip dimension entirely)
7. Lookup — K-NN linear scan K=10 (sub-ms la N=500)
8. Lifecycle — 100+ users reali T1+ + Daniel manual review = trigger deprecation Phase 3

**Anchor personas:** Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35.

**Cross-refs:** [[017-demographic-prior-database]] | [[018-engine-extensibility-architecture]] | [[016-vitality-layer]] | [[014-onboarding-profile-typing]] | [[011-coach-decision-log-architecture]]

**Reconsider trigger:** N=100 users threshold poate sub-cover cohorts; Daniel manual review = sanity check implicit.

**Next:** Sprint Foundation ADR 018 (build infrastructure: Dimension Registry + Standardized Contract + Decision Cluster + Schema Versioning + Feature Flags). LAST SPEC DONE — toate fundațiile arhitecturale locked.

## 2026-04-27 — ADR 014 Update Profile Typing Tier-Aware ACCEPTED

**Status:** 3/3 decision points update approved post-Opus draft review.

**Update scope:**
1. Tier-Based Personalization Pattern — T0 skip (demographic prior), T1+ Profile Typing activate, T2+ Vitality activate
2. Plugin Architecture Integration (ADR 018) — Profile Typing devine dimension cu standardized contract, stage ADJUSTMENT, priority 65, enabledFlag profile_typing_v1, schemaVersion 1
3. Reconciliation cu Vitality Layer (ADR 016) — independent dimensions, cluster helper resolveProfileVitalitySignals, source attribution în signals

**Decision points approved:**
- DP-1 Tier gating: B — T1 INITIAL
- DP-2 Stage assignment: A — ADJUSTMENT primary cu ENHANCEMENT secundar
- DP-3 Overlap signal handling: A — Keep all flags + source attribution

**Cross-refs:** [[014-onboarding-profile-typing]] | [[018-engine-extensibility-architecture]] | [[016-vitality-layer]] | [[011-coach-decision-log-architecture]]

**Next:** ADR 017 Demographic Prior Database (last spec înainte de Sprint Foundation).

## 2026-04-27 — ADR 016 Vitality Layer ACCEPTED

**Status:** 6/6 decision points approved post-Opus draft review.

**Componente specificate:**
1. Delivery — background prompt cu dismiss (T2 trigger, opt-in friction-zero)
2. Response format — Numeric Likert 4-point (UI labels, engine numeric)
3. Coupling Profile Typing — independent dimensions, cluster cross-reference
4. Tier gating — T2 PERSONALIZING (28 zile + 12 sesiuni)
5. Storage — dual (vitality-responses key + CDL context.vitality snapshot)
6. Rollout — conservative 0%→10%→50%→100% per ADR 018 §5

**Cross-refs:** [[016-vitality-layer]] | [[018-engine-extensibility-architecture]] | [[014-onboarding-profile-typing]] | [[011-coach-decision-log-architecture]]

**Reconsider trigger:** completion rate threshold ≥30% Phase 1 recalibrate după date reale.

**Next:** ADR 014 update Profile Typing tier-aware.

## 2026-04-27 — ADR 018 Engine Extensibility Architecture ACCEPTED

**Status:** 7/7 decision points approved post-triangulation review.

**Componente specificate:**
1. Dimension Registry (static array)
2. Standardized Dimension Contract (async-capable)
3. Decision Cluster Engine (stacked stages: GATE → ADJUSTMENT → ENHANCEMENT)
4. Schema Versioning + Migration Runner (eager, per-dimension)
5. Feature Flags Infrastructure (per-user rollout, hash bucketing)

**Migration path:** AA + Profile Typing port via gradual strangler pattern.

**Cross-refs:** [[018-engine-extensibility-architecture]] | [[004-rule-engine-numeric-priorities]] | [[013-auto-aggression-detection]] | [[014-onboarding-profile-typing]]

**Next:** ADR 016 Vitality Layer (depends ADR 018 done) sau build infrastructure ADR 018.

## 2026-04-27 — TASK #7 Friction Modal HIGH Tier LIVE + E2E Fix + 2 fail-uri pre-existing flagged

**Scope:** 3 commits substanțiale post-handover sesiunea 27 apr.

**E2E fix applied-patterns assertion (commit 8d2dae9):**
- `tests/e2e/smoke/critical-paths.spec.js:116-119` — assertion update post TASK #2 CDL_KEYS migration
- `applied-patterns` PRESERVED la resetTestData per ADR 011 (CDL_KEYS semantic), NU wiped
- `auto-recommendations` rămâne wiped (TEST_RESIDUE_KEYS legitim)
- Fix: 2 linii schimbate + 2 comment-uri. Strategie A (update assertion, NU split în 2 teste).
- Motiv: unit tests dataCleanup acoperă deja fullReset wipe CDL — E2E split = duplicat cost zero benefit
- 559/559 unit tests maintained. Push to main.

**TASK #7 — HIGH tier friction modal UI complete (commit d4a167c):**
- `src/pages/coach/aaFrictionModal.js` (NEW) + `aaFrictionModal.test.js` (24 tests, target era 12+)
- Bottom-sheet mobile-first, swipe-down = cancel, force dark backdrop
- Typing confirmation **data-injected** (decision update ADR 014 §5): `"continui peste {N} signals în 14 zile"` — frază unică per modal, anti-reflex paste
- Escalation pattern: a 2-a override în 7 zile = phrase mai lung + warning vizibil
- State persistence localStorage `aa-friction-pending` (refresh = state restored, NU reset)
- Plan side-by-side comparison: original tăiat vs redus (transparency maxim, anti-manipulativ)
- Override trust user (D6=A): restore plan original + log `outcome.aaOverride=true` în CDL — friction-ul = conștientizare, NU pedeapsă
- `coachDirector.applyAAAdjustments` — preserve `aaOriginalSets` ÎNAINTE de reduction (1 line addition pentru override restore)
- `session.js` populateOutcome — adaugă `aaOverride` + `aaOverrideRationale` fields
- 583/583 tests passing (559 baseline + 24 new). Push to main.

**Status final ADR 013:**
- AA pipeline END-TO-END LIVE: detection → write CDL → read context → apply session → UI intervention
- Sprint A (TASK #1+#4+#5) + TASK #7 = ADR 013 §6 implementare COMPLETĂ
- Validation pending pe sesiune reală + manual UX testing (mâine PUSH/PULL day, AA real-world signals)

**E2E pre-existing fail-uri (flagged în FINDINGS_MASTER, NU regression TASK #7):**
- `calibration-ui.spec.js:193` — "CDL low adherence shows LOW_ADHERENCE banner" — page nu rendăruiește cu CDL setat în test
- `integration.spec.js:97` — "selectând readiness verdict card apare" — verdict card nu apare după select
- Verificat git checkout 1007ffe (înainte TASK #7) — fail identic. Pre-existing, NU blocker.
- Decizie: flag în finding tracker, NU fix imediat (Memory #14 — bulletproof pe ce construim, NU sweep tot)

**Decizii cheie:**
- **TASK #7 strategy A (update E2E assertion 2 linii) > B (split test):** unit tests acoperă deja fullReset wipe CDL, E2E split = duplicat. Friction minim ADHD.
- **ADR 014 §5 wording update:** static "Am văzut pattern-ul" → data-injected dynamic. Anti-reflex paste-buffer + cognitive lock-in real.
- **Triangulation 2 chats Claude (active + previous):** 4/4 push-back-uri valide din chat precedent adoptate (Build vs Activate Q1-Q5, ordine roadmap, sequential vs parallel solo, API tier-based monetization). 1 push-back D2 chat curent acceptat (data-injection peste static phrase).
- **Decisions strategice 6/6 finalizate:** Beta luna 4-5 (NU 6+), Q1-Q5 build luna 2-3 activate la beta, roadmap AA val→cleanup→#7→#8→bloodwork→parametric, calibration lunar prima review luna 3, bloodwork DUPĂ #8 NU înainte, API tier-based monetization NU subsidize all.

**ADR cross-refs:**
- [[013-auto-aggression-detection]] §6 — implementation COMPLETĂ post TASK #7
- [[014-onboarding-profile-typing]] §5 — wording update data-injected (NEW)

**Quality bar:**
- 559 → 583 tests (+24, zero regresii)
- 16 commits substanțiale azi (sesiune 27 apr completă)
- AA pipeline LIVE end-to-end ADR 013 complete
- 2 fail-uri E2E pre-existing flagged (NU regression)

---

## 2026-04-27 — Sprint A AA Pipeline LIVE + Cleanup Batch + getBF Dead Code Closed

**Scope:** 13 commits substanțiale într-o sesiune.

**Sprint A — AA detection pipeline integrat end-to-end (ADR 013):**
- TASK #1: AA write-side în session.js (eded0c1) — populateOutcome cu autoAggression + setsRPE
- TASK #4: AA read-side în coachContext.js (db798bc) — 30d window aggregation, ctx.autoAggression populated
- TASK #5: applyAAAdjustments în coachDirector.js (6a30f1e) — MED → aaWarning, HIGH → aaBlocked + volume reduction 30%
- TASK #2: CDL_KEYS category în dataRegistry.js (52e09f1)
- TASK #3: sf.userConfig în SYNC_KEYS (8dde67f)

**TASK #6 — sys.js coverage gap closed:**
- Phase 1: lazy refactor _bio → getters (e344ecb) — getUserConfig() at call time, NU module load
- Phase 2: 11 tests sys.js (207f40f) — TDEE/BF/phase coverage solidă

**Cleanup batch (audit findings night closed):**
- isoWeek centralization (4066d92): src/util/isoWeek.js + 7 tests boundary, 2 callers refactored — closes M3g+H13g
- Readiness thresholds extract (23a3867): READINESS_PR/HIGH/MED/LOW exports + drift fix proactiveEngine `<60` → `<55` — closes M1
- getBF dead code elimination (e97e468): Option B per Opus spec, calibration-only formula + invariance test — closes finding 810ea68

**Profile Typing infrastructure (ADR 014 §6 Step 1):**
- profile-history în USER_DATA_KEYS + SYNC_KEYS (17d08d9) — closes audit night gap (PROFILE_TYPING_INTEGRATION_AUDIT_NIGHT.md §6)

**Quality bar:**
- 524 → 559 tests (+35, zero regresii)
- 7 audit findings closed
- AA pipeline validation pending pe sesiune reală (mâine PUSH/PULL day)

**Decizii cheie:**
- getBF: **Option B** (calibration-only) per Opus 1m 30s audit. Anti-recommendation Opus: NU implementa hybrid cu fudge factors arbitrari. Așteaptă 30+ CDL entries + DEXA validation pentru sofistication.
- Velocity calibrare confirmată: Sonnet refactor mecanic ~5-15 min real, Opus focused audit pe scope concentrat 1m 30s

**ADR cross-refs:**
- [[013-auto-aggression-detection]] — Sprint A integrare
- [[014-onboarding-profile-typing]] §6 — Storage Step 1 done
- [[015-getbf-calibration-only]] — getBF formula decision (NEW)

---

## 2026-04-26 — TASK #30 PARTIAL — Coach Decision Log Adopted (9/10 subtasks)

**Scope:** ADR 011 implementation — Coach Decision Log (CDL) ca primitive arhitectural. Înlocuiește H30c (false banner) fix izolat cu refactor structural. Supersedes Task #28 + #29.

**Approach:** 10 subtasks ordonate (30.1–30.10). 30.9 (decommission applied-patterns) pending Daniel sign-off + caller cleanup.

**Outcome:** Single source of truth pentru pattern detection în engine + UI banner. Banner sourced din `ctx.patterns` (CDL via `analyzeFromCDL`) cu suppression când `realCDLCount < 3`. False "Marți 88% skip rate" banner no longer reproducible. H30c CLOSED.

**30.9 deferral rationale:** 5 production callers identificați (renderIdle.js, util.js, modals.js, dashboard.js, main.js) necesită cleanup manual + 4 sign-off triggers validabile doar de Daniel. Caller cleanup estimat 30-45 min, urmat de 1h Daniel manual validation. Decom-ul efectiv = 15-20 min. Sequence documentată în [[AUDIT_30_9_BLOCKED_STATE]].

**Tests:** 301 → 414 (+113 CDL + engine tests). Baseline: 414/414.

---

## 2026-04-25 — REBRAND: ELIMINARE TRADEMARK ANTHROPIC DIN PUBLIC

**Context:** Decizia anterioară din 24 apr 2026 ("CLAUDE AI OPUS 4.7 COACH" ca brand vision) violează Anthropic Consumer Terms of Service:

> "You may not, without our prior written permission, use our name, logos, or other trademarks in connection with products or services other than the Services, or in any other way that implies our affiliation, endorsement, or sponsorship."

Verificat 25 apr 2026 prin web search direct pe documentele legal Anthropic.

**Decizie:** Andura NU referențiază Anthropic, Claude, sau orice trademark Anthropic în material public-facing.

**Brand public:** Andura (sau successor TBD pre-launch).

**Acceptabil intern (factual technical):**
- ADRs, vault docs, technical specs
- Privacy Policy / ToS (disclosure GDPR transparency)
- Code comments, source code
- Editorial third-party content

**NU acceptabil public:**
- Brand name cu "Claude" sau "Anthropic"
- Logo Anthropic în UI / marketing
- Tagline "Powered by Claude" / "Built with Claude" / "Made with Anthropic AI"
- Implied partnership / endorsement

**Beneficii strategice (forward-compatibility):**
- Vendor independence: schimbăm backend AI fără să spargem brand-ul
- Differentiation: vindem outcome (transformation), nu implementation detail
- Pre-acquisition due diligence: clean trademark = mai puține probleme la exit
- Industry standard: Coca-Cola nu reclamă zahărul brazilian, Stripe nu reclamă AWS

**Implementare 25 apr 2026:**
- PROJECT_VISION.md: rewrite secțiune CONCEPT BRAND
- INDEX_MASTER.md: rewrite secțiune CONCEPT PRODUS + adăugat link [[010-no-anthropic-trademark-public]]
- ADR nou: 03-decisions/010-no-anthropic-trademark-public.md
- DECISION_LOG: această intrare

**Reconsiderare trigger:**
- Anthropic acordă written permission specifică
- Anthropic lansează program oficial "Built on Claude" cu terms publici
- Legal counsel confirmă nominative fair use în context specific

**Supersedes:** decizia 24 apr 2026 "CLAUDE AI OPUS 4.7 COACH (branding)" — care rămâne în log ca istoric, dar e marcată ca SUPERSEDED.

---
## 2026-04-25 — Nuclear Opus Audit v3 completed

**Scope:** Audit adversarial code-first pe arhitectura curentă, FAZA 1/2 "DONE" challenge, blueprint FAZA 3/4, launch readiness. Evidence-based (file:line pentru fiecare claim), zero "TBD". Output: OPUS_NUCLEAR_AUDIT_25APR (audit closed, content absorbed) (1500+ linii, 13 secțiuni, fiecare cu VERDICT binar).

**Top 5 Absolute Blockers (launch):**
1. **C10c Cache Invalidation Cascade** — `firebase.js:85-121` initial sync produce 8-11 invalidări în lanț; fix-ul H11c (extindere keys 5→11) a amplificat bug-ul.
2. **H31c Full Reset Spec Gap** — `dataCleanup.js:212` șterge doar uniune TEST_RESIDUE_KEYS + USER_DATA_KEYS; keys dinamice (muscle-extra-*, aa-cooldown-*, ex-extra-sets-*) persistă. Fără registry central.
3. **H30c Pattern Learning Bypass** — `renderIdle.js:186` citește `applied-patterns` direct, bypass la calibration filter; plus `patternLearning.js:31-35` numără zile calendar nu zile de plan.
4. **Multi-Tenancy Still Fake** — `firebase.js:6 USER_PATH = 'users/daniel'` hardcodat, ignoră `config/user.js:19`. FAZA 1.2 FALSE DONE.
5. **Observability Blackhole** — `C8g` Sentry filter neverificat + 3 catch blocks în coachDirector care înghit erori engine silent.

**5 False/Half "DONE" expose:**
- FAZA 1.2 multi-tenancy (firebase.js:6 still hardcoded)
- FAZA 1.3 log schema (logNormalize creat dar neaplicat — by design)
- FAZA 1.7 AA (RPE fix TRUE / registry FAIL — cooldown keys leak)
- FAZA 1.8 rules v1 (cap OK / rules nu în repo)
- FAZA 2 OPT A weakness ordering (cod TRUE / feature flag OFF dormant)

**7 probleme NOI (anti-reîncălzire, nedetectate în FAZA_2_OPUS_REVIEW):**
1. Cache invalidation cascade la Firebase sync (C10c deep root)
2. renderIdle.js:186 banner bypass la calibration filter
3. patternLearning counts calendar days, not plan days
4. Dynamic `import('./dp.js')` în hot path (legacy FAZA 1.1)
5. Keys dinamice write-only leak (muscle-extra-*, aa-cooldown-*, ex-extra-sets-*)
6. Protein target schema drift (180 static vs bodyweight×2.2 dynamic)
7. `_suppressFirebaseSync` nu supraviețuiește reload în Full Reset flow

**Task list generated:** 24 task-uri pre-queued (TASK #26-49) în 5 tiers logice:
- Tier 0 (THIS WEEK): 7 tasks — quick stability wins (C10c, H31c, H30c, dead code cleanup)
- Tier 1 (Week 1): 3 tasks — observability (Sentry audit, logger, analytics)
- Tier 2 (Week 2-3): 3 tasks — multi-tenancy real (Firebase Auth + migration)
- Tier 3 (Week 3-4): 5 tasks — launch readiness (onboarding, landing, privacy, billing)
- Tier 4 (Next Quarter): 3 tasks — schema & architecture refactor
- Tier 5 (Next Quarter): 3 tasks — FAZA 4 features (programe, injury, recovery)

**VERDICT FINAL: FAIL.** Andura are fundamente corecte dar NU e launch-ready în nicio dimensiune critică. 4-6 luni concentrate până la commercial launch realist.

**Next action:** Daniel review audit, valid/reject task list, queue TASK #26-32 pentru execuție imediată (Tier 0 quick wins).

---

## 2026-04-24 — FAZA 2 COMPLETE (Bug Fixes + Reliability)

**Scope:** 6 task groups, 10 bugs fixed, 2 refactors, 35 net new tests.

**Livrări majore:**
- Tier 0 (C4c + C5c): log schema completeness (kg/set fields) + eliminate endSession auto-delete for short sessions
- P2 batch (H11c + C3c + H6c): COACH_RELEVANT_KEYS 5→11 keys, rateSession double-tap guard, analyzeAndApplyPatterns inflight guard
- Session batch (C2c + H4c): cancelWorkout full state reset (parity with endSession), resume completedExercises from sessLog not empty Set
- Engines batch (M3g + H13g + H14g): isoWeek ISO 8601 Thursday rule în 2 fișiere, checkRecoveryGroups computes daysSinceLast from logs (getMuscleState incompatibility fix)
- sessionBuilder OPT C: fallbackSessionBuilder extras ca pure function în sessionBuilder.js
- sessionBuilder OPT A: weakness-prioritized ordering + contextSelectionEnabled feature flag (default: false)

**Metrici:**
- Tests: 236 → 271 passing (+35)
- Test files: 22 → 25
- Regresii: 0
- Commits FAZA 2: 6 (489480e → 7c86288)

**Decizii cheie:**
- C5c: eliminate auto-delete complet (nu confirm dialog) — orice sesiune cu loguri se păstrează implicit
- H14g: nu restrucura getMuscleState (breaking change); în schimb fix site-ul de consum (checkRecoveryGroups)
- isoWeek: Thursday rule (ISO 8601) — week belongs to year of its Thursday, nu jan1 offset
- contextSelectionEnabled: default false — ordering activ doar explicit opt-in; previne regression pentru users fără weakGroups
- OPT A scope restrâns (Opus review): nu adaugă exerciții noi, doar reordonare în lista existentă

**Next:** FAZA 3 — Infrastructure + Observability — plan complet în FAZA_3_ROADMAP (superseded)

Raport complet: FAZA_2_FINAL_REPORT (closed, history în git)

---

## 2026-04-24 — FAZA 1 COMPLETE (Engine Bulletproof)

**Scope închis în 1 zi:** Toate 9 sub-faze 1.0–1.8.

**Livrări majore:**
- Split coach.js 1477 → 10 module (1.0 plan Opus + 1.1 exec Sonnet) — commit 9875755
- Multi-tenancy decouple (1.2) — 14 fișiere, config/user.js centralizat
- Log schema cleanup (1.3) — 7 mismatches, 20+ fallback-uri moarte eliminate, logNormalize.js
- cleanDuplicateLogs fix (1.4) — dedupe strict pe timestamp (nu pe business fields)
- ctx.allLogs real (1.5) — 2 linii, calibration funcționează pentru 80+ sesiuni
- sessionBuilder cleanup OPT B (1.6) — dead code removed, OPT A escalat FAZA 2
- AA engine activate notes-only (1.7) — RPE logic eliminat (necolectat), safety net defensiv
- Firebase data loss fix 500→5000 + audit + rules v1 plan (1.8) — commit bf800e7

**Metrici:**
- Tests: 41 → 232 passing (5.7×)
- Regresii: 0
- Commits pe main: 18+
- Test files: 8 → 20

**Workflow creat:**
- Claude Code hook Stop → auto-push pe main
- 📤_outbox/ workflow (per VAULT_RULES §3.5 dropzone protocol) + 📤_outbox/_archive/ history (per VAULT_RULES §3.3 outbox schema) — async execution protocol (vezi ASYNC_EXECUTION_PROTOCOL (workflow obsolete post-cleanup 2026-04-30))
- Daniel = PM, Opus = Co-CTO (planning), Sonnet = executor (cod)

**Decizii cheie:**
- OPT B în 1.6 (sessionBuilder delete vs implement) — scope FAZA 1 = infrastructure, nu features
- AA notes-only — RPE logic producea false INCREASE deoarece rpe:8 era hardcoded, nu colectat
- slice 5000 (nu remove cap, nu tierStorage) — optimal FAZA 1: 4 caractere, 1.5+ ani headroom
- Rules v1 path-restricted (nu auth Firebase) — auth e FAZA 4

**Next:** FAZA 2 — Priority 1 = sessionBuilder real (context-aware selection), detaliat în FAZA_2_ROADMAP (superseded)

Raport complet: FAZA_1_FINAL_REPORT (closed, history în git)

---

## 2026-04-24 — FAZA 1.1 Clarifications (pre-execution GO)

**D1 — ES module cycles:** temporare. Rezolvate la Pas 10 prin import direct din corp funcție. Fallback permanent (late-binding) acceptat doar dacă build aruncă ReferenceError — documentat în raport.

**D2 — renderIdle.js size:** ~400 LOC acceptat pentru 1.1. Copy-paste verbatim. Prag review: 450 LOC. Re-split doar dacă depășește.

**D3 — Bug inventory:** C2 singurul explicit pre-execuție. Alte bug-uri marcate `// BUG(audit):` la execuție, capturate în raport final. PR-uri separate post-split.

**Status:** GO unconditional. Execuție 8-12h.

---

## 2026-04-24 — FAZA 1.6 sessionBuilder cleanup + deferred real impl

**Finding:** sessionBuilder = null literal forever. Tot contextul calculat de coachDirector era aruncat, fallback static selecta din listă hardcoded.

**Decizie:** OPT B în FAZA 1 (cleanup dead code, ~15 min), OPT A escalat la FAZA 2 Priority 1 (3-4h, context-aware real selection).

**Justificare:** FAZA 1 scope = Engine Bulletproof = infrastructure. OPT A = feature nou, nu bulletproofing. Nu mixăm scope-uri.

**Risc acceptat:** FAZA 1.5 (ctx.allLogs real) nu va avea impact vizibil până la FAZA 2 Priority 1. Documentat explicit ca prima prioritate FAZA 2 în FAZA_2_ROADMAP (superseded).

**Commits FAZA 1.6:** d2dd940 (audit), + commit curent (OPT B exec)

---

## 2026-04-24 — FAZA 1.3 Log Schema Cleanup (DONE)

**Scope:** Curățare schema loguri, eliminare fallback-uri moarte, fix bug-uri schema.
**Surprise:** Audit a găsit că NU e nevoie de migration one-shot. Schema actuală e OK, doar are fallback-uri moarte + 1 bug activ (adherence M2).

**Ce s-a făcut:**
- Task #9: Audit schema — 7 mismatches identificate (M1–M7) → LOG_SCHEMA_AUDIT_1_3 (closed)
- Task #10: Fix M2 (adherence __early_stop__ filter) — bonus: reparat și 1 e2e test failing
- Task #11: Eliminare fallback-uri moarte (l.weight/l.exercise/l.timestamp) din 10 fișiere + creat logNormalize.js
- Task #12: Consolidare M3-M7 — omis rpe fals, aliniat sessLog.kg→w, eliminat userOverride dead

**Validare:** Teste baseline menținute. 216 unit tests pass (vs 41 e2e inițial).
**Commits:** 79081d1, 894e341, 28fe2b9, + commit curent

---

## 2026-04-24 — FAZA 1.2 Multi-tenancy Decouple (DONE)

**Scope:** Elimina Daniel-hardcoded values din codebase. Audit: HARDCODED_AUDIT_1_2 (closed)
**Approach:** Scope minim + defaults.js + localStorage override (NU multi-user Firebase — asta vine în FAZA 4).

**Ce s-a făcut (3 tasks, 14 fișiere):**
- Task #4: src/config/user.js creat cu USER_DEFAULTS + getUserConfig/updateUserConfig
- Task #5: sys.js + coachContext.js refactor să folosească getUserConfig()
- Task #6: TARGET/DATE/PATH centralizate în constants.js + firebase.js

**Validare:** Teste baseline menținute. Zero regresii. Deploy live.

**Commits:** 39b9899, b89e3e9, 4d7a4a9


## 2026-04-27 — Sesiune END Strategic Decisions (post TASK #7)

**Scope:** 6 strategic decisions luate post cleanup A+B, definind architectural direction pe următoarele 3-4 luni.

### Decision 1 — Bloodwork DEFINITIV OUT din Andura

**Verdict:** Nici commercial, nici personal/dev-flag. Closed forever.

**Rationale commercial:** Gigel test FAIL. Daniel a articulat scenariul user mediu non-tech RO: "de ce imi cere bloodwork? e medic? la cine ajung datele? ma duc la Dorel medicul de 90 ani NU app". Trust breach + privacy panic + cultural friction RO + scope creep perceput = churn imediat. Pierdere brutală de useri.

**Rationale personal Daniel:** Insight crucial — chat Claude direct = alternativă superioară zero-build. Workflow personal: paste analize în chat dedicated, Claude interpret + corelează cu antrenament, Daniel aplică manual în Andura. Cost build = 3-4h Sonnet pentru feature folosit 4x/an = waste.

**Verdict:** Andura stays clean = coach AI fitness, NU medical scope creep. NU readuce în viitoare discuții fără trigger explicit Daniel.

### Decision 2 — Filter "Gigel test" devine regulă permanentă

Pentru orice feature decision viitoare, întrebare obligatorie = "Cum reacționează Gigel (user mediu non-tech RO)?". NU "tehnic posibil?", ci "dubios pentru user?". Features tech-cool dar Gigel-suspect = OUT indiferent MOAT.

Cluster decisions filter: trust breach + privacy panic + cultural friction RO + scope creep perceput → reject indiferent diferentiator tehnic.

### Decision 3 — Vitality Layer adopted ca dimension nouă în engine

**Concept Daniel:** Înlocuim bloodwork cu întrebări behavioral proxy scurte despre user (energie, sleep, temperament, motivație, recovery, inflamație). Combinat cu age + kg + height + BMI ne indică direcția fiziologic approximativ. Friction ZERO comparativ cu bloodwork.

**Examples valid:**
- "Cum te simți în general?" / "Cum dormi?"
- "Te-ai descrie ca temperamental?"
- "Recovery post-antrenament?"
- "Te trezești odihnit?"
- "Cum te simți cu motivația în general?"

**Examples NU includem (Gigel test fail):**
- Întrebări directe libido, erecție, etc.

**Implementation pattern:**
- Opt-in post-onboarding, NU mandatory
- User decide când completează (sesiune 5, 10, 30, niciodată = OK)
- Engine inferă behavioral aproximativ după 20-30 sesiuni dacă user skip

**ADR pending:** 016 — Vitality Layer (depends ADR 018 done first).

### Decision 4 — Tier-based personalization architectural pattern

**Filosofie Andura (Daniel insight):** self-selection bias = FEATURE NOT bug.

| Tier | Cerință user | Engine response |
|------|-------------|----------------|
| T0 | Skip onboarding | Engine generic + demographic prior din synthetic profiles |
| T1+ | Q1-Q5 completed | + Profile Typing dimension |
| T2+ | Vitality completed | + state inference |
| T3+ | Sesiuni reale 30+ | + behavioral calibration |
| T4+ | 90+ sesiuni | Full personalized engine |

**Daniel articulation:** "Cine completează e accurate, cine nu e safe dar mai general. Nu putem sa facem 8 miliarde de oameni sa raspunda la tot."

**Verdict:** NU forțezi engagement uniform. Real sesiuni corectează prior pe parcurs. Useri investiți → MOAT real. Useri skip → engine acceptabil baseline.

### Decision 5 — Synthetic 500 profile × 90 zile = PRODUCTION INFRASTRUCTURE

**NU test fixture. NU stress test only. ESTE Demographic Prior Database.**

**Profile diversificat (mix 500 total):**
- ~50 manually crafted (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.)
- ~450 algorithmic generated cu variație controlată (age × sex × kg × height × job × lifestyle × goal)

**Storage:** local fixtures `tests/fixtures/syntheticProfiles.js`, generated runtime în memory. NU se salvează permanent. NU consumă Firebase storage.

**Cost:** $0 pentru synthetic. Production scaling Firebase = $125/lună la 100 useri reali, $1500/lună la 1000 useri.

**Lifecycle (Daniel insight crucial):** "la launch nu mai avem nevoie de profilele de test... se sterg si firebase ramane gol... ma rog cu mine in el." Test data lifecycle separation = synthetic build phase only, NU production data.

**De ce 500 NU 1000:** Sweet spot dev workflow speed vs coverage density. Generator parametrizat = ușor scale dacă needed (`generateProfiles(count: 500)`).

**ADR pending:** 017 — Demographic Prior Database (depends ADR 018 done first).

### Decision 6 — Co-CTO real-time decision filter (working brain pattern)

**Daniel articulated cerință critical:** "fără ca tu să gândești ca un working brain, nu putem să simulăm unul."

Claude operate ca decision filter în timp real, NU yes-man. Când Daniel propune idee midway sesiune, evaluez 3 dimensions:

1. **URGENCY engine:** critical=STOP midway, high=next milestone, medium=schedule, low=backlog deep
2. **ARCHITECTURAL impact:** foundation-shifting=STOP, layer-adjacent=finish layer integrate boundary, plugin-able=backlog, cosmetic=backlog
3. **COGNITIVE load Daniel:** hyperfocus=store NU întrerup, milestone boundary=discutăm, strategic mood=full discuție

**Storage 3 layers:** memory persistent + vault INSIGHTS_BACKLOG + in-conversation.

**Periodic re-evaluez backlog la fiecare milestone.**

### Roadmap recalibrate

**Velocity confirmat:** Daniel productive 10-11h/zi pe Andura (HR job nivel decizional permite, NU 2-3h cum greșeam estimating). Recalibrare timeline:

**Order strict (NU schimbi fără discuție):**
1. ADR 018 — Engine Extensibility Architecture (foundation, Opus task)
2. ADR 016 — Vitality Layer (use ADR 018 patterns)
3. ADR 014 update — Profile Typing tier-based aware
4. ADR 017 — Demographic Prior Database
5. Build SHARED INFRASTRUCTURE (Dimension Registry, Standardized Contract, Cluster Engine, Schema Versioning, Feature Flags)
6. Build SHARED form/scoring/reconciliation
7. Build Profile Typing (TASK #8) ca plugin
8. Build Vitality Layer ca plugin
9. Build Synthetic Generator + Demographic Prior Database
10. Run synthetic massive → engine validation cross-demographic
11. Real sesiuni Daniel paralel (calibration begin, 32+ sesiuni reale 8 săpt)
12. Beta micro launch (luna 3-4, 3-5 useri diferiți de Daniel)
13. Public-ish launch (luna 4-5)

**Critical insight:** Spec ADR 018 ÎNAINTE de orice build feature nouă. Toate features viitoare = build pe această fundație. Previne refactor forțat later. "Engine extensibil prin natura lui" = Daniel's articulation.

### Quality bar metrics

- 583 unit tests (vitest + jsdom), zero regresii
- AA pipeline LIVE end-to-end (ADR 013 §6 complete)
- 16 commits substanțiale azi (cumulativ Sprint A + post-handover)
- 0 OPEN bugs
- 2 fail-uri E2E pre-existing flagged corect (NU blocker production)

### ADR cross-refs

- [[013-auto-aggression-detection]] §6 — implementation COMPLETĂ post TASK #7
- [[014-onboarding-profile-typing]] §5 — wording update data-injected (sesiune anterioară azi)
- [[015-getbf-calibration-only]] — getBF formula decision (Sprint A)
- [[016-vitality-layer]] — PENDING (ADR Vitality, depends 018)
- [[017-demographic-prior-database]] — PENDING (ADR Synthetic infra, depends 018)
- [[018-engine-extensibility-architecture]] — PENDING (ADR fundamental NEXT)

### Memory updates persistente

- #24 (Gigel filter) — feature decisions filter permanent
- #25 (Bloodwork OUT) — closed forever
- #26 (Tier-based personalization) — architectural pattern
- #27 (Co-CTO real-time decision filter) — working brain pattern
- #28 (Daniel cognitive mode) — IQ ~139 Mensa, ADHD 2e, sequential decisions only, sloppy expression ≠ degraded thinking, NU burnout pattern
- Memory cleanup compactare 30 → 28 entries (-2 duplicates, +1 cognitive critical)

---


