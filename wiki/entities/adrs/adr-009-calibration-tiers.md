---
title: ADR 009 — Calibration Tiers (5-level + AMENDMENT 2026-04-30 orthogonal axes + AMENDMENT 2026-05-05 Behavioral Validation)
type: entity
subtype: adr
status: amended
locked_date: 2026-04-23
authority: 03-decisions/009-calibration-tiers.md raw layer §Decision (5-tier active) + §AMENDMENT 2026-04-30 (orthogonal axes engine_tier + calibration_confidence, D1 RESOLVED 6-tier canonical) + §AMENDMENT 2026-05-05 birou after (Convergence Guard T2 Unlock Behavioral Validation cross-cutting)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-003-double-progression-engine]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-013-auto-aggression-detection]]"
  - "[[adr-022-bayesian-nutrition-inference]]"
  - "[[adr-012-tier-decay-on-inactivity]]"
  - "[[../specs/spec-cognitive-architecture]]"
amendments:
  - date: 2026-04-30
    note: SSOT axes ortogonale — engine_tier (T0/T1/T2 voice weighting) + calibration_confidence (COLD_START → OPTIMIZED pattern gates). D1 RESOLVED ADD DEVELOPING tier canonical 6-tier (Sprint 4 implementation ~8-12h)
  - date: 2026-05-05
    note: Convergence Guard T2 Unlock Behavioral Validation cross-cutting LOCKED V1 — formula final post 5 iterations (Statistical Convergence + Behavioral Validation N≥10 + adherence ≥80% + max 2 Pain-Aware sesiuni)
---

# ADR 009 — Calibration Tiers

## Synthesis

ADR 009 = decision 5-tier calibration system progressive engine activation. Original LOCK V1 2026-04-23. Tiers: **COLD_START** (<7d, <3 sess, off all) → **INITIAL** (7-28d, 3-12 sess, patterns high ≥70%) → **PERSONALIZING** (28-90d, 12-40 sess, +stagnation+prediction) → **PERSONALIZED** (90-180d, 40-80 sess, +profile) → **OPTIMIZED** (180+d, 80+ sess, 6mo rolling window). Cold start NU silence — `generateColdStartSession()` population-prior weights day 1. Calibration banner UI COLD_START + INITIAL "🧠 Inițializare". §AMENDMENT 2026-04-30 SSOT clarifies 2 orthogonal axes: **engine_tier** (T0/T1/T2 data volume axis voice weighting Cognitive Arch R8 — REALTIME/HISTORICAL/PROJECTION %) + **calibration_confidence** (6-tier post-D1 RESOLVED, ADD DEVELOPING între INITIAL și PERSONALIZING — pattern gates + expensive engines + recalibration freq). NU contradictorii — 2 dimensiuni distincte maturitate user. §AMENDMENT 2026-05-05 birou after Convergence Guard T2 Unlock Behavioral Validation cross-cutting: NU pure statistical (σ² reducere) — engine MUST observe `(outcome.executed && volume_adherence_vs_pain_adjusted ≥ 80%)` N≥10 sesiuni + max 2 Pain-Aware ultimele 10 ÎNAINTE unlock T2. Anti-Bugatti-fakery T2 unlock principle Daniel articulation.

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-04-30 evening D1 routing DEVELOPING tier ADD decision:

> *"dezvoltam dupa ce terminam cu restul, de ce sa ne dam in cap dupa cu testari?"*

(Context: Sprint 4 implementation deferred post-Sprint 3 full T&B + Multi-tenant + Calibration Drift, zero-disruption ongoing pre-launch work.)

Daniel verbatim chat strategic 2026-05-05 birou after Convergence Guard fundamental seminal push-back (Engine #3 Bayesian Nutrition spec session mid-flight):

> *"T2 = Behavioral Validation NOT just statistical convergence"*

(Context: Eu Claude am gândit pure math σ² reducere thresholds, Daniel articulated scope adevărat T2 unlock = engine MUST observe self-report aligns biological reality CDL ÎNAINTE adaptări agresive. Formula final post 5 iterations refinement.)

Daniel verbatim chat strategic 2026-05-05 anti-Bugatti-fakery articulation:

> *"Gigel ignoring pain pentru T2 progress = Bugatti hits guardrail real anti-pattern. NU vreau engine reward exploitation. T2 unlock = behavior aligns biology."*

Daniel verbatim chat strategic 2026-05-05 pragmatic kcal_baseline floor (Maria 65 small frame protection):

> *"σ < MAX(10% kcal_baseline, 200 kcal absolute floor) — food tracking realitate ±200 kcal natural. Protejează small frame edge cases."*

## Bugatti framing notes

**Gigel test relevance:** Cold start NU silence — Maria 65 (mecanic profile equivalent) primește population-prior weights day 1, NU "primește nimic until 3 sessions". UX dignity preserved + tier transitions invisible internal (banner only COLD_START + INITIAL transparency learning phase).

**Quality > Speed via Behavioral Validation:** T2 unlock conservative (N≥10 + adherence + max 2 Pain-Aware) = NU premature aggressive adaptations risk biological misalign. Bugatti craft = preservation guardrail Maria 65 vulnerable users.

**Anti-RE considerations:** Tier boundaries internal (days + sessions thresholds), tier transitions tăcut (NU "your tier decreased" notification user — alarm fatigue prevention + anti-RE engine internals).

**Anti-paternalism notes:** Banner COLD_START + INITIAL = transparency "still learning", NU paternalist "we know better". Disappears post-PERSONALIZING — user owned phase.

**Voice tone notes:** "T2 = Behavioral Validation NOT just statistical convergence" = SEMINAL Daniel articulation chat strategic 2026-05-05 birou after. Preserved verbatim catalog identity Andura.

## Cross-refs raw layer

- [[../../../03-decisions/009-calibration-tiers]] §Decision (5-tier active code) + §AMENDMENT 2026-04-30 (orthogonal axes + D1 6-tier canonical) + §AMENDMENT 2026-05-05 birou after (Convergence Guard T2 Unlock Behavioral Validation cross-cutting)
- [[../../../03-decisions/003-double-progression-engine]] §Consequences (minimum 2-3 sessions requirement aligns tier gating)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Schema (CDL context.calibrationLevel + outcome.autoAggression + pain_aware extension)
- [[../../../03-decisions/013-auto-aggression-detection]] §Severity tiers (AA gates per calibration tier sensitivity)
- [[../../../03-decisions/022-bayesian-nutrition-inference]] §Cluster Convergence Guard T2 Unlock (cross-cutting LANDED 2026-05-05 birou after, this commit)
- [[../../../03-decisions/012-tier-decay-on-inactivity]] §Decision (linear decay 60 inactive days/tier, floor INITIAL)
- [[../../../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q15 R8 R20 (engine_tier voice weighting axis spec)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-30 evening D1 + §2026-05-05 birou after entries

🦫 **ADR 009 Calibration Tiers LOCK V1 2026-04-23 + §AMENDMENT 2026-04-30 orthogonal axes 6-tier canonical D1 RESOLVED + §AMENDMENT 2026-05-05 birou after Convergence Guard T2 Unlock Behavioral Validation cross-cutting. T2 = Behavioral Validation NOT just statistical convergence — anti-Bugatti-fakery Maria 65 protection.**
