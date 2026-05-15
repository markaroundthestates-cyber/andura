---
title: ADR Outlier Filter v1 (Profile-Aware + ASK Don't IGNORE)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_OUTLIER_FILTER_v1.md LOCKED V1 Chat D ADR Review Process §36.56 + 1 amendment aplicat §36.57
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-017-demographic-prior-database]]"
  - "[[adr-024-goal-driven-program-templates]]"
  - "[[adr-rir-matrix-adaptive]]"
  - "[[../concepts/anti-recurrence-rules]]"
amendments:
  - date: 2026-05-04
    note: §EXT-1 Streak Counter Same Direction (§36.30) + §EXT-2 Goal Shift Event Handler Streak Reset + Conversion Interval (§36.35) — Q6 D Hybrid foundation ADR 024
---

# ADR Outlier Filter v1

## Synthesis

ADR_OUTLIER_FILTER = Profile-Aware outlier detection cu **ASK don't IGNORE** principle. Sufletul Andura: AI-ul observă deviații semnificative față de istoric → engine NU adaptează silent (NU "ignore"), NU presupune cauză. V1 trigger: outlier detection per (Profile × Exercise Category). Pragurile diferă — Maria 65 ±3 reps acceptabil pe Sit-to-Stand vs Marius 25 ±4 reps pe Deadlift identical magnitude diferentă semnificație.

**Pragurile detection §36.24:**
| Profil | Categorie | Prag Deviație |
|--------|-----------|---------------|
| Maria 65 | Greutate corporală/Izolare | ±3 reps SAU ±5 kg |
| Marius 25 | Mișcări compuse grele | ±4 reps SAU ±20% greutate |

Profil intermediate (Gigica 35, Maria 70) → fallback la Maria 65 thresholds (conservative-by-default).

**Mecanica UI LOCKED:** Outlier detected → prompt confirmation *"Sesiunea de astăzi pare diferită față de istoricul tău. Confirmă dacă greutatea și repetările introduse sunt corecte sau corectează-le."* [Confirm valorile] [Corectez valorile]. **Outlier confirmed treatment §36.26:** 1 sesiune izolată = noted CDL "low day flag", baseline UNCHANGED (Bayesian rigidity prevention — single data point NU recalibrează priors). 3 sesiuni consecutive same exercise low day = ABIA acum baseline shift downward (regresie reală, anti-supraantrenament).

**§EXT-1 Streak Counter Same Direction (§36.30) + §EXT-2 Goal Shift Event Handler (§36.35) AMENDMENT 2026-05-04** = foundation ADR 024 Q6 D Hybrid Goal Shift 2-session calibration window + streak RESET. Pattern: streak counter "context fizic schimbat = signal nou independent".

## Verbatim quotes Daniel

Daniel verbatim wording UI Outlier prompt LOCKED 2026-05-02 SUFLET ingest:
> *"Sesiunea de astăzi pare diferită față de istoricul tău. Confirmă dacă greutatea și repetările introduse sunt corecte sau corectează-le."*

Daniel verbatim ASK don't IGNORE filozofie:
> *"ZERO inference cauză (somn? stres? boală? — engine NU știe). ASK user explicit (autonomy preserved + accurate signal). Engine adaptează pe efect observat (3 consecutive = signal real), NU presupunere."*

Daniel verbatim Bayesian rigidity prevention rationale:
> *"1 sesiune izolată ≠ baseline shift. 3 sesiuni consecutive same exercise low day = abia acum baseline shift downward. Bayesian rigidity prevention — single data point NU recalibrează priors."*

## Bugatti framing notes

**Gigel test relevance:** Wording neutru *"Sesiunea de astăzi pare diferită"* = anti-paternalism, NU "you screwed up". User confirms OR corrects — autonomy preserved.

**Quality > Speed via Profile × Exercise Category matrix:** Maria 65 ±3 reps Sit-to-Stand vs Marius 25 ±4 reps Deadlift = NU same threshold cross-persona/exercise-category. Anti-one-size-fits-all preserved.

**Anti-RE considerations:** §EXT-1 Streak Counter Same Direction §EXT-2 Goal Shift Event Handler = anti-recurrence pattern "1 sesiune up + 1 down + 1 up = yo-yo flag". Pattern: detection require >=3 sesiuni signal consistency. ADR 024 Q6 D Hybrid foundation explicit.

**Anti-paternalism notes:** ASK don't IGNORE = engine respects user signal accuracy. ZERO inference cauză (somn/stres/boală) = anti-paternalism core principle. User decides reality, engine info-only.

**Voice tone notes:** Daniel-ism "ASK don't IGNORE" recurring pattern (ADR Pattern 14 No-Inference alignment). Bayesian rigidity prevention = specific terminology preserved verbatim.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_OUTLIER_FILTER_v1]] §Decision pragurile + §EXT-1 + §EXT-2 verbatim
- [[../../../01-vision/SUFLET_ANDURA]] §3 outlier ASK don't IGNORE source
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.24 (origin) + §36.26 treatment + §36.30 §EXT-1 + §36.35 §EXT-2
- [[../../../03-decisions/017-demographic-prior-database]] anchor personas Maria 65 / Marius 25 thresholds source
- [[../../../03-decisions/024-goal-driven-program-templates]] Q6 D Hybrid 2-session calibration + streak RESET §EXT-2 foundation
- [[../../../03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1]] §29.2.5 Engine Forță cross-ref ADR Pattern 14 No-Inference

🦫 **ADR Outlier Filter LOCKED V1 2026-05-02. Profile-Aware (Maria 65 / Marius 25 / Gigica intermediate fallback) + ASK don't IGNORE. 1 izolat ≠ baseline shift, 3 consecutive = regresie reală. §EXT-1 + §EXT-2 amendment 2026-05-04 foundation ADR 024 Q6.**
