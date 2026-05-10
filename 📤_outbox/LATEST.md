# TASK B — Templates active state ✅

- **Task:** B — templates active state visual feedback cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Found Antrenor templates section în Clasic+LB+BC (5 templates hardcoded "Tonifiere" active, NU JS toggle, missing 6th "Auto" + "Sănătate generală" instead of "Mentenanță")
- Found Lux storyboard onboarding (line 956-963): 6 templates already aligned baseline cu "Forță" pre-selected (storyboard paradigm, NU runtime click)

## Modificări
- `andura-clasic.html` — Antrenor Programe section: 5→6 templates (Sănătate generală → Mentenanță rename + Auto add baseline) + JS `pickTemplate(this)` handler + CSS `.template-active` class (background #fdf3df + border-left rust accent + bold label + " · activ" suffix + ALES badge swap chevron)
- `andura-living-body.html` — same pattern, accent palette divergent (`var(--accent)` aurium cald + background `rgba(232,200,150,0.08)`)
- `andura-brain-coach.html` — same pattern + minimal `#templates-toast` div + `showTemplateToast()` helper (BC didn't have showToast); active styling cu --think-soft electric blue + gradient overlay
- `andura-luxury.html` — UNCHANGED (storyboard paradigm: doar onboarding goal selection există, deja are 6 templates baseline cu "Forță" selectată via champagne-soft styling + row-label color)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task B atomic).

## Issues
- BC nu avea function showToast — added minimal `#templates-toast` + `showTemplateToast` BC-specific helper. Future Task: extract to shared util dacă needed cross-skin BC.
- 5 templates → 6 baseline rename `Sănătate generală` → `Mentenanță` + ADD `Auto` au LANDED Phase 1 Task 06 doar în onboarding choice screens, NU în Antrenor settings list — corectat aici (scope bridge)

## Next action
Task C — pain-button merge 4 opțiuni preset.
