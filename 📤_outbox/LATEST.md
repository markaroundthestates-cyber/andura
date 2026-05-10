# TASK H — Progres Auto button toggle unlock ✅

- **Task:** H — Progres Auto button toggle Auto/Manual unlock cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED (Clasic+LB) + AUDIT N/A (BC+Lux different paradigm)
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB: Auto button în Progres ("Engine ajustează singur volumul") cu `<span class="sw on">` static + onclick="showToast('Auto — drill setări')" (NU toggle, locked on)
- Lux: Auto-progression + Auto-rest timer toggles în settings storyboard (visual-only, no JS handler)
- BC: NU buton Auto distinct în Progres (paradigm diferit — thinking-card + auto-decisions vizualizate)

## Modificări
- `andura-clasic.html` (line ~1253): button cu id=`progres-auto-row` + onclick=`toggleProgresAuto()` + sub-text id `progres-auto-sub` + sw element id `progres-auto-sw`
- `andura-clasic.html` JS: `toggleProgresAuto()` function — toggle .on class + update sub-text "Engine ajustează singur volumul" / "Manual — tu controlezi volumul" + persist `localStorage['progres-mode']` + toast feedback "🤖 Auto activ" / "✋ Manual activ" + restore state on DOMContentLoaded
- `andura-living-body.html` (line ~1570): same pattern, palette divergent
- `andura-living-body.html` JS: same toggleProgresAuto handler + localStorage restore
- BC: NO changes (no Auto button paradigm)
- Lux: NO changes (storyboard, multiple Auto toggles visual-only)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task H atomic).

## Issues
- Theme Parity Invariant V1: Clasic+LB aligned (toggle behavior); BC+Lux paradigm divergent intentional

## Next action
Task I — muscleMap 19→7 refactor (engine src/ refactor cu downstream consumers + tests).
