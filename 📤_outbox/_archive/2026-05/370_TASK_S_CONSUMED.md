═══ START PROMPT CC TASK S ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/weight.js` setChartRange + chart filter logic + range buttons (30/60/90/Tot)
- Read mockup cross-skin × 4: chart greutate range buttons handlers
- Daniel verbatim: *"Graficul de la greutate nu se schimba daca apas pe 30 60 90 tot"*
- Verify: setChartRange wired la onclick range buttons + chart re-render data filtered

§1 SCOPE (atomic)
Bug pre-existent: chart greutate range buttons (30/60/90/Tot zile) NU schimbă chart display la click. Handler missing sau filter logic broken.

Fix: setChartRange(N) → filter logs.weights pe interval N zile (sau Tot) + chart re-render cu data filtered + visual feedback active range button (.active class).

Source-of-truth `src/pages/weight.js` setChartRange — port complete în mockup.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click "30" → chart 30 zile last data
- Click "60" → chart 60 zile
- Click "90" → chart 90 zile
- Click "Tot" → chart all logs
- Active button visual feedback (.active class)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-S-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): chart greutate range filter 30/60/90/Tot cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK S ═══
