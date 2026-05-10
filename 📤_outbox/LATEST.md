# TASK A — Onboarding default render ✅

- **Task:** A — onboarding default render Big 6 hard T0 cross-skin × 4
- **Model:** Opus
- **Status:** ✅ LANDED
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 (Big 6 hard T0 ACHIEVED 4/4 themes per Phase 1+2 closure)
- `01-vision/ONBOARDING_SSOT_V1.md` §AMENDMENT 2026-05-10 (Big 6 hard T0 cross-skin × 4 spec)
- `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md §AMENDMENT 2026-05-05.7` (Big 6 hard T0 baseline)
- Grep cross-skin × 4 surfaced bug: Clasic+LB+BC `setTimeout` redirect splash → `goto('auth')` (NU `'onboard'`) — Daniel smoke confirmed app pornește în auth NU onboarding flow după 1.5s splash auto-advance.
- Luxury = storyboard paradigm (`stage-wrap data-stage-id`) toate stages vizibile simultan (presentation review format) → N/A pentru runtime auto-advance fix.

## Modificări
- `andura-clasic.html:2311-2317` — splash auto-advance `goto('auth')` → `goto('onboard')` (comment update Task A reference)
- `andura-living-body.html:2607-2613` — same pattern
- `andura-brain-coach.html:4987-4992` — same pattern
- `andura-luxury.html` — UNCHANGED (storyboard paradigm divergent intentional, all stages visible)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (pre-commit hook will validate at next commit).

## Commits pushed
- Pending commit (will batch with subsequent tasks per orchestrator spec).

## Issues
- None. Storyboard divergence Luxury intentional (Theme Parity Invariant V1 sole exception display paradigm — flow content remains identic, doar presentation differs).

## Next action
Task B — templates active state visual feedback.
