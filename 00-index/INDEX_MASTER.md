# INDEX MASTER — SalaFull Project

**Ultima actualizare:** 24 apr 2026

---

## Faze de dezvoltare

| Fază | Descriere | Status |
|------|-----------|--------|
| FAZA 0 | Setup inițial, onboarding, PROG, DP baseline | ✅ COMPLETE |
| FAZA 1.0 | Coach page funcțional, session flow, rest timer, PR wall | ✅ COMPLETE |
| FAZA 1.1 | Split coach.js → 9 module + orchestrator | ✅ COMPLETE (24 apr 2026) |
| FAZA 2.0 | — | 🔜 PLANNED |

### FAZA 1.1 — detalii

9 module + orchestrator live, zero regresii, merged în main commit 9875755.

Module extrase:
- `coach/state.js` — sessionCache, wakeLockRef, uiToggleFlags
- `coach/util.js` — pure helpers, isInCutPhase
- `coach/pr.js` — PR detection + wall
- `coach/restTimer.js` — rest timer, inactivity handler
- `coach/logging.js` — per-set logging, kg-edit overlay
- `coach/rating.js` — session rating, summary, confetti
- `coach/modals.js` — user modals
- `coach/session.js` — session lifecycle, wake lock, draft
- `coach/renderIdle.js` — renderCoachIdle async + idle helpers
- `coach.js` — orchestrator pur (~19 LOC)

Rezultate: build ✓ · 41 tests passed · 4 UI flows QA passed · zero window.* late-bindings rămase.

---

## Structura repo

| Director | Conținut |
|----------|---------|
| `00-index/` | INDEX_MASTER.md — tracking faze |
| `03-decisions/` | DECISION_LOG.md — decizii arhitecturale |
| `09-workflows/` | ASYNC_EXECUTION_PROTOCOL.md |
| `10-exec-queue/` | EXEC_QUEUE.md, EXEC_RESULTS.md |
| `docs/` | Planning docs, audit reports, prompts |
| `src/` | Cod sursă aplicație |
| `tests/` | Unit + E2E tests |

---

## Referințe rapide

- Branch producție: `main` → GitHub Pages auto-deploy
- CI: `npm run test:run` (204 unit tests) + `npm run test:e2e` (45 e2e)
- Protocol task queue: `09-workflows/ASYNC_EXECUTION_PROTOCOL.md`
