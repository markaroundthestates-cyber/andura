# ADR — Cascade Defense v1 (4 Layers Runtime Defense)

**Status:** ✅ **LOCKED V1** (2026-05-02 Chat D ADR Review Process EXECUTED per §36.56 — 0 amendments, clean LOCK)
**Date:** 2026-05-02 (SUFLET ANDURA ingest → LOCKED V1 Chat D)
**See also:** [[SUFLET_ANDURA]] §3 + HANDOVER_GLOBAL §36.25 + ADR 020 Storage Tiering + ADR 011 CDL + §29.2.5 Engine Forță

---

## Context

Sufletul Andura: engine recommendation poate cascade silent → bug în runtime → recommendation invalid (e.g. exercițiu ID inexistent post-library refactor) → safe fallback expected. Golden Master testing necesar dar NU suficient (testează snapshots pre-deploy, NU edge cases runtime never seen).

Layered runtime defense protejează cascade silent + propagation bug.

## Decision

### Layer A — Schema Validation Runtime

```javascript
if (!isValidExercise(recommendation.id)) {
    logErrorToCDL(recommendation);
    return getSafeDefaultRecommendation(userProfile);
}
```

Schema invalid (exercițiu ID inexistent / shape malformed) → throw + log + safe default. NU propagate cascade.

**Safe default per profile:**
- Maria 65: Sit-to-Stand bodyweight
- Marius 25: Squat barbell baseline weight (last successful session pre-cascade)
- Gigica 35: Cable Pull-through baseline

### Layer B — Confidence Score INTERNAL signal (NU user-facing default)

- Rămâne strict **internal engine signal**, invizibil user implicit.
- User-facing DOAR în 2 cazuri:
  1. Outlier confirmation (per §36.24)
  2. Confidence DROPS HIGH→LOW mid-program (regresie reală signal)
- **Prima săptămână 4 sesiuni:** TOATE LOW confidence (zero istoric) — NU friction. Banner onboarding generic acoperă: *"Programul se calibrează pe ritmul tău. Primele 4 sesiuni = baseline."*

### Layer C — Sanity Bounds Per Progression Phase + Global Cap

| Faza | Max Progresie Săpt Compus |
|------|---------------------------|
| Newbie (săpt 1-8) | +10% |
| Intermediate (săpt 8-26) | +5% |
| Advanced (săpt 26+) | +2.5% |

**Failsafe Absolut Anti-Bug Global:** Indiferent profil/fază/exercițiu, hard cap **+20% săpt** ORICE exercițiu. Peste = blocked runtime, treated ca eroare calcul/tastare.

**Hard caps absolute exercise-specific:**
- Maria Sit-to-Stand: max 12 reps/set
- Marius Deadlift: max +10% (newbie) / +5% (intermediate) / +2.5% (advanced) săpt — restricted by phase

### Layer D — Runtime Invariant Checks

- Check continuu constants logice mid-session.
- Violare regulă bază (ex: volum total today = 3× last week) → reset calculations + apply baseline conservativ.
- Anti-cascade silent.

**Invariant examples:**
- `session.totalVolume <= prevSession.totalVolume * 1.5` (max 50% volume jump session-over-session)
- `recommendation.kg > 0` (zero-weight recommendation = bug)
- `recommendation.reps in [1, 30]` (out-of-bounds reps = bug)
- `recommendation.sets in [1, 6]` (excessive sets = bug)

## Consequences

### Positive

- Defense in depth: bug în Layer A → caught by Layer B (confidence drop) → caught by Layer C (sanity bound) → caught by Layer D (runtime invariant).
- Anti-cascade silent: each layer logs to CDL → audit trail post-incident.
- Safe defaults profile-aware: Maria 65 cascade fallback NU = Marius Squat 100kg.

### Negative

- Layer overhead: per-recommendation 4 checks. V1 acceptable (engine determinist + small surface). V2 monitor performance impact.
- Hard cap +20% global = restrictive pentru power users with legitimate +25% PR jumps. Mitigation: cap blocks runtime + prompts user "Valoarea introdusă pare neobișnuită — confirmi?" (per §36.24 outlier filter integration).

### Risks

- Confidence INTERNAL leaking accidentally to user-facing UI (prima săpt 4 sesiuni LOW confidence → if leaked → onboarding friction). Mitigation: Layer B explicit "NU user-facing default" + 2-case-only exposure.
- Layer C phase boundaries hard (newbie săpt 1-8 → intermediate săpt 8-26): user în săpt 8 = newbie OR intermediate? V1 inclusive lower bound (săpt 1-8 newbie, săpt 9+ intermediate).

## Test plan (deferred Daniel review)

- Unit Layer A: invalid exercise ID → safe default returned + CDL log
- Unit Layer B: prima săpt 4 sesiuni → confidence LOW + NU user-facing friction
- Unit Layer C: Marius advanced +3% săpt = OK / +5% = trigger sanity bound / +20% = global cap blocked + outlier prompt
- Unit Layer D: invariant violation (volume 3× prev) → reset + baseline conservativ + CDL log
- Integration: bug în Layer A → does NOT bypass Layer B/C/D (defense in depth verified)

## Reconsideration triggers

1. Performance impact runtime checks > 50ms (acceptable threshold).
2. Hard cap +20% triggers > 5% of sessions (potentially too restrictive).
3. Confidence INTERNAL accidental leak detected post-launch.
4. New exercise category needs additional invariants (Olympic lifts safety bounds).

---

*Authored 2026-05-02 SUFLET ANDURA ingest. Status DRAFT — pending Daniel review pre-LOCK.*

---

## §EXTENSION 2026-05-02 SELF-CORRECTION (post Self-Correction handover ingest)

**Cross-ref:** Realtime Per-Set Silent Recalibration (§36.28) — Layer D Runtime Invariant Checks rulează pe fiecare "Set terminat" tap pentru recalibrare next set kg/reps.

**Performance budget LOCKED V1:** Layer D checks ≤ **50ms** acceptable per tap. Peste threshold = revedere optimizare runtime invariant logic OR consider lazy invariant check (post-set, asincron) cu safe-default fallback între.

**Realtime application scope:** check engine state delta între set N (just-finalized) + set N+1 (recalibrated kg/reps) — NU full session re-validation.

---

*EXTENSION added 2026-05-02 SELF-CORRECTION ingest.*

---

## §EXTENSION 2026-05-02 CHAT C SELF-CORRECTION EXTENSION (post Chat C ingest)

### EXT-2: Composite Signal Layer Layer D Budget Reaffirmation (§36.41)

**Decizie:** Composite Signal Layer (§36.41) — multi-signal trigger detection (Performance Drop AND Rest Time Delta AND RIR Mismatch) cade sub Layer D Runtime Invariant Checks budget ≤ 50ms per "Set terminat" tap.

**Mecanică Layer D:**
- Composite Signal evaluation = aggregation 3 metrics per exercițiu, last 4 sessions cached
- Per-set evaluation: <10ms typical (cached aggregations + delta computation)
- Trigger evaluation 3/3 simultaneous: O(1) AND short-circuit
- **Total budget Layer D ≤ 50ms** include Composite Signal + invariant checks tradiționale

**Performance Risk Mitigation:**
- Cache last 4 sessions aggregation per (exercițiu × user) — invalidate on session save
- Composite Signal NU rulează mid-set, doar la "Set terminat" tap (deterministic timing)
- Lifecycle state (Kick-in / Active / Auto-resume / Extension) cached separat în engine state, NU recomputat per evaluation

**Anti-Cascade Silent:**
- Composite Signal trigger TRUE → log CDL `[composite_signal_recovery_active]` + apply -20% volume reduction (per §36.49)
- Composite Signal trigger FALSE → no-op silent
- Layer A schema validation precedes Composite (skip dacă invalid recommendation)

**Cross-ref:** §36.41 Composite Signal Layer + §36.48 Per-Set Normalization + §36.49 Dual-Threshold + §36.34 Profile Validation 3/3 simultaneous (same anti-false-positive pattern).

---

## §AMENDMENT 2026-05-08 chat NEW birou — Cross-ref ADR 030 §3 Q-OPEN RESOLVED V1

- **§3.2 Q-OPEN-2 RESOLVED V1 (Layer D ≤50ms enforcement):** sync `Promise.race` timeout V1 in `src/coach/orchestrator/utilities/budget.js` propagates `BUDGET_EXCEEDED` cu `severity: 'soft'` per §3.6 taxonomy (continue-graceful per ADR 025 alignment). V1.5 trigger = AbortController + cancel-aware adapter contract amendment când Faza 3 batch 1 Periodization wiring measures ≥1 engine reproducibly p95 >50ms în synthetic stress test. Anti-Cascade Silent precedent EXT-2 alignment: fail-fast on overrun preserved în taxonomy (other hard error codes `INVALID_INPUT`/`ENGINE_THREW`/`ADAPTER_THREW`/`INVALID_ADAPTER` halt-strict default).
- **§3.6 Q-OPEN-6 RESOLVED V1 (error recovery semantics — D4 amendment additive `severity` field):** Anti-Cascade Silent default `severity: 'hard'` if absent (engine forgets severity field = treated halt-strict, NU silent continue). 'soft' severity codes resolve ADR 025 graceful tension via concrete taxonomy: data degradation continues, contract violations halt. Cascade Defense Layer D ≤50ms budget compliance preserved cu `BUDGET_EXCEEDED` 'soft' override (latency overrun ≠ logic violation, downstream may proceed cu prev tick value).

*Amendment added 2026-05-08 chat NEW birou Run ADR 030 Q-OPEN-1→7 RESOLVED V1 batch.*

---

*EXT-2 added 2026-05-02 CHAT C SELF-CORRECTION EXTENSION ingest.*
