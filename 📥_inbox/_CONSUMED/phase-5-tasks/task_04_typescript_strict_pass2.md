# task_04 — TypeScript Strict Pass-2 Cleanup `any` + Tighter Types

**Phase:** 5 (cap-coadă)
**Type:** Refactor type safety
**Deps:** task_03 (post sessions breakdown landed)
**Backup tag:** `pre-phase5-task-04-2026-05-17`
**Est commits:** 1-2 atomic per-file group
**Est tests delta:** ±0 (refactor, semantic preservation)

---

## §1 Scope

Phase 4 task_11 §A landed initial TS strict pass — sibling `.d.ts` files pentru `src/engine/*` JS modules. Pass-2 sweep cleanup remaining `any` casts + loose `unknown` patterns + add discriminated unions unde fac sense + readonly markers la const arrays.

Goal: ZERO `any` în `src/react/**`, tighter inference, NU breaking change semantic.

## §2 Changes

### A. Audit grep evidence

```bash
grep -rn ": any" src/react/ | grep -v node_modules
grep -rn "as any" src/react/ | grep -v node_modules
grep -rn "Record<string, any>" src/react/
grep -rn "unknown" src/react/ | grep -v ".d.ts"
```

Per-occurrence: replace cu typed alternative.

### B. Common patterns to fix

1. **DB module access** (legacy `DB.get(key)` returns mixed types):
```tsx
// Before:
const data = DB.get('logs') as any;
// After: define narrow type
interface SessionLog { id: string; date: string; exercises: Array<...>; }
const data = DB.get('logs') as SessionLog[] | null;
```

2. **Event handlers cu loose typing:**
```tsx
// Before:
const onChange = (e: any) => setVal(e.target.value);
// After:
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value);
```

3. **Zustand store get/set partial:**
```tsx
// Before:
set((s: any) => ({ ...s, foo: 1 }));
// After: rely on store generic inference
set((s) => ({ ...s, foo: 1 }));
```

4. **Discriminated unions pentru state machines:**
```tsx
// Before:
interface WorkoutState { status: string; data?: any; }
// After:
type WorkoutStatus =
  | { status: 'idle' }
  | { status: 'active'; sessionId: string; startTime: number }
  | { status: 'paused'; sessionId: string; pausedAt: number };
```

5. **Readonly arrays pentru const tuples:**
```tsx
// Before:
const DAYS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
// After:
const DAYS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] as const;
```

### C. tsconfig.json strict flags audit

Verify enabled:
- `strict: true`
- `noUncheckedIndexedAccess: true` (catch array[idx] undefined)
- `exactOptionalPropertyTypes: true` (distinct optional vs undefined explicit)
- `noImplicitOverride: true`

Daca disable: enable + fix surfaced errors în pass-2.

## §3 Acceptance criteria

- [ ] ZERO `any` în `src/react/**` (excluding `.d.ts` files third-party)
- [ ] ZERO `as any` casts (cu exception explicit /* eslint-disable */ comentat motivat)
- [ ] TS strict 0 errors (preserve invariant)
- [ ] Vitest 4209+ PASS (semantic preservation, NU breaking)
- [ ] `noUncheckedIndexedAccess` enabled în tsconfig (daca not already)

## §4 Tests

Existing teste continuă să PASS. NEW tests OPTIONAL pentru discriminated unions narrowing behavior (TypeScript inference correctness rarely tested at runtime — types caught via `tsc --noEmit`).

```bash
npm run typecheck  # 0 errors strict
npm test           # 4209+ PASS
```

## §5 Commits (atomic 1-2)

```
refactor(react): TS strict pass-2 cleanup any + discriminated unions

Audit src/react/** sweep:
- Replace explicit `: any` cu narrow types
- Event handlers React.ChangeEvent<HTMLInputElement> etc.
- Zustand stores rely on inference (drop `: any` parametri)
- WorkoutStatus discriminated union state machine
- Const arrays cu `as const` readonly tuple

tsconfig.json enabled noUncheckedIndexedAccess + exactOptionalPropertyTypes
+ noImplicitOverride (daca were off).

ZERO runtime semantic change. 4209+ PASS preserved. tsc 0 errors.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_04_typescript_strict_pass2.md`:
- Audit summary (count `any` before/after per directory)
- tsconfig flags changed
- Tests baseline preserved confirmation
