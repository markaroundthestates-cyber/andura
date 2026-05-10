═══ START PROMPT CC TASK V ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read Task C + Task E commits (pain modal restructured 4 buttons preset + free-text removed)
- Read mockup cross-skin × 4: pain modal "Altceva" button click handler + UX feedback
- Daniel verbatim: *"La ceva nu merge care e rstul la butonul de Altceva?"*
- Verify: "Altceva" click → engine flag generic + close modal? Or unclear UX (NU mesaj/feedback)?

§1 SCOPE (atomic)
Bug UX: în "Mă doare ceva / Ceva nu merge" pain modal, butonul "Altceva" la click NU dă feedback clar user-ului ce face. Engine flag silent = user confused.

Fix: "Altceva" click handler →
- Engine flag generic ("user-other-issue" semnal)
- Toast feedback clar: "✓ Notat. Coach va lua în considerare la sesiunea următoare." (sau similar lean Romanian)
- Close modal automat
- Optional: log entry pentru tracking pattern

Cross-ref Task C (4 buttons preset) + Task E (NO descriere liberă).

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click "Altceva" → toast feedback clar + close modal
- Engine flag persisted (localStorage / event log)
- NO descriere liberă (Task E NEW LOCK V1 preserved)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-V-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): pain Altceva UX feedback toast + engine flag cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK V ═══
