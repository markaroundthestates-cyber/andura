# FINDINGS MASTER TRACKER

**See also:** [[INDEX_MASTER]] | [[DECISION_LOG]] | [[HANDOVER_GLOBAL_2026-04-30_evening]]

**Ultima actualizare:** 2 mai 2026 (post Sprint 4.x Batch B Auth Migration + Memory Paradox hotfix + Foundation 1/2/4 + SafetyBanner wiring)
**Total findings:** 135 unice (+5 din Sprint 4.x Batch A audit 2026-05-02)
**Surse istorice (consolidate, accesibile prin git history):** AUDIT_GENERAL_23APR (83) + AUDIT_COACH_JS_24APR (42) + QA live 24 apr seară (3 noi) + QA_MANUAL_25APR_POSTFIX (2 noi) + OPUS_NUCLEAR_AUDIT_25APR (7 arhitecturale) + E2E pre-existing scan 27 apr (2 noi). Source files removed in vault cleanup 2026-04-30 (info catalogată aici + DECISION_LOG; recuperare prin `git log --all --full-history -- "02-audit/<file>"`).

---

## LEGEND

| Simbol | Semnificație |
|--------|-------------|
| 🔴 OPEN | Bug confirmat, nerezolvat |
| 🟢 FIXED | Rezolvat + test |
| 🟡 DEFERRED | Acceptat ca risc sau amânat |
| ⚪ WONTFIX | Respins deliberat |
| 🔵 IN_PROGRESS | Lucru în curs |

**Suffix ID:** `g` = din audit general 23 apr · `c` = din audit coach.js 24 apr · `e` = E2E test desync · fără sufix = FAZA 1 sub-task

---

## CRITICAL (16 total)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| C1g | Calibration COLD_START forever — `ctx.allLogs` deriva din 3 sesiuni în loc de full history | 🟢 FIXED | FAZA 1.5 |
| C2g | Firebase 500 logs limit → data loss silent după ~7 săptămâni | 🟢 FIXED | FAZA 1.8 (500→5000) |
| C3g | `restoreFromBackup` window binding overwritten — naming collision | 🟢 FIXED | FAZA 1.4 |
| C4g | `tierStorage.js` DEAD CODE — arhitectura declarată nu există în runtime | 🟡 DEFERRED | FAZA 4 |
| C5g | `_recommendRaw` scrie DB ca side-effect — re-entrancy unsafe | 🟡 DEFERRED | FAZA 3 |
| C6g | `init()` neawait-uit la nivel modul — erorile devin UnhandledPromiseRejection | 🟡 DEFERRED | FAZA 3 |
| C7g | `cleanDuplicateLogs` key colizionează când `set` lipsește — loguri legitime comasate | 🟢 FIXED | FAZA 1.4 |
| C8g | Sentry `beforeSend` filtrează erorile Firebase — opacity totală pe eșecuri critice | 🟡 DEFERRED | FAZA 3 observability |
| C9g | `sessionBuilder.js` STUB — null export, toate sesiunile prin fallback intern | 🟢 FIXED | FAZA 2 (OPT C) |
| C1c | `endSession` state machine — draft nu e curățat la `cancelWorkout` | 🟢 FIXED | FAZA 2 (C2c) |
| C2c | `cancelWorkout` nu apelează `clearDraft/teardownInactivity/releaseWakeLock` | 🟢 FIXED | FAZA 2 |
| C3c | `rateSession` double-tap duplică ratings/notes (nu guard inflight) | 🟢 FIXED | FAZA 2 |
| C4c | Log schema incompletă — `kg` și `set` lipseau din `confirmReps` | 🟢 FIXED | FAZA 2 |
| C5c | `endSession` șterge automat sesiunile < 5 min — data loss | 🟢 FIXED | FAZA 2 |
| **C10c** | **Director cache invalidation loop — `[Cache] Director session invalidated` × 12+ per page load (Firebase sync scope)** | 🟢 FIXED | Task #26 (suppressInvalidations + debounce 250ms) |
| **C11c** | **Full Reset declanșează cache cascade 12+ invalidări — `dataCleanup.js:174,279,339,433` direct invalidate() + post-reload sync** | 🟢 FIXED | Task #27 (scheduleInvalidation + __suppressFirebaseSyncUntil) |

---

## HIGH (31+ total — selecție cu ID-uri cunoscute)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| H1g | `DB.set` fără try/catch → QuotaExceededError crash write | 🟡 DEFERRED | FAZA 3 |
| H2g | `syncFromFirebase` fără timeout → app hang pe rețea slabă | 🟡 DEFERRED | FAZA 3 |
| H3g | `Object.assign` conflict resolution — local wins silent, remote changes pierdute | 🟡 DEFERRED | FAZA 3 |
| H4g | `ts` collision ms → Set dedup fals pe logs array merge | 🟡 DEFERRED | FAZA 3 |
| H5g | `coachDirector.buildSession` swallow-ează toate erorile engines | 🟡 DEFERRED | FAZA 3 |
| H6g | `patternLearning.analyzeAndApplyPatterns` race condition pe render concurent | 🟢 FIXED | FAZA 2 (H6c) |
| H10g | `SYNC_KEYS` include `session-draft` — race mid-session multi-device | 🟡 DEFERRED | FAZA 3 |
| H13g | `isoWeek` în `responseProfile.computeFrequencySensitivity` spart la year-boundary | 🟢 FIXED | FAZA 2 |
| H14g | `checkRecoveryGroups` primește muscleState în format greșit | 🟢 FIXED | FAZA 2 |
| H27g | Firebase data loss 500→5000 logs (overlap cu C2g) | 🟢 FIXED | FAZA 1.8 |
| H4c | `completedExercises` resetat la `new Set()` la resume — progress pierdut | 🟢 FIXED | FAZA 2 |
| H6c | `analyzeAndApplyPatterns` fără guard inflight — concurrent calls cumulează | 🟢 FIXED | FAZA 2 |
| H11c | `COACH_RELEVANT_KEYS` 5 keys — cache invalidat incorect pe 6+ write paths | 🟢 FIXED | FAZA 2 |
| H16c | `inactivityTimer` nu se re-armează corect după `skipPause` | 🟢 FIXED | FAZA 2 |
| **H30c** | **Pattern learning false positives pe cold_start — 88-100% skip rate pe date inexistente** | 🟢 **FIXED** | TASK #30.8 + #30.8.1 (CDL-sourced banner — ADR 011) |
| **H31c** | **Full Reset nu curăță `applied-patterns` + dinamice (muscle-extra-*, ex-extra-sets-*, aa-cooldown-*, equipment-occupied-session) — registry gap** | 🟢 FIXED | Task #27 (localStorage.clear() whitelist + dataRegistry.js) |
| **H32c** | **"Rerun onboarding" nu funcționează post Full Reset — `onboarding-done` persistă sau re-populat prin Firebase pull** | 🟢 FIXED | Task #27 (__suppressFirebaseSyncUntil survives reload, suppresses stale Firebase pull) |

---

## MEDIUM (27 total — selecție)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| M1g | `patternLearning` SKIP_DAY presupune calendar-week training | 🟡 DEFERRED | FAZA 4 |
| M2g | `brzycki1RM` null pentru reps > 12 → exclude silent din weaknessDetector | 🟡 DEFERRED | FAZA 3 |
| M3g | `stagnationDetector.isoWeek` year-transition edge case | 🟢 FIXED | FAZA 2 |
| M4g | `Date.now() < new Date('2026-07-20')` hardcoded cutoff | 🟡 DEFERRED | FAZA 3 |
| M5g | `estimateTDEE` fallback 14 days când user are 4 weigh-ins în 90 zile | 🟡 DEFERRED | FAZA 3 |
| M6g | `adminPrefill.js` conține user-data Daniel specific — risc la launch | 🟡 DEFERRED | FAZA 4 launch prep |
| M7g | `checkKcalDeficit` threshold 1800 hardcoded | 🟡 DEFERRED | FAZA 4 |
| M8g | `inject.js:184` DB.set triggerează cleanDuplicateLogs la reload | 🟡 DEFERRED | FAZA 3 |
| M9g | `autoBackup.js` — `photos` nu e backup-at | 🟡 DEFERRED | FAZA 4 |
| M10g | `restoreFromBackup` face `localStorage.clear()` — wipe neselective | 🟡 DEFERRED | FAZA 3 |
| M14c | Onboarding 11 ex × 3 sets cu același `session: Date.now()` → cleanDuplicateLogs comasează | 🟡 DEFERRED | FAZA 3 |
| M15c | `getReadinessScore` clamp 10-100 ascunde valori reale negative | 🟡 DEFERRED | FAZA 3 |
| **MP9** | **`toISOString().slice(0,10)` returnează dată UTC — utilizatorii EU (UTC+3) între 00:00-03:00 local primesc data greșită pe log-uri și CDL** | 🟢 **FIXED** | Task #31 |

---

## LOW (16 total — selecție)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| L1g | `cleanEx` regex nu acoperă diacritice și variante | 🟡 DEFERRED | FAZA 4 |
| L4g | `dateCleanup.restoreRealLogs` hardcoded date (21-22 apr) | 🟡 DEFERRED | FAZA 4 |
| L7g | `initSentry()` fire-and-forget — failure tacit | 🟡 DEFERRED | FAZA 3 observability |
| L8g | Firebase URL hardcodat — risc la project re-deploy | 🟡 DEFERRED | FAZA 4 config |
| L10g | `adminPrefillAll` expus pe `window` — consolă accesibilă la launch | 🟡 DEFERRED | FAZA 4 launch prep |

---

## E2E TEST DESYNC (pre-existing, low priority — flagged 27 apr 2026)

Aceste fail-uri E2E au fost descoperite la rularea locală post TASK #7. Verificat git checkout 1007ffe (commit anterior TASK #7) — fail identic. **Pre-existing, NU regression de la TASK #7 sau alte commits recente sesiunea 27 apr.** Producție GH Pages = HEALTHY (deploy green).

| ID | Test | File:Line | Symptom | Status |
|----|------|-----------|---------|--------|
| **E2E-1e** | "CDL with 5 real entries low adherence shows LOW_ADHERENCE banner" | `tests/e2e/scenarios/calibration-ui.spec.js:193` | Test setează 5 CDL real entries cu adherence scăzută, așteaptă banner "Adherence scăzută". Page actual rendăruiește "OFF – RECUPERARE / DATE INSUFICIENTE" — banner nu apare. CDL setup în test nu trigger-uiește pattern detection în UI. | 🟡 DEFERRED |
| **E2E-2e** | "selectând readiness îl salvează și ascunde selectorul" | `tests/integration.spec.js:97` | Test selectează readiness, așteaptă verdict card cu "Sesiune"/"Readiness"/"🧠". Body actual conține doar "OBIECTIVUL DE AZI / 0 pași". Verdict card nu apare după select. | 🟡 DEFERRED |

**Decizie:** Quality bar bulletproof pe ce construim, NU sweep tot la fiecare commit (Memory #14). Cele 2 fail-uri E2E rămân roșii pe CI dar **NU blochează deploy production** (deploy GH Pages = green pe commit-uri sesiunea 27 apr). Investigare + fix programat pentru sesiune dedicată viitoare cu Opus audit pe E2E suite (memory #23 — audit = exclusiv Opus).

**Reproducere:**
```
cd C:\Users\Daniel\Documents\salafull
npx playwright test tests/e2e/scenarios/calibration-ui.spec.js:193 tests/integration.spec.js:97 --reporter=list
```

**NU sunt cauzate de:**
- TASK #7 (commit d4a167c) — verificat git checkout 1007ffe înainte
- TASK #2 CDL_KEYS migration (52e09f1) — applied-patterns assertion fix-uit separat (commit 8d2dae9)
- AA pipeline LIVE (Sprint A) — fail-uri prezente și înainte

**Ipoteze fix viitor:**
- CDL setup în page.evaluate() poate fi run prea devreme (înainte de sync sau init pattern engine)
- Test environment differs de production prin lipsa unor flag-uri (cold_start logic, calibration tier)
- Possible flaky timing — `waitForTimeout` insuficient

---

## TASK #7 — Friction Modal HIGH Tier (closed 27 apr 2026)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| **T7-1** | **HIGH tier AA detection setează `session.aaBlocked` dar nu există UI care să-l consume — feature invisible la user real** | 🟢 **FIXED** | TASK #7 (commit d4a167c) — friction modal mobile-first, typing data-injected, escalation pattern, state persistence |
| **T7-2** | **ADR 014 §5 typing decision wording static "Am văzut pattern-ul" — vulnerable la reflex paste-buffer după 2-3 expuneri** | 🟢 **FIXED** | TASK #7 — wording update la data-injected dynamic: "continui peste {N} signals în 14 zile" |

**Quality bar TASK #7:**
- 24 tests aaFrictionModal (target era 12+, livrat dublu)
- 559 → 583 tests (+24, zero regresii)
- ADR 013 §6 implementation COMPLETĂ
- Validation pending pe sesiune reală + manual UX testing (mâine PUSH/PULL day)

---

## OPEN BUGS (prioritizate pentru sprint curent)

### 🟢 C11c — Full Reset cache cascade 12+ invalidări (FIXED Task #27)
**Root cause:** `dataCleanup.js` 4 direct `invalidate()` calls bypassed debounce; `window._suppressFirebaseSync` lost on reload → stale Firebase pull restored data after reset.  
**Fix:** (1) Direct calls replaced with `scheduleInvalidation()`. (2) `localStorage.__suppressFirebaseSyncUntil` written before reload, checked in `syncFromFirebase` — survives page reload.

### S1 — ADR 011 schema reconciliation (26 apr) 🟢 FIXED
**Severity:** LOW (doc consistency)
**Source:** Audit retrospectiv post-30.4+30.5 (chat Opus, 26 apr 2026)
**Description:** 3 fields livrate de code dar absente din ADR 011 schema (proposed.proposedSets, outcome.actualExercises, outcome.actualDurationMins). Plus 1 inconsistență internă: cdlBackfill.synthesizeOutcome setează earlyStop:null în loc de false (vs session.js care setează false).
**Fix:** ADR 011 updated cu cele 3 fields + rationale documentat. Reconsideration Trigger #8 adăugat. cdlBackfill earlyStop fix la false. actualDurationMins reconstruit în synthetic entries when ≥2 logs.
**Commits:** TBD (Task #31.5)

### 🟢 H30c — Pattern false positives pe cold_start (FIXED — Task #30.8 + #30.8.1)
**Symptom:** "Marți 88% skip rate", "Miercuri 100% skip rate" după deploy fresh  
**Root cause:** `renderIdle.js:186` bypass la calibration filter — banner citea direct `applied-patterns` (legacy), nu prin CDL.  
**Fix:** Banner acum sourced din `ctx.patterns` (CDL via `analyzeFromCDL`). Suppression când `realCDLCount < 3`. False "Marți 88% skip rate" no longer reproducible.  
**ADR:** 011 — Coach Decision Log as architectural primitive  
**Note:** `applied-patterns` storage key încă există în patternLearning.js pending caller cleanup + Daniel sign-off (TASK #30.9 deferred). Nu afectează H30c closure — bannerul este CDL-sourced.  
**QA context:** [[QA_MANUAL_24APR_2230]], [[QA_MANUAL_25APR_POSTFIX]] (confirmat reproducibil pre-fix)  
**Commits:** TASK #30.8 (renderIdle CDL banner) + #30.8.1 (ctx.patterns CDL unification)

### 🟢 H31c — Full Reset incomplet (FIXED Task #27)
**Root cause:** Blacklist approach missing dynamic keys. Fixed with whitelist: `localStorage.clear()` + restore `PRESERVE_ON_RESET_KEYS` = [device-id, active-theme, last-backup].  
**Registry:** `src/util/dataRegistry.js` — central source of truth for all key lists.

### 🟢 H32c — Rerun onboarding down post-reset (FIXED Task #27)
**Root cause:** `window._suppressFirebaseSync` lost on reload → `syncFromFirebase` ran at post-reset load and restored stale Firebase data (onboarding-done, logs, etc.).  
**Fix:** `localStorage.__suppressFirebaseSyncUntil` (10 s window) written before reload, gates `syncFromFirebase` on next page load.

---

## OBS DE INVESTIGAT (non-bug)

| ID | Observație | Status |
|----|-----------|--------|
| OBS-1 | Protein target 242g în UI (expected 180g) — **root cause identificat** în OPUS audit: constants.js PROT_TARGET=180 static vs proactiveEngine.js bodyweight×2.2 dynamic | 🔵 ROOT CAUSE KNOWN — Task #31 |
| OBS-2 | Kcal est. 495 pentru 72 min legs — plauzibil, formula OK în range | 🟢 RESOLVED |
| OBS-3 | Streak "1" după Full Reset (expected 0) | 🔵 INVESTIGATE (parte din H31c) |

---

## SPRINT 4.x FINDINGS (Batch A audit 2026-05-02 + Batch B resolution)

| ID | Descriere | Status | Fix în |
|----|-----------|--------|--------|
| **SF-A** | **Firebase Auth missing — `src/firebase.js:7` hardcoded `USER_PATH = 'users/daniel'`, zero Auth integration. Per-uid Firebase Rules cannot activate; Blocker 2 gating prerequisite.** | 🟢 **FIXED** | Batch B Task 1 (commit `be68d55`) — `src/auth.js` REST helpers (Magic Link + Google IdP + token refresh) per ADR 002, `getUserPath()` dynamic resolver, `?auth=<idToken>` threading, idempotent `users/daniel → users/<uid>` migration. ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 documents Daniel manual Firebase Console steps. |
| **SF-B** | **T&B Faza 1 NU în cod — `grep -rn "appendEvent\|reduceEvents\|tombstone" src/` returns ZERO. SSOT §34.1 claim "Faza 1 LIVE doar algorithm core" contradicts code. Implementing Faza 2 atop missing Faza 1 = inverted dependency.** | 🟡 PARTIAL FIX | Batch B Task 2 (commit `a23bf49`) — minimal localStorage tombstone soft-delete patches user-visible Memory Paradox bug (delete → reload → entry RE-APARE through Firebase pull). Full T&B Faza 1+2 (event-sourcing layer per TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC) remains a dedicated 10-15h Opus batch (deferred). |
| **SF-C** | **`cdlBackfill` simplified-ladder semantics changed (deliberate, intentional)** — old `<3=INITIAL/<10=PERSONALIZING/else PERSONALIZED` aggressive thresholds replaced with `<6=INITIAL/<12=DEVELOPING/<40=PERSONALIZING/else PERSONALIZED` aligned with `detectCalibrationLevel`. | 🟢 RESOLVED | Batch A `f1a9b95` — intended consequence of ADR 009 §AMENDMENT D1 alignment. Tests updated. |
| **SF-D** | **Inactivity decay granularity softened with 6-tier ordering (positive direction)** — `PERSONALIZING (idx 3) → DEVELOPING (idx 2)` after 60 days vs old `PERSONALIZING (idx 2) → INITIAL (idx 1)`. One extra tier of granularity before INITIAL floor. | 🟢 RESOLVED | Batch A — emergent from `f1a9b95` 6-tier refactor. No code action needed. Recommend §22 messaging consistency check. |
| **SF-E** | **Vite static-vs-dynamic import warnings — `firebase.js`, `dp.js`, `tieringEngine.js` flagged at build time. Pre-existing, NOT introduced by Sprint 4.x.** | 🟡 DEFERRED | Pending dedicated build-optimization batch. Warnings do not block deploy or affect runtime; cleanup is hygiene, not correctness. |



| ID | Descriere | Effort | Tier |
|----|-----------|--------|------|
| FR1 | Săptămânal LMMJVSD clickable pe zile | 2-3 zile | 5 |
| FR2 | "Trend activ" UX color — roșu → verde/neutru pentru progres pozitiv | 10 min | 5 (cost-low, merită imediat) |
| FR3 | Echipament list insuficient — expand EQUIP_MAP + EXERCISES_BY_TYPE | 3-5 zile | 5 |
| FR4 | UX clarity "per sesiune" vs "permanent" pe butoane echipament | 1 zi | 5 |

---

## STATISTICI STATUS

| Status | Count |
|--------|-------|
| 🟢 FIXED | 28 (FAZA 1: C1g, C2g, C3g, C7g, H27g · FAZA 2: C9g, C1c, C2c, C3c, C4c, C5c, H4c, H6c, H11c, H13g, H14g, H16c, M3g · Task #26: C10c · Task #27: **C11c, H31c, H32c** · Task #31: **MP9** · Task #31.5: **S1** · Task #30.8/8.1: **H30c** · TASK #7: **T7-1, T7-2** · Sprint 4.x Batch B: **SF-A** (Auth Migration), **SF-C** (cdlBackfill ladder), **SF-D** (decay granularity)) |
| 🔴 OPEN | 0 |
| 🟡 DEFERRED | ~104 (majority — planificate FAZA 3/4 + 2 noi E2E pre-existing + SF-B (T&B Faza 1+2 dedicated batch) + SF-E (Vite warnings)) |
| 🟡 PARTIAL FIX | 1 (SF-B Memory Paradox hotfix shipped, full T&B deferred) |
| ⚪ WONTFIX | 0 |

**Ultima sesiune QA:** 25 apr 2026 — [[QA_MANUAL_25APR_POSTFIX]]
**Ultima sesiune dev:** 2 mai 2026 — Sprint 4.x Batch B (Auth Migration Faza 1 + Memory Paradox hotfix + Foundation 1/2/4 + SafetyBanner wiring) — 1110/1110 tests, +155 net
**Next sprint:** Daniel publish Firebase rules post-Auth dogfood + dedicated T&B Faza 1+2 batch (SF-B) + Vite build optimization (SF-E)

---

## AUDIT CONSOLIDAT 2026-05-03 — Reclassification Summary

**Sources:**
- `HANDOVER_AUDIT_TOTAL_2026-05-03.md` (synthesis cumulativ)
- `AUDIT_VERIFICATION_REPORT.md` (Faza 1 cap-coadă + §11 reclasificare addendum)
- `AUDIT_IDEATION_REPORT.md` (Faza 2 ~50 idei NEW + §7 integrare addendum)
- `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` ⚠️ **PENDING upload** (vezi DIFF_FLAGS P1-FLAG-1)

**Audit acuratețe verdict:** **7.5/10** (Faza 1 verification — ~6-8 findings severity inflated, ~3-4 false positives, ~5 redundant rebranded).

**Real findings count post-deduplication + reclassification:** **~40 actionable** (NU 53 verification, NU 63 raw audit).

### Distribuție 4 buckets (per §36.92)

#### Bucket 1: REZOLVABIL pre-Beta (~16 actionable)

**4 CRITICAL pre-Beta blockers** (NU 5 — T1 demoted HIGH parțial mitigated, B1 demoted MEDIUM doc hygiene):
| ID | Finding | Effort | Verificare |
|----|---------|--------|-----------|
| **B4** | RPE Verbal UI înlocuire numeric → 3 verbal Ușor/Potrivit/Foarte greu | 1-2h | ✅ CONFIRMED `src/pages/coach/logging.js` `selectRPE` + labelMap vs §36.16 RIR Matrix |
| **B2** | T&B Faza 1+2 event-sourcing + branching + UI prompt | 2-3h | ✅ CONFIRMED §34.1 ZERO matches grep |
| **B3** | Founding Cap Firebase atomic transaction wiring | 30-45min | ✅ CONFIRMED `src/schema/pricing.js` comment "Real implementation uses Firebase transaction" |
| **N1+N5-NEW** | AUDIT_30_9 caller cleanup + dataRegistry `applied-patterns` legacy | ~30-45min | ✅ CONFIRMED 5 callers + `src/util/dataRegistry.js` |

**12 HIGH cleanup batch:**
- T1 "Save the week silent" decizie strategică A/C (D1 pending)
- ADR 023 LLM Intent Implementation Tier 1+2 ⚡ NEW (~6-10h Opus, MANDATORY pre-Beta)
- OBSERVABILITY-1 Sentry filter narrow (~15-30min ⚡)
- CONTRADICTION-1 ADR 003 vs §36.16 RIR threshold reconcile (~30-45min)
- TRIPLE-1 + QUADRUPLE-1 Onboarding+Goal SSOT consolidare (5 → 1, ~3h Daniel + 1h CC)
- ORPHAN-1 ADR 022 split (Bayesian Nutrition + Goal-Driven Templates, ~1-2h)
- R1-NEW Reconciliation Coordinator §36.86b META-RULE-TERTIARY (~30min Daniel)
- N2 Privacy Clause correction + ADR 023 §2.B sanitizer wording (~30min, pre-launch legal)
- DEAD-1 ADR 021 Faza 2 integration (~3-5h, DEPENDS B2)
- Q11-INFRA Cloud Functions Daniel decision (D3 pending)
- DRIFT-1 + DH2 + NEW-2 quick fixes (~20min total)
- NEW-IDEATION-2 Observation Mode prima 2 săpt Beta (~2-3h CC)

**Auth Flow §36.80 = Priority 1 ABSOLUT separat** (chat strategic ~1-2h Daniel + ~30-45min CC autonomous).

#### Bucket 2: Post-launch V1.1 (deferred ~10 items)

- FM-16 Engine Self-Audit Weekly (MOAT diferentiator, ~1-2 săpt design + 4-6h CC)
- FM-17 Memory-Aware Questions (~1 săpt build)
- IMP-15 Sprint Vault Hygiene Q2 2026 (D5 pending, ~6-10h)
- NEW-IDEATION-3 SLA disclosure ToS (~30min Daniel + legal Stage 2)
- NEW-IDEATION-4 Whitelist exercise names + termeni fitness RO maintenance (~1-2h initial + 30min/lună)
- NEW-IDEATION-5 Cost monitoring backend Cloud Functions (~3-5h, D6 dependent)
- SG-1 + SG-2 + SG-3 CAC + Retention + Churn metrics (business modeling)
- SG-4 NPS measurement methodology
- SG-5 ASO strategy post-PWA wrap
- FM-7 Multi-gym + FM-6 HR optional + FM-12 Travel mode (V1.x)

#### Bucket 3: Acceptabil trade-off permanent (~5 items)

- Bus factor 1 ACCEPTED pre-revenue (§36.88)
- N3 velocity Daniel solo (acceptable risk)
- BACKLOG-1 + R3 (acceptable, NU actionable)
- Custom exercises REJECTED V1 (PRODUCT_STRATEGY §3.2 explicit)
- Climate awareness FM-14 DROP (paternalism risk)
- Audio recording form check FM-15 DROP V1 (V2+ candidate)
- Group challenges PERMANENT REJECT (§1.7 anti-vendetă)

#### Bucket 4: Reconsiderate (~6 items)

- **Cognitive Q4 DELOCK** (§36.87 §AMENDMENT 2026-05-03 — LLM permis exclusiv 2 trigger points ADR 023)
- **T2 The Filter RESOLVED** (§36.91 via ADR 023)
- **TIME-1 Bayesian convergence** MEDIUM acceptable cu DEMO-1 verify (§36.90)
- **Calibration target pre-Beta 85-90%** (§36.89, NU 95% — plan A+B+E)
- **B1 Mode Detection** demoted CRITICAL → MEDIUM (audit confused declared vs behavioral overlay)
- **I1 Volume Multiplier** reframed -42% → -19% real (Composite Signal NU multiplier standalone, Demographic Prior T0-only)

### Top 6 ideation integrate pre-Beta (§36.92 cross-ref)

1. **IMP-1 Volume Floor Guarantee** META-RULE-QUINQUE — anti-amputation Maria 65 (~1h)
2. **IMP-3 Synthetic Demographic Prior pre-Calibration** plan A (~8-12h dacă DEMO-1 incomplete)
3. **NEW-IDEATION-1 Expert Validator Coach Paid** plan E (€500-1000 + 2-4h sourcing)
4. **FM-2 Mobility/Warm-up Auto-Insertion** (~5h, longevity 50+ Maria critical)
5. **FM-8 Pre-Injury Recovery Debt PROACTIVE** (~2-3h, anti-injury proactive)
6. **IMP-4 Spec→Cod Tracking Matrix** (~1.5h, anti-recurrence drift)

### False Positives identified (REMOVED from finding list)

- **I6 ADR 020 Dexie "NEVERIFICAT"** — false positive (Phase 1 ACTIVE `src/storage/db.js` + `tieringEngine.js`)
- **P4-11 ADR 020 dependency NEVERIFICAT** — duplicate I6
- **Jeff #2 Plateau Breaker absent** — false positive (12+ algorithmic interventions în `src/engine/plateauInterventions.js`, gap real = UI wiring NEW-1)
- **M3-NEW ADR 005 XSS user.name** — partial false positive (mitigation pattern existent, risk teoretic NU verified în cod)

### Total effort cumulativ pre-Beta cleared (post-addendum)

- **Effort Opus realist:** ~30-45h actual (UP de la ~25-35h pre-addendum due ADR 023 + Observation Mode NEW)
- **Daniel chat strategic:** ~12-18h (down post T2 RESOLVED)
- **Plus expert validator coach paid €500-1000 one-time + 2-4h sourcing**
- **Sequencing realist:** 4-6 săpt calendaristic (factor sustainability Daniel solo + family + job)

### Decision points pending Daniel chat strategic NEW (D1-D6)

Vezi DIFF_FLAGS.md P2-FLAG-1.

---

**Ultima audit consolidat ingest:** 2026-05-03 (3/4 fișiere ingestate, 1 PENDING upload — vezi DIFF_FLAGS P1-FLAG-1)
**Cumulative LOCKED count post audit total:** 79 → **85** (+6 §36.86-§36.91)
