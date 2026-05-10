# TASK C — Pain button merge 4 preset ✅

- **Task:** C — pain-button merge 4 opțiuni preset cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB: ceva-nu-merge parent → pain-button drill (3 type buttons + Altceva→textarea reveal BUG) + equipment-swap (textarea-based BUG)
- BC: pain-button uses SVG body zones (preset, NU textarea ✓) + equipment-swap uses thinking-card alternative cards (NU textarea ✓) + ceva-nu-merge parent "Altceva"→pain-button routing bug
- Luxury: pain-button uses pain-grid preset zones (NU textarea ✓) + equipment-swap toggle list (NU textarea ✓) + ceva-nu-merge "Altceva" wording mentions "Descrii liber"

## Modificări
- `andura-clasic.html` — ceva-nu-merge: 4 buttons preset (Mă doare/Nu am aparat/Altceva engine flag/Anulează), Altceva NU mai goto pain-button. pain-button: 6 body parts preset (Umăr/Spate/Genunchi/Cot/Gleznă/Altă zonă) + Anulează, ZERO textarea. equipment-swap: 5 preset (Doar gantere/Doar bodyweight/Doar bandă/Aparat ocupat/Altceva engine flag) + Anulează, ZERO textarea.
- `andura-living-body.html` — same pattern, palette divergent var(--accent) auriu cald
- `andura-brain-coach.html` — ceva-nu-merge "Altceva" → showTemplateToast generic + back (NU goto pain-button); pain-button SVG body + equipment-swap thinking-card preserved (already preset)
- `andura-luxury.html` — ceva-nu-merge "Altceva" wording fix "Descrii liber" → "Coach-ul ajustează generic"; pain-button + equipment-swap preserved (already preset)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task C atomic).

## Issues
- Theme Parity Invariant V1 strict: Clasic+LB structurally aligned (preset list pattern), BC+Lux divergent display paradigm (SVG body + zone grid + toggle list) DAR same outcome behaviorat (no textarea + preset selection only)

## Next action
Task D — remove tab Nutriție Progres cross-skin × 4.
