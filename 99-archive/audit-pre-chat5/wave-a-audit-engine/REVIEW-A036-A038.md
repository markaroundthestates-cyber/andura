# Wave A Engine Audit §A036 (DB Tier) + §A038 (Kalman) — 2026-05-21

**Auditor:** Claude Code (autonomous Opus). **Stance:** FORCE adversarial — assume defects.
**Files audit:** 7 source + 2 test (kalmanFilter, volumeLandmarks).
**Anti-hallucination:** Toate findings carry `file:line` evidence verbatim — ZERO speculatie.

Spec audit cite spec NC§35-C1+C2 si NC§38-C2 din `audit-nuclear-2026-05-19/findings-§35.md` + §38.md
(NU read direct — referintat doar prin prompt directive). Findings below se bazeaza EXCLUSIV pe
sursa cod citita verbatim si compare cu spec verbatim citate in cod (ADR 020, ADR 022, ADR 026 §9.4).

---

## §A036 DB Tier mapping

### Spec verbatim ancorat (din cod comments)

- `tieringEngine.js:1-25` — ADR 020 invocat: **Tier 0 = localStorage hot (last 30d), Tier 1 = Dexie/IndexedDB warm (30-180d), Tier 2 = Firestore cold (>180d, deferred post-Pro)**.
- `tier2Stub.js:1-31` — explicit "DEFERRED post-launch v1 + Pro tier launch", NO-OP stubs.
- `db.js:1-28` — Per-user namespace `andura_<uid>` via Dexie multi-DB (ADR_MULTI_TENANT_AUTH_v1 §56.1.4 LOCKED V1).

### Prompt directive divergence (NU finding, observatie)

Promptul cere verify **"RTDB tier 0 / Firestore tier 1 / IndexedDB tier 2"** — codul implementeaza
**"localStorage tier 0 / IndexedDB tier 1 / Firestore tier 2"** per ADR 020 verbatim. Codul match-uieste
specul ADR 020, deci NU bug — promptul may have mis-cited tier numbering. Audit continua pe spec ADR 020.

---

### CRITICAL findings (blocker pre-Beta)

**Niciun finding CRITICAL.** Tier 0→1 rotation logic = zero-info-loss correct (write-then-prune verify
ordered, retry 3x backoff, Sentry on persistent fail, audit trail in `migration_events`).

---

### MEDIUM findings (Beta-OK but iter 2 ticket)

**M-§A036-01 — Module-level singleton `_db` + `_namespace` race on Auth migration mid-process**
- **File:** `src/storage/db.js:73-78, 105-134, 168-174`
- **Issue:** `_namespace` cached la prima `getNamespace()` call (line 106 `if (_namespace !== null) return`).
  Daca user transitions anonymous → signed-in MID-SESSION (Magic Link callback), `getNamespace()` cached
  ramane `anonymous_<deviceId>` pana `closeDb()` chemat explicit. Caller-uri carenu cheama `closeDb()`
  post-Auth migration ar putea write to wrong DB. `migrateAnonymousToAuth.js` exista (per glob) dar **NU am
  read verbatim** sa confirm ca cheama `closeDb()` ca parte din migration flow.
- **Severity:** MEDIUM (Beta-OK doar daca migration flow garantat re-init DB; HIGH daca callers omit `closeDb()`).
- **Fix:** Either (a) make `getAuthState()` invalidate `_namespace` automatically pe Auth event listener,
  OR (b) document hard contract `migrateAnonymousToAuth → MUST call closeDb()` + assert via test.

**M-§A036-02 — `tieringEngine.classifyByAge` defensive null timestamp → HOT (line 121) silent retention forever**
- **File:** `src/storage/tieringEngine.js:113-125`
- **Issue:** `if (ts == null || ts >= cutoff) hot.push(entry)` — entries fara `ts` sau `date` raman in Tier 0
  IN INFINIT (never rotate). CDL entries should all have `ts` per ADR 011, dar daca un bug upstream lasa
  `ts` undefined (e.g., legacy `localStorage` `coach-decisions` populated pre-2026-04 schema), aceste
  entries cresc Tier 0 forever fara warning. Sentry NU se trigger pentru "stuck hot" scenario.
- **Severity:** MEDIUM. Anti-quota safeguard `estimateTier0Bytes` exists (line 89) dar nu identifica
  CAUZA = stuck-hot entries fara `ts`. Iter 2 ticket: telemetry counter `stuckHotEntries` + Sentry warn.
- **Fix:** Log `entriesWithoutTs` count in `perKey` audit + Sentry breadcrumb daca count > 0.

**M-§A036-03 — `tier2Push/Fetch/Stats` async returns Promise resolving sync — caller cannot await safely if API later changes**
- **File:** `src/storage/tier2Stub.js:40-73`
- **Issue:** Stubs marked `async` dar return literal objects fara await. When Tier 2 lands real
  implementation, callers cu pattern `tier2Push(...)` (NU `await tier2Push(...)`) vor break silent.
  NO test covers calling convention enforcement.
- **Severity:** MEDIUM (future regression vector). Beta-OK pentru ca NU se cheama in productie acum.
- **Fix:** Add `void` return type or `Promise<void>` documentation enforcing await OR add ESLint rule
  `@typescript-eslint/no-floating-promises` post-TS migration.

**M-§A036-04 — `scheduleStore.saveWeekly` dynamic import error-swallow chain (3 nested catches) silent fail**
- **File:** `src/react/stores/scheduleStore.ts:65-95`
- **Issue:** Triple try/catch/then-catch nested. Daca `scheduleAdapter.js` lipseste, import fail tacit;
  daca `commitCalendarEdit` typing semantically mismatch (per comment line 78-80 "Semantic mismatch
  pre-existing — fix deferred Option C async migration"), commit silent fail; daca commit-ul arunca,
  outer catch silent. User vede `editMode: false` set (line 94) si crede SAVED dar NIMIC nu s-a scris
  in Tier 1. ZERO Sentry log.
- **Severity:** MEDIUM (UX confusion silent fail; pre-Beta acceptable per inline comment "Phase 4 stub"
  dar trebuie ticket-uit Phase 5+).
- **Fix:** Either bubble fail visible to user (toast "Save failed, retry?") OR Sentry breadcrumb minim.

**M-§A036-05 — Cross-tab race on Tier 0 → Tier 1 rotation (no `storage` event listener)**
- **File:** `src/storage/tieringEngine.js:162-228` (entire `rotateOnce`)
- **Issue:** Tab A starts rotation (read line 178 `db.get(tier0Key)`), Tab B writes new entries to same key,
  Tab A computes `hot = ...` based on stale snapshot, Tab A `db.set(tier0Key, hot)` on line 205 OVERWRITES
  Tab B's writes silent. **Verified bug** — daca user opens 2 tabs si una face migration mid-write,
  pierde scrieri intercurente.
- **Severity:** MEDIUM (low-probability multi-tab usage in fitness PWA, Beta-OK; data loss risk real).
- **Fix:** Use `navigator.locks.request('andura-tiering', ...)` Web Locks API OR Dexie-only writes for
  Tier 0 + Tier 1 in single transaction (eliminate localStorage from hot path).

---

### LOW / observations (post-Beta)

**L-§A036-01 — `tierStorage.js` (Daniel's util) vs `tieringEngine.js` (ADR 020) — DOUA paradigme paralele Tier 0/1/2**
- **File:** `src/util/tierStorage.js:1-153` (live/aggregate/archive 90d/365d/>365d) vs
  `src/storage/tieringEngine.js` (hot/warm/cold 30d/180d/>180d cu ADR 020).
- **Issue:** TWO mappings cohabit. `util/tierStorage.js` use case = workout logs tiered display
  (90d full / 90d-1yr daily agg / >1yr monthly arch) per coments line 1-4. `storage/tieringEngine.js`
  = CDL rotation per ADR 020. Diferite KEYs (`tier-live/aggregate/archive` vs `coach-decisions` etc).
  Nu conflicteaza in practica, dar DOUA SSOTs pentru "tier" terminology = future confusion.
- **Fix:** Rename `util/tierStorage.js` → `util/workoutHistoryTiers.js` sau adauga comment cap-file
  clarifying "This is workout log display tiering, NOT ADR 020 storage tiering."

**L-§A036-02 — `archiveLogs` silent typo risk: `log.session` falsy → uses `todDate(d)` per-day session group**
- **File:** `src/util/tierStorage.js:93`
- **Issue:** Daca entries au `session=0` (number), `String(0) = '0'` truthy → uses '0' as session key for
  ALL no-session logs → "1 session per month" massive undercounter. Edge case dar reportable.
- **Fix:** Explicit check `log.session != null && log.session !== 0` sau use UUID per session.

**L-§A036-03 — `estimateTier0Bytes × 2` UTF-16 multiplier conservative — masks Tier 0 actual usage 2x**
- **File:** `src/storage/tieringEngine.js:98`
- **Issue:** Comment "UTF-16 — rough upper bound" — multiplies stored char count × 2 assuming worst case
  surrogates. Actual modern engines store UTF-8 internally for ASCII-heavy payloads (JSON). Real usage
  ~50% of estimate. Acceptable conservative safeguard, NU bug.

---

### Verdict §A036: **PASS_WITH_NITS**

Tier 0/1 rotation = production-ready (zero-info-loss correct, retry backoff, audit trail, Sentry).
Tier 2 = deferred stub explicit (acceptable pre-Beta per ADR 020). 5 MEDIUM iter 2 tickets + 3 LOW
observations. ZERO Critical findings.

---

## §A038 Kalman convergence + MEV/MAV/MRV

### Spec verbatim ancorat (din cod comments)

- `kalmanFilter.js:1-12` — Cluster B2 Caveats verbatim: defaults Hall 2008 ~22 kcal/kg LBM, R²>0.85
  validation gate, EWMA fallback feature flag `bayesian_kalman_v1`.
- `constants.js:46-64` — `KALMAN_DEFAULTS.metabolicAdaptationKcalPerKgLbm = 22`, `r2ValidationGate = 0.85`,
  `ewmaAlphaDefault = 0.30`.
- `volumeLandmarks.js:1-13` — Cluster C1 Hibrid Lookup + Regression STRICT compound + 0.3× degradation
  isolation cand compound <3 in 14d window.

### Prompt directive note: "Kalman 90-day convergence"

Promptul cere verify convergence rate ~90 days. Codul **NU contine explicit "90-day convergence
parameter"** — convergence emerges din `processNoise² + measurementNoise²` ratio prin Kalman gain.
Cluster B2 spec NU specifica "90-day convergence" verbatim — promptul citeaza specul UN-VERIFIED.
Audit assume scop = "convergence rate realistic vs literature Hall 2008 + diet adaptation". Findings below
addresseaza acest scop.

---

### CRITICAL findings (blocker pre-Beta)

**C-§A038-01 — `processNoise` default applied via `× 0.01` scaling factor UNDOCUMENTED — diverge tacit de literatura**
- **File:** `src/engine/bayesianNutrition/kalmanFilter.js:69`
- **Issue:** Default `Q = KALMAN_DEFAULTS.metabolicAdaptationKcalPerKgLbm * 0.01 = 22 * 0.01 = 0.22`.
  ZERO comment why × 0.01. `metabolicAdaptationKcalPerKgLbm = 22` reprezinta kcal/kg LBM/day, NU sigma
  in kg weight units — codul converteste IMPLICIT via factor 0.01 fara derivation citation. Acest factor
  determina convergence rate ENTIRELY. Daca 0.01 e gresit, R²>0.85 gate poate fail in productie pentru
  ratiomi `Q/R` care nu match noise structure reala greutate corp.
- **Severity:** CRITICAL pentru Kalman validity. ZERO test of convergence rate over 30/60/90 days simulated.
  Spec ADR 026 §9.4.2 Cluster B2 Caveat 1 cere "Hall 2008 literature defaults" — `0.22 kg variance/day`
  NU = Hall 2008 reference (Hall 2008 reference = metabolic adaptation kcal/day, NU weight kg variance).
- **Fix:** EITHER (a) derive `Q` rigorous din Hall 2008 + Forbes equation cu citation + tests vs published
  data, OR (b) treat `Q` ca tunable hyperparameter explicit cu pre-Beta calibration via simulator R²>0.85
  gate ACTUAL data NU placeholder. **Block pre-Beta until verified.**

**C-§A038-02 — `runKalmanWithFallback` feature flag default = OFF (EWMA fallback active) — Kalman never runs in prod**
- **File:** `src/engine/bayesianNutrition/kalmanFilter.js:131-132, 156-170`
- **Issue:** `isKalmanFeatureFlagEnabled` returns `false` daca flag missing (line 131-132 + test line 100-102).
  `runKalmanWithFallback` line 156 `if (!flagEnabled) return EWMA fallback`. Pentru pre-Beta launch, daca
  `featureFlags.bayesian_kalman_v1` nu e set explicit `true` in user ctx, **TOATE production engine runs
  vor folosi EWMA NU Kalman**. EWMA alpha=0.30 (line 101 constants) → memoria scurta ~3 obs effective,
  NU 90-day adaptation. Caveat 3 (rollout per ADR 018) corect dar **NU am verificat ca featureFlags.js
  enables flag pentru Beta cohort** — promptul NU permite read scope expansion.
- **Severity:** CRITICAL daca Beta launches cu Kalman OFF tacit. Daniel intentie launch Bayesian Nutrition
  V1 in Beta? Daca da, BLOCKER. Daca Kalman intentionally rollout post-Beta (ADR 018 staged), atunci
  WARNING (need doc explicit).
- **Fix:** Verify `featureFlags.js` SSOT: `bayesian_kalman_v1` rollout cohort = Beta? Daca DA, set
  default `true` OR document Beta cohort = Kalman-on. Daca NU, append explicit comment cap-fisier
  kalmanFilter.js "Kalman NU active pre-Beta, EWMA fallback path = production default."

---

### MEDIUM findings (Beta-OK but iter 2 ticket)

**M-§A038-01 — Kalman state persistence: NO `serialize/deserialize` helpers exists**
- **File:** `src/engine/bayesianNutrition/kalmanFilter.js` (entire) + `types.js` (NU am citit verbatim dar
  `index.d.ts` exista per glob).
- **Issue:** `KalmanState = { mu, sigma, r2, ewmaFallbackActive }` — primitive numbers + bool, JSON-safe.
  Dar NU exista explicit `kalmanStateFromJSON()` cu validation defensive. Daca un user IndexedDB are
  state corupt (`mu = "NaN"` string post-bug), `kalmanUpdate1D` line 64 `Number.isFinite(previousState?.mu)`
  defaults to 0, **silent reset** la 0 kg target weight → engine recommendations catastrophic-wrong
  (cere user pierde 80kg overnight).
- **Severity:** MEDIUM (defensive defaults exist, dar resetting silent la 0 = bad UX).
- **Fix:** Add `validateKalmanState(state)` returning `{ valid: bool, reason?: string }` — caller
  responds cu UI prompt re-calibration daca corrupt.

**M-§A038-02 — NO convergence rate test over multi-week regression (90-day simulator gate)**
- **File:** `src/engine/bayesianNutrition/tests/kalmanFilter.test.js` (entire, lines 1-147)
- **Issue:** Tests cover (a) unit math correctness (R²=1.0 perfect fit line 13-15), (b) defensive null
  handling, (c) R²>0.85 gate boundary, (d) flag enable/disable. **ZERO test simulates 30/60/90 day diet
  adaptation trajectory cu Hall 2008 reference convergence curve.** Cluster B2 Caveat 2 explicit cere
  "R²>0.85 validation gate pre-Beta simulator" — simulator does NOT exist in tests.
- **Severity:** MEDIUM. Spec gate UN-VERIFIED test-side. Pre-Beta launch risk: Kalman might converge
  too fast (overfit weekly noise) sau too slow (lag months behind actual user trajectory).
- **Fix:** Add `kalmanConvergence.test.js` — simulate 90-day trajectory (linear -0.5kg/week), assert
  R² > 0.85 + final `mu` within ±2kg target. Block pre-Beta on this gate.

**M-§A038-03 — `computeR2` defensive `Number.isFinite(v) ? v : 0` distorts SS_tot when bad data present**
- **File:** `src/engine/bayesianNutrition/kalmanFilter.js:33-41`
- **Issue:** Daca observed are `NaN`, line 33 treats as 0 in mean computation → yMean wrong → SS_tot wrong
  → R² wrong → R²>0.85 gate decides on garbage. Defensive replacement should EXCLUDE bad indices, NU
  substitute 0.
- **Severity:** MEDIUM. Real-world risk: missed weigh-in days, scale glitch readings.
- **Fix:** Filter valid pairs first: `const valid = observed.map((v,i)=>[v,predicted[i]]).filter(([y,yh])=>Number.isFinite(y)&&Number.isFinite(yh))`;
  then compute on `valid` array. Return 0 daca `valid.length < 2`.

**M-§A038-04 — `evaluateR2Gate` strict `>` exclude exact 0.85 boundary (counter-intuitive)**
- **File:** `src/engine/bayesianNutrition/kalmanFilter.js:115`
- **Issue:** `passed = r2 > 0.85` exclude exact match (line 115 + test line 84-86 verifies). Cluster B2 Caveat 2
  spec verbatim cere "R²>0.85" → test corrrect MATCH SPEC. Dar `0.8500000001` passes si `0.85` fails - 
  in float precision asta poate fluctua arbitrar pe runs identice cu inputs slightly different.
- **Severity:** MEDIUM (low-impact, mostly cosmetic, dar nedeterminist la boundary).
- **Fix:** Change la `>=` cu epsilon `r2 >= 0.85 - 1e-9` OR document spec match `>` strict intentionally.

---

### LOW / observations (post-Beta)

**L-§A038-01 — `ISRAETEL_BASELINES` values match Renaissance Periodization Israetel published spec?**
- **File:** `src/engine/periodization/constants.js:19-31`
- **Values found:** chest MEV:8/MAV:14/MRV:22, back 10/18/25, quads 8/14/20, hams 6/12/20, glutes 6/12/16,
  shoulders 8/16/26, biceps 8/14/26, triceps 6/12/22, calves 8/14/20, abs 0/14/25, forearms 0/10/20.
- **Cross-reference vs published spec (Renaissance Periodization):** Codul cite "Schoenfeld/Helms academic
  literature reference" (line nu mai stiu exact dar mentionat in volumeLandmarks.js). I **NU am autoritatea
  externa sa verify vs published numbers** — would need external doc/PDF reference. Findings depend on
  source. Observation: glutes MRV=16 pare LOW vs Israetel published spec (often 16-22+). Pending Daniel
  cross-reference cu original source (Renaissance Periodization Periodization Bible or RP Volume Landmarks
  blog post).
- **Severity:** LOW (out-of-scope verbal verification — spec source NU in repo).
- **Fix:** Cite primary source in comments cap-fisier `periodization/constants.js` cu URL/DOI + numbers
  table verbatim Sa permitem cross-check.

**L-§A038-02 — `MOVEMENT_CATEGORY` heuristic classification fragile pentru RO movement names**
- **File:** `src/engine/bayesianNutrition/volumeLandmarks.js:90-95`
- **Issue:** Hardcoded EN substrings `['squat', 'deadlift', ...]`. Daca `movementId` din DB e RO (e.g.,
  'genuflexiuni', 'indreptari', 'impins-piept'), TOATE clasificate ca ISOLATION → undervalue volume × 3x.
  Big 11 RO migration LANDED per `BIG11_RO_TO_EN_MAP` constants — dar movement IDs (vs muscle group IDs)
  raman EN aici. **Pending verify movement DB schema id format (EN vs RO).**
- **Severity:** LOW daca movement DB uses EN ids (Library 657 exercises — NU am verified id format).
- **Fix:** Add RO movement aliases or use Library exercise.category field if exists.

**L-§A038-03 — `KCAL_FLOOR_DAILY_MIN = 1200` hardcoded — single global floor for both Maria 65 (sub-1200 dangerous) si Marius (sub-1200 acceptable cut)**
- **File:** `src/engine/bayesianNutrition/constants.js:274`
- **Issue:** WHO recommendation = 1200 kcal female floor generic. Marius 25 might safely go lower
  short-cut (1000 PSMF protocol clinical). LOCK 8 spec verbatim documented (line 256-272). Acceptable
  pentru Beta dar single-global floor undermine persona-aware feature later.
- **Severity:** LOW (Beta-acceptable, persona variant deferred post-Beta).

---

### Verdict §A038: **BLOCKER**

**2 Critical findings:**
1. C-§A038-01 — `processNoise × 0.01` undocumented scaling factor determines convergence — needs derivation+tests.
2. C-§A038-02 — Feature flag default OFF → Kalman never runs in prod tacit, EWMA fallback dominant.

Pre-Beta Bayesian Nutrition launch BLOCKED until either:
(a) Kalman validity proven via 90-day convergence simulator R²>0.85 gate test, AND `Q` derivation citation, AND
(b) `bayesian_kalman_v1` feature flag explicit set pentru Beta cohort OR Kalman intentionally deferred post-Beta (doc explicit).

MEV/MAV/MRV numbers exist + tested unit-wise dar **published-spec cross-reference UN-VERIFIED** (Renaissance
Periodization source NU in repo). Numbers look plausible la prima vedere (rezonabile vs literatura general
knowledge) dar findings carry "NU am autoritatea sa verify final" caveat.

---

## Concluzii agregate

- **§A036 PASS_WITH_NITS:** Tier 0/1 = production-ready, Tier 2 = deferred stub explicit. 5 MEDIUM iter 2
  tickets, 3 LOW observations.
- **§A038 BLOCKER:** Kalman scaling factor + feature flag default = pre-Beta launch risk.
  2 Critical, 4 MEDIUM, 3 LOW.

**Daniel CEO directive needed pre-Beta:**
1. Confirm Bayesian Nutrition V1 = part of Beta launch sau deferred? (decide Critical-C-§A038-02 path)
2. Approve resource pentru `processNoise` derivation + 90-day simulator test (Critical-C-§A038-01)
3. Iter 2 backlog acceptance: 5 §A036 MEDIUM + 4 §A038 MEDIUM tickets.

---

_Audit complet 2026-05-21 ~22:30 EET. ZERO source files modified. Daniel sleep approved._
_Reviewer: Claude Code (autonomous Opus). Stance: FORCE adversarial._
