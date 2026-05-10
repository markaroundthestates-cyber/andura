═══ START PROMPT CC TASK T ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/weight.js` chart rendering library + tooltip + interactive points implementation
- Read mockup cross-skin × 4: chart container + chart library used (Chart.js / SVG custom / D3)
- Daniel verbatim: *"nu ar trebuii sa poti pune mana pe el si sa ai puncte pe grafic sa iti arate exact ce greutate e acolo?"*
- Verify: prod uses Chart.js or similar cu hover tooltip default? Mockup folosește simplified static SVG?

§1 SCOPE (atomic)
Bug UX: chart greutate static, fără puncte interactive + tooltip valoare exactă la hover/touch.

Fix: integrate chart cu interactive points + tooltip:
- Hover desktop / touch mobile pe punct chart → tooltip "DD MMM · X.X kg"
- Visual punct vizibil (data marker) per logger
- Smooth interaction (NU lag)

Source-of-truth `src/pages/weight.js` chart library — port în mockup. Dacă mockup uses static SVG, upgrade la Chart.js sau SVG cu event handlers.

Cross-skin × 4 Theme Parity Invariant V1 strict (palette divergent OK).

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Hover/touch pe chart point → tooltip cu data + valoare greutate
- Puncte vizibile per data logger (markers)
- Smooth interaction
- Cross-skin × 4 Theme Parity Invariant V1 strict (cosmetic divergent palette)
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-T-$(date +%Y%m%d_%H%M)

§5 COMMIT
feat(skin): chart greutate interactive points + tooltip cross-skin × 4

§6 RAPORT format invariant + flag dacă chart library upgrade necesar (NEED_CONTEXT_DANIEL dacă alegere Chart.js vs SVG custom).
═══ END PROMPT CC TASK T ═══
