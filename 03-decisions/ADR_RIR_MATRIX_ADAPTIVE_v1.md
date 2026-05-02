# ADR — RIR Matrix Adaptiv v1 (Profile + Exercise Category Aware)

**Status:** **DRAFT — pending Daniel review**
**Date:** 2026-05-02 (SUFLET ANDURA ingest)
**See also:** [[SUFLET_ANDURA]] §3 + HANDOVER_GLOBAL §36.16 + ADR Pattern 14 No-Inference + §29.2.5 Engine Forță + §29.2.6 Longevitate

---

## Context

V1 user verbal feedback layer (Maria 65 + Gigica 35 non-tech) cere "Cât de greu a fost?" → 3 opțiuni [Ușor / Potrivit / Foarte greu], NU RPE/RIR explicit. Engine trebuie să traducă verbal → RIR numeric pentru consumere downstream (progresie, deload trigger, plateau detection).

Traducere globală single-mapping = drift safety. Marius Advanced cu mișcare compusă grea "Foarte greu" = potențial RIR 0 pe 1RM (legitim) vs Maria 65 cu Sit-to-Stand "Foarte greu" = potential RIR 0 pe lift fundamental survival (regression flag, NU progress).

## Decision

Matrix adaptiv per **Profile Type × Exercise Category**.

### Mapping LOCKED V1

| Profil | Tip Exercițiu | Verbal | RIR Numeric | Acțiune Engine |
|--------|---------------|--------|-------------|-----------------|
| Maria 65 (Beginner/Longevitate) | Izolare / Greutate corporală (Sit-to-Stand, Wall Push-ups, Bird-Dog) | Ușor | 6+ | Păstrează greutate, +2 reps next session |
| | | Potrivit | 3-4 | Optimum, menține |
| | | Foarte greu | 0-1 | **Reduce reps (NU sets)**, păstrează min 2 sets |
| Marius 25 (Advanced/Strategic) | Mișcări compuse grele (RDL, Squat, Bench, Trap Bar Deadlift) | Ușor | 4-5 | +2.5 kg next session |
| | | Potrivit | 2-3 | Optimum, +1 kg sau +1 rep |
| | | Foarte greu | 0 (3× consecutive same lift) | **Activează micro-deload** |

### Push-back productive integrate

1. **Marius single RIR 0 ≠ deload immediate.** Doar 3 sesiuni consecutive same exercise → micro-deload. Single RIR 0 e legitim pe 1RM testing day.
2. **Maria "Foarte greu" → reduce reps (NU sets).** Min 2 sets preserve prag stimulare neuro-musculară.

### Profil intermediate (Gigica 35 / Maria 70 / etc.)

V1 fallback: Gigica/Maria 70 routed la Maria 65 matrix conservative-by-default. Marius Beginner (0-10 sesiuni) routed la Maria 65 matrix pe izolare + intermediate-strict pe compound (RIR 5+ Ușor / 3 Potrivit / 1 Foarte greu).

V2 reconsider: matrix dedicat Profile Intermediate dacă user-base demands granularity.

## Consequences

### Positive

- Anti-RE absolut: verbal feedback simplu (Maria 65 friendly) → RIR numeric robust internal.
- Profile-aware: Maria nu primește deload pe Sit-to-Stand "Foarte greu" inappropriately; Marius nu blochează 1RM legitim ca single-set "Foarte greu".
- Bayesian rigidity prevention: 3-consecutive trigger (NU single point) per ADR Pattern 14.

### Negative

- Matrix coverage lacuns pentru exerciții hibride (e.g. Suitcase Carry — core+grip combo). V1 fallback: routed la categoria dominantă (compus dacă Marius, izolare dacă Maria).
- Gigica/Maria 70 fallback la Maria 65 matrix poate fi conservative excesiv pentru Gigica athletic. V2 dedicated matrix.

### Risks

- Push-back Marius single RIR 0 → 3 consecutive trigger: rare but real false negative dacă user 3 sesiuni consecutive heavy 1RM testing same lift = baseline shift WRONGLY triggered. Mitigation: cross-check cu §36.26 outlier confirmed ≠ baseline pattern (1 izolat OK, 3 same exercise low day = real regression — 1RM testing not "low day").

## Test plan (deferred Daniel review)

- Unit tests per cell of matrix (Maria izolare 3 verbal × 3 acțiune + Marius compus 3 × 3)
- Edge case: Maria "Foarte greu" pe set 2 doar (set 1 Ușor, set 3 Potrivit) → engine reduces reps next session OR keep curent session?
- Edge case: Marius RIR 0 sesiunea 1 (clean) + RIR 0 sesiunea 2 (post-night fără somn) + RIR 0 sesiunea 3 → micro-deload (DA) sau cross-check cu sleep proxy (DA dacă proxy disponibil)?
- Profile transition (Maria 65 → Maria 70 anniversary?) — re-routing matrix automat.

## Reconsideration triggers

1. User-base feedback: matrix prea conservative Maria 65 OR prea aggressive Marius 25.
2. Profile transition edge cases (vârstă boundary 65/70/75).
3. Hybrid exercises (Suitcase Carry, Cable Pull-throughs Gigica) — categoria dominantă unclear.

---

*Authored 2026-05-02 SUFLET ANDURA ingest. Status DRAFT — pending Daniel review pre-LOCK.*

---

## §EXTENSION 2026-05-02 SELF-CORRECTION (post Self-Correction handover ingest)

**Cross-ref:** Realtime Per-Set Silent Recalibration (§36.28 + ADR_MODE_DETECTION_UI_v1 §EXT-1) — RIR Matrix verbal feedback (Ușor/Potrivit/Foarte greu) → RIR numeric mapping triggers silent UI update on `kg`/`reps` next set card. Engine NU așteaptă end-of-session pentru re-mapping; per-set feedback drives realtime recalibrare.

**Performance budget:** Layer D invariants ≤ 50ms per "Set terminat" tap.

---

*EXTENSION added 2026-05-02 SELF-CORRECTION ingest.*
