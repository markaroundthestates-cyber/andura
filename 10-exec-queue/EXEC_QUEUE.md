# Exec Queue

Task-uri pending pentru execuție de către Claude Code.
Protocol: `09-workflows/ASYNC_EXECUTION_PROTOCOL.md`

**Trigger:** scrie "check queue" sau "run task #N" în conversație.

---

<!--
TEMPLATE — copiază blocul de mai jos pentru fiecare task nou:

## TASK #N
**Model:** Sonnet | Opus
**Priority:** HIGH | MEDIUM | LOW
**Status:** PENDING
**Created:** YYYY-MM-DD HH:MM
**Description:** [ce trebuie făcut — suficient de clar pentru execuție fără întrebări]
**Acceptance:** [criterii concrete și verificabile pentru DONE]
**Dependencies:** TASK #X | NONE
**Tags:** [NIGHT] | [CONFIRM] | [DESTRUCTIVE] | —

---
-->

<!-- Adaugă task-uri mai jos: -->

## TASK #1
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24 14:02
**Description:** Update 00-index/INDEX_MASTER.md — schimbă status FAZA 1.1 din "🔜 IN PROGRESS" în "✅ COMPLETE (24 apr 2026)". Adaugă în continuare detalii: "9 module + orchestrator live, zero regresii, merged în main commit 9875755". Update și header "Ultima actualizare" la 24 apr 2026.
**Acceptance:** INDEX_MASTER.md reflectă status actualizat, git commit + push pe main.
**Dependencies:** NONE

---

## TASK #2
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** Înlocuiește complet conținutul 00-index/INDEX_MASTER.md cu versiunea nouă (SALAFULL VAULT — INDEX MASTER) care include navigare rapidă, faze complete, concept produs, infrastructură live, workflow vault, contact AI, git sync status.
**Acceptance:** INDEX_MASTER.md exact ca versiunea specificată, git commit + push pe main.
**Dependencies:** NONE

---

## TASK #3
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** Audit hardcoded Daniel-specific values în codebase. Grep exhaustiv în src/ pentru: "110.4", "1800", "180g"/"180 g", "2026-07-20", "users/daniel", "22.6", "1.83"/"1.85", "Daniel", alte numere magice user-specific. Pentru fiecare match: fișier + linie, context 2 linii, categorie USER_DATA|TARGET|PATH|DATE|OTHER. Creează docs/HARDCODED_AUDIT_1_2.md cu summary, findings table, recommendations.
**Acceptance:** docs/HARDCODED_AUDIT_1_2.md creat, git commit + push pe main.
**Dependencies:** NONE

---

## TASK #4
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.2 Step 1 — Creează src/config/user.js cu USER_DEFAULTS + getUserConfig() + updateUserConfig(). NU modifică alte fișiere. Scrie test src/config/__tests__/user.test.js (minim 2 teste).
**Acceptance:** src/config/user.js + test creat, build zero erori, test:all pass, git commit + push.
**Dependencies:** NONE

---

## TASK #5
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.2 Step 2 — Refactor sys.js + coachContext.js să folosească USER_DEFAULTS din src/config/user.js. sys.js: import getUserConfig, înlocuiește HEIGHT/AGE/START_BF/START_KG cu getUserConfig().bio.*. coachContext.js: înlocuiește fallback 110.4 + targetWeight:101.5. Zero schimbare comportamentală. Verificare grep la final.
**Acceptance:** sys.js + coachContext.js folosesc getUserConfig(), build clean, baseline teste menținute, grep benign, git commit + push.
**Dependencies:** TASK #4 DONE ✅

---

## TASK #6
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.2 Step 3 — Elimină inline duplicates TARGET (1800/180/101.5), DATE (2026-07-20), PATH (users/daniel). Folosește constants.js + getUserConfig() ca surse unice. Zero schimbare comportamentală.
**Acceptance:** Zero inline duplicates, build clean, baseline teste menținute, grep centralizat, git commit + push.
**Dependencies:** TASK #4 + TASK #5 DONE ✅

---

## TASK #7
**Model:** Sonnet
**Priority:** LOW
**Status:** DONE
**Created:** 2026-04-24
**Description:** Actualizează vault după finalizare FAZA 1.2. INDEX_MASTER.md: 1.2 → ✅ DONE, status header update. DECISION_LOG.md: adaugă entry FAZA 1.2 cu scope, approach, ce s-a făcut, commits.
**Acceptance:** 2 fișiere updatate, git commit + push pe main.
**Dependencies:** TASK #6 DONE ✅

---

## TASK #8
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.4 — Fix cleanDuplicateLogs: dedupe strict pe timestamp (±2s), NU pe business fields. Seturi legitime cu same ex+kg+reps trebuie păstrate dacă timestamps diferite.
**Acceptance:** dataCleanup.js fixed, test nou acoperă cazul, build + baseline menținut, git commit + push.
**Dependencies:** NONE

---

## TASK #9
**Model:** Sonnet
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.3 AUDIT — Log schema actual + plan migration (ZERO execuție, doar audit).

Referință: docs/AUDIT_BULLETPROOF_23APR.md — issues schema loguri, audit coach finding C4c (Dedupe colapse 2/3 seturi).

SCOPE: Doar audit + plan. NU atinge cod, NU modifica loguri, NU migrate.

PAȘI:

1. Analizează schema loguri actuală:
   - Caută toate locurile unde se CREEAZĂ un log (DB.set cu key-uri care conțin 'logs', push la arrays de loguri, etc.)
   - Pentru fiecare loc: ce fields se setează? (ex, w, reps, rpe, ts, date, session, phase, set_number, etc.)
   - Identifică fields OPTIONAL vs REQUIRED în practică
   - Identifică INCONSISTENȚE: același logical field cu nume diferite (ex: "w" vs "weight", "ex" vs "exercise", "ts" vs "timestamp")

2. Analizează schema loguri CITITĂ:
   - Caută toate locurile unde se CITESC loguri
   - Ce fields sunt așteptate să existe?
   - Există fallbacks (ex: l.w ?? l.weight)?

3. Identifică mismatch-uri:
   - Fields scrise dar niciodată citite (dead data)
   - Fields citite dar nu întotdeauna scrise (bug risk)
   - Fields cu tipuri inconsistente (uneori string, uneori number)

4. Creează docs/LOG_SCHEMA_AUDIT_1_3.md cu secțiunile: Schema actuală (DE FACTO), Schema propusă (TARGET), Mismatches găsite, Migration plan, Risk assessment.
**Acceptance:** docs/LOG_SCHEMA_AUDIT_1_3.md creat cu toate secțiunile, NU modifică cod, git commit + push pe main.
**Dependencies:** NONE

---

## TASK #10
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.3 Fix M2 — adherence.js nu filtrează __early_stop__ marker.

Referință: docs/LOG_SCHEMA_AUDIT_1_3.md secțiunea Mismatches, finding M2.

PAȘI:
1. Citește src/engine/adherence.js — identifică unde se contorizează workout sets.
2. Adaugă filter pentru __early_stop__: loguri cu ex === '__early_stop__' NU trebuie să conteze ca workout sets legitime. Folosește filterValidLogs dacă există în src/util/logFilter.js, altfel filter inline.
3. Scrie test: Input: 3 loguri normale + 1 log cu ex='__early_stop__'. Expected: adherence score calculat pe 3 loguri (nu 4).
4. Verificare: npm run build — zero erori. npm run test:all — baseline menținut + test nou pass.
**Acceptance:** adherence.js filtrează __early_stop__, test nou acoperă cazul, git commit + push pe main.
**Dependencies:** TASK #9 DONE ✅

---

## TASK #11
**Model:** Sonnet
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.3 Fix M1 — Elimină fallback-uri moarte (l.weight, l.exercise, l.timestamp). Creează src/util/logNormalize.js cu normalizeLog(). NU aplica normalizeLog la call sites acum.
**Acceptance:** Fallback-uri moarte (.weight/.exercise/.timestamp) eliminate, logNormalize.js creat, build + teste baseline menținut, git commit + push pe main.
**Dependencies:** TASK #10 DONE ✅

---

## TASK #12
**Model:** Sonnet
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.3 Fix M3-M7 — Consolidare consistență schema. M3: omite rpe fals din logging.js. M4: tipuri consistente. M5: elimina userOverride dead. M6: aliniere sessLog (kg→w). M7: deja rezolvat. Update INDEX_MASTER + DECISION_LOG.
**Acceptance:** M3-M7 rezolvate, INDEX_MASTER + DECISION_LOG actualizate, build + teste OK, git commit + push pe main.
**Dependencies:** TASK #11 DONE ✅

---

## TASK #13
**Model:** Sonnet
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.5 AUDIT — ctx.allLogs calibration fix plan (ZERO execuție). Identifică unde se construiește ctx.allLogs, unde e folosit, impact, edge cases. Creează docs/CTX_ALLLOGS_AUDIT_1_5.md.
**Acceptance:** docs/CTX_ALLLOGS_AUDIT_1_5.md creat cu toate secțiunile, zero modificări cod, git commit + push pe main.
**Dependencies:** NONE

---

## TASK #14
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.7 — AA Engine decizie: activate sau delete. Citește aa.js, decide ACTIVATE (minimal viable) sau DELETE (clean), implementează.
**Acceptance:** Decizie luată și implementată, teste pass, build clean, git commit + push.
**Dependencies:** TASK #12 DONE ✅

---

## TASK #15
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.5 — Fix ctx.allLogs calibration. Expune allLogs în buildCoachContext, înlocuiește derivarea din recentLogs.flatMap în coachDirector. Teste: ctx.allLogs conține full history, calibration nu returnează COLD_START pentru 80+ sesiuni.
**Acceptance:** Fix aplicat, 2+ teste noi, build clean, git commit + push. Marchează FAZA 1.5 DONE în INDEX_MASTER.
**Dependencies:** TASK #13 DONE ✅

---

## TASK #16
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.6 AUDIT — sessionBuilder scope + decizie. Zero modificări cod.
**Acceptance:** docs/SESSIONBUILDER_AUDIT_1_6.md creat cu 3 opțiuni + recomandare, zero modificări cod, git commit + push.
**Dependencies:** NONE

---

## TASK #17
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.6 — Cleanup sessionBuilder dead code (OPT B). Șterge sessionBuilder.js, elimină dynamic import + null check din coachDirector. Creează docs/FAZA_2_ROADMAP.md. Update DECISION_LOG + INDEX_MASTER.
**Acceptance:** sessionBuilder.js șters, imports curate, FAZA_2_ROADMAP.md creat, vault actualizat, build + teste OK, git commit + push.
**Dependencies:** TASK #16 DONE ✅

---

## TASK #18
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.8 AUDIT — Firebase security + sync cap (ZERO execuție). Audit exhaustiv: credentials expuse, rules curente, sync cap .slice(0,500), plan migration single-user + multi-user, safety nets. Creează docs/FIREBASE_AUDIT_1_8.md.
**Acceptance:** docs/FIREBASE_AUDIT_1_8.md creat exhaustiv, zero modificări cod/config, git commit + push.
**Dependencies:** NONE

---

## TASK #19
**Model:** Sonnet
**Priority:** CRITICAL
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1.8 Step 1 — Fix data loss critical (.slice(0, 500) → 5000). Creează src/util/logBackup.js cu backupLogsToLocal + restoreLogsFromBackup. Fix în 4 locații: logging.js, session.js, firebase.js, onboarding.js.
**Acceptance:** 4 locații fixed, logBackup.js creat + testat, build + teste pass, git commit + push.
**Dependencies:** TASK #18 DONE ✅

---

## TASK #20
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 1 FINAL — Update vault + raport închidere completă. INDEX_MASTER (FAZA 1 COMPLETE), DECISION_LOG (entry final), FAZA_2_ROADMAP (priorități), FAZA_1_FINAL_REPORT.md (creat).
**Acceptance:** 4 fișiere actualizate/create, git commit + push.
**Dependencies:** FAZA 1.0-1.8 DONE ✅

---

## TASK #21
**Model:** Sonnet
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 2 AUDIT COMPLET — toate prioritățile, plan executabil. Citește FAZA_2_ROADMAP + audit findings (C2c, C3c, H4c, H6c, H9c, H11c, M3g, H13g, H14g, M7c, P1 sessionBuilder). Creează docs/FAZA_2_EXECUTION_PLAN.md cu plan detaliat + task list ready-to-queue.
**Acceptance:** docs/FAZA_2_EXECUTION_PLAN.md creat, zero modificări cod, git commit + push.
**Dependencies:** FAZA 1 DONE ✅

---

## TASK #21bis
**Model:** Opus (STRICT)
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** FAZA 2 AUDIT — re-audit critic cu Opus. Review docs/FAZA_2_EXECUTION_PLAN.md (Sonnet), adaugă deeper root cause, connections, architectural implications, challenge prioritizare, sessionBuilder deep-dive, production readiness. Creează docs/FAZA_2_OPUS_REVIEW.md.
**Acceptance:** FAZA_2_OPUS_REVIEW.md creat, zero cod modificat, git commit + push.
**Dependencies:** TASK #21 DONE ✅

---

## TASK #22a
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** CRITICAL
**Status:** DONE
**Created:** 2026-04-24
**Description:** Tier 0 Data Integrity — fix C4c (confirmReps missing set+kg fields → dedupe collapse) + C5c (endSession auto-delete <5min removed). Backup logs înainte. Teste noi.
**Acceptance:** C4c+C5c fixed, tests pass, build clean, git commit + push.
**Dependencies:** TASK #21bis DONE ✅

---

## TASK #22b
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** P2 batch simple — H11c + C3c + H6c.
H11c: adaugă 6 keys lipsă la COACH_RELEVANT_KEYS în firebase.js:118 ('unavailable-equipment','equipment-occupied-session','applied-patterns','session-burns','early-stops','workout-skips').
C3c: adaugă window._ratingSessionInFlight guard la rateSession în rating.js:57 — funcția returnează imediat dacă flag=true, setează flag la start, șterge la final (indiferent de eroare).
H6c: adaugă _patternAnalyzeInFlight guard la analyzeAndApplyPatterns în patternLearning.js — setTimeout-ul din _analyze nu rulează dacă flag=true.
Minim 3 teste noi.
**Acceptance:** 3 fixes aplicate, 3+ teste noi, build clean, 236+ teste pass, git commit + push.
**Dependencies:** TASK #22a DONE ✅

---

## TASK #22c
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** session.js batch — C2c cancelWorkout + H4c resume.
C2c: cancelWorkout adaugă clearDraft(), teardownInactivity(), releaseWakeLock() + resetează completedExercises, dropSetUsedThisSession, earlyStopReason, sessionKgOverride, activeNotes.
H4c: resume path derivă completedExercises din sessLog (exerciții cu n >= EX_SETS[ex] || 3 seturi) în loc de new Set() gol.
Minim 2 teste noi.
**Acceptance:** C2c+H4c fixed, 2+ teste noi, build clean, 236+ teste pass, git commit + push.
**Dependencies:** TASK #22b DONE ✅

---

## TASK #22d
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** Engines batch — isoWeek ISO 8601 Thursday rule + H14g checkRecoveryGroups.
isoWeek: implementează regula Thursday (ISO 8601) în stagnationDetector.js + responseProfile.js — înlocuiește ambele implementări incorecte.
H14g: fix checkRecoveryGroups în proactiveEngine.js — calculează daysSinceLast direct din logs, nu din getMuscleState() care returnează număr, nu obiect.
Minim 3 teste (isoWeek Dec29/Jan1 boundary + checkRecoveryGroups returnează alerte reale).
**Acceptance:** 2 isoWeek fixes, H14g fix, 3+ teste, build clean, 236+ teste pass, git commit + push.
**Dependencies:** TASK #22c DONE ✅

---

## TASK #22e
**Model:** Sonnet
**Type:** REFACTOR
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** sessionBuilder OPT C — extrage fallbackSessionBuilder din CoachDirector ca pure function.
Creează src/engine/sessionBuilder.js cu export function buildSession(sessionType, ctx).
Actualizează coachDirector.js să importe + apeleze buildSession.
Minim 3 teste pentru buildSession (PUSH/CUT/RECOMP + edge case fără ctx.weakGroups).
**Acceptance:** sessionBuilder.js creat cu buildSession, coachDirector importă funcția, 3+ teste, build clean, 236+ teste pass, git commit + push.
**Dependencies:** TASK #22d DONE ✅

---

## TASK #22f
**Model:** Sonnet
**Type:** FEATURE
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** sessionBuilder OPT A restrâns — weakness-prioritized ordering (NU adaugă exerciții noi).
Reordonează exercițiile din buildSession (sessionBuilder.js) astfel încât exercițiile pentru weakGroups să apară pe pozițiile 1-2.
NU adaugă exerciții care nu sunt în lista statică curentă.
Adaugă comentariu: "Weakness-prioritized ordering. Does NOT add missing exercises."
Creează feature flag contextSelectionEnabled în calibration.js (default: false). Ordering se aplică doar dacă flag=true.
Teste: ctx.weakGroups=['delt_rear'] → exercițiu delt_rear în primele 2 poziții; dacă weakGroup nu e în sesiune → ordering original păstrat.
**Acceptance:** Ordering logic implementat, flag creat, 2+ teste, build clean, 236+ teste pass, git commit + push.
**Dependencies:** TASK #22e DONE ✅

---

## TASK #22g
**Model:** Sonnet
**Type:** VAULT
**Priority:** LOW
**Status:** DONE
**Created:** 2026-04-24
**Description:** Vault update FAZA 2 — închidere completă.
INDEX_MASTER.md: FAZA 2 → ✅ COMPLETE (24 apr 2026), update header "Ultima actualizare".
DECISION_LOG.md: adaugă entry FAZA 2 COMPLETE cu scope, approach, commits cheie.
Creează docs/FAZA_2_FINAL_REPORT.md cu summary complet.
Actualizează docs/FAZA_2_ROADMAP.md cu status final.
**Acceptance:** 4 fișiere actualizate/create, git commit + push.
**Dependencies:** TASK #22f DONE ✅

---

## TASK #23
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** LOW
**Status:** DONE
**Created:** 2026-04-24
**Description:** Update docs/FAZA_3_ROADMAP.md (creează dacă nu există) cu MCP integrations prioritized. Structura completă: P1 MCP Integrations (Playwright/Sentry/GitHub/Context7), P2 Observability, P3 CI/CD hardening, P4 Health integrations, Deferred. Update 00-index/INDEX_MASTER.md: link la FAZA_3_ROADMAP.md în secțiunea Navigare rapidă.
**Acceptance:** FAZA_3_ROADMAP.md creat cu structura specificată, INDEX_MASTER updatat, git commit + push.
**Dependencies:** FAZA 2 DONE ✅

---

## TASK #24
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** HIGH
**Status:** DONE
**Created:** 2026-04-24
**Description:** CI cleanup batch — fix 3 workflow-uri care pică din motive pre-existente: EBADPLATFORM esbuild netbsd-arm64, QA Report 403 permissions, data-integrity e2e test.
**Acceptance:** 3 fix-uri aplicate (sau 2+1 skip justificat), CI curat pe next run, git commit + push.
**Dependencies:** TASK #23 DONE ✅

---

## TASK #24c
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** MEDIUM
**Status:** DONE
**Created:** 2026-04-24
**Description:** Vault wikilinks densification + OBSIDIAN_SETUP_GUIDE.md — transformă vault în graf dens pentru Obsidian Graph View.
**Acceptance:** +50 wikilinks adăugate, OBSIDIAN_SETUP_GUIDE.md creat, git commit + push.
**Dependencies:** TASK #24 DONE ✅

---

## TASK #24d
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** HIGH
**Status:** DONE ✅
**Created:** 2026-04-24
**Completed:** 2026-04-24
**Description:** Diagnostic sync vault Obsidian vs GitHub — creează VAULT_SYNC_DIAGNOSTIC.md cu lista completă fișiere .md pe main, commits azi, instrucțiuni pull forțat pentru Daniel.
**Acceptance:** VAULT_SYNC_DIAGNOSTIC.md creat, raport terminal, git commit + push.
**Dependencies:** TASK #24c DONE ✅
**Result:** docs/VAULT_SYNC_DIAGNOSTIC.md creat — 33 fișiere inventariate, 15 commits azi, 3 metode pull, troubleshooting auth/conflict/detached-HEAD.

---

## TASK #24e
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** HIGH
**Status:** DONE ✅
**Created:** 2026-04-24
**Completed:** 2026-04-24
**Description:** Vault consolidation — verifică repo salafull-vault vs salafull, actualizează referințe, creează VAULT_CONSOLIDATION_GUIDE.md cu pași Windows pentru Daniel.
**Acceptance:** Status salafull-vault raportat, referințe actualizate, docs/VAULT_CONSOLIDATION_GUIDE.md creat, git commit + push.
**Dependencies:** TASK #24d DONE ✅
**Result:** salafull-vault repo → 404 (nu există). 0 referințe "salafull-vault" în docs. VAULT_CONSOLIDATION_GUIDE.md creat cu clone fresh + Obsidian Git config. INDEX_MASTER actualizat cu secțiune Vault Setup.

---

## TASK #24f
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** LOW
**Status:** DONE ✅
**Created:** 2026-04-24
**Completed:** 2026-04-24
**Description:** Obsidian Graph View visual config — colors per folder + layout optim. Creează .obsidian/graph.json cu 14 colorGroups.
**Acceptance:** .obsidian/graph.json scris, JSON valid, git commit + push.
**Dependencies:** TASK #24e DONE ✅
**Result:** .obsidian/graph.json creat — JSON valid, 14 colorGroups, textFadeMultiplier 0, nodeSize 1.2x, linkDistance 250. Daniel: Ctrl+P → "Reload app without saving" în Obsidian.

---

## TASK #24g
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** HIGH
**Status:** DONE ✅
**Created:** 2026-04-24
**Completed:** 2026-04-24
**Description:** Document QA findings 24 apr 2026 evening — input pentru Task #25 Opus Audit. Creează QA_MANUAL_24APR_2230.md + FINDINGS_MASTER.md cu status real.
**Acceptance:** QA_MANUAL_24APR_2230.md creat, FINDINGS_MASTER updated, commit + push.
**Dependencies:** TASK #24f DONE ✅
**Result:** 07-sessions-log/QA_MANUAL_24APR_2230.md + 06-findings-tracker/FINDINGS_MASTER.md create. 3 OPEN: C10c (CRITICAL cache loop), H30c (pattern false positives), H31c (reset incomplet). 15 FIXED marcate din FAZA 1+2. INDEX_MASTER actualizat.

---

## TASK #25
**Model:** Opus
**Type:** AUDIT
**Priority:** CRITICAL
**Tag:** [NIGHT]
**Status:** DONE ✅
**Created:** 2026-04-25
**Completed:** 2026-04-25
**Description:** Nuclear Opus Audit v3 — adversarial, evidence-based, challenge-everything. Output: docs/OPUS_NUCLEAR_AUDIT_25APR.md cu 13 secțiuni + VERDICT binar + 20+ task-uri pre-queued + anti-reîncălzire (3+ probleme noi).
**Acceptance:** OPUS_NUCLEAR_AUDIT_25APR.md complet, zero TBD, evidence file:line, INDEX_MASTER + DECISION_LOG updated, commit + push.
**Dependencies:** TASK #24g DONE ✅
**Result:** 1532 linii, 13 secțiuni cu VERDICT, 24 tasks ready-to-queue (TASK #26-49, 5 tiers), 7 probleme NOI (depășește target anti-reîncălzire 3), 5 FALSE/HALF DONE expuse din FAZA 1+2. TOP 5 blockers: C10c cache cascade, H31c reset spec gap, H30c pattern bypass, multi-tenancy fake, observability blackhole. VERDICT FINAL: FAIL — 4-6 luni până launch.

---

## TASK #26 — C10c Cache Invalidation Coalesce
**Model:** Sonnet
**Type:** BUG_FIX
**Priority:** CRITICAL
**Status:** DONE ✅
**Created:** 2026-04-25
**Completed:** 2026-04-25
**Description:** Fix cache invalidation cascade din firebase.js. Pe syncFromFirebase, 11 DB.set calls invalidează director cache 11×. Adaugă suppressInvalidations(fn) wrapper + debounce 250ms pe invalidate() trigger.
**Acceptance:** syncFromFirebase produce ≤ 1 invalidare netă. Test cache-coalesce cu spy pe invalidate. Build + 271 teste existente verzi.
**Dependencies:** TASK #25 DONE ✅
**Result:** firebase.js: `suppressInvalidations(fn)` batch mode + debounce 250ms pe invalidare reactiv (DB.set-triggered). syncFromFirebase wrapped în suppressInvalidations → 11 writes = 1 invalidare. Direct invalidate() bypass (unchanged semantics pt dataCleanup). Test nou: 7 cazuri (batch fold, no-invalidation-irrelevant, nested, throws-still-flushes, debounce, second-burst, direct-bypass). 271 → 278 teste, zero regresii. Build green.

---

## TASK #27a — QA Report 25 APR 2026 (Post C10c fix)
**Model:** Sonnet
**Type:** CLEANUP
**Priority:** HIGH
**Status:** DONE ✅
**Created:** 2026-04-25
**Completed:** 2026-04-25
**Description:** Document QA findings Daniel live testing post-FAZA 2 + Task #26. Creează QA_MANUAL_25APR_POSTFIX.md cu validare C10c + bug-uri noi (reset cascade, rerun onboarding, ocupat persist) + FR1-4.
**Acceptance:** QA_MANUAL_25APR_POSTFIX.md creat, FINDINGS_MASTER updated cu BUG A (reset cascade CRITICAL) + rerun onboarding (HIGH), commit + push.
**Dependencies:** TASK #26 DONE ✅
**Result:** QA_MANUAL_25APR_POSTFIX.md creat. C10c ✅ VALIDAT (12+ → 1 invalidare pe Firebase sync). Noi: **C11c CRITICAL** (reset cascade 12+ invalidări — Task #26 fix nu acoperă reset flow), **H32c HIGH** (Rerun onboarding down post-reset). FINDINGS_MASTER: 16 FIXED (+C10c), 4 OPEN (C11c, H30c, H31c, H32c). FR1-4 queued pt FAZA 4. Next: Task #27 cu scope EXTENDED (registry + coalesce reset flow + investigate onboarding).

---

## TASK #27 — Data Registry + Full Reset Rewrite (C11c / H31c / H32c)
**Model:** Sonnet
**Type:** BUG FIX + REFACTOR
**Priority:** CRITICAL
**Status:** DONE ✅
**Created:** 2026-04-25
**Completed:** 2026-04-25
**Description:** 7-part task: (A) `src/util/dataRegistry.js` — central localStorage key registry; (B) `fullReset` rewrite — whitelist (`localStorage.clear()` + PRESERVE list) instead of blacklist; (C) C11c — replace 4 direct `invalidate()` calls in dataCleanup with `scheduleInvalidation()`; (D) H32c — `__suppressFirebaseSyncUntil` in localStorage (survives reload) + check in syncFromFirebase; (E) feature flag `window.__dataRegistryEnabled`; (F) DATA_REGISTRY_SPEC.md + FINDINGS_MASTER; (G) 12+ tests.
**Acceptance:** 301+ tests pass · dataRegistry.js canonical source of truth · fullReset clears dynamic keys (ex-extra-sets-*, muscle-extra-*, aa-cooldown-*) · device-id/active-theme preserved · __suppressFirebaseSyncUntil gate in syncFromFirebase · FINDINGS_MASTER: C11c+H31c+H32c FIXED.
**Dependencies:** TASK #27a DONE ✅
**Result:** 301 tests (23 new). C11c FIXED (scheduleInvalidation replaces 4 direct invalidate() calls). H31c FIXED (localStorage.clear() whitelist, all dynamic keys cleared). H32c FIXED (__suppressFirebaseSyncUntil survives reload, prevents stale Firebase pull post-reset). COACH_RELEVANT_KEYS moved to dataRegistry.js (firebase.js imports from there). scheduleInvalidation exported. docs/DATA_REGISTRY_SPEC.md created. Next: Task #28 + #29 (H30c pattern false positives).

---
# EXEC_QUEUE — TASK #30 ENTRIES (Coach Decision Log Implementation) — FINAL

**Adaugă acest bloc în `10-exec-queue/EXEC_QUEUE.md` după ultimul TASK existent.**

**Reference contract:** [[011-coach-decision-log-architecture]] — ADR 011, status Accepted 25 Apr 2026.

---

## TASK #30 — Coach Decision Log (CDL) Implementation
**Type:** ARCHITECTURE
**Priority:** CRITICAL
**Status:** PENDING (umbrella — broken into 30.1 through 30.10)
**Created:** 2026-04-25
**Description:** Implementation umbrella pentru ADR 011 — Coach Decision Log ca primitive arhitectural. Înlocuiește H30c (banner bypass) ca fix izolat cu refactor structural. Supersedes Task #28 (H30c) and Task #29 (patternLearning calendar→plan days) — ambele se rezolvă natural prin CDL adoption.

Subtasks executate secvențial cu Daniel gates între ele:
- 30.1 — ADR 011 push (manual de Daniel, nu Sonnet)
- 30.2 — coachDecisionLog.js primitive + 16+ tests
- [DANIEL GATE A]
- 30.3 — cdlBackfill.js + 10-sample validation hook + skipped entries handling
- [DANIEL GATE B]
- 30.4 — coachDirector integration (proposed write) + CDL write failure handling
- 30.5 — endSession + cancelWorkout (outcome population, handles cdlEntryId null)
- [DANIEL GATE C]
- 30.6 — patternLearning reads CDL (parallel write applied-patterns)
- 30.7 — adherence.js rewrite
- [DANIEL GATE D — parallel period start]
- 30.8 — renderIdle banner (CDL-sourced + suppression + new pattern UI strings)
- [DANIEL GATE E — decommission triggers met]
- 30.9 — Decommission applied-patterns (clean break)
- 30.10 — H30c closed în FINDINGS_MASTER

**Acceptance:** Toate 10 subtasks DONE, ADR 011 contract respectat în cod, H30c closed, FINDINGS_MASTER updated, EXEC_RESULTS contains all gate sign-offs.
**Dependencies:** ADR 011 ACCEPTED și pushed în repo

---

## TASK #30.1 — ADR 011 Push to Repo
**Model:** Daniel (manual, no Sonnet)
**Type:** DOCS
**Priority:** CRITICAL
**Status:** PENDING
**Created:** 2026-04-25
**Description:** Push ADR 011 (artifact furnizat de Co-CTO chat) la `docs/decisions/011-coach-decision-log-architecture.md`. Contract pentru toate subtasks 30.2-30.10.

PAȘI Daniel:
1. Salvează artifact-ul ADR 011 în Downloads ca `011-coach-decision-log-architecture.md`
2. PowerShell:
   ```powershell
   cd C:\Users\Daniel\Documents\salafull
   Copy-Item C:\Users\Daniel\Downloads\011-coach-decision-log-architecture.md docs\decisions\011-coach-decision-log-architecture.md -Force
   git add docs/decisions/011-coach-decision-log-architecture.md
   git commit -m "docs(adr): ADR 011 - Coach Decision Log (CDL) as architectural primitive"
   git push
   ```
3. Verifică în GitHub că fișierul apare în `docs/decisions/`

**Acceptance:** ADR 011 file pushed la `docs/decisions/011-coach-decision-log-architecture.md`, commit hash în EXEC_RESULTS, sub-task marked DONE.
**Dependencies:** NONE

---

## TASK #30.2 — coachDecisionLog.js Primitive + Tests
**Model:** Sonnet
**Type:** EXEC
**Priority:** CRITICAL
**Status:** DONE ✅
**Created:** 2026-04-25
**Description:** Creează `src/util/coachDecisionLog.js` ca primitive CDL conform schema și regulilor din ADR 011 (`docs/decisions/011-coach-decision-log-architecture.md`). Citește ADR 011 înainte de implementare — schema, idempotency rules, matchScore gate, TierStorage, Firebase sync sunt toate specificate acolo.

API publică:
- `writeProposed(entry)` — scrie entry nou cu idempotency check (4h + key context unchanged → return existing; significant change → mark superseded + create new with supersedes ref)
- `populateOutcome(date, outcome)` — populează `outcome` pe most-recent non-superseded entry pentru `date`. Outcome immutable după populare.
- `readActiveForDate(date)` — return most-recent non-superseded entry pentru `date`
- `readAllActive(filterFn)` — return entries non-superseded matching optional filter
- `readSupersedeChain(entryId)` — audit-only, return chain de superseded entries
- `computeMatchScore(proposed, actual)` — gate logic: deviation → null, else 0.6×volumeRatio + 0.4×exerciseOverlap (Jaccard)
- `demoteToTier2()` + `demoteToTier3()` — TierStorage demotion (transactional, called din `initAutoBackup`)
- Helpers private: `isKeyContextChanged(oldCtx, newCtx)` (delta readiness > 20, weakGroups changed, calibrationLevel changed, isInCut flip, predictionToday.isHighRisk flip)

Storage:
- localStorage keys: `coach-decisions`, `coach-decisions-aggregate`, `coach-decisions-archive`
- Firebase sync: adăugare la `SYNC_KEYS` în `firebase.js`
- Honor `_suppressFirebaseSync` flag (existing pattern din logs)

Stable Rule IDs:
- `rationale.winnerId` referențiază IDs din `RULES` const în `src/engine/ruleEngine.js` — verified existing
- Reserved: `SYNTHETIC_BACKFILL`, `NO_PROPOSED` — pentru subtask 30.3 și edge cases

Tests (`src/util/__tests__/coachDecisionLog.test.js`) — minim 16 cazuri, mandatory:
1. writeProposed creates entry with valid schema
2. writeProposed within 4h + same context returns existing (no duplicate)
3. writeProposed after readinessScore delta > 20 → marks old superseded + creates new with supersedes ref
4. writeProposed after weakGroups change → supersedes
5. writeProposed after calibrationLevel transition → supersedes
6. populateOutcome targets most recent non-superseded entry
7. populateOutcome on entry with outcome already set throws (immutability)
8. populateOutcome with deviation=true sets matchScore=null
9. computeMatchScore returns null when sessionType differs (gate test)
10. computeMatchScore returns weighted result when sessionType matches
11. readActiveForDate filters out superseded entries
12. readSupersedeChain returns full chain in chronological order
13. demoteToTier2 moves entries older than 180 days, drops fields per schema
14. demoteToTier3 aggregates entries older than 1 year into monthly metrics
15. Concurrency: 2 simultaneous writeProposed calls for same date → only 1 active entry exists (idempotency)
16. Superseded chain: 3 supersedes within a day → readActiveForDate returns the latest, chain is reachable

Testing infrastructure:
- Mock `Date.now()` pentru deterministic time tests
- Mock `localStorage` (jsdom default OK)
- Mock Firebase sync (verify call but don't actually network)

Build + tests:
- `npm run build` — zero errors
- `npm run test:run` — 16+ new tests pass, zero existing tests break
- Zero `console.log` în implementation (use existing logger pattern)

Documentation in code:
- File header: comment block referencing ADR 011 + status
- JSDoc pe funcții publice cu schema reference
- Inline comment la idempotency check explaining the 4h + significant change rule

**Acceptance:**
- `src/util/coachDecisionLog.js` exists with all public API specified above
- `src/util/__tests__/coachDecisionLog.test.js` exists with 16+ tests, all pass
- `firebase.js` updated with new keys in SYNC_KEYS
- Build green, full test suite green (no regressions)
- Git commit message: `feat(cdl): TASK #30.2 — coachDecisionLog.js primitive + 16 tests (ADR 011)`
- Push to main

**Dependencies:** TASK #30.1 DONE ✅

---

## DANIEL GATE A — Post 30.2 Validation

**Required for TASK #30.3 to start.**

**Daniel sign-off requires ALL:**

1. **Build verification:**
   ```powershell
   cd C:\Users\Daniel\Documents\salafull
   npm run build
   ```
   Expected: zero errors, zero warnings new față de pre-CDL baseline.

2. **Test suite verification:**
   ```powershell
   npm run test:run
   ```
   Expected: 287+ tests pass (271 baseline + 16 noi minimum). Zero teste existente broken.

3. **Manual smoke test în browser DevTools console:**
   ```javascript
   // Open https://markaroundthestates-cyber.github.io/salafull/ în browser
   // F12 → Console
   
   const cdl = await import('/src/util/coachDecisionLog.js');
   
   // Test write
   const testEntry = {
     date: '2026-04-25',
     context: { calibrationLevel: 'PERSONALIZING', readinessScore: 75, isInCut: true, weakGroups: [] },
     proposed: {
       sessionType: 'PUSH',
       rationale: { winnerId: 'CUT_CONSERVATIVE', winnerPriority: 85, overridden: [] },
       exercises: ['Incline DB Press', 'Pec Deck'],
       volumeMultiplier: 0.9
     }
   };
   const written = cdl.writeProposed(testEntry);
   console.log('Written:', written);
   
   // Test read
   const read = cdl.readActiveForDate('2026-04-25');
   console.log('Read:', read);
   
   // Verify shape matches ADR 011 schema
   // Verify localStorage 'coach-decisions' contains entry
   console.log('Storage:', JSON.parse(localStorage.getItem('coach-decisions')));
   
   // Verify idempotency
   const second = cdl.writeProposed(testEntry);
   console.log('Second write same context:', second === written ? 'IDEMPOTENT OK' : 'BUG');
   
   // Cleanup
   localStorage.removeItem('coach-decisions');
   ```

4. **Schema validation:**
   - `written.id` matches pattern `cd_YYYY-MM-DD_HH:MM` sau similar unique
   - `written.synthetic === false`
   - `written.superseded === false`
   - `written.outcome === null`
   - `written.context` contains all fields from ADR 011 schema

5. **Firebase sync verification (optional but recommended):**
   - DevTools → Network tab
   - Reload after writeProposed
   - Verify PUT request to `coach-decisions` endpoint visible (or sync deferred per `_suppressFirebaseSync`)

6. **EXEC_RESULTS.md entry written by Daniel:**
   ```markdown
   ## TASK #30.2 — DONE ✅
   **Completed:** 2026-04-XX HH:MM
   **Daniel sign-off:** YES
   **Build:** ✅ zero errors
   **Tests:** XXX pass (was 271 baseline, +16 new)
   **Smoke test:** ✅ writeProposed/readActiveForDate/idempotency verified
   **Firebase sync:** ✅ visible în Network tab / ⏸ deferred per suppress flag
   **Commit:** <hash>
   **Issues:** NONE | <description>
   ```

**If any check fails:** TASK #30.2 returns to Sonnet with specific failure description. NO progression to 30.3 until all 6 items pass.

---

## TASK #30.3 — cdlBackfill.js + 10-Sample Validation Hook + Malformed Handling
**Model:** Sonnet
**Type:** EXEC
**Priority:** CRITICAL
**Status:** DONE ✅
**Created:** 2026-04-25
**Description:** Creează `src/util/cdlBackfill.js` care convertește `logs` istorice existente în CDL synthetic entries conform secțiunii "Backfill from existing logs" din ADR 011.

API publică:
- `runBackfill({ dryRun = false, force = false })` — main entry. Iterează prin sessions grouped by `session` timestamp, generează synthetic CDL entries, scrie în `coach-decisions` (sau dryRun mode → return entries fără write).
- `inferSessionType(exercises)` — reverse-infer sessionType din muscle groups ale exercițiilor (folosește `EXERCISE_MUSCLES` din `muscleMap.js`)
- `reconstructContext(sessionTs, allLogs)` — reconstruiește context retrospective: calibrationLevel la data aia (din logs count + days since first), isInCut din phase history, daysSinceLastSession calculabil. Fields ne-reconstructibile (readinessScore, weakGroups at moment) → null. Set `partial: true`.
- `synthesizeOutcome(sessionLogs)` — populate outcome direct din logs: `executed: true`, `deviation: false` (synthetic assumes match), counts și sets calculate.
- `getValidationSamples(count = 10)` — return random sample of synthetic entries pentru Daniel manual review (se folosește în GATE B).

`runBackfill` return shape:
```js
{
  entriesCreated: number,        // count of synthetic entries successfully written
  errors: [                       // hard failures during processing
    { sessionTs, error: <message>, stack? }
  ],
  skipped: [                      // logs/sessions skipped due to data quality
    { sessionTs, reason: 'missing ts' | 'no exercises' | 'invalid format' | 'unknown muscle group' | <other>, sessionData: <partial> }
  ]
}
```

Skipped entries handling:
- Sessions cu `ts` lipsă SAU `session` field lipsă → skipped, reason 'missing ts'
- Sessions cu `exercises` array gol sau toate exercițiile fără muscle group cunoscut → skipped, reason 'no exercises' / 'unknown muscle group'
- Logs cu shape neașteptat (ex: lipsește `ex`, `w`, `reps` simultan) → skipped, reason 'invalid format'
- Skipped NU înseamnă fail al backfill-ului overall — backfill continuă cu restul. Final `entriesCreated` reflectă doar succesele.
- Toate skipped entries logged cu detail suficient pentru Daniel să identifice ce log original le-a produs.

Schema entries synthetic:
- `synthetic: true`
- `proposed.rationale = { winnerId: 'SYNTHETIC_BACKFILL', winnerPriority: null, overridden: [] }`
- `context.partial: true` for fields ne-reconstructibile
- Read-only after creation (no further writes from this script)

Idempotency:
- `runBackfill` checks if any synthetic entries exist → if yes, throw error "Backfill already executed. Use { force: true } to re-run"
- `force: true` flag clears synthetic entries first then re-runs
- Real entries (synthetic: false) NEVER touched by backfill

Tests (`src/util/__tests__/cdlBackfill.test.js`) — minim 10 cazuri:
1. inferSessionType returns 'PUSH' for chest/shoulders/triceps exercises
2. inferSessionType returns 'PULL' for back/biceps exercises
3. inferSessionType returns 'LEGS' for quads/hamstrings/glutes
4. inferSessionType returns 'MIXED' for cross-cutting (full upper, etc.)
5. reconstructContext sets calibrationLevel correctly for date with N sessions / D days
6. reconstructContext sets context.partial = true
7. synthesizeOutcome derives correct counts from logs
8. runBackfill creates N entries from N session timestamps (idempotent — second call throws unless force)
9. getValidationSamples returns random subset (different on each call) of synthetic entries
10. **Skipped handling:** session with missing ts → entry skipped with reason 'missing ts', backfill continues; session with empty exercises → skipped with reason 'no exercises'; malformed log → skipped with reason 'invalid format'. Final result.skipped contains all 3.

Build + tests:
- `npm run build` — zero errors
- `npm run test:run` — full suite + 10+ new pass

**Acceptance:**
- `src/util/cdlBackfill.js` exists with API above (including return shape with errors + skipped)
- `src/util/__tests__/cdlBackfill.test.js` with 10+ tests passing (skipped handling test mandatory)
- Script runnable from DevTools console (window.runBackfill exposed for Daniel)
- Build + tests green
- Commit: `feat(cdl): TASK #30.3 — cdlBackfill.js + validation hook + malformed handling (ADR 011)`
- Push to main
- **DOES NOT auto-run backfill** — Daniel triggers it manually in GATE B

**Dependencies:** TASK #30.2 DONE ✅ + GATE A passed ✅

---

## DANIEL GATE B — Post 30.3 Backfill Execution + 10-Sample Review + Skipped Review

**Required for TASK #30.4 to start.**

**Daniel sign-off requires ALL:**

1. **Run backfill manually:**
   ```javascript
   // DevTools console
   const result = await window.runBackfill({ dryRun: false });
   console.log('Backfill result:', result);
   // Expected: { entriesCreated: ~20-30, errors: [], skipped: [...] }
   ```

2. **Review skipped entries:**
   ```javascript
   console.table(result.skipped.map(s => ({
     sessionTs: new Date(s.sessionTs).toISOString().slice(0, 10),
     reason: s.reason
   })));
   ```
   
   Daniel verdict per reason category:
   - `missing ts`: dacă count < 5% din total sessions → acceptable (legacy garbage)
   - `no exercises`: dacă count < 10% → acceptable (early test sessions Daniel did pre-tracking)
   - `invalid format`: ZERO acceptable. Dacă > 0 → backfill script needs fix, return to Sonnet.
   - `unknown muscle group`: dacă count > 0 → check exercitiile în question, possibly missing din EXERCISE_MUSCLES, fix muscle map sau add edge case în inferSessionType.

3. **Get 10 random samples for review:**
   ```javascript
   const samples = window.cdlBackfill.getValidationSamples(10);
   console.table(samples.map(s => ({
     date: s.date,
     sessionType: s.proposed.sessionType,
     exerciseCount: s.proposed.exercises.length,
     executed: s.outcome.executed,
     completedExercises: s.outcome.completedExercises,
     synthetic: s.synthetic
   })));
   ```

4. **For each of the 10 samples, Daniel verifies in browser/Obsidian:**
   - **sessionType match:** sample.proposed.sessionType corespunde tipului real de sesiune făcut în ziua aia
   - **exercises list match:** sample.proposed.exercises corespunde exercițiilor logged în ziua aia
   - **outcome.executed:** true (toate sesiunile istorice au fost executate prin definiție)
   - **outcome.completedExercises:** count corect față de logs
   - **outcome.actualSets:** count corect față de logs

5. **Daniel marks fiecare sample + skipped review în EXEC_RESULTS.md:**
   ```markdown
   ## TASK #30.3 — Backfill Validation
   **Date:** 2026-04-XX
   **Total synthetic entries created:** XX
   **Skipped entries:** YY total
     - missing ts: A (acceptable / NOT acceptable: <reason>)
     - no exercises: B (acceptable / NOT acceptable: <reason>)
     - invalid format: C (MUST be 0, else REJECT)
     - unknown muscle group: D (acceptable: list <exercises>; or REJECT)
   **10-sample review:**
   1. 2026-03-15 PUSH — PASS (Incline DB Press, Pec Deck, ...)
   2. 2026-03-13 PULL — PASS (Lat Pulldown, Cable Row, ...)
   ...
   10. 2026-02-28 LEGS — PASS / FAIL: <description>
   
   **Verdict:** 10/10 samples PASS + skipped acceptable → proceed to 30.4
   OR: X/10 FAIL OR skipped not acceptable → return to Sonnet with description
   ```

6. **If any sample FAILS or skipped contains 'invalid format':** TASK #30.3 returns to Sonnet, backfill script fixed, re-run on full history (with `force: true`), re-validate. NO progression to 30.4.

7. **Commit hash recorded:**
   ```markdown
   **Backfill commit:** <hash>
   **Daniel sign-off:** YES
   ```

**Critical:** synthetic entries become read-only baseline forever. Bug în backfill nedetectat AICI = corrupt baseline pentru toate engines downstream. NO compromises on validation.

---

## TASK #30.4 — coachDirector Integration (Proposed Write) + Failure Handling
**Model:** Sonnet
**Type:** EXEC
**Priority:** CRITICAL
**Status:** DONE ✅
**Created:** 2026-04-25
**Description:** Integrează CDL write în `coachDirector.buildSession()`. Când director produce o sesiune, scrie CDL entry cu `proposed` + `context` + `rationale` conform ADR 011. Idempotency verificată automat de `coachDecisionLog.writeProposed()`.

Modificări `src/engine/coachDirector.js`:
- După `evaluate(ctx)` și `buildSession(sessionType, ctx)` (existing flow)
- Build entry object din `ctx` snapshot + decision result
- Call `coachDecisionLog.writeProposed(entry)` 
- Capture returned entry ID în session result (pentru subtask 30.5 outcome population)
- Wrap în try/catch — failure de CDL write NU blochează session generation (degraded mode acceptable)

Mapping ctx → CDL context snapshot:
- `calibrationLevel` ← ctx.calibrationLevel.name
- `readinessScore` ← ctx.readiness?.score
- `fatigueIndex` ← ctx.fatigueIndex
- `daysSinceLastSession` ← compute din ctx.allLogs (existing helper sau new)
- `lastSessionType` ← compute din ctx.allLogs (most recent session)
- `isInCut` ← ctx.isInCut
- `weakGroups` ← ctx.weakGroups (array)
- `stagnationWeeks` ← ctx.stagnationWeeks
- `predictionToday` ← { isHighRisk, probability } din ctx.predictionToday

Mapping decision → CDL proposed:
- `sessionType` ← input parameter (PUSH/PULL/LEGS/etc.)
- `rationale.winnerId` ← decisionResult.winner?.id || 'NO_RULE_FIRED'
- `rationale.winnerPriority` ← decisionResult.winner?.priority || null
- `rationale.overridden` ← decisionResult.overridden.map(r => r.id)
- `exercises` ← session.exercises.map(e => e.name)
- `volumeMultiplier` ← derived from rule action sau ctx
- `notes` ← optional, generated from key context flags

CDL write failure handling:
- Try block wraps `writeProposed(entry)` call
- On success: session result includes `cdlEntryId: <id>` and `cdlWriteError: null`
- On failure (catch): 
  - session result includes `cdlEntryId: null` and `cdlWriteError: <error.message>`
  - Log error to Sentry via existing logger pattern (severity: 'error')
  - Session still returned to caller (degraded mode — coach works without CDL audit)
- 30.5 must handle `cdlEntryId === null` case gracefully (skip outcome population, log warning)

Tests (`src/engine/__tests__/coachDirector.test.js` — extend existing):
1. buildSession writes CDL entry on success
2. CDL entry contains correct context snapshot from ctx
3. CDL entry contains correct rationale from ruleEngine result
4. Idempotency: 2 buildSession calls within 4h + same context → 1 CDL entry
5. CDL write failure → session still returned with cdlEntryId: null + cdlWriteError populated
6. CDL entry ID captured in session result on success (cdlWriteError: null)
7. Sentry error logged on CDL write failure (mock logger, verify call)

Build + tests:
- npm run build, npm run test:run — green

**Acceptance:**
- coachDirector writes CDL on every buildSession call
- Failure path returns session with cdlEntryId: null + cdlWriteError + Sentry log
- 7+ new test cases passing
- Existing coachDirector tests still pass (no regression)
- Commit: `feat(cdl): TASK #30.4 — coachDirector writes CDL proposed + failure handling (ADR 011)`
- Push to main

**Dependencies:** TASK #30.3 DONE ✅ + GATE B passed ✅

---

## TASK #30.5 — endSession + cancelWorkout Outcome Population
**Model:** Sonnet
**Type:** EXEC
**Priority:** CRITICAL
**Status:** DONE ✅
**Created:** 2026-04-25
**Completed:** 2026-04-26
**Description:** Populează `outcome` pe CDL entry când user-ul finalizează sau anulează o sesiune.

Modificări `src/pages/coach/session.js`:
- `endSession()`: la final, după persist logs:
  - Check `state.cdlEntryId` (set de coachDirector în 30.4)
  - If `cdlEntryId === null` (CDL write failed in director): log warning "CDL outcome skipped — no proposed entry for today", DO NOT call populateOutcome. Continue normal endSession flow.
  - If `cdlEntryId` valid: call `coachDecisionLog.populateOutcome(today, outcomeObj)` cu:
    - `executed: true` (sau 'partial' dacă earlyStop)
    - `deviation: false` (presupunând că sessionType actual === proposed; check explicit)
    - `actualSessionType` ← din state.sessType
    - `matchScore` ← computed via `cdl.computeMatchScore(proposed, actual)` — null dacă deviation
    - `completedExercises`, `totalProposedExercises`, `actualSets`, `proposedSets` din state + last entry
    - `earlyStop: false`
    - `rating` ← din rating flow result
    - `completedAt: Date.now()`

- `cancelWorkout()`: same null check pe cdlEntryId. If valid, populate outcome:
  - `executed: false`
  - `deviation: false`
  - `actualSessionType: null`
  - `matchScore: null`
  - All counts: 0
  - `earlyStop: false`
  - `rating: null`
  - `completedAt: Date.now()`

Edge cases:
- Dacă `cdlEntryId` valid dar entry nu mai există (theoretical race): create synthetic outcome-only entry cu `rationale.winnerId = 'NO_PROPOSED'`. Log warning.
- Multiple superseded entries existente pentru today → populate cel mai recent non-superseded (handled de coachDecisionLog API)
- Outcome already populated → log warning, do NOT overwrite (immutability)

Tests:
1. endSession populates outcome on today's CDL entry (happy path)
2. endSession with cdlEntryId === null skips populate, logs warning, continues normally
3. cancelWorkout populates outcome.executed=false
4. cancelWorkout with cdlEntryId === null skips, logs warning
5. earlyStop sets outcome.executed='partial' + earlyStop=true
6. Deviation case (user did PULL when proposed PUSH) → matchScore=null + deviation=true
7. Match case → matchScore computed correctly
8. No proposed entry but cdlEntryId set → orphan outcome entry created with NO_PROPOSED rationale (race edge case)

**Acceptance:**
- endSession + cancelWorkout populate CDL outcome correctly
- Null cdlEntryId case handled gracefully (no crashes)
- 8+ new tests passing
- Commit: `feat(cdl): TASK #30.5 — outcome population + null entry handling (ADR 011)`
- Push to main

**Dependencies:** TASK #30.4 DONE ✅

---

## DANIEL GATE C — Post 30.4 + 30.5 Live Integration Test

**Required for TASK #30.6 to start.**

**Daniel sign-off requires ALL:**

1. **Live session test (full flow):**
   - Open app (post-deploy)
   - Set readiness, start session
   - Complete some exercises
   - End session normally
   - Open DevTools → check `localStorage.getItem('coach-decisions')`
   - Verify entry exists for today with both `proposed` AND `outcome` populated correctly

2. **Cancel session test:**
   - Start a new session (different day or after clearing today's entry)
   - Cancel mid-session
   - Verify CDL entry has `outcome.executed = false`

3. **Idempotency live test:**
   - Refresh app multiple times within 4h same readiness
   - Verify only 1 active CDL entry for today (not duplicated)

4. **Significant context change test:**
   - Change readiness score by > 20 points
   - Trigger rebuild (e.g., navigate away and back)
   - Verify old entry marked `superseded: true`, new entry created with `supersedes` ref

5. **Test suite still green:**
   ```powershell
   npm run test:run
   ```

6. **EXEC_RESULTS.md entry:**
   ```markdown
   ## TASK #30.4 + #30.5 — DONE ✅
   **Completed:** 2026-04-XX
   **Daniel sign-off:** YES
   **Live test:** ✅ end session → outcome populated
   **Cancel test:** ✅ executed=false
   **Idempotency:** ✅ 1 active entry per day
   **Supersede test:** ✅ chain reachable
   **Tests:** XXX pass
   **Commits:** <hash1>, <hash2>
   ```

**Critical check:** la acest gate, CDL trebuie să conțină **real entries** (nu doar synthetic backfill). Subtask 30.6 va începe să conteze "30 real entries" pentru decommission gate.

---

## TASK #30.6 — patternLearning Reads CDL (Parallel Write Period)
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Created:** 2026-04-25
**Description:** Refactor `src/engine/patternLearning.js` să citească CDL ca primary source. Continuă să scrie la `applied-patterns` (parallel period pentru decommission gate).

Modificări:
- `analyzeAndApplyPatterns(logs)` → renamed conceptual la `analyzeFromCDL()`. Old function rămâne ca wrapper care apelează new.
- Read CDL entries via `coachDecisionLog.readAllActive()` (filtered by sessionType, calibrationLevel, etc. ca needed)
- Compute patterns from CDL:
  - **adherenceRate** = entries.where(executed && !deviation && !synthetic).count / entries.where(synthetic === false).count
  - **deviationRate** = entries.where(deviation === true).count / entries.where(proposed && synthetic === false).count
  - **earlyEndRate** = entries.where(executed === 'partial').count / entries.where(executed !== false).count
  - **stagnation** patterns inferred din outcome.matchScore trends + actual logs (logs still authoritative pentru weight progression)
- Synthetic entries weighted at 0.5× în orice aggregate
- Banner-relevant patterns scrise în `applied-patterns` storage (parallel for backward compat)
- New patterns scrise direct via `coachDecisionLog` API când relevant

Pattern types updated:
- `EARLY_END` — keep (acum bazat pe CDL outcome.executed='partial' rate)
- `STAGNATION` — keep (logs based, unchanged)
- `SKIP_DAY` — DEPRECATED (era H30c root cause). Replaced cu `LOW_ADHERENCE` (CDL adherenceRate < 50% pe last 30 days) și `HIGH_DEVIATION` (CDL deviationRate > 30% pe last 30 days)
- `PEAK_HOURS` — keep (burns based, unchanged)

Tests:
1. analyzeFromCDL reads CDL entries correctly
2. adherenceRate computed correctly cu mixed real + synthetic
3. deviationRate distinguishes deviation from partial execution
4. SKIP_DAY no longer generated
5. LOW_ADHERENCE pattern fires when adherence < 50%
6. HIGH_DEVIATION fires when deviation > 30%
7. Synthetic entries get 0.5× weight în adherence calculation
8. Parallel write: applied-patterns still updated

**Acceptance:**
- patternLearning reads CDL primary
- applied-patterns still written (parallel)
- 8+ new tests passing
- Old SKIP_DAY logic removed
- Commit: `feat(cdl): TASK #30.6 — patternLearning reads CDL + parallel applied-patterns (ADR 011)`
- Push to main

**Dependencies:** TASK #30.5 DONE ✅ + GATE C passed ✅

---

## TASK #30.7 — adherence.js Rewrite to Read CDL
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Created:** 2026-04-25
**Description:** Rewrite `src/engine/adherence.js` să citească CDL ca primary source pentru adherence score. Înlocuiește current logic care contorizează raw logs against PROG static.

New logic:
- `computeAdherence(window = 30)` — CDL entries în last `window` days
- Adherence score:
  - `proposed.count` = entries.where(synthetic === false).count
  - `executed.count` = entries.where(executed === true && !deviation && !synthetic).count
  - `partial.count` = entries.where(executed === 'partial' && !synthetic).count
  - `skipped.count` = entries.where(executed === false && !synthetic).count
  - `deviated.count` = entries.where(deviation === true && !synthetic).count
  - `score` = (executed × 1.0 + partial × 0.5) / proposed (capped 0-100, %)
- `__early_stop__` markers no longer relevant — replaced by outcome.executed='partial'

Backward compat:
- Existing API (`getAdherenceScore`) returns same shape (number 0-100)
- Internals re-routed la CDL

Tests:
1. computeAdherence returns 100 when all proposed executed
2. Returns 0 when all proposed skipped
3. partial weights 0.5×
4. Deviation NOT counted as adherence (separate metric)
5. Synthetic entries excluded
6. Empty CDL → score = null (insufficient data, distinct from 0)

**Acceptance:**
- adherence.js rewritten
- Tests 6+ new passing
- Existing UI components consuming adherence still work (backward compat)
- Commit: `feat(cdl): TASK #30.7 — adherence.js reads CDL (ADR 011)`
- Push to main

**Dependencies:** TASK #30.6 DONE ✅

---

## DANIEL GATE D — Parallel Period Start

**Required for decommission gate (later, not for next subtask).**

**Daniel sign-off marks parallel period START:**

1. CDL write + applied-patterns write happen in parallel
2. Daniel uses app normally for ≥2 weeks AND ≥30 real CDL entries accumulated
3. During this period, Daniel observes:
   - Patterns produced by patternLearning (from CDL) match intuition
   - Adherence score (from CDL) seems sensible
   - No regressions in existing UX

**Tracking:**
```markdown
## TASK #30.7 — DONE ✅
**Parallel period started:** 2026-04-XX
**Real CDL entries accumulated:** counter incremented daily
**Decommission gate target:** 30 real entries + zero mismatch + 7-day diff audit
**Estimated date:** 2026-XX-XX (depending on training cadence)
```

NO subtask blocked by this gate — implementation continues with 30.8. This gate is for the FINAL decommission step (30.9).

---

## TASK #30.8 — renderIdle Banner CDL-Sourced + Suppression + New Pattern UI Strings
**Model:** Sonnet
**Type:** EXEC
**Priority:** HIGH
**Status:** PENDING
**Created:** 2026-04-25
**Description:** Refactor `src/pages/coach/renderIdle.js` banner section să citească din `ctx.patterns` (CDL-backed via director filter) în loc de `DB.get('applied-patterns')` direct. Plus banner suppression când CDL real entries < 3. Plus UI strings pentru noile pattern types introduse în 30.6.

Modificări `renderIdle.js:186` (banner pattern read):
- Remove direct `DB.get('applied-patterns')` call
- Read from `ctx.patterns` (already filtered by director per calibration tier)
- Apply suppression: count real CDL entries (synthetic === false && executed !== null) — if < `CALIBRATION_LEVELS.INITIAL.minSessions` (3), banner is hidden entirely
- No fallback to applied-patterns here — suppression takes precedence

UI strings per pattern type (Romanian, consistent cu existing tone):
- `EARLY_END`: păstrează existing string (e.g., "X% sesiuni terminate devreme — program scurtat 20%")
- `STAGNATION`: păstrează existing string (e.g., "X exerciții stagnate 3+ săptămâni")
- `LOW_ADHERENCE`: **NEW** — "Adherence scăzută ultimele 30 zile: X%. Reducem volum și verificăm contextul."
- `HIGH_DEVIATION`: **NEW** — "Deviation crescut: Y% sesiuni diferite de propunere. Coach-ul ajustează propunerile."
- `PEAK_HOURS`: păstrează existing
- `SKIP_DAY`: **REMOVED** — pattern type deprecated în 30.6, no UI string needed (assert in test that no SKIP_DAY rendering path remains)

Strings extracted la top of file ca constant `PATTERN_BANNER_STRINGS` cu key per pattern type — facilitates future i18n + testing.

Helper:
- Extract `shouldShowPatternBanner(ctx)` helper for testability
- Extract `formatPatternMessage(pattern)` helper that maps pattern.type → UI string with substitution

Tests (unit):
1. Banner hidden when 0 real CDL entries (synthetic backfill only)
2. Banner hidden when 2 real CDL entries (below threshold)
3. Banner shown when 3+ real CDL entries AND ctx.patterns non-empty
4. Banner content matches ctx.patterns (not applied-patterns)
5. patternLearning's old DB.set('applied-patterns') visible parallel still, but renderIdle ignores it
6. **LOW_ADHERENCE pattern renders correct string** with adherenceRate substituted
7. **HIGH_DEVIATION pattern renders correct string** with deviationRate substituted
8. **No SKIP_DAY rendering path** — assert grep test or function-level check that SKIP_DAY case throws or is unreachable
9. EARLY_END pattern still renders existing string (backward compat)

E2E test (`tests/e2e/scenarios/calibration-ui.spec.js` — extend existing):
- Synthetic-only history → banner suppressed (verified in DOM)
- Real entries ≥ 3 → banner shown
- LOW_ADHERENCE pattern visible în DOM cu correct string (test fixture cu CDL adherence 40%)

**Acceptance:**
- renderIdle.js banner sourced from ctx.patterns (CDL)
- Suppression logic implemented + tested
- All pattern types have UI strings (including new LOW_ADHERENCE + HIGH_DEVIATION)
- SKIP_DAY rendering removed
- 9+ unit tests + 1+ E2E test passing
- H30c symptom (false "Marți 88% skip rate") no longer reproducible
- Commit: `feat(cdl): TASK #30.8 — banner CDL-sourced + suppression + new pattern strings (ADR 011, closes H30c symptom)`
- Push to main

**Dependencies:** TASK #30.7 DONE ✅

---

## DANIEL GATE E — Decommission Triggers Met

**Required for TASK #30.9 to start.**

**Daniel sign-off requires ALL THREE TRIGGERS:**

**Trigger 1 — Volume:**
- ≥30 real CDL entries (synthetic: false, outcome.executed != null) accumulated
- Verified in DevTools:
  ```javascript
  const cdl = await import('/src/util/coachDecisionLog.js');
  const all = cdl.readAllActive();
  const real = all.filter(e => !e.synthetic && e.outcome?.executed != null);
  console.log('Real entries:', real.length);
  // Expected: ≥30
  ```

**Trigger 2 — Zero mismatch:**
- Automated test verifies CDL.outcome.actualSessionType matches logs[ts].session for all 30+ real entries
- Test added to `src/util/__tests__/coachDecisionLog.test.js` ca pre-decommission check
- Run: `npm run test:run -- coachDecisionLog`
- Expected: zero mismatches reported

**Trigger 3 — Manual validation:**
- Daniel reviews patternLearning output (CDL-derived) for last 30 days
- Verified that patterns produced are sensible:
  - LOW_ADHERENCE / HIGH_DEVIATION patterns fire when actually true
  - No false positives from synthetic-only periods
  - earlyEndRate matches Daniel's recollection of skipped sessions
- Sign-off: "patternLearning produces sensible patterns on CDL"

**PLUS Pre-Decommission 7-Day Diff Audit Gate (additional):**
- Run script `scripts/cdlDiffAudit.js` (created in 30.9 if not earlier) — diffs CDL-derived patterns against legacy applied-patterns output for last 7 days
- Daniel reviews diff:
  - Expected: CDL produces strict subset (false positives filtered out — that's the point)
  - Unexpected divergence (CDL missing patterns applied-patterns shows): investigate before decommission
- Sign-off in EXEC_RESULTS:
  ```markdown
  ## TASK #30.8 — Decommission Audit
  **Real entries:** 32 ✅
  **Zero mismatch test:** ✅
  **Manual pattern validation:** ✅
  **7-day diff audit:** ✅ (CDL = applied-patterns - false positives)
  **Daniel sign-off for 30.9:** YES
  ```

**If any trigger fails:** wait until met. NO partial decommission. NO time-based bypass.

---

## TASK #30.9 — Decommission applied-patterns (Clean Break)
**Model:** Sonnet
**Type:** EXEC
**Priority:** CRITICAL
**Status:** PENDING
**Created:** 2026-04-25
**Description:** Remove `applied-patterns` from code, storage, sync. Single source of truth = CDL.

Modificări:
- `patternLearning.js` — remove parallel write to applied-patterns. Remove `analyzeAndApplyPatterns` legacy wrapper if no longer needed.
- `firebase.js` — remove `applied-patterns` from SYNC_KEYS și COACH_RELEVANT_KEYS
- `dataCleanup.js` — add `applied-patterns` to deprecated keys list (cleanup on Full Reset). Plus add cleanup migration: on app load, if `applied-patterns` exists in localStorage, delete it (one-time migration on update).
- `dataRegistry.js` (Task #27 follow-up) — remove `applied-patterns` from active keys, mark deprecated
- Any remaining `DB.get('applied-patterns')` callers → delete (should be zero post-30.8)

Pre-flight check (mandatory in script):
- grep entire codebase for `applied-patterns` string
- Output should be ONLY: dataCleanup.js (deprecated cleanup), tests (validation), docs (historical reference)
- Any production code reference → ABORT and report

Tests:
1. After load, applied-patterns key removed from localStorage (migration test)
2. firebase.js no longer syncs applied-patterns
3. patternLearning no longer writes to applied-patterns
4. Full Reset clears applied-patterns if present (legacy cleanup)

E2E test:
- Create user with applied-patterns set in localStorage
- Load app
- Verify applied-patterns removed automatically

**Acceptance:**
- All applied-patterns references removed from production code
- Migration script clears existing applied-patterns
- 4+ tests + 1 E2E
- Commit: `feat(cdl): TASK #30.9 — decommission applied-patterns (ADR 011, single source CDL)`
- Push to main

**Dependencies:** TASK #30.8 DONE ✅ + GATE E passed ✅

---

## TASK #30.10 — H30c Closure în FINDINGS_MASTER
**Model:** Sonnet
**Type:** DOCS
**Priority:** MEDIUM
**Status:** PENDING
**Created:** 2026-04-25
**Description:** Update `06-findings-tracker/FINDINGS_MASTER.md` să marcheze H30c FIXED prin TASK #30 (CDL).

Updates:
- H30c row: 🔴 OPEN → 🟢 FIXED, Fix în column = "TASK #30 (CDL adoption)"
- Stats: 19 FIXED → 20 FIXED, 1 OPEN → 0 OPEN
- Note în "Ultima sesiune QA" sau separat: "TASK #30 CDL implementation closed H30c naturally — pattern banner now sourced from CDL real entries with insufficient-data suppression"
- Update `00-index/INDEX_MASTER.md` cu link la ADR 011 + status FAZA 3 partial complete (CDL = arhitectură nouă)
- Add entry în `03-decisions/DECISION_LOG.md`:
  ```markdown
  ## 2026-XX-XX — TASK #30 COMPLETE — Coach Decision Log Adopted
  **Scope:** ADR 011 implementation. CDL ca primitive arhitectural. H30c rezolvat natural.
  **Approach:** 10 subtasks ordered cu Daniel gates. Backfill synthetic entries pentru continuitate. Decommission applied-patterns trigger-based.
  **Commits:** <list of all 30.X commit hashes>
  **Next:** monitor patternLearning behavior pe CDL pe >60 entries pentru reconsideration trigger #1
  ```

**Acceptance:**
- FINDINGS_MASTER updated
- INDEX_MASTER updated
- DECISION_LOG entry added
- All 3 vault docs commit + push: `docs(vault): TASK #30.10 — close H30c, vault sync post-CDL adoption`

**Dependencies:** TASK #30.9 DONE ✅

---

# END OF TASK #30 ENTRIES

**Total subtasks:** 10
**Daniel gates:** A, B, C, D, E (5 explicit gates)
**Estimated calendar time:** 4-8 weeks (cadence-dependent)
**Decommission gate:** 30 real entries + zero mismatch + 7-day diff audit (ALL three required)
**Contract:** [[011-coach-decision-log-architecture]]
