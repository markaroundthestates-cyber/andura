---
title: ADR 012 — Calibration Tier Decay on Inactivity
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-26
authority: 03-decisions/012-tier-decay-on-inactivity.md raw layer §Decision (linear decay 60 inactive days/tier, floor INITIAL)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-009-calibration-tiers]]"
  - "[[adr-011-coach-decision-log-architecture]]"
amendments: []
---

# ADR 012 — Tier Decay on Inactivity

## Synthesis

ADR 012 = decision linear tier decay calibration on inactivity. Original LOCK V1 2026-04-26. Trigger: ADR 009 monotonically increasing tier produces wrong recommendations stale calibration scenarios (user trained heavily 6 months → 4 months off → body NU matches calibrated state, engines treat fully calibrated + recommend volume/intensity old data). Decision: compute `daysSinceLastSession` from logs (last non-baseline log `ts`); for every 60 consecutive inactive days → decay 1 tier level; floor **INITIAL** (NEVER below — preserves basic personalization); cold start (no logs at all) → COLD_START unchanged. Decay happens at calibration computation time **read-side** (no persistent state mutation) — returns to full tier automatically when user logs new sessions. Threshold 60 days: typical training pause (vacation/injury/project crunch) <60 days, beyond shifts body composition + neural patterns significantly. Linear simplicity wins v1 (refinement v2+ if data warrants). Trade-offs: user returns after 90 days inactive sees PERSONALIZED instead OPTIMIZED → fewer engine features active (correct UX recalibration period). Decay invisible to user (no explicit "your tier decreased" notification) — acceptable v1. Implementation: `src/engine/calibration.js` TIER_ORDER constant + `_applyInactivityDecay(currentLevel, daysSinceLastSession)` helper applied at end `detectCalibrationLevel(ctx)`.

## Verbatim quotes Daniel

Daniel articulation chat strategic 2026-04-26 inactivity decay rationale (paraphrase synthesis):

> *"user 4 luni absent NU mai e OPTIMIZED. Coach trebuie recalibreze. NU recompense stale state."*

(Synthesis paraphrase Daniel chat strategic context decay 60-day threshold acceptance.)

Daniel articulation cross-ref alarm fatigue + anti-paternalism universal scope chat strategic 2026-04-30+ (cross-ref [[adr-013-auto-aggression-detection]] §Dismiss memory):

> *"NU explicit 'your tier decreased' notification. Decay invizibil. User adult, NU paternalism."*

(Cross-ref universal chat strategic scope anti-paternalism applied tier decay UI design — decay tăcut internal, user resumes natural.)

## Bugatti framing notes

**Quality > Speed via linear simplicity:** Linear decay = simplest viable v1 mechanism. NU non-linear sophistication premature optimization. Refinement v2+ data warrants. Bugatti craft pragmatic discipline.

**Anti-paternalism notes:** Decay INVISIBLE to user — NO explicit notification "your tier decreased". Decision conscious anti-paternalism universal scope Daniel chat strategic. User adult, returns natural rhythm.

**Gigel test relevance:** User Marius (mecanic 45) 4 months pause project crunch — returns sees engine recalibrated organic (NOT "ai fost demoted la tier mai jos" alarm). Dignity + autonomy preserved.

**Anti-RE considerations:** Decay logic computed read-side (no persistent state mutation) = stateless transient calculation, NU recorded "downgrade event" trace exposure.

**Voice tone notes:** Daniel autonomy lock chat strategic universal — Co-CTO autonomous decay threshold + invisible UI design decisions NU paternalism review required.

## Cross-refs raw layer

- [[../../../03-decisions/012-tier-decay-on-inactivity]] §Decision (linear 60-day decay + floor INITIAL) + §Implementation (calibration.js + tests)
- [[../../../03-decisions/009-calibration-tiers]] §Decision (5-tier base — decay applies tier transitions inverse direction)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Schema (CDL context.calibrationLevel reflects post-decay value)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-26 entry

🦫 **ADR 012 Tier Decay on Inactivity LOCK V1 2026-04-26. Linear 60-day threshold floor INITIAL preserves basic personalization. Decay invisible anti-paternalism universal scope — user adult, NU notification "your tier decreased" alarm.**
