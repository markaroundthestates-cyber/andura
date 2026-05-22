<!-- generated-by: gsd-doc-writer -->
---
title: Account Dormant + Reactivation Flow V1 — Andura PWA
status: ACTIVE_SSOT
created: 2026-05-22
authority: §26-H4 audit nuclear V3 closure (audit-nuclear-2026-05-19 findings-§26.md)
cross_refs:
  - 08-workflows/BACKUP_DR_RUNBOOK.md (§4 fresh device restore parallel)
  - 08-workflows/DSR_HANDLER.md (Art. 17 erasure boundary)
  - 08-workflows/DATA_OWNERSHIP.md (retention policy alignment)
  - src/auth.js (Magic Link re-auth path)
  - DECISIONS.md §D045 (Tier 2 90-day rolling rotation V1)
---

# Account Dormant + Reactivation Flow — Andura PWA V1

Solo-founder Daniel CEO operational doc. User lifecycle states + transitions, GDPR-aligned.

## §1 User lifecycle states (LOCKED V1)

| State | Trigger | Tier 1 RTDB status | Tier 2 IndexedDB | Notification |
|-------|---------|---------------------|------------------|--------------|
| **Active** | login activity ≤ 90 days | full data preserved | live 90-day rolling | none |
| **Idle** | no activity 91-180 days | full data preserved | live (last 90d may aggregate) | none |
| **Dormant** | no activity 181-365 days | full data preserved + flag | local cache stale on next visit | warning email at 330 days |
| **Pre-deletion** | no activity 366-395 days | full data + 30-day warning grace | local cache stale | reminder email at 365 + 380 days |
| **Deleted** | no activity > 395 days OR explicit Art. 17 erasure | DELETE Tier 1 subtree | local cache cleared on next attempted login (404 on auth) | confirmation email at deletion |

**Dormancy threshold rationale (180 days = 6 months):**
- Aligned cu industry norm fitness apps (Strava 24mo, MyFitnessPal 18mo, Andura conservative 12mo total to deletion)
- Allows seasonal users (summer-only gym, holiday hiatus) without disruption
- Pre-Beta Daniel sole user → threshold mostly theoretical until Beta launch
- GDPR Art. 5(1)(e) storage limitation principle = data NU kept "longer than necessary" → 12mo total = defensible

**Deletion threshold rationale (395 days = ~13 months):**
- 365 days inactive + 30-day grace warning = 395 day total
- Grace warning aligns cu Art. 17(2) reasonable notice principle
- Beta scale ≤50 users → manual review feasible if disputes

## §2 Detection mechanism (Beta scale manual, post-Beta automated)

**Pre-Beta + Beta (manual Daniel quarterly review):**
1. Quarterly (Jan/Apr/Jul/Oct) Daniel runs Firebase Console > Authentication > Users
2. Sort by "Last sign-in" ascending
3. Identify users >180 days inactive → manual flag în Daniel notes
4. Identify users >330 days → trigger warning email manually
5. Identify users >395 days → trigger deletion sequence §4

**Post-Beta (automated via Firebase Cloud Function placeholder):**
- `dormancyReviewer` scheduled function daily at 03:00 EET
- Query: `Auth.lastSignInTime < (Date.now() - 180*24*3600*1000)`
- Write `users/{uid}/_meta/dormancyState` = "idle" | "dormant" | "pre-deletion" | "deleted"
- Email trigger via SendGrid/Resend (post-Beta paid tier OK)
- Manual Daniel override available cu admin claim

## §3 Reactivation flow (user returning after dormancy)

**Scenario:** user inactive 91-394 days returns to `andura.app`.

### §3.1 User-facing steps (zero friction)

1. User opens `andura.app` (existing install or fresh browser)
2. Tap **Cont** tab > **Login cu Magic Link**
3. Enter email (same as previously used)
4. Receive Magic Link email < 60s
5. Tap link > auto-redirect `andura.app/auth-callback?oobCode=...`
6. App detects `oobCode` via `parseMagicLinkUrl()` (`src/auth.js:156`)
7. App calls `verifyMagicLink()` (`src/auth.js:127`) → `_persistAuth()` stores fresh tokens
8. Engine state auto-syncs from Firebase RTDB Tier 1 canonical
9. Welcome-back banner displayed cu "Bun venit înapoi! Datele tale sunt intacte." message
10. Tier 2 IndexedDB rebuilds lazy as user navigates Sesiuni / Antrenor tabs

### §3.2 Server-side reactivation transitions

| Previous state | Transition action | Result |
|----------------|-------------------|--------|
| Idle (91-180d) | none — direct active | full restore, no banner |
| Dormant (181-365d) | clear `_meta/dormancyState` flag | welcome-back banner displayed once |
| Pre-deletion (366-395d) | clear flag + cancel pending deletion job | "Contul tău era programat pentru ștergere. Bun venit înapoi!" banner |
| Deleted (>395d) | NU recoverable — see §5 | error: "Cont negăsit. Creează cont nou cu acest email." |

### §3.3 Tier 2 IndexedDB freshness post-reactivation

- IndexedDB cache pe device veche poate fi stale (>90 days = expired per D045 rotation)
- Initial reactivation = lazy fetch from Tier 1 server canonical
- Welcome-back banner messaging: "Sincronizez datele tale..." with progress
- Estimated reactivation time: ~30s active (Magic Link + initial Tier 1 sync), Tier 2 fills progressively as user explores app

## §4 Pre-deletion warning + deletion sequence

### §4.1 Warning emails

**Day 330 (35 days before deletion):**
> Subject: Andura — contul tău a fost inactiv ~11 luni
>
> Salut! N-ai mai folosit Andura din [DATA]. Vrem să te anunțăm că, conform politicii noastre de păstrare a datelor, vom șterge contul tău automat în 35 de zile (pe [DATA + 35 zile]) dacă nu te reconectezi.
>
> Pentru a păstra contul + toate datele tale, deschide [andura.app](https://andura.app) și loghează-te cu Magic Link.
>
> Dacă vrei să-ți ștergi contul acum, poți face asta direct în aplicație: Cont > Deconectare & stergere > Sterge cont.
>
> Mulțumim! — Daniel, Andura

**Day 365 (30 days before deletion):**
> Subject: Andura — ștergere automată în 30 zile
>
> Reamintire: contul tău Andura va fi șters automat pe [DATA + 30]. Loghează-te dacă vrei să-l păstrezi.

**Day 380 (15 days before deletion):**
> Subject: Andura — ștergere automată în 15 zile
>
> Ultim reminder înainte de ștergere automată pe [DATA + 15].

### §4.2 Deletion execution (Day 395+)

Daniel manual pre-Beta + Beta (post-Beta automated):

1. Firebase Console > Authentication > Users > find uid > Delete
2. Firebase Console > RTDB > `/users/{uid}/` > Delete node entirely
3. (Post-Beta) Sentry: `Sentry CLI > issues delete` for uid-tagged events
4. Tier 1 backup retention 30 days continues per §2 BACKUP_DR_RUNBOOK.md — auto-prunes by rolling window
5. Send confirmation email:

> Subject: Andura — cont șters
>
> Contul tău Andura asociat acestui email a fost șters complet pe [DATA] conform politicii noastre de păstrare (12 luni inactivitate). Datele tale au fost eliminate de pe serverele Andura.
>
> Backup-urile noastre cu retenție 30 zile vor fi curățate automat până pe [DATA + 30].
>
> Dacă ai întrebări, răspunde acestui email. — Daniel, Andura

6. Document deletion în `~/Documents/andura-backups/_log.txt`:
```
2026-XX-XX DORMANT_DELETE uid=<first-8-chars> reason=>395d_inactive notified=days_330+365+380
```

## §5 Post-deletion data recovery (impossible)

**Policy:** după ștergere completă Tier 1 + backup pruning, datele NU mai sunt recuperabile.

**Rationale (GDPR Art. 17 + privacy by design):**
- Art. 17 erasure must be complete cu no "shadow copies" persisting indefinitely
- Backup retention 30 days = reasonable transition period, NU permanent archive
- Post-30-days = irreversible by design (auditability + user trust + storage cost)

**User communication if attempting to use old email post-deletion:**
- Login attempt → Firebase Auth `user-not-found` error
- App displays: "Contul asociat cu acest email nu mai există. Poți crea cont nou cu același email — vei începe de la zero."
- User opts: create new account (fresh Tier 1 namespace, new uid) OR use different email

## §6 GDPR alignment summary

| GDPR principle | Andura compliance |
|----------------|-------------------|
| **Art. 5(1)(e) storage limitation** | 12-month inactivity threshold = defensible "necessary period" for fitness coaching app |
| **Art. 13/14 informed consent** | Retention policy disclosed în Privacy Policy + Terms (cross-ref DATA_OWNERSHIP.md) |
| **Art. 17 right to erasure** | User can self-delete anytime via Cont tab; automatic deletion respects principle |
| **Art. 17(2) reasonable notice** | 35-day + 30-day + 15-day warning emails before deletion |
| **Art. 21 right to object** | Telemetry opt-out preserves account; only affects analytics, not lifecycle |
| **Art. 5(1)(f) integrity + confidentiality** | Backup encryption at rest (Firebase native) + retention pruning automated |

## §7 Test cycle (quarterly Daniel manual)

**Frequency:** every 3 months, alongside backup test cycle §6 BACKUP_DR_RUNBOOK.md.

**Goal:** verify dormancy detection + reactivation paths actually work.

**Checklist:**
1. Identify test account inactive ≥180 days (Daniel secondary email account)
2. Verify Firebase Console > Auth > Last Sign-In timestamp accurate
3. Trigger Magic Link from test account inactive >180 days
4. Verify reactivation flow §3.1 steps complete < 60s
5. Verify welcome-back banner appears in app
6. Verify Tier 1 data intact post-reactivation (profile + sessions + PRs)
7. Verify Tier 2 IndexedDB lazy-loads from server (acceptable progressive)
8. Verify `_meta/dormancyState` flag cleared post-reactivation (post-Beta automated only)

**Pass:** all 8 items verde. **Fail:** investigate root cause + fix before next milestone.

## §8 Cross-references

- `08-workflows/BACKUP_DR_RUNBOOK.md` §4 fresh device restore parallel (Magic Link mechanism shared)
- `08-workflows/DSR_HANDLER.md` Art. 17 erasure manual override (user explicit request bypasses dormancy timeline)
- `08-workflows/DATA_OWNERSHIP.md` retention policy alignment (this doc is the operational expansion)
- `src/auth.js` Magic Link implementation (`verifyMagicLink`, `_persistAuth`)
- `DECISIONS.md` §D045 Tier 2 90-day rolling rotation V1
- ADR §35-C1 Tier 0/1/2 architecture canonical reference
