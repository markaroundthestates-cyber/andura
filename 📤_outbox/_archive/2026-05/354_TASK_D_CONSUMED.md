═══ START PROMPT CC TASK D ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `01-vision/PRODUCT_STRATEGY_SPEC_v1.md §3.5 V3 amendment 2026-05-10` LOCKED V1 (nutrition logging RE-IN-SCOPE V1 cu auto-fill rule + tab UI REMOVED + MFP CSV import only generic wording)
- Read `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte (Theme Parity Invariant V1 + scope cuts: tab Nutriție REMOVED complet UI)
- Grep: `04-architecture/mockups/andura-clasic.html` for `progres` page + tab navigation + tab labels (Antrenamente / Nutriție / etc)
- Grep: cross-skin × 4 same pattern

§1 SCOPE (atomic)
Bug Phase 1 escapat smoke: Andura Clasic — în pagina Progres apare tab "Nutriție" reziduu, contrar `PRODUCT_STRATEGY_SPEC_v1.md §3.5 V3 amendment` LOCKED V1 (tab UI REMOVED).

Fix: remove tab "Nutriție" complet din UI Progres cross-skin × 4. Nutriție logging continuă să existe (auto-fill rule + MFP CSV import generic), DAR tab navigation UI = OUT.

Tabs preserved în Progres: Antrenamente + Greutate + (other tabs LANDED V1 conform spec). Verifică tab list per spec, NU presupune memory.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Pagina Progres NU mai afișează tab "Nutriție" cross-skin × 4
- Tab list preserved per `PRODUCT_STRATEGY_SPEC_v1.md` (Antrenamente + Greutate + alte LANDED, FĂRĂ Nutriție)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-D-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): remove tab Nutriție Progres cross-skin × 4

§6 RAPORT format invariant per Task A.
═══ END PROMPT CC TASK D ═══
