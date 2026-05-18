# §32 — Notification System / In-App Toast

**Scope:** Toast UX consistent + Banner priority + Permission request + Quiet hours + Frequency limits + Push state + In-app center + SettingsNotifications + Dismiss UX + Grouping + Queue handling + Critical safety not dismissable

## Severity matrix §32

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 3 |
| MED | 5 |
| LOW | 2 (positive) |
| NIT | 1 |
| **Total** | **11** |

---

## HIGH findings

### §32-H1 — Toast UX consistent pattern absent globally (§32.1 + §13-M1 reaffirmed)
**Severity:** HIGH
**Resolution:** Per §13-M1.

### §32-H2 — Notification permission request UX flow gracious (§32.3) — UNVERIFIED
**Severity:** HIGH
**Evidence:** No grep hit for `Notification.requestPermission()` in src/react/. SettingsNotifications.tsx exists but may not request browser permission yet.
**Fix log:** Sample SettingsNotifications + verify graceful permission ladder ("Vrei sa primesti notificari?" → user opt-in click → browser permission prompt).

### §32-H3 — Critical safety notifications NU dismissable (§32.12)
**Severity:** HIGH
**Evidence:** MedicalDisclaimerModal `data-testid="disclaimer-backdrop"` — backdrop tap behavior NOT verified. AaFrictionModal LOCK 9 backdrop NO dismiss documented ✓. Verify MedicalDisclaimerModal same discipline.

---

## MED findings

### §32-M1 — Quiet hours respect (§32.4) — Phase 6 task_10 LANDED
**Severity:** MED
**Evidence:** SettingsNotifications has time + days config per spec. Implementation logic ABSENT from audit (would be Notification scheduler — likely runs via SW Background Sync §16-H3).

### §32-M2 — Notification frequency limits (§32.5)
**Severity:** MED
**Fix log:** Verify rate limit per-notification-type.

### §32-M3 — Push notifications support state (§32.6 + §16-H4 reaffirmed)
**Severity:** MED
**Resolution:** Per §16-H4.

### §32-M4 — Notification grouping aggregate (§32.10) — multiple PRs same session
**Severity:** MED
**Evidence:** PRNotificationBanner.tsx exists. Single-PR display per spec F11. Multiple PRs same session = stack 1-by-1 OR aggregate "3 PR-uri Tip!". Defer.

### §32-M5 — Notification queue handling rapid-fire dedup (§32.11)
**Severity:** MED
**Fix log:** Defer secondary.

---

## LOW (POSITIVE)

### §32-L1 — SettingsNotifications.tsx LANDED Phase 6 task_10 ✓ (§32.8)
### §32-L2 — Banner priority hierarchy (critical > warning > info) — MedicalDisclaimer + AaFriction blocking modal vs PRNotification banner mode ✓

---

## NIT findings

### §32-N1 — In-app notification center (§32.7) — not implemented; not required pre-Beta
**Resolution:** Defer.

## Karpathy distribution §32
- Goal-Driven: 2 (H1, H2)
- Surgical Changes: 1 (H3)
