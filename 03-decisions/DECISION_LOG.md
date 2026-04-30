# DECISION LOG â€” SalaFull

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

## 2026-04-27 â€” TASK #7 Friction Modal HIGH Tier LIVE + E2E Fix + 2 fail-uri pre-existing flagged

**Scope:** 3 commits substanÈ›iale post-handover sesiunea 27 apr.

**E2E fix applied-patterns assertion (commit 8d2dae9):**
- `tests/e2e/smoke/critical-paths.spec.js:116-119` â€” assertion update post TASK #2 CDL_KEYS migration
- `applied-patterns` PRESERVED la resetTestData per ADR 011 (CDL_KEYS semantic), NU wiped
- `auto-recommendations` rÄƒmÃ¢ne wiped (TEST_RESIDUE_KEYS legitim)
- Fix: 2 linii schimbate + 2 comment-uri. Strategie A (update assertion, NU split Ã®n 2 teste).
- Motiv: unit tests dataCleanup acoperÄƒ deja fullReset wipe CDL â€” E2E split = duplicat cost zero benefit
- 559/559 unit tests maintained. Push to main.

**TASK #7 â€” HIGH tier friction modal UI complete (commit d4a167c):**
- `src/pages/coach/aaFrictionModal.js` (NEW) + `aaFrictionModal.test.js` (24 tests, target era 12+)
- Bottom-sheet mobile-first, swipe-down = cancel, force dark backdrop
- Typing confirmation **data-injected** (decision update ADR 014 Â§5): `"continui peste {N} signals Ã®n 14 zile"` â€” frazÄƒ unicÄƒ per modal, anti-reflex paste
- Escalation pattern: a 2-a override Ã®n 7 zile = phrase mai lung + warning vizibil
- State persistence localStorage `aa-friction-pending` (refresh = state restored, NU reset)
- Plan side-by-side comparison: original tÄƒiat vs redus (transparency maxim, anti-manipulativ)
- Override trust user (D6=A): restore plan original + log `outcome.aaOverride=true` Ã®n CDL â€” friction-ul = conÈ™tientizare, NU pedeapsÄƒ
- `coachDirector.applyAAAdjustments` â€” preserve `aaOriginalSets` ÃŽNAINTE de reduction (1 line addition pentru override restore)
- `session.js` populateOutcome â€” adaugÄƒ `aaOverride` + `aaOverrideRationale` fields
- 583/583 tests passing (559 baseline + 24 new). Push to main.

**Status final ADR 013:**
- AA pipeline END-TO-END LIVE: detection â†’ write CDL â†’ read context â†’ apply session â†’ UI intervention
- Sprint A (TASK #1+#4+#5) + TASK #7 = ADR 013 Â§6 implementare COMPLETÄ‚
- Validation pending pe sesiune realÄƒ + manual UX testing (mÃ¢ine PUSH/PULL day, AA real-world signals)

**E2E pre-existing fail-uri (flagged Ã®n FINDINGS_MASTER, NU regression TASK #7):**
- `calibration-ui.spec.js:193` â€” "CDL low adherence shows LOW_ADHERENCE banner" â€” page nu rendÄƒruieÈ™te cu CDL setat Ã®n test
- `integration.spec.js:97` â€” "selectÃ¢nd readiness verdict card apare" â€” verdict card nu apare dupÄƒ select
- Verificat git checkout 1007ffe (Ã®nainte TASK #7) â€” fail identic. Pre-existing, NU blocker.
- Decizie: flag Ã®n finding tracker, NU fix imediat (Memory #14 â€” bulletproof pe ce construim, NU sweep tot)

**Decizii cheie:**
- **TASK #7 strategy A (update E2E assertion 2 linii) > B (split test):** unit tests acoperÄƒ deja fullReset wipe CDL, E2E split = duplicat. Friction minim ADHD.
- **ADR 014 Â§5 wording update:** static "Am vÄƒzut pattern-ul" â†’ data-injected dynamic. Anti-reflex paste-buffer + cognitive lock-in real.
- **Triangulation 2 chats Claude (active + previous):** 4/4 push-back-uri valide din chat precedent adoptate (Build vs Activate Q1-Q5, ordine roadmap, sequential vs parallel solo, API tier-based monetization). 1 push-back D2 chat curent acceptat (data-injection peste static phrase).
- **Decisions strategice 6/6 finalizate:** Beta luna 4-5 (NU 6+), Q1-Q5 build luna 2-3 activate la beta, roadmap AA valâ†’cleanupâ†’#7â†’#8â†’bloodworkâ†’parametric, calibration lunar prima review luna 3, bloodwork DUPÄ‚ #8 NU Ã®nainte, API tier-based monetization NU subsidize all.

**ADR cross-refs:**
- [[013-auto-aggression-detection]] Â§6 â€” implementation COMPLETÄ‚ post TASK #7
- [[014-onboarding-profile-typing]] Â§5 â€” wording update data-injected (NEW)

**Quality bar:**
- 559 â†’ 583 tests (+24, zero regresii)
- 16 commits substanÈ›iale azi (sesiune 27 apr completÄƒ)
- AA pipeline LIVE end-to-end ADR 013 complete
- 2 fail-uri E2E pre-existing flagged (NU regression)

---

## 2026-04-27 â€” Sprint A AA Pipeline LIVE + Cleanup Batch + getBF Dead Code Closed

**Scope:** 13 commits substanÈ›iale Ã®ntr-o sesiune.

**Sprint A â€” AA detection pipeline integrat end-to-end (ADR 013):**
- TASK #1: AA write-side Ã®n session.js (eded0c1) â€” populateOutcome cu autoAggression + setsRPE
- TASK #4: AA read-side Ã®n coachContext.js (db798bc) â€” 30d window aggregation, ctx.autoAggression populated
- TASK #5: applyAAAdjustments Ã®n coachDirector.js (6a30f1e) â€” MED â†’ aaWarning, HIGH â†’ aaBlocked + volume reduction 30%
- TASK #2: CDL_KEYS category Ã®n dataRegistry.js (52e09f1)
- TASK #3: sf.userConfig Ã®n SYNC_KEYS (8dde67f)

**TASK #6 â€” sys.js coverage gap closed:**
- Phase 1: lazy refactor _bio â†’ getters (e344ecb) â€” getUserConfig() at call time, NU module load
- Phase 2: 11 tests sys.js (207f40f) â€” TDEE/BF/phase coverage solidÄƒ

**Cleanup batch (audit findings night closed):**
- isoWeek centralization (4066d92): src/util/isoWeek.js + 7 tests boundary, 2 callers refactored â€” closes M3g+H13g
- Readiness thresholds extract (23a3867): READINESS_PR/HIGH/MED/LOW exports + drift fix proactiveEngine `<60` â†’ `<55` â€” closes M1
- getBF dead code elimination (e97e468): Option B per Opus spec, calibration-only formula + invariance test â€” closes finding 810ea68

**Profile Typing infrastructure (ADR 014 Â§6 Step 1):**
- profile-history Ã®n USER_DATA_KEYS + SYNC_KEYS (17d08d9) â€” closes audit night gap (PROFILE_TYPING_INTEGRATION_AUDIT_NIGHT.md Â§6)

**Quality bar:**
- 524 â†’ 559 tests (+35, zero regresii)
- 7 audit findings closed
- AA pipeline validation pending pe sesiune realÄƒ (mÃ¢ine PUSH/PULL day)

**Decizii cheie:**
- getBF: **Option B** (calibration-only) per Opus 1m 30s audit. Anti-recommendation Opus: NU implementa hybrid cu fudge factors arbitrari. AÈ™teaptÄƒ 30+ CDL entries + DEXA validation pentru sofistication.
- Velocity calibrare confirmatÄƒ: Sonnet refactor mecanic ~5-15 min real, Opus focused audit pe scope concentrat 1m 30s

**ADR cross-refs:**
- [[013-auto-aggression-detection]] â€” Sprint A integrare
- [[014-onboarding-profile-typing]] Â§6 â€” Storage Step 1 done
- [[015-getbf-calibration-only]] â€” getBF formula decision (NEW)

---

## 2026-04-26 â€” TASK #30 PARTIAL â€” Coach Decision Log Adopted (9/10 subtasks)

**Scope:** ADR 011 implementation â€” Coach Decision Log (CDL) ca primitive arhitectural. ÃŽnlocuieÈ™te H30c (false banner) fix izolat cu refactor structural. Supersedes Task #28 + #29.

**Approach:** 10 subtasks ordonate (30.1â€“30.10). 30.9 (decommission applied-patterns) pending Daniel sign-off + caller cleanup.

**Outcome:** Single source of truth pentru pattern detection Ã®n engine + UI banner. Banner sourced din `ctx.patterns` (CDL via `analyzeFromCDL`) cu suppression cÃ¢nd `realCDLCount < 3`. False "MarÈ›i 88% skip rate" banner no longer reproducible. H30c CLOSED.

**30.9 deferral rationale:** 5 production callers identificaÈ›i (renderIdle.js, util.js, modals.js, dashboard.js, main.js) necesitÄƒ cleanup manual + 4 sign-off triggers validabile doar de Daniel. Caller cleanup estimat 30-45 min, urmat de 1h Daniel manual validation. Decom-ul efectiv = 15-20 min. Sequence documentatÄƒ Ã®n [[AUDIT_30_9_BLOCKED_STATE]].

**Tests:** 301 â†’ 414 (+113 CDL + engine tests). Baseline: 414/414.

---

## 2026-04-25 â€” REBRAND: ELIMINARE TRADEMARK ANTHROPIC DIN PUBLIC

**Context:** Decizia anterioarÄƒ din 24 apr 2026 ("CLAUDE AI OPUS 4.7 COACH" ca brand vision) violeazÄƒ Anthropic Consumer Terms of Service:

> "You may not, without our prior written permission, use our name, logos, or other trademarks in connection with products or services other than the Services, or in any other way that implies our affiliation, endorsement, or sponsorship."

Verificat 25 apr 2026 prin web search direct pe documentele legal Anthropic.

**Decizie:** SalaFull NU referenÈ›iazÄƒ Anthropic, Claude, sau orice trademark Anthropic Ã®n material public-facing.

**Brand public:** SalaFull (sau successor TBD pre-launch).

**Acceptabil intern (factual technical):**
- ADRs, vault docs, technical specs
- Privacy Policy / ToS (disclosure GDPR transparency)
- Code comments, source code
- Editorial third-party content

**NU acceptabil public:**
- Brand name cu "Claude" sau "Anthropic"
- Logo Anthropic Ã®n UI / marketing
- Tagline "Powered by Claude" / "Built with Claude" / "Made with Anthropic AI"
- Implied partnership / endorsement

**Beneficii strategice (forward-compatibility):**
- Vendor independence: schimbÄƒm backend AI fÄƒrÄƒ sÄƒ spargem brand-ul
- Differentiation: vindem outcome (transformation), nu implementation detail
- Pre-acquisition due diligence: clean trademark = mai puÈ›ine probleme la exit
- Industry standard: Coca-Cola nu reclamÄƒ zahÄƒrul brazilian, Stripe nu reclamÄƒ AWS

**Implementare 25 apr 2026:**
- PROJECT_VISION.md: rewrite secÈ›iune CONCEPT BRAND
- INDEX_MASTER.md: rewrite secÈ›iune CONCEPT PRODUS + adÄƒugat link [[010-no-anthropic-trademark-public]]
- ADR nou: 03-decisions/010-no-anthropic-trademark-public.md
- DECISION_LOG: aceastÄƒ intrare

**Reconsiderare trigger:**
- Anthropic acordÄƒ written permission specificÄƒ
- Anthropic lanseazÄƒ program oficial "Built on Claude" cu terms publici
- Legal counsel confirmÄƒ nominative fair use Ã®n context specific

**Supersedes:** decizia 24 apr 2026 "CLAUDE AI OPUS 4.7 COACH (branding)" â€” care rÄƒmÃ¢ne Ã®n log ca istoric, dar e marcatÄƒ ca SUPERSEDED.

---
## 2026-04-25 â€” Nuclear Opus Audit v3 completed

**Scope:** Audit adversarial code-first pe arhitectura curentÄƒ, FAZA 1/2 "DONE" challenge, blueprint FAZA 3/4, launch readiness. Evidence-based (file:line pentru fiecare claim), zero "TBD". Output: [[OPUS_NUCLEAR_AUDIT_25APR]] (1500+ linii, 13 secÈ›iuni, fiecare cu VERDICT binar).

**Top 5 Absolute Blockers (launch):**
1. **C10c Cache Invalidation Cascade** â€” `firebase.js:85-121` initial sync produce 8-11 invalidÄƒri Ã®n lanÈ›; fix-ul H11c (extindere keys 5â†’11) a amplificat bug-ul.
2. **H31c Full Reset Spec Gap** â€” `dataCleanup.js:212` È™terge doar uniune TEST_RESIDUE_KEYS + USER_DATA_KEYS; keys dinamice (muscle-extra-*, aa-cooldown-*, ex-extra-sets-*) persistÄƒ. FÄƒrÄƒ registry central.
3. **H30c Pattern Learning Bypass** â€” `renderIdle.js:186` citeÈ™te `applied-patterns` direct, bypass la calibration filter; plus `patternLearning.js:31-35` numÄƒrÄƒ zile calendar nu zile de plan.
4. **Multi-Tenancy Still Fake** â€” `firebase.js:6 USER_PATH = 'users/daniel'` hardcodat, ignorÄƒ `config/user.js:19`. FAZA 1.2 FALSE DONE.
5. **Observability Blackhole** â€” `C8g` Sentry filter neverificat + 3 catch blocks Ã®n coachDirector care Ã®nghit erori engine silent.

**5 False/Half "DONE" expose:**
- FAZA 1.2 multi-tenancy (firebase.js:6 still hardcoded)
- FAZA 1.3 log schema (logNormalize creat dar neaplicat â€” by design)
- FAZA 1.7 AA (RPE fix TRUE / registry FAIL â€” cooldown keys leak)
- FAZA 1.8 rules v1 (cap OK / rules nu Ã®n repo)
- FAZA 2 OPT A weakness ordering (cod TRUE / feature flag OFF dormant)

**7 probleme NOI (anti-reÃ®ncÄƒlzire, nedetectate Ã®n FAZA_2_OPUS_REVIEW):**
1. Cache invalidation cascade la Firebase sync (C10c deep root)
2. renderIdle.js:186 banner bypass la calibration filter
3. patternLearning counts calendar days, not plan days
4. Dynamic `import('./dp.js')` Ã®n hot path (legacy FAZA 1.1)
5. Keys dinamice write-only leak (muscle-extra-*, aa-cooldown-*, ex-extra-sets-*)
6. Protein target schema drift (180 static vs bodyweightÃ—2.2 dynamic)
7. `_suppressFirebaseSync` nu supravieÈ›uieÈ™te reload Ã®n Full Reset flow

**Task list generated:** 24 task-uri pre-queued (TASK #26-49) Ã®n 5 tiers logice:
- Tier 0 (THIS WEEK): 7 tasks â€” quick stability wins (C10c, H31c, H30c, dead code cleanup)
- Tier 1 (Week 1): 3 tasks â€” observability (Sentry audit, logger, analytics)
- Tier 2 (Week 2-3): 3 tasks â€” multi-tenancy real (Firebase Auth + migration)
- Tier 3 (Week 3-4): 5 tasks â€” launch readiness (onboarding, landing, privacy, billing)
- Tier 4 (Next Quarter): 3 tasks â€” schema & architecture refactor
- Tier 5 (Next Quarter): 3 tasks â€” FAZA 4 features (programe, injury, recovery)

**VERDICT FINAL: FAIL.** SalaFull are fundamente corecte dar NU e launch-ready Ã®n nicio dimensiune criticÄƒ. 4-6 luni concentrate pÃ¢nÄƒ la commercial launch realist.

**Next action:** Daniel review audit, valid/reject task list, queue TASK #26-32 pentru execuÈ›ie imediatÄƒ (Tier 0 quick wins).

---

## 2026-04-24 â€” FAZA 2 COMPLETE (Bug Fixes + Reliability)

**Scope:** 6 task groups, 10 bugs fixed, 2 refactors, 35 net new tests.

**LivrÄƒri majore:**
- Tier 0 (C4c + C5c): log schema completeness (kg/set fields) + eliminate endSession auto-delete for short sessions
- P2 batch (H11c + C3c + H6c): COACH_RELEVANT_KEYS 5â†’11 keys, rateSession double-tap guard, analyzeAndApplyPatterns inflight guard
- Session batch (C2c + H4c): cancelWorkout full state reset (parity with endSession), resume completedExercises from sessLog not empty Set
- Engines batch (M3g + H13g + H14g): isoWeek ISO 8601 Thursday rule Ã®n 2 fiÈ™iere, checkRecoveryGroups computes daysSinceLast from logs (getMuscleState incompatibility fix)
- sessionBuilder OPT C: fallbackSessionBuilder extras ca pure function Ã®n sessionBuilder.js
- sessionBuilder OPT A: weakness-prioritized ordering + contextSelectionEnabled feature flag (default: false)

**Metrici:**
- Tests: 236 â†’ 271 passing (+35)
- Test files: 22 â†’ 25
- Regresii: 0
- Commits FAZA 2: 6 (489480e â†’ 7c86288)

**Decizii cheie:**
- C5c: eliminate auto-delete complet (nu confirm dialog) â€” orice sesiune cu loguri se pÄƒstreazÄƒ implicit
- H14g: nu restrucura getMuscleState (breaking change); Ã®n schimb fix site-ul de consum (checkRecoveryGroups)
- isoWeek: Thursday rule (ISO 8601) â€” week belongs to year of its Thursday, nu jan1 offset
- contextSelectionEnabled: default false â€” ordering activ doar explicit opt-in; previne regression pentru users fÄƒrÄƒ weakGroups
- OPT A scope restrÃ¢ns (Opus review): nu adaugÄƒ exerciÈ›ii noi, doar reordonare Ã®n lista existentÄƒ

**Next:** FAZA 3 â€” Infrastructure + Observability â€” plan complet Ã®n [[FAZA_3_ROADMAP]]

Raport complet: [[FAZA_2_FINAL_REPORT]]

---

## 2026-04-24 â€” FAZA 1 COMPLETE (Engine Bulletproof)

**Scope Ã®nchis Ã®n 1 zi:** Toate 9 sub-faze 1.0â€“1.8.

**LivrÄƒri majore:**
- Split coach.js 1477 â†’ 10 module (1.0 plan Opus + 1.1 exec Sonnet) â€” commit 9875755
- Multi-tenancy decouple (1.2) â€” 14 fiÈ™iere, config/user.js centralizat
- Log schema cleanup (1.3) â€” 7 mismatches, 20+ fallback-uri moarte eliminate, logNormalize.js
- cleanDuplicateLogs fix (1.4) â€” dedupe strict pe timestamp (nu pe business fields)
- ctx.allLogs real (1.5) â€” 2 linii, calibration funcÈ›ioneazÄƒ pentru 80+ sesiuni
- sessionBuilder cleanup OPT B (1.6) â€” dead code removed, OPT A escalat FAZA 2
- AA engine activate notes-only (1.7) â€” RPE logic eliminat (necolectat), safety net defensiv
- Firebase data loss fix 500â†’5000 + audit + rules v1 plan (1.8) â€” commit bf800e7

**Metrici:**
- Tests: 41 â†’ 232 passing (5.7Ã—)
- Regresii: 0
- Commits pe main: 18+
- Test files: 8 â†’ 20

**Workflow creat:**
- Claude Code hook Stop â†’ auto-push pe main
- [[EXEC_QUEUE]] + [[EXEC_RESULTS]] â€” async execution protocol (vezi [[ASYNC_EXECUTION_PROTOCOL]])
- Daniel = PM, Opus = Co-CTO (planning), Sonnet = executor (cod)

**Decizii cheie:**
- OPT B Ã®n 1.6 (sessionBuilder delete vs implement) â€” scope FAZA 1 = infrastructure, nu features
- AA notes-only â€” RPE logic producea false INCREASE deoarece rpe:8 era hardcoded, nu colectat
- slice 5000 (nu remove cap, nu tierStorage) â€” optimal FAZA 1: 4 caractere, 1.5+ ani headroom
- Rules v1 path-restricted (nu auth Firebase) â€” auth e FAZA 4

**Next:** FAZA 2 â€” Priority 1 = sessionBuilder real (context-aware selection), detaliat Ã®n [[FAZA_2_ROADMAP]]

Raport complet: [[FAZA_1_FINAL_REPORT]]

---

## 2026-04-24 â€” FAZA 1.1 Clarifications (pre-execution GO)

**D1 â€” ES module cycles:** temporare. Rezolvate la Pas 10 prin import direct din corp funcÈ›ie. Fallback permanent (late-binding) acceptat doar dacÄƒ build aruncÄƒ ReferenceError â€” documentat Ã®n raport.

**D2 â€” renderIdle.js size:** ~400 LOC acceptat pentru 1.1. Copy-paste verbatim. Prag review: 450 LOC. Re-split doar dacÄƒ depÄƒÈ™eÈ™te.

**D3 â€” Bug inventory:** C2 singurul explicit pre-execuÈ›ie. Alte bug-uri marcate `// BUG(audit):` la execuÈ›ie, capturate Ã®n raport final. PR-uri separate post-split.

**Status:** GO unconditional. ExecuÈ›ie 8-12h.

---

## 2026-04-24 â€” FAZA 1.6 sessionBuilder cleanup + deferred real impl

**Finding:** sessionBuilder = null literal forever. Tot contextul calculat de coachDirector era aruncat, fallback static selecta din listÄƒ hardcoded.

**Decizie:** OPT B Ã®n FAZA 1 (cleanup dead code, ~15 min), OPT A escalat la FAZA 2 Priority 1 (3-4h, context-aware real selection).

**Justificare:** FAZA 1 scope = Engine Bulletproof = infrastructure. OPT A = feature nou, nu bulletproofing. Nu mixÄƒm scope-uri.

**Risc acceptat:** FAZA 1.5 (ctx.allLogs real) nu va avea impact vizibil pÃ¢nÄƒ la FAZA 2 Priority 1. Documentat explicit ca prima prioritate FAZA 2 Ã®n [[FAZA_2_ROADMAP]].

**Commits FAZA 1.6:** d2dd940 (audit), + commit curent (OPT B exec)

---

## 2026-04-24 â€” FAZA 1.3 Log Schema Cleanup (DONE)

**Scope:** CurÄƒÈ›are schema loguri, eliminare fallback-uri moarte, fix bug-uri schema.
**Surprise:** Audit a gÄƒsit cÄƒ NU e nevoie de migration one-shot. Schema actualÄƒ e OK, doar are fallback-uri moarte + 1 bug activ (adherence M2).

**Ce s-a fÄƒcut:**
- Task #9: Audit schema â€” 7 mismatches identificate (M1â€“M7) â†’ [[LOG_SCHEMA_AUDIT_1_3]]
- Task #10: Fix M2 (adherence __early_stop__ filter) â€” bonus: reparat È™i 1 e2e test failing
- Task #11: Eliminare fallback-uri moarte (l.weight/l.exercise/l.timestamp) din 10 fiÈ™iere + creat logNormalize.js
- Task #12: Consolidare M3-M7 â€” omis rpe fals, aliniat sessLog.kgâ†’w, eliminat userOverride dead

**Validare:** Teste baseline menÈ›inute. 216 unit tests pass (vs 41 e2e iniÈ›ial).
**Commits:** 79081d1, 894e341, 28fe2b9, + commit curent

---

## 2026-04-24 â€” FAZA 1.2 Multi-tenancy Decouple (DONE)

**Scope:** Elimina Daniel-hardcoded values din codebase. Audit: [[HARDCODED_AUDIT_1_2]]
**Approach:** Scope minim + defaults.js + localStorage override (NU multi-user Firebase â€” asta vine Ã®n FAZA 4).

**Ce s-a fÄƒcut (3 tasks, 14 fiÈ™iere):**
- Task #4: src/config/user.js creat cu USER_DEFAULTS + getUserConfig/updateUserConfig
- Task #5: sys.js + coachContext.js refactor sÄƒ foloseascÄƒ getUserConfig()
- Task #6: TARGET/DATE/PATH centralizate Ã®n constants.js + firebase.js

**Validare:** Teste baseline menÈ›inute. Zero regresii. Deploy live.

**Commits:** 39b9899, b89e3e9, 4d7a4a9


## 2026-04-27 â€” Sesiune END Strategic Decisions (post TASK #7)

**Scope:** 6 strategic decisions luate post cleanup A+B, definind architectural direction pe urmÄƒtoarele 3-4 luni.

### Decision 1 â€” Bloodwork DEFINITIV OUT din SalaFull

**Verdict:** Nici commercial, nici personal/dev-flag. Closed forever.

**Rationale commercial:** Gigel test FAIL. Daniel a articulat scenariul user mediu non-tech RO: "de ce imi cere bloodwork? e medic? la cine ajung datele? ma duc la Dorel medicul de 90 ani NU app". Trust breach + privacy panic + cultural friction RO + scope creep perceput = churn imediat. Pierdere brutalÄƒ de useri.

**Rationale personal Daniel:** Insight crucial â€” chat Claude direct = alternativÄƒ superioarÄƒ zero-build. Workflow personal: paste analize Ã®n chat dedicated, Claude interpret + coreleazÄƒ cu antrenament, Daniel aplicÄƒ manual Ã®n SalaFull. Cost build = 3-4h Sonnet pentru feature folosit 4x/an = waste.

**Verdict:** SalaFull stays clean = coach AI fitness, NU medical scope creep. NU readuce Ã®n viitoare discuÈ›ii fÄƒrÄƒ trigger explicit Daniel.

### Decision 2 â€” Filter "Gigel test" devine regulÄƒ permanentÄƒ

Pentru orice feature decision viitoare, Ã®ntrebare obligatorie = "Cum reacÈ›ioneazÄƒ Gigel (user mediu non-tech RO)?". NU "tehnic posibil?", ci "dubios pentru user?". Features tech-cool dar Gigel-suspect = OUT indiferent MOAT.

Cluster decisions filter: trust breach + privacy panic + cultural friction RO + scope creep perceput â†’ reject indiferent diferentiator tehnic.

### Decision 3 â€” Vitality Layer adopted ca dimension nouÄƒ Ã®n engine

**Concept Daniel:** ÃŽnlocuim bloodwork cu Ã®ntrebÄƒri behavioral proxy scurte despre user (energie, sleep, temperament, motivaÈ›ie, recovery, inflamaÈ›ie). Combinat cu age + kg + height + BMI ne indicÄƒ direcÈ›ia fiziologic approximativ. Friction ZERO comparativ cu bloodwork.

**Examples valid:**
- "Cum te simÈ›i Ã®n general?" / "Cum dormi?"
- "Te-ai descrie ca temperamental?"
- "Recovery post-antrenament?"
- "Te trezeÈ™ti odihnit?"
- "Cum te simÈ›i cu motivaÈ›ia Ã®n general?"

**Examples NU includem (Gigel test fail):**
- ÃŽntrebÄƒri directe libido, erecÈ›ie, etc.

**Implementation pattern:**
- Opt-in post-onboarding, NU mandatory
- User decide cÃ¢nd completeazÄƒ (sesiune 5, 10, 30, niciodatÄƒ = OK)
- Engine inferÄƒ behavioral aproximativ dupÄƒ 20-30 sesiuni dacÄƒ user skip

**ADR pending:** 016 â€” Vitality Layer (depends ADR 018 done first).

### Decision 4 â€” Tier-based personalization architectural pattern

**Filosofie SalaFull (Daniel insight):** self-selection bias = FEATURE NOT bug.

| Tier | CerinÈ›Äƒ user | Engine response |
|------|-------------|----------------|
| T0 | Skip onboarding | Engine generic + demographic prior din synthetic profiles |
| T1+ | Q1-Q5 completed | + Profile Typing dimension |
| T2+ | Vitality completed | + state inference |
| T3+ | Sesiuni reale 30+ | + behavioral calibration |
| T4+ | 90+ sesiuni | Full personalized engine |

**Daniel articulation:** "Cine completeazÄƒ e accurate, cine nu e safe dar mai general. Nu putem sa facem 8 miliarde de oameni sa raspunda la tot."

**Verdict:** NU forÈ›ezi engagement uniform. Real sesiuni corecteazÄƒ prior pe parcurs. Useri investiÈ›i â†’ MOAT real. Useri skip â†’ engine acceptabil baseline.

### Decision 5 â€” Synthetic 500 profile Ã— 90 zile = PRODUCTION INFRASTRUCTURE

**NU test fixture. NU stress test only. ESTE Demographic Prior Database.**

**Profile diversificat (mix 500 total):**
- ~50 manually crafted (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.)
- ~450 algorithmic generated cu variaÈ›ie controlatÄƒ (age Ã— sex Ã— kg Ã— height Ã— job Ã— lifestyle Ã— goal)

**Storage:** local fixtures `tests/fixtures/syntheticProfiles.js`, generated runtime Ã®n memory. NU se salveazÄƒ permanent. NU consumÄƒ Firebase storage.

**Cost:** $0 pentru synthetic. Production scaling Firebase = $125/lunÄƒ la 100 useri reali, $1500/lunÄƒ la 1000 useri.

**Lifecycle (Daniel insight crucial):** "la launch nu mai avem nevoie de profilele de test... se sterg si firebase ramane gol... ma rog cu mine in el." Test data lifecycle separation = synthetic build phase only, NU production data.

**De ce 500 NU 1000:** Sweet spot dev workflow speed vs coverage density. Generator parametrizat = uÈ™or scale dacÄƒ needed (`generateProfiles(count: 500)`).

**ADR pending:** 017 â€” Demographic Prior Database (depends ADR 018 done first).

### Decision 6 â€” Co-CTO real-time decision filter (working brain pattern)

**Daniel articulated cerinÈ›Äƒ critical:** "fÄƒrÄƒ ca tu sÄƒ gÃ¢ndeÈ™ti ca un working brain, nu putem sÄƒ simulÄƒm unul."

Claude operate ca decision filter Ã®n timp real, NU yes-man. CÃ¢nd Daniel propune idee midway sesiune, evaluez 3 dimensions:

1. **URGENCY engine:** critical=STOP midway, high=next milestone, medium=schedule, low=backlog deep
2. **ARCHITECTURAL impact:** foundation-shifting=STOP, layer-adjacent=finish layer integrate boundary, plugin-able=backlog, cosmetic=backlog
3. **COGNITIVE load Daniel:** hyperfocus=store NU Ã®ntrerup, milestone boundary=discutÄƒm, strategic mood=full discuÈ›ie

**Storage 3 layers:** memory persistent + vault INSIGHTS_BACKLOG + in-conversation.

**Periodic re-evaluez backlog la fiecare milestone.**

### Roadmap recalibrate

**Velocity confirmat:** Daniel productive 10-11h/zi pe SalaFull (HR job nivel decizional permite, NU 2-3h cum greÈ™eam estimating). Recalibrare timeline:

**Order strict (NU schimbi fÄƒrÄƒ discuÈ›ie):**
1. ADR 018 â€” Engine Extensibility Architecture (foundation, Opus task)
2. ADR 016 â€” Vitality Layer (use ADR 018 patterns)
3. ADR 014 update â€” Profile Typing tier-based aware
4. ADR 017 â€” Demographic Prior Database
5. Build SHARED INFRASTRUCTURE (Dimension Registry, Standardized Contract, Cluster Engine, Schema Versioning, Feature Flags)
6. Build SHARED form/scoring/reconciliation
7. Build Profile Typing (TASK #8) ca plugin
8. Build Vitality Layer ca plugin
9. Build Synthetic Generator + Demographic Prior Database
10. Run synthetic massive â†’ engine validation cross-demographic
11. Real sesiuni Daniel paralel (calibration begin, 32+ sesiuni reale 8 sÄƒpt)
12. Beta micro launch (luna 3-4, 3-5 useri diferiÈ›i de Daniel)
13. Public-ish launch (luna 4-5)

**Critical insight:** Spec ADR 018 ÃŽNAINTE de orice build feature nouÄƒ. Toate features viitoare = build pe aceastÄƒ fundaÈ›ie. Previne refactor forÈ›at later. "Engine extensibil prin natura lui" = Daniel's articulation.

### Quality bar metrics

- 583 unit tests (vitest + jsdom), zero regresii
- AA pipeline LIVE end-to-end (ADR 013 Â§6 complete)
- 16 commits substanÈ›iale azi (cumulativ Sprint A + post-handover)
- 0 OPEN bugs
- 2 fail-uri E2E pre-existing flagged corect (NU blocker production)

### ADR cross-refs

- [[013-auto-aggression-detection]] Â§6 â€” implementation COMPLETÄ‚ post TASK #7
- [[014-onboarding-profile-typing]] Â§5 â€” wording update data-injected (sesiune anterioarÄƒ azi)
- [[015-getbf-calibration-only]] â€” getBF formula decision (Sprint A)
- [[016-vitality-layer]] â€” PENDING (ADR Vitality, depends 018)
- [[017-demographic-prior-database]] â€” PENDING (ADR Synthetic infra, depends 018)
- [[018-engine-extensibility-architecture]] â€” PENDING (ADR fundamental NEXT)

### Memory updates persistente

- #24 (Gigel filter) â€” feature decisions filter permanent
- #25 (Bloodwork OUT) â€” closed forever
- #26 (Tier-based personalization) â€” architectural pattern
- #27 (Co-CTO real-time decision filter) â€” working brain pattern
- #28 (Daniel cognitive mode) â€” IQ ~139 Mensa, ADHD 2e, sequential decisions only, sloppy expression â‰  degraded thinking, NU burnout pattern
- Memory cleanup compactare 30 â†’ 28 entries (-2 duplicates, +1 cognitive critical)

---


