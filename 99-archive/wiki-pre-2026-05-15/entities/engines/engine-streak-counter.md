---
title: Engine Streak Counter — Same Direction §EXT-1 + Goal Shift Reset §EXT-2
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-outlier-filter]]"
  - "[[../adrs/adr-024-goal-driven-program-templates]]"
  - "[[../adrs/adr-013-auto-aggression-detection]]"
  - "[[../../../src/engine/autoAggressionDetection.js]]"
---

# Engine Streak Counter — Same Direction Anti-Recurrence Foundation

## Synthesis

**Engine Streak Counter** = streak detection same-direction logic anti-recurrence "1 sesiune up + 1 down + 1 up = yo-yo flag" pattern. **§EXT-1 LOCKED 2026-05-04** (per ADR_OUTLIER_FILTER §EXT-1 amendment) — Streak Counter Same Direction §36.30 trigger when N consecutive sessions same direction (up OR down) detected pattern signal vs single-sesion noise. **§EXT-2 LOCKED 2026-05-04** (per ADR_OUTLIER_FILTER §EXT-2) — Goal Shift Event Handler Streak Reset + Conversion Interval §36.35 (foundation ADR 024 Q6 D Hybrid 2-session calibration window).

**Implementation context:** Streak counter logic embedded `src/engine/autoAggressionDetection.js` cu pattern detection consecutive workouts (streakStart + streakLen tracking, threshold ≥3 sessions). Pattern: "Consecutive = adjacent executed sessions, no break in streak". Cross-engine integration **Engine Auto-Aggression Detection** (ADR 013) consume streak signal pentru 5 signals cumulative trigger detection cu §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT Anti-paternalism ABSOLUTE.

**Goal Shift Event Handler §EXT-2 cross-engine integration ADR 024 Q6 D Hybrid:** Tier global preserve + template-specific signals soft-reset + 2-session calibration window + **streak RESET la 0** §36.26 + EXT-1 LOCKED (consistent cu rule "context fizic schimbat = signal nou independent") + phase re-derive runtime §36.35. Pattern: streak invariant preserved cross-Goal-Shift event boundary.

## Verbatim quotes Daniel

Daniel verbatim §EXT-1 + §EXT-2 amendment ADR_OUTLIER_FILTER LOCKED 2026-05-04 rationale:
> *"Streak Counter Same Direction §36.30 + Goal Shift Event Handler §36.35 amendment. Context fizic schimbat = signal nou independent. Streak RESET la 0 + 2-session calibration window."*

Daniel verbatim ADR 024 Q6 D Hybrid foundation §EXT-1 + §EXT-2 cross-ref:
> *"Q6 = decizie arhitecturală future-proofing post-Beta useri reali. D Hybrid balansează preservare biological signals trans-template cu reset rep/RIR/rest specific template (matrix new). 2-session calibration window consistent cu §EXT-2 already LOCKED, NU additive."*

Daniel verbatim anti-recurrence yo-yo flag pattern rationale:
> *"1 sesiune up + 1 down + 1 up = yo-yo flag. Streak counter require >=3 sesiuni signal consistency before action. Anti-recurrence pattern."*

## Bugatti framing notes

**Gigel test relevance:** Streak Counter internal engine signal — surface UI minimal (engine downstream consume pattern). User vede output (Energy DOWN trigger sau Goal Shift confirmation modal) NU input (streak tracking invisible).

**Quality > Speed via N≥3 threshold:** Pattern detection require 3 consecutive signal consistency before action = anti-false-positive single-session noise. Foundation cross-engine anti-recurrence Volume Creep + Auto-pedeapsă + Yo-yo anti-flap.

**Anti-RE considerations:** §EXT-1 LOCKED 2026-05-04 = anti-recurrence formal codification. Pattern: detect 2× minimum slip → codify §AR.* / §EXT-* extension rule. Foundation cumulative preserved.

**Anti-paternalism notes:** §EXT-2 Goal Shift reset 0 + 2-session calibration window = anti-tyranny-engine-stuck-on-old-streak. User Goal Shift event = signal nou independent acknowledged via reset. NU engine assume continuity post-shift.

**Voice tone notes:** Daniel-ism "signal nou independent" recurring pattern (context boundary metaphor). "Anti-recurrence" technical vernacular preserved.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction §36.30 + §EXT-2 Goal Shift Event Handler §36.35
- [[../../../03-decisions/024-goal-driven-program-templates]] §2.6 Q6 D Hybrid 2-session calibration window + streak RESET foundation
- [[../../../03-decisions/013-auto-aggression-detection]] §AMENDED 2026-04-30 force-typing ELIMINATED + 5 signals cumulative streak input
- [[../../../03-decisions/027-engine-energy-adjustment]] §Yo-yo anti-flap 3-session window Q14=D cross-engine consume streak signal
- [[../../../src/engine/autoAggressionDetection.js]] (streakStart + streakLen tracking embedded pattern detection)
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.26 + §36.30 §EXT-1 + §36.35 §EXT-2 origin

🦫 **Engine Streak Counter §EXT-1 same direction + §EXT-2 Goal Shift reset anti-recurrence foundation. Pattern N≥3 sessions signal consistency. Cross-engine Auto-Aggression + Energy Adjustment + Goal Adaptation Q6 D Hybrid integration. Anti-yo-yo + anti-context-stuck preserved.**
