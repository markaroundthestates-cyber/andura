═══ START PROMPT CC TASK Q ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/weight.js` saveW + saveWeight + adj + lockWeight + unlockWeight
- Read `src/firebase.js` sync layer pentru greutate persistence
- Read mockup cross-skin × 4: profil page greutate display + Logare greutate handler
- Daniel verbatim: *"Dupa ce loghez greutatea nu trebuie sa se duca si la profil?"*
- Verify: profil page citește greutate din SYS.getCurrentKg() sau localStorage 'weights' key

§1 SCOPE (atomic)
Bug pre-existent: după log greutate (saveW), profil page NU reflectă noua greutate. Sync state broken sau profil citește stale state.

Fix: saveW → persist localStorage 'weights' + update SYS.getCurrentKg() + invalidate profil cache + re-render profil display.

Source-of-truth `src/pages/weight.js` saveW pattern — verify mockup port complete.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Logare greutate (e.g., 75kg → 74.5kg) → click save
- Profil page (Cont/Setări/etc) afișează 74.5kg după refresh sau imediat
- localStorage 'weights' persisted corect
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-Q-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): greutate logare sync → profil display cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK Q ═══
