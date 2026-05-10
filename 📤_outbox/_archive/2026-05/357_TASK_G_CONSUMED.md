═══ START PROMPT CC TASK G ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` Cluster #4 Istoric Tasks 16-18 deferred audit-only
- Grep: `04-architecture/mockups/andura-clasic.html` for `calendar-day` + `day-cell` + click handler day open detail
- Grep: cross-skin × 4 same pattern
- Pattern reference: zilele calendar trebuie clickuibile → modal/page detail zi (sesiune + greutate + kcal + alte logs)

§1 SCOPE (atomic)
Bug Phase 3 deferred confirmed smoke: Andura Clasic — zilele din calendar Istoric NU sunt clickuibile. Tap pe zi NU deschide nimic.

Fix: zilele calendar (cu logs prezente) → click handler → deschide modal/page detail zi cu:
- Sesiune antrenament zi (dacă există): exerciții + seturi + reps + kg + RPE
- Greutate zi
- Kcal logged
- Note / observații

Zilele FĂRĂ logs → click → toast "Nicio activitate înregistrată în această zi" (sau similar lean).

Cross-skin × 4 Theme Parity Invariant V1.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click pe zi cu logs → modal/page detail zi visible
- Click pe zi fără logs → toast informativ
- Detail zi conține: sesiune (dacă există) + greutate + kcal + note
- Visual feedback hover/active state pe zile clickuibile (cursor pointer)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-G-$(date +%Y%m%d_%H%M)

§5 COMMIT
feat(skin): istoric calendar zile clickuibile detail zi cross-skin × 4

§6 RAPORT format invariant per Task A.
═══ END PROMPT CC TASK G ═══
