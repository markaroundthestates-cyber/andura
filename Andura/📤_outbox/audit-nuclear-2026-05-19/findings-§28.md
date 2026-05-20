# §28 — Legal / GDPR Compliance Comprehensive

**Scope:** Privacy Policy link + T&C link + Cookie banner + DPA + Sub-processor + Data residency + DSR + Right-to-access + Right-to-portability + Right-to-erasure + Right-to-rectification + Consent management + Age verification + Data minimization + Purpose limitation + Lawful basis + Privacy by Design + Data breach notification 72h + ROPA + DPO + EU-US DPF + Medical data Art. 9 + ePrivacy cookies

## Severity matrix §28

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 6 |
| MED | 6 |
| LOW | 3 (positive) |
| NIT | 0 |
| **Total** | **19** |

---

## CRITICAL findings

### §28-C1 — Privacy Policy live link present + accurate? (§28.1)
**Severity:** CRITICAL
**Evidence:** SettingsTerms.tsx exists. Content NOT inspected. Privacy Policy required by GDPR Art. 13 + 14 for any data collection.
**Fix log:** Sample SettingsTerms.tsx; verify Privacy Policy text comprehensive (purposes, lawful basis, retention, rights, contact).

### §28-C2 — T&C live link present + accurate (§28.2)
**Severity:** CRITICAL
**Resolution:** SettingsTerms.tsx — same verify.

### §28-C3 — Right-to-erasure complete data wipe (§28.10 + §4.14)
**Severity:** CRITICAL
**Evidence:** SettingsDanger.tsx LANDED Phase 6 task_17. handler `wipe failed` console.warn shows attempted wipe. Per spec complete wipe = IndexedDB + Firebase user/{uid} + Auth profile delete + backups purge. Verify functional E2E.
**Fix log:** Sample SettingsDanger.tsx implementation; verify it calls:
- clear localStorage (Tier 0)
- Dexie.delete (Tier 1)
- Firebase `accounts:delete` REST endpoint (Auth profile)
- Firebase user/{uid} document delete via fbRemove
- Backup purge documented (§26-M3)

### §28-C4 — Data breach notification procedure 72h GDPR Art. 33 (§28.18)
**Severity:** CRITICAL
**Evidence:** No documented breach response. Beta launch with 50 testers + Daniel solo = single point of detection.
**Fix log:** Add `08-workflows/data-breach-response.md` with steps:
- Detect (Sentry alerts + manual checks)
- Triage (assess scope)
- Contain (revoke keys, lock auth)
- Notify ANSPDCP (Romanian DPA) within 72h
- Notify affected users
- Document root cause + remediation

---

## HIGH findings

### §28-H1 — DPA Data Processing Agreement Firebase as processor (§28.4)
**Severity:** HIGH
**Evidence:** Firebase as data processor; Daniel = controller. Google DPA accepted at Firebase signup. Document acceptance.

### §28-H2 — Data residency RO/EU Firebase region europe-west ✓ (§28.6)
**Severity:** HIGH — POSITIVE
**Evidence:** FIREBASE_URL `https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app` ✓ EU region.
**Resolution:** Compliant.

### §28-H3 — DSR handler runbook (§28.7)
**Severity:** HIGH
**Evidence:** SettingsExport (access) + SettingsDanger (erasure) functional. Rectification via SettingsProfile edit. But what about manual user emailing maziludanielconstantin90@gmail.com requesting DSR? Procedure undefined.
**Fix log:** Add DSR handler runbook.

### §28-H4 — Consent management — Medical Disclaimer + T&C timestamps stored (§28.12)
**Severity:** HIGH (§9-H2 covered)
**Resolution:** Per §9-H2 — verify consent timestamp persist.

### §28-H5 — Age verification GDPR — minors <16 parental consent (§28.13 + §30.6)
**Severity:** HIGH
**Evidence:** Big 6 age range 13-95 per §30.6. Per GDPR Art. 8, minors <16 (or country threshold; Romania = 16) require parental consent.
**Fix log:** Onboarding step "age" → if age <16, gate with parental consent flow OR raise minimum to 16. Document choice.

### §28-H6 — Medical data special category Art. 9 considerations (§28.22)
**Severity:** HIGH
**Evidence:** Fitness ≠ medical strict, but body weight + body composition + injury (Pain Button) close to Art. 9 health data. Document boundary.
**Fix log:** Privacy Policy must clarify scope and that medical advice is NOT provided (LOCK 4 Medical Disclaimer + Suflet Andura voice).

---

## MED findings

### §28-M1 — Cookie banner ePrivacy (§28.3 + §28.23) — PWA first-party may skip
**Severity:** MED
**Evidence:** Andura PWA first-party only. No third-party cookies. localStorage = first-party. ePrivacy Directive: technical-necessary storage exempt. NO cookie banner needed if zero non-essential cookies.
**Fix log:** Document compliance position; verify NO analytics cookies (Google Analytics absent ✓ per audit).

### §28-M2 — Sub-processor list documentation (§28.5)
**Severity:** MED
**Fix log:** Document: Firebase (Google), Sentry (Functional Software). No other processors.

### §28-M3 — Right-to-access GDPR data export verify functional (§28.8 + §26-M5)
**Severity:** MED
**Resolution:** Per §26-M5.

### §28-M4 — Right-to-portability JSON format (§28.9)
**Severity:** MED — POSITIVE
**Resolution:** SettingsExport JSON format compliant likely.

### §28-M5 — Records of Processing Activities (ROPA) documented (§28.19)
**Severity:** MED
**Fix log:** Add `08-workflows/ropa.md` documenting data flows.

### §28-M6 — Privacy by Design + Default documented (§28.17)
**Severity:** MED
**Resolution:** Telemetry opt-in default FALSE §17-M1 ✓. K-anonymity §4-L2 ✓. Local-first §D-LEGACY-001 ✓. Implicit PbD; document explicit.

---

## LOW (POSITIVE)

### §28-L1 — Right-to-rectification via SettingsProfile edit ✓ (§28.11)
**Severity:** LOW positive
**Evidence:** SettingsProfile.tsx exists; updates Big 6 fields editable.

### §28-L2 — DPO contact — Daniel as controller; pre-Beta solo, single contact via email ✓ (§28.20)
**Severity:** LOW positive
**Resolution:** Acceptable.

### §28-L3 — EU-US DPF compliance — Firebase EU region eliminates concern ✓ (§28.21)
**Severity:** LOW positive
**Evidence:** europe-west1 = data stays in EU; no transatlantic transfer. DPF moot.

## Karpathy distribution §28
- Goal-Driven: 6 (C1, C2, C3, C4, H3, H5)
- Surgical Changes: 4 (H1, H4, M2, M5)
