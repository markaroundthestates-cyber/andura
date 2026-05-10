═══ START PROMPT CC TASK O ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/engine/*` complete pentru weight progression engine: getIncrement + recommend + applyTo + DP module + AA module
- Read `src/constants.js` pentru EX_WEIGHT_INCREMENTS / weight scheme map per exercise
- Read `src/pages/coach/logging.js` editSessionKg + adjSessionKg + confirmSessionKg + confirmEditKg flow
- Read andura.app prod existing: weight increments per exercise (compound vs isolation, dumbbell vs barbell, kettlebell etc) — multiple progression schemes
- Daniel verbatim: *"sper ca o sa se mapeze engine cand schimbi greutatea si reps exact cum trebuie... cu multiplele de greutati pe care le avem pe andura.app acum ca sunt bune, si la greutate aici trebuie sa ai si manual input sa nu apesi de 300 ori pe +/- sa ajungi unde trebuie"*

§1 SCOPE (atomic)
Bug Phase pre-existent escapat: Antrenor mockup-uri cross-skin × 4 lipsesc:
A. Engine map multiple greutăți increments per exercise (compound +2.5/+5kg vs isolation +1/+2kg vs dumbbell +1.25kg etc — port din src/engine prod source-of-truth)
B. Manual kg input field — direct number entry, NU doar +/- buttons (300+ taps inacceptabile)

Fix:
- editSessionKg → input field text/number direct + numpad mobile + confirm (NU just +/-)
- adjSessionKg keep +/- ca shortcut DAR cu increments per exercise (DP.getIncrement(currentEx))
- Engine adaptive când user schimbă greutate: log + update DP recommendation pentru next session

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`
- (Verify: src/engine/* probabil deja are increments correct — mockup port)

§3 ACCEPTANCE CRITERIA
- Click pe kg display → input field manual editable (number/text) + numpad mobile-friendly
- +/- buttons preserve cu increments per exercise (compound 2.5kg, isolation 1kg, dumbbell 1.25kg etc per src/engine)
- Confirm/blur → state.sessionKgOverride update + log entry corect
- Engine map adaptive: log persisted + DP.recommend next session reflects user override
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-O-$(date +%Y%m%d_%H%M)

§5 COMMIT
feat(skin): manual kg input + engine increments per exercise cross-skin × 4

§6 RAPORT format invariant + flag dacă src/engine necesită update (probabil NU, mockup port).
═══ END PROMPT CC TASK O ═══
