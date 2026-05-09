# LATEST — Themes Batch 2b-iii Living Body Modal HALT + Body Fatigue Q1 V2 Prep

**Status:** ⚠️ Partial (Task 1 HALT premise invalidated, Task 2 ✅ Complete per user direction)
**Model:** Opus
**Date:** 2026-05-09 2142
**Backup tag:** `pre-themes-batch2b-iii-living-body-modal-q1-2026-05-09-2142` (pushed origin)
**Authority:** `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-09 Q1 + §NOW Mid-flight Batch 2b items #5 + #6

---

## Task 1 — Modal "Confirmă acțiunea" — HALT (premise invalidated)

### PHASE 1.1 — Audit findings

**Critical canonical finding line 90:**
```css
/* (Modal backdrop removed — V1 LOCKED zero-modals rule.) */
```

**Living Body confirm pattern is NOT modal — it's sub-page screens:**

| goto target | screen ID line |
|-------------|----------------|
| `goto('confirm-reset-coach')` line 1763 | `screen-confirm-reset-coach` line 1797 ✅ |
| `goto('confirm-redo-onboarding')` line 1764 | `screen-confirm-redo-onboarding` line 1901 ✅ |
| `goto('confirm-schimba-faza')` line 1765 | `screen-confirm-schimba-faza` line 1812 ✅ |
| `goto('confirm-logout')` line 1781 | `screen-confirm-logout` line 1916 ✅ |
| `goto('confirm-delete')` line 1782 | `screen-confirm-delete` line 1931 ✅ |

All 5 goto targets resolve perfectly to existing screen IDs. Pattern uses `goto('confirm-X')` → standard `.screen.active { display: flex }` mechanism (line 67-68). `runConfirm(msg)` handler (line 2283) does `back()` + `showToast(msg)` — clean exit. No backdrop. No z-index issues. No opacity bugs. No modal/dialog/popup/overlay CSS classes.

**HALT criteria triggered per prompt §PHASE 1.1:** "Modal structure absent → flag, NU implement, escalate Daniel."

**User decision via AskUserQuestion (2026-05-09 ~21:48):** Skip Task 1 (premise invalidated by V1 LOCKED zero-modals rule). Proceed Task 2 standalone.

### PHASE 1.2 — Implementation: SKIPPED (no modal exists to fix)

### PHASE 1.3 — Browser smoke test instructions for Daniel

If Daniel still observes "ecran negru translucent fără confirmation prompt visible" symptom in Living Body:
1. Specify exact button click that triggers it (which screen-X → which button? settings-row → goto('confirm-X')?)
2. Confirm browser/device viewport (desktop vs mobile, screen size)
3. Confirm browser DevTools console errors visible at the moment the symptom appears
4. Try repro in fresh incognito window (avoid cached state from prior dev sessions)

Likely real cause if persistent: `.persona-pill` (lines 249-261, `position: fixed; top: 24px; right: 24px; z-index: 100; background: rgba(20,18,15,0.92); backdrop-filter: blur(12px)`) — dark translucent overlay that COULD partially obscure confirm content if viewport sizing is off. NOT modified this batch (out of scope without confirmed repro).

---

## Task 2 — Body Fatigue Q1 V2 Prep Wiring — ✅ Complete

### PHASE 2.1 — Audit findings

- `src/engine/muscleMap.js` ✅ exists (4481 bytes, 19 fine-grained MUSCLE_HEADS: chest_upper/mid/lower, delt_front/mid/rear, tri_long/lateral/medial, bi_long/short, lat, mid_trap, rear_delt_trap, lower_back, quad, hamstring, glute, calf — note: core not in engine, mockup uses 7-grupe aggregation per Q1 LOCKED spec)
- `src/engine/weaknessDetector.js` ✅ exists (4325 bytes)
- Living Body anatomy stage: `screen-antrenor` line 805 → `lb-stage` line 807 → `lb-body` line 816 → SVG body silhouette with existing muscle group ellipses lines 893-914 (chest 2 + shoulders 2 + biceps 2 + forearms 2 + abs 1 + quads 2 = 11 elements existing)
- Existing animation classes (preserved): `m-tired` (chest), `m-ready/m-ready-2` (shoulders), `m-ready-3` (biceps), `m-ready-2` (abs), `m-strain` (quads) — animations are scale/opacity transforms only (lines 413-417), no fill — safe coexist with new `.muscle-zone` class CSS
- Existing `data-muscle` attributes: NONE (anti-duplicate clean ✅)
- Existing fatigue/recovering CSS classes: NONE (anti-duplicate clean ✅)
- JS insertion point: line ~2466 (post Batch 2b-ii splash auto-advance setTimeout, before `</script>`)

### PHASE 2.2 — Implementation modifications

**SVG annotation (refactor existing per execution rule #6, preserve visual 100%):**
- chest 2 ellipses lines 894-895 → added `class="m-tired muscle-zone" data-muscle="chest"`
- shoulders 2 ellipses lines 898-899 → added `data-muscle="shoulders"` + `muscle-zone` class
- biceps 2 ellipses lines 902-903 → added `data-muscle="biceps"` + `muscle-zone` class
- abs (core) 1 ellipse line 910 → added `data-muscle="core"` + `muscle-zone` class
- quads (legs) 2 ellipses lines 913-914 → added `data-muscle="legs"` + `muscle-zone` class

**SVG additions (new ellipses for grupes absent in front-view silhouette):**
- triceps 2 ellipses (lateral arm hint, opacity 0.45, subtle): `data-muscle="triceps"` cx=138/242 cy=232
- back 1 ellipse (front-view abstract hint behind torso, opacity 0.30): `data-muscle="back"` cx=190 cy=220

**CSS rules added** (after line 420 `.aura.delay`, before `.lb-recovery`):
```css
.muscle-zone { transition: fill 0.5s ease, opacity 0.5s ease; }
.muscle-zone.fatigue-fresh    { fill: rgba(212, 165, 116, 0.55); }  /* auriu soft = fresh ready */
.muscle-zone.recovering-light { fill: rgba(212, 165, 116, 0.30); }  /* auriu fade = light recovery */
.muscle-zone.recovering-deep  { fill: rgba(139, 132, 112, 0.50); }  /* gri-auriu = deeper recovery */
.muscle-zone.fatigued         { fill: rgba(190, 95, 70, 0.65); }    /* roșu pământiu muted = fatigued */
```
Token discipline: hardcoded RGBA matching Living Body palette (auriu `#d4a574` rgb(212,165,116) + silver `#8b8470` rgb(139,132,112) + roșu pământiu `#be5f46` rgb(190,95,70) muted, NU alarmist).

**JS function added** (after splash auto-advance setTimeout, before `</script>`):
- `function applyMuscleState(state)` — iterates `[data-muscle][class*="muscle-zone"]` selector, removes all 4 state classes, adds correct one per `state[muscle]` value (default 'fresh')
- `const DEMO_MUSCLE_STATE` — "post upper-body day" scenario per prompt: chest+shoulders+triceps=fatigued, biceps=recovering_light, back+legs+core=fresh
- Auto-call `applyMuscleState(DEMO_MUSCLE_STATE)` on script execution (V1 visual demonstration)

**Plug-and-play React migration:** future swap is 1-line:
```js
// V1 (now): applyMuscleState(DEMO_MUSCLE_STATE);
// V2 (React):  applyMuscleState(useMuscleState());
```

### PHASE 2.3 — Verify

- **data-muscle 7 grupe grep:** 12 elements total covering 7 unique grupes (chest, shoulders, back, biceps, triceps, legs, core) ✅ (expected ≥7)
- **CSS states:** fatigue-fresh=1 / recovering-light=1 / recovering-deep=1 / fatigued=1 ✅ (each ≥1)
- **applyMuscleState function + DEMO refs:** function=1, DEMO_MUSCLE_STATE=4 (declaration + 1 call + comment refs) ✅ (≥2)
- **Other skins untouched:** clasic + brain-coach + luxury all `git diff --stat` empty ✅

---

## PHASE 3 — Tests + Commit + Push

- **Tests:** 2731 PASS / 0 FAIL (148 files) — baseline preserved exactly (mockup-only edits, ZERO src/ changes)
- **Diff stat:** 64 insertions(+), 14 deletions(-) on `04-architecture/mockups/andura-living-body.html` — additive plus inline refactor of 5 existing comments+ellipse classes
- Commit SHA: `4c79fbc9ab8d41374a19a5349736037e4d122795`
- Push status: `pushed origin/main` (range `7a1f4d1..4c79fbc`) confirmed via `git log -1 --format='%H %s'`

---

## Issues (drift / push-back / ambiguity)

- **Task 1 PREMISE INVALIDATED:** prompt described "Modal Confirmă acțiunea z-index/opacity fix" but Living Body has NO modal — line 90 explicit canonical comment "Modal backdrop removed — V1 LOCKED zero-modals rule". All 5 confirm flows are sub-page screens working correctly via standard goto() routing. User confirmed via AskUserQuestion to proceed Task 2 only. Daniel should provide concrete browser repro if symptom persists in next batch (likely `.persona-pill` overlay, NOT modal).
- **Engine-vs-mockup grupe gap:** `src/engine/muscleMap.js` has 19 fine-grained heads (chest_upper/mid/lower etc) — Q1 LOCKED 7-grupe spec is canonical aggregation for visual UI. V2 React migration needs aggregator: 19 heads → 7 grupes per applyMuscleState. NOT in scope this batch (mockup wiring only).
- **`core` grupe not in engine MUSCLE_HEADS:** core is mockup-canonical (per Q1 LOCKED) but absent from `src/engine/muscleMap.js`. V2 migration needs engine extension OR core derived from abs/lower_back composite. Flagged for ADR followup.
- **Front-view silhouette limitation:** existing SVG is front-only — back + triceps not anatomically visible. Added subtle abstract hints (back: behind-torso ellipse opacity 0.30; triceps: lateral arms opacity 0.45) for V2 wiring completeness without breaking visual narrative. Future SVG could include rear silhouette toggle.

---

## Next action

Batch 2b-iv: Luxury onboarding bugs deep CSS audit (slider age overlap + sex selector + antecedente unresponsive + frecvență cards II/III/IV/V culori inconsistente WCAG). Single skin Luxury, deep CSS focus, MEDIU risk.

Optional follow-up Task 1 re-investigation: Daniel provide exact browser repro (button + screen + viewport) for "ecran negru translucent" symptom OR confirm V1 LOCKED zero-modals canonical and Task 1 obsolete (close as won't-fix).
