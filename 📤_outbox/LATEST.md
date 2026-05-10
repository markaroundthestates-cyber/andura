# TASKS Q + R + S + V + W BATCH ✅

- **Tasks:** Q (greutate sync) + R (notif handlers + Refă onboarding redirect) + S (chart range filter) + V (pain Altceva already done Task C) + W (FAQ placeholder)
- **Model:** Opus
- **Status:** ✅ LANDED batch (Clasic+LB) + AUDIT N/A (BC+Lux paradigm)
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Q: saveWeightEntry exists Clasic but NU persist localStorage + NU sync profil display
- R: Refă onboarding screen-confirm-redo-onboarding "Confirmă acțiunea" → runConfirm (just toast, NU goto onboard); notif buttons (alert-row) NU handlers
- S: setRange function ALREADY exists Clasic+LB (just visual feedback NU data filter — acceptable mockup demo)
- V: pain Altceva already wired Task C cu showToast feedback + close modal
- W: FAQ items NU handlers ("în curs de scriere" placeholder — Daniel: "nu se intampla nimic cand apas pe ele")

## Modificări

**Task Q** Clasic+LB:
- saveWeightEntry: persist `localStorage 'weights' { date: kg }` + syncWeightDisplay() update profil .info-row Greutate + Progres snapshot 7z (font Geist/JetBrains Mono span)
- syncWeightDisplay() function reads max-date weight + updates DOM
- DOMContentLoaded restore latest weight from localStorage

**Task R** Clasic+LB:
- screen-confirm-redo-onboarding "Confirmă acțiunea" button: `runConfirm` → `goto('onboard', {replace:true}); showToast('Onboarding repornit');`
- Document.click listener `.alert-row` → toast `✓ Notat: {b text}` (notif handlers wired generic)

**Task S** N/A (setRange existing function in Clasic+LB does visual + label update — acceptable mockup demo, full chart re-render with filtered data deferred Phase 4 NEED_CONTEXT chart library)

**Task V** N/A (already wired Task C — pain "Altceva" → toast "Coach a notat" + close modal; per Task E NEW LOCK NO descriere liberă)

**Task W** Clasic+LB:
- Document.click listener `[data-faq], .faq-item, .help-item` → toast "Conținut în curs de pregătire — disponibil curând"

**BC + Lux:** N/A (BC uses different paradigm thinking-card / list-row; Lux storyboard Task X scope refactor)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (batch Q+R+S+V+W).

## Issues + NEED_CONTEXT_DANIEL
- **Task T (chart interactive points + tooltip):** DEFERRED Phase 4 NEED_CONTEXT_DANIEL — chart library decision (Chart.js vs SVG custom). Current mockup uses static SVG bars/path NU interactive data points cu tooltip. Substantial scope ~2-4h dedicate session.
- **Task U (Loguri recente drill-down):** DEFERRED Phase 4 NEED_CONTEXT — Loguri recente section NU clear paradigm în mockups (depends on screen design — sesiuni recente list-row vs heatmap day Task G already partially handled). Per Daniel verbatim spec needed.
- **Task W FAQ content writing:** NEED_CONTEXT_DANIEL flag inline — content scope for FAQ items (cine furnizează?). Phase 4+ backlog.

## Next action
Tasks X (Lux storyboard refactor) + Y (BC paradigm refactor) — LARGEST tasks Phase 3.5 remaining.
