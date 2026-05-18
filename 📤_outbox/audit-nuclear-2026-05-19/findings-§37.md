# §37 — Engineering Code Standards + Naming Conventions + Patterns

**Scope:** Variable/function/file/component naming + File organization + Component composition + Prop drilling vs Context vs Zustand + Hook conventions + Async patterns + Error propagation + Logging + Comments + Constants + Type location + Test file co-location + Folder structure + Barrel exports + Circular dep prev + Magic strings + Boolean naming

## Severity matrix §37

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 |
| MED | 4 |
| LOW | 6 (positive) |
| NIT | 2 |
| **Total** | **14** |

---

## HIGH findings

### §37-H1 — File naming inconsistency: kebab-case adapters (e.g., `coachDirectorAggregate.ts`) vs PascalCase components (e.g., `CoachDirector.tsx`) — convention documented?
**Severity:** HIGH (§37.3 + §37.4)
**Evidence:** React components PascalCase ✓ (`Antrenor.tsx`, `BottomNav.tsx`). Library helpers camelCase ✓ (`engineWrappers.ts`, `coachDirectorAggregate.ts`). Engine .js files camelCase (`coachDirector.js`, `acceleratedLearning.js`). Folders kebab-case OR not (`pain-button/` vs `painButton.js`). Inconsistency.
**Fix log:** Document convention in `08-workflows/code-standards.md`: components PascalCase, helpers/engines camelCase, folders kebab-case for new files; existing kept for now.

### §37-H2 — ESLint absent (§1-C4 reaffirmed) blocks enforcement of standards
**Severity:** HIGH
**Resolution:** Per §1-C4.

---

## MED findings

### §37-M1 — Prop drilling vs Context vs Zustand decisions documented (§37.7)
**Severity:** MED
**Evidence:** Zustand used app-wide (7 stores). No React Context (good for perf). Prop drilling minimal (sample Onboarding passes value/onChange 1-level). Pattern consistent.

### §37-M2 — Hook conventions use* prefix single responsibility (§37.8)
**Severity:** MED — POSITIVE
**Evidence:** Zustand `useWorkoutStore`, `useCoachStore`, `useAppStore` etc ✓.

### §37-M3 — Async patterns async/await preferred ✓ (§37.9)
**Severity:** MED — POSITIVE
**Evidence:** Sample code uses async/await consistently. Few `.then()` only in dynamic imports.

### §37-M4 — Magic strings centralized constants (§37.19)
**Severity:** MED
**Evidence:** Constants per-file (e.g., `FOURTEEN_DAYS_MS`, `KCAL_FLOOR_DAILY_MIN`, `BASELINE_NUTRITION`). Storage keys centralized in `auth.js AUTH_STORAGE_KEYS` ✓.

---

## LOW (POSITIVE)

### §37-L1 — Naming conventions camelCase variables ✓ (§37.1)
### §37-L2 — Verb-noun function naming pattern ✓ (`getCoachToday`, `setField`, `handleSend`) (§37.2)
### §37-L3 — Test file co-location `Component.test.tsx` paired with component ✓ (§37.15)
### §37-L4 — Folder structure src/ logical (engine/coach/react/util) ✓ (§37.16)
### §37-L5 — Index barrel exports intentional (orchestrator/adapters/index.js) ✓ (§37.17)
### §37-L6 — Boolean naming positive form `isAuthenticated`, `hasError`, `editMode` ✓ (§37.20)

---

## NIT findings

### §37-N1 — Comment conventions TSDoc/JSDoc/inline use cases mixed — acceptable variance
**Resolution:** OK.

### §37-N2 — Type definitions co-located with components ✓ ad-hoc inline interfaces — pattern consistent
**Resolution:** OK.

## Karpathy distribution §37
- Goal-Driven: 1 (H1)
- Surgical Changes: 1 (H2)
- 6 LOW positive — patterns adopted across codebase consistent
