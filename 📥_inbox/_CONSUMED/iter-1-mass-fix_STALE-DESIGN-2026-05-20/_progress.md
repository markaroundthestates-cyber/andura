---
title: Iter 1 Mass Fix Progress Checkpoint
status: DESIGN_LANDED_PENDING_EXECUTION
last_updated: 2026-05-20
design_session_commit: pending (design LANDED + DECISIONS.md D044 append + commit next)
---

# _progress.md — Iter 1 Mass Fix Convergence Loop

## §0 Current state

**Phase:** Design LANDED. Pending Daniel CEO approve → trigger BATCH_C1 execution session.

**Artefacts LANDED 2026-05-20 birou design session:**
- ✅ `ORCHESTRATOR.md` master spec (~9k chars)
- ✅ `_MASTER_BACKLOG.md` 340 atomic tasks SoT (~12k chars)
- ✅ `_DAG.md` dependency graph + critical path (~6k chars)
- ✅ `_BATCH_INDEX.md` 28 BATCHes summary (~3k chars)
- ✅ `BATCH_C1_auth_chain.md` Wave 1 first BATCH detailed (~7k chars)
- ✅ `BATCH_A1_text_swaps_wave_a.md` parallel-safe surgical BATCH sample (~3k chars)
- ✅ 5 sample task files (C001 + A001 + B001 + C019 + D001) + task_template_README.md

**Convention reminder:**
- `NC§NN-XN` = Audit Nuclear `📤_outbox/audit-nuclear-2026-05-19/findings-§NN.md` finding XN
- `MP-<screenId>-<NN>` = Mockup Parity `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-<screenId>.md` finding F-<screenId>-<NN>

---

## §1 Wave 1 critical path (4 BATCHes ~12-15h sequential)

| BATCH | Status | Tasks | LANDED commit | Findings closed |
|-------|--------|-------|---------------|------------------|
| BATCH_C1 Auth Chain | PENDING | C001-C008 (8) | — | NC§7-C1 + §7-C2 + §7-C3 + §4-C1 + §4-C5 + §17-C1 + §13-C1 + §31-C1 + §31-C2 + §31-C3 + §31-H4 (11 distinct CRIT) |
| BATCH_D1 index.html + CSP + Sentry + deploy.yml | PENDING | C056-C058 + A121-A124 + D014 (8) | — | NC§1-C1 + §1-C2 + §4-C1 + §4-C2 + §4-C3 + §4-C4 + §4-C17 + §4-C23 + §4-C27 + §4-C28 + §4-C29 + §10-C1 + §15-C1 + §16-H1 + §33-C1+C2+C3 (14+ CRIT) |
| BATCH_C2 Coach engine wire | PENDING | C009-C010 (2) | — | MP-P4 + MP-pass2-coachtoday-01..03 + MP-pass2-coachrest-01..02 (5 CRIT) |
| BATCH_C3 ConfirmModal + 7 uses | PENDING | C011-C018 (8) | — | MP-P5 + MP-missing-confirms-all-7 (7 CRIT) |

**Wave 1 totals:** 4 BATCHes, 26 tasks, ~37+ distinct CRIT closed.

---

## §2 Wave 2 Cluster A (8 BATCHes ~25-30h parallel-safe)

| BATCH | Status | Tasks | LANDED | Findings closed (est) |
|-------|--------|-------|--------|-----------------------|
| BATCH_A1 Text swaps Wave A | PENDING | A001-A025 | — | ~70 individual text findings (per-screen aggregation) |
| BATCH_A2 Text swaps Wave B | PENDING | A026-A050 | — | ~70 individual text findings |
| BATCH_A3 Text swaps Wave C | PENDING | A051-A070 | — | ~50 individual text findings |
| BATCH_A4 Pass 4 polish per-file 1 | PENDING | A071-A095 | — | ~25 polish findings (font-weight + padding) |
| BATCH_A5 Pass 4 polish per-file 2 | PENDING | A096-A120 | — | ~25 polish findings (border-radius + margin/gap) |
| BATCH_A6 Surgical security/hygiene | PENDING | A121-A135 | — | NC§1-C2 + §4-H2 + §4-H3 + §4-H4 + §4-H5 + §4-C2 (15 misc) |
| BATCH_A7 Emoji + a11y | PENDING | A136-A145 | — | MP-P3 + NC§6.* + NC§28.* (10 findings) |
| BATCH_A8 JSDoc + misc | PENDING | A146-A180 | — | NC§1-M6 + NC§42.* + misc (35 findings) |

---

## §3 Wave 2 Cluster B (5 BATCHes ~10-13h sequential)

| BATCH | Status | Tasks | LANDED | Findings closed |
|-------|--------|-------|--------|------------------|
| BATCH_B1 Vanilla legacy archive | PENDING | B001-B004 | — | ~30 findings cluster (NC§1-H2 + §1-M3 + §1-M4 + §4-M1 + §22.* vanilla) + dual SW (§1-H6 + §4-H7) |
| BATCH_B2 Dead code post-vanilla | PENDING | B005-B015 | — | ~10 dead-code findings |
| BATCH_B3 TODO/FIXME | PENDING | B016-B025 | — | ~10 TODO markers |
| BATCH_B4 Standards alignment | PENDING | B026-B040 | — | ~15 dead-code surgical |
| BATCH_B5 Engineering standards | PENDING | B041-B050 | — | ~10 standards |

---

## §4 Wave 2 Cluster C BATCHes 4-8 (5 BATCHes ~23-29h semi-parallel)

| BATCH | Status | Tasks | LANDED | Findings closed |
|-------|--------|-------|--------|------------------|
| BATCH_C4 SubHeader + 15 uses | PENDING | C019-C033 | — | MP-P1 (15 findings via 1 component + 15 uses) |
| BATCH_C5 WorkoutPreview rich content | PENDING | C034-C036 | — | MP-workout-preview-01..03 (3 CRIT) |
| BATCH_C6 Istoric heatmaps + Antrenor Obiectiv + Deload + Progres Alerte | PENDING | C037-C041 | — | MP-istoric-01 + -03 + MP-antrenor-03 + -04 + MP-progres-07 (5 CRIT) |
| BATCH_C7 Sub-screen sections + SessionTimer + RestOverlay | PENDING | C042-C049 | — | MP-pass2-settings-profile-03 + -04 + MP-pass2-sessiontimer-01 + MP-pass2-restoverlay-01 + MP-pass2-settings-danger-01 + -03 + MP-pass2-settings-profile-01 (8 findings) |
| BATCH_C8 MISSING screens new + misc TBC | PENDING | C050-C080 | — | MP-missing-weight-timeline + -loguri-greutate + -settings-support + -about + -faq + -themes + 25 misc TBC (~25 findings) |

---

## §5 Wave 2 Cluster D BATCHes 2-7 (6 BATCHes ~29-37h sequential)

| BATCH | Status | Tasks | Pre-req | LANDED | Findings closed |
|-------|--------|-------|---------|--------|------------------|
| BATCH_D2 Tailwind ↔ CSS vars | PENDING | D002 | BATCH_B1 | — | NC§1-C3 + NC§1-L2 |
| BATCH_D3 Bundle code-split + ESLint | PENDING | D001 + D003 | BATCH_D2 | — | NC§5-C1 + §5-C3 + §5-C2 + §1-C4 |
| BATCH_D4 Zod boundaries + Branded types + FSM | PENDING | D006-D010 | BATCH_D3 | — | NC§3-C2 + §14-* + §44-* |
| BATCH_D5 Persona + Inter font + a11y triple | PENDING | D004-D005 + D011-D013 | BATCH_D4 | — | NC§1-H3 + §1-H4 + §6-C1 + §6-C2 + §6-C3 |
| BATCH_D6 GDPR + Backup/DR + Tier 0/1/2 | PENDING | D019-D024 | BATCH_D5 | — | NC§28-C1 + -C2 + -C3 + §26-C1 + -C2 + §35-* |
| BATCH_D7 Engine math + PWA + final | PENDING | D015-D018 + D025-D030 | BATCH_D6 | — | NC§4-C6 + §17.1 + §11-C1 + §39-C1 + §45-C1 + -C2 + §38-* + §16-* + §44-* + §50-C1 |

---

## §6 Wave 3 Cluster E paradigm Daniel sessions

| ID | Status | Topic |
|----|--------|-------|
| E001 | PENDING Daniel | SettingsPrefs PARADIGM SWAP destructive vs preferences |
| E002 | PENDING Daniel | CevaNuMerge 1 vs 5 options |
| E003 | PENDING Daniel | PainButton 3 types vs 15 regions |
| E004 | PENDING Daniel | EquipmentSwap per-ex vs global |
| E005 | PENDING Daniel | AparateLipsa 10 flat vs 3 grouped |
| E006 | PENDING Daniel | SettingsNotifications domain vs attribute |
| E007 | PENDING Daniel | Phase 6 prod-extras keep+amend mockup v1.1 OR remove |
| E008 | PENDING Daniel | BodyData drift keep+amend OR remove |
| E009 | PENDING Daniel | AaFrictionModal → PerSetSafetyModal wording final |
| E010 | PENDING Daniel | 4 Ajutor rows target confirm (C052-C054 dep) |
| E011-E015 | PENDING Daniel | Wording backlog 22 items D024 review (4-5 sessions) |
| E016 | PENDING Daniel | Medical Disclaimer wording + timestamp UX final |
| E017 | PENDING Daniel | Engine math thresholds Daniel SoT verify |
| E018 | PENDING Daniel | Trust & Safety positioning copy |
| E019 | PENDING Daniel | Onboarding anti-bias copy |
| E020 | PENDING Daniel | Persona coverage verify Gigel/Marius/Maria 65/Daniel |

---

## §7 Iter 1 EXIT audit (1 audit ~12-15h)

| Phase | Status | ETA |
|-------|--------|-----|
| Audit Nuclear V4 D029 mirror | PENDING (post all 28 BATCHes + Cluster E) | ~5-7h |
| Mockup vs Prod V2 audit | PENDING | ~3-4h |
| Track 7 systems scan | PENDING | ~2-3h |
| Aggregate convergence report | PENDING | ~2h |

**Daniel CEO decision post-audit:** CONTINUE iter 2 OR EXIT iter loop → Daniel single comprehensive smoke a-z → Beta launch.

---

## §8 Aggregate metrics expected post iter 1

```
Findings closed projection (assuming all BATCHes LAND clean):
  - Wave 1 critical-path: ~37 CRIT closed (auth + index.html + Sentry + Coach + ConfirmModal)
  - Wave 2 Cluster A: ~290 findings closed (text + token + emoji + security + JSDoc + misc)
  - Wave 2 Cluster B: ~70 findings closed (vanilla + dead code + standards)
  - Wave 2 Cluster C BATCHes 4-8: ~55 findings closed (sub-screens + missing + components)
  - Wave 2 Cluster D BATCHes 2-7: ~45 findings closed (refactor multi-file)
  - Wave 3 Cluster E: ~25 findings closed (post-Daniel-decision implement)
  - Total: ~520 findings closed of 890 actionable raw = ~58% closure single iter

Iter 2 estimate: ~50% of iter 1 scope (Pareto residual) = ~50-70h CC + ~10-20 Cluster E items
Iter 3 (if needed): ~25h CC residual polish

Total Beta gate path D042+D043 absolute:
  - Iter 1: ~14-22 calendar days
  - Iter 2: ~7-10 calendar days
  - Iter 3 (residual): ~3-5 calendar days
  - Daniel smoke a-z: ~1-2 days
  TOTAL Beta gate: ~25-39 calendar days post design approve
```

---

🦫 **_progress.md — Iter 1 Mass Fix LANDED design 2026-05-20. Pending Daniel CEO approve → BATCH_C1 trigger Wave 1.**
