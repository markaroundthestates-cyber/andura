# BATCH 1 — ANTRENOR PORT INVENTORY (mockup V2 → src/ vanilla JS)

**Branch:** `feature/v2-vanilla-port` (created from `main` HEAD `fa43d9c` 2026-05-10)
**Authority:** ADR 005 §AMENDMENT 2026-05-08 SUPERSEDED React → reverted port-first vanilla pivot per `fa43d9c docs(vault): port-first-then-React pivot LOCK V1` 2026-05-10. Vanilla forward LOCK V1 confirmed by Daniel commit message.
**Scope:** READ-ONLY inventory. ZERO src/ changes. ZERO branch merge `main`.

---

## §0 PRE-FLIGHT RESULT

| Check | Status | Note |
|-------|--------|------|
| ADR 005 vanilla AMENDMENT exists | ✅ PASS | But §AMENDMENT 2026-05-08 marks vanilla SUPERSEDED by React. Latest commit 2026-05-10 reverts pivot to port-first vanilla. **Vault discrepancy: ADR 005 still says "SUPERSEDED" — needs §AMENDMENT 2026-05-10 entry post-port LOCK to reconcile.** Flagged for Daniel. |
| ADR_MULTI_TENANT_AUTH path | ⚠️ SLIP | Prompt cited `ADR_MULTI_TENANT_AUTH.md`. Actual path = `ADR_MULTI_TENANT_AUTH_v1.md` (suffix `_v1`). Content found, proceeded. |
| Big 6 / onboarding / T0 in auth ADR | ✅ PASS | Big 6 lifecycle line 597; §AMENDMENT 2026-05-05.7 Big 5→Big 6; §AMENDMENT 2026-05-05.1 Auth-Required Post-T0. |
| src/ V1 antrenor module | ✅ PASS | Module = `src/pages/coach/` (NU `antrenor/` — V1 internal naming = "coach", V2 mockup tab id = `antrenor`, alias mapping mockup line 2067 `coach:'antrenor'`). |
| Mockup file exists | ✅ PASS | `04-architecture/mockups/andura-clasic.html` 2351 LOC total. |

**Fail-stop:** NU triggered. All required content located (with 1 path slip non-blocking).

---

## §1.1 src/ V1 Antrenor (= "coach" internal naming) existing

### File paths + LOC count

| File | LOC | Role |
|------|-----|------|
| `src/state.js` | 32 | Global session state singleton (24 mutable fields) |
| `src/pages/coach/session.js` | 359 | Main session orchestration |
| `src/pages/coach/renderIdle.js` | 465 | IDLE state rendering (tab landing) |
| `src/pages/coach/logging.js` | 228 | Set logging |
| `src/pages/coach/aaFrictionModal.js` | 215 | Auto-aggression friction modal |
| `src/pages/coach/modals.js` | 212 | Modal management |
| `src/pages/coach/rating.js` | 150 | RPE/rating capture |
| `src/pages/coach/restTimer.js` | 90 | Pause/rest timer |
| `src/pages/coach/util.js` | 88 | Utilities |
| `src/pages/coach/pr.js` | 71 | Personal records |
| `src/pages/coach/state.js` | 20 | Local module state cache (sessionCache, wakeLockRef, uiToggleFlags — distinct from `src/state.js`) |
| `src/pages/coach.js` | (top-level entry) | Module bootstrap |
| `src/pages/coach/__tests__/` | 5 files | sessionFixes, sessionCdl, renderIdle, logging, aaFrictionModal |

**Total V1 coach module:** ~1930 LOC (excluding tests + entry).

### Module ES imports/exports map (sampled)

- `src/state.js` → exports `state` singleton (24 fields) + `getState()` helper. Imported by: 36+ files including `pages/coach/*`, `engine/predictionEngine`, `engine/dp`, `engine/profileTyping`, `engine/autoAggressionDetection`, `engine/adherence`, `engine/coachDirector`, `util/dataCleanup`, `util/autoBackup`, `util/dataRegistry`, `pages/dashboard`, `pages/weight`, `pages/coach/{session,logging,modals,restTimer}`.
- `pages/coach/state.js` → local `sessionCache` TTL 5min + `_cachedDirectorValue` + `wakeLockRef` + `uiToggleFlags`. Used by coach internals only (NOT global).
- Engine imports from coach: heavy (engine pulls state, coach pulls engine outputs). Detail in §1.4.

### State mutation sites (cross-ref `src/state.js` 24 fields)

| Field | Mutated by | Read by |
|-------|------------|---------|
| sessActive, sessStart, sessTimer | session.js, restTimer.js | dashboard, util/autoBackup |
| sessLog | logging.js | session.js, engine/predictionEngine, engine/dp |
| currentEx, currentSet | session.js, logging.js | engine multiple |
| awaitingRPE, lastSetRPE | rating.js, logging.js | engine/predictionEngine, adherence |
| sessionKgOverride | session.js | engine/dp |
| completedExercises, sessionTotalExercises | session.js | dashboard |
| dropSetUsedThisSession | session.js | engine multiple |
| pauseTimer, pauseTotal, pauseLeft, lastPauseEndedAt | restTimer.js | session.js |
| isMuted, activeNotes, logDateOffset | session.js, util.js | UI render |
| sessKcalBurn, earlyStopReason, cdlEntryId, sessType | session.js, logging.js | engine, util/coachDecisionLog |

### Engine imports used by V1 Antrenor (preserved per ADR 005 §AMENDMENT)

V1 coach module imports from `src/engine/`:
- `predictionEngine` (set prediction)
- `dp` (double progression)
- `coachDirector` (orchestration)
- `adherence` (compliance tracking)
- `autoAggressionDetection` (AA friction trigger)
- `profileTyping` (cold-start profile)
- `restTimer` (pause logic — also coach-local)
- `prEngine`, `proactiveEngine`, `whyEngine`, `recompileEngine` (sampled via grep)

`src/engine/` total: ~50+ engine files including subdirs (`bayesianNutrition/`, `composite-signal/`, `deload/`, `dimensions/`, `energyAdjustment/`, `goalAdaptation/`, `pain-button/`, `periodization/`, `self-correction/`, `smart-routing/`, `specialization/`, `suflet-andura/`, `tempo/`, `warmup/`).

**ZERO touch needed during port** per ADR 005 §AMENDMENT.

### HTML inline JS handlers count V1 (anti-pattern legacy)

V1 src/ uses module ES patterns predominantly. HTML inline handlers exist primarily in `index.html` (entry) — NOT counted here per scope (port plan focuses Antrenor mockup → src/, not full app).

---

## §1.2 Mockup V2 Antrenor design

### HTML section LOC range

`04-architecture/mockups/andura-clasic.html` Antrenor cluster spans **748–1170 (~423 LOC)** across 8 screens:

| Screen | LOC range | Description |
|--------|-----------|-------------|
| Antrenor home (tab landing) | 748–786 | Programul săptămânii hero + 5 program templates + Acces rapid drill (2 buttons) |
| Energy check pre-sesiune | 788–808 | 3 stări 🟢🟡🔴 (Excelent/Normal/Obosit) |
| Energy cause drill | 810–822 | 4 cauze (Stres/Somn/Durere/Altul) |
| Ceva nu merge unified drill | 824–834 | Mă doare / Nu am aparat / Altceva / Anulează (4 opțiuni) |
| Pain button drill | 836–852 | 3 predefined + Altceva text input |
| Equipment swap drill | 854–868 | Text input liber (ADR 023) |
| Workout execution | 1012–1132 (~120 LOC) | Top bar timer, exercise card (tempo+RIR Marius / readable cue Maria), sets table 4 rows (KG / REPETĂRI / check), rest timer SVG circle, log set + finish buttons |
| Post-RPE recovery | 1134–1168 | 3 buttons ușor/potrivit/greu |

### Inline JS handlers in mockup Antrenor cluster

Mockup total: 176 `onclick=` + 19 `function` defs across full file. Antrenor cluster handlers (sampled):

- `goto('energy-check')` — line 765 (start session button)
- `goto('workout')` — lines 794, 798, 802 (energy 3 buttons) + 4 occurrences in cause drill (816–819) = 7 total within Antrenor
- `goto('energy-cause')` — line 802
- `goto('ceva-nu-merge')` — line 782
- `goto('pain-button')` — lines 829, 831 (Mă doare + Altceva)
- `goto('equipment-swap')` — line 830
- `goto('antrenor')` — line 1017 (workout exit X)
- `goto('post-rpe')` — line 1128 (Termină sesiunea)
- `back()` — multiple (sub-page back arrows)
- `showToast('...')` — 4 in templates (Forță/Slăbire/Longevitate/Sănătate confirmations)
- `toggleCue()` — line 1062 (chevron toggle execution tip)
- `toggleSet(this)` — lines 1085, 1091, 1097, 1103 (4 set checkbox handlers)
- `logCurrentSet()` — line 1124 (înregistrează setul)
- `submitPostRpe('ușor'|'potrivit'|'greu')` — lines 1143, 1150, 1157
- inline `document.getElementById('rest-timer').style.display='none'` — line 1121

### CSS classes used (theme-clasic tokens)

`coach-quote`, `body-text`, `small-text`, `paper-bg`, `screen`, `sub-page`, `sub-header`, `phone-scroll`, `btn-brick`, `btn-ghost`, `settings-section`, `settings-stack`, `settings-row`, `onb-opt`, `stack-row`, `back-btn`, `nav-tab`, `tab-active`, `set-row`, `set-num`, `set-val`, `set-check`, `energy-big`, `marius-only`, `persona-maria-only`, `mini-chart`. CSS vars `--ink`, `--ink-2`, `--ink-3`, `--paper`, `--paper-2`, `--line`, `--line-strong`, `#c8412e` (brick accent).

### DOM components

- **Hero card** Programul săptămânii (radial gradient brick on dark, name + week/day, time + exercise count, primary CTA)
- **Settings stack** (5 program templates with check-circle indicator pe activ)
- **Drill 2°** (2 buttons — Ceva nu merge + Bibliotecă)
- **Energy 3 cards** colorate (🟢🟡🔴) cu engine description
- **Cause stack** (4 onb-opt rows)
- **Workout exercise card** (current label, name + variant subtitle, play button, tempo/RIR Marius-only metadata strip dark, readable cue Maria-only persona-conditional, Cue toggleable execution tip, sets grid 4 rows)
- **Rest timer** (SVG progress circle 72×72 cu dasharray + monospace time + skip button)
- **Post-RPE 3 buttons** with emoji + RPE descriptor + engine action

---

## §1.3 Diff structural V1 ↔ V2

### Schimbat structural (paradigm shift, NU patch-able)

- **Routing approach:** V2 mockup uses `goto(name)` global function + `screen-{name}` ID containers (single-file pattern). V1 src/ uses module ES boot via `pages/coach.js` entry + sub-modules. Port = preserve V1 module ES boot, NU adopt mockup `goto()` global.
- **Idle state:** V1 has `renderIdle.js` 465 LOC heavy IDLE rendering. V2 mockup home is light (Programul săptămânii card + 5 templates + 2 drill buttons = ~40 HTML LOC). Port = simplify IDLE drastically using mockup design but RETAIN engine signals (active program, last session, BMR/TDEE state).
- **Persona conditional (Marius/Maria):** V2 mockup has `marius-only` / `persona-maria-only` CSS classes shown/hidden. V1 src/ — needs grep verify how V1 handles persona. Port = persona-conditional rendering în module ES (NU CSS class only — JS conditional render based on profile.persona).

### Cosmetic only (CSS theme tokens, layout adjust)

- Programul săptămânii hero card design (gradient + radial accent) = pure CSS port.
- Sets table grid layout (32px / 1fr / 1fr / 44px) = CSS port.
- Rest timer SVG progress ring = CSS + JS dasharray calc port.
- Energy 3-button stack styling = CSS port.

### Eliminate (V1 features removed în V2)

- **Legacy SALA / HOME / PROGRESS old chart / COACH stripped** per mockup line 1263 comment ("replaced by Antrenor + Progres + Istoric V1 LOCKED"). V1 may have residual code paths to old SALA tab — port phase removes those branches.
- Dropdown ranges (V1 may use); V2 uses range-tab text-toggles (1663–1666 — but Istoric, NOT Antrenor).
- 5-th repeat duplicate "Altceva" — see §1.4 below (NU verbatim found în mockup).

### Adăugat (V2 features new)

- **Ceva nu merge unified drill** (824–834) merged Pain+Equipment per CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1 SUPERSEDE ADR 023 split. New 4-option fan-out screen NOT în V1.
- **Energy cause 4-cauze blocking drill** (810–822) post 🔴 — V1 may have it but mockup formalizes 4 fixed (Stres/Somn/Durere/Altul).
- **Post-RPE 3-button** (1134–1168) — single întrebare RPE simplified Maria-readable. V1 has rating.js 150 LOC — likely more complex; port = simplify per mockup.
- **Personas split** Marius (tempo/RIR/RPE numeric strip) vs Maria (readable cue text) — V2 LOCKED design pattern post-Phase 3.5 single-theme decision.

---

## §1.4 Buguri JS V2 mockup Antrenor identified per-bug

> ⚠️ **CRITICAL FINDING — prompt slip flagged.** Per memory feedback "Grep before prompt CC", verbatim grep against mockup file produced **ZERO matches** for 4/5 bugs cited in prompt. Bug values may originate from chat-strategic vault state (audit chat record) NOT current mockup. Documented honestly per memory rule "verify origin/main vs local înainte de a critica halucinații".

### Bug 1: KG_INCREMENTS 26.6/25.4 inventat — **NOT FOUND**

- Grep `26\.6|25\.4` în `04-architecture/mockups/andura-clasic.html` → **0 matches**.
- Grep `kgIncrement|KG_INCR|increment` în mockup → **0 matches**.
- **Prod truth** (`src/config/weights.js`): incremente echipament = 1 kg / 2.5 kg / 4.5 kg / 5 kg per matrix (helcometru / lat pulldown / pec deck / gantere fixe). NU 26.6 / 25.4.
- Mockup display values for sets: **22.5 kg** (lines 1083, 1089, 1095, 1101) — single weight constant pe 4 set rows, NOT incremente.
- **Conclusion:** Bug "26.6/25.4 inventat" verbatim NU există în current mockup. Either fixed in prior chat-strategic edit, or values referenced from earlier mockup version not in HEAD `fa43d9c`. **Daniel re-clarification needed before vanilla forward fix.**

### Bug 2: "Altceva" 5-th repeat slip systemic — **PARTIAL / NOT VERBATIM**

- Grep `Altceva|altceva` în mockup → **2 matches** (line 831 — Ceva nu merge drill goes to `pain-button`; line 845 — Pain button drill text input toggle).
- Both go to pain-button flow. NO "5-th iteration duplicate" pattern visible.
- **Conclusion:** "5-th repeat" signature NU verifiable against current mockup. Possible interpretations: (a) state machine flow în coach-decision tree producing Altceva 5 times within session; (b) chat-strategic edit already removed 5-th iteration. **Daniel clarification needed.**

### Bug 3: Task S chart range incomplete visual-only — **NOT IN ANTRENOR**

- Chart/SVG/range în mockup Antrenor section (748–1170): **only Rest timer SVG ring** (1111–1114) — NU range chart.
- Range chart actually in **Istoric › Greutate & BF Timeline** (1656–1697) — 30/60/90/Tot range tabs + SVG viewBox 320×140.
- **Conclusion:** Bug pertains to Istoric tab, NOT Antrenor. Out of Antrenor port scope. **Defer to separate Istoric port task.**

### Bug 4: Task L splash setTimeout edge cases — **SINGLE INSTANCE FOUND**

- Grep `setTimeout|splash` în mockup → 4 setTimeout calls + 1 splash entry:
  - Line 2192: `setTimeout(() => inp.focus(), 50)` — input focus race fix benign
  - Line 2298: `toastT = setTimeout(() => t.classList.remove('show'), 2500)` — toast lifecycle
  - Line 2312: splash boot setTimeout (single instance, NOT race-prone)
  - Line 2314: `if (cur && cur.id === 'screen-splash')` — guard within boot
- NU "multiple triggers" / race conditions verbatim observable.
- **Conclusion:** Splash boot is **single setTimeout with guard**. Bug "edge cases" likely refers to runtime issue in V1 src/ (NOT mockup), or to chat-strategic earlier audit. Out of Antrenor port direct scope (splash = app shell, NOT Antrenor tab). **Defer or clarify.**

### Bug 5: Bug 13 reload Refă onboarding broken — **OUT OF ANTRENOR SCOPE**

- "Refă onboarding" în mockup: lines 1594 (Settings entry) + 1730–1739 (confirm sub-page) — clean flow visible.
- NU "broken reload path" verbatim.
- Refă onboarding lives în **Settings tab**, NOT Antrenor. Out of Antrenor port scope.
- **Conclusion:** Bug pertains to Settings tab + onboarding state persistence post-reset. **Defer to separate Settings/Onboarding port task.**

### §1.4 SUMMARY

**4/5 bugs cited in prompt §1.4 are EITHER (a) NOT verifiable verbatim in current mockup HEAD `fa43d9c`, OR (b) out of Antrenor port scope (chart=Istoric, splash=shell, reload=Settings).** Per memory feedback "Grep before prompt CC", flagging honestly. Recommend Daniel clarify bug §1.4 source (chat-strategic chat-N? vault audit doc path?) before vanilla forward fix planning.

**ZERO bugs verifiable as Antrenor-internal blockers in current mockup. Port can proceed on clean mockup design baseline.**

---

## §1.5 Open questions for Daniel (escalation post-inventory)

1. **ADR 005 reconciliation:** §AMENDMENT 2026-05-08 still says vanilla SUPERSEDED by React. Latest commit 2026-05-10 reverses pivot to port-first vanilla. **Add §AMENDMENT 2026-05-10 entry post-port confirming pivot back?** (Recommended before vanilla forward LOCK V1 lands în production tests.)
2. **Bug §1.4 source:** Where do bug references (26.6/25.4, 5-th Altceva, Task S/L, Bug 13) originate — chat-strategic audit chat-N or vault doc path? Need pointer for fix planning.
3. **V1 → V2 naming:** Keep `src/pages/coach/` directory (V1 internal) or rename `src/pages/antrenor/` (V2 RO branding match)? **Recommendation: PRESERVE `src/pages/coach/`** — engine imports stable + 36+ cross-file references avoided rename churn. Tab id `antrenor` în UI layer only.
