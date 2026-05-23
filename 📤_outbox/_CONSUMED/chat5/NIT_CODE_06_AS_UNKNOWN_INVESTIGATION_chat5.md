# NIT-CODE-06 Investigation: as unknown as in Test Mocks

**Date:** 2026-05-23
**Investigator:** subagent Opus read-only (worktree `agent-a14e19f201123b9c0`)
**Source:** gsd-code-reviewer v2 chat 5 finding (cited 53+ occurrences driven by runProactiveChecks shape mismatch)
**Scope:** READ-ONLY investigation — ZERO src/ touched, ZERO git ops

---

## §1 Quantification

**Total `as unknown as ` occurrences in src/:** **30** (verified 2026-05-23 via grep, NOT 53+ as cited)

**Note re. 53+ claim:** The original gsd-code-reviewer v2 figure (53+) does not match current main HEAD. Possible explanations: (a) prior count included other escape-hatch patterns (`as any`, `// @ts-ignore`); (b) intervening cleanup commits reduced count; (c) original count was approximate. Current investigation honors the verified count of 30.

**Distribution by file (test code dominant — 26/30 = 87%):**

| File | Count | Category |
|------|-------|----------|
| `src/react/__tests__/lib/engineWrappers.getNutritionTargetsToday.test.ts` | 12 | Test mock (evaluateBN) |
| `src/react/__tests__/lib/engineWrappers.proactiveAlerts.test.ts` | 11 | Test mock (runProactiveChecks) |
| `src/react/__tests__/lib/engineWrappers.adherence.test.ts` | 3 | Test mock (getAdherenceScore) |
| `src/react/__tests__/lib/dexieMigration.test.ts` | 1 | Test fixture (`NaN as unknown as number`) |
| `src/react/stores/settingsStore.ts` | 1 | Production cast (WeekDayFlags array) |
| `src/react/stores/scheduleStore.ts` | 1 | Production cast (dynamic import) |
| `src/react/routes/screens/antrenor/Workout.tsx` | 1 | Production cast (WakeLock API) |

**Split:** 27 test (90%) + 3 production (10%).

**Unique target types referenced (test mocks):**
- `ReturnType<typeof runProactiveChecks>` (×9) + `ReturnType<typeof runProactiveChecks>[number]` (×1)
- `Awaited<ReturnType<typeof evaluateBN>>` (×11)
- `ReturnType<typeof getAdherenceScore>` (×2)
- `number` (`NaN as unknown as number` ×1, `score: 'high' as unknown as number` ×1)
- `'warning'` (literal narrow: `'cosmic' as unknown as 'warning'` ×1)

**Hot file:** `engineWrappers.proactiveAlerts.test.ts` (11 casts in 113 lines = 1 cast per ~10 LOC).

---

## §2 Root cause analysis

**Primary driver = JS engine modules with JSDoc-only types:**

`src/engine/proactiveEngine.js` §301:

```js
/**
 * Ruleaza toate cele 10 verificari si returneaza alertele active.
 * @param {Record<string, any> | null | undefined} ctx - CoachContext + extra fields
 * @returns {Array<any>} alerts sorted by severity (warning first, then info, then success)
 */
export function runProactiveChecks(ctx) { … }
```

TypeScript sees `runProactiveChecks` return as effectively `any[]` (JSDoc `@returns {Array<any>}`). When the `.ts` wrapper imports it and tests call `vi.mocked(runProactiveChecks).mockReturnValue([…])`, vitest's strict mock typing requires the literal array to satisfy `ReturnType<typeof runProactiveChecks>`. Since the engine alerts have no exported interface — only ad-hoc shape `{ type, severity, message }` flowing from 10+ check fns inside `proactiveEngine.js` — TypeScript cannot narrow the literal automatically. Test author escape hatch: `as unknown as ReturnType<typeof runProactiveChecks>`.

**Same pattern repeats for:**
- `evaluateBN` (Bayesian nutrition engine) — return is a deeply nested `EngineResult<…>` with `meta.nutrition_inference_metadata.posterior.{mu, sigma, …}`. Tests need to coerce partial fixtures.
- `getAdherenceScore` — JS engine, returns `{ score, breakdown, … }` JSDoc-typed.

**The wrapper `getProactiveAlerts(ctx: Record<string, unknown> = {})` itself is defensive** (try/catch + `Array.isArray` guard + null-coalesce on `alert?.type ?? 'unknown'`), so it eats malformed input gracefully. The friction is purely test-time mock typing, NOT runtime behavior.

**Three contributing factors:**
1. **Engines remain `.js` per ADR (post D015 STRAT PIVOT preserved pure-JS engine layer).** TypeScript wrappers in `src/react/lib/engineWrappers.ts` bridge JS engines → React UI.
2. **No exported `ProactiveAlertRaw` / `BNResult` interface from engine modules.** Each engine returns ad-hoc shape; wrapper redefines UI shape (`ProactiveAlert`).
3. **`vi.mocked(...).mockReturnValue(literal)` strict typing.** Vitest infers strict return type from the JSDoc-derived `any[]` plus inferred property shape on first mock call — tests can't supply minimal `{ type, severity, message }` without explicit type assertion.

**Not a bug; it's an interface gap between JS engines and TS test infrastructure.**

---

## §3 Options

### Option A: Partial<T> refactor + internal hydration

Convert engine to `.ts` with exported `ProactiveAlertRaw` interface AND refactor `runProactiveChecks` to accept `Partial<CoachContext>` + hydrate internally:

```ts
export interface ProactiveAlertRaw {
  type: string;
  severity: 'warning' | 'info' | 'success';
  message: string;
}
export function runProactiveChecks(ctx: Partial<CoachContext> = {}): ProactiveAlertRaw[] { … }
```

**Pros:** Permanent fix, no casts needed, type safety end-to-end.
**Cons:** **Violates D015 / ADR engines-stay-pure-JS invariant**. Touches 10+ engine files. High blast radius (`gitnexus_impact` would likely flag CRITICAL). Estimated 8-12 commits, risks bug regression in 4290+ test suite. Bugatti-grade but disproportionate for 11 cast sites.

### Option B: createMockContext() / createMockAlert() builder helpers

Add typed builder factories in `src/react/__tests__/test-utils/engineMockBuilders.ts`:

```ts
export function makeProactiveAlertRaw(o: Partial<{type:string;severity:string;message:string}> = {}) {
  return { type: 'test', severity: 'info', message: '', ...o } as ReturnType<typeof runProactiveChecks>[number];
}
export function makeProactiveAlertList(items: Array<Parameters<typeof makeProactiveAlertRaw>[0]>) {
  return items.map(makeProactiveAlertRaw) as ReturnType<typeof runProactiveChecks>;
}
```

Then tests become:
```ts
vi.mocked(runProactiveChecks).mockReturnValue(
  makeProactiveAlertList([{ type: 'protein_deficit', severity: 'warning', message: 'a' }])
);
```

**Pros:** Eliminates ALL 26 test-mock casts by concentrating the `as unknown as` into ONE builder file (~50 LOC), where it's documented and intentional. Test files become cleaner + signal "this is a partial fixture" via builder name. No engine touch. Low blast radius.
**Cons:** Still relies on one internal cast (in the builder). New test-util file to maintain. Authors must learn the builder convention.
**Effort:** ~3-4 atomic commits (new test-util file + 3 test file migrations). Reversible.

### Option C: Codify accepted-pattern in style guide

Document that `as unknown as <ReturnType>` IS the accepted Andura pattern for JS-engine test mocks. Add to `08-workflows/CODE_STYLE.md` (or similar):

> **Test mocks for JS engines:** Use `as unknown as ReturnType<typeof engineFn>` for `vi.mocked(...).mockReturnValue(...)`. This is intentional — engines are JS-by-ADR (D015) and exported types are JSDoc-typed `any[]`. Production code is strict TS; test casts are localized to `__tests__/`.

**Pros:** Zero code touch. Documents real architectural constraint. Aligns with reality (engines stay JS, wrappers are strict). Bugatti pragmatism: don't refactor working test infra for cosmetic concern.
**Cons:** Doesn't reduce cast count. New contributors still see "scary" cast pattern without immediate context (mitigated by lint-comment marker e.g. `// JS-engine-mock cast — see CODE_STYLE.md §X`).
**Effort:** 1 commit (doc append).

---

## §4 Co-CTO recommendation

**Pick: Option B + Option C hybrid (NOT Option A).**

**Rationale:**

1. **Option A violates D015 engine layer invariant.** Engines stay JS by ADR. Converting `proactiveEngine.js` → `.ts` for a NIT-tier cosmetic cleanup is disproportionate and risks regression in stable 4290+ test suite. Bugatti craft ≠ refactor for refactor's sake.

2. **Option B captures 90% of the benefit at 10% of the cost.** Concentrating the cast into a builder file:
   - Reduces 26 test-mock casts → 1 cast inside `engineMockBuilders.ts` (documented).
   - Test files become more readable (intent expressed via builder name, not cast soup).
   - Provides reusable fixtures for future engine wrapper tests.
   - Reversible single-purpose commits; safe to land incrementally.

3. **Option C complements Option B** — even with builders, occasional one-off `as unknown as` remains for edge cases (e.g., `'cosmic' as unknown as 'warning'` literal narrowing). Documenting that JS-engine-mock casts ARE accepted prevents future reviewer thrash.

4. **Production casts (3 sites) are unrelated to this nit** — they're API/DOM coercions (`NavigatorWithWakeLock`, dynamic import shape). Out of scope; leave as-is.

**Effort estimate:** ~25-40 min real time autonomous (anchor: ~8 min/test file migration ×3 + ~10 min builder file + ~5 min CODE_STYLE.md doc). ~4 atomic commits.

**Benefit/cost ratio:**
- Benefit: -25 casts in test bodies, +readability, +future test author velocity (drop-in builder)
- Cost: +1 test-util file (~50-80 LOC), +1 doc paragraph
- **Net:** Strong positive, Bugatti-aligned (peak craft localized where it matters).

**Priority:** NIT-tier (not blocker for Beta launch). Schedule post Iter 1 Mass Fix V2 completion. Pair with other test infrastructure polish.

**Open questions for Daniel (none required, surfaced for transparency):**
- None — tactical decision Co-CTO autonomous per D024 + manager role LOCK V1.

---

## §5 Investigation provenance

- Filesystem grep verified 30 occurrences (NOT 53+ as cited in gsd-code-reviewer v2 brief).
- `src/engine/proactiveEngine.js` §301 read — confirmed JSDoc `@returns {Array<any>}` driver.
- `src/react/lib/engineWrappers.ts` §770 read — confirmed wrapper input is `Record<string, unknown>` (already loose); friction is on return type narrowing.
- `engineWrappers.proactiveAlerts.test.ts` full read — 11 casts confirmed structural pattern (vi.mocked → mockReturnValue with literal array).
- ZERO src/ files touched. ZERO git operations performed. Worktree: `agent-a14e19f201123b9c0`.
