# FAZA 2 — BUG FIXES + RELIABILITY

**Status:** ✅ COMPLETE (24 apr 2026)
**Prerequisite:** ✅ FAZA 1 sub-faze 1.0–1.8 complete

**Exit criteria:** Zero breakdown în 3-5 zile de usage real consecutiv.

**Raport final:** docs/FAZA_2_FINAL_REPORT.md

---

## Priority 1 — Context-Aware Session Building (ex-FAZA 1.6 OPT A)

**Critical finding from FAZA 1.6 audit:** coachDirector calculează ctx complet
(weakGroups, stagnation, predictionToday, recompile, allLogs) dar sessionBuilder
ignora totul și folosea listă hardcoded.

**Impact:** Fix-ul FAZA 1.5 (ctx.allLogs real) nu se propagă în recomandări
până nu implementăm context-aware selection.

**Effort:** 3-4h (conform docs/SESSIONBUILDER_AUDIT_1_6.md OPT A)

**Scope:** Implement real session building folosind:
- `weakGroups` → prioritize weak muscle groups in exercise selection
- `stagnation` → inject plateau interventions / alternative exercises
- `predictionToday` → adapt volume to predicted readiness
- `recompile` → respect weekly distribution plan
- `allLogs` → use full history for exercise variety

**Approach:** OPT C first (move `fallbackSessionBuilder` to sessionBuilder.js
as pure function, add tests), then OPT A on top.

**Reference:** docs/SESSIONBUILDER_AUDIT_1_6.md

**Status:** READY TO START (plan complet în audit)

---

## Priority 2 — Crash / Leak Bugs

Referință audit coach.js 24 apr 2026 (AUDIT_COACH_JS_24APR.md).

| ID | Finding | Severitate | Notes |
|----|---------|------------|-------|
| C2c | `cancelWorkout` nu face cleanup complet — state leaks (sessLog, currentEx, timers) rămân după cancel | CRITICAL | Re-open = stale state |
| C3c | `rateSession` double-tap bug — poate dubla scorul sau înregistra de 2× | CRITICAL | Lipsă guard idempotent |
| H4c | Timer continuă să bată în background după app minimize | HIGH | `document.hidden` listener lipsă |
| H6c | Crash recovery incompletă — draft salvat dar timer state pierdut la reload | HIGH | sessStart, currentSet nu se restaurează |
| H9c | Multi-device draft conflict — 2 dispozitive pot suprascrie reciproc draft-ul | HIGH | Last-write-wins, nu merge |
| H11c | Timer leak la exercise switch rapid (debounce lipsă) | HIGH | Multiple intervals acumulate |

**Effort estimat:** 2-3h total (fiecare ~20-30min)

---

## Priority 3 — Logic Bugs

| ID | Finding | Severitate | Notes |
|----|---------|------------|-------|
| M3g | Stagnation detector ignoră weight plateau când reps cresc | MEDIUM | False negative stagnation |
| H13g | weaknessDetector threshold hardcoded, nu ține cont de faza de antrenament | HIGH | CUT vs BULK thresholds diferite |
| H14g | predictionEngine nu actualizează modelul după skip-uri consecutive | HIGH | Probability drift fără corectare |
| M7c | Phase transition edge case — loguri din ziua tranziției contorizate în ambele faze | MEDIUM | Off-by-one la phase boundary |

**Effort estimat:** 3-4h total

---

## Priority 4 — Firebase Security (continuare FAZA 1.8)

**Acțiuni manuale rămase (Daniel):**
- Verifică rules curente în Firebase Console
- Deploy rules v1 path-restricted (dacă nu e deja)
- Test post-deploy că sync funcționează

**Referință:** docs/FIREBASE_AUDIT_1_8.md

---

## Priority 5 — tierStorage Integration (OPT C sync cap)

**Status:** Scaffold complet în `src/util/tierStorage.js`, ZERO imports.

**Când:** După Priority 1-3 complete + Firebase secure.

**Effort:** 4-6h (wire în buildCoachContext + firebase sync)

---

## Notes FAZA 3 / FAZA 4

- **FAZA 3:** Infrastructure + Observability (error tracking, performance monitoring, analytics)
- **FAZA 4:** Features noi (144 programe, injury tracking, health export, multi-user auth)
