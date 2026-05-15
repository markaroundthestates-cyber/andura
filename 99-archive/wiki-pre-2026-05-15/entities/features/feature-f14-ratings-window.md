---
title: F14 — Ratings Window EXTEND 20 → 90 Sessions (Tier 0 Active Rolling per ADR 020)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: modify-simplified
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F14"
  - "[[../adrs/adr-020-storage-tiering-strategy]]"
  - "[[../adrs/adr-026-offline-coaching-tree]]"
---

# F14 — Ratings Window EXTEND

## Synthesis

**F14 Session Ratings Persistence** = V1 prod `DB.set('session-ratings', sRatings.slice(0, 20))` rolling window 20 ratings. V1_AUDIT verdict **MODIFY — extend window to 90 sessions cu archive**. 20 ratings = ~3-6 weeks data; Engine adaptation pe 4-12 weeks period (Periodization ADR 026 §1.10) needs longer history. Port cu window 90 + tier-based archive Tier 1/2 per ADR 020 Storage Tiering Strategy §1.4 Tier 0 active rolling.

**BATCH 2 SLICE 0 LANDED commit `041e7f2`** F14 EXTEND applied — `sRatings.slice(0, 20)` → `sRatings.slice(0, 90)` per ADR 020 Tier 0 active rolling 90 sessions (engine adaptation 4-12 weeks Periodization needs ≥90 ratings history). Cross-engine integration: Engine Periodization (ADR 026 §9.1 pipeline §42.10 1st) + Engine PR Wall ([[../engines/engine-pr-wall]] 3 types detection needs ≥90 history) + Engine Auto-Aggression Detection (ADR 013) 5 signals cumulative trigger.

**Tier-based archive downstream V2+ defer:** Tier 1 aggregate post-90 sessions + Tier 2 Firebase archive deep history (per ADR 020 §1.4 Storage Tiering Strategy). V1 scope: rolling 90 active Tier 0 only. V2+ extend cu Tier 1 aggregate + Tier 2 archive deep historical (cross-ref ADR 021 Calibration Drift Reconciliation Version Vector Max-Merge multi-device sync).

## Verbatim quotes Daniel

Daniel verbatim §F14 modify extend rationale 4-12 weeks adaptation period:
> *"20 ratings = ~3-6 weeks data. Engine adaptation pe 4-12 weeks period (Periodization ADR 026 §1.10) needs longer history. Port cu window 90 + tier-based archive Tier 1/2 per ADR 020 Storage Tiering Strategy."*

Daniel verbatim BATCH 2 SLICE 0 F14 EXTEND applied:
> *"F14 EXTEND `sRatings.slice(0, 20)` → `sRatings.slice(0, 90)` per ADR 020 Tier 0 active rolling 90 sessions (engine adaptation 4-12 weeks Periodization needs ≥90 ratings history)."*

## Bugatti framing notes

**Gigel test relevance:** Window 90 sessions invisible la user (engine internal). Pattern: F14 = storage layer change downstream NU UX surface change. Gigel NU vede window 20 vs 90 difference.

**Quality > Speed via match adaptation period:** 90 sessions ~ 12-16 weeks data covers Periodization mesocycle (4 săpt) + macrocycle (12-16 săpt). Pattern: storage window aligned cu engine adaptation period.

**Anti-RE considerations:** ADR 020 §1.4 Tier 0 active rolling 90 sessions invariant preserved + ADR 026 §1.10 Periodization pipeline §42.10 1st cross-ref. Pattern: storage tiering aligned cross-engine.

**Anti-paternalism notes:** Window storage internal — NU paternalism direct. Engine adaptation downstream consumes longer history pentru better recommendations user.

**Voice tone notes:** Daniel-ism "engine adaptation period 4-12 weeks" technical vernacular preserved. Tier-based archive pattern cross-engine.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F14 verdict MODIFY extend 20 → 90 sessions
- [[../../../03-decisions/020-storage-tiering-strategy]] §1.4 Tier 0 active rolling 90 sessions
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 Periodization 1st + §9.1 mesocycle 4 săpt + macrocycle 12-16 săpt
- [[../../../src/pages/coach/rating.js]] (F14 EXTEND applied BATCH 2 SLICE 0 commit `041e7f2` slice(0, 90))
- [[../../../03-decisions/DECISION_LOG]] §2026-05-12 BATCH 2 SLICE 0 F14 EXTEND rationale adaptation period
- [[../../../03-decisions/021-calibration-drift-reconciliation]] (Tier 2 Firebase archive deep history V2+ defer cross-ref)
- [[../engines/engine-pr-wall]] (3 PR types detection needs ≥90 history cross-engine)
- [[../engines/engine-periodization]] (pipeline §42.10 1st Constraint Object input ratings 90 history)

🦫 **F14 Ratings Window EXTEND 20 → 90 sessions per ADR 020 Tier 0 active rolling. Match engine adaptation period 4-12 weeks Periodization. BATCH 2 SLICE 0 commit `041e7f2` applied. Storage layer change downstream invisible UX, engine recommendations better quality.**
