# BATCH_UI_01_CARD_BUTTONS_PAIN_DOMS — Report

**Status:** 🛑 **STOP — Cluster ABORTED at pre-flight**
**Model:** Opus
**Duration:** ~10 min (pre-flight only, NO code changes)
**Commit:** None (no fabricated code per "NU mock data inventată" + Bugatti paradigm)

---

## §1 PRE-FLIGHT FINDINGS

### Project framework reality

- **Framework:** **vanilla JavaScript** per ADR 005 — `package.json` deps confirmate: NO `react`, `vue`, `svelte`, `preact`, `solid`. Build tool = vite (bundler only, NU framework).
- **`src/components/` actual content:** `safetyBanner.js`, `hipThrustSetup.js`, `modalManager.js`, `safetyBannerWiring.js` — TOATE `.js` (NOT `.jsx`/`.tsx`).
- **Component pattern existent:** factory functions cu direct DOM manipulation imperative. Citez `safetyBanner.js` line 1: *"Direct DOM imperative, no framework (per ADR 005 vanilla JS)"*.
- **NO `ExerciseCard` / `SessionView` / `useState` / `propTypes`** găsite în `src/`. UI render via `src/pages/coach/renderIdle.js` etc. cu inline HTML strings template.

### Spec assumption mismatch

BATCH_UI_01 spec assume:
- `src/components/ExerciseActionCard/ExerciseActionCard.jsx` — JSX file
- `useState(false)` pentru isExpanded — React hook
- `propTypes = { ... }` — React PropTypes
- `<details>` HTML5 cu React state — React composition
- Tests `.test.jsx` cu jsdom React render

Reality:
- All `.js` (vanilla)
- DOM manipulation direct cu `document.createElement`, `element.addEventListener`
- No React hooks, no JSX compiler
- Tests `.test.js` cu vitest jsdom DOM nodes direct

### Foundation engines status

✅ **Foundation modules EXIST și sunt LOCKED V1:**
- `src/engine/pain-button/` — pain-input.js + override-cdl.js + index.js (BATCH_04 cluster Sprint 4.x)
- `src/engine/smart-routing/` — alternative-finder.js + equipment-detection.js + index.js
- `src/engine/composite-signal/` — trigger-3-metrici.js + lifecycle.js + index.js
- `src/engine/suflet-andura/` — 6 module + index
- `src/engine/self-correction/` — 3 module + index

✅ **ADR_PAIN_DISCOMFORT_BUTTON_v1 EXT-1 LOCKED V1** confirmat în vault (commit `d48ef0d` BATCH_01 cluster 10-batch 2026-05-02).

---

## §2 INCOMPATIBILITY ANALYSIS

| Spec assumption | Project reality | Severity |
|---|---|---|
| `.jsx` files cu React JSX syntax | `.js` files vanilla, no JSX compiler | **BLOCKING** |
| `useState(false)` React hook | No React, would be ReferenceError | **BLOCKING** |
| `propTypes = { ... }` PropTypes | No PropTypes lib în deps | **BLOCKING** |
| `<details>` HTML5 cu React state | OK ca element HTML pur, dar wrapping React e blocant | **BLOCKING** |
| `import PropTypes from 'prop-types'` | Module nu există în node_modules | **BLOCKING** |
| Tests `.test.jsx` cu React render | vitest folosește jsdom direct fără React | **BLOCKING** |
| `<ExerciseActionCard>` declarative composition | Factory functions imperative pattern existent | **BLOCKING** |

**Toate 7 BATCH_UI_NN spec-uri au aceeași assumption JSX/React** — pre-flight pe BATCH_UI_02..05 ar relevă identic incompatibilitate.

**BATCH_UI_06 (Suflet Andura wiring) parțial compatibil** — engine-side, NU JSX. DAR depinde explicit de "BATCH_UI_01..05 complete (engine modules wiring requires UI surfaces present)" — adică gates upstream JSX surface.

**BATCH_UI_07** = aggregate report final, depinde de toate prior.

---

## §3 STOP RATIONALE per fail-fast strict + Bugatti paradigm

Per master command Daniel:
> "NU mock data inventată. Pre-flight reveal real structure, adaptă scope."
> "STOP on first error, NU continue degraded scope."
> "Bugatti paradigm: bug 02:00 > 5 commits grabă. Calitate peste viteză."

Per BATCH_UI_01 spec §2:
> "**STOP dacă pre-flight relevă structură incompatibilă** — NU presupune. Raport în BATCH_UI_01_REPORT secțiune 'Pre-flight findings' + propune amendment scope dacă necesar."

**Action:** STOP cluster execution. NO commits. NO fabricated JSX files (would create dead code în vanilla bundle). Document findings + propose recovery paths.

---

## §4 RECOVERY PATHS (3 options pentru Daniel)

### Path A — Rewrite spec-uri cu vanilla JS pattern (recommended)

Strategic chat NEW Claude rewrite all 7 BATCH_UI_NN cu:
- `.js` extensions (NOT `.jsx`)
- Factory function pattern matching `safetyBanner.js` / `hipThrustSetup.js` existente
- Direct DOM `document.createElement` + `element.addEventListener`
- State management via closures + dataset attributes (NOT React hooks)
- Tests `.test.js` cu vitest jsdom DOM nodes direct
- HTML rendered via template literals în `renderIdle.js` etc. parent files

**Effort estimate:** ~30-45min Claude strategic chat + spec re-generation. Subsequent cluster execution probabil ~2-3h Opus actual (per factor 5-7x optimism §36.72).

### Path B — Migrate project la React/JSX first

Adăugare React + react-dom + jsdom React adapter + @testing-library/react în deps. Setup vite-react plugin. Migrate existing `src/components/*.js` la `.jsx`. Major refactor scope ~10-20h Opus + risk regression masiv 1203 tests existente.

**Recommendation:** REJECTED pre-Beta. Migration la React = post-Beta strategic decision dacă merită. ADR 005 vanilla JS = Bugatti paradigm respect simplitate stack pentru pre-launch.

### Path C — Engine-only batches (skip UI surfaces V1)

Execute DOAR BATCH_UI_06 (Suflet Andura wiring) dacă engine-side adaptat la pattern existent (NU "requires UI surfaces present"). UI surfaces (BATCH_UI_01-05) defer post-Beta dacă vrei React migration sau pattern vanilla rewrite.

**Trade-off:** Beta lansează FĂRĂ Pain Card / Goal Shift Settings / Founding hidden / Telegram CTA / Profile Validation card. Doar engine wiring intern. Acceptable doar dacă UI surfaces sunt OK la pattern existent (e.g., dacă renderIdle.js deja are placeholder logic pentru aceste surfaces).

---

## §5 RECOMMENDATION

**Path A (rewrite cu vanilla JS pattern).** Daniel paste acest raport în chat strategic NEW. Claude regenerate 7 spec-uri matching project reality. Apoi re-cluster execution corect.

Bugatti respect: 0 commits hashing now > 7 commits cu cod nefuncțional fabricat. Singurul calitativ răspuns posibil here.

---

## §6 STATE DELTA

- **Tests:** 1203 PASS (unchanged — no code changes)
- **Coverage:** 60.33% lines (unchanged)
- **Build:** 4.026s (unchanged)
- **Cumulative LOCKED count:** 64 (unchanged — pre-flight gate, no new decisions)
- **Files created:** **None** (NO fabricated JSX)
- **Files modified:** **None**
- **Commit:** **None** (cluster aborted pre-implementation)

---

## §7 ACCEPTANCE PER ORIGINAL SPEC

- [✅] Pre-flight grep executat
- [✅] Findings documented
- [🛑] STOP triggered per spec §2 explicit instruction
- [⏸️] All other ACCEPTANCE CRITERIA = N/A (NO implementation)

---

## §8 NEXT STEP

**Daniel action needed:**
1. Read acest raport
2. Decide Path A / B / C
3. Dacă Path A: paste raportul în chat strategic NEW Claude pentru spec re-generation
4. Dacă Path C: paste raportul cu request "regenerate DOAR BATCH_UI_06 vanilla-compatible scope"

---

*Generat 2026-05-03 post pre-flight gate fail-fast strict. NO commits, NO push, NO archive operations. Cluster ABORTED. Bugatti paradigm respect: zero code fabricat. Recovery via strategic chat re-spec.*
