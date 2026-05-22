---
title: Acceptance Tests — V1 Features F1-F15 + Auxiliary
status: ACTIVE_SSOT
created: 2026-05-22
authority: §50-C2 audit-nuclear-2026-05-19 closure
cross_refs:
  - ANDURA_PRIMER.md §2 (15 audit-driven V1 features definition)
  - 08-workflows/BETA_ENTRY_CRITERIA.md §3 (test baseline gate)
  - 08-workflows/DEFINITION_OF_DONE.md (per-feature DoD)
  - 📤_outbox/audit-nuclear-2026-05-19/findings-§10.md (F1-F11 architectural verify)
---

# Acceptance Tests — V1 Feature Gates

> Per-feature acceptance criteria checklist. Each F# row = MET / OPEN /
> DEFERRED before Beta entry. Architectural presence ≠ functional pass —
> Daniel manual smoke OR automated E2E required for MET.

**Persona filter mandatory pre-MET:** Gigel (non-tech RO comprehension <5s)
+ Marius (numerical precision visible) + Maria 65 (large tap + plain
language). See `ANDURA_PRIMER.md` §2.

---

## §1 V1 features matrix (15 audit-driven + 4 auxiliary)

### KEEP verbatim (9 features)

| ID | Feature | Acceptance criteria | Status |
|----|---------|---------------------|--------|
| F2 | Last Session Memory | CoachTodayCard render last_session metadata (date + load delta + RPE) on Antrenor home post-onboard. Smoke: complete 1 workout > next session home shows summary. | OPEN — verify post-iter 1 wave A close |
| F4 | Readiness Verdict | 5-state emoji + verbal verdict (READY/MARGINAL/CAUTION/STOP + override) before workout start. Engine #4 Readiness output rendered EnergyCheck flow. | OPEN — verify functional smoke |
| F6 | PR Wall | PR list per-exercise (weight/reps/volume) accessible via Istoric > PRs. Filter persona Marius (precision) + Maria (large rows). | OPEN — verify navigation + data hydrate |
| F7 | Coach Director | Pipeline orchestrator §42.10 output rendered (8 engines + MMI #9). Output: nutrition target + workout prescription + alerts. Engine wire LANDED A001+A002. | OPEN — full pipeline smoke pending iter 1 |
| F8 | Streak Counter | Streak number visible Antrenor home + reset semantics correct (RestCard preserve streak per §B011). Test: skip 2 sessions > streak resets. | OPEN — verify streak reset rules |
| F10 | Stats Grid 3-cell | 3-cell grid (volume + RPE avg + sessions count) on Antrenor home. Last 7d window default. | OPEN — verify cell calculations |
| F11 | PRs Notification per-PR | Inline notification toast/banner when PR detected post-set. Anti-spam: 1 toast per PR type per session. | OPEN — verify trigger logic |
| F12 | Rating Buttons 3-button | USOARA/NORMALA/GREA buttons post-set RPE flow. Romanian-no-diacritics. Maria 65 large tap. | OPEN — verify tap target + persistence |
| F15 | Per-set RPE | Capture RPE per-set during workout (NU just session-level). Persistence Tier 0 > Tier 1 > Tier 2. | OPEN — verify capture + persistence |

### MODIFY simplified (4 features)

| ID | Feature | Acceptance criteria | Status |
|----|---------|---------------------|--------|
| F1 | Patterns Banner (2 keep) | LOW_ADHERENCE + STAGNATION banners only (3 V2-paranoid dropped). Gate >=3 sessions LOW_ADHERENCE Gigel-friendly (commit `009354b6`). | OPEN — verify trigger thresholds |
| F3 | Fatigue Score single number | Single number (NU complex breakdown) Antrenor home. Engine #3 Energy Adjustment output simplified. | OPEN — verify rendering |
| F9 | BMR Strip single line | BMR display single line Progres tab (NU multi-row table). | OPEN — verify Progres render |
| F14 | Ratings Window 20->90 | Rating window extended 20->90 sessions for trend analysis. Verify engine input window respected. | OPEN — verify engine config |

### DROP V1 (2 features)

| ID | Feature | Status |
|----|---------|--------|
| F5 | AA-Friction Modal | DROPPED V1 (Gigel-suspect paranoid). V2-deferred. AaFrictionModal exists but render-gate disabled. |
| F13 | Rating Notes Anti-RE | DROPPED V1 (free-text abuse universal). Anti-RE rule removed. |

---

## §2 Mode Detection (5 pure event listener modes)

| Mode | Acceptance criteria | Status |
|------|---------------------|--------|
| LIFTING | Set log event triggers mode > workout context active | OPEN |
| RESTING | Inter-set timer elapsed > rest mode UI engaged | OPEN |
| WARMUP | Pre-first-set state > warmup prescription visible | OPEN |
| EXIT_REQUESTED | Back button mid-workout > ExitConfirmSheet rendered | LANDED — `8df606cf` overlay tokens |
| POST_SESSION | Workout complete > PostRpe > PostSummary flow | OPEN |

Engine #5 Mode Detection pure-function pattern (NU side effects in core).

---

## §3 Auxiliary features (4)

| ID | Feature | Acceptance criteria | Status |
|----|---------|---------------------|--------|
| Aux-1 | Auth Magic Link | SMTP Phase 2 RESOLVED 2026-05-06 + TTL + throttle + freshness gate (A016+A017+A018 LANDED). Live smoke `andura.app` inbox arrival <=30s. | OPEN — live smoke pending |
| Aux-2 | Onboarding T0 Big 6 | Hard typing 6 fields (varsta + greutate + inaltime + experienta + obiectiv + frecventa) NO skip. T0 gate hard (§A015 PENDING). | OPEN — A015 PENDING |
| Aux-3 | Tier Storage 0/1/2 | Tier 0 localStorage 24h + Tier 1 IDB 90d + Tier 2 RTDB 90d rolling (D045 LOCKED V1). Test transitions via `src/util/tierStorage.js`. | PARTIAL — Tier 0+1 LANDED, Tier 2 archival §A036 PENDING |
| Aux-4 | Engine pipeline 8+MMI #9 | 8 engines + MMI #9 LOCK 10 LANDED 2026-05-15. Wire complete §42.10 prescriptive order. | LANDED — 9/9 |

---

## §4 Cross-cutting acceptance gates (apply to ALL features)

Each feature row MUST satisfy:

- [ ] Gigel filter pass (non-tech RO comprehension <5s + B1 language)
- [ ] Maria 65 pass (tap >=44x44 + plain language)
- [ ] Marius pass (numerical precision visible + NU dumbed-down)
- [ ] Romanian no-diacritics in UI (D-LEGACY-064)
- [ ] Mockup parity vs `04-architecture/mockups/andura-clasic.html`
- [ ] Test coverage >=1 unit + >=1 integration if cross-module
- [ ] DoD `08-workflows/DEFINITION_OF_DONE.md` checklist verde

---

## §5 MET threshold for Beta GO

Feature row counts MET when:
- Daniel manual smoke pass on real device (Samsung S21 / iPhone 12 / Maria 65 phone), AND
- Automated test verde (unit OR integration OR Playwright E2E), AND
- Persona filters all 3 pass, AND
- DoD checklist complete

**Beta GO threshold:** 15/15 V1 features MET + 4/4 Auxiliary MET. ZERO OPEN
on KEEP verbatim list. MODIFY simplified all MET. DROP V1 explicit ADR
linked (F5 + F13 -> ANDURA_PRIMER.md §2).

---

**Acceptance Tests SSOT** — per-feature gate matrix pre-Beta. §50-C2
closure 2026-05-22. Status column updated post-LANDED per feature; Beta
GO = ALL rows MET via Daniel CEO smoke + automated coverage.
