---
title: ADR Cascade Defense v1 (4 Layers Runtime Defense)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_CASCADE_DEFENSE_v1.md LOCKED V1 Chat D ADR Review Process §36.56 — 0 amendments clean LOCK
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-020-storage-tiering-strategy]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-025-andura-gandeste-pentru-user]]"
  - "[[adr-composite-signal-layer]]"
amendments: []
---

# ADR Cascade Defense v1

## Synthesis

ADR_CASCADE_DEFENSE = 4 layers runtime defense pentru engine recommendation cascade silent → bug runtime → recommendation invalid (e.g. exercițiu ID inexistent post-library refactor) → safe fallback expected. Golden Master testing necesar dar NU suficient (testează snapshots pre-deploy, NU edge cases runtime never seen). Layered runtime defense protejează cascade silent + propagation bug.

**Layer A — Schema Validation Runtime:** `if (!isValidExercise(recommendation.id)) { logErrorToCDL(recommendation); return getSafeDefaultRecommendation(userProfile); }`. Schema invalid (ID inexistent / shape malformed) → throw + log + safe default. NU propagate cascade. Safe default per profile: Maria 65 Sit-to-Stand bodyweight / Marius 25 Squat barbell baseline last successful session pre-cascade / Gigica 35 Cable Pull-through baseline.

**Layer B — Confidence Score INTERNAL signal** (NU user-facing default). Rămâne strict internal engine signal, invizibil user implicit. User-facing DOAR 2 cazuri: (1) Outlier confirmation §36.24; (2) Confidence DROPS HIGH→LOW mid-program (regresie reală signal). Prima săptămână 4 sesiuni TOATE LOW confidence (zero istoric) — NU friction. Banner onboarding generic *"Programul se calibrează pe ritmul tău. Primele 4 sesiuni = baseline."*

**Layer C — Sanity Bounds:** Hardcoded reasonable limits per profile cap (e.g., Maria 65 1RM Squat ≤ 80kg / Marius 25 1RM Squat ≤ 250kg / kg increment ≤ 5kg per session). Engine output exceeds → clamp + log "outlier flag" CDL.

**Layer D — Composite Signal Final Arbiter** (cross-ref ADR_COMPOSITE_SIGNAL_LAYER): Budget ≤50ms arbitration decide action (deload preventiv vs continue cu monitoring). 3-metric AND logic anti-false-positive single threshold arbitrary.

## Verbatim quotes Daniel

Daniel verbatim Layer A safe default per profile rationale:
> *"Schema invalid → throw + log + safe default per profile. Maria Sit-to-Stand. Marius Squat baseline last successful. NU propagate cascade silent. CDL log mandatory."*

Daniel verbatim Layer B prima săptămână banner rationale anti-friction:
> *"Prima săptămână 4 sesiuni TOATE LOW confidence. NU friction. Banner onboarding generic 'Programul se calibrează pe ritmul tău. Primele 4 sesiuni = baseline.'"*

## Bugatti framing notes

**Gigel test relevance:** Layer A safe default fallback = zero gândire user (engine handles silent, NU prompt-confused). Surface = recommendation continues, log audit trail CDL.

**Quality > Speed via 4 layers depth:** Schema + Confidence + Sanity + Composite Signal = defense in depth. Anti single-point-of-failure pattern preserved.

**Anti-RE considerations:** ADR 025 §3.6 cross-ref tension resolved — data degradation continues (ADR 025 alignment graceful), contract violations halt (Cascade Defense strict). Concrete error semantics per §3.6 taxonomy table.

**Anti-paternalism notes:** Layer B Confidence INTERNAL signal NU user-facing implicit = anti-burden user pe metadata. User-facing DOAR la regresie reală OR outlier confirmation explicit.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_CASCADE_DEFENSE_v1]] §Decision Layer A-D verbatim
- [[../../../01-vision/SUFLET_ANDURA]] §3 cascade silent runtime defense source
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.25 (origin) + §29.2.5 Engine Forță safe default
- [[../../../03-decisions/020-storage-tiering-strategy]] Tier 1 CDL log layer A errors
- [[../../../03-decisions/011-coach-decision-log-architecture]] CDL foundation audit trail
- [[../../../03-decisions/030-adapter-design-pattern]] §3.6 Q-OPEN-6 severity-aware tension cu graceful resolved

🦫 **ADR Cascade Defense LOCKED V1 2026-05-02. 4 layers runtime defense (Schema + Confidence + Sanity + Composite Signal). Safe default per profile + CDL log audit + anti single-point-of-failure pattern.**
