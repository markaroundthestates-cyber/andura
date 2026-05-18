# §12 — Data Integrity / Migration Audit

**Scope:** Dexie schema versions + Tier 0/1/2 transitions + IndexedDB quota + Firebase backup + rollback + schema 657 invariant + cross-tab lock + backwards-compat + append-only CDL + last-write-wins + corruption recovery + atomicity + serialization round-trip

## Severity matrix §12

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 3 |
| MED | 5 |
| LOW | 2 (positive) |
| NIT | 0 |
| **Total** | **12** |

---

## CRITICAL findings

### §12-C1 — Dexie version 1 (single version) — NO migration path validated yet
**Severity:** CRITICAL (§12.1 + §12.13)
**Evidence:** `src/react/lib/dexieMigration.ts:27` `this.version(1).stores({ sessions: '++id, ts, archivedAt' })`. Single version → no migration tested. Any future schema change requires `.version(2).stores({...}).upgrade(tx => {...})` — never exercised in CI.
**Karpathy:** Goal-Driven — pre-Beta safe (only Daniel + 50 testers); post-Beta scale = schema evolution mandatory.
**Fix log:** Add example v1→v2 migration test in unit tests. Document migration policy in `08-workflows/dexie-migration-policy.md`.

### §12-C2 — IndexedDB quota handling overflow strategy ABSENT in user-facing flow
**Severity:** CRITICAL (§12.3 + §4.11)
**Evidence:** Grep `QuotaExceededError|navigator.storage` returns ZERO hits in src/. Dexie write errors will surface as exceptions catch'd by engineWrappers console.warn (§1-C2) — user sees nothing. Long-tail Tier 1 (90 days) + Tier 2 (>90 days local cache) accumulates.
**Karpathy:** Think Before Coding.
**Reasoning:**
- Browser IDB quota varies 50MB-2GB per origin.
- User accumulates ~1MB / month sessions (estimated).
- 24 months ≈ 24MB — well within quota. BUT photo storage (`'photos'` in SYNC_KEYS firebase.js comment "base64 too large for Firebase RTDB free tier — stored locally only") could push to limit.
- On quota exceed: writes silently fail → user logs session → app appears to save → reload, session gone → trust broken.
**Fix log:**
- Wrap critical Dexie writes in try/catch for `QuotaExceededError` (DOMException name='QuotaExceededError').
- Surface UX banner: "Spatiu plin local. Arhiveaza data veche sau sterge fotografii." → routes to SettingsExport / SettingsDanger.
- Use `navigator.storage.estimate()` for proactive monitoring → warn at 80% capacity.

---

## HIGH findings

### §12-H1 — Tier 0 `wv2-*` localStorage keys + Tier 1 Dexie + Tier 2 Firebase chain — transition timing UNVERIFIED
**Severity:** HIGH (§12.2 + §35)
**Evidence:** Per §35.1-§35.4 Tier 0 = last 24h localStorage; Tier 1 = last 90 days Dexie; Tier 2 = archive Firebase. Transition timing (when promote/archive) — not seen in audit pass. dexieMigration.ts comments "Workout store sessionsHistory rămâne Tier 1 localStorage primary (zustand persist); Dexie = additive Tier 2 archive pentru sessions older than threshold (Phase 6+ scheduled migration)." → terminology drift vs spec (spec says Tier 1 = Dexie, Tier 2 = Firebase; code says localStorage = Tier 1, Dexie = Tier 2). Need clarify.
**Fix log:** Align dexieMigration.ts comment with §35 spec OR vice versa. Document promotion schedule.

### §12-H2 — Append-only CDL invariant NOT VERIFIED enforced (mutation possible via JS)
**Severity:** HIGH (§12.10 + §4.13)
**Evidence:** `src/util/coachDecisionLog.js` exists (NOT inspected this pass). Per ADR 011 LOCKED V1 append-only invariant. JS world has no language-level immutability; runtime enforcement via wrapper that only allows `.push()` not `.splice()`/`.pop()`.
**Fix log:** Read coachDecisionLog.js secondary pass; verify mutation-blocking wrapper. Add invariant test.

### §12-H3 — Cross-tab IndexedDB lock handling NOT VERIFIED
**Severity:** HIGH (§12.8 + §14)
**Evidence:** Zustand persist via localStorage → cross-tab `storage` event for sync. Dexie writes share same DB across tabs. If user has 2 tabs open + writes simultaneously → IDB transaction queue (Dexie handles internally). Last-write-wins resolution (§12.11) UNVERIFIED documented behavior.
**Fix log:** Document cross-tab policy. Test scenario: 2 tabs, log set in tab A, log different set in tab B simultaneously → expected merge behavior.

---

## MED findings

### §12-M1 — `src/react/lib/dexieMigration.ts` jsdom fallback "fail-silent returns empty array" — test environment behavior documented
**Severity:** MED (§12.12 corruption recovery)
**Evidence:** dexieMigration.ts comment lines 14-15. Fail-silent acceptable for tests; verify production behavior on real corruption.

### §12-M2 — Backup integrity Firebase tier — backup schedule documented? (§12.4 + §26.4)
**Severity:** MED (covered §26)

### §12-M3 — Rollback safety on migration fail (§12.5)
**Severity:** MED (depends §12-C1 migration policy)

### §12-M4 — Schema 657 exercises invariant preserved — see §39 deep
**Severity:** MED — covered §39

### §12-M5 — Tier 0 wv2-* localStorage NU breaking change verify (§12.6)
**Severity:** MED
**Evidence:** Vanilla legacy + React both read `wv2-*` keys (per workoutStore.ts comments + db.js). Schema change to wv2-* keys would break vanilla legacy users (rollback path) — accepted risk per D028 PROC LOCKED V1 PERMANENT.

---

## LOW (POSITIVE)

### §12-L1 — Dexie + fake-indexeddb deps installed for testing ✓
**Resolution:** Test infrastructure ready.

### §12-L2 — CDL Append-only architectural primitive documented ADR 011 ✓
**Resolution:** Architecture sound; runtime enforcement §12-H2.

## Coverage map §12.x sub-checklist condensed

| Sub | Severity |
|-----|----------|
| 12.1 Dexie versions | §12-C1 CRITICAL |
| 12.2 Tier transitions | §12-H1 HIGH |
| 12.3 IDB quota | §12-C2 CRITICAL |
| 12.4 Firebase backup | covered §26 |
| 12.5 Rollback | §12-M3 MED |
| 12.6 wv2-* non-breaking | §12-M5 MED |
| 12.7 657 schema invariant | covered §39 |
| 12.8 Cross-tab lock | §12-H3 HIGH |
| 12.9 Schema migration backwards-compat | §12-C1 |
| 12.10 CDL append-only | §12-H2 HIGH |
| 12.11 Last-write-wins | §12-H3 documented |
| 12.12 Corruption recovery | §12-M1 |
| 12.13 Migration chain v1→v2→v3 | §12-C1 |
| 12.14 Transaction atomicity | Dexie default ✓ |
| 12.15 Serialization round-trip | NOT TESTED MED secondary |

## Karpathy distribution §12
- Think Before Coding: 2 (C2, H3)
- Goal-Driven: 2 (C1, H2)
- Surgical Changes: 1 (C2)
