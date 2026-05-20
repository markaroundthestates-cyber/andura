# Findings — Wave E Onboarding (multi-step collapsed)

**Mockup screens (7):** onboard + onb-varsta + onb-sex + onb-inaltime + onb-greutate + onb-medical + onb-frecventa (lines 486-728)
**Prod ref:** `src/react/routes/screens/Onboarding.tsx` (259 LOC, single multi-step component)
**Audit date:** 2026-05-20

## Paradigm divergence (architectural)

- **Mockup:** 7 distinct `<div class="screen">` containers, each cu unique `id="screen-onb-*"` + own header + own form + own Continua button. Linear navigation via `goto('onb-next')`.
- **Prod:** Single `<Onboarding />` component cu `:step` URL param (1-7). Step machine rendering different form per step. Progress dots (7-segment) cu active state. Single component re-renders per step navigate.
- **Mockup ref:** `andura-clasic.html:486-728` (7 separate screen divs)
- **Prod ref:** `Onboarding.tsx:1-259`

## Findings

### F-onboarding-01 — Architecture pattern divergent (acceptable)

- **Severity:** OK (architectural choice)
- **Mockup:** 7 separate screens
- **Prod:** Single component multi-step
- **Karpathy:** Either OK; prod single-component reduces JSX duplication (Simplicity First). Mockup separate screens easier to design în Sketch/Figma.
- **Beta blocker?** N/A — paradigm choice

### F-onboarding-02 — Step 1 (Obiectiv) verbatim copy

- **Mockup:** Step 1 = Obiectiv (intent: choose goal — masa/forta/etc) + disclaimer integrat medical
- **Prod:** TBD verify Onboarding step 1 — likely renders ObiectivForm sub-component or inline form
- **Severity:** HIGH (verify per Pass 2)

### F-onboarding-03 — Big 6 fields (varsta/sex/inaltime/greutate/medical/frecventa) — TBD Pass 2

- **Mockup:** 6 separate forms — each cu own UI pattern (number input / radio buttons / checkbox medical conditions / frequency selector)
- **Prod:** All 6 collapsed into Onboarding.tsx step machine
- **Severity:** TBD Pass 2 verify each step input UI matches mockup

### F-onboarding-04 — Progress dots indicator (prod-extra OR mockup has it too?)

- **Severity:** TBD
- **Mockup:** No visible 7-dot progress (each screen standalone)
- **Prod:** 7-segment progress bar top (Onboarding.tsx:43-51)
- **Karpathy:** Surgical (progress dots = nice UX enhancement; if mockup doesn't have, Daniel decision keep prod)
- **Beta blocker?** NO (Wave 3 polish — verify mockup hasn't progress dots hidden elsewhere)

### F-onboarding-05 — Per-step UI fidelity — Pass 2 required

7 mockup screens × per-form details (sub-headers, copy, inputs, validation) = significant Pass 2 work for full per-step parity assessment.

## Wave E summary

| Status | Count | Notes |
|--------|-------|-------|
| Architecture | 1 finding | Paradigm OK (collapsed multi-step) |
| Per-step depth | 6+ TBD | Pass 2 needed for varsta/sex/inaltime/greutate/medical/frecventa form fidelity |

**Wave E estimated parity: 55-65%** (multi-step component LANDED but per-step fidelity TBD Pass 2)
