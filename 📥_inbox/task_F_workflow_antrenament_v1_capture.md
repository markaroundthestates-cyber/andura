═══ START PROMPT CC TASK F ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY (extract verbatim source-of-truth)
- Read FULL `src/pages/coach/session.js` (lifecycle: startSession + skipExercise + cancelWorkout + endSession + finishEarly + confirmEarlyStop + setupInactivity + requestWakeLock + releaseWakeLock)
- Read FULL `src/pages/coach/logging.js` (per-set: setDone + confirmReps + selectRPE + adjSessionReps + renderSessLog + editSessionKg + adjSessionKg + confirmSessionKg + confirmEditKg + toggleMute)
- Read FULL `src/pages/coach/restTimer.js` (startPause + stopPause + skipPause + tickPause + setupInactivity + INACTIVITY_DELAY)
- Read FULL `src/pages/coach/modals.js` (showReadinessModal + selectReadiness + showSkipModal + confirmSkip + showAlternativeModal)
- Read `src/pages/coach.js` orchestrator exports
- Read `src/main.js` window.* exports for HTML onclick
- Read `src/pages/coach/state.js` (sessionCache + wakeLockRef + uiToggleFlags)
- Read `src/styles/main.css` for: `.session-ui` + `.coach-top` + `.coach-icon` + `.coach-msg` + `.coach-action` + `.coach-detail` + `.rec-row` + `.rec-item` + `.rec-val` + `.rec-unit` + `.rec-range` + `.pause-card` + `.pause-timer` + `.pause-fill` + `.btn-skip` + `.set-actions` + `.btn-done` + `.rpe-inline` + `.sets-dots`
- Read `03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.3 Energy Adjustment` (3-state 🟢🟡🔴 readiness)
- Cross-ref `00-index/CURRENT_STATE.md §JUST_DECIDED 2026-05-10` (Workflow V1 LOCK source-of-truth `src/pages/coach/session.js`)

§1 SCOPE (atomic — workflow antrenament V1 capture cap-coadă)
Daniel directive verbatim cap-coadă (chat ACASĂ post-smoke pivot 2026-05-10):
"incepi sesiunea, zici cum te simti... imediat iti zicea cu ce incepi si cate serii ai, greutati reps tot... dupa ce dadeai finish la primul set te intreba cate reps ai facut si cu ce greutate fata de ce ti-a zis coatch, si cum ai perceput greutatea, incepea pauza... avea buton skip pauza cu warning integrat care chiar mergea catre engine sa inteleaga ca daca ai sarit pauza s-ar putea sa nu fi full pt next set.... next set incepea automat... si asa mai departe."

Source-of-truth = `src/pages/coach/session.js` + companion modules. Port verbatim flow + state machine + UI elements în cele 4 mockup files (cross-skin × 4 Theme Parity Invariant V1 strict).

WORKFLOW V1 SPEC (10 phases):

**PHASE 1 — PRE-SESSION**
- State idle: today-screen visible (renderCoachIdle)
- CTA: "Începe sesiunea" → startSession()

**PHASE 2 — SESSION INIT**
- startSession() → state.sessActive=true + state.sessStart=Date.now() + state.sessLog=[] + sessTimer=setInterval(tickSess,1000) + requestWakeLock + setupInactivity (2min auto-pause + 5min sinceLastRest threshold) + auto-select first exercise (state.currentEx = todayExs[0], state.currentSet=1) + updateExCard + renderSessLog
- today-screen=none + session-ui=block

**PHASE 3 — READINESS (Energy 3-state 🟢🟡🔴)**
- showReadinessModal() → 3 buttons (energetic 🟢 / normal 🟡 / tired 🔴) → selectReadiness(state) → engine flag for adjustments
- ADR 026 §9.3: state determines load multiplier

**PHASE 4 — UPDATE EX CARD (per exercise)**
- updateExCard() reads state.currentEx + state.currentSet + DP.recommend(currentEx) + AA.applyTo() + EX_SETS[currentEx]
- Display:
  - coach-msg-box (autoAdjustMsg if applicable: "Greutatea ajustată automat · −/+ X kg")
  - tempo-row (tempo + technique + autoAdjusted indicator)
  - sets-dots (progress per set 1..N visual)
  - rec-row (kg + reps target + range)
  - set-actions display:flex (button "Done" + skip)
  - rpe-inline display:none initially
- speak optional TTS

**PHASE 5 — SET DONE FLOW**
- User does set physically
- setDone() → beepDone + hide set-actions + show rpe-inline (RPE buttons + reps adjust + kg adjust)
- User can:
  - selectRPE(rpe) {6.5:'easy', 8:'ok', 9:'hard', 10:'very-hard'} → state.lastSetRPE=rpe + UI highlight selected (.sel class)
  - adjSessionReps(±) → state.sessRepsInput modified (1-30 range)
  - editSessionKg / adjSessionKg → state.sessionKgOverride
- confirmReps(skipped=false) →
  - rpe = skipped ? undefined : state.lastSetRPE
  - state.lastSetRPE = null (reset)
  - logEntry = {date, ex, w, kg, set, sets:1, reps, notes, ts, session, rpe?}
  - logs.unshift(logEntry) + DB.set('logs', logs.slice(0,5000))
  - state.sessLog.push({ex, w, set, reps, rpe?})
  - saveDraft()

**PHASE 6 — AUTO-ADVANCE**
- If state.currentSet >= totalSets:
  - state.completedExercises.add(state.currentEx)
  - updateSessionProgress
  - If next exercise exists: state.currentEx=nextEx + state.currentSet=1 + startPause(getSmartPause(currentEx), nextEx)
  - Else: speak "Antrenament complet!" + endSession()
- Else: state.currentSet++ + startPause(getSmartPause(currentEx), currentEx)

**PHASE 7 — REST PAUSE**
- startPause(seconds, nextEx) → display pause-card.active + pauseTimer=setInterval(tickPause, 1000) + pause-fill progress bar
- tickPause: pause-timer countdown + beep last 3 sec + when ≤ 0 → state.lastPauseEndedAt=Date.now() + stopPause + hidePauseScreen + beepAlert + speak "{nextEx}. Gata!" + updateExCard (next set ready) — AUTO-ADVANCE
- skipPause() → stopPause + hidePauseScreen + updateExCard + toast "⚠️ Pauza scurtă poate reduce performanța la setul următor" — engine flag via lack of state.lastPauseEndedAt update

**PHASE 8 — INACTIVITY GUARD**
- setupInactivity → window listeners (click, touchstart, keydown, mousemove) → 2 min timer → if state.sessActive && !pauseTimer && sinceLastRest > 5min → startPause(getSmartPause(currentEx), currentEx) + toast "⏸ Pauză automată – inactivitate 2 min"

**PHASE 9 — END SESSION**
- endSession() → clearDraft + teardownInactivity + clearInterval(sessTimer) + stopPause + state.sessActive=false + releaseWakeLock + cancel speech
- Summary calc: totalVolume, totalSets, uniqueEx, avgRPE, mood label
- showSessionRating modal → rateSession(stars)
- closeSummary → renderCoachIdle

**PHASE 10 — CANCEL FLOW**
- cancelWorkout() → confirm dialog "Anulezi antrenamentul? Nicio dată nu va fi salvată." → CDL populateOutcome + reset state + cancel speech + session-ui=none + hidePauseScreen + today-screen=block + toast "❌ Antrenament anulat" + renderCoachIdle

**UI ELEMENTS (cross-skin × 4 Theme Parity Invariant V1 — IDENTIC):**
- session-ui (container session active)
- coach-top + coach-icon + coach-msg + coach-action + coach-detail + coach-reason
- rec-row + rec-item (kg + reps recommend display)
- sets-dots (progress indicator per set)
- pause-card + pause-label + pause-timer + pause-sub + pause-progress + pause-fill + btn-skip
- set-actions + btn-done
- rpe-inline (rpe-btn-easy/ok/hard/very-hard) + adjustare reps + adjustare kg
- sess-log (rendered log per set live)
- sess-progress-txt
- session-reps (curent input)
- mute-btn

**PALETTE/TYPOGRAPHY DIVERGENT cross-skin ONLY (Theme Parity Invariant V1):**
- Clasic: cremos baseline V2 var(--accent) cyan/lime + Bebas Neue 22-80px headings
- Living Body: dark navy + auriu cald
- Luxury: dorat opulent
- Brain Coach: electric blue futurist

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Workflow 10 phases captured complete cross-skin × 4 (open mockup → click "Începe sesiunea" → readiness 🟢🟡🔴 → ex 1 set 1 → set done → RPE 4-tap → confirm → pauza countdown → next set auto → repeat)
- Skip pauza warning toast + engine flag visible
- Auto-advance pauză → next set automatic (NO manual click intermediate)
- Edit manual kg + reps post-set inline (rpe-inline cu adj buttons)
- 3-state ENERGY 🟢🟡🔴 readiness modal at session start (or before exercise 1)
- RPE 4-tap input post-set inline (easy/ok/hard/very-hard)
- Skip pauza engine flag (lack of lastPauseEndedAt update + toast warning vizibil)
- Inactivity 2 min auto-pause guard
- Cancel workout flow + endSession summary modal
- Cross-skin × 4 Theme Parity Invariant V1 strict (palette divergent OK, flow + UI placement + butoane IDENTIC)
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-F-$(date +%Y%m%d_%H%M)

§5 COMMIT
feat(skin): workflow antrenament V1 capture cap-coadă cross-skin × 4 source-of-truth src/pages/coach

§6 RAPORT format invariant per Task A. Plus highlight workflow V1 spec 10 phases captured + screenshot reference recommended (DevTools mobile iPhone 14 Pro per Daniel hint).
═══ END PROMPT CC TASK F ═══
