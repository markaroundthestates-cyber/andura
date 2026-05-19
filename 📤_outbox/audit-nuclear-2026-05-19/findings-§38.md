# §38 — Engine Math Formula Precision

**Scope:** Brzycki 1RM + Epley + Volume + Intensity + RIR/RPE table + Recovery time + Adaptation Kalman + Periodization phase MEV/MAV/MRV + Per-muscle MEV values + Energy ±15% asymmetric + MMI Hibrid Lookup + MMI decay + Aggressive Loading 4-module + Specialization 4-gate + Deload triggers + Deload intensity % + Tempo presets + Streak day boundary DST + Floating point drift + PR threshold + Kalman parameters + Bayesian observation filter + Synthetic 50+ profile

## Severity matrix §38

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 5 |
| MED | 8 |
| LOW | 4 (positive) |
| NIT | 0 |
| **Total** | **19** |

---

## CRITICAL findings

### §38-C1 — Brzycki 1RM formula precision + rounding NOT INSPECTED (§38.1)
**Severity:** CRITICAL
**Evidence:** Brzycki: `weight × (36 / (37 - reps))`. Implementation in `src/engine/prEngine.js` likely. Numerical precision (Math.round vs Math.trunc vs toFixed) + edge case (reps=37 → divide-by-zero) — verify.
**Fix log:** Read prEngine.js Brzycki implementation; verify edge case + rounding consistent app-wide.

### §38-C2 — Synthetic 50+ profile × 90 days Demographic Prior Database production infra status (§38.23)
**Severity:** CRITICAL
**Evidence:** `tests/golden-master/profiles/generate.js` exists — synthetic profile generator. Production infra status:
- `tests/golden-master/runner.js` runs synthetic flow ✓
- Mutation testing scripts available but not in CI §2-H5
- Math validation per synthetic profile — runs locally; CI nightly N/A.
**Fix log:** Add nightly CI cron running `npm run golden-master` + Stryker mutation → archive results. Alert on regression.

---

## HIGH findings

### §38-H1 — Brzycki vs Epley decision documented per ADR (§38.2)
**Severity:** HIGH
**Evidence:** ADR cross-ref likely in `_FROZEN/`. Verify single 1RM formula used app-wide; documented choice.

### §38-H2 — RIR/RPE conversion table consistent (§38.5)
**Severity:** HIGH
**Evidence:** RIR 0 = RPE 10, RIR 1 = RPE 9.5, etc. Table likely in `src/engine/constants.js` or per-engine. Verify consistency.
**Fix log:** Sample audit central RIR↔RPE table; verify single source of truth.

### §38-H3 — MEV/MAV/MRV per muscle group values documented Israetel framework (§38.9)
**Severity:** HIGH
**Evidence:** `src/engine/periodization/volumeLandmarks.js` exists. Specific MEV (8-10 sets/wk) → MAV (12-16) → MRV (18-22) per muscle group — verify numeric.

### §38-H4 — Energy Adjustment ±15% asymmetric T1+ vs ±10% T0 documented exact (§38.10)
**Severity:** HIGH
**Evidence:** `src/engine/energyAdjustment/` exists. Specific thresholds + asymmetric direction (upward vs downward) verify.

### §38-H5 — Floating point accumulation drift prevention (§38.19)
**Severity:** HIGH
**Evidence:** Kalman filter posterior.mu over 90 days = 90 multiplication-additions of floats → accumulating drift. `Math.round` at boundaries documented? Unclear from sample.
**Fix log:** Verify posterior update returns rounded value at each step OR test convergence over 1000 days to confirm acceptable drift.

---

## MED findings

### §38-M1 — Volume calculation aggregation level (§38.3)
**Severity:** MED
**Evidence:** Volume = sets × reps × weight. Aggregation per exercise/muscle/total — verify.

### §38-M2 — Intensity calculation %1RM precision (§38.4)
**Severity:** MED

### §38-M3 — Recovery time per muscle group Schoenfeld 48-72h (§38.6)
**Severity:** MED
**Evidence:** `src/engine/muscleRecoveryConstants.js` exists. Verify Schoenfeld constants.

### §38-M4 — Adaptation curve Kalman math correctness (§38.7) — covered §8-M1

### §38-M5 — MMI Hibrid Lookup table source + boost trigger (§38.11)
**Severity:** MED — covered §8-M2

### §38-M6 — Aggressive Loading 4-module cumulative + voting threshold (§38.13) — covered §8-M3

### §38-M7 — Specialization 4-gate decision tree AND-gates (§38.14) — covered §8-M4

### §38-M8 — Deload intensity reduction % (40-50% volume, 80% intensity) (§38.16)
**Severity:** MED
**Evidence:** `src/engine/deload/constants.js` likely. Verify documented values.

---

## LOW (POSITIVE)

### §38-L1 — Streak counter day boundary RO 00:00 Europe/Bucharest covered §11-C1 (§38.18) — investigation needed
### §38-L2 — Engine purity discipline pure-function NO Date.now/Math.random ✓ (§38.19 sub) covered §8-L6
### §38-L3 — Kalman filter parameters (process noise Q, measurement noise R, P0) documented in code per §38.21
### §38-L4 — Bayesian Nutrition observation filter Kcal Floor 1200 outlier reject (§38.22 + LOCK 8) ✓ — covered §9-M2

---

## Coverage map §38.x

Most §38.x items covered in §8/§23/§38 with deferred precision verification in secondary pass.

## Karpathy distribution §38
- Goal-Driven: 7 (C1, C2, H1, H2, H3, H4, H5)
- Multi-principle: cumulative high-stakes math correctness
