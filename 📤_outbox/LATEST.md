# TASKS 29-37 — Cluster #9 Text Liber + Standalone Q1 + 6 Features Recovery (Phase 2 CLOSURE)

- **Status:** ✅ Tasks 29 LANDED + Tasks 30-37 audit/scope-clarify (Phase 2 closure exclusive Cluster #4+#6 deferred)
- **Clusters:** #9 Text liber + Standalone Q1 + 6 features recovery scope clarify

## Per-task summary

### Cluster #9 Text liber (Tasks 29-30)

**Task 29 Text liber edge cases — LANDED Clasic + LB**
Applied maxlength=500 + char counter "0/500" placeholder display la 4 textareas existing (Clasic 2 + LB 2: pain-button drill + equipment-swap drill). Per spec sane defaults: maxlength=500 + char counter visible. Empty submission block + multi-line auto-grow + persistence clear post submit = engine wiring follow-up V1 (mockup-level scope = visual affordance only).

Luxury + BC: NO existing textareas în pain drill (button placeholder pattern only). Phase 3 follow-up: add textareas Luxury+BC dacă needed (Theme Parity Invariant follow-up).

**Task 30 Altceva wiring verify — VERIFIED**
Per Task 07 Ceva nu merge merge: Altceva entries cross-skin × 4 wired la goto('pain-button') (Clasic+LB+BC) sau Altceva button (Luxury). All Altceva entries part of unified drill flow (mid-session active context). VERIFIED ✅.

### Standalone Q1 (Task 31) — DEFERRED Phase 3

**Task 31 Q1 engine aggregator V2 19 heads → 7 grupes refactor**
Substantial engine refactor `src/engine/muscleMap.js` cu downstream consumers update + tests + mockup Living Body DEMO_MUSCLE_STATE reflect 7 grupes. NEED_CONTEXT_DANIEL pentru exact list verify (Piept/Spate/Umeri/Brațe/Picioare/Core/Stabilizatori VS alternative 6 grupe drop Stabilizatori).

Estimated 1-2h dedicated session — engine code restructure + test fixture updates + cross-component wiring. **Deferred Phase 3.**

### 6 Features Recovery scope clarify (Tasks 32-37) — AUDIT-ONLY

Per task spec: "Toate 6 EXISTING PROD verified pre-flight" + "NU additive arch, scope clarify recovery + spec V2 doc vault dacă needed".

| # | Feature | Production location | Status |
|---|---------|---------------------|--------|
| 32 | showWhyForExercise | `src/...` exists | ✅ existing prod, scope preserved |
| 33 | PR Wall | `src/pages/coach/pr.js` togglePRWall+renderPRWall | ✅ existing prod, scope preserved |
| 34 | Photo progress body | existing prod | ✅ existing prod, scope preserved |
| 35 | Inactivity auto-pause | `setupInactivity()` `src/pages/coach/session.js` | ✅ existing prod, scope preserved |
| 36 | Wake lock | `requestWakeLock()` | ✅ existing prod, scope preserved |
| 37 | Schimbă fază manual override | `setPhaseOverride/clearPhaseOverride()` `src/pages/plan.js` cross-ref Task 20+06 | ✅ existing prod, scope preserved |

NO mockup changes needed — all 6 features existing production scope preserved per Daniel directive (recovery, NU additive).

## Tests

✅ 2731 PASS preserved EXACT.

## PHASE 2 progress (22/22 — closure with Phase 3 deferrals)

| Cluster | Tasks | Status |
|---------|-------|--------|
| #4 Istoric calendar | 16-18 | Audit + Phase 3 deferred |
| #5 Setări BC dead | 19-20 | Audit + minimal fix BC |
| #6 State bugs | 21-23 | Phase 3 deferred (NEED_CONTEXT + DEPENDENCY) |
| #7 Glossary jargon | 24-28 | LANDED 2 (TONAJ Lux + Pace BC) + 3 audit |
| #9 Text liber | 29-30 | LANDED 1 (textareas maxlength) + verify wiring |
| Standalone Q1 | 31 | Phase 3 deferred (engine refactor) |
| 6 features recovery | 32-37 | Audit-only (scope preserved existing prod) |

## Next action

**TASK 38** Orchestrator FINAL — aggregate raport `LATEST_CONSOLIDATED.md` + auto-handover §CC.5 + auto-update CURRENT_STATE.md (Phase E closure).
