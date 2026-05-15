---
title: F8 — Streak Counter UX Surface (Motivation Gamification Mainstream Pattern)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F8"
  - "[[../engines/engine-streak-counter]]"
  - "[[../adrs/adr-outlier-filter]]"
  - "[[../adrs/adr-024-goal-driven-program-templates]]"
---

# F8 — Streak Counter UX Surface

## Synthesis

**F8 Streak Counter UX Surface** = motivation gamification mainstream pattern "🔥 5 zile streak" Antrenor idle prominent display. V1 prod implementation probabil în renderIdle.js LOC remaining. V1_AUDIT verdict **KEEP verbatim** — motivație gamification proven mainstream apps (Duolingo etc) + Gigel cultural RO motivat de "consistency = pride" + drop = pierde retention vector cheap.

**UX surface mockup V2:** Badge prominent emoji 🔥 + număr zile streak + sub-text "X zile streak" Antrenor idle visible immediate. Cross-engine integration [[../engines/engine-streak-counter]] §EXT-1 same direction + §EXT-2 Goal Shift reset (per ADR_OUTLIER_FILTER amendment 2026-05-04). Pattern N≥3 sessions signal consistency anti-yo-yo-flag.

**Engine integration downstream:** Streak signal consum Auto-Aggression Detection (ADR 013 §AMENDED 2026-04-30 force-typing ELIMINATED PERMANENT) 5 signals cumulative trigger detection + Energy Adjustment (ADR 027) Yo-yo anti-flap 3-session window V1 Q14=D. Goal Shift Event Handler §EXT-2 streak RESET la 0 + 2-session calibration window foundation ADR 024 Q6 D Hybrid.

## Verbatim quotes Daniel

Daniel verbatim §F8 keep verbatim rationale Gigel cultural RO consistency pride:
> *"'🔥 5 zile streak' = motivație gamification proven mainstream apps (Duolingo etc). Gigel cultural RO = motivat de 'consistency = pride'. Drop = pierde retention vector cheap. Port direct."*

Daniel verbatim §EXT-1 + §EXT-2 amendment 2026-05-04 anti-recurrence rationale:
> *"Streak Counter Same Direction §36.30 + Goal Shift Event Handler §36.35 amendment. Context fizic schimbat = signal nou independent. Streak RESET la 0 + 2-session calibration window."*

## Bugatti framing notes

**Gigel test relevance:** Badge "🔥 5 zile streak" = zero gândire user (instant recognize gamification pattern Duolingo). Cultural RO consistency = pride alignment. Gigel test PASS.

**Quality > Speed via mainstream proven pattern:** Duolingo + Strava + multiple gym apps battle-tested gamification mechanism. NU re-invent wheel. Direct port verbatim.

**Anti-RE considerations:** §EXT-1 + §EXT-2 amendment ADR_OUTLIER_FILTER 2026-05-04 = anti-recurrence "1 sesiune up + 1 down = yo-yo flag" pattern + "context fizic schimbat = signal nou independent". Pattern: streak reset cross-Goal-Shift event boundary.

**Anti-paternalism notes:** Streak informează (positive reinforcement) NU impune ("ai pierdut streak, trebuie să recuperezi"). Gentle visualization NU shaming tone. SUFLET F2 alignment.

**Voice tone notes:** Daniel-ism "consistency = pride" cultural RO preserved. Anti-Big-Tech-engagement-spam pattern (NU push notifications "Don't break your streak!").

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F8 verdict KEEP verbatim
- [[../../../src/engine/autoAggressionDetection.js]] streakStart + streakLen tracking pattern detection
- [[../../../03-decisions/ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction §36.30 + §EXT-2 Goal Shift §36.35
- [[../../../03-decisions/024-goal-driven-program-templates]] §2.6 Q6 D Hybrid 2-session calibration window + streak RESET foundation
- [[../../../03-decisions/013-auto-aggression-detection]] §AMENDED 2026-04-30 5 signals cumulative streak input
- [[../engines/engine-streak-counter]] (§EXT-1 + §EXT-2 anti-recurrence foundation + N≥3 pattern)
- [[../../../04-architecture/mockups/andura-clasic.html]] §antrenor streak badge V2 SoT

🦫 **F8 Streak Counter UX Surface KEEP verbatim. Motivation gamification mainstream Duolingo pattern. Cultural RO consistency = pride Gigel test PASS. §EXT-1 + §EXT-2 anti-recurrence foundation. Anti-Big-Tech-engagement-spam pattern preserved.**
