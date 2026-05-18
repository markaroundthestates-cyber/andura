# task_18 — TS Strict noUncheckedIndexedAccess Flag

**Phase:** 6 (polish pre-Beta)
**Type:** Refactor — TypeScript strict flag enable cu fix granular per-file
**Deps:** task_17 LANDED
**Backup tag:** `pre-phase6-task-18-2026-05-18`
**Est commits:** 1-3 atomic (per-file batches dacă >25 errors)
**Est tests delta:** 0 (refactor type-level)

---

## §1 Scope

Phase 5 task_04 LATEST §4 deferred `noUncheckedIndexedAccess` flag (surfaces ~50 errors). Phase 6 enables flag + fixes granular per-file. Pattern Phase 4 task_24+ precedent batch fix.

## §2 Changes

### A. `tsconfig.json` enable flag

```diff
 "compilerOptions": {
   "strict": true,
   "noImplicitOverride": true,
+  "noUncheckedIndexedAccess": true,
   ...
 }
```

### B. Run typecheck audit

```bash
npm run typecheck 2>&1 | grep -E "error TS" | wc -l
# Expected: ~50 errors (Phase 5 task_04 estimate)
npm run typecheck 2>&1 | grep -E "error TS" | head -50
```

### C. Fix patterns per error

`noUncheckedIndexedAccess` surfaces `T[number] | undefined` în array access. Fix patterns:

```tsx
// Pattern 1 — narrow cu length check
if (items.length > 0) {
  const first = items[0];
  if (first !== undefined) { /* use first */ }
}

// Pattern 2 — destructure cu default
const [first = defaultValue, ...rest] = items;

// Pattern 3 — optional chain + nullish coalesce
const value = items[i] ?? fallback;

// Pattern 4 — assertion non-null where invariant guaranteed (sparing)
const item = items[i]!; // doar când loop guaranteed bounded
```

### D. Per-file fix batches (if >25 errors)

Daca >25 errors total, split în 2-3 commits atomic:
- batch 1: `src/react/lib/*` (low-risk pure helpers)
- batch 2: `src/react/components/*` (UI consumers)
- batch 3: `src/react/screens/*` + `src/react/stores/*`

### E. Tests preserve invariant

```bash
npm test
# Expected: 4303 → 4303+ PASS (NU regression cumulative through Phase 6 tasks 1-17)
```

## §3 Acceptance criteria

- [ ] `tsconfig.json` flag `noUncheckedIndexedAccess: true` LANDED
- [ ] `tsc --noEmit` → 0 errors final
- [ ] ZERO `// @ts-ignore` adăugat (preferred narrow / destructure / nullish coalesce)
- [ ] ZERO test regression (vitest count preserved cu growth Phase 6 cumulative)
- [ ] Sparing use `!` non-null assertion doar invariant-guaranteed bounded loops

## §4 Tests delta 0 (type-level refactor)

## §5 Commit(s)

```
refactor(ts): enable noUncheckedIndexedAccess strict flag + fix array access

Enables Phase 5 task_04 deferred TS strict flag. Fixes ~50 errors granular:
narrow length checks + destructure defaults + nullish coalesce + sparing
non-null assertions only invariant-guaranteed bounded contexts.

ZERO @ts-ignore. ZERO test regression. ZERO runtime behavior change —
pure type-level refactor surfacing implicit undefined risks.
```

## §6 Next

task_19 TS strict exactOptionalPropertyTypes flag enable.
