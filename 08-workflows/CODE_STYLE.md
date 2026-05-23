---
title: CODE_STYLE
created: 2026-05-23
codifies: NIT-CODE-06 (chat 5)
sources:
  - 📤_outbox/NIT_CODE_06_AS_UNKNOWN_INVESTIGATION_chat5.md
  - DECISIONS.md §D015 STRAT PIVOT
---

# CODE_STYLE — Andura conventions

Per-pattern style guide codifying recurring code review nits with surfaced
tradeoffs. Append-only — extend with new sections per nit codification.

---

## Test mock typing pattern (NIT-CODE-06 chat 5 codification)

**Context:** `src/engine/*.js` modules stay JS per `DECISIONS.md §D015` LOCK
V1 (ADR engines-stay-pure-JS invariant). JSDoc `@returns {Array<any>}` etc.
surface as `any[]` under TypeScript strict, so `vi.mocked(...).mockReturnValue(literal)`
inside test bodies cannot narrow a partial fixture without an explicit type
escape hatch.

**Three accepted patterns (preferred → fallback):**

### 1. Preferred — `createMock*` builders from `src/test-utils/createMockContext.ts`

For repeated mock shapes (≥2 test sites for the same engine), use the typed
factory:

```ts
import { createMockProactiveAlertList } from '../../../test-utils/createMockContext';

vi.mocked(runProactiveChecks).mockReturnValue(
  createMockProactiveAlertList([
    { type: 'protein_deficit', severity: 'warning', message: 'a' },
  ]),
);
```

Available builders:
- `createMockProactiveAlert(overrides?)` — single alert literal
- `createMockProactiveAlertList(items?)` — array of alerts
- `createMockAdherenceScore(overrides?)` — `{score, color, label}` shape
- `createMockBNResult(overrides?)` — Bayesian Nutrition deep result

The `as unknown as <ReturnType>` cast is concentrated inside each builder
where it's documented and reversible. Test bodies stay clean (intent
expressed via builder name + override fields).

### 2. Acceptable — `as unknown as <Type>` for one-off / negative-path

Inline `as unknown as <ReturnType>` IS accepted for:
- **One-off fixtures** (1-2 test sites, not worth builder extraction).
- **Negative-path tests** where the builder's default values would defeat
  the test (e.g. omitting a field the builder would inject):
  ```ts
  // missing `message` defensive — builder default would inject 'mock message'
  vi.mocked(runProactiveChecks).mockReturnValue([
    { type: 'unknown', severity: 'info' } as unknown as ReturnType<typeof runProactiveChecks>[number],
  ] as unknown as ReturnType<typeof runProactiveChecks>);
  ```
- **Forbidden-value injection** (e.g. `score: 'high' as unknown as number`
  to test type-guard rejection in the wrapper).
- **Null/undefined returns** (`null as unknown as ReturnType<...>`) — builder
  pattern doesn't help with primitive nulls.

Add a 1-line comment naming the reason when the cast is intentional.

### 3. Forbidden — `as any`

`as any` is forbidden in `src/` per TypeScript strict invariant. ESLint
rule `@typescript-eslint/no-explicit-any` enforces. Use `as unknown as <T>`
double-cast instead — explicit + locally scoped + greppable.

---

## Cross-refs

- `src/test-utils/createMockContext.ts` — builder implementations
- `📤_outbox/NIT_CODE_06_AS_UNKNOWN_INVESTIGATION_chat5.md` — investigation
- `DECISIONS.md §D015` — engines-stay-JS LOCK V1
- `src/engine/bayesianNutrition/index.d.ts` — sibling .d.ts precedent
  (Phase 4 task_11 §A pattern for typed JS engines without conversion)
