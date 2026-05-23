---
title: Test Brittleness Audit (chat 5)
date: 2026-05-23
type: audit-report
status: READ-ONLY investigation (Daniel + future Co-CTO triage remediation later)
trigger: Co-CTO autonomous Bugatti quality gate chat 5 — pre-Beta hardening
scope: src/**/*.test.{ts,tsx,js} — 324 test files, 5713+ PASS
---

# Test Brittleness Audit — chat 5

## §1 Executive summary

Targeted grep audit across **324 test files** identified brittle patterns that may cause future regressions under refactor pressure, timezone change, or non-deterministic environment shifts.

**Brittle indicator distribution:**

| Indicator | Files | Occurrences | Risk class |
|-----------|-------|-------------|------------|
| `Date.now()` / `new Date(...)` | 84 | 272 | HIGH (date-drift) |
| Hardcoded `'2026-/2025-/2024-'` date string literals | 50+ | 399 | MED (data-key vs assertion split) |
| `setTimeout` / `setInterval` in tests | 7 | 19 | HIGH (race fragility) |
| `setTimeout` WITHOUT `vi.useFakeTimers` co-located | **5** | 13 | **HIGH** (real-time race) |
| `vi.useFakeTimers` / `advanceTimersByTime` (proper) | 17 | 91 | LOW (correct usage) |
| `getByText` / `queryByText` / `findByText` (exact-string DOM coupling) | 50+ | 139 | MED (DOM brittle if copy changes) |
| `getByRole` / `getByLabel` / `getByTestId` (resilient) | 30+ | 389 | LOW (preferred pattern) |
| `Math.random()` in tests | 7 | 8 | LOW (deterministic fixtures dominate) |
| `crypto.randomUUID()` / `uuidv4()` | 0 | 0 | NONE (zero hits) |
| `toMatchSnapshot()` / `toMatchInlineSnapshot()` | 0 | 0 | NONE (no snapshot fragility) |
| `:first-child` / `:nth-child` selectors | 0 | 0 | NONE (zero DOM-position coupling) |
| `localStorage.clear()` in tests | 64 occurrences across 50 files | — | LOW (cleanup discipline OK) |
| `vi.mock(...)` relative-path mocks | 116 occurrences across 50 files | — | MED (refactor-fragile import paths) |

**Top 3 combined-indicator hotspots (dates + string-literals + getByText):**
1. `src/engine/__tests__/reality.test.js` — **80 indicators** (21 Date refs + 59 hardcoded date strings)
2. `src/engine/__tests__/profileTyping.test.js` — **58 indicators** (0 Date refs, 58 hardcoded ISO date strings, all paired with `vi.setSystemTime`)
3. `src/engine/__tests__/linearBlock.test.js` — **56 indicators** (30 Date refs + 26 hardcoded strings)

**Severity distribution:** HIGH = 4 patterns | MED = 4 patterns | LOW = 5 patterns | NONE confirmed = 4 absent anti-patterns.

**Overall posture:** Suite is **healthier than worst-case projections**. Zero snapshot fragility, zero UUID without mock, zero `:nth-child` DOM coupling. Main risk = 5 test files use real `setTimeout(fn, 20)` for Zustand persist drain (race condition under loaded CI). Date-dependency hotspots already mostly paired with `vi.setSystemTime`. Test discipline overall = Bugatti baseline.

---

## §2 Audit methodology

### Grep patterns used

```
# Date dependency
Date\.now\(\)|new Date\(
'2026-\d{2}-\d{2}'|"2026-\d{2}-\d{2}"

# Random / non-deterministic
Math\.random
crypto\.randomUUID|uuidv4|uuid\.v4

# Timing fragility
setTimeout|setInterval
vi\.useFakeTimers|advanceTimersByTime|runAllTimers
vi\.setSystemTime|setSystemTime

# DOM-coupling brittle vs resilient
getByText|queryByText|findByText
data-testid|getByTestId|getByRole|getByLabel

# Snapshot fragility
toMatchSnapshot|toMatchInlineSnapshot

# Position-dependent selectors
first-child|:nth-child|nth-of-type

# State cleanup discipline
localStorage\.clear\(\)|sessionStorage\.clear\(\)
vi\.clearAllMocks|vi\.resetAllMocks|vi\.restoreAllMocks
beforeEach|afterEach|beforeAll|afterAll

# Mock path fragility (refactor risk)
vi\.mock\(['"]\.\.\/|vi\.mock\(['"]@/
```

### Categorization heuristic

- **HIGH** = will likely fail in a future refactor, timezone shift, locale change, slow CI, or moderate code reorganization. Sample: `setTimeout` without fake timers (race), `Date.now()` in assertion path without freeze.
- **MED** = adds maintenance friction (every UI copy tweak breaks the test, every renamed file path breaks the mock).
- **LOW** = cosmetic refinement; tests still pass deterministically today.

### Files scanned

324 test files total in `src/**/__tests__/` and `src/**/tests/` paths. Includes:
- Vitest 3 unit tests (jsdom)
- RTL component tests (`react/__tests__/`)
- Engine tests (`engine/__tests__/`)
- Coach orchestrator parity tests (`coach/orchestrator/__tests__/`)
- Storage / IndexedDB tests (`storage/__tests__/`)
- Util tests (`util/__tests__/`)
- Page-level tests (`pages/__tests__/`, `pages/coach/__tests__/`)

E2E Playwright tests (live `andura.app`) were OUT OF SCOPE — local Vitest only.

---

## §3 Top hotspot files

### §3.1 Combined-indicator top 10

Sorted by `dates + string-literals + text-selectors` aggregate.

| Rank | File | Date refs | Date strings | getByText | Total | Notes |
|------|------|----------:|-------------:|----------:|------:|-------|
| 1 | `engine/__tests__/reality.test.js` | 21 | 59 | 0 | 80 | NO `vi.setSystemTime` paired with `Date.now()` calls — possible time-of-test drift if engine reads clock. |
| 2 | `engine/__tests__/profileTyping.test.js` | 0 | 58 | 0 | 58 | Heavy `vi.setSystemTime` discipline — dates frozen per test. Healthy pattern. |
| 3 | `engine/__tests__/linearBlock.test.js` | 30 | 26 | 0 | 56 | Schedule/periodization tests — heavy date arithmetic. Need to verify freeze coverage. |
| 4 | `react/__tests__/stores/workoutStore.test.ts` | 50 | 0 | 0 | 50 | All `Date.now()` calls are `startSession(Date.now())` — input value, NOT assertion target. Safe. |
| 5 | `engine/__tests__/sys.test.js` | 6 | 29 | 0 | 35 | Hardcoded `'2026-04-27'` as `mockStorage` map keys (data identifiers). Mostly safe. `vi.setSystemTime` used for time-aware paths. |
| 6 | `util/__tests__/isoWeek.test.js` | 5 | 26 | 0 | 31 | Pure function — date strings are inputs + expected outputs. NO time freeze needed. Safe. |
| 7 | `engine/__tests__/aa.test.js` | 22 | 0 | 0 | 22 | Auto-aggression detection — needs verification of freeze coverage. |
| 8 | `engine/__tests__/autoAggressionDetection.test.js` | 0 | 25 | 0 | 25 | Uses `dateOffset()` helper from `tests/fixtures/cdlEntries.js` — relative-date pattern. Healthy. |
| 9 | `engine/__tests__/coachContext.pauseDetection.test.js` | 21 | 21 | 0 | 42 | Combined dates + strings — verify freeze coverage. |
| 10 | `engine/__tests__/profileTyping.personas.e2e.test.js` | 0 | 8 | 0 | 8 | Persona scenario fixtures. Low risk. |

### §3.2 Files using `setTimeout` WITHOUT `vi.useFakeTimers` (HIGH RISK)

| File | setTimeout count | Pattern | Risk |
|------|----:|---------|------|
| `react/__tests__/stores/workoutStore.test.ts` | 4 | `await new Promise((r) => setTimeout(r, 20))` (Zustand persist drain) | HIGH — 20ms race could fail on loaded CI |
| `react/__tests__/stores/coachStore.test.ts` | 3 | Same persist drain pattern | HIGH |
| `react/__tests__/stores/scheduleStore.test.ts` | 1 | Same persist drain | HIGH |
| `react/__tests__/screens/antrenor/Antrenor.test.tsx` | 2 | `await new Promise(resolve => setTimeout(resolve, 0))` (microtask flush) | MED — `setTimeout(_, 0)` benign |
| `pages/__tests__/settings.test.js` | 6 | Same microtask flush pattern | MED |

**Root cause Zustand persist drain:** Zustand's `persist` middleware writes async to localStorage; tests use real `setTimeout(20)` to wait for drain. Fragile under contention. **Preferred:** `await waitFor(() => expect(localStorage.getItem(...)).toBeTruthy())` or expose drain promise on store.

### §3.3 Files using `getByText` heavily (MED RISK — DOM copy coupling)

| File | getByText count | Risk |
|------|----:|------|
| `react/__tests__/screens/antrenor/Antrenor.test.tsx` | 13 | MED — RO copy changes will break tests |
| `react/__tests__/screens/cont/SettingsFaq.test.tsx` | 11 | MED — FAQ string evolution likely |
| `react/__tests__/components/SessionPill.test.tsx` | 13 | MED — UI string evolution likely |
| `react/__tests__/screens/istoric/Istoric.test.tsx` | 10 | MED |
| `react/__tests__/screens/antrenor/PostRpe.handleSubmit.prRecords.test.tsx` | 10 | MED |

### §3.4 Hardcoded relative-future date risk

ZERO occurrences of `2027-`, `2028-`, `2030-`, or `2099-` style placeholder dates. ZERO `new Date('2099-12-31')` past-the-horizon sentinels. ZERO test references `today.getTime() < someHardcodedTimestamp` — would silently start failing post-cutoff date. Suite avoids this trap.

---

## §4 Sample brittle patterns

### Pattern #1 — Real `setTimeout(20)` for Zustand persist drain (HIGH)

**File:** `src/react/__tests__/stores/workoutStore.test.ts:820-825`

```ts
it('persist write contains streak after incrementStreak', async () => {
  useWorkoutStore.getState().incrementStreak();
  await new Promise((r) => setTimeout(r, 20));  // brittle
  const raw = localStorage.getItem('wv2-workout-store');
  expect(raw).toBeTruthy();
```

**Brittleness:** Hardcoded 20ms wait. Under loaded CI (parallel agents on i7-8700), the persist drain may need >20ms → test fails intermittently. Per `feedback_agent_concurrency_limit.md` Daniel max 4-5 agents → already at thrashing threshold.

**Recommended fix:**
```ts
import { waitFor } from '@testing-library/dom';
await waitFor(() => {
  const raw = localStorage.getItem('wv2-workout-store');
  expect(raw && JSON.parse(raw).state.streak).toBeDefined();
}, { timeout: 200 });
```

Or expose `useWorkoutStore.persist.hasHydrated()` / `persist.rehydrate()` Promise hook.

---

### Pattern #2 — `Date.now()` in mocked timestamp without freeze (LOW–MED)

**File:** `src/react/__tests__/components/Antrenor/CoachTodayCard.test.tsx:69-79`

```tsx
useWorkoutStore.setState({
  sessionsHistory: [{
    title: 'Push',
    ts: Date.now(),  // input, not asserted
    exercises: [{
      sets: [{ kg: 100, reps: 5, rating: 'potrivit', timestamp: Date.now() }],
```

**Brittleness:** `Date.now()` used as fixture timestamp. Safe today (input, not asserted). HOWEVER if engine internally compares `ts` against `Date.now()` for "today" / "stale" logic, test may pass at noon but fail at 23:59:59.999 when render crosses midnight mid-test.

**Recommended fix:** Use literal fixture constant:
```tsx
const FIXED_TS = new Date('2026-05-23T10:00:00Z').getTime();
ts: FIXED_TS,
```

Or wrap with `vi.useFakeTimers() + vi.setSystemTime(FIXED_DATE)` for engine-touching tests.

---

### Pattern #3 — Exact-string `getByText` for evolving UI copy (MED)

**File:** `src/react/__tests__/screens/cont/SettingsFaq.test.tsx:32-34`

```tsx
expect(screen.getByText('Antrenament')).toBeInTheDocument();
expect(screen.getByText('Cont si date')).toBeInTheDocument();
expect(screen.getByText('Notificari')).toBeInTheDocument();
```

**Brittleness:** Romanian copy strings hardcoded. Daniel rewrites FAQ wording → 11 tests break, no semantic indication of intent.

**Recommended fix:** Use `getByRole` + accessible name (semantic), or `data-testid` for stable IDs:
```tsx
expect(screen.getByRole('heading', { name: /antrenament/i })).toBeInTheDocument();
// or
expect(screen.getByTestId('faq-section-antrenament')).toBeInTheDocument();
```

---

### Pattern #4 — `vi.useFakeTimers` proper usage (LOW — correct pattern)

**File:** `src/react/__tests__/screens/antrenor/Workout.test.tsx:219-245`

```tsx
describe('Workout — rest countdown timer (fake timers)', async () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rest countdown decrements each second', async () => {
    await renderWorkoutAndWait();
    fireEvent.click(screen.getByRole('button', { name: /^Usor$/i }));
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:30');
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByTestId('rest-countdown')).toHaveTextContent('1:27');
  });
```

**Pattern strength:** Combines `vi.useFakeTimers`, deterministic `advanceTimersByTime`, `act()` wrapper, `getByRole` (regex), `getByTestId` — gold standard. Use as template for other timer-dependent tests.

---

### Pattern #5 — Date string as data-key (LOW — safe)

**File:** `src/engine/__tests__/sys.test.js:37`

```js
mockStorage['weights'] = { '2026-04-27': 105 };
expect(SYS.getBF()).toBe(18.5);
```

**Pattern strength:** Hardcoded date string here is a **map key** (data identifier), NOT a clock-comparison assertion. Test is deterministic regardless of when it runs. No fix needed.

---

### Pattern #6 — `setSystemTime` paired with hardcoded ISO (LOW — correct)

**File:** `src/engine/__tests__/profileTyping.test.js:260-262`

```js
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
```

**Pattern strength:** Time frozen explicitly — test results identical across timezones, DST shifts, day-of-week. Use as template wherever engine reads clock.

---

### Pattern #7 — Relative `dateOffset` helper (LOW — gold standard)

**File:** `src/tests/fixtures/cdlEntries.js` (helper) + `src/engine/__tests__/autoAggressionDetection.test.js:39-41`

```js
const entries = [
  deviationEntry({ date: dateOffset(22), proposedSets: 16, actualSets: 20 }),
  deviationEntry({ date: dateOffset(11), proposedSets: 16, actualSets: 20 }),
  deviationEntry({ date: dateOffset(0),  proposedSets: 16, actualSets: 20 }),
];
```

**Pattern strength:** Relative `dateOffset(N)` returns `Date.now() - N*MS_PER_DAY` style. Test logic asserts on **relative spread** (22 days vs 21-day window), not absolute dates. Frame-of-reference independent. **Promote across other engine tests** for windowed-aggregation logic.

---

### Pattern #8 — Microtask flush via `setTimeout(_, 0)` (MED — refactor candidate)

**File:** `src/react/__tests__/screens/antrenor/Antrenor.test.tsx:335`

```tsx
await new Promise(resolve => setTimeout(resolve, 0));
expect(screen.queryByRole('status', { name: /Verdict readiness/i })).not.toBeInTheDocument();
```

**Brittleness:** `setTimeout(_, 0)` flushes one task tick — fragile across browser/jsdom event-loop scheduling differences.

**Recommended fix:** RTL `waitFor()` semantic + `findBy*` queries:
```tsx
await waitFor(() => {
  expect(screen.queryByRole('status', { name: /Verdict readiness/i })).not.toBeInTheDocument();
});
```

---

### Pattern #9 — Relative-path mock fragility (MED — silent refactor break)

**Files affected:** 50+ test files use `vi.mock('../../../engine/dp.js', ...)`.

**Sample:** `src/pages/coach/__tests__/restTimer.test.js:12-17`

```js
vi.mock('../../../engine/dp.js', () => ({
  DP: { recommend: vi.fn(() => ({ kg: 22.5, repsTarget: '8-10' })) }
}));
```

**Brittleness:** Moving `engine/dp.js` requires manual update of N test files. ESM hoist + relative-path discovery means typo → mock silently inactive → test asserts against real implementation accidentally.

**Recommended fix:** Path alias (`@/engine/dp`) with tsconfig `paths` + Vitest `alias` config:
```js
vi.mock('@/engine/dp', () => ({ DP: { recommend: vi.fn(...) } }));
```

Refactor-safe across module moves.

---

### Pattern #10 — Math.random() usage (LOW — minimal)

**File:** `src/util/__tests__/cdlBackfill.test.js:1-2`

8 total occurrences across 7 files. Most are seeded or used to generate test IDs (not assertion-relevant). **Verify each:** if `Math.random()` output feeds into the assertion, brittleness HIGH. If it generates unique IDs only, brittleness LOW.

**Recommended fix (if assertion-relevant):**
```js
vi.spyOn(Math, 'random').mockReturnValue(0.5);
// or use a seeded PRNG fixture
```

---

## §5 Recommendations

### HIGH priority (fix pre-Beta)

1. **Replace `setTimeout(20)` Zustand persist drain pattern with `waitFor()`** in 5 files: `workoutStore.test.ts`, `coachStore.test.ts`, `scheduleStore.test.ts`, `Antrenor.test.tsx`, `settings.test.js`. ~13 occurrences total. Estimated 30-45 min refactor.

2. **Audit `engine/__tests__/reality.test.js` (80 indicators)** for missing `vi.setSystemTime` coverage on clock-touching paths. 21 `Date.now()` calls suggest potential time-of-test drift. Quick verify: does `realityEngine` read `Date.now()` internally? If yes, freeze.

3. **Audit `engine/__tests__/linearBlock.test.js` (56 indicators)** same as above. 30 Date refs + 26 hardcoded strings. Schedule/periodization logic is time-sensitive by nature.

### MED priority (incremental hardening)

4. **Migrate exact `getByText` to `getByRole` + accessible names** in top 5 hotspots (`Antrenor.test.tsx`, `SettingsFaq.test.tsx`, `SessionPill.test.tsx`, `Istoric.test.tsx`, `PostRpe.handleSubmit.prRecords.test.tsx`). ~57 occurrences. Bulk-refactor candidate.

5. **Migrate relative-path `vi.mock('../../../...')` to path-alias `vi.mock('@/...')`** across 116 occurrences. Requires `tsconfig.json` + `vitest.config.ts` alignment. One-time setup, perpetual maintenance reduction.

6. **Replace `setTimeout(_, 0)` microtask flush with `waitFor()`** in `Antrenor.test.tsx:335,460` + `settings.test.js`. 8-10 occurrences.

7. **Promote `dateOffset()` helper** from `tests/fixtures/cdlEntries.js` to `tests/fixtures/dateHelpers.js`. Adopt across engine windowed-aggregation tests (currently 25+ files use hardcoded `'2026-...'` strings where relative offsets would be more refactor-safe).

### LOW priority (polish)

8. **Add `Math.random()` mock** in 7 files using seeded fixtures or `vi.spyOn(Math, 'random')`.

9. **Document the gold-standard fake-timer pattern** (from `Workout.test.tsx:219`) as the project canonical pattern. Reference in `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` § timer-test hygiene.

10. **Confirm NO snapshot tests exist** (current = 0). Add a Vitest lint rule or pre-commit grep to block any future `toMatchSnapshot` introduction — prevents drift.

---

## §6 Anti-pattern → preferred pattern table

| Anti-pattern | Preferred pattern | Rationale |
|--------------|-------------------|-----------|
| `await new Promise(r => setTimeout(r, 20))` | `await waitFor(() => expect(...).toBeTruthy())` | Polls until condition met; no race on loaded CI |
| `await new Promise(r => setTimeout(r, 0))` | `await waitFor(...)` or `await findBy*(...)` | Semantic intent; resilient to event-loop changes |
| `Date.now()` in fixture used by clock-reading engine | `vi.useFakeTimers() + vi.setSystemTime(FIXED)` + literal constant | Frame-of-reference independent |
| Hardcoded `'2026-MM-DD'` for relative-window logic | `dateOffset(N)` helper relative to `Date.now()` | Survives 2030 without rewrite |
| `screen.getByText('Antrenament')` | `screen.getByRole('heading', { name: /antrenament/i })` | Survives copy changes + capital-letter tweaks |
| `screen.getByText('Antrenament')` for repeated identifier | `screen.getByTestId('faq-section-antrenament')` | Stable across i18n + copy evolution |
| `vi.mock('../../../engine/dp.js', ...)` | `vi.mock('@/engine/dp', ...)` (with alias) | Refactor-safe across module moves |
| `Math.random()` in assertion path | `vi.spyOn(Math, 'random').mockReturnValue(0.5)` | Deterministic |
| `crypto.randomUUID()` in assertion path | `vi.spyOn(crypto, 'randomUUID').mockReturnValue('fixed-uuid')` | Deterministic (zero current hits — preserve baseline) |
| `toMatchSnapshot()` | Explicit assertions on relevant fields only | Avoids whitespace/timestamp drift |
| `screen.querySelector('.foo:first-child')` | `screen.getAllByRole(...)[0]` | Semantic over CSS position (zero current hits — preserve) |

---

## §7 Cross-refs

- **SSOT root:** [[DECISIONS.md §D067]] — Coverage Top 5 closure pattern chat 5 milestone baseline 89.82%+ (test coverage discipline context)
- **Engine coverage discipline:** [[DECISIONS.md §D063]] — engine adapter Sentry coverage 100% anti-drift
- **ZERO bug gate:** [[DECISIONS.md §D042]] — ZERO bug gate pre-Beta
- **Gold-standard fake-timer test pattern:** `src/react/__tests__/screens/antrenor/Workout.test.tsx:219-245`
- **Gold-standard relative-date helper:** `src/tests/fixtures/cdlEntries.js` (`dateOffset` export)
- **Gold-standard `setSystemTime` discipline:** `src/engine/__tests__/profileTyping.test.js:260+`
- **HIGH-RISK file requiring deeper audit:** `src/engine/__tests__/reality.test.js` (80 brittleness indicators, no co-located `setSystemTime`)
- **HIGH-RISK setTimeout drain pattern:** `src/react/__tests__/stores/workoutStore.test.ts:820-855`
- **MED-FIX context (CoachTodayCard useMemo deps):** `src/react/__tests__/components/Antrenor/CoachTodayCard.test.tsx` — current test correctly mocks via `vi.spyOn(engineWrappers, 'getCoachTodayQuote')`. Optional-chain pattern from HIGH-EPSILON fix safely isolated.
- **HANDOVER verification gate:** [[08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md]] § timer-test hygiene (recommended new section)
- **Adjacent audit reports (chat 5):**
  - `📤_outbox/WORKTREE_CLEANUP_AUDIT_chat5.md` — worktree hygiene
  - `📤_outbox/PRE_BETA_CHECKLIST_chat5.md` — Beta readiness gate

---

**Outcome:** ZERO test edits. ZERO source edits. Read-only enumeration + remediation roadmap. Daniel + future Co-CTO decide HIGH-priority fix sequencing post-Beta or pre-Beta per Bugatti quality gate priorities.
