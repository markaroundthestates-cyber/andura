# BATCH 1 — ANTRENOR PORT PLAN (mockup V2 → src/ vanilla JS)

**Branch:** `feature/v2-vanilla-port`
**Companion:** `📤_outbox/BATCH_1_ANTRENOR_INVENTORY.md` (read first — section refs §1.x).
**Status:** PLAN ONLY. ZERO src/ changes.

---

## §2.1 File structure proposed src/ Antrenor V2

**Recommendation: PRESERVE `src/pages/coach/` directory** (V1 internal naming). Rationale: 36+ cross-file imports including 9 engine modules; rename churn = high blast radius, low value. Tab id `antrenor` lives in UI/router layer only.

### Proposed file layout (post-port)

| File | LOC est | Role | New / Modified |
|------|---------|------|----------------|
| `src/pages/coach.js` | ~80 | Module entry — exports `mountAntrenor(rootEl)` + lifecycle hooks. Replaces V1 ad-hoc bootstrap. | MODIFIED (rewrite top-level) |
| `src/pages/coach/idle.js` | ~180 | NEW — Antrenor IDLE tab landing render (Programul săptămânii hero + 5 templates + drill 2°). REPLACES V1 `renderIdle.js` 465 LOC heavy. | NEW (replaces) |
| `src/pages/coach/energyCheck.js` | ~80 | NEW — Energy check (3 stări) + Cause drill (4 cauze). | NEW |
| `src/pages/coach/cevaNuMerge.js` | ~60 | NEW — Unified Pain+Equipment drill 4 opțiuni (per CURRENT_STATE 2026-05-10 LOCK V1 SUPERSEDE ADR 023 split). | NEW |
| `src/pages/coach/painButton.js` | ~70 | NEW — Pain drill 3 predefined + Altceva text input. | NEW |
| `src/pages/coach/equipmentSwap.js` | ~50 | NEW — Equipment swap text input flow (ADR 023). | NEW |
| `src/pages/coach/workout.js` | ~250 | Workout execution screen — exercise card, sets table render, log set handler, persona-conditional Marius/Maria, finish button. PARTIALLY MERGES V1 session.js + logging.js logic. | NEW (merges V1 logic) |
| `src/pages/coach/restTimer.js` | ~110 | KEEP V1 (90 LOC) + extend ~20 LOC SVG progress ring lifecycle (mount/unmount). | MODIFIED |
| `src/pages/coach/postRpe.js` | ~70 | NEW — Post-session 3-button RPE (ușor/potrivit/greu). REPLACES V1 rating.js 150 LOC simplified per mockup. | NEW (replaces) |
| `src/pages/coach/session.js` | ~250 | KEEP V1 359 → trim to ~250 (orchestration only — session lifecycle, not rendering). | MODIFIED |
| `src/pages/coach/logging.js` | ~228 | KEEP V1 EXACT (set logging core logic preserved). | UNCHANGED |
| `src/pages/coach/aaFrictionModal.js` | ~215 | KEEP V1 EXACT. | UNCHANGED |
| `src/pages/coach/modals.js` | ~212 | KEEP V1 EXACT. | UNCHANGED |
| `src/pages/coach/pr.js` | ~71 | KEEP V1 EXACT. | UNCHANGED |
| `src/pages/coach/util.js` | ~88 | KEEP V1 EXACT. | UNCHANGED |
| `src/pages/coach/state.js` | ~20 | KEEP V1 EXACT (sessionCache + wakeLockRef + uiToggleFlags). | UNCHANGED |
| `src/pages/coach/renderIdle.js` | DELETE | REPLACED by `idle.js`. Archive to `_archive/v1-renderIdle.js` for 1 release reference. | DELETE post-port |
| `src/pages/coach/rating.js` | DELETE | REPLACED by `postRpe.js`. Archive 1 release. | DELETE post-port |

**Total proposed:** ~2050 LOC (V1 ~1930 → V2 ~2050, +120 net for screen-split granularity).

### DOM render functions pattern

Each new screen module exports:
```
export function renderXxx(rootEl, ctx) → void  // mount
export function unmountXxx() → void             // cleanup (timers, listeners)
```

NO HTML inline handlers in mockup port — all converted to addEventListener inside module.

### Event handlers ES module

Mockup uses 17+ inline handlers within Antrenor cluster (`onclick="goto(...)"`, `toggleSet`, `logCurrentSet`, `submitPostRpe`, `toggleCue`). All converted to:
- `goto(name)` calls → router.navigate(name) ES import
- DOM-specific handlers → `el.addEventListener('click', handler)` inside renderXxx
- Module-scoped closures access `state` singleton + module-local refs

---

## §2.2 state.js extension proposed

### Preserve existing 24 fields EXACT (all retained)

`sessActive, sessStart, sessTimer, sessLog, currentEx, currentSet, awaitingRPE, sessRepsInput, sessionKgOverride, completedExercises, dropSetUsedThisSession, pauseTimer, pauseTotal, pauseLeft, lastPauseEndedAt, isMuted, activeNotes, logDateOffset, sessionTotalExercises, sessKcalBurn, earlyStopReason, cdlEntryId, sessType, lastSetRPE`

### New fields needed Antrenor V2 (minimum addition)

| Field | Justification | Mutation site | Read site |
|-------|---------------|---------------|-----------|
| `currentScreen: string` | Router state for back() handling within Antrenor sub-pages (energy-check, cause, ceva-nu-merge, pain-button, equipment-swap, workout, post-rpe). V2 mockup uses screen IDs; V1 has no router state. | router/coach.js | back() handler, deep-link |
| `cevaNuMergeReason: string\|null` | Track which drill option (`pain`\|`equipment`\|`altceva`) the user picked în Ceva nu merge — fan-out routing context. | cevaNuMerge.js | painButton.js, equipmentSwap.js |

**Total state.js post-port:** 24 → 26 fields (+2 minimum).

**ALTERNATIVE considered + rejected:** Pass currentScreen + cevaNuMergeReason as router context object (no global state). Rejected: V1 pattern is global state.js singleton, mixing patterns adds cognitive load.

### Mutation sites map post-port

NO change to existing 24 fields' mutation map (engine + coach + util sites preserved exact).

---

## §2.3 Engine imports preserved

**ZERO touch `src/engine/`** per ADR 005 §AMENDMENT.

Direct ES imports preserved în new modules:
- `idle.js` → `engine/coachDirector` (active program detection), `engine/proactiveEngine` (next-session preview)
- `workout.js` → `engine/predictionEngine`, `engine/dp`, `engine/autoAggressionDetection`, `engine/adherence`
- `postRpe.js` → `engine/coachDirector` (RPE → next-session calibration trigger)
- `restTimer.js` → KEEP V1 imports
- `session.js` → KEEP V1 imports (`engine/sessionBuilder`, `engine/coachDirector`, etc.)

---

## §2.4 Components breakdown vanilla JS modules ES per V2 mockup

### Per-component LOC estimates

| Component | Mockup LOC | Vanilla JS LOC est | Module |
|-----------|------------|--------------------|--------|
| Programul săptămânii hero card | ~12 (mockup HTML) | ~50 (render + engine query active program) | `idle.js` |
| 5 program templates list | ~6 | ~40 (render + drill confirm dispatch) | `idle.js` |
| Drill 2° quick access | ~5 | ~20 | `idle.js` |
| Energy 3 buttons | ~14 | ~60 (render + 🟢🟡🔴 dispatch logic) | `energyCheck.js` |
| Energy cause drill | ~12 | ~40 | `energyCheck.js` |
| Ceva nu merge unified drill | ~10 | ~60 | `cevaNuMerge.js` |
| Pain button drill | ~16 | ~70 | `painButton.js` |
| Equipment swap drill | ~14 | ~50 | `equipmentSwap.js` |
| Workout top bar (timer + exit) | ~10 | ~30 | `workout.js` |
| Exercise progress strip | ~8 | ~20 | `workout.js` |
| Exercise card (tempo+RIR Marius / cue Maria persona-conditional) | ~25 | ~80 | `workout.js` |
| Cue execution tip toggleable | ~10 | ~25 | `workout.js` |
| Sets table (4 rows grid) | ~25 | ~70 | `workout.js` |
| Rest timer SVG progress ring | ~15 | ~80 (extend V1 restTimer.js) | `restTimer.js` |
| Log set + Finish buttons | ~6 | ~40 | `workout.js` |
| Post-RPE 3 buttons | ~33 | ~70 | `postRpe.js` |

---

## §2.5 Buguri vanilla forward fixes integrate native

> ⚠️ Per inventory §1.4: 4/5 bugs are NOT verifiable verbatim against current mockup HEAD. **Plan addresses each conditionally**, pending Daniel clarification.

### Bug 1 — KG_INCREMENTS 26.6/25.4

- **If bug exists:** Pre-flight grep `src/config/weights.js` → use truth values 1/2.5/4.5/5 kg per matrix. Render KG buttons în `workout.js` set row dynamic from `weights.js` config, NU hardcoded mockup display.
- **If NOT exists (current mockup clean):** No fix needed. Mockup shows static "22.5 kg" pe 4 set rows = hardcoded display, but vanilla port reads from prediction engine + matrix config dynamically anyway.

### Bug 2 — "Altceva" 5-th repeat

- **If bug exists in state machine:** Audit `engine/coachContext.js` + `engine/ruleEngine.js` for Altceva loop signal. Vanilla port = state machine clean exit after first Altceva drill (no 5-iteration duplicate).
- **Current mockup:** 2 Altceva instances (831 + 845), both single-shot to pain-button. Port `painButton.js` = single-shot handler `goto('pain-button')`, NO loop.

### Bug 3 — Task S chart range

- **OUT OF ANTRENOR SCOPE.** Bug pertains to Istoric › Greutate timeline (1656–1697). Defer.

### Bug 4 — Task L splash setTimeout

- **OUT OF ANTRENOR SCOPE.** Splash = app shell, NOT Antrenor tab. Defer.

### Bug 5 — Bug 13 reload Refă onboarding

- **OUT OF ANTRENOR SCOPE.** Settings tab + onboarding state persistence. Defer.

**ZERO bugs Antrenor-internal blocker fixes needed în vanilla port.** Port proceeds on clean mockup baseline.

---

## §2.6 Risks identified

1. **V1 features pierdut în port:**
   - `renderIdle.js` 465 LOC → `idle.js` 180 LOC. Likely loses some signals: streak counter, last-session-recap card, BMR calorie burned strip. **Mitigation:** Diff renderIdle.js V1 vs idle.js V2 in BATCH 2 step 1 — explicit feature audit before delete.
   - `rating.js` 150 LOC → `postRpe.js` 70 LOC. Likely loses RPE-per-set granularity (V2 mockup = single session-wide RPE). **Mitigation:** Verify `engine/coachDirector` calibration accepts session-level RPE OR retain per-set capture as backend silent (NU UI). Daniel clarify în BATCH 2 prep.

2. **HTML inline → module ES refactor pitfalls:**
   - `goto('xxx')` global function pattern doesn't exist în src/ V1. Need router/navigation utility module created (e.g., `src/router.js` ~50 LOC). **Risk:** router scope creep — might need broader app shell rewrite. **Mitigation:** Antrenor router minimal (intra-coach navigation only), defer global router to BATCH N.
   - Persona conditional rendering — V2 CSS class `.marius-only` / `.persona-maria-only` shown via CSS display. Vanilla port = JS conditional render based on `state.profile.persona`. **Risk:** persona detection logic may live în engine/profileTyping but trigger timing async — render race possible. **Mitigation:** snapshot persona at mount, re-render on persona-change event.

3. **state.js mutation sites cross-module timing:**
   - 24 fields read by 36+ files. Port adds 2 fields (currentScreen, cevaNuMergeReason). Risk: race between router state mutation + screen render.
   - **Mitigation:** Mutate state.currentScreen ONLY before render call; render reads fresh. NO async mutation between.

4. **Engine import paths fragile dacă restructure src/:**
   - DELETE `renderIdle.js` + `rating.js` — any reverse imports from engine? Grep verify în BATCH 2 step 0.
   - **Mitigation:** Pre-flight `grep -rn "renderIdle\|rating" src/engine/` before delete.

5. **Mockup → src/ design fidelity drift:**
   - Mockup CSS tokens (`--ink`, `--paper`, `#c8412e`) — port to `src/themes/` or inline? V1 `themes/themes.js` exists. **Mitigation:** Use V1 theme manager + extend with mockup tokens (NO inline CSS în vanilla src/).

6. **Hidden ADR 005 conflict:**
   - ADR 005 §AMENDMENT 2026-05-08 explicit "React Migration LOCK V1 SUPERSEDE Vanilla". Port-first vanilla pivot 2026-05-10 IS NOT documented as §AMENDMENT in ADR 005. **Risk:** future vault reader sees "vanilla SUPERSEDED" + finds vanilla port-first work = confusion. **Escalation:** before BATCH 2 implement, Daniel writes ADR 005 §AMENDMENT 2026-05-10 reverting pivot OR confirms vanilla port = transitional bridge to React (port mockup → vanilla → React migration latent).

---

## §2.7 Tests strategy step 1

### vitest 2731 baseline expected break list

**Likely break (need rewrite/update):**
- `src/pages/coach/__tests__/renderIdle.test.js` — `renderIdle.js` deleted → test deletion or rewrite for new `idle.js`.
- `src/pages/coach/__tests__/sessionFixes.test.js` — depends on session.js trim/refactor → audit.
- `src/pages/coach/__tests__/sessionCdl.test.js` — coach decision log trigger paths preserved? audit.
- `src/pages/coach/__tests__/logging.test.js` — `logging.js` UNCHANGED → likely PASS.
- `src/pages/coach/__tests__/aaFrictionModal.test.js` — `aaFrictionModal.js` UNCHANGED → PASS.

### Coverage post-port plan

**New test files needed:**
- `src/pages/coach/__tests__/idle.test.js` — Programul săptămânii render + 5 templates dispatch.
- `src/pages/coach/__tests__/energyCheck.test.js` — 3 stări routing + cause drill 4 cauze.
- `src/pages/coach/__tests__/cevaNuMerge.test.js` — 4 options fan-out + reason mutation state.
- `src/pages/coach/__tests__/workout.test.js` — Sets table render + persona conditional + log set dispatch.
- `src/pages/coach/__tests__/postRpe.test.js` — 3-button submit + engine calibration trigger.

**Engine tests:** UNTOUCHED (per ADR 005 §AMENDMENT engine ZERO touch). 2731 baseline preserved minus rating.js + renderIdle.js deletions.

**Estimated coverage post-port:** ~2731 - 30 (deletions) + 80 (new tests) ≈ **2780 tests target**.

### Test rewrite scope

V1 test files irrelevant V2:
- `renderIdle.test.js` → archive (replace with `idle.test.js`)
- `sessionFixes.test.js` → audit cu BATCH 2 (may stay if session.js core logic preserved)

---

## §3 EXECUTION PLAN BATCH 2 (preview, NU în acest task)

BATCH 2 will be separate prompt CC autonomous task (NOT Task 1 scope). Sequence proposed:

1. Step 0: Pre-flight verify all assumptions §2.x against `feature/v2-vanilla-port` HEAD (state matches inventory).
2. Step 1: Create router minimal `src/router.js` + extend `src/state.js` +2 fields.
3. Step 2: Implement `idle.js` (Programul săptămânii) + delete `renderIdle.js`. Test idle.test.js. CI.
4. Step 3: Implement `energyCheck.js` + tests. CI.
5. Step 4: Implement `cevaNuMerge.js` + `painButton.js` + `equipmentSwap.js` + tests. CI.
6. Step 5: Implement `workout.js` (largest, ~250 LOC) + persona conditional + tests. CI.
7. Step 6: Extend `restTimer.js` SVG progress ring + tests. CI.
8. Step 7: Implement `postRpe.js` + delete `rating.js` + tests. CI.
9. Step 8: Trim `session.js` 359 → ~250 (orchestration only). Tests preserved. CI.
10. Step 9: Final smoke + 2780 baseline target + push branch.
11. Step 10: PR `feature/v2-vanilla-port` → main (Daniel review LOCK).

---

## §4 LOCK PARADIGM CHECKLIST (pre-BATCH 2)

Before BATCH 2 starts, Daniel confirm:

- [ ] ADR 005 reconciliation — §AMENDMENT 2026-05-10 vanilla port-first pivot LOCK V1 documented?
- [ ] Bug §1.4 source clarified (chat-strategic chat-N? vault doc path?)?
- [ ] V1 → V2 naming preserve `src/pages/coach/` (recommended) OR rename `src/pages/antrenor/`?
- [ ] state.js +2 fields (currentScreen, cevaNuMergeReason) acceptabil OR alt approach (router context object)?
- [ ] Persona conditional pattern: JS render conditional (recommended) OR CSS `.marius-only` / `.persona-maria-only` direct?
- [ ] V1 features audit: renderIdle 465→180 LOC + rating 150→70 LOC trim acceptabil OR retain features (streak, BMR strip, per-set RPE)?
- [ ] Test coverage target ~2780 acceptabil OR adjust?

**STOP after Daniel review.** BATCH 2 implement = separate prompt CC.
