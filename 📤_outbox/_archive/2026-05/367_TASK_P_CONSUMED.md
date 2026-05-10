═══ START PROMPT CC TASK P ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/weight.js` saveKcal + adjKcal + setKcalDirect + saveProt + adjProt + setProtDirect + lockKcal + lockProt
- Read mockup cross-skin × 4 pentru "Salveaza ziua" button kcal+proteine handler
- Daniel verbatim: *"La logare kcal manuala si la proteine apas pe salveaza ziua si nu se intampa mnimic"*
- Verify: mockup-uri au onclick handler wired la saveKcal+saveProt sau e placeholder

§1 SCOPE (atomic)
Bug pre-existent: "Salveaza ziua" button în logare kcal+proteine NU face nimic la click. Handler missing sau broken.

Fix: wire handler onclick → save kcal + save proteine + persist localStorage + toast feedback "✅ Ziua salvată" + close modal/return Logare panel.

Source-of-truth `src/pages/weight.js` saveKcal + saveProt — port pattern în mockup.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click "Salveaza ziua" → kcal + proteine persisted localStorage
- Toast feedback success
- UI update post-save (Logare panel reflect saved values)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-P-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): logare kcal+proteine Salveaza ziua handler cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK P ═══
