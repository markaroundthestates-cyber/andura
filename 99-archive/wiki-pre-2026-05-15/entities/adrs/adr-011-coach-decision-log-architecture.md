---
title: ADR 011 — Coach Decision Log (CDL) as Architectural Primitive
type: entity
subtype: adr
status: amended
locked_date: 2026-04-25
authority: 03-decisions/011-coach-decision-log-architecture.md raw layer §Decision (CDL append-only persistent decisions) + §Schema Extension 2026-04-26 (autoAggression + rest_marked) + §AMENDMENT 2026-04-30 (LWW deprecated, T&B mandatory pre-launch) + §AMENDMENT 2026-05-08 (pipeline_event schema cross-ref ADR 030 §3.3)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-009-calibration-tiers]]"
  - "[[adr-006-tier-storage-for-logs]]"
  - "[[adr-004-rule-engine-numeric-priorities]]"
  - "[[adr-013-auto-aggression-detection]]"
  - "[[adr-014-onboarding-profile-typing]]"
  - "[[adr-020-storage-tiering-strategy]]"
  - "[[adr-030-adapter-design-pattern]]"
  - "[[../../concepts/append-only-architecture]]"
amendments:
  - date: 2026-04-26
    note: Schema extension outcome.autoAggression nullable object + outcome.rest_marked nullable 3-state (cross-ref ADR 013 AA detection + ADR 014 onboarding UI prompt flow)
  - date: 2026-04-30
    note: LWW (Last-Write-Wins) deprecated v1.x — Tombstone & Branching pattern MANDATORY pre-launch (per Cognitive Arch §Q9 R22 silent data loss memory paradox 2026-04-28 testing observation). Sprint 3 implementation T&B + 90 zile tombstone retention + UI prompt "varianta A sau B?" + Cloud Function lunar GC
  - date: 2026-05-08
    note: pipeline_event payload schema V1 LOCKED — 1 CDL write per session-tick + subSpans aggregate per-adapter (cross-ref ADR 030 §3.3 Q-OPEN-3 RESOLVED V1 Observability granularity + ADR 030 D4 severity field)
---

# ADR 011 — Coach Decision Log (CDL) Architectural Primitive

## Synthesis

ADR 011 = decision **Coach Decision Log (CDL)** ca first-class architectural primitive — append-only persistent log of every session-level coach decision cu full context snapshot + proposed action + rationale + post-execution outcome. Original LOCK V1 2026-04-25 (schema extended 2026-04-26 + LWW deprecated 2026-04-30 + pipeline_event 2026-05-08). Trigger: gap "decisions NOT persisted" → 5 concrete failures (H30c pattern false positives, no adherence signal, no learning loop, no transparency, no dynamic scheduling foundation). Schema: `id` + `ts` + `date` + `synthetic` flag + `superseded` chain + `context` snapshot (calibrationLevel + readinessScore + fatigueIndex + weakGroups + stagnationWeeks + predictionToday + partial flag) + `proposed` (sessionType + rationale.winnerId stable ID + exercises + proposedSets + volumeMultiplier + notes) + `outcome` populated post-execution (executed + deviation + matchScore Jaccard exerciseOverlap + autoAggression nullable + rest_marked nullable 3-state). Idempotency: one active entry per date, 4h window OR significant context change (readinessScore Δ>20 / weakGroups set / calibrationLevel / isInCut / predictionToday risk flip) triggers supersede chain. Storage: TierStorage 3-tier (Tier 1 = 180d locked responseProfile rolling window OPTIMIZED ADR 009). Firebase sync `users/{uid}/coach-decisions`. Backfill synthetic entries reduced weight 0.5× (Daniel 80+ sessions pre-CDL preserved). Decommission `applied-patterns` gated 30 real entries + zero mismatch + 7-day diff audit. Banner suppression renderIdle.js insufficient CDL real entries. §AMENDMENT 2026-04-30 LWW DEPRECATED → Tombstone & Branching mandatory pre-launch (silent data loss memory paradox 2026-04-28 testing). §AMENDMENT 2026-05-08 pipeline_event V1 schema aggregate orchestrator-level (1 CDL write per session-tick + subSpans per-adapter aggregate cross-ref ADR 030).

## Verbatim quotes Daniel

Daniel articulation seminal PROJECT_VISION foundation phrase (recurring chat strategic 2026-04-25+):

> *"follows the body, not the calendar"*

(Context: PROJECT_VISION core promise mechanism implementation = CDL primitive — coach decisions made daily based on context recovery/fatigue/volume/energy signals NOT fixed weekly grid.)

Daniel verbatim chat strategic 2026-04-25 anti-paternalism pattern false positive frustration H30c:

> *"Marți 88% skip rate. Joi 100%. Tataie e ne-sens. Eu am 3 sesiuni reale total. Halucinezi pattern?"*

(Context: patternLearning calendar-day calibrare false positive trigger ADR 011 design — pattern measurement REQUIRES decisions persistent record, NOT calendar day proxy.)

Daniel verbatim chat strategic 2026-04-30 LWW deprecation push-back (memory paradox 2026-04-28 testing observation):

> *"LWW pe sync = silent data loss. NU vreau coach uită ce a decis. T&B mandatory pre-launch."*

Daniel articulation cross-ref decizii verificabile MOAT_STRATEGY chat strategic universal:

> *"decizii verificabile. Coach reasoning audit-able. NU magie black-box."*

## Bugatti framing notes

**Quality > Speed via persistent reasoning audit trail:** CDL = mechanism implementation "decizii verificabile" MOAT phrase Daniel. Append-only + immutable outcome + supersede chain audit = Bugatti craft preservation no info loss.

**Anti-RE considerations:** Stable rule IDs (`RULES.<RULE_NAME>.id`) exported `src/engine/ruleEngine.js` = contract going forward. Rename requires explicit migration step. Reserved ID `SYNTHETIC_BACKFILL` never assigned real rule.

**Anti-paternalism notes:** "User-facing transparency unlocked" — user pot întreba "why did the coach recommend X yesterday?" answerable directly CDL entry. NU black-box paternalism, transparency real mechanism.

**Voice tone notes:** "Follows the body NOT the calendar" = PROJECT_VISION seminal phrase mechanism = CDL. Preserved verbatim identity Andura.

**Gigel test relevance:** Banner suppression `renderIdle.js` insufficient CDL real entries — user vede ZERO pattern claims fără sufficient data backing. NU "fake confident claims early"  — Maria 65 dignity preserved through honest "still learning" silence.

## Cross-refs raw layer

- [[../../../03-decisions/011-coach-decision-log-architecture]] §Decision (CDL schema) + §Stable Rule IDs + §matchScore gate NOT weighted + §Schema Extension 2026-04-26 + §Storage (TierStorage alignment ADR 006+009) + §AMENDMENT 2026-04-30 LWW deprecated T&B mandatory + §AMENDMENT 2026-05-08 pipeline_event schema
- [[../../../03-decisions/009-calibration-tiers]] §Storage (Tier 1=180d locked responseProfile rolling window OPTIMIZED)
- [[../../../03-decisions/006-tier-storage-for-logs]] §Decision (TierStorage 3-tier pattern reuse)
- [[../../../03-decisions/004-rule-engine-numeric-priorities]] §Decision (RULES const stable IDs contract)
- [[../../../03-decisions/013-auto-aggression-detection]] §AA detection signals (autoAggression CDL outcome field population)
- [[../../../03-decisions/014-onboarding-profile-typing]] §Rest day prompt UI flow (rest_marked CDL outcome field population)
- [[../../../03-decisions/020-storage-tiering-strategy]] §Decision SSOT (Tier 0/1/2 + Dexie.js generalized — CDL Tier 1 alignment)
- [[../../../03-decisions/030-adapter-design-pattern]] §3.3 Q-OPEN-3 RESOLVED V1 Observability granularity (pipeline_event payload schema cross-ref)
- [[../../../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q9 R22 (T&B pattern + zero data loss principle)
- [[../../../05-findings-tracker/FINDINGS_MASTER]] §H30c (pattern false positive trigger CDL design + S1 schema reconciliation)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-25 + §2026-04-26 + §2026-04-30 + §2026-05-08 entries

🦫 **ADR 011 CDL Architectural Primitive LOCK V1 2026-04-25 + Schema Extension 2026-04-26 (autoAggression + rest_marked) + §AMENDMENT 2026-04-30 LWW deprecated T&B mandatory pre-launch + §AMENDMENT 2026-05-08 pipeline_event schema. "Follows the body NOT the calendar" PROJECT_VISION mechanism implementation = decizii verificabile MOAT_STRATEGY audit trail.**
