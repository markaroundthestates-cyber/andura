# PROMPT_CC_BATCH_07_TEST_COVERAGE_REPORT

**Model:** Opus
**Order:** 7/10
**Dependencies:** BATCH_03 complete (Golden Master tests integrated în coverage)
**Scope:** vitest --coverage rulat + raport gaps în outbox (baseline măsurabilă pentru future)
**Estimate:** ~30-45min

---

## CONTEXT

Per Daniel "rezolvăm acum" — coverage report = baseline măsurabilă, NOT actionable immediate. Daniel non-dev nu interpretează gaps direct, dar baseline = future regression detection + Sprint UI Integration confidence.

Tests delta context: 1110 (pre Sprint 4.x) → 1174 (post Sprint 4.x) → 1174+N (post BATCH_03 Golden Master).

---

## TASKS

### Task 7.1 — Verify coverage tooling installed

Check `package.json` pentru `@vitest/coverage-v8` sau `@vitest/coverage-istanbul`:

```bash
grep -E "@vitest/coverage" package.json
```

If NOT installed:
```bash
npm install --save-dev @vitest/coverage-v8
```

Verify `vitest.config.ts` (or similar) has coverage config. If NOT, add minimal:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'dist/**',
        '**/*.d.ts',
      ],
    },
  },
});
```

---

### Task 7.2 — Run coverage

```bash
npm test -- --coverage
```

Capture output:
- Overall coverage % (lines, branches, functions, statements)
- Per-file coverage breakdown
- Uncovered files entirely

Output goes to `./coverage/` folder + console.

---

### Task 7.3 — Parse coverage results

Extract from `coverage/coverage-summary.json` (auto-generated):

```bash
cat coverage/coverage-summary.json
```

Identify:
- **Total coverage:** lines/branches/functions/statements %
- **High-coverage modules (>80%):** count + list top 5
- **Low-coverage modules (<50%):** count + list ALL (these are gaps)
- **Zero-coverage files:** list ALL (entirely untested)

---

### Task 7.4 — Generate report

**Create file:** `📤_outbox/_archive/2026-05/BATCH_07_COVERAGE_REPORT.md`

```markdown
# Test Coverage Report — Baseline (BATCH_07)

**Date:** 2026-05-02
**Tests run:** <N> tests, <M> test files
**Tool:** vitest + @vitest/coverage-v8

## Overall coverage

| Metric | Coverage |
|--------|----------|
| Lines | XX.X% |
| Branches | XX.X% |
| Functions | XX.X% |
| Statements | XX.X% |

## High coverage (>80%) — top 5

1. `src/engine/composite-signal-layer.ts` — 95.2%
2. `src/engine/smart-routing.ts` — 92.1%
3. `src/engine/dp.js` — 88.7%
<adapt actual>

## Gaps (<50%) — ALL listed

1. `src/<path>` — 23.4% (<context: why low — e.g., UI component, integration code>)
2. `src/<path>` — 31.1% (<context>)
<repeat>

## Zero coverage — ALL listed

1. `src/<path>` — 0% (<context>)
<repeat>

## Recommendations

**Pre-Beta priorities:**
- <list 3-5 critical gaps relevant to Beta launch>

**Post-Beta backlog:**
- <list non-critical gaps acceptable defer>

**Sprint UI Integration impact:**
- Sprint UI Integration va consuma multe modules currently <high/low> coverage
- Post-Sprint coverage estimate: <up/down>

## Baseline locked

This report = baseline 2026-05-02 reference. Future cluster regression check:
```
npm test -- --coverage
```
Compare against this baseline.
```

---

### Task 7.5 — Cross-ref HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry:

```markdown
### §36.68 TEST COVERAGE BASELINE 2026-05-02

Coverage baseline locked: lines XX.X% / branches XX.X% / functions XX.X% / statements XX.X%.

- **Tests:** <N> total, <M> files
- **High coverage (>80%):** <count> modules
- **Gaps (<50%):** <count> modules (see `BATCH_07_COVERAGE_REPORT.md`)
- **Zero coverage:** <count> files

Reference baseline pentru future regression detection. Sprint UI Integration impact assessment în report.

**Cumulative LOCKED count:** 60 → 60 (measurement, NU decizie nouă)
```

---

## VERIFICATION GATE

Pre-commit:
1. `ls coverage/coverage-summary.json` → file exists
2. `ls 📤_outbox/_archive/2026-05/BATCH_07_COVERAGE_REPORT.md` → file exists
3. `grep "§36.68 TEST COVERAGE BASELINE" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match
4. Coverage report has actual numbers (NOT placeholders) — verify Lines/Branches percentages populated

---

## COMMIT

```
# Add coverage tooling if installed:
git add package.json package-lock.json vitest.config.ts # if changed

# Add report + cross-ref:
git add 📤_outbox/_archive/2026-05/BATCH_07_COVERAGE_REPORT.md 06-sessions-log/HANDOVER_GLOBAL.md

# .gitignore coverage/ output dacă NOT already:
git check-ignore coverage/ || echo "coverage/" >> .gitignore && git add .gitignore

git commit -m "feat(batch-07): test coverage baseline 2026-05-02

- Lines XX.X% / branches XX.X% / functions XX.X% / statements XX.X%
- BATCH_07_COVERAGE_REPORT.md detailed gaps + recommendations
- @vitest/coverage-v8 setup if needed
- HANDOVER_GLOBAL §36.68 entry"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_07_REPORT.md`:

```markdown
# BATCH_07_TEST_COVERAGE_REPORT — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- Coverage tooling setup (if was missing)
- BATCH_07_COVERAGE_REPORT.md baseline detailed
- HANDOVER_GLOBAL §36.68 entry
- coverage/ added .gitignore

## Coverage results
- Lines: XX.X%
- Branches: XX.X%
- Functions: XX.X%
- Statements: XX.X%
- Total tests: <N> across <M> files

## Gaps identified
- <count> modules <50%
- <count> files zero coverage

## Verification gate
- [✅/❌] coverage-summary.json exists
- [✅/❌] BATCH_07_COVERAGE_REPORT.md exists with real numbers
- [✅/❌] grep §36.68: 1 match
- [✅/❌] npm test: all pass

## Issues
<none / lista — flag dacă coverage tool NOT compatible existing setup>

## Next batch
BATCH_08_DEPENDENCIES_AUDIT
```

Stop. Trigger BATCH_08.
