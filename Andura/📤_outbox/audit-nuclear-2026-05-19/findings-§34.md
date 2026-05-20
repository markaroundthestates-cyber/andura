# §34 — Production Operations / Incident Response Runbook

**Scope:** Incident response + Rollback tested + Hot-fix path + Monitoring alerts + On-call + Status page + Communication template + RTO/RPO + Post-mortem + Change management + Production access controls + Secrets rotation + DR drill + Runbook accessibility

## Severity matrix §34

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 4 |
| MED | 4 |
| LOW | 2 (positive) |
| NIT | 1 |
| **Total** | **14** |

---

## CRITICAL findings

### §34-C1 — Incident response procedures documentation ABSENT (§34.1 + §26-C2 reaffirmed)
**Severity:** CRITICAL
**Resolution:** Per §26-C2 DR runbook need + this incident runbook need.

### §34-C2 — Post-mortem template documented ABSENT (§34.10)
**Severity:** CRITICAL
**Fix log:** Add `08-workflows/post-mortem-template.md` with sections: Incident summary, Timeline, Root cause, Action items, Lessons.

### §34-C3 — Production access controls (Firebase IAM, GitHub repo permissions) NOT DOCUMENTED (§34.12)
**Severity:** CRITICAL
**Fix log:** Document Daniel-only ownership of Firebase project + GH repo. Future contributor: IAM role per ADR.

---

## HIGH findings

### §34-H1 — Rollback procedure tested live D028 (§34.2) — manual file-swap procedure
**Severity:** HIGH
**Evidence:** D028 PROC LOCKED V1 PERMANENT — rollback = rename `index.html` ↔ `index-vanilla-legacy.html`. Documented in DECISIONS.md. Tested at deploy point.
**Resolution:** Acceptable manual procedure pre-Beta; automate post-Beta (§33-H2).

### §34-H2 — Hot-fix deployment process (urgent path, NU bypass tests) (§34.3)
**Severity:** HIGH
**Evidence:** No documented hot-fix path. Currently same path = push to main → deploy.yml fires. No "skip tests" lever (good).
**Fix log:** Document: "Hot-fix = same as normal commit; tests still mandatory; for true emergency = manual rollback via §33-H2."

### §34-H3 — Recovery objectives RTO < 1h + RPO < 24h documented (§34.8 + §34.9)
**Severity:** HIGH
**Fix log:** Document targets + how achieved (Firebase backup frequency, GH Pages deploy time, etc.).

### §34-H4 — DR drill periodic simulate (§34.14)
**Severity:** HIGH
**Fix log:** Schedule quarterly simulated outage; verify procedures.

---

## MED findings

### §34-M1 — Status page andura.app/status (§34.6)
**Severity:** MED
**Evidence:** No /status route. Pre-Beta 50 users acceptable without; post-Beta consider externalstatuspage.io.

### §34-M2 — Communication template breach/outage (§34.7)
**Severity:** MED
**Fix log:** Add `08-workflows/communication-template.md`.

### §34-M3 — Change management procedure deploy windows + freeze (§34.11)
**Severity:** MED
**Fix log:** Pre-Beta = no freeze needed; document post-Beta.

### §34-M4 — Secrets rotation procedure Firebase API keys etc (§34.13)
**Severity:** MED
**Fix log:** Document annual rotation policy.

---

## LOW (POSITIVE)

### §34-L1 — Runbook accessibility offline copy via git repo ✓ (§34.15)
**Resolution:** Vault repo cloned → runbook accessible offline.

### §34-L2 — On-call rotation N/A solo Daniel (§34.5) — appropriate scope
**Resolution:** Pre-Beta.

---

## NIT findings

### §34-N1 — Production access controls — Daniel ownership not documented but obvious
**Resolution:** §34-C3 documents.

## Karpathy distribution §34
- Goal-Driven: 4 (C1, C2, C3, H3)
- Surgical Changes: 3 (H1, H2, H4)
