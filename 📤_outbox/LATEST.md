# TASK J — Luxury Schimbă fază entry parity ✅

- **Task:** J — add Schimbă fază entry în Lux mockup parity Theme Parity Invariant V1
- **Model:** Opus
- **Status:** ✅ LANDED
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic line 1621: `<button class="settings-row" onclick="goto('confirm-schimba-faza')">...Schimbă faza manual...Resetează unele calibrări...</button>` (în "Avansat" section Cont)
- LB line 1938: same pattern
- BC line 3412: `<div class="list-row" onclick="goto('confirm-schimba-faza')">` (în Settings list)
- Lux: stage-id=36 confirm-schimba-faza screen EXISTS dar **entry pendant lipsea** (NU are buton în Cont/Settings stage-id=25 to navigate to it)

## Modificări
- `andura-luxury.html` (line ~1653 stage-id=25 settings root): Adăugat NEW section "Avansat" cu 2 rows:
  - "Schimbă faza manual → " (entry pendant for stage-id=36 confirm-schimba-faza)
  - "Refă onboarding → " (parity cu Clasic+LB+BC, also pendant pentru re-onboarding flow)

Section plasat ÎNAINTE de "Privacy & legal" pentru parity logic structure cross-skin.

Lux storyboard paradigm: NU JS needed (toate stages vizibile simultan, navigation arrow vizual indicator only).

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task J atomic).

## Issues
- Theme Parity Invariant V1 ACHIEVED 4/4 themes pentru Schimbă fază entry pattern (Clasic settings-row + LB settings-row + BC list-row + Lux row pattern, palette divergent OK)

## Next action
Final closure: aggregate raport LATEST_CONSOLIDATED.md + post-orchestrator backup tag + push origin feature/phase-3-orchestrator-final --tags.
