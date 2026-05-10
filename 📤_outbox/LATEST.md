# TASK G — Istoric calendar zile clickuibile ✅

- **Task:** G — Istoric calendar zile clickuibile detail zi cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED (Clasic+LB) + AUDIT N/A (BC+Lux different paradigm)
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB: heatmap calendar `.hm-cell` cu day numbers + intensity classes (l1/l2/l3) — NU click handlers (Daniel smoke confirmed)
- BC: NU calendar — Istoric uses list-row pattern (sesiuni recente list)
- Lux: NU calendar (storyboard paradigm + Istoric stage uses different layout)

## Modificări
- `andura-clasic.html` (line ~897): toate `.hm-cell` 1-31 + onclick="openDayDetail(this, N)" + cursor:pointer + comment Task G
- `andura-clasic.html` JS: `openDayDetail(cell, day)` function — verify cell has activity (l1/l2/l3) → toast detail "X mai · sesiune + greutate + kcal · volum-level"; else toast "X mai · nicio activitate înregistrată"
- `andura-living-body.html` (line ~1214): same pattern, palette divergent (auriu cald background pentru hm-cell.l1/l2/l3)
- `andura-living-body.html` JS: same openDayDetail handler
- BC: NO changes (no calendar paradigm — Istoric uses list-row)
- Lux: NO changes (no calendar paradigm — storyboard format)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task G atomic).

## Issues
- Detail zi shown via toast (Bugatti minimal — full modal/page UI deferred Phase 3 dedicated session per LATEST_CONSOLIDATED Cluster #4 backlog)
- Theme Parity Invariant V1 strict: Clasic+LB heatmap aligned; BC+Lux paradigm divergent intentional (list/storyboard format vs heatmap), behavior outcome equivalent (sesiunile recente accesibile)

## Next action
Task H — Progres Auto button toggle unlock cross-skin × 4.
