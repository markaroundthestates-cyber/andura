# PROMPT_CC_BATCH_03_GOLDEN_MASTER_TESTS

**Model:** Opus
**Order:** 3/10
**Dependencies:** BATCH_01 complete (ADR LOCKED — Pain Discomfort wording final stable)
**Scope:** Golden Master snapshot tests pentru 51 strings dp.js + foundation modules (pre-UI guard-rail)
**Estimate:** ~1.5-2h

---

## CONTEXT

Per ALIGNMENT_QUESTIONS Q7 ⚠️ PRE-UI: Golden Master tests = guard-rail pentru Sprint UI Integration changes silent drift. Industry pattern (snapshot tests).

**Scope:**
- 51 strings dp.js (verdict messages + pain options post EXT-1 + signal layer messages)
- Foundation modules outputs (Composite Signal Layer + Smart Routing Equipment + Bias Detection — outputs deterministic given fixed inputs)

**Out of scope:** UI components rendering snapshots (those vor veni Sprint UI Integration).

---

## TASKS

### Task 3.1 — Setup Golden Master infrastructure

**Files to verify exist (search via `find`):**
- Test setup: `vitest.config.ts` sau `vite.config.ts` cu test config
- Existing __tests__/ folder structure

**Create new directory:** `src/__tests__/golden-master/`

**Create file:** `src/__tests__/golden-master/setup.ts`

```typescript
// Golden Master test setup — snapshots pentru regression detection silent drift
// Per VAULT_RULES §BATCH_PROTOCOL Sprint 4.x guard-rail standard

import { expect } from 'vitest';

// Helper: deterministic input → string output snapshot
export function captureSnapshot(label: string, output: string | object): void {
  expect({ label, output }).toMatchSnapshot();
}

// Helper: load fixture inputs
export function loadFixture<T>(path: string): T {
  return require(`./fixtures/${path}`).default as T;
}
```

---

### Task 3.2 — Snapshot 51 strings dp.js

**File path verify first:** `find . -name "dp.js" -not -path "*/node_modules/*"` (likely `src/engine/dp.js` sau similar — verify exact location).

**Create file:** `src/__tests__/golden-master/dp-strings.golden.test.ts`

```typescript
import { describe, it } from 'vitest';
import { captureSnapshot } from './setup';
// Import dp.js — adapt path to actual location verified
import * as dp from '<actual-path-to-dp>';

describe('Golden Master — dp.js strings', () => {
  it('captures all 11 verdict categorical strings', () => {
    // 10 tranziție + 1 ON_TARGET stare neutră (per Chat E Q4 resolved)
    const verdicts = [
      'PROGRESS_STRONG', 'PROGRESS_MODERATE', 'PROGRESS_WEAK',
      'PLATEAU_EARLY', 'PLATEAU_PROLONGED',
      'REGRESSION_MILD', 'REGRESSION_MODERATE', 'REGRESSION_SEVERE',
      'OVERREACH_DETECTED', 'UNDERLOAD_DETECTED',
      'ON_TARGET' // 11-th state neutră
    ];
    
    verdicts.forEach(verdictKey => {
      const message = dp.getVerdictMessage(verdictKey); // adapt to actual API
      captureSnapshot(`verdict_${verdictKey}`, message);
    });
  });

  it('captures 3 pain options post EXT-1 LOCKED V1', () => {
    const painOptions = [
      'discomfort_general',
      'discomfort_specific',
      'doms_severe' // hidden behind "Mai multe opțiuni" per EXT-1
    ];
    
    painOptions.forEach(optionKey => {
      const wording = dp.getPainOptionWording(optionKey); // adapt
      captureSnapshot(`pain_${optionKey}`, wording);
    });
  });

  it('captures composite signal layer messages', () => {
    // Per ADR_COMPOSITE_SIGNAL_LAYER_v1 LOCKED V1
    const signals = ['idle', 'flagged', 'cooldown', 'resolving'];
    signals.forEach(state => {
      captureSnapshot(`signal_${state}`, dp.getSignalMessage(state));
    });
  });

  it('captures remaining dp.js strings — exhaustive', () => {
    // Snapshot ALL exported strings from dp.js (catch any missed)
    const allStrings = dp.getAllStrings ? dp.getAllStrings() : {}; // adapt
    Object.entries(allStrings).forEach(([key, value]) => {
      captureSnapshot(`string_${key}`, value as string);
    });
  });
});
```

**NOTE:** Adapt API calls (`dp.getVerdictMessage`, etc.) la actual exports din dp.js. Verify ACTUAL exports via `grep "export" <dp.js path>` înainte de scrierea testelor.

---

### Task 3.3 — Snapshot foundation modules outputs

**Files to verify path:**
- Composite Signal Layer module (per ADR LOCKED): likely `src/engine/composite-signal-layer.ts`
- Smart Routing Equipment: likely `src/engine/smart-routing.ts`
- Bias Detection: likely `src/engine/bias-detection.ts`

**Create file:** `src/__tests__/golden-master/foundation-modules.golden.test.ts`

```typescript
import { describe, it } from 'vitest';
import { captureSnapshot, loadFixture } from './setup';
import { detectCompositeSignal } from '<path-to-composite-signal>';
import { findAlternatives } from '<path-to-smart-routing>';
import { detectBias } from '<path-to-bias-detection>';

describe('Golden Master — Foundation modules deterministic outputs', () => {
  it('Composite Signal Layer — 3/3 threshold scenarios', () => {
    const scenarios = [
      { name: 'all_clean', input: { performanceDrop: 0.05, restMultiplier: 1.0, rirMismatch: 0 } },
      { name: 'one_flag', input: { performanceDrop: 0.20, restMultiplier: 1.0, rirMismatch: 0 } },
      { name: 'two_flags', input: { performanceDrop: 0.20, restMultiplier: 1.6, rirMismatch: 0 } },
      { name: 'three_flags_triggers', input: { performanceDrop: 0.20, restMultiplier: 1.6, rirMismatch: 3 } },
    ];
    scenarios.forEach(({ name, input }) => {
      const result = detectCompositeSignal(input);
      captureSnapshot(`composite_signal_${name}`, result);
    });
  });

  it('Smart Routing Equipment — tier-aware filtering', () => {
    const scenarios = [
      { name: 'tier1_strict_match', input: { exerciseId: 'squat_barbell', tier: 1, missing: ['barbell'] } },
      { name: 'tier2_flexible', input: { exerciseId: 'lat_pulldown', tier: 2, missing: ['cable'] } },
      { name: 'tier3_zero_alternatives', input: { exerciseId: 'rare_exercise', tier: 3, missing: ['everything'] } },
    ];
    scenarios.forEach(({ name, input }) => {
      const result = findAlternatives(input);
      captureSnapshot(`smart_routing_${name}`, result);
    });
  });

  it('Bias Detection — known input scenarios', () => {
    // Adapt scenarios la actual bias detection API
    const scenarios = [
      { name: 'no_bias', input: loadFixture('bias-no-bias.json') },
      { name: 'recency_bias', input: loadFixture('bias-recency.json') },
      { name: 'confirmation_bias', input: loadFixture('bias-confirmation.json') },
    ];
    scenarios.forEach(({ name, input }) => {
      const result = detectBias(input);
      captureSnapshot(`bias_${name}`, result);
    });
  });
});
```

**NOTE:** Pentru fixtures bias detection, create `src/__tests__/golden-master/fixtures/bias-*.json` cu inputs deterministic (verify shape via existing tests).

---

### Task 3.4 — Generate snapshots initial

Run: `npm test -- src/__tests__/golden-master/ -u` (update snapshots flag).

Verify generated `__snapshots__/` folder cu fișiere `.snap` per test file.

Run again WITHOUT `-u`: `npm test -- src/__tests__/golden-master/` → all pass (idempotent).

---

### Task 3.5 — Cross-ref HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry sub §36:

```markdown
### §36.64 GOLDEN MASTER TESTS PRE-UI 2026-05-02

Snapshot tests created în `src/__tests__/golden-master/`:
- `dp-strings.golden.test.ts` — 51 strings dp.js (11 verdicte + 3 pain options + signal messages + exhaustive remaining)
- `foundation-modules.golden.test.ts` — Composite Signal Layer + Smart Routing + Bias Detection deterministic outputs

Per ALIGNMENT_QUESTIONS Q7 PRE-UI guard-rail. Industry pattern snapshot tests pentru protect Sprint UI Integration silent drift.

**Cumulative LOCKED count:** 60 → 60 (testing infra, NU decizie nouă)
**Tests delta:** 1174 → 1174+N (TBD post-execution)
```

---

## VERIFICATION GATE

Pre-commit:
1. `ls src/__tests__/golden-master/` → expect setup.ts + dp-strings.golden.test.ts + foundation-modules.golden.test.ts + __snapshots__/ + fixtures/
2. `npm test -- src/__tests__/golden-master/` → ALL PASS
3. `npm test` (full suite) → all pass (no regressions from new tests)
4. `grep "§36.64 GOLDEN MASTER" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match

---

## COMMIT

```
git add src/__tests__/golden-master/ 06-sessions-log/HANDOVER_GLOBAL.md
git commit -m "feat(batch-03): Golden Master snapshot tests pre-UI guard-rail

- 51 strings dp.js snapshot (verdicte + pain options + signals)
- Foundation modules deterministic outputs (composite signal + smart routing + bias detection)
- Industry pattern snapshot tests pre Sprint UI Integration
- HANDOVER_GLOBAL §36.64 entry"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_03_REPORT.md`:

```markdown
# BATCH_03_GOLDEN_MASTER_TESTS — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- src/__tests__/golden-master/ created (setup.ts + 2 test files + snapshots + fixtures)
- HANDOVER_GLOBAL §36.64 entry

## Tests delta
- Before: 1174 PASS
- After: <X> PASS (+N golden master tests)

## Verification gate
- [✅/❌] golden-master folder structure complete
- [✅/❌] npm test golden-master: ALL PASS
- [✅/❌] npm test full suite: no regressions
- [✅/❌] grep §36.64: 1 match

## Issues
<none / lista — flag dacă API actual dp.js diferă de assumptions și require adaptation>

## Next batch
BATCH_04_HYGIENE_CLEANUP
```

Stop. Trigger BATCH_04.
