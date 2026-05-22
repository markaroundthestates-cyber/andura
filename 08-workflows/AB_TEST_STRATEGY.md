---
title: A/B Test Strategy — Andura PWA V1
status: ACTIVE_SSOT
created: 2026-05-22
authority: §24-H2 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/FEATURE_FLAGS.md (§24-H1 flag tiers — runtime flag dependency)
  - 08-workflows/ENVIRONMENT_STRATEGY.md (§24-H3 single Firebase project)
  - 08-workflows/BETA_ENTRY_CRITERIA.md §5 (Daniel CEO Gates 100% pre-Beta)
  - 08-workflows/FORWARD_COMPAT_PRINCIPLES.md §1 (decisions document WHY)
---

# A/B Test Strategy — Andura PWA V1

> **Verdict singular V1 Beta:** ZERO A/B test infrastructure. Andura V1 = solo
> founder Daniel + Gigel Test deciziile UX. Statistical significance ZERO
> aplicabilă single-user deployment. Defer post-Beta când cohort emerges.

---

## §1 Pre-Beta — ZERO A/B infrastructure

**Context:** Andura V1 Free Beta = single-user (Daniel propriu testing) +
opt-in early adopters mici (post-launch). ZERO populatie statistic relevanță
pentru A/B comparisons.

**Decizia UX V1:** "Gigel Test" (CLAUDE.md persona filter) + Daniel CEO
intuition + Co-CTO autonomous compose (D024 LOCKED V1). NU randomized
controlled trials.

**Filter Gigel:** *"Cum reacționează Gigel (user mediu non-tech RO)? Dubios
pentru user?"* — calitativ, NU cantitativ. Single decision tree, NU
multi-arm split.

**Anti-overreach pre-Beta:** ZERO build:
- Cohort assignment logic
- Variant tracking persistence
- Statistical analysis pipeline
- Telemetry events pentru A/B metrics
- Admin dashboard pentru variant comparison

**Rationale:** YAGNI (Karpathy §2 Simplicity First). Infrastructure A/B
overhead > beneficiul potențial cu N=1 user. Daniel decide UX direct via
Gigel Test + Bugatti audit nuclear pre-Beta.

---

## §2 Post-Beta — lightweight A/B option (când triggers)

**Trigger condiție:** ≥100 useri activi săptămânal + ≥1 decizie UX cu trade-off
neclar din intuiție singură (Daniel CEO judgment insufficient).

### §2.1 Path A — Firebase Remote Config (recommended dacă scale)

- **Mecanism:** server-side variant assignment per-uid hashed (deterministic)
- **Avantaje:** live-toggle fără rebuild + persist across devices same user
  + analytics integration Firebase native
- **Cost:** Firebase RC quota free tier ≤10K active users/day = suficient
  pentru V1.5-V2 Beta growth
- **Implementare estimat:** ~3-5 zile dev + integration test + dashboard setup

### §2.2 Path B — localStorage cohort assignment (lightweight)

- **Mecanism:** la app init, dacă `cohort` lipsă în localStorage → assign
  random 50/50 (sau hash uid) → persist `localStorage.cohort = 'A'|'B'`
- **Avantaje:** ZERO server roundtrip + ZERO cost
- **Dezavantaje:** ZERO cross-device persistence (user re-installs PWA → reset)
  + ZERO analytics aggregate (necesită Sentry custom event sau manual log)
- **Implementare estimat:** ~1-2 zile dev singular

**Decizie deferred:** path A vs B per scale + cost preference la momentul
trigger. DECISIONS.md entry când fires (NU pre-Beta).

---

## §3 Statistical significance handling

**Pre-Beta:** N/A — ZERO A/B test running.

**Post-Beta când A/B fires:**

| Aspect | Approach |
|---|---|
| Sample size minim | ≥100 users per variant pentru confidence baseline |
| Duration minim | ≥14 zile (capture weekly cycle) |
| Significance threshold | p<0.05 (two-tailed) pentru declare winner |
| Multi-comparison | Bonferroni correction dacă ≥3 variants concurrente |
| Outliers | Trim top/bottom 1% session duration (anti-skew) |
| Power calculation | TBD per metric (conversion rate vs engagement) |

**Tooling:** chi-square test simple pentru binary outcomes (clicked/not).
T-test pentru continuous (session duration). Implementation NU ramâne Andura
custom — folosește Firebase RC native analytics + export raw events Sentry
sau BigQuery cohort analysis (post-Beta TBD per cost).

**Anti-pattern post-Beta:**
- Peek at results early (stop test cand "looks good") = false positive risk
- Run A/B fără hypothesis explicit prealabil (data fishing)
- Variant change mid-test (invalidate)
- Combine multiple A/B tests on same flow (interaction effects)

---

## §4 Lifecycle A/B test (post-Beta)

1. **Hypothesis explicit** — "Variant B (X change) → +Y% Z metric"
2. **DECISIONS.md entry** — LOCKED V1 cu hypothesis + success criteria +
   pre-registered metrics + stop conditions
3. **Implementation gate** (per FEATURE_FLAGS.md §3 Tier 3 runtime flag
   infrastructure post-Beta)
4. **Launch + monitor** — daily check minimum, NU intervene
5. **Stop trigger:** sample size met OR pre-registered deadline (max 30 zile)
6. **Analysis + decision** — winner LOCKED V1 supersede în DECISIONS.md
7. **Cleanup** — remove flag per FEATURE_FLAGS.md §4.3 (30d guard pe winner)

---

## §5 Anti-patterns explicit

- **A/B test pe pre-Beta cu N=1** — meaningless; intuition Gigel Test better
- **A/B "for the sake of it"** — fără hypothesis explicit = data noise
- **Long-running A/B (>30 zile)** — drift environmental confounds
- **A/B pe Daniel singular Gates** — Daniel CEO decide UX direct, NU split
- **A/B fără cleanup post-decision** — flag-uri zombie acumulează (anti-pattern
  FEATURE_FLAGS §4.3 explicit)

---

## §6 Constrains + invarianti

- **ZERO A/B test pre-Beta** — NO infrastructure overhead
- **ZERO A/B test fără DECISIONS.md hypothesis pre-registered** anti-data-fishing
- **ZERO peek early stops** — pre-registered stop condition only
- **ZERO multi-concurrent A/B** pe același flow pre-Beta + V1 (interaction effects)
- **ZERO PII în variant tracking** — uid hashed sau anonymized cohort label

---

🦫 **A/B Test Strategy SSOT** — verdict singular V1 Beta: ZERO infrastructure
pre-Beta. Post-Beta path A (Firebase RC) vs path B (localStorage) deferred
per scale trigger. §24-H2 closure 2026-05-22. Gigel Test + Daniel CEO Gates =
singular UX decision mechanism pre-Beta.
