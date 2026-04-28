# isoWeek Implementations Comparison — 2026-04-26 Night

**Scope:** 3 inline implementations of ISO 8601 week calculation in src/engine/

---

## Implementations Found

| # | File | Name | Visibility |
|---|---|---|---|
| 1 | `src/engine/stagnationDetector.js:10` | `isoWeek(ts)` | private (not exported) |
| 2 | `src/engine/autoAggressionDetection.js:19` | `_isoWeek(date)` | exported (testable) |
| 3 | `src/engine/profileTyping.js:20` | `_isoWeekLocal(date)` | private (not exported) |

---

## Side-by-Side Comparison

### Full source

**stagnationDetector.js `isoWeek(ts)`:**
```js
function isoWeek(ts) {
  const d = new Date(ts || Date.now());
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((thursday - startOfWeek1) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
```

**autoAggressionDetection.js `_isoWeek(date)`:**
```js
export function _isoWeek(date) {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((thursday - startOfWeek1) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
```

**profileTyping.js `_isoWeekLocal(date)`:**
```js
function _isoWeekLocal(date) {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((thursday - startOfWeek1) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
```

---

## Attribute Comparison

| Aspect | stagnationDetector | autoAggression | profileTyping | Identical? |
|---|---|---|---|---|
| **ISO 8601 algorithm** | Thursday rule | Thursday rule | Thursday rule | ✅ YES |
| **Input: string date** | `new Date(ts)` — coerces | `typeof === 'string' ? new Date(date)` | same as AA | ⚠️ DIVERGENT (see below) |
| **Input: timestamp (ms)** | `new Date(ts \|\| Date.now())` | `new Date(date)` | `new Date(date)` | ⚠️ DIVERGENT |
| **Input fallback** | `ts \|\| Date.now()` (defaults to now) | No fallback (throws on null/undefined) | No fallback (throws on null/undefined) | ⚠️ DIVERGENT |
| **Thursday calculation** | `d.getDate() - ((d.getDay()+6)%7) + 3` | identical | identical | ✅ YES |
| **Week 1 start** | Jan 4 Monday rule | identical | identical | ✅ YES |
| **Week number arithmetic** | `Math.floor((thu - w1start) / 7d) + 1` | identical | identical | ✅ YES |
| **Return shape** | `'YYYY-WNN'` (2-digit padded) | `'YYYY-WNN'` | `'YYYY-WNN'` | ✅ YES |
| **Exported** | No | Yes (`export function`) | No | ⚠️ DIVERGENT |
| **Year-boundary handling** | Correct (Thursday rule handles cross-year) | Correct | Correct | ✅ YES |

---

## Divergences Explained

### 1. Input handling: string vs timestamp

- **stagnationDetector** receives a **Unix timestamp (ms)** from raw workout logs (`log.ts`). It calls `new Date(ts || Date.now())` — works for timestamps, but would parse an ISO string as NaN for non-numeric strings in older engines (actually `new Date('2026-04-01')` works fine in V8).
- **autoAggressionDetection** and **profileTyping** receive either a **date string ('YYYY-MM-DD')** or a timestamp. The `typeof date === 'string'` branch is redundant (both branches do `new Date(date)`) but harmless — added for code clarity.

**Risk:** If stagnationDetector is ever passed a string date, the `|| Date.now()` fallback would mask the error silently. AA and profileTyping would throw `Invalid Date`.

### 2. Null/undefined fallback

- **stagnationDetector:** `new Date(ts || Date.now())` — if `ts` is null/undefined/0, defaults to current time. **Silent failure mode.**
- **AA and profileTyping:** no fallback. Null input → `new Date(null)` = Jan 1 1970 UTC. **Different silent failure mode** (wrong date rather than current date).

### 3. Export visibility

- Only `_isoWeek` in autoAggressionDetection is exported. The other two are private. This means only AA's implementation is unit-tested (via the test suite).

---

## Logic Identity

The core algorithm is **byte-for-byte identical** across all 3 implementations (lines 2-8 of each):
```
thursday = d - (dayOfWeek adjustment) + 3
jan4 = year Thursday's Jan 4
startOfWeek1 = monday of week containing jan4
week = floor(thu - startOfWeek1 / 7d) + 1
```

No edge case differences in the algorithm itself. The only divergences are in the **input normalization layer**.

---

## Year-Boundary Edge Cases

All 3 implementations correctly handle:
- Dec 28-31 that belong to week 1 of next year (Thursday falls in next year)
- Jan 1-3 that belong to week 52/53 of prior year (Thursday falls in prior year)

This is correct ISO 8601 behavior. No divergence here.

---

## Recommendation

### Extract to `src/util/isoWeek.js` — **RECOMMENDED**

**Rationale:**
1. 3 identical-algorithm copies = maintenance risk (if algorithm needs to change, 3 places to update)
2. Only one copy is tested (AA module's `_isoWeek`) — extracting to utility makes it independently testable
3. stagnationDetector's input handling differs subtly (timestamp vs string) — extraction forces a single canonical signature
4. Profile Typing will not be the last module needing ISO weeks (intervention layer, reconciliation trigger, etc.)

**Recommended signature:**
```js
// src/util/isoWeek.js
export function isoWeek(date) {
  // Accepts: ISO date string 'YYYY-MM-DD', Unix timestamp (ms), or Date object
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) throw new Error(`isoWeek: invalid date input: ${date}`);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((thursday - startOfWeek1) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
```

**Callers to update:**
- `stagnationDetector.js`: replace `isoWeek(ts)` with `import { isoWeek } from '../util/isoWeek.js'`
- `autoAggressionDetection.js`: replace `_isoWeek` with imported utility (remove export of private helper)
- `profileTyping.js`: replace `_isoWeekLocal` with imported utility

**Estimated refactor effort:** 30-45 min Sonnet (3 files, 1 new util file, 1 test update — AA tests currently import `_isoWeek` directly).

**Caveat:** AA tests import `_isoWeek` directly for unit testing. After extraction, this test should import from the utility. The utility itself becomes the testable unit. This is a mild breaking change to the test structure.

### Alternative: Keep inline — NOT recommended

Arguments for keeping inline:
- Zero migration risk
- Each module is self-contained (no shared dep failure mode)
- Algorithm is stable, 3-copies overhead is low in practice

Counter-arguments:
- Refactor debt will grow (4th module → 4th copy)
- The divergent null handling in stagnationDetector is a latent bug
- Test coverage gap (2 of 3 copies untested)

**Verdict: Extract. Do it as part of the AA Detection integration task (next major task) to amortize the refactor cost.**

---

*Audit completed: 2026-04-27. Reviewed: 3 files. Algorithm: identical. Input handling: divergent (low risk). Export: inconsistent. Recommendation: extract to shared utility.*
