---
title: F3 — Fatigue Score Display (Modify Simplified Single Number NU Bar/Visual Elaborate)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: modify-simplified
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F3"
  - "[[../adrs/adr-composite-signal-layer]]"
  - "[[../engines/engine-muscle-recovery]]"
---

# F3 — Fatigue Score Display

## Synthesis

**F3 Fatigue Score Display** = "oboseala cumulată" engineering signal user-facing. V1 prod `renderFatigueScore` + `calculateFatigueScore` engine import compute fatigue score din logs recent. V1_AUDIT verdict **MODIFY simplified** — single number "Fatigue: 67%" + culoare verde/galben/roșu sufficient pentru Gigel, drop bar/multi-component visual elaborate (scope creep V1).

**UX surface mockup V2:** Single line discret în Antrenor stats grid "💪 Fatigue: 67%" cu accent color verde/galben/roșu per threshold. NU bar visualization NU multi-component. Pattern preserved cross-feature (single signal communication concise).

**Engine integration:** Fatigue score derived din [[../engines/engine-muscle-recovery]] per-group state Big 6 + cross-engine [[../adrs/adr-composite-signal-layer]] 3/3 simultaneous threshold logic. Composite Signal `composite_signal_active: true` flag arbitration CASCADE_DEFENSE Layer D consume fatigue signal pentru deload preventiv decision.

## Verbatim quotes Daniel

Daniel verbatim §F3 modify simplified rationale anti-scope-creep:
> *"Fatigue concept util ('oboseala cumulată') dar visual elaborate = scope creep V1. Număr simple 'Fatigue: 67%' + culoare verde/galben/roșu = sufficient pentru Gigel. Drop bar/multi-component visual."*

Daniel verbatim cross-engine Composite Signal Layer integration:
> *"Performance Drop + Rest Time + RIR Mismatch 3/3 simultaneous threshold. Fatigue signal aggregated. Lifecycle cooldown anti-hyperreactive coach pattern."*

## Bugatti framing notes

**Gigel test relevance:** Single line "Fatigue: 67% 🟡" = zero gândire user (number + color instant recognize). Anti-jargon (NU "muscle fiber recovery kinetics %"). Gigel test PASS.

**Quality > Speed via single number:** Anti-bar-visualization-elaborate scope creep. Pattern: communicate signal concise (1 number + 1 color).

**Anti-RE considerations:** Cross-engine integration ADR composite-signal-layer 3/3 simultaneous threshold + lifecycle cooldown anti-hyperreactive pattern. NU single-metric arbitrary threshold (~30% false positive rate).

**Anti-paternalism notes:** Score informează NU impune ("ești obosit, du-te acasă"). User decides session intensity based on signal. Engine recommendation downstream (Energy DOWN per ADR 027).

**Voice tone notes:** Daniel-ism "oboseala cumulată" vernacular RO preserved. Anti-jargon technical pattern preserved cross-feature.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F3 verdict MODIFY simplified single number
- [[../../../03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1]] §3/3 simultaneous threshold arbitration
- [[../../../src/engine/muscleRecovery.js]] per-group state Big 6 input fatigue score derivation
- [[../../../04-architecture/mockups/andura-clasic.html]] §antrenor stats grid fatigue single line V2 SoT
- [[../engines/engine-muscle-recovery]] (recovery state Big 6 + lagging detection cross-engine)
- [[../engines/engine-coach-director]] (orchestrator dispatch fatigue context downstream)

🦫 **F3 Fatigue Score MODIFY simplified V1 — single number + culoare. Drop bar/multi-component visual elaborate. Cross-engine Composite Signal Layer 3/3 simultaneous threshold. Gigel test PASS anti-jargon.**
