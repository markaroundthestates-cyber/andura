---
title: ADR 031 — Engine Warm-up & Mobility (Pipeline §42.10 7th)
type: entity
subtype: adr
status: spec-reference
locked_date: 2026-05-06
authority: 03-decisions/031-engine-warmup-mobility.md SPEC REFERENCE redirect canonical ADR 026 §9.7 (21 decisions Cluster A-E)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-017-demographic-prior-database]]"
  - "[[adr-025-andura-gandeste-pentru-user]]"
  - "[[adr-pain-discomfort-button]]"
amendments: []
---

# ADR 031 — Engine Warm-up & Mobility

## Synthesis

ADR 031 = SPEC REFERENCE redirect-only (canonical ADR 026 §9.7). Engine Warm-up & Mobility = pipeline §42.10 **7th position** penultimate prescriptive engine pre-Deload. Adaptive warm-up routine 5-10 min Hybrid 1-2 general dynamic + 2-3 specific muscle group prep, persona-aware thresholds.

**Decisions core LOCKED V1:** Maria 5-10 mobility flow / Gigica 5-7 dynamic + ramp / Marius 8-10 ramp protocol 50-70-90% Cluster B3 (persona resolution per ADR 017). **Instant Skip principle T0 default** (ramp-up integrated first exercise, ZERO ecran suplimentar) + T1+ opt-in expanded routine (anti-Maria-friction default + tier-aware trust earned). Optional 2 min stretch text-only cooldown post-session (Source 1 §65.4 OVERRIDE Q4 reconciled — Source 1 §65.4 OVERRIDE Q4 supersedes Source 2 §45.6 Q-Cooldown defer per Daniel's later decision authority pattern). Implementation `src/engine/warmup/` V1 LANDED commit `20999fb` Faza 2.5 batch 7 (durationCalculator + routineComposer + skipManager + crossEngineHooks sub-modules).

**Cluster E1 tier-aware T0/T1+:** T0 Instant Skip + reference-only metadata. Pattern preserved cross-engine ADR 009 §AMENDMENT 2026-05-05 birou Convergence Guard T2 Unlock alignment. Cluster B4 skip buton vizibil session 1 anti-paternalism preserved (per ADR 025 graceful degradation).

## Verbatim quotes Daniel

Daniel verbatim Instant Skip T0 default rationale Bugatti minimal-friction:
> *"T0 default = Instant Skip. Ramp-up integrated first exercise. ZERO ecran suplimentar. Maria session 1 NU vede warm-up modal. Anti-Maria-friction. T1+ opt-in expanded routine when trust earned."*

Daniel verbatim Source 1 §65.4 OVERRIDE Q4 reconciled (cooldown text-only):
> *"Cooldown 2 min stretch text-only post-session. NU video. NU GIF. Text only. Override Q-Cooldown defer Source 2 §45.6."*

## Bugatti framing notes

**Gigel test relevance:** Instant Skip T0 default = zero gândire user (skip integrated, NU prompt-dance). T1+ opt-in expanded when trust earned via tier progression.

**Quality > Speed via persona-aware thresholds:** Maria 5-10 mobility flow / Gigica 5-7 dynamic+ramp / Marius 8-10 ramp 50-70-90% = same engine 3 persona configurations. Anti-one-size-fits-all preserved.

**Anti-RE considerations:** Reverse pattern note ADR creation direct SPEC REFERENCE (NU intermediate STUB) — `032` Deload mirror precedent. Pattern: post pipeline §42.10 V1 closure batch cleanup ADR creation direct redirect-only.

**Anti-paternalism notes:** Skip buton vizibil session 1 anti-paternalism (per ADR 025 graceful degradation). User can opt-out 100% sessions warm-up = acceptable (NU forced compliance).

## Cross-refs raw layer

- [[../../../03-decisions/031-engine-warmup-mobility]] §Redirect SPEC REFERENCE
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.7 canonical 21 decisions Cluster A-E
- [[../../../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract evaluate(ctx) → WarmupResult
- [[../../../03-decisions/017-demographic-prior-database]] persona resolution Cluster B3 thresholds
- [[../../../03-decisions/025-andura-gandeste-pentru-user]] graceful degradation Cluster B4 skip anti-paternalism
- [[../../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock Cluster E1 tier-aware
- [[../../../03-decisions/030-adapter-design-pattern]] D1-D5 LOCKED V1 Hexagonal Phase 1-2 orchestrator foundation commit `5a16550`
- [[../../../06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening]] §45.6 Source 2
- [[../../../📤_outbox/_archive/2026-05/131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED]] BATCH 4 §65.1-§65.4 Source 1 OVERRIDE Q1 + Q4
- [[../../../src/engine/warmup/]] V1 LANDED Faza 2.5 batch 7 commit `20999fb`

🦫 **ADR 031 SPEC REFERENCE Engine Warm-up & Mobility pipeline §42.10 7th. Persona-aware thresholds + Instant Skip T0 default + cooldown text-only Source 1 OVERRIDE reconciled.**
