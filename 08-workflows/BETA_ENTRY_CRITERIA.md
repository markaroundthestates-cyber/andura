---
title: BETA Entry Criteria V1 — Andura PWA Pre-Launch Gates
status: ACTIVE_SSOT
created: 2026-05-20
updated: 2026-05-22 (§50-C1 audit closure — full checklist)
authority: §A040 Wave A iter 1 audit fix (NC§audit-nuclear-2026-05-19) + §50-C1 closure
cross_refs:
  - 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md (extended pre-Beta gate scope)
  - 08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md (Bugatti gate §0-§11)
  - 08-workflows/DEFINITION_OF_DONE.md (§50-H1 per-feature DoD)
  - 08-workflows/ACCEPTANCE_TESTS.md (§50-C2 F1-F15 per-feature gates)
  - 08-workflows/DATA_OWNERSHIP.md (§50-C3 user owns all data)
  - 08-workflows/DELETE_POLICY.md (§50-C4 hard delete decision)
  - 08-workflows/DSR_HANDLER.md (§28-H3 GDPR Art. 15-22 manual path)
  - 08-workflows/DATA_BREACH_RESPONSE.md (§28-C4 GDPR Art. 33/34)
  - 08-workflows/PROD_OPS_RUNBOOK.md (§34 prod ops)
  - 08-workflows/BACKUP_DR_RUNBOOK.md (§26 backup + DR)
  - DECISIONS.md §D045 (iter 1 V2 design)
  - 📤_outbox/audit-nuclear-2026-05-19/ (raw findings source)
---

# BETA Entry Criteria — Andura PWA V1

Gate decision: **shall Andura PWA enter Free Beta launch?**
Verdict given by Daniel CEO after Bugatti audit nuclear V4 pre-Launch. ZERO override.

## §1 CRIT-level findings closed (audit-nuclear-2026-05-19)

All CRIT-severity findings from 698-raw audit must be either:
- LANDED (code fix verified + tests verde + manual smoke pass), OR
- DEFERRED with explicit ADR linked în DECISIONS.md (rare exceptions)

Required closures per §category:
- **§1 Architecture** — CRIT 0/0 (Phase 7 LANDED)
- **§3 Security** — Magic Link TTL + throttle + freshness gate (A017+A018+A016 LANDED)
- **§4 Auth** — env-var injected + URL hardcoded fallback removed (A019 D040 LANDED)
- **§5 Bundle** — code-split LCP target ≤145KB main bundle Maria 65 3G (A011+A012 PENDING)
- **§6 a11y** — prefers-reduced-motion + skip-link (A023+A024 LANDED)
- **§7 Auth chain** — Onboarding T0 gate + bounds validation (A015 PENDING)
- **§16 PWA** — UpdatePrompt + offline NetworkFirst (A029+A030 PENDING)
- **§26 Backup/DR** — runbook + test-restore script (A034+A035 PENDING)
- **§28 GDPR** — Privacy + T&C live + erasure + portability (A025-A028 PENDING)
- **§31 Onboarding** — T0 hard gate + Step1-6 bounds (A015 PENDING)
- **§34 Prod ops** — runbook + healthcheck + deploy rollback (A031-A033 PENDING)
- **§35 DB Tier** — Tier 0/1/2 + 90-day rotation (A036 PENDING)
- **§38 Engine math** — Brzycki + Kalman precision (A037+A038 PENDING)

Wave A status tracked în `📥_inbox/iter-1-mass-fix-v2/_progress.md`.

## §2 Mockup parity (mockup-vs-prod-parity-2026-05-20)

All MP-pass2 + MP-pass4 CRIT findings closed:
- Coach engine wire (workout + rest) — A001 + A002 LANDED
- ConfirmModal 7 use sites — A003-A010 (A003+A004+A007+A008 LANDED)

## §3 Tests baseline gate

- Vitest local: ≥4500 PASS (full suite, jsdom + RTL)
- Playwright E2E: 4 taburi smoke verde (Antrenor + Workout + Sesiuni + Cont)
- Manual smoke Daniel Gates: 11/11 pass (Magic Link login → Onboarding → Antrenor home → Energy check → Workout flow → Set log → Post RPE → Post summary → Cont settings → Logout → Re-login flow)

## §4 Bugatti audit nuclear V4 pre-Launch

Run `📥_inbox/iter-1-mass-fix-v2/PROMPT_CC_bugatti_final_audit_v4_pre_launch.md` orchestrator:
- ZERO CRIT residual
- HIGH residual ≤5 (each linked ADR DEFERRED reason)
- MEDIUM + LOW counted, NU blocker

Audit run cycle iter 1 + iter 2 + iter 3 convergence; gate fires DOAR la final V4.

## §5 Daniel CEO Gates 100%

Daniel pe device real (Samsung S21 + Marius iPhone 12 + Maria 65 telefon adultă):
- Smoke Path Gigel (user mediu): 5-step happy path
- Edge cases: offline + slow 3G + token expire + onboarding incomplete
- Persona scaling: gigel + marius + maria classes vizual diferiți
- Romanian wording (Co-CTO autonomous compose pre-Beta D024)
- ZERO diacritics în UI rendered text (D-LEGACY-064)

## §6 Production ops readiness

- `PROD_OPS_RUNBOOK.md` incident response (A031 PENDING)
- `healthcheck.cjs` script verde local rulează (A032 PENDING)
- `deploy.yml` rollback procedure tested manual (A033 PENDING)
- `BACKUP_DR_RUNBOOK.md` Firebase RTDB + IndexedDB export + test-restore (A034+A035 PENDING)
- Monitoring active: Sentry events stream verde + dashboard alerts configured + on-call ack Daniel solo

## §7 Bundle size budget (Maria 65 3G LCP target)

- `npm run build` post-LANDED final: main bundle ≤145KB gzip (B011 target)
- Dynamic chunks code-split via `React.lazy` per route (B007 LANDED pattern)
- `npm run analyze` (rollup-plugin-visualizer): NO single chunk >80KB gzip (excluding initial)
- Lighthouse mobile 3G throttle: LCP ≤3.5s + TBT ≤200ms + CLS <0.1
- Bundle delta gate: each PR maximum +5KB main bundle (manual review)

## §8 GDPR runbooks live-tested (not just documented)

- `DSR_HANDLER.md` dry-run: Daniel sends test DSR via `privacy@andura.app` → fulfill end-to-end Access (Art. 15) + Erasure (Art. 17) + Portability (Art. 20). Document T+0 → T+30 timeline real measurements.
- `DATA_BREACH_RESPONSE.md` table-top exercise: simulated breach scenario walked by Daniel + verify 72h ANSPDCP notification path (Art. 33) + user notification template (Art. 34).
- In-app DSR coverage verified: Cont > Descarca date (Art. 20) + Cont > Sterge cont (Art. 17) + Cont > Profil & tinte (Art. 16) functional smoke pass.
- Sub-processor list (Firebase + Sentry + SendGrid/SES + Vercel) live published în Privacy Policy section §28-H6.

## §9 Privacy + T&C currency

- Privacy Policy (`SettingsPrivacy.tsx`) version current 2026-Q2 cu dată update vizibilă
- Terms & Conditions (`SettingsTerms.tsx`) version current 2026-Q2 cu dată update vizibilă
- Medical Disclaimer (`MedicalDisclaimerModal`) consent timestamp persistat (§9-H2 LANDED)
- Sub-processor list current în Privacy (Firebase + Sentry + SendGrid/SES) — §28-H6 LANDED
- Cookies / telemetry opt-in toggle functional (§28 telemetry default OFF)
- ZERO Lorem Ipsum + ZERO placeholder URLs în legal text

## §10 PWA install + offline live smoke

- Android Chrome `beforeinstallprompt` fires → A2HS prompt user accepts → app installs (`InstallPrompt` §7-H5 LANDED)
- Standalone display-mode verified post-install (no browser chrome)
- Offline navigation: airplane mode → app shell + cached routes load (`OfflineBanner` §13-M3 LANDED)
- Service worker `NetworkFirst` strategy verified pentru Firebase calls (A030 PENDING)
- `UpdatePrompt` banner fires on new SW version detected (A029 PENDING)

## §11 Auth live smoke (Magic Link + OAuth)

- Magic Link end-to-end: enter email > SMTP sent > inbox arrival ≤30s > tap link > onboarding redirect (Phase 2 SMTP RESOLVED 2026-05-06)
- Magic Link TTL expire test: wait >1h > tap link > expired error correctly displayed (§A017 LANDED)
- Magic Link throttle: 3 requests în 5min > throttle banner (§A018 LANDED)
- OAuth Google sign-in flow: button > consent screen > redirect > onboarding step or Antrenor home (Phase 3 PENDING)
- WebView detection banner: open în FB/IG in-app browser > banner promp open în standalone (§15-H3 LANDED)
- Logout > re-login: data persistă Tier 1 IDB + Tier 2 RTDB hydrate correct

## §12 GO/NO-GO Daniel sign-off

Format: Daniel posts în CHAT_STATE.md verbatim:
```
BETA ENTRY: GO/NO-GO
- §1 CRIT closed: ✓/✗
- §2 Parity ≥95%: ✓/✗
- §3 Tests 4842+ PASS / 0 FAIL: ✓/✗
- §4 Bugatti V4 zero residual: ✓/✗
- §5 Gates 11/11 Gigel path: ✓/✗
- §6 Ops + monitoring live: ✓/✗
- §7 Bundle ≤145KB MET: ✓/✗
- §8 GDPR runbooks live-tested: ✓/✗
- §9 Privacy + T&C current: ✓/✗
- §10 PWA install + offline smoke: ✓/✗
- §11 OAuth + Magic Link live smoke: ✓/✗
Verdict: GO | NO-GO + blockers list
```

GO trigger: Daniel manual `git push origin main` post backup tag pushed (D031 invariant).

---

🦫 **BETA Entry Criteria SSOT** — gate de decizie singular pre-launch. Wave A LANDED partial 2026-05-20 (~30% — A001+A002+A003+A004+A007+A008+A016+A017+A018+A023+A024 LANDED). Chat 2 night + chat 3 cumulative push closure batch. Bugatti audit V4 pre-Beta singular evaluation moment. §50-C1 closure 2026-05-22 extended §7-§11 explicit gates (bundle + GDPR live + Privacy/T&C current + PWA install + Auth live).
