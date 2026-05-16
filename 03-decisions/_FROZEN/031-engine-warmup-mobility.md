# ADR 031 — Engine Warm-up & Mobility

**Status:** 🔵 **SPEC REFERENCE** (canonical SSOT în [[026-offline-coaching-decision-tree-exhaustive]] §9.7 — NU duplicate spec aici, redirect-only)
**Date:** 2026-05-06 evening chat-8 acasă (post pipeline §42.10 V1 closure 8/8 — vault hygiene cleanup batch)
**Pipeline §42.10 position:** **7th** (penultimate prescriptive engine pre-Deload)
**Implementation:** `src/engine/warmup/` V1 LANDED commit `20999fb` (Faza 2.5 batch 7)
**See also:** [[026-offline-coaching-decision-tree-exhaustive#§9.7 Engine Warm-up Module-Level Spec V1|ADR 026 §9.7]] (canonical 21 decisions Cluster A-E verbatim) + [[../06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening|HANDOVER_ENGINES_SPEC]] §45.6 (Source 2 spec session) + `131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md` BATCH 4 §65.1-§65.4 (Source 1 Override Q1 + Q4)

---

## ⚪ STATUS — SPEC REFERENCE (redirect-only)

This ADR is a **SPEC REFERENCE** placeholder. The canonical specification lives în [[026-offline-coaching-decision-tree-exhaustive]] §9.7 (commit `c15ad0f` 2026-05-06 evening chat-7 acasă, +190 LOC, 21 decisions Cluster A-E verbatim, 2-way parity ✅ Source 1 BATCH 4 §65.1-§65.4 + Source 2 §45.6, reconciled override Cluster C3 — Source 1 §65.4 OVERRIDE Q4 supersedes Source 2 §45.6 Q-Cooldown defer per Daniel's later decision authority pattern).

**Reverse pattern note (vs ADR 027/028/029 stub flip precedent):** Acest ADR a fost **created direct cu SPEC REFERENCE** în vault hygiene cleanup batch post-pipeline §42.10 V1 closure (NU intermediate STUB stage — `032` Deload mirror precedent). Per §36.95 ADR Numbering Additive convention, next number post-`030-adapter-design-pattern.md`.

---

## Redirect

> **For canonical decisions, Cluster A-E breakdown, sources, parity check evidence, and Reconsideration Triggers, see [[026-offline-coaching-decision-tree-exhaustive#§9.7 Engine Warm-up Module-Level Spec V1|ADR 026 §9.7]].**

---

## Scope summary (1-line)

Engine Warm-up & Mobility — adaptive warm-up routine 5-10 min Hybrid 1-2 general dynamic + 2-3 specific muscle group prep, persona-aware thresholds (Maria 5-10 mobility flow / Gigica 5-7 dynamic + ramp / Marius 8-10 ramp protocol 50-70-90%), Instant Skip principle T0 default (ramp-up integrated first exercise, ZERO ecran suplimentar) + T1+ opt-in expanded routine, optional 2 min stretch text-only cooldown post-session (Source 1 §65.4 OVERRIDE Q4 reconciled). Pipeline §42.10 7th canonical penultimate prescriptive engine pre-Deload.

---

## Cross-refs

- [[026-offline-coaching-decision-tree-exhaustive#§9.7 Engine Warm-up Module-Level Spec V1|ADR 026 §9.7]] — canonical SSOT (21 decisions Cluster A-E)
- [[018-engine-extensibility-architecture]] §2 Standardized Dimension Contract (`evaluate(ctx) → WarmupResult`)
- [[017-demographic-prior-database]] persona resolution Maria/Gigica/Marius (Cluster B3 thresholds)
- [[025-andura-gandeste-pentru-user]] graceful degradation (Cluster B4 skip buton vizibil session 1 anti-paternalism)
- [[009-calibration-tiers]] §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" (Cluster E1 tier-aware T0/T1+ Instant Skip + reference-only metadata)
- [[030-adapter-design-pattern]] D1-D5 LOCKED V1 foundation Hexagonal (Phase 1-2 orchestrator foundation `src/coach/orchestrator/` commit `5a16550`)
- [[ADR_PAIN_DISCOMFORT_BUTTON_v1]] Pain-Aware integration §9.4.6 Convergence Guard Clean Signal rule preserved (Engine Warm-up NU proactive trigger)

---

**Implementation reference:** `src/engine/warmup/` V1 LANDED commit `20999fb` (Faza 2.5 batch 7, 8 source modules + 5 test files, 2478 LOC, +107 tests 2382→2489 PASS, ZERO src bugs first-pass cleanest precedent §9.6 Specialization commit `4cf50ab` honored).
