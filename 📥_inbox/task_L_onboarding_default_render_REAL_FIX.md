═══ START PROMPT CC TASK L ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `04-architecture/mockups/andura-clasic.html` cap-coadă pentru:
  - Splash screen + onboarding screen + auth screen visibility default
  - `goto('auth')` vs `goto('onboard')` redirect logic
  - DOMContentLoaded handler / init function default state
  - Local storage check (returning user vs first-time)
- Cross-ref Task A commit `47dcca8` diff (CC zice LANDED dar smoke FAIL — Daniel verbatim "am deschis clasic si nu apare onboarding")
- Verify mockup independent de localStorage state (mockup = first-time user simulation)

§1 SCOPE (atomic)
Bug Phase 3 Task A LANDED dar smoke FAIL Clasic. Mockup deschis double-click NU pornește în onboarding flow.

Fix REAL: ensure default render = onboarding-step-1 visible la double-click mockup, fără dependency localStorage state. Splash auto-advance (200-500ms) → screen-onboarding-step-1.

Verify post-fix: refresh browser → onboarding visible. Clear localStorage → onboarding visible. First-time pretend flow.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- Verify cross-skin × 4 Theme Parity post-fix (LB+Lux+BC pot avea același bug)

§3 ACCEPTANCE CRITERIA
- Open `andura-clasic.html` double-click → screen-onboarding-step-1 visible imediat (post splash 200-500ms OK)
- F5 refresh → still onboarding visible (NU progresează state cumva)
- Cross-skin × 4 verify post-fix
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-L-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin/clasic): onboarding default render REAL FIX cross-skin × 4

§6 RAPORT format invariant per §0-§6.
═══ END PROMPT CC TASK L ═══
