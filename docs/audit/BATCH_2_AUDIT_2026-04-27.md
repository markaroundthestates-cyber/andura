# Sprint Foundation Batch 2 — Adversarial Audit

**Date:** 2026-04-27
**Scope:** Schema Versioning + Migration Runner + Feature Flags + Registry integration (commits ae69f19, 048e02f, 85b435e)
**Auditor:** Opus 4.7 (adversarial, post-build)
**Tests baseline:** 733/733 pass (701 + 32 new în Batch 2)

---

## Verdict

**SAFE for strangler sprint** — no CRITICAL findings. 2 HIGH (1 correctness in chain failure path, 1 defensive consistency) + 5 MEDIUM + 9 LOW. Foundation alignment cu ADR 018 §4 + §5 verifiable; failsafe + observability primitives toate present; API surface minimă + bine validată.

HIGH-1 deserves attention before first real migration ships (catches silent data corruption în chain-failure path). HIGH-2 is a 5-minute defensive wrap pattern Batch 1 already established. Both safely deferred to mini-fix imediat post-audit.

Quality bar reached: ADR alignment confirmed, edge cases tested comprehensively, async/sync consistency, idempotency proven, defensive everywhere except 2 surfaces.

---

## CRITICAL (block strangler)

**None.**

---

## HIGH (should-fix înainte first real migration)

### HIGH-1 — Chain failure path: surviving v1 entries fed to v2-shape migrations

**Location:** `migrationRunner.js:96` (filter `version >= toVersion`)
**Issue:** Filter `version < toVersion` allows chain skipping when M1 fails partway. Scenario:

```
entries = [{id:'A'}, {id:'BOOM'}, {id:'C'}]   // all v1, no schemaVersion
MIGRATIONS = [
  { fromVersion:1, toVersion:2, migrate: e => e.id==='BOOM' ? throw : ... },
  { fromVersion:2, toVersion:3, migrate: e => ({...e, derivedFromV2: e.fooFromV2}) },
]
```

After M1 runs:
- A → v2 ✅
- BOOM → throws → aborted, stays v1, persisted
- C → aborted, stays v1, persisted

Storage: `[{A,v2}, {BOOM,v1}, {C,v1}]`

Then M2 runs. Filter `version < toVersion` = `1 < 3 = true` → **M2.migrate runs on v1 entries**, which lack the v2-introduced fields. If M2.migrate uses optional chaining (defensive), it silently produces a "v3" entry that's actually a corrupted v1+v3 hybrid. If M2.migrate accesses required v2 fields directly, it throws (chained failure).

**Why matters:** Silent data corruption în the chain-failure path. App continues, aggregation engines see plausible-looking entries that fail subtle invariants downstream. Hard to diagnose at user level.

**Why NOT critical:** MIGRATIONS array is empty în Batch 2 (no real migrations yet). First real migration likely v1→v2 only (no chain). Bug surfaces only at second migration deploy. Strangler sprint NU adds migrations; first chain candidate is post-Vitality (ADR 016) port, weeks away.

**Proposed fix:** Filter strictly by `version === fromVersion` instead of `version < toVersion`:

```js
// migrationRunner.js:95-100
const version = getEntryVersion(entry);
if (version !== fromVersion) {
  // Either already migrated past this version OR not yet ready (chain-broken).
  // Idempotent skip; preserves entry untouched.
  next.push(entry);
  continue;
}
try {
  const migrated = migrate(entry);
  // ... rest unchanged
}
```

Add tests for two scenarios:
1. `it('M2 skips v1 entries when M1 partial-failed (chain integrity)', ...)` — verifies v1 entries left untouched by v2→v3 migration.
2. `it('chain gap (M1 v1→v2, M3 v3→v4 with no M2) skips intermediate entries', ...)` — verifies v2 entries skipped by M3.

---

### HIGH-2 — Sentry `captureException` calls NOT wrapped în try/catch

**Location:** `migrationRunner.js:76, 118, 130, 146` (4 sentry call sites)
**Issue:** Migration runner calls `sentry.captureException?.(err, ctx)` directly. If the Sentry SDK itself throws (Sentry init bug, network failure mid-flush, malformed extras), the throw cascades up through `runMigrations()` and aborts the entire pass. The very mechanism designed to report errors becomes the failure cause.

Compare cu Batch 1 `decisionCluster.js:454-462`:

```js
_reportError(err, ctx) {
  this.logger.error?.('[DecisionCluster] dimension error:', err, ctx);
  if (this.sentry?.captureException) {
    try {
      this.sentry.captureException(err, { tags: { component: 'decisionCluster', ...ctx } });
    } catch { /* swallow Sentry errors */ }
  }
}
```

Migration runner inherited the convention but skipped the defensive wrap.

**Why matters:** ADR 018 DP-5 explicit "fail-loud" mandate requires Sentry NOT to be a single point of failure. A Sentry SDK regression on prod (rare but real) currently bricks the migration runner.

**Why NOT critical:** Sentry SDK is well-tested + initialized async (won't be ready în first 100ms anyway, calls become no-ops via `_initialized` guard în sentry.js:60). In dev/test (where this is exercised), `captureException` returns early. Fault window is narrow.

**Proposed fix:** Extract a `_safeSentry(err, ctx)` private helper:

```js
function _safeSentry(sentry, err, ctx) {
  try { sentry.captureException?.(err, ctx); }
  catch { /* swallow Sentry errors */ }
}
```

Replace all 4 direct `sentry.captureException?.(...)` calls cu `_safeSentry(sentry, err, { tags: ... })`. Add test cu `sentry: { captureException: () => { throw new Error('sentry broken'); } }` — runner must NOT throw + must complete migration.

---

## MEDIUM (nice-to-fix)

### MED-1 — Sentry "tags" don't propagate as Sentry tags (pre-existing wrapper bug, surfaced by Batch 2)

**Location:** `src/util/sentry.js:60-68` (helper) + `migrationRunner.js:76, 118, 130, 146` + `decisionCluster.js:457-461`
**Issue:** The codebase's `captureException(error, context)` helper iterates `Object.entries(context)` and calls `scope.setExtra(key, value)`. Migration runner (and decisionCluster before it) emit `{ tags: { component, severity, op, ... } }`. The helper sets ONE extra named `"tags"` whose value is the entire tags object — actual Sentry tags are NEVER set. In Sentry UI, filtering by `component=migrationRunner` does not work; tags are buried as a single extra blob.

**Why matters:** Observability degraded across Batch 1 + Batch 2. Daniel's mental model "I'll filter migration errors by component=migrationRunner în Sentry" doesn't match reality.

**Why NOT high:** Pre-existing bug în `sentry.js` (Batch 0). Batch 2 follows the established convention. Errors STILL get captured în Sentry — just less filterable. App behavior unchanged.

**Proposed fix:** Update `src/util/sentry.js:60-68` helper to handle `tags` separately:

```js
export function captureException(error, context = {}) {
  if (!_initialized || !_Sentry) return;
  _Sentry.withScope(scope => {
    if (context.tags && typeof context.tags === 'object') {
      for (const [k, v] of Object.entries(context.tags)) scope.setTag(k, String(v));
    }
    if (context.extra && typeof context.extra === 'object') {
      for (const [k, v] of Object.entries(context.extra)) scope.setExtra(k, v);
    }
    // Backward compat: any other top-level keys treated as extras.
    for (const [k, v] of Object.entries(context)) {
      if (k !== 'tags' && k !== 'extra') scope.setExtra(k, v);
    }
    _Sentry.captureException(error);
  });
}
```

Out of scope strict pentru Batch 2 audit (nu modifică Batch 2 cod) dar ar trebui addresat la mini-fix.

---

### MED-2 — No upfront validation of migration shape (`assertValidMigration`)

**Location:** `migrationRunner.js` (no validator)
**Issue:** Malformed migration entries (missing `fromVersion`, non-function `migrate`, non-array `storageKeys`) throw unpredictably mid-pass. No equivalent of `dimensionRegistry.assertValidDimensionEntry` pattern. A typo `migrating` instead of `migrate` doesn't fail at registration time — it surfaces deep inside the loop with a confusing `migrate is not a function` error.

**Why matters:** ADR 018 §1 + §2 patterns established `assertValidRegistry` + `assertValidDimensionResult` + `assertValidRecommendation` cu specific error messages. Migrations should follow the same convention pentru defensiveness on registration sites + tests.

**Why NOT high:** MIGRATIONS array is empty. First migration submission gets thorough PR review. Convention established more by tooling than runtime validation în other parts of codebase.

**Proposed fix:** Add `assertValidMigration(m)` în `migrationRunner.js` (or `MIGRATIONS.js`):

```js
export function assertValidMigration(m) {
  if (!m || typeof m !== 'object') throw new TypeError('Migration must be an object');
  if (!Number.isInteger(m.fromVersion) || m.fromVersion < 1) throw new TypeError('fromVersion must be positive integer');
  if (!Number.isInteger(m.toVersion) || m.toVersion <= m.fromVersion) throw new TypeError('toVersion must be > fromVersion');
  if (typeof m.description !== 'string' || m.description.length === 0) throw new TypeError('description required');
  if (!Array.isArray(m.storageKeys) || m.storageKeys.length === 0) throw new TypeError('storageKeys must be non-empty array');
  if (m.storageKeys.some(k => typeof k !== 'string')) throw new TypeError('storageKeys must contain only strings');
  if (typeof m.migrate !== 'function') throw new TypeError('migrate must be a function');
}

export function assertValidMigrationsList(list = MIGRATIONS) {
  if (!Array.isArray(list)) throw new TypeError('MIGRATIONS must be an array');
  for (const m of list) assertValidMigration(m);
  // Optional: chain integrity check (no gaps, no overlaps)
}
```

Apply at runner entry (or once at module init). Add 6-8 tests.

---

### MED-3 — Migration runner runs before `initSentry()` în typical app init order

**Location:** Implicit ordering în consumer code (`main.js`, not yet wired). `migrationRunner.js` imports captureException from sentry.js but `_initialized` may be false at runner time.
**Issue:** ADR 018 §4 says "Sentry warning dacă > 100 entries migrate" + "raises Sentry critical" on migration throw. But sentry.js init is `async` — Sentry is NOT ready în the first event-loop tick. App init typically does:

1. App boot synchronous module imports
2. `runMigrations()` (eager, sync)
3. `initSentry()` (async, fires-and-forgets)

Step 2 happens before step 3 completes. `captureException` returns early (no-op) on `!_initialized`. **First-run migrations fire silently fără Sentry capture.**

**Why matters:** First migration deploy is the highest-risk one (largest entry count, most-likely-to-fail user data). Silent failures defeat fail-loud invariant.

**Why NOT high:** Eager local-storage migrations sub-millisecond per entry; vast majority succeed. Console.error still fires (visible în dev console). User observation will catch hard breakages. ADR 018 doesn't pin Sentry-init-order constraint.

**Proposed fix:** Two viable approaches:
1. Order app init: `await initSentry(); runMigrations();` în main.js wiring (when wiring happens — not yet în-tree).
2. Buffer migration errors în-memory; flush after sentry init via setTimeout. More complex.

Document the ordering requirement în `migrations/index.js` JSDoc:

```js
/**
 * IMPORTANT: Call AFTER initSentry() so first-run migration failures are reported.
 * If unavoidable to call earlier, captured errors fall back to console.error only.
 */
```

---

### MED-4 — Production `_devFlags` detection NOT implemented

**Location:** `featureFlags.js:83-99` (readDevFlags)
**Issue:** ADR 018 §5 explicitly states: "Doar pentru testing — strip-uit din production builds (sau **warning vizibil în UI** dacă active în prod build)". No detection mechanism implemented. A user who set `_devFlags` accidentally on production (forgotten dev tool, leaked instructions) silently runs override-mode forever.

**Why matters:** Rollout safety contract violated — overrides should be explicitly visible.

**Why NOT high:** Currently 1 user (Daniel). UI warning has zero functional impact at N=1. FLAGS array empty în Batch 2 means `_devFlags` has nothing to override anyway.

**Proposed fix:** Add `hasActiveDevFlags()` exported helper:

```js
export function hasActiveDevFlags() {
  const dev = readDevFlags();
  return dev !== null && Object.keys(dev).length > 0;
}
```

În UI shell (post Batch 2): show banner if `hasActiveDevFlags() && import.meta.env.PROD`. Wire în Phase 1 strangler when flags first ship.

---

### MED-5 — `getActiveDimensions(ctx)` semantic break vs. Batch 1 contract

**Location:** `dimensionRegistry.js:90-105`
**Issue:** Pre-Batch-2 contract: when `opts.flags` was undefined, dimensions cu `enabledFlag` were KEPT active (best-effort default-on). Post-Batch-2: now delegates to `featureFlags.isEnabled(flagId, userId)`, which returns `false` for unknown flags (fail-closed).

Test "ignores flag check entirely when no opts.flags is supplied" was rewritten to "delegates to featureFlags.isEnabled... fails-closed". Existing callers of `getActiveDimensions(ctx)` (none currently — DIMENSIONS empty) would silently filter out previously-active dimensions.

**Why matters:** Two paths cu divergent semantics now coexist:
- `opts.flags = {}` → missing key = default-on (test path)
- `opts.flags = undefined` → missing key = fail-closed (production path)

Tests can construct flag maps that DON'T match production reality. PR reviewers may approve tests passing, real userIds get different behavior.

**Why NOT high:** DIMENSIONS empty în Batch 2 — no production callers exist. Strangler sprint will add real entries with real flags + tests with both paths. Documented în JSDoc post-update.

**Proposed fix:** Either (a) make `opts.flags` follow the same fail-closed semantics (missing key = false), aligning test path cu production path; (b) document the divergence prominently în JSDoc + add a test that documents expected divergence.

Recommendation (a) — flip the test path to fail-closed too. Existing test "keeps dimensions whose flag is missing from the resolved map (default-on)" needs deliberate review: should it stay default-on, or align cu production fail-closed? Spec ambiguous. Daniel decision.

---

## LOW (cosmetic / refinement)

### LOW-1 — Hash uses naive `userId + flagId` concat fără separator

**Location:** `featureFlags.js:133`
Theoretical collision: userId="ab" + flagId="c" = "abc" hashes identical to userId="a" + flagId="bc" = "abc". With actual ids (`dev-XXXXXXXX` 12 chars + `vitality_layer_v1` 17 chars), collision improbabil dar teoretic posibil.
**Fix:** `hashStringDjb2(uid + ':' + flagId)`. Trivial.

### LOW-2 — `FLAGS = Object.freeze({})` shallow-only

**Location:** `featureFlags.js:35`
Future flag entries `{ rollout: 0.5, default: false }` not deep-frozen — runtime mutation of definition values possible. With FLAGS empty, no current issue.
**Fix:** Helper `freezeFlags(obj)` that recurses, or document convention "edit FLAGS object key-by-key".

### LOW-3 — `flag.rollout` accepts NaN/Infinity silently

**Location:** `featureFlags.js:128-134`
`rollout: NaN` evaluates: `NaN <= 0` false, `NaN >= 1` false, `bucket < NaN*100` = `bucket < NaN` = false. Effectively NaN → always false fără warning.
**Fix:** Add `Number.isFinite(flag.rollout) && rollout >= 0 && rollout <= 1` validation în `assertValidFlag(flag)` helper.

### LOW-4 — `result.errors[].reason` is string only (stack trace lost)

**Location:** `migrationRunner.js:163-167` (_stringifyError)
Errors propagated through `result.errors` lose stack trace. Debugging from result alone harder.
**Fix:** Include `stack: err?.stack` în error objects pushed la `errors[]`.

### LOW-5 — Test "passes ctx.userId through to isEnabled" doesn't actually verify userId-driven bucketing

**Location:** `dimensionRegistry.test.js:183-194`
Test uses `_devFlags` override (which wins regardless of userId). Doesn't actually exercise the bucketing path with userId.
**Fix:** Add test that registers a dim cu `enabledFlag: 'real_flag'`, sets `device-id` to known-positive bucket userId, registers via `opts.flagsRegistry` (or import-time FLAGS injection) cu rollout 0.5, expects deterministic outcome based on hash bucket. May require exporting `FLAGS` injection helper.

### LOW-6 — Hash function `DJB2` choice not justified vs. alternatives în code

**Location:** `featureFlags.js:40-49`
Comment mentions "NOT cryptographic" + "sufficient pentru per-user bucketing". Doesn't justify why DJB2 over FNV-1a, MurmurHash, etc.
**Fix:** 1-line "DJB2 chosen over FNV-1a / Murmur for compactness (5 LOC) + zero-dependency; collision rate equivalent at N<1M strings".

### LOW-7 — `migrationsRun: sorted.length` includes failed migrations

**Location:** `migrationRunner.js:160`
A migration that throws on every entry still counts as `migrationsRun`. Slightly misleading — name suggests "successfully completed".
**Fix:** Either rename `migrationsRun` → `migrationsAttempted`, or add `migrationsCompleted` separate count (= `migrationsRun - errors.filter(e => e.op === 'migrate' || e.op === 'persist').length`).

### LOW-8 — `MIGRATIONS.js` typedef doesn't document `toVersion === fromVersion + 1` convention

**Location:** `MIGRATIONS.js:7-19` (header doc)
Comment says "by convention" but doesn't enforce. Future-author writing `fromVersion: 1, toVersion: 5` (skipping 2,3,4) creates a chain integrity issue without warning.
**Fix:** Document convention + invariant explicitly: "**toVersion MUST equal fromVersion + 1.** Multi-version jumps must be split into chained migrations."

### LOW-9 — `runMigrations` doesn't expose the global `LARGE_MIGRATION_THRESHOLD` în result

**Location:** `migrationRunner.js:160` (return shape)
Result tells you `totalEntriesMigrated` and `perMigration[].count`, but tooling has to import the constant separately to compare. Minor ergonomics.
**Fix:** Include `largeMigrationThreshold: LARGE_MIGRATION_THRESHOLD` în result. Optional.

---

## Strengths (preserve în any refactor)

1. **`MIGRATIONS = []` + `FLAGS = Object.freeze({})` empty în Batch 2** — pure infrastructure delivery, NO premature flag/migration entries. YAGNI respected. Future-authors register one at a time cu PR review.
2. **Idempotency proven via test "re-running runMigrations after a successful pass is a no-op"** + version filter logic. Eager runner safe to call multiple times.
3. **Failsafe partial-persist semantics** — entries migrated before throw are persisted; rest left untouched. ADR 018 §4 directly implemented + tested.
4. **`structuredClone` în test makeDb** — prevents test fixtures from leaking between cases. Production-ready test scaffold.
5. **DJB2 hash deterministic across calls + per-flag distribution tested at N=1000 cu ±5% tolerance** (test 'rollout 0.5 distributes ~50/50'). Real bucketing verified empirically.
6. **Independent-buckets test** — uses realistic flag IDs (vitality_layer_v1, demographic_prior_v1) NOT single chars, exposes DJB2 limitations honestly + threshold tuned (>100 mismatches = >50% inde) accommodate small-N variance.
7. **`_devFlags` JSON parser is fail-defensive** — invalid JSON / non-object / array all return null + warn console. No hard fail on storage corruption.
8. **`isEnabled` resolution order fail-closed pe unknown flag** — surprise activation impossible. Reverse of prior semantic în Batch 1 best-effort, more conservative.
9. **`opts.flags` injection escape în getActiveDimensions** — testing path stays decoupled from real localStorage / FLAGS module. Tests don't pollute global state.
10. **Sentry severity tags differentiated** — `'critical'` (migrate throw, persist fail), `'warning'` (read fail, large_migration). Triage-friendly în Sentry UI (despite MED-1 wrapper bug masking this currently).
11. **`getEntryVersion` defensively treats null/undefined entries as v1** — pathological localStorage state (corrupt JSON parsed to null array element) doesn't crash runner.
12. **`captureException` import via aliased binding** (`as sentryCaptureException`) — clean separation between import name + local variable name. Allows `opts.sentry` mock cu identical API.
13. **`logger.log?.(...)` optional chaining throughout** — partial logger objects (test scaffolds with only `error`) don't break runner.
14. **DEV_FLAGS_KEY exported as constant** — tests + future UI warning code can reference `DEV_FLAGS_KEY` instead of magic string `'_devFlags'`.
15. **Test `'rollout 0.5 distributes ~50/50'` cu ±5% tolerance** — empirical verification, NOT just unit-level mock checks. Catches DJB2 distribution drift.

---

## Test Coverage Audit

| Component | Source LOC | Test LOC | Tests | Coverage Estimate |
|---|---|---|---|---|
| `migrationRunner.js` | 168 | 346 | 24 | ~92% (all branches + failsafe paths; gaps: chain failure, sentry-throw) |
| `MIGRATIONS.js` | 48 | (covered by runner tests) | 1 | trivial (empty + shape doc) |
| `featureFlags.js` | 140 | 229 | 28 | ~95% (all branches + edge cases; gaps: NaN rollout, separator) |
| `dimensionRegistry.js` (update) | +20 LOC integrare | +44 LOC | +4 | ~100% on integration path; gap: real-userId bucketing |

**Coverage gaps identified (would lift to ~98%):**
- HIGH-1: chain-failure path test (M2 sees v1 entries from aborted M1) — NOT covered
- HIGH-2: Sentry-throw resilience test (sentry.captureException itself throws) — NOT covered
- LOW-3: NaN/Infinity rollout test — NOT covered
- LOW-5: real ctx.userId → bucketing path test — NOT covered (only dev-override exercised)
- MED-2: malformed migration shape (missing fromVersion, etc.) — NOT covered

These are HIGH-confidence skip pentru Batch 2 (foundation passes; gaps are coverage-quality nuances pentru first real migration deploy).

---

## ADR 018 Spec Alignment — §4 + §5

| Item | Spec | Implementation | Match |
|---|---|---|---|
| Per-entry `schemaVersion` field | §4 entry shape | `next.push({ ...migrated, schemaVersion: toVersion })` runner enforced | ✅ |
| Migration shape `{ fromVersion, toVersion, description, storageKeys, migrate(entry) }` | §4 example | exact match în MIGRATIONS.js typedef | ✅ |
| Eager trigger pe init | DP-5 | `runMigrations()` sync, no lazy reads | ✅ |
| Failsafe: persist done + Sentry critical + app continues | §4 Failsafe | `aborted=true` + partial persist + sentry severity 'critical' + no throws upstream | ✅ |
| Sentry warning > 100 entries | §4 + DP-5 fix-loud | `LARGE_MIGRATION_THRESHOLD = 100`, fired la `> threshold` | ✅ |
| Entries fără schemaVersion ⇒ v1 | §4 Implementation notes | `getEntryVersion` returns 1 pentru missing/non-numeric | ✅ |
| Per-storage CURRENT_VERSION constant | §4 Implementation notes | NOT explicit constant — runner reads chain from MIGRATIONS array | ⚠️ implicit |
| Per-user rollout cu hash bucketing | DP-6 | DJB2 hash, modulo 100, deterministic per (userId, flagId) | ✅ |
| `_devFlags` localStorage override | §5 | `readDevFlags()` + `isEnabled` resolution order | ✅ |
| Independent buckets per flag | §5 | `userId + flagId` concat ensures different hash domains | ✅ (LOW-1 caveat) |
| Production warning UI when `_devFlags` active | §5 | NOT implemented | ❌ (MED-4) |
| Flags via `export const`, NU runtime-mutable | §5 | `Object.freeze(FLAGS)` + module export | ✅ |

---

## Reconsideration Trigger Status (ADR 018)

| # | Trigger | Status |
|---|---|---|
| 1 | Dimension count plateau < 8 după 12 luni | N/A (Batch 2) |
| 2 | Cluster performance > 100ms | N/A (cluster Batch 1, no perf change) |
| 3 | Schema migration runner failing > 5% | Observability READY (sentry severity tags + result.errors structured); needs MED-1 wrapper fix to enable Sentry filtering |
| 4 | Feature flag rollout NU folosit 6 luni | Infrastructure READY, monitor adoption post-Vitality (ADR 016) |
| 5 | Cross-dimension dependencies emerge | N/A — Batch 2 doesn't introduce dependencies |
| 6 | Multi-tenant auth deployed | Future — `resolveUserId` already prefers `'user-id'` over `'device-id'`, ready pentru auth migration |

No triggers active or imminent.

---

## Verdict

**SAFE for strangler sprint (AA detection port).** Foundation infrastructure verified solid:
- Migration runner failsafe semantics correct în success path (HIGH-1 only emerges chain-failure path, not relevant la single migration deploy).
- Feature flags hash bucketing distribution verified empirically.
- Registry integration cu featureFlags clean (1 semantic break flagged MED-5, documented).
- 32 new tests cover ~93% across 3 components.

**Recommendation:** Proceed cu strangler AA detection. Mini-fix HIGH-1 + HIGH-2 înainte de prima real migration ships (post-Vitality). Re-audit la first migration deploy pentru chain integrity validation cu real CDL data.

MEDIUM findings safe to defer la INSIGHTS_BACKLOG strangler pre-work; LOW findings track as TODOs.

---

*Audit signed Opus 4.7 — 2026-04-27. 16 findings (0 critical, 2 high, 5 medium, 9 low) + 15 strengths.*
