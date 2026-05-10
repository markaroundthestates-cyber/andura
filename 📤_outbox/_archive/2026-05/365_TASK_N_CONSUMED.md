═══ START PROMPT CC TASK N ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/coach/restTimer.js` startPause + tickPause + stopPause real implementation
- Read mockup cross-skin × 4 pentru pause-card + pause-timer + pause-fill JS handlers
- Daniel verbatim: *"timerul e blocat la 1:18"* — tickPause NU descrește
- Verify: state.pauseLeft initial value + setInterval(tickPause, 1000) + decrement logic + display update

§1 SCOPE (atomic)
Bug critic Task F escapat: pause timer mockup blocat la 1:18 (sau valoare initial), NU descrește countdown.

Fix: tickPause real countdown:
- startPause(seconds, nextEx) → state.pauseLeft = seconds + setInterval(tickPause, 1000) + display "M:SS"
- tickPause: state.pauseLeft-- + update display + beep last 3 sec + when ≤ 0 → stopPause + speak nextEx + updateExCard
- skipPause: stopPause + toast warning ⚠️
- Visual: pause-fill progress bar transition width

Source-of-truth `src/pages/coach/restTimer.js` — port verbatim în mockup-uri cross-skin × 4.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- startPause → countdown M:SS descrește 1 sec/sec
- pause-fill progress bar fills proportional
- Beep last 3 sec
- Skip button: stopPause + toast warning
- Auto-advance când 0 (next set unlocked)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-N-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): pause timer tickPause real countdown cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK N ═══
