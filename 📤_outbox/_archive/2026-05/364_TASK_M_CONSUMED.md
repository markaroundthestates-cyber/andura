═══ START PROMPT CC TASK M ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/coach/logging.js` setDone + confirmReps + state.currentSet logic
- Read `src/pages/coach.js` updateExCard + sets-dots rendering
- Read mockup files cross-skin × 4 pentru Antrenor session UI: set indicators (sets-dots) + click handlers per set
- Verify: prod source-of-truth NU permite advance to set N+1 fără setDone(N) → confirmReps(N) finalize
- Mockup probabil are sets-dots clickabile direct (bug — should be sequential gate)

§1 SCOPE (atomic)
Bug Daniel verbatim: *"La antrenament cum de te lasa sa dai bifa in advenced? Adica eu sunt la setul 2 si pot bifa setul 4???"*

Fix: set advance sequential gate. State machine:
- state.currentSet = N (active set)
- Sets 1..N-1 = completed (visual filled)
- Set N = active (visual highlighted, clickabil "Setul e gata")
- Sets N+1..total = locked (visual dimmed, NU clickabile)

NU permis click pe set N+2/N+3 etc. NU permis bifă advance jump.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`
- (Verify dacă fix needed în `src/pages/coach.js` updateExCard sets-dots — probably mockup-only UI gate)

§3 ACCEPTANCE CRITERIA
- Click set N+1/N+2/etc.. → NU action (sau toast "Finalizează setul {N} întâi")
- Set N done → confirmReps → state.currentSet++ → set N+1 unlocked, set N filled
- Visual feedback clar: completed/active/locked states distincte
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-M-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): workflow set advance sequential gate cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK M ═══
