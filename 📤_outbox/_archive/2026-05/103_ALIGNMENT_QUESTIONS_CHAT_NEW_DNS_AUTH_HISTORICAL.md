---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 13 alignment Q-uri post-ingest §36.78 + §36.79 + §36.80 cu citation §X file.md + răspuns așteptat verbatim, pentru chat strategic NEW Project Andura post deploy LIVE andura.app + Auth flow integration Priority 1 ABSOLUT
type: alignment-questions
date: 2026-05-03 night
pass_criteria: ≥11/13 PASS (≥84%) → PROCEED auth flow integration design; <11/13 → RE-SYNC mandatory vault audit
source_ingest: 📤_outbox/_archive/2026-05/98_HANDOVER_2026-05-03_NIGHT_CONSUMED.md
source_locks: §36.78 (Rebrand Sweep Phase 1-4) + §36.79 (Custom Domain Base Path Hotfix) + §36.80 (DNS Activation + BUG 2 Auth Flow Not Wired)
---

# ALIGNMENT VERIFICATION QUESTIONS — Post-Ingest §36.78 + §36.79 + §36.80

**Generat per PROMPT_CC_HYGIENE.md §9** post handover ingest 2026-05-03 night (saturation ~15-20% bandwidth).
**Format:** citation `§X file.md` + răspuns așteptat verbatim (NU paraphrase).
**Cumulative target post-ingest:** **72 LOCKED V1**.
**Pass criteria:** **≥11/13** (≥84%).

---

## ⚠️ MANDATORY READ FIRST — REGULI EXECUȚIE

**1. Chat-ul NEW citește fișierele referențiate REAL (NU memory).**

**2. Format răspuns OBLIGATORIU per Q:**
```
[Q[N]/13] [PASS|FAIL]
Citation: <§X file.md path>
Match verbatim: "<citat exact din file>"
```

**3. Aggregate la final:**
```
ALIGNMENT_SCORE: X/13
Verdict: [PROCEED Auth flow integration design / RE-SYNC mandatory]
Failed Q-uri: [list cu rationale]
```

**4. Răspuns "depinde", "probabil", "cred că" = automatic FAIL.**

---

## §1 — §36.78 REBRAND SWEEP PHASE 1-4 COMPLETE (Q1-Q3)

### [Q1/13] Cumulative LOCKED count post §36.78 Rebrand Sweep Phase 1-4 Complete?

**Citation:** §36.78 în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> **Cumulative LOCKED count impact:** +1 (70 → **71**)

---

### [Q2/13] Care ref `salafull` este preserved (NU swept) și de ce?

**Citation:** §36.78 Phase 2 în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> Refs preserved: `src/storage/db.js DB_NAME_PREFIX = 'salafull'` (IndexedDB user data continuity, rename = Daniel local data wipe, post-Beta migration optional).

---

### [Q3/13] Empirical factor optimism Opus pentru §36.78 cluster?

**Citation:** §36.78 Metrics în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> Empirical Opus runtime: ~25-30 min actual vs estimate ~3.5-4.5h (factor 7-9x optimism — CONFIRMED 5x consecutive per §36.72 calibration)

---

## §2 — §36.79 CUSTOM DOMAIN BASE PATH HOTFIX (Q4-Q6)

### [Q4/13] Root cause §36.79 hotfix?

**Citation:** §36.79 Root cause în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> Phase 2 rebrand sweep schimbat `vite.config.js` base de la `'/salafull/'` → `'/andura/'`. Asta corect pentru subpath `markaroundthestates-cyber.github.io/andura/` DAR greșit pentru custom domain `andura.app/` unde root site = `/`, NU `/andura/`. Path resolution dublu prefix (`andura.app/andura/...`) → 404 toate assets.

---

### [Q5/13] CACHE_VERSION bump §36.79 — de la ce la ce și de ce MANDATORY?

**Citation:** §36.79 Fix scope + Rationale CACHE_VERSION bump în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> **CACHE_VERSION bump `andura-v1` → `andura-v2`** (invalidate stale SW cache pe browsers existing). [...] users care au accesat `andura.app` imediat post-launch (înainte fix) au sw cu cache `andura-v1` care încearcă fetch `/andura/...` paths. Bump v2 = sw nou se activează, drop cache vechi, reîncarcă fresh paths root-relative.

---

### [Q6/13] Lessons learned ext §36.79 anti-recurrence?

**Citation:** §36.79 Lessons learned în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> Custom domain deployment ≠ subpath deployment. Pre-rebrand checklist viitor trebuie include "destination URL type: subpath sau custom domain root?" ca primul item. CACHE_VERSION bump = MANDATORY pe orice schema change la base paths sw.js (anti zombie cache pe users existing). Phase 4 spec original lipsea sw fetch intercept paths consideration — flag pentru custom-domain projects future.

---

## §3 — §36.80 DNS ACTIVATION + BUG 2 AUTH FLOW NOT WIRED (Q7-Q11)

### [Q7/13] Status BUG 1 (SW zombie cache 404) post-§36.79?

**Citation:** §36.80 BUG 1 în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> **Decision:** NU bug real, e tranziție expected post CACHE_VERSION bump. Closed. Documentat audit trail.

---

### [Q8/13] BUG 2 root cause exact (5 pași) Firebase 401?

**Citation:** §36.80 BUG 2 Root cause analysis în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> 1. Codul `src/firebase.js` are `LEGACY_USER_PATH = 'users/daniel'` ca fallback când `getAuthState()` returnează null (NU autentificat).
> 2. `getUserPath()` resolver: dacă `auth?.uid` exists → `users/<uid>`, altfel fallback `users/daniel`.
> 3. Pe `andura.app` proaspăt deschis, Daniel NU a făcut Magic Link sign-in flow → `getAuthState()` = null → resolver returnează `users/daniel` literal.
> 4. DB Rules per-UID strict §36.75 BLOCHEAZĂ `users/daniel` (no `auth.uid` matches literal "daniel") → 401 toate operațiile.
> 5. App încearcă cycle: get → clearFirebaseKeys (DELETE) → set (PUT) → toate 401.

---

### [Q9/13] Care ADR conține amendment sursă a BUG 2 cause + ce este NOT landed?

**Citation:** ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 NOT landed în `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md`
**Răspuns așteptat verbatim:**
> - `index.html` route hookup pentru `/auth-callback` — Daniel wires when integrating UI shell (next batch).
> - Faza 2 banner UX "Salvează contul" prompt for existing Anonymous users → dedicated 30-min wiring batch.

---

### [Q10/13] Decision LOCKED §36.80 pentru Beta-launch pre-condiție?

**Citation:** §36.80 BUG 2 Decision LOCKED în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> **Decision LOCKED:** Beta-launch pre-condiție = auth flow integrat complet. Acum este blocking. Next chat = strategic NEW design discussion + prompt CC Opus dedicat.

---

### [Q11/13] Estimate next chat (strategic + CC Opus) auth flow integration?

**Citation:** §36.80 Estimate în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> **Estimate:** Strategic chat ~1-2h Daniel-time + CC Opus ~30-45 min real autonomous (factor 7-9x clusters mari, sau ~10-15 min hotfix scope-clean factor 2-3x).

---

## §4 — INVESTIȚII + DEPLOY STATE (Q12-Q13)

### [Q12/13] Cost actual achitat domain andura.app + comparație estimate §31?

**Citation:** §36.78 Cross-refs în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> §31 Investiții (andura.app €13.18 actual achitat 2026-05-03 vs estimate €10-15)

---

### [Q13/13] Cumulative LOCKED count cumulativ post-ingest 2026-05-03 night?

**Citation:** §36.79 Cumulative LOCKED count impact + §36.80 Cumulative LOCKED count impact în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Răspuns așteptat verbatim:**
> §36.79 — **Cumulative LOCKED count impact:** +1 (71 → **72**)
> §36.80 — **Cumulative LOCKED count impact:** 0 (count rămâne **72** — BUG 1 closed self-healing + BUG 2 finding documentat + decision LOCKED next-priority = NU adaugă număr nou §36.x distinct).

---

## PASS / FAIL CRITERIA

| Score | Verdict | Acțiune |
|-------|---------|---------|
| 13/13 | EXCELLENT | PROCEED auth flow integration design |
| 12/13 | PASS | PROCEED, flag Q-failed pentru clarificare în chat strategic |
| 11/13 | PASS minimum | PROCEED, dar Daniel re-confirmă Q-failed verbal pre-design |
| ≤10/13 | FAIL | RE-SYNC mandatory: re-citește SSOT §36.78 + §36.79 + §36.80 + ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02. Re-rulează Q-uri. NU PROCEED design fără ≥11/13. |

---

## CROSS-REF SOURCE INGEST

- **Input archived:** `📤_outbox/_archive/2026-05/98_HANDOVER_2026-05-03_NIGHT_CONSUMED.md`
- **SSOT modificate:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (§36.80 inserted post §36.79 + new session-lock paragraph 2026-05-03 NIGHT appended)
- **No-touch SSOT:** `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` (§AMENDMENT 2026-05-02 deja existent — citat doar)
- **No-touch SSOT:** `03-decisions/007-firebase-open-rules.md` (§AMENDMENT 2026-05-02 DB rules per-UID strict deja published live §36.75)

---

## SCOPE CHAT STRATEGIC NEW (post alignment PASS)

**Priority 1 ABSOLUT — Auth flow integration `andura.app` production:**

1. Wireframe auth-first vs auth-banner-soft vs auth-modal patterns (Daniel CEO decizie UX).
2. Decizie route auth-callback wire: `/auth-callback?oobCode=...` la app shell main.js sau separate page.
3. Migration path users existing IndexedDB local data Daniel → post-Magic-Link `users/{uid}` Firebase RTDB.
4. Wording onboarding auth screen RO (Magic Link primary, Google OAuth secondary).
5. Error states UX (email invalid, link expired, network fail).

**Apoi prompt CC Opus dedicat (~30-45 min autonomous factor 7-9x):**

1. Wire `/auth-callback` route în `index.html` + `src/main.js` route handler.
2. Integrare `createAuthScreen` din `src/pages/auth.js` în main app flow (forced gate dacă `getAuthState() == null`).
3. Update `LEGACY_USER_PATH` fallback strategy: dacă custom domain prod + auth required → block dashboard render până auth, NU fallback `users/daniel`.
4. Tests Playwright e2e flow Magic Link mock + Google OAuth mock.
5. Smoke prod confirm: user nou pe `andura.app/` vede auth screen, NU dashboard direct.

🦫 **Andura V1 prod LIVE `andura.app` ✅. Auth flow integration = Priority 1 ABSOLUT next chat.**
