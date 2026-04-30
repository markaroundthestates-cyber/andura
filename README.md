# SalaFull — Personal AI Coach

A personal AI coach with real contextual reasoning, persistent memory, and adaptive decisions.

---

## Architecture

### Coach Brain v3

```
coachDirector.js       — orchestrator (buildSession, CDL write)
├── ruleEngine.js      — priority-ordered decision rules
├── coachContext.js    — full context snapshot (allLogs, CDL patterns, calibration tier)
├── sessionBuilder.js  — session exercise selection (weakness-aware)
├── dp.js              — Double Progression engine
├── aa.js              — Auto Adjust engine (notes-only mode)
├── alternativeEngine.js — equipment substitution
├── patternLearning.js — pattern analysis via CDL (analyzeFromCDL)
├── adherence.js       — CDL-sourced adherence scoring
└── calibration.js     — tier detection + ADR 012 inactivity decay
```

### Coach Decision Log (CDL) — ADR 011

Primary architectural primitive for pattern detection and decision audit.

- `coachDecisionLog.js` — primitive: write/read/populate CDL entries
- `cdlBackfill.js` — synthetic entries from historical logs
- CDL replaces `applied-patterns` as source-of-truth for patterns (TASK #30 — 9/10 done)

### Storage

- Primary: `localStorage` (fast, local-first)
- Sync: Firebase REST (not SDK) — keys listed in `firebase.js::SYNC_KEYS`
- Tier storage: Live (90 days) / Aggregate (1 year) / Archive (forever) — `tierStorage.js`
- Registry: `dataRegistry.js` — central key registry for Full Reset + cleanup

---

## Engine list

| Engine | File | Status |
|---|---|---|
| Double Progression | `engine/dp.js` | ✅ Active |
| Auto Adjust | `engine/aa.js` | ✅ Active (notes-only) |
| Pattern Learning | `engine/patternLearning.js` | ✅ CDL-backed |
| Adherence | `engine/adherence.js` | ✅ CDL-backed |
| Calibration | `engine/calibration.js` | ✅ + ADR 012 decay |
| Alternative Engine | `engine/alternativeEngine.js` | ✅ Active |
| Weakness Detector | `engine/weaknessDetector.js` | ✅ Active |
| Stagnation Detector | `engine/stagnationDetector.js` | ✅ Active |
| Prediction Engine | `engine/predictionEngine.js` | ✅ Active |
| Plateau Interventions | `engine/plateauInterventions.js` | ✅ Active |
| Rule Engine | `engine/ruleEngine.js` | ✅ Active |
| Proactive Engine | `engine/proactiveEngine.js` | ✅ Active |
| Why Engine | `engine/whyEngine.js` | ✅ Active |
| analyzeFromCDL | `engine/patternLearning.js` | ✅ Primary pattern source |

---

## Tests

**422/422 passing** (snapshot 2026-04-26)

```bash
npm run test:run     # run all tests
npm run test         # watch mode
npm run build        # Vite production build
```

Test files: 34 test files across `src/**/__tests__/` and `src/**/tests/`

---

## ADR Index

| ADR | Decision |
|---|---|
| 001 | Local-first storage (localStorage + Firebase sync) |
| 002 | Firebase REST not SDK |
| 003 | Double Progression engine |
| 004 | Rule Engine numeric priorities |
| 005 | Vanilla JS + Vite (no framework) |
| 006 | Three-Tier Log Storage |
| 007 | Firebase open rules (pre-auth) |
| 008 | Vitest + Playwright testing |
| 009 | Calibration Tiers |
| 010 | No Anthropic trademark in public material |
| 011 | Coach Decision Log (CDL) as architectural primitive |
| 012 | Calibration Tier Decay on Inactivity (linear -1/60 days) |

Full ADRs: `docs/decisions/`

---

## Current State (2026-04-26)

| Metric | Value |
|---|---|
| Tests | 422/422 passing |
| Open bugs | 0 |
| TASK #30 (CDL) | 9/10 done (30.9 deferred — see AUDIT_30_9_BLOCKED_STATE.md) |
| Coverage | 64% modules have direct tests (see COVERAGE_AUDIT_2026-04-26.md) |
| Build | ✅ green |

**Phases:**
- FAZA 1 — Engine Bulletproof ✅
- FAZA 2 — Bug Fixes + Reliability ✅
- FAZA 3 — Infrastructure + Observability ⏳
- FAZA 4 — Features (parametric programs, injury, health export) ⏳

---

## Vault

Docs: `00-index/INDEX_MASTER.md` — full navigation  
Findings: `05-findings-tracker/FINDINGS_MASTER.md`  
Decisions: `03-decisions/DECISION_LOG.md`  
Exec Queue: `10-exec-queue/EXEC_QUEUE.md`
