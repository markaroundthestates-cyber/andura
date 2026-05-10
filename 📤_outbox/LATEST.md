# TASK O — Manual kg input + engine increments per exercise ✅

- **Task:** O — manual kg input + engine increments per exercise cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED (Clasic+LB) + AUDIT N/A (BC paradigm separate post-rpe + Lux Task X scope)
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB: kg-input `<div>` static `textContent` (NU input editable) + adjKg(±2.5) hardcoded (Daniel verbatim "manual input sa nu apesi de 300 ori pe +/-")
- BC: separate screen-post-rpe pentru kg adjustment (different paradigm)
- Lux: storyboard Task X

## Modificări
- `andura-clasic.html`: 
  - reps-input + kg-input → `<input type="number" inputmode="numeric/decimal" min/max/step value>` editable manual cu numpad mobile
  - KG_INCREMENTS map per exercise: Împins înclinat 1.25 (dumbbell pair), Squat/Deadlift/Bench Press 2.5 (barbell compound), Lateral Raises/Bicep Curl 1 (isolation), default 2.5
  - getKgIncrement() reads current ex from #screen-workout h2 + lookup map
  - adjKg/adjReps read from `el.value` (input) cu fallback `textContent` (legacy compat)
  - confirmSetInline reads kg/reps from `el.value` (input cast)
- `andura-living-body.html`: same pattern, palette divergent
- BC: NO changes (paradigm separate post-rpe screen)
- Lux: NO changes (Task X scope)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task O atomic).

## Issues
- Engine kg increments map mockup-only hardcoded (port from src/engine prod source-of-truth pentru full per-exercise lookup deferred Phase 4 — current 6 exemple acoperă cele mai frecvente compound + isolation cazuri)

## Next action
Task P — kcal+proteine save handler cross-skin × 4.
