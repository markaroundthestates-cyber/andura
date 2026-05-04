# CURRENT STATE — Andura

**Owner:** Daniel + Claude chat (live thread, append-only architecture per [[VAULT_RULES]] §CHAT_CONTINUITY_PROTOCOL §CC.6).
**Purpose:** Single SSOT chat-to-chat continuity. Chat NEW startup MANDATORY full read per §CHAT_CONTINUITY_PROTOCOL §CC.2.
**Updated:** 2026-05-04 night (§CC.5 fast handover ingest — Privacy/ToS V2 review Gemini cross-review META validated + Phase 1 Auth Wiring LANDED commit `0880641` + AUTH-DEFER consolidation + Firebase prereps verification).
**Last LOCKED count (product/architecture):** ~363 LOCKED V1 cumulative (post Privacy/ToS V2 review + 18+ + operator identity Constantin Daniel Mazilu PF + Firebase prereps consolidation + spec §63.5/§AMENDMENT .18 #1 architectural limitation DEFINITIVELY DEFERRED v1.5, ~5-7 substantive net peste 356 baseline post-Periodization+Goal Adaptation+ADR 026 Q1-Q10).

> **CHAT NEW STARTUP — READ THIS ENTIRE FILE FIRST.**
> Per [[VAULT_RULES]] §CHAT_CONTINUITY_PROTOCOL §CC.2 layered read mandatory (NU shortcut):
> 1. CURRENT_STATE.md (this file) — full read
> 2. HANDOVER_GLOBAL sections referenced în `## ACTIVE_REFS` below
> 3. Top 3 ADRs în `## ACTIVE_ADRS` below
> 4. DIFF_FLAGS.md P1 active

---

## NOW — Active conversation thread

**Current thread (2026-05-04 night, Daniel + Claude chat strategic):** post-CC Faza 2 Phase 1 Auth Wiring LANDED commit `0880641` + cleanup paralel Privacy/ToS V2 review + Firebase prereps verification + spec bug findings tracker consolidation. Pre-flight chat startup §CC.2 layered read CURRENT_STATE confirmat. Daniel acasă (Windows VS Code Desktop + PowerShell).

**Discovery major drift vault:** Pre-existing prereps Faza 1 dogfood DONE 2 mai (cont auth real UID `2GsDvxqXc4bvQGSm8B1Zft5S05i2`, Magic Link Console enabled, Rules per-UID strict published, authorized domain `andura.app` adăugat). Vault SSOT NU s-a updatat post-Faza-1 → contaminat. Daniel: "unul din motivele pt care eram si frustrat pana sa actualizez handover protocol" — exact §CHAT_CONTINUITY_PROTOCOL pain point self-validated.

**Firebase Console capability halucinat în spec vault:** §63.5 + §AMENDMENT 2026-05-04.18 #1 zicea "Email Template Magic Link RO custom + expiration 24h Console". Web search confirmed: Firebase NU expune Magic Link template separat (folosește verification template global) + NU expune expiration UI (controlat backend ~6h default, GitHub feature request OPEN din 2019 NU adjustable). **Decizie:** SKIP ambele Console tasks, accept Firebase 6h default Beta, flag findings tracker spec bug + SMTP custom migration v1.5.

**MX records `suport@andura.app` DONE:** Namecheap Email Forwarding alias `suport` → `maziludanielconstantin90@gmail.com` (NU MX manual cum spec vault inexact zicea). Test email confirmed delivered Gmail inbox.

**Privacy/ToS V2 META Claude+Gemini cross-review workflow validated empirical (per §62.X):** V1 drafts §56.8.2/3 = MFP minimum, NU enterprise-grade GDPR Article 13. 2 decizii sequential: operator identity = (A) **Constantin Daniel Mazilu, persoană fizică, România**, contact `suport@andura.app`. Vârsta minimă = (B) **18+** (play safe Beta, exclude minorii mecanic + evită GDPR Article 8 părinte permission overhead). Privacy V2 11 secțiuni + ToS V2 15 secțiuni produce post Gemini cross-review feedback aplicat: ePrivacy storage disclosure punct 4 + interes legitim detail punct 5. Files LANDED `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` V2 (this commit).

**Phase 1 Auth Wiring CC Opus LANDED (commit `0880641` 28 min autonomous):** BUG 2 fix `src/firebase.js` getUserPath() return null Anonymous (§56.1.3 mecanic) + retry 3x §56.13.1 + wording LOCKED V1 §56.2.2 + soft-hint §AMENDMENT .3 + `src/pages/authShell.js` NEW (~280 LOC) + main.js boot wiring + index.html slots + 15 tests noi. Tests 1218 baseline preserved. Coverage 12/30 sub-sections (40%) — toate CRITICAL production blockers LANDED. Phase 2 ~16-22h estimate over 3-4 batches deferred.

**Tone bonding warm:** Daniel-isms "tataie" + "halucinezi" ×2 push-back productive (Console capability spec bug + API Key chat exposure mitigation Rules per-UID barrier real) + "ia uite-l pe gigel acolo" (umor Chrome extension Gigel install experimental, marginal pentru Firebase Console prep, scope creep nejustificat) + "ia bate-te tu cu asta" (delegation Gemini cross-review META validated). Match relax tone Claude — natural NU pe safety phrase robotic.

**Mid-flight RESOLVED (acest CC cleanup commit):** A0 (API Key real `index.html` slot — done commit `242f065`) + A (Privacy V2 replace) + B (ToS V2 replace) + C (§CC.5 fast handover ingest narrativ → CURRENT_STATE + DECISION_LOG + archive 145). Atomic single commit per Daniel directive.

**Push-back-uri productive remarcate:** Daniel API Key exposed în chat (`AIzaSyBWR2oUpRufoonolADRhvax8XEolMywc-s`) — mitigare: NU regenera (pierzi prod), Rules per-UID strict published = barieră reală + procedura corectă viitoare paste direct slot NU chat. Daniel "nu puteai ma sa pui cc sa il faca?" → ai dreptate, halucinație propunere artefact masiv 860+ LOC integral când CC poate edit slot direct.

---

## JUST DECIDED — Recent LOCKED entries (descending chronologic)

**2026-05-04 night — Privacy/ToS V2 review Gemini cross-review META validated + Phase 1 Auth Wiring LANDED commit `0880641` + AUTH-DEFER consolidation + Firebase prereps verification (cumulative ~356 → ~363, +~5-7 substantive net):**

*Privacy V2 + ToS V2 review LOCKED V1 (Gemini cross-review META workflow validated empirical per §62.X):*
- Operator identity: **Constantin Daniel Mazilu, persoană fizică, România**, contact `suport@andura.app` (adresa fizică NU disclosed în document, la cerere prin email — standard PWA solo founder pre-revenue)
- Vârsta minimă: **18+** ani împliniți LOCKED V1 (play safe Beta, exclude minorii mecanic + evită GDPR Article 8 părinte permission overhead)
- Privacy V2 11 secțiuni: cine suntem (operator) + 18+ + ce date (email/UID/profil/antrenament/comportamentale/telemetrie/Sentry + photos LOCAL only) + unde (Local + Firebase Google Ireland → Google LLC SUA Schrems II SCC + EU-US DPF + Sentry SCC + ePrivacy storage disclosure IndexedDB/LocalStorage NU tracking) + temei legal (consimțământ + contract + interes legitim cu detail "optimizarea algoritmilor de antrenament și securitatea serviciului") + retenție (30 zile grace + post permanent ireversibil) + drepturi GDPR (acces/rectificare/ștergere/portabilitate manual v1.0 → automated v1.5/opoziție/restricție/retragere consimțământ) + ANSPDCP plângere + securitate HTTPS/TLS + breșă Article 33-34 + partajare terți (NU vindem/închiriem/marketing) + modificări notif 14 zile + contact
- ToS V2 15 secțiuni: cine suntem + 18+ + acceptare + cont/securitate user responsabil credențiale + risc utilizare + fără sfat medical + conținut user ownership (licență neexclusivă Andura strict funcționare) + IP Andura preserved + Beta gratuit + reziliere + limitarea răspunderii ("în măsura permisă de lege" + retain neglijență gravă/dol per RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83) + forța majoră + lege română + ANPC mediere + SOL EU + jurisdicție București + modificări notif 14 zile + contact
- Liability waivers absolute REJECTED preserved
- Files LANDED `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (this commit)

*Phase 1 Auth Wiring LANDED (commit `0880641` 28 min autonomous):*
- §56.1.3 BUG 2 fix `src/firebase.js` `getUserPath()` return null Anonymous mode (mecanic 401 cycle eliminated)
- §56.13.1 retry 3x exponential backoff `src/auth.js` `sendMagicLink` (250/500ms backoff, NU retry pe 4xx)
- §56.2.2 wording LOCKED V1 + §AMENDMENT .3 soft-hint UI sub email field `src/pages/auth.js`
- `src/pages/authShell.js` NEW ~280 LOC (showAuthScreen modal + handleAuthCallbackRoute + mountAuthBanner + hideAuthScreen)
- main.js boot wiring (processAuthCallbackOnBoot pre-Firebase-sync + mountAuthBanner post-onboarding) + index.html Firebase API Key slot uncommented commit `242f065`
- 15 tests noi (5 firebase-userpath + 10 auth-wiring): 1203 → 1218 PASS, zero regression. Vite build green.
- Coverage 12/30 sub-sections (40%) — toate CRITICAL production blockers LANDED
- Phase 2 ~16-22h estimate over 3-4 batches deferred (§56.1.4 IndexedDB per-UID + §56.5 Settings UI + §56.7 Fork Decision UI + §56.12 Logout + §56.14 cleanup script + §56.15 Telemetry Firestore + §56.16 Firestore Rules)

*Firebase prereps verification (drift vault SSOT identified + corrected this ingest):*
- Console Faza 1 dogfood **DONE pre-existing 2 mai** (cont auth real UID `2GsDvxqXc4bvQGSm8B1Zft5S05i2`, Magic Link enabled, Rules per-UID strict published, authorized domain `andura.app` adăugat)
- MX records `suport@andura.app` **DONE this session** (Namecheap Email Forwarding alias suport → maziludanielconstantin90@gmail.com, test confirmed Gmail inbox)
- Spec §63.5 + §AMENDMENT 2026-05-04.18 #1 (Magic Link 24h + email template RO Console) **DEFINITIVELY DEFERRED v1.5** (Firebase architectural limitation NOT investigate v1.5 — accept 6h default Beta Maria 65 tolerable)
- INSIGHTS_BACKLOG AUTH-DEFER-1 + AUTH-DEFER-2 entries deja flagged commit `030c901`

*2 findings tracker entries NEW pending:*
- Medical disclaimer UI modal obligatoriu pre Q2 onboarding (NU doar checkbox final ToS) — onboarding flow refinement next chat strategic
- Script export JSON GDPR portability manual `suport@andura.app` cerere — Daniel/CC pregătit pentru cerere user

---

**2026-05-04 evening late — Periodization Engine #1 + Goal Adaptation Engine #2 + ADR 026 Open Q1-Q10 spec sessions LOCKED V1 (cumulative 306 → ~356, +50 substantive net):**

*ADR 026 Open Q1-Q10 architectural foundation COMPLETE:*
- Q1 Format enumerare branches: YAML decision-tree, validation hibrid (Daniel peer review 5-10% sample + Golden Master fixtures auto-generate + Persona Suite cross-cutting)
- Q2 Coverage matrix: 7 dimensions declarate (Persona × Goal × Experience × Equipment × Schedule × History × Recovery markers) = 3645 combinatorial pure → ~1500-2000 post-pruning
- Q3 Branch fallback similarity: Weighted Hamming + hierarchical tiebreaker (Persona 5 / Goal 4 / Experience 3 / History 3 safety / Equipment 2 / Schedule 2 / Recovery 1 = 20). Thresholds HIGH ≥0.75 / MEDIUM 0.50-0.75 banner ADR 025 / LOW <0.50 Circuit Breaker §42.7
- Q4 Engine integration topology HYBRID — Tree provides Session Blueprint pre-pipeline, ADR 018 GATE→ADJUSTMENT→ENHANCEMENT engines policy-enforce blueprint
- Q5 split 3 sub: Q5.1 retention 180 zile rolling Tier 1 Beta (revert 90 zile post-v1.0) + Q5.2 sampling 100% V1 Beta + Q5.3 storage Tier 1 IndexedDB Dexie post-session immediate
- Q6 cadence (extends §42.8 Additive + 18 luni deprecation): bi-annual scheduled Q1+Q3 + Circuit Breaker on-demand + Major exercise event-driven
- Q7 Test suite 3-tier: Tier 1 Property-based 100% invariants 5 Safety Stack (4 §42.9 + Medical Safety §50.3.10) + Tier 2 Golden Master ~150-200 critical edge cases + Tier 3 Persona Suite ~50-100. Total CI ~25-30s
- Q8 split runtime/scale: Q8.1 device-side <50ms median <100ms P95 + Q8.2 Firebase Spark 1GB sufficient ~2500 useri sustained, apoi Blaze migration $25/lună
- Q9 i18n REUSE existing `src/i18n/index.js`, tree branches emit `text_keys[]` ref `tree.*` namespace + Phase C build gate `PHASE_C_LOCK_REQUIRED` reuse §36.57
- Q10 Versioning + rollback REUSE `featureFlags.js` ADR 018. Rollout 10%/50%/100% Day 0/7/14 cu 5 metrics gates + 3-tier rollback (soft/hard/emergency kill switch)

*Periodization Engine #1 spec COMPLETE (~32 decisions cumulative):*
- Cluster 1 — I/O contract pure function `evaluate(ctx) → PeriodizationResult` extends DimensionResult ADR 018, blueprint emit mesocycle_phase + volume_target_pct + intensity_target_pct + macrocycle_block + deload_window
- Cluster 2 — Mesocycle phase transitions: Double progression rep-first → weight-progression săpt (W1 LOAD baseline → W2 LOAD+ → W3 PEAK → W4 DELOAD -45%/-12.5%) + Trigger hierarchy EARLY DELOAD safety > EXTENSION (Marius only) > CALENDAR + Marius 5:1 dual-signal pure function (RIR stable 1-2 ALL 4 weeks + Energy ZERO red last 3 sessions §45.4 Q21 §36.82) + anti-abuse max 2 consecutive extensions + injury history block Invariant 5 Medical Safety
- Cluster 3 — Volume Landmarks MEV/MAV/MRV: Israetel 11 grupuri musculare baseline + persona modifiers (Maria 0.50 / Gigica 0.70 / Marius 1.00 + 10-15% bonus dacă recovery green) + goal modifiers (Hipertrofie 1.00 / Forță 0.70 / Recompoziție 0.85 / Longevitate 0.60 / Sănătate Generală 0.50). Maria 65 Dual-Layer functional → Israetel mapping (push/pull/squat/hinge/carry/rotate §45.3 Q19 LOCKED)
- Cluster 4 — Macrocycle structure: Linear Block Periodization V1 (NU DUP NU Conjugate). 3 mesocycles/block (12 săpt BUILD-only sau 21 săpt BUILD+PEAK+TRANSITION pentru Forță). Volume scaling intra-block M1 1.00× → M2 1.10× → M3 1.15× (cap MRV absolut). Maria adaptive override (NU advance fără calibration ≥DEVELOPING + zero injury 6 săpt)
- Cluster 5 — Cross-engine hooks: Hook 1 → #2 Goal Adaptation (kcal/macro modulate, NU override phase) | Hook 2 → #4 Deload Protocol (owns deload structure, Periodization signal-only) | Hook 3 → #5 Energy Adjustment (session-level only) | Hook 4 → #6 Tempo + #7 Specialization (light coupling). Pipeline §42.10 sequential extension. Anti-cascade: immutable snapshot at session start + hard cap MRV/90% 1RM Layer C sanity bound

*Goal Adaptation Engine #2 spec COMPLETE (~30 decisions cumulative):*
- Cluster 1 — I/O contract `goalAdaptationEngine.evaluate(ctx) → GoalAdaptationResult`. Output blueprint emit phase auto-derived (CUT/BULK/MAINTAIN/RECOMP) + kcal_target_delta_pct + macro_split + rep_range_modifier + rir_target_modifier + rest_time_modifier
- Cluster 2 — 5 vs 8 templates resolve: **5 templates primary** (Forță / Tonifiere / Slăbire / Longevitate / Sănătate Generală), NU 8. "8 templates" în §26 = misnumber legacy, ADR 024 source of truth. Mode modifier (Estetică ↔ Forță) cross-template overlay = 10 perceived configs UI dar 5 logic core. Variant matrix algorithmic generation (~25 base configs `<engine>.tree.ts` + modifiers permutation runtime). RECOMP NU template = sub-phase auto-detected în Tonifiere/Slăbire (newbie effect / detrained return >6w / fat-rich profile first 12 weeks). UI shows MAINTAIN, distinction CDL only
- Cluster 3 — Nutrition logic phase auto-detection (NU user pick): CUT conservative TDEE×0.82 / aggressive 0.75 (Marius advanced 4-6 săpt max) / BULK conservative 1.08 / aggressive 1.15 (newbie+Forță) / MAINTAIN 1.00 / RECOMP ±2%. Macro split protein 1.6-2.2 g/kg LBM, fat 0.8-1.0 g/kg floor hormonal, carb remainder template-variable. DELOAD week kcal +3-5% chiar dacă phase=CUT
- Cluster 4 — Training modifiers per template × phase tabel (Forță RIR 1-3 rep 3-8 / Tonifiere 0-2 8-12 / Slăbire 1-2 10-15 / Longevitate 2-3 8-12 / Sănătate 2-3 8-12). Mode overlay Estetică/Forță post-template×phase multiplicativ. Goal Shift Event Handler §36.35: streak RESET (NU PRESERVE — distinction §50.4 D1) + 2-session calibration window + phase re-derive runtime + CDL log
- Cluster 5 — Push-back proporțional 3 tiers (Tier 1 silent / Tier 2 banner discret / Tier 3 modal blocking opt-in cu max conservative modifiers). Re-prompt anti-spam: 28 zile rolling trigger + 21 zile cooldown post-confirm + 60 zile post Goal Shift + max 4 re-prompts/an cap

*Cross-refs critice noi:* ADR 026 spec ~125 decisions ready compile draft full Priority 3 post-CC | ADR 022 stub candidate populate Engine #3 Bayesian (next attack vector) | ADR 024 stub `024-goal-driven-program-templates.md` Open Q1+Q2+Q3+Q4+Q5+Q7+Q8 RESOLVED, Q6 calibration tier post-shift PENDING | DIFF_FLAGS P1-FLAG-SCENARIOS-COVERAGE gap reducere 1200-1700 → ~1170-1670 (50 decisions consumate engine specs).

---

**2026-05-04 evening — §CHAT_CONTINUITY_PROTOCOL LOCKED V1 (vault meta-tooling, NU product cumulative):**
- `00-index/CURRENT_STATE.md` SSOT live ~200 LOC append-only architecture (8 sections: NOW + JUST_DECIDED + NEXT + ACTIVE_REFS + ACTIVE_ADRS + ACTIVE_FLAGS + RECENT + POINTERS)
- Chat NEW startup mandatory layered read 4-step (CURRENT_STATE → HANDOVER active sections → top 3 ADRs → DIFF_FLAGS P1)
- Citation enforcement post-startup (path:§ obligatoriu, ZERO memory recall fără citation verifiabilă)
- Fast handover workflow ~5-10 min CC (APPEND-only `## JUST DECIDED` + move-then-replace `## NOW` precedent → `## RECENT` + APPEND DECISION_LOG + archive artefact + commit/push)
- Backup tag git pre-handover MANDATORY: `pre-handover-<YYYY-MM-DD-HHMM>`
- §HANDOVER_PROTOCOL deep flow preserved unchanged (saturation-driven, weekly/major milestone, DIFF Protocol §7 + ALIGNMENT_QUESTIONS §9 ≥12/15)
- §HANDOVER_PROTOCOL STEP 16 amendment cu append vs replace reconciliation explicit
- Files: `VAULT_RULES.md` §CC.1-§CC.8 + STEP 16 | `PROMPT_CC_HYGIENE.md` §10-§11 | `INDEX_MASTER.md` "READ FIRST" entry top | `DECISION_LOG.md` entry. Backup tag: `pre-chat-continuity-protocol-2026-05-04`. Commit: `ef07e6d`.

**2026-05-04 evening (earlier) — Auth Flow Batch 1-6 + Closure 63 sub-decisions LOCKED V1 (cumulative 243 → 306, +63 substantive):**
- Batch 1 (§62) Architecture & Process — 10 sub + 1 META Review Division of Labor Claude+Gemini
- Batch 2 (§63) Onboarding & Conversion — 10 sub (T0 obiectiv-first hook + Magic Link 24h override + email day 25 reminder + skip vizibil Demographic Prior synthetic)
- Batch 3 (§64) Auth Edge Cases & Privacy — 10 sub (email change new only + 2-step ȘTERGE + GDPR Article 20 defer v1.5 + telemetry ZERO toggle + SW update prompt + dormant 90 zile cleanup)
- Batch 4 (§65) Engine #8 Warm-up + Periodization — 10 sub (warm-up 5-10 min adaptive + cool-down optional 2 min stretch override + mesocycle 4 săpt 3+1 deload + +2.5/+1.25 kg + 2x/săpt + ~40 mișcări Pareto)
- Batch 5 (§66) RPE/RIR + Beta Mechanics — 10 sub (RPE hibrid segmented + slider + RIR last set only + retention KPI 45/35/30 hibrid override + beta feedback hibrid email+Form Sunday digest)
- Batch 6 (§67) Safety/Compliance/Distribution — 10 sub (Pregnancy Settings + Heart Settings + red disclaimer B-clarified + ZERO push V1 + ZERO badges scope cut V1 + iOS REJECTED LOCKED PERMANENT)
- Closure (§68) UX Refinements — 3 sub (skip transparency + 3 sesiuni clarification + email digest first mesocycle prompt)

**2026-05-04 evening (mid) — §56 Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions LOCKED V1 (cumulative 216 → 243, +27 substantive net):**
- Root cause confirmed §36.80 BUG 2: `getUserPath()` returnează `'users/daniel'` literal când `getAuthState()=null` → DB Rules per-UID strict §36.75 BLOCHEAZĂ → 401 cycle infinit.
- Code-level fix LOCKED §56.1.3: `getUserPath()` returnează **obligatoriu `null`** mode Anonymous → toate apelurile Firebase API blocate → app rulează exclusiv local IndexedDB → bucla 401 eliminată mecanic.
- §56.1 Auth Pattern UX & Anonymous Mode (4 sub): auth-banner-soft + Anonymous preserve fallback local-first + `getUserPath()=null` BUG 2 fix + IndexedDB namespace per UID `andura_${uid}` Dexie multi-DB
- §56.2 Auth Methods & UI Wording (2 sub): Google OAuth primary + Firebase Email Link nativ fallback + auth screen wording LOCKED V1
- §56.3 Onboarding Position & Email Timing (2 sub): auth screen DUPĂ T0 + T0 scope 3-5 min max 5-7 întrebări cheie
- §56.4 Migration Strategy (3 sub): Daniel-only `users/daniel` legacy + `_migration` flag persistent Firestore + rollback strategy idempotent
- §56.5 Account Lifecycle (6 sub): recovery email lost refusal pattern + soft delete 30 zile grace `users/{uid}/_deleted` + reactivation `auth/user-disabled` + email change `updateEmail` retain uid + conflict detection preventiv + current address typo guard
- §56.6 Multi-device & Concurrent Sessions (2 sub): silent sync transparent + Record-level LWW pre-Beta
- §56.7 Anonymous→Auth Merge (2 sub): Fork Decision UI explicit + archive 7 zile + export local JSON
- §56.8 GDPR & Legal (3 sub): double bifa Privacy + ToS + Privacy Policy V1 Beta template + ToS V1 Beta "în măsura permisă de lege"
- §56.9 Sunset Timeline & Beta Gate (2 sub): sunset Anonymous post-Beta v1.5 + 30 zile grace + Beta launch gate target 1 ian 2027 Quality>Speed
- §56.10 PWA Cross-Context (3 sub): Magic Link Universal Links Android only pre-Beta + iOS scope cut v2/v3 + TWA wrap Android v1.5 contingent
- §56.11 Session Persistence & Offline UX (2 sub): Always Logged In `indexedDBLocalPersistence` + offline non-blocking banner local data
- §56.12 Logout Behavior (3 sub): Settings bottom + double-confirmation + preserve IndexedDB opt-in toggle + unsynced warning calm
- §56.13 Network Resilience (1 sub): Magic Link auto-retry 3x + manual fallback
- §56.14 Cleanup Mechanism (3 sub): A weekly script Daniel + B client-side fallback + C Cloud Function defer post-Beta v1.5
- §56.15 Telemetry & Observability (2 sub): T0→Auth conversion aggregate counters anonymous + `_telemetry/global` Firestore Spark compatible
- §56.16 DB Rules Firestore Update (1 sub): Security Rules v1 pre-Beta extended per-UID strict
- §56.17 Service Worker Auth State Caching (1 sub): SW + Firebase Auth standard SDK pattern
- §56.18 Daniel Manual Setup Pre-CC (2 sub): Firebase Auth Console + `suport@andura.app` MX
- §56.19 Scope OUT v1.5+ (3 sub): marketing email opt-in OUT + deep linking OUT + logout all devices revoke OUT
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 (Faza 2 wiring spec LOCKED V1 inline 19 sub-sections)
- Privacy Policy + ToS V1 Beta initial drafts created `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (verbatim from §56.8.2/3 templates)
- Push-back validated iterations: PIN custom REJECTED → Magic Link nativ + Hard delete REJECTED → Soft delete 30 zile + LWW field-level CRDT REJECTED → Record-level + Fork Decision suprascrie REJECTED → Archive 7 zile + iOS Universal Links REJECTED → Android-only + Logout wipe REJECTED → Preserve local + ToS liability absolute REJECTED → "în măsura permisă lege"

**Major rule changes locked în această sesiune:**
- iOS REJECTED LOCKED PERMANENT (memory persistent rule, PWA + TWA Android only) per §67.10
- Beta launch decalare oficial Quality > Speed default (Override §56.9.2 1 ian 2027) per §62.7
- Review Division of Labor META Claude + Gemini text-heavy/legal review cross + Daniel final spot-check per §62.X

---

## NEXT — Priority order actionable

### P1 ABSOLUT — Auth Flow §36.80 CC Opus Implementation (Phase 1 LANDED, Phase 2 deferred)

**Status 2026-05-04 night:** Phase 1 LANDED commit `0880641` + cleanup commit `242f065` (API Key) + cleanup commit (this — Privacy/ToS V2). 🟢 P1-FLAG-AUTH-DANIEL-PREP RESOLVED.

**Phase 2 deferred ~16-22h estimate over 3-4 batches** (Daniel decide trigger când e timpul):
- §56.1.4 IndexedDB namespace per UID (Dexie multi-DB) — DB layer arch change ~3-5h
- §56.5 Settings UI account lifecycle (delete 2-step "ȘTERGE" + reactivation + email change) ~4-6h
- §56.7 Anonymous→Auth Merge Fork Decision UI + archive 7 zile flow ~3-4h
- §56.12 Logout Settings double-confirm + opt-in IndexedDB wipe toggle ~2h
- §56.14.A admin-cleanup.js Daniel weekly script ~1h
- §56.15 Telemetry counters FieldValue.increment Firestore ~2-3h
- §56.16 Firestore Security Rules publish ~1h Daniel manual

### P2 NEW — Scenarios Coverage 1500-2000 Decisions (chat-uri strategice dedicate)

Per §69.1 PRE-BETA BLOCKER. Estimate ~5-15 chat-uri dedicate. Beta launch IMPOSIBIL fără. Acoperire actuală ~15-25% scope total. **Gap reduce post engines spec sessions: 1200-1700 → ~1170-1670 (~50 decisions consumate engine specs Periodization + Goal Adaptation + ADR 026 architectural, NU branches enumeration).**

### P3 — ADR 026 compile draft full ~125 decisions (architectural foundation COMPLETE)

§42 base 10 + §45 spec 75 + §50.1-§50.4 D-cluster 41 = 126 + Open Q1-Q10 LOCKED 2026-05-04 evening late = ~125 distinct (post Q5 split 3 sub + Q8 split runtime/scale). Chat strategic NEW dedicat compile draft full.

### P4 — Engines roadmap remaining: #3 Bayesian Nutrition → #4 Deload → #5 Energy → #6 Tempo → #7 Specialization (~3-4 chat-uri)

**Status engines (post 2026-05-04 evening late):**
- ✅ Engine #1 Periodization SPEC COMPLETE (~32 decisions)
- ✅ Engine #2 Goal Adaptation SPEC COMPLETE (~30 decisions)
- ⏳ Engine #3 Bayesian Nutrition (ADR 022 stub) — NEXT attack vector candidat
- ⏳ Engines #4-#7 PENDING
- ✅ Engine #8 Warm-up & Mobility LOCKED §45.6

### P5 — HANDOVER_GLOBAL split execution thematic per §62.2 (post-CC Auth Flow)

7664 LOC > 7000 threshold §VAULT_HYGIENE_PASS STEP 13 — TRIGGERED preserved. Backup tag pre-split mandatory.

### P6 — Long-term: D3.2-D3.4 + Engine #8 + ADR 022/024/025 + Knowledge cadence + Beta Recruitment + Audit legal + Soft Launch (target flexible per §62.7)

---

## ACTIVE_REFS — HANDOVER_GLOBAL sections to deep-read

Section pointers only (NU line numbers — go stale at every HANDOVER edit, navigate via heading `## §X`):

- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §62-§73 — Batch 1-6 + Closure most recent (cumulative 306)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56-§61 — Auth Flow §36.80 35 sub-decisions resolution (cumulative 243)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §50 — D3.1+D4+D2+D1 D-cluster sub-decisions 41 net (cumulative 216)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §47 — Alignment Questions Generation Rule LOCKED V1 (search-driven STRICT, DEPRECATED pre-fed verbatim)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §41-§45 — Vault Hygiene Sprint COMPLETE + ADR 026 spec session 75 decisions
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.99-§36.107 — offline coaching tree + 7→8 prescriptive engines + D2/D3 OPENED FOR DISCUSSION

---

## ACTIVE_ADRS — Top 3 to deep-read

- `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04 + §AMENDMENT 2026-05-04 evening BATCH 1-6 (Faza 2 Auth Flow §36.80 wiring spec + 10 sub-amendments .1-.10) — Priority 1 ABSOLUT CC implementation
- `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (stub, candidate compile draft full 126 decisions Priority 3 — §42 base 10 + §45 spec 75 + §50 D-cluster 41)
- `03-decisions/025-andura-gandeste-pentru-user.md` (Graceful Degradation Universal foundation principle — referenced cross-cutting în §63.9 + §65.3 + §66.3 + §68.1)

**Total ADRs active vault:** 26 numbered (001-021 + 022/023/024/025/026) + 9 named (ADR_BIAS_DETECTION_OBSERVABLE_v1, ADR_CASCADE_DEFENSE_v1, ADR_COMPOSITE_SIGNAL_LAYER_v1, ADR_MODE_DETECTION_UI_v1, ADR_MULTI_TENANT_AUTH_v1, ADR_OUTLIER_FILTER_v1, ADR_PAIN_DISCOMFORT_BUTTON_v1, ADR_RIR_MATRIX_ADAPTIVE_v1, ADR_SMART_ROUTING_EQUIPMENT_v1) = 35 ADR files total + DECISION_LOG.

---

## ACTIVE_FLAGS — DIFF_FLAGS.md P1 status

- **P1-FLAG-1** ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03 source upload — 🟡 PARTIALLY MITIGATED (Faza 3 integrates from chat context, NU file upload separate)
- **P1-FLAG-NEW** Codespace `npm install` drift (3 test FILE imports broken: fake-indexeddb + dexie) — 🔴 OPEN (CI/dev-env only, production unaffected; dedicated chat post Auth Flow)
- **P1-FLAG-AUTH-DANIEL-PREP** Daniel manual prep prerequisites pre-CC Auth Flow §36.80 — 🟢 **RESOLVED 2026-05-04 night** (Console Faza 1 dogfood DONE pre-existing 2 mai + MX `suport@andura.app` DONE Namecheap Email Forwarding test confirmed + Privacy/ToS V2 drafts LANDED V1 Beta validate sprint Daniel paralel). Spec §63.5 + §AMENDMENT 2026-05-04.18 #1 architectural limitation DEFINITIVELY DEFERRED v1.5 (INSIGHTS_BACKLOG AUTH-DEFER-1 + AUTH-DEFER-2). Phase 1 Auth Wiring LANDED commit `0880641`
- **P1-FLAG-HANDOVER-SPLIT** HANDOVER_GLOBAL 7664 LOC > 7000 threshold — 🟡 OPEN (strategy LOCKED V1 thematic split per §62.2, chat strategic NEW dedicat post-CC)
- **P1-FLAG-SCENARIOS-COVERAGE** ~1170-1670 decisions remaining PRE-BETA BLOCKER — 🔴 OPEN (Priority 2 ~5-15 chat-uri strategice dedicate). Gap reduce ~50 decisions post 2026-05-04 evening late engine specs (1200-1700 → 1170-1670). Branch enumeration cluster A = biggest blocker remaining.
- **P1-FLAG-IOS-PERMANENT** iOS REJECTED LOCKED PERMANENT — 🟢 LOCKED V1 PERMANENT (rule lock, NU pending — PWA + TWA Android only)

**P2 status:** P2-FLAG-1 D1-D6 → D2/D3/D4/D5/D6 ✅ RESOLVED Co-CTO; D1 only remaining strategic dedicat post Vault Hygiene + Auth Flow.

---

## RECENT — Older context preserved (truncate to HANDOVER deep când >50 LOC)

**2026-05-04 evening late (precedent thread, moved from NOW per §CC.6 move-then-replace) — Periodization + Goal Adaptation engines spec sessions + ADR 026 Open Q1-Q10 architectural foundation:** ~50 substantive net cumulative 306 → ~356. Q1-Q10 LOCKED (YAML decision-tree + 7 dimensions matrix + Weighted Hamming similarity + HYBRID engine topology + Q5/Q8 split sub + cadence bi-annual + 3-tier test suite + i18n REUSE + featureFlags REUSE rollout). Engine #1 Periodization SPEC COMPLETE 5 clusters ~32 decisions (I/O contract + mesocycle phase transitions Marius 5:1 + Israetel volume landmarks + Linear Block V1 + cross-engine hooks). Engine #2 Goal Adaptation SPEC COMPLETE 5 clusters ~30 decisions (5 templates primary RESOLVE + nutrition phase auto-detection + training modifiers per template×phase + push-back proporțional 3 tiers). Tone Daniel-isms caveman ×2 + "tataie" + "si eu te iubesc". Commit `300cd84`.

**2026-05-04 evening (older precedent) — §CHAT_CONTINUITY_PROTOCOL design + atomic 2-step implementation + cross-ref audit + Option 2 P1+P2 fixes COMPLETE:** Daniel a propus pattern "Shadow Protocol V2" via prompt CC din inbox, Claude critic 6 fixes, Daniel approved Pas 1 (4 vault docs commit `ef07e6d`) + Pas 2 (CURRENT_STATE genesis 157 LOC commit `615e526`). Cross-ref audit (commit `ea433f4`) → Option 2 P1+P2 fixes atomic 4 docs (commit `0e9373b`). Inbox cleanup proposal archive 137 (commit `dd53a93`). §CC.5 fast workflow self-applied refresh (commit `842aecf`). §CC.6 RECENT scope discipline + ACTIVE_REFS line ranges drop (commit `eb85b4a`). ALIGNMENT_QUESTIONS residue archive 141 (commit `0570a8c`). Chat-state continuity workflow LIVE.

**2026-05-05 morning — D3.1 + D4 + D2 + D1 sub-decisions LOCKED V1 (cumulative 175 → 216, +41 net):**
- §50.1 D3.1 Buton "Nu vreau" 13 sub (Firestore sync blacklist + Hard Cap 7 încercări + lock substitute intra-mesociclu + D3.1.6 Pattern Detection Passive Bugatti F4)
- §50.2 D4 NEW Mid-Session Resume Protocol 11 sub (IndexedDB per-set + dialog blocking 3 opțiuni + D4.2.1 threshold 6h Recuperabilă/Abandonată)
- §50.3 D2 Injury/Contraindication 13 sub (preset list ~15-20 + 3-tier severity + curated DB NSCA+ACSM + "Mă doare" button distinct + 5th invariant Medical Safety)
- §50.4 D1 Save the Week Silent 7 sub (3/4 threshold reuse Q20 + max 2 weeks consecutive cap + naming distinction Circuit Breaker 5% vs User adaptation 50%)

**2026-05-04 night — ADR 026 spec session COMPLETE 75 decisions LOCKED V1 (cumulative 100 → 175):**
- §45.2-§45.5 Q1-Q40 + 17 refinements + Engine #8 NEW (META 7→8 prescriptive engines) + cooldown defer post-Beta v1.5
- §47 Alignment Questions Generation Rule LOCKED V1 NEW — search-driven format mandatory STRICT, DEPRECATED pre-fed verbatim post 2026-05-04 night

**2026-05-04 evening (early) — ADR 026 spec decisions 1-10 LOCKED V1 (cumulative 90 → 100):**
- §42.1-§42.10 base architecture (format ramură + granularitate hibrid + cross-engine merge Dimension Registry + spec generation order Periodization first)

**2026-05-04 (Vault Hygiene Sprint Faza 3+4 COMPLETE):** §41 — 8 recomandări A-H aplicate (cross-refs reciproce + INDEX_MASTER refresh + ADR stubs 022/024/025/026 created + orphan wikilinks resolved + UTF-8 normalize 422 substitutions + ONBOARDING_SSOT_V1 consolidation) + §VAULT_HYGIENE_PASS rule codified STEP 10-15 mandatory post-ingest.

**2026-05-04 (chat strategic earlier) — §36.99-§36.107:** ADR 026 candidate "Andura Offline Coaching Decision Tree Exhaustive" PRE-BETA BLOCKER + 7 (now 8) prescriptive engines roadmap + 5 voices Cognitive Architecture confirmed + Goal lifecycle change first-class + Knowledge layer cadence quarterly/bi-annual/annual + D2 NEW (Injury Mapping) + D3 NEW (Don't Like + Home + Calistenice + Sport-Oriented) OPENED FOR DISCUSSION.

---

## POINTERS — Deep history drill-down

- **Full project history (deep archive):** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (7664 LOC, append-only — split candidate post-CC Auth Flow per §62.2 thematic)
- **Cronologic decisions:** `03-decisions/DECISION_LOG.md` (790 LOC, append-only descending chronologic)
- **Vault navigation:** `00-index/INDEX_MASTER.md`
- **Authoritative rules:** `VAULT_RULES.md` §CHAT_CONTINUITY_PROTOCOL + §HANDOVER_PROTOCOL + §VAULT_HYGIENE_PASS + §BATCH_PROTOCOL
- **CC autonomous prompt:** `PROMPT_CC_HYGIENE.md` §10 fast-handover + §11 startup verify
- **Outstanding issues:** `DIFF_FLAGS.md` (245 LOC, P1 + P2 active)
- **ADR-uri active 35 total:** `03-decisions/` (26 numbered 001-021 + 022-026 + 9 named ADR_*)

---

🦫 **Andura — chat-to-chat seamless. Zero data loss. Bugatti continuity. Quality > Speed default.** ✊
