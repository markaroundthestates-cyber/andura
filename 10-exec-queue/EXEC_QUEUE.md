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
