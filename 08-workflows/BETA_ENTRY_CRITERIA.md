---
title: BETA Entry Criteria V1 — Andura PWA Pre-Launch Gates
status: ACTIVE_SSOT
created: 2026-05-20
authority: §A040 Wave A iter 1 audit fix (NC§audit-nuclear-2026-05-19)
cross_refs:
  - 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md (extended pre-Beta gate scope)
  - 08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md (Bugatti gate §0-§11)
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

## §7 GO/NO-GO Daniel sign-off

Format: Daniel posts în CHAT_STATE.md verbatim:
```
BETA ENTRY: GO/NO-GO
- §1 CRIT closed: ✓/✗
- §2 Parity: ✓/✗
- §3 Tests: ✓/✗
- §4 Bugatti V4: ✓/✗
- §5 Gates: ✓/✗
- §6 Ops: ✓/✗
Verdict: GO | NO-GO + blockers list
```

GO trigger: Daniel manual `git push origin main` post backup tag pushed (D031 invariant).

---

🦫 **BETA Entry Criteria SSOT** — gate de decizie singular pre-launch. Wave A LANDED partial 2026-05-20 (~30% — A001+A002+A003+A004+A007+A008+A016+A017+A018+A023+A024 LANDED). Bugatti audit V4 pre-Beta singular evaluation moment.
