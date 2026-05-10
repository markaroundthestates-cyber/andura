# TASK D — Remove tab Nutriție Progres ✅

- **Task:** D — remove tab Nutriție Progres cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED (Clasic+LB) + AUDIT N/A (Lux+BC already aligned)
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB: had redundant "Plan nutriție · azi" coach-quote box section în Progres (#fdf3df cream box / rgba(232,200,150) auriu cald box) ABOVE the legitimate §3.5 V3 loghează kcal+proteine UI. Plus "Nutriție istoric" drill row în "Vezi mai mult" Istoric drilldown.
- Lux+BC: NU au "Plan nutriție · azi" coach-quote redundant box — doar "Nutriție · azi" §3.5 V3 RE-IN-SCOPE loghează kcal+proteine + Importă CSV (legit, preserved).

## Modificări
- `andura-clasic.html` (line ~1224): Plan nutriție coach-quote box REMOVED + comment Task D reference
- `andura-clasic.html` (line ~926): Nutriție drill row REMOVED din Istoric "Vezi mai mult"
- `andura-living-body.html` (line ~1540): Plan nutriție coach-quote box REMOVED + comment
- `andura-living-body.html` (line ~1243): Nutriție drill row REMOVED din Istoric "Vezi mai mult"
- `andura-luxury.html`: UNCHANGED (already aligned per §3.5 V3 — only Nutriție · azi loghează section)
- `andura-brain-coach.html`: UNCHANGED (already aligned per §3.5 V3 — only NUTRIȚIE · AZI loghează section)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task D atomic).

## Issues
- Daniel smoke "tab Nutriție în Progres reziduu" interpretation: redundant "Plan nutriție · azi" coach-quote box (NU literal nav-tab — Clasic+LB+BC have only 4 root nav-tabs Antrenor/Progres/Istoric/Cont, no Nutriție tab existed). Loghează kcal+proteine UI section preserved per §3.5 V3 RE-IN-SCOPE V1.

## Next action
Task E — remove free-text universal cross-skin × 4 (NEW LOCK V1 SUPERSEDE Task 29).
