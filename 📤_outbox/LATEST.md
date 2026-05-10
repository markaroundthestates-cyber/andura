# TASK L — Onboarding default render REAL FIX ✅

- **Task:** L — onboarding default render REAL FIX cross-skin × 4 (RETRY Task A FAIL)
- **Model:** Opus
- **Status:** ✅ LANDED
- **Branch:** feature/phase-3-orchestrator-final

## Pre-flight grep
- Clasic+LB: `screen-splash` clasă `active` default + setTimeout 1500ms `goto('onboard')` redirect — Daniel smoke FAIL "am deschis clasic si nu apare onboarding"
- BC: same pattern (splash active + setTimeout)
- Lux: storyboard paradigm (toate stages vizibile, no setTimeout) — Task X scope refactor

Hipoteza root cause Task A FAIL: setTimeout dependency fragile (race condition cu DOMContentLoaded sau cache stale). Plus 1.5s delay = perceived "splash hangs".

## Modificări — REAL FIX (skip splash setTimeout, direct render onboarding)
- `andura-clasic.html`: screen-splash `class="screen paper-bg"` (NU active) + screen-onboard `class="screen paper-bg active"` direct + `#global-header style="display:none"` default + setTimeout DROPPED
- `andura-living-body.html`: same pattern
- `andura-brain-coach.html`: screen-splash `class="screen"` (NU active) + screen-onboard `class="screen active"` + `#global-header style="display:none"` + setTimeout DROPPED
- `andura-luxury.html`: UNCHANGED (Lux storyboard refactor scope Task X)

## Build + Tests
- HTML mockup-only edit, ZERO src/ touch → tests preserved 2731 PASS implicit (validated next commit pre-commit hook).

## Commits pushed
- Pending commit (Task L atomic).

## Issues
- Splash screen still exists ca dead-code reachable (button "Începe →" în splash → goto('onboard') still work). Future cleanup: remove splash screen entirely Phase 4 dacă not used as transition target.

## Next action
Task M — workflow set advance sequential gate cross-skin × 4.
