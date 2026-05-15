---
title: F7 — Coach Director UX Hooks (Engine Pipeline Output + UI Toggle Flags)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F7"
  - "[[../engines/engine-coach-director]]"
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-018-engine-extensibility-architecture]]"
---

# F7 — Coach Director UX Hooks

## Synthesis

**F7 Coach Director UX Hooks** = engine coachDirector pipeline output cached + UI toggle flags pentru behaviors per session output. V1 prod `sessionCache` + `setCachedDirector` + `uiToggleFlags`. V1_AUDIT verdict **KEEP verbatim** — Coach Director output engine pipeline §42.10 (8 prescriptive engines) NU optional, fundamental V1 architecture. Port direct cu engine imports ADR 018 §2 preserved.

**UX surface:** Antrenor idle + workout cards consume Coach Director output ca data context (NOT direct UI surface — backend orchestrator). Pattern: F7 = integration layer engine ↔ UI consumer NU stand-alone visible feature. Pipeline output cached `sessionCache` per session lifecycle + flush la session end. UI toggle flags drive conditional rendering (e.g., readiness verdict show/hide, fatigue display threshold gating).

**Engine integration:** [[../engines/engine-coach-director]] orchestrator central pipeline §42.10 dispatch — 8 prescriptive engines (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload). Constraint Object immutable propagated per ADR 026 §1.10. ADR 018 §2 Standardized Dimension Contract `evaluate(ctx) → DimensionResult` per engine output verdicte aggregate Arbitrator 5-level Precedence + 27 reguli unchanged.

## Verbatim quotes Daniel

Daniel verbatim §F7 keep verbatim rationale fundamental V1 architecture:
> *"Coach director = output engine pipeline §42.10 (8 prescriptive engines). NU optional — fundamental V1 architecture. Port direct cu engine imports ADR 018 §2 preserved."*

Daniel verbatim Coach Director "vizor fără ușă" reframe LOCKED 2026-05-06:
> *"vizor fără ușă — ADRs SPEC READY V1 ≠ engine wired în coach decision flow live. Engine wiring real (multi-batch CC pipeline §42.10 sequential 4-6 batches) = priority pivot post Adapter Design Pattern."*

## Bugatti framing notes

**Gigel test relevance:** F7 invisible la user — backend integration layer. Surface UI = workout recommendation single + verdict display (F4 readiness + F3 fatigue). Engine complexity orchestration hidden.

**Quality > Speed via engine imports ADR 018 §2 preserved:** Direct port verbatim NU re-design. Pattern: integration layer respect engine contract immutable.

**Anti-RE considerations:** "Vizor fără ușă" reframe LOCKED 2026-05-06 = anti-recurrence "spec ADR engine NU wired în live flow" pattern. Pattern: bridge spec → implementation via Coach Director method add (STAGE 4 SUB-BATCH 2 3 methods NEW LANDED commit `ebd656e`).

**Anti-paternalism notes:** Coach Director respects readiness gate (`requiresReadinessInput: true` no-silent-default) + tier-aware calibration (T0 conservative / T1+ trust earned per ADR 009). User agency preserved.

**Voice tone notes:** Daniel-ism "vizor fără ușă" recurring metaphor (spec without implementation = useless). Anti-orphan-spec discipline.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F7 verdict KEEP verbatim
- [[../../../src/engine/coachDirector.js]] clasa CoachDirector + buildSession + 3 methods NEW STAGE 4 SUB-BATCH 2
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 8 prescriptive engines ordering
- [[../../../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract engine imports
- [[../../../03-decisions/030-adapter-design-pattern]] D1-D5 LOCKED V1 Hexagonal foundation Coach Director ports/adapters
- [[../engines/engine-coach-director]] (orchestrator central + 3 methods NEW STAGE 4 SUB-BATCH 2)
- [[../engines/engine-periodization]] (pipeline §42.10 1st Constraint Object immutable propagated downstream)

🦫 **F7 Coach Director UX Hooks KEEP verbatim. Engine pipeline §42.10 8 prescriptive engines output cached + UI toggle flags. Fundamental V1 architecture port direct ADR 018 §2 contract preserved. Anti-orphan-spec discipline preserved.**
