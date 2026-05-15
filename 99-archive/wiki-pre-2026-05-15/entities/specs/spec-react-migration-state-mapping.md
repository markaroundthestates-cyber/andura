---
title: Spec React Migration State Mapping V1 — Step 2 state.js → Context+useReducer Mecanic Mapping Post Step 1
type: entity-spec
status: locked-v1
last_updated: 2026-05-12
cross_refs:
  - "[[../../../04-architecture/REACT_MIGRATION_STATE_MAPPING_V1]]"
  - "[[../adrs/adr-005-vanilla-js]]"
  - "[[spec-port-first-step-1]]"
---

# Spec React Migration State Mapping V1

## Synthesis

**REACT_MIGRATION_STATE_MAPPING_V1** = Status ACTIVE_SSOT Step 2 reference (canonical migration mapping pre-Step-2-implementation; Step 1 vanilla port prerequisite per Port-First-Then-React paradigm 2026-05-10 LOCK V1). **§AMENDMENT 2026-05-10 SUPERSEDE** — doc rămâne canonical SSOT pentru Step 2 React migration mecanic mapping (post Step 1 vanilla port mockup V2 → prod `src/` complete). Step 2 execution PENDING Step 1 LANDED + Daniel Gates smoke validation → merge `feature/v2-vanilla-port` → main. State mapping spec body preserved compatible Step 2 — `state.js` → Context+useReducer mecanic mapping unchanged.

**Authority:** Daniel chat-NEW3 birou 2026-05-07 direction LOCK + chat-current ACASĂ 2026-05-08 tactical scope LOCK Co-CTO scope. Cumulative LOCKED V1 ~689 → ~690 (+1 net mapping doc canonical).

**§1 — Current state inventory vanilla JS baseline:** §1.1 Global session state `src/state.js` — Shape (24 fields, single mutable obj ES module export — verified filesystem 2026-05-08). Pre-Step-1 → 31 fields post Step 1 cu router enums NEW BATCH 2 (state.currentScreen 8 enum values + state.cevaNuMergeReason fan-out routing field). Step 2 mecanic mapping: `state.js` mutable obj → React Context + useReducer pattern + immutable state updates + dispatch actions.

## Verbatim quotes Daniel

Daniel verbatim §AMENDMENT 2026-05-10 REVERT SUPERSEDE Port-First-Then-React paradigm rationale:
> *"REVERT SUPERSEDE 2026-05-08 — Step 2 React migration mecanic mapping (post Step 1 vanilla port complete). Step 2 execution PENDING Step 1 LANDED + Daniel Gates smoke validation."*

Daniel verbatim Daniel Gates pre-Beta review trigger:
> *"O sa fac review inainte de launch beta a-z. Merge feature/v2-vanilla-port → main post Daniel Gates smoke validation Step 1 LANDED."*

Daniel verbatim state.js → Context+useReducer mecanic mapping unchanged invariant:
> *"State mapping spec body preserved compatible Step 2 — state.js → Context+useReducer mecanic mapping unchanged. Mecanic NU strategic — direct translation pattern preserved cross-paradigm."*

## Bugatti framing notes

**Gigel test relevance:** React Migration invisible la user (engineering paradigm Step 2). Surface UI = identical post-migration (mecanic state mapping NU UX redesign). User NU vede React vs Vanilla difference functional.

**Quality > Speed via mecanic mapping NU re-design:** Step 2 = direct translation pattern (state.js single obj → Context+useReducer) preserves Step 1 invariant. Anti-scope-creep "while migrating, let's also redesign component tree".

**Anti-RE considerations:** §AMENDMENT 2026-05-10 SUPERSEDE Port-First-Then-React paradigm = anti-recurrence "React-first then port mockup". Pattern: Port-First (vanilla mockup port mecanic) → React migration mecanic mapping post-validation. Ordering invariant preserved.

**Anti-paternalism notes:** Daniel Gates smoke validation trigger = manual gate user agency preserved. NU forced auto-merge `feature/v2-vanilla-port` → main without review. CEO autonomy lock EXTINS pre-Beta review preserved.

**Voice tone notes:** Daniel-ism "mecanic mapping unchanged" recurring pattern (paradigm preservation cross-amendment discipline). Anti-scope-creep migration discipline.

## Cross-refs raw layer

- [[../../../04-architecture/REACT_MIGRATION_STATE_MAPPING_V1]] §AMENDMENT 2026-05-10 + §1 Current state inventory
- [[../../../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-08 foundation lock + §AMENDMENT 2026-05-10 REVERT SUPERSEDE
- [[../../../04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] Step 1 paradigm LOCKED 2026-05-10 prerequisite
- [[../../../03-decisions/030-adapter-design-pattern]] D2 orchestrator preserved compatible
- [[../../../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract pure functions cross-paradigm preserved
- [[../../../04-architecture/mockups/andura-clasic.html]] + [[../../../04-architecture/mockups/andura-living-body.html]] design tokens canonical SSOT
- [[../../../04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT]] root nav 4 tabs LOCKED final
- [[spec-port-first-step-1]] (Cluster D sibling spec Step 1 paradigm)

🦫 **Spec React Migration State Mapping V1 ACTIVE_SSOT Step 2 reference. §AMENDMENT 2026-05-10 SUPERSEDE Port-First-Then-React paradigm. Step 2 PENDING Step 1 LANDED + Daniel Gates smoke validation. state.js → Context+useReducer mecanic mapping unchanged invariant preserved.**
