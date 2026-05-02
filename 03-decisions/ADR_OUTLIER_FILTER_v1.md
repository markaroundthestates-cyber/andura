# ADR — Outlier Filter v1 (Profile-Aware + ASK Don't IGNORE)

**Status:** **DRAFT — pending Daniel review**
**Date:** 2026-05-02 (SUFLET ANDURA ingest)
**See also:** [[SUFLET_ANDURA]] §3 + HANDOVER_GLOBAL §36.24 + §36.26 + ADR Pattern 14 No-Inference + §29.2.5 Engine Forță

---

## Context

Sufletul Andura: AI-ul observă deviații semnificative față de istoric → engine NU adaptează silent (NU "ignore"), NU presupune cauză. **ASK don't IGNORE.**

V1 trigger: outlier detection per (Profile × Exercise Category). Pragurile diferă — Maria 65 ±3 reps acceptabil pe Sit-to-Stand, Marius 25 ±4 reps pe Deadlift identical magnitude diferentă semnificație.

## Decision

### Pragurile detection (per §36.24)

| Profil | Categorie | Prag Deviație |
|--------|-----------|---------------|
| Maria 65 | Greutate corporală/Izolare | ±3 reps SAU ±5 kg |
| Marius 25 | Mișcări compuse grele | ±4 reps SAU ±20% greutate |

Profil intermediate (Gigica 35, Maria 70) → fallback la Maria 65 thresholds (conservative-by-default).

### Mecanica UI LOCKED

Outlier detected → prompt confirmation:
> "Sesiunea de astăzi pare diferită față de istoricul tău. Confirmă dacă greutatea și repetările introduse sunt corecte sau corectează-le."
> [Confirm valorile] [Corectez valorile]

### Outlier confirmed treatment (per §36.26)

- **1 sesiune izolată:** noted CDL "low day flag", baseline UNCHANGED. Presupunem zi proastă (somn slab, stres, glicemie). Bayesian rigidity prevention — single data point NU recalibrează priors.
- **3 sesiuni consecutive same exercise low day:** ABIA acum baseline shift downward (regresie reală, anti-supraantrenament).

### Filozofie

- ZERO inference cauză (somn? stres? boală? — engine NU știe).
- ASK user explicit (autonomy preserved + accurate signal).
- Engine adaptează pe efect observat (3 consecutive = signal real), NU presupunere.

## Consequences

### Positive

- Anti-RE: ZERO procentaje user-facing în prompt ("ASK" wording neutral).
- Bayesian rigidity prevention: 1 izolat ≠ baseline shift.
- ADR Pattern 14 No-Inference alignment.
- Profile-aware: Maria + Marius have different signal-to-noise ratios.

### Negative

- 3-consecutive trigger latency: real regression detected after 3 sessions = potential 3 weeks for Marius 1×/săpt frequency on a specific lift. V1 acceptable; V2 reconsider velocity.
- False positive: user attempting NEW PR (legitimate ±20% jump) flagged ca outlier → friction prompt. Mitigation: prompt confirms intent, [Confirm valorile] = explicit user-asserted.

### Risks

- Threshold tuning per (Profil × Categorie) requires real beta data. V1 conservative; V2 calibrate.
- Hybrid exercises (Maria using Cable Pull-throughs which is technically "izolare" but loaded compound-style) — categoria assignment matters. V1 default fallback to dominant category per exercise metadata.

## Test plan (deferred Daniel review)

- Unit per (Profil × Categorie × deviation type): Maria izolare +4 reps = trigger / Maria izolare +2 reps = NO trigger / Marius compus +25% greutate = trigger / Marius compus +15% greutate = NO trigger
- Edge: 1 outlier confirmed → CDL note (DA), baseline next session unchanged (DA)
- Edge: 3 outlier confirmed consecutive same exercise → baseline shift downward (DA), shift magnitude calibrated (per ADR Pattern 14)
- False positive: NEW PR attempt (+25% legitim Marius) → prompt friction, user confirm → CDL note, baseline updated upward (DA)

## Reconsideration triggers

1. Threshold tuning post-beta data (false positive rate).
2. Profile transition edge (Marius → Marius+ Advanced+ category).
3. New exercise category added (e.g., Olympic lifts dacă unlocked V2).
4. V2: outlier velocity > 3-consecutive (acceleration baseline shift dacă degradation rapid).

---

*Authored 2026-05-02 SUFLET ANDURA ingest. Status DRAFT — pending Daniel review pre-LOCK.*
