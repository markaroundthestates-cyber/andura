# ADR 012: Calibration Tier Decay on Inactivity

**Status:** Accepted
**Date:** 2026-04-26
**See also:** [[009-calibration-tiers]] | [[DECISION_LOG]]

## Context

CalibrationTiers progressively unlock engine features (pattern detection, response profile, predictions). Tier is determined by `detectCalibrationLevel(ctx)` which counts sessions and history depth.

Current behavior: tier is monotonically increasing. Once user reaches OPTIMIZED, even after months of inactivity, tier stays OPTIMIZED on return.

**Problem:** stale calibration produces wrong recommendations. A user who trained heavily for 6 months then took 4 months off has a body that no longer matches the calibrated state. Engines treat them as fully calibrated and recommend volume/intensity based on old data.

## Decision

Implement linear tier decay on inactivity:

- Compute `daysSinceLastSession` from logs (last non-baseline log by `ts`)
- For every 60 consecutive inactive days → decay 1 tier level
- Floor: INITIAL (NEVER below — preserves basic personalization)
- Cold start (no logs at all) → COLD_START (existing behavior unchanged)

Decay happens at calibration computation time (read-side). No persistent state mutation. Returns to full tier automatically when user logs new sessions.

Threshold: 60 days chosen because typical training pause (vacation, injury, project crunch) is < 60 days. Beyond that, body composition + neural patterns shift significantly.

## Alternatives Considered

**A. Decay on last-N-sessions average density** — too noisy for sporadic users  
**B. Tier reset to COLD_START on inactivity** — too aggressive, loses calibration data  
**C. Time-based decay non-linear (faster initial)** — overcomplicated for v1

Linear simplicity wins. Refinement v2+ if data warrants.

## Trade-offs Accepted

- User who returns after 90 days inactive sees PERSONALIZED instead of OPTIMIZED → fewer engine features active. Correct UX (recalibration period).
- No granular sub-level decay — tier jumps in discrete steps.
- Decay is invisible to user (no explicit "your tier decreased" notification). Acceptable for v1.

## Reconsideration Triggers

- User feedback complaints about "demotion" feeling after returning
- Data showing decay threshold too aggressive (< 60 days) or too lenient (> 60 days)
- Scale > 1000 users where edge cases matter
- Addition of explicit user notifications or tier display in UI

## Implementation

`src/engine/calibration.js`:
- `TIER_ORDER` constant — ordered array of tier names from cold to optimized
- `_applyInactivityDecay(currentLevel, daysSinceLastSession)` helper
  - Returns demoted level after 60-day intervals, floor at INITIAL
  - COLD_START returns COLD_START (unaffected by decay logic)
- Applied at end of `detectCalibrationLevel(ctx)` using last non-baseline log `ts`

Tests (`src/engine/__tests__/calibration.test.js`):
- 0 inactive days → no decay
- 59 inactive days → no decay
- 60 inactive days → -1 tier
- 119 inactive days → -1 tier (not yet 120)
- 120 inactive days → -2 tiers
- 9999 inactive days → floored at INITIAL
- COLD_START input → COLD_START output (unaffected)
- `detectCalibrationLevel` integration: OPTIMIZED user inactive 90 days → PERSONALIZED
