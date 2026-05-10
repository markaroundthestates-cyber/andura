═══ START PROMPT CC TASK B ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 (Cluster #2 Task 06 6 templates V2 LANDED status)
- Grep: `04-architecture/mockups/andura-clasic.html` for `template-row` + `template-active` + click handler change template
- Grep: cross-skin × 4 same pattern
- Pattern reference: 6 templates V2 names (Forța / Tonifiere / Sănătate Generală / Hipertrofie / Performanță / Auto)
- Verify CSS: `.template-row.active` styles exist + apply on click
- Verify JS: click handler sets `active` class + removes from others

§1 SCOPE (atomic)
Bug Phase 1 escapat smoke: Andura Clasic — apăsare template (Forța / Tonifiere / Sănătate Generală etc) în Antrenor → toast jos "s-a schimbat" apare DAR UI NU reflectă selecția pe linia clickuită (active state visual lipsă).

Fix: click handler trebuie să adauge `.active` class pe rândul clickuit + remove `.active` de pe celelalte rânduri + CSS `.template-row.active` să aibă visual feedback distinct (border accent / background tint / checkmark icon — Bugatti craft).

Cross-skin × 4 Theme Parity Invariant V1: pattern identic, doar palette divergent.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click pe Forța → linia "Forța" devine active (visual feedback clar) + toast jos "s-a schimbat"
- Click pe altă linie → previous active deselected + new active highlighted
- Active state visual distinct (NU subtil) — Daniel verbatim "să apară clar pe linia clickuită"
- Cross-skin × 4 Theme Parity Invariant V1 strict (active styling palette divergent OK, behavior IDENTIC)
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-B-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): templates active state visual feedback cross-skin × 4

§6 RAPORT (în `📤_outbox/_archive/2026-05/NN_TASK_B_*.md` + LATEST.md update)
Format invariant per Task A.
═══ END PROMPT CC TASK B ═══
