---
title: Spec Data Registry — Single Source of Truth localStorage Keys + Whitelist-Based fullReset
type: entity-spec
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../../../04-architecture/DATA_REGISTRY_SPEC]]"
  - "[[../adrs/adr-001-local-first-storage]]"
  - "[[../adrs/adr-020-storage-tiering-strategy]]"
---

# Spec Data Registry

## Synthesis

**DATA_REGISTRY_SPEC** = single source of truth for all localStorage keys used by Andura. File `src/util/dataRegistry.js` ACTIVE (Task #27, 25 apr 2026). Eliminates registry gap that caused H31c (dynamic keys surviving Full Reset) + provides foundation pentru whitelist-based `fullReset` rewrite. Fixes C11c (reset cache cascade) + H31c (incomplete reset) + H32c (rerun onboarding post-reset).

**Key Categories LOCKED V1:**
- **`USER_DATA_KEYS`** stable training and nutrition data — deleted by `fullReset`, preserved by `resetTestData`. Keys: `weights` + `kcals` + `prots` + `logs` + `readiness` + `phase-override` + `phase-log` + `phase-change-date` + `bf-override` + `pr-records` + `current-kcal` + `suppl-list` + `waters` + `workout-skips` + `session-burns` + `wellbeing` + `notif-enabled` + `closed-days` + `muted` + `onboarding-done` + `onboarding-completed` + `last-recalibration` + `sf.userConfig`.
- **`TEST_RESIDUE_KEYS`** coach/session transient state — deleted by both `resetTestData` and `fullReset`. Keys: `auto-recommendations` + `applied-patterns` + `applied-recommendations` + `early-stops` + ...

**Status LANDED 2026-04-25:** Implementation Task #27 `src/util/dataRegistry.js` LIVE. Whitelist-based fullReset foundation cross-ref ADR 001 local-first-storage + ADR 020 Storage Tiering Strategy Tier 0/1/2.

## Verbatim quotes Daniel

Daniel verbatim H31c root cause rationale Task #27 fix:
> *"H31c dynamic keys surviving Full Reset. Registry gap. Single source of truth localStorage keys eliminates incomplete reset cascade."*

Daniel verbatim USER_DATA_KEYS vs TEST_RESIDUE_KEYS distinction rationale:
> *"USER_DATA_KEYS stable training/nutrition — preserved resetTestData (CDL_KEYS per ADR 011 semantic). TEST_RESIDUE_KEYS coach/session transient — wipe la resetTestData. Whitelist-based separation."*

## Bugatti framing notes

**Gigel test relevance:** Data Registry invisible la user (engineering layer). Surface UI = Settings reset button (full reset vs reset test data choice). Pattern: registry foundation transparent backend.

**Quality > Speed via SSOT registry pattern:** Anti-dynamic-keys-leakage. Pattern: explicit whitelist arrays per category preserves reset semantics across schema evolution.

**Anti-RE considerations:** H31c + C11c + H32c = anti-recurrence cluster "incomplete reset cascade + rerun onboarding post-reset broken state". Pattern: codify keys SSOT pre-implementation prevent future drift.

**Anti-paternalism notes:** Reset operations explicit (full reset vs test data reset distinction) = user agency preserved. User decides scope reset. NU silent auto-cleanup.

**Voice tone notes:** Daniel-ism "registry gap" recurring pattern (vault hygiene discipline cross-domain). Technical vernacular preserved.

## Cross-refs raw layer

- [[../../../04-architecture/DATA_REGISTRY_SPEC]] §Purpose + §Key Categories USER_DATA_KEYS + TEST_RESIDUE_KEYS verbatim
- [[../../../src/util/dataRegistry.js]] V1 LANDED Task #27 2026-04-25
- [[../../../03-decisions/001-local-first-storage]] IndexedDB primary foundation registry SSOT
- [[../../../03-decisions/011-coach-decision-log-architecture]] CDL_KEYS semantic preserved resetTestData
- [[../../../03-decisions/020-storage-tiering-strategy]] Tier 0/1/2 architecture downstream layer
- [[../../../05-findings-tracker/FINDINGS_MASTER]] §H31c + §C11c + §H32c origin findings
- [[../../../tests/e2e/smoke/critical-paths.spec.js]] resetTestData semantic test §52e09f1 applied-patterns preserved

🦫 **Spec Data Registry LANDED Task #27 V1 2026-04-25. Single source of truth localStorage keys SSOT. USER_DATA_KEYS + TEST_RESIDUE_KEYS whitelist categories. Fixes H31c + C11c + H32c reset cascade. Foundation whitelist-based fullReset rewrite + ADR 001 local-first + ADR 020 Storage Tiering.**
