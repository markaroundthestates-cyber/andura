# ADR_COMPOSITE_SIGNAL_LAYER_v1

**Status:** LOCKED V1
**Locked:** 2026-05-02 per ALIGNMENT_QUESTIONS Q1 Daniel response
**Data:** 2026-05-02 (creat în BATCH_05 final Sprint 4.x cluster)
**Origine:** §36.41 Chat C SELF-CORRECTION EXTENSION

---

## Context

Engines individuale (ProactiveEngine, StagnationDetector, RuleEngine) pot da false positives la triggers individuali — Maria 65 cu o sesiune slabă declanșează deload prematur, Marius 25 cu RPE inflated declanșează push prematur. Single-metric arbitrary thresholds (e.g., 50% scor cumulative) = false positive rate observat ~30% în synthetic data Chat C analysis.

Soluție: agregare la nivel de **Composite Signal Layer** ca arbitration intermediate între engines individuale și CASCADE_DEFENSE final arbiter.

## Decision

**Composite Signal Layer** declanșează DOAR când **3 metrici simultan abnormal** (3/3 simultaneous threshold per §36.41 — NU cumulative score):

1. **Performance Drop** > 15% volume reduction vs rolling avg 3 sesiuni anterior
2. **Rest Time Multiplier** > 1.5× normal pe exercițiu (signal recuperare insuficientă)
3. **RIR Mismatch** ≥ 2 (declared RIR off de actual rep failure)

Lifecycle:
- **Idle** → **Flagged** (3/3 detected) → **Cooldown** (3 sesiuni post-flag, NU re-trigger imediat) → **Resolving** (2 sesiuni clean → flag cleared) → **Idle**

Output: `composite_signal_active: true` flag → CASCADE_DEFENSE Layer D budget ≤50ms arbitration decide action (deload preventiv vs continue cu monitoring).

## Consequences

### Positive
- **False positive reduction** prin 3-metric AND logic (vs single-metric arbitrary threshold)
- **Lifecycle cooldown** previne hyperreactive coach pattern (per F-NEW-3 cooldown principle)
- **Auditable**: fiecare detection logged cu cele 3 metrici + values, audit-friendly post-incident
- **Backwards-compatible** cu existing engines — Composite Signal e ortogonal, NU înlocuiește ProactiveEngine/StagnationDetector

### Negative
- **Latență detection** crescută (3 metrici trebuie să fie abnormal SIMULTAN — nu detectează drift gradual cu DOAR 1-2 metrici)
- **Threshold tuning** necesar post-launch (Performance Drop 15% / Rest Time 1.5× / RIR Mismatch 2 sunt initial estimates; A/B post-data)
- **Schema dependency**: rest time tracking necesită CDL extension cu `rest_seconds_per_set` field

### Neutral
- Implementation skeleton pre-Beta în `src/engine/composite-signal/` (BATCH_04). Wiring în RuleEngine pending Sprint integration ulterior.

## Alternatives considered

1. **Single-metric triggers** (e.g., 50% volume drop alone) — REJECTED: false positive rate ~30% în synthetic data Chat C
2. **Cumulative score (sum × weights)** — REJECTED per §36.41 push-back Claude (50% scor arbitrary, NU justifiable empirically)
3. **ML model end-to-end** — DEFERRED V2+ (pre-launch zero ML data, Beta cohort 50 users insufficient)
4. **Manual user pause button only** — REJECTED: paternalism mascat reverse (force user să recunoască platou explicit)

## Cross-refs

- §36.41 Composite Signal Layer Recovery State Adjustment (HANDOVER_GLOBAL)
- ADR_CASCADE_DEFENSE EXT-2 (Layer D budget ≤50ms)
- ADR_OUTLIER_FILTER (rolling window 8 sessions baseline pattern)
- §36.48 per-set normalization (foundation pentru Performance Drop calculation)
- Implementation: `src/engine/composite-signal/` (BATCH_04)
- Tests: `src/engine/composite-signal/__tests__/compositeSignal.test.js`

## Reconsideration triggers

1. **False positive rate >5% post-Beta** → tighten thresholds sau adaugă a 4-a metrică (e.g., sleep quality)
2. **False negative rate observed** (real platou nu detectat) → relax thresholds sau adaugă alternative trigger paths
3. **CDL `rest_seconds_per_set` field absent** → fallback la 2-metric (Performance Drop + RIR Mismatch) cu scor mai conservator
4. **EU AI Act 2025+ classification high-risk** → add explainability layer (WhyEngine integration pentru fiecare flag)
