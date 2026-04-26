# TODO/FIXME Inventory — 2026-04-26 NIGHT

**Scope:** src/ + docs/ TODOs și FIXMEs  
**Date:** 2026-04-27

---

## TODOs în src/ (production code)

| # | File | Line(s) | Content | Category |
|---|---|---|---|---|
| T1 | src/pages/coach/renderIdle.js | 99 | `render alerts into #today-alerts element (coach page)` | DEFERRED |
| T2 | src/pages/weight.js | 576 | `implement water tracking (currently not shown in UI)` | DEFERRED |
| T3 | src/pages/weight.js | 578 | `implement supplement tracking (currently not shown in UI)` | DEFERRED |
| T4 | src/pages/weight.js | 589 | `render photo grid from 'photos' DB key into #photo-grid` | DEFERRED |
| T5 | src/pages/weight.js | 591 | `show visual indicator if day is already closed` | DEFERRED |
| T6 | src/pages/weight.js | 593 | `render sleep/energy wellbeing inputs` | DEFERRED |
| T7 | src/pages/weight.js | 595 | `alert if sleep/energy below threshold` | DEFERRED |
| T8 | src/pages/weight.js | 944 | `render supplement checklist from 'suppl-list' DB key` | DEFERRED |

---

## TODOs în docs/ (historical vault references)

| # | Doc | Note |
|---|---|---|
| D1 | AUDIT_COACH_JS_24APR.md | tickSess TODO context — stale (file split happened) |
| D2 | COACH_SPLIT_PLAN.md | tickSess stub + renderTodayAlerts stub context — historical |
| D3 | SESSIONBUILDER_AUDIT_1_6.md | `TODO Week 2: implementare completă cu Prediction Engine` — historical |

---

## Zero FIXME, XXX, HACK în src/ production

Niciun FIXME, XXX sau HACK identificat în src/ production code (excl. __tests__).  
Tot ce existe = TODO-uri pentru features neimplementate, categorizate DEFERRED.

---

## Top 10 Priority TODOs

| Rank | # | Motiv |
|---|---|---|
| 1 | T1 | `#today-alerts` placeholder — `alerts.js` există în engine dar e gol; feature neimplementat |
| 2 | T6 | Wellbeing inputs (sleep/energy) — `wellbeing` key există în storage, UI form absent |
| 3 | T7 | Alert dacă sleep/energy sub threshold — legat de proactiveEngine.checkSleepDebt |
| 4 | T2 | Water tracking UI — `waters` key există, tracked dar absent din weight.js UI |
| 5 | T3 | Supplement tracking UI — `suppl-list` key există, checklist absent |
| 6 | T8 | Supplement checklist render — duplicat cu T3 (weight.js bottom) |
| 7 | T4 | Photo grid — `photos` key referenced dar niciun UI component |
| 8 | T5 | Closed day indicator — minor UX |
| 9 | D1-D3 | Vault TODOs — historical, nu blocante |
| 10 | — | — |

---

## Categorii

| Categorie | Count |
|---|---|
| DEFERRED (feature neimplementat) | 8 |
| BLOCKING | 0 |
| STALE (vault, historical) | 3 |
| DOC_ONLY | 0 |

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
