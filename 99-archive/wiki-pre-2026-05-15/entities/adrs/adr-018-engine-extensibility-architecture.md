---
title: ADR 018 — Engine Extensibility Architecture
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-27
authority: 03-decisions/018-engine-extensibility-architecture.md raw layer §Decision (5 componente structurale — Dimension Registry + Standardized Dimension Contract + Decision Cluster Engine + Schema Versioning + Feature Flags Infrastructure)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-004-rule-engine-numeric-priorities]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-013-auto-aggression-detection]]"
  - "[[adr-014-onboarding-profile-typing]]"
  - "[[adr-016-vitality-layer]]"
  - "[[adr-017-demographic-prior-database]]"
  - "[[adr-030-adapter-design-pattern]]"
  - "[[../../concepts/moat-strategy]]"
amendments: []
---

# ADR 018 — Engine Extensibility Architecture

## Synthesis

ADR 018 = decision **5 componente structurale** definesc arhitectură extensibilă engine. Original LOCK V1 2026-04-27. Trigger: Andura engine actual construit prin **acumulare hard-coded în `coachDirector.buildSession()`** — 240+ linii cu 6+ secțiuni hard-coded apeluri (detectWeakGroups + detectGlobalStagnation + predictToday + recompileWeek + runProactiveChecks + applyAAAdjustments + applyPatterns + realityEngine.validate). Pattern atins limita arhitecturală: niciun contract uniform între dimensiuni (AA întoarce `{tier, signals, escalating, amplified}` vs Profile typing `{primary, secondary, confidence, scores, flags}` vs Stagnation `{maxStagnationWeeks}` — tooling NU poate generaliza testare/debugging/trace) + Schema CDL evoluează ad-hoc (PATCH 2026-04-26 autoAggression + rest_marked = exemplu fără versioning explicit) + Niciun rollout gradual (dimensiune nouă = LIVE pentru toți userii la merge time, 0%→100% fără faze). Decision 5 componente: (1) **Dimension Registry** — `src/engine/dimensionRegistry.js` static array `DIMENSIONS` cu metadata + module reference, director iterează registry NU hard-coded imports + apeluri inline, (2) **Standardized Dimension Contract** — interfață uniformă `analyze(input) → DimensionResult` toate dimensiunile, (3) **Decision Cluster Engine** — pipeline staged înlocuiește iteration hard-coded coachDirector cu stages (GATE / ADJUSTMENT / CONTEXT), (4) **Schema Versioning + Migration Runner** — versioned schemas + eager migration pe app load `v_X → v_Y` bump, (5) **Feature Flags Infrastructure** — runtime per-user rollout cu hashing deterministic 10%/50%/100%. Migration path dimensiuni existing (AA + Profile Typing → plugin). Daniel articulation INSIGHTS_BACKLOG 27 apr 2026: foundation arhitecturală **înainte** de build features noi (Vitality + Demographic Prior + future), NU after-the-fact cleanup. NU spec implementabil. Spec EXEC_QUEUE per componentă post-acceptance.

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-04-27 INSIGHTS_BACKLOG seminal articulation engine extensibility:

> *"engine extensibil prin natura lui — orice idee viitoare devine layer adăugabil, NU rewrite. Posibilitatea de îmbunătățire în orice etapă fără să moară."*

(Context: Daniel core articulation engine philosophy — extensibility = foundation discipline NU after-the-fact cleanup. Cumulative cost coachDirector hard-coded sufocă velocitatea iterație fără ADR 018.)

Daniel articulation chat strategic universal scope rollout gradual feature flags (cross-ref [[adr-016-vitality-layer]] feature flag rollout 10%/50%/100%):

> *"NU 0%→100% LIVE pentru toți. Faze. Metric watch. Vitality Layer friction zero-but-untested = candidate clar rollout gradual."*

(Synthesis paraphrase Daniel articulation chat strategic — feature flags infrastructure foundation Vitality + Demographic Prior + future plugins.)

Daniel articulation chat strategic anti-rewrite philosophy (cross-ref [[../../concepts/moat-strategy]] + universal scope):

> *"NU rewrite. Layer adăugabil. Engine moare dacă fiecare dimensiune = mini-refactor coachDirector."*

## Bugatti framing notes

**Quality > Speed via foundation discipline:** ADR 018 = foundation **înainte** features noi (Vitality + Demographic Prior + future). NU after-the-fact cleanup. Bugatti craft = build right la fundament.

**Anti-RE considerations:** Dimension Registry export const (immutable post-import) + static array NU runtime `register()` API v1. Tooling generalize uniform debug UI afișează toate axele uniform. Anti-RE protection engine internals via abstraction layer.

**Anti-paternalism notes:** Feature Flags Infrastructure runtime per-user rollout hashing deterministic = transparent metric watch NU paternalism "engine knows better". 10%/50%/100% phases user-segmented graceful adoption.

**Voice tone notes:** "orice idee viitoare devine layer adăugabil, NU rewrite" = SEMINAL Daniel articulation INSIGHTS_BACKLOG 27 apr 2026. Engine philosophy preservation Bugatti craft + identity Andura voice fidelity §1.

**Gigel test relevance:** Feature flags rollout gradual = Gigel-friendly graceful adoption (NU "today everyone sees new Vitality questions"). User segments metric watch — friction zero confirmed → expand. Anti-paternalism universal scope.

## Cross-refs raw layer

- [[../../../03-decisions/018-engine-extensibility-architecture]] §Decision (5 componente structurale) + §1 Dimension Registry + §2 Standardized Dimension Contract + §3 Decision Cluster Engine + §4 Schema Versioning + §5 Feature Flags Infrastructure
- [[../../../03-decisions/004-rule-engine-numeric-priorities]] §Decision (rule engine foundation NumericPriorities cross-ref Decision Cluster Engine stages)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Schema Extension 2026-04-26 (autoAggression + rest_marked exemplu fără versioning catalysator ADR 018)
- [[../../../03-decisions/013-auto-aggression-detection]] §Decision (AA detection migration plugin pattern ADR 018)
- [[../../../03-decisions/014-onboarding-profile-typing]] §Decision (Profile Typing migration plugin pattern ADR 018)
- [[../../../03-decisions/016-vitality-layer]] §Dependency ADR 018 ACCEPTED foundation + 8 componente plugin
- [[../../../03-decisions/017-demographic-prior-database]] §Decision (Demographic Prior plugin pattern ADR 018)
- [[../../../03-decisions/030-adapter-design-pattern]] §D1-D5 LOCKED V1 (Hexagonal arhitectură cross-ref Dimension Registry + Contract evolution)
- [[../../../05-findings-tracker/INSIGHTS_BACKLOG]] §ADR 018 articulation 2026-04-27 engine extensibility seminal
- [[../../../03-decisions/DECISION_LOG]] §2026-04-27 entry

🦫 **ADR 018 Engine Extensibility Architecture LOCK V1 2026-04-27. 5 componente structurale (Dimension Registry + Contract + Decision Cluster + Schema Versioning + Feature Flags). Foundation ÎNAINTE features noi NU after-the-fact cleanup. orice idee viitoare devine layer adăugabil NU rewrite — Daniel articulation seminal preservation Bugatti craft.**
