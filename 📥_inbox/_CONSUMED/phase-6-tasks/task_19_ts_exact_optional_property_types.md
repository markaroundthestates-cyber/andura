# task_19 — TS Strict exactOptionalPropertyTypes Flag

**Phase:** 6 (polish pre-Beta)
**Type:** Refactor — TypeScript strict flag enable
**Deps:** task_18 LANDED
**Backup tag:** `pre-phase6-task-19-2026-05-18`
**Est commits:** 1-3 atomic (per-file batches dacă >25 errors)
**Est tests delta:** 0 (type-level)

---

## §1 Scope

Phase 5 task_04 LATEST §4 deferred `exactOptionalPropertyTypes` flag (similar scope ~30-50 errors). Phase 6 enables + fixes granular. Distinguishes `{ foo?: T }` (foo may be missing) vs `{ foo?: T | undefined }` (foo present with value undefined).

## §2 Changes

### A. `tsconfig.json` enable flag

```diff
 "compilerOptions": {
   "strict": true,
   "noImplicitOverride": true,
   "noUncheckedIndexedAccess": true,
+  "exactOptionalPropertyTypes": true,
   ...
 }
```

### B. Run typecheck audit + fix patterns

`exactOptionalPropertyTypes` surfaces patterns:

```tsx
// BEFORE — implicit undefined assignment fails
type Opts = { value?: number };
const opts: Opts = { value: maybeUndefined }; // ERROR — undefined NU assignable

// FIX Pattern 1 — explicit conditional assign
const opts: Opts = maybeUndefined !== undefined ? { value: maybeUndefined } : {};

// FIX Pattern 2 — declare property allow undefined explicit
type Opts = { value?: number | undefined };
const opts: Opts = { value: maybeUndefined }; // OK now

// FIX Pattern 3 — narrow at use site
if (maybeUndefined !== undefined) {
  const opts: Opts = { value: maybeUndefined };
}
```

### C. Pattern decision (Bugatti craft)

Prefer Pattern 1 OR 3 (explicit conditional / narrow) — Pattern 2 (allow undefined explicit type) loosens contract. Apply Pattern 2 doar pentru external API surfaces where caller convenience matters.

### D. Per-file fix batches similar task_18

### E. Tests preserve invariant

```bash
npm test
# Expected: cumulative growth Phase 6 tasks 1-18 preserved
```

## §3 Acceptance criteria

- [ ] `tsconfig.json` flag `exactOptionalPropertyTypes: true` LANDED
- [ ] `tsc --noEmit` → 0 errors final
- [ ] Pattern 1/3 preferred (NU loosen contract via Pattern 2 unless API surface justifies)
- [ ] ZERO test regression
- [ ] ZERO `// @ts-ignore` adăugat

## §4 Tests delta 0 (type-level refactor)

## §5 Commit(s)

```
refactor(ts): enable exactOptionalPropertyTypes strict flag + fix patterns

Enables Phase 5 task_04 final deferred TS strict flag. Fixes ~30-50 errors
granular cu Pattern 1 (explicit conditional assign) + Pattern 3 (narrow at
use site) — preferred Bugatti craft contract strict. Pattern 2 (allow
undefined explicit type) only external API surfaces where caller
convenience justifies.

ZERO test regression. ZERO runtime behavior change. TS strict maximal
preserved invariant pentru Phase 7 Bugatti audit nuclear pre-Launch gate.
```

## §6 Next

task_20 ErrorBoundary Layout root + Suspense lazy code-split.
