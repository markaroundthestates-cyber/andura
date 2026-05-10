═══ START PROMPT CC TASK H ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` Cluster #6 Task 21 deferred (Progres "buton auto blocat pe auto" state bug)
- Grep: `04-architecture/mockups/andura-clasic.html` for Progres page + buton "Auto" + state toggle (Auto vs Manual?)
- Grep: cross-skin × 4 same pattern
- Pattern reference: buton Auto trebuie să poată fi togglat off (neblocat permanent pe Auto)

§1 SCOPE (atomic)
Bug Phase 3 deferred confirmed smoke: Andura Clasic — în pagina Progres butonul "Auto" este blocat pe state "Auto" (NU poate fi togglat la Manual sau alt state).

Fix: identifică ce face butonul Auto (probabil toggle Auto/Manual pentru weight tracking sau session tracking). Click handler trebuie să:
- Toggle state Auto ↔ Manual visual + funcțional
- Persist state la localStorage (DB.set('progres-mode', 'auto' | 'manual'))
- Visual feedback clar (cum are templates active state Task B — same pattern Bugatti craft)

Cross-skin × 4 Theme Parity Invariant V1.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click pe buton Auto → toggle state Auto → Manual sau invers (visual + funcțional)
- State persistent (refresh mockup → state preserved)
- Visual feedback active state clar
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-H-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): Progres Auto button toggle state unlocked cross-skin × 4

§6 RAPORT format invariant per Task A. Note: dacă scope-ul "Auto" e ambiguu (multiple butoane "Auto"), flag NEED_CONTEXT_DANIEL inline + procedură pe interpretarea cea mai probabilă (toggle Auto/Manual weight tracking).
═══ END PROMPT CC TASK H ═══
