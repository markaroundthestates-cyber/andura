# Data Breach Response Runbook — GDPR Art. 33 / Art. 34

> **Authority:** Audit nuclear V3 §28-C4 closure 2026-05-22. Required for Beta
> launch with 50 testers — single-operator solo Daniel = single point of
> detection. Romania DPA = ANSPDCP.
>
> **Scope:** Any unauthorized access to / loss of / destruction of personal data
> (Big 6 onboarding, sessions, body measurements, email, Firebase uid, IDB Tier 1
> sessions, RTDB Tier 2 backup).

---

## §1 What counts as a breach

GDPR Art. 4(12): "a breach of security leading to the accidental or unlawful
destruction, loss, alteration, unauthorized disclosure of, or access to,
personal data transmitted, stored or otherwise processed."

Andura-specific examples (positive list):
- Firebase RTDB rules misconfigured → user A reads user B's `/users/<uid>` data
- Firebase Auth API key leaked publicly → unauthorized account creation/impersonation
- Sentry event payload leaked user uid/email (mitigation §17-M3 PII strip LANDED)
- Magic Link oobCode intercepted in transit (HTTPS broken)
- localStorage data exfiltrated via XSS (mitigation: CSP `unsafe-inline` only, §4-C3)
- Lost device with cached IDB Tier 1 sessions unencrypted

NOT breaches (negative list):
- User loses phone but device encryption active → not a breach (mitigated by OS)
- Sentry receives an error message stripped of PII → not a breach
- Daniel CEO accesses own dev environment data → not a breach

---

## §2 Response phases — 0h to 72h timeline

### Phase 1 — Detect (T+0)

Detection sources, in priority order:
1. **Sentry alert** — unusual error spike (auth failures, fbGet 403/401) on dashboard
2. **Manual user report** — privacy@andura.app inbox
3. **Daniel routine check** — Firebase Console > Auth > Users + Sentry weekly review
4. **External notification** — security researcher, ANSPDCP, third party

Acknowledge within: **≤ 4 hours** of detection.

### Phase 2 — Triage (T+0 to T+8h)

Capture in `BREACH_LOG_YYYY-MM-DD.md` (gitignored — sensitive):
- Discovery timestamp + source
- Affected data categories (auth tokens / Big 6 / sessions / weight)
- Estimated number of affected users (1, <10, <50 Beta tester pool, >50)
- Likely cause (config drift, dependency CVE, leaked secret, etc.)
- Active vs contained (still ongoing exfiltration vs already stopped)

Severity classification (drives notification path):
- **LOW** — single user, NU sensitive data, contained immediately → log only
- **MED** — single user OR aggregate non-sensitive, ANSPDCP notify only
- **HIGH** — multiple users OR sensitive (body weight, measurements) → ANSPDCP + user notify
- **CRITICAL** — credentials leaked OR special category data → ANSPDCP + ALL users + emergency rotation

### Phase 3 — Contain (T+0 to T+24h)

Action chain by cause:

**Auth key leak:**
1. Firebase Console > Project Settings > rotate Web API Key
2. Update GH Pages env `VITE_FIREBASE_API_KEY` + redeploy
3. Force all users sign out via Firebase Console > Auth > Users > Disable selected
4. Notify users to sign back in

**Firebase rules misconfig:**
1. Edit `firebase.rules` to lock down → `firebase deploy --only database`
2. Audit access logs Firebase Console > Database > Usage
3. Snapshot leaked data scope from logs

**Code vulnerability (XSS / CSRF):**
1. Patch + redeploy ASAP
2. If exploit was active: invalidate all auth tokens
3. Check CSP report-uri (when added §4-C4)

**Dependency CVE:**
1. `npm audit` → identify vulnerable package
2. `npm install <pkg>@<patched>` → push → verify build
3. If exploit-in-wild: rotate all secrets defensively

### Phase 4 — Notify ANSPDCP (T+0 to T+72h MAX)

GDPR Art. 33: **72 hours from awareness** of breach.

ANSPDCP notification form (Romanian DPA):
- URL: https://www.dataprotection.ro/?page=notificare_incident
- Required fields:
  - Operator name + contact (Daniel maziludanielconstantin90@gmail.com)
  - Nature of breach
  - Categories + approximate number of data subjects affected
  - Categories + approximate number of personal data records affected
  - Likely consequences
  - Measures taken to address + mitigate adverse effects
  - DPO contact (Daniel = controller + DPO solo bootstrap pre-Beta)

If full info NOT available at 72h → submit phased: initial notice + follow-up
within reasonable delay (Art. 33(4)).

### Phase 5 — Notify users (T+0 to T+72h for HIGH+CRITICAL)

GDPR Art. 34: notify affected users WITHOUT undue delay when breach likely to
result in HIGH RISK to rights and freedoms.

Notification mechanism options (in order of preference):
1. **In-app banner** — UpdatePrompt-style modal next time user opens Andura
2. **Email** — send to addresses on file (Magic Link addresses)
3. **Public notice** — andura.app/security-notice page if email bounce / mass

Required content (Art. 34(2)):
- Clear plain-language description of nature of breach
- DPO contact (Daniel)
- Likely consequences
- Mitigation steps taken
- Recommendation what user should do (change password if used elsewhere, monitor
  Magic Link sources, etc.)

---

## §3 Post-incident review (T+1 week)

Add to `08-workflows/BREACH_LOG_INDEX.md`:
- Root cause analysis (5 Whys)
- Detection lag (T+0 actual vs ideal)
- Containment lag
- ANSPDCP submission timestamp
- User notification timestamp
- Lessons learned + concrete code/process changes
- Update this runbook if process gaps identified

Cross-link to DECISIONS.md if procedural change triggered LOCKED V1 entry.

---

## §4 Pre-Beta hardening checklist

Before opening Beta to 50 testers:
- [x] Sentry initialized + PII strip beforeSend §17-M3 LANDED
- [x] CSP active (script-src/style-src/connect-src restrictive) §4-C3 LANDED
- [x] HTTPS-only (GH Pages enforces) §4-C9 LANDED
- [x] Auth fresh-gate destructive ops (re-auth required) §A016 LANDED
- [ ] Firebase RTDB rules deployed (firebase.rules NOT auto-deployed by deploy.yml)
- [ ] `npm audit` CI gate (currently manual)
- [ ] ANSPDCP submission template pre-drafted
- [ ] User notification email template pre-drafted RO

---

## §5 References

- GDPR Art. 33 (notification to supervisory authority)
- GDPR Art. 34 (notification to data subject)
- ANSPDCP: https://www.dataprotection.ro/
- ENISA guidelines: https://www.enisa.europa.eu/topics/data-protection/personal-data-breaches
- DECISIONS.md §D048 LOCKED V1 throttle accepted-risk Firebase quota DiD
- `08-workflows/BACKUP_DR_RUNBOOK.md` — disaster recovery (related)
- `08-workflows/PROD_OPS_RUNBOOK.md` — operational procedures
- `src/util/sentry.js` — PII strip implementation §17-M3
