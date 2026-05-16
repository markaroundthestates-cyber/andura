---
title: Spec Tombstone & Branching — Replace LWW Sync + Append-Only Event Log Invariant + 90-Day Retention
type: entity-spec
status: draft
last_updated: 2026-05-12
cross_refs:
  - "[[../../../04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC]]"
  - "[[../adrs/adr-011-coach-decision-log-architecture]]"
  - "[[../adrs/adr-021-calibration-drift-reconciliation]]"
---

# Spec Tombstone & Branching Implementation

## Synthesis

**TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC** = înlocuiește current Last-Write-Wins (LWW) sync logic cu Tombstone & Branching (T&B) pattern care: (1) Preserve all writes (zero data loss principle) + (2) Detect și surface conflicts cu UI prompt (user agency) + (3) Tombstone retention 90 zile (per ADR 011 amendment) + (4) Auto-cleanup Cloud Function lunar + (5) Multi-device safe (phone offline 7 zile + desktop concurrent NO data loss). Date 2026-04-30 Sprint 3 partial scaffold. Cross-ref chat strategic 2026-04-29 lock decision #1 + memory paradox bug HANDOVER §Firebase Sync Re-Pull.

**Component 1 — Append-only event log invariant:** Current state (LWW) `firebase.js` writes overwrite existing values `db.ref(path).set(newValue)` → old data lost. Conflicting writes from 2 devices = last one wins, other lost silent. Target state (T&B): append-only events log + reconciliation algorithm at read-time (NU write-time overwrite).

**Companion ADRs:** [[../adrs/adr-011-coach-decision-log-architecture]] (amendment §Firebase sync LWW deprecated + T&B mandatory pre-launch + 90 zile retention) + [[../adrs/adr-021-calibration-drift-reconciliation]] Version Vector + Max-Merge pattern foundation pentru calibration_state subset specific cu reguli max-merge. T&B = mecanism general (logs + profile + config) + calibration_state = subset specific. Coerență prin Arbitrator central.

## Verbatim quotes Daniel

Daniel verbatim memory paradox bug HANDOVER §Firebase Sync Re-Pull origin rationale:
> *"memory paradox bug — 2 devices phone + PC. LWW = last write wins, other lost silent. T&B = preserve all writes, zero data loss principle."*

Daniel verbatim multi-device 7 zile offline scenario rationale:
> *"Multi-device safe (phone offline 7 zile + desktop concurrent NO data loss). Reconciliation algorithm read-time, NU write-time overwrite."*

Daniel verbatim chat strategic 2026-04-29 lock decision #1 retention rationale:
> *"Tombstone retention 90 zile + auto-cleanup Cloud Function lunar. Cross-ref ADR 011 amendment."*

## Bugatti framing notes

**Gigel test relevance:** T&B invisible la user (backend reconciliation algorithm). Surface UI = conflict prompt rare scenarios cu user agency choice (2 versions present + pick keep). Pattern: complexity hidden behind UI agency choice.

**Quality > Speed via append-only event log invariant:** Anti-data-loss zero-tolerance pattern. Pattern: preserve ALL writes + reconcile at read NU overwrite at write. ADR 011 LWW deprecated invariant preserved.

**Anti-RE considerations:** Memory paradox bug HANDOVER §Firebase Sync Re-Pull = anti-recurrence "device A sync overwrite device B silent data loss". Pattern: T&B mandatory pre-launch per ADR 011 amendment.

**Anti-paternalism notes:** Conflict UI prompt = user agency preserved (NU silent auto-merge engine decision). User chooses which version keeps. Anti-Big-Brother-auto-resolve pattern.

**Voice tone notes:** Daniel-ism "preserve all writes zero data loss principle" recurring pattern (anti-data-loss discipline). "Memory paradox" metaphor preserved.

## Cross-refs raw layer

- [[../../../04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC]] §Goal + §Components Component 1 append-only event log invariant
- [[../../../03-decisions/011-coach-decision-log-architecture]] §AMENDMENT 2026-04-30 LWW deprecated + T&B mandatory pre-launch + 90 zile retention
- [[../../../03-decisions/021-calibration-drift-reconciliation]] Version Vector + Max-Merge calibration_state subset specific cu reguli
- [[../../../03-decisions/018-engine-extensibility-architecture]] §4 Schema Versioning + migration runner pattern
- [[../../../03-decisions/001-local-first-storage]] IndexedDB primary + Firebase backup tier foundational
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §Firebase Sync Re-Pull memory paradox bug origin
- [[../../../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q9 Arbitrator central serialization point

🦫 **Spec Tombstone & Branching DRAFT spec Sprint 3 implementation. Replace LWW + append-only event log invariant + 90-day retention + multi-device safe + conflict UI prompt user agency. Zero data loss principle preserved. Coerență cross-ADR via Arbitrator central.**
