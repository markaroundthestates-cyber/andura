# Exercise Metadata Audit — Details (BATCH_05)

**Date:** 2026-05-02
**Scope:** 26 exerciții EXERCISE_METADATA constant
**Audit criteria:** force_demand calibration + tier coherence + muscle target accuracy + equipment_type singular (per ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1)

## Summary

- **Total entries:** 26
- **Changed:** 0 (conservative defaults validated empirically)
- **OK as-is:** 24 entries
- **FLAG (preserve OK conservative, expand post-Beta):** 2 entries (Romanian Deadlift alternatives + Hammer Curl alternatives)

## Changes detail

NU changes applied. All 26 entries pass per criteria audit.

## FLAGS pentru post-Beta backlog

### Entry: Romanian Deadlift
- **Current alternatives:** `['Leg Curl']`
- **Note:** Leg Curl este isolation knee flexion (machine), Romanian Deadlift este compound hip hinge (barbell) — different prime mover (hamstrings via hip extension vs knee flexion).
- **Action:** preserve OK conservative pentru pilot Beta (Leg Curl tier-incompatible per filtering, dar acceptable ca soft signal). Full audit alternatives = post-Beta backlog (consider: Stiff-Leg DB Deadlift, Good Morning, Cable Pull-Through dacă adăugate în library).
- **Severity:** LOW — Tier 1 strict force_demand:'high' filtering în `getValidAlternatives()` automatic ignoră Leg Curl (force_demand:'medium'), so user vede zero alternatives + skip exercise — anti-paternalism preserved.

### Entry: Hammer Curl
- **Current alternatives:** `['Cable Curl']`
- **Note:** Could include Incline DB Curl + Bayesian Curl as legitimate biceps alternatives. Cable Curl primary lookup pentru RO gym cohort.
- **Action:** preserve OK conservative pentru pilot Beta. Expand alternatives post-Beta dacă feedback users observed missing alternatives.
- **Severity:** LOW — alternative count sub-optimal dar functional.

## Verification

- [✅] All 26 entries reviewed
- [✅] Inline AUDIT comments added per entry (26 inline matches verified)
- [✅] No structural breakage (npm test 1203/1203 PASS)
- [✅] Golden Master snapshots stable (no shape change EXERCISE_METADATA)

## Conservative defaults rationale

Pre-Beta strict review = false positives risc. EXERCISE_METADATA shape + values OK pentru pilot Beta cohort 50 users. Real feedback (alternatives users actually want) = better signal than speculative audit expansion. Post-Beta backlog = data-driven adjustments.

## Cross-refs

- ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1 (BATCH_01 cluster 10-batch 2026-05-02)
- VAULT_RULES §BATCH_PROTOCOL (BATCH_02)
- HANDOVER_GLOBAL §36.36 Schema Extension origin
- HANDOVER_GLOBAL §36.66 audit reference
