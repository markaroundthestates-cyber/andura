# FAZA 2 — BUG FIXES + RELIABILITY

**Status:** PENDING (după finalizarea completă FAZA 1)  
**Prerequisite:** FAZA 1 sub-faze 1.1–1.8 complete

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

## Priority 2 — TBD după FAZA 1 completă

*(Populate from FINDINGS_MASTER HIGH/MEDIUM issues once FAZA 1 is done)*

---

## Priority 3 — Firebase Security + Sync Cap (FAZA 1.8)

*(May move to FAZA 2 depending on timeline)*
