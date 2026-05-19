# §35 — Database / Storage Tier 0/1/2 Specifics Deep

**Scope:** Tier 0 transient localStorage wv2-* + Tier 1 active Dexie 90d + Tier 2 archive Firebase >90d + Transition timing + Aggregation pre-archive + Restore Tier 2 logic + Storage size per tier + Dexie normalization + Dexie index strategy + Query perf hot paths + Pagination + Bulk ops + Storage size estimation + Eviction Tier 2 archive + Firestore doc size limits + Firebase Auth metadata + localStorage size limits + IDB versioning migration + Cross-tier consistency + Schema 657 fields

## Severity matrix §35

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 4 |
| MED | 5 |
| LOW | 3 (positive) |
| NIT | 1 |
| **Total** | **15** |

---

## CRITICAL findings

### §35-C1 — Tier definitions DRIFT between spec (§35.1-§35.3) and code comments (§12-H1)
**Severity:** CRITICAL
**Evidence:** Spec: Tier 0 = last 24h localStorage `wv2-*`. Tier 1 = last 90 days Dexie. Tier 2 = >90 days Firebase.
- `src/react/lib/dexieMigration.ts` comments label localStorage as Tier 1, Dexie as Tier 2. Drift.
**Fix log:** Per §12-H1 — align nomenclature.

### §35-C2 — Transition timing exact when Tier 0→1, Tier 1→2 NOT IMPLEMENTED (§35.4)
**Severity:** CRITICAL
**Evidence:** dexieMigration.ts scaffolds Tier 2 archive layer. Auto-promotion logic NOT implemented (per code comment "Phase 6+ scheduled migration"). Phase 6 LANDED — verify if task_22-24 included this scheduler.
**Fix log:** Read Phase 6 task_22-24 implementation per §45 secondary; verify scheduler.

---

## HIGH findings

### §35-H1 — Aggregation pre-archive compress detailed → summary (§35.5)
**Severity:** HIGH
**Evidence:** dexieMigration.ts archives sessions raw (entire summary object). No aggregation step (e.g., per-month volume totals). Tier 2 storage cost scales linearly with sessions.

### §35-H2 — Storage size per tier monitored (§35.7) — `navigator.storage.estimate()` NOT USED (§12-C2 covered)
**Severity:** HIGH

### §35-H3 — Restore from Tier 2 logic user requests historical data (§35.6)
**Severity:** HIGH
**Evidence:** Tier 2 = Firebase archive. Restore = `fbGet('users/{uid}/archived/*')`. Per fbGet implementation in firebase.js — works if user authenticated and archive paths populated. Verify Istoric tab can navigate to old sessions.
**Fix log:** E2E test: user with 100+ day-old sessions opens Istoric → archive load → display.

### §35-H4 — Firebase Firestore document size limit 1MB per doc (§35.15)
**Severity:** HIGH
**Evidence:** Firebase Firestore limit. Andura uses Firebase RTDB (NOT Firestore — per firebase.js). RTDB limit different (256MB max per node). Verify which path used for Tier 2 archive.

---

## MED findings

### §35-M1 — Dexie schema design v1 stores `sessions: '++id, ts, archivedAt'` (§35.8)
**Severity:** MED
**Evidence:** Indexes on ts + archivedAt ✓ for sort + filter. Compound index for hot queries (e.g., `[archivedAt+ts]`) NOT defined yet.

### §35-M2 — Pagination strategy Istoric scroll (§35.11)
**Severity:** MED
**Evidence:** Istoric.tsx renders list — virtualization library NOT in deps. With 100+ sessions, render perf degrades.
**Fix log:** Consider `@tanstack/react-virtual` or similar for long lists.

### §35-M3 — Bulk operations Dexie `bulkPut` (§35.12)
**Severity:** MED
**Evidence:** Dexie supports bulkPut. Usage NOT verified in dexieMigration.ts.

### §35-M4 — localStorage size limits 5-10MB browser dep (§35.17)
**Severity:** MED
**Evidence:** Tier 0 wv2-* keys could approach limit. Quota handling §12-C2 covered.

### §35-M5 — IndexedDB versioning migration v1→v2→v3 (§35.18) — covered §12-C1

---

## LOW (POSITIVE)

### §35-L1 — Schema 657 fields documented per ADR §36.36 ✓ (§35.20 + §39.2)
**Resolution:** exerciseMetadata.js schema header lists fields equipment_type/equipment_alternatives/force_demand/tier/muscle_target_*/fallback_cascade.

### §35-L2 — Cross-tier data consistency Tier 0 ephemeral acceptable loss policy ✓
**Resolution:** OK per design.

### §35-L3 — Firebase Auth metadata custom claims NOT used (§35.16) — acceptable
**Resolution:** OK.

---

## NIT findings

### §35-N1 — Eviction Tier 2 archive compress vs delete (§35.14) — GDPR alignment ok
**Resolution:** Per §28-C3 erasure complete.

## Karpathy distribution §35
- Goal-Driven: 4 (C1, C2, H3, H4)
- Surgical Changes: 2 (H1, M2)
