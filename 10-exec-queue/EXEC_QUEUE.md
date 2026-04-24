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
