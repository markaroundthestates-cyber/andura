# Phase 3.6 Cluster #1 — Pre-flight Grep Output

**Branch:** `feature/phase-3-orchestrator-final`
**Date:** 2026-05-10
**Scope:** Buguri 6+7+11 audit-then-fix (NU fix orb)

## §0 (a) Engine handlers + emit + listen

**setPhaseOverride / clearPhaseOverride:**
- `src/main.js:43, 64` — import + window export
- `src/pages/plan.js:147` `export function setPhaseOverride(phase)` — DB.set('phase-override', phase) + renderPlan + renderDash + renderUnifiedHistory + toast
- `src/pages/plan.js:174` `export function clearPhaseOverride()` — DB.set('phase-override', null) + same render chain

**SYS.getPhase / getPhaseFromStorage:**
- `src/engine/sys.js:69` `getPhase()` — reads DB.get('phase-override') first → returns if set; else BF + season heuristic (Mifflin-St Jeor)
- `src/engine/coachContext.js:112` `getPhaseFromStorage()` consumer
- `src/engine/sys.js:111` `getKcalTarget()` reads phase-override + returns TDEE × phase multiplier (CUT 0.82 / BULK 1.08 / MAINTENANCE 1.0 / STRENGTH 1.05)

**saveW / saveBF / setBFOverride:**
- `src/pages/weight.js:51` `export function saveW()` — DB.set('weights', ws) + lockWeight + renderWeight + window.renderDash()
- `src/pages/weight.js:561` `export function setBFOverride()` — DB.set('bf-override', v) + dispatchEvent StorageEvent('storage', { key: 'bf-override' }) + toast
- `src/pages/weight.js:570` `export function clearBFOverride()` — same pattern, removeItem + dispatchEvent

**Render functions:**
- `src/pages/plan.js:11` `renderPlan()` — updates #phase-name + #phase-detail + #bf-display + #kcal-display + #tdee-display + #lbm-display + #bf-override-note + .phase-btn active state + checkpoints + timeline
- NO `renderProgres` function exists — "Progres" tab user calls = `#page-plan` în index.html (renderPlan)
- `src/pages/dashboard.js` renderDash — dashboard tab updates
- `src/pages/weight.js:23` renderWeight — weight tab updates

**Storage events / addEventListener:**
- `src/pages/plan.js:168` `window.addEventListener('storage', e => { if (e.key === 'bf-override') renderPlan(); })` — listener WIRED for BF override propagation

## §0 (b) DB.set/get pattern

- `DB.set('phase-override', phase)` plan.js:149
- `DB.set('phase-change-date', tod())` plan.js:148
- `DB.set('phase-log', filtered)` plan.js:160
- `DB.set('weights', ws)` weight.js:53
- `DB.set('bf-override', v)` weight.js:564

## §0 (c) Diff main vs feature primary suspect files

```
git diff origin/main..HEAD -- src/ → ZERO LINES
```

**CRITICAL FINDING:** ZERO src/ files modified between origin/main and feature/phase-3-orchestrator-final.

Phase 3+3.5 changes were 100% în:
- `04-architecture/mockups/*.html` (Clasic + LB + Lux + BC mockup edits)
- `00-index/CURRENT_STATE.md`, `INDEX_MASTER.md`, `DECISION_LOG.md`, `DIFF_FLAGS.md` (vault docs)
- `📤_outbox/_archive/2026-05/*` (consumed task prompts)

**ZERO src/ diff = HYPOTHESIS PRIMARY FAIL per spec §0 HALT condition.**

## §0 (d) Suspect lines diff main vs feature

```
git diff origin/main..HEAD | grep -E "^[-+].*setPhaseOverride|^[-+].*saveW|..." | wc -l → 0
```

**ZERO suspect handler-related diff lines.** Spec HALT condition triggered.

## §0 (e) Test fixtures verify expected handlers

- `src/engine/__tests__/sys.test.js:35-47` — bf-override tested (T1 wins everything, parseFloat raw, skips calculations)
- `src/engine/__tests__/sys.test.js:116` — getPhase() tested
- Tests preserved 2731 PASS LOCAL vitest

## §0 (f) BF manual override input handler

- `index.html:617` `<input id="bf-override-input">` + `<button onclick="setBFOverride()">SET</button>` + `<button onclick="clearBFOverride()">RESET</button>`
- `src/pages/weight.js:561-568` setBFOverride wired correctly

## HALT CONDITION TRIGGERED PER SPEC §0

**Hypothesis primary fail:** "Phase 3+3.5 a rupt observer pattern undeva în src/ pe feature branch" = FALSIFIED by diff (ZERO src/ diff main vs feature).

**Bugurile 6+7+11 nu sunt regressions from Phase 3+3.5.** Ele sunt LATENT bugs on main branch (or non-bugs caused by browser cache / specific edge cases).

**Per spec HALT:** "NU procedezi blind la fix. Investigate alte axe (CSS hidden / state init / DB schema)."

Audit phase §1 va captura findings reale per bug + flag pentru Daniel.
