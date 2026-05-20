# §26 — Backup / Disaster Recovery Dedicat

**Scope:** Restore fresh device + Wipe recovery + Clear site data + Firebase backup schedule + Restore time SLA + Conflict resolution + Test plan + Automated restore test + DR runbook + Backup retention + Encryption at rest + Access controls + Data export user + GDPR portability format + Backup verify integrity

## Severity matrix §26

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 4 |
| MED | 5 |
| LOW | 2 (positive) |
| NIT | 0 |
| **Total** | **13** |

---

## CRITICAL findings

### §26-C1 — Restore procedure fresh device NOT TESTED live (§26.1)
**Severity:** CRITICAL
**Evidence:** No documented test procedure run. Beta launch with 50 testers; if even one loses phone → restore unverified → data loss → trust broken.
**Fix log:** Manual test: Daniel logs in on second Android device → expect IndexedDB rebuilds from Firebase → all sessions visible. Document outcome in `08-workflows/restore-test-results.md`.

### §26-C2 — Disaster recovery runbook ABSENT (§26.9)
**Severity:** CRITICAL
**Evidence:** No `08-workflows/disaster-recovery-runbook.md`. Post-incident procedure undefined.
**Fix log:** Write runbook covering:
- User-side: lost phone → restore
- Server-side: Firebase outage → wait + comms
- Total: vault loss → restore from git + tag baselines

---

## HIGH findings

### §26-H1 — Firebase backup schedule documented (§26.4)
**Severity:** HIGH
**Evidence:** Firebase Spark plan: automatic backups (limited). No explicit policy. Firebase docs say RTDB has daily backups on Blaze plan only. Spark = NO automatic backups — only export-on-demand via Console.
**Fix log:** Either upgrade to Blaze for backups (cost) OR document manual export schedule + automate via Cloud Function nightly export to GCS.

### §26-H2 — Restore time SLA target documented (§26.5)
**Severity:** HIGH
**Evidence:** No SLA. Typical user: <30s for IndexedDB rebuild from Firebase REST. Large user (5+ years sessions): TBD. Document expectations.

### §26-H3 — Conflict resolution post-restore (last-write-wins or user-prompt) (§26.6)
**Severity:** HIGH
**Evidence:** Cross-device restore: local Dexie state vs Firebase. Policy NOT documented. §12-H3 cross-tab is similar problem; cross-device is more risky.
**Fix log:** Document last-write-wins policy with timestamp-based conflict resolution; surface UX warning if conflict detected.

### §26-H4 — Account dormant + reactivation flow (§50.10 user data lifecycle)
**Severity:** HIGH (covered §50)

---

## MED findings

### §26-M1 — User clear site data mid-session recovery (§26.3)
**Severity:** MED
**Evidence:** Browser settings clear → IndexedDB + localStorage wiped. Firebase auth tokens lost → re-login required → IndexedDB rebuilt from Firebase. Functional flow IF auth works (§7-C2 currently broken).

### §26-M2 — Automated restore test feasible (§26.8)
**Severity:** MED
**Evidence:** Could be CI Playwright scenario but cumbersome (need test Firebase project). Defer post-Beta.

### §26-M3 — Backup retention policy 90 days? 1 year? GDPR right-to-erasure timeline (§26.10)
**Severity:** MED
**Evidence:** GDPR Art. 17 right-to-erasure → backups must also be purged within reasonable time (~30-90 days typical). Firebase manual export → Daniel retention policy undefined.
**Fix log:** Document: "Backups retained 30 days; user deletion request → backup purge within 30 days of deletion."

### §26-M4 — Backup encryption at rest (§26.11)
**Severity:** MED
**Evidence:** Firebase default encryption at rest (Google KMS) ✓. Documented assumed.

### §26-M5 — Data export user-initiated SettingsExport (§26.13)
**Severity:** MED — POSITIVE
**Evidence:** SettingsExport.tsx + Phase 6 task_16 LANDED per D026. Verify §28.

---

## LOW (POSITIVE)

### §26-L1 — Backup access controls Firebase IAM Daniel-only ✓ (§26.12)
**Severity:** LOW positive
**Evidence:** Firebase project owner Daniel; Spark plan minimal team.

### §26-L2 — Data export format JSON machine-readable ✓ (§26.14)
**Severity:** LOW positive — verify §28
**Evidence:** SettingsExport implementation likely emits structured JSON per ADR.

## Karpathy distribution §26
- Goal-Driven: 4 (C1, C2, H1, H3)
- Surgical Changes: 1 (H2)
