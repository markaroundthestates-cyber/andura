═══ START PROMPT CC TASK U ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/weight.js` shiftLogDate + showDayDetail + closeDayDetail + renderDailyDropdown
- Read mockup cross-skin × 4: Loguri recente / Recent logs panel + click handler per log row
- Daniel verbatim: *"La loguri recente ai optiunea sa apesi pe ele dar nu se intampla nimic"*
- Verify: log row onclick wired la showDayDetail / openDayDetail / drill-down modal

§1 SCOPE (atomic)
Bug pre-existent: Loguri recente panel rows clickabile dar handler missing. Click NU deschide detail.

Fix: log row onclick → showDayDetail(date) → modal/page detail zi cu:
- Sesiune antrenament (dacă există): exerciții + seturi + reps + kg + RPE
- Greutate logged
- Kcal logged
- Note

Cross-ref Task G (Istoric calendar zile clickuibile) — pattern similar.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click pe log row → drill-down modal/page detail zi
- Detail conține: sesiune (dacă există) + greutate + kcal + note
- Close modal/back navigation funcțional
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-U-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): loguri recente click drill-down detail zi cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK U ═══
