## Task 2 — Auth Phase 2 batch 1 (§56.1.4 + §56.16)
**Model:** Opus
**Status:** Complete

### Pre-flight per task
- Backup tag global: `pre-batch-overnight-2026-05-05-evening` ✅
- Clean tree pre-task: yes (post TASK 1 commits clean)
- Hooks: normal — full `npm run test:run` PASS

### Sub-task 2A — IndexedDB namespace per UID (§56.1.4 Dexie multi-DB)

**Files modified (3):**
- `src/storage/db.js` — DB_NAME_PREFIX flipped `'salafull'` → `'andura'` (now exported); `getNamespace()` resolution order updated per §56.1.4 LOCKED V1: (1) Firebase Auth uid → `<uid>`, (2) Anonymous mode → `anonymous_<deviceId>` from localStorage 'device-id', (3) Legacy fallback to `getUserConfig()?.firebase?.userPath` for tests + Daniel pre-Beta migration source. JSDoc header rewritten to document new namespace pattern + brand rename note.
- `src/storage/__tests__/db.test.js` — `DEFAULT_DB_NAME` constant updated `'salafull_users_daniel'` → `'andura_users_daniel'`
- `src/storage/__tests__/tieredRead.test.js` — same constant update

**Files created (2):**
- `src/storage/migrateAnonymousToAuth.js` (170 LOC) — exports `async migrateAnonymousToAuth({ anonymousUuid, authUid })` per §56.1.4 LOCKED V1. Pattern: open source `andura_anonymous_<deviceId>` + bulk read 3 stores (CDL_TIER1, LOGS_TIER1, APPLIED_PATTERNS_TIER1) → bulk write target `andura_<uid>` (bulkPut upsert) → verify counts → audit log în `migration_events` store target → close + delete source DB. Idempotent: re-run safe (Dexie.exists short-circuit if source absent). Failure: target preserved, source NU deleted, partial status logged.
- `src/storage/__tests__/migrateAnonymousToAuth.test.js` (5 tests, 64ms) — args validation throw, noop on absent source, clean migration source→target+delete, idempotency double-run, target preservation when re-run over existing data.

**Schema bump status:** SCHEMA_VERSION preserved at 1. NU bump needed — same 4 stores (cdl_tier1, logs_tier1, applied_patterns_tier1, migration_events), only DB name prefix renamed + namespace resolution upgraded.

**Brand rename impact:** Daniel's pre-Beta personal IndexedDB `salafull_users_daniel` becomes orphan post-rename. Harmless given data also exists in localStorage Tier 0 + Firebase RTDB; no Tier 1-only data lost. Documented în `db.js` header comment.

### Sub-task 2B — Firestore Security Rules per-UID strict V1 (§56.16)

**File created (1):**
- `firestore.rules` — verbatim from ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 §56.16 LOCKED V1. Rules cover: `users/{uid}` per-UID strict + subcollections inherit + `_deleted/{uid}` (§56.5 Account Lifecycle 2-step ȘTERGE 30 zile grace) + `_archived/{uid}/{docId}` (§56.7 Anonymous→Auth Merge archive 7 zile) + `_telemetry/global` (§56.15 FieldValue.increment Spark compatible, write-only authenticated, read forbidden client-side).

**⚠ DANIEL MANUAL STEP REQUIRED:** rules file in repo = SSOT spec. Daniel must publish manually via Firebase Console (Project Settings → Firestore Database → Rules → paste content + Publish) per §56.16 + §56.18 Daniel manual prep step (~1h Daniel-time post-CC code generation).

**Tests skipped:** `@firebase/rules-unit-testing` NU declared în `package.json` deps. Per master prompt fallback: skip rules tests, defer infra setup separate finding tracker entry.

### Build + Tests
- `npx vitest run src/storage` → **5 files / 57 tests / all PASS** (~1.4s) — includes 5 NEW migration tests + 17 existing db tests + 8 tieredRead + 23 tieringEngine + 4 tier2Stub
- Pre-commit hook: full `npm run test:run` PASS — zero regression on 1218+ baseline tests

### Commits
- `f9ee75d` feat(auth-phase2-batch1): §56.1.4 IndexedDB per-UID Dexie multi-DB (DB_NAME_PREFIX salafull→andura + namespace from auth.uid + anonymous-to-auth migration helper) + §56.16 Firestore Security Rules per-UID strict V1 — Daniel manual Console publish required

### Pushed
- origin/main: deferred until end-of-batch

### Issues
- None blocking. Rules unit testing deferred per dep absence (separate finding tracker entry could be created post-batch).

### Supersedes / pattern existing salafull → andura DB_NAME_PREFIX documented
- `DB_NAME_PREFIX` constant flipped + now `export`ed (was `const` private). Migration helper imports it for source/target name building.
- `getNamespace()` resolution upgraded; legacy `getUserConfig().firebase.userPath` fallback preserved at lowest priority for backward-compat tests + Daniel pre-Beta migration source.
- Existing `getAuthState()` import added to `db.js` (auth.js already exports it).

### Migration helper signature
```js
async migrateAnonymousToAuth({ anonymousUuid: string, authUid: string }):
  Promise<{
    stores_migrated: Record<string, number>,
    total_records: number,
    source_db: string,
    target_db: string,
    status: 'success' | 'partial' | 'noop',
    started_at: string,
    completed_at: string,
  }>
```

### Integration smoke test result
- Smoke covered via 5 unit tests în `migrateAnonymousToAuth.test.js`: args throw, noop, clean source→target migration with bulk read+write+delete, idempotency double-run, target preservation on re-run.

### Next action (TASK 3 starts immediately)

- TASK 3 — ADR 026 compile draft full ~129 decisions aggregate
- Daniel post-batch: publish `firestore.rules` manually via Firebase Console (~1h Daniel-time per §56.18). NO production effect until that step.
