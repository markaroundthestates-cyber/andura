# INSIGHTS BACKLOG

Entries care NU intră în v1 dar trebuie documentate pentru future design.

---

## P1 strategic prebeta — Training schedule override paradigm (user overrides preset schedule, coach adaptation needed real-time) NEW 2026-05-11 chat ACASĂ POST chat birou ingest

**Status:** 🟢 **P1 strategic prebeta scope dedicated discussion** — NU autonomous Co-CTO execution per autonomy lock EXTINS (strategic UX scope core = Daniel CEO + Claude chat strategic together pe Bugatti craft path).
**Priority:** P1 strategic prebeta scope (gates final UX paradigm reconfirm pre-Beta launch)
**Source:** Chat birou 11.05.2026 endpoint (Co-CTO + Daniel design session) + chat acasă handover `📥_inbox/HANDOVER_2026-05-11_MOCKUP_CLASIC_FINAL_v2.md` §Strategic insight NEW
**Cross-refs:** ADR `03-decisions/011-cdl-coach-decision-logic.md` paradigm adaptive scheduling reconfirmat fundament chat-current 2026-05-11 #5 LOCKED + `00-index/CURRENT_STATE.md` §NEXT (Daniel decision strategic discussion)

### Capture verbatim (chat birou endpoint)

**Training schedule override paradigm** — user wants ability to override preset training schedule:

- **Example:** trains pe rest day (preset = REST, user decide to train anyway).
- **Coach adaptation needed real-time** — NU rigid template "Joi · Push · Sapt 3 Ziua 3/4". Coach must respond contextual: dacă user choose train pe rest day, what session? recovery state check (muscleRecovery.js)? safe alternative? Or accept user decision + adapt subsequent days?
- **Cross-reference paradigm adaptive scheduling reconfirmat fundament** (NU paradigm nou) — PROJECT_VISION + ADR 011 CDL *"follows the body, not the calendar"*. Schedule override 4 opțiuni already mockup-locked chat-current precedent (Vreau alt tip / Sesiune ușoară / Sar ziua / Vreau antrenez când era pauză contextual). **Training schedule override = additional 5th dimension: user overrides preset training day choice itself, NU just intensitate/volum adjustment within day.**

### Why deferred (NU autonomous Co-CTO execution)

Strategic UX scope core = paradigm fundament product, NU mockup polish / engine extension scope. Requires:
1. Daniel CEO strategic alignment chat dedicated (NU executive autonomous).
2. Claude chat strategic together (deep think + spec drift cu Daniel input verbatim).
3. Possible ADR 011 §AMENDMENT NEW post-discussion (paradigm extension formalize).
4. Possible mockup additional override CTA design (post-ADR amendment LOCKED).
5. Possible engine extension (coachDirector method NEW handle user-day-override + muscleRecovery state check + alt-session generation).

### Action items (post-Beta launch retrospective candidate)

- Daniel signal go chat strategic dedicated discussion.
- Verbatim verbatim input capture (Daniel directive verbatim → ADR 011 §AMENDMENT proposal).
- Mockup design proposal (4 opțiuni current + 5th NEW override-day-itself CTA?).
- Engine gap-uri reassessment (3 gap-uri identified chat-current pre-port + possible 4th gap NEW user-day-override handler).
- INSIGHTS_BACKLOG entry update post-decision (status flip → LOCKED → ADR amendment cross-ref).

---

## Auth Flow §AMENDMENT 2026-05-04 BATCH 1-6 spec deviations (CC implementation 2026-05-04 evening late)

**Status:** Deferred post-Beta v1.5. Daniel directive path (a) confirm 2026-05-04 evening late + commit `0880641` Faza 2 wiring Phase 1 LANDED. Spec §AMENDMENT 2026-05-04 BATCH 1-6 .1 + .2 SKIPPED implementation due to Firebase Console capability limitations identified post-spec-LOCK. Investigate REST/SMTP custom v1.5.

### AUTH-DEFER-1 — Magic Link expiration 24h NOT configurable Firebase Console (spec §AMENDMENT .1 + §63.5)

**Where:** Firebase Auth Console — Email Link sign-in expiration setting
**Spec LOCKED V1:** §AMENDMENT 2026-05-04 evening BATCH 1-6 .1 + HANDOVER §63.5 OVERRIDE Q5 — Magic Link expiration **24h** (vs default ~1h). Maria 65 cross-context PWA Android tolerance: telefon slow + email întârzie 20-30 min.
**Reality post Daniel manual prep verification:** Firebase Console NU expune capability override Magic Link expiration (backend default ~1h aplicabil, NO UI toggle, NO REST API field documented for OOB code TTL override).
**Root cause:** Chat strategic 2026-05-04 evening assumed Firebase Console capability that doesn't exist. Spec presupose-eronat.
**Impact:** Maria 65 use case partial unmitigated — link expirat la 1h, telefon slow + email întârzie poate produce frustrare retry. Beta 50 testeri tolerance acceptable pentru V1.0.
**Proposed v1.5 fix:** Migrate la SMTP custom backend (NU Firebase Magic Link) cu OOB code TTL configurable la 24h. Cost: SMTP provider $0-10/lună (SendGrid/Mailgun free tier sufficient pre-Beta scale) + ~5-10h dev custom flow (token generation + verify endpoint Cloud Function — contradicts §36.93 D3 Spark retain DAR Cloud Function single endpoint încadrabil free tier 2M invocations/month).
**Workaround V1 Beta:** Document expectation 1h în onboarding/settings UI ("Verifică emailul în următoarea oră"). Auto-retry button persistent pe Magic Link form pentru re-trigger flow ușor.

### AUTH-DEFER-2 — Email body wording educativ NOT configurable Firebase template (spec §AMENDMENT .2 + §64.5)

**Where:** Firebase Auth Console — Email Link sign-in template
**Spec LOCKED V1:** §AMENDMENT 2026-05-04 evening BATCH 1-6 .2 + HANDOVER §64.5 — Magic Link inexistent email behavior silent send Firebase native + wording educativ email-side verbatim: *"Dacă ai deja un cont Andura, acest link te va conecta direct la profilul tău existent. Dacă ești la prima accesare, am creat acum un cont nou pentru tine, iar progresul tău va fi salvat automat."*
**Reality post Daniel manual prep verification:** Firebase Console NU expune Magic Link email template customization UI pentru Email Link sign-in flow specific (Authentication → Templates customization disponibilă pentru Verification email + Password reset, dar NU pentru Email Link sign-in body wording educativ specific).
**Root cause:** Chat strategic 2026-05-04 evening assumed Firebase template capability that doesn't exist for Email Link sign-in flow specifically.
**Impact:** Default Firebase generic email body sent. Maria 65 anti-typo guard via email body wording educativ unmitigated. Anti-account-enumeration security preserved (Firebase native silent send) — only educational copy missing.
**Mitigation aplicat 2026-05-04 evening late commit `0880641`:** Per Daniel directive — wording educativ aplicabil DOAR pe auth screen UI per §AMENDMENT .3 (soft-hint sub email field LANDED `src/pages/auth.js` COPY.emailHint verbatim: *"Verifică cu atenție adresa de e-mail introdusă pentru a te asigura că primești link-ul de acces."*). Anti-typo Maria 65 partial mitigated UI-side instead of email-side.
**Proposed v1.5 fix:** SMTP custom backend (paralel cu AUTH-DEFER-1) — full template control + i18n RO + wording educativ verbatim per §AMENDMENT .2. Combined fix cu AUTH-DEFER-1 = single migration path.

---

## Strangler Integration Pre-work (defer-uri Batch 1 Audit — rezolvate la strangler sprint)

**Status:** Deferred. Toate findings de mai jos sunt non-blocante pentru Batch 2. Re-audit la strangler integration (prima dimensiune portată = AA detection).
**Source:** Adversarial audit Batch 1 — 2026-04-27. Audit source file removed in vault cleanup 2026-04-30 (recuperare prin `git log --all --full-history -- "02-audit/BATCH_1_AUDIT_2026-04-27.md"`).

### HIGH-1 — CDL adapter: clusterTrace → ADR 011 rationale shape
**Where:** `src/engine/decisionCluster.js` — export `clusterTraceToADR011Rationale(trace)`
**Why deferred:** Mapping e prezentă implicit în trace; adapter explicit necesar doar când coachDirector CDL write (`coachDirector.js:208-222`) se portează la cluster.
**Proposed fix in audit:** `export function clusterTraceToADR011Rationale(trace)` cu gate-branch (shortCircuited) și non-gate branch (highest-priority ADJUSTMENT = winner). Add tests + JSDoc.

### MED-1 — Compound `shorten_session` → originalCount fals
**Where:** `decisionCluster.js:_applyEnhancement` SHORTEN_SESSION handler
**Issue:** Al doilea shorten citește lungimea deja-trunchiat ca originalCount. Trace CDL consumers văd "shortened from 3 to 2" în loc de "from 5 to 2".
**Proposed fix:** Winner-takes-all pe `shorten_session` (lowest count wins) pre-pipeline, sau captura `baseExercisesLength` la intrarea în `_runEnhancementStage`.

### MED-4 — Contract guarantees pure/deterministic neenforced runtime
**Where:** `dimensionContract.js` — nicio validare runtime pentru side effects / Date.now / Math.random în `analyze()`
**Proposed fix:** `runDimensionConformanceCheck(module)` helper în tests/ — run analyze() × 2 cu input identic + spy pe globals. Scaffold per dimensiune la strangler.

### LOW-1 — `STAGES` importat dar nefolosit în `decisionCluster.test.js:3`
**Fix:** Înlocuiește string literals `'GATE'` (lines 288, 320) cu `STAGES.GATE`.

### LOW-3 — `assertValidRegistry` nu se apelează la module init
**Fix:** Dev-mode bootstrap în `dimensionRegistry.js`:
```js
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  assertValidRegistry();
}
```

### LOW-4 — `shorten_session` newCount în trace nu clampează la exercises.length
**Fix:** `newCount: Math.min(Math.max(0, count), session.exercises.length)` în `_applyEnhancement`.

### LOW-7 — `CDLEntry` typedef fără property list
**Fix:** Adaugă proprietăți ADR 011 schema (id, ts, date, context, proposed, outcome) în `dimensionContract.js:26-27`.

### LOW 2/5/6/8/9 — TODOs cosmetic / speculative
- LOW-2: `findDimension` exported but unused — OK, documented future use
- LOW-5: `REDUCE_VOLUME` multiplier > 1 nu e clamped — caller responsibility
- LOW-6: multiplier 0/negative/NaN nevalidat în `assertValidRecommendation` — add `Number.isFinite && >= 0` check
- LOW-8: Registry nu verifică path convention `src/engine/dimensions/<id>.js` — out of scope foundation
- LOW-9: `tier` + `confidence` fields din DimensionResult ignorate de cluster — by design (informational)

---

## Strangler Integration Pre-work (Batch 2 Audit Defer-uri 2026-04-27)

**Status:** Deferred. Findings de mai jos sunt non-blocante pentru Batch 2 mini-fix. Re-audit la strangler integration (prima dimensiune portată = AA detection).
**Source:** Adversarial audit Batch 2 — 2026-04-27. Audit source file removed in vault cleanup 2026-04-30 (recuperare prin `git log --all --full-history -- "02-audit/BATCH_2_AUDIT_2026-04-27.md"`).

### MED-2 — `assertValidMigration` validator lipsește
**Where:** `src/migrations/migrationRunner.js` — nu există validare pe shape-ul unui migration object la registration
**Why deferred:** MIGRATIONS e empty în Batch 2. Bug surface zero până la prima dimensiune portată.
**Proposed fix:** `assertValidMigration(m)` helper (verifică fromVersion, toVersion, storageKeys, migrate() signature) + apelat la module init în dev mode. Add tests.

### MED-3 — `initSentry` ordering risc: migrations pot rula înainte de Sentry init
**Where:** `src/util/sentry.js` + call site in `main.js` (sau echivalent app init)
**Why deferred:** Migrations array e empty — zero Sentry calls în Batch 2. Becomes real la prima migration live.
**Proposed fix:** `await initSentry()` înainte de `runMigrations()` în app init sequence. Document ordering în `initSentry` JSDoc.

### MED-4 — `hasActiveDevFlags()` util lipsă
**Where:** `src/util/featureFlags.js` — `readDevFlags()` e internal; nu există API public pentru "are dev overrides active?"
**Why deferred:** Dev-only UX nicety. Zero impact prod.
**Proposed fix:** `export function hasActiveDevFlags()` → `readDevFlags() !== null`. Util pentru dev overlay / warning banner.

### LOW-1 — `_safeSentry` pattern nu e shared cu decisionCluster.js
**Where:** `src/engine/decisionCluster.js` — direct `sentry?.captureException?.()` fără try/catch
**Proposed fix:** Extrage `_safeSentry` într-un shared util (`src/util/safeSentry.js`) și importă în ambele.

### LOW-2 — `runMigrations` nu validează shape-ul migration objects (assertValidMigration pending MED-2)
**Where:** `src/migrations/migrationRunner.js:65` — `for (const migration of sorted)` fără shape check
**Depends:** MED-2 fix above.

### LOW-3 — `MIGRATIONS` nu se validează la module init în dev mode
**Where:** `src/migrations/MIGRATIONS.js`
**Proposed fix:** Dev bootstrap `assertValidRegistry(MIGRATIONS)` (similar LOW-3 Batch 1 pentru dimensionRegistry).

### LOW-4 — `getEntryVersion` nu loghează când schemaVersion non-numeric (silent downgrade la v1)
**Where:** `src/migrations/migrationRunner.js:26`
**Proposed fix:** `if (entry && 'schemaVersion' in entry && typeof entry.schemaVersion !== 'number') logger.warn(...)` — only at DEBUG level.

### LOW-5 — `resolveUserId` preferință 'user-id' over 'device-id' nedocumentată în ADR 011
**Where:** `src/util/featureFlags.js:70` + ADR 011
**Proposed fix:** Adaugă notă în ADR 011 §Implementation că 'user-id' e rezervat multi-tenant (post-auth), 'device-id' e UUID anon. În featureFlags.js JSDoc deja documentat.

### LOW-6 — `hashStringDjb2` e exportat dar fără `@internal` sau `@private` marker
**Where:** `src/util/featureFlags.js:50`
**Proposed fix:** Adaugă `@internal` JSDoc tag. Alternativ nu exporta — dar exportul e util pentru tests.

### LOW-7 — `isEnabled` nu loghează în dev mode când flag unknown (silent fail-closed)
**Where:** `src/util/featureFlags.js:125`
**Proposed fix:** `if (process.env.NODE_ENV !== 'production') console.warn('[FeatureFlags] Unknown flag:', flagId)` — ca să catches typos în development.

### LOW-8 — `FLAGS` registry lipsă validare la freeze (non-boolean defaults / rollout out 0..1)
**Where:** `src/util/featureFlags.js:35` — `Object.freeze({})` direct, fără assertValidFlags()
**Proposed fix:** `assertValidFlags(FLAGS)` helper cu `rollout` ∈ [0,1] + `default` boolean check. Apelat la module init.

### LOW-9 — `readDevFlags` nu validează că valorile din JSON sunt boolean
**Where:** `src/util/featureFlags.js:83`
**Issue:** `{ test_flag: 1 }` (number) trece prin readDevFlags și `dev[flagId] === true` check face `1 === true` = false (corect dar silent confusing în dev).
**Proposed fix:** Filter non-boolean values + warn: `if (typeof v !== 'boolean') { console.warn(...); delete parsed[k]; }`.

---

## ADR 018 — Engine Extensibility Architecture (PRIORITY 1, Sesiunea NEXT)

**Status:** Spec NEXT priority, NU built încă.
**Source:** Daniel insight 27 apr 2026 sesiune END — "la fel cum acum am avut discutia asta... pe parcurs o sa mai tot avem, si ne trebuie un plan ca sa implementam si restul si sa nu rupem engine daca ne mai vine o idee... posibilitatea de imbunatatire in orice etapa fara sa moara."

**Concept:** Engine extensibil prin natura lui = orice idee viitoare devine layer adăugabil, NU rewrite. Open-Closed Principle + Hexagonal Architecture + Strategy Pattern.

**Spec componente:**
1. **Dimension Registry** — registry central declarativ unde dimensiuni se înregistrează. Coach Director iterează registry, NU hard-coded list.
2. **Standardized Dimension Contract** — fiecare dimension implementează `analyze(input) → {tier, confidence, signals[], recommendations[]}`. Tooling testabil identic.
3. **Decision Cluster Engine** — primește toate dimensiunile + reguli prioritate, computes final session adjustments. Adaugi dimensiune = înregistrează în cluster, NU edit cluster.
4. **Schema Migration Strategy** — versioned schema + migration runner. Schema v3 → v4 = migration automatic, backward compat.
5. **Feature Flags Infrastructure** — runtime feature flags → poți rola dimensiune nouă 10% useri → 50% → 100% bazat pe metrics.

**Effort:** ~1-2 zile spec design (Opus task — audit = exclusiv Opus).

**Why critical:** TOATE features viitoare (Vitality, synthetic, parametric programs, injury, nutrition, mood, etc.) build pe această fundație. Spec înainte de orice build feature previne refactor forțat later.

---

## ADR 016 — Vitality Layer (PRIORITY 2, depends ADR 018)

**Status:** Concept articulat, ADR pending spec.
**Source:** Daniel insight 27 apr 2026 — înlocuim bloodwork (Gigel test fail) cu întrebări behavioral proxy.

**Concept Daniel:** "intrebari scurte despre user — cum te simti, energic/normal, temperamental, dormi bine, etc. Combinat cu age+kg+height+BMI ne indica direcția approximativ. Behavioral proxy questions = signal puternic, friction zero."

**Întrebări candidate brainstorm:**
- Energie/Vitalitate: "Cum te simți în general?" / "Cum dormi?"
- Stres/Reactivitate: "Te-ai descrie ca temperamental?" / "Recovery post-antrenament?"
- Sleep quality: "Te trezești odihnit?"
- Motivație: "Cum te simți cu motivația în general?"
- Inflamație: "Cât de des te simți cu dureri?"

**NU includem (Gigel test fail):** întrebări directe libido, erecție, etc.

**Implementation pattern:**
- Opt-in post-onboarding, NU mandatory
- User decide când completează (sesiune 5, 10, 30, niciodată = OK)
- Engine inferă behavioral aproximativ după 20-30 sesiuni dacă user skip

**Working title:** "Vitality Layer". Posibili alternative: "State Signals", "Lifestyle Layer", "Recovery Profile". Decisive la spec time.

**Effort:** ~1 zi spec după ADR 018 done.

---

## ADR 017 — Demographic Prior Database (PRIORITY 3, depends ADR 018)

**Status:** Concept articulat, ADR pending spec.
**Source:** Daniel insight 27 apr 2026 — synthetic profiles diverse calibrate engine cross-demographic.

**Concept:** 500 profile diverse × 90 zile sesiuni synthetic = Demographic Prior Database = production infrastructure (NU test fixture). Engine la cold start consultă profile similar → personalizat aproximativ încă din sesiunea 1. Real sesiuni corectează prior pe parcurs.

**Profile mix 500 total:**
- ~50 manually crafted edge cases (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.)
- ~450 algorithmic generated cu variație controlată

**Storage:** local fixtures `tests/fixtures/syntheticProfiles.js`. Generated runtime memory pentru test runs. NU persist permanent. **Zero impact pe Firebase production cost.**

**Sweet spot 500:** dev workflow speed vs coverage density. Scale-able prin generator parametrizat.

**Effort:** ~1 zi spec + ~2-3 zile build după ADR 018 done.

---

## Engagement drop signal (v1.5/v2 candidate)

**Pattern:** 0 rated sets pe ≥3 sesiuni consecutive = engagement disengagement signal.

**Source:** AA design discussion 2026-04-26.

**Why backlog (NOT v1):**
- Re-engagement intervention requires separate ADR design
- Different from AA detection (auto-aggression) — opposite signal
- Needs UX flow (re-engagement prompt timing, wording)

**Reconsider trigger:** post-launch alpha, after seeing real disengagement patterns la users.

---

## Recommendation engine personalizat (Faza C profile, v1.5/v2)

**Open research:** profile-driven recommendations.

**Starting points (NU spec, ANCORE pentru future design):**
- Sprinter — planuri cu varietate (rotație exerciții, periodization?)
- Marathon — progresie graduală (increment kg mai mic, mai multe maintenance?)
- Yo-yo — TBD (probabil planuri scurte cu deload frecvent)
- Strategic — TBD (probabil maximum customization)

**Source:** AA design discussion 2026-04-26.

**Why backlog:**
- Faza B (post 50-100 useri) = wording personalizat per profile
- Faza C (v1.5/v2) = recommendation engine personalizat
- Ambele depind de validation comportamentală pe user data real

**Reconsider trigger:** post-50+ users behavioral data + Faza B done.

---

## Memory-aware questions (v1.5)

**Concept:** engine-ul nu pune aceleași întrebări de fiecare dată.

**Examples:**
- Sesiunea 1: "Cum a fost antrenamentul?"
- Sesiunea 2 (după "umărul m-a deranjat"): "Cum e umărul azi?"
- Sesiunea 3 (umăr ok 2 sesiuni la rând): nu mai întreabă, monitorizează silent

**Source:** Coaching textbook synthesis 25 apr 2026.

**Why backlog:** Necesită storage pe topics deschise + logic follow-up vs new question + resolved threshold. Effort ~1 săpt build. NU MVP launch priority.

**Reconsider trigger:** post-beta validation core engine.

---

## Self-audit weekly (v1.5)

**Concept:** engine self-check predictions vs realitate. "Recomandările mele de săpt trecută au funcționat? RPE actual vs predicted? Ce greșeam?"

**Source:** Coaching textbook synthesis 25 apr 2026.

**Why critical long-term:** asta e ce face engine-ul smart cu timpul, NU doar accumulator de date. Diferentiator real vs Fitbod/Strong (care nu fac asta).

**Why backlog now:** necesită storage pe predicții vechi vs realitate + comparare automată + feedback loop. Effort ~1-2 săpt build. NU MVP launch priority.

**Reconsider trigger:** post-beta + 50+ useri data.

---

## Calorii dinamic pe context (v1.5)

**Concept:** Calorii NU setting fix. Engine ajustează:
- Somn slab 3 nopți la rând → +200 kcal pentru recovery
- Stres ridicat → suspendă cut, propune maintenance
- Greutate scade > 1.5 kg/săpt → flag "prea agresiv", recomandă +150 kcal

**Source:** Coaching textbook synthesis 25 apr 2026.

**Why backlog:** Necesită sleep tracking integration + threshold thresholds noi în RuleEngine. Activate la PERSONALIZING+ (Tier 3+). Effort ~3-5 zile.

**Reconsider trigger:** post-Profile Typing + Vitality LIVE.

---

## Calibration recalibrare protocol (workflow doc, NU ADR)

**Status:** Daniel mention path `08-workflows/AA_RECALIBRATION_PROTOCOL.md`, NU built încă.
**Concept:** proces lunar review CDL vs experience reală, prima review luna 3.

**De ce workflow doc, NU ADR:** procedural process, NU architectural decision.

**Effort:** ~30-45 min draft.

**Reconsider trigger:** post-beta launch, prima review luna 3 calendar.

---

## Deload invizibil (post-launch sprint 9+)

**Concept:** engine detectează nevoia de deload, NU anunță explicit. Reduce volum 20-30%, păstrează greutățile la 80%, dacă user întreabă explică.

**Source:** Coaching textbook synthesis.

**Trade-off conceptual:** transparency vs UX. Argument PRO: user real nu vrea jargon "deload week". Argument CONTRA: Andura = trust-builders, NU manipulatori.

**Reconsider trigger:** A/B test cu useri reali post-launch.

---

## Mid-session intervention (post-launch sprint 9+)

**Concept:** dacă user raportează RPE 9 la set 2 din 4 (expected 7-8), engine întrerupe seria recomandată și propune scădere greutate.

**Source:** Coaching textbook synthesis.

**Why backlog:** mutare îndrăzneață care poate enerva user. Necesită UX testing serios. Activarea = candidate FAZA 4 sau 5, NU MVP.

**Reconsider trigger:** post-launch beta, după AA pipeline real-world calibrated.

---

## Skip / Not now (deferred indefinit)

- **Bloodwork** — DEFINITIV OUT (Memory permanent + DECISION_LOG entry 27 apr). NU readuce fără trigger explicit Daniel.
- **Sentiment analysis live** — LLM runtime cost prohibitiv pentru freemium model
- **Emotional voice detection** — voice input NU în roadmap, ML model dedicated
- **Hard refuse pe sănătate** — liability legal medical decision

---

## AA Friction Modal — follow-ups post Decision A/B/C/D rewrite (2026-04-29)

**Source:** Opus task report AA_FRICTION_DISMISS_REWRITE (commits `bdb0be6` + `b24aaae`), migrat aici pre cleanup vault.

**Context:** Per-day dismiss persistence + single-click override + neutral copy ("Plan ajustat — recovery") + test isolation flag `_suppressAAFrictionModal`. 24 → 14 tests rescrise. Engine learning rămâne silent (3× dismiss → suppress).

### Backlog items deferred

- **Signal exposure audit cross-codebase.** Sweep raw signal-type strings (`volume_creep`, `frustration`, `recovery_debt`, `ignore_recovery`, `calorie_acceleration`) în `src/engine/coachContext.js`, `src/engine/proactiveEngine.js`, dashboard auto-rec card. Same RE-leak pattern eliminat din modal poate exista altundeva.
- **Copy A/B test post-launch.** "Plan ajustat — recovery" e ghicire calmă. Alternative candidate ("Coach-ul îți reduce volumul azi pentru recovery") merită test când telemetry există.
- **Admin/debug "ce vede coach-ul" pane.** Restore RE-safe transparency opt-in fără să surface în normal flow. Recovery surface dacă engine silences modal user-ul ar fi vrut să vadă.
- **Playwright config env-driven baseURL.** `playwright.config.js` hardcoded la `https://markaroundthestates-cyber.github.io`. Fix one-liner: `baseURL: process.env.BASE_URL || 'https://…'`. Elimină temp-config dance pentru local verify.
- **`aa-friction-pending` lifecycle key cleanup.** Per-day dismiss persistence face pending key redundant. Singura valoare: survive accidental refresh în-progres modal același zi. Remove writers/readers follow-up.
- **ModalManager unit tests.** Pending de la task anterior — ar fi prins test-isolation gap înainte de prod. (11 e2e fail-uri din modal backdrop intercept au necesitat `_suppressAAFrictionModal` flag.)

---

## Engine extensibility decommission — `applied-patterns` storage key (Task #30.9 — BLOCKED on Daniel sign-off)

**Source:** [[AUDIT_30_9_BLOCKED_STATE]] preserved separately. Tracker entry pentru continuitate.

**Status:** Caller cleanup (5 files: `renderIdle.js`, `util.js`, `modals.js`, `dashboard.js`, `main.js`) + 4 sign-off triggers (≥30 real CDL entries + zero mismatch + Daniel manual validation + 7-day diff audit).

**Sequence:** Step 1 caller cleanup (Sonnet 30-45 min) → Step 2 Daniel manual validation (~1h) → Step 3 storage decommission (Sonnet 15-20 min). Total ~2h split.

**Cross-ref:** [[011-coach-decision-log-architecture]] §Decommissioning.

---
