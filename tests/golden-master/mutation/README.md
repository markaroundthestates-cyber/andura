# Stryker mutation testing — SalaFull

Per chat strategic 2026-04-29 lock decision #7 — Golden Master Suite hybrid + mutation testing pe ARBITRATOR (target mutation score **>75%**).

## Sprint 2 status

✅ **Config livrat** (`stryker.conf.js`)
❌ **Stryker deps NOT installed** — deferred Sprint 3 (dependency add risk în autonomous overnight run).

## Install (Sprint 3 first run)

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

## Run

```bash
npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js
```

Or via npm script (după ce e adăugat în package.json):

```bash
npm run mutation
```

## Config rationale

**Mutation scope:** core engine logic — coachDirector, arbitrator (post-ADR 018), voices, dimensions, ruleEngine, decisionCluster. NU UI, NU scripts standalone.

**Thresholds:**
- `high: 80` — green (excellent coverage)
- `low: 60` — yellow (needs improvement)
- `break: 75` — under = CI fails (per lock decision target)

**Excluded mutations:** StringLiteral (avoid trivial user-facing wording mutations producing noise).

## Expected mutation score baseline

Sprint 3 first run = **measure baseline**. Test cu code curent:
- Dacă < 75% → flag failures + identify gaps + add unit tests
- Dacă > 75% → maintain + document specific weak files cu lower scores

Mutation score growth Sprint 3-4: target rising as:
- AA detection ported la dimension (ADR 018 Faza 1)
- Profile Typing implemented direct dimension (ADR 018 Faza 2)
- CORE_RULES dimension wrap (ADR 018 Faza 3)

## Cross-references

- ADR 018 (Engine Extensibility Architecture) — strangler migration phases
- chat strategic 2026-04-29 lock decision #7 (hybrid Golden Master + mutation)
- AUDIT_5000Q Q-0041 (push-back synthetic profile bias generator)
