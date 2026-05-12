---
title: Engine Coach Director — Orchestrator Central Pipeline §42.10
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-024-goal-driven-program-templates]]"
  - "[[../adrs/adr-030-adapter-design-pattern]]"
  - "[[../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2"
  - "[[../../../src/engine/coachDirector.js]]"
---

# Engine Coach Director — Orchestrator Central Pipeline §42.10

## Synthesis

**Coach Director = orchestrator central** consum `buildCoachContext()` + dispatch sequential la 8 prescriptive engines pipeline §42.10 (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload). Implementation `src/engine/coachDirector.js` clasa `CoachDirector` cu method principal `buildSession(sessionType)` invocat de UI după readiness input set. Coordinează: calibration tier detection (T0/T1/T2 per ADR 009) + patterns CDL gating (per calibration tier) + dimension registry plug-in additive (per ADR 018) + decision cluster trace (per ADR 030 §3) + auto-aggression dimension adapter legacy shape.

**3 methods NEW LANDED STAGE 4 SUB-BATCH 2 commit chain 2026-05-11** (`ebd656e + ce30efe + dab7247`):
1. `buildLightMobility()` — fallback session light mobility când recovery state insufficient pentru full workout (per ADR 031 Engine Warm-up & Mobility cross-engine hook)
2. `rebalanceWeekAfterSkip()` — săptămână re-distribute volume post-skip session (per ADR 024 phase auto-detection)
3. `generateSafeSessionForRestDay()` — minimal session structure pentru rest day override (anti-burnout cap)

Cross-ref Hexagonal foundation per ADR 030 D1-D5 LOCKED V1 — Coach Director = `src/coach/orchestrator/` core ports + adapters pattern (orchestrator commit `5a16550` Phase 1-2 LANDED).

## Verbatim quotes Daniel

Daniel verbatim "vizor fără ușă" reframe LOCKED 2026-05-06 morning post audit engine wiring gap:
> *"vizor fără ușă — ADRs SPEC READY V1 ≠ engine wired în coach decision flow live. Engine wiring real (multi-batch CC pipeline §42.10 sequential 4-6 batches) = priority pivot post Adapter Design Pattern."*

Daniel verbatim §36.84 Gap #1 weaknessDetector orfan reuse rationale:
> *"weaknessDetector.js orfan — reuse Specialization Engine #7 PARALLEL modifier. Zero new code engine logic detection — pure session builder action layer reuse. Anti-duplication pattern."*

## Bugatti framing notes

**Gigel test relevance:** Coach Director invisible la user — surface UI = workout recommendation single. Engine complexity orchestration hidden. Pattern: deterministic engine pipeline NU NLP/LLM runtime per CLAUDE.md §0 + SUFLET ANDURA §1.1.

**Quality > Speed via sequential pipeline §42.10:** 8 engines în ordering canonical preserves single source of truth phase auto-derived (Goal Adaptation Cluster 3) — downstream engines consume phase signal NU override. Constraint Object immutable propagated per ADR 026 §1.10.

**Anti-RE considerations:** 3 methods NEW STAGE 4 SUB-BATCH 2 LANDED filled engine gap-uri pre-port (anti-recurrence "engines spec dar nu wired în live flow" pattern Daniel push-back). Pattern: bridge spec → implementation via Coach Director method add.

**Anti-paternalism notes:** Coach Director respects calibration tier (T0 conservative defaults / T1+ trust earned) + readiness input mandatory (NU silent default). User agency preserved via `requiresReadinessInput` gate (NU silent assumption).

**Voice tone notes:** Daniel-ism "vizor fără ușă" recurring metaphor (spec without implementation = useless). Pattern preserved cross-engine bridge work.

## Cross-refs raw layer

- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 + 8 engines ordering canonical
- [[../../../03-decisions/024-goal-driven-program-templates]] Engine #2 Goal Adaptation + phase auto-detection Q4
- [[../../../03-decisions/030-adapter-design-pattern]] D1-D5 LOCKED V1 Hexagonal foundation + ports/adapters
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2 Coach Director +3 methods landed commits chain
- [[../../../src/engine/coachDirector.js]] (clasa CoachDirector + buildSession + 3 methods NEW)
- [[../../../src/engine/coachContext.js]] (buildCoachContext input pipeline)
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.84 Gap #1 weaknessDetector orfan reuse Specialization

🦫 **Engine Coach Director orchestrator central pipeline §42.10. 3 methods NEW LANDED STAGE 4 SUB-BATCH 2 commit chain `ebd656e`. Bridge spec → implementation pattern preserved cross-engine.**
