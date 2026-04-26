# Engine Call Graph Audit — 2026-04-26 NIGHT

**Scope:** src/engine/ — import/export map, circular deps, dead paths, hubs  
**Total engine files:** 29 (excl. __tests__/)

---

## Call Graph — CoachDirector Hub

CoachDirector este hub-ul central. Imports directe:

```
coachDirector.js
├── coachContext.js
│   ├── muscleMap.js (pure)
│   ├── patternLearning.js
│   │   └── coachDecisionLog.js (util)
│   └── calibration.js (pure)
├── reality.js
│   ├── sys.js
│   │   └── config/user.js
│   └── config/weights.js
├── ruleEngine.js (pure)
├── weaknessDetector.js
│   └── muscleMap.js (pure)
├── stagnationDetector.js
│   └── weaknessDetector.js
├── predictionEngine.js (pure)
├── recompileEngine.js (pure)
├── alternativeEngine.js (pure)
├── proactiveEngine.js (pure)
├── calibration.js (pure)
├── sessionBuilder.js
│   └── calibration.js
└── coachDecisionLog.js (util)
```

**Depth:** max 4 hops (coachDirector → coachContext → patternLearning → coachDecisionLog)

---

## UI/Page Layer — Non-Director Consumers

Engines consumate direct din UI pages, NU prin coachDirector:

| Engine | Consumator UI | Nota |
|---|---|---|
| `readiness.js` | main.js, coach/modals.js, coach/renderIdle.js, dashboard.js | Direct UI integration |
| `fatigue.js` | coach/renderIdle.js, dashboard.js, plan.js | Direct UI integration |
| `adherence.js` | dashboard.js | Direct — NU via coachDirector |
| `aa.js` | main.js, coach/logging.js, coach/renderIdle.js | Direct — NU autoAggressionDetection.js |

**Note critică:** `aa.js` este un modul vechi (AA simplu, ad-hoc adjustments) diferit de  
`autoAggressionDetection.js` (noul modul CDL-based). Ambele coexistă în src/engine/.

---

## Circular Dependencies

Verificat manual — ZERO circular deps identificate.

```
muscleMap ← weaknessDetector ← stagnationDetector ← coachDirector  (acyclic)
muscleMap ← weaknessDetector ← responseProfile ← recalibration     (acyclic)
calibration ← coachContext ← coachDirector                          (acyclic)
calibration ← sessionBuilder ← coachDirector                        (acyclic)
```

---

## Dead Paths — Module fără consumer production (non-test)

| Module | Exports | Imported în production? | Status |
|---|---|---|---|
| `autoAggressionDetection.js` | 12 exports | NO | DEAD PATH — module complet |
| `profileTyping.js` | 15 exports | NO | DEAD PATH — module complet |
| `recalibration.js` | 2 exports | NO | DEAD PATH — not imported |
| `coldStartGuidelines.js` | 1 export | NO | DEAD PATH — not imported |
| `alerts.js` | 0 exports | NO | EMPTY FILE — zero content |

**recalibration.js** — are imports din calibration.js, weaknessDetector.js, responseProfile.js.  
Presumably era folosit, acum nu mai e. Needs ADR sau removal.

**coldStartGuidelines.js** — `generateColdStartSession` definit dar niciodată apelat.  
Cold start logic activ e în coachDirector via calibration.js direct.

**alerts.js** — fișier cu 0 exports, 0 imports. Placeholder goal.

---

## Central Hubs (most connections)

| Module | In-degree (imported by) | Out-degree (imports) | Role |
|---|---|---|---|
| `coachDirector.js` | 1 (main entry) | 14 | MAIN HUB |
| `coachContext.js` | 1 (coachDirector) | 7 | Context aggregator |
| `calibration.js` | 4 (coachDirector, coachContext, sessionBuilder, recalibration) | 0 | Pure config hub |
| `weaknessDetector.js` | 3 (coachDirector, stagnationDetector, recalibration) | 1 (muscleMap) | Analysis hub |
| `muscleMap.js` | 3 (coachDirector, weaknessDetector, coachContext) | 0 | Data hub |
| `coachDecisionLog.js` | 5+ (coachDirector, patternLearning, adherence, etc.) | — | Storage hub |

---

## Pure Modules (no engine imports)

Acestea pot fi testate independent fără dependencies:

```
alternativeEngine.js, autoAggressionDetection.js, calibration.js (pure params),
coldStartGuidelines.js, exerciseMapping.js, muscleMap.js, plateauInterventions.js,
profileTyping.js, proactiveEngine.js*, recompileEngine.js, ruleEngine.js,
sessionBuilder.js*, weaknessDetector.js*, whyEngine.js
```

(*) imports db.js sau constants (non-engine)

---

## Findings Summary

| Finding | Severitate | Recomandare |
|---|---|---|
| `autoAggressionDetection.js` dead path | CRITICAL | Integrate (per AA audit) |
| `profileTyping.js` dead path | CRITICAL | Integrate (per Profile audit) |
| `recalibration.js` orphaned | MEDIUM | ADR sau remove |
| `coldStartGuidelines.js` orphaned | LOW | Remove sau integrate |
| `alerts.js` empty file | LOW | Remove sau implement |
| `aa.js` vs `autoAggressionDetection.js` coexistă | MEDIUM | Clarify ownership — aa.js = legacy adjustments, autoAggressionDetection.js = CDL-based detection |

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
