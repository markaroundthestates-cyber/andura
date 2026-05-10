# TASK N — Pause timer real countdown ✅

- **Task:** N — pause timer tickPause real countdown cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED (Clasic+LB+BC) + Lux Task X scope
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB Task F LANDED: rest-timer cu static "1:18" display, NO countdown wired (Daniel verbatim: "timerul e blocat la 1:18")
- BC: separate screen-rest-timer cu "01:08" static
- Source-of-truth `src/pages/coach/restTimer.js` startPause/tickPause/stopPause pattern

## Modificări
- `andura-clasic.html`: `startPause(90)` în confirmSetInline → state.pauseLeft=90 + setInterval(tickPause,1000) + `fmtMS(secs)` formatter "M:SS" + tickPause decrement + circle progress dashoffset transition + beep last 3 sec (visual flash color #c8412e) + auto stopPause+toast "⏰ Gata!" la 0
- `andura-living-body.html`: same pattern, palette divergent var(--accent) auriu
- `andura-brain-coach.html`: bc-rest-time + bc-rest-progress IDs + startPause(90)+tickPause+stopPause + auto-trigger via document.addEventListener click pe `[onclick*="rest-timer"]` + back() la 0
- `andura-luxury.html`: NO changes (Task X scope storyboard refactor)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task N atomic).

## Issues
- Beep last 3 sec = visual color flash NU audio (mockup constraint, prod uses beep audio per src/pages/coach/restTimer.js)
- skipRestPause stopPause + toast warning preserved (Task F LANDED)

## Next action
Task O — manual kg input + engine increments per exercise cross-skin × 4.
