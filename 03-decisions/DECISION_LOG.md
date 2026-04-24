# DECISION LOG — SalaFull

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

**Next:** FAZA 3 — Infrastructure + Observability — plan complet în [[FAZA_3_ROADMAP]]

Raport complet: [[FAZA_2_FINAL_REPORT]]

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
- [[EXEC_QUEUE]] + [[EXEC_RESULTS]] — async execution protocol (vezi [[ASYNC_EXECUTION_PROTOCOL]])
- Daniel = PM, Opus = Co-CTO (planning), Sonnet = executor (cod)

**Decizii cheie:**
- OPT B în 1.6 (sessionBuilder delete vs implement) — scope FAZA 1 = infrastructure, nu features
- AA notes-only — RPE logic producea false INCREASE deoarece rpe:8 era hardcoded, nu colectat
- slice 5000 (nu remove cap, nu tierStorage) — optimal FAZA 1: 4 caractere, 1.5+ ani headroom
- Rules v1 path-restricted (nu auth Firebase) — auth e FAZA 4

**Next:** FAZA 2 — Priority 1 = sessionBuilder real (context-aware selection), detaliat în [[FAZA_2_ROADMAP]]

Raport complet: [[FAZA_1_FINAL_REPORT]]

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

**Risc acceptat:** FAZA 1.5 (ctx.allLogs real) nu va avea impact vizibil până la FAZA 2 Priority 1. Documentat explicit ca prima prioritate FAZA 2 în [[FAZA_2_ROADMAP]].

**Commits FAZA 1.6:** d2dd940 (audit), + commit curent (OPT B exec)

---

## 2026-04-24 — FAZA 1.3 Log Schema Cleanup (DONE)

**Scope:** Curățare schema loguri, eliminare fallback-uri moarte, fix bug-uri schema.
**Surprise:** Audit a găsit că NU e nevoie de migration one-shot. Schema actuală e OK, doar are fallback-uri moarte + 1 bug activ (adherence M2).

**Ce s-a făcut:**
- Task #9: Audit schema — 7 mismatches identificate (M1–M7) → [[LOG_SCHEMA_AUDIT_1_3]]
- Task #10: Fix M2 (adherence __early_stop__ filter) — bonus: reparat și 1 e2e test failing
- Task #11: Eliminare fallback-uri moarte (l.weight/l.exercise/l.timestamp) din 10 fișiere + creat logNormalize.js
- Task #12: Consolidare M3-M7 — omis rpe fals, aliniat sessLog.kg→w, eliminat userOverride dead

**Validare:** Teste baseline menținute. 216 unit tests pass (vs 41 e2e inițial).
**Commits:** 79081d1, 894e341, 28fe2b9, + commit curent

---

## 2026-04-24 — FAZA 1.2 Multi-tenancy Decouple (DONE)

**Scope:** Elimina Daniel-hardcoded values din codebase. Audit: [[HARDCODED_AUDIT_1_2]]
**Approach:** Scope minim + defaults.js + localStorage override (NU multi-user Firebase — asta vine în FAZA 4).

**Ce s-a făcut (3 tasks, 14 fișiere):**
- Task #4: src/config/user.js creat cu USER_DEFAULTS + getUserConfig/updateUserConfig
- Task #5: sys.js + coachContext.js refactor să folosească getUserConfig()
- Task #6: TARGET/DATE/PATH centralizate în constants.js + firebase.js

**Validare:** Teste baseline menținute. Zero regresii. Deploy live.

**Commits:** 39b9899, b89e3e9, 4d7a4a9
