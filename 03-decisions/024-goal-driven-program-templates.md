# ADR 024 — Goal-Driven Program Templates

**Status:** 🟡 **STUB / PENDING SPEC** (file create per Vault Hygiene Sprint Faza 3, 2026-05-04 — full spec deferred to dedicated chat strategic NEW post Auth Flow §36.80)
**Date:** 2026-05-04 (stub creation per §36.95 ADR Numbering Additive + §36.96 G + §36.100 Engine #2)
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.95 (ADR Numbering Additive split) + §36.100 Engine #2 (Goal Adaptation Engine roadmap) + §26 (Goal-ca-setting + 8 templates V1) + §36.35 (Goal Shift Event Handler) + §36.92 D4 (Goal Taxonomy hybrid C LOCKED) + [[022-bayesian-nutrition-inference]] (cross-engine integration)

---

## ⚠️ STATUS — STUB

**Provenance:** Per §36.95 ADR Numbering Additive split — ORPHAN-1 finding HIGH (ADR 022 referenced 9+ ori cu naming collision Bayesian Nutrition + Goal-Driven Templates) rezolvat prin SPLIT: ADR 022 = Bayesian Nutrition ([[022-bayesian-nutrition-inference]]) + ADR 024 = Goal-Driven Templates (acest file).

**Acest stub = placeholder pentru spec full PENDING.** Goal-Driven Templates spec parțial existing în HANDOVER §26 (8 templates V1 LOCKED 2026-05-01 evening) — acest ADR va consolida + formaliza spec complet (estimate ~2-4h chat strategic + ~150-250h CC autonomous per §36.100 Engine #2).

---

## Scope summary (stub level)

**Decision domain:** Goal Adaptation Engine — differential logic Cut / Bulk / Maintenance / Recomp aplicat la 5 (sau 8) program templates V1 cu modifiers per goal × experience × frequency × age.

**5 templates V1 LOCKED (per §26):**
1. **Forță & Dezvoltare** (compound focus, RIR 1-3, rep 3-8, rest 2-4min)
2. **Tonifiere & Definire** (hibrid hipertrofie + cut emphasis, RIR 0-2, rep 8-12)
3. **Slăbire** (cut-focused, RIR 1-2, rep 10-15, conditioning add-on)
4. **Longevitate** (mobility + sustainable load, RIR 2-3, rep 8-12, recovery emphasis)
5. **Sănătate Generală** (balanced cu intensity controlled, RIR 2-3, rep 8-12, lifestyle integration)

**Goal Shift Event Handler (§36.35) integration:** user tap "Schimbă obiectiv" → Engine aplică Modificatori Template (rep ranges, RIR, rest time) + Streak Reset + 2-session calibration window (interval estimat NU single point per SUFLET F1 Triangulation).

**Phase sub-state (NU template change):** GOAL = setting strategic user (5 template choice) / PHASE = automated CUT/BULK/MAINTAIN sub-state (sys.js calculează BF% + sezon) / MODE = Estetică ↔ Forță sub-modificator.

---

## Open Questions (PENDING chat strategic NEW)

1. **5 vs 8 templates:** §26 menționează "8 templates V1 LOCKED" dar enumerare clar = 5 (Forță / Tonifiere / Slăbire / Longevitate / Sănătate Generală). Verifică în chat NEW dacă există 3 sub-templates ascunse (e.g., Hibrid Estetică-Forță separate)?
2. **Template variant matrix:** fiecare template × Experience tier (Beginner/Intermediate/Advanced) × Frequency (2-3-4-5x/săpt) × Age bracket (18-35/35-55/55+) = 5 × 3 × 4 × 3 = 180 combinații — toate generate algorithmic sau picked from curated subset?
3. **Cross-engine integration:** Goal Adaptation Engine ↔ Bayesian Nutrition Engine ([[022-bayesian-nutrition-inference]]) ↔ Periodization Engine (§36.100 Engine #1) ↔ Specialization Engine (§36.100 Engine #7)?
4. **Cut-Bulk-Maintain phase transitions:** auto-detect via BF% + weight delta + sezon + adherence, sau user manual override? §36.102 confirmed lifecycle change first-class supported.
5. **Recomp scope:** RECOMP = simultaneous cut+gain (newbie effect / detrained / fat-rich) — sub-state per goal sau separate template? Prevalence in Maria/Gigica/Marius personas?
6. **Goal Shift conservare date:** PR records + CDL logs + istoric forță = INTACT post-shift confirmed §36.35. Cum e re-evaluat tier-ul calibration post-shift?
7. **5-template aspect mapping vs SUFLET F2 ("AI-ul informează nu impune"):** push-back proporțional cu risc — ce face engine-ul când user picks "Forță" dar BF% high + age 60+ + recent injury?
8. **Re-prompt periodic (§26.5):** modal in-app "Obiectivul tău e încă X?" — frequency optim 4-6 săpt confirmed; cooldown 21 zile post-confirm. Anti-spam logic detail?

---

## Cross-references

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §26 (Goal-ca-setting + 8 templates LOCKED 2026-05-01 evening) + §26.5 (Re-prompt 4-6 săpt) + §36.35 (Goal Shift Event Handler V1) + §36.92 D4 (Goal Taxonomy hybrid C) + §36.95 (ADR Numbering Additive split) + §36.100 Engine #2 + §36.102 (Goal lifecycle first-class)
- [[022-bayesian-nutrition-inference]] (cross-engine integration — kcal differential per goal phase)
- [[018-engine-extensibility-architecture]] (Dimension Registry — Goal Adaptation Engine = new dimension)
- [[017-demographic-prior-database]] (anchor personas Maria/Gigica/Marius for template-persona fit testing)
- [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]] (templates as core product features)
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] (PROJECTION voice + ARBITRATOR consume goal-template signals)
- ADR_OUTLIER_FILTER_v1.md §EXT-2 Goal Shift extension

---

🦫 **Stub created Faza 3. Full spec PENDING dedicated chat strategic post Vault Hygiene + Auth Flow §36.80. ZERO fabrication, zero scope creep. Placeholder honors §36.95 ADR Numbering Additive + ORPHAN-1 resolution + §36.100 Engine #2 Goal Adaptation Engine roadmap.**
