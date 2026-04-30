# SPRINT 1 EXECUTION REPORT

**Date:** 2026-04-29 / 2026-04-30 (autonomous run)
**Model:** Opus 4.7 autonomous
**Status:** ✅ COMPLETE
**HEAD start:** `8b9c71a10d6669b90a2146ff6509d35114749b50`
**HEAD final:** `bca9835` (post Acțiunea 4) — final report commit added below

## TL;DR

Sprint 1 livrat 5 acțiuni complete în autonomous run Opus 4.7. **4 commits docs + 1 ADR amendment new file** + report final. Tests baseline 752/752 PASS preservat post-modificări (pre-commit hook automatic).

**Highlights:**
- ✅ Firebase EU verified (`europe-west1`, project `fittracker-c34e8`) — GDPR data residency confirmed pre-launch.
- ✅ ADR 009 amendment SSOT — 2 axe ortogonale (`engine_tier` × `calibration_confidence`) cu mapping matricea + forward-compatibility N axes.
- ✅ PRODUCT_STRATEGY §3.5 + §3.8 amendments — Nutrition + Sleep inference IN_SCOPE (Bayesian motor pasiv) vs logging OUT_OF_SCOPE clarification.
- ✅ ADR 011 amendment LWW deprecated → T&B mandatory + retention 90 zile.
- ✅ ADR 013 amendment force-typing eliminat permanent + rationale formal (anti-paternalism + anti-RE + UX).
- ✅ Status updates ADR 018 (clusterTrace Sprint 3) + PRODUCT_STRATEGY Open Item #7 (Pro pause retention 90 zile).
- ✅ Anti-RE banner sweep: **8 leaks identificate** (6 percentage + 2 numerical, 0 signal name leaks). Inventar complet livrat. NU rewrite active wording — Daniel decide live Sprint 1.5.

**Issues found (push-back genuine — flag-uri NU actions):**
1. **DEVELOPING tier discrepancy** — handover SSOT 6 nivele (cu DEVELOPING) vs ADR 009 active code 5 nivele (fără DEVELOPING). Documentat în amendment + Decision needed Sprint 2.
2. **UI heavy coupling cu engine imports** — `renderIdle.js` importă direct 6+ engine modules (coachDirector, aa, dp, sys, fatigue, readiness). Strangler migration ADR 018 Faza 0/1 va reduce coupling. NU acțiune Sprint 1.

**Decisions needed Daniel review** (rezumat — detalii §DECISIONS_NEEDED):
- DEVELOPING tier add (Option A) vs revise SSOT la 5 nivele (Option B)
- Adherence score numeric exposure: drop la rewrite vs modify engine output API
- Anti-RE rewrite wording final UX (sesiune Sprint 1.5 chat strategic Daniel)
- Test rewrite plan post anti-RE wording change (renderIdle.test.js will break)

Sprint 1 = **docs SSOT lock-up complet pentru launch**. Sprint 2 follow-up: backfill diff script + Golden Master scaffold + GDPR k-anonymity validation tool.

## STEP 0: Environment setup
- CWD: `C:/Users/Daniel/Documents/salafull` ✅
- Branch: `main` ✅
- Working tree: clean ✅
- Git pull: success (already up to date) ✅
- npm install: not needed (`node_modules/` already populated) ✅
- Tests baseline (vitest): **48 files / 752 tests PASS** ✅
- Tests scope: vitest unit/integration. Playwright E2E NU rulat (Sprint 1 = docs-only, irelevant + cost startup browsers).

## ACȚIUNEA 1: Firebase EU region verification

**Status:** ✅ **EU VERIFIED — GDPR data residency compliant**

**Region:** `europe-west1` (Firebase Realtime Database)
**Project ID:** `fittracker-c34e8`
**Database URL:** `https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app`

**Files checked:**
- `src/firebase.js:6` — hardcoded URL with `europe-west1` regional instance ✅
- `02-audit/FIREBASE_AUDIT_1_8.md:16` — confirmed in audit doc ✅
- `02-audit/HARDCODED_AUDIT_1_2.md:83` — confirmed in audit doc ✅

**Notes:**
- `firebase.json` și `.firebaserc` **NU există** în repo — proiectul folosește Firebase REST API direct (per ADR 002 — `firebase-rest-not-sdk`), NU Firebase CLI/SDK config files. Acesta e by-design, NU lipsă de config.
- URL hardcoded conține explicit segmentul `europe-west1` în formatul `*-default-rtdb.europe-west1.firebasedatabase.app` — Firebase RTDB regional instance, NU `*.firebaseio.com` (which ar fi default us-central1).
- Project deja creat și operational (nu doar planificat). Region lock-in deja confirmat ✅.

**Recommendation:** **NO ACTION NEEDED.** Pre-launch GDPR data residency requirement deja satisfied. Risk de migration eliminat. Document explicit în handover ca "verified ✅" pentru viitoare audit-uri.

**Sub-finding minor:** photo storage intentional EXCLUDED din Firebase sync (RTDB free tier limit) — `src/firebase.js:8-9`. Photos local-only. Acesta e separat scope (data privacy local vs cloud), NU GDPR residency issue. Cross-ref `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` pentru document explicit user disclosure dacă nu e deja.

## ACȚIUNEA 2: Tier rename SSOT amendment

**Status:** ✅ COMPLETE

**ADR amendment created:** `03-decisions/ADR_009_AMENDMENT_TIER_SYSTEM_SSOT.md`

**Files modified:**
- `03-decisions/ADR_009_AMENDMENT_TIER_SYSTEM_SSOT.md` (new, ~190 lines)
- `03-decisions/009-calibration-tiers.md` (header — Status block update + amendment cross-ref)
- `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` (header — SSOT nomenclature note + cross-ref)
- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` (header — cross-ref)
- `03-decisions/DECISION_LOG.md` (new entry 2026-04-30)

**Commits:** `35712af` — `docs: ADR 009 amendment — tier system SSOT (engine_tier + calibration_confidence ortogonale)`

**Tests:** 48 files / 752 PASS (pre-commit hook automatic)

**Issues found (push-back genuine):**

🚨 **DEVELOPING tier discrepancy detected.** Handover SSOT (chat strategic 2026-04-29) listează 6 nivele `calibration_confidence`:
`COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED`

Codul actual + ADR 009 implementează **5 nivele** (lipsește DEVELOPING):
`COLD_START (0) → INITIAL (1) → PERSONALIZING (2) → PERSONALIZED (3) → OPTIMIZED (4)`

Verified prin Read direct ADR 009 + grep peste codebase.

**NU am acționat pe asta.** Per instrucțiuni Sprint 1 ("NU schimba decizii lock-uite în handover — flag în report"), am scris amendment cu 6 nivele (handover SSOT), dar am documentat clear discrepanța în Migration Plan §Sprint 2 cu 2 opțiuni (add DEVELOPING vs revise SSOT la 5).

**Decizia rămâne pentru Daniel Sprint 2.** Vezi §"DECISIONS NEEDED" mai jos.

## ACȚIUNEA 3: PRODUCT_STRATEGY amendment Nutrition/Sleep

**Status:** ✅ COMPLETE

**Files modified:**
- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §3.5 + §3.8 (rewritten with explicit logging-vs-inference distinction)

**Changes:**

§3.5 — **BEFORE:** "Nutrition logging OUT_OF_SCOPE_v1.0" (single line). **AFTER:** explicit logging vs inference split + 5-layer Bayesian pattern documented (Layer 1 prior, Layer 4 indirect signals, ZERO user input). Cross-ref HANDOVER §2 + Sprint 4 spec.

§3.8 — **BEFORE:** "Manual input la check-in start ('Cum ai dormit? 1-5'). Apple Health = v1.x". **AFTER:** Manual input rescinded explicit (redundant cu readiness emoji), sleep inference IN_SCOPE prin REALTIME emoji + post-RPE proxy, Apple Health DEFERRED v1.x.

**Open Items §"Open Items":** verified existing list — NU avea entry explicit Bayesian/Sleep. Conflict-ul era între §3.5/§3.8 wording vs HANDOVER §2/§1, NU în Open Items list. Item #7 (Pro pause data freezing) rămâne pentru Acțiunea 4.6.

**Commits:** `71a8bcd` — `docs: PRODUCT_STRATEGY amendment — Nutrition/Sleep inference IN_SCOPE clarification (logging stays OUT_OF_SCOPE)`

**Tests:** 752/752 PASS (pre-commit hook)

**Issues found:** none. Decision lock-up clear, amendment direct.

**Decisions needed:** none. Engine implementation deferred Sprint 4 per lock-up.

## ACȚIUNEA 4: Documentation SSOT — 6 conflicts resolution

**Status:** ✅ COMPLETE (4 commits separate, 2 cross-ref Acțiunile 2 + 3)

### 4.1 ADR 011 LWW vs Cognitive Arch §Q9 (T&B) — COMPLETE

**File modified:** `03-decisions/011-coach-decision-log-architecture.md`

**BEFORE (line 245-246):** "Append-only semantics + immutable outcome + monotonic superseded transition make last-write-wins acceptable for sync conflicts."

**AFTER:** Marker explicit "⚠️ AMENDMENT 2026-04-30 — LWW deprecated, T&B mandatory pre-launch" + retention 90 zile rationale + T&B implementation requirements + migration path Sprint 3 task + Reconsideration Trigger #9 added.

**Commit:** `21d8ce3` — `docs: ADR 011 amendment — LWW deprecated, T&B mandatory pre-launch + 90 zile retention`

### 4.2 Tier mismatch 3 vs 6 — REZOLVAT în Acțiunea 2

Cross-ref ADR 009 amendment file (commit `35712af`).

### 4.3 PRODUCT_STRATEGY vs HANDOVER Bayesian Nutrition — REZOLVAT în Acțiunea 3

Cross-ref §3.5 + §3.8 amendments (commit `71a8bcd`).

### 4.4 ADR 013 force-typing — COMPLETE

**File modified:** `03-decisions/013-auto-aggression-detection.md`

**BEFORE (§6 Intervention C HIGH tier):** "Type 'continui pe propria răspundere' (sau echivalent) + Confirm explicit"

**AFTER:** Marker "AMENDED 2026-04-30" + force-typing eliminat permanent + 4-point rationale (anti-paternalism + anti-RE + UX hostility + intervention strength preserved alt mecanisme) + §Resolved Open Questions #3 wording template natural.

**Commit:** `7d0c752` — `docs: ADR 013 amendment — force-typing eliminated permanent (anti-paternalism + anti-RE)`

### 4.5 + 4.6 Status updates consolidate — COMPLETE

**Files modified:**
- `03-decisions/018-engine-extensibility-architecture.md` — Faza 0 amendment clusterTrace adapter pending Sprint 3 strangler integration (Q-0080 clarification)
- `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` Open Items #7 — Pro pause data freezing RESOLVED cu retention 90 zile aliniat ADR 011 amendment

**Commit:** `bca9835` — `docs: status updates — clusterTrace adapter (Sprint 3) + Pro pause retention (90 zile aligned)`

**Total Acțiunea 4:** 3 new commits + 2 cross-refs = 6 conflicts resolved.

## ACȚIUNEA 5: Anti-RE banner sweep

**Status:** ✅ COMPLETE (inventar livrat, NU rewrite — Daniel decide live wording final Sprint 1.5)

**Scope swept:** `src/pages/`, `src/components/`, `src/styles/` (per scope lock — NU `src/engine/`)

### Categoria 1 — Signal name leaks

**Total:** **0 leaks** în UI scope.

`volume_creep`, `frustration`, `recovery_debt`, `ignore_recovery`, `calorie_acceleration` — toate apar exclusiv în:
- `src/engine/` (excluded scope, rămâne unchanged per ADR 018 contract)
- Test files (`__tests__/*.test.js` — NU user-facing)

✅ Engine signal names NU leak-ează în prezentare.

### Categoria 2 — Percentage display leaks

**Total:** **6 leaks** în UI active.

| # | File | Line | Current text (BEFORE) | Engine import? | Proposed replacement template |
|---|------|------|------------------------|------|------------------------------|
| 1 | `src/pages/coach/renderIdle.js` | 17 | `📊 Adherence scăzută ultimele 30 zile: ${p.adherenceRate}%. Reducem volum și verificăm contextul.` | DA (engine ctx.patterns) | `"📊 Coach-ul observă pattern adherence ⚠ scăzută. Reducem volum + verificăm contextul."` (categorical ✓/OK/⚠) |
| 2 | `src/pages/coach/renderIdle.js` | 18 | `📊 Deviation crescut: ${p.deviationRate}% sesiuni diferite de propunere. Coach-ul ajustează propunerile.` | DA (engine) | `"📊 Coach-ul observă deviații frecvente. Ajustăm propunerile."` |
| 3 | `src/pages/coach/renderIdle.js` | 19 | `📊 ${p.earlyEndRate}% sesiuni terminate devreme — program scurtat 20%` | DA (engine) | `"📊 Pattern: sesiuni terminate devreme — program scurtat."` (drop both percentage values) |
| 4 | `src/pages/coach/renderIdle.js` | 284 | `Readiness ${readinessScore}/100${verdict.volumeMultiplier < 1 ? ` · volum ${Math.round(verdict.volumeMultiplier*100)}%` : ''}` | DA (`getReadinessVerdict` din engine/readiness.js) | `"${verdict.label} · volum ajustat"` (drop /100 + drop multiplier %) |
| 5 | `src/pages/coach/aaFrictionModal.js` | 134 | `Coach-ul observă oboseală acumulată. Plan redus 30% astăzi pentru recovery.` | NU import direct (session prop only) | `"Coach-ul observă oboseală. Plan redus pentru recovery."` (drop "30%") |
| 6 | `src/pages/dashboard.js` | 545 | `tt:`DELOAD – RPE ${avgRPE.toFixed(1)}`,s:'Reduce volum 40% săptămâna asta'` | NU direct (logs aggregated local) | `"tt: 'DELOAD recomandat', s: 'Reduce volum săptămâna asta'"` (drop RPE numeric + 40%) |

### Categoria 3 — Numerical metric leaks

**Total:** **2 leaks** în UI active.

| # | File | Line | Current text (BEFORE) | Engine import? | Proposed replacement template |
|---|------|------|------------------------|------|------------------------------|
| 7 | `src/pages/coach/renderIdle.js` | 20 | `📊 ${p.exercises?.length || 0} exerciții stagnate 3+ săptămâni` | DA (engine) | `"📊 Pattern stagnare detectat — verificăm exercițiile."` (drop count) |
| 8 | `src/pages/dashboard.js` | 426 | `<div ...>${a.score}%</div> ... ${a.label}` (Adherence azi badge) | DA (`getAdherenceScore` din engine/adherence.js) | `"Adherence: ${a.label}"` (drop numeric, keep categorical only — `a.label` already categorical) |

### Categoria 4 — Engine-imports din UI (DECISIONS_NEEDED)

UI files care importează direct din `src/engine/`:

- `src/pages/coach/renderIdle.js` — imports `coachDirector`, `aa`, `dp`, `sys`, `fatigue`, `readiness`. **Heavy coupling.** Per ADR 018 strangler migration (Faza 0/1 Sprint 2-3), aceste imports vor fi reduse la `coachDirector` único cu output VoiceVerdict structured. Rewrite Sprint 1.5 trebuie să preserve imports existing — NU schimba în Sprint 1.5.
- `src/pages/dashboard.js` — imports `getAdherenceScore` from `engine/adherence.js`. Adherence score returns numeric — output engine ar trebui să returneze + categorical label (deja există `a.label`). **Decision Daniel:** la rewrite Sprint 1.5 dropăm `${a.score}%` și folosim doar `${a.label}`? Sau modificăm engine să nu mai expună `score` pentru UI consumption?

### Dead code elimination

**Total:** 0 dead-code commits.

Verified — toate template-urile găsite sunt active (referențiate din `formatPatternMessage()` + `renderCoachIdle()` + `renderAdherenceScore()` + alerts builder). Niciun banner unreachable / comentat / unused.

### Estimate effort rewrite Sprint 1.5

**Wording rewrites:** ~6-8 strings în 3 files.
- `renderIdle.js` PATTERN_BANNER_STRINGS object (4 templates) + line 284 readiness display = ~30 min editing
- `aaFrictionModal.js` line 134 paragraph = ~5 min
- `dashboard.js` line 545 (volume reduction alert) + line 426 (adherence score) = ~15 min

**Test impact:** `src/pages/coach/__tests__/renderIdle.test.js` (lines 116-135) testează formatPatternMessage output cu signal data inclusă. Tests **vor break** la rewrite. **Decision needed Sprint 1.5:** update tests pentru a verifica categorical strings (nu numeric values).

**Total estimate:** ~1h editing + ~1h tests update + ~30 min QA = **~2-3h Daniel chat strategic Sprint 1.5.**

### Cross-cutting decision (Daniel review)

Per anti-RE strategy lock-up: **categorical universal** ("✓ Excelent / OK / ⚠ Slab") pentru TOȚI users, NO Pro tier hybrid numeric exception. Asta înseamnă că Sprint 1.5 rewrite trebuie să dropeze **toate** valorile numerice din leak-urile listed mai sus, NU doar pentru Free tier.

**Alternativă considerată (RESPINSĂ în lock-up):** Pro tier exception cu numeric metrics. Justificare respingere lock-up: tech-lifter target audience = vector RE primar, Pro tier expune engine internals exact către populația cu cel mai mare risk RE.

**Recommendation Co-CTO:** procedez cu rewrite categorical universal Sprint 1.5 sub direcția Daniel. NU acționez Sprint 1 — Daniel decide wording final live (UX-critical, NU implementation detail).

## ISSUES FOUND (push-back genuine — flag-uri NU actions)

### Issue 1: DEVELOPING tier discrepancy între handover SSOT și ADR 009 code

**Discrepancy:** Handover prompt 2026-04-29 lock decision #2 listează 6 nivele `calibration_confidence`:
`COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED`

ADR 009 active code implementează **5 nivele** (fără DEVELOPING):
`COLD_START (0) → INITIAL (1) → PERSONALIZING (2) → PERSONALIZED (3) → OPTIMIZED (4)`

**Verificare:** read direct ADR 009 lines 24-30 (tabel tier) + grep peste codebase pe `DEVELOPING` literal — **niciun match în code**.

**Action taken:** scris amendment cu 6 nivele (handover SSOT preserve) + flag explicit `Sprint 2 decision needed (Option A: add DEVELOPING in code; Option B: revise SSOT la 5 nivele)`. NU am acționat în code.

### Issue 2: UI imports engine direct — high coupling

`renderIdle.js` importă direct: `coachDirector`, `aa`, `dp`, `sys`, `fatigue`, `readiness`. ADR 018 Faza 1 strangler migration intends să reducă la doar `coachDirector` cu VoiceVerdict output. Fără migration, anti-RE rewrite (Sprint 1.5) preserve imports existing.

**Action taken:** flagged în Acțiunea 5 §"Categoria 4 — Engine-imports din UI". NU acționez.

### Issue 3: Tests vor break la anti-RE rewrite Sprint 1.5

`src/pages/coach/__tests__/renderIdle.test.js` lines 116-135 testează `formatPatternMessage` cu numeric data inclusă (e.g., `expect(msg).toContain('35%')`). La rewrite categorical, aceste tests vor break.

**Action taken:** flagged în Acțiunea 5 §"Estimate effort rewrite Sprint 1.5". Tests rewrite = parte din effort estimate ~1h în Sprint 1.5.

## DECISIONS NEEDED (Daniel review)

### D1: DEVELOPING tier — add or remove?

- **Option A (handover SSOT preserve):** Add DEVELOPING tier între INITIAL și PERSONALIZING. Boundaries propose: 14–60 zile / 6–24 sesiuni. Effort: ~8-12h cod + tests update + schema versioning bump v_X→v_Y. Justifiable doar dacă DEVELOPING are utility distinct (ex: AA detection thresholds diferite).
- **Option B (YAGNI / revise SSOT la 5):** Drop DEVELOPING from amendment, revise to 5 nivele matching active code. Effort 0h. Justificare: existing system funcționează, DEVELOPING mai mult conceptual decât practic util.

**Co-CTO recommendation:** Option B pentru launch v1 (YAGNI). Adăugare ulterioară fără cost dacă apare utility real.

### D2: Anti-RE rewrite wording final (Sprint 1.5 chat strategic Daniel)

Templates suggerate în Acțiunea 5 sunt **propose-uri**, NU final. Wording UX-critical → Daniel decide live cu iteration design.

### D3: Adherence score API — drop numeric exposure vs modify engine?

`getAdherenceScore()` returnează `{score, label, color}`. Anti-RE rewrite poate:
- **Option A:** UI dropează `${a.score}%` și folosește doar `${a.label}` (engine API unchanged)
- **Option B:** Engine API modificat să nu mai expună `score` numeric (forțează callers la categorical)

**Co-CTO recommendation:** Option A (less invasive, NU break existing engine consumers — alte modules consumă score numeric pentru calculations interne).

### D4: Test rewrite scope post anti-RE

`renderIdle.test.js` lines 116-135 + posibil aaFrictionModal.test.js — verify ce tests assert numeric strings.

**Co-CTO recommendation:** la rewrite Sprint 1.5, update tests în same commit ca rewrite — keep atomic.

### D5: Volume multiplier display Readiness card

`renderIdle.js:284` afișează `Readiness ${readinessScore}/100... volum ${Math.round(verdict.volumeMultiplier*100)}%`. Asta e **dual exposure** — readiness numeric + volume multiplier numeric.

**Co-CTO recommendation:** la rewrite, înlocuiește cu doar `${verdict.label}` (deja categorical: ⚡ Ușoară / 👍 Normal / 💀 Grea per logic line 82-83). Drop `/100` + drop `volum X%`. User vede doar verdict categorical.

## TESTS STATUS

- Baseline pre-Sprint-1: **752/752 PASS** (vitest, pre-commit hook automated)
- Post-Sprint-1 (post commit `bca9835`): **752/752 PASS** ✅ (no regression introduced — verified pe fiecare commit prin pre-commit hook)
- Playwright E2E NU rulat (Sprint 1 = docs only, irelevant + cost startup browsers)
- Coverage delta: 0 (no code changes, only docs)

## COMMITS SUMMARY

```
35712af  docs: ADR 009 amendment — tier system SSOT (Acțiunea 2)
71a8bcd  docs: PRODUCT_STRATEGY amendment — Nutrition/Sleep inference (Acțiunea 3)
21d8ce3  docs: ADR 011 amendment — LWW deprecated, T&B mandatory + 90 zile (Acțiunea 4.1)
7d0c752  docs: ADR 013 amendment — force-typing eliminated permanent (Acțiunea 4.4)
bca9835  docs: status updates — clusterTrace adapter + Pro pause retention (Acțiunea 4.5+4.6)
```

**Total:** 5 commits Sprint 1 + 1 final report commit (pending below).

**Push status:** toate 5 commits pushed la `origin/main` ✅ verified.

## TIMELINE APPROXIMATE (based on git timestamps)

- STEP 0 (env setup + tests baseline): ~5 min
- Acțiunea 1 (Firebase EU verification): ~10 min
- Acțiunea 2 (ADR 009 amendment): ~30 min (handover read + ADR write + cross-refs)
- Acțiunea 3 (PRODUCT_STRATEGY Nutrition/Sleep): ~15 min
- Acțiunea 4.1 (ADR 011 LWW→T&B): ~10 min
- Acțiunea 4.4 (ADR 013 force-typing): ~10 min
- Acțiunea 4.5+4.6 (status updates): ~5 min
- Acțiunea 5 (Anti-RE banner sweep): ~25 min (sweep + inventar + report write)
- Sprint 1 finalize + report write: ~15 min
- **Total:** ~2h 5min

Sub bucket budget. Continuă Sprint 2 fără cost cap risk.

## SPRINT 2 PREVIEW

Sprint 2 = **validation infrastructure** (3 acțiuni):

- **Acțiunea 6:** Backfill diff script standalone — automated 100% diff + 20 control samples
- **Acțiunea 7:** Golden Master Suite scaffold + 30 generated profiles + Stryker mutation config
- **Acțiunea 8:** GDPR k-anonymity validation tool + ADR amendment k=5 minim + quasi-identifiers spec

Sprint 2 va livra **tool-uri standalone**, NU integration cu engine. Backfill validation real va rula când sunt date Daniel reale (post first 80+ sessions logate). Golden Master expansion la 250 profiles incremental Sprint 3+.

Sprint 3 partial CONDITIONAL — multi-tenant auth migration spec + T&B implementation design spec — DACĂ apuc bucket. Rămân doar design docs, NU implementation.
