---
title: Coach Engines Overview — Pipeline §42.10 8 Prescriptive Engines + Auxiliary Holistic
type: summary
status: live
last_updated: 2026-05-12
synthesis_scope: coach-engines
cross_refs:
  - "[[../entities/adrs/adr-026-offline-coaching-tree]]"
  - "[[../entities/engines/engine-coach-director]]"
  - "[[../entities/engines/engine-muscle-recovery]]"
  - "[[../entities/engines/engine-periodization]]"
  - "[[../entities/specs/spec-cognitive-architecture]]"
---

# Coach Engines Overview

## Synthesis

**Andura Coach Engines** = Pipeline §42.10 8 prescriptive engines per [[../entities/adrs/adr-026-offline-coaching-tree]] §1.10 ordering canonical + auxiliary engines support cross-pipeline. Orchestrator central [[../entities/engines/engine-coach-director]] dispatch sequential consum Constraint Object immutable propagated downstream (NU shared state + NU side effects).

**Pipeline §42.10 ordering canonical 8 prescriptive engines:**
1. **Periodization** ([[../entities/engines/engine-periodization]]) — long-term schedule generator Floor/Ceiling Range volume coridor Israetel framework persona-aware Maria/Gigica/Marius
2. **Goal Adaptation** ([[../entities/adrs/adr-024-goal-driven-program-templates]]) — 5 templates V1 + Q1-Q8 LOCKED + Q6 D Hybrid 2-session calibration window + phase auto-detection thresholds CUT/BULK/MAINTAIN/RECOMP
3. **Energy Adjustment** ([[../entities/adrs/adr-027-engine-energy-adjustment]]) — bidirectional ±15% tier-aware T0=±10% T1+=±15% + asymmetric trigger UP cumulative N≥3 anti-Sarcastic + DOWN immediate recovery
4. **Bayesian Nutrition** ([[../entities/adrs/adr-022-bayesian-nutrition-inference]]) — Kalman filter prior posterior adaptive TDEE NU hardcoded 2000 kcal
5. **Tempo / Form Cues** ([[../entities/adrs/adr-028-engine-tempo-form-cues]]) — persona-aware notation Maria verbal / Gigica hibrid / Marius numeric + tap-to-expand 💡
6. **Specialization** ([[../entities/adrs/adr-029-engine-specialization]]) — PARALLEL modifier 4-gate strict (Marius Advanced + tier T1+ + Bulk/Recomp + injury auto-disable) + wires `weaknessDetector.js` orfan §36.84 Gap #1
7. **Warm-up & Mobility** ([[../entities/adrs/adr-031-engine-warmup-mobility]]) — Instant Skip T0 default anti-Maria-friction + persona-aware thresholds + cooldown text-only post-session
8. **Deload** ([[../entities/adrs/adr-032-engine-deload-protocol]]) — micro-deload + standard deload week 4 non-negotiable + MRV invariant immutable

**Auxiliary engines support cross-pipeline:** [[../entities/engines/engine-muscle-recovery]] (per-group Big 6 + lagging detection) + [[../entities/engines/engine-weakness-detector]] (Brzycki 1RM relative lagging) + [[../entities/engines/engine-pr-wall]] (3 PR types weight/reps/volume Forta Foundation 1) + [[../entities/engines/engine-readiness]] (5-state emoji + score mapping kcal/protein delta) + [[../entities/engines/engine-streak-counter]] (§EXT-1 same direction + §EXT-2 Goal Shift reset anti-recurrence) + [[../entities/adrs/adr-033-muscle-memory-index]] (Engine #9 MMI candidate post-Beta v1.5).

**Cognitive Architecture foundation:** Per [[../entities/specs/spec-cognitive-architecture]] 5-engine + ARBITRATOR central + dimensions plugins ortogonale 75 puncte arhitecturale 2026-04-28 NIGHT stress test. Bugatti paradigm anti-monolit (Daniel verbatim *"NU Volvo, NU Dacia"*). ADR 018 Engine Extensibility plug-in additive Open-Closed foundation.

## Verbatim quotes Daniel

Daniel verbatim Bugatti paradigm cognitive architecture vision:
> *"Bugatti paradigm (NU Volvo, NU Dacia). 5-engine cognitive architecture cu ARBITRATOR central, plus dimensions plugins ortogonale."*

Daniel verbatim Constraint Object immutable propagated pipeline §1.10:
> *"Periodization §1 generează coridor Floor + Ceiling baseline → Goal Adaptation §2 redistribuie în interior, NU trece peste. Constraint Object immutable propagated. Single source of truth phase auto-derived."*

Daniel verbatim §36.84 Gap #1 weaknessDetector orfan reuse:
> *"weaknessDetector.js orfan — reuse Specialization Engine #7 PARALLEL modifier. Zero new code engine logic detection — pure session builder action layer reuse. Anti-duplication pattern."*

Daniel verbatim "vizor fără ușă" reframe 2026-05-06 morning:
> *"vizor fără ușă — ADRs SPEC READY V1 ≠ engine wired în coach decision flow live. Engine wiring real (multi-batch CC pipeline §42.10 sequential 4-6 batches) = priority pivot post Adapter Design Pattern."*

Daniel verbatim STAGE 4 SUB-BATCH 2 3 methods NEW LANDED 2026-05-11:
> *"3 engine gap-uri pre-port: muscleRecovery.js NEW + coachDirector 3 methods + usNavyBF.js NEW. Engine spine Big 6 + lagging detection foundation per ADR 029 Specialization 4-gate strict."*

## Bugatti framing notes

**Gigel test relevance cross-engine:** Pipeline §42.10 8 engines invisible la user. Surface UI = single coach recommendation (NU expose 8 voices). Pattern: complexity hidden orchestration Coach Director.

**Quality > Speed via Constraint Object immutable propagated:** Pure functions per engine deterministic, single source of truth phase auto-derived. NU shared state + NU side effects. Testable în vacuum (149 periodization tests + 11 muscle-recovery + 22 tempo + etc).

**Anti-RE considerations:** "Vizor fără ușă" reframe = anti-recurrence "spec ADR engine NU wired în live flow". Pattern: bridge spec → implementation via Coach Director method add. Wires weaknessDetector orfan §36.84 Gap #1 anti-duplication.

**Anti-paternalism notes:** Coach Director respects readiness gate (`requiresReadinessInput: true` no-silent-default) + tier-aware calibration (T0 conservative / T1+ trust earned per ADR 009). User agency preserved cross-engine. Specialization Q15=B propose accept/reject NU auto-activate silent.

**Voice tone notes:** Daniel-isms "engine spine Big 6" + "vizor fără ușă" + "Bugatti paradigm" recurring patterns (foundational metaphors + craft discipline preserved cross-engine).

## Cross-refs raw layer

- [[../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 + §9.1-§9.7 canonical 8 engines specs
- [[../../03-decisions/024-goal-driven-program-templates]] Engine #2 Goal Adaptation Q1-Q8 LOCKED + Q6 D Hybrid
- [[../../03-decisions/022-bayesian-nutrition-inference]] Engine #4 Bayesian Nutrition Kalman filter
- [[../../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract + Dimension Registry plug-in additive
- [[../../03-decisions/030-adapter-design-pattern]] D1-D5 LOCKED V1 Hexagonal foundation orchestrator ports/adapters
- [[../../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1]] §1-§75 paradigm 5-engine + ARBITRATOR central
- [[../../src/engine/]] 8 pipeline engines + auxiliary implementations LANDED Faza 2.5 batches 1-7
- [[../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.84 Gap #1 weaknessDetector orfan + §36.100 Engine #2 + §36.102 + §42.10 pipeline
- [[../entities/specs/spec-cognitive-architecture]] cognitive paradigm foundation

🦫 **Coach Engines holistic Pipeline §42.10 8 prescriptive + auxiliary support. Constraint Object immutable propagated. Bugatti paradigm anti-monolit cognitive architecture 5-engine + ARBITRATOR + dimensions plugins. Wires weaknessDetector orfan §36.84 Gap #1 anti-duplication. "Vizor fără ușă" spec→impl bridge pattern.**
